import React, { useState } from 'react';
import { Zap, AlertTriangle, HelpCircle, Award, Target, Flame } from 'lucide-react';

export default function ExamFocus({ examTopics }) {
  const [activeTab, setActiveTab] = useState('high');

  const { highPriority = [], mediumPriority = [], standardPriority = [], likelyQuestions = [] } = examTopics;

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={22} className="gradient-text" />
          <span>Important Exam Topics & Risk Matrix</span>
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          AI-evaluated exam frequency analysis based on topic complexity, weightage, and academic patterns
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>HIGH PRIORITY TOPICS</span>
            <Flame size={20} style={{ color: '#EF4444' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC', marginTop: '0.2rem' }}>
            {highPriority.length} Topics
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FB7185' }}>Must master for 60%+ exam marks</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>MEDIUM PRIORITY</span>
            <Target size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC', marginTop: '0.2rem' }}>
            {mediumPriority.length} Topics
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FBBF24' }}>Expected short notes & 5-mark questions</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>LIKELY EXAM QUESTIONS</span>
            <HelpCircle size={20} style={{ color: '#818CF8' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F8FAFC', marginTop: '0.2rem' }}>
            {likelyQuestions.length} Questions
          </div>
          <div style={{ fontSize: '0.75rem', color: '#818CF8' }}>Curated mock questions</div>
        </div>

      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('high')}
          className={activeTab === 'high' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.88rem' }}
        >
          <Flame size={16} /> High Priority ({highPriority.length})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.88rem' }}
        >
          <HelpCircle size={16} /> Likely Questions ({likelyQuestions.length})
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'high' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {highPriority.map((item) => (
            <div key={item.id} className="glass-card glass-card-interactive" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-rose">Unit {item.unitNumber}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FBBF24' }}>
                  🎯 Est: {item.estimatedExamMarks}
                </span>
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {item.topic}
              </h4>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                Module: {item.moduleTitle}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                💡 {item.reason}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Likely Exam Questions View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {likelyQuestions.map((q) => (
            <div key={q.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <span className="badge badge-primary">Unit {q.unitNumber}</span>
                  <span className="badge badge-amber">{q.marks}</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                  {q.question}
                </h4>
              </div>

              <span className={`badge ${q.difficulty === 'Hard' ? 'badge-rose' : 'badge-cyan'}`}>
                {q.difficulty}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
