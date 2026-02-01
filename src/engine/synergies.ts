import type { Hero, ElementType } from './types';

export type SynergyType = 'defense' | 'vampirism' | 'attackSpeed' | 'resources' | 'burn' | 'freeze' | 'blind' | 'cd_reduction' | 'crit_dmg' | 'mitigation';

export interface Synergy {
    id: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    type: SynergyType;
    value: number;
}

interface SynergyDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: SynergyType;
    value: number;
    // Conditions
    classes?: string[]; // Exact match all (Legacy)
    minCount?: number; // Count check
    elements?: ElementType[]; // Requires these elements present in party
    classSet?: string[]; // Requires ANY X of these classes
    classSetCount?: number; // How many from classSet needed
    elementSet?: ElementType[]; // Requires ANY X of these elements
    elementSetCount?: number; // How many from elementSet needed
}

export const SYNERGY_DEFINITIONS: SynergyDefinition[] = [
    // --- CLASS FORMATIONS ---
    {
        id: 'iron_phalanx',
        name: 'Iron Phalanx',
        description: '2+ Warriors/Paladins: +20% Damage Mitigation',
        icon: '🛡️',
        type: 'mitigation',
        value: 0.2,
        classSet: ['Warrior', 'Paladin'],
        classSetCount: 2
    },
    {
        id: 'arcane_resonance',
        name: 'Arcane Resonance',
        description: '2+ Mages/Sorcerers: -20% Skill Cooldowns',
        icon: '🔮',
        type: 'cd_reduction',
        value: 0.2,
        classSet: ['Mage', 'Sorcerer', 'Warlock', 'Necromancer'],
        classSetCount: 2
    },
    {
        id: 'shadow_strike',
        name: 'Shadow Strike',
        description: '2+ Rogues/Assassins: +50% Crit Damage',
        icon: '🗡️',
        type: 'crit_dmg',
        value: 0.5,
        classSet: ['Rogue', 'Assassin', 'Ninja'],
        classSetCount: 2
    },

    // --- ELEMENTAL REACTIONS ---
    {
        id: 'reaction_burn',
        name: 'Inferno (Fire + Nature)',
        description: 'Burn: Deals 5% Max HP/sec to Boss',
        icon: '🔥',
        type: 'burn',
        value: 0.05,
        elements: ['fire', 'nature']
    },
    {
        id: 'reaction_steam',
        name: 'Steam Cloud (Fire + Water)',
        description: 'Blind: Boss Hit Chance reduced by 20%',
        icon: '☁️',
        type: 'blind',
        value: 0.2,
        elements: ['fire', 'water']
    },
    {
        id: 'reaction_freeze',
        name: 'Permafrost (Water + Nature)',
        description: 'Freeze: Boss Speed reduced by 30%',
        icon: '❄️',
        type: 'freeze',
        value: 0.3,
        elements: ['water', 'nature']
    },

    // --- ELEMENTAL RESONANCE ---
    {
        id: 'resonance_pyro',
        name: 'Pyro Resonance',
        description: '3+ Fire Heroes: +20% Attack Speed',
        icon: '🔥',
        type: 'attackSpeed',
        value: 0.2,
        elementSet: ['fire'],
        elementSetCount: 3
    },
    {
        id: 'resonance_hydro',
        name: 'Hydro Resonance',
        description: '3+ Water Heroes: +20% Vampirism',
        icon: '💧',
        type: 'vampirism',
        value: 0.2,
        elementSet: ['water'],
        elementSetCount: 3
    },
    {
        id: 'resonance_terra',
        name: 'Terra Resonance',
        description: '3+ Nature Heroes: +20% Mitigation',
        icon: '🛡️',
        type: 'mitigation',
        value: 0.2,
        elementSet: ['nature'],
        elementSetCount: 3
    },

    // --- LEGACY / GENERAL ---
    {
        id: 'divine_five',
        name: 'Divine Five',
        description: '5 Active Heroes: +10% Gold & XP',
        icon: '✨',
        type: 'resources',
        value: 0.1,
        minCount: 5
    }
];

export const checkSynergies = (heroes: Hero[]): Synergy[] => {
    const activeHeroes = heroes.filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked);
    const activeClasses = new Set(activeHeroes.map(h => h.class));
    const activeElements = new Set(activeHeroes.map(h => h.element));

    return SYNERGY_DEFINITIONS.map(def => {
        let active = false;

        // 1. Exact Class Match (Legacy)
        if (def.classes) {
            active = def.classes.every(c => activeClasses.has(c as any));
        }
        // 2. Class Set Count (New)
        else if (def.classSet && def.classSetCount) {
            const count = activeHeroes.filter(h => def.classSet?.includes(h.class)).length;
            active = count >= def.classSetCount;
        }
        // 3. Element Set Count (New - Resonance)
        else if (def.elementSet && def.elementSetCount) {
            const count = activeHeroes.filter(h => def.elementSet?.includes(h.element)).length;
            active = count >= def.elementSetCount;
        }
        // 4. Elemental Reaction (New)
        else if (def.elements) {
            active = def.elements.every(e => activeElements.has(e));
        }
        // 5. Simple Count (Legacy)
        else if (def.minCount) {
            active = activeHeroes.length >= def.minCount;
        }

        return {
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            isActive: active,
            type: def.type,
            value: def.value
        };
    }).filter(s => s.isActive);
};

export const getSynergySuggestions = (heroes: Hero[]): string[] => {
    const activeHeroes = heroes.filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked);
    const activeClasses = new Map<string, number>();
    const activeElements = new Map<ElementType, number>();

    // Count classes and elements
    activeHeroes.forEach(h => {
        activeClasses.set(h.class, (activeClasses.get(h.class) || 0) + 1);
        activeElements.set(h.element, (activeElements.get(h.element) || 0) + 1);
    });

    const suggestions: string[] = [];

    SYNERGY_DEFINITIONS.forEach(def => {
        // 1. Class Set Suggestions (e.g. Iron Phalanx)
        if (def.classSet && def.classSetCount) {
            const count = activeHeroes.filter(h => def.classSet?.includes(h.class)).length;
            if (count > 0 && count === def.classSetCount - 1) {
                // Determine which class names to show (mocking a "Class Group" name would be better, but listing works)
                suggestions.push(`Add 1 ${def.classSet[0]} type to trigger ${def.name}`);
            }
        }

        // 2. Element Set (Resonance)
        if (def.elementSet && def.elementSetCount) {
            const count = activeHeroes.filter(h => def.elementSet?.includes(h.element)).length;
            if (count > 0 && count === def.elementSetCount - 1) {
                const elem = def.elementSet[0];
                suggestions.push(`Add 1 ${elem.charAt(0).toUpperCase() + elem.slice(1)} Hero for ${def.name}`);
            }
        }

        // 3. Elemental Reactions (e.g. Fire + Nature)
        if (def.elements && def.elements.length === 2) {
            const [e1, e2] = def.elements;
            const hasE1 = (activeElements.get(e1) || 0) > 0;
            const hasE2 = (activeElements.get(e2) || 0) > 0;

            if (hasE1 && !hasE2) {
                suggestions.push(`Add ${e2.toUpperCase()} Hero to trigger ${def.name}`);
            } else if (!hasE1 && hasE2) {
                suggestions.push(`Add ${e1.toUpperCase()} Hero to trigger ${def.name}`);
            }
        }
    });

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
};
