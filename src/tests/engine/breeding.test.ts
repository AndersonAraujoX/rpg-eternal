import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateBreedingResult } from '../../engine/breeding';
import type { Pet } from '../../engine/types';

describe('Breeding Engine - calculateBreedingResult', () => {
    const mockDate = 1600000000000;

    const createMockPet = (overrides?: Partial<Pet>): Pet => ({
        id: 'test_pet',
        name: 'Test Pet',
        type: 'pet',
        rarity: 'common',
        level: 1,
        stats: { attack: 10, magic: 10, defense: 10, hp: 100, maxHp: 100, mp: 50, maxMp: 50, speed: 10 },
        bonus: 'None',
        emoji: '🐶',
        xp: 0,
        maxXp: 100,
        isDead: false,
        ...overrides
    });

    beforeEach(() => {
        vi.spyOn(Date, 'now').mockReturnValue(mockDate);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should calculate base breeding correctly with no previous fusions', () => {
        // Fix random for deterministic emoji and element selection
        vi.spyOn(Math, 'random').mockReturnValue(0.99); // Ensures no prefix, chooses parent2 element

        const parent1 = createMockPet({ name: 'Alpha Wolf', element: 'fire', ability: 'Fire Breath' });
        const parent2 = createMockPet({ name: 'Beta Bear', element: 'water', ability: 'Water Splash' });

        const result = calculateBreedingResult(parent1, parent2);

        expect(result.id).toBe(`chimera_${mockDate}`);
        expect(result.name).toBe('Alpha-Beta');
        expect(result.type).toBe('pet');
        expect(result.rarity).toBe('chimera');
        expect(result.level).toBe(1);
        expect(result.fusionCount).toBe(1);
        expect(result.parents).toEqual(['Alpha Wolf', 'Beta Bear']);
        expect(result.chimera).toBe(true);

        // Stats multiplier = 1.2
        expect(result.stats.attack).toBe(12); // Math.floor(10 * 1.2)
        expect(result.stats.hp).toBe(120);

        // Inherits ability (uses parent1.ability first)
        expect(result.ability).toBe('Fire Breath');

        // Random > 0.5 inherits parent2.element
        expect(result.element).toBe('water');

        // Bonus text
        expect(result.bonus).toBe('Fusion Power: +20% Stats');
    });

    it('should increment generation based on highest parent fusionCount and apply stats correctly', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // Ensures no prefix

        const parent1 = createMockPet({ name: 'Alpha', fusionCount: 1 });
        const parent2 = createMockPet({ name: 'Beta', fusionCount: 4 });

        const result = calculateBreedingResult(parent1, parent2);

        // Generation = max(1, 4) + 1 = 5
        expect(result.fusionCount).toBe(5);

        // Bonus = min(0.5, (5-1) * 0.1) = 0.4
        // Multiplier = 1.2 + 0.4 = 1.6
        expect(result.stats.attack).toBe(16); // Math.floor(10 * 1.6)
        expect(result.stats.hp).toBe(160);

        expect(result.bonus).toBe('Fusion Power: +60% Stats');
    });

    it('should add Void- prefix when generation > 1 and random < 0.3', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.3 triggers prefix

        const parent1 = createMockPet({ name: 'Shadow', fusionCount: 1 });
        const parent2 = createMockPet({ name: 'Light', fusionCount: 1 });

        const result = calculateBreedingResult(parent1, parent2);

        // Generation = 2. prefix logic: if generation > 1 && random < 0.3 -> 'Void-'
        expect(result.fusionCount).toBe(2);
        expect(result.name).toBe('Void-Shadow-Light');
    });

    it('should add Cosmic prefix when generation > 3 and random < 0.3', () => {
        // Needs sequence of random values because there are two random checks for prefixes
        let randomCalls = 0;
        vi.spyOn(Math, 'random').mockImplementation(() => {
            randomCalls++;
            // First check: generation > 1 && Math.random() < 0.3 -> We want this to fail so we don't get Void
            if (randomCalls === 1) return 0.5;
            // Second check: generation > 3 && Math.random() < 0.3 -> We want this to pass to get Cosmic
            if (randomCalls === 2) return 0.1;
            // Subsequent checks for emoji and element
            return 0.5;
        });

        const parent1 = createMockPet({ name: 'Star', fusionCount: 3 });
        const parent2 = createMockPet({ name: 'Moon', fusionCount: 3 });

        const result = calculateBreedingResult(parent1, parent2);

        // Generation = 4.
        expect(result.fusionCount).toBe(4);
        expect(result.name).toBe('Cosmic Star-Moon');
    });

    it('should fallback to default ability and neutral element if parents lack them', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.1);

        const parent1 = createMockPet({ name: 'A', ability: undefined, element: undefined });
        const parent2 = createMockPet({ name: 'B', ability: undefined, element: undefined });

        const result = calculateBreedingResult(parent1, parent2);

        expect(result.ability).toBe('Genetic Harmony');
        expect(result.element).toBe('neutral');
    });
});
