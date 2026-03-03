import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

// Simulate a basic unit test to verify Town Hall gold calculation multipliers
describe('Town Hall Building Mechanics', () => {

    it('calculates gold bonus correctly based on level', () => {
        const calculateTownHallMult = (level: number) => 1 + (level * 0.05);
        expect(calculateTownHallMult(0)).toBe(1);
        expect(calculateTownHallMult(1)).toBe(1.05);
        expect(calculateTownHallMult(10)).toBe(1.5);
    });

    it('blocks other buildings access until level 1', () => {
        const canAccessConstructionMode = (townHallLevel: number) => townHallLevel > 0;

        expect(canAccessConstructionMode(0)).toBe(false);
        expect(canAccessConstructionMode(1)).toBe(true);
    });
});
