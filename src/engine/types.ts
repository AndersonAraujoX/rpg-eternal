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
}
export type LogEntry = {
    id: string;
    message: string;
    type: 'info' | 'damage' | 'heal' | 'death';
};

export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'potion';
    stat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed';
    value: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
export type Log = LogEntry;
