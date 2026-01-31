import type { Item } from './types';
import { PREFIXES, SUFFIXES } from './items';
import { ITEM_SETS } from './sets';

export const generateLoot = (level: number): Item => {
    const sockets = Math.floor(Math.random() * 3) + 1; // 1 to 3 sockets

    // Item Affix Logic
    let itemName = 'Item';
    let itemStat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed' = 'attack';
    let itemValue = level;
    let itemSlot: 'weapon' | 'armor' | 'accessory' = 'weapon';

    const rand = Math.random();
    if (rand < 0.33) {
        itemSlot = 'weapon';
        itemStat = 'attack';
        itemName = 'Sword';
    } else if (rand < 0.66) {
        itemSlot = 'armor';
        itemStat = 'defense';
        itemName = 'Plate';
    } else {
        itemSlot = 'accessory';
        itemStat = Math.random() < 0.5 ? 'hp' : 'magic';
        itemName = 'Ring';
    }

    // Set Item Logic (10% chance)
    let setId: string | undefined;
    if (Math.random() < 0.1) {
        const set = ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
        setId = set.id;
        itemName = `${set.name} ${itemName}`;
        itemValue = Math.floor(itemValue * 1.5); // Set items are stronger
    } else {
        // Normal Affixes
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
    }

    return {
        id: Math.random().toString(),
        name: itemName,
        type: itemSlot === 'accessory' ? 'accessory' : (itemSlot === 'weapon' ? 'weapon' : 'armor'), // Types align with simple types for now
        slot: itemSlot,
        setId,
        stat: itemStat,
        value: itemValue,
        rarity: setId ? 'epic' : 'common', // Set items are Epic
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
