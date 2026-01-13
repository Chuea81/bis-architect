
import React, { useState, useMemo } from 'react';
import { TalentTree, TalentDef, ClassName } from '../types';
import { getIconUrl } from '../services/gearService';
import { TALENT_DB } from '../data/talents';

interface TalentCalculatorProps {
    currentClass: ClassName;
    talentPoints: Record<string, number>;
    setTalentPoints: (points: Record<string, number>) => void;
    onClose: () => void;
}

const MAX_POINTS = 51;
const TREE_ROWS = 7;
const TREE_COLS = 4;
const ICON_SIZE = 48; // Adjusted size for better fit
const GAP_X = 64; 
const GAP_Y = 48; 
const PADDING_TOP = 40;
const PADDING_LEFT = 50;

// Calculate position for a specific row/col
const getPos = (row: number, col: number) => ({
    x: PADDING_LEFT + col * (ICON_SIZE + GAP_X),
    y: PADDING_TOP + row * (ICON_SIZE + GAP_Y)
});

interface ArrowPathProps {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
    active: boolean;
    tierMet: boolean;
}

// Improved Arrow rendering with curves and states
const ArrowPath: React.FC<ArrowPathProps> = ({ startRow, startCol, endRow, endCol, active, tierMet }) => {
    const start = getPos(startRow, startCol);
    const end = getPos(endRow, endCol);
    
    // Adjust start/end points to center of icons
    const sX = start.x + ICON_SIZE / 2;
    const sY = start.y + ICON_SIZE / 2;
    const eX = end.x + ICON_SIZE / 2;
    const eY = end.y + ICON_SIZE / 2;

    const color = active ? "#FFD700" : (tierMet ? "#666" : "#333");
    const strokeWidth = active ? 2 : 1.5;

    // Drawing logic
    let d = "";
    
    // Calculate offsets to exit/enter nicely
    const exitY = sY + ICON_SIZE/2 + 5;
    const enterY = eY - ICON_SIZE/2 - 5;

    if (startCol === endCol) {
        // Straight Down
        d = `M ${sX} ${exitY} L ${eX} ${enterY}`;
    } else {
        // Orthogonal connector (Elbow)
        // Go down half the gap, then across, then down
        const midY = (exitY + enterY) / 2;
        d = `M ${sX} ${exitY} L ${sX} ${midY} L ${eX} ${midY} L ${eX} ${enterY}`;
    }

    // Arrowhead marker
    const arrowHead = `M ${eX} ${enterY} L ${eX - 4} ${enterY - 6} L ${eX + 4} ${enterY - 6} Z`;

    return (
        <g className="transition-all duration-300">
            <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" opacity={0.8} />
            <path d={arrowHead} fill={color} opacity={0.8} />
        </g>
    );
};

export const TalentCalculator: React.FC<TalentCalculatorProps> = ({ currentClass, talentPoints, setTalentPoints, onClose }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [hoveredTalent, setHoveredTalent] = useState<{ talent: TalentDef, rect: DOMRect } | null>(null);

    const trees = useMemo(() => {
        return TALENT_DB[currentClass] || [];
    }, [currentClass]);

    const totalSpent = useMemo(() => Object.values(talentPoints).reduce((a: number, b: number) => a + b, 0), [talentPoints]);
    
    // Points per tree for unlocking tiers
    const pointsPerTree = useMemo(() => {
        const counts = [0, 0, 0];
        if (!trees.length) return counts;
        trees.forEach((tree, idx) => {
            tree.talents.forEach(t => {
                counts[idx] += talentPoints[t.id] || 0;
            });
        });
        return counts;
    }, [trees, talentPoints]);

    const handlePointChange = (talent: TalentDef, treeIndex: number, delta: number) => {
        const currentRank = talentPoints[talent.id] || 0;
        const newRank = currentRank + delta;

        if (newRank < 0 || newRank > talent.maxRank) return;
        if (delta > 0 && totalSpent >= MAX_POINTS) return;

        // Prereqs (Adding)
        if (delta > 0) {
            const neededForTier = talent.row * 5;
            if (pointsPerTree[treeIndex] < neededForTier) return;
            if (talent.prereq) {
                const preRank = talentPoints[talent.prereq] || 0;
                const preDef = trees[treeIndex].talents.find(t => t.id === talent.prereq);
                if (preDef && preRank < preDef.maxRank) return;
            }
        }

        // Dependencies (Removing) - Simplified Check
        // Ideally we check if removing this point breaks any dependent talent or higher tier requirement
        if (delta < 0) {
            // Check 1: Does a child talent depend on this?
            const hasDependent = trees[treeIndex].talents.some(t => t.prereq === talent.id && (talentPoints[t.id] || 0) > 0);
            if (hasDependent && newRank < talent.maxRank) return; // Can't de-rank if child exists

            // Check 2: Does removing this break the tier requirement for higher row talents?
            // This is complex. We calculate total points in tree *after* removal.
            const projectedTreePoints = pointsPerTree[treeIndex] - 1;
            const highestRowUsed = trees[treeIndex].talents.reduce((maxRow, t) => (talentPoints[t.id] || 0) > 0 ? Math.max(maxRow, t.row) : maxRow, 0);
            
            // If we have points in a row X, we must have at least X*5 points in rows 0 to X-1
            // Simple heuristic: If we are removing from row Y, and we have points in row Y+1, 
            // we must validate that (points in rows <= Y) >= (Y+1)*5
            
            // Full validation loop
            let valid = true;
            for (let r = 1; r <= highestRowUsed; r++) {
                // Count points in rows strictly below r
                let pointsBelowR = 0;
                trees[treeIndex].talents.forEach(t => {
                    if (t.row < r) {
                        let pts = talentPoints[t.id] || 0;
                        if (t.id === talent.id) pts -= 1; // Simulate removal
                        pointsBelowR += pts;
                    }
                });
                
                // Do we have points IN or ABOVE row r?
                const hasPointsInOrAbove = trees[treeIndex].talents.some(t => t.row >= r && (t.id === talent.id ? newRank > 0 : (talentPoints[t.id] || 0) > 0));
                
                if (hasPointsInOrAbove && pointsBelowR < r * 5) {
                    valid = false;
                    break;
                }
            }
            if (!valid) return;
        }

        const newPoints = { ...talentPoints, [talent.id]: newRank };
        if (newRank === 0) delete newPoints[talent.id];
        setTalentPoints(newPoints);
    };

    const handleReset = () => {
        if (window.confirm("Reset all talent points?")) {
            setTalentPoints({});
        }
    };

    const handleMouseEnter = (talent: TalentDef, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredTalent({ talent, rect });
    };

    const handleMouseLeave = () => {
        setHoveredTalent(null);
    };

    if (trees.length === 0) return null;

    const currentTree = trees[activeTab];

    // Determine texture style
    const getBgStyle = (bgName: string) => {
        // Fallback or specific textures
        return `radial-gradient(circle at 50% 30%, ${currentTree.color}20, #050505 90%)`; 
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 lg:p-8" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-5xl h-full max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#222] bg-[#151515] flex justify-between items-center shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <h2 className="text-[#e2e8f0] font-cinzel text-2xl tracking-[0.15em] font-bold drop-shadow-md">
                            <span style={{ color: currentTree.color }}>{currentClass.toUpperCase()}</span> TALENTS
                        </h2>
                        
                        <div className="flex items-center gap-2 bg-[#0a0a0c] border border-[#333] px-3 py-1.5 rounded-full">
                            <span className="text-[#888] text-xs font-bold tracking-wider">POINTS SPENT</span>
                            <div className="w-px h-4 bg-[#333]"></div>
                            <span className={`text-lg font-mono font-bold ${totalSpent === MAX_POINTS ? 'text-[#4ade80]' : 'text-white'}`}>{totalSpent}</span>
                            <span className="text-[#555] text-xs">/ {MAX_POINTS}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleReset} className="text-xs font-bold text-red-500 border border-red-900/30 bg-red-900/10 px-4 py-2 rounded hover:bg-red-900/20 transition-colors uppercase tracking-widest">Reset All</button>
                        <button onClick={onClose} className="text-[#666] hover:text-white font-bold text-2xl transition-colors px-2">✕</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#222] bg-[#111] shrink-0 z-20">
                    {trees.map((tree, idx) => (
                        <button
                            key={tree.name}
                            onClick={() => setActiveTab(idx)}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-[0.15em] transition-all relative overflow-hidden group
                                ${activeTab === idx ? 'text-white bg-[#1a1a1d]' : 'text-[#555] hover:text-[#888] hover:bg-[#151515]'}
                            `}
                        >
                            {activeTab === idx && <div className="absolute top-0 left-0 w-full h-0.5 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: tree.color, color: tree.color }}></div>}
                            <div className="flex flex-col items-center gap-1 relative z-10">
                                <span className={activeTab === idx ? 'text-white' : 'text-[#666]'}>{tree.name}</span>
                                <span className="text-[10px] font-mono text-[#444] group-hover:text-[#666] bg-[#000]/50 px-2 rounded-full border border-[#222]">
                                    {pointsPerTree[idx]}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Tree Viewport */}
                <div className="flex-1 relative overflow-auto bg-[#050505] flex justify-center scrollbar-thin scrollbar-thumb-[#333]">
                    
                    {/* Dynamic Background */}
                    <div 
                        className="absolute inset-0 pointer-events-none transition-all duration-500"
                        style={{ background: getBgStyle(currentTree.background) }}
                    >
                        {/* Grid lines effect */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    </div>
                    
                    {/* Inner Container to center grid */}
                    <div 
                        className="relative my-10 transition-all duration-300"
                        style={{ 
                            width: PADDING_LEFT * 2 + (TREE_COLS - 1) * (ICON_SIZE + GAP_X) + ICON_SIZE,
                            height: PADDING_TOP * 2 + (TREE_ROWS - 1) * (ICON_SIZE + GAP_Y) + ICON_SIZE
                        }}
                    >
                        {/* SVG Layer for Arrows */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                            <defs>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            {currentTree.talents.map(t => {
                                if (!t.prereq) return null;
                                const prereqTalent = currentTree.talents.find(pt => pt.id === t.prereq);
                                if (!prereqTalent) return null;
                                
                                const preRank = talentPoints[t.prereq] || 0;
                                const isActive = preRank === prereqTalent.maxRank;
                                const tierMet = pointsPerTree[activeTab] >= t.row * 5;

                                return (
                                    <ArrowPath 
                                        key={`${t.prereq}-${t.id}`}
                                        startRow={prereqTalent.row} 
                                        startCol={prereqTalent.col} 
                                        endRow={t.row} 
                                        endCol={t.col}
                                        active={isActive}
                                        tierMet={tierMet}
                                    />
                                );
                            })}
                        </svg>

                        {/* Talent Icons */}
                        {currentTree.talents.map(talent => {
                            const rank = talentPoints[talent.id] || 0;
                            const isMaxed = rank === talent.maxRank;
                            
                            const tierUnlocked = pointsPerTree[activeTab] >= talent.row * 5;
                            const prereqMet = !talent.prereq || (talentPoints[talent.prereq] || 0) === (trees[activeTab].talents.find(t => t.id === talent.prereq)?.maxRank || 99);
                            const isAvailable = tierUnlocked && prereqMet;
                            
                            const isGray = rank === 0 && !isAvailable;
                            let borderColor = '#333';
                            if (isMaxed) borderColor = '#FFD700';
                            else if (rank > 0) borderColor = '#4ade80';
                            else if (isAvailable) borderColor = '#4ade80'; // Green border for available

                            const pos = getPos(talent.row, talent.col);

                            return (
                                <div 
                                    key={talent.id}
                                    className="absolute z-10"
                                    style={{ 
                                        top: pos.y, 
                                        left: pos.x,
                                        width: ICON_SIZE,
                                        height: ICON_SIZE
                                    }}
                                    onContextMenu={(e) => { e.preventDefault(); handlePointChange(talent, activeTab, -1); }}
                                    onClick={() => handlePointChange(talent, activeTab, 1)}
                                    onMouseEnter={(e) => handleMouseEnter(talent, e)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="relative group cursor-pointer w-full h-full">
                                        
                                        {/* Icon Frame */}
                                        <div 
                                            className={`
                                                w-full h-full rounded border-2 overflow-hidden transition-all duration-200 
                                                ${isGray ? 'grayscale opacity-40' : 'grayscale-0 shadow-[0_0_15px_rgba(0,0,0,0.8)]'} 
                                                ${isAvailable && rank === 0 ? 'hover:border-[#4ade80] hover:scale-110' : ''}
                                                ${rank > 0 ? 'scale-105' : ''}
                                                hover:z-20
                                            `}
                                            style={{ borderColor: isGray ? '#333' : borderColor }}
                                        >
                                            <img 
                                                src={getIconUrl(talent.icon)} 
                                                className="w-full h-full object-cover" 
                                                alt={talent.name} 
                                                onError={(e) => { e.currentTarget.src = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg"; }}
                                            />
                                        </div>
                                        
                                        {/* Rank Counter */}
                                        <div 
                                            className={`
                                                absolute -bottom-2 -right-2 px-1.5 py-px rounded border text-[10px] font-bold font-mono z-20 shadow-md select-none pointer-events-none
                                                ${isMaxed ? 'bg-[#FFD700] text-black border-black' : (rank > 0 ? 'bg-[#4ade80] text-black border-black' : 'bg-[#111] text-[#666] border-[#333]')}
                                            `}
                                        >
                                            {rank}/{talent.maxRank}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Floating Tooltip Layer */}
                {hoveredTalent && (() => {
                    const { talent, rect } = hoveredTalent;
                    const rank = talentPoints[talent.id] || 0;
                    
                    const tierUnlocked = pointsPerTree[activeTab] >= talent.row * 5;
                    const prereqMet = !talent.prereq || (talentPoints[talent.prereq] || 0) === (trees[activeTab].talents.find(t => t.id === talent.prereq)?.maxRank || 99);
                    const isAvailable = tierUnlocked && prereqMet;

                    // Tooltip Positioning
                    const TOOLTIP_WIDTH = 300;
                    let left = rect.right + 15;
                    let top = rect.top;

                    // Flip if too far right
                    if (left + TOOLTIP_WIDTH > window.innerWidth) {
                        left = rect.left - TOOLTIP_WIDTH - 15;
                    }
                    
                    // Cap bottom
                    if (top + 200 > window.innerHeight) {
                        top = window.innerHeight - 200; 
                    }

                    return (
                        <div 
                            className="fixed z-[300] w-[300px] pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95 duration-100"
                            style={{ left, top }}
                        >
                            <div className="bg-[#09090b]/98 rounded border-2 border-[#b3a06d] shadow-[0_0_0_1px_black,0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-md">
                                <div className="p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-white tracking-wide leading-tight">{talent.name}</h4>
                                        <span className="text-[11px] font-bold text-[#FFD700]">Rank {rank}/{talent.maxRank}</span>
                                    </div>
                                    
                                    <div className="text-xs text-[#FFD700] leading-relaxed mb-3 font-medium text-shadow-sm">
                                        {talent.description(rank === 0 ? 1 : rank)}
                                    </div>
                                    
                                    {rank > 0 && rank < talent.maxRank && (
                                        <div className="mt-3 pt-2 border-t border-[#333]">
                                            <div className="text-[10px] text-[#888] font-bold uppercase mb-1">Next Rank</div>
                                            <div className="text-xs text-white leading-relaxed">
                                                {talent.description(rank + 1)}
                                            </div>
                                        </div>
                                    )}

                                    {!isAvailable && (
                                        <div className="mt-3 pt-2 border-t border-[#333] text-red-500 text-[10px] font-bold uppercase tracking-widest">
                                            {!tierUnlocked ? `Requires ${talent.row * 5} points in ${trees[activeTab].name}` : "Requires Prerequisite Talent"}
                                        </div>
                                    )}
                                    
                                    {isAvailable && rank < talent.maxRank && (
                                        <div className="mt-3 pt-2 border-t border-[#333] text-[#4ade80] text-[10px] font-bold uppercase tracking-widest">
                                            Click to Learn
                                        </div>
                                    )}
                                    
                                    {rank > 0 && (
                                        <div className="mt-2 text-[#666] text-[9px] italic">
                                            Right-click to unlearn
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
