
import React, { useMemo } from 'react';
import { Item, SpecName, Build, StatWeights } from '../types';
import { getIconUrl, getRarityColor, calculateItemScore } from '../services/gearService';
import { SET_DATABASE } from '../constants';

interface ItemCardProps {
    item: Item;
    equipped: Build;
    spec: SpecName;
    isBis?: boolean;
    onEquip: (item: Item) => void;
    onCompare?: (item: Item) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    customWeights?: StatWeights; // Optional prop for custom scoring
}

const getStatStyle = (key: string): { color: string, label: string } => {
    const k = key.toLowerCase();
    
    // Spell Power / Damage
    if(k === 'sp' || k.includes('damage') || k.includes('healing')) return { color: 'text-purple-700 dark:text-[#d8b4fe]', label: 'SP' }; 
    
    // Hit/Crit
    if(k === 'hit') return { color: 'text-amber-700 dark:text-[#fde047]', label: 'HIT' };
    if(k === 'crit') return { color: 'text-red-700 dark:text-[#fca5a5]', label: 'CRIT' }; 
    
    // Stats
    if(k === 'int' || k === 'intellect') return { color: 'text-blue-700 dark:text-[#93c5fd]', label: 'INT' }; 
    if(k === 'sta' || k === 'stam' || k === 'stamina') return { color: 'text-emerald-700 dark:text-[#86efac]', label: 'STAM' }; 
    if(k === 'spi' || k === 'spirit') return { color: 'text-stone-500 dark:text-[#cbd5e1]', label: 'SPI' }; 
    
    // Resistances
    if(k.includes('res')) {
        let type = k.replace('res','').replace('resist','').replace('Res','');
        if (type.toLowerCase() === 'fire') return { color: 'text-red-700 dark:text-[#fda4af]', label: 'FIRE R' };
        if (type.toLowerCase() === 'shadow') return { color: 'text-purple-700 dark:text-[#c084fc]', label: 'SHAD R' };
        if (type.toLowerCase() === 'frost') return { color: 'text-blue-700 dark:text-[#7dd3fc]', label: 'FRST R' };
        if (type.toLowerCase() === 'nature') return { color: 'text-emerald-700 dark:text-[#bef264]', label: 'NAT R' };
        return { color: 'text-stone-500 dark:text-white', label: 'RES' };
    }
    
    return { color: 'text-stone-500 dark:text-gray-400', label: key.toUpperCase().substring(0,4) };
};

const BisBadge = () => (
    <div className="flex items-center gap-1 text-[#ff8000] text-[9px] font-extrabold border border-[#ff8000]/50 bg-[#ff8000]/10 px-1.5 py-px rounded-sm shrink-0 shadow-[0_0_5px_rgba(255,128,0,0.2)] select-none ml-2" title="Best in Slot for selected filter">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
        <span className="tracking-wide">BiS</span>
    </div>
);

const ItemCard: React.FC<ItemCardProps> = ({ item, equipped, spec, isBis, onEquip, onCompare, onMouseEnter, onMouseLeave, onMouseMove, customWeights }) => {
    const isEquipped = useMemo(() => Object.values(equipped).some((e) => (e as Item | undefined)?.name === item.name), [equipped, item.name]);
    
    const dbUrl = item.id ? `https://www.wowhead.com/classic/item=${item.id}` : `https://www.wowhead.com/classic/item=${encodeURIComponent(item.name)}`;

    const stopProp = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleCompareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onCompare) onCompare(item);
    };

    const handleDragStart = (e: React.DragEvent) => {
        // Serialize item data for drop
        e.dataTransfer.setData("application/json", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";
    };

    const stats = item.stats || {};
    const allStats: { key: string; val: number }[] = [];

    // Combine all stats into one array for cleaner rendering
    Object.entries(stats).forEach(([key, val]) => {
        if (typeof val === 'number' && val > 0) {
            allStats.push({ key, val });
        }
    });

    const score = calculateItemScore(item, spec, customWeights);
    const itemSet = item.setName ? SET_DATABASE[item.setName] : null;

    // Calculate Set Progress
    const { equippedSetCount } = useMemo(() => {
        if (!itemSet) return { equippedSetCount: 0 };
        const count = (Object.values(equipped) as (Item | undefined)[]).filter(equippedItem => 
            equippedItem && equippedItem.setName === itemSet.name
        ).length;
        return { equippedSetCount: count };
    }, [equipped, itemSet]);

    return (
        <div 
            draggable
            onDragStart={handleDragStart}
            onClick={() => onEquip(item)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            className={`flex flex-col bg-white dark:bg-[#222226] border mb-2 px-3 py-3 gap-2 rounded-md cursor-grab active:cursor-grabbing transition-colors duration-150 group hover:border-stone-400 dark:hover:border-[#666] hover:bg-stone-50 dark:hover:bg-[#27272a] ${isEquipped ? 'border-[#c7b377] bg-amber-50 dark:bg-[#2a2a20] shadow-[inset_0_0_0_1px_rgba(199,179,119,0.2)]' : 'border-stone-200 dark:border-[#333]'}`}
        >
            <div className="flex gap-3 items-center">
                <div className="relative shrink-0">
                     <img src={getIconUrl(item.icon)} className="w-[40px] h-[40px] border border-stone-300 dark:border-[#111] rounded shadow-sm pointer-events-none" alt={item.name} />
                </div>
                
                <div className="flex-grow flex flex-col justify-center min-w-0">
                    <div className="text-[13px] font-bold flex items-center justify-between gap-2 leading-tight">
                        <div className="flex items-center min-w-0">
                            <span className="truncate tracking-tight" style={{ color: getRarityColor(item) }}>{item.name}</span>
                            {isBis && <BisBadge />}
                        </div>
                        <span className="text-amber-800 dark:text-[#c7b377] text-[11px] font-bold bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/20 whitespace-nowrap font-mono shrink-0 ml-2">
                            {score}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1.5">
                         <span className="text-amber-700 dark:text-[#FFD700] font-cinzel font-bold text-[10px] tracking-wide truncate pr-2 drop-shadow-[0_0_3px_rgba(255,215,0,0.1)] dark:drop-shadow-[0_0_3px_rgba(255,215,0,0.3)] opacity-90">{item.source}</span>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {!isEquipped && onCompare && (
                                <button
                                    onClick={handleCompareClick}
                                    className="text-stone-500 dark:text-[#9ca3af] text-[9px] font-bold px-1.5 py-px rounded border border-stone-300 dark:border-[#4b5563] hover:text-[#c7b377] hover:border-[#c7b377] hover:bg-white dark:hover:bg-[#333]"
                                >
                                    COMPARE
                                </button>
                            )}
                            <a 
                                href={dbUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-stone-500 dark:text-[#9ca3af] text-[9px] font-bold px-1.5 py-px rounded border border-stone-300 dark:border-[#4b5563] hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#333]"
                                onClick={stopProp}
                            >
                                DB
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            {allStats.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100 dark:border-[#333] mt-1">
                    {allStats.map(({key, val}) => {
                        const style = getStatStyle(key);
                        return (
                            <div key={key} className={`text-[10px] px-2 py-0.5 rounded flex gap-1 items-center bg-stone-50 dark:bg-[#18181b] border border-stone-200 dark:border-[#333] shadow-sm`}>
                                <span className={`font-bold ${style.color} opacity-90`}>{style.label}</span>
                                <span className="text-stone-800 dark:text-[#e2e8f0] font-mono font-bold">+{val}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Set Bonus Display */}
            {itemSet && (
                <div className="mt-2 pt-2 border-t border-stone-100 dark:border-[#333] text-[10px]">
                    <div className="text-amber-800 dark:text-[#FFD700] font-bold mb-1">{itemSet.name} ({equippedSetCount}/{itemSet.items.length})</div>
                    <div className="flex flex-col gap-0.5">
                        {itemSet.bonuses.map((bonus, idx) => {
                            const isActive = equippedSetCount >= bonus.threshold;
                            return (
                                <div key={idx} className={`${isActive ? 'text-emerald-700 dark:text-[#1eff00]' : 'text-stone-400 dark:text-[#7a997a]'}`}>
                                    ({bonus.threshold}) Set: {bonus.text}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemCard;
