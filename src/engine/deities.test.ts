import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../hooks/useGame';

describe('Panteão dos Deuses Padroeiros (Deities System)', () => {

    it('should initialize with no patron deity', () => {
        const { result } = renderHook(() => useGame());

        expect(result.current.patronDeity).toBeNull();
        expect(result.current.deityLevel).toBe(1);
        expect(result.current.deityFavor).toBe(0);
        expect(result.current.deityEnergy).toBe(0);
    });

    it('should pledge allegiance to a deity and reset state', () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.pledgeDeity('aurelius');
        });

        expect(result.current.patronDeity).toBe('aurelius');
        expect(result.current.deityLevel).toBe(1);
        expect(result.current.deityFavor).toBe(0);
        expect(result.current.deityEnergy).toBe(0);
    });

    it('should fail offering if resources are insufficient', () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.pledgeDeity('tenebris');
            result.current.setSouls(100); // Less than 5000
            result.current.setDivinity(10); // Less than 100
        });

        act(() => {
            result.current.offerToDeity('souls');
        });

        expect(result.current.deityFavor).toBe(0);

        act(() => {
            result.current.offerToDeity('divinity');
        });

        expect(result.current.deityFavor).toBe(0);
    });

    it('should accept offering and level up deity when favor threshold is reached', () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.pledgeDeity('gaya');
            result.current.setSouls(15000); // Enought for 3 offerings
        });

        // First offering: +500 favor
        act(() => {
            result.current.offerToDeity('souls');
        });

        expect(result.current.souls).toBe(10000);
        expect(result.current.deityFavor).toBe(500);
        expect(result.current.deityLevel).toBe(1);

        // Second offering: +500 favor, reaching 1000/1000 -> Level 2
        act(() => {
            result.current.offerToDeity('souls');
        });

        expect(result.current.souls).toBe(5000);
        expect(result.current.deityFavor).toBe(0); // reset excess
        expect(result.current.deityLevel).toBe(2);

        // Third offering: +500 favor on Level 2 (requires 2000 favor for Level 3)
        act(() => {
            result.current.offerToDeity('souls');
        });

        expect(result.current.souls).toBe(0);
        expect(result.current.deityFavor).toBe(500);
        expect(result.current.deityLevel).toBe(2);
    });

    it('should renounce allegiance and clear deity state', () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.pledgeDeity('aurelius');
            result.current.setDeityLevel(3);
            result.current.setDeityFavor(250);
            result.current.setDeityEnergy(40);
        });

        expect(result.current.patronDeity).toBe('aurelius');
        expect(result.current.deityLevel).toBe(3);

        act(() => {
            result.current.pledgeDeity(null);
        });

        expect(result.current.patronDeity).toBeNull();
        expect(result.current.deityLevel).toBe(1);
        expect(result.current.deityFavor).toBe(0);
        expect(result.current.deityEnergy).toBe(0);
    });
});
