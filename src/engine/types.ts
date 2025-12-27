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
    id: string; // usually boss emoji or name
    monsterName: string;
    count: number;
    bonus: number; // Damage multiplier
}

export interface GameStats {
    souls: number;
    gold: number;
    divinity: number;
    rebirths: number;
    totalKills: number;
    talents: Talent[];
    artifacts: Artifact[];
    cards: MonsterCard[];
    constellations: ConstellationNode[];
    keys: number; // Gold Keys count
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
    souls: number;
    gold: number;
    divinity: number;
    rebirths: number;
    totalKills: number;
    talents: Talent[];
    artifacts: Artifact[];
    cards: MonsterCard[];
    constellations: ConstellationNode[];
    keys: number; // Gold Keys count
    voidMatter: number;
    arenaRank: number;
    glory: number;
    runes: Rune[];
    achievements: Achievement[];
    resources: {
        copper: number;
        iron: number;
        mithril: number;
    };
}

export type ElementType = 'fire' | 'water' | 'nature' | 'neutral';

export interface Hero extends Entity {
    class: 'Warrior' | 'Mage' | 'Healer' | 'Rogue' | 'Paladin' | 'Warlock';
    emoji: string;
    unlocked: boolean;
    element: ElementType;
    assignment: 'combat' | 'mine';
    gambits: Gambit[];
    corruption: boolean;
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

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    condition: { type: 'kills' | 'bossKills' | 'gold' | 'clicks' | 'crafts', value: number };
    reward: string; // Text description
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
};

export interface Tower {
    floor: number;
    active: boolean;
    maxFloor: number;
}

export interface Guild {
    name: string;
    level: number;
    xp: number;
    maxXp: number;
    bonus: string; // e.g., "+10% Gold"
    members: number;
}

export type GambitCondition = 'always' | 'hp<50' | 'hp<30' | 'ally_hp<50' | 'enemy_boss';
export type GambitAction = 'attack' | 'heal' | 'strong_attack' | 'defend';

export interface Gambit {
    id: string;
    condition: GambitCondition;
    action: GambitAction;
    target?: string; // 'self', 'weakest_ally', 'boss'
}

export const GUILDS = [
    { name: 'The Iron Legion', bonus: '+10% Defense' },
    { name: 'The Arcane Order', bonus: '+10% Magic' },
    { name: 'The Shadow Syndicate', bonus: '+10% Crit Damage' }
];

export type Log = LogEntry;
