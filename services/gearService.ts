
import { Item, SpecName, StatWeights, Build, AggregatedStats, ItemStats } from '../types';
import { STAT_WEIGHTS, RARITY_WEIGHTS, CONSUMABLE_DATABASE } from '../constants';

export const getIconUrl = (icon?: string) => {
    if (!icon) return '';
    // sanitize icon name: remove spaces, lowercase
    const cleanIcon = icon.trim().toLowerCase().replace(/\s+/g, '');
    return `https://wow.zamimg.com/images/wow/icons/large/${cleanIcon}.jpg`;
};

export const getRarityColor = (item: Item): string => {
    const q = (item.rarity || "").toLowerCase().trim();
    if (q === 'legendary') return '#ff8000';
    if (q === 'epic') return '#a335ee';
    if (q === 'rare') return '#0070dd';
    if (q === 'uncommon') return '#1eff00';
    return '#fff';
};

// --- STRICT STAT NORMALIZATION ---
const STAT_ALIASES: Record<string, string> = {
    // Primary
    'str': 'str', 'strength': 'str',
    'agi': 'agi', 'agility': 'agi',
    'sta': 'sta', 'stamina': 'sta', 'stam': 'sta',
    'int': 'int', 'intellect': 'int',
    'spi': 'spi', 'spirit': 'spi',
    
    // Multipliers (Racials/Talents)
    'intmod': 'intMod', 'intpercent': 'intMod',
    'spiritmod': 'spiritMod', 'spiritpercent': 'spiritMod',
    'healthmod': 'healthMod', 'healthpercent': 'healthMod',
    'stammod': 'staminaMod', 'staminapercent': 'staminaMod',
    'strmod': 'strMod', 'strpercent': 'strMod',
    'agimod': 'agiMod', 'agipercent': 'agiMod',
    
    // Vitals
    'health': 'health', 'hp': 'health', 'life': 'health',
    'mana': 'mana', 'mp': 'mana',

    // Physical
    'ap': 'ap', 'attackpower': 'ap',
    'defense': 'defense', 'def': 'defense',
    'armor': 'armor',
    'block': 'block', 'dodge': 'dodge', 'parry': 'parry',

    // Spell General
    'sp': 'sp', 'spellpower': 'sp', 'dmg': 'sp', 'damage': 'sp',
    'healing': 'healing', 'healingpower': 'healing', 'heal': 'healing',
    'spellpen': 'spellPen', 'spellpenetration': 'spellPen',
    
    // Spell Schools (Normalized to spSchool)
    'arcane': 'spArcane', 'arcanesp': 'spArcane', 'arcanedamage': 'spArcane', 'sparcane': 'spArcane',
    'fire': 'spFire', 'firesp': 'spFire', 'firedamage': 'spFire', 'spfire': 'spFire',
    'frost': 'spFrost', 'frostsp': 'spFrost', 'frostdamage': 'spFrost', 'spfrost': 'spFrost',
    'holy': 'spHoly', 'holysp': 'spHoly', 'holydamage': 'spHoly', 'spholy': 'spHoly',
    'nature': 'spNature', 'naturesp': 'spNature', 'naturedamage': 'spNature', 'spnature': 'spNature',
    'shadow': 'spShadow', 'shadowsp': 'spShadow', 'shadowdamage': 'spShadow', 'spshadow': 'spShadow',

    // Combat
    'hit': 'hit', 'spellhit': 'hit',
    'crit': 'crit', 'spellcrit': 'crit',
    'haste': 'haste', 'spellhaste': 'haste',
    'vamp': 'spellVamp', 'spellvamp': 'spellVamp',

    // Regen
    'mp5': 'mp5', 'manaregen': 'mp5',
    'hp5': 'hp5', 'healthregen': 'hp5',
    'regencasting': 'regenCasting',

    // Resistances
    'resfire': 'resFire', 'fireres': 'resFire', 'fireresistance': 'resFire',
    'resfrost': 'resFrost', 'frostres': 'resFrost', 'frostresistance': 'resFrost',
    'resnature': 'resNature', 'natureres': 'resNature', 'natureresistance': 'resNature',
    'resshadow': 'resShadow', 'shadowres': 'resShadow', 'shadowresistance': 'resShadow',
    'resarcane': 'resArcane', 'arcaneres': 'resArcane', 'arcaneresistance': 'resArcane',
    
    // Misc
    'speed': 'speed',
    'mindmg': 'minDmg', 'maxdmg': 'maxDmg',
    'rangedap': 'rangedAp',
    'threatreduction': 'threatReduction'
};

export const normalizeItem = (item: Item): Item => {
    if (!item.stats) return item;
    
    const newStats: ItemStats = {};
    for (const [key, val] of Object.entries(item.stats)) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedKey = STAT_ALIASES[cleanKey] || key; // Fallback to original if unknown
        newStats[normalizedKey] = (newStats[normalizedKey] || 0) + val;
    }
    
    // Recursively normalize enchant if present
    let newEnchant = item.enchant;
    if (item.enchant && item.enchant.stats) {
        const normEnchantStats: ItemStats = {};
        for (const [ek, ev] of Object.entries(item.enchant.stats)) {
            const cleanKey = ek.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedKey = STAT_ALIASES[cleanKey] || ek;
            normEnchantStats[normalizedKey] = (normEnchantStats[normalizedKey] || 0) + ev;
        }
        newEnchant = { ...item.enchant, stats: normEnchantStats };
    }

    return {
        ...item,
        stats: newStats,
        enchant: newEnchant
    };
};

export const getStatValue = (item: Item | undefined, key: string): number => {
    if (!item || !item.stats) return 0;
    
    // Fast lookup because keys are now normalized
    let val = item.stats[key] || 0;

    // Check for Enchant stats
    if (item.enchant && item.enchant.stats) {
        val += item.enchant.stats[key] || 0;
    }

    return val; 
};

export const getStatWeights = (item: Item, spec: SpecName, customWeights?: StatWeights): StatWeights => {
    // 0. Use Custom Weights if provided
    if (customWeights) {
        return customWeights;
    }

    // 1. Try Specific Spec Weights
    if (STAT_WEIGHTS[spec]) {
        return STAT_WEIGHTS[spec];
    }

    // 2. Fallback to Rarity Weights
    const rarityKey = (item.rarity || 'common').toLowerCase();
    if (RARITY_WEIGHTS[rarityKey]) {
        return RARITY_WEIGHTS[rarityKey];
    }

    // 3. Fallback to Common
    return RARITY_WEIGHTS['common'];
};

export const calculateItemScore = (item: Item, spec: SpecName, customWeights?: StatWeights): number => {
    const w = getStatWeights(item, spec, customWeights);
    
    // Optimized scoring using normalized keys directly
    // Note: getStatValue handles undefined checks returns 0
    let score = 
        (getStatValue(item, 'sp') * (w.sp || 0)) + 
        (getStatValue(item, 'hit') * 12 * (w.hit || 0)) + 
        (getStatValue(item, 'crit') * 10 * (w.crit || 0)) + 
        (getStatValue(item, 'int') * (w.int || 0)) + 
        (getStatValue(item, 'sta') * (w.stam || 0)) +
        (getStatValue(item, 'spi') * (w.spirit || 0)) +
        (getStatValue(item, 'str') * (w.str || 0)) +
        (getStatValue(item, 'agi') * (w.agi || 0)) +
        (getStatValue(item, 'ap') * (w.ap || 0)) +
        (getStatValue(item, 'defense') * (w.defense || 0)) +
        (getStatValue(item, 'healing') * (w.healing || 0)) +
        (getStatValue(item, 'mp5') * (w.mp5 || 0));
        
    return Math.floor(score);
};

export const normalizeSlot = (rawSlot: string): string => {
    if (["Finger", "Ring"].includes(rawSlot)) return "Ring";
    if (["Trinket"].includes(rawSlot)) return "Trinket";
    
    // Ranged / Relic / Wand
    if (["Relic", "Idol", "Libram", "Totem", "Wand", "Bow", "Gun", "Crossbow", "Thrown", "Ranged"].includes(rawSlot)) return "Ranged";

    // Weapons
    if (["Main Hand", "Two-Hand", "Staff", "Dagger", "Sword", "Mace", "Axe", "Polearm", "Fist Weapon"].includes(rawSlot)) return "MainHand";
    
    // Offhand / Shield
    if (["Off Hand", "Held In Off-hand", "Shield", "OffHand"].includes(rawSlot)) return "OffHand";
    
    return rawSlot;
};

// Aggregates stats from all equipped items, buffs, talents AND racial traits (passed as an extra source)
export const calculateTotalStats = (equipped: Build, activeBuffs: string[], talentStats: ItemStats, racialStats?: ItemStats): AggregatedStats => {
    const items = Object.values(equipped).filter((i): i is Item => !!i);
    
    // Also include active buffs as "items" for stat calculation
    const buffs = activeBuffs.map(name => CONSUMABLE_DATABASE.find(c => c.name === name)).filter(b => !!b);
    
    // Create dummy Items for talents and racials
    const talentsAsItem: Item = {
        name: "Talents",
        slot: "",
        rarity: "",
        source: "",
        icon: "",
        stats: talentStats
    };

    const racialAsItem: Item = {
        name: "Racial",
        slot: "",
        rarity: "",
        source: "",
        icon: "",
        stats: racialStats || {}
    };

    const allSources = [...items, ...buffs, talentsAsItem, normalizeItem(racialAsItem)] as Item[];

    const s: AggregatedStats = {
        sp: 0, hit: 0, crit: 0, int: 0, stam: 0, spirit: 0,
        str: 0, agi: 0, ap: 0, armor: 0, defense: 0,
        health: 0, mana: 0,
        spArcane: 0, spFire: 0, spFrost: 0, spHoly: 0, spNature: 0, spShadow: 0,
        healing: 0, spellPen: 0, spellVamp: 0, haste: 0,
        mp5: 0, hp5: 0, regenCasting: 0,
        resFire: 0, resFrost: 0, resNature: 0, resShadow: 0, resArcane: 0,
        
        // Multipliers
        statMultiplier: 1,
        damageMultiplier: 1,
        
        // Attribute Specific Multipliers (Percentages)
        intMod: 0,
        spiritMod: 0,
        healthMod: 0,
        staminaMod: 0,
        strMod: 0,
        agiMod: 0
    };

    // Helper to calculate % bonuses (like +15% stats) after raw additions
    let allStatsPercentBonus = 0;
    let damagePercentBonus = 0;

    allSources.forEach(item => {
        // Fast accumulation using strict normalized keys
        s.sp += getStatValue(item, 'sp');
        s.hit += getStatValue(item, 'hit');
        s.crit += getStatValue(item, 'crit');
        s.int += getStatValue(item, 'int');
        s.stam += getStatValue(item, 'sta');
        s.spirit += getStatValue(item, 'spi');
        s.str += getStatValue(item, 'str');
        s.agi += getStatValue(item, 'agi');
        s.ap += getStatValue(item, 'ap');
        s.armor += getStatValue(item, 'armor');
        s.defense += getStatValue(item, 'defense');

        s.health += getStatValue(item, 'health');
        s.mana += getStatValue(item, 'mana');

        s.spArcane += getStatValue(item, 'spArcane');
        s.spFire += getStatValue(item, 'spFire');
        s.spFrost += getStatValue(item, 'spFrost');
        s.spHoly += getStatValue(item, 'spHoly');
        s.spNature += getStatValue(item, 'spNature');
        s.spShadow += getStatValue(item, 'spShadow');
        
        s.healing += getStatValue(item, 'healing');
        s.spellPen += getStatValue(item, 'spellPen');
        s.spellVamp += getStatValue(item, 'spellVamp');
        s.haste += getStatValue(item, 'haste');

        s.mp5 += getStatValue(item, 'mp5');
        s.hp5 += getStatValue(item, 'hp5');
        s.regenCasting += getStatValue(item, 'regenCasting');

        s.resFire += getStatValue(item, 'resFire');
        s.resFrost += getStatValue(item, 'resFrost');
        s.resNature += getStatValue(item, 'resNature');
        s.resShadow += getStatValue(item, 'resShadow');
        s.resArcane += getStatValue(item, 'resArcane');
        
        // Percentage Modifiers
        // Normalized keys: intMod, spiritMod, etc.
        s.intMod! += getStatValue(item, 'intMod');
        s.spiritMod! += getStatValue(item, 'spiritMod');
        s.healthMod! += getStatValue(item, 'healthMod');
        s.staminaMod! += getStatValue(item, 'staminaMod');
        s.strMod! += getStatValue(item, 'strMod');
        s.agiMod! += getStatValue(item, 'agiMod');
        
        // Check buff percentages
        if (item.stats && item.stats['allStatsPercent']) allStatsPercentBonus += item.stats['allStatsPercent'];
        if (item.stats && item.stats['damagePercent']) damagePercentBonus += item.stats['damagePercent'];
    });

    // Store multipliers to apply to TOTALS (Base + Gear) later
    if (allStatsPercentBonus > 0) {
        s.statMultiplier = 1 + (allStatsPercentBonus / 100);
    }
    
    if (damagePercentBonus > 0) {
        s.damageMultiplier = 1 + (damagePercentBonus / 100);
    }

    return s;
};
