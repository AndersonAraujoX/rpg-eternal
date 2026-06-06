import type { Hero, Stats, PassiveSkillModifiers, PassiveSkillTreeState } from '../engine/types';

export interface Milestone {
    level: number;
    name: string;
    description: string;
    brief: string;
}

export const MILESTONES: Milestone[] = [

    {
        level: 10,
        name: 'Despertar Feudal',
        brief: '+5% Ataque e +5% Defesa',
        description: 'Os guerreiros feudais sentem uma conexão mais forte com o código de honra. Concede +5% de Ataque e +5% de Defesa.'
    },
    {
        level: 25,
        name: 'Vassalagem Inabalável',
        brief: '+10% Vida e +5% Velocidade',
        description: 'O juramento de vassalagem fortalece o vigor e a agilidade física. Concede +10% de Vida Máxima e +5% de Velocidade.'
    },
    {
        level: 50,
        name: 'Fronteira Liminar',
        brief: '+15% Dano Geral e +10% Resist. Insanidade',
        description: 'Os heróis alcançam a transição entre o castelo medieval e os corredores frios dos Backrooms. Espadas de ferro começam a ressonar com lâmpadas fluorescentes de 60Hz. Concede +15% de Dano Físico/Mágico e +10% de Resistência à Insanidade.'
    },
    {
        level: 75,
        name: 'Alquimia de Nível 4',
        brief: '+20% Magia, +10% Mitigação e +15% Expedição',
        description: 'Transmutar Água de Amêndoas com ervas medievais cria uma poção exótica. Concede +20% de Magia, +10% de Mitigação de Dano e +15% de Poder/Velocidade de Expedição.'
    },
    {
        level: 100,
        name: 'Glória Eterna no Labirinto',
        brief: '+25% Todos Atributos, +5% Crítico, +15% Dano Crítico e +15% Resist. Insanidade',
        description: 'O herói transcende os limites de ambos os mundos. A coroa de ouro brilha na escuridão dos níveis infinitos do labirinto. Concede +25% para todos os atributos básicos, +5% de Chance de Crítico, +15% de Dano Crítico e +15% de Resistência à Insanidade.'
    }
];

// Helper mapping to determine the path priority for each class
export const getClassPriority = (classType: string): 'defensive' | 'offensive' | 'utility' => {
    const cls = classType.toLowerCase();

    // 1. Defensive Priority (Warriors, Paladins, Monks, etc.)
    const defensiveClasses = [
        'warrior', 'warlord',
        'paladin', 'crusader',
        'templar', 'high templar',
        'monk', 'grandmaster',
        'viking', 'jarl',
        'blacksmith', 'forge master',
        'dragoon', 'dragon lord'
    ];

    // 2. Offensive Priority (Mages, Rangers, Rogues, etc.)
    const offensiveClasses = [
        'mage', 'archmage',
        'rogue', 'assassin', 'shadowblade',
        'warlock', 'demonologist',
        'necromancer', 'lich',
        'ranger', 'sniper',
        'berserker', 'chieftain',
        'sorcerer', 'arcanist',
        'samurai', 'shogun',
        'ninja', 'shinobi',
        'pirate', 'admiral',
        'hunter'
    ];

    // 3. Support/Utility Priority (Healers, Clerics, Bards, Druids, Miners, Alchemists, etc.)
    const utilityClasses = [
        'healer', 'saint',
        'cleric',
        'bard', 'virtuoso',
        'druid', 'archdruid',
        'sage', 'prophet',
        'engineer', 'artificer',
        'alchemist', 'transmuter',
        'illusionist', 'mirage',
        'fisherman', 'leviathan',
        'miner', 'deep king'
    ];

    if (defensiveClasses.some(c => cls.includes(c))) return 'defensive';
    if (offensiveClasses.some(c => cls.includes(c))) return 'offensive';
    if (utilityClasses.some(c => cls.includes(c))) return 'utility';

    // Fallback/Default
    return 'utility';
};

// Cycle for allocation of 10 points
const OFFENSIVE_CYCLE = ['offensive', 'defensive', 'offensive', 'offensive', 'defensive', 'offensive', 'utility', 'offensive', 'defensive', 'offensive'];
const DEFENSIVE_CYCLE = ['defensive', 'offensive', 'defensive', 'defensive', 'offensive', 'defensive', 'utility', 'defensive', 'offensive', 'defensive'];
const UTILITY_CYCLE = ['utility', 'offensive', 'utility', 'defensive', 'utility', 'utility', 'offensive', 'utility', 'defensive', 'utility'];

export const getPointsAllocation = (classType: string, level: number) => {
    // 1 point per level gained (level 1 = 0 points, level 100 = 99 points)
    const totalPoints = Math.min(99, Math.max(0, level - 1));
    const priority = getClassPriority(classType);

    const cycle = priority === 'offensive' ? OFFENSIVE_CYCLE : priority === 'defensive' ? DEFENSIVE_CYCLE : UTILITY_CYCLE;

    let offensivePoints = 0;
    let defensivePoints = 0;
    let utilityPoints = 0;

    for (let i = 0; i < totalPoints; i++) {
        const path = cycle[i % 10];
        if (path === 'offensive') offensivePoints++;
        else if (path === 'defensive') defensivePoints++;
        else if (path === 'utility') utilityPoints++;
    }

    return { offensivePoints, defensivePoints, utilityPoints, pointsSpent: totalPoints };
};

export const calculatePassiveModifiers = (classType: string, level: number): PassiveSkillModifiers => {
    const { offensivePoints, defensivePoints, utilityPoints } = getPointsAllocation(classType, level);

    // Initial base multipliers
    let attackMult = 1.0;
    let magicMult = 1.0;
    let hpMult = 1.0;
    let defenseMult = 1.0;
    let speedMult = 1.0;
    let critChanceBonus = 0.0;
    let critDamageBonus = 0.0;
    let damageMitigation = 0.0;
    let insanityResistance = 0.0;
    let expeditionSpeedBonus = 0.0;

    // Apply points scaling
    // 1. Offensive Points
    attackMult += offensivePoints * 0.015;
    magicMult += offensivePoints * 0.015;
    critChanceBonus += offensivePoints * 0.001; // +0.1% per point
    critDamageBonus += offensivePoints * 0.002; // +0.2% per point

    // 2. Defensive Points
    hpMult += defensivePoints * 0.02;
    defenseMult += defensivePoints * 0.02;
    damageMitigation += defensivePoints * 0.001; // +0.1% per point

    // 3. Utility/Anomaly Points
    speedMult += utilityPoints * 0.015;
    insanityResistance += utilityPoints * 0.005; // +0.5% per point
    expeditionSpeedBonus += utilityPoints * 0.01; // +1% per point

    // Apply milestones
    if (level >= 10) {
        attackMult += 0.05;
        defenseMult += 0.05;
    }
    if (level >= 25) {
        hpMult += 0.10;
        speedMult += 0.05;
    }
    if (level >= 50) {
        attackMult += 0.15;
        magicMult += 0.15;
        insanityResistance += 0.10;
    }
    if (level >= 75) {
        magicMult += 0.20;
        damageMitigation += 0.10;
        expeditionSpeedBonus += 0.15;
    }
    if (level >= 100) {
        attackMult += 0.25;
        magicMult += 0.25;
        hpMult += 0.25;
        defenseMult += 0.25;
        speedMult += 0.25;
        critChanceBonus += 0.05;
        critDamageBonus += 0.15;
        insanityResistance += 0.15;
    }

    return {
        attackMult,
        magicMult,
        hpMult,
        defenseMult,
        speedMult,
        critChanceBonus,
        critDamageBonus,
        damageMitigation,
        insanityResistance,
        expeditionSpeedBonus
    };
};

export const initOrUpdateHeroPassiveTree = (hero: Hero): Hero => {
    const lvl = hero.level || 1;
    const { offensivePoints, defensivePoints, utilityPoints, pointsSpent } = getPointsAllocation(hero.class, lvl);
    const modifiers = calculatePassiveModifiers(hero.class, lvl);

    const unlockedMilestones = MILESTONES.filter(m => lvl >= m.level).map(m => m.level);

    const passiveSkillTree: PassiveSkillTreeState = {
        level: lvl,
        pointsSpent,
        offensivePoints,
        defensivePoints,
        utilityPoints,
        modifiers,
        unlockedMilestones
    };

    return {
        ...hero,
        passiveSkillTree
    };
};
