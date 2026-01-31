
export type DungeonCellType = 'empty' | 'wall' | 'start' | 'exit' | 'chest' | 'enemy' | 'trap';

export interface DungeonState {
    active: boolean;
    level: number;
    width: number;
    height: number;
    grid: DungeonCellType[][];
    playerPos: { x: number; y: number };
    revealed: boolean[][];
}

export const DUNGEON_WIDTH = 15;

export const DUNGEON_HEIGHT = 15;

export const generateDungeon = (level: number): DungeonState => {
    const width = DUNGEON_WIDTH;
    const height = DUNGEON_HEIGHT;

    // 1. Initialize empty grid
    const grid: DungeonCellType[][] = Array(height).fill(null).map(() => Array(width).fill('empty'));

    // 2. Add randomized walls (avoiding borders slightly for playability)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.25) { // 25% Wall chance
                grid[y][x] = 'wall';
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
        width,
        height,
        grid,
        playerPos: start,
        revealed
    };
};
