import React, { useState } from 'react';
import { FileText, CheckCircle, HelpCircle, Copy, Check, Lightbulb, BookOpen } from 'lucide-react';

export default function Summaries({ summaries }) {
  const [selectedModuleId, setSelectedModuleId] = useState(summaries[0]?.moduleId || '');
  const [copied, setCopied] = useState(false);

  const currentSummary = summaries.find(s => s.moduleId === selectedModuleId) || summaries[0];

  const handleCopy = () => {
    if (!currentSummary) return;
    const text = `Unit ${currentSummary.unitNumber}: ${currentSummary.title}\n\nSummary:\n${currentSummary.summary}\n\nKey Takeaways:\n${currentSummary.keyTakeaways.map(t => `- ${t}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!summaries || summaries.length === 0) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>No summaries available.</div>;
  }

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} className="gradient-text" />
            <span>Module-Wise High-Yield Summaries</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Quick-review notes, core concepts, and key definitions for every module
          </p>
        </div>

        <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          {copied ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
          <span>{copied ? 'Copied Summary' : 'Copy Summary Notes'}</span>
        </button>
      </div>

      {/* Module Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        {summaries.map((sum) => {
          const isActive = sum.moduleId === selectedModuleId;
          return (
            <button
              key={sum.moduleId}
              onClick={() => setSelectedModuleId(sum.moduleId)}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              Unit {sum.unitNumber}: {sum.title.substring(0, 22)}{sum.title.length > 22 ? '...' : ''}
            </button>
          );
        })}
      </div>

      {/* Selected Summary Card Details */}
      {currentSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Main Summary & Takeaways */}
          <div className="glass-card" style={{ padding: '1.75rem', gridColumn: 'span 2 / span 2' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-primary">Unit {currentSummary.unitNumber}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ⏱️ {currentSummary.hours} Hours Load • Weightage: {currentSummary.weightage}
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
              {currentSummary.title}
            </h3>

            {/* Overview Box */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid var(--primary)', padding: '1rem 1.25rem', borderRadius: '0 10px 10px 0', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {currentSummary.summary}
            </div>

            {/* Key Takeaways */}
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span>Key Academic Takeaways</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {currentSummary.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>•</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{takeaway}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Side Column: Key Definitions & Exam Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Key Definitions Box */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} style={{ color: 'var(--secondary)' }} />
                <span>Core Terminology</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentSummary.keyDefinitions.map((def, idx) => (
                  <div key={idx} style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#38BDF8', marginBottom: '0.2rem' }}>
                      {def.term}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {def.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Tips Box */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FBBF24' }}>
                <Lightbulb size={18} />
                <span>Exam Preparation Tip</span>
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {currentSummary.examTips}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
