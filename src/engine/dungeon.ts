

export type DungeonCellType = 'empty' | 'wall' | 'chest' | 'enemy' | 'boss' | 'trap' | 'start' | 'exit' | string; // string for locks like lock_fire or hazards

export type BiomeType = 'neutral' | 'fire' | 'ice' | 'nature' | 'dark';

export interface DungeonMob {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    damage: number;
    type: 'mob' | 'boss';
    xp: number;
    element?: BiomeType;
}

export interface DungeonState {
    active: boolean;
    level: number;
    biome: BiomeType;
    width: number;
    height: number;
    grid: DungeonCellType[][];
    playerPos: { x: number; y: number };
    revealed: boolean[][];
    keys: { [key: string]: number }; // e.g. { fire: 1, water: 0 }
}

export interface DungeonInteraction {
    type: 'chest' | 'enemy' | 'trap' | 'lock' | 'exit' | 'boss' | 'hazard';
    level: number;
    subtype?: string; // for lock type or enemy name
    mob?: DungeonMob;
}

export const DUNGEON_WIDTH = 15;

export const DUNGEON_HEIGHT = 15;

export const generateDungeon = (level: number): DungeonState => {
    const width = DUNGEON_WIDTH;
    const height = DUNGEON_HEIGHT;

    // Pick random biome based on level or pure random
    const biomes: BiomeType[] = ['neutral', 'fire', 'ice', 'nature', 'dark'];
    // Higher probability of elemental biomes at deeper levels
    const biome = level > 5 ? biomes[Math.floor(Math.random() * biomes.length)] : 'neutral';

    // 1. Initialize empty grid
    let grid: DungeonCellType[][] = Array(height).fill(null).map(() => Array(width).fill('empty'));

    // 2. Add randomized walls (avoiding borders slightly for playability)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.25) { // 25% Wall chance
                grid[y][x] = 'wall';
            }
        }
    }

    // 2.5 Add Hazards based on Biome
    if (biome !== 'neutral') {
        const hazardType = `hazard_${biome}`;
        const hazardCount = 5 + Math.floor(level / 3);
        const findEmpty = (): { x: number, y: number } => {
            let x, y;
            let tries = 0;
            do {
                x = Math.floor(Math.random() * width);
                y = Math.floor(Math.random() * height);
                tries++;
            } while (grid[y][x] !== 'empty' && tries < 50);
            return { x, y };
        };

        for (let i = 0; i < hazardCount; i++) {
            const pos = findEmpty();
            if (grid[pos.y][pos.x] === 'empty') {
                grid[pos.y][pos.x] = hazardType;
            }
        }
    }


    // 3. Helper to find empty spot
    const findEmpty = (): { x: number, y: number } => {
        let x, y;
        do {
            x = Math.floor(Math.random() * width);
            y = Math.floor(Math.random() * height);
        } while (grid[y][x] !== 'empty');
        return { x, y };
    };

    // 4. Place Start
    const start = findEmpty();
    grid[start.y][start.x] = 'start';
    // Clear area around start to prevent instant blocking
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    dirs.forEach(([dx, dy]) => {
        const ny = start.y + dy, nx = start.x + dx;
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) grid[ny][nx] = 'empty';
    });

    // 5. Place Exit (ensure it's somewhat far - simple check: manhattan dist > 5)
    let exit;
    let attempts = 0;
    do {
        exit = findEmpty();
        attempts++;
    } while ((Math.abs(exit.x - start.x) + Math.abs(exit.y - start.y) < 8) && attempts < 100);
    grid[exit.y][exit.x] = 'exit';

    // 5b. Place Boss (Guaranteed)
    let bossPlaced = false;
    // Try adjacent to exit
    const adj = [
        { x: exit.x + 1, y: exit.y }, { x: exit.x - 1, y: exit.y },
        { x: exit.x, y: exit.y + 1 }, { x: exit.x, y: exit.y - 1 }
    ].filter(p => p.x >= 0 && p.x < width && p.y >= 0 && p.y < height && grid[p.y][p.x] === 'empty');

    if (adj.length > 0) {
        const bp = adj[Math.floor(Math.random() * adj.length)];
        grid[bp.y][bp.x] = 'boss';
        bossPlaced = true;
    } else {
        // Fallback: Find any empty spot far from start
        for (let fy = 0; fy < height; fy++) {
            for (let fx = 0; fx < width; fx++) {
                const dist = Math.abs(fx - start.x) + Math.abs(fy - start.y);
                if (grid[fy][fx] === 'empty' && dist > 5) {
                    grid[fy][fx] = 'boss';
                    bossPlaced = true;
                    break;
                }
            }
            if (bossPlaced) break;
        }
    }

    // 6. Place Entities (Scale with level?)
    const chestCount = 3 + Math.floor(level / 10);
    const enemyCount = 5 + Math.floor(level / 5);
    const trapCount = 2 + Math.floor(level / 10);

    for (let i = 0; i < chestCount; i++) {
        const pos = findEmpty();
        grid[pos.y][pos.x] = 'chest';
    }
    for (let i = 0; i < enemyCount; i++) {
        const pos = findEmpty();
        grid[pos.y][pos.x] = 'enemy';
    }
    for (let i = 0; i < trapCount; i++) {
        const pos = findEmpty();
        grid[pos.y][pos.x] = 'trap';
    }

    // 8. Place Elemental Locks (Puzzle Dungeons)
    const lockCount = 1 + Math.floor(level / 10); // Reduced slightly as they block path
    // Locks match current biome or secondary
    const possibleLocks = biome === 'neutral' ? ['fire', 'water', 'nature', 'dark'] : [biome];

    for (let i = 0; i < lockCount; i++) {
        const pos = findEmpty();
        const element = possibleLocks[Math.floor(Math.random() * possibleLocks.length)];
        // Only place locks if not blocking critical path (hard to solve simply, so just careful placement or low count)
        grid[pos.y][pos.x] = `lock_${element}` as DungeonCellType;
    }

    // 7. Initialize Fog of War (All False)
    // Reveal start area
    const revealed = Array(height).fill(false).map(() => Array(width).fill(false));
    revealed[start.y][start.x] = true;
    dirs.forEach(([dx, dy]) => {
        const ny = start.y + dy, nx = start.x + dx;
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) revealed[ny][nx] = true;
    });

    return {
        active: true,
        level,
        biome,
        width,
        height,
        grid,
        playerPos: start,
        revealed,
        keys: { fire: 0, water: 0, nature: 0, earth: 0, air: 0, light: 0, dark: 0 }
    };
};
