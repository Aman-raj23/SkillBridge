import './globals.css';
import Navbar from '@/components/Navbar';
import ParticleCanvas from '@/components/ParticleCanvas';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'SkillBridge AI — Connecting Education to Industry Skills',
  description: 'AI-powered career intelligence platform. Upload your resume, set your target role, and get a precise readiness score, skill gap analysis, personalized roadmap, and interview prep — powered by GPT-4o.',
  keywords: 'skill gap analysis, resume analyzer, career roadmap, interview prep, AI career tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <ParticleCanvas />
              <Navbar />
              <main style={{ position: 'relative', zIndex: 1 }}>
                {children}
              </main>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
        </svg>
      </body>
    </html>
  );
}
