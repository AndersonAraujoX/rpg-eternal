import { describe, it, expect } from 'vitest';
import { INITIAL_HEROES } from '../../engine/initialData';
import type { Hero, Guild } from '../../engine/types';
import { initOrUpdateHeroPassiveTree } from '../../data/skillTreeData';
import { calculateHeroPower } from '../../engine/combat';


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

    it('should initialize and apply Passive Skill Tree modifiers at level 10, 50, and 100', () => {
        // Base level 1 warrior
        const baseWarrior: Hero = {
            ...INITIAL_HEROES[0],
            level: 1,
            stats: { hp: 120, maxHp: 120, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 }
        };

        const warriorLvl1 = initOrUpdateHeroPassiveTree(baseWarrior);
        expect(warriorLvl1.passiveSkillTree).toBeDefined();
        expect(warriorLvl1.passiveSkillTree?.pointsSpent).toBe(0);
        expect(warriorLvl1.passiveSkillTree?.modifiers.attackMult).toBe(1.0);

        // Level 10 Milestone: +5% attack, +5% defense
        const warriorLvl10 = initOrUpdateHeroPassiveTree({ ...baseWarrior, level: 10 });
        expect(warriorLvl10.passiveSkillTree?.pointsSpent).toBe(9);
        expect(warriorLvl10.passiveSkillTree?.modifiers.attackMult).toBeGreaterThan(1.05); // points + milestone
        expect(warriorLvl10.passiveSkillTree?.unlockedMilestones).toContain(10);

        // Level 50 Milestone: +15% damage, +10% insanity resistance
        const warriorLvl50 = initOrUpdateHeroPassiveTree({ ...baseWarrior, level: 50 });
        expect(warriorLvl50.passiveSkillTree?.pointsSpent).toBe(49);
        expect(warriorLvl50.passiveSkillTree?.modifiers.attackMult).toBeGreaterThan(1.20);
        expect(warriorLvl50.passiveSkillTree?.modifiers.insanityResistance).toBeGreaterThanOrEqual(0.10);
        expect(warriorLvl50.passiveSkillTree?.unlockedMilestones).toContain(10);
        expect(warriorLvl50.passiveSkillTree?.unlockedMilestones).toContain(25);
        expect(warriorLvl50.passiveSkillTree?.unlockedMilestones).toContain(50);

        // Level 100 Milestone: massive bonuses
        const warriorLvl100 = initOrUpdateHeroPassiveTree({ ...baseWarrior, level: 100 });
        expect(warriorLvl100.passiveSkillTree?.pointsSpent).toBe(99);
        expect(warriorLvl100.passiveSkillTree?.unlockedMilestones).toContain(100);

        // Check power calculation scaling with passive tree
        const powerLvl1 = calculateHeroPower(warriorLvl1);
        const powerLvl100 = calculateHeroPower(warriorLvl100);
        expect(powerLvl100).toBeGreaterThan(powerLvl1 * 2); // At lvl 100, stats and power should be at least double
    });
});

