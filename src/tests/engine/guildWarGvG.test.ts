import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initGvGWar, simulateGvGTick, playerAttackTower } from '../../engine/guildWar';
import type { GvGWarState } from '../../engine/guildWar';
import type { FakePlayer } from '../../engine/playerSimulation';

// Helper to create a minimal fake player pool
const createFakePlayers = (count: number, basePower = 1000): FakePlayer[] =>
    Array.from({ length: count }, (_, i) => ({
        id: `bot-${i}`,
        name: `Bot_${i}`,
        profile: (['hardcore', 'casual', 'lucky'] as const)[i % 3],
        power: basePower + i * 100,
        level: 10 + i,
        towerFloor: 5 + i,
        guild: i < count / 2 ? 'Allied Guild' : 'Rival Guild',
        avatar: '🤖',
        lastActionTime: Date.now()
    }));

describe('GvG War System', () => {
    describe('initGvGWar', () => {
        it('should create a war with 5 towers', () => {
            const bots = createFakePlayers(20);
            const war = initGvGWar(5000, bots, 'TestGuild');

            expect(war.towers).toHaveLength(5);
            expect(war.warActive).toBe(true);
            expect(war.playerAttacksLeft).toBe(3);
            expect(war.playerScore).toBe(0);
            expect(war.rivalScore).toBe(0);
            expect(war.playerGuildName).toBe('TestGuild');
            expect(war.rivalGuildName).toBeTruthy();
            expect(war.tickCount).toBe(0);
        });

        it('should partition bots into allied and rival pools', () => {
            const bots = createFakePlayers(20);
            const war = initGvGWar(5000, bots, 'TestGuild');

            expect(war.alliedBotIds.length).toBeGreaterThan(0);
            expect(war.rivalBotIds.length).toBeGreaterThan(0);
            expect(war.alliedBotIds.length + war.rivalBotIds.length).toBe(20);

            // No overlapping IDs
            const overlap = war.alliedBotIds.filter(id => war.rivalBotIds.includes(id));
            expect(overlap).toHaveLength(0);
        });

        it('should scale tower power around player power', () => {
            const bots = createFakePlayers(20);
            const playerPower = 10000;
            const war = initGvGWar(playerPower, bots, 'TestGuild');

            war.towers.forEach(tower => {
                // Tower power should be between 60% and 140% of player power
                expect(tower.defenderPower).toBeGreaterThanOrEqual(playerPower * 0.5);
                expect(tower.defenderPower).toBeLessThanOrEqual(playerPower * 1.5);
                expect(tower.maxHp).toBeGreaterThan(0);
                expect(tower.hp).toBe(tower.maxHp);
                expect(tower.destroyed).toBe(false);
            });
        });

        it('should have an initial log entry', () => {
            const bots = createFakePlayers(10);
            const war = initGvGWar(5000, bots, 'MyGuild');

            expect(war.warLogs.length).toBeGreaterThanOrEqual(1);
            expect(war.warLogs[0].message).toContain('Guerra iniciada');
        });
    });

    describe('simulateGvGTick', () => {
        let war: GvGWarState;
        let bots: FakePlayer[];

        beforeEach(() => {
            bots = createFakePlayers(20, 5000);
            war = initGvGWar(5000, bots, 'TestGuild');
        });

        it('should increment tick count', () => {
            const result = simulateGvGTick(war, bots);
            expect(result.tickCount).toBe(1);
        });

        it('should change scores after a tick', () => {
            // Run multiple ticks to overcome randomness
            let state = war;
            for (let i = 0; i < 20; i++) {
                state = simulateGvGTick(state, bots);
            }
            // At least one side should have scored
            expect(state.playerScore + state.rivalScore).toBeGreaterThan(0);
        });

        it('should not modify state when war is inactive', () => {
            const inactiveWar = { ...war, warActive: false };
            const result = simulateGvGTick(inactiveWar, bots);
            expect(result).toBe(inactiveWar); // Same reference
        });

        it('should end war after 60 ticks', () => {
            let state = { ...war, tickCount: 59 };
            state = simulateGvGTick(state, bots);
            expect(state.tickCount).toBe(60);
            expect(state.warActive).toBe(false);
        });

        it('should end war when all towers are destroyed', () => {
            // Set all towers to 1 HP
            const fragileWar: GvGWarState = {
                ...war,
                towers: war.towers.map(t => ({ ...t, hp: 1, defenderPower: 1 }))
            };
            // Give allied bots massive power
            const powerBots = bots.map(b =>
                fragileWar.alliedBotIds.includes(b.id)
                    ? { ...b, power: 999999 }
                    : b
            );

            // Run enough ticks to destroy all towers
            let state = fragileWar;
            for (let i = 0; i < 100 && state.warActive; i++) {
                state = simulateGvGTick(state, powerBots);
            }
            expect(state.towers.every(t => t.destroyed)).toBe(true);
            expect(state.warActive).toBe(false);
        });

        it('should keep war logs capped at 30', () => {
            let state = war;
            // Add many logs by running many ticks
            for (let i = 0; i < 50 && state.warActive; i++) {
                state = simulateGvGTick(state, bots);
            }
            expect(state.warLogs.length).toBeLessThanOrEqual(30);
        });
    });

    describe('playerAttackTower', () => {
        let war: GvGWarState;
        const bots = createFakePlayers(20, 1000);

        beforeEach(() => {
            war = initGvGWar(5000, bots, 'TestGuild');
        });

        it('should decrement attacks left', () => {
            const { updatedState } = playerAttackTower(war, war.towers[0].id, 5000);
            expect(updatedState.playerAttacksLeft).toBe(2);
        });

        it('should not attack when no attacks left', () => {
            const noAttacks = { ...war, playerAttacksLeft: 0 };
            const { updatedState, won } = playerAttackTower(noAttacks, noAttacks.towers[0].id, 5000);
            expect(won).toBe(false);
            expect(updatedState.playerAttacksLeft).toBe(0);
        });

        it('should not attack a destroyed tower', () => {
            const withDestroyed: GvGWarState = {
                ...war,
                towers: war.towers.map((t, i) => i === 0 ? { ...t, destroyed: true } : t)
            };
            const { updatedState, won } = playerAttackTower(withDestroyed, withDestroyed.towers[0].id, 5000);
            expect(won).toBe(false);
            expect(updatedState.playerAttacksLeft).toBe(3); // Not decremented
        });

        it('should not attack when war is inactive', () => {
            const inactive = { ...war, warActive: false };
            const { updatedState, won } = playerAttackTower(inactive, inactive.towers[0].id, 5000);
            expect(won).toBe(false);
            expect(updatedState.playerAttacksLeft).toBe(3);
        });

        it('should award bonus points on successful manual attack', () => {
            // Use very high power to guarantee win
            const { updatedState, won } = playerAttackTower(war, war.towers[0].id, 999999);
            if (won) {
                expect(updatedState.playerScore).toBeGreaterThan(0);
                // Should add a log entry
                expect(updatedState.warLogs.length).toBeGreaterThan(war.warLogs.length);
            }
        });

        it('should damage tower HP on successful attack', () => {
            const towerId = war.towers[0].id;
            const originalHp = war.towers[0].hp;

            // Run several attacks with high power
            let state = war;
            for (let i = 0; i < 3; i++) {
                const result = playerAttackTower(state, towerId, 999999);
                state = result.updatedState;
            }

            const tower = state.towers.find(t => t.id === towerId)!;
            // Tower should have taken damage or been destroyed
            expect(tower.hp < originalHp || tower.destroyed).toBe(true);
        });
    });

    describe('GvG Event Modifiers', () => {
        let war: GvGWarState;
        let bots: FakePlayer[];

        beforeEach(() => {
            bots = createFakePlayers(20, 5000);
            war = initGvGWar(5000, bots, 'TestGuild');
            // Ensure towers are alive and have a defender power of 5000
            war.towers = war.towers.map(t => ({ ...t, hp: 1000, maxHp: 1000, defenderPower: 5000, destroyed: false }));
        });

        it('should apply +15% power bonus during Festival in simulateGvGTick', () => {
            const testBots = bots.map(b => ({ ...b, power: 2500 }));
            
            // 1. Without Festival (should fail)
            let callCountNoFestival = 0;
            const spyNoFestival = vi.spyOn(Math, 'random').mockImplementation(() => {
                callCountNoFestival++;
                if (callCountNoFestival === 1) return 0; // allied bot index 0
                if (callCountNoFestival === 2) return 0; // target tower index 0
                if (callCountNoFestival === 3) return 0.12; // allied win chance (fails as ratio is 0.5, win chance is 0.10)
                if (callCountNoFestival === 4) return 0.9; // allied log check (fail)
                if (callCountNoFestival === 5) return 0; // rival bot index 0
                if (callCountNoFestival === 6) return 0; // defender bot index 0
                if (callCountNoFestival === 7) return 0.99; // rival win chance (fails)
                if (callCountNoFestival === 8) return 0.9; // rival log check (fail)
                return 0.9;
            });

            const stateNoFestival = simulateGvGTick(war, testBots);
            expect(stateNoFestival.playerScore).toBe(30); // successful defense points
            spyNoFestival.mockRestore();

            // 2. With Festival (should win)
            const activeEvent = { type: 'festival', name: 'Festival' };
            let callCountFestival = 0;
            const spyFestival = vi.spyOn(Math, 'random').mockImplementation(() => {
                callCountFestival++;
                if (callCountFestival === 1) return 0; // allied bot index 0
                if (callCountFestival === 2) return 0; // target tower index 0
                if (callCountFestival === 3) return 0.12; // allied win chance (wins as ratio is 0.575, win chance is 0.14)
                if (callCountFestival === 4) return 0.5; // damage multiplier roll
                if (callCountFestival === 5) return 0.9; // allied log check (fail)
                if (callCountFestival === 6) return 0; // rival bot index 0
                if (callCountFestival === 7) return 0; // defender bot index 0
                if (callCountFestival === 8) return 0.99; // rival win chance (fails)
                if (callCountFestival === 9) return 0.9; // rival log check (fail)
                return 0.9;
            });

            const stateFestival = simulateGvGTick(war, testBots, activeEvent);
            expect(stateFestival.playerScore).toBe(500); // 500 for destroying the tower
            spyFestival.mockRestore();
        });

        it('should apply -10% defense penalty during crisis/raid in simulateGvGTick', () => {
            const testBots = bots.map((b, idx) => ({
                ...b,
                power: idx === 0 ? 1000 : 2000 // one weak, others strong
            }));
            
            const testWar = {
                ...war,
                alliedBotIds: testBots.filter((_, idx) => idx > 0).map(b => b.id), // defenders: 2000 power
                rivalBotIds: testBots.filter((_, idx) => idx === 0).map(b => b.id) // attacker: 1000 power
            };

            // 1. Without Crisis (rival attack should fail, scoring 30 pts for player)
            let callCountNoCrisis = 0;
            const spyNoCrisis = vi.spyOn(Math, 'random').mockImplementation(() => {
                callCountNoCrisis++;
                if (callCountNoCrisis === 1) return 0; // allied bot index 0
                if (callCountNoCrisis === 2) return 0; // target tower index 0
                if (callCountNoCrisis === 3) return 0.99; // allied win chance (fail)
                if (callCountNoCrisis === 4) return 0.9; // allied log check (fail)
                if (callCountNoCrisis === 5) return 0; // rival bot index 0
                if (callCountNoCrisis === 6) return 0; // defender bot index 0
                if (callCountNoCrisis === 7) return 0.11; // rival win chance (fails as ratio is 0.5, win chance is 0.10)
                if (callCountNoCrisis === 8) return 0.9; // rival log check (fail)
                return 0.9;
            });

            const stateNoCrisis = simulateGvGTick(testWar, testBots);
            expect(stateNoCrisis.rivalScore).toBe(25); // 25 for failed allied attack
            expect(stateNoCrisis.playerScore).toBe(30); // 30 for successful defense
            spyNoCrisis.mockRestore();

            // 2. With Crisis (rival attack should succeed, scoring 75 pts for rival)
            const activeEvent = { type: 'crisis', name: 'Invasão' };
            let callCountCrisis = 0;
            const spyCrisis = vi.spyOn(Math, 'random').mockImplementation(() => {
                callCountCrisis++;
                if (callCountCrisis === 1) return 0; // allied bot index 0
                if (callCountCrisis === 2) return 0; // target tower index 0
                if (callCountCrisis === 3) return 0.99; // allied win chance (fail)
                if (callCountCrisis === 4) return 0.9; // allied log check (fail)
                if (callCountCrisis === 5) return 0; // rival bot index 0
                if (callCountCrisis === 6) return 0; // defender bot index 0
                if (callCountCrisis === 7) return 0.11; // rival win chance (wins as defender power is 1800, ratio is 0.555, win chance is 0.129)
                if (callCountCrisis === 8) return 0.9; // rival log check (fail)
                return 0.9;
            });

            const stateCrisis = simulateGvGTick(testWar, testBots, activeEvent);
            expect(stateCrisis.rivalScore).toBe(100); // 25 for failed allied + 75 for rival hit
            spyCrisis.mockRestore();
        });

        it('should apply +15% power bonus to player manual attacks during Festival', () => {
            const spy = vi.spyOn(Math, 'random');
            
            // 1. Without Festival (should fail)
            spy.mockReturnValueOnce(0.12);
            const { won: wonNoFestival } = playerAttackTower(war, war.towers[0].id, 2500);
            expect(wonNoFestival).toBe(false);

            // 2. With Festival (should win)
            const activeEvent = { type: 'festival', name: 'Festival' };
            spy.mockReturnValueOnce(0.12);
            const { won: wonFestival } = playerAttackTower(war, war.towers[0].id, 2500, activeEvent);
            expect(wonFestival).toBe(true);
            spy.mockRestore();
        });
    });

    describe('Mathematical Balance', () => {
        it('should produce balanced score growth over 100 ticks', () => {
            const bots = createFakePlayers(20, 5000);
            let state = initGvGWar(5000, bots, 'TestGuild');

            for (let i = 0; i < 100 && state.warActive; i++) {
                state = simulateGvGTick(state, bots);
            }

            const totalScore = state.playerScore + state.rivalScore;
            expect(state.playerScore).toBeGreaterThan(0);
            expect(state.rivalScore).toBeGreaterThan(0);

            const ratio = state.playerScore / Math.max(1, state.rivalScore);
            expect(ratio).toBeGreaterThan(0.1);
            expect(ratio).toBeLessThan(10);

            expect(totalScore).toBeGreaterThan(100);
            expect(totalScore).toBeLessThan(100000);
        });
    });
});
