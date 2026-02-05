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
    voidAscensions: number;
    highestRiftFloor?: number; // Update 81
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
    gambits: Gambit[];
    // Phase 91: Corruption System
    insanity: number; // 0-100
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
    type: 'info' | 'battle' | 'loot' | 'achievement' | 'death' | 'craft' | 'action' | 'damage' | 'heal' | 'error' | 'danger' | 'success';
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

export interface ItemAffix {
    type: 'stats' | 'effect';
    name: string; // e.g., "of the Wolf"
    value: number; // e.g., 0.05 for +5%
    stat?: keyof Stats;
}

// Phase 92: Town Events
export type TownEventType = 'merchant' | 'raid' | 'festival' | 'crisis';

export interface TownEvent {
    id: string;
    type: TownEventType;
    name: string;
    description: string;
    duration: number; // Seconds remaining
    startTime: number;
    rarity: 'common' | 'rare' | 'legendary';

    // Merchant Data
    items?: Item[];

    // Raid/Crisis Data
    enemyPower?: number;
    defenseProgress?: number; // 0-100

    // Festival Data
    buffType?: 'gold' | 'xp' | 'damage';
    buffValue?: number;
}

export interface Item {
    id: string;
    name: string;
    type: 'weapon' | 'armor' | 'potion' | 'accessory'; // Added accessory
    slot?: 'weapon' | 'armor' | 'accessory'; // Added slot
    setId?: string; // Added Set ID
    stat: 'attack' | 'defense' | 'hp' | 'magic' | 'speed';
    value: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'chimera';
    sockets: number;
    runes: Rune[];
    // Phase 78: Evolving Gear
    level?: number;
    xp?: number;
    maxXp?: number;
    evolutionId?: string; // ID of the next stage item
    // Phase 90: Sets
    // setId already declared above
    // Phase 1: Star Forge
    quality?: number; // 0-100%
    prefix?: ItemAffix;
    suffix?: ItemAffix;
    craftedBy?: string;
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
    abilities?: string[];
}


export type Resources = {
    copper: number;
    iron: number;
    mithril: number;
    fish: number;
    herbs: number;
    starFragments: number; // Phase 1
    dungeonTokens?: number; // Phase 87
};

export interface DungeonMastery {
    explorerLevel: number; // Reveal radius
    slayerLevel: number;   // Damage bonus
    looterLevel: number;   // Drop chance
    trapSenseLevel: number; // Trap mitigation
}

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

export interface ActivePotion {
    id: string;
    name: string;
    effect: Potion['effect'];
    value: number;
    endTime: number;
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
    // Phase 3: Monuments
    monuments: Record<string, number>; // id -> level
    totalContribution: number;
}

export type GambitCondition = 'always' | 'hp<50' | 'hp<30' | 'mp<50' | 'ally_hp<50' | 'ally_dead' | 'enemy_boss' | 'enemy_count>2' |
    'enemy_fire' | 'enemy_water' | 'enemy_nature' | 'enemy_dark' | 'enemy_light' |
    'weather_rain' | 'weather_blizzard' | 'weather_sandstorm' | 'weather_eclipse' | 'weather_aurora' |
    'party_full' | 'party_low_hp';
export type GambitAction = 'attack' | 'heal' | 'strong_attack' | 'aoe_attack' | 'use_potion' | 'revive' | 'buff_atk' | 'buff_def' | 'defend' | 'cast_fireball';

export interface Gambit {
    id: string;
    condition: GambitCondition;
    action: GambitAction;
    target?: string; // 'self', 'weakest_ally', 'boss'
    // Visual Editor Data (Phase 5)
    position?: { x: number; y: number };
    customName?: string;
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
    { id: 'g1', name: 'Xang', description: '+10% Physical Damage', bonusType: 'physical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Physical Damage', members: 0, monuments: {}, totalContribution: 0 },
    { id: 'g2', name: 'Zhauw', description: '+10% Magical Damage', bonusType: 'magical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Magical Damage', members: 0, monuments: {}, totalContribution: 0 },
    { id: 'g3', name: 'Yang', description: '+10% Critical Damage', bonusType: 'crit', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Critical Damage', members: 0, monuments: {}, totalContribution: 0 }
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

// Update 81: Temporal Anomalies
export interface Pet extends Entity {
    id: string;
    name: string;
    type: 'pet';
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'chimera';
    level: number;
    stats: Stats;
    bonus: string;
    ability?: string;
    emoji: string;
    xp: number;
    maxXp: number;
    isDead: boolean;
    // Phase 4: Chimera
    chimera?: boolean;
    parents?: string[];
    fusionCount?: number;
}
export interface RiftBlessing {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'legendary';
    effect: (stats: Stats) => Stats;
    icon: string;
}

export interface RiftState {
    active: boolean;
    floor: number;
    blessings: RiftBlessing[];
    tempHeroes: Hero[]; // Using Hero[] for now, might need TempHero wrapper later
    maxFloor: number;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    power: number;
    avatar: string;
    isPlayer?: boolean;
}



import type { DungeonInteraction } from './dungeon';
export type { DungeonInteraction };

export interface GameActions {
    // Basic
    toggleSound: () => void;
    setGameSpeed: (speed: number) => void;

    // Heroes
    spendStatPoint: (heroId: string, stat: keyof Stats) => void;
    recruitHero: (heroId: string) => void;
    evolveHero: (heroId: string) => void;
    toggleAssignment: (heroId: string) => void;
    // Phase 91: Corruption
    purifyHero: (heroId: string) => void;
    renameHero: (heroId: string, name: string) => void;
    changeHeroEmoji: (heroId: string, emoji: string) => void;
    equipItem: (heroId: string, item: Item) => void;
    unequipItem: (heroId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
    updateGambits: (heroId: string, gambits: Gambit[]) => void;

    // Progression
    buyTalent: (id: string, amount?: number) => void;
    buyConstellation: (id: string) => void;
    buyStarlightUpgrade: (id: string) => void;

    // Exploration & Combat
    // enterTower: () => void; // Deprecated
    // prestigeTower: () => void; // Deprecated
    enterDungeon: (bossLevel: number) => void;
    descendDungeon: () => void;
    exitDungeon: () => void;
    moveDungeon: (dx: number, dy: number) => DungeonInteraction | null;
    handleDungeonEvent: (event: DungeonInteraction) => void;
    toggleRaid: () => void;
    fightArena: (opponent: ArenaOpponent) => void;

    // Galaxy & Territories
    attackSector: (id: string) => void;
    attackTerritory: (id: string) => void;

    // Minigames/Features
    breedPets: (parent1: Pet, parent2: Pet) => void;
    feedPet: (foodType: 'gold' | 'souls', petId?: string) => void;
    winCardBattle: (opponentId: string, difficulty: number) => void;
    forgeUpgrade: (material: 'copper' | 'iron' | 'mithril') => void;
    craftStarForgedItem: (item: Item, goldCost: number, fragmentCost: number) => void;

    // Social/Guild
    joinGuild: (guildName: string) => void;
    contributeGuild: (amount: number) => void;
    summonTavernLine: () => void;

    // Town
    upgradeBuilding: (id: string) => void;

    // Spaceship
    upgradeSpaceship: (part: keyof Spaceship['parts']) => void;

    // Dailies
    claimLoginReward: () => void;
    claimDailyQuest: (questId: string) => void;
    checkDailies: () => void;

    // Void & Rebirth
    enterVoid: () => void;
    triggerRebirth: () => void;
    triggerAscension: () => void;
    buyDarkGift: (cost: number, effect: string) => void;
    ascendToVoid: () => void;

    // Crafting & Items
    craftRune: () => void;
    socketRune: (itemId: string, runeId: string) => void;
    reforgeItem: (itemId: string) => void;
    manualFish: () => void;
    brewPotion: (potionId: string) => void;
    startExpedition: (exp: Expedition) => void;

    // Settings & State
    setTheme: (theme: string) => void;
    setAutoSellRarity: (rarity: 'none' | 'common' | 'rare') => void;
    resetSave: () => void;
    exportSave: () => string;
    importSave: (str: string) => void;
    closeOfflineModal: () => void;

    // Quests
    claimQuest: (id: string) => void;

    // Market
    buyMarketItem: (item: MarketItem) => void;

    // Rifts
    enterRift: (rift: Rift) => void;
    exitRift: (success: boolean) => void;
    startRift: () => void;
    selectBlessing: (blessing: RiftBlessing) => void;

    // Phase 3
    upgradeMonument: (id: string) => void;

    // Phase 5: Gambit Editor
    moveGambit: (heroId: string, gambitId: string, x: number, y: number) => void;
    renameGambit: (heroId: string, gambitId: string, name: string) => void;

    // Phase 6: World Boss
    attackWorldBoss: () => void;
    claimWorldBossReward: () => void;

    // Phase 9: Void
    challengeVoidCore: () => void;
    setVictory: (val: boolean) => void;

    // Mastery
    buyMasteryUpgrade: (type: keyof DungeonMastery) => void;
    assignHero: (id: string) => void;

    // Phase 92: Town Events
    interactWithEvent: (eventId: string, action: 'buy' | 'defend' | 'join', data?: any) => void;
    dismissEvent: () => void;

    // Formations
    saveFormation: (name: string) => void;
    loadFormation: (formation: any) => void;
    deleteFormation: (id: string) => void;
}

export interface WorldBoss extends Boss {
    globalHp: number;
    maxGlobalHp: number;
    tier: number;
    participants: number;
    endTime: number;
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
