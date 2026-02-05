import { useState } from 'react';

export const useAscension = (initialDivinity: number = 0, initialAscensions: number = 0) => {
    const [divinity, setDivinity] = useState(initialDivinity);
    const [ascensionCount, setAscensionCount] = useState(initialAscensions);

    const calculateDivinityGain = (totalGold: number, totalSouls: number, towerFloor: number) => {
        // Simple formula: 1 Divinity per 1M Gold (lifetime), 1000 Souls, 10 Tower Floors
        // For now using current resources as proxy for lifetime if lifetime not tracked perfectly
        if (towerFloor < 100) return 0;

        const fromGold = Math.floor(totalGold / 1_000_000);
        const fromSouls = Math.floor(totalSouls / 1_000);
        const fromTower = Math.floor(towerFloor / 10);

        return Math.floor((fromGold + fromSouls + fromTower) * (1 + (ascensionCount * 0.1)));
    };

    const performAscension = (gain: number) => {
        setDivinity(prev => prev + gain);
        setAscensionCount(prev => prev + 1);
    };

    return {
        divinity, setDivinity,
        ascensionCount, setAscensionCount,
        calculateDivinityGain,
        performAscension
    };
};
