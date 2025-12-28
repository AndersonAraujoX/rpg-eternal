import type { GalaxySector } from './types';

export const INITIAL_GALAXY: GalaxySector[] = [
    { id: 'g1', name: 'Terra Nova', description: 'A fertile starting world.', x: 0, y: 0, level: 10, difficulty: 1000, reward: { type: 'gold', value: 5 }, isOwned: false, type: 'planet' },
    { id: 'g2', name: 'Asteroid Belt Alpha', description: 'Rich in minerals.', x: 15, y: -10, level: 20, difficulty: 5000, reward: { type: 'mithril', value: 0.1 }, isOwned: false, type: 'asteroid' },
    { id: 'g3', name: 'Crimson Moon', description: 'orbiting a gas giant.', x: -20, y: 15, level: 30, difficulty: 15000, reward: { type: 'gold', value: 20 }, isOwned: false, type: 'planet' },
    { id: 'g4', name: 'Void Outpost', description: 'Abandoned station.', x: 30, y: 30, level: 50, difficulty: 50000, reward: { type: 'souls', value: 0.05 }, isOwned: false, type: 'nebula' },
    { id: 'g5', name: 'Ice Giant', description: 'Frozen wasteland.', x: -40, y: -20, level: 70, difficulty: 100000, reward: { type: 'gold', value: 50 }, isOwned: false, type: 'planet' },
    { id: 'g6', name: 'Molten Core', description: 'Unstable planet.', x: 50, y: 0, level: 90, difficulty: 250000, reward: { type: 'mithril', value: 0.5 }, isOwned: false, type: 'planet' },
    { id: 'g7', name: 'Stardust Nebula', description: 'Concentrated mystic energy.', x: 0, y: 60, level: 120, difficulty: 500000, reward: { type: 'starlight', value: 0.01 }, isOwned: false, type: 'nebula' },
    { id: 'g8', name: 'The Black Sun', description: 'Ancient star.', x: -60, y: 60, level: 150, difficulty: 1000000, reward: { type: 'souls', value: 0.2 }, isOwned: false, type: 'star' },
    { id: 'g9', name: 'Cyber Prime', description: 'Technological ruin.', x: 80, y: -40, level: 180, difficulty: 2000000, reward: { type: 'gold', value: 200 }, isOwned: false, type: 'planet' },
    { id: 'g10', name: 'Omega Point', description: 'Edge of the galaxy.', x: 0, y: -80, level: 250, difficulty: 5000000, reward: { type: 'starlight', value: 0.05 }, isOwned: false, type: 'star' },

    // Fillers
    { id: 'g11', name: 'Kepler-186f', description: 'Habitable zone.', x: -10, y: -30, level: 15, difficulty: 2000, reward: { type: 'gold', value: 8 }, isOwned: false, type: 'planet' },
    { id: 'g12', name: 'Proxima Centauri', description: 'Red Dwarf neighbor.', x: 20, y: 20, level: 25, difficulty: 8000, reward: { type: 'gold', value: 15 }, isOwned: false, type: 'star' },
    { id: 'g13', name: 'Sirius B', description: 'White Dwarf.', x: -30, y: 40, level: 40, difficulty: 30000, reward: { type: 'mithril', value: 0.2 }, isOwned: false, type: 'star' },
    { id: 'g14', name: 'Pillars of Creation', description: 'Star factory.', x: 60, y: -60, level: 100, difficulty: 300000, reward: { type: 'souls', value: 0.1 }, isOwned: false, type: 'nebula' },
    { id: 'g15', name: 'Titan', description: 'Methane lakes.', x: -50, y: -50, level: 60, difficulty: 80000, reward: { type: 'gold', value: 40 }, isOwned: false, type: 'planet' },
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
