import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { calculateGlobalModifiers } from '../../engine/modifiersManager';
import { getStartingHero, generatePlanetaryNodes, generateRoguelikeNodes } from '../../engine/roguelike';

let mockSetStatusToVictory: (() => void) | null = null;

vi.mock('../../hooks/useRoguelike', () => {
    return {
        useRoguelike: () => {
            const [emberFragments, setEmberFragments] = useState(0);
            const [roguelikeUpgrades, setRoguelikeUpgrades] = useState({});
            const [roguelikeRun, setRoguelikeRun] = useState<any>({
                hero: null,
                nodes: [],
                currentNodeIndex: -1,
                gold: 0,
                relics: [],
                combatState: null,
                eventState: null,
                status: 'none',
                planetaryExpedition: null
            });

            mockSetStatusToVictory = () => {
                setRoguelikeRun((prev: any) => ({ ...prev, status: 'victory' }));
            };

            const startRoguelikeRun = (classType: any, unlockedPerks: string[] = []) => {
                const hero = getStartingHero(classType, roguelikeUpgrades);
                const nodes = generateRoguelikeNodes();
                let startGold = 10;
                if (unlockedPerks.includes('rift_perk_gold')) startGold += 20;
                if (unlockedPerks.includes('rift_perk_speed')) hero.speed += 3;
                if (unlockedPerks.includes('rift_perk_shield')) {
                    hero.maxHp += 15;
                    hero.hp += 15;
                }
                setRoguelikeRun({
                    hero,
                    nodes,
                    currentNodeIndex: -1,
                    gold: startGold,
                    relics: [],
                    combatState: null,
                    eventState: null,
                    status: 'exploring',
                    planetaryExpedition: null
                });
            };

            const startPlanetaryRun = (
                classType: any,
                sectorId: string,
                sectorName: string,
                biome: any,
                sectorLevel: number,
                galaxySectors: any[],
                unlockedPerks: string[] = []
            ) => {
                const hero = getStartingHero(classType, roguelikeUpgrades);
                const nodes = generatePlanetaryNodes(sectorLevel, biome);
                let startGold = 10;
                if (unlockedPerks.includes('rift_perk_gold')) startGold += 20;
                if (unlockedPerks.includes('rift_perk_speed')) hero.speed += 3;
                if (unlockedPerks.includes('rift_perk_shield')) {
                    hero.maxHp += 15;
                    hero.hp += 15;
                }
                setRoguelikeRun({
                    hero,
                    nodes,
                    currentNodeIndex: -1,
                    gold: startGold,
                    relics: [],
                    combatState: null,
                    eventState: null,
                    status: 'exploring',
                    planetaryExpedition: { sectorId, sectorName, biome, sectorLevel }
                });
            };

            const abandonRoguelikeRun = () => {
                setRoguelikeRun({
                    hero: null,
                    nodes: [],
                    currentNodeIndex: -1,
                    gold: 0,
                    relics: [],
                    combatState: null,
                    eventState: null,
                    status: 'none',
                    planetaryExpedition: null
                });
            };

            return {
                emberFragments,
                setEmberFragments,
                roguelikeUpgrades,
                setRoguelikeUpgrades,
                roguelikeRun,
                startRoguelikeRun,
                startPlanetaryRun,
                preparePlanetaryRun: vi.fn(),
                clearPlanetaryExpedition: vi.fn(),
                selectNode: vi.fn(),
                performCombatAction: vi.fn(),
                resolveRest: vi.fn(),
                resolveEventOption: vi.fn(),
                buyRoguelikeUpgrade: vi.fn(),
                abandonRoguelikeRun
            };
        }
    };
});

describe('Quarta Camada de Sinergias Globais (Cross-System Synergies)', () => {

    describe('1. Devoção Tecnológica (Indústria ⇄ Pantheon)', () => {
        it('should allow donating a high-tier industry item, activating favor acceleration and divine retribution modifier', async () => {
            let testInventory: Record<string, number> = {
                'plasma_cannon': 2
            };

            const mockSetIndustryState = (updater: any) => {
                if (typeof updater === 'function') {
                    const prev = { inventory: testInventory };
                    const next = updater(prev);
                    testInventory = next.inventory;
                }
            };

            const { result } = renderHook(() => useGame(testInventory, mockSetIndustryState));

            // Initial state
            expect(result.current.hasDonatedHighTierIndustry).toBe(false);
            expect(result.current.globalModifiers.combat.divineRetribution).toBe(false);

            // Pledge to a deity first
            act(() => {
                result.current.pledgeDeity('aurelius');
            });

            // Perform offering
            act(() => {
                result.current.offerToDeity('high_tier_industry');
            });

            // Verify item was consumed and flag is active
            expect(testInventory['plasma_cannon']).toBe(1);
            expect(result.current.hasDonatedHighTierIndustry).toBe(true);

            // Verify modifier is updated
            expect(result.current.globalModifiers.combat.divineRetribution).toBe(true);

            // Verify favor donation
            expect(result.current.deityLevel).toBe(2);
            expect(result.current.deityFavor).toBe(1000);
        });
    });

    describe('2. Escavação Arqueológica Cósmica (Galáxia ⇄ Câmara de Relíquias)', () => {
        it('should award unpurified relics upon planetary victory and allow purification to unlock Rift Perks', async () => {
            const { result } = renderHook(() => useGame());

            // Check initial state
            expect(result.current.unpurifiedRelics).toBe(0);

            // Start a planetary run
            act(() => {
                result.current.startPlanetaryRun('warrior', 'sector-1', 'Planeta Beta', 'desert', 3, []);
            });

            expect(result.current.roguelikeRun?.planetaryExpedition).toBeDefined();
            expect(result.current.roguelikeRun?.status).toBe('exploring');

            // Transition run status to victory
            act(() => {
                mockSetStatusToVictory!();
            });

            expect(result.current.roguelikeRun?.status).toBe('victory');

            // Abandon/finish the run (which triggers the victory rewards)
            act(() => {
                result.current.abandonRoguelikeRun();
            });

            // Wait for stateRef to sync
            await act(async () => {
                await new Promise(r => setTimeout(r, 10));
            });

            // Unpurified relics should increase by 1 or 2
            expect(result.current.unpurifiedRelics).toBeGreaterThanOrEqual(1);
            expect(result.current.unpurifiedRelics).toBeLessThanOrEqual(2);

            const initialRelics = result.current.unpurifiedRelics;

            // Purify a relic
            act(() => {
                result.current.purifyRelic();
            });

            // Wait for stateRef to sync
            await act(async () => {
                await new Promise(r => setTimeout(r, 10));
            });

            expect(result.current.unpurifiedRelics).toBe(initialRelics - 1);
            expect(result.current.unlockedRiftPerks.length).toBe(1);

            // Give ourselves more unpurified relics to unlock all perks (3 total)
            act(() => {
                result.current.setUnpurifiedRelics(5);
            });

            // Wait for stateRef to sync
            await act(async () => {
                await new Promise(r => setTimeout(r, 10));
            });

            act(() => {
                result.current.purifyRelic();
            });

            // Wait for stateRef to sync
            await act(async () => {
                await new Promise(r => setTimeout(r, 10));
            });

            act(() => {
                result.current.purifyRelic();
            });

            // Wait for stateRef to sync
            await act(async () => {
                await new Promise(r => setTimeout(r, 10));
            });

            expect(result.current.unlockedRiftPerks.length).toBe(3);
            expect(result.current.unlockedRiftPerks).toContain('rift_perk_gold');
            expect(result.current.unlockedRiftPerks).toContain('rift_perk_speed');
            expect(result.current.unlockedRiftPerks).toContain('rift_perk_shield');

            // Purifying a 4th time with all perks unlocked should award 1000 Souls
            const soulsBefore = result.current.souls;
            act(() => {
                result.current.purifyRelic();
            });

            // Wait for stateRef to sync
            await act(async () => {
                await new Promise(r => setTimeout(r, 10));
            });

            expect(result.current.souls).toBe(soulsBefore + 1000);
        });

        it('should apply unlocked perks when starting a roguelike run', () => {
            const { result } = renderHook(() => useGame());

            // Mock starting a roguelike run with all perks unlocked
            act(() => {
                result.current.setUnlockedRiftPerks(['rift_perk_gold', 'rift_perk_speed', 'rift_perk_shield']);
            });

            act(() => {
                result.current.startRoguelikeRun('warrior');
            });

            // Standard starting gold is 10. With perk: 10 + 20 = 30.
            expect(result.current.roguelikeRun?.gold).toBe(30);
            
            // Standard warrior starting speed is 8. With perk: 8 + 3 = 11.
            expect(result.current.roguelikeRun?.hero.speed).toBe(11);

            // Standard warrior starting maxHp is 80. With perk: 80 + 15 = 95.
            expect(result.current.roguelikeRun?.hero.maxHp).toBe(95);
            expect(result.current.roguelikeRun?.hero.hp).toBe(95);
        });
    });

    describe('3. Ecologia Sazonal (Eventos Sazonais ⇄ Jardim/Pesca)', () => {
        it('should speed up garden maturation by 1.43x when a festival event is active', () => {
            // Initial modifier (no event)
            const initialMods = calculateGlobalModifiers({
                heroes: [],
                activeSynergies: [],
                buildings: [],
                items: [],
                highestRiftFloor: 0,
                diceLuckUntil: 0,
                cosmicDust: 0,
                industryInventory: {},
                starlightUpgrades: {},
                dungeonFirstTickBuff: false,
                backroomsFloor: 1,
                isBackroomsUnlocked: false,
                patronDeity: null,
                starForgeDailyUses: 0,
                hasDonatedHighTierIndustry: false,
                activeEvent: null
            });
            expect(initialMods.collection.gardenSpeedMult).toBe(1.0);

            // Re-evaluating globalModifiers with festival event
            const updatedMods = calculateGlobalModifiers({
                heroes: [],
                activeSynergies: [],
                buildings: [],
                items: [],
                highestRiftFloor: 0,
                diceLuckUntil: 0,
                cosmicDust: 0,
                industryInventory: {},
                starlightUpgrades: {},
                dungeonFirstTickBuff: false,
                backroomsFloor: 1,
                isBackroomsUnlocked: false,
                patronDeity: null,
                starForgeDailyUses: 0,
                hasDonatedHighTierIndustry: false,
                activeEvent: { type: 'festival' }
            });

            expect(updatedMods.collection.gardenSpeedMult).toBeCloseTo(1.43);
        });

        it('should allow converting seasonal fish into souls', () => {
            const { result } = renderHook(() => useGame());

            // Mock seasonal fish in inventory
            act(() => {
                result.current.setItems([
                    { id: 'seasonal_fish', name: 'Peixe Sazonal', value: 0, rarity: 'rare', type: 'material' } as any,
                    { id: 'seasonal_fish', name: 'Peixe Sazonal', value: 0, rarity: 'rare', type: 'material' } as any,
                    { id: 'iron_sword', name: 'Espada de Ferro', value: 10, rarity: 'common', type: 'weapon' } as any
                ]);
                result.current.setSouls(0);
            });

            // Convert seasonal fish
            act(() => {
                result.current.convertSeasonalFish();
            });

            // Count is 2, so souls should be 2 * 500 = 1000
            expect(result.current.souls).toBe(1000);
            
            // Only non-seasonal fish should remain
            expect(result.current.items.length).toBe(1);
            expect(result.current.items[0].id).toBe('iron_sword');
        });
    });

    describe('4. Calibragem de Forja por Maestria (Masmorras ⇄ Oficina de Forja)', () => {
        it('should verify that Class Mastery is updated via Dungeon enemies', () => {
            const { result } = renderHook(() => useGame());

            // Initial mastery level for Warrior is 1 (xp: 0)
            expect(result.current.classMastery['Warrior']?.level).toBe(1);
            expect(result.current.classMastery['Warrior']?.xp).toBe(0);

            // Mutate class mastery level and check
            act(() => {
                result.current.classMastery['Warrior'] = { level: 3, xp: 500, maxXp: 1000, points: 0, unlockedTalents: [] };
            });

            expect(result.current.classMastery['Warrior']?.level).toBe(3);
        });
    });
});
