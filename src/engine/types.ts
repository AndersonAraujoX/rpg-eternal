export type Stats = {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
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
    class: 'Warrior' | 'Mage' | 'Rogue';
}

export interface Boss extends Entity {
    level: number;
}
