import type { MarketTrend, MarketTrendType } from './types';

export const MARKET_TRENDS: Record<MarketTrendType, Omit<MarketTrend, 'endTime'>> = {
    neutral: {
        type: 'neutral',
        multiplier: 1.0,
        name: 'Stable Market',
        description: 'No major shifts in the market.'
    },
    bull: {
        type: 'bull',
        multiplier: 1.25,
        name: 'Bull Market',
        description: 'High demand! Items are more expensive to buy.'
    },
    bear: {
        type: 'bear',
        multiplier: 0.75,
        name: 'Bear Market',
        description: 'Low demand. Items are cheaper to buy.'
    },
    volatile: {
        type: 'volatile',
        multiplier: 1.5,
        name: 'Volatile Fluctuations',
        description: 'Prices are all over the place!'
    },
    crash: {
        type: 'crash',
        multiplier: 0.5,
        name: 'Market Crash',
        description: 'Economic disaster! Everything is half price.'
    },
    boom: {
        type: 'boom',
        multiplier: 2.0,
        name: 'Economic Boom',
        description: 'Hyper-inflation! Prices have skyrocketed.'
    }
};

export const generateRandomTrend = (durationMinutes: number = 60): MarketTrend => {
    const types: MarketTrendType[] = ['neutral', 'bull', 'bear', 'volatile', 'crash', 'boom'];
    const weights = [40, 20, 20, 10, 5, 5]; // Percentages
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedType: MarketTrendType = 'neutral';
    
    for (let i = 0; i < types.length; i++) {
        if (random < weights[i]) {
            selectedType = types[i];
            break;
        }
        random -= weights[i];
    }

    const template = MARKET_TRENDS[selectedType];
    return {
        ...template,
        endTime: Date.now() + (durationMinutes * 60 * 1000)
    };
};
