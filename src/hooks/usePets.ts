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

        // Remove parents if it's a "Fusion" (Chimera) or keep them? 
        // Existing logic in BreedingModal handles parent removal via setPets if needed,
        // but let's centralize the basic "Add Pet" logic here.
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

        if (foodType === 'gold') setGold(g => g - cost);
        else setSouls(s => s - cost);

        setPets(prev => prev.map(p => {
            if (p.id === targetPet.id) {
                const xpGain = foodType === 'gold' ? 50 : 150;
                let newXp = p.xp + xpGain;
                let newLevel = p.level;
                let newMaxXp = p.maxXp;

                while (newXp >= newMaxXp) {
                    newLevel++;
                    newXp -= newMaxXp;
                    newMaxXp = Math.floor(newMaxXp * 1.5);
                }

                return { ...p, level: newLevel, xp: newXp, maxXp: newMaxXp };
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
