import { expect, test, describe } from 'vitest';
import { simulateIndustryTick, type MachineNode } from '../../engine/industry';

describe('Industry Production Logic', () => {
    test('Basic mining runs autonomously without power grid', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'burner_miner', recipeId: 'mine_copper', count: 1 }
        ];
        const inventory: Record<string, number> = {};

        // 1 tick of 1 second
        const result = simulateIndustryTick(nodes, inventory, 1);

        // Basic miner has 0 power draw and runs autonomously
        expect(result.powerConsumed).toBe(0);
        expect(result.powerEfficiency).toBe(1);
        expect(result.newInventory['copper_ore']).toBe(1);
    });

    test('Downstream electric machines require power generated from mined coal', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'burner_miner', recipeId: 'mine_coal', count: 1 },
            { id: '2', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 },
            { id: '3', machineId: 'stone_furnace', recipeId: 'smelt_copper', count: 1 }
        ];
        const inventory: Record<string, number> = {
            'coal': 10,
            'copper_ore': 5
        };

        const result = simulateIndustryTick(nodes, inventory, 1);

        expect(result.powerGenerated).toBe(500);
        expect(result.powerConsumed).toBe(20); // 20MW for stone_furnace, 0MW for burner_miner
        expect(result.powerEfficiency).toBe(1); // 100%

        // Mine coal makes 1 coal/s
        // Gen steam consumes 0.1 coal/s -> Net coal = 10 + 1 - 0.1 = 10.9
        expect(result.newInventory['coal']).toBeCloseTo(10.9);
    });

    test('Limited inputs throttle downstream production', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 }, // Need power to work
            { id: '2', machineId: 'stone_furnace', recipeId: 'smelt_copper', count: 1 } // needs 1 ore for 1 ingot over 2s = 0.5 ore/s
        ];
        const inventory: Record<string, number> = {
            'coal': 10,
            'copper_ore': 0.2 // Less than 0.5/s available
        };

        const result = simulateIndustryTick(nodes, inventory, 1);

        // Production should be throttled to use exactly 0.2 ore
        expect(result.newInventory['copper_ore']).toBeCloseTo(0);
        expect(result.newInventory['copper_ingot']).toBeCloseTo(0.2); // Output scales perfectly linearly in this model
    });

    test('Blackout and power deficit throttles production proportionally', () => {
        // 1 steam engine (500MW) running 20 assemblers (30MW each = 600MW total)
        // Power efficiency should be 500 / 600 = 0.8333 (83.33%)
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 },
            { id: '2', machineId: 'assembler_1', recipeId: 'craft_wire', count: 20 }
        ];
        const inventory: Record<string, number> = {
            'coal': 100,
            'copper_ingot': 1000
        };

        const result = simulateIndustryTick(nodes, inventory, 1);

        expect(result.powerGenerated).toBe(500);
        expect(result.powerConsumed).toBe(600);
        expect(result.powerEfficiency).toBeCloseTo(500 / 600, 4);

        // Standard: 20 machines * 0.5 cycles/s = 10 cycles/s -> 10 ingots -> 20 wires
        // With 500/600 eff: 10 * (500/600) = 8.3333 ingots consumed -> 16.6667 wires produced
        expect(result.newInventory['copper_wire']).toBeCloseTo(16.6667, 2);
        expect(result.newInventory['copper_ingot']).toBeCloseTo(1000 - 8.3333, 2);
    });

    test('Complete multi-step production chain executes cleanly without NaN or negatives', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'burner_miner', recipeId: 'mine_iron', count: 2 }, // 2 iron_ore/s
            { id: '2', machineId: 'burner_miner', recipeId: 'mine_coal', count: 1 }, // 1 coal/s
            { id: '3', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 }, // 500MW, consumes 0.1 coal/s
            { id: '4', machineId: 'stone_furnace', recipeId: 'smelt_iron', count: 2 }, // 2 machines: consumes 1 iron_ore/s -> 1 iron_ingot/s
            { id: '5', machineId: 'assembler_1', recipeId: 'craft_gear', count: 1 } // 1 machine: 2 iron_ingot -> 1 gear in 2s (0.5 gear/s, consumes 1 ingot/s)
        ];
        const inventory: Record<string, number> = {
            'coal': 5,
            'iron_ore': 10,
            'iron_ingot': 5
        };

        const result = simulateIndustryTick(nodes, inventory, 1);

        expect(result.powerEfficiency).toBe(1);
        expect(result.newInventory['iron_gear']).toBeGreaterThan(0);
        expect(Number.isNaN(result.newInventory['iron_gear'])).toBe(false);
        expect(result.newInventory['iron_ore']).toBeGreaterThanOrEqual(0);
        expect(result.newInventory['iron_ingot']).toBeGreaterThanOrEqual(0);
    });

    test('Zero input protection prevents negative inventory and halts machines safely', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 },
            { id: '2', machineId: 'assembler_1', recipeId: 'craft_circuit', count: 5 } // Needs copper wire and iron ingot
        ];
        const inventory: Record<string, number> = {
            'coal': 10,
            'copper_wire': 0, // completely missing
            'iron_ingot': 0 // completely missing
        };

        const result = simulateIndustryTick(nodes, inventory, 1);

        expect(result.newInventory['basic_circuit'] || 0).toBe(0);
        expect(result.newInventory['copper_wire'] || 0).toBe(0);
        expect(result.newInventory['iron_ingot'] || 0).toBe(0);
    });

    test('Museum relic cost reduction properly discounts recipe input requirements', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 },
            { id: '2', machineId: 'assembler_1', recipeId: 'craft_catapult', count: 1 } // Base: 50 iron_gear, 100 coal in 60s -> siege_catapult
        ];
        const inventory: Record<string, number> = {
            'coal': 200,
            'iron_gear': 200
        };

        // 30% cost reduction from museum relic. In 60 seconds (1 full cycle):
        // iron_gear becomes floor(50 * 0.70) = 35. coal becomes floor(100 * 0.70) = 70.
        // Also gen_steam consumes 60 * 0.1 = 6 coal.
        const result = simulateIndustryTick(nodes, inventory, 60, 0.30);

        expect(result.newInventory['siege_catapult']).toBe(1);
        expect(result.newInventory['iron_gear']).toBe(165); // 200 - 35
        expect(result.newInventory['coal']).toBeCloseTo(124, 0); // 200 - 70 - 6 = 124
    });
});
