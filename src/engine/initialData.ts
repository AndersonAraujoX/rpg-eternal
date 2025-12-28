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
    { id: 'h9', name: 'Necromancer', type: 'hero', class: 'Necromancer', unlocked: false, emoji: '🦴', isDead: false, element: 'dark', assignment: 'combat', gambits: [], corruption: false, level: 1, xp: 0, maxXp: 100, statPoints: 0, skills: [], stats: { hp: 90, maxHp: 90, mp: 100, maxMp: 100, attack: 10, magic: 30, defense: 6, speed: 8 } }
];

export const INITIAL_BOSS: Boss = {
    id: 'boss-1', name: 'Slime', emoji: '🦠', type: 'boss', level: 1, isDead: false, element: 'neutral',
    stats: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 12, magic: 0, defense: 2, speed: 8 }
};

export const INITIAL_PET_DATA: Pet = {
    id: 'pet-dragon', name: 'Baby Dragon', type: 'pet', bonus: 'DPS', emoji: '🐉', isDead: false,
    level: 1, xp: 0, maxXp: 100,
    stats: { attack: 5, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 }
};

export const AVAILABLE_PETS: Pet[] = [
    INITIAL_PET_DATA,
    { id: 'pet-eye', name: 'Floating Eye', type: 'pet', bonus: '+Crit Dmg', emoji: '👁️', isDead: false, level: 1, xp: 0, maxXp: 100, stats: { attack: 2, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 } },
    { id: 'pet-slime', name: 'Golden Slime', type: 'pet', bonus: '+Gold', emoji: '🦠', isDead: false, level: 1, xp: 0, maxXp: 100, stats: { attack: 1, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 } }
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
