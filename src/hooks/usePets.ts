import { useState } from 'react';
import type { Pet, LogEntry } from '../engine/types';
import { calculateBreedingResult } from '../engine/breeding';
import { soundManager } from '../engine/sound';

export const usePets = (
    initialPets: Pet[],
    gold: number,
    souls: number,
    setGold: React.Dispatch<React.SetStateAction<number>>,
    setSouls: React.Dispatch<React.SetStateAction<number>>,
    addLog: (message: string, type?: LogEntry['type']) => void
) => {
    const [pets, setPets] = useState<Pet[]>(initialPets);

    const breedPets = (parent1: Pet, parent2: Pet) => {
        const cost = 1000; // Base cost for breeding
        if (gold < cost) {
            addLog(`Not enough gold to breed pets! Need ${cost} Gold.`, 'error');
            return;
        }

        setGold(g => g - cost);
        const newPet = calculateBreedingResult(parent1, parent2);

        // Fusion (Chimera) explicitly consumes the parents.
        // The basic logic for consuming parents and adding the new pet is centralized here.
        setPets(prev => [...prev.filter(p => p.id !== parent1.id && p.id !== parent2.id), newPet]);

        addLog(`Successfully fused ${parent1.name} and ${parent2.name} into ${newPet.name}!`, 'achievement');
        soundManager.playLevelUp();
    };

    const feedPet = (foodType: 'gold' | 'souls', petId?: string) => {
        if (!petId && pets.length === 0) return;

        const targetPet = petId ? pets.find(p => p.id === petId) : pets[0];
        if (!targetPet) return;

        const cost = 100;
        if (foodType === 'gold' && gold < cost) return;
        if (foodType === 'souls' && souls < cost) return;

        if (foodType === 'gold') setGold(g => Math.max(0, g - cost));
        else setSouls(s => Math.max(0, s - cost));

        setPets(prev => prev.map(p => {
            if (p.id === targetPet.id) {
                const xpGain = foodType === 'gold' ? 50 : 150;
                let newXp = p.xp + xpGain;
                let newLevel = p.level;
                let newMaxXp = p.maxXp;
                const newStats = p.stats ? { ...p.stats } : { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 };

                while (newXp >= newMaxXp) {
                    newLevel++;
                    newXp -= newMaxXp;
                    newMaxXp = Math.floor(newMaxXp * 1.5);
                    newStats.attack = (newStats.attack || 0) + 1;
                    newStats.maxHp = (newStats.maxHp || 0) + 5;
                    newStats.hp = (newStats.hp || 0) + 5;
                    newStats.defense = (newStats.defense || 0) + 1;
                }

                return { ...p, level: newLevel, xp: newXp, maxXp: newMaxXp, stats: newStats };
            }
            return p;
        }));

        addLog(`Fed ${targetPet.name} with ${foodType}!`, 'action');
    };

    return {
        pets,
        setPets,
        breedPets,
        feedPet
    };
};
