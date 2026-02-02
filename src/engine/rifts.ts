import type { Stats } from './types';

export interface RiftBlessing {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'legendary';
    effect: (stats: Stats) => Stats;
    icon: string;
}

const BLESSINGS_POOL: RiftBlessing[] = [
    {
        id: 'temporal_might',
        name: 'Temporal Might',
        description: '+20% Attack Damage',
        rarity: 'common',
        effect: (s) => ({ ...s, attack: Math.floor(s.attack * 1.2) }),
        icon: '⚔️'
    },
    {
        id: 'chrono_shield',
        name: 'Chrono Shield',
        description: '+20% Defense',
        rarity: 'common',
        effect: (s) => ({ ...s, defense: Math.floor(s.defense * 1.2) }),
        icon: '🛡️'
    },
    {
        id: 'warp_speed',
        name: 'Warp Speed',
        description: '+15% Speed',
        rarity: 'common',
        effect: (s) => ({ ...s, speed: Math.floor(s.speed * 1.15) }),
        icon: '⚡'
    },
    {
        id: 'timeless_vitality',
        name: 'Timeless Vitality',
        description: '+25% Max HP',
        rarity: 'common',
        effect: (s) => ({ ...s, maxHp: Math.floor(s.maxHp * 1.25), hp: Math.floor(s.hp * 1.25) }),
        icon: '❤️'
    },
    {
        id: 'echo_strike',
        name: 'Echo Strike',
        description: '+50% Attack, -10% Def',
        rarity: 'rare',
        effect: (s) => ({ ...s, attack: Math.floor(s.attack * 1.5), defense: Math.floor(s.defense * 0.9) }),
        icon: '🌠'
    },
    {
        id: 'void_essence',
        name: 'Void Essence',
        description: '+40% Magic, +10% MP',
        rarity: 'rare',
        effect: (s) => ({ ...s, magic: Math.floor(s.magic * 1.4), maxMp: Math.floor(s.maxMp * 1.1) }),
        icon: '🔮'
    },
    {
        id: 'singularity',
        name: 'Singularity',
        description: '+100% All Stats, but Set HP to 1',
        rarity: 'legendary',
        effect: (s) => ({ ...s, attack: s.attack * 2, defense: s.defense * 2, magic: s.magic * 2, speed: s.speed * 2, maxHp: 1, hp: 1 }),
        icon: '🌌'
    }
];

export const generateBlessings = (_floor: number): RiftBlessing[] => {
    // Return 3 unique random blessings
    const shuffled = [...BLESSINGS_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};
