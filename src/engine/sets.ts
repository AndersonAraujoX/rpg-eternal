import type { ItemSet } from './types';

export const ITEM_SETS: ItemSet[] = [
    {
        id: 'set_iron',
        name: 'Iron Legion',
        bonusStat: 'defense',
        bonusValue: 0.2, // +20% Defense
        requiredPieces: 2
    },
    {
        id: 'set_arcane',
        name: 'Arcane Council',
        bonusStat: 'magic',
        bonusValue: 0.2, // +20% Magic
        requiredPieces: 2
    },
    {
        id: 'set_ranger',
        name: 'Forest Walker',
        bonusStat: 'speed',
        bonusValue: 0.15, // +15% Speed
        requiredPieces: 2
    },
    {
        id: 'set_dragon',
        name: 'Dragon Slayer',
        bonusStat: 'attack',
        bonusValue: 0.25, // +25% Attack
        requiredPieces: 3
    },
    {
        id: 'set_titan',
        name: 'Titan Guard',
        bonusStat: 'hp',
        bonusValue: 0.3, // +30% HP
        requiredPieces: 3
    }
];
