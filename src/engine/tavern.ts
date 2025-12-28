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
    pets: Pet[]
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
    let pendingHeroes: Hero[] = [];
    let pendingArtifacts: Artifact[] = [];
    let pendingPets: Pet[] = [];
    let statBoosts = 0;
    let minerBoosts = 0;
    let petXpBoosts: Record<string, number> = {};
    let logs: string[] = [];

    const newlyUnlockedIds = new Set<string>();
    const currentMinerCount = heroes.filter(h => h.class === 'Miner').length;
    let addedMinerInBatch = false;

    const existingPetMap = new Map<string, string>();
    pets.forEach(p => existingPetMap.set(p.name, p.id));
    const batchPetMap = new Map<string, number>();

    for (let i = 0; i < amount; i++) {
        const roll = Math.random();

        if (roll < 0.3) {
            const locked = heroes.filter(h => !h.unlocked && !newlyUnlockedIds.has(h.id) && h.class !== 'Miner');
            if (locked.length > 0) {
                const h = locked[Math.floor(Math.random() * locked.length)];
                newlyUnlockedIds.add(h.id);
                logs.push(`Recruited ${h.name}`);
            } else {
                statBoosts++;
            }
        } else if (roll < 0.35) {
            const newArt = RARE_ARTIFACTS[Math.floor(Math.random() * RARE_ARTIFACTS.length)];
            const has = artifacts.some(a => a.id === newArt.id) || pendingArtifacts.some(a => a.id === newArt.id);
            if (!has) {
                pendingArtifacts.push(newArt);
                logs.push(`Found Artifact: ${newArt.name}`);
            }
        } else if (roll < 0.50) {
            const PETS: Pet[] = [
                { id: 'p1', name: 'Baby Dragon', type: 'pet', emoji: '🐉', level: 1, xp: 0, maxXp: 100, bonus: '+10% DPS', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 10, defense: 0, magic: 0, speed: 0 }, isDead: false },
                { id: 'p2', name: 'Floating Eye', type: 'pet', emoji: '👁️', level: 1, xp: 0, maxXp: 100, bonus: '+10% Gold', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 0, magic: 0, speed: 0 }, isDead: false },
                { id: 'p3', name: 'Slime', type: 'pet', emoji: '💧', level: 1, xp: 0, maxXp: 100, bonus: '+10% HP', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 2, defense: 0, magic: 0, speed: 0 }, isDead: false },
                { id: 'p4', name: 'Phoenix', type: 'pet', emoji: '🦅🔥', level: 1, xp: 0, maxXp: 100, bonus: '+5% Revive Chance', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 8, defense: 0, magic: 5, speed: 0 }, isDead: false },
                { id: 'p5', name: 'Dire Wolf', type: 'pet', emoji: '🐺', level: 1, xp: 0, maxXp: 100, bonus: '+10% Crit Chance', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 12, defense: 0, magic: 0, speed: 2 }, isDead: false },
                { id: 'p6', name: 'Fairy', type: 'pet', emoji: '🧚', level: 1, xp: 0, maxXp: 100, bonus: '+5 HP/sec Regen', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 2, defense: 0, magic: 10, speed: 0 }, isDead: false },
                { id: 'p7', name: 'Mimic', type: 'pet', emoji: '📦', level: 1, xp: 0, maxXp: 100, bonus: '+15% Magic Find', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 5, magic: 0, speed: 0 }, isDead: false },
                { id: 'p8', name: 'Rock Golem', type: 'pet', emoji: '🗿', level: 1, xp: 0, maxXp: 100, bonus: '+20% Defense', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 20, magic: 0, speed: -1 }, isDead: false },
                { id: 'p9', name: 'Ghost', type: 'pet', emoji: '👻', level: 1, xp: 0, maxXp: 100, bonus: '+10% Evasion', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 0, defense: 0, magic: 10, speed: 5 }, isDead: false },
                { id: 'p10', name: 'Unicorn', type: 'pet', emoji: '🦄', level: 1, xp: 0, maxXp: 100, bonus: '+10% Magic', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 5, defense: 5, magic: 15, speed: 2 }, isDead: false },
                { id: 'p11', name: 'Griffin', type: 'pet', emoji: '🦅', level: 1, xp: 0, maxXp: 100, bonus: '+10% Speed', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 10, defense: 5, magic: 0, speed: 10 }, isDead: false },
                { id: 'p12', name: 'Kraken', type: 'pet', emoji: '🦑', level: 1, xp: 0, maxXp: 100, bonus: '+15% Attack', stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 20, defense: 5, magic: 0, speed: -2 }, isDead: false }
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
        } else if (roll < 0.60) {
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
                    stats: { hp: 50, maxHp: 50, attack: 20, defense: 10, magic: 0, speed: 2, mp: 0, maxMp: 0 },
                    element: 'neutral',
                    assignment: 'mine',
                    gambits: [],
                    corruption: false,
                    statPoints: 0,
                    skills: [],
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
