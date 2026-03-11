import { describe, it, expect } from 'vitest';
import { PRESTIGE_NODES } from '../components/modals/PrestigeTreeModal';

describe('Prestige System Logic', () => {
    it('calculates soul gain correctly based on boss level', () => {
        const bossLevel = 50;
        const prestigeNodes = { 'souls_1': 2 }; // +20% per level = +40%
        const soulsGained = Math.floor(bossLevel / 5) * (1 + (prestigeNodes['souls_1'] || 0) * 0.2);
        // (50 / 5) * (1 + 2 * 0.2) = 10 * 1.4 = 14
        expect(soulsGained).toBe(14);
    });

    it('calculates prestige multipliers correctly', () => {
        const prestigeNodes = {
            'atk_1': 5, // +10% per level = +50%
            'hp_1': 3,  // +10% per level = +30%
            'gold_1': 2 // +15% per level = +30%
        };

        const prestigeAtkMult = 1 + (prestigeNodes['atk_1'] || 0) * 0.1;
        const prestigeHpMult = 1 + (prestigeNodes['hp_1'] || 0) * 0.1;
        const prestigeGoldMult = 1 + (prestigeNodes['gold_1'] || 0) * 0.15;

        expect(prestigeAtkMult).toBe(1.5);
        expect(prestigeHpMult).toBe(1.3);
        expect(prestigeGoldMult).toBe(1.3);
    });

    it('validates prestige node structure', () => {
        expect(PRESTIGE_NODES.length).toBeGreaterThan(0);
        const firstNode = PRESTIGE_NODES[0];
        expect(firstNode).toHaveProperty('id');
        expect(firstNode).toHaveProperty('name');
        expect(firstNode).toHaveProperty('baseCost');
    });
});

describe('Party Power Calculation', () => {
    it('sums stats from unlocked heroes correctly', () => {
        const mockHeroes = [
            {
                unlocked: true, isDead: false,
                stats: { attack: 10, maxHp: 100, magic: 5, defense: 5 }
            },
            {
                unlocked: true, isDead: false,
                stats: { attack: 20, maxHp: 200, magic: 10, defense: 10 }
            },
            {
                unlocked: false, isDead: false,
                stats: { attack: 100, maxHp: 1000, magic: 50, defense: 50 }
            }
        ];

        const calculatedPartyPower = mockHeroes.filter(h => h.unlocked && !h.isDead).reduce((sum, h) => {
            return sum + (h.stats.attack || 0) + Math.floor((h.stats.maxHp || 0) / 10) + (h.stats.magic || 0) + (h.stats.defense || 0);
        }, 0);

        // Hero 1: 10 + (100/10) + 5 + 5 = 10 + 10 + 5 + 5 = 30
        // Hero 2: 20 + (200/10) + 10 + 10 = 20 + 20 + 10 + 10 = 60
        // Total: 30 + 60 = 90
        expect(calculatedPartyPower).toBe(90);
    });
});
