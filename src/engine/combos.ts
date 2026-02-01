import type { Hero } from './types';

export interface ComboDefinition {
    id: string;
    name: string;
    description: string;
    elements?: string[]; // e.g. ['fire', 'air'] - must have at least one hero of each
    classes?: string[]; // e.g. ['Warrior', 'Paladin'] - must have at least one of each
    multiplier: number; // Damage multiplier (replaces the default 5x)
    effect?: 'burn' | 'freeze' | 'heal' | 'crit';
    visualColor: string;
}

export const COMBO_DEFINITIONS: ComboDefinition[] = [
    {
        id: 'firestorm',
        name: 'INFERNO',
        description: 'Fire + Air: Creates a firestorm that incinerates enemies.',
        elements: ['fire', 'air'],
        multiplier: 8,
        effect: 'burn',
        visualColor: 'text-orange-600'
    },
    {
        id: 'blizzard',
        name: 'ABSOLUTE ZERO',
        description: 'Ice + Water: Flash freezes everything instantenously.',
        elements: ['ice', 'water'],
        multiplier: 7,
        effect: 'freeze',
        visualColor: 'text-cyan-400'
    },
    {
        id: 'divine_smite',
        name: 'DIVINE JUDGEMENT',
        description: 'Light + Paladin: A massive strike effectively healing allies.',
        elements: ['light'],
        classes: ['Paladin'],
        multiplier: 6,
        effect: 'heal',
        visualColor: 'text-yellow-300'
    },
    {
        id: 'void_strike',
        name: 'VOID ASSASSINATION',
        description: 'Dark + Rogue: A strike from the shadows with lethal precision.',
        elements: ['dark'],
        classes: ['Rogue'],
        multiplier: 10,
        effect: 'crit',
        visualColor: 'text-purple-600'
    },
    {
        id: 'overgrowth',
        name: 'VERDANT STORM',
        description: 'Nature + Earth: Nature reclaims the battlefield.',
        elements: ['nature', 'earth'],
        multiplier: 7,
        visualColor: 'text-green-500'
    }
];

export const checkActiveCombos = (heroes: Hero[]): ComboDefinition[] => {
    const activeHeroes = heroes.filter(h => h.assignment === 'combat' && !h.isDead);
    const elements = new Set(activeHeroes.map(h => h.element));
    const classes = new Set(activeHeroes.map(h => h.class));

    return COMBO_DEFINITIONS.filter(def => {
        let match = true;

        if (def.elements) {
            for (const el of def.elements) {
                if (!elements.has(el as any)) {
                    match = false;
                    break;
                }
            }
        }

        if (match && def.classes) {
            for (const cls of def.classes) {
                if (!classes.has(cls as any)) { // specific hero class type vs string
                    match = false;
                    break;
                }
            }
        }

        return match;
    });
};
