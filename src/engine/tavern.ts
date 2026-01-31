import type { Hero, Artifact, Pet } from './types';
import { RARE_ARTIFACTS } from './initialData';

export interface TavernResult {
    cost: number;
    newHeroes: Hero[]; // Brand new entities (Miners)
    unlockedHeroIds: string[]; // Existing heroes to unlock
    newArtifacts: Artifact[];
    pendingPets: Pet[];
    statBoosts: number;
    minerBoosts: number;
    petXpBoosts: Record<string, number>;
    logs: string[];
    success: boolean;
    errorReason?: string;
}

export const simulateTavernSummon = (
    amount: number,
    gold: number,
    tavernPurchases: number,
    heroes: Hero[],
    artifacts: Artifact[],
    pets: Pet[],
    buildingLevel: number = 1 // Default to 1
): TavernResult => {
    const baseCost = 500;
    const costIncrease = 50;
    let totalCost = 0;

    for (let i = 0; i < amount; i++) {
        totalCost += baseCost + ((tavernPurchases + i) * costIncrease);
    }

    if (gold < totalCost) {
        return {
            cost: totalCost,
            newHeroes: [],
            unlockedHeroIds: [],
            newArtifacts: [],
            pendingPets: [],
            statBoosts: 0,
            minerBoosts: 0,
            petXpBoosts: {},
            logs: [`Need ${Math.floor(totalCost)} Gold for x${amount} summons!`],
            success: false,
            errorReason: 'insufficient_gold'
        };
    }

    // Bulk Processing
    const pendingHeroes: Hero[] = [];
    const pendingArtifacts: Artifact[] = [];
    const pendingPets: Pet[] = [];
    let statBoosts = 0;
    let minerBoosts = 0;
    const petXpBoosts: Record<string, number> = {};
    const logs: string[] = [];

    const newlyUnlockedIds = new Set<string>();
    const currentMinerCount = heroes.filter(h => h.class === 'Miner').length;
    let addedMinerInBatch = false;

    const existingPetMap = new Map<string, string>();
    pets.forEach(p => existingPetMap.set(p.name, p.id));
    const batchPetMap = new Map<string, number>();

    const luckBonus = (buildingLevel - 1) * 0.005; // +0.5% per level

    for (let i = 0; i < amount; i++) {
        const roll = Math.random();

        // Hero Chance: 30% + Luck
        if (roll < 0.3 + luckBonus) {
            const locked = heroes.filter(h => !h.unlocked && !newlyUnlockedIds.has(h.id) && h.class !== 'Miner');
            if (locked.length > 0) {
                const h = locked[Math.floor(Math.random() * locked.length)];
                newlyUnlockedIds.add(h.id);
                logs.push(`Recruited ${h.name}`);
            } else {
                statBoosts++;
            }
        }
        else if (roll < 0.35 + luckBonus) {
            const newArt = RARE_ARTIFACTS[Math.floor(Math.random() * RARE_ARTIFACTS.length)];
            const has = artifacts.some(a => a.id === newArt.id) || pendingArtifacts.some(a => a.id === newArt.id);
            if (!has) {
                pendingArtifacts.push(newArt);
                logs.push(`Found Artifact: ${newArt.name}`);
            }
        }
        else if (roll < 0.50 + luckBonus) {
            const PETS: Pet[] = [
                { id: 'p1', name: 'Wolf Pup', type: 'pet', emoji: '🐺', rarity: 'common', level: 1, xp: 0, maxXp: 100, bonus: '+5% Attack', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 0, magic: 0, speed: 1 }, isDead: false },
                { id: 'p2', name: 'Cat Spirit', type: 'pet', emoji: '🐱', rarity: 'common', level: 1, xp: 0, maxXp: 100, bonus: '+5% Speed', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 2, defense: 0, magic: 2, speed: 5 }, isDead: false },
                { id: 'p3', name: 'Slime', type: 'pet', emoji: '💧', rarity: 'common', level: 1, xp: 0, maxXp: 100, bonus: '+5% HP', stats: { hp: 20, maxHp: 20, mp: 0, maxMp: 0, attack: 1, defense: 1, magic: 0, speed: 0 }, isDead: false },
                { id: 'p4', name: 'Bat', type: 'pet', emoji: '🦇', rarity: 'common', level: 1, xp: 0, maxXp: 100, bonus: '+2% Life Steal', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 3, defense: 0, magic: 0, speed: 3 }, isDead: false },
                { id: 'p5', name: 'Dire Wolf', type: 'pet', emoji: '🐺', rarity: 'rare', level: 1, xp: 0, maxXp: 100, bonus: '+10% Crit Chance', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 12, defense: 0, magic: 0, speed: 2 }, isDead: false },
                { id: 'p6', name: 'Fairy', type: 'pet', emoji: '🧚', rarity: 'rare', level: 1, xp: 0, maxXp: 100, bonus: '+5 HP/sec Regen', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 2, defense: 0, magic: 10, speed: 0 }, isDead: false },
                { id: 'p7', name: 'Mimic', type: 'pet', emoji: '📦', rarity: 'epic', level: 1, xp: 0, maxXp: 100, bonus: '+15% Magic Find', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 5, magic: 0, speed: 0 }, isDead: false },
                { id: 'p8', name: 'Rock Golem', type: 'pet', emoji: '🗿', rarity: 'rare', level: 1, xp: 0, maxXp: 100, bonus: '+20% Defense', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 20, magic: 0, speed: -1 }, isDead: false },
                { id: 'p9', name: 'Ghost', type: 'pet', emoji: '👻', rarity: 'rare', level: 1, xp: 0, maxXp: 100, bonus: '+10% Evasion', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 0, defense: 0, magic: 10, speed: 5 }, isDead: false },
                { id: 'p10', name: 'Unicorn', type: 'pet', emoji: '🦄', rarity: 'epic', level: 1, xp: 0, maxXp: 100, bonus: '+10% Magic', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 5, magic: 15, speed: 2 }, isDead: false },
                { id: 'p11', name: 'Griffin', type: 'pet', emoji: '🦅', rarity: 'epic', level: 1, xp: 0, maxXp: 100, bonus: '+10% Speed', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 10, defense: 5, magic: 0, speed: 10 }, isDead: false },
                { id: 'p12', name: 'Kraken', type: 'pet', emoji: '🦑', rarity: 'legendary', level: 1, xp: 0, maxXp: 100, bonus: '+15% Attack', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 20, defense: 5, magic: 0, speed: -2 }, isDead: false }
            ];

            const basePet = PETS[Math.floor(Math.random() * PETS.length)];
            let finalName = basePet.name;
            let bonus = basePet.bonus;
            let emoji = basePet.emoji;
            let isShiny = false;

            if (Math.random() < 0.1) {
                finalName = `✨ Shiny ${basePet.name}`;
                bonus = bonus.replace(/(\d+)%/, (_, num) => `${parseInt(num) * 2}%`);
                emoji = `✨${emoji}`;
                isShiny = true;
            }

            const existingId = existingPetMap.get(finalName);
            const batchIndex = batchPetMap.get(finalName);

            if (existingId) {
                petXpBoosts[existingId] = (petXpBoosts[existingId] || 0) + 150;
            } else if (batchIndex !== undefined) {
                pendingPets[batchIndex].xp += 150;
            } else {
                const newPet: Pet = {
                    ...basePet,
                    name: finalName,
                    bonus,
                    emoji,
                    id: `pet-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
                    xp: 0
                };
                pendingPets.push(newPet);
                batchPetMap.set(finalName, pendingPets.length - 1);
                logs.push(isShiny ? `SHINY PET: ${finalName}` : `Pet: ${finalName}`);
            }
        }
        else if (roll < 0.60) {
            if (currentMinerCount > 0 || addedMinerInBatch) {
                minerBoosts++;
            } else {
                const newMiner: Hero = {
                    id: `miner-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
                    name: 'Dwarven Miner',
                    class: 'Miner',
                    emoji: '⛏️',
                    unlocked: true,
                    level: 1,
                    xp: 0,
                    maxXp: 100,
                    statPoints: 0,
                    skills: [],
                    stats: { hp: 80, maxHp: 80, mp: 30, maxMp: 30, attack: 10, magic: 5, defense: 5, speed: 10 },
                    equipment: {},
                    element: 'neutral',
                    assignment: 'mine',
                    gambits: [],
                    corruption: false,
                    type: 'hero',
                    isDead: false
                };
                pendingHeroes.push(newMiner);
                addedMinerInBatch = true;
                logs.push("Recruited Dwarven Miner!");
            }
        }
    }

    return {
        cost: totalCost,
        newHeroes: pendingHeroes,
        unlockedHeroIds: Array.from(newlyUnlockedIds),
        newArtifacts: pendingArtifacts,
        pendingPets,
        statBoosts,
        minerBoosts,
        petXpBoosts,
        logs,
        success: true
    };
};
