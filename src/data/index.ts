// Import all specific class data
import { warriorData } from './classes/warrior';
import { paladinData } from './classes/paladin';
import { hunterData } from './classes/hunter';
import { rogueData } from './classes/rogue';
import { priestData } from './classes/priest';
import { shamanData } from './classes/shaman';
import { mageData } from './classes/mage';
import { warlockData } from './classes/warlock';
import { druidData } from './classes/druid';

// Export them as a single mapped object
// We use lowercase keys to match the standard URL/prop format
export const talentData = {
  'warrior': warriorData,
  'paladin': paladinData,
  'hunter': hunterData,
  'rogue': rogueData,
  'priest': priestData,
  'shaman': shamanData,
  'mage': mageData,
  'warlock': warlockData,
  'druid': druidData
} as const;

// Helper type for safely accessing the data
export type ClassKey = keyof typeof talentData;