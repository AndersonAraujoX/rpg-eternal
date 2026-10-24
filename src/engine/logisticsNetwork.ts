/**
 * Logistics & Automated Supply Network ("Factorio-lite" engine)
 * Bridges Industry, Storage Hubs, and Starlight Automation Bots.
 */

export type DroneTier = 'mk1' | 'mk2' | 'mk3_starlight';

export interface LogisticsDrone {
    id: string;
    tier: DroneTier;
    capacity: number; // max items per trip
    speed: number; // trip units per second
    energyUsagePerSecond: number; // MW drawn when active
    status: 'idle' | 'transporting';
}

export interface StorageHub {
    id: string;
    name: string;
    itemId: string; // The primary item tracked in this hub
    currentStock: number;
    maxCapacity: number;
    minThreshold: number; // Hub requests items if below this
    maxThreshold: number; // Hub pushes items if above this
}

export interface SupplyRoute {
    id: string;
    sourceHubId: string;
    targetHubId: string;
    itemId: string;
    priority: number; // 1 (lowest) to 5 (highest)
    isActive: boolean;
}

export interface LogisticsNetworkState {
    hubs: Record<string, StorageHub>;
    routes: SupplyRoute[];
    drones: LogisticsDrone[];
    availablePowerMW: number;
    starlightSpeedBonus?: number; // e.g. 0.20 for +20% speed
}

export interface LogisticsTickResult {
    newState: LogisticsNetworkState;
    itemsMoved: Record<string, number>; // itemId -> total moved in this tick
    powerConsumedMW: number;
    activeDronesCount: number;
    efficiency: number; // 0.0 to 1.0 based on power satisfaction
}

export const DRONE_SPECS: Record<DroneTier, { capacity: number; speed: number; energyUsage: number }> = {
    mk1: { capacity: 5, speed: 1.0, energyUsage: 0.5 },
    mk2: { capacity: 15, speed: 2.0, energyUsage: 1.2 },
    mk3_starlight: { capacity: 50, speed: 3.5, energyUsage: 2.5 }
};

/**
 * Creates a new storage hub with validated constraints.
 */
export const createStorageHub = (
    id: string,
    name: string,
    itemId: string,
    maxCapacity: number,
    minThreshold: number = 0,
    maxThreshold: number = maxCapacity,
    initialStock: number = 0
): StorageHub => {
    if (!id || !itemId) {
        throw new Error('StorageHub requires valid id and itemId.');
    }
    if (maxCapacity <= 0) {
        throw new Error('Capacity must be greater than zero.');
    }
    const safeStock = Math.max(0, Math.min(initialStock, maxCapacity));
    return {
        id,
        name,
        itemId,
        currentStock: safeStock,
        maxCapacity,
        minThreshold: Math.max(0, minThreshold),
        maxThreshold: Math.min(maxCapacity, Math.max(minThreshold, maxThreshold))
    };
};

/**
 * Creates a supply route between two hubs.
 */
export const createSupplyRoute = (
    id: string,
    sourceHubId: string,
    targetHubId: string,
    itemId: string,
    priority: number = 3
): SupplyRoute => {
    if (!id || !sourceHubId || !targetHubId || !itemId) {
        throw new Error('SupplyRoute requires valid identifiers for source, target, and item.');
    }
    if (sourceHubId === targetHubId) {
        throw new Error('Source and target hubs cannot be identical.');
    }
    return {
        id,
        sourceHubId,
        targetHubId,
        itemId,
        priority: Math.max(1, Math.min(5, priority)),
        isActive: true
    };
};

/**
 * Creates a collection of drones of a given tier.
 */
export const createDrones = (tier: DroneTier, count: number): LogisticsDrone[] => {
    if (count <= 0) return [];
    const spec = DRONE_SPECS[tier];
    return Array.from({ length: count }, (_, idx) => ({
        id: `drone_${tier}_${Date.now()}_${idx}`,
        tier,
        capacity: spec.capacity,
        speed: spec.speed,
        energyUsagePerSecond: spec.energyUsage,
        status: 'idle'
    }));
};

/**
 * Pure simulation tick of the logistics network.
 * Transfers resources from sources having excess to targets having deficit.
 */
export const simulateLogisticsTick = (
    state: LogisticsNetworkState,
    deltaSeconds: number
): LogisticsTickResult => {
    if (deltaSeconds <= 0) {
        return {
            newState: state,
            itemsMoved: {},
            powerConsumedMW: 0,
            activeDronesCount: 0,
            efficiency: 1.0
        };
    }

    const hubs: Record<string, StorageHub> = JSON.parse(JSON.stringify(state.hubs));
    const itemsMoved: Record<string, number> = {};
    let totalPowerRequired = 0;

    // Filter active routes, sorted by priority descending (5 down to 1)
    const activeRoutes = [...state.routes]
        .filter(r => r.isActive)
        .sort((a, b) => b.priority - a.priority);

    // Calculate maximum available drone throughput
    const speedBonus = 1 + (state.starlightSpeedBonus || 0);
    const availableDrones = [...state.drones];
    let activeDronesCount = 0;

    // Calculate preliminary total power demand if all available drones were used
    for (const drone of availableDrones) {
        totalPowerRequired += drone.energyUsagePerSecond;
    }

    const efficiency = totalPowerRequired > 0 
        ? Math.min(1.0, state.availablePowerMW / totalPowerRequired)
        : 1.0;

    if (efficiency <= 0) {
        return {
            newState: state,
            itemsMoved: {},
            powerConsumedMW: 0,
            activeDronesCount: 0,
            efficiency: 0
        };
    }

    let droneIdx = 0;

    for (const route of activeRoutes) {
        const source = hubs[route.sourceHubId];
        const target = hubs[route.targetHubId];

        if (!source || !target) continue;
        if (source.itemId !== route.itemId || target.itemId !== route.itemId) continue;

        // Check if source has excess (above minThreshold) and target has capacity (below maxCapacity)
        const sourceAvailable = Math.max(0, source.currentStock - source.minThreshold);
        const targetCapacityLeft = Math.max(0, target.maxCapacity - target.currentStock);

        if (sourceAvailable <= 0 || targetCapacityLeft <= 0) continue;

        // Allocate drones to this route
        while (droneIdx < availableDrones.length && sourceAvailable > 0 && targetCapacityLeft > 0) {
            const drone = availableDrones[droneIdx];
            const droneEffectiveCapacity = drone.capacity * drone.speed * speedBonus * efficiency * deltaSeconds;

            const toTransfer = Math.min(
                sourceAvailable,
                targetCapacityLeft,
                droneEffectiveCapacity
            );

            if (toTransfer <= 0) break;

            source.currentStock -= toTransfer;
            target.currentStock += toTransfer;
            itemsMoved[route.itemId] = (itemsMoved[route.itemId] || 0) + toTransfer;

            drone.status = 'transporting';
            activeDronesCount++;
            droneIdx++;
            break;
        }
    }

    const powerConsumedMW = activeDronesCount > 0
        ? availableDrones.slice(0, activeDronesCount).reduce((acc, d) => acc + d.energyUsagePerSecond * efficiency, 0)
        : 0;

    return {
        newState: {
            ...state,
            hubs,
            drones: availableDrones
        },
        itemsMoved,
        powerConsumedMW,
        activeDronesCount,
        efficiency
    };
};
