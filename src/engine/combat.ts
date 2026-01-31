import type { Hero, Boss, GambitAction, Pet, ConstellationNode, Talent, Artifact, MonsterCard, Achievement } from './types';
import type { Synergy } from './synergies';
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
    const stats = hero.stats;
    const baseScore = stats.attack + (stats.magic * 0.5) + (stats.hp * 0.1) + (stats.defense * 0.2);
    return Math.floor(baseScore * (1 + (stats.speed * 0.05)));
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
    // defenseMult unused
    // _defenseMult: number = 1,
    synergies: Synergy[] = [],
    riftRestriction?: 'no_heal' | 'phys_immune' | 'magic_immune' | 'no_ult' | 'time_crunch'
) => {
    let totalDmg = 0;
    let crits = 0;

    // Extract Synergy Effects
    const lifeSteal = synergies.find(s => s.type === 'vampirism')?.value || 0;
    const cdReduction = synergies.find(s => s.type === 'cd_reduction')?.value || 0;
    const critDmgBonus = synergies.find(s => s.type === 'crit_dmg')?.value || 0;
    const burnEffect = synergies.find(s => s.type === 'burn');
    // const freezeEffect = synergies.find(s => s.type === 'freeze');

    // Burn Damage (DoT)
    if (burnEffect && !boss.isDead) {
        // 5% Max HP per second implies 0.05 * (tickDuration / 1000)
        // Cap burn to avoid instant cheese on huge bosses? No, % is fun.
        // Let's cap at 100 * Hero Power to prevent 1-shotting raid bosses? 
        // For now, raw percentage.
        const burnDmg = Math.floor(boss.stats.maxHp * burnEffect.value * (tickDuration / 1000));
        totalDmg += Math.max(1, burnDmg);
    }

    const updatedHeroes = heroes.map(h => {
        if (h.assignment !== 'combat' || h.isDead || !h.unlocked) return h;

        const stats = { ...h.stats };

        if (h.equipment) {
            Object.values(h.equipment).forEach(item => {
                if (item) {
                    stats[item.stat] += item.value;
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

        let hp = h.stats.hp; // Start with current HP
        if (stats.maxHp > h.stats.maxHp) {
            // Logic for MaxHP change handling if needed
        }

        if (h.corruption) {
            stats.attack *= 2;
            stats.maxHp = Math.floor(h.stats.maxHp * 0.5);
            hp = Math.min(hp, stats.maxHp);
            stats.defense = Math.floor(h.stats.defense * 0.5);
        }

        let baseDmg = stats.attack * damageMult * getElementalMult(h.element, boss.element);

        // Active Skills Logic
        if (h.skills) {
            h.skills.forEach(s => {
                if (s.type === 'active') {
                    if (s.currentCooldown > 0) {
                        // Apply CD Reduction Synergy
                        const reductionMult = 1 + cdReduction;
                        s.currentCooldown = Math.max(0, s.currentCooldown - ((tickDuration / 1000) * reductionMult));
                    }

                    if (s.currentCooldown <= 0) {
                        let canCast = true;
                        if (isUltimate && riftRestriction === 'no_ult') canCast = false;

                        if (canCast) {
                            let skillDmg = 0;
                            if (s.effectType === 'damage') {
                                skillDmg = baseDmg * s.value;
                                if (s.element) {
                                    skillDmg = skillDmg * getElementalMult(s.element, boss.element);
                                }
                                if (riftRestriction === 'phys_immune' && (h.class === 'Warrior' || h.class === 'Rogue' || h.class === 'Berserker')) skillDmg = 0;
                                if (riftRestriction === 'magic_immune' && (h.class === 'Mage' || h.class === 'Warlock' || h.class === 'Sorcerer')) skillDmg = 0;
                            } else if (s.effectType === 'heal' || s.effectType === 'buff') {
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
                if (target.id === h.id) {
                    hp = Math.min(stats.maxHp, hp + healAmt);
                } else {
                    hp = Math.min(stats.maxHp, hp + healAmt); // Self heal fallback
                }
            }
        } else if (gambitAction === 'strong_attack') {
            if (h.stats.mp >= 10) {
                baseDmg *= 1.5;
            }
        } else if (gambitAction === 'defend') {
            baseDmg *= 0.5;
        } else if (gambitAction === 'cast_fireball') {
            baseDmg += h.stats.magic * 3;
        }

        const critRoll = Math.random();
        // Base crit chance + Bonus
        if (critRoll < critChance + (h.class === 'Rogue' ? 0.3 : 0)) {
            // Shadow Strike Synergy: +50% Crit Damage (Base 2x -> 2.5x)
            const critMult = 2 + critDmgBonus;
            baseDmg *= critMult;
            crits++;
        }

        if (isUltimate) baseDmg *= 5;

        // Freeze Synergy: Boss takes more damage? (Optional interpretation)
        // Or we implement it in boss attack logic later.

        const heroDamageDealt = Math.floor(baseDmg);
        totalDmg += heroDamageDealt;

        if (heroDamageDealt > 0 && lifeSteal > 0) {
            hp = Math.min(stats.maxHp, hp + (heroDamageDealt * lifeSteal));
        }

        return { ...h, stats: { ...h.stats, hp }, skills: h.skills };
    });

    if (pets && pets.length > 0) {
        pets.forEach(p => {
            totalDmg += Math.floor(p.stats.attack * (boss.level * 0.5));
        });
    }

    return { updatedHeroes, totalDmg, crits };
};
