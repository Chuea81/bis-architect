
import React, { useState, useEffect } from 'react';
import { Item, ItemStats, ClassName, SpecName } from '../types';
import { ItemCard } from './ItemCard';
import { showToast } from './Toast';

interface CreateItemModalProps {
    onClose: () => void;
    onCreate: (item: Item) => void;
    currentClass: ClassName;
    currentSpec: SpecName;
    editingItem?: Item | null; 
}

const SLOTS = [
    "Head", "Neck", "Shoulder", "Back", "Chest", "Wrist", "Hands", "Waist", 
    "Legs", "Feet", "Ring", "Trinket", "Main Hand", "Off Hand", "Two-Hand", 
    "Ranged", "Relic", "Wand", "One-Hand", "Shield"
];

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

// Basic stats list for the editor — using short canonical keys
const STAT_OPTIONS = [
    { label: "Stamina", value: "stam" },
    { label: "Intellect", value: "int" },
    { label: "Spirit", value: "spirit" },
    { label: "Strength", value: "str" },
    { label: "Agility", value: "agi" },
    { label: "Spell Power", value: "sp" },
    { label: "Hit %", value: "hit" },
    { label: "Crit %", value: "crit" },
    { label: "Attack Power", value: "ap" },
    { label: "Defense", value: "defense" },
    { label: "Shadow Spell Dmg", value: "spShadow" },
    { label: "Fire Spell Dmg", value: "spFire" },
    { label: "Healing Power", value: "healing" },
    { label: "Mana / 5s", value: "mp5" },
];

export const CreateItemModal: React.FC<CreateItemModalProps> = ({ onClose, onCreate, currentClass, currentSpec, editingItem }) => {
    // Form State
    const [name, setName] = useState(editingItem?.name || "");
    const [slot, setSlot] = useState(editingItem?.slot || "Chest");
    const [rarity, setRarity] = useState(editingItem?.rarity || "Rare");
    const [source, setSource] = useState(editingItem?.source || "Custom");
    const [icon, setIcon] = useState(editingItem?.icon && !editingItem.icon.includes('questionmark') ? editingItem.icon : "inv_chest_plate04");
    
    // Convert stats object to array for the form
    const initialStats = editingItem?.stats 
        ? Object.entries(editingItem.stats).map(([k, v]) => ({ stat: k, value: Number(v) }))
        : [{ stat: 'sp', value: 0 }];

    const [statsList, setStatsList] = useState<{ stat: string, value: number }[]>(initialStats);
    const [effectText, setEffectText] = useState(editingItem?.effects?.[0] || "");

    const handleAddStat = () => {
        setStatsList([...statsList, { stat: 'stam', value: 0 }]);
    };

    const handleRemoveStat = (index: number) => {
        setStatsList(statsList.filter((_, i) => i !== index));
    };

    const handleStatChange = (index: number, field: 'stat' | 'value', val: string | number) => {
        const newList = [...statsList];
        if (field === 'value') {
            newList[index].value = typeof val === 'string' ? parseFloat(val) || 0 : val;
        } else {
            newList[index].stat = String(val);
        }
        setStatsList(newList);
    };

    // Construct the Item object
    const getPreviewItem = (): Item => {
        const statsObj: ItemStats = {};
        statsList.forEach(s => {
            if (s.value !== 0) statsObj[s.stat] = parseFloat(s.value.toString());
        });

        // Map Rarity String to Number for 'quality' field compliance
        const qMap: Record<string, number> = { 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Epic': 4, 'Legendary': 5 };
        const qualityNum = qMap[rarity] || 1;

        return {
            id: editingItem?.id || Math.floor(Math.random() * 1000000),
            name: name || "New Item",
            slot,
            quality: qualityNum, // Required by ItemCore
            rarity, // Kept for legacy
            source,
            icon,
            dps: 0,
            stats: statsObj,
            resistances: {},
            effects: effectText ? [effectText] : [],
            classes: [currentClass], 
            realm: editingItem?.realm || 'Classic' 
        };
    };

    const handleCreate = () => {
        if (!name.trim()) { showToast("Name required", 'error'); return; }
        onCreate(getPreviewItem());
    };

    const previewItem = getPreviewItem();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-orange-500 w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-[#222] bg-[#151515] flex justify-between items-center">
                    <h2 className="text-orange-500 font-bold text-xl tracking-widest">ITEM EDITOR</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* Form */}
                    <div className="w-full lg:w-1/2 p-6 overflow-y-auto bg-[#111] border-r border-[#222] space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Basics</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-[#333] p-2 text-sm text-white rounded focus:border-orange-500 outline-none" placeholder="Item Name" />
                            <div className="flex gap-2">
                                <select value={slot} onChange={e => setSlot(e.target.value)} className="flex-1 bg-black border border-[#333] p-2 text-xs text-white rounded">
                                    {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select value={rarity} onChange={e => setRarity(e.target.value)} className="flex-1 bg-black border border-[#333] p-2 text-xs text-white rounded">
                                    {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-black border border-[#333] p-2 text-xs text-white rounded" placeholder="Icon Name (e.g. inv_sword_04)" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase">Stats</label>
                                <button onClick={handleAddStat} className="text-[10px] text-orange-500 hover:underline">+ Add Stat</button>
                            </div>
                            {statsList.map((entry, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <select value={entry.stat} onChange={e => handleStatChange(idx, 'stat', e.target.value)} className="flex-1 bg-black border border-[#333] p-1 text-xs text-white rounded">
                                        {STAT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                    <input type="number" value={entry.value} onChange={e => handleStatChange(idx, 'value', e.target.value)} className="w-20 bg-black border border-[#333] p-1 text-xs text-white rounded text-right" />
                                    <button onClick={() => handleRemoveStat(idx)} className="text-red-500 font-bold px-2">×</button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Equip Effect (Green Text)</label>
                            <textarea value={effectText} onChange={e => setEffectText(e.target.value)} className="w-full bg-black border border-[#333] p-2 text-xs text-green-400 rounded h-16 resize-none" placeholder="Equip: Increases..." />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="w-full lg:w-1/2 p-8 bg-[#0a0a0c] flex flex-col items-center justify-center relative">
                        <div className="mb-4 text-orange-500 text-xs font-bold tracking-widest">LIVE PREVIEW</div>
                        <div className="scale-110">
                            <ItemCard item={previewItem} gameMode="Classic" />
                        </div>
                        <button onClick={handleCreate} className="mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-lg transition-transform active:scale-95">
                            {editingItem ? 'SAVE CHANGES' : 'CREATE ITEM'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
