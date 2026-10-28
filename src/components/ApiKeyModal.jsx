import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveApiKey('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="gradient-bg" style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Key size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Gemini API Settings</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Optional LLM Integration for enhanced answers</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Campus AI has a built-in RAG engine that works <strong>100% offline & out of the box</strong>. You can optionally provide a Google Gemini API Key to enable online generative responses.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.82rem', color: '#818CF8', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
            >
              Get Free Key from AI Studio <ExternalLink size={12} />
            </a>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {keyInput && (
                <button type="button" onClick={handleClear} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Clear
                </button>
              )}
              <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem' }}>
                {saved ? <Check size={16} /> : <Key size={16} />}
                <span>{saved ? 'Saved!' : 'Save Key'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
