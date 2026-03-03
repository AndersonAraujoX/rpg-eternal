export const calculateVoidGuardianRewards = (damage: number): { gold: number, souls: number } => {
    // Reward tiers based on damage
    if (damage < 1000) return { gold: 100, souls: 1 };
    if (damage < 10000) return { gold: 1000, souls: 5 };
    if (damage < 100000) return { gold: 5000, souls: 20 };
    if (damage < 1000000) return { gold: 20000, souls: 100 };

    // Scaling for high damage
    const extremeSouls = Math.floor(damage / 10000);
    const extremeGold = Math.floor(damage / 10);

    return { gold: extremeGold, souls: extremeSouls };
};
