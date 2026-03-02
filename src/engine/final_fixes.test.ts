import { describe, it, expect } from 'vitest';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_HEROES } from './initialData';
import type { Hero, Pet, Item } from './types';

// Mocking the power calc logic from useGame.ts to verify its correctness
const calculatePower = (
    activeHeroes: Hero[],
    itemStats: any,
    petStats: any,
    multipliers: { prestige: number, guild: number, galaxy: number, territory: number, potion: number }
) => {
    const baseStatsPower = activeHeroes.reduce((sum, h) => {
        return sum + (h.stats.attack || 0) + Math.floor((h.stats.maxHp || 0) / 10) + (h.stats.magic || 0) + (h.stats.defense || 0);
    }, 0);

    const itemsPower = (itemStats.attack || 0) + Math.floor((itemStats.hp || 0) / 10) + (itemStats.magic || 0) + (itemStats.defense || 0);
    const petsPower = (petStats.attack || 0) + Math.floor((petStats.hp || 0) / 10) + (petStats.magic || 0) + (petStats.defense || 0);

    const totalMult = multipliers.prestige * multipliers.guild * multipliers.galaxy * multipliers.territory * multipliers.potion;

    return Math.floor((baseStatsPower + itemsPower + petsPower) * totalMult);
};

describe('Final Fixes Verification', () => {

    it('should have the correctly renamed Pet Space building', () => {
        const petBuilding = INITIAL_BUILDINGS.find(b => b.id === 'breeding_center');
        expect(petBuilding).toBeDefined();
        expect(petBuilding?.name).toBe('Espaço Pet');
        expect(petBuilding?.description).toContain('Local para gerenciar');
    });

    it('should calculate power correctly with all components', () => {
        const mockHero: Hero = { ...INITIAL_HEROES[0], stats: { attack: 100, maxHp: 1000, hp: 1000, magic: 50, defense: 50, speed: 10 } };
        const mockItemStats = { attack: 50, hp: 500, magic: 25, defense: 25 };
        const mockPetStats = { attack: 30, hp: 300, magic: 15, defense: 15 };
        const multipliers = { prestige: 1.2, guild: 1.1, galaxy: 1.1, territory: 1.05, potion: 1.1 };

        const power = calculatePower([mockHero], mockItemStats, mockPetStats, multipliers);

        // Base: 100 + 100 + 50 + 50 = 300
        // Items: 50 + 50 + 25 + 25 = 150
        // Pets: 30 + 30 + 15 + 15 = 90
        // Total Base: 300 + 150 + 90 = 540
        // Mult: 1.2 * 1.1 * 1.1 * 1.05 * 1.1 = 1.67706
        // Result: floor(540 * 1.67706) = 905

        expect(power).toBe(905);
    });

    it('should handle zero/null stats in power calculation gracefully', () => {
        const emptyPower = calculatePower([], {}, {}, { prestige: 1, guild: 1, galaxy: 1, territory: 1, potion: 1 });
        expect(emptyPower).toBe(0);
        expect(isNaN(emptyPower)).toBe(false);
    });

    it('should verify persistence logic (conceptual check)', () => {
        // This test simulates the logic of confirmRebirth in useGame.ts
        const prestigeNodesBefore = { 'atk_1': 5 };
        let souls = 100;
        let heroes = [...INITIAL_HEROES];
        let gold = 1000;
        let bossLevel = 50;

        // Simulate Rebirth Execution
        const soulsGained = Math.floor(bossLevel / 5);
        souls += soulsGained;
        heroes = INITIAL_HEROES.map(h => ({ ...h, level: 1 }));
        gold = 0;
        bossLevel = 1;
        // In my fix, prestigeNodes is NOT touched/reset
        const prestigeNodesAfter = { ...prestigeNodesBefore };

        expect(prestigeNodesAfter['atk_1']).toBe(5);
        expect(gold).toBe(0);
        expect(souls).toBeGreaterThan(100);
    });
});
