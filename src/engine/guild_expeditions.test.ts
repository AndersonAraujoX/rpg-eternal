import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../hooks/useGame';
import { GUILD_EXPEDITIONS } from './guildExpeditions';

describe('Guild Expeditions', () => {
    it('should start a guild expedition if heroes are available', () => {
        const { result } = renderHook(() => useGame());

        // Find a hero that is 'none' (not combat, not mine)
        const idleHero = result.current.heroes.find(h => h.assignment === 'none' && h.unlocked);
        if (!idleHero) {
            console.warn("No idle hero found for test, skipping validation");
            return;
        }

        const exp = { ...GUILD_EXPEDITIONS[0], heroIds: [idleHero.id] };

        act(() => {
            result.current.actions.startGuildExpedition(exp);
        });

        const updatedHero = result.current.heroes.find(h => h.id === idleHero.id);
        expect(updatedHero?.assignment).toBe('expedition');
        expect(result.current.activeExpeditions.some(e => e.id === exp.id)).toBe(true);
    });

    it('should prevent starting expedition with combat heroes', () => {
        const { result } = renderHook(() => useGame());

        // Combat heroes
        const combatHero = result.current.heroes.find(h => h.assignment === 'combat' && h.unlocked);
        if (!combatHero) return;

        const exp = { ...GUILD_EXPEDITIONS[0], heroIds: [combatHero.id] };

        act(() => {
            result.current.actions.startGuildExpedition(exp);
        });

        const updatedHero = result.current.heroes.find(h => h.id === combatHero.id);
        // Should STILL be combat
        expect(updatedHero?.assignment).toBe('combat');
    });
});
