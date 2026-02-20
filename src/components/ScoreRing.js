'use client';
import { useEffect, useRef, useState } from 'react';

export default function ScoreRing({ score = 0, label = 'STRONG' }) {
    const [displayScore, setDisplayScore] = useState(0);
    const circumference = 2 * Math.PI * 70; // r=70
    const offset = circumference - (score / 100) * circumference;

    useEffect(() => {
        let n = 0;
        const timer = setInterval(() => {
            n++;
            setDisplayScore(Math.min(Math.round(n * (score / 100)), score));
            if (n >= 100) clearInterval(timer);
        }, 18);
        return () => clearInterval(timer);
    }, [score]);

    const grade = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'STRONG' : score >= 40 ? 'MODERATE' : 'NEEDS WORK';

    return (
        <div className="ring-wrap" style={{ marginBottom: 24 }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
                <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00e5ff" />
                        <stop offset="100%" stopColor="#00ff88" />
                    </linearGradient>
                </defs>
                <circle className="ring-track" cx="80" cy="80" r="70" />
                <circle
                    className="ring-fill"
                    cx="80" cy="80" r="70"
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                />
            </svg>
            <div className="ring-center">
                <div className="ring-num">{displayScore}</div>
                <div className="ring-sub">/100</div>
                <div className="ring-grade">{grade}</div>
            </div>
        </div>
    );
}
