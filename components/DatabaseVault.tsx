
// ... existing imports ...
import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Virtuoso } from 'react-virtuoso';
import { Item, SpecName, RealmType, GameMode, Build, ClassName, StatWeights } from '../types';
import { CLASS_CONFIG, SPEC_ICONS } from '../constants';
import { normalizeSlot, getIconUrl, calculateItemScore, normalizeItem } from '../services/gearService';
import ItemCard from './ItemCard';
import { ItemTooltip } from './ItemTooltip';
import { ComparisonModal } from './ComparisonModal';
import { CreateItemModal } from './CreateItemModal';

interface DatabaseVaultProps {
    currentSpec: SpecName;
    currentClass: ClassName;
    setSpec: (s: SpecName) => void;
    currentRealm: RealmType;
    setRealm: (r: RealmType) => void;
    currentMode: GameMode;
    setMode: (m: GameMode) => void;
    equipped: Build;
    onEquip: (item: Item) => void;
    items: Item[];
    onImportDatabase: (newItems: Item[]) => void;
    onResetDatabase: (wipe: boolean) => void;
    customWeights?: StatWeights;
}

// Icons for Category Headers & Fallbacks
const SLOT_ICONS: Record<string, string> = {
    "Head": "inv_helmet_04", 
    "Neck": "inv_jewelry_necklace_20", 
    "Shoulder": "inv_shoulder_23", 
    "Back": "inv_misc_cape_18", 
    "Chest": "inv_chest_plate04", 
    "Wrist": "inv_bracer_07", 
    "Hands": "inv_gauntlets_17", 
    "Waist": "inv_belt_12", 
    "Legs": "inv_pants_plate_05", 
    "Feet": "inv_boots_chain_05", 
    "Ring": "inv_jewelry_ring_22", 
    "Trinket": "inv_jewelry_talisman_08", 
    "Main Hand": "inv_sword_39", 
    "Off Hand": "inv_shield_05", 
    "Ranged": "inv_weapon_bow_08", 
    "Relic": "inv_misc_idol_02", 
    "Misc": "inv_misc_bag_08",
    "One-Hand": "inv_sword_39",
    "Two-Hand": "inv_sword_39",
    "Shield": "inv_shield_05"
};

type LootSource = 'All' | 'Dungeons' | 'MC' | 'BWL' | 'ZG' | 'AQ40' | 'Naxx' | 'PvP / World';

// --- CONFIGURATION ARRAYS ---
const REALM_OPTS: { id: RealmType, label: string, icon: string, theme: 'amber' | 'emerald' }[] = [
    { id: 'Classic', label: 'CLASSIC', icon: '🦁', theme: 'amber' },
    { id: 'Turtle', label: 'TURTLE', icon: '🐢', theme: 'emerald' }
];

const MODE_OPTS: { id: GameMode, label: string, icon: string, theme: 'purple' | 'blue' | 'red' }[] = [
    { id: 'End Game', label: 'END GAME', icon: '👑', theme: 'purple' },
    { id: 'Leveling', label: 'LEVELING', icon: '🕯️', theme: 'blue' },
    { id: 'PvP Twink', label: 'PVP TWINK', icon: '🚩', theme: 'red' }
];

const SOURCE_OPTS: { id: LootSource, label: string, icon: string, theme: any }[] = [
    { id: 'All', label: 'ALL', icon: '📦', theme: 'stone' },
    { id: 'Dungeons', label: 'DUNGEONS', icon: '🗝️', theme: 'blue' },
    { id: 'MC', label: 'MOLTEN CORE', icon: '🔥', theme: 'orange' },
    { id: 'BWL', label: 'BLACKWING LAIR', icon: '🐲', theme: 'red' },
    { id: 'ZG', label: 'ZUL\'GURUB', icon: '🐍', theme: 'green' },
    { id: 'AQ40', label: 'AQ40', icon: '👁️', theme: 'yellow' },
    { id: 'Naxx', label: 'NAXXRAMAS', icon: '💀', theme: 'purple' },
    { id: 'PvP / World', label: 'PVP / WORLD', icon: '⚔️', theme: 'red' },
];

// --- STYLING HELPERS ---
const getButtonStyle = (isActive: boolean, colorTheme: 'amber' | 'emerald' | 'purple' | 'blue' | 'red' | 'green' | 'yellow' | 'stone' | 'orange') => {
    const base = "px-2 lg:px-4 py-3 text-[10px] lg:text-xs font-bold rounded border transition-all duration-300 font-cinzel tracking-wider uppercase group relative overflow-hidden active:scale-[0.98] flex items-center justify-center gap-2 w-full h-full";
    
    // Inactive: White bg, Stone border, Stone text
    const inactive = "border-stone-300 dark:border-[#333] bg-white dark:bg-[#111] text-stone-600 dark:text-[#555] hover:border-stone-400 dark:hover:border-[#555] hover:text-stone-900 dark:hover:text-[#888] hover:shadow-[0_0_10px_rgba(0,0,0,0.1)]";

    if (!isActive) return `${base} ${inactive}`;

    // Active Styles with Glow
    switch (colorTheme) {
        case 'amber': return `${base} border-[#f59e0b] bg-[#f59e0b]/10 text-amber-700 dark:text-[#fbbf24] shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-[#f59e0b]/20`;
        case 'emerald': return `${base} border-[#10b981] bg-[#10b981]/10 text-emerald-700 dark:text-[#34d399] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-[#10b981]/20`;
        case 'purple': return `${base} border-[#a855f7] bg-[#a855f7]/10 text-purple-700 dark:text-[#c084fc] shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-[#a855f7]/20`;
        case 'blue': return `${base} border-[#3b82f6] bg-[#3b82f6]/10 text-blue-700 dark:text-[#60a5fa] shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-[#3b82f6]/20`;
        case 'red': return `${base} border-[#ef4444] bg-[#ef4444]/10 text-red-700 dark:text-[#f87171] shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-[#ef4444]/20`;
        case 'green': return `${base} border-[#22c55e] bg-[#22c55e]/10 text-green-700 dark:text-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-[#22c55e]/20`;
        case 'yellow': return `${base} border-[#eab308] bg-[#eab308]/10 text-yellow-700 dark:text-[#facc15] shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:bg-[#eab308]/20`;
        case 'orange': return `${base} border-[#f97316] bg-[#f97316]/10 text-orange-700 dark:text-[#fb923c] shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-[#f97316]/20`;
        case 'stone': return `${base} border-[#78716c] bg-[#78716c]/10 text-stone-700 dark:text-[#a8a29e] shadow-[0_0_15px_rgba(120,113,108,0.3)] hover:bg-[#78716c]/20`;
        default: return `${base} ${inactive}`;
    }
};

const DatabaseVault: React.FC<DatabaseVaultProps> = ({ 
    currentSpec, currentClass, setSpec, 
    currentRealm, setRealm, 
    currentMode, setMode,
    equipped, onEquip,
    items: databaseItems,
    onImportDatabase,
    onResetDatabase,
    customWeights
}) => {
    // ... (State and other handlers remain unchanged) ...
    const classData = CLASS_CONFIG[currentClass];
    const [searchTerm, setSearchTerm] = useState('');
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ "Head": true });
    const [currentSource, setCurrentSource] = useState<LootSource>('All');
    
    // Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importText, setImportText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("CONSULTING TOMES...");
    
    // Forge State
    const [isForgeOpen, setIsForgeOpen] = useState(false);

    // Tooltip State
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Comparison State
    const [comparingItem, setComparingItem] = useState<Item | null>(null);

    const toggleSlot = (slot: string) => {
        setOpenCategories(prev => ({ ...prev, [slot]: !prev[slot] }));
    };

    const handleClearSearch = () => setSearchTerm('');

    const handleMouseEnter = (item: Item, e: React.MouseEvent) => {
        setHoveredItem(item);
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const handleCompare = (item: Item) => {
        setComparingItem(item);
    };

    const handleCloseComparison = () => {
        setComparingItem(null);
    };

    const handleResetClick = (e: React.MouseEvent) => {
        onResetDatabase(e.shiftKey);
    };

    const handleAIImport = (newItemsRaw: Item[]) => {
        const normalized = newItemsRaw.map(normalizeItem);
        onImportDatabase(normalized);
    };

    const handleCreateItem = (newItem: Item) => {
        const normalized = normalizeItem(newItem);
        onImportDatabase([normalized]);
        setIsForgeOpen(false);
    };

    const fetchRaidLoot = async (raidName: string) => {
        setIsProcessing(true);
        setLoadingMessage(`SUMMONING ${raidName.toUpperCase()} LOOT...`);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 120000));
        try {
            // @ts-ignore
            const apiKey = process.env.API_KEY || "";
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Generate a COMPREHENSIVE JSON list of World of Warcraft Classic (Patch 1.12) items for a ${currentClass} from ${raidName}. Include stats, icon, and setName if applicable.`;
            
            const apiPromise = ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                slot: { type: Type.STRING },
                                rarity: { type: Type.STRING },
                                source: { type: Type.STRING },
                                icon: { type: Type.STRING },
                                setName: { type: Type.STRING },
                                stats: { type: Type.OBJECT, properties: { sp: {type:Type.NUMBER}, hit: {type:Type.NUMBER}, crit: {type:Type.NUMBER}, int: {type:Type.NUMBER}, sta: {type:Type.NUMBER}, spi: {type:Type.NUMBER}, str: {type:Type.NUMBER}, agi: {type:Type.NUMBER}, ap: {type:Type.NUMBER}, armor: {type:Type.NUMBER}, defense: {type:Type.NUMBER}, resFire: {type:Type.NUMBER}, resShadow: {type:Type.NUMBER}, resNature: {type:Type.NUMBER}, resFrost: {type:Type.NUMBER}, resArcane: {type:Type.NUMBER}, minDmg: {type:Type.NUMBER}, maxDmg: {type:Type.NUMBER}, speed: {type:Type.NUMBER}, mp5: {type:Type.NUMBER} } },
                                proc: { type: Type.STRING },
                                use: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            const response: any = await Promise.race([apiPromise, timeoutPromise]);
            if (response.text) {
                const newItems = JSON.parse(response.text) as Item[];
                if (newItems.length > 0) {
                    handleAIImport(newItems);
                    setIsImportModalOpen(false);
                    if (raidName.includes('Molten Core')) setCurrentSource('MC');
                    else if (raidName.includes('Blackwing')) setCurrentSource('BWL');
                    else if (raidName.includes('Zul')) setCurrentSource('ZG');
                    else if (raidName.includes('Ahn')) setCurrentSource('AQ40');
                    else if (raidName.includes('Naxx')) setCurrentSource('Naxx');
                    else if (raidName.includes('Dungeon')) setCurrentSource('Dungeons');
                }
            }
        } catch (error: any) {
            console.error("Raid Loot Error:", error);
            alert("Import failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const processSmartImport = async () => {
        setIsProcessing(true);
        try {
             handleAIImport([]); 
        } catch (error: any) {
             console.error("Import Error:", error);
             alert("Import failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const getItemSourceCategory = (source: string): LootSource => {
        const s = source.toLowerCase();
        if (s.includes('naxx')) return 'Naxx';
        if (s.includes('aq40') || s.includes('ahn\'qiraj')) return 'AQ40';
        if (s.includes('bwl') || s.includes('blackwing') || s.includes('onyxia')) return 'BWL';
        if (s.includes('mc') || s.includes('molten')) return 'MC';
        if (s.includes('zg') || s.includes('zul')) return 'ZG';
        if (s.includes('dungeon') || s.includes('brd') || s.includes('ubrs')) return 'Dungeons';
        return 'PvP / World';
    };

    const getEquippedForComparison = (newItem: Item): Item[] => {
        const slot = normalizeSlot(newItem.slot);
        const main = equipped['MainHand'];
        const off = equipped['OffHand'];
        if (["Two-Hand", "Staff", "Polearm"].includes(newItem.slot)) return [main, off].filter((i): i is Item => !!i);
        if (slot === 'Ring') return [equipped['Ring_1'], equipped['Ring_2']].filter((i): i is Item => !!i);
        if (slot === 'Trinket') return [equipped['Trinket_1'], equipped['Trinket_2']].filter((i): i is Item => !!i);
        if (slot === 'MainHand') return main ? [main] : [];
        if (slot === 'OffHand') return off ? [off] : [];
        const eq = equipped[slot];
        return eq ? [eq] : [];
    };

    const filteredItems = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase().trim();
        return databaseItems.filter(i => {
            if (["Bag", "Ammo", "Tabard", "Shirt", "Quest", "Key", "Consumable", "Token"].includes(i.slot)) return false; 
            if (lowerSearch && !i.name.toLowerCase().includes(lowerSearch)) return false;
            if (i.realm && i.realm !== "Both" && i.realm !== currentRealm) return false;
            if (i.classes && !i.classes.includes(currentClass)) return false;
            if (currentSource !== 'All') {
                const category = getItemSourceCategory(i.source);
                if (category !== currentSource) return false;
            }
            return true;
        });
    }, [searchTerm, currentRealm, currentMode, currentClass, databaseItems, currentSource]);

    const bestItemsInView = useMemo(() => {
        const slots: Record<string, Item[]> = {};
        filteredItems.forEach(item => {
            const s = normalizeSlot(item.slot);
            if (!slots[s]) slots[s] = [];
            slots[s].push(item);
        });
        const bestItemNames = new Set<string>();
        Object.keys(slots).forEach(slot => {
            const sorted = slots[slot].sort((a, b) => calculateItemScore(b, currentSpec, customWeights) - calculateItemScore(a, currentSpec, customWeights));
            let limit = 1;
            if (['Ring', 'Trinket'].includes(slot)) limit = 2;
            sorted.slice(0, limit).forEach(i => bestItemNames.add(i.name));
        });
        return bestItemNames;
    }, [filteredItems, currentSpec, customWeights]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, Item[]> = {};
        filteredItems.forEach(item => {
            let key = item.slot || "Misc";
            if (["Shield", "Held In Off-hand", "OffHand"].includes(key)) key = "Off Hand";
            if (["One-Hand", "Two-Hand", "Staff", "Sword", "Mace", "Axe", "Dagger", "Fist Weapon", "Polearm"].includes(key)) key = "Main Hand";
            if (["Bow", "Crossbow", "Gun", "Wand", "Thrown"].includes(key)) key = "Ranged";
            if (["Relic", "Idol", "Totem", "Libram"].includes(key)) key = "Relic";
            if (["Finger", "Ring"].includes(key)) key = "Ring";
            if (["Necklace", "Neck"].includes(key)) key = "Neck";
            if (["Cloak", "Back"].includes(key)) key = "Back";
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return groups;
    }, [filteredItems]);

    type RowData = 
        | { type: 'header', slot: string, count: number, isOpen: boolean }
        | { type: 'item', item: Item, isBis: boolean };

    const flatRows = useMemo(() => {
        const rows: RowData[] = [];
        const sortedSlots = Object.keys(groupedItems).sort();
        
        sortedSlots.forEach(slot => {
            const items = groupedItems[slot];
            const isOpen = openCategories[slot] || searchTerm.length > 0;
            
            rows.push({ type: 'header', slot, count: items.length, isOpen });
            
            if (isOpen) {
                const sortedItems = [...items].sort((a, b) => 
                    calculateItemScore(b, currentSpec, customWeights) - calculateItemScore(a, currentSpec, customWeights)
                );
                
                sortedItems.forEach(item => {
                    rows.push({ type: 'item', item, isBis: bestItemsInView.has(item.name) });
                });
            }
        });
        return rows;
    }, [groupedItems, openCategories, searchTerm, bestItemsInView, currentSpec, customWeights]);

    const rowRenderer = (index: number, row: RowData) => {
        if (row.type === 'header') {
            return (
                <div className="pt-4 pb-2 bg-[#f5f5f4] dark:bg-[#121214] transition-colors duration-300"> 
                    <div className="border border-stone-300 dark:border-[#27272a] rounded-lg overflow-hidden bg-white dark:bg-[#1c1c1f] shadow-sm">
                        <button 
                            onClick={() => toggleSlot(row.slot)}
                            className="w-full text-left bg-[#fcfcfc] dark:bg-[#222225] px-5 py-3.5 cursor-pointer flex justify-between items-center hover:bg-stone-50 dark:hover:bg-[#2a2a2d] transition-colors group focus:outline-none"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded border border-stone-300 dark:border-[#333] bg-white dark:bg-[#111] p-0.5 shadow-sm overflow-hidden shrink-0">
                                        <img 
                                        src={getIconUrl(SLOT_ICONS[row.slot] || "inv_misc_questionmark")} 
                                        className="w-full h-full object-cover rounded-[2px]" 
                                        alt={row.slot}
                                    />
                                </div>
                                <span className="font-cinzel font-bold text-xs tracking-[0.15em] text-stone-800 dark:text-[#d4d4d8] group-hover:text-stone-600 dark:group-hover:text-[#FFD700] transition-colors">{row.slot.toUpperCase()}</span>
                                <span className="text-[9px] text-stone-600 dark:text-[#71717a] font-bold bg-stone-200 dark:bg-[#141417] px-2 py-0.5 rounded-full border border-stone-300 dark:border-[#333] shadow-inner">{row.count}</span>
                            </div>
                            <span className="text-stone-500 dark:text-[#52525b] text-[10px] group-hover:text-stone-700 dark:group-hover:text-[#a1a1aa] transition-colors duration-300 transform">
                                {row.isOpen ? '▲' : '▼'}
                            </span>
                        </button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="pb-1.5 pl-2 pr-2">
                    <ItemCard 
                        item={row.item} 
                        equipped={equipped}
                        spec={currentSpec}
                        isBis={row.isBis}
                        onEquip={onEquip}
                        onCompare={handleCompare}
                        onMouseEnter={(e) => handleMouseEnter(row.item, e)}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                    />
                </div>
            );
        }
    };

    return (
        <main className="flex-grow p-4 lg:p-6 flex flex-col bg-[#fafaf9] dark:bg-[#121214] text-stone-900 dark:text-[#e2e8f0] relative h-full transition-colors duration-300">
            
            {/* CreateItemModal and ImportModal logic remain same */}
            {isForgeOpen && (
                <CreateItemModal 
                    onClose={() => setIsForgeOpen(false)}
                    onCreate={handleCreateItem}
                    currentClass={currentClass}
                    currentSpec={currentSpec}
                />
            )}

            {/* Import Modal logic (Hidden for brevity) */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                    {/* ... modal content ... */}
                    <div className="bg-[#0f0f12] border border-[#333] w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                            <h2 className="text-[#FFD700] font-cinzel text-lg tracking-[0.1em] font-bold">THE ARCHIVIST</h2>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-[#666] hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="p-6 flex flex-col gap-6 flex-grow overflow-y-auto">
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs font-bold text-[#888] tracking-widest border-b border-[#222] pb-2">INSTANT RAID LOOT</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => fetchRaidLoot("Dungeons (Pre-BiS)")} disabled={isProcessing} className="px-3 py-2 bg-[#1a1a1d] border border-[#333] hover:border-[#66ccff] hover:text-[#66ccff] rounded text-[10px] font-bold transition-colors disabled:opacity-50">DUNGEONS</button>
                                    <button onClick={() => fetchRaidLoot("Molten Core")} disabled={isProcessing} className="px-3 py-2 bg-[#1a1a1d] border border-[#333] hover:border-[#ff8000] hover:text-[#ff8000] rounded text-[10px] font-bold transition-colors disabled:opacity-50">MOLTEN CORE</button>
                                    <button onClick={() => fetchRaidLoot("Blackwing Lair")} disabled={isProcessing} className="px-3 py-2 bg-[#1a1a1d] border border-[#333] hover:border-[#ff4040] hover:text-[#ff4040] rounded text-[10px] font-bold transition-colors disabled:opacity-50">BWL</button>
                                    <button onClick={() => fetchRaidLoot("Zul'Gurub")} disabled={isProcessing} className="px-3 py-2 bg-[#1a1a1d] border border-[#333] hover:border-[#00cc00] hover:text-[#00cc00] rounded text-[10px] font-bold transition-colors disabled:opacity-50">ZUL'GURUB</button>
                                    <button onClick={() => fetchRaidLoot("Ahn'Qiraj (AQ40/AQ20)")} disabled={isProcessing} className="px-3 py-2 bg-[#1a1a1d] border border-[#333] hover:border-[#ffff00] hover:text-[#ffff00] rounded text-[10px] font-bold transition-colors disabled:opacity-50">AQ40</button>
                                    <button onClick={() => fetchRaidLoot("Naxxramas")} disabled={isProcessing} className="px-3 py-2 bg-[#1a1a1d] border border-[#333] hover:border-[#bb88ff] hover:text-[#bb88ff] rounded text-[10px] font-bold transition-colors disabled:opacity-50">NAXXRAMAS</button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs font-bold text-[#888] tracking-widest border-b border-[#222] pb-2">CUSTOM DATA IMPORT</h3>
                                <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste item names or lists..." className="w-full h-32 bg-[#0a0a0c] border border-[#333] rounded p-4 text-xs font-mono text-[#ddd] focus:border-[#FFD700] outline-none resize-none" />
                            </div>
                        </div>
                        <div className="p-5 border-t border-[#222] bg-[#151515] flex justify-end gap-3">
                            <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded text-xs font-bold text-[#888] hover:text-white transition-colors">CANCEL</button>
                            <button onClick={processSmartImport} disabled={isProcessing || !importText} className={`px-6 py-2 rounded text-xs font-bold tracking-widest bg-[#FFD700]/10 border border-[#FFD700]/50 text-[#FFD700] hover:bg-[#FFD700]/20 transition-all ${isProcessing || !importText ? 'opacity-50' : ''}`}>{isProcessing ? loadingMessage : 'ANALYZE TEXT'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Optimized Header Controls */}
            <div className="mb-4 flex flex-col gap-4 shrink-0">
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    
                    {/* Realm Selector */}
                    <div className="xl:col-span-3 flex flex-col gap-1">
                        <span className="text-[9px] text-stone-600 dark:text-[#888] font-cinzel font-bold tracking-[0.15em] pl-1">REALM</span>
                        <div className="grid grid-cols-2 gap-2 h-full">
                            {REALM_OPTS.map(r => (
                                <button 
                                    key={r.id} 
                                    onClick={() => setRealm(r.id)} 
                                    className={getButtonStyle(currentRealm === r.id, r.theme)}
                                >
                                    <span className="text-lg">{r.icon}</span>
                                    <span>{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Game Mode */}
                    <div className="xl:col-span-5 flex flex-col gap-1">
                        <span className="text-[9px] text-stone-600 dark:text-[#888] font-cinzel font-bold tracking-[0.15em] pl-1">GAME MODE</span>
                        <div className="grid grid-cols-3 gap-2 h-full">
                            {MODE_OPTS.map(m => (
                                <button 
                                    key={m.id} 
                                    onClick={() => setMode(m.id)} 
                                    className={getButtonStyle(currentMode === m.id, m.theme)}
                                >
                                    <span className="text-lg">{m.icon}</span>
                                    <span>{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Actions */}
                    <div className="xl:col-span-4 flex flex-col gap-1">
                         <span className="text-[9px] text-stone-600 dark:text-[#888] font-cinzel font-bold tracking-[0.15em] pl-1">ARCHIVES</span>
                         <div className="flex gap-2 h-full">
                            <div className="relative flex-grow group h-full">
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="SEARCH ITEMS..." className="w-full h-[40px] lg:h-full bg-white dark:bg-[#050505] border border-stone-300 dark:border-[#333] text-stone-900 dark:text-[#f0f0f0] pl-4 pr-10 rounded text-xs font-bold tracking-wide focus:border-stone-500 dark:focus:border-[#FFD700] outline-none transition-colors" />
                                {searchTerm && <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-[#71717a] hover:text-stone-700 dark:hover:text-white">✕</button>}
                            </div>
                            <button onClick={() => setIsForgeOpen(true)} title="Blacksmith's Forge" className="h-[40px] lg:h-full aspect-square border border-orange-500/30 bg-orange-500/5 text-orange-600 hover:bg-orange-500 hover:text-white rounded flex items-center justify-center transition-colors text-lg">🔥</button>
                            <button onClick={handleResetClick} title="Reset DB" className="h-[40px] lg:h-full aspect-square border border-red-500/30 bg-red-500/5 text-red-600 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors text-lg">🗑️</button>
                            <button onClick={() => setIsImportModalOpen(true)} title="Import" className="h-[40px] lg:h-full aspect-square border border-[#00aaff]/30 bg-[#00aaff]/5 text-[#0088cc] hover:bg-[#00aaff] hover:text-white rounded flex items-center justify-center transition-colors text-lg">📥</button>
                         </div>
                    </div>
                </div>

                {/* Row 2: Loot Source (Grid) */}
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-stone-600 dark:text-[#888] font-cinzel font-bold tracking-[0.15em] pl-1">LOOT SOURCE</span>
                    <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2">
                        {SOURCE_OPTS.map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => setCurrentSource(s.id)} 
                                className={getButtonStyle(currentSource === s.id, s.theme)}
                            >
                                <span className="text-lg">{s.icon}</span>
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Row 3: Specs - MODIFIED */}
                <div className="flex gap-2 p-2 bg-white border border-stone-200 dark:bg-[#050505] dark:border-[#222] rounded-lg overflow-hidden shadow-inner transition-colors">
                    {CLASS_CONFIG[currentClass].specs.map(s => {
                        const isSelected = currentSpec === s;
                        const specColor = classData.color;

                        return (
                            <button 
                                key={s} 
                                onClick={() => setSpec(s)} 
                                className={`flex-1 py-3 text-[10px] lg:text-xs font-bold rounded transition-all duration-300 font-cinzel tracking-[0.1em] uppercase relative overflow-hidden group border active:scale-[0.98] flex items-center justify-center gap-3 ${
                                    isSelected 
                                        ? 'bg-opacity-10 dark:bg-opacity-10' 
                                        : 'border-transparent text-stone-500 dark:text-[#52525b] hover:bg-stone-50 dark:hover:bg-white/5 hover:text-stone-700 dark:hover:text-[#aaa]'
                                }`}
                                style={isSelected ? { 
                                    borderColor: specColor, 
                                    color: specColor,
                                    backgroundColor: `${specColor}1a`,
                                    boxShadow: `0 0 15px ${specColor}40`
                                } : {}}
                            >
                                <img 
                                    src={getIconUrl(SPEC_ICONS[s] || classData.icon)} 
                                    className={`w-8 h-8 rounded shadow-sm transition-all duration-300 ${isSelected ? 'grayscale-0 opacity-100 scale-110' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`} 
                                    alt="" 
                                />
                                {s.split('(')[0]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Virtualized List Container */}
            <div className="flex-1 -mx-4 lg:-mx-6 px-4 lg:px-6">
                <Virtuoso
                    style={{ height: '100%' }}
                    data={flatRows}
                    itemContent={rowRenderer}
                    overscan={500} 
                    className="scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                />
            </div>

            {/* Overlays */}
            {hoveredItem && !comparingItem && <ItemTooltip item={hoveredItem} spec={currentSpec} position={mousePos} equipped={equipped} />}
            {comparingItem && <ComparisonModal newItem={comparingItem} equippedItems={getEquippedForComparison(comparingItem)} onClose={handleCloseComparison} />}
        </main>
    );
};

export default DatabaseVault;
