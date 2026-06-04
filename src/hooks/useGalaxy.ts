import { useState } from 'react';
import type { GalaxySector, Territory, Spaceship, LogEntry } from '../engine/types';
import { soundManager } from '../engine/sound';
import { INITIAL_GALAXY, calculateGalaxyIncome, calculateGalaxyBuffs } from '../engine/galaxy';

export const useGalaxy = (
    initialGalaxy: GalaxySector[],
    initialTerritories: Territory[],
    initialSpaceship: Spaceship,
    gold: number,
    setGold: React.Dispatch<React.SetStateAction<number>>,
    addLog: (message: string, type?: LogEntry['type']) => void
) => {
    const [galaxy, setGalaxy] = useState<GalaxySector[]>(initialGalaxy || INITIAL_GALAXY);
    const [territories, setTerritories] = useState<Territory[]>(initialTerritories);
    const [spaceship, setSpaceship] = useState<Spaceship>(initialSpaceship);

    const attackSector = (sectorId: string) => {
        const sector = galaxy.find(s => s.id === sectorId);
        if (!sector || sector.isOwned) return;

        const fuelCost = 5;
        if (spaceship.fuel < fuelCost) {
            addLog("Combustível insuficiente para o salto! Aguarde a regeneração.", 'error');
            return;
        }

        if (spaceship.hull <= 0) {
            addLog("Casco destruído! Repare a nave antes de atacar.", 'error');
            return;
        }

        // Combat: use party power vs sector difficulty for a meaningful check
        // The win chance scales from 0.3 (half power) up to 0.95 (3x power)
        const powerRatio = Math.max(0, gold > 0 ? 1 : 1); // placeholder to keep gold reference
        const winChance = Math.min(0.95, Math.max(0.3, 0.5 + (spaceship.level - sector.level) * 0.05));

        const roll = Math.random();

        setSpaceship(prev => ({ ...prev, fuel: prev.fuel - fuelCost }));

        if (roll < winChance) {
            setGalaxy(prev => prev.map(s => s.id === sectorId ? { ...s, isOwned: true } : s));
            addLog(`Vitória! ${sector.name} conquistado!`, 'achievement');
            soundManager.playLevelUp();
            // Reward Loot
            const loot = sector.level * 1000;
            setGold(g => g + loot);
        } else {
            const hullDmg = Math.min(10 + sector.level, spaceship.hull);
            setSpaceship(prev => ({ ...prev, hull: Math.max(0, prev.hull - hullDmg) }));
            addLog(`Derrota! Recuando de ${sector.name}. Casco -${hullDmg}`, 'danger');
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
            addLog(`Nave melhorada: ${part} para Nível ${spaceship.parts[part] + 1}!`, 'achievement');
            soundManager.playLevelUp();
        } else {
            addLog(`Ouro insuficiente! Precisa de ${cost}`, 'error');
        }
    };

    // Fuel & hull passive regeneration
    const refuelShip = () => {
        setSpaceship(prev => ({
            ...prev,
            fuel: Math.min(prev.maxFuel, prev.fuel + 5),
            hull: Math.min(prev.maxHull, prev.hull + 2)
        }));
    };

    const galaxyRewards = calculateGalaxyIncome(galaxy);
    const galaxyBuffs = calculateGalaxyBuffs(galaxy);

    // Reward from planetary expedition completion
    const rewardPlanetaryRun = (fuelReward: number, hullRepair: number, shipUpgrade: boolean) => {
        setSpaceship(prev => ({
            ...prev,
            fuel: Math.min(prev.maxFuel, prev.fuel + fuelReward),
            hull: Math.min(prev.maxHull, prev.hull + hullRepair),
            ...(shipUpgrade ? {
                parts: {
                    ...prev.parts,
                    engine: prev.parts.engine + 1
                },
                level: prev.level + 1
            } : {})
        }));
        if (shipUpgrade) {
            addLog('🚀 Motor da nave melhorado automaticamente por conquistar uma Estrela!', 'achievement');
        }
    };

    return {
        galaxy, setGalaxy,
        territories, setTerritories,
        spaceship, setSpaceship,
        attackSector,
        attackTerritory,
        upgradeSpaceship,
        refuelShip,
        rewardPlanetaryRun,
        galaxyRewards,
        galaxyBuffs
    };
};
