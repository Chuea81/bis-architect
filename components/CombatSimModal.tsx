
import React, { useState, useEffect, useRef } from 'react';
import { AggregatedStats, SpecName, Build, Item } from '../types';
import { getStatValue } from '../services/gearService';

interface CombatSimModalProps {
    stats: AggregatedStats;
    spec: SpecName;
    equipped: Build;
    onClose: () => void;
}

interface CombatEvent {
    timestamp: number;
    source: string;
    amount: number;
    type: 'hit' | 'crit' | 'miss' | 'glance' | 'resist';
    school?: string;
}

interface SimResult {
    dps: number;
    totalDamage: number;
    duration: number;
    events: CombatEvent[];
    breakdown: {
        hits: number;
        crits: number;
        misses: number;
        casts: number;
    };
}

// --- SIMULATION CONSTANTS ---
// Simplified Level 60 values
const BOSS_DEFENSE = 315; // +3 Levels
const PLAYER_WEAPON_SKILL_BASE = 300;

// Spell Data (Cast Time, Coefficient, Base Avg Dmg)
// Note: These are approximated for a generic "fully buffed" feeling without full talent tree parsing
const SPELL_DB: Record<string, { time: number, coeff: number, base: number, school: 'shadow' | 'fire' | 'frost' | 'nature' | 'holy' | 'arcane' }> = {
    // Warlock
    'Shadow Bolt': { time: 2.5, coeff: 0.857, base: 510, school: 'shadow' }, // Ruin (+100% crit dmg) assumed for dest/aff
    'Searing Pain': { time: 1.5, coeff: 0.429, base: 220, school: 'fire' },
    // Mage
    'Frostbolt': { time: 2.5, coeff: 0.814, base: 460, school: 'frost' }, // +100% crit dmg
    'Fireball': { time: 3.0, coeff: 1.0, base: 640, school: 'fire' },
    // Priest
    'Heal': { time: 2.5, coeff: 0.857, base: 1800, school: 'holy' },
    'Mind Blast': { time: 1.5, coeff: 0.429, base: 530, school: 'shadow' },
    // Druid
    'Healing Touch': { time: 3.0, coeff: 1.0, base: 2000, school: 'nature' },
    'Starfire': { time: 3.0, coeff: 1.0, base: 550, school: 'arcane' },
    'Wrath': { time: 1.5, coeff: 0.5, base: 250, school: 'nature' },
    // Shaman
    'Lightning Bolt': { time: 2.0, coeff: 0.714, base: 450, school: 'nature' }, // 2.5s reduced to 2.0 via talents
    'Healing Wave': { time: 2.5, coeff: 0.857, base: 1600, school: 'nature' },
    // Paladin
    'Holy Light': { time: 2.5, coeff: 0.857, base: 1400, school: 'holy' },
    // Hunter (Ranged shots abstract)
    'Auto Shot': { time: 0, coeff: 0, base: 0, school: 'nature' }, // Handled via weapon speed
};

export const CombatSimModal: React.FC<CombatSimModalProps> = ({ stats, spec, equipped, onClose }) => {
    const [duration, setDuration] = useState(60);
    const [targetType, setTargetType] = useState<'boss' | 'mob'>('boss');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<SimResult | null>(null);
    const [progress, setProgress] = useState(0);
    
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [result]);

    const runSimulation = async () => {
        setIsRunning(true);
        setResult(null);
        setProgress(0);

        // Allow UI to update before freezing for calculation
        await new Promise(r => setTimeout(r, 100));

        // --- SIMULATION ENGINE ---
        const events: CombatEvent[] = [];
        let currentTime = 0;
        let totalDamage = 0;
        let hits = 0, crits = 0, misses = 0, casts = 0;

        // --- SETUP ---
        const isCaster = ['Warlock', 'Mage', 'Priest', 'Druid', 'Shaman', 'Paladin'].some(c => spec.includes(c) || ['Balance', 'Elemental', 'Holy', 'Restoration', 'Shadow'].includes(spec));
        const isHealer = ['Restoration', 'Holy', 'Discipline'].some(s => spec.includes(s));
        const isMelee = ['Warrior', 'Rogue', 'Hunter', 'Retribution', 'Feral', 'Enhancement'].includes(spec.split(' ')[0]) || spec.includes('Tank') || spec.includes('Protection');
        const isHunter = spec.includes('Hunter') || spec.includes('Marksmanship') || spec.includes('Beast') || spec.includes('Survival');

        // Target Stats
        const targetDefense = targetType === 'boss' ? 315 : 300;
        const targetLevelDiff = targetType === 'boss' ? 3 : 0;
        
        // --- CASTER LOGIC ---
        if (isCaster && !spec.includes('Feral') && !spec.includes('Enhancement') && !spec.includes('Retribution')) {
            // Determine Spell
            let spellName = 'Shadow Bolt';
            if (spec.includes('Fire')) spellName = 'Fireball';
            if (spec.includes('Frost')) spellName = 'Frostbolt';
            if (spec.includes('Balance')) spellName = 'Starfire';
            if (spec.includes('Elemental')) spellName = 'Lightning Bolt';
            if (isHealer) spellName = spec.includes('Druid') ? 'Healing Touch' : (spec.includes('Paladin') ? 'Holy Light' : 'Heal');
            if (spec.includes('Smite')) spellName = 'Smite'; // Use Heal logic for now or add Smite

            // If spell not in DB, fallback
            if (!SPELL_DB[spellName]) spellName = 'Shadow Bolt';

            const spell = SPELL_DB[spellName];
            
            // Hit Chance (Caster)
            // Cap is 96% (83% base + 16% needed, but 1% always miss). 
            // Boss needs 16% hit. Mob needs 3-4%.
            const hitNeeded = targetType === 'boss' ? 16 : 4;
            const hitChance = Math.min(99, 83 + stats.hit); // simplified
            const missChance = Math.max(1, 100 - hitChance - (hitNeeded > stats.hit ? hitNeeded - stats.hit : 0)); // Very rough

            // Crit Chance
            // Int / Divisor + Crit Rating + Talents (assumed ~5-10% in stats or latent)
            const critChance = Math.min(100, stats.crit);

            // Cast Time (Haste)
            // Classic Haste rating isn't really a thing for spells, but we have % haste buffs
            // stats.haste is %.
            const castTime = spell.time / (1 + (stats.haste / 100));
            const gcd = 1.5; 

            while (currentTime < duration) {
                // Casting
                const actualCast = Math.max(gcd, castTime);
                currentTime += actualCast;
                casts++;

                // Roll Hit
                const roll = Math.random() * 100;
                if (roll < missChance) {
                    events.push({ timestamp: currentTime, source: spellName, amount: 0, type: 'miss' });
                    misses++;
                    continue;
                }

                // Calculate Dmg
                // Base + (SP * Coeff)
                let schoolSp = 0;
                if (spell.school === 'shadow') schoolSp = stats.spShadow;
                if (spell.school === 'fire') schoolSp = stats.spFire;
                if (spell.school === 'frost') schoolSp = stats.spFrost;
                if (spell.school === 'nature') schoolSp = stats.spNature;
                if (spell.school === 'holy') schoolSp = stats.spHoly;
                if (spell.school === 'arcane') schoolSp = stats.spArcane;

                // Total SP = Generic SP + School SP
                const effectiveSp = (isHealer ? stats.healing : stats.sp) + schoolSp;
                
                let dmg = spell.base + (effectiveSp * spell.coeff);
                
                // Multipliers (Dmg Mod + Stat Mod)
                dmg *= (stats.damageMultiplier || 1);

                // Roll Crit
                // 150% base, 200% with Ruin/Ice Shards etc. We'll assume standard 150% for healers, 200% for DPS specs
                const critMult = isHealer ? 1.5 : 2.0; 
                let type: 'hit' | 'crit' = 'hit';
                
                const critRoll = Math.random() * 100;
                if (critRoll < critChance) {
                    dmg *= critMult;
                    type = 'crit';
                    crits++;
                } else {
                    hits++;
                }

                totalDamage += dmg;
                events.push({ timestamp: currentTime, source: spellName, amount: Math.floor(dmg), type, school: spell.school });
                
                // Update progress bar occasionally
                if (casts % 5 === 0) setProgress((currentTime / duration) * 100);
            }
        } 
        // --- MELEE / HUNTER LOGIC ---
        else {
            const mh = equipped['MainHand'];
            const oh = equipped['OffHand']; // Could be weapon or shield/item
            
            // Determine Weapon Speeds & Dmg
            let mhSpeed = 2.0;
            let mhMin = 100, mhMax = 200;
            if (mh) {
                mhSpeed = mh.stats?.speed || 2.0;
                mhMin = mh.stats?.minDmg || 100;
                mhMax = mh.stats?.maxDmg || 200;
            }
            
            // Attack Power
            const ap = isHunter ? (stats.ap + (stats.agi * 2)) : stats.ap; // Simplified hunter AP
            const dpsFromAP = ap / 14;
            
            // Hit Tables (Yellow vs White)
            // Boss: Miss 9% (Dual Wield: 28%), Dodge 6.5%, Parry 14%, Glance 40%
            // We'll simplify significantly.
            const isDualWield = oh && (oh.slot === 'One-Hand' || oh.slot === 'Main Hand' || oh.slot === 'Off Hand') && !isHunter;
            
            const yellowMissChance = Math.max(0, (targetType === 'boss' ? 9 : 5) - stats.hit);
            const whiteMissChance = Math.max(0, (targetType === 'boss' ? (isDualWield ? 28 : 9) : (isDualWield ? 24 : 5)) - stats.hit);
            
            // Crit Cap (simplified)
            const critCap = 100 - (isDualWield ? 25 : 5); // Glancing takes up table
            const effCrit = Math.min(critCap, stats.crit);

            let nextSwing = 0;
            let nextYellow = 0;
            const yellowCD = isHunter ? 10 : 6; // Aimed Shot vs Bloodthirst

            while (currentTime < duration) {
                // Find next event (Swing or Yellow)
                const dt = Math.min(nextSwing, nextYellow) - currentTime;
                if (dt > 0) currentTime += dt; // Warp time
                
                // Handle Yellow
                if (currentTime >= nextYellow) {
                    casts++;
                    nextYellow += yellowCD;
                    
                    const roll = Math.random() * 100;
                    if (roll < yellowMissChance) {
                        events.push({ timestamp: currentTime, source: isHunter ? 'Aimed Shot' : 'Special Attack', amount: 0, type: 'miss' });
                        misses++;
                    } else {
                        // Calc Dmg (Normalized AP + Weapon)
                        const normSpeed = isHunter ? 2.8 : 2.4; // generic normalization
                        const baseWpn = (mhMin + mhMax) / 2;
                        let dmg = baseWpn + (dpsFromAP * normSpeed);
                        
                        // Modifiers
                        dmg *= (stats.damageMultiplier || 1);

                        // Crit
                        const critRoll = Math.random() * 100;
                        if (critRoll < effCrit) {
                            dmg *= (isHunter ? 2.3 : 2.2); // Impale/Mortal Shots
                            crits++;
                            events.push({ timestamp: currentTime, source: isHunter ? 'Aimed Shot' : 'Special Attack', amount: Math.floor(dmg), type: 'crit' });
                        } else {
                            hits++;
                            events.push({ timestamp: currentTime, source: isHunter ? 'Aimed Shot' : 'Special Attack', amount: Math.floor(dmg), type: 'hit' });
                        }
                        totalDamage += dmg;
                    }
                }

                // Handle White Swing
                if (currentTime >= nextSwing) {
                    nextSwing += (mhSpeed / (1 + (stats.haste/100)));
                    
                    const roll = Math.random() * 100;
                    if (roll < whiteMissChance) {
                        misses++;
                    } else {
                        // Glance check (40% on bosses)
                        let isGlance = (targetType === 'boss' && Math.random() < 0.4);
                        
                        // Dmg
                        const baseWpn = Math.random() * (mhMax - mhMin) + mhMin;
                        let dmg = baseWpn + (dpsFromAP * mhSpeed);
                        
                        if (isGlance) {
                            dmg *= 0.7; // 30% reduction default
                            events.push({ timestamp: currentTime, source: 'Auto Attack', amount: Math.floor(dmg), type: 'glance' });
                            hits++; // Count glance as hit for simplicity in breakdown
                        } else {
                            // Crit check
                            if (Math.random() * 100 < effCrit) {
                                dmg *= 2.0;
                                crits++;
                                events.push({ timestamp: currentTime, source: 'Auto Attack', amount: Math.floor(dmg), type: 'crit' });
                            } else {
                                hits++;
                                events.push({ timestamp: currentTime, source: 'Auto Attack', amount: Math.floor(dmg), type: 'hit' });
                            }
                        }
                        totalDamage += dmg;
                    }
                }
                
                // Safety increment to prevent infinite loops if logic fails
                currentTime += 0.1;
                if (casts % 5 === 0) setProgress((currentTime / duration) * 100);
            }
        }

        // Finalize
        setResult({
            dps: Math.floor(totalDamage / duration),
            totalDamage: Math.floor(totalDamage),
            duration,
            events: events.slice(-50), // Keep last 50 for log
            breakdown: { hits, crits, misses, casts }
        });
        setIsRunning(false);
        setProgress(100);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-4xl rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-red-500 font-cinzel text-2xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span>⚔️</span>
                            <span>THE PROVING GROUNDS</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">THEORYCRAFT COMBAT SIMULATOR v1.0</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    
                    {/* LEFT PANEL: Controls & Summary */}
                    <div className="w-full md:w-1/3 bg-[#111] border-r border-[#222] p-6 flex flex-col gap-6">
                        
                        {/* Config */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[#888] tracking-wider">FIGHT DURATION</label>
                                <input 
                                    type="range" min="30" max="300" step="10" 
                                    value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="accent-red-500 h-2 bg-[#222] rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-right text-red-500 font-mono font-bold">{duration}s</div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[#888] tracking-wider">TARGET LEVEL</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setTargetType('boss')}
                                        className={`flex-1 py-2 text-xs font-bold border rounded ${targetType === 'boss' ? 'bg-red-900/30 border-red-500 text-red-500' : 'bg-[#222] border-[#333] text-[#555]'}`}
                                    >
                                        BOSS (+3)
                                    </button>
                                    <button 
                                        onClick={() => setTargetType('mob')}
                                        className={`flex-1 py-2 text-xs font-bold border rounded ${targetType === 'mob' ? 'bg-red-900/30 border-red-500 text-red-500' : 'bg-[#222] border-[#333] text-[#555]'}`}
                                    >
                                        MOB (+0)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <button 
                            onClick={runSimulation}
                            disabled={isRunning}
                            className={`py-4 rounded font-cinzel font-bold text-lg tracking-widest border transition-all relative overflow-hidden group
                                ${isRunning 
                                    ? 'bg-[#222] text-[#555] border-[#333] cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                                }
                            `}
                        >
                            {isRunning ? 'SIMULATING...' : 'ENGAGE'}
                            {isRunning && (
                                <div 
                                    className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all duration-100"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            )}
                        </button>

                        {/* Quick Stats Summary */}
                        <div className="mt-auto border-t border-[#222] pt-4">
                            <div className="text-[10px] text-[#555] font-bold mb-2 uppercase tracking-widest">Input Stats</div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-[#aaa]">
                                <div className="flex justify-between"><span>Hit:</span> <span className="text-white font-mono">{stats.hit.toFixed(1)}%</span></div>
                                <div className="flex justify-between"><span>Crit:</span> <span className="text-white font-mono">{stats.crit.toFixed(1)}%</span></div>
                                <div className="flex justify-between"><span>Pwr:</span> <span className="text-white font-mono">{stats.sp || stats.ap}</span></div>
                                <div className="flex justify-between"><span>Haste:</span> <span className="text-white font-mono">{stats.haste}%</span></div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Results & Log */}
                    <div className="w-full md:w-2/3 bg-[#0a0a0c] flex flex-col relative">
                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none"></div>

                        {result ? (
                            <div className="flex flex-col h-full z-10">
                                {/* Big Number */}
                                <div className="p-8 text-center border-b border-[#222]">
                                    <div className="text-[10px] text-red-500 font-bold tracking-[0.3em] mb-2 animate-pulse">ESTIMATED PERFORMANCE</div>
                                    <div className="text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]">
                                        {result.dps.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-[#666] font-bold mt-1 tracking-widest">
                                        {['Restoration', 'Holy'].some(s => spec.includes(s)) ? 'HPS' : 'DPS'}
                                    </div>
                                </div>

                                {/* Breakdown Bars */}
                                <div className="grid grid-cols-4 gap-px bg-[#222] border-b border-[#222]">
                                    <div className="bg-[#111] p-3 text-center">
                                        <div className="text-[9px] text-[#666] uppercase tracking-wide">Total</div>
                                        <div className="text-xs font-bold text-[#eee]">{result.totalDamage.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-[#111] p-3 text-center">
                                        <div className="text-[9px] text-[#666] uppercase tracking-wide">Crits</div>
                                        <div className="text-xs font-bold text-red-400">{result.breakdown.crits} ({((result.breakdown.crits/result.breakdown.casts)*100).toFixed(0)}%)</div>
                                    </div>
                                    <div className="bg-[#111] p-3 text-center">
                                        <div className="text-[9px] text-[#666] uppercase tracking-wide">Misses</div>
                                        <div className="text-xs font-bold text-[#888]">{result.breakdown.misses}</div>
                                    </div>
                                    <div className="bg-[#111] p-3 text-center">
                                        <div className="text-[9px] text-[#666] uppercase tracking-wide">Actions</div>
                                        <div className="text-xs font-bold text-[#eee]">{result.breakdown.casts}</div>
                                    </div>
                                </div>

                                {/* Combat Log */}
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <div className="bg-[#151515] px-4 py-2 text-[10px] text-[#666] font-bold tracking-widest border-b border-[#222]">COMBAT LOG (LAST 50 EVENTS)</div>
                                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-[#333]" ref={logRef}>
                                        {result.events.map((ev, i) => (
                                            <div key={i} className="flex gap-3 border-b border-[#1a1a1a] pb-1 mb-1 last:border-0">
                                                <span className="text-[#444] min-w-[40px]">{(ev.timestamp).toFixed(1)}s</span>
                                                <span className="text-[#aaa] flex-1">
                                                    {ev.source} {ev.type === 'crit' ? 'crits' : (ev.type === 'miss' ? 'misses' : (ev.type === 'glance' ? 'glances' : 'hits'))} for 
                                                    <span className={`ml-1 font-bold ${ev.type === 'crit' ? 'text-red-400' : (ev.type === 'miss' ? 'text-[#555]' : 'text-white')}`}>
                                                        {ev.amount}
                                                    </span> 
                                                    {ev.school && <span className="text-[#444] ml-1 text-[10px] uppercase">{ev.school}</span>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-[#333]">
                                <div className="text-4xl mb-4 opacity-20">⚔️</div>
                                <div className="text-xs font-cinzel font-bold tracking-widest opacity-50">READY TO SIMULATE</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
