import { describe, it, expect } from 'vitest';
import {
    getDayNightPhase,
    getDayNightSecondsLeft,
    DAY_NIGHT_DATA,
    DAY_NIGHT_DURATION,
} from './weather';

// Ciclo total = 120 + 480 + 120 + 480 = 1200s
const CYCLE = 1200;

describe('getDayNightPhase', () => {
    it('deve retornar "dawn" no início do ciclo (t=0)', () => {
        // t=0 está em dawn (0..119)
        expect(getDayNightPhase(0)).toBe('dawn');
    });

    it('deve retornar "day" entre t=120 e t=599', () => {
        expect(getDayNightPhase(120)).toBe('day');
        expect(getDayNightPhase(300)).toBe('day');
        expect(getDayNightPhase(599)).toBe('day');
    });

    it('deve retornar "dusk" entre t=600 e t=719', () => {
        expect(getDayNightPhase(600)).toBe('dusk');
        expect(getDayNightPhase(660)).toBe('dusk');
        expect(getDayNightPhase(719)).toBe('dusk');
    });

    it('deve retornar "night" entre t=720 e t=1199', () => {
        expect(getDayNightPhase(720)).toBe('night');
        expect(getDayNightPhase(900)).toBe('night');
        expect(getDayNightPhase(1199)).toBe('night');
    });

    it('deve fazer loop do ciclo corretamente', () => {
        // t=1200 é equivalente a t=0 → dawn
        expect(getDayNightPhase(CYCLE)).toBe('dawn');
        // t=1320 é equivalente a t=120 → day
        expect(getDayNightPhase(CYCLE + 120)).toBe('day');
    });
});

describe('getDayNightSecondsLeft', () => {
    it('deve retornar 120 segundos no início do dawn (t=0)', () => {
        expect(getDayNightSecondsLeft(0)).toBe(120);
    });

    it('deve retornar segundos corretos no meio do dia (t=300)', () => {
        // dia vai de 120 a 600, então em t=300 faltam 300s
        expect(getDayNightSecondsLeft(300)).toBe(300);
    });

    it('deve retornar > 0 sempre', () => {
        for (let t = 0; t < CYCLE; t += 60) {
            expect(getDayNightSecondsLeft(t)).toBeGreaterThan(0);
        }
    });
});

describe('DAY_NIGHT_DATA efeitos', () => {
    it('noite deve ter goldMultiplier maior que 1', () => {
        expect(DAY_NIGHT_DATA.night.goldMultiplier).toBeGreaterThan(1);
    });

    it('dia deve ter goldMultiplier maior que neutral', () => {
        expect(DAY_NIGHT_DATA.day.goldMultiplier).toBeGreaterThanOrEqual(1);
    });

    it('noite deve ter bônus para dark', () => {
        expect(DAY_NIGHT_DATA.night.elementBonus.dark).toBeGreaterThan(1);
    });

    it('noite deve penalizar light', () => {
        expect(DAY_NIGHT_DATA.night.elementBonus.light).toBeLessThan(1);
    });

    it('amanhecer deve ter bônus de XP', () => {
        expect(DAY_NIGHT_DATA.dawn.xpMultiplier).toBeGreaterThan(1);
    });

    it('todas as fases devem ter durações definidas', () => {
        const phases = ['dawn', 'day', 'dusk', 'night'] as const;
        phases.forEach(p => {
            expect(DAY_NIGHT_DURATION[p]).toBeGreaterThan(0);
        });
    });
});
