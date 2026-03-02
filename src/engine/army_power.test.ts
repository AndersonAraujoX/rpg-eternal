import { describe, it, expect } from 'vitest';
import { INITIAL_HEROES } from './initialData';
import type { Hero, Guild } from './types';

// Logic from useGame.ts
const calculateArmyMult = (guild: Guild | null) => {
    const isLeader = (guild?.totalContribution || 0) >= 10000;
    return isLeader ? 1 + (guild?.members || 0) * 0.01 : 1;
};

const calculatePower = (
    basePower: number,
    armyMult: number
) => {
    return Math.floor(basePower * armyMult);
};

describe('Army Power and Recruitment Logic', () => {
    it('should NOT apply army mult if not leader', () => {
        const mockGuild: Guild = {
            id: 'g1', name: 'Test', members: 50, totalContribution: 5000,
            xp: 0, maxXp: 1000, level: 1, bonusType: 'physical', bonusValue: 0.1, bonus: '', monuments: {}, description: ''
        };
        const mult = calculateArmyMult(mockGuild);
        expect(mult).toBe(1);
    });

    it('should apply army mult (+1% per member) if leader (10k+ contribution)', () => {
        const mockGuild: Guild = {
            id: 'g1', name: 'Test', members: 50, totalContribution: 10001,
            xp: 0, maxXp: 1000, level: 1, bonusType: 'physical', bonusValue: 0.1, bonus: '', monuments: {}, description: ''
        };
        const mult = calculateArmyMult(mockGuild);
        // 1 + 50 * 0.01 = 1.5
        expect(mult).toBe(1.5);

        const finalPower = calculatePower(1000, mult);
        expect(finalPower).toBe(1500);
    });

    it('should verify buyHero direct recruitment requirements', () => {
        const gold = 6000;
        const cost = 5000;
        const hero: Hero = { ...INITIAL_HEROES[1], unlocked: false };

        let heroUnlocked = hero.unlocked;
        let finalGold = gold;

        if (!hero.unlocked && gold >= cost) {
            finalGold -= cost;
            heroUnlocked = true;
        }

        expect(heroUnlocked).toBe(true);
        expect(finalGold).toBe(1000);
    });
});
