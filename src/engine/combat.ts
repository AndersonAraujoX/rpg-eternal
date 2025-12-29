import type { Hero, Boss, GambitAction, Pet, ConstellationNode, Talent, Artifact, MonsterCard, Achievement } from './types';
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

export const calculateHeroPower = (hero: Hero): number => {
    // Power = (Attack + Magic + (HP / 10) + (Defense / 2)) * (1 + CritChance) * SpeedMultiplier
    // Base Stats
    const stats = hero.stats;
    const baseScore = stats.attack + (stats.magic * 0.5) + (stats.hp * 0.1) + (stats.defense * 0.2);

    // Multipliers (Simplistic approximation based on class/skills not available here, just stats)
    // We don't have crit chance accessible directly on hero stats without talents/eq calculation which is external.
    // For now, let's use Speed as a proxy for DPS multiplier.

    // Speed: 0 is baseline (1x). Each point is +5% speed? No, let's say linear scale.
    // In useGame, effectiveTick = baseTick * speedBonus. 
    // Let's approximate: Power = BaseScore * (1 + stats.speed * 0.05).

    return Math.floor(baseScore * (1 + (stats.speed * 0.05)));
};

export const calculateDamageMultiplier = (souls: number, divinity: number, talents: Talent[], constellations: ConstellationNode[], artifacts: Artifact[], _boss: Boss, cards: MonsterCard[], achievements: Achievement[] = [], pets: Pet[] = []) => {
    const dmgTalent = talents.find(t => t.stat === 'attack');
    const cScale = constellations.find(c => c.bonusType === 'bossDamage');
    const starMult = cScale ? (1 + cScale.level * cScale.valuePerLevel) : 1;
    let mult = (1 + (souls * 0.05) + (divinity * 1.0) + (dmgTalent ? (dmgTalent.level * dmgTalent.valuePerLevel) : 0)) * starMult;

    const hasVoidStone = artifacts.some(a => a.id === 'a2');
    if (hasVoidStone) mult *= 1.5;

    // Card Buffs (Global Attack)
    const attackCards = cards.filter(c => c.stat === 'attack');
    const cardBonus = attackCards.reduce((acc, c) => acc + (c.count * c.value), 0);
    mult *= (1 + cardBonus);

    // Achievement Mastery: +1% Damage per unlocked achievement
    const achievementBonus = achievements.filter(a => a.isUnlocked).length * 0.01;
    mult *= (1 + achievementBonus);

    // Pet Bonuses (+10% DPS etc)
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

// evaluateGambit moved to ./gambits.ts

export const processCombatTurn = (
    heroes: Hero[],
    boss: Boss,
    damageMult: number,
    critChance: number,
    isUltimate: boolean,
    pets: Pet[] = [],
    tickDuration: number = 1000,
    _defenseMult: number = 1,
    lifeSteal: number = 0,
    riftRestriction?: 'no_heal' | 'phys_immune' | 'magic_immune' | 'no_ult' | 'time_crunch'
) => {
    let totalDmg = 0;
    let crits = 0;
    const allies = heroes.filter(h => h.assignment === 'combat' && !h.isDead);

    const updatedHeroes = heroes.map(h => {
        if (h.assignment !== 'combat' || h.isDead || !h.unlocked) return h;

        // Stats snapshot
        let stats = { ...h.stats };

        // Equipment Bonuses
        if (h.equipment) {
            Object.values(h.equipment).forEach(item => {
                if (item) {
                    // Stat Bonus
                    stats[item.stat] += item.value;
                    // Set Bonus (Simplistic check for now, can be optimized)
                    if (item.setId && h.equipment) {
                        // Logic handled later or we pre-calculate sets?
                        // For performance, let's calc sets outside or here?
                        // Optimization: Calculate effective stats ONCE at start of combat?
                        // processCombatTurn runs every tick? Yes.
                        // Recalculating every tick is fine for 3 items.
                    }
                }
            });

            // Apply Item Sets
            const equippedSets = new Map<string, number>();
            Object.values(h.equipment).forEach(i => {
                if (i?.setId) equippedSets.set(i.setId, (equippedSets.get(i.setId) || 0) + 1);
            });

            equippedSets.forEach((count, setId) => {
                const set = ITEM_SETS.find(s => s.id === setId);
                if (set && count >= set.requiredPieces) {
                    // Apply Set Bonus (Multiplier)
                    stats[set.bonusStat] = Math.floor(stats[set.bonusStat] * (1 + set.bonusValue));
                }
            });
        }

        let hp = h.stats.hp; // Start with current HP
        // Adjust Max HP if equipment gave HP
        if (stats.maxHp > h.stats.maxHp) {
            // Proportional HP increase or just flat?
            // Flat is easier but allows healing abuse?
            // Let's simpler: effective maxHp increases. current hp stays (unless healed).
            // Actually, if MaxHP increases, CurrentHP usually stays same absolute value.
            // But we need to clamp.
        }


        // Corruption
        if (h.corruption) {
            stats.attack *= 2;
            stats.maxHp = Math.floor(h.stats.maxHp * 0.5);
            // Ensure HP doesn't exceed corrupted max
            hp = Math.min(hp, stats.maxHp);
            stats.defense = Math.floor(h.stats.defense * 0.5);
        }

        let baseDmg = stats.attack * damageMult * getElementalMult(h.element, boss.element);

        // Active Skills Logic
        if (h.skills) {
            h.skills.forEach(s => {
                if (s.type === 'active') {
                    if (s.currentCooldown > 0) {
                        s.currentCooldown = Math.max(0, s.currentCooldown - (tickDuration / 1000));
                    }

                    if (s.currentCooldown <= 0) {
                        // Activate Skill
                        let canCast = true;
                        // RIFT: No Ult?
                        if (isUltimate && riftRestriction === 'no_ult') canCast = false;

                        if (canCast) {
                            let skillDmg = 0;
                            if (s.effectType === 'damage') {
                                // Apply Skill Multiplier to Base Damage (includes all buffs)
                                skillDmg = baseDmg * s.value;

                                // Element Bonus for Skill? (Optional, if skill has element)
                                if (s.element) {
                                    skillDmg = skillDmg * getElementalMult(s.element, boss.element);
                                }

                                // RIFT: Immunities
                                if (riftRestriction === 'phys_immune' && (h.class === 'Warrior' || h.class === 'Rogue' || h.class === 'Berserker')) skillDmg = 0;
                                if (riftRestriction === 'magic_immune' && (h.class === 'Mage' || h.class === 'Warlock' || h.class === 'Sorcerer')) skillDmg = 0;

                            } else if (s.effectType === 'heal' || s.effectType === 'buff') {
                                // Healing
                                if (riftRestriction !== 'no_heal') {
                                    const healAmount = stats.maxHp * s.value;
                                    hp = Math.min(stats.maxHp, hp + healAmount);
                                }
                                baseDmg = 0;
                                skillDmg = 0;
                            }

                            totalDmg += Math.floor(skillDmg);
                            s.currentCooldown = s.cooldown;
                        }
                    }
                }
            });
        }

        // Gambit Analysis
        let gambitAction: GambitAction = 'attack';
        if (h.gambits && h.gambits.length > 0) {
            for (const g of h.gambits) {
                if (evaluateGambit(h, g, [boss], heroes)) {
                    gambitAction = g.action;
                    break;
                }
            }
        }

        if (gambitAction === 'heal') {
            baseDmg = 0;
            const target = heroes.find(a => !a.isDead && a.stats.hp < a.stats.maxHp);
            if (target) {
                const healAmt = h.stats.magic * 2;
                // Modifying 'target' in 'heroes' array? Use 'updatedHeroes' reference if possible?
                // 'updatedHeroes' is currently being mapped. We can't modify other elements easily.
                // LIMITATION: 'Heal' only works on self or requires a second pass?
                // Actually, we can modify 'heroes' objects if we are careful, but React state immutability.
                // We are inside .map(). We can find the object in the source array, but we can't modify the RESULT of the map for OTHER indices easily.

                // WORKAROUND: Apply heal to self if needed, or if we want to heal ally, we need a smarter way.
                // For this iteration: Self Heal works. Ally Heal is hard.
                if (target.id === h.id) {
                    hp = Math.min(stats.maxHp, hp + healAmt);
                } else {
                    // Start simple: Only Heal Self supported perfectly in this pass for 'heal' action if condition was self.
                    // But if condition was 'ally_hp', we want to heal ally.
                    // We can't reach out and change the other hero's HP in this .map cycle efficiently without side effects.
                    // Let's allow Side Effects on the 'heroes' array references since we are creating 'updatedHeroes' anyway? 
                    // No, 'heroes' prop is likely immutable from state.

                    // Compromise: Heal Self for now.
                    hp = Math.min(stats.maxHp, hp + healAmt);
                }
            }
        } else if (gambitAction === 'strong_attack') {
            if (h.stats.mp >= 10) {
                baseDmg *= 1.5;
                // Deduct MP (not tracked in updatedHeroes properly yet)
            }
        } else if (gambitAction === 'defend') {
            baseDmg *= 0.5;
        } else if (gambitAction === 'cast_fireball') {
            baseDmg += h.stats.magic * 3;
        } else if (gambitAction === 'revive') {
            // Hard to implement in map
            baseDmg = 0;
        }

        if (Math.random() < critChance + (h.class === 'Rogue' ? 0.3 : 0)) {
            baseDmg *= 2;
            crits++;
        }
        if (isUltimate) baseDmg *= 5;

        const heroDamageDealt = Math.floor(baseDmg);
        totalDmg += heroDamageDealt;

        // Return updated hero
        if (heroDamageDealt > 0 && lifeSteal > 0) {
            hp = Math.min(stats.maxHp, hp + (heroDamageDealt * lifeSteal));
        }

        return { ...h, stats: { ...h.stats, hp }, skills: h.skills }; // Return updated skills (cooldowns)
    });

    // Boss Damage to Heroes
    // Boss Damage to Heroes (DISABLED BY USER REQUEST)
    /*
    if (allies.length > 0 && !boss.isDead) {
        // Boss attacks everyone (AOE) or single target? 
        // Let's do a simple tick damage to all combatants for now to make it dangerous.

        updatedHeroes.forEach(h => {
            if (h.assignment === 'combat' && !h.isDead) {
                const defense = h.stats.defense * (h.gambits?.some(g => g.action === 'defend') ? 1.5 : 1) * defenseMult;

                let dmgReceived = Math.max(1, (boss.stats.attack - defense));
                const elMult = getElementalMult(boss.element, h.element);
                dmgReceived = Math.floor(dmgReceived * elMult);

                h.stats.hp = Math.max(0, h.stats.hp - dmgReceived);

                if (h.stats.hp <= 0) {
                    h.isDead = true;
                    // h.statusEffects = []; // Clean up if needed later
                }
            }
        });
    }
    */

    // Pet Damage
    if (pets && pets.length > 0 && allies.some(h => !h.isDead)) {
        // Each pet deals damage
        pets.forEach(p => {
            totalDmg += Math.floor(p.stats.attack * (boss.level * 0.5));
        });
    }

    return { updatedHeroes, totalDmg, crits };
};
