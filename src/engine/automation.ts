import type { Resources, GameStats, Expedition } from './types';
import { processFishingAdvanced } from './fishing';

export const shouldSummonTavern = (gold: number, upgrades: Record<string, number>): boolean => {
    const autoSummon = upgrades['auto_summon'] || 0;
    return autoSummon > 0 && gold >= 5000;
};

export const processGlobalAutomation = (
    stats: GameStats,
    resources: Resources,
    _expeditions: Expedition[]
): { resources: Partial<Resources>, stats: Partial<GameStats>, expeditions: Expedition[] } => {
    const changes: Partial<Resources> = {};
    const statChanges: Partial<GameStats> = {};

    // Automation logic
    const _ignore = resources; // Just to satisfy lint if needed, or remove completely if confident
    let updatedExpeditions = [..._expeditions];

    // 1. Fishing Automation
    if (stats.automationActive?.fishing) {
        const { fish, legendary } = processFishingAdvanced(5); // 5 "ticks" of fishing
        changes.fish = (changes.fish || 0) + fish;
        if (legendary) {
            statChanges.legendaryFishCount = (stats.legendaryFishCount || 0) + 1;
        }
    }

    // 2. Garden Automation (Placeholder - simplified logic)
    if (stats.automationActive?.garden) {
        changes.herbs = (changes.herbs || 0) + 2;
    }

    // 3. Expedition Automation (Auto-relaunch logic would be in hook, but this handles rewards)
    // Most automation logic that involves complex state transitions belongs in the React context/hook.

    return { resources: changes, stats: statChanges, expeditions: updatedExpeditions };
};
