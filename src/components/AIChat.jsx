import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function AIChat({ syllabusData, apiKey, prefilledQuery }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your **Campus AI Syllabus Assistant** for **${syllabusData?.meta?.courseTitle || 'your syllabus'}**. Ask me anything about your modules, exam weightage, topics, or definitions—I answer strictly based on your uploaded syllabus context!`,
      citations: [],
      mode: 'grounded'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatBottomRef = useRef(null);

  const suggestedPrompts = [
    `What are the main topics covered in Unit 1?`,
    `Explain the key definitions and formulas in this syllabus.`,
    `Which module carries the highest exam weightage?`,
    `Give me a summary of the practical/algorithm topics.`
  ];

  // If prefilledQuery is provided from another component (e.g. Dashboard Ask AI button)
  useEffect(() => {
    if (prefilledQuery) {
      handleSend(prefilledQuery);
    }
  }, [prefilledQuery]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q || !q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, apiKey })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer,
          citations: data.citations || [],
          mode: data.mode
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **Error**: ${err.message}. Please try asking your question again.`,
          citations: [],
          mode: 'error'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: `Chat history cleared. What would you like to explore in your syllabus?`,
        citations: []
      }
    ]);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} className="gradient-text" />
            <span>Syllabus AI Q&A Chat</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Strictly grounded on {syllabusData?.meta?.courseTitle} ({syllabusData?.meta?.courseCode})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            <ShieldCheck size={14} /> Strict Grounding Active
          </span>
          <button onClick={clearChat} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '0.4rem 0.85rem',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="glass-card" style={{ minHeight: '420px', maxHeight: '550px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1rem' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.85rem',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.sender === 'ai' && (
              <div className="gradient-bg" style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <Bot size={20} />
              </div>
            )}

            <div
              style={{
                maxWidth: '82%',
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)' : 'rgba(255, 255, 255, 0.04)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '1rem 1.25rem',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                position: 'relative'
              }}
            >
              {/* Message Content */}
              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {msg.text}
              </div>

              {/* Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>CITED SOURCES:</span>
                  {msg.citations.map((c, cIdx) => (
                    <span key={cIdx} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      <BookOpen size={10} /> Unit {c.unit}: {c.moduleTitle.substring(0, 20)}...
                    </span>
                  ))}
                </div>
              )}

              {/* Copy Button */}
              {msg.sender === 'ai' && (
                <button
                  onClick={() => handleCopy(msg.text, idx)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Copy answer"
                >
                  {copiedIdx === idx ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                </button>
              )}
            </div>

            {msg.sender === 'user' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div className="gradient-bg animate-spin-slow" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Analyzing syllabus context and generating grounded answer...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-card"
        style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
      >
        <input
          type="text"
          placeholder="Ask anything about your syllabus modules, exam topics, or definitions..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            padding: '0.6rem 0.5rem'
          }}
        />

        <button type="submit" className="btn-primary" disabled={isLoading || !inputQuery.trim()}>
          <Send size={16} />
          <span>Ask</span>
        </button>
      </form>

    </div>
  );
}
