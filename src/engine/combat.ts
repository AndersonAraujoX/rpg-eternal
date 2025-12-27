import type { Hero, Boss, GambitAction, Pet, ConstellationNode, Talent, Artifact, MonsterCard } from './types';

export const getElementalMult = (atkEl: string, defEl: string) => {
    if (atkEl === 'neutral' || defEl === 'neutral') return 1;
    if (atkEl === 'fire' && defEl === 'nature') return 1.5;
    if (atkEl === 'nature' && defEl === 'water') return 1.5;
    if (atkEl === 'water' && defEl === 'fire') return 1.5;
    if (atkEl === 'fire' && defEl === 'water') return 0.5;
    if (atkEl === 'nature' && defEl === 'fire') return 0.5;
    if (atkEl === 'water' && defEl === 'nature') return 0.5;
    return 1;
};

export const calculateDamageMultiplier = (souls: number, divinity: number, talents: Talent[], constellations: ConstellationNode[], artifacts: Artifact[], boss: Boss, cards: MonsterCard[]) => {
    const dmgTalent = talents.find(t => t.stat === 'attack');
    const cScale = constellations.find(c => c.bonusType === 'bossDamage');
    const starMult = cScale ? (1 + cScale.level * cScale.valuePerLevel) : 1;
    let mult = (1 + (souls * 0.05) + (divinity * 1.0) + (dmgTalent ? (dmgTalent.level * dmgTalent.valuePerLevel) : 0)) * starMult;

    const hasVoidStone = artifacts.some(a => a.id === 'a2');
    if (hasVoidStone) mult *= 1.5;

    const relevantCard = cards.find(c => c.id === boss.emoji);
    if (relevantCard) mult *= (1 + (relevantCard.bonus * relevantCard.count));

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
    pet: Pet | null
) => {
    let totalDmg = 0;
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

        // Gambit
        const action = evaluateGambit(h, heroes, boss);

        if (action === 'heal') {
            baseDmg = 0; // Sacrifices attack to heal (handled externally or simplified)
        } else if (action === 'strong_attack') {
            baseDmg *= 1.5;
        } else if (action === 'defend') {
            baseDmg *= 0.5;
        }

        if (Math.random() < critChance + (h.class === 'Rogue' ? 0.3 : 0)) baseDmg *= 2;
        if (isUltimate) baseDmg *= 5;

        totalDmg += Math.floor(baseDmg);

        // Return updated hero (HP maintained for now, healing done separately)
        return { ...h, stats: { ...h.stats, hp } };
    });

    // Pet Damage
    if (pet && allies.some(h => !h.isDead)) {
        totalDmg += Math.floor(pet.stats.attack * (boss.level * 0.5));
    }

    return { updatedHeroes, totalDmg };
};
