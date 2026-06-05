import { describe, it, expect, vi } from 'vitest';
import { calculateDamageMultiplier, processCombatTurn } from '../../engine/combat';
import type { Hero, Boss } from '../../engine/types';
import * as weatherModule from '../../engine/weather';

// Force 'day' phase to keep test stable
vi.spyOn(weatherModule, 'getDayNightPhase').mockReturnValue('day');

const mockHero = (element: Hero['element'], attack: number): Hero => ({
    id: 'h1',
    name: 'Test Hero',
    class: 'Warrior',
    stats: { hp: 100, maxHp: 100, attack, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
    element,
    assignment: 'combat',
    insanity: 0,
    emoji: '🦸',
    type: 'hero',
    unlocked: true,
    isDead: false,
    level: 1,
    xp: 0,
    maxXp: 100,
    statPoints: 0,
    skills: [],
    fatigue: 0,
    maxFatigue: 100
});

const mockBoss = (element: Boss['element']): Boss => ({
    id: 'b1',
    name: 'Test Boss',
    type: 'boss',
    level: 1,
    stats: { hp: 1000, maxHp: 1000, attack: 10, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
    isDead: false,
    element,
    emoji: '👹'
});

describe('Combat Negative Damage Safety Checks', () => {
    it('should not allow negative damage multipliers', () => {
        // Souls is extremely negative (-1000)
        const mult = calculateDamageMultiplier(-1000, [], [], [], mockBoss('neutral'), [], [], [], -5.0);
        // It should be bounded by Math.max(0.1, ...)
        expect(mult).toBeGreaterThanOrEqual(0.1);
    });

    it('should not allow negative damage output from processCombatTurn', () => {
        const hero = mockHero('neutral', -100); // Negative attack value
        const boss = mockBoss('neutral');
        
        // Even with negative attack or negative damage multiplier
        const { totalDmg } = processCombatTurn([hero], boss, -2.0, 0, false, []);
        
        // Damage must be bounded by Math.max(0, ...)
        expect(totalDmg).toBeGreaterThanOrEqual(0);
    });

    it('should handle pets correctly without causing negative damage', () => {
        const hero = mockHero('neutral', 10);
        const boss = mockBoss('neutral');
        const mockPet = {
            id: 'p1',
            name: 'Negative Pet',
            class: 'dps',
            stats: { hp: 10, maxHp: 10, attack: -50, defense: 0, magic: 0, speed: 10 },
            level: 1,
            xp: 0,
            maxXp: 100,
            emoji: '🐱',
            bonus: 'Attack',
            isDead: false
        };
        
        const { totalDmg } = processCombatTurn([hero], boss, 1.0, 0, false, [mockPet as any]);
        
        // Total damage should still be >= 0
        expect(totalDmg).toBeGreaterThanOrEqual(0);
    });
});
