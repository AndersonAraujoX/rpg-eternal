import type { Hero, Resources } from './types';

export const processMining = (miners: Hero[]): Partial<Resources> | null => {
    if (miners.length === 0) return null;
    // Base tick chance is controlled by caller (or here?), original logic was checking roll inside.
    // Original: "if (miners.length > 0) { if (Math.random() < 0.2) ..."

    // We can keep the chance check here or let caller decide frequency. 
    // To match original behavior which ran every tick but with 20% chance:
    if (Math.random() >= 0.2) return null;

    const minerPower = miners.reduce((acc, h) => acc + h.stats.attack, 0);
    const roll = Math.random() * minerPower;

    if (roll > 1000) return { mithril: 1 };
    if (roll > 200) return { iron: 1 };
    return { copper: 1 };
};
