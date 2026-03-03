import type { ClassTalent, HeroClass, ClassMastery } from '../engine/types';

export const CLASS_TALENTS: Record<string, ClassTalent[]> = {
    'Warrior': [
        {
            id: 'war_counter',
            name: 'Contra-Ataque',
            description: '10% de chance de retaliação imediata.',
            unlocked: false,
            pointsCost: 1,
            bonus: {},
            specialEffect: 'counter_attack'
        },
        {
            id: 'war_hp',
            name: 'Vigor do Veterano',
            description: '+20% de Vida Máxima.',
            unlocked: false,
            pointsCost: 1,
            bonus: { maxHp: 0.2 },
        }
    ],
    'Mage': [
        {
            id: 'mag_echo',
            name: 'Eco de Mana',
            description: '15% de chance de ignorar custo de MP.',
            unlocked: false,
            pointsCost: 1,
            bonus: {},
            specialEffect: 'mana_echo'
        },
        {
            id: 'mag_power',
            name: 'Poder Arcano',
            description: '+25% de Dano Mágico.',
            unlocked: false,
            pointsCost: 1,
            bonus: { magic: 0.25 },
        }
    ],
    // More classes can be added here
};

export const MASTERY_LEVEL_XP = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));
