import { describe, it, expect } from 'vitest';
import { brewPotion } from '../../engine/alchemy';
import type { Potion, Resources } from '../../engine/types';

describe('Alchemy Engine - brewPotion', () => {
    // Helper to create a base Potion
    const createTestPotion = (cost: { type: keyof Resources, amount: number }[]): Potion => ({
        id: 'test_potion',
        name: 'Test Potion',
        description: 'A potion for testing',
        effect: 'heal',
        value: 100,
        duration: 0,
        cost,
        emoji: '🧪'
    });

    const defaultResources: Resources = {
        copper: 0,
        iron: 0,
        mithril: 0,
        fish: 0,
        herbs: 0,
        starFragments: 0
    };

    it('should successfully brew a potion with sufficient single resource', () => {
        const potion = createTestPotion([{ type: 'herbs', amount: 10 }]);
        const resources: Resources = { ...defaultResources, herbs: 15 };

        const result = brewPotion(potion, resources);

        expect(result.success).toBe(true);
        expect(result.cost).toEqual({ herbs: 10 });
        expect(result.error).toBeUndefined();
    });

    it('should fail to brew if a resource is missing', () => {
        const potion = createTestPotion([{ type: 'herbs', amount: 10 }]);
        const resources: Resources = { ...defaultResources, herbs: 5 }; // Not enough

        const result = brewPotion(potion, resources);

        expect(result.success).toBe(false);
        expect(result.cost).toEqual({});
        expect(result.error).toBe('Not enough herbs');
    });

    it('should successfully brew with multiple resources', () => {
        const potion = createTestPotion([
            { type: 'herbs', amount: 10 },
            { type: 'mithril', amount: 5 }
        ]);
        const resources: Resources = { ...defaultResources, herbs: 10, mithril: 10 };

        const result = brewPotion(potion, resources);

        expect(result.success).toBe(true);
        expect(result.cost).toEqual({ herbs: 10, mithril: 5 });
        expect(result.error).toBeUndefined();
    });

    it('should fail if any of the multiple resources is insufficient', () => {
        const potion = createTestPotion([
            { type: 'herbs', amount: 10 },
            { type: 'mithril', amount: 5 }
        ]);
        const resources: Resources = { ...defaultResources, herbs: 15, mithril: 3 }; // Not enough mithril

        const result = brewPotion(potion, resources);

        expect(result.success).toBe(false);
        expect(result.cost).toEqual({});
        expect(result.error).toBe('Not enough mithril');
    });

    it('should apply costMultiplier correctly and round down', () => {
        const potion = createTestPotion([{ type: 'herbs', amount: 10 }]);
        const resources: Resources = { ...defaultResources, herbs: 15 };

        // 10 * 1.5 = 15. Allowed.
        const result = brewPotion(potion, resources, 1.5);

        expect(result.success).toBe(true);
        expect(result.cost).toEqual({ herbs: 15 });

        // Test round down: 10 * 1.15 = 11.5 => 11
        const result2 = brewPotion(potion, resources, 1.15);
        expect(result2.success).toBe(true);
        expect(result2.cost).toEqual({ herbs: 11 });
    });

    it('should fail if costMultiplier pushes requirement above resources', () => {
        const potion = createTestPotion([{ type: 'herbs', amount: 10 }]);
        const resources: Resources = { ...defaultResources, herbs: 15 };

        // 10 * 2.0 = 20. Fail.
        const result = brewPotion(potion, resources, 2.0);

        expect(result.success).toBe(false);
        expect(result.cost).toEqual({});
        expect(result.error).toBe('Not enough herbs');
    });

    it('should handle zero cost potions successfully', () => {
        const potion = createTestPotion([{ type: 'herbs', amount: 0 }]);
        const resources: Resources = { ...defaultResources, herbs: 0 };

        const result = brewPotion(potion, resources);

        expect(result.success).toBe(true);
        expect(result.cost).toEqual({ herbs: 0 });
        expect(result.error).toBeUndefined();
    });

    it('should handle potions with empty cost array', () => {
        const potion = createTestPotion([]);
        const resources: Resources = { ...defaultResources };

        const result = brewPotion(potion, resources);

        expect(result.success).toBe(true);
        expect(result.cost).toEqual({});
        expect(result.error).toBeUndefined();
    });
});
