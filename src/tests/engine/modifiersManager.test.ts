/**
 * modifiersManager.test.ts
 * Testes unitários para o sistema centralizado de modificadores globais.
 * Cobre as 4 sinergias transversais: Resonância Arquitetônica, Sorte do Conquistador,
 * Eficiência de Retorno Idle e Combustível Residual.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    calculateGlobalModifiers,
    calcOfflineRiftFragments,
    consumeCosmicDustForTick,
    DICE_LUCK_BUFF_DURATION_MS,
    COSMIC_DUST_PER_REACTION_TICK,
    type ModifiersState,
} from '../../engine/modifiersManager';
import type { Building, Item } from '../../engine/types';
import type { Synergy } from '../../engine/synergies';

// ─────────────────────────────────────────────
// Helpers de Fixtures
// ─────────────────────────────────────────────

const makeFishingDock = (level: number): Building => ({
    id: 'fishing_dock',
    name: 'Doca de Pesca',
    description: '',
    level,
    maxLevel: 10,
    cost: 2000,
    costScaling: 1,
    bonus: '',
    effectValue: 1,
    currency: 'gold',
    emoji: '⚓',
    width: 1,
    height: 1,
});

const makeHydroResonanceSynergy = (): Synergy => ({
    id: 'resonance_hydro',
    name: 'Hydro Resonance',
    description: '3+ Water Heroes: +20% Vampirism',
    icon: '💧',
    isActive: true,
    type: 'vampirism',
    value: 0.2,
});

const makeRareFishItem = (): Item => ({
    id: 'fish_rare_001',
    name: 'Peixe Raro',
    type: 'material',
    rarity: 'rare',
    value: 100,
    emoji: '🐟',
});

const defaultState = (): ModifiersState => ({
    heroes: [],
    activeSynergies: [],
    buildings: [],
    items: [],
    highestRiftFloor: 0,
    diceLuckUntil: 0,
    cosmicDust: 0,
});

// ─────────────────────────────────────────────
// Testes: Sinergia 1 — Resonância Arquitetônica
// ─────────────────────────────────────────────

describe('Sinergia 1 — Resonância Arquitetônica (Vila ⇄ Combate)', () => {
    it('deve retornar waterHeroCritDamageBonus > 0 quando dock desbloqueado + Hydro Resonance ativa + peixes raros', () => {
        const state = defaultState();
        state.buildings = [makeFishingDock(1)];
        state.activeSynergies = [makeHydroResonanceSynergy()];
        state.rareFishCount = 5;

        const mods = calculateGlobalModifiers(state);
        // 5 peixes * 0.01 = 0.05
        expect(mods.combat.waterHeroCritDamageBonus).toBeCloseTo(0.05);
        expect(mods.activeSynergyIds).toContain('resonancia_arquitetonica');
    });

    it('deve retornar 0 se a Hydro Resonance NÃO estiver ativa', () => {
        const state = defaultState();
        state.buildings = [makeFishingDock(1)];
        state.activeSynergies = []; // sem synergy ativa
        state.rareFishCount = 10;

        const mods = calculateGlobalModifiers(state);
        expect(mods.combat.waterHeroCritDamageBonus).toBe(0);
    });

    it('deve retornar 0 se a Doca de Pesca NÃO estiver desbloqueada (nível 0)', () => {
        const state = defaultState();
        state.buildings = [makeFishingDock(0)]; // nível 0 = não desbloqueado
        state.activeSynergies = [makeHydroResonanceSynergy()];
        state.rareFishCount = 10;

        const mods = calculateGlobalModifiers(state);
        expect(mods.combat.waterHeroCritDamageBonus).toBe(0);
    });

    it('deve respeitar o máximo de +50% de Crit Damage', () => {
        const state = defaultState();
        state.buildings = [makeFishingDock(1)];
        state.activeSynergies = [makeHydroResonanceSynergy()];
        state.rareFishCount = 9999; // muitos peixes

        const mods = calculateGlobalModifiers(state);
        expect(mods.combat.waterHeroCritDamageBonus).toBeLessThanOrEqual(0.5);
    });

    it('deve contar peixes raros do inventário de itens quando rareFishCount não for fornecido', () => {
        const state = defaultState();
        state.buildings = [makeFishingDock(1)];
        state.activeSynergies = [makeHydroResonanceSynergy()];
        state.items = [makeRareFishItem(), makeRareFishItem(), makeRareFishItem()];
        // rareFishCount não fornecido — deve calcular dos items

        const mods = calculateGlobalModifiers(state);
        // 3 peixes raros * 0.01 = 0.03
        expect(mods.combat.waterHeroCritDamageBonus).toBeCloseTo(0.03);
    });
});

// ─────────────────────────────────────────────
// Testes: Sinergia 2 — Sorte do Conquistador
// ─────────────────────────────────────────────

describe('Sinergia 2 — Sorte do Conquistador (Dados ⇄ Forja/Runas)', () => {
    it('deve retornar forgeSuccessRateBonus de 0.10 quando o buff estiver ativo', () => {
        const state = defaultState();
        state.diceLuckUntil = Date.now() + DICE_LUCK_BUFF_DURATION_MS; // futuro

        const mods = calculateGlobalModifiers(state);
        expect(mods.crafting.forgeSuccessRateBonus).toBeCloseTo(0.10);
        expect(mods.activeSynergyIds).toContain('sorte_do_conquistador');
    });

    it('deve retornar 0 quando o buff tiver expirado', () => {
        const state = defaultState();
        state.diceLuckUntil = Date.now() - 1000; // passado

        const mods = calculateGlobalModifiers(state);
        expect(mods.crafting.forgeSuccessRateBonus).toBe(0);
        expect(mods.activeSynergyIds).not.toContain('sorte_do_conquistador');
    });

    it('deve retornar 0 quando diceLuckUntil for 0 ou undefined', () => {
        const state1 = defaultState(); // diceLuckUntil = 0
        const mods1 = calculateGlobalModifiers(state1);
        expect(mods1.crafting.forgeSuccessRateBonus).toBe(0);

        const state2 = { ...defaultState(), diceLuckUntil: undefined };
        const mods2 = calculateGlobalModifiers(state2);
        expect(mods2.crafting.forgeSuccessRateBonus).toBe(0);
    });

    it('DICE_LUCK_BUFF_DURATION_MS deve ser 5 minutos (300000ms)', () => {
        expect(DICE_LUCK_BUFF_DURATION_MS).toBe(5 * 60 * 1000);
    });
});

// ─────────────────────────────────────────────
// Testes: Sinergia 3 — Eficiência de Retorno Idle
// ─────────────────────────────────────────────

describe('Sinergia 3 — Eficiência de Retorno Idle (Rifts ⇄ Offline)', () => {
    it('deve calcular fragmentos proporcionais ao andar e ao tempo offline', () => {
        const floor = 10;
        const hours = 2;
        const seconds = hours * 3600;

        const fragments = calcOfflineRiftFragments(floor, seconds);
        // 10 andares * 0.5 frags/hora * 2 horas = 10 frags
        expect(fragments).toBe(10);
    });

    it('deve retornar 0 se o andar for 0', () => {
        expect(calcOfflineRiftFragments(0, 3600)).toBe(0);
    });

    it('deve retornar 0 se o tempo offline for 0', () => {
        expect(calcOfflineRiftFragments(10, 0)).toBe(0);
    });

    it('deve respeitar o limite máximo de 100 fragmentos por hora', () => {
        const floor = 9999; // andar muito alto
        const seconds = 3600; // 1 hora

        const fragments = calcOfflineRiftFragments(floor, seconds);
        expect(fragments).toBeLessThanOrEqual(100);
    });

    it('deve incluir riftFragmentsPerHour no retorno de calculateGlobalModifiers quando highestRiftFloor > 0', () => {
        const state = defaultState();
        state.highestRiftFloor = 20;

        const mods = calculateGlobalModifiers(state);
        // 20 andares * 0.5 = 10 frags/hora
        expect(mods.offline.riftFragmentsPerHour).toBeCloseTo(10);
        expect(mods.activeSynergyIds).toContain('eficiencia_retorno_idle');
    });

    it('deve retornar 0 fragmentos por hora se highestRiftFloor for 0', () => {
        const state = defaultState();
        state.highestRiftFloor = 0;

        const mods = calculateGlobalModifiers(state);
        expect(mods.offline.riftFragmentsPerHour).toBe(0);
    });
});

// ─────────────────────────────────────────────
// Testes: Sinergia 4 — Combustível Residual
// ─────────────────────────────────────────────

describe('Sinergia 4 — Combustível Residual (Combate ⇄ Starlight)', () => {
    it('deve retornar starlightBotSpeedMult > 1.0 quando houver Poeira Cósmica', () => {
        const state = defaultState();
        state.cosmicDust = 10; // 1 "lote"

        const mods = calculateGlobalModifiers(state);
        expect(mods.crafting.starlightBotSpeedMult).toBeGreaterThan(1.0);
        expect(mods.activeSynergyIds).toContain('combustivel_residual');
    });

    it('deve retornar 1.0 quando cosmicDust for 0', () => {
        const state = defaultState();
        state.cosmicDust = 0;

        const mods = calculateGlobalModifiers(state);
        expect(mods.crafting.starlightBotSpeedMult).toBe(1.0);
    });

    it('consumeCosmicDustForTick deve reduzir a poeira e calcular o speed correto', () => {
        const result = consumeCosmicDustForTick(50);
        expect(result.remainingDust).toBe(40); // consumiu 10
        expect(result.speedMult).toBeGreaterThan(1.0);
    });

    it('consumeCosmicDustForTick com dust = 0 deve retornar 1.0 e 0 restante', () => {
        const result = consumeCosmicDustForTick(0);
        expect(result.remainingDust).toBe(0);
        expect(result.speedMult).toBe(1.0);
    });

    it('COSMIC_DUST_PER_REACTION_TICK deve ser 1', () => {
        expect(COSMIC_DUST_PER_REACTION_TICK).toBe(1);
    });

    it('o multiplicador de velocidade deve escalar com mais poeira cósmica', () => {
        const state10 = defaultState();
        state10.cosmicDust = 10;
        const state50 = defaultState();
        state50.cosmicDust = 50;

        const mods10 = calculateGlobalModifiers(state10);
        const mods50 = calculateGlobalModifiers(state50);

        expect(mods50.crafting.starlightBotSpeedMult).toBeGreaterThan(mods10.crafting.starlightBotSpeedMult);
    });
});

// ─────────────────────────────────────────────
// Testes: Estado Combinado (múltiplas sinergias)
// ─────────────────────────────────────────────

describe('Combinação de múltiplas sinergias ativas', () => {
    it('deve ativar todas as 4 sinergias simultaneamente quando todas as condições forem cumpridas', () => {
        const state: ModifiersState = {
            heroes: [],
            activeSynergies: [makeHydroResonanceSynergy()],
            buildings: [makeFishingDock(1)],
            items: [],
            rareFishCount: 3,
            highestRiftFloor: 15,
            diceLuckUntil: Date.now() + 60000,
            cosmicDust: 30,
        };

        const mods = calculateGlobalModifiers(state);

        expect(mods.combat.waterHeroCritDamageBonus).toBeGreaterThan(0);
        expect(mods.crafting.forgeSuccessRateBonus).toBeGreaterThan(0);
        expect(mods.offline.riftFragmentsPerHour).toBeGreaterThan(0);
        expect(mods.crafting.starlightBotSpeedMult).toBeGreaterThan(1.0);
        expect(mods.activeSynergyIds).toHaveLength(4);
    });

    it('deve retornar objeto de modificadores sem sinergias ativas no estado padrão', () => {
        const state = defaultState();
        const mods = calculateGlobalModifiers(state);

        expect(mods.combat.waterHeroCritDamageBonus).toBe(0);
        expect(mods.crafting.forgeSuccessRateBonus).toBe(0);
        expect(mods.offline.riftFragmentsPerHour).toBe(0);
        expect(mods.crafting.starlightBotSpeedMult).toBe(1.0);
        expect(mods.activeSynergyIds).toHaveLength(0);
    });
});
