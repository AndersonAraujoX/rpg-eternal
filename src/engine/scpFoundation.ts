import type {
    ScpAnomaly,
    ScpBreachEvent,
    ScpFoundationState,
    Scp914Mode,
    Scp914Result
} from './types';

// ═══════════════════════════════════════════════════════════════
// Catálogo Inicial de Anomalias SCP (Sítio-19)
// ═══════════════════════════════════════════════════════════════

export const INITIAL_SCP_ANOMALIES: ScpAnomaly[] = [
    {
        id: 'scp_999',
        itemNumber: 'SCP-999',
        name: 'O Monstro das Cócegas',
        classification: 'Safe',
        description: 'Massa gelatinosa translúcida laranja de odor doce. Induz euforia e tranquilidade instantânea em qualquer ser vivo.',
        icon: '🍮',
        powerRequired: 5,
        materialsRequired: { coal: 2 },
        outputItemId: 'gel_999',
        outputItemName: 'Gel de Euforia',
        outputItemIcon: '✨',
        outputRate: 1,
        stability: 100,
        active: true,
        breached: false,
        passiveEffectDescription: '+15% de Velocidade de Ataque para o Grupo de Heróis.'
    },
    {
        id: 'scp_500',
        itemNumber: 'SCP-500',
        name: 'Panaceia',
        classification: 'Safe',
        description: 'Frasco contendo pequenas pílulas vermelhas capazes de curar instantaneamente qualquer doença, ferimento ou aflição biológica.',
        icon: '💊',
        powerRequired: 10,
        materialsRequired: { basic_circuit: 1 },
        outputItemId: 'panacea_pill',
        outputItemName: 'Pílula Panaceia',
        outputItemIcon: '🔴',
        outputRate: 1,
        stability: 100,
        active: true,
        breached: false,
        passiveEffectDescription: 'Gera pílulas que ressuscitam heróis e restauram 100% de HP.'
    },
    {
        id: 'scp_173',
        itemNumber: 'SCP-173',
        name: 'A Escultura',
        classification: 'Euclid',
        description: 'Construção de concreto reforçado com vergalhões e tinta automotiva. Move-se a velocidades aterrorizantes quando fora da linha de visão direta.',
        icon: '🗿',
        powerRequired: 15,
        materialsRequired: { stone: 5 },
        outputItemId: 'concrete_dust_173',
        outputItemName: 'Pó de Concreto Anômalo',
        outputItemIcon: '🧱',
        outputRate: 2,
        stability: 85,
        active: false,
        breached: false,
        passiveEffectDescription: '+20% de Defesa para Guerreiros e Paladinos.'
    },
    {
        id: 'scp_049',
        itemNumber: 'SCP-049',
        name: 'O Médico da Peste',
        classification: 'Euclid',
        description: 'Entidade humanóide trajando túnicas de médico da peste do século XV. Obcecado em curar o que ele chama de "A Grande Pestilência".',
        icon: '🎭',
        powerRequired: 25,
        materialsRequired: { advanced_circuit: 1 },
        outputItemId: 'plague_cure_serum',
        outputItemName: 'Soro da Pestilência',
        outputItemIcon: '🧪',
        outputRate: 1,
        stability: 80,
        active: false,
        breached: false,
        passiveEffectDescription: '+15% de Roubo de Vida Global para todos os heróis.'
    },
    {
        id: 'scp_682',
        itemNumber: 'SCP-682',
        name: 'O Réptil Difícil de Destruir',
        classification: 'Keter',
        description: 'Criatura reptiliana massiva e imortal com ódio profundo por toda a vida. Adapta-se biologicamente a qualquer dano ou ácido que receba.',
        icon: '🐊',
        powerRequired: 60,
        materialsRequired: { sulfuric_acid: 5, steel_plate: 2 },
        outputItemId: 'adaptive_carapace',
        outputItemName: 'Quitina Adaptativa de 682',
        outputItemIcon: '🛡️',
        outputRate: 1,
        stability: 60,
        active: false,
        breached: false,
        passiveEffectDescription: '+30% de Dano em Batalhas de Cerco e produz placas lendárias para a Forja.'
    }
];

export const INITIAL_SCP_STATE: ScpFoundationState = {
    unlocked: false,
    anomalies: INITIAL_SCP_ANOMALIES,
    activeBreach: null,
    transmuterHistory: []
};

// ═══════════════════════════════════════════════════════════════
// Funções Puras & Lógica de Negócio do Sítio-19
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica se os requisitos para desbloquear o Sítio-19 da Fundação foram atingidos.
 * Requisito estrito: O jogador deve possuir a indústria operacional (nós de máquinas instalados
 * ou Automação I pesquisada ou prédio industrial construído).
 */
export function checkScpUnlockCondition(
    industryState: { nodes?: any[]; unlockedTechs?: string[] },
    buildings: Array<{ id: string; level: number }> = [],
    highestFloor: number = 1
): boolean {
    const hasActiveMachines = (industryState.nodes && industryState.nodes.length > 0);
    const hasAutomationTech = (industryState.unlockedTechs && industryState.unlockedTechs.includes('tech_automation_1'));
    const hasIndustryBuilding = buildings.some(b => b.id === 'industry' && b.level > 0);
    const hasReachedDeepFloor = highestFloor >= 50;

    return Boolean(hasActiveMachines || hasAutomationTech || hasIndustryBuilding || hasReachedDeepFloor);
}

/**
 * Simula um ciclo (tick) da Fundação SCP.
 * - Verifica o suprimento de energia elétrica (MW) da indústria.
 * - Deduz insumos industriais requeridos para manter as câmaras ativas.
 * - Produz os subprodutos anômalos correspondentes.
 * - Atualiza a estabilidade das anomalias e detecta brechas de contenção.
 */
export function simulateScpTick(
    state: ScpFoundationState,
    powerAvailable: number,
    powerConsumed: number,
    inventory: Record<string, number>,
    heroes: Array<{ id: string; name?: string; stats?: { attack?: number; defense?: number } }> = [],
    deltaSeconds: number = 1
): {
    updatedState: ScpFoundationState;
    updatedInventory: Record<string, number>;
    logs: string[];
} {
    if (!state.unlocked) {
        return { updatedState: state, updatedInventory: inventory, logs: [] };
    }

    const updatedInventory = { ...inventory };
    const logs: string[] = [];
    const powerEfficiency = powerConsumed > 0 ? Math.min(1.0, powerAvailable / powerConsumed) : 1.0;
    const isBlackout = powerEfficiency < 0.8;

    let activeBreach: ScpBreachEvent | null = state.activeBreach ? { ...state.activeBreach } : null;

    const updatedAnomalies = state.anomalies.map(anomaly => {
        if (!anomaly.active) {
            return anomaly;
        }

        let currentStability = anomaly.stability;
        let isBreached = anomaly.breached;

        // Bônus se houver herói atuando como Oficial MTF
        const hasAssignedHero = Boolean(anomaly.assignedHeroId && heroes.some(h => h.id === anomaly.assignedHeroId));

        if (isBlackout) {
            // Queda brusca de estabilidade na falta de energia
            const penalty = (anomaly.classification === 'Keter' ? 8 : anomaly.classification === 'Euclid' ? 4 : 1) * deltaSeconds;
            currentStability = Math.max(0, currentStability - penalty);
            logs.push(`⚠️ Déficit de Energia no Sítio-19! Estabilidade de ${anomaly.itemNumber} caiu para ${currentStability.toFixed(0)}%!`);
        } else {
            // Verificar materiais de consumo
            let hasAllMaterials = true;
            if (anomaly.materialsRequired) {
                for (const [matId, requiredAmount] of Object.entries(anomaly.materialsRequired)) {
                    if ((updatedInventory[matId] || 0) < requiredAmount) {
                        hasAllMaterials = false;
                        break;
                    }
                }
            }

            if (hasAllMaterials) {
                // Consome materiais
                if (anomaly.materialsRequired) {
                    for (const [matId, requiredAmount] of Object.entries(anomaly.materialsRequired)) {
                        updatedInventory[matId] = Math.max(0, (updatedInventory[matId] || 0) - requiredAmount);
                    }
                }

                // Produz subproduto anômalo
                const currentOutput = updatedInventory[anomaly.outputItemId] || 0;
                updatedInventory[anomaly.outputItemId] = currentOutput + anomaly.outputRate;

                // Recuperação de estabilidade
                const recovery = (hasAssignedHero ? 5 : 2) * deltaSeconds;
                currentStability = Math.min(100, currentStability + recovery);
            } else {
                // Falta de insumos: perda moderada de estabilidade
                const decay = (hasAssignedHero ? 1 : 2.5) * deltaSeconds;
                currentStability = Math.max(0, currentStability - decay);
            }
        }

        // Se a estabilidade zerar e for Euclid ou Keter, engatilha Brecha
        if (currentStability <= 0 && (anomaly.classification === 'Euclid' || anomaly.classification === 'Keter')) {
            if (!isBreached && !activeBreach) {
                isBreached = true;
                activeBreach = {
                    active: true,
                    anomalyId: anomaly.id,
                    timer: 30,
                    maxTimer: 30,
                    penaltyDescription: `Brecha de Contenção de ${anomaly.itemNumber} (${anomaly.name})! Restaure a segurança antes do colapso do setor!`
                };
                logs.push(`🚨 ALARME CÓDIGO VERMELHO: Brecha de Contenção em ${anomaly.itemNumber}!`);
            }
        }

        return {
            ...anomaly,
            stability: Math.round(currentStability * 10) / 10,
            breached: isBreached
        };
    });

    // Processamento do temporizador da Brecha
    if (activeBreach && activeBreach.active) {
        activeBreach.timer = Math.max(0, activeBreach.timer - deltaSeconds);
        if (activeBreach.timer <= 0) {
            // Penalidade por falha na contenção
            logs.push(`💀 O tempo esgotou! A brecha causou estragos nos estoques industriais!`);
            // Perde 20% dos itens industriais aleatórios
            for (const key of Object.keys(updatedInventory)) {
                if (updatedInventory[key] > 5) {
                    updatedInventory[key] = Math.floor(updatedInventory[key] * 0.8);
                }
            }
            // Reseta temporariamente a estabilidade para permitir recuperação
            const breachTargetId = activeBreach.anomalyId;
            const target = updatedAnomalies.find(a => a.id === breachTargetId);
            if (target) {
                target.stability = 30;
                target.breached = false;
            }
            activeBreach = null;
        }
    }

    return {
        updatedState: {
            ...state,
            anomalies: updatedAnomalies,
            activeBreach
        },
        updatedInventory,
        logs
    };
}

/**
 * Transmuta um item no SCP-914 ("The Clockworks").
 * Suporta os 5 mostradores mecânicos clássicos:
 * - Rough: desmonta o item em 150% de matérias-primas brutas.
 * - Coarse: divide o item em componentes mecânicos (engrenagens, placas).
 * - 1:1: troca o item por outro de mesma categoria e raridade.
 * - Fine: aprimora o item com +1 tier de raridade ou circuitos superiores.
 * - Very Fine: 75% chance de criar peça anômala mítica, 25% chance de quebrar em sucata.
 */
export function transmuteWithScp914(
    inputItemId: string,
    mode: Scp914Mode,
    inventory: Record<string, number>,
    rng: () => number = Math.random
): {
    result: Scp914Result;
    updatedInventory: Record<string, number>;
} {
    const updatedInventory = { ...inventory };

    if (!inputItemId || (updatedInventory[inputItemId] || 0) < 1) {
        return {
            result: {
                success: false,
                mode,
                inputItemId,
                message: `❌ Item insuficiente ou inválido no inventário.`
            },
            updatedInventory
        };
    }

    // Consome 1 unidade do item
    updatedInventory[inputItemId] = (updatedInventory[inputItemId] || 0) - 1;

    let outputItemId = '';
    let outputItemName = '';
    let outputAmount = 1;
    let isAnomalousMasterpiece = false;
    let isCatastrophicFailure = false;
    let message = '';

    switch (mode) {
        case 'Rough': {
            // Desmancha em minérios brutos com 150% de rendimento
            outputItemId = 'iron_ore';
            outputItemName = 'Minério de Ferro Bruto';
            outputAmount = 3;
            updatedInventory['iron_ore'] = (updatedInventory['iron_ore'] || 0) + outputAmount;
            updatedInventory['stone'] = (updatedInventory['stone'] || 0) + 2;
            message = `⚙️ SCP-914 [Rough]: O item foi triturado violentamente em minérios básicos (+${outputAmount} Ferro, +2 Pedra).`;
            break;
        }
        case 'Coarse': {
            // Converte em componentes mecânicos intermediários
            outputItemId = 'iron_gear';
            outputItemName = 'Engrenagem de Ferro';
            outputAmount = 2;
            updatedInventory['iron_gear'] = (updatedInventory['iron_gear'] || 0) + outputAmount;
            message = `⚙️ SCP-914 [Coarse]: O maquinário desmontou o item em engrenagens refinadas (+${outputAmount} Engrenagens).`;
            break;
        }
        case '1:1': {
            // Transmuta em item equivalente de mesma utilidade
            const equivalences: Record<string, { id: string; name: string }> = {
                iron_ingot: { id: 'copper_ingot', name: 'Placa de Cobre' },
                copper_ingot: { id: 'iron_ingot', name: 'Placa de Ferro' },
                basic_circuit: { id: 'battery', name: 'Bateria Química' },
                battery: { id: 'basic_circuit', name: 'Circuito Eletrônico' },
                gel_999: { id: 'panacea_pill', name: 'Pílula Panaceia' },
                panacea_pill: { id: 'gel_999', name: 'Gel de Euforia' }
            };

            const eq = equivalences[inputItemId] || { id: 'copper_ingot', name: 'Placa de Cobre' };
            outputItemId = eq.id;
            outputItemName = eq.name;
            outputAmount = 1;
            updatedInventory[outputItemId] = (updatedInventory[outputItemId] || 0) + outputAmount;
            message = `⚙️ SCP-914 [1:1]: Transmutado com equivalência perfeita em ${outputItemName}.`;
            break;
        }
        case 'Fine': {
            // Aprimora para o próximo patamar de qualidade
            const upgrades: Record<string, { id: string; name: string }> = {
                iron_ingot: { id: 'steel_plate', name: 'Placa de Aço' },
                basic_circuit: { id: 'advanced_circuit', name: 'Circuito Avançado' },
                advanced_circuit: { id: 'processing_unit', name: 'Unidade de Processamento' },
                steel_plate: { id: 'advanced_circuit', name: 'Circuito Avançado' }
            };

            const upg = upgrades[inputItemId] || { id: 'steel_plate', name: 'Placa de Aço Reforçada' };
            outputItemId = upg.id;
            outputItemName = upg.name;
            outputAmount = 1;
            updatedInventory[outputItemId] = (updatedInventory[outputItemId] || 0) + outputAmount;
            message = `⚙️ SCP-914 [Fine]: O item foi enriquecido atomicamente, evoluindo para ${outputItemName}!`;
            break;
        }
        case 'Very Fine': {
            // Alto risco e recompensa anômala cósmica
            const roll = rng();
            if (roll >= 0.25) {
                // Sucesso lendário anômalo
                outputItemId = 'quantum_processor';
                outputItemName = 'Núcleo Quântico Anômalo';
                outputAmount = 2;
                isAnomalousMasterpiece = true;
                updatedInventory[outputItemId] = (updatedInventory[outputItemId] || 0) + outputAmount;
                message = `🌟 SCP-914 [Very Fine]: SUCESSO CRÍTICO ANÔMALO! O mecanismo forjou um ${outputItemName}!`;
            } else {
                // Falha catastrófica
                outputItemId = 'scrap';
                outputItemName = 'Resíduo Destruído';
                outputAmount = 1;
                isCatastrophicFailure = true;
                updatedInventory['scrap'] = (updatedInventory['scrap'] || 0) + outputAmount;
                message = `💥 SCP-914 [Very Fine]: O teste desestabilizou o objeto, restando apenas sucata residual.`;
            }
            break;
        }
    }

    return {
        result: {
            success: true,
            mode,
            inputItemId,
            outputItemId,
            outputItemName,
            outputAmount,
            message,
            isAnomalousMasterpiece,
            isCatastrophicFailure
        },
        updatedInventory
    };
}

/**
 * Resolve taticamente uma Brecha de Contenção de anomalia no Sítio-19.
 * Métodos disponíveis:
 * - 'blast_doors': Gasta 20 placas de aço para selar as comportas blindadas.
 * - 'mtf_strike': Destaca o poder do grupo de heróis para conter a criatura.
 * - 'sedative': Gasta compostos químicos ou ácido para sedar a anomalia.
 */
export function resolveContainmentBreach(
    state: ScpFoundationState,
    anomalyId: string,
    method: 'blast_doors' | 'mtf_strike' | 'sedative',
    inventory: Record<string, number>,
    partyPower: number = 1000
): {
    success: boolean;
    updatedState: ScpFoundationState;
    updatedInventory: Record<string, number>;
    message: string;
} {
    if (!state.activeBreach || state.activeBreach.anomalyId !== anomalyId) {
        return {
            success: false,
            updatedState: state,
            updatedInventory: inventory,
            message: 'Nenhuma brecha ativa encontrada para esta anomalia.'
        };
    }

    const updatedInventory = { ...inventory };
    let success = false;
    let message = '';

    if (method === 'blast_doors') {
        const requiredSteel = 15;
        if ((updatedInventory['steel_plate'] || 0) >= requiredSteel) {
            updatedInventory['steel_plate'] -= requiredSteel;
            success = true;
            message = `🛡️ Comportas Pneumáticas seladas com sucesso (-${requiredSteel} Placas de Aço). O setor está seguro!`;
        } else {
            return {
                success: false,
                updatedState: state,
                updatedInventory: inventory,
                message: `❌ Aço insuficiente! Requer ${requiredSteel} Placas de Aço para selar as comportas.`
            };
        }
    } else if (method === 'mtf_strike') {
        if (partyPower >= 800) {
            success = true;
            message = `🪖 Esquadrão MTF mobilizado com poder de combate ${partyPower}! A anomalia foi suprimida e reconduzida à câmara!`;
        } else {
            return {
                success: false,
                updatedState: state,
                updatedInventory: inventory,
                message: `❌ Poder de combate insuficiente (${partyPower}/800) para conter a criatura à força!`
            };
        }
    } else if (method === 'sedative') {
        const requiredAcid = 5;
        if ((updatedInventory['sulfuric_acid'] || 0) >= requiredAcid) {
            updatedInventory['sulfuric_acid'] -= requiredAcid;
            success = true;
            message = `🧪 Sedativo Químico injetado com sucesso (-${requiredAcid} Ácido Sulfúrico). A anomalia adormeceu!`;
        } else {
            return {
                success: false,
                updatedState: state,
                updatedInventory: inventory,
                message: `❌ Químicos insuficientes! Requer ${requiredAcid} Ácido Sulfúrico para a fórmula sedativa.`
            };
        }
    }

    if (success) {
        const updatedAnomalies = state.anomalies.map(a => {
            if (a.id === anomalyId) {
                return {
                    ...a,
                    stability: 75,
                    breached: false
                };
            }
            return a;
        });

        return {
            success: true,
            updatedState: {
                ...state,
                anomalies: updatedAnomalies,
                activeBreach: null
            },
            updatedInventory,
            message
        };
    }

    return {
        success: false,
        updatedState: state,
        updatedInventory: inventory,
        message: 'Falha ao conter a anomalia.'
    };
}

/**
 * Calcula os bônus passivos consolidados de todas as anomalias estavelmente contidas.
 */
export function calculateScpPassiveBuffs(anomalies: ScpAnomaly[]): {
    attackSpeedBonus: number;
    defenseBonus: number;
    lifestealBonus: number;
    siegeDamageBonus: number;
} {
    let attackSpeedBonus = 0;
    let defenseBonus = 0;
    let lifestealBonus = 0;
    let siegeDamageBonus = 0;

    for (const anom of anomalies) {
        if (anom.active && !anom.breached && anom.stability > 20) {
            if (anom.id === 'scp_999') attackSpeedBonus += 0.15;
            if (anom.id === 'scp_173') defenseBonus += 0.20;
            if (anom.id === 'scp_049') lifestealBonus += 0.15;
            if (anom.id === 'scp_682') siegeDamageBonus += 0.30;
        }
    }

    return {
        attackSpeedBonus,
        defenseBonus,
        lifestealBonus,
        siegeDamageBonus
    };
}
