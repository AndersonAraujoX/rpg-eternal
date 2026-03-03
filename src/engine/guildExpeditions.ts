import type { Expedition } from './types';

export const GUILD_EXPEDITIONS: Expedition[] = [
    {
        id: 'gexp_standard',
        name: 'Patrulha de Guilda',
        description: 'Uma patrulha padrão para coletar recursos Básicos.',
        duration: 14400, // 4h
        difficulty: 10,
        rewards: [
            { type: 'gold', min: 2000, max: 5000 },
            { type: 'item', min: 1, max: 3 }
        ],
        heroIds: [],
        guild: true
    },
    {
        id: 'gexp_advanced',
        name: 'Exploração das Profundezas',
        description: 'Expedição perigosa em busca de materiais raros.',
        duration: 28800, // 8h
        difficulty: 30,
        rewards: [
            { type: 'gold', min: 10000, max: 25000 },
            { type: 'artifact', min: 0, max: 1 }
        ],
        heroIds: [],
        guild: true
    },
    {
        id: 'gexp_epic',
        name: 'Conquista Continental',
        description: 'Uma jornada épica que requer os melhores heróis reserva.',
        duration: 86400, // 24h
        difficulty: 100,
        rewards: [
            { type: 'gold', min: 50000, max: 150000 },
            { type: 'item', min: 5, max: 10 }
        ],
        heroIds: [],
        guild: true
    }
];

export const validateGuildExpeditionTeam = (heroIds: string[], allHeroes: any[]): boolean => {
    return heroIds.every(id => {
        const hero = allHeroes.find(h => h.id === id);
        return hero && hero.assignment === 'none' && hero.unlocked;
    });
};
