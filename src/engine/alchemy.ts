import type { Resources, Potion } from './types';


export const brewPotion = (p: Potion, resources: Resources): { success: boolean, cost: Partial<Resources>, error?: string } => {
    // Check costs
    for (const c of p.cost) {
        if ((resources[c.type] || 0) < c.amount) {
            return { success: false, cost: {}, error: `Not enough ${c.type}` };
        }
    }

    // Deduct
    const cost: Partial<Resources> = {};
    p.cost.forEach(c => cost[c.type as keyof Resources] = c.amount);

    return { success: true, cost };
};
