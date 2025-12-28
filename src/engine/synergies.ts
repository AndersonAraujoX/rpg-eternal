import type { Hero } from './types';

export interface Synergy {
    id: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    type: 'defense' | 'vampirism' | 'attackSpeed' | 'resources';
    value: number;
}

export const SYNERGY_DEFINITIONS = [
    {
        id: 'holy_trinity',
        name: 'Holy Trinity',
        description: 'Paladin + Healer + Mage: +20% Defense',
        icon: '🛡️',
        classes: ['Paladin', 'Healer', 'Mage'],
        type: 'defense',
        value: 0.2
    },
    {
        id: 'shadow_covenant',
        name: 'Shadow Covenant',
        description: 'Warlock + Necromancer + Rogue: +15% Life Steal',
        icon: '🩸',
        classes: ['Warlock', 'Necromancer', 'Rogue'],
        type: 'vampirism',
        value: 0.15
    },
    {
        id: 'natures_wrath',
        name: "Nature's Wrath",
        description: 'Dragoon + Sage + Warrior: +20% Attack Speed',
        icon: '🍃',
        classes: ['Dragoon', 'Sage', 'Warrior'],
        type: 'attackSpeed',
        value: 0.2
    },
    {
        id: 'divine_five',
        name: 'Divine Five',
        description: '5 Active Heroes: +10% Gold & XP',
        icon: '✨',
        count: 5,
        type: 'resources',
        value: 0.1
    }
];

export const checkSynergies = (heroes: Hero[]): Synergy[] => {
    const activeHeroes = heroes.filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked);
    const activeClasses = new Set(activeHeroes.map(h => h.class));

    return SYNERGY_DEFINITIONS.map(def => {
        let active = false;

        // Class Combo Check
        if (def.classes) {
            active = def.classes.every(c => activeClasses.has(c as any));
        }

        // Count Check (e.g. 5 heroes)
        if (def.count) {
            active = activeHeroes.length >= def.count;
        }

        return {
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            isActive: active,
            type: def.type as any,
            value: def.value
        };
    }).filter(s => s.isActive);
};
