import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoguelike } from '../../hooks/useRoguelike';

describe('Roguelike Planetary Expedition Preparation', () => {
    it('should correctly set and clear pending planetary expeditions', () => {
        const { result } = renderHook(() => useRoguelike());

        // Initial state
        expect(result.current.roguelikeRun.status).toBe('none');
        expect(result.current.roguelikeRun.planetaryExpedition).toBeNull();

        // Prepare planetary run
        act(() => {
            result.current.preparePlanetaryRun(
                'sector-alpha',
                'Alpha Prime',
                'planet',
                5
            );
        });

        // Should populate expedition context, but remain in 'none' status (pre-run selection screen)
        expect(result.current.roguelikeRun.status).toBe('none');
        expect(result.current.roguelikeRun.planetaryExpedition).toEqual({
            sectorId: 'sector-alpha',
            sectorName: 'Alpha Prime',
            biome: 'planet',
            sectorLevel: 5
        });

        // Clear/cancel planetary run
        act(() => {
            result.current.clearPlanetaryExpedition();
        });

        expect(result.current.roguelikeRun.status).toBe('none');
        expect(result.current.roguelikeRun.planetaryExpedition).toBeNull();
    });
});
