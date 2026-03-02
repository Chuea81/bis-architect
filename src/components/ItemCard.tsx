
import React, { memo, useMemo } from 'react';
import { Item, RealmType, SpecName, ClassName, StatWeights, AggregatedStats, Build } from '../types';
import { useSmartItem } from '../hooks/useSmartItem';
import { getIconUrl } from '../services/gearService';
import { SET_DATABASE } from '../constants';

// 1. RARITY COLORS & THEMES
const RARITY_THEME: Record<string, { text: string, border: string, glow: string, bg: string }> = {
    'poor':      { 
        text: 'text-[#9d9d9d]', 
        border: 'border-[#2a2a2a]', 
        glow: 'hover:border-[#444]',
        bg: 'from-[#1a1a1a] to-[#0a0a0c]' 
    },
    'common':    { 
        text: 'text-white',      
        border: 'border-[#444]', 
        glow: 'hover:border-white',
        bg: 'from-[#222] to-[#0a0a0c]'
    },
    'uncommon':  { 
        text: 'text-[#1eff00]', 
        border: 'border-[#1eff00]/30', 
        glow: 'hover:border-[#1eff00] hover:shadow-[0_0_15px_rgba(30,255,0,0.1)]',
        bg: 'from-[#1eff00]/10 to-[#0a0a0c]'
    },
    'rare':      { 
        text: 'text-[#0070dd]', 
        border: 'border-[#0070dd]/30', 
        glow: 'hover:border-[#0070dd] hover:shadow-[0_0_15px_rgba(0,112,221,0.1)]',
        bg: 'from-[#0070dd]/10 to-[#0a0a0c]'
    },
    'epic':      { 
        text: 'text-[#a335ee]', 
        border: 'border-[#a335ee]/30', 
        glow: 'hover:border-[#a335ee] hover:shadow-[0_0_15px_rgba(163,53,238,0.1)]',
        bg: 'from-[#a335ee]/10 to-[#0a0a0c]'
    },
    'legendary': { 
        text: 'text-[#ff8000]', 
        border: 'border-[#ff8000]/30', 
        glow: 'hover:border-[#ff8000] hover:shadow-[0_0_15px_rgba(255,128,0,0.1)]',
        bg: 'from-[#ff8000]/10 to-[#0a0a0c]'
    }
};

const QUALITY_NAMES: Record<string, string> = {
    '0': 'poor', '1': 'common', '2': 'uncommon', '3': 'rare', '4': 'epic', '5': 'legendary'
};

// Updated STAT_LABELS — short canonical keys primary, legacy long-form as fallbacks
const STAT_LABELS: Record<string, string> = {
    // Short canonical keys (from hydrator)
    str: "Strength",
    agi: "Agility",
    stam: "Stamina",
    int: "Intellect",
    spirit: "Spirit",
    sp: "Spell Power",
    ap: "Attack Power",
    hit: "Hit %",
    crit: "Crit %",
    haste: "Haste %",
    healing: "Healing Power",
    mp5: "Mana / 5s",
    hp5: "Health / 5s",
    defense: "Defense",
    dodge: "Dodge %",
    parry: "Parry %",
    block: "Block %",
    spShadow: "Shadow Spell Dmg",
    spFire: "Fire Spell Dmg",
    spFrost: "Frost Spell Dmg",
    spNature: "Nature Spell Dmg",
    spArcane: "Arcane Spell Dmg",
    spHoly: "Holy Spell Dmg",
    rangedAp: "Ranged Attack Power",
    feralAp: "Feral Attack Power",
    blockValue: "Block Value",
    // Resistances
    fireRes: "Fire Resistance",
    frostRes: "Frost Resistance",
    natureRes: "Nature Resistance",
    shadowRes: "Shadow Resistance",
    arcaneRes: "Arcane Resistance",
    // Legacy long-form fallbacks (in case any un-hydrated items render)
    strength: "Strength",
    agility: "Agility",
    stamina: "Stamina",
    intellect: "Intellect",
    spellPower: "Spell Power",
    attackPower: "Attack Power",
    // Common DB variants that slip through hydration
    spellCrit: "Crit %",
    SpellCrit: "Crit %",
    spellHit: "Hit %",
    SpellHit: "Hit %",
    meleeHit: "Hit %",
    meleeCrit: "Crit %",
    spellHaste: "Haste %",
    skillAxe: "Axe Skill",
    skillSword: "Sword Skill",
    skillDagger: "Dagger Skill",
    Spi: "Spirit",
    spi: "Spirit",
    sta: "Stamina",
    Sta: "Stamina",
};

const formatStats = (stats: Record<string, number> | undefined): [string, number, string][] => {
    if (!stats) return [];
    const unique = new Map<string, [number, string]>();
    Object.entries(stats).forEach(([key, val]) => {
        if (key.toLowerCase() === 'armor') return;

        // Use lookup map or fallback to capitalization
        const label = STAT_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);

        // Track canonical key alongside label for diff lookups
        if (!unique.has(label)) unique.set(label, [val, key]);
    });
    return Array.from(unique.entries()).map(([label, [val, canonicalKey]]) => [label, val, canonicalKey]);
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

// --- SET BONUS PARSING HELPER ---
const ParsedSetText = ({ text }: { text: string }) => {
    // Regex to detect "Name (0/9)" pattern
    const setHeaderRegex = /^(.+?)\s+\((\d+)\/(\d+)\)\s+/;
    const match = text.match(setHeaderRegex);

    if (!match) {
        return <>{formatDuration(text)}</>;
    }

    const [fullMatch, setName, current, max] = match;
    const remainder = text.slice(fullMatch.length);
    
    // Find where the bonuses start (e.g. "(2) Set:")
    const firstBonusIndex = remainder.search(/\(\d+\)\s*Set:/);
    
    let itemsStr = remainder;
    let bonusesStr = "";

    if (firstBonusIndex !== -1) {
        itemsStr = remainder.slice(0, firstBonusIndex).trim();
        bonusesStr = remainder.slice(firstBonusIndex);
    }

    // Split bonuses
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
        <div className="mt-2 pt-2 border-t border-gray-800/50">
            <div className="text-[#FFD700] text-[10px] font-bold mb-1">
                {setName} <span className="text-[#888]">({current}/{max})</span>
            </div>
            
            {/* Items List (Simple block for now as names are space separated) */}
            <div className="text-[9px] text-[#888] mb-2 leading-tight">
                {itemsStr}
            </div>

            {/* Bonuses */}
            <div className="flex flex-col gap-1">
                {bonuses.map((bonus, i) => (
                    <div key={i} className="text-[9px] text-[#666]">
                        <span className="text-[#e2e8f0] font-bold mr-1">{bonus.prefix}</span>
                        <span className="text-[#1eff00]">{formatDuration(bonus.desc)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- INTERFACE ---
interface ItemCardProps {
  item: Item;
  gameMode: RealmType;
  showLevelReq?: boolean;
  spec?: SpecName;
  currentClass?: ClassName;
  customWeights?: StatWeights;
  currentStats?: AggregatedStats;
  equipped?: Build; 
  isBiS?: boolean; // NEW PROP: Best in Slot Indicator
}

const ItemCardComponent: React.FC<ItemCardProps> = ({ 
    item, gameMode, showLevelReq, 
    spec, currentClass, customWeights, currentStats, equipped, isBiS 
}) => {
  const { props, diffs, isModified, source } = useSmartItem(item, gameMode, spec, currentClass, customWeights, currentStats);
  
  // Destructure new fields from props (which comes from useSmartItem)
  const { 
      name, quality, icon, slot, dps, stats, resistances, 
      speed, minDmg, maxDmg, req_level, gearScore,
      equipEffect, procEffect, useEffect, droppedBy, zone
  } = props;
  
  const qStr = String(quality);
  const qKey = QUALITY_NAMES[qStr] || qStr.toLowerCase();
  const theme = RARITY_THEME[qKey] || RARITY_THEME['common'];

  const displayStats = useMemo(() => formatStats(stats), [stats]);
  
  // Armor Retrieval: Check stats first, then fallback to root item property
  const armorValue = Number((stats && (stats.armor || stats.Armor || stats.ARMOR)) || (item as any).armor || 0);

  // New Effect Rendering Logic
  const equipEffectLines = useMemo(() => {
      if (!equipEffect) return [];
      return equipEffect.split(' / ').map(s => s.trim()).filter(Boolean);
  }, [equipEffect]);

  const isRandomEnchant = armorValue > 0 && displayStats.length === 0 && !equipEffect && !procEffect && !useEffect;

  // --- SET BONUS LOGIC ---
  const setDef = item.setName ? SET_DATABASE[item.setName] : null;
  const setCounts = useMemo(() => {
      if (!setDef || !equipped) return { count: 0, equippedNames: new Set<string>() };
      const equippedNames = new Set<string>();
      Object.values(equipped).forEach((eqItem) => {
          // Explicit cast or check to handle potential undefined in Build type
          const i = eqItem as Item | undefined;
          if (i && i.setName === item.setName) {
              equippedNames.add(i.name);
          }
      });
      return { count: equippedNames.size, equippedNames };
  }, [equipped, item.setName, setDef]);

  // LINKS
  const wowheadUrl = `https://www.wowhead.com/classic/item=${item.id}`;
  const turtleUrl = `https://database.turtlecraft.gg/?item=${item.id}`;

  // Footer Logic — improved to handle missing zone/source data
  const dropSource = (droppedBy && droppedBy.length > 0) ? droppedBy.join(", ") : "";
  const location = zone && zone !== "Unknown" ? zone : "";
  const meaningfulSource = source && source !== "drop" && source !== "unknown" && source !== "Unknown" ? source : "";
  // Priority: "Boss - Zone" > "Boss" > "Zone" > "Source" > empty (no "UNKNOWN" label)
  const footerText = dropSource && location ? `${dropSource} - ${location}` 
      : dropSource ? dropSource 
      : location ? location 
      : meaningfulSource ? meaningfulSource 
      : "";

  // BiS Styling Wrapper
  const bisGlow = isBiS ? "ring-2 ring-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.15)]" : "";

  return (
    <div className={`relative flex flex-col w-full h-auto bg-gradient-to-b ${theme.bg} border rounded-md overflow-hidden font-sans transition-all duration-300 transform-gpu select-none group ${theme.border} ${theme.glow} ${bisGlow} break-inside-avoid mb-4`}>
      
      {/* BiS Badge */}
      {isBiS && (
        <div className="absolute top-0 right-0 z-20">
            <div className="bg-gradient-to-l from-orange-600 to-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl shadow-md flex items-center gap-1 border-b border-l border-orange-400">
                <span className="text-yellow-200">★</span> BIS
            </div>
        </div>
      )}

      {/* Turtle Badge */}
      {isModified && (
        <div className={`absolute ${isBiS ? 'top-[22px]' : 'top-0'} right-0 bg-emerald-900/90 text-emerald-300 text-[8px] px-1.5 py-0.5 rounded-bl-sm font-bold z-10 border-l border-b border-emerald-700 pointer-events-none shadow-lg opacity-80`}>
          TURTLE
        </div>
      )}

      {/* Header */}
      <div className="flex p-2 gap-3 bg-black/20 border-b border-white/5 shrink-0 backdrop-blur-sm relative">
        <div className="w-10 h-10 flex-shrink-0 border border-white/10 rounded-sm overflow-hidden relative bg-[#050505] shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] group-hover:border-white/30 transition-colors">
          <img 
            src={getIconUrl(icon)} 
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/40 pointer-events-none"></div>
        </div>
        
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex justify-between items-start">
              <h3 className={`text-sm font-bold leading-tight truncate pr-8 ${theme.text}`}>
                {name}
              </h3>
              {/* Gear Score (Hidden if BiS to avoid clutter? No, keep it.) */}
              {gearScore !== undefined && (
                  <span className="text-[10px] font-bold text-amber-400 opacity-80 shrink-0 absolute top-2 right-2 hidden">
                      {/* Hidden for now to make room for BiS badge if needed, but flex should handle it. 
                          Actually let's keep it visible but properly positioned. */}
                  </span>
              )}
          </div>
          <div className="flex justify-between items-center mt-0.5">
             <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{slot}</span>
             {gearScore !== undefined && <span className="text-[9px] font-bold text-[#666]">{gearScore} GS</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 text-xs space-y-1">
        
        {/* Weapon Info */}
        {(minDmg && maxDmg && minDmg > 0 && maxDmg > 0) ? (
            <div className="mb-2">
                <div className="flex justify-between text-[#ddd] font-bold text-[11px] mb-0.5">
                    <span>{Number(minDmg).toFixed(0)}-{Number(maxDmg).toFixed(0)} Dmg</span>
                    <span>{speed ? Number(speed).toFixed(2) : '2.00'} Spd</span>
                </div>
                <div className="text-white text-[11px]">
                    ({Number(dps).toFixed(1)} DPS)
                    {isModified && diffs.dps !== 0 && (
                        <span className={`text-[10px] ml-1.5 font-bold ${diffs.dps > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ({diffs.dps > 0 ? '+' : ''}{diffs.dps.toFixed(1)})
                        </span>
                    )}
                </div>
            </div>
        ) : (
            dps > 0 && (
                <div className="flex items-center mb-1">
                    <span className="text-gray-400 mr-1">DPS:</span>
                    <span className="text-white font-mono">{Number(dps).toFixed(1)}</span>
                </div>
            )
        )}

        {/* Armor */}
        {armorValue > 0 && (
             <div className="text-white font-bold mb-1">
                {armorValue} Armor
             </div>
        )}

        {/* Stats Grid */}
        {displayStats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                {displayStats.map(([label, val, canonicalKey]) => (
                  <div key={label} className="flex items-center">
                    <span className="text-[#e2e8f0] whitespace-nowrap">
                      +{val} {label}
                    </span>
                    {isModified && diffs.stats && diffs.stats[canonicalKey] && (
                        <span className={`text-[10px] ml-1 font-bold ${diffs.stats[canonicalKey]! > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ({diffs.stats[canonicalKey]! > 0 ? '+' : ''}{diffs.stats[canonicalKey]})
                        </span>
                    )}
                  </div>
                ))}
            </div>
        )}

        {/* Resistances */}
        {resistances && Object.keys(resistances).length > 0 && (
          <div className="mt-1 space-y-0.5">
            {Object.entries(resistances).map(([res, val]) => (
              <div key={res} className="text-[#e2e8f0] flex items-center">
                +{val} {res.replace('Res','')} Res
              </div>
            ))}
          </div>
        )}

        {/* Level Requirement */}
        {showLevelReq && req_level && req_level > 1 && (
            <div className="mt-2 text-xs font-bold text-yellow-500">
                Requires Level {req_level}
            </div>
        )}

        {/* --- EFFECTS SECTION --- */}
        
        {/* On Use */}
        {useEffect && (
            <div className="mt-2 text-[#1eff00] leading-tight text-[10px] pt-1">
                Use: {formatDuration(useEffect)}
            </div>
        )}

        {/* Chance on Hit */}
        {procEffect && (
            <div className="mt-2 text-[#1eff00] leading-tight text-[10px] pt-1">
                Chance on Hit: {formatDuration(procEffect)}
            </div>
        )}

        {/* Passive Effects */}
        {equipEffectLines.length > 0 && (
          <div className="mt-2 space-y-1 pt-1 border-t border-gray-800/50">
            {equipEffectLines.map((line, idx) => (
              <div key={idx} className="text-[#1eff00] leading-tight text-[10px]">
                {/* Check if this line is actually a Set Bonus dump */}
                <ParsedSetText text={line} />
              </div>
            ))}
          </div>
        )}

        {/* Fallback for legacy 'effects' if new fields missing but old data exists */}
        {(!useEffect && !procEffect && equipEffectLines.length === 0 && props.effects && props.effects.length > 0) && (
             <div className="mt-2 space-y-1 pt-1 border-t border-gray-800/50">
                {props.effects.map((eff, idx) => (
                    <div key={idx} className="text-[#1eff00] leading-tight text-[10px]">
                        <ParsedSetText text={eff} />
                    </div>
                ))}
             </div>
        )}

        {/* --- SET BONUSES (Structured) --- */}
        {/* Only show this if we have a structured definition from constants.ts */}
        {setDef && (
            <div className="mt-3 pt-2 border-t border-gray-800/50">
                <div className="text-[#FFD700] text-[10px] font-bold mb-1">
                    {setDef.name} ({setCounts.count}/{setDef.items.length})
                </div>
                
                {/* List Items */}
                <div className="ml-1 mb-1.5 flex flex-col gap-0.5">
                    {setDef.items.map(itemName => {
                        const isEquipped = setCounts.equippedNames.has(itemName);
                        return (
                            <div key={itemName} className={`text-[9px] ${isEquipped ? 'text-[#e6cc80]' : 'text-[#666]'}`}>
                                {itemName}
                            </div>
                        );
                    })}
                </div>

                {/* List Bonuses */}
                <div className="flex flex-col gap-0.5">
                    {setDef.bonuses.map((bonus, i) => {
                        const isActive = setCounts.count >= bonus.threshold;
                        return (
                            <div key={i} className={`text-[9px] ${isActive ? 'text-[#1eff00]' : 'text-[#666]'}`}>
                                ({bonus.threshold}) Set: {formatDuration(bonus.text)}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* --- RANDOM BONUS INDICATOR --- */}
        {isRandomEnchant && (
             <div className="mt-3 text-[#1eff00] text-[10px] font-bold text-center border-t border-[#1eff00]/20 pt-2">
                 &lt;Random Bonuses&gt;
             </div>
        )}
      </div>

      {/* Footer & Links */}
      <div className="bg-black/40 px-2 py-1.5 border-t border-white/5 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
            <a 
                href={wowheadUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-5 h-5 bg-[#111] hover:bg-[#222] border border-[#333] hover:border-[#666] rounded transition-colors"
                title="View on Wowhead"
                onClick={e => e.stopPropagation()}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-red-800" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
            
            <a 
                href={turtleUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-5 h-5 bg-[#111] hover:bg-[#222] border border-[#333] hover:border-emerald-500 rounded transition-colors"
                title="View on Turtle Database"
                onClick={e => e.stopPropagation()}
            >
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-emerald-500" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            </a>
        </div>

        <div className="text-[9px] text-[#555] text-right uppercase tracking-wider truncate flex-1 ml-2">
            {footerText}
        </div>
      </div>
    </div>
  );
};

export const ItemCard = memo(ItemCardComponent, (prev, next) => {
  return prev.item.id === next.item.id && 
         prev.gameMode === next.gameMode &&
         prev.spec === next.spec && 
         prev.currentClass === next.currentClass &&
         prev.customWeights === next.customWeights &&
         // Important: Check if equipped items changed to update Set Bonus display
         prev.equipped === next.equipped &&
         prev.isBiS === next.isBiS;
});
