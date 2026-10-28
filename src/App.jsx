import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import Summaries from './components/Summaries';
import ExamFocus from './components/ExamFocus';
import StudyPlan from './components/StudyPlan';
import ApiKeyModal from './components/ApiKeyModal';

export default function App() {
  const [syllabusData, setSyllabusData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [prefilledChatQuery, setPrefilledChatQuery] = useState('');

  // Load saved API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('CAMPUS_AI_GEMINI_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('CAMPUS_AI_GEMINI_KEY', key);
    } else {
      localStorage.removeItem('CAMPUS_AI_GEMINI_KEY');
    }
  };

  const handleSyllabusProcessed = (data) => {
    setSyllabusData(data);
    setIsLoading(false);
    setActiveTab('dashboard');
  };

  const handleReplaceSyllabus = () => {
    setSyllabusData(null);
    setPrefilledChatQuery('');
  };

  const handleAskAboutModule = (mod) => {
    setPrefilledChatQuery(`Explain Unit ${mod.unitNumber}: ${mod.title} and its key topics.`);
    setActiveTab('chat');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        syllabusMeta={syllabusData?.meta}
        onReplaceSyllabus={handleReplaceSyllabus}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={!!apiKey}
      />

      {/* Main Container */}
      <main style={{ flex: 1 }}>
        {!syllabusData ? (
          <UploadSection
            onSyllabusProcessed={handleSyllabusProcessed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <div>
            {activeTab === 'dashboard' && (
              <Dashboard
                syllabusData={syllabusData}
                onAskAboutModule={handleAskAboutModule}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'chat' && (
              <AIChat
                syllabusData={syllabusData}
                apiKey={apiKey}
                prefilledQuery={prefilledChatQuery}
              />
            )}

            {activeTab === 'summaries' && (
              <Summaries
                summaries={syllabusData.summaries}
              />
            )}

            {activeTab === 'exam' && (
              <ExamFocus
                examTopics={syllabusData.examTopics}
              />
            )}

            {activeTab === 'plan' && (
              <StudyPlan
                initialPlan={syllabusData.studyPlan}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
        🎓 <strong>Campus AI</strong> • Intelligent Syllabus Extraction, RAG Q&A & Study Schedule Platform
      </footer>

      {/* API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

    </div>
  );
}
