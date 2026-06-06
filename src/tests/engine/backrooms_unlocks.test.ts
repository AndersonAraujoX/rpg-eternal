import { describe, it, expect } from 'vitest';
import { FEATURES_LIST } from '../../engine/features';
import type { GameStateForUnlocks } from '../../engine/features';

import { TUTORIAL_STEPS } from '../../data/npcTutorial';

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

describe('NPC Tutorial System', () => {
    it('should have at least 3 steps populated', () => {
        expect(TUTORIAL_STEPS.length).toBeGreaterThanOrEqual(3);
    });

    it('should validate Step 1: Gold Accumulation', () => {
        const step1 = TUTORIAL_STEPS[0];
        expect(step1.id).toBe('gold_accumulation');

        // False when conditions aren't met
        expect(step1.checkCondition({ gold: 39999, buildings: [{ id: 'backrooms_manager', level: 0 }] })).toBe(false);

        // True when gold >= 40000
        expect(step1.checkCondition({ gold: 40000, buildings: [{ id: 'backrooms_manager', level: 0 }] })).toBe(true);

        // True when building is upgraded even with less gold
        expect(step1.checkCondition({ gold: 100, buildings: [{ id: 'backrooms_manager', level: 1 }] })).toBe(true);
    });

    it('should validate Step 2: Alchemy Distillation', () => {
        const step2 = TUTORIAL_STEPS[1];
        expect(step2.id).toBe('alchemy_distillation');

        // False when not researched
        expect(step2.checkCondition({ backroomsUnlockedTechs: [] })).toBe(false);
        expect(step2.checkCondition({ backroomsUnlockedTechs: ['other_tech'] })).toBe(false);

        // True when researched
        expect(step2.checkCondition({ backroomsUnlockedTechs: ['alchemical_distill'] })).toBe(true);
        expect(step2.checkCondition({ backroomsUnlockedTechs: ['other_tech', 'alchemical_distill'] })).toBe(true);
    });

    it('should validate Step 3: Backrooms Floor Progress', () => {
        const step3 = TUTORIAL_STEPS[2];
        expect(step3.id).toBe('floor_progress');

        // False when floor is low
        expect(step3.checkCondition({ backroomsFloor: 4 })).toBe(false);

        // True when floor >= 5
        expect(step3.checkCondition({ backroomsFloor: 5 })).toBe(true);
        expect(step3.checkCondition({ backroomsFloor: 6 })).toBe(true);
    });
});
