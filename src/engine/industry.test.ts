import { expect, test, describe } from 'vitest';
import { simulateIndustryTick, type MachineNode } from './industry';

describe('Industry Production Logic', () => {
    test('Basic mining fails without power', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'burner_miner', recipeId: 'mine_copper', count: 1 }
        ];
        const inventory: Record<string, number> = {};

        // 1 tick of 1 second
        const result = simulateIndustryTick(nodes, inventory, 1);

        // No power generator = 0 efficiency.
        expect(result.powerEfficiency).toBe(0);
        expect(result.newInventory['copper_ore'] || 0).toBe(0);
    });

    test('Production workflow with sufficient power', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'burner_miner', recipeId: 'mine_copper', count: 1 },
            { id: '2', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 }
        ];
        const inventory: Record<string, number> = {
            'coal': 10 // Needed to run the generator
        };

        const result = simulateIndustryTick(nodes, inventory, 1);

        expect(result.powerGenerated).toBe(500);
        expect(result.powerConsumed).toBe(10);
        expect(result.powerEfficiency).toBe(1); // 100%

        // Mine copper takes 1s to make 1 ore
        expect(result.newInventory['copper_ore']).toBe(1);

        // Gen steam takes 10s to burn 1 coal -> 0.1 coal per second
        expect(result.newInventory['coal']).toBeCloseTo(9.9);
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

    test('Large scaling arrays stack properly', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'steam_engine', recipeId: 'gen_steam', count: 2 },
            { id: '2', machineId: 'assembler_1', recipeId: 'craft_wire', count: 10 } // craft wire: 1 ingot -> 2 wires in 2s (0.5 cycles/s * 10 = 5 cycles/sec)
        ];
        const inventory: Record<string, number> = {
            'coal': 100,
            'copper_ingot': 1000
        };

        const result = simulateIndustryTick(nodes, inventory, 1);

        // 5 cycles/sec total -> consumes 5 ingots
        expect(result.newInventory['copper_ingot']).toBe(995);

        // 5 cycles result in * 2 wires each -> 10 wires/sec
        expect(result.newInventory['copper_wire']).toBe(10);

        // 10 machines at 30MW = 300MW consumed
        expect(result.powerConsumed).toBe(300);
        expect(result.powerGenerated).toBe(1000); // 2 generators at 500MW
    });
});
