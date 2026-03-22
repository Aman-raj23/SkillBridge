'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) router.push('/dashboard');
    }, [user, router]);

    if (user) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setStatus(isSignUp ? 'Creating account...' : 'Signing in...');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName },
                    },
                });
                if (error) {
                    setError(error.message);
                    setStatus('');
                    return;
                }
                setStatus('Account created! Redirecting...');
                setTimeout(() => router.push('/dashboard'), 1000);
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    setError(error.message);
                    setStatus('');
                    return;
                }
                setStatus('Welcome back! Redirecting...');
                setTimeout(() => router.push('/dashboard'), 500);
            }
        } catch (err) {
            setError('Could not connect to auth server. Your Supabase project may be paused — check supabase.com/dashboard and resume it.');
            setStatus('');
        }
    }

    async function handleGitHub() {
        setStatus('Redirecting to GitHub...');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) {
            setError(error.message);
            setStatus('');
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <Link href="/" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div className="nav-logo" style={{ fontSize: 20 }}>
                        <div className="logo-mark" style={{ width: 32, height: 32, fontSize: 16 }}>S</div>
                        SkillBridge <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>AI</span>
                    </div>
                </Link>
                <div className="login-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</div>
                <div className="login-sub">{isSignUp ? 'Start your career intelligence journey' : 'Sign in to access your dashboard'}</div>
                <button className="btn-github" onClick={handleGitHub} disabled={!!status}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                    Continue with GitHub
                </button>
                <div className="login-divider">or continue with email</div>
                {error && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.2)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="field">
                            <label className="flabel">Full Name</label>
                            <input className="finput" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
                        </div>
                    )}
                    <div className="field"><label className="flabel">Email</label><input className="finput" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required /></div>
                    <div className="field"><label className="flabel">Password</label><input className="finput" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required /></div>
                    <button type="submit" className="btn-action" disabled={!!status}>{status || (isSignUp ? 'Create Account →' : 'Sign In →')}</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-2)' }}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <span style={{ color: 'var(--cyan)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setIsSignUp(!isSignUp); setError(''); setStatus(''); }}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </span>
                </div>
            </div>
        </div>
    );
}
