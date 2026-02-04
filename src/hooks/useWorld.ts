import { useState, useEffect } from 'react';
import type { Tower, RiftState, LogEntry, RiftBlessing, Formation } from '../engine/types';
import { generateDungeon, type DungeonState } from '../engine/dungeon';
import type { WeatherType } from '../engine/weather';

import { soundManager } from '../engine/sound';

export const useWorld = (
    initialTower: Tower,
    initialRiftState: RiftState,
    addLog: (message: string, type?: LogEntry['type']) => void
) => {
    const [tower, setTower] = useState<Tower>(initialTower);
    const [dungeonActive, setDungeonActive] = useState(false);
    const [dungeonTimer, setDungeonTimer] = useState(0);
    const [activeRift, setActiveRift] = useState<any>(null);
    const [riftState, setRiftState] = useState<RiftState>(initialRiftState);
    const [riftTimer, setRiftTimer] = useState(0);

    const [dungeonState, setDungeonState] = useState<DungeonState | null>(null);

    const enterTower = () => {
        if (tower.active) return;
        setTower(prev => ({ ...prev, active: true }));
        addLog('Entering the Infinite Tower...', 'info');
    };

    const prestigeTower = () => {
        if (tower.floor < 10) return;
        setTower(prev => ({
            ...prev,
            floor: 1,
            maxFloor: Math.max(prev.maxFloor, prev.floor),
            active: false
        }));
        addLog('Tower Prestiged! Received Tower Souls.', 'achievement');
        soundManager.playLevelUp();
    };

    const enterDungeon = (bossLevel: number) => {
        if (dungeonActive) return;
        const level = 1 + Math.floor(bossLevel / 5);
        const newState = generateDungeon(level);
        setDungeonState(newState);
        setDungeonActive(true);
        setDungeonTimer(3600); // 1 hour
        addLog(`Entered Dungeon Level ${level}!`, 'action');
    };

    const exitDungeon = () => {
        setDungeonActive(false);
        setDungeonTimer(0);
        setDungeonState(null);
        addLog('Left the dungeon.', 'info');
    };

    const moveDungeon = (dx: number, dy: number) => {
        if (!dungeonState || !dungeonState.active) return;

        const { grid, width, height, playerPos, revealed } = dungeonState;
        const nx = playerPos.x + dx;
        const ny = playerPos.y + dy;

        // Bounds Check
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;

        // Wall Check
        const cell = grid[ny][nx];
        if (cell === 'wall') {
            addLog("It's a wall.", 'info');
            return;
        }

        // Lock Check
        if (typeof cell === 'string' && cell.startsWith('lock_')) {
            addLog("The door is locked by elemental energy.", 'danger');
            return;
        }

        // Move
        const newPos = { x: nx, y: ny };
        const newRevealed = revealed.map(row => [...row]);

        // Reveal Fog (Radius 1)
        for (let ry = -1; ry <= 1; ry++) {
            for (let rx = -1; rx <= 1; rx++) {
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
        } else if (cell === 'enemy') {
            addLog("Encountered an Enemy!", 'battle');
            const newGrid = grid.map(row => [...row]);
            newGrid[ny][nx] = 'empty'; // Consumed
            setDungeonState(prev => prev ? ({ ...prev, grid: newGrid }) : null);
            soundManager.playHit();
        } else if (cell === 'trap') {
            addLog("Stepped on a Trap!", 'danger');
            const newGrid = grid.map(row => [...row]);
            newGrid[ny][nx] = 'empty';
            setDungeonState(prev => prev ? ({ ...prev, grid: newGrid }) : null);
            soundManager.playHit();
        } else if (cell === 'exit') {
            addLog("Found the Exit! Dungeon Cleared!", 'achievement');
            setDungeonActive(false);
            setDungeonState(null);
            soundManager.playLevelUp();
        }
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
        weather, setWeather,
        weatherTimer, setWeatherTimer,
        formations, setFormations,
        enterTower, prestigeTower,
        enterDungeon, exitDungeon, moveDungeon,
        enterRift, exitRift, startRift, selectBlessing,
        saveFormation, loadFormation, deleteFormation
    };
};


