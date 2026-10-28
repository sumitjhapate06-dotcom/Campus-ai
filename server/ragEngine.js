import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * In-Memory RAG Engine & Syllabus Vector Store
 */
export class SyllabusRAGEngine {
  constructor(parsedSyllabus) {
    this.syllabus = parsedSyllabus;
    this.chunks = [];
    this.buildIndex();
  }

  buildIndex() {
    this.chunks = [];
    const { meta, modules } = this.syllabus;

    // Index metadata
    this.chunks.push({
      id: 'meta-chunk',
      type: 'meta',
      unitNumber: 'Overview',
      title: `${meta.courseTitle} (${meta.courseCode})`,
      content: `Course: ${meta.courseTitle}, Code: ${meta.courseCode}, Department: ${meta.department}, Semester: ${meta.semester}, Credits: ${meta.credits}, Total Modules: ${meta.totalModules}, Total Hours: ${meta.totalHours}`,
      tokens: tokenize(`Course: ${meta.courseTitle} ${meta.courseCode} ${meta.department} ${meta.semester}`)
    });

    // Index modules and topics
    modules.forEach((mod) => {
      const topicStr = mod.topics.join(', ');
      const fullContent = `Module/Unit ${mod.unitNumber}: ${mod.title}\nHours: ${mod.hours}\nTopics covered: ${topicStr}\nDetails: ${mod.rawContent || ''}`;
      
      this.chunks.push({
        id: mod.id,
        type: 'module',
        unitNumber: mod.unitNumber,
        title: mod.title,
        hours: mod.hours,
        weightage: mod.weightage,
        content: fullContent,
        topics: mod.topics,
        tokens: tokenize(fullContent)
      });

      // Sub-chunks for granular topic matching
      mod.topics.forEach((topic, idx) => {
        const topicContent = `Module ${mod.unitNumber} (${mod.title}) -> Topic: ${topic}`;
        this.chunks.push({
          id: `${mod.id}-topic-${idx}`,
          type: 'topic',
          unitNumber: mod.unitNumber,
          title: mod.title,
          content: topicContent,
          topics: [topic],
          tokens: tokenize(topicContent)
        });
      });
    });
  }

  /**
   * Search vector index for relevant syllabus context
   */
  retrieveContext(query, topK = 4) {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const scored = this.chunks.map(chunk => {
      const score = computeSimilarity(queryTokens, chunk.tokens);
      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Filter chunks with positive match score
    const top = scored.slice(0, topK).filter(item => item.score > 0.05);

    if (top.length === 0) {
      // Return top module if general query
      return scored.slice(0, 2).map(s => s.chunk);
    }

    return top.map(s => s.chunk);
  }

  /**
   * Primary Answer Generation Function
   */
  async answerQuestion(query, apiKey = null) {
    const relevantChunks = this.retrieveContext(query, 5);

    // Build context string
    const contextText = relevantChunks.length > 0
      ? relevantChunks.map(c => `[Unit ${c.unitNumber}: ${c.title}]\n${c.content}`).join('\n\n')
      : 'No direct module match found in the uploaded syllabus.';

    // Grounding check: Check if query matches syllabus domain
    const maxScore = relevantChunks.length > 0 ? computeSimilarity(tokenize(query), relevantChunks[0].tokens) : 0;
    const isOutofScope = maxScore < 0.02 && !query.toLowerCase().includes('syllabus') && !query.toLowerCase().includes('course');

    // Citations list
    const citations = relevantChunks.map(c => ({
      unit: c.unitNumber,
      moduleTitle: c.title,
      type: c.type
    })).filter((v, i, self) => i === self.findIndex(t => t.moduleTitle === v.moduleTitle));

    // Try Gemini API if key is provided or process.env.GEMINI_API_KEY is present
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (keyToUse) {
      try {
        const genAI = new GoogleGenerativeAI(keyToUse);
        const systemInstruction = `You are Campus AI, an expert academic tutor for students.
YOUR STRICT RULE: Answer the student's question ONLY using the provided college syllabus context below.
- Do NOT hallucinate information outside the syllabus context.
- If the question cannot be answered using the provided syllabus context, respond clearly: "Based strictly on your uploaded syllabus, this topic/information is not covered in your syllabus."
- Keep your answers structured, concise, student-friendly, and format with clear bullet points where helpful.
- Reference the Unit/Module numbers when explaining topics.`;

        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction
        });

        const prompt = `Syllabus Context:\n${contextText}\n\nStudent Question: ${query}`;
        const response = await model.generateContent(prompt);
        const replyText = response.response ? response.response.text() : 'No response generated.';

        return {
          answer: replyText,
          citations,
          grounded: true,
          mode: 'gemini-ai'
        };
      } catch (err) {
        console.warn('Gemini API call failed or key invalid, falling back to built-in RAG synthesis:', err.message);
      }
    }

    // Built-in Syllabus RAG Synthesis Engine (Fallback when no API key)
    if (isOutofScope) {
      return {
        answer: `⚠️ **Not in Syllabus**: Based strictly on your uploaded syllabus for **${this.syllabus.meta.courseTitle}**, this question does not appear to be covered in your units or topics. Please ask questions related to your syllabus modules!`,
        citations: [],
        grounded: true,
        mode: 'local-rag'
      };
    }

    const localAnswer = generateLocalRAGAnswer(query, relevantChunks, this.syllabus);

    return {
      answer: localAnswer,
      citations,
      grounded: true,
      mode: 'local-rag'
    };
  }
}

// Utility Tokenizer & Cosine/Jaccard Similarity
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function computeSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  
  const setB = new Set(tokensB);
  let matchCount = 0;

  tokensA.forEach(token => {
    if (setB.has(token)) matchCount++;
  });

  // Jaccard + token overlap score
  const unionSize = new Set([...tokensA, ...tokensB]).size;
  return matchCount / Math.max(1, unionSize);
}

function generateLocalRAGAnswer(query, chunks, syllabus) {
  const qLower = query.toLowerCase();

  if (qLower.includes('how many modules') || qLower.includes('total units') || qLower.includes('overview')) {
    return `### 📚 Syllabus Overview for **${syllabus.meta.courseTitle}** (${syllabus.meta.courseCode})
- **Total Modules/Units**: ${syllabus.meta.totalModules}
- **Total Topics**: ${syllabus.meta.totalTopics}
- **Estimated Study Hours**: ${syllabus.meta.totalHours} Hours
- **Department**: ${syllabus.meta.department}
- **Semester**: ${syllabus.meta.semester}

Here are the modules included:
${syllabus.modules.map(m => `- **Unit ${m.unitNumber}**: ${m.title} (${m.hours} hrs, Weightage: ${m.weightage})`).join('\n')}`;
  }

  if (chunks.length === 0) {
    return `Based strictly on your syllabus for **${syllabus.meta.courseTitle}**, no specific unit details match your query. You can ask about any of the ${syllabus.meta.totalModules} modules listed in your syllabus dashboard.`;
  }

  // Synthesize answer from top chunks
  const primaryChunk = chunks[0];
  const matchingTopics = primaryChunk.topics ? primaryChunk.topics.slice(0, 6) : [];

  let response = `### 🎯 Grounded Answer (Syllabus Reference: Unit ${primaryChunk.unitNumber} - ${primaryChunk.title})\n\n`;

  if (qLower.includes('weightage') || qLower.includes('hours') || qLower.includes('important')) {
    response += `**Unit ${primaryChunk.unitNumber}: ${primaryChunk.title}** carries an estimated **weightage of ${primaryChunk.weightage || '20%'}** with **${primaryChunk.hours || 8} study hours** allocated in the curriculum.\n\n`;
  }

  response += `According to your syllabus curriculum for **${syllabus.meta.courseTitle}**, **Unit ${primaryChunk.unitNumber}** covers the following core topics:\n\n`;

  if (matchingTopics.length > 0) {
    matchingTopics.forEach((t, i) => {
      response += `${i + 1}. **${t}**: Essential topic requiring conceptual understanding and practical application.\n`;
    });
  } else {
    response += `> ${primaryChunk.content.substring(0, 300)}...\n\n`;
  }

  if (chunks.length > 1 && chunks[1].unitNumber !== primaryChunk.unitNumber) {
    response += `\n📌 **Related Syllabus Reference**: Related concepts are also discussed in **Unit ${chunks[1].unitNumber}: ${chunks[1].title}**.`;
  }

  return response;
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'about', 'what', 'how', 'where', 'when', 'who', 'why', 'can', 'you', 'tell', 'me', 'please', 'give', 'list', 'show', 'explain', 'detail', 'details', 'syllabus', 'course', 'subject'
]);
