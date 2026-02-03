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

    const conquerSector = (sectorId: string) => {
        const sector = galaxy.find(s => s.id === sectorId);
        if (!sector || sector.isOwned) return;

        const cost = sector.level * 1000;
        if (gold >= cost) {
            setGold(g => g - cost);
            setGalaxy(prev => prev.map(s => s.id === sectorId ? { ...s, isOwned: true } : s));
            addLog(`Conquered ${sector.name}!`, 'achievement');
            soundManager.playLevelUp();
        } else {
            addLog(`Not enough gold! Need ${cost}`, 'error');
        }
    };

    const attackTerritory = (id: string) => {
        const territory = territories.find(t => t.id === id);
        if (!territory) return;

        // Simple attack logic
        addLog(`Attacking territory ${territory.name}...`, 'info');
        // Logic for success/failure usually deferred to combat engine or separate process
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

    return {
        galaxy, setGalaxy,
        territories, setTerritories,
        spaceship, setSpaceship,
        conquerSector, attackTerritory, upgradeSpaceship
    };
};
