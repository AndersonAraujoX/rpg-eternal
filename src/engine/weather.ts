
export type WeatherType = 'Clear' | 'Rain' | 'Sandstorm' | 'Eclipse' | 'Aurora' | 'Blizzard';

export interface WeatherEffect {
    type: WeatherType;
    name: string;
    description: string;
    bonus: {
        stat: 'fish' | 'hitChance' | 'darkDmg' | 'xp' | 'iceDmg' | 'none';
        value: number; // Multiplier (e.g., 0.2 for +20%)
    };
    icon: string; // Emoji for simplicity for now
}

export const WEATHER_DATA: Record<WeatherType, WeatherEffect> = {
    'Clear': { type: 'Clear', name: 'Clear Skies', description: 'Perfect weather for adventuring.', bonus: { stat: 'none', value: 0 }, icon: '☀️' },
    'Rain': { type: 'Rain', name: 'Heavy Rain', description: 'Fish are more active.', bonus: { stat: 'fish', value: 0.5 }, icon: '🌧️' },
    'Sandstorm': { type: 'Sandstorm', name: 'Sandstorm', description: 'Visibility reduced. Hit chance lowered.', bonus: { stat: 'hitChance', value: -0.2 }, icon: '🌪️' },
    'Eclipse': { type: 'Eclipse', name: 'Solar Eclipse', description: 'Dark forces are empowered.', bonus: { stat: 'darkDmg', value: 0.5 }, icon: '🌑' },
    'Aurora': { type: 'Aurora', name: 'Aurora Borealis', description: 'Magical energy permeates the air.', bonus: { stat: 'xp', value: 0.25 }, icon: '🌌' },
    'Blizzard': { type: 'Blizzard', name: 'Blizzard', description: 'Freezing winds boost ice magic.', bonus: { stat: 'iceDmg', value: 0.3 }, icon: '❄️' },
};

export const getRandomWeather = (): WeatherType => {
    const keys = Object.keys(WEATHER_DATA) as WeatherType[];
    // Weighted random? Or simple uniform?
    // Let's do: Clear (40%), Others (12% each)
    const rand = Math.random();
    if (rand < 0.4) return 'Clear';

    // Remaining 60% split among 5 types -> 12% each
    const others = keys.filter(k => k !== 'Clear');
    return others[Math.floor(Math.random() * others.length)];
};
