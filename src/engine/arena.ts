/**
 * Calculates the win chance of the player against an opponent.
 * Lanchester formula: partyPower / (partyPower + opPower + 1).
 */
export const calculateWinChance = (partyPower: number, opponentPower: number): number => {
    return partyPower / (partyPower + opponentPower + 1);
};
