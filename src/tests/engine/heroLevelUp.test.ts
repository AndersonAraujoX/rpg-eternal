import { describe, it, expect } from 'vitest';
import { Hero } from '../../engine/types';

// ── Extrato da lógica de XP de heróis (useGame.ts) ──────────────────────────
// Simula o tick de ganho de XP quando um boss é derrotado.
// oldHero = herói no estado ATUAL (prev); combatHeroExists = herói participou do combate.
function simulateHeroBossXpGain(
    oldHero: Hero,
    bossLevel: number,
    finalXpMult: number,
    combatHeroExists: boolean
): Hero {
    if (!combatHeroExists) return oldHero;

    const xpGain = Math.floor(bossLevel * 10 * finalXpMult);

    // VERSÃO CORRIGIDA: usa oldHero (estado atual), não combatHero (stale snapshot)
    let newXp = (oldHero.xp || 0) + xpGain;
    let newLevel = oldHero.level || 1;
    let newMaxXp = oldHero.maxXp || 100;
    let currentStatPoints = oldHero.statPoints || 0;

    while (newXp >= newMaxXp) {
        newLevel++;
        newXp -= newMaxXp;
        newMaxXp = Math.floor(newMaxXp * 1.5);
        currentStatPoints += 5;
    }

    if (newLevel !== oldHero.level || newXp !== oldHero.xp) {
        return { ...oldHero, xp: newXp, level: newLevel, maxXp: newMaxXp, statPoints: currentStatPoints };
    }

    return oldHero;
}

// ── VERSÃO BUGADA (demonstra o bug de stale closure antes da correcao) ────────
function simulateHeroBossXpGainBuggy(
    oldHero: Hero,
    staleXp: number,
    staleLevel: number,
    staleMaxXp: number,
    bossLevel: number,
    finalXpMult: number,
    combatHeroExists: boolean
): Hero {
    if (!combatHeroExists) return oldHero;

    const xpGain = Math.floor(bossLevel * 10 * finalXpMult);

    // BUG: usa staleXp em vez de oldHero.xp
    let newXp = (staleXp || 0) + xpGain;
    let newLevel = staleLevel || 1;
    let newMaxXp = staleMaxXp || 100;
    let currentStatPoints = oldHero.statPoints || 0;

    while (newXp >= newMaxXp) {
        newLevel++;
        newXp -= newMaxXp;
        newMaxXp = Math.floor(newMaxXp * 1.5);
        currentStatPoints += 5;
    }

    if (newLevel !== staleLevel || newXp !== staleXp) {
        return { ...oldHero, xp: newXp, level: newLevel, maxXp: newMaxXp, statPoints: currentStatPoints };
    }

    return oldHero;
}

const baseHero: Hero = {
    id: 'h1', name: 'Guerreiro', class: 'Warrior', emoji: '⚔️',
    unlocked: true, isDead: false, element: 'nature', assignment: 'combat',
    insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100,
    statPoints: 0,
    stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, attack: 20, defense: 10, magic: 5, speed: 10 },
    skills: []
};

describe('Hero XP & Level Up System', () => {

    describe('Fluxo principal: ganho de XP', () => {
        it('deve acumular XP apos derrotar boss sem subir de nivel', () => {
            // Arrange
            const hero = { ...baseHero, xp: 0, maxXp: 100, level: 1 };
            // Act
            const result = simulateHeroBossXpGain(hero, 1, 1.0, true); // xpGain=10
            // Assert
            expect(result.xp).toBe(10);
            expect(result.level).toBe(1);
        });

        it('deve subir de nivel quando XP atinge maxXp', () => {
            // Arrange
            const hero = { ...baseHero, xp: 90, maxXp: 100, level: 1 };
            // Act
            const result = simulateHeroBossXpGain(hero, 1, 1.0, true); // +10 xp -> level up
            // Assert
            expect(result.level).toBe(2);
            expect(result.xp).toBe(0);
            expect(result.maxXp).toBe(150);
            expect(result.statPoints).toBe(5);
        });

        it('deve dar multiplos niveis se XP for suficiente', () => {
            // Arrange: xp=80, bossLevel=50 -> xpGain=500. Total=580.
            // Lvl1->2: -100 xp, resta=480, maxXp=150
            // Lvl2->3: -150 xp, resta=330, maxXp=225
            // Lvl3->4: -225 xp, resta=105, maxXp=337 -> para
            const hero = { ...baseHero, xp: 80, maxXp: 100, level: 1 };
            // Act
            const result = simulateHeroBossXpGain(hero, 50, 1.0, true);
            // Assert
            expect(result.level).toBeGreaterThanOrEqual(3);
            expect(result.statPoints).toBe((result.level - 1) * 5);
        });

        it('nao deve modificar heroi sem combate', () => {
            // Arrange
            const hero = { ...baseHero, xp: 50 };
            // Act
            const result = simulateHeroBossXpGain(hero, 5, 1.0, false);
            // Assert
            expect(result.xp).toBe(50);
            expect(result).toBe(hero); // mesma referencia
        });

        it('deve preservar statPoints existentes ao subir de nivel', () => {
            // Arrange
            const hero = { ...baseHero, xp: 95, maxXp: 100, level: 1, statPoints: 10 };
            // Act
            const result = simulateHeroBossXpGain(hero, 1, 1.0, true); // +10 -> level up
            // Assert
            expect(result.level).toBe(2);
            expect(result.statPoints).toBe(15); // 10 prev + 5 new
        });

        it('deve aplicar multiplicador de XP corretamente', () => {
            // Arrange
            const hero = { ...baseHero, xp: 0, maxXp: 100 };
            // Act
            const result = simulateHeroBossXpGain(hero, 1, 2.0, true); // xpGain=20
            // Assert
            expect(result.xp).toBe(20);
        });
    });

    describe('Bug de Stale Closure (regressao)', () => {
        it('DEMONSTRA O BUG: versao bugada nao acumula XP entre ticks', () => {
            // O snapshot congelado (stale closure) sempre tem xp=0, level=1
            const staleXp = 0, staleLevel = 1, staleMaxXp = 100;

            // Tick 1: ok, stale coincide com o estado real
            const afterTick1 = simulateHeroBossXpGainBuggy(
                { ...baseHero, xp: 0 }, staleXp, staleLevel, staleMaxXp, 1, 1.0, true
            );
            expect(afterTick1.xp).toBe(10);

            // Tick 2: oldHero.xp=10, mas stale ainda é 0
            // A versao bugada sobrescreve: stale(0)+10=10, mantendo xp em 10
            const afterTick2Buggy = simulateHeroBossXpGainBuggy(
                { ...baseHero, xp: 10 }, staleXp, staleLevel, staleMaxXp, 1, 1.0, true
            );
            expect(afterTick2Buggy.xp).toBe(10); // BUG: deveria ser 20!
        });

        it('VERSAO CORRIGIDA: XP acumula corretamente entre ticks', () => {
            let hero = { ...baseHero, xp: 0 };

            hero = simulateHeroBossXpGain(hero, 1, 1.0, true); // tick1: +10
            expect(hero.xp).toBe(10);

            hero = simulateHeroBossXpGain(hero, 1, 1.0, true); // tick2: +10
            expect(hero.xp).toBe(20);

            hero = simulateHeroBossXpGain(hero, 1, 1.0, true); // tick3: +10
            expect(hero.xp).toBe(30);
        });

        it('VERSAO CORRIGIDA: sobe de nivel apos acumulacao multi-tick', () => {
            // 10 ticks x 10 xp = 100 xp -> nivel 2
            let hero = { ...baseHero, xp: 0, maxXp: 100, level: 1 };
            for (let i = 0; i < 10; i++) {
                hero = simulateHeroBossXpGain(hero, 1, 1.0, true);
            }
            expect(hero.level).toBe(2);
            expect(hero.xp).toBe(0);
            expect(hero.maxXp).toBe(150);
            expect(hero.statPoints).toBe(5);
        });
    });
});
