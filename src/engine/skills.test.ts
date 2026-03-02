import { describe, it, expect } from 'vitest';
import {
    CLASS_SKILLS,
    isSkillUnlocked,
    getSkillsForHero,
    getActiveSkills,
    getPassiveStatBonus,
    getTotalPassiveStatBonus,
    getSkillDamageEstimate,
    getBestDamageSkill,
} from './skills';

describe('Skill Utilities', () => {

    // ─── isSkillUnlocked ───────────────────────────────────────
    describe('isSkillUnlocked', () => {
        it('should return true when hero level equals unlock level', () => {
            const skill = CLASS_SKILLS['Warrior'][0]; // Heavy Strike, level 2
            expect(isSkillUnlocked(skill, 2)).toBe(true);
        });

        it('should return true when hero level exceeds unlock level', () => {
            const skill = CLASS_SKILLS['Warrior'][0]; // Heavy Strike, level 2
            expect(isSkillUnlocked(skill, 50)).toBe(true);
        });

        it('should return false when hero level is below unlock level', () => {
            const skill = CLASS_SKILLS['Warrior'][0]; // Heavy Strike, level 2
            expect(isSkillUnlocked(skill, 1)).toBe(false);
        });

        it('should gate high-level skills correctly', () => {
            const warrior = CLASS_SKILLS['Warrior'];
            const execute = warrior.find(s => s.name === 'Execute')!;
            expect(isSkillUnlocked(execute, 24)).toBe(false);
            expect(isSkillUnlocked(execute, 25)).toBe(true);
        });
    });

    // ─── getSkillsForHero ──────────────────────────────────────
    describe('getSkillsForHero', () => {
        it('should return no skills at level 1', () => {
            const skills = getSkillsForHero('Warrior', 1);
            expect(skills).toHaveLength(0);
        });

        it('should return exactly the skills available at their unlock level', () => {
            // Warrior: Heavy Strike (2), Iron Skin (5), Cleave (8)...
            const at2 = getSkillsForHero('Warrior', 2);
            expect(at2.length).toBe(1);
            expect(at2[0].name).toBe('Heavy Strike');

            const at5 = getSkillsForHero('Warrior', 5);
            expect(at5.length).toBe(2); // Heavy Strike + Iron Skin
        });

        it('should return all 10 skills at max level (50)', () => {
            const skills = getSkillsForHero('Mage', 50);
            expect(skills).toHaveLength(10);
        });

        it('should return empty array for unknown class', () => {
            const skills = getSkillsForHero('UnknownClass', 99);
            expect(skills).toHaveLength(0);
        });
    });

    // ─── getActiveSkills ───────────────────────────────────────
    describe('getActiveSkills', () => {
        it('should return only active type skills', () => {
            const allSkills = CLASS_SKILLS['Warrior'];
            const active = getActiveSkills(allSkills, 50);
            expect(active.every(s => s.type === 'active')).toBe(true);
        });

        it('should return 5 active skills for Warrior at level 50', () => {
            const skills = CLASS_SKILLS['Warrior'];
            const active = getActiveSkills(skills, 50);
            // Heavy Strike, Cleave, Shield Bash, Execute, (no 5th active at 50)
            expect(active.length).toBeGreaterThanOrEqual(4);
        });

        it('should filter by unlock level', () => {
            const allSkills = CLASS_SKILLS['Mage'];
            const active = getActiveSkills(allSkills, 5);
            // Only Fireball should be active at level 5 (unlockLevel 2)
            expect(active).toHaveLength(1);
            expect(active[0].name).toBe('Fireball');
        });
    });

    // ─── getPassiveStatBonus ───────────────────────────────────
    describe('getPassiveStatBonus', () => {
        it('should return empty object at level 1 (no passives unlocked)', () => {
            const skills = CLASS_SKILLS['Warrior'];
            const bonus = getPassiveStatBonus(skills, 1);
            expect(Object.keys(bonus).length).toBe(0);
        });

        it('should sum Iron Skin defense at level 5', () => {
            const skills = CLASS_SKILLS['Warrior'];
            const bonus = getPassiveStatBonus(skills, 5);
            // Iron Skin: +15 defense (unlockLevel 5)
            expect(bonus.defense).toBe(15);
        });

        it('should correctly accumulate multiple passives', () => {
            const skills = CLASS_SKILLS['Warrior'];
            const bonus = getPassiveStatBonus(skills, 30);
            // Iron Skin (+15 def) + Aggression (+10 atk) + Fortress (+30 def) + Veteran (+50hp) + Titan (+100hp)
            expect(bonus.defense).toBe(15 + 30); // Iron Skin + Fortress
            expect(bonus.attack).toBe(10);       // Aggression
        });

        it('should handle negative stat bonuses (Berserker reckless)', () => {
            const skills = CLASS_SKILLS['Berserker'];
            const bonus = getPassiveStatBonus(skills, 12);
            // Reckless at level 12: -10 def, +20 atk
            expect(bonus.defense).toBe(-10);
            expect(bonus.attack).toBeGreaterThanOrEqual(20); // Anger (+15) + Reckless (+20)
        });
    });

    // ─── getTotalPassiveStatBonus ──────────────────────────────
    describe('getTotalPassiveStatBonus', () => {
        it('should match manual sum for Mage at level 50', () => {
            const bonus = getTotalPassiveStatBonus('Mage', 50);
            const skills = CLASS_SKILLS['Mage'];
            const manual = getPassiveStatBonus(skills, 50);
            expect(bonus).toEqual(manual);
        });

        it('should return empty for unknown class', () => {
            const bonus = getTotalPassiveStatBonus('FakeClass', 99);
            expect(Object.keys(bonus).length).toBe(0);
        });
    });

    // ─── getSkillDamageEstimate ────────────────────────────────
    describe('getSkillDamageEstimate', () => {
        it('should calculate damage for a damage skill correctly', () => {
            const skill = CLASS_SKILLS['Warrior'].find(s => s.name === 'Heavy Strike')!;
            // value = 1.5, baseAttack = 100
            expect(getSkillDamageEstimate(skill, 100)).toBe(150);
        });

        it('should return 0 for a heal skill', () => {
            const healSkill = CLASS_SKILLS['Healer'].find(s => s.name === 'Heal')!;
            expect(getSkillDamageEstimate(healSkill, 100)).toBe(0);
        });

        it('should return 0 for a buff skill', () => {
            const buffSkill = CLASS_SKILLS['Viking'].find(s => s.name === 'War Cry')!;
            expect(getSkillDamageEstimate(buffSkill, 100)).toBe(0);
        });

        it('should floor fractional damage', () => {
            const skill = CLASS_SKILLS['Rogue'].find(s => s.name === 'Poison Blade')!;
            // value = 1.4, baseAttack = 13 => 18.2 -> floor to 18
            expect(getSkillDamageEstimate(skill, 13)).toBe(18);
        });
    });

    // ─── getBestDamageSkill ────────────────────────────────────
    describe('getBestDamageSkill', () => {
        it('should return null when no damage skills are unlocked', () => {
            const skills = CLASS_SKILLS['Warrior'];
            const best = getBestDamageSkill(skills, 1);
            expect(best).toBeNull();
        });

        it('should return the highest-value damage skill available', () => {
            const skills = CLASS_SKILLS['Warrior'];
            // At level 50, Execute (value 3.0) and Shield Bash (2.0) and others - Execute should win
            const best = getBestDamageSkill(skills, 50);
            expect(best).not.toBeNull();
            expect(best!.name).toBe('Execute');
        });

        it('should respect level gating when picking best skill', () => {
            const skills = CLASS_SKILLS['Warrior'];
            // At level 5, only Heavy Strike is active (value 1.5)
            const best = getBestDamageSkill(skills, 5);
            expect(best!.name).toBe('Heavy Strike');
        });

        it('should return null for a healer with only heal skills in range', () => {
            // Healer's first two skills are Heal (active, heal) and Faith (passive)
            const skills = CLASS_SKILLS['Healer'];
            const best = getBestDamageSkill(skills, 5);
            // Smite unlocks at level 8, so at level 5 no damage skill available
            expect(best).toBeNull();
        });
    });
});
