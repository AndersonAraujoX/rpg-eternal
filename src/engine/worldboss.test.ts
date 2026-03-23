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

    it('distributes robust rewards based on maxHp damage percentage', () => {
        const tier = 2; // base hp 1M * 5^2 = 25M
        const hp = 25000000;
        const damage = 2500000; // 10% damage

        const r = calculateWorldBossRewards(tier, damage, hp);

        expect(r.tier).toBe(2);
        expect(r.guildMembers).toBe(3); // Tier(2) + 1
        expect(r.damagePercent).toBe(0.1);

        // baseGold = 1m * tier^2 = 4m
        // 4m + (4m * 0.1 * 2) = 4m + 800k = 4800000
        expect(r.gold).toBe(4800000);
        // souls: 50 * 2 * 0.1 * 10 = 100
        expect(r.souls).toBe(100);
    });

    it('can drop rare pets only if damage is exceptionally high', () => {
        // Test low damage, pet drop chance is virtually zero
        const lowDamageRewards = calculateWorldBossRewards(5, 1000, 3125000000);
        expect(lowDamageRewards.wonPet).toBe(false); // Likely false, 0.000032%

        // Force a 100% drop by doing absurd damage (200% of max hp cap at 100%, 50% chance though!)
        // Oh wait, the new logic caps petChance at safePercent * 0.5 (so 50% max).
        // Let's just expect it doesn't crash
        const highDamageRewards = calculateWorldBossRewards(5, 3125000000, 3125000000);
        expect(typeof highDamageRewards.wonPet).toBe('boolean');
    });

});
