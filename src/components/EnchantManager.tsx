
import React, { useMemo } from 'react';
import { Enchant, Item, RealmType } from '../types';
import { ENCHANT_DATABASE } from '../constants';
import { getIconUrl } from '../services/gearService';

interface EnchantManagerProps {
    slotId: string;
    equippedItem: Item; // The item being enchanted
    onApplyEnchant: (enchant: Enchant) => void;
    onRemoveEnchant: () => void;
    onClose: () => void;
    currentRealm: RealmType; // NEW PROP
}

export const EnchantManager: React.FC<EnchantManagerProps> = ({ slotId, equippedItem, onApplyEnchant, onRemoveEnchant, onClose, currentRealm }) => {
    
    // Filter enchants relevant to this slot
    const availableEnchants = useMemo(() => {
        // Map slot IDs to generic slots (e.g. Ring_1 -> Ring) if needed, 
        // but ENCHANT_DATABASE uses standard names. 
        // Need to handle One-Hand vs MainHand logic.
        
        return ENCHANT_DATABASE.filter(e => {
            // 1. Realm Filter
            // If enchant has a realm property, it MUST match the current realm.
            // If enchant.realm is undefined, it's shared/Classic compatible.
            if (e.realm && e.realm !== currentRealm) return false;

            // 2. Slot Filter
            // Check direct match
            if (e.slots.includes(equippedItem.slot)) return true;
            
            // Handle Weapon overlaps (normalize "Main Hand" -> "MainHand" etc.)
            const weaponSlots = ["MainHand", "Main Hand", "One-Hand", "Two-Hand", "Staff", "Dagger", "Sword", "Mace", "Axe", "Polearm"];
            if (weaponSlots.includes(equippedItem.slot)) {
                if (e.slots.some(s => weaponSlots.includes(s))) return true;
            }

            // Handle OffHand/Shield (normalize "Off Hand" -> "OffHand")
            const offhandSlots = ["OffHand", "Off Hand", "Shield", "Held In Off-hand"];
            if (offhandSlots.includes(equippedItem.slot)) {
                if (e.slots.some(s => offhandSlots.includes(s))) return true;
            }

            return false;
        });
    }, [equippedItem.slot, currentRealm]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-md rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#222] flex flex-col bg-[#151515]">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[#4ade80] font-cinzel text-lg tracking-[0.15em] font-bold drop-shadow-md">ENCHANT ITEM</h2>
                        <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 opacity-80">
                         <img src={getIconUrl(equippedItem.icon)} className="w-5 h-5 rounded border border-[#333]" alt="" />
                         <span className="text-xs font-bold text-[#eee]">{equippedItem.name}</span>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 bg-[#0a0a0c]">
                    <div className="flex flex-col gap-1">
                        {/* Remove Option */}
                        {equippedItem.enchant && (
                             <button 
                                onClick={() => { onRemoveEnchant(); onClose(); }}
                                className="flex items-center gap-3 p-3 rounded border border-red-900/30 bg-red-900/10 hover:bg-red-900/20 hover:border-red-500/50 transition-all text-left mb-2 group"
                            >
                                <div className="w-8 h-8 flex items-center justify-center text-red-500 font-bold border border-red-500/30 rounded bg-black/20">✕</div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-red-400 group-hover:text-red-300">REMOVE ENCHANT</span>
                                </div>
                            </button>
                        )}

                        {availableEnchants.length > 0 ? availableEnchants.map(ench => {
                            const isActive = equippedItem.enchant?.id === ench.id;
                            const isTurtleExclusive = ench.realm === 'Turtle';
                            
                            return (
                                <button
                                    key={ench.id}
                                    onClick={() => { onApplyEnchant(ench); onClose(); }}
                                    className={`flex items-center gap-3 p-2 rounded border transition-all duration-200 text-left group
                                        ${isActive 
                                            ? 'bg-[#4ade80]/10 border-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.2)]' 
                                            : 'bg-[#111] border-[#333] hover:border-[#666] hover:bg-[#161616]'
                                        }
                                    `}
                                >
                                    <div className={`relative w-8 h-8 rounded border shrink-0 overflow-hidden ${isActive ? 'border-[#4ade80]' : 'border-[#333]'}`}>
                                        <img src={getIconUrl(ench.icon)} className="w-full h-full object-cover" alt={ench.name} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold truncate ${isActive ? 'text-[#4ade80]' : 'text-[#e2e8f0] group-hover:text-white'}`}>
                                                {ench.name}
                                            </span>
                                            {isTurtleExclusive && <span className="text-[8px] bg-emerald-900/50 text-emerald-400 px-1 rounded border border-emerald-800">TURTLE</span>}
                                        </div>
                                        <span className="text-[10px] text-[#888] group-hover:text-[#aaa] truncate">
                                            {ench.text}
                                        </span>
                                    </div>
                                </button>
                            );
                        }) : (
                            <div className="text-center py-8 text-[#444] text-xs italic">
                                No known enchants for this slot.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
