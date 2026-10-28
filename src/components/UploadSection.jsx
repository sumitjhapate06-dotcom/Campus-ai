import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function UploadSection({ onSyllabusProcessed, isLoading, setIsLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [processingStep, setProcessingStep] = useState(0);
  const fileInputRef = useRef(null);

  const steps = [
    'Reading & Extracting PDF Content...',
    'Detecting Modules, Units & Sub-Topics...',
    'Building In-Memory RAG Search Index...',
    'Generating Module Summaries & Study Plan...'
  ];

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file (.pdf)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds 15MB limit.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    setProcessingStep(0);

    // Simulate animated processing steps for user feedback
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    const formData = new FormData();
    formData.append('syllabus', file);

    try {
      const response = await fetch('/api/upload-syllabus', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to parse syllabus PDF.');
      }

      onSyllabusProcessed(data);
    } catch (err) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || 'Error processing syllabus PDF.');
      setIsLoading(false);
    }
  };

  const handleSampleLoad = async () => {
    setErrorMsg('');
    setIsLoading(true);
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      const response = await fetch('/api/sample-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to load sample syllabus.');
      }

      onSyllabusProcessed(data);
    } catch (err) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || 'Error loading sample syllabus.');
      setIsLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '3rem auto', padding: '0 1rem' }}>
      
      {/* Hero Heading */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: '1rem' }}>
          <Sparkles size={16} className="gradient-text" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818CF8' }}>AI-POWERED ACADEMIC ASSISTANT</span>
        </div>
        
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Upload Your College <span className="gradient-text">Syllabus PDF</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Transform complex college syllabi into an interactive dashboard, RAG AI chatbot, module summaries, and day-by-day study schedule.
        </p>
      </div>

      {/* Upload Box */}
      <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', position: 'relative' }}>
        
        {!isLoading ? (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '16px',
                padding: '3rem 1.5rem',
                background: dragActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />

              <div className="gradient-bg animate-pulse-slow" style={{ width: '64px', height: '64px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: '#fff' }}>
                <UploadCloud size={32} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Drag & Drop your Syllabus PDF here
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Supports standard university & college PDF formats (Max 15MB)
              </p>

              <button className="btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <FileText size={18} />
                <span>Browse File</span>
              </button>
            </div>

            {errorMsg && (
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#FB7185', background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Demo Section */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>Private & processed locally in memory</span>
              </div>

              <button onClick={handleSampleLoad} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
                <Sparkles size={16} className="gradient-text" />
                <span>Try Sample Syllabus (Data Structures)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Processing State */
          <div style={{ padding: '2rem 1rem' }}>
            <div className="gradient-bg animate-spin-slow" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1.5rem auto', opacity: 0.9 }}></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Processing Your Syllabus...
            </h3>
            
            <div style={{ maxWidth: '450px', margin: '0 auto', textAlign: 'left', background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              {steps.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0', opacity: idx <= processingStep ? 1 : 0.4 }}>
                  {idx < processingStep ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
                  ) : idx === processingStep ? (
                    <Sparkles size={18} className="gradient-text" />
                  ) : (
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-dim)' }} />
                  )}
                  <span style={{ fontSize: '0.9rem', fontWeight: idx === processingStep ? 600 : 400 }}>
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
