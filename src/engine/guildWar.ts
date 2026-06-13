
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

    // Force first generated land node to be neutral and easy
    const firstLandIndex = numOceans;
    territories[firstLandIndex].owner = 'Neutral';
    territories[firstLandIndex].difficulty = Math.floor(Math.max(500, partyPower * 0.2));
    territories[firstLandIndex].name = 'Ponto de Desembarque';

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

// ═══════════════════════════════════════════════════════════════
// GvG (Guilda vs Guilda) System
// ═══════════════════════════════════════════════════════════════

import type { FakePlayer } from './playerSimulation';

export interface GvGWarLog {
    message: string;
    type: 'info' | 'success' | 'danger' | 'achievement';
    timestamp: number;
}

export interface GvGTower {
    id: string;
    name: string;
    defenderName: string;
    defenderAvatar: string;
    defenderPower: number;
    maxHp: number;
    hp: number;
    destroyed: boolean;
}

export interface GvGWarState {
    playerGuildName: string;
    rivalGuildName: string;
    playerScore: number;
    rivalScore: number;
    towers: GvGTower[];
    playerAttacksLeft: number;
    warLogs: GvGWarLog[];
    tickCount: number;
    warActive: boolean;
    lastTickTime: number;
    alliedBotIds: string[];
    rivalBotIds: string[];
}

const GVG_TOWER_NAMES = [
    'Torre da Perdição', 'Bastião Sombrio', 'Pilar de Obsidiana',
    'Sentinela de Ferro', 'Cidadela do Crepúsculo'
];

const GVG_RIVAL_GUILDS = [
    'Legião Carmesim', 'Pacto das Sombras', 'Ordem do Abismo',
    'Clã dos Imortais', 'Aliança Negra', 'Guardiões do Caos',
    'Irmandade Fantasma', 'Conselho das Trevas'
];

/**
 * Initialize a new GvG war by partitioning the fake players into
 * allied and rival pools and creating 5 defensive towers.
 */
export const initGvGWar = (
    playerPower: number,
    fakePlayers: FakePlayer[],
    playerGuildName: string
): GvGWarState => {
    // Pick a rival guild name
    const rivalGuildName = GVG_RIVAL_GUILDS[Math.floor(Math.random() * GVG_RIVAL_GUILDS.length)];

    // Partition bots into allied and rival pools
    const shuffled = [...fakePlayers].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    const alliedBots = shuffled.slice(0, half);
    const rivalBots = shuffled.slice(half);

    // Create 5 towers with rival defenders
    const towers: GvGTower[] = GVG_TOWER_NAMES.map((name, idx) => {
        // Pick a rival bot for each tower, cycle if fewer than 5 rivals
        const defender = rivalBots[idx % rivalBots.length];
        // Scale tower power around player power (60% to 140%)
        const scaledPower = Math.floor(playerPower * (0.6 + Math.random() * 0.8));
        const towerHp = Math.floor(scaledPower * 2) + 500;

        return {
            id: `gvg-tower-${idx}`,
            name,
            defenderName: defender?.name || `Rival_${idx}`,
            defenderAvatar: defender?.avatar || '💀',
            defenderPower: scaledPower,
            maxHp: towerHp,
            hp: towerHp,
            destroyed: false
        };
    });

    return {
        playerGuildName,
        rivalGuildName,
        playerScore: 0,
        rivalScore: 0,
        towers,
        playerAttacksLeft: 3,
        warLogs: [{
            message: `⚔️ Guerra iniciada: ${playerGuildName} vs ${rivalGuildName}!`,
            type: 'achievement',
            timestamp: Date.now()
        }],
        tickCount: 0,
        warActive: true,
        lastTickTime: Date.now(),
        alliedBotIds: alliedBots.map(b => b.id),
        rivalBotIds: rivalBots.map(b => b.id)
    };
};

/**
 * Calculate a simple combat win chance based on power ratio.
 */
const gvgWinChance = (attackerPower: number, defenderPower: number): number => {
    const ratio = attackerPower / Math.max(1, defenderPower);
    if (ratio >= 2) return 0.90;
    if (ratio <= 0.5) return 0.10;
    // Linear interpolation between 0.10 and 0.90
    return 0.10 + (ratio - 0.5) * (0.80 / 1.5);
};

/**
 * Run one tick of the GvG war simulation.
 * An allied bot attacks a random standing tower.
 * A rival bot attacks back (scoring points if successful).
 */
export const simulateGvGTick = (
    state: GvGWarState,
    fakePlayers: FakePlayer[],
    activeEvent?: any,
    gvgDefenseBonus: number = 0
): GvGWarState => {
    if (!state.warActive) return state;

    const now = Date.now();
    const newLogs: GvGWarLog[] = [];
    let { playerScore, rivalScore, towers } = state;
    towers = towers.map(t => ({ ...t })); // shallow clone

    const standingTowers = towers.filter(t => !t.destroyed);
    const alliedBots = fakePlayers.filter(b => state.alliedBotIds.includes(b.id));
    const rivalBots = fakePlayers.filter(b => state.rivalBotIds.includes(b.id));

    // === Allied bot attacks a random enemy tower ===
    if (standingTowers.length > 0 && alliedBots.length > 0) {
        const attacker = alliedBots[Math.floor(Math.random() * alliedBots.length)];
        const targetIdx = Math.floor(Math.random() * standingTowers.length);
        const target = standingTowers[targetIdx];

        let attackerPower = attacker.power;
        if (activeEvent?.type === 'festival') {
            attackerPower = Math.floor(attackerPower * 1.15);
        }

        const won = Math.random() < gvgWinChance(attackerPower, target.defenderPower);

        if (won) {
            const damage = Math.floor(attackerPower * (0.3 + Math.random() * 0.4));
            const towerRef = towers.find(t => t.id === target.id)!;
            towerRef.hp = Math.max(0, towerRef.hp - damage);

            if (towerRef.hp <= 0) {
                towerRef.destroyed = true;
                playerScore += 500;
                newLogs.push({
                    message: `🏰 ${attacker.name} destruiu a ${target.name}! +500 pts`,
                    type: 'achievement',
                    timestamp: now
                });
            } else {
                playerScore += 50;
                if (Math.random() < 0.3) {
                    newLogs.push({
                        message: `⚔️ ${attacker.name} atacou ${target.name} (-${damage} HP)`,
                        type: 'success',
                        timestamp: now
                    });
                }
            }
        } else {
            rivalScore += 25;
            if (Math.random() < 0.2) {
                newLogs.push({
                    message: `🛡️ ${target.defenderName} defendeu ${target.name} contra ${attacker.name}`,
                    type: 'danger',
                    timestamp: now
                });
            }
        }
    }

    // === Rival bot counter-attack (scores points) ===
    if (rivalBots.length > 0) {
        const attacker = rivalBots[Math.floor(Math.random() * rivalBots.length)];
        const defender = alliedBots.length > 0
            ? alliedBots[Math.floor(Math.random() * alliedBots.length)]
            : null;

        let defPower = defender ? defender.power : 100;
        if (activeEvent?.type === 'crisis' || activeEvent?.type === 'raid') {
            defPower = Math.floor(defPower * 0.90);
        }
        if (gvgDefenseBonus > 0) {
            defPower = Math.floor(defPower * (1 + gvgDefenseBonus));
        }
        const won = Math.random() < gvgWinChance(attacker.power, defPower);

        if (won) {
            rivalScore += 75;
            if (Math.random() < 0.2) {
                newLogs.push({
                    message: `💥 ${attacker.name} (rival) venceu um confronto! +75 pts para ${state.rivalGuildName}`,
                    type: 'danger',
                    timestamp: now
                });
            }
        } else {
            playerScore += 30;
        }
    }

    // Check if all towers destroyed -> war ends
    const allDestroyed = towers.every(t => t.destroyed);
    let warActive: boolean = state.warActive;

    if (allDestroyed) {
        warActive = false;
        const isVictory = playerScore > rivalScore;
        newLogs.push({
            message: isVictory
                ? `🏆 VITÓRIA! ${state.playerGuildName} venceu a guerra com ${playerScore} pts!`
                : `💀 DERROTA! ${state.rivalGuildName} venceu com ${rivalScore} pts.`,
            type: isVictory ? 'achievement' : 'danger',
            timestamp: now
        });
    }

    // Also end war after 60 ticks to prevent stalemates
    const newTickCount = state.tickCount + 1;
    if (newTickCount >= 60 && warActive) {
        warActive = false;
        const isVictory = playerScore > rivalScore;
        newLogs.push({
            message: isVictory
                ? `🏆 Tempo esgotado! ${state.playerGuildName} vence por ${playerScore} a ${rivalScore}!`
                : `💀 Tempo esgotado! ${state.rivalGuildName} vence por ${rivalScore} a ${playerScore}.`,
            type: isVictory ? 'achievement' : 'danger',
            timestamp: now
        });
    }

    return {
        ...state,
        playerScore,
        rivalScore,
        towers,
        warLogs: [...newLogs, ...state.warLogs].slice(0, 30),
        tickCount: newTickCount,
        warActive,
        lastTickTime: now
    };
};

/**
 * Resolve a manual player attack against a specific tower.
 * Awards bonus points on victory.
 */
export const playerAttackTower = (
    state: GvGWarState,
    towerId: string,
    playerPower: number,
    activeEvent?: any
): { updatedState: GvGWarState; won: boolean; damage: number } => {
    if (!state.warActive || state.playerAttacksLeft <= 0) {
        return { updatedState: state, won: false, damage: 0 };
    }

    const towers = state.towers.map(t => ({ ...t }));
    const tower = towers.find(t => t.id === towerId);

    if (!tower || tower.destroyed) {
        return { updatedState: state, won: false, damage: 0 };
    }

    let attackerPower = playerPower;
    if (activeEvent?.type === 'festival') {
        attackerPower = Math.floor(attackerPower * 1.15);
    }

    const won = Math.random() < gvgWinChance(attackerPower, tower.defenderPower);
    const newLogs: GvGWarLog[] = [];
    let { playerScore } = state;
    let damage = 0;

    if (won) {
        damage = Math.floor(attackerPower * (0.5 + Math.random() * 0.5));
        tower.hp = Math.max(0, tower.hp - damage);

        if (tower.hp <= 0) {
            tower.destroyed = true;
            playerScore += 1000; // Bonus for manual kill
            newLogs.push({
                message: `🔥 VOCÊ destruiu a ${tower.name}! +1000 pts bônus!`,
                type: 'achievement',
                timestamp: Date.now()
            });
        } else {
            playerScore += 200; // Bonus for manual hit
            newLogs.push({
                message: `⚔️ Ataque manual em ${tower.name}! -${damage} HP, +200 pts`,
                type: 'success',
                timestamp: Date.now()
            });
        }
    } else {
        newLogs.push({
            message: `🛡️ ${tower.defenderName} repeliu seu ataque em ${tower.name}!`,
            type: 'danger',
            timestamp: Date.now()
        });
    }

    // Check if all towers destroyed
    const allDestroyed = towers.every(t => t.destroyed);
    let warActive: boolean = state.warActive;

    if (allDestroyed) {
        warActive = false;
        newLogs.push({
            message: `🏆 VITÓRIA TOTAL! Todas as torres caíram! ${state.playerGuildName} reina suprema!`,
            type: 'achievement',
            timestamp: Date.now()
        });
    }

    return {
        updatedState: {
            ...state,
            playerScore,
            towers,
            playerAttacksLeft: state.playerAttacksLeft - 1,
            warLogs: [...newLogs, ...state.warLogs].slice(0, 30),
            warActive
        },
        won,
        damage
    };
};
