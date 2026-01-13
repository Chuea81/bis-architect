
import React, { useMemo } from 'react';
import { CONSUMABLE_DATABASE } from '../constants';
import { ConsumableCategory, Consumable } from '../types';
import { getIconUrl } from '../services/gearService';

interface BuffManagerProps {
    activeBuffs: string[];
    onToggleBuff: (buffName: string) => void;
    onClose: () => void;
}

const CATEGORIES: ConsumableCategory[] = ['Flask', 'Elixir', 'Food', 'World Buff', 'Other'];

export const BuffManager: React.FC<BuffManagerProps> = ({ activeBuffs, onToggleBuff, onClose }) => {
    
    // Group buffs by category
    const groupedBuffs = useMemo(() => {
        const groups: Record<string, Consumable[]> = {};
        CATEGORIES.forEach(c => groups[c] = []);
        CONSUMABLE_DATABASE.forEach(buff => {
            if (!groups[buff.category]) groups['Other'].push(buff);
            else groups[buff.category].push(buff);
        });
        return groups;
    }, []);

    const activeSet = new Set(activeBuffs);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-4xl rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-[#FFD700] font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md">CONSUMABLES & BUFFS</h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">SELECT BUFFS TO SIMULATE COMBAT STATS</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CATEGORIES.map(category => {
                            const buffs = groupedBuffs[category];
                            if (buffs.length === 0) return null;

                            return (
                                <div key={category} className="flex flex-col gap-3">
                                    <h3 className="text-[#FFD700] font-cinzel font-bold text-xs tracking-[0.2em] border-b border-[#333] pb-2 mb-1">{category.toUpperCase()}s</h3>
                                    <div className="flex flex-col gap-2">
                                        {buffs.map(buff => {
                                            const isActive = activeSet.has(buff.name);
                                            return (
                                                <button
                                                    key={buff.name}
                                                    onClick={() => onToggleBuff(buff.name)}
                                                    className={`flex items-center gap-3 p-2 rounded border transition-all duration-200 text-left group
                                                        ${isActive 
                                                            ? 'bg-[#1a1a1a] border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                                                            : 'bg-[#111] border-[#333] hover:border-[#555] opacity-80 hover:opacity-100'
                                                        }
                                                    `}
                                                >
                                                    <div className={`relative w-8 h-8 rounded border shrink-0 overflow-hidden ${isActive ? 'border-[#FFD700]' : 'border-[#333]'}`}>
                                                        <img src={getIconUrl(buff.icon)} className={`w-full h-full object-cover ${isActive ? '' : 'grayscale'}`} alt={buff.name} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-xs font-bold truncate ${isActive ? 'text-[#FFD700]' : 'text-[#888] group-hover:text-[#ccc]'}`}>
                                                            {buff.name}
                                                        </span>
                                                        <span className="text-[9px] text-[#555] truncate">
                                                            {buff.description}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
