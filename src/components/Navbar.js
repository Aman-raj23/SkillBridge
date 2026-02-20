'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useTheme, useSetTheme } from './ThemeProvider';

const products = [
    { href: '/analyzer', icon: '🎯', bg: 'rgba(0,229,255,0.1)', name: 'Skill Core', desc: 'Resume + Gap Analyzer' },
    { href: '/resume', icon: '📝', bg: 'rgba(167,139,250,0.1)', name: 'Resume Builder', desc: 'AI improvement suggestions' },
    { href: '/tracker', icon: '📋', bg: 'rgba(255,209,102,0.1)', name: 'Job Tracker', desc: 'Track applications & matches' },
    { sep: true },
    { href: '/roadmap', icon: '🗺️', bg: 'rgba(0,255,136,0.1)', name: 'Roadmap', desc: 'AI-powered career roadmap' },
    { href: '/projects', icon: '⚡', bg: 'rgba(255,77,109,0.1)', name: 'Project Recommender', desc: 'Beginner → Advanced' },
    { href: '/interview', icon: '🎤', bg: 'rgba(255,209,102,0.1)', name: 'Interview Prep', desc: 'Technical · HR · Coding' },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const wrapRef = useRef(null);
    const userRef = useRef(null);
    const pathname = usePathname();
    const router = useRouter();
    const { user, profile, loading, signOut } = useAuth();
    const { theme } = useTheme();
    const setTheme = useSetTheme();

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
            if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    async function handleSignOut() {
        await signOut();
        setUserMenuOpen(false);
        router.push('/');
    }

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <nav>
            <Link href="/" className="nav-logo">
                <div className="logo-mark">S</div>
                SkillBridge <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>AI</span>
            </Link>

            <div className="nav-center">
                <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>

                <div className="dropdown-wrap" ref={wrapRef}>
                    <button className={`dropdown-btn ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
                        Products <span className="chevron">▾</span>
                    </button>
                    <div className={`dropdown-menu ${open ? 'open' : ''}`}>
                        {products.map((item, i) =>
                            item.sep ? <div key={i} className="dd-separator" /> : (
                                <Link key={i} href={item.href} className="dd-item" onClick={() => setOpen(false)}>
                                    <div className="dd-icon" style={{ background: item.bg }}>{item.icon}</div>
                                    <div className="dd-info"><h5>{item.name}</h5><p>{item.desc}</p></div>
                                </Link>
                            )
                        )}
                    </div>
                </div>

                <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            </div>

            <div className="nav-right">
                <div className="theme-toggle">
                    <button className={`theme-opt ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} title="Light mode">☀️</button>
                    <button className={`theme-opt ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')} title="System default">🖥️</button>
                    <button className={`theme-opt ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} title="Dark mode">🌙</button>
                </div>

                {!loading && user ? (
                    <div className="dropdown-wrap" ref={userRef} style={{ position: 'relative' }}>
                        <button
                            className="user-avatar-btn"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--cyan), var(--green))',
                                border: 'none', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 800, color: 'var(--void)',
                            }}
                        >
                            {initials}
                        </button>
                        {userMenuOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220,
                                background: 'var(--surface)', border: '1px solid var(--border-bright)',
                                borderRadius: 14, padding: 8, zIndex: 100,
                                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                            }}>
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{displayName}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'DM Mono',monospace" }}>{user.email}</div>
                                </div>
                                <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                                    style={{ display: 'block', padding: '10px 14px', fontSize: 13, color: 'var(--text-2)', borderRadius: 8, transition: 'background .15s' }}>
                                    📊 Dashboard
                                </Link>
                                <Link href="/resume" onClick={() => setUserMenuOpen(false)}
                                    style={{ display: 'block', padding: '10px 14px', fontSize: 13, color: 'var(--text-2)', borderRadius: 8 }}>
                                    📝 My Resume
                                </Link>
                                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                                <button onClick={handleSignOut}
                                    style={{
                                        width: '100%', padding: '10px 14px', fontSize: 13, color: 'var(--red)',
                                        background: 'transparent', border: 'none', textAlign: 'left',
                                        cursor: 'pointer', borderRadius: 8, fontFamily: "'Syne',sans-serif",
                                    }}>
                                    ↗ Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : !loading ? (
                    <>
                        <Link href="/login" className="btn-ghost">Sign in</Link>
                        <Link href="/analyzer" className="btn-nav-cta">Get Started →</Link>
                    </>
                ) : null}
            </div>
        </nav>
    );
}
