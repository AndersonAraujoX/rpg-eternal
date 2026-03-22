import type { ElementType } from './types';

export type WeatherType = 'Clear' | 'Rain' | 'Sandstorm' | 'Eclipse' | 'Aurora' | 'Blizzard' | 'Heatwave';

export interface WeatherEffect {
    type: WeatherType;
    name: string;
    description: string;
    bonus: {
        stat: 'fish' | 'hitChance' | 'xp' | 'none';
        value: number; // Multiplier (e.g., 0.2 for +20%)
    };
    elementModifiers: Partial<Record<ElementType, number>>; // Modificador de Dano (ex: 1.5 = +50%, 0.5 = -50%)
    guildWarBonus: {
        stat: 'gold' | 'xp' | 'none';
        value: number; // Modificador de rendimento na guerra
    };
    icon: string;
}

export const WEATHER_DATA: Record<WeatherType, WeatherEffect> = {
    'Clear': {
        type: 'Clear', name: 'Céus Limpos', description: 'Tempo neutro ideal para se aventurar.',
        bonus: { stat: 'none', value: 0 },
        elementModifiers: {},
        guildWarBonus: { stat: 'none', value: 0 },
        icon: '☀️'
    },
    'Rain': {
        type: 'Rain', name: 'Estação das Chuvas', description: 'Monstros de água ganham bônus, Fogo fraqueja. +50% Pesca.',
        bonus: { stat: 'fish', value: 0.5 },
        elementModifiers: { 'water': 1.5, 'fire': 0.7 },
        guildWarBonus: { stat: 'none', value: 0 },
        icon: '🌧️'
    },
    'Sandstorm': {
        type: 'Sandstorm', name: 'Tempestade de Areia', description: 'Natureza morre de calor. Rendimento de Ouro na Guerra -20%.',
        bonus: { stat: 'hitChance', value: -0.2 },
        elementModifiers: { 'nature': 0.7, 'fire': 1.2 },
        guildWarBonus: { stat: 'gold', value: -0.2 },
        icon: '🌪️'
    },
    'Eclipse': {
        type: 'Eclipse', name: 'Eclipse Solar', description: 'As Trevas dominam, a Luz desaparece. Guerra dá mais Ouro.',
        bonus: { stat: 'none', value: 0 },
        elementModifiers: { 'dark': 1.5, 'light': 0.5 },
        guildWarBonus: { stat: 'gold', value: 0.3 },
        icon: '🌑'
    },
    'Aurora': {
        type: 'Aurora', name: 'Aurora Boreal', description: 'A Magia da Luz flui. Rendimento de XP na Guerra +50%.',
        bonus: { stat: 'xp', value: 0.25 },
        elementModifiers: { 'light': 1.5, 'dark': 0.5 },
        guildWarBonus: { stat: 'xp', value: 0.5 },
        icon: '🌌'
    },
    'Blizzard': {
        type: 'Blizzard', name: 'Era do Gelo', description: 'Tudo congela. Heróis de Água/Gelo brilham. Natureza sofre.',
        bonus: { stat: 'none', value: 0 },
        elementModifiers: { 'water': 1.5, 'nature': 0.7 },
        guildWarBonus: { stat: 'xp', value: -0.2 },
        icon: '❄️'
    },
    'Heatwave': {
        type: 'Heatwave', name: 'Onda de Calor', description: 'Fogo devastador atinge seu ápice. Água evapora.',
        bonus: { stat: 'none', value: 0 },
        elementModifiers: { 'fire': 1.5, 'water': 0.5 },
        guildWarBonus: { stat: 'gold', value: 0.2 },
        icon: '🔥'
    }
};

export const getRandomWeather = (): WeatherType => {
    const keys = Object.keys(WEATHER_DATA) as WeatherType[];
    const rand = Math.random();
    if (rand < 0.3) return 'Clear';

    const others = keys.filter(k => k !== 'Clear');
    return others[Math.floor(Math.random() * others.length)];
};
