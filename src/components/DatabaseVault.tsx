
import React, { useState, useMemo, useEffect, useCallback, memo, Suspense } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Item, ItemStats, RaceName, Build } from '../types';
import { LootSource } from './SourceFilter';
import { normalizeSlot, getIconUrl, calculateItemScore, calculateTotalStats, canClassEquip } from '../services/gearService';
import { hydrateItem } from '../utils/itemHydrator';
import { ItemTooltip } from './ItemTooltip';
import { auth, signOutAdmin } from '../services/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { SourceFilter } from './SourceFilter';
import { showToast } from './Toast';

// Lazy-loaded modals
const CreateItemModal = React.lazy(() => import('./CreateItemModal').then(m => ({ default: m.CreateItemModal })));
const AdminLoginModal = React.lazy(() => import('./AdminLoginModal').then(m => ({ default: m.AdminLoginModal })));
const ComparisonModal = React.lazy(() => import('./ComparisonModal').then(m => ({ default: m.ComparisonModal })));
import { fetchItems, fetchGlobalSlotCounts, mapSlotToDb, SLOT_GROUPS } from '../services/firestore';
import { ItemCard } from './ItemCard';
import { RACIAL_STATS } from '../constants';

const SLOT_ICONS: Record<string, string> = {
    "Head": "inv_helmet_04", "Neck": "inv_jewelry_necklace_20", "Shoulder": "inv_shoulder_23", "Back": "inv_misc_cape_18", "Chest": "inv_chest_plate04", "Wrist": "inv_bracer_07", "Hands": "inv_gauntlets_17", "Waist": "inv_belt_12", "Legs": "inv_pants_plate_05", "Feet": "inv_boots_chain_05", "Ring": "inv_jewelry_ring_22", "Trinket": "inv_jewelry_talisman_08", "Main Hand": "inv_sword_39", "Two-Hand": "inv_axe_09", "Off Hand": "inv_shield_05", "Ranged": "inv_weapon_bow_08", "Relic": "inv_misc_idol_02", "Misc": "inv_misc_bag_08"
};

const SLOT_LABELS: Record<string, string> = {
    "Head": "HEAD", "Neck": "NECK", "Shoulder": "SHOULDER", "Back": "BACK", 
    "Chest": "CHEST", "Wrist": "WRIST", "Hands": "HANDS", "Waist": "WAIST", 
    "Legs": "LEGS", "Feet": "FEET", "Ring": "RING", "Trinket": "TRINKET", 
    "Main Hand": "MAIN HAND", "Two-Hand": "2H WEAPON", "Off Hand": "OFF HAND", "Ranged": "RANGED", 
    "Relic": "RELIC", "Misc": "MISC"
};

const REALM_OPTS = [{ id: 'Classic', label: 'CLASSIC', icon: '🦁' }, { id: 'Turtle', label: 'TURTLE', icon: '🐢' }];

const RARITY_FILTERS = [
    { id: 'All', label: 'ALL', color: 'text-gray-400 border-gray-600', bg: 'bg-gray-800', shadow: 'shadow-[0_0_10px_rgba(156,163,175,0.2)]' },
    { id: '1', label: 'COMMON', color: 'text-white border-white', bg: 'bg-white/10', shadow: 'shadow-[0_0_10px_rgba(255,255,255,0.3)]' },
    { id: '2', label: 'UNCOMMON', color: 'text-[#1eff00] border-[#1eff00]', bg: 'bg-[#1eff00]/10', shadow: 'shadow-[0_0_10px_rgba(30,255,0,0.3)]' },
    { id: '3', label: 'RARE', color: 'text-[#0070dd] border-[#0070dd]', bg: 'bg-[#0070dd]/10', shadow: 'shadow-[0_0_10px_rgba(0,112,221,0.3)]' },
    { id: '4', label: 'EPIC', color: 'text-[#a335ee] border-[#a335ee]', bg: 'bg-[#a335ee]/10', shadow: 'shadow-[0_0_10px_rgba(163,53,238,0.3)]' },
    { id: '5', label: 'LEGENDARY', color: 'text-[#ff8000] border-[#ff8000]', bg: 'bg-[#ff8000]/10', shadow: 'shadow-[0_0_15px_rgba(255,128,0,0.4)]' },
];

const ALPHABET = ["All", "#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const VALID_GEAR_SLOTS = new Set([
  'Head', 'Neck', 'Shoulder', 'Back', 'Chest', 'Wrist', 
  'Hands', 'Waist', 'Legs', 'Feet', 'Finger', 'Ring', 'Trinket', 
  'Main Hand', 'MainHand', 'One-Hand', 'Two-Hand', 'Off Hand', 'OffHand', 
  'Ranged', 'Relic', 'Shield', 'Held In Off-hand', 
  'Wand', 'Gun', 'Bow', 'Crossbow', 'Thrown', 'Idol', 'Libram', 'Totem', 'Polearm', 'Staff', 'Dagger', 'Sword', 'Mace', 'Axe'
]);

// --- SLOT MATCHING HELPER ---
// Ensures that items are only tagged BiS against their own slot category
const isItemInSlot = (item: Item, activeSlot: string) => {
    if (!item.slot) return false;
    const normItemSlot = normalizeSlot(item.slot);
    const normActiveSlot = normalizeSlot(activeSlot);
    
    // Explicit exclusions for known cross-over issues
    if (activeSlot === 'Misc' && normItemSlot !== 'Misc') return false;

    if (normActiveSlot === 'MainHand' && (normItemSlot === 'MainHand' || normItemSlot === 'One-Hand')) return true;
    if (normActiveSlot === 'Two-Hand' && (normItemSlot === 'Two-Hand' || normItemSlot === 'Staff' || normItemSlot === 'Polearm')) return true;
    if (normActiveSlot === 'OffHand' && (normItemSlot === 'OffHand' || normItemSlot === 'One-Hand' || normItemSlot === 'Shield')) return true;
    if (normItemSlot === normActiveSlot) return true;
    return false;
};

const TechCorners = memo(() => (
  <>
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/50 rounded-tl-sm pointer-events-none" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/50 rounded-tr-sm pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/50 rounded-bl-sm pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/50 rounded-br-sm pointer-events-none" />
  </>
));

const MasonryList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div 
    ref={ref} 
    {...props} 
    className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 px-4 pb-4"
  />
));

interface DatabaseVaultProps {
    currentSpec: string;
    currentClass: string;
    currentRealm: string;
    setRealm?: (r: string) => void;
    equipped: Build;
    onEquip: (item: Item) => void;
    customItems?: Item[];
    onImportDatabase: (items: Item[]) => void;
    onUpdateDatabase: (item: Item) => void;
    customWeights?: Record<string, Record<string, number>>;
    activeBuffs?: any[];
    activeRaidBuffs?: string[];
    talentStats?: Record<string, number>;
    currentRace?: string;
    requestedSlot?: string | null;
    onSlotConsumed?: () => void;
    // Passed from App.tsx but not currently used in this component
    [key: string]: any;
}

export const DatabaseVault: React.FC<DatabaseVaultProps> = (props) => {
    const {
        currentSpec, currentClass, currentRealm, setRealm,
        equipped, onEquip, customItems = [],
        onImportDatabase, onUpdateDatabase,
        activeBuffs = [], activeRaidBuffs = [], talentStats = {}, currentRace = 'Human',
        requestedSlot, onSlotConsumed
    } = props;
    
    const [fetchedItems, setFetchedItems] = useState<Item[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeSources, setActiveSources] = useState<LootSource[]>(['All']);
    const [activeSlot, setActiveSlot] = useState<string>("Head"); 
    const [activeRarity, setActiveRarity] = useState<string>("All");
    const [activeLetterFilter, setActiveLetterFilter] = useState<string>("All"); 
    const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
    const [recentItems, setRecentItems] = useState<Item[]>([]); 
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            setIsAdmin(!!user && !!adminEmail && user.email === adminEmail);
        });
        return unsubscribe;
    }, []);
    
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
    const [initialTooltipPos, setInitialTooltipPos] = useState({ x: 0, y: 0 });
    // Change Default to FALSE to enable filtering by default as requested
    const [ignoreClassRestrictions, setIgnoreClassRestrictions] = useState(false);

    const [comparisonData, setComparisonData] = useState<{ newItem: Item, equippedItem: Item | null } | null>(null);

    // Sync with external request (quick-search from slot magnifier)
    useEffect(() => {
        if (requestedSlot) {
            const generic = requestedSlot.replace(/_\d/, '');
            let uiSlot = generic;
            if (uiSlot === 'OffHand') uiSlot = 'Off Hand';
            if (uiSlot === 'MainHand') uiSlot = 'Main Hand';

            if (SLOT_ICONS[uiSlot] || uiSlot === 'Two-Hand') {
                setActiveSlot(uiSlot);
            }
            onSlotConsumed?.();
        }
    }, [requestedSlot]);

    const currentStats = useMemo(() => {
        const racialStats = RACIAL_STATS[currentRace as RaceName] || {};
        return calculateTotalStats(equipped, activeBuffs, talentStats, racialStats, activeRaidBuffs);
    }, [equipped, activeBuffs, talentStats, currentRace, activeRaidBuffs]);

    const activeWeights = useMemo(() => {
        if (!props.customWeights || !currentSpec) return undefined;
        return props.customWeights[currentSpec];
    }, [props.customWeights, currentSpec]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedQuery(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        const loadCounts = async () => {
            const counts = await fetchGlobalSlotCounts();
            setSlotCounts(counts);
        };
        loadCounts();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsFetching(true);
            if (!debouncedQuery) setFetchedItems([]);
            try {
                const items = await fetchItems(currentRealm, activeSlot, debouncedQuery, activeSources, 10000);
                setFetchedItems(items);
                setFetchError(null);
            } catch (e) {
                setFetchError("Database connection failed");
                showToast("Failed to load items from database", "error");
            } finally {
                setIsFetching(false);
            }
        };
        loadData();
    }, [currentRealm, activeSlot, debouncedQuery, activeSources]);

    // Calculate Equipped Score for Comparison Highlighting
    const equippedScore = useMemo(() => {
        // Find equipped item for active slot
        const normSlot = normalizeSlot(activeSlot);
        let item: Item | undefined;
        
        if (normSlot === 'Ring') item = equipped['Ring_1'] || equipped['Ring_2']; 
        else if (normSlot === 'Trinket') item = equipped['Trinket_1'] || equipped['Trinket_2'];
        else item = equipped[normSlot] || (normSlot === 'Two-Hand' ? equipped['MainHand'] : undefined);

        if (!item) return 0;
        return calculateItemScore(item, currentSpec, activeWeights, currentStats, currentClass);
    }, [equipped, activeSlot, currentSpec, activeWeights, currentStats, currentClass]);

    const isBrowsing = !debouncedQuery;

    const displayedItems = useMemo(() => {
        // 1. Combine & Hydrate (Custom items might still need hydration if not stored hydrated)
        const hydratedCustom = customItems.map((i: any) => hydrateItem(i));
        const allItems = [...fetchedItems, ...hydratedCustom];
        const queryLower = debouncedQuery.toLowerCase();
        
        // 2. Score All Items (Needed for BiS Calculation and Sorting)
        const scoredItems = allItems.map(item => ({
            ...item,
            _score: calculateItemScore(item, currentSpec, activeWeights, currentStats, currentClass)
        }));

        // 3. Determine Global Max Score for the Active Slot (for BiS Tagging)
        // Only valid if not searching, to ensure we are comparing against the full slot list
        let maxScore = 0;
        if (isBrowsing) {
            const slotCandidates = scoredItems.filter(i => isItemInSlot(i, activeSlot));
            if (slotCandidates.length > 0) {
                // Find highest score in this slot
                maxScore = Math.max(...slotCandidates.map(i => i._score));
            }
        }

        // 4. Filter for Display
        const filtered = scoredItems.filter((item: any) => {
            // -- SLOT FILTER --
            if (!queryLower) {
                // Use strict slot matching if not searching
                if (!isItemInSlot(item, activeSlot)) return false;
            }

            // -- SEARCH FILTER --
            if (queryLower && !item.name.toLowerCase().includes(queryLower)) return false;

            // -- RARITY FILTER --
            if (activeRarity !== "All") {
                const q = item.quality;
                let qVal = '1'; 
                if (typeof q === 'number') qVal = String(q);
                else if (typeof q === 'string') {
                    const lower = q.toLowerCase();
                    if (lower === 'poor') qVal = '0';
                    else if (lower === 'common') qVal = '1';
                    else if (lower === 'uncommon') qVal = '2';
                    else if (lower === 'rare') qVal = '3';
                    else if (lower === 'epic') qVal = '4';
                    else if (lower === 'legendary') qVal = '5';
                }
                if (qVal !== activeRarity) return false;
            }

            // -- RAID SOURCE QUALITY FLOOR --
            // When browsing a specific raid (MC, BWL, etc.), enforce minimum Rare quality
            const isRaidSource = activeSources.length > 0 &&
                !activeSources.includes('All') &&
                !activeSources.includes('Dungeons') &&
                !activeSources.includes('PvP / World');
            if (isRaidSource && !queryLower) {
                const qNum = typeof item.quality === 'number' ? item.quality :
                    ({'poor':0,'common':1,'uncommon':2,'rare':3,'epic':4,'legendary':5}[String(item.quality).toLowerCase()] ?? 1);
                if (qNum < 3) return false;
            }

            // -- TRASH FILTER (Default) --
            if (!queryLower) {
                const q = String(item.quality || '1').toLowerCase();
                const isLowQuality = q === 'poor' || q === '0' || q === 'common' || q === '1';
                const isUncommon = q === 'uncommon' || q === '2';
                
                if (isLowQuality || isUncommon) {
                    const hasDamage = (Number(item.dps) > 0) || (Number(item.minDmg || item.min_damage) > 0);
                    const hasEffects = (item.effects && item.effects.length > 0) || (item.special_effects && item.special_effects.length > 0) || item.use_effect;
                    
                    let hasStats = false;
                    let hasNonArmorStats = false;

                    if (item.stats) {
                        for (const k in item.stats) {
                            if (Number(item.stats[k]) > 0) {
                                hasStats = true;
                                if (k.toLowerCase() !== 'armor') {
                                    hasNonArmorStats = true;
                                }
                            }
                        }
                    }
                    if (isLowQuality && !hasStats && !hasDamage && !hasEffects) return false;
                    if (isUncommon && !hasNonArmorStats && !hasDamage && !hasEffects) return false;
                }
            }

            // -- JUNK REMOVAL --
            const effectText = (item.use_effect || (item.effects && item.effects.join(' ')) || "").toLowerCase();
            if (effectText.includes("adds a mount") || 
                effectText.includes("teaches you how to summon") || 
                effectText.includes("summons and dismisses") ||
                item.name.startsWith("Pattern:") ||
                item.name.startsWith("Plans:") ||
                item.name.startsWith("Schematic:") ||
                item.name.startsWith("Recipe:") ||
                item.name.startsWith("Formula:")) {
                return false;
            }

            // -- CLASS RESTRICTION (Updated to use canClassEquip) --
            if (!ignoreClassRestrictions) {
                // If item has explicit classes, check those
                if (item.classes && item.classes.length > 0 && !item.classes.includes(currentClass)) return false;
                
                // Also check Armor/Weapon types via service
                const check = canClassEquip(currentClass, item);
                if (!check.allowed) return false;
            }

            // -- LETTER FILTER --
            if (activeLetterFilter !== "All") {
               const cleanName = (item.name || "").trim();
               if (!cleanName) return false;
               const firstChar = cleanName.charAt(0).toUpperCase();
               if (activeLetterFilter === "#") {
                   if (/[A-Z]/.test(firstChar)) return false; 
               } else {
                   if (firstChar !== activeLetterFilter) return false;
               }
            }

            return true;
        });

        // 5. Final Sort & Tag
        return filtered.map(item => ({
            ...item,
            // BiS logic: Must be browsing (not searching), valid score, matching top score
            isBiS: isBrowsing && maxScore > 0 && item._score >= maxScore
        })).sort((a, b) => b._score - a._score); // Always sort by EP (Power)

    }, [fetchedItems, customItems, debouncedQuery, currentClass, activeSlot, currentSpec, activeWeights, ignoreClassRestrictions, activeSources, activeRarity, activeLetterFilter, currentStats, isBrowsing]);

    const handleMouseEnter = useCallback((item: Item, e: React.MouseEvent) => { 
        setInitialTooltipPos({ x: e.clientX, y: e.clientY });
        setHoveredItem(item); 
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredItem(null);
    }, []);

    const handleToggleSource = useCallback((source: LootSource) => {
        setActiveSources(prev => {
            if (source === 'All') return ['All'];
            let newSources = prev.includes('All') ? [] : [...prev];
            if (newSources.includes(source)) newSources = newSources.filter(s => s !== source);
            else newSources.push(source);
            return newSources.length === 0 ? ['All'] : newSources;
        });
    }, []);

    const addToHistory = (item: Item) => {
        setRecentItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) return prev;
            return [item, ...prev].slice(0, 12);
        });
    };

    const handleDragStart = (e: React.DragEvent, item: Item) => {
        e.dataTransfer.setData("application/json", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleItemClick = useCallback((item: Item, e: React.MouseEvent) => {
        addToHistory(item); 
        if (e.shiftKey) {
            const normSlot = normalizeSlot(item.slot);
            let targetEquipped: Item | null = null;
            if (normSlot === 'Ring') {
                const r1 = equipped['Ring_1'];
                const r2 = equipped['Ring_2'];
                if (!r1) targetEquipped = r2 || null;
                else if (!r2) targetEquipped = r1;
                else {
                    const score1 = calculateItemScore(r1, currentSpec, activeWeights, currentStats, currentClass);
                    const score2 = calculateItemScore(r2, currentSpec, activeWeights, currentStats, currentClass);
                    targetEquipped = score1 < score2 ? r1 : r2;
                }
            } 
            else if (normSlot === 'Trinket') {
                const t1 = equipped['Trinket_1'];
                const t2 = equipped['Trinket_2'];
                if (!t1) targetEquipped = t2 || null;
                else if (!t2) targetEquipped = t1;
                else {
                    const score1 = calculateItemScore(t1, currentSpec, activeWeights, currentStats, currentClass);
                    const score2 = calculateItemScore(t2, currentSpec, activeWeights, currentStats, currentClass);
                    targetEquipped = score1 < score2 ? t1 : t2;
                }
            } 
            else if (normSlot === 'Two-Hand') targetEquipped = equipped['MainHand'] || null; 
            else targetEquipped = equipped[normSlot] || null;

            setComparisonData({ newItem: item, equippedItem: targetEquipped });
            return;
        }
        onEquip(item);
    }, [currentClass, onEquip, equipped, currentSpec, activeWeights, currentStats]);

    const itemContent = useCallback((index: number, item: any) => {
        // Upgrade highlight logic
        const isUpgrade = item._score > equippedScore;
        const upgradeStyle = isUpgrade ? 'ring-1 ring-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : '';

        return (
            <div 
                key={item.id || item.name}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleItemClick(item, e)}
                draggable={true} 
                onDragStart={(e) => handleDragStart(e, item)} 
                className={`cursor-pointer transition-transform duration-200 hover:scale-105 inline-block w-full rounded-md ${upgradeStyle}`}
            >
                <ItemCard 
                    item={item} 
                    gameMode={currentRealm === 'Turtle' ? 'Turtle' : 'Classic'}
                    spec={currentSpec}
                    currentClass={currentClass}
                    customWeights={activeWeights}
                    currentStats={currentStats}
                    equipped={equipped} 
                    isBiS={item.isBiS} // PASS NEW BIS FLAG
                />
            </div>
        );
    }, [handleMouseEnter, handleMouseLeave, handleItemClick, currentRealm, currentSpec, currentClass, activeWeights, currentStats, equippedScore, equipped]);

    return (
        <section className="flex flex-col h-full w-full bg-[#050505] border-l border-white/5 relative">
            <TechCorners />
            <div className="shrink-0 flex flex-col border-b border-white/5 bg-gradient-to-l from-transparent via-white/5 to-transparent z-20">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${fetchError ? 'bg-red-500' : isFetching ? 'bg-yellow-500 animate-ping' : 'bg-emerald-500'} `}></div>
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${fetchError ? 'text-red-500' : isFetching ? 'text-yellow-500' : 'text-emerald-500'}`}>{fetchError ? "CONNECTION FAILED" : isFetching ? "DOWNLOADING..." : "FIRESTORE CONNECTED"}</span>
                            </div>
                            <button onClick={() => isAdmin ? setShowCreateModal(true) : setShowAdminLogin(true)} className={`text-[9px] font-mono transition-colors ${isAdmin ? 'text-red-500 font-bold underline decoration-dotted' : 'text-[#555] hover:text-[#888]'}`}>{isAdmin ? '[DATABASE EDITOR]' : '[ADMIN LOGIN]'}</button>
                            {isAdmin && <button onClick={() => signOutAdmin()} className="text-[9px] font-mono text-[#555] hover:text-red-400 transition-colors">[SIGN OUT]</button>}
                        </div>
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="SEARCH DATABASE..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="bg-black/50 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white w-64 focus:border-cyan-500 outline-none transition-all placeholder:text-white/20 font-mono uppercase focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] pr-8" 
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {recentItems.length > 0 && (
                        <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none border-b border-white/5 py-1">
                            <span className="text-[9px] text-[#444] font-bold uppercase tracking-widest shrink-0 mr-1">History</span>
                            {recentItems.map((item, i) => (
                                <div
                                    key={`${item.id ?? item.name}-${i}`}
                                    onClick={() => handleItemClick(item, {} as any)}
                                    className="w-6 h-6 rounded border border-[#333] hover:border-cyan-500 cursor-pointer overflow-hidden shrink-0 transition-colors"
                                    title={item.name}
                                >
                                    <img src={getIconUrl(item.icon || '')} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-4 items-center flex-wrap">
                        <div className="flex gap-2">
                            {REALM_OPTS.map(opt => {
                                const isActive = currentRealm === opt.id;
                                return (
                                    <button 
                                        key={opt.id} 
                                        onClick={() => setRealm(opt.id)} 
                                        className={`
                                            relative group -skew-x-12 w-28 h-8 border-l-2 border-r-2 transition-all duration-300
                                            ${isActive 
                                                ? 'bg-cyan-950/50 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-[1.02]' 
                                                : 'bg-black/40 border-white/10 hover:border-white/30 text-slate-500 hover:text-slate-300'
                                            }
                                        `}
                                    >
                                        <div className="skew-x-12 flex items-center justify-center w-full h-full relative z-10 gap-2">
                                            <span className="text-sm">{opt.icon}</span>
                                            <span className="text-[10px] font-bold tracking-widest">{opt.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={() => setIgnoreClassRestrictions(!ignoreClassRestrictions)} className={`relative group -skew-x-12 h-8 px-4 border-l-2 border-r-2 transition-colors duration-200 ${ignoreClassRestrictions ? 'bg-orange-900/20 border-orange-500/50 text-orange-400 hover:bg-orange-900/30' : 'bg-green-900/20 border-green-500/50 text-green-400 hover:bg-green-900/30'}`}>
                            <div className="skew-x-12 flex items-center justify-center w-full h-full gap-2">
                                <span className="text-xs">{ignoreClassRestrictions ? '🔓' : '🔒'}</span>
                                <span className="text-[9px] font-bold tracking-widest">{ignoreClassRestrictions ? 'ALL ITEMS' : 'CLASS ONLY'}</span>
                            </div>
                        </button>
                        
                        <div className="flex gap-1 bg-black/40 p-1 rounded border border-white/5">
                            {RARITY_FILTERS.map(rarity => {
                                const isActive = activeRarity === rarity.id;
                                return (
                                    <button
                                        key={rarity.id}
                                        onClick={() => setActiveRarity(rarity.id)}
                                        className={`px-2 py-1 text-[9px] font-bold border rounded transition-all duration-300 ${isActive ? `${rarity.bg} ${rarity.color} ${rarity.shadow} scale-105` : 'border-transparent text-[#555] hover:text-[#888]'}`}
                                    >
                                        {rarity.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-2"><SourceFilter selectedSources={activeSources} onToggleSource={handleToggleSource} currentRealm={currentRealm} /></div>
                <div className="bg-black/40 px-2 pt-2 border-t border-white/5">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {Object.entries(SLOT_ICONS).map(([key, icon]) => {
                            if (key === 'One-Hand') return null;
                            const isActive = activeSlot === key;
                            // fetchGlobalSlotCounts now returns counts keyed by UI slot name
                            const count = slotCounts[key] || 0;

                            return (
                                <button 
                                    key={key} 
                                    onClick={() => setActiveSlot(key)} 
                                    className={`
                                        flex flex-col items-center gap-2 min-w-[72px] p-3 rounded-t-md transition-all duration-300 border-t border-x border-b-0 overflow-hidden relative group
                                        ${isActive 
                                            ? 'bg-gradient-to-b from-cyan-900/30 to-transparent border-cyan-500/50 text-cyan-300 shadow-[0_-5px_15px_rgba(6,182,212,0.15)] z-10' 
                                            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <img src={getIconUrl(icon)} className={`w-12 h-12 rounded-lg shadow-md transition-all duration-300 relative z-10 ${isActive ? 'grayscale-0 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-110' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 group-hover:scale-105'}`} alt={key} />
                                    
                                    {isActive && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-cyan-400/20 blur-xl rounded-full pointer-events-none"></div>}

                                    <div className="flex flex-col items-center leading-none relative z-10">
                                        <span className={`text-[10px] font-cinzel font-bold tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-cyan-400 drop-shadow-md' : 'text-[#666]'}`}>
                                            {SLOT_LABELS[key] || key.toUpperCase()}
                                        </span>
                                        <span className={`text-[8px] font-mono mt-1 ${isActive ? 'text-cyan-500/80' : 'text-[#444]'}`}>
                                            {count > 0 ? count.toLocaleString() : '-'}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div className="bg-[#0a0a0c] px-2 py-1.5 border-t border-white/5 flex flex-wrap justify-center gap-x-3 gap-y-1 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
                    {ALPHABET.map(char => (
                        <button
                            key={char}
                            onClick={() => setActiveLetterFilter(char)}
                            className={`
                                text-[9px] font-bold font-mono transition-all duration-150 relative px-1
                                ${activeLetterFilter === char 
                                    ? 'text-cyan-400 scale-125' 
                                    : 'text-[#444] hover:text-[#999] hover:scale-110'
                                }
                            `}
                        >
                            {char}
                            {activeLetterFilter === char && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-px bg-cyan-500/50 shadow-[0_0_5px_currentColor]"></div>}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-transparent relative flex flex-col overflow-hidden">
                <div className="flex-1 h-full">
                    {displayedItems.length > 0 ? (
                        <Virtuoso
                            style={{ height: '100%' }}
                            data={displayedItems}
                            overscan={2000} 
                            components={{ List: MasonryList }}
                            itemContent={itemContent}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 animate-pulse"><span className="text-4xl opacity-20 mb-2">⚡</span><span className="text-xs font-mono uppercase tracking-widest">{isFetching ? "ACCESSING MAINFRAME..." : "NO DATA FOUND"}</span></div>
                    )}
                </div>
            </div>

            {hoveredItem && <ItemTooltip item={hoveredItem} spec={currentSpec} initialPosition={initialTooltipPos} equipped={equipped} currentStats={currentStats} currentClass={currentClass} />}
            
            {showCreateModal && <Suspense fallback={null}><CreateItemModal currentClass={currentClass} currentSpec={currentSpec} onCreate={(i) => { if(editingItem) onUpdateDatabase(i); else onImportDatabase([i]); setShowCreateModal(false); }} onClose={() => { setShowCreateModal(false); setEditingItem(null); }} editingItem={editingItem} /></Suspense>}

            {showAdminLogin && <Suspense fallback={null}><AdminLoginModal onLogin={() => { setShowAdminLogin(false); }} onClose={() => setShowAdminLogin(false)} /></Suspense>}

            {comparisonData && (
                <Suspense fallback={null}><ComparisonModal
                    newItem={comparisonData.newItem}
                    equippedItem={comparisonData.equippedItem}
                    onEquip={(item) => {
                        onEquip(item);
                        setComparisonData(null);
                    }}
                    onClose={() => setComparisonData(null)}
                /></Suspense>
            )}
        </section>
    );
};
