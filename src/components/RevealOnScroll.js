'use client';
import { useEffect, useRef } from 'react';

export default function RevealOnScroll({ children, className = '', delay = '' }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            },
            { threshold: 0.08 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`reveal ${delay} ${className}`}>
            {children}
        </div>
    );
}
