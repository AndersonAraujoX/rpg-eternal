import { describe, it, expect } from 'vitest';
import { processCombatTurn } from './combat';
import type { Hero, Boss } from './types';

// Mocks
const mockHero = (element: Hero['element']): Hero => ({
    id: 'h1', name: 'Test', class: 'Warrior', stats: { hp: 100, maxHp: 100, attack: 10, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
    element, assignment: 'combat', gambits: [], insanity: 0,
    emoji: '🦸', type: 'hero', unlocked: true, isDead: false,
    level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [],
    fatigue: 0, maxFatigue: 100,
    equipment: {}
});

const mockBoss = (element: Boss['element']): Boss => ({
    id: 'b1', name: 'Test Boss', type: 'boss', level: 1, stats: { hp: 1000, maxHp: 1000, attack: 10, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
    isDead: false, element, emoji: '👹'
});

describe('Elemental Synergy', () => {
    it('Fire deals extra damage to Nature', () => {
        const hero = mockHero('fire');
        const boss = mockBoss('nature');
        const { totalDmg } = processCombatTurn([hero], boss, 1, 0, false, []);
        // Base atk 10 * 1.5 = 15
        expect(totalDmg).toBe(15);
    });

    it('Fire deals reduced damage to Water', () => {
        const hero = mockHero('fire');
        const boss = mockBoss('water');
        const { totalDmg } = processCombatTurn([hero], boss, 1, 0, false, []);
        // Base atk 10 * 0.5 = 5
        expect(totalDmg).toBe(5);
    });

    it('Light and Dark deal extra damage to each other', () => {
        let hero = mockHero('light');
        let boss = mockBoss('dark');
        let { totalDmg } = processCombatTurn([hero], boss, 1, 0, false, []);
        expect(totalDmg).toBe(15);

        hero = mockHero('dark');
        boss = mockBoss('light');
        totalDmg = processCombatTurn([hero], boss, 1, 0, false, []).totalDmg;
        expect(totalDmg).toBe(15);
    });

    it('Neutral is neutral', () => {
        const hero = mockHero('neutral');
        const boss = mockBoss('fire');
        const { totalDmg } = processCombatTurn([hero], boss, 1, 0, false, []);
        expect(totalDmg).toBe(10);
    });
});

import { calculateDamageMultiplier } from './combat';

describe('calculateDamageMultiplier', () => {
    it('scales linearly with souls and divinity', () => {
        // Base is 1. Souls * 0.05 + Div * 1.0
        const mult = calculateDamageMultiplier(100, 2, [], [], [], mockBoss('neutral'), [], [], []);
        // 1 + (100 * 0.05) + (2 * 1.0) = 1 + 5 + 2 = 8
        expect(mult).toBe(8);
    });

    it('applies Void Stone artifact multiplier', () => {
        const artifacts = [{ id: 'a2', name: 'Void Stone', description: '', isEquipped: false }];
        const mult = calculateDamageMultiplier(0, 0, [], [], artifacts as any, mockBoss('neutral'), [], [], []);
        expect(mult).toBe(1.5);
    });

    it('applies Monster Card bonuses', () => {
        const cards = [{ id: 'c1', name: 'Goblin', stat: 'attack', value: 0.1, count: 5, rarity: 'common', maxCount: 10, dropRate: 0.1, location: '' }];
        const mult = calculateDamageMultiplier(0, 0, [], [], [], mockBoss('neutral'), cards as any, [], []);
        // Card bonus: 5 * 0.1 = 0.5. Total: 1 * (1 + 0.5) = 1.5
        expect(mult).toBe(1.5);
    });
});

describe('Skill Execution & Mutators', () => {
    it('executes damage skills correctly', () => {
        const hero = mockHero('neutral');
        hero.skills = [{
            id: 's1', name: 'Slash', type: 'active', effectType: 'damage',
            value: 2.0, cooldown: 0, currentCooldown: 0, requiredLevel: 1, element: 'neutral'
        }] as any;
        const { totalDmg } = processCombatTurn([hero], mockBoss('neutral'), 1, 0, false, []);
        // Base atk 10 + Skill 10 * 2.0 = 30
        expect(totalDmg).toBe(30);
    });

    it('executes healing skills correctly', () => {
        const hero = mockHero('neutral');
        hero.stats.hp = 10;
        hero.skills = [{
            id: 's2', name: 'Heal', type: 'active', effectType: 'heal',
            value: 100, cooldown: 0, currentCooldown: 0, element: 'light'
        }] as any;
        const { updatedHeroes, totalDmg } = processCombatTurn([hero], mockBoss('neutral'), 1, 0, false, []);
        // Base atk 10. Healing is separate.
        expect(totalDmg).toBe(10);
        expect(updatedHeroes[0].stats.hp).toBe(100); // Max HP is 100
    });

    it('mutator: bloodthirst converts heal to damage', () => {
        const hero = mockHero('neutral');
        hero.skills = [{
            id: 's2', name: 'Heal', type: 'active', effectType: 'heal',
            value: 100, cooldown: 0, currentCooldown: 0, element: 'light'
        }] as any;
        const bloodthirst = { id: 'bloodthirst', name: 'Bloodthirst', description: '', type: 'logic' };

        const { totalDmg } = processCombatTurn([hero], mockBoss('dark'), 1, 0, false, [], 1000, 1, [], undefined, bloodthirst as any);

        // Base atk: 10. (Neutral vs Dark = 10)
        // Skill value: 100. Converted to dmg: 100 * 1.5 = 150.
        // Skill element (light) vs Boss (dark) multiplier = 1.5. 
        // Skill Base Dmg: 10 * 150 * 1.5 = 2250.
        // Total = 10 + 2250 = 2260.
        expect(totalDmg).toBe(2260);
    });
});
