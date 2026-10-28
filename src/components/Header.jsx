import React from 'react';
import { 
  GraduationCap, 
  Upload, 
  Key, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Zap, 
  Calendar 
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  syllabusMeta, 
  onReplaceSyllabus, 
  onOpenApiKeyModal,
  hasApiKey 
}) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'chat', label: 'Ask AI Chat', icon: MessageSquare },
    { id: 'summaries', label: 'Module Summaries', icon: FileText },
    { id: 'exam', label: 'Exam Focus', icon: Zap },
    { id: 'plan', label: 'Study Plan', icon: Calendar },
  ];

  return (
    <header className="glass-card" style={{ borderRadius: '0 0 16px 16px', marginBottom: '1.5rem', borderTop: 'none' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        
        {/* Top Navbar Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="gradient-bg" style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 14px var(--primary-glow)' }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }} className="gradient-text">
                CAMPUS AI
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Intelligent Syllabus & Study Engine
              </p>
            </div>
          </div>

          {/* Syllabus Meta Badge (if loaded) */}
          {syllabusMeta && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              background: 'rgba(255, 255, 255, 0.04)', 
              padding: '0.4rem 0.85rem', 
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {syllabusMeta.courseTitle}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {syllabusMeta.courseCode} • {syllabusMeta.semester}
                </div>
              </div>
              <span className="badge badge-emerald">Active</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {syllabusMeta && (
              <button onClick={onReplaceSyllabus} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}>
                <Upload size={15} />
                <span>Replace Syllabus</span>
              </button>
            )}

            <button 
              onClick={onOpenApiKeyModal} 
              className={hasApiKey ? "badge badge-emerald" : "btn-secondary"}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem', cursor: 'pointer', border: hasApiKey ? '1px solid var(--accent-emerald)' : '' }}
              title="Configure optional Gemini API Key"
            >
              <Key size={15} />
              <span>{hasApiKey ? 'Gemini API Active' : 'Set Gemini Key'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Visible when syllabus is loaded) */}
        {syllabusMeta && (
          <nav style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 14px var(--primary-glow)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={17} style={{ color: isActive ? '#FFFFFF' : 'var(--text-dim)' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

      </div>
    </header>
  );
}
