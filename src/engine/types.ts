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

export type EntityType = 'hero' | 'boss';

export interface Entity {
    id: string;
    name: string;
    type: EntityType;
    stats: Stats;
    spriteUrl?: string;
    isDead: boolean;
}

export interface Hero extends Entity {
    class: 'Warrior' | 'Mage' | 'Healer';
    emoji: string;
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
    emoji: string;
}

