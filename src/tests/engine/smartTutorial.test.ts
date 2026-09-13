import { describe, it, expect } from 'vitest';
import {
    evaluateJourneyProgress,
    detectActiveBottlenecks,
    claimAllTerritoryTributes,
    autoEquipBestItems,
    feedAllPets,
    quickSanityRestore,
    JOURNEY_STEPS
} from '../../engine/smartTutorial';
import type { Territory, Pet, Item } from '../../engine/types';

describe('Smart Tutorial & QoL Engine (AAA Pattern)', () => {

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. A JORNADA DO CONQUISTADOR (BREADCRUMB QUESTLINE)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('evaluateJourneyProgress', () => {
        it('deve iniciar no Passo 1 (Fundação) para um novo jogador (Caminho Feliz)', () => {
            // Arrange
            const initialGameState = {
                highestFloor: 1,
                gold: 10,
                backroomsUnlockedTechs: []
            };

            // Act
            const result = evaluateJourneyProgress(initialGameState);

            // Assert
            expect(result.currentStep.id).toBe('step_foundation');
            expect(result.currentStepIndex).toBe(0);
            expect(result.isAllCompleted).toBe(false);
            expect(result.progressPercentage).toBe(0);
        });

        it('deve avançar para o Passo 2 (Expansão Liminar) após superar o Andar 5 da Torre', () => {
            // Arrange
            const midGameState = {
                highestFloor: 6,
                backroomsUnlockedTechs: [],
                backroomsResources: { scrap: 5 }
            };

            // Act
            const result = evaluateJourneyProgress(midGameState);

            // Assert
            expect(result.currentStep.id).toBe('step_liminal_expansion');
            expect(result.currentStepIndex).toBe(1);
            expect(result.progressPercentage).toBeGreaterThan(0);
        });

        it('deve avançar para o Passo 5 (Sítio-19 SCP) quando a indústria estiver operando', () => {
            // Arrange
            const industrialState = {
                highestFloor: 15,
                backroomsUnlockedTechs: ['alchemical_distill'],
                territories: [{ id: 't1', owner: 'player' }],
                industryNodes: [
                    { id: 'm1', machineId: 'burner_mining_drill' },
                    { id: 'm2', machineId: 'assembler_1' }
                ],
                industryMetrics: { powerGenerated: 50, powerConsumed: 20 },
                scpFoundation: { unlocked: false }
            };

            // Act
            const result = evaluateJourneyProgress(industrialState);

            // Assert
            expect(result.currentStep.id).toBe('step_containment_site19');
            expect(result.currentStepIndex).toBe(4);
        });

        it('deve indicar 100% de conclusão quando todas as etapas forem superadas', () => {
            // Arrange
            const endgameSave = {
                highestFloor: 100,
                backroomsUnlockedTechs: ['tech_black_market'],
                territories: [{ id: 't1', owner: 'player' }],
                industryNodes: [{ id: 'm1' }, { id: 'm2' }],
                industryMetrics: { powerGenerated: 500, powerConsumed: 200 },
                scpFoundation: { unlocked: true, anomalies: [{ active: true }] },
                outerSpaceUnlocked: true
            };

            // Act
            const result = evaluateJourneyProgress(endgameSave);

            // Assert
            expect(result.isAllCompleted).toBe(true);
            expect(result.progressPercentage).toBe(100);
        });

        it('deve tratar com resiliência estados nulos ou vazios (Edge Case)', () => {
            // Arrange & Act
            const result = evaluateJourneyProgress(null);

            // Assert
            expect(result.currentStep).toBeDefined();
            expect(result.currentStep.id).toBe('step_foundation');
            expect(result.isAllCompleted).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. RADAR TÁTICO DE GARGALOS (ARIA'S BOTTLENECK RADAR)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('detectActiveBottlenecks', () => {
        it('deve detectar déficit elétrico industrial como alerta crítico', () => {
            // Arrange
            const stateWithPowerCrisis = {
                industryMetrics: {
                    powerGenerated: 30,
                    powerConsumed: 100
                }
            };

            // Act
            const alerts = detectActiveBottlenecks(stateWithPowerCrisis);

            // Assert
            const powerAlert = alerts.find(a => a.id === 'bottleneck_power_deficit');
            expect(powerAlert).toBeDefined();
            expect(powerAlert?.severity).toBe('critical');
            expect(powerAlert?.targetModal).toBe('industry');
        });

        it('deve emitir alarme vermelho se houver brecha SCP ativa', () => {
            // Arrange
            const stateWithBreach = {
                scpFoundation: {
                    unlocked: true,
                    activeBreach: { anomalyId: 'scp_173', timer: 15 }
                }
            };

            // Act
            const alerts = detectActiveBottlenecks(stateWithBreach);

            // Assert
            const breachAlert = alerts.find(a => a.id === 'bottleneck_scp_breach');
            expect(breachAlert).toBeDefined();
            expect(breachAlert?.severity).toBe('critical');
        });

        it('deve alertar quando batedores nas Backrooms estiverem com sanidade crítica (<30%)', () => {
            // Arrange
            const stateWithDyingExplorers = {
                backroomsExplorers: [
                    { id: 'exp1', name: 'John', sanity: 15 },
                    { id: 'exp2', name: 'Sara', sanity: 85 }
                ]
            };

            // Act
            const alerts = detectActiveBottlenecks(stateWithDyingExplorers);

            // Assert
            const sanityAlert = alerts.find(a => a.id === 'bottleneck_backrooms_sanity');
            expect(sanityAlert).toBeDefined();
            expect(sanityAlert?.severity).toBe('warning');
            expect(sanityAlert?.targetModal).toBe('backrooms');
        });

        it('deve sinalizar oportunidade de coleta quando houver territórios prontos', () => {
            // Arrange
            const stateWithTributes = {
                territories: [
                    { id: 't1', owner: 'player', isLiminalRift: true, exoticYield: { liminalFluid: 5 } },
                    { id: 't2', owner: 'player', defenseBonus: 20 }
                ]
            };

            // Act
            const alerts = detectActiveBottlenecks(stateWithTributes);

            // Assert
            const tributeAlert = alerts.find(a => a.id === 'bottleneck_territory_tributes');
            expect(tributeAlert).toBeDefined();
            expect(tributeAlert?.severity).toBe('opportunity');
        });

        it('não deve gerar alertas desnecessários se o estado for saudável', () => {
            // Arrange
            const healthyState = {
                gold: 500,
                highestFloor: 5,
                industryMetrics: { powerGenerated: 100, powerConsumed: 50 },
                backroomsExplorers: [{ id: 'e1', sanity: 90 }]
            };

            // Act
            const alerts = detectActiveBottlenecks(healthyState);

            // Assert
            expect(alerts.length).toBe(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. AÇÕES INTELIGENTES DE QUALIDADE DE VIDA (ONE-CLICK QoL)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('claimAllTerritoryTributes', () => {
        it('deve coletar ouro e fluidos de territórios controlados pelo jogador', () => {
            // Arrange
            const territories: Territory[] = [
                {
                    id: 't1',
                    name: 'Planície Central',
                    owner: 'player',
                    isLiminalRift: true,
                    exoticYield: { liminalFluid: 6, voidAlloy: 3, backroomsScrap: 20 }
                } as Territory,
                {
                    id: 't2',
                    name: 'Montanha Xang',
                    owner: 'Xang',
                    isLiminalRift: true,
                    exoticYield: { liminalFluid: 10, voidAlloy: 5, backroomsScrap: 50 }
                } as Territory
            ];
            const currentInventory = { gold: 100, liminalFluid: 2 };

            // Act
            const result = claimAllTerritoryTributes(territories, currentInventory);

            // Assert
            expect(result.claimedGold).toBe(50);
            expect(result.claimedFluid).toBe(6);
            expect(result.claimedVoidAlloy).toBe(3);
            expect(result.updatedInventory['gold']).toBe(150);
            expect(result.updatedInventory['liminalFluid']).toBe(8);
        });
    });

    describe('autoEquipBestItems', () => {
        it('deve equipar automaticamente a melhor arma no herói e devolver a anterior', () => {
            // Arrange
            const heroes = [
                {
                    id: 'hero1',
                    name: 'Valerius',
                    equipment: {
                        weapon: { id: 'sword_wood', name: 'Espada de Madeira', type: 'weapon', stats: { attack: 10, defense: 0 } }
                    }
                }
            ];
            const availableItems: Item[] = [
                { id: 'sword_iron', name: 'Espada de Ferro', type: 'weapon', stats: { attack: 35, defense: 0 } } as Item
            ];

            // Act
            const result = autoEquipBestItems(heroes, availableItems);

            // Assert
            expect(result.equippedCount).toBe(1);
            expect(result.updatedHeroes[0].equipment.weapon.id).toBe('sword_iron');
            expect(result.remainingItems.some(i => i.id === 'sword_wood')).toBe(true);
        });

        it('não deve alterar nada se os heróis já estiverem com os melhores itens', () => {
            // Arrange
            const heroes = [
                {
                    id: 'hero1',
                    equipment: {
                        weapon: { id: 'mythic_sword', type: 'weapon', stats: { attack: 100, defense: 0 } }
                    }
                }
            ];
            const inferiorItems: Item[] = [
                { id: 'basic_sword', type: 'weapon', stats: { attack: 10, defense: 0 } } as Item
            ];

            // Act
            const result = autoEquipBestItems(heroes, inferiorItems);

            // Assert
            expect(result.equippedCount).toBe(0);
            expect(result.updatedHeroes[0].equipment.weapon.id).toBe('mythic_sword');
        });
    });

    describe('feedAllPets', () => {
        it('deve alimentar pets com afinidade baixa consumindo ração disponível', () => {
            // Arrange
            const pets: Pet[] = [
                { id: 'p1', name: 'Lobo', affinity: 40 } as Pet,
                { id: 'p2', name: 'Gato', affinity: 100 } as Pet // Já satisfeito
            ];

            // Act
            const result = feedAllPets(pets, 5);

            // Assert
            expect(result.fedCount).toBe(1);
            expect(result.consumedFood).toBe(1);
            expect(result.remainingFood).toBe(4);
            expect(result.updatedPets[0].affinity).toBe(55);
            expect(result.updatedPets[1].affinity).toBe(100);
        });
    });

    describe('quickSanityRestore', () => {
        it('deve restaurar batedores com sanidade menor que 40% usando Água de Amêndoa', () => {
            // Arrange
            const explorers = [
                { id: 'e1', name: 'Alex', sanity: 20 },
                { id: 'e2', name: 'Bia', sanity: 80 }
            ];

            // Act
            const result = quickSanityRestore(explorers, 2);

            // Assert
            expect(result.restoredCount).toBe(1);
            expect(result.consumedWater).toBe(1);
            expect(result.remainingWater).toBe(1);
            expect(result.updatedExplorers[0].sanity).toBe(100);
            expect(result.updatedExplorers[1].sanity).toBe(80);
        });
    });
});
