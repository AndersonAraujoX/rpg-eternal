import { useState } from 'react';
import type { GalaxySector, Territory, Spaceship, LogEntry } from '../engine/types';
import { soundManager } from '../engine/sound';

export const useGalaxy = (
    initialGalaxy: GalaxySector[],
    initialTerritories: Territory[],
    initialSpaceship: Spaceship,
    gold: number,
    setGold: React.Dispatch<React.SetStateAction<number>>,
    addLog: (message: string, type?: LogEntry['type']) => void
) => {
    const [galaxy, setGalaxy] = useState<GalaxySector[]>(initialGalaxy);
    const [territories, setTerritories] = useState<Territory[]>(initialTerritories);
    const [spaceship, setSpaceship] = useState<Spaceship>(initialSpaceship);

    const attackSector = (sectorId: string) => {
        const sector = galaxy.find(s => s.id === sectorId);
        if (!sector || sector.isOwned) return;

        const fuelCost = 10;
        if (spaceship.fuel < fuelCost) {
            addLog("Not enough Fuel to jump!", 'error');
            return;
        }

        // Combat Logic
        const winChance = Math.min(0.95, 0.5 + ((spaceship.level - sector.level) * 0.1));
        const roll = Math.random();

        setSpaceship(prev => ({ ...prev, fuel: prev.fuel - fuelCost }));

        if (roll < winChance) {
            setGalaxy(prev => prev.map(s => s.id === sectorId ? { ...s, isOwned: true } : s));
            addLog(`Victory! ${sector.name} conquered!`, 'achievement');
            soundManager.playLevelUp();
            // Reward Loot
            const loot = sector.level * 1000;
            setGold(g => g + loot);
        } else {
            const hullDmg = 10 * sector.level;
            setSpaceship(prev => ({ ...prev, hull: Math.max(0, prev.hull - hullDmg) }));
            addLog(`Defeat! Retreating from ${sector.name}. Hull -${hullDmg}`, 'danger');
            soundManager.playHit();
        }
    };

    const attackTerritory = (id: string) => {
        addLog(`Attacking territory ${id} (WIP)`, 'info');
    };

    const upgradeSpaceship = (part: keyof Spaceship['parts']) => {
        const cost = (spaceship.parts[part] + 1) * 5000;
        if (gold >= cost) {
            setGold(g => g - cost);
            setSpaceship(prev => ({
                ...prev,
                parts: {
                    ...prev.parts,
                    [part]: prev.parts[part] + 1
                },
                level: prev.level + 1
            }));
            addLog(`Upgraded Spaceship ${part} to Level ${spaceship.parts[part] + 1}!`, 'achievement');
            soundManager.playLevelUp();
        } else {
            addLog(`Not enough gold! Need ${cost}`, 'error');
        }
    };

    const galaxyRewards = galaxy.filter(s => s.isOwned).reduce((acc, s) => {
        if (s.type === 'star') acc.gold += (s.level * 10);
        return acc;
    }, { gold: 0 });

    return {
        galaxy, setGalaxy,
        territories, setTerritories,
        spaceship, setSpaceship,
        attackSector,
        attackTerritory,
        upgradeSpaceship,
        galaxyRewards
    };
};
