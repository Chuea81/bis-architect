
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PlayerSanctum from './components/PlayerSanctum';
import DatabaseVault from './components/DatabaseVault';
import { ArchmageChat } from './components/ArchmageChat';
import { BetaGate } from './components/BetaGate';
import { Item, SpecName, RealmType, GameMode, Build, ClassName, ItemStats, StatWeights, Enchant, SavedBuild, RaceName, Gender, TalentTree } from './types';
import { normalizeSlot, normalizeItem } from './services/gearService';
import { compressBuild, decompressBuild } from './services/shareService';
import { CLASS_CONFIG, ITEM_DATABASE, CLASS_RACES } from './constants';
import { WARLOCK_TALENTS } from './data/talents';

const STORAGE_KEY = 'bis-architect-state-v1';
const BUILDS_KEY = 'bis-architect-builds-v1';

interface SavedState {
    equipped: Build;
    currentClass: ClassName;
    race: RaceName;
    gender: Gender;
    spec: SpecName;
    charName?: string;
    realm: RealmType;
    mode: GameMode;
    activeBuffs: string[];
    talentStats: ItemStats;
    selectedTalents: string[];
    talentPoints: Record<string, number>;
    customWeights: Record<string, StatWeights>;
}

const App: React.FC = () => {
    // --- State Initialization with Persistence ---
    const [equipped, setEquipped] = useState<Build>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved).equipped : {};
        } catch (e) { return {}; }
    });

    const [currentClass, setCurrentClass] = useState<ClassName>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved).currentClass : 'Warlock';
        } catch (e) { return 'Warlock'; }
    });

    const [race, setRace] = useState<RaceName>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            // Default to first race of the class if not found
            const savedClass = saved ? JSON.parse(saved).currentClass : 'Warlock';
            const defaultRace = CLASS_RACES[savedClass as ClassName]?.[0] || 'Human';
            return saved ? (JSON.parse(saved).race || defaultRace) : defaultRace;
        } catch (e) { return 'Human'; }
    });

    const [gender, setGender] = useState<Gender>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved).gender || 'Male') : 'Male';
        } catch (e) { return 'Male'; }
    });

    const [spec, setSpec] = useState<SpecName>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved).spec : 'SM Ruin';
        } catch (e) { return 'SM Ruin'; }
    });

    const [charName, setCharName] = useState<string>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved).charName || "") : "";
        } catch (e) { return ""; }
    });

    const [realm, setRealm] = useState<RealmType>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved).realm : 'Classic';
        } catch (e) { return 'Classic'; }
    });

    const [mode, setMode] = useState<GameMode>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved).mode : 'End Game';
        } catch (e) { return 'End Game'; }
    });

    const [activeBuffs, setActiveBuffs] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved).activeBuffs || []) : [];
        } catch (e) { return []; }
    });

    // Manual Stat Overrides
    const [manualTalentStats, setManualTalentStats] = useState<ItemStats>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved).talentStats || {}) : {};
        } catch (e) { return {}; }
    });

    const [selectedTalents, setSelectedTalents] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved).selectedTalents || []) : [];
        } catch (e) { return []; }
    });

    // New Talent Point State
    const [talentPoints, setTalentPoints] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved).talentPoints || {}) : {};
        } catch (e) { return {}; }
    });

    const [customWeights, setCustomWeights] = useState<Record<string, StatWeights>>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved).customWeights || {}) : {};
        } catch (e) { return {}; }
    });

    // Saved Builds State
    const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => {
        try {
            const saved = localStorage.getItem(BUILDS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    // Database State - initialized with NORMALIZED static constant
    const [itemDatabase, setItemDatabase] = useState<Item[]>(() => ITEM_DATABASE.map(normalizeItem));

    // Mobile Tab State
    const [activeMobileTab, setActiveMobileTab] = useState<'sanctum' | 'database'>('sanctum');

    // Theme State
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        try {
            const saved = localStorage.getItem('theme');
            return (saved === 'light') ? 'light' : 'dark';
        } catch { return 'dark'; }
    });

    // --- Derived Talent Stats ---
    // Combine Manual Stats + Tree Calculated Stats
    const combinedTalentStats = useMemo(() => {
        const stats: ItemStats = { ...manualTalentStats };
        
        let trees: TalentTree[] = [];
        if (currentClass === 'Warlock') trees = WARLOCK_TALENTS;
        // Add other class trees here later

        trees.forEach(tree => {
            tree.talents.forEach(talent => {
                const rank = talentPoints[talent.id];
                if (rank && rank > 0 && talent.stats) {
                    const bonusStats = talent.stats(rank);
                    Object.entries(bonusStats).forEach(([key, val]) => {
                        stats[key] = (stats[key] || 0) + (val as number);
                    });
                }
            });
        });

        return stats;
    }, [manualTalentStats, talentPoints, currentClass]);

    // --- Theme Effect ---
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // --- URL Load Effect ---
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const buildStr = queryParams.get('build');
        if (buildStr) {
            const loaded = decompressBuild(buildStr);
            if (loaded && loaded.e) {
                // Ensure equipped items are normalized
                const normEquipped: Build = {};
                Object.entries(loaded.e).forEach(([key, val]) => {
                    if (val) normEquipped[key] = normalizeItem(val as Item);
                });

                if (loaded.c) setCurrentClass(loaded.c);
                if (loaded.s) setSpec(loaded.s);
                if (loaded.r) setRealm(loaded.r);
                if (loaded.ra) setRace(loaded.ra);
                if (loaded.g) setGender(loaded.g);
                if (loaded.m) setMode(loaded.m);
                if (loaded.b) setActiveBuffs(loaded.b);
                if (loaded.t) setManualTalentStats(loaded.t);
                if (loaded.w) setCustomWeights(loaded.w);
                setEquipped(normEquipped);

                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, []);

    // --- Persistence Effects ---
    useEffect(() => {
        const state: SavedState = { 
            equipped, currentClass, race, gender, spec, charName, realm, mode, 
            activeBuffs, talentStats: manualTalentStats, selectedTalents, talentPoints, customWeights 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [equipped, currentClass, race, gender, spec, charName, realm, mode, activeBuffs, manualTalentStats, selectedTalents, talentPoints, customWeights]);

    useEffect(() => {
        localStorage.setItem(BUILDS_KEY, JSON.stringify(savedBuilds));
    }, [savedBuilds]);

    // --- Handlers ---

    const handleClassChange = (newClass: ClassName) => {
        setCurrentClass(newClass);
        // Reset spec to the first spec of the new class
        const defaultSpec = CLASS_CONFIG[newClass].specs[0];
        setSpec(defaultSpec);
        // Reset race to first available race for new class
        const defaultRace = CLASS_RACES[newClass][0];
        setRace(defaultRace);
        // Reset talents
        setSelectedTalents([]);
        setManualTalentStats({});
        setTalentPoints({});
    };

    const handleImportDatabase = useCallback((newItems: Item[]) => {
        // Items coming from DatabaseVault are already normalized via handleAIImport
        setItemDatabase(prev => {
            const existingNames = new Set(prev.map(i => i.name));
            const uniqueNewItems = newItems.filter(i => !existingNames.has(i.name));
            return [...prev, ...uniqueNewItems];
        });
    }, []);

    const handleResetDatabase = useCallback((wipe: boolean) => {
        if (wipe) {
            if (window.confirm("WARNING: You are about to wipe the ENTIRE database (0 items). This is useful before importing a full fresh database. Continue?")) {
                setItemDatabase([]);
            }
        } else {
             if (window.confirm("Reset database to the built-in default list? All custom imported items will be lost.")) {
                 setItemDatabase(ITEM_DATABASE.map(normalizeItem));
             }
        }
    }, []);

    const handleEquip = useCallback((item: Item, targetSlotId?: string) => {
        const normItem = normalizeItem(item);
        setEquipped(prev => {
            const newState = { ...prev };
            const itemClone = { ...normItem };
            
            if (targetSlotId) {
                newState[targetSlotId] = itemClone;
                return newState;
            }

            let slot = normalizeSlot(item.slot);

            if (slot === "Ring") {
                if (!newState["Ring_1"]) newState["Ring_1"] = itemClone;
                else if (newState["Ring_1"].name === item.name) delete newState["Ring_1"];
                else if (!newState["Ring_2"]) newState["Ring_2"] = itemClone;
                else if (newState["Ring_2"].name === item.name) delete newState["Ring_2"];
                else newState["Ring_1"] = itemClone; 
            } 
            else if (slot === "Trinket") {
                if (!newState["Trinket_1"]) newState["Trinket_1"] = itemClone;
                else if (newState["Trinket_1"].name === item.name) delete newState["Trinket_1"];
                else if (!newState["Trinket_2"]) newState["Trinket_2"] = itemClone;
                else if (newState["Trinket_2"].name === item.name) delete newState["Trinket_2"];
                else newState["Trinket_1"] = itemClone; 
            }
            else {
                if (newState[slot] && newState[slot]?.name === item.name) {
                    delete newState[slot];
                } else {
                    newState[slot] = itemClone;
                }
            }
            return newState;
        });
    }, []);

    const handleApplyEnchant = useCallback((slotId: string, enchant: Enchant) => {
        setEquipped(prev => {
            const item = prev[slotId];
            if (!item) return prev;
            const updatedItem = { ...item, enchant: enchant };
            return {
                ...prev,
                [slotId]: normalizeItem(updatedItem)
            };
        });
    }, []);

    const handleRemoveEnchant = useCallback((slotId: string) => {
        setEquipped(prev => {
            const item = prev[slotId];
            if (!item) return prev;
            const newItem = { ...item };
            delete newItem.enchant;
            return {
                ...prev,
                [slotId]: newItem
            };
        });
    }, []);

    const handleUnequip = useCallback((slotId: string) => {
        setEquipped(prev => {
            const newState = { ...prev };
            delete newState[slotId];
            return newState;
        });
    }, []);

    const handleWipe = useCallback(() => {
        if(window.confirm("Are you sure you want to uneqip all items?")) {
            setEquipped({});
        }
    }, []);

    const handleExport = useCallback(() => {
        const compressed = compressBuild(currentClass, spec, realm, mode, activeBuffs, manualTalentStats, customWeights, equipped, race, gender);
        const url = `${window.location.origin}${window.location.pathname}?build=${compressed}`;
        
        navigator.clipboard.writeText(url).then(() => {
            alert("Shareable link copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy link", err);
            prompt("Copy this link:", url);
        });
    }, [currentClass, spec, realm, mode, equipped, activeBuffs, manualTalentStats, customWeights, race, gender]);

    const handleToggleBuff = useCallback((buffName: string) => {
        setActiveBuffs(prev => {
            if (prev.includes(buffName)) return prev.filter(b => b !== buffName);
            return [...prev, buffName];
        });
    }, []);

    // --- Build Manager Handlers ---
    
    const handleSaveBuild = useCallback((name: string) => {
        if (!name.trim()) return;
        const newBuild: SavedBuild = {
            id: Date.now().toString(),
            name: name.trim(),
            timestamp: Date.now(),
            class: currentClass,
            race: race,
            gender: gender,
            spec: spec,
            charName: charName,
            equipped: equipped,
            activeBuffs: activeBuffs,
            talentStats: manualTalentStats,
            selectedTalents: selectedTalents,
            talentPoints: talentPoints,
            customWeights: customWeights,
            mode: mode,
            realm: realm
        };
        setSavedBuilds(prev => [newBuild, ...prev]);
    }, [currentClass, race, gender, spec, charName, equipped, activeBuffs, manualTalentStats, selectedTalents, talentPoints, customWeights, mode, realm]);

    const handleLoadBuild = useCallback((build: SavedBuild) => {
        const normEquipped: Build = {};
        if (build.equipped) {
            Object.entries(build.equipped).forEach(([key, val]) => {
                if (val) normEquipped[key] = normalizeItem(val as Item);
            });
        }
        setCurrentClass(build.class);
        setSpec(build.spec);
        if (build.race) setRace(build.race); 
        if (build.gender) setGender(build.gender);
        setCharName(build.charName || ""); 
        setEquipped(normEquipped);
        setActiveBuffs(build.activeBuffs || []);
        setManualTalentStats(build.talentStats || {});
        setSelectedTalents(build.selectedTalents || []);
        setTalentPoints(build.talentPoints || {});
        setCustomWeights(build.customWeights || {});
        setMode(build.mode || 'End Game');
        setRealm(build.realm || 'Classic');
    }, []);

    const handleDeleteBuild = useCallback((id: string) => {
        if (window.confirm("Permanently destroy this blueprint?")) {
            setSavedBuilds(prev => prev.filter(b => b.id !== id));
        }
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return (
        <BetaGate>
            <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden font-roboto text-sm bg-stone-200 dark:bg-[#0e0e10] text-stone-900 dark:text-[#e2e8f0] antialiased selection:bg-[#FFD700] selection:text-black transition-colors duration-300">
                
                {/* Theme Toggle (Absolute) */}
                <button 
                    onClick={toggleTheme} 
                    className="fixed top-4 right-4 lg:right-6 z-[60] w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#1a1a1d] border border-stone-300 dark:border-[#333] shadow-lg hover:scale-110 transition-transform text-xl text-stone-600 dark:text-[#e2e8f0]"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Left Column: Sanctum (Hidden on Mobile if not active) */}
                <div className={`${activeMobileTab === 'sanctum' ? 'flex' : 'hidden'} lg:flex flex-col h-full shrink-0 z-10 w-full lg:w-auto transition-colors duration-300`}>
                    <PlayerSanctum 
                        equipped={equipped} 
                        currentClass={currentClass}
                        setClass={handleClassChange}
                        currentSpec={spec}
                        currentRace={race}
                        setRace={setRace}
                        currentGender={gender}
                        setGender={setGender}
                        currentRealm={realm}
                        charName={charName}
                        setCharName={setCharName}
                        onUnequip={handleUnequip}
                        onEquip={handleEquip}
                        onWipe={handleWipe}
                        onExport={handleExport}
                        activeBuffs={activeBuffs}
                        onToggleBuff={handleToggleBuff}
                        talentStats={combinedTalentStats} // Passing derived stats
                        setTalentStats={setManualTalentStats} // Passing setter for overrides
                        selectedTalents={selectedTalents}
                        setSelectedTalents={setSelectedTalents}
                        customWeights={customWeights}
                        setCustomWeights={setCustomWeights}
                        talentPoints={talentPoints}
                        setTalentPoints={setTalentPoints}
                        onApplyEnchant={handleApplyEnchant}
                        onRemoveEnchant={handleRemoveEnchant}
                        savedBuilds={savedBuilds}
                        onSaveBuild={handleSaveBuild}
                        onLoadBuild={handleLoadBuild}
                        onDeleteBuild={handleDeleteBuild}
                    />
                </div>

                {/* Right Column: Database (Hidden on Mobile if not active) */}
                <div className={`${activeMobileTab === 'database' ? 'flex' : 'hidden'} lg:flex flex-col flex-grow h-full overflow-hidden transition-colors duration-300`}>
                    <DatabaseVault 
                        currentSpec={spec} 
                        setSpec={setSpec}
                        currentClass={currentClass}
                        currentRealm={realm}
                        setRealm={setRealm}
                        currentMode={mode}
                        setMode={setMode}
                        equipped={equipped}
                        onEquip={handleEquip}
                        items={itemDatabase}
                        onImportDatabase={handleImportDatabase}
                        onResetDatabase={handleResetDatabase}
                        customWeights={customWeights[spec]}
                    />
                </div>

                {/* Floating Chat Bot */}
                <ArchmageChat 
                    equipped={equipped}
                    currentClass={currentClass}
                    spec={spec}
                    activeBuffs={activeBuffs}
                    talentStats={combinedTalentStats}
                />

                {/* Mobile Bottom Navigation Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-stone-100 dark:bg-[#0e0e10] border-t border-stone-300 dark:border-[#333] flex items-center justify-around z-50 pb-safe transition-colors duration-300">
                    <button 
                        onClick={() => setActiveMobileTab('sanctum')}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === 'sanctum' ? 'text-[#b45309] bg-stone-200 dark:bg-[#1a1a1d]' : 'text-stone-500 dark:text-[#666]'}`}
                    >
                        <span className="text-xl">🛡️</span>
                        <span className="text-[9px] font-cinzel font-bold tracking-widest mt-1">PAPERDOLL</span>
                    </button>
                    <button 
                        onClick={() => setActiveMobileTab('database')}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMobileTab === 'database' ? 'text-[#b45309] bg-stone-200 dark:bg-[#1a1a1d]' : 'text-stone-500 dark:text-[#666]'}`}
                    >
                        <span className="text-xl">📚</span>
                        <span className="text-[9px] font-cinzel font-bold tracking-widest mt-1">DATABASE</span>
                    </button>
                </div>
            </div>
        </BetaGate>
    );
};

export default App;
