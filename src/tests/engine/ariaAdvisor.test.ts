import { describe, it, expect } from 'vitest';
import {
    getNextMilestoneNode,
    getProgressionStage,
    generateTacticalChecklist,
    generateAriaSpeech,
    generateAriaAdvice
} from '../../engine/ariaAdvisor';
import { evaluateProgressionTree } from '../../engine/progressionTree';

describe('Aria Advisor Engine (AAA Pattern)', () => {
    describe('Happy Path: Progression Stage & Milestones', () => {
        it('should classify early stage for a brand new player', () => {
            // Arrange
            const state = { highestFloor: 1, bossLevel: 1, buildings: [] };

            // Act
            const stage = getProgressionStage(state);

            // Assert
            expect(stage).toBe('early');
        });

        it('should classify mid stage once town is unlocked', () => {
            // Arrange
            const state = { highestFloor: 12, bossLevel: 10, buildings: [{ id: 'town_hall', level: 1 }] };

            // Act
            const stage = getProgressionStage(state);

            // Assert
            expect(stage).toBe('mid');
        });

        it('should classify advanced stage when industry is unlocked', () => {
            // Arrange
            const state = {
                highestFloor: 50,
                bossLevel: 45,
                buildings: [{ id: 'industry', level: 1 }],
                industryUnlocked: true
            };

            // Act
            const stage = getProgressionStage(state);

            // Assert
            expect(stage).toBe('advanced');
        });

        it('should classify endgame stage when outer space is unlocked', () => {
            // Arrange
            const state = {
                highestFloor: 100,
                bossLevel: 120,
                outerSpaceUnlocked: true
            };

            // Act
            const stage = getProgressionStage(state);

            // Assert
            expect(stage).toBe('endgame');
        });

        it('should recommend Town as the first milestone when player is on floor 1', () => {
            // Arrange
            const tree = evaluateProgressionTree({ highestFloor: 1, bossLevel: 1 });

            // Act
            const nextMilestone = getNextMilestoneNode(tree);

            // Assert
            expect(nextMilestone).not.toBeNull();
            expect(nextMilestone?.id).toBe('town');
            expect(nextMilestone?.name).toContain('Vila');
        });

        it('should recommend Backrooms or Guild once Town is unlocked', () => {
            // Arrange
            const tree = evaluateProgressionTree({ highestFloor: 15, bossLevel: 12 });

            // Act
            const nextMilestone = getNextMilestoneNode(tree);

            // Assert
            expect(nextMilestone).not.toBeNull();
            expect(['backroom', 'guild', 'world_boss']).toContain(nextMilestone?.id);
        });
    });

    describe('Happy Path: Tactical Checklist Generation', () => {
        it('should recommend climbing the tower when floor < 10', () => {
            // Arrange
            const state = { highestFloor: 4, gold: 500 };

            // Act
            const actions = generateTacticalChecklist(state, 0);

            // Assert
            const towerAction = actions.find(a => a.category === 'tower');
            expect(towerAction).toBeDefined();
            expect(towerAction?.id).toBe('climb_tower');
            expect(towerAction?.priority).toBe('high');
            expect(towerAction?.progress?.current).toBe(4);
            expect(towerAction?.progress?.max).toBe(10);
        });

        it('should recommend recruiting heroes when gold >= 1000 and hero slots exist', () => {
            // Arrange
            const state = {
                gold: 5000,
                heroes: [
                    { id: 'h1', unlocked: true },
                    { id: 'h2', unlocked: false }
                ]
            };

            // Act
            const actions = generateTacticalChecklist(state, 0);

            // Assert
            const tavernAction = actions.find(a => a.category === 'tavern');
            expect(tavernAction).toBeDefined();
            expect(tavernAction?.targetModal).toBe('tavern');
            expect(tavernAction?.actionLabel).toBe('Ir à Taverna');
        });

        it('should recommend forging gear when player has ores accumulated', () => {
            // Arrange
            const state = {
                resources: { copper: 25, iron: 10 }
            };

            // Act
            const actions = generateTacticalChecklist(state, 0);

            // Assert
            const forgeAction = actions.find(a => a.category === 'forge');
            expect(forgeAction).toBeDefined();
            expect(forgeAction?.targetModal).toBe('forge');
            expect(forgeAction?.description).toContain('25 Cobres');
        });

        it('should recommend Backrooms operations when Backrooms manager building exists', () => {
            // Arrange
            const state = {
                buildings: [{ id: 'backrooms_manager', level: 1 }],
                backroomsFloor: 3
            };

            // Act
            const actions = generateTacticalChecklist(state, 0);

            // Assert
            const backroomsAction = actions.find(a => a.category === 'backrooms');
            expect(backroomsAction).toBeDefined();
            expect(backroomsAction?.targetModal).toBe('backrooms');
            expect(backroomsAction?.description).toContain('Andar 3');
        });
    });

    describe('Happy Path: Full Aria Advice Package', () => {
        it('should generate tutorial directive when tutorial step is active', () => {
            // Arrange
            const state = { gold: 12000, buildings: [] };
            const tutorialIndex = 0;

            // Act
            const advice = generateAriaAdvice(state, tutorialIndex);

            // Assert
            expect(advice.primaryObjective.type).toBe('tutorial');
            expect(advice.primaryObjective.targetModal).toBe('town');
            expect(advice.primaryObjective.rewards).toBeDefined();
            expect(advice.ariaSpeech).toContain('Saudações, herói');
            expect(advice.tacticalActions.length).toBeGreaterThan(0);
        });

        it('should generate milestone objective when all tutorial steps are completed', () => {
            // Arrange
            const state = {
                highestFloor: 25,
                bossLevel: 20,
                buildings: [{ id: 'town_hall', level: 1 }]
            };
            const tutorialIndex = 999; // Beyond tutorial steps

            // Act
            const advice = generateAriaAdvice(state, tutorialIndex);

            // Assert
            expect(advice.primaryObjective.type).toBe('milestone');
            expect(advice.primaryObjective.title).toContain('Desbloquear');
            expect(advice.ariaSpeech).toBeDefined();
        });

        it('should generate personalized speech for each stage', () => {
            // Arrange & Act
            const earlySpeech = generateAriaSpeech('early', 'Andar 10', null);
            const midSpeech = generateAriaSpeech('mid', 'Vila', { shortName: 'Backrooms' } as any);
            const advancedSpeech = generateAriaSpeech('advanced', 'Indústria', null);
            const endgameSpeech = generateAriaSpeech('endgame', 'Galáxia', null);

            // Assert
            expect(earlySpeech).toContain('Andar 10');
            expect(midSpeech).toContain('Backrooms');
            expect(advancedSpeech).toContain('Indústria');
            expect(endgameSpeech).toContain('estrelas');
        });
    });

    describe('Edge Cases & Defensive Handling', () => {
        it('should handle undefined or null game state gracefully without throwing', () => {
            // Arrange
            const nullState = null;
            const undefinedState = undefined;

            // Act
            const adviceNull = generateAriaAdvice(nullState, 0);
            const adviceUndefined = generateAriaAdvice(undefinedState, 0);

            // Assert
            expect(adviceNull).toBeDefined();
            expect(adviceNull.primaryObjective).toBeDefined();
            expect(adviceNull.tacticalActions).toBeDefined();
            expect(adviceNull.progressionStage).toBe('early');

            expect(adviceUndefined).toBeDefined();
            expect(adviceUndefined.primaryObjective).toBeDefined();
        });

        it('should handle empty progression tree safely in getNextMilestoneNode', () => {
            // Arrange
            const emptyTree = {};

            // Act
            const result = getNextMilestoneNode(emptyTree as any);

            // Assert
            expect(result).toBeNull();
        });

        it('should return supreme victory objective when all nodes are unlocked', () => {
            // Arrange: Simulated fully unlocked tree
            const state = {
                highestFloor: 150,
                bossLevel: 160,
                outerSpaceUnlocked: true,
                buildings: [
                    { id: 'town_hall', level: 5 },
                    { id: 'guild_hall', level: 5 },
                    { id: 'backrooms_manager', level: 5 },
                    { id: 'industry', level: 5 }
                ],
                backroomsUnlockedTechs: ['dimensional_science_pack', 'space_warp'],
                backroomsFloor: 10,
                hasGuild: true,
                industryUnlocked: true,
                playerTerritoriesCount: 10
            };

            // Act
            const advice = generateAriaAdvice(state, 999);

            // Assert
            expect(advice).toBeDefined();
            expect(advice.primaryObjective).toBeDefined();
            expect(advice.primaryObjective.progress.percentage).toBe(100);
        });
    });
});
