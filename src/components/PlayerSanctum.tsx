
import React, { useMemo, useState, useCallback, memo, Suspense } from 'react';
import { Build, Item, ClassName, SpecName, ItemStats, StatWeights, Enchant, SavedBuild, RaceName, RealmType, Gender, GameMode, AggregatedStats } from '../types';
import { CLASS_CONFIG, BASE_STATS, CONSUMABLE_DATABASE, RACIAL_STATS, SET_DATABASE } from '../constants';
import { getIconUrl, calculateTotalStats, calculateStatBreakdown, generateBestInSlotBuild, canClassEquip, StatBreakdown, getHitCap } from '../services/gearService';
import { calculateTalentStats } from '../services/talentService';
import Slot from './Slot';
import { ItemTooltip } from './ItemTooltip';
import { fetchItems } from '../services/firestore';

// Lazy-loaded modals — only fetched when opened
const BuffManager = React.lazy(() => import('./BuffManager').then(m => ({ default: m.BuffManager })));
const TheorycraftModal = React.lazy(() => import('./TheorycraftModal').then(m => ({ default: m.TheorycraftModal })));
const EnchantManager = React.lazy(() => import('./EnchantManager').then(m => ({ default: m.EnchantManager })));
const BuildManager = React.lazy(() => import('./BuildManager').then(m => ({ default: m.BuildManager })));
const CombatSimModal = React.lazy(() => import('./CombatSimModal').then(m => ({ default: m.CombatSimModal })));
const OraclesInsight = React.lazy(() => import('./OraclesInsight').then(m => ({ default: m.OraclesInsight })));
const TalentCalculator = React.lazy(() => import('./TalentCalculator').then(m => ({ default: m.TalentCalculator })));
const OracleAutoEquip = React.lazy(() => import('./OracleAutoEquip').then(m => ({ default: m.OracleAutoEquip })));
const LootRouteModal = React.lazy(() => import('./LootRouteModal').then(m => ({ default: m.LootRouteModal })));
const RaidMatrixModal = React.lazy(() => import('./RaidMatrixModal').then(m => ({ default: m.RaidMatrixModal })));
const ProfessionsModal = React.lazy(() => import('./ProfessionsModal').then(m => ({ default: m.ProfessionsModal })));
import { hydrateItem } from '../utils/itemHydrator';
import { 
    FlaskConical, Sparkles, Calculator, Wand2, Save, Swords, 
    BarChart3, Scroll, Skull, Hammer 
} from 'lucide-react';

interface PlayerSanctumProps {
    equipped: Build;
    currentClass: ClassName;
    setClass: (c: ClassName) => void;
    currentSpec?: SpecName; 
    setSpec: (s: SpecName) => void;
    currentRace: RaceName;
    setRace: (r: RaceName) => void;
    currentRealm: RealmType;
    currentMode?: GameMode;
    currentGender: Gender;
    setGender: (g: Gender) => void;
    charName: string;
    setCharName: (name: string) => void;
    activeBuffs: string[];
    onToggleBuff: (buff: string) => void;
    setActiveBuffs: (buffs: string[]) => void;
    activeRaidBuffs: string[];
    setActiveRaidBuffs: (buffs: string[]) => void;
    activeRaidDebuffs: string[];
    setActiveRaidDebuffs: (debuffs: string[]) => void;
    onUnequip: (slot: string) => void;
    onEquip: (item: Item, targetSlotId?: string) => void; 
    onSetBuild: (build: Build) => void; 
    onWipe: () => void;
    onExport: () => void;
    talentStats: ItemStats;
    setTalentStats: (s: ItemStats) => void;
    selectedTalents: string[]; 
    setSelectedTalents: (t: string[]) => void; 
    customWeights: Record<string, StatWeights>;
    setCustomWeights: (w: Record<string, StatWeights>) => void;
    talentPoints?: Record<string, number>;
    setTalentPoints?: (points: Record<string, number>) => void;
    onApplyEnchant: (slotId: string, enchant: Enchant) => void;
    onRemoveEnchant: (slotId: string) => void;
    savedBuilds: SavedBuild[];
    onSaveBuild: (name: string) => void;
    onLoadBuild: (build: SavedBuild) => void;
    onDeleteBuild: (id: string) => void;
    itemDatabase?: Item[];
    wishlist: Item[];
    onToggleWishlist: (item: Item) => void;
    onQuickSearch: (slotId: string) => void; // NEW PROP
}

const TechCorners = memo(() => (
  <>
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/50 rounded-tl-sm pointer-events-none" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50 rounded-tr-sm pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50 rounded-bl-sm pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/50 rounded-br-sm pointer-events-none" />
  </>
));

const DigitalStatRow = memo(({ 
    label, 
    value, 
    color, 
    rank, 
    tooltip, 
    breakdown,
    snapshotVal,
    capStatus // NEW: 'red' | 'yellow' | 'green' | null
}: { 
    label: string, 
    value: string | number, 
    color?: string, 
    rank?: number, 
    tooltip?: string, 
    breakdown?: Record<string, number>,
    snapshotVal?: string | number,
    capStatus?: 'red' | 'yellow' | 'green' | null
}) => {
    let valueColor = color || "text-cyan-100";
    if (rank === 0) valueColor = "text-[#FFD700] drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]";
    if (rank === 1) valueColor = "text-purple-400";
    if (rank === 2) valueColor = "text-blue-400";

    const numVal = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
    const numSnap = snapshotVal !== undefined ? parseFloat(snapshotVal.toString().replace(/[^0-9.-]/g, '')) : undefined;
    
    // Ensure 0 is treated as a valid number, but undefined is not
    const diff = numSnap !== undefined ? numVal - numSnap : 0;

    let capColor = "";
    if (capStatus === 'red') capColor = "bg-red-500 shadow-[0_0_5px_#ef4444]";
    if (capStatus === 'yellow') capColor = "bg-yellow-500 shadow-[0_0_5px_#eab308]";
    if (capStatus === 'green') capColor = "bg-green-500 shadow-[0_0_5px_#22c55e]";

    return (
        <div className="relative group cursor-help mb-1">
            <div className="flex items-end justify-between">
                <div className="flex items-center gap-2">
                    {capStatus && (
                        <div className={`w-1.5 h-1.5 rounded-full ${capColor}`} title="Cap Status"></div>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-cyan-500/70 group-hover:text-cyan-400 transition-colors`}>{label}</span>
                </div>
                <div className="flex-grow border-b border-dotted border-white/10 mx-2 mb-1 group-hover:border-cyan-500/30"></div>
                <div className="flex gap-2 items-end">
                    <span className={`font-mono text-sm font-bold ${valueColor}`}>{value}</span>
                    {snapshotVal !== undefined && diff !== 0 && (
                        <span className={`text-[9px] font-mono font-bold ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {diff > 0 ? '+' : ''}{diff % 1 === 0 ? diff : diff.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>
            
            {/* HOVER TOOLTIP - STAT INSPECTOR */}
            {breakdown && (
                <div className="absolute left-full top-0 ml-2 z-50 hidden group-hover:block bg-[#0f0f12] border border-[#333] p-2 rounded shadow-xl w-40 pointer-events-none">
                    <div className="text-[10px] font-bold text-cyan-400 border-b border-[#333] mb-1 pb-1">{label} Breakdown</div>
                    <div className="grid grid-cols-2 gap-x-2 text-[9px]">
                        <span className="text-[#666]">Base:</span> <span className="text-white text-right">{Math.floor(breakdown.base)}</span>
                        <span className="text-[#666]">Gear:</span> <span className="text-purple-400 text-right">{Math.floor(breakdown.gear)}</span>
                        <span className="text-[#666]">Enchant:</span> <span className="text-green-400 text-right">{Math.floor(breakdown.enchant)}</span>
                        <span className="text-[#666]">Buffs:</span> <span className="text-blue-400 text-right">{Math.floor(breakdown.buffs)}</span>
                        <span className="text-[#666]">Talents:</span> <span className="text-[#FFD700] text-right">{Math.floor(breakdown.talents)}</span>
                    </div>
                </div>
            )}
        </div>
    );
});

const HeroPortrait = memo(({ currentClass, currentRace, currentGender, color }: { currentClass: ClassName; currentRace: RaceName; currentGender: Gender; color: string }) => {
    const getRaceIcon = () => {
        const genderSuffix = currentGender === 'Male' ? 'male' : 'female';
        let raceKey = currentRace.toLowerCase().replace(/\s/g, '');
        if (raceKey === 'undead') raceKey = 'scourge';
        if (raceKey === 'nightelf') raceKey = 'nightelf';
        if (raceKey === 'highelf') raceKey = 'bloodelf'; 
        return `race_${raceKey}_${genderSuffix}`;
    };
    const raceIconUrl = getIconUrl(getRaceIcon());

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,#000_100%)] z-10"></div>
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 30%, ${color}, transparent 60%)` }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] border border-white/5 rounded-full animate-spin-slow-reverse opacity-30 will-change-transform"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] border border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite] opacity-20 will-change-transform"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-20 flex flex-col items-center justify-center">
                <div className="relative group scale-125">
                    <div className="absolute -inset-1 rounded-full border border-white/20 transition-colors duration-200 group-hover:border-cyan-500/50"></div>
                    <div className="relative w-24 h-24 rounded-full p-[2px] bg-gradient-to-b from-white/20 to-transparent">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden relative border border-white/10">
                            <img src={raceIconUrl} alt={currentRace} className="w-full h-full object-cover scale-110" />
                            <div className="absolute inset-0 shadow-[inset_0_0_20px_black]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const StatGroup = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="bg-[#0a0a0c]/80 border border-white/5 rounded mb-3 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${isOpen ? 'border-b border-white/5' : ''}`}
            >
                <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase flex items-center gap-2">
                    <span className="w-1 h-3 bg-cyan-500/50 rounded-sm"></span>
                    {title}
                </span>
            </button>
            {isOpen && (
                <div className="p-3 flex flex-col animate-in fade-in duration-100">
                    {children}
                </div>
            )}
        </div>
    );
};

// Helper to fix database text errors (e.g. "600000 minutes" -> "10 min", "2000 sec" -> "2 sec")
const formatDuration = (text: string) => {
    let t = text;
    // Fix minutes: 600000 minutes -> 10 min
    t = t.replace(/(\d+)\s*(?:minutes|mins|min)/gi, (match, p1) => {
        const val = parseInt(p1, 10);
        if (val > 1000) { 
             const minutes = Math.round(val / 60000);
             return `${minutes} min`;
        }
        return match;
    });
    // Fix seconds: 2000 sec -> 2 sec, 500 sec -> 0.5 sec
    t = t.replace(/(\d+)\s*(?:seconds|secs|sec)/gi, (match, p1) => {
        const val = parseInt(p1, 10);
        // If value is >= 100, assume it's milliseconds stored as seconds
        if (val >= 100) { 
             const seconds = val / 1000;
             return `${seconds} sec`;
        }
        return match;
    });
    return t;
};

// --- SET BONUS COMPONENT ---
const ActiveSetsPanel = ({ equipped }: { equipped: Build }) => {
    const activeSets = useMemo(() => {
        const counts: Record<string, number> = {};
        Object.values(equipped).forEach(item => {
            if (item && item.setName) {
                counts[item.setName] = (counts[item.setName] || 0) + 1;
            }
        });
        
        return Object.entries(counts).map(([name, count]) => {
            const def = SET_DATABASE[name];
            if (!def) return null;
            return { name, count, bonuses: def.bonuses };
        }).filter(Boolean);
    }, [equipped]);

    if (activeSets.length === 0) return null;

    return (
        <StatGroup title="Active Sets">
            {activeSets.map((set, i) => (
                <div key={i} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[#FFD700] font-bold text-xs">{set!.name}</span>
                        <span className="text-[#888] text-[9px] font-mono font-bold">({set!.count})</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {set!.bonuses.map((bonus, idx) => {
                            const isActive = set!.count >= bonus.threshold;
                            return (
                                <div key={idx} className={`text-[9px] leading-tight flex gap-1.5 ${isActive ? 'text-[#1eff00]' : 'text-[#444]'}`}>
                                    <span className="font-bold shrink-0">({bonus.threshold})</span>
                                    <span>{formatDuration(bonus.text)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </StatGroup>
    );
};

const ClassSelectorOverlay = ({ currentClass, onSelect, onClose }: { currentClass: ClassName, onSelect: (c: ClassName) => void, onClose: () => void }) => {
    return (
        <div className="absolute inset-0 z-[100] bg-[#050505]/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl p-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-cinzel font-bold text-white tracking-[0.3em]">
                        IDENTITY MATRIX
                    </h2>
                </div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-6">
                    {(Object.keys(CLASS_CONFIG) as ClassName[]).map((className) => {
                        const conf = CLASS_CONFIG[className];
                        const isActive = currentClass === className;
                        return (
                            <button
                                key={className}
                                onClick={() => onSelect(className)}
                                className={`
                                    relative group -skew-x-12 h-12
                                    border-l-2 border-r-2 transition-colors duration-200
                                    ${isActive ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5 hover:border-white/20'}
                                `}
                            >
                                <div className="skew-x-12 flex items-center justify-center gap-3 w-full h-full relative z-10">
                                    <span className={`font-bold text-xs tracking-[0.2em] uppercase transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#666] group-hover:text-white'}`} style={{ textShadow: isActive ? `0 0 10px ${conf.color}80` : 'none' }}>
                                        {className}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} className="mt-16 w-full flex items-center justify-center gap-2 text-xs text-[#444] hover:text-red-400 tracking-widest transition-colors font-bold uppercase group">
                    <span>✕</span>
                    <span className="group-hover:underline decoration-red-400/50 underline-offset-4">Cancel</span>
                </button>
            </div>
        </div>
    );
};

const SpecSelectorOverlay = ({ currentClass, currentSpec, onSelect, onClose }: { currentClass: ClassName, currentSpec: SpecName, onSelect: (s: SpecName) => void, onClose: () => void }) => {
    const specs = CLASS_CONFIG[currentClass].specs;
    return (
        <div className="absolute inset-0 z-[100] bg-[#050505]/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg p-8 bg-[#0a0a0c] border border-white/10 rounded-lg shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-cinzel font-bold text-cyan-400 tracking-[0.3em]">
                        SPECIALIZATION
                    </h2>
                    <p className="text-[10px] text-[#666] font-bold tracking-widest mt-2 uppercase">SELECT YOUR COMBAT ROLE</p>
                </div>
                <div className="flex flex-col gap-3">
                    {specs.map((spec) => {
                        const isActive = currentSpec === spec;
                        return (
                            <button
                                key={spec}
                                onClick={() => onSelect(spec)}
                                className={`
                                    relative w-full py-4 px-6 border transition-all duration-200 group overflow-hidden
                                    ${isActive 
                                        ? 'bg-cyan-900/20 border-cyan-500/50' 
                                        : 'bg-[#111] border-[#333] hover:border-cyan-500/30'
                                    }
                                `}
                            >
                                <div className="relative z-10 flex justify-between items-center">
                                    <span className={`font-bold text-sm tracking-widest uppercase ${isActive ? 'text-cyan-300' : 'text-[#888] group-hover:text-cyan-100'}`}>
                                        {spec}
                                    </span>
                                    {isActive && <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"></div>}
                                </div>
                                {isActive && <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none"></div>}
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} className="mt-8 w-full flex items-center justify-center gap-2 text-xs text-[#444] hover:text-white tracking-widest transition-colors font-bold uppercase">
                    CANCEL
                </button>
            </div>
        </div>
    );
};

export const PlayerSanctum: React.FC<PlayerSanctumProps> = (props) => {
    const { 
        equipped, currentClass, setClass, currentSpec, setSpec, currentRace, currentRealm, 
        currentGender, onUnequip, onEquip, onSetBuild, 
        talentStats, setTalentStats,
        selectedTalents, setSelectedTalents,
        customWeights, setCustomWeights,
        talentPoints, setTalentPoints,
        onApplyEnchant, onRemoveEnchant,
        savedBuilds, onSaveBuild, onLoadBuild, onDeleteBuild,
        wishlist, onToggleWishlist,
        activeBuffs, onToggleBuff, setActiveBuffs, activeRaidBuffs, setActiveRaidBuffs, activeRaidDebuffs, setActiveRaidDebuffs,
        charName, setCharName,
        onQuickSearch 
    } = props;

    // --- STATE ---
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
    const [initialTooltipPos, setInitialTooltipPos] = useState({ x: 0, y: 0 });

    const [showBuffManager, setShowBuffManager] = useState(false);
    const [showTheorycraft, setShowTheorycraft] = useState(false);
    const [showBuildManager, setShowBuildManager] = useState(false);
    const [showCombatSim, setShowCombatSim] = useState(false);
    const [showTalents, setShowTalents] = useState(false); 
    const [showOracle, setShowOracle] = useState(false);
    const [showOraclesInsight, setShowOraclesInsight] = useState(false);
    const [showLootRoute, setShowLootRoute] = useState(false); 
    const [showRaidMatrix, setShowRaidMatrix] = useState(false); 
    const [showProfessions, setShowProfessions] = useState(false); 
    const [showClassSelector, setShowClassSelector] = useState(false);
    const [showSpecSelector, setShowSpecSelector] = useState(false);
    const [enchantingSlot, setEnchantingSlot] = useState<string | null>(null);
    const [snapshot, setSnapshot] = useState<AggregatedStats | null>(null);

    const classData = CLASS_CONFIG[currentClass];
    
    const treeStats = useMemo(() => calculateTalentStats(talentPoints || {}, currentClass), [talentPoints, currentClass]);
    const combinedTalentStats = useMemo(() => {
        const merged = { ...talentStats };
        Object.entries(treeStats).forEach(([k, v]) => { merged[k] = (merged[k] || 0) + v; });
        return merged;
    }, [talentStats, treeStats]);

    const racialStats = useMemo(() => RACIAL_STATS[currentRace] || {}, [currentRace]);

    // Calculate Detailed Breakdown
    const breakdown = useMemo(() => {
        return calculateStatBreakdown(equipped, activeBuffs, combinedTalentStats, racialStats, activeRaidBuffs, currentClass);
    }, [equipped, activeBuffs, combinedTalentStats, racialStats, activeRaidBuffs, currentClass]);

    const stats = useMemo(() => {
        return calculateTotalStats(equipped, activeBuffs, combinedTalentStats, racialStats, activeRaidBuffs);
    }, [equipped, activeBuffs, combinedTalentStats, racialStats, activeRaidBuffs]);

    const handleMouseEnter = useCallback((item: Item, e: React.MouseEvent) => {
        setInitialTooltipPos({ x: e.clientX, y: e.clientY });
        setHoveredItem(item);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredItem(null);
    }, []);

    const handleDropEquip = useCallback((item: Item, slotId: string) => {
        onEquip(item, slotId);
    }, [onEquip]);

    const handleAutoEquip = useCallback(async (sources: string[], phase: number, mode: 'PvE' | 'PvP', onProgress?: (slot: string, index: number, total: number) => void) => {
        const slotsToFill = ["Head", "Neck", "Shoulder", "Back", "Chest", "Wrist", "Hands", "Waist", "Legs", "Feet", "Ring", "Trinket", "Main Hand", "Off Hand", "Two-Hand", "Ranged", "Relic"];
        let pool: Item[] = [];

        const qMap: Record<string, number> = { 'poor': 0, 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5 };

        let activeSources = [...sources];
        if (mode === 'PvE') {
            activeSources = activeSources.filter(s => s !== 'PvP');
        }

        for (let i = 0; i < slotsToFill.length; i++) {
            const slot = slotsToFill[i];
            onProgress?.(slot, i, slotsToFill.length);
            const items = await fetchItems(currentRealm, slot, undefined, activeSources, 10000);
            const hydrated = items.map(i => hydrateItem(i));
            
            const filtered = hydrated.filter(item => {
                const classCheck = canClassEquip(currentClass, item);
                if (!classCheck.allowed) return false;
                
                // QUALITY FILTER: Ignore Poor (0) and Common (1) to prevent "junk"
                let q = 1;
                if (typeof item.quality === 'number') {
                    q = item.quality;
                } else if (typeof item.quality === 'string') {
                    // @ts-ignore
                    q = qMap[item.quality.toLowerCase()] ?? 1;
                }
                
                if (q < 3) return false; // Minimum Rare quality for BiS

                // LEVEL FILTER: Ignore very low level items, but be careful not to exclude level 60 items with missing req_level
                if (item.req_level && item.req_level < 40) return false;

                // --- NEW PVE FILTER ---
                if (mode === 'PvE') {
                    const name = (item.name || "").toLowerCase();
                    const source = (item.source || "").toLowerCase();
                    
                    const pvpKeywords = [
                        "high warlord", "grand marshal", "general's", "field marshal", 
                        "warlord", "marshal", "champion", "lieutenant commander", 
                        "legionnaire", "blood guard", "knight-captain", "knight-lieutenant"
                    ];
                    
                    if (pvpKeywords.some(k => name.includes(k))) return false;
                    
                    // Exclude specific PvP sources including Rank gear and Battleground Rep items
                    if (source.includes("rank ") || source.includes("pvp")) return false;
                    if (source.includes("alterac valley") || source.includes("warsong gulch") || source.includes("arathi basin")) return false;
                }

                return true;
            });
            pool = [...pool, ...filtered];
        }
        const effectiveSpec = currentSpec || CLASS_CONFIG[currentClass].specs[0];
        const biS = generateBestInSlotBuild(pool, effectiveSpec, customWeights[effectiveSpec], currentClass);
        onSetBuild(biS);
    }, [currentClass, currentSpec, currentRealm, customWeights, onSetBuild]);

    const slotsLeft = ["Head", "Neck", "Shoulder", "Back", "Chest", "Shirt", "Tabard", "Wrist"];
    const slotsRight = ["Hands", "Waist", "Legs", "Feet", "Ring_1", "Ring_2", "Trinket_1", "Trinket_2"];
    const slotsBottom = ["MainHand", "OffHand", "Ranged", "Relic"];

    const toggleSnapshot = () => {
        if (snapshot) setSnapshot(null);
        else setSnapshot(stats);
    };

    // --- CAP LOGIC ---
    const hitCap = getHitCap(currentSpec || "", currentClass);
    let hitCapStatus: 'red' | 'yellow' | 'green' | null = null;
    if (stats.hit >= hitCap) hitCapStatus = 'green';
    else if (stats.hit >= hitCap - 2) hitCapStatus = 'yellow';
    else hitCapStatus = 'red';

    // 440 defense skill = uncrittable vs level 63 bosses.
    // Level 60 base = 300, so +140 bonus needed from gear/enchants/talents.
    const DEFENSE_CAP_BONUS = 140;
    let defCapStatus: 'red' | 'yellow' | 'green' | null = null;
    if (currentSpec && (currentSpec.includes('Prot') || currentSpec.includes('Bear'))) {
        if (stats.defense >= DEFENSE_CAP_BONUS) defCapStatus = 'green';
        else if (stats.defense >= DEFENSE_CAP_BONUS - 10) defCapStatus = 'yellow';
        else defCapStatus = 'red';
    }

    // --- MENU ITEMS (Integrated) ---
    const MENU_ITEMS = [
        { id: 'buffs', label: 'Buffs', icon: <FlaskConical size={24} />, action: () => setShowBuffManager(true), color: 'text-purple-400', border: 'border-purple-500/30 hover:border-purple-500' },
        { id: 'talents', label: 'Talents', icon: <Sparkles size={24} />, action: () => setShowTalents(true), color: 'text-yellow-400', border: 'border-yellow-500/30 hover:border-yellow-500' },
        { id: 'theory', label: 'Theory', icon: <Calculator size={24} />, action: () => setShowTheorycraft(true), color: 'text-cyan-400', border: 'border-cyan-500/30 hover:border-cyan-500' },
        { id: 'auto', label: 'Oracle', icon: <Wand2 size={24} />, action: () => setShowOracle(true), color: 'text-red-500', border: 'border-red-500/30 hover:border-red-500' },
        { id: 'builds', label: 'Builds', icon: <Save size={24} />, action: () => setShowBuildManager(true), color: 'text-green-500', border: 'border-green-500/30 hover:border-green-500' },
        { id: 'sim', label: 'Simulate', icon: <Swords size={24} />, action: () => setShowCombatSim(true), color: 'text-orange-500', border: 'border-orange-500/30 hover:border-orange-500' },
        { id: 'caps', label: 'Caps', icon: <BarChart3 size={24} />, action: () => setShowOraclesInsight(true), color: 'text-blue-400', border: 'border-blue-500/30 hover:border-blue-500' },
        { id: 'loot', label: 'Loot', icon: <Scroll size={24} />, action: () => setShowLootRoute(true), color: 'text-amber-200', border: 'border-amber-200/30 hover:border-amber-200' },
        { id: 'raid', label: 'Raid', icon: <Skull size={24} />, action: () => setShowRaidMatrix(true), color: 'text-red-800', border: 'border-red-800/30 hover:border-red-800' },
        { id: 'profs', label: 'Profs', icon: <Hammer size={24} />, action: () => setShowProfessions(true), color: 'text-emerald-500', border: 'border-emerald-500/30 hover:border-emerald-500' },
    ];

    // Get specific custom weights for the current spec, same as DatabaseVault
    const activeWeights = useMemo(() => {
        if (!customWeights || !currentSpec) return undefined;
        return customWeights[currentSpec];
    }, [customWeights, currentSpec]);

    return (
        <div className="flex-1 h-full relative overflow-hidden flex flex-col lg:flex-row bg-[#050505]">
            <TechCorners />
            
            <div className="absolute inset-0 z-0">
                <HeroPortrait currentClass={currentClass} currentRace={currentRace} currentGender={currentGender} color={classData.color} />
            </div>

            {showClassSelector && (
                <ClassSelectorOverlay 
                    currentClass={currentClass} 
                    onSelect={(c) => { setClass(c); setShowClassSelector(false); }} 
                    onClose={() => setShowClassSelector(false)} 
                />
            )}

            {showSpecSelector && (
                <SpecSelectorOverlay
                    currentClass={currentClass}
                    currentSpec={currentSpec || 'Smite'}
                    onSelect={(s) => { setSpec(s); setShowSpecSelector(false); }}
                    onClose={() => setShowSpecSelector(false)}
                />
            )}

            <div className="relative z-10 w-full lg:w-[88px] flex flex-col gap-1 items-center justify-center p-2 lg:py-8 lg:h-full shrink-0">
                {slotsLeft.map(slotId => (
                    <Slot 
                        key={slotId} 
                        id={slotId} 
                        label={slotId} 
                        item={equipped[slotId]} 
                        onUnequip={onUnequip}
                        onDropEquip={handleDropEquip}
                        onMouseEnter={handleMouseEnter} 
                        onMouseLeave={handleMouseLeave}
                        onContextMenu={() => { if(equipped[slotId]) setEnchantingSlot(slotId); }}
                        onQuickSearch={onQuickSearch}
                    />
                ))}
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center p-4 lg:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 gap-6">
                
                <div className="text-center shrink-0">
                    <h1 
                        onClick={() => setShowClassSelector(true)}
                        className="text-2xl lg:text-4xl font-cinzel font-bold text-white tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] cursor-pointer hover:text-cyan-400 transition-colors"
                    >
                        {charName || currentClass.toUpperCase()}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-[10px] lg:text-xs font-bold tracking-widest text-[#888] mt-1 uppercase">
                        <span className="text-cyan-500">{currentRace}</span>
                        <span className="text-[#333]">•</span>
                        <button 
                            onClick={() => setShowSpecSelector(true)}
                            className="hover:text-white transition-colors cursor-pointer border-b border-dashed border-transparent hover:border-white/50"
                            style={{ color: classData.color }}
                        >
                            {currentSpec}
                        </button>
                        <span className="text-[#333]">•</span>
                        <span>{currentRealm}</span>
                    </div>
                </div>

                <div className="w-full max-w-sm bg-[#0a0a0c]/90 border border-white/10 p-4 rounded-lg shadow-2xl backdrop-blur-md relative shrink-0">
                    {/* Snapshot Toggle */}
                    <button 
                        onClick={toggleSnapshot}
                        className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-colors ${snapshot ? 'bg-amber-900/50 text-amber-200 border-amber-500/50' : 'bg-black/50 text-[#555] border-[#333] hover:text-[#888]'}`}
                    >
                        {snapshot ? 'FREEZE BUILD' : 'SNAPSHOT'}
                    </button>

                    <StatGroup title="Vitality">
                        <DigitalStatRow label="Health" value={Math.floor(breakdown.health.total)} color="text-green-400" breakdown={breakdown.health} snapshotVal={snapshot?.health} />
                        <DigitalStatRow label="Mana" value={Math.floor(breakdown.mana.total)} color="text-blue-400" breakdown={breakdown.mana} snapshotVal={snapshot?.mana} />
                    </StatGroup>
                    
                    <StatGroup title="Attributes">
                        <DigitalStatRow label="Strength" value={Math.floor(breakdown.str.total)} breakdown={breakdown.str} snapshotVal={snapshot?.str} />
                        <DigitalStatRow label="Agility" value={Math.floor(breakdown.agi.total)} breakdown={breakdown.agi} snapshotVal={snapshot?.agi} />
                        <DigitalStatRow label="Stamina" value={Math.floor(breakdown.stam.total)} breakdown={breakdown.stam} snapshotVal={snapshot?.stam} />
                        <DigitalStatRow label="Intellect" value={Math.floor(breakdown.int.total)} breakdown={breakdown.int} snapshotVal={snapshot?.int} />
                        <DigitalStatRow label="Spirit" value={Math.floor(breakdown.spirit.total)} breakdown={breakdown.spirit} snapshotVal={snapshot?.spirit} />
                    </StatGroup>

                    <StatGroup title="Combat Power">
                        <DigitalStatRow label="Spell Power" value={Math.floor(breakdown.sp.total + Math.max(breakdown.spShadow.total, breakdown.spFire.total, breakdown.spNature.total))} rank={0} breakdown={breakdown.sp} snapshotVal={snapshot?.sp} />
                        <DigitalStatRow 
                            label="Hit Chance" 
                            value={`${breakdown.hit.total.toFixed(1)}%`} 
                            rank={stats.hit >= hitCap ? 0 : 2} 
                            breakdown={breakdown.hit} 
                            snapshotVal={snapshot?.hit} 
                            capStatus={hitCapStatus} 
                        />
                        <DigitalStatRow label="Crit Chance" value={`${breakdown.crit.total.toFixed(2)}%`} breakdown={breakdown.crit} snapshotVal={snapshot?.crit} />
                        {breakdown.haste.total > 0 && <DigitalStatRow label="Haste" value={`${breakdown.haste.total}%`} breakdown={breakdown.haste} snapshotVal={snapshot?.haste} />}
                        {defCapStatus && <DigitalStatRow label="Defense" value={Math.floor(breakdown.defense.total)} breakdown={breakdown.defense} snapshotVal={snapshot?.defense} capStatus={defCapStatus} />}
                    </StatGroup>

                    {/* NEW: SET BONUSES */}
                    <ActiveSetsPanel equipped={equipped} />
                </div>

                {/* --- COMMAND GRID (Replaces Floating Dock) --- */}
                <div className="w-full max-w-sm grid grid-cols-5 gap-2 shrink-0">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={item.action}
                            className={`
                                group flex flex-col items-center justify-center h-16 rounded-md border bg-[#0f0f12]/80 backdrop-blur-sm
                                transition-all duration-200 hover:scale-105 hover:bg-[#1a1a1d] hover:shadow-lg
                                ${item.border}
                            `}
                            title={item.label}
                        >
                            <div className={`transition-colors duration-200 ${item.color} group-hover:text-white drop-shadow-md`}>
                                {item.icon}
                            </div>
                            <span className={`text-[8px] font-bold uppercase tracking-wider text-[#666] group-hover:text-white mt-1`}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 shrink-0 pb-4">
                    {slotsBottom.map(slotId => (
                        <Slot 
                            key={slotId} 
                            id={slotId} 
                            label={slotId} 
                            item={equipped[slotId]} 
                            onUnequip={onUnequip}
                            onDropEquip={handleDropEquip}
                            onMouseEnter={handleMouseEnter} 
                            onMouseLeave={handleMouseLeave}
                            onContextMenu={() => { if(equipped[slotId]) setEnchantingSlot(slotId); }}
                            onQuickSearch={onQuickSearch}
                        />
                    ))}
                </div>

            </div>

            <div className="relative z-10 w-full lg:w-[88px] flex flex-col gap-1 items-center justify-center p-2 lg:py-8 lg:h-full shrink-0">
                {slotsRight.map(slotId => (
                    <Slot 
                        key={slotId} 
                        id={slotId} 
                        label={slotId} 
                        item={equipped[slotId]} 
                        onUnequip={onUnequip}
                        onDropEquip={handleDropEquip}
                        onMouseEnter={handleMouseEnter} 
                        onMouseLeave={handleMouseLeave}
                        onContextMenu={() => { if(equipped[slotId]) setEnchantingSlot(slotId); }}
                        onQuickSearch={onQuickSearch}
                    />
                ))}
            </div>

            {/* --- MODALS --- */}
            {hoveredItem && <ItemTooltip item={hoveredItem} spec={currentSpec || 'Smite'} initialPosition={initialTooltipPos} equipped={equipped} currentStats={stats} currentClass={currentClass} customWeights={activeWeights} />}
            
            {showBuffManager && (
                <Suspense fallback={null}><BuffManager
                    activeBuffs={activeBuffs}
                    onToggleBuff={onToggleBuff}
                    setActiveBuffs={setActiveBuffs}
                    onClose={() => setShowBuffManager(false)}
                /></Suspense>
            )}

            {showTheorycraft && (
                <Suspense fallback={null}><TheorycraftModal
                    currentClass={currentClass}
                    currentSpec={currentSpec || 'Smite'}
                    talentStats={talentStats}
                    setTalentStats={setTalentStats}
                    selectedTalents={selectedTalents}
                    setSelectedTalents={setSelectedTalents}
                    customWeights={customWeights}
                    setCustomWeights={setCustomWeights}
                    onClose={() => setShowTheorycraft(false)}
                    currentStats={stats}
                    equipped={equipped}
                /></Suspense>
            )}

            {enchantingSlot && equipped[enchantingSlot] && (
                <Suspense fallback={null}><EnchantManager
                    slotId={enchantingSlot}
                    equippedItem={equipped[enchantingSlot]!}
                    onApplyEnchant={(ench) => onApplyEnchant(enchantingSlot, ench)}
                    onRemoveEnchant={() => onRemoveEnchant(enchantingSlot)}
                    onClose={() => setEnchantingSlot(null)}
                    currentRealm={currentRealm}
                /></Suspense>
            )}

            {showBuildManager && (
                <Suspense fallback={null}><BuildManager
                    savedBuilds={savedBuilds}
                    onSave={onSaveBuild}
                    onLoad={onLoadBuild}
                    onDelete={onDeleteBuild}
                    onClose={() => setShowBuildManager(false)}
                    currentClass={currentClass}
                /></Suspense>
            )}

            {showCombatSim && (
                <Suspense fallback={null}><CombatSimModal
                    stats={stats}
                    spec={currentSpec || 'Smite'}
                    currentClass={currentClass}
                    equipped={equipped}
                    activeRaidDebuffs={activeRaidDebuffs}
                    onClose={() => setShowCombatSim(false)}
                /></Suspense>
            )}

            {showOraclesInsight && (
                <Suspense fallback={null}><OraclesInsight
                    stats={stats}
                    spec={currentSpec || 'Smite'}
                    currentClass={currentClass}
                    onClose={() => setShowOraclesInsight(false)}
                /></Suspense>
            )}

            {showTalents && (
                <Suspense fallback={null}><TalentCalculator
                    selectedClass={currentClass}
                    talentPoints={talentPoints || {}}
                    setTalentPoints={setTalentPoints || (() => {})}
                    onClose={() => setShowTalents(false)}
                /></Suspense>
            )}

            {showOracle && (
                <Suspense fallback={null}><OracleAutoEquip
                    onClose={() => setShowOracle(false)}
                    onAutoEquip={handleAutoEquip}
                /></Suspense>
            )}

            {showLootRoute && (
                <Suspense fallback={null}><LootRouteModal
                    wishlist={wishlist}
                    onRemove={onToggleWishlist}
                    onClose={() => setShowLootRoute(false)}
                /></Suspense>
            )}

            {showRaidMatrix && (
                <Suspense fallback={null}><RaidMatrixModal
                    activeRaidBuffs={activeRaidBuffs}
                    setActiveRaidBuffs={setActiveRaidBuffs}
                    activeRaidDebuffs={activeRaidDebuffs}
                    setActiveRaidDebuffs={setActiveRaidDebuffs}
                    onClose={() => setShowRaidMatrix(false)}
                /></Suspense>
            )}

            {showProfessions && (
                <Suspense fallback={null}><ProfessionsModal onClose={() => setShowProfessions(false)} /></Suspense>
            )}
        </div>
    );
};
