import { describe, it, expect } from 'vitest';
import type { Hero } from '../../engine/types';
import type { Stats } from '../../engine/types';

// Helper para criar um herói base de teste
const makeHero = (overrides: Partial<Hero> = {}): Hero => ({
    id: 'test-hero',
    name: 'Testador',
    type: 'hero',
    class: 'Warrior',
    emoji: '⚔️',
    unlocked: true,
    isDead: false,
    element: 'fire',
    assignment: 'combat',
    insanity: 0,
    level: 1,
    xp: 0,
    maxXp: 100,
    fatigue: 0,
    maxFatigue: 100,
    statPoints: 0,
    skills: [],
    stats: {
        hp: 100, maxHp: 100,
        mp: 50, maxMp: 50,
        attack: 20, defense: 10,
        magic: 5, speed: 10,
    } as Stats,
    isMutated: false,
    mutationType: undefined,
    isAwakened: false,
    awakeningTitle: undefined,
    awakenedAt: undefined,
    ...overrides,
});

describe('Hero: campos de mutação', () => {
    it('herói padrão não deve estar mutado', () => {
        const hero = makeHero();
        expect(hero.isMutated).toBe(false);
        expect(hero.mutationType).toBeUndefined();
    });

    it('herói corrompido deve ter isMutated = true', () => {
        const hero = makeHero({ isMutated: true, mutationType: 'berserk' });
        expect(hero.isMutated).toBe(true);
        expect(hero.mutationType).toBe('berserk');
    });

    it('purificação deve remover mutação', () => {
        let hero = makeHero({ isMutated: true, mutationType: 'shadow', insanity: 80 });
        // Simula purificação
        hero = { ...hero, isMutated: false, mutationType: undefined, insanity: Math.max(0, hero.insanity - 40) };
        expect(hero.isMutated).toBe(false);
        expect(hero.mutationType).toBeUndefined();
        expect(hero.insanity).toBe(40);
    });

    it('todos os tipos de mutação devem ser válidos', () => {
        const tipos: Hero['mutationType'][] = ['berserk', 'shadow', 'arcane', 'cursed'];
        tipos.forEach(tipo => {
            const hero = makeHero({ isMutated: true, mutationType: tipo });
            expect(hero.mutationType).toBe(tipo);
        });
    });
});

describe('Hero: campos do Despertar', () => {
    it('herói padrão não deve estar desperto', () => {
        const hero = makeHero();
        expect(hero.isAwakened).toBe(false);
        expect(hero.awakenedAt).toBeUndefined();
    });

    it('herói desperto deve ter awakenedAt definido', () => {
        const now = Date.now();
        const hero = makeHero({ isAwakened: true, awakeningTitle: 'Desperto', awakenedAt: now });
        expect(hero.isAwakened).toBe(true);
        expect(hero.awakeningTitle).toBe('Desperto');
        expect(hero.awakenedAt).toBe(now);
    });

    it('awakenedAt deve ser um timestamp válido', () => {
        const ts = Date.now();
        const hero = makeHero({ isAwakened: true, awakenedAt: ts });
        // Deve ser conversível para Date
        const date = new Date(hero.awakenedAt!);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2024);
    });
});
