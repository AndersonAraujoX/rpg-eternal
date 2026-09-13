import { describe, it, expect } from 'vitest';
import {
    bidOnAuction,
    dispatchSmugglingConvoy,
    claimSmugglingConvoy,
    startDeepDiveRun,
    resolveDeepDiveAction,
    infusePetBreeding,
    validateColosseumFormation,
    simulateColosseumBattle,
    buildFleetShip,
    assignAdmiralToShip,
    calculateArmadaTotalPower,
    DEFAULT_AUCTIONS
} from '../../engine/liminalInnovations';
import type { Pet } from '../../engine/types';

describe('Liminal Innovations Engine - 5 Grand Pillars (AAA Pattern)', () => {

    const mockHeroes = [
        { id: 'hero-1', name: 'Valerius', stats: { attack: 100, defense: 80, hp: 500 } },
        { id: 'hero-2', name: 'Lyra', stats: { attack: 140, defense: 50, hp: 350 } },
        { id: 'hero-3', name: 'Kaelen', stats: { attack: 80, defense: 120, hp: 600 } },
        { id: 'hero-4', name: 'Aria', stats: { attack: 90, defense: 90, hp: 450 } }
    ];

    const mockPet1: Pet = {
        id: 'pet_wolf',
        name: 'Lobo Cinzento',
        element: 'fire',
        level: 5,
        affinity: 20,
        bonus: { gold: 10, souls: 5, exp: 5 },
        rarity: 'rare',
        emoji: '🐺'
    };

    const mockPet2: Pet = {
        id: 'pet_golem',
        name: 'Gólem Rochoso',
        element: 'earth',
        level: 5,
        affinity: 25,
        bonus: { gold: 5, souls: 15, exp: 5 },
        rarity: 'epic',
        emoji: '🗿'
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. PILAR 1: O MERCADO NEGRO & CONTRABANDO (tech_black_market)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('Pilar 1: Mercado Negro & Contrabando', () => {
        it('deve aceitar lance válido com fundos suficientes e tecnologia desbloqueada (Caminho Feliz)', () => {
            // Arrange
            const auction = { ...DEFAULT_AUCTIONS[0], currentBid: 2500 };
            const playerFunds = 5000;
            const newBid = 3000;

            // Act
            const result = bidOnAuction(auction, newBid, playerFunds, true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.updatedAuction.currentBid).toBe(3000);
            expect(result.updatedAuction.highestBidder).toBe('player');
            expect(result.remainingFunds).toBe(2000);
        });

        it('deve rejeitar lance se a tecnologia correspondente não foi pesquisada', () => {
            // Arrange
            const auction = { ...DEFAULT_AUCTIONS[0] };

            // Act
            const result = bidOnAuction(auction, 3000, 5000, false);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('Rotas do Mercado Negro');
        });

        it('deve rejeitar lance se o valor for menor ou igual ao lance atual', () => {
            // Arrange
            const auction = { ...DEFAULT_AUCTIONS[0], currentBid: 3000 };

            // Act
            const result = bidOnAuction(auction, 2800, 5000, true);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('maior que o lance atual');
        });

        it('deve despachar comboio de contrabando consumindo materiais industriais (Caminho Feliz)', () => {
            // Arrange
            const convoyDef = {
                id: 'convoy_1',
                name: 'Carga de Circuitos Pesados',
                riskLevel: 'medium' as const,
                cargoRequired: { steel_plate: 10, basic_circuit: 5 },
                rewardChaosMarks: 40,
                rewardGold: 1500,
                durationSeconds: 120
            };
            const inventory = { steel_plate: 25, basic_circuit: 10 };

            // Act
            const result = dispatchSmugglingConvoy(convoyDef, inventory, true, 1000);

            // Assert
            expect(result.success).toBe(true);
            expect(result.convoy).not.toBeNull();
            expect(result.updatedInventory['steel_plate']).toBe(15);
            expect(result.updatedInventory['basic_circuit']).toBe(5);
        });

        it('deve recusar comboio se materiais forem insuficientes', () => {
            // Arrange
            const convoyDef = {
                id: 'convoy_1',
                name: 'Carga',
                riskLevel: 'low' as const,
                cargoRequired: { steel_plate: 50 },
                rewardChaosMarks: 10,
                rewardGold: 100,
                durationSeconds: 60
            };
            const inventory = { steel_plate: 10 };

            // Act
            const result = dispatchSmugglingConvoy(convoyDef, inventory, true);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('Carga insuficiente');
        });

        it('deve coletar recompensas integrais de comboio que não sofreu emboscada', () => {
            // Arrange
            const convoy = {
                id: 'c1',
                name: 'Comboio Rápido',
                riskLevel: 'low' as const,
                cargoRequired: {},
                rewardChaosMarks: 30,
                rewardGold: 1000,
                durationSeconds: 60,
                dispatchedAt: 1000,
                completed: false,
                intercepted: false
            };
            const luckyRng = () => 0.99; // Evita emboscada

            // Act
            const result = claimSmugglingConvoy(convoy, 1000 + 70000, luckyRng);

            // Assert
            expect(result.success).toBe(true);
            expect(result.gainedChaosMarks).toBe(30);
            expect(result.gainedGold).toBe(1000);
            expect(result.completedConvoy.completed).toBe(true);
            expect(result.completedConvoy.intercepted).toBe(false);
        });

        it('deve reduzir recompensas pela metade se o comboio for emboscado', () => {
            // Arrange
            const convoy = {
                id: 'c1',
                name: 'Comboio Perigoso',
                riskLevel: 'high' as const,
                cargoRequired: {},
                rewardChaosMarks: 40,
                rewardGold: 2000,
                durationSeconds: 60,
                dispatchedAt: 1000,
                completed: false,
                intercepted: false
            };
            const unluckyRng = () => 0.01; // Força emboscada

            // Act
            const result = claimSmugglingConvoy(convoy, 1000 + 70000, unluckyRng);

            // Assert
            expect(result.success).toBe(true);
            expect(result.gainedChaosMarks).toBe(20);
            expect(result.gainedGold).toBe(1000);
            expect(result.completedConvoy.intercepted).toBe(true);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. PILAR 2: OPERAÇÃO DEEP-DIVE ROGUELIKE (tech_deep_dive)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('Pilar 2: Operação Deep-Dive Roguelike', () => {
        it('deve iniciar incursão com 3 heróis e 5 salas sequenciais (Caminho Feliz)', () => {
            // Arrange
            const squad = ['hero-1', 'hero-2', 'hero-3'];

            // Act
            const result = startDeepDiveRun(squad, mockHeroes, 25, true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.runState).not.toBeNull();
            expect(result.runState?.nodes.length).toBe(5);
            expect(result.runState?.nodes[4].type).toBe('boss');
            expect(result.runState?.squadSanity).toBe(100);
        });

        it('deve rejeitar incursão se o esquadrão não tiver exatamente 3 heróis', () => {
            // Arrange
            const squad = ['hero-1', 'hero-2'];

            // Act
            const result = startDeepDiveRun(squad, mockHeroes, 25, true);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('exatamente 3 heróis');
        });

        it('deve avançar com vitória na sala de combate e acumular sucatas', () => {
            // Arrange
            const squad = ['hero-1', 'hero-2', 'hero-3'];
            const startRes = startDeepDiveRun(squad, mockHeroes, 10, true);
            const run = startRes.runState!;
            const luckyCombatRng = () => 0.1; // Garante vitória

            // Act
            const result = resolveDeepDiveAction(run, 'advance', mockHeroes, {}, luckyCombatRng);

            // Assert
            expect(result.updatedRun.currentNodeIndex).toBe(1);
            expect(result.updatedRun.nodes[0].completed).toBe(true);
            expect(result.updatedRun.accumulatedLoot.scrap).toBeGreaterThan(0);
        });

        it('deve consumir Água de Amêndoa e restaurar sanidade e vida do esquadrão', () => {
            // Arrange
            const squad = ['hero-1', 'hero-2', 'hero-3'];
            const startRes = startDeepDiveRun(squad, mockHeroes, 10, true);
            const run = { ...startRes.runState!, squadSanity: 40, squadHpPercent: 50 };
            const inventory = { almondWater: 2 };

            // Act
            const result = resolveDeepDiveAction(run, 'drink_almond_water', mockHeroes, inventory);

            // Assert
            expect(result.updatedInventory['almondWater']).toBe(1);
            expect(result.updatedRun.squadSanity).toBe(80);
            expect(result.updatedRun.squadHpPercent).toBe(75);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. PILAR 3: BIO-ENGENHARIA QUIMÉRICA DE PETS (tech_pet_bioengineering)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('Pilar 3: Bio-Engenharia Quimérica de Pets', () => {
        it('deve criar pet quimérico liminar consumindo Fluido Liminar (Caminho Feliz)', () => {
            // Arrange
            const inventory = { liminalFluid: 5 };

            // Act
            const result = infusePetBreeding(mockPet1, mockPet2, 'liminal_fluid', inventory, true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.chimericPet).not.toBeNull();
            expect(result.chimericPet?.rarity).toBe('mythic');
            expect(result.chimericPet?.chimericTrait).toContain('Evasão');
            expect(result.updatedInventory['liminalFluid']).toBe(3); // Consumiu 2
        });

        it('deve criar pet quimérico SCP-999 consumindo Gel de Euforia', () => {
            // Arrange
            const inventory = { gel_999: 2 };

            // Act
            const result = infusePetBreeding(mockPet1, mockPet2, 'scp_999_gel', inventory, true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.chimericPet?.species).toContain('Gelatinoso');
            expect(result.updatedInventory['gel_999']).toBe(1);
        });

        it('deve recusar infusão se o insumo anômalo estiver em falta', () => {
            // Arrange
            const emptyInventory = {};

            // Act
            const result = infusePetBreeding(mockPet1, mockPet2, 'scp_682_scale', emptyInventory, true);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('Insumo insuficiente');
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. PILAR 4: COLISEU DAS LENDAS DIMENSIONAIS (tech_colosseum)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('Pilar 4: Coliseu das Lendas Dimensionais', () => {
        it('deve validar formação com heróis em Vanguarda, Meio e Retaguarda sem duplicatas', () => {
            // Arrange
            const formation = {
                vanguard: ['hero-1'],
                mid: ['hero-2'],
                rear: ['hero-3']
            };

            // Act
            const isValid = validateColosseumFormation(formation, mockHeroes);

            // Assert
            expect(isValid).toBe(true);
        });

        it('deve invalidar formação se houver o mesmo herói escalado duas vezes', () => {
            // Arrange
            const invalidFormation = {
                vanguard: ['hero-1'],
                mid: ['hero-1'], // Duplicado
                rear: []
            };

            // Act
            const isValid = validateColosseumFormation(invalidFormation, mockHeroes);

            // Assert
            expect(isValid).toBe(false);
        });

        it('deve simular batalha do Coliseu e conceder pontos de glória (Caminho Feliz)', () => {
            // Arrange
            const playerFormation = {
                vanguard: ['hero-1'],
                mid: ['hero-2'],
                rear: ['hero-3']
            };
            const opponentFormation = {
                vanguard: ['hero-4'],
                mid: [],
                rear: []
            };

            // Act
            const result = simulateColosseumBattle(playerFormation, opponentFormation, mockHeroes, true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.report).not.toBeNull();
            expect(result.report?.victory).toBe(true);
            expect(result.report?.gloryPointsGained).toBeGreaterThanOrEqual(100);
            expect(result.report?.log.length).toBeGreaterThan(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. PILAR 5: ARMADA CÓSMICA & FROTAS DE GUERRA (tech_cosmic_fleets)
    // ═══════════════════════════════════════════════════════════════════════════
    describe('Pilar 5: Armada Cósmica & Frotas de Guerra', () => {
        it('deve construir fragata de patrulha consumindo aço, circuitos e motores (Caminho Feliz)', () => {
            // Arrange
            const inventory = { steel_plate: 30, basic_circuit: 20, engine_unit: 5 };

            // Act
            const result = buildFleetShip('frigate', inventory, true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.ship).not.toBeNull();
            expect(result.ship?.shipClass).toBe('frigate');
            expect(result.updatedInventory['steel_plate']).toBe(10); // 30 - 20
            expect(result.updatedInventory['basic_circuit']).toBe(10); // 20 - 10
            expect(result.updatedInventory['engine_unit']).toBe(3); // 5 - 2
        });

        it('deve alocar herói como Almirante e amplificar o poder de fogo e escudo da esquadra', () => {
            // Arrange
            const ship = {
                id: 'ship_1',
                name: 'Dreadnought Leviatã',
                shipClass: 'dreadnought' as const,
                hull: 3000,
                shields: 2000,
                firepower: 900,
                assignedAdmiralHeroId: null,
                active: true
            };

            // Act 1: Atribuir almirante
            const shipWithAdmiral = assignAdmiralToShip(ship, 'hero-2', mockHeroes);

            // Act 2: Calcular poder total da frota
            const fleetStats = calculateArmadaTotalPower([shipWithAdmiral], mockHeroes);

            // Assert
            expect(shipWithAdmiral.assignedAdmiralHeroId).toBe('hero-2');
            // Hero-2 tem ataque 140 -> +70 firepower (900 + 70 = 970), defesa 50 -> +25 shields (2000 + 25 = 2025)
            expect(fleetStats.totalFirepower).toBe(970);
            expect(fleetStats.totalShields).toBe(2025);
            expect(fleetStats.fleetRating).toBeGreaterThan(6000);
        });
    });
});
