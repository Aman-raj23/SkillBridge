'use client';
import { useState } from 'react';

const roleOptions = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'React Developer', 'Node.js Developer', 'Python Developer',
    'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
    'Cloud Architect', 'Mobile Developer (React Native)', 'Mobile Developer (Flutter)',
    'iOS Developer', 'Android Developer', 'Cybersecurity Analyst',
    'Blockchain Developer', 'Game Developer', 'Embedded Systems Engineer',
];

const diffColors = { beginner: 'var(--green)', intermediate: 'var(--cyan)', advanced: 'var(--red)' };
const diffGrads = { beginner: 'var(--green),#4ade80', intermediate: 'var(--cyan),var(--purple)', advanced: 'var(--red),var(--purple)' };

export default function ProjectsPage() {
    const [step, setStep] = useState('select'); // select → loading → result
    const [role, setRole] = useState('');
    const [customRole, setCustomRole] = useState('');
    const [projects, setProjects] = useState(null);
    const [diff, setDiff] = useState('beginner');
    const [loading, setLoading] = useState(false);

    async function generateProjects() {
        const selectedRole = role === 'custom' ? customRole : role;
        if (!selectedRole) return;
        setStep('loading');
        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole }),
            });
            const data = await res.json();
            setProjects(data.projects || null);
            setStep('result');
        } catch {
            setStep('select');
        }
        setLoading(false);
    }

    function reset() { setStep('select'); setRole(''); setCustomRole(''); setProjects(null); setDiff('beginner'); }

    const currentProjects = projects ? projects[diff] || [] : [];

    return (
        <div className="page-section" style={{ display: 'block' }}>
            <div className="page-inner">
                <div className="page-header">
                    <div className="page-eyebrow">Core Features → Projects</div>
                    <div className="page-title">Project <span>Recommendations</span></div>
                    <div className="page-sub">Select your target role and get AI-curated projects from beginner to advanced.</div>
                </div>

                {step === 'select' && (
                    <div className="card">
                        <div className="card-pad">
                            <div className="card-label">Select Your Target Role</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginTop: 16 }}>
                                {roleOptions.map(r => (
                                    <button key={r} onClick={() => setRole(r)}
                                        style={{
                                            padding: '14px 18px', borderRadius: 12, border: `1px solid ${role === r ? 'var(--cyan)' : 'var(--border-bright)'}`,
                                            background: role === r ? 'var(--cyan-dim)' : 'var(--deep)', color: role === r ? 'var(--cyan)' : 'var(--text-1)',
                                            cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600,
                                            textAlign: 'left', transition: 'all .2s',
                                        }}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                                <input className="finput" value={customRole} onChange={e => { setCustomRole(e.target.value); setRole('custom'); }}
                                    placeholder="Or type a custom role / tech stack..." style={{ flex: 1 }} />
                            </div>
                            <button className="btn-action" onClick={generateProjects}
                                disabled={!role && !customRole.trim()}>
                                ✦ Generate Project Recommendations
                            </button>
                        </div>
                    </div>
                )}

                {step === 'loading' && (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>⟳</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--cyan)', marginTop: 16 }}>Generating projects for {role === 'custom' ? customRole : role}...</div>
                        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>AI is selecting the best projects for your career path</div>
                    </div>
                )}

                {step === 'result' && projects && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: "'DM Mono',monospace" }}>
                                // projects for {role === 'custom' ? customRole : role}
                            </div>
                            <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-bright)', background: 'var(--deep)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 12, fontFamily: "'Syne',sans-serif" }}>
                                ↻ New Role
                            </button>
                        </div>
                        <div className="diff-tabs">
                            {[{ k: 'beginner', label: '🌱 Beginner' }, { k: 'intermediate', label: '⚡ Intermediate' }, { k: 'advanced', label: '🔥 Advanced' }].map(d => (
                                <button key={d.k} className={`diff-tab ${diff === d.k ? 'active' : ''}`} onClick={() => setDiff(d.k)}
                                    style={diff === d.k ? { borderColor: diffColors[d.k], color: diffColors[d.k] } : {}}>
                                    {d.label}
                                </button>
                            ))}
                        </div>
                        <div className="proj-grid">
                            {currentProjects.map((p, i) => (
                                <div key={i} className="proj-card">
                                    <div className="proj-top-stripe" style={{ background: `linear-gradient(90deg,${diffGrads[diff]})` }} />
                                    <div className="proj-body">
                                        <div className="proj-diff-label" style={{ color: diffColors[diff] }}>
                                            <span style={{ width: 5, height: 5, background: diffColors[diff], borderRadius: '50%', display: 'inline-block' }} />
                                            {diff.toUpperCase()}
                                        </div>
                                        <div className="proj-name">{p.name}</div>
                                        <div className="proj-desc">{p.description}</div>
                                        <div className="proj-stack">{(p.stack || []).map(s => <span key={s} className="stag">{s}</span>)}</div>
                                        <div className="proj-impact-meter"><div className="proj-impact-fill" style={{ width: `${p.impact || 50}%`, background: diffColors[diff] }} /></div>
                                        <div className="proj-fills" style={{ color: diffColors[diff] }}>→ Closes: {p.closesGap || 'Multiple skills'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
