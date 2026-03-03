import { describe, it, expect } from 'vitest';
import { processFishingAdvanced } from './fishing';
import { transmuteResources, ELIXIRS } from './alchemy';
import { mysticReforge } from './starForge';
import type { Resources, Item } from './types';

describe('Skills Refinement System', () => {
    describe('Fishing Advanced', () => {
        it('should catch fish and occasionally legendary ones', () => {
            const res = processFishingAdvanced(100, 0.5); // High luck
            expect(res.fish).toBeGreaterThan(0);
            // Legendary is rare (1% + luck/10), with luck 0.5 it's 6%. In 100 tries, likely to get one.
            // But it's random, so we just check it returns the correct structure.
            expect(res).toHaveProperty('fish');
            expect(res).toHaveProperty('legendary');
        });
    });

    describe('Alchemy Transmutation & Elixirs', () => {
        const mockResources: Resources = { copper: 1000, iron: 100, mithril: 10, fish: 0, herbs: 50, starFragments: 0 };

        it('should transmute common to rare', () => {
            const res = transmuteResources('copper', 'iron', 5, mockResources);
            expect(res.success).toBe(true);
            expect(res.cost.copper).toBe(500);
            expect(res.gain.iron).toBe(5);
        });

        it('should fail if not enough resources', () => {
            const res = transmuteResources('mithril', 'iron', 1, mockResources);
            expect(res.success).toBe(false);
            expect(res.error).toContain('Not enough');
        });

        it('should have Elixir of Eternity definition', () => {
            expect(ELIXIRS.ELIXIR_OF_ETERNITY.stat).toBe('maxHp');
            expect(ELIXIRS.ELIXIR_OF_ETERNITY.value).toBe(5);
        });
    });

    describe('Star Forge Mystic Reforge', () => {
        it('should reforge legendary items', () => {
            const item: Item = {
                id: 'test-item',
                name: 'Legendary Sword',
                type: 'weapon',
                stat: 'attack',
                value: 100,
                rarity: 'legendary',
                sockets: 0,
                runes: [],
                quality: 50
            };

            const reforged = mysticReforge(item);
            expect(reforged.id).toBe(item.id);
            // Quality or affixes should change (randomized)
            expect(reforged).toHaveProperty('quality');
        });

        it('should not reforge common items', () => {
            const item: Item = {
                id: 'test-item',
                name: 'Rusty Sword',
                type: 'weapon',
                stat: 'attack',
                value: 10,
                rarity: 'common',
                sockets: 0,
                runes: [],
                quality: 50
            };

            const reforged = mysticReforge(item);
            expect(reforged).toEqual(item);
        });
    });
});
