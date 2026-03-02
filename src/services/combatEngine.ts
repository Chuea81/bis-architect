
import { AggregatedStats, ClassName, Build } from '../types';

export interface CombatEvent {
    timestamp: number;
    source: string;
    amount: number;
    type: 'hit' | 'crit' | 'miss' | 'glance' | 'resist' | 'tick' | 'block' | 'heal' | 'heal-crit' | 'resource';
    school?: string;
    threat?: number; 
    resourceType?: string;
}

export interface SimResult {
    dps: number;
    hps: number;
    tps: number;
    totalDamage: number;
    totalHealing: number;
    totalThreat: number;
    duration: number;
    events: CombatEvent[];
    breakdown: Record<string, { hits: number, crits: number, damage: number, healing: number, threat: number }>;
    resources: { type: string, end: number, wasted: number }; // Added resource summary
}

export interface SpellDef {
    id: string;
    name: string;
    type?: 'damage' | 'heal' | 'utility'; 
    castTime: number; // 0 for instant
    cooldown: number; // seconds
    coeff: number; // SP coefficient
    baseMin: number;
    baseMax: number;
    school: 'physical' | 'shadow' | 'fire' | 'frost' | 'nature' | 'holy' | 'arcane';
    isDot?: boolean;
    dotDuration?: number;
    dotTicks?: number;
    dotCoeff?: number; 
    resourceCost?: number; 
    resourceType?: 'mana' | 'rage' | 'energy'; // Defaults based on class usually
    reqExecute?: boolean; 
    flatThreat?: number; 
    threatMultiplier?: number; 
}

export interface RotationDef {
    id: string;
    name: string;
    priorityList: string[]; 
    description: string;
    primaryResource: 'mana' | 'rage' | 'energy';
}

// --- SPELL DATABASE (Updated with Costs) ---
export const SPELL_DB: Record<string, SpellDef> = {
    // Warlock
    'sb': { id: 'sb', name: 'Shadow Bolt', castTime: 2.5, cooldown: 0, baseMin: 482, baseMax: 538, coeff: 0.857, school: 'shadow', resourceCost: 370 },
    'corr': { id: 'corr', name: 'Corruption', castTime: 0, cooldown: 0, baseMin: 666, baseMax: 666, coeff: 0, school: 'shadow', isDot: true, dotDuration: 18, dotTicks: 6, dotCoeff: 1.0, resourceCost: 290 }, 
    'coa': { id: 'coa', name: 'Curse of Agony', castTime: 0, cooldown: 0, baseMin: 1044, baseMax: 1044, coeff: 0, school: 'shadow', isDot: true, dotDuration: 24, dotTicks: 12, dotCoeff: 1.0, resourceCost: 215 },
    'immo': { id: 'immo', name: 'Immolate', castTime: 1.5, cooldown: 0, baseMin: 279, baseMax: 279, coeff: 0.2, school: 'fire', isDot: true, dotDuration: 15, dotTicks: 5, dotCoeff: 0.65, resourceCost: 315 },
    'conflag': { id: 'conflag', name: 'Conflagrate', castTime: 0, cooldown: 10, baseMin: 449, baseMax: 500, coeff: 0.43, school: 'fire', resourceCost: 165 }, 
    'searing': { id: 'searing', name: 'Searing Pain', castTime: 1.5, cooldown: 0, baseMin: 204, baseMax: 240, coeff: 0.43, school: 'fire', threatMultiplier: 2.0, resourceCost: 160 },
    'siphon': { id: 'siphon', name: 'Siphon Life', castTime: 0, cooldown: 0, baseMin: 450, baseMax: 450, coeff: 0, school: 'shadow', isDot: true, dotDuration: 30, dotTicks: 10, dotCoeff: 0.5, resourceCost: 140 },
    'shadowburn': { id: 'shadowburn', name: 'Shadowburn', castTime: 0, cooldown: 15, baseMin: 450, baseMax: 502, coeff: 0.43, school: 'shadow', resourceCost: 105 },
    'lt': { id: 'lt', name: 'Life Tap', type: 'utility', castTime: 0, cooldown: 0, baseMin: 0, baseMax: 0, coeff: 0, school: 'shadow', resourceCost: 0 }, // Special logic

    // Mage
    'frostbolt': { id: 'frostbolt', name: 'Frostbolt', castTime: 2.5, cooldown: 0, baseMin: 440, baseMax: 475, coeff: 0.814, school: 'frost', resourceCost: 260 },
    'fireball': { id: 'fireball', name: 'Fireball', castTime: 3.0, cooldown: 0, baseMin: 596, baseMax: 760, coeff: 1.0, school: 'fire', resourceCost: 395 }, 
    'scorch': { id: 'scorch', name: 'Scorch', castTime: 1.5, cooldown: 0, baseMin: 237, baseMax: 280, coeff: 0.43, school: 'fire', resourceCost: 150 },
    'fireblast': { id: 'fireblast', name: 'Fire Blast', castTime: 0, cooldown: 8, baseMin: 446, baseMax: 524, coeff: 0.43, school: 'fire', resourceCost: 275 },
    'amissiles': { id: 'amissiles', name: 'Arcane Missiles', castTime: 5, cooldown: 0, baseMin: 230, baseMax: 230, coeff: 0.24, school: 'arcane', resourceCost: 655 }, 

    // Priest
    'smite': { id: 'smite', name: 'Smite', castTime: 2.0, cooldown: 0, baseMin: 384, baseMax: 429, coeff: 0.71, school: 'holy', resourceCost: 280 },
    'mb': { id: 'mb', name: 'Mind Blast', castTime: 1.5, cooldown: 5.5, baseMin: 508, baseMax: 537, coeff: 0.43, school: 'shadow', resourceCost: 350 }, 
    'mf': { id: 'mf', name: 'Mind Flay', castTime: 3.0, cooldown: 0, baseMin: 426, baseMax: 426, coeff: 0.45, school: 'shadow', resourceCost: 230 }, 
    'swp': { id: 'swp', name: 'Shadow Word: Pain', castTime: 0, cooldown: 0, baseMin: 852, baseMax: 852, coeff: 0, school: 'shadow', isDot: true, dotDuration: 18, dotTicks: 6, dotCoeff: 1.0, resourceCost: 470 },
    'holyfire': { id: 'holyfire', name: 'Holy Fire', castTime: 3.0, cooldown: 0, baseMin: 355, baseMax: 449, coeff: 0.85, school: 'holy', isDot: true, dotDuration: 10, dotTicks: 5, dotCoeff: 0.15, resourceCost: 290 },
    'gh': { id: 'gh', name: 'Greater Heal', type: 'heal', castTime: 3.0, cooldown: 0, baseMin: 1966, baseMax: 2194, coeff: 0.857, school: 'holy', resourceCost: 710 },
    'fh': { id: 'fh', name: 'Flash Heal', type: 'heal', castTime: 1.5, cooldown: 0, baseMin: 812, baseMax: 958, coeff: 0.43, school: 'holy', resourceCost: 380 },

    // Warrior (Rage)
    'bt': { id: 'bt', name: 'Bloodthirst', castTime: 0, cooldown: 6, baseMin: 0, baseMax: 0, coeff: 0.45, school: 'physical', resourceCost: 30, resourceType: 'rage' }, 
    'ms': { id: 'ms', name: 'Mortal Strike', castTime: 0, cooldown: 6, baseMin: 160, baseMax: 160, coeff: 0, school: 'physical', resourceCost: 30, resourceType: 'rage' }, 
    'ww': { id: 'ww', name: 'Whirlwind', castTime: 0, cooldown: 10, baseMin: 0, baseMax: 0, coeff: 0, school: 'physical', resourceCost: 25, resourceType: 'rage' },
    'execute': { id: 'execute', name: 'Execute', castTime: 0, cooldown: 0, baseMin: 600, baseMax: 600, coeff: 0, school: 'physical', reqExecute: true, resourceCost: 15, resourceType: 'rage' },
    'hs': { id: 'hs', name: 'Heroic Strike', castTime: 0, cooldown: 0, baseMin: 138, baseMax: 138, coeff: 0, school: 'physical', flatThreat: 145, resourceCost: 15, resourceType: 'rage' }, 
    'sunder': { id: 'sunder', name: 'Sunder Armor', castTime: 0, cooldown: 0, baseMin: 0, baseMax: 0, coeff: 0, school: 'physical', flatThreat: 261, resourceCost: 15, resourceType: 'rage' },
    'revenge': { id: 'revenge', name: 'Revenge', castTime: 0, cooldown: 5, baseMin: 81, baseMax: 99, coeff: 0, school: 'physical', flatThreat: 315, resourceCost: 5, resourceType: 'rage' },
    'shield_slam': { id: 'shield_slam', name: 'Shield Slam', castTime: 0, cooldown: 6, baseMin: 342, baseMax: 358, coeff: 0, school: 'physical', flatThreat: 250, resourceCost: 20, resourceType: 'rage' },

    // Rogue (Energy)
    'ss': { id: 'ss', name: 'Sinister Strike', castTime: 0, cooldown: 0, baseMin: 68, baseMax: 68, coeff: 0, school: 'physical', resourceCost: 45, resourceType: 'energy' },
    'backstab': { id: 'backstab', name: 'Backstab', castTime: 0, cooldown: 0, baseMin: 150, baseMax: 150, coeff: 0, school: 'physical', resourceCost: 60, resourceType: 'energy' }, 
    'evis': { id: 'evis', name: 'Eviscerate (5 CP)', castTime: 0, cooldown: 0, baseMin: 900, baseMax: 1000, coeff: 0.15, school: 'physical', resourceCost: 35, resourceType: 'energy' }, 

    // Hunter
    'aimed': { id: 'aimed', name: 'Aimed Shot', castTime: 3.0, cooldown: 6, baseMin: 600, baseMax: 600, coeff: 0, school: 'physical', resourceCost: 310 },
    'multi': { id: 'multi', name: 'Multi-Shot', castTime: 0, cooldown: 10, baseMin: 150, baseMax: 150, coeff: 0, school: 'physical', resourceCost: 275 },
    'arcane_shot': { id: 'arcane_shot', name: 'Arcane Shot', castTime: 0, cooldown: 6, baseMin: 183, baseMax: 183, coeff: 0.43, school: 'arcane', resourceCost: 230 },

    // Druid
    'starfire': { id: 'starfire', name: 'Starfire', castTime: 3.0, cooldown: 0, baseMin: 495, baseMax: 585, coeff: 1.0, school: 'arcane', resourceCost: 370 },
    'wrath': { id: 'wrath', name: 'Wrath', castTime: 1.5, cooldown: 0, baseMin: 243, baseMax: 273, coeff: 0.57, school: 'nature', resourceCost: 180 },
    'moonfire': { id: 'moonfire', name: 'Moonfire', castTime: 0, cooldown: 0, baseMin: 189, baseMax: 221, coeff: 0.15, school: 'arcane', isDot: true, dotDuration: 12, dotTicks: 4, dotCoeff: 0.52, resourceCost: 375 },
    'ht': { id: 'ht', name: 'Healing Touch', type: 'heal', castTime: 3.0, cooldown: 0, baseMin: 1890, baseMax: 2230, coeff: 1.0, school: 'nature', resourceCost: 720 },
    'rejuv': { id: 'rejuv', name: 'Rejuvenation', type: 'heal', castTime: 0, cooldown: 0, baseMin: 888, baseMax: 888, coeff: 0, school: 'nature', isDot: true, dotDuration: 12, dotTicks: 4, dotCoeff: 0.8, resourceCost: 335 },
    'maul': { id: 'maul', name: 'Maul', castTime: 0, cooldown: 0, baseMin: 128, baseMax: 128, coeff: 0, school: 'physical', flatThreat: 175, resourceCost: 15, resourceType: 'rage' },

    // Shaman
    'lb': { id: 'lb', name: 'Lightning Bolt', castTime: 2.0, cooldown: 0, baseMin: 428, baseMax: 477, coeff: 0.857, school: 'nature', resourceCost: 265 },
    'cl': { id: 'cl', name: 'Chain Lightning', castTime: 1.5, cooldown: 6, baseMin: 493, baseMax: 551, coeff: 0.714, school: 'nature', resourceCost: 605 },
    'es': { id: 'es', name: 'Earth Shock', castTime: 0, cooldown: 6, baseMin: 517, baseMax: 545, coeff: 0.43, school: 'nature', threatMultiplier: 2.0, resourceCost: 450 },
    'lhw': { id: 'lhw', name: 'Lesser Healing Wave', type: 'heal', castTime: 1.5, cooldown: 0, baseMin: 832, baseMax: 928, coeff: 0.43, school: 'nature', resourceCost: 380 },
    'hw': { id: 'hw', name: 'Healing Wave', type: 'heal', castTime: 2.5, cooldown: 0, baseMin: 1367, baseMax: 1561, coeff: 0.857, school: 'nature', resourceCost: 620 },
    
    // Paladin
    'soc': { id: 'soc', name: 'Seal of Command (Proc)', castTime: 0, cooldown: 0, baseMin: 0, baseMax: 0, coeff: 0.20, school: 'holy', resourceCost: 0 }, 
    'judgement': { id: 'judgement', name: 'Judgement', castTime: 0, cooldown: 8, baseMin: 150, baseMax: 150, coeff: 0.43, school: 'holy', resourceCost: 160 },
    'fol': { id: 'fol', name: 'Flash of Light', type: 'heal', castTime: 1.5, cooldown: 0, baseMin: 343, baseMax: 383, coeff: 0.43, school: 'holy', resourceCost: 140 },
    'hl': { id: 'hl', name: 'Holy Light', type: 'heal', castTime: 2.5, cooldown: 0, baseMin: 1201, baseMax: 1339, coeff: 0.71, school: 'holy', resourceCost: 580 },
};

// --- ROTATION DATABASE ---
export const ROTATIONS: Record<ClassName, RotationDef[]> = {
    "Warlock": [
        { id: "dest_ruin", name: "Destruction (Shadow)", priorityList: ["immo", "conflag", "shadowburn", "sb"], description: "Immolate > Conflag > Shadowburn > Shadow Bolt Spam", primaryResource: 'mana' },
        { id: "dest_fire", name: "Destruction (Fire)", priorityList: ["immo", "conflag", "searing"], description: "Immolate > Conflag > Searing Pain (Fire Spec)", primaryResource: 'mana' },
        { id: "ds_ruin", name: "DS / Ruin (Shadow)", priorityList: ["shadowburn", "sb"], description: "Sacrifice Succubus -> Shadow Bolt Spam", primaryResource: 'mana' },
        { id: "aff_ruin", name: "SM / Ruin", priorityList: ["coa", "corr", "shadowburn", "sb"], description: "Agony > Corruption > Shadowburn > Shadow Bolt", primaryResource: 'mana' },
        { id: "aff_full", name: "Deep Affliction", priorityList: ["siphon", "coa", "corr", "sb"], description: "Siphon Life > Agony > Corruption > Shadow Bolt", primaryResource: 'mana' },
    ],
    "Mage": [
        { id: "frost_standard", name: "Frost (Standard)", priorityList: ["frostbolt"], description: "Frostbolt Spam", primaryResource: 'mana' },
        { id: "fire_standard", name: "Fire (Standard)", priorityList: ["scorch", "fireblast", "fireball"], description: "Scorch (if debuff missing) > Fire Blast > Fireball", primaryResource: 'mana' },
        { id: "arcane_power", name: "Arcane Power", priorityList: ["amissiles", "frostbolt"], description: "Arcane Missiles > Frostbolt", primaryResource: 'mana' },
    ],
    "Warrior": [
        { id: "fury_bt", name: "Fury (Bloodthirst)", priorityList: ["execute", "bt", "ww", "hs"], description: "Execute > Bloodthirst > Whirlwind > Heroic Strike", primaryResource: 'rage' },
        { id: "arms_ms", name: "Arms (Mortal Strike)", priorityList: ["execute", "ms", "ww"], description: "Execute > Mortal Strike > Whirlwind", primaryResource: 'rage' },
        { id: "prot_tps", name: "Prot (TPS)", priorityList: ["shield_slam", "revenge", "sunder", "hs"], description: "Shield Slam > Revenge > Sunder > Heroic Strike", primaryResource: 'rage' },
    ],
    "Rogue": [
        { id: "combat_swords", name: "Combat (Swords)", priorityList: ["ss", "evis"], description: "Sinister Strike > Eviscerate (Simplified)", primaryResource: 'energy' },
        { id: "dagger_backstab", name: "Daggers (Backstab)", priorityList: ["backstab", "evis"], description: "Backstab > Eviscerate", primaryResource: 'energy' },
    ],
    "Hunter": [
        { id: "mm_rotation", name: "Marksmanship Cycle", priorityList: ["aimed", "multi", "arcane_shot"], description: "Aimed Shot > Multi-Shot > Arcane Shot", primaryResource: 'mana' },
    ],
    "Priest": [
        { id: "shadow_weaving", name: "Shadow Weaving", priorityList: ["swp", "mb", "mf"], description: "SW:P > Mind Blast > Mind Flay", primaryResource: 'mana' },
        { id: "smite_spam", name: "Smite DPS", priorityList: ["holyfire", "smite"], description: "Holy Fire > Smite Spam", primaryResource: 'mana' },
        { id: "heal_spam", name: "Greater Heal Spam", priorityList: ["gh"], description: "Spam Greater Heal (HPS)", primaryResource: 'mana' },
        { id: "flash_spam", name: "Flash Heal Spam", priorityList: ["fh"], description: "Spam Flash Heal (HPS)", primaryResource: 'mana' },
    ],
    "Druid": [
        { id: "balance_sf", name: "Balance (Starfire)", priorityList: ["moonfire", "starfire"], description: "Moonfire > Starfire Spam", primaryResource: 'mana' },
        { id: "balance_wrath", name: "Balance (Wrath)", priorityList: ["moonfire", "wrath"], description: "Moonfire > Wrath Spam", primaryResource: 'mana' },
        { id: "heal_touch", name: "Healing Touch Spam", priorityList: ["ht"], description: "Spam Healing Touch (HPS)", primaryResource: 'mana' },
        { id: "bear_tps", name: "Bear (TPS)", priorityList: ["maul"], description: "Maul Spam", primaryResource: 'rage' },
    ],
    "Shaman": [
        { id: "ele_mastery", name: "Elemental", priorityList: ["cl", "es", "lb"], description: "Chain Lightning > Earth Shock > Lightning Bolt", primaryResource: 'mana' },
        { id: "enh_storm", name: "Enhancement", priorityList: ["es", "cl"], description: "Earth Shock > Chain Lightning + Auto Attacks", primaryResource: 'mana' },
        { id: "heal_chain", name: "Chain Heal Spam", priorityList: ["lhw"], description: "Lesser Healing Wave Spam (Simulated)", primaryResource: 'mana' },
    ],
    "Paladin": [
        { id: "ret_soc", name: "Retribution (SoC)", priorityList: ["judgement"], description: "Seal of Command (Proc) + Judgement on CD", primaryResource: 'mana' },
        { id: "shockadin", name: "Shockadin", priorityList: ["judgement"], description: "Holy Shock (Not implemented in DB yet) > Judgement", primaryResource: 'mana' },
        { id: "heal_fol", name: "Flash of Light Spam", priorityList: ["fol"], description: "Flash of Light Spam (HPS)", primaryResource: 'mana' },
        { id: "prot_cons", name: "Prot (Consecration)", priorityList: ["judgement"], description: "Judgement Spam (Basic TPS)", primaryResource: 'mana' },
    ]
};

// --- CORE SIMULATION FUNCTION ---
export const runSimulation = (
    stats: AggregatedStats,
    currentClass: ClassName,
    rotationId: string,
    duration: number,
    targetType: 'boss' | 'mob',
    equipped: Build,
    raidDebuffs: string[] = [],
    onProgress?: (percent: number) => void
): SimResult => {
    
    // --- SIMULATION ENGINE ---
    const events: CombatEvent[] = [];
    let currentTime = 0;
    let totalDamage = 0;
    let totalHealing = 0;
    let totalThreat = 0;
    
    // Resource State
    const rotationDef = (ROTATIONS[currentClass] || []).find(r => r.id === rotationId);
    const primaryRes = rotationDef?.primaryResource || 'mana';
    
    // Initial Resource Values
    let currentMana = primaryRes === 'mana' ? (stats.mana || 2000) : 0;
    const maxMana = currentMana;
    let currentRage = 0;
    let currentEnergy = 100;
    
    // Resource Mechanics
    let timeSinceCast = 5.0; // Starts with FSR inactive
    let energyTickTimer = 0;
    
    // Mana Regen Logic: 5 * (0.001 + sqrt(Int) * Spirit * BaseRegen)
    // Simplified BaseRegen constant approx for level 60
    const spiritRegenBase = 0.01; 
    const manaRegenPerTick = 5 * (Math.sqrt(stats.int) * stats.spirit * spiritRegenBase); 
    const mp5PerTick = (stats.mp5 || 0) * 0.4; // mp5 is per 5s, tick is 2s usually, but here we add continuously or per tick
    
    const breakdown: Record<string, { hits: number, crits: number, damage: number, healing: number, threat: number }> = {};

    const trackBreakdown = (source: string, dmg: number, heal: number, thr: number, type: CombatEvent['type']) => {
        if (!breakdown[source]) breakdown[source] = { hits: 0, crits: 0, damage: 0, healing: 0, threat: 0 };
        breakdown[source].damage += dmg;
        breakdown[source].healing += heal;
        breakdown[source].threat += thr;
        if (type.includes('crit')) breakdown[source].crits++;
        else if (type === 'hit' || type === 'tick' || type === 'glance' || type === 'heal') breakdown[source].hits++;
    };

    const addEvent = (source: string, amount: number, type: CombatEvent['type'], school: string = 'physical', spellDef?: SpellDef) => {
        if (amount <= 0 && type !== 'miss') return;
        
        let dmg = 0;
        let heal = 0;
        let threat = 0;

        if (type === 'heal' || type === 'heal-crit') {
            heal = Math.floor(amount);
            totalHealing += heal;
            threat = heal * 0.5;
        } else if (type === 'resource') {
            // Resource gain event (Life Tap)
        } else if (type !== 'miss' && type !== 'resist') {
            dmg = Math.floor(amount);
            totalDamage += dmg;
            
            let baseThreat = dmg;
            if (spellDef?.flatThreat) baseThreat += spellDef.flatThreat;
            if (spellDef?.threatMultiplier) baseThreat *= spellDef.threatMultiplier;
            threat = baseThreat;
        }

        // Threat Modifiers
        let threatMod = 1.0;
        if (stats.threatReduction) threatMod *= (1 - (stats.threatReduction / 100));
        
        if (currentClass === 'Warrior') {
            if (rotationId.includes('prot')) threatMod *= 1.3; 
            else threatMod *= 0.8;
        } else if (currentClass === 'Druid' && rotationId.includes('bear')) {
            threatMod *= 1.3; 
        } else if (currentClass === 'Paladin' && rotationId.includes('prot') && school === 'holy') {
            threatMod *= 1.9; // Improved Righteous Fury
        }

        threat *= threatMod;
        totalThreat += threat;

        events.push({ timestamp: currentTime, source, amount: Math.max(dmg, heal), type, school, threat });
        trackBreakdown(source, dmg, heal, threat, type);
    };

    const priorityList = rotationDef ? rotationDef.priorityList : [];

    // --- DEBUFF PROCESSING ---
    const debuffMultipliers: Record<string, number> = { 'physical': 1, 'shadow': 1, 'fire': 1, 'frost': 1, 'arcane': 1, 'nature': 1, 'holy': 1 };
    const debuffCrit: Record<string, number> = { 'physical': 0, 'shadow': 0, 'fire': 0, 'frost': 0, 'arcane': 0, 'nature': 0, 'holy': 0 };

    if (raidDebuffs.includes('coe')) { debuffMultipliers['fire'] *= 1.1; debuffMultipliers['frost'] *= 1.1; }
    if (raidDebuffs.includes('cos')) { debuffMultipliers['shadow'] *= 1.1; debuffMultipliers['arcane'] *= 1.1; }
    if (raidDebuffs.includes('shadow_weaving')) debuffMultipliers['shadow'] *= 1.15;
    if (raidDebuffs.includes('scorch')) debuffMultipliers['fire'] *= 1.15;
    if (raidDebuffs.includes('nightfall')) Object.keys(debuffMultipliers).forEach(k => { if (k !== 'physical') debuffMultipliers[k] *= 1.05; });
    if (raidDebuffs.includes('winters_chill')) debuffCrit['frost'] += 10;

    let targetArmor = targetType === 'boss' ? 3731 : 3000;
    if (raidDebuffs.includes('sunder')) targetArmor -= 2250;
    if (raidDebuffs.includes('faerie_fire')) targetArmor -= 505;
    if (raidDebuffs.includes('cor')) targetArmor -= 640;
    if (targetArmor < 0) targetArmor = 0;

    const armorReduction = targetArmor / (targetArmor + 5500);
    const physicalMultiplier = 1 - armorReduction;

    // --- STATE TRACKING ---
    const cooldowns: Record<string, number> = {}; 
    const dots: Record<string, { expires: number, tickInterval: number, nextTick: number, damagePerTick: number, name: string, isHeal?: boolean }> = {};
    
    // Auto Attack State
    let nextSwing = 0;
    const mh = equipped['MainHand'];
    let mhSpeed = mh?.speed || mh?.stats?.speed || 2.0;
    let mhMin = mh?.minDmg || mh?.stats?.minDmg || 50;
    let mhMax = mh?.maxDmg || mh?.stats?.maxDmg || 100;
    
    const ap = stats.ap; 
    const hasteMult = 1 + (stats.haste / 100);
    mhSpeed = mhSpeed / hasteMult;

    const hitChance = Math.min(99, stats.hit);
    const spellHitReduction = Math.min(16, stats.hit); // How much miss % is removed by gear
    const critChance = Math.min(100, stats.crit); 
    const spellCritChance = Math.min(100, stats.crit); 

    const timeStep = 0.1;
    let globalCooldown = 0;
    let isCasting = false;
    let castFinishTime = 0;
    let resourceRegenAccumulator = 0; // For Mana 2s tick simulation

    while (currentTime < duration) {
        
        // 1. REGENERATION
        // Energy: 20 every 2s
        if (primaryRes === 'energy') {
            energyTickTimer += timeStep;
            if (energyTickTimer >= 2.0) {
                currentEnergy = Math.min(100, currentEnergy + 20);
                energyTickTimer = 0;
            }
        }
        // Mana: 5SR + MP5
        if (primaryRes === 'mana') {
            timeSinceCast += timeStep;
            resourceRegenAccumulator += timeStep;
            
            if (resourceRegenAccumulator >= 2.0) {
                // Tick every 2s
                const castingRegenRatio = (stats.regenCasting || 0) / 100; 
                const activeSpiritRegen = (timeSinceCast < 5) 
                    ? manaRegenPerTick * castingRegenRatio 
                    : manaRegenPerTick;
                
                // Add MP5 (Active always) + Spirit Regen
                const tickAmount = activeSpiritRegen + mp5PerTick;
                currentMana = Math.min(maxMana, currentMana + tickAmount);
                resourceRegenAccumulator = 0;
            }
        }
        // Rage: Degrades out of combat, but sim is 100% combat, so we ignore degradation.

        // 2. Process DoTs / HoTs
        Object.keys(dots).forEach(spellId => {
            const dot = dots[spellId];
            if (currentTime >= dot.expires) {
                delete dots[spellId];
            } else if (currentTime >= dot.nextTick) {
                const schoolDef = SPELL_DB[spellId]?.school || 'shadow';
                let tickAmount = dot.damagePerTick;
                
                if (!dot.isHeal) tickAmount *= (debuffMultipliers[schoolDef] || 1);
                
                const type = dot.isHeal ? 'heal' : 'tick';
                addEvent(dot.name, tickAmount, type, schoolDef, SPELL_DB[spellId]);
                dot.nextTick += dot.tickInterval;
            }
        });

        // 3. Process Auto Attacks (White Hits & Rage Gen)
        if (currentTime >= nextSwing && !['Mage', 'Warlock', 'Priest'].includes(currentClass)) { 
            // Dual-wield miss is 24%, two-hand/one-hand miss is 8% vs boss
            const isDualWield = equipped['MainHand'] && equipped['OffHand'] && ['Rogue', 'Warrior', 'Shaman', 'Hunter'].includes(currentClass);
            const baseMiss = targetType === 'boss' ? (isDualWield ? 24 : 8) : 5;
            const missChance = Math.max(0, baseMiss - hitChance);
            const roll = Math.random() * 100;
            
            if (roll > missChance) {
                // Hit
                const baseDmg = Math.random() * (mhMax - mhMin) + mhMin;
                let dmg = baseDmg + (ap / 14 * (mh?.speed || mh?.stats?.speed || 2.0));
                
                // Crit
                let type: CombatEvent['type'] = 'hit';
                if (targetType === 'boss' && Math.random() < 0.4) {
                    type = 'glance';
                    dmg *= 0.7;
                } else if (Math.random() * 100 < (critChance + debuffCrit['physical'])) {
                    type = 'crit';
                    dmg *= 2.0;
                }

                dmg *= physicalMultiplier; 
                addEvent('Auto Attack', dmg, type, 'physical');

                // RAGE GENERATION (Simplified)
                if (primaryRes === 'rage') {
                    // Formula approximation: Dmg / 30 + Speed * 1.25
                    const rageGen = (dmg / 30) + (mhSpeed * 1.25);
                    currentRage = Math.min(100, currentRage + rageGen);
                }

            } else {
                addEvent('Auto Attack', 0, 'miss');
            }
            nextSwing = currentTime + mhSpeed;
        }

        // 4. Casting State Update
        if (isCasting) {
            if (currentTime >= castFinishTime) {
                isCasting = false;
                // Mana FSR Reset happens here (when cast FINISHES)
                if (primaryRes === 'mana') {
                    timeSinceCast = 0;
                }
            }
        }

        // 5. Rotation Decision
        if (!isCasting && currentTime >= globalCooldown) {
            
            // SPECIAL: WARLOCK LIFE TAP CHECK
            if (currentClass === 'Warlock' && currentMana < 400 && primaryRes === 'mana') {
                // Cast Life Tap
                // Cost: Health (ignored). Gain: Mana (approx 500 for high level + SP scaling)
                // Using formula: Base + (SP * 0.8)
                const tapGain = 450 + (stats.sp * 0.8);
                currentMana = Math.min(maxMana, currentMana + tapGain);
                globalCooldown = currentTime + 1.5;
                addEvent('Life Tap', tapGain, 'resource', 'shadow');
                timeSinceCast = 0; // Counts as cast for FSR
            } else {
                // Standard Rotation
                for (const spellId of priorityList) {
                    const spell = SPELL_DB[spellId];
                    if (!spell) continue;

                    // COOLDOWN CHECK
                    if (cooldowns[spellId] && currentTime < cooldowns[spellId]) continue;
                    // DOT CHECK
                    if (spell.isDot && dots[spellId]) continue;
                    // EXECUTE CHECK
                    if (spell.reqExecute && currentTime < duration * 0.8) continue; 

                    // RESOURCE CHECK
                    const cost = spell.resourceCost || 0;
                    const resType = spell.resourceType || primaryRes;
                    
                    if (resType === 'mana' && currentMana < cost) continue;
                    if (resType === 'rage' && currentRage < cost) continue;
                    if (resType === 'energy' && currentEnergy < cost) continue;

                    // CAST IT
                    let actualCastTime = spell.castTime / hasteMult;
                    
                    // Consume Resource (Instant for instant casts, or at start of cast? usually start in WoW Classic)
                    if (resType === 'mana') currentMana -= cost;
                    if (resType === 'rage') currentRage -= cost;
                    if (resType === 'energy') currentEnergy -= cost;

                    if (actualCastTime > 0) {
                        isCasting = true;
                        castFinishTime = currentTime + actualCastTime;
                        // FSR only resets when cast FINISHES, so we don't reset timeSinceCast here
                        globalCooldown = currentTime + Math.max(1.5, actualCastTime); 
                    } else {
                        globalCooldown = currentTime + 1.5; 
                        if (resType === 'mana') timeSinceCast = 0; // Instant cast triggers FSR immediately
                    }

                    if (spell.cooldown > 0) {
                        cooldowns[spellId] = currentTime + spell.cooldown;
                    }

                    // Calculate Output (Heal or Dmg)
                    if (spell.baseMin > 0 || spell.coeff > 0 || spell.school === 'physical') {
                        const isHeal = spell.type === 'heal';
                        const roll = Math.random() * 100;
                        const miss = isHeal ? 0 : (spell.school === 'physical' ? Math.max(0, 5 - hitChance) : Math.max(1, 17 - spellHitReduction));

                        if (roll > miss) {
                            let amount = (spell.baseMin + spell.baseMax) / 2;

                            // Add Coefficient
                            let bonus = 0;
                            if (spell.school === 'physical') {
                                // If spell has a coeff, it scales directly with AP (e.g., Bloodthirst = 45% AP)
                                if (spell.coeff > 0) {
                                    bonus = ap * spell.coeff;
                                } else {
                                    // Normalized weapon damage: use correct speed constant per weapon type
                                    // Daggers = 1.7, 2H = 3.3, default 1H = 2.4
                                    const mhSlot = (mh?.slot || '').toLowerCase();
                                    let normSpeed = 2.4; // default (1H sword/mace/axe/fist)
                                    if (mhSlot.includes('dagger')) normSpeed = 1.7;
                                    else if (mhSlot.includes('two-hand') || mhSlot.includes('staff') || mhSlot.includes('polearm')) normSpeed = 3.3;
                                    bonus = (ap / 14) * normSpeed;
                                }
                            } else {
                                let power = isHeal ? stats.healing + stats.sp : stats.sp;
                                if (!isHeal) {
                                    if (spell.school === 'shadow') power += stats.spShadow;
                                    if (spell.school === 'fire') power += stats.spFire;
                                    if (spell.school === 'frost') power += stats.spFrost;
                                    if (spell.school === 'nature') power += stats.spNature;
                                    if (spell.school === 'arcane') power += stats.spArcane;
                                }
                                bonus = power * spell.coeff;
                            }
                            amount += bonus;

                            if (!isHeal) amount *= (stats.damageMultiplier || 1);
                            else amount *= (stats.statMultiplier || 1); 

                            if (!isHeal) {
                                amount *= (debuffMultipliers[spell.school] || 1);
                                if (spell.school === 'physical') amount *= physicalMultiplier;
                            }

                            // Crit
                            const activeCrit = spell.school === 'physical' ? critChance : spellCritChance;
                            const debuffCritBonus = debuffCrit[spell.school] || 0;
                            let type: CombatEvent['type'] = isHeal ? 'heal' : 'hit';
                            
                            if (Math.random() * 100 < (activeCrit + debuffCritBonus)) {
                                type = isHeal ? 'heal-crit' : 'crit';
                                amount *= (spell.school === 'physical' ? 2.0 : 1.5);
                                // Ruin talent: doubles spell crit bonus (1.5x → 2.0x) — Warlock only, Destruction talent
                                if (currentClass === 'Warlock' && !isHeal && rotationId.includes('ruin')) amount *= 1.33;
                            }

                            // For instant spells, damage happens now. For cast times, it happens at castFinishTime.
                            // Simulation simplification: Add event NOW for instants, or LATER for casts?
                            // To keep loop simple, we add it now but with timestamp = castFinishTime if casting.
                            // However, we just processed resource cost. 
                            // Let's assume projectile travel time / cast time delay is negligible for DPS calc avg, 
                            // but strictly damage should apply at end of cast.
                            // For simplicity in this loop, we record it immediately but the 'timestamp' in event helps.
                            
                            // Correction: We must trigger the EVENT only when cast finishes for damage log accuracy?
                            // Actually, just logging it at current time is fine for "DPS" average, but visually it looks instant.
                            addEvent(spell.name, amount, type, spell.school, spell);
                        } else {
                            addEvent(spell.name, 0, 'miss');
                        }
                    }

                    // Apply DoT / HoT
                    if (spell.isDot && spell.dotTicks && spell.dotDuration) {
                        const isHeal = spell.type === 'heal';
                        let tickAmount = 0;
                        let power = isHeal ? stats.healing + stats.sp : stats.sp;
                        if (!isHeal) {
                            if (spell.school === 'shadow') power += stats.spShadow;
                            if (spell.school === 'fire') power += stats.spFire;
                        }
                        const baseTick = (spell.baseMax || 100) / spell.dotTicks;
                        const scalingTick = (power * (spell.dotCoeff || 0)) / spell.dotTicks;
                        tickAmount = baseTick + scalingTick;
                        if (!isHeal) tickAmount *= (stats.damageMultiplier || 1);

                        dots[spellId] = {
                            expires: currentTime + spell.dotDuration,
                            tickInterval: spell.dotDuration / spell.dotTicks,
                            nextTick: currentTime + (spell.dotDuration / spell.dotTicks),
                            damagePerTick: tickAmount,
                            name: `${spell.name} (${isHeal ? 'HoT' : 'DoT'})`,
                            isHeal
                        };
                    }
                    break; 
                }
            }
        }

        if (Math.floor(currentTime * 10) % 20 === 0 && onProgress) onProgress((currentTime / duration) * 100);
        
        currentTime += timeStep;
    }

    let finalResource = 0;
    if (primaryRes === 'mana') finalResource = currentMana;
    if (primaryRes === 'rage') finalResource = currentRage;
    if (primaryRes === 'energy') finalResource = currentEnergy;

    return {
        dps: Math.floor(totalDamage / duration),
        hps: Math.floor(totalHealing / duration),
        tps: Math.floor(totalThreat / duration),
        totalDamage: Math.floor(totalDamage),
        totalHealing: Math.floor(totalHealing),
        totalThreat: Math.floor(totalThreat),
        duration,
        events: events.slice(-50), 
        breakdown,
        resources: { type: primaryRes, end: Math.floor(finalResource), wasted: 0 }
    };
};
