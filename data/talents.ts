
import { TalentTree, TalentDef, ClassName, ItemStats } from '../types';

// Helper to construct talents less verbosely
const t = (
    id: number, name: string, icon: string, row: number, col: number, maxRank: number, 
    desc: (r: number) => string, 
    opts: { prereq?: number, stats?: (r: number) => ItemStats } = {}
): TalentDef => ({
    id, name, icon, row, col, maxRank, description: desc, prereq: opts.prereq, stats: opts.stats
});

const WARLOCK: TalentTree[] = [
    {
        name: "Affliction", icon: "spell_shadow_deathcoil", background: "warlock_affliction", color: "#9482C9",
        talents: [
            t(101, "Suppression", "spell_shadow_unsummonbuilding", 0, 1, 5, r => `Reduces chance for enemies to resist Affliction spells by ${r * 2}%.`, { stats: r => ({ hit: r * 2 }) }),
            t(102, "Improved Corruption", "spell_shadow_abominationexplosion", 0, 2, 5, r => `Reduces casting time of Corruption by ${r * 0.4} sec.`),
            t(103, "Imp. Curse of Weakness", "spell_shadow_curseofmannoroth", 1, 0, 3, r => `Increases effect of Curse of Weakness by ${r * 6}%.`),
            t(104, "Improved Drain Soul", "spell_shadow_haunting", 1, 1, 2, r => `Chance to get 100% mana regen increase on kill.`),
            t(105, "Improved Life Tap", "spell_shadow_burningspirit", 1, 2, 2, r => `Increases Mana awarded by Life Tap by ${r * 10}%.`),
            t(106, "Improved Drain Life", "spell_shadow_lifedrain", 1, 3, 5, r => `Increases Health drained by Drain Life by ${r * 2}%.`),
            t(107, "Imp. Curse of Agony", "spell_shadow_curseofsargeras", 2, 0, 3, r => `Increases damage done by Curse of Agony by ${r * 2}%.`),
            t(108, "Fel Concentration", "spell_shadow_fingerofdeath", 2, 1, 5, r => `Reduces interruption chance while draining by ${r * 14}%.`),
            t(109, "Amplify Curse", "spell_shadow_contagion", 2, 2, 1, r => `Increases effect of next Curse by 50%.`),
            t(110, "Grim Reach", "spell_shadow_callofbone", 3, 0, 2, r => `Increases range of Affliction spells by ${r * 10}%.`),
            t(111, "Nightfall", "spell_shadow_twilight", 3, 1, 2, r => `${r * 2}% chance for Corruption/Drain Life to cause instant Shadow Bolt.`),
            t(112, "Improved Drain Mana", "spell_shadow_siphonmana", 3, 3, 2, r => `Causes 30% of drained mana to damage the opponent.`, { prereq: 106 }),
            t(113, "Siphon Life", "spell_shadow_requiem", 4, 1, 1, r => `Transfers health from the enemy to the caster.`, { prereq: 116 }), // Note: Prereq logic handles visual arrow
            t(114, "Curse of Exhaustion", "spell_shadow_grimward", 4, 2, 1, r => `Reduces target's movement speed.`, { prereq: 109 }),
            t(115, "Imp. Curse of Exhaustion", "spell_shadow_grimward", 4, 3, 4, r => `Increases speed reduction by ${r * 5}%.`, { prereq: 114 }),
            t(116, "Shadow Mastery", "spell_shadow_shadowwordpain", 5, 1, 5, r => `Increases Shadow damage dealt by ${r * 2}%.`, { stats: r => ({ damagePercent: r * 2 }), prereq: 113 }),
            t(117, "Dark Pact", "spell_shadow_darkritual", 6, 1, 1, r => `Drains mana from your summoned demon.`, { prereq: 116 })
        ]
    },
    {
        name: "Demonology", icon: "spell_shadow_metamorphosis", background: "warlock_demonology", color: "#ff7d0a",
        talents: [
            t(201, "Improved Healthstone", "inv_stone_04", 0, 0, 2, r => `Increases Healthstone healing by ${r * 10}%.`),
            t(202, "Improved Imp", "spell_shadow_summonimp", 0, 1, 3, r => `Increases Imp effect by ${r * 10}%.`),
            t(203, "Demonic Embrace", "spell_shadow_metamorphosis", 0, 2, 5, r => `+${r*3}% Stamina, -${r}% Spirit.`, { stats: r => ({ staminaMod: r*3, spiritMod: -r }) }),
            t(204, "Improved Voidwalker", "spell_shadow_summonvoidwalker", 1, 0, 3, r => `Increases Voidwalker spells by ${r * 10}%.`),
            t(205, "Fel Intellect", "spell_holy_magicalsentry", 1, 1, 5, r => `Increases Pet Mana by ${r * 3}%.`),
            t(206, "Improved Succubus", "spell_shadow_summonsuccubus", 1, 2, 3, r => `Increases Succubus spells by ${r * 10}%.`),
            t(207, "Fel Domination", "spell_nature_removecurse", 2, 1, 1, r => `Next summon is fast and cheap.`),
            t(208, "Fel Stamina", "spell_shadow_shadowward", 2, 2, 5, r => `Increases Pet Health by ${r * 3}%.`),
            t(209, "Master Summoner", "spell_shadow_summonfelhunter", 2, 3, 2, r => `Reduces summon cast time by ${r * 2} sec.`, { prereq: 207 }),
            t(210, "Unholy Power", "spell_shadow_shadowworddominate", 3, 1, 5, r => `Increases Pet melee damage by ${r * 4}%.`),
            t(211, "Imp. Enslave Demon", "spell_shadow_enslavedemon", 3, 2, 5, r => `Reduces attack/cast penalty by ${r * 2}%.`),
            t(212, "Demonic Sacrifice", "spell_shadow_psychicscream", 4, 1, 1, r => `Sacrifice pet for buff.`, { prereq: 210 }),
            t(213, "Master Demonologist", "spell_shadow_shadowpact", 4, 3, 5, r => `Grants effect while demon active. (+${r*2}% Dmg w/ Succubus)`, { stats: r => ({ damagePercent: r * 2 }), prereq: 209 }),
            t(214, "Soul Link", "spell_shadow_gathershadows", 6, 1, 1, r => `30% damage split with pet. +3% Dmg.`, { stats: r => ({ damagePercent: 3 }), prereq: 212 })
        ]
    },
    {
        name: "Destruction", icon: "spell_shadow_rainoffire", background: "warlock_destruction", color: "#ff0000",
        talents: [
            t(301, "Imp. Shadow Bolt", "spell_shadow_shadowbolt", 0, 1, 5, r => `Crits increase Shadow Dmg by 20%.`),
            t(302, "Cataclysm", "spell_fire_windsofwoe", 0, 2, 5, r => `Reduces Mana cost by ${r}%.`),
            t(303, "Bane", "spell_shadow_deathpact", 1, 1, 5, r => `Reduces Shadow Bolt/Immolate cast time by ${r * 0.1}s.`),
            t(304, "Aftermath", "spell_fire_fire", 1, 2, 5, r => `Chance to daze.`),
            t(305, "Improved Firebolt", "spell_fire_firebolt", 2, 0, 2, r => `Reduces Imp Firebolt cast time.`),
            t(306, "Improved Lash of Pain", "spell_shadow_curse", 2, 1, 2, r => `Reduces Lash of Pain CD.`),
            t(307, "Devastation", "spell_fire_flameshock", 2, 2, 5, r => `+${r}% Crit with Destruction spells.`, { stats: r => ({ crit: r }) }),
            t(308, "Shadowburn", "spell_shadow_scourgebuild", 2, 3, 1, r => `Instant Shadow damage.`),
            t(309, "Intensity", "spell_fire_lavaspawn", 3, 0, 2, r => `Resist pushback while AOEing.`),
            t(310, "Destructive Reach", "spell_shadow_corpseexplode", 3, 1, 2, r => `+${r * 10}% Range on Destruction spells.`),
            t(311, "Imp. Searing Pain", "spell_fire_soulburn", 3, 3, 5, r => `+${r * 2}% Crit with Searing Pain.`),
            t(312, "Pyroclasm", "spell_fire_volcano", 4, 0, 2, r => `Chance to stun on AOE.`),
            t(313, "Ruin", "spell_shadow_shadowwordpain", 4, 1, 1, r => `+100% Crit Damage bonus.`, { prereq: 307 }),
            t(314, "Emberstorm", "spell_fire_selfdestruct", 4, 2, 5, r => `+${r * 2}% Fire Damage.`, { stats: r => ({ spFire: 0 }) }), 
            t(315, "Conflagrate", "spell_fire_fireball", 6, 1, 1, r => `Consumes Immolate for instant damage.`, { prereq: 314 })
        ]
    }
];

const MAGE: TalentTree[] = [
    {
        name: "Arcane", icon: "spell_holy_magicalsentry", background: "mage_arcane", color: "#69CCF0",
        talents: [
            t(101, "Arcane Subtlety", "spell_holy_dispelmagic", 0, 0, 2, r => `Reduces threat by ${r*20}% and resistance by ${r*5}.`),
            t(102, "Arcane Focus", "spell_holy_devotion", 0, 1, 5, r => `+${r*2}% Hit with Arcane Spells.`, { stats: r => ({ hit: r*2 }) }),
            t(103, "Imp. Arcane Missiles", "spell_nature_starfall", 0, 2, 5, r => `100% chance to avoid pushback.`),
            t(104, "Wand Specialization", "inv_wand_01", 1, 0, 2, r => `+${r*12.5}% Wand Damage.`),
            t(105, "Magic Absorption", "spell_nature_astralrecalgroup", 1, 1, 5, r => `+${r*2} All Resistances.`, { stats: r => ({ resFire: r*2, resFrost: r*2, resNature: r*2, resShadow: r*2, resArcane: r*2 }) }),
            t(106, "Arcane Concentration", "spell_shadow_manaburn", 1, 2, 5, r => `${r*2}% chance of Clearcasting.`),
            t(107, "Magic Attunement", "spell_nature_abolishmagic", 2, 0, 2, r => `Amplify Magic/Dampen Magic +${r*25}%.`),
            t(108, "Imp. Arcane Explosion", "spell_nature_wispsplode", 2, 1, 3, r => `+${r*2}% Crit with Arcane Explosion.`),
            t(109, "Arcane Resilience", "spell_arcane_arcaneresilience", 2, 2, 1, r => `Armor increased by 50% of Int.`),
            t(110, "Imp. Mana Shield", "spell_shadow_detectlesserinvisibility", 3, 0, 2, r => `Decreases mana lost per dmg by ${r*10}%.`),
            t(111, "Imp. Counterspell", "spell_frost_iceshock", 3, 1, 2, r => `Silences target for ${r*2} sec.`),
            t(112, "Arcane Meditation", "spell_shadow_siphonmana", 3, 3, 3, r => `Allows ${r*5}% mana regen while casting.`, { stats: r => ({ regenCasting: r*5 }) }),
            t(113, "Presence of Mind", "spell_nature_enchantarmor", 4, 1, 1, r => `Next spell is instant cast.`),
            t(114, "Arcane Mind", "spell_shadow_charm", 4, 2, 5, r => `Increases total Intellect by ${r*3}%.`, { stats: r => ({ intMod: r*3 }) }),
            t(115, "Arcane Instability", "spell_shadow_teleport", 5, 1, 3, r => `+${r}% Spell Dmg and +${r}% Crit.`, { stats: r => ({ damagePercent: r, crit: r }), prereq: 113 }),
            t(116, "Arcane Power", "spell_nature_lightning", 6, 1, 1, r => `+30% Dmg, +30% Mana cost.`, { prereq: 115 })
        ]
    },
    {
        name: "Fire", icon: "spell_fire_firebolt02", background: "mage_fire", color: "#ff4400",
        talents: [
            t(201, "Imp. Fireball", "spell_fire_flamebolt", 0, 1, 5, r => `Reduces Fireball cast time by ${r*0.1}s.`),
            t(202, "Impact", "spell_fire_meteorstorm", 0, 2, 5, r => `Chance to stun.`),
            t(203, "Ignite", "spell_fire_incinerate", 1, 0, 5, r => `Crits burn for ${r*8}% additional dmg.`),
            t(204, "Flame Throwing", "spell_fire_flare", 1, 1, 2, r => `+${r*3} yds range for Fire spells.`),
            t(205, "Imp. Fire Blast", "spell_fire_fireball", 1, 2, 3, r => `Reduces Fire Blast CD.`),
            t(206, "Incinerate", "spell_fire_flameshock", 2, 0, 2, r => `+${r*2}% Crit with Fire Blast/Scorch.`),
            t(207, "Imp. Flamestrike", "spell_fire_selfdestruct", 2, 1, 3, r => `+${r*5}% Crit with Flamestrike.`),
            t(208, "Pyroblast", "spell_fire_fireball02", 2, 2, 1, r => `Massive Fire boulder.`),
            t(209, "Burning Soul", "spell_fire_fire", 2, 3, 2, r => `Reduces threat and pushback.`),
            t(210, "Imp. Scorch", "spell_fire_soulburn", 3, 0, 3, r => `Scorch applies Fire Vulnerability.`),
            t(211, "Imp. Fire Ward", "spell_fire_firearmor", 3, 1, 2, r => `Reflects Fire spells.`),
            t(212, "Master of Elements", "spell_fire_masterofelements", 3, 3, 3, r => `Crits refund ${r*10}% mana cost.`),
            t(213, "Critical Mass", "spell_nature_wispheal", 4, 1, 3, r => `+${r*2}% Crit with Fire spells.`, { stats: r => ({ crit: r*2 }) }),
            t(214, "Blast Wave", "spell_holy_excorcism_02", 4, 2, 1, r => `AOE Fire damage and slow.`, { prereq: 208 }),
            t(215, "Fire Power", "spell_fire_immolation", 5, 2, 5, r => `+${r*2}% Fire Damage.`, { stats: r => ({ damagePercent: r*2 }) }),
            t(216, "Combustion", "spell_fire_sealoffire", 6, 1, 1, r => `Increases crit chance until 3 crits.`, { prereq: 213 })
        ]
    },
    {
        name: "Frost", icon: "spell_frost_frostbolt02", background: "mage_frost", color: "#69CCF0",
        talents: [
            t(301, "Frost Warding", "spell_frost_frostward", 0, 0, 2, r => `Armor/Resist buff.`),
            t(302, "Imp. Frostbolt", "spell_frost_frostbolt02", 0, 1, 5, r => `Reduces cast time by ${r*0.1}s.`),
            t(303, "Elemental Precision", "spell_ice_magicdamage", 0, 2, 3, r => `+${r*2}% Hit with Frost/Fire.`, { stats: r => ({ hit: r*2 }) }),
            t(304, "Ice Shards", "spell_frost_iceshard", 1, 0, 5, r => `+${r*20}% Crit Damage bonus.`),
            t(305, "Frostbite", "spell_frost_frostarmor", 1, 1, 3, r => `Chance to freeze target.`),
            t(306, "Imp. Frost Nova", "spell_frost_freezingbreath", 1, 2, 2, r => `Reduces CD.`),
            t(307, "Permafrost", "spell_frost_wisp", 1, 3, 3, r => `Increases chill duration.`),
            t(308, "Piercing Ice", "spell_frost_frostbolt", 2, 0, 3, r => `+${r*2}% Frost Damage.`, { stats: r => ({ damagePercent: r*2 }) }),
            t(309, "Cold Snap", "spell_frost_wizardmark", 2, 1, 1, r => `Resets Frost CDs.`),
            t(310, "Imp. Blizzard", "spell_frost_icestorm", 2, 3, 3, r => `Blizzard adds chill effect.`),
            t(311, "Arctic Reach", "spell_shadow_darkritual", 3, 0, 2, r => `+${r*10}% Range.`),
            t(312, "Frost Channeling", "spell_frost_stun", 3, 1, 3, r => `Reduces mana cost and threat.`),
            t(313, "Shatter", "spell_frost_frostshock", 3, 2, 5, r => `+${r*10}% Crit against frozen targets.`, { prereq: 306 }),
            t(314, "Ice Block", "spell_frost_frost", 4, 1, 1, r => `Become immune to everything.`),
            t(315, "Imp. Cone of Cold", "spell_frost_glacier", 4, 2, 3, r => `+${r*10}% Damage.`),
            t(316, "Winter's Chill", "spell_frost_chillingblast", 5, 2, 5, r => `Stacking Crit chance debuff on target.`),
            t(317, "Arctic Winds", "spell_frost_arcticwinds", 5, 0, 5, r => `+${r}% Hit / -${r}% Dmg taken.`, { stats: r => ({ hit: r }) }),
            t(318, "Ice Barrier", "spell_ice_lament", 6, 1, 1, r => `Absorbs damage.`, { prereq: 314 })
        ]
    }
];

const WARRIOR: TalentTree[] = [
    {
        name: "Arms", icon: "ability_rogue_eviscerate", background: "warrior_arms", color: "#C79C6E",
        talents: [
            t(101, "Imp. Heroic Strike", "ability_rogue_ambush", 0, 0, 3, r => `Reduces rage cost.`),
            t(102, "Deflection", "ability_parry", 0, 1, 5, r => `+${r}% Parry.`, { stats: r => ({ parry: r }) }),
            t(103, "Imp. Rend", "ability_gouge", 0, 2, 3, r => `Increases Rend damage.`),
            t(104, "Imp. Charge", "ability_warrior_charge", 1, 0, 2, r => `Increases rage generated.`),
            t(105, "Tactical Mastery", "spell_nature_enchantarmor", 1, 1, 5, r => `Retain up to ${r*5} rage when changing stance.`),
            t(106, "Imp. Thunder Clap", "ability_thunderclap", 1, 3, 3, r => `Reduces rage cost.`),
            t(107, "Imp. Overpower", "inv_sword_05", 2, 0, 2, r => `+${r*25}% Crit with Overpower.`),
            t(108, "Anger Management", "spell_holy_blessingofstamina", 2, 1, 1, r => `Generates rage in combat.`, { prereq: 105 }),
            t(109, "Deep Wounds", "ability_backstab", 2, 2, 3, r => `Crits cause bleed.`, { prereq: 103 }),
            t(110, "Two-Handed Spec", "inv_axe_09", 3, 1, 5, r => `+${r}% Damage with 2H weapons.`, { stats: r => ({ damagePercent: r }) }),
            t(111, "Impale", "ability_searingarrow", 3, 2, 2, r => `+${r*10}% Crit Damage bonus in abilities.`, { prereq: 109 }),
            t(112, "Axe Specialization", "inv_axe_06", 4, 0, 5, r => `+${r}% Crit with Axes.`, { stats: r => ({ crit: r }) }),
            t(113, "Sweeping Strikes", "ability_rogue_sliceanddice", 4, 1, 1, r => `Attacks hit 1 extra enemy.`),
            t(114, "Mace Specialization", "inv_mace_01", 4, 2, 5, r => `Chance to stun.`),
            t(115, "Sword Specialization", "inv_sword_27", 4, 3, 5, r => `Chance for extra attack.`, { stats: r => ({ haste: r }) }),
            t(116, "Polearm Specialization", "inv_weapon_halberd_01", 5, 0, 5, r => `+${r}% Crit with Polearms.`, { stats: r => ({ crit: r }) }),
            t(117, "Mortal Strike", "ability_warrior_savageblow", 6, 1, 1, r => `Weapon damage + 85 and wounds target.`, { prereq: 113 })
        ]
    },
    {
        name: "Fury", icon: "spell_nature_bloodlust", background: "warrior_fury", color: "#C79C6E",
        talents: [
            t(201, "Booming Voice", "spell_nature_purge", 0, 1, 5, r => `Increases shout duration/area.`),
            t(202, "Cruelty", "ability_rogue_eviscerate", 0, 2, 5, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
            t(203, "Imp. Demoralizing Shout", "ability_warrior_waracry", 1, 1, 5, r => `Increases attack power reduction.`),
            t(204, "Unbridled Wrath", "spell_nature_stoneclawtotem", 1, 2, 5, r => `Chance to generate rage on hit.`),
            t(205, "Imp. Cleave", "ability_warrior_cleave", 2, 0, 3, r => `Increases Cleave bonus damage.`),
            t(206, "Piercing Howl", "spell_shadow_deathscream", 2, 1, 1, r => `Dazes enemies.`),
            t(207, "Blood Craze", "spell_shadow_summonimp", 2, 2, 3, r => `Regenerate health after being crit.`),
            t(208, "Imp. Battle Shout", "ability_warrior_battleshout", 2, 3, 5, r => `+${r*5}% AP from Battle Shout.`),
            t(209, "Dual Wield Spec", "ability_dualwield", 3, 0, 5, r => `+${r*5}% Off-hand damage.`),
            t(210, "Imp. Execute", "inv_sword_48", 3, 1, 2, r => `Reduces Execute rage cost.`),
            t(211, "Enrage", "spell_shadow_unholyfrenzy", 3, 2, 5, r => `+${r*5}% Dmg after being crit.`),
            t(212, "Death Wish", "spell_shadow_deathpact", 4, 1, 1, r => `+20% Dmg, +20% Dmg taken.`),
            t(213, "Imp. Intercept", "ability_rogue_sprint", 4, 3, 2, r => `Reduces CD.`),
            t(214, "Imp. Berserker Rage", "spell_nature_ancestralguardian", 5, 0, 2, r => `Generates rage.`),
            t(215, "Flurry", "ability_ghoulfrenzy", 5, 2, 5, r => `+${r*6}% Attack Speed after crit.`, { stats: r => ({ haste: r*2 }), prereq: 211 }),
            t(216, "Bloodthirst", "spell_nature_bloodlust", 6, 1, 1, r => `Instant attack that heals.`, { prereq: 212 })
        ]
    },
    {
        name: "Protection", icon: "inv_shield_06", background: "warrior_protection", color: "#C79C6E",
        talents: [
            t(301, "Shield Specialization", "inv_shield_06", 0, 1, 5, r => `+${r}% Block chance.`, { stats: r => ({ block: r }) }),
            t(302, "Anticipation", "spell_nature_mirrorimage", 0, 2, 5, r => `+${r*2} Defense.`, { stats: r => ({ defense: r*2 }) }),
            t(303, "Imp. Bloodrage", "ability_racial_bloodrage", 1, 0, 2, r => `Generates more rage.`),
            t(304, "Toughness", "spell_holy_devotion", 1, 2, 5, r => `+${r*2}% Armor from items.`, { stats: r => ({ armor: r*100 }) }),
            t(305, "Iron Will", "spell_magic_magearmor", 1, 3, 5, r => `Resist stun/charm.`),
            t(306, "Last Stand", "spell_holy_ashestoashes", 2, 0, 1, r => `+30% HP for 20 sec.`, { prereq: 303 }),
            t(307, "Imp. Shield Block", "ability_defend", 2, 1, 1, r => `Shield Block blocks 1 extra attack and lasts longer.`, { prereq: 301 }),
            t(308, "Imp. Revenge", "ability_warrior_revenge", 2, 2, 3, r => `Chance to stun.`),
            t(309, "Defiance", "ability_warrior_innerrage", 2, 3, 5, r => `+${r*3}% Threat in Defensive Stance.`, { stats: r => ({ threatReduction: -(r*3) }) }),
            t(310, "Imp. Sunder Armor", "ability_warrior_sunder", 3, 0, 3, r => `Reduces rage cost.`),
            t(311, "Imp. Disarm", "ability_warrior_disarm", 3, 1, 3, r => `Increases duration.`),
            t(312, "Imp. Taunt", "spell_nature_reincarnation", 3, 2, 2, r => `Reduces CD.`),
            t(313, "Imp. Shield Wall", "ability_warrior_shieldwall", 4, 0, 2, r => `Increases duration.`),
            t(314, "Concussion Blow", "ability_thunderbolt", 4, 1, 1, r => `Stun target for 5 sec.`),
            t(315, "Imp. Shield Bash", "ability_warrior_shieldbash", 4, 2, 2, r => `Silences target.`),
            t(316, "One-Handed Spec", "inv_sword_20", 5, 2, 5, r => `+${r*2}% Dmg with 1H weapons.`, { stats: r => ({ damagePercent: r*2 }) }),
            t(317, "Shield Slam", "inv_shield_05", 6, 1, 1, r => `Slam target with shield.`, { prereq: 314 })
        ]
    }
];

const ROGUE: TalentTree[] = [
    {
        name: "Assassination", icon: "ability_rogue_eviscerate", background: "rogue_assassination", color: "#FFF569",
        talents: [
            t(101, "Imp. Eviscerate", "ability_rogue_eviscerate", 0, 0, 3, r => `+${r*5}% Damage.`),
            t(102, "Remorseless Attacks", "ability_fiegndead", 0, 1, 2, r => `+${r*20}% Crit after killing XP target.`),
            t(103, "Malice", "ability_racial_bloodrage", 0, 2, 5, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
            t(104, "Ruthlessness", "spell_shadow_summonfelhunter", 1, 0, 3, r => `${r*20}% Chance to add combo point on finisher.`),
            t(105, "Murder", "spell_shadow_deathscream", 1, 1, 2, r => `+${r}% Dmg vs Humanoid/Giant/Beast/Dragonkin.`),
            t(106, "Imp. Slice and Dice", "ability_rogue_sliceanddice", 1, 3, 3, r => `+${r*15}% Duration.`),
            t(107, "Relentless Strikes", "ability_warrior_decisivestrike", 2, 0, 1, r => `Finishers restore energy.`),
            t(108, "Expose Armor", "ability_warrior_riposte", 2, 1, 2, r => `Increases armor reduction.`),
            t(109, "Lethality", "ability_criticalstrike", 2, 2, 5, r => `+${r*6}% Crit Dmg bonus on generators.`, { prereq: 103 }),
            t(110, "Vile Poisons", "ability_rogue_feint", 3, 1, 5, r => `+${r*4}% Poison Dmg.`),
            t(111, "Imp. Poisons", "ability_poisons", 3, 2, 5, r => `+${r*2}% Poison application chance.`),
            t(112, "Cold Blood", "spell_ice_lament", 4, 1, 1, r => `Next attack 100% crit.`),
            t(113, "Imp. Kidney Shot", "ability_rogue_kidneyshot", 4, 2, 3, r => `Reduces CD.`),
            t(114, "Seal Fate", "spell_shadow_chilltouch", 5, 1, 5, r => `${r*20}% chance to add CP on crit.`, { prereq: 112 }),
            t(115, "Vigor", "spell_nature_earthbindtotem", 6, 1, 1, r => `+10 Max Energy.`)
        ]
    },
    {
        name: "Combat", icon: "ability_backstab", background: "rogue_combat", color: "#FFF569",
        talents: [
            t(201, "Imp. Gouge", "ability_gouge", 0, 0, 3, r => `Increases duration.`),
            t(202, "Imp. Sinister Strike", "spell_shadow_ritualofsacrifice", 0, 1, 2, r => `Reduces energy cost.`),
            t(203, "Lightning Reflexes", "spell_nature_invisibilty", 0, 2, 5, r => `+${r}% Dodge.`, { stats: r => ({ dodge: r }) }),
            t(204, "Imp. Backstab", "ability_backstab", 1, 0, 3, r => `+${r*10}% Crit with Backstab.`),
            t(205, "Deflection", "ability_parry", 1, 1, 5, r => `+${r}% Parry.`, { stats: r => ({ parry: r }) }),
            t(206, "Precision", "ability_rogue_ambush", 1, 2, 5, r => `+${r}% Hit.`, { stats: r => ({ hit: r }) }),
            t(207, "Endurance", "spell_shadow_shadowward", 2, 0, 2, r => `Reduces Evasion/Sprint CD.`),
            t(208, "Riposte", "ability_warrior_challange", 2, 1, 1, r => `Counterattack after parry.`, { prereq: 205 }),
            t(209, "Imp. Sprint", "ability_rogue_sprint", 2, 3, 2, r => `Removes movement impairs.`),
            t(210, "Imp. Kick", "ability_kick", 3, 0, 2, r => `Silence target.`),
            t(211, "Dagger Specialization", "inv_weapon_shortblade_05", 3, 1, 5, r => `+${r}% Crit with Daggers.`, { stats: r => ({ crit: r }) }),
            t(212, "Dual Wield Spec", "ability_dualwield", 3, 2, 5, r => `+${r*10}% Off-hand damage.`, { stats: r => ({ damagePercent: r*2 }), prereq: 206 }),
            t(213, "Mace Specialization", "inv_mace_01", 4, 0, 5, r => `Chance to stun.`),
            t(214, "Blade Flurry", "ability_warrior_punishingblow", 4, 1, 1, r => `+20% Attack Speed, hits extra target.`),
            t(215, "Sword Specialization", "inv_sword_27", 4, 2, 5, r => `Chance for extra attack.`, { stats: r => ({ haste: r }) }),
            t(216, "Fist Spec", "inv_gauntlets_04", 4, 3, 5, r => `+${r}% Crit with Fist Wpns.`, { stats: r => ({ crit: r }) }),
            t(217, "Weapon Expertise", "spell_holy_blessingofstrength", 5, 1, 2, r => `+${r*5} Weapon Skill.`, { stats: r => ({ hit: r, crit: r*0.5 }), prereq: 214 }),
            t(218, "Aggression", "ability_racial_avatar", 5, 2, 3, r => `+${r*2}% SS/Eviscerate damage.`),
            t(219, "Adrenaline Rush", "spell_shadow_shadowworddominate", 6, 1, 1, r => `+100% Energy Regen.`, { prereq: 217 })
        ]
    },
    {
        name: "Subtlety", icon: "ability_stealth", background: "rogue_subtlety", color: "#FFF569",
        talents: [
            t(301, "Master of Deception", "spell_shadow_charm", 0, 1, 5, r => `Increases stealth detection level.`),
            t(302, "Opportunity", "ability_warrior_waracry", 0, 2, 5, r => `+${r*4}% Backstab/Ambush/Garrote damage.`),
            t(303, "Sleight of Hand", "ability_rogue_feint", 1, 0, 2, r => `Reduces threat.`),
            t(304, "Elusiveness", "spell_magic_lesserinvisibilty", 1, 1, 2, r => `Reduces Vanish/Blind CD.`),
            t(305, "Camouflage", "ability_stealth", 1, 2, 5, r => `Increases stealth speed.`),
            t(306, "Initiative", "spell_shadow_fumble", 2, 0, 3, r => `Chance to add CP on opener.`),
            t(307, "Ghostly Strike", "spell_shadow_curse", 2, 1, 1, r => `Attack + Dodge.`),
            t(308, "Imp. Ambush", "ability_rogue_ambush", 2, 2, 3, r => `+${r*15}% Crit with Ambush.`),
            t(309, "Setup", "spell_nature_mirrorimage", 3, 0, 3, r => `Chance to add CP after dodging.`),
            t(310, "Imp. Sap", "ability_sap", 3, 1, 3, r => `Chance to return to stealth.`),
            t(311, "Serrated Blades", "inv_sword_17", 3, 2, 3, r => `Ignores armor.`),
            t(312, "Heightened Senses", "ability_ambush", 4, 0, 2, r => `Increases stealth detection.`),
            t(313, "Preparation", "spell_shadow_antishadow", 4, 1, 1, r => `Resets cooldowns.`),
            t(314, "Dirty Deeds", "spell_shadow_summonsuccubus", 4, 2, 2, r => `Increases Cheap Shot/Garrote damage.`),
            t(315, "Hemorrhage", "spell_shadow_lifedrain", 4, 3, 1, r => `Strike that increases physical damage taken.`, { prereq: 311 }),
            t(316, "Deadliness", "inv_weapon_crossbow_11", 5, 2, 5, r => `+${r*2}% Attack Power.`, { stats: r => ({ ap: r*20 }) }),
            t(317, "Premeditation", "spell_shadow_possession", 6, 1, 1, r => `Add 2 CP to target.`, { prereq: 313 })
        ]
    }
];

const DRUID: TalentTree[] = [
    {
        name: "Balance", icon: "spell_nature_starfall", background: "druid_balance", color: "#FF7D0A",
        talents: [
            t(101, "Imp. Wrath", "spell_nature_abolishmagic", 0, 0, 5, r => `Reduces cast time by ${r*0.1}s.`),
            t(102, "Nature's Grasp", "spell_nature_naturevulnerability", 0, 1, 1, r => `Chance to root attacker.`),
            t(103, "Imp. Nature's Grasp", "spell_nature_naturevulnerability", 0, 2, 4, r => `Increases proc chance.`, { prereq: 102 }),
            t(104, "Imp. Entangling Roots", "spell_nature_stranglevines", 1, 0, 3, r => `Pushback resist.`),
            t(105, "Imp. Moonfire", "spell_nature_starfall", 1, 1, 5, r => `+${r*2}% Dmg and +${r*2}% Crit.`, { stats: r => ({ crit: r }) }),
            t(106, "Natural Weapons", "inv_staff_01", 1, 2, 5, r => `+${r*2}% Physical Damage.`, { stats: r => ({ damagePercent: r*2 }) }),
            t(107, "Natural Shapeshifter", "spell_nature_wispsplode", 1, 3, 3, r => `Reduces mana cost of shifting.`),
            t(108, "Imp. Thorns", "spell_nature_thorns", 2, 0, 3, r => `Increases damage.`),
            t(109, "Omen of Clarity", "spell_nature_crystalball", 2, 2, 1, r => `Chance for free cast on hit.`, { prereq: 106 }),
            t(110, "Nature's Reach", "spell_nature_naturetouch", 2, 3, 2, r => `+${r*10}% Range.`),
            t(111, "Vengeance", "spell_nature_purge", 3, 1, 5, r => `+${r*20}% Crit Dmg bonus.`, { prereq: 105 }),
            t(112, "Imp. Starfire", "spell_arcane_starfire", 3, 2, 5, r => `Chance to stun.`),
            t(113, "Nature's Grace", "spell_nature_naturesblessing", 4, 1, 1, r => `Spell crits reduce next cast time by 0.5s.`),
            t(114, "Moonglow", "spell_nature_sentinal", 4, 2, 3, r => `Reduces Mana cost.`),
            t(115, "Moonfury", "spell_nature_moonglow", 5, 1, 5, r => `+${r*2}% Damage (Balance).`, { stats: r => ({ damagePercent: r*2 }), prereq: 113 }),
            t(116, "Moonkin Form", "spell_nature_forceofnature", 6, 1, 1, r => `Armor +360%, +3% Spell Crit Aura.`, { stats: r => ({ armor: 360, crit: 3 }), prereq: 115 })
        ]
    },
    {
        name: "Feral", icon: "ability_racial_bearform", background: "druid_feral", color: "#FF7D0A",
        talents: [
            t(201, "Ferocity", "ability_hunter_pet_hyena", 0, 1, 5, r => `Reduces Rage/Energy cost.`),
            t(202, "Feral Aggression", "ability_druid_demoralizingroar", 0, 2, 5, r => `Increases AP reduction/Ferocious Bite dmg.`),
            t(203, "Feral Instinct", "ability_ambush", 1, 0, 3, r => `Increases stealth/threat.`),
            t(204, "Brutal Impact", "ability_druid_bash", 1, 1, 2, r => `Increases stun duration.`),
            t(205, "Thick Hide", "inv_misc_pelt_bear_03", 1, 2, 5, r => `+${r*2}% Armor.`, { stats: r => ({ armor: r*200 }) }),
            t(206, "Feline Swiftness", "spell_nature_spiritwolf", 2, 0, 2, r => `+${r*15}% Speed outdoors, +${r*2}% Dodge.`, { stats: r => ({ dodge: r*2 }) }),
            t(207, "Feral Charge", "ability_hunter_pet_bear", 2, 1, 1, r => `Charge target.`),
            t(208, "Sharpened Claws", "inv_misc_monsterclaw_04", 2, 2, 3, r => `+${r*2}% Crit.`, { stats: r => ({ crit: r*2 }) }),
            t(209, "Imp. Shred", "spell_shadow_vampiricaura", 3, 0, 2, r => `Reduces energy cost.`),
            t(210, "Predatory Strikes", "ability_hunter_pet_cat", 3, 1, 3, r => `+${r*50}% AP from weapon (forms).`),
            t(211, "Blood Frenzy", "ability_ghoulfrenzy", 3, 2, 2, r => `Crits generate combo point.`, { prereq: 208 }),
            t(212, "Primal Fury", "ability_racial_cannibalize", 3, 3, 2, r => `Crits generate rage.`, { prereq: 208 }),
            t(213, "Savage Fury", "ability_druid_ravage", 4, 0, 2, r => `Increases damage.`),
            t(214, "Faerie Fire (Feral)", "spell_nature_faeriefire", 4, 1, 1, r => `Cast Faerie Fire in form.`, { prereq: 210 }),
            t(215, "Heart of the Wild", "spell_holy_blessingofagility", 4, 2, 5, r => `+${r*4}% Int / +${r*4}% Sta / +${r*4}% Str.`, { stats: r => ({ intMod: r*4, staminaMod: r*4, strMod: r*4 }), prereq: 210 }),
            t(216, "Leader of the Pack", "spell_nature_unyeildingstamina", 5, 2, 1, r => `+3% Crit Aura.`, { stats: r => ({ crit: 3 }) }),
            t(217, "Improved Leader of the Pack", "spell_nature_unyeildingstamina", 6, 2, 2, r => `Heal on crit.`, { prereq: 216 })
        ]
    },
    {
        name: "Restoration", icon: "spell_nature_healingtouch", background: "druid_restoration", color: "#FF7D0A",
        talents: [
            t(301, "Imp. Mark of the Wild", "spell_nature_regeneration", 0, 1, 5, r => `+${r*7}% Effect.`, { stats: r => ({ allStatsPercent: r }) }),
            t(302, "Furor", "spell_nature_unyeildingstamina", 0, 2, 5, r => `Chance to get Rage/Energy on shift.`),
            t(303, "Imp. Healing Touch", "spell_nature_healingtouch", 1, 0, 5, r => `Reduces cast time by ${r*0.1}s.`),
            t(304, "Nature's Focus", "spell_nature_natureswrath", 1, 1, 5, r => `Pushback resist.`),
            t(305, "Imp. Enrage", "ability_druid_enrage", 1, 2, 2, r => `Generates rage instantly.`),
            t(306, "Reflection", "spell_nature_forceofnature", 2, 1, 3, r => `allows ${r*5}% mana regen while casting.`, { stats: r => ({ regenCasting: r*5 }) }),
            t(307, "Insect Swarm", "spell_nature_insectswarm", 2, 2, 1, r => `DoT + Hit debuff.`),
            t(308, "Subtlety", "ability_eyeoftheowl", 2, 3, 5, r => `Reduces threat.`),
            t(309, "Tranquil Spirit", "spell_holy_elunesgrace", 3, 1, 5, r => `Reduces mana cost of Healing Touch.`),
            t(310, "Imp. Rejuvenation", "spell_nature_rejuvenation", 3, 3, 3, r => `+${r*5}% Effect.`),
            t(311, "Nature's Swiftness", "spell_nature_ravenform", 4, 0, 1, r => `Next nature spell instant.`, { prereq: 303 }),
            t(312, "Gift of Nature", "spell_nature_protectionformnature", 4, 1, 5, r => `+${r*2}% Healing effect.`, { stats: r => ({ healing: r*20 }) }),
            t(313, "Improved Regrowth", "spell_nature_resistnature", 4, 2, 5, r => `+${r*10}% Crit Chance.`),
            t(314, "Imp. Tranquility", "spell_nature_tranquility", 4, 3, 2, r => `Reduces threat.`),
            t(315, "Empowered Touch", "spell_nature_healingtouch", 5, 1, 2, r => `Gain +${r*10}% bonus from Healing Power.`),
            t(316, "Swiftmend", "inv_relics_idolofrejuvenation", 6, 1, 1, r => `Consumes HoT for instant heal.`, { prereq: 312 })
        ]
    }
];

const PRIEST: TalentTree[] = [
    {
        name: "Discipline", icon: "spell_holy_powerwordshield", background: "priest_discipline", color: "#FFFFFF",
        talents: [
            t(101, "Unbreakable Will", "spell_magic_magearmor", 0, 1, 5, r => `Resist stun/fear/silence.`),
            t(102, "Wand Specialization", "inv_wand_01", 0, 2, 5, r => `+${r*5}% Wand Dmg.`),
            t(103, "Silent Resolve", "spell_nature_manadraintotem", 1, 0, 5, r => `Reduces threat.`),
            t(104, "Imp. Power Word: Fortitude", "spell_holy_wordfortitude", 1, 1, 2, r => `+${r*15}% Effect.`, { stats: r => ({ staminaMod: r }) }),
            t(105, "Imp. Power Word: Shield", "spell_holy_powerwordshield", 1, 2, 3, r => `Increases absorb.`),
            t(106, "Martyrdom", "spell_nature_tranquility", 1, 3, 2, r => `Focus after being critted.`),
            t(107, "Inner Focus", "spell_frost_windwalkon", 2, 1, 1, r => `Next spell free and +25% Crit.`),
            t(108, "Meditation", "spell_nature_sleep", 2, 2, 3, r => `${r*5}% Mana regen while casting.`, { stats: r => ({ regenCasting: r*5 }) }),
            t(109, "Mental Agility", "spell_nature_enchantarmor", 3, 0, 5, r => `Reduces instant cast mana cost.`),
            t(110, "Mental Strength", "spell_nature_enchantarmor", 3, 1, 5, r => `+${r*2}% Max Mana.`, { stats: r => ({ intMod: r*2 }) }),
            t(111, "Divine Spirit", "spell_holy_divinespirit", 4, 1, 1, r => `Buff target spirit.`, { prereq: 110 }),
            t(112, "Force of Will", "spell_nature_slowingstrikes", 5, 2, 5, r => `+${r}% Dmg and +${r}% Crit.`, { stats: r => ({ damagePercent: r, crit: r }) }),
            t(113, "Power Infusion", "spell_holy_powerinfusion", 6, 1, 1, r => `+20% Dmg/Healing to target.`, { prereq: 111 })
        ]
    },
    {
        name: "Holy", icon: "spell_holy_holybolt", background: "priest_holy", color: "#FFFFFF",
        talents: [
            t(201, "Healing Focus", "spell_holy_healingfocus", 0, 0, 2, r => `Pushback resist.`),
            t(202, "Imp. Renew", "spell_holy_renew", 0, 1, 3, r => `+${r*5}% Renew effect.`),
            t(203, "Holy Specialization", "spell_holy_sealofsalvation", 0, 2, 5, r => `+${r}% Crit with Holy.`, { stats: r => ({ crit: r }) }),
            t(204, "Spell Warding", "spell_holy_spellwarding", 1, 1, 5, r => `Reduces damage taken.`),
            t(205, "Divine Fury", "spell_holy_sealofwrath", 1, 2, 5, r => `Reduces cast time of Smite/Heal by ${r*0.1}s.`),
            t(206, "Holy Nova", "spell_holy_holynova", 2, 0, 1, r => `AOE Heal/Damage.`),
            t(207, "Blessed Recovery", "spell_holy_blessedrecovery", 2, 1, 3, r => `Heal after being crit.`),
            t(208, "Inspiration", "spell_holy_layonhands", 2, 3, 3, r => `Heal crits increase armor.`),
            t(209, "Holy Reach", "spell_holy_purify", 3, 0, 2, r => `+${r*10}% Range.`),
            t(210, "Imp. Healing", "spell_holy_heal02", 3, 1, 3, r => `Reduces Mana cost.`),
            t(211, "Searing Light", "spell_holy_searinglightnew", 3, 2, 2, r => `+${r*5}% Smite/Holy Fire damage.`, { stats: r => ({ damagePercent: r }) }),
            t(212, "Imp. Prayer of Healing", "spell_holy_prayerofhealing02", 4, 0, 2, r => `Reduces Mana cost.`),
            t(213, "Spirit of Redemption", "inv_enchant_essenceeternallarge", 4, 1, 1, r => `Heal for 10s after dying.`),
            t(214, "Spiritual Guidance", "spell_holy_spiritualguidence", 4, 2, 5, r => `+${r*5}% Spirit as Spell Power.`, { stats: r => ({ sp: r*10 }) }),
            t(215, "Spiritual Healing", "spell_nature_moonglow", 5, 2, 5, r => `+${r*2}% Healing.`, { stats: r => ({ healing: r*20 }) }),
            t(216, "Lightwell", "spell_holy_summonlightwell", 6, 1, 1, r => `Summon Lightwell.`, { prereq: 213 })
        ]
    },
    {
        name: "Shadow", icon: "spell_shadow_shadowwordpain", background: "priest_shadow", color: "#FFFFFF",
        talents: [
            t(301, "Spirit Tap", "spell_shadow_requiem", 0, 1, 5, r => `100% Spirit regen on kill.`),
            t(302, "Blackout", "spell_shadow_gathershadows", 0, 2, 5, r => `Chance to stun.`),
            t(303, "Shadow Affinity", "spell_shadow_shadowward", 1, 0, 3, r => `Reduces threat.`),
            t(304, "Imp. Shadow Word: Pain", "spell_shadow_shadowwordpain", 1, 1, 2, r => `Increases duration.`),
            t(305, "Shadow Focus", "spell_shadow_burning spirit", 1, 2, 5, r => `+${r*2}% Hit with Shadow.`, { stats: r => ({ hit: r*2 }) }),
            t(306, "Imp. Psychic Scream", "spell_shadow_psychicscream", 2, 0, 2, r => `Reduces CD.`),
            t(307, "Imp. Mind Blast", "spell_shadow_unholyfrenzy", 2, 1, 5, r => `Reduces CD by ${r*0.5}s.`),
            t(308, "Mind Flay", "spell_shadow_siphonmana", 2, 2, 1, r => `Channel Shadow damage.`),
            t(309, "Imp. Fade", "spell_magic_lesserinvisibilty", 3, 1, 2, r => `Reduces CD.`),
            t(310, "Shadow Reach", "spell_shadow_chilltouch", 3, 2, 3, r => `+${r*10}% Range.`),
            t(311, "Shadow Weaving", "spell_shadow_blackplague", 3, 3, 5, r => `Shadow spells increase Shadow dmg taken by target.`),
            t(312, "Silence", "spell_shadow_impphaseshift", 4, 0, 1, r => `Silence target.`, { prereq: 306 }),
            t(313, "Vampiric Embrace", "spell_shadow_unsummonbuilding", 4, 1, 1, r => `Heal based on damage.`),
            t(314, "Imp. Vampiric Embrace", "spell_shadow_improvedvampiricembrace", 4, 2, 2, r => `Increases healing.`, { prereq: 313 }),
            t(315, "Darkness", "spell_shadow_twilight", 5, 2, 5, r => `+${r*2}% Shadow Damage.`, { stats: r => ({ damagePercent: r*2 }) }),
            t(316, "Shadowform", "spell_shadow_shadowform", 6, 1, 1, r => `+15% Shadow Dmg, -15% Phys Dmg taken.`, { stats: r => ({ damagePercent: 15 }), prereq: 313 })
        ]
    }
];

const HUNTER: TalentTree[] = [
    { name: "Beast Mastery", icon: "ability_hunter_beasttaming", background: "hunter_beastmastery", color: "#ABD473", talents: [
        t(101, "Imp. Aspect of the Hawk", "spell_nature_ravenform", 0, 1, 5, r => `Chance for attack speed.`),
        t(102, "Endurance Training", "spell_nature_reincarnation", 0, 2, 5, r => `+Pet Health.`),
        t(103, "Thick Hide", "inv_misc_pelt_bear_03", 1, 1, 3, r => `+Pet Armor.`),
        t(104, "Imp. Revive Pet", "ability_hunter_beastsoothe", 1, 2, 2, r => `Faster revive.`),
        t(105, "Unleashed Fury", "ability_bullrush", 1, 3, 5, r => `+Pet Damage.`),
        t(106, "Pathfinding", "ability_mount_jungle_tiger", 2, 0, 2, r => `+Speed.`),
        t(107, "Bestial Swiftness", "ability_druid_dash", 2, 1, 1, r => `+Pet speed outdoors.`),
        t(108, "Ferocity", "inv_misc_monsterclaw_04", 2, 2, 5, r => `+Pet Crit.`),
        t(109, "Intimidation", "ability_devour", 3, 1, 1, r => `Stun target.`),
        t(110, "Bestial Discipline", "spell_nature_abolishmagic", 3, 3, 2, r => `+Pet Focus regen.`),
        t(111, "Animal Handler", "ability_hunter_animalhandler", 4, 0, 2, r => `+Hit chance for Pet.`),
        t(112, "Frenzy", "inv_misc_monsterclaw_03", 4, 2, 5, r => `Pet crit grants attack speed.`, { prereq: 108 }),
        t(113, "Spirit Bond", "ability_druid_demoralizingroar", 5, 0, 2, r => `Heal while pet active.`),
        t(114, "Bestial Wrath", "ability_druid_ferociousbite", 6, 1, 1, r => `Pet immune to CC and does big dmg.`, { prereq: 109 })
    ]},
    { name: "Marksmanship", icon: "ability_marksmanship", background: "hunter_marksmanship", color: "#ABD473", talents: [
        t(201, "Imp. Concussive Shot", "spell_frost_stun", 0, 1, 5, r => `Chance to stun.`),
        t(202, "Efficiency", "spell_frost_wizardmark", 0, 2, 5, r => `Reduces Mana cost.`),
        t(203, "Lethal Shots", "ability_searingarrow", 1, 1, 5, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
        t(204, "Aimed Shot", "inv_spear_07", 2, 0, 1, r => `High damage shot.`, { prereq: 201 }),
        t(205, "Imp. Arcane Shot", "ability_impalingbolt", 2, 1, 5, r => `Reduces CD.`),
        t(206, "Hawk Eye", "ability_townwatch", 2, 3, 3, r => `+Range.`),
        t(207, "Mortal Shots", "ability_piercingdamage", 3, 1, 5, r => `+${r*6}% Crit Dmg bonus.`, { prereq: 203 }),
        t(208, "Scatter Shot", "ability_golemstormbolt", 4, 1, 1, r => `Short range disorient.`),
        t(209, "Barrage", "ability_upgrademoonglaive", 4, 2, 3, r => `+${r*5}% Multi-Shot damage.`),
        t(210, "Ranged Weapon Spec", "inv_weapon_rifle_06", 5, 2, 5, r => `+${r}% Damage.`, { stats: r => ({ damagePercent: r }) }),
        t(211, "Trueshot Aura", "ability_trueshot", 6, 1, 1, r => `AP Aura.`, { stats: r => ({ ap: 100 }), prereq: 209 })
    ]},
    { name: "Survival", icon: "ability_hunter_swiftstrike", background: "hunter_survival", color: "#ABD473", talents: [
        t(301, "Monster Slaying", "inv_misc_head_dragon_01", 0, 0, 3, r => `+Dmg vs Beasts/Giants/Dragons.`),
        t(302, "Humanoid Slaying", "spell_holy_prayerofhealing", 0, 1, 3, r => `+Dmg vs Humanoids.`),
        t(303, "Entrapment", "spell_nature_stranglevines", 1, 0, 5, r => `Traps immobilize.`),
        t(304, "Savage Strikes", "ability_racial_bloodrage", 1, 1, 2, r => `+Raptor Strike crit.`),
        t(305, "Deterrence", "ability_whirlwind", 2, 1, 1, r => `+Parry/Dodge.`),
        t(306, "Surefooted", "ability_kick", 3, 0, 3, r => `+${r}% Hit.`, { stats: r => ({ hit: r }) }),
        t(307, "Killer Instinct", "spell_holy_blessingofstamina", 3, 2, 3, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
        t(308, "Counterattack", "ability_warrior_challange", 3, 3, 1, r => `Strike after parry.`, { prereq: 305 }),
        t(309, "Lightning Reflexes", "spell_nature_invisibilty", 4, 2, 5, r => `+${r*3}% Agility.`, { stats: r => ({ agiMod: r*3 }) }),
        t(310, "Wyvern Sting", "inv_spear_02", 6, 1, 1, r => `Sleep target.`, { prereq: 307 })
    ]}
];

const SHAMAN: TalentTree[] = [
    { name: "Elemental", icon: "spell_nature_lightning", background: "shaman_elemental", color: "#0070DE", talents: [
        t(101, "Convection", "spell_nature_wispheal", 0, 1, 5, r => `Reduces mana cost.`),
        t(102, "Concussion", "spell_fire_fireball", 0, 2, 5, r => `+${r}% Shock/Lightning Dmg.`, { stats: r => ({ damagePercent: r }) }),
        t(103, "Call of Flame", "spell_fire_immolation", 1, 0, 3, r => `+Totem Dmg.`),
        t(104, "Elemental Focus", "spell_shadow_manaburn", 2, 1, 1, r => `Crit gives Clearcasting.`),
        t(105, "Reverberation", "spell_frost_frostward", 2, 2, 5, r => `Reduces shock cooldowns.`),
        t(106, "Call of Thunder", "spell_nature_thunder", 2, 3, 5, r => `+${r}% Crit with Lightning.`, { stats: r => ({ crit: r }) }),
        t(107, "Imp. Fire Nova Totem", "spell_fire_sealoffire", 3, 0, 2, r => `Reduces activation time.`),
        t(108, "Elemental Fury", "spell_fire_volcano", 3, 1, 1, r => `+100% Crit Dmg bonus.`, { prereq: 104 }),
        t(109, "Lightning Mastery", "spell_lightning_lightningbolt01", 4, 2, 5, r => `Reduces Cast Time by 1.0s.`),
        t(110, "Elemental Mastery", "spell_nature_wispheal", 6, 1, 1, r => `Next spell instant crit.`, { prereq: 108 })
    ]},
    { name: "Enhancement", icon: "spell_nature_lightningshield", background: "shaman_enhancement", color: "#0070DE", talents: [
        t(201, "Ancestral Knowledge", "spell_shadow_grimward", 0, 1, 5, r => `+${r}% Mana.`, { stats: r => ({ intMod: r }) }),
        t(202, "Thundering Strikes", "ability_thunderbolt", 1, 1, 5, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
        t(203, "Imp. Ghost Wolf", "spell_nature_spiritwolf", 1, 2, 2, r => `Reduces cast time.`),
        t(204, "Flurry", "ability_ghoulfrenzy", 3, 1, 5, r => `+${r*6}% Attack Speed after crit.`, { stats: r => ({ haste: r*2 }), prereq: 202 }),
        t(205, "Parry", "ability_parry", 3, 2, 1, r => `Chance to Parry.`),
        t(206, "Weapon Mastery", "ability_hunter_swiftstrike", 5, 2, 5, r => `+${r*2}% Weapon Damage.`),
        t(207, "Stormstrike", "spell_holy_sealofmight", 6, 1, 1, r => `Instant attack + Nature dmg bonus.`)
    ]},
    { name: "Restoration", icon: "spell_nature_magicimmunity", background: "shaman_restoration", color: "#0070DE", talents: [
        t(301, "Imp. Healing Wave", "spell_nature_magicimmunity", 0, 1, 5, r => `Reduces cast time by ${r*0.1}s.`),
        t(302, "Tidal Focus", "spell_nature_mana", 0, 2, 5, r => `Reduces mana cost.`),
        t(303, "Ancestral Healing", "spell_nature_undyingstrength", 1, 1, 3, r => `Crits increase armor.`),
        t(304, "Totemic Focus", "spell_nature_moonones", 1, 2, 5, r => `Reduces totem mana cost.`),
        t(305, "Nature's Guidance", "spell_frost_stun", 1, 3, 3, r => `+${r}% Hit.`, { stats: r => ({ hit: r }) }),
        t(306, "Healing Focus", "spell_nature_healingwavelesser", 2, 0, 5, r => `Pushback resist.`),
        t(307, "Totemic Mastery", "spell_nature_nullward", 2, 1, 1, r => `+Totem Range.`),
        t(308, "Healing Grace", "spell_nature_healingtouch", 2, 2, 3, r => `Reduces threat.`),
        t(309, "Restorative Totems", "spell_nature_manaregentotem", 3, 1, 5, r => `+Totem effect.`),
        t(310, "Tidal Mastery", "spell_nature_tranquility", 3, 2, 5, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
        t(311, "Nature's Swiftness", "spell_nature_ravenform", 4, 2, 1, r => `Next nature spell instant.`, { prereq: 310 }),
        t(312, "Purification", "spell_frost_wizardmark", 5, 2, 5, r => `+${r*2}% Healing.`, { stats: r => ({ healing: r*20 }) }),
        t(313, "Mana Tide Totem", "spell_frost_summonwaterelemental", 6, 1, 1, r => `Restores mana to party.`, { prereq: 309 })
    ]}
];

const PALADIN: TalentTree[] = [
    { name: "Holy", icon: "spell_holy_holybolt", background: "paladin_holy", color: "#F58CBA", talents: [
        t(101, "Divine Strength", "spell_holy_enchantweapon", 0, 1, 5, r => `+${r*2}% Strength.`, { stats: r => ({ strMod: r*2 }) }),
        t(102, "Divine Intellect", "spell_nature_sleep", 0, 2, 5, r => `+${r*2}% Intellect.`, { stats: r => ({ intMod: r*2 }) }),
        t(103, "Spiritual Focus", "spell_arcane_blink", 1, 1, 5, r => `Pushback resist.`),
        t(104, "Imp. Seal of Righteousness", "spell_holy_sealofsacrifice", 1, 2, 5, r => `+Damage.`),
        t(105, "Healing Light", "spell_holy_holybolt", 2, 0, 3, r => `+${r*4}% Healing.`, { stats: r => ({ healing: r*40 }) }),
        t(106, "Consecration", "spell_holy_innerfire", 2, 1, 1, r => `AOE Holy damage.`),
        t(107, "Imp. Lay on Hands", "spell_holy_layonhands", 2, 2, 2, r => `Armor bonus.`),
        t(108, "Unyielding Faith", "spell_holy_unyieldingfaith", 2, 3, 2, r => `Fear/Disorient resist.`),
        t(109, "Illumination", "spell_holy_greaterheal", 3, 1, 5, r => `Crits return 100% mana.`),
        t(110, "Imp. Blessing of Wisdom", "spell_holy_sealofwisdom", 3, 2, 2, r => `+Effect.`),
        t(111, "Divine Favor", "spell_holy_heal", 4, 1, 1, r => `Next heal 100% crit.`, { prereq: 109 }),
        t(112, "Holy Power", "spell_holy_power", 5, 2, 5, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
        t(113, "Holy Shock", "spell_holy_searinglight", 6, 1, 1, r => `Instant Damage/Heal.`, { prereq: 111 })
    ]},
    { name: "Protection", icon: "spell_holy_devotionaura", background: "paladin_protection", color: "#F58CBA", talents: [
        t(201, "Redoubt", "ability_defend", 0, 1, 5, r => `Block chance after crit.`),
        t(202, "Imp. Devotion Aura", "spell_holy_devotionaura", 0, 2, 5, r => `+Armor bonus.`),
        t(203, "Precision", "ability_rogue_ambush", 1, 0, 3, r => `+${r}% Hit.`, { stats: r => ({ hit: r }) }),
        t(204, "Guardian's Favor", "spell_holy_sealofprotection", 1, 1, 2, r => `Reduces BoP cooldown.`),
        t(205, "Toughness", "spell_holy_devotion", 1, 3, 5, r => `+Armor value.`),
        t(206, "Blessing of Kings", "spell_magic_magearmor", 2, 0, 1, r => `+10% Stats Buff.`),
        t(207, "Shield Specialization", "inv_shield_06", 2, 2, 3, r => `Absorb more dmg.`, { prereq: 201 }),
        t(208, "Anticipation", "spell_magic_lesserinvisibilty", 2, 3, 5, r => `+Defense.`, { stats: r => ({ defense: r*2 }) }),
        t(209, "Imp. Hammer of Justice", "spell_holy_sealofmight", 3, 1, 3, r => `Reduces CD.`),
        t(210, "Imp. Conc. Aura", "spell_holy_mindsooth", 3, 2, 3, r => `+Resist Silence.`),
        t(211, "Blessing of Sanctuary", "spell_nature_lightningshield", 4, 1, 1, r => `Reduces damage taken.`),
        t(212, "Reckoning", "spell_holy_blessingofstrength", 4, 2, 5, r => `Chance for extra attack after being crit.`),
        t(213, "One-Handed Weapon Spec", "inv_sword_20", 5, 2, 5, r => `+${r*2}% Damage.`, { stats: r => ({ damagePercent: r*2 }) }),
        t(214, "Holy Shield", "spell_holy_blessingofprotection", 6, 1, 1, r => `+Block Chance, deals dmg on block.`, { prereq: 211 })
    ]},
    { name: "Retribution", icon: "spell_holy_auraoflight", background: "paladin_retribution", color: "#F58CBA", talents: [
        t(301, "Imp. Blessing of Might", "spell_holy_fistofjustice", 0, 1, 5, r => `+AP Bonus.`),
        t(302, "Benediction", "spell_frost_windwalkon", 0, 2, 5, r => `Reduces Seal/Judgement cost.`),
        t(303, "Imp. Judgement", "spell_holy_righteousfury", 1, 0, 2, r => `Reduces CD.`),
        t(304, "Imp. Seal of the Crusader", "spell_holy_holysmite", 1, 1, 3, r => `+AP and Holy damage.`),
        t(305, "Deflection", "ability_parry", 1, 2, 5, r => `+Parry.`),
        t(306, "Vindication", "spell_holy_vindication", 2, 0, 3, r => `Chance to reduce stats.`),
        t(307, "Conviction", "spell_holy_prayerofhealing", 2, 1, 5, r => `+${r}% Crit.`, { stats: r => ({ crit: r }) }),
        t(308, "Seal of Command", "spell_holy_healingaura", 2, 2, 1, r => `Proc damage seal.`),
        t(309, "Eye for an Eye", "spell_holy_eyeforaneye", 3, 0, 2, r => `Reflect crit spell damage.`),
        t(310, "Two-Handed Weapon Spec", "inv_hammer_04", 3, 2, 3, r => `+${r*2}% Damage.`),
        t(311, "Sanctity Aura", "spell_holy_mindvision", 4, 2, 1, r => `+10% Holy Damage.`),
        t(312, "Vengeance", "spell_nature_purge", 5, 1, 5, r => `+${r*3}% Dmg after crit.`, { prereq: 307 }),
        t(313, "Repentance", "spell_holy_prayerofhealing", 6, 1, 1, r => `CC target.`)
    ]}
];

export const TALENT_DB: Record<ClassName, TalentTree[]> = {
    "Warlock": WARLOCK,
    "Mage": MAGE,
    "Warrior": WARRIOR,
    "Rogue": ROGUE,
    "Druid": DRUID,
    "Priest": PRIEST,
    "Hunter": HUNTER,
    "Shaman": SHAMAN,
    "Paladin": PALADIN
};

// Export individual trees for legacy support if needed, but TALENT_DB is main entry
export const WARLOCK_TALENTS = WARLOCK;
