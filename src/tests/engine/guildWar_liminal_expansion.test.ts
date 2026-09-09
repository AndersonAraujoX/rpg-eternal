import { describe, it, expect } from 'vitest';
import type { Territory, Hero } from '../../engine/types';
import {
    corruptTerritoryWithRift,
    upgradeTerritoryMegModule,
    calculateTerritoryLiminalYield,
    spawnLevelExclamationRift,
    initGuildWarMobaBattle,
    simulateGuildWarMobaTick,
    summonLiminalEntity,
    executeNoclipFlank,
    executeAlmondCurativeSurge,
    executeMobaCommanderAbility
} from '../../engine/guildWar';

describe('Guild War & Backrooms Liminal Expansion (AAA Pattern)', () => {
    const mockTerritory: Territory = {
        id: 'ter-test-1',
        name: 'Vale dos Ecos',
        description: 'Um vale misterioso entre colinas.',
        owner: 'player',
        difficulty: 1000,
        level: 1,
        upgradeCost: 2000,
        bonus: { type: 'gold', value: 0.1 },
        coordinates: { x: 0, y: 0 }
    };

    const mockHeroes: Hero[] = [
        {
            id: 'h-1',
            name: 'Valente',
            emoji: '⚔️',
            class: 'Warrior',
            level: 10,
            stats: { maxHp: 1500, hp: 1500, attack: 200, defense: 50, speed: 10 }
        } as unknown as Hero,
        {
            id: 'h-2',
            name: 'Mística',
            emoji: '🧙‍♀️',
            class: 'Mage',
            level: 10,
            stats: { maxHp: 1000, hp: 1000, attack: 300, defense: 30, speed: 12 }
        } as unknown as Hero
    ];

    describe('Pilar 1: Territórios Liminares & Módulos M.E.G.', () => {
        it('should corrupt a territory with a dimensional rift and generate exotic yield', () => {
            // Arrange
            const territories = [{ ...mockTerritory, owner: 'Neutral' as const }];

            // Act
            const { updatedTerritories, corruptedTerritory } = corruptTerritoryWithRift(territories, 'ter-test-1', 2);

            // Assert
            expect(corruptedTerritory).not.toBeNull();
            expect(corruptedTerritory?.isLiminalRift).toBe(true);
            expect(corruptedTerritory?.riftLevel).toBe(2);
            expect(corruptedTerritory?.exoticYield?.liminalFluid).toBe(4);
            expect(corruptedTerritory?.exoticYield?.voidAlloy).toBe(1);
            expect(corruptedTerritory?.exoticYield?.backroomsScrap).toBe(20);
            expect(updatedTerritories[0].isLiminalRift).toBe(true);
        });

        it('should upgrade M.E.G. radio tower module and deduct resources properly', () => {
            // Arrange
            const territory = { ...mockTerritory };
            const resources = { scrap: 100, almondWater: 20, liminalFluid: 10 };

            // Act
            const result = upgradeTerritoryMegModule(territory, 'radioTower', resources);

            // Assert
            expect(result.success).toBe(true);
            expect(result.updatedTerritory.modules?.radioTower).toBe(1);
            expect(result.updatedTerritory.defenseBonus).toBe(0.15); // +15% defesa
            expect(result.updatedResources.scrap).toBe(70);
            expect(result.updatedResources.almondWater).toBe(15);
            expect(result.updatedResources.liminalFluid).toBe(8);
        });

        it('should fail to upgrade module when resources are insufficient', () => {
            // Arrange
            const territory = { ...mockTerritory };
            const poorResources = { scrap: 5, almondWater: 0, liminalFluid: 0 };

            // Act
            const result = upgradeTerritoryMegModule(territory, 'radioTower', poorResources);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('Recursos insuficientes');
            expect(result.updatedTerritory.modules?.radioTower).toBeUndefined();
        });

        it('should enforce maximum level limit of 5 on territory modules', () => {
            // Arrange
            const maxedTerritory: Territory = {
                ...mockTerritory,
                modules: { radioTower: 5 }
            };
            const resources = { scrap: 500, almondWater: 100, liminalFluid: 50 };

            // Act
            const result = upgradeTerritoryMegModule(maxedTerritory, 'radioTower', resources);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('nível máximo');
        });

        it('should calculate liminal exotic yield from player-owned rift territories', () => {
            // Arrange
            const territories: Territory[] = [
                {
                    ...mockTerritory,
                    owner: 'player',
                    isLiminalRift: true,
                    exoticYield: { liminalFluid: 6, voidAlloy: 3, backroomsScrap: 30 },
                    modules: { waterCondenser: 2 }
                },
                {
                    ...mockTerritory,
                    id: 'ter-enemy',
                    owner: 'Xang',
                    isLiminalRift: true,
                    exoticYield: { liminalFluid: 10, voidAlloy: 5, backroomsScrap: 50 }
                }
            ];

            // Act
            const yieldResult = calculateTerritoryLiminalYield(territories);

            // Assert
            expect(yieldResult.liminalFluid).toBe(6);
            expect(yieldResult.voidAlloy).toBe(3);
            expect(yieldResult.backroomsScrap).toBe(30);
            expect(yieldResult.almondWater).toBe(2); // 2 de condensador
        });

        it('should spawn the Level ! Exclamation Rift event on a contested territory', () => {
            // Arrange
            const territories: Territory[] = [
                { ...mockTerritory, owner: 'Neutral' }
            ];

            // Act
            const { updatedTerritories, eventTerritory } = spawnLevelExclamationRift(territories);

            // Assert
            expect(eventTerritory).not.toBeNull();
            expect(eventTerritory?.name).toContain('Nível !');
            expect(eventTerritory?.riftLevel).toBe(5);
            expect(eventTerritory?.exoticYield?.liminalFluid).toBe(15);
            expect(eventTerritory?.difficulty).toBeGreaterThan(mockTerritory.difficulty);
            expect(updatedTerritories[0].isLiminalRift).toBe(true);
        });
    });

    describe('Pilar 2: Invocação de Entidades Liminares no MOBA', () => {
        it('should summon a Smiler into the specified lane with blind_towers special effect', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);

            // Act
            const result = summonLiminalEntity(battle, 'smiler', 'top');

            // Assert
            expect(result.success).toBe(true);
            const smiler = result.updatedState.units.find(u => u.type === 'liminal_entity' && u.name.includes('Smiler'));
            expect(smiler).toBeDefined();
            expect(smiler?.lane).toBe('top');
            expect(smiler?.specialEffect).toBe('blind_towers');
            expect(smiler?.side).toBe('allied');
            expect(result.updatedState.abilities.summon_entity.cooldown).toBe(25);
        });

        it('should summon a Hound with hunt_carrier effect and high speed', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);

            // Act
            const result = summonLiminalEntity(battle, 'hound', 'mid');

            // Assert
            expect(result.success).toBe(true);
            const hound = result.updatedState.units.find(u => u.type === 'liminal_entity' && u.name.includes('Hound'));
            expect(hound).toBeDefined();
            expect(hound?.specialEffect).toBe('hunt_carrier');
            expect(hound?.speed).toBeGreaterThanOrEqual(5.0);
        });

        it('should summon a Skin-Stealer with stealth_ambush and active stealthRemaining', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);

            // Act
            const result = summonLiminalEntity(battle, 'skin_stealer', 'bot');

            // Assert
            expect(result.success).toBe(true);
            const stealer = result.updatedState.units.find(u => u.type === 'liminal_entity' && u.name.includes('Skin-Stealer'));
            expect(stealer).toBeDefined();
            expect(stealer?.specialEffect).toBe('stealth_ambush');
            expect(stealer?.stealthRemaining).toBe(10);
        });

        it('should blind rival towers when an allied Smiler is present on the lane during tick simulation', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);
            // Invocamos o Smiler na rota top
            const afterSummon = summonLiminalEntity(battle, 'smiler', 'top').updatedState;

            // Colocamos um herói aliado bem na mira da torre rival superior (posição 75%)
            const allyNearTower = afterSummon.units.find(u => u.side === 'allied' && u.lane === 'top');
            if (allyNearTower) {
                allyNearTower.position = 75;
                allyNearTower.hp = 1000;
            }

            // Act: simulamos 1 tick com o Smiler presente na rota
            const tickedState = simulateGuildWarMobaTick(afterSummon, 1);
            const heroAfterTick = tickedState.units.find(u => u.id === allyNearTower?.id);

            // Assert: A torre rival não deve ter atirado porque o Smiler cega as torres rivais da rota!
            expect(heroAfterTick?.hp).toBe(1000);
        });
    });

    describe('Pilar 3: O Túnel Noclip (Flanco Dimensional)', () => {
        it('should dispatch an allied hero into the Noclip Tunnel with a travel timer', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);

            // Act
            const result = executeNoclipFlank(battle, 'mid', false);

            // Assert
            expect(result.success).toBe(true);
            const flaker = result.updatedState.units.find(u => (u.noclipTimer || 0) > 0);
            expect(flaker).toBeDefined();
            expect(flaker?.noclipTimer).toBe(6);
            expect(result.updatedState.abilities.noclip_flank.cooldown).toBe(30);
        });

        it('should grant reduced travel timer (3s) when executed with scout talent', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);

            // Act
            const result = executeNoclipFlank(battle, 'top', true);

            // Assert
            expect(result.success).toBe(true);
            const flaker = result.updatedState.units.find(u => (u.noclipTimer || 0) > 0);
            expect(flaker?.noclipTimer).toBe(3);
        });

        it('should emerge the flanking unit behind rival lines (position 85%) once travel timer elapses', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);
            const afterNoclip = executeNoclipFlank(battle, 'mid', true).updatedState;

            // Act: simulamos 3 ticks de 1 segundo para o batedor emergir
            let state = afterNoclip;
            for (let i = 0; i < 3; i++) {
                state = simulateGuildWarMobaTick(state, 1);
            }

            // Assert: A unidade deve ter completado o noclip e surgido na posição 85%
            const emergedHero = state.units.find(u => u.side === 'allied' && u.type === 'hero' && u.position >= 80);
            expect(emergedHero).toBeDefined();
            expect(emergedHero?.noclipTimer).toBe(0);
        });
    });

    describe('Pilar 4: Cura Liminar com Água de Amêndoa', () => {
        it('should heal 50% maxHp of all allied units and start ability cooldown', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);
            // Danificamos os heróis aliados
            battle.units.forEach(u => {
                if (u.side === 'allied') u.hp = Math.floor(u.maxHp * 0.2);
            });

            // Act
            const result = executeAlmondCurativeSurge(battle);

            // Assert
            expect(result.success).toBe(true);
            const ally = result.updatedState.units.find(u => u.side === 'allied');
            expect(ally?.hp).toBe(Math.floor(ally!.maxHp * 0.7)); // 20% + 50% = 70%
            expect(result.updatedState.abilities.almond_curative_surge.cooldown).toBe(20);
        });
    });

    describe('Edge Cases & Tratamento de Exceções', () => {
        it('should reject ability execution if battle is inactive or ability is on cooldown', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, []);
            battle.abilities.summon_entity.cooldown = 15;

            // Act
            const result = summonLiminalEntity(battle, 'smiler');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('recarga');
        });

        it('should return safely if corrupting an Ocean territory', () => {
            // Arrange
            const oceanTerritory: Territory = {
                ...mockTerritory,
                id: 'ocean-1',
                owner: 'Ocean'
            };

            // Act
            const { corruptedTerritory } = corruptTerritoryWithRift([oceanTerritory], 'ocean-1', 1);

            // Assert
            expect(corruptedTerritory).toBeNull();
        });
    });
});
