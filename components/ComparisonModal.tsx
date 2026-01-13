
import React from 'react';
import { Item } from '../types';
import { getIconUrl, getRarityColor, getStatValue } from '../services/gearService';

interface ComparisonModalProps {
    newItem: Item;
    equippedItems: Item[]; // Changed to array to support MH+OH vs 2H
    onClose: () => void;
}

const STAT_LABELS: Record<string, string> = {
    sp: "SPELL POWER",
    hit: "HIT %",
    crit: "CRIT %",
    int: "INTELLECT",
    sta: "STAMINA",
    spi: "SPIRIT",
    resFire: "FIRE RES",
    resFrost: "FROST RES",
    resNature: "NATURE RES",
    resShadow: "SHADOW RES",
    resArcane: "ARCANE RES"
};

const STAT_KEYS = Object.keys(STAT_LABELS);

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ newItem, equippedItems, onClose }) => {
    
    // Helper to sum stats across multiple equipped items
    const getCurrentStatTotal = (key: string) => {
        return equippedItems.reduce((total, item) => total + getStatValue(item, key), 0);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-3xl rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <h2 className="text-[#FFD700] font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md">COMPARE ITEMS</h2>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c]">
                    <div className="grid grid-cols-2 gap-8 h-full">
                        
                        {/* Equipped Item(s) Column */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] text-[#555] font-bold tracking-[0.2em] uppercase text-center mb-1">
                                CURRENTLY EQUIPPED {equippedItems.length > 1 && "(AGGREGATED)"}
                            </div>
                            
                            {equippedItems.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {equippedItems.map((item, idx) => (
                                        <div key={`${item.name}-${idx}`} className="flex items-center gap-4 bg-[#111] p-3 border border-[#333] rounded-md shadow-sm">
                                            <div className="relative w-12 h-12 shrink-0">
                                                <img src={getIconUrl(item.icon)} className="w-full h-full rounded border border-black shadow" alt="" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="font-bold text-sm tracking-wide truncate" style={{ color: getRarityColor(item) }}>
                                                    {item.name}
                                                </div>
                                                <div className="text-[10px] text-[#666]">{item.slot}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-[#444] text-center italic py-6 bg-[#111] border border-[#222] border-dashed rounded-md">
                                    Empty Slot
                                </div>
                            )}
                        </div>

                        {/* New Item Column */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] text-[#FFD700] font-bold tracking-[0.2em] uppercase text-center mb-1">NEW SELECTION</div>
                            <div className="flex items-center gap-4 bg-[#111] p-3 border border-[#333] rounded-md shadow-[0_0_15px_rgba(255,215,0,0.05)]">
                                <div className="relative w-12 h-12 shrink-0">
                                    <img src={getIconUrl(newItem.icon)} className="w-full h-full rounded border border-black shadow" alt="" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="font-bold text-base tracking-wide" style={{ color: getRarityColor(newItem) }}>
                                        {newItem.name}
                                    </div>
                                    <div className="text-[10px] text-[#666]">{newItem.slot}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Comparison Grid */}
                    <div className="mt-8 flex flex-col gap-px bg-[#222] border border-[#222] rounded-md overflow-hidden">
                        <div className="grid grid-cols-3 bg-[#1a1a1a] py-2 px-4">
                            <div className="text-right text-[10px] font-bold text-[#666] tracking-widest uppercase">Current</div>
                            <div className="text-center text-[10px] font-bold text-[#888] tracking-widest uppercase">Stat</div>
                            <div className="text-left text-[10px] font-bold text-[#FFD700] tracking-widest uppercase">New</div>
                        </div>

                        {STAT_KEYS.map(key => {
                            const valA = getCurrentStatTotal(key);
                            const valB = getStatValue(newItem, key);

                            if (valA === 0 && valB === 0) return null;

                            const diff = valB - valA;
                            let diffColor = "text-[#666]"; // neutral
                            let diffText = "";
                            let rowBg = "bg-[#0f0f0f]";

                            if (diff > 0) {
                                diffColor = "text-[#1eff00]";
                                diffText = `+${diff}`;
                                rowBg = "bg-[#111911]";
                            } else if (diff < 0) {
                                diffColor = "text-[#ff4444]";
                                diffText = `${diff}`;
                                rowBg = "bg-[#191111]";
                            }

                            return (
                                <div key={key} className={`grid grid-cols-3 py-2 px-4 ${rowBg} items-center group hover:bg-[#1a1a1a] transition-colors`}>
                                    {/* Current Value */}
                                    <div className="text-right font-mono text-sm text-[#888] font-medium">
                                        {valA > 0 ? valA : <span className="text-[#333]">-</span>}
                                    </div>
                                    
                                    {/* Stat Label */}
                                    <div className="text-center text-[#bbb] text-[10px] font-bold tracking-wide uppercase">
                                        {STAT_LABELS[key]}
                                    </div>
                                    
                                    {/* New Value + Diff */}
                                    <div className="text-left font-mono text-sm flex gap-3 items-center">
                                        <span className="text-white font-bold">{valB > 0 ? valB : <span className="text-[#333] font-normal">-</span>}</span>
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
                </div>
            </div>
        </div>
    );
};
