export type Stats = {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    speed: number;
    magic: number;
};


export type EntityType = 'hero' | 'boss' | 'pet';



export interface Territory {
    id: string;
    name: string;
    description: string;
    owner: 'player' | 'Xang' | 'Zhauw' | 'Yang' | 'Neutral';
    difficulty: number;
    bonus: {
        type: 'gold' | 'xp' | 'damage';
        value: number;
    };
    coordinates: { x: number; y: number };
}

export interface Entity {
    id: string;
    name: string;
    type: EntityType;
    stats: Stats;
    spriteUrl?: string;

    isDead: boolean;
    // Phase 58: Prestige
    prestigeClass?: string;
    evolutionCount?: number;
}


export interface Pet extends Entity {
    type: 'pet';
    bonus: string; // e.g., "+10% DPS"
    emoji: string;
    level: number;
    xp: number;
    maxXp: number;
    // Phase 46
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    ability?: string;
    chimera?: boolean;
    parents?: string[];
}

export interface Talent {
    id: string;
    name: string;
    level: number;
    maxLevel: number;
    cost: number;
    costScaling: number;
    description: string;
    stat: 'attack' | 'speed' | 'crit' | 'gold';
    valuePerLevel: number;
}

export interface Artifact {
    id: string;
    name: string;
    description: string;
    emoji: string;
    bonus: string;
    unlocked: boolean;
}

export interface ConstellationNode {
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    cost: number; // Divinity cost
    costScaling: number;
    bonusType: 'bossDamage' | 'goldDrop' | 'soulDrop' | 'autoReviveSpeed';
    valuePerLevel: number;
    x: number; // For UI positioning (0-100)
    y: number; // For UI positioning (0-100)
}

export interface MonsterCard {
    id: string; // emoji
    monsterName: string;
    count: number;
    stat: 'attack' | 'gold' | 'xp' | 'defense' | 'speed';
    value: number; // e.g. 0.01 per card
}

export interface CardOpponent {
    id: string;
    name: string;
    deck: string[]; // List of monster names/IDs
    difficulty: number;
    avatar: string; // Emoji
}



export interface Quest {
    id: string;
    description: string;
    target: number;
    progress: number;
    reward: { type: 'gold' | 'souls' | 'voidMatter', amount: number };
    isCompleted: boolean;
    isClaimed: boolean;
}

export interface ArenaOpponent {
    id: string;
    name: string;
    power: number;
    rank: number;
    avatar: string; // Emoji
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    isUnlocked: boolean;
    condition: {
        type: 'kills' | 'gold' | 'clicks' | 'bossKills' | 'itemsForged' | 'oreMined' | 'fishCaught' | 'ascensions';
        value: number;
    };
    rewardType: 'damage' | 'gold' | 'bossDamage' | 'mining' | 'crafting' | 'fishing' | 'speed';
    rewardValue: number;
    rewardText: string;
}

export interface GameStats {
    totalGoldEarned: number;
    totalKills: number;
    bossKills: number;
    clicks: number;
    totalDamageDealt: number;
    highestDps: number;
    playTime: number;
    ascensions: number;
    tavernPurchases: number;
    itemsForged: number;
    oreMined: number;
    fishCaught: number;
    cardBattlesWon?: number; // Phase 55
    lastLogin?: number;      // Phase 56
    loginStreak?: number;    // Phase 56
}

export interface DailyQuest {
    id: string;
    description: string;
    target: number;
    current: number;
    type: 'kill' | 'mine' | 'craft' | 'arena' | 'gold_earn';
    reward: { type: 'gold' | 'souls' | 'starlight', amount: number };
    claimed: boolean;
}

export type ElementType = 'fire' | 'water' | 'nature' | 'neutral' | 'light' | 'dark';

export interface Skill {
    id: string;
    name: string;
    description: string;
    unlockLevel: number;
    cooldown: number; // Turns/seconds
    currentCooldown: number;
    type: 'active' | 'passive';
    effectType: 'damage' | 'heal' | 'buff' | 'passive';
    target: 'enemy' | 'self' | 'party' | 'lowest_hp';
    element?: ElementType;
    value: number; // Multiplier or Stat Value
    statBonus?: Partial<Stats>; // For passives
}

// Force Rebuild
export type HeroClass = 'Warrior' | 'Mage' | 'Healer' | 'Rogue' | 'Paladin' | 'Warlock' | 'Dragoon' | 'Sage' | 'Necromancer' | 'Miner' | 'Bard' | 'Monk' | 'Ranger' | 'Druid' | 'Berserker' | 'Sorcerer' | 'Templar' | 'Assassin' | 'Engineer' | 'Alchemist' | 'Illusionist' | 'Samurai' | 'Viking' | 'Ninja' | 'Pirate' | 'Fisherman' | 'Blacksmith' | 'hunter' | 'cleric';

export interface Hero extends Entity {
    id: string;
    name: string;
    class: HeroClass;
    emoji: string;
    unlocked: boolean;
    isDead: boolean;
    element: ElementType;
    assignment: 'combat' | 'mine' | 'expedition' | 'campfire' | 'none';
    gambits: any[];
    corruption: boolean;
    level: number;
    xp: number;
    maxXp: number;
    // Phase 80: Campfire System
    fatigue: number; // 0-100
    maxFatigue: number;
    statPoints: number;
    stats: Stats;
    skills: Skill[];
    equipment: {
        weapon?: Item;
        armor?: Item;
        accessory?: Item;
    };
}

export interface GalaxySector {
    id: string;
    name: string;
    description: string;
    x: number;
    y: number;
    level: number; // Enemy Level
    difficulty: number; // Recommended Power
    reward: { type: 'gold' | 'mithril' | 'souls' | 'starlight' | 'global_damage' | 'global_gold' | 'global_xp' | 'mining_speed', value: number }; // Value per tick or Multiplier
    isOwned: boolean;
    type: 'planet' | 'asteroid' | 'nebula' | 'star';
    hazardLevel?: 'safe' | 'low' | 'medium' | 'high' | 'extreme'; // Added for GalaxyModal compatibility
}

export interface Spaceship {
    name: string;
    level: number;
    fuel: number;
    maxFuel: number;
    hull: number;
    maxHull: number;
    parts: {
        engine: number;
        scanners: number;
        miningLaser: number;
        shields: number;
    };
    upgrades: string[]; // Upgrade IDs
}

export type LogEntry = {
    id: string;
    message: string;
    type: 'info' | 'damage' | 'heal' | 'death' | 'craft' | 'achievement' | 'action' | 'danger' | 'success' | 'error';
    timestamp: number;
};

export type Log = LogEntry;

export interface ItemSet {
    id: string;
    name: string;
    bonusStat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed';
    bonusValue: number; // Multiplier e.g. 0.2 for +20%
    requiredPieces: number;
}

export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'potion' | 'accessory'; // Added accessory
    slot?: 'weapon' | 'armor' | 'accessory'; // Added slot
    setId?: string; // Added Set ID
    stat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed';
    value: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    sockets: number;
    runes: Rune[];
    // Phase 78: Evolving Gear
    level?: number;
    xp?: number;
    maxXp?: number;
}

export interface Rune {
    id: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    bonus: string; // e.g. "+5% Attack"
    stat: 'attack' | 'defense' | 'hp' | 'xp' | 'gold' | 'magic';
    value: number; // Percentage
}

export interface StarlightUpgrade {
    id: string;
    name: string;
    cost: number;
    description: string;
    maxLevel: number;
    effectType: 'galaxy_difficulty' | 'crafting_cost' | 'auto_equip' | 'auto_sell';
    effectValue: number; // e.g. 0.2 for 20%
    icon: string; // Emoji
}


export interface Boss extends Entity {
    level: number;
    element: ElementType;
    emoji: string;
}


export type Resources = {
    copper: number;
    iron: number;
    mithril: number;
    fish: number;
    herbs: number;
};

export interface Potion {
    id: string;
    name: string;
    description: string;
    effect: 'heal' | 'attack' | 'xp' | 'mana';
    value: number; // Effectiveness
    duration: number; // Seconds (0 for instant)
    cost: { type: keyof Resources, amount: number }[];
    emoji: string;
}

export const POTIONS: Potion[] = [
    { id: 'pot_heal', name: 'Health Potion', description: 'Restores 500 HP', effect: 'heal', value: 500, duration: 0, cost: [{ type: 'herbs', amount: 5 }], emoji: '🧪' },
    { id: 'pot_str', name: 'Elixir of Strength', description: '+20% Attack for 5m', effect: 'attack', value: 0.2, duration: 300, cost: [{ type: 'herbs', amount: 10 }, { type: 'fish', amount: 1 }], emoji: '💪' },
    { id: 'pot_xp', name: 'Wisdom Draught', description: '+20% XP for 5m', effect: 'xp', value: 0.2, duration: 300, cost: [{ type: 'herbs', amount: 10 }, { type: 'mithril', amount: 1 }], emoji: '🧠' }
];

export interface Expedition {
    id: string;
    name: string;
    description: string;
    duration: number; // Seconds
    difficulty: number;
    rewards: { type: 'gold' | 'xp' | 'item' | 'artifact', min: number, max: number }[];
    heroIds: string[]; // Assigned heroes
    startTime?: number; // Timestamp
}

export const EXPEDITIONS: Expedition[] = [
    { id: 'exp_forest', name: 'Scout the Forest', description: 'Quick patrol.', duration: 300, difficulty: 1, rewards: [{ type: 'gold', min: 100, max: 500 }, { type: 'xp', min: 100, max: 200 }], heroIds: [] },
    { id: 'exp_cave', name: 'Spelunking', description: 'Search for shiny rocks.', duration: 1800, difficulty: 5, rewards: [{ type: 'gold', min: 1000, max: 2000 }, { type: 'item', min: 1, max: 2 }], heroIds: [] },
    { id: 'exp_ruins', name: 'Ancient Ruins', description: 'High risk, high reward.', duration: 14400, difficulty: 20, rewards: [{ type: 'gold', min: 5000, max: 10000 }, { type: 'artifact', min: 0, max: 1 }], heroIds: [] } // 4h
];

export interface Tower {
    floor: number;
    active: boolean;
    maxFloor: number;
}

export interface Guild {
    id: string;
    name: string;
    level: number;
    xp: number;
    maxXp: number;
    bonus: string; // e.g., "+10% Gold"
    members: number;
    description: string;
    bonusType?: 'physical' | 'magical' | 'crit' | 'gold' | 'xp';
    bonusValue?: number;
}

export type GambitCondition = 'always' | 'hp<50' | 'hp<30' | 'mp<50' | 'ally_hp<50' | 'ally_dead' | 'enemy_boss' | 'enemy_count>2';
export type GambitAction = 'attack' | 'strong_attack' | 'heal' | 'defend' | 'use_potion' | 'cast_fireball' | 'revive' | 'buff_attack';

export interface Gambit {
    id: string;
    condition: GambitCondition;
    action: GambitAction;
    target?: string; // 'self', 'weakest_ally', 'boss'
}

export interface Building {
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    cost: number;
    costScaling: number;
    bonus: string; // Text description
    effectValue: number; // The actual multiplier/value
    currency: 'gold' | 'souls' | 'wood' | 'stone'; // Adding basic resource types if needed, but sticking to gold/souls for now or 'materials'
    // Simplified: Just Gold for now as per plan
    emoji: string;
}

export const GUILDS: Guild[] = [
    { id: 'g1', name: 'Xang', description: '+10% Physical Damage', bonusType: 'physical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Physical Damage', members: 0 },
    { id: 'g2', name: 'Zhauw', description: '+10% Magical Damage', bonusType: 'magical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Magical Damage', members: 0 },
    { id: 'g3', name: 'Yang', description: '+10% Critical Damage', bonusType: 'crit', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Critical Damage', members: 0 }
];

export type SeedType = 'moonleaf' | 'starbloom' | 'fireweed';

export interface Seed {
    id: SeedType;
    name: string;
    description: string;
    growthTime: number; // Seconds
    harvestYield: { min: number, max: number };
    cost: number; // Gold
    emoji: string;
}

export const SEEDS: Record<SeedType, Seed> = {
    moonleaf: { id: 'moonleaf', name: 'Moonleaf Seed', description: 'Grows in moonlight.', growthTime: 60, harvestYield: { min: 2, max: 5 }, cost: 100, emoji: '🌱' },
    starbloom: { id: 'starbloom', name: 'Starbloom Seed', description: 'Radiant petals.', growthTime: 300, harvestYield: { min: 5, max: 10 }, cost: 500, emoji: '🌟' },
    fireweed: { id: 'fireweed', name: 'Fireweed Seed', description: 'Warm to the touch.', growthTime: 600, harvestYield: { min: 10, max: 20 }, cost: 1200, emoji: '🔥' }
};

export interface GardenPlot {
    id: number;
    unlocked: boolean;
    seed: SeedType | null;
    growth: number; // 0-100
    plantedAt: number; // timestamp
}



// Phase 44: Black Market
export interface MarketItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    currency: 'gold' | 'divinity' | 'voidMatter';
    stock: number;
    type: 'potion' | 'gambit_box' | 'corrupted_scroll' | 'pet_egg_fragment' | 'mysterious_item';
    value?: number; // Effect magnitude
    emoji: string;
}

// Phase 45: Challenge Rifts
export type RiftRestriction = 'no_heal' | 'phys_immune' | 'magic_immune' | 'no_ult' | 'time_crunch';

export interface Rift {
    id: string;
    name: string;
    description: string;
    level: number;
    difficulty: number; // Power requirement
    restriction: RiftRestriction;
    rewards: { type: 'starlight' | 'voidMatter' | 'gold', amount: number }[];
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    power: number;
    avatar: string;
    isPlayer?: boolean;
}



export interface CombatEvent {
    id: string;
    type: 'damage' | 'heal' | 'reaction' | 'buff' | 'status';
    text: string;
    value?: number;
    isCrit?: boolean;
    element?: ElementType;
    sourceId?: string;
    targetId?: string;
    x?: number; // Position for particles
    y?: number;
}

export interface Formation {
    id: string;
    name: string;
    heroIds: string[];
}
