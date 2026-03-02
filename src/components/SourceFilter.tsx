
import React, { memo } from 'react';
import { RealmType } from '../types';

export type LootSource = 'All' | 'Dungeons' | 'MC' | 'BWL' | 'ZG' | 'AQ20' | 'AQ40' | 'Naxx' | 'Emerald Sanctum' | 'Lower Karazhan' | 'PvP / World';

interface SourceFilterProps {
    selectedSources: LootSource[];
    onToggleSource: (source: LootSource) => void;
    currentRealm: RealmType;
}

interface SourceDef {
    id: LootSource;
    label: string;
    code: string;
    icon: string;
    theme: 'stone' | 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'cyan' | 'emerald' | 'violet' | 'yellow';
    turtleOnly?: boolean;
    description: string;
}

const SOURCES: SourceDef[] = [
    { id: 'All', label: 'ALL SOURCES', code: 'SYS-00', icon: '📦', theme: 'stone', description: 'Show all items' },
    { id: 'Dungeons', label: 'DUNGEONS', code: 'SEC-05', icon: '🗝️', theme: 'blue', description: '5-Man & 10-Man Dungeons' },
    { id: 'MC', label: 'MOLTEN CORE', code: 'SEC-MC', icon: '🔥', theme: 'orange', description: 'Tier 1 Raid' },
    { id: 'BWL', label: 'BLACKWING LAIR', code: 'SEC-BWL', icon: '🐲', theme: 'red', description: 'Tier 2 Raid' },
    { id: 'ZG', label: "ZUL'GURUB", code: 'SEC-ZG', icon: '🐍', theme: 'green', description: '20-Man Raid' },
    { id: 'AQ20', label: 'RUINS OF AQ', code: 'SEC-20', icon: '🦂', theme: 'yellow', description: '20-Man Raid' },
    { id: 'AQ40', label: 'TEMPLE OF AQ', code: 'SEC-40', icon: '👁️', theme: 'purple', description: 'Tier 2.5 Raid' },
    { id: 'Naxx', label: 'NAXXRAMAS', code: 'SEC-NX', icon: '💀', theme: 'cyan', description: 'Tier 3 Raid' },
    { id: 'Emerald Sanctum', label: 'EMERALD SANCTUM', code: 'SEC-ES', icon: '🌲', theme: 'emerald', turtleOnly: true, description: 'Turtle WoW Raid' },
    { id: 'Lower Karazhan', label: 'LOWER KARAZHAN', code: 'SEC-KZ', icon: '👻', theme: 'violet', turtleOnly: true, description: 'Turtle WoW Dungeon' },
    { id: 'PvP / World', label: 'PVP & WORLD', code: 'SEC-PV', icon: '⚔️', theme: 'yellow', description: 'PvP Ranks, Crafting, Rep' },
];

const THEME_CONFIG: Record<string, { border: string, text: string, bg: string, shadow: string }> = {
    stone:   { border: 'border-[#a8a29e]', text: 'text-[#a8a29e]', bg: 'bg-[#a8a29e]/10', shadow: 'shadow-[0_0_15px_rgba(168,162,158,0.2)]' },
    blue:    { border: 'border-[#3b82f6]', text: 'text-[#3b82f6]', bg: 'bg-[#3b82f6]/10', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
    orange:  { border: 'border-[#f97316]', text: 'text-[#f97316]', bg: 'bg-[#f97316]/10', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' },
    red:     { border: 'border-[#ef4444]', text: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' },
    green:   { border: 'border-[#22c55e]', text: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' },
    purple:  { border: 'border-[#a855f7]', text: 'text-[#a855f7]', bg: 'bg-[#a855f7]/10', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
    cyan:    { border: 'border-[#06b6d4]', text: 'text-[#06b6d4]', bg: 'bg-[#06b6d4]/10', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]' },
    yellow:  { border: 'border-[#eab308]', text: 'text-[#eab308]', bg: 'bg-[#eab308]/10', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]' },
    emerald: { border: 'border-[#10b981]', text: 'text-[#10b981]', bg: 'bg-[#10b981]/10', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
    violet:  { border: 'border-[#8b5cf6]', text: 'text-[#8b5cf6]', bg: 'bg-[#8b5cf6]/10', shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]' },
};

const SourceFilterComponent: React.FC<SourceFilterProps> = ({ selectedSources, onToggleSource, currentRealm }) => {
    
    const visibleSources = SOURCES.filter(s => !s.turtleOnly || currentRealm === 'Turtle');

    return (
        <div className="w-full relative py-4">
            <div className="flex overflow-x-auto gap-4 py-4 px-4 scrollbar-none items-center snap-x">
                {visibleSources.map((source) => {
                    const isActive = selectedSources.includes(source.id);
                    const theme = THEME_CONFIG[source.theme] || THEME_CONFIG.stone;
                    
                    return (
                        <button
                            key={source.id}
                            onClick={() => onToggleSource(source.id)}
                            title={source.description}
                            className={`
                                relative group snap-center shrink-0 
                                w-[160px] h-[56px] 
                                transition-all duration-300 ease-out
                                focus:outline-none
                                active:scale-95
                                border-l-2 border-r-2 
                                flex items-center justify-between px-4
                                ${isActive 
                                    ? `${theme.bg} ${theme.border} ${theme.shadow} z-10 scale-[1.02]` 
                                    : 'bg-[#0f0f12] border-[#333] hover:border-[#555] hover:bg-[#161616]'
                                }
                            `}
                        >
                            {/* Icon Area */}
                            <div className="flex items-center justify-center w-8 h-8 relative">
                                <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                                    {source.icon}
                                </span>
                                {isActive && <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-50"></div>}
                            </div>

                            {/* Text Data */}
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-mono tracking-widest text-[#555] mb-0.5 leading-none group-hover:text-[#888]">
                                    {source.code}
                                </span>
                                <span 
                                    className={`font-cinzel font-bold text-[10px] tracking-[0.15em] uppercase transition-colors duration-200 ${isActive ? theme.text : 'text-[#888]'}`}
                                >
                                    {source.label}
                                </span>
                            </div>

                            {/* Corner Decorations */}
                            <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r transition-colors duration-300 ${isActive ? theme.border : 'border-[#333]'} opacity-50`}></div>
                            <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l transition-colors duration-300 ${isActive ? theme.border : 'border-[#333]'} opacity-50`}></div>
                        </button>
                    );
                })}
                <div className="w-2 shrink-0"></div>
            </div>
            
            {/* Fade Gradients for Scroll Indication */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0e0e10] to-transparent pointer-events-none z-20"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0e0e10] to-transparent pointer-events-none z-20"></div>
        </div>
    );
};

export const SourceFilter = memo(SourceFilterComponent);
