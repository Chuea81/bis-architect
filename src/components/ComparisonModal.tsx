
import React, { useMemo } from 'react';
import { Item } from '../types';
import { getIconUrl, getRarityColor, getStatValue } from '../services/gearService';

interface ComparisonModalProps {
    newItem: Item;
    equippedItem: Item | null; 
    onClose: () => void;
    onEquip: (item: Item) => void;
}

const STAT_LABELS: Record<string, string> = {
    sp: "SPELL POWER",
    ap: "ATTACK POWER",
    hit: "HIT %",
    crit: "CRIT %",
    haste: "HASTE %",
    int: "INTELLECT",
    str: "STRENGTH",
    agi: "AGILITY",
    sta: "STAMINA",
    stam: "STAMINA",
    spi: "SPIRIT",
    spirit: "SPIRIT",
    resFire: "FIRE RES",
    fireRes: "FIRE RES",
    resFrost: "FROST RES",
    frostRes: "FROST RES",
    resNature: "NATURE RES",
    natureRes: "NATURE RES",
    resShadow: "SHADOW RES",
    shadowRes: "SHADOW RES",
    resArcane: "ARCANE RES",
    arcaneRes: "ARCANE RES",
    defense: "DEFENSE",
    dodge: "DODGE %",
    parry: "PARRY %",
    block: "BLOCK %",
    mp5: "MANA / 5s",
    hp5: "HP / 5s",
    healing: "HEALING"
};

// Helper to get all relevant stats from both items
const getAllStatKeys = (itemA: Item | null, itemB: Item) => {
    const keys = new Set<string>();
    if (itemA && itemA.stats) Object.keys(itemA.stats).forEach(k => keys.add(k));
    if (itemB.stats) Object.keys(itemB.stats).forEach(k => keys.add(k));
    return Array.from(keys).filter(k => k !== 'armor'); // Armor usually shown separately
};

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ newItem, equippedItem, onClose, onEquip }) => {
    
    const statKeys = useMemo(() => getAllStatKeys(equippedItem, newItem), [equippedItem, newItem]);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-3xl rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <h2 className="text-[#FFD700] font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-3">
                        <span>⚖️</span> TACTICAL COMPARISON
                    </h2>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c]">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        
                        {/* CURRENTLY EQUIPPED */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] text-[#555] font-bold tracking-[0.2em] uppercase text-center mb-1">
                                CURRENTLY EQUIPPED
                            </div>
                            
                            {equippedItem ? (
                                <div className="flex items-center gap-4 bg-[#111] p-3 border border-[#333] rounded-md shadow-sm opacity-80">
                                    <div className="relative w-12 h-12 shrink-0">
                                        <img src={getIconUrl(equippedItem.icon)} className="w-full h-full rounded border border-black shadow" alt="" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="font-bold text-sm tracking-wide truncate" style={{ color: getRarityColor(equippedItem) }}>
                                            {equippedItem.name}
                                        </div>
                                        <div className="text-[10px] text-[#666]">{equippedItem.slot}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[#444] text-center italic py-4 bg-[#111] border border-[#222] border-dashed rounded-md h-[74px] flex items-center justify-center">
                                    Empty Slot
                                </div>
                            )}
                        </div>

                        {/* NEW CANDIDATE */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] text-[#FFD700] font-bold tracking-[0.2em] uppercase text-center mb-1">CANDIDATE</div>
                            <div className="flex items-center gap-4 bg-[#1a1a1d] p-3 border border-[#FFD700]/30 rounded-md shadow-[0_0_15px_rgba(255,215,0,0.05)]">
                                <div className="relative w-12 h-12 shrink-0">
                                    <img src={getIconUrl(newItem.icon)} className="w-full h-full rounded border border-black shadow" alt="" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="font-bold text-base tracking-wide truncate" style={{ color: getRarityColor(newItem) }}>
                                        {newItem.name}
                                    </div>
                                    <div className="text-[10px] text-[#666]">{newItem.slot}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Comparison Grid */}
                    <div className="flex flex-col border border-[#222] rounded-md overflow-hidden bg-[#111]">
                        <div className="grid grid-cols-3 bg-[#1a1a1a] py-2 px-4 border-b border-[#222]">
                            <div className="text-right text-[10px] font-bold text-[#666] tracking-widest uppercase">Current</div>
                            <div className="text-center text-[10px] font-bold text-[#888] tracking-widest uppercase">Stat</div>
                            <div className="text-left text-[10px] font-bold text-[#FFD700] tracking-widest uppercase pl-4">New / Diff</div>
                        </div>

                        {statKeys.map(key => {
                            const valA = equippedItem ? getStatValue(equippedItem, key) : 0;
                            const valB = getStatValue(newItem, key);

                            const diff = valB - valA;
                            let diffColor = "text-[#666]"; 
                            let diffText = "";
                            let rowBg = "bg-[#0f0f0f]";

                            if (diff > 0) {
                                diffColor = "text-[#1eff00]";
                                diffText = `+${diff}`;
                                rowBg = "bg-[#111911]"; // Slight green tint
                            } else if (diff < 0) {
                                diffColor = "text-[#ff4444]";
                                diffText = `${diff}`;
                                rowBg = "bg-[#191111]"; // Slight red tint
                            }

                            const label = STAT_LABELS[key] || key.toUpperCase();

                            return (
                                <div key={key} className={`grid grid-cols-3 py-2 px-4 ${rowBg} items-center border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a] transition-colors`}>
                                    {/* Current Value */}
                                    <div className="text-right font-mono text-sm text-[#888] font-medium pr-2">
                                        {valA > 0 ? valA : <span className="text-[#333]">-</span>}
                                    </div>
                                    
                                    {/* Stat Label */}
                                    <div className="text-center text-[#bbb] text-[10px] font-bold tracking-wide uppercase px-1">
                                        {label}
                                    </div>
                                    
                                    {/* New Value + Diff */}
                                    <div className="text-left font-mono text-sm flex gap-3 items-center pl-4">
                                        <span className={`font-bold ${valB > 0 ? 'text-white' : 'text-[#333]'}`}>
                                            {valB > 0 ? valB : '-'}
                                        </span>
                                        {diff !== 0 && (
                                            <span className={`text-[10px] font-bold ${diffColor}`}>
                                                ({diffText})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* NEW: Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3 border-t border-[#222] pt-4">
                        <button 
                            onClick={onClose}
                            className="px-5 py-3 bg-[#1a1a1a] border border-[#333] text-[#888] font-bold text-xs rounded hover:bg-[#222] hover:text-white transition-colors tracking-widest"
                        >
                            CANCEL
                        </button>
                        <button 
                            onClick={() => onEquip(newItem)}
                            className="px-8 py-3 bg-green-900/20 border border-green-500/50 text-green-400 font-bold text-xs rounded hover:bg-green-900/40 hover:text-green-300 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.2)] tracking-widest flex items-center gap-2 group"
                        >
                            <span>EQUIP ITEM</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>

                    <div className="text-center mt-4 text-[#444] text-[10px] italic">
                        Shift + Click items in the database to open this view.
                    </div>
                </div>
            </div>
        </div>
    );
};
