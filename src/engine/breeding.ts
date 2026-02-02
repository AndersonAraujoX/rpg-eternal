import type { Pet } from './types';

export const calculateBreedingResult = (parent1: Pet, parent2: Pet): Pet => {
    // 1. Determine new ID
    const newId = `chimera_${Date.now()}`;
    const generation = Math.max((parent1.fusionCount || 0), (parent2.fusionCount || 0)) + 1;

    // 2. Naming Logic
    // If parents are already Chimeras, use "Chimera Prime" or "Void Walker" etc?
    // Let's keep it simple distinct halves for now, or randomize cool suffixes.
    const p1Name = parent1.name.split(' ')[0].split('-')[0]; // First word base
    const p2Name = parent2.name.split(' ')[0].split('-')[0];

    // 30% chance for a unique "Void" or "Cosmic" prefix if generation is high
    let prefix = "";
    if (generation > 1 && Math.random() < 0.3) prefix = "Void-";
    if (generation > 3 && Math.random() < 0.3) prefix = "Cosmic ";

    const name = `${prefix}${p1Name}-${p2Name}`;

    // 3. Stats Calculation (Average + BonusMultiplier)
    // Bonus scales with generation, capped to avoid infinity too fast
    const baseMult = 1.2;
    const genBonus = Math.min(0.5, (generation - 1) * 0.1); // +10% per gen, max +50%
    const finalMult = baseMult + genBonus;

    const calc = (s1: number, s2: number) => Math.floor(((s1 + s2) / 2) * finalMult);

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

    // 4. Bonus Inheritance
    // Pick the "Better" bonus string or Combine? 
    // Simplified: Just a generic strong bonus text for UI display, actual logic might need parsing later.
    const newBonus = `Fusion Power: +${Math.round((finalMult - 1) * 100)}% Stats`;

    // 5. Emoji & Visuals
    const possibleEmojis = ['🦁', '🦅', '🐉', '🐍', '🐺', '🦊', '🦄', '🐲', '👹'];
    // Try to mix? No, random specific Chimera emoji or a "New" one.
    const emoji = possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)];

    return {
        id: newId,
        name: name,
        type: 'pet',
        rarity: 'chimera',
        level: 1, // Reset level but keep high base stats
        stats: newStats,
        bonus: newBonus,
        ability: parent1.ability || parent2.ability || 'Genetic Harmony',
        emoji: emoji,
        xp: 0,
        maxXp: 100 * generation, // Harder to level up higher gens
        isDead: false,
        chimera: true,
        parents: [parent1.name, parent2.name],
        fusionCount: generation
    };
};
