/**
 * Gene-Hacking & Chimera Bioengineering Engine
 * Bridges Pet Breeding with SCP Foundation Anomalies & Containment Protocols.
 */

import type { Stats } from './types';

export type GeneClassification = 'Safe' | 'Euclid' | 'Keter';
export type GeneRarity = 'common' | 'rare' | 'epic' | 'keter';

export interface GeneTrait {
    id: string;
    name: string;
    description: string;
    classification: GeneClassification;
    rarity: GeneRarity;
    statMultipliers: Partial<Record<keyof Stats, number>>;
    stabilityCost: number; // Stability points drained from genome (0-100)
    specialAura?: string;
}

export interface PetGenome {
    petId: string;
    splicedGenes: GeneTrait[];
    stability: number; // 0 to 100
    containmentClass: GeneClassification;
    isBreached: boolean;
}

export const CATALOG_GENES: Record<string, GeneTrait> = {
    carapace_titan: {
        id: 'carapace_titan',
        name: 'Carapaça Titânica',
        description: '+40% de Defesa, -10% de Velocidade.',
        classification: 'Safe',
        rarity: 'rare',
        statMultipliers: { defense: 1.4, speed: 0.9 },
        stabilityCost: 15
    },
    tickle_gel: {
        id: 'tickle_gel',
        name: 'Membrana SCP-999',
        description: '+25% de Velocidade e Aura de Euforia na equipe.',
        classification: 'Safe',
        rarity: 'epic',
        statMultipliers: { speed: 1.25, hp: 1.15 },
        stabilityCost: 20,
        specialAura: 'Aura de Euforia (+10% dano do grupo)'
    },
    panacea_dna: {
        id: 'panacea_dna',
        name: 'Células Panaceia (SCP-500)',
        description: '+50% Max HP e regeneração passiva.',
        classification: 'Safe',
        rarity: 'epic',
        statMultipliers: { maxHp: 1.5, hp: 1.5 },
        stabilityCost: 10,
        specialAura: 'Regeneração Panaceia'
    },
    void_predator: {
        id: 'void_predator',
        name: 'Gândula do Predador do Vazio',
        description: '+60% de Dano de Ataque, -35 de Estabilidade Genética.',
        classification: 'Euclid',
        rarity: 'epic',
        statMultipliers: { attack: 1.6 },
        stabilityCost: 35
    },
    keter_singularity: {
        id: 'keter_singularity',
        name: 'Núcleo de Instabilidade Keter',
        description: '+120% Dano Mágico e Ataque, risco extremo de Brecha.',
        classification: 'Keter',
        rarity: 'keter',
        statMultipliers: { attack: 2.2, magic: 2.2 },
        stabilityCost: 55,
        specialAura: 'Colapso Dimensional'
    }
};

/**
 * Creates an empty baseline genome for a pet.
 */
export const createInitialGenome = (petId: string): PetGenome => {
    if (!petId) {
        throw new Error('Valid petId is required to create a genome.');
    }
    return {
        petId,
        splicedGenes: [],
        stability: 100,
        containmentClass: 'Safe',
        isBreached: false
    };
};

/**
 * Splices a new gene trait into an existing pet genome.
 */
export const spliceGeneIntoPet = (
    genome: PetGenome,
    gene: GeneTrait
): PetGenome => {
    if (genome.isBreached) {
        throw new Error('Cannot splice genes into a breached anomaly in containment breach.');
    }

    if (genome.splicedGenes.some(g => g.id === gene.id)) {
        throw new Error(`Gene ${gene.name} is already spliced in this genome.`);
    }

    const updatedGenes = [...genome.splicedGenes, gene];
    const newStability = Math.max(0, genome.stability - gene.stabilityCost);

    // Evaluate containment classification based on stability and highest gene class
    let containmentClass: GeneClassification = 'Safe';
    const hasKeter = updatedGenes.some(g => g.classification === 'Keter');
    const hasEuclid = updatedGenes.some(g => g.classification === 'Euclid');

    if (hasKeter || newStability <= 30) {
        containmentClass = 'Keter';
    } else if (hasEuclid || newStability <= 60) {
        containmentClass = 'Euclid';
    }

    // Zero stability results in immediate breach
    const isBreached = newStability <= 0;

    return {
        ...genome,
        splicedGenes: updatedGenes,
        stability: newStability,
        containmentClass,
        isBreached
    };
};

/**
 * Uses stabilizing catalysts (such as SCP-500 serum) to restore genome stability.
 */
export const stabilizeGenome = (
    genome: PetGenome,
    stabilizerAmount: number
): PetGenome => {
    if (stabilizerAmount <= 0) return genome;

    const restoredStability = Math.min(100, genome.stability + stabilizerAmount * 25);
    const hasKeter = genome.splicedGenes.some(g => g.classification === 'Keter');
    const hasEuclid = genome.splicedGenes.some(g => g.classification === 'Euclid');

    let containmentClass: GeneClassification = 'Safe';
    if (hasKeter || restoredStability <= 30) {
        containmentClass = 'Keter';
    } else if (hasEuclid || restoredStability <= 60) {
        containmentClass = 'Euclid';
    }

    return {
        ...genome,
        stability: restoredStability,
        containmentClass,
        isBreached: restoredStability > 0 ? false : genome.isBreached
    };
};

/**
 * Calculates modified combat stats for a pet equipped with a spliced genome.
 */
export const calculateSplicedStats = (baseStats: Stats, genome: PetGenome): Stats => {
    if (genome.isBreached) {
        // Breached pet turns against or cannot contribute organized stats
        return { ...baseStats };
    }

    const modified = { ...baseStats };

    for (const gene of genome.splicedGenes) {
        for (const [key, multiplier] of Object.entries(gene.statMultipliers)) {
            const statKey = key as keyof Stats;
            if (typeof modified[statKey] === 'number' && typeof multiplier === 'number') {
                modified[statKey] = Math.floor(modified[statKey] * multiplier);
            }
        }
    }

    return modified;
};
