import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../hooks/useGame';

describe('Rune Fusion & Weather Rituals Systems', () => {

    describe('Rune Fusion (Fusão de Runas)', () => {
        it('should combine 3 matching rarity runes and consume souls', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setSouls(100);
                result.current.setRunes([
                    { id: 'rune_c1', name: 'Runa da Força', stat: 'attack', value: 5, rarity: 'common', emoji: '⚔️' },
                    { id: 'rune_c2', name: 'Runa da Proteção', stat: 'defense', value: 4, rarity: 'common', emoji: '🛡️' },
                    { id: 'rune_c3', name: 'Runa da Vitalidade', stat: 'hp', value: 6, rarity: 'common', emoji: '💚' },
                    { id: 'rune_other', name: 'Runa da Rapidez', stat: 'speed', value: 1, rarity: 'common', emoji: '⚡' }
                ]);
            });

            expect(result.current.runes.length).toBe(4);

            act(() => {
                result.current.combineRunes(['rune_c1', 'rune_c2', 'rune_c3']);
            });

            // 4 runes - 3 consumed + 1 created = 2 runes total
            expect(result.current.runes.length).toBe(2);
            expect(result.current.souls).toBe(50); // 100 - 50 souls

            // Fused rune should be rare
            const fusedRune = result.current.runes.find(r => r.id !== 'rune_other');
            expect(fusedRune).toBeDefined();
            expect(fusedRune?.rarity).toBe('rare');
            expect(fusedRune?.value).toBeGreaterThan(0);
        });

        it('should fail combining if runes do not have the same rarity', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setSouls(100);
                result.current.setRunes([
                    { id: 'rune_c1', name: 'Runa da Força', stat: 'attack', value: 5, rarity: 'common', emoji: '⚔️' },
                    { id: 'rune_r1', name: 'Runa Rara', stat: 'defense', value: 12, rarity: 'rare', emoji: '🛡️' },
                    { id: 'rune_c2', name: 'Runa da Vitalidade', stat: 'hp', value: 6, rarity: 'common', emoji: '💚' }
                ]);
            });

            act(() => {
                result.current.combineRunes(['rune_c1', 'rune_r1', 'rune_c2']);
            });

            // No fusion happens
            expect(result.current.runes.length).toBe(3);
            expect(result.current.souls).toBe(100);
        });

        it('should fail combining if souls are insufficient', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setSouls(10); // Needs 50
                result.current.setRunes([
                    { id: 'rune_c1', name: 'Runa da Força', stat: 'attack', value: 5, rarity: 'common', emoji: '⚔️' },
                    { id: 'rune_c2', name: 'Runa da Proteção', stat: 'defense', value: 4, rarity: 'common', emoji: '🛡️' },
                    { id: 'rune_c3', name: 'Runa da Vitalidade', stat: 'hp', value: 6, rarity: 'common', emoji: '💚' }
                ]);
            });

            act(() => {
                result.current.combineRunes(['rune_c1', 'rune_c2', 'rune_c3']);
            });

            expect(result.current.runes.length).toBe(3);
            expect(result.current.souls).toBe(10);
        });

        it('should fail combining if selection length is not exactly 3', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setSouls(100);
                result.current.setRunes([
                    { id: 'rune_c1', name: 'Runa da Força', stat: 'attack', value: 5, rarity: 'common', emoji: '⚔️' },
                    { id: 'rune_c2', name: 'Runa da Proteção', stat: 'defense', value: 4, rarity: 'common', emoji: '🛡️' }
                ]);
            });

            act(() => {
                result.current.combineRunes(['rune_c1', 'rune_c2']);
            });

            expect(result.current.runes.length).toBe(2);
            expect(result.current.souls).toBe(100);
        });
    });

    describe('Weather Rituals (Ritual do Clima)', () => {
        it('should fail weather invocation if Altar dos Deuses building is level 0', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setSouls(200);
                result.current.setResources(r => ({ ...r, herbs: 20 }));
                result.current.setBuildings(prev => prev.map(b => b.id === 'altar_deities' ? { ...b, level: 0 } : b));
            });

            act(() => {
                result.current.invokeWeather('Aurora');
            });

            // Weather should not change
            expect(result.current.weather).toBe('Clear');
        });

        it('should change weather and deduct resources if Altar dos Deuses is level 1+', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setSouls(200);
                result.current.setResources(r => ({ ...r, herbs: 20 }));
                result.current.setBuildings(prev => prev.map(b => b.id === 'altar_deities' ? { ...b, level: 1 } : b));
            });

            act(() => {
                result.current.invokeWeather('Aurora');
            });

            expect(result.current.weather).toBe('Aurora');
            expect(result.current.weatherTimer).toBe(300);
            expect(result.current.souls).toBe(100); // 200 - 100
            expect(result.current.resources.herbs).toBe(10); // 20 - 10
        });

        it('should fail weather invocation if resources are insufficient', () => {
            const { result } = renderHook(() => useGame());

            act(() => {
                result.current.setSouls(50); // Less than 100
                result.current.setResources(r => ({ ...r, herbs: 20 }));
                result.current.setBuildings(prev => prev.map(b => b.id === 'altar_deities' ? { ...b, level: 1 } : b));
            });

            act(() => {
                result.current.invokeWeather('Rain');
            });

            expect(result.current.weather).toBe('Clear');
            expect(result.current.souls).toBe(50);
            expect(result.current.resources.herbs).toBe(20);
        });
    });
});
