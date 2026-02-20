'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toast, setToast] = useState({ show: false, icon: '', msg: '' });

    const showToast = useCallback((icon, msg) => {
        setToast({ show: true, icon, msg });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3200);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className={`toast ${toast.show ? 'show' : ''}`}>
                <span>{toast.icon}</span>
                <span>{toast.msg}</span>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
