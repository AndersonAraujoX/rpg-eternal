import type { Hero, Boss, GambitAction, Pet, ConstellationNode, Talent, Artifact, MonsterCard, Achievement } from './types';

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

export const calculateDamageMultiplier = (souls: number, divinity: number, talents: Talent[], constellations: ConstellationNode[], artifacts: Artifact[], boss: Boss, cards: MonsterCard[], achievements: Achievement[] = []) => {
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

    return mult;
};

export const evaluateGambit = (hero: Hero, allies: Hero[], boss: Boss): GambitAction => {
    if (!hero.gambits || hero.gambits.length === 0) return 'attack';

    for (const g of hero.gambits) {
        let conditionMet = false;
        if (g.condition === 'always') conditionMet = true;
        if (g.condition === 'hp<50' && hero.stats.hp < hero.stats.maxHp * 0.5) conditionMet = true;
        if (g.condition === 'hp<30' && hero.stats.hp < hero.stats.maxHp * 0.3) conditionMet = true;
        if (g.condition === 'enemy_boss' && boss.type === 'boss') conditionMet = true;
        if (g.condition === 'ally_hp<50' && allies.some(ally => ally.assignment === 'combat' && !ally.isDead && ally.stats.hp < ally.stats.maxHp * 0.5)) conditionMet = true;

        if (conditionMet) return g.action;
    }
    return 'attack';
};

export const processCombatTurn = (
    heroes: Hero[],
    boss: Boss,
    damageMult: number,
    critChance: number,
    isUltimate: boolean,
    pet: Pet | null,
    tickDuration: number = 1000,
    defenseMult: number = 1,
    lifeSteal: number = 0
) => {
    let totalDmg = 0;
    let crits = 0;
    const allies = heroes.filter(h => h.assignment === 'combat' && !h.isDead);

    const updatedHeroes = heroes.map(h => {
        if (h.assignment !== 'combat' || h.isDead || !h.unlocked) return h;

        // Stats snapshot
        let hp = h.stats.hp;
        let stats = { ...h.stats };

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
                        let skillDmg = 0;
                        if (s.effectType === 'damage') {
                            // Apply Skill Multiplier to Base Damage (includes all buffs)
                            skillDmg = baseDmg * s.value;

                            // Element Bonus for Skill? (Optional, if skill has element)
                            if (s.element) {
                                skillDmg = skillDmg * getElementalMult(s.element, boss.element);
                            }
                        } else if (s.effectType === 'heal' || s.effectType === 'buff') {
                            // Healing (Simulated or Real)
                            const healAmount = stats.maxHp * s.value;
                            // Heal self or lowest hp ally?
                            // For simplicity in this function, we treat healing as damage mitigation or direct heal
                            // Let's heal SELF for now or rely on game loop to update heroes state.
                            // Limitation: updatedHeroes is map() result. Can't easily modify other heroes.
                            // So we heal SELF or add "healing" to output to process later?
                            // Simpler: Heal SELF here.
                            hp = Math.min(stats.maxHp, hp + healAmount);
                            baseDmg = 0; // Skill cast replaces attack? Or adds to it? 
                            // Usually auto-cast is separate. Let's make it separate (ADDITIVE).
                            // But if healing, it deals 0 dmg.
                            skillDmg = 0;
                        }

                        totalDmg += Math.floor(skillDmg);
                        s.currentCooldown = s.cooldown;
                    }
                }
            });
        }

        // Gambit
        const action = evaluateGambit(h, heroes, boss);

        if (action === 'heal') {
            baseDmg = 0;
        } else if (action === 'strong_attack') {
            baseDmg *= 1.5;
        } else if (action === 'defend') {
            baseDmg *= 0.5;
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
    if (pet && allies.some(h => !h.isDead)) {
        totalDmg += Math.floor(pet.stats.attack * (boss.level * 0.5));
    }

    return { updatedHeroes, totalDmg, crits };
};
