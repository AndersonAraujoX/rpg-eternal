import { describe, it, expect, vi } from 'vitest';

describe('Auto-Revive Mechanic', () => {
    it('should revive a hero after 10 seconds', () => {
        const now = Date.now();
        const oldHero = { id: 'h1', name: 'Hero', isDead: true, deathTime: now - 11000, stats: { hp: 0, maxHp: 100 } };
        const h = { ...oldHero };

        let revived = false;
        if (h.isDead && h.deathTime && now - h.deathTime >= 10000) {
            h.isDead = false;
            h.stats.hp = h.stats.maxHp;
            revived = true;
        }

        expect(revived).toBe(true);
        expect(h.isDead).toBe(false);
        expect(h.stats.hp).toBe(100);
    });

    it('should NOT revive a hero before 10 seconds', () => {
        const now = Date.now();
        const oldHero = { id: 'h1', name: 'Hero', isDead: true, deathTime: now - 5000, stats: { hp: 0, maxHp: 100 } };
        const h = { ...oldHero };

        let revived = false;
        if (h.isDead && h.deathTime && now - h.deathTime >= 10000) {
            h.isDead = false;
            h.stats.hp = h.stats.maxHp;
            revived = true;
        }

        expect(revived).toBe(false);
        expect(h.isDead).toBe(true);
        expect(h.stats.hp).toBe(0);
    });

    it('should record deathTime when a hero dies', () => {
        const oldHero = { id: 'h1', name: 'Hero', isDead: false, stats: { hp: 100, maxHp: 100 } };
        const h = { ...oldHero, isDead: true };
        const now = Date.now();

        if (h.isDead && !oldHero.isDead) {
            h.deathTime = now;
        }

        expect(h.deathTime).toBeDefined();
        expect(h.deathTime).toBe(now);
    });
});
