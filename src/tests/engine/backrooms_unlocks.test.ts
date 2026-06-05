import { describe, it, expect } from 'vitest';
import { FEATURES_LIST } from '../../engine/features';
import type { GameStateForUnlocks } from '../../engine/features';

describe('Backrooms Unlocks and Features integration', () => {
    it('should unlock Rifts if riftsUnlocked is true or tower floor is >= 120', () => {
        const riftsFeature = FEATURES_LIST.find(f => f.id === 'rifts');
        expect(riftsFeature).toBeDefined();

        if (riftsFeature) {
            // Case 1: Standard progress, locked
            const stateLocked: GameStateForUnlocks = {
                bossLevel: 10,
                highestFloor: 50,
                voidAscensions: 0,
                buildings: [],
                outerSpaceUnlocked: false,
                riftsUnlocked: false
            };
            expect(riftsFeature.checkUnlocked(stateLocked)).toBe(false);

            // Case 2: Tower floor >= 120, unlocked
            const stateUnlockedByFloor: GameStateForUnlocks = {
                ...stateLocked,
                highestFloor: 120
            };
            expect(riftsFeature.checkUnlocked(stateUnlockedByFloor)).toBe(true);

            // Case 3: Backrooms research unlocked, even at low floor
            const stateUnlockedByBackrooms: GameStateForUnlocks = {
                ...stateLocked,
                riftsUnlocked: true
            };
            expect(riftsFeature.checkUnlocked(stateUnlockedByBackrooms)).toBe(true);
        }
    });

    it('should unlock Outer Space if outerSpaceUnlocked is true or bossLevel is >= 100', () => {
        const spaceFeature = FEATURES_LIST.find(f => f.id === 'outer_space');
        expect(spaceFeature).toBeDefined();

        if (spaceFeature) {
            // Case 1: Locked
            const stateLocked: GameStateForUnlocks = {
                bossLevel: 10,
                highestFloor: 50,
                voidAscensions: 0,
                buildings: [],
                outerSpaceUnlocked: false,
                riftsUnlocked: false
            };
            expect(spaceFeature.checkUnlocked(stateLocked)).toBe(false);

            // Case 2: Boss level >= 100
            const stateUnlockedByBoss: GameStateForUnlocks = {
                ...stateLocked,
                bossLevel: 100
            };
            expect(spaceFeature.checkUnlocked(stateUnlockedByBoss)).toBe(true);

            // Case 3: Backrooms research unlocked
            const stateUnlockedByBackrooms: GameStateForUnlocks = {
                ...stateLocked,
                outerSpaceUnlocked: true
            };
            expect(spaceFeature.checkUnlocked(stateUnlockedByBackrooms)).toBe(true);
        }
    });
});
