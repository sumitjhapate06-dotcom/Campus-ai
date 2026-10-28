import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromPDF } from './pdfExtractor.js';
import { parseSyllabus } from './syllabusParser.js';
import { SyllabusRAGEngine } from './ragEngine.js';
import { generateModuleSummaries, generateImportantExamTopics } from './summaryGenerator.js';
import { generatePersonalizedStudyPlan } from './studyPlanGenerator.js';
import { SAMPLE_SYLLABUS_TEXT } from './samples/sampleSyllabus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configure Multer for PDF memory upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// In-Memory store for active session syllabus & RAG Engine
let activeSyllabusData = null;
let activeRAGEngine = null;

/**
 * Process raw text into complete Campus AI state
 */
function processSyllabusText(text) {
  const parsed = parseSyllabus(text);
  activeSyllabusData = parsed;
  activeRAGEngine = new SyllabusRAGEngine(parsed);

  const summaries = generateModuleSummaries(parsed.modules);
  const examTopics = generateImportantExamTopics(parsed.modules);
  const studyPlan = generatePersonalizedStudyPlan(parsed, 14, 3);

  return {
    success: true,
    meta: parsed.meta,
    modules: parsed.modules,
    summaries,
    examTopics,
    studyPlan
  };
}

// 1. Upload Syllabus PDF Route
app.post('/api/upload-syllabus', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    if (!req.file.mimetype.includes('pdf') && !req.file.originalname.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    console.log(`Processing uploaded file: ${req.file.originalname} (${req.file.size} bytes)`);

    const { text, numPages } = await extractTextFromPDF(req.file.buffer);

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Could not extract text from PDF. The PDF may be scanned images or empty.' });
    }

    const payload = processSyllabusText(text);
    payload.meta.numPages = numPages;
    payload.meta.filename = req.file.originalname;

    res.json(payload);
  } catch (err) {
    console.error('Error processing syllabus upload:', err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// 2. Load Sample Syllabus Route
app.post('/api/sample-syllabus', (req, res) => {
  try {
    const payload = processSyllabusText(SAMPLE_SYLLABUS_TEXT);
    payload.meta.filename = 'Sample_CS301_Data_Structures.pdf';
    payload.meta.numPages = 3;
    res.json(payload);
  } catch (err) {
    console.error('Error loading sample syllabus:', err);
    res.status(500).json({ error: `Failed to load sample syllabus: ${err.message}` });
  }
});

// 3. Syllabus RAG Chat Route
app.post('/api/chat', async (req, res) => {
  try {
    const { question, apiKey } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question string is required' });
    }

    if (!activeRAGEngine) {
      // Auto initialize sample if no syllabus is loaded yet
      processSyllabusText(SAMPLE_SYLLABUS_TEXT);
    }

    const result = await activeRAGEngine.answerQuestion(question, apiKey);

    // Suggested follow-up prompts
    const suggestedPrompts = [
      `What are the most important exam topics in Unit 1?`,
      `Explain the key definitions in Unit 2.`,
      `What is the total weightage of Module 3?`,
      `Summarize the practical topics in the syllabus.`
    ];

    res.json({
      answer: result.answer,
      citations: result.citations,
      grounded: result.grounded,
      mode: result.mode,
      suggestedPrompts
    });
  } catch (err) {
    console.error('Error in chat processing:', err);
    res.status(500).json({ error: `Chat processing error: ${err.message}` });
  }
});

// 4. Recalculate Study Plan Route
app.post('/api/study-plan', (req, res) => {
  try {
    const { durationDays, hoursPerDay } = req.body;
    
    if (!activeSyllabusData) {
      return res.status(400).json({ error: 'No active syllabus found. Please upload a syllabus first.' });
    }

    const plan = generatePersonalizedStudyPlan(activeSyllabusData, durationDays, hoursPerDay);
    res.json({ success: true, studyPlan: plan });
  } catch (err) {
    console.error('Error recalculating study plan:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    activeSyllabus: activeSyllabusData ? activeSyllabusData.meta.courseTitle : null
  });
});

app.listen(PORT, () => {
  console.log(`🎓 Campus AI Backend Server running on http://localhost:${PORT}`);
});
