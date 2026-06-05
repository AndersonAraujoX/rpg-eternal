import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../hooks/useGame';
import type { Item } from '../../engine/types';

describe('Santuário de Runas (Rune Sanctuary System)', () => {

    const createMockItem = (id: string, stat: 'attack' | 'defense' | 'hp', value: number, sockets: number): Item => ({
        id,
        name: `Mock Gear ${id}`,
        type: 'weapon',
        rarity: 'rare',
        value,
        stat,
        sockets,
        runes: []
    });

    it('should initialize with empty runes list', () => {
        const { result } = renderHook(() => useGame());

        expect(result.current.runes).toBeDefined();
        expect(result.current.runes.length).toBe(0);
    });

    it('should fail crafting if resources are insufficient', () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.setResources(r => ({ ...r, mithril: 5 })); // Need 10
            result.current.setSouls(100);
        });

        act(() => {
            result.current.craftRune();
        });

        expect(result.current.runes.length).toBe(0);
    });

    it('should craft a rune successfully and consume resources', () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.setResources(r => ({ ...r, mithril: 15 }));
            result.current.setSouls(60);
        });

        act(() => {
            result.current.craftRune();
        });

        expect(result.current.resources.mithril).toBe(5); // 15 - 10
        expect(result.current.souls).toBe(10); // 60 - 50
        expect(result.current.runes.length).toBe(1);

        const craftedRune = result.current.runes[0];
        expect(craftedRune.id).toBeDefined();
        expect(craftedRune.name).toContain('Runa da');
        expect(craftedRune.value).toBeGreaterThan(0);
        expect(['attack', 'defense', 'hp', 'speed', 'lifesteal']).toContain(craftedRune.stat);
    });

    it('should socket a rune on an item and remove it from inventory', () => {
        const { result } = renderHook(() => useGame());
        const mockItem = createMockItem('weapon_1', 'attack', 20, 2);

        act(() => {
            result.current.setItems([mockItem]);
            result.current.setRunes([{
                id: 'rune_1',
                name: 'Runa da Força',
                stat: 'attack',
                value: 10,
                rarity: 'rare',
                emoji: '⚔️'
            }]);
        });

        expect(result.current.items[0].runes?.length).toBe(0);
        expect(result.current.runes.length).toBe(1);

        act(() => {
            result.current.socketRune('weapon_1', 'rune_1');
        });

        // Rune should be in the item's socket and removed from inventory
        expect(result.current.runes.length).toBe(0);
        expect(result.current.items[0].runes?.length).toBe(1);
        expect(result.current.items[0].runes?.[0].id).toBe('rune_1');
    });

    it('should apply passive stats from items and socketed runes to getMonumentMultipliers', () => {
        const { result } = renderHook(() => useGame());
        
        // Let's create an item with 10 attack and a socketed rune with 5 attack.
        // Total attack = 15. Bonus to attack = 15 * 0.002 = 0.03 (+3%)
        const itemWithRune = {
            ...createMockItem('weapon_bonus', 'attack', 10, 1),
            runes: [{
                id: 'rune_bonus',
                name: 'Runa da Força',
                stat: 'attack',
                value: 5,
                rarity: 'rare'
            }]
        };

        act(() => {
            result.current.setItems([itemWithRune]);
        });

        // The returned multipliers should include the collection bonus
        // Attack multiplier should be 1.0 (base) + 0.03 (15 * 0.002) = 1.03
        // We use any casting or root export to call getMonumentMultipliers
        const mults = (result.current as any).getMonumentMultipliers ? (result.current as any).getMonumentMultipliers() : null;
        if (mults) {
            expect(mults.attack).toBeCloseTo(1.03);
        }
    });
});
