
import React, { useState, memo } from 'react';
import { getRenderableIcon } from '../services/gearService';
import { Search } from 'lucide-react';
import { Item } from '../types';

interface SlotProps {
    id: string;
    label: string;
    item?: Item;
    onUnequip: (slotId: string) => void;
    onDropEquip: (item: Item, slotId: string) => void;
    onMouseEnter: (item: Item, e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onClick?: (e: React.MouseEvent) => void;
    onContextMenu?: () => void;
    onQuickSearch?: (slotId: string) => void;
}

// 1. Move static data OUTSIDE the component to avoid recreation on every render
const RARITY_COLORS: Record<number, string> = {
    0: '#9d9d9d', 1: '#ffffff', 2: '#1eff00',
    3: '#0070dd', 4: '#a335ee', 5: '#ff8000'
};

const EMPTY_SLOT_ICONS: Record<string, string> = {
    "Head": "inventoryslot_head", "Neck": "inventoryslot_neck", "Shoulder": "inventoryslot_shoulder",
    "Back": "inventoryslot_chest", "Chest": "inventoryslot_chest", "Shirt": "inventoryslot_shirt",
    "Tabard": "inventoryslot_tabard", "Wrist": "inventoryslot_wrists", "Hands": "inventoryslot_hands",
    "Waist": "inventoryslot_waist", "Legs": "inventoryslot_legs", "Feet": "inventoryslot_feet",
    "Ring": "inventoryslot_finger", "Ring_1": "inventoryslot_finger", "Ring_2": "inventoryslot_finger",
    "Trinket": "inventoryslot_trinket", "Trinket_1": "inventoryslot_trinket", "Trinket_2": "inventoryslot_trinket",
    "MainHand": "inventoryslot_mainhand", "OffHand": "inventoryslot_offhand", "Ranged": "inventoryslot_ranged",
    "Relic": "inventoryslot_relic",
};

const getRarityColor = (item?: Item) => {
    if (!item) return '#333';
    if(typeof item.rarity === 'string') {
         const r = item.rarity.toLowerCase();
         if (r === 'legendary') return '#ff8000';
         if (r === 'epic') return '#a335ee';
         if (r === 'rare') return '#0070dd';
         if (r === 'uncommon') return '#1eff00';
         if (r === 'common') return '#ffffff';
         if (r === 'poor') return '#9d9d9d';
    }
    return RARITY_COLORS[item.quality || 1] || '#ffffff';
};

const SlotComponent: React.FC<SlotProps> = ({ id, label, item, onUnequip, onDropEquip, onMouseEnter, onMouseLeave, onClick, onContextMenu, onQuickSearch }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item && onUnequip) {
            onUnequip(id);
        } else if (onClick) {
            onClick(e);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (item && onContextMenu) onContextMenu();
    };

    const handleQuickSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onQuickSearch) onQuickSearch(id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const data = e.dataTransfer.getData("application/json");
            if (!data) return;
            const droppedItem = JSON.parse(data);
            if (onDropEquip) onDropEquip(droppedItem, id);
        } catch (err) {
            console.error("Drop failed", err);
        }
    };

    const rarityColor = getRarityColor(item);
    const emptyIcon = EMPTY_SLOT_ICONS[id] || EMPTY_SLOT_ICONS[id.replace(/_\d/, '')] || "inventoryslot_chest";

    // Optimization: Pre-calculate style to avoid layout thrashing
    const containerStyle = item ? {
        borderColor: rarityColor,
        boxShadow: `0 0 8px ${rarityColor}40`
    } : undefined;

    const tooltipText = item
        ? `Left-Click: Unequip\nRight-Click: Enchant\nDrag to Replace`
        : `${label} Slot (Drag item here)`;

    return (
        <div
            id={`slot-${id}`}
            title={!item ? tooltipText : undefined}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseEnter={(e) => item && onMouseEnter && onMouseEnter(item, e)}
            onMouseLeave={onMouseLeave}
            style={containerStyle}
            // 2. CSS Optimization: Replaced 'transition-all' with specific properties.
            className={`
                relative w-[54px] h-[54px] lg:w-[60px] lg:h-[60px] rounded-[6px]
                flex items-center justify-center cursor-pointer
                transition-colors duration-200
                group border bg-[#050505] overflow-hidden
                ${!item ? 'border-[#333] hover:border-[#666] hover:bg-[#111]' : 'border-opacity-100'}
                ${isDragOver ? '!border-[#FFD700] !bg-[#FFD700]/10 !scale-110 z-20 shadow-[0_0_20px_rgba(255,215,0,0.6)]' : ''}
            `}
        >
            {!item ? (
                <>
                    <img src={`https://wow.zamimg.com/images/wow/icons/medium/${emptyIcon}.jpg`} alt="Empty" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity grayscale" />
                    <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] pointer-events-none" />
                    <div className="absolute bottom-1 w-full text-center z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] text-[#888] font-cinzel font-bold tracking-widest uppercase bg-black/50 px-1 rounded">
                            {label.replace(/_/g, ' ').substring(0, 4)}
                        </span>
                    </div>
                </>
            ) : (
                <>
                    <img src={getRenderableIcon(item)} className="w-full h-full object-cover rounded-[5px]" alt={item.name} />
                    <div className="absolute inset-0 rounded-[5px] ring-1 ring-inset ring-white/10 pointer-events-none" />
                    {item.enchant && (
                        <div className="absolute top-0 right-0 pointer-events-none">
                            <div className="w-0 h-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-[#4ade80] rounded-bl-[2px] opacity-90 drop-shadow-md"></div>
                        </div>
                    )}
                    {/* Hover Overlay: Reduced blur cost */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-red-500 font-bold text-xl drop-shadow-md transform scale-75 group-hover:scale-100 transition-transform">✕</span>
                    </div>
                </>
            )}

            {/* Quick Search Button (Hover only) */}
            <button
                onClick={handleQuickSearch}
                className="absolute top-0.5 right-0.5 z-20 p-1 bg-black/80 rounded hover:bg-cyan-900 text-[#666] hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100 border border-white/10 hover:border-cyan-500"
                title="Find Upgrades for this slot"
            >
                <Search size={10} />
            </button>
        </div>
    );
};

// 3. Strict Memoization — check data + callback identity
const arePropsEqual = (prev: SlotProps, next: SlotProps) => {
    return (
        prev.id === next.id &&
        prev.item === next.item &&
        prev.label === next.label &&
        prev.onUnequip === next.onUnequip &&
        prev.onDropEquip === next.onDropEquip &&
        prev.onClick === next.onClick &&
        prev.onQuickSearch === next.onQuickSearch
    );
};

export default memo(SlotComponent, arePropsEqual);
