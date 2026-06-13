import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { simulateIndustryTick, type MachineNode } from '../../engine/industry';
import { simulateGvGTick, initGvGWar } from '../../engine/guildWar';
import type { FakePlayer } from '../../engine/playerSimulation';
import { useGame } from '../../hooks/useGame';

describe('Museum GvG Relics Integration', () => {
    describe('Industry Cost Reduction (relic_gear)', () => {
        it('should apply cost reduction to catapult and plasma cannon recipes with minimum cost of 1', () => {
            const nodes: MachineNode[] = [
                { id: '1', machineId: 'assembler_1', recipeId: 'craft_catapult', count: 1 },
                { id: '2', machineId: 'assembler_1', recipeId: 'craft_plasma_cannon', count: 1 },
                { id: '3', machineId: 'steam_engine', recipeId: 'gen_steam', count: 2 }
            ];

            const inventory = {
                'iron_gear': 100,
                'coal': 200,
                'basic_circuit': 50,
                'copper_wire': 200,
                'siege_catapult': 0,
                'plasma_cannon': 0
            };

            // 10% cost reduction (1 copy of relic_gear)
            const result10 = simulateIndustryTick(nodes, inventory, 60, 0.10);
            
            // At 10% reduction, craft_catapult costs should be:
            // iron_gear: Math.max(1, Math.floor(50 * 0.9)) = 45
            // coal: Math.max(1, Math.floor(100 * 0.9)) = 90
            // Also generator consumes 12 coal ((1/10) * 2 * 60)
            expect(result10.newInventory['iron_gear']).toBe(100 - 45);
            expect(result10.newInventory['coal']).toBe(200 - 90 - 12);

            // 99% cost reduction (should floor at 1)
            const result99 = simulateIndustryTick(nodes, inventory, 60, 0.99);
            expect(result99.newInventory['iron_gear']).toBe(100 - 1);
            expect(result99.newInventory['coal']).toBe(200 - 1 - 12);
        });
    });

    describe('GvG Defense Power Bonus (relic_banner)', () => {
        it('should scale defender power by gvgDefenseBonus during GvG Tick', () => {
            const testBots: FakePlayer[] = [
                {
                    id: 'ally-1',
                    name: 'AllyBot',
                    profile: 'lucky',
                    power: 1000,
                    level: 20,
                    towerFloor: 10,
                    guild: 'PlayerGuild',
                    avatar: '🤖',
                    lastActionTime: Date.now()
                },
                {
                    id: 'rival-1',
                    name: 'RivalBot',
                    profile: 'hardcore',
                    power: 1000,
                    level: 20,
                    towerFloor: 10,
                    guild: 'RivalGuild',
                    avatar: '💀',
                    lastActionTime: Date.now()
                }
            ];

            const initialWar = initGvGWar(1000, testBots, 'PlayerGuild');
            initialWar.alliedBotIds = ['ally-1'];
            initialWar.rivalBotIds = ['rival-1'];
            initialWar.towers = [];

            // 1. Without defense bonus
            let randomMockCalls = 0;
            const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
                randomMockCalls++;
                if (randomMockCalls === 3) return 0.3; 
                return 0.9;
            });

            const stateNoBonus = simulateGvGTick(initialWar, testBots, null, 0);
            expect(stateNoBonus.rivalScore).toBe(75);
            expect(stateNoBonus.playerScore).toBe(0);

            randomSpy.mockRestore();

            // 2. With 50% defense bonus
            let randomMockCalls2 = 0;
            const randomSpy2 = vi.spyOn(Math, 'random').mockImplementation(() => {
                randomMockCalls2++;
                if (randomMockCalls2 === 3) return 0.3; 
                return 0.9;
            });

            const stateWithBonus = simulateGvGTick(initialWar, testBots, null, 0.50);
            expect(stateWithBonus.rivalScore).toBe(0);
            expect(stateWithBonus.playerScore).toBe(30);

            randomSpy2.mockRestore();
        });
    });

    describe('GvG Territory Conquest Drops', () => {
        it('should award Estandarte Destruído when Fortaleza de Ferro is captured', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setTerritories([
                    {
                        id: 'fortaleza-ferro-test',
                        name: 'Fortaleza de Ferro de Teste',
                        description: 'Uma fortaleza maciça de ferro.',
                        owner: 'Neutral',
                        difficulty: 10,
                        level: 1,
                        upgradeCost: 100,
                        bonus: { type: 'gold', value: 0.1 },
                        coordinates: { x: 0, y: 0 }
                    }
                ]);
                result.current.setPartyPower(10000);
            });

            const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.01); // always succeed siege

            act(() => {
                result.current.attackTerritory('fortaleza-ferro-test');
            });

            randomSpy.mockRestore();

            // Check if player owns relic_banner
            const relic = result.current.town.relics.find(r => r.id === 'relic_banner');
            expect(relic).toBeDefined();
            expect(relic?.count).toBeGreaterThan(0);
        });

        it('should award Engrenagem de Cerco when Acampamento Titã is captured', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setTerritories([
                    {
                        id: 'acampamento-tita-test',
                        name: 'Acampamento Titã de Teste',
                        description: 'Um acampamento gigante.',
                        owner: 'Neutral',
                        difficulty: 10,
                        level: 1,
                        upgradeCost: 100,
                        bonus: { type: 'gold', value: 0.1 },
                        coordinates: { x: 0, y: 0 }
                    }
                ]);
                result.current.setPartyPower(10000);
            });

            const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.01); // always succeed siege

            act(() => {
                result.current.attackTerritory('acampamento-tita-test');
            });

            randomSpy.mockRestore();

            // Check if player owns relic_gear
            const relic = result.current.town.relics.find(r => r.id === 'relic_gear');
            expect(relic).toBeDefined();
            expect(relic?.count).toBeGreaterThan(0);
        });
    });
});
