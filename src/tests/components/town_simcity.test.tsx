import { describe, it, expect } from 'vitest';
import type { Building, Hero } from '../../engine/types';
import {
    generateRoadNetwork,
    getRoadTier,
    areBuildingsAdjacent,
    calculateTownMetrics,
    autoOrganizeTown,
    ZONING_SYNERGIES_DEFINITIONS
} from '../../engine/townEngine';
import { INITIAL_BUILDINGS } from '../../data/buildings';

describe('SimCity Town Engine & MMORPG Road System', () => {
    const mockBuildings: Building[] = INITIAL_BUILDINGS.map(b => ({ ...b }));
    const mockHeroes: Hero[] = [
        { id: 'h1', name: 'Guerreiro', unlocked: true, level: 10 } as any,
        { id: 'h2', name: 'Mago', unlocked: true, level: 12 } as any,
        { id: 'h3', name: 'Curandeiro', unlocked: false, level: 5 } as any,
    ];

    describe('Road Tiers & Auto-Tiling', () => {
        it('assigns correct road tiers based on Town Hall level', () => {
            expect(getRoadTier(0)).toBe('dirt');
            expect(getRoadTier(1)).toBe('dirt');
            expect(getRoadTier(2)).toBe('cobblestone');
            expect(getRoadTier(5)).toBe('stone_paved');
            expect(getRoadTier(8)).toBe('imperial_marble');
            expect(getRoadTier(10)).toBe('imperial_marble');
        });

        it('generates a connected road network that reaches placed buildings', () => {
            const buildingsWithPlacement = mockBuildings.map(b => {
                if (b.id === 'town_hall') return { ...b, level: 5, placed: true, x: 0, y: 0 };
                if (b.id === 'forge_workshop') return { ...b, level: 1, placed: true, x: 5, y: 5 };
                return b;
            });

            const roads = generateRoadNetwork(buildingsWithPlacement, 8);
            expect(roads.size).toBeGreaterThan(0);
            
            // Check that roads do not overlap placed building cells
            expect(roads.has('0,0')).toBe(false); // Town Hall origin
            expect(roads.has('5,5')).toBe(false); // Forge origin

            // Check that main avenues and connection junctions exist
            expect(roads.has('3,0')).toBe(true);
            expect(roads.has('0,4')).toBe(true);
        });
    });

    describe('Zoning Synergies and Adjacency', () => {
        it('detects when two buildings are adjacent', () => {
            const buildingA: Building = { ...mockBuildings[0], placed: true, x: 1, y: 1, width: 2, height: 2 };
            const buildingBAdjacent: Building = { ...mockBuildings[1], placed: true, x: 3, y: 1, width: 2, height: 1 };
            const buildingCFar: Building = { ...mockBuildings[2], placed: true, x: 6, y: 6, width: 1, height: 1 };

            expect(areBuildingsAdjacent(buildingA, buildingBAdjacent)).toBe(true);
            expect(areBuildingsAdjacent(buildingA, buildingCFar)).toBe(false);
        });

        it('activates Industrial District synergy when Forge and Warehouse are adjacent', () => {
            const buildingsWithSynergy = mockBuildings.map(b => {
                if (b.id === 'forge_workshop') return { ...b, level: 1, placed: true, x: 1, y: 1, width: 1, height: 1 };
                if (b.id === 'warehouse') return { ...b, level: 1, placed: true, x: 2, y: 1, width: 1, height: 1 };
                return b;
            });

            const metrics = calculateTownMetrics(buildingsWithSynergy, mockHeroes);
            const industrial = metrics.synergies.find(s => s.id === 'industrial_district');
            expect(industrial?.active).toBe(true);
            expect(metrics.activeSynergiesCount).toBeGreaterThanOrEqual(1);
        });
    });

    describe('SimCity Town Metrics', () => {
        it('calculates population, prosperity score, and tax revenue accurately', () => {
            const testBuildings = mockBuildings.map(b => {
                if (b.id === 'town_hall') return { ...b, level: 3, placed: true, x: 0, y: 0 };
                if (b.id === 'tavern') return { ...b, level: 2, placed: true, x: 2, y: 0 };
                if (b.id === 'barracks') return { ...b, level: 2, placed: true, x: 0, y: 2 };
                return b;
            });

            const metrics = calculateTownMetrics(testBuildings, mockHeroes);
            expect(metrics.population).toBeGreaterThan(50);
            expect(metrics.prosperity).toBeGreaterThanOrEqual(5);
            expect(metrics.prosperity).toBeLessThanOrEqual(100);
            expect(metrics.taxRatePerHour).toBeGreaterThan(100);
            expect(metrics.roadTier).toBe('cobblestone');
        });
    });

    describe('Auto-Organize City Layout', () => {
        it('places all unlocked buildings without overlapping on the 8x8 grid', () => {
            const unplacedBuildings = mockBuildings.map((b, i) => ({
                ...b,
                level: 1,
                placed: false,
                x: undefined,
                y: undefined
            }));

            const organized = autoOrganizeTown(unplacedBuildings, 8);
            const placedList = organized.filter(b => b.placed);

            expect(placedList.length).toBeGreaterThan(5);

            // Verify no overlaps
            const occupied = new Set<string>();
            placedList.forEach(b => {
                expect(b.x).toBeDefined();
                expect(b.y).toBeDefined();
                expect(b.x! + b.width).toBeLessThanOrEqual(8);
                expect(b.y! + b.height).toBeLessThanOrEqual(8);

                for (let x = b.x!; x < b.x! + b.width; x++) {
                    for (let y = b.y!; y < b.y! + b.height; y++) {
                        const key = `${x},${y}`;
                        expect(occupied.has(key)).toBe(false);
                        occupied.add(key);
                    }
                }
            });
        });
    });
});
