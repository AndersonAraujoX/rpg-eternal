import { describe, it, expect } from 'vitest';
import {
    createInitialGenome,
    spliceGeneIntoPet,
    stabilizeGenome,
    calculateSplicedStats,
    CATALOG_GENES,
    type PetGenome
} from '../../engine/geneHacking';
import type { Stats } from '../../engine/types';

describe('Gene-Hacking Engine (Pets + SCP Foundation)', () => {
    const baseStats: Stats = {
        attack: 100,
        defense: 50,
        hp: 500,
        maxHp: 500,
        mp: 100,
        maxMp: 100,
        speed: 20
    };

    describe('createInitialGenome', () => {
        it('should initialize genome with 100% stability and Safe classification (Happy Path)', () => {
            // Arrange & Act
            const genome = createInitialGenome('pet_wolf_1');

            // Assert
            expect(genome.petId).toBe('pet_wolf_1');
            expect(genome.stability).toBe(100);
            expect(genome.containmentClass).toBe('Safe');
            expect(genome.isBreached).toBe(false);
            expect(genome.splicedGenes).toHaveLength(0);
        });

        it('should throw an error for empty petId (Exception handling)', () => {
            // Arrange, Act & Assert
            expect(() => createInitialGenome('')).toThrow('Valid petId is required');
        });
    });

    describe('spliceGeneIntoPet', () => {
        it('should add gene trait and reduce stability proportionally (Happy Path)', () => {
            // Arrange
            const genome = createInitialGenome('pet_chimera');
            const gene = CATALOG_GENES.carapace_titan; // 15 stability cost

            // Act
            const spliced = spliceGeneIntoPet(genome, gene);

            // Assert
            expect(spliced.splicedGenes).toHaveLength(1);
            expect(spliced.stability).toBe(85);
            expect(spliced.containmentClass).toBe('Safe');
            expect(spliced.isBreached).toBe(false);
        });

        it('should escalate to Keter and breach if stability reaches 0 (Edge Case)', () => {
            // Arrange
            let genome = createInitialGenome('pet_experimental');

            // Act (Splice Keter Singularity: 55 cost + Void Predator: 35 cost + Carapace: 15 cost = 105 cost)
            genome = spliceGeneIntoPet(genome, CATALOG_GENES.keter_singularity);
            genome = spliceGeneIntoPet(genome, CATALOG_GENES.void_predator);
            genome = spliceGeneIntoPet(genome, CATALOG_GENES.carapace_titan);

            // Assert
            expect(genome.stability).toBe(0);
            expect(genome.containmentClass).toBe('Keter');
            expect(genome.isBreached).toBe(true);
        });

        it('should throw error when splicing duplicate gene (Exception handling)', () => {
            // Arrange
            const genome = spliceGeneIntoPet(createInitialGenome('p1'), CATALOG_GENES.tickle_gel);

            // Act & Assert
            expect(() => spliceGeneIntoPet(genome, CATALOG_GENES.tickle_gel)).toThrow('already spliced');
        });

        it('should throw error when trying to splice into an already breached anomaly (Exception handling)', () => {
            // Arrange
            const breachedGenome: PetGenome = {
                petId: 'p_breached',
                splicedGenes: [],
                stability: 0,
                containmentClass: 'Keter',
                isBreached: true
            };

            // Act & Assert
            expect(() => spliceGeneIntoPet(breachedGenome, CATALOG_GENES.panacea_dna)).toThrow(
                'containment breach'
            );
        });
    });

    describe('stabilizeGenome', () => {
        it('should restore stability up to maximum 100% and resolve breach (Happy Path)', () => {
            // Arrange
            const unstableGenome: PetGenome = {
                petId: 'p_unstable',
                splicedGenes: [CATALOG_GENES.void_predator],
                stability: 20,
                containmentClass: 'Keter',
                isBreached: false
            };

            // Act (2 doses of stabilizer * 25 = +50 stability -> 70%)
            const stabilized = stabilizeGenome(unstableGenome, 2);

            // Assert
            expect(stabilized.stability).toBe(70);
            // Has Euclid gene (void_predator), so escalates to Euclid when stability > 60
            expect(stabilized.containmentClass).toBe('Euclid');
            expect(stabilized.isBreached).toBe(false);
        });

        it('should return unchanged genome when stabilizer amount is zero or negative (Edge Case)', () => {
            // Arrange
            const genome = createInitialGenome('p_zero');

            // Act
            const unchanged = stabilizeGenome(genome, 0);
            const unchangedNeg = stabilizeGenome(genome, -2);

            // Assert
            expect(unchanged.stability).toBe(100);
            expect(unchangedNeg.stability).toBe(100);
        });
    });

    describe('calculateSplicedStats', () => {
        it('should accurately apply multiplicative stat modifiers from spliced genes (Happy Path)', () => {
            // Arrange
            let genome = createInitialGenome('pet_striker');
            genome = spliceGeneIntoPet(genome, CATALOG_GENES.carapace_titan); // defense 1.4, speed 0.9

            // Act
            const modifiedStats = calculateSplicedStats(baseStats, genome);

            // Assert
            expect(modifiedStats.defense).toBe(70); // 50 * 1.4
            expect(modifiedStats.speed).toBe(18); // 20 * 0.9 = 18
            expect(modifiedStats.attack).toBe(100); // Unchanged
        });

        it('should return base stats without bonuses if containment is breached (Edge Case)', () => {
            // Arrange
            const breachedGenome: PetGenome = {
                petId: 'p_wild',
                splicedGenes: [CATALOG_GENES.keter_singularity],
                stability: 0,
                containmentClass: 'Keter',
                isBreached: true
            };

            // Act
            const stats = calculateSplicedStats(baseStats, breachedGenome);

            // Assert
            expect(stats).toEqual(baseStats);
        });
    });
});
