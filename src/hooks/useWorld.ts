import { useState } from 'react';
import type { Tower, RiftState, LogEntry, RiftBlessing, Formation } from '../engine/types';
import { generateDungeon, type DungeonState } from '../engine/dungeon';
import type { WeatherType } from '../engine/weather';

import { soundManager } from '../engine/sound';

export const useWorld = (
    initialTower: Tower,
    initialRiftState: RiftState,
    addLog: (message: string, type?: LogEntry['type']) => void,
    dungeonMastery?: import('../engine/types').DungeonMastery
) => {
    const [tower, setTower] = useState<Tower>(initialTower);
    const [dungeonActive, setDungeonActive] = useState(false);
    const [dungeonTimer, setDungeonTimer] = useState(0);
    const [activeRift, setActiveRift] = useState<any>(null);
    const [riftState, setRiftState] = useState<RiftState>(initialRiftState);
    const [riftTimer, setRiftTimer] = useState(0);

    const [dungeonState, setDungeonState] = useState<DungeonState | null>(null);
    const [maxDungeonDepth, setMaxDungeonDepth] = useState(1);

    const enterDungeon = (_bossLevel: number) => {
        if (dungeonActive) return;
        const level = 1; // Always start at 1 for now, or use maxDungeonDepth to resume? Let's start at 1.
        const newState = generateDungeon(level);
        setDungeonState(newState);
        setDungeonActive(true);
        setDungeonTimer(3600); // 1 hour
        addLog(`Entered Dungeon Level ${level}!`, 'action');
    };

    const descendDungeon = () => {
        if (!dungeonState) return;
        const nextLevel = dungeonState.level + 1;
        const newState = generateDungeon(nextLevel);
        setDungeonState(newState);
        if (nextLevel > maxDungeonDepth) setMaxDungeonDepth(nextLevel);
        addLog(`Descended to Dungeon Level ${nextLevel}!`, 'action');
        soundManager.playLevelUp(); // Re-use sound
    };

    const exitDungeon = () => {
        setDungeonActive(false);
        setDungeonTimer(0);
        setDungeonState(null);
        addLog('Left the dungeon.', 'info');
    };

    const addDungeonKey = (element: string) => {
        if (!dungeonState) return;
        setDungeonState(prev => prev ? ({
            ...prev,
            keys: { ...prev.keys, [element]: (prev.keys[element] || 0) + 1 }
        }) : null);
        addLog(`Found a ${element} Key!`, 'loot');
    };

    const moveDungeon = (dx: number, dy: number): import('../engine/dungeon').DungeonInteraction | null => {
        if (!dungeonState || !dungeonState.active) return null;

        const { grid, width, height, playerPos, revealed, level } = dungeonState;
        const nx = playerPos.x + dx;
        const ny = playerPos.y + dy;

        // Bounds Check
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return null;

        // Wall Check
        const cell = grid[ny][nx];
        if (cell === 'wall') {
            addLog("It's a wall.", 'info');
            return null;
        }

        // Lock Check
        if (typeof cell === 'string' && cell.startsWith('lock_')) {
            const element = cell.split('_')[1];
            if ((dungeonState.keys[element] || 0) > 0) {
                addLog(`Unlocked ${element} Door!`, 'success');
                const newKeys = { ...dungeonState.keys, [element]: dungeonState.keys[element] - 1 };
                const newGrid = grid.map(row => [...row]);
                newGrid[ny][nx] = 'empty';

                // Unlock AND Move
                const newPos = { x: nx, y: ny };
                const newRevealed = revealed.map(row => [...row]);
                // Reveal around new pos
                for (let ry = -1; ry <= 1; ry++) {
                    for (let rx = -1; rx <= 1; rx++) {
                        const rny = ny + ry;
                        const rnx = nx + rx;
                        if (rny >= 0 && rny < height && rnx >= 0 && rnx < width) {
                            newRevealed[rny][rnx] = true;
                        }
                    }
                }
                setDungeonState(prev => prev ? ({ ...prev, grid: newGrid, keys: newKeys, playerPos: newPos, revealed: newRevealed }) : null);
                soundManager.playLevelUp(); // Unlock sound
                return { type: 'lock', level, subtype: element };
            } else {
                addLog(`The door is locked by ${element} energy. You need a ${element} Key.`, 'danger');
                return { type: 'lock', level, subtype: element };
            }
        }

        // Hazard Check
        if (typeof cell === 'string' && cell.startsWith('hazard_')) {
            const hazardType = cell;
            const element = hazardType.split('_')[1];
            // Simple damage for now
            const damage = level * 10;
            addLog(`Ouch! Stepped on ${element} hazard! Took ${damage} damage.`, 'danger');
            soundManager.playHit();
            // In a real health system we would reduce player health, but here we just log it or maybe fail move?
            // Let's allow move but log damage.
            // If we had a health system for the dungeon adventurer we'd deduct it.
            // For now, minimal impact.
        }

        // Move
        const newPos = { x: nx, y: ny };
        const newRevealed = revealed.map(row => [...row]);

        // Reveal Fog (Radius 1 + Explorer Level)
        const radius = 1 + (dungeonMastery?.explorerLevel || 0);
        for (let ry = -radius; ry <= radius; ry++) {
            for (let rx = -radius; rx <= radius; rx++) {
                const rny = ny + ry;
                const rnx = nx + rx;
                if (rny >= 0 && rny < height && rnx >= 0 && rnx < width) {
                    newRevealed[rny][rnx] = true;
                }
            }
        }

        // Update State
        setDungeonState(prev => prev ? ({ ...prev, playerPos: newPos, revealed: newRevealed }) : null);

        // Event Handling
        if (cell === 'chest') {
            addLog("Found a Treasure Chest!", 'success');
            const newGrid = grid.map(row => [...row]);
            newGrid[ny][nx] = 'empty';
            setDungeonState(prev => prev ? ({ ...prev, grid: newGrid }) : null);
            soundManager.playLevelUp(); // Fallback for coin sound
            return { type: 'chest', level };
        } else if (cell === 'enemy') {
            const mobs = ['Goblin', 'Skeleton', 'Orc', 'Slime', 'Bat', 'Spider'];
            const name = mobs[Math.floor(Math.random() * mobs.length)];
            addLog(`Encountered a ${name}!`, 'battle');
            const newGrid = grid.map(row => [...row]);
            newGrid[ny][nx] = 'empty'; // Consumed
            setDungeonState(prev => prev ? ({ ...prev, grid: newGrid }) : null);
            soundManager.playHit();

            const mob: import('../engine/dungeon').DungeonMob = {
                name,
                level,
                hp: level * 20,
                maxHp: level * 20,
                damage: level * 5,
                type: 'mob',
                xp: level * 10
            };
            return { type: 'enemy', level, mob };
        } else if (cell === 'boss') {
            addLog("⚠️ BOSS ENCOUNTER! ⚠️", 'danger');
            // Boss doesn't disappear immediately? For now let's consume it.
            const newGrid = grid.map(row => [...row]);
            newGrid[ny][nx] = 'empty';
            setDungeonState(prev => prev ? ({ ...prev, grid: newGrid }) : null);
            soundManager.playHit(); // Epic sound later

            // Create Mob Data
            const bossMob: import('../engine/dungeon').DungeonMob = {
                name: "Dungeon Boss",
                level: level + 2,
                hp: level * 1000,
                maxHp: level * 1000,
                damage: level * 50,
                type: 'boss',
                xp: level * 500
            };

            return { type: 'boss', level, mob: bossMob };
        } else if (cell === 'trap') {
            // Trap Sense: Avoid chance (10% per level)
            const avoidChance = (dungeonMastery?.trapSenseLevel || 0) * 0.1;
            if (Math.random() < avoidChance) {
                addLog('Spotted and disarmed a trap!', 'success');
                const newGrid = grid.map(row => [...row]);
                newGrid[ny][nx] = 'empty';
                setDungeonState(prev => prev ? ({ ...prev, grid: newGrid, playerPos: newPos, revealed: newRevealed }) : null);
                soundManager.playHit();
                return null;
            }

            addLog("Stepped on a TRAP!", 'danger');
            const newGrid = grid.map(row => [...row]);
            newGrid[ny][nx] = 'empty';
            setDungeonState(prev => prev ? ({ ...prev, grid: newGrid }) : null);
            soundManager.playHit(); // Damage sound
            return { type: 'trap', level };
        } else if (cell === 'exit') {
            addLog("Found the Exit! Dungeon Cleared!", 'achievement');
            setDungeonActive(false);
            setDungeonState(null);
            soundManager.playLevelUp();
            return { type: 'exit', level };
        }
        return null;
    };

    const enterRift = (rift: any) => {
        setActiveRift(rift);
        setRiftTimer(1800); // 30 mins
        addLog(`Entered Challenge Rift: ${rift.name}`, 'info');
    };

    const exitRift = (success: boolean) => {
        if (success) addLog('Rift Completed!', 'achievement');
        else addLog('Rift Failed...', 'error');
        setActiveRift(null);
        setRiftTimer(0);
        setRiftState(prev => ({ ...prev, active: false }));
    };

    const startRift = () => {
        setRiftState(prev => ({ ...prev, active: true, floor: 1, blessings: [] }));
        addLog('Temporal Rift Stabilized. Beginning descent.', 'info');
    };

    const selectBlessing = (blessing: RiftBlessing) => {
        setRiftState(prev => ({
            ...prev,
            blessings: [...prev.blessings, blessing]
        }));
        addLog(`Acquired Rift Blessing: ${blessing.name}`, 'achievement');
    };

    const [weather, setWeather] = useState<WeatherType>('Clear');
    const [weatherTimer, setWeatherTimer] = useState(300);
    const [formations, setFormations] = useState<Formation[]>([]);

    const saveFormation = (name: string, heroIds: string[]) => {
        const formation: Formation = { id: Date.now().toString(), name, heroIds };
        setFormations(prev => [...prev, formation]);
        addLog(`Saved Formation: ${name}`, 'info');
    };

    const loadFormation = (id: string) => {
        const formation = formations.find(f => f.id === id);
        return formation;
    };

    const deleteFormation = (id: string) => {
        setFormations(prev => prev.filter(f => f.id !== id));
    };

    return {
        tower, setTower,
        dungeonActive, setDungeonActive,
        dungeonTimer, setDungeonTimer,
        activeRift, setActiveRift,
        riftState, setRiftState,
        riftTimer, setRiftTimer,
        dungeonState, setDungeonState,
        maxDungeonDepth, setMaxDungeonDepth,
        weather, setWeather,
        weatherTimer, setWeatherTimer,
        formations, setFormations,
        enterDungeon, exitDungeon, moveDungeon, descendDungeon, addDungeonKey,
        enterRift, exitRift, startRift, selectBlessing,
        saveFormation, loadFormation, deleteFormation
    };
};


