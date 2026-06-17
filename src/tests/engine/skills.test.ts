import { describe, it, expect } from 'vitest';
import { initOrUpdateHeroPassiveTree } from '../../data/skillTreeData';
import { getPassiveStatBonus, getBestDamageSkill, getActiveSkills, getSkillDamageEstimate, updateHeroSkills, getTotalPassiveStatBonus, getSkillsForHero, CLASS_SKILLS } from '../../engine/skills';
import type { Hero, Skill } from '../../engine/types';

const mockHero = (level: number): Hero => ({
    id: 'test_hero',
    name: 'Gladiador de Teste',
    class: 'Warrior',
    stats: { hp: 100, maxHp: 100, attack: 10, defense: 10, magic: 10, speed: 10, mp: 0, maxMp: 0 },
    element: 'neutral',
    assignment: 'combat',
    insanity: 0,
    emoji: '⚔️',
    type: 'hero',
    unlocked: true,
    isDead: false,
    level,
    xp: 0,
    maxXp: 100,
    statPoints: 0,
    skills: [],
    fatigue: 0,
    maxFatigue: 100
});

describe('getSkillsForHero', () => {
    it('returns an empty array when a nonexistent class name is provided', () => {
        expect(getSkillsForHero('NonExistentClass', 10)).toEqual([]);
    });

    it('returns only the skills unlocked at a given hero level for a class', () => {
        // Mock a dummy class in CLASS_SKILLS
        const active1: Skill = {
            id: 'a1', name: 'A1', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 10, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        const passive: Skill = {
            id: 'p1', name: 'P1', description: '', type: 'passive', effectType: 'passive',
            target: 'self', value: 0, unlockLevel: 5, cooldown: 0, currentCooldown: 0
        };
        const active2: Skill = {
            id: 'a2', name: 'A2', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 20, unlockLevel: 10, cooldown: 0, currentCooldown: 0
        };

        CLASS_SKILLS['DummyClass'] = [active1, passive, active2];

        // At level 5, a1 and p1 should be unlocked, a2 locked
        const result = getSkillsForHero('DummyClass', 5);
        expect(result).toEqual([active1, passive]);

        // Clean up
        delete CLASS_SKILLS['DummyClass'];
    });

    it('returns all skills for a class when the hero level is high enough to unlock everything', () => {
        const active1: Skill = {
            id: 'a1', name: 'A1', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 10, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        const passive: Skill = {
            id: 'p1', name: 'P1', description: '', type: 'passive', effectType: 'passive',
            target: 'self', value: 0, unlockLevel: 5, cooldown: 0, currentCooldown: 0
        };

        CLASS_SKILLS['DummyClass2'] = [active1, passive];

        // At level 100, everything is unlocked
        const result = getSkillsForHero('DummyClass2', 100);
        expect(result).toEqual([active1, passive]);

        // Clean up
        delete CLASS_SKILLS['DummyClass2'];
    });
});

describe('getActiveSkills', () => {
    it('returns an empty array if an empty array of skills is provided', () => {
        expect(getActiveSkills([], 10)).toEqual([]);
    });

    it('filters out passive skills', () => {
        const passiveSkill: Skill = {
            id: 'p1',
            name: 'Passive Skill',
            description: '',
            type: 'passive',
            effectType: 'passive',
            target: 'self',
            value: 0,
            unlockLevel: 1,
            cooldown: 0,
            currentCooldown: 0
        };
        expect(getActiveSkills([passiveSkill], 10)).toEqual([]);
    });

    it('filters out active skills that are locked (hero level < unlockLevel)', () => {
        const lockedActiveSkill: Skill = {
            id: 'a1',
            name: 'Locked Active',
            description: '',
            type: 'active',
            effectType: 'damage',
            target: 'enemy',
            value: 10,
            unlockLevel: 15,
            cooldown: 0,
            currentCooldown: 0
        };
        expect(getActiveSkills([lockedActiveSkill], 10)).toEqual([]);
    });

    it('returns only active skills that are unlocked at the given hero level', () => {
        const active1: Skill = {
            id: 'a1',
            name: 'A1',
            description: '',
            type: 'active',
            effectType: 'damage',
            target: 'enemy',
            value: 10,
            unlockLevel: 1,
            cooldown: 0,
            currentCooldown: 0
        };
        const active2: Skill = {
            id: 'a2',
            name: 'A2',
            description: '',
            type: 'active',
            effectType: 'damage',
            target: 'enemy',
            value: 20,
            unlockLevel: 5,
            cooldown: 0,
            currentCooldown: 0
        };
        const passive: Skill = {
            id: 'p1',
            name: 'P1',
            description: '',
            type: 'passive',
            effectType: 'passive',
            target: 'self',
            value: 0,
            unlockLevel: 1,
            cooldown: 0,
            currentCooldown: 0
        };
        const locked: Skill = {
            id: 'a3',
            name: 'A3',
            description: '',
            type: 'active',
            effectType: 'damage',
            target: 'enemy',
            value: 30,
            unlockLevel: 20,
            cooldown: 0,
            currentCooldown: 0
        };

        const result = getActiveSkills([active1, active2, passive, locked], 10);
        expect(result).toEqual([active1, active2]);
    });
});

describe('getTotalPassiveStatBonus', () => {
    it('returns an empty object if the class is unknown or has no skills', () => {
        expect(getTotalPassiveStatBonus('UnknownClass', 10)).toEqual({});
    });

    it('returns accumulated passive stats up to the hero level for a known class', () => {
        // Based on actual CLASS_SKILLS['Warrior']:
        // w2 (Iron Skin) at lv 5: { defense: 15 }
        // w4 (Veteran Vitality) at lv 12: { hp: 50, maxHp: 50 }

        // At level 1, no passives should be unlocked yet
        expect(getTotalPassiveStatBonus('Warrior', 1)).toEqual({});

        // At level 10, only lv 5 passive is unlocked
        expect(getTotalPassiveStatBonus('Warrior', 10)).toEqual({ defense: 15 });

        // At level 15, both lv 5 and lv 12 passives are unlocked
        expect(getTotalPassiveStatBonus('Warrior', 15)).toEqual({ defense: 15, hp: 50, maxHp: 50 });
    });
});

describe('getPassiveStatBonus', () => {
    it('returns an empty object if an empty array of skills is provided', () => {
        expect(getPassiveStatBonus([], 1)).toEqual({});
    });

    it('ignores active skills', () => {
        const activeSkill: Skill = {
            id: 'a1',
            name: 'Active Skill',
            description: '',
            type: 'active',
            effectType: 'damage',
            target: 'enemy',
            value: 10,
            unlockLevel: 1,
            cooldown: 0,
            currentCooldown: 0
        };
        expect(getPassiveStatBonus([activeSkill], 10)).toEqual({});
    });

    it('ignores passive skills that are locked (hero level < unlockLevel)', () => {
        const lockedPassiveSkill: Skill = {
            id: 'p1',
            name: 'Locked Passive',
            description: '',
            type: 'passive',
            effectType: 'passive',
            target: 'self',
            value: 0,
            unlockLevel: 15,
            cooldown: 0,
            currentCooldown: 0,
            statBonus: { hp: 50 }
        };
        expect(getPassiveStatBonus([lockedPassiveSkill], 10)).toEqual({});
    });

    it('returns the sum of stat bonuses for unlocked passive skills', () => {
        const p1: Skill = {
            id: 'p1',
            name: 'P1',
            description: '',
            type: 'passive',
            effectType: 'passive',
            target: 'self',
            value: 0,
            unlockLevel: 1,
            cooldown: 0,
            currentCooldown: 0,
            statBonus: { hp: 50, attack: 10 }
        };
        const p2: Skill = {
            id: 'p2',
            name: 'P2',
            description: '',
            type: 'passive',
            effectType: 'passive',
            target: 'self',
            value: 0,
            unlockLevel: 5,
            cooldown: 0,
            currentCooldown: 0,
            statBonus: { attack: 5, defense: 20 }
        };
        const active: Skill = {
            id: 'a1',
            name: 'A1',
            description: '',
            type: 'active',
            effectType: 'damage',
            target: 'enemy',
            value: 10,
            unlockLevel: 1,
            cooldown: 0,
            currentCooldown: 0
        };
        const locked: Skill = {
            id: 'p3',
            name: 'P3',
            description: '',
            type: 'passive',
            effectType: 'passive',
            target: 'self',
            value: 0,
            unlockLevel: 20,
            cooldown: 0,
            currentCooldown: 0,
            statBonus: { speed: 100 }
        };

        const result = getPassiveStatBonus([p1, p2, active, locked], 10);
        expect(result).toEqual({
            hp: 50,
            attack: 15,
            defense: 20
        });
    });
});

describe('getSkillDamageEstimate', () => {
    it('returns 0 for non-damage skills', () => {
        const healSkill: Skill = {
            id: 'h1', name: 'Heal', description: '', type: 'active', effectType: 'heal',
            target: 'ally', value: 2.0, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        const buffSkill: Skill = {
            id: 'b1', name: 'Buff', description: '', type: 'active', effectType: 'buff',
            target: 'self', value: 1.5, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };

        expect(getSkillDamageEstimate(healSkill, 100)).toBe(0);
        expect(getSkillDamageEstimate(buffSkill, 100)).toBe(0);
    });

    it('calculates expected damage estimate for a basic damage skill', () => {
        const damageSkill: Skill = {
            id: 'd1', name: 'Strike', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 1.5, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };

        expect(getSkillDamageEstimate(damageSkill, 10)).toBe(15);
        expect(getSkillDamageEstimate(damageSkill, 100)).toBe(150);
    });

    it('floors the calculated damage correctly', () => {
        const damageSkill: Skill = {
            id: 'd2', name: 'Odd Strike', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 1.25, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };

        // 1.25 * 15 = 18.75 -> floored to 18
        expect(getSkillDamageEstimate(damageSkill, 15)).toBe(18);

        // 1.25 * 9 = 11.25 -> floored to 11
        expect(getSkillDamageEstimate(damageSkill, 9)).toBe(11);
    });

    it('returns 0 when baseAttack is 0', () => {
        const damageSkill: Skill = {
            id: 'd3', name: 'Zero Strike', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 2.0, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };

        expect(getSkillDamageEstimate(damageSkill, 0)).toBe(0);
    });

    it('returns 0 when skill value is 0', () => {
        const damageSkill: Skill = {
            id: 'd4', name: 'Useless Strike', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 0, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };

        expect(getSkillDamageEstimate(damageSkill, 100)).toBe(0);
    });
});

describe('getBestDamageSkill', () => {
    it('returns null if no skills are provided', () => {
        expect(getBestDamageSkill([], 1)).toBeNull();
    });

    it('returns null if only locked skills are provided', () => {
        const lockedSkill: Skill = {
            id: 'a1', name: 'Locked', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 10, unlockLevel: 5, cooldown: 0, currentCooldown: 0
        };
        expect(getBestDamageSkill([lockedSkill], 1)).toBeNull();
    });

    it('returns null if no damage skills are unlocked', () => {
        const healSkill: Skill = {
            id: 'a1', name: 'Heal', description: '', type: 'active', effectType: 'heal',
            target: 'ally', value: 10, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        expect(getBestDamageSkill([healSkill], 1)).toBeNull();
    });

    it('returns the skill with the highest damage value', () => {
        const lowDamage: Skill = {
            id: 'a1', name: 'Low', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 1.5, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        const highDamage: Skill = {
            id: 'a2', name: 'High', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 3.0, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        const mediumDamage: Skill = {
            id: 'a3', name: 'Medium', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 2.0, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        expect(getBestDamageSkill([lowDamage, highDamage, mediumDamage], 1)).toEqual(highDamage);
    });

    it('ignores locked high-damage skills and returns the best unlocked one', () => {
        const unlockedSkill: Skill = {
            id: 'a1', name: 'Unlocked', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 1.5, unlockLevel: 1, cooldown: 0, currentCooldown: 0
        };
        const lockedHighDamage: Skill = {
            id: 'a2', name: 'Locked High', description: '', type: 'active', effectType: 'damage',
            target: 'enemy', value: 5.0, unlockLevel: 10, cooldown: 0, currentCooldown: 0
        };
        expect(getBestDamageSkill([unlockedSkill, lockedHighDamage], 5)).toEqual(unlockedSkill);
    });
});

describe('Automated Skill Tree System', () => {
    it('initializes the skill tree on a level 1 hero', () => {
        const hero = initOrUpdateHeroPassiveTree(mockHero(1));
        expect(hero.skillTreeNodes).toBeDefined();
        expect(hero.skillTreeNodes?.length).toBe(30);

        // Only Tier 1 nodes should be unlocked
        const unlockedNodes = hero.skillTreeNodes?.filter(n => n.unlocked);
        expect(unlockedNodes?.length).toBe(3); // 1 node from attack, 1 from defense, 1 from utility
        unlockedNodes?.forEach(node => {
            expect(node.tier).toBe(1);
            expect(node.level).toBe(1);
            expect(node.effectValue).toBeGreaterThan(0);
        });

        // Locked nodes should have level 0
        const lockedNodes = hero.skillTreeNodes?.filter(n => !n.unlocked);
        expect(lockedNodes?.length).toBe(27);
        lockedNodes?.forEach(node => {
            expect(node.level).toBe(0);
            expect(node.effectValue).toBe(0);
        });
    });

    it('correctly unlocks and calculates node levels for a level 50 hero', () => {
        const hero = initOrUpdateHeroPassiveTree(mockHero(50));
        expect(hero.skillTreeNodes).toBeDefined();
        
        // At level 50, Tiers 1-6 (req levels 1, 10, 20, 30, 40, 50) should be unlocked
        const unlockedNodes = hero.skillTreeNodes?.filter(n => n.unlocked);
        expect(unlockedNodes?.length).toBe(18); // 6 tiers * 3 archetypes

        // Tiers 7-10 (req levels 60, 70, 80, 90) should be locked
        const lockedNodes = hero.skillTreeNodes?.filter(n => !n.unlocked);
        expect(lockedNodes?.length).toBe(12); // 4 tiers * 3 archetypes

        // Test level calculation:
        // Tier 1 (req level 1): level should be Math.min(5, Math.floor((50 - 1) / 10) + 1) = Math.min(5, 4 + 1) = 5 (max)
        const t1Node = hero.skillTreeNodes?.find(n => n.id === 'atk_t1');
        expect(t1Node).toBeDefined();
        expect(t1Node?.unlocked).toBe(true);
        expect(t1Node?.level).toBe(5);

        // Tier 6 (req level 50): level should be Math.min(5, Math.floor((50 - 50) / 10) + 1) = 1
        const t6Node = hero.skillTreeNodes?.find(n => n.id === 'atk_t6');
        expect(t6Node).toBeDefined();
        expect(t6Node?.unlocked).toBe(true);
        expect(t6Node?.level).toBe(1);

        // Modifiers must be applied and boosted
        const mods = hero.passiveSkillTree?.modifiers;
        expect(mods).toBeDefined();
        expect(mods?.attackMult).toBeGreaterThan(1.20);
        expect(mods?.hpMult).toBeGreaterThan(1.10);
        expect(mods?.insanityResistance).toBeGreaterThanOrEqual(0.10);
    });

    it('maximizes all skill nodes on a level 100 hero', () => {
        const hero = initOrUpdateHeroPassiveTree(mockHero(100));
        expect(hero.skillTreeNodes).toBeDefined();
        
        // At level 100, all 30 nodes should be unlocked
        const unlockedNodes = hero.skillTreeNodes?.filter(n => n.unlocked);
        expect(unlockedNodes?.length).toBe(30);

        // All nodes should be at max level 5 or 2 based on logic
        unlockedNodes?.forEach(node => {
            const expectedLvl = Math.min(node.maxLevel, Math.floor((100 - node.requiredLevel) / 10) + 1);
            expect(node.level).toBe(expectedLvl);
            expect(node.effectValue).toBe(node.baseValue ? node.baseValue * expectedLvl : node.effectValue);
        });

        // Ensure modifiers are scaled correctly to peak levels
        const mods = hero.passiveSkillTree?.modifiers;
        expect(mods?.attackMult).toBeGreaterThan(1.50);
        expect(mods?.hpMult).toBeGreaterThan(1.40);
        expect(mods?.critChanceBonus).toBeGreaterThanOrEqual(0.05);
    });
});

describe('updateHeroSkills', () => {
    it('initializes skill tree nodes and passive skill tree for a level 1 hero without existing trees', () => {
        const hero = mockHero(1);
        const updatedHero = updateHeroSkills(hero);

        expect(updatedHero.skillTreeNodes).toBeDefined();
        expect(updatedHero.skillTreeNodes?.length).toBeGreaterThan(0);

        expect(updatedHero.passiveSkillTree).toBeDefined();
        expect(updatedHero.passiveSkillTree?.level).toBe(1);
        expect(updatedHero.passiveSkillTree?.pointsSpent).toBe(0);
        expect(updatedHero.passiveSkillTree?.modifiers).toBeDefined();

        // At level 1, base mult should be 1.0 plus any level 1 unlocks
        expect(updatedHero.passiveSkillTree?.modifiers.attackMult).toBeGreaterThanOrEqual(1.0);
    });

    it('calculates higher levels and more unlocked nodes for a higher level hero', () => {
        const hero = mockHero(50);
        const updatedHero = updateHeroSkills(hero);

        expect(updatedHero.skillTreeNodes).toBeDefined();

        // Find a tier 5 node (req level 40) - should be unlocked
        const t5Node = updatedHero.skillTreeNodes?.find(n => n.tier === 5);
        expect(t5Node).toBeDefined();
        expect(t5Node?.unlocked).toBe(true);

        // Find a tier 6 node (req level 50) - should be unlocked and at least level 1
        const t6Node = updatedHero.skillTreeNodes?.find(n => n.tier === 6);
        expect(t6Node).toBeDefined();
        expect(t6Node?.unlocked).toBe(true);
        expect(t6Node?.level).toBeGreaterThan(0);

        // Find a tier 7 node (req level 60) - should be locked
        const t7Node = updatedHero.skillTreeNodes?.find(n => n.tier === 7);
        expect(t7Node).toBeDefined();
        expect(t7Node?.unlocked).toBe(false);
        expect(t7Node?.level).toBe(0);
    });

    it('adds to existing multipliers properly (Mult ends with Mult)', () => {
        const hero = mockHero(10);
        // Preset passive tree to verify addition works properly
        hero.passiveSkillTree = {
            level: 10,
            pointsSpent: 9,
            offensivePoints: 0,
            defensivePoints: 0,
            utilityPoints: 0,
            modifiers: {
                attackMult: 1.5,
                magicMult: 1.0,
                hpMult: 1.0,
                defenseMult: 1.0,
                speedMult: 1.0,
                critChanceBonus: 0.1,
                critDamageBonus: 0.0,
                damageMitigation: 0.0,
                insanityResistance: 0.0,
                expeditionSpeedBonus: 0.0
            },
            unlockedMilestones: []
        };
        const updatedHero = updateHeroSkills(hero);

        // At level 10, some attack node should unlock and add to attackMult
        // attackMult starts at 1.5, node base is e.g., 0.01
        // Thus attackMult should be strictly > 1.5
        expect(updatedHero.passiveSkillTree?.modifiers.attackMult).toBeGreaterThan(1.5);
        // And non-Mult bonuses like critChanceBonus should be strictly >= 0.1
        expect(updatedHero.passiveSkillTree?.modifiers.critChanceBonus).toBeGreaterThanOrEqual(0.1);
    });
});
