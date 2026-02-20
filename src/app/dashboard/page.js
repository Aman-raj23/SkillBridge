'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import ScoreRing from '@/components/ScoreRing';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [analyses, setAnalyses] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }
        if (user) fetchData();
    }, [user, loading]);

    async function fetchData() {
        const { data } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setAnalyses(data || []);
        setLoadingData(false);
    }

    if (loading || loadingData) {
        return (
            <div className="page-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
                    <div>Loading your dashboard...</div>
                </div>
            </div>
        );
    }

    const latestScore = analyses.length > 0 && analyses[0].score ? analyses[0].score : null;
    const latestRole = analyses.length > 0 ? analyses[0].target_role : null;

    return (
        <div className="page-section" style={{ display: 'block' }}>
            <div className="page-inner">
                <div className="page-header">
                    <div className="page-eyebrow">Dashboard → Overview</div>
                    <div className="page-title">Welcome, <span>{profile?.full_name || user?.email?.split('@')[0] || 'User'}</span></div>
                    <div className="page-sub">Track your progress over time — past analyses, scores, and improvement trends.</div>
                </div>
                <div className="dash-grid">
                    <div>
                        <div className="card-label" style={{ marginBottom: 16 }}>Past Analyses</div>
                        {analyses.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No analyses yet</div>
                                <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>Run your first skill analysis to see results here.</div>
                                <Link href="/analyzer" className="btn-action" style={{ maxWidth: 300, margin: '0 auto', display: 'block', textAlign: 'center', textDecoration: 'none' }}>✦ Start Your First Analysis</Link>
                            </div>
                        ) : (
                            <div className="history-list">
                                {analyses.map((s) => {
                                    const results = s.results || {};
                                    const score = s.score || 0;
                                    const grad = score >= 70 ? 'var(--cyan),var(--green)' : score >= 50 ? 'var(--gold),var(--cyan)' : 'var(--red),var(--gold)';
                                    const skills = (results.strengths || []).slice(0, 4).map(n => ({ n, t: 'g' }));
                                    const missing = (results.gaps || []).slice(0, 3).map(g => ({ n: typeof g === 'string' ? g : g.skill || g, t: 'r' }));
                                    const dateStr = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    return (
                                        <div key={s.id} className="hist-card">
                                            <div className="hc-top"><div className="hc-role">{s.target_role}</div><div className="hc-date">{dateStr}</div></div>
                                            <div className="hc-row">
                                                <div className="hc-score" style={{ color: score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--gold)' : 'var(--red)' }}>{score}</div>
                                                <div className="hc-bar"><div className="hc-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg,${grad})` }} /></div>
                                            </div>
                                            <div className="hc-chips">
                                                {skills.map(sk => <span key={sk.n} className="hc-chip hcc-g">{sk.n}</span>)}
                                                {missing.map(sk => <span key={sk.n} className="hc-chip hcc-r">{sk.n}</span>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="dash-aside">
                        <div className="quick-stat">
                            <div className="qs-label">Current Score</div>
                            <div className="qs-val" style={{ color: 'var(--cyan)' }}>{latestScore ?? '—'}</div>
                            <div className="qs-sub">{latestRole || 'Run an analysis to see your score'}</div>
                        </div>
                        <div className="quick-stat">
                            <div className="qs-label">Total Analyses</div>
                            <div className="qs-val">{analyses.length}</div>
                            <div className="qs-sub">{analyses.length > 0 ? 'Keep improving!' : 'Run your first analysis →'}</div>
                        </div>
                        <div className="quick-stat">
                            <div className="qs-label">Quick Actions</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                <Link href="/analyzer" className="btn-action" style={{ marginTop: 0, fontSize: 13, padding: 12, textAlign: 'center', textDecoration: 'none' }}>✦ New Analysis</Link>
                                <Link href="/interview" className="btn-action" style={{ marginTop: 0, fontSize: 13, padding: 12, background: 'linear-gradient(135deg,var(--purple),var(--cyan))', textAlign: 'center', textDecoration: 'none' }}>🎤 Interview Prep</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
