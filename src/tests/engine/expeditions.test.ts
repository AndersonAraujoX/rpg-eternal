import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startExpedition, checkExpeditionCompletion, claimExpeditionRewards } from '../../engine/expeditions';
import type { Expedition, Hero } from '../../engine/types';

describe('expeditions', () => {
    const mockHero1: Hero = {
        id: 'hero1', name: 'Hero 1', class: 'Warrior', emoji: '⚔️', unlocked: true, isDead: false,
        element: 'Fire', assignment: 'none', insanity: 0, level: 1, type: 'hero', stats: {
            hp: 10, maxHp: 10, mp: 0, maxMp: 0, attack: 1, defense: 1, speed: 1, magic: 1
        }
    };

    const mockHero2: Hero = {
        id: 'hero2', name: 'Hero 2', class: 'Mage', emoji: '🧙', unlocked: true, isDead: false,
        element: 'Water', assignment: 'none', insanity: 0, level: 1, type: 'hero', stats: {
            hp: 10, maxHp: 10, mp: 0, maxMp: 0, attack: 1, defense: 1, speed: 1, magic: 1
        }
    };

    describe('startExpedition', () => {
        it('should change assignment to expedition for assigned heroes', () => {
            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [], heroIds: ['hero1']
            };
            const heroes = [mockHero1, mockHero2];

            const result = startExpedition(exp, heroes);

            expect(result[0].id).toBe('hero1');
            expect(result[0].assignment).toBe('expedition');
            expect(result[1].id).toBe('hero2');
            expect(result[1].assignment).toBe('none'); // Unchanged
        });

        it('should not change anything if no heroes match', () => {
            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [], heroIds: ['hero3']
            };
            const heroes = [mockHero1, mockHero2];

            const result = startExpedition(exp, heroes);

            expect(result[0].assignment).toBe('none');
            expect(result[1].assignment).toBe('none');
        });
    });

    describe('checkExpeditionCompletion', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return false if expedition has no startTime', () => {
            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [], heroIds: []
            };

            expect(checkExpeditionCompletion(exp)).toBe(false);
        });

        it('should return false if time elapsed is less than duration', () => {
            const now = 1000000;
            vi.setSystemTime(now);

            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [], heroIds: [], startTime: now - 59000 // 59 seconds ago
            };

            expect(checkExpeditionCompletion(exp)).toBe(false);
        });

        it('should return true if time elapsed is greater than or equal to duration', () => {
            const now = 1000000;
            vi.setSystemTime(now);

            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [], heroIds: [], startTime: now - 60000 // 60 seconds ago
            };

            expect(checkExpeditionCompletion(exp)).toBe(true);
        });
    });

    describe('claimExpeditionRewards', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should generate rewards within the specified min and max', () => {
            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [
                    { type: 'gold', min: 10, max: 20 },
                    { type: 'xp', min: 5, max: 5 }
                ], heroIds: []
            };

            const rewards = claimExpeditionRewards(exp);

            expect(rewards.length).toBe(2);

            const goldReward = rewards.find(r => r.type === 'gold');
            expect(goldReward).toBeDefined();
            expect(goldReward!.amount).toBeGreaterThanOrEqual(10);
            expect(goldReward!.amount).toBeLessThanOrEqual(20);

            const xpReward = rewards.find(r => r.type === 'xp');
            expect(xpReward).toBeDefined();
            expect(xpReward!.amount).toBe(5);
        });

        it('should generate minimum rewards when Math.random() is 0', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0);

            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [
                    { type: 'gold', min: 10, max: 20 }
                ], heroIds: []
            };

            const rewards = claimExpeditionRewards(exp);

            expect(rewards.length).toBe(1);
            expect(rewards[0]).toEqual({ type: 'gold', amount: 10 });
        });

        it('should generate maximum rewards when Math.random() is almost 1', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.99999999);

            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [
                    { type: 'gold', min: 10, max: 20 }
                ], heroIds: []
            };

            const rewards = claimExpeditionRewards(exp);

            expect(rewards.length).toBe(1);
            expect(rewards[0]).toEqual({ type: 'gold', amount: 20 });
        });

        it('should not include rewards with 0 amount', () => {
            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [
                    { type: 'gold', min: 0, max: 0 }
                ], heroIds: []
            };

            const rewards = claimExpeditionRewards(exp);

            expect(rewards.length).toBe(0);
        });

        it('should return empty array if expedition has no rewards', () => {
            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [], heroIds: []
            };

            const rewards = claimExpeditionRewards(exp);

            expect(rewards.length).toBe(0);
            expect(rewards).toEqual([]);
        });

        it('should not include rewards with negative amount', () => {
            const exp: Expedition = {
                id: 'exp1', name: 'Expedition 1', description: 'Desc', duration: 60, difficulty: 1,
                rewards: [
                    { type: 'gold', min: -10, max: -5 }
                ], heroIds: []
            };

            const rewards = claimExpeditionRewards(exp);

            expect(rewards.length).toBe(0);
        });
    });
});
