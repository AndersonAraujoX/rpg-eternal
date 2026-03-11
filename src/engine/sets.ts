import type { ItemSet } from './types';

export const ITEM_SETS: ItemSet[] = [
    {
        id: 'set_iron',
        name: 'Iron Legion',
        bonuses: [{ stat: 'defense', value: 0.2, piecesRequired: 2 }],
        pieces: []
    },
    {
        id: 'set_arcane',
        name: 'Arcane Council',
        bonuses: [{ stat: 'magic', value: 0.2, piecesRequired: 2 }],
        pieces: []
    },
    {
        id: 'set_ranger',
        name: 'Forest Walker',
        bonuses: [{ stat: 'speed', value: 0.15, piecesRequired: 2 }],
        pieces: []
    },
    {
        id: 'set_dragon',
        name: 'Dragon Slayer',
        bonuses: [{ stat: 'attack', value: 0.25, piecesRequired: 3 }],
        pieces: []
    },
    {
        id: 'set_titan',
        name: 'Titan Guard',
        bonuses: [{ stat: 'hp', value: 0.3, piecesRequired: 3 }],
        pieces: []
    }
];
