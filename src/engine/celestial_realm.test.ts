import { describe, it, expect } from 'vitest';
import { calculateGalaxyIncome, calculateGalaxyBuffs } from './galaxy';
import { calculateDamageMultiplier } from './combat';
import type { GalaxySector } from './types';

describe('Celestial Realm Integration', () => {
    const mockGalaxy: GalaxySector[] = [
        { id: 'g1', name: 'Terra Nova', description: '', x: 0, y: 0, level: 1, difficulty: 1, reward: { type: 'global_gold', value: 0.1 }, isOwned: true, type: 'planet' },
        { id: 'g3', name: 'Crimson Moon', description: '', x: -20, y: 15, level: 1, difficulty: 1, reward: { type: 'global_damage', value: 0.1 }, isOwned: true, type: 'planet' },
        { id: 'g4', name: 'Void Outpost', description: '', x: 30, y: 30, level: 1, difficulty: 1, reward: { type: 'souls', value: 5 }, isOwned: true, type: 'nebula' },
        { id: 'g7', name: 'Stardust Nebula', description: '', x: 0, y: 60, level: 1, difficulty: 1, reward: { type: 'starlight', value: 1 }, isOwned: true, type: 'nebula' },
        { id: 'g13', name: 'Sirius B', description: '', x: -30, y: 40, level: 1, difficulty: 1, reward: { type: 'mithril', value: 10 }, isOwned: true, type: 'star' },
    ];

    it('should calculate correct income from owned sectors', () => {
        const income = calculateGalaxyIncome(mockGalaxy);
        expect(income.souls).toBe(5);
        expect(income.starlight).toBe(1);
        expect(income.mithril).toBe(10);
        expect(income.gold).toBe(0); // g1 has global_gold, not flat gold
    });

    it('should calculate correct global buffs', () => {
        const buffs = calculateGalaxyBuffs(mockGalaxy);
        expect(buffs.goldMult).toBe(0.1);
        expect(buffs.damageMult).toBe(0.1);
    });

    it('should apply galaxy damage multiplier to total damage', () => {
        const souls = 0;
        const talents: any[] = [];
        const constellations: any[] = [];
        const artifacts: any[] = [];
        const boss: any = { level: 1 };
        const cards: any[] = [];

        const baseMul = calculateDamageMultiplier(souls, talents, constellations, artifacts, boss, cards, [], [], 0);
        const buffedMul = calculateDamageMultiplier(souls, talents, constellations, artifacts, boss, cards, [], [], 0.1);

        expect(buffedMul).toBeCloseTo(baseMul * 1.1);
    });
});
