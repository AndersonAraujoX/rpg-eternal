import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../hooks/useGame';

describe('Tower of Eternity Boss HP Scaling', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should scale tower boss HP exponentially based on tower floor level upon entering', () => {
        // Set tower floor to 50 in local storage
        const savedState = {
            tower: { floor: 50, active: false, maxFloor: 50 }
        };
        localStorage.setItem('rpg_eternal_save_v6', JSON.stringify(savedState));

        const { result } = renderHook(() => useGame());

        // Initially tower is not active
        expect(result.current.tower.active).toBe(false);

        // Enter Tower
        act(() => {
            result.current.enterTower();
        });

        expect(result.current.tower.active).toBe(true);
        expect(result.current.tower.floor).toBe(50);
        
        // Tower Boss level must be synchronized to floor 50
        expect(result.current.towerBoss.level).toBe(50);

        // Verify HP matches exponential scaling formula: Math.floor(200 * Math.pow(1.2, level - 1))
        const expectedHp = Math.floor(200 * Math.pow(1.2, 49));
        expect(result.current.towerBoss.stats.maxHp).toBe(expectedHp);
        expect(result.current.towerBoss.stats.hp).toBe(expectedHp);
    });
});
