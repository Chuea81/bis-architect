
import React, { useState, useEffect } from 'react';

interface BetaGateProps {
    children: React.ReactNode;
}

// --- CONFIGURATION ---
// CHANGE THIS STRING TO SET YOUR PASSWORD
const SECRET_KEY = "classic"; 
const STORAGE_KEY = "bis_architect_access_token";

export const BetaGate: React.FC<BetaGateProps> = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [input, setInput] = useState("");
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem(STORAGE_KEY);
        if (token === SECRET_KEY) {
            setIsUnlocked(true);
        }
        setIsLoading(false);
    }, []);

    const handleUnlock = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (input.trim() === SECRET_KEY) {
            localStorage.setItem(STORAGE_KEY, SECRET_KEY);
            setIsUnlocked(true);
            setError(false);
        } else {
            setError(true);
            setInput(""); // Clear input on fail
            
            // Reset error state after animation
            setTimeout(() => setError(false), 500);
        }
    };

    if (isLoading) return null; // Prevent flash of login screen

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[9999] font-roboto">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80"></div>
            
            <div className="relative z-10 w-full max-w-md p-8">
                <div className={`bg-[#0a0a0c] border-2 border-[#333] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 flex flex-col items-center gap-6 transition-transform duration-100 ${error ? 'translate-x-[-10px]' : ''}`}>
                    
                    {/* Header */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-[#111] border border-[#333] flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.1)] mb-2">
                            <span className="text-3xl">🗝️</span>
                        </div>
                        <h1 className="text-[#FFD700] font-cinzel text-2xl font-bold tracking-[0.2em] drop-shadow-md text-center">
                            RESTRICTED ACCESS
                        </h1>
                        <p className="text-[#666] text-xs font-bold tracking-widest text-center uppercase">
                            Enter the Rune Word to Enter the Sanctum
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
                        <div className="relative group">
                            <input 
                                type="password" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="PASSWORD"
                                className={`w-full bg-[#151515] border ${error ? 'border-red-500 animate-pulse' : 'border-[#333] focus:border-[#FFD700]'} rounded px-4 py-3 text-center text-[#e2e8f0] font-bold tracking-widest outline-none transition-colors placeholder-[#444]`}
                                autoFocus
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 hover:border-[#FFD700] text-[#FFD700] font-cinzel font-bold py-3 rounded tracking-[0.2em] transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                        >
                            UNLOCK
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-[9px] text-[#444] font-mono mt-2">
                        BiS ARCHITECT BETA v0.9
                    </div>
                </div>
            </div>
        </div>
    );
};
