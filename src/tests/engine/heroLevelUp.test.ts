import { describe, it, expect } from 'vitest';
import { Hero } from '../../engine/types';

// ── Simulação completa da lógica de atualização do herói por tick em useGame.ts ──
function simulateHeroTick(
    oldHero: Hero,
    combatHero: (Hero & { stats: Hero['stats'] }) | undefined,
    bossDefeated: boolean,
    bossLevel: number,
    finalXpMult: number,
    rivalMult: number = 1.0,
    moraleXpMult: number = 1.0
): Hero {
    // CRITICAL: Always use oldHero (base truth) as the foundation.
    // combatHero is transient / contains item bonuses and stale closure properties.
    let h: Hero = {
        ...oldHero,
        insanity: combatHero?.insanity ?? oldHero.insanity ?? 0,
        isMutated: combatHero?.isMutated ?? oldHero.isMutated ?? false,
        mutationType: combatHero?.mutationType ?? oldHero.mutationType,
        skills: combatHero?.skills ?? oldHero.skills,
        isDead: false, // Heroes are immortal
        stats: {
            ...oldHero.stats,
            hp: bossDefeated
                ? (oldHero.stats.maxHp || 100) // Full heal on boss victory
                : Math.max(1, Math.min(oldHero.stats.maxHp || 100, (combatHero ? (combatHero.stats?.hp ?? oldHero.stats.hp ?? oldHero.stats.maxHp) : (oldHero.stats.hp ?? oldHero.stats.maxHp)) + Math.ceil((oldHero.stats.maxHp || 100) * 0.05))) // 5% passive regen per tick
        }
    };

    if (bossDefeated && combatHero) {
        const xpMult = rivalMult * finalXpMult;
        const xpGain = Math.max(1, Math.floor(bossLevel * 10 * xpMult * moraleXpMult));
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
        h.xp = newXp;
        h.level = newLevel;
        h.maxXp = newMaxXp;
        h.statPoints = currentStatPoints;
    }

    const fatigueDelta = h.assignment === 'combat' ? 0.1 : -1;
    const prevFatigue = oldHero.fatigue || 0;
    const newFatigue = Math.max(0, Math.min(100, prevFatigue + fatigueDelta));
    h.fatigue = newFatigue;

    return h;
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

    describe('Fluxo principal: ganho de XP e persistência entre ticks', () => {
        it('deve acumular XP apos derrotar boss sem subir de nivel', () => {
            const hero = { ...baseHero, xp: 0, maxXp: 100, level: 1 };
            const combatHero = { ...hero, stats: { ...hero.stats, hp: 80 } };
            const result = simulateHeroTick(hero, combatHero, true, 1, 1.0); // xpGain=10
            expect(result.xp).toBe(10);
            expect(result.level).toBe(1);
            expect(result.stats.hp).toBe(100); // Full heal on boss kill
        });

        it('deve manter o XP intacto durante ticks normais de combate (bossDefeated = false)', () => {
            // Herói já acumulou 25 XP
            const hero = { ...baseHero, xp: 25, maxXp: 100, level: 1 };
            // combatHero com snapshot stale (que tinha xp=0)
            const staleCombatHero = { ...hero, xp: 0, stats: { ...hero.stats, hp: 50 } };
            
            // Tick normal de combate (boss ainda vivo)
            const result = simulateHeroTick(hero, staleCombatHero, false, 1, 1.0);
            
            // O XP DEVE PERMANECER 25 (não ser sobrescrito para 0 pelo stale snapshot)
            expect(result.xp).toBe(25);
            expect(result.level).toBe(1);
            // Deve regenerar 5% HP
            expect(result.stats.hp).toBe(55); // 50 + 5
        });

        it('deve subir de nivel quando XP atinge maxXp', () => {
            const hero = { ...baseHero, xp: 90, maxXp: 100, level: 1 };
            const combatHero = { ...hero };
            const result = simulateHeroTick(hero, combatHero, true, 1, 1.0); // +10 xp -> level up
            expect(result.level).toBe(2);
            expect(result.xp).toBe(0);
            expect(result.maxXp).toBe(150);
            expect(result.statPoints).toBe(5);
        });

        it('deve dar multiplos niveis se XP for suficiente', () => {
            const hero = { ...baseHero, xp: 80, maxXp: 100, level: 1 };
            const combatHero = { ...hero };
            const result = simulateHeroTick(hero, combatHero, true, 50, 1.0);
            expect(result.level).toBeGreaterThanOrEqual(3);
            expect(result.statPoints).toBe((result.level - 1) * 5);
        });

        it('nao deve ganhar XP se nao participou do combate', () => {
            const hero = { ...baseHero, xp: 50 };
            const result = simulateHeroTick(hero, undefined, true, 5, 1.0);
            expect(result.xp).toBe(50);
        });

        it('deve preservar statPoints existentes ao subir de nivel', () => {
            const hero = { ...baseHero, xp: 95, maxXp: 100, level: 1, statPoints: 10 };
            const combatHero = { ...hero };
            const result = simulateHeroTick(hero, combatHero, true, 1, 1.0);
            expect(result.level).toBe(2);
            expect(result.statPoints).toBe(15); // 10 prev + 5 new
        });
    });

    describe('Ciclo completo de batalha e cura de HP', () => {
        it('cura 100% de HP ao vencer o boss e regenera 5% por tick durante a luta', () => {
            let hero = { ...baseHero, stats: { ...baseHero.stats, hp: 10, maxHp: 100 } };
            const combatHero = { ...hero, stats: { ...hero.stats, hp: 10 } };

            // Tick 1 (em combate, boss vivo): regenera 5 HP
            hero = simulateHeroTick(hero, combatHero, false, 1, 1.0);
            expect(hero.stats.hp).toBe(15);

            // Tick 2 (em combate, boss vivo): regenera +5 HP
            hero = simulateHeroTick(hero, { ...hero, stats: { ...hero.stats, hp: 15 } }, false, 1, 1.0);
            expect(hero.stats.hp).toBe(20);

            // Tick 3 (boss derrotado!): cura total para 100 HP
            hero = simulateHeroTick(hero, { ...hero, stats: { ...hero.stats, hp: 20 } }, true, 1, 1.0);
            expect(hero.stats.hp).toBe(100);
            expect(hero.xp).toBe(10);
        });
    });
});
