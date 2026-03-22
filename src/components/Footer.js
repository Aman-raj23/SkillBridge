import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <div className="foot-inner">
                <div className="foot-top">
                    <div>
                        <div className="foot-logo"><div className="logo-mark">S</div>SkillBridge AI</div>
                        <div className="foot-tag">Connecting Education to Industry Skills</div>
                    </div>
                    <div className="foot-cols">
                        <div className="foot-col">
                            <h5>Products</h5>
                            <Link href="/analyzer">Skill Core</Link>
                            <Link href="/resume">Resume Builder</Link>
                            <Link href="/tracker">Job Tracker</Link>
                            <Link href="/roadmap">Roadmap</Link>
                            <Link href="/projects">Project Ideas</Link>
                            <Link href="/interview">Interview Prep</Link>
                        </div>
                        <div className="foot-col">
                            <h5>Stack</h5>
                            <a>Next.js 14</a>
                            <a>Supabase</a>
                            <a>GPT-4o</a>
                            <a>Vanilla CSS</a>
                        </div>
                        <div className="foot-col">
                            <h5>Company</h5>
                            <a>GitHub</a>
                            <a>Privacy</a>
                            <a>Terms</a>
                            <a>Contact</a>
                        </div>
                    </div>
                </div>
                <div className="foot-bot">
                    <div className="foot-copy">© 2026 SkillBridge AI — Connecting Education to Industry Skills</div>
                    <div className="tech-tags">
                        <span className="tech-tag">Next.js</span>
                        <span className="tech-tag">Supabase</span>
                        <span className="tech-tag">GPT-4o</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
