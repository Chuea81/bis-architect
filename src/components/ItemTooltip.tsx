
import React, { useMemo } from 'react';
import { Item, SpecName, Build, AggregatedStats, ClassName, StatWeights } from '../types';
import { calculateItemScore, calculateGearScore, getStatValue } from '../services/gearService';
import { SET_DATABASE } from '../constants';

interface ItemTooltipProps {
  item: Item;
  spec: SpecName;
  initialPosition: { x: number; y: number };
  equipped?: Build;
  currentStats?: AggregatedStats;
  currentClass?: ClassName;
  customWeights?: StatWeights; // ADDED PROP
}

const QUALITY_COLORS: Record<string, string> = {
    'poor': 'text-[#9d9d9d]', '0': 'text-[#9d9d9d]',
    'common': 'text-white', '1': 'text-white',
    'uncommon': 'text-[#1eff00]', '2': 'text-[#1eff00]',
    'rare': 'text-[#0070dd]', '3': 'text-[#0070dd]',
    'epic': 'text-[#a335ee]', '4': 'text-[#a335ee]',
    'legendary': 'text-[#ff8000]', '5': 'text-[#ff8000]'
};

const STAT_LABELS: Record<string, string> = {
    // Short canonical keys
    str: "Str", agi: "Agi", stam: "Sta", int: "Int", spirit: "Spi",
    sp: "SP", ap: "AP", hit: "Hit", crit: "Crit", haste: "Haste",
    mp5: "Mp5", hp5: "Hp5", defense: "Def", dodge: "Dodge", parry: "Parry", block: "Block",
    spShadow: "Shadow", spFire: "Fire", spFrost: "Frost", spNature: "Nature", spArcane: "Arcane", spHoly: "Holy",
    healing: "Heal", rangedAp: "RAP",
    fireRes: "FR", frostRes: "FrR", natureRes: "NR", shadowRes: "SR", arcaneRes: "AR",
    // Legacy long-form fallbacks
    strength: "Str", agility: "Agi", stamina: "Sta", intellect: "Int",
    spellPower: "SP", attackPower: "AP",
};

// Normalization helper
const normalizeText = (str: string) => {
    if (!str) return '';
    return str.replace(/<[^>]*>?/gm, '')
              .replace(/\s+/g, '')
              .replace(/[^a-zA-Z0-9]/g, '')
              .toLowerCase();
};

// Helper to fix database text errors (e.g. "600000 minutes" -> "10 min", "2000 sec" -> "2 sec")
const formatDuration = (text: string) => {
    let t = text;
    // Fix minutes: 600000 minutes -> 10 min
    t = t.replace(/(\d+)\s*(?:minutes|mins|min)/gi, (match, p1) => {
        const val = parseInt(p1, 10);
        if (val > 1000) { 
             const minutes = Math.round(val / 60000);
             return `${minutes} min`;
        }
        return match;
    });
    // Fix seconds: 2000 sec -> 2 sec, 500 sec -> 0.5 sec
    t = t.replace(/(\d+)\s*(?:seconds|secs|sec)/gi, (match, p1) => {
        const val = parseInt(p1, 10);
        // If value is >= 100, assume it's milliseconds stored as seconds
        if (val >= 100) { 
             const seconds = val / 1000;
             return `${seconds} sec`;
        }
        return match;
    });
    return t;
};

// --- PARSED SET TEXT COMPONENT (Duplicated for portability) ---
const ParsedSetText = ({ text }: { text: string }) => {
    const setHeaderRegex = /^(.+?)\s+\((\d+)\/(\d+)\)\s+/;
    const match = text.match(setHeaderRegex);

    if (!match) {
        return <>{formatDuration(text)}</>;
    }

    const [fullMatch, setName, current, max] = match;
    const remainder = text.slice(fullMatch.length);
    const firstBonusIndex = remainder.search(/\(\d+\)\s*Set:/);
    
    let itemsStr = remainder;
    let bonusesStr = "";

    if (firstBonusIndex !== -1) {
        itemsStr = remainder.slice(0, firstBonusIndex).trim();
        bonusesStr = remainder.slice(firstBonusIndex);
    }

    const bonusParts = bonusesStr.split(/(\(\d+\)\s*Set:)/).filter(p => p.trim());
    const bonuses = [];
    for (let i = 0; i < bonusParts.length; i += 2) {
        if (i + 1 < bonusParts.length) {
            bonuses.push({
                prefix: bonusParts[i],
                desc: bonusParts[i+1].trim()
            });
        }
    }

    return (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
            <div className="text-[#FFD700] text-[11px] font-bold mb-1">
                {setName} <span className="text-[#888]">({current}/{max})</span>
            </div>
            <div className="text-[10px] text-[#888] mb-2 leading-tight">
                {itemsStr}
            </div>
            <div className="flex flex-col gap-1">
                {bonuses.map((bonus, i) => (
                    <div key={i} className="text-[10px] text-[#aaa]">
                        <span className="text-[#fff] font-bold mr-1">{bonus.prefix}</span>
                        <span className="text-[#1eff00]">{formatDuration(bonus.desc)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, spec, initialPosition, equipped, currentStats, currentClass, customWeights }) => {
    // 1. Calculate Score / EP (Using dynamic stats if available)
    const score = calculateItemScore(item, spec, customWeights, currentStats, currentClass);
    const gs = item.gearScore ?? calculateGearScore(item as any);
    
    // Safety check: equipped items might contain undefined if slots were cleared explicitly
    const equippedItem = equipped 
        ? (Object.values(equipped) as (Item | undefined)[]).find((e) => e && e.slot === item.slot) 
        : null;
        
    // Calculate equipped score dynamically too
    const equippedScore = equippedItem ? calculateItemScore(equippedItem, spec, customWeights, currentStats, currentClass) : 0;
    const diff = score - equippedScore;

    // 2. Format Stats (Cleanly)
    const stats = Object.entries(item.stats || {}).filter(([key]) => key.toLowerCase() !== 'armor');
    
    // 3. Robust Armor Check (Same as Card)
    const statsObj = item.stats || {};
    // Use bracket notation to avoid TS index signature issues
    const rawArmor = statsObj['armor'] || statsObj['Armor'] || statsObj['ARMOR'] || 0;
    const armorValue = Number(rawArmor);

    // 4. Effects Deduplication and Merging
    const allEffects = useMemo(() => {
        const list: string[] = [];
        const seen = new Set<string>();

        const add = (text: string, isUse: boolean = false) => {
            if (!text) return;
            const norm = normalizeText(text);
            // Prefix stripper for smarter deduplication
            const strip = (s: string) => s.replace(/^(use|equip|chanceonhit)/, '');
            const core = strip(norm);
            
            // Check against seen cores
            let duplicate = false;
            seen.forEach(s => {
                if (strip(s) === core) duplicate = true;
            });
            
            if (!duplicate) {
                seen.add(norm);
                // Format if needed
                let displayText = text;
                if (isUse && !text.toLowerCase().startsWith('use:')) {
                    displayText = `Use: ${text}`;
                }
                list.push(displayText);
            }
        };

        // Prioritize explicit use_effect
        if (item.use_effect) add(item.use_effect, true);
        
        // Then effects list
        if (item.effects) item.effects.forEach(e => add(e));
        if (item.special_effects) item.special_effects.forEach(e => add(e));

        return list;
    }, [item]);

    // 5. Detect Random Enchant (Has Armor, but No Stats/Effects)
    const hasEffects = allEffects.length > 0;
    const isRandomEnchant = armorValue > 0 && stats.length === 0 && !hasEffects;

    // 6. Calculate Stat Deltas
    const statDeltas = useMemo(() => {
        if (!equippedItem) return [];
        const allKeys = new Set([...Object.keys(item.stats || {}), ...Object.keys(equippedItem.stats || {})]);
        const deltas: { label: string, val: number }[] = [];
        
        allKeys.forEach(key => {
            if (key.toLowerCase() === 'armor') return;
            const valA = getStatValue(equippedItem, key);
            const valB = getStatValue(item, key);
            const delta = valB - valA;
            if (delta !== 0) {
                deltas.push({ label: STAT_LABELS[key] || key, val: delta });
            }
        });
        return deltas.sort((a, b) => b.val - a.val); // Positives first
    }, [item, equippedItem]);

    // --- SET BONUS LOGIC ---
    const setDef = item.setName ? SET_DATABASE[item.setName] : null;
    const setCounts = useMemo(() => {
        if (!setDef || !equipped) return { count: 0, equippedNames: new Set<string>() };
        const equippedNames = new Set<string>();
        Object.values(equipped).forEach((eqItem) => {
            const i = eqItem as Item | undefined;
            if (i && i.setName === item.setName) {
                equippedNames.add(i.name);
            }
        });
        return { count: equippedNames.size, equippedNames };
    }, [equipped, item.setName, setDef]);

    // 7. Position Logic (Keep it on screen)
    const style: React.CSSProperties = {
        top: initialPosition.y + 20,
        left: initialPosition.x + 20,
        position: 'fixed',
        zIndex: 9999,
    };

    // Prevent tooltip from going off-screen
    if (initialPosition.x > window.innerWidth - 350) {
        style.left = initialPosition.x - 320;
    }
    if (initialPosition.y > window.innerHeight - 400) {
        style.top = initialPosition.y - (stats.length * 20 + 200); // Approximate height flip
    }

    const qualityColor = QUALITY_COLORS[String(item.quality || 'Common').toLowerCase()] || 'text-white';

    return (
        <div style={style} className="w-[300px] bg-[#050505]/95 border border-[#333] rounded-md shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md p-3 text-sm pointer-events-none animate-in fade-in duration-150">
            {/* Header */}
            <h3 className={`font-bold text-lg mb-0.5 ${qualityColor}`}>{item.name}</h3>
            
            <div className="flex justify-between items-start text-[#aaa] text-xs mb-2">
                <div>
                    <div>{item.slot}</div>
                    {item.bind && <div>{item.bind}</div>}
                </div>
                {gs > 0 && (
                    <div className="text-amber-400 font-bold">GS: {gs}</div>
                )}
            </div>

            {/* Armor */}
            {armorValue > 0 && (
                <div className="text-white mb-2 font-bold">
                    {armorValue} Armor
                </div>
            )}

            {/* --- RANDOM BONUSES (The Fix) --- */}
            {isRandomEnchant && (
                <div className="text-[#1eff00] mb-2 font-bold">
                    &lt;Random Bonuses&gt;
                </div>
            )}

            {/* Stats */}
            <div className="space-y-0.5 mb-3">
                {stats.map(([key, val]) => (
                     <div key={key} className="text-white">
                        +{val} <span className="text-[#999]">{STAT_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim()}</span>
                     </div>
                ))}
            </div>

            {/* Effects */}
            {allEffects.map((eff, i) => (
                <div key={i} className="text-[#1eff00] text-xs mb-1 leading-relaxed">
                    {/* Use ParsedSetText to detect and format raw set dumps */}
                    <ParsedSetText text={eff} />
                </div>
            ))}

            {/* Set Bonuses */}
            {setDef && (
                <div className="mt-3 pt-2">
                    <div className="text-[#FFD700] text-xs font-bold mb-1">
                        {setDef.name} ({setCounts.count}/{setDef.items.length})
                    </div>
                    
                    {/* List Items */}
                    <div className="ml-2 mb-2 flex flex-col gap-0.5">
                        {setDef.items.map(itemName => {
                            const isEquipped = setCounts.equippedNames.has(itemName);
                            return (
                                <div key={itemName} className={`text-[10px] ${isEquipped ? 'text-[#e6cc80]' : 'text-[#888]'}`}>
                                    {itemName}
                                </div>
                            );
                        })}
                    </div>

                    {/* List Bonuses */}
                    <div className="flex flex-col gap-1">
                        {setDef.bonuses.map((bonus, i) => {
                            const isActive = setCounts.count >= bonus.threshold;
                            return (
                                <div key={i} className={`text-[10px] ${isActive ? 'text-[#1eff00]' : 'text-[#888]'}`}>
                                    ({bonus.threshold}) Set: {formatDuration(bonus.text)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Classes Requirement */}
            {item.classes && item.classes.length > 0 && (
                <div className="mt-3 text-[#ffcc00] text-xs">
                    Classes: {item.classes.join(', ')}
                </div>
            )}

            {/* Comparison Delta */}
            {equippedItem && statDeltas.length > 0 && (
                <div className="mt-3 pt-2 border-t border-[#333] grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {statDeltas.map((d, i) => (
                        <div key={i} className={`text-[10px] font-bold ${d.val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {d.val > 0 ? '+' : ''}{d.val} {d.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Footer / EP */}
            <div className="mt-3 pt-2 border-t border-[#333] flex justify-between items-end">
                <span className="text-[#1eff00] text-[10px] uppercase font-bold tracking-wider truncate max-w-[150px]">
                    {item.source || "Turtle WoW"}
                </span>
                
                <div className="text-right">
                    <div className="text-cyan-400 font-bold text-lg leading-none">
                        EP: {score}
                    </div>
                    {equippedItem && (
                        <div className={`text-xs font-bold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {diff > 0 ? '+' : ''}{diff}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
