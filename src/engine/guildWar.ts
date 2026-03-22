
import type { Territory } from './types';

// INITIAL_TERRITORIES is now dynamic and moved to the bottom of the file

const MAP_NAMES = ['Fortaleza de Ferro', 'Garganta do Dragão', 'Ruínas Esquecidas', 'Pilar dos Deuses', 'Planície Sangrenta', 'Vale do Crepúsculo', 'Acampamento Titã', 'Montanhas Uivantes'];
const CLANS: Territory['owner'][] = ['Xang', 'Zhauw', 'Yang', 'Kael', 'Vyrn', 'Neutral'];
const BONUS_TYPES: ('gold' | 'xp' | 'damage')[] = ['gold', 'xp', 'damage'];

export const generateGuildWarMap = (partyPower: number): Territory[] => {
    const tier = Math.max(1, Math.floor(Math.log10(Math.max(10, partyPower) / 10)));
    const numNodes = Math.floor(Math.random() * 8) + 12 + tier; // 12 to 20+ nodes

    const territories: Territory[] = [];
    const usedCoords = new Set<string>();

    const getCoord = (): { x: number, y: number } => {
        let x, y;
        do {
            x = Math.floor(Math.random() * 21) - 10;
            y = Math.floor(Math.random() * 21) - 10;
        } while (usedCoords.has(`${x},${y}`));
        usedCoords.add(`${x},${y}`);
        return { x, y };
    };

    // Spawn Oceans (Uncapturable terrain data for Voronoi)
    const numOceans = Math.floor(Math.random() * 6) + 4; // 4 to 9 ocean centers
    for (let i = 0; i < numOceans; i++) {
        territories.push({
            id: `ocean-${i}`,
            name: 'Mar Desconhecido',
            description: 'Águas profundas.',
            owner: 'Ocean',
            difficulty: 9999999,
            level: 1,
            upgradeCost: 0,
            bonus: { type: 'gold', value: 0 },
            coordinates: getCoord()
        });
    }

    for (let i = 0; i < numNodes; i++) {
        // Random placement from -10 to 10
        const coords = getCoord();

        // Difficulty scales around partyPower. From easy (30%) to hard (150%)
        const diffMultiplier = 0.3 + (Math.random() * 1.2);
        const difficulty = Math.max(500, partyPower * diffMultiplier);

        const bonusVal = 0.05 + (Math.random() * 0.1 * tier);

        territories.push({
            id: `gw-${Date.now()}-${i}`,
            name: `${MAP_NAMES[Math.floor(Math.random() * MAP_NAMES.length)]} ${Math.floor(Math.random() * 100)}`,
            description: 'Posto avançado inimigo ou terra devoluta.',
            owner: CLANS[Math.floor(Math.random() * CLANS.length)],
            difficulty: Math.floor(difficulty),
            level: 1,
            upgradeCost: Math.floor(difficulty * 2), // Example scaling
            bonus: {
                type: BONUS_TYPES[Math.floor(Math.random() * BONUS_TYPES.length)],
                value: parseFloat(bonusVal.toFixed(2))
            },
            coordinates: coords
        });
    }

    // Force first generated node to be neutral and easy
    territories[0].owner = 'Neutral';
    territories[0].difficulty = Math.floor(Math.max(500, partyPower * 0.2));
    territories[0].name = 'Ponto de Desembarque';

    return territories;
};

export const INITIAL_TERRITORIES: Territory[] = generateGuildWarMap(100);

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
