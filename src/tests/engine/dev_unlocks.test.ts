import { describe, it, expect } from 'vitest';
import { FEATURES_LIST } from '../../engine/features';
import type { GameStateForUnlocks } from '../../engine/features';

describe('Developer Unlock Galaxy and Roguelike Integration', () => {
    it('should unlock roguelike mode when outerSpaceUnlocked is true', () => {
        const roguelikeFeature = FEATURES_LIST.find(f => f.id === 'roguelike_mode');
        expect(roguelikeFeature).toBeDefined();

        if (roguelikeFeature) {
            // Case 1: Locked under normal conditions (bossLevel < 15 and outerSpaceUnlocked is false)
            const stateLocked: GameStateForUnlocks = {
                bossLevel: 10,
                highestFloor: 50,
                voidAscensions: 0,
                buildings: [],
                outerSpaceUnlocked: false
            };
            expect(roguelikeFeature.checkUnlocked(stateLocked)).toBe(false);
            expect(roguelikeFeature.getProgress(stateLocked).percentage).toBeLessThan(100);

            // Case 2: Unlocked via bossLevel >= 15
            const stateUnlockedByBoss: GameStateForUnlocks = {
                ...stateLocked,
                bossLevel: 15
            };
            expect(roguelikeFeature.checkUnlocked(stateUnlockedByBoss)).toBe(true);
            expect(roguelikeFeature.getProgress(stateUnlockedByBoss).percentage).toBe(100);

            // Case 3: Unlocked via outerSpaceUnlocked (dev bypass)
            const stateUnlockedByDev: GameStateForUnlocks = {
                ...stateLocked,
                outerSpaceUnlocked: true
            };
            expect(roguelikeFeature.checkUnlocked(stateUnlockedByDev)).toBe(true);
            expect(roguelikeFeature.getProgress(stateUnlockedByDev).percentage).toBe(100);
        }
    });
});
