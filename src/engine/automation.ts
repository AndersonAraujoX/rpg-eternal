import type { Talent, Hero, Tower, Quest } from './types';

// Returns a quest ID to claim if conditions met
export const getAutoQuestClaim = (upgrades: string[], quests: Quest[]): string | null => {
    if (!upgrades.includes('auto_quest')) return null;
    const completed = quests.find(q => q.isCompleted);
    return completed ? completed.id : null;
};

// Returns true if we should summon a hero from tavern
export const shouldSummonTavern = (gold: number, upgrades: string[]): boolean => {
    return upgrades.includes('auto_tavern') && gold > 1000 && Math.random() < 0.1;
};

// Returns the ID of the talent to buy, or null
export const getAutoTalentToBuy = (upgrades: string[], souls: number, talents: Talent[]): string | null => {
    if (!upgrades.includes('auto_talent')) return null;
    if (Math.random() > 0.1) return null; // Throttle

    const affordable = talents.find(t => {
        const cost = Math.floor(t.cost * Math.pow(t.costScaling, t.level));
        return souls >= cost;
    });
    return affordable ? affordable.id : null;
};

// Returns true if we should revive dead heroes
export const shouldAutoRevive = (upgrades: string[], heroes: Hero[]): boolean => {
    if (!upgrades.includes('auto_revive')) return false;
    return heroes.some(h => h.isDead);
};

// Returns a new Tower state if we should climb
export const getAutoTowerClimb = (upgrades: string[], tower: Tower): Tower | null => {
    if (!upgrades.includes('auto_tower')) return null;
    if (Math.random() > 0.01) return null; // Throttle

    // Simulate climb
    return { ...tower, floor: tower.floor + 1, maxFloor: Math.max(tower.maxFloor, tower.floor + 1) };
};
