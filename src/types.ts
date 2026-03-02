
export type RealmType = 'Classic' | 'Turtle';
export type GameMode = 'Leveling' | 'End Game' | 'PVP';
export type Gender = 'Male' | 'Female';
export type RaceName = 'Human' | 'Dwarf' | 'Night Elf' | 'Gnome' | 'Orc' | 'Undead' | 'Tauren' | 'Troll' | 'High Elf' | 'Goblin';
export type ClassName = 'Druid' | 'Hunter' | 'Mage' | 'Paladin' | 'Priest' | 'Rogue' | 'Shaman' | 'Warlock' | 'Warrior';
export type SpecName = string; 

export type ItemQuality = 'Poor' | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemSlot = 'Head' | 'Neck' | 'Shoulder' | 'Back' | 'Chest' | 'Shirt' | 'Tabard' | 'Wrist' | 'Hands' | 'Waist' | 'Legs' | 'Feet' | 'Ring' | 'Trinket' | 'Main Hand' | 'Off Hand' | 'One-Hand' | 'Two-Hand' | 'Ranged' | 'Relic' | 'Wand' | 'Shield' | 'Miscellaneous';

export type ItemSubclass = 
  // Weapons
  | 'Axe' | 'Sword' | 'Mace' | 'Dagger' | 'Fist Weapon' | 'Staff' | 'Polearm'
  | 'Bow' | 'Gun' | 'Crossbow' | 'Wand' | 'Thrown'
  // Armor
  | 'Shield' | 'Idol' | 'Libram' | 'Totem'
  | 'Cloth' | 'Leather' | 'Mail' | 'Plate'
  // Misc
  | 'Miscellaneous' | 'Junk' | 'Generic' | string;

export interface StatBlock {
  [key: string]: number;
}

export interface ResistanceBlock {
  fire?: number;
  frost?: number;
  shadow?: number;
  nature?: number;
  arcane?: number;
}

// The Core Data Structure (The Truth from ETL)
export interface ItemCore {
  name: string;
  slot: string; 
  quality: ItemQuality | number; 
  icon: string; 
  dps: number;
  stats: StatBlock;
  resistances: ResistanceBlock;
  effects: string[];
  use_effect?: string; 
  speed?: number;
  minDmg?: number;
  maxDmg?: number;
  req_level?: number;
  special_effects?: string[];
  gearScore?: number; // Added Gear Score
  
  // New Schema Fields
  equipEffect?: string;
  procEffect?: string;
  useEffect?: string;
  droppedBy?: string[];
  zone?: string;
}

export interface Enchant {
    id: number;
    name: string;
    text: string;
    stats: StatBlock;
    slots: string[];
    icon: string;
    realm?: RealmType;
    proc?: string;
}

export interface Item extends Partial<ItemCore> {
  id?: string | number;
  name: string; 
  slot: string; 
  source?: string;
  zone?: string;
  turtle?: Partial<ItemCore>; 
  
  rarity?: string; 
  classes?: ClassName[];
  proc?: string;
  use?: string;
  use_effect?: string; 
  realm?: RealmType | string; 
  bis?: boolean;
  enchant?: Enchant;
  setName?: string;
  minLevel?: number;
  subtype?: string;
  subclass?: ItemSubclass;
  bind?: string;
  description?: string;
  tags?: string[];
  
  min_damage?: number;
  max_damage?: number;

  // New Schema Fields
  equipEffect?: string;
  procEffect?: string;
  useEffect?: string;
  droppedBy?: string[];
  useEffectTexts?: string[];  // Parsed on-use/proc effect text for EP estimation
}

// For compatibility with some legacy imports
export type WoWItem = Item;

export interface SmartItem {
  props: ItemCore;
  diffs: {
    dps: number;
    stats: StatBlock;
    resistances: ResistanceBlock;
  };
  isModified: boolean;
  id: string | number;
  source?: string;
}

export type ItemStats = StatBlock;

export interface StatWeights {
    [key: string]: number;
}

export type ConsumableCategory = 'Flask' | 'Elixir' | 'Food' | 'World Buff' | 'Other' | 'Potion' | 'Explosive' | 'Device';

export interface Consumable {
    name: string;
    icon: string;
    category: ConsumableCategory;
    stats: StatBlock;
    description: string;
    exclusivityGroup?: string; // Added for Stacking Logic
}

export interface ItemSet {
    name: string;
    items: string[];
    bonuses: { threshold: number, text: string, stats?: StatBlock }[];
}

export interface AggregatedStats {
    str: number; agi: number; stam: number; int: number; spirit: number;
    health: number; mana: number;
    ap: number; armor: number; defense: number;
    sp: number; healing: number; spellPen: number;
    spArcane: number; spFire: number; spFrost: number; spHoly: number; spNature: number; spShadow: number;
    hit: number; crit: number; haste: number; spellVamp: number;
    mp5: number; hp5: number;
    regenCasting: number;
    resFire: number; resFrost: number; resNature: number; resShadow: number; resArcane: number;
    statMultiplier: number; damageMultiplier: number; threatReduction: number;
    strMod?: number; agiMod?: number; staminaMod?: number; intMod?: number; spiritMod?: number; healthMod?: number;
    swordSkill?: number; maceSkill?: number; axeSkill?: number; daggerSkill?: number; gunSkill?: number; bowSkill?: number;
    beastSlaying?: number; engineering?: number; herbalism?: number; alchemy?: number; mining?: number; meditation?: number;
    totalGearScore?: number; // Aggregate GS
}

export interface Build {
    [slot: string]: Item | undefined;
}

export interface SavedBuild {
    id: string;
    name: string;
    timestamp: number;
    equipped: Build;
    class: ClassName;
    spec: SpecName;
    race?: RaceName;
    gender?: Gender;
    realm?: RealmType;
    mode?: GameMode;
    activeBuffs?: string[];
    talentStats?: ItemStats;
    customWeights?: Record<string, StatWeights>;
    charName?: string;
    talentPoints?: Record<string, number>;
}

export interface TalentDef {
    id: string; 
    name: string;
    icon: string;
    row: number;
    col: number;
    maxRank: number;
    description: (rank: number) => string;
    prereq?: string; 
    stats?: (rank: number) => ItemStats;
}

export interface TalentTree {
    name: string;
    icon: string;
    background: string;
    color?: string; 
    talents: TalentDef[];
}

export interface Reagent {
    id: string;
    name: string;
    icon: string;
    quality: 'common' | 'uncommon' | 'rare' | 'epic';
}

export interface Recipe {
    id: string;
    name: string;
    profession: string;
    category: ConsumableCategory;
    icon: string;
    yield: number;
    reagents: { item: Reagent, count: number }[];
}