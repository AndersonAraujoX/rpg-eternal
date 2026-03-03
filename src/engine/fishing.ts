export const processFishingAdvanced = (amount: number = 1, luckBonus: number = 0): { fish: number, legendary: boolean } => {
    let fishCaught = 0;
    let caughtLegendary = false;

    for (let i = 0; i < amount; i++) {
        // Base 25% chance + bonus
        const catchChance = 0.25 + luckBonus;
        if (Math.random() < catchChance) {
            fishCaught++;

            // 1% chance for legendary fish (mini-artifact)
            if (Math.random() < 0.01 + (luckBonus / 10)) {
                caughtLegendary = true;
            }
        }
    }

    return { fish: fishCaught, legendary: caughtLegendary };
};
