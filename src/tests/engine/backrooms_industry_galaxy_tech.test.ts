import { describe, it, expect } from 'vitest';
import { calculateBackroomsTechnology } from '../../engine/backroomsTechnology';
import { BACKROOMS_RESEARCHES } from '../../engine/backrooms';
import { RECIPES, MACHINES, simulateIndustryTick, INDUSTRY_ITEMS } from '../../engine/industry';
import { INITIAL_GALAXY, calculateGalaxyIncome } from '../../engine/galaxy';

describe('🔬 Backrooms Tech Integration with Industry and Galaxy', () => {
    describe('1. Backrooms Technology & Cross Unlocks', () => {
        it('should return crossUnlocks correctly when unlocked via tech ID or floor level', () => {
            // Level 1 without tech
            const baseRes = calculateBackroomsTechnology(1, true, []);
            expect(baseRes.crossUnlocks.efficiencyModule3).toBe(false);
            expect(baseRes.crossUnlocks.antimatterReactor).toBe(false);
            expect(baseRes.crossUnlocks.warpDrive).toBe(false);

            // Tech ID unlocked
            const techRes = calculateBackroomsTechnology(1, true, ['superconductors_liminal', 'quantum_automation', 'space_warp']);
            expect(techRes.crossUnlocks.efficiencyModule3).toBe(true);
            expect(techRes.crossUnlocks.quantumAutomation).toBe(true);
            expect(techRes.crossUnlocks.warpDrive).toBe(true);

            // High floor unlocked
            const highFloorRes = calculateBackroomsTechnology(95, true, []);
            expect(highFloorRes.crossUnlocks.efficiencyModule3).toBe(true);
            expect(highFloorRes.crossUnlocks.liminalBeacons).toBe(true);
            expect(highFloorRes.crossUnlocks.quantumAutomation).toBe(true);
            expect(highFloorRes.crossUnlocks.dimensionalScience).toBe(true);
            expect(highFloorRes.crossUnlocks.cosmicRadar).toBe(true);
            expect(highFloorRes.crossUnlocks.antimatterReactor).toBe(true);
            expect(highFloorRes.crossUnlocks.hyperdenseHull).toBe(true);
            expect(highFloorRes.crossUnlocks.warpDrive).toBe(true);
            expect(highFloorRes.crossUnlocks.stellarVoidPortal).toBe(true);
        });

        it('should have all defined cross researches present in BACKROOMS_RESEARCHES', () => {
            const expectedIds = [
                'superconductors_liminal',
                'liminal_beacons',
                'quantum_automation',
                'dimensional_science_pack',
                'cosmic_radar',
                'antimatter_reactor',
                'hyperdense_alloy_hull',
                'space_warp',
                'stellar_void_portal'
            ];

            expectedIds.forEach(id => {
                const found = BACKROOMS_RESEARCHES.find(t => t.id === id);
                expect(found).toBeDefined();
                expect(found?.name).toBeDefined();
            });
        });
    });

    describe('2. Factorio Industry Recipes & Simulation', () => {
        it('should have new items, machines and recipes registered', () => {
            expect(INDUSTRY_ITEMS.find(i => i.id === 'efficiency_module_3')).toBeDefined();
            expect(INDUSTRY_ITEMS.find(i => i.id === 'quantum_inserter')).toBeDefined();
            expect(INDUSTRY_ITEMS.find(i => i.id === 'space_matter_belt')).toBeDefined();
            expect(INDUSTRY_ITEMS.find(i => i.id === 'science_dimensional')).toBeDefined();
            expect(INDUSTRY_ITEMS.find(i => i.id === 'liminal_beacon')).toBeDefined();

            expect(MACHINES.find(m => m.id === 'antimatter_reactor')).toBeDefined();
            expect(MACHINES.find(m => m.id === 'liminal_beacon_station')).toBeDefined();

            expect(RECIPES.find(r => r.id === 'craft_eff_mod_3')).toBeDefined();
            expect(RECIPES.find(r => r.id === 'craft_quantum_inserter')).toBeDefined();
            expect(RECIPES.find(r => r.id === 'craft_space_matter_belt')).toBeDefined();
            expect(RECIPES.find(r => r.id === 'craft_science_dimensional')).toBeDefined();
            expect(RECIPES.find(r => r.id === 'gen_antimatter')).toBeDefined();
        });

        it('should apply 50% power reduction with efficiency_module_3 in simulateIndustryTick', () => {
            const nodesWithoutMod = [
                { id: 'node_1', machineId: 'assembler_1', recipeId: 'craft_gear', count: 1 }
            ];
            const sim1 = simulateIndustryTick(nodesWithoutMod, {}, 1.0, 0);

            const nodesWithMod3 = [
                { id: 'node_2', machineId: 'assembler_1', recipeId: 'craft_gear', count: 1, modules: ['efficiency_module_3'] }
            ];
            const sim2 = simulateIndustryTick(nodesWithMod3, {}, 1.0, 0);

            expect(sim2.powerConsumed).toBe(sim1.powerConsumed * 0.50);
        });

        it('should boost speed with quantum inserter and liminal beacon modules', () => {
            const standardNodes = [
                { id: 'gen_1', machineId: 'solar_panel', recipeId: 'gen_solar', count: 10 },
                { id: 'node_1', machineId: 'assembler_1', recipeId: 'craft_gear', count: 1 }
            ];
            const simBase = simulateIndustryTick(standardNodes, { iron_ingot: 100 }, 1.0, 0);

            const quantumNodes = [
                { id: 'gen_1', machineId: 'solar_panel', recipeId: 'gen_solar', count: 10 },
                { id: 'node_2', machineId: 'assembler_1', recipeId: 'craft_gear', count: 1, modules: ['quantum_inserter', 'liminal_beacon'] }
            ];
            const simQuantum = simulateIndustryTick(quantumNodes, { iron_ingot: 100 }, 1.0, 0);

            expect(simQuantum.newInventory.iron_gear).toBeGreaterThan(simBase.newInventory.iron_gear || 0);
        });

        it('should produce 5000 MW power with Antimatter Reactor', () => {
            const antimatterNode = [
                { id: 'gen_node', machineId: 'antimatter_reactor', recipeId: 'gen_antimatter', count: 1 }
            ];
            const sim = simulateIndustryTick(antimatterNode, { dark_matter: 10, uranium_fuel_cell: 10 }, 1.0, 0);

            expect(sim.powerGenerated).toBe(5000);
        });
    });

    describe('3. Galaxy Exploration & Deep Space Sectors', () => {
        it('should have transdimensional deep space sectors registered in INITIAL_GALAXY', () => {
            const g16 = INITIAL_GALAXY.find(s => s.id === 'g16');
            const g17 = INITIAL_GALAXY.find(s => s.id === 'g17');
            const g18 = INITIAL_GALAXY.find(s => s.id === 'g18');

            expect(g16).toBeDefined();
            expect(g16?.name).toContain('Nexus Transdimensional');
            expect(g17).toBeDefined();
            expect(g18).toBeDefined();
        });

        it('should calculate galaxy rewards correctly including starlight and damage', () => {
            const mockOwned = INITIAL_GALAXY.map(s => ({ ...s, isOwned: true }));
            const rewards = calculateGalaxyIncome(mockOwned);

            expect(rewards.starlight).toBeGreaterThan(0);
            expect(rewards.gold).toBeGreaterThan(0);
        });
    });
});
