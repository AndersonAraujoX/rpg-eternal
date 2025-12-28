import { useState, useEffect, useRef } from 'react';
import type { Hero, Boss, LogEntry, Item, Pet, Talent, Artifact, ConstellationNode, MonsterCard, ElementType, Tower, Guild, Gambit, Quest, ArenaOpponent, Rune, Achievement, Stats, GameStats, Skill } from '../engine/types';
import { CLASS_SKILLS } from '../engine/skills';
import { INITIAL_GALAXY, calculateGalaxyIncome } from '../engine/galaxy';
import { soundManager } from '../engine/sound';
import { usePersistence } from './usePersistence';
import {
    getElementalMult,
    calculateDamageMultiplier,
    processCombatTurn,
    calculateHeroPower
} from '../engine/combat';
import { checkSynergies } from '../engine/synergies';
import { MONSTERS } from '../engine/bestiary';
import { generateLoot, getCardStat } from '../engine/loot';
import { shouldSummonTavern, getAutoTalentToBuy, shouldAutoRevive, getAutoTowerClimb, getAutoQuestClaim } from '../engine/automation';

import {
    INITIAL_HEROES,
    INITIAL_BOSS,
    INITIAL_PET_DATA,
    AVAILABLE_PETS,
    INITIAL_TALENTS,
    INITIAL_ACHIEVEMENTS,
    INITIAL_STATS,
    INITIAL_CONSTELLATIONS,
    RARE_ARTIFACTS,
    GUILDS
} from '../engine/initialData';

export const useGame = () => {
    // STATE
    const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
    const [boss, setBoss] = useState<Boss>(INITIAL_BOSS);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [gameSpeed, setGameSpeed] = useState<number>(1);
    const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
    const [items, setItems] = useState<Item[]>([]);
    const [souls, setSouls] = useState<number>(0);
    const [gold, setGold] = useState<number>(0);
    const [divinity, setDivinity] = useState<number>(0);
    const [voidMatter, setVoidMatter] = useState<number>(0);

    const [pet, setPet] = useState<Pet | null>(null);
    const [offlineGains, setOfflineGains] = useState<string | null>(null);
    const [talents, setTalents] = useState<Talent[]>(INITIAL_TALENTS);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);

    const [cards, setCards] = useState<MonsterCard[]>([]);
    const [monsterKills, setMonsterKills] = useState<Record<string, number>>({});
    const [constellations, setConstellations] = useState<ConstellationNode[]>(INITIAL_CONSTELLATIONS);
    const [keys, setKeys] = useState<number>(0);
    const [resources, setResources] = useState({ copper: 0, iron: 0, mithril: 0 });

    const [dungeonActive, setDungeonActive] = useState<boolean>(false);
    const [dungeonTimer, setDungeonTimer] = useState<number>(0);

    const [ultimateCharge, setUltimateCharge] = useState<number>(0);
    const [raidActive, setRaidActive] = useState(false);
    const [raidTimer, setRaidTimer] = useState(0);
    const [voidActive, setVoidActive] = useState(false);
    const [voidTimer, setVoidTimer] = useState(0);

    const [tower, setTower] = useState<Tower>({ floor: 1, active: false, maxFloor: 1 });
    const [guild, setGuild] = useState<Guild | null>(null);

    // PHASE 10 STATE
    const [arenaRank, setArenaRank] = useState<number>(1000);
    const [glory, setGlory] = useState<number>(0);
    const [partyDps, setPartyDps] = useState(0);
    const [partyPower, setPartyPower] = useState(0);
    const [arenaOpponents, setArenaOpponents] = useState<ArenaOpponent[]>([]);

    // Generate opponents if empty
    useEffect(() => {
        if (arenaOpponents.length === 0) {
            const newOpponents: ArenaOpponent[] = Array(3).fill(null).map((_, i) => ({
                id: `opp - ${Date.now()} -${i} `,
                name: `Bot Player ${Math.floor(Math.random() * 1000)} `,
                power: Math.floor(partyDps * (0.8 + (i * 0.2))), // 0.8x, 1.0x, 1.2x difficulty
                rank: arenaRank + ((i - 1) * 25), // +/- rank
                avatar: ['🤖', '👽', '👺', '🤡', '🤠'][Math.floor(Math.random() * 5)]
            }));
            setArenaOpponents(newOpponents);
        }
    }, [arenaOpponents.length, arenaRank, partyDps]);

    const [gameStats, setGameStats] = useState<GameStats>(INITIAL_STATS);
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

    const [quests, setQuests] = useState<Quest[]>([
        { id: 'q1', description: 'Slay 50 Monsters', target: 50, progress: 0, reward: { type: 'gold', amount: 500 }, isCompleted: false, isClaimed: false },
        { id: 'q2', description: 'Collect 100 Souls', target: 100, progress: 0, reward: { type: 'souls', amount: 50 }, isCompleted: false, isClaimed: false },
        { id: 'q3', description: 'Enter the Tower', target: 1, progress: 0, reward: { type: 'voidMatter', amount: 1 }, isCompleted: false, isClaimed: false }
    ]);
    const [autoSellRarity, setAutoSellRarity] = useState<'none' | 'common' | 'rare'>('none');
    // partyDps moved up
    const damageAccumulator = useRef(0);
    const lastDpsUpdate = useRef(Date.now());
    const [combatEvents, setCombatEvents] = useState<{ id: string, damage: number, isCrit: boolean, x: number, y: number }[]>([]);

    // Derived State: Active Synergies
    const activeHeroesList = heroes.filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked);
    const activeSynergies = checkSynergies(activeHeroesList);

    // PHASE 11
    const [runes, setRunes] = useState<Rune[]>([]);

    const [eternalFragments, setEternalFragments] = useState(0);
    const [starlight, setStarlight] = useState(0);
    const [starlightUpgrades, setStarlightUpgrades] = useState<string[]>([]);
    const [theme, setTheme] = useState('default');
    const [galaxy, setGalaxy] = useState(INITIAL_GALAXY);

    // GALAXY LOGIC
    const conquerSector = (sectorId: string) => {
        const sector = galaxy.find(s => s.id === sectorId);
        if (!sector || sector.isOwned) return;

        // Difficulty Check: Party Power (Sum of Attack) vs Difficulty
        const partyPower = heroes.filter(h => h.assignment === 'combat' && !h.isDead).reduce((acc, h) => acc + h.stats.attack, 0);

        // Random variance: Party Power * (0.8 to 1.2)
        const roll = partyPower * (0.8 + Math.random() * 0.4);

        if (roll >= sector.difficulty) {
            setGalaxy(prev => prev.map(s => s.id === sectorId ? { ...s, isOwned: true } : s));
            addLog(`Conquered ${sector.name} !`, 'achievement');
            soundManager.playLevelUp(); // Re-use fanfare
        } else {
            addLog(`Failed to conquer ${sector.name}. Need more power!(Rolled: ${Math.floor(roll)} vs ${sector.difficulty})`, 'combat');
        }
    };

    // LOAD
    // PERSISTENCE

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-49), { id: Math.random().toString(36), message, type }]);
    };
    const toggleSound = () => { setIsSoundOn(!isSoundOn); soundManager.toggle(!isSoundOn); };

    // DPS Calculation Loop
    useEffect(() => {
        const dpsInterval = setInterval(() => {
            const now = Date.now();
            const timeDiff = (now - lastDpsUpdate.current) / 1000;
            if (timeDiff >= 1) {
                setPartyDps(Math.round(damageAccumulator.current / timeDiff));
                damageAccumulator.current = 0;
                lastDpsUpdate.current = now;
            }
        }, 1000);
        return () => clearInterval(dpsInterval);
    }, []);

    const ACTIONS = {
        buyStarlightUpgrade: (id: string, cost: number) => {
            if (starlight >= cost && !starlightUpgrades.includes(id)) {
                setStarlight(s => s - cost);
                setStarlightUpgrades(prev => [...prev, id]);
                addLog(`Unlocked Constellation: ${id} `, 'achievement');
                soundManager.playLevelUp();
            }
        },

        spendStatPoint: (heroId: string, stat: keyof Stats) => {
            setHeroes(prev => prev.map(h => {
                if (h.id === heroId && h.statPoints > 0) {
                    let hpGain = 10, mpGain = 5, otherGain = 1;
                    let newStats = { ...h.stats };

                    if (stat === 'hp') { newStats.hp += hpGain; newStats.maxHp += hpGain; }
                    else if (stat === 'mp') { newStats.mp += mpGain; newStats.maxMp += mpGain; }
                    else { (newStats as any)[stat] = (newStats as any)[stat] + otherGain; }

                    soundManager.playLevelUp();
                    return { ...h, statPoints: h.statPoints - 1, stats: newStats };
                }
                return h;
            }));
        },

        buyTalent: (id: string, amount: number = 1) => {
            const t = talents.find(t => t.id === id);
            if (!t) return;

            let level = t.level;
            let cost = t.cost;
            let totalCost = 0;
            let count = 0;

            for (let i = 0; i < amount; i++) {
                if (level >= t.maxLevel) break;
                if ((souls - totalCost) < cost) break;

                totalCost += cost;
                level++;
                cost = Math.floor(cost * t.costScaling);
                count++;
            }

            if (count > 0) {
                setSouls(s => s - totalCost);
                setTalents(prev => prev.map(pt => pt.id === id ? { ...pt, level, cost } : pt));
            }
        },
        buyConstellation: (id: string) => {
            setConstellations(prev => prev.map(c => {
                if (c.id === id && divinity >= c.cost && c.level < c.maxLevel) {
                    setDivinity(d => d - c.cost);
                    return { ...c, level: c.level + 1, cost: Math.floor(c.cost * c.costScaling) };
                }
                return c;
            }));
        },

        // TOWER
        enterTower: () => {
            if (tower.active) {
                setTower(t => ({ ...t, active: false }));
                setBoss(INITIAL_BOSS);
                addLog("Escaped the Tower.", 'info');
                return;
            }
            setTower(t => ({ ...t, active: true }));
            setBoss({
                id: `tower - ${tower.floor} `, name: `Tower Guardian ${tower.floor} `, emoji: '🏯', type: 'boss',
                level: tower.floor * 10, isDead: false, element: 'neutral',
                stats: {
                    hp: 500 * Math.pow(1.5, tower.floor), maxHp: 500 * Math.pow(1.5, tower.floor),
                    attack: 20 * tower.floor, defense: 5 * tower.floor,
                    magic: 10 * tower.floor, speed: 10 + tower.floor, mp: 9999, maxMp: 9999
                }
            });
            addLog(`Entering Tower Floor ${tower.floor}...`, 'death');
        },
        prestigeTower: () => {
            if (tower.floor < 20) { addLog("Reach Floor 20 to Ascend.", 'info'); return; }
            const reward = Math.floor(tower.maxFloor / 10);
            setStarlight(s => s + reward);
            setTower({ active: false, floor: 1, maxFloor: 1 });
            setBoss(INITIAL_BOSS);
            addLog(`TOWER ASCENDED! + ${reward} Starlight`, 'achievement');
            soundManager.playLevelUp();
        },

        // SOCIAL ACTIONS
        joinGuild: (guildName: string) => {
            if (guild) return;
            const template = GUILDS.find(g => g.name === guildName);
            if (template) {
                setGuild({ name: template.name, level: 1, xp: 0, maxXp: 1000, bonus: template.bonus, members: Math.floor(Math.random() * 50) + 10, description: template.description || 'A bot guild.' });
                addLog(`Joined ${guildName} !`, 'heal');
            }
        },
        contributeGuild: (amount: number) => {
            if (!guild) return;
            if (gold < amount) { addLog("Not enough Gold", 'info'); return; }
            setGold(g => g - amount);
            setGuild(g => {
                if (!g) return null;
                const newXp = g.xp + (amount / 10);
                if (newXp >= g.maxXp) {
                    addLog(`Guild Leveled Up to ${g.level + 1} !`, 'achievement');
                    return { ...g, level: g.level + 1, xp: newXp - g.maxXp, maxXp: g.maxXp * 1.5 };
                }
                return { ...g, xp: newXp };
            });
            addLog(`Contributed ${amount} Gold to Guild`, 'info');
        },
        fightArena: (opponent: ArenaOpponent) => {
            const winChance = partyPower > opponent.power ? 0.8 : 0.2;
            const isWin = Math.random() < winChance;

            if (isWin) {
                const rankGain = 25;
                const gloryGain = 10;
                setArenaRank(r => r + rankGain);
                setGlory(g => g + gloryGain);
                addLog(`Won Arena Match vs ${opponent.name} ! +${rankGain} Rank, +${gloryGain} Glory`, 'achievement');
                soundManager.playLevelUp();
            } else {
                const rankLoss = 15;
                setArenaRank(r => Math.max(0, r - rankLoss));
                addLog(`Lost Arena Match vs ${opponent.name}.-${rankLoss} Rank`, 'death');
            }
            // Refresh opponents
            setArenaOpponents([]);
        },

        forgeUpgrade: (material: 'copper' | 'iron' | 'mithril') => {
            const COSTS = { copper: 100, iron: 50, mithril: 10 };
            const COST = COSTS[material];
            if (resources[material] < COST) { addLog(`Not enough ${material}`, 'info'); return; }

            setResources(r => ({ ...r, [material]: r[material] - COST }));

            let statBoost = { hp: 0, attack: 0, defense: 0, magic: 0, speed: 0 };
            if (material === 'copper') statBoost = { hp: 10, attack: 1, defense: 1, magic: 0, speed: 0 };
            if (material === 'iron') statBoost = { hp: 25, attack: 2, defense: 2, magic: 1, speed: 0 };
            if (material === 'mithril') statBoost = { hp: 50, attack: 5, defense: 5, magic: 3, speed: 1 };

            setHeroes(prev => prev.map(h => ({
                ...h,
                stats: {
                    ...h.stats,
                    hp: h.stats.hp + statBoost.hp,
                    maxHp: h.stats.maxHp + statBoost.hp,
                    attack: h.stats.attack + statBoost.attack,
                    defense: h.stats.defense + statBoost.defense,
                    magic: h.stats.magic + statBoost.magic,
                    speed: h.stats.speed + statBoost.speed
                }
            })));
            addLog(`Forged ${material} Gear! All Heroes Upgraded.`, 'craft');
            soundManager.playLevelUp();
        },

        // CORE GAMEPLAY
        summonTavern: () => {
            const COST = 500;
            if (gold < COST) return;
            setGold(g => g - COST);
            const roll = Math.random();
            if (roll < 0.3) {
                const lockedHeroes = heroes.filter(h => !h.unlocked);
                if (lockedHeroes.length > 0) {
                    const toUnlock = lockedHeroes[Math.floor(Math.random() * lockedHeroes.length)];
                    setHeroes(prev => prev.map(h => h.id === toUnlock.id ? { ...h, unlocked: true } : h));
                    addLog(`NEW HERO: ${toUnlock.name} Joined!`, 'heal');
                    soundManager.playLevelUp();
                } else {
                    addLog("Duplicate Hero! Stats Up.", 'info');
                    setHeroes(prev => prev.map(h => ({ ...h, stats: { ...h.stats, hp: h.stats.hp + 10, attack: h.stats.attack + 2 } })));
                }
            } else if (roll < 0.35) {
                const newArt = RARE_ARTIFACTS[Math.floor(Math.random() * RARE_ARTIFACTS.length)];
                const alreadyHas = artifacts.some(a => a.id === newArt.id);
                if (!alreadyHas) {
                    setArtifacts(p => [...p, newArt]);
                    addLog(`TAVERN FOUND: ${newArt.name} !`, 'death');
                } else { addLog("Tavern Keeper found nothing special.", 'info'); }
            } else if (roll < 0.50) {
                // PET DROP (15%)
                if (!pet) {
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
                    const newPet = PETS[Math.floor(Math.random() * PETS.length)];
                    setPet(newPet);
                    addLog(`FOUND EGG: ${newPet.name} hatched!`, 'achievement');
                    soundManager.playLevelUp();
                } else {
                    addLog("Your pet found a snack! (XP Up)", 'heal');
                    setPet(p => p ? { ...p, xp: p.xp + 50 } : null);
                }
            } else { addLog("Refreshing drink... but nothing happened.", 'info'); }
        },
        enterDungeon: () => {
            if (keys < 1) return;
            setKeys(k => k - 1);
            setDungeonActive(true);
            setDungeonTimer(60);
            setBoss({
                id: 'gold-guard', name: 'GOLDEN GOLEM', emoji: '💰', type: 'boss', level: boss.level, isDead: false, element: 'neutral',
                stats: { hp: boss.stats.maxHp * 2, maxHp: boss.stats.maxHp * 2, attack: boss.stats.attack, defense: boss.stats.defense, magic: 0, speed: 10, mp: 0, maxMp: 0 }
            });
            addLog("ENTERED GOLD VAULT! 60s!", 'death');
        },
        toggleRaid: () => {
            if (raidActive) { setRaidActive(false); setBoss(INITIAL_BOSS); } else {
                setRaidActive(true); setRaidTimer(300);
                setBoss({
                    id: 'raid-boss', name: 'WORLD EATER', emoji: '🪐', type: 'boss', level: 999, isDead: false, element: 'neutral',
                    stats: { hp: 50000 * (divinity + 1), maxHp: 50000 * (divinity + 1), attack: 500, defense: 50, magic: 50, speed: 10, mp: 0, maxMp: 0 }
                });
                addLog("WARNING: WORLD EATER APPROACHES!", 'death');
            }
        },
        triggerRebirth: () => {
            // Achievement Bonuses
            const achDamageMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'damage').reduce((acc, a) => acc + a.rewardValue, 0);
            const achGoldMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'gold').reduce((acc, a) => acc + a.rewardValue, 0);
            const achSpeedMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'speed').reduce((acc, a) => acc + a.rewardValue, 0);
            const achBossMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'bossDamage').reduce((acc, a) => acc + a.rewardValue, 0);

            // -- MEMOIZED CALCULATIONS --
            const clickDmg = Math.floor(10 * (1 + boss.level * 0.5) * (1 + achDamageMult));
            const soulsGain = Math.floor(boss.level / 5);
            if (soulsGain <= 0) return;
            setSouls(p => p + soulsGain);
            setHeroes(INITIAL_HEROES.map(h => ({ ...h, unlocked: heroes.find(curr => curr.id === h.id)?.unlocked || false }))); // Keep unlocks
            setBoss(INITIAL_BOSS);
            setItems([]);
            setGameSpeed(1);
            setGold(0);
            setDungeonActive(false);
            setRaidActive(false);
            addLog(`REBIRTH! + ${soulsGain} Souls.`, 'death');
            soundManager.playLevelUp();
        },
        triggerAscension: () => {
            if (souls < 1000) return;
            setDivinity(p => p + Math.floor(souls / 1000));
            setSouls(0);
            setHeroes(INITIAL_HEROES.map(h => ({ ...h, unlocked: heroes.find(curr => curr.id === h.id)?.unlocked || false })));
            setBoss(INITIAL_BOSS);
            setItems([]);
            setTalents(INITIAL_TALENTS);
            setArtifacts([]);
            setCards([]);
            setResources({ copper: 0, iron: 0, mithril: 0 });
            setDungeonActive(false);
            setRaidActive(false);
            setVoidMatter(0);
            addLog("ASCENDED! GAINED DIVINITY!", 'death');
        },
        toggleCorruption: (heroId: string) => {
            setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, corruption: !h.corruption } : h));
        },
        renameHero: (heroId: string, newName: string) => {
            setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, name: newName.substring(0, 12) } : h));
        },
        enterVoid: () => {
            if (tower.floor < 10) { addLog("Reach Tower Floor 10 to unlock Void.", 'info'); return; }
            setVoidActive(true);
            setVoidTimer(30);
            setBoss({
                id: 'void-boss', name: 'VOID GUARDIAN', emoji: '🌌', type: 'boss',
                level: 9999, isDead: false, element: 'neutral',
                stats: { hp: 1000000, maxHp: 1000000, attack: 1000, defense: 200, magic: 200, speed: 20, mp: 9999, maxMp: 9999 }
            });
            addLog("ENTERING THE VOID. 30 SECONDS!", 'death');
        },
        buyDarkGift: (cost: number, effect: string) => {
            if (voidMatter >= cost) {
                setVoidMatter(v => v - cost);
                addLog(`Dark Gift Acquired: ${effect} `, 'death');
                if (effect === 'ult_charge') setUltimateCharge(100);
            }
        },
        toggleAssignment: (heroId: string) => {
            setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, assignment: h.assignment === 'combat' ? 'mine' : 'combat' } : h));
        },
        updateGambits: (heroId: string, gambits: Gambit[]) => {
            setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, gambits } : h));
        },
        feedPet: (foodType: 'gold' | 'souls') => {
            if (!pet) return;
            const xpGain = 50;
            if (foodType === 'gold' && gold >= 100) {
                setGold(g => g - 100);
            } else if (foodType === 'souls' && souls >= 10) {
                setSouls(s => s - 10);
            } else {
                return;
            }

            setPet(p => {
                if (!p) return null;
                let newXp = p.xp + xpGain;
                let newLvl = p.level;
                let newMax = p.maxXp;
                let newStats = { ...p.stats };

                if (newXp >= p.maxXp) {
                    newXp -= p.maxXp;
                    newLvl += 1;
                    newMax = Math.floor(newMax * 1.5);
                    newStats.attack += 5;
                    addLog(`PET LEVEL UP! Lvl ${newLvl} `, 'heal');
                    soundManager.playLevelUp();
                }
                return { ...p, xp: newXp, level: newLvl, maxXp: newMax, stats: newStats };
            });
            addLog("Pet fed!", 'heal');
        },

        // QUESTS
        claimQuest: (id: string) => {
            setQuests(prev => prev.map(q => {
                if (q.id === id && q.isCompleted && !q.isClaimed) {
                    if (q.reward.type === 'gold') setGold(g => g + q.reward.amount);
                    if (q.reward.type === 'souls') setSouls(s => s + q.reward.amount);
                    if (q.reward.type === 'voidMatter') setVoidMatter(v => v + q.reward.amount);
                    addLog(`Quest Claimed: ${q.reward.amount} ${q.reward.type} !`, 'heal');
                    return { ...q, isClaimed: true };
                }
                return q;
            }));
        },

        // RUNES
        craftRune: () => {
            const COST = { mithril: 10, souls: 50 };
            if (resources.mithril >= COST.mithril && souls >= COST.souls) {
                setResources(r => ({ ...r, mithril: r.mithril - COST.mithril }));
                setSouls(s => s - COST.souls);

                const rarityRoll = Math.random();
                let rarity: Rune['rarity'] = 'common';
                if (rarityRoll > 0.98) rarity = 'legendary';
                else if (rarityRoll > 0.90) rarity = 'epic';
                else if (rarityRoll > 0.70) rarity = 'rare';

                const stats: Rune['stat'][] = ['attack', 'defense', 'hp', 'magic', 'gold', 'xp'];
                const stat = stats[Math.floor(Math.random() * stats.length)];
                let val = 1;
                if (rarity === 'common') val = Math.floor(Math.random() * 5 + 1);
                if (rarity === 'rare') val = Math.floor(Math.random() * 10 + 5);
                if (rarity === 'epic') val = Math.floor(Math.random() * 15 + 10);
                if (rarity === 'legendary') val = Math.floor(Math.random() * 25 + 20);

                const newRune: Rune = {
                    id: Math.random().toString(),
                    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Rune of ${stat.charAt(0).toUpperCase() + stat.slice(1)} `,
                    rarity,
                    stat,
                    value: val,
                    bonus: `+ ${val}% ${stat.toUpperCase()} `
                };

                setRunes(prev => [...prev, newRune]);
                addLog(`Crafted: ${newRune.name} `, 'craft');
                soundManager.playLevelUp();
            }
        },
        socketRune: (itemId: string, runeId: string) => {
            const rune = runes.find(r => r.id === runeId);
            if (!rune) return;
            setItems(prev => prev.map(i => {
                if (i.id === itemId && i.sockets && i.sockets > (i.runes?.length || 0)) {
                    setRunes(r => r.filter(ru => ru.id !== runeId)); // Consume rune
                    addLog(`Socketed ${rune.name} into ${i.name} `, 'craft');
                    soundManager.playLevelUp();
                    return { ...i, runes: [...(i.runes || []), rune] };
                }
                return i;
            }));
        },
        reforgeItem: (itemId: string) => {
            if (voidMatter < 5) { addLog("Not enough Void Matter to reforge (5 needed).", 'info'); return; }
            setItems(prev => prev.map(i => {
                if (i.id === itemId) {
                    const stats: ('attack' | 'defense' | 'hp' | 'magic' | 'speed')[] = ['attack', 'defense', 'hp', 'magic', 'speed'];
                    const newStat = stats[Math.floor(Math.random() * stats.length)];
                    const variance = 0.8 + Math.random() * 0.4;
                    return { ...i, stat: newStat, value: Math.floor(i.value * variance) };
                }
                return i;
            }));
            setVoidMatter(v => v - 5);
            addLog("Item Reforged with Void energy.", 'craft');
        },

        closeOfflineModal: () => setOfflineGains(null),
        setAutoSellRarity: setAutoSellRarity,
        setGameSpeed: setGameSpeed,
        toggleSound: toggleSound,
        resetSave: () => { localStorage.clear(); window.location.reload(); },
        exportSave: () => btoa(localStorage.getItem('rpg_eternal_save_v6') || ''),
        importSave: (str: string) => { try { JSON.parse(atob(str)); localStorage.setItem('rpg_eternal_save_v6', atob(str)); window.location.reload(); } catch { alert("Invalid Save"); } }
    };



    // CORE LOOP
    useEffect(() => {
        // Combat Loop (Only assigned combatants)
        const activeHeroes = heroes.filter(h => h.unlocked && h.assignment === 'combat');
        if (activeHeroes.every(h => h.isDead)) return;

        // Timers
        if (raidActive) {
            if (raidTimer <= 0) { setRaidActive(false); setBoss(INITIAL_BOSS); addLog("Raid Failed!", 'damage'); }
            else { setRaidTimer(t => t - (1 * gameSpeed / 10)); }
        }

        // AUTOMATION LOGIC
        if (starlightUpgrades.includes('auto_rebirth')) {
            // Rebirth if boss level > 100 AND slow kill (simulated by time or just level cap)
            if (boss.level >= 105) { ACTIONS.triggerRebirth(); }
        }

        if (shouldSummonTavern(gold, starlightUpgrades)) { ACTIONS.summonTavern(); }

        // ULTRA AUTOMATION (Phase 16)
        const autoTalentId = getAutoTalentToBuy(starlightUpgrades, souls, talents);
        if (autoTalentId) { ACTIONS.buyTalent(autoTalentId); }

        if (shouldAutoRevive(starlightUpgrades, heroes)) {
            setHeroes(prev => prev.map(h => h.isDead ? { ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } } : h));
        }

        const newTowerState = getAutoTowerClimb(starlightUpgrades, tower);
        if (newTowerState) setTower(newTowerState);

        // Auto-Quest
        const questToClaim = getAutoQuestClaim(starlightUpgrades, quests);
        if (questToClaim) { ACTIONS.claimQuest(questToClaim); }
        if (tower.active) {
            // Check for failure (Party Wipe)
            if (activeHeroes.length > 0 && activeHeroes.every(h => h.isDead)) {
                setTower(t => ({ ...t, active: false }));
                setBoss(INITIAL_BOSS);
                addLog(`DEFEAT! Tower Floor ${tower.floor} failed.`, 'death');
            }
        }

        // SYNERGY CHECKS
        // SYNERGY CHECKS (Recalculated for loop safety/closure)
        const synergies = activeSynergies; // Use the derived state (it will be closed over current render, which is fine)
        // Actually, inside setTimeout closure, activeSynergies might be stale?
        // Yes, setTimeout closes over variables from the render it was scheduled in.
        // But `heroes` is in dep array, so effect runs on hero change.
        // calculating it here ensures strictly correct data based on `activeHeroes` which is derived from `heroes` in scope.
        // So:
        // const synergies = checkSynergies(activeHeroes); // already done in prev step logic

        // I need to Fix the return statement to return `activeSynergies`
        // Apply Synergy Buffs
        const synergyDefense = synergies.find(s => s.type === 'defense') ? 0.2 : 0;
        const synergyVampirism = synergies.find(s => s.type === 'vampirism') ? 0.15 : 0;
        const synergyAttackSpeed = synergies.find(s => s.type === 'attackSpeed') ? 0.2 : 0;
        const synergyResources = synergies.find(s => s.type === 'resources') ? 0.1 : 0;

        const hasteTalent = talents.find(t => t.stat === 'speed');
        const speedBonus = (hasteTalent ? (1 - (hasteTalent.level * hasteTalent.valuePerLevel)) : 1) * (1 - synergyAttackSpeed);
        const baseTick = 1000 / gameSpeed;
        const effectiveTick = Math.max(40, baseTick * speedBonus); // Allow up to 25x speed (40ms)

        const timer = setTimeout(() => {
            // Card Buffs
            const goldMult = 1 + cards.filter(c => c.stat === 'gold').reduce((acc, c) => acc + (c.count * c.value), 0) + synergyResources;
            const xpMult = 1 + cards.filter(c => c.stat === 'xp').reduce((acc, c) => acc + (c.count * c.value), 0) + synergyResources;
            const defenseMult = 1 + cards.filter(c => c.stat === 'defense').reduce((acc, c) => acc + (c.count * c.value), 0) + synergyDefense;
            const speedMult = 1 + cards.filter(c => c.stat === 'speed').reduce((acc, c) => acc + (c.count * c.value), 0);

            // Time Tick
            const now = Date.now();
            // Mining Logic (Assigned miners)
            const miners = heroes.filter(h => h.unlocked && h.assignment === 'mine');
            if (miners.length > 0) {
                if (Math.random() < 0.2) { // 20% chance per tick per miner? No, just per tick
                    const minerPower = miners.reduce((acc, h) => acc + h.stats.attack, 0);
                    const roll = Math.random() * minerPower;
                    if (roll > 1000) setResources(r => ({ ...r, mithril: r.mithril + 1 }));
                    else if (roll > 200) setResources(r => ({ ...r, iron: r.iron + 1 }));
                    else setResources(r => ({ ...r, copper: r.copper + 1 }));
                }
            }



            // Galaxy Income
            const gIncome = calculateGalaxyIncome(galaxy);
            if (gIncome.gold > 0) setGold(g => g + gIncome.gold);
            if (gIncome.souls > 0) setSouls(s => s + gIncome.souls);
            if (gIncome.starlight > 0) setStarlight(s => s + gIncome.starlight);
            if (gIncome.mithril > 0) setResources(r => ({ ...r, mithril: r.mithril + gIncome.mithril }));

            // TIMERS
            const deltaSeconds = effectiveTick / 1000;

            // Dungeon Timer
            if (dungeonActive) {
                setDungeonTimer(t => {
                    if (t <= 0) { setDungeonActive(false); return 0; }
                    const next = t - deltaSeconds;
                    if (next <= 0) { setDungeonActive(false); return 0; }
                    return next;
                });
            }

            // Void Timer
            if (voidActive) {
                setVoidTimer(t => {
                    if (t <= 0) { setVoidActive(false); return 0; }
                    const next = t - deltaSeconds;
                    if (next <= 0) { setVoidActive(false); return 0; }
                    return next;
                });
            }

            // Raid Timer
            if (raidActive) {
                setRaidTimer(t => {
                    if (t <= 0) { setRaidActive(false); return 0; }
                    const next = t - deltaSeconds;
                    if (next <= 0) { setRaidActive(false); return 0; }
                    return next;
                });
            }

            const damageMult = calculateDamageMultiplier(souls, divinity, talents, constellations, artifacts, boss, cards, achievements);
            const critTalent = talents.find(t => t.stat === 'crit');
            const critChance = critTalent ? (critTalent.level * critTalent.valuePerLevel) : 0;

            // Ultimate
            let isUltimate = false;
            if (ultimateCharge >= 100) {
                isUltimate = true;
                setUltimateCharge(0);
                addLog("ULTIMATE BLAST!", 'damage');
                soundManager.playLevelUp();
            } else { setUltimateCharge(p => Math.min(100, p + (5 * activeHeroes.length / 6) * gameSpeed)); } // Charge slower if fewer heroes

            const { updatedHeroes, totalDmg, crits } = processCombatTurn(heroes, boss, damageMult, critChance, isUltimate, pet, effectiveTick, defenseMult, synergyVampirism);
            damageAccumulator.current += totalDmg; // Track DPS

            if (totalDmg > 0) {
                // Add combat event for particles
                const newEvent = {
                    id: Math.random().toString(36),
                    damage: totalDmg,
                    isCrit: crits > 0,
                    x: 50 + (Math.random() * 20 - 10), // Randomize slightly around center
                    y: 40 + (Math.random() * 20 - 10)
                };
                setCombatEvents(prev => [...prev.slice(-4), newEvent]); // Keep last 5 events
            }

            // Healer Logic (Simplified check for 'heal' action or just passive)
            // Ideally this should be inside processCombatTurn or a separate pass, leaving as is but using updatedHeroes
            if (activeHeroes.some(h => h.class === 'Healer')) {
                const lowest = updatedHeroes.filter(h => !h.isDead && h.assignment === 'combat').sort((a, b) => a.stats.hp - b.stats.hp)[0];
                if (lowest) {
                    lowest.stats.hp = Math.min(lowest.stats.maxHp, lowest.stats.hp + (lowest.stats.maxHp * 0.05));
                }
            }

            let finalHeroes = updatedHeroes;

            let newBossHp = Math.max(0, boss.stats.hp - totalDmg);
            if (totalDmg > 0 && Math.random() > 0.8) soundManager.playHit();

            if (newBossHp === 0) {
                // XP GAIN
                // XP GAIN
                const xpGain = Math.max(10, Math.floor(boss.level * 10 * xpMult));
                finalHeroes = finalHeroes.map(h => {
                    if (!h.isDead && h.assignment === 'combat' && h.unlocked) {
                        let newXp = (h.xp || 0) + xpGain;
                        // Level Up
                        while (newXp >= (h.maxXp || 100)) {
                            newXp -= (h.maxXp || 100);
                            h.level = (h.level || 1) + 1;
                            h.maxXp = Math.floor((h.maxXp || 100) * 1.5);

                            // Auto Stats Growth
                            let growth = { hp: 10, mp: 5, attack: 1, defense: 1, magic: 1, speed: 0 };
                            switch (h.class) {
                                case 'Warrior': growth = { hp: 20, mp: 2, attack: 2, defense: 2, magic: 0, speed: 1 }; break;
                                case 'Mage': growth = { hp: 8, mp: 15, attack: 1, defense: 1, magic: 3, speed: 1 }; break;
                                case 'Healer': growth = { hp: 12, mp: 10, attack: 1, defense: 1, magic: 2, speed: 1 }; break;
                                case 'Rogue': growth = { hp: 15, mp: 5, attack: 3, defense: 1, magic: 0, speed: 2 }; break;
                                case 'Paladin': growth = { hp: 25, mp: 5, attack: 1, defense: 3, magic: 1, speed: 0 }; break;
                                case 'Warlock': growth = { hp: 10, mp: 20, attack: 1, defense: 1, magic: 3, speed: 1 }; break;
                                case 'Dragoon': growth = { hp: 18, mp: 5, attack: 2, defense: 2, magic: 1, speed: 2 }; break;
                                case 'Sage': growth = { hp: 10, mp: 20, attack: 0, defense: 1, magic: 3, speed: 1 }; break;
                                case 'Necromancer': growth = { hp: 15, mp: 15, attack: 1, defense: 1, magic: 2, speed: 1 }; break;
                            }

                            h.stats.maxHp += growth.hp;
                            h.stats.hp += growth.hp;
                            h.stats.maxMp += growth.mp;
                            h.stats.mp += growth.mp;
                            h.stats.attack += growth.attack;
                            h.stats.defense += growth.defense;
                            h.stats.magic += growth.magic;
                            h.stats.speed += growth.speed;

                            // Auto Skill Unlock
                            const classSkills = CLASS_SKILLS[h.class] || [];
                            classSkills.forEach(skillDef => {
                                if (h.level >= skillDef.unlockLevel) {
                                    if (!h.skills) h.skills = [];
                                    const known = h.skills.find(s => s.id === skillDef.id);
                                    if (!known) {
                                        let newSkill = { ...skillDef };
                                        h.skills.push(newSkill);
                                        addLog(`${h.name} learned ${newSkill.name} !`, 'achievement');

                                        // Apply Passive Stats
                                        if (newSkill.type === 'passive' && newSkill.statBonus) {
                                            if (newSkill.statBonus.hp) { h.stats.maxHp += newSkill.statBonus.hp; h.stats.hp += newSkill.statBonus.hp; }
                                            if (newSkill.statBonus.mp) { h.stats.maxMp += newSkill.statBonus.mp; h.stats.mp += newSkill.statBonus.mp; }
                                            if (newSkill.statBonus.attack) h.stats.attack += newSkill.statBonus.attack;
                                            if (newSkill.statBonus.defense) h.stats.defense += newSkill.statBonus.defense;
                                            if (newSkill.statBonus.magic) h.stats.magic += newSkill.statBonus.magic;
                                            if (newSkill.statBonus.speed) h.stats.speed += newSkill.statBonus.speed;
                                        }
                                    }
                                }
                            });

                            addLog(`${h.name} reached Lvl ${h.level} !(Auto - Upgraded)`, 'achievement');
                            soundManager.playLevelUp();
                        }
                        return { ...h, xp: newXp };
                    }
                    return h;
                });

                // Drops
                const loot = generateLoot(boss.level);


                // AUTO EQUIP & AUTO SELL
                if (starlightUpgrades.includes('auto_equip')) {
                    const isTrash = (autoSellRarity === 'common' && loot.rarity === 'common') ||
                        (autoSellRarity === 'rare' && (loot.rarity === 'common' || loot.rarity === 'rare'));

                    if (isTrash || boss.level < 10) {
                        setGold(g => g + Math.floor(loot.value / 2));
                        addLog(`Auto - Scrapped ${loot.name} (${loot.rarity}) for ${Math.floor(loot.value / 2)} Gold`, 'info');
                    } else {
                        setItems(p => [...p, loot]);
                        addLog(`Auto - Looted: ${loot.name} `, 'info');
                    }
                } else {
                    setItems(p => [...p, loot]);
                }


                // Quest Progress (Kill Monster)
                setQuests(prev => prev.map(q => {
                    if (!q.isCompleted && q.description.includes('Slay')) return { ...q, progress: Math.min(q.target, q.progress + 1), isCompleted: q.progress + 1 >= q.target };
                    if (!q.isCompleted && q.description.includes('Souls') && souls > q.target) return { ...q, progress: q.target, isCompleted: true }; // Retroactive check
                    return q;
                }));
                setPet(p => {
                    if (!p) return null;
                    const xp = p.xp + 1; // 1 XP per kill
                    if (xp >= p.maxXp) {
                        soundManager.playLevelUp();
                        addLog("Pet Level Up!", 'heal');
                        return { ...p, level: p.level + 1, xp: 0, maxXp: Math.floor(p.maxXp * 1.5), stats: { ...p.stats, attack: p.stats.attack + 2 } };
                    }
                    return { ...p, xp };
                });


                if (boss.emoji !== '💀' && boss.name !== 'Raid Boss' && boss.name !== 'Void Entity') {
                    // Drop Card Logic
                    if (Math.random() < 0.05) { // 5% Chance
                        // ... existing card logic ...
                        const card = MONSTERS.find(m => m.name === boss.name);
                        if (card) {
                            setCards(prev => {
                                const existing = prev.find(c => c.monsterName === boss.name);
                                if (existing) return prev.map(c => c.monsterName === boss.name ? { ...c, count: c.count + 1 } : c);
                                // Determine stat
                                const stats: MonsterCard['stat'][] = ['attack', 'defense', 'gold', 'xp', 'speed'];
                                const stat = stats[Math.floor(Math.random() * stats.length)];
                                return [...prev, { id: card.emoji, monsterName: card.name, count: 1, stat, value: 0.01 }];
                            });
                            addLog(`Found ${boss.name} Card!`, 'achievement');
                        }
                    }

                    // Track Kills (Bestiary & Stats)
                    setMonsterKills(prev => ({ ...prev, [boss.name]: (prev[boss.name] || 0) + 1 }));
                    setGameStats(prev => ({
                        ...prev,
                        totalKills: prev.totalKills + 1,
                        bossKills: boss.name.includes('Boss') ? prev.bossKills + 1 : prev.bossKills
                    }));

                    // Quest Logic: Track Kills
                    setQuests(prev => prev.map(q => {
                        if (!q.isCompleted && q.description.includes('Kill') && !q.description.includes('Boss')) {
                            return { ...q, progress: Math.min(q.target, q.progress + 1), isCompleted: q.progress + 1 >= q.target };
                        }
                        return q;
                    }));
                }

                if (raidActive) {
                    addLog("WORLD EATER DEFEATED!", 'death');
                    setGold(g => g + 50000);
                    setDivinity(d => d + 1);
                    setRaidActive(false);
                    setBoss(INITIAL_BOSS);
                } else if (voidActive) {
                    addLog("VOID ENTITY VANQUISHED!", 'death');
                    setVoidMatter(v => v + 1);
                    setVoidActive(false);
                    setBoss(INITIAL_BOSS);
                } else if (dungeonActive) {
                    setBoss({ ...boss, stats: { ...boss.stats, hp: boss.stats.maxHp, maxHp: boss.stats.maxHp + 50 } });
                } else {
                    const monster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
                    // Biome Element Logic
                    const lvl = boss.level; // next level actually
                    let el: ElementType = 'neutral';
                    if (lvl > 40) el = 'fire';
                    else if (lvl > 20) el = 'water';
                    else if (lvl % 3 === 1) el = 'nature';

                    setBoss(prev => ({
                        ...prev, level: prev.level + 1, name: monster.name, emoji: monster.emoji, element: el,
                        stats: { ...prev.stats, maxHp: Math.floor(prev.stats.maxHp * 1.2), hp: Math.floor(prev.stats.maxHp * 1.2) }
                    }));
                }

                finalHeroes = finalHeroes.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } }));
                soundManager.playLevelUp();

                if (tower.active) {
                    addLog(`Floor ${tower.floor} Cleared!`, 'death');
                    setTower(t => ({ ...t, floor: t.floor + 1, maxFloor: Math.max(t.maxFloor, t.floor + 1) }));
                    // Next floor immediately
                    setTimeout(() => ACTIONS.enterTower(), 1000);
                }

            } else {
                setBoss(p => ({ ...p, stats: { ...p.stats, hp: newBossHp } }));
                // Calculate Party Power
                let currentPower = 0;
                finalHeroes.forEach(h => {
                    if (h.assignment === 'combat' && !h.isDead) {
                        currentPower += calculateHeroPower(h);
                    }
                });
                setPartyPower(currentPower);

                // Update Playtime
                setGameStats(prev => ({ ...prev, playTime: prev.playTime + (effectiveTick / 1000) }));

                // Check Achievements
                setAchievements(prev => prev.map(ach => {
                    if (ach.isUnlocked) return ach;
                    let unlocked = false;
                    if (ach.condition.type === 'kills' && gameStats.totalKills >= ach.condition.value) unlocked = true;
                    if (ach.condition.type === 'bossKills' && gameStats.bossKills >= ach.condition.value) unlocked = true;
                    if (ach.condition.type === 'gold' && gameStats.totalGoldEarned >= ach.condition.value) unlocked = true;
                    if (ach.condition.type === 'clicks' && gameStats.clicks >= ach.condition.value) unlocked = true;

                    if (unlocked) {
                        addLog(`ACHIEVEMENT UNLOCKED: ${ach.name}!`, 'achievement');
                        soundManager.playLevelUp(); // Re-use lvl up sound
                        return { ...ach, isUnlocked: true };
                    }
                    return ach;
                }));
            }

            // Calc Power
            const currentPwr = finalHeroes.filter(h => h.unlocked && h.assignment === 'combat').reduce((acc, h) => acc + calculateHeroPower(h), 0);
            setPartyPower(currentPwr);

            setHeroes(finalHeroes);
        }, effectiveTick / (1 + cards.filter(c => c.stat === 'speed').reduce((acc, c) => acc + (c.count * c.value), 0)));

        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, gold, divinity, pet, talents, artifacts, cards, constellations, keys, dungeonActive, raidActive, resources]);



    usePersistence(
        heroes, setHeroes, boss, setBoss, items, setItems, souls, setSouls, gold, setGold,
        divinity, setDivinity, pet, setPet, talents, setTalents, artifacts, setArtifacts,
        cards, setCards, constellations, setConstellations, keys, setKeys, resources, setResources,
        tower, setTower, guild, setGuild, voidMatter, setVoidMatter, setRaidActive, setDungeonActive, setOfflineGains,
        arenaRank, setArenaRank, glory, setGlory, quests, setQuests,
        runes, setRunes, achievements, setAchievements,
        eternalFragments, setEternalFragments,
        starlight, setStarlight,
        starlightUpgrades, setStarlightUpgrades,
        theme, setTheme,
        galaxy, setGalaxy,
        monsterKills, setMonsterKills,
        gameStats, setGameStats
    );


    return {
        heroes, boss, logs, items, gameSpeed, isSoundOn, souls, gold, divinity, pet, offlineGains,
        talents, artifacts, cards, constellations, keys, dungeonActive, dungeonTimer, resources,
        ultimateCharge, raidActive, raidTimer, tower, guild, voidMatter, voidActive, voidTimer,
        arenaRank, glory, quests, runes, achievements, internalFragments: eternalFragments, starlight, starlightUpgrades, autoSellRarity, arenaOpponents,
        actions: { ...ACTIONS, conquerSector }, partyDps, partyPower, combatEvents, theme, galaxy, synergies: activeSynergies,
        monsterKills, gameStats
    };
};
