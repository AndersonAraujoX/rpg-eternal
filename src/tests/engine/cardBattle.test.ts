import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { simulateCardBattle } from '../../engine/cardBattle';
import type { MonsterCard, CardOpponent } from '../../engine/types';

describe('simulateCardBattle', () => {
    let mockMathRandom: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Mock Math.random to return 0.5 for deterministic tests
        // stats array is ['attack', 'defense', 'speed', 'gold', 'xp']
        // Math.floor(0.5 * 5) = 2 -> 'speed'
        // Noise modifier: 0.9 + 0.5 * 0.2 = 1.0
        mockMathRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        mockMathRandom.mockRestore();
    });

    it('should calculate a player victory correctly', () => {
        const playerDeck: MonsterCard[] = [
            { id: '1', monsterName: 'StrongMonster', count: 1, stat: 'speed', value: 100 }
        ];

        const opponent: CardOpponent = {
            id: 'opp1',
            name: 'WeakOpponent',
            deck: ['🦠'], // Slime
            difficulty: 1,
            avatar: '👺',
            count: 1,
            stat: 'attack',
            value: 0.1
        };

        const result = simulateCardBattle(playerDeck, opponent);

        expect(result.winner).toBe('player');
        expect(result.score.player).toBe(3); // Wins all 3 rounds
        expect(result.score.opponent).toBe(0);
        expect(result.reward).toEqual({ type: 'starlight', amount: 7 }); // 5 + floor(1 * 2) = 7
        expect(result.logs).toContain('VICTORY!');
    });

    it('should calculate an opponent victory correctly', () => {
        const playerDeck: MonsterCard[] = [
            { id: '1', monsterName: 'WeakMonster', count: 1, stat: 'speed', value: 0.1 }
        ];

        const opponent: CardOpponent = {
            id: 'opp1',
            name: 'StrongOpponent',
            deck: ['🐉'], // Dragon
            difficulty: 100, // Very high difficulty multiplier
            avatar: '👹',
            count: 1,
            stat: 'attack',
            value: 100
        };

        const result = simulateCardBattle(playerDeck, opponent);

        expect(result.winner).toBe('opponent');
        expect(result.score.opponent).toBe(3);
        expect(result.score.player).toBe(0);
        expect(result.reward).toBeUndefined();
        expect(result.logs).toContain('DEFEAT!');
    });

    it('should fallback to Unknown for nonexistent monsters', () => {
        const playerDeck: MonsterCard[] = [
            { id: '1', monsterName: 'TestMonster', count: 1, stat: 'attack', value: 1 }
        ];

        const opponent: CardOpponent = {
            id: 'opp1',
            name: 'BuggyOpponent',
            deck: ['NonExistentMonster'],
            difficulty: 1,
            avatar: '🤖',
            count: 1,
            stat: 'attack',
            value: 1
        };

        const result = simulateCardBattle(playerDeck, opponent);

        // Ensure "Unknown" appears in the logs
        const logString = result.logs.join(' ');
        expect(logString).toContain('Unknown');
    });

    it('should wrap decks of different sizes properly', () => {
        const playerDeck: MonsterCard[] = [
            { id: '1', monsterName: 'P1', count: 1, stat: 'attack', value: 1 }
        ]; // Size 1

        const opponent: CardOpponent = {
            id: 'opp1',
            name: 'Opp',
            deck: ['🐉', '🦠'], // Size 2: Dragon, Slime
            difficulty: 1,
            avatar: '👤',
            count: 1,
            stat: 'attack',
            value: 1
        };

        const result = simulateCardBattle(playerDeck, opponent);

        // Check logs to ensure indices wrap correctly over 3 rounds
        const logStr = result.logs.join('\n');
        // Round 1: Player index 0, Opponent index 0 (Dragon)
        expect(logStr).toMatch(/P1 \(attack\) vs Dragon/);
        // Round 2: Player index 0 (1%1), Opponent index 1 (Slime)
        expect(logStr).toMatch(/P1 \(attack\) vs Slime/);
        // Round 3: Player index 0 (2%1), Opponent index 0 (2%2 -> Dragon)
        expect(logStr).toMatch(/P1 \(attack\) vs Dragon/);
    });
});
