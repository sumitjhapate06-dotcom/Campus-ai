import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, RefreshCw, Printer, Sparkles, BookOpen } from 'lucide-react';

export default function StudyPlan({ initialPlan, onRecalculatePlan }) {
  const [plan, setPlan] = useState(initialPlan);
  const [durationDays, setDurationDays] = useState(initialPlan?.meta?.totalDays || 14);
  const [hoursPerDay, setHoursPerDay] = useState(initialPlan?.meta?.dailyHours || 3);
  const [isUpdating, setIsUpdating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays, hoursPerDay })
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed to update plan');
      setPlan(data.studyPlan);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTask = (taskKey) => {
    setCompletedTasks(prev => ({ ...prev, [taskKey]: !prev[taskKey] }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!plan || !plan.schedule) return null;

  const totalTasksCount = plan.schedule.reduce((acc, d) => acc + d.tasks.length, 0);
  const doneTasksCount = Object.values(completedTasks).filter(Boolean).length;
  const planProgress = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      
      {/* Title & Controls Bar */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} className="gradient-text" />
            <span>Personalized Study Plan</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Customized day-by-day learning schedule tailored to your exam schedule
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Days:</label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '0.4rem 0.6rem', borderRadius: '8px', outline: 'none' }}
            >
              <option value={7} style={{ background: '#111827' }}>7 Days (Crash Course)</option>
              <option value={14} style={{ background: '#111827' }}>14 Days (Standard)</option>
              <option value={30} style={{ background: '#111827' }}>30 Days (Deep Dive)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Hours/Day:</label>
            <select
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', padding: '0.4rem 0.6rem', borderRadius: '8px', outline: 'none' }}
            >
              <option value={2} style={{ background: '#111827' }}>2 Hours</option>
              <option value={3} style={{ background: '#111827' }}>3 Hours</option>
              <option value={4} style={{ background: '#111827' }}>4 Hours</option>
            </select>
          </div>

          <button onClick={handleUpdate} className="btn-primary" disabled={isUpdating} style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={15} className={isUpdating ? 'animate-spin-slow' : ''} />
            <span>Update Plan</span>
          </button>

          <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={22} style={{ color: 'var(--accent-emerald)' }} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Study Plan Completion</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doneTasksCount} of {totalTasksCount} daily tasks finished</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '0 1 300px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', height: '10px', borderRadius: '5px', overflow: 'hidden', flex: 1 }}>
            <div style={{ background: 'linear-gradient(90deg, #6366F1, #10B981)', height: '100%', width: `${planProgress}%`, transition: 'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{planProgress}%</span>
        </div>
      </div>

      {/* Days Schedule Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {plan.schedule.map((item) => (
          <div
            key={item.dayNumber}
            className="glass-card"
            style={{
              padding: '1.25rem',
              borderTop: item.type === 'mock' ? '4px solid #EF4444' : (item.type === 'revision' ? '4px solid #F59E0B' : '4px solid #6366F1')
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span className={`badge ${item.type === 'mock' ? 'badge-rose' : (item.type === 'revision' ? 'badge-amber' : 'badge-primary')}`}>
                {item.day}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ⏱️ {item.allocatedHours}
              </span>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              {item.focus}
            </h4>

            {/* Target topics tags */}
            {item.targetTopics && item.targetTopics.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                {item.targetTopics.slice(0, 3).map((t, tIdx) => (
                  <span key={tIdx} style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Tasks checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {item.tasks.map((task, taskIdx) => {
                const key = `${item.dayNumber}-${taskIdx}`;
                const isChecked = !!completedTasks[key];

                return (
                  <div
                    key={taskIdx}
                    onClick={() => toggleTask(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 0, 0, 0.15)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      color: isChecked ? 'var(--text-muted)' : 'var(--text-main)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      style={{ marginTop: '0.15rem', accentColor: 'var(--accent-emerald)' }}
                    />
                    <span style={{ textDecoration: isChecked ? 'line-through' : 'none' }}>
                      {task}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
