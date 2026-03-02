
import { Item, ItemStats, ClassName, SpecName, Build, StatWeights, AggregatedStats, ItemCore } from '../types';
import { STAT_WEIGHTS, CONSUMABLE_DATABASE, SET_DATABASE, BASE_STATS, CLASS_PROFICIENCIES, CLASS_CONFIG, ITEM_EP_OVERRIDES } from '../constants';

const ICON_BASE_URL = "https://wow.zamimg.com/images/wow/icons/large/";
const TURTLE_ICON_BASE_URL = "https://database.turtlecraft.gg/images/icons/large/";

// Pre-compute Normalized Slot Map for O(1) lookup
const NORMALIZED_SLOT_CACHE: Record<string, string> = {
    "Head": "Head", "Neck": "Neck", "Shoulder": "Shoulder", "Back": "Back", 
    "Chest": "Chest", "Wrist": "Wrist", "Hands": "Hands", "Waist": "Waist", 
    "Legs": "Legs", "Feet": "Feet", "Ring": "Ring", "Trinket": "Trinket", 
    "Main Hand": "MainHand", "Off Hand": "OffHand", "One-Hand": "One-Hand", 
    "Two-Hand": "Two-Hand", "Ranged": "Ranged", "Relic": "Relic",
    "MainHand": "MainHand", "OffHand": "OffHand", "Held In Off-hand": "OffHand",
    "Shield": "OffHand", "Wand": "Ranged", "Gun": "Ranged", "Bow": "Ranged", "Crossbow": "Ranged"
};

const FALLBACK_SLOT_ICONS: Record<string, string> = {
    "Head": "inv_helmet_04", "Neck": "inv_jewelry_necklace_20", "Shoulder": "inv_shoulder_23", 
    "Back": "inv_misc_cape_18", "Chest": "inv_chest_plate04", "Wrist": "inv_bracer_07", 
    "Hands": "inv_gauntlets_17", "Waist": "inv_belt_12", "Legs": "inv_pants_plate_05", 
    "Feet": "inv_boots_chain_05", "Ring": "inv_jewelry_ring_22", "Trinket": "inv_jewelry_talisman_08", 
    "MainHand": "inv_sword_39", "One-Hand": "inv_sword_39", "Two-Hand": "inv_sword_39", 
    "OffHand": "inv_shield_05", "Ranged": "inv_weapon_bow_08", "Relic": "inv_misc_idol_02",
    "Wand": "inv_wand_01"
};

export const getIconUrl = (iconName: string) => {
    if (!iconName) return "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
    if (iconName.startsWith('http')) return iconName;

    const cleanName = iconName.toLowerCase().replace(/\.(jpg|png)$/, '');

    if (cleanName.includes('_v2') || cleanName.includes('turtle')) {
        return `${TURTLE_ICON_BASE_URL}${cleanName}.png`;
    }

    return `${ICON_BASE_URL}${cleanName}.jpg`;
};

export const getRenderableIcon = (item: Item): string => {
    const originalIcon = item.icon || "";
    const isBadData = originalIcon.includes("inv_misc_questionmark") || originalIcon === "";

    if (isBadData && item.slot) {
        const normalizedSlot = normalizeSlot(item.slot);
        const fallback = FALLBACK_SLOT_ICONS[normalizedSlot] || FALLBACK_SLOT_ICONS["Chest"]; 
        return `${ICON_BASE_URL}${fallback}.jpg`;
    }
    return getIconUrl(originalIcon);
};

export const getRarityColor = (item: Item | undefined | null): string => {
    if (!item) return '#9d9d9d';
    const rarity = item.rarity ? item.rarity.toLowerCase() : '';
    if (rarity === 'epic') return '#a335ee';
    if (rarity === 'rare') return '#0070dd';
    if (rarity === 'uncommon') return '#1eff00';
    if (rarity === 'legendary') return '#ff8000';
    if (rarity === 'common') return '#ffffff';
    if (rarity === 'poor') return '#9d9d9d';
    if (item.quality === 4) return '#a335ee';
    if (item.quality === 3) return '#0070dd';
    if (item.quality === 2) return '#1eff00';
    if (item.quality === 5) return '#ff8000';
    return '#ffffff';
};

export const normalizeSlot = (slot: string): string => {
    if (!slot) return "Misc";
    
    // FIX: Ensure slot is converted to string to prevent "slot.toLowerCase is not a function"
    const safeSlot = String(slot);
    
    if (NORMALIZED_SLOT_CACHE[safeSlot]) return NORMALIZED_SLOT_CACHE[safeSlot];
    
    const s = safeSlot.toLowerCase();
    if (s.includes('two-hand') || s.includes('staff') || s.includes('polearm')) return "Two-Hand";
    if (s.includes('main hand') || s.includes('mainhand')) return "MainHand";
    if (s.includes('off hand') || s.includes('offhand') || s.includes('shield') || s.includes('held in off-hand')) return "OffHand";
    if (s.includes('one-hand') || s.includes('one hand') || s.includes('dagger') || s.includes('sword') || s.includes('mace') || s.includes('axe')) return "One-Hand"; 
    if (s.includes('ranged') || s.includes('bow') || s.includes('gun') || s.includes('crossbow') || s.includes('wand') || s.includes('thrown')) return "Ranged";
    if (s.includes('relic') || s.includes('idol') || s.includes('libram') || s.includes('totem')) return "Relic";
    if (s.includes('head')) return "Head";
    if (s.includes('neck')) return "Neck";
    if (s.includes('shoulder')) return "Shoulder";
    if (s.includes('back')) return "Back";
    if (s.includes('chest')) return "Chest";
    if (s.includes('wrist')) return "Wrist";
    if (s.includes('hands')) return "Hands"; 
    if (s.includes('waist')) return "Waist";
    if (s.includes('legs')) return "Legs";
    if (s.includes('feet')) return "Feet";
    if (s.includes('ring')) return "Ring";
    if (s.includes('trinket')) return "Trinket";
    return "Misc";
};

export const getStatValue = (item: Item, key: string): number => {
    if (!item || !item.stats) return 0;
    return (item.stats[key] as number) || 0;
};

export const getClassFromSpec = (spec: string): ClassName => {
    for (const [c, config] of Object.entries(CLASS_CONFIG)) {
        if (config.specs.includes(spec)) return c as ClassName;
    }
    return 'Warrior';
};

export const getHitCap = (spec: string, className: string): number => {
    if (['Mage', 'Warlock', 'Priest'].includes(className)) return 16;
    if (className === 'Druid' && spec.includes('Balance')) return 16;
    if (className === 'Shaman' && spec.includes('Elemental')) return 16;
    if (className === 'Paladin' && spec.includes('Holy')) return 16; 
    return 9; 
};

// Map of item stats to weight keys — short keys are canonical, long keys are legacy fallback
const SCORE_KEY_MAP: Record<string, string> = {
    // Canonical short keys (identity mappings)
    'sp': 'sp', 'ap': 'ap', 'str': 'str', 'agi': 'agi',
    'stam': 'stam', 'int': 'int', 'spirit': 'spirit', 'healing': 'healing',
    'mp5': 'mp5', 'hit': 'hit', 'crit': 'crit', 'haste': 'haste', 'defense': 'defense',
    'dodge': 'dodge', 'parry': 'parry', 'block': 'block', 'armor': 'armor',
    'spShadow': 'spShadow', 'spFire': 'spFire', 'spFrost': 'spFrost',
    'spNature': 'spNature', 'spArcane': 'spArcane', 'spHoly': 'spHoly',
    'rangedAp': 'rangedAp',
    // Legacy long-form fallbacks (in case un-hydrated items sneak in)
    'spellPower': 'sp', 'attackPower': 'ap', 'strength': 'str', 'agility': 'agi',
    'stamina': 'stam', 'intellect': 'int',
};

/**
 * Determine role archetype from spec for EP override lookup
 */
const getSpecRole = (spec: SpecName): 'caster_dps' | 'melee_dps' | 'healer' | 'tank' => {
    const s = spec.toLowerCase();
    // Healers
    if (s === 'holy' || s === 'discipline' || s === 'holy (paladin)' ||
        s === 'restoration' || s === 'restoration (shaman)') return 'healer';
    // Tanks
    if (s === 'protection' || s === 'protection (paladin)' || s === 'guardian') return 'tank';
    // Caster DPS
    if (['shadow', 'sm ruin', 'affliction', 'destruction', 'demon',
         'frost', 'fire', 'arcane', 'balance', 'elemental', 'smite'].includes(s)) return 'caster_dps';
    // Everything else is melee/ranged physical DPS
    return 'melee_dps';
};

/**
 * Estimate EP from on-use effect text (e.g., "Use: Increases spell damage by 175 for 15 sec. (2 Min Cooldown)")
 * Returns average equivalent stat value: (amount * duration / cooldown) * weight
 */
const estimateUseEffectEP = (texts: string[], weights: StatWeights): number => {
    let totalEP = 0;
    for (const text of texts) {
        const lower = text.toLowerCase();
        // Parse patterns like "increases spell damage by X for Y sec" with "Z min cooldown"
        let amount = 0;
        let statKey = '';

        // Spell damage / spell power
        let match = lower.match(/(?:increases?\s+)?(?:spell\s+)?(?:damage|power)\s+(?:and healing done )?by\s+(?:up to\s+)?(\d+)/);
        if (match) { amount = parseInt(match[1]); statKey = 'sp'; }

        // Healing
        if (!amount) {
            match = lower.match(/(?:increases?\s+)?healing\s+(?:done\s+)?by\s+(?:up to\s+)?(\d+)/);
            if (match) { amount = parseInt(match[1]); statKey = 'healing'; }
        }

        // Attack power
        if (!amount) {
            match = lower.match(/(?:increases?\s+)?attack power\s+by\s+(\d+)/);
            if (match) { amount = parseInt(match[1]); statKey = 'ap'; }
        }

        // Strength
        if (!amount) {
            match = lower.match(/(?:increases?\s+)?strength\s+by\s+(\d+)/);
            if (match) { amount = parseInt(match[1]); statKey = 'str'; }
        }

        // Haste
        if (!amount) {
            match = lower.match(/(?:increases?\s+)?(?:melee |ranged )?(?:haste|attack speed)\s+by\s+(\d+)%/);
            if (match) { amount = parseInt(match[1]); statKey = 'haste'; }
        }

        if (amount > 0 && statKey) {
            // Parse duration
            let duration = 15; // default assumption
            const durMatch = lower.match(/for\s+(\d+)\s*sec/);
            if (durMatch) duration = parseInt(durMatch[1]);

            // Parse cooldown
            let cooldown = 120; // default 2 min
            const cdMatch = lower.match(/(\d+)\s*min(?:ute)?s?\s*cooldown/);
            if (cdMatch) cooldown = parseInt(cdMatch[1]) * 60;
            const cdSecMatch = lower.match(/(\d+)\s*sec(?:ond)?s?\s*cooldown/);
            if (cdSecMatch) cooldown = parseInt(cdSecMatch[1]);

            // Average value = amount * (duration / cooldown)
            const avgValue = amount * (duration / cooldown);
            const weight = weights[statKey] || 0;
            totalEP += avgValue * weight;
        }

        // Proc: "chance on hit" effects — estimate ~15% uptime for melee procs
        if (lower.includes('chance') && (lower.includes('extra attack') || lower.includes('additional attack'))) {
            // Extra attack procs (e.g., Hand of Justice) — roughly 1-2% DPS increase ≈ 20-40 EP for melee
            totalEP += (weights['ap'] || 0) * 25;
        }
    }
    return totalEP;
};

/**
 * ICY VEINS LOGIC: EP CALCULATION
 */
export const calculateItemScore = (
    item: Item,
    spec: SpecName,
    customWeights?: StatWeights,
    currentStats?: AggregatedStats,
    currentClass?: ClassName
): number => {
    if (!item || !item.stats) return 0;

    // Get Weights (Default or Custom)
    const weights = { ...(customWeights || STAT_WEIGHTS[spec] || {}) };

    // --- CHECK EP OVERRIDES FIRST ---
    const role = getSpecRole(spec);
    const override = ITEM_EP_OVERRIDES[item.name];
    if (override && override[role] !== undefined) {
        return override[role]!;
    }

    // Setup Cap Logic
    let currentHit = currentStats ? currentStats.hit : 0;
    const hitCap = (currentClass && currentStats) ? getHitCap(spec, currentClass) : 99;

    let score = 0;

    let effectiveStats = { ...item.stats };

    for (const key in effectiveStats) {
        const val = effectiveStats[key];
        if (typeof val !== 'number') continue;

        let weightKey = SCORE_KEY_MAP[key] || key;
        let weight = weights[weightKey] || 0;

        // School-specific SP fallback: if no explicit weight, use generic SP weight
        if (weight === 0 && ['spShadow','spFire','spFrost','spNature','spArcane','spHoly'].includes(weightKey)) {
            weight = weights['sp'] || 0;
        }

        // --- HIT CAP LOGIC ---
        if (weightKey === 'hit') {
            const hitVal = val;
            const gap = Math.max(0, hitCap - currentHit);

            if (gap >= hitVal) {
                score += hitVal * weight;
            } else {
                const valuablePart = gap;
                const wastedPart = hitVal - gap;
                score += (valuablePart * weight) + (wastedPart * 0.1);
            }
        }
        // --- STANDARD STATS ---
        else {
            score += val * weight;
        }
    }

    // Special Handling: Weapon DPS for Melee
    if (weights['ap'] && item.dps && ['Rogue', 'Warrior', 'Hunter', 'Paladin', 'Shaman', 'Druid'].includes(currentClass || '')) {
        const slot = normalizeSlot(item.slot);
        const isWeapon = ['MainHand', 'Two-Hand', 'One-Hand', 'OffHand'].includes(slot);
        const isRanged = slot === 'Ranged';

        if (currentClass === 'Hunter' && isRanged) {
             score += (item.dps * 14) * (weights['rangedAp'] || weights['ap']);
        } else if (currentClass !== 'Hunter' && isWeapon) {
             if (spec.includes('Feral') || spec.includes('Guardian')) {
                 // Feral DPS from weapon is 0 in Vanilla/Turtle usually, stats matter
             } else {
                 const ohPenalty = (slot === 'OffHand') ? 0.5 : 1.0;
                 score += (item.dps * 14) * weights['ap'] * ohPenalty;
             }
        }
    }

    // --- ON-USE / PROC EFFECT EP ESTIMATION ---
    if (item.useEffectTexts && item.useEffectTexts.length > 0) {
        score += estimateUseEffectEP(item.useEffectTexts, weights);
    }

    return Math.floor(score);
};

const GS_QUALITY_MOD: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 }; 
const GS_SLOT_MOD: Record<string, number> = {
    "Two-Hand": 2.0, "MainHand": 1.0, "One-Hand": 1.0, "OffHand": 1.0, 
    "Head": 1.0, "Chest": 1.0, "Legs": 1.0, 
    "Shoulder": 0.75, "Hands": 0.75, "Waist": 0.75, "Feet": 0.75, 
    "Wrist": 0.56, "Back": 0.56, "Ring": 0.56, "Neck": 0.56,
    "Trinket": 0.65, "Relic": 0.4, "Ranged": 0.4
};

// MODIFIED: Accepts optional context to calculate Spec-Specific GearScore (EP)
export const calculateGearScore = (
    item: ItemCore, 
    spec?: SpecName, 
    customWeights?: StatWeights,
    currentStats?: AggregatedStats,
    currentClass?: ClassName
): number => {
    // 1. If Spec/Class context is provided, use EP (Item Score) logic immediately.
    // This ensures "GearScore" reflects true utility (Icy Veins Logic).
    if (spec && currentClass) {
        // Cast ItemCore to Item to satisfy TS (safe as fields overlap)
        return calculateItemScore(item as unknown as Item, spec, customWeights, currentStats, currentClass);
    }

    // 2. Fallback: Static GS (Legacy)
    const q = (typeof item.quality === 'number') ? item.quality : 2; 
    const lvl = item.req_level || 1;
    const slot = normalizeSlot(item.slot);
    const base = (lvl * 1.6) + (GS_QUALITY_MOD[q] * 26);
    const mod = GS_SLOT_MOD[slot] || 0.5;
    return Math.floor(base * mod);
};

// --- NEW TYPE: STAT BREAKDOWN ---
export interface StatSource {
    base: number;
    gear: number;
    enchant: number;
    buffs: number;
    talents: number;
    total: number;
}

export type StatBreakdown = Record<string, StatSource>;

// --- HELPER: Initializer ---
const initBreakdown = (): StatBreakdown => {
    // We can use a proxy or just initialize common keys. 
    // Proxy is better to handle any key dynamically.
    return new Proxy({}, {
        get: (target: any, name: string) => {
            if (!(name in target)) {
                target[name] = { base: 0, gear: 0, enchant: 0, buffs: 0, talents: 0, total: 0 };
            }
            return target[name];
        }
    });
};

// --- REFACTORED: Detailed Stats Calculation ---
export const calculateStatBreakdown = (
    equipped: Build,
    activeBuffs: string[],
    talentStats: ItemStats,
    racialStats: ItemStats,
    activeRaidBuffs: string[] = [],
    currentClass: ClassName
): StatBreakdown => {
    const bd = initBreakdown();
    
    // 0. Base Stats
    const base = BASE_STATS[currentClass];
    if (base) {
        bd['str'].base = base.str;
        bd['agi'].base = base.agi;
        bd['stam'].base = base.sta;
        bd['int'].base = base.int;
        bd['spirit'].base = base.spi;
        bd['health'].base = base.hp;
        bd['mana'].base = base.mp;
    }

    const setCounts: Record<string, number> = {};

    // 1. Gear
    for (const key in equipped) {
        const item = equipped[key];
        if (!item) continue;
        if (item.setName) setCounts[item.setName] = (setCounts[item.setName] || 0) + 1;

        if (item.stats) {
            // Legacy fallback map for any long-form keys that slip through
            const LEGACY_TO_SHORT: Record<string, string> = {
                'strength': 'str', 'agility': 'agi', 'stamina': 'stam',
                'intellect': 'int', 'sta': 'stam', 'spi': 'spirit',
                'attackPower': 'ap', 'spellPower': 'sp',
                'shadowDmg': 'spShadow', 'fireDmg': 'spFire', 'frostDmg': 'spFrost',
                'natureDmg': 'spNature', 'arcaneDmg': 'spArcane', 'holyDmg': 'spHoly',
                'fireRes': 'resFire', 'frostRes': 'resFrost', 'natureRes': 'resNature',
                'shadowRes': 'resShadow', 'arcaneRes': 'resArcane'
            };
            for (const k in item.stats) {
                const v = item.stats[k];
                if (typeof v === 'number') {
                    const statKey = LEGACY_TO_SHORT[k] || k;
                    bd[statKey].gear += v;
                }
            }
        }

        // Enchants
        if (item.enchant && item.enchant.stats) {
            const ENCHANT_LEGACY: Record<string, string> = {
                'spellPower': 'sp', 'stamina': 'stam', 'intellect': 'int',
                'strength': 'str', 'agility': 'agi', 'attackPower': 'ap',
                'sta': 'stam', 'spi': 'spirit'
            };
            for (const k in item.enchant.stats) {
                const v = item.enchant.stats[k];
                if (typeof v === 'number') {
                    const statKey = ENCHANT_LEGACY[k] || k;
                    bd[statKey].enchant += v;
                }
            }
        }
    }

    // Set Bonuses (Count as Gear)
    for (const setName in setCounts) {
        const count = setCounts[setName];
        const setDef = SET_DATABASE[setName];
        if (setDef && setDef.bonuses) {
            setDef.bonuses.forEach(bonus => {
                if (count >= bonus.threshold && bonus.stats) {
                    const SET_LEGACY: Record<string, string> = {
                        'spellPower': 'sp', 'stamina': 'stam', 'strength': 'str',
                        'agility': 'agi', 'intellect': 'int', 'attackPower': 'ap',
                        'sta': 'stam', 'spi': 'spirit'
                    };
                    for (const k in bonus.stats) {
                        const v = bonus.stats[k];
                        if (typeof v === 'number') {
                            const statKey = SET_LEGACY[k] || k;
                            bd[statKey].gear += v; 
                        }
                    }
                }
            });
        }
    }

    // 2. Buffs (Consumables + Raid)
    // Consumables
    for (const buffName of activeBuffs) {
        const buff = CONSUMABLE_DATABASE.find(c => c.name === buffName);
        if (buff && buff.stats) {
             for (const k in buff.stats) {
                const v = buff.stats[k];
                if (typeof v === 'number') bd[k].buffs += v;
            }
        }
    }
    // Raid Buffs
    for (const buffId of activeRaidBuffs) {
        if (buffId === 'fort') bd['stam'].buffs += 54;
        if (buffId === 'ai') bd['int'].buffs += 31;
        if (buffId === 'spirit') bd['spirit'].buffs += 40;
        if (buffId === 'motw') { 
            bd['str'].buffs += 12; bd['agi'].buffs += 12; bd['stam'].buffs += 12; 
            bd['int'].buffs += 12; bd['spirit'].buffs += 12; bd['armor'].buffs += 285; 
            bd['resFire'].buffs += 20; bd['resFrost'].buffs += 20; bd['resNature'].buffs += 20; 
            bd['resShadow'].buffs += 20; bd['resArcane'].buffs += 20; 
        }
        if (buffId === 'might') bd['ap'].buffs += 185;
        if (buffId === 'bs') bd['ap'].buffs += 185;
        if (buffId === 'wisdom') bd['mp5'].buffs += 30;
        if (buffId === 'leader') bd['crit'].buffs += 3;
        if (buffId === 'moonkin') bd['crit'].buffs += 3;
        if (buffId === 'trueshot') bd['ap'].buffs += 100;
        if (buffId === 'soa') bd['str'].buffs += 77;
        if (buffId === 'goa') bd['agi'].buffs += 77;
    }

    // 3. Talents & Racials
    for (const k in talentStats) {
        const v = talentStats[k];
        if (typeof v === 'number') {
            const TALENT_LEGACY: Record<string, string> = {
                'stamina': 'stam', 'sta': 'stam', 'intellect': 'int', 'spirit': 'spirit', 'spi': 'spirit'
            };
            const statKey = TALENT_LEGACY[k] || k;
            bd[statKey].talents += v;
        }
    }
    for (const k in racialStats) {
        const v = racialStats[k];
        if (typeof v === 'number') {
             // Map some racial keys
             let statKey = k;
             if (k === 'shadowRes') statKey = 'resShadow';
             if (k === 'natureRes') statKey = 'resNature';
             if (k === 'frostRes') statKey = 'resFrost';
             if (k === 'arcaneRes') statKey = 'resArcane';
             bd[statKey].talents += v; // Count racials as talents/innate
        }
    }

    // 4. Totals (and multipliers)
    // First pass: Sum flat values
    for (const key in bd) {
        // @ts-ignore
        const s = bd[key];
        s.total = s.base + s.gear + s.enchant + s.buffs + s.talents;
    }

    // Second pass: Multipliers
    // Example: Stats from Kings (10%)
    let statMod = 1.0;
    if (activeRaidBuffs.includes('kings')) statMod *= 1.1;
    if (bd['allStatsPercent'].talents > 0) statMod *= (1 + bd['allStatsPercent'].talents/100);

    ['str', 'agi', 'stam', 'int', 'spirit'].forEach(stat => {
        // Apply percent mods from talents first (e.g. +5% Spirit)
        // Then apply global multipliers (Kings)
        
        // Find specific mod (e.g. intMod)
        const specificMod = bd[stat + 'Mod'] ? bd[stat + 'Mod'].talents : 0; // % from talents
        
        let multiplier = statMod * (1 + specificMod/100);
        
        if (multiplier !== 1) {
            const oldTotal = bd[stat].total;
            const newTotal = oldTotal * multiplier;
            // Attribute the gain to 'buffs' if kings, or 'talents' if innate? 
            // Simplifying: Add the delta to 'buffs' if kings is active, else 'talents'
            const delta = newTotal - oldTotal;
            if (activeRaidBuffs.includes('kings')) bd[stat].buffs += delta;
            else bd[stat].talents += delta;
            
            bd[stat].total = newTotal;
        }
    });

    return bd;
};

// --- LEGACY WRAPPER ---
// Keeps the app working while using the new detailed system internally if desired, 
// or we can just keep the old one for simple calls. 
// For now, we keep the old one as is to avoid regression, 
// but the UI will use calculateStatBreakdown when it needs details.
export const calculateTotalStats = (
    equipped: Build,
    activeBuffs: string[],
    talentStats: ItemStats,
    racialStats: ItemStats,
    activeRaidBuffs: string[] = []
): AggregatedStats => {
    // Initial State
    const total: AggregatedStats = {
        str: 0, agi: 0, stam: 0, int: 0, spirit: 0, health: 0, mana: 0, ap: 0, armor: 0, defense: 0,
        sp: 0, healing: 0, spellPen: 0, spArcane: 0, spFire: 0, spFrost: 0, spHoly: 0, spNature: 0, spShadow: 0,
        hit: 0, crit: 0, haste: 0, spellVamp: 0, mp5: 0, hp5: 0, regenCasting: 0,
        resFire: 0, resFrost: 0, resNature: 0, resShadow: 0, resArcane: 0,
        statMultiplier: 1, damageMultiplier: 1, threatReduction: 0,
        totalGearScore: 0
    };

    const setCounts: Record<string, number> = {};

    for (const key in equipped) {
        const item = equipped[key];
        if (!item) continue;
        
        // --- NEW: Calculate Item GS using Context if possible, otherwise generic ---
        // Here we don't have spec context, so it will fall back to static or just use stored
        const itemGS = item.gearScore ?? calculateGearScore(item as unknown as ItemCore);
        
        total.totalGearScore = (total.totalGearScore || 0) + itemGS;
        if (item.setName) setCounts[item.setName] = (setCounts[item.setName] || 0) + 1;
        if (!item.stats) continue;
        for (const statKey in item.stats) {
            const v = item.stats[statKey];
            if (typeof v !== 'number') continue;
            switch(statKey) {
                case 'strength': case 'str': total.str += v; break;
                case 'agility': case 'agi': total.agi += v; break;
                case 'stamina': case 'sta': total.stam += v; break;
                case 'intellect': case 'int': total.int += v; break;
                case 'spirit': case 'spi': total.spirit += v; break;
                case 'attackPower': case 'ap': total.ap += v; break;
                case 'spellPower': case 'sp': total.sp += v; break;
                case 'healing': total.healing += v; break;
                case 'hit': total.hit += v; break;
                case 'crit': total.crit += v; break;
                case 'haste': total.haste += v; break;
                case 'mp5': total.mp5 += v; break;
                case 'armor': total.armor += v; break;
                case 'defense': total.defense += v; break;
                case 'fireRes': total.resFire += v; break;
                case 'frostRes': total.resFrost += v; break;
                case 'natureRes': total.resNature += v; break;
                case 'shadowRes': total.resShadow += v; break;
                case 'arcaneRes': total.resArcane += v; break;
                case 'shadowDmg': case 'spShadow': total.spShadow += v; break;
                case 'fireDmg': case 'spFire': total.spFire += v; break;
                case 'frostDmg': case 'spFrost': total.spFrost += v; break;
                case 'natureDmg': case 'spNature': total.spNature += v; break;
                case 'arcaneDmg': case 'spArcane': total.spArcane += v; break;
                case 'holyDmg': case 'spHoly': total.spHoly += v; break;
            }
        }
        if (item.enchant && item.enchant.stats) {
            for (const k in item.enchant.stats) {
                const v = item.enchant.stats[k];
                if (typeof v !== 'number') continue;
                if (k === 'sp' || k === 'spellPower') total.sp += v;
                else if (k === 'healing') total.healing += v;
                else if (k === 'hit') total.hit += v;
                else if (k === 'sta' || k === 'stamina') total.stam += v;
                else if (k === 'int' || k === 'intellect') total.int += v;
                else if (k === 'str' || k === 'strength') total.str += v;
                else if (k === 'agi' || k === 'agility') total.agi += v;
                else if (k === 'spi' || k === 'spirit') total.spirit += v;
                else if (k === 'ap' || k === 'attackPower') total.ap += v;
                else if (k === 'mp5') total.mp5 += v;
            }
        }
    }

    for (const setName in setCounts) {
        const count = setCounts[setName];
        const setDef = SET_DATABASE[setName];
        if (setDef && setDef.bonuses) {
            setDef.bonuses.forEach(bonus => {
                if (count >= bonus.threshold && bonus.stats) {
                    for (const k in bonus.stats) {
                        const v = bonus.stats[k];
                        if (typeof v !== 'number') continue;
                        switch(k) {
                            case 'sp': total.sp += v; break;
                            case 'ap': total.ap += v; break;
                            case 'hit': total.hit += v; break;
                            case 'crit': total.crit += v; break;
                            case 'haste': total.haste += v; break;
                            case 'healing': total.healing += v; break;
                            case 'mp5': total.mp5 += v; break;
                            case 'str': case 'strength': total.str += v; break;
                            case 'agi': case 'agility': total.agi += v; break;
                            case 'sta': case 'stamina': total.stam += v; break;
                            case 'int': case 'intellect': total.int += v; break;
                            case 'spi': case 'spirit': total.spirit += v; break;
                            case 'threatReduction': total.threatReduction += v; break;
                        }
                    }
                }
            });
        }
    }

    for (const buffName of activeBuffs) {
        const buff = CONSUMABLE_DATABASE.find(c => c.name === buffName);
        if (buff && buff.stats) {
             for (const k in buff.stats) {
                const v = buff.stats[k];
                if (typeof v !== 'number') continue;
                if (k === 'sp') total.sp += v;
                else if (k === 'health') total.health += v;
                else if (k === 'mana') total.mana += v;
                else if (k === 'int') total.int += v;
                else if (k === 'str') total.str += v;
                else if (k === 'agi') total.agi += v;
                else if (k === 'stam') total.stam += v;
                else if (k === 'spirit') total.spirit += v;
                else if (k === 'crit') total.crit += v;
                else if (k === 'spellCrit') total.crit += v;
                else if (k === 'hit') total.hit += v;
                else if (k === 'ap') total.ap += v;
                else if (k === 'mp5') total.mp5 += v;
                else if (k === 'spShadow') total.spShadow += v;
                else if (k === 'healing') total.healing += v;
                else if (k === 'damagePercent') total.damageMultiplier = (total.damageMultiplier || 1) * (1 + v/100);
                else if (k === 'statMultiplier') total.statMultiplier = (total.statMultiplier || 1) + v;
                else if (k === 'armor') total.armor += v;
                else if (k === 'defense') total.defense += v;
            }
        }
    }

    for (const k in talentStats) {
        const v = talentStats[k];
        if (typeof v !== 'number') continue;
        switch(k) {
            case 'crit': total.crit += v; break;
            case 'hit': total.hit += v; break;
            case 'haste': total.haste += v; break;
            case 'sp': total.sp += v; break;
            case 'healing': total.healing += v; break;
            case 'stamina': case 'sta': total.stam += v; break;
            case 'intellect': case 'int': total.int += v; break;
            case 'spirit': case 'spi': total.spirit += v; break;
            case 'mana': total.mana += v; break;
            case 'mp5': total.mp5 += v; break;
            case 'strMod': total.strMod = (total.strMod || 0) + v; break;
            case 'agiMod': total.agiMod = (total.agiMod || 0) + v; break;
            case 'staminaMod': total.staminaMod = (total.staminaMod || 0) + v; break;
            case 'intMod': total.intMod = (total.intMod || 0) + v; break;
            case 'spiritMod': total.spiritMod = (total.spiritMod || 0) + v; break;
            case 'damagePercent': total.damageMultiplier = (total.damageMultiplier || 1) * (1 + v/100); break;
            case 'allStatsPercent': total.statMultiplier = (total.statMultiplier || 1) * (1 + v/100); break;
            case 'threatReduction': total.threatReduction = (total.threatReduction || 0) + v; break;
            case 'regenCasting': total.regenCasting = (total.regenCasting || 0) + v; break;
            case 'armor': total.armor += v; break;
        }
    }

    for (const k in racialStats) {
        const v = racialStats[k];
        if (typeof v !== 'number') continue;
        if (k === 'intMod') total.intMod = (total.intMod || 0) + v;
        else if (k === 'spiritMod') total.spiritMod = (total.spiritMod || 0) + v;
        else if (k === 'healthMod') total.healthMod = (total.healthMod || 0) + v;
        else if (k === 'shadowRes') total.resShadow += v;
        else if (k === 'natureRes') total.resNature += v;
        else if (k === 'frostRes') total.resFrost += v;
        else if (k === 'arcaneRes') total.resArcane += v;
    }

    for (const buffId of activeRaidBuffs) {
        if (buffId === 'kings') total.statMultiplier *= 1.1;
        if (buffId === 'fort') total.stam += 54;
        if (buffId === 'ai') total.int += 31;
        if (buffId === 'spirit') total.spirit += 40;
        if (buffId === 'motw') { total.str += 12; total.agi += 12; total.stam += 12; total.int += 12; total.spirit += 12; total.armor += 285; total.resFire += 20; total.resFrost += 20; total.resNature += 20; total.resShadow += 20; total.resArcane += 20; }
        if (buffId === 'might') total.ap += 185;
        if (buffId === 'bs') total.ap += 185;
        if (buffId === 'wisdom') total.mp5 += 30;
        if (buffId === 'leader') total.crit += 3;
        if (buffId === 'moonkin') total.crit += 3;
        if (buffId === 'trueshot') total.ap += 100;
        if (buffId === 'soa') total.str += 77;
        if (buffId === 'goa') total.agi += 77;
    }

    return total;
};

export const normalizeItem = (item: Item): Item => {
    return {
        ...item,
        slot: normalizeSlot(item.slot)
    };
};

export const canClassEquip = (className: ClassName, item: Item): { allowed: boolean, reason?: string } => {
    if (item.classes && item.classes.length > 0 && !item.classes.includes(className)) {
        return { allowed: false, reason: `Only wearable by: ${item.classes.join(', ')}` };
    }
    const prof = CLASS_PROFICIENCIES[className];
    if (!prof) return { allowed: true }; 

    const slot = normalizeSlot(item.slot);
    const subclass = item.subclass || item.subtype || ""; 

    const armorSlots = ["Head", "Shoulder", "Chest", "Wrist", "Hands", "Waist", "Legs", "Feet"];
    if (armorSlots.includes(slot)) {
        if (["Cloth", "Leather", "Mail", "Plate"].includes(subclass)) {
            if (!prof.armor.includes(subclass)) {
                return { allowed: false, reason: `Cannot wear ${subclass} armor` };
            }
        }
    }

    const weaponSlots = ["MainHand", "One-Hand", "Two-Hand", "Ranged"];
    if (weaponSlots.includes(slot)) {
        if (subclass && subclass !== "Miscellaneous" && subclass !== "Junk") {
             if (!prof.weapons.some(w => subclass.includes(w))) {
                 return { allowed: false, reason: `Cannot equip ${subclass}` };
             }
        }
    }

    if (slot === "OffHand" && subclass === "Shield") {
        if (!prof.weapons.includes("Shield")) {
            return { allowed: false, reason: "Cannot equip Shields" };
        }
    }

    return { allowed: true };
};

export const getStatWeights = (spec: SpecName): StatWeights => {
    return STAT_WEIGHTS[spec] || {};
};

export const generateBestInSlotBuild = (items: Item[], spec: SpecName, customWeights?: StatWeights, currentClass?: ClassName): Build => {
    const build: Build = {};
    const slots = ["Head", "Neck", "Shoulder", "Back", "Chest", "Wrist", "Hands", "Waist", "Legs", "Feet", "Ring_1", "Ring_2", "Trinket_1", "Trinket_2", "MainHand", "OffHand", "Ranged", "Relic"];

    // Track running hit total for iterative hit cap evaluation
    let runningHit = 0;

    for (const slotId of slots) {
        const slotType = slotId.replace(/_\d/, '');
        const normTarget = normalizeSlot(slotType);

        if (normTarget === 'OffHand') {
            const mhItem = build['MainHand'];
            if (mhItem) {
                const mhSlot = normalizeSlot(mhItem.slot);
                if (mhSlot === 'Two-Hand') continue;
            }
        }

        // Score items with current running stats for accurate hit cap evaluation
        const mockStats = { hit: runningHit } as AggregatedStats;

        const candidates = items
            .filter(item => {
                const itemNorm = normalizeSlot(item.slot);
                const isEquipped = Object.values(build).some(e => e?.id === item.id);
                if (isEquipped) return false;

                // Class restriction check
                if (currentClass) {
                    const check = canClassEquip(currentClass, item);
                    if (!check.allowed) return false;
                }

                if (itemNorm === normTarget) return true;
                if (normTarget === 'MainHand') {
                    if (itemNorm === 'One-Hand') return true;
                    if (itemNorm === 'Two-Hand') return true;
                }
                if (normTarget === 'OffHand') {
                    if (itemNorm === 'One-Hand') return true;
                }
                if (normTarget === 'Ranged') {
                    if (itemNorm === 'Relic') return true;
                }
                return false;
            })
            .map(item => ({
                item,
                score: calculateItemScore(item, spec, customWeights, mockStats, currentClass),
                gs: calculateGearScore(item as any)
            }))
            .sort((a, b) => {
                const scoreDiff = b.score - a.score;
                if (scoreDiff !== 0) return scoreDiff;
                return b.gs - a.gs;
            });

        const bestEntry = candidates[0];

        if (bestEntry) {
            const itemNorm = normalizeSlot(bestEntry.item.slot);
            if (normTarget === 'MainHand' && itemNorm === 'Two-Hand') {
                delete build['OffHand'];
            }
            build[slotId] = bestEntry.item;
            // Update running hit for subsequent slot evaluations
            runningHit += (bestEntry.item.stats?.hit || 0);
        }
    }

    return build;
};
