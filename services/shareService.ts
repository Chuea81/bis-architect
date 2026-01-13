
import LZString from 'lz-string';
import { Build, ClassName, SpecName, ItemStats, StatWeights, RealmType, GameMode, RaceName, Gender } from '../types';

export interface ShareableBuild {
    c: ClassName;       // class
    s: SpecName;        // spec
    r: RealmType;       // realm
    m: GameMode;        // mode
    b: string[];        // buffs (activeBuffs)
    t: ItemStats;       // talents (talentStats)
    w: Record<string, StatWeights>; // weights (customWeights)
    e: SimpleEquipped;  // equipped
    ra?: RaceName;      // race
    g?: Gender;         // gender
}

// Minimal representation of equipped items
// Key = Slot, Value = Item Name (assuming Name is unique enough for DB lookup) or full minimal obj
// To allow sharing custom imported items, we might need to store stats if not found in DB.
// For now, let's store the full Item object but compressed, or just the necessary parts. 
// Storing full Item allows sharing custom AI items.
type SimpleEquipped = Record<string, any>; 

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
    gender?: Gender
): string => {
    const payload: ShareableBuild = {
        c: currentClass,
        s: spec,
        r: realm,
        m: mode,
        b: activeBuffs,
        t: talentStats,
        w: customWeights,
        e: equipped, // LZString compresses JSON quite well, passing the full object ensures custom items work
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
