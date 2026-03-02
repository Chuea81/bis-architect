
import React, { useState } from 'react';

interface OracleAutoEquipProps {
    onClose: () => void;
    onAutoEquip: (sources: string[], phase: number, mode: 'PvE' | 'PvP', onProgress?: (slot: string, index: number, total: number) => void) => Promise<void>;
}

const SOURCES = [
    { id: "Dungeons", label: "DUNGEONS", icon: "🗝️", color: "text-blue-400" },
    { id: "MC", label: "MOLTEN CORE", icon: "🔥", color: "text-orange-500" },
    { id: "BWL", label: "BLACKWING LAIR", icon: "🐲", color: "text-red-500" },
    { id: "ZG", label: "ZUL'GURUB", icon: "🐍", color: "text-green-500" },
    { id: "AQ20", label: "AQ20", icon: "🏜️", color: "text-amber-500" },
    { id: "AQ40", label: "AQ40", icon: "👁️", color: "text-yellow-500" },
    { id: "Naxx", label: "NAXXRAMAS", icon: "💀", color: "text-purple-500" },
    { id: "PvP / World", label: "PVP / WORLD / CRAFTED", icon: "⚔️", color: "text-red-400" },
];

const PHASES = [
    { id: 1, label: "P1", desc: "MC/Ony" },
    { id: 2, label: "P2", desc: "DM/World" },
    { id: 3, label: "P3", desc: "BWL" },
    { id: 4, label: "P4", desc: "ZG" },
    { id: 5, label: "P5", desc: "AQ" },
    { id: 6, label: "P6", desc: "Naxx" },
];

export const OracleAutoEquip: React.FC<OracleAutoEquipProps> = ({ onClose, onAutoEquip }) => {
    const [selectedSources, setSelectedSources] = useState<string[]>(SOURCES.map(s => s.id));
    const [selectedPhase, setSelectedPhase] = useState(6);
    const [selectedMode, setSelectedMode] = useState<'PvE' | 'PvP'>('PvE');
    const [isCalculating, setIsCalculating] = useState(false);
    const [progressSlot, setProgressSlot] = useState("");
    const [progressIndex, setProgressIndex] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);

    const toggleSource = (id: string) => {
        setSelectedSources(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleEquip = async () => {
        setIsCalculating(true);
        try {
            await onAutoEquip(selectedSources, selectedPhase, selectedMode, (slot, index, total) => {
                setProgressSlot(slot);
                setProgressIndex(index);
                setProgressTotal(total);
            });
            onClose();
        } catch (e) {
            console.error(e);
            setIsCalculating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-6" onClick={isCalculating ? undefined : onClose}>
            <div
                className="bg-[#0f0f12] border border-cyan-500/30 w-full max-w-2xl rounded-lg shadow-[0_0_60px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0e7490_0%,_transparent_60%)] opacity-20 pointer-events-none"></div>

                {/* Header */}
                <div className="px-6 py-6 border-b border-[#222] bg-[#151515] relative z-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-cyan-400 font-cinzel text-2xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-3">
                                <span className="animate-pulse">🔮</span>
                                <span>THE ORACLE</span>
                            </h2>
                            <p className="text-[10px] text-[#888] font-bold tracking-widest mt-1">AUTOMATED GEAR OPTIMIZATION MATRIX</p>
                        </div>
                        {!isCalculating && <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>}
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 bg-[#0a0a0c] relative z-10 overflow-y-auto max-h-[80vh]">

                    {isCalculating ? (
                        /* Progress Display */
                        <div className="flex flex-col items-center justify-center py-12 gap-6">
                            <div className="text-4xl animate-spin">⚙️</div>
                            <div className="text-center">
                                <p className="text-cyan-400 font-cinzel text-lg tracking-[0.15em] font-bold mb-2">SCANNING {progressSlot.toUpperCase()}</p>
                                <p className="text-[#666] text-xs font-mono">{progressIndex + 1} / {progressTotal} slots analyzed</p>
                            </div>
                            <div className="w-full max-w-xs bg-[#111] border border-[#333] rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                                    style={{ width: `${progressTotal > 0 ? ((progressIndex + 1) / progressTotal) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Game Mode Selector */}
                            <div className="mb-6">
                                <div className="text-[#555] font-bold text-[10px] tracking-[0.2em] border-b border-[#222] pb-2 mb-4">COMBAT PROFICIENCY</div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSelectedMode('PvE')}
                                        className={`flex-1 py-4 rounded border flex flex-col items-center justify-center gap-1 transition-all ${
                                            selectedMode === 'PvE'
                                            ? 'bg-cyan-900/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                            : 'bg-[#111] border-[#333] text-[#666] hover:border-[#555]'
                                        }`}
                                    >
                                        <span className="text-lg">🏰</span>
                                        <span className="text-xs font-bold tracking-widest">PVE</span>
                                        <span className="text-[9px] opacity-60">RAIDS & DUNGEONS</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedMode('PvP')}
                                        className={`flex-1 py-4 rounded border flex flex-col items-center justify-center gap-1 transition-all ${
                                            selectedMode === 'PvP'
                                            ? 'bg-red-900/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                            : 'bg-[#111] border-[#333] text-[#666] hover:border-[#555]'
                                        }`}
                                    >
                                        <span className="text-lg">⚔️</span>
                                        <span className="text-xs font-bold tracking-widest">PVP</span>
                                        <span className="text-[9px] opacity-60">PLAYER COMBAT</span>
                                    </button>
                                </div>
                            </div>

                            {/* Phase Selector */}
                            <div className="mb-6">
                                <div className="text-[#555] font-bold text-[10px] tracking-[0.2em] border-b border-[#222] pb-2 mb-4">CONTENT PHASE</div>
                                <div className="flex gap-2">
                                    {PHASES.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPhase(p.id)}
                                            className={`
                                                flex-1 py-3 rounded border transition-all duration-200 relative overflow-hidden group flex flex-col items-center justify-center
                                                ${selectedPhase === p.id
                                                    ? 'bg-cyan-900/30 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                                    : 'bg-[#111] border-[#333] hover:border-[#555] text-[#666]'
                                                }
                                            `}
                                        >
                                            <span className="text-xs font-bold font-mono">{p.label}</span>
                                            <span className="text-[8px] uppercase tracking-wider opacity-70">{p.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Source Selector */}
                            <div className="mb-6">
                                <div className="text-[#555] font-bold text-[10px] tracking-[0.2em] border-b border-[#222] pb-2 mb-4">ALLOWED CONTENT SOURCES</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {SOURCES.map(source => {
                                        const isActive = selectedSources.includes(source.id);
                                        const isPvP = source.id === 'PvP';

                                        return (
                                            <button
                                                key={source.id}
                                                onClick={() => toggleSource(source.id)}
                                                className={`
                                                    flex flex-col items-center justify-center p-4 rounded border transition-all duration-300 relative overflow-hidden group
                                                    ${isActive
                                                        ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                        : 'bg-[#111] border-[#333] hover:border-[#555] hover:bg-[#161616]'
                                                    }
                                                    ${selectedMode === 'PvE' && isPvP ? 'opacity-40 grayscale cursor-not-allowed' : ''}
                                                `}
                                            >
                                                <span className={`text-2xl mb-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>{source.icon}</span>
                                                <span className={`text-[9px] font-bold tracking-wider text-center ${isActive ? 'text-cyan-300' : 'text-[#666]'}`}>
                                                    {source.label}
                                                </span>
                                                {isActive && <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none"></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-[#111] border border-[#222] p-4 rounded text-center mb-6">
                                <p className="text-[#888] text-xs italic leading-relaxed">
                                    {selectedMode === 'PvE'
                                        ? "The Oracle will scour the archives for phase-appropriate PvE gear, strictly excluding PvP Rank rewards and battleground items to ensure raid eligibility."
                                        : "The Oracle will optimize your loadout for PvP combat, including Rank rewards and faction-specific gear if selected."}
                                </p>
                            </div>

                            <button
                                onClick={handleEquip}
                                disabled={selectedSources.length === 0}
                                className={`w-full py-4 rounded font-cinzel font-bold text-lg tracking-[0.2em] border transition-all relative overflow-hidden group
                                    ${selectedSources.length === 0
                                        ? 'bg-[#222] text-[#555] border-[#333] cursor-not-allowed'
                                        : 'bg-cyan-900/30 text-cyan-300 border-cyan-500/50 hover:bg-cyan-800/40 hover:text-white hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                                    }
                                `}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <span>👁️</span> REVEAL BEST IN SLOT
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
