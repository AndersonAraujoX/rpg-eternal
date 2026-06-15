import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateDailyQuests, checkDailyReset, getLoginStreak } from '../../engine/dailies';

describe('dailies', () => {
    describe('generateDailyQuests', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return exactly 3 quests', () => {
            const quests = generateDailyQuests();
            expect(quests).toHaveLength(3);
        });

        it('should initialize quests with current: 0 and claimed: false', () => {
            const quests = generateDailyQuests();
            quests.forEach(quest => {
                expect(quest.current).toBe(0);
                expect(quest.claimed).toBe(false);
            });
        });

        it('should generate valid IDs and properties based on predefined templates', () => {
            const mockDate = new Date('2024-01-01T12:00:00Z');
            vi.setSystemTime(mockDate);

            const quests = generateDailyQuests();

            const validTypes = ['kill', 'mine', 'craft', 'gold_earn'];

            quests.forEach((quest, index) => {
                expect(quest.id).toBe(`daily_${mockDate.getTime()}_${index}`);
                expect(validTypes).toContain(quest.type);

                // Check if target and reward are defined
                expect(quest.target).toBeGreaterThan(0);
                expect(quest.reward).toBeDefined();
                expect(quest.reward.amount).toBeGreaterThan(0);
                expect(['gold', 'souls', 'starlight']).toContain(quest.reward.type);
                expect(typeof quest.description).toBe('string');
            });
        });
    });

    describe('checkDailyReset', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return false if time difference is less than or equal to 24 hours', () => {
            const mockDate = new Date('2024-01-02T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // 23 hours ago
            const lastReset1 = mockDate - (23 * 60 * 60 * 1000);
            expect(checkDailyReset(lastReset1)).toBe(false);

            // Exactly 24 hours ago
            const lastReset2 = mockDate - (24 * 60 * 60 * 1000);
            expect(checkDailyReset(lastReset2)).toBe(false);
        });

        it('should return true if time difference is greater than 24 hours', () => {
            const mockDate = new Date('2024-01-02T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // 24 hours and 1 ms ago
            const lastReset1 = mockDate - (24 * 60 * 60 * 1000 + 1);
            expect(checkDailyReset(lastReset1)).toBe(true);

            // 48 hours ago
            const lastReset2 = mockDate - (48 * 60 * 60 * 1000);
            expect(checkDailyReset(lastReset2)).toBe(true);
        });

        it('should return false if lastReset is in the future', () => {
            const mockDate = new Date('2024-01-02T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // 1 hour in the future
            const lastResetFuture = mockDate + (60 * 60 * 1000);
            expect(checkDailyReset(lastResetFuture)).toBe(false);
        });

        it('should handle lastReset being 0 (epoch)', () => {
            const mockDate = new Date('2024-01-02T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            const lastResetEpoch = 0;
            // Since mockDate is in 2024, the difference will be much greater than 24 hours
            expect(checkDailyReset(lastResetEpoch)).toBe(true);
        });
    });

    describe('getLoginStreak', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return current streak if time difference is less than 24 hours', () => {
            const mockDate = new Date('2024-01-02T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // 12 hours ago
            const lastLogin = mockDate - (12 * 60 * 60 * 1000);
            expect(getLoginStreak(lastLogin, 3)).toBe(3);
        });

        it('should return current streak if time difference is exactly 0 or negative', () => {
            const mockDate = new Date('2024-01-02T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // Exactly now
            expect(getLoginStreak(mockDate, 3)).toBe(3);

            // Future date (negative time diff, like clock change)
            const futureLogin = mockDate + (12 * 60 * 60 * 1000);
            expect(getLoginStreak(futureLogin, 3)).toBe(3);
        });

        it('should increment streak if time difference is exactly 24 hours', () => {
            const mockDate = new Date('2024-01-03T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            const lastLogin = mockDate - (24 * 60 * 60 * 1000);
            expect(getLoginStreak(lastLogin, 3)).toBe(4);
        });

        it('should increment streak up to 7 if time difference is between 24 and 48 hours', () => {
            const mockDate = new Date('2024-01-03T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // 25 hours ago
            const lastLogin = mockDate - (25 * 60 * 60 * 1000);

            expect(getLoginStreak(lastLogin, 3)).toBe(4);
            expect(getLoginStreak(lastLogin, 6)).toBe(7);
            expect(getLoginStreak(lastLogin, 7)).toBe(7); // Max cap
        });

        it('should reset streak to 1 if time difference is exactly 48 hours', () => {
            const mockDate = new Date('2024-01-04T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            const lastLogin = mockDate - (48 * 60 * 60 * 1000);
            expect(getLoginStreak(lastLogin, 5)).toBe(1);
        });

        it('should reset streak to 1 if time difference is 48 hours or more', () => {
            const mockDate = new Date('2024-01-04T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // 72 hours ago
            const lastLogin = mockDate - (72 * 60 * 60 * 1000);
            expect(getLoginStreak(lastLogin, 5)).toBe(1);
        });

        it('should return 1 for a first-time login where lastLogin is 0', () => {
            const mockDate = new Date('2024-01-05T12:00:00Z').getTime();
            vi.setSystemTime(mockDate);

            // lastLogin 0 means new user or very old epoch time
            expect(getLoginStreak(0, 0)).toBe(1);
            expect(getLoginStreak(0, 5)).toBe(1); // even if somehow streak was not 0
        });
    });
});
