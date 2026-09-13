import type { Pet } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. PILAR 1: O MERCADO NEGRO & CONTRABANDO (tech_black_market)
// ═══════════════════════════════════════════════════════════════════════════════

export interface BlackMarketAuctionItem {
    id: string;
    name: string;
    rarity: 'rare' | 'epic' | 'legendary' | 'anomalous';
    icon: string;
    description: string;
    startingBid: number;
    currentBid: number;
    highestBidder: 'player' | 'npc';
    currency: 'gold' | 'chaos_marks' | 'void_alloy';
    timeLeftSeconds: number;
    isWon: boolean;
}

export interface SmugglingConvoy {
    id: string;
    name: string;
    riskLevel: 'low' | 'medium' | 'high';
    cargoRequired: Record<string, number>;
    rewardChaosMarks: number;
    rewardGold: number;
    durationSeconds: number;
    dispatchedAt: number;
    completed: boolean;
    intercepted: boolean;
}

export const DEFAULT_AUCTIONS: BlackMarketAuctionItem[] = [
    {
        id: 'auction_overclock_schematic',
        name: 'Planta Clandestina de Overclock',
        rarity: 'legendary',
        icon: '📜',
        description: 'Projeto não autorizado que duplica a velocidade de montadoras industriais.',
        startingBid: 2500,
        currentBid: 2500,
        highestBidder: 'npc',
        currency: 'gold',
        timeLeftSeconds: 180,
        isWon: false
    },
    {
        id: 'auction_liminal_core',
        name: 'Núcleo de Singularidade Enjaulado',
        rarity: 'anomalous',
        icon: '🔮',
        description: 'Artefato das profundezas liminares que emite pulsos de energia perpétua.',
        startingBid: 50,
        currentBid: 50,
        highestBidder: 'npc',
        currency: 'chaos_marks',
        timeLeftSeconds: 240,
        isWon: false
    }
];

export function bidOnAuction(
    auction: BlackMarketAuctionItem,
    bidAmount: number,
    playerFunds: number,
    isTechUnlocked: boolean
): {
    success: boolean;
    updatedAuction: BlackMarketAuctionItem;
    remainingFunds: number;
    message: string;
} {
    if (!isTechUnlocked) {
        return {
            success: false,
            updatedAuction: auction,
            remainingFunds: playerFunds,
            message: '❌ Requer a pesquisa "Rotas do Mercado Negro" na Árvore das Backrooms.'
        };
    }

    if (auction.isWon || auction.timeLeftSeconds <= 0) {
        return {
            success: false,
            updatedAuction: auction,
            remainingFunds: playerFunds,
            message: '❌ Este leilão já foi encerrado.'
        };
    }

    if (bidAmount <= auction.currentBid) {
        return {
            success: false,
            updatedAuction: auction,
            remainingFunds: playerFunds,
            message: `❌ Seu lance deve ser maior que o lance atual (${auction.currentBid}).`
        };
    }

    if (playerFunds < bidAmount) {
        return {
            success: false,
            updatedAuction: auction,
            remainingFunds: playerFunds,
            message: '❌ Saldo insuficiente para cobrir o lance.'
        };
    }

    const updatedAuction: BlackMarketAuctionItem = {
        ...auction,
        currentBid: bidAmount,
        highestBidder: 'player',
        timeLeftSeconds: Math.max(20, auction.timeLeftSeconds)
    };

    return {
        success: true,
        updatedAuction,
        remainingFunds: playerFunds - bidAmount,
        message: `✅ Lance de ${bidAmount} aceito com sucesso!`
    };
}

export function dispatchSmugglingConvoy(
    convoyDef: { id: string; name: string; riskLevel: 'low' | 'medium' | 'high'; cargoRequired: Record<string, number>; rewardChaosMarks: number; rewardGold: number; durationSeconds: number },
    inventory: Record<string, number>,
    isTechUnlocked: boolean,
    now: number = Date.now()
): {
    success: boolean;
    convoy: SmugglingConvoy | null;
    updatedInventory: Record<string, number>;
    message: string;
} {
    if (!isTechUnlocked) {
        return {
            success: false,
            convoy: null,
            updatedInventory: inventory,
            message: '❌ Requer a tecnologia de Mercado Negro.'
        };
    }

    const updatedInventory = { ...inventory };

    // Validar materiais
    for (const [matId, amount] of Object.entries(convoyDef.cargoRequired)) {
        if ((updatedInventory[matId] || 0) < amount) {
            return {
                success: false,
                convoy: null,
                updatedInventory: inventory,
                message: `❌ Carga insuficiente: requer ${amount}x ${matId}.`
            };
        }
    }

    // Deduzir materiais
    for (const [matId, amount] of Object.entries(convoyDef.cargoRequired)) {
        updatedInventory[matId] -= amount;
    }

    const convoy: SmugglingConvoy = {
        ...convoyDef,
        dispatchedAt: now,
        completed: false,
        intercepted: false
    };

    return {
        success: true,
        convoy,
        updatedInventory,
        message: `📦 Comboio "${convoy.name}" despachado através das fendas liminares!`
    };
}

export function claimSmugglingConvoy(
    convoy: SmugglingConvoy,
    now: number = Date.now(),
    rng: () => number = Math.random
): {
    success: boolean;
    completedConvoy: SmugglingConvoy;
    gainedChaosMarks: number;
    gainedGold: number;
    message: string;
} {
    const elapsedSeconds = (now - convoy.dispatchedAt) / 1000;
    if (elapsedSeconds < convoy.durationSeconds) {
        return {
            success: false,
            completedConvoy: convoy,
            gainedChaosMarks: 0,
            gainedGold: 0,
            message: `⏳ Comboio ainda em trânsito (${Math.ceil(convoy.durationSeconds - elapsedSeconds)}s restantes).`
        };
    }

    // Avaliação de risco de interceptação
    const interceptChance = convoy.riskLevel === 'high' ? 0.35 : convoy.riskLevel === 'medium' ? 0.15 : 0.05;
    const isIntercepted = rng() < interceptChance;

    const gainedChaosMarks = isIntercepted ? Math.floor(convoy.rewardChaosMarks * 0.5) : convoy.rewardChaosMarks;
    const gainedGold = isIntercepted ? Math.floor(convoy.rewardGold * 0.5) : convoy.rewardGold;

    const completedConvoy: SmugglingConvoy = {
        ...convoy,
        completed: true,
        intercepted: isIntercepted
    };

    const message = isIntercepted
        ? `⚠️ O comboio sofreu uma emboscada no caminho! Conseguiu resgatar metade da carga (+${gainedChaosMarks} Marcas, +${gainedGold} Ouro).`
        : `🎉 Comboio retornou ileso! Recebido: +${gainedChaosMarks} Marcas do Caos e +${gainedGold} Ouro!`;

    return {
        success: true,
        completedConvoy,
        gainedChaosMarks,
        gainedGold,
        message
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PILAR 2: OPERAÇÃO DEEP-DIVE ROGUELIKE (tech_deep_dive)
// ═══════════════════════════════════════════════════════════════════════════════

export type DeepDiveNodeType = 'combat' | 'sanity_rest' | 'scp_transmuter' | 'boss';

export interface DeepDiveNode {
    id: string;
    type: DeepDiveNodeType;
    name: string;
    description: string;
    enemyPower: number;
    completed: boolean;
    rewardScrap: number;
}

export interface DeepDiveRunState {
    active: boolean;
    squadHeroIds: string[];
    floor: number;
    squadSanity: number; // 0 a 100
    squadHpPercent: number; // 0 a 100
    currentNodeIndex: number;
    nodes: DeepDiveNode[];
    accumulatedLoot: {
        scrap: number;
        almondWater: number;
        anomalyParts: number;
        relics: string[];
    };
    isDefeated: boolean;
    isVictory: boolean;
}

export function startDeepDiveRun(
    squadHeroIds: string[],
    heroes: Array<{ id: string; name?: string; stats?: { attack?: number; defense?: number } }>,
    floor: number = 25,
    isTechUnlocked: boolean = true
): {
    success: boolean;
    runState: DeepDiveRunState | null;
    message: string;
} {
    if (!isTechUnlocked) {
        return {
            success: false,
            runState: null,
            message: '❌ Requer a pesquisa "Operação Deep-Dive Roguelike" nas Backrooms.'
        };
    }

    if (!squadHeroIds || squadHeroIds.length !== 3) {
        return {
            success: false,
            runState: null,
            message: '❌ Uma Operação Deep-Dive requer exatamente 3 heróis no esquadrão tático.'
        };
    }

    const validHeroes = heroes.filter(h => squadHeroIds.includes(h.id));
    if (validHeroes.length < 3) {
        return {
            success: false,
            runState: null,
            message: '❌ Um ou mais heróis selecionados não foram encontrados.'
        };
    }

    const baseEnemyPower = Math.floor(floor * 40);

    const nodes: DeepDiveNode[] = [
        {
            id: 'node_1',
            type: 'combat',
            name: 'Sala de Fita Magnética Amarela',
            description: 'Emboscada de Hounds Liminares rondando nos corredores úmidos.',
            enemyPower: baseEnemyPower,
            completed: false,
            rewardScrap: 25
        },
        {
            id: 'node_2',
            type: 'sanity_rest',
            name: 'Refúgio M.E.G. Abandonado',
            description: 'Ponto de descanso com filtro de condensação de Almond Water.',
            enemyPower: 0,
            completed: false,
            rewardScrap: 10
        },
        {
            id: 'node_3',
            type: 'combat',
            name: 'Pátio de Concreto e Tubulações',
            description: 'Agrupamento de Skin-Stealers atraídos pelo barulho dos heróis.',
            enemyPower: Math.floor(baseEnemyPower * 1.3),
            completed: false,
            rewardScrap: 35
        },
        {
            id: 'node_4',
            type: 'scp_transmuter',
            name: 'Câmara do SCP-914 de Bolso',
            description: 'Mecanismo mecânico de engrenagens montado por exploradores.',
            enemyPower: 0,
            completed: false,
            rewardScrap: 15
        },
        {
            id: 'node_5',
            type: 'boss',
            name: 'O Abismo do Guardião Liminar',
            description: 'Monstruosidade ancestral que bloqueia a fenda dimensional.',
            enemyPower: Math.floor(baseEnemyPower * 2.0),
            completed: false,
            rewardScrap: 80
        }
    ];

    const runState: DeepDiveRunState = {
        active: true,
        squadHeroIds,
        floor,
        squadSanity: 100,
        squadHpPercent: 100,
        currentNodeIndex: 0,
        nodes,
        accumulatedLoot: {
            scrap: 0,
            almondWater: 0,
            anomalyParts: 0,
            relics: []
        },
        isDefeated: false,
        isVictory: false
    };

    return {
        success: true,
        runState,
        message: '🧭 Incursão Deep-Dive iniciada! O esquadrão adentrou a fenda.'
    };
}

export function resolveDeepDiveAction(
    runState: DeepDiveRunState,
    action: 'advance' | 'drink_almond_water' | 'flee',
    heroes: Array<{ id: string; stats?: { attack?: number; defense?: number } }>,
    inventory: Record<string, number> = {},
    rng: () => number = Math.random
): {
    updatedRun: DeepDiveRunState;
    updatedInventory: Record<string, number>;
    message: string;
} {
    if (!runState.active || runState.isDefeated || runState.isVictory) {
        return {
            updatedRun: runState,
            updatedInventory: inventory,
            message: 'Incursão não está ativa.'
        };
    }

    const updatedRun: DeepDiveRunState = {
        ...runState,
        nodes: [...runState.nodes],
        accumulatedLoot: { ...runState.accumulatedLoot, relics: [...runState.accumulatedLoot.relics] }
    };
    const updatedInventory = { ...inventory };

    if (action === 'drink_almond_water') {
        if ((updatedInventory['almondWater'] || 0) < 1) {
            return {
                updatedRun,
                updatedInventory,
                message: '❌ Sem Água de Amêndoa no inventário!'
            };
        }
        updatedInventory['almondWater'] -= 1;
        updatedRun.squadSanity = Math.min(100, updatedRun.squadSanity + 40);
        updatedRun.squadHpPercent = Math.min(100, updatedRun.squadHpPercent + 25);
        return {
            updatedRun,
            updatedInventory,
            message: '🥛 O esquadrão bebeu Água de Amêndoa! Sanidade restaurada (+40%) e ferimentos curados (+25%).'
        };
    }

    if (action === 'flee') {
        updatedRun.active = false;
        updatedRun.isDefeated = true;
        return {
            updatedRun,
            updatedInventory,
            message: '🏃 O esquadrão recuou em pânico para fora da fenda liminar!'
        };
    }

    // Ação: advance (resolver nó atual)
    const currentNode = updatedRun.nodes[updatedRun.currentNodeIndex];
    if (!currentNode) {
        updatedRun.isVictory = true;
        updatedRun.active = false;
        return { updatedRun, updatedInventory, message: '🎉 Todas as salas foram superadas!' };
    }

    // Calcular poder do esquadrão
    const squadPower = heroes
        .filter(h => updatedRun.squadHeroIds.includes(h.id))
        .reduce((sum, h) => sum + ((h.stats?.attack || 50) + (h.stats?.defense || 40)), 0);

    let message = '';

    if (currentNode.type === 'combat' || currentNode.type === 'boss') {
        const isBoss = currentNode.type === 'boss';
        const winChance = squadPower >= currentNode.enemyPower ? 0.90 : Math.max(0.2, squadPower / currentNode.enemyPower);

        if (rng() <= winChance) {
            // Vitória
            const hpLoss = Math.floor((1 - (squadPower / (squadPower + currentNode.enemyPower))) * 35);
            updatedRun.squadHpPercent = Math.max(1, updatedRun.squadHpPercent - hpLoss);
            updatedRun.squadSanity = Math.max(1, updatedRun.squadSanity - 15);
            updatedRun.accumulatedLoot.scrap += currentNode.rewardScrap;
            if (isBoss) {
                updatedRun.accumulatedLoot.anomalyParts += 2;
                updatedRun.accumulatedLoot.relics.push('Relíquia da Fenda Primordial');
            }
            currentNode.completed = true;
            message = isBoss 
                ? `🏆 BOSS DERROTADO! A monstruosidade tombou diante da cooperação do esquadrão!` 
                : `⚔️ Combate vencido! Inimigos eliminados (+${currentNode.rewardScrap} Sucatas).`;
        } else {
            // Derrota
            updatedRun.squadHpPercent = 0;
            updatedRun.squadSanity = 0;
            updatedRun.isDefeated = true;
            updatedRun.active = false;
            return {
                updatedRun,
                updatedInventory,
                message: `💀 O esquadrão foi subjugado em combate na ${currentNode.name}!`
            };
        }
    } else if (currentNode.type === 'sanity_rest') {
        updatedRun.squadSanity = Math.min(100, updatedRun.squadSanity + 30);
        updatedRun.squadHpPercent = Math.min(100, updatedRun.squadHpPercent + 20);
        updatedRun.accumulatedLoot.almondWater += 1;
        currentNode.completed = true;
        message = '🏕️ Refúgio encontrado! Descanso revigorante e +1 Água de Amêndoa coletada.';
    } else if (currentNode.type === 'scp_transmuter') {
        updatedRun.accumulatedLoot.relics.push('Engrenagem Anômala 914');
        currentNode.completed = true;
        message = '⚙️ Mecanismo do SCP-914 acionado! Uma relíquia anômala foi forjada no campo.';
    }

    // Avançar índice
    updatedRun.currentNodeIndex += 1;
    if (updatedRun.currentNodeIndex >= updatedRun.nodes.length) {
        updatedRun.isVictory = true;
        updatedRun.active = false;
        message += ' 🎉 Incursão concluída com SUCESSO TOTAL!';
    }

    return {
        updatedRun,
        updatedInventory,
        message
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PILAR 3: BIO-ENGENHARIA QUIMÉRICA DE PETS (tech_pet_bioengineering)
// ═══════════════════════════════════════════════════════════════════════════════

export type ChimericInfusion = 'liminal_fluid' | 'scp_999_gel' | 'scp_682_scale';

export interface ChimericPetResult {
    name: string;
    species: string;
    rarity: 'mythic';
    emoji: string;
    infusionUsed: ChimericInfusion;
    chimericTrait: string;
    bonusStats: {
        attackBonus: number;
        speedBonus: number;
        defenseBonus: number;
    };
    automationBonusText: string;
}

export function infusePetBreeding(
    parent1: Pet,
    parent2: Pet,
    infusion: ChimericInfusion,
    inventory: Record<string, number>,
    isTechUnlocked: boolean
): {
    success: boolean;
    chimericPet: ChimericPetResult | null;
    updatedInventory: Record<string, number>;
    message: string;
} {
    if (!isTechUnlocked) {
        return {
            success: false,
            chimericPet: null,
            updatedInventory: inventory,
            message: '❌ Requer a pesquisa "Bio-Engenharia Quimérica de Pets" nas Backrooms.'
        };
    }

    const materialMap: Record<ChimericInfusion, { id: string; required: number; label: string }> = {
        liminal_fluid: { id: 'liminalFluid', required: 2, label: 'Fluido Liminar' },
        scp_999_gel: { id: 'gel_999', required: 1, label: 'Gel de SCP-999' },
        scp_682_scale: { id: 'adaptive_carapace', required: 1, label: 'Quitina de SCP-682' }
    };

    const req = materialMap[infusion];
    const updatedInventory = { ...inventory };

    if ((updatedInventory[req.id] || 0) < req.required) {
        return {
            success: false,
            chimericPet: null,
            updatedInventory: inventory,
            message: `❌ Insumo insuficiente: requer ${req.required}x ${req.label}.`
        };
    }

    updatedInventory[req.id] -= req.required;

    let chimericPet: ChimericPetResult;

    if (infusion === 'liminal_fluid') {
        chimericPet = {
            name: `${parent1.name}-${parent2.name} Liminar`,
            species: 'Quimera de Fenda Dimensional',
            rarity: 'mythic',
            emoji: '🐺🌀',
            infusionUsed: infusion,
            chimericTrait: 'Salto de Rota & Esquiva de Fases (+30% Evasão)',
            bonusStats: { attackBonus: 25, speedBonus: 40, defenseBonus: 15 },
            automationBonusText: '+20% Velocidade das esteiras de transporte na Indústria.'
        };
    } else if (infusion === 'scp_999_gel') {
        chimericPet = {
            name: `${parent1.name} Eufórico`,
            species: 'Mascote Gelatinoso Anômalo',
            rarity: 'mythic',
            emoji: '🍮✨',
            infusionUsed: infusion,
            chimericTrait: 'Aura Calmante (+25% Cura Global & Sanidade)',
            bonusStats: { attackBonus: 10, speedBonus: 35, defenseBonus: 30 },
            automationBonusText: '+30% Eficiência de montadoras e fábricas químicas.'
        };
    } else {
        chimericPet = {
            name: `${parent2.name} Blindado 682`,
            species: 'Quimera Reptiliana Adaptativa',
            rarity: 'mythic',
            emoji: '🐊🛡️',
            infusionUsed: infusion,
            chimericTrait: 'Carapaça Reativa Indestrutível (+50% Defesa e Espinhos)',
            bonusStats: { attackBonus: 35, speedBonus: 10, defenseBonus: 55 },
            automationBonusText: '+40% Defesa nos cercos de Guerra de Territórios.'
        };
    }

    return {
        success: true,
        chimericPet,
        updatedInventory,
        message: `🧬 Sucesso Genético! O processo gerou o pet quimérico "${chimericPet.name}"!`
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PILAR 4: COLISEU DAS LENDAS DIMENSIONAIS (tech_colosseum)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ColosseumFormation {
    vanguard: string[]; // Hero IDs (máx 2)
    mid: string[];      // Hero IDs (máx 2)
    rear: string[];     // Hero IDs (máx 2)
}

export interface ColosseumBattleReport {
    victory: boolean;
    rounds: number;
    gloryPointsGained: number;
    playerSurvivorsCount: number;
    log: string[];
}

export function validateColosseumFormation(
    formation: ColosseumFormation,
    availableHeroes: Array<{ id: string }>
): boolean {
    const allAssigned = [...formation.vanguard, ...formation.mid, ...formation.rear];
    if (allAssigned.length === 0) return false;

    // Verificar heróis duplicados
    const unique = new Set(allAssigned);
    if (unique.size !== allAssigned.length) return false;

    // Verificar se todos existem
    return allAssigned.every(id => availableHeroes.some(h => h.id === id));
}

export function simulateColosseumBattle(
    playerFormation: ColosseumFormation,
    opponentFormation: ColosseumFormation,
    heroes: Array<{ id: string; name?: string; stats?: { attack?: number; defense?: number; hp?: number } }>,
    isTechUnlocked: boolean
): {
    success: boolean;
    report: ColosseumBattleReport | null;
    message: string;
} {
    if (!isTechUnlocked) {
        return {
            success: false,
            report: null,
            message: '❌ Requer a tecnologia "Coliseu das Lendas Dimensionais".'
        };
    }

    if (!validateColosseumFormation(playerFormation, heroes)) {
        return {
            success: false,
            report: null,
            message: '❌ Formação inválida: escale ao menos 1 herói válido sem duplicatas.'
        };
    }

    const calculateLinePower = (heroIds: string[]) => {
        return heroIds.reduce((sum, id) => {
            const h = heroes.find(hero => hero.id === id);
            return sum + ((h?.stats?.attack || 60) + (h?.stats?.defense || 50));
        }, 0);
    };

    // Vanguarda dá bônus defensivo, Meio dá DPS, Retaguarda dá dano crítico/cura
    const playerVanguard = calculateLinePower(playerFormation.vanguard) * 1.3;
    const playerMid = calculateLinePower(playerFormation.mid) * 1.1;
    const playerRear = calculateLinePower(playerFormation.rear) * 1.2;
    const totalPlayerPower = playerVanguard + playerMid + playerRear;

    const oppVanguard = calculateLinePower(opponentFormation.vanguard) * 1.3;
    const oppMid = calculateLinePower(opponentFormation.mid) * 1.1;
    const oppRear = calculateLinePower(opponentFormation.rear) * 1.2;
    const totalOpponentPower = oppVanguard + oppMid + oppRear || 250;

    const log: string[] = [];
    log.push(`⚔️ Choque de Vanguarda: Linha de frente colide com ímpeto!`);

    const victory = totalPlayerPower >= totalOpponentPower;
    const rounds = Math.floor(Math.random() * 3) + 3;

    if (victory) {
        log.push(`🛡️ A Vanguarda segurou os golpes adversários com maestria.`);
        log.push(`💥 O Meio e a Retaguarda flanquearam o oponente, garantindo a vitória.`);
    } else {
        log.push(`💔 A defesa ruiu sob o poder concentrado do adversário.`);
    }

    const gloryPointsGained = victory ? 150 : 25;
    const playerSurvivorsCount = victory ? Math.max(1, [...playerFormation.vanguard, ...playerFormation.mid, ...playerFormation.rear].length - 1) : 0;

    const report: ColosseumBattleReport = {
        victory,
        rounds,
        gloryPointsGained,
        playerSurvivorsCount,
        log
    };

    return {
        success: true,
        report,
        message: victory ? '🏆 Vitória gloriosa no Coliseu das Lendas!' : 'Derrota honrosa no Coliseu.'
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PILAR 5: ARMADA CÓSMICA & FROTAS DE GUERRA (tech_cosmic_fleets)
// ═══════════════════════════════════════════════════════════════════════════════

export type FleetShipClass = 'frigate' | 'carrier' | 'dreadnought';

export interface FleetShip {
    id: string;
    name: string;
    shipClass: FleetShipClass;
    hull: number;
    shields: number;
    firepower: number;
    assignedAdmiralHeroId?: string | null;
    active: boolean;
}

export function buildFleetShip(
    shipClass: FleetShipClass,
    industrialInventory: Record<string, number>,
    isTechUnlocked: boolean
): {
    success: boolean;
    ship: FleetShip | null;
    updatedInventory: Record<string, number>;
    message: string;
} {
    if (!isTechUnlocked) {
        return {
            success: false,
            ship: null,
            updatedInventory: industrialInventory,
            message: '❌ Requer a pesquisa "Armada de Frotas Cósmicas" na Árvore das Backrooms.'
        };
    }

    const costs: Record<FleetShipClass, { steel: number; circuits: number; engines: number; name: string }> = {
        frigate: { steel: 20, circuits: 10, engines: 2, name: 'Fragata de Patrulha Estelar' },
        carrier: { steel: 50, circuits: 25, engines: 5, name: 'Porta-Naves Cósmico' },
        dreadnought: { steel: 100, circuits: 50, engines: 10, name: 'Dreadnought Leviatã' }
    };

    const cost = costs[shipClass];
    const updatedInventory = { ...industrialInventory };

    if (
        (updatedInventory['steel_plate'] || 0) < cost.steel ||
        (updatedInventory['basic_circuit'] || 0) < cost.circuits ||
        (updatedInventory['engine_unit'] || 0) < cost.engines
    ) {
        return {
            success: false,
            ship: null,
            updatedInventory: industrialInventory,
            message: `❌ Materiais industriais insuficientes (Requer ${cost.steel} Aço, ${cost.circuits} Circuitos, ${cost.engines} Motores).`
        };
    }

    updatedInventory['steel_plate'] -= cost.steel;
    updatedInventory['basic_circuit'] -= cost.circuits;
    updatedInventory['engine_unit'] -= cost.engines;

    const baseStats = {
        frigate: { hull: 500, shields: 300, firepower: 120 },
        carrier: { hull: 1200, shields: 800, firepower: 350 },
        dreadnought: { hull: 3000, shields: 2000, firepower: 900 }
    }[shipClass];

    const ship: FleetShip = {
        id: `ship_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: cost.name,
        shipClass,
        hull: baseStats.hull,
        shields: baseStats.shields,
        firepower: baseStats.firepower,
        assignedAdmiralHeroId: null,
        active: true
    };

    return {
        success: true,
        ship,
        updatedInventory,
        message: `🚀 Nave Capitânia "${ship.name}" forjada no Estaleiro Orbital com sucesso!`
    };
}

export function assignAdmiralToShip(
    ship: FleetShip,
    heroId: string | null,
    heroes: Array<{ id: string; name?: string; stats?: { attack?: number; defense?: number } }>
): FleetShip {
    return {
        ...ship,
        assignedAdmiralHeroId: heroId
    };
}

export function calculateArmadaTotalPower(
    ships: FleetShip[],
    heroes: Array<{ id: string; stats?: { attack?: number; defense?: number } }>
): {
    totalHull: number;
    totalShields: number;
    totalFirepower: number;
    fleetRating: number;
} {
    let totalHull = 0;
    let totalShields = 0;
    let totalFirepower = 0;

    for (const ship of ships) {
        if (!ship.active) continue;

        let fp = ship.firepower;
        let sh = ship.shields;

        if (ship.assignedAdmiralHeroId) {
            const admiral = heroes.find(h => h.id === ship.assignedAdmiralHeroId);
            if (admiral?.stats) {
                fp += Math.floor((admiral.stats.attack || 0) * 0.5);
                sh += Math.floor((admiral.stats.defense || 0) * 0.5);
            }
        }

        totalHull += ship.hull;
        totalShields += sh;
        totalFirepower += fp;
    }

    const fleetRating = totalHull + totalShields + (totalFirepower * 2);

    return {
        totalHull,
        totalShields,
        totalFirepower,
        fleetRating
    };
}
