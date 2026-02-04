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
    const souls = Math.floor(damageDealt * 0.1 * tier);
    const gold = Math.floor(damageDealt * 0.5 * tier);

    return { souls, gold };
};
