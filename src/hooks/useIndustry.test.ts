import { renderHook } from '@testing-library/react';
import { useIndustry } from './useIndustry';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useIndustry', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('initializes with default state when localStorage is empty', () => {
        const { result } = renderHook(() => useIndustry());
        expect(result.current.inventory).toEqual({ gold: 0 });
        expect(result.current.nodes).toEqual([]);
        expect(result.current.unlockedTechs).toEqual([]);
    });

    it('loads valid state from localStorage', () => {
        const validState = {
            inventory: { gold: 100, iron_ore: 50 },
            nodes: [{ id: 'n1', machineId: 'm1', recipeId: 'r1', count: 2 }],
            unlockedTechs: ['tech1', 'tech2']
        };
        localStorage.setItem('rpg_eternal_industry', JSON.stringify(validState));

        const { result } = renderHook(() => useIndustry());
        expect(result.current.inventory).toEqual(validState.inventory);
        expect(result.current.nodes).toEqual(validState.nodes);
        expect(result.current.unlockedTechs).toEqual(validState.unlockedTechs);
    });

    it('recovers gracefully from malformed inventory', () => {
        const malformedState = {
            inventory: { gold: 'invalid', iron_ore: 50, fake: { inner: 'object' }, array: [] },
            nodes: [],
            unlockedTechs: []
        };
        localStorage.setItem('rpg_eternal_industry', JSON.stringify(malformedState));

        const { result } = renderHook(() => useIndustry());
        // Should keep valid number, drop invalid strings/objects/arrays, and ensure gold is a number
        expect(result.current.inventory).toEqual({ gold: 0, iron_ore: 50 });
    });

    it('recovers gracefully from malformed nodes', () => {
        const malformedState = {
            inventory: { gold: 0 },
            nodes: [
                { id: 'n1', machineId: 'm1', recipeId: 'r1', count: 2 }, // Valid
                { id: 'n2', machineId: 'm2' }, // Missing properties
                'invalid_string_node', // Invalid type
                { id: 123, machineId: 456, recipeId: 'r3', count: 'invalid' } // Invalid property types
            ],
            unlockedTechs: []
        };
        localStorage.setItem('rpg_eternal_industry', JSON.stringify(malformedState));

        const { result } = renderHook(() => useIndustry());
        // Should only keep the completely valid node
        expect(result.current.nodes).toEqual([{ id: 'n1', machineId: 'm1', recipeId: 'r1', count: 2 }]);
    });

    it('recovers gracefully from malformed unlockedTechs', () => {
        const malformedState = {
            inventory: { gold: 0 },
            nodes: [],
            unlockedTechs: ['tech1', 123, { object: true }, null, undefined, 'tech2']
        };
        localStorage.setItem('rpg_eternal_industry', JSON.stringify(malformedState));

        const { result } = renderHook(() => useIndustry());
        // Should only keep valid string tech names
        expect(result.current.unlockedTechs).toEqual(['tech1', 'tech2']);
    });

    it('returns default state when JSON parsing fails', () => {
        localStorage.setItem('rpg_eternal_industry', '{ invalid json }');

        const { result } = renderHook(() => useIndustry());
        expect(result.current.inventory).toEqual({ gold: 0 });
        expect(result.current.nodes).toEqual([]);
        expect(result.current.unlockedTechs).toEqual([]);
    });

    it('returns default state when parsed data is not an object', () => {
        localStorage.setItem('rpg_eternal_industry', JSON.stringify("string instead of object"));

        const { result } = renderHook(() => useIndustry());
        expect(result.current.inventory).toEqual({ gold: 0 });
        expect(result.current.nodes).toEqual([]);
        expect(result.current.unlockedTechs).toEqual([]);
    });
});
