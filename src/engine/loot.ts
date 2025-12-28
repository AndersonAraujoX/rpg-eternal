import type { Item } from './types';
import { PREFIXES, SUFFIXES } from './items';

export const generateLoot = (level: number): Item => {
    const sockets = Math.floor(Math.random() * 3) + 1; // 1 to 3 sockets

    // Item Affix Logic
    let itemName = 'Item';
    let itemStat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed' = 'attack';
    let itemValue = level;

    // Randomize Stat Type sometimes?
    // For now keep simple
    const hasPrefix = Math.random() < 0.4;
    const hasSuffix = Math.random() < 0.4;

    if (hasPrefix) {
        const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
        itemName = `${prefix.name} ${itemName}`;
        if (prefix.stat === itemStat) itemValue = Math.floor(itemValue * prefix.multiplier);
    }

    if (hasSuffix) {
        const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        itemName = `${itemName} ${suffix.name}`;
        itemValue = Math.floor(itemValue * suffix.multiplier);
    }

    return {
        id: Math.random().toString(),
        name: itemName,
        type: 'weapon',
        stat: itemStat,
        value: itemValue,
        rarity: 'common',
        sockets,
        runes: []
    };
};

import type { MonsterCard } from './types';

export const getCardStat = (emoji: string): MonsterCard['stat'] => {
    switch (emoji) {
        case '🐉':
        case '🦁':
        case '👹': return 'attack';
        case '🦠':
        case '🐸': return 'gold';
        case '👻':
        case '💀': return 'xp';
        case '🐢':
        case '🗿': return 'defense';
        default: return 'attack';
    }
};
