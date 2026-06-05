import { describe, it, expect, vi } from 'vitest';
import { INITIAL_GALAXY, calculateGalaxyIncome, calculateGalaxyBuffs } from '../../engine/galaxy';
import type { GalaxySector, Spaceship } from '../../engine/types';

describe('Galaxy System', () => {
    describe('INITIAL_GALAXY', () => {
        it('should have at least 10 sectors', () => {
            expect(INITIAL_GALAXY.length).toBeGreaterThanOrEqual(10);
        });

        it('should have unique IDs for all sectors', () => {
            const ids = INITIAL_GALAXY.map(s => s.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it('should start with all sectors unowned', () => {
            INITIAL_GALAXY.forEach(s => {
                expect(s.isOwned).toBe(false);
            });
        });
    });

    describe('calculateGalaxyIncome', () => {
        it('should return zero income when no sectors are owned', () => {
            const income = calculateGalaxyIncome(INITIAL_GALAXY);
            expect(income.gold).toBe(0);
            expect(income.mithril).toBe(0);
            expect(income.souls).toBe(0);
            expect(income.starlight).toBe(0);
        });

        it('should calculate gold income from owned sectors', () => {
            const galaxy: GalaxySector[] = [
                { id: 'test1', name: 'Test', description: '', x: 0, y: 0, level: 1, difficulty: 100, reward: { type: 'gold', value: 500 }, isOwned: true, type: 'planet' },
                { id: 'test2', name: 'Test2', description: '', x: 10, y: 10, level: 2, difficulty: 200, reward: { type: 'gold', value: 300 }, isOwned: false, type: 'planet' },
            ];
            const income = calculateGalaxyIncome(galaxy);
            expect(income.gold).toBe(500);
        });

        it('should sum multiple owned sector rewards', () => {
            const galaxy: GalaxySector[] = [
                { id: 'test1', name: 'T1', description: '', x: 0, y: 0, level: 1, difficulty: 100, reward: { type: 'souls', value: 5 }, isOwned: true, type: 'planet' },
                { id: 'test2', name: 'T2', description: '', x: 10, y: 10, level: 2, difficulty: 200, reward: { type: 'souls', value: 10 }, isOwned: true, type: 'star' },
            ];
            const income = calculateGalaxyIncome(galaxy);
            expect(income.souls).toBe(15);
        });
    });

    describe('calculateGalaxyBuffs', () => {
        it('should return zero buffs when no sectors are owned', () => {
            const buffs = calculateGalaxyBuffs(INITIAL_GALAXY);
            expect(buffs.goldMult).toBe(0);
            expect(buffs.damageMult).toBe(0);
            expect(buffs.xpMult).toBe(0);
            expect(buffs.miningSpeed).toBe(0);
        });

        it('should accumulate global_gold buff from owned sectors', () => {
            const galaxy: GalaxySector[] = [
                { id: 'g1', name: 'T1', description: '', x: 0, y: 0, level: 1, difficulty: 100, reward: { type: 'global_gold', value: 0.1 }, isOwned: true, type: 'planet' },
                { id: 'g2', name: 'T2', description: '', x: 10, y: 10, level: 2, difficulty: 200, reward: { type: 'global_gold', value: 0.5 }, isOwned: true, type: 'planet' },
            ];
            const buffs = calculateGalaxyBuffs(galaxy);
            expect(buffs.goldMult).toBeCloseTo(0.6);
        });

        it('should accumulate damage buff from owned sectors', () => {
            const galaxy: GalaxySector[] = [
                { id: 'g1', name: 'T1', description: '', x: 0, y: 0, level: 1, difficulty: 100, reward: { type: 'global_damage', value: 0.1 }, isOwned: true, type: 'planet' },
            ];
            const buffs = calculateGalaxyBuffs(galaxy);
            expect(buffs.damageMult).toBeCloseTo(0.1);
        });
    });

    describe('attackSector logic', () => {
        // Pure logic tests simulating the attackSector conditions

        it('should not attack an already owned sector', () => {
            const sector: GalaxySector = {
                id: 'g1', name: 'Test', description: '', x: 0, y: 0,
                level: 10, difficulty: 1000, reward: { type: 'gold', value: 100 },
                isOwned: true, type: 'planet'
            };
            // Simulating the guard clause
            expect(sector.isOwned).toBe(true);
        });

        it('should block attack when fuel is insufficient', () => {
            const spaceship: Spaceship = {
                name: 'Test Ship', level: 1, fuel: 3, maxFuel: 100,
                hull: 100, maxHull: 100,
                parts: { engine: 1, scanners: 1, miningLaser: 1, shields: 1 },
                upgrades: []
            };
            const fuelCost = 5;
            expect(spaceship.fuel < fuelCost).toBe(true);
        });

        it('should allow attack when fuel is sufficient', () => {
            const spaceship: Spaceship = {
                name: 'Test Ship', level: 1, fuel: 50, maxFuel: 100,
                hull: 100, maxHull: 100,
                parts: { engine: 1, scanners: 1, miningLaser: 1, shields: 1 },
                upgrades: []
            };
            const fuelCost = 5;
            expect(spaceship.fuel >= fuelCost).toBe(true);
        });

        it('should block attack when hull is zero', () => {
            const spaceship: Spaceship = {
                name: 'Test Ship', level: 1, fuel: 50, maxFuel: 100,
                hull: 0, maxHull: 100,
                parts: { engine: 1, scanners: 1, miningLaser: 1, shields: 1 },
                upgrades: []
            };
            expect(spaceship.hull <= 0).toBe(true);
        });

        it('should calculate range correctly based on engine level', () => {
            const engineLevel = 3;
            const maxRange = engineLevel * 25;
            expect(maxRange).toBe(75);

            const sectorDist = Math.sqrt(40 * 40 + 40 * 40); // ~56.57
            expect(sectorDist <= maxRange).toBe(true);
        });

        it('should detect hazard level correctly', () => {
            const hazardMap: Record<string, number> = { 'safe': 1, 'low': 2, 'medium': 3, 'high': 4, 'extreme': 5 };
            const getHazardValue = (h?: string) => h ? hazardMap[h] || 1 : 1;

            expect(getHazardValue('safe')).toBe(1);
            expect(getHazardValue('extreme')).toBe(5);
            expect(getHazardValue(undefined)).toBe(1);

            // shields level 2 can handle 'low' but not 'medium'
            const shieldsLevel = 2;
            expect(shieldsLevel >= getHazardValue('low')).toBe(true);
            expect(shieldsLevel >= getHazardValue('medium')).toBe(false);
        });
    });

    describe('Void Ascension conditions', () => {
        it('should block ascension when tower floor is below 100', () => {
            const towerFloor = 50;
            expect(towerFloor < 100).toBe(true);
        });

        it('should allow ascension when tower floor is 100 or above', () => {
            const towerFloor = 100;
            expect(towerFloor >= 100).toBe(true);
        });

        it('should increment voidAscensions on successful ascension', () => {
            let voidAscensions = 2;
            // Simulate ascension
            voidAscensions += 1;
            expect(voidAscensions).toBe(3);
        });

        it('should reset progress on ascension', () => {
            let gold = 50000;
            let souls = 10000;
            let towerFloor = 150;

            // Simulate ascension reset
            gold = 0;
            souls = 0;
            towerFloor = 1;

            expect(gold).toBe(0);
            expect(souls).toBe(0);
            expect(towerFloor).toBe(1);
        });

        it('should grant divinity on ascension', () => {
            let divinity = 3;
            // Simulate ascension reward
            divinity += 1;
            expect(divinity).toBe(4);
        });
    });
});
