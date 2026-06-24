import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BattleArea } from '../../components/BattleArea';

describe('BattleArea Component', () => {
    const defaultProps = {
        boss: {
            id: 'boss-test',
            name: 'Hydra',
            emoji: '🐍',
            type: 'boss' as const,
            level: 91,
            isDead: false,
            element: 'neutral',
            stats: { hp: 500, maxHp: 1000, mp: 0, maxMp: 0, attack: 50, magic: 0, defense: 10, speed: 10 }
        },
        dungeonActive: false,
        dungeonTimer: 0,
        ultimateCharge: 45,
        pets: [
            { id: 'pet-1', name: 'Slime', type: 'pet' as const, bonus: '+10% Gold', emoji: '🦠', isDead: false, level: 5, xp: 0, maxXp: 100, rarity: 'common' as const, stats: {} as unknown as import('../../engine/types').Stats, element: 'water' as const }
        ],
        actions: {
            manualAttack: vi.fn()
        },
        artifacts: [
            { id: 'a1', name: 'Crown', description: 'Test', emoji: '👑', bonus: 'test', unlocked: true, bonusType: 'xp', bonusValue: 1.0 }
        ],
        heroes: [
            { id: 'h1', name: 'Guerreiro', type: 'hero' as const, class: 'Warrior', emoji: '🛡️', unlocked: true, isDead: false, element: 'nature' as const, assignment: 'combat' as const, level: 6, xp: 50, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 } }
        ],
        synergies: [],
        partyDps: 125000,
        partyPower: 350000,
        combatEvents: [],
        suggestions: [],
        bossTimer: 53
    };

    it('renders boss details correctly', () => {
        render(<BattleArea {...defaultProps} />);
        
        // Check if boss emoji is present
        const bossEmoji = screen.getByText('🐍');
        expect(bossEmoji).toBeDefined();

        // Check if hero emoji is present
        const heroEmoji = screen.getByText('🛡️');
        expect(heroEmoji).toBeDefined();

        // Check if pet emoji is present
        const petEmoji = screen.getByText('🦠');
        expect(petEmoji).toBeDefined();

        // Check if artifact emoji is present
        const artifactEmoji = screen.getByText('👑');
        expect(artifactEmoji).toBeDefined();

        // Check if DPS is displayed
        const dpsText = screen.getByText(/DPS: 125.0K/i);
        expect(dpsText).toBeDefined();
    });
});
