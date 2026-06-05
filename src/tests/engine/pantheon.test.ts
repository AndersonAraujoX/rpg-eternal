import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { processCombatTurn } from '../../engine/combat';
import type { Hero, Boss } from '../../engine/types';
import * as weatherModule from '../../engine/weather';

// Fix day phase for consistency
vi.spyOn(weatherModule, 'getDayNightPhase').mockReturnValue('day');

beforeAll(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0); // force boss to always attack (0.0 < 0.3) and avoid other randomness
});

afterAll(() => {
    vi.restoreAllMocks();
});

const mockHero = (classType: string, stats: Partial<Hero['stats']> = {}, hp?: number): Hero => ({
    id: 'h1',
    name: 'Hero Test',
    class: classType as any,
    stats: { hp: hp ?? 100, maxHp: 100, attack: 20, defense: 50, magic: 0, speed: 10, mp: 0, maxMp: 0, ...stats },
    element: 'neutral',
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

const mockBoss = (attack: number): Boss => ({
    id: 'b1',
    name: 'Boss Test',
    type: 'boss',
    level: 1,
    stats: { hp: 1000, maxHp: 1000, attack, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
    isDead: false,
    element: 'neutral',
    emoji: '👹'
});

describe('Panteão da Eternidade (Monuments Mechanics)', () => {
    it('applies defense multiplier correctly to mitigate boss damage', () => {
        const hero = mockHero('Warrior', { defense: 50 });
        const boss = mockBoss(40); // boss attack 40 -> bossDmg = (40 * 2) - 50 = 30 dmg without monuments

        // Without monuments
        const turn1 = processCombatTurn([hero], boss, 1, 0, false, []);
        expect(turn1.updatedHeroes[0].stats.hp).toBe(70); // 100 - 30 = 70

        // With monument offering +20% defense
        const monumentEffects = { defense: 1.2, speed: 1.0, maxHp: 1.0, lifesteal: 0.0 };
        // defense = 50 * 1.2 = 60. bossDmg = (40 * 2) - 60 = 20 dmg.
        const turn2 = processCombatTurn([hero], boss, 1, 0, false, [], 1000, 1, [], undefined, undefined, undefined, 0, undefined, monumentEffects);
        expect(turn2.updatedHeroes[0].stats.hp).toBe(80); // 100 - 20 = 80
    });

    it('applies lifesteal (vampirism) correctly to restore hero hp', () => {
        // Hero starts at 50 hp
        const hero = mockHero('Warlock', { attack: 20, defense: 1000 }, 50); // very high defense to minimize boss damage (takes min 1 dmg)
        const boss = mockBoss(10); // bossDmg = (10 * 2) - 1000 = -980 -> capped at 1 dmg

        // Without lifesteal
        const turn1 = processCombatTurn([hero], boss, 1, 0, false, []);
        // Hero deals baseDmg = 20. takes 1 dmg. final hp should be 50 - 1 = 49.
        expect(turn1.updatedHeroes[0].stats.hp).toBe(49);

        // With 10% lifesteal from monument
        const monumentEffects = { defense: 1.0, speed: 1.0, maxHp: 1.0, lifesteal: 0.10 };
        // Hero deals 20 damage, heals 20 * 0.10 = 2 hp. takes 1 dmg. final hp should be 50 - 1 + 2 = 51.
        const turn2 = processCombatTurn([hero], boss, 1, 0, false, [], 1000, 1, [], undefined, undefined, undefined, 0, undefined, monumentEffects);
        expect(turn2.updatedHeroes[0].stats.hp).toBe(51);
    });

    it('scales maxHp in calculations within processCombatTurn', () => {
        // Test that monument maxHp is scaled and used
        // When monument maxHp is increased, lifesteal heal limit is higher.
        // We can also test that blood curse damage (which is 1% of maxHp) scales accordingly.
        const hero = {
            ...mockHero('Necromancer', { hp: 50, maxHp: 100, defense: 1000 }),
            curses: ['blood']
        };
        const boss = mockBoss(10); // takes 1 dmg

        // Without monument: stats.maxHp is 100. Blood curse loses 1% * 100 = 1 hp. Total loses = 1 (boss) + 1 (curse) = 2. final hp = 48.
        const turn1 = processCombatTurn([hero], boss, 1, 0, false, []);
        expect(turn1.updatedHeroes[0].stats.hp).toBe(48);

        // With monument maxHp multiplier of 2.0: stats.maxHp becomes 200. Curse loses 1% * 200 = 2 hp. Total loses = 1 (boss) + 2 (curse) = 3. final hp = 47.
        const monumentEffects = { defense: 1.0, speed: 1.0, maxHp: 2.0, lifesteal: 0.0 };
        const turn2 = processCombatTurn([hero], boss, 1, 0, false, [], 1000, 1, [], undefined, undefined, undefined, 0, undefined, monumentEffects);
        expect(turn2.updatedHeroes[0].stats.hp).toBe(47);
    });
});
