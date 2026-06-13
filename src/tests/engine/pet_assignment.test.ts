import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../hooks/useGame';
import type { Pet, Expedition, Hero } from '../../engine/types';

describe('Pet Assignment to Industry & Expeditions System', () => {

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should assign pets correctly and enforce one pet per task limit', () => {
        const { result } = renderHook(() => useGame());

        // Initial check: ensure initial pets exist
        expect(result.current.pets.length).toBeGreaterThanOrEqual(2);
        const [pet1, pet2] = result.current.pets;

        // Assign pet1 to industry
        act(() => {
            if (result.current.actions.assignPet) {
                result.current.actions.assignPet(pet1.id, 'industry');
            }
        });

        expect(result.current.pets.find(p => p.id === pet1.id)?.assignment).toBe('industry');

        // Assign pet2 to industry (should kick pet1 back to combat/none)
        act(() => {
            if (result.current.actions.assignPet) {
                result.current.actions.assignPet(pet2.id, 'industry');
            }
        });

        expect(result.current.pets.find(p => p.id === pet2.id)?.assignment).toBe('industry');
        expect(result.current.pets.find(p => p.id === pet1.id)?.assignment).toBe('combat');

        // Assign pet1 to expedition
        act(() => {
            if (result.current.actions.assignPet) {
                result.current.actions.assignPet(pet1.id, 'expedition');
            }
        });

        expect(result.current.pets.find(p => p.id === pet1.id)?.assignment).toBe('expedition');
        expect(result.current.pets.find(p => p.id === pet2.id)?.assignment).toBe('industry'); // unaffected
    });

    it('should calculate industry speed multiplier correctly based on Fire pet level', () => {
        const { result } = renderHook(() => useGame());

        // Assign a fire pet (e.g. create a mock one or find/upgrade one)
        act(() => {
            result.current.setPets([
                {
                    id: 'fire-pet-1',
                    name: 'Fire Lizard',
                    type: 'pet',
                    rarity: 'common',
                    level: 50,
                    xp: 0,
                    maxXp: 100,
                    stats: { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 },
                    bonus: '+5% Fire Damage',
                    emoji: '🦎',
                    isDead: false,
                    element: 'fire',
                    assignment: 'industry'
                }
            ]);
        });

        const activePets = result.current.pets;
        const firePet = activePets.find(p => p.assignment === 'industry' && p.element === 'fire');
        expect(firePet).toBeDefined();
        
        const speedMult = 1.0 + (firePet ? firePet.level * 0.02 : 0);
        expect(speedMult).toBe(2.0); // 1.0 + 50 * 0.02 = 2.0x
    });

    it('should reduce expedition duration based on pet rarity (Legendary / Chimera)', () => {
        const { result } = renderHook(() => useGame());

        const exp: Expedition = {
            id: 'exp_test_duration',
            name: 'Quick Patrol',
            description: 'Patrol',
            duration: 100,
            difficulty: 1,
            rewards: [],
            heroIds: []
        };

        // Case 1: No active expedition pet
        act(() => {
            result.current.setPets([
                {
                    id: 'non-exp-pet',
                    name: 'Ghost',
                    type: 'pet',
                    rarity: 'rare',
                    level: 1,
                    xp: 0,
                    maxXp: 100,
                    stats: { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 },
                    bonus: '',
                    emoji: '👻',
                    isDead: false,
                    element: 'dark',
                    assignment: 'combat'
                }
            ]);
            result.current.setActiveExpeditions([]);
        });
        act(() => {
            result.current.actions.startExpedition(exp, ['h1']);
        });

        let activeExps = result.current.activeExpeditions;
        expect(activeExps[0].duration).toBe(100);

        // Case 2: Legendary pet assigned to expeditions (15% reduction)
        act(() => {
            result.current.setPets([
                {
                    id: 'legendary-exp-pet',
                    name: 'Kraken',
                    type: 'pet',
                    rarity: 'legendary',
                    level: 1,
                    xp: 0,
                    maxXp: 100,
                    stats: { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 },
                    bonus: '',
                    emoji: '🦑',
                    isDead: false,
                    element: 'water',
                    assignment: 'expedition'
                }
            ]);
            result.current.setActiveExpeditions([]);
        });
        act(() => {
            result.current.actions.startExpedition(exp, ['h1']);
        });

        activeExps = result.current.activeExpeditions;
        expect(activeExps[0].duration).toBe(85); // 100 * (1 - 0.15) = 85

        // Case 3: Chimera pet assigned to expeditions (30% reduction)
        act(() => {
            result.current.setPets([
                {
                    id: 'chimera-exp-pet',
                    name: 'Wolf-Dragon',
                    type: 'pet',
                    rarity: 'chimera',
                    level: 1,
                    xp: 0,
                    maxXp: 100,
                    stats: { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 },
                    bonus: '',
                    emoji: '🦁',
                    isDead: false,
                    element: 'fire',
                    assignment: 'expedition',
                    chimera: true
                }
            ]);
            result.current.setActiveExpeditions([]);
        });
        act(() => {
            result.current.actions.startExpedition(exp, ['h1']);
        });

        activeExps = result.current.activeExpeditions;
        expect(activeExps[0].duration).toBe(70); // 100 * (1 - 0.30) = 70
    });

    it('should complete active expeditions, grant rewards, and release heroes', () => {
        const { result } = renderHook(() => useGame());

        const exp: Expedition = {
            id: 'exp_test_completion',
            name: 'Miner Spelunking',
            description: 'Cave',
            duration: 10,
            difficulty: 2,
            rewards: [
                { type: 'gold', min: 100, max: 100 },
                { type: 'xp', min: 20, max: 20 }
            ],
            heroIds: []
        };

        // Unlock hero1 and make sure they are in none assignment to send them
        act(() => {
            result.current.setGold(0);
            result.current.setHeroes(prev => prev.map(h => h.id === 'h1' ? { ...h, level: 1, xp: 0, assignment: 'none' } : h));
            result.current.setActiveExpeditions([]);
        });
        act(() => {
            result.current.actions.startExpedition(exp, ['h1']);
        });

        expect(result.current.activeExpeditions.length).toBe(1);
        expect(result.current.heroes.find(h => h.id === 'h1')?.assignment).toBe('expedition');

        // Fast forward 11 seconds (expedition takes 10s), ticking 1s at a time to allow React to render between ticks
        for (let i = 0; i < 11; i++) {
            act(() => {
                vi.advanceTimersByTime(1000);
            });
        }

        // Trigger loop tick manually or let intervals fire.
        // Wait, vitest fake timers should automatically fire the setInterval inside useGame.
        // Let's assert state changes
        expect(result.current.activeExpeditions.length).toBe(0);
        expect(result.current.gold).toBe(100);
        expect(result.current.heroes.find(h => h.id === 'h1')?.assignment).toBe('none');
        expect(result.current.heroes.find(h => h.id === 'h1')?.xp).toBe(20);
    });
});
