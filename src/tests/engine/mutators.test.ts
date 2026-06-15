import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDailyMutator, MUTATORS } from '../../engine/mutators';

describe('Tower Mutators Engine', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return the first mutator on day 0 (UNIX epoch)', () => {
        vi.setSystemTime(new Date(0)); // Jan 1, 1970
        const mutator = getDailyMutator();
        expect(mutator).toEqual(MUTATORS[0]);
    });

    it('should return the second mutator on day 1', () => {
        // 1 day = 1000 * 60 * 60 * 24 ms
        const ONE_DAY_MS = 1000 * 60 * 60 * 24;
        vi.setSystemTime(new Date(ONE_DAY_MS));
        const mutator = getDailyMutator();
        expect(mutator).toEqual(MUTATORS[1]);
    });

    it('should wrap around and return the first mutator again after MUTATORS.length days', () => {
        const ONE_DAY_MS = 1000 * 60 * 60 * 24;
        vi.setSystemTime(new Date(ONE_DAY_MS * MUTATORS.length));
        const mutator = getDailyMutator();
        expect(mutator).toEqual(MUTATORS[0]);
    });

    it('should correctly select mutator for a random future date', () => {
        // A specific date string
        const date = new Date('2025-01-01T00:00:00Z');
        vi.setSystemTime(date);

        const day = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
        const expectedIndex = day % MUTATORS.length;

        const mutator = getDailyMutator();
        expect(mutator).toEqual(MUTATORS[expectedIndex]);
    });
});
