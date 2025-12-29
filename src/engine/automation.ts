import type { Talent, Hero, Tower, Quest, Item } from './types';

// Returns a quest ID to claim if conditions met
export const getAutoQuestClaim = (upgrades: Record<string, number>, quests: Quest[]): string | null => {
    if (!(upgrades['auto_quest'] > 0)) return null;
    const completed = quests.find(q => q.isCompleted);
    return completed ? completed.id : null;
};

// Returns true if we should summon a hero from tavern
export const shouldSummonTavern = (gold: number, upgrades: Record<string, number>): boolean => {
    return (upgrades['auto_tavern'] > 0) && gold > 1000 && Math.random() < 0.1;
};

// Returns the ID of the talent to buy, or null
export const getAutoTalentToBuy = (upgrades: Record<string, number>, souls: number, talents: Talent[]): string | null => {
    if (!(upgrades['auto_talent'] > 0)) return null;
    if (Math.random() > 0.1) return null; // Throttle

    const affordable = talents.find(t => {
        const cost = Math.floor(t.cost * Math.pow(t.costScaling, t.level));
        return souls >= cost;
    });
    return affordable ? affordable.id : null;
};

// Returns true if we should revive dead heroes
export const shouldAutoRevive = (upgrades: Record<string, number>, heroes: Hero[]): boolean => {
    if (!(upgrades['auto_revive'] > 0)) return false;
    return heroes.some(h => h.isDead);
};

// Returns a new Tower state if we should climb
export const getAutoTowerClimb = (upgrades: Record<string, number>, tower: Tower): Tower | null => {
    if (!(upgrades['auto_tower'] > 0)) return null;
    if (Math.random() > 0.01) return null; // Throttle

    // Simulate climb
    return { ...tower, floor: tower.floor + 1, maxFloor: Math.max(tower.maxFloor, tower.floor + 1) };
};

// Returns an updated Hero with better gear if applicable
export const getAutoEquip = (upgrades: Record<string, number>, hero: Hero, inventory: Item[]): { hero: Hero, inventory: Item[] } | null => {
    // upgrades is Record<string, number>
    if (!(upgrades['auto_equip'] > 0)) return null;

    let changed = false;
    let newHero = { ...hero };
    let newInventory = [...inventory];

    // Simple Logic: Check inventory for items of same type with higher power
    // Power = (attack + defense + magic + speed + hp/10)
    const getPower = (item: Item | undefined) => item ? (item.stats.attack + item.stats.defense + item.stats.magic + item.stats.speed + (item.stats.hp || 0) / 10) : 0;

    ['weapon', 'armor', 'accessory'].forEach(slot => {
        const currentItem = newHero.equipment?.[slot as keyof typeof newHero.equipment];
        const currentPower = getPower(currentItem);

        // Find best item in inventory for this slot
        const bestItemIndex = newInventory.findIndex(item => item.type === slot && getPower(item) > currentPower);

        if (bestItemIndex !== -1) {
            const bestItem = newInventory[bestItemIndex];
            // Swap
            if (currentItem) newInventory.push(currentItem); // Return old to inventory
            newHero.equipment = { ...(newHero.equipment || {}), [slot]: bestItem };
            newInventory.splice(bestItemIndex, 1); // Remove new from inventory
            changed = true;
        }
    });

    return changed ? { hero: newHero, inventory: newInventory } : null;
};

// Returns items to sell
export const getAutoSell = (upgrades: Record<string, number>, inventory: Item[], autoSellRarity: string): Item[] => {
    if (!(upgrades['auto_sell'] > 0)) return [];

    const Rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Eternal'];
    const threshold = Rarities.indexOf(autoSellRarity);

    return inventory.filter(item => {
        const itemRarity = Rarities.indexOf(item.rarity);
        return itemRarity <= threshold;
    });
};
