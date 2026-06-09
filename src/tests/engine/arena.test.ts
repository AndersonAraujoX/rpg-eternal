import { describe, it, expect } from 'vitest';
import {
    calculateWinChance,
} from '../../engine/arena';

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

});
