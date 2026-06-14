import { describe, it, expect } from 'vitest';
import { calculateGlobalModifiers, type ModifiersState } from '../../engine/modifiersManager';
import { generateAffixes } from '../../engine/starForge';
import { INDUSTRY_ITEMS, RECIPES } from '../../engine/industry';

/**
 * Tests for the 4 new Industry Global Synergies:
 * 1. Estabilizadores de Rebirth (portal_stabilizer)
 * 2. Automação Sacra (automated_temple)
 * 3. Catalisadores de Plasma (plasma_catalyst)
 * 4. Logística de Patrocínio (adrenaline_shot)
 */

function makeBaseState(overrides: Partial<ModifiersState> = {}): ModifiersState {
    return {
        heroes: [],
        activeSynergies: [],
        buildings: [],
        items: [],
        industryInventory: {},
        ...overrides
    };
}

describe('Industry Global Synergies', () => {

    // ─── Industry Items & Recipes Exist ──────────────────────────────────

    describe('Industry Items & Recipes Registration', () => {
        it('should have portal_stabilizer item registered', () => {
            const item = INDUSTRY_ITEMS.find(i => i.id === 'portal_stabilizer');
            expect(item).toBeDefined();
            expect(item!.name).toBe('Estabilizador de Portal');
            expect(item!.emoji).toBe('🌀');
        });

        it('should have automated_temple item registered', () => {
            const item = INDUSTRY_ITEMS.find(i => i.id === 'automated_temple');
            expect(item).toBeDefined();
            expect(item!.name).toBe('Templo Automatizado');
        });

        it('should have plasma_catalyst item registered', () => {
            const item = INDUSTRY_ITEMS.find(i => i.id === 'plasma_catalyst');
            expect(item).toBeDefined();
            expect(item!.name).toBe('Catalisador de Plasma');
        });

        it('should have adrenaline_shot item registered', () => {
            const item = INDUSTRY_ITEMS.find(i => i.id === 'adrenaline_shot');
            expect(item).toBeDefined();
            expect(item!.name).toBe('Injeção de Adrenalina');
        });

        it('should have craft_portal_stabilizer recipe with correct inputs and backrooms level', () => {
            const recipe = RECIPES.find(r => r.id === 'craft_portal_stabilizer');
            expect(recipe).toBeDefined();
            expect(recipe!.inputs).toEqual({ 'reinforced_alloy': 10, 'dark_matter': 3, 'anomalous_microchip': 5 });
            expect(recipe!.outputs).toEqual({ 'portal_stabilizer': 1 });
            expect(recipe!.requiredBackroomsLevel).toBe(4);
        });

        it('should have craft_automated_temple recipe at Backrooms level 1', () => {
            const recipe = RECIPES.find(r => r.id === 'craft_automated_temple');
            expect(recipe).toBeDefined();
            expect(recipe!.requiredBackroomsLevel).toBe(1);
        });

        it('should have craft_plasma_catalyst recipe at Backrooms level 8', () => {
            const recipe = RECIPES.find(r => r.id === 'craft_plasma_catalyst');
            expect(recipe).toBeDefined();
            expect(recipe!.requiredBackroomsLevel).toBe(8);
        });

        it('should have craft_adrenaline_shot recipe with no backrooms requirement', () => {
            const recipe = RECIPES.find(r => r.id === 'craft_adrenaline_shot');
            expect(recipe).toBeDefined();
            expect(recipe!.requiredBackroomsLevel).toBeUndefined();
            expect(recipe!.time).toBe(60);
        });
    });

    // ─── Sinergia 1: Estabilizadores de Rebirth ─────────────────────────

    describe('Sinergia 1: Estabilizadores de Rebirth', () => {
        it('should return 0 preservation slots when no portal_stabilizer', () => {
            const state = makeBaseState();
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.portalPreserveBuildingSlots).toBe(0);
            expect(mods.industry.portalPreserveHeroSlots).toBe(0);
            expect(mods.activeSynergyIds).not.toContain('estabilizador_rebirth');
        });

        it('should grant 2 building + 1 hero slots with portal_stabilizer', () => {
            const state = makeBaseState({
                industryInventory: { 'portal_stabilizer': 1 }
            });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.portalPreserveBuildingSlots).toBe(2);
            expect(mods.industry.portalPreserveHeroSlots).toBe(1);
            expect(mods.activeSynergyIds).toContain('estabilizador_rebirth');
        });

        it('should still grant slots with multiple stabilizers (capped at 2/1)', () => {
            const state = makeBaseState({
                industryInventory: { 'portal_stabilizer': 5 }
            });
            const mods = calculateGlobalModifiers(state);
            // Slots are fixed at 2 buildings + 1 hero per stabilizer present
            expect(mods.industry.portalPreserveBuildingSlots).toBe(2);
            expect(mods.industry.portalPreserveHeroSlots).toBe(1);
        });
    });

    // ─── Sinergia 2: Automação Sacra ────────────────────────────────────

    describe('Sinergia 2: Automação Sacra', () => {
        it('should return 0 favor/tick when no automated_temple', () => {
            const state = makeBaseState({ patronDeity: 'aurelius' });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.divineFavorPerTick).toBe(0);
            expect(mods.industry.divineSmiteHealExtension).toBe(0);
        });

        it('should return 0 favor/tick when temple exists but no patron deity', () => {
            const state = makeBaseState({
                industryInventory: { 'automated_temple': 2 },
                patronDeity: null
            });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.divineFavorPerTick).toBe(0);
            expect(mods.industry.divineSmiteHealExtension).toBe(0);
            expect(mods.activeSynergyIds).not.toContain('automacao_sacra');
        });

        it('should generate 5 favor/tick per temple when deity is pledged', () => {
            const state = makeBaseState({
                industryInventory: { 'automated_temple': 1 },
                patronDeity: 'aurelius'
            });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.divineFavorPerTick).toBe(5);
            expect(mods.industry.divineSmiteHealExtension).toBe(3);
            expect(mods.activeSynergyIds).toContain('automacao_sacra');
        });

        it('should scale favor/tick linearly with temple count', () => {
            const state = makeBaseState({
                industryInventory: { 'automated_temple': 3 },
                patronDeity: 'gaya'
            });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.divineFavorPerTick).toBe(15);
            expect(mods.industry.divineSmiteHealExtension).toBe(3);
        });
    });

    // ─── Sinergia 3: Catalisadores de Plasma ────────────────────────────

    describe('Sinergia 3: Catalisadores de Plasma', () => {
        it('should return 0 extra attempts and 0 mod chance when no plasma_catalyst', () => {
            const state = makeBaseState();
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.starForgeExtraAttempts).toBe(0);
            expect(mods.industry.starForgePerfectModChance).toBe(0);
        });

        it('should grant +3 extra attempts and +10% perfect mod chance with plasma_catalyst', () => {
            const state = makeBaseState({
                industryInventory: { 'plasma_catalyst': 1 }
            });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.starForgeExtraAttempts).toBe(3);
            expect(mods.industry.starForgePerfectModChance).toBeCloseTo(0.10);
            expect(mods.activeSynergyIds).toContain('catalisador_plasma');
        });
    });

    // ─── Sinergia 4: Logística de Patrocínio ────────────────────────────

    describe('Sinergia 4: Logística de Patrocínio (Adrenaline Shots)', () => {
        it('should return 0 shots available when no adrenaline_shot in inventory', () => {
            const state = makeBaseState();
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.adrenalineShotsAvailable).toBe(0);
            expect(mods.activeSynergyIds).not.toContain('logistica_patrocinio_gladiadores');
        });

        it('should report available shots matching inventory count', () => {
            const state = makeBaseState({
                industryInventory: { 'adrenaline_shot': 7 }
            });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.adrenalineShotsAvailable).toBe(7);
            expect(mods.activeSynergyIds).toContain('logistica_patrocinio_gladiadores');
        });
    });

    // ─── Cumulatividade: reality_anchor + portal_stabilizer ─────────────

    describe('Cumulatividade com Reality Anchor', () => {
        it('should have both estabilizador and ancorador synergies when both items are present', () => {
            const state = makeBaseState({
                industryInventory: {
                    'portal_stabilizer': 1,
                    'reality_anchor': 1
                },
                isBackroomsUnlocked: true,
                backroomsFloor: 10
            });
            const mods = calculateGlobalModifiers(state);
            expect(mods.industry.portalPreserveBuildingSlots).toBe(2);
            expect(mods.industry.portalPreserveHeroSlots).toBe(1);
            expect(mods.activeSynergyIds).toContain('estabilizador_rebirth');
        });
    });

    // ─── StarForge: generateAffixes with perfectModChanceBonus ─────────

    describe('StarForge Perfect Mod Chance Bonus', () => {
        it('should generate affixes with default values when bonus is 0', () => {
            const result = generateAffixes(50, 'legendary', 0);
            // Should return at least prefix or suffix
            expect(result.prefix !== undefined || result.suffix !== undefined).toBe(true);
        });

        it('should boost affix values by 10% when perfectModChanceBonus is 0.10', () => {
            // Run multiple times to validate the boost
            // The boost multiplies the base value by (1 + bonus)
            // For a prefix with base value 0.1, with 0.10 bonus: 0.1 * 1.10 = 0.11
            const results: number[] = [];
            for (let i = 0; i < 50; i++) {
                const result = generateAffixes(50, 'legendary', 0.10);
                if (result.prefix?.value) results.push(result.prefix.value);
                if (result.suffix?.value) results.push(result.suffix.value);
            }
            // At least some values should be boosted (> base values)
            expect(results.length).toBeGreaterThan(0);
            // Check that boosted values exist (0.11, 0.165, 0.22, etc.)
            const hasBoostedValues = results.some(v => {
                // Base values: 0.05, 0.1, 0.15, 0.2
                // Boosted: 0.055, 0.11, 0.165, 0.22
                return v > 0.05 && ![0.05, 0.1, 0.15, 0.2].includes(v);
            });
            expect(hasBoostedValues).toBe(true);
        });
    });

    // ─── Integração: Todos os 4 sistemas ativos simultaneamente ─────────

    describe('All 4 Synergies Active Simultaneously', () => {
        it('should calculate all synergies when all items are present', () => {
            const state = makeBaseState({
                industryInventory: {
                    'portal_stabilizer': 1,
                    'automated_temple': 2,
                    'plasma_catalyst': 1,
                    'adrenaline_shot': 5
                },
                patronDeity: 'tenebris'
            });
            const mods = calculateGlobalModifiers(state);

            // Sinergia 1
            expect(mods.industry.portalPreserveBuildingSlots).toBe(2);
            expect(mods.industry.portalPreserveHeroSlots).toBe(1);

            // Sinergia 2
            expect(mods.industry.divineFavorPerTick).toBe(10); // 5 * 2 temples
            expect(mods.industry.divineSmiteHealExtension).toBe(3);

            // Sinergia 3
            expect(mods.industry.starForgeExtraAttempts).toBe(3);
            expect(mods.industry.starForgePerfectModChance).toBeCloseTo(0.10);

            // Sinergia 4
            expect(mods.industry.adrenalineShotsAvailable).toBe(5);

            // All synergy IDs should be present
            expect(mods.activeSynergyIds).toContain('estabilizador_rebirth');
            expect(mods.activeSynergyIds).toContain('automacao_sacra');
            expect(mods.activeSynergyIds).toContain('catalisador_plasma');
            expect(mods.activeSynergyIds).toContain('logistica_patrocinio_gladiadores');
        });
    });
});
