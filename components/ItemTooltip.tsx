
import React from 'react';
import { Item, SpecName, Build } from '../types';
import { getRarityColor, calculateItemScore } from '../services/gearService';
import { SET_DATABASE } from '../constants';

interface ItemTooltipProps {
    item: Item;
    spec: SpecName;
    position: { x: number, y: number };
    equipped?: Build;
}

const getStatColor = (key: string): string => {
    const k = key.toLowerCase();
    // Using lighter Tailwind 200/300 shades for better contrast on dark bg
    if(k === 'sp' || k.includes('damage') || k.includes('healing') || k.includes('spellpower')) return '#e9d5ff'; // Purple-200
    if(k === 'hit') return '#fde047'; // Yellow-300
    if(k === 'crit') return '#fca5a5'; // Red-300
    if(k === 'int' || k === 'intellect') return '#93c5fd'; // Blue-300
    if(k === 'sta' || k === 'stam' || k === 'stamina') return '#86efac'; // Green-300
    if(k === 'spi' || k === 'spirit') return '#e2e8f0'; // Slate-200
    if(k.includes('res')) return '#f1f5f9'; // Slate-100
    return '#ffffff'; // Default White
};

const formatStat = (key: string, val: number): string | null => {
    if (val === 0) return null;
    const k = key.toLowerCase();
    
    // Primary
    if (k === 'sta' || k === 'stamina') return `+${val} Stamina`;
    if (k === 'int' || k === 'intellect') return `+${val} Intellect`;
    if (k === 'spi' || k === 'spirit') return `+${val} Spirit`;
    if (k === 'str' || k === 'strength') return `+${val} Strength`;
    if (k === 'agi' || k === 'agility') return `+${val} Agility`;
    
    // Resists
    if (k.includes('res')) {
        let type = k.replace('res', '').replace('resist', '');
        if (k.endsWith('res')) type = k.replace('res', '');
        type = type.charAt(0).toUpperCase() + type.slice(1);
        return `+${val} ${type} Resistance`;
    }

    // Equip
    if (k === 'sp' || k === 'spellpower') return `Equip: Increases damage and healing done by magical spells and effects by up to ${val}.`;
    if (k === 'hit') return `Equip: Improves your chance to hit with spells by ${val}%.`;
    if (k === 'crit') return `Equip: Improves your chance to get a critical strike with spells by ${val}%.`;
    if (k === 'shadowsp' || k === 'shadowdamage') return `Equip: Increases damage done by Shadow spells and effects by up to ${val}.`;
    if (k === 'firesp' || k === 'firedamage') return `Equip: Increases damage done by Fire spells and effects by up to ${val}.`;
    if (k === 'frostdamage' || k === 'frostsp') return `Equip: Increases damage done by Frost spells and effects by up to ${val}.`;
    if (k === 'arcanedamage' || k === 'arcanesp') return `Equip: Increases damage done by Arcane spells and effects by up to ${val}.`;
    if (k === 'naturedamage' || k === 'naturesp') return `Equip: Increases damage done by Nature spells and effects by up to ${val}.`;
    if (k === 'holydamage' || k === 'holysp') return `Equip: Increases damage done by Holy spells and effects by up to ${val}.`;
    if (k === 'mp5') return `Equip: Restores ${val} mana per 5 sec.`;

    return `+${val} ${key.toUpperCase()}`; // Fallback
};

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, spec, position, equipped }) => {
    const { innerWidth, innerHeight } = window;
    
    const width = 320;
    const height = 300; // approx estimate for boundary check

    let left = position.x + 20;
    let top = position.y + 20;

    // Boundary check
    if (left + width > innerWidth) {
        left = position.x - width - 10;
    }
    if (top + height > innerHeight) {
        top = innerHeight - height - 10;
    }

    const score = calculateItemScore(item, spec);
    const rarityColor = getRarityColor(item);

    // Group stats
    const stats = item.stats || {};
    const primary: { text: string, color: string }[] = [];
    const secondary: { text: string, color: string }[] = [];
    
    Object.entries(stats).forEach(([k, v]) => {
        const text = formatStat(k, v as number);
        if (!text) return;
        
        const statColor = getStatColor(k);

        if (text.startsWith('Equip:')) {
            // Use Green-400 (#4ade80) instead of classic neon green (#1eff00) for better readability/contrast
            secondary.push({ text, color: '#4ade80' }); 
        } else {
            primary.push({ text, color: statColor });
        }
    });

    // SET LOGIC
    const itemSet = item.setName ? SET_DATABASE[item.setName] : null;
    let equippedSetCount = 0;
    
    if (itemSet && equipped) {
        equippedSetCount = (Object.values(equipped) as (Item | undefined)[]).filter(e => 
            e && e.setName === itemSet.name
        ).length;
    }

    return (
        <div 
            className="fixed z-[100] w-[320px] pointer-events-none"
            style={{ left, top }}
        >
            {/* Main Frame with Gold Border and Rarity Glow */}
            <div 
                className="relative bg-[#09090b]/98 rounded-md border-2 overflow-hidden backdrop-blur-xl flex flex-col gap-1 shadow-2xl"
                style={{ 
                    borderColor: '#b3a06d', // Classic Gold Border
                    boxShadow: `0 0 0 1px #000, 0 10px 40px rgba(0,0,0,0.95), 0 0 20px ${rarityColor}20` // Subtle inner/outer shadows + Rarity Glow
                }}
            >
                <div className="p-3.5 flex flex-col gap-1">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                        <div className="font-bold text-lg mb-0.5 tracking-wide drop-shadow-md leading-tight" style={{ color: rarityColor }}>
                            {item.name}
                        </div>
                        {item.bis && (
                            <div className="flex items-center gap-1 text-[#ff8000] text-[10px] font-bold border border-[#ff8000]/50 bg-[#ff8000]/10 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,128,0,0.1)] mt-1 shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                                <span>BiS</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Slot & Type */}
                    <div className="text-white text-xs font-normal opacity-90">{item.slot}</div>
                    
                    {/* Primary Stats */}
                    {primary.length > 0 && (
                        <div className="flex flex-col gap-0.5 mt-2 text-[13px] font-semibold tracking-wide">
                            {primary.map((s, idx) => (
                                <span key={idx} style={{ color: s.color, textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}>{s.text}</span>
                            ))}
                        </div>
                    )}

                    {/* Equip Bonuses */}
                    {secondary.length > 0 && (
                        <div className="flex flex-col gap-1 mt-3 text-[12px] leading-snug font-medium">
                            {secondary.map((s, idx) => (
                                <span key={idx} style={{ color: s.color, textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}>{s.text}</span>
                            ))}
                        </div>
                    )}

                    {/* Use / Proc Effects */}
                    {(item.use || item.proc) && (
                        <div className="flex flex-col gap-1 mt-3 text-[12px] leading-snug font-medium">
                            {item.use && (
                                <span style={{ color: '#4ade80', textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}>Use: {item.use}</span>
                            )}
                            {item.proc && (
                                <span style={{ color: '#4ade80', textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}>Chance on hit: {item.proc}</span>
                            )}
                        </div>
                    )}
                    
                    {/* Enchant Display */}
                    {item.enchant && (
                        <div className="mt-2 pt-2 border-t border-[#333]">
                            <div className="text-[#4ade80] text-xs font-bold tracking-wide">
                                Enchant: {item.enchant.text}
                            </div>
                            {item.enchant.proc && (
                                <div className="text-[#4ade80] text-[10px] mt-0.5">
                                    Chance on hit: {item.enchant.proc}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Set Bonuses - Distinct Section */}
                {itemSet && (
                    <div className="bg-[#121212]/80 border-t border-[#b3a06d]/30 p-3.5 pt-2">
                        <div className="text-[#FFD700] text-xs font-bold mb-2 tracking-wide flex justify-between">
                            <span>{itemSet.name}</span>
                            {/* Improved contrast for inactive count: Zinc-400 */}
                            <span className="text-[#a1a1aa]">({equippedSetCount}/{itemSet.items.length})</span>
                        </div>
                        
                        <ul className="list-none mb-3 pl-1 flex flex-col gap-0.5">
                            {itemSet.items.map((setNameItem, i) => {
                                 const isPieceEquipped = equipped && (Object.values(equipped) as (Item | undefined)[]).some(e => e?.name === setNameItem);
                                 return (
                                    <li key={i} className={`text-[11px] font-medium ${isPieceEquipped ? 'text-[#fcd34d]' : 'text-[#a1a1aa]'}`}>
                                        {setNameItem}
                                    </li>
                                 );
                            })}
                        </ul>

                        <div className="flex flex-col gap-1 pl-1">
                            {itemSet.bonuses.map((bonus, idx) => {
                                 const isActive = equippedSetCount >= bonus.threshold;
                                 return (
                                    // Inactive text improved from #555 to #888888 for better contrast
                                    <div key={idx} className={`text-[11px] leading-snug ${isActive ? 'text-[#4ade80]' : 'text-[#888888]'}`}>
                                        <span className={`font-bold mr-1 ${isActive ? 'text-[#4ade80]' : 'text-[#71717a]'}`}>({bonus.threshold}) Set:</span>
                                        {bonus.text}
                                    </div>
                                 );
                            })}
                        </div>
                    </div>
                )}
                
                {/* Footer Score */}
                <div className="bg-[#1a1a1a]/90 border-t border-[#333] p-2 px-3.5 flex justify-between items-center">
                     <span className="text-[#FFD700] font-cinzel font-bold text-[10px] tracking-wide opacity-90">{item.source}</span>
                     <div className="flex items-center gap-2">
                        <span className="text-[#71717a] text-[9px] font-bold uppercase tracking-widest">Score</span>
                        <span className="text-[#f1f5f9] font-mono font-bold text-lg leading-none">{score}</span>
                     </div>
                </div>
            </div>
        </div>
    );
};
