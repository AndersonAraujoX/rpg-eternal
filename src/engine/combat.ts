import type { Hero, Boss, GambitAction, Pet, ConstellationNode, Talent, Artifact, MonsterCard, Achievement, CombatEvent } from './types';
import type { Synergy } from './synergies';
import { checkActiveCombos, type ComboDefinition } from './combos';
import { type TowerMutator } from './mutators';
import { type WeatherType } from './weather';
import { evaluateGambit } from './gambits';
import { ITEM_SETS } from './sets';

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

export const calculateHeroPower = (hero: Hero, divinity: number = 0): number => {
    let stats = { ...hero.stats };
    // Apply Divinity multiplier to base stats before equipment? Or after?
    // Implementation Plan said "Global Multiplier". So after everything.
    // Apply Divinity multiplier to base stats before equipment? Or after?
    // Implementation Plan said "Global Multiplier". So after everything.
    // const divMult = 1 + (divinity * 0.1); 

    if (hero.equipment) {
        const runeMultipliers: Record<string, number> = {};
        const setCounts: Record<string, number> = {};

        Object.values(hero.equipment).forEach(item => {
            if (item) {
                stats[item.stat] += item.value;
                if (item.runes) {
                    item.runes.forEach(rune => {
                        runeMultipliers[rune.stat] = (runeMultipliers[rune.stat] || 0) + rune.value;
                    });
                }
                if (item.setId) {
                    setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
                }
            }
        });

        // Apply Set Bonuses
        Object.entries(setCounts).forEach(([setId, count]) => {
            const set = ITEM_SETS.find(s => s.id === setId);
            if (set && count >= set.requiredPieces) {
                // Apply bonus (additive to rune multipliers for simplicity, or separate?)
                // Let's add to runeMultipliers to reuse the multiplier logic
                runeMultipliers[set.bonusStat] = (runeMultipliers[set.bonusStat] || 0) + set.bonusValue;
            }
        });

        (Object.keys(runeMultipliers) as Array<keyof typeof stats>).forEach(stat => {
            if (stats[stat] !== undefined) {
                stats[stat] = Math.floor(stats[stat] * (1 + runeMultipliers[stat]!));
            }
        });
    }

    const baseScore = stats.attack + (stats.magic * 0.5) + (stats.hp * 0.1) + (stats.defense * 0.2);
    let power = Math.floor(baseScore * (1 + (stats.speed * 0.05)) * (1 + (divinity * 0.1)));

    // Phase 80: Fatigue Penalty
    if (hero.fatigue) {
        if (hero.fatigue >= 80) power = Math.floor(power * 0.7);
        else if (hero.fatigue >= 50) power = Math.floor(power * 0.9);
    }

    return power;
};

export const calculateDamageMultiplier = (souls: number, divinity: number, talents: Talent[], constellations: ConstellationNode[], artifacts: Artifact[], _boss: Boss, cards: MonsterCard[], achievements: Achievement[] = [], pets: Pet[] = []) => {
    const dmgTalent = talents.find(t => t.stat === 'attack');
    const cScale = constellations.find(c => c.bonusType === 'bossDamage');
    const starMult = cScale ? (1 + cScale.level * cScale.valuePerLevel) : 1;
    let mult = (1 + (souls * 0.05) + (divinity * 1.0) + (dmgTalent ? (dmgTalent.level * dmgTalent.valuePerLevel) : 0)) * starMult;

    const hasVoidStone = artifacts.some(a => a.id === 'a2');
    if (hasVoidStone) mult *= 1.5;

    const attackCards = cards.filter(c => c.stat === 'attack');
    const cardBonus = attackCards.reduce((acc, c) => acc + (c.count * c.value), 0);
    mult *= (1 + cardBonus);

    const achievementBonus = achievements.filter(a => a.isUnlocked).length * 0.01;
    mult *= (1 + achievementBonus);

    const petDamageBonus = pets.reduce((acc, p) => {
        if (p.isDead) return acc;
        if (p.bonus.includes('DPS') || p.bonus.includes('Attack')) {
            const match = p.bonus.match(/(\d+)%/);
            return acc + (match ? parseInt(match[1]) / 100 : 0.1);
        }
        return acc;
    }, 0);
    mult *= (1 + petDamageBonus);

    return mult;
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

    // Apply Attack Speed as extra damage multiplier for now (simulating more hits)
    let effectiveDamageMult = damageMult * (1 + attackSpeedBonus);

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

    let updatedHeroes = heroes.map(h => {
        if (h.assignment !== 'combat' || h.isDead || !h.unlocked) return h;

        let stats = { ...h.stats };
        // Apply Divinity
        if (divinity > 0) {
            const multilplier = 1 + (divinity * 0.1);
            stats.attack = Math.floor(stats.attack * multilplier);
            stats.defense = Math.floor(stats.defense * multilplier);
            stats.hp = Math.floor(stats.hp * multilplier);
            stats.maxHp = Math.floor(stats.maxHp * multilplier);
            stats.magic = Math.floor(stats.magic * multilplier);
            stats.speed = Math.floor(stats.speed * multilplier);
        }

        if (h.equipment) {
            const runeMultipliers: Record<string, number> = {};

            Object.values(h.equipment).forEach(item => {
                if (item) {
                    stats[item.stat] += item.value;

                    // Apply Runes
                    if (item.runes) {
                        item.runes.forEach(rune => {
                            runeMultipliers[rune.stat] = (runeMultipliers[rune.stat] || 0) + rune.value;
                        });
                    }
                }
            });

            // Iterate multipliers and apply to stats
            (Object.keys(runeMultipliers) as Array<keyof typeof stats>).forEach(stat => {
                if (stats[stat] !== undefined) {
                    stats[stat] = Math.floor(stats[stat] * (1 + runeMultipliers[stat]!));
                }
            });

            const equippedSets = new Map<string, number>();
            Object.values(h.equipment).forEach(i => {
                if (i?.setId) equippedSets.set(i.setId, (equippedSets.get(i.setId) || 0) + 1);
            });

            equippedSets.forEach((count, setId) => {
                const set = ITEM_SETS.find(s => s.id === setId);
                if (set && count >= set.requiredPieces) {
                    stats[set.bonusStat] = Math.floor(stats[set.bonusStat] * (1 + set.bonusValue));
                }
            });
        }

        let hp = h.stats.hp;

        // Phase 91: Insanity System
        const hasVoidItem = h.equipment && Object.values(h.equipment).some(item => item?.suffix?.name === 'of the Void');
        let insanityGain = hasVoidItem ? 1 : 0;
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

        if (skipTurn || attackAlly) {
            baseDmg = 0;
        }

        // Active Skills Logic
        if (h.skills) {
            h.skills.forEach(s => {
                if (s.type === 'active') {
                    let skillDmg = 0;

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
                                }

                                if (riftRestriction === 'phys_immune' && ['Warrior', 'Rogue', 'Berserker'].includes(h.class)) rawSkillDmg = 0;
                                if (riftRestriction === 'magic_immune' && ['Mage', 'Warlock', 'Sorcerer'].includes(h.class)) rawSkillDmg = 0;

                                if (isHealConverted && Math.random() < 0.2) events.push({ id: `blood-${h.id}-${Date.now()}`, type: 'status', text: 'Bloodthirst!', value: 0 });

                                skillDmg = rawSkillDmg;
                            } else if (processedSkill.effectType === 'heal') {
                                // HEAL LOGIC
                                let targetHero = h;
                                if (processedSkill.target === 'lowest_hp') {
                                    const allies = heroes.filter(a => !a.isDead && a.unlocked);
                                    targetHero = allies.sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp))[0] || h;
                                }

                                const healAmount = stats.maxHp * processedSkill.value;
                                heroHeals[targetHero.id] = (heroHeals[targetHero.id] || 0) + healAmount;
                                events.push({ id: `heal-${h.id}-${Date.now()}`, type: 'status', text: 'HEAL', value: healAmount, x: 50, y: 50 });
                                baseDmg = 0;
                            }
                            s.currentCooldown = s.cooldown;
                        }
                    }
                    totalDmg += Math.floor(skillDmg);
                }
            });
        }

        // Gambit Analysis
        let gambitAction: GambitAction = 'attack';
        if (h.gambits && h.gambits.length > 0) {
            for (const g of h.gambits) {
                if (evaluateGambit(h, g, [boss], heroes, weather)) {
                    gambitAction = g.action;
                    break;
                }
            }
        }

        if (gambitAction === 'heal') {
            baseDmg = 0;
            const target = heroes.filter(a => !a.isDead && a.unlocked).sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp))[0];
            if (target) {
                const healAmt = stats.magic * 2;
                heroHeals[target.id] = (heroHeals[target.id] || 0) + healAmt;
            }
        } else if (gambitAction === 'strong_attack') {
            if (h.stats.mp >= 10) { baseDmg *= 1.5; }
        } else if (gambitAction === 'aoe_attack') {
            baseDmg += stats.magic * 3;
        }

        const critRoll = Math.random();
        if (critRoll < critChance + (h.class === 'Rogue' ? 0.3 : 0)) {
            const critMult = 2 + critDmgBonus;
            baseDmg *= critMult;
            crits++;
        }

        if (isUltimate) {
            const activeCombos = checkActiveCombos(heroes);
            if (activeCombos.length > 0) {
                const bestCombo = activeCombos.sort((a: ComboDefinition, b: ComboDefinition) => b.multiplier - a.multiplier)[0];
                baseDmg *= bestCombo.multiplier;
                if (Math.random() < 0.2) {
                    events.push({ id: `combo-${Date.now()}-${Math.random()}`, type: 'damage', text: `COMBO: ${bestCombo.name}!`, value: 0, x: 50, y: 20 });
                }
            } else {
                baseDmg *= 5;
            }
        }

        const heroDamageDealt = Math.floor(baseDmg);
        totalDmg += heroDamageDealt;

        if (heroDamageDealt > 0 && lifeSteal > 0) {
            hp = Math.min(stats.maxHp, hp + (heroDamageDealt * lifeSteal));
        }

        // BOSS ATTACK LOGIC (New)
        // Scale probability by tick duration (standard 1s = 30% chance)
        const attackChance = 0.3 * (tickDuration / 1000);

        if (!boss.isDead && Math.random() < attackChance) { // chance for boss to strike this hero
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

    // Final pass to apply heals
    updatedHeroes = updatedHeroes.map(h => {
        const heal = heroHeals[h.id];
        if (heal) {
            return { ...h, stats: { ...h.stats, hp: Math.min(h.stats.maxHp, h.stats.hp + heal) } };
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
