import { Building } from '../engine/types';

export const INITIAL_BUILDINGS: Building[] = [
    {
        id: 'town_hall',
        name: 'Town Hall',
        description: 'Increases Gold Gain from all sources.',
        level: 1,
        maxLevel: 10,
        cost: 1000,
        costScaling: 1.5,
        bonus: '+5% Gold / Lvl',
        effectValue: 0.05,
        currency: 'gold',
        emoji: '🏛️'
    },
    {
        id: 'barracks',
        name: 'Barracks',
        description: 'Increases Party DPS.',
        level: 1,
        maxLevel: 20,
        cost: 2500,
        costScaling: 1.4,
        bonus: '+2% DPS / Lvl',
        effectValue: 0.02,
        currency: 'gold',
        emoji: '⚔️'
    },
    {
        id: 'library',
        name: 'Library',
        description: 'Increases XP Gain for Heroes.',
        level: 1,
        maxLevel: 10,
        cost: 5000,
        costScaling: 1.6,
        bonus: '+10% XP / Lvl',
        effectValue: 0.1,
        currency: 'gold',
        emoji: '📚'
    },
    {
        id: 'warehouse',
        name: 'Warehouse',
        description: 'Increases offline resource gains.',
        level: 1,
        maxLevel: 5,
        cost: 10000,
        costScaling: 2.0,
        bonus: '+1h Offline Time / Lvl',
        effectValue: 1, // Represents hours
        currency: 'gold',
        emoji: '📦'
    },
    {
        id: 'altar',
        name: 'Altar of Souls',
        description: 'Small chance to gain extra Souls on kill.',
        level: 1,
        maxLevel: 10,
        cost: 50000,
        costScaling: 3.0,
        bonus: '+0.5% Soul Chance / Lvl',
        effectValue: 0.005,
        currency: 'gold',
        emoji: '🔮'
    }
];
