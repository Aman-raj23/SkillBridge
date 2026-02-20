'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

const questionBank = {
    technical: [
        'Explain the difference between REST and GraphQL APIs.',
        'What is the event loop in Node.js and how does it work?',
        'Describe the SOLID principles in software design.',
        'How does React reconciliation (Virtual DOM diffing) work?',
        'What are database indexes and when would you use them?',
        'Explain the CAP theorem in distributed systems.',
        'What is the difference between SQL and NoSQL databases?',
        'How do you handle state management in large React apps?',
        'Explain microservices architecture vs monolithic.',
        'What is a WebSocket and when would you use it?',
    ],
    behavioral: [
        'Tell me about a time you dealt with a difficult team member.',
        'Describe a project where you had to learn a new technology quickly.',
        'How do you handle tight deadlines and pressure?',
        'Tell me about a time you made a mistake and how you fixed it.',
        'How do you prioritize tasks when managing multiple projects?',
        'Describe a time when you disagreed with your manager.',
        'How do you stay up to date with new technologies?',
        'Tell me about your most challenging project.',
    ],
    coding: [
        'How would you implement a debounce function in JavaScript?',
        'Write a function to detect if a linked list has a cycle.',
        'How would you design a URL shortener?',
        'Implement a basic LRU cache.',
        'Write a function to flatten a deeply nested array.',
        'How would you find the longest common substring?',
        'Implement a promise-based retry mechanism.',
        'Design a basic pub/sub event system.',
    ],
};

const hints = {
    'Explain the difference between REST and GraphQL APIs.': 'Think about how data fetching differs: REST has multiple endpoints, GraphQL has one with flexible queries.',
    'What is the event loop in Node.js and how does it work?': 'Cover the call stack, callback queue, microtask queue, and how async operations are handled.',
    'Describe the SOLID principles in software design.': 'S = Single Responsibility, O = Open/Closed, L = Liskov Substitution, I = Interface Segregation, D = Dependency Inversion.',
    'How does React reconciliation (Virtual DOM diffing) work?': 'React creates a virtual DOM tree, diffs it against the previous one, and batches minimal DOM updates.',
};

export default function InterviewPage() {
    const { user } = useAuth();
    const [questionType, setQuestionType] = useState('technical');
    const [currentQ, setCurrentQ] = useState(null);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [emptyWarn, setEmptyWarn] = useState(false);
    const [stats, setStats] = useState({ answered: 0, strong: 0, practice: 0 });
    const [sessionHistory, setSessionHistory] = useState([]);

    // Load stats from Supabase
    useEffect(() => {
        if (!user) return;
        async function loadStats() {
            const { data } = await supabase
                .from('interview_sessions')
                .select('score')
                .eq('user_id', user.id);
            if (data) {
                setStats({
                    answered: data.length,
                    strong: data.filter(d => d.score >= 70).length,
                    practice: data.filter(d => d.score < 50).length,
                });
            }
        }
        loadStats();
    }, [user]);

    function generateQuestion() {
        const pool = questionBank[questionType] || questionBank.technical;
        const q = pool[Math.floor(Math.random() * pool.length)];
        setCurrentQ(q);
        setAnswer('');
        setFeedback(null);
        setShowHint(false);
        setEmptyWarn(false);
    }

    async function submitAnswer() {
        if (!answer.trim()) { setEmptyWarn(true); return; }
        setEmptyWarn(false);
        setFeedbackLoading(true);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: currentQ, answer, type: questionType }),
            });
            const data = await res.json();
            setFeedback(data);

            const score = data.score || 50;
            setStats(prev => ({
                answered: prev.answered + 1,
                strong: score >= 70 ? prev.strong + 1 : prev.strong,
                practice: score < 50 ? prev.practice + 1 : prev.practice,
            }));
            setSessionHistory(prev => [...prev, { question: currentQ, score }]);

            // Save to Supabase
            if (user) {
                await supabase.from('interview_sessions').insert({
                    user_id: user.id,
                    question_type: questionType,
                    question: currentQ,
                    answer,
                    score: data.score || 50,
                    feedback: data.feedback || '',
                });
            }
        } catch {
            setFeedback({ score: 50, feedback: 'Could not connect to AI. Practice offline and try again later.' });
        }
        setFeedbackLoading(false);
    }

    return (
        <div className="page-section" style={{ display: 'block' }}>
            <div className="page-inner">
                <div className="page-header">
                    <div className="page-eyebrow">Products → Interview Prep</div>
                    <div className="page-title">Interview <span>Prep AI</span></div>
                    <div className="page-sub">Practice with AI-evaluated questions — technical, behavioral, and coding.
                        {!user && <span style={{ color: 'var(--gold)', fontSize: 12 }}> · <Link href="/login" style={{ color: 'var(--cyan)' }}>Sign in</Link> to save progress</span>}
                    </div>
                </div>

                <div className="analyze-grid">
                    <div className="card">
                        <div className="card-pad">
                            <div className="card-label">Question Type</div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                                {['technical', 'behavioral', 'coding'].map(t => (
                                    <button key={t} className={`stab ${questionType === t ? 'active' : ''}`} onClick={() => { setQuestionType(t); setCurrentQ(null); setFeedback(null); }} style={{ textTransform: 'capitalize' }}>{t === 'technical' ? '🔧' : t === 'behavioral' ? '🧠' : '💻'} {t}</button>
                                ))}
                            </div>

                            <button className="btn-action" onClick={generateQuestion} style={{ marginTop: 0 }}>🎲 Generate Question</button>

                            {currentQ && (
                                <div style={{ marginTop: 20 }}>
                                    <div style={{ padding: 20, background: 'var(--deep)', borderRadius: 12, border: '1px solid var(--border-bright)', marginBottom: 16 }}>
                                        <div style={{ fontSize: 11, color: 'var(--cyan)', fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>// {questionType} question</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>{currentQ}</div>
                                        {hints[currentQ] && (
                                            <div style={{ marginTop: 12 }}>
                                                <button onClick={() => setShowHint(!showHint)} style={{ fontSize: 11, color: 'var(--gold)', background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>💡 {showHint ? 'Hide Hint' : 'Show Hint'}</button>
                                                {showHint && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--gold)', fontStyle: 'italic' }}>{hints[currentQ]}</div>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label className="flabel">Your Answer</label>
                                        <textarea className="ftextarea" rows={6} value={answer} onChange={e => { setAnswer(e.target.value); setEmptyWarn(false); }} placeholder="Type your answer here..." style={emptyWarn ? { borderColor: 'var(--red)' } : {}} />
                                        {emptyWarn && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>Please type your answer before submitting.</div>}
                                    </div>
                                    <button className="btn-action" onClick={submitAnswer} disabled={feedbackLoading}>{feedbackLoading ? '⟳ Evaluating...' : '✦ Submit for AI Feedback'}</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-pad">
                            <div className="card-label">Session Stats</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                                <div style={{ textAlign: 'center', padding: 14, background: 'var(--deep)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan)' }}>{stats.answered}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Answered</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 14, background: 'var(--deep)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{stats.strong}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Strong</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 14, background: 'var(--deep)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold)' }}>{stats.practice}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Practice More</div>
                                </div>
                            </div>

                            <div className="card-label" style={{ color: 'var(--cyan)' }}>✦ AI Feedback</div>
                            {feedbackLoading ? (
                                <div style={{ textAlign: 'center', padding: 32 }}>
                                    <div style={{ fontSize: 24, animation: 'spin 1s linear infinite' }}>⟳</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>Evaluating your answer...</div>
                                </div>
                            ) : feedback ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: 16, background: 'var(--deep)', borderRadius: 12, border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: 36, fontWeight: 800, color: (feedback.score || 50) >= 70 ? 'var(--green)' : (feedback.score || 50) >= 50 ? 'var(--gold)' : 'var(--red)' }}>{feedback.score || 50}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>/100</div>
                                    </div>
                                    <div className="ai-strip">
                                        <div className="ai-icon-box">✦</div>
                                        <div className="ai-text" style={{ whiteSpace: 'pre-wrap' }}>{feedback.feedback || 'Good attempt! Keep practicing to improve.'}</div>
                                    </div>
                                    {feedback.improvements && feedback.improvements.length > 0 && (
                                        <div style={{ marginTop: 12 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>Areas to Improve:</div>
                                            {feedback.improvements.map((imp, i) => (
                                                <div key={i} className="ai-strip" style={{ marginBottom: 6 }}>
                                                    <div className="ai-icon-box" style={{ background: 'var(--gold)', color: 'var(--void)' }}>!</div>
                                                    <div className="ai-text">{imp}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>
                                    <div style={{ fontSize: 32, marginBottom: 12 }}>🎤</div>
                                    <div>Generate a question and submit your answer to receive AI feedback.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
