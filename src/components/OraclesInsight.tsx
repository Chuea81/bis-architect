import React from 'react';
import { AggregatedStats, SpecName, ClassName } from '../types';

interface OraclesInsightProps {
    stats: AggregatedStats;
    spec: SpecName;
    currentClass: ClassName;
    onClose: () => void;
}

const ProgressBar = ({ 
    label, 
    value, 
    max, 
    icon, 
    colorClass, 
    subLabel 
}: { 
    label: string, 
    value: number, 
    max: number, 
    icon: string, 
    colorClass: string,
    subLabel?: string 
}) => {
    const percentage = Math.min(100, (value / max) * 100);
    const isCapped = value >= max;
    const isOverCapped = value > max;

    return (
        <div className="mb-5 last:mb-0">
            <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#e2e8f0] tracking-wider uppercase">{label}</span>
                        {subLabel && <span className="text-[9px] text-[#888] font-mono">{subLabel}</span>}
                    </div>
                </div>
                <div className="text-right">
                    <span className={`text-sm font-bold font-mono ${isCapped ? 'text-[#4ade80]' : 'text-[#e2e8f0]'}`}>
                        {value.toFixed(1)} / {max}
                    </span>
                    {isOverCapped && (
                        <span className="ml-2 text-[9px] text-amber-500 font-bold uppercase tracking-wide">
                            (+{(value - max).toFixed(1)} Wasted)
                        </span>
                    )}
                </div>
            </div>
            
            <div className="h-4 bg-[#111] rounded-full overflow-hidden border border-[#333] relative shadow-inner">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex justify-between px-1">
                    {[25, 50, 75].map(p => (
                        <div key={p} className="h-full w-px bg-[#222]" style={{ left: `${p}%` }}></div>
                    ))}
                </div>
                
                {/* Fill Bar */}
                <div 
                    className={`h-full transition-all duration-700 ease-out flex items-center justify-end pr-1 relative ${colorClass} ${isCapped ? 'shadow-[0_0_10px_currentColor]' : ''}`}
                    style={{ width: `${percentage}%` }}
                >
                    {isCapped && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                </div>

                {/* Hard Cap Marker Line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10" style={{ left: '100%' }}></div>
            </div>
            
            <div className="flex justify-between mt-1">
                <span className="text-[9px] text-[#555] font-bold">0</span>
                <span className="text-[9px] text-[#555] font-bold">{isCapped ? 'MAX' : 'CAP'}</span>
            </div>
        </div>
    );
};

export const OraclesInsight: React.FC<OraclesInsightProps> = ({ stats, spec, currentClass, onClose }) => {
    
    // --- DETERMINE CAPS BASED ON SPEC ---
    const isTank = spec.includes('Protection') || (spec === 'Feral' && stats.defense > 10); // Rough heuristic
    const isCaster = ['Mage', 'Warlock', 'Priest', 'Balance', 'Elemental', 'Restoration', 'Holy'].some(s => spec.includes(s) || currentClass === s);
    const isMelee = !isCaster && !isTank; // Simplified
    
    // 1. HIT CAP
    let hitCap = 9; // Default melee yellow hit
    let hitLabel = "Melee Hit Cap";
    let hitIcon = "⚔️";
    
    if (isCaster) {
        hitCap = 16;
        hitLabel = "Spell Hit Cap (Boss)";
        hitIcon = "✨";
    } else if (currentClass === 'Hunter') {
        hitCap = 9;
        hitLabel = "Ranged Hit Cap";
        hitIcon = "🏹";
    } else if (spec.includes('Dual') || currentClass === 'Rogue' || spec === 'Fury') {
        // Dual Wield
        hitLabel = "Special Attack Hit Cap";
        // White hit cap is like 24-28%, but usually people aim for 9% special cap first
    }

    // 2. DEFENSE CAP (Tanks)
    const defenseCap = 140; // +140 Defense skill from gear (Base 300 + 140 = 440) for Lvl 63 Boss Crit Immunity
    const defenseVal = stats.defense;

    // 3. RESISTANCE CAP (Lvl 63 Boss)
    const resCap = 315; 

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#3b82f6]/30 w-full max-w-xl rounded-lg shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-blue-400 font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span>👁️</span>
                            <span>ORACLE'S INSIGHT</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">STAT THRESHOLDS & CAPS (LEVEL 63 BOSS)</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c]">
                    
                    {/* PRIMARY COMBAT CAPS */}
                    <div className="mb-8">
                        <h3 className="text-[#555] font-bold text-[10px] tracking-[0.2em] border-b border-[#222] pb-2 mb-4">CRITICAL THRESHOLDS</h3>
                        
                        {/* Hit Bar */}
                        <ProgressBar 
                            label={hitLabel}
                            value={stats.hit}
                            max={hitCap}
                            icon={hitIcon}
                            colorClass={stats.hit >= hitCap ? "bg-[#4ade80]" : "bg-amber-500"}
                            subLabel={stats.hit >= hitCap ? "Chance to Miss: 0% (1% Hard Floor)" : "Attacks/Spells may miss"}
                        />

                        {/* Defense Bar (Show if relevant) */}
                        {(isTank || defenseVal > 10) && (
                            <div className="mt-6">
                                <ProgressBar 
                                    label="Defense Skill (Bonus)"
                                    value={defenseVal}
                                    max={defenseCap}
                                    icon="🛡️"
                                    colorClass={defenseVal >= defenseCap ? "bg-[#4ade80]" : "bg-red-500"}
                                    subLabel={defenseVal >= defenseCap ? "Crit Immune vs Lvl 63" : "Vulnerable to Crits"}
                                />
                            </div>
                        )}
                    </div>

                    {/* ELEMENTAL RESISTANCES */}
                    <div>
                        <h3 className="text-[#555] font-bold text-[10px] tracking-[0.2em] border-b border-[#222] pb-2 mb-4">ELEMENTAL WARDING (CAP 315)</h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <ProgressBar 
                                label="Fire Resistance" 
                                value={stats.resFire} 
                                max={resCap} 
                                icon="🔥" 
                                colorClass="bg-red-600"
                            />
                            <ProgressBar 
                                label="Nature Resistance" 
                                value={stats.resNature} 
                                max={resCap} 
                                icon="🌿" 
                                colorClass="bg-emerald-600"
                            />
                            <ProgressBar 
                                label="Shadow Resistance" 
                                value={stats.resShadow} 
                                max={resCap} 
                                icon="💀" 
                                colorClass="bg-purple-600"
                            />
                            <ProgressBar 
                                label="Frost Resistance" 
                                value={stats.resFrost} 
                                max={resCap} 
                                icon="❄️" 
                                colorClass="bg-blue-500"
                            />
                             <ProgressBar 
                                label="Arcane Resistance" 
                                value={stats.resArcane} 
                                max={resCap} 
                                icon="🔮" 
                                colorClass="bg-pink-500"
                            />
                        </div>
                    </div>

                </div>
                
                {/* Footer Info */}
                <div className="p-3 bg-[#111] border-t border-[#222] text-center">
                    <p className="text-[9px] text-[#444] leading-relaxed">
                        * Caps calculated against Level 63 Raid Bosses. <br/>
                        Spell Hit Hard Cap is 16%. Attacks always have 1% miss chance. <br/>
                        Defense Cap 440 (300 Base + 140 Gear) removes critical strike chance.
                    </p>
                </div>
            </div>
        </div>
    );
};