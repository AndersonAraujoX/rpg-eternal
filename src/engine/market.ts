import type { MarketItem } from './types';

// Possible items the market can sell
const POSSIBLE_ITEMS: Partial<MarketItem>[] = [
    { id: 'void_potion', name: 'Essence of Void', description: 'Gain 5 Void Matter', cost: 50000, currency: 'gold', type: 'potion', value: 5, emoji: '🟣' },
    { id: 'divinity_shard', name: 'Fragile Divinity', description: 'Gain 1 Divinity', cost: 1000000, currency: 'gold', type: 'potion', value: 1, emoji: '✨' },
    { id: 'gambit_pack', name: 'Tactician\'s Tome', description: 'Unlock a Gambit Slot', cost: 10, currency: 'voidMatter', type: 'gambit_box', emoji: '📜' },
    { id: 'mystery_egg', name: 'Mystery Egg', description: 'A random pet egg', cost: 5, currency: 'divinity', type: 'pet_egg_fragment', emoji: '🥚' },
    { id: 'corrupted_scroll', name: 'Forbidden Scroll', description: 'Instant 1 hour of progress (with corruption risk)', cost: 20, currency: 'voidMatter', type: 'corrupted_scroll', emoji: '📜' },
    { id: 'gold_crate', name: 'Illicit Gold Shipment', description: 'Gain massive gold', cost: 2, currency: 'divinity', type: 'potion', value: 100000, emoji: '💰' },
];

export const generateMarketStock = (): MarketItem[] => { // _level unused
    // Generate 3-5 random items
    const stockSize = Math.floor(Math.random() * 3) + 3;
    const stock: MarketItem[] = [];

    for (let i = 0; i < stockSize; i++) {
        const template = POSSIBLE_ITEMS[Math.floor(Math.random() * POSSIBLE_ITEMS.length)];

        // Randomize cost/stock slightly?
        const item: MarketItem = {
            id: template.id + '_' + i,
            name: template.name!,
            description: template.description!,
            cost: template.cost!,
            currency: template.currency!,
            stock: Math.floor(Math.random() * 3) + 1,
            type: template.type!,
            value: template.value,
            emoji: template.emoji!
        };
        stock.push(item);
    }

    return stock;
};

// Spawn logic: 5% chance every minute?
// Or fixed timer? Let's use useGame fixed timer.
