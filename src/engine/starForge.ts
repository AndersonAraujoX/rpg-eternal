import type { ItemAffix } from './types';

const PREFIXES: ItemAffix[] = [
    { id: 'p1', tier: 1, type: 'stats', name: 'Burning', value: 0.1, stat: 'attack' },
    { id: 'p2', tier: 1, type: 'stats', name: 'Frozen', value: 0.1, stat: 'defense' },
    { id: 'p3', tier: 1, type: 'stats', name: 'Void', value: 0.15, stat: 'magic' },
    { id: 'p4', tier: 1, type: 'stats', name: 'Stellar', value: 0.1, stat: 'speed' },
    { id: 'p5', tier: 1, type: 'stats', name: 'Cosmic', value: 0.05, stat: 'hp' }, // 5% all stats logic handled elsewhere or specific stat
    { id: 'p6', tier: 1, type: 'stats', name: 'Radiant', value: 0.15, stat: 'hp' },
    { id: 'p7', tier: 1, type: 'effect', name: 'Unstable', value: 0.2, stat: 'attack' } // High risk high reward? For now just stats
];

const SUFFIXES: ItemAffix[] = [
    { id: 's1', tier: 1, type: 'stats', name: 'of the Comet', value: 0.1, stat: 'speed' },
    { id: 's2', tier: 1, type: 'stats', name: 'of the Nebula', value: 0.15, stat: 'mp' },
    { id: 's3', tier: 1, type: 'stats', name: 'of the Black Hole', value: 0.05, stat: 'attack' }, // Crit logic later
    { id: 's4', tier: 1, type: 'stats', name: 'of the Supernova', value: 0.2, stat: 'attack' },
    { id: 's5', tier: 1, type: 'stats', name: 'of the Pulsar', value: 0.1, stat: 'magic' },
    { id: 's6', tier: 1, type: 'stats', name: 'of the Titan', value: 0.2, stat: 'defense' }
];

export const generateAffixes = (_itemLevel: number, _rarity: string): { prefix?: ItemAffix, suffix?: ItemAffix } => {
    const hasPrefix = Math.random() > 0.5;
    const hasSuffix = Math.random() > 0.5;

    let prefix: ItemAffix | undefined;
    let suffix: ItemAffix | undefined;

    if (hasPrefix || !hasSuffix) { // Ensure at least one if possible, or just random
        const p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
        // Scale value by item level or keep flat %? Flat % is better for "Affix" logic usually.
        // But maybe higher tiers have higher % bounds.
        prefix = { ...p };
    }

    if (hasSuffix) {
        const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        suffix = { ...s };
    }

    return { prefix, suffix };
};

export const calculateCraftingResult = (accuracy: number, heat: number): number => {
    // accuracy: 0-1 (how close to center of target)
    // heat: 0-1 (ideally 1.0 is max heat but sweet spot might be 0.7-0.9)

    // Simple logic for now: Accuracy is key.
    // If accuracy > 0.9 -> Excellent (90-100 quality)
    // If accuracy > 0.7 -> Good (70-89)
    // Else -> Poor (10-69)

    let baseQuality = accuracy * 100;

    // Bonus for heat sweet spot (0.8 - 0.9)
    if (heat >= 0.8 && heat <= 0.95) {
        baseQuality += 10;
    }

    return Math.min(100, Math.floor(baseQuality));
};
export const mysticReforge = (item: import('./types').Item): import('./types').Item => {
    if (item.rarity !== 'legendary' && item.rarity !== ('chimera' as any)) return item;

    const { prefix, suffix } = generateAffixes(item.level || 1, item.rarity);
    return {
        ...item,
        prefix,
        suffix,
        quality: calculateCraftingResult(Math.random(), Math.random()) // Randomize quality on reforge too
    };
};
