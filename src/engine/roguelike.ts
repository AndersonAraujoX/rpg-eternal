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
    // Planetary Expedition context (null = normal roguelike run)
    planetaryExpedition: PlanetaryExpedition | null;
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

// ===== PLANETARY EXPEDITIONS (Galaxy <-> Roguelike Connection) =====

export type PlanetaryBiome = 'planet' | 'star' | 'nebula' | 'asteroid';

export interface PlanetaryExpedition {
    sectorId: string;
    sectorName: string;
    biome: PlanetaryBiome;
    sectorLevel: number;
}

const PLANETARY_ENEMIES: Record<PlanetaryBiome, Record<string, Omit<RoguelikeEnemy, 'hp' | 'maxHp'>[]>> = {
    planet: {
        combat: [
            { name: 'Alien Caçador', attack: 7, defense: 3, speed: 10, emoji: '👽' },
            { name: 'Verme Tectônico', attack: 9, defense: 4, speed: 6, emoji: '🐛' },
            { name: 'Planta Carnívora Gigante', attack: 6, defense: 5, speed: 4, emoji: '🌿' }
        ],
        elite: [
            { name: 'Predador Alpha', attack: 16, defense: 8, speed: 9, emoji: '🦖' },
            { name: 'Colosso de Terra', attack: 13, defense: 14, speed: 3, emoji: '🪨' }
        ],
        boss: [
            { name: 'Guardião Planetário', attack: 24, defense: 16, speed: 8, emoji: '🌍' }
        ]
    },
    star: {
        combat: [
            { name: 'Salamandra Solar', attack: 10, defense: 2, speed: 12, emoji: '🔥' },
            { name: 'Elemental de Plasma', attack: 8, defense: 3, speed: 14, emoji: '⚡' },
            { name: 'Fênix Menor', attack: 7, defense: 2, speed: 16, emoji: '🐦' }
        ],
        elite: [
            { name: 'Dragão Estelar', attack: 18, defense: 6, speed: 11, emoji: '🐲' },
            { name: 'Senhor das Chamas', attack: 20, defense: 4, speed: 9, emoji: '👑' }
        ],
        boss: [
            { name: 'Titã Solar', attack: 28, defense: 12, speed: 10, emoji: '☀️' }
        ]
    },
    nebula: {
        combat: [
            { name: 'Entidade Nebular', attack: 6, defense: 4, speed: 8, emoji: '🌫️' },
            { name: 'Espectro Cósmico', attack: 8, defense: 2, speed: 13, emoji: '👻' },
            { name: 'Medusa Astral', attack: 7, defense: 6, speed: 7, emoji: '🪼' }
        ],
        elite: [
            { name: 'Devorador de Luz', attack: 15, defense: 10, speed: 7, emoji: '🕳️' },
            { name: 'Oráculo do Vazio', attack: 12, defense: 8, speed: 12, emoji: '🔮' }
        ],
        boss: [
            { name: 'Leviathan da Nebulosa', attack: 22, defense: 18, speed: 6, emoji: '🐙' }
        ]
    },
    asteroid: {
        combat: [
            { name: 'Golem de Minério', attack: 5, defense: 8, speed: 4, emoji: '⛏️' },
            { name: 'Inseto Cristalino', attack: 9, defense: 6, speed: 10, emoji: '🪲' },
            { name: 'Autômato Sucateado', attack: 8, defense: 7, speed: 5, emoji: '🤖' }
        ],
        elite: [
            { name: 'Gigante de Ferro', attack: 14, defense: 16, speed: 3, emoji: '🗡️' },
            { name: 'Rainha Cristalina', attack: 11, defense: 12, speed: 8, emoji: '💎' }
        ],
        boss: [
            { name: 'Núcleo do Asteroide', attack: 20, defense: 22, speed: 5, emoji: '🌑' }
        ]
    }
};

const PLANETARY_EVENTS: Record<PlanetaryBiome, typeof EVENTS_POOL> = {
    planet: [
        {
            title: 'Ruínas Alienígenas',
            description: 'Estruturas antigas de uma civilização esquecida brilham com energia residual.',
            options: [
                { text: 'Investigar os artefatos (+1 Relíquia)', effect: 'gain_relic' as const },
                { text: 'Absorver a energia (+20 HP)', effect: 'heal' as const }
            ]
        },
        {
            title: 'Fauna Exótica',
            description: 'Criaturas pacíficas se aproximam com curiosidade.',
            options: [
                { text: 'Caçar por recursos (+15 Ouro)', effect: 'gain_gold' as const },
                { text: 'Domesticar uma criatura (-15 HP, +1 Relíquia)', effect: 'lose_hp_gain_relic' as const }
            ]
        }
    ],
    star: [
        {
            title: 'Erupção Solar',
            description: 'Uma onda de plasma se aproxima da sua posição!',
            options: [
                { text: 'Absorver a energia solar (-15 HP, +1 Relíquia)', effect: 'lose_hp_gain_relic' as const },
                { text: 'Se proteger (Nada)', effect: 'nothing' as const }
            ]
        },
        {
            title: 'Fragmento de Estrela',
            description: 'Um fragmento incandescente pulsa com poder.',
            options: [
                { text: 'Pegar o fragmento (+15 Ouro)', effect: 'gain_gold' as const },
                { text: 'Fundir com equipamento (-15 Ouro, +1 Relíquia)', effect: 'lose_gold_gain_relic' as const }
            ]
        }
    ],
    nebula: [
        {
            title: 'Visão Etérea',
            description: 'A nebulosa induz visões de realidades alternativas.',
            options: [
                { text: 'Meditar e absorver (+20 HP)', effect: 'heal' as const },
                { text: 'Mergulhar nas visões (-15 HP, +1 Relíquia)', effect: 'lose_hp_gain_relic' as const }
            ]
        }
    ],
    asteroid: [
        {
            title: 'Veio de Minério',
            description: 'Um rico veio de minério raro brilha nas rochas.',
            options: [
                { text: 'Minerar os cristais (+15 Ouro)', effect: 'gain_gold' as const },
                { text: 'Forjar uma relíquia (-15 Ouro, +1 Relíquia)', effect: 'lose_gold_gain_relic' as const }
            ]
        },
        {
            title: 'Destroço de Nave',
            description: 'Os restos de uma nave antiga contêm tecnologia avançada.',
            options: [
                { text: 'Vasculhar os destroços (+1 Relíquia)', effect: 'gain_relic' as const },
                { text: 'Canibalizar peças (+20 HP)', effect: 'heal' as const }
            ]
        }
    ]
};

/** Generate roguelike nodes themed for a planetary expedition. */
export function generatePlanetaryNodes(sectorLevel: number, _biome: PlanetaryBiome): RoguelikeNode[] {
    const list: RoguelikeNode[] = [];
    const templates: RoguelikeNodeType[][] = [
        ['combat', 'event', 'combat', 'rest', 'combat', 'treasure', 'elite', 'event', 'rest', 'boss'],
        ['combat', 'combat', 'event', 'elite', 'rest', 'combat', 'elite', 'treasure', 'combat', 'boss'],
        ['combat', 'elite', 'combat', 'event', 'elite', 'rest', 'combat', 'elite', 'treasure', 'boss'],
    ];
    const template = sectorLevel >= 100 ? templates[2] : sectorLevel >= 50 ? templates[1] : templates[0];

    const icons: Record<RoguelikeNodeType, string> = {
        combat: '⚔️', elite: '👿', event: '❓', rest: '⛺', treasure: '💎', boss: '👑'
    };
    const names: Record<RoguelikeNodeType, string> = {
        combat: 'Combate Planetário', elite: 'Ameaça Alfa', event: 'Descoberta',
        rest: 'Acampamento', treasure: 'Relíquia Antiga', boss: 'Guardião do Setor'
    };

    for (let i = 0; i < template.length; i++) {
        const type = template[i];
        list.push({ type, name: `${i + 1}. ${names[type]}`, icon: icons[type], resolved: false });
    }
    return list;
}

/** Get a biome-themed enemy for planetary expeditions. */
export function getPlanetaryEnemyForNode(
    type: RoguelikeNodeType, stepIndex: number, biome: PlanetaryBiome, sectorLevel: number
): RoguelikeEnemy {
    const biomePool = PLANETARY_ENEMIES[biome];
    const pool = (biomePool[type] && biomePool[type].length > 0) ? biomePool[type] : ENEMIES_POOL[type] || ENEMIES_POOL['combat'];
    const idx = Math.floor(Math.random() * pool.length);
    const base = pool[idx];
    const stepScaling = 1 + (stepIndex * 0.15);
    const sectorScaling = 1 + (sectorLevel * 0.02);
    const totalScaling = stepScaling * sectorScaling;
    const maxHp = type === 'boss' ? 120 : type === 'elite' ? 60 : 35;
    const hp = Math.floor(maxHp * totalScaling);
    return {
        name: base.name, hp, maxHp: hp,
        attack: Math.floor(base.attack * totalScaling),
        defense: Math.floor(base.defense * totalScaling),
        speed: base.speed, emoji: base.emoji
    };
}

/** Get a biome-themed event for planetary expeditions. */
export function getPlanetaryEvent(biome: PlanetaryBiome) {
    const pool = PLANETARY_EVENTS[biome];
    return pool[Math.floor(Math.random() * pool.length)];
}

/** Calculate passive bonuses from owned galaxy sectors for roguelike runs. */
export function getGalaxyBonusForRoguelike(ownedSectors: { type: string; isOwned: boolean }[]): {
    bonusHp: number; bonusAtk: number; bonusMag: number; bonusDef: number;
} {
    const owned = ownedSectors.filter(s => s.isOwned);
    return {
        bonusHp: owned.filter(s => s.type === 'planet').length * 5,
        bonusAtk: owned.filter(s => s.type === 'star').length * 1,
        bonusMag: owned.filter(s => s.type === 'nebula').length * 1,
        bonusDef: owned.filter(s => s.type === 'asteroid').length * 1
    };
}

/** Calculate rewards for a planetary expedition run. */
export function getPlanetaryRunRewards(sectorLevel: number, biome: PlanetaryBiome, victory: boolean): {
    fuelReward: number; hullRepair: number; emberBonus: number; shipUpgrade: boolean;
} {
    if (!victory) {
        return { fuelReward: 5, hullRepair: 0, emberBonus: 0, shipUpgrade: false };
    }
    return {
        fuelReward: 15 + Math.floor(sectorLevel * 0.1),
        hullRepair: 20 + Math.floor(sectorLevel * 0.15),
        emberBonus: Math.floor(sectorLevel * 0.3),
        shipUpgrade: biome === 'star' && sectorLevel >= 100
    };
}
