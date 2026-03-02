
import { ClassName, SpecName, ItemStats, StatWeights, Consumable, ItemSet, Enchant, RealmType, RaceName, Recipe } from './types';

export const CLASS_CONFIG: Record<ClassName, { color: string, image: string, specs: SpecName[] }> = {
    'Druid': { color: '#FF7D0A', image: '', specs: ['Balance', 'Feral', 'Restoration'] },
    'Hunter': { color: '#ABD473', image: '', specs: ['Beast Mastery', 'Marksmanship', 'Survival'] },
    'Mage': { color: '#69CCF0', image: '', specs: ['Arcane', 'Fire', 'Frost'] },
    'Paladin': { color: '#F58CBA', image: '', specs: ['Holy (Paladin)', 'Protection (Paladin)', 'Retribution'] },
    'Priest': { color: '#FFFFFF', image: '', specs: ['Discipline', 'Holy', 'Shadow', 'Smite'] },
    'Rogue': { color: '#FFF569', image: '', specs: ['Assassination', 'Combat', 'Subtlety'] },
    'Shaman': { color: '#0070DE', image: '', specs: ['Elemental', 'Enhancement', 'Restoration (Shaman)'] },
    'Warlock': { color: '#9482C9', image: '', specs: ['Affliction', 'Demon', 'Destruction', 'SM Ruin'] },
    'Warrior': { color: '#C79C6E', image: '', specs: ['Arms', 'Fury', 'Protection'] }
};

export const CLASS_RACES: Record<ClassName, RaceName[]> = {
    'Druid': ['Night Elf', 'Tauren'],
    'Hunter': ['Dwarf', 'Night Elf', 'Orc', 'Tauren', 'Troll'],
    'Mage': ['Human', 'Gnome', 'Undead', 'Troll'],
    'Paladin': ['Human', 'Dwarf'],
    'Priest': ['Human', 'Dwarf', 'Night Elf', 'Undead', 'Troll'],
    'Rogue': ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Troll'],
    'Shaman': ['Orc', 'Tauren', 'Troll'],
    'Warlock': ['Human', 'Gnome', 'Orc', 'Undead'],
    'Warrior': ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Tauren', 'Troll']
};

export const CLASS_RACES_TURTLE: Record<ClassName, RaceName[]> = {
    ...CLASS_RACES,
    'Mage': ['Human', 'Gnome', 'High Elf', 'Undead', 'Troll', 'Goblin'],
    'Rogue': ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'High Elf', 'Orc', 'Undead', 'Troll', 'Goblin'],
    'Warlock': ['Human', 'Gnome', 'High Elf', 'Orc', 'Undead', 'Goblin'],
    'Priest': ['Human', 'Dwarf', 'Night Elf', 'High Elf', 'Undead', 'Troll'],
    'Warrior': ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'High Elf', 'Orc', 'Undead', 'Tauren', 'Troll', 'Goblin'],
    'Hunter': ['Dwarf', 'Night Elf', 'High Elf', 'Orc', 'Tauren', 'Troll', 'Goblin'],
    'Shaman': ['Orc', 'Tauren', 'Troll', 'Goblin', 'Dwarf']
};

export const CLASS_PROFICIENCIES: Record<ClassName, { armor: string[], weapons: string[] }> = {
    'Druid': { 
        armor: ['Cloth', 'Leather'], 
        weapons: ['Staff', 'Mace', 'Dagger', 'Fist Weapon', 'Idol', 'Polearm'] 
    },
    'Hunter': { 
        armor: ['Cloth', 'Leather', 'Mail'], 
        weapons: ['Axe', 'Sword', 'Dagger', 'Polearm', 'Staff', 'Fist Weapon', 'Bow', 'Crossbow', 'Gun', 'Thrown'] 
    },
    'Mage': { 
        armor: ['Cloth'], 
        weapons: ['Staff', 'Sword', 'Dagger', 'Wand'] 
    },
    'Paladin': { 
        armor: ['Cloth', 'Leather', 'Mail', 'Plate'], 
        weapons: ['Mace', 'Sword', 'Axe', 'Polearm', 'Shield', 'Libram'] 
    },
    'Priest': { 
        armor: ['Cloth'], 
        weapons: ['Staff', 'Mace', 'Dagger', 'Wand'] 
    },
    'Rogue': { 
        armor: ['Cloth', 'Leather'], 
        weapons: ['Sword', 'Mace', 'Dagger', 'Fist Weapon', 'Bow', 'Crossbow', 'Gun', 'Thrown'] 
    },
    'Shaman': { 
        armor: ['Cloth', 'Leather', 'Mail'], 
        weapons: ['Mace', 'Axe', 'Staff', 'Dagger', 'Fist Weapon', 'Shield', 'Totem'] 
    },
    'Warlock': { 
        armor: ['Cloth'], 
        weapons: ['Staff', 'Sword', 'Dagger', 'Wand'] 
    },
    'Warrior': { 
        armor: ['Cloth', 'Leather', 'Mail', 'Plate'], 
        weapons: ['Axe', 'Sword', 'Mace', 'Dagger', 'Polearm', 'Staff', 'Fist Weapon', 'Shield', 'Bow', 'Crossbow', 'Gun', 'Thrown'] 
    }
};

export const RACIAL_STATS: Record<RaceName, ItemStats> = {
    'Human': { spiritMod: 5, swordSkill: 5, maceSkill: 5 },
    'Dwarf': { gunSkill: 5, frostRes: 10 },
    'Night Elf': { dodge: 1, natureRes: 10 },
    'Gnome': { intMod: 5, arcaneRes: 10, engineering: 15 },
    'Orc': { axeSkill: 5, petDamage: 5 },
    'Undead': { shadowRes: 10 },
    'Tauren': { healthMod: 5, natureRes: 10, herbalism: 15 },
    'Troll': { bowSkill: 5, healthRegen: 10, beastSlaying: 5 },
    'High Elf': { int: 5, meditation: 10 }, 
    'Goblin': { alchemy: 15, mining: 5 }
};

export const BASE_STATS: Record<ClassName, { str: number, agi: number, sta: number, int: number, spi: number, hp: number, mp: number, critDivisor: number }> = {
    'Druid': { str: 81, agi: 65, sta: 85, int: 120, spi: 135, hp: 1600, mp: 2400, critDivisor: 60 },
    'Hunter': { str: 70, agi: 140, sta: 100, int: 80, spi: 85, hp: 1550, mp: 1800, critDivisor: 53 },
    'Mage': { str: 40, agi: 50, sta: 60, int: 165, spi: 140, hp: 1450, mp: 2700, critDivisor: 59.5 },
    'Paladin': { str: 120, agi: 70, sta: 110, int: 85, spi: 95, hp: 1700, mp: 1800, critDivisor: 29 }, 
    'Priest': { str: 45, agi: 50, sta: 65, int: 155, spi: 150, hp: 1450, mp: 2750, critDivisor: 59.2 },
    'Rogue': { str: 100, agi: 150, sta: 90, int: 30, spi: 50, hp: 1650, mp: 0, critDivisor: 29 },
    'Shaman': { str: 105, agi: 65, sta: 105, int: 105, spi: 115, hp: 1600, mp: 2300, critDivisor: 59.5 }, 
    'Warlock': { str: 55, agi: 60, sta: 95, int: 145, spi: 135, hp: 1550, mp: 2600, critDivisor: 60.6 },
    'Warrior': { str: 145, agi: 95, sta: 130, int: 30, spi: 45, hp: 1900, mp: 0, critDivisor: 20 }
};

// --- EP (Equivalence Points) WEIGHTS ---
// Normalized where 1 EP = 1 Spell Power or 1 Attack Power
// Hit is artificially inflated to ensure it is prioritized until cap
export const STAT_WEIGHTS: Record<string, StatWeights> = {
    // --- WARLOCK ---
    // Hit is massive (18 EP) until capped. 
    // SM Ruin values Crit (14 EP) higher than Haste due to Ruin talent (100% crit damage bonus).
    'SM Ruin': { 
        sp: 1, spShadow: 1, 
        hit: 18, crit: 14, haste: 10, 
        int: 0.35, stam: 0.2, spirit: 0.1 
    },
    // Affliction values raw power for DoTs. Crit is less valuable (DoTs don't crit in Vanilla).
    'Affliction': { 
        sp: 1, spShadow: 1, 
        hit: 18, haste: 12, crit: 6, 
        int: 0.3, stam: 0.25, spirit: 0.15 
    },
    'Destruction': { 
        sp: 1, spFire: 1, spShadow: 0.9,
        hit: 18, crit: 15, haste: 11, 
        int: 0.35, stam: 0.1 
    },
    'Demon': { sp: 1, spShadow: 1, stam: 1.5, int: 0.5, hit: 12, crit: 10, haste: 8 },

    // --- MAGE ---
    'Frost': { 
        sp: 1, spFrost: 1, 
        hit: 16, crit: 11, haste: 9, 
        int: 0.25, spirit: 0.1 
    },
    'Fire': { 
        sp: 1, spFire: 1, 
        hit: 16, crit: 15, haste: 10, // Crit very high for Ignite rolling
        int: 0.25, spirit: 0.1 
    },
    'Arcane': { 
        sp: 1, spArcane: 1, 
        hit: 14, crit: 10, haste: 8, 
        int: 0.8, spirit: 0.3 // Int provides raw damage via Mind Mastery (Turtle) or deep mana pool
    },

    // --- PRIEST ---
    'Shadow': { 
        sp: 1, spShadow: 1, 
        hit: 16, crit: 9, haste: 8, 
        int: 0.3, spirit: 0.2 
    },
    'Holy': { 
        healing: 1, sp: 0.55, 
        mp5: 4.0, int: 0.6, spirit: 0.8, // Efficiency & Throughput
        crit: 6 
    },
    'Discipline': { 
        healing: 1, sp: 0.55, 
        int: 0.7, mp5: 3.0, spirit: 0.6, 
        crit: 8 // Divine Aegis / Inspiration logic
    },
    'Smite': { sp: 1, spHoly: 1, hit: 14, crit: 13, haste: 12, int: 0.3 },

    // --- ROGUE ---
    // Agility is King for Rogues (1 Agi = 1 AP + Crit + Dodge)
    'Combat': { 
        ap: 1, 
        hit: 18, // Until yellow cap
        agi: 2.2, str: 1.1, 
        crit: 22, haste: 18
    },
    'Assassination': { ap: 1, hit: 16, agi: 2.3, str: 1.05, crit: 24 },
    'Subtlety': { ap: 1, agi: 2.4, crit: 20, hit: 14 },

    // --- WARRIOR ---
    'Fury': { 
        ap: 1, 
        hit: 20, // Huge value until cap to support Heroic Strike queuing
        crit: 30, // Flurry uptime
        str: 2.1, agi: 1.6, haste: 15 
    },
    'Arms': { ap: 1, hit: 15, crit: 26, str: 2.1, agi: 1.4 },
    // TMI / Mitigation Logic for Tanks
    'Protection': { 
        stam: 10, // Effective Health
        defense: 8, // Avoidance/Uncrit
        agi: 4, str: 2, 
        dodge: 12, parry: 12, block: 8, 
        armor: 0.5, hit: 5 
    },

    // --- HUNTER ---
    'Marksmanship': { 
        ap: 1, rangedAp: 1, 
        agi: 2.2, 
        hit: 25, // Ranged hit cap is vital
        crit: 28, int: 0.2 
    },
    'Beast Mastery': { ap: 1, rangedAp: 1, agi: 2.0, crit: 22, hit: 20 },
    'Survival': { ap: 1, rangedAp: 1, agi: 2.5, crit: 24, hit: 20 },

    // --- SHAMAN ---
    'Restoration (Shaman)': { healing: 1, mp5: 3.5, int: 0.6, crit: 5 },
    'Elemental': { 
        sp: 1, spNature: 1, spFire: 0.8, 
        hit: 15, crit: 12, haste: 10, 
        int: 0.35 
    },
    'Enhancement': { ap: 1, str: 2.1, agi: 1.7, crit: 24, hit: 18, sp: 0.3 },

    // --- DRUID ---
    'Feral': { 
        ap: 1, 
        str: 2.4, // Str gives 2 AP
        agi: 1.2, // Crit scaling
        hit: 18, crit: 22, 
        haste: 14 
    },
    'Balance': { 
        sp: 1, spArcane: 1, spNature: 1, 
        hit: 15, crit: 13, haste: 11, 
        int: 0.4 
    },
    'Restoration': { healing: 1, spirit: 0.9, int: 0.6, mp5: 3.0, crit: 5 },

    // --- PALADIN ---
    'Retribution': { 
        ap: 1, 
        str: 2.1, agi: 1.2, 
        hit: 18, crit: 22, 
        sp: 0.4, spHoly: 0.3 
    },
    'Protection (Paladin)': { 
        sp: 1.2, // Threat
        stam: 8, defense: 6, 
        block: 5, armor: 0.4 
    },
    'Holy (Paladin)': { 
        healing: 1, 
        crit: 12, // Illumination Mana Refund is huge
        int: 0.7, mp5: 2.5 
    } 
};

// --- ITEM EP OVERRIDES ---
// Manual EP values for items whose true value comes from on-use/proc effects
// that cannot be captured by flat stat parsing alone.
// Keys: item name (case-sensitive). Values: EP per role archetype.
// These override the calculated score entirely when present for the matching role.
export const ITEM_EP_OVERRIDES: Record<string, { caster_dps?: number, melee_dps?: number, healer?: number, tank?: number }> = {
    // === TRINKETS ===
    // --- Caster Trinkets ---
    "Talisman of Ephemeral Power": { caster_dps: 95, healer: 60 },  // Use: +175 SP for 15s (2m CD) → avg 21.9 SP + burst value
    "Zandalarian Hero Charm": { caster_dps: 85, healer: 70 },       // Use: 204 SP over 20s (2m CD) → avg ~17 SP + stacks with casts
    "Neltharion's Tear": { caster_dps: 120 },                       // +44 SP, +2% Hit = 44 + 36 = 80 base + best caster trinket status
    "Eye of the Beast": { caster_dps: 55 },                         // +34 SP passive
    "Briarwood Reed": { caster_dps: 40 },                           // +29 SP passive — decent but outclassed by above
    "Mind Quickening Gem": { caster_dps: 90 },                      // Use: +33% Haste for 20s (5m CD) — massive burst
    "Draconic Emblem": { caster_dps: 10, healer: 10 },              // Proc: absorb shield — defensive, low DPS value
    "Royal Seal of Eldre'Thalas": { caster_dps: 30 },               // +22 SP passive
    "Hazza'rah's Charm of Destruction": { caster_dps: 50 },         // Proc: +35% crit for 10s — very strong for casters
    "Tear of the Goddess": { caster_dps: 20, healer: 35 },          // +24 Int, mana regen effect
    "Jewel of Kajaro": { caster_dps: 45 },                          // Use: +11 SP + dodge — Turtle WoW
    "Mark of the Dragon Lord": { caster_dps: 35 },                   // Proc: absorb — some value
    "Burst of Knowledge": { caster_dps: 25, healer: 40 },           // Use: mana return — more healer value
    "Hibernation Crystal": { caster_dps: 15, healer: 30 },          // Mana regen trinket

    // --- Healer Trinkets ---
    "Rejuvenating Gem": { healer: 95 },                             // Use: instant 750 mana (2m CD) + mp5 value
    "Shard of the Scale": { healer: 80 },                           // +22 Healing + mana regen proc
    "Scrolls of Blinding Light": { healer: 55, caster_dps: 25 },    // Use: +100 Healing for 15s (2m CD) + AoE component
    "Mindtap Talisman": { healer: 50 },                             // Proc: mana restoration

    // --- Melee Trinkets ---
    "Drake Fang Talisman": { melee_dps: 120 },                      // +56 AP, +2% Hit, +1% Dodge — best in slot
    "Blackhand's Breadth": { melee_dps: 70 },                       // +2% Crit passive
    "Hand of Justice": { melee_dps: 80 },                           // +20 AP + extra attack proc (massive for Rogues/Warriors)
    "Diamond Flask": { melee_dps: 75, tank: 60 },                   // Use: +75 Str for 60s (6m CD) → avg 12.5 Str
    "Earthstrike": { melee_dps: 85 },                               // Use: +280 AP for 20s (2m CD) → avg 46.7 AP + burst
    "Kiss of the Spider": { melee_dps: 100 },                       // Use: +200 AP + 10% Haste for 15s — Naxx best
    "Slayer's Crest": { melee_dps: 90 },                            // Use: +260 AP for 20s (2m CD) + passive AP
    "Jom Gabbar": { melee_dps: 85 },                                // Use: stacking AP buff
    "Badge of the Swarmguard": { melee_dps: 95 },                   // Use: armor pen proc — amazing vs bosses
    "Rune of the Dawn": { melee_dps: 15 },                          // Undead only value
    "Counterattack Lodestone": { melee_dps: 50 },                   // Proc: +AP on dodge
    "Devilsaur Eye": { melee_dps: 50 },                             // +2% Hit from quest chain
    // --- Tank Trinkets ---
    "Lifegiving Gem": { tank: 100 },                                // Use: +1500 HP for 20s — panic button
    "Mark of Tyranny": { tank: 85 },                                // +180 Armor passive — massive mitigation
    "Vigilance Charm": { tank: 60 },                                // Proc: absorb on block
    "Styleen's Impeding Scarab": { tank: 70 },                      // Proc: absorb on hit
    "Uther's Strength": { tank: 55 },                               // +Stam + block
    "Force of Will": { tank: 65 },                                  // +Stam + proc: absorb shield
    "Smoking Heart of the Mountain": { tank: 50 },                  // +150 Armor passive

    // === WEAPONS WITH PROCS ===
    "Perdition's Blade": { melee_dps: 130 },                        // Top rogue MH dagger + fast speed for poison
    "Core Hound Tooth": { melee_dps: 110 },                         // Fast OH dagger, +20 hit pseudo-value
    "Vis'kag the Bloodletter": { melee_dps: 100 },                  // Proc: extra attack
    "Chromatically Tempered Sword": { melee_dps: 105 },             // +14 AP + 1% crit + fast
    "Thunderfury, Blessed Blade of the Windseeker": { tank: 200, melee_dps: 80 }, // Proc: nature damage + threat + slow
    "Maladath, Runed Blade of the Black Flight": { melee_dps: 85 }, // +4 Sword Skill = ~3% Hit
    "Deathbringer": { melee_dps: 95 },                              // Proc: shadow bolt
    "Gutgore Ripper": { melee_dps: 70 },                            // Proc: shadow bolt
    "Doom's Edge": { melee_dps: 75 },                               // +16 AP + speed
    "Ancient Qiraji Ripper": { melee_dps: 110 },                    // AQ40 top dagger
    "Death's Sting": { melee_dps: 115 },                            // AQ40 best rogue dagger
    "Gressil, Dawn of Ruin": { melee_dps: 130 },                    // Naxx best 1H sword
    "The Hungering Cold": { melee_dps: 125 },                       // Naxx best 1H dagger alternative

    // === CASTER WEAPONS WITH EFFECTS ===
    "Staff of the Shadow Flame": { caster_dps: 130 },               // +84 SP + shadow bolt proc
    "Atiesh, Greatstaff of the Guardian": { caster_dps: 140, healer: 130 }, // Naxx legendary staff
    "Crul'Shorukh, Edge of Chaos": { melee_dps: 120 },              // BWL top MH
    "Anathema": { caster_dps: 60 },                                 // +69 SP staff
    "Lok'amir il Romathis": { caster_dps: 75, healer: 90 },         // +18 SP/Healing + heal proc
};

export const RARITY_WEIGHTS: Record<string, StatWeights> = {
    'legendary': { sp: 1.5, ap: 1.5 },
    'epic': { sp: 1.2, ap: 1.2 },
    'rare': { sp: 1, ap: 1 },
    'uncommon': { sp: 0.8, ap: 0.8 },
    'common': { sp: 0.5, ap: 0.5 }
};

export const CONSUMABLE_DATABASE: Consumable[] = [
    { name: "Flask of Supreme Power", icon: "inv_potion_41", category: "Flask", stats: { sp: 70 }, description: "+70 Spell Power for 2 hrs", exclusivityGroup: "Flask" },
    { name: "Flask of the Titans", icon: "inv_potion_62", category: "Flask", stats: { health: 1200 }, description: "+1200 Max Health for 2 hrs", exclusivityGroup: "Flask" },
    { name: "Flask of Distilled Wisdom", icon: "inv_potion_29", category: "Flask", stats: { mana: 2000 }, description: "+2000 Max Mana for 2 hrs", exclusivityGroup: "Flask" },
    { name: "Greater Arcane Elixir", icon: "inv_potion_25", category: "Elixir", stats: { sp: 35 }, description: "+35 Spell Power for 1 hr" },
    { name: "Elixir of Shadow Power", icon: "inv_potion_46", category: "Elixir", stats: { spShadow: 40 }, description: "+40 Shadow Power for 30 min" },
    { name: "Elixir of the Mongoose", icon: "inv_potion_32", category: "Elixir", stats: { agi: 25, crit: 2 }, description: "+25 Agi, +2% Crit" },
    { name: "Mageblood Potion", icon: "inv_potion_45", category: "Potion", stats: { mp5: 12 }, description: "+12 Mana per 5 sec for 1 hr", exclusivityGroup: "Mageblood" },
    { name: "Mighty Rage Potion", icon: "inv_potion_41", category: "Potion", stats: { str: 60 }, description: "Instantly gain Rage and +60 Str for 20 sec" },
    { name: "Greater Fire Protection Potion", icon: "inv_potion_24", category: "Potion", stats: { resFire: 0 }, description: "Absorbs 1950-3250 Fire Damage" },
    { name: "Greater Nature Protection Potion", icon: "inv_potion_22", category: "Potion", stats: { resNature: 0 }, description: "Absorbs 1950-3250 Nature Damage" },
    { name: "Greater Shadow Protection Potion", icon: "inv_potion_23", category: "Potion", stats: { resShadow: 0 }, description: "Absorbs 1950-3250 Shadow Damage" },
    { name: "Restorative Potion", icon: "inv_potion_01", category: "Potion", stats: {}, description: "Removes 1 magic, curse, poison, or disease effect." },
    { name: "Juju Power", icon: "inv_misc_monsterclaw_04", category: "Other", stats: { str: 30 }, description: "+30 Strength", exclusivityGroup: "StrBuff" },
    { name: "Juju Might", icon: "inv_misc_monsterclaw_03", category: "Other", stats: { ap: 40 }, description: "+40 Attack Power", exclusivityGroup: "APBuff" },
    { name: "Runn Tum Tuber Surprise", icon: "inv_misc_food_64", category: "Food", stats: { int: 10 }, description: "+10 Intellect", exclusivityGroup: "Food" },
    { name: "Nightfin Soup", icon: "inv_drink_09", category: "Food", stats: { mp5: 8 }, description: "+8 Mana per 5 sec", exclusivityGroup: "Food" },
    { name: "Smoked Desert Dumplings", icon: "inv_misc_food_64", category: "Food", stats: { str: 20 }, description: "+20 Strength", exclusivityGroup: "Food" },
    { name: "Rallying Cry of the Dragonslayer", icon: "inv_misc_head_dragon_01", category: "World Buff", stats: { crit: 10, ap: 140, spellCrit: 5 }, description: "+10% Crit, +140 AP, +5% Spell Crit" },
    { name: "Songflower Serenade", icon: "spell_holy_mindvision", category: "World Buff", stats: { crit: 5, str: 15, agi: 15, stam: 15, int: 15, spirit: 15 }, description: "+5% Crit, +15 All Stats" },
    { name: "Warchief's Blessing", icon: "spell_arcane_teleportorgrimmar", category: "World Buff", stats: { health: 300, mp5: 10 }, description: "+300 HP, +10 MP5" },
    { name: "Spirit of Zandalar", icon: "inv_jewelry_necklace_13", category: "World Buff", stats: { str: 0, agi: 0, stam: 0, int: 0, spirit: 0, statMultiplier: 0.10 }, description: "+10% All Stats" },
    { name: "Sayge's Dark Fortune of Damage", icon: "inv_misc_orb_02", category: "World Buff", stats: { damagePercent: 10 }, description: "+10% Damage" }
];

export const ENCHANT_DATABASE: Enchant[] = [
    // Head/Legs (ZG/Librams)
    { id: 100, name: "Presence of Sight", text: "+18 Healing/SP, +1% Hit", stats: { healing: 18, sp: 18, hit: 1 }, slots: ["Head", "Legs"], icon: "inv_misc_gem_pearl_04" },
    { id: 101, name: "Hoodoo Hex", text: "+18 Healing/SP, +10 Stam", stats: { healing: 18, sp: 18, stam: 10 }, slots: ["Head", "Legs"], icon: "inv_misc_gem_pearl_06" },
    { id: 102, name: "Prophetic Aura", text: "+24 Healing, +10 Stam, +4 MP5", stats: { healing: 24, stam: 10, mp5: 4 }, slots: ["Head", "Legs"], icon: "inv_misc_gem_pearl_05" },
    { id: 103, name: "Falcon's Call", text: "+24 Ranged AP, +10 Stam, +1% Hit", stats: { rangedAp: 24, stam: 10, hit: 1 }, slots: ["Head", "Legs"], icon: "inv_misc_gem_pearl_02" },
    { id: 104, name: "Death's Embrace", text: "+28 AP, +1% Dodge", stats: { ap: 28, dodge: 1 }, slots: ["Head", "Legs"], icon: "inv_misc_gem_pearl_03" },
    { id: 105, name: "Arcanum of Focus", text: "+8 SP/Healing", stats: { sp: 8 }, slots: ["Head", "Legs"], icon: "inv_misc_book_09" },
    
    // Shoulder (Zandalar/Argent Dawn)
    { id: 200, name: "Zandalar Signet of Mojo", text: "+18 SP/Healing", stats: { sp: 18 }, slots: ["Shoulder"], icon: "inv_misc_gem_pearl_04" },
    { id: 201, name: "Zandalar Signet of Might", text: "+30 AP", stats: { ap: 30 }, slots: ["Shoulder"], icon: "inv_misc_gem_pearl_03" },
    { id: 202, name: "Zandalar Signet of Serenity", text: "+33 Healing", stats: { healing: 33 }, slots: ["Shoulder"], icon: "inv_misc_gem_pearl_05" },
    { id: 203, name: "Chromatic Mantle of the Dawn", text: "+5 All Res", stats: { resFire: 5, resFrost: 5, resNature: 5, resShadow: 5, resArcane: 5 }, slots: ["Shoulder"], icon: "inv_misc_gem_pearl_06" },

    // Cloak
    { id: 300, name: "Subtlety", text: "-2% Threat", stats: { threatReduction: 2 }, slots: ["Back"], icon: "spell_magic_lesserinvisibilty" },
    { id: 301, name: "Greater Resistance", text: "+5 All Res", stats: { resFire: 5, resFrost: 5, resNature: 5, resShadow: 5, resArcane: 5 }, slots: ["Back"], icon: "spell_nature_resistnature" },
    { id: 302, name: "Dodge", text: "+1% Dodge", stats: { dodge: 1 }, slots: ["Back"], icon: "spell_nature_invisibilty" },

    // Chest
    { id: 400, name: "Greater Stats", text: "+4 All Stats", stats: { int: 4, stam: 4, spirit: 4, str: 4, agi: 4 }, slots: ["Chest"], icon: "spell_holy_blessingofprotection" },
    { id: 401, name: "Major Health", text: "+100 Health", stats: { health: 100 }, slots: ["Chest"], icon: "spell_holy_sealofsacrifice" },
    { id: 402, name: "Major Mana", text: "+100 Mana", stats: { mana: 100 }, slots: ["Chest"], icon: "spell_nature_mana" },

    // Wrist
    { id: 500, name: "Greater Intellect", text: "+7 Intellect", stats: { int: 7 }, slots: ["Wrist"], icon: "inv_scroll_03" },
    { id: 501, name: "Superior Spirit", text: "+9 Spirit", stats: { spirit: 9 }, slots: ["Wrist"], icon: "inv_scroll_03" },
    { id: 502, name: "Superior Strength", text: "+9 Strength", stats: { str: 9 }, slots: ["Wrist"], icon: "inv_scroll_03" },
    { id: 503, name: "Mana Regeneration", text: "+4 MP5", stats: { mp5: 4 }, slots: ["Wrist"], icon: "inv_scroll_03" },
    // TURTLE WOW WRIST ENCHANTS
    { id: 550, name: "Greater Spellpower", text: "+9 Spell Power", stats: { sp: 9 }, slots: ["Wrist"], icon: "inv_misc_book_09", realm: "Turtle" },
    { id: 551, name: "Greater Healing", text: "+24 Healing", stats: { healing: 24 }, slots: ["Wrist"], icon: "inv_misc_book_10", realm: "Turtle" },
    { id: 552, name: "Greater Agility", text: "+7 Agility", stats: { agi: 7 }, slots: ["Wrist"], icon: "inv_scroll_03", realm: "Turtle" },

    // Gloves
    { id: 600, name: "Greater Agility", text: "+7 Agility", stats: { agi: 7 }, slots: ["Hands"], icon: "inv_scroll_03" },
    { id: 601, name: "Greater Strength", text: "+7 Strength", stats: { str: 7 }, slots: ["Hands"], icon: "inv_scroll_03" },
    { id: 602, name: "Shadow Power", text: "+20 Shadow SP", stats: { spShadow: 20 }, slots: ["Hands"], icon: "spell_shadow_shadowbolt" },
    { id: 603, name: "Fire Power", text: "+20 Fire SP", stats: { spFire: 20 }, slots: ["Hands"], icon: "spell_fire_fireball" },
    { id: 604, name: "Frost Power", text: "+20 Frost SP", stats: { spFrost: 20 }, slots: ["Hands"], icon: "spell_frost_frostbolt02" },
    { id: 605, name: "Healing Power", text: "+30 Healing", stats: { healing: 30 }, slots: ["Hands"], icon: "spell_holy_heal" },
    { id: 606, name: "Riding Skill", text: "Minor Move Speed", stats: { speed: 2 }, slots: ["Hands"], icon: "spell_nature_swiftness" },
    
    // Boots
    { id: 700, name: "Minor Speed", text: "+8% Run Speed", stats: { speed: 8 }, slots: ["Feet"], icon: "spell_nature_swiftness" },
    { id: 701, name: "Greater Stamina", text: "+7 Stamina", stats: { stam: 7 }, slots: ["Feet"], icon: "inv_scroll_03" },
    { id: 702, name: "Spirit", text: "+5 Spirit", stats: { spirit: 5 }, slots: ["Feet"], icon: "inv_scroll_03" },
    { id: 703, name: "Greater Agility", text: "+7 Agility", stats: { agi: 7 }, slots: ["Feet"], icon: "inv_scroll_03" },

    // Weapon
    { id: 800, name: "Spell Power", text: "+30 Spell Power", stats: { sp: 30 }, slots: ["Main Hand", "MainHand", "One-Hand", "Two-Hand", "Staff"], icon: "spell_holy_greaterheal" },
    { id: 801, name: "Healing Power", text: "+55 Healing", stats: { healing: 55 }, slots: ["Main Hand", "MainHand", "One-Hand", "Two-Hand", "Staff"], icon: "spell_holy_heal" },
    { id: 802, name: "Crusader", text: "Proc: +100 Str, Heal", stats: {}, proc: "Chance on hit: +100 Str and heal for 75-125.", slots: ["Main Hand", "MainHand", "One-Hand", "Two-Hand"], icon: "spell_holy_blessingofstrength" },
    { id: 803, name: "Agility", text: "+15 Agility", stats: { agi: 15 }, slots: ["Main Hand", "MainHand", "One-Hand", "Two-Hand", "Staff"], icon: "spell_nature_lightning" },
    { id: 804, name: "Strength", text: "+15 Strength", stats: { str: 15 }, slots: ["Main Hand", "MainHand", "One-Hand", "Two-Hand"], icon: "spell_nature_strength" },
    { id: 805, name: "Superior Striking", text: "+5 Damage", stats: { minDmg: 5, maxDmg: 5 }, slots: ["Main Hand", "MainHand", "One-Hand", "Two-Hand"], icon: "ability_meleedamage" },
    { id: 806, name: "Intellect", text: "+22 Intellect", stats: { int: 22 }, slots: ["Two-Hand", "Staff"], icon: "spell_holy_magicalsentry" },
    { id: 807, name: "Spirit", text: "+20 Spirit", stats: { spirit: 20 }, slots: ["Two-Hand", "Staff"], icon: "spell_holy_divinespirit" },

    // Shield
    { id: 900, name: "Greater Stamina", text: "+7 Stamina", stats: { stam: 7 }, slots: ["Shield", "Off Hand"], icon: "spell_nature_unyeildingstamina" },
    { id: 901, name: "Greater Intellect", text: "+7 Intellect", stats: { int: 7 }, slots: ["Shield", "Off Hand"], icon: "spell_holy_magicalsentry" },
];

export const SET_DATABASE: Record<string, ItemSet> = {
    // ===== TIER 1 (Molten Core) =====
    "Felheart Raiment": {
        name: "Felheart Raiment",
        items: ["Felheart Horns", "Felheart Shoulder Pads", "Felheart Robes", "Felheart Bracers", "Felheart Gloves", "Felheart Belt", "Felheart Pants", "Felheart Slippers"],
        bonuses: [
            { threshold: 3, text: "+23 Spell Power", stats: { sp: 23 } },
            { threshold: 5, text: "+15 Stamina, +100 Pet Resistance", stats: { stam: 15 } },
            { threshold: 8, text: "Reduces mana cost of Shadow spells by 15%." }
        ]
    },
    "Arcanist Regalia": {
        name: "Arcanist Regalia",
        items: ["Arcanist Crown", "Arcanist Mantle", "Arcanist Robes", "Arcanist Bindings", "Arcanist Gloves", "Arcanist Belt", "Arcanist Leggings", "Arcanist Boots"],
        bonuses: [
            { threshold: 3, text: "+18 Spell Power", stats: { sp: 18 } },
            { threshold: 5, text: "+20 Fire/Frost/Arcane Resist", stats: {} },
            { threshold: 8, text: "+2% Chance to hit with spells", stats: { hit: 2 } }
        ]
    },
    "Nightslayer Armor": {
        name: "Nightslayer Armor",
        items: ["Nightslayer Cover", "Nightslayer Shoulder Pads", "Nightslayer Chestpiece", "Nightslayer Bracelets", "Nightslayer Gloves", "Nightslayer Belt", "Nightslayer Pants", "Nightslayer Boots"],
        bonuses: [
            { threshold: 3, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 5, text: "+8 Energy on dodge", stats: {} },
            { threshold: 8, text: "Chance on melee hit to heal 35 HP." }
        ]
    },
    "Giantstalker Armor": {
        name: "Giantstalker Armor",
        items: ["Giantstalker's Helmet", "Giantstalker's Epaulets", "Giantstalker's Breastplate", "Giantstalker's Bracers", "Giantstalker's Gloves", "Giantstalker's Belt", "Giantstalker's Leggings", "Giantstalker's Boots"],
        bonuses: [
            { threshold: 3, text: "+15 Stamina", stats: { stam: 15 } },
            { threshold: 5, text: "+40 Ranged Attack Power", stats: { rangedAp: 40 } },
            { threshold: 8, text: "+200 Armor", stats: { armor: 200 } }
        ]
    },
    "Cenarion Raiment": {
        name: "Cenarion Raiment",
        items: ["Cenarion Helm", "Cenarion Spaulders", "Cenarion Vestments", "Cenarion Bracers", "Cenarion Gloves", "Cenarion Belt", "Cenarion Leggings", "Cenarion Boots"],
        bonuses: [
            { threshold: 3, text: "+18 Healing", stats: { healing: 18 } },
            { threshold: 5, text: "+3 MP5", stats: { mp5: 3 } },
            { threshold: 8, text: "Reduces Regrowth cast time by 0.5 sec." }
        ]
    },
    "Vestments of the Prophecy": {
        name: "Vestments of the Prophecy",
        items: ["Circlet of Prophecy", "Mantle of Prophecy", "Robes of Prophecy", "Vambraces of Prophecy", "Gloves of Prophecy", "Girdle of Prophecy", "Pants of Prophecy", "Boots of Prophecy"],
        bonuses: [
            { threshold: 3, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 5, text: "+5 MP5", stats: { mp5: 5 } },
            { threshold: 8, text: "Heal target for 500 on Greater Heal cast." }
        ]
    },
    "Earthfury Raiment": {
        name: "Earthfury Raiment",
        items: ["Earthfury Helmet", "Earthfury Epaulets", "Earthfury Vestments", "Earthfury Bracers", "Earthfury Gauntlets", "Earthfury Belt", "Earthfury Legguards", "Earthfury Boots"],
        bonuses: [
            { threshold: 3, text: "+23 Healing", stats: { healing: 23 } },
            { threshold: 5, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Totems cost 12% less mana." }
        ]
    },
    "Lawbringer Armor": {
        name: "Lawbringer Armor",
        items: ["Lawbringer Helm", "Lawbringer Spaulders", "Lawbringer Chestguard", "Lawbringer Bracers", "Lawbringer Gauntlets", "Lawbringer Belt", "Lawbringer Legplates", "Lawbringer Boots"],
        bonuses: [
            { threshold: 3, text: "+28 Healing", stats: { healing: 28 } },
            { threshold: 5, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Grants a chance to deal 60 extra Holy damage on melee." }
        ]
    },
    "Battlegear of Might": {
        name: "Battlegear of Might",
        items: ["Helm of Might", "Pauldrons of Might", "Breastplate of Might", "Bracers of Might", "Gauntlets of Might", "Belt of Might", "Legplates of Might", "Sabatons of Might"],
        bonuses: [
            { threshold: 3, text: "+30 Attack Power", stats: { ap: 30 } },
            { threshold: 5, text: "+15 Stamina", stats: { stam: 15 } },
            { threshold: 8, text: "Increases threat generated by Sunder Armor by 15%." }
        ]
    },

    // ===== TIER 2 (Blackwing Lair) =====
    "Nemesis Raiment": {
        name: "Nemesis Raiment",
        items: ["Nemesis Skullcap", "Nemesis Spaulders", "Nemesis Robes", "Nemesis Bracers", "Nemesis Gloves", "Nemesis Belt", "Nemesis Leggings", "Nemesis Boots"],
        bonuses: [
            { threshold: 3, text: "+23 Spell Power", stats: { sp: 23 } },
            { threshold: 5, text: "Reduces Shadow Bolt cast time by 0.1 sec." },
            { threshold: 8, text: "+2% Shadow/Fire spell crit", stats: { crit: 2 } }
        ]
    },
    "Netherwind Regalia": {
        name: "Netherwind Regalia",
        items: ["Netherwind Crown", "Netherwind Mantle", "Netherwind Robes", "Netherwind Bindings", "Netherwind Gloves", "Netherwind Belt", "Netherwind Pants", "Netherwind Boots"],
        bonuses: [
            { threshold: 3, text: "+23 Spell Power", stats: { sp: 23 } },
            { threshold: 5, text: "+2% Chance to hit with spells", stats: { hit: 2 } },
            { threshold: 8, text: "10% chance after casting to speed next cast by 0.5s." }
        ]
    },
    "Bloodfang Armor": {
        name: "Bloodfang Armor",
        items: ["Bloodfang Hood", "Bloodfang Spaulders", "Bloodfang Chestpiece", "Bloodfang Bracers", "Bloodfang Gloves", "Bloodfang Belt", "Bloodfang Pants", "Bloodfang Boots"],
        bonuses: [
            { threshold: 3, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 5, text: "+1% Chance to hit", stats: { hit: 1 } },
            { threshold: 8, text: "+2% Crit chance", stats: { crit: 2 } }
        ]
    },
    "Dragonstalker Armor": {
        name: "Dragonstalker Armor",
        items: ["Dragonstalker's Helm", "Dragonstalker's Spaulders", "Dragonstalker's Breastplate", "Dragonstalker's Bracers", "Dragonstalker's Gauntlets", "Dragonstalker's Belt", "Dragonstalker's Legguards", "Dragonstalker's Greaves"],
        bonuses: [
            { threshold: 3, text: "+100 Ranged Attack Power", stats: { rangedAp: 100 } },
            { threshold: 5, text: "+2% Crit chance", stats: { crit: 2 } },
            { threshold: 8, text: "Multi-Shot has 6% chance to stun for 3 sec." }
        ]
    },
    "Stormrage Raiment": {
        name: "Stormrage Raiment",
        items: ["Stormrage Cover", "Stormrage Pauldrons", "Stormrage Chestguard", "Stormrage Bracers", "Stormrage Handguards", "Stormrage Belt", "Stormrage Legguards", "Stormrage Boots"],
        bonuses: [
            { threshold: 3, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 5, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Regrowth HOT has +50% duration." }
        ]
    },
    "Vestments of Transcendence": {
        name: "Vestments of Transcendence",
        items: ["Halo of Transcendence", "Pauldrons of Transcendence", "Robes of Transcendence", "Bindings of Transcendence", "Handguards of Transcendence", "Belt of Transcendence", "Leggings of Transcendence", "Boots of Transcendence"],
        bonuses: [
            { threshold: 3, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 5, text: "+5 MP5", stats: { mp5: 5 } },
            { threshold: 8, text: "Prayer of Healing heals for 10% more." }
        ]
    },
    "The Ten Storms": {
        name: "The Ten Storms",
        items: ["Helmet of Ten Storms", "Epaulets of Ten Storms", "Breastplate of Ten Storms", "Bracers of Ten Storms", "Gauntlets of Ten Storms", "Belt of Ten Storms", "Legplates of Ten Storms", "Greaves of Ten Storms"],
        bonuses: [
            { threshold: 3, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 5, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Chain Heal heals for 30% more on 3rd target." }
        ]
    },
    "Judgement Armor": {
        name: "Judgement Armor",
        items: ["Judgement Crown", "Judgement Spaulders", "Judgement Breastplate", "Judgement Bindings", "Judgement Gauntlets", "Judgement Belt", "Judgement Legplates", "Judgement Sabatons"],
        bonuses: [
            { threshold: 3, text: "+28 Healing", stats: { healing: 28 } },
            { threshold: 5, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Judgement of Light heals for 20% more." }
        ]
    },
    "Battlegear of Wrath": {
        name: "Battlegear of Wrath",
        items: ["Helm of Wrath", "Pauldrons of Wrath", "Breastplate of Wrath", "Bracelets of Wrath", "Gauntlets of Wrath", "Waistband of Wrath", "Legplates of Wrath", "Sabatons of Wrath"],
        bonuses: [
            { threshold: 3, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 5, text: "+1% Crit chance", stats: { crit: 1 } },
            { threshold: 8, text: "Execute cost reduced by 3 rage." }
        ]
    },

    // ===== TIER 2.5 (AQ40) =====
    "Doomcaller's Attire": {
        name: "Doomcaller's Attire",
        items: ["Doomcaller's Circlet", "Doomcaller's Mantle", "Doomcaller's Robes", "Doomcaller's Trousers", "Doomcaller's Footwraps"],
        bonuses: [
            { threshold: 3, text: "+23 Spell Power", stats: { sp: 23 } },
            { threshold: 5, text: "Corruption has +4% chance to crit", stats: {} }
        ]
    },
    "Enigma Vestments": {
        name: "Enigma Vestments",
        items: ["Enigma Circlet", "Enigma Shoulderpads", "Enigma Robes", "Enigma Leggings", "Enigma Boots"],
        bonuses: [
            { threshold: 3, text: "+23 Spell Power", stats: { sp: 23 } },
            { threshold: 5, text: "Evocation cooldown reduced by 1 min." }
        ]
    },
    "Trappings of the Oracle": {
        name: "Trappings of the Oracle",
        items: ["Tiara of the Oracle", "Mantle of the Oracle", "Vestments of the Oracle", "Trousers of the Oracle", "Footwraps of the Oracle"],
        bonuses: [
            { threshold: 3, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 5, text: "Flash Heal reduced by 0.1 sec." }
        ]
    },
    "Deathdealer's Embrace": {
        name: "Deathdealer's Embrace",
        items: ["Deathdealer's Helm", "Deathdealer's Spaulders", "Deathdealer's Vest", "Deathdealer's Leggings", "Deathdealer's Boots"],
        bonuses: [
            { threshold: 3, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 5, text: "Eviscerate has +3% crit chance." }
        ]
    },
    "Striker's Garb": {
        name: "Striker's Garb",
        items: ["Striker's Diadem", "Striker's Pauldrons", "Striker's Hauberk", "Striker's Leggings", "Striker's Footguards"],
        bonuses: [
            { threshold: 3, text: "+50 Ranged Attack Power", stats: { rangedAp: 50 } },
            { threshold: 5, text: "Rapid Fire cooldown reduced by 2 min." }
        ]
    },
    "Genesis Raiment": {
        name: "Genesis Raiment",
        items: ["Genesis Helm", "Genesis Shoulderpads", "Genesis Vest", "Genesis Trousers", "Genesis Boots"],
        bonuses: [
            { threshold: 3, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 5, text: "Rejuvenation duration +3 sec." }
        ]
    },
    "Stormcaller's Garb": {
        name: "Stormcaller's Garb",
        items: ["Stormcaller's Diadem", "Stormcaller's Pauldrons", "Stormcaller's Hauberk", "Stormcaller's Leggings", "Stormcaller's Footguards"],
        bonuses: [
            { threshold: 3, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 5, text: "Healing Wave cast time reduced by 0.1 sec." }
        ]
    },
    "Avenger's Battlegear": {
        name: "Avenger's Battlegear",
        items: ["Avenger's Crown", "Avenger's Pauldrons", "Avenger's Breastplate", "Avenger's Legguards", "Avenger's Greaves"],
        bonuses: [
            { threshold: 3, text: "+28 Healing", stats: { healing: 28 } },
            { threshold: 5, text: "Holy Light cast time reduced by 0.1 sec." }
        ]
    },
    "Conqueror's Battlegear": {
        name: "Conqueror's Battlegear",
        items: ["Conqueror's Crown", "Conqueror's Spaulders", "Conqueror's Breastplate", "Conqueror's Legguards", "Conqueror's Greaves"],
        bonuses: [
            { threshold: 3, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 5, text: "Slam cast time reduced by 0.2 sec." }
        ]
    },

    // ===== TIER 3 (Naxxramas) =====
    "Plagueheart Raiment": {
        name: "Plagueheart Raiment",
        items: ["Plagueheart Circlet", "Plagueheart Shoulderpads", "Plagueheart Robe", "Plagueheart Bindings", "Plagueheart Gloves", "Plagueheart Belt", "Plagueheart Leggings", "Plagueheart Sandals", "Plagueheart Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+23 Spell Power", stats: { sp: 23 } },
            { threshold: 6, text: "+15 Spell Hit and Crit", stats: { hit: 1, crit: 2 } },
            { threshold: 8, text: "Shadow Bolt crits reduce next Shadow Bolt by 0.5s." }
        ]
    },
    "Frostfire Regalia": {
        name: "Frostfire Regalia",
        items: ["Frostfire Circlet", "Frostfire Shoulderpads", "Frostfire Robe", "Frostfire Bindings", "Frostfire Gloves", "Frostfire Belt", "Frostfire Leggings", "Frostfire Sandals", "Frostfire Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+23 Spell Power", stats: { sp: 23 } },
            { threshold: 6, text: "+2% Hit, +2% Crit", stats: { hit: 2, crit: 2 } },
            { threshold: 8, text: "Mana cost of Frostbolt/Fireball reduced by 10%." }
        ]
    },
    "Bonescythe Armor": {
        name: "Bonescythe Armor",
        items: ["Bonescythe Helmet", "Bonescythe Pauldrons", "Bonescythe Breastplate", "Bonescythe Bracers", "Bonescythe Gauntlets", "Bonescythe Waistguard", "Bonescythe Legplates", "Bonescythe Sabatons", "Bonescythe Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 6, text: "+2% Hit, +2% Crit", stats: { hit: 2, crit: 2 } },
            { threshold: 8, text: "Backstab/Sinister Strike +5% damage." }
        ]
    },
    "Cryptstalker Armor": {
        name: "Cryptstalker Armor",
        items: ["Cryptstalker Headpiece", "Cryptstalker Spaulders", "Cryptstalker Tunic", "Cryptstalker Wristguards", "Cryptstalker Handguards", "Cryptstalker Girdle", "Cryptstalker Legguards", "Cryptstalker Boots", "Cryptstalker Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+100 Ranged AP", stats: { rangedAp: 100 } },
            { threshold: 6, text: "+2% Hit, +2% Crit", stats: { hit: 2, crit: 2 } },
            { threshold: 8, text: "Multi-Shot/Aimed Shot +5% damage." }
        ]
    },
    "Dreamwalker Raiment": {
        name: "Dreamwalker Raiment",
        items: ["Dreamwalker Headpiece", "Dreamwalker Spaulders", "Dreamwalker Tunic", "Dreamwalker Wristguards", "Dreamwalker Handguards", "Dreamwalker Girdle", "Dreamwalker Legguards", "Dreamwalker Boots", "Dreamwalker Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 6, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Rejuvenation has +30% more healing on last tick." }
        ]
    },
    "Vestments of Faith": {
        name: "Vestments of Faith",
        items: ["Circlet of Faith", "Shoulderpads of Faith", "Robe of Faith", "Bindings of Faith", "Gloves of Faith", "Belt of Faith", "Leggings of Faith", "Sandals of Faith", "Ring of Faith"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 6, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Greater Heal has 20% chance to also heal 2 nearby allies." }
        ]
    },
    "Earthshatter Raiment": {
        name: "Earthshatter Raiment",
        items: ["Earthshatter Headpiece", "Earthshatter Spaulders", "Earthshatter Tunic", "Earthshatter Wristguards", "Earthshatter Handguards", "Earthshatter Girdle", "Earthshatter Legguards", "Earthshatter Boots", "Earthshatter Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 6, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Chain Heal +25% healing on 2nd/3rd targets." }
        ]
    },
    "Redemption Armor": {
        name: "Redemption Armor",
        items: ["Redemption Headpiece", "Redemption Spaulders", "Redemption Tunic", "Redemption Wristguards", "Redemption Handguards", "Redemption Girdle", "Redemption Legguards", "Redemption Boots", "Redemption Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+33 Healing", stats: { healing: 33 } },
            { threshold: 6, text: "+4 MP5", stats: { mp5: 4 } },
            { threshold: 8, text: "Flash of Light +20% healing on targets below 50% HP." }
        ]
    },
    "Dreadnaught's Battlegear": {
        name: "Dreadnaught's Battlegear",
        items: ["Dreadnaught Helmet", "Dreadnaught Pauldrons", "Dreadnaught Breastplate", "Dreadnaught Bracers", "Dreadnaught Gauntlets", "Dreadnaught Waistguard", "Dreadnaught Legplates", "Dreadnaught Sabatons", "Dreadnaught Ring"],
        bonuses: [
            { threshold: 2, text: "+10 All Resistances", stats: {} },
            { threshold: 4, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 6, text: "+2% Hit, +2% Crit", stats: { hit: 2, crit: 2 } },
            { threshold: 8, text: "Shield Slam generates 20% more threat." }
        ]
    },

    // ===== ZG / CRAFTED SETS =====
    "Bloodvine Garb": {
        name: "Bloodvine Garb",
        items: ["Bloodvine Vest", "Bloodvine Leggings", "Bloodvine Boots"],
        bonuses: [
            { threshold: 3, text: "+2% Spell Hit (with Tailoring 300)", stats: { hit: 2 } }
        ]
    },
    "Primal Batskin": {
        name: "Primal Batskin",
        items: ["Primal Batskin Jerkin", "Primal Batskin Gloves", "Primal Batskin Bracers"],
        bonuses: [
            { threshold: 3, text: "+1% Crit and +40 Attack Power (with LW 300)", stats: { crit: 1, ap: 40 } }
        ]
    },
    "Blood Tiger Harness": {
        name: "Blood Tiger Harness",
        items: ["Blood Tiger Breastplate", "Blood Tiger Shoulders"],
        bonuses: [
            { threshold: 2, text: "+40 Attack Power, +1% Dodge", stats: { ap: 40 } }
        ]
    },
    "Zandalar Illusionist's Wraps": {
        name: "Zandalar Illusionist's Wraps",
        items: ["Zandalar Illusionist's Robe", "Zandalar Illusionist's Wraps", "Zandalar Illusionist's Mantle"],
        bonuses: [
            { threshold: 2, text: "+18 Spell Power", stats: { sp: 18 } },
            { threshold: 3, text: "+2% Crit", stats: { crit: 2 } }
        ]
    },
    "Zandalar Demoniac's Wraps": {
        name: "Zandalar Demoniac's Wraps",
        items: ["Zandalar Demoniac's Robe", "Zandalar Demoniac's Wraps", "Zandalar Demoniac's Mantle"],
        bonuses: [
            { threshold: 2, text: "+18 Spell Power", stats: { sp: 18 } },
            { threshold: 3, text: "Corruption periodic dmg +2%." }
        ]
    },
    "Zandalar Confessor's Wraps": {
        name: "Zandalar Confessor's Wraps",
        items: ["Zandalar Confessor's Bindings", "Zandalar Confessor's Wraps", "Zandalar Confessor's Mantle"],
        bonuses: [
            { threshold: 2, text: "+23 Healing", stats: { healing: 23 } },
            { threshold: 3, text: "+3 MP5", stats: { mp5: 3 } }
        ]
    },
    "Zandalar Haruspex's Garb": {
        name: "Zandalar Haruspex's Garb",
        items: ["Zandalar Haruspex's Tunic", "Zandalar Haruspex's Bracers", "Zandalar Haruspex's Belt"],
        bonuses: [
            { threshold: 2, text: "+23 Healing", stats: { healing: 23 } },
            { threshold: 3, text: "+3 MP5", stats: { mp5: 3 } }
        ]
    },
    "Zandalar Vindicator's Armaments": {
        name: "Zandalar Vindicator's Armaments",
        items: ["Zandalar Vindicator's Breastplate", "Zandalar Vindicator's Armguards", "Zandalar Vindicator's Belt"],
        bonuses: [
            { threshold: 2, text: "+23 Healing", stats: { healing: 23 } },
            { threshold: 3, text: "+3 MP5", stats: { mp5: 3 } }
        ]
    },
    "Zandalar Augur's Regalia": {
        name: "Zandalar Augur's Regalia",
        items: ["Zandalar Augur's Hauberk", "Zandalar Augur's Bracers", "Zandalar Augur's Belt"],
        bonuses: [
            { threshold: 2, text: "+23 Healing", stats: { healing: 23 } },
            { threshold: 3, text: "+3 MP5", stats: { mp5: 3 } }
        ]
    },
    "Zandalar Freethinker's Armaments": {
        name: "Zandalar Freethinker's Armaments",
        items: ["Zandalar Freethinker's Breastplate", "Zandalar Freethinker's Armguards", "Zandalar Freethinker's Belt"],
        bonuses: [
            { threshold: 2, text: "+23 Healing", stats: { healing: 23 } },
            { threshold: 3, text: "+3 MP5", stats: { mp5: 3 } }
        ]
    },
    "Zandalar Madcap's Mantle": {
        name: "Zandalar Madcap's Mantle",
        items: ["Zandalar Madcap's Tunic", "Zandalar Madcap's Bracers", "Zandalar Madcap's Mantle"],
        bonuses: [
            { threshold: 2, text: "+40 Attack Power", stats: { ap: 40 } },
            { threshold: 3, text: "+2 Energy per tick." }
        ]
    },
    "Zandalar Predator's Mantle": {
        name: "Zandalar Predator's Mantle",
        items: ["Zandalar Predator's Mantle", "Zandalar Predator's Bracers", "Zandalar Predator's Belt"],
        bonuses: [
            { threshold: 2, text: "+50 Ranged AP", stats: { rangedAp: 50 } },
            { threshold: 3, text: "+3% Crit to Aimed Shot", stats: {} }
        ]
    },
};

export const RAID_BUFFS = [
    { id: 'motw', name: 'Mark of the Wild', description: '+12 Stats, +285 Armor, +20 All Resist', icon: 'spell_nature_regeneration' },
    { id: 'fort', name: 'Power Word: Fortitude', description: '+54 Stamina', icon: 'spell_holy_wordfortitude' },
    { id: 'ai', name: 'Arcane Intellect', description: '+31 Intellect', icon: 'spell_holy_magicalsentry' },
    { id: 'spirit', name: 'Divine Spirit', description: '+40 Spirit', icon: 'spell_holy_divinespirit' },
    { id: 'might', name: 'Blessing of Might', description: '+185 Attack Power', icon: 'spell_holy_fistofjustice' },
    { id: 'wisdom', name: 'Blessing of Wisdom', description: '+30 MP5', icon: 'spell_holy_sealofwisdom' },
    { id: 'kings', name: 'Blessing of Kings', description: '+10% All Stats', icon: 'spell_magic_greaterblessingofkings' },
    { id: 'bs', name: 'Battle Shout', description: '+185 Attack Power', icon: 'ability_warrior_battleshout' },
    { id: 'leader', name: 'Leader of the Pack', description: '+3% Melee/Ranged Crit', icon: 'spell_nature_unyeildingstamina' },
    { id: 'moonkin', name: 'Moonkin Aura', description: '+3% Spell Crit', icon: 'spell_nature_starfall' },
    { id: 'trueshot', name: 'Trueshot Aura', description: '+100 Ranged/Melee AP', icon: 'ability_trueshot' },
    { id: 'soa', name: 'Strength of Earth', description: '+77 Strength', icon: 'spell_nature_earthbindtotem' },
    { id: 'goa', name: 'Grace of Air', description: '+77 Agility', icon: 'spell_nature_invisibilitytotem' },
];

export const RAID_DEBUFFS = [
    { id: 'sunder', name: 'Sunder Armor', description: '-2250 Armor (5 stacks)', icon: 'ability_warrior_sunder' },
    { id: 'cor', name: 'Curse of Recklessness', description: '-640 Armor, +90 AP to target', icon: 'spell_shadow_unholystrength' },
    { id: 'coe', name: 'Curse of Elements', description: '-75 Fire/Frost Resist, +10% Fire/Frost dmg', icon: 'spell_shadow_chilltouch' },
    { id: 'cos', name: 'Curse of Shadow', description: '-75 Shadow/Arcane Resist, +10% Shadow/Arcane dmg', icon: 'spell_shadow_curseofachimonde' },
    { id: 'ff', name: 'Faerie Fire', description: '-505 Armor', icon: 'spell_nature_faeriefire' },
    { id: 'annihilator', name: 'Annihilator', description: '-600 Armor (3 stacks)', icon: 'inv_axe_12' },
    { id: 'ip', name: 'Improved Expose Armor', description: '-2550 Armor', icon: 'ability_warrior_riposte' },
    { id: 'nightfall', name: 'Nightfall', description: '+15% Spell Damage on target', icon: 'spell_holy_elunesgrace' },
    { id: 'thunderfury', name: 'Thunderfury', description: '-20% Attack Speed, -247 Nature Dmg', icon: 'inv_sword_39' },
];

// Helper to build reagent entries concisely
const R = (name: string, icon: string, count: number, quality: 'common' | 'uncommon' | 'rare' | 'epic' = 'common') =>
    ({ item: { id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'), name, icon, quality }, count });

export const RECIPE_DATABASE: Recipe[] = [
    // ===== FLASKS =====
    { id: "flask_supreme_power", name: "Flask of Supreme Power", category: "Flask", profession: "Alchemy", icon: "inv_potion_41", yield: 1, reagents: [R("Black Lotus","inv_misc_herb_blacklotus",1,"epic"), R("Dreamfoil","inv_misc_herb_dreamfoil",30), R("Mountain Silversage","inv_misc_herb_mountainsilversage",10), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "flask_distilled_wisdom", name: "Flask of Distilled Wisdom", category: "Flask", profession: "Alchemy", icon: "inv_potion_97", yield: 1, reagents: [R("Black Lotus","inv_misc_herb_blacklotus",1,"epic"), R("Dreamfoil","inv_misc_herb_dreamfoil",30), R("Icecap","inv_misc_herb_icecap",10), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "flask_titans", name: "Flask of the Titans", category: "Flask", profession: "Alchemy", icon: "inv_potion_62", yield: 1, reagents: [R("Black Lotus","inv_misc_herb_blacklotus",1,"epic"), R("Stonescale Oil","inv_potion_81",30), R("Mountain Silversage","inv_misc_herb_mountainsilversage",10), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "flask_chromatic", name: "Flask of Chromatic Resistance", category: "Flask", profession: "Alchemy", icon: "inv_potion_48", yield: 1, reagents: [R("Black Lotus","inv_misc_herb_blacklotus",1,"epic"), R("Mountain Silversage","inv_misc_herb_mountainsilversage",10), R("Dreamfoil","inv_misc_herb_dreamfoil",30), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "flask_petrification", name: "Flask of Petrification", category: "Flask", profession: "Alchemy", icon: "inv_potion_26", yield: 1, reagents: [R("Black Lotus","inv_misc_herb_blacklotus",1,"epic"), R("Stonescale Oil","inv_potion_81",30), R("Mountain Silversage","inv_misc_herb_mountainsilversage",10), R("Crystal Vial","inv_alchemy_crystalvial",1)] },

    // ===== ELIXIRS =====
    { id: "elixir_greater_arcane", name: "Greater Arcane Elixir", category: "Elixir", profession: "Alchemy", icon: "inv_potion_25", yield: 1, reagents: [R("Dreamfoil","inv_misc_herb_dreamfoil",3), R("Mountain Silversage","inv_misc_herb_mountainsilversage",1), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "elixir_shadow_power", name: "Elixir of Shadow Power", category: "Elixir", profession: "Alchemy", icon: "inv_potion_46", yield: 1, reagents: [R("Ghost Mushroom","inv_misc_herb_ghostmushroom",3,"uncommon"), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "elixir_greater_firepower", name: "Elixir of Greater Firepower", category: "Elixir", profession: "Alchemy", icon: "inv_potion_60", yield: 1, reagents: [R("Fire Oil","inv_potion_32",3), R("Firebloom","inv_misc_herb_firebloom",3), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "elixir_mongoose", name: "Elixir of the Mongoose", category: "Elixir", profession: "Alchemy", icon: "inv_potion_32", yield: 1, reagents: [R("Mountain Silversage","inv_misc_herb_mountainsilversage",2), R("Plaguebloom","inv_misc_herb_plaguebloom",2), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "elixir_brute_force", name: "Elixir of Brute Force", category: "Elixir", profession: "Alchemy", icon: "inv_potion_40", yield: 1, reagents: [R("Gromsblood","inv_misc_herb_gromsblood",2), R("Plaguebloom","inv_misc_herb_plaguebloom",2), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "elixir_sages", name: "Elixir of the Sages", category: "Elixir", profession: "Alchemy", icon: "inv_potion_29", yield: 1, reagents: [R("Dreamfoil","inv_misc_herb_dreamfoil",1), R("Plaguebloom","inv_misc_herb_plaguebloom",2), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "elixir_greater_agility", name: "Elixir of Greater Agility", category: "Elixir", profession: "Alchemy", icon: "inv_potion_94", yield: 1, reagents: [R("Sungrass","inv_misc_herb_sungrass",1), R("Goldthorn","inv_misc_herb_goldthorn",1), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "elixir_frost_power", name: "Elixir of Frost Power", category: "Elixir", profession: "Alchemy", icon: "inv_potion_03", yield: 1, reagents: [R("Wintersbite","inv_misc_herb_wintersbite",2), R("Khadgar's Whisker","inv_misc_herb_khadgarswhisker",1), R("Crystal Vial","inv_alchemy_crystalvial",1)] },

    // ===== POTIONS =====
    { id: "major_mana_potion", name: "Major Mana Potion", category: "Potion", profession: "Alchemy", icon: "inv_potion_76", yield: 1, reagents: [R("Dreamfoil","inv_misc_herb_dreamfoil",3), R("Icecap","inv_misc_herb_icecap",2), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "major_healing_potion", name: "Major Healing Potion", category: "Potion", profession: "Alchemy", icon: "inv_potion_54", yield: 1, reagents: [R("Golden Sansam","inv_misc_herb_goldensansam",2), R("Mountain Silversage","inv_misc_herb_mountainsilversage",1), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "free_action_potion", name: "Free Action Potion", category: "Potion", profession: "Alchemy", icon: "inv_potion_04", yield: 1, reagents: [R("Blackmouth Oil","inv_potion_39",2), R("Stranglekelp","inv_misc_herb_09",1), R("Leaded Vial","inv_alchemy_leadedvial",1)] },
    { id: "living_action_potion", name: "Living Action Potion", category: "Potion", profession: "Alchemy", icon: "inv_potion_51", yield: 1, reagents: [R("Icecap","inv_misc_herb_icecap",2), R("Mountain Silversage","inv_misc_herb_mountainsilversage",2), R("Heart of the Wild","inv_misc_herb_heartofthewild",2,"rare"), R("Crystal Vial","inv_alchemy_crystalvial",1)] },
    { id: "limited_invuln_potion", name: "Limited Invulnerability Potion", category: "Potion", profession: "Alchemy", icon: "inv_potion_62", yield: 1, reagents: [R("Blindweed","inv_misc_herb_blindweed",2), R("Ghost Mushroom","inv_misc_herb_ghostmushroom",1,"uncommon"), R("Crystal Vial","inv_alchemy_crystalvial",1)] },

    // ===== FOOD =====
    { id: "nightfin_soup", name: "Nightfin Soup", category: "Food", profession: "Cooking", icon: "inv_drink_17", yield: 1, reagents: [R("Raw Nightfin Snapper","inv_misc_fish_32",1)] },
    { id: "runn_tum_tuber", name: "Runn Tum Tuber Surprise", category: "Food", profession: "Cooking", icon: "inv_misc_food_63", yield: 1, reagents: [R("Runn Tum Tuber","inv_misc_food_63",1,"uncommon")] },
    { id: "grilled_squid", name: "Grilled Squid", category: "Food", profession: "Cooking", icon: "inv_misc_food_13", yield: 1, reagents: [R("Winter Squid","inv_misc_monsterhead_01",1)] },
    { id: "smoked_desert_dumplings", name: "Smoked Desert Dumplings", category: "Food", profession: "Cooking", icon: "inv_misc_food_64", yield: 1, reagents: [R("Sandworm Meat","inv_misc_food_47",1), R("Soothing Spices","inv_misc_food_24",1)] },
    { id: "chimaerok_chops", name: "Dirge's Kickin' Chimaerok Chops", category: "Food", profession: "Cooking", icon: "inv_misc_food_65", yield: 1, reagents: [R("Chimaerok Tenderloin","inv_misc_food_65",1,"rare"), R("Hot Spices","inv_misc_food_25",1)] },
    { id: "blessed_sunfruit", name: "Blessed Sunfruit", category: "Food", profession: "Cooking", icon: "inv_misc_food_41", yield: 1, reagents: [R("Blessed Sunfruit","inv_misc_food_41",1)] },

    // ===== EXPLOSIVES =====
    { id: "dense_dynamite", name: "Dense Dynamite", category: "Explosive", profession: "Engineering", icon: "inv_misc_bomb_09", yield: 2, reagents: [R("Dense Blasting Powder","inv_misc_ammo_gunpowder_01",2), R("Runecloth","inv_fabric_purplefire_01",3)] },
    { id: "thorium_grenade", name: "Thorium Grenade", category: "Explosive", profession: "Engineering", icon: "inv_misc_bomb_08", yield: 2, reagents: [R("Thorium Widget","inv_misc_gear_08",3,"uncommon"), R("Dense Blasting Powder","inv_misc_ammo_gunpowder_01",3), R("Runecloth","inv_fabric_purplefire_01",1)] },
    { id: "goblin_sapper", name: "Goblin Sapper Charge", category: "Explosive", profession: "Engineering", icon: "spell_fire_selfdestruct", yield: 3, reagents: [R("Mithril Casing","inv_misc_gear_05",1,"uncommon"), R("Unstable Trigger","inv_misc_gear_06",1,"uncommon"), R("Solid Blasting Powder","inv_misc_ammo_gunpowder_02",3)] },
];
