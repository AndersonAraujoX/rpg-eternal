import type { StarlightUpgrade } from './types';

export const STARLIGHT_UPGRADES: StarlightUpgrade[] = [
    {
        id: 'galaxy_scanner',
        name: 'Galaxy Scanner',
        description: 'Advanced sensors map weak points in enemy sectors. Reduces Conquest Difficulty.',
        cost: 10,
        maxLevel: 5,
        effectType: 'galaxy_difficulty',
        effectValue: 0.1, // -10% per level (Max -50%)
        icon: '📡'
    },
    {
        id: 'stellar_forge',
        name: 'Stellar Forge',
        description: 'Infuses crafting with starlight heat. Reduces crafting material costs.',
        cost: 15,
        maxLevel: 5,
        effectType: 'crafting_cost',
        effectValue: 0.1, // -10% per level
        icon: '⚒️'
    },
    {
        id: 'auto_equip',
        name: 'Autoloot Protocol',
        description: 'Automatically equips items if they are better than current gear.',
        cost: 50,
        maxLevel: 1,
        effectType: 'auto_equip',
        effectValue: 1,
        icon: '🤖'
    },
    {
        id: 'auto_sell',
        name: 'Scrap Recycler',
        description: 'Automatically sells Common items to keep inventory clean.',
        cost: 25,
        maxLevel: 1,
        effectType: 'auto_sell',
        effectValue: 1,
        icon: '♻️'
    }
];

export const getStarlightUpgradeCost = (upgrade: StarlightUpgrade, currentLevel: number) => {
    // Linear or Exponential? Starlight is rare. Linear increase seems fair for now.
    // Base cost + (Level * Base Cost)
    return Math.floor(upgrade.cost * (1 + currentLevel * 0.5));
};
