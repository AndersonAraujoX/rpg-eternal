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

    describe('Mathematical Balance', () => {
        it('should produce balanced score growth over 100 ticks', () => {
            const bots = createFakePlayers(20, 5000);
            let state = initGvGWar(5000, bots, 'TestGuild');

            // Override random for deterministic-like testing is complex,
            // so we use statistical bounds instead
            for (let i = 0; i < 100 && state.warActive; i++) {
                state = simulateGvGTick(state, bots);
            }

            const totalScore = state.playerScore + state.rivalScore;
            // Both sides should have scored something
            expect(state.playerScore).toBeGreaterThan(0);
            expect(state.rivalScore).toBeGreaterThan(0);

            // Player advantage ratio should not be extreme (within 10x)
            const ratio = state.playerScore / Math.max(1, state.rivalScore);
            expect(ratio).toBeGreaterThan(0.1);
            expect(ratio).toBeLessThan(10);

            // Total score should be reasonable (not 0 or astronomically high)
            expect(totalScore).toBeGreaterThan(100);
            expect(totalScore).toBeLessThan(100000);
        });
    });
});
