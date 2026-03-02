
import React, { useMemo } from 'react';
import { Item } from '../types';
import { getIconUrl, getRarityColor } from '../services/gearService';

interface LootRouteModalProps {
    wishlist: Item[];
    onRemove: (item: Item) => void;
    onClose: () => void;
}

interface RouteNode {
    zone: string;
    bosses: Record<string, Item[]>;
    items: Item[]; // Items with no specific boss but in this zone
}

const ZONE_KEYWORDS: Record<string, string[]> = {
    "Naxxramas": ["naxx", "kel'thuzad", "sapphiron", "four horsemen", "loatheb", "thaddius", "heigan", "noth", "faerlina", "anub'rekhan", "maexxna", "patchwerk", "grobbulus", "gluth", "razuvious", "gothik"],
    "Ahn'Qiraj (AQ40)": ["aq40", "ahn'qiraj", "cthun", "c'thun", "twin emperors", "ouro", "viscidus", "huhuran", "fankriss", "sartura", "skeram", "vem", "yauj", "kri"],
    "Ruins of Ahn'Qiraj (AQ20)": ["aq20", "ossirian", "ayamiss", "buru", "moam", "rajaxx", "kurinnaxx"],
    "Blackwing Lair": ["bwl", "blackwing", "nefarian", "chromaggus", "flamegor", "ebonroc", "firemaw", "broodlord", "vaelastrasz", "razorgore"],
    "Molten Core": ["molten core", "mc", "ragnaros", "majordomo", "golemagg", "shazzrah", "sulfuron", "garr", "geddon", "magmadar", "lucifron", "gehennas"],
    "Zul'Gurub": ["zul'gurub", "zg", "hakkar", "jindo", "mandokir"],
    "Onyxia's Lair": ["onyxia"],
    "World Bosses": ["kazzak", "azuregos", "nightmare", "ysondre", "lethon", "emeriss", "taerar"],
    "PvP": ["pvp", "rank", "alterac", "arathi", "warsong"],
    "Crafting": ["crafting", "blacksmithing", "tailoring", "leatherworking", "engineering", "alchemy"],
    "Dungeons": ["brd", "ubrs", "lbrs", "strat", "scholo", "dire maul", "blackrock", "stratholme", "scholomance"]
};

export const LootRouteModal: React.FC<LootRouteModalProps> = ({ wishlist, onRemove, onClose }) => {

    const routeData = useMemo(() => {
        const routes: Record<string, RouteNode> = {};
        const miscItems: Item[] = [];

        wishlist.forEach(item => {
            const sourceLower = String(item.source || "").toLowerCase();
            let matchedZone = "Miscellaneous";

            // Find Zone
            for (const [zoneName, keywords] of Object.entries(ZONE_KEYWORDS)) {
                if (keywords.some(k => sourceLower.includes(k))) {
                    matchedZone = zoneName;
                    break;
                }
            }

            if (!routes[matchedZone]) {
                routes[matchedZone] = { zone: matchedZone, bosses: {}, items: [] };
            }

            // Attempt simple Boss extraction (very basic heuristic)
            // Assuming source format often looks like "Boss Name - Zone" or just "Zone"
            // If the source string is just the zone name (roughly), put in generic items
            // Otherwise, treat the non-zone part as the "Boss/Source"
            
            // This is a naive split, but works for many DB formats
            if (matchedZone !== "Miscellaneous" && matchedZone !== "PvP" && matchedZone !== "Crafting") {
                routes[matchedZone].items.push(item);
            } else {
                routes[matchedZone].items.push(item);
            }
        });

        // Sort zones by tier roughly (reverse generic order)
        const priorityOrder = ["Naxxramas", "Ahn'Qiraj (AQ40)", "Blackwing Lair", "Molten Core", "Ruins of Ahn'Qiraj (AQ20)", "Zul'Gurub", "Onyxia's Lair", "World Bosses", "Dungeons", "PvP", "Crafting", "Miscellaneous"];
        
        return Object.values(routes).sort((a, b) => {
            const idxA = priorityOrder.indexOf(a.zone);
            const idxB = priorityOrder.indexOf(b.zone);
            // If both found, lower index is higher priority (0 is top)
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.zone.localeCompare(b.zone);
        });

    }, [wishlist]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#FFD700] w-full max-w-4xl rounded-lg shadow-[0_0_50px_rgba(255,215,0,0.15)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-[#FFD700] font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span>📜</span>
                            <span>LOOT PRIORITY ROUTE</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">OPTIMIZED ACQUISITION PATH</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0c]">
                    {routeData.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#444] gap-2">
                            <span className="text-4xl opacity-30">🕸️</span>
                            <span className="text-xs font-bold tracking-widest">YOUR WISHLIST IS EMPTY</span>
                            <span className="text-[10px]">Star items in the database to add them here.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {routeData.map((node) => (
                                <div key={node.zone} className="bg-[#111] border border-[#222] rounded overflow-hidden">
                                    {/* Zone Header */}
                                    <div className="bg-[#1a1a1d] px-4 py-2 border-b border-[#222] flex justify-between items-center">
                                        <h3 className="text-[#e2e8f0] font-cinzel font-bold text-sm tracking-widest uppercase">{node.zone}</h3>
                                        <span className="text-[10px] bg-[#222] px-2 py-0.5 rounded text-[#888] font-bold">{node.items.length} ITEMS</span>
                                    </div>
                                    
                                    {/* Items Grid */}
                                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {node.items.map((item, idx) => (
                                            <div key={`${item.name}-${idx}`} className="flex items-center gap-3 p-2 rounded bg-[#0a0a0c] border border-[#222] group hover:border-[#444] transition-colors relative">
                                                <div className="relative w-10 h-10 shrink-0">
                                                    <img src={getIconUrl(item.icon)} className="w-full h-full rounded border border-[#333]" alt="" />
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-bold truncate pr-4" style={{ color: getRarityColor(item) }}>{item.name}</span>
                                                        <button 
                                                            onClick={() => onRemove(item)}
                                                            className="text-[#333] hover:text-red-500 font-bold px-1 transition-colors text-xs"
                                                            title="Remove from Wishlist"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-0.5">
                                                        <span className="text-[9px] text-[#666] truncate">{item.source}</span>
                                                        <span className="text-[9px] text-[#444] uppercase font-bold tracking-wider">{item.slot}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
