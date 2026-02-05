export type Affix = {
    id: string;
    name: string;
    stat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed';
    multiplier: number; // e.g., 1.2 for +20%
};

export const PREFIXES: Affix[] = [
    { id: 'p_heavy', name: 'Heavy', stat: 'defense', multiplier: 1.3 },
    { id: 'p_sharp', name: 'Sharp', stat: 'attack', multiplier: 1.3 },
    { id: 'p_swift', name: 'Swift', stat: 'speed', multiplier: 1.2 },
    { id: 'p_arcane', name: 'Arcane', stat: 'magic', multiplier: 1.3 },
    { id: 'p_vital', name: 'Vital', stat: 'hp', multiplier: 1.2 },
    { id: 'p_ancient', name: 'Ancient', stat: 'attack', multiplier: 1.5 }, // Rare
    { id: 'p_divine', name: 'Divine', stat: 'attack', multiplier: 2.0 }, // Legendary
];

export const SUFFIXES: Affix[] = [
    { id: 's_bear', name: 'of the Bear', stat: 'hp', multiplier: 1.3 },
    { id: 's_wolf', name: 'of the Wolf', stat: 'attack', multiplier: 1.2 },
    { id: 's_eagle', name: 'of the Eagle', stat: 'speed', multiplier: 1.2 },
    { id: 's_void', name: 'of the Void', stat: 'magic', multiplier: 1.3 },
    { id: 's_titan', name: 'of the Titan', stat: 'defense', multiplier: 1.3 },
];

export const EVOLVING_ITEMS: Record<string, import('./types').Item> = {
    'rusty_blade': {
        id: 'rusty_blade',
        name: 'Rusty Blade',
        type: 'weapon',
        rarity: 'common',
        stat: 'attack',
        value: 10,
        sockets: 1,
        runes: [],
        level: 1,
        xp: 0,
        maxXp: 100,
        evolutionId: 'blade_king'
    },
    'blade_king': {
        id: 'blade_king',
        name: 'Blade of the King',
        type: 'weapon',
        rarity: 'epic',
        stat: 'attack',
        value: 50,
        sockets: 2,
        runes: [],
        level: 2,
        xp: 0,
        maxXp: 500,
        evolutionId: 'godslayer'
    },
    'godslayer': {
        id: 'godslayer',
        name: 'Godslayer',
        type: 'weapon',
        rarity: 'legendary',
        stat: 'attack',
        value: 200,
        sockets: 3,
        runes: [],
        level: 3 // Max level
    }
};

export const gainWeaponXp = (item: import('./types').Item, xpAmount: number): { item: import('./types').Item, evolved: boolean, log?: string } => {
    if (!item.evolutionId || item.xp === undefined || item.maxXp === undefined) return { item, evolved: false };

    let newItem = { ...item };
    newItem.xp = (newItem.xp || 0) + xpAmount;

    if (newItem.xp >= (newItem.maxXp || 999999)) {
        // Evolve!
        if (EVOLVING_ITEMS[item.evolutionId]) {
            const nextStage = EVOLVING_ITEMS[item.evolutionId];
            newItem = {
                ...nextStage,
                id: item.id, // Keep original ID? Or change it? Usually change ID to match new item.
                // Actually, if we change ID, we might lose tracking if tracking by ID.
                // But item instances usually have unique IDs in inventory?
                // The `EVOLVING_ITEMS` keys are like templates.
                // Let's assume we replace the item stats but keep the instance ID if it was unique?
                // In this codebase, items seem to be POJOs.
                // Let's use the new template but carry over Runes?
                runes: item.runes || [],
                sockets: nextStage.sockets,
                // If we want to keep specific roll (affix), we copy them.
                prefix: item.prefix,
                suffix: item.suffix,
                quality: item.quality
            };
            return { item: newItem, evolved: true, log: `${item.name} evolved into ${newItem.name}!` };
        }
    }

    return { item: newItem, evolved: false };
};
