import type { MonsterCard, CardOpponent } from './types';

export interface BattleResult {
    winner: 'player' | 'opponent';
    score: { player: number, opponent: number };
    logs: string[];
    reward?: { type: 'starlight' | 'voidMatter' | 'gold', amount: number };
}

export const simulateCardBattle = (
    playerDeck: MonsterCard[],
    opponent: CardOpponent,
    allCards: MonsterCard[] // Needed to resolve opponent deck IDs to stats
): BattleResult => {
    let playerScore = 0;
    let opponentScore = 0;
    const logs: string[] = [];

    logs.push(`Battle Started: YOU vs ${opponent.name}!`);

    // 3 Rounds
    for (let i = 0; i < 3; i++) {
        const playerCard = playerDeck[i % playerDeck.length];
        // Resolve opponent card
        const oppCardId = opponent.deck[i % opponent.deck.length];

        // Find opponent card stats (simulated or real)
        // For simplicity, we'll assume opponent uses standard cards but maybe with a multiplier for difficulty?
        // Actually, let's just find the card in the global list or create a "ghost" card if missing.
        let oppCard = allCards.find(c => c.id === oppCardId);

        // Fallback for opponent card if not found (shouldn't happen with valid data)
        if (!oppCard) {
            oppCard = { id: oppCardId, monsterName: 'Unknown', count: 1, stat: 'attack', value: 0 };
        }

        const statType = playerCard.stat; // The stat chosen for the duel is determined by the Player's card type for simplicity? 
        // OR random stat? Let's go with Random Stat for the round to make it fair/varied.
        const stats: ('attack' | 'defense' | 'speed' | 'gold' | 'xp')[] = ['attack', 'defense', 'speed', 'gold', 'xp'];
        const roundStat = stats[Math.floor(Math.random() * stats.length)];

        logs.push(`Round ${i + 1}: Competing in ${roundStat.toUpperCase()}!`);
        logs.push(`${playerCard.monsterName} (${playerCard.stat}) vs ${oppCard.monsterName} (${oppCard.stat})`);

        // Calculate Scores
        // Base score is just the card's value. 
        // Bonus if the card's main stat MATCHES the round stat.
        let pVal = playerCard.value * (playerCard.count); // scaling with count
        if (playerCard.stat === roundStat) pVal *= 2; // Bonus

        let oVal = oppCard.value * (1 + (opponent.difficulty * 0.5)); // Opponent scaling
        if (oppCard.stat === roundStat) oVal *= 2;

        // Noise
        pVal *= (0.9 + Math.random() * 0.2);
        oVal *= (0.9 + Math.random() * 0.2);

        if (pVal > oVal) {
            playerScore++;
            logs.push(`WIN! Your ${playerCard.monsterName} overpowered the enemy!`);
        } else {
            opponentScore++;
            logs.push(`LOSS! ${oppCard.monsterName} was too strong!`);
        }
    }

    const winner = playerScore > opponentScore ? 'player' : 'opponent';
    logs.push(winner === 'player' ? "VICTORY!" : "DEFEAT!");

    const result: BattleResult = {
        winner,
        score: { player: playerScore, opponent: opponentScore },
        logs
    };

    if (winner === 'player') {
        // Rewards
        result.reward = { type: 'starlight', amount: 5 + Math.floor(opponent.difficulty * 2) };
    }

    return result;
};
