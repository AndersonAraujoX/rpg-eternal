import { describe, it, expect } from 'vitest';

describe('DPS calculation check', () => {
    it('should correctly calculate smoothed DPS using a 70/30 moving average formula', () => {
        let prevDps = 100;
        const currentDps = 200;
        
        // Apply formula: prevDps * 0.7 + currentDps * 0.3
        prevDps = Math.round(prevDps * 0.7 + currentDps * 0.3);
        
        expect(prevDps).toBe(130);
    });

    it('should handle zero damage correctly', () => {
        let prevDps = 100;
        const currentDps = 0;
        
        prevDps = Math.round(prevDps * 0.7 + currentDps * 0.3);
        
        expect(prevDps).toBe(70);
    });
});
