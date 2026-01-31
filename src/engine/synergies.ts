import type { Hero, ElementType, HeroClass } from './types';

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
            active = def.classes.every(c => activeClasses.has(c as HeroClass));
        }
        // 2. Class Set Count (New)
        else if (def.classSet && def.classSetCount) {
            const count = activeHeroes.filter(h => def.classSet?.includes(h.class)).length;
            active = count >= def.classSetCount;
        }
        // 3. Elemental Reaction (New)
        else if (def.elements) {
            active = def.elements.every(e => activeElements.has(e));
        }
        // 4. Simple Count (Legacy)
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
