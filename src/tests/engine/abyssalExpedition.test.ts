import { describe, it, expect } from 'vitest';
import {
    createAbyssalMember,
    evaluateMentalState,
    generateAbyssalFloor,
    resolveMoralChoice,
    concludeAbyssalRun,
    type AbyssalRunState,
    type AbyssalMember
} from '../../engine/abyssalExpedition';

describe('Abyssal Expedition Engine (Roguelite + Moral Choices)', () => {
    describe('createAbyssalMember & evaluateMentalState', () => {
        it('should initialize a member with full sanity and focused state (Happy Path)', () => {
            // Arrange & Act
            const member = createAbyssalMember('m1', 'Dr. Sterling', 'scientist', 120, 100);

            // Assert
            expect(member.id).toBe('m1');
            expect(member.name).toBe('Dr. Sterling');
            expect(member.hp).toBe(120);
            expect(member.sanity).toBe(100);
            expect(member.mentalState).toBe('focused');
        });

        it('should throw when id or name is invalid (Exception Handling)', () => {
            // Arrange, Act & Assert
            expect(() => createAbyssalMember('', 'Sterling', 'scientist')).toThrow('valid id and name');
            expect(() => createAbyssalMember('m1', '', 'scientist')).toThrow('valid id and name');
        });

        it('should transition mentalState from focused to paranoid and hysterical as sanity declines (Edge Cases)', () => {
            // Arrange
            const member = createAbyssalMember('m2', 'Major Vance', 'soldier', 100, 100);

            // Act & Assert (Paranoid at <= 60% sanity)
            const paranoid = evaluateMentalState({ ...member, sanity: 55 });
            expect(paranoid.mentalState).toBe('paranoid');

            // Act & Assert (Hysterical at <= 25% sanity)
            const hysterical = evaluateMentalState({ ...member, sanity: 20 });
            expect(hysterical.mentalState).toBe('hysterical');
        });
    });

    describe('generateAbyssalFloor', () => {
        it('should generate 4 sequential nodes including moral choice and boss (Happy Path)', () => {
            // Arrange
            const mockRng = () => 0.2; // 0.2 <= 0.5 -> 'encounter'

            // Act
            const nodes = generateAbyssalFloor(3, mockRng);

            // Assert
            expect(nodes).toHaveLength(4);
            expect(nodes[0].type).toBe('encounter');
            expect(nodes[1].type).toBe('moral_choice');
            expect(nodes[1].moralChoice).toBeDefined();
            expect(nodes[2].type).toBe('rest_haven');
            expect(nodes[3].type).toBe('liminal_boss');
        });
    });

    describe('resolveMoralChoice', () => {
        const createTestState = (): AbyssalRunState => ({
            id: 'run_1',
            currentDepth: 1,
            maxDepth: 5,
            party: [createAbyssalMember('p1', 'Alice', 'scout', 100, 100)],
            nodes: generateAbyssalFloor(1),
            currentNodeId: 'node_1_2',
            moralCompass: 0,
            collectedScraps: 10,
            blessingsObtained: [],
            status: 'ongoing'
        });

        it('should apply Option A (Ruthless) shift, reduce sanity and grant bonus scraps (Happy Path)', () => {
            // Arrange
            const state = createTestState();

            // Act
            const result = resolveMoralChoice(state, 'node_1_2', 'optionA');

            // Assert
            expect(result.moralCompass).toBe(-25);
            expect(result.collectedScraps).toBe(60); // 10 + 50
            expect(result.party[0].sanity).toBe(85); // 100 - 15
            expect(result.blessingsObtained).toContain('Pragmatismo Frio');
            expect(result.nodes[1].cleared).toBe(true);
        });

        it('should apply Option B (Benevolent) shift, restore sanity, drain HP (Happy Path)', () => {
            // Arrange
            const state = createTestState();

            // Act
            const result = resolveMoralChoice(state, 'node_1_2', 'optionB');

            // Assert
            expect(result.moralCompass).toBe(25);
            expect(result.party[0].hp).toBe(80); // 100 - 20
            expect(result.blessingsObtained).toContain('Espírito Inquebrável');
        });

        it('should throw an error if target node is missing or not a moral choice (Exception handling)', () => {
            // Arrange
            const state = createTestState();

            // Act & Assert
            expect(() => resolveMoralChoice(state, 'invalid_node', 'optionA')).toThrow('not found');
            expect(() => resolveMoralChoice(state, 'node_1_3', 'optionA')).toThrow('not a valid moral choice');
        });

        it('should trigger wiped status if choice damages party to 0 HP (Edge case)', () => {
            // Arrange
            const fragileParty: AbyssalMember[] = [createAbyssalMember('p1', 'Alice', 'scout', 10, 100)];
            const state: AbyssalRunState = { ...createTestState(), party: fragileParty };

            // Act (Option B deals 20 damage, Alice has only 10 HP)
            const result = resolveMoralChoice(state, 'node_1_2', 'optionB');

            // Assert
            expect(result.party[0].hp).toBe(0);
            expect(result.status).toBe('wiped');
        });
    });

    describe('concludeAbyssalRun', () => {
        it('should grant full rewards and alignment bonus on victory (Happy Path)', () => {
            // Arrange
            const state: AbyssalRunState = {
                id: 'run_win',
                currentDepth: 3,
                maxDepth: 5,
                party: [createAbyssalMember('p1', 'Victor', 'soldier', 80, 70)],
                nodes: [],
                currentNodeId: null,
                moralCompass: 60,
                collectedScraps: 200,
                blessingsObtained: ['Espírito Inquebrável'],
                status: 'ongoing'
            };

            // Act
            const summary = concludeAbyssalRun(state);

            // Assert
            expect(summary.newState.status).toBe('victory');
            expect(summary.rewards.backroomsScraps).toBe(200);
            expect(summary.rewards.riftEnergy).toBeGreaterThan(50);
            expect(summary.rewards.moralAlignmentBonus).toContain('Luz Benevolente');
        });

        it('should reduce scrap rewards to 30% when party is wiped (Edge Case)', () => {
            // Arrange
            const wipedMember = createAbyssalMember('p1', 'Fallen', 'soldier', 0, 0);
            wipedMember.hp = 0;
            const state: AbyssalRunState = {
                id: 'run_fail',
                currentDepth: 2,
                maxDepth: 5,
                party: [wipedMember],
                nodes: [],
                currentNodeId: null,
                moralCompass: 0,
                collectedScraps: 100,
                blessingsObtained: [],
                status: 'wiped'
            };

            // Act
            const summary = concludeAbyssalRun(state);

            // Assert
            expect(summary.newState.status).toBe('wiped');
            expect(summary.rewards.backroomsScraps).toBe(30); // 30% of 100
            expect(summary.summaryLog).toContain('sucumbiu no abismo');
        });
    });
});
