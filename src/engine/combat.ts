import type { Hero, Boss, Pet, ConstellationNode, Talent, Artifact, MonsterCard, Achievement, CombatEvent } from './types';
import type { Synergy } from './synergies';
import { checkActiveCombos, type ComboDefinition } from './combos';
import { type TowerMutator } from './mutators';
import { type WeatherType, WEATHER_DATA } from './weather';

export const getElementalMult = (atkEl: string, defEl: string) => {
    if (atkEl === 'neutral' || defEl === 'neutral') return 1;
    if (atkEl === 'fire' && defEl === 'nature') return 1.5;
    if (atkEl === 'nature' && defEl === 'water') return 1.5;
    if (atkEl === 'water' && defEl === 'fire') return 1.5;
    if (atkEl === 'fire' && defEl === 'water') return 0.5;
    if (atkEl === 'nature' && defEl === 'fire') return 0.5;
    if (atkEl === 'water' && defEl === 'nature') return 0.5;
    if ((atkEl === 'light' && defEl === 'dark') || (atkEl === 'dark' && defEl === 'light')) return 1.5;
    return 1;
};

export const calculateHeroPower = (hero: Hero): number => {
    let stats = { ...hero.stats };
    // Apply Divinity multiplier to base stats before equipment? Or after?
    // Implementation Plan said "Global Multiplier". So after everything.
    // Apply Divinity multiplier to base stats before equipment? Or after?
    // Implementation Plan said "Global Multiplier". So after everything.
    // const divMult = 1 + (divinity * 0.1); 



    const baseScore = (stats.attack + (stats.magic * 0.5) + (stats.hp * 0.1) + (stats.defense * 0.2)) * 0.5;
    let power = Math.floor(baseScore * (1 + (stats.speed * 0.05)));

    // Phase 80: Fatigue Penalty
    if (hero.fatigue) {
        if (hero.fatigue >= 80) power = Math.floor(power * 0.7);
        else if (hero.fatigue >= 50) power = Math.floor(power * 0.9);
    }

    return power;
};

export const calculateDamageMultiplier = (souls: number, talents: Talent[], constellations: ConstellationNode[], artifacts: Artifact[], _boss: Boss, cards: MonsterCard[], achievements: Achievement[] = [], pets: Pet[] = [], galaxyDamageMult: number = 0) => {
    const _talents = talents || [];
    const _constellations = constellations || [];
    const _artifacts = artifacts || [];
    const _cards = cards || [];
    const _pets = pets || [];
    const _achievements = achievements || [];

    // Base multiplier starts at 1
    let totalBonus = 0;
    
    // Additive Soul Bonus
    totalBonus += (souls * 0.05);

    // Additive Talent Bonus
    const dmgTalent = _talents.find(t => t.stat === 'attack');
    if (dmgTalent) totalBonus += (dmgTalent.level * dmgTalent.valuePerLevel);

    // Additive Constellation Bonus
    const cScale = _constellations.find(c => c.bonusType === 'bossDamage');
    if (cScale) totalBonus += (cScale.level * cScale.valuePerLevel);

    // Additive Void Artifact Bonus
    const hasVoidStone = _artifacts.some(a => a.id === 'a2');
    if (hasVoidStone) totalBonus += 0.5;

    // Additive Cards Bonus
    const attackCards = _cards.filter(c => c.stat === 'attack');
    totalBonus += attackCards.reduce((acc, c) => acc + (c.count * c.value), 0);

    // Additive Achievements Bonus
    const achievementBonus = _achievements.filter(a => a.isUnlocked).length * 0.01;
    totalBonus += achievementBonus;

    // Additive Pets Bonus (Dano Crítico e outros buffs viram dps aditivo)
    const petDamageBonus = _pets.reduce((acc, p) => {
        if (p.isDead) return acc;
        if (p.bonus.includes('DPS') || p.bonus.includes('Attack')) {
            const match = p.bonus.match(/(\d+)%/);
            return acc + (match ? parseInt(match[1]) / 100 : 0.1);
        }
        return acc;
    }, 0);
    totalBonus += petDamageBonus * 0.5; // Scale pet dps bonus down

    // Additive Galaxy Bonus
    totalBonus += galaxyDamageMult;

    // Return final linear multiplier to prevent infinite scaling
    return 1 + totalBonus;
};

export const processCombatTurn = (
    heroes: Hero[],
    boss: Boss,
    damageMult: number,
    critChance: number,
    isUltimate: boolean,
    pets: Pet[] = [],
    tickDuration: number = 1000,
    _defenseMult: number = 1,
    activeSynergies: Synergy[] = [],
    riftRestriction?: 'no_heal' | 'phys_immune' | 'magic_immune' | 'no_ult' | 'time_crunch',
    mutator?: TowerMutator,
    weather?: WeatherType,
    divinity: number = 0
) => {
    let totalDmg = 0;
    let crits = 0;
    const events: CombatEvent[] = [];

    // Extract Synergy Effects
    const lifeSteal = activeSynergies.find(s => s.type === 'vampirism')?.value || 0;
    const cdReduction = activeSynergies.find(s => s.type === 'cd_reduction')?.value || 0;
    const critDmgBonus = activeSynergies.find(s => s.type === 'crit_dmg')?.value || 0;
    const attackSpeedBonus = activeSynergies.find(s => s.type === 'attackSpeed')?.value || 0;
    // const mitigation = (activeSynergies.find(s => s.type === 'mitigation')?.value || 0) + (mutator?.id === 'iron_wall' ? 0.5 : 0);

    // Elemental Reactions
    const burnEffect = activeSynergies.find(s => s.type === 'burn');
    const freezeEffect = activeSynergies.find(s => s.type === 'freeze');

    // Apply Attack Speed logic: scale additively but cap the max impact 
    // to prevent astronomical numbers or intervals hitting 0.
    const cappedSpeedBonus = Math.min(attackSpeedBonus, 3.0); // Max +300% effective speed gain
    let effectiveDamageMult = damageMult * (1 + cappedSpeedBonus);

    // Burn Damage (DoT)
    if (burnEffect && !boss.isDead) {
        // 5% Max HP per second implies 0.05 * (tickDuration / 1000)
        // Cap burn to avoid instant cheese on huge bosses? No, % is fun.
        // Let's cap at 100 * Hero Power to prevent 1-shotting raid bosses? 
        const burnDmg = Math.floor(boss.stats.maxHp * burnEffect.value * (tickDuration / 1000));
        const actualBurn = Math.max(1, burnDmg);
        totalDmg += actualBurn;

        // Add Burn Event (throttled visually or just added)
        if (Math.random() < 0.2) { // Don't spam particles every tick
            events.push({
                id: `burn-${Date.now()}-${Math.random()}`,
                type: 'reaction',
                text: 'BURN!',
                value: actualBurn,
                element: 'fire',
                x: 50 + (Math.random() * 10 - 5),
                y: 40
            });
        }
    }

    if (freezeEffect) {
        if (Math.random() < 0.05) { // Occasional freeze status
            events.push({
                id: `freeze-${Date.now()}-${Math.random()}`,
                type: 'status',
                text: 'FROZEN',
                element: 'water',
                x: 50,
                y: 30
            });
        }
    }

    const heroHeals: Record<string, number> = {};

    let updatedHeroes = heroes.map((h) => {
        if (h.assignment !== 'combat' || !h.unlocked) return h;
        const deathPenalty = h.isDead ? 0.5 : 1; // Dead heroes deal 50% damage

        let stats = { ...h.stats };
        // Apply Divinity
        if (divinity > 0) {
            const multiplier = 1 + (divinity * 0.1);
            stats.attack = Math.floor(stats.attack * multiplier);
            stats.defense = Math.floor(stats.defense * multiplier);
            stats.hp = Math.floor(stats.hp * multiplier);
            stats.maxHp = Math.floor(stats.maxHp * multiplier);
            stats.magic = Math.floor(stats.magic * multiplier);
            stats.speed = Math.floor(stats.speed * multiplier);
        }

        let hp = h.stats.hp;

        // Phase 91: Insanity System
        let insanityGain = 0;
        let newInsanity = Math.min(100, (h.insanity || 0) + insanityGain);

        let skipTurn = false;
        let attackAlly = false;

        if (newInsanity >= 75) {
            if (Math.random() < 0.2) {
                skipTurn = true;
                events.push({ id: `madness-${h.id}-${Date.now()}`, type: 'status', text: 'MADNESS', element: 'dark', x: 50, y: 50, value: 0 });
            }
        }

        if (!skipTurn && newInsanity >= 50) {
            if (Math.random() < 0.1) {
                attackAlly = true;
                events.push({ id: `betrayal-${h.id}-${Date.now()}`, type: 'damage', text: 'BETRAYAL!', element: 'dark', x: 50, y: 50, value: 0 });
            }
        }

        if (newInsanity >= 100) {
            effectiveDamageMult *= 0.5;
        }

        let baseDmg = stats.attack * effectiveDamageMult * getElementalMult(h.element, boss.element);

        if (weather && WEATHER_DATA[weather]?.elementModifiers[h.element]) {
            baseDmg *= WEATHER_DATA[weather].elementModifiers[h.element]!;
        }

        if (skipTurn || attackAlly) {
            baseDmg = 0;
        }

        let skillDmg = 0;
        // Active Skills Logic
        if (h.skills && !skipTurn && !attackAlly) {
            h.skills.forEach(s => {
                if (s.type === 'active') {
                    if (s.currentCooldown > 0) {
                        if (mutator?.id === 'elemental_chaos' && h.element !== 'neutral') {
                            baseDmg *= 2;
                        }
                        const reductionMult = 1 + cdReduction;
                        s.currentCooldown = Math.max(0, s.currentCooldown - ((tickDuration / 1000) * reductionMult));
                    }

                    if (s.currentCooldown <= 0) {
                        let canCast = true;
                        if (isUltimate && riftRestriction === 'no_ult') canCast = false;

                        let processedSkill = { ...s };
                        let isHealConverted = false;
                        if (processedSkill.effectType === 'heal' && mutator?.id === 'bloodthirst') {
                            processedSkill.effectType = 'damage';
                            processedSkill.value *= 1.5;
                            isHealConverted = true;
                        }

                        if (processedSkill.effectType === 'heal' && riftRestriction === 'no_heal') canCast = false;

                        if (canCast) {
                            if (processedSkill.effectType === 'damage') {
                                let rawSkillDmg = (stats.attack * effectiveDamageMult) * processedSkill.value;

                                if (processedSkill.element) {
                                    rawSkillDmg *= getElementalMult(processedSkill.element, boss.element);
                                    if (weather && WEATHER_DATA[weather]?.elementModifiers[processedSkill.element]) {
                                        rawSkillDmg *= WEATHER_DATA[weather].elementModifiers[processedSkill.element]!;
                                    }
                                }

                                if (riftRestriction === 'phys_immune' && ['Warrior', 'Rogue', 'Berserker'].includes(h.class)) rawSkillDmg = 0;
                                if (riftRestriction === 'magic_immune' && ['Mage', 'Warlock', 'Sorcerer'].includes(h.class)) rawSkillDmg = 0;

                                if (isHealConverted && Math.random() < 0.2) events.push({ id: `blood-${h.id}-${Date.now()}`, type: 'status', text: 'Bloodthirst!', value: 0 });

                                skillDmg += rawSkillDmg;
                            } else if (processedSkill.effectType === 'heal') {
                                // HEAL LOGIC
                                let targetHero = h;
                                if (processedSkill.target === 'lowest_hp') {
                                    const allies = heroes.filter(a => a.unlocked && !a.isDead);
                                    if (allies.length > 0) {
                                       targetHero = allies.sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp))[0];
                                    }
                                }

                                const healAmount = stats.maxHp * processedSkill.value;
                                heroHeals[targetHero.id] = (heroHeals[targetHero.id] || 0) + healAmount;
                                events.push({ id: `heal-${h.id}-${Date.now()}`, type: 'status', text: 'HEAL', value: healAmount, x: 50, y: 50 });
                            }
                            s.currentCooldown = s.cooldown;
                        }
                    }
                }
            });
        }

        const critRoll = Math.random();
        if (critRoll < critChance + (h.class === 'Rogue' ? 0.3 : 0)) {
            const critMult = 2 + critDmgBonus;
            baseDmg *= critMult;
            skillDmg *= critMult;
            crits++;
        }

        let totalHeroAttack = baseDmg + skillDmg;

        if (isUltimate) {
            const activeCombos = checkActiveCombos(heroes);
            if (activeCombos.length > 0) {
                const bestCombo = activeCombos.sort((a: ComboDefinition, b: ComboDefinition) => b.multiplier - a.multiplier)[0];
                totalHeroAttack *= bestCombo.multiplier;
                if (Math.random() < 0.2) {
                    events.push({ id: `combo-${Date.now()}-${Math.random()}`, type: 'damage', text: `COMBO: ${bestCombo.name}!`, value: 0, x: 50, y: 20 });
                }
            } else {
                totalHeroAttack *= 5;
            }
        }

        const heroDamageDealt = Math.floor(totalHeroAttack * deathPenalty);
        totalDmg += heroDamageDealt;

        if (heroDamageDealt > 0 && lifeSteal > 0 && !h.isDead) {
            hp = Math.min(stats.maxHp, hp + (heroDamageDealt * lifeSteal));
        }

        // BOSS ATTACK LOGIC — only hits living heroes
        const attackChance = 0.3 * (tickDuration / 1000);

        if (!boss.isDead && !h.isDead && Math.random() < attackChance) {
            const bossDmg = Math.max(1, (boss.stats.attack * 2) - stats.defense);
            hp = Math.max(0, hp - bossDmg);
            if (hp <= 0) {
                events.push({ id: `death-${h.id}-${Date.now()}`, type: 'status', text: 'FALLEN', x: 50, y: 50 });
            } else {
                events.push({ id: `bossatk-${h.id}-${Date.now()}`, type: 'damage', text: `-${Math.floor(bossDmg)}`, x: 50, y: 50 });
            }
        }

        return { ...h, insanity: newInsanity, stats: { ...h.stats, hp }, skills: h.skills, isDead: hp <= 0 };
    });

    // Final pass to apply heals (Referential stability: only clone if changed)
    updatedHeroes = updatedHeroes.map((h, i) => {
        const heal = heroHeals[h.id];
        const originalHero = heroes[i]; // Reference to initial input

        if (heal) {
            const newHp = Math.min(h.stats.maxHp, h.stats.hp + heal);
            // If even after heal/insanity/damage nothing changed significantly from the START of the turn
            // we could return originalHero. But usually combat implies changes.
            return { ...h, isDead: newHp <= 0, stats: { ...h.stats, hp: newHp } };
        }

        // Deep check: did insanity OR hp change from the HEROES array passed in?
        const hasDmg = h.stats.hp !== originalHero.stats.hp;
        const hasInsanity = h.insanity !== originalHero.insanity;
        const hasSkillChange = h.skills !== originalHero.skills; // skills are mutated in-place sometimes in the loop above? No, let's be safe.

        if (!hasDmg && !hasInsanity && !hasSkillChange && h.isDead === originalHero.isDead) {
            return originalHero;
        }

        return h;
    });

    if (pets && pets.length > 0) {
        pets.forEach(p => {
            totalDmg += Math.floor(p.stats.attack * (boss.level * 0.5));
        });
    }

    return { updatedHeroes, totalDmg, crits, events };
};
