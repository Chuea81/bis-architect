
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { Item } from '../types';
import { hydrateItem } from '../utils/itemHydrator';

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// --- INITIALIZATION ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- AUTH HELPERS ---
const googleProvider = new GoogleAuthProvider();

export const signInAdmin = () => signInWithPopup(auth, googleProvider);
export const signOutAdmin = () => firebaseSignOut(auth);

// --- FALLBACK ITEMS ---
const FALLBACK_ITEMS: Item[] = [
    {
        id: 83563,
        name: "Pearl of the Tides",
        slot: "Trinket",
        quality: 2,
        icon: "inv_misc_gem_pearl_02",
        stats: { mp5: 4 },
        source: "Blackfathom Deeps",
        effects: ["Restores 4 mana per 5 sec."],
        realm: "Turtle"
    },
    {
        id: 60201,
        name: "Dark Advisor's Pendant",
        slot: "Neck",
        quality: 3,
        icon: "inv_jewelry_necklace_19",
        stats: { sp: 20, int: 7 },
        source: "Scholomance",
        realm: "Turtle"
    },
    {
        id: 16808,
        name: "Felheart Horns",
        slot: "Head",
        quality: 4,
        icon: "inv_helmet_05",
        stats: { stam: 23, int: 20, spirit: 10, spShadow: 23 },
        source: "Garr",
        zone: "Molten Core",
        realm: "Classic",
        classes: ["Warlock"],
        setName: "Felheart Raiment"
    },
    {
        id: 16813,
        name: "Felheart Shoulder Pads",
        slot: "Shoulder",
        quality: 4,
        icon: "inv_shoulder_23",
        stats: { stam: 22, int: 20, spirit: 9, spShadow: 20 },
        source: "Sulfuron Harbinger", 
        zone: "Molten Core",
        realm: "Classic",
        classes: ["Warlock"],
        setName: "Felheart Raiment"
    }
];

// --- HELPER: Local Fallback ---
const getLocalItems = (realm: string, slot: string, queryText: string = ""): Item[] => {
    const hydratedFallback = FALLBACK_ITEMS.map(i => hydrateItem(i));
    return hydratedFallback.filter(item => {
        if (realm === "Classic" && item.realm === "Turtle") return false;
        if (slot !== "All" && item.slot !== slot && mapSlotToDb(slot) !== item.slot) return false;
        if (queryText) {
            const lowerQ = queryText.toLowerCase();
            return item.name.toLowerCase().includes(lowerQ) || String(item.id) === queryText;
        }
        return true;
    });
};

// --- HELPER: Slot Mapping ---
export const mapSlotToDb = (uiSlot: string): number | string => {
    // Map UI slot names to Firestore numeric slot IDs
    const SLOT_ID_MAP: Record<string, number> = {
        "Head": 1, "Neck": 2, "Shoulder": 3, "Back": 16,
        "Chest": 5, "Waist": 6, "Legs": 7, "Feet": 8,
        "Wrist": 9, "Hands": 10, "Ring": 11, "Trinket": 12,
        "Main Hand": 21, "MainHand": 21, "Off Hand": 22, "OffHand": 22,
        "Two-Hand": 17, "Ranged": 15, "Relic": 28,
        "One-Hand": 13, "Shield": 14, "Held In Off-hand": 23,
    };
    return SLOT_ID_MAP[uiSlot] ?? uiSlot;
};

// --- HELPER: Slot Groups ---
// These use NUMERIC slot IDs matching the actual Firestore 'slot' field values.
// WoW inventory slot IDs: 1=Head, 2=Neck, 3=Shoulder, 4=Shirt, 5=Chest/Robe,
// 6=Waist, 7=Legs, 8=Feet, 9=Wrist, 10=Hands, 11=Finger, 12=Trinket,
// 13=One-Hand, 14=Shield, 15=Ranged, 16=Back, 17=Two-Hand, 20=Chest(Robe),
// 21=Main Hand, 22=Off Hand, 23=Held In Off-hand, 24=Projectile,
// 25=Thrown, 26=Wand, 28=Relic
export const SLOT_GROUPS: Record<string, number[]> = {
    "Head": [1],
    "Neck": [2],
    "Shoulder": [3],
    "Back": [16],
    "Chest": [5, 20],           // 5=Chest, 20=Robe
    "Wrist": [9],
    "Hands": [10],
    "Waist": [6],
    "Legs": [7],
    "Feet": [8],
    "Ring": [11],
    "Trinket": [12],
    "Main Hand": [21, 13],      // 21=Main Hand, 13=One-Hand (can go in MH)
    "Off Hand": [22, 14, 23],   // 22=Off Hand, 14=Shield, 23=Held In Off-hand
    "Two-Hand": [17],           // 17=Two-Hand (Staff/Polearm share this ID)
    "Ranged": [15, 25, 26],    // 15=Ranged(Bow/Gun/Crossbow), 25=Thrown, 26=Wand
    "Relic": [28],              // 28=Relic (Idol/Libram/Totem)
    "Misc": [0, 4]             // 0=Non-equippable, 4=Shirt
};

// --- HELPER: Source Mapping ---
// Removed generic words to prevent false positives.
const ZONE_MAPPING: Record<string, string[]> = {
    'MC': [
        'Molten Core', 'Ragnaros', 'Lucifron', 'Magmadar', 'Gehennas', 'Garr',
        'Shazzrah', 'Baron Geddon', 'Sulfuron', 'Golemagg', 'Majordomo', 'Executus',
        // MC trash mobs (items have droppedBy with these names)
        'Firesworn', 'Molten Giant', 'Molten Destroyer', 'Lava Surger', 'Ancient Core Hound',
        'Firelord', 'Firewalker', 'Flameguard', 'Flamewaker', 'Lava Annihilator',
        'Lava Elemental', 'Lava Reaver', 'Core Hound', 'Core Rager',
        'Onyxia', "Onyxia's Lair"
    ],
    'BWL': [
        'Blackwing Lair', 'Nefarian', 'Razorgore', 'Vaelastrasz', 'Broodlord',
        'Firemaw', 'Ebonroc', 'Flamegor', 'Chromaggus',
        // BWL trash mobs
        'Blackwing Technician', 'Blackwing Spellbinder', 'Blackwing Warlock',
        'Blackwing Mage', 'Death Talon', 'Wyrmguard', 'Dragonkin',
        'Corrupted Red Whelp', 'Corrupted Blue Whelp', 'Corrupted Green Whelp',
        'Blackwing Legionnaire', 'Blackwing Taskmaster'
    ],
    'ZG': [
        "Zul'Gurub", 'Hakkar', 'Jeklik', 'Venoxis', "Mar'li", 'Thekal', 'Arlokk',
        'Mandokir', "Jin'do", 'Gahz\'ranka', 'Edge of Madness', 'Gri\'lek', 'Renataki', 'Hazza\'rah', 'Wushool',
        // ZG trash
        'Gurubashi', 'Hakkari', 'Zulian', 'Razzashi', 'Atal\'ai', 'Blooddrinker', 'Witch Doctor',
        'Zandalar', 'Bloodvine'
    ],
    'AQ20': [
        "Ruins of Ahn'Qiraj", 'AQ20', 'Kurinnaxx', 'Rajaxx', 'Moam', 'Buru', 'Ayamiss', 'Ossirian',
        'Anubisath', 'Qiraji', 'Obsidian'
    ],
    'AQ40': [
        "Ahn'Qiraj", 'AQ40', "Temple of Ahn'Qiraj", "C'Thun", 'Skeram', 'Sartura',
        'Fankriss', 'Huhuran', 'Twin Emperors', 'Vek\'lor', 'Vek\'nilash', 'Ouro', 'Viscidus',
        // AQ40 trash
        'Anubisath Sentinel', 'Anubisath Defender', 'Vekniss', 'Qiraji Mindslayer', 'Qiraji Brainwasher'
    ],
    'Naxx': [
        'Naxxramas', "Kel'Thuzad", "Anub'Rekhan", "Faerlina", "Maexxna",
        "Noth", "Heigan", "Loatheb", "Razuvious", "Gothik", "Four Horsemen", "Patchwerk",
        "Grobbulus", "Gluth", "Thaddius", "Sapphiron",
        // Naxx trash
        'Necro Knight', 'Deathknight', 'Plague Beast', 'Stoneskin Gargoyle',
        'Spectral', 'Living Monstrosity', 'Surgical Assistant', 'Stitched Giant'
    ],
    'Emerald Sanctum': ['Emerald Sanctum'],
    'Lower Karazhan': ['Lower Karazhan', 'Karazhan Crypts'],
    'Dungeons': [
        'Blackrock Depths', 'Stratholme', 'Scholomance', 'Dire Maul', 'Blackrock Spire', 'BRD', 'UBRS', 'LBRS', 'Scholo', 'Strat',
        'Blackfathom Deeps', 'Wailing Caverns', 'Shadowfang Keep', 'Razorfen Kraul', 'Razorfen Downs', 'Gnomeregan', 'Scarlet Monastery', 'Uldaman', "Zul'Farrak", 'Maraudon', 'Sunken Temple',
        'Jed Runewatcher', 'General Drakkisath', 'Baron Rivendare', 'Darkmaster Gandling', 'King Gordok',
        'Rammstein', 'Postmaster', 'Willey Hopebreaker', 'Cannon Master', 'Magistrate', 'Balnazzar', 'Rattlegore',
        'Emperor Dagran', 'Princess Moira', 'Lord Incendius', 'Golem Lord', 'Pyromancer', 'Ambassador Flamelash',
        'Immol\'thar', 'Prince Tortheldrin', 'Tendris', 'Alzzin', 'Guard Mol\'dar', 'Stomper Kreeg',
        'Warchief Rend', 'Overlord Wyrmthalak', 'Halycon', 'Gizrul', 'Pyroguard', 'Quartermaster Zigris',
        'Drakkisath', 'The Beast'
    ],
    'PvP / World': ['PvP', 'Rank', 'Reputation', 'Crafted', 'Quest', 'World Drop', 'BoE',
        'Alterac Valley', 'Warsong Gulch', 'Arathi Basin',
        'Kazzak', 'Azuregos', 'Green Dragon', 'Emeriss', 'Lethon', 'Ysondre', 'Taerar',
        'Blacksmithing', 'Leatherworking', 'Tailoring', 'Engineering', 'Enchanting', 'Alchemy',
        'Thorium Brotherhood', 'Argent Dawn', 'Cenarion Circle', 'Hydraxian', 'Timbermaw', 'Bloodsail'
    ]
};

// Explicit Mapping for Set Names to Filter IDs
const TIER_SET_MAPPING: Record<string, string[]> = {
    'MC': ['Felheart', 'Giantstalker', 'Earthfury', 'Cenarion', 'Arcanist', 'Lawbringer', 'Nightslayer', 'Prophecy', 'Battlegear of Might'],
    'BWL': ['Nemesis', 'Dragonstalker', 'Ten Storms', 'Stormrage', 'Netherwind', 'Judgement', 'Bloodfang', 'Transcendence', 'Battlegear of Wrath'],
    'ZG': ['Zandalar', 'Hakkari', 'Primal Batskin', 'Bloodvine', 'Seafury', 'Haruspex', 'Freethinker', 'Confessor', 'Madcap', 'Augur', 'Illusionist', 'Demoniac', 'Vindicator'],
    'AQ20': [],
    'AQ40': ['Doomcaller', 'Genesis', 'Enigma', 'Avenger', 'Deathdealer', 'Oracle', 'Conqueror', 'Stormcaller', 'Striker'],
    'Naxx': ['Plagueheart', 'Cryptstalker', 'Earthshatter', 'Dreamwalker', 'Frostfire', 'Redemption', 'Bonescythe', 'Faith', 'Dreadnaught']
};

const isSourceMatch = (item: Item, selectedSources: string[]): boolean => {
    if (selectedSources.includes('All') || selectedSources.length === 0) return true;

    // If ALL non-turtle sources selected (8+), treat as "include all"
    if (selectedSources.length >= 8) return true;

    // 1. Check Zone property (Exact or Partial Match)
    if (item.zone) {
        for (const catId of selectedSources) {
            // Check main mappings
            if (ZONE_MAPPING[catId]?.some(k => item.zone?.includes(k))) return true;
            // Fallback: direct zone name match for all raid tiers
            if (catId === 'MC' && item.zone.includes('Molten Core')) return true;
            if (catId === 'BWL' && item.zone.includes('Blackwing Lair')) return true;
            if (catId === 'ZG' && item.zone.includes("Zul'Gurub")) return true;
            if (catId === 'AQ20' && item.zone.includes("Ruins of Ahn'Qiraj")) return true;
            if (catId === 'AQ40' && (item.zone.includes("Ahn'Qiraj") || item.zone.includes("Temple of Ahn"))) return true;
            if (catId === 'Naxx' && item.zone.includes('Naxxramas')) return true;
        }
    }

    // 2. Check Set Name (Strict)
    if (item.setName) {
        for (const catId of selectedSources) {
            const allowedSets = TIER_SET_MAPPING[catId];
            if (allowedSets && allowedSets.some(s => item.setName?.includes(s))) return true;
        }
    }

    // 3. Check Source / DroppedBy Keywords (Strict)
    // IMPORTANT: WE DO NOT SEARCH ITEM.NAME HERE TO PREVENT FALSE POSITIVES
    const textToCheck = [item.source, ...(item.droppedBy || [])].filter(Boolean).join(" ").toLowerCase();

    return selectedSources.some(catId => {
        const keywords = ZONE_MAPPING[catId];
        if (!keywords) return false;
        return keywords.some(k => textToCheck.includes(k.toLowerCase()));
    });
};

export const fetchItems = async (realm: string, slot: string, searchQuery?: string, sources: string[] = [], limitVal: number = 2000): Promise<Item[]> => {
    const localMatches = getLocalItems(realm, slot, searchQuery);
    if (!db) return localMatches;

    try {
        const itemsRef = collection(db, "wowitems");
        const rawItems: Item[] = [...localMatches];

        // --- FIRESTORE QUERY ---
        if (searchQuery && searchQuery.length >= 3) {
            // Numeric ID Check
            if (/^\d+$/.test(searchQuery)) {
                try {
                    const docRef = doc(db, "wowitems", searchQuery);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) rawItems.push(hydrateItem({ id: docSnap.id, ...docSnap.data() }));
                } catch (e) { console.warn("[Firestore] ID lookup failed:", e); }
            }

            // Search by name (case-sensitive prefix match)
            const term = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1);
            const q1 = query(itemsRef, where("name", ">=", term), where("name", "<=", term + "\uf8ff"), limit(50));
            const snapshot1 = await getDocs(q1);
            snapshot1.forEach((d) => {
                if (!rawItems.some(i => String(i.id) === String(d.id))) rawItems.push(hydrateItem({ id: d.id, ...d.data() }));
            });

            // Also search by name_lower field for better case-insensitive matching
            const lowerTerm = searchQuery.toLowerCase();
            const q2 = query(itemsRef, where("name_lower", ">=", lowerTerm), where("name_lower", "<=", lowerTerm + "\uf8ff"), limit(50));
            try {
                const snapshot2 = await getDocs(q2);
                snapshot2.forEach((d) => {
                    if (!rawItems.some(i => String(i.id) === String(d.id))) rawItems.push(hydrateItem({ id: d.id, ...d.data() }));
                });
            } catch (e) {
                // name_lower field might not exist on all docs, ignore errors
            }

        } else {
            const constraints = [];
            
            if (slot !== "All") {
                if (SLOT_GROUPS[slot]) constraints.push(where("slot", "in", SLOT_GROUPS[slot]));
                else constraints.push(where("slot", "==", mapSlotToDb(slot)));
            }
            constraints.push(limit(limitVal)); 
            
            const q = query(itemsRef, ...constraints);
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                if (!rawItems.some(i => String(i.id) === String(doc.id))) rawItems.push(hydrateItem({ id: doc.id, ...doc.data() }));
            });
        }

        // --- CLIENT SIDE FILTERING ---
        return rawItems.filter(item => {
            // Realm Filter
            if (realm === "Classic") {
                const isTurtle = item.source === "Turtle WoW" || (item.source && item.source.includes("Turtle")) || (item.realm === "Turtle");
                if (isTurtle) return false;
            }

            // Source Filter
            return isSourceMatch(item, sources);
        });

    } catch (error) {
        console.error("[Firestore] Error:", error);
        return getLocalItems(realm, slot, searchQuery);
    }
};

export const fetchGlobalSlotCounts = async (): Promise<Record<string, number>> => {
    if (!db) return {};
    const counts: Record<string, number> = {};
    
    // Map UI slot names to their numeric Firestore IDs for counting
    const UI_SLOT_TO_IDS: Record<string, number[]> = {
        "Head": [1], "Neck": [2], "Shoulder": [3], "Back": [16],
        "Chest": [5, 20], "Wrist": [9], "Hands": [10], "Waist": [6],
        "Legs": [7], "Feet": [8], "Ring": [11], "Trinket": [12],
        "Main Hand": [21, 13], "Off Hand": [22, 14, 23],
        "Two-Hand": [17], "Ranged": [15, 25, 26], "Relic": [28],
    };
    
    try {
        const itemsRef = collection(db, "wowitems");
        const promises = Object.entries(UI_SLOT_TO_IDS).map(async ([uiSlot, ids]) => {
            try {
                // Use "in" query to count all numeric IDs for this UI slot group
                const q = query(itemsRef, where("slot", "in", ids));
                const snapshot = await getCountFromServer(q);
                return { slot: uiSlot, count: snapshot.data().count };
            } catch (e) { return { slot: uiSlot, count: 0 }; }
        });

        const results = await Promise.all(promises);
        results.forEach(r => { counts[r.slot] = r.count; });
    } catch (error) { console.error("[Firestore] Global Count Error:", error); }
    return counts;
};
