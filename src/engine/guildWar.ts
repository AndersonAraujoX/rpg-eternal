
export interface Territory {
    id: string;
    name: string;
    description: string;
    owner: 'player' | 'Xang' | 'Zhauw' | 'Yang' | 'Neutral';
    difficulty: number; // Required Power to have 50% win chance
    bonus: {
        type: 'gold' | 'xp' | 'damage';
        value: number; // Multiplier (e.g., 0.1 for +10%)
    };
    coordinates: { x: number; y: number }; // For visual map (-10 to 10 grid)
}

export const INITIAL_TERRITORIES: Territory[] = [
    { id: 't1', name: 'Golden Plains', description: 'Fertile lands rich in gold.', owner: 'Xang', difficulty: 500, bonus: { type: 'gold', value: 0.1 }, coordinates: { x: -5, y: -5 } },
    { id: 't2', name: 'Iron Peaks', description: 'Mountains protecting ancient forges.', owner: 'Zhauw', difficulty: 1500, bonus: { type: 'damage', value: 0.05 }, coordinates: { x: 5, y: 5 } },
    { id: 't3', name: 'Mystic Woods', description: 'Forests teeming with mana.', owner: 'Yang', difficulty: 3000, bonus: { type: 'xp', value: 0.1 }, coordinates: { x: -5, y: 5 } },
    { id: 't4', name: 'Central Keep', description: 'The strategic heart of the realm.', owner: 'Neutral', difficulty: 10000, bonus: { type: 'damage', value: 0.15 }, coordinates: { x: 0, y: 0 } },
    { id: 't5', name: 'Shadow Badlands', description: 'Cursed lands, hard to hold.', owner: 'Neutral', difficulty: 25000, bonus: { type: 'gold', value: 0.25 }, coordinates: { x: 5, y: -5 } },
];

export const simulateSiege = (territory: Territory, partyPower: number): boolean => {
    // Determine win chance
    // If power == difficulty, 50% chance.
    // If power >= 2x difficulty, 95% chance.
    // If power <= 0.5x difficulty, 5% chance.

    const ratio = partyPower / territory.difficulty;
    let winChance = 0.5;

    if (ratio >= 2) winChance = 0.95;
    else if (ratio <= 0.5) winChance = 0.05;
    else {
        // Linear interpolation between 0.5 and 2.0 -> 0.05 to 0.95? 
        // Let's use a sigmoid-like curve or simple linear mapping for simplicity
        // 0.5 -> 0.05
        // 1.0 -> 0.50
        // 2.0 -> 0.95
        if (ratio < 1) {
            winChance = 0.05 + (ratio - 0.5) * (0.45 / 0.5); // 0.5 range maps to 0.45 prob
        } else {
            winChance = 0.50 + (ratio - 1.0) * (0.45 / 1.0); // 1.0 range maps to 0.45 prob
        }
    }

    return Math.random() < winChance;
};
