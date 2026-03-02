
import React, { useState, useMemo } from 'react';
import { SavedBuild, ClassName } from '../types';
import { CLASS_CONFIG } from '../constants';
import { compressBuild } from '../services/shareService';
import { showToast } from './Toast';

interface BuildManagerProps {
    savedBuilds: SavedBuild[];
    onSave: (name: string) => void;
    onLoad: (build: SavedBuild) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    currentClass: ClassName;
}

export const BuildManager: React.FC<BuildManagerProps> = ({ savedBuilds, onSave, onLoad, onDelete, onClose, currentClass }) => {
    const [newName, setNewName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSave = () => {
        if (newName.trim()) {
            onSave(newName);
            setNewName("");
        }
    };

    const handleShare = (build: SavedBuild, e: React.MouseEvent) => {
        e.stopPropagation();
        const compressed = compressBuild(
            build.class,
            build.spec,
            build.realm,
            build.mode,
            build.activeBuffs,
            build.talentStats,
            build.customWeights,
            build.equipped,
            build.race,
            build.gender,
            build.talentPoints
        );
        const url = `${window.location.origin}${window.location.pathname}?build=${compressed}`;

        navigator.clipboard.writeText(url)
            .then(() => showToast(`Link for "${build.name}" copied!`, 'success'))
            .catch(() => showToast("Clipboard access denied", 'error'));
    };

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const classColor = CLASS_CONFIG[currentClass].color;

    // Sort by timestamp descending (Newest first)
    const sortedBuilds = useMemo(() => {
        return [...savedBuilds]
            .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || (b.charName && b.charName.toLowerCase().includes(searchTerm.toLowerCase())))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [savedBuilds, searchTerm]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-2xl rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-[#e2e8f0] font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span style={{ color: classColor }}>BLUEPRINTS</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">ARCHIVE AND RESTORE YOUR COMBAT LOADOUTS</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                <div className="flex flex-col h-full bg-[#0a0a0c]">
                    
                    {/* Save Section */}
                    <div className="p-5 border-b border-[#222] bg-[#121214] flex flex-col gap-3">
                        <div className="flex gap-3">
                            <input 
                                type="text" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="NAME YOUR CURRENT LOADOUT..." 
                                className="flex-1 bg-[#050505] border border-[#333] text-[#eee] text-xs font-cinzel font-bold py-3 px-4 rounded hover:border-[#666] focus:border-[#e2e8f0] outline-none transition-colors uppercase placeholder-[#444] shadow-inner"
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                            <button 
                                onClick={handleSave}
                                disabled={!newName.trim()}
                                className="px-6 py-2 bg-[#e2e8f0]/10 border border-[#e2e8f0]/30 text-[#e2e8f0] font-cinzel font-bold text-[10px] tracking-widest rounded hover:bg-[#e2e8f0]/20 hover:border-[#e2e8f0] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <span>SCRIBE</span>
                            </button>
                        </div>
                        {/* Search Filter */}
                        {savedBuilds.length > 5 && (
                             <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter saved builds..."
                                className="w-full bg-transparent border-b border-[#333] text-[10px] text-[#888] py-1 px-2 focus:border-[#555] outline-none"
                            />
                        )}
                    </div>

                    {/* List Section */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700">
                        {sortedBuilds.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-[#444] border-2 border-dashed border-[#222] rounded-lg">
                                <span className="text-2xl mb-2 opacity-50">📜</span>
                                <span className="text-xs font-cinzel tracking-widest">NO BLUEPRINTS FOUND</span>
                            </div>
                        ) : (
                            sortedBuilds.map(build => {
                                const buildClassData = CLASS_CONFIG[build.class];
                                const itemCount = Object.keys(build.equipped).length;
                                return (
                                    <div 
                                        key={build.id}
                                        className="group flex items-center justify-between p-3 bg-[#111] border border-[#222] rounded hover:border-[#444] hover:bg-[#161616] transition-all cursor-pointer"
                                        onClick={() => { onLoad(build); onClose(); }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Icon */}
                                            <div 
                                                className="w-10 h-10 rounded border border-[#333] bg-black flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden"
                                                style={{ borderColor: buildClassData.color }}
                                            >
                                                <div className="absolute inset-0 opacity-20" style={{ backgroundColor: buildClassData.color }}></div>
                                                <span className="text-[10px] font-bold z-10" style={{ color: buildClassData.color }}>
                                                    {build.class.substring(0, 3).toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-[#eee] group-hover:text-white tracking-wide">{build.name}</span>
                                                    {build.charName && (
                                                        <span className="text-[9px] font-bold text-stone-500 border border-stone-700 bg-stone-900 px-1.5 rounded uppercase tracking-wide">
                                                            {build.charName}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-[#666]">
                                                    <span style={{ color: buildClassData.color }} className="font-bold uppercase">{build.spec.split('(')[0]}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(build.timestamp)}</span>
                                                    <span>•</span>
                                                    <span>{itemCount} Items</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => handleShare(build, e)}
                                                className="p-2 text-[#666] hover:text-[#38bdf8] transition-colors border border-transparent hover:border-[#38bdf8]/30 hover:bg-[#38bdf8]/10 rounded"
                                                title="Copy Share Link"
                                            >
                                                🔗
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(build.id); }}
                                                className="p-2 text-[#666] hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30 hover:bg-red-500/10 rounded"
                                                title="Destroy Blueprint"
                                            >
                                                🗑️
                                            </button>
                                            <button 
                                                className="px-3 py-1.5 border border-emerald-900/50 bg-emerald-900/10 text-emerald-500 hover:bg-emerald-900/30 hover:text-emerald-400 rounded text-[10px] font-bold tracking-wider transition-colors ml-2"
                                            >
                                                LOAD
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
