import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../hooks/useGame';

describe('Unification Systems: Relics, Resonance, Void Infusion & Stats Integration', () => {

    it('should buy, equip and unequip relics', () => {
        const { result } = renderHook(() => useGame());

        // 1. Buy Relic (Cálice da Eternidade)
        act(() => {
            result.current.setGold(60000);
        });
        expect(result.current.gold).toBe(60000);

        act(() => {
            result.current.actions.buyRelic('relic_chalice');
        });

        expect(result.current.ownedRelics).toContain('relic_chalice');
        expect(result.current.gold).toBe(10000);

        // 2. Equip Relic
        act(() => {
            result.current.actions.equipRelic('relic_chalice', 0);
        });
        expect(result.current.equippedRelics[0]).toBe('relic_chalice');

        // 3. Unequip Relic
        act(() => {
            result.current.actions.unequipRelic(0);
        });
        expect(result.current.equippedRelics[0]).toBe('');
    });

    it('should upgrade elemental resonance', () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.setElementalEssences({
                fire: 20, water: 0, earth: 0, wind: 0, light: 0, dark: 0, neutral: 0
            });
        });
        expect(result.current.elementalEssences.fire).toBe(20);

        act(() => {
            result.current.actions.upgradeResonance('fire');
        });

        expect(result.current.elementalResonance.fire).toBe(1);
        expect(result.current.elementalEssences.fire).toBe(10);
    });

    it('should infuse items with void', () => {
        const { result } = renderHook(() => useGame());

        const testItem = {
            id: 'test_item_1',
            name: 'Lâmina do Vazio',
            type: 'weapon',
            rarity: 'legendary',
            value: 100,
            stat: 'attack'
        } as any;

        act(() => {
            result.current.setItems([testItem]);
            result.current.setVoidMatter(100);
        });

        expect(result.current.voidMatter).toBe(100);
        expect(result.current.items.length).toBe(1);

        act(() => {
            result.current.actions.infuseItemWithVoid('test_item_1');
        });

        expect(result.current.voidMatter).toBe(50);
        expect(result.current.items[0].voidAffix).toBeDefined();
        expect(result.current.items[0].voidAffix?.id).toBeDefined();
    });
});
