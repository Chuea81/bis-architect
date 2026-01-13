
import React, { useState } from 'react';
import { Item } from '../types';
import { getIconUrl, getRarityColor, normalizeSlot } from '../services/gearService';

interface SlotProps {
    id: string;
    label: string;
    item?: Item;
    onUnequip?: (slotId: string) => void;
    onDropEquip?: (item: Item, slotId: string) => void;
    onMouseEnter?: (item: Item, e: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onClick?: (e: React.MouseEvent) => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

const Slot: React.FC<SlotProps> = ({ id, label, item, onUnequip, onDropEquip, onMouseEnter, onMouseLeave, onClick, onContextMenu }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleClick = (e: React.MouseEvent) => {
        // Bubble up generic clicks (optional)
        if (onClick) onClick(e);

        // Standard Left-Click Unequip logic
        e.stopPropagation();
        if (item && onUnequip) {
            onUnequip(id);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent browser context menu
        e.stopPropagation();
        if (item && onContextMenu) {
            onContextMenu(e);
        }
    };

    const handleEnter = (e: React.MouseEvent) => {
        if (item && onMouseEnter) {
            onMouseEnter(item, e);
        }
    };

    // --- Drag & Drop Handlers ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "copy";
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const data = e.dataTransfer.getData("application/json");
            if (!data) return;
            const droppedItem = JSON.parse(data) as Item;
            
            // Validate Slot Compatibility
            const targetSlotNorm = normalizeSlot(id);
            const itemSlotNorm = normalizeSlot(droppedItem.slot);

            // Special Case: One-Hand can go into OffHand (unless it's a shield-only slot, but "OffHand" is generic)
            // But normalizeSlot("One-Hand") -> "MainHand". normalizeSlot("OffHand") -> "OffHand".
            // So we need specific logic here.
            
            let isValid = false;
            
            if (targetSlotNorm === itemSlotNorm) {
                isValid = true;
            } else if (targetSlotNorm === "OffHand" && itemSlotNorm === "MainHand") {
                // Allow One-Handers in Off-Hand, but exclude Two-Handers
                if (droppedItem.slot !== "Two-Hand" && droppedItem.slot !== "Staff" && droppedItem.slot !== "Polearm") {
                    isValid = true;
                }
            }

            if (isValid && onDropEquip) {
                onDropEquip(droppedItem, id);
            }
        } catch (err) {
            console.error("Drop failed", err);
        }
    };

    const rarityColor = item ? getRarityColor(item) : '#333';
    
    // Dynamic styles for the glow effect
    const glowStyle = item ? {
        boxShadow: `0 0 10px ${rarityColor}40, inset 0 0 10px ${rarityColor}20`,
        borderColor: rarityColor
    } : {};
    
    const tooltipText = item ? `Left-Click: Unequip\nRight-Click: Enchant\nDrag to Replace` : `${label} Slot (Drag item here)`;

    return (
        <div 
            id={`slot-${id}`} 
            title={tooltipText}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative w-[48px] h-[48px] rounded flex items-center justify-center cursor-pointer transition-all duration-300 
                group border-2
                ${isDragOver ? '!border-[#FFD700] !bg-[#FFD700]/10 !scale-110 z-20 shadow-[0_0_20px_rgba(255,215,0,0.5)]' : ''}
                ${!item 
                    ? 'bg-stone-300 dark:bg-[#151515] border-stone-400 dark:border-[#2a2a2a] hover:border-stone-500 dark:hover:border-[#555] hover:bg-stone-400 dark:hover:bg-[#1a1a1a] shadow-[inset_0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]' 
                    : 'bg-[#151515] border-[#2a2a2a] hover:border-[#555]'
                }
            `}
            style={item ? glowStyle : undefined}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseEnter={handleEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Empty State Label */}
            {!item && (
                <span className="text-[9px] text-stone-600 dark:text-[#444] font-cinzel font-bold tracking-widest text-center opacity-60 group-hover:opacity-100 group-hover:text-stone-800 dark:group-hover:text-[#666] transition-all select-none pointer-events-none">
                    {label}
                </span>
            )}

            {/* Equipped Item */}
            {item && (
                <>
                    <img 
                        src={getIconUrl(item.icon)} 
                        className="w-full h-full object-cover rounded-[1px] pointer-events-none" 
                        alt={item.name}
                    />
                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10 pointer-events-none rounded-[1px]"></div>
                    
                    {/* Enchant Indicator */}
                    {item.enchant && (
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#4ade80] border border-black shadow-[0_0_5px_rgba(74,222,128,0.8)] rounded-bl-sm rounded-tr-sm z-10 pointer-events-none"></div>
                    )}

                    {/* Hover Overlay (Red X for unequip implication) */}
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-900/40 transition-colors flex items-center justify-center pointer-events-none">
                         <span className="text-white text-opacity-0 group-hover:text-opacity-100 font-bold text-lg drop-shadow-md transform scale-50 group-hover:scale-100 transition-all duration-200">×</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default Slot;
