
import React, { useState, useEffect, useRef } from 'react';
import { AggregatedStats, SpecName, Build, ClassName } from '../types';
import { runSimulation, SimResult, ROTATIONS } from '../services/combatEngine';

interface CombatSimModalProps {
    stats: AggregatedStats;
    spec: SpecName;
    currentClass: ClassName;
    equipped: Build;
    activeRaidDebuffs?: string[];
    onClose: () => void;
}

type BreakdownData = { hits: number, crits: number, damage: number, healing: number, threat: number };

// Helper to generate graph data
const generateGraphData = (events: any[], duration: number) => {
    const points: { time: number, dps: number }[] = [];
    const interval = 2; // 2 second buckets
    let currentBucketEnd = interval;
    let damageInBucket = 0;
    
    // Create buckets
    for (let i = 0; i <= duration; i += interval) {
        points.push({ time: i, dps: 0 });
    }

    let runningTotal = 0;
    let lastTime = 0;

    events.forEach(ev => {
        if (ev.amount > 0 && !ev.type.includes('heal') && ev.type !== 'resource') {
            while (ev.timestamp > currentBucketEnd) {
                // Finalize previous buckets if gap
                const idx = Math.floor(currentBucketEnd / interval);
                if (points[idx]) points[idx].dps = Math.floor(runningTotal / Math.max(1, currentBucketEnd));
                currentBucketEnd += interval;
            }
            runningTotal += ev.amount;
        }
    });

    // Fill remaining
    while (currentBucketEnd <= duration + interval) {
        const idx = Math.floor(currentBucketEnd / interval);
        if (points[idx]) points[idx].dps = Math.floor(runningTotal / Math.max(1, currentBucketEnd));
        currentBucketEnd += interval;
    }

    return points;
};

export const CombatSimModal: React.FC<CombatSimModalProps> = ({ stats, spec, currentClass, equipped, activeRaidDebuffs = [], onClose }) => {
    const [duration, setDuration] = useState(60);
    const [targetType, setTargetType] = useState<'boss' | 'mob'>('boss');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<SimResult | null>(null);
    const [progress, setProgress] = useState(0);
    const [graphData, setGraphData] = useState<{ time: number, dps: number }[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Rotation State
    const availableRotations = ROTATIONS[currentClass] || [];
    const [selectedRotationId, setSelectedRotationId] = useState<string>(availableRotations[0]?.id || "");

    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (availableRotations.length > 0) {
            setSelectedRotationId(availableRotations[0].id);
        }
    }, [currentClass]);

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [result]);

    const handleRunSimulation = async () => {
        setIsRunning(true);
        setResult(null);
        setProgress(0);
        setGraphData([]);
        setError(null);

        await new Promise(r => setTimeout(r, 100));

        try {
            const simRes = runSimulation(
                stats,
                currentClass,
                selectedRotationId,
                duration,
                targetType,
                equipped,
                activeRaidDebuffs,
                (p) => setProgress(p)
            );

            setResult(simRes);
            setGraphData(generateGraphData(simRes.events, duration));
        } catch (e: any) {
            console.error("Simulation failed", e);
            setError(e?.message || "Simulation failed. Check your gear and try again.");
        } finally {
            setIsRunning(false);
            setProgress(100);
        }
    };

    // Determine primary role for display prioritization
    const getPrimaryMetric = () => {
        if (!result) return 'dps';
        if (result.hps > result.dps) return 'hps';
        // Heuristic for tanks: if DPS is low but threat is high, and TPS > DPS * 1.5 (threat modifiers)
        if (result.tps > result.dps && spec.includes('Prot')) return 'tps';
        return 'dps';
    };

    const primaryMetric = getPrimaryMetric();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={onClose}>
            <div 
                className="bg-[#0f0f12] border border-[#444] w-full max-w-6xl rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                    <div>
                        <h2 className="text-red-500 font-cinzel text-2xl tracking-[0.15em] font-bold drop-shadow-md flex items-center gap-2">
                            <span>⚔️</span>
                            <span>THE PROVING GROUNDS</span>
                        </h2>
                        <p className="text-[10px] text-[#666] font-bold tracking-widest mt-1">ADVANCED COMBAT SIMULATOR v2.2</p>
                    </div>
                    <button onClick={onClose} className="text-[#666] hover:text-white font-bold px-2 text-xl transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    
                    {/* LEFT PANEL: Controls & Summary */}
                    <div className="w-full md:w-1/3 lg:w-1/4 bg-[#111] border-r border-[#222] p-6 flex flex-col gap-6 overflow-y-auto">
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-[#FFD700] tracking-wider uppercase">COMBAT STRATEGY</label>
                            <select 
                                value={selectedRotationId} 
                                onChange={(e) => setSelectedRotationId(e.target.value)}
                                className="w-full bg-[#1a1a1d] border border-[#333] text-[#eee] text-xs font-bold py-3 px-3 rounded focus:border-red-500 outline-none uppercase"
                            >
                                {availableRotations.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <div className="text-[10px] text-[#666] italic border-l-2 border-[#333] pl-2 leading-relaxed">
                                {availableRotations.find(r => r.id === selectedRotationId)?.description}
                            </div>
                        </div>

                        <div className="h-px bg-[#222] w-full"></div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[#888] tracking-wider">FIGHT DURATION</label>
                                <input 
                                    type="range" min="30" max="300" step="10" 
                                    value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="accent-red-500 h-2 bg-[#222] rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-right text-red-500 font-mono font-bold">{duration}s</div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[#888] tracking-wider">TARGET LEVEL</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setTargetType('boss')}
                                        className={`flex-1 py-2 text-xs font-bold border rounded ${targetType === 'boss' ? 'bg-red-900/30 border-red-500 text-red-500' : 'bg-[#222] border-[#333] text-[#555]'}`}
                                    >
                                        BOSS (+3)
                                    </button>
                                    <button 
                                        onClick={() => setTargetType('mob')}
                                        className={`flex-1 py-2 text-xs font-bold border rounded ${targetType === 'mob' ? 'bg-red-900/30 border-red-500 text-red-500' : 'bg-[#222] border-[#333] text-[#555]'}`}
                                    >
                                        MOB (+0)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleRunSimulation}
                            disabled={isRunning}
                            className={`py-4 rounded font-cinzel font-bold text-lg tracking-widest border transition-all relative overflow-hidden group mt-4
                                ${isRunning 
                                    ? 'bg-[#222] text-[#555] border-[#333] cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                                }
                            `}
                        >
                            {isRunning ? 'SIMULATING...' : 'ENGAGE'}
                            {isRunning && (
                                <div 
                                    className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all duration-100"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            )}
                        </button>

                        <div className="mt-auto border-t border-[#222] pt-4">
                            <div className="text-[10px] text-[#555] font-bold mb-2 uppercase tracking-widest">Input Stats</div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-[#aaa]">
                                <div className="flex justify-between"><span>Hit:</span> <span className="text-white font-mono">{stats.hit.toFixed(1)}%</span></div>
                                <div className="flex justify-between"><span>Crit:</span> <span className="text-white font-mono">{stats.crit.toFixed(1)}%</span></div>
                                <div className="flex justify-between"><span>Pwr:</span> <span className="text-white font-mono">{stats.sp || stats.ap}</span></div>
                                <div className="flex justify-between"><span>Haste:</span> <span className="text-white font-mono">{stats.haste}%</span></div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Results & Log */}
                    <div className="w-full md:w-2/3 lg:w-3/4 bg-[#0a0a0c] flex flex-col relative">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none"></div>

                        {error && (
                            <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm font-bold z-10 relative">
                                <div className="text-[10px] text-red-600 uppercase tracking-wider mb-1">Simulation Error</div>
                                {error}
                            </div>
                        )}

                        {result ? (
                            <div className="flex flex-col h-full z-10">
                                {/* METRICS DASHBOARD */}
                                <div className="p-6 border-b border-[#222] grid grid-cols-3 gap-4">
                                    <div className={`text-center p-4 bg-[#111] border rounded flex flex-col items-center justify-center transition-all ${primaryMetric === 'dps' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-[#222]'}`}>
                                        <div className="text-[10px] text-red-500 font-bold tracking-[0.3em] mb-1">DAMAGE</div>
                                        <div className={`text-4xl font-black font-mono tracking-tighter drop-shadow-md ${primaryMetric === 'dps' ? 'text-white' : 'text-[#888]'}`}>
                                            {result.dps.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[#555] font-bold tracking-widest">DPS</div>
                                    </div>
                                    <div className={`text-center p-4 bg-[#111] border rounded flex flex-col items-center justify-center transition-all ${primaryMetric === 'hps' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-[#222]'}`}>
                                        <div className="text-[10px] text-green-500 font-bold tracking-[0.3em] mb-1">HEALING</div>
                                        <div className={`text-4xl font-black font-mono tracking-tighter drop-shadow-md ${primaryMetric === 'hps' ? 'text-white' : 'text-[#888]'}`}>
                                            {result.hps.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[#555] font-bold tracking-widest">HPS</div>
                                    </div>
                                    <div className={`text-center p-4 bg-[#111] border rounded flex flex-col items-center justify-center transition-all ${primaryMetric === 'tps' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-[#222]'}`}>
                                        <div className="text-[10px] text-blue-400 font-bold tracking-[0.3em] mb-1">THREAT</div>
                                        <div className={`text-4xl font-black font-mono tracking-tighter drop-shadow-md ${primaryMetric === 'tps' ? 'text-white' : 'text-[#888]'}`}>
                                            {result.tps.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[#555] font-bold tracking-widest">TPS</div>
                                    </div>
                                </div>

                                {/* GRAPH AREA */}
                                <div className="px-6 py-4 h-32 w-full border-b border-[#222] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[#0a0a0c] opacity-50"></div>
                                    {graphData.length > 1 && (
                                        <svg viewBox={`0 0 ${duration} ${Math.max(...graphData.map(d => d.dps))}`} className="w-full h-full relative z-10" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <polyline 
                                                fill="none" 
                                                stroke="#ef4444" 
                                                strokeWidth="2" 
                                                points={graphData.map(d => `${d.time},${Math.max(...graphData.map(x => x.dps)) - d.dps}`).join(' ')} 
                                            />
                                            <polygon
                                                fill="url(#lineGrad)"
                                                points={`0,${Math.max(...graphData.map(x => x.dps))} ${graphData.map(d => `${d.time},${Math.max(...graphData.map(x => x.dps)) - d.dps}`).join(' ')} ${duration},${Math.max(...graphData.map(x => x.dps))}`}
                                                className="opacity-20"
                                            />
                                        </svg>
                                    )}
                                    <div className="absolute top-2 left-2 text-[9px] text-[#555] font-mono">DPS Timeline</div>
                                </div>

                                {/* Breakdown Grid */}
                                <div className="flex-1 overflow-hidden flex flex-col p-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                                        {/* Breakdown List */}
                                        <div className="bg-[#111] rounded border border-[#222] p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333]">
                                            <div className="flex justify-between items-center mb-3 border-b border-[#222] pb-2">
                                                <h4 className="text-[10px] text-[#888] font-bold uppercase tracking-wide">Ability Breakdown</h4>
                                                <div className="flex gap-4 text-[9px] font-bold text-[#555] uppercase tracking-wider w-36 text-right justify-end">
                                                    <span className="w-12 text-center">Dmg</span>
                                                    <span className="w-12 text-center">Heal</span>
                                                    <span className="w-12 text-center">Thr</span>
                                                </div>
                                            </div>
                                            
                                            {Object.entries(result.breakdown)
                                                .sort((a, b) => {
                                                    const valA = (a[1] as BreakdownData).damage + (a[1] as BreakdownData).healing + (a[1] as BreakdownData).threat;
                                                    const valB = (b[1] as BreakdownData).damage + (b[1] as BreakdownData).healing + (b[1] as BreakdownData).threat;
                                                    return valB - valA;
                                                })
                                                .map(([name, dataRaw]) => {
                                                const data = dataRaw as BreakdownData;
                                                return (
                                                    <div key={name} className="flex justify-between items-center mb-2 last:mb-0 text-xs py-1 hover:bg-[#1a1a1d] rounded px-1">
                                                        <div className="flex flex-col">
                                                            <span className="text-[#ccc] font-bold">{name}</span>
                                                            <span className="text-[9px] text-[#555]">{data.hits} Hits / {data.crits} Crits</span>
                                                        </div>
                                                        <div className="text-right flex gap-4 font-mono w-36 justify-end">
                                                            <span className={`w-12 text-center ${data.damage > 0 ? "text-red-400" : "text-[#333]"}`}>
                                                                {data.damage > 0 ? (data.damage > 1000 ? (data.damage/1000).toFixed(1) + 'k' : data.damage) : '-'}
                                                            </span>
                                                            <span className={`w-12 text-center ${data.healing > 0 ? "text-green-400" : "text-[#333]"}`}>
                                                                {data.healing > 0 ? (data.healing > 1000 ? (data.healing/1000).toFixed(1) + 'k' : data.healing) : '-'}
                                                            </span>
                                                            <span className={`w-12 text-center ${data.threat > 0 ? "text-blue-400" : "text-[#333]"}`}>
                                                                {data.threat > 0 ? (data.threat > 1000 ? (data.threat/1000).toFixed(1) + 'k' : Math.floor(data.threat)) : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Combat Log */}
                                        <div className="bg-[#111] rounded border border-[#222] flex flex-col overflow-hidden">
                                            <div className="bg-[#1a1a1d] px-3 py-2 text-[9px] text-[#666] font-bold uppercase tracking-wide border-b border-[#222]">Combat Log</div>
                                            <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 scrollbar-thin scrollbar-thumb-[#333]" ref={logRef}>
                                                {result.events.map((ev, i) => {
                                                    let typeColor = 'text-[#888]';
                                                    if (ev.type === 'crit') typeColor = 'text-red-400 font-bold';
                                                    if (ev.type.includes('heal')) typeColor = 'text-green-400';
                                                    
                                                    return (
                                                        <div key={i} className="flex gap-2 border-b border-[#1a1a1a] pb-1 mb-1 last:border-0">
                                                            <span className="text-[#444] min-w-[35px]">{(ev.timestamp).toFixed(1)}s</span>
                                                            <span className="text-[#aaa]">
                                                                {ev.source} <span className={typeColor}>[{ev.type}]</span>
                                                                <span className={`ml-1 ${typeColor === 'text-[#888]' ? 'text-[#ccc]' : 'text-white'}`}>
                                                                    {ev.amount}
                                                                </span> 
                                                                {ev.threat && ev.threat > 0 && (
                                                                    <span className="text-blue-900 ml-2 opacity-50">
                                                                        (T: {Math.floor(ev.threat)})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-[#333]">
                                <div className="text-4xl mb-4 opacity-20">⚔️</div>
                                <div className="text-xs font-cinzel font-bold tracking-widest opacity-50">READY TO SIMULATE</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
