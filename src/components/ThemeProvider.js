'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext('dark');
const ThemeSetContext = createContext(() => { });

export function useTheme() { return useContext(ThemeContext); }
export function useSetTheme() { return useContext(ThemeSetContext); }

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('system');
    const [resolved, setResolved] = useState('dark');

    // Load saved preference on mount
    useEffect(() => {
        const saved = localStorage.getItem('skillbridge-theme') || 'system';
        setThemeState(saved);
    }, []);

    // Resolve actual theme and apply to document
    useEffect(() => {
        let actual = theme;
        if (theme === 'system') {
            actual = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        setResolved(actual);
        document.documentElement.setAttribute('data-theme', actual);

        // Listen for system changes if set to system
        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e) => {
                const newTheme = e.matches ? 'dark' : 'light';
                setResolved(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            };
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, [theme]);

    const setTheme = useCallback((t) => {
        setThemeState(t);
        localStorage.setItem('skillbridge-theme', t);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, resolved }}>
            <ThemeSetContext.Provider value={setTheme}>
                {children}
            </ThemeSetContext.Provider>
        </ThemeContext.Provider>
    );
}
