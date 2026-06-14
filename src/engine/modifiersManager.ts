/**
 * modifiersManager.ts
 * Sistema Centralizado de Modificadores Globais — "Sinergias Transversais"
 *
 * Este módulo agrega condições de múltiplos sub-sistemas do jogo e retorna
 * um objeto estruturado de multiplicadores que pode ser injetado no loop
 * principal de ticks, na Forja, no modal offline e na automação Starlight.
 */

import type { Hero, Building, Item } from './types';
import type { Synergy } from './synergies';
import { calculateBackroomsTechnology, type BackroomsTechModifiers } from './backroomsTechnology';

// ─────────────────────────────────────────────
// Tipos Públicos
// ─────────────────────────────────────────────

/**
 * Estado necessário para o cálculo dos modificadores globais.
 * Todos os campos são opcionais para facilitar a montagem parcial do estado.
 */
export interface ModifiersState {
    /** Heróis do jogador */
    heroes: Hero[];
    /** Sinergias ativas na formação de combate */
    activeSynergies: Synergy[];
    /** Prédios construídos na Vila */
    buildings: Building[];
    /** Inventário de itens (inclui peixes raros) */
    items: Item[];
    /** Fragmentos de Fenda acumulados (para sistemas passivos) */
    riftFragments?: number;
    /** Andar máximo atingido nas Fendas Roguelike */
    highestRiftFloor?: number;
    /** Timestamp até o qual o buff "Sorte do Conquistador" está ativo (ms, Date.now()) */
    diceLuckUntil?: number;
    /** Quantidade de Poeira Cósmica acumulada pelo combate */
    cosmicDust?: number;
    /** Quantidade de peixe raro no inventário (calculado internamente se não fornecido) */
    rareFishCount?: number;
    /** Inventário do sistema industrial */
    industryInventory?: Record<string, number>;
    /** Upgrades comprados no painel Starlight */
    starlightUpgrades?: Record<string, number>;
    /** Flag para o buff de DungeonFirstTick */
    dungeonFirstTickBuff?: boolean;
    /** Nível atual das Backrooms (1 a 100) */
    backroomsFloor?: number;
    /** Se o recurso Backrooms está desbloqueado */
    isBackroomsUnlocked?: boolean;
}

/**
 * Objeto de retorno do cálculo de modificadores globais.
 * Todos os valores são MULTIPLICADORES (1.0 = sem bônus).
 */
export interface GlobalModifiers {
    combat: {
        /** Multiplicador de Dano Crítico para heróis de água (Sinergia 1) */
        waterHeroCritDamageBonus: number;
        /** Flag se o buff de primeiro tick da dungeon está ativo (Sinergia 2) */
        dungeonFirstTickBonus: boolean;
    };
    crafting: {
        /** Bônus aditivo de taxa de sucesso na Forja / fusão de Runas (Sinergia 2) */
        forgeSuccessRateBonus: number;
        /** Multiplicador de velocidade de bots Starlight via Poeira Cósmica (Sinergia 4) */
        starlightBotSpeedMult: number;
        /** Capacidade offline de bots Starlight (Sinergia 3) */
        starlightOfflineCapacityBonus: number;
    };
    offline: {
        /** Fragmentos de Fenda gerados por hora de offline (Sinergia 3) */
        riftFragmentsPerHour: number;
    };
    collection: {
        /** Peixes normais por hora pescados passivamente (Sinergia 1) */
        passiveFishPerHour: number;
        /** Multiplicador de velocidade de crescimento do Jardim (Sinergia 1) */
        gardenSpeedMult: number;
        /** Chance aditiva para pescar peixe lendário */
        fishingLendaryChance: number;
    };
    market: {
        /** Bônus de preço de venda de minérios brutos (Sinergia 4) */
        metalOrePriceBonus: number;
    };
    /** Metadados de diagnóstico (quais sinergias estão ativas) */
    activeSynergyIds: string[];
    /** Escalares contínuos das Backrooms */
    backroomsScalars: {
        globalElementalDamage: number;
        industrialSpeed: number;
        offlineGoldBonus: number;
    };
}

// ─────────────────────────────────────────────
// Constantes de Balanceamento
// ─────────────────────────────────────────────

/** Nível mínimo da Doca de Pesca para ativar a Sinergia 1 */
const FISHING_DOCK_MIN_LEVEL = 1; // Nível >= 1 (desbloqueado)
/** Crit Damage por peixe raro no inventário (ex: 0.01 = +1%) */
const RARE_FISH_CRIT_DMG_PER_FISH = 0.01;
/** Bônus máximo de Crit Damage via peixes raros */
const MAX_RARE_FISH_CRIT_DMG_BONUS = 0.5; // +50% máximo

/** Duração do buff de Sorte do Conquistador em ms */
export const DICE_LUCK_BUFF_DURATION_MS = 5 * 60 * 1000; // 5 minutos
/** Bônus aditivo de taxa de sucesso de forja quando o buff está ativo */
const DICE_LUCK_FORGE_SUCCESS_BONUS = 0.10; // +10%

/** Fragmentos de Fenda por hora por andar máximo atingido */
const RIFT_FRAGMENTS_PER_FLOOR_PER_HOUR = 0.5;
/** Limite máximo de fragmentos por hora (anti-exploração) */
const MAX_RIFT_FRAGMENTS_PER_HOUR = 100;

/** Poeira Cósmica gerada por tick de reação bem-sucedido */
export const COSMIC_DUST_PER_REACTION_TICK = 1;
/** Consumo de Poeira Cósmica por tick para acelerar bots Starlight */
const COSMIC_DUST_PER_BOT_SPEED_TICK = 10;
/** Multiplicador de velocidade de bot por "lote" de Poeira Cósmica consumida */
const BOT_SPEED_PER_DUST_BATCH = 0.05; // +5% por lote

// ─────────────────────────────────────────────
// Helpers Internos
// ─────────────────────────────────────────────

/** Conta peixes raros no inventário (raridade 'rare' ou superior, tipo 'material') */
function countRareFishInInventory(items: Item[]): number {
    return items.filter(item =>
        item.type === 'material' &&
        (item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'mythic' || item.rarity === 'divine') &&
        (item.name?.toLowerCase().includes('fish') || item.id?.toLowerCase().includes('fish') || item.name?.toLowerCase().includes('peix'))
    ).length;
}

/** Verifica se a Doca de Pesca está desbloqueada (nível >= mínimo) */
function isFishingDockUnlocked(buildings: Building[]): boolean {
    const dock = buildings.find(b => b.id === 'fishing_dock');
    return !!dock && dock.level >= FISHING_DOCK_MIN_LEVEL;
}

/** Verifica se a Hydro Resonance está ativa nas sinergias de combate */
function isHydroResonanceActive(synergies: Synergy[]): boolean {
    return synergies.some(s => s.id === 'resonance_hydro' && s.isActive);
}

/** Verifica se o buff de Sorte do Conquistador ainda está válido */
function isDiceLuckBuffActive(diceLuckUntil?: number): boolean {
    if (!diceLuckUntil) return false;
    return Date.now() < diceLuckUntil;
}

/** Calcula o multiplicador de velocidade de bots com base na Poeira Cósmica disponível */
function calcBotSpeedFromDust(cosmicDust: number): number {
    if (cosmicDust <= 0) return 1.0;
    // Consumimos em "lotes" de COSMIC_DUST_PER_BOT_SPEED_TICK
    const batches = Math.floor(cosmicDust / COSMIC_DUST_PER_BOT_SPEED_TICK);
    return 1.0 + batches * BOT_SPEED_PER_DUST_BATCH;
}

// ─────────────────────────────────────────────
// Função Principal
// ─────────────────────────────────────────────

/**
 * Calcula todos os modificadores globais transversais a partir do estado fornecido.
 */
export function calculateGlobalModifiers(state: ModifiersState): GlobalModifiers {
    const {
        activeSynergies,
        buildings,
        items,
        highestRiftFloor = 0,
        diceLuckUntil,
        cosmicDust = 0,
        rareFishCount: providedRareFishCount,
        industryInventory = {},
        starlightUpgrades = {},
        dungeonFirstTickBuff = false,
        backroomsFloor = 1,
        isBackroomsUnlocked = false
    } = state;

    const activeIds: string[] = [];

    // Calcular scalars e milestones das Backrooms
    const tech = calculateBackroomsTechnology(backroomsFloor, isBackroomsUnlocked);

    // ── Sinergia 1: Resonância Arquitetônica (Vila ⇄ Combate) ──────────────
    // Condição: Doca de Pesca desbloqueada + Hydro Resonance ativa no combate
    // Efeito: +X% Crit Damage para heróis de água baseado em peixes raros no inv.
    let waterHeroCritDamageBonus = 0;
    const dockUnlocked = isFishingDockUnlocked(buildings);
    const hydroActive = isHydroResonanceActive(activeSynergies);

    if (dockUnlocked && hydroActive) {
        const rareFishCount = providedRareFishCount ?? countRareFishInInventory(items);
        waterHeroCritDamageBonus = Math.min(
            rareFishCount * RARE_FISH_CRIT_DMG_PER_FISH,
            MAX_RARE_FISH_CRIT_DMG_BONUS
        );
        if (waterHeroCritDamageBonus > 0) {
            activeIds.push('resonancia_arquitetonica');
        }
    }

    // ── Sinergia 2: Sorte do Conquistador (Dados ⇄ Forja/Runas) ───────────
    // Condição: Buff temporário de vitória no jogo de dados ainda válido
    // Efeito: +10% de taxa de sucesso base na Forja e fusão de Runas
    let forgeSuccessRateBonus = 0;
    if (isDiceLuckBuffActive(diceLuckUntil)) {
        forgeSuccessRateBonus = DICE_LUCK_FORGE_SUCCESS_BONUS;
        activeIds.push('sorte_do_conquistador');
    }
    // Compactador de Sucata de Aço dá +10% chance de sucesso na Forja
    if (industryInventory['scrap_press'] >= 1) {
        forgeSuccessRateBonus += 0.10;
        activeIds.push('compactador_sucata_forja');
    }

    // ── Sinergia 3: Eficiência de Retorno Idle (Rifts ⇄ OfflineModal) ─────
    // Condição: Jogador atingiu andar > 0 nas fendas
    // Efeito: Fragmentos de Fenda gerados passivamente por hora de offline
    let riftFragmentsPerHour = 0;
    if (highestRiftFloor > 0) {
        riftFragmentsPerHour = Math.min(
            highestRiftFloor * RIFT_FRAGMENTS_PER_FLOOR_PER_HOUR,
            MAX_RIFT_FRAGMENTS_PER_HOUR
        );
        activeIds.push('eficiencia_retorno_idle');
    }

    // ── Sinergia 4: Combustível Residual (Combate ⇄ Automação Starlight) ──
    // Condição: Poeira Cósmica acumulada por reações de combate
    // Efeito: Aceleração dos bots de automação Starlight
    let starlightBotSpeedMult = 1.0;
    if (cosmicDust > 0) {
        starlightBotSpeedMult = calcBotSpeedFromDust(cosmicDust);
        activeIds.push('combustivel_residual');
    }

    // ── Sinergia Industrial 1: Maquinário de Coleta Hidropônica ────────────
    const automatedDredges = industryInventory['automated_dredge'] || 0;
    const passiveFishPerHour = automatedDredges * 5;
    if (passiveFishPerHour > 0) {
        activeIds.push('maquinario_coleta_hidroponica_dredge');
    }

    const hydroponicIrrigation = industryInventory['hydroponic_irrigation'] || 0;
    // Condensador Alquímico (almond_condenser) dá +20% velocidade no Jardim (multiplicador acumulativo)
    let gardenSpeedBonus = 1.0;
    if (hydroponicIrrigation > 0) {
        gardenSpeedBonus += 0.25;
        activeIds.push('maquinario_coleta_hidroponica_irrigation');
    }
    if (industryInventory['almond_condenser'] >= 1) {
        gardenSpeedBonus *= 1.20;
        activeIds.push('condensador_alquimico_jardim');
    }
    const gardenSpeedMult = gardenSpeedBonus;

    // ── Sinergia Industrial 2: Carga Bélica Sobrecarregada ────────────────
    const dungeonFirstTickBonus = dungeonFirstTickBuff;
    if (dungeonFirstTickBonus) {
        activeIds.push('carga_belica_sobrecarregada');
    }

    // ── Sinergia Industrial 3: Peças de Hardware Avançado ───────────────
    const hasOfflineUpgrade = (starlightUpgrades['bot_offline_capacity'] || 0) > 0;
    let offlineCapacityBonus = 1.0;
    if (hasOfflineUpgrade) {
        offlineCapacityBonus += 0.25;
        activeIds.push('pecas_hardware_avancado');
    }
    // Painel Receptor Estelar (stellar_receptor) dá +25% de capacidade offline dos bots
    if (industryInventory['stellar_receptor'] >= 1) {
        offlineCapacityBonus += 0.25;
        activeIds.push('receptor_estelar_offline_capacity');
    }
    const starlightOfflineCapacityBonus = offlineCapacityBonus;

    // ── Sinergia Industrial 4: Monopólio Industrial ───────────────────────
    const magneticCoils = industryInventory['magnetic_coil'] || 0;
    const metalOrePriceBonus = magneticCoils >= 1000 ? 1.5 : 1.0;
    if (magneticCoils >= 1000) {
        activeIds.push('monopolio_industrial');
    }

    // Adicionar IDs de conquistas de marcos de tecnologia das Backrooms
    if (isBackroomsUnlocked) {
        if (backroomsFloor >= 2) activeIds.push('sifao_criogenico_ativo');
        if (backroomsFloor >= 10) activeIds.push('isca_criogenica_almond');
        if (backroomsFloor >= 18) activeIds.push('estandarte_combate_meg');
        if (backroomsFloor >= 30) activeIds.push('injetor_ocultamento_quantico');
        if (backroomsFloor >= 38) activeIds.push('sobrecarga_pulso_cinetico');
        if (backroomsFloor >= 45) activeIds.push('gerador_escudo_gvg');
        if (backroomsFloor >= 55) activeIds.push('acelerador_temporal_realidade');
        if (backroomsFloor >= 65) activeIds.push('sorte_estabilizada_dados');
        if (backroomsFloor >= 72) activeIds.push('drones_cerco_gvg');
        if (backroomsFloor >= 85) activeIds.push('supercompressor_materia_escura');
        if (backroomsFloor >= 92) activeIds.push('solo_hipercorrompido_vazio');
        if (backroomsFloor >= 100) activeIds.push('protocolo_comando_titans');
    }

    return {
        combat: {
            waterHeroCritDamageBonus,
            dungeonFirstTickBonus,
        },
        crafting: {
            forgeSuccessRateBonus,
            starlightBotSpeedMult,
            starlightOfflineCapacityBonus,
        },
        offline: {
            riftFragmentsPerHour,
        },
        collection: {
            passiveFishPerHour,
            gardenSpeedMult,
            fishingLendaryChance: tech.modifiers.fishingLendaryChance,
        },
        market: {
            metalOrePriceBonus,
        },
        activeSynergyIds: activeIds,
        backroomsScalars: tech.scalars
    };
}
/**
 * Calcula quantos Fragmentos de Fenda o jogador deve receber após um período offline.
 *
 * @param highestRiftFloor - Andar máximo atingido nas fendas
 * @param secondsOffline - Tempo offline em segundos
 * @returns Número inteiro de fragmentos gerados
 */
export function calcOfflineRiftFragments(highestRiftFloor: number, secondsOffline: number): number {
    if (highestRiftFloor <= 0 || secondsOffline <= 0) return 0;
    const hoursOffline = secondsOffline / 3600;
    const fragmentsPerHour = Math.min(
        highestRiftFloor * RIFT_FRAGMENTS_PER_FLOOR_PER_HOUR,
        MAX_RIFT_FRAGMENTS_PER_HOUR
    );
    return Math.floor(fragmentsPerHour * hoursOffline);
}

/**
 * Consome Poeira Cósmica e retorna quanto resta após processar um tick de automação.
 * A quantidade consumida acelera os bots Starlight proporcionalmente.
 *
 * @param currentDust - Poeira Cósmica atual
 * @returns { remainingDust, speedMult } - Poeira restante e multiplicador resultante
 */
export function consumeCosmicDustForTick(currentDust: number): {
    remainingDust: number;
    speedMult: number;
} {
    if (currentDust <= 0) return { remainingDust: 0, speedMult: 1.0 };

    const toConsume = Math.min(currentDust, COSMIC_DUST_PER_BOT_SPEED_TICK);
    const remaining = currentDust - toConsume;
    const batches = Math.floor(currentDust / COSMIC_DUST_PER_BOT_SPEED_TICK);
    const speedMult = 1.0 + batches * BOT_SPEED_PER_DUST_BATCH;

    return { remainingDust: remaining, speedMult };
}
