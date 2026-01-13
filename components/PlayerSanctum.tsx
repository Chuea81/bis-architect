
import React, { useMemo, useState, useEffect } from 'react';
import { Build, Item, ClassName, SpecName, ItemStats, StatWeights, Enchant, SavedBuild, RaceName, RealmType, Gender, AggregatedStats } from '../types';
import { CLASS_CONFIG, BASE_STATS, CONSUMABLE_DATABASE, SET_DATABASE, CLASS_RACES, RACIAL_STATS, STAT_WEIGHTS } from '../constants';
import { getIconUrl, calculateTotalStats } from '../services/gearService';
import Slot from './Slot';
import { ItemTooltip } from './ItemTooltip';
import { BuffManager } from './BuffManager';
import { TheorycraftModal } from './TheorycraftModal';
import { EnchantManager } from './EnchantManager';
import { BuildManager } from './BuildManager';
import { CombatSimModal } from './CombatSimModal';
import { OraclesInsight } from './OraclesInsight';
import { TalentCalculator } from './TalentCalculator';

// ... interface definitions ...
interface PlayerSanctumProps {
    equipped: Build;
    currentClass: ClassName;
    setClass: (c: ClassName) => void;
    currentSpec?: SpecName; 
    
    // Race Props
    currentRace: RaceName;
    setRace: (r: RaceName) => void;
    currentRealm: RealmType;

    // Gender Props
    currentGender: Gender;
    setGender: (g: Gender) => void;

    // Char Name Props
    charName: string;
    setCharName: (name: string) => void;

    activeBuffs: string[];
    onToggleBuff: (buff: string) => void;
    onUnequip: (slot: string) => void;
    onEquip: (item: Item, targetSlotId?: string) => void; // New Prop for DnD
    onWipe: () => void;
    onExport: () => void;
    
    // Theorycrafting Props
    talentStats: ItemStats;
    setTalentStats: (s: ItemStats) => void;
    selectedTalents: string[]; // Legacy
    setSelectedTalents: (t: string[]) => void; // Legacy
    customWeights: Record<string, StatWeights>;
    setCustomWeights: (w: Record<string, StatWeights>) => void;
    
    // Talent Calculator Props (NEW)
    talentPoints?: Record<string, number>;
    setTalentPoints?: (points: Record<string, number>) => void;

    // Enchant Props
    onApplyEnchant: (slotId: string, enchant: Enchant) => void;
    onRemoveEnchant: (slotId: string) => void;

    // Build Manager Props
    savedBuilds: SavedBuild[];
    onSaveBuild: (name: string) => void;
    onLoadBuild: (build: SavedBuild) => void;
    onDeleteBuild: (id: string) => void;
}

// ... Visual Components (RuneRing, ClassParticles, etc.) remain unchanged ...
const RuneRing = ({ color, size, speed, reverse = false, opacity = 0.1 }: { color: string, size: number, speed: number, reverse?: boolean, opacity?: number }) => {
    const runes = useMemo(() => {
        const chars = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
        const count = 12;
        return Array.from({ length: count }).map((_, i) => ({
            char: chars[Math.floor(Math.random() * chars.length)],
            rotation: (i * (360 / count))
        }));
    }, []);

    return (
         <div 
            className="absolute flex items-center justify-center pointer-events-none select-none overflow-visible"
            style={{ 
                width: size, 
                height: size, 
                opacity: opacity,
                color: color,
                animation: `spin ${speed}s linear infinite ${reverse ? 'reverse' : 'normal'}`
            }}
        >
            <div className="absolute inset-0 rounded-full border border-current opacity-20" style={{ borderColor: color }}></div>
            <div className="absolute inset-2 rounded-full border border-dotted border-current opacity-10" style={{ borderColor: color }}></div>
            {runes.map((r, i) => (
                <div 
                    key={i}
                    className="absolute text-[10px] font-serif font-bold opacity-60"
                    style={{ 
                        transform: `rotate(${r.rotation}deg) translateY(-${size/2}px)`,
                        textShadow: `0 0 5px ${color}`
                    }}
                >
                    {r.char}
                </div>
            ))}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const ClassParticles = ({ color }: { color: string }) => {
    const particles = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        top: 60 + Math.random() * 40,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * -10,
        size: 1 + Math.random() * 2,
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {particles.map(p => (
                 <div 
                    key={p.id}
                    className="absolute rounded-full blur-[1px]"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: color,
                        boxShadow: `0 0 ${p.size * 3}px ${color}`,
                        opacity: 0,
                        animation: `particleFloat ${p.duration}s ease-in-out infinite`,
                        animationDelay: `${p.delay}s`
                    }}
                 />
             ))}
             <style>{`
                @keyframes particleFloat {
                    0% { transform: translateY(0) scale(0); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: translateY(-60px) scale(0); opacity: 0; }
                }
             `}</style>
        </div>
    )
};

const StatGroup = ({ title, children, accentColor = "#444", defaultOpen = true }: { title: string, children?: React.ReactNode, accentColor?: string, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-[#27272a] rounded overflow-hidden mb-3 last:mb-0 shadow-sm group hover:border-stone-300 dark:hover:border-[#333] transition-colors">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-[#fcfcfc] dark:bg-[#18181b] px-3 py-1.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#1f1f22] transition-colors cursor-pointer select-none ${isOpen ? 'border-b border-stone-100 dark:border-[#27272a]' : ''}`}
            >
                <div className="flex items-center gap-2">
                    <div className="w-1 h-3 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }}></div>
                    <span className="text-[9px] font-cinzel font-bold tracking-widest text-stone-700 dark:text-[#d4d4d8]">{title}</span>
                </div>
                <span className={`text-[10px] text-stone-500 dark:text-[#666] transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-2 flex flex-col gap-0.5">
                    {children}
                </div>
            </div>
        </div>
    );
};

const StatRow = ({ label, value, color, valClass, tooltip, rank }: { label: string, value: string | number, color?: string, valClass?: string, tooltip?: string, rank?: number }) => {
    
    // Explicitly typed to allow textShadow and other CSS properties
    let labelStyle: React.CSSProperties = color ? { color } : {};
    let icon = null;
    let labelClass = "text-stone-600 dark:text-[#71717a]"; // Default gray

    if (rank === 0) { // Legendary
        labelStyle = { color: '#ff8000', textShadow: '0 0 5px rgba(255,128,0,0.3)' };
        labelClass = "text-[#ff8000]";
        icon = <span className="text-[#ff8000] text-[10px] mr-1">★</span>;
    } else if (rank === 1) { // Epic
        labelStyle = { color: '#a335ee' };
        labelClass = "text-[#a335ee]";
    } else if (rank === 2) { // Rare
        labelStyle = { color: '#0070dd' };
        labelClass = "text-[#0070dd]";
    }

    return (
        <div 
            title={tooltip}
            className="flex justify-between items-center text-[10px] py-0.5 px-2 hover:bg-stone-50 dark:hover:bg-[#1f1f22] rounded cursor-help transition-colors"
        >
            <div className="flex items-center">
                {icon}
                <span className={`font-bold tracking-wide ${labelClass}`} style={labelStyle}>{label}</span>
            </div>
            <span className={`font-mono font-bold ${valClass ? valClass : 'text-stone-900 dark:text-[#f4f4f5]'}`}>{value}</span>
        </div>
    );
};

// ... (LeyLineOverlay, OrnamentalFrame, HeroPortrait components kept as is) ...
const LeyLineOverlay = ({ color }: { color: string }) => (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <svg className="w-full h-full" style={{ stroke: color }}>
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <path d="M 50 40 L 90 40 L 130 120" fill="none" strokeWidth="1" opacity="0.5" />
            <path d="M 50 150 L 80 150 L 120 160" fill="none" strokeWidth="1" opacity="0.5" />
            <path d="M 50 250 L 80 250 L 130 200" fill="none" strokeWidth="1" opacity="0.5" />
            <path d="M 370 40 L 330 40 L 290 120" fill="none" strokeWidth="1" opacity="0.5" />
            <path d="M 370 150 L 340 150 L 300 160" fill="none" strokeWidth="1" opacity="0.5" />
            <path d="M 370 250 L 340 250 L 290 200" fill="none" strokeWidth="1" opacity="0.5" />
            <path d="M 170 380 L 190 340 L 210 320" fill="none" strokeWidth="1" opacity="0.4" />
            <path d="M 250 380 L 230 340 L 210 320" fill="none" strokeWidth="1" opacity="0.4" />
            <circle cx="130" cy="120" r="2" fill={color} opacity="0.8" />
            <circle cx="290" cy="120" r="2" fill={color} opacity="0.8" />
            <circle cx="210" cy="320" r="3" fill={color} opacity="0.6" filter="url(#glow)" />
        </svg>
    </div>
);

const OrnamentalFrame = ({ color }: { color: string }) => (
    <div className="absolute inset-4 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/20 rounded-tl-lg" style={{ borderColor: color }}></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/20 rounded-tr-lg" style={{ borderColor: color }}></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/20 rounded-bl-lg" style={{ borderColor: color }}></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/20 rounded-br-lg" style={{ borderColor: color }}></div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-px h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        <div className="absolute inset-2 border border-white/5 rounded opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    </div>
);

const HeroPortrait = ({ 
    currentClass, 
    currentRace, 
    currentGender, 
    color 
}: { 
    currentClass: ClassName, 
    currentRace: RaceName, 
    currentGender: Gender, 
    color: string 
}) => {
    const getRaceIcon = () => {
        const genderSuffix = currentGender === 'Male' ? 'male' : 'female';
        let raceKey = currentRace.toLowerCase().replace(/\s/g, '');
        if (raceKey === 'undead') raceKey = 'scourge';
        if (raceKey === 'nightelf') raceKey = 'nightelf';
        if (raceKey === 'highelf') raceKey = 'bloodelf'; 
        return `race_${raceKey}_${genderSuffix}`;
    };

    const getClassIcon = () => `classicon_${currentClass.toLowerCase()}`;

    const raceIconUrl = getIconUrl(getRaceIcon());
    const classIconUrl = getIconUrl(getClassIcon());

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div 
                className="absolute inset-0 opacity-20 transition-colors duration-1000"
                style={{ background: `radial-gradient(circle at 50% 30%, ${color}, transparent 70%)` }}
            ></div>
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 scale-[3] blur-sm grayscale mix-blend-screen pointer-events-none">
                <img src={classIconUrl} alt="" className="w-64 h-64 object-cover" />
            </div>
            <ClassParticles color={color} />
            <div className="transition-opacity duration-1000 opacity-100">
                <RuneRing color={color} size={300} speed={80} opacity={0.08} />
                <RuneRing color={color} size={220} speed={50} opacity={0.05} reverse />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-10 flex flex-col items-center justify-center">
                <div className="relative group">
                    <div 
                        className="absolute -inset-8 rounded-full opacity-10 blur-3xl transition-all duration-1000 group-hover:opacity-25"
                        style={{ backgroundColor: color }}
                    ></div>
                    <div className="relative w-32 h-32 rounded-full p-[3px] bg-gradient-to-b from-[#94a3b8] via-[#e2e8f0] to-[#475569] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#000]">
                        <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-b from-[#b45309] to-[#fbbf24]">
                            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                <img 
                                    src={raceIconUrl} 
                                    alt={`${currentRace}`} 
                                    className="w-full h-full object-cover scale-105"
                                />
                                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"></div>
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full border-2 border-[#111] bg-[#1a1a1a] flex items-center justify-center shadow-lg overflow-hidden z-20">
                            <img src={classIconUrl} alt={currentClass} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -left-1 w-9 h-9 rounded-full border-2 border-[#111] bg-[#1a1a1a] flex items-center justify-center shadow-lg z-20">
                            <span className="font-cinzel font-bold text-[#fbbf24] text-[11px]">60</span>
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex flex-col items-center gap-0.5">
                    <div className="text-[#e2e8f0] font-cinzel font-bold text-sm tracking-[0.2em] drop-shadow-md">
                        {currentClass.toUpperCase()}
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#555] to-transparent"></div>
                </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0a0a0a_95%)] pointer-events-none"></div>
        </div>
    );
};

// ... (PlayerSanctum component definition starts here) ...
const PlayerSanctum: React.FC<PlayerSanctumProps> = ({ 
    equipped, currentClass, setClass, currentSpec, 
    currentRace, setRace, currentRealm,
    currentGender, setGender,
    charName, setCharName,
    activeBuffs, onToggleBuff, onUnequip, onEquip, onWipe, onExport,
    talentStats, setTalentStats, selectedTalents, setSelectedTalents, customWeights, setCustomWeights,
    talentPoints = {}, setTalentPoints = () => {},
    onApplyEnchant, onRemoveEnchant,
    savedBuilds, onSaveBuild, onLoadBuild, onDeleteBuild
}) => {
    // ... (Hooks and calculations logic remain unchanged) ...
    // Tooltip State
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // UI State
    const [showBuffManager, setShowBuffManager] = useState(false);
    const [showTheorycraft, setShowTheorycraft] = useState(false);
    const [showBuildManager, setShowBuildManager] = useState(false);
    const [showCombatSim, setShowCombatSim] = useState(false);
    const [showTalents, setShowTalents] = useState(false); 
    
    // Enchant UI State
    const [enchantingSlot, setEnchantingSlot] = useState<string | null>(null);

    // Name Lock State
    const [isNameLocked, setIsNameLocked] = useState(false);

    const classData = CLASS_CONFIG[currentClass];

    const availableRaces = useMemo(() => {
        const allowed = CLASS_RACES[currentClass] || [];
        return allowed.filter(r => {
            if (r === 'High Elf' || r === 'Goblin') {
                return currentRealm === 'Turtle';
            }
            return true;
        });
    }, [currentClass, currentRealm]);

    useEffect(() => {
        if (!availableRaces.includes(currentRace)) {
            setRace(availableRaces[0]);
        }
    }, [currentClass, availableRaces, currentRace, setRace]);

    // --- RANKING LOGIC FOR STATS ---
    const getStatRank = (statKey: keyof StatWeights): number => {
        if (!currentSpec) return -1;
        const weights = customWeights[currentSpec] || STAT_WEIGHTS[currentSpec] || {};
        
        // Convert to array of [key, value], filter out 0 weights, sort descending by value
        const sorted = Object.entries(weights)
            .filter(([_, val]) => val !== undefined && (val as number) > 0)
            .sort((a, b) => (b[1] as number) - (a[1] as number));
        
        // Find index of current statKey
        // Return 0 for top (Legendary), 1 for 2nd (Epic), 2 for 3rd (Rare), else -1
        const rank = sorted.findIndex(([k]) => k === statKey);
        
        return (rank >= 0 && rank <= 2) ? rank : -1;
    };

    const handleMouseEnter = (item: Item, e: React.MouseEvent) => {
        setHoveredItem(item);
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const handleSlotRightClick = (slotId: string, e: React.MouseEvent) => {
        if (equipped[slotId]) {
            setEnchantingSlot(slotId);
        }
    };
    
    const stats = useMemo((): AggregatedStats => {
        const racialStats = RACIAL_STATS[currentRace] || {};
        return calculateTotalStats(equipped, activeBuffs, talentStats, racialStats);
    }, [equipped, activeBuffs, talentStats, currentRace]);

    const activeSetBonuses = useMemo(() => {
        const setCounts: Record<string, number> = {};
        (Object.values(equipped) as (Item | undefined)[]).forEach(item => {
            if (item && item.setName) {
                setCounts[item.setName] = (setCounts[item.setName] || 0) + 1;
            }
        });

        const active = [];
        for (const [setName, count] of Object.entries(setCounts)) {
            const set = SET_DATABASE[setName];
            if (set) {
                const bonuses = set.bonuses.filter(b => count >= b.threshold);
                if (bonuses.length > 0) {
                    active.push({ setName, count, total: set.items.length, bonuses });
                }
            }
        }
        return active;
    }, [equipped]);

    const base = BASE_STATS[currentClass];
    const statMult = stats.statMultiplier || 1;
    const intMult = 1 + ((stats.intMod || 0) / 100);
    const spiMult = 1 + ((stats.spiritMod || 0) / 100);
    const staMult = 1 + ((stats.staminaMod || 0) / 100);
    const strMult = 1 + ((stats.strMod || 0) / 100);
    const agiMult = 1 + ((stats.agiMod || 0) / 100);
    const hpMult = 1 + ((stats.healthMod || 0) / 100);
    const dmgMult = stats.damageMultiplier || 1;

    const totalSta = Math.floor((base.sta + stats.stam) * statMult * staMult);
    const totalInt = Math.floor((base.int + stats.int) * statMult * intMult);
    const totalSpi = Math.floor((base.spi + stats.spirit) * statMult * spiMult);
    const totalStr = Math.floor((base.str + stats.str) * statMult * strMult);
    const totalAgi = Math.floor((base.agi + stats.agi) * statMult * agiMult);

    const rawHealth = base.hp + (totalSta * 10) + stats.health;
    const totalHealth = Math.floor(rawHealth * hpMult);
    const totalMana = base.mp > 0 ? base.mp + (totalInt * 15) + stats.mana : 0;
    
    const isMeleeClass = ['Warrior', 'Rogue', 'Hunter'].includes(currentClass);
    const critStat = isMeleeClass ? totalAgi : totalInt;
    const baseCritChance = (critStat / base.critDivisor);
    const totalCrit = baseCritChance + stats.crit; 
    const spellHit = stats.hit; 
    const spiritMp5 = (totalSpi / 5) + 15; 
    const totalMp5 = stats.mp5; 

    const getRangedLabel = () => {
        if (["Paladin"].includes(currentClass)) return "LIBRAM";
        if (["Druid"].includes(currentClass)) return "IDOL";
        if (["Shaman"].includes(currentClass)) return "TOTEM";
        return "RANGED";
    };

    const LEFT_SLOTS = [
        { id: "Head", label: "HEAD" },
        { id: "Neck", label: "NECK" },
        { id: "Shoulder", label: "SHLDR" },
        { id: "Back", label: "BACK" },
        { id: "Chest", label: "CHEST" },
        { id: "Wrist", label: "WRIST" },
        { id: "Hands", label: "HANDS" },
        { id: "Waist", label: "WAIST" },
    ];

    const RIGHT_SLOTS = [
        { id: "Legs", label: "LEGS" },
        { id: "Feet", label: "FEET" },
        { id: "Ring_1", label: "RING 1" },
        { id: "Ring_2", label: "RING 2" },
        { id: "Trinket_1", label: "TRNK 1" },
        { id: "Trinket_2", label: "TRNK 2" },
        { id: "Ranged", label: getRangedLabel() },
    ];

    const BOTTOM_SLOTS = [
        { id: "MainHand", label: "MAIN HAND" },
        { id: "OffHand", label: "OFF HAND" },
    ];

    return (
        <section className="w-full lg:w-[420px] min-w-0 lg:min-w-[420px] shrink-0 bg-stone-100 dark:bg-[#0e0e10] border-r border-stone-300 dark:border-[#27272a] flex flex-col h-auto lg:h-full z-30 relative shadow-[10px_0_40px_rgba(0,0,0,0.5)] transition-colors duration-300">
            
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-stone-200 dark:border-[#27272a] bg-[#fafaf9] dark:bg-[#0e0e10] z-20">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 dark:text-[#a1a1aa] font-cinzel font-bold tracking-[0.2em] select-none mr-2">EQUIPMENT</span>
                 </div>
                 <div className="flex flex-col items-end gap-0.5">
                     <span className="text-[12px] text-stone-900 dark:text-[#f4f4f5] font-cinzel font-bold tracking-[0.15em] leading-none drop-shadow-sm" title={`Current Specialization: ${currentSpec}`}>
                        {currentSpec?.split('(')[0].toUpperCase()}
                     </span>
                     <div className="flex items-center gap-1.5" title={`Current Class: ${currentClass}`}>
                         <span className="text-[9px] text-stone-500 dark:text-[#a1a1aa] font-bold tracking-widest leading-none">{currentRace.toUpperCase()}</span>
                         <div className="h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]" style={{ color: classData.color, backgroundColor: classData.color }}></div>
                     </div>
                 </div>
            </div>

            {/* Paperdoll Container */}
            <div className="relative bg-[#0a0a0a] border-b border-stone-300 dark:border-[#27272a] flex flex-col items-center shrink-0 group">
                <HeroPortrait currentClass={currentClass} currentRace={currentRace} currentGender={currentGender} color={classData.color} />
                <LeyLineOverlay color={classData.color} />
                <OrnamentalFrame color={classData.color} />

                {/* --- SLOTS LAYOUT GRID --- */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 pb-6">
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col gap-1 justify-start">
                            {LEFT_SLOTS.map(s => <Slot key={s.id} id={s.id} label={s.label} item={equipped[s.id]} onUnequip={onUnequip} onDropEquip={onEquip} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onContextMenu={(e) => handleSlotRightClick(s.id, e)} />)}
                        </div>
                        <div className="flex-grow min-w-[120px]"></div>
                        <div className="flex flex-col gap-1 justify-start">
                            {RIGHT_SLOTS.map(s => <Slot key={s.id} id={s.id} label={s.label} item={equipped[s.id]} onUnequip={onUnequip} onDropEquip={onEquip} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onContextMenu={(e) => handleSlotRightClick(s.id, e)} />)}
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-3 relative">
                        {BOTTOM_SLOTS.map(s => <Slot key={s.id} id={s.id} label={s.label} item={equipped[s.id]} onUnequip={onUnequip} onDropEquip={onEquip} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onContextMenu={(e) => handleSlotRightClick(s.id, e)} />)}
                    </div>
                    <div className="text-center mt-1 opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-[7px] text-[#555] font-cinzel tracking-[0.2em]">DRAG ITEMS TO EQUIP</span>
                    </div>
                </div>
            </div>

            {/* Footer Area: Stats - Scrollable */}
            <div className="flex-grow flex flex-col bg-[#f5f5f4] dark:bg-[#0e0e10] z-20 min-h-0 transition-colors duration-300">
                <div className="overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-stone-400 dark:scrollbar-thumb-zinc-700">
                    {activeBuffs.length > 0 && (
                        <div className="mb-4 animate-in fade-in duration-300">
                            <div className="text-[10px] text-stone-500 dark:text-[#a1a1aa] font-cinzel font-bold tracking-widest border-b border-stone-200 dark:border-[#333] mb-2 flex justify-between items-center">
                                <span>ACTIVE BUFFS</span>
                                <span className="text-[#b45309] dark:text-[#FFD700]">{activeBuffs.length}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {activeBuffs.map(buffName => {
                                    const buff = CONSUMABLE_DATABASE.find(c => c.name === buffName);
                                    if (!buff) return null;
                                    return (
                                        <div 
                                            key={buffName}
                                            className="relative group w-8 h-8 rounded border border-stone-300 dark:border-[#333] bg-white dark:bg-[#111] overflow-hidden cursor-pointer hover:border-[#b45309] dark:hover:border-[#FFD700] transition-colors shadow-sm"
                                            onClick={() => onToggleBuff(buffName)}
                                            title={`${buff.name}\n${buff.description}\n(Click to remove)`}
                                        >
                                            <img src={getIconUrl(buff.icon)} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" alt={buff.name} />
                                            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/20 transition-colors flex items-center justify-center">
                                                <span className="text-white opacity-0 group-hover:opacity-100 text-[10px] font-bold">✕</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* --- VISUAL SET BONUS TRACKER --- */}
                    {activeSetBonuses.length > 0 && (
                        <div className="mb-4 animate-in fade-in duration-300">
                            <div className="bg-white dark:bg-[#18181b]/60 border border-[#b3a06d]/40 rounded overflow-hidden shadow-sm">
                                <div className="bg-stone-50 dark:bg-[#1f1f22]/90 px-3 py-1.5 border-b border-[#b3a06d]/30 flex items-center gap-2">
                                    <div className="text-[12px]">✨</div>
                                    <span className="text-[9px] font-cinzel font-bold tracking-widest text-[#b45309] dark:text-[#FFD700]">ACTIVE SET BONUSES</span>
                                </div>
                                <div className="p-3 flex flex-col gap-3">
                                    {activeSetBonuses.map((set, idx) => (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[#b45309] dark:text-[#FFD700] text-[11px] font-bold tracking-wide">{set.setName}</span>
                                                <span className="text-[9px] text-stone-500 dark:text-[#888] font-mono">({set.count}/{set.total})</span>
                                            </div>
                                            {set.bonuses.map((bonus, bIdx) => (
                                                <div key={bIdx} className="text-[10px] text-emerald-700 dark:text-[#4ade80] pl-2 border-l border-emerald-500/30 leading-snug">
                                                    <span className="font-bold mr-1">({bonus.threshold}):</span>
                                                    <span className="opacity-90">{bonus.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STATS SECTIONS - Now Collapsible & Ranked */}
                    <StatGroup title="VITALS & ATTRIBUTES" accentColor="#4ade80">
                        <StatRow label="Health" value={`${totalHealth}`} valClass="text-emerald-700 dark:text-[#4ade80]" tooltip="Total Health Pool" />
                        <StatRow label="Mana" value={totalMana} valClass="text-blue-700 dark:text-[#60a5fa]" tooltip="Total Mana Pool" />
                        <StatRow label="Stamina" value={totalSta} valClass="text-emerald-600 dark:text-[#86efac]" tooltip="Increases Health" rank={getStatRank('stam')} />
                        <StatRow label="Intellect" value={totalInt} valClass="text-blue-600 dark:text-[#93c5fd]" tooltip="Increases Mana and Spell Crit" rank={getStatRank('int')} />
                        <StatRow label="Spirit" value={totalSpi} valClass="text-stone-500 dark:text-[#cbd5e1]" tooltip="Increases Health and Mana Regeneration" rank={getStatRank('spirit')} />
                        <StatRow label="Strength" value={totalStr} valClass="text-red-600 dark:text-[#fca5a5]" tooltip="Increases Melee Attack Power" rank={getStatRank('str')} />
                        <StatRow label="Agility" value={totalAgi} valClass="text-amber-600 dark:text-[#fcd34d]" tooltip="Increases Crit, Dodge, and Armor" rank={getStatRank('agi')} />
                        <StatRow label="Gear Armor" value={stats.armor} tooltip="Total Armor from equipped items" rank={getStatRank('armor')} />
                    </StatGroup>

                    <StatGroup title="COMBAT PERFORMANCE" accentColor="#d8b4fe">
                        <StatRow label="Spell Power" value={stats.sp} valClass="text-purple-700 dark:text-[#d8b4fe]" tooltip="Increases damage and healing of all spells" rank={getStatRank('sp')} />
                        {isMeleeClass && <StatRow label="Attack Power" value={isMeleeClass ? (stats.ap + (stats.str * 2)) : stats.ap} valClass="text-red-600 dark:text-[#fca5a5]" tooltip="Increases melee damage" rank={getStatRank('ap')} />}
                        <StatRow label="Healing Pwr" value={stats.healing} valClass="text-emerald-600 dark:text-[#86efac]" tooltip="Increases healing done" rank={getStatRank('healing')} />
                        <StatRow label="Spell Hit" value={`${spellHit}%`} valClass="text-amber-600 dark:text-[#fde047]" tooltip="Reduces chance for spells to resist" rank={getStatRank('hit')} />
                        <StatRow 
                            label={isMeleeClass ? "Crit Chance" : "Spell Crit"} 
                            value={`${totalCrit.toFixed(2)}%`} 
                            valClass="text-red-600 dark:text-[#fca5a5]" 
                            tooltip={isMeleeClass ? "Chance for attacks to deal 200% damage" : "Chance for spells to deal 150% damage"}
                            rank={getStatRank('crit')}
                        />
                        <StatRow label={isMeleeClass ? "Attack Speed" : "Spell Haste"} value={`${stats.haste}%`} tooltip="Increases attack/cast speed" />
                        <StatRow label="Spell Pen" value={stats.spellPen} tooltip="Reduces target's resistance to your spells" />
                        {dmgMult > 1 && (
                            <StatRow label="Damage Mod" value={`${((dmgMult - 1) * 100).toFixed(0)}%`} valClass="text-[#ff0000]" tooltip="Multiplicative damage modifier" />
                        )}
                    </StatGroup>

                    <StatGroup title="REGENERATION" accentColor="#60a5fa">
                         <StatRow label="Mp5" value={`${totalMp5} / ${spiritMp5.toFixed(0)} (Spirit)`} tooltip="Mana generated every 5 seconds (Gear / Spirit-based)" rank={getStatRank('mp5')} />
                         <StatRow label="Hp5" value={stats.hp5} tooltip="Health generated every 5 seconds" />
                         <StatRow label="% Regen Casting" value={`${stats.regenCasting}%`} tooltip="Percentage of mana regeneration active while casting" />
                    </StatGroup>

                    <div className="grid grid-cols-2 gap-3 items-start">
                        <StatGroup title="ELEMENTAL" accentColor="#fcd34d">
                            <StatRow label="Arcane" value={stats.sp + stats.spArcane} valClass="text-amber-600 dark:text-[#ffff9a]" tooltip="Total Arcane Spell Power" />
                            <StatRow label="Fire" value={stats.sp + stats.spFire} valClass="text-red-600 dark:text-[#ff9a9a]" tooltip="Total Fire Spell Power" />
                            <StatRow label="Frost" value={stats.sp + stats.spFrost} valClass="text-sky-600 dark:text-[#9adfff]" tooltip="Total Frost Spell Power" />
                            <StatRow label="Shadow" value={stats.sp + stats.spShadow} valClass="text-purple-600 dark:text-[#d99aff]" tooltip="Total Shadow Spell Power" />
                            <StatRow label="Nature" value={stats.sp + stats.spNature} valClass="text-emerald-600 dark:text-[#9aff9a]" tooltip="Total Nature Spell Power" />
                            <StatRow label="Holy" value={stats.sp + stats.spHoly} valClass="text-yellow-600 dark:text-[#fffdc9]" tooltip="Total Holy Spell Power" />
                        </StatGroup>

                        <StatGroup title="WARDS" accentColor="#94a3b8">
                            <StatRow label="Fire" value={stats.resFire} valClass="text-red-600 dark:text-[#ff9a9a]" tooltip="Reduces damage from Fire attacks" />
                            <StatRow label="Frost" value={stats.resFrost} valClass="text-sky-600 dark:text-[#9adfff]" tooltip="Reduces damage from Frost attacks" />
                            <StatRow label="Nature" value={stats.resNature} valClass="text-emerald-600 dark:text-[#9aff9a]" tooltip="Reduces damage from Nature attacks" />
                            <StatRow label="Shadow" value={stats.resShadow} valClass="text-purple-600 dark:text-[#d99aff]" tooltip="Reduces damage from Shadow attacks" />
                            <StatRow label="Arcane" value={stats.resArcane} valClass="text-amber-600 dark:text-[#ffff9a]" tooltip="Reduces damage from Arcane attacks" />
                        </StatGroup>
                    </div>

                </div>

                {/* Controls Area */}
                <div className="border-t border-stone-200 dark:border-[#222] p-5 bg-[#e7e5e4] dark:bg-[#121214]">
                    {/* ... (Existing controls remain unchanged) ... */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                       {/* Class Select */}
                       <div className="flex flex-col gap-1">
                           <label className="text-[8px] text-stone-600 dark:text-[#a1a1aa] font-bold tracking-widest pl-1 font-cinzel">CLASS</label>
                           <div className="relative group" title="Select character class">
                               <select 
                                   value={currentClass} 
                                   onChange={(e) => setClass(e.target.value as ClassName)}
                                   className="w-full appearance-none bg-white dark:bg-[#050505] border border-stone-300 dark:border-[#333] text-[10px] font-cinzel font-bold py-2.5 px-3 rounded hover:border-stone-500 dark:hover:border-[#666] hover:bg-white dark:hover:bg-[#222] focus:border-[#b45309] outline-none transition-colors uppercase cursor-pointer shadow-inner focus:shadow-[0_0_8px_rgba(180,83,9,0.3)]"
                                   style={{ color: classData.color, borderColor: `${classData.color}40` }}
                               >
                                   {Object.keys(CLASS_CONFIG).map(c => (
                                       <option 
                                            key={c} 
                                            value={c}
                                            style={{ color: CLASS_CONFIG[c as ClassName].color, backgroundColor: '#121212' }}
                                       >
                                           {c}
                                       </option>
                                   ))}
                                </select>
                               <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-500 dark:text-[#666] text-[8px] group-hover:text-stone-800 dark:group-hover:text-[#aaa]">▼</div>
                           </div>
                       </div>
                       
                       {/* Race & Gender Row */}
                       <div className="flex gap-2">
                           <div className="flex-grow flex flex-col gap-1">
                               <label className="text-[8px] text-stone-600 dark:text-[#a1a1aa] font-bold tracking-widest pl-1 font-cinzel">RACE</label>
                               <div className="relative group" title="Select character race">
                                   <select 
                                       value={currentRace} 
                                       onChange={(e) => setRace(e.target.value as RaceName)}
                                       className="w-full appearance-none bg-white dark:bg-[#050505] border border-stone-300 dark:border-[#333] text-stone-800 dark:text-[#eee] text-[10px] font-cinzel font-bold py-2.5 px-3 rounded hover:border-stone-500 dark:hover:border-[#666] hover:bg-white dark:hover:bg-[#222] focus:border-[#b45309] outline-none transition-colors uppercase cursor-pointer shadow-inner focus:shadow-[0_0_8px_rgba(180,83,9,0.3)]"
                                   >
                                       {availableRaces.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                   <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-500 dark:text-[#666] text-[8px] group-hover:text-stone-800 dark:group-hover:text-[#aaa]">▼</div>
                               </div>
                           </div>

                           <div className="w-1/3 flex flex-col gap-1">
                               <label className="text-[8px] text-stone-600 dark:text-[#a1a1aa] font-bold tracking-widest pl-1 font-cinzel">GENDER</label>
                               <div className="relative group" title="Select character gender">
                                   <select 
                                       value={currentGender} 
                                       onChange={(e) => setGender(e.target.value as Gender)}
                                       className="w-full appearance-none bg-white dark:bg-[#050505] border border-stone-300 dark:border-[#333] text-stone-800 dark:text-[#eee] text-[10px] font-cinzel font-bold py-2.5 px-2 rounded hover:border-stone-500 dark:hover:border-[#666] hover:bg-white dark:hover:bg-[#222] focus:border-[#b45309] outline-none transition-colors uppercase cursor-pointer shadow-inner focus:shadow-[0_0_8px_rgba(180,83,9,0.3)] text-center"
                                   >
                                       <option value="Male">M</option>
                                       <option value="Female">F</option>
                                    </select>
                               </div>
                           </div>
                       </div>
                    </div>
                    
                    {/* Name Input */}
                    <div className="flex flex-col gap-1 mb-4">
                       <label className="text-[8px] text-stone-600 dark:text-[#a1a1aa] font-bold tracking-widest pl-1 font-cinzel">HERO NAME</label>
                       <div className="flex gap-1">
                           <input 
                               type="text" 
                               value={charName}
                               disabled={isNameLocked}
                               onChange={(e) => setCharName(e.target.value)}
                               placeholder="ENTER NAME" 
                               title="Enter character name for export"
                               className={`flex-1 bg-white dark:bg-[#050505] border border-stone-300 dark:border-[#333] text-[10px] font-cinzel font-bold py-2.5 px-3 rounded hover:border-stone-500 dark:hover:border-[#666] focus:border-[#b45309] outline-none transition-colors uppercase placeholder-stone-400 dark:placeholder-[#444] shadow-inner focus:shadow-[0_0_8px_rgba(180,83,9,0.3)] ${isNameLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                               style={{ color: classData.color, borderColor: `${classData.color}40` }}
                           />
                           <button
                               onClick={() => setIsNameLocked(!isNameLocked)}
                               className={`w-10 flex items-center justify-center rounded border transition-colors shadow-sm active:scale-95 ${
                                   isNameLocked 
                                   ? 'bg-stone-300 dark:bg-[#222] border-stone-400 dark:border-[#333] text-stone-600 dark:text-[#888] hover:text-stone-900 dark:hover:text-white'
                                   : 'bg-[#b45309]/10 border-[#b45309]/50 text-[#b45309] hover:bg-[#b45309]/20 hover:text-[#d97706]'
                               }`}
                               title={isNameLocked ? "Unlock Name" : "Lock Name"}
                           >
                               {isNameLocked ? "✏️" : "💾"}
                           </button>
                       </div>
                   </div>
                    
                    {/* Primary Controls Grid */}
                    <div className="grid grid-cols-3 gap-2">
                         <button 
                            onClick={() => setShowTheorycraft(true)} 
                            title="Edit Talent Stats & Stat Weights"
                            className="group relative px-1 py-3 rounded overflow-hidden transition-all duration-200 border border-[#a335ee]/40 bg-[#a335ee]/5 hover:bg-[#a335ee]/10 hover:border-[#a335ee] hover:shadow-[0_0_15px_rgba(163,53,238,0.3)] active:scale-[0.98]"
                        >
                            <span className="relative z-10 font-cinzel font-bold text-[10px] tracking-[0.1em] text-[#a335ee] group-hover:text-[#d946ef] transition-colors flex flex-col items-center justify-center gap-1">
                                <span className="text-sm">⚖️</span>
                                <span className="text-[8px] leading-none">STATS</span>
                            </span>
                        </button>

                        <button 
                            onClick={() => setShowTalents(true)} 
                            title="Talent Calculator"
                            className="group relative px-1 py-3 rounded overflow-hidden transition-all duration-200 border border-[#f59e0b]/40 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 hover:border-[#f59e0b] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-[0.98]"
                        >
                            <span className="relative z-10 font-cinzel font-bold text-[10px] tracking-[0.1em] text-[#b45309] dark:text-[#fbbf24] group-hover:text-[#d97706] dark:group-hover:text-[#fef3c7] transition-colors flex flex-col items-center justify-center gap-1">
                                <span className="text-sm">🔮</span>
                                <span className="text-[8px] leading-none">TALENTS</span>
                            </span>
                        </button>

                        <button 
                            onClick={() => setShowBuffManager(true)} 
                            title="Manage Consumables and World Buffs"
                            className="group relative px-1 py-3 rounded overflow-hidden transition-all duration-200 border border-[#10b981]/40 bg-[#10b981]/5 hover:bg-[#10b981]/10 hover:border-[#10b981] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                        >
                            <span className="relative z-10 font-cinzel font-bold text-[10px] tracking-[0.1em] text-[#059669] dark:text-[#4ade80] group-hover:text-[#047857] dark:group-hover:text-[#dcfce7] transition-colors flex flex-col items-center justify-center gap-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm">🧪</span>
                                    {activeBuffs.length > 0 && <span className="bg-[#10b981] text-white text-[8px] px-1 rounded-full">{activeBuffs.length}</span>}
                                </div>
                                <span className="text-[8px] leading-none">BUFFS</span>
                            </span>
                        </button>

                        <button 
                            onClick={() => setShowBuildManager(true)} 
                            title="Build Library / Loadouts"
                            className="group relative px-1 py-3 rounded overflow-hidden transition-all duration-200 border border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                        >
                            <span className="relative z-10 font-cinzel font-bold text-[10px] tracking-[0.1em] text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-100 transition-colors flex flex-col items-center justify-center gap-1">
                                <span className="text-sm">💾</span>
                                <span className="text-[8px] leading-none">BUILDS</span>
                            </span>
                        </button>

                        <button 
                            onClick={onExport} 
                            title="Share Build (Copy Link)"
                            className="group relative px-1 py-3 rounded overflow-hidden transition-all duration-200 border border-[#0ea5e9]/40 bg-[#0ea5e9]/5 hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9] hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] active:scale-[0.98]"
                        >
                            <span className="relative z-10 font-cinzel font-bold text-[10px] tracking-[0.1em] text-[#0284c7] dark:text-[#38bdf8] group-hover:text-[#0369a1] dark:group-hover:text-[#e0f2fe] transition-colors flex flex-col items-center justify-center gap-1">
                                <span className="text-sm">🔗</span>
                                <span className="text-[8px] leading-none">SHARE</span>
                            </span>
                        </button>

                        <button 
                            onClick={() => setShowCombatSim(true)} 
                            title="Combat Simulator (The Proving Grounds)"
                            className="group relative px-1 py-3 rounded overflow-hidden transition-all duration-200 border border-red-500/40 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-[0.98]"
                        >
                            <span className="relative z-10 font-cinzel font-bold text-[10px] tracking-[0.1em] text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-100 transition-colors flex flex-col items-center justify-center gap-1">
                                <span className="text-sm">⚔️</span>
                                <span className="text-[8px] leading-none">SIM</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            {hoveredItem && (
                <ItemTooltip 
                    item={hoveredItem} 
                    spec={currentSpec || "Affliction" as any} 
                    position={mousePos} 
                    equipped={equipped}
                />
            )}

            {showBuffManager && (
                <BuffManager 
                    activeBuffs={activeBuffs} 
                    onToggleBuff={onToggleBuff} 
                    onClose={() => setShowBuffManager(false)} 
                />
            )}
            
            {showTheorycraft && currentSpec && (
                <TheorycraftModal 
                    currentClass={currentClass}
                    currentSpec={currentSpec}
                    talentStats={talentStats}
                    setTalentStats={setTalentStats}
                    selectedTalents={selectedTalents}
                    setSelectedTalents={setSelectedTalents}
                    customWeights={customWeights}
                    setCustomWeights={setCustomWeights}
                    onClose={() => setShowTheorycraft(false)}
                />
            )}

            {showBuildManager && (
                <BuildManager 
                    savedBuilds={savedBuilds}
                    onSave={onSaveBuild}
                    onLoad={onLoadBuild}
                    onDelete={onDeleteBuild}
                    onClose={() => setShowBuildManager(false)}
                    currentClass={currentClass}
                />
            )}

            {showCombatSim && currentSpec && (
                <CombatSimModal 
                    stats={stats}
                    spec={currentSpec}
                    equipped={equipped}
                    onClose={() => setShowCombatSim(false)}
                />
            )}

            {showTalents && (
                <TalentCalculator 
                    currentClass={currentClass}
                    talentPoints={talentPoints}
                    setTalentPoints={setTalentPoints}
                    onClose={() => setShowTalents(false)}
                />
            )}

            {enchantingSlot && equipped[enchantingSlot] && (
                <EnchantManager 
                    slotId={enchantingSlot}
                    equippedItem={equipped[enchantingSlot]!}
                    onApplyEnchant={(ench) => onApplyEnchant(enchantingSlot, ench)}
                    onRemoveEnchant={() => onRemoveEnchant(enchantingSlot)}
                    onClose={() => setEnchantingSlot(null)}
                />
            )}
        </section>
    );
};

export default PlayerSanctum;