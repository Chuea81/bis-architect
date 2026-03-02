
import React from 'react';

interface ConfirmationModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onCancel}>
            <div 
                className="bg-[#0f0f12] border border-red-500/50 w-full max-w-md rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] bg-[#151515] flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <h2 className="text-red-500 font-cinzel text-lg tracking-[0.15em] font-bold">CONFIRMATION</h2>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <p className="text-[#e2e8f0] text-sm leading-relaxed font-bold">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#111] border-t border-[#222] flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3 bg-[#222] hover:bg-[#333] text-[#888] hover:text-white font-bold text-xs rounded transition-colors uppercase tracking-widest border border-[#333]"
                    >
                        Abort
                    </button>
                    <button 
                        onClick={() => { onConfirm(); }}
                        className="flex-1 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 hover:text-red-400 font-bold text-xs rounded transition-colors uppercase tracking-widest border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                    >
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
};
