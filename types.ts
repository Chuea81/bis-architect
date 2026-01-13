
export interface ItemStats {
  [key: string]: number;
}

export type ClassName = 'Druid' | 'Hunter' | 'Mage' | 'Paladin' | 'Priest' | 'Rogue' | 'Shaman' | 'Warlock' | 'Warrior';

export type RaceName = 
  | 'Human' | 'Dwarf' | 'Night Elf' | 'Gnome'
  | 'Orc' | 'Undead' | 'Tauren' | 'Troll'
  | 'High Elf' | 'Goblin';

export type Gender = 'Male' | 'Female';

export type SpecName = 
  | 'Affliction' | 'SM Ruin' | 'Demon' | 'Destruction'
  | 'Arms' | 'Fury' | 'Protection'
  | 'Assassination' | 'Combat' | 'Subtlety'
  | 'Arcane' | 'Fire' | 'Frost'
  | 'Holy' | 'Discipline' | 'Shadow' | 'Smite'
  | 'Beast Mastery' | 'Marksmanship' | 'Survival'
  | 'Balance' | 'Feral' | 'Restoration'
  | 'Holy (Paladin)' | 'Protection (Paladin)' | 'Retribution'
  | 'Elemental' | 'Enhancement' | 'Restoration (Shaman)';

export interface SetBonus {
  threshold: number;
  text: string;
}

export interface ItemSet {
  name: string;
  items: string[];
  bonuses: SetBonus[];
}

export interface Enchant {
  id: number;
  name: string;
  text: string;
  stats: ItemStats;
  slots: string[];
  icon: string;
  proc?: string;
}

export interface Item {
  slot: string;
  name: string;
  source: string;
  icon: string;
  rarity: string;
  realm?: string;
  tags?: string[];
  spec?: string; 
  classes?: ClassName[]; 
  bis?: boolean;
  id?: number;
  stats?: ItemStats;
  reqLevel?: number;
  setName?: string;
  proc?: string;
  use?: string;
  enchant?: Enchant;
}

export type ConsumableCategory = 'Flask' | 'Elixir' | 'Food' | 'World Buff' | 'Alcohol' | 'Other';

export interface Consumable {
  name: string;
  icon: string;
  category: ConsumableCategory;
  stats: ItemStats;
  description: string;
  id?: number;
}

export interface Talent {
  id: string;
  name: string;
  icon: string;
  description: string;
  stats: ItemStats;
  spec?: SpecName[];
}

export interface TalentDef {
  id: number;
  name: string;
  icon: string;
  row: number; // 0-6
  col: number; // 0-3
  maxRank: number;
  reqPoints?: number; 
  prereq?: number; // ID of required talent (Must be in same tree)
  arrows?: { dir: 'down' | 'right' | 'right-down' | 'left-down' }[]; // Visual arrows
  description: (rank: number) => string;
  stats?: (rank: number) => ItemStats;
}

export interface TalentTree {
  name: string;
  background: string;
  icon: string;
  color: string;
  talents: TalentDef[];
}

export interface StatWeights {
  sp?: number;
  hit?: number;
  crit?: number;
  int?: number;
  stam?: number;
  spirit?: number;
  str?: number;
  agi?: number;
  ap?: number;
  armor?: number;
  defense?: number;
  healing?: number;
  mp5?: number;
}

export type RealmType = 'Classic' | 'Turtle';
export type GameMode = 'End Game' | 'Leveling' | 'PvP Twink';

export interface Build {
  [slot: string]: Item | undefined;
}

export interface SavedBuild {
  id: string;
  name: string;
  timestamp: number;
  class: ClassName;
  race?: RaceName;
  gender?: Gender;
  spec: SpecName;
  charName?: string;
  equipped: Build;
  activeBuffs: string[];
  talentStats: ItemStats;
  selectedTalents: string[];
  talentPoints?: Record<string, number>;
  customWeights: Record<string, StatWeights>;
  mode: GameMode;
  realm: RealmType;
}

export interface AggregatedStats {
  str: number;
  agi: number;
  stam: number;
  int: number;
  spirit: number;
  health: number; 
  mana: number; 
  ap: number;
  armor: number;
  defense: number;
  sp: number;
  healing: number;
  spellPen: number;
  spArcane: number;
  spFire: number;
  spFrost: number;
  spHoly: number;
  spNature: number;
  spShadow: number;
  hit: number;
  crit: number;
  haste: number;
  spellVamp: number;
  mp5: number;
  hp5: number;
  regenCasting: number; 
  resFire: number;
  resFrost: number;
  resNature: number;
  resShadow: number;
  resArcane: number;
  statMultiplier?: number;
  damageMultiplier?: number;
  intMod?: number;
  spiritMod?: number; 
  healthMod?: number; 
  staminaMod?: number;
  strMod?: number;
  agiMod?: number;
}
