import type { ItemSet } from './types';

export const ITEM_SETS: ItemSet[] = [
    {
        id: 'set_iron',
        name: 'Iron Legion',
        bonuses: [{ count: 2, description: "Defense +20%", stats: { defense: 0.2 } }],
        itemIds: []
    },
    {
        id: 'set_arcane',
        name: 'Arcane Council',
        bonuses: [{ count: 2, description: "Magic +20%", stats: { magic: 0.2 } }],
        itemIds: []
    },
    {
        id: 'set_ranger',
        name: 'Forest Walker',
        bonuses: [{ count: 2, description: "Speed +15%", stats: { speed: 0.15 } }],
        itemIds: []
    },
    {
        id: 'set_dragon',
        name: 'Dragon Slayer',
        bonuses: [{ count: 3, description: "Attack +25%", stats: { attack: 0.25 } }],
        itemIds: []
    },
    {
        id: 'set_titan',
        name: 'Titan Guard',
        bonuses: [{ count: 3, description: "HP +30%", stats: { maxHp: 0.3 } }],
        itemIds: []
    }
];
