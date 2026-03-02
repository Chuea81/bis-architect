
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { usePlayerStore } from './store/usePlayerStore'; // Ensure this path matches where you put the file above
import { PlayerSanctum } from './components/PlayerSanctum';
import { DatabaseVault } from './components/DatabaseVault';
import { ArchmageChat } from './components/ArchmageChat';

import { ConfirmationModal } from './components/ConfirmationModal';
import { Item, ItemStats, StatWeights, SavedBuild } from './types';
import { decompressBuild, compressBuild } from './services/shareService';
import { showToast } from './components/Toast';

const WISHLIST_KEY = 'bis-architect-wishlist-v1';
const OVERRIDES_KEY = 'bis-architect-overrides-v1';

const App: React.FC = () => {
    // --- ZUSTAND STORE HOOKS ---
    const { 
        equipped, currentClass, spec, race, gender, realm, mode, charName,
        equipItem, unequipItem, setEquipped, setClass, setSpec, setRace,
        setGender, setRealm, setMode, setCharName, applyEnchant, removeEnchant, wipe
    } = usePlayerStore();

    // --- LOCAL UI STATE ---

    const [confirmModal, setConfirmModal] = useState<{ message: string, onConfirm: () => void } | null>(null);
    const [activeMobileTab, setActiveMobileTab] = useState<'sanctum' | 'database'>('sanctum');
    const [requestedSlot, setRequestedSlot] = useState<string | null>(null);
    const [urlBuildLoaded, setUrlBuildLoaded] = useState(false);
    
    // --- DATA STATE (Lists) ---
    const [itemOverrides, setItemOverrides] = useState<Record<string, Item>>(() => {
        try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}'); } catch { return {}; }
    });
    const [wishlist, setWishlist] = useState<Item[]>(() => {
        try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
    });
    const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(() => {
        try { return JSON.parse(localStorage.getItem('bis-architect-builds-v1') || '[]'); } catch { return []; }
    });

    // Helper State for Calculator
    const [activeBuffs, setActiveBuffs] = useState<string[]>([]);
    const [activeRaidBuffs, setActiveRaidBuffs] = useState<string[]>([]);
    const [activeRaidDebuffs, setActiveRaidDebuffs] = useState<string[]>([]);
    const [manualTalentStats, setManualTalentStats] = useState<ItemStats>({});
    const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
    const [talentPoints, setTalentPoints] = useState<Record<string, number>>({});
    const [customWeights, setCustomWeights] = useState<Record<string, StatWeights>>({});

    // --- EFFECTS ---
    useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }, [wishlist]);
    useEffect(() => { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(itemOverrides)); }, [itemOverrides]);
    useEffect(() => { localStorage.setItem('bis-architect-builds-v1', JSON.stringify(savedBuilds)); }, [savedBuilds]);

    // Global Esc Key to close modals/menus if possible (Basic implementation)
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setConfirmModal(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // --- LOAD BUILD FROM URL ---
    useEffect(() => {
        if (urlBuildLoaded) return;
        const params = new URLSearchParams(window.location.search);
        const buildStr = params.get('build');
        
        if (buildStr) {
            const data = decompressBuild(buildStr);
            if (data) {
                // Build loaded from URL
                if (data.c) setClass(data.c);
                if (data.s) setSpec(data.s);
                if (data.r) setRealm(data.r);
                if (data.m) setMode(data.m);
                if (data.ra) setRace(data.ra);
                if (data.g) setGender(data.g);
                if (data.b) setActiveBuffs(data.b);
                if (data.t) setManualTalentStats(data.t);
                if (data.w) setCustomWeights(data.w);
                if (data.tp) setTalentPoints(data.tp); // LOAD TALENTS
                if (data.e) {
                    setEquipped(data.e as any);
                }
                
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
        setUrlBuildLoaded(true);
    }, [urlBuildLoaded, setClass, setSpec, setRealm, setMode, setRace, setGender, setEquipped]);

    // --- MEMOS ---
    const customItemsList = useMemo(() => Object.values(itemOverrides), [itemOverrides]);
    const combinedTalentStats = useMemo(() => ({...manualTalentStats}), [manualTalentStats]);

    // --- HANDLERS ---
    const handleImportDatabase = useCallback((newItems: Item[]) => {
        setItemOverrides(prev => {
            const next = { ...prev };
            newItems.forEach(i => { next[i.id || i.name] = i; });
            return next;
        });
    }, []);

    const handleUpdateDatabase = useCallback((updatedItem: Item) => {
        setItemOverrides(prev => ({ ...prev, [updatedItem.id || updatedItem.name]: updatedItem }));
    }, []);

    // OLD JSON SAVE (Renamed to distinguish)
    const handleSaveCharacter = useCallback(() => {
        const state = {
            equipped, currentClass, race, gender, spec, charName, realm, mode,
            activeBuffs, activeRaidBuffs, activeRaidDebuffs,
            talentStats: manualTalentStats, selectedTalents, talentPoints, 
            customWeights, wishlist, version: "1.1"
        };
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${charName || "character"}_backup.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [equipped, currentClass, race, gender, spec, charName, realm, mode, activeBuffs, activeRaidBuffs, activeRaidDebuffs, manualTalentStats, selectedTalents, talentPoints, customWeights, wishlist]);

    const handleLoadCharacter = useCallback((data: any) => {
        if (!data) return;
        if (data.currentClass) setClass(data.currentClass);
        if (data.race) setRace(data.race);
        if (data.gender) setGender(data.gender);
        if (data.spec) setSpec(data.spec);
        if (data.charName) setCharName(data.charName);
        if (data.realm) setRealm(data.realm);
        if (data.mode) setMode(data.mode);
        if (data.equipped) setEquipped(data.equipped);
        
        if (data.activeBuffs) setActiveBuffs(data.activeBuffs);
        if (data.activeRaidBuffs) setActiveRaidBuffs(data.activeRaidBuffs);
        if (data.activeRaidDebuffs) setActiveRaidDebuffs(data.activeRaidDebuffs);
        if (data.talentStats) setManualTalentStats(data.talentStats);
        if (data.selectedTalents) setSelectedTalents(data.selectedTalents);
        if (data.talentPoints) setTalentPoints(data.talentPoints);
        if (data.customWeights) setCustomWeights(data.customWeights);
        if (data.wishlist) setWishlist(data.wishlist);
        showToast("Character restored.", 'success');
    }, [setClass, setRace, setGender, setSpec, setCharName, setRealm, setMode, setEquipped]);

    const handleSaveBuild = useCallback((name: string) => {
        setSavedBuilds(prev => [...prev, {
            id: Date.now().toString(), name, timestamp: Date.now(),
            equipped, class: currentClass, spec, race, gender,
            realm, mode, activeBuffs, talentStats: manualTalentStats,
            customWeights, charName, talentPoints
        }]);
    }, [equipped, currentClass, spec, race, gender, realm, mode, activeBuffs, manualTalentStats, customWeights, charName, talentPoints]);

    // NEW: Copy Gear List to Clipboard (Export function for Sanctum)
    const handleExportText = useCallback(() => {
        const lines = [`${charName || "Character"} - ${currentClass} (${spec})`];
        lines.push(`Realm: ${realm} | Race: ${race}`);
        lines.push("");
        lines.push("--- GEAR ---");
        Object.entries(equipped).forEach(([slot, item]) => {
            if (item) {
                let line = `${slot}: ${item.name}`;
                if (item.enchant) line += ` [Enchant: ${item.enchant.name}]`;
                lines.push(line);
            }
        });
        lines.push("");
        if (activeBuffs.length > 0) {
            lines.push("--- BUFFS ---");
            activeBuffs.forEach(b => lines.push(`- ${b}`));
        }
        
        const text = lines.join('\n');
        navigator.clipboard.writeText(text)
            .then(() => showToast("Gear list copied to clipboard!", 'success'))
            .catch(() => showToast("Clipboard access denied", 'error'));
    }, [charName, currentClass, spec, realm, race, equipped, activeBuffs]);

    const handleDeleteBuild = useCallback((id: string) => {
        setSavedBuilds(prev => prev.filter(b => b.id !== id));
    }, []);

    const handleToggleWishlist = useCallback((i: Item) => {
        setWishlist(prev => prev.some(x => x.name === i.name) ? prev.filter(x => x.name !== i.name) : [...prev, i]);
    }, []);

    const handleResetDatabase = useCallback(() => {
        setItemOverrides({});
        showToast("Custom items cleared.", 'success');
    }, []);

    const handleDownloadOverrides = useCallback(() => {
        const blob = new Blob([JSON.stringify(itemOverrides, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "item_overrides.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [itemOverrides]);

    // Quick search handler: switch to database tab and filter to the requested slot
    const handleQuickSearch = useCallback((slotId: string) => {
        setRequestedSlot(slotId);
        setActiveMobileTab('database');
    }, []);

    return (
        <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden font-roboto text-sm bg-slate-950 text-slate-300 dark selection:bg-cyan-900 selection:text-white">
            {/* --- LEFT PANEL: PLAYER SANCTUM --- */}
            <div className={`${activeMobileTab === 'sanctum' ? 'flex' : 'hidden'} lg:flex flex-col h-full w-full lg:w-auto border-r border-slate-800 z-40`}>
                <PlayerSanctum 
                    equipped={equipped} 
                    currentClass={currentClass} setClass={setClass}
                    currentSpec={spec} setSpec={setSpec}
                    currentRace={race} setRace={setRace}
                    currentGender={gender} setGender={setGender}
                    currentRealm={realm}
                    charName={charName} setCharName={setCharName}
                    onUnequip={unequipItem}
                    onEquip={equipItem}
                    onWipe={wipe}
                    onExport={handleExportText} 
                    onSetBuild={setEquipped}
                    activeBuffs={activeBuffs}
                    setActiveBuffs={setActiveBuffs}
                    onToggleBuff={(b) => setActiveBuffs(prev => prev.includes(b) ? prev.filter(x => x!==b) : [...prev, b])}
                    activeRaidBuffs={activeRaidBuffs} setActiveRaidBuffs={setActiveRaidBuffs}
                    activeRaidDebuffs={activeRaidDebuffs} setActiveRaidDebuffs={setActiveRaidDebuffs}
                    talentStats={combinedTalentStats} setTalentStats={setManualTalentStats}
                    selectedTalents={selectedTalents} setSelectedTalents={setSelectedTalents}
                    customWeights={customWeights} setCustomWeights={setCustomWeights}
                    talentPoints={talentPoints} setTalentPoints={setTalentPoints}
                    onApplyEnchant={applyEnchant} onRemoveEnchant={removeEnchant}
                    savedBuilds={savedBuilds}
                    onSaveBuild={handleSaveBuild}
                    onLoadBuild={(b) => {
                        setEquipped(b.equipped || {});
                        setClass(b.class);
                        setSpec(b.spec);
                        if (b.race) setRace(b.race);
                        if (b.gender) setGender(b.gender);
                        if (b.realm) setRealm(b.realm);
                        if (b.mode) setMode(b.mode);
                        if (b.activeBuffs) setActiveBuffs(b.activeBuffs);
                        if (b.talentStats) setManualTalentStats(b.talentStats);
                        if (b.customWeights) setCustomWeights(b.customWeights);
                        if (b.charName) setCharName(b.charName);
                        if (b.talentPoints) setTalentPoints(b.talentPoints);
                        showToast("Build loaded.", 'success');
                    }}
                    onDeleteBuild={handleDeleteBuild}
                    itemDatabase={customItemsList} 
                    wishlist={wishlist} onToggleWishlist={handleToggleWishlist}
                    onQuickSearch={handleQuickSearch}
                />
            </div>

            {/* --- RIGHT PANEL: DATABASE VAULT --- */}
            <div className={`${activeMobileTab === 'database' ? 'flex' : 'hidden'} lg:flex flex-col flex-grow h-full overflow-hidden bg-[#0a0a0c]`}>
                <DatabaseVault 
                    currentSpec={spec} setSpec={setSpec}
                    currentClass={currentClass}
                    currentRealm={realm} setRealm={setRealm}
                    currentMode={mode} setMode={setMode}
                    equipped={equipped}
                    onEquip={equipItem}
                    customItems={customItemsList} 
                    onImportDatabase={handleImportDatabase}
                    onUpdateDatabase={handleUpdateDatabase}
                    onResetDatabase={handleResetDatabase}
                    onSaveCharacter={handleSaveCharacter}
                    onLoadCharacter={handleLoadCharacter}
                    customWeights={customWeights}
                    wishlist={wishlist} onToggleWishlist={handleToggleWishlist}
                    onDownloadOverrides={handleDownloadOverrides}
                    activeBuffs={activeBuffs}
                    activeRaidBuffs={activeRaidBuffs}
                    talentStats={combinedTalentStats}
                    currentRace={race}
                    requestedSlot={requestedSlot}
                    onSlotConsumed={() => setRequestedSlot(null)}
                />
            </div>

            <ArchmageChat 
                equipped={equipped}
                currentClass={currentClass}
                spec={spec}
                activeBuffs={activeBuffs}
                talentStats={combinedTalentStats}
                race={race}
            />

            <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around z-50">
                <button onClick={() => setActiveMobileTab('sanctum')} className={`text-xl ${activeMobileTab === 'sanctum' ? 'text-cyan-400' : 'text-slate-500'}`}>🛡️</button>
                <button onClick={() => setActiveMobileTab('database')} className={`text-xl ${activeMobileTab === 'database' ? 'text-cyan-400' : 'text-slate-500'}`}>📚</button>
            </div>

            {confirmModal && (
                <ConfirmationModal 
                    message={confirmModal.message} 
                    onConfirm={() => { confirmModal.onConfirm(); setConfirmModal(null); }} 
                    onCancel={() => setConfirmModal(null)} 
                />
            )}
        </div>
    );
};

export default App;
