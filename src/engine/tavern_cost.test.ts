import { describe, it, expect } from 'vitest';
import { calculateTavernCost } from './tavern';

describe('Tavern Cost Calculation', () => {
    it('should cost 0 for the first purchase', () => {
        expect(calculateTavernCost(1, 0)).toBe(0);
    });

    it('should cost 50 for the second purchase', () => {
        expect(calculateTavernCost(1, 1)).toBe(50);
    });

    it('should cost 100 for the third purchase', () => {
        expect(calculateTavernCost(1, 2)).toBe(100);
    });

    it('should calculate bulk cost correctly (sum of 0, 50, 100... para 10 compras começando do 0)', () => {
        // 0 + 50 + 100 + 150 + 200 + 250 + 300 + 350 + 400 + 450 = 2250
        expect(calculateTavernCost(10, 0)).toBe(2250);
    });

    it('should calculate bulk cost correctly starting from 5 purchases', () => {
        // 5*50 + 6*50 = 250 + 300 = 550
        expect(calculateTavernCost(2, 5)).toBe(550);
    });
});
