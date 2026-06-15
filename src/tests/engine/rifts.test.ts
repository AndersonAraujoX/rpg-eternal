import { describe, it, expect } from 'vitest';
import { generateBlessings } from '../../engine/rifts';
import type { Stats } from '../../engine/types';

describe('generateBlessings', () => {
    it('should return exactly 3 blessings', () => {
        const blessings = generateBlessings(1);
        expect(blessings).toHaveLength(3);
    });

    it('should return unique blessings', () => {
        const blessings = generateBlessings(1);
        const ids = blessings.map(b => b.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(3);
    });

    it('should return blessings that exist in the pool', () => {
        const blessings = generateBlessings(1);
        blessings.forEach(blessing => {
            expect(blessing).toHaveProperty('id');
            expect(blessing).toHaveProperty('name');
            expect(blessing).toHaveProperty('description');
            expect(blessing).toHaveProperty('rarity');
            expect(blessing).toHaveProperty('effect');
            expect(blessing).toHaveProperty('icon');
        });
    });

    describe('Blessing Effects', () => {
        const baseStats: Stats = {
            hp: 100, maxHp: 100,
            mp: 50, maxMp: 50,
            attack: 10, defense: 10,
            magic: 10, speed: 10
        };

        it('temporal_might increases attack by 20%', () => {
            // We need to find the blessing first, but generateBlessings is random.
            // Let's call it many times to find it, or mock math.random, or just
            // since BLESSINGS_POOL is not exported, we can just grab it by mocking Math.random.
            // Wait, we can't import BLESSINGS_POOL directly. But we can keep calling until we find it.
            let temporalMight;
            for (let i = 0; i < 100; i++) {
                const blessings = generateBlessings(1);
                temporalMight = blessings.find(b => b.id === 'temporal_might');
                if (temporalMight) break;
            }

            expect(temporalMight).toBeDefined();
            if (temporalMight) {
                const updatedStats = temporalMight.effect(baseStats);
                expect(updatedStats.attack).toBe(12); // 10 * 1.2 = 12
            }
        });

        it('singularity doubles all stats but sets hp and maxHp to 1', () => {
            let singularity;
            for (let i = 0; i < 100; i++) {
                const blessings = generateBlessings(1);
                singularity = blessings.find(b => b.id === 'singularity');
                if (singularity) break;
            }

            expect(singularity).toBeDefined();
            if (singularity) {
                const updatedStats = singularity.effect(baseStats);
                expect(updatedStats.attack).toBe(20);
                expect(updatedStats.defense).toBe(20);
                expect(updatedStats.magic).toBe(20);
                expect(updatedStats.speed).toBe(20);
                expect(updatedStats.hp).toBe(1);
                expect(updatedStats.maxHp).toBe(1);
            }
        });

        it('timeless_vitality increases maxHp and hp by 25%', () => {
             let timelessVitality;
            for (let i = 0; i < 100; i++) {
                const blessings = generateBlessings(1);
                timelessVitality = blessings.find(b => b.id === 'timeless_vitality');
                if (timelessVitality) break;
            }

            expect(timelessVitality).toBeDefined();
            if (timelessVitality) {
                const updatedStats = timelessVitality.effect(baseStats);
                expect(updatedStats.hp).toBe(125);
                expect(updatedStats.maxHp).toBe(125);
            }
        });
    });
});
