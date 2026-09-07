import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS, TUTORIAL_NPC, TutorialStep } from '../../data/npcTutorial';

describe('NPC Tutorial Logic & Configuration', () => {
    describe('TUTORIAL_NPC metadata', () => {
        it('should define the guide NPC Aria with all essential personality fields', () => {
            // Arrange & Act
            const npc = TUTORIAL_NPC;

            // Assert
            expect(npc.name).toBe('Aria');
            expect(npc.fullName).toContain('Aria');
            expect(npc.avatar).toBe('🧝‍♀️');
            expect(npc.title).toBeTruthy();
            expect(npc.greeting).toBeTruthy();
            expect(npc.completedBanner).toBeTruthy();
            expect(Array.isArray(npc.tips)).toBe(true);
            expect(npc.tips.length).toBeGreaterThan(0);
        });
    });

    describe('TUTORIAL_STEPS configuration', () => {
        it('should contain at least 3 sequential progression steps', () => {
            // Arrange & Act
            const steps = TUTORIAL_STEPS;

            // Assert
            expect(steps.length).toBeGreaterThanOrEqual(3);
        });

        it('should contain required properties and handlers for each step', () => {
            // Arrange
            const steps = TUTORIAL_STEPS;

            // Act & Assert
            steps.forEach((step: TutorialStep) => {
                expect(step.id).toBeTruthy();
                expect(step.npcName).toBeTruthy();
                expect(step.dialogue).toBeTruthy();
                expect(step.objectiveDescription).toBeTruthy();
                expect(typeof step.checkCondition).toBe('function');
                expect(step.reward).toBeDefined();
                expect(typeof step.calculateProgress).toBe('function');
            });
        });
    });

    describe('Step 1: Gold Accumulation (AAA Pattern)', () => {
        const step = TUTORIAL_STEPS[0];

        it('Happy Path: should validate true when player has accumulated 40000 gold or more', () => {
            // Arrange
            const state = { gold: 40000, buildings: [] };

            // Act
            const isCompleted = step.checkCondition(state);

            // Assert
            expect(isCompleted).toBe(true);
        });

        it('Happy Path: should validate true when player already owns the backrooms_manager building', () => {
            // Arrange
            const state = { gold: 50, buildings: [{ id: 'backrooms_manager', level: 1 }] };

            // Act
            const isCompleted = step.checkCondition(state);

            // Assert
            expect(isCompleted).toBe(true);
        });

        it('Edge Case: should validate false when player has less than 40000 gold and building level is 0', () => {
            // Arrange
            const state = { gold: 39999, buildings: [{ id: 'backrooms_manager', level: 0 }] };

            // Act
            const isCompleted = step.checkCondition(state);

            // Assert
            expect(isCompleted).toBe(false);
        });

        it('Edge Case: should handle null/undefined state without throwing exceptions', () => {
            // Arrange & Act
            const fromNull = step.checkCondition(null);
            const fromUndefined = step.checkCondition(undefined);

            // Assert
            expect(fromNull).toBe(false);
            expect(fromUndefined).toBe(false);
        });

        it('Progress calculation: should correctly compute percentage and clamp values', () => {
            // Arrange
            const statePartial = { gold: 20000, buildings: [] };
            const stateOver = { gold: 80000, buildings: [] };
            const stateBuilding = { gold: 0, buildings: [{ id: 'backrooms_manager', level: 1 }] };

            // Act
            const progressPartial = step.calculateProgress!(statePartial);
            const progressOver = step.calculateProgress!(stateOver);
            const progressBuilding = step.calculateProgress!(stateBuilding);

            // Assert
            expect(progressPartial.percentage).toBe(50);
            expect(progressPartial.current).toBe(20000);
            expect(progressOver.percentage).toBe(100);
            expect(progressBuilding.percentage).toBe(100);
        });
    });

    describe('Step 2: Alchemy Distillation (AAA Pattern)', () => {
        const step = TUTORIAL_STEPS[1];

        it('Happy Path: should validate true when alchemical_distill tech is researched', () => {
            // Arrange
            const state = { backroomsUnlockedTechs: ['alchemical_distill', 'advanced_filter'] };

            // Act
            const isCompleted = step.checkCondition(state);

            // Assert
            expect(isCompleted).toBe(true);
        });

        it('Edge Case: should validate false when tech is not present or list is empty', () => {
            // Arrange
            const stateEmpty = { backroomsUnlockedTechs: [] };
            const stateOther = { backroomsUnlockedTechs: ['other_tech'] };

            // Act & Assert
            expect(step.checkCondition(stateEmpty)).toBe(false);
            expect(step.checkCondition(stateOther)).toBe(false);
        });

        it('Edge Case: should gracefully handle null or malformed state object', () => {
            // Arrange & Act & Assert
            expect(step.checkCondition(null)).toBe(false);
            expect(step.checkCondition({ backroomsUnlockedTechs: null })).toBe(false);
        });

        it('Progress calculation: should report 100% when unlocked, 0% when locked', () => {
            // Arrange
            const stateUnlocked = { backroomsUnlockedTechs: ['alchemical_distill'] };
            const stateLocked = { backroomsUnlockedTechs: [] };

            // Act
            const progUnlocked = step.calculateProgress!(stateUnlocked);
            const progLocked = step.calculateProgress!(stateLocked);

            // Assert
            expect(progUnlocked.percentage).toBe(100);
            expect(progLocked.percentage).toBe(0);
        });
    });

    describe('Step 3: Floor Progress (AAA Pattern)', () => {
        const step = TUTORIAL_STEPS[2];

        it('Happy Path: should validate true when backrooms floor reaches 5 or above', () => {
            // Arrange
            const stateExact = { backroomsFloor: 5 };
            const stateAbove = { backroomsFloor: 12 };

            // Act & Assert
            expect(step.checkCondition(stateExact)).toBe(true);
            expect(step.checkCondition(stateAbove)).toBe(true);
        });

        it('Edge Case: should validate false when floor is below 5', () => {
            // Arrange
            const stateBelow = { backroomsFloor: 4 };

            // Act
            const isCompleted = step.checkCondition(stateBelow);

            // Assert
            expect(isCompleted).toBe(false);
        });

        it('Edge Case: should gracefully handle null/undefined or negative values', () => {
            // Arrange & Act & Assert
            expect(step.checkCondition(null)).toBe(false);
            expect(step.checkCondition({ backroomsFloor: -1 })).toBe(false);
        });

        it('Progress calculation: should correctly scale from floor 1 to 5', () => {
            // Arrange
            const stateFloor1 = { backroomsFloor: 1 };
            const stateFloor3 = { backroomsFloor: 3 };

            // Act
            const prog1 = step.calculateProgress!(stateFloor1);
            const prog3 = step.calculateProgress!(stateFloor3);

            // Assert
            expect(prog1.percentage).toBe(20);
            expect(prog3.percentage).toBe(60);
        });
    });
});
