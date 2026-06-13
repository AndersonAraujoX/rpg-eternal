import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../hooks/useGame';
import { calculateGlobalModifiers } from '../../engine/modifiersManager';

describe('Industry Global Synergies', () => {

    it('should calculate global modifiers for automated dredges and hydroponic irrigation', () => {
        const industryInventory = {
            'automated_dredge': 3,
            'hydroponic_irrigation': 1,
            'starlight_microchip': 0,
            'magnetic_coil': 0
        };

        const { result } = renderHook(() => useGame(industryInventory));

        // Synergy 1: Dredges & Hydroponics
        expect(result.current.globalModifiers.collection.passiveFishPerHour).toBe(15); // 3 * 5
        expect(result.current.globalModifiers.collection.gardenSpeedMult).toBe(1.25);
    });

    it('should consume overcharged ammunition on entering dungeon and set first tick buff', async () => {
        let testInventory = {
            'overcharged_ammo': 5
        };

        const mockSetIndustryState = (updater: any) => {
            if (typeof updater === 'function') {
                const prev = { inventory: testInventory };
                const next = updater(prev);
                testInventory = next.inventory;
            }
        };

        const { result } = renderHook(() => useGame(testInventory, mockSetIndustryState));

        act(() => {
            result.current.actions.enterDungeon(1);
        });

        await new Promise(r => setTimeout(r, 10));

        // Inventory should be decremented
        expect(testInventory['overcharged_ammo']).toBe(4);
        expect(result.current.dungeonFirstTickBuff).toBe(true);
    });

    it('should apply offline bot cargo capacity boost when starlight upgrade is purchased', async () => {
        const { result } = renderHook(() => useGame());

        act(() => {
            result.current.setStarlightUpgrades({
                'bot_offline_capacity': 1
            });
        });

        await new Promise(r => setTimeout(r, 10));

        // Synergy 3: Cargo Capacity
        expect(result.current.globalModifiers.crafting.starlightOfflineCapacityBonus).toBe(1.25);
    });

    it('should apply monopoly dynamic pricing and trigger monopoly trend when stockpiling magnetic coils', async () => {
        const industryInventory = {
            'magnetic_coil': 1000
        };

        const { result } = renderHook(() => useGame(industryInventory));

        // Synergy 4: Monopoly pricing
        expect(result.current.globalModifiers.market.metalOrePriceBonus).toBe(1.5);
    });

    it('should sell raw ores and receive gold with monopoly price bonuses', async () => {
        const industryInventory = {
            'magnetic_coil': 1000
        };

        const { result } = renderHook(() => useGame(industryInventory));

        // Set resources
        act(() => {
            result.current.setResources(prev => ({
                ...prev,
                copper: 100,
                iron: 50
            }));
            result.current.setGold(0);
        });

        await new Promise(r => setTimeout(r, 10));

        // Sell 50 copper ore. Price base: 10. Monopoly bonus: 1.5. Sell Price = 15. Total gold gained: 750.
        act(() => {
            result.current.sellOre('copper', 50);
        });

        await new Promise(r => setTimeout(r, 10));

        expect(result.current.resources.copper).toBe(50);
        expect(result.current.gold).toBe(750);

        // Sell 50 iron ore. Price base: 20. Monopoly bonus: 1.5. Sell Price = 30. Total gold gained: 750 + 1500 = 2250.
        act(() => {
            result.current.sellOre('iron', 50);
        });

        await new Promise(r => setTimeout(r, 10));

        expect(result.current.resources.iron).toBe(0);
        expect(result.current.gold).toBe(2250);
    });
});
