'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function ResumePage() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('edit');
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [resumeId, setResumeId] = useState(null);

    // Load saved resume from Supabase
    useEffect(() => {
        if (!user) { setLoadingData(false); return; }
        async function load() {
            const { data } = await supabase
                .from('resumes')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();
            if (data) {
                setResumeId(data.id);
                setName(data.full_name || '');
                setTitle(data.title || '');
                setSummary(data.summary || '');
                setSkills(data.skills || '');
                setExperience(data.experience || '');
                setEducation(data.education || '');
            }
            setLoadingData(false);
        }
        load();
    }, [user]);

    // Auto-save debounced
    const saveResume = useCallback(async () => {
        if (!user) return;
        setSaveStatus('Saving...');
        const payload = {
            user_id: user.id,
            full_name: name,
            title, summary, skills, experience, education,
            updated_at: new Date().toISOString(),
        };
        if (resumeId) {
            await supabase.from('resumes').update(payload).eq('id', resumeId);
        } else {
            const { data } = await supabase.from('resumes').insert(payload).select().single();
            if (data) setResumeId(data.id);
        }
        setSaveStatus('✓ Saved');
        setTimeout(() => setSaveStatus(''), 2000);
    }, [user, resumeId, name, title, summary, skills, experience, education]);

    // Debounced auto-save on field changes
    useEffect(() => {
        if (!user || loadingData) return;
        const timer = setTimeout(saveResume, 2000);
        return () => clearTimeout(timer);
    }, [name, title, summary, skills, experience, education, user, loadingData]);

    async function generateSuggestions() {
        setAiLoading(true);
        try {
            const res = await fetch('/api/resume-suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, title, summary, skills, experience, education }),
            });
            const data = await res.json();
            if (data.suggestions) setSuggestions(data.suggestions.map(s => ({ ...s, applied: false })));
        } catch { /* keep current suggestions */ }
        setAiLoading(false);
    }

    function applySuggestion(id) {
        const s = suggestions.find(x => x.id === id);
        if (!s || s.applied) return;
        const plainText = s.text.replace(/<[^>]+>/g, '');

        if (plainText.toLowerCase().includes('quantified') || plainText.toLowerCase().includes('metrics')) {
            setExperience(prev => prev + '\n• Increased user retention by 23% through feature optimization');
        } else if (plainText.toLowerCase().includes('keyword') || plainText.toLowerCase().includes('ats')) {
            setSkills(prev => {
                const toAdd = ['distributed systems', 'microservices', 'CI/CD', 'Kubernetes'];
                const existing = prev.toLowerCase();
                const newOnes = toAdd.filter(s => !existing.includes(s));
                return newOnes.length ? prev + ', ' + newOnes.join(', ') : prev;
            });
        } else if (plainText.toLowerCase().includes('summary') || plainText.toLowerCase().includes('target role')) {
            setSummary(prev => prev + ' Pursuing roles focused on distributed systems and cloud-native architecture at scale.');
        } else if (plainText.toLowerCase().includes('project')) {
            setExperience(prev => prev + '\n\n• Side Project: Built a distributed task scheduler with Redis-backed queue');
        }

        setSuggestions(prev => prev.map(x => x.id === id ? { ...x, applied: true } : x));
    }

    function downloadPDF() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<!DOCTYPE html><html><head><title>${name} - Resume</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;padding:48px;max-width:800px;margin:0 auto;color:#1a1a1a;line-height:1.5}h1{font-size:28px;margin-bottom:4px}.subtitle{font-size:14px;color:#555;margin-bottom:24px}h2{font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#333;border-bottom:2px solid #333;padding-bottom:4px;margin:20px 0 10px}p,li{font-size:13px}ul{padding-left:20px}li{margin-bottom:4px}.skills{display:flex;flex-wrap:wrap;gap:6px}.skill{background:#f0f0f0;padding:3px 10px;border-radius:3px;font-size:12px}@media print{body{padding:24px}}</style></head><body>
<h1>${name || 'Your Name'}</h1><div class="subtitle">${title || 'Your Title'}</div>
<h2>Professional Summary</h2><p>${summary || 'Add your summary'}</p>
<h2>Skills</h2><div class="skills">${(skills || '').split(',').map(s => `<span class="skill">${s.trim()}</span>`).join('')}</div>
<h2>Experience</h2>${(experience || '').split('\n').map(l => l.startsWith('•') ? `<li>${l.substring(1).trim()}</li>` : `<p style="font-weight:600;margin-top:10px">${l}</p>`).join('')}
<h2>Education</h2><p>${education || 'Add your education'}</p>
</body></html>`);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 300);
    }

    if (authLoading || loadingData) {
        return (
            <div className="page-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>Loading your resume...</div>
            </div>
        );
    }

    return (
        <div className="page-section" style={{ display: 'block' }}>
            <div className="page-inner">
                <div className="page-header">
                    <div className="page-eyebrow">Products → Resume Builder</div>
                    <div className="page-title">Resume Builder + <span>AI Suggestions</span></div>
                    <div className="page-sub" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        Build your resume and get instant AI-powered improvement suggestions.
                        {saveStatus && <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: "'DM Mono',monospace" }}>{saveStatus}</span>}
                    </div>
                </div>
                <div className="section-tabs">
                    <button className={`stab ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>✏️ Edit Resume</button>
                    <button className={`stab ${activeTab === 'suggestions' ? 'active' : ''}`} onClick={() => setActiveTab('suggestions')}>✦ AI Suggestions</button>
                    <button className={`stab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>👁 Preview</button>
                </div>
                {activeTab === 'preview' ? (
                    <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
                        <div className="card-pad">
                            <div style={{ background: 'var(--deep)', borderRadius: 12, padding: 40, border: '1px solid var(--border)' }}>
                                <div style={{ borderBottom: '2px solid var(--cyan)', paddingBottom: 16, marginBottom: 20 }}>
                                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>{name || 'Your Name'}</div>
                                    <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>{title || 'Your Title'}</div>
                                </div>
                                {summary && (
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--cyan)', marginBottom: 8 }}>Professional Summary</div>
                                        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{summary}</div>
                                    </div>
                                )}
                                {skills && (
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--cyan)', marginBottom: 8 }}>Skills</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {skills.split(',').filter(s => s.trim()).map((s, i) => (
                                                <span key={i} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--cyan-dim)', border: '1px solid var(--border-bright)', fontSize: 12, fontWeight: 600 }}>{s.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {experience && (
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--cyan)', marginBottom: 8 }}>Experience</div>
                                        {experience.split('\n').filter(l => l.trim()).map((line, i) => (
                                            <div key={i} style={{ fontSize: 14, color: line.startsWith('•') ? 'var(--text-2)' : 'var(--text-1)', fontWeight: line.startsWith('•') ? 400 : 700, marginTop: line.startsWith('•') ? 4 : 12, lineHeight: 1.6, paddingLeft: line.startsWith('•') ? 12 : 0 }}>
                                                {line}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {education && (
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--cyan)', marginBottom: 8 }}>Education</div>
                                        <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{education}</div>
                                    </div>
                                )}
                                {!name && !title && !summary && !skills && !experience && !education && (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
                                        <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
                                        <div>Fill in your resume sections in the Edit tab to see a live preview here.</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                                <button className="btn-action" style={{ marginTop: 0, flex: 1 }} onClick={downloadPDF}>📥 Download PDF</button>
                                <button className="btn-action" style={{ marginTop: 0, flex: 1, background: 'linear-gradient(135deg, var(--purple), var(--cyan))' }} onClick={() => setActiveTab('edit')}>✏️ Edit Resume</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rb-grid">
                        <div className="card">
                            <div className="card-pad">
                                <div className="card-label">Resume Sections {!user && <span style={{ color: 'var(--gold)', fontSize: 10 }}>· Sign in to save</span>}</div>
                                <div className="field"><label className="flabel">Full Name</label><input className="finput" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></div>
                                <div className="field"><label className="flabel">Current Title</label><input className="finput" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" /></div>
                                <div className="field"><label className="flabel">Professional Summary</label><textarea className="ftextarea" rows={3} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief overview of your experience and goals..." /></div>
                                <div className="field"><label className="flabel">Skills (comma separated)</label><textarea className="ftextarea" rows={2} value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js, PostgreSQL..." /></div>
                                <div className="field"><label className="flabel">Work Experience</label><textarea className="ftextarea" rows={4} value={experience} onChange={e => setExperience(e.target.value)} placeholder="Company · Role · Bullet points..." /></div>
                                <div className="field"><label className="flabel">Education</label><input className="finput" value={education} onChange={e => setEducation(e.target.value)} placeholder="B.S. Computer Science — University, 2021" /></div>
                                <button className="btn-action" onClick={generateSuggestions} disabled={aiLoading}>{aiLoading ? '⟳ Generating...' : '✦ Generate AI Suggestions'}</button>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-pad">
                                <div className="card-label" style={{ color: 'var(--cyan)' }}>✦ AI Resume Improvement Suggestions</div>
                                {suggestions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>
                                        <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
                                        <div>Fill in your resume and click "Generate AI Suggestions" to get personalized improvements.</div>
                                    </div>
                                ) : suggestions.map(s => (
                                    <div key={s.id} className="ai-suggestion-bar" style={s.applied ? { opacity: 0.5 } : {}}>
                                        <div className="sug-num">{s.applied ? '✓' : s.id}</div>
                                        <div>
                                            <div className="sug-text" dangerouslySetInnerHTML={{ __html: s.text }} />
                                            <button className="apply-btn" onClick={() => applySuggestion(s.id)} disabled={s.applied}>{s.applied ? '✓ Applied' : 'Apply →'}</button>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                    <button className="btn-action" style={{ marginTop: 0 }} onClick={downloadPDF}>📥 Download PDF</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
