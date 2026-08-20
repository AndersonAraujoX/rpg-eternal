import { expect, test, describe } from 'vitest';
import { simulateIndustryTick, FACTORIO_TECHS, type MachineNode } from '../../engine/industry';

describe('Factorio Expanded Industry Engine', () => {
    test('Science pack automation chain produces Red and Green science packs', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'burner_miner', recipeId: 'mine_copper', count: 5 },
            { id: '2', machineId: 'burner_miner', recipeId: 'mine_iron', count: 5 },
            { id: '3', machineId: 'steam_engine', recipeId: 'gen_steam', count: 2 }, // 1000 MW
            { id: '4', machineId: 'stone_furnace', recipeId: 'smelt_copper', count: 2 },
            { id: '5', machineId: 'stone_furnace', recipeId: 'smelt_iron', count: 2 },
            { id: '6', machineId: 'assembler_1', recipeId: 'craft_gear', count: 2 },
            { id: '7', machineId: 'assembler_1', recipeId: 'craft_science_red', count: 1 }
        ];

        const inventory: Record<string, number> = {
            'coal': 50,
            'copper_ingot': 10,
            'iron_ingot': 10
        };

        const result = simulateIndustryTick(nodes, inventory, 5);

        expect(result.powerEfficiency).toBe(1);
        expect(result.newInventory['science_red']).toBeGreaterThan(0);
    });

    test('Research Lab consumes science packs and advances active research', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'steam_engine', recipeId: 'gen_steam', count: 1 }, // 500 MW
            { id: '2', machineId: 'research_lab', recipeId: '', count: 2 } // 2 labs
        ];

        const inventory: Record<string, number> = {
            'coal': 10,
            'science_red': 20
        };

        const techToResearch = FACTORIO_TECHS.find(t => t.id === 'tech_automation_1')!;

        // 5 seconds tick
        const result = simulateIndustryTick(nodes, inventory, 5, 0, techToResearch);

        expect(result.researchPointsGained).toBeGreaterThan(0);
        expect(result.newInventory['science_red']).toBeLessThan(20);
        expect(result.labsActiveCount).toBe(2);
    });

    test('Petrochemical chain converts crude oil into plastic and advanced circuits', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'steam_engine', recipeId: 'gen_steam', count: 2 }, // 1000 MW
            { id: '2', machineId: 'oil_pumpjack', recipeId: 'pump_oil', count: 1 },
            { id: '3', machineId: 'oil_refinery', recipeId: 'refine_basic_oil', count: 1 },
            { id: '4', machineId: 'chemical_plant', recipeId: 'craft_plastic', count: 1 },
            { id: '5', machineId: 'assembler_2', recipeId: 'craft_advanced_circuit', count: 1 }
        ];

        const inventory: Record<string, number> = {
            'coal': 100,
            'crude_oil': 50,
            'basic_circuit': 20,
            'copper_wire': 50
        };

        const result = simulateIndustryTick(nodes, inventory, 10);

        expect(result.newInventory['plastic_bar']).toBeGreaterThan(0);
        expect(result.newInventory['advanced_circuit']).toBeGreaterThan(0);
    });

    test('Nuclear fission reactor generates 5,000 MW from uranium fuel cell', () => {
        const nodes: MachineNode[] = [
            { id: '1', machineId: 'nuclear_reactor', recipeId: 'gen_nuclear', count: 1 },
            { id: '2', machineId: 'assembler_3', recipeId: 'craft_processing_unit', count: 10 } // 1200 MW consumed
        ];

        const inventory: Record<string, number> = {
            'uranium_fuel_cell': 5,
            'basic_circuit': 500,
            'advanced_circuit': 100,
            'sulfuric_acid': 50
        };

        const result = simulateIndustryTick(nodes, inventory, 10);

        expect(result.powerGenerated).toBe(5000);
        expect(result.powerEfficiency).toBe(1.0);
        expect(result.newInventory['processing_unit']).toBeGreaterThan(0);
    });

    test('Speed and productivity modules modify machine performance', () => {
        const nodeWithModules: MachineNode = {
            id: '1',
            machineId: 'assembler_3',
            recipeId: 'craft_gear',
            count: 1,
            modules: ['speed_module_1', 'productivity_module_1']
        };

        const nodes: MachineNode[] = [
            { id: 'gen', machineId: 'steam_engine', recipeId: 'gen_steam', count: 2 },
            nodeWithModules
        ];

        const inventory: Record<string, number> = {
            'coal': 100,
            'iron_ingot': 50
        };

        const result = simulateIndustryTick(nodes, inventory, 10);

        expect(result.newInventory['iron_gear']).toBeGreaterThan(0);
    });
});
