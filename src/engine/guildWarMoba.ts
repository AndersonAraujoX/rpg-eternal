import type { Hero, Territory } from './types';
import type { FakePlayer } from './playerSimulation';

// ═══════════════════════════════════════════════════════════════
// Tipos & Interfaces do Sistema MOBA + Pega-Bandeira
// ═══════════════════════════════════════════════════════════════

export type MobaLane = 'top' | 'mid' | 'bot';
export type MobaSide = 'allied' | 'rival';
export type MobaUnitType = 'hero' | 'guild_bot' | 'minion' | 'liminal_entity';
export type MobaTacticalStance = 'push' | 'flag' | 'defend';

export interface MobaUnit {
    id: string;
    name: string;
    avatar: string;
    side: MobaSide;
    type: MobaUnitType;
    lane: MobaLane;
    position: number; // 0% (Base Aliada) a 100% (Base Rival)
    maxHp: number;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    isDead: boolean;
    respawnTimer: number; // segundos restantes para reviver
    isCarrier: boolean;
    kills: number;
    role?: 'tank' | 'dps' | 'support' | 'carry';
    specialEffect?: 'blind_towers' | 'hunt_carrier' | 'stealth_ambush' | 'party_chaos';
    stealthRemaining?: number;
    noclipTimer?: number;
}

export interface MobaTower {
    id: string;
    name: string;
    side: MobaSide;
    lane: MobaLane;
    position: number; // posição ao longo da rota (ex: 25% para aliada, 75% para rival, 0%/100% para Nexus)
    maxHp: number;
    hp: number;
    attack: number;
    destroyed: boolean;
    isNexus: boolean;
}

export interface MobaFlag {
    status: 'neutral' | 'carried' | 'dropped' | 'captured';
    lane: MobaLane;
    position: number; // 50% no início
    carrierId: string | null;
    respawnCooldown: number; // contagem para ressurgir no centro após captura
}

export interface MobaWarLog {
    id: string;
    message: string;
    type: 'info' | 'success' | 'danger' | 'achievement';
    timestamp: number;
}

export interface MobaCommanderAbilities {
    tactical_bombard: { cooldown: number; maxCooldown: number };
    battle_cry: { cooldown: number; maxCooldown: number; activeUntil: number };
    emergency_heal: { cooldown: number; maxCooldown: number };
    summon_entity: { cooldown: number; maxCooldown: number; activeEntityId?: string };
    noclip_flank: { cooldown: number; maxCooldown: number; inProgress?: boolean; timer?: number; unitId?: string; targetLane?: MobaLane };
    almond_curative_surge: { cooldown: number; maxCooldown: number };
}

export interface GuildWarMobaState {
    territoryId: string;
    territoryName: string;
    territoryDifficulty: number;
    playerGuildName: string;
    rivalGuildName: string;
    alliedScore: number;
    rivalScore: number;
    lanes: MobaLane[];
    units: MobaUnit[];
    towers: MobaTower[];
    flag: MobaFlag;
    activeStance: MobaTacticalStance;
    abilities: MobaCommanderAbilities;
    warLogs: MobaWarLog[];
    tickCount: number;
    battleActive: boolean;
    winner: MobaSide | null;
    lastTickTime: number;
    alliedSurgeUntil: number;
    rivalSurgeUntil: number;
    playerStrikesLeft: number;
}

// ═══════════════════════════════════════════════════════════════
// Constantes & Nomes Temáticos
// ═══════════════════════════════════════════════════════════════

const RIVAL_CHAMPION_NAMES = [
    { name: 'Valquíria Sombria', avatar: '🧝‍♀️', role: 'carry' as const },
    { name: 'Cavaleiro do Caos', avatar: '🛡️', role: 'tank' as const },
    { name: 'Arquimago do Éter', avatar: '🧙‍♂️', role: 'dps' as const },
    { name: 'Assassino Voraz', avatar: '🥷', role: 'carry' as const },
    { name: 'Sacerdote Abissal', avatar: '🧝‍♂️', role: 'support' as const },
    { name: 'Berzerker Carmesim', avatar: '🪓', role: 'dps' as const },
];

const RIVAL_CLAN_GUILDS: Record<string, string> = {
    'Xang': 'Legião de Sangue de Xang',
    'Zhauw': 'Ordem Abissal de Zhauw',
    'Yang': 'Pacto do Sol Dourado',
    'Kael': 'Sindicato do Crepúsculo Kael',
    'Vyrn': 'Vanguarda Esmeralda de Vyrn',
    'Neutral': 'Guardiões das Terras Ermas'
};

// ═══════════════════════════════════════════════════════════════
// Funções Puras de Inicialização e Fábrica
// ═══════════════════════════════════════════════════════════════

/**
 * Cria a estrutura inicial de torres defensivas e os Nexuses para ambas as guildas.
 */
export const createInitialMobaTowers = (basePower: number): MobaTower[] => {
    const towerHp = Math.max(1200, Math.floor(basePower * 1.8));
    const nexusHp = Math.max(3500, Math.floor(basePower * 4.5));
    const towerAtk = Math.max(45, Math.floor(basePower * 0.12));

    return [
        // Torres Aliadas
        { id: 'allied-tower-top', name: 'Torre Aliada Superior', side: 'allied', lane: 'top', position: 25, maxHp: towerHp, hp: towerHp, attack: towerAtk, destroyed: false, isNexus: false },
        { id: 'allied-tower-mid', name: 'Torre Aliada Central', side: 'allied', lane: 'mid', position: 25, maxHp: towerHp, hp: towerHp, attack: towerAtk, destroyed: false, isNexus: false },
        { id: 'allied-tower-bot', name: 'Torre Aliada Inferior', side: 'allied', lane: 'bot', position: 25, maxHp: towerHp, hp: towerHp, attack: towerAtk, destroyed: false, isNexus: false },
        { id: 'allied-nexus', name: 'Altar Central da Guilda', side: 'allied', lane: 'mid', position: 0, maxHp: nexusHp, hp: nexusHp, attack: towerAtk * 1.5, destroyed: false, isNexus: true },

        // Torres Rivais
        { id: 'rival-tower-top', name: 'Torre Rival Superior', side: 'rival', lane: 'top', position: 75, maxHp: towerHp, hp: towerHp, attack: towerAtk, destroyed: false, isNexus: false },
        { id: 'rival-tower-mid', name: 'Torre Rival Central', side: 'rival', lane: 'mid', position: 75, maxHp: towerHp, hp: towerHp, attack: towerAtk, destroyed: false, isNexus: false },
        { id: 'rival-tower-bot', name: 'Torre Rival Inferior', side: 'rival', lane: 'bot', position: 75, maxHp: towerHp, hp: towerHp, attack: towerAtk, destroyed: false, isNexus: false },
        { id: 'rival-nexus', name: 'Cidadela da Guilda Rival', side: 'rival', lane: 'mid', position: 100, maxHp: nexusHp, hp: nexusHp, attack: towerAtk * 1.5, destroyed: false, isNexus: true },
    ];
};

/**
 * Cria unidades de heróis aliados e campeões rivais.
 */
export const createInitialMobaUnits = (
    heroes: Hero[],
    alliedBots: FakePlayer[],
    basePower: number
): MobaUnit[] => {
    const units: MobaUnit[] = [];
    const lanes: MobaLane[] = ['top', 'mid', 'bot'];

    // 1. Heróis Ativos da Party (Aliados)
    const validHeroes = heroes && heroes.length > 0 ? heroes.filter(h => !h.isDead) : [];
    const heroesToDeploy = validHeroes.length > 0 ? validHeroes.slice(0, 5) : [
        { id: 'default-hero-1', name: 'Campeão da Guarda', emoji: '⚔️', class: 'Warrior', stats: { maxHp: 1000, attack: 150, defense: 50, speed: 10 } } as unknown as Hero,
        { id: 'default-hero-2', name: 'Mago Real', emoji: '🧙‍♂️', class: 'Mage', stats: { maxHp: 800, attack: 220, defense: 20, speed: 12 } } as unknown as Hero,
        { id: 'default-hero-3', name: 'Arqueira das Sombras', emoji: '🏹', class: 'Rogue', stats: { maxHp: 850, attack: 180, defense: 30, speed: 15 } } as unknown as Hero
    ];

    heroesToDeploy.forEach((hero, index) => {
        const lane = lanes[index % lanes.length];
        const hp = Math.max(500, hero.stats?.maxHp || basePower);
        const atk = Math.max(50, hero.stats?.attack || Math.floor(basePower * 0.2));
        const def = Math.max(10, hero.stats?.defense || Math.floor(basePower * 0.05));

        units.push({
            id: `ally-hero-${hero.id}`,
            name: hero.name,
            avatar: hero.emoji || '⚔️',
            side: 'allied',
            type: 'hero',
            lane,
            position: 5,
            maxHp: hp,
            hp,
            attack: atk,
            defense: def,
            speed: 3.5,
            isDead: false,
            respawnTimer: 0,
            isCarrier: false,
            kills: 0,
            role: 'dps'
        });
    });

    // 2. Bots Aliados adicionais se a party tiver menos que 3
    if (units.length < 3 && alliedBots.length > 0) {
        alliedBots.slice(0, 3 - units.length).forEach((bot, idx) => {
            const lane = lanes[(units.length + idx) % lanes.length];
            const hp = Math.max(600, Math.floor(bot.power * 1.5));
            const atk = Math.max(40, Math.floor(bot.power * 0.25));
            units.push({
                id: `ally-bot-${bot.id}`,
                name: bot.name,
                avatar: bot.avatar || '🛡️',
                side: 'allied',
                type: 'guild_bot',
                lane,
                position: 5,
                maxHp: hp,
                hp,
                attack: atk,
                defense: Math.floor(atk * 0.3),
                speed: 3.0,
                isDead: false,
                respawnTimer: 0,
                isCarrier: false,
                kills: 0,
                role: 'tank'
            });
        });
    }

    // 3. Campeões Rivais
    const rivalCount = Math.max(3, Math.min(5, units.length));
    for (let i = 0; i < rivalCount; i++) {
        const champ = RIVAL_CHAMPION_NAMES[i % RIVAL_CHAMPION_NAMES.length];
        const lane = lanes[i % lanes.length];
        const hp = Math.max(600, Math.floor(basePower * (0.9 + Math.random() * 0.3)));
        const atk = Math.max(45, Math.floor(basePower * (0.18 + Math.random() * 0.08)));
        const def = Math.max(15, Math.floor(atk * 0.25));

        units.push({
            id: `rival-champ-${i}`,
            name: `${champ.name} ${i + 1}`,
            avatar: champ.avatar,
            side: 'rival',
            type: 'hero',
            lane,
            position: 95,
            maxHp: hp,
            hp,
            attack: atk,
            defense: def,
            speed: 3.2,
            isDead: false,
            respawnTimer: 0,
            isCarrier: false,
            kills: 0,
            role: champ.role
        });
    }

    return units;
};

/**
 * Cria uma nova onda de tropas (minions) para cada rota.
 */
export const spawnMobaMinionWave = (basePower: number, waveNumber: number): MobaUnit[] => {
    const lanes: MobaLane[] = ['top', 'mid', 'bot'];
    const minionHp = Math.max(200, Math.floor(basePower * 0.35));
    const minionAtk = Math.max(20, Math.floor(basePower * 0.08));
    const minionDef = Math.max(5, Math.floor(minionAtk * 0.15));

    const newMinions: MobaUnit[] = [];

    lanes.forEach(lane => {
        // Tropa Aliada
        newMinions.push({
            id: `minion-ally-${lane}-${waveNumber}-${Date.now()}`,
            name: 'Infantaria da Guilda',
            avatar: '🛡️',
            side: 'allied',
            type: 'minion',
            lane,
            position: 3,
            maxHp: minionHp,
            hp: minionHp,
            attack: minionAtk,
            defense: minionDef,
            speed: 2.5,
            isDead: false,
            respawnTimer: 0,
            isCarrier: false,
            kills: 0
        });

        // Tropa Rival
        newMinions.push({
            id: `minion-rival-${lane}-${waveNumber}-${Date.now()}`,
            name: 'Vanguarda Rival',
            avatar: '🗡️',
            side: 'rival',
            type: 'minion',
            lane,
            position: 97,
            maxHp: minionHp,
            hp: minionHp,
            attack: minionAtk,
            defense: minionDef,
            speed: 2.5,
            isDead: false,
            respawnTimer: 0,
            isCarrier: false,
            kills: 0
        });
    });

    return newMinions;
};

/**
 * Inicializa um confronto completo de MOBA + Pega-Bandeira com base no território e nos heróis.
 */
export const initGuildWarMobaBattle = (
    territory: Territory,
    partyHeroes: Hero[],
    fakePlayers: FakePlayer[],
    playerGuildName: string = 'Sua Guilda',
    partyPower: number = 1000
): GuildWarMobaState => {
    const territoryDifficulty = Math.max(500, territory.difficulty || partyPower);
    const benchmarkPower = Math.max(partyPower, territoryDifficulty);

    // Clã rival
    const clanKey = territory.owner && territory.owner !== 'player' ? territory.owner : 'Neutral';
    const rivalGuildName = RIVAL_CLAN_GUILDS[clanKey] || `Legião do Clã ${clanKey}`;

    // Divisão de bots
    const shuffledBots = [...fakePlayers].sort(() => Math.random() - 0.5);
    const alliedBots = shuffledBots.slice(0, Math.ceil(shuffledBots.length / 2));

    const towers = createInitialMobaTowers(benchmarkPower);
    const units = createInitialMobaUnits(partyHeroes, alliedBots, benchmarkPower);

    // Bandeira inicial no centro da rota Mid
    const flag: MobaFlag = {
        status: 'neutral',
        lane: 'mid',
        position: 50,
        carrierId: null,
        respawnCooldown: 0
    };

    const initialLogs: MobaWarLog[] = [
        {
            id: `log-${Date.now()}-0`,
            message: `⚔️ Batalha MOBA iniciada pela posse de ${territory.name}! ${playerGuildName} vs ${rivalGuildName}`,
            type: 'achievement',
            timestamp: Date.now()
        },
        {
            id: `log-${Date.now()}-1`,
            message: `🚩 A Bandeira Sagrada foi invocada no centro da Rota Mid! Capture-a e leve até sua base!`,
            type: 'info',
            timestamp: Date.now()
        }
    ];

    return {
        territoryId: territory.id,
        territoryName: territory.name,
        territoryDifficulty,
        playerGuildName,
        rivalGuildName,
        alliedScore: 0,
        rivalScore: 0,
        lanes: ['top', 'mid', 'bot'],
        units,
        towers,
        flag,
        activeStance: 'push',
        abilities: {
            tactical_bombard: { cooldown: 0, maxCooldown: 15 },
            battle_cry: { cooldown: 0, maxCooldown: 25, activeUntil: 0 },
            emergency_heal: { cooldown: 0, maxCooldown: 20 },
            summon_entity: { cooldown: 0, maxCooldown: 25 },
            noclip_flank: { cooldown: 0, maxCooldown: 30 },
            almond_curative_surge: { cooldown: 0, maxCooldown: 20 }
        },
        warLogs: initialLogs,
        tickCount: 0,
        battleActive: true,
        winner: null,
        lastTickTime: Date.now(),
        alliedSurgeUntil: 0,
        rivalSurgeUntil: 0,
        playerStrikesLeft: 3
    };
};

// ═══════════════════════════════════════════════════════════════
// Motor de Simulação em Tempo Real (Tick Principal)
// ═══════════════════════════════════════════════════════════════

/**
 * Executa um ciclo da simulação em tempo real.
 * Atualiza posições, colisões de combate, mecânica de captura da bandeira,
 * disparos de torres, renascimento de heróis e condições de vitória.
 */
export const simulateGuildWarMobaTick = (
    state: GuildWarMobaState,
    dt: number = 1
): GuildWarMobaState => {
    if (!state.battleActive || state.winner !== null) {
        return state;
    }

    const now = Date.now();
    const newLogs: MobaWarLog[] = [];
    let alliedScore = state.alliedScore;
    let rivalScore = state.rivalScore;
    let winner: MobaSide | null = null;
    let battleActive = true;

    const isAlliedSurge = now < state.alliedSurgeUntil;
    const isRivalSurge = now < state.rivalSurgeUntil;
    const isBattleCry = now < state.abilities.battle_cry.activeUntil;

    // 1. Atualizar Cooldowns de Habilidades do Comandante
    const updatedAbilities: MobaCommanderAbilities = {
        tactical_bombard: {
            ...state.abilities.tactical_bombard,
            cooldown: Math.max(0, (state.abilities.tactical_bombard?.cooldown || 0) - dt)
        },
        battle_cry: {
            ...state.abilities.battle_cry,
            cooldown: Math.max(0, (state.abilities.battle_cry?.cooldown || 0) - dt)
        },
        emergency_heal: {
            ...state.abilities.emergency_heal,
            cooldown: Math.max(0, (state.abilities.emergency_heal?.cooldown || 0) - dt)
        },
        summon_entity: {
            ...(state.abilities.summon_entity || { maxCooldown: 25 }),
            cooldown: Math.max(0, (state.abilities.summon_entity?.cooldown || 0) - dt)
        },
        noclip_flank: {
            ...(state.abilities.noclip_flank || { maxCooldown: 30 }),
            cooldown: Math.max(0, (state.abilities.noclip_flank?.cooldown || 0) - dt)
        },
        almond_curative_surge: {
            ...(state.abilities.almond_curative_surge || { maxCooldown: 20 }),
            cooldown: Math.max(0, (state.abilities.almond_curative_surge?.cooldown || 0) - dt)
        }
    };

    // 2. Clonagem profunda e atualização das torres
    let towers = state.towers.map(t => ({ ...t }));

    // 3. Atualização das Unidades (Respawn, Movimentação, Combate)
    let units = state.units.map(u => ({ ...u }));

    // Renascer heróis/bots caídos e atualizar status especiais
    units.forEach(u => {
        if (u.isDead && u.type !== 'minion') {
            u.respawnTimer = Math.max(0, u.respawnTimer - dt);
            if (u.respawnTimer === 0) {
                u.isDead = false;
                u.hp = u.maxHp;
                u.position = u.side === 'allied' ? 5 : 95;
                newLogs.push({
                    id: `respawn-${u.id}-${now}`,
                    message: `✨ ${u.name} reviveu na base e retornou à batalha!`,
                    type: 'info',
                    timestamp: now
                });
            }
        }
        // Atualizar travessia do Túnel Noclip
        if ((u.noclipTimer || 0) > 0) {
            u.noclipTimer = Math.max(0, (u.noclipTimer || 0) - dt);
            if (u.noclipTimer === 0) {
                u.position = 85; // Reaparece atrás da linha de defesa rival!
                newLogs.push({
                    id: `noclip-emerge-${u.id}-${now}`,
                    message: `🌀 ${u.name} emergiu do Túnel Noclip diretamente atrás das defesas rivais!`,
                    type: 'achievement',
                    timestamp: now
                });
            }
        }
        // Atualizar tempo de stealth
        if ((u.stealthRemaining || 0) > 0) {
            u.stealthRemaining = Math.max(0, (u.stealthRemaining || 0) - dt);
        }
    });

    // 4. Gerar ondas de tropas a cada 10 ticks
    const tickCount = state.tickCount + 1;
    if (tickCount % 10 === 0) {
        const wave = spawnMobaMinionWave(state.territoryDifficulty, Math.floor(tickCount / 10));
        units.push(...wave);
    }

    // 5. Gestão da Bandeira Sagrada (CTF)
    let flag = { ...state.flag };
    let alliedSurgeUntil = state.alliedSurgeUntil;
    let rivalSurgeUntil = state.rivalSurgeUntil;

    // Resfriamento para a bandeira renascer no centro
    if (flag.status === 'captured') {
        flag.respawnCooldown = Math.max(0, flag.respawnCooldown - dt);
        if (flag.respawnCooldown === 0) {
            flag.status = 'neutral';
            flag.lane = 'mid';
            flag.position = 50;
            flag.carrierId = null;
            newLogs.push({
                id: `flag-respawn-${now}`,
                message: `🚩 A Bandeira Sagrada ressurgiu no Altar Central da rota Mid!`,
                type: 'achievement',
                timestamp: now
            });
        }
    }

    // Unidade viva que carrega a bandeira atualmente
    const currentCarrier = flag.status === 'carried' && flag.carrierId
        ? units.find(u => u.id === flag.carrierId && !u.isDead)
        : null;

    if (flag.status === 'carried' && !currentCarrier) {
        // O portador morreu ou não foi encontrado: derrubar a bandeira no local
        flag.status = 'dropped';
        flag.carrierId = null;
        newLogs.push({
            id: `flag-dropped-${now}`,
            message: `⚠️ A Bandeira Sagrada caiu na rota ${flag.lane.toUpperCase()}! Recupere-a!`,
            type: 'danger',
            timestamp: now
        });
    }

    // Tentar pegar a bandeira (se ela estiver neutra ou caída)
    if (flag.status === 'neutral' || flag.status === 'dropped') {
        const eligibleUnits = units.filter(u =>
            !u.isDead &&
            u.lane === flag.lane &&
            Math.abs(u.position - flag.position) <= 6
        );

        if (eligibleUnits.length > 0) {
            // Prioriza heróis sobre minions
            eligibleUnits.sort((a, b) => (b.type === 'hero' ? 1 : 0) - (a.type === 'hero' ? 1 : 0));
            const newCarrier = eligibleUnits[0];
            flag.status = 'carried';
            flag.carrierId = newCarrier.id;
            newCarrier.isCarrier = true;

            const isAlly = newCarrier.side === 'allied';
            newLogs.push({
                id: `flag-pickup-${newCarrier.id}-${now}`,
                message: isAlly
                    ? `🚩 ${newCarrier.name} (Aliado) capturou a Bandeira! Proteja-o até a base!`
                    : `💀 ${newCarrier.name} (Rival) roubou a Bandeira! Intercepte-o agora!`,
                type: isAlly ? 'achievement' : 'danger',
                timestamp: now
            });
        }
    }

    // 6. Resolução de Movimento e Combate por Rota
    const lanes: MobaLane[] = ['top', 'mid', 'bot'];

    lanes.forEach(lane => {
        const laneAllies = units.filter(u => !u.isDead && u.side === 'allied' && u.lane === lane);
        const laneRivals = units.filter(u => !u.isDead && u.side === 'rival' && u.lane === lane);

        // Encontrar a torre inimiga viva mais próxima para cada lado
        const activeRivalTowers = towers.filter(t => !t.destroyed && t.side === 'rival' && (t.lane === lane || t.isNexus));
        const activeAlliedTowers = towers.filter(t => !t.destroyed && t.side === 'allied' && (t.lane === lane || t.isNexus));

        const nearestRivalTower = activeRivalTowers.sort((a, b) => a.position - b.position)[0] || null;
        const nearestAlliedTower = activeAlliedTowers.sort((a, b) => b.position - a.position)[0] || null;

        // --- Movimentação e Combate dos Aliados ---
        laneAllies.forEach(ally => {
            if ((ally.noclipTimer || 0) > 0) return; // Em travessia no Túnel Noclip

            let speedMult = 1.0;
            if (isBattleCry) speedMult *= 1.35;
            if (isAlliedSurge) speedMult *= 1.25;
            if (ally.specialEffect === 'hunt_carrier') speedMult *= 1.45; // Hound ultra-veloz
            if (ally.isCarrier) speedMult *= 0.85; // Leve penalidade ao carregar a bandeira

            const step = ally.speed * speedMult * dt;

            // Se for o portador da bandeira, ele deve recuar para a Base Aliada (posição 0)
            if (ally.isCarrier) {
                const nearestEnemy = laneRivals.find(r => Math.abs(r.position - ally.position) <= 5);
                if (nearestEnemy) {
                    const atk = isBattleCry ? Math.floor(ally.attack * 1.3) : ally.attack;
                    const dmg = Math.max(8, Math.floor(atk * (100 / (100 + nearestEnemy.defense))));
                    nearestEnemy.hp = Math.max(0, nearestEnemy.hp - dmg);
                    if (nearestEnemy.hp <= 0) {
                        nearestEnemy.isDead = true;
                        ally.kills++;
                        alliedScore += nearestEnemy.type === 'hero' ? 120 : 30;
                    }
                }

                ally.position = Math.max(0, ally.position - step);
                flag.position = ally.position;

                // Chegou à base com a bandeira!
                if (ally.position <= 5) {
                    flag.status = 'captured';
                    flag.carrierId = null;
                    flag.respawnCooldown = 15;
                    ally.isCarrier = false;
                    alliedScore += 750;
                    alliedSurgeUntil = now + 20000; // 20 segundos de Ether Surge

                    // Causa 25% de dano direto a todas as torres rivais ativas
                    towers.forEach(t => {
                        if (!t.destroyed && t.side === 'rival') {
                            const dmg = Math.floor(t.maxHp * 0.25);
                            t.hp = Math.max(0, t.hp - dmg);
                            if (t.hp <= 0) {
                                t.destroyed = true;
                                alliedScore += t.isNexus ? 1500 : 400;
                            }
                        }
                    });

                    newLogs.push({
                        id: `flag-deliver-ally-${now}`,
                        message: `🏆 BANDEIRA ENTREGUE NA BASE! +750 Pontos & Sobrecarga de Éter nas torres inimigas!`,
                        type: 'achievement',
                        timestamp: now
                    });
                }
                return;
            }

            // Unidade normal: verificar se há colisão com rivais à frente
            const nearestEnemy = laneRivals.find(r => Math.abs(r.position - ally.position) <= 5);
            const isNearTower = nearestRivalTower && Math.abs(nearestRivalTower.position - ally.position) <= 6;

            if (nearestEnemy) {
                // Combate corpo a corpo contra inimigo
                const atk = isBattleCry ? Math.floor(ally.attack * 1.3) : ally.attack;
                const dmg = Math.max(8, Math.floor(atk * (100 / (100 + nearestEnemy.defense))));
                nearestEnemy.hp = Math.max(0, nearestEnemy.hp - dmg);

                if (nearestEnemy.hp <= 0) {
                    nearestEnemy.isDead = true;
                    ally.kills++;
                    alliedScore += nearestEnemy.type === 'hero' ? 120 : 30;

                    if (nearestEnemy.isCarrier) {
                        flag.status = 'dropped';
                        flag.carrierId = null;
                        nearestEnemy.isCarrier = false;
                        newLogs.push({
                            id: `carrier-killed-${now}`,
                            message: `💥 ${ally.name} abateu o portador da bandeira rival!`,
                            type: 'achievement',
                            timestamp: now
                        });
                    } else if (nearestEnemy.type === 'hero') {
                        newLogs.push({
                            id: `hero-kill-${now}`,
                            message: `⚔️ ${ally.name} derrotou ${nearestEnemy.name}! +120 pts`,
                            type: 'success',
                            timestamp: now
                        });
                    }
                }
            } else if (isNearTower && nearestRivalTower) {
                // Atacando a torre inimiga
                const dmg = Math.max(10, Math.floor(ally.attack * 0.7));
                nearestRivalTower.hp = Math.max(0, nearestRivalTower.hp - dmg);
                if (nearestRivalTower.hp <= 0) {
                    nearestRivalTower.destroyed = true;
                    alliedScore += nearestRivalTower.isNexus ? 2000 : 500;
                    newLogs.push({
                        id: `tower-destroyed-${nearestRivalTower.id}-${now}`,
                        message: `🏰 ${ally.name} e tropas destruíram a ${nearestRivalTower.name}!`,
                        type: 'achievement',
                        timestamp: now
                    });
                }
            } else {
                // Rota livre: avançar
                ally.position = Math.min(100, ally.position + step);
            }
        });

        // --- Movimentação e Combate dos Rivais ---
        laneRivals.forEach(rival => {
            let speedMult = 1.0;
            if (isRivalSurge) speedMult *= 1.25;
            if (rival.isCarrier) speedMult *= 0.85;

            const step = rival.speed * speedMult * dt;

            // Portador rival foge em direção à Base Rival (posição 100)
            if (rival.isCarrier) {
                const nearestEnemy = laneAllies.find(a => Math.abs(a.position - rival.position) <= 5);
                if (nearestEnemy) {
                    const dmg = Math.max(8, Math.floor(rival.attack * (100 / (100 + nearestEnemy.defense))));
                    nearestEnemy.hp = Math.max(0, nearestEnemy.hp - dmg);
                    if (nearestEnemy.hp <= 0) {
                        nearestEnemy.isDead = true;
                        nearestEnemy.respawnTimer = 10;
                        rival.kills++;
                        rivalScore += nearestEnemy.type === 'hero' ? 120 : 30;
                    }
                }

                rival.position = Math.min(100, rival.position + step);
                flag.position = rival.position;

                if (rival.position >= 95) {
                    flag.status = 'captured';
                    flag.carrierId = null;
                    flag.respawnCooldown = 15;
                    rival.isCarrier = false;
                    rivalScore += 750;
                    rivalSurgeUntil = now + 20000;

                    // Dano em torres aliadas
                    towers.forEach(t => {
                        if (!t.destroyed && t.side === 'allied') {
                            const dmg = Math.floor(t.maxHp * 0.25);
                            t.hp = Math.max(0, t.hp - dmg);
                            if (t.hp <= 0) {
                                t.destroyed = true;
                                rivalScore += t.isNexus ? 1500 : 400;
                            }
                        }
                    });

                    newLogs.push({
                        id: `flag-deliver-rival-${now}`,
                        message: `🚨 A Guilda Rival entregou a Bandeira na base! +750 Pontos para os inimigos!`,
                        type: 'danger',
                        timestamp: now
                    });
                }
                return;
            }

            // Unidade rival normal
            const nearestEnemy = laneAllies.find(a => Math.abs(a.position - rival.position) <= 5);
            const isNearTower = nearestAlliedTower && Math.abs(nearestAlliedTower.position - rival.position) <= 6;

            if (nearestEnemy) {
                const dmg = Math.max(8, Math.floor(rival.attack * (100 / (100 + nearestEnemy.defense))));
                nearestEnemy.hp = Math.max(0, nearestEnemy.hp - dmg);

                if (nearestEnemy.hp <= 0) {
                    nearestEnemy.isDead = true;
                    nearestEnemy.respawnTimer = 10;
                    rival.kills++;
                    rivalScore += nearestEnemy.type === 'hero' ? 120 : 30;

                    if (nearestEnemy.isCarrier) {
                        flag.status = 'dropped';
                        flag.carrierId = null;
                        nearestEnemy.isCarrier = false;
                        newLogs.push({
                            id: `ally-carrier-down-${now}`,
                            message: `💀 O portador aliado da bandeira foi abatido!`,
                            type: 'danger',
                            timestamp: now
                        });
                    }
                }
            } else if (isNearTower && nearestAlliedTower) {
                const dmg = Math.max(10, Math.floor(rival.attack * 0.7));
                nearestAlliedTower.hp = Math.max(0, nearestAlliedTower.hp - dmg);
                if (nearestAlliedTower.hp <= 0) {
                    nearestAlliedTower.destroyed = true;
                    rivalScore += nearestAlliedTower.isNexus ? 2000 : 500;
                    newLogs.push({
                        id: `allied-tower-lost-${nearestAlliedTower.id}-${now}`,
                        message: `💥 A ${nearestAlliedTower.name} foi destruída pelos invasores!`,
                        type: 'danger',
                        timestamp: now
                    });
                }
            } else {
                rival.position = Math.max(0, rival.position - step);
            }
        });

        // --- Disparo Defensivo das Torres da Rota ---
        const standingTowersOnLane = towers.filter(t => !t.destroyed && (t.lane === lane || t.isNexus));
        standingTowersOnLane.forEach(tower => {
            const isAlliedTower = tower.side === 'allied';

            // Smiler cega torres inimigas da rota
            if (!isAlliedTower) {
                const smilerActive = laneAllies.some(a => !a.isDead && a.type === 'liminal_entity' && a.specialEffect === 'blind_towers');
                if (smilerActive) return; // Torre rival cegada pelo Smiler!
            }

            const targets = isAlliedTower ? laneRivals : laneAllies;

            // Alvo dentro do alcance da torre (12% de distância, ignora stealth e noclip)
            const targetInRange = targets.find(u => {
                if ((u.stealthRemaining || 0) > 0) return false;
                if ((u.noclipTimer || 0) > 0) return false;
                return Math.abs(u.position - tower.position) <= 12;
            });
            if (targetInRange) {
                const towerDmg = Math.max(15, Math.floor(tower.attack));
                targetInRange.hp = Math.max(0, targetInRange.hp - towerDmg);
                if (targetInRange.hp <= 0) {
                    targetInRange.isDead = true;
                    if (targetInRange.type !== 'minion') targetInRange.respawnTimer = 10;
                    if (isAlliedTower) alliedScore += 40;
                    else rivalScore += 40;

                    if (targetInRange.isCarrier) {
                        flag.status = 'dropped';
                        flag.carrierId = null;
                        targetInRange.isCarrier = false;
                    }
                }
            }
        });
    });

    // Limpar minions mortos
    units = units.filter(u => !(u.isDead && u.type === 'minion'));

    // 7. Checagem de Condições de Vitória
    const alliedNexus = towers.find(t => t.id === 'allied-nexus');
    const rivalNexus = towers.find(t => t.id === 'rival-nexus');

    if (rivalNexus?.destroyed || alliedScore >= 2500) {
        battleActive = false;
        winner = 'allied';
        newLogs.push({
            id: `victory-allied-${now}`,
            message: `👑 VITÓRIA TOTAL! A Cidadela Inimiga ruiu! O território ${state.territoryName} foi CONQUISTADO!`,
            type: 'achievement',
            timestamp: now
        });
    } else if (alliedNexus?.destroyed || rivalScore >= 2500) {
        battleActive = false;
        winner = 'rival';
        newLogs.push({
            id: `victory-rival-${now}`,
            message: `💀 DERROTA! O Altar Sagrado foi destruído pela ${state.rivalGuildName}. Suas tropas recuaram.`,
            type: 'danger',
            timestamp: now
        });
    } else if (tickCount >= 120) {
        // Limite de tempo de 120 ticks (aprox 2 minutos)
        battleActive = false;
        winner = alliedScore >= rivalScore ? 'allied' : 'rival';
        newLogs.push({
            id: `time-up-${now}`,
            message: winner === 'allied'
                ? `⏰ Tempo esgotado! Vitória por pontos (${alliedScore} vs ${rivalScore})! Território conquistado!`
                : `⏰ Tempo esgotado! Derrota por pontos (${rivalScore} vs ${alliedScore}).`,
            type: winner === 'allied' ? 'achievement' : 'danger',
            timestamp: now
        });
    }

    return {
        ...state,
        alliedScore,
        rivalScore,
        units,
        towers,
        flag,
        abilities: updatedAbilities,
        warLogs: [...newLogs, ...state.warLogs].slice(0, 40),
        tickCount,
        battleActive,
        winner,
        lastTickTime: now,
        alliedSurgeUntil,
        rivalSurgeUntil
    };
};

// ═══════════════════════════════════════════════════════════════
// Ações Táticas e Habilidades do Comandante
// ═══════════════════════════════════════════════════════════════

/**
 * Altera a postura tática da equipe aliada.
 * 'push': Distribui heróis uniformemente pelas 3 rotas para avançar e derrubar torres.
 * 'flag': Concentra heróis na rota Mid para capturar ou defender a bandeira.
 * 'defend': Recua os heróis para perto das torres aliadas para repelir investidas.
 */
export const setMobaTacticalStance = (
    state: GuildWarMobaState,
    stance: MobaTacticalStance
): GuildWarMobaState => {
    if (!state.battleActive) return state;

    const lanes: MobaLane[] = ['top', 'mid', 'bot'];
    const units = state.units.map((u, idx) => {
        if (u.side !== 'allied' || u.isDead) return u;

        let targetLane = u.lane;
        if (stance === 'flag') {
            targetLane = 'mid';
        } else if (stance === 'push') {
            targetLane = lanes[idx % lanes.length];
        } else if (stance === 'defend') {
            return {
                ...u,
                position: Math.max(15, u.position - 10)
            };
        }

        return { ...u, lane: targetLane };
    });

    const stanceLabels = {
        push: '⚔️ Postura de Ataque: Avanço Total pelas 3 rotas!',
        flag: '🚩 Postura de Objetivo: Todos os heróis convergindo na Rota Mid pela Bandeira!',
        defend: '🛡️ Postura de Defesa: Recuar para proteger as torres e o Altar!'
    };

    const newLog: MobaWarLog = {
        id: `stance-${Date.now()}`,
        message: stanceLabels[stance],
        type: 'info',
        timestamp: Date.now()
    };

    return {
        ...state,
        activeStance: stance,
        units,
        warLogs: [newLog, ...state.warLogs].slice(0, 40)
    };
};

/**
 * Executa uma habilidade de comandante acionada pelo jogador.
 */
export const executeMobaCommanderAbility = (
    state: GuildWarMobaState,
    abilityId: keyof MobaCommanderAbilities,
    options?: { targetLane?: MobaLane }
): { updatedState: GuildWarMobaState; success: boolean; message: string } => {
    if (!state.battleActive) {
        return { updatedState: state, success: false, message: 'A batalha não está ativa.' };
    }

    const ability = state.abilities[abilityId];
    if (ability.cooldown > 0) {
        return { updatedState: state, success: false, message: `Habilidade em recarga (${ability.cooldown.toFixed(0)}s).` };
    }

    const now = Date.now();
    const newLogs: MobaWarLog[] = [];
    let units = state.units.map(u => ({ ...u }));
    let towers = state.towers.map(t => ({ ...t }));
    let alliedScore = state.alliedScore;

    const updatedAbilities: MobaCommanderAbilities = {
        ...state.abilities,
        [abilityId]: {
            ...ability,
            cooldown: ability.maxCooldown,
            ...(abilityId === 'battle_cry' ? { activeUntil: now + 10000 } : {})
        }
    };

    if (abilityId === 'tactical_bombard') {
        const lane = options?.targetLane || 'mid';
        // Dizima minions inimigos na rota e causa dano a heróis e torres rivais
        units.forEach(u => {
            if (!u.isDead && u.side === 'rival' && u.lane === lane) {
                const dmg = u.type === 'minion' ? u.maxHp : Math.floor(u.maxHp * 0.4);
                u.hp = Math.max(0, u.hp - dmg);
                if (u.hp <= 0) {
                    u.isDead = true;
                    if (u.type !== 'minion') u.respawnTimer = 10;
                    alliedScore += u.type === 'hero' ? 100 : 25;
                }
            }
        });

        // Dano na torre rival da rota
        const rivalTower = towers.find(t => !t.destroyed && t.side === 'rival' && t.lane === lane);
        if (rivalTower) {
            const tDmg = Math.floor(rivalTower.maxHp * 0.15);
            rivalTower.hp = Math.max(0, rivalTower.hp - tDmg);
            if (rivalTower.hp <= 0) {
                rivalTower.destroyed = true;
                alliedScore += 400;
            }
        }

        newLogs.push({
            id: `bombard-${now}`,
            message: `☄️ BOMBARDEIO TÁTICO atingiu em cheio a rota ${lane.toUpperCase()}! Inimigos dizimados!`,
            type: 'achievement',
            timestamp: now
        });
    } else if (abilityId === 'battle_cry') {
        newLogs.push({
            id: `battlecry-${now}`,
            message: `⚡ GRITO DE GUERRA ativado! +35% velocidade e +30% ataque para todos os aliados por 10s!`,
            type: 'achievement',
            timestamp: now
        });
    } else if (abilityId === 'emergency_heal') {
        units.forEach(u => {
            if (!u.isDead && u.side === 'allied') {
                const healAmt = Math.floor(u.maxHp * 0.45);
                u.hp = Math.min(u.maxHp, u.hp + healAmt);
            }
        });

        newLogs.push({
            id: `heal-${now}`,
            message: `💚 BÊNÇÃO RESTAURADORA curou 45% do HP de todos os heróis e tropas aliadas!`,
            type: 'success',
            timestamp: now
        });
    } else if (abilityId === 'summon_entity') {
        const entityKey = (options as any)?.entityId || 'smiler';
        const targetLane = options?.targetLane || 'mid';
        const entityDefinitions: Record<string, { name: string; avatar: string; specialEffect: 'blind_towers' | 'hunt_carrier' | 'stealth_ambush' | 'party_chaos'; hpMult: number; atkMult: number; speed: number; desc: string }> = {
            smiler: { name: 'Smiler Voraz', avatar: '😈', specialEffect: 'blind_towers', hpMult: 1.6, atkMult: 1.4, speed: 3.8, desc: 'Torres inimigas da rota cegadas!' },
            hound: { name: 'Hound Caçador', avatar: '🐕', specialEffect: 'hunt_carrier', hpMult: 1.3, atkMult: 1.8, speed: 5.2, desc: 'Caçando vorazmente o portador da bandeira!' },
            skin_stealer: { name: 'Skin-Stealer Infiltrador', avatar: '👤', specialEffect: 'stealth_ambush', hpMult: 1.4, atkMult: 1.5, speed: 4.2, desc: 'Avanço invisível atrás das defesas!' },
            partygoer: { name: 'Partygoer Anômalo', avatar: '🎈', specialEffect: 'party_chaos', hpMult: 1.5, atkMult: 1.3, speed: 3.5, desc: 'Distribuindo balões e corrupção liminar!' }
        };
        const def = entityDefinitions[entityKey] || entityDefinitions.smiler;
        const benchmarkPower = Math.max(500, state.territoryDifficulty || 1000);
        const entityUnit: MobaUnit = {
            id: `liminal-${entityKey}-${now}`,
            name: def.name,
            avatar: def.avatar,
            side: 'allied',
            type: 'liminal_entity',
            lane: targetLane,
            position: 10,
            maxHp: Math.floor(benchmarkPower * def.hpMult),
            hp: Math.floor(benchmarkPower * def.hpMult),
            attack: Math.floor(benchmarkPower * 0.25 * def.atkMult),
            defense: Math.floor(benchmarkPower * 0.1),
            speed: def.speed,
            isDead: false,
            respawnTimer: 0,
            isCarrier: false,
            kills: 0,
            specialEffect: def.specialEffect,
            stealthRemaining: def.specialEffect === 'stealth_ambush' ? 10 : 0
        };
        units.push(entityUnit);
        newLogs.push({
            id: `summon-entity-${now}`,
            message: `🧬 ARMA LIMINAR: ${def.name} foi libertado na rota ${targetLane.toUpperCase()}! ${def.desc}`,
            type: 'achievement',
            timestamp: now
        });
    } else if (abilityId === 'noclip_flank') {
        const targetLane = options?.targetLane || 'mid';
        const candidate = units.find(u => !u.isDead && u.side === 'allied' && u.type === 'hero' && !u.isCarrier && !(u.noclipTimer && u.noclipTimer > 0));
        if (candidate) {
            const isScout = Boolean((options as any)?.isScout);
            candidate.noclipTimer = isScout ? 3 : 6;
            candidate.lane = targetLane;
            newLogs.push({
                id: `noclip-enter-${candidate.id}-${now}`,
                message: `🚪 TÚNEL NOCLIP: ${candidate.name} adentrou a fenda dimensional para flanquear a rota ${targetLane.toUpperCase()}!`,
                type: 'achievement',
                timestamp: now
            });
        } else {
            return { updatedState: state, success: false, message: 'Nenhum herói disponível para flanco Noclip.' };
        }
    } else if (abilityId === 'almond_curative_surge') {
        units.forEach(u => {
            if (!u.isDead && u.side === 'allied') {
                const healAmt = Math.floor(u.maxHp * 0.5);
                u.hp = Math.min(u.maxHp, u.hp + healAmt);
            }
        });
        newLogs.push({
            id: `almond-surge-${now}`,
            message: `🥛 CURA LIMINAR DE AMÊNDOA: Regenerou 50% de HP de toda a equipe e concedeu foco de sanidade!`,
            type: 'achievement',
            timestamp: now
        });
    }

    return {
        updatedState: {
            ...state,
            units,
            towers,
            alliedScore,
            abilities: updatedAbilities,
            warLogs: [...newLogs, ...state.warLogs].slice(0, 40)
        },
        success: true,
        message: 'Habilidade executada com sucesso!'
    };
};

/**
 * Ativa invocação de uma entidade liminar contida no MOBA
 */
export const summonLiminalEntity = (
    state: GuildWarMobaState,
    entityId: 'smiler' | 'hound' | 'skin_stealer' | 'partygoer',
    lane: MobaLane = 'mid'
) => executeMobaCommanderAbility(state, 'summon_entity', { targetLane: lane, entityId } as any);

/**
 * Ativa o Túnel Noclip para flanco surpresa de herói/batedor
 */
export const executeNoclipFlank = (
    state: GuildWarMobaState,
    lane: MobaLane = 'mid',
    isScout: boolean = false
) => executeMobaCommanderAbility(state, 'noclip_flank', { targetLane: lane, isScout } as any);

/**
 * Ativa a Cura Liminar com Água de Amêndoa para todas as tropas aliadas
 */
export const executeAlmondCurativeSurge = (
    state: GuildWarMobaState
) => executeMobaCommanderAbility(state, 'almond_curative_surge');

/**
 * Ataque Manual Potente do Jogador contra uma torre ou campeão rival específico.
 */
export const executeMobaManualStrike = (
    state: GuildWarMobaState,
    targetId: string,
    partyPower: number
): { updatedState: GuildWarMobaState; damage: number; success: boolean } => {
    if (!state.battleActive || state.playerStrikesLeft <= 0) {
        return { updatedState: state, damage: 0, success: false };
    }

    const now = Date.now();
    const newLogs: MobaWarLog[] = [];
    let alliedScore = state.alliedScore;
    let towers = state.towers.map(t => ({ ...t }));
    let units = state.units.map(u => ({ ...u }));
    let damage = Math.max(350, Math.floor(partyPower * 0.85));

    // Verificar se o alvo é uma torre
    const targetTower = towers.find(t => t.id === targetId && !t.destroyed && t.side === 'rival');
    if (targetTower) {
        targetTower.hp = Math.max(0, targetTower.hp - damage);
        if (targetTower.hp <= 0) {
            targetTower.destroyed = true;
            alliedScore += targetTower.isNexus ? 2000 : 600;
            newLogs.push({
                id: `manual-tower-kill-${now}`,
                message: `🔥 SEU GOLPE DEVASTADOR destruiu a ${targetTower.name}! +600 pts`,
                type: 'achievement',
                timestamp: now
            });
        } else {
            alliedScore += 150;
            newLogs.push({
                id: `manual-tower-hit-${now}`,
                message: `⚔️ Golpe manual na ${targetTower.name}! -${damage} HP, +150 pts`,
                type: 'success',
                timestamp: now
            });
        }

        return {
            updatedState: {
                ...state,
                towers,
                alliedScore,
                playerStrikesLeft: state.playerStrikesLeft - 1,
                warLogs: [...newLogs, ...state.warLogs].slice(0, 40)
            },
            damage,
            success: true
        };
    }

    // Verificar se o alvo é uma unidade rival
    const targetUnit = units.find(u => u.id === targetId && !u.isDead && u.side === 'rival');
    if (targetUnit) {
        targetUnit.hp = Math.max(0, targetUnit.hp - damage);
        if (targetUnit.hp <= 0) {
            targetUnit.isDead = true;
            if (targetUnit.type !== 'minion') targetUnit.respawnTimer = 10;
            alliedScore += 200;
            newLogs.push({
                id: `manual-unit-kill-${now}`,
                message: `🔥 SEU GOLPE derrotou instantaneamente ${targetUnit.name}! +200 pts`,
                type: 'achievement',
                timestamp: now
            });
        } else {
            alliedScore += 80;
            newLogs.push({
                id: `manual-unit-hit-${now}`,
                message: `⚔️ Ataque focado em ${targetUnit.name}! -${damage} HP`,
                type: 'success',
                timestamp: now
            });
        }

        return {
            updatedState: {
                ...state,
                units,
                alliedScore,
                playerStrikesLeft: state.playerStrikesLeft - 1,
                warLogs: [...newLogs, ...state.warLogs].slice(0, 40)
            },
            damage,
            success: true
        };
    }

    return { updatedState: state, damage: 0, success: false };
};
