import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../../components/Header';

describe('Header Roguelike Button Removal', () => {
    const baseProps = {
        gold: 1000,
        souls: 50,
        divinity: 5,
        starlight: 20,
        activeHeroesCount: 3,
        maxHeroesCount: 5,
        partyPower: 500,
        logsCount: 10,
        boss: { level: 20 } as any,
        tower: { maxFloor: 50 } as any,
        keys: 0,
        voidMatter: 0,
        dungeonActive: false,
        voidActive: false,
        voidTimer: 0,
        isSoundOn: true,
        gameSpeed: 1,
        actions: {},
        resources: {} as any,
        guild: null,
        setShowJourney: vi.fn(),
        setShowStars: vi.fn(),
        setShowBestiary: vi.fn(),
        setShowHelp: vi.fn(),
        setShowLeaderboard: vi.fn(),
        unlocks: {
            roguelike_mode: true,
            outer_space: true,
            backrooms_manager: true
        },
        setShowShop: vi.fn(),
        setShowTavern: vi.fn(),
        setShowInventory: vi.fn(),
        setShowStats: vi.fn(),
        setShowSettings: vi.fn(),
        setShowForge: vi.fn(),
        setShowTower: vi.fn(),
        setShowGuild: vi.fn(),
        setShowVoid: vi.fn(),
        setShowArena: vi.fn(),
        setShowQuests: vi.fn(),
        setShowRunes: vi.fn(),
        setShowAchievements: vi.fn(),
        setShowLog: vi.fn(),
        setShowStarlight: vi.fn(),
        setShowGalaxy: vi.fn(),
        setShowBackrooms: vi.fn(),
        setShowRoguelike: vi.fn()
    };

    it('should not contain the Roguelike button in the header', () => {
        render(<Header {...baseProps} />);
        
        // Ensure "Roguelike" text is not present anywhere in the header
        const roguelikeText = screen.queryByText(/roguelike/i);
        expect(roguelikeText).toBeNull();
    });
});
