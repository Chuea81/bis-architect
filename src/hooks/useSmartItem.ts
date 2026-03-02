
import { useMemo } from 'react';
import { Item, RealmType, SmartItem, ItemCore, StatBlock, ResistanceBlock, SpecName, ClassName, StatWeights, AggregatedStats } from '../types';
import { calculateGearScore } from '../services/gearService';

// 1. Move static data OUTSIDE the hook to prevent re-creation
const Q_MAP: Record<string, number> = { 'poor': 0, 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5 };

// 2. Normalization Helper — No-op now that hydrator outputs canonical short keys.
// Kept as a passthrough for safety in case any raw data bypasses hydration.
const normalizeStats = (stats: StatBlock | undefined): StatBlock => {
    if (!stats) return {};
    return { ...stats };
};

export const useSmartItem = (
    rawItem: Item, 
    gameMode: RealmType,
    spec?: SpecName,
    currentClass?: ClassName,
    customWeights?: StatWeights,
    currentStats?: AggregatedStats
): SmartItem => {
  return useMemo(() => {
    // 3. Fast Bailout: Calculate "Is Modified" boolean immediately
    const hasTurtleOverride = gameMode === 'Turtle' && !!rawItem.turtle;

    // Normalize Quality (Safe lookup without creating new object)
    let quality = rawItem.quality;
    if (quality === undefined) {
        quality = rawItem.rarity ? (Q_MAP[rawItem.rarity.toLowerCase()] ?? 1) : 1;
    }

    // Weapon Stats
    let speed = Number(rawItem.speed || (rawItem as any).delay || 0);
    if (speed > 100) speed /= 1000;

    const minDmg = Number(rawItem.minDmg || rawItem.min_damage || 0);
    const maxDmg = Number(rawItem.maxDmg || rawItem.max_damage || 0);
    
    let dps = Number(rawItem.dps || 0);
    if (dps === 0 && speed > 0 && minDmg > 0 && maxDmg > 0) {
        dps = ((minDmg + maxDmg) / 2) / speed;
    }

    // --- TRANSLATION LAYER: Apply Normalization ---
    const activeStats = normalizeStats(rawItem.stats);

    // Construct Base Props (Classic)
    const baseProps: ItemCore = {
      name: rawItem.name,
      slot: rawItem.slot,
      quality: quality,
      icon: rawItem.icon || "inv_misc_questionmark",
      dps: dps,
      stats: activeStats,
      resistances: rawItem.resistances || {},
      effects: rawItem.effects || [],
      use_effect: rawItem.use_effect,
      speed: speed,
      minDmg: minDmg, 
      maxDmg: maxDmg,
      req_level: rawItem.minLevel ?? rawItem.req_level,
      special_effects: rawItem.special_effects,
      // New Schema Passthrough
      equipEffect: rawItem.equipEffect,
      procEffect: rawItem.procEffect,
      useEffect: rawItem.useEffect,
      droppedBy: rawItem.droppedBy,
      zone: rawItem.zone || rawItem.source // Fallback mapping
    };

    // Calculate Gear Score using context if available
    baseProps.gearScore = calculateGearScore(baseProps, spec, customWeights, currentStats, currentClass);

    // 4. OPTIMIZED PATH: If no override (95% of items), return immediately
    if (!hasTurtleOverride) {
      return {
        id: rawItem.id || 'unknown',
        source: rawItem.source || 'Unknown',
        props: baseProps,
        diffs: { dps: 0, stats: {}, resistances: {} },
        isModified: false
      };
    }

    // --- TURTLE LOGIC (Only runs if needed) ---
    // Apply normalization to turtle overrides too
    const turtleStats = normalizeStats(rawItem.turtle?.stats);

    const activeProps: ItemCore = {
        ...baseProps,
        ...rawItem.turtle,
        stats: { ...baseProps.stats, ...turtleStats },
        resistances: { ...baseProps.resistances, ...(rawItem.turtle?.resistances || {}) },
        effects: rawItem.turtle?.effects || baseProps.effects,
        use_effect: rawItem.turtle?.use_effect || baseProps.use_effect,
        speed: rawItem.turtle?.speed !== undefined ? Number(rawItem.turtle.speed) : baseProps.speed,
        minDmg: rawItem.turtle?.minDmg !== undefined ? Number(rawItem.turtle.minDmg) : baseProps.minDmg,
        maxDmg: rawItem.turtle?.maxDmg !== undefined ? Number(rawItem.turtle.maxDmg) : baseProps.maxDmg,
        req_level: rawItem.turtle?.req_level !== undefined ? rawItem.turtle.req_level : baseProps.req_level,
        special_effects: rawItem.turtle?.special_effects || baseProps.special_effects,
        // Passthrough overrides
        equipEffect: rawItem.turtle?.equipEffect || baseProps.equipEffect,
        procEffect: rawItem.turtle?.procEffect || baseProps.procEffect,
        useEffect: rawItem.turtle?.useEffect || baseProps.useEffect,
        droppedBy: rawItem.turtle?.droppedBy || baseProps.droppedBy,
        zone: rawItem.turtle?.zone || baseProps.zone
    };

    // Calculate Gear Score for active (Turtle) with context
    activeProps.gearScore = calculateGearScore(activeProps, spec, customWeights, currentStats, currentClass);

    // 5. Zero-Allocation Diffing
    const diffs = {
      dps: 0,
      stats: {} as StatBlock,
      resistances: {} as ResistanceBlock,
    };

    const dpsDiff = activeProps.dps - baseProps.dps;
    if (Math.abs(dpsDiff) > 0.01) diffs.dps = dpsDiff;

    for (const key in activeProps.stats) {
        const v1 = baseProps.stats[key] || 0;
        const v2 = activeProps.stats[key] || 0;
        if (v1 !== v2) diffs.stats[key] = v2 - v1;
    }
    
    for (const key in activeProps.resistances) {
        const k = key as keyof ResistanceBlock;
        const v1 = baseProps.resistances[k] || 0;
        const v2 = activeProps.resistances[k] || 0;
        if (v1 !== v2) diffs.resistances[k] = v2 - v1;
    }

    return {
      id: rawItem.id || 'unknown',
      source: rawItem.source || 'Unknown',
      props: activeProps,
      diffs,
      isModified: true
    };

  }, [rawItem, gameMode, spec, currentClass, customWeights, currentStats]);
};
