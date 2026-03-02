
import React, { useState, useMemo, useEffect } from 'react';
import { talentData } from '../data';
import { showToast } from './Toast';

// --- TYPES ---
// Renamed to avoid potential conflicts with global/imported types
type LocalTalentDef = {
  id: number | string;
  maxRank: number;
  icon: string;
  description: string;
  x: number;
  y: number;
  req?: string; 
  stats?: any; 
};

type LocalTreeDef = {
  background: string;
  icon: string;
  talents: Record<string, LocalTalentDef>;
};

interface TalentCalculatorProps {
    selectedClass?: string;
    onClose?: () => void;
    talentPoints: Record<string, number>;
    setTalentPoints: (points: Record<string, number>) => void;
}

const getIconUrl = (iconName: string | undefined): string => {
    if (!iconName) {
        return "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
    }
    let clean = iconName.toLowerCase();
    clean = clean.replace(/\.jpg$/, '').replace(/\.png$/, '');
    return `https://wow.zamimg.com/images/wow/icons/large/${clean}.jpg`;
};

const formatDescription = (desc: string, rank: number): string => {
    if (!desc) return "";
    return desc.replace(/\[([^\]]+)\]/g, (match, content) => {
        const parts = content.split('/');
        const index = Math.max(0, Math.min(rank === 0 ? 0 : rank - 1, parts.length - 1));
        return parts[index] || parts[0];
    });
};

export const TalentCalculator: React.FC<TalentCalculatorProps> = ({ selectedClass = "warrior", onClose, talentPoints, setTalentPoints }) => {
  
  const [importString, setImportString] = useState("");
  const [animatingTalent, setAnimatingTalent] = useState<string | null>(null);

  const classData = useMemo((): Record<string, LocalTreeDef> | null => {
    const normalizeKey = (key: string) => key.toLowerCase().replace(/\s+/g, '');
    const lookupKey = normalizeKey(selectedClass);
    const allData = talentData as any;
    const matchedKey = Object.keys(allData).find(k => normalizeKey(k) === lookupKey);
    
    if (!matchedKey) {
        console.error(`TalentCalculator: Class ${selectedClass} not found.`);
        return allData['warrior'] as Record<string, LocalTreeDef>; 
    }
    return allData[matchedKey] as Record<string, LocalTreeDef>;
  }, [selectedClass]);

  const updatePoints = (talentName: string, newRank: number) => {
      const next = { ...talentPoints };
      if (newRank <= 0) delete next[talentName];
      else next[talentName] = newRank;
      setTalentPoints(next);
  };

  const [hoveredTalent, setHoveredTalent] = useState<{ name: string, def: LocalTalentDef, treeName: string, currentRank: number, lockedReason?: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
  };

  const pointsPerTree = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!classData) return counts;
    
    Object.entries(classData).forEach(([treeName, treeVal]) => {
        const tree = treeVal as LocalTreeDef;
        let sum = 0;
        Object.keys(tree.talents).forEach(talentName => {
            sum += (talentPoints[talentName] || 0);
        });
        counts[treeName] = sum;
    });
    return counts;
  }, [classData, talentPoints]);

  const totalPoints: number = (Object.values(pointsPerTree) as number[]).reduce((a: number, b: number) => a + b, 0);
  const MAX_POINTS = 61; 

  const canLearn = (treeName: string, talentName: string, talent: LocalTalentDef): { allowed: boolean, reason?: string } => {
      const currentRank = (talentPoints[talentName] as number) || 0;
      
      if (currentRank >= talent.maxRank) return { allowed: false, reason: "Max Rank Reached" };
      if (totalPoints >= MAX_POINTS) return { allowed: false, reason: "Total Points Capped (61)" };

      const pointsInTree = (pointsPerTree[treeName] as number) || 0;
      const reqPoints = talent.y * 5;
      
      if (pointsInTree < reqPoints) return { allowed: false, reason: `Requires ${reqPoints} points in ${treeName}` };

      if (talent.req) {
          const reqRank = (talentPoints[talent.req] as number) || 0;
          const tree = classData![treeName];
          const reqTalentDef = tree.talents[talent.req];
          
          if (reqTalentDef && reqRank < reqTalentDef.maxRank) {
              return { allowed: false, reason: `Requires ${talent.req} (${reqTalentDef.maxRank})` };
          }
      }

      return { allowed: true };
  };

  const canUnlearn = (treeName: string, talentName: string, talent: LocalTalentDef): boolean => {
      const currentRank = talentPoints[talentName] || 0;
      if (currentRank <= 0) return false;

      const tree = classData![treeName];
      for (const [tName, tDefVal] of Object.entries(tree.talents)) {
          const tDef = tDefVal as LocalTalentDef;
          if (tDef.req === talentName) {
              if ((talentPoints[tName] || 0) > 0) return false; 
          }
      }

      const ourRow = talent.y;
      const rowPoints: Record<number, number> = {};
      let maxRowWithPoints = 0;
      
      Object.entries(tree.talents).forEach(([tName, tDefVal]) => {
          const tDef = tDefVal as LocalTalentDef;
          const pts = talentPoints[tName] || 0;
          if (pts > 0) {
              rowPoints[tDef.y] = (rowPoints[tDef.y] || 0) + pts;
              if (tDef.y > maxRowWithPoints) maxRowWithPoints = tDef.y;
          }
      });

      const simulatedRowPoints = { ...rowPoints };
      simulatedRowPoints[ourRow] = (simulatedRowPoints[ourRow] || 0) - 1;

      for (const [tName, tDefVal] of Object.entries(tree.talents)) {
          const tDef = tDefVal as LocalTalentDef;
          if ((talentPoints[tName] || 0) > 0 && tDef.y > ourRow) {
              let pointsAbove = 0;
              for (const [otherName, otherDefVal] of Object.entries(tree.talents)) {
                  const otherDef = otherDefVal as LocalTalentDef;
                  if (otherDef.y < tDef.y) {
                      let p = talentPoints[otherName] || 0;
                      if (otherName === talentName) p -= 1; 
                      pointsAbove += p;
                  }
              }
              if (pointsAbove < tDef.y * 5) return false;
          }
      }

      return true;
  };

  const handleInteraction = (treeName: string, talentName: string, talent: LocalTalentDef, action: 'add' | 'remove', e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const currentRank = talentPoints[talentName] || 0;

      if (action === 'add') {
          const check = canLearn(treeName, talentName, talent);
          if (check.allowed) {
              updatePoints(talentName, currentRank + 1);
              // Trigger Animation
              setAnimatingTalent(`${treeName}-${talentName}`);
              setTimeout(() => {
                  setAnimatingTalent(prev => prev === `${treeName}-${talentName}` ? null : prev);
              }, 300);
          }
      } else {
          if (canUnlearn(treeName, talentName, talent)) {
              updatePoints(talentName, currentRank - 1);
          }
      }
  };

  // --- STRING EXPORT/IMPORT ---
  // We need a stable ordering of talents to generate a string.
  // Strategy: Sort Tree Keys Alphabetically -> Sort Talents by Row then Column -> Concat ranks.
  const getSortedTreeKeys = () => Object.keys(classData || {}).sort();
  
  const getSortedTalents = (treeName: string) => {
      const tree = classData![treeName];
      return Object.entries(tree.talents).sort((a, b) => {
          const tA = a[1] as LocalTalentDef;
          const tB = b[1] as LocalTalentDef;
          if (tA.y !== tB.y) return tA.y - tB.y;
          return tA.x - tB.x;
      });
  };

  const generateString = () => {
      if (!classData) return "";
      let str = "";
      getSortedTreeKeys().forEach(treeKey => {
          getSortedTalents(treeKey).forEach(([name, def]) => {
              const rank = talentPoints[name] || 0;
              str += rank;
          });
          str += "-"; // Tree Separator
      });
      return str.slice(0, -1); // Remove trailing dash
  };

  const handleLoadString = () => {
      if (!classData || !importString) return;
      const treeStrs = importString.split('-');
      const sortedKeys = getSortedTreeKeys();
      const newPoints: Record<string, number> = {};

      treeStrs.forEach((treeStr, idx) => {
          const treeKey = sortedKeys[idx];
          if (!treeKey) return;
          const talents = getSortedTalents(treeKey);
          
          for (let i = 0; i < treeStr.length; i++) {
              if (i >= talents.length) break;
              const digit = parseInt(treeStr[i]);
              if (!isNaN(digit) && digit > 0) {
                  const [tName, tDef] = talents[i];
                  // tDef is inferred as LocalTalentDef | string from entries/sort structure in some contexts, so we cast to be safe
                  const def = tDef as LocalTalentDef;
                  newPoints[tName] = Math.min(digit, def.maxRank);
              }
          }
      });
      setTalentPoints(newPoints);
  };

  if (!classData) return <div className="text-white p-10">Loading Talent Data...</div>;

  const currentExportString = generateString();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[1600px] h-[90vh] bg-[#0c0c0e] border border-[#333] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <div className="h-16 bg-[#151515] border-b border-[#222] flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-[#e2e8f0] font-cinzel font-bold text-xl tracking-widest">
                    TALENTS: <span className="text-[#FFD700] uppercase">{selectedClass}</span>
                </h2>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-sm font-mono text-[#888]">POINTS: <span className="text-white text-lg font-bold">{totalPoints}/{MAX_POINTS}</span></span>
                {onClose && (
                    <button onClick={onClose} className="text-[#666] hover:text-white text-2xl font-bold transition-colors">✕</button>
                )}
            </div>
        </div>

        {/* TREES CONTAINER */}
        <div className="flex-1 overflow-y-auto py-6 px-4 md:px-10 lg:px-16 bg-[#050505]">
            <div className="flex flex-col xl:flex-row gap-6 justify-center items-start min-h-full">
                {Object.entries(classData).map(([treeName, treeVal]) => {
                    const tree = treeVal as LocalTreeDef;
                    const treePoints = pointsPerTree[treeName] || 0;

                    return (
                        <div key={treeName} className="flex-1 min-w-[340px] max-w-[450px] w-full border border-[#333] rounded-lg bg-[#111] overflow-hidden shadow-lg flex flex-col h-full self-stretch relative">
                            
                            {/* TREE HEADER */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1d] border-b border-[#333] z-10 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full border border-[#444] overflow-hidden">
                                        <img src={getIconUrl(tree.icon)} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <h3 className="font-bold text-sm text-[#eee] tracking-wider uppercase">{treeName}</h3>
                                </div>
                                <span className="text-[#FFD700] font-mono text-sm bg-black/50 px-2 py-0.5 rounded border border-[#333]">
                                    {treePoints}
                                </span>
                            </div>

                            {/* GRID AREA */}
                            <div className="relative flex-1 p-4 min-h-[600px] overflow-y-auto bg-[#0a0a0c] select-none">
                                {/* Background */}
                                <div 
                                    className="absolute inset-0 z-0 opacity-20 pointer-events-none grayscale"
                                    style={{ 
                                        backgroundImage: `url(https://wow.zamimg.com/images/wow/talents/backgrounds/${tree.background}.jpg)`, 
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'top center'
                                    }}
                                />

                                {/* Grid */}
                                <div className="relative z-10 grid grid-cols-4 gap-x-4 gap-y-8 justify-items-center">
                                    {Object.entries(tree.talents).map(([name, talentVal]) => {
                                        const talent = talentVal as LocalTalentDef;
                                        const currentRank = talentPoints[name] || 0;
                                        const isMaxed = currentRank === talent.maxRank;
                                        const isActive = currentRank > 0;
                                        
                                        const check = canLearn(treeName, name, talent);
                                        const isLocked = !check.allowed && currentRank === 0;
                                        
                                        let borderColor = 'border-[#333]';
                                        let filter = 'grayscale(100%) opacity(60%)';
                                        
                                        if (!isLocked) {
                                            filter = 'grayscale(0%)';
                                            borderColor = 'border-[#4ade80]'; // Green (Available)
                                            if (isActive) borderColor = 'border-[#FFD700]'; // Gold (Active)
                                            if (isMaxed) borderColor = 'border-[#FFD700]'; 
                                        }

                                        const isAnimating = animatingTalent === `${treeName}-${name}`;

                                        return (
                                            <div 
                                                key={name} 
                                                className="relative group flex flex-col items-center"
                                                style={{ gridColumn: talent.x + 1, gridRow: talent.y + 1 }}
                                                onClick={(e) => !isMaxed && handleInteraction(treeName, name, talent, 'add', e)}
                                                onContextMenu={(e) => handleInteraction(treeName, name, talent, 'remove', e)}
                                                onMouseEnter={() => setHoveredTalent({ name, def: talent, treeName, currentRank, lockedReason: check.reason })}
                                                onMouseLeave={() => setHoveredTalent(null)}
                                                onMouseMove={handleMouseMove}
                                            >
                                                {/* ARROWS (Visual Only - Simplified) */}
                                                {talent.req && tree.talents[talent.req] && (
                                                    <div className="absolute w-0.5 bg-yellow-600/50 -z-10" style={{ 
                                                        height: '40px', 
                                                        bottom: '100%', 
                                                        left: '50%',
                                                    }} />
                                                )}

                                                {/* ICON */}
                                                <div className={`
                                                    relative w-11 h-11 lg:w-12 lg:h-12 rounded border-2 cursor-pointer transition-all duration-100 select-none
                                                    ${borderColor}
                                                    ${isLocked ? 'cursor-not-allowed' : 'hover:scale-110 hover:border-white'}
                                                    ${isMaxed ? 'shadow-[0_0_10px_rgba(255,215,0,0.6)]' : ''}
                                                    ${isAnimating ? 'animate-talent-learn' : ''}
                                                `}
                                                style={{ filter }}
                                                >
                                                    <img 
                                                        src={getIconUrl(talent.icon)} 
                                                        alt={name}
                                                        draggable={false}
                                                        className="w-full h-full object-cover rounded-[2px]"
                                                    />
                                                    
                                                    {/* Rank Badge */}
                                                    <div className={`
                                                        absolute -bottom-2 -right-2 text-[10px] font-bold px-1.5 py-px rounded border z-20 pointer-events-none font-mono
                                                        ${isMaxed 
                                                            ? 'bg-[#FFD700] text-black border-[#bfa100]' 
                                                            : isActive 
                                                                ? 'bg-[#4ade80] text-black border-green-600' 
                                                                : 'bg-black text-[#666] border-[#333]'}
                                                    `}>
                                                        {currentRank}/{talent.maxRank}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        
        {/* FOOTER - Import/Export */}
        <div className="bg-[#111] p-3 border-t border-[#222] flex justify-between items-center px-6">
            <div className="text-[10px] text-[#555]">Turtle WoW Talents v2.1 • Left-Click: Learn • Right-Click: Unlearn</div>
            
            <div className="flex gap-2 items-center">
                <input 
                    type="text" 
                    value={importString || currentExportString}
                    onChange={(e) => setImportString(e.target.value)}
                    placeholder="Paste Talent String..."
                    className="bg-black border border-[#333] rounded px-3 py-1.5 text-xs text-[#eee] w-64 font-mono focus:border-[#a335ee] outline-none"
                />
                <button 
                    onClick={handleLoadString}
                    className="px-4 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-xs font-bold text-[#ccc] transition-colors"
                >
                    LOAD
                </button>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(currentExportString)
                            .then(() => showToast("Talent string copied!", 'success'))
                            .catch(() => showToast("Clipboard access denied", 'error'));
                    }}
                    className="px-4 py-1.5 bg-[#a335ee]/20 hover:bg-[#a335ee]/30 border border-[#a335ee]/50 rounded text-xs font-bold text-[#d8b4fe] transition-colors"
                >
                    COPY
                </button>
            </div>
        </div>

        {/* FIXED TOOLTIP */}
        {hoveredTalent && (
            <div 
                className="fixed z-[9999] w-72 bg-[#050505]/95 border border-[#444] rounded p-3 shadow-[0_0_30px_rgba(0,0,0,0.9)] text-xs pointer-events-none backdrop-blur-md"
                style={{ 
                    left: Math.min(window.innerWidth - 300, mousePos.x + 15), 
                    top: Math.min(window.innerHeight - 200, mousePos.y + 15),
                }}
            >
                <h4 className="font-bold text-white text-sm mb-1">{hoveredTalent.name}</h4>
                <div className="text-[#FFD700] mb-2 font-mono">Rank {hoveredTalent.currentRank}/{hoveredTalent.def.maxRank}</div>
                
                {hoveredTalent.lockedReason && hoveredTalent.currentRank === 0 && (
                    <div className="text-red-500 mb-2 font-bold">{hoveredTalent.lockedReason}</div>
                )}

                <div className="text-[#aaa] leading-relaxed mb-3">
                    {hoveredTalent.currentRank === 0 
                        ? formatDescription(hoveredTalent.def.description, 1)
                        : formatDescription(hoveredTalent.def.description, hoveredTalent.currentRank)
                    }
                </div>

                {!hoveredTalent.lockedReason && hoveredTalent.currentRank > 0 && hoveredTalent.currentRank < hoveredTalent.def.maxRank && (
                    <div className="mt-2 pt-2 border-t border-[#333]">
                        <div className="text-[#4ade80] font-bold mb-1">Next Rank:</div>
                        <div className="text-[#888]">{formatDescription(hoveredTalent.def.description, hoveredTalent.currentRank + 1)}</div>
                    </div>
                )}

                <div className="mt-2 text-[10px] text-[#555] italic flex justify-between">
                    <span>
                        {hoveredTalent.currentRank < hoveredTalent.def.maxRank && !hoveredTalent.lockedReason && "Click to Learn"}
                    </span>
                    <span className="text-red-900">
                        {hoveredTalent.currentRank > 0 && "Right-Click to Unlearn"}
                    </span>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
