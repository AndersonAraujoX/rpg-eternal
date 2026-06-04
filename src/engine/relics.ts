import type { ChamberRelic } from './types';

export const CHAMBER_RELICS: ChamberRelic[] = [
    {
        id: 'relic_chalice',
        name: 'Cálice da Eternidade',
        description: 'Aumenta o HP Máximo da equipe em +25%',
        bonusType: 'max_hp',
        bonusValue: 0.25,
        cost: 50000,
        currency: 'gold',
        emoji: '🏆'
    },
    {
        id: 'relic_hourglass',
        name: 'Ampulheta do Tempo',
        description: 'Aumenta a velocidade do jogo em +10%',
        bonusType: 'game_speed',
        bonusValue: 0.10,
        cost: 10000,
        currency: 'souls',
        emoji: '⏳'
    },
    {
        id: 'relic_insignia',
        name: 'Brasão da Coragem',
        description: 'Trava o moral da equipe para nunca cair abaixo de 50%',
        bonusType: 'moral_lock',
        bonusValue: 50,
        cost: 5000,
        currency: 'souls',
        emoji: '🎖️'
    },
    {
        id: 'relic_void_orb',
        name: 'Orbe do Vácuo',
        description: 'Reduz o dano recebido de chefes em -12%',
        bonusType: 'dodge_chance',
        bonusValue: 0.12,
        cost: 100,
        currency: 'voidMatter',
        emoji: '🔮'
    },
    {
        id: 'relic_golden_fish',
        name: 'Peixe Dourado Ancestral',
        description: 'Duplica a chance de pescar Peixes Lendários',
        bonusType: 'double_fish',
        bonusValue: 2.0,
        cost: 80000,
        currency: 'gold',
        emoji: '🐠'
    },
    {
        id: 'relic_alchemy_scroll',
        name: 'Pergaminho Alquímico',
        description: 'Reduz o custo de fabricação de poções em -20%',
        bonusType: 'alchemy_reduction',
        bonusValue: 0.20,
        cost: 200,
        currency: 'voidMatter',
        emoji: '📜'
    }
];
