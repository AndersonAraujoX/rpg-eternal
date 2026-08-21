import type { Building, Hero } from './types';

export type RoadTileType = 
    | 'single' 
    | 'straight_h' 
    | 'straight_v' 
    | 'corner_ne' 
    | 'corner_nw' 
    | 'corner_se' 
    | 'corner_sw' 
    | 't_north' 
    | 't_south' 
    | 't_east' 
    | 't_west' 
    | 'cross' 
    | 'plaza';

export type RoadTier = 'dirt' | 'cobblestone' | 'stone_paved' | 'imperial_marble';

export interface RoadTileInfo {
    x: number;
    y: number;
    type: RoadTileType;
    tier: RoadTier;
    hasLamp?: boolean;
    isLit?: boolean;
    hasBanner?: boolean;
}

export interface ZoningSynergy {
    id: string;
    name: string;
    description: string;
    buildingA: string;
    buildingB: string;
    bonusType: 'gold' | 'materials' | 'xp' | 'attack' | 'prosperity';
    bonusValue: number; // e.g. 0.10 for +10%
    active: boolean;
}

export interface TownMetrics {
    population: number;
    prosperity: number; // 0 - 100
    taxRatePerHour: number;
    placedBuildingsCount: number;
    totalBuildingsCount: number;
    synergies: ZoningSynergy[];
    activeSynergiesCount: number;
    roadTier: RoadTier;
}

export const ZONING_SYNERGIES_DEFINITIONS: Omit<ZoningSynergy, 'active'>[] = [
    {
        id: 'industrial_district',
        name: 'Distrito Industrial',
        description: 'Forja ao lado do Armazém (+10% Eficiência de Materiais & Forja)',
        buildingA: 'forge_workshop',
        buildingB: 'warehouse',
        bonusType: 'materials',
        bonusValue: 0.10
    },
    {
        id: 'civic_commerce',
        name: 'Centro Comercial e Cívico',
        description: 'Taverna ao lado da Prefeitura (+15% Renda de Impostos)',
        buildingA: 'tavern',
        buildingB: 'town_hall',
        bonusType: 'gold',
        bonusValue: 0.15
    },
    {
        id: 'arcane_sanctuary',
        name: 'Santuário Arcano',
        description: 'Altar das Almas ao lado da Biblioteca (+10% Ganho de XP Global)',
        buildingA: 'altar',
        buildingB: 'library',
        bonusType: 'xp',
        bonusValue: 0.10
    },
    {
        id: 'military_quarter',
        name: 'Quartel General Militar',
        description: 'Barracas ao lado da Sede da Guilda (+5% Dano de Ataque Global)',
        buildingA: 'barracks',
        buildingB: 'guild_hall',
        bonusType: 'attack',
        bonusValue: 0.05
    },
    {
        id: 'nature_harvest',
        name: 'Cinturão Agrícola',
        description: 'Jardim Místico ao lado da Cais de Pesca (+10% Recursos Naturais)',
        buildingA: 'mystic_garden',
        buildingB: 'fishing_dock',
        bonusType: 'materials',
        bonusValue: 0.10
    }
];

/**
 * Calculates the current road tier based on Town Hall level.
 */
export function getRoadTier(townHallLevel: number): RoadTier {
    if (townHallLevel >= 8) return 'imperial_marble';
    if (townHallLevel >= 5) return 'stone_paved';
    if (townHallLevel >= 2) return 'cobblestone';
    return 'dirt';
}

/**
 * Generates an intelligent procedural road network that connects the town center (and Town Hall)
 * to all placed buildings.
 */
export function generateRoadNetwork(buildings: Building[], gridSize: number = 8): Map<string, RoadTileInfo> {
    const roadMap = new Map<string, RoadTileInfo>();
    const key = (x: number, y: number) => `${x},${y}`;

    const townHall = buildings.find(b => b.id === 'town_hall');
    const townHallLevel = townHall?.level || 0;
    const tier = getRoadTier(townHallLevel);

    // Reserved path cross (main avenues)
    const mainAvenueX = 3;
    const mainAvenueY = 4;

    for (let i = 0; i < gridSize; i++) {
        roadMap.set(key(mainAvenueX, i), { x: mainAvenueX, y: i, type: 'straight_v', tier });
        roadMap.set(key(i, mainAvenueY), { x: i, y: mainAvenueY, type: 'straight_h', tier });
    }

    // Connect all placed buildings to the main avenues
    const placedBuildings = buildings.filter(b => b.placed && b.x !== undefined && b.y !== undefined);

    placedBuildings.forEach(b => {
        const bx = b.x!;
        const by = b.y!;

        // Building perimeter access points
        const accessPoints = [
            { x: Math.max(0, bx - 1), y: by },
            { x: Math.min(gridSize - 1, bx + b.width), y: by },
            { x: bx, y: Math.max(0, by - 1) },
            { x: bx, y: Math.min(gridSize - 1, by + b.height) }
        ];

        // Pick nearest access point and connect to main avenue
        accessPoints.forEach(pt => {
            // Horizontal connection
            const startX = Math.min(pt.x, mainAvenueX);
            const endX = Math.max(pt.x, mainAvenueX);
            for (let x = startX; x <= endX; x++) {
                if (!roadMap.has(key(x, pt.y))) {
                    roadMap.set(key(x, pt.y), { x, y: pt.y, type: 'straight_h', tier });
                }
            }

            // Vertical connection
            const startY = Math.min(pt.y, mainAvenueY);
            const endY = Math.max(pt.y, mainAvenueY);
            for (let y = startY; y <= endY; y++) {
                if (!roadMap.has(key(mainAvenueX, y))) {
                    roadMap.set(key(mainAvenueX, y), { x: mainAvenueX, y, type: 'straight_v', tier });
                }
            }
        });
    });

    // Remove roads occupied by buildings
    placedBuildings.forEach(b => {
        for (let x = b.x!; x < b.x! + b.width; x++) {
            for (let y = b.y!; y < b.y! + b.height; y++) {
                roadMap.delete(key(x, y));
            }
        }
    });

    // Auto-tile classification (Calculate exact connection type for each tile)
    const finalizedMap = new Map<string, RoadTileInfo>();

    roadMap.forEach((road, k) => {
        const x = road.x;
        const y = road.y;

        const north = roadMap.has(key(x, y - 1));
        const south = roadMap.has(key(x, y + 1));
        const east = roadMap.has(key(x + 1, y));
        const west = roadMap.has(key(x - 1, y));

        let type: RoadTileType = 'single';

        const connectionCount = (north ? 1 : 0) + (south ? 1 : 0) + (east ? 1 : 0) + (west ? 1 : 0);

        if (connectionCount === 4) {
            type = 'cross';
        } else if (connectionCount === 3) {
            if (!north) type = 't_south';
            else if (!south) type = 't_north';
            else if (!east) type = 't_west';
            else type = 't_east';
        } else if (connectionCount === 2) {
            if (north && south) type = 'straight_v';
            else if (east && west) type = 'straight_h';
            else if (north && east) type = 'corner_ne';
            else if (north && west) type = 'corner_nw';
            else if (south && east) type = 'corner_se';
            else if (south && west) type = 'corner_sw';
        } else if (connectionCount === 1) {
            type = north || south ? 'straight_v' : 'straight_h';
        }

        // Add lamps and banners at key junctions
        const hasLamp = (type === 'cross' || type.startsWith('t_') || (x === 1 && y === 1) || (x === 6 && y === 6));
        const hasBanner = (type === 'cross' || (x === mainAvenueX && y === mainAvenueY));

        finalizedMap.set(k, {
            ...road,
            type,
            hasLamp,
            hasBanner
        });
    });

    return finalizedMap;
}

/**
 * Checks if two buildings are adjacent (touching horizontally or vertically).
 */
export function areBuildingsAdjacent(a: Building, b: Building): boolean {
    if (!a.placed || !b.placed || a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) {
        return false;
    }

    const aLeft = a.x;
    const aRight = a.x + a.width - 1;
    const aTop = a.y;
    const aBottom = a.y + a.height - 1;

    const bLeft = b.x;
    const bRight = b.x + b.width - 1;
    const bTop = b.y;
    const bBottom = b.y + b.height - 1;

    // Check if bounding boxes touch (distance <= 1)
    const xOverlap = Math.max(0, Math.min(aRight, bRight) - Math.max(aLeft, bLeft) + 1);
    const yOverlap = Math.max(0, Math.min(aBottom, bBottom) - Math.max(aTop, bTop) + 1);

    const xDistance = aLeft > bRight ? aLeft - bRight : bLeft > aRight ? bLeft - aRight : 0;
    const yDistance = aTop > bBottom ? aTop - bBottom : bTop > aRight ? bTop - bBottom : 0;

    return (xDistance <= 1 && yOverlap > 0) || (yDistance <= 1 && xOverlap > 0);
}

/**
 * Calculates all SimCity town metrics: population, prosperity, taxes, and zoning synergies.
 */
export function calculateTownMetrics(buildings: Building[], heroes: Hero[] = []): TownMetrics {
    const townHall = buildings.find(b => b.id === 'town_hall');
    const townHallLevel = townHall?.level || 0;
    const placedBuildings = buildings.filter(b => b.placed && b.level > 0);
    const totalBuildingsCount = buildings.length;
    const placedBuildingsCount = placedBuildings.length;

    // Check synergies
    const synergies: ZoningSynergy[] = ZONING_SYNERGIES_DEFINITIONS.map(def => {
        const bA = buildings.find(b => b.id === def.buildingA);
        const bB = buildings.find(b => b.id === def.buildingB);
        const active = !!(bA && bB && areBuildingsAdjacent(bA, bB));
        return {
            ...def,
            active
        };
    });

    const activeSynergiesCount = synergies.filter(s => s.active).length;

    // Base Population: 10 + 25 per placed building level + 15 per unlocked hero
    const buildingLevelSum = placedBuildings.reduce((acc, b) => acc + b.level, 0);
    const unlockedHeroesCount = heroes.filter(h => h.unlocked).length;
    const population = Math.floor(20 + buildingLevelSum * 30 + unlockedHeroesCount * 15);

    // Prosperity (0 to 100): Based on town hall level, placed count, active synergies, and diversity
    const placementRatio = totalBuildingsCount > 0 ? placedBuildingsCount / totalBuildingsCount : 0;
    let prosperityScore = (townHallLevel * 6) + (placementRatio * 35) + (activeSynergiesCount * 5) + Math.min(15, buildingLevelSum);
    const prosperity = Math.min(100, Math.max(5, Math.round(prosperityScore)));

    // Tax Revenue per Hour: Base 100g * townHallLevel * (prosperity / 50) + synergy bonus
    let taxMultiplier = 1.0;
    const commerceSynergy = synergies.find(s => s.id === 'civic_commerce' && s.active);
    if (commerceSynergy) {
        taxMultiplier += commerceSynergy.bonusValue;
    }

    const taxRatePerHour = Math.floor(Math.max(50, (townHallLevel * 250 + population * 2) * (prosperity / 100) * taxMultiplier));

    return {
        population,
        prosperity,
        taxRatePerHour,
        placedBuildingsCount,
        totalBuildingsCount,
        synergies,
        activeSynergiesCount,
        roadTier: getRoadTier(townHallLevel)
    };
}

/**
 * Intelligent Auto-Organize algorithm that arranges all constructed buildings in harmonious districts.
 */
export function autoOrganizeTown(buildings: Building[], gridSize: number = 8): Building[] {
    const updated = buildings.map(b => ({ ...b }));
    const placedGrid: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    // Reserve center crossroads for avenues
    const mainAvenueX = 3;
    const mainAvenueY = 4;

    const isCellFree = (x: number, y: number, w: number, h: number): boolean => {
        if (x + w > gridSize || y + h > gridSize) return false;
        for (let ix = x; ix < x + w; ix++) {
            for (let iy = y; iy < y + h; iy++) {
                if (placedGrid[ix][iy]) return false;
                // Avoid placing directly on the primary intersection
                if (ix === mainAvenueX && iy === mainAvenueY) return false;
            }
        }
        return true;
    };

    const occupy = (x: number, y: number, w: number, h: number) => {
        for (let ix = x; ix < x + w; ix++) {
            for (let iy = y; iy < y + h; iy++) {
                placedGrid[ix][iy] = true;
            }
        }
    };

    // Placement priority: town_hall, guild_hall, barracks, forge, warehouse, etc.
    const priorityOrder = [
        'town_hall',
        'tavern',
        'guild_hall',
        'barracks',
        'forge_workshop',
        'warehouse',
        'library',
        'altar',
        'mystic_garden',
        'fishing_dock',
        'alchemy_lab',
        'expedition_post',
        'rune_sanctuary',
        'breeding_center',
        'industry',
        'celestial_observatory',
        'backrooms_manager',
        'pantheon'
    ];

    // Desired District Clusters (Top-Left: Civic, Top-Right: Military, Bottom-Left: Industrial, Bottom-Right: Arcane/Nature)
    const sortedBuildings = [...updated.filter(b => b.level > 0)].sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a.id);
        const bIndex = priorityOrder.indexOf(b.id);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    sortedBuildings.forEach(b => {
        let placed = false;

        // Try preferred slots first
        for (let y = 0; y < gridSize && !placed; y++) {
            for (let x = 0; x < gridSize && !placed; x++) {
                if (isCellFree(x, y, b.width, b.height)) {
                    const targetIndex = updated.findIndex(item => item.id === b.id);
                    if (targetIndex !== -1) {
                        updated[targetIndex].placed = true;
                        updated[targetIndex].x = x;
                        updated[targetIndex].y = y;
                        occupy(x, y, b.width, b.height);
                        placed = true;
                    }
                }
            }
        }
    });

    return updated;
}
