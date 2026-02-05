import type { Item } from './types';

export type TownEventType = 'merchant' | 'raid' | 'festival' | 'crisis';

export interface TownEvent {
    id: string;
    type: TownEventType;
    name: string;
    description: string;
    duration: number; // Seconds remaining
    startTime: number;
    rarity: 'common' | 'rare' | 'legendary';

    // Merchant Data
    items?: Item[];

    // Raid/Crisis Data
    enemyPower?: number;
    defenseProgress?: number; // 0-100

    // Festival Data
    buffType?: 'gold' | 'xp' | 'damage';
    buffValue?: number;
}

export const generateTownEvent = (gameStage: number, _activeEvents: TownEvent[]): TownEvent | null => {
    // 1. Determine Type
    const roll = Math.random();
    let type: TownEventType = 'merchant';

    if (roll < 0.5) type = 'merchant';
    else if (roll < 0.75) type = 'festival';
    else if (roll < 0.9) type = 'raid'; // Only if gameStage > 5?

    if (type === 'raid' && gameStage < 5) type = 'merchant'; // Safety for early game

    const id = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const duration = 120 + Math.floor(Math.random() * 180); // 2-5 minutes

    const baseEvent: TownEvent = {
        id,
        type,
        name: 'Unknown Event',
        description: 'Something is happening in town...',
        duration,
        startTime: Date.now(),
        rarity: Math.random() > 0.8 ? 'rare' : 'common'
    };

    if (type === 'merchant') {
        // Generate stock
        const stockSize = 3;
        const items: Item[] = [];
        for (let i = 0; i < stockSize; i++) {
            // Mock level based on gameStage
            // const itemLevel = Math.max(1, gameStage * 10); 

            items.push({
                id: `merc-item-${Date.now()}-${i}`,
                name: `Mysterious Artifact ${i + 1}`,
                type: 'accessory',
                stat: 'magic',
                value: gameStage * 15,
                rarity: 'rare',
                sockets: 1,
                runes: []
            });
        }

        baseEvent.name = 'Traveling Merchant';
        baseEvent.description = 'A merchant has arrived with rare goods!';
        baseEvent.items = items;
    } else if (type === 'festival') {
        const buffRoll = Math.random();
        baseEvent.name = 'Town Festival';
        baseEvent.description = 'Morale is high! Gains are increased.';
        if (buffRoll < 0.33) {
            baseEvent.buffType = 'gold';
            baseEvent.buffValue = 0.2; // +20%
            baseEvent.name = 'Market Festival';
        } else if (buffRoll < 0.66) {
            baseEvent.buffType = 'xp';
            baseEvent.buffValue = 0.2;
            baseEvent.name = 'Knowledge Fair';
        } else {
            baseEvent.buffType = 'damage';
            baseEvent.buffValue = 0.1;
            baseEvent.name = 'Warrior Tournament';
        }
        baseEvent.rarity = 'rare';
    } else if (type === 'raid') {
        baseEvent.name = 'Monster Raid';
        baseEvent.description = 'Monsters are attacking the town gates!';
        baseEvent.enemyPower = gameStage * 50;
        baseEvent.defenseProgress = 0;
        baseEvent.rarity = 'legendary';
    }

    return baseEvent;
};
