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
