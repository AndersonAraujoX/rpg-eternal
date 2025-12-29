import { MonsterCard, ElementType } from './types';
import { MONSTERS } from './bestiary';

export interface BattleCard {
    id: string;
    name: string;
    element: ElementType;
    power: number;
    avatar: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface BattleResult {
    winner: 'player' | 'opponent' | 'draw';
    log: string[];
    playerScore: number;
    opponentScore: number;
}

export const getCardElement = (monsterName: string): ElementType => {
    // Determine element based on name or bestiary data
    // Fallback logic if not explicit in MonsterCard type yet (we should add element to MonsterCard or lookup in Bestiary)

    // Simple heuristic or lookup
    if (monsterName.includes('Fire') || monsterName.includes('Dragon') || monsterName.includes('Magma')) return 'fire';
    if (monsterName.includes('Water') || monsterName.includes('Tide') || monsterName.includes('Ice')) return 'water';
    if (monsterName.includes('Forest') || monsterName.includes('Ent') || monsterName.includes('Goblin')) return 'nature';
    if (monsterName.includes('Light') || monsterName.includes('Angel')) return 'light';
    if (monsterName.includes('Dark') || monsterName.includes('Demon') || monsterName.includes('Void')) return 'dark';

    // Lookup in MONSTERS (Bestiary) if possible, but MONSTERS is simple right now.
    // Let's rely on a consistent hash or just random for unknown? No, needs to be deterministic.
    // Let's use the 'element' form Types if we had it.
    // For now, let's map generic monsters:
    const map: Record<string, ElementType> = {
        'Slime': 'nature',
        'Rat': 'neutral',
        'Bat': 'dark',
        'Wolf': 'nature',
        'Skeleton': 'dark',
        'Goblin': 'nature',
        'Orc': 'fire',
        'Troll': 'nature',
        'Ghost': 'dark',
        'Golem': 'neutral',
        'Dragon': 'fire',
        'Demon': 'fire',
        'Vampire': 'dark',
        'Kraken': 'water',
        'Lich': 'dark',
        'Yeti': 'water',
        'Hydra': 'water',
        'Phoenix': 'fire',
        'Basilisk': 'nature',
        'Cyclops': 'neutral',
        'Minotaur': 'neutral',
        'Chimera': 'fire',
        'Raid Boss': 'dark',
        'Void Entity': 'dark',
        'World Eater': 'dark'
    };
    return map[monsterName] || 'neutral';
};

export const convertToBattleCard = (card: MonsterCard): BattleCard => {
    const element = getCardElement(card.monsterName);
    // Power Calculation:
    // Base 10 + (Count * 2) + RarityBonus?
    // We don't have Rarity on MonsterCard explicitly, derived from Bestiary? 
    // Simplified: Power = (count * 5) + (value * 1000)
    // Actually, Card Value is 0.01 per card usually. 
    // Let's use 'count' (Level) as primary driver.

    let power = card.count * 10;

    // Rarity Bonus (Fake it based on Power/Gold stat type?)
    if (card.stat === 'gold') power *= 0.8; // Utility cards weak in combat
    if (card.stat === 'attack') power *= 1.2;

    return {
        id: card.id,
        name: card.monsterName,
        element,
        power: Math.floor(power),
        avatar: card.id, // Emoji
        rarity: 'common' // Placeholder
    };
};

export const resolveDuel = (playerCard: BattleCard, opponentCard: BattleCard): { winner: 'player' | 'opponent' | 'draw', log: string } => {
    let pPower = playerCard.power;
    let oPower = opponentCard.power;
    const pEl = playerCard.element;
    const oEl = opponentCard.element;

    let log = `${playerCard.name} (${pEl}, ${pPower}) VS ${opponentCard.name} (${oEl}, ${oPower}). `;

    // Elemental Bonus
    let pBonus = 1;
    let oBonus = 1;

    if ((pEl === 'fire' && oEl === 'nature') || (pEl === 'nature' && oEl === 'water') || (pEl === 'water' && oEl === 'fire') || (pEl === 'light' && oEl === 'dark')) {
        pBonus = 1.5;
        log += `Elemental Advantage for ${playerCard.name}! `;
    }
    if ((oEl === 'fire' && pEl === 'nature') || (oEl === 'nature' && pEl === 'water') || (oEl === 'water' && pEl === 'fire') || (oEl === 'light' && pEl === 'dark')) {
        oBonus = 1.5;
        log += `Elemental Advantage for ${opponentCard.name}! `;
    }

    const finalPPower = Math.floor(pPower * pBonus);
    const finalOPower = Math.floor(oPower * oBonus);

    log += `Final Power: ${finalPPower} vs ${finalOPower}.`;

    if (finalPPower > finalOPower) return { winner: 'player', log };
    if (finalOPower > finalPPower) return { winner: 'opponent', log };
    return { winner: 'draw', log };
};
