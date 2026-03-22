import { describe, it, expect } from 'vitest';
import { Hero } from './types';

// Mock function representing the logic in useGame.ts
function simulateHeroAwakening(hero: Hero): Hero {
    if (hero.level < 100 || hero.isAwakened) return hero;

    return {
        ...hero,
        isAwakened: true,
        awakeningTitle: 'Desperto',
        level: 100, // Cap
        stats: {
            ...hero.stats,
            maxHp: Math.floor(hero.stats.maxHp * 1.5),
            hp: Math.floor(hero.stats.maxHp * 1.5),
            attack: Math.floor(hero.stats.attack * 1.5),
            defense: Math.floor(hero.stats.defense * 1.5),
            magic: Math.floor(hero.stats.magic * 1.5)
        }
    };
}

describe('Hero Awakening System (Limit Break)', () => {
    const mockHero: Hero = {
        id: 'h1',
        name: 'Grom',
        class: 'Warrior',
        emoji: '⚔️',
        unlocked: true,
        isDead: false,
        element: 'fire',
        assignment: 'none',
        insanity: 0,
        level: 100,
        xp: 0,
        maxXp: 1000,
        fatigue: 0,
        maxFatigue: 100,
        statPoints: 0,
        stats: {
            hp: 1000,
            maxHp: 1000,
            mp: 100,
            maxMp: 100,
            attack: 100,
            defense: 100,
            magic: 10,
            speed: 10
        },
        skills: []
    };

    it('successfully awakens a level 100 hero', () => {
        const awakened = simulateHeroAwakening(mockHero);

        expect(awakened.isAwakened).toBe(true);
        expect(awakened.awakeningTitle).toBe('Desperto');
        expect(awakened.stats.attack).toBe(150); // 100 * 1.5
        expect(awakened.stats.maxHp).toBe(1500); // 1000 * 1.5
    });

    it('does not awaken a hero below level 100', () => {
        const lowLevelHero = { ...mockHero, level: 99 };
        const result = simulateHeroAwakening(lowLevelHero);

        expect(result.isAwakened).toBeUndefined();
    });

    it('does not double awaken a hero', () => {
        const alreadyAwakened = { ...mockHero, isAwakened: true, stats: { ...mockHero.stats, attack: 150 } };
        const result = simulateHeroAwakening(alreadyAwakened);

        expect(result.stats.attack).toBe(150); // Should not increase again
    });
});
