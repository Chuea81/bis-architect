
import React from 'react';

interface StatOrbProps {
    label: string;
    value: string | number;
    tooltip?: string;
}

export const StatOrb: React.FC<StatOrbProps> = ({ label, value, tooltip }) => (
    <div 
        title={tooltip}
        className="bg-[#121212] border border-[#2a2a2a] p-1.5 flex flex-col items-center justify-center rounded shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] cursor-help hover:border-[#444] transition-colors"
    >
        <span className="block text-[9px] text-[#888] font-cinzel tracking-widest leading-none mb-1 opacity-80">{label}</span>
        <span className="text-sm font-bold text-[#eee] tracking-wide leading-none">{value}</span>
    </div>
);

interface ResOrbProps {
    type: 'fire' | 'frost' | 'nature' | 'shadow' | 'arcane';
    value: number;
}

export const ResOrb: React.FC<ResOrbProps> = ({ type, value }) => {
    const colors = {
        fire: { bg: 'bg-[#5a0000]/40', text: 'text-[#ff9a9a]', border: 'border-[#5a0000]' },
        frost: { bg: 'bg-[#002f4d]/40', text: 'text-[#9adfff]', border: 'border-[#002f4d]' },
        nature: { bg: 'bg-[#003300]/40', text: 'text-[#9aff9a]', border: 'border-[#003300]' },
        shadow: { bg: 'bg-[#2a0040]/40', text: 'text-[#d99aff]', border: 'border-[#2a0040]' },
        arcane: { bg: 'bg-[#4d4d00]/40', text: 'text-[#ffff9a]', border: 'border-[#4d4d00]' },
    };

    const c = colors[type];
    const label = type.charAt(0).toUpperCase() + type.slice(1);

    return (
        <div 
            title={`${label} Resistance`}
            className={`h-7 flex items-center justify-center text-xs font-bold rounded border ${c.bg} ${c.text} ${c.border} shadow-[0_0_5px_rgba(0,0,0,0.5)] cursor-help`}
        >
            {value}
        </div>
    );
};
