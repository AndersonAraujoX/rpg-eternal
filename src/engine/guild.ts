import type { Stats } from './types';

export interface Monument {
    id: string;
    name: string;
    icon: string;
    description: string;
    baseCost: number;
    costScaling: number;
    maxLevel: number;
    // Effect definition
    effectType: 'stat_mult' | 'gold_mult' | 'xp_mult';
    stat?: keyof Stats;
    valuePerLevel: number;
}

export const MONUMENT_DEFINITIONS: Monument[] = [
    {
        id: 'statue_midas',
        name: 'Statue of Midas',
        icon: '💰',
        description: 'Increases Gold gain.',
        baseCost: 5000,
        costScaling: 1.5,
        maxLevel: 50,
        effectType: 'gold_mult',
        valuePerLevel: 0.05 // +5% per level
    },
    {
        id: 'altar_war',
        name: 'Altar of War',
        icon: '⚔️',
        description: 'Increases Party Attack.',
        baseCost: 10000,
        costScaling: 1.4,
        maxLevel: 50,
        effectType: 'stat_mult',
        stat: 'attack',
        valuePerLevel: 0.02 // +2% per level
    },
    {
        id: 'shrine_wisdom',
        name: 'Shrine of Wisdom',
        icon: '📜',
        description: 'Increases XP gain.',
        baseCost: 7500,
        costScaling: 1.45,
        maxLevel: 50,
        effectType: 'xp_mult',
        valuePerLevel: 0.03 // +3% per level
    },
    {
        id: 'fountain_life',
        name: 'Fountain of Life',
        icon: '⛲',
        description: 'Increases Party HP.',
        baseCost: 8000,
        costScaling: 1.4,
        maxLevel: 50,
        effectType: 'stat_mult',
        stat: 'hp',
        valuePerLevel: 0.02 // +2% per level
    }
];

export const getMonumentCost = (baseCost: number, level: number, scaling: number): number => {
    return Math.floor(baseCost * Math.pow(scaling, level));
};

export const getMonumentValue = (baseValue: number, level: number): number => {
    return baseValue * level;
};
