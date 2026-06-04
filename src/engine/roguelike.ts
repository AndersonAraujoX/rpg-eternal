export type RoguelikeClass = 'warrior' | 'mage' | 'ranger';

export interface RoguelikeHero {
    classType: RoguelikeClass;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    speed: number;
    magic: number;
}

export type RoguelikeNodeType = 'combat' | 'elite' | 'event' | 'rest' | 'treasure' | 'boss';

export interface RoguelikeNode {
    type: RoguelikeNodeType;
    name: string;
    icon: string;
    resolved: boolean;
}

export interface RoguelikeRelic {
    id: string;
    name: string;
    description: string;
    emoji: string;
}

export interface RoguelikeEnemy {
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    emoji: string;
}

export interface RoguelikeRunState {
    hero: RoguelikeHero | null;
    nodes: RoguelikeNode[];
    currentNodeIndex: number;
    gold: number;
    relics: RoguelikeRelic[];
    combatState: {
        enemy: RoguelikeEnemy;
        playerTurn: boolean;
        shield: number;
        enemyShield: number;
        log: string[];
    } | null;
    eventState: {
        title: string;
        description: string;
        options: {
            text: string;
            effect: 'heal' | 'gain_relic' | 'lose_hp_gain_relic' | 'gain_gold' | 'lose_gold_gain_relic' | 'nothing';
        }[];
    } | null;
    status: 'none' | 'exploring' | 'combat' | 'event' | 'rest' | 'treasure' | 'victory' | 'defeat';
}

export interface RoguelikeUpgrade {
    id: string;
    name: string;
    description: string;
    level: number;
    maxLevel: number;
    baseCost: number;
    costScaling: number;
}

export const ROGUELIKE_UPGRADES: Omit<RoguelikeUpgrade, 'level'>[] = [
    {
        id: 'vigor',
        name: 'Vigor Eterno',
        description: '+10 de HP Inicial no Roguelike',
        maxLevel: 5,
        baseCost: 10,
        costScaling: 1.5
    },
    {
        id: 'strength',
        name: 'Força de Brasa',
        description: '+2 de Ataque Inicial no Roguelike',
        maxLevel: 5,
        baseCost: 15,
        costScaling: 1.6
    },
    {
        id: 'intellect',
        name: 'Foco Mental',
        description: '+2 de Magia Inicial no Roguelike',
        maxLevel: 5,
        baseCost: 15,
        costScaling: 1.6
    },
    {
        id: 'lucky_charm',
        name: 'Amuleto da Sorte',
        description: '+20% de Ouro ganho em combates Roguelike',
        maxLevel: 3,
        baseCost: 25,
        costScaling: 2.0
    }
];

export const RELICS_POOL: RoguelikeRelic[] = [
    { id: 'rusty_sword', name: 'Espada Enferrujada', description: '+3 de Ataque nas batalhas', emoji: '⚔️' },
    { id: 'iron_shield', name: 'Escudo de Ferro', description: '+3 de Defesa nas batalhas', emoji: '🛡️' },
    { id: 'magic_wand', name: 'Varinha de Aprendiz', description: '+4 de Magia nas batalhas', emoji: '🪄' },
    { id: 'golden_coin', name: 'Moeda da Fortuna', description: 'Ganha +2 de ouro ao resolver nós de combate', emoji: '🪙' },
    { id: 'phoenix_feather', name: 'Pena de Fênix', description: 'Previne a derrota uma vez por run, recuperando 30% HP', emoji: '🪶' },
    { id: 'life_ring', name: 'Anel da Vitalidade', description: '+15 HP Máximo', emoji: '💍' }
];

export const ENEMIES_POOL: Record<RoguelikeNodeType, Omit<RoguelikeEnemy, 'hp' | 'maxHp'>[]> = {
    combat: [
        { name: 'Slime de Esgoto', attack: 5, defense: 2, speed: 6, emoji: '🟢' },
        { name: 'Morcego Vampiro', attack: 6, defense: 1, speed: 12, emoji: '🦇' },
        { name: 'Goblin Saqueador', attack: 8, defense: 3, speed: 8, emoji: '👺' }
    ],
    elite: [
        { name: 'Ogro Enfurecido', attack: 14, defense: 6, speed: 4, emoji: '👹' },
        { name: 'Gárgula de Pedra', attack: 12, defense: 12, speed: 5, emoji: '🗿' }
    ],
    boss: [
        { name: 'Dragão das Sombras', attack: 22, defense: 15, speed: 10, emoji: '🐉' },
        { name: 'Rei Esqueleto', attack: 18, defense: 18, speed: 8, emoji: '💀' }
    ],
    event: [],
    rest: [],
    treasure: []
};

export const EVENTS_POOL = [
    {
        title: 'Fonte Misteriosa',
        description: 'Você encontra uma fonte borbulhando com uma água brilhante no meio das ruínas.',
        options: [
            { text: 'Beber da água (+20 HP)', effect: 'heal' as const },
            { text: 'Procurar no fundo (+1 Relíquia aleatória)', effect: 'gain_relic' as const }
        ]
    },
    {
        title: 'Altar do Sacrifício',
        description: 'Um altar de pedra negra pulsa com uma energia sinistra.',
        options: [
            { text: 'Sacrificar sangue (-15 HP para ganhar 1 Relíquia)', effect: 'lose_hp_gain_relic' as const },
            { text: 'Apenas passar pelo altar (Nada)', effect: 'nothing' as const }
        ]
    },
    {
        title: 'Mercador Vagante',
        description: 'Um mercador misterioso oferece itens em troca de ouro das masmorras.',
        options: [
            { text: 'Comprar relíquia estranha (-15 Ouro da corrida por 1 Relíquia)', effect: 'lose_gold_gain_relic' as const },
            { text: 'Recusar e seguir em frente (Nada)', effect: 'nothing' as const }
        ]
    }
];

export function generateRoguelikeNodes(): RoguelikeNode[] {
    const list: RoguelikeNode[] = [];
    const types: RoguelikeNodeType[] = ['combat', 'event', 'rest', 'combat', 'treasure', 'combat', 'event', 'elite', 'rest', 'boss'];
    const names = {
        combat: 'Combate Comum',
        elite: 'Inimigo Elite',
        event: 'Evento Desconhecido',
        rest: 'Fogueira de Descanso',
        treasure: 'Tesouro Escondido',
        boss: 'Chefe da Masmorra'
    };
    const icons = {
        combat: '⚔️',
        elite: '👿',
        event: '❓',
        rest: '⛺',
        treasure: '💎',
        boss: '👑'
    };

    for (let i = 0; i < 10; i++) {
        const type = types[i];
        list.push({
            type,
            name: `${i + 1}. ${names[type]}`,
            icon: icons[type],
            resolved: false
        });
    }
    return list;
}

export function getStartingHero(classType: RoguelikeClass, upgrades: Record<string, number>): RoguelikeHero {
    const vigorLvl = upgrades['vigor'] || 0;
    const strengthLvl = upgrades['strength'] || 0;
    const intellectLvl = upgrades['intellect'] || 0;

    const extraHp = vigorLvl * 10;
    const extraAtk = strengthLvl * 2;
    const extraMag = intellectLvl * 2;

    switch (classType) {
        case 'warrior':
            return {
                classType,
                hp: 80 + extraHp,
                maxHp: 80 + extraHp,
                mp: 20,
                maxMp: 20,
                attack: 12 + extraAtk,
                defense: 6,
                speed: 8,
                magic: 4 + extraMag
            };
        case 'mage':
            return {
                classType,
                hp: 50 + extraHp,
                maxHp: 50 + extraHp,
                mp: 50,
                maxMp: 50,
                attack: 5 + extraAtk,
                defense: 3,
                speed: 10,
                magic: 15 + extraMag
            };
        case 'ranger':
            return {
                classType,
                hp: 65 + extraHp,
                maxHp: 65 + extraHp,
                mp: 30,
                maxMp: 30,
                attack: 9 + extraAtk,
                defense: 4,
                speed: 14,
                magic: 6 + extraMag
            };
    }
}

export function getRandomRelic(): RoguelikeRelic {
    const idx = Math.floor(Math.random() * RELICS_POOL.length);
    return RELICS_POOL[idx];
}

export function getEnemyForNode(type: RoguelikeNodeType, stepIndex: number): RoguelikeEnemy {
    const pool = ENEMIES_POOL[type] || ENEMIES_POOL['combat'];
    const idx = Math.floor(Math.random() * pool.length);
    const base = pool[idx];
    const scaling = 1 + (stepIndex * 0.15);

    const maxHp = type === 'boss' ? 120 : type === 'elite' ? 60 : 35;
    const hp = Math.floor(maxHp * scaling);

    return {
        name: base.name,
        hp,
        maxHp: hp,
        attack: Math.floor(base.attack * scaling),
        defense: Math.floor(base.defense * scaling),
        speed: base.speed,
        emoji: base.emoji
    };
}
