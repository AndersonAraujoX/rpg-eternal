import { useState, useEffect } from 'react';
import type { Tower, RiftState, LogEntry, RiftBlessing, Formation } from '../engine/types';
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

    const [dungeonState, setDungeonState] = useState<any>(null);

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
        // Assuming generateDungeon is imported or available
        // For now, let's keep the logic simple or import what's needed.
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

    const moveDungeon = (nx: number, ny: number, grid: any[][], revealed: boolean[][], width: number, height: number) => {
        // This is a simplified version to be refined
        setDungeonState((prev: any) => prev ? ({
            ...prev,
            playerPos: { x: nx, y: ny },
            revealed,
            grid
        }) : null);
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


