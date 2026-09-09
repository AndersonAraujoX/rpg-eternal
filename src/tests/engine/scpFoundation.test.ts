import { describe, it, expect } from 'vitest';
import {
    checkScpUnlockCondition,
    simulateScpTick,
    transmuteWithScp914,
    resolveContainmentBreach,
    calculateScpPassiveBuffs,
    INITIAL_SCP_STATE,
    INITIAL_SCP_ANOMALIES
} from '../../engine/scpFoundation';
import type { ScpFoundationState } from '../../engine/types';

describe('SCP Foundation Site-19 Engine (AAA Pattern)', () => {
    // ═══════════════════════════════════════════════════════════════
    // 1. Condição de Desbloqueio Estrito (checkScpUnlockCondition)
    // ═══════════════════════════════════════════════════════════════
    describe('checkScpUnlockCondition', () => {
        it('deve desbloquear se houver ao menos uma máquina industrial instalada', () => {
            // Arrange
            const industryState = { nodes: [{ id: 'n1', machineId: 'assembler_1' }] };

            // Act
            const isUnlocked = checkScpUnlockCondition(industryState);

            // Assert
            expect(isUnlocked).toBe(true);
        });

        it('deve desbloquear se a pesquisa tech_automation_1 estiver presente', () => {
            // Arrange
            const industryState = { nodes: [], unlockedTechs: ['tech_automation_1'] };

            // Act
            const isUnlocked = checkScpUnlockCondition(industryState);

            // Assert
            expect(isUnlocked).toBe(true);
        });

        it('deve desbloquear se o prédio industrial existir na vila com nível > 0', () => {
            // Arrange
            const industryState = { nodes: [], unlockedTechs: [] };
            const buildings = [{ id: 'industry', level: 1 }];

            // Act
            const isUnlocked = checkScpUnlockCondition(industryState, buildings);

            // Assert
            expect(isUnlocked).toBe(true);
        });

        it('deve permanecer bloqueado se nenhum requisito industrial for atendido', () => {
            // Arrange
            const industryState = { nodes: [], unlockedTechs: [] };
            const buildings = [{ id: 'forge', level: 2 }];
            const floor = 10;

            // Act
            const isUnlocked = checkScpUnlockCondition(industryState, buildings, floor);

            // Assert
            expect(isUnlocked).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 2. Ciclo de Simulação & Produção (simulateScpTick)
    // ═══════════════════════════════════════════════════════════════
    describe('simulateScpTick', () => {
        it('deve gerar subprodutos anômalos e consumir insumos quando houver energia suficiente', () => {
            // Arrange
            const state: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                anomalies: [
                    {
                        ...INITIAL_SCP_ANOMALIES[0], // SCP-999 (Safe, consome coal)
                        active: true,
                        stability: 80
                    }
                ]
            };
            const initialInventory = { coal: 10, gel_999: 0 };
            const powerAvailable = 100;
            const powerConsumed = 50;

            // Act
            const result = simulateScpTick(state, powerAvailable, powerConsumed, initialInventory, [], 1);

            // Assert
            expect(result.updatedInventory['coal']).toBe(8); // Consumiu 2 carvões
            expect(result.updatedInventory['gel_999']).toBe(1); // Produziu 1 gel
            expect(result.updatedState.anomalies[0].stability).toBeGreaterThan(80); // Estabilidade recuperou
        });

        it('deve acelerar a recuperação de estabilidade quando um Herói Oficial MTF estiver alocado', () => {
            // Arrange
            const heroId = 'hero-mtf-1';
            const stateWithHero: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                anomalies: [
                    {
                        ...INITIAL_SCP_ANOMALIES[0],
                        active: true,
                        stability: 50,
                        assignedHeroId: heroId
                    }
                ]
            };
            const heroes = [{ id: heroId, name: 'Comandante Fox' }];
            const inventory = { coal: 20 };

            // Act
            const result = simulateScpTick(stateWithHero, 100, 50, inventory, heroes, 1);

            // Assert (Sem herói recupera +2, com herói recupera +5)
            expect(result.updatedState.anomalies[0].stability).toBe(55);
        });

        it('deve reduzir a estabilidade rapidamente durante apagão elétrico (blackout)', () => {
            // Arrange
            const state: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                anomalies: [
                    {
                        ...INITIAL_SCP_ANOMALIES[2], // SCP-173 (Euclid)
                        active: true,
                        stability: 60
                    }
                ]
            };
            const inventory = { stone: 50 };
            const powerAvailable = 10; // Quase sem energia
            const powerConsumed = 100; // Eficiência de 10%

            // Act
            const result = simulateScpTick(state, powerAvailable, powerConsumed, inventory, [], 1);

            // Assert
            expect(result.updatedState.anomalies[0].stability).toBe(56); // Perdeu 4 de estabilidade
            expect(result.logs.some(l => l.includes('Déficit de Energia'))).toBe(true);
        });

        it('deve disparar Alarme de Brecha de Contenção quando anomalia Euclid/Keter atinge 0% de estabilidade', () => {
            // Arrange
            const state: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                anomalies: [
                    {
                        ...INITIAL_SCP_ANOMALIES[2], // SCP-173
                        active: true,
                        stability: 2 // À beira do colapso
                    }
                ]
            };
            const inventory = {}; // Sem materiais
            const powerAvailable = 0; // Apagão total
            const powerConsumed = 50;

            // Act
            const result = simulateScpTick(state, powerAvailable, powerConsumed, inventory, [], 1);

            // Assert
            expect(result.updatedState.anomalies[0].stability).toBe(0);
            expect(result.updatedState.anomalies[0].breached).toBe(true);
            expect(result.updatedState.activeBreach).not.toBeNull();
            expect(result.updatedState.activeBreach?.anomalyId).toBe('scp_173');
            expect(result.updatedState.activeBreach?.maxTimer).toBe(30);
            expect(result.updatedState.activeBreach?.timer).toBe(29);
        });

        it('não deve mutar estado ou inventário se o modo SCP estiver bloqueado (unlocked: false)', () => {
            // Arrange
            const state: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: false
            };
            const inventory = { coal: 10 };

            // Act
            const result = simulateScpTick(state, 100, 50, inventory);

            // Assert
            expect(result.updatedState.unlocked).toBe(false);
            expect(result.updatedInventory['coal']).toBe(10);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 3. Estação SCP-914 (transmuteWithScp914)
    // ═══════════════════════════════════════════════════════════════
    describe('transmuteWithScp914', () => {
        it('deve desmontar item em matérias-primas no modo Rough', () => {
            // Arrange
            const inventory = { iron_ingot: 2, iron_ore: 0, stone: 0 };

            // Act
            const { result, updatedInventory } = transmuteWithScp914('iron_ingot', 'Rough', inventory);

            // Assert
            expect(result.success).toBe(true);
            expect(result.mode).toBe('Rough');
            expect(updatedInventory['iron_ingot']).toBe(1);
            expect(updatedInventory['iron_ore']).toBe(3);
            expect(updatedInventory['stone']).toBe(2);
        });

        it('deve extrair engrenagens no modo Coarse', () => {
            // Arrange
            const inventory = { iron_ingot: 3, iron_gear: 0 };

            // Act
            const { result, updatedInventory } = transmuteWithScp914('iron_ingot', 'Coarse', inventory);

            // Assert
            expect(result.success).toBe(true);
            expect(updatedInventory['iron_gear']).toBe(2);
        });

        it('deve transmutar em item equivalente no modo 1:1', () => {
            // Arrange
            const inventory = { iron_ingot: 1, copper_ingot: 0 };

            // Act
            const { result, updatedInventory } = transmuteWithScp914('iron_ingot', '1:1', inventory);

            // Assert
            expect(result.success).toBe(true);
            expect(result.outputItemId).toBe('copper_ingot');
            expect(updatedInventory['copper_ingot']).toBe(1);
            expect(updatedInventory['iron_ingot']).toBe(0);
        });

        it('deve aprimorar para o próximo patamar de qualidade no modo Fine', () => {
            // Arrange
            const inventory = { basic_circuit: 1, advanced_circuit: 0 };

            // Act
            const { result, updatedInventory } = transmuteWithScp914('basic_circuit', 'Fine', inventory);

            // Assert
            expect(result.success).toBe(true);
            expect(result.outputItemId).toBe('advanced_circuit');
            expect(updatedInventory['advanced_circuit']).toBe(1);
        });

        it('deve produzir obra-prima anômala no modo Very Fine com sorte favorável', () => {
            // Arrange
            const inventory = { advanced_circuit: 1 };
            const luckyRng = () => 0.85; // Roll >= 0.25 (Sucesso)

            // Act
            const { result, updatedInventory } = transmuteWithScp914('advanced_circuit', 'Very Fine', inventory, luckyRng);

            // Assert
            expect(result.success).toBe(true);
            expect(result.isAnomalousMasterpiece).toBe(true);
            expect(result.outputItemId).toBe('quantum_processor');
            expect(updatedInventory['quantum_processor']).toBe(2);
        });

        it('deve falhar e gerar sucata no modo Very Fine com azar', () => {
            // Arrange
            const inventory = { advanced_circuit: 1 };
            const unluckyRng = () => 0.10; // Roll < 0.25 (Falha)

            // Act
            const { result, updatedInventory } = transmuteWithScp914('advanced_circuit', 'Very Fine', inventory, unluckyRng);

            // Assert
            expect(result.success).toBe(true);
            expect(result.isCatastrophicFailure).toBe(true);
            expect(result.outputItemId).toBe('scrap');
            expect(updatedInventory['scrap']).toBe(1);
        });

        it('deve falhar graciosamente se o jogador não possuir o item escolhido', () => {
            // Arrange
            const emptyInventory = {};

            // Act
            const { result } = transmuteWithScp914('non_existent_item', 'Fine', emptyInventory);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('Item insuficiente');
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 4. Resolução de Brecha de Contenção (resolveContainmentBreach)
    // ═══════════════════════════════════════════════════════════════
    describe('resolveContainmentBreach', () => {
        it('deve selar a brecha via comportas pneumáticas consumindo placas de aço', () => {
            // Arrange
            const state: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                activeBreach: {
                    active: true,
                    anomalyId: 'scp_173',
                    timer: 25,
                    maxTimer: 30,
                    penaltyDescription: 'Alerta'
                }
            };
            const inventory = { steel_plate: 30 };

            // Act
            const res = resolveContainmentBreach(state, 'scp_173', 'blast_doors', inventory);

            // Assert
            expect(res.success).toBe(true);
            expect(res.updatedInventory['steel_plate']).toBe(15);
            expect(res.updatedState.activeBreach).toBeNull();
            expect(res.updatedState.anomalies.find(a => a.id === 'scp_173')?.breached).toBe(false);
        });

        it('deve suprimir a brecha via ataque MTF quando partyPower for suficiente', () => {
            // Arrange
            const state: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                activeBreach: {
                    active: true,
                    anomalyId: 'scp_049',
                    timer: 20,
                    maxTimer: 30,
                    penaltyDescription: 'Alerta'
                }
            };

            // Act
            const res = resolveContainmentBreach(state, 'scp_049', 'mtf_strike', {}, 1200);

            // Assert
            expect(res.success).toBe(true);
            expect(res.updatedState.activeBreach).toBeNull();
        });

        it('deve falhar a supressão MTF se partyPower for insuficiente', () => {
            // Arrange
            const state: ScpFoundationState = {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                activeBreach: {
                    active: true,
                    anomalyId: 'scp_049',
                    timer: 20,
                    maxTimer: 30,
                    penaltyDescription: 'Alerta'
                }
            };

            // Act
            const res = resolveContainmentBreach(state, 'scp_049', 'mtf_strike', {}, 400);

            // Assert
            expect(res.success).toBe(false);
            expect(res.message).toContain('insuficiente');
            expect(res.updatedState.activeBreach).not.toBeNull();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 5. Bônus Passivos Consolidados (calculateScpPassiveBuffs)
    // ═══════════════════════════════════════════════════════════════
    describe('calculateScpPassiveBuffs', () => {
        it('deve somar os bônus passivos apenas de anomalias ativas, contidas e com estabilidade positiva', () => {
            // Arrange
            const anomalies = [
                { ...INITIAL_SCP_ANOMALIES[0], active: true, stability: 90, breached: false }, // SCP-999 (+15% atk speed)
                { ...INITIAL_SCP_ANOMALIES[2], active: true, stability: 80, breached: false }, // SCP-173 (+20% def)
                { ...INITIAL_SCP_ANOMALIES[4], active: false, stability: 100, breached: false } // SCP-682 (Inativo)
            ];

            // Act
            const buffs = calculateScpPassiveBuffs(anomalies);

            // Assert
            expect(buffs.attackSpeedBonus).toBe(0.15);
            expect(buffs.defenseBonus).toBe(0.20);
            expect(buffs.siegeDamageBonus).toBe(0); // Inativo não pontua
        });

        it('não deve conceder bônus de anomalias em estado de brecha', () => {
            // Arrange
            const anomalies = [
                { ...INITIAL_SCP_ANOMALIES[0], active: true, stability: 0, breached: true }
            ];

            // Act
            const buffs = calculateScpPassiveBuffs(anomalies);

            // Assert
            expect(buffs.attackSpeedBonus).toBe(0);
        });
    });
});
