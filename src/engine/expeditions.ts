import type { Expedition, Hero } from './types';

export const startExpedition = (exp: Expedition, heroes: Hero[]): Hero[] => {
    // Mark heroes as assigned to expedition
    const updatedHeroes = heroes.map(h => {
        if (exp.heroIds.includes(h.id)) {
            return { ...h, assignment: 'expedition' as const };
        }
        return h;
    });
    return updatedHeroes;
};

export const checkExpeditionCompletion = (exp: Expedition): boolean => {
    if (!exp.startTime) return false;
    const now = Date.now();
    return (now - exp.startTime) >= (exp.duration * 1000);
};

export const claimExpeditionRewards = (exp: Expedition): { type: string, amount: number }[] => {
    // Generate rewards
    const rewards: { type: string, amount: number }[] = [];
    exp.rewards.forEach(r => {
        const amt = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
        if (amt > 0) rewards.push({ type: r.type, amount: amt });
    });
    return rewards;
};
