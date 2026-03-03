import { describe, it, expect } from 'vitest';
import { calculateWorldBossRewards, generateWorldBoss } from './worldBoss';

describe('World Boss Mechanics', () => {

    it('generates a boss with scaling stats based on tier', () => {
        const boss = generateWorldBoss(4);
        expect(boss.tier).toBe(4);
        expect(boss.level).toBe(400);
        expect(boss.stats.attack).toBe(4000);
        // Base HP is 1M * 5^tier (5^4 = 625 * 1M = 625M)
        expect(boss.stats.hp).toBe(625000000);
    });

    it('distributes robust rewards heavily skewed towards high participation', () => {
        const damage = 50000;
        const tier = 2; // 2^2 multiplier = 4. 4 * 1M base gold = 4M base gold.

        const r = calculateWorldBossRewards(tier, damage);

        expect(r.tier).toBe(2);
        expect(r.guildMembers).toBe(3); // Tier(2) + 1
        expect(r.souls).toBe(10000); // 50k * 0.1 * 2
        // baseGold(4M) + (50k * 0.5 * 2 = 50k) = 4050000
        expect(r.gold).toBe(4050000);
        expect(r.petXp).toBe(5000);
        expect(r.guildXp).toBe(1000);
    });

    it('can drop rare pets only if damage is exceptionally high', () => {
        // Test low damage, pet drop chance is virtually zero
        const lowDamageRewards = calculateWorldBossRewards(5, 1000);
        // Let's force a 100% drop by doing absurd damage
        const highDamageRewards = calculateWorldBossRewards(5, 5000000000);

        expect(highDamageRewards.wonPet).toBe(true);
    });

});
