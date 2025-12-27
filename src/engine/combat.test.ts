import { describe, it, expect } from 'vitest';
import { processCombatTurn } from './combat';
import type { Hero, Boss } from './types';

// Mocks
const mockHero = (element: any): Hero => ({
    id: 'h1', name: 'Test', class: 'Warrior', stats: { hp: 100, maxHp: 100, attack: 10, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
    isDead: false, unlocked: true, element, assignment: 'combat', gambits: [], corruption: false, emoji: '🦸', type: 'hero'
});

const mockBoss = (element: any): Boss => ({
    id: 'b1', name: 'Test Boss', type: 'boss', level: 1, stats: { hp: 1000, maxHp: 1000, attack: 10, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
    isDead: false, element, emoji: '👹'
});

describe('Elemental Synergy', () => {
    it('Fire deals extra damage to Nature', () => {
        const hero = mockHero('fire');
        const boss = mockBoss('nature');
        const { totalDmg } = processCombatTurn([hero], boss, 1, 0, false, null);
        // Base atk 10 * 1.5 = 15
        expect(totalDmg).toBe(15);
    });

    it('Fire deals reduced damage to Water', () => {
        const hero = mockHero('fire');
        const boss = mockBoss('water');
        const { totalDmg } = processCombatTurn([hero], boss, 1, 0, false, null);
        // Base atk 10 * 0.5 = 5
        expect(totalDmg).toBe(5);
    });

    it('Light and Dark deal extra damage to each other', () => {
        let hero = mockHero('light');
        let boss = mockBoss('dark');
        let res = processCombatTurn([hero], boss, 1, 0, false, null);
        expect(res.totalDmg).toBe(15);

        hero = mockHero('dark');
        boss = mockBoss('light');
        res = processCombatTurn([hero], boss, 1, 0, false, null);
        expect(res.totalDmg).toBe(15);
    });

    it('Neutral is neutral', () => {
        const hero = mockHero('neutral');
        const boss = mockBoss('fire');
        const { totalDmg } = processCombatTurn([hero], boss, 1, 0, false, null);
        expect(totalDmg).toBe(10);
    });
});
