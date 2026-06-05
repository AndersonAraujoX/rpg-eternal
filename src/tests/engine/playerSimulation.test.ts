import { describe, it, expect } from 'vitest';
import { 
    generateInitialBots, 
    tickFakePlayers, 
    selectArenaOpponents 
} from '../../engine/playerSimulation';

describe('Player Simulation Engine', () => {
    describe('generateInitialBots', () => {
        it('should generate the default number of bots', () => {
            const bots = generateInitialBots();
            expect(bots).toHaveLength(20);
        });

        it('should generate the specified number of bots', () => {
            const bots = generateInitialBots(10);
            expect(bots).toHaveLength(10);
        });

        it('should initialize bots with expected properties', () => {
            const bots = generateInitialBots(5);
            bots.forEach(bot => {
                expect(bot.id).toContain('bot-');
                expect(bot.name).toBeDefined();
                expect(['hardcore', 'casual', 'lucky']).toContain(bot.profile);
                expect(bot.power).toBeGreaterThan(0);
                expect(bot.level).toBeGreaterThan(0);
                expect(bot.towerFloor).toBeGreaterThan(0);
                expect(bot.guild).toBeDefined();
                expect(bot.avatar).toBeDefined();
                expect(bot.lastActionTime).toBeLessThanOrEqual(Date.now());
            });
        });

        it('should distribute profiles evenly', () => {
            const bots = generateInitialBots(6);
            const profiles = bots.map(b => b.profile);
            expect(profiles.filter(p => p === 'hardcore')).toHaveLength(2);
            expect(profiles.filter(p => p === 'casual')).toHaveLength(2);
            expect(profiles.filter(p => p === 'lucky')).toHaveLength(2);
        });
    });

    describe('tickFakePlayers', () => {
        it('should not update progress if cooldown has not passed', () => {
            const initialBots = generateInitialBots(5);
            // set last action time to now so they are on cooldown
            initialBots.forEach(b => b.lastActionTime = Date.now());
            const result = tickFakePlayers(initialBots, 1000);
            expect(result.logEntries).toHaveLength(0);
            // check power didn't change
            result.updatedBots.forEach((bot, idx) => {
                expect(bot.power).toBe(initialBots[idx].power);
            });
        });

        it('should update progress and generate logs if cooldown has passed', () => {
            const initialBots = generateInitialBots(5);
            // force past cooldown (set to 0)
            initialBots.forEach(b => b.lastActionTime = 0);
            
            // Run ticks to ensure progression happens
            let ticks = 0;
            let currentBots = [...initialBots];
            let totalLogsCount = 0;

            while (ticks < 10) {
                currentBots.forEach(b => b.lastActionTime = 0);
                const result = tickFakePlayers(currentBots, 1000);
                currentBots = result.updatedBots;
                totalLogsCount += result.logEntries.length;
                ticks++;
            }

            // Power should have increased for some/all bots
            const hasPowerIncreased = currentBots.some((bot, idx) => bot.power > initialBots[idx].power);
            expect(hasPowerIncreased).toBe(true);
        });

        it('should apply caps correctly (speed up lagging bots, slow down leading bots)', () => {
            const bots = [
                {
                    id: 'bot-weak',
                    name: 'WeakBot',
                    profile: 'hardcore' as const,
                    power: 10, // way below player
                    level: 1,
                    towerFloor: 1,
                    guild: 'Guild',
                    avatar: '🧙‍♂️',
                    lastActionTime: 0
                },
                {
                    id: 'bot-strong',
                    name: 'StrongBot',
                    profile: 'casual' as const,
                    power: 100000, // way above player
                    level: 50,
                    towerFloor: 25,
                    guild: 'Guild',
                    avatar: '🧙‍♂️',
                    lastActionTime: 0
                }
            ];

            const playerPower = 1000;
            
            let currentBots = [...bots];
            let weakGrown = false;
            let strongGrown = false;
            for (let i = 0; i < 50; i++) {
                currentBots.forEach(b => b.lastActionTime = 0);
                const tickRes = tickFakePlayers(currentBots, playerPower);
                const w = tickRes.updatedBots.find(b => b.id === 'bot-weak')!;
                const s = tickRes.updatedBots.find(b => b.id === 'bot-strong')!;
                
                if (w.power > 10) weakGrown = true;
                if (s.power > 100000) strongGrown = true;
                
                currentBots = tickRes.updatedBots;
            }

            expect(weakGrown).toBe(true);
            
            const weakBotFinal = currentBots.find(b => b.id === 'bot-weak')!;
            const strongBotFinal = currentBots.find(b => b.id === 'bot-strong')!;

            const weakGrowthPercentage = (weakBotFinal.power - 10) / 10;
            const strongGrowthPercentage = (strongBotFinal.power - 100000) / 100000;

            // Weak bot should have grown significantly faster relative to its base
            expect(weakGrowthPercentage).toBeGreaterThan(strongGrowthPercentage);
        });
    });

    describe('selectArenaOpponents', () => {
        it('should return exactly 3 opponents', () => {
            const bots = generateInitialBots(10);
            const opponents = selectArenaOpponents(bots, 1000, 50);
            expect(opponents).toHaveLength(3);
        });

        it('should return unique opponents if enough bots exist', () => {
            const bots = generateInitialBots(5);
            const opponents = selectArenaOpponents(bots, 1000, 50);
            const ids = opponents.map(op => op.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(3);
        });

        it('should calculate ranks correctly as dynamic leaderboard position', () => {
            const bots = generateInitialBots(10);
            const sortedBots = [...bots].sort((a, b) => b.power - a.power);
            const opponents = selectArenaOpponents(bots, 1000, 50);

            opponents.forEach(op => {
                const expectedRank = sortedBots.findIndex(b => b.id === op.id) + 1;
                expect(op.rank).toBe(expectedRank);
            });
        });
    });
});
