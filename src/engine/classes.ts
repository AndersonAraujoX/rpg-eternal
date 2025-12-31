export const PRESTIGE_CLASSES: Record<string, string> = {
    'Warrior': 'Warlord',
    'Mage': 'Archmage',
    'Healer': 'Saint',
    'Rogue': 'Assassin', // Name collision with base Assassin? Assuming base is Rogue.
    'Paladin': 'Crusader',
    'Warlock': 'Demonologist',
    'Dragoon': 'Dragon Lord',
    'Sage': 'Prophet',
    'Necromancer': 'Lich',
    'Bard': 'Virtuoso',
    'Monk': 'Grandmaster',
    'Ranger': 'Sniper',
    'Druid': 'Archdruid',
    'Berserker': 'Chieftain',
    'Sorcerer': 'Arcanist',
    'Templar': 'High Templar',
    'Assassin': 'Shadowblade', // If base exists
    'Engineer': 'Artificer',
    'Alchemist': 'Transmuter',
    'Illusionist': 'Mirage',
    'Samurai': 'Shogun',
    'Viking': 'Jarl',
    'Ninja': 'Shinobi',
    'Pirate': 'Admiral',
    'Fisherman': 'Leviathan', // Joke/Cool class
    'Blacksmith': 'Forge Master',
    'Miner': 'Deep King',
};

export const PRESTIGE_MULTIPLIERS = {
    statBonus: 1.5, // 50% increase to base stats on evolution
};
