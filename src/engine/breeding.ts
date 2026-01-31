import type { Pet } from './types';

export const calculateBreedingResult = (parent1: Pet, parent2: Pet): Pet => {
    // 1. Determine new ID and Name
    const newId = `chimera_${Date.now()}`;
    // Simple naming: "Half-P1 Half-P2" or just "Chimera of X & Y"
    const name = `Chimera: ${parent1.name.split(' ')[0]} & ${parent2.name.split(' ')[0]}`;

    // 2. Calculate Stats (Average + 20% bonus)
    const multiplier = 1.2;
    // Helper to calc stat
    const calc = (s1: number, s2: number) => Math.floor(((s1 + s2) / 2) * multiplier);

    const newStats = {
        attack: calc(parent1.stats.attack, parent2.stats.attack),
        magic: calc(parent1.stats.magic, parent2.stats.magic),
        defense: calc(parent1.stats.defense, parent2.stats.defense),
        hp: calc(parent1.stats.hp, parent2.stats.hp),
        maxHp: calc(parent1.stats.maxHp, parent2.stats.maxHp),
        mp: calc(parent1.stats.mp, parent2.stats.mp),
        maxMp: calc(parent1.stats.maxMp, parent2.stats.maxMp),
        speed: calc(parent1.stats.speed, parent2.stats.speed),
    };

    // 3. Determine Bonus (Combine or Random?)
    // Let's take the STRONGER bonus or combine strings?
    // "Wait, bonus is a string currently? e.g. '+10% DPS'"
    // Ideally we'd parse it. For now, let's inherit Parent 1's bonus type but boosted.
    // Or better: "Hybrid: +X% Stats"
    const newBonus = `Chimera Strength: Super Boost`;

    // 4. Emoji
    const emoji = '🦁'; // Generic Chimera for now

    return {
        id: newId,
        name: name,
        type: 'pet',
        rarity: 'legendary',
        level: 1,
        stats: newStats,
        bonus: newBonus,
        ability: parent1.ability || 'Generic Boost',
        emoji: emoji,
        xp: 0,
        maxXp: 100,
        isDead: false,
        chimera: true,
        parents: [parent1.name, parent2.name]
    };
};
