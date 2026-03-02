
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Item, Build, ClassName, SpecName, RaceName, Gender, RealmType, GameMode, Enchant } from '../types';
import { normalizeItem, normalizeSlot, canClassEquip } from '../services/gearService';
import { CLASS_CONFIG, CLASS_RACES } from '../constants';
import { showToast } from '../components/Toast';

interface PlayerState {
  // --- STATE ---
  equipped: Build;
  currentClass: ClassName;
  spec: SpecName;
  race: RaceName;
  gender: Gender;
  realm: RealmType;
  mode: GameMode;
  charName: string;

  // --- ACTIONS ---
  equipItem: (item: Item, slotId?: string) => void;
  unequipItem: (slot: string) => void;
  setEquipped: (build: Build) => void;
  setSpec: (spec: SpecName) => void;
  setClass: (newClass: ClassName) => void;
  setRace: (race: RaceName) => void;
  setGender: (gender: Gender) => void;
  setRealm: (realm: RealmType) => void;
  setMode: (mode: GameMode) => void;
  setCharName: (name: string) => void;
  applyEnchant: (slotId: string, enchant: Enchant) => void;
  removeEnchant: (slotId: string) => void;
  wipe: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Defaults
      equipped: {},
      currentClass: 'Warlock',
      spec: 'SM Ruin',
      race: 'Human',
      gender: 'Male',
      realm: 'Classic',
      mode: 'End Game',
      charName: '',

      // Actions
      equipItem: (item, slotId) => {
        const state = get();
        // 1. Class Check
        const check = canClassEquip(state.currentClass, item);
        if (!check.allowed) {
           showToast(check.reason || "Your class cannot equip this.", 'error');
           return;
        }

        // 2. Normalize & Slot Logic
        const norm = normalizeItem(item);
        let target = slotId || normalizeSlot(norm.slot);

        // Handle specific slot overrides
        if (["Two-Hand", "One-Hand", "MainHand"].includes(target)) { if (!slotId) target = "MainHand"; }
        if (target === "Main Hand") target = "MainHand";
        if (target === "Off Hand") target = "OffHand";

        set((state) => {
          const next = { ...state.equipped };
          const is2H = ["Two-Hand", "Staff", "Polearm"].includes(norm.slot);

          // Clear conflicts (e.g., equipping 2H removes OffHand)
          if (target === "MainHand" && is2H) delete next["OffHand"];
          if (target === "OffHand" && next["MainHand"] && ["Two-Hand", "Staff", "Polearm"].includes(next["MainHand"]?.slot || "")) {
             delete next["MainHand"];
          }
          
          // Ring/Trinket rotation logic
          if (target === "Ring") {
             if (!next["Ring_1"]) target = "Ring_1";
             else target = "Ring_2";
          }
          if (target === "Trinket") {
             if (!next["Trinket_1"]) target = "Trinket_1";
             else target = "Trinket_2";
          }

          next[target] = norm;
          return { equipped: next };
        });
      },

      unequipItem: (slot) => set((state) => {
        const next = { ...state.equipped };
        delete next[slot];
        return { equipped: next };
      }),

      setEquipped: (newBuild) => {
        const normBuild: Build = {};
        Object.entries(newBuild).forEach(([slot, item]) => { 
            if (item) normBuild[slot] = normalizeItem(item as Item); 
        });
        set({ equipped: normBuild });
      },

      setClass: (newClass) => set({ 
        currentClass: newClass,
        spec: CLASS_CONFIG[newClass]?.specs[0] || 'SM Ruin',
        race: CLASS_RACES[newClass]?.[0] || 'Human',
        equipped: {} // Optional: Wipe gear on class change to prevent errors
      }),

      setSpec: (spec) => set({ spec }),
      setRace: (race) => set({ race }),
      setGender: (gender) => set({ gender }),
      setRealm: (realm) => set({ realm }),
      setMode: (mode) => set({ mode }),
      setCharName: (charName) => set({ charName }),

      applyEnchant: (slotId, enchant) => set((state) => {
        const item = state.equipped[slotId];
        if (!item) return state;
        return { equipped: { ...state.equipped, [slotId]: { ...item, enchant } } };
      }),

      removeEnchant: (slotId) => set((state) => {
        const item = state.equipped[slotId];
        if (!item) return state;
        const { enchant, ...rest } = item;
        return { equipped: { ...state.equipped, [slotId]: rest as Item } };
      }),

      wipe: () => set({ equipped: {} }),
    }),
    {
      name: 'bis-architect-storage-v1', // Unique name for LocalStorage
    }
  )
);
