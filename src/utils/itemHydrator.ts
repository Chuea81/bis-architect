
import { Item, ItemSubclass } from '../types';

export type WoWItem = Item;

const STAT_MAPPING: Record<string, string> = {
  // Primary Stats → SHORT canonical keys
  "str": "str", "Str": "str", "Strength": "str", "strength": "str",
  "sta": "stam", "Sta": "stam", "Stamina": "stam", "stamina": "stam",
  "agi": "agi", "Agi": "agi", "Agility": "agi", "agility": "agi",
  "int": "int", "Int": "int", "Intellect": "int", "intellect": "int",
  "spi": "spirit", "Spi": "spirit", "Spirit": "spirit", "spirit": "spirit",
  // Combat Stats → SHORT keys
  "ap": "ap", "attackpower": "ap", "Attack Power": "ap", "attack_power": "ap", "attackPower": "ap",
  "sp": "sp", "spellpower": "sp", "Spell Power": "sp", "spell_power": "sp", "spellPower": "sp",
  "healing": "healing", "Healing": "healing", "Bonus Healing": "healing", "bonus_healing": "healing", "Healing Power": "healing",
  "hit": "hit", "Hit": "hit", "Hit %": "hit", "hit %": "hit", "Spell Hit": "hit", "spell hit": "hit", "Melee Hit": "hit", "spellHit": "hit", "SpellHit": "hit", "meleeHit": "hit", "MeleeHit": "hit", "hitChance": "hit", "hit_chance": "hit",
  "crit": "crit", "Crit": "crit", "Crit %": "crit", "crit %": "crit", "Spell Crit": "crit", "spell crit": "crit", "Melee Crit": "crit", "spellCrit": "crit", "SpellCrit": "crit", "meleeCrit": "crit", "MeleeCrit": "crit", "critChance": "crit", "crit_chance": "crit",
  "haste": "haste", "Haste": "haste", "Haste %": "haste", "Spell Haste": "haste",
  "Armor": "armor", "armor": "armor", "Bonus Armor": "armor", "bonus_armor": "armor",
  "Block": "block", "block": "block", "Dodge": "dodge", "dodge": "dodge", "Parry": "parry", "parry": "parry", "Defense": "defense", "defense": "defense",
  "mp5": "mp5", "mana_regen": "mp5", "manaregen": "mp5", "hp5": "hp5", "health_regen": "hp5", "Mana per 5 sec": "mp5",
  // Resistances
  "Fire Resistance": "fireRes", "fireRes": "fireRes", "fire_resistance": "fireRes", "Fireres": "fireRes", "fireres": "fireRes", "Fire Res": "fireRes",
  "Frost Resistance": "frostRes", "frostRes": "frostRes", "frost_resistance": "frostRes", "Frostres": "frostRes", "frostres": "frostRes", "Frost Res": "frostRes",
  "Nature Resistance": "natureRes", "natureRes": "natureRes", "nature_resistance": "natureRes", "Natureres": "natureRes", "natureres": "natureRes", "Nature Res": "natureRes",
  "Shadow Resistance": "shadowRes", "shadowRes": "shadowRes", "shadow_resistance": "shadowRes", "Shadowres": "shadowRes", "shadowres": "shadowRes", "Shadow Res": "shadowRes",
  "Arcane Resistance": "arcaneRes", "arcaneRes": "arcaneRes", "arcane_resistance": "arcaneRes", "Arcaneres": "arcaneRes", "arcaneres": "arcaneRes", "Arcane Res": "arcaneRes",
  // School-Specific Spell Damage
  "Shadow Damage": "spShadow", "shadow_damage": "spShadow", "shadowdmg": "spShadow", "Shadow Spell Damage": "spShadow", "shadowDmg": "spShadow", "spShadow": "spShadow",
  "Fire Damage": "spFire", "fire_damage": "spFire", "firedmg": "spFire", "Fire Spell Damage": "spFire", "fireDmg": "spFire", "spFire": "spFire",
  "Frost Damage": "spFrost", "frost_damage": "spFrost", "frostdmg": "spFrost", "Frost Spell Damage": "spFrost", "frostDmg": "spFrost", "spFrost": "spFrost",
  "Nature Damage": "spNature", "nature_damage": "spNature", "naturedmg": "spNature", "Nature Spell Damage": "spNature", "natureDmg": "spNature", "spNature": "spNature",
  "Arcane Damage": "spArcane", "arcane_damage": "spArcane", "arcanedmg": "spArcane", "Arcane Spell Damage": "spArcane", "arcaneDmg": "spArcane", "spArcane": "spArcane",
  "Holy Damage": "spHoly", "holy_damage": "spHoly", "holydmg": "spHoly", "Holy Spell Damage": "spHoly", "holyDmg": "spHoly", "spHoly": "spHoly",
  // Identity mappings for already-short keys passing through
  "stam": "stam", "rangedAp": "rangedAp"
};

const FALLBACK_ICONS: Record<string, string> = {
    "Head": "inv_helmet_04", "Neck": "inv_jewelry_necklace_20", "Shoulder": "inv_shoulder_23", "Back": "inv_misc_cape_18", 
    "Chest": "inv_chest_plate03", "Wrist": "inv_bracer_07", "Hands": "inv_gauntlets_17", "Waist": "inv_belt_12", 
    "Legs": "inv_pants_plate_05", "Feet": "inv_boots_chain_05", "Ring": "inv_jewelry_ring_22", "Trinket": "inv_jewelry_talisman_08", 
    "Main Hand": "inv_sword_39", "One-Hand": "inv_sword_39", "Two-Hand": "inv_sword_39", "Off Hand": "inv_shield_05", 
    "Shield": "inv_shield_05", "Ranged": "inv_weapon_bow_08", "Relic": "inv_misc_idol_02", "Wand": "inv_wand_01", 
    "Dagger": "inv_weapon_shortblade_05", "Staff": "inv_staff_13", "Mace": "inv_mace_01", "Axe": "inv_axe_01", "Sword": "inv_sword_04"
};

const ICON_OVERRIDES: Record<string, string> = {
    "Medallion of Steadfast Might": "inv_jewelry_talisman_09",
    "Choker of Enlightenment": "inv_jewelry_necklace_13",
    "Choker of the Fire Lord": "inv_jewelry_necklace_11",
    "Talisman of Ephemeral Power": "inv_misc_stonetablet_05",
    "Ring of Spell Power": "inv_jewelry_ring_35",
    "Band of Accuria": "inv_jewelry_ring_15",
    "Quick Strike Ring": "inv_jewelry_ring_40",
    "Striker's Mark": "inv_weapon_bow_08",
    "Perdition's Blade": "inv_weapon_shortblade_13",
    "Core Hound Tooth": "inv_weapon_shortblade_12",
    "Brutality Blade": "inv_sword_44",
    "Azuresong Mageblade": "inv_sword_39",
    "Staff of Dominance": "inv_staff_33",
    "Band of Sulfuras": "inv_jewelry_ring_38",
    "Onslaught Girdle": "inv_belt_28",
    "Mana Igniting Cord": "inv_belt_13",
    "Sash of Whispered Secrets": "inv_belt_11",
    "Wristguards of Stability": "inv_bracer_02",
    "Flameguard Gauntlets": "inv_gauntlets_05",
    "Aged Core Leather Gloves": "inv_gauntlets_23",
    "Sapphiron Drape": "inv_misc_cape_20",
    "Cloak of the Shrouded Mists": "inv_misc_cape_18",
    "Cauterizing Band": "inv_jewelry_ring_38",
    "Aurastone Hammer": "inv_mace_11",
    "Sorcerous Dagger": "inv_weapon_shortblade_29",
    "Deathbringer": "inv_axe_09",
    "Vis'kag the Bloodletter": "inv_sword_41",
    "Obsidian Edged Blade": "inv_sword_49",
};

const SET_PREFIXES = [
    "Nemesis", "Felheart", "Plagueheart", "Arcanist", "Netherwind", "Frostfire",
    "Cenarion", "Stormrage", "Dreamwalker", "Giantstalker", "Dragonstalker", "Cryptstalker",
    "Lawbringer", "Judgement", "Redemption", "Prophecy", "Transcendence", "Faith",
    "Nightslayer", "Bloodfang", "Bonescythe", "Earthfury", "Ten Storms", "Earthshatter",
    "Battlegear of Might", "Battlegear of Wrath", "Dreadnaught", "Bloodvine",
    "Dal'Rend", "Zandalar", "Hakkari", "Kezan",
    "Doomcaller", "Enigma", "Deathdealer", "Striker", "Genesis", "Stormcaller", "Avenger", "Conqueror"
];

const PREFIX_TO_SET: Record<string, string> = {
    // Tier 1 (MC)
    "Felheart": "Felheart Raiment",
    "Arcanist": "Arcanist Regalia",
    "Nightslayer": "Nightslayer Armor",
    "Giantstalker": "Giantstalker Armor",
    "Cenarion": "Cenarion Raiment",
    "Prophecy": "Vestments of the Prophecy",
    "Earthfury": "Earthfury Raiment",
    "Lawbringer": "Lawbringer Armor",
    "Battlegear of Might": "Battlegear of Might",
    // Tier 2 (BWL)
    "Nemesis": "Nemesis Raiment",
    "Netherwind": "Netherwind Regalia",
    "Bloodfang": "Bloodfang Armor",
    "Dragonstalker": "Dragonstalker Armor",
    "Stormrage": "Stormrage Raiment",
    "Transcendence": "Vestments of Transcendence",
    "Ten Storms": "The Ten Storms",
    "Judgement": "Judgement Armor",
    "Battlegear of Wrath": "Battlegear of Wrath",
    // Tier 2.5 (AQ40)
    "Doomcaller": "Doomcaller's Attire",
    "Enigma": "Enigma Vestments",
    "Deathdealer": "Deathdealer's Embrace",
    "Striker": "Striker's Garb",
    "Genesis": "Genesis Raiment",
    "Stormcaller": "Stormcaller's Garb",
    "Avenger": "Avenger's Battlegear",
    "Conqueror": "Conqueror's Battlegear",
    // Tier 3 (Naxx)
    "Plagueheart": "Plagueheart Raiment",
    "Frostfire": "Frostfire Regalia",
    "Bonescythe": "Bonescythe Armor",
    "Cryptstalker": "Cryptstalker Armor",
    "Dreamwalker": "Dreamwalker Raiment",
    "Faith": "Vestments of Faith",
    "Earthshatter": "Earthshatter Raiment",
    "Redemption": "Redemption Armor",
    "Dreadnaught": "Dreadnaught's Battlegear",
    // Crafted / ZG
    "Bloodvine": "Bloodvine Garb",
};

const BAD_SLOTS = new Set([
    "Miscellaneous", "Plate", "Mail", "Leather", "Cloth", 
    "Quest", "Consumable", "Reagent", "Junk", "Trade Goods", "Non-equippable"
]);

const STAT_PATTERNS = [
    { key: 'sp', regex: /increases (?:damage and )?healing done by magical spells and effects by up to (\d+)/i },
    { key: 'sp', regex: /increases damage and healing done by magical spells and effects by up to (\d+)/i },
    { key: 'sp', regex: /spell power \+?(\d+)/i },
    { key: 'spShadow', regex: /increases shadow damage by up to (\d+)/i },
    { key: 'spFire', regex: /increases fire damage by up to (\d+)/i },
    { key: 'spFrost', regex: /increases frost damage by up to (\d+)/i },
    { key: 'spArcane', regex: /increases arcane damage by up to (\d+)/i },
    { key: 'spNature', regex: /increases nature damage by up to (\d+)/i },
    { key: 'spHoly', regex: /increases holy damage by up to (\d+)/i },
    { key: 'healing', regex: /increases healing done by spells and effects by up to (\d+)/i },
    { key: 'mp5', regex: /restores (\d+) mana (?:per|every) 5 sec/i },
    { key: 'mp5', regex: /mana regen \+?(\d+)/i },
    { key: 'hit', regex: /increases (?:your )?chance to hit(?: with spells)? by (\d+)%/i },
    { key: 'hit', regex: /(?:spell )?hit \+?(\d+)%/i },
    { key: 'crit', regex: /improves (?:your )?chance to get a critical strike(?: with spells)? by (\d+)%/i },
    { key: 'crit', regex: /increases your critical strike chance by (\d+)%/i },
    { key: 'crit', regex: /(?:spell )?crit \+?(\d+)%/i },
    { key: 'ap', regex: /increases attack power by (\d+)/i },
    { key: 'ap', regex: /attack power \+?(\d+)/i },
    { key: 'dodge', regex: /increases your chance to dodge an attack by (\d+)%/i },
    { key: 'parry', regex: /increases your chance to parry an attack by (\d+)%/i },
    { key: 'block', regex: /increases your chance to block an attack by (\d+)%/i },
    { key: 'defense', regex: /increased defense \+?(\d+)/i }
];

const WEAPON_SUBCLASSES: Record<string, string[]> = {
    "Axe": ["axe", "cleaver", "reaver", "hatchet", "chopper", "decapitator", "doom's edge", "crul'shorukh", "edge of chaos", "miner's revenge", "excavator"],
    "Sword": ["sword", "blade", "saber", "longsword", "claymore", "razor", "shear", "slayer", "scimitar", "mageblade", "vis'kag", "quel'serrar", "chromatically tempered", "thunderfury", "nightmare blade", "brutality blade", "maladath", "dal'rend", "warblade", "teebu's", "avenger", "vanquisher", "talwar", "deflector", "ripper", "fang of the faceless", "hacker"],
    "Mace": ["mace", "hammer", "mallet", "pounder", "scepter", "club", "maul", "bludgeon", "hand of ragnaros", "sulfuras", "persuader", "spire of the stoneshaper", "aurastone", "finkle's lava", "fighting stick", "constructor", "smiter", "crusher"],
    "Dagger": ["dagger", "shiv", "shank", "knife", "scalpel", "shortblade", "stiletto", "perdition's", "fang", "gutgore", "perdi", "core hound tooth", "dragonfang", "barman shanker", "electrocutioner", "finkle's skinner", "lobotomizer", "glacial blade", "spectral shard"],
    "Staff": ["staff", "stave", "spire", "stick", "cane", "anathema", "benediction", "atiesh", "shadow wing focus", "staff of the shadow flame", "rod of the ogre magi", "emberstone", "illusionary rod"],
    "Polearm": ["polearm", "lance", "halberd", "spear", "scythe", "reaper", "ice barbed spear", "treant's bane", "blackhand doomsaw", "peacemaker", "grim reaper"],
    "Wand": ["wand", "finger", "touch", "crimson shocker", "pyre", "ember", "torch of austen", "stormrager", "bonecreeper"],
    "Bow": ["bow", "longbow", "shortbow", "striker", "blaster", "rhok'delar", "heartseeker", "eaglehorn", "ripstick", "hurrican"],
    "Gun": ["gun", "rifle", "blaster", "cannon", "shotgun", "musket", "boomstick", "dragonbreath", "blunderbuss", "megashot"],
    "Crossbow": ["crossbow", "launcher", "arbalest", "polychromatic", "needle threader"],
    "Fist Weapon": ["fist", "claw", "knuckle", "ripper", "gargoyle", "eskhandar", "baghnakhs"],
    "Shield": ["shield", "buckler", "aegis", "barrier", "bulwark", "defender", "crest", "blocker", "drillborer", "disk", "force reactive"]
};

const detectSubclass = (name: string, slot: string): ItemSubclass | undefined => {
    const n = name.toLowerCase();
    for (const [sub, keywords] of Object.entries(WEAPON_SUBCLASSES)) {
        if (keywords.some(k => n.includes(k))) return sub as ItemSubclass;
    }
    if (slot === "Shield" || slot === "OffHand" || slot === "Off Hand") {
        if (WEAPON_SUBCLASSES["Shield"].some(k => n.includes(k))) return "Shield";
        if (n.includes("tome") || n.includes("book") || n.includes("grimoire") || n.includes("star") || n.includes("bag") || n.includes("sack") || n.includes("orb") || n.includes("stone")) return "Held In Off-hand"; 
    }
    return undefined;
};

const cleanText = (val: any): string => {
    if (typeof val !== 'string') return '';
    let cleaned = val
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\\"/g, '"') // Remove escaped quotes
        .trim();
        
    const lower = cleaned.toLowerCase();
    if (lower.includes("ge('") || lower.includes('ge("') || lower.includes("tooltip.fix") || lower.includes("g_items")) return "";
    return cleaned;
};

// --- ZONE INFERENCE ---
const inferZone = (item: Item): string => {
    const src = (item.source || "").toLowerCase();
    const name = item.name.toLowerCase();
    const set = (item.setName || "").toLowerCase();
    const quality = item.quality || 1;

    // 1. Existing Zone Valid
    if (item.zone && (item.zone.includes('Molten Core') || item.zone.includes('Blackwing') || item.zone.includes('Naxx') || item.zone.includes('Ahn\'Qiraj'))) return item.zone;

    // 2. Set Name / Item Name Inference (Critical for Tier sets)
    if (set.includes('felheart') || name.startsWith('felheart')) return 'Molten Core';
    if (set.includes('giantstalker') || name.startsWith('giantstalker')) return 'Molten Core';
    if (set.includes('earthfury') || name.startsWith('earthfury')) return 'Molten Core';
    if (set.includes('cenarion') || name.startsWith('cenarion')) return 'Molten Core';
    if (set.includes('arcanist') || name.startsWith('arcanist')) return 'Molten Core';
    if (set.includes('lawbringer') || name.startsWith('lawbringer')) return 'Molten Core';
    if (set.includes('nightslayer') || name.startsWith('nightslayer')) return 'Molten Core';
    if (set.includes('prophecy') || name.startsWith('prophecy')) return 'Molten Core';
    
    // Strict quality check for "Might" to avoid "Belt of Might" (Green)
    if (set.includes('battlegear of might') || name.includes(' of might')) {
        if (quality === 4) return 'Molten Core';
    }

    if (set.includes('nemesis') || name.startsWith('nemesis')) return 'Blackwing Lair';
    if (set.includes('dragonstalker') || name.startsWith('dragonstalker')) return 'Blackwing Lair';
    if (set.includes('ten storms') || name.startsWith('ten storms')) return 'Blackwing Lair';
    if (set.includes('stormrage') || name.startsWith('stormrage')) return 'Blackwing Lair';
    if (set.includes('netherwind') || name.startsWith('netherwind')) return 'Blackwing Lair';
    if (set.includes('judgement') || name.startsWith('judgement')) return 'Blackwing Lair';
    if (set.includes('bloodfang') || name.startsWith('bloodfang')) return 'Blackwing Lair';
    if (set.includes('transcendence') || name.startsWith('transcendence')) return 'Blackwing Lair';
    
    // Strict quality check for "Wrath" to avoid random "of Wrath" greens
    if (set.includes('battlegear of wrath') || name.includes(' of wrath')) {
        if (quality === 4) return 'Blackwing Lair';
    }

    // 3. Boss Source Inference
    if (src.includes('ragnaros') || src.includes('garr') || src.includes('geddon') || src.includes('majordomo') || src.includes('golemagg')) return "Molten Core";
    if (src.includes('onyxia')) return "Onyxia's Lair";
    if (src.includes('nefarian') || src.includes('chromaggus') || src.includes('vaelastrasz')) return "Blackwing Lair";
    
    return item.zone || "";
};

export function hydrateItem(rawItem: any): Item {
  const item: Item = { ...rawItem };

  if (typeof item.name !== 'string') item.name = item.name ? String(item.name) : "Unknown Item";
  
  // SLOT HANDLING: Firestore stores numeric slot IDs (e.g. 5) with slotText (e.g. "Chest")
  // Convert numeric slot to human-readable string for UI display
  const SLOT_ID_TO_TEXT: Record<number, string> = {
      1: "Head", 2: "Neck", 3: "Shoulder", 4: "Shirt", 5: "Chest",
      6: "Waist", 7: "Legs", 8: "Feet", 9: "Wrist", 10: "Hands",
      11: "Ring", 12: "Trinket", 13: "One-Hand", 14: "Shield",
      15: "Ranged", 16: "Back", 17: "Two-Hand", 18: "Bag",
      20: "Chest", 21: "Main Hand", 22: "Off Hand",
      23: "Held In Off-hand", 24: "Projectile", 25: "Thrown",
      26: "Wand", 28: "Relic"
  };
  
  if (typeof item.slot === 'number') {
      // Preserve the numeric ID for potential query use
      item.slotId = item.slot;
      // Use slotText if available, otherwise map from numeric ID
      item.slot = rawItem.slotText || SLOT_ID_TO_TEXT[item.slot] || "Misc";
  } else if (typeof item.slot !== 'string') {
      item.slot = rawItem.slotText || "Misc";
  } else if (item.slot && /^\d+$/.test(item.slot)) {
      // Handle case where slot was already stringified (e.g. "5")
      const numSlot = parseInt(item.slot, 10);
      item.slotId = numSlot;
      item.slot = rawItem.slotText || SLOT_ID_TO_TEXT[numSlot] || "Misc";
  }
  
  if (typeof item.icon !== 'string') item.icon = item.icon ? String(item.icon) : "";

  // Effects normalization
  if (!item.effects || item.effects.length === 0) {
      if (rawItem.special_effects && Array.isArray(rawItem.special_effects)) item.effects = [...rawItem.special_effects];
      else if (rawItem.spells && Array.isArray(rawItem.spells)) {
          const effects: string[] = [];
          for (let i = 0; i < rawItem.spells.length; i++) {
              const s = rawItem.spells[i];
              if (s.description) effects.push(s.description);
              else if (s.trigger_string) effects.push(s.trigger_string);
          }
          if (effects.length > 0) item.effects = effects;
      }
  }
  if (rawItem.proc_effect && (!item.effects || !item.effects.includes(rawItem.proc_effect))) {
      if (!item.effects) item.effects = [];
      item.effects.push(rawItem.proc_effect);
  }

  // Text cleaning
  item.name = cleanText(item.name);
  if (item.source) item.source = cleanText(item.source);
  if (item.zone) item.zone = cleanText(item.zone);
  
  // Clean all effects fields
  if (item.effects) item.effects = item.effects.map(e => cleanText(e)).filter(e => e.length > 0);
  if (item.use_effect) item.use_effect = cleanText(item.use_effect);
  if (item.equipEffect) item.equipEffect = cleanText(item.equipEffect);
  if (item.procEffect) item.procEffect = cleanText(item.procEffect);
  if (item.useEffect) item.useEffect = cleanText(item.useEffect);
  if (item.description) item.description = cleanText(item.description);
  
  // Set Name Inference
  if (!item.setName) {
      for (let i = 0; i < SET_PREFIXES.length; i++) {
          const prefix = SET_PREFIXES[i];
          if (item.name.startsWith(prefix)) {
              item.setName = PREFIX_TO_SET[prefix] || prefix + " Set";
              break;
          }
      }
  }

  // Zone Inference (Must run after Set Name inference)
  if (!item.zone || item.zone === "") {
      item.zone = inferZone(item);
  }

  // Stats
  const newStats: Record<string, number> = {};
  const dbStatKeys = new Set<string>();

  if (item.stats) {
    for (const key in item.stats) {
        const value = item.stats[key];
        if (Number(value) !== 0 && !isNaN(Number(value))) {
            const cleanKey = key.replace('+', '').trim(); 
            const mappedKey = STAT_MAPPING[cleanKey] || STAT_MAPPING[cleanKey.toLowerCase()] || cleanKey;
            if (mappedKey === 'armor' && newStats['armor']) {
               if (cleanKey === "Armor") newStats[mappedKey] = Number(value);
            } else {
               newStats[mappedKey] = Number(value);
            }
            dbStatKeys.add(mappedKey);
        }
    }
  }
  
  // Parse effect text for EQUIP stats (permanent bonuses only)
  // Use/proc effects are stored separately for EP estimation
  const useEffects: string[] = [];
  if (item.effects) {
      item.effects.forEach(effect => {
          const lower = effect.toLowerCase();
          // Separate "Use:" effects from "Equip:" effects
          const isUseEffect = lower.startsWith('use:') || lower.includes('(') && lower.includes('cooldown');
          const isProcEffect = lower.startsWith('chance on hit') ||
              (lower.includes('chance to') && !lower.includes('your chance to')) ||
              lower.includes('when struck');

          if (isUseEffect || isProcEffect) {
              useEffects.push(effect);
          } else {
              // Only parse EQUIP (permanent) effects into stats
              for (const pattern of STAT_PATTERNS) {
                  const match = effect.match(pattern.regex);
                  if (match && match[1]) {
                      const val = parseInt(match[1], 10);
                      if (!isNaN(val)) {
                          const mappedKey = STAT_MAPPING[pattern.key] || pattern.key;
                          if (!dbStatKeys.has(mappedKey)) {
                              newStats[mappedKey] = (newStats[mappedKey] || 0) + val;
                          }
                      }
                  }
              }
          }
      });
  }
  item.stats = newStats;
  // Store use/proc effect text for downstream EP estimation
  if (useEffects.length > 0) {
      item.useEffectTexts = useEffects;
  }

  // Resistances
  if (item.resistances) {
      for (const key in item.resistances) {
          const value = item.resistances[key];
          if (Number(value) > 0) {
              const cleanKey = key.toLowerCase() + "Res"; 
              const mappedKey = STAT_MAPPING[key + " Resistance"] || STAT_MAPPING[key + "_resistance"] || cleanKey;
              item.stats[mappedKey] = Number(value);
          }
      }
  }

  // Slot Logic & Icon Fallback (Same as before)
  const nameLower = item.name.toLowerCase();
  if (nameLower.includes("pearl of the tides") || item.id === 83563) {
      item.slot = "Trinket";
      if (!item.quality || Number(item.quality) < 2) item.quality = 2; 
  }
  else if (nameLower.includes("jin'do's evil eye") || item.id === 19885) {
      item.slot = "Neck";
  }
  else if (!item.slot || BAD_SLOTS.has(item.slot) || nameLower.includes("headband")) {
      if (nameLower.includes("helm") || nameLower.includes("mask") || nameLower.includes("head")) item.slot = "Head";
      else if (nameLower.includes("shoulder") || nameLower.includes("mantle")) item.slot = "Shoulder";
      else if (nameLower.includes("chest") || nameLower.includes("robe") || nameLower.includes("tunic") || nameLower.includes("vest")) item.slot = "Chest";
      else if (nameLower.includes("leg") || nameLower.includes("pants") || nameLower.includes("kilt")) item.slot = "Legs";
      else if (nameLower.includes("feet") || nameLower.includes("boots")) item.slot = "Feet";
      else if (nameLower.includes("hand") || nameLower.includes("gloves") || nameLower.includes("gauntlets")) item.slot = "Hands";
      else if (nameLower.includes("waist") || nameLower.includes("belt") || nameLower.includes("girdle")) item.slot = "Waist";
      else if (nameLower.includes("wrist") || nameLower.includes("bracer")) item.slot = "Wrist";
      else if (nameLower.includes("cloak") || nameLower.includes("cape") || (nameLower.includes("mantle") && !nameLower.includes("shoulder"))) item.slot = "Back";
      else if (nameLower.includes("ring")) item.slot = "Ring";
      else if (nameLower.includes("trinket") || nameLower.includes("mark") || nameLower.includes("charm")) item.slot = "Trinket";
      else if (nameLower.includes("staff")) item.slot = "Staff";
      else if (nameLower.includes("dagger") || nameLower.includes("blade")) item.slot = "Dagger";
      else if (nameLower.includes("sword")) item.slot = "Sword";
      else if (nameLower.includes("mace") || nameLower.includes("hammer")) item.slot = "Mace";
      else if (nameLower.includes("axe")) item.slot = "Axe";
      else item.slot = "One-Hand";
  }

  if (!item.icon || item.icon.trim() === "" || item.icon.includes("inv_misc_questionmark") || ICON_OVERRIDES[item.name]) {
      if (ICON_OVERRIDES[item.name]) {
          item.icon = `https://wow.zamimg.com/images/wow/icons/large/${ICON_OVERRIDES[item.name]}.jpg`;
      } else {
          const slotKey = item.slot || "Chest";
          let fallbackKey = "Chest"; 
          if (FALLBACK_ICONS[slotKey]) fallbackKey = slotKey;
          else if (slotKey.includes("Hand") && !slotKey.includes("Main")) fallbackKey = "Hands";
          item.icon = `https://wow.zamimg.com/images/wow/icons/large/${FALLBACK_ICONS[fallbackKey] || "inv_misc_questionmark"}.jpg`;
      }
  }

  // Subclass
  const currentSub = item.subclass || "";
  const isGenericSubclass = !currentSub || currentSub === "Weapon" || currentSub.includes("One-Handed") || currentSub.includes("Two-Handed") || currentSub === "Miscellaneous" || currentSub === "Junk";
  if (isGenericSubclass) {
      const detected = detectSubclass(item.name, item.slot);
      if (detected) {
          item.subclass = detected;
          item.subtype = detected; 
      }
  }
  if (item.subtype && (isGenericSubclass || !item.subclass)) {
      item.subclass = item.subtype as ItemSubclass;
  }

  return item;
}
