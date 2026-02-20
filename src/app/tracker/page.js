'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

const columns = [
    { key: 'saved', title: 'Saved', color: 'var(--text-3)' },
    { key: 'applied', title: 'Applied', color: 'var(--cyan)' },
    { key: 'interviewing', title: 'Interviewing', color: 'var(--gold)' },
    { key: 'offer', title: 'Offer / Closed', color: 'var(--green)' },
];

export default function TrackerPage() {
    const { user, loading: authLoading } = useAuth();
    const [jobs, setJobs] = useState({ saved: [], applied: [], interviewing: [], offer: [] });
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!user) { setLoadingData(false); return; }
        fetchJobs();
    }, [user]);

    async function fetchJobs() {
        const { data } = await supabase
            .from('jobs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        const grouped = { saved: [], applied: [], interviewing: [], offer: [] };
        (data || []).forEach(j => {
            const col = grouped[j.status] ? j.status : 'saved';
            grouped[col].push(j);
        });
        setJobs(grouped);
        setLoadingData(false);
    }

    async function addJob(col) {
        const company = prompt('Company name:');
        const role = prompt('Role title:');
        if (!company || !role) return;

        if (user) {
            const { data } = await supabase.from('jobs').insert({
                user_id: user.id,
                company, role, status: col,
                match_score: Math.floor(Math.random() * 40) + 50,
            }).select().single();
            if (data) setJobs(prev => ({ ...prev, [col]: [data, ...prev[col]] }));
        } else {
            const newJob = { id: Date.now().toString(), company, role, status: col, match_score: Math.floor(Math.random() * 40) + 50, created_at: new Date().toISOString() };
            setJobs(prev => ({ ...prev, [col]: [newJob, ...prev[col]] }));
        }
    }

    async function removeJob(col, id) {
        if (user) await supabase.from('jobs').delete().eq('id', id);
        setJobs(prev => ({ ...prev, [col]: prev[col].filter(j => j.id !== id) }));
    }

    async function moveJob(fromCol, toCol, id) {
        const job = jobs[fromCol].find(j => j.id === id);
        if (!job) return;
        if (user) await supabase.from('jobs').update({ status: toCol, updated_at: new Date().toISOString() }).eq('id', id);
        setJobs(prev => ({
            ...prev,
            [fromCol]: prev[fromCol].filter(j => j.id !== id),
            [toCol]: [{ ...job, status: toCol }, ...prev[toCol]],
        }));
    }

    const colKeys = columns.map(c => c.key);

    if (authLoading || loadingData) {
        return (
            <div className="page-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>Loading your jobs...</div>
            </div>
        );
    }

    return (
        <div className="page-section" style={{ display: 'block' }}>
            <div className="page-inner">
                <div className="page-header">
                    <div className="page-eyebrow">Products → Job Tracker</div>
                    <div className="page-title">Job Application <span>Tracker</span></div>
                    <div className="page-sub">
                        Track every application stage — all in one Kanban board.
                        {!user && <span style={{ color: 'var(--gold)', fontSize: 12 }}> · <Link href="/login" style={{ color: 'var(--cyan)' }}>Sign in</Link> to save</span>}
                    </div>
                </div>
                <div className="tracker-board">
                    {columns.map((col, colIdx) => (
                        <div key={col.key} className="tracker-col">
                            <div className="tcol-header">
                                <div className="tcol-title"><div className="tcol-dot" style={{ background: col.color }} />{col.title}</div>
                                <div className="tcol-count">{jobs[col.key].length}</div>
                            </div>
                            {jobs[col.key].map(job => {
                                const matchLevel = (job.match_score || 50) >= 75 ? 'high' : (job.match_score || 50) >= 55 ? 'mid' : 'low';
                                return (
                                    <div key={job.id} className="job-card" style={col.key === 'applied' ? { borderColor: 'rgba(0,229,255,0.15)' } : col.key === 'interviewing' ? { borderColor: 'rgba(255,209,102,0.2)' } : {}}>
                                        <div className="jc-company">{job.company}</div>
                                        <div className="jc-role">{job.role}</div>
                                        <div className="jc-meta">
                                            <div className="jc-date">{new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                            <div className={`jc-match match-${matchLevel}`}>{job.match_score || 50}% match</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                            {colIdx < colKeys.length - 1 && (
                                                <button style={{ flex: 1, padding: '4px 8px', fontSize: 10, background: 'rgba(0,229,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}
                                                    onClick={() => moveJob(col.key, colKeys[colIdx + 1], job.id)}>
                                                    → {columns[colIdx + 1].title}
                                                </button>
                                            )}
                                            <button style={{ padding: '4px 8px', fontSize: 10, background: 'rgba(255,69,58,0.1)', color: 'var(--red)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}
                                                onClick={() => removeJob(col.key, job.id)}>
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {col.key === 'offer' && jobs.offer.length === 0 && (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No offers yet — keep going! 💪</div>
                            )}
                            <button className="add-job-btn" onClick={() => addJob(col.key)}>+ Add {col.key === 'offer' ? 'Offer' : 'Job'}</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
