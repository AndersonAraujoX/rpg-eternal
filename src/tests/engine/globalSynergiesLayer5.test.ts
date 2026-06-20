/**
 * globalSynergiesLayer5.test.ts
 * Testes unitários para a 5ª Camada de Sinergias Globais
 *
 * Cobertos:
 *   L5-1: Solo Corrompido pelo Vazio (Void ⇄ Jardim/Pesca)
 *   L5-2: Frequência Rúnica Estelar (Runas ⇄ Automação Starlight)
 *   L5-3: Constelações Sagradas (Pantheon ⇄ StarChart)
 *   L5-4: Economia de Guerra (World Boss ⇄ Mercado)
 */
import { describe, it, expect } from 'vitest';
import {
    calculateGlobalModifiers,
    VOID_OVERGROWTH_COST,
    type ModifiersState,
} from '../../engine/modifiersManager';

// ─── Fábrica de estado mínimo ─────────────────────────────────────────────────
const baseState = (): ModifiersState => ({
    heroes: [],
    activeSynergies: [],
    buildings: [],
    items: [],
});

// ═════════════════════════════════════════════════════════════════════════════
// L5-1: Solo Corrompido pelo Vazio (Void Overgrowth)
// ═════════════════════════════════════════════════════════════════════════════
describe('L5-1: Void Overgrowth (Void ⇄ Jardim/Pesca)', () => {
    it('gardenMaturationMult deve ser 1.0 por padrão (sem overgrowth)', () => {
        const mods = calculateGlobalModifiers(baseState());
        expect(mods.layer5.gardenMaturationMult).toBe(1.0);
    });

    it('voidHarvestRuneFragments e voidHarvestRareMinerals devem ser false por padrão', () => {
        const mods = calculateGlobalModifiers(baseState());
        expect(mods.layer5.voidHarvestRuneFragments).toBe(false);
        expect(mods.layer5.voidHarvestRareMinerals).toBe(false);
    });

    it('quando voidOvergrowthActive=true: gardenMaturationMult=2.0 e drops garantidos', () => {
        const state: ModifiersState = {
            ...baseState(),
            voidOvergrowthActive: true,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.gardenMaturationMult).toBe(2.0);
        expect(mods.layer5.voidHarvestRuneFragments).toBe(true);
        expect(mods.layer5.voidHarvestRareMinerals).toBe(true);
    });

    it('deve incluir void_overgrowth_jardim nos activeSynergyIds quando ativo', () => {
        const state: ModifiersState = {
            ...baseState(),
            voidOvergrowthActive: true,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.activeSynergyIds).toContain('void_overgrowth_jardim');
    });

    it('deve incluir void_overgrowth_disponivel quando voidMatter >= VOID_OVERGROWTH_COST mas não ativo', () => {
        const state: ModifiersState = {
            ...baseState(),
            voidMatter: VOID_OVERGROWTH_COST,
            voidOvergrowthActive: false,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.activeSynergyIds).toContain('void_overgrowth_disponivel');
    });

    it('void insuficiente e não ativo: nenhum ID de sinergia void', () => {
        const state: ModifiersState = {
            ...baseState(),
            voidMatter: VOID_OVERGROWTH_COST - 1,
            voidOvergrowthActive: false,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.activeSynergyIds).not.toContain('void_overgrowth_jardim');
        expect(mods.activeSynergyIds).not.toContain('void_overgrowth_disponivel');
    });

    it('VOID_OVERGROWTH_COST deve ser 50', () => {
        expect(VOID_OVERGROWTH_COST).toBe(50);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// L5-2: Frequência Rúnica Estelar (Runas ⇄ Automação Starlight)
// ═════════════════════════════════════════════════════════════════════════════
describe('L5-2: Frequência Rúnica Estelar (Runas ⇄ Starlight)', () => {
    it('starlightBotRechargeBoost deve ser 0 sem runas', () => {
        const mods = calculateGlobalModifiers(baseState());
        expect(mods.layer5.starlightBotRechargeBoost).toBe(0);
    });

    it('runas comuns não devem contribuir ao boost', () => {
        const state: ModifiersState = {
            ...baseState(),
            runes: [
                { rarity: 'common' },
                { rarity: 'rare' },
                { rarity: 'epic' },
            ],
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.starlightBotRechargeBoost).toBe(0);
    });

    it('cada runa lendária deve contribuir +2% ao boost', () => {
        const state: ModifiersState = {
            ...baseState(),
            runes: [
                { rarity: 'legendary' },
                { rarity: 'legendary' },
                { rarity: 'common' },
            ],
        };
        const mods = calculateGlobalModifiers(state);
        // 2 lendárias × 0.02 = 0.04
        expect(mods.layer5.starlightBotRechargeBoost).toBeCloseTo(0.04, 5);
    });

    it('boost não deve ultrapassar 50% com muitas runas lendárias', () => {
        const state: ModifiersState = {
            ...baseState(),
            runes: Array(30).fill({ rarity: 'legendary' }), // 30 × 0.02 = 0.6 → cap 0.5
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.starlightBotRechargeBoost).toBe(0.5);
    });

    it('deve incluir frequencia_runica_estelar nos activeSynergyIds com 1+ runas lendárias', () => {
        const state: ModifiersState = {
            ...baseState(),
            runes: [{ rarity: 'legendary' }],
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.activeSynergyIds).toContain('frequencia_runica_estelar');
    });

    it('não deve incluir frequencia_runica_estelar sem runas lendárias', () => {
        const state: ModifiersState = {
            ...baseState(),
            runes: [{ rarity: 'epic' }, { rarity: 'rare' }],
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.activeSynergyIds).not.toContain('frequencia_runica_estelar');
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// L5-3: Constelações Sagradas (Pantheon ⇄ StarChart)
// ═════════════════════════════════════════════════════════════════════════════
describe('L5-3: Constelações Sagradas (Pantheon ⇄ StarChart)', () => {
    it('sacredConstellationUnlocked deve ser false sem patronDeity', () => {
        const state: ModifiersState = {
            ...baseState(),
            deityFavor: 100,
            patronDeity: null,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.sacredConstellationUnlocked).toBe(false);
    });

    it('sacredConstellationUnlocked deve ser false com patronDeity mas favor < 100', () => {
        const state: ModifiersState = {
            ...baseState(),
            deityFavor: 99,
            patronDeity: 'sol',
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.sacredConstellationUnlocked).toBe(false);
    });

    it('sacredConstellationUnlocked deve ser true com patronDeity E deityFavor >= 100', () => {
        const state: ModifiersState = {
            ...baseState(),
            deityFavor: 100,
            patronDeity: 'sol',
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.sacredConstellationUnlocked).toBe(true);
    });

    it('elementalComboDamageMult deve ser 2.0 quando constelação sagrada desbloqueada', () => {
        const state: ModifiersState = {
            ...baseState(),
            deityFavor: 100,
            patronDeity: 'luna',
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.elementalComboDamageMult).toBe(2.0);
    });

    it('elementalComboDamageMult deve ser 1.0 quando constelação não desbloqueada', () => {
        const mods = calculateGlobalModifiers(baseState());
        expect(mods.layer5.elementalComboDamageMult).toBe(1.0);
    });

    it('deve incluir constelacoes_sagradas nos activeSynergyIds quando ativo', () => {
        const state: ModifiersState = {
            ...baseState(),
            deityFavor: 100,
            patronDeity: 'sol',
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.activeSynergyIds).toContain('constelacoes_sagradas');
    });

    it('deityFavor > 100 também deve desbloquear a constelação sagrada', () => {
        const state: ModifiersState = {
            ...baseState(),
            deityFavor: 200,
            patronDeity: 'titan',
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.layer5.sacredConstellationUnlocked).toBe(true);
        expect(mods.layer5.elementalComboDamageMult).toBe(2.0);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// L5-4: Economia de Guerra (World Boss ⇄ Mercado)
// ═════════════════════════════════════════════════════════════════════════════
describe('L5-4: Economia de Guerra (World Boss ⇄ Mercado)', () => {
    it('warEconomyPriceMultiplier deve ser 1.0 sem boss ativo', () => {
        const mods = calculateGlobalModifiers(baseState());
        expect(mods.market.warEconomyPriceMultiplier).toBe(1.0);
    });

    it('warEconomyPriceMultiplier deve ser 3.0 quando World Boss está vivo', () => {
        const state: ModifiersState = {
            ...baseState(),
            isWorldBossAlive: true,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.market.warEconomyPriceMultiplier).toBe(3.0);
    });

    it('warEconomyPriceMultiplier deve ser 1.0 quando boss morto (isWorldBossAlive=false)', () => {
        const state: ModifiersState = {
            ...baseState(),
            isWorldBossAlive: false,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.market.warEconomyPriceMultiplier).toBe(1.0);
    });

    it('deve incluir economia_de_guerra nos activeSynergyIds quando boss ativo', () => {
        const state: ModifiersState = {
            ...baseState(),
            isWorldBossAlive: true,
        };
        const mods = calculateGlobalModifiers(state);
        expect(mods.activeSynergyIds).toContain('economia_de_guerra');
    });

    it('não deve incluir economia_de_guerra nos activeSynergyIds sem boss ativo', () => {
        const mods = calculateGlobalModifiers(baseState());
        expect(mods.activeSynergyIds).not.toContain('economia_de_guerra');
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Integração: Todas as 4 sinergias ativas simultaneamente
// ═════════════════════════════════════════════════════════════════════════════
describe('Integração: Todas as 4 sinergias da L5 ativas simultaneamente', () => {
    it('deve retornar todos os modificadores ativos corretamente', () => {
        const state: ModifiersState = {
            ...baseState(),
            voidOvergrowthActive: true,
            runes: [{ rarity: 'legendary' }, { rarity: 'legendary' }],
            patronDeity: 'sol',
            deityFavor: 100,
            isWorldBossAlive: true,
        };

        const mods = calculateGlobalModifiers(state);

        // L5-1
        expect(mods.layer5.gardenMaturationMult).toBe(2.0);
        expect(mods.layer5.voidHarvestRuneFragments).toBe(true);
        expect(mods.layer5.voidHarvestRareMinerals).toBe(true);

        // L5-2
        expect(mods.layer5.starlightBotRechargeBoost).toBeCloseTo(0.04, 5);

        // L5-3
        expect(mods.layer5.sacredConstellationUnlocked).toBe(true);
        expect(mods.layer5.elementalComboDamageMult).toBe(2.0);

        // L5-4
        expect(mods.market.warEconomyPriceMultiplier).toBe(3.0);

        // IDs de sinergias presentes
        expect(mods.activeSynergyIds).toContain('void_overgrowth_jardim');
        expect(mods.activeSynergyIds).toContain('frequencia_runica_estelar');
        expect(mods.activeSynergyIds).toContain('constelacoes_sagradas');
        expect(mods.activeSynergyIds).toContain('economia_de_guerra');
    });

    it('layer5 deve existir mesmo quando nenhuma sinergia L5 está ativa', () => {
        const mods = calculateGlobalModifiers(baseState());
        expect(mods.layer5).toBeDefined();
        expect(mods.layer5.gardenMaturationMult).toBe(1.0);
        expect(mods.layer5.voidHarvestRuneFragments).toBe(false);
        expect(mods.layer5.voidHarvestRareMinerals).toBe(false);
        expect(mods.layer5.starlightBotRechargeBoost).toBe(0);
        expect(mods.layer5.sacredConstellationUnlocked).toBe(false);
        expect(mods.layer5.elementalComboDamageMult).toBe(1.0);
        expect(mods.market.warEconomyPriceMultiplier).toBe(1.0);
    });
});
