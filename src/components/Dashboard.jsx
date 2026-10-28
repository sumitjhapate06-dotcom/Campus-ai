import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Layers, 
  CheckSquare, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Sparkles,
  Award
} from 'lucide-react';

export default function Dashboard({ syllabusData, onAskAboutModule, onNavigateTab }) {
  const { meta, modules } = syllabusData;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModules, setExpandedModules] = useState({ 'module-1': true, 'module-2': true });
  const [completedTopics, setCompletedTopics] = useState({});

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTopic = (topicKey) => {
    setCompletedTopics(prev => ({ ...prev, [topicKey]: !prev[topicKey] }));
  };

  // Filter modules based on search
  const filteredModules = modules.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = m.title.toLowerCase().includes(term);
    const unitMatch = m.unitNumber.toString().includes(term);
    const topicMatch = m.topics.some(t => t.toLowerCase().includes(term));
    return titleMatch || unitMatch || topicMatch;
  });

  const totalCompletedTopicsCount = Object.values(completedTopics).filter(Boolean).length;
  const overallProgress = meta.totalTopics > 0 ? Math.round((totalCompletedTopicsCount / meta.totalTopics) * 100) : 0;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      
      {/* Executive Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="gradient-bg" style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Title</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {meta.courseTitle}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#818CF8' }}>{meta.courseCode} • {meta.semester}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38BDF8', border: '1px solid rgba(6, 182, 212, 0.3)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Syllabus Structure</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {meta.totalModules} Units / {meta.totalTopics} Topics
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meta.department}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.3)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Lecture Load</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {meta.totalHours} Hours
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meta.credits} Allocated</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Study Progress</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{overallProgress}%</span>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '0.4rem' }}>
              <div style={{ background: 'linear-gradient(90deg, #10B981, #06B6D4)', height: '100%', width: `${overallProgress}%`, transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              {totalCompletedTopicsCount} of {meta.totalTopics} topics checked
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Row: Search & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Syllabus Breakdown</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Interactive module cards & topic checklist</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: '1 1 300px', maxWidth: '450px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search units, topics or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.6rem 1rem 0.6rem 2.4rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredModules.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No modules or topics matched your search "{searchTerm}".
          </div>
        ) : (
          filteredModules.map((mod) => {
            const isExpanded = !!expandedModules[mod.id];
            const modCompletedCount = mod.topics.filter(t => completedTopics[`${mod.id}-${t}`]).length;
            const modProgress = mod.topics.length > 0 ? Math.round((modCompletedCount / mod.topics.length) * 100) : 0;

            return (
              <div key={mod.id} className="glass-card" style={{ overflow: 'hidden' }}>
                
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: '1rem',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <span className="badge badge-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                      Unit {mod.unitNumber}
                    </span>

                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                        {mod.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <span>⏱️ {mod.hours} Hours</span>
                        <span>📊 Weightage: {mod.weightage}</span>
                        <span className={`badge ${mod.difficulty === 'High' ? 'badge-rose' : 'badge-cyan'}`} style={{ textTransform: 'none' }}>
                          {mod.difficulty} Difficulty
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right', display: 'none', smDisplay: 'block' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {modCompletedCount}/{mod.topics.length} Done
                      </div>
                      <div style={{ width: '80px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '3px' }}>
                        <div style={{ width: `${modProgress}%`, height: '100%', background: 'var(--accent-emerald)', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAboutModule(mod);
                      }} 
                      className="btn-secondary" 
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      title="Open RAG AI chat for this specific module"
                    >
                      <MessageSquare size={14} className="gradient-text" />
                      <span>Ask AI</span>
                    </button>

                    {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-dim)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-dim)' }} />}
                  </div>
                </div>

                {/* Module Body Content */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(0, 0, 0, 0.15)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Sub-Topics ({mod.topics.length})</span>
                      <span style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>Check off as you complete studying</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                      {mod.topics.map((topic, idx) => {
                        const key = `${mod.id}-${topic}`;
                        const isDone = !!completedTopics[key];

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleTopic(key)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.65rem',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '10px',
                              background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                              border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => {}}
                              style={{ marginTop: '0.2rem', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.88rem', color: isDone ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {topic}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
