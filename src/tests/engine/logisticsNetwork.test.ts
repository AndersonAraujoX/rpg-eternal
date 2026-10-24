import { describe, it, expect } from 'vitest';
import {
    createStorageHub,
    createSupplyRoute,
    createDrones,
    simulateLogisticsTick,
    type LogisticsNetworkState,
    type StorageHub
} from '../../engine/logisticsNetwork';

describe('Logistics Network Engine (Factorio-lite)', () => {
    describe('createStorageHub', () => {
        it('should create a valid storage hub with correct thresholds (Happy Path)', () => {
            // Arrange & Act
            const hub = createStorageHub('hub_iron', 'Iron Silo', 'iron_ore', 1000, 100, 900, 500);

            // Assert
            expect(hub.id).toBe('hub_iron');
            expect(hub.name).toBe('Iron Silo');
            expect(hub.itemId).toBe('iron_ore');
            expect(hub.maxCapacity).toBe(1000);
            expect(hub.minThreshold).toBe(100);
            expect(hub.maxThreshold).toBe(900);
            expect(hub.currentStock).toBe(500);
        });

        it('should throw an error when id or itemId is empty (Exception handling)', () => {
            // Arrange, Act & Assert
            expect(() => createStorageHub('', 'Iron Silo', 'iron_ore', 1000)).toThrow('valid id and itemId');
            expect(() => createStorageHub('hub_1', 'Iron Silo', '', 1000)).toThrow('valid id and itemId');
            expect(() => createStorageHub('hub_1', 'Iron Silo', 'iron_ore', 0)).toThrow('greater than zero');
        });

        it('should clamp stock within 0 and maxCapacity (Edge case)', () => {
            // Arrange & Act
            const overflownHub = createStorageHub('hub_over', 'Over', 'coal', 200, 0, 200, 9999);
            const negativeStockHub = createStorageHub('hub_neg', 'Neg', 'coal', 200, 0, 200, -50);

            // Assert
            expect(overflownHub.currentStock).toBe(200);
            expect(negativeStockHub.currentStock).toBe(0);
        });
    });

    describe('createSupplyRoute', () => {
        it('should create a valid supply route (Happy Path)', () => {
            // Arrange & Act
            const route = createSupplyRoute('r1', 'hub_mine', 'hub_smelter', 'iron_ore', 4);

            // Assert
            expect(route.id).toBe('r1');
            expect(route.sourceHubId).toBe('hub_mine');
            expect(route.targetHubId).toBe('hub_smelter');
            expect(route.itemId).toBe('iron_ore');
            expect(route.priority).toBe(4);
            expect(route.isActive).toBe(true);
        });

        it('should throw error when source and target are identical (Edge Case / Error)', () => {
            // Arrange, Act & Assert
            expect(() => createSupplyRoute('r_invalid', 'hub_same', 'hub_same', 'iron_ore')).toThrow(
                'Source and target hubs cannot be identical'
            );
        });
    });

    describe('createDrones', () => {
        it('should generate requested number of drones with tier specifications', () => {
            // Arrange & Act
            const drones = createDrones('mk2', 3);

            // Assert
            expect(drones).toHaveLength(3);
            expect(drones[0].tier).toBe('mk2');
            expect(drones[0].capacity).toBe(15);
            expect(drones[0].speed).toBe(2.0);
            expect(drones[0].status).toBe('idle');
        });

        it('should return empty array for non-positive count (Edge Case)', () => {
            // Arrange & Act
            const zeroDrones = createDrones('mk1', 0);
            const negDrones = createDrones('mk1', -5);

            // Assert
            expect(zeroDrones).toEqual([]);
            expect(negDrones).toEqual([]);
        });
    });

    describe('simulateLogisticsTick', () => {
        it('should transport items from excess source to deficit target according to priority (Happy Path)', () => {
            // Arrange
            const mineHub: StorageHub = createStorageHub('hub_mine', 'Mine', 'iron_ore', 1000, 50, 1000, 500);
            const smelterHub: StorageHub = createStorageHub('hub_smelter', 'Smelter', 'iron_ore', 500, 0, 500, 0);

            const state: LogisticsNetworkState = {
                hubs: {
                    hub_mine: mineHub,
                    hub_smelter: smelterHub
                },
                routes: [createSupplyRoute('route_iron', 'hub_mine', 'hub_smelter', 'iron_ore', 5)],
                drones: createDrones('mk1', 2), // 2 drones * 5 cap * 1.0 speed = 10 items/sec per drone
                availablePowerMW: 10.0,
                starlightSpeedBonus: 0.5 // +50% speed bonus
            };

            // Act
            const result = simulateLogisticsTick(state, 1.0);

            // Assert
            expect(result.itemsMoved['iron_ore']).toBeGreaterThan(0);
            expect(result.newState.hubs.hub_mine.currentStock).toBeLessThan(500);
            expect(result.newState.hubs.hub_smelter.currentStock).toBeGreaterThan(0);
            expect(result.efficiency).toBe(1.0);
            expect(result.powerConsumedMW).toBeGreaterThan(0);
        });

        it('should handle zero or negative deltaSeconds gracefully (Edge Case)', () => {
            // Arrange
            const state: LogisticsNetworkState = {
                hubs: {},
                routes: [],
                drones: [],
                availablePowerMW: 5.0
            };

            // Act
            const result = simulateLogisticsTick(state, 0);

            // Assert
            expect(result.itemsMoved).toEqual({});
            expect(result.powerConsumedMW).toBe(0);
            expect(result.activeDronesCount).toBe(0);
        });

        it('should fail to transport when available power is zero (Constraint / Edge Case)', () => {
            // Arrange
            const state: LogisticsNetworkState = {
                hubs: {
                    src: createStorageHub('src', 'Source', 'coal', 100, 0, 100, 100),
                    dst: createStorageHub('dst', 'Dest', 'coal', 100, 0, 100, 0)
                },
                routes: [createSupplyRoute('r1', 'src', 'dst', 'coal', 3)],
                drones: createDrones('mk1', 2),
                availablePowerMW: 0.0 // Blackout!
            };

            // Act
            const result = simulateLogisticsTick(state, 1.0);

            // Assert
            expect(result.efficiency).toBe(0);
            expect(result.itemsMoved).toEqual({});
            expect(result.newState.hubs.src.currentStock).toBe(100);
            expect(result.newState.hubs.dst.currentStock).toBe(0);
        });
    });
});
