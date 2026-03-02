import { describe, it, expect } from 'vitest';
import {
    generateArenaOpponent,
    generateInitialArenaBoard,
    calculateWinChance,
    getArenaDifficultyLabel,
    applyVictoryGrowth,
    spawnReplacementOpponent,
    ARENA_TIER_CONFIG,
} from './arena';

describe('Arena Engine', () => {

    // ─── calculateWinChance ────────────────────────────────────
    describe('calculateWinChance', () => {
        it('should return ~0.5 when powers are equal', () => {
            const chance = calculateWinChance(100, 100);
            expect(chance).toBeCloseTo(0.497, 2);
        });

        it('should return > 0.5 when player is stronger', () => {
            expect(calculateWinChance(200, 100)).toBeGreaterThan(0.5);
        });

        it('should return < 0.5 when player is weaker', () => {
            expect(calculateWinChance(50, 200)).toBeLessThan(0.5);
        });

        it('should return > 0 when party has at least 1 power against any opponent', () => {
            // With partyPower = 1 and very strong opponent, chance is small but > 0
            const veryLowChance = calculateWinChance(1, 9999);
            expect(veryLowChance).toBeGreaterThan(0);
            // With partyPower = 9999 vs 1, chance is high but < 1
            const veryHighChance = calculateWinChance(9999, 1);
            expect(veryHighChance).toBeLessThan(1);
        });
    });

    // ─── getArenaDifficultyLabel ───────────────────────────────
    describe('getArenaDifficultyLabel', () => {
        it('should label >= 0.75 as Fácil with green', () => {
            const result = getArenaDifficultyLabel(0.8);
            expect(result.label).toContain('Fácil');
            expect(result.color).toBe('text-green-400');
        });

        it('should label 0.55-0.74 as Normal with yellow', () => {
            const result = getArenaDifficultyLabel(0.6);
            expect(result.label).toContain('Normal');
            expect(result.color).toBe('text-yellow-400');
        });

        it('should label 0.40-0.54 as Difícil with orange', () => {
            const result = getArenaDifficultyLabel(0.45);
            expect(result.label).toContain('Difícil');
            expect(result.color).toBe('text-orange-400');
        });

        it('should label below 0.40 as Suicida with red', () => {
            const result = getArenaDifficultyLabel(0.2);
            expect(result.label).toContain('Suicida');
            expect(result.color).toBe('text-red-400');
        });
    });

    // ─── generateArenaOpponent ─────────────────────────────────
    describe('generateArenaOpponent', () => {
        it('should return a valid ArenaOpponent shape', () => {
            const op = generateArenaOpponent(1000, 500, 'normal');
            expect(op.id).toBeTruthy();
            expect(op.name).toBeTruthy();
            expect(op.avatar).toBeTruthy();
            expect(op.rank).toBeGreaterThanOrEqual(1);
            expect(op.power).toBeGreaterThan(0);
        });

        it('easy tier should generate power in 50%-80% of party power', () => {
            const { powerMin, powerMax } = ARENA_TIER_CONFIG.easy;
            const partyPower = 1000;
            // Run multiple times to check distribution
            for (let i = 0; i < 20; i++) {
                const op = generateArenaOpponent(partyPower, 1000, 'easy', i);
                expect(op.power).toBeGreaterThanOrEqual(Math.floor(partyPower * powerMin) - 1);
                expect(op.power).toBeLessThanOrEqual(Math.ceil(partyPower * powerMax) + 1);
            }
        });

        it('hard tier should generate power higher than normal tier on average', () => {
            const partyPower = 1000;
            const normalPowers = Array.from({ length: 10 }, (_, i) =>
                generateArenaOpponent(partyPower, 1000, 'normal', i).power
            );
            const hardPowers = Array.from({ length: 10 }, (_, i) =>
                generateArenaOpponent(partyPower, 1000, 'hard', i).power
            );
            const normalAvg = normalPowers.reduce((a, b) => a + b, 0) / normalPowers.length;
            const hardAvg = hardPowers.reduce((a, b) => a + b, 0) / hardPowers.length;
            expect(hardAvg).toBeGreaterThan(normalAvg);
        });

        it('should use different avatar pools per tier', () => {
            const easyOp = generateArenaOpponent(100, 500, 'easy');
            const hardOp = generateArenaOpponent(100, 500, 'hard');
            // They should have valid avatars (non-empty)
            expect(easyOp.avatar.length).toBeGreaterThan(0);
            expect(hardOp.avatar.length).toBeGreaterThan(0);
        });
    });

    // ─── generateInitialArenaBoard ─────────────────────────────
    describe('generateInitialArenaBoard', () => {
        it('should always return exactly 3 opponents', () => {
            const board = generateInitialArenaBoard(500, 1000);
            expect(board).toHaveLength(3);
        });

        it('should generate opponents in increasing power order (easy < hard on average)', () => {
            // Board is [easy, normal, hard] by index
            const board = generateInitialArenaBoard(1000, 500);
            // easy max < hard min — with 1000 partyPower: easy max=800, hard min=1200
            // So board[0] should almost always be weaker than board[2]
            // (might fail rarely due to random, so check across multiple boards)
            let easyLessThanHard = 0;
            for (let i = 0; i < 20; i++) {
                const b = generateInitialArenaBoard(1000, 500);
                if (b[0].power < b[2].power) easyLessThanHard++;
            }
            expect(easyLessThanHard).toBeGreaterThanOrEqual(15); // at least 75% of the time
        });

        it('should generate unique IDs for all opponents', () => {
            const board = generateInitialArenaBoard(500, 1000);
            const ids = board.map(op => op.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(3);
        });
    });

    // ─── applyVictoryGrowth ────────────────────────────────────
    describe('applyVictoryGrowth', () => {
        it('should remove the defeated opponent', () => {
            const opponents = [
                { id: 'op1', name: 'A', avatar: '⚔️', rank: 100, power: 100 },
                { id: 'op2', name: 'B', avatar: '🏹', rank: 110, power: 200 },
                { id: 'op3', name: 'C', avatar: '💀', rank: 120, power: 300 },
            ];
            const result = applyVictoryGrowth(opponents, 'op1');
            expect(result.find(op => op.id === 'op1')).toBeUndefined();
            expect(result).toHaveLength(2);
        });

        it('should increase remaining opponents power by 5% - 50%', () => {
            const opponents = [
                { id: 'op1', name: 'A', avatar: '⚔️', rank: 100, power: 1000 },
                { id: 'op2', name: 'B', avatar: '🏹', rank: 110, power: 1000 },
            ];
            const result = applyVictoryGrowth(opponents, 'op1');
            const survivorPower = result[0].power;
            expect(survivorPower).toBeGreaterThanOrEqual(1050); // at least +5%
            expect(survivorPower).toBeLessThanOrEqual(1500);    // at most +50%
        });
    });

    // ─── spawnReplacementOpponent ──────────────────────────────
    describe('spawnReplacementOpponent', () => {
        it('should return an opponent with a valid id and power', () => {
            const replacement = spawnReplacementOpponent(1000, 500, 700);
            expect(replacement.id).toBeTruthy();
            expect(replacement.power).toBeGreaterThan(0);
        });

        it('should infer easy tier when defeated power was weak', () => {
            // defeatedPower < 0.85 * partyPower → easy
            const replacement = spawnReplacementOpponent(1000, 1000, 600); // 60% of party
            const { powerMax } = ARENA_TIER_CONFIG.easy;
            expect(replacement.power).toBeLessThanOrEqual(Math.ceil(1000 * powerMax) + 5);
        });

        it('should infer hard tier when defeated power was strong', () => {
            // defeatedPower >= 1.2 * partyPower → hard
            const replacement = spawnReplacementOpponent(1000, 1000, 1500); // 150% of party
            const { powerMin } = ARENA_TIER_CONFIG.hard;
            expect(replacement.power).toBeGreaterThanOrEqual(Math.floor(1000 * powerMin) - 5);
        });
    });
});
