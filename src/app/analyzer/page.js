'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ScoreRing from '@/components/ScoreRing';
import Link from 'next/link';

export default function AnalyzerPage() {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [resumeText, setResumeText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    async function handleFileUpload(file) {
        const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowed.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
            setUploadedFile('⚠️ Please upload a PDF, DOCX, or TXT file.');
            return;
        }
        setUploading(true);
        setUploadedFile(file.name);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) {
                setUploadedFile(data.error || 'Error processing file');
            } else if (data.text) {
                setResumeText(data.text);
            }
        } catch (err) {
            setUploadedFile('Error — try pasting text instead');
        }
        setUploading(false);
    }

    function handleDrop(e) { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFileUpload(f); }
    function handleDragOver(e) { e.preventDefault(); }

    async function analyze() {
        if (!resumeText.trim()) return;
        setLoading(true);
        setResults(null);
        const steps = ['Parsing resume structure...', 'Matching against role requirements...', 'Computing skill scores...', 'Generating AI recommendations...'];
        let step = 0;
        const iv = setInterval(() => { setLoadingStep(steps[step % steps.length]); step++; }, 2000);
        setLoadingStep(steps[0]);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume: resumeText, targetRole }),
            });
            const data = await res.json();
            clearInterval(iv);
            if (data.error) {
                setResults({ error: data.error });
            } else {
                setResults(data);
                // Save to Supabase if logged in
                if (user && data.score) {
                    await supabase.from('analyses').insert({
                        user_id: user.id,
                        target_role: targetRole || 'General Analysis',
                        resume_text: resumeText.substring(0, 5000),
                        score: data.score,
                        results: data,
                    });
                }
            }
        } catch (err) {
            clearInterval(iv);
            setResults({ error: 'Network error — please check your connection and try again.' });
        }
        setLoading(false);
        setLoadingStep('');
    }

    const score = results?.score;
    const grade = score >= 80 ? 'strong match' : score >= 60 ? 'good progress' : score >= 40 ? 'needs work' : score ? 'early stage' : '';
    const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--cyan)' : score >= 40 ? 'var(--gold)' : 'var(--red)';

    return (
        <div className="page-section" style={{ display: 'block' }}>
            <div className="page-inner">
                <div className="page-header">
                    <div className="page-eyebrow">Core Features → Skill Analyzer</div>
                    <div className="page-title">Skill Gap <span>Analyzer</span></div>
                    <div className="page-sub">Upload your resume, set your target role. Gemini AI does the rest — precise score, gap analysis, and roadmap.</div>
                </div>

                <div className="analyze-grid">
                    <div className="card">
                        <div className="card-pad">
                            <div className="card-label">Input</div>
                            <input type="file" ref={fileInputRef} accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
                            <div className="dropzone" onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={handleDragOver}>
                                <span className="dz-icon">{uploading ? '⟳' : uploadedFile ? '✅' : '📎'}</span>
                                <div className="dz-h">{uploading ? 'Extracting text...' : uploadedFile ? uploadedFile : 'Drop your PDF resume'}</div>
                                <div className="dz-p">{uploading ? 'Processing your file...' : <>or <span className="dz-accent">click to browse</span> · PDF, DOCX, TXT</>}</div>
                            </div>
                            <div className="or-div">or paste manually</div>
                            <div className="field">
                                <label className="flabel">Resume / Skills</label>
                                <textarea className="ftextarea" rows={6} value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume text, skills, and experience here..." />
                            </div>
                            <div className="field">
                                <label className="flabel">Target Role</label>
                                <input className="finput" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Full Stack Engineer at Google" />
                            </div>
                            <button className="btn-action" onClick={analyze} disabled={loading || !resumeText.trim()}>{loading ? '⟳ Analyzing...' : '✦ Analyze with Gemini AI'}</button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-pad">
                            {loading ? (
                                <div style={{ textAlign: 'center', paddingTop: 60 }}>
                                    <div style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>⟳</div>
                                    <div style={{ fontSize: 14, color: 'var(--cyan)', marginTop: 16, fontWeight: 600 }}>{loadingStep}</div>
                                </div>
                            ) : results && !results.error ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'DM Mono',monospace", marginBottom: 4 }}>// analysis · {new Date().toLocaleDateString()}</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>Your Readiness Report</div>
                                        </div>
                                        <button className="share-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); const btn = document.querySelector('.share-btn'); const orig = btn.textContent; btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = orig, 2000); }}>🔗 Share Report</button>
                                    </div>

                                    <div className="results-grid">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                            <ScoreRing score={score} />
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1.5 }}>{grade}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>for {targetRole || 'target role'}</div>
                                            </div>
                                        </div>
                                        <div>
                                            {results.strengths?.length > 0 && (
                                                <div style={{ marginBottom: 16 }}>
                                                    <div className="card-label" style={{ color: 'var(--green)' }}>✓ Strengths</div>
                                                    <div className="chip-row">{results.strengths.map(s => <span key={s} className="chip chip-green">{s}</span>)}</div>
                                                </div>
                                            )}
                                            {results.gaps?.length > 0 && (
                                                <div style={{ marginBottom: 16 }}>
                                                    <div className="card-label" style={{ color: 'var(--red)' }}>✗ Skill Gaps</div>
                                                    {results.gaps.map((g, i) => (
                                                        <div key={i} className="pbar-item">
                                                            <div className="pbar-meta"><span className="pbar-name">{g.skill || g}</span><span className="pbar-pct" style={{ color: 'var(--red)' }}>{g.level || 'Missing'}</span></div>
                                                            <div className="pbar-track"><div className="pbar-fill" style={{ width: `${g.current || 20}%`, background: 'var(--red)' }} /></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {results.recommendations?.length > 0 && (
                                                <div>
                                                    <div className="card-label" style={{ color: 'var(--cyan)' }}>✦ AI Recommendations</div>
                                                    {results.recommendations.map((r, i) => (
                                                        <div key={i} className="ai-strip" style={{ marginBottom: 10 }}>
                                                            <div className="ai-icon-box">✦</div>
                                                            <div><div className="ai-text" dangerouslySetInnerHTML={{ __html: typeof r === 'string' ? r : r.text || r }} /></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : results?.error ? (
                                <div style={{ textAlign: 'center', padding: 48 }}>
                                    <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                                    <div style={{ color: 'var(--red)', fontWeight: 600 }}>{typeof results.error === 'string' ? results.error : 'Analysis failed. Please try again.'}</div>
                                    <button className="btn-action" style={{ marginTop: 16, display: 'inline-block' }} onClick={analyze}>↻ Retry Analysis</button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-3)' }}>
                                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                                    <div style={{ fontSize: 16, fontWeight: 600 }}>Results will appear here</div>
                                    <div style={{ fontSize: 13, marginTop: 6 }}>Paste your resume and click Analyze</div>
                                    {!user && <div style={{ fontSize: 12, marginTop: 12, color: 'var(--gold)' }}>💡 <Link href="/login" style={{ color: 'var(--cyan)' }}>Sign in</Link> to save your analyses</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
