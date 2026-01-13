
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Item, ItemStats, ClassName, SpecName } from '../types';
import { getIconUrl } from '../services/gearService';
import ItemCard from './ItemCard';

interface CreateItemModalProps {
    onClose: () => void;
    onCreate: (item: Item) => void;
    currentClass: ClassName;
    currentSpec: SpecName;
}

const SLOTS = [
    "Head", "Neck", "Shoulder", "Back", "Chest", "Wrist", "Hands", "Waist", 
    "Legs", "Feet", "Ring", "Trinket", "Main Hand", "Off Hand", "Two-Hand", 
    "Ranged", "Relic", "Wand", "One-Hand", "Shield"
];

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

const STAT_OPTIONS = [
    { label: "Spell Power", value: "sp" },
    { label: "Hit %", value: "hit" },
    { label: "Crit %", value: "crit" },
    { label: "Haste %", value: "haste" },
    { label: "Intellect", value: "int" },
    { label: "Stamina", value: "sta" },
    { label: "Spirit", value: "spi" },
    { label: "Strength", value: "str" },
    { label: "Agility", value: "agi" },
    { label: "Attack Power", value: "ap" },
    { label: "Healing", value: "healing" },
    { label: "Shadow SP", value: "spShadow" },
    { label: "Fire SP", value: "spFire" },
    { label: "Frost SP", value: "spFrost" },
    { label: "Nature SP", value: "spNature" },
    { label: "Arcane SP", value: "spArcane" },
    { label: "Holy SP", value: "spHoly" },
    { label: "Fire Res", value: "resFire" },
    { label: "Nature Res", value: "resNature" },
    { label: "Frost Res", value: "resFrost" },
    { label: "Shadow Res", value: "resShadow" },
    { label: "Arcane Res", value: "resArcane" },
    { label: "Defense", value: "defense" },
    { label: "Armor", value: "armor" },
    { label: "MP5", value: "mp5" },
    { label: "Min Damage", value: "minDmg" },
    { label: "Max Damage", value: "maxDmg" },
    { label: "Speed", value: "speed" },
];

const DEFAULT_ICONS: Record<string, string> = {
    "Head": "inv_helmet_04", "Neck": "inv_jewelry_necklace_20", "Shoulder": "inv_shoulder_23", 
    "Back": "inv_misc_cape_18", "Chest": "inv_chest_plate04", "Wrist": "inv_bracer_07", 
    "Hands": "inv_gauntlets_17", "Waist": "inv_belt_12", "Legs": "inv_pants_plate_05", 
    "Feet": "inv_boots_chain_05", "Ring": "inv_jewelry_ring_22", "Trinket": "inv_jewelry_talisman_08", 
    "Main Hand": "inv_sword_39", "Off Hand": "inv_shield_05", "Ranged": "inv_weapon_bow_08", 
    "Relic": "inv_misc_idol_02", "One-Hand": "inv_sword_39", "Two-Hand": "inv_sword_39", "Shield": "inv_shield_05", "Wand": "inv_wand_06"
};

export const CreateItemModal: React.FC<CreateItemModalProps> = ({ onClose, onCreate, currentClass, currentSpec }) => {
    const [name, setName] = useState("");
    const [slot, setSlot] = useState("Chest");
    const [rarity, setRarity] = useState("Rare");
    const [source, setSource] = useState("The Blacksmith's Forge");
    const [icon, setIcon] = useState(DEFAULT_ICONS["Chest"]);
    const [statsList, setStatsList] = useState<{ stat: string, value: number }[]>([
        { stat: 'sp', value: 0 }, 
        { stat: 'sta', value: 0 }
    ]);
    const [procText, setProcText] = useState("");
    const [useText, setUseText] = useState("");

    // Auto-Fill State
    const [importInput, setImportInput] = useState("");
    const [isFetching, setIsFetching] = useState(false);

    // Update default icon when slot changes if user hasn't heavily customized it
    useEffect(() => {
        if (DEFAULT_ICONS[slot]) {
            setIcon(DEFAULT_ICONS[slot]);
        }
    }, [slot]);

    const handleAddStat = () => {
        setStatsList([...statsList, { stat: 'int', value: 0 }]);
    };

    const handleRemoveStat = (index: number) => {
        setStatsList(statsList.filter((_, i) => i !== index));
    };

    const handleStatChange = (index: number, field: 'stat' | 'value', val: string | number) => {
        const newList = [...statsList];
        // @ts-ignore
        newList[index][field] = val;
        setStatsList(newList);
    };

    const getPreviewItem = (): Item => {
        const statsObj: ItemStats = {};
        statsList.forEach(s => {
            if (s.value > 0) statsObj[s.stat] = parseFloat(s.value.toString());
        });

        return {
            id: Math.floor(Math.random() * 1000000) + 900000, // Random ID range to avoid collisions
            name: name || "Unnamed Artifact",
            slot,
            rarity,
            source,
            icon,
            stats: statsObj,
            classes: [currentClass], // Defaults to current class to ensure visibility
            proc: procText || undefined,
            use: useText || undefined
        };
    };

    const handleCreate = () => {
        if (!name.trim()) {
            alert("Item must have a name!");
            return;
        }
        onCreate(getPreviewItem());
    };

    const handleAutoFill = async () => {
        if (!importInput.trim()) return;
        setIsFetching(true);

        try {
            // @ts-ignore
            const apiKey = process.env.API_KEY || "";
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `Look up the World of Warcraft Classic (Vanilla, Patch 1.12) item "${importInput}". 
            If the input is a URL (e.g. wowhead.com/classic/item=...), extract the item name from it first.
            Return a JSON object with its details using this specific schema:
            { 
                name: string, 
                slot: string (Use one of: ${SLOTS.join(', ')}), 
                rarity: string (Use one of: ${RARITIES.join(', ')}), 
                source: string (Short format e.g. 'MC', 'BWL', 'Quest'), 
                icon: string (The wowhead icon name without extension, e.g. 'inv_sword_04'), 
                stats: { [statCode]: number },
                proc: string (Optional, text of equip effect),
                use: string (Optional, text of use effect)
            }. 
            
            Valid Stat Codes for keys: sp (spell power), hit (hit %), crit (crit %), haste (haste %), int, sta, spi, str, agi, ap, defense, armor, mp5, minDmg, maxDmg, speed, spShadow, spFire, spFrost, spNature, spArcane, spHoly, healing, resFire, resNature, resFrost, resShadow, resArcane.
            
            Example match: If item has "+16 Fire Resistance", stats: { resFire: 16 }. If "Equip: Increases damage by up to 20", stats: { sp: 20 }.`;

            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            if (result.text) {
                const data = JSON.parse(result.text);
                
                setName(data.name || importInput);
                if (SLOTS.includes(data.slot)) setSlot(data.slot);
                if (RARITIES.includes(data.rarity)) setRarity(data.rarity);
                setSource(data.source || "Imported");
                if (data.icon) setIcon(data.icon);
                setProcText(data.proc || "");
                setUseText(data.use || "");

                if (data.stats) {
                    const newStats = Object.entries(data.stats).map(([k, v]) => ({ stat: k, value: Number(v) }));
                    setStatsList(newStats);
                }
            }
        } catch (e) {
            console.error("Auto-fill failed", e);
            alert("The Archivist could not find that item. Try checking the spelling or URL.");
        } finally {
            setIsFetching(false);
        }
    };

    const previewItem = getPreviewItem();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#f97316] w-full max-w-4xl rounded-lg shadow-[0_0_50px_rgba(249,115,22,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-orange-500 font-cinzel text-2xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span>🔥</span>
                            <span>THE BLACKSMITH'S FORGE</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">CRAFT CUSTOM ARTIFACTS AND ADD THEM TO THE DATABASE</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    
                    {/* LEFT: FORM */}
                    <div className="w-full lg:w-1/2 p-6 overflow-y-auto bg-[#111] border-b lg:border-b-0 lg:border-r border-[#222]">
                        <div className="flex flex-col gap-5">
                            
                            {/* Auto Fill Section */}
                            <div className="bg-[#1a1a1d] border border-[#333] p-3 rounded mb-2">
                                <label className="text-[9px] font-bold text-orange-500/80 tracking-widest uppercase mb-1 block">Auto-Fill from Library</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={importInput}
                                        onChange={(e) => setImportInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAutoFill()}
                                        placeholder="Item Name or Wowhead URL..."
                                        className="flex-1 bg-[#0a0a0c] border border-[#333] rounded px-3 py-1.5 text-xs text-[#eee] focus:border-orange-500 outline-none placeholder:text-[#555]"
                                    />
                                    <button 
                                        onClick={handleAutoFill}
                                        disabled={isFetching || !importInput}
                                        className="bg-orange-900/30 border border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-black px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isFetching ? 'SEARCHING...' : 'FETCH'}
                                    </button>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-orange-500/80 tracking-widest uppercase">Item Details</label>
                                <input 
                                    type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Item Name (e.g. Blade of Eternal Shadow)"
                                    className="bg-[#0a0a0c] border border-[#333] rounded px-3 py-2 text-sm text-[#eee] focus:border-orange-500 outline-none"
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <select value={slot} onChange={e => setSlot(e.target.value)} className="w-full bg-[#0a0a0c] border border-[#333] rounded px-3 py-2 text-xs text-[#ccc] outline-none focus:border-orange-500">
                                            {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <select value={rarity} onChange={e => setRarity(e.target.value)} className="w-full bg-[#0a0a0c] border border-[#333] rounded px-3 py-2 text-xs text-[#ccc] outline-none focus:border-orange-500">
                                            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="Source (e.g. Molten Core)"
                                        className="flex-1 bg-[#0a0a0c] border border-[#333] rounded px-3 py-2 text-xs text-[#ccc] focus:border-orange-500 outline-none"
                                    />
                                    <input 
                                        type="text" value={icon} onChange={e => setIcon(e.target.value)} placeholder="Icon Name (e.g. inv_sword_04)"
                                        className="flex-1 bg-[#0a0a0c] border border-[#333] rounded px-3 py-2 text-xs text-[#ccc] focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-orange-500/80 tracking-widest uppercase">Stats</label>
                                    <button onClick={handleAddStat} className="text-[10px] bg-[#222] px-2 py-1 rounded text-orange-500 hover:bg-orange-500 hover:text-black transition-colors font-bold">+ ADD STAT</button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {statsList.map((statEntry, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <select 
                                                value={statEntry.stat} 
                                                onChange={e => handleStatChange(idx, 'stat', e.target.value)} 
                                                className="flex-1 bg-[#0a0a0c] border border-[#333] rounded px-2 py-1.5 text-xs text-[#ccc] outline-none focus:border-orange-500"
                                            >
                                                {STAT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                            <input 
                                                type="number" 
                                                value={statEntry.value} 
                                                onChange={e => handleStatChange(idx, 'value', parseFloat(e.target.value))} 
                                                className="w-20 bg-[#0a0a0c] border border-[#333] rounded px-2 py-1.5 text-xs text-right text-[#ccc] outline-none focus:border-orange-500"
                                            />
                                            <button onClick={() => handleRemoveStat(idx)} className="text-red-500 hover:text-red-400 font-bold px-2">×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Effects */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-orange-500/80 tracking-widest uppercase">Effects</label>
                                <input 
                                    type="text" value={procText} onChange={e => setProcText(e.target.value)} placeholder="Equip/Chance on Hit (Optional)"
                                    className="bg-[#0a0a0c] border border-[#333] rounded px-3 py-2 text-xs text-[#ccc] focus:border-orange-500 outline-none"
                                />
                                <input 
                                    type="text" value={useText} onChange={e => setUseText(e.target.value)} placeholder="Use Effect (Optional)"
                                    className="bg-[#0a0a0c] border border-[#333] rounded px-3 py-2 text-xs text-[#ccc] focus:border-orange-500 outline-none"
                                />
                            </div>

                        </div>
                    </div>

                    {/* RIGHT: PREVIEW */}
                    <div className="w-full lg:w-1/2 p-8 bg-[#0a0a0c] flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-transparent pointer-events-none"></div>
                        
                        <div className="mb-6 text-center">
                            <h3 className="text-orange-500 font-cinzel font-bold tracking-[0.3em] text-sm mb-2 opacity-80">PREVIEW</h3>
                            <div className="w-16 h-1 bg-orange-500/30 mx-auto rounded-full"></div>
                        </div>

                        <div className="w-full max-w-sm relative z-10 scale-110">
                            <ItemCard 
                                item={previewItem} 
                                equipped={{}} // Not relevant for preview
                                spec={currentSpec}
                                onEquip={() => {}} 
                                onCompare={() => {}}
                            />
                        </div>

                        <div className="mt-12 flex gap-4 w-full max-w-xs z-10">
                            <button 
                                onClick={handleCreate}
                                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-cinzel font-bold tracking-widest rounded shadow-[0_0_20px_rgba(234,88,12,0.4)] border border-orange-400 transition-all hover:scale-105 active:scale-95"
                            >
                                FORGE ITEM
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
