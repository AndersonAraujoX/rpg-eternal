import { describe, it, expect } from 'vitest';
import { INITIAL_HEROES } from './initialData';
import type { Hero } from './types';

// Simplified version of the logic in useGame.ts
const getActiveHeroes = (heroes: Hero[]) => {
    return (heroes || []).filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked);
};

const calculatePower = (
    activeHeroes: Hero[],
    itemStats: any,
    petStats: any,
    totalAtkMult: number
) => {
    const baseStats = activeHeroes.reduce((sum, h) => {
        return sum + (h.stats.attack || 0) + Math.floor((h.stats.maxHp || 0) / 10) + (h.stats.magic || 0) + (h.stats.defense || 0);
    }, 0);

    const itemsPower = (itemStats.attack || 0) + Math.floor((itemStats.hp || 0) / 10) + (itemStats.magic || 0) + (itemStats.defense || 0);
    const petsPower = (petStats.attack || 0) + Math.floor((petStats.hp || 0) / 10) + (petStats.magic || 0) + (petStats.defense || 0);

    return Math.floor((baseStats + itemsPower + petsPower) * totalAtkMult);
};

describe('Hero and Power Logic', () => {
    it('should correctly identify active combat heroes', () => {
        const heroes: Hero[] = [
            { ...INITIAL_HEROES[0], unlocked: true, assignment: 'combat', isDead: false }, // Warrior
            { ...INITIAL_HEROES[1], unlocked: false, assignment: 'combat', isDead: false }, // Mage (Locked)
            { ...INITIAL_HEROES[2], unlocked: true, assignment: 'none', isDead: false }, // Healer (Not in combat)
            { ...INITIAL_HEROES[3], unlocked: true, assignment: 'combat', isDead: true }, // Rogue (Dead)
        ];

        const active = getActiveHeroes(heroes);
        expect(active.length).toBe(1);
        expect(active[0].id).toBe('h1');
    });

    it('should calculate power with multiple active heroes', () => {
        const activeHeroes: Hero[] = [
            { ...INITIAL_HEROES[0], stats: { attack: 10, maxHp: 100, hp: 100, magic: 5, defense: 5, speed: 10 } },
            { ...INITIAL_HEROES[1], stats: { attack: 5, maxHp: 50, hp: 50, magic: 15, defense: 2, speed: 10 } }
        ];

        // Hero 1 base: 10 + 10 + 5 + 5 = 30
        // Hero 2 base: 5 + 5 + 15 + 2 = 27
        // Total Base: 57

        const itemStats = { attack: 10, hp: 100, magic: 5, defense: 5 }; // Power: 10 + 10 + 5 + 5 = 30
        const petStats = { attack: 5, hp: 50, magic: 2, defense: 1 }; // Power: 5 + 5 + 2 + 1 = 13

        const power = calculatePower(activeHeroes, itemStats, petStats, 1.2);
        // (57 + 30 + 13) * 1.2 = 100 * 1.2 = 120
        expect(power).toBe(120);
    });

    it('should handle empty active heroes', () => {
        const power = calculatePower([], {}, {}, 1.5);
        expect(power).toBe(0);
    });
});
