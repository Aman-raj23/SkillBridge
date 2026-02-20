'use client';
import { useState } from 'react';

const roles = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
    'Cloud Architect', 'Mobile Developer', 'Cybersecurity Analyst',
    'Product Manager', 'UI/UX Designer', 'Blockchain Developer',
];

const durations = [
    { key: '1 week', label: '1 Week', icon: '⚡' },
    { key: '1 month', label: '1 Month', icon: '📅' },
    { key: '3 months', label: '3 Months', icon: '📆' },
    { key: '6 months', label: '6 Months', icon: '🗓' },
    { key: '1 year', label: '1 Year', icon: '🎯' },
];

const phaseColors = ['var(--cyan)', 'var(--green)', 'var(--gold)', 'var(--purple)', 'var(--red)', 'var(--cyan)', 'var(--green)', 'var(--gold)', 'var(--purple)', 'var(--red)'];
const priorityColors = { high: 'var(--red)', medium: 'var(--gold)', low: 'var(--green)' };

export default function RoadmapPage() {
    const [step, setStep] = useState('role'); // role → duration → loading → result
    const [role, setRole] = useState('');
    const [customRole, setCustomRole] = useState('');
    const [duration, setDuration] = useState('');
    const [roadmap, setRoadmap] = useState([]);
    const [loading, setLoading] = useState(false);

    async function generateRoadmap() {
        const selectedRole = role === 'custom' ? customRole : role;
        if (!selectedRole || !duration) return;
        setStep('loading');
        setLoading(true);
        try {
            const res = await fetch('/api/roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole, duration }),
            });
            const data = await res.json();
            setRoadmap(data.roadmap || []);
            setStep('result');
        } catch {
            setStep('duration');
        }
        setLoading(false);
    }

    function reset() { setStep('role'); setRole(''); setCustomRole(''); setDuration(''); setRoadmap([]); }

    return (
        <div className="page-section" style={{ display: 'block' }}>
            <div className="page-inner">
                <div className="page-header">
                    <div className="page-eyebrow">Core Features → Roadmap</div>
                    <div className="page-title">AI-Powered <span>Career Roadmap</span></div>
                    <div className="page-sub">Select your target role and timeframe — AI generates a personalized learning roadmap.</div>
                </div>

                {step === 'role' && (
                    <div className="card">
                        <div className="card-pad">
                            <div className="card-label">Step 1 — Select Your Target Role</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginTop: 16 }}>
                                {roles.map(r => (
                                    <button key={r} onClick={() => { setRole(r); setStep('duration'); }}
                                        style={{
                                            padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border-bright)',
                                            background: role === r ? 'var(--cyan-dim)' : 'var(--deep)', color: role === r ? 'var(--cyan)' : 'var(--text-1)',
                                            cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600,
                                            textAlign: 'left', transition: 'all .2s',
                                        }}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                                <input className="finput" value={customRole} onChange={e => setCustomRole(e.target.value)}
                                    placeholder="Or type a custom role..." style={{ flex: 1 }} />
                                <button className="btn-action" style={{ marginTop: 0, whiteSpace: 'nowrap' }}
                                    onClick={() => { if (customRole.trim()) { setRole('custom'); setStep('duration'); } }}
                                    disabled={!customRole.trim()}>
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'duration' && (
                    <div className="card">
                        <div className="card-pad">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="card-label">Step 2 — Select Duration</div>
                                <button onClick={() => setStep('role')} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>← Back to roles</button>
                            </div>
                            <div style={{ fontSize: 14, color: 'var(--cyan)', fontWeight: 600, marginBottom: 16 }}>
                                Role: {role === 'custom' ? customRole : role}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                                {durations.map(d => (
                                    <button key={d.key} onClick={() => { setDuration(d.key); }}
                                        style={{
                                            padding: '20px 16px', borderRadius: 14, border: `1px solid ${duration === d.key ? 'var(--cyan)' : 'var(--border-bright)'}`,
                                            background: duration === d.key ? 'var(--cyan-dim)' : 'var(--deep)', cursor: 'pointer',
                                            fontFamily: "'Syne',sans-serif", textAlign: 'center', transition: 'all .2s',
                                        }}>
                                        <div style={{ fontSize: 28, marginBottom: 8 }}>{d.icon}</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: duration === d.key ? 'var(--cyan)' : 'var(--text-1)' }}>{d.label}</div>
                                    </button>
                                ))}
                            </div>
                            <button className="btn-action" onClick={generateRoadmap} disabled={!duration} style={{ marginTop: 20 }}>
                                ✦ Generate Roadmap
                            </button>
                        </div>
                    </div>
                )}

                {step === 'loading' && (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>⟳</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--cyan)', marginTop: 16 }}>Generating your {duration} roadmap for {role === 'custom' ? customRole : role}...</div>
                        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>AI is crafting personalized phases and tasks</div>
                    </div>
                )}

                {step === 'result' && roadmap.length > 0 && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: "'DM Mono',monospace" }}>
                                    // {role === 'custom' ? customRole : role} · {duration} roadmap
                                </div>
                            </div>
                            <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-bright)', background: 'var(--deep)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 12, fontFamily: "'Syne',sans-serif" }}>
                                ↻ New Roadmap
                            </button>
                        </div>
                        <div className="timeline">
                            <div className="tl-spine" />
                            {roadmap.map((phase, i) => (
                                <div key={i} className="tl-entry">
                                    <div className="tl-node">
                                        <div className="tl-dot" style={{ background: phaseColors[i % phaseColors.length], boxShadow: `0 0 12px ${phaseColors[i % phaseColors.length]}` }} />
                                        {i < roadmap.length - 1 && <div className="tl-line" />}
                                    </div>
                                    <div className="tl-card">
                                        <div className="tl-head">
                                            <div className="tl-wk-info">
                                                <span className="tl-wk-num" style={{ color: phaseColors[i % phaseColors.length] }}>{phase.phase || `Phase ${i + 1}`}</span>
                                                <span className="tl-wk-title">{phase.title}</span>
                                            </div>
                                            {phase.duration && <span className="status-pill sp-next">{phase.duration}</span>}
                                        </div>
                                        {phase.description && <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>{phase.description}</div>}
                                        <div className="tl-tasks">
                                            {(phase.tasks || []).map((t, j) => (
                                                <div key={j} className="tl-task" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ color: priorityColors[t.priority] || 'var(--text-3)', fontSize: 10 }}>
                                                        {t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢'}
                                                    </span>
                                                    {t.text}
                                                </div>
                                            ))}
                                        </div>
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
