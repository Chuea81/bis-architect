
import React, { useState, useMemo } from 'react';
import { ItemStats, StatWeights, SpecName, ClassName } from '../types';
import { STAT_WEIGHTS, TALENT_DB } from '../constants';
import { getIconUrl } from '../services/gearService';

interface TheorycraftModalProps {
    currentClass: ClassName;
    currentSpec: SpecName;
    talentStats: ItemStats;
    setTalentStats: (s: ItemStats) => void;
    selectedTalents: string[];
    setSelectedTalents: (t: string[]) => void;
    customWeights: Record<string, StatWeights>;
    setCustomWeights: (w: Record<string, StatWeights>) => void;
    onClose: () => void;
}

const TALENT_KEYS = [
    { key: 'crit', label: 'Crit %', step: 1 },
    { key: 'hit', label: 'Hit %', step: 1 },
    { key: 'haste', label: 'Haste %', step: 1 },
    { key: 'sp', label: 'Spell Power', step: 5 },
    { key: 'healing', label: 'Healing', step: 5 },
    { key: 'sta', label: 'Stamina', step: 1 },
    { key: 'int', label: 'Intellect', step: 1 },
    { key: 'spi', label: 'Spirit', step: 1 },
    { key: 'mana', label: 'Mana', step: 50 },
    { key: 'mp5', label: 'MP5', step: 1 },
];

const WEIGHT_KEYS: (keyof StatWeights)[] = ['sp', 'hit', 'crit', 'int', 'stam', 'spirit', 'str', 'agi', 'ap', 'defense', 'healing', 'mp5'];

export const TheorycraftModal: React.FC<TheorycraftModalProps> = ({ 
    currentClass, currentSpec, talentStats, setTalentStats, 
    selectedTalents, setSelectedTalents,
    customWeights, setCustomWeights, onClose 
}) => {
    const [activeTab, setActiveTab] = useState<'talents' | 'weights' | 'grimoire'>('grimoire');
    
    // Local state for weights to avoid heavy re-renders, sync on save/change
    const currentWeightSet = customWeights[currentSpec] || STAT_WEIGHTS[currentSpec];

    const availableTalents = useMemo(() => {
        return TALENT_DB[currentClass] || [];
    }, [currentClass]);

    const handleTalentChange = (key: string, val: string) => {
        const num = parseFloat(val) || 0;
        setTalentStats({ ...talentStats, [key]: num });
    };

    const handleWeightChange = (key: keyof StatWeights, val: string) => {
        const num = parseFloat(val) || 0;
        const updated = { ...currentWeightSet, [key]: num };
        setCustomWeights({ ...customWeights, [currentSpec]: updated });
    };

    const resetWeights = () => {
        // Remove custom weight for this spec to fallback to default
        const newWeights = { ...customWeights };
        delete newWeights[currentSpec];
        setCustomWeights(newWeights);
    };

    const toggleGrimoireTalent = (talentId: string) => {
        const talent = availableTalents.find(t => t.id === talentId);
        if (!talent) return;

        const isSelected = selectedTalents.includes(talentId);
        let newTalentStats = { ...talentStats };

        // Calculate impact
        Object.entries(talent.stats).forEach(([key, val]: [string, number]) => {
            if (isSelected) {
                // Deselecting: Subtract stats
                newTalentStats[key] = (newTalentStats[key] || 0) - val;
                // Cleanup zero values
                if (Math.abs(newTalentStats[key]) < 0.01) delete newTalentStats[key];
            } else {
                // Selecting: Add stats
                newTalentStats[key] = (newTalentStats[key] || 0) + val;
            }
        });

        setTalentStats(newTalentStats);
        
        if (isSelected) {
            setSelectedTalents(selectedTalents.filter(id => id !== talentId));
        } else {
            setSelectedTalents([...selectedTalents, talentId]);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-2xl rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-[#a335ee] font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md">THEORYCRAFTING</h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">FINE TUNE YOUR BUILD MATH</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#222]">
                    <button 
                        onClick={() => setActiveTab('grimoire')}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'grimoire' ? 'bg-[#222] text-white border-b-2 border-[#a335ee]' : 'text-[#555] hover:text-[#aaa]'}`}
                    >
                        <span>📖</span> GRIMOIRE
                    </button>
                    <button 
                        onClick={() => setActiveTab('talents')}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest transition-colors ${activeTab === 'talents' ? 'bg-[#222] text-white border-b-2 border-[#a335ee]' : 'text-[#555] hover:text-[#aaa]'}`}
                    >
                        MANUAL STATS
                    </button>
                    <button 
                        onClick={() => setActiveTab('weights')}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest transition-colors ${activeTab === 'weights' ? 'bg-[#222] text-white border-b-2 border-[#a335ee]' : 'text-[#555] hover:text-[#aaa]'}`}
                    >
                        EP WEIGHTS
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c]">
                    
                    {activeTab === 'grimoire' && (
                        <div className="flex flex-col gap-4">
                            <div className="text-[11px] text-[#888] italic mb-2 border-l-2 border-[#a335ee] pl-3 py-1">
                                Select key talents to automatically apply their bonuses to your character stats.
                            </div>
                            <div className="flex flex-col gap-2">
                                {availableTalents.map(talent => {
                                    const isSelected = selectedTalents.includes(talent.id);
                                    return (
                                        <div 
                                            key={talent.id}
                                            onClick={() => toggleGrimoireTalent(talent.id)}
                                            className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer group ${
                                                isSelected 
                                                ? 'bg-[#a335ee]/10 border-[#a335ee] shadow-[0_0_10px_rgba(163,53,238,0.2)]' 
                                                : 'bg-[#111] border-[#333] hover:border-[#666]'
                                            }`}
                                        >
                                            {/* Icon */}
                                            <div className={`relative w-8 h-8 rounded border shrink-0 overflow-hidden mt-0.5 ${isSelected ? 'border-[#a335ee]' : 'border-[#333]'}`}>
                                                <img src={getIconUrl(talent.icon)} className={`w-full h-full object-cover ${isSelected ? '' : 'grayscale'}`} alt={talent.name} />
                                            </div>
                                            
                                            {/* Text */}
                                            <div className="flex-1">
                                                <div className={`text-xs font-bold uppercase tracking-wide flex justify-between ${isSelected ? 'text-[#a335ee]' : 'text-[#888] group-hover:text-[#aaa]'}`}>
                                                    <span>{talent.name}</span>
                                                    {isSelected && <span className="text-[10px]">ACTIVE</span>}
                                                </div>
                                                <div className="text-[10px] text-[#666] mt-1 leading-snug">
                                                    {talent.description}
                                                </div>
                                            </div>

                                            {/* Checkbox Visual */}
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-[#a335ee] border-[#a335ee] text-white' : 'bg-transparent border-[#444]'}`}>
                                                {isSelected && <span className="text-[10px] font-bold">✓</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                                {availableTalents.length === 0 && (
                                    <div className="text-center text-[#444] italic py-8">
                                        No curated talents found for this class yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'talents' && (
                        <div className="flex flex-col gap-4">
                            <div className="text-[11px] text-[#888] italic mb-2 border-l-2 border-[#333] pl-3 py-1">
                                Manually adjust these values to account for Talents, Racials, or Base Stats not covered by the Grimoire. 
                                <span className="text-[#a335ee] block mt-1">Note: Grimoire selections automatically add to these values.</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {TALENT_KEYS.map(({key, label, step}) => (
                                    <div key={key} className="flex justify-between items-center group">
                                        <label className="text-xs font-bold text-[#aaa] group-hover:text-[#ddd] transition-colors">{label}</label>
                                        <input 
                                            type="number" 
                                            step={step}
                                            value={parseFloat((talentStats[key] || 0).toFixed(2))}
                                            onChange={(e) => handleTalentChange(key, e.target.value)}
                                            className="w-20 bg-[#111] border border-[#333] rounded px-2 py-1 text-right text-sm font-mono text-[#a335ee] focus:border-[#a335ee] focus:outline-none transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'weights' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-2 border-l-2 border-[#333] pl-3 py-1">
                                <div className="text-[11px] text-[#888] italic">
                                    Weights determine Item Score (EP). Modifying these will instantly re-rank items in the database.
                                </div>
                                <button 
                                    onClick={resetWeights}
                                    className="text-[9px] font-bold text-[#666] border border-[#333] px-2 py-1 rounded hover:bg-[#333] hover:text-white transition-colors uppercase whitespace-nowrap ml-4"
                                >
                                    Reset to Default
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {WEIGHT_KEYS.map((key) => {
                                    if (currentWeightSet[key] === undefined && key !== 'sp') return null; // Only show relevant weights
                                    return (
                                        <div key={key} className="flex justify-between items-center group">
                                            <label className="text-xs font-bold text-[#aaa] group-hover:text-[#ddd] transition-colors uppercase">{key}</label>
                                            <input 
                                                type="number" 
                                                step={0.1}
                                                value={currentWeightSet[key] || 0}
                                                onChange={(e) => handleWeightChange(key, e.target.value)}
                                                className="w-20 bg-[#111] border border-[#333] rounded px-2 py-1 text-right text-sm font-mono text-[#FFD700] focus:border-[#FFD700] focus:outline-none transition-all"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};