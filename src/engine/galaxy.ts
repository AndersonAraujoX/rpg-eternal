import type { GalaxySector } from './types';

export const INITIAL_GALAXY: GalaxySector[] = [
    { id: 'g1', name: 'Terra Nova', description: 'A fertile starting world.', x: 0, y: 0, level: 10, difficulty: 1000, reward: { type: 'global_gold', value: 0.1 }, isOwned: false, type: 'planet' }, // +10% Gold
    { id: 'g2', name: 'Asteroid Belt Alpha', description: 'Rich in minerals.', x: 15, y: -10, level: 20, difficulty: 5000, reward: { type: 'mithril', value: 5 }, isOwned: false, type: 'asteroid' },
    { id: 'g3', name: 'Crimson Moon', description: 'Orbiting a gas giant.', x: -20, y: 15, level: 30, difficulty: 15000, reward: { type: 'global_damage', value: 0.1 }, isOwned: false, type: 'planet' }, // +10% Dmg
    { id: 'g4', name: 'Void Outpost', description: 'Abandoned station.', x: 30, y: 30, level: 50, difficulty: 50000, reward: { type: 'souls', value: 5 }, isOwned: false, type: 'nebula' },
    { id: 'g5', name: 'Ice Giant', description: 'Frozen wasteland.', x: -40, y: -20, level: 70, difficulty: 100000, reward: { type: 'gold', value: 500 }, isOwned: false, type: 'planet' },
    { id: 'g6', name: 'Molten Core', description: 'Unstable planet.', x: 50, y: 0, level: 90, difficulty: 250000, reward: { type: 'mining_speed', value: 0.2 }, isOwned: false, type: 'planet' }, // +20% Mining
    { id: 'g7', name: 'Stardust Nebula', description: 'Concentrated mystic energy.', x: 0, y: 60, level: 120, difficulty: 500000, reward: { type: 'starlight', value: 1 }, isOwned: false, type: 'nebula' },
    { id: 'g8', name: 'The Black Sun', description: 'Ancient star.', x: -60, y: 60, level: 150, difficulty: 1000000, reward: { type: 'global_xp', value: 0.2 }, isOwned: false, type: 'star' }, // +20% XP
    { id: 'g9', name: 'Cyber Prime', description: 'Technological ruin.', x: 80, y: -40, level: 180, difficulty: 2000000, reward: { type: 'global_gold', value: 0.5 }, isOwned: false, type: 'planet' }, // +50% Gold
    { id: 'g10', name: 'Omega Point', description: 'Edge of the galaxy.', x: 0, y: -80, level: 250, difficulty: 5000000, reward: { type: 'starlight', value: 5 }, isOwned: false, type: 'star' },

    // Fillers
    { id: 'g11', name: 'Kepler-186f', description: 'Habitable zone.', x: -10, y: -30, level: 15, difficulty: 2000, reward: { type: 'gold', value: 100 }, isOwned: false, type: 'planet' },
    { id: 'g12', name: 'Proxima Centauri', description: 'Red Dwarf neighbor.', x: 20, y: 20, level: 25, difficulty: 8000, reward: { type: 'global_damage', value: 0.05 }, isOwned: false, type: 'star' }, // +5% Dmg
    { id: 'g13', name: 'Sirius B', description: 'White Dwarf.', x: -30, y: 40, level: 40, difficulty: 30000, reward: { type: 'mithril', value: 10 }, isOwned: false, type: 'star' },
    { id: 'g14', name: 'Pillars of Creation', description: 'Star factory.', x: 60, y: -60, level: 100, difficulty: 300000, reward: { type: 'souls', value: 10 }, isOwned: false, type: 'nebula' },
    { id: 'g15', name: 'Titan', description: 'Methane lakes.', x: -50, y: -50, level: 60, difficulty: 80000, reward: { type: 'gold', value: 1000 }, isOwned: false, type: 'planet' },
];

export const calculateGalaxyIncome = (galaxy: GalaxySector[]) => {
    let income = { gold: 0, mithril: 0, souls: 0, starlight: 0 };
    galaxy.filter(s => s.isOwned).forEach(s => {
        if (s.reward.type === 'gold') income.gold += s.reward.value;
        if (s.reward.type === 'mithril') income.mithril += s.reward.value;
        if (s.reward.type === 'souls') income.souls += s.reward.value;
        if (s.reward.type === 'starlight') income.starlight += s.reward.value;
    });
    return income;
};

export const calculateGalaxyBuffs = (galaxy: GalaxySector[]) => {
    let buffs = { goldMult: 0, damageMult: 0, xpMult: 0, miningSpeed: 0 };
    galaxy.filter(s => s.isOwned).forEach(s => {
        if (s.reward.type === 'global_gold') buffs.goldMult += s.reward.value;
        if (s.reward.type === 'global_damage') buffs.damageMult += s.reward.value;
        if (s.reward.type === 'global_xp') buffs.xpMult += s.reward.value;
        if (s.reward.type === 'mining_speed') buffs.miningSpeed += s.reward.value;
    });
    return buffs;
};
