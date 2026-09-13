import type { Territory, Pet, Item } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. A JORNADA DO CONQUISTADOR (TUTORIAL EM MIGALHAS DE PÃO)
// ═══════════════════════════════════════════════════════════════════════════════

export interface JourneyStep {
    id: string;
    stepNumber: number;
    title: string;
    description: string;
    advice: string;
    targetModal: string;
    actionLabel: string;
    requirementsLabel: string;
    rewards: {
        gold?: number;
        copper?: number;
        iron?: number;
        backroomsScrap?: number;
        almondWater?: number;
        voidAlloy?: number;
        liminalFluid?: number;
        steel_plate?: number;
        basic_circuit?: number;
        chaosMarks?: number;
        starlight?: number;
    };
}

export const JOURNEY_STEPS: JourneyStep[] = [
    {
        id: 'step_foundation',
        stepNumber: 1,
        title: 'Fundação: Os Primeiros Passos',
        description: 'Colete ouro na Vila, forje uma arma e supere o Andar 5 da Torre.',
        advice: 'A Torre Infinita é o teste inicial de bravura. Suba os primeiros andares para reunir fundos e equipar seus guerreiros!',
        targetModal: 'tower',
        actionLabel: 'Entrar na Torre',
        requirementsLabel: 'Andar 5 da Torre conquistado',
        rewards: { gold: 250, copper: 30, iron: 15 }
    },
    {
        id: 'step_liminal_expansion',
        stepNumber: 2,
        title: 'Expansão Liminar: As Portas do M.E.G.',
        description: 'Abra as Backrooms, colete ao menos 20 Sucatas e realize sua primeira pesquisa científica.',
        advice: 'O espaço liminar guarda relíquias e materiais não encontrados na superfície. Recrute batedores e pesquise novas tecnologias!',
        targetModal: 'backrooms',
        actionLabel: 'Explorar Backrooms',
        requirementsLabel: '1 Pesquisa M.E.G. realizada ou 20 Sucatas reunidas',
        rewards: { backroomsScrap: 40, almondWater: 3 }
    },
    {
        id: 'step_territorial_conquest',
        stepNumber: 3,
        title: 'Conquista Territorial: A Grande Aliança',
        description: 'Conquiste ao menos 1 território no mapa mundial de Guerra e instale um módulo defensivo.',
        advice: 'Territórios rendem tributos contínuos e fendas de Fluido Liminar. Lidere seus lacaios nas rotas do MOBA e expanda o império!',
        targetModal: 'guild_war',
        actionLabel: 'Ir para a Guerra',
        requirementsLabel: '1 Território conquistado pelo jogador',
        rewards: { voidAlloy: 15, liminalFluid: 5 }
    },
    {
        id: 'step_industrial_revolution',
        stepNumber: 4,
        title: 'Revolução Industrial: Linhas de Montagem',
        description: 'Construa instalações no Complexo Industrial e mantenha sua rede com geração de MW positiva.',
        advice: 'A automação multiplica seus recursos passivos. Instale mineradoras, fornalhas e esteiras para abastecer suas futuras armadas!',
        targetModal: 'industry',
        actionLabel: 'Abrir Fábricas',
        requirementsLabel: '2+ Máquinas industriais com energia MW estável',
        rewards: { steel_plate: 25, basic_circuit: 15 }
    },
    {
        id: 'step_containment_site19',
        stepNumber: 5,
        title: 'Contenção Subterrânea: Sítio-19 (SCP)',
        description: 'Acesse as instalações subterrâneas SCP, ative a câmara do SCP-999 e realize uma transmutação no SCP-914.',
        advice: 'No Nível -4 do complexo fabril residem anomalias catalogadas. Contê-las concede bônus globais imensos para o grupo de heróis!',
        targetModal: 'industry',
        actionLabel: 'Acessar Sítio-19',
        requirementsLabel: 'Sítio-19 desbloqueado com 1 câmara ativa ou 1 transmutação no 914',
        rewards: { steel_plate: 20, almondWater: 2 }
    },
    {
        id: 'step_liminal_innovations',
        stepNumber: 6,
        title: 'Inovações Liminares: Grandes Projetos',
        description: 'Pesquise 1 tecnologia da Era 7 das Backrooms (Mercado Negro, Deep-Dive, Bio-Pets, Coliseu ou Frotas).',
        advice: 'A Era 7 une todas as frentes de guerra. Desbloqueie o contrabando clandestino ou as incursões táticas de heróis nas Backrooms!',
        targetModal: 'backrooms',
        actionLabel: 'Abrir Árvore M.E.G.',
        requirementsLabel: '1 Pesquisa de Inovação Liminar concluída',
        rewards: { chaosMarks: 50, gold: 5000 }
    },
    {
        id: 'step_cosmic_dominion',
        stepNumber: 7,
        title: 'Alcançando as Estrelas: A Conquista Cósmica',
        description: 'Construa peças de foguete no Silo, lance satélites ou forje naves capitânia com heróis almirantes.',
        advice: 'A fronteira final aguarda! Leve o poderio de sua guilda e indústria para colonizar setores estelares na Galáxia.',
        targetModal: 'galaxy',
        actionLabel: 'Viajar à Galáxia',
        requirementsLabel: '10+ Peças de Foguete, Satélite em órbita ou Galáxia desbloqueada',
        rewards: { starlight: 100 }
    }
];

export function evaluateJourneyProgress(gameState: any): {
    currentStep: JourneyStep;
    currentStepIndex: number;
    isStepCompleted: boolean;
    isAllCompleted: boolean;
    progressPercentage: number;
} {
    const state = gameState || {};
    const towerFloor = state.highestFloor ?? state.tower?.maxFloor ?? 1;
    const backroomsUnlockedTechs: string[] = Array.isArray(state.backroomsUnlockedTechs) ? state.backroomsUnlockedTechs : [];
    const backroomsScrap = state.backroomsResources?.scrap ?? state.resources?.backroomsScrap ?? 0;
    const territories: Territory[] = Array.isArray(state.territories) ? state.territories : [];
    const playerTerritories = territories.filter(t => t.owner === 'player');
    const industryNodes = Array.isArray(state.industryNodes) ? state.industryNodes : (Array.isArray(state.industry?.nodes) ? state.industry.nodes : []);
    const industryMetrics = state.industryMetrics || state.industry?.metrics || {};
    const powerGenerated = industryMetrics.powerGenerated ?? 0;
    const scpState = state.scpFoundation || state.industry?.scpFoundation;
    const scpUnlocked = Boolean(scpState?.unlocked);
    const scpChambersActive = scpState?.anomalies ? scpState.anomalies.some((a: any) => a.active) : false;
    const scp914Count = scpState?.transmuterHistory ? scpState.transmuterHistory.length : 0;
    
    const era7Techs = ['tech_black_market', 'tech_deep_dive', 'tech_pet_bioengineering', 'tech_colosseum', 'tech_cosmic_fleets'];
    const hasEra7Tech = backroomsUnlockedTechs.some(t => era7Techs.includes(t));

    const rocketParts = state.rocketPartsBuilt ?? state.industry?.rocketPartsBuilt ?? 0;
    const outerSpaceUnlocked = Boolean(state.outerSpaceUnlocked || state.galaxyUnlocked);

    // Avaliação sequencial
    const stepCompleted = [
        towerFloor >= 5, // Passo 1
        backroomsUnlockedTechs.length >= 1 || backroomsScrap >= 20, // Passo 2
        playerTerritories.length >= 1, // Passo 3
        industryNodes.length >= 2 && powerGenerated >= 10, // Passo 4
        scpUnlocked && (scpChambersActive || scp914Count >= 1), // Passo 5
        hasEra7Tech, // Passo 6
        rocketParts >= 10 || outerSpaceUnlocked // Passo 7
    ];

    let currentStepIndex = stepCompleted.findIndex(completed => !completed);
    if (currentStepIndex === -1) {
        currentStepIndex = JOURNEY_STEPS.length - 1;
        return {
            currentStep: JOURNEY_STEPS[currentStepIndex],
            currentStepIndex,
            isStepCompleted: true,
            isAllCompleted: true,
            progressPercentage: 100
        };
    }

    const currentStep = JOURNEY_STEPS[currentStepIndex];
    const isStepCompleted = stepCompleted[currentStepIndex];
    const completedCount = stepCompleted.filter(Boolean).length;
    const progressPercentage = Math.round((completedCount / JOURNEY_STEPS.length) * 100);

    return {
        currentStep,
        currentStepIndex,
        isStepCompleted,
        isAllCompleted: false,
        progressPercentage
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. RADAR TÁTICO DE GARGALOS (ARIA'S BOTTLENECK RADAR)
// ═══════════════════════════════════════════════════════════════════════════════

export interface BottleneckAlert {
    id: string;
    severity: 'critical' | 'warning' | 'opportunity';
    title: string;
    message: string;
    targetModal: string;
    actionLabel: string;
    icon: string;
}

export function detectActiveBottlenecks(gameState: any): BottleneckAlert[] {
    const alerts: BottleneckAlert[] = [];
    if (!gameState) return alerts;

    const gold = gameState.gold ?? 0;
    const towerFloor = gameState.highestFloor ?? gameState.tower?.maxFloor ?? 1;

    // 1. Gargalo Elétrico na Indústria (Crítico)
    const industryMetrics = gameState.industryMetrics || gameState.industry?.metrics;
    if (industryMetrics) {
        const powerGenerated = industryMetrics.powerGenerated ?? 0;
        const powerConsumed = industryMetrics.powerConsumed ?? 0;
        if (powerConsumed > 0 && powerGenerated < powerConsumed) {
            alerts.push({
                id: 'bottleneck_power_deficit',
                severity: 'critical',
                title: 'Déficit Elétrico Industrial',
                message: `Sua rede está consumindo ${powerConsumed} MW mas gerando apenas ${powerGenerated} MW. Máquinas estão desaceleradas!`,
                targetModal: 'industry',
                actionLabel: 'Construir Geradores',
                icon: '⚡'
            });
        }
    }

    // 2. Brecha ou Instabilidade SCP (Crítico)
    const scpState = gameState.scpFoundation || gameState.industry?.scpFoundation;
    if (scpState && scpState.unlocked) {
        if (scpState.activeBreach) {
            alerts.push({
                id: 'bottleneck_scp_breach',
                severity: 'critical',
                title: 'Alarme Código Vermelho: Brecha SCP',
                message: `Uma anomalia violou a contenção! Intervenha antes do tempo se esgotar.`,
                targetModal: 'industry',
                actionLabel: 'Selar Ala Subterrânea',
                icon: '🚨'
            });
        } else if (Array.isArray(scpState.anomalies)) {
            const unstable = scpState.anomalies.find((a: any) => a.active && a.stability < 30);
            if (unstable) {
                alerts.push({
                    id: 'bottleneck_scp_unstable',
                    severity: 'warning',
                    title: `Instabilidade no ${unstable.itemNumber}`,
                    message: `A câmara de contenção está com apenas ${Math.round(unstable.stability)}% de integridade. Alavanque energia ou envie um Oficial MTF.`,
                    targetModal: 'industry',
                    actionLabel: 'Estabilizar Câmara',
                    icon: '⚠️'
                });
            }
        }
    }

    // 3. Sanidade Crítica nas Backrooms (Aviso)
    const explorers = Array.isArray(gameState.backroomsExplorers) ? gameState.backroomsExplorers : [];
    const lowSanityCount = explorers.filter((e: any) => (e.sanity ?? 100) < 30).length;
    if (lowSanityCount > 0) {
        alerts.push({
            id: 'bottleneck_backrooms_sanity',
            severity: 'warning',
            title: 'Sanidade de Exploradores Crítica',
            message: `${lowSanityCount} batedor(es) nas Backrooms estão com menos de 30% de sanidade e correm risco de colapso.`,
            targetModal: 'backrooms',
            actionLabel: 'Distribuir Almond Water',
            icon: '🥛'
        });
    }

    // 4. Tributos Territoriais Prontos para Coleta (Oportunidade)
    const territories: Territory[] = Array.isArray(gameState.territories) ? gameState.territories : [];
    const playerTerritories = territories.filter(t => t.owner === 'player');
    const unclaimedTributes = playerTerritories.filter(t => (t.defenseBonus ?? 0) > 0 || (t.isLiminalRift && t.exoticYield)).length;
    if (unclaimedTributes >= 2) {
        alerts.push({
            id: 'bottleneck_territory_tributes',
            severity: 'opportunity',
            title: 'Tributos e Fluidos Acumulados',
            message: `Você possui ${unclaimedTributes} territórios com recursos e fluidos liminares prontos para coleta.`,
            targetModal: 'guild_war',
            actionLabel: 'Coletar no Mapa',
            icon: '🚩'
        });
    }

    // 5. Ouro Excessivo Ocioso (Oportunidade)
    if (gold > 10000 && towerFloor > 10) {
        alerts.push({
            id: 'bottleneck_excess_gold',
            severity: 'opportunity',
            title: 'Tesouro da Vila Ocioso',
            message: `Você possui ${Math.floor(gold).toLocaleString()} de ouro acumulado. Aprimore prédios na Vila ou equipe seus heróis na Taverna!`,
            targetModal: 'town',
            actionLabel: 'Investir na Vila',
            icon: '💰'
        });
    }

    return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. AÇÕES INTELIGENTES DE QUALIDADE DE VIDA (SMART ONE-CLICK QoL)
// ═══════════════════════════════════════════════════════════════════════════════

export function claimAllTerritoryTributes(
    territories: Territory[],
    currentInventory: Record<string, number> = {}
): {
    claimedGold: number;
    claimedFluid: number;
    claimedVoidAlloy: number;
    claimedScrap: number;
    updatedInventory: Record<string, number>;
    message: string;
} {
    let claimedGold = 0;
    let claimedFluid = 0;
    let claimedVoidAlloy = 0;
    let claimedScrap = 0;

    const updatedInventory = { ...currentInventory };

    for (const territory of territories) {
        if (territory.owner !== 'player') continue;

        // Rendimento básico territorial
        claimedGold += 50;

        // Rendimentos exóticos de Fendas Liminares
        if (territory.isLiminalRift && territory.exoticYield) {
            claimedFluid += territory.exoticYield.liminalFluid || 0;
            claimedVoidAlloy += territory.exoticYield.voidAlloy || 0;
            claimedScrap += territory.exoticYield.backroomsScrap || 0;
        }
    }

    updatedInventory['gold'] = (updatedInventory['gold'] || 0) + claimedGold;
    updatedInventory['liminalFluid'] = (updatedInventory['liminalFluid'] || 0) + claimedFluid;
    updatedInventory['voidAlloy'] = (updatedInventory['voidAlloy'] || 0) + claimedVoidAlloy;
    updatedInventory['backroomsScrap'] = (updatedInventory['backroomsScrap'] || 0) + claimedScrap;

    const message = claimedGold > 0 || claimedFluid > 0
        ? `🚩 Coleta Global Concluída! +${claimedGold} Ouro, +${claimedFluid} Fluido Liminar, +${claimedVoidAlloy} Ligas do Vazio.`
        : 'Nenhum tributo pendente nos territórios controlados.';

    return {
        claimedGold,
        claimedFluid,
        claimedVoidAlloy,
        claimedScrap,
        updatedInventory,
        message
    };
}

function calculateItemPower(item: any): number {
    if (!item) return 0;
    const statVal = (item.stat?.value || 0) + (item.stats?.attack || 0) + (item.stats?.defense || 0);
    const baseVal = item.value || 0;
    const levelVal = (item.level || 1) * 10;
    return statVal + baseVal + levelVal;
}

export function autoEquipBestItems(
    heroes: Array<{ id: string; name?: string; equipment?: Record<string, any> }>,
    availableItems: Item[]
): {
    equippedCount: number;
    updatedHeroes: Array<{ id: string; name?: string; equipment?: Record<string, any> }>;
    remainingItems: Item[];
    message: string;
} {
    const remainingItems = [...availableItems];
    const updatedHeroes = heroes.map(h => ({
        ...h,
        equipment: { ...(h.equipment || {}) }
    }));

    let equippedCount = 0;

    // Slots básicos de equipamento
    const slots = ['weapon', 'armor', 'accessory'];

    for (const hero of updatedHeroes) {
        for (const slot of slots) {
            // Filtrar itens compatíveis com o slot
            const candidates = remainingItems.filter(item => item.type === slot);
            if (candidates.length === 0) continue;

            // Ordenar por maior poder
            candidates.sort((a, b) => calculateItemPower(b) - calculateItemPower(a));

            const bestItem = candidates[0];
            const currentItem = hero.equipment[slot];
            const currentPower = calculateItemPower(currentItem);
            const bestPower = calculateItemPower(bestItem);

            if (bestPower > currentPower) {
                // Remover do estoque e equipar
                const itemIndex = remainingItems.findIndex(i => i.id === bestItem.id);
                if (itemIndex !== -1) {
                    remainingItems.splice(itemIndex, 1);
                    if (currentItem) {
                        remainingItems.push(currentItem);
                    }
                    hero.equipment[slot] = bestItem;
                    equippedCount++;
                }
            }
        }
    }

    return {
        equippedCount,
        updatedHeroes,
        remainingItems,
        message: equippedCount > 0
            ? `⚔️ Auto-Equip concluído com sucesso! ${equippedCount} melhoria(s) equipadas nos seus heróis.`
            : 'Seus heróis já estão utilizando os melhores equipamentos disponíveis.'
    };
}

export function feedAllPets(
    pets: Pet[],
    availableFood: number
): {
    fedCount: number;
    consumedFood: number;
    updatedPets: Pet[];
    remainingFood: number;
    message: string;
} {
    let food = availableFood;
    let fedCount = 0;

    const updatedPets = pets.map(pet => {
        const affinity = pet.affinity ?? 50;
        // Se afinidade estiver abaixo de 100 e houver comida
        if (affinity < 100 && food >= 1) {
            food -= 1;
            fedCount += 1;
            return {
                ...pet,
                affinity: Math.min(100, affinity + 15)
            };
        }
        return pet;
    });

    return {
        fedCount,
        consumedFood: availableFood - food,
        updatedPets,
        remainingFood: food,
        message: fedCount > 0
            ? `🐾 ${fedCount} mascote(s) alimentados com carinho! (+15 afinidade cada).`
            : 'Todos os mascotes já estão alimentados e felizes.'
    };
}

export function quickSanityRestore(
    explorers: Array<{ id: string; name?: string; sanity: number }>,
    availableAlmondWater: number
): {
    restoredCount: number;
    consumedWater: number;
    updatedExplorers: Array<{ id: string; name?: string; sanity: number }>;
    remainingWater: number;
    message: string;
} {
    let water = availableAlmondWater;
    let restoredCount = 0;

    const updatedExplorers = explorers.map(exp => {
        // Se a sanidade for menor que 40% e houver Almond Water
        if (exp.sanity < 40 && water >= 1) {
            water -= 1;
            restoredCount += 1;
            return {
                ...exp,
                sanity: 100
            };
        }
        return exp;
    });

    return {
        restoredCount,
        consumedWater: availableAlmondWater - water,
        updatedExplorers,
        remainingWater: water,
        message: restoredCount > 0
            ? `🥛 Sanidade restaurada para ${restoredCount} explorador(es) em estado crítico!`
            : 'Nenhum explorador em estado crítico de sanidade (<40%).'
    };
}
