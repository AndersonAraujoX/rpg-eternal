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

// ─── Sistema de Ciclo Dia / Noite ────────────────────────────────────────────
export type DayNightPhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface DayNightEffect {
    phase: DayNightPhase;
    name: string;
    icon: string;
    description: string;
    /** Multiplicador de ouro coletado (1 = neutro) */
    goldMultiplier: number;
    /** Multiplicador de XP dos heróis */
    xpMultiplier: number;
    /** Multiplicador de dano geral */
    damageMultiplier: number;
    /** Bônus extra para heróis dark/light */
    elementBonus: Partial<Record<ElementType, number>>;
}

export const DAY_NIGHT_DATA: Record<DayNightPhase, DayNightEffect> = {
    dawn: {
        phase: 'dawn',
        name: 'Amanhecer',
        icon: '🌅',
        description: 'O sol nasce. Heróis recuperam energia e XP extra.',
        goldMultiplier: 1.0,
        xpMultiplier: 1.3,
        damageMultiplier: 1.0,
        elementBonus: { light: 1.2 },
    },
    day: {
        phase: 'day',
        name: 'Dia',
        icon: '☀️',
        description: 'Plena luz do sol. Mineração e recursos fluem com mais eficiência.',
        goldMultiplier: 1.25,
        xpMultiplier: 1.0,
        damageMultiplier: 1.0,
        elementBonus: { fire: 1.1, light: 1.1 },
    },
    dusk: {
        phase: 'dusk',
        name: 'Entardecer',
        icon: '🌇',
        description: 'A luz diminui. A magia começa a se intensificar.',
        goldMultiplier: 1.0,
        xpMultiplier: 1.0,
        damageMultiplier: 1.15,
        elementBonus: { dark: 1.2, fire: 1.1 },
    },
    night: {
        phase: 'night',
        name: 'Noite',
        icon: '🌙',
        description: 'As trevas dominam. Monstros ficam mais fortes, mas recompensas dobram.',
        goldMultiplier: 2.0,
        xpMultiplier: 1.5,
        damageMultiplier: 1.3,
        elementBonus: { dark: 1.5, water: 1.1, light: 0.7 },
    },
};

/** Duração de cada fase em segundos (total = 20 min de ciclo) */
export const DAY_NIGHT_DURATION: Record<DayNightPhase, number> = {
    dawn: 120,   // 2 min
    day: 480,    // 8 min
    dusk: 120,   // 2 min
    night: 480,  // 8 min
};

const CYCLE_TOTAL = Object.values(DAY_NIGHT_DURATION).reduce((a, b) => a + b, 0); // 1200s

/** Retorna a fase atual com base no timestamp (epoch seconds) */
export const getDayNightPhase = (nowSeconds: number): DayNightPhase => {
    const t = nowSeconds % CYCLE_TOTAL;
    const phases: DayNightPhase[] = ['dawn', 'day', 'dusk', 'night'];
    let elapsed = 0;
    for (const phase of phases) {
        elapsed += DAY_NIGHT_DURATION[phase];
        if (t < elapsed) return phase;
    }
    return 'night';
};

/** Segundos restantes na fase atual */
export const getDayNightSecondsLeft = (nowSeconds: number): number => {
    const t = nowSeconds % CYCLE_TOTAL;
    const phases: DayNightPhase[] = ['dawn', 'day', 'dusk', 'night'];
    let elapsed = 0;
    for (const phase of phases) {
        elapsed += DAY_NIGHT_DURATION[phase];
        if (t < elapsed) return elapsed - t;
    }
    return CYCLE_TOTAL - t;
};
