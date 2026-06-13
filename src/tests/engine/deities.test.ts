import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../hooks/useGame';

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

    it('should apply +20% GvG bombardment bonus when patron deity is Aurelius', () => {
        const { result } = renderHook(() => useGame());

        // Setup a mock territory
        act(() => {
            result.current.setTerritories([
                {
                    id: 'test-gw-1',
                    name: 'Test Territory',
                    description: 'Desc',
                    owner: 'Neutral',
                    difficulty: 1000,
                    level: 1,
                    upgradeCost: 1000,
                    bonus: { type: 'damage', value: 0.1 },
                    coordinates: { x: 0, y: 0 }
                }
            ]);
        });

        // 1. Without Aurelius:
        act(() => {
            // multiplier = 0.5 => 50% difficulty remaining. New difficulty should be 1000 * 0.5 = 500
            result.current.bombardTerritory('test-gw-1', 0.5, 'Catapulta');
        });

        expect(result.current.territories.find((t: any) => t.id === 'test-gw-1')?.difficulty).toBe(500);

        // Reset difficulty to 1000 for Aurelius test
        act(() => {
            result.current.setTerritories([
                {
                    id: 'test-gw-1',
                    name: 'Test Territory',
                    description: 'Desc',
                    owner: 'Neutral',
                    difficulty: 1000,
                    level: 1,
                    upgradeCost: 1000,
                    bonus: { type: 'damage', value: 0.1 },
                    coordinates: { x: 0, y: 0 }
                }
            ]);
            result.current.pledgeDeity('aurelius');
        });

        // 2. With Aurelius:
        act(() => {
            // multiplier = 0.5.
            // normalDamage = 1 - 0.5 = 0.5.
            // boostedDamage = 0.5 * 1.20 = 0.6.
            // actualMultiplier = 1 - 0.6 = 0.40.
            // New difficulty should be 1000 * 0.40 = 400.
            result.current.bombardTerritory('test-gw-1', 0.5, 'Catapulta');
        });

        expect(result.current.territories.find((t: any) => t.id === 'test-gw-1')?.difficulty).toBe(400);
    });
});
