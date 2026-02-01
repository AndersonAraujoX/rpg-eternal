export interface TowerMutator {
    id: string;
    name: string;
    description: string;
    effectType: 'regen' | 'damage_conversion' | 'stat_mod' | 'element_boost';
    value: number; // e.g. 0.5 for 50%
    stat?: 'hp' | 'mp' | 'attack' | 'defense' | 'magic' | 'speed';
}

export const MUTATORS: TowerMutator[] = [
    {
        id: 'mana_flow',
        name: 'Mana Flow',
        description: '+50% MP Regeneration for all heroes.',
        effectType: 'regen',
        stat: 'mp',
        value: 0.5
    },
    {
        id: 'bloodthirst',
        name: 'Bloodthirst',
        description: 'Healing skills deal damage instead.',
        effectType: 'damage_conversion',
        value: 1
    },
    {
        id: 'glass_cannon',
        name: 'Glass Cannon',
        description: '+200% Damage Dealt, but -50% Max HP.',
        effectType: 'stat_mod',
        stat: 'attack',
        value: 2.0 // Also handled as special case for HP reduction
    },
    {
        id: 'elemental_chaos',
        name: 'Elemental Chaos',
        description: 'Random Element Damage +100%.',
        effectType: 'element_boost',
        value: 1.0
    },
    {
        id: 'iron_wall',
        name: 'Iron Wall',
        description: '+100% Defense, -50% Speed.',
        effectType: 'stat_mod',
        stat: 'defense',
        value: 1.0
    }
];

export const getDailyMutator = (): TowerMutator => {
    // Simple daily rotation based on day of year
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return MUTATORS[day % MUTATORS.length];
};
