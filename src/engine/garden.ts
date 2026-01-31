import type { GardenPlot, SeedType } from './types';
import { SEEDS } from './types';

export const INITIAL_GARDEN: GardenPlot[] = [
    { id: 0, unlocked: true, seed: null, growth: 0, plantedAt: 0 },
    { id: 1, unlocked: true, seed: null, growth: 0, plantedAt: 0 },
    { id: 2, unlocked: true, seed: null, growth: 0, plantedAt: 0 },
    { id: 3, unlocked: false, seed: null, growth: 0, plantedAt: 0 },
    { id: 4, unlocked: false, seed: null, growth: 0, plantedAt: 0 },
    { id: 5, unlocked: false, seed: null, growth: 0, plantedAt: 0 },
    { id: 6, unlocked: false, seed: null, growth: 0, plantedAt: 0 },
    { id: 7, unlocked: false, seed: null, growth: 0, plantedAt: 0 },
    { id: 8, unlocked: false, seed: null, growth: 0, plantedAt: 0 },
];

export const UNLOCK_COSTS = [0, 0, 0, 1000, 2500, 5000, 10000, 25000, 50000]; // Gold costs for index 0-8

export const tickGarden = (plots: GardenPlot[], now: number): GardenPlot[] => {
    return plots.map(plot => {
        if (!plot.seed || plot.growth >= 100) return plot;

        const seedData = SEEDS[plot.seed];
        const elapsed = (now - plot.plantedAt) / 1000; // seconds
        const progress = Math.min(100, (elapsed / seedData.growthTime) * 100);

        return { ...plot, growth: progress };
    });
};

export const plantSeed = (plots: GardenPlot[], index: number, seed: SeedType, gold: number): { newPlots: GardenPlot[], cost: number, success: boolean } => {
    const plot = plots[index];
    const seedData = SEEDS[seed];

    if (!plot || !plot.unlocked || plot.seed) return { newPlots: plots, cost: 0, success: false };
    if (gold < seedData.cost) return { newPlots: plots, cost: 0, success: false };

    const newPlots = [...plots];
    newPlots[index] = { ...plot, seed, growth: 0, plantedAt: Date.now() };

    return { newPlots, cost: seedData.cost, success: true };
};

export const harvestPlot = (plots: GardenPlot[], index: number): { newPlots: GardenPlot[], yieldAmount: number, success: boolean } => {
    const plot = plots[index];
    if (!plot || !plot.seed || plot.growth < 100) return { newPlots: plots, yieldAmount: 0, success: false };

    const seedData = SEEDS[plot.seed];
    const amount = Math.floor(Math.random() * (seedData.harvestYield.max - seedData.harvestYield.min + 1)) + seedData.harvestYield.min;

    const newPlots = [...plots];
    newPlots[index] = { ...plot, seed: null, growth: 0, plantedAt: 0 };

    return { newPlots, yieldAmount: amount, success: true };
};

export const unlockPlot = (plots: GardenPlot[], index: number, gold: number): { newPlots: GardenPlot[], cost: number, success: boolean } => {
    const plot = plots[index];
    const cost = UNLOCK_COSTS[index];

    if (!plot || plot.unlocked) return { newPlots: plots, cost: 0, success: false };
    if (gold < cost) return { newPlots: plots, cost: 0, success: false };

    const newPlots = [...plots];
    newPlots[index] = { ...plot, unlocked: true };

    return { newPlots, cost, success: true };
};
