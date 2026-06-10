import { describe, it, expect } from 'vitest';
import { initOrUpdateHeroPassiveTree } from '../../data/skillTreeData';
import { getPassiveStatBonus, getBestDamageSkill } from '../../engine/skills';
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
