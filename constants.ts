
import { Item, SpecName, StatWeights, ClassName, ItemSet, Consumable, Enchant, RaceName, ItemStats, Talent } from './types';

interface ClassConfig {
    specs: SpecName[];
    color: string;
    image: string;
    icon: string;
}

export const BASE_STATS: Record<ClassName, { hp: number, mp: number, str: number, agi: number, sta: number, int: number, spi: number, critDivisor: number }> = {
    // Simplified Level 60 Base Stats
    "Warlock": { hp: 1580, mp: 2300, str: 48, agi: 55, sta: 79, int: 110, spi: 105, critDivisor: 60.6 },
    "Warrior": { hp: 2300, mp: 0, str: 140, agi: 80, sta: 130, int: 30, spi: 40, critDivisor: 20 },
    "Mage": { hp: 1450, mp: 2400, str: 35, agi: 40, sta: 50, int: 135, spi: 130, critDivisor: 59.5 },
    "Rogue": { hp: 1700, mp: 0, str: 85, agi: 130, sta: 80, int: 35, spi: 50, critDivisor: 29 },
    "Priest": { hp: 1480, mp: 2500, str: 38, agi: 40, sta: 55, int: 130, spi: 135, critDivisor: 59.2 },
    "Hunter": { hp: 1900, mp: 2100, str: 60, agi: 130, sta: 95, int: 70, spi: 75, critDivisor: 53 },
    "Druid": { hp: 1800, mp: 2200, str: 70, agi: 65, sta: 85, int: 100, spi: 110, critDivisor: 60 },
    "Shaman": { hp: 1750, mp: 2250, str: 95, agi: 60, sta: 100, int: 100, spi: 115, critDivisor: 59.5 },
    "Paladin": { hp: 2000, mp: 2150, str: 115, agi: 70, sta: 110, int: 85, spi: 90, critDivisor: 54 }
};

export const SPEC_ICONS: Record<SpecName, string> = {
    // Warlock
    "SM Ruin": "spell_shadow_shadowbolt",
    "Affliction": "spell_shadow_curseofsargeras",
    "Destruction": "spell_shadow_rainoffire",
    "Demon": "spell_shadow_metamorphosis",
    
    // Warrior
    "Arms": "ability_warrior_savageblow", // Mortal Strike
    "Fury": "spell_nature_bloodlust", // Bloodthirst
    "Protection": "ability_warrior_defensivestance",

    // Mage
    "Arcane": "spell_nature_wizardoil", // Arcane Power
    "Fire": "spell_fire_flamebolt", // Fireball
    "Frost": "spell_frost_frostbolt02", // Frostbolt

    // Rogue
    "Assassination": "ability_rogue_eviscerate",
    "Combat": "ability_warrior_punishingblow", // Blade Flurry
    "Subtlety": "spell_shadow_charm", // Hemorrhage

    // Priest
    "Holy": "spell_holy_holybolt", // Holy Light/Flash Heal generic
    "Discipline": "spell_holy_powerwordshield",
    "Shadow": "spell_shadow_shadowwordpain",
    "Smite": "spell_holy_holysmite",

    // Hunter
    "Beast Mastery": "ability_hunter_beasttaming",
    "Marksmanship": "ability_marksmanship",
    "Survival": "ability_hunter_swiftstrike", // Raptor Strike / Survival generic

    // Druid
    "Balance": "spell_nature_starfall", // Moonkin/Starfire
    "Feral": "ability_racial_bearform",
    "Restoration": "spell_nature_healingtouch",

    // Paladin
    "Holy (Paladin)": "spell_holy_holybolt",
    "Protection (Paladin)": "spell_holy_devotionaura",
    "Retribution": "spell_holy_auraoflight", // Seal of Command

    // Shaman
    "Elemental": "spell_nature_lightning",
    "Enhancement": "spell_nature_lightningshield",
    "Restoration (Shaman)": "spell_nature_magicimmunity" // Healing Wave
};

export const TALENT_DB: Record<ClassName, Talent[]> = {
    "Warlock": [
        { id: "devastation", name: "Devastation", icon: "spell_fire_flameshock", description: "+5% Critical Strike chance with Destruction spells.", stats: { crit: 5 } },
        { id: "suppression", name: "Suppression", icon: "spell_shadow_unsummonbuilding", description: "+10% Hit chance with Affliction spells (Simplified to global hit for simulation).", stats: { hit: 10 } },
        { id: "demonic_embrace", name: "Demonic Embrace", icon: "spell_shadow_metamorphosis", description: "+15% Total Stamina, -5% Spirit.", stats: { staminaMod: 15, spiritMod: -5 } },
        { id: "master_demonologist", name: "Master Demonologist (Imp)", icon: "spell_shadow_summonimp", description: "-20% Threat.", stats: { threatReduction: 20 } },
        { id: "master_demonologist_succ", name: "Master Demonologist (Succubus)", icon: "spell_shadow_summonsuccubus", description: "+10% All Damage.", stats: { damagePercent: 10 } },
        { id: "ds_succubus", name: "Demonic Sacrifice (Succubus)", icon: "spell_shadow_sacrificialshield", description: "+15% Shadow Damage.", stats: { spShadow: 0, damagePercent: 15 } } // Note: % dmg usually handled via multiplier, here we use damagePercent hook
    ],
    "Mage": [
        { id: "elemental_precision", name: "Elemental Precision", icon: "spell_ice_magicdamage", description: "+6% Chance to Hit with Frost and Fire spells.", stats: { hit: 6 } },
        { id: "arcane_instability", name: "Arcane Instability", icon: "spell_shadow_teleport", description: "+3% Spell Damage and +3% Critical Strike chance.", stats: { damagePercent: 3, crit: 3 } },
        { id: "piercing_ice", name: "Piercing Ice", icon: "spell_frost_frostbolt", description: "+6% Frost Damage.", stats: { damagePercent: 6 } },
        { id: "playing_with_fire", name: "Playing with Fire", icon: "spell_fire_playingwithfire", description: "+3% All Spell Damage.", stats: { damagePercent: 3 } },
        { id: "arcane_mind", name: "Arcane Mind", icon: "spell_shadow_charm", description: "+15% Total Intellect.", stats: { intMod: 15 } }
    ],
    "Warrior": [
        { id: "cruelty", name: "Cruelty", icon: "ability_rogue_eviscerate", description: "+5% Critical Strike chance with melee weapons.", stats: { crit: 5 } },
        { id: "axe_spec", name: "Axe Specialization", icon: "inv_axe_06", description: "+5% Critical Strike chance with Axes and Polearms.", stats: { crit: 5 } },
        { id: "polearm_spec", name: "Polearm Specialization", icon: "inv_weapon_halberd_01", description: "+5% Critical Strike chance with Polearms.", stats: { crit: 5 } },
        { id: "mace_spec", name: "Mace Specialization", icon: "inv_mace_01", description: "+Weapon Skill with Maces (Simulated as ~3% Hit/Crit value).", stats: { hit: 3 } }, // Simplified
        { id: "sword_spec", name: "Sword Specialization", icon: "inv_sword_27", description: "Chance to get an extra attack (Simulated as ~2% DPS increase via Haste).", stats: { haste: 2 } },
        { id: "two_handed_spec", name: "Two-Handed Weapon Specialization", icon: "inv_axe_09", description: "+5% Damage with Two-Handed Melee Weapons.", stats: { damagePercent: 5 } },
        { id: "defiance", name: "Defiance", icon: "ability_warrior_innerrage", description: "+15% Threat generation in Defensive Stance (Not a stat, but tracked).", stats: {} }
    ],
    "Rogue": [
        { id: "malice", name: "Malice", icon: "ability_racial_bloodrage", description: "+5% Critical Strike chance.", stats: { crit: 5 } },
        { id: "precision", name: "Precision", icon: "ability_rogue_ambush", description: "+5% Hit chance with melee weapons.", stats: { hit: 5 } },
        { id: "dagger_spec", name: "Dagger Specialization", icon: "inv_weapon_shortblade_05", description: "+5% Critical Strike chance with Daggers.", stats: { crit: 5 } },
        { id: "fist_spec", name: "Fist Weapon Specialization", icon: "inv_gauntlets_04", description: "+5% Critical Strike chance with Fist Weapons.", stats: { crit: 5 } },
        { id: "dual_wield_spec", name: "Dual Wield Specialization", icon: "ability_dualwield", description: "+50% Off-hand Damage (Simulated as roughly 10% total damage increase).", stats: { damagePercent: 10 } },
        { id: "lethality", name: "Lethality", icon: "ability_criticalstrike", description: "+30% Critical Strike Damage bonus (CP generators).", stats: {} } // Complex to mod flat stats
    ],
    "Priest": [
        { id: "force_of_will", name: "Force of Will", icon: "spell_nature_slowingstrikes", description: "+5% Spell Damage and +5% Critical Strike chance with offensive spells.", stats: { damagePercent: 5, crit: 5 } },
        { id: "darkness", name: "Darkness", icon: "spell_shadow_twilight", description: "+10% Shadow Spell Damage.", stats: { damagePercent: 10 } },
        { id: "shadow_focus", name: "Shadow Focus", icon: "spell_shadow_burning spirit", description: "+10% Hit chance with Shadow spells.", stats: { hit: 10 } },
        { id: "divine_fury", name: "Divine Fury", icon: "spell_holy_sealofwrath", description: "Reduces cast time of Smite, Holy Fire, Heal and Greater Heal by 0.5 sec (Simulated as Haste).", stats: { haste: 15 } },
        { id: "mental_strength", name: "Mental Strength", icon: "spell_nature_enchantarmor", description: "+10% Total Mana.", stats: { intMod: 10 } } // Approximated
    ],
    "Hunter": [
        { id: "lethal_shots", name: "Lethal Shots", icon: "ability_searingarrow", description: "+5% Critical Strike chance with ranged weapons.", stats: { crit: 5 } },
        { id: "ranged_weapon_spec", name: "Ranged Weapon Specialization", icon: "inv_weapon_rifle_06", description: "+5% Ranged Weapon Damage.", stats: { damagePercent: 5 } },
        { id: "surefooted", name: "Surefooted", icon: "ability_kick", description: "+3% Hit chance.", stats: { hit: 3 } },
        { id: "killer_instinct", name: "Killer Instinct", icon: "spell_holy_blessingofstamina", description: "+3% Critical Strike chance.", stats: { crit: 3 } },
        { id: "lightning_reflexes", name: "Lightning Reflexes", icon: "spell_nature_invisibilty", description: "+15% Agility.", stats: { agiMod: 15 } }
    ],
    "Paladin": [
        { id: "conviction", name: "Conviction", icon: "spell_holy_prayerofhealing", description: "+5% Critical Strike chance with melee weapons.", stats: { crit: 5 } },
        { id: "divine_strength", name: "Divine Strength", icon: "spell_holy_enchantweapon", description: "+10% Strength.", stats: { strMod: 10 } },
        { id: "divine_intellect", name: "Divine Intellect", icon: "spell_nature_sleep", description: "+10% Total Intellect.", stats: { intMod: 10 } },
        { id: "precision_pal", name: "Precision", icon: "ability_rogue_ambush", description: "+3% Hit chance with melee weapons.", stats: { hit: 3 } },
        { id: "healing_light", name: "Healing Light", icon: "spell_holy_holybolt", description: "+12% Healing.", stats: { healing: 120 } } // Rough conversion 12% ~ 120 flat for logic
    ],
    "Shaman": [
        { id: "concussion", name: "Concussion", icon: "spell_fire_fireball", description: "+5% Damage with Shock, Lightning and Chain Lightning spells.", stats: { damagePercent: 5 } },
        { id: "tidal_mastery", name: "Tidal Mastery", icon: "spell_nature_tranquility", description: "+5% Critical Strike chance with Nature and Frost spells.", stats: { crit: 5 } },
        { id: "ancestral_knowledge", name: "Ancestral Knowledge", icon: "spell_shadow_grimward", description: "+5% Total Mana.", stats: { intMod: 5 } }, // Approx
        { id: "nature_guidance", name: "Nature's Guidance", icon: "spell_frost_stun", description: "+3% Hit chance with melee and spells.", stats: { hit: 3 } },
        { id: "thundering_strikes", name: "Thundering Strikes", icon: "ability_thunderbolt", description: "+5% Critical Strike chance with weapons.", stats: { crit: 5 } }
    ],
    "Druid": [
        { id: "nature_focus", name: "Nature's Focus", icon: "spell_nature_natureswrath", description: "70% chance to avoid interruption while casting Healing Touch, Regrowth and Tranquility.", stats: {} },
        { id: "natural_weapons", name: "Natural Weapons", icon: "inv_staff_01", description: "+10% Physical Damage in all forms.", stats: { damagePercent: 10 } },
        { id: "omen_of_clarity", name: "Omen of Clarity", icon: "spell_nature_crystalball", description: "Chance to enter a Clearcasting state.", stats: {} },
        { id: "moonkin_form", name: "Moonkin Form", icon: "spell_nature_forceofnature", description: "+360% Armor, +3% Spell Crit Aura.", stats: { armor: 360, crit: 3 } },
        { id: "heart_of_wild", name: "Heart of the Wild", icon: "spell_holy_blessingofagility", description: "+20% Intellect (Caster) / +20% Stamina (Bear) / +20% Strength (Cat).", stats: { intMod: 20 } } // Simplified for caster context
    ]
};

export const CLASS_CONFIG: Record<ClassName, ClassConfig> = {
    "Warlock": {
        specs: ["SM Ruin", "Affliction", "Destruction", "Demon"],
        color: "#9482C9",
        image: "", 
        icon: "spell_shadow_deathcoil"
    },
    "Warrior": {
        specs: ["Arms", "Fury", "Protection"],
        color: "#C79C6E",
        image: "",
        icon: "inv_sword_27"
    },
    "Mage": {
        specs: ["Frost", "Fire", "Arcane"],
        color: "#69CCF0",
        image: "",
        icon: "spell_holy_magicalsentry"
    },
    "Rogue": {
        specs: ["Combat", "Assassination", "Subtlety"],
        color: "#FFF569",
        image: "",
        icon: "ability_backstab"
    },
    "Priest": {
        specs: ["Holy", "Discipline", "Shadow", "Smite"],
        color: "#FFFFFF",
        image: "",
        icon: "spell_holy_powerwordshield"
    },
    "Hunter": {
        specs: ["Marksmanship", "Beast Mastery", "Survival"],
        color: "#ABD473",
        image: "",
        icon: "ability_marksmanship"
    },
    "Druid": {
        specs: ["Restoration", "Balance", "Feral"],
        color: "#FF7D0A",
        image: "",
        icon: "spell_nature_naturetouch"
    },
    "Shaman": {
        specs: ["Restoration (Shaman)", "Elemental", "Enhancement"],
        color: "#0070DE",
        image: "",
        icon: "spell_nature_lightning"
    },
    "Paladin": {
        specs: ["Holy (Paladin)", "Protection (Paladin)", "Retribution"],
        color: "#F58CBA",
        image: "",
        icon: "spell_holy_sealofwrath"
    }
};

// ... (Rest of the file remains the same)
// Static mapping for Class/Race/Gender combinations (Optional Overrides)
export const CHARACTER_BACKGROUNDS: Record<string, string> = {
    // Left empty to rely on AI generation by default
};

export const CLASS_RACES: Record<ClassName, RaceName[]> = {
    "Warlock": ["Human", "Gnome", "Orc", "Undead", "Goblin"],
    "Warrior": ["Human", "Dwarf", "Night Elf", "Gnome", "Orc", "Undead", "Tauren", "Troll", "High Elf", "Goblin"],
    "Mage": ["Human", "Gnome", "Troll", "Undead", "High Elf", "Goblin"],
    "Rogue": ["Human", "Dwarf", "Night Elf", "Gnome", "Orc", "Undead", "Troll", "Goblin"],
    "Priest": ["Human", "Dwarf", "Night Elf", "Troll", "Undead", "High Elf"],
    "Hunter": ["Dwarf", "Night Elf", "Orc", "Tauren", "Troll", "High Elf", "Goblin"],
    "Druid": ["Night Elf", "Tauren"],
    "Shaman": ["Orc", "Tauren", "Troll", "Goblin"],
    "Paladin": ["Human", "Dwarf", "High Elf"]
};

// Simplified Bonuses (Passive Combat Stats)
export const RACIAL_STATS: Record<RaceName, ItemStats> = {
    "Human": { swordSkill: 5, maceSkill: 5, spiritMod: 5 }, // +5% Spirit
    "Dwarf": { gunSkill: 5, frostRes: 10 }, 
    "Night Elf": { dodge: 1, natureRes: 10 },
    "Gnome": { intMod: 5, arcaneRes: 10 }, // +5% Int
    "Orc": { axeSkill: 5, petDamage: 5 }, 
    "Undead": { shadowRes: 10 }, 
    "Tauren": { healthMod: 5, natureRes: 10 }, // +5% Health
    "Troll": { bowSkill: 5, healthRegen: 10 }, 
    "High Elf": { staffSkill: 5, bowSkill: 5, int: 5 }, // Turtle approximation
    "Goblin": { mining: 5, engineering: 5, crit: 1 } // Turtle approximation
};

export const ENCHANT_DATABASE: Enchant[] = [
    // --- HEAD / LEGS (ZG) ---
    { id: 1, name: "Presence of Sight", text: "+18 Healing / +8 Spell Power", stats: { healing: 18, sp: 8 }, slots: ["Head", "Legs"], icon: "inv_misc_gem_pearl_06" },
    { id: 2, name: "Presence of Might", text: "+10 Strength", stats: { str: 10 }, slots: ["Head", "Legs"], icon: "spell_nature_strength" },
    { id: 3, name: "Hoodoo Hex", text: "+10 Stamina / +10 Int / +18 Healing", stats: { sta: 10, int: 10, healing: 18 }, slots: ["Head", "Legs"], icon: "inv_misc_gem_pearl_04" },
    { id: 4, name: "Prophetic Aura", text: "+10 Stamina / +4 MP5 / +24 Healing", stats: { sta: 10, mp5: 4, healing: 24 }, slots: ["Head", "Legs"], icon: "spell_holy_mindvision" },
    { id: 5, name: "Syncretist's Sigil", text: "+10 Stamina / +7 Defense / +24 Healing", stats: { sta: 10, defense: 7, healing: 24 }, slots: ["Head", "Legs"], icon: "spell_holy_powerwordshield" },
    { id: 6, name: "Falcon's Call", text: "+24 Ranged AP / +10 Stamina / +1% Hit", stats: { rangedAp: 24, sta: 10, hit: 1 }, slots: ["Head", "Legs"], icon: "ability_hunter_snipershot" },
    
    // --- HEAD / LEGS (Dire Maul / Librams) ---
    { id: 7, name: "Lesser Arcanum of Voracity", text: "+8 Agility", stats: { agi: 8 }, slots: ["Head", "Legs"], icon: "spell_nature_agility" },
    { id: 8, name: "Lesser Arcanum of Rumination", text: "+150 Mana", stats: { mana: 150 }, slots: ["Head", "Legs"], icon: "inv_potion_98" },
    { id: 50, name: "Arcanum of Focus", text: "+8 Spell Power", stats: { sp: 8, healing: 8 }, slots: ["Head", "Legs"], icon: "inv_misc_book_09" },
    { id: 51, name: "Arcanum of Protection", text: "+1% Dodge", stats: { dodge: 1 }, slots: ["Head", "Legs"], icon: "inv_misc_book_11" },
    { id: 52, name: "Arcanum of Rapidity", text: "+1% Haste", stats: { haste: 1 }, slots: ["Head", "Legs"], icon: "inv_misc_book_06" },
    { id: 53, name: "Lesser Arcanum of Constitution", text: "+100 Health", stats: { health: 100 }, slots: ["Head", "Legs"], icon: "inv_misc_book_08" },
    { id: 54, name: "Lesser Arcanum of Resilience", text: "+20 Fire Res", stats: { resFire: 20 }, slots: ["Head", "Legs"], icon: "inv_misc_book_07" },

    // --- SHOULDER (Naxx / Argent Dawn / ZG) ---
    { id: 9, name: "Might of the Scourge", text: "+26 Attack Power / +1% Crit", stats: { ap: 26, crit: 1 }, slots: ["Shoulder"], icon: "spell_shadow_unholyfrenzy" }, // Sapphiron (Physical)
    { id: 10, name: "Power of the Scourge", text: "+15 Spell Power / +1% Crit", stats: { sp: 15, crit: 1 }, slots: ["Shoulder"], icon: "spell_shadow_darkritual" }, // Sapphiron (Spell)
    { id: 57, name: "Fortitude of the Scourge", text: "+16 Stamina", stats: { sta: 16 }, slots: ["Shoulder"], icon: "spell_nature_unyeildingstamina" }, // Sapphiron (Tank)
    
    { id: 11, name: "Zandalar Signet of Mojo", text: "+18 Spell Power", stats: { sp: 18 }, slots: ["Shoulder"], icon: "inv_misc_gem_emerald_02" },
    { id: 12, name: "Zandalar Signet of Might", text: "+30 Attack Power", stats: { ap: 30 }, slots: ["Shoulder"], icon: "inv_misc_gem_opal_01" },
    { id: 13, name: "Zandalar Signet of Serenity", text: "+33 Healing", stats: { healing: 33 }, slots: ["Shoulder"], icon: "inv_misc_gem_diamond_02" },

    { id: 56, name: "Mantle of the Dawn", text: "+5 All Resistances", stats: { resFire: 5, resFrost: 5, resNature: 5, resShadow: 5, resArcane: 5 }, slots: ["Shoulder"], icon: "inv_misc_gem_opal_01" }, // Argent Dawn

    // --- CLOAK ---
    { id: 14, name: "Subtlety", text: "-2% Threat", stats: { threatReduction: 2 }, slots: ["Back"], icon: "ability_rogue_feint" },
    { id: 15, name: "Greater Resistance", text: "+5 All Res", stats: { resFire: 5, resFrost: 5, resShadow: 5, resNature: 5, resArcane: 5 }, slots: ["Back"], icon: "spell_magic_lesserinvisibilty" },
    { id: 16, name: "Superior Defense", text: "+70 Armor", stats: { armor: 70 }, slots: ["Back"], icon: "spell_shadow_grimward" },
    { id: 17, name: "Dodge", text: "+1% Dodge", stats: { dodge: 1 }, slots: ["Back"], icon: "spell_nature_invisibilty" },

    // --- CHEST ---
    { id: 18, name: "Greater Stats", text: "+4 All Stats", stats: { str: 4, agi: 4, sta: 4, int: 4, spi: 4 }, slots: ["Chest"], icon: "spell_holy_blessedlife" },
    { id: 19, name: "Major Health", text: "+100 Health", stats: { health: 100 }, slots: ["Chest"], icon: "inv_potion_54" },
    { id: 20, name: "Major Mana", text: "+100 Mana", stats: { mana: 100 }, slots: ["Chest"], icon: "inv_potion_76" },

    // --- WRIST ---
    { id: 21, name: "Superior Strength", text: "+9 Strength", stats: { str: 9 }, slots: ["Wrist"], icon: "spell_nature_strength" },
    { id: 22, name: "Superior Stamina", text: "+9 Stamina", stats: { sta: 9 }, slots: ["Wrist"], icon: "spell_nature_unyeildingstamina" },
    { id: 23, name: "Greater Intellect", text: "+7 Intellect", stats: { int: 7 }, slots: ["Wrist"], icon: "spell_holy_magicalsentry" },
    { id: 24, name: "Mana Regeneration", text: "+4 MP5", stats: { mp5: 4 }, slots: ["Wrist"], icon: "spell_nature_manaregen" },
    { id: 25, name: "Healing Power", text: "+24 Healing", stats: { healing: 24 }, slots: ["Wrist"], icon: "spell_holy_heal" },

    // --- GLOVES ---
    { id: 26, name: "Greater Agility", text: "+7 Agility", stats: { agi: 7 }, slots: ["Hands"], icon: "spell_nature_agility" },
    { id: 27, name: "Greater Strength", text: "+7 Strength", stats: { str: 7 }, slots: ["Hands"], icon: "spell_nature_strength" },
    { id: 28, name: "Shadow Power", text: "+20 Shadow Spell Power", stats: { spShadow: 20 }, slots: ["Hands"], icon: "spell_shadow_shadowbolt" },
    { id: 29, name: "Fire Power", text: "+20 Fire Spell Power", stats: { spFire: 20 }, slots: ["Hands"], icon: "spell_fire_firebolt" },
    { id: 30, name: "Frost Power", text: "+20 Frost Spell Power", stats: { spFrost: 20 }, slots: ["Hands"], icon: "spell_frost_frostbolt02" },
    { id: 31, name: "Healing Power", text: "+30 Healing", stats: { healing: 30 }, slots: ["Hands"], icon: "spell_holy_heal" },
    { id: 32, name: "Superior Agility", text: "+15 Agility", stats: { agi: 15 }, slots: ["Hands"], icon: "spell_nature_agility" }, // AQ40

    // --- BOOTS ---
    { id: 33, name: "Minor Speed", text: "+8% Run Speed", stats: { speed: 8 }, slots: ["Feet"], icon: "spell_nature_swiftness" },
    { id: 34, name: "Greater Stamina", text: "+7 Stamina", stats: { sta: 7 }, slots: ["Feet"], icon: "spell_nature_unyeildingstamina" },
    { id: 35, name: "Greater Agility", text: "+7 Agility", stats: { agi: 7 }, slots: ["Feet"], icon: "spell_nature_agility" },
    { id: 36, name: "Spirit", text: "+5 Spirit", stats: { spi: 5 }, slots: ["Feet"], icon: "spell_holy_divinespirit" },

    // --- WEAPONS ---
    { id: 37, name: "Spell Power", text: "+30 Spell Power", stats: { sp: 30 }, slots: ["MainHand", "Two-Hand", "Staff", "One-Hand"], icon: "spell_holy_greaterheal" },
    { id: 38, name: "Healing Power", text: "+55 Healing", stats: { healing: 55 }, slots: ["MainHand", "Two-Hand", "Staff", "One-Hand"], icon: "spell_holy_heal" },
    { id: 39, name: "Crusader", text: "Crusader", stats: { str: 0 }, proc: "Heal 100 & +100 Str", slots: ["MainHand", "Two-Hand", "One-Hand"], icon: "spell_holy_crusader" },
    { id: 40, name: "Superior Striking", text: "+5 Damage", stats: { minDmg: 5, maxDmg: 5 }, slots: ["MainHand", "Two-Hand", "One-Hand"], icon: "ability_rogue_ambush" },
    { id: 41, name: "Agility (2H)", text: "+25 Agility", stats: { agi: 25 }, slots: ["Two-Hand", "Staff"], icon: "spell_nature_agility" },
    { id: 42, name: "Agility (1H)", text: "+15 Agility", stats: { agi: 15 }, slots: ["MainHand", "One-Hand"], icon: "spell_nature_agility" },
    { id: 43, name: "Intellect (2H)", text: "+9 Intellect", stats: { int: 9 }, slots: ["Two-Hand", "Staff"], icon: "spell_holy_magicalsentry" },

    // --- SHIELD ---
    { id: 44, name: "Greater Stamina", text: "+7 Stamina", stats: { sta: 7 }, slots: ["Shield", "OffHand"], icon: "spell_nature_unyeildingstamina" },
    { id: 45, name: "Frost Resistance", text: "+8 Frost Res", stats: { resFrost: 8 }, slots: ["Shield", "OffHand"], icon: "spell_frost_frostward" },
];

export const CONSUMABLE_DATABASE: Consumable[] = [
    // --- FLASKS ---
    { name: "Flask of Supreme Power", icon: "inv_potion_41", category: "Flask", stats: { sp: 70 }, description: "+70 Spell Power" },
    { name: "Flask of the Titans", icon: "inv_potion_62", category: "Flask", stats: { health: 1200 }, description: "+1200 Health" },
    { name: "Flask of Distilled Wisdom", icon: "inv_potion_29", category: "Flask", stats: { mana: 2000 }, description: "+2000 Mana" },
    
    // --- ELIXIRS (Battle) ---
    { name: "Greater Arcane Elixir", icon: "inv_potion_25", category: "Elixir", stats: { sp: 35 }, description: "+35 Spell Power" },
    { name: "Elixir of the Mongoose", icon: "inv_potion_32", category: "Elixir", stats: { agi: 25, crit: 2 }, description: "+25 Agility, +2% Crit" },
    { name: "Elixir of Giants", icon: "inv_potion_61", category: "Elixir", stats: { str: 25 }, description: "+25 Strength" },
    { name: "Elixir of Shadow Power", icon: "inv_potion_46", category: "Elixir", stats: { spShadow: 40 }, description: "+40 Shadow Spell Power" },
    { name: "Elixir of Greater Firepower", icon: "inv_potion_33", category: "Elixir", stats: { spFire: 40 }, description: "+40 Fire Spell Power" },
    { name: "Elixir of Frost Power", icon: "inv_potion_03", category: "Elixir", stats: { spFrost: 15 }, description: "+15 Frost Spell Power" },

    // --- ELIXIRS (Guardian) ---
    { name: "Elixir of Superior Defense", icon: "inv_potion_86", category: "Elixir", stats: { armor: 450 }, description: "+450 Armor" },
    { name: "Elixir of Fortitude", icon: "inv_potion_44", category: "Elixir", stats: { health: 120 }, description: "+120 Health" },
    { name: "Mageblood Potion", icon: "inv_potion_45", category: "Elixir", stats: { mp5: 12 }, description: "+12 MP5" },

    // --- FOOD ---
    { name: "Runn Tum Tuber Surprise", icon: "inv_misc_food_63", category: "Food", stats: { int: 10 }, description: "+10 Intellect" },
    { name: "Nightfin Soup", icon: "inv_drink_17", category: "Food", stats: { mp5: 8 }, description: "+8 MP5" },
    { name: "Grilled Squid", icon: "inv_misc_fish_13", category: "Food", stats: { agi: 10 }, description: "+10 Agility" },
    { name: "Smoked Desert Dumplings", icon: "inv_misc_food_64", category: "Food", stats: { str: 20 }, description: "+20 Strength" },
    { name: "Tender Wolf Steak", icon: "inv_misc_food_85", category: "Food", stats: { sta: 12, spirit: 12 }, description: "+12 Stamina, +12 Spirit" },

    // --- WORLD BUFFS ---
    { name: "Rallying Cry of the Dragonslayer", icon: "inv_misc_head_dragon_01", category: "World Buff", stats: { crit: 10, ap: 140, spellCrit: 10 }, description: "+10% Spell/Melee Crit, +140 AP" },
    { name: "Songflower Serenade", icon: "spell_holy_mindvision", category: "World Buff", stats: { crit: 5, str: 15, agi: 15, sta: 15, int: 15, spirit: 15, spellCrit: 5 }, description: "+5% Crit, +15 All Stats" },
    { name: "Warchief's Blessing", icon: "spell_arcane_teleportorgrimmar", category: "World Buff", stats: { health: 300, mp5: 10 }, description: "+300 HP, +15% Melee Haste, +10 MP5" },
    { name: "Spirit of Zandalar", icon: "ability_creature_poison_05", category: "World Buff", stats: { allStatsPercent: 15 }, description: "+15% All Stats" },
    { name: "Sayge's Dark Fortune of Damage", icon: "inv_misc_orb_02", category: "World Buff", stats: { damagePercent: 10 }, description: "+10% Damage" },
    
    // --- OTHER ---
    { name: "Brilliant Wizard Oil", icon: "inv_potion_105", category: "Other", stats: { sp: 36, crit: 1 }, description: "+36 Spell Power, +1% Crit" },
    { name: "Brilliant Mana Oil", icon: "inv_potion_100", category: "Other", stats: { mp5: 12, healing: 25 }, description: "+12 MP5, +25 Healing" },
    { name: "Juju Power", icon: "inv_misc_monsterscales_11", category: "Other", stats: { str: 30 }, description: "+30 Strength" },
    { name: "Juju Might", icon: "inv_misc_monsterscales_07", category: "Other", stats: { ap: 40 }, description: "+40 Attack Power" },
    { name: "Juju Flurry", icon: "inv_misc_monsterscales_17", category: "Other", stats: { haste: 3 }, description: "+3% Attack Speed" },
];

export const SET_DATABASE: Record<string, ItemSet> = {
    // --- DAL'REND'S ARMS ---
    "Dal'Rend's Arms": {
        name: "Dal'Rend's Arms",
        items: ["Dal'Rend's Sacred Charge", "Dal'Rend's Tribal Guardian"],
        bonuses: [
            { threshold: 2, text: "+50 Attack Power" }
        ]
    },
    // --- TIER 3 (NAXXRAMAS) ---
    "Plagueheart Raiment": {
        name: "Plagueheart Raiment",
        items: ["Plagueheart Circlet", "Plagueheart Shoulderpads", "Plagueheart Robe", "Plagueheart Leggings", "Plagueheart Sandals", "Plagueheart Bindings", "Plagueheart Gloves", "Plagueheart Belt", "Plagueheart Ring"],
        bonuses: [
            { threshold: 2, text: "Your Shadow Bolts now have a chance to heal you for 270 to 330." },
            { threshold: 4, text: "Increases damage done by Corruption by 12%." },
            { threshold: 6, text: "-20% Threat from Shadow Bolts." },
            { threshold: 8, text: "Life Tap generates less threat." }
        ]
    }
};

export const STAT_WEIGHTS: Record<string, StatWeights> = {
    "SM Ruin": { sp: 1, hit: 14, crit: 11, int: 0.2, stam: 0, spirit: 0 },
    "Destruction": { sp: 1, hit: 13, crit: 12, int: 0.2, stam: 0, spirit: 0 },
    "Affliction": { sp: 1, hit: 15, crit: 6, int: 0.3, stam: 0.5, spirit: 0 },
    "Demon": { sp: 0.8, hit: 10, crit: 5, int: 0.3, stam: 1.5, spirit: 0 },
    
    "Frost": { sp: 1, hit: 13, crit: 8, int: 0.2, stam: 0, spirit: 0 },
    "Fire": { sp: 1, hit: 12, crit: 12, int: 0.2, stam: 0, spirit: 0 },
    "Arcane": { sp: 1, hit: 10, crit: 10, int: 0.5, stam: 0, spirit: 0.2 },

    "Holy": { sp: 0.5, healing: 1, crit: 8, int: 0.4, stam: 0.2, spirit: 0.6, mp5: 3, hit: 0 },
    "Discipline": { sp: 0.6, healing: 1, crit: 10, int: 0.5, stam: 0.2, spirit: 0.5, mp5: 2, hit: 0 },
    "Shadow": { sp: 1, hit: 12, crit: 9, int: 0.2, stam: 0, spirit: 0.2 },
    
    "Arms": { ap: 1, str: 2, agi: 1, crit: 20, hit: 15, stam: 0.5, int: 0, spirit: 0 },
    "Fury": { ap: 1, str: 2, agi: 1.2, crit: 22, hit: 18, stam: 0.5, int: 0, spirit: 0 },
    "Protection": { defense: 1.5, stam: 1.5, armor: 0.1, hit: 5, str: 0.5, agi: 0.5, ap: 0.2, int: 0, spirit: 0, crit: 0 },

    "Combat": { ap: 1, agi: 1.5, str: 0.5, crit: 18, hit: 22, stam: 0.3, int: 0, spirit: 0 },
    "Assassination": { ap: 1, agi: 1.6, str: 0.5, crit: 20, hit: 15, stam: 0.2, int: 0, spirit: 0 },
    "Subtlety": { ap: 1, agi: 1.8, str: 0.4, crit: 18, hit: 12, stam: 0.5, int: 0, spirit: 0 },
    
    "Marksmanship": { ap: 0.45, agi: 1, crit: 15, hit: 15, int: 0.1, stam: 0.2, spirit: 0 },
    "Beast Mastery": { ap: 0.4, agi: 1, crit: 12, hit: 12, int: 0.1, stam: 0.3, spirit: 0 },
    "Survival": { ap: 0.4, agi: 1.1, crit: 14, hit: 14, int: 0.1, stam: 0.3, spirit: 0 },
    
    "Restoration": { healing: 1, sp: 0.4, crit: 8, int: 0.4, spirit: 0.6, mp5: 3, stam: 0.2, hit: 0 },
    "Balance": { sp: 1, hit: 12, crit: 10, int: 0.3, stam: 0.2, spirit: 0.1 },
    "Feral": { ap: 1, str: 2.2, agi: 1, crit: 18, hit: 15, stam: 0.8, int: 0.1, spirit: 0 },
    
    "Restoration (Shaman)": { healing: 1, sp: 0.4, crit: 9, int: 0.3, mp5: 2.5, spirit: 0.2, stam: 0.2, hit: 0 },
    "Elemental": { sp: 1, hit: 11, crit: 10, int: 0.3, stam: 0.2, spirit: 0.1 },
    "Enhancement": { ap: 1, str: 2, agi: 1, crit: 18, hit: 16, int: 0.3, stam: 0.5, spirit: 0.1 },
    
    "Holy (Paladin)": { healing: 1, sp: 0.3, crit: 12, int: 0.5, mp5: 2, stam: 0.2, spirit: 0.1, hit: 0 },
    "Protection (Paladin)": { defense: 1.2, stam: 1.2, sp: 0.6, int: 0.3, armor: 0.1, hit: 3, str: 0.2, agi: 0.1, ap: 0.1, spirit: 0, crit: 0 },
    "Retribution": { ap: 1, str: 2, agi: 0.8, crit: 16, hit: 14, sp: 0.4, int: 0.2, stam: 0.4, spirit: 0 },
    
    "Smite": { sp: 0.8, healing: 0.5, crit: 10, hit: 10, int: 0.4, stam: 0.2, spirit: 0.4, mp5: 2 }
};

export const RARITY_WEIGHTS: Record<string, StatWeights> = {
    "common": { sp: 0, hit: 0, crit: 0, int: 0, stam: 0, spirit: 0 },
    "uncommon": { sp: 0.5, hit: 5, crit: 5, int: 0.1, stam: 0.1, spirit: 0.1 },
    "rare": { sp: 1, hit: 10, crit: 10, int: 0.2, stam: 0.2, spirit: 0.2 },
    "epic": { sp: 1.5, hit: 15, crit: 15, int: 0.3, stam: 0.3, spirit: 0.3 },
    "legendary": { sp: 2, hit: 20, crit: 20, int: 0.5, stam: 0.5, spirit: 0.5 },
};

export const ITEM_DATABASE: Item[] = [
    // --- LEGENDARY ---
    { name: "Atiesh, Greatstaff of the Guardian", slot: "Staff", rarity: "Legendary", source: "Naxxramas", icon: "inv_staff_medivh", stats: { sp: 150, crit: 2, hit: 2, int: 32, sta: 30, spi: 24 }, classes: ["Warlock", "Mage", "Priest", "Druid"] },
    { name: "Thunderfury, Blessed Blade of the Windseeker", slot: "One-Hand", rarity: "Legendary", source: "Molten Core", icon: "inv_sword_39", stats: { agi: 5, sta: 8, resFire: 8, resNature: 8 }, proc: "Blast enemy for 300 Nature dmg and slow attack speed.", classes: ["Warrior", "Rogue", "Paladin", "Hunter"] },
    { name: "Sulfuras, Hand of Ragnaros", slot: "Two-Hand", rarity: "Legendary", source: "Molten Core", icon: "inv_hammer_unique_sulfuras", stats: { str: 12, sta: 12, resFire: 30 }, proc: "Deals 273-333 Fire damage and sears for 75 dot.", classes: ["Warrior", "Paladin", "Shaman", "Druid"] },

    // --- HEAD ---
    { name: "Mish'undare, Circlet of the Mind Flayer", slot: "Head", rarity: "Epic", source: "Blackwing Lair", icon: "inv_helmet_49", stats: { sp: 35, crit: 2, int: 24, sta: 15, spi: 9 } },
    { name: "Plagueheart Circlet", slot: "Head", rarity: "Epic", source: "Naxxramas", icon: "inv_helmet_06", stats: { sp: 36, crit: 1, hit: 1, int: 22, sta: 25 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Doomcaller's Circlet", slot: "Head", rarity: "Epic", source: "AQ40", icon: "inv_helmet_06", stats: { sp: 33, crit: 1, hit: 1, int: 22, sta: 23 }, classes: ["Warlock"] },
    { name: "Nemesis Skullcap", slot: "Head", rarity: "Epic", source: "Blackwing Lair", icon: "inv_helmet_15", stats: { sp: 32, int: 26, sta: 19 }, setName: "Nemesis Raiment", classes: ["Warlock"] },
    { name: "Felheart Horns", slot: "Head", rarity: "Epic", source: "Molten Core", icon: "inv_helmet_05", stats: { sp: 20, int: 20, sta: 23, spi: 10, hit: 1 }, setName: "Felheart Raiment", classes: ["Warlock"] },
    { name: "Spellweaver's Turban", slot: "Head", rarity: "Epic", source: "UBRS", icon: "inv_helmet_24", stats: { sp: 36, hit: 1, int: 9 } },

    // --- NECK ---
    { name: "Choker of the Fire Lord", slot: "Neck", rarity: "Epic", source: "Molten Core", icon: "inv_jewelry_necklace_12", stats: { sp: 34, int: 7 } },
    { name: "Charm of the Shifting Sands", slot: "Neck", rarity: "Epic", source: "AQ20", icon: "inv_jewelry_necklace_26", stats: { sp: 25, int: 12, sta: 9 } },
    { name: "Gem of Trapped Innocents", slot: "Neck", rarity: "Epic", source: "Naxxramas", icon: "inv_jewelry_necklace_26", stats: { sp: 15, crit: 1, hit: 1, int: 7 } },
    { name: "Soul Corrupter's Necklace", slot: "Neck", rarity: "Epic", source: "Zul'Gurub", icon: "inv_jewelry_necklace_19", stats: { sp: 16, crit: 1, int: 10, sta: 10 } },
    { name: "Anastari Heirloom", slot: "Neck", rarity: "Rare", source: "Stratholme", icon: "inv_jewelry_necklace_09", stats: { spShadow: 13, sta: 15 } },

    // --- SHOULDER ---
    { name: "Mantle of the Blackwing Cabal", slot: "Shoulder", rarity: "Epic", source: "Blackwing Lair", icon: "inv_shoulder_29", stats: { sp: 34, int: 16, sta: 12 } },
    { name: "Plagueheart Shoulderpads", slot: "Shoulder", rarity: "Epic", source: "Naxxramas", icon: "inv_shoulder_23", stats: { sp: 29, hit: 1, int: 14, sta: 22 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Doomcaller's Mantle", slot: "Shoulder", rarity: "Epic", source: "AQ40", icon: "inv_shoulder_23", stats: { sp: 28, crit: 1, int: 14, sta: 20 }, classes: ["Warlock"] },
    { name: "Nemesis Spaulders", slot: "Shoulder", rarity: "Epic", source: "Blackwing Lair", icon: "inv_shoulder_19", stats: { sp: 26, int: 23, sta: 22 }, setName: "Nemesis Raiment", classes: ["Warlock"] },
    { name: "Felheart Shoulder Pads", slot: "Shoulder", rarity: "Epic", source: "Molten Core", icon: "inv_shoulder_23", stats: { spShadow: 13, int: 20, sta: 22, spi: 8 }, setName: "Felheart Raiment", classes: ["Warlock"] },

    // --- BACK ---
    { name: "Cloak of the Brood Lord", slot: "Back", rarity: "Epic", source: "Blackwing Lair", icon: "inv_misc_cape_20", stats: { sp: 28, int: 14, sta: 10 } },
    { name: "Cloak of Consumption", slot: "Back", rarity: "Epic", source: "Zul'Gurub", icon: "inv_misc_cape_18", stats: { sp: 23, hit: 1, int: 10 } },
    { name: "Cloak of the Necropolis", slot: "Back", rarity: "Epic", source: "Naxxramas", icon: "inv_misc_cape_16", stats: { sp: 26, crit: 1, hit: 1, int: 11, sta: 10 } },
    { name: "Shroud of the Nathrezim", slot: "Back", rarity: "Epic", source: "Stratholme", icon: "inv_misc_cape_20", stats: { sp: 20, int: 16, sta: 10 } },
    
    // --- CHEST ---
    { name: "Plagueheart Robe", slot: "Chest", rarity: "Epic", source: "Naxxramas", icon: "inv_chest_cloth_03", stats: { sp: 44, crit: 1, hit: 1, int: 24, sta: 30 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Robe of Volatile Power", slot: "Chest", rarity: "Epic", source: "Molten Core", icon: "inv_chest_cloth_49", stats: { sp: 23, crit: 2, int: 15, sta: 10 } },
    { name: "Doomcaller's Robes", slot: "Chest", rarity: "Epic", source: "AQ40", icon: "inv_chest_cloth_03", stats: { sp: 39, crit: 1, hit: 1, int: 24, sta: 28 }, classes: ["Warlock"] },
    { name: "Nemesis Robes", slot: "Chest", rarity: "Epic", source: "Blackwing Lair", icon: "inv_chest_cloth_16", stats: { sp: 32, crit: 1, int: 26, sta: 24 }, setName: "Nemesis Raiment", classes: ["Warlock"] },
    { name: "Bloodvine Vest", slot: "Chest", rarity: "Rare", source: "Crafting", icon: "inv_chest_cloth_08", stats: { sp: 27, hit: 2, int: 13 } },
    { name: "Robes of the Battleguard", slot: "Chest", rarity: "Epic", source: "AQ40", icon: "inv_chest_cloth_46", stats: { sp: 36, hit: 1, int: 20, sta: 20 } },

    // --- WRIST ---
    { name: "Bracers of Arcane Accuracy", slot: "Wrist", rarity: "Epic", source: "Blackwing Lair", icon: "inv_bracer_09", stats: { sp: 21, hit: 1, int: 12, sta: 9 } },
    { name: "Plagueheart Bindings", slot: "Wrist", rarity: "Epic", source: "Naxxramas", icon: "inv_bracer_13", stats: { sp: 23, crit: 1, int: 16, sta: 20 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Rockfury Bracers", slot: "Wrist", rarity: "Epic", source: "Silithus", icon: "inv_bracer_07", stats: { sp: 27, hit: 1, sta: 7 } },
    
    // --- HANDS ---
    { name: "Ebony Flame Gloves", slot: "Hands", rarity: "Epic", source: "Blackwing Lair", icon: "inv_gauntlets_05", stats: { spShadow: 43, spFire: 43, int: 17, sta: 10 } },
    { name: "Dark Storm Gauntlets", slot: "Hands", rarity: "Epic", source: "AQ40", icon: "inv_gauntlets_24", stats: { sp: 37, hit: 1, int: 15, sta: 19 } },
    { name: "Plagueheart Gloves", slot: "Hands", rarity: "Epic", source: "Naxxramas", icon: "inv_gauntlets_19", stats: { sp: 26, crit: 1, hit: 1, int: 17, sta: 22 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Nemesis Gloves", slot: "Hands", rarity: "Epic", source: "Blackwing Lair", icon: "inv_gauntlets_14", stats: { sp: 15, crit: 1, int: 17, sta: 18 }, setName: "Nemesis Raiment", classes: ["Warlock"] },
    { name: "Bloodtinged Gloves", slot: "Hands", rarity: "Rare", source: "Zul'Gurub", icon: "inv_gauntlets_08", stats: { sp: 19, hit: 1, int: 10, sta: 10 } },

    // --- WAIST ---
    { name: "Belt of Never-ending Agony", slot: "Waist", rarity: "Epic", source: "AQ40", icon: "inv_belt_29", stats: { sp: 64, crit: 1, hit: 1, sta: 20, int: 20 } }, 
    { name: "Eyestalk Waist Cord", slot: "Waist", rarity: "Epic", source: "AQ40", icon: "inv_belt_12", stats: { sp: 41, crit: 1, int: 9, sta: 9 } },
    { name: "Plagueheart Belt", slot: "Waist", rarity: "Epic", source: "Naxxramas", icon: "inv_belt_29", stats: { sp: 34, crit: 1, hit: 1, int: 20, sta: 12 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Mana Igniting Cord", slot: "Waist", rarity: "Epic", source: "Molten Core", icon: "inv_belt_13", stats: { sp: 25, crit: 1, int: 16 } },
    { name: "Sash of Whispering Secrets", slot: "Waist", rarity: "Epic", source: "Molten Core", icon: "inv_belt_18", stats: { sp: 33, hit: 1, int: 20, sta: 17 } },

    // --- LEGS ---
    { name: "Leggings of the Black Blizzard", slot: "Legs", rarity: "Epic", source: "AQ20", icon: "inv_pants_cloth_05", stats: { sp: 41, crit: 1, int: 16, sta: 14 } },
    { name: "Plagueheart Leggings", slot: "Legs", rarity: "Epic", source: "Naxxramas", icon: "inv_pants_cloth_03", stats: { sp: 37, crit: 1, hit: 1, int: 24, sta: 26 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Doomcaller's Trousers", slot: "Legs", rarity: "Epic", source: "AQ40", icon: "inv_pants_cloth_03", stats: { sp: 33, crit: 1, hit: 1, int: 24, sta: 24 }, classes: ["Warlock"] },
    { name: "Nemesis Leggings", slot: "Legs", rarity: "Epic", source: "Molten Core", icon: "inv_pants_cloth_16", stats: { sp: 30, crit: 1, int: 26, sta: 24 }, setName: "Nemesis Raiment", classes: ["Warlock"] },
    { name: "Bloodvine Leggings", slot: "Legs", rarity: "Rare", source: "Crafting", icon: "inv_pants_cloth_14", stats: { sp: 37, hit: 1, int: 6 } },

    // --- FEET ---
    { name: "Boots of Epiphany", slot: "Feet", rarity: "Epic", source: "AQ40", icon: "inv_boots_cloth_01", stats: { sp: 34, hit: 1, int: 19, sta: 18 } },
    { name: "Plagueheart Sandals", slot: "Feet", rarity: "Epic", source: "Naxxramas", icon: "inv_boots_cloth_07", stats: { sp: 29, crit: 1, hit: 1, int: 18, sta: 22 }, setName: "Plagueheart Raiment", classes: ["Warlock"] },
    { name: "Maleki's Footwraps", slot: "Feet", rarity: "Rare", source: "Stratholme", icon: "inv_boots_07", stats: { spShadow: 27, int: 9, sta: 9 } },
    { name: "Bloodvine Boots", slot: "Feet", rarity: "Rare", source: "Crafting", icon: "inv_boots_cloth_03", stats: { sp: 19, hit: 1, int: 16 } },

    // --- RINGS ---
    { name: "Ring of the Fallen God", slot: "Ring", rarity: "Epic", source: "AQ40", icon: "inv_jewelry_ring_35", stats: { sp: 37, hit: 1, int: 6, sta: 5 } },
    { name: "Band of Forced Concentration", slot: "Ring", rarity: "Epic", source: "Blackwing Lair", icon: "inv_jewelry_ring_41", stats: { sp: 21, hit: 1, int: 12, sta: 9 } },
    { name: "Pure Elementium Band", slot: "Ring", rarity: "Epic", source: "Blackwing Lair", icon: "inv_jewelry_ring_42", stats: { sp: 28, int: 10, sta: 9 } },
    { name: "Band of Dark Dominion", slot: "Ring", rarity: "Rare", source: "BWL", icon: "inv_jewelry_ring_12", stats: { spShadow: 33, int: 6 } },
    { name: "Maiden's Circle", slot: "Ring", rarity: "Rare", source: "World Drop", icon: "inv_jewelry_ring_24", stats: { sp: 18, int: 7, sta: 6 } },
    { name: "Ring of Spell Power", slot: "Ring", rarity: "Epic", source: "Molten Core", icon: "inv_jewelry_ring_39", stats: { sp: 33 } },

    // --- TRINKETS ---
    { name: "Neltharion's Tear", slot: "Trinket", rarity: "Epic", source: "Blackwing Lair", icon: "inv_misc_gem_pearl_02", stats: { sp: 44, hit: 2 } },
    { name: "Talisman of Ephemeral Power", slot: "Trinket", rarity: "Epic", source: "Molten Core", icon: "inv_misc_stonetablet_11", stats: {}, use: "Increases spell power by 175 for 20 sec." },
    { name: "Zandalarian Hero Charm", slot: "Trinket", rarity: "Epic", source: "Zul'Gurub", icon: "inv_jewelry_talisman_13", stats: { sp: 28, spArcane: 0, spFire: 0, spFrost: 0, spHoly: 0, spNature: 0, spShadow: 0 }, use: "Increases spell damage by up to 204 and healing by up to 380 for 20 sec." },
    { name: "The Restrained Essence of Sapphiron", slot: "Trinket", rarity: "Epic", source: "Naxxramas", icon: "inv_trinket_naxxramas04", stats: { sp: 40 }, use: "Increases spell power by 130 for 20 sec." },
    { name: "Briarwood Reed", slot: "Trinket", rarity: "Rare", source: "UBRS", icon: "inv_misc_root_01", stats: { sp: 29 } },

    // --- MAIN HAND ---
    { name: "Wraith Blade", slot: "Main Hand", rarity: "Epic", source: "Naxxramas", icon: "inv_sword_63", stats: { sp: 95, crit: 1, hit: 1, int: 8 } },
    { name: "Claw of Chromaggus", slot: "Main Hand", rarity: "Epic", source: "Blackwing Lair", icon: "inv_weapon_shortblade_27", stats: { sp: 64, int: 17, sta: 7 } },
    { name: "Azuresong Mageblade", slot: "Main Hand", rarity: "Epic", source: "Molten Core", icon: "inv_sword_39", stats: { sp: 40, crit: 1, int: 12, sta: 7 } },
    { name: "Staff of the Shadow Flame", slot: "Two-Hand", rarity: "Epic", source: "Blackwing Lair", icon: "inv_staff_33", stats: { sp: 84, crit: 2, int: 29, sta: 24 } },
    { name: "Soulseeker", slot: "Two-Hand", rarity: "Rare", source: "Alterac Valley", icon: "inv_staff_22", stats: { sp: 30, crit: 1, int: 18, sta: 20 } },

    // --- OFF HAND ---
    { name: "Talon of Naxxramas", slot: "Off Hand", rarity: "Epic", source: "Naxxramas", icon: "inv_misc_monsterclaw_02", stats: { sp: 36, crit: 1, hit: 1, int: 8, sta: 5 } },
    { name: "Jin'do's Bag of Whammies", slot: "Off Hand", rarity: "Epic", source: "Zul'Gurub", icon: "inv_misc_bag_18", stats: { sp: 18, hit: 1, int: 11, sta: 8 } },
    { name: "Tome of Shadow Force", slot: "Off Hand", rarity: "Rare", source: "Alterac Valley", icon: "inv_misc_book_08", stats: { spShadow: 34, int: 8, sta: 8 } },

    // --- WAND ---
    { name: "Wand of Fates", slot: "Ranged", rarity: "Epic", source: "Naxxramas", icon: "inv_wand_06", stats: { sp: 16, hit: 1, int: 7 } },
    { name: "Touch of Chaos", slot: "Ranged", rarity: "Epic", source: "Zul'Gurub", icon: "inv_wand_08", stats: { sp: 18 } },
    { name: "Bonecreeper Stylus", slot: "Ranged", rarity: "Rare", source: "Scholomance", icon: "inv_wand_09", stats: { sp: 11, int: 4 } },
];
