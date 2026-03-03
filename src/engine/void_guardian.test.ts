import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../hooks/useGame';

describe('Void Guardian Challenge', () => {
    it('should start and track damage in the challenge', async () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.actions.startVoidChallenge();
        });

        expect(result.current.voidGuardian.challengeActive).toBe(true);
        expect(result.current.voidGuardian.timeLeft).toBe(60);

        // Advance time 5 seconds
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.voidGuardian.timeLeft).toBe(55);
        expect(result.current.voidGuardian.accumulatedDamage).toBeGreaterThan(0);

        // Finish challenge
        act(() => {
            vi.advanceTimersByTime(60000);
        });

        expect(result.current.voidGuardian.challengeActive).toBe(false);
        vi.useRealTimers();
    });
});
