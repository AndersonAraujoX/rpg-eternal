import { describe, it, expect, vi } from 'vitest';
import { simulateIndustryTick, type MachineNode } from '../../engine/industry';
import { simulateGvGTick, initGvGWar } from '../../engine/guildWar';
import type { FakePlayer } from '../../engine/playerSimulation';

describe('Museum GvG Relics Integration', () => {
    describe('Industry Cost Reduction (relic_gear)', () => {
        it('should apply cost reduction to catapult and plasma cannon recipes with minimum cost of 1', () => {
            const nodes: MachineNode[] = [
                { id: '1', machineId: 'assembler_1', recipeId: 'craft_catapult', count: 1 },
                { id: '2', machineId: 'assembler_1', recipeId: 'craft_plasma_cannon', count: 1 }
            ];

            // Default inputs:
            // craft_catapult: 'iron_gear': 50, 'coal': 100
            // craft_plasma_cannon: 'basic_circuit': 20, 'copper_wire': 100
            const inventory = {
                'iron_gear': 100,
                'coal': 200,
                'basic_circuit': 50,
                'copper_wire': 200,
                'siege_catapult': 0,
                'plasma_cannon': 0
            };

            // 10% cost reduction (1 copy of relic_gear)
            const result10 = simulateIndustryTick(nodes, inventory, 60, 0.10); // 60 seconds is enough to run craft_catapult cycle
            
            // At 10% reduction, craft_catapult costs should be:
            // iron_gear: Math.max(1, Math.floor(50 * 0.9)) = 45
            // coal: Math.max(1, Math.floor(100 * 0.9)) = 90
            expect(result10.newInventory['iron_gear']).toBe(100 - 45);
            expect(result10.newInventory['coal']).toBe(200 - 90);

            // 99% cost reduction (should floor at 1)
            const result99 = simulateIndustryTick(nodes, inventory, 60, 0.99);
            expect(result99.newInventory['iron_gear']).toBe(100 - 1);
            expect(result99.newInventory['coal']).toBe(200 - 1);
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
            // Force the allied and rival bot IDs manually to ensure they are deterministic
            initialWar.alliedBotIds = ['ally-1'];
            initialWar.rivalBotIds = ['rival-1'];
            initialWar.towers = []; // remove towers to avoid allied attack rolls interfering

            // Mock Math.random to make combat deterministic
            // We want to inspect the win chance check inside simulateGvGTick.
            // Under simulateGvGTick, rival attacks and compares:
            // const won = Math.random() < gvgWinChance(attacker.power, defPower);
            // With attacker.power = 1000 (RivalBot), defender.power = 1000 (AllyBot).
            // Without bonus: defPower = 1000. Ratio = 1000/1000 = 1. gvgWinChance = 0.5.
            // With 50% GvG defense bonus: defPower = 1500. Ratio = 1000/1500 = 0.666.
            // gvgWinChance = 0.10 + (0.666 - 0.5) * (0.80 / 1.5) = 0.10 + 0.166 * 0.533 = 0.188.
            
            // Let's verify by checking player score/rival score change at Math.random = 0.3
            // 0.3 is < 0.5 (rival wins without bonus)
            // 0.3 is > 0.188 (rival loses with 50% defense bonus)
            
            // 1. Without defense bonus
            let randomMockCalls = 0;
            const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
                randomMockCalls++;
                // In simulateGvGTick, first it tries allied bot attack but standingTowers is empty, so it goes to rival bot counter-attack.
                // 1. Math.random for picking rival bot attacker index
                // 2. Math.random for picking allied bot defender index
                // 3. Math.random for win chance check
                // 4. Math.random for hit log chance roll
                if (randomMockCalls === 3) return 0.3; 
                return 0.9;
            });

            const stateNoBonus = simulateGvGTick(initialWar, testBots, null, 0);
            // Rival should have won, so score goes up by 75
            expect(stateNoBonus.rivalScore).toBe(75);
            expect(stateNoBonus.playerScore).toBe(0);

            randomSpy.mockRestore();

            // 2. With 50% defense bonus
            let randomMockCalls2 = 0;
            const randomSpy2 = vi.spyOn(Math, 'random').mockImplementation(() => {
                randomMockCalls2++;
                if (randomMockCalls2 === 3) return 0.3; // 0.3 is higher than 0.188, so rival loses!
                return 0.9;
            });

            const stateWithBonus = simulateGvGTick(initialWar, testBots, null, 0.50);
            // Rival should have lost, so player score goes up by 30
            expect(stateWithBonus.rivalScore).toBe(0);
            expect(stateWithBonus.playerScore).toBe(30);

            randomSpy2.mockRestore();
        });
    });
});
