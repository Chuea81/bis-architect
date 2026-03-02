
import React, { useState, useMemo, useEffect } from 'react';
import { RECIPE_DATABASE } from '../constants';
import { getIconUrl } from '../services/gearService';
import { Reagent, Recipe } from '../types';
import { showToast } from './Toast';
import { ConfirmationModal } from './ConfirmationModal';

interface ProfessionsModalProps {
    onClose: () => void;
}

const CATEGORIES = ["Flask", "Elixir", "Potion", "Food", "Explosive"];

export const ProfessionsModal: React.FC<ProfessionsModalProps> = ({ onClose }) => {
    const [quantities, setQuantities] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem('bis-professions-plan');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });
    const [activeTab, setActiveTab] = useState<string>("Potion");

    useEffect(() => {
        localStorage.setItem('bis-professions-plan', JSON.stringify(quantities));
    }, [quantities]);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const updateQuantity = (recipeId: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[recipeId] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const copy = { ...prev };
                delete copy[recipeId];
                return copy;
            }
            return { ...prev, [recipeId]: next };
        });
    };

    const clearAll = () => {
        setShowClearConfirm(true);
    };

    // Aggregate Reagents based on quantities
    const shoppingList = useMemo(() => {
        const mats: Record<string, { reagent: Reagent, count: number }> = {};

        Object.entries(quantities).forEach(([recipeId, count]) => {
            const recipe = RECIPE_DATABASE.find(r => r.id === recipeId);
            if (!recipe) return;

            // Recipes might yield multiple items (e.g. 3x Grenades)
            // But usually we plan "I want 20 Grenades", so we need ceil(20 / 3) crafts.
            const craftsNeeded = Math.ceil((count as number) / recipe.yield);

            recipe.reagents.forEach(reagentStack => {
                // Ensure count is treated as number
                const qty = reagentStack.count;
                const totalNeeded = qty * craftsNeeded;
                const key = reagentStack.item.id;
                
                if (!mats[key]) {
                    mats[key] = { reagent: reagentStack.item, count: 0 };
                }
                mats[key].count += totalNeeded;
            });
        });

        // Convert to array and sort by name
        return Object.values(mats).sort((a, b) => a.reagent.name.localeCompare(b.reagent.name));
    }, [quantities]);

    // Group recipes for display
    const filteredRecipes = useMemo(() => {
        return RECIPE_DATABASE.filter(r => r.category === activeTab);
    }, [activeTab]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#a3a3a3] w-full max-w-5xl rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-[#e2e8f0] font-cinzel text-xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span>⚗️</span>
                            <span>PROFESSIONS & LOGISTICS</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">PLAN YOUR RAID CONSUMABLE LINEUP</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    
                    {/* LEFT: Planner */}
                    <div className="w-full lg:w-3/5 bg-[#0a0a0c] flex flex-col border-r border-[#222]">
                        
                        {/* Categories */}
                        <div className="flex border-b border-[#222] bg-[#111]">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`flex-1 py-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[#1a1a1d]
                                        ${activeTab === cat ? 'bg-[#1a1a1d] text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-[#666]'}
                                    `}
                                >
                                    {cat}s
                                </button>
                            ))}
                        </div>

                        {/* Items Grid */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 gap-3">
                            {filteredRecipes.map(recipe => {
                                const currentAmt = quantities[recipe.id] || 0;
                                return (
                                    <div key={recipe.id} className="flex items-center gap-4 bg-[#111] p-3 rounded border border-[#222] hover:border-[#444] transition-colors">
                                        <div className="relative w-12 h-12 shrink-0 rounded border border-[#333] overflow-hidden">
                                            <img src={getIconUrl(recipe.icon)} className="w-full h-full object-cover" alt={recipe.name} />
                                            {recipe.yield > 1 && (
                                                <div className="absolute bottom-0 right-0 bg-black/80 px-1 text-[10px] font-bold text-white border-t border-l border-[#333]">
                                                    x{recipe.yield}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-[#e2e8f0] truncate">{recipe.name}</div>
                                            <div className="text-[10px] text-[#666] font-mono mt-0.5 truncate">
                                                {recipe.reagents.map(r => `${r.count} ${r.item.name}`).join(', ')}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-[#050505] rounded px-2 py-1 border border-[#222]">
                                            <button 
                                                onClick={() => updateQuantity(recipe.id, -1)}
                                                className="text-[#666] hover:text-[#e2e8f0] font-bold text-lg w-6 h-6 flex items-center justify-center transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className={`w-8 text-center font-mono font-bold text-lg ${currentAmt > 0 ? 'text-[#FFD700]' : 'text-[#444]'}`}>
                                                {currentAmt}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(recipe.id, 1)}
                                                className="text-[#666] hover:text-[#e2e8f0] font-bold text-lg w-6 h-6 flex items-center justify-center transition-colors"
                                            >
                                                +
                                            </button>
                                            <button 
                                                onClick={() => updateQuantity(recipe.id, 5)}
                                                className="text-[#444] hover:text-[#aaa] text-[9px] font-bold border border-[#333] px-1 rounded ml-1"
                                                title="Add 5"
                                            >
                                                +5
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: Ledger (Shopping List) */}
                    <div className="w-full lg:w-2/5 bg-[#e6e2d6] dark:bg-[#121214] flex flex-col h-full border-l border-[#d6d3ce] dark:border-[#222]">
                        <div className="p-4 border-b border-[#d6d3ce] dark:border-[#222] bg-[#dcd9d0] dark:bg-[#18181b] flex justify-between items-center">
                            <h3 className="text-stone-800 dark:text-[#e2e8f0] font-cinzel font-bold text-sm tracking-[0.2em] flex items-center gap-2">
                                <span>📜</span> REQUISITION LEDGER
                            </h3>
                            <button 
                                onClick={clearAll}
                                className="text-[10px] text-red-600 dark:text-red-400 font-bold hover:underline"
                                disabled={Object.keys(quantities).length === 0}
                            >
                                CLEAR ALL
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {shoppingList.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-[#444] select-none">
                                    <span className="text-4xl mb-3 opacity-30">⚖️</span>
                                    <span className="text-xs font-bold tracking-widest text-center">NO ITEMS PLANNED</span>
                                    <span className="text-[10px] mt-1">Select items on the left to calculate materials.</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {shoppingList.map(({ reagent, count }) => (
                                        <div key={reagent.id} className="flex justify-between items-center p-2 rounded border border-[#d6d3ce] dark:border-[#333] bg-[#f4f1ea] dark:bg-[#1a1a1d]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded border border-stone-300 dark:border-[#444] overflow-hidden">
                                                    <img src={getIconUrl(reagent.icon)} className="w-full h-full object-cover" alt={reagent.name} />
                                                </div>
                                                <span className={`text-xs font-bold ${reagent.quality === 'uncommon' ? 'text-[#1eff00]' : (reagent.quality === 'rare' ? 'text-[#0070dd]' : 'text-stone-700 dark:text-[#ccc]')}`}>
                                                    {reagent.name}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-sm text-stone-900 dark:text-[#e2e8f0]">
                                                x{count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary Footer */}
                        {shoppingList.length > 0 && (
                            <div className="p-4 bg-[#dcd9d0] dark:bg-[#18181b] border-t border-[#d6d3ce] dark:border-[#222]">
                                <div className="text-[10px] text-stone-500 dark:text-[#666] text-center mb-2">
                                    TOTAL UNIQUE MATERIALS: {shoppingList.length}
                                </div>
                                <button 
                                    className="w-full py-3 bg-stone-800 dark:bg-[#222] text-[#e2e8f0] font-bold text-xs rounded shadow-sm hover:bg-stone-700 dark:hover:bg-[#333] transition-colors border border-stone-600 dark:border-[#444] uppercase tracking-widest"
                                    onClick={() => {
                                        const text = shoppingList.map(i => `${i.count}x ${i.reagent.name}`).join('\n');
                                        navigator.clipboard.writeText(text)
                                            .then(() => showToast("Shopping list copied!", 'success'))
                                            .catch(() => showToast("Clipboard access denied", 'error'));
                                    }}
                                >
                                    COPY TO CLIPBOARD
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {showClearConfirm && (
                <ConfirmationModal
                    message="Clear all planned items?"
                    onConfirm={() => { setQuantities({}); localStorage.removeItem('bis-professions-plan'); setShowClearConfirm(false); }}
                    onCancel={() => setShowClearConfirm(false)}
                />
            )}
        </div>
    );
};
