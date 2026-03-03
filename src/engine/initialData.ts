import type { Hero, Boss, Pet, Talent, ConstellationNode, Artifact, Guild, GameStats, Achievement, Building, CardOpponent, LeaderboardEntry, Spaceship, ClassMastery } from './types';


export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'k1', name: 'Caçador I', description: 'Mate 100 Monstros', isUnlocked: false, condition: { type: 'kills', value: 100 }, rewardType: 'damage', rewardValue: 0.05, rewardText: '+5% de Ataque' },
    { id: 'g1', name: 'Midas I', description: 'Ganhe 1000 de Ouro', isUnlocked: false, condition: { type: 'gold', value: 1000 }, rewardType: 'gold', rewardValue: 0.05, rewardText: '+5% de Ouro' },
    { id: 'c1', name: 'Clicador I', description: 'Clique 500 Vezes', isUnlocked: false, condition: { type: 'clicks', value: 500 }, rewardType: 'damage', rewardValue: 0.05, rewardText: '+5% Dano de Clique' },
    { id: 'b1', name: 'Caçador de Chefes I', description: 'Mate 10 Chefes', isUnlocked: false, condition: { type: 'bossKills', value: 10 }, rewardType: 'bossDamage', rewardValue: 0.1, rewardText: '+10% Dano contra Chefes' },
    // Phase 52: New Achievements
    { id: 'm1', name: 'Coração de Ferro', description: 'Minere 100 Recursos', isUnlocked: false, condition: { type: 'oreMined', value: 100 }, rewardType: 'mining', rewardValue: 0.1, rewardText: '+10% de Rendimento de Mineração' },
    { id: 'f1', name: 'Mestre Ferreiro', description: 'Forje 25 Itens', isUnlocked: false, condition: { type: 'itemsForged', value: 25 }, rewardType: 'crafting', rewardValue: 0.1, rewardText: '+10% de Velocidade de Forja' },
    { id: 'fi1', name: 'Pescador', description: 'Pesque 50 Peixes', isUnlocked: false, condition: { type: 'fishCaught', value: 50 }, rewardType: 'fishing', rewardValue: 0.1, rewardText: '+10% de Sorte na Pesca' },
];

export const INITIAL_HEROES: Hero[] = [
    {
        id: 'h1', name: 'Guerreiro', type: 'hero', class: 'Warrior', emoji: '🛡️', unlocked: true, isDead: false, element: 'nature', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [
            { id: 's1', name: 'Pancada com Escudo', description: 'Causa 200% de dano de Ataque.', unlockLevel: 1, cooldown: 5, currentCooldown: 0, type: 'active', effectType: 'damage', target: 'enemy', value: 2.0 }
        ], stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 }, equipment: {}
    },
    {
        id: 'h2', name: 'Mago', type: 'hero', class: 'Mage', emoji: '🔮', unlocked: false, isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [
            { id: 's2', name: 'Bola de Fogo', description: 'Causa 300% de dano Mágico.', unlockLevel: 1, cooldown: 8, currentCooldown: 0, type: 'active', effectType: 'damage', target: 'enemy', element: 'fire', value: 3.0 }
        ], stats: { hp: 70, maxHp: 70, mp: 100, maxMp: 100, attack: 5, magic: 25, defense: 3, speed: 12 }, equipment: {}
    },
    {
        id: 'h3', name: 'Curandeiro', type: 'hero', class: 'Healer', emoji: '💚', unlocked: false, isDead: false, element: 'water', assignment: 'combat', gambits: [{ id: 'g1', condition: 'ally_hp<50', action: 'heal', target: 'weakest_ally' }], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [
            { id: 's3', name: 'Cura Menor', description: 'Restaura 20% do HP Máximo.', unlockLevel: 1, cooldown: 6, currentCooldown: 0, type: 'active', effectType: 'heal', target: 'lowest_hp', value: 0.2 }
        ], stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, attack: 8, magic: 20, defense: 5, speed: 11 }, equipment: {}
    },
    { id: 'h4', name: 'Ladino', type: 'hero', class: 'Rogue', unlocked: false, emoji: '🗡️', isDead: false, element: 'nature', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 85, maxHp: 85, mp: 50, maxMp: 50, attack: 25, magic: 5, defense: 5, speed: 15 }, equipment: {} },
    { id: 'h5', name: 'Paladino', type: 'hero', class: 'Paladin', unlocked: false, emoji: '✝️', isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 150, maxHp: 150, mp: 40, maxMp: 40, attack: 10, magic: 15, defense: 15, speed: 8 }, equipment: {} },
    { id: 'h6', name: 'Bruxo', type: 'hero', class: 'Warlock', unlocked: false, emoji: '☠️', isDead: false, element: 'water', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 60, maxHp: 60, mp: 120, maxMp: 120, attack: 5, magic: 35, defense: 2, speed: 9 }, equipment: {} },
    { id: 'h7', name: 'Dragoon', type: 'hero', class: 'Dragoon', unlocked: false, emoji: '🐉', isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 130, maxHp: 130, mp: 50, maxMp: 50, attack: 35, magic: 10, defense: 8, speed: 14 }, equipment: {} },
    { id: 'h8', name: 'Sábio', type: 'hero', class: 'Sage', unlocked: false, emoji: '📜', isDead: false, element: 'light', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 75, maxHp: 75, mp: 150, maxMp: 150, attack: 5, magic: 40, defense: 4, speed: 10 }, equipment: {} },
    { id: 'h9', name: 'Necromante', type: 'hero', class: 'Necromancer', unlocked: false, emoji: '🦴', isDead: false, element: 'dark', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 90, maxHp: 90, mp: 100, maxMp: 100, attack: 10, magic: 30, defense: 6, speed: 8 }, equipment: {} },
    { id: 'h10', name: 'Bardo', type: 'hero', class: 'Bard', unlocked: false, emoji: '🎻', isDead: false, element: 'neutral', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 80, maxHp: 80, mp: 100, maxMp: 100, attack: 10, magic: 20, defense: 5, speed: 12 }, equipment: {} },
    { id: 'h11', name: 'Monge', type: 'hero', class: 'Monk', unlocked: false, emoji: '🧘', isDead: false, element: 'neutral', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 110, maxHp: 110, mp: 30, maxMp: 30, attack: 18, magic: 5, defense: 10, speed: 14 }, equipment: {} },
    { id: 'h12', name: 'Patrulheiro', type: 'hero', class: 'Ranger', unlocked: false, emoji: '🏹', isDead: false, element: 'nature', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 90, maxHp: 90, mp: 40, maxMp: 40, attack: 22, magic: 5, defense: 5, speed: 15 }, equipment: {} },
    { id: 'h13', name: 'Druida', type: 'hero', class: 'Druid', unlocked: false, emoji: '🌿', isDead: false, element: 'nature', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 80, maxMp: 80, attack: 10, magic: 15, defense: 8, speed: 10 }, equipment: {} },
    { id: 'h14', name: 'Berserker', type: 'hero', class: 'Berserker', unlocked: false, emoji: '🪓', isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 140, maxHp: 140, mp: 20, maxMp: 20, attack: 30, magic: 0, defense: 0, speed: 12 }, equipment: {} },
    { id: 'h15', name: 'Feiticeiro', type: 'hero', class: 'Sorcerer', unlocked: false, emoji: '⚡', isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 60, maxHp: 60, mp: 150, maxMp: 150, attack: 5, magic: 35, defense: 2, speed: 10 }, equipment: {} },
    { id: 'h16', name: 'Templário', type: 'hero', class: 'Templar', unlocked: false, emoji: '🛡️✨', isDead: false, element: 'light', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 160, maxHp: 160, mp: 50, maxMp: 50, attack: 15, magic: 10, defense: 25, speed: 8 }, equipment: {} },
    { id: 'h17', name: 'Assassino', type: 'hero', class: 'Assassin', unlocked: false, emoji: '🗡️🌑', isDead: false, element: 'dark', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 80, maxHp: 80, mp: 40, maxMp: 40, attack: 35, magic: 5, defense: 3, speed: 18 }, equipment: {} },
    { id: 'h18', name: 'Engenheiro', type: 'hero', class: 'Engineer', unlocked: false, emoji: '🔧', isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 60, maxMp: 60, attack: 15, magic: 15, defense: 12, speed: 10 }, equipment: {} },
    { id: 'h19', name: 'Alquimista', type: 'hero', class: 'Alchemist', unlocked: false, emoji: '⚗️', isDead: false, element: 'nature', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 90, maxHp: 90, mp: 80, maxMp: 80, attack: 10, magic: 25, defense: 5, speed: 11 }, equipment: {} },
    { id: 'h20', name: 'Ilusionista', type: 'hero', class: 'Illusionist', unlocked: false, emoji: '🎭', isDead: false, element: 'dark', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 70, maxHp: 70, mp: 120, maxMp: 120, attack: 5, magic: 30, defense: 5, speed: 15 }, equipment: {} },
    { id: 'h21', name: 'Samurai', type: 'hero', class: 'Samurai', unlocked: false, emoji: '🏯', isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 40, maxMp: 40, attack: 28, magic: 5, defense: 8, speed: 14 }, equipment: {} },
    { id: 'h22', name: 'Viking', type: 'hero', class: 'Viking', unlocked: false, emoji: '🛶', isDead: false, element: 'water', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 150, maxHp: 150, mp: 20, maxMp: 20, attack: 25, magic: 0, defense: 10, speed: 9 }, equipment: {} },
    { id: 'h23', name: 'Ninja', type: 'hero', class: 'Ninja', unlocked: false, emoji: '🥷', isDead: false, element: 'dark', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 80, maxHp: 80, mp: 50, maxMp: 50, attack: 20, magic: 10, defense: 5, speed: 20 }, equipment: {} },
    { id: 'h24', name: 'Pirata', type: 'hero', class: 'Pirate', unlocked: false, emoji: '🏴‍☠️', isDead: false, element: 'water', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 110, maxHp: 110, mp: 30, maxMp: 30, attack: 22, magic: 5, defense: 8, speed: 12 }, equipment: {} },
    { id: 'h25', name: 'Pescador', type: 'hero', class: 'Fisherman', unlocked: false, emoji: '🎣', isDead: false, element: 'water', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 95, maxHp: 95, mp: 40, maxMp: 40, attack: 12, magic: 10, defense: 10, speed: 10 }, equipment: {} },
    { id: 'h26', name: 'Ferreiro', type: 'hero', class: 'Blacksmith', unlocked: false, emoji: '⚒️', isDead: false, element: 'fire', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 120, maxHp: 120, mp: 30, maxMp: 30, attack: 20, magic: 5, defense: 15, speed: 9 }, equipment: {} },
    { id: 'h27', name: 'Minerador', type: 'hero', class: 'Miner', unlocked: false, emoji: '⛏️', isDead: false, element: 'nature', assignment: 'combat', gambits: [], insanity: 0, level: 1, xp: 0, maxXp: 100, fatigue: 0, maxFatigue: 100, statPoints: 0, skills: [], stats: { hp: 110, maxHp: 110, mp: 20, maxMp: 20, attack: 15, magic: 5, defense: 12, speed: 8 }, equipment: {} },
];

export const INITIAL_BOSS: Boss = {
    id: 'boss-1', name: 'Slime', emoji: '🦠', type: 'boss', level: 1, isDead: false, element: 'neutral',
    stats: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 12, magic: 0, defense: 2, speed: 8 }
};

export const INITIAL_PET_DATA: Pet = {
    id: 'pet_default',
    name: 'Pet Desconhecido',
    type: 'pet',
    bonus: '+0%',
    emoji: '🥚',
    isDead: false,
    level: 1,
    xp: 0,
    maxXp: 100,
    rarity: 'common',
    stats: { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 }
};

export const INITIAL_PETS: Pet[] = [
    { id: 'pet-eye', name: 'Olho Flutuante', type: 'pet', bonus: '+Dano Crítico', emoji: '👁️', isDead: false, level: 1, xp: 0, maxXp: 100, rarity: 'common', stats: { attack: 2, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 } },
    { id: 'pet-slime', name: 'Slime Dourado', type: 'pet', bonus: '+Ouro', emoji: '🦠', isDead: false, level: 1, xp: 0, maxXp: 100, rarity: 'rare', stats: { attack: 1, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 } }
];

export const INITIAL_TALENTS: Talent[] = [
    { id: 't1', name: 'Afiação', level: 0, maxLevel: 50, cost: 10, costScaling: 1.5, description: '+5% de Dano', stat: 'attack', valuePerLevel: 0.05 },
    { id: 't2', name: 'Pressa', level: 0, maxLevel: 20, cost: 50, costScaling: 2, description: '-2% de Atraso de Combate', stat: 'speed', valuePerLevel: 0.02 },
    { id: 't3', name: 'Ganância', level: 0, maxLevel: 10, cost: 100, costScaling: 3, description: '+10% de Valor', stat: 'gold', valuePerLevel: 0.1 },
    { id: 't4', name: 'Precisão', level: 0, maxLevel: 25, cost: 25, costScaling: 1.8, description: '+1% de Chance Crítica', stat: 'crit', valuePerLevel: 0.01 }
];

export const INITIAL_GAME_STATS: GameStats = {
    totalGoldEarned: 0,
    totalKills: 0,
    bossKills: 0,
    clicks: 0,
    totalDamageDealt: 0,
    highestDps: 0,
    playTime: 0,
    ascensions: 0,
    tavernPurchases: 0,
    itemsForged: 0,
    oreMined: 0,
    fishCaught: 0,
    voidAscensions: 0,
    heroPity: 0,
    petPity: 0,
    legendaryFishCount: 0,
    automationActive: {
        fishing: false,
        crafting: false,
        garden: false,
        expeditions: false
    }
};

export const INITIAL_BUILDINGS: Building[] = [
    { id: 'b_tavern', name: 'Caneca Enferrujada', description: 'Atrai heróis melhores e reduz custos de recrutamento.', level: 1, maxLevel: 10, cost: 1000, costScaling: 2.5, bonus: '-5% Custo de Recruta / Nível', effectValue: 0.05, currency: 'gold', emoji: '🍺' },
    { id: 'b_forge', name: 'Forja Eterna', description: 'Melhora a eficiência e descontos de forja.', level: 1, maxLevel: 10, cost: 2000, costScaling: 3, bonus: '-5% Custo de Melhoria / Nível', effectValue: 0.05, currency: 'gold', emoji: '⚒️' },
    { id: 'b_temple', name: 'Templo da Luz', description: 'Um lugar de adoração que coleta mais Almas.', level: 1, maxLevel: 10, cost: 5000, costScaling: 4, bonus: '+10% Ganho de Almas / Nível', effectValue: 0.1, currency: 'gold', emoji: '🏛️' },
    { id: 'b_guild', name: 'Guilda dos Heróis', description: 'Hub central para operações da guilda.', level: 1, maxLevel: 5, cost: 10000, costScaling: 5, bonus: '+20% XP de Guilda / Nível', effectValue: 0.2, currency: 'gold', emoji: '🏰' }
];

export const INITIAL_CONSTELLATIONS: ConstellationNode[] = [
    { id: 'c1', name: 'Órion', description: '+Dano de Chefe', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'bossDamage', valuePerLevel: 0.10, x: 20, y: 50 },
    { id: 'c2', name: 'Lyra', description: '+Drops de Ouro', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'goldDrop', valuePerLevel: 0.20, x: 50, y: 20 },
    { id: 'c3', name: 'Fênix', description: '+Drops de Almas', level: 0, maxLevel: 10, cost: 2, costScaling: 3, bonusType: 'soulDrop', valuePerLevel: 0.10, x: 80, y: 50 },
    { id: 'c4', name: 'Draco', description: 'Velocidade de Ressurreição', level: 0, maxLevel: 5, cost: 5, costScaling: 4, bonusType: 'autoReviveSpeed', valuePerLevel: 0.50, x: 50, y: 80 }
];


export const FAKE_LEADERBOARD: LeaderboardEntry[] = [
    { id: '1', name: 'TheLegend27', power: 1000000000, avatar: '🐉' },
    { id: '2', name: 'NoobMaster69', power: 500000000, avatar: '🎮' },
    { id: '3', name: 'Kirito_SAO', power: 250000000, avatar: '⚔️' },
    { id: '4', name: 'Leroy_Jenkins', power: 100000000, avatar: '🍗' },
    { id: '5', name: 'Geralt', power: 50000000, avatar: '🐺' },
    { id: '6', name: 'Cloud_Strife', power: 25000000, avatar: '🗡️' },
    { id: '7', name: 'Sephiroth', power: 10000000, avatar: '☄️' },
    { id: '8', name: 'Mario', power: 5000000, avatar: '🍄' },
    { id: '9', name: 'Link', power: 2500000, avatar: '🛡️' },
    { id: '10', name: 'Zelda', power: 1000000, avatar: '👑' },
    // Filler
    { id: '11', name: 'Gandalf', power: 500000, avatar: '🧙' },
    { id: '12', name: 'Aragorn', power: 250000, avatar: '👑' },
    { id: '13', name: 'Legolas', power: 100000, avatar: '🏹' },
    { id: '14', name: 'Gimli', power: 50000, avatar: '🪓' },
    { id: '15', name: 'Frodo', power: 25000, avatar: '💍' },
    { id: '16', name: 'Samwise', power: 10000, avatar: '🍳' },
    { id: '17', name: 'Gollum', power: 5000, avatar: '🐟' },
    { id: '18', name: 'Sauron', power: 5000000000, avatar: '👁️' }, // Top of list
    { id: '19', name: 'Voldemort', power: 2000000, avatar: '🐍' },
    { id: '20', name: 'Harry', power: 1500000, avatar: '⚡' },
];



export const RARE_ARTIFACTS: Artifact[] = [
    { id: 'a1', name: 'Coroa dos Reis', description: 'Comece no Nível 5', emoji: '👑', bonus: 'nível+5', unlocked: false, bonusType: 'xp', bonusValue: 5.0 },
    { id: 'a2', name: 'Pedra do Vazio', description: '+50% em Todos os Status', emoji: '🌑', bonus: 'stats+50', unlocked: false, bonusType: 'damage', bonusValue: 0.5 },
    { id: 'a3', name: 'Pena de Fênix', description: 'Ressurreição Automática (10s)', emoji: '🪶', bonus: 'ressurreição', unlocked: false, bonusType: 'defense', bonusValue: 0.2 }
];

export const INITIAL_CLASS_MASTERY: Record<string, ClassMastery> = {
    'Warrior': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Mage': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Healer': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Rogue': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Paladin': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Warlock': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Dragoon': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Sage': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
    'Necromancer': { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] },
};

export const GUILDS: Guild[] = [
    { id: 'g1', name: 'Xang', description: '+10% de Dano Físico', bonusType: 'physical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% de Dano Físico', members: 0, monuments: {}, totalContribution: 0 },
    { id: 'g2', name: 'Zhauw', description: '+10% de Dano Mágico', bonusType: 'magical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% de Dano Mágico', members: 0, monuments: {}, totalContribution: 0 },
    { id: 'g3', name: 'Yang', description: '+10% de Dano Crítico', bonusType: 'crit', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% de Dano Crítico', members: 0, monuments: {}, totalContribution: 0 }
];

export const NPC_DUELISTS: CardOpponent[] = [
    { id: 'npc1', name: 'Treinador Novato', difficulty: 1, avatar: '🧢', deck: ['slime', 'bat', 'rat'] },
    { id: 'npc2', name: 'Tubarão das Cartas', difficulty: 3, avatar: '🦈', deck: ['wolf', 'snake', 'goblin'] },
    { id: 'npc3', name: 'Grão-mestre', difficulty: 10, avatar: '🧙‍♂️', deck: ['dragon', 'demon', 'golem'] }
];
export const INITIAL_SPACESHIP: Spaceship = {
    name: 'Explorador I',
    level: 1,
    fuel: 100,
    maxFuel: 100,
    hull: 100,
    maxHull: 100,
    parts: {
        engine: 1,
        scanners: 1,
        miningLaser: 1,
        shields: 1
    },
    upgrades: []
};
