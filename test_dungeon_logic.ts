
import { generateDungeon, DungeonState } from './src/engine/dungeon';

// Mock simple logging
const consoleLog = (msg: string) => console.log(`[LOG] ${msg}`);

console.log("--- STARTING DUNGEON TEST ---");

// 1. Generate Dungeon
console.log("1. Generating Dungeon Level 1...");
const dungeon = generateDungeon(1);

if (!dungeon) {
    console.error("FAILED: Dungeon generation returned null/undefined");
    process.exit(1);
}

console.log(`Dungeon Generated: ${dungeon.width}x${dungeon.height}`);
console.log(`Player Start: (${dungeon.playerPos.x}, ${dungeon.playerPos.y})`);

// 2. Validate Entities
// 2. Validate Entities
const counts = { start: 0, exit: 0, chest: 0, enemy: 0, walls: 0, boss: 0 };
dungeon.grid.forEach(row => {
    row.forEach(cell => {
        if (cell === 'start') counts.start++;
        if (cell === 'exit') counts.exit++;
        if (cell === 'chest') counts.chest++;
        if (cell === 'enemy') counts.enemy++;
        if (cell === 'wall') counts.walls++;
        if (cell === 'boss') counts.boss++;
    });
});
console.log('Entity Counts:', counts);

if (counts.start !== 1) console.error("ERROR: Incorrect number of Starts!");
if (counts.exit !== 1) console.error("ERROR: Incorrect number of Exits!");
if (counts.chest < 1) console.error("WARNING: No chests found.");
if (counts.boss > 1) console.error("WARNING: More than one boss found.");


// 3. Print Grid (Visual Check)
console.log("\n--- DUNGEON GRID ---");
const symbols: Record<string, string> = {
    'empty': '.',
    'wall': '#',
    'start': 'S',
    'exit': 'E',
    'chest': '$',
    'enemy': 'X',
    'trap': '^'
};

for (let y = 0; y < dungeon.height; y++) {
    let rowConf = "";
    for (let x = 0; x < dungeon.width; x++) {
        const cell = dungeon.grid[y][x];
        // Handle locks dynamically
        if (typeof cell === 'string' && cell.startsWith('lock')) rowConf += 'L';
        else rowConf += symbols[cell as string] || '?';
    }
    console.log(rowConf);
}

console.log("\n--- TEST COMPLETE ---");
