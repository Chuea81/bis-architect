
import React, { useState, useEffect, useCallback } from 'react';

interface ToastMessage {
    id: number;
    text: string;
    type: 'info' | 'error' | 'success';
}

let _toastId = 0;

/** Call from anywhere — React components, Zustand stores, plain functions */
export const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    window.dispatchEvent(new CustomEvent('bis-toast', { detail: { text, type } }));
};

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((e: Event) => {
        const { text, type } = (e as CustomEvent).detail;
        const id = ++_toastId;
        setToasts(prev => [...prev, { id, text, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    useEffect(() => {
        window.addEventListener('bis-toast', addToast);
        return () => window.removeEventListener('bis-toast', addToast);
    }, [addToast]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`pointer-events-auto px-4 py-3 rounded border shadow-lg text-sm font-bold tracking-wide animate-in slide-in-from-right duration-200 max-w-sm
                        ${t.type === 'error'
                            ? 'bg-red-950/90 border-red-500/50 text-red-300'
                            : t.type === 'success'
                                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                                : 'bg-[#111]/90 border-cyan-500/50 text-cyan-300'
                        } backdrop-blur-sm`}
                >
                    {t.text}
                </div>
            ))}
        </div>
    );
};
