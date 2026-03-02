
import React, { useState } from 'react';
import { signInAdmin, signOutAdmin } from '../services/firestore';

interface AdminLoginModalProps {
    onLogin: (success: boolean) => void;
    onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onLogin, onClose }) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await signInAdmin();
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            if (adminEmail && result.user.email === adminEmail) {
                onLogin(true);
            } else {
                setError("ACCESS DENIED — account not authorized");
                await signOutAdmin();
            }
        } catch (e: any) {
            if (e.code === 'auth/popup-closed-by-user') {
                setError("");
            } else {
                setError("Authentication failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-sm p-6" onClick={onClose}>
            <div
                className="bg-[#0f0f12] border border-red-500/50 w-full max-w-sm rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] bg-[#151515] flex justify-between items-center">
                    <h2 className="text-red-500 font-cinzel text-lg tracking-[0.15em] font-bold flex items-center gap-2">
                        <span>🔒</span> SECURITY CLEARANCE
                    </h2>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4 bg-[#0a0a0c]">
                    <p className="text-[10px] text-[#666] font-bold tracking-widest uppercase text-center">
                        Authenticate via Google to access the Database Editor
                    </p>

                    {error && (
                        <div className="text-red-500 text-xs font-bold text-center bg-red-900/10 py-2 rounded border border-red-900/30 animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="mt-2 w-full py-3 bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 hover:border-red-500 text-red-500 hover:text-white font-cinzel font-bold tracking-widest rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? "AUTHENTICATING..." : "SIGN IN WITH GOOGLE"}
                    </button>
                </div>
            </div>
        </div>
    );
};
