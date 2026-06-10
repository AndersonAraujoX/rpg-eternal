import { describe, it, expect } from 'vitest';
import { checkExpeditionCompletion } from '../../engine/expeditions';
import type { Expedition } from '../../engine/types';

describe('Expeditions - checkExpeditionCompletion', () => {
    it('should return false if startTime is undefined', () => {
        const exp: Expedition = {
            id: 'exp1',
            name: 'Test Expedition',
            description: 'A test expedition',
            duration: 60, // 60 seconds
            difficulty: 1,
            rewards: [],
            heroIds: [],
            startTime: undefined
        };
        expect(checkExpeditionCompletion(exp)).toBe(false);
    });

    it('should return false if current time is less than startTime + duration', () => {
        const durationSeconds = 60;
        const now = Date.now();
        const exp: Expedition = {
            id: 'exp1',
            name: 'Test Expedition',
            description: 'A test expedition',
            duration: durationSeconds,
            difficulty: 1,
            rewards: [],
            heroIds: [],
            // Set start time such that it has only been running for half the duration
            startTime: now - (durationSeconds * 1000) / 2
        };
        expect(checkExpeditionCompletion(exp)).toBe(false);
    });

    it('should return true if current time is equal to startTime + duration', () => {
        const durationSeconds = 60;
        const now = Date.now();
        const exp: Expedition = {
            id: 'exp1',
            name: 'Test Expedition',
            description: 'A test expedition',
            duration: durationSeconds,
            difficulty: 1,
            rewards: [],
            heroIds: [],
            // Set start time exactly duration seconds ago
            startTime: now - (durationSeconds * 1000)
        };
        expect(checkExpeditionCompletion(exp)).toBe(true);
    });

    it('should return true if current time is greater than startTime + duration', () => {
        const durationSeconds = 60;
        const now = Date.now();
        const exp: Expedition = {
            id: 'exp1',
            name: 'Test Expedition',
            description: 'A test expedition',
            duration: durationSeconds,
            difficulty: 1,
            rewards: [],
            heroIds: [],
            // Set start time significantly before duration seconds ago
            startTime: now - (durationSeconds * 1000) - 10000
        };
        expect(checkExpeditionCompletion(exp)).toBe(true);
    });
});
