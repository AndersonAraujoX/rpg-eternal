import type { WorldBoss } from './types';

const BOSS_NAMES = ['Titan of the Deep', 'Celestial Destroyer', 'Void Sovereign', 'Infernal Colossus', 'Storm Bringer'];
const BOSS_EMOJIS = ['🦑', '🪐', '🌑', '🔥', '⚡'];

export const generateWorldBoss = (tier: number): WorldBoss => {
    const baseHp = 1000000 * Math.pow(5, tier); // 1M, 5M, 25M...
    const name = BOSS_NAMES[Math.floor(Math.random() * BOSS_NAMES.length)];
    const emoji = BOSS_EMOJIS[Math.floor(Math.random() * BOSS_EMOJIS.length)];

    return {
        id: `wb-${Date.now()}`,
        name: `Tier ${tier} ${name}`,
        emoji,
        type: 'boss',
        level: tier * 100, // Level 100, 200, etc.
        isDead: false,
        element: 'neutral', // Could be randomized
        stats: {
            hp: baseHp,
            maxHp: baseHp,
            mp: 0,
            maxMp: 0,
            attack: 1000 * tier,
            magic: 1000 * tier,
            defense: 50 * tier,
            speed: 10
        },
        globalHp: baseHp,
        maxGlobalHp: baseHp,
        tier,
        participants: Math.floor(Math.random() * 50) + 10,
        endTime: Date.now() + 1000 * 60 * 60 * 4 // 4 Hours duration
    };
};

export const simulateGlobalDamage = (boss: WorldBoss): WorldBoss => {
    // Simulate damage from "other players"
    // Base damage is 0.05% to 0.1% of max HP per second, scaled by participants
    const damagePercent = (Math.random() * 0.0005 + 0.0005);
    const damage = Math.floor(boss.maxGlobalHp * damagePercent);

    // Sometimes a "massive hit" happens
    const criticalHit = Math.random() < 0.05 ? damage * 5 : 0;

    const newHp = Math.max(0, boss.globalHp - damage - criticalHit);

    return {
        ...boss,
        globalHp: newHp,
        participants: boss.participants + (Math.random() > 0.8 ? 1 : 0) // Slowly add players
    };
};

export const calculateWorldBossRewards = (tier: number, damageDealt: number) => {
    // Reward based on tier and damage contribution
    const tierMultiplier = tier * tier; // Tiers 1, 4, 9, 16
    const baseGold = 1000000 * tierMultiplier;

    // Scaling rewards
    const scalingGold = Math.floor(damageDealt * 0.5 * tier);
    const gold = baseGold + scalingGold;
    const souls = Math.floor(damageDealt * 0.1 * tier);
    const petXp = Math.floor(damageDealt * 0.05 * tier);
    const guildXp = Math.floor(damageDealt * 0.01 * tier);

    // Bonus Guild Members based on Tier
    const guildMembers = tier + 1;

    // Random Bonus Pet if damage is absurdly high (0.1% chance base, scaling up)
    const petChance = Math.min(1.0, damageDealt / (50000000 * tier));
    const wonPet = Math.random() < petChance;

    return { souls, gold, petXp, guildXp, guildMembers, wonPet, tier };
};
