// Talent stat contributions — maps talent name to a function that returns stat bonuses per rank.
// Only includes talents with quantifiable stat bonuses (hit, crit, defense, dodge, parry, block, hit%).
// Percentage damage increases (e.g. "increases Fire damage by 2%") are excluded as they're
// multiplicative modifiers handled by the combat sim, not additive gear stats.

import { ItemStats } from '../types';

type TalentStatFn = (rank: number) => ItemStats;

export const TALENT_STATS: Record<string, TalentStatFn> = {
    // ====== WARLOCK ======
    // Affliction
    "Suppression": (rank) => ({ hit: rank * 2 }),
    // Destruction
    "Devastation": (rank) => ({ crit: rank }),

    // ====== MAGE ======
    // Arcane
    "Arcane Focus": (rank) => ({ hit: rank * 2 }),
    "Arcane Impact": (rank) => ({ crit: rank * 2 }),
    // Fire
    "Incinerate": (rank) => ({ crit: rank * 2 }),
    "Critical Mass": (rank) => ({ crit: rank * 2 }),
    // Frost
    "Elemental Precision": (rank) => ({ hit: rank * 2 }),

    // ====== WARRIOR ======
    // Arms
    "Deflection": (rank) => ({ parry: rank }),
    // Fury
    "Cruelty": (rank) => ({ crit: rank }),
    // Protection
    "Shield Specialization": (rank) => ({ block: rank }),
    "Anticipation": (rank) => ({ defense: [7, 14, 20][rank - 1] || rank * 7 }),

    // ====== PRIEST ======
    // Discipline
    "Piercing Light": (rank) => ({ hit: rank * 2 }),
    "Force of Will": (rank) => ({ crit: rank }),
    // Holy
    "Divinity": (rank) => ({ crit: rank }),
    // Shadow
    "Shadow Focus": (rank) => ({ hit: rank * 2 }),

    // ====== ROGUE ======
    // Assassination
    "Malice": (rank) => ({ crit: rank }),
    // Combat
    "Precision": (rank) => ({ hit: rank }),
    "Lightning Reflexes": (rank) => ({ dodge: rank }),

    // ====== HUNTER ======
    // Marksmanship
    "Lethal Shots": (rank) => ({ crit: rank }),
    // Survival
    "Surefooted": (rank) => ({ hit: rank }),
    "Killer Instinct": (rank) => ({ crit: rank }),

    // ====== PALADIN ======
    // Retribution
    "Conviction": (rank) => ({ crit: rank }),
    // Protection (Paladin shares "Anticipation" name with Warrior — handled by same entry above)

    // ====== SHAMAN ======
    // Enhancement
    "Thundering Strikes": (rank) => ({ crit: rank }),
    // Elemental
    "Elemental Devastation": (rank) => ({ hit: rank }),
    "Call of Thunder": (rank) => ({ crit: [1, 2, 3, 4, 6][rank - 1] || rank }),
    // Restoration
    "Tidal Mastery": (rank) => ({ crit: rank }),

    // ====== DRUID ======
    // Balance
    "Natural Weapons": (rank) => ({ hit: rank }),
    // Feral Combat
    "Sharpened Claws": (rank) => ({ crit: rank * 2 }),
};
