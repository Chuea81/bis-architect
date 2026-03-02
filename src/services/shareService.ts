
import LZString from 'lz-string';
import { Build, ClassName, SpecName, ItemStats, StatWeights, RealmType, GameMode, RaceName, Gender, Item } from '../types';

export interface ShareableBuild {
    c: ClassName;       // class
    s: SpecName;        // spec
    r: RealmType;       // realm
    m: GameMode;        // mode
    b: string[];        // buffs (activeBuffs)
    t: ItemStats;       // talents (talentStats) - legacy summary
    tp?: Record<string, number>; // talentPoints - explicit tree state
    w: Record<string, StatWeights>; // weights (customWeights)
    e: SimpleEquipped;  // equipped
    ra?: RaceName;      // race
    g?: Gender;         // gender
}

// Minimal object to save space and CPU time
type SimpleEquipped = Record<string, Partial<Item>>; 

export const compressBuild = (
    currentClass: ClassName,
    spec: SpecName,
    realm: RealmType,
    mode: GameMode,
    activeBuffs: string[],
    talentStats: ItemStats,
    customWeights: Record<string, StatWeights>,
    equipped: Build,
    race?: RaceName,
    gender?: Gender,
    talentPoints?: Record<string, number>
): string => {
    
    // 1. Minify the Equipped Gear (Strip heavy fields like description/source)
    const minimalEquipped: SimpleEquipped = {};
    
    Object.entries(equipped).forEach(([slot, item]) => {
        if (!item) return;
        minimalEquipped[slot] = {
            id: item.id,
            name: item.name,
            stats: item.stats, // Needed for custom items
            quality: item.quality,
            icon: item.icon, // Needed for UI
            enchant: item.enchant // Crucial
        };
    });

    const payload: ShareableBuild = {
        c: currentClass,
        s: spec,
        r: realm,
        m: mode,
        b: activeBuffs,
        t: talentStats,
        tp: talentPoints, // NEW: Save the actual tree configuration
        w: customWeights,
        e: minimalEquipped, 
        ra: race,
        g: gender
    };
    
    return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
};

export const decompressBuild = (encoded: string): Partial<ShareableBuild> | null => {
    try {
        const json = LZString.decompressFromEncodedURIComponent(encoded);
        if (!json) return null;
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to decompress build", e);
        return null;
    }
};
