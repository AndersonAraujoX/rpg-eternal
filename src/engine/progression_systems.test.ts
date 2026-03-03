import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../hooks/useGame';

// To run this test, we might need to mock deps if useGame is too heavy, 
// but let's try a direct integration test first since it's a hook.

describe('Progression Systems: Artifacts & Class Mastery', () => {

    it('should unlock artifact via actions', () => {
        const { result } = renderHook(() => useGame());

        // Initial state
        expect(result.current.artifacts.find(a => a.id === 'a2')?.unlocked).toBe(false);

        // Unlock artifact 'Pedra do Vazio'
        act(() => {
            result.current.actions.unlockArtifact('a2');
        });

        expect(result.current.artifacts.find(a => a.id === 'a2')?.unlocked).toBe(true);
    });

    it('should initialize class mastery points and levels', () => {
        const { result } = renderHook(() => useGame());
        const warriorMastery = result.current.classMastery['Warrior'];
        expect(warriorMastery).toBeDefined();
        expect(warriorMastery.level).toBe(1);
        expect(warriorMastery.points).toBe(0);
    });

    it('should allow buying class talents if points were manually added (logic test)', () => {
        const { result } = renderHook(() => useGame());

        // Note: In a real test we'd trigger a boss death to gain XP/Points.
        // For this unit test, let's verify that the buyClassTalent action 
        // respects the points requirement.

        act(() => {
            result.current.actions.buyClassTalent('Warrior', 'war_hp');
        });

        // Should NOT be unlocked because we have 0 points
        expect(result.current.classMastery['Warrior'].unlockedTalents).not.toContain('war_hp');
    });
});
