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


export interface Entity {
    id: string;
    name: string;
    type: EntityType;
    stats: Stats;
    spriteUrl?: string;
    isDead: boolean;
}

export interface Pet extends Entity {
    type: 'pet';
    bonus: string; // e.g., "+10% DPS"
    emoji: string;
    level: number;
    xp: number;
    maxXp: number;
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

export interface Hero extends Entity {
    class: 'Warrior' | 'Mage' | 'Healer' | 'Rogue' | 'Paladin' | 'Warlock' | 'Dragoon' | 'Sage' | 'Necromancer' | 'Miner' | 'Bard' | 'Monk' | 'Ranger' | 'Druid' | 'Berserker' | 'Sorcerer' | 'Templar' | 'Assassin' | 'Engineer' | 'Alchemist' | 'Illusionist' | 'Samurai' | 'Viking' | 'Ninja' | 'Pirate';
    emoji: string;
    unlocked: boolean;
    element: ElementType;
    assignment: 'combat' | 'mine' | 'expedition';
    gambits: Gambit[];
    corruption: boolean;
    level: number;
    xp: number;
    maxXp: number;
    statPoints: number;
    skills: Skill[];
}

export interface GalaxySector {
    id: string;
    name: string;
    description: string;
    x: number;
    y: number;
    level: number; // Enemy Level
    difficulty: number; // Recommended Power
    reward: { type: 'gold' | 'mithril' | 'souls' | 'starlight', value: number }; // Value per tick
    isOwned: boolean;
    type: 'planet' | 'asteroid' | 'nebula' | 'star';
}

export type LogEntry = {
    id: string;
    message: string;
    type: 'info' | 'damage' | 'heal' | 'death' | 'craft' | 'achievement';
};

export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'potion';
    stat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed';
    value: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    sockets: number;
    runes: Rune[];
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
}



export interface Achievement {
    id: string;
    name: string;
    description: string;
    isUnlocked: boolean;
    condition: { type: 'kills' | 'bossKills' | 'gold' | 'clicks' | 'crafts' | 'cards' | 'ascension', value: number };
    rewardType: 'damage' | 'gold' | 'xp' | 'speed' | 'bossDamage';
    rewardValue: number; // e.g. 0.1 for 10%
    rewardText: string; // "10% Damage"
    reward?: string;
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

export type GambitCondition = 'always' | 'hp<50' | 'hp<30' | 'ally_hp<50' | 'enemy_boss';
export type GambitAction = 'attack' | 'heal' | 'strong_attack' | 'defend';

export interface Gambit {
    id: string;
    condition: GambitCondition;
    action: GambitAction;
    target?: string; // 'self', 'weakest_ally', 'boss'
}

export const GUILDS: Guild[] = [
    { id: 'g1', name: 'Xang', description: '+10% Physical Damage', bonusType: 'physical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Physical Damage', members: 0 },
    { id: 'g2', name: 'Zhauw', description: '+10% Magical Damage', bonusType: 'magical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Magical Damage', members: 0 },
    { id: 'g3', name: 'Yang', description: '+10% Critical Damage', bonusType: 'crit', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Critical Damage', members: 0 }
];


export type Log = LogEntry;
