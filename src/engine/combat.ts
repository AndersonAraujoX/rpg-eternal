import type { Hero, Boss, Pet, ConstellationNode, Talent, Artifact, MonsterCard, Achievement, CombatEvent, Item } from './types';
import type { Synergy } from './synergies';
import { checkActiveCombos, type ComboDefinition } from './combos';
import { type TowerMutator } from './mutators';
import { type WeatherType, WEATHER_DATA, getDayNightPhase, DAY_NIGHT_DATA } from './weather';

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

export const calculateDamageMultiplier = (
    souls: number,
    talents: Talent[],
    constellations: ConstellationNode[],
    artifacts: Artifact[],
    _boss: Boss,
    cards: MonsterCard[],
    achievements: Achievement[] = [],
    pets: Pet[] = [],
    galaxyDamageMult: number = 0,
    elementalResonance?: Record<string, number>,
    items: Item[] = []
) => {
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

    // Additive Elemental Resonance Fire and Light Bonus
    if (elementalResonance) {
        const fireLvl = elementalResonance.fire || 0;
        const lightLvl = elementalResonance.light || 0;
        totalBonus += (fireLvl * 0.01) + (lightLvl * 0.015);
    }

    // Additive Void Affix entropy bonus
    if (items) {
        const entropyCount = items.filter(i => i.voidAffix?.id === 'v_entropy').length;
        totalBonus += entropyCount * 0.20;
    }

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
    divinity: number = 0,
    bonds?: Record<string, { xp: number; level: number; type: string }>,
    monumentEffects?: { defense: number; speed: number; maxHp: number; lifesteal: number },
    elementalResonance?: Record<string, number>,
    items: Item[] = [],
    equippedRelics: string[] = []
) => {
    let totalDmg = 0;
    let crits = 0;
    const events: CombatEvent[] = [];

    // Extract Void Affixes
    const activeVoidAffixes = items.map(i => i.voidAffix).filter(Boolean) as any[];
    const hasAbyssalTouch = activeVoidAffixes.some(a => a.id === 'v_abyssal_touch');
    const hasEntropy = activeVoidAffixes.some(a => a.id === 'v_entropy');
    const voidLeechCount = activeVoidAffixes.filter(a => a.id === 'v_void_leech').length;
    const quantumPhaseCount = activeVoidAffixes.filter(a => a.id === 'v_quantum_phase').length;
    const darkPactCount = activeVoidAffixes.filter(a => a.id === 'v_dark_pact').length;

    // Extract Elemental Resonance levels
    const fireRes = elementalResonance?.fire || 0;
    const waterRes = elementalResonance?.water || 0;
    const natureRes = elementalResonance?.nature || 0;
    const lightRes = elementalResonance?.light || 0;
    const darkRes = elementalResonance?.dark || 0;

    // Extract Relics
    const hasVoidOrb = equippedRelics.includes('relic_void_orb');

    // Execução Abissal
    if (hasAbyssalTouch && !boss.isDead && boss.stats.hp > 0 && (boss.stats.hp / boss.stats.maxHp) <= 0.20 && Math.random() < 0.10) {
        boss.stats.hp = 0;
        events.push({
            id: `execute-${Date.now()}-${Math.random()}`,
            type: 'reaction',
            text: '⚡ EXECUÇÃO ABISSAL!',
            x: 50,
            y: 40
        });
    }
 
    // Extract Synergy Effects
    const lifeSteal = (activeSynergies.find(s => s.type === 'vampirism')?.value || 0) + (monumentEffects?.lifesteal || 0) + (voidLeechCount * 0.025) + (lightRes * 0.01);
    const cdReduction = activeSynergies.find(s => s.type === 'cd_reduction')?.value || 0;
    const critDmgBonus = (activeSynergies.find(s => s.type === 'crit_dmg')?.value || 0) + (darkPactCount * 0.35) + (darkRes * 0.02);
    const attackSpeedBonus = activeSynergies.find(s => s.type === 'attackSpeed')?.value || 0;

    // Elemental Reactions
    const burnEffect = activeSynergies.find(s => s.type === 'burn');
    const freezeEffect = activeSynergies.find(s => s.type === 'freeze');

    // Apply Attack Speed logic
    const cappedSpeedBonus = Math.min(attackSpeedBonus, 3.0);
    let effectiveDamageMult = damageMult * (1 + cappedSpeedBonus);

    // Burn Damage (DoT)
    if (burnEffect && !boss.isDead) {
        const burnDmg = Math.floor(boss.stats.maxHp * burnEffect.value * (tickDuration / 1000));
        const actualBurn = Math.max(1, burnDmg);
        totalDmg += actualBurn;

        if (Math.random() < 0.2) {
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
        if (Math.random() < 0.05) {
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
        const deathPenalty = h.isDead ? 0.5 : 1;

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
 
        // Apply Monument Bonuses
        if (monumentEffects) {
            stats.defense = Math.floor(stats.defense * monumentEffects.defense);
            stats.speed = Math.floor(stats.speed * monumentEffects.speed);
            stats.maxHp = Math.floor(stats.maxHp * monumentEffects.maxHp);
        }

        // Apply Resonance & Relics
        stats.maxHp = Math.floor(stats.maxHp * (1 + (waterRes * 0.015) + (equippedRelics.includes('relic_chalice') ? 0.25 : 0)));
        stats.defense = Math.floor(stats.defense * (1 + (waterRes * 0.015)));
        stats.speed = Math.floor(stats.speed * (1 + (natureRes * 0.02)));

        if (darkPactCount > 0) {
            stats.defense = Math.floor(stats.defense * Math.pow(0.88, darkPactCount));
        }
 
        let hp = h.stats.hp;
        if (hp > stats.maxHp) hp = stats.maxHp;

        // Entropy HP drain
        if (hasEntropy && !h.isDead && hp > 0) {
            hp = Math.max(1, hp - Math.floor(stats.maxHp * 0.01 * (tickDuration / 1000)));
        }

        // Maldição do Sangue: perde 1% HP por tick
        if (h.curses?.includes('blood') && !h.isDead) {
            hp = Math.max(1, hp - Math.floor(stats.maxHp * 0.01));
            if (Math.random() < 0.1) {
                events.push({ id: `bloodcurse-${h.id}-${Date.now()}`, type: 'status', text: '🩸 Sangramento', x: 50, y: 50, value: 0 });
            }
        }

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

        let activeDamageMult = effectiveDamageMult;
        if (newInsanity >= 100) {
            activeDamageMult *= 0.5;
        }

        // Camaradas: +15% dano
        let comradesActive = false;
        const otherLivingCombatants = heroes.filter(oth => oth.id !== h.id && oth.assignment === 'combat' && !oth.isDead);
        otherLivingCombatants.forEach(oth => {
            const key = [h.id, oth.id].sort().join('-');
            const bond = bonds?.[key];
            if (bond && bond.level >= 3 && bond.type === 'comrades') {
                comradesActive = true;
            }
        });
        if (comradesActive) activeDamageMult *= 1.15;

        // Almas Gêmeas: +50% dano se o parceiro estiver caído
        let soulmateBerserk = false;
        const otherDeadCombatants = heroes.filter(oth => oth.id !== h.id && oth.assignment === 'combat' && oth.isDead);
        otherDeadCombatants.forEach(oth => {
            const key = [h.id, oth.id].sort().join('-');
            const bond = bonds?.[key];
            if (bond && bond.level >= 3 && bond.type === 'soulmates') {
                soulmateBerserk = true;
            }
        });
        if (soulmateBerserk) {
            activeDamageMult *= 1.5;
            if (Math.random() < 0.1) {
                events.push({ id: `soulmate-berserk-${h.id}-${Date.now()}`, type: 'status', text: '💕 FÚRIA ALMA GÊMEA', x: 50, y: 50, value: 0 });
            }
        }

        // Maldição do Sangue: dano dobrado
        if (h.curses?.includes('blood')) {
            activeDamageMult *= 2;
        }

        let baseDmg = stats.attack * activeDamageMult * getElementalMult(h.element, boss.element);
        baseDmg *= (1 + fireRes * 0.015); // +1.5% damage per level of fire resonance

        if (weather && WEATHER_DATA[weather]?.elementModifiers[h.element]) {
            baseDmg *= WEATHER_DATA[weather].elementModifiers[h.element]!;
        }

        // 🌙 Bônus do Ciclo Dia/Noite
        const dayNightPhase = getDayNightPhase(Math.floor(Date.now() / 1000));
        const dayNightEffect = DAY_NIGHT_DATA[dayNightPhase];
        baseDmg *= dayNightEffect.damageMultiplier;
        if (dayNightEffect.elementBonus[h.element]) {
            baseDmg *= dayNightEffect.elementBonus[h.element]!;
        }

        // 🧬 Mutação Berserk
        if (h.isMutated) {
            baseDmg *= 1.4;
            if (Math.random() < 0.15) {
                attackAlly = true;
                events.push({ id: `mutation-${h.id}-${Date.now()}`, type: 'damage', text: '☠️ FRENESI!', element: 'dark', x: 50, y: 50, value: 0 });
            }
        }

        if (skipTurn || attackAlly) {
            baseDmg = 0;
        }

        let skillDmg = 0;
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
                                let rawSkillDmg = (stats.attack * activeDamageMult) * processedSkill.value;

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
                                let targetHero = h;
                                if (processedSkill.target === 'lowest_hp') {
                                    const allies = heroes.filter(a => a.unlocked && !a.isDead);
                                    if (allies.length > 0) {
                                       targetHero = allies.sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp))[0];
                                    }
                                }

                                let healAmount = stats.maxHp * processedSkill.value;
                                healAmount *= (1 + (lightRes * 0.015));
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
        const finalCritChance = critChance + (h.class === 'Rogue' ? 0.3 : 0) + (darkRes * 0.01);
        if (critRoll < finalCritChance) {
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
        const dodgeChance = quantumPhaseCount * 0.12;

        if (!boss.isDead && !h.isDead && Math.random() < attackChance) {
            if (Math.random() < dodgeChance) {
                events.push({ id: `dodge-${h.id}-${Date.now()}`, type: 'status', text: 'EVADIDO 🌀', x: 50, y: 50 });
            } else {
                let bossDmg = Math.max(1, (boss.stats.attack * 2) - stats.defense);
                if (hasVoidOrb) bossDmg = Math.floor(bossDmg * 0.88);
                let nextHp = hp - bossDmg;
                if (h.curses?.includes('abyss')) {
                    nextHp = Math.max(1, nextHp);
                }
                hp = Math.max(0, nextHp);
                if (hp <= 0) {
                    events.push({ id: `death-${h.id}-${Date.now()}`, type: 'status', text: 'FALLEN', x: 50, y: 50 });
                } else {
                    events.push({ id: `bossatk-${h.id}-${Date.now()}`, type: 'damage', text: `-${Math.floor(bossDmg)}`, x: 50, y: 50 });
                }
            }
        }

        const shouldMutate = newInsanity >= 100 && !h.isMutated;
        const MUTATION_TYPES: Hero['mutationType'][] = ['berserk', 'shadow', 'arcane', 'cursed'];
        const randomMutation = MUTATION_TYPES[Math.floor(Math.random() * MUTATION_TYPES.length)];

        return {
            ...h,
            insanity: newInsanity,
            isMutated: h.isMutated || shouldMutate,
            mutationType: shouldMutate ? randomMutation : h.mutationType,
            stats: { ...h.stats, hp },
            skills: h.skills,
            isDead: hp <= 0
        };
    });

    // Final pass to apply heals
    updatedHeroes = updatedHeroes.map((h, i) => {
        const heal = heroHeals[h.id];
        const originalHero = heroes[i];

        if (heal) {
            const newHp = Math.min(h.stats.maxHp, h.stats.hp + heal);
            return { ...h, isDead: newHp <= 0, stats: { ...h.stats, hp: newHp } };
        }

        const hasDmg = h.stats.hp !== originalHero.stats.hp;
        const hasInsanity = h.insanity !== originalHero.insanity;
        const hasSkillChange = h.skills !== originalHero.skills;

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
