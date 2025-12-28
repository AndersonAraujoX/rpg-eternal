
export const processFishing = (amount: number = 1): number => {
    // Basic logic: random chance to catch fish
    // amount could be number of assigned fishermen or clicks
    let fishCaught = 0;
    for (let i = 0; i < amount; i++) {
        if (Math.random() < 0.25) { // 25% chance per tick/click
            fishCaught++;
        }
    }
    return fishCaught;
};
