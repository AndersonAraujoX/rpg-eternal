import type { Hero, Boss, Pet, Talent, ConstellationNode, Artifact, Guild, GameStats, Achievement } from './types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'k1', name: 'Slayer I', description: 'Kill 100 Monsters', isUnlocked: false, condition: { type: 'kills', value: 100 }, rewardType: 'damage', rewardValue: 0.05, rewardText: '+5% Attack' },
    { id: 'g1', name: 'Midas I', description: 'Earn 1000 Gold', isUnlocked: false, condition: { type: 'gold', value: 1000 }, rewardType: 'gold', rewardValue: 0.05, rewardText: '+5% Gold' },
    { id: 'c1', name: 'Clicker I', description: 'Click 500 Times', isUnlocked: false, condition: { type: 'clicks', value: 500 }, rewardType: 'damage', rewardValue: 0.05, rewardText: '+5% Click Dmg' }, // Assuming click dmg is generic dmg for now or add specific type
    { id: 'b1', name: 'Boss Hunter I', description: 'Kill 10 Bosses', isUnlocked: false, condition: { type: 'bossKills', value: 10 }, rewardType: 'bossDamage', rewardValue: 0.1, rewardText: '+10% Boss Dmg' },
];

export const INITIAL_HEROES: Hero[] = [
    { id: 'h1', name: 'Warrior', type: 'hero', class: 'Warrior', emoji: '🛡️', unlocked: true, isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 } },
    { id: 'h2', name: 'Mage', type: 'hero', class: 'Mage', emoji: '🔮', unlocked: true, isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 70, maxHp: 70, mp: 100, maxMp: 100, attack: 5, magic: 25, defense: 3, speed: 12 } },
    { id: 'h3', name: 'Healer', type: 'hero', class: 'Healer', emoji: '💚', unlocked: true, isDead: false, element: 'water', assignment: 'combat', gambits: [{ id: 'g1', condition: 'ally_hp<50', action: 'heal', target: 'weakest_ally' }], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, attack: 8, magic: 20, defense: 5, speed: 11 } },
    { id: 'h4', name: 'Rogue', type: 'hero', class: 'Rogue', unlocked: false, emoji: '🗡️', isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 85, maxHp: 85, mp: 50, maxMp: 50, attack: 25, magic: 5, defense: 5, speed: 15 } },
    { id: 'h5', name: 'Paladin', type: 'hero', class: 'Paladin', unlocked: false, emoji: '✝️', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 150, maxHp: 150, mp: 40, maxMp: 40, attack: 10, magic: 15, defense: 15, speed: 8 } },
    { id: 'h6', name: 'Warlock', type: 'hero', class: 'Warlock', unlocked: false, emoji: '☠️', isDead: false, element: 'water', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 60, maxHp: 60, mp: 120, maxMp: 120, attack: 5, magic: 35, defense: 2, speed: 9 } },
    { id: 'h7', name: 'Dragoon', type: 'hero', class: 'Dragoon', unlocked: false, emoji: '🐉', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 130, maxHp: 130, mp: 50, maxMp: 50, attack: 35, magic: 10, defense: 8, speed: 14 } },
    { id: 'h8', name: 'Sage', type: 'hero', class: 'Sage', unlocked: false, emoji: '📜', isDead: false, element: 'light', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 75, maxHp: 75, mp: 150, maxMp: 150, attack: 5, magic: 40, defense: 4, speed: 10 } },
    { id: 'h9', name: 'Necromancer', type: 'hero', class: 'Necromancer', unlocked: false, emoji: '🦴', isDead: false, element: 'dark', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 90, maxHp: 90, mp: 100, maxMp: 100, attack: 10, magic: 30, defense: 6, speed: 8 } },
    { id: 'h10', name: 'Bard', type: 'hero', class: 'Bard', unlocked: false, emoji: '🎻', isDead: false, element: 'neutral', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 80, maxHp: 80, mp: 100, maxMp: 100, attack: 10, magic: 20, defense: 5, speed: 12 } },
    { id: 'h11', name: 'Monk', type: 'hero', class: 'Monk', unlocked: false, emoji: '🧘', isDead: false, element: 'neutral', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 110, maxHp: 110, mp: 30, maxMp: 30, attack: 18, magic: 5, defense: 10, speed: 14 } },
    { id: 'h12', name: 'Ranger', type: 'hero', class: 'Ranger', unlocked: false, emoji: '🏹', isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 90, maxHp: 90, mp: 40, maxMp: 40, attack: 22, magic: 5, defense: 5, speed: 15 } },
    { id: 'h13', name: 'Druid', type: 'hero', class: 'Druid', unlocked: false, emoji: '🌿', isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 80, maxMp: 80, attack: 10, magic: 15, defense: 8, speed: 10 } },
    { id: 'h14', name: 'Berserker', type: 'hero', class: 'Berserker', unlocked: false, emoji: '🪓', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 140, maxHp: 140, mp: 20, maxMp: 20, attack: 30, magic: 0, defense: 0, speed: 12 } },
    { id: 'h15', name: 'Sorcerer', type: 'hero', class: 'Sorcerer', unlocked: false, emoji: '⚡', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 60, maxHp: 60, mp: 150, maxMp: 150, attack: 5, magic: 35, defense: 2, speed: 10 } },
    { id: 'h16', name: 'Templar', type: 'hero', class: 'Templar', unlocked: false, emoji: '🛡️✨', isDead: false, element: 'light', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 160, maxHp: 160, mp: 50, maxMp: 50, attack: 15, magic: 10, defense: 25, speed: 8 } },
    { id: 'h17', name: 'Assassin', type: 'hero', class: 'Assassin', unlocked: false, emoji: '🗡️🌑', isDead: false, element: 'dark', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 80, maxHp: 80, mp: 40, maxMp: 40, attack: 35, magic: 5, defense: 3, speed: 18 } },
    { id: 'h18', name: 'Engineer', type: 'hero', class: 'Engineer', unlocked: false, emoji: '🔧', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 60, maxMp: 60, attack: 15, magic: 15, defense: 12, speed: 10 } },
    { id: 'h19', name: 'Alchemist', type: 'hero', class: 'Alchemist', unlocked: false, emoji: '⚗️', isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 90, maxHp: 90, mp: 80, maxMp: 80, attack: 10, magic: 25, defense: 5, speed: 11 } },
    { id: 'h20', name: 'Illusionist', type: 'hero', class: 'Illusionist', unlocked: false, emoji: '🎭', isDead: false, element: 'dark', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 70, maxHp: 70, mp: 120, maxMp: 120, attack: 5, magic: 30, defense: 5, speed: 15 } },
    { id: 'h21', name: 'Samurai', type: 'hero', class: 'Samurai', unlocked: false, emoji: '🏯', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 100, maxHp: 100, mp: 40, maxMp: 40, attack: 28, magic: 5, defense: 8, speed: 14 } },
    { id: 'h22', name: 'Viking', type: 'hero', class: 'Viking', unlocked: false, emoji: '🛶', isDead: false, element: 'water', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 150, maxHp: 150, mp: 20, maxMp: 20, attack: 25, magic: 0, defense: 10, speed: 9 } },
    { id: 'h23', name: 'Ninja', type: 'hero', class: 'Ninja', unlocked: false, emoji: '🥷', isDead: false, element: 'dark', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 80, maxHp: 80, mp: 50, maxMp: 50, attack: 20, magic: 10, defense: 5, speed: 20 } },
    { id: 'h24', name: 'Pirate', type: 'hero', class: 'Pirate', unlocked: false, emoji: '🏴‍☠️', isDead: false, element: 'water', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 110, maxHp: 110, mp: 30, maxMp: 30, attack: 22, magic: 5, defense: 8, speed: 12 } },
    { id: 'h25', name: 'Fisherman', type: 'hero', class: 'Fisherman', unlocked: false, emoji: '🎣', isDead: false, element: 'water', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 95, maxHp: 95, mp: 40, maxMp: 40, attack: 12, magic: 10, defense: 10, speed: 10 } },
    { id: 'h26', name: 'Blacksmith', type: 'hero', class: 'Blacksmith', unlocked: false, emoji: '⚒️', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 120, maxHp: 120, mp: 30, maxMp: 30, attack: 20, magic: 5, defense: 15, speed: 9 } },
    { id: 'h27', name: 'Miner', type: 'hero', class: 'Miner', unlocked: false, emoji: '⛏️', isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 110, maxHp: 110, mp: 20, maxMp: 20, attack: 15, magic: 5, defense: 12, speed: 8 } },
];

export const INITIAL_BOSS: Boss = {
    id: 'boss-1', name: 'Slime', emoji: '🦠', type: 'boss', level: 1, isDead: false, element: 'neutral',
    stats: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 12, magic: 0, defense: 2, speed: 8 }
};

export const INITIAL_PET_DATA: Pet = {
    id: 'pet_default',
    name: 'Unknown Pet',
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
    { id: 'pet-eye', name: 'Floating Eye', type: 'pet', bonus: '+Crit Dmg', emoji: '👁️', isDead: false, level: 1, xp: 0, maxXp: 100, rarity: 'common', stats: { attack: 2, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 } },
    { id: 'pet-slime', name: 'Golden Slime', type: 'pet', bonus: '+Gold', emoji: '🦠', isDead: false, level: 1, xp: 0, maxXp: 100, rarity: 'rare', stats: { attack: 1, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 } }
];

export const INITIAL_TALENTS: Talent[] = [
    { id: 't1', name: 'Sharpness', level: 0, maxLevel: 50, cost: 10, costScaling: 1.5, description: '+5% Damage', stat: 'attack', valuePerLevel: 0.05 },
    { id: 't2', name: 'Haste', level: 0, maxLevel: 20, cost: 50, costScaling: 2, description: '-2% Combat Delay', stat: 'speed', valuePerLevel: 0.02 },
    { id: 't3', name: 'Greed', level: 0, maxLevel: 10, cost: 100, costScaling: 3, description: '+10% Value', stat: 'gold', valuePerLevel: 0.1 },
    { id: 't4', name: 'Precision', level: 0, maxLevel: 25, cost: 25, costScaling: 1.8, description: '+1% Crit Chance', stat: 'crit', valuePerLevel: 0.01 }
];

export const INITIAL_STATS: GameStats = {
    totalGoldEarned: 0,
    totalKills: 0,
    bossKills: 0,
    clicks: 0,
    totalDamageDealt: 0,
    highestDps: 0,
    playTime: 0,
    ascensions: 0,
    tavernPurchases: 0
};

export const INITIAL_CONSTELLATIONS: ConstellationNode[] = [
    { id: 'c1', name: 'Orion', description: '+Boss Damage', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'bossDamage', valuePerLevel: 0.10, x: 20, y: 50 },
    { id: 'c2', name: 'Lyra', description: '+Gold Drops', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'goldDrop', valuePerLevel: 0.20, x: 50, y: 20 },
    { id: 'c3', name: 'Phoenix', description: '+Soul Drops', level: 0, maxLevel: 10, cost: 2, costScaling: 3, bonusType: 'soulDrop', valuePerLevel: 0.10, x: 80, y: 50 },
    { id: 'c4', name: 'Draco', description: 'Revive Speed', level: 0, maxLevel: 5, cost: 5, costScaling: 4, bonusType: 'autoReviveSpeed', valuePerLevel: 0.50, x: 50, y: 80 }
];

export const RARE_ARTIFACTS: Artifact[] = [
    { id: 'a1', name: 'Crown of Kings', description: 'Start at Lvl 5', emoji: '👑', bonus: 'lvl+5', unlocked: false },
    { id: 'a2', name: 'Void Stone', description: '+50% All Stats', emoji: '🌑', bonus: 'stats+50', unlocked: false },
    { id: 'a3', name: 'Phoenix Feather', description: 'Auto-Revive (10s)', emoji: '🪶', bonus: 'revive', unlocked: false }
];

export const GUILDS: Guild[] = [
    { id: 'g1', name: 'Xang', description: '+10% Physical Damage', bonusType: 'physical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Physical Damage', members: 0 },
    { id: 'g2', name: 'Zhauw', description: '+10% Magical Damage', bonusType: 'magical', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Magical Damage', members: 0 },
    { id: 'g3', name: 'Yang', description: '+10% Critical Damage', bonusType: 'crit', bonusValue: 0.1, level: 1, xp: 0, maxXp: 1000, bonus: '+10% Critical Damage', members: 0 }
];
