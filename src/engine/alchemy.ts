import type { Resources, Potion, Stats } from './types';


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
export const transmuteResources = (from: keyof Resources, to: keyof Resources, amount: number, resources: Resources): { success: boolean, cost: Partial<Resources>, gain: Partial<Resources>, error?: string } => {
    const ratio = 100; // 100 common -> 1 rare
    const costAmount = amount * ratio;

    if ((resources[from] || 0) < costAmount) {
        return { success: false, cost: {}, gain: {}, error: `Not enough ${from}` };
    }

    const cost: Partial<Resources> = { [from]: costAmount };
    const gain: Partial<Resources> = { [to]: amount };

    return { success: true, cost, gain };
};

export const ELIXIRS = {
    ELIXIR_OF_ETERNITY: {
        id: 'pot_eternity',
        name: 'Elixir of Eternity',
        description: 'Permanently increases Max HP by 5',
        stat: 'maxHp' as keyof Stats,
        value: 5,
        limit: 10,
        cost: [{ type: 'mithril' as keyof Resources, amount: 5 }, { type: 'herbs' as keyof Resources, amount: 50 }]
    }
};
