
export const talentsPart2 = {
  "priest": {
    "Discipline": {
      "background": "PriestDiscipline",
      "icon": "",
      "talents": {
        "Unbreakable Will": { "id": 93, "ranks": [], "maxRank": 5, "icon": "spell_magic_magearmor", "description": "Increases your chance to resist Stun, Fear, and Silence effects by an additional [3/6/9/12/15]%.", "x": 1, "y": 0 },
        "Imp PW: Shield": { "id": 94, "ranks": [], "maxRank": 3, "icon": "spell_holy_powerwordshield", "description": "Increases the damage absorbed by your Power Word: Shield by [5/10/15]%.", "x": 1, "y": 2 },
        "Inner Focus": { "id": 95, "ranks": [], "maxRank": 1, "icon": "spell_frost_windwalkon", "description": "When activated, reduces the Mana cost of your next spell by 100% and increases its critical effect chance by 25%.", "x": 1, "y": 2 },
        "Meditation": { "id": 96, "ranks": [], "maxRank": 3, "icon": "spell_nature_sleep", "description": "Allows [5/10/15]% of your Mana regeneration to continue while casting.", "x": 2, "y": 2 },
        "Mental Strength": { "id": 97, "ranks": [], "maxRank": 5, "icon": "spell_nature_enchantarmor", "description": "Increases your maximum Mana by [2/4/6/8/10]%.", "x": 1, "y": 4 },
        "Power Infusion": { "id": 98, "ranks": [], "maxRank": 1, "icon": "spell_holy_powerinfusion", "description": "Infuses the target with power, increasing their spell damage and healing by 20% for 15 sec.", "x": 1, "y": 6 }
      }
    },
    "Holy": {
      "background": "PriestHoly",
      "icon": "",
      "talents": {
        "Holy Specialization": { "id": 99, "ranks": [], "maxRank": 5, "icon": "spell_holy_sealofsalvation", "description": "Increases the critical effect chance of your Holy spells by [1/2/3/4/5]%.", "x": 2, "y": 0 },
        "Divine Fury": { "id": 100, "ranks": [], "maxRank": 5, "icon": "spell_holy_sealofwrath", "description": "Reduces the casting time of your Smite, Holy Fire, Heal and Greater Heal spells by [0.1/0.2/0.3/0.4/0.5] sec.", "x": 1, "y": 1 },
        "Holy Nova": { "id": 101, "ranks": [], "maxRank": 1, "icon": "spell_holy_holynova", "description": "Causes an explosion of holy light around the caster, causing Holy damage to all enemy targets and healing all party members within 10 yards.", "x": 2, "y": 2 },
        "Inspiration": { "id": 102, "ranks": [], "maxRank": 3, "icon": "spell_holy_layonhands", "description": "Increases your target's armor by [8/16/25]% for 15 sec after getting a critical effect from your Flash Heal, Heal, Greater Heal, or Prayer of Healing spell.", "x": 3, "y": 2 },
        "Spirit of Redemption": { "id": 103, "ranks": [], "maxRank": 1, "icon": "inv_enchant_essenceeternallarge", "description": "Upon death, the priest becomes the Spirit of Redemption for 10 sec. The Spirit of Redemption cannot move or be attacked, but can cast any healing spell free of cost.", "x": 1, "y": 4 },
        "Spiritual Guidance": { "id": 104, "ranks": [], "maxRank": 5, "icon": "spell_holy_spiritualguidence", "description": "Increases spell damage and healing by up to [5/10/15/20/25]% of your total Spirit.", "x": 2, "y": 4 },
        "Lightwell": { "id": 105, "ranks": [], "maxRank": 1, "icon": "spell_holy_summonlightwell", "description": "Creates a Holy Lightwell. Party members can click the Lightwell to restore health over 6 sec.", "x": 1, "y": 6 }
      }
    },
    "Shadow": {
      "background": "PriestShadow",
      "icon": "",
      "talents": {
        "Spirit Tap": { "id": 106, "ranks": [], "maxRank": 5, "icon": "spell_shadow_requiem", "description": "Gives you a [20/40/60/80/100]% chance to gain a 100% bonus to your Spirit after killing a target that yields experience.", "x": 1, "y": 0 },
        "Shadow Focus": { "id": 107, "ranks": [], "maxRank": 5, "icon": "spell_shadow_burningspirit", "description": "Reduces your target's chance to resist your Shadow spells by [2/4/6/8/10]%.", "x": 2, "y": 1 },
        "Mind Flay": { "id": 108, "ranks": [], "maxRank": 1, "icon": "spell_shadow_siphonmana", "description": "Assault the target's mind with Shadow energy, causing Shadow damage over 3 sec and slowing their movement speed by 50%.", "x": 2, "y": 2 },
        "Shadow Weaving": { "id": 109, "ranks": [], "maxRank": 5, "icon": "spell_shadow_blackplague", "description": "Your Shadow damage spells have a [20/40/60/80/100]% chance to cause your target to be vulnerable to Shadow damage. Increases Shadow damage taken by 3% for 15 sec. Stacks up to 5 times.", "x": 0, "y": 3 },
        "Silence": { "id": 110, "ranks": [], "maxRank": 1, "icon": "spell_shadow_impphaseshift", "description": "Silences the target, preventing them from casting spells for 5 sec.", "x": 1, "y": 4 },
        "Vampiric Embrace": { "id": 111, "ranks": [], "maxRank": 1, "icon": "spell_shadow_unsummonbuilding", "description": "Afflicts your target with Shadow energy that causes all party members to be healed for 20% of any Shadow spell damage you deal for 1 min.", "x": 2, "y": 4 },
        "Darkness": { "id": 112, "ranks": [], "maxRank": 5, "icon": "spell_shadow_twilight", "description": "Increases your Shadow spell damage by [2/4/6/8/10]%.", "x": 2, "y": 5 },
        "Shadowform": { "id": 113, "ranks": [], "maxRank": 1, "icon": "spell_shadow_shadowform", "description": "Assume a Shadowform, increasing your Shadow damage by 15% and reducing Physical damage done to you by 15%. However, you may not cast Holy spells.", "x": 1, "y": 6 }
      }
    }
  },
  "shaman": {
    "Elemental": {
      "background": "ShamanElemental",
      "icon": "",
      "talents": {
        "Convection": { "id": 114, "ranks": [], "maxRank": 5, "icon": "spell_nature_wispsplode", "description": "Reduces the mana cost of your Shock, Lightning Bolt and Chain Lightning spells by [2/4/6/8/10]%.", "x": 1, "y": 0 },
        "Concussion": { "id": 115, "ranks": [], "maxRank": 5, "icon": "spell_fire_fireball", "description": "Increases the damage done by your Lightning Bolt, Chain Lightning, Thunderstorm and Shock spells by [1/2/3/4/5]%.", "x": 2, "y": 0 },
        "Elemental Focus": { "id": 116, "ranks": [], "maxRank": 1, "icon": "spell_shadow_manaburn", "description": "After landing a critical strike with a Fire, Frost, or Nature damage spell, you enter a Clearcasting state. The Clearcasting state reduces the mana cost of your next 2 damage spells by 40%.", "x": 2, "y": 2 },
        "Call of Thunder": { "id": 117, "ranks": [], "maxRank": 5, "icon": "spell_nature_callstorm", "description": "Increases the critical strike chance of your Lightning Bolt and Chain Lightning spells by [1/2/3/4/5]%.", "x": 2, "y": 2 },
        "Elemental Fury": { "id": 118, "ranks": [], "maxRank": 1, "icon": "spell_fire_volcano", "description": "Increases the critical strike damage bonus of your Searing, Magma, and Fire Nova Totems and your Fire, Frost, and Nature spells by 100%.", "x": 1, "y": 4 },
        "Elemental Mastery": { "id": 119, "ranks": [], "maxRank": 1, "icon": "spell_nature_wispheal", "description": "When activated, your next Fire, Frost, or Nature damage spell becomes an instant cast spell and costs no mana.", "x": 1, "y": 6 }
      }
    },
    "Enhancement": {
      "background": "ShamanEnhancement",
      "icon": "",
      "talents": {
        "Ancestral Knowledge": { "id": 120, "ranks": [], "maxRank": 5, "icon": "spell_shadow_grimward", "description": "Increases your maximum Mana by [1/2/3/4/5]%.", "x": 1, "y": 0 },
        "Thundering Strikes": { "id": 121, "ranks": [], "maxRank": 5, "icon": "ability_thunderbolt", "description": "Improves your chance to get a critical strike with your weapon attacks by [1/2/3/4/5]%.", "x": 1, "y": 1 },
        "Flurry": { "id": 122, "ranks": [], "maxRank": 5, "icon": "ability_ghoulfrenzy", "description": "Increases your attack speed by [10/15/20/25/30]% for your next 3 swings after dealing a critical strike.", "x": 3, "y": 3 },
        "Parry": { "id": 123, "ranks": [], "maxRank": 1, "icon": "ability_parry", "description": "Gives a chance to parry enemy melee attacks.", "x": 2, "y": 4 },
        "Stormstrike": { "id": 124, "ranks": [], "maxRank": 1, "icon": "spell_holy_sealofmight", "description": "Instantly attack with both weapons. In addition, the next 2 sources of Nature damage dealt to the target are increased by 20%. Lasts 12 sec.", "x": 1, "y": 6 }
      }
    },
    "Restoration": {
      "background": "ShamanRestoration",
      "icon": "",
      "talents": {
        "Tidal Focus": { "id": 125, "ranks": [], "maxRank": 5, "icon": "spell_frost_manarecharge", "description": "Reduces the Mana cost of your healing spells by [1/2/3/4/5]%.", "x": 2, "y": 0 },
        "Totemic Mastery": { "id": 126, "ranks": [], "maxRank": 1, "icon": "spell_nature_nullward", "description": "The radius of your totems that affect friendly targets is increased to 30 yards.", "x": 1, "y": 2 },
        "Nature's Swiftness": { "id": 127, "ranks": [], "maxRank": 1, "icon": "spell_nature_ravenform", "description": "When activated, your next Nature spell with a casting time less than 10 sec becomes an instant cast spell.", "x": 2, "y": 4 },
        "Tidal Mastery": { "id": 128, "ranks": [], "maxRank": 5, "icon": "spell_nature_tranquility", "description": "Increases the critical effect chance of your healing and lightning spells by [1/2/3/4/5]%.", "x": 2, "y": 5 },
        "Mana Tide Totem": { "id": 129, "ranks": [], "maxRank": 1, "icon": "spell_frost_summonwaterelemental", "description": "Summons a Mana Tide Totem with 5 health at the feet of the caster for 12 sec that restores 170 mana every 3 seconds to group members within 20 yards.", "x": 1, "y": 6 }
      }
    }
  },
  "mage": {
    "Arcane": {
      "background": "MageArcane",
      "icon": "",
      "talents": {
        "Arcane Subtlety": { "id": 130, "ranks": [], "maxRank": 2, "icon": "spell_holy_dispelmagic", "description": "Reduces your target's resistance to all your spells by [5/10] and reduces threat of Arcane spells by [20/40]%.", "x": 0, "y": 0 },
        "Arcane Focus": { "id": 131, "ranks": [], "maxRank": 5, "icon": "spell_holy_devotion", "description": "Reduces the chance that the opponent can resist your Arcane spells by [2/4/6/8/10]%.", "x": 1, "y": 0 },
        "Arcane Concentration": { "id": 132, "ranks": [], "maxRank": 5, "icon": "spell_shadow_manaburn", "description": "Gives you a [2/4/6/8/10]% chance of entering a Clearcasting state after any damage spell hits a target. The Clearcasting state reduces the mana cost of your next damage spell by 100%.", "x": 2, "y": 0 },
        "Evocation": { "id": 133, "ranks": [], "maxRank": 1, "icon": "spell_nature_purge", "description": "While channeling this spell, your mana regeneration is active and increased by 1500%. Lasts 8 sec.", "x": 1, "y": 2 },
        "Presence of Mind": { "id": 134, "ranks": [], "maxRank": 1, "icon": "spell_nature_enchantarmor", "description": "When activated, your next Mage spell with a casting time less than 10 sec becomes an instant cast spell.", "x": 1, "y": 4 },
        "Arcane Power": { "id": 135, "ranks": [], "maxRank": 1, "icon": "spell_nature_lightning", "description": "When activated, your spells deal 30% more damage while costing 30% more mana to cast. Lasts 15 sec.", "x": 1, "y": 6 }
      }
    },
    "Fire": {
      "background": "MageFire",
      "icon": "",
      "talents": {
        "Impact": { "id": 136, "ranks": [], "maxRank": 5, "icon": "spell_fire_meteorstorm", "description": "Gives your Fire spells a [2/4/6/8/10]% chance to stun the target for 2 sec.", "x": 1, "y": 0 },
        "Ignite": { "id": 137, "ranks": [], "maxRank": 5, "icon": "spell_fire_incinerate", "description": "Your critical strikes from Fire damage spells cause the target to burn for an additional [8/16/24/32/40]% of your spell's damage over 4 sec.", "x": 2, "y": 0 },
        "Pyroblast": { "id": 138, "ranks": [], "maxRank": 1, "icon": "spell_fire_fireball02", "description": "Hurls an immense fiery boulder that causes massive Fire damage and an additional Fire damage over 12 sec.", "x": 1, "y": 2 },
        "Critical Mass": { "id": 139, "ranks": [], "maxRank": 3, "icon": "spell_nature_wispheal", "description": "Increases the critical strike chance of your Fire spells by [2/4/6]%.", "x": 1, "y": 4 },
        "Blast Wave": { "id": 140, "ranks": [], "maxRank": 1, "icon": "spell_holy_excorcism_02", "description": "A wave of flame radiates outward from the caster, damaging all enemies caught within the blast for Fire damage, and dazing them for 6 sec.", "x": 1, "y": 4 },
        "Fire Power": { "id": 141, "ranks": [], "maxRank": 5, "icon": "spell_fire_immolation", "description": "Increases the damage done by your Fire spells by [2/4/6/8/10]%.", "x": 2, "y": 5 },
        "Combustion": { "id": 142, "ranks": [], "maxRank": 1, "icon": "spell_fire_sealoffire", "description": "When activated, this spell causes each of your Fire damage spell hits to increase your critical strike chance with Fire damage spells by 10%. This effect lasts until you have caused 3 critical strikes with Fire spells.", "x": 1, "y": 6 }
      }
    },
    "Frost": {
      "background": "MageFrost",
      "icon": "",
      "talents": {
        "Elemental Precision": { "id": 143, "ranks": [], "maxRank": 3, "icon": "spell_ice_magicdamage", "description": "Reduces the chance that the opponent can resist your Frost and Fire spells by [2/4/6]%.", "x": 0, "y": 1 },
        "Ice Shards": { "id": 144, "ranks": [], "maxRank": 5, "icon": "spell_frost_iceshard", "description": "Increases the critical strike damage bonus of your Frost spells by [20/40/60/80/100]%.", "x": 2, "y": 1 },
        "Cold Snap": { "id": 145, "ranks": [], "maxRank": 1, "icon": "spell_frost_wizardmark", "description": "When activated, this spell finishes the cooldown on all of your Frost spells.", "x": 1, "y": 2 },
        "Ice Block": { "id": 146, "ranks": [], "maxRank": 1, "icon": "spell_frost_frost", "description": "You become encased in a block of ice, protecting you from all physical attacks and spells for 10 sec, but during that time you cannot attack, move or cast spells.", "x": 1, "y": 4 },
        "Ice Barrier": { "id": 147, "ranks": [], "maxRank": 1, "icon": "spell_ice_lament", "description": "Instantly shields you, absorbing damage. Lasts 1 min. While the shield holds, spells will not be interrupted.", "x": 1, "y": 6 }
      }
    }
  },
  "warlock": {
    "Affliction": {
      "background": "WarlockAffliction",
      "icon": "",
      "talents": {
        "Suppression": { "id": 148, "ranks": [], "maxRank": 5, "icon": "spell_shadow_unsummonbuilding", "description": "Reduces the chance for enemies to resist your Affliction spells by [2/4/6/8/10]%.", "x": 1, "y": 0 },
        "Imp Corruption": { "id": 149, "ranks": [], "maxRank": 5, "icon": "spell_shadow_abominationexplosion", "description": "Reduces the casting time of your Corruption spell by [0.4/0.8/1.2/1.6/2.0] sec.", "x": 2, "y": 0 },
        "Siphon Life": { "id": 150, "ranks": [], "maxRank": 1, "icon": "spell_shadow_requiem", "description": "Transfers health from the target to the caster every 3 sec. Lasts 30 sec.", "x": 1, "y": 4 },
        "Shadow Mastery": { "id": 151, "ranks": [], "maxRank": 5, "icon": "spell_shadow_shadetruesight", "description": "Increases the damage dealt or life drained by your Shadow spells by [2/4/6/8/10]%.", "x": 1, "y": 5 },
        "Dark Pact": { "id": 152, "ranks": [], "maxRank": 1, "icon": "spell_shadow_darkritual", "description": "Drains Mana from your summoned demon to restore your own Mana.", "x": 1, "y": 6 }
      }
    },
    "Demonology": {
      "background": "WarlockDemonology",
      "icon": "",
      "talents": {
        "Demonic Embrace": { "id": 153, "ranks": [], "maxRank": 5, "icon": "spell_shadow_metamorphosis", "description": "Increases your total Stamina by [3/6/9/12/15]% but reduces your total Spirit by [1/2/3/4/5]%.", "x": 1, "y": 0 },
        "Fel Domination": { "id": 154, "ranks": [], "maxRank": 1, "icon": "spell_nature_removecurse", "description": "Your next Imp, Voidwalker, Succubus, or Felhunter summoning spell has its casting time reduced by 5.5 sec and its Mana cost reduced by 50%.", "x": 2, "y": 2 },
        "Master Summoner": { "id": 155, "ranks": [], "maxRank": 2, "icon": "spell_shadow_impphaseshift", "description": "Reduces the casting time of your Imp, Voidwalker, Succubus, and Felhunter summoning spells by [2/4] sec and their Mana cost by [20/40]%.", "x": 1, "y": 3 },
        "Demonic Sacrifice": { "id": 156, "ranks": [], "maxRank": 1, "icon": "spell_shadow_psychicscream", "description": "When activated, sacrifices your summoned demon to grant you an effect that lasts 30 min. The effect is canceled if any Demon is summoned.", "x": 1, "y": 4 },
        "Soul Link": { "id": 157, "ranks": [], "maxRank": 1, "icon": "spell_shadow_gathershadows", "description": "While active, 30% of all damage taken by the caster is taken by your Imp, Voidwalker, Succubus, or Felhunter demon instead. In addition, both the demon and master inflict 3% more damage.", "x": 1, "y": 6 }
      }
    },
    "Destruction": {
      "background": "WarlockDestruction",
      "icon": "",
      "talents": {
        "Imp Shadow Bolt": { "id": 158, "ranks": [], "maxRank": 5, "icon": "spell_shadow_shadowbolt", "description": "Your Shadow Bolt critical strikes increase the next 4 sources of Shadow damage dealt to the target by 20%.", "x": 1, "y": 0 },
        "Bane": { "id": 159, "ranks": [], "maxRank": 5, "icon": "spell_shadow_deathpact", "description": "Reduces the casting time of your Shadow Bolt and Immolate spells by [0.1/0.2/0.3/0.4/0.5] sec and your Soul Fire spell by [0.4/0.8/1.2/1.6/2.0] sec.", "x": 2, "y": 1 },
        "Shadowburn": { "id": 160, "ranks": [], "maxRank": 1, "icon": "spell_shadow_scourgebuild", "description": "Instantly blasts the target for Shadow damage. If the target dies within 5 sec of Shadowburn, and yields experience or honor, the caster gains a Soul Shard.", "x": 0, "y": 2 },
        "Devastation": { "id": 161, "ranks": [], "maxRank": 5, "icon": "spell_fire_flameshock", "description": "Increases the critical strike chance of your Destruction spells by [1/2/3/4/5]%.", "x": 2, "y": 2 },
        "Ruin": { "id": 162, "ranks": [], "maxRank": 1, "icon": "spell_shadow_shadowwordpain", "description": "Increases the critical strike damage bonus of your Destruction spells by 100%.", "x": 1, "y": 4 },
        "Conflagrate": { "id": 163, "ranks": [], "maxRank": 1, "icon": "spell_fire_fireball", "description": "Ignites the target, dealing Fire damage and consuming an Immolate spell on the target.", "x": 1, "y": 6 }
      }
    }
  },
  "druid": {
    "Balance": {
      "background": "DruidBalance",
      "icon": "",
      "talents": {
        "Nature's Grasp": { "id": 164, "ranks": [], "maxRank": 1, "icon": "spell_nature_natureswrath", "description": "While active, any time an enemy strikes the caster they have a 35% chance to become afflicted by Entangling Roots (Rank 1).", "x": 1, "y": 0 },
        "Omen of Clarity": { "id": 165, "ranks": [], "maxRank": 1, "icon": "spell_nature_crystalball", "description": "Imbues the Druid with natural energy. Each of the Druid's melee attacks has a chance of causing the caster to enter a Clearcasting state.", "x": 2, "y": 2 },
        "Moonkin Form": { "id": 166, "ranks": [], "maxRank": 1, "icon": "spell_nature_forceofnature", "description": "Transforms the Druid into Moonkin Form. While in this form the armor contribution from items is increased by 360% and all party members within 30 yards have their spell critical chance increased by 3%.", "x": 1, "y": 4 },
        "Moonfury": { "id": 167, "ranks": [], "maxRank": 5, "icon": "spell_nature_moonglow", "description": "Increases the damage done by your Starfire, Moonfire and Wrath spells by [2/4/6/8/10]%.", "x": 1, "y": 5 }
      }
    },
    "Feral Combat": {
      "background": "DruidFeral Combat",
      "icon": "",
      "talents": {
        "Ferocity": { "id": 168, "ranks": [], "maxRank": 5, "icon": "ability_hunter_pet_hyena", "description": "Reduces the cost of your Maul, Swipe, Claw, Rake and Mangle abilities by [1/2/3/4/5] Rage or Energy.", "x": 2, "y": 0 },
        "Feral Charge": { "id": 169, "ranks": [], "maxRank": 1, "icon": "ability_hunter_pet_bear", "description": "Causes you to charge an enemy, immobilizing and interrupting any spell being cast for 4 sec.", "x": 2, "y": 2 },
        "Sharpened Claws": { "id": 170, "ranks": [], "maxRank": 3, "icon": "inv_misc_monsterclaw_04", "description": "Increases your critical strike chance while in Bear, Dire Bear or Cat Form by [2/4/6]%.", "x": 2, "y": 2 },
        "Faerie Fire (Feral)": { "id": 171, "ranks": [], "maxRank": 1, "icon": "spell_nature_faeriefire", "description": "Decrease the armor of the target for 40 sec. While affected, the target cannot stealth or turn invisible.", "x": 2, "y": 4 },
        "Heart of the Wild": { "id": 172, "ranks": [], "maxRank": 5, "icon": "spell_holy_blessingofagility", "description": "Increases your Intellect by [4/8/12/16/20]%. In addition, while in Bear or Dire Bear Form your Stamina is increased by [4/8/12/16/20]% and while in Cat Form your Strength is increased by [4/8/12/16/20]%.", "x": 1, "y": 5 },
        "Leader of the Pack": { "id": 173, "ranks": [], "maxRank": 1, "icon": "spell_nature_unyeildingstamina", "description": "While in Cat, Bear or Dire Bear Form, the Leader of the Pack increases ranged and melee critical chance of all party members within 45 yards by 3%.", "x": 1, "y": 6 }
      }
    },
    "Restoration": {
      "background": "DruidRestoration",
      "icon": "",
      "talents": {
        "Furor": { "id": 174, "ranks": [], "maxRank": 5, "icon": "spell_holy_blessingofstamina", "description": "Gives you [20/40/60/80/100]% chance to gain 10 Rage when you shapeshift into Bear and Dire Bear Form or 40 Energy when you shapeshift into Cat Form.", "x": 2, "y": 0 },
        "Insect Swarm": { "id": 175, "ranks": [], "maxRank": 1, "icon": "spell_nature_insectswarm", "description": "The enemy target is swarmed by insects, decreasing their chance to hit by 2% and causing Nature damage over 12 sec.", "x": 2, "y": 2 },
        "Nature's Swiftness": { "id": 176, "ranks": [], "maxRank": 1, "icon": "spell_nature_ravenform", "description": "When activated, your next Nature spell becomes an instant cast spell.", "x": 1, "y": 4 },
        "Innervate": { "id": 177, "ranks": [], "maxRank": 1, "icon": "spell_nature_lightning", "description": "Increases the target's Mana regeneration by 400% and allows 100% of Mana regeneration to continue while casting. Lasts 20 sec.", "x": 1, "y": 6 }
      }
    }
  }
};
