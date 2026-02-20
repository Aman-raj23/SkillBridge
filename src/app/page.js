import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="page-section" style={{ display: 'block' }}>
      {/* HERO */}
      <div className="hero">
        <div className="hero-grid"></div>
        <div className="glow-orb orb1"></div>
        <div className="glow-orb orb2"></div>
        <div className="glow-orb orb3"></div>
        <div className="eyebrow"><span className="eye-dot"></span>AI-Powered Career Intelligence Platform</div>
        <h1 className="hero-h1">
          From student<br />to <span className="grad-text">industry-ready</span>
        </h1>
        <p className="hero-sub">Upload your resume. Set your target role. Get a precise readiness score, skill gap analysis, personalized roadmap, and interview prep — powered by Gemini AI.</p>
        <div className="hero-btns">
          <Link href="/analyzer" className="btn-primary">✦ Analyze My Resume <span>→</span></Link>
          <Link href="/dashboard" className="btn-outline">View Dashboard</Link>
        </div>
        <div className="hero-stats">
          <div className="h-stat"><div className="h-sv"><span>94</span>%</div><div className="h-sl">Skill Match Accuracy</div></div>
          <div className="h-stat"><div className="h-sv"><span>AI</span></div><div className="h-sl">Personalized Roadmap</div></div>
          <div className="h-stat"><div className="h-sv"><span>Gemini</span></div><div className="h-sl">AI Engine</div></div>
          <div className="h-stat"><div className="h-sv"><span>∞</span></div><div className="h-sl">Reports Saved</div></div>
        </div>
      </div>

      {/* Ticker */}
      <div className="ticker">
        <div className="ticker-track">
          {['Skill Core', 'Resume Builder', 'Job Tracker', 'AI Gap Analysis', 'Roadmap', 'Project Recommender', 'Interview Prep', 'Technical Questions', 'HR Questions', 'Coding Questions', 'Dashboard History',
            'Skill Core', 'Resume Builder', 'Job Tracker', 'AI Gap Analysis', 'Roadmap', 'Project Recommender', 'Interview Prep', 'Technical Questions', 'HR Questions', 'Coding Questions', 'Dashboard History'
          ].map((item, i) => <div key={i} className="tick-item">{item}</div>)}
        </div>
      </div>

      {/* Features */}
      <div className="features-row">
        <Link href="/analyzer" className="feat-card fc1">
          <div className="feat-icon">🎯</div>
          <div className="feat-title">Skill Core Analyzer</div>
          <div className="feat-desc">Upload your resume + target role. AI extracts your skills, identifies critical gaps, and scores your readiness from 0–100 instantly.</div>
          <div className="feat-link">Open Analyzer →</div>
        </Link>
        <Link href="/resume" className="feat-card fc2">
          <div className="feat-icon">📝</div>
          <div className="feat-title">Resume Builder + AI Suggestions</div>
          <div className="feat-desc">Build or paste your resume and get AI-powered improvement suggestions — phrasing, missing keywords, ATS optimization.</div>
          <div className="feat-link" style={{ color: 'var(--purple)' }}>Open Builder →</div>
        </Link>
        <Link href="/tracker" className="feat-card fc3">
          <div className="feat-icon">📋</div>
          <div className="feat-title">Job Application Tracker</div>
          <div className="feat-desc">Track every application, stage, and match score in a Kanban board. Never lose track of where you stand across companies.</div>
          <div className="feat-link" style={{ color: 'var(--gold)' }}>Open Tracker →</div>
        </Link>
      </div>

      {/* How It Works */}
      <div className="hiw">
        <div className="section-header">
          <div className="overline">The Process</div>
          <h2 className="sec-title">From upload to offer-ready</h2>
          <p className="sec-sub">Five intelligent steps that turn your profile into a concrete action plan for any target role.</p>
        </div>
        <div className="process-grid">
          <div className="p-step"><div className="p-num">01 — UPLOAD</div><div className="p-icon">📄</div><div className="p-title">Resume + Role Input</div><div className="p-desc">Drop your PDF or paste text. Set target role & company. Under 30 seconds.</div></div>
          <div className="p-step"><div className="p-num">02 — ANALYZE</div><div className="p-icon">⚡</div><div className="p-title">AI Gap Analysis</div><div className="p-desc">Gemini AI extracts skills, maps gaps, and produces a precise readiness score with breakdown.</div></div>
          <div className="p-step"><div className="p-num">03 — PLAN</div><div className="p-icon">🗺️</div><div className="p-title">AI Career Roadmap</div><div className="p-desc">Pick your role, choose a timeframe, and get a personalized roadmap with prioritized tasks and milestones.</div></div>
          <div className="p-step"><div className="p-num">04 — BUILD</div><div className="p-icon">🔨</div><div className="p-title">Project Recommender</div><div className="p-desc">Beginner to Advanced projects hand-picked to close your exact skill gaps and impress interviewers.</div></div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-sec">
        <div className="cta-glow"></div>
        <div className="overline" style={{ justifyContent: 'center' }}>Start Free · No credit card</div>
        <h2>Stop guessing.<br />Start <em>closing gaps</em>.</h2>
        <p>Join thousands of engineers using SkillBridge to land roles at Google, Stripe, Vercel and top startups.</p>
        <div className="email-row">
          <input className="email-inp" type="email" placeholder="your@email.com" />
          <button className="email-btn">Get Early Access →</button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
