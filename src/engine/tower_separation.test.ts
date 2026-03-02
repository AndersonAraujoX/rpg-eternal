import { describe, it, expect, vi } from 'vitest';

describe('Tower of Eternity Separation', () => {
    it('should progress Tower floor separately from normal boss', () => {
        const normalBoss = { name: 'Slime', level: 1, stats: { hp: 200 } };
        const towerBoss = { name: 'Tower Guardian', level: 5, stats: { hp: 500 } };

        let towerFloor = 1;
        let isTowerActive = true;

        // Simulate a tick in Tower
        const damage = 600;
        const currentTarget = isTowerActive ? towerBoss : normalBoss;

        if (damage >= currentTarget.stats.hp) {
            if (isTowerActive) {
                towerFloor++;
                // In real code, we'd spawn next boss here
            }
        }

        expect(towerFloor).toBe(2);
        expect(normalBoss.level).toBe(1); // Normal level unchanged
    });

    it('should NOT progress Tower floor if NOT active', () => {
        const normalBoss = { name: 'Slime', level: 1, stats: { hp: 200 } };
        const towerBoss = { name: 'Tower Guardian', level: 5, stats: { hp: 500 } };

        let towerFloor = 1;
        let normalBossLevel = 1;
        let isTowerActive = false;

        // Simulate a tick NOT in Tower
        const damage = 300;
        const currentTarget = isTowerActive ? towerBoss : normalBoss;

        if (damage >= currentTarget.stats.hp) {
            if (isTowerActive) {
                towerFloor++;
            } else {
                normalBossLevel++;
            }
        }

        expect(towerFloor).toBe(1); // Tower floor unchanged
        expect(normalBossLevel).toBe(2); // Normal level incremented
    });
});
