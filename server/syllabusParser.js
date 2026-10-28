/**
 * Syllabus Parser Engine
 * Parses raw text extracted from a college syllabus PDF into structured JSON.
 */

export function parseSyllabus(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid or empty text content for syllabus parsing');
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Course Metadata Extraction
  const meta = extractMetadata(rawText, lines);

  // 2. Module / Unit Breakdown
  const modules = extractModules(lines, rawText);

  // 3. Compute overall stats & difficulty ratings
  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);
  const totalHours = modules.reduce((sum, m) => sum + (m.hours || 8), 0);

  return {
    meta: {
      courseTitle: meta.courseTitle || 'College Course Syllabus',
      courseCode: meta.courseCode || 'COURSE-101',
      department: meta.department || 'Computer Science & Engineering',
      semester: meta.semester || 'Semester V',
      credits: meta.credits || '4 Credits',
      totalModules: modules.length,
      totalTopics,
      totalHours
    },
    modules,
    rawText
  };
}

function extractMetadata(fullText, lines) {
  let courseTitle = '';
  let courseCode = '';
  let department = '';
  let semester = '';
  let credits = '';

  // Look for Course Title/Subject
  const titleMatch = fullText.match(/(?:Subject|Course\s+Title|Course\s+Name|Name\s+of\s+the\s+Course)\s*[:|-]\s*([^\n\r]+)/i) ||
                     fullText.match(/([A-Z0-9\s]{4,40}\s+(?:ENGINEERING|SCIENCE|MATHEMATICS|PHYSICS|SYSTEMS|NETWORKS|DATA STRUCTURES|ARTIFICIAL INTELLIGENCE|DATABASE|OPERATING SYSTEMS))/i);
  if (titleMatch) {
    courseTitle = titleMatch[1].trim();
  } else if (lines.length > 0) {
    // Fallback: Use top prominent line as title if title pattern not explicitly labeled
    const topCandidates = lines.slice(0, 5).filter(l => l.length > 5 && !l.toLowerCase().includes('page'));
    if (topCandidates.length > 0) {
      courseTitle = topCandidates[0].replace(/^(syllabus|curriculum|department of)\s*/i, '').trim();
    }
  }

  // Course Code match (e.g., CS301, 18CS52, INT-204, etc.)
  const codeMatch = fullText.match(/(?:Course\s+Code|Subject\s+Code|Code)\s*[:|-]\s*([A-Z0-9-]{3,12})/i) ||
                    fullText.match(/\b([A-Z]{2,4}\s*[-]?\s*\d{3,4}[A-Z]?)\b/);
  if (codeMatch) {
    courseCode = codeMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  // Department match
  const deptMatch = fullText.match(/(?:Department\s+of|Dept\.?\s+of)\s+([^\n\r,]+)/i);
  if (deptMatch) department = deptMatch[1].trim();

  // Semester match
  const semMatch = fullText.match(/(?:Semester|Sem\.?)\s*[:|-]?\s*([I|V|X|0-9]+)/i);
  if (semMatch) semester = `Semester ${semMatch[1]}`;

  // Credits match
  const credMatch = fullText.match(/(?:Credits|Credit)\s*[:|-]?\s*(\d+(?:\.\d+)?)/i);
  if (credMatch) credits = `${credMatch[1]} Credits`;

  return { courseTitle, courseCode, department, semester, credits };
}

function extractModules(lines, fullText) {
  const modules = [];

  // Patterns for Unit / Module headers
  // e.g. "UNIT - I", "UNIT 1:", "MODULE 1 -", "Chapter 2:", "Section III"
  const headerRegex = /^(?:UNIT|MODULE|CHAPTER|SECTION)\s*[-:\s]*([IVX0-9]+)\s*[:|-]?\s*(.*)$/i;
  
  let currentModule = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const match = line.match(headerRegex);

    if (match) {
      if (currentModule) {
        modules.push(finalizeModule(currentModule));
      }

      const unitNum = match[1];
      let title = match[2].trim();

      // If title was on next line
      if (!title && i + 1 < lines.length && !lines[i + 1].match(headerRegex)) {
        title = lines[i + 1].trim();
        i++;
      }

      currentModule = {
        id: `module-${modules.length + 1}`,
        unitNumber: unitNum,
        title: title || `Module ${modules.length + 1}`,
        hours: extractHours(line) || 8,
        topicsRaw: [],
        description: ''
      };
    } else if (currentModule) {
      // Check if line contains hours annotation e.g. "(8 Hours)" or "[10 Hours]"
      const hrs = extractHours(line);
      if (hrs && hrs > 0) {
        currentModule.hours = hrs;
      } else {
        currentModule.topicsRaw.push(line);
      }
    }
  }

  if (currentModule) {
    modules.push(finalizeModule(currentModule));
  }

  // Fallback: If no formal "UNIT X" or "MODULE X" headings were found
  if (modules.length === 0) {
    return fallbackModuleChunking(lines);
  }

  return modules;
}

function extractHours(text) {
  const match = text.match(/\b(\d{1,2})\s*(?:Hours|Hrs|Lectures|L|Periods)\b/i);
  return match ? parseInt(match[1], 10) : null;
}

function finalizeModule(mod) {
  // Process topics from raw lines
  const combined = mod.topicsRaw.join(' ');
  
  // Split topics by common separators: semicolon, bullet points, numbered lists, or newlines
  let topics = [];
  
  // Clean text
  const cleanStr = mod.topicsRaw.join('\n');
  
  // Split by semicolon or comma or newlines with bullet points
  const rawSplit = cleanStr.split(/;|•|\n\s*[-*]\s*|\n(?=\d+\.)/);

  for (let item of rawSplit) {
    item = item.replace(/^\d+\.\s*/, '').replace(/^[-\s*:]+/, '').trim();
    if (item.length > 3 && item.length < 200 && !item.toLowerCase().includes('textbook') && !item.toLowerCase().includes('reference')) {
      // Sub-split by comma if long
      if (item.length > 80 && item.includes(',')) {
        const subParts = item.split(',').map(s => s.trim()).filter(s => s.length > 3);
        topics.push(...subParts);
      } else {
        topics.push(item);
      }
    }
  }

  // Deduplicate and filter out non-topic meta lines
  topics = [...new Set(topics)].filter(t => 
    !t.toLowerCase().startsWith('hours') && 
    !t.toLowerCase().startsWith('credit') &&
    !t.toLowerCase().includes('page ')
  );

  if (topics.length === 0) {
    topics = ['Overview & Core Concepts', 'Theoretical Foundations', 'Practical Applications & Architecture', 'Key Algorithms & Paradigms'];
  }

  // Generate difficulty & estimated weightage
  const topicCount = topics.length;
  const hours = mod.hours || 8;
  const weightage = Math.min(30, Math.max(15, Math.round(hours * 2.5)));

  return {
    id: mod.id,
    unitNumber: mod.unitNumber,
    title: mod.title,
    hours: hours,
    weightage: `${weightage}%`,
    difficulty: hours > 10 ? 'High' : (hours > 6 ? 'Medium' : 'Standard'),
    topics: topics.slice(0, 15), // cap at top 15 crisp topics per module
    rawContent: combined
  };
}

function fallbackModuleChunking(lines) {
  // If syllabus doesn't have standard "Module 1" tags, split lines evenly into 4 logical units
  const cleanLines = lines.filter(l => l.length > 10 && !l.toLowerCase().includes('page'));
  const chunkSize = Math.max(5, Math.ceil(cleanLines.length / 4));
  
  const modules = [];
  for (let i = 0; i < cleanLines.length; i += chunkSize) {
    const chunk = cleanLines.slice(i, i + chunkSize);
    const modNum = modules.length + 1;
    const titleLine = chunk[0].substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '');
    
    modules.push({
      id: `module-${modNum}`,
      unitNumber: `${modNum}`,
      title: titleLine || `Unit ${modNum}: Core Concepts`,
      hours: 8,
      weightage: '25%',
      difficulty: modNum === 3 ? 'High' : 'Medium',
      topics: chunk.slice(1).map(l => l.substring(0, 80).trim()).filter(l => l.length > 5).slice(0, 8),
      rawContent: chunk.join('\n')
    });
  }

  return modules;
}
