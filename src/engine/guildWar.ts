
export interface Territory {
    id: string;
    name: string;
    description: string;
    owner: 'player' | 'Xang' | 'Zhauw' | 'Yang' | 'Neutral';
    difficulty: number; // Required Power to have 50% win chance
    level: number;      // Upgrade level (starts at 1)
    upgradeCost: number; // Gold cost for next upgrade
    bonus: {
        type: 'gold' | 'xp' | 'damage';
        value: number; // Multiplier (e.g., 0.1 for +10%)
    };
    coordinates: { x: number; y: number }; // For visual map (-10 to 10 grid)
}

export const INITIAL_TERRITORIES: Territory[] = [
    { id: 't1', name: 'Planícies Douradas', description: 'Terras férteis ricas em ouro.', owner: 'Xang', difficulty: 500, level: 1, upgradeCost: 2000, bonus: { type: 'gold', value: 0.10 }, coordinates: { x: -5, y: -5 } },
    { id: 't2', name: 'Picos de Ferro', description: 'Montanhas que protegem forjas antigas.', owner: 'Zhauw', difficulty: 1500, level: 1, upgradeCost: 5000, bonus: { type: 'damage', value: 0.05 }, coordinates: { x: 5, y: 5 } },
    { id: 't3', name: 'Floresta Mística', description: 'Florestas cheias de mana.', owner: 'Yang', difficulty: 3000, level: 1, upgradeCost: 10000, bonus: { type: 'xp', value: 0.10 }, coordinates: { x: -5, y: 5 } },
    { id: 't4', name: 'Fortaleza Central', description: 'O coração estratégico do reino.', owner: 'Neutral', difficulty: 10000, level: 1, upgradeCost: 25000, bonus: { type: 'damage', value: 0.15 }, coordinates: { x: 0, y: 0 } },
    { id: 't5', name: 'Terras das Sombras', description: 'Terras amaldiçoadas difíceis de manter.', owner: 'Neutral', difficulty: 25000, level: 1, upgradeCost: 50000, bonus: { type: 'gold', value: 0.25 }, coordinates: { x: 5, y: -5 } },
];

export const simulateSiege = (territory: Territory, partyPower: number): boolean => {
    const ratio = partyPower / territory.difficulty;
    let winChance = 0.5;

    if (ratio >= 2) winChance = 0.95;
    else if (ratio <= 0.5) winChance = 0.05;
    else {
        if (ratio < 1) {
            winChance = 0.05 + (ratio - 0.5) * (0.45 / 0.5);
        } else {
            winChance = 0.50 + (ratio - 1.0) * (0.45 / 1.0);
        }
    }

    return Math.random() < winChance;
};

/**
 * Returns the upgrade cost for the next level of a territory.
 */
export const upgradeCostForLevel = (baseCost: number, currentLevel: number): number => {
    return Math.floor(baseCost * Math.pow(2.5, currentLevel - 1));
};

/**
 * Applies an upgrade to a player-owned territory.
 * Increases bonus value by 25% and sets the next upgrade cost.
 */
export const applyTerritoryUpgrade = (territory: Territory): Territory => {
    const newLevel = territory.level + 1;
    return {
        ...territory,
        level: newLevel,
        bonus: {
            ...territory.bonus,
            value: parseFloat((territory.bonus.value * 1.25).toFixed(4)),
        },
        upgradeCost: upgradeCostForLevel(territory.upgradeCost, newLevel),
    };
};
