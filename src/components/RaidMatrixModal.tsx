
import React from 'react';
import { RAID_BUFFS, RAID_DEBUFFS } from '../constants';
import { getIconUrl } from '../services/gearService';

interface RaidMatrixModalProps {
    activeRaidBuffs: string[];
    setActiveRaidBuffs: (buffs: string[]) => void;
    activeRaidDebuffs: string[];
    setActiveRaidDebuffs: (debuffs: string[]) => void;
    onClose: () => void;
}

export const RaidMatrixModal: React.FC<RaidMatrixModalProps> = ({ 
    activeRaidBuffs, setActiveRaidBuffs, 
    activeRaidDebuffs, setActiveRaidDebuffs, 
    onClose 
}) => {

    const toggleBuff = (id: string) => {
        // If unchecking, straightforward removal
        if (activeRaidBuffs.includes(id)) {
            setActiveRaidBuffs(activeRaidBuffs.filter(b => b !== id));
            return;
        }

        // If checking, enforce exclusivity
        const buffDef = RAID_BUFFS.find(b => b.id === id);
        let newBuffs = [...activeRaidBuffs];

        if (buffDef && (buffDef as any).exclusivityGroup) {
            const group = (buffDef as any).exclusivityGroup;
            // Remove any other buff in the same group
            newBuffs = newBuffs.filter(existingId => {
                const existingDef = RAID_BUFFS.find(b => b.id === existingId);
                return !existingDef || (existingDef as any).exclusivityGroup !== group;
            });
        }

        newBuffs.push(id);
        setActiveRaidBuffs(newBuffs);
    };

    const toggleDebuff = (id: string) => {
        if (activeRaidDebuffs.includes(id)) {
            setActiveRaidDebuffs(activeRaidDebuffs.filter(b => b !== id));
        } else {
            setActiveRaidDebuffs([...activeRaidDebuffs, id]);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-red-900/50 w-full max-w-4xl rounded-lg shadow-[0_0_50px_rgba(153,27,27,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-red-500 font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span>💀</span>
                            <span>RAID SYNERGY MATRIX</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">CONFIGURE PARTY BUFFS AND TARGET DEBUFFS</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c] grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* PARTY BUFFS */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-[#333] pb-2 mb-2">
                            <span className="text-lg">🛡️</span>
                            <h3 className="text-sm font-bold text-[#e2e8f0] tracking-widest uppercase">PARTY AURAS & TOTEMS</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {RAID_BUFFS.map(buff => {
                                const isActive = activeRaidBuffs.includes(buff.id);
                                return (
                                    <button 
                                        key={buff.id}
                                        onClick={() => toggleBuff(buff.id)}
                                        className={`flex items-center gap-3 p-2 rounded border transition-all group text-left
                                            ${isActive 
                                                ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                                                : 'bg-[#111] border-[#333] hover:border-[#555] hover:bg-[#161616]'
                                            }
                                        `}
                                    >
                                        <div className={`relative w-8 h-8 rounded shrink-0 overflow-hidden border ${isActive ? 'border-blue-400' : 'border-[#333]'}`}>
                                            <img src={getIconUrl(buff.icon)} className={`w-full h-full object-cover ${isActive ? '' : 'grayscale opacity-70'}`} alt="" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${isActive ? 'text-blue-300' : 'text-[#888] group-hover:text-[#ccc]'}`}>{buff.name}</span>
                                            <span className="text-[10px] text-[#555]">{buff.description}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* TARGET DEBUFFS */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-[#333] pb-2 mb-2">
                            <span className="text-lg">🎯</span>
                            <h3 className="text-sm font-bold text-[#e2e8f0] tracking-widest uppercase">TARGET VULNERABILITIES</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {RAID_DEBUFFS.map(debuff => {
                                const isActive = activeRaidDebuffs.includes(debuff.id);
                                return (
                                    <button 
                                        key={debuff.id}
                                        onClick={() => toggleDebuff(debuff.id)}
                                        className={`flex items-center gap-3 p-2 rounded border transition-all group text-left
                                            ${isActive 
                                                ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                                                : 'bg-[#111] border-[#333] hover:border-[#555] hover:bg-[#161616]'
                                            }
                                        `}
                                    >
                                        <div className={`relative w-8 h-8 rounded shrink-0 overflow-hidden border ${isActive ? 'border-red-400' : 'border-[#333]'}`}>
                                            <img src={getIconUrl(debuff.icon)} className={`w-full h-full object-cover ${isActive ? '' : 'grayscale opacity-70'}`} alt="" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${isActive ? 'text-red-300' : 'text-[#888] group-hover:text-[#ccc]'}`}>{debuff.name}</span>
                                            <span className="text-[10px] text-[#555]">{debuff.description}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
