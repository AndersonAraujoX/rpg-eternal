import { useState, useEffect, useRef } from 'react'; // Refresh timestamp: 1
import { formatNumber } from '../utils';

import type { Hero, Boss, LogEntry, Item, Pet, Talent, Artifact, ConstellationNode, MonsterCard, ElementType, Tower, Guild, Gambit, Quest, ArenaOpponent, Rune, Achievement, Stats, GameStats, Resources, Building, DailyQuest, Spaceship, CombatEvent, Formation } from '../engine/types';
import { POTIONS, GUILDS } from '../engine/types'; // Phase 41 & 47
import { CLASS_SKILLS } from '../engine/skills';
import { INITIAL_GALAXY, calculateGalaxyIncome, calculateGalaxyBuffs } from '../engine/galaxy';
import { STARLIGHT_UPGRADES, getStarlightUpgradeCost } from '../engine/starlight';
import { soundManager } from '../engine/sound';
import { usePersistence } from './usePersistence';
import {
    // getElementalMult,
    calculateDamageMultiplier,
    processCombatTurn,
    calculateHeroPower
} from '../engine/combat';
import { SYNERGY_DEFINITIONS, checkSynergies, getSynergySuggestions } from '../engine/synergies';
import { MONSTERS } from '../engine/bestiary';
import { generateLoot } from '../engine/loot';
import { shouldSummonTavern, getAutoTalentToBuy, shouldAutoRevive, getAutoTowerClimb, getAutoQuestClaim, getAutoEquip, getAutoSell } from '../engine/automation';
import { simulateTavernSummon } from '../engine/tavern';
import { processMining } from '../engine/mining';
import { processFishing } from '../engine/fishing';
import { brewPotion } from '../engine/alchemy';
import { startExpedition, checkExpeditionCompletion, claimExpeditionRewards } from '../engine/expeditions';
import { tickGarden, INITIAL_GARDEN } from '../engine/garden'; // Phase 43
import type { MarketItem, Rift, Expedition, GardenPlot, Potion } from '../engine/types'; // Added missing types
import { getDailyMutator } from '../engine/mutators';
import type { TowerMutator } from '../engine/mutators';
import type { DungeonState } from '../engine/dungeon';
import { generateDungeon, DUNGEON_WIDTH, DUNGEON_HEIGHT } from '../engine/dungeon';

import { calculateBreedingResult } from '../engine/breeding'; // Phase 46
import { generateMarketStock } from '../engine/market';
import { checkDailyReset, generateDailyQuests, getLoginStreak, LOGIN_REWARDS } from '../engine/dailies'; // Phase 56
import type { BattleResult } from '../engine/cardBattle'; // Phase 55
import { PRESTIGE_CLASSES, PRESTIGE_MULTIPLIERS } from '../engine/classes'; // Phase 58




import { INITIAL_HEROES, INITIAL_BOSS, INITIAL_ACHIEVEMENTS, INITIAL_STATS as INITIAL_GAME_STATS, INITIAL_TALENTS, INITIAL_CONSTELLATIONS } from '../engine/initialData'; // Added GUILDS, Renamed INITIAL_STATS
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_TERRITORIES, simulateSiege } from '../engine/guildWar'; // Phase 47
import { getRandomWeather, WEATHER_DATA } from '../engine/weather'; // Phase 48
import type { Territory } from '../engine/types';
import type { WeatherType } from '../engine/weather';

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

    const [pets, setPets] = useState<Pet[]>([]);
    const [offlineGains, setOfflineGains] = useState<string | null>(null);
    const [talents, setTalents] = useState<Talent[]>(INITIAL_TALENTS);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);

    const [cards, setCards] = useState<MonsterCard[]>([]);
    const [monsterKills, setMonsterKills] = useState<Record<string, number>>({});
    const [constellations, setConstellations] = useState<ConstellationNode[]>(INITIAL_CONSTELLATIONS);
    const [keys, setKeys] = useState<number>(0);
    const [resources, setResources] = useState<Resources>({ copper: 0, iron: 0, mithril: 0, fish: 0, herbs: 0 });


    // Phase 53: Town
    const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
    // Phase 56: Dailies
    const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
    const [dailyLoginClaimed, setDailyLoginClaimed] = useState<boolean>(false);
    const [lastDailyReset, setLastDailyReset] = useState<number>(Date.now());
    // Phase 59: Spaceship
    const [spaceship, setSpaceship] = useState<Spaceship>({
        name: 'Stellar Voyager',
        level: 1,
        fuel: 100,
        maxFuel: 100,
        hull: 100,
        maxHull: 100,
        parts: { engine: 1, scanners: 1, miningLaser: 1, shields: 1 },
        upgrades: []
    });


    // PHASE 41
    const [activeExpeditions, setActiveExpeditions] = useState<Expedition[]>([]);
    const [activePotions, setActivePotions] = useState<{ id: string, name: string, effect: Potion['effect'], value: number, endTime: number }[]>([]);

    // PHASE 43
    const [gardenPlots, setGardenPlots] = useState<GardenPlot[]>(INITIAL_GARDEN);
    const [activeRift, setActiveRift] = useState<Rift | null>(null);
    const [riftTimer, setRiftTimer] = useState<number>(0);
    const [marketStock, setMarketStock] = useState<MarketItem[]>([]);
    const [marketTimer, setMarketTimer] = useState<number>(0);

    const [dungeonActive, setDungeonActive] = useState<boolean>(false);
    const [dungeonState, setDungeonState] = useState<DungeonState | null>(null);
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

    // Generate opponents if empty OR if they have invalid power (Migration fix)
    useEffect(() => {
        const hasInvalidOpponents = arenaOpponents.some(op => op.power === 0);

        if ((arenaOpponents.length === 0 || hasInvalidOpponents) && partyPower > 0) {
            const newOpponents: ArenaOpponent[] = Array(3).fill(null).map((_, i) => {
                // Dynamic Difficulty: Opponents get stronger as you climb ranks (Rank 1 is hardest)
                // Rank 1000 = 0% bonus. Rank 1 = +50% bonus power.
                const rankScaling = 1 + ((1000 - arenaRank) / 2000);
                const difficultyMult = (0.8 + (i * 0.2)) * rankScaling;

                return {
                    id: `opp-${Date.now()}-${i}`,
                    name: `Bot Player ${Math.floor(Math.random() * 1000)}`,
                    power: Math.floor(partyPower * difficultyMult),
                    rank: Math.max(1, arenaRank + ((i - 1) * 25)),
                    avatar: ['🤖', '👽', '👺', '🤡', '🤠'][Math.floor(Math.random() * 5)]
                };
            });
            setArenaOpponents(newOpponents);
        }
    }, [arenaOpponents.length, arenaRank, partyPower]);

    const [gameStats, setGameStats] = useState<GameStats>(INITIAL_GAME_STATS);
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

    // Update 74: Formations
    const [formations, setFormations] = useState<Formation[]>([]);

    const saveFormation = (name: string) => {
        const activeIds = heroes.filter(h => h.assignment === 'combat').map(h => h.id);
        if (activeIds.length === 0) return; // Don't save empty teams

        const newFormation: Formation = {
            id: Date.now().toString(),
            name,
            heroIds: activeIds
        };
        setFormations(prev => [...prev, newFormation]);
        addLog(`Formation "${name}" saved!`, 'info');
    };

    const loadFormation = (id: string) => {
        const formation = formations.find(f => f.id === id);
        if (!formation) return;

        setHeroes(prev => {
            const unequipped = prev.map(h => {
                if (h.assignment === 'combat') {
                    return { ...h, assignment: 'none' } as Hero;
                }
                return h;
            });
            return unequipped.map(h => {
                if (formation.heroIds.includes(h.id) && h.assignment === 'none') {
                    return { ...h, assignment: 'combat' } as Hero;
                }
                return h;
            });
        });
        addLog(`Formation "${formation.name}" loaded!`, 'info');
    };

    const deleteFormation = (id: string) => {
        setFormations(prev => prev.filter(f => f.id !== id));
    };

    const [quests, setQuests] = useState<Quest[]>([
        { id: 'q1', description: 'Slay 50 Monsters', target: 50, progress: 0, reward: { type: 'gold', amount: 500 }, isCompleted: false, isClaimed: false },
        { id: 'q2', description: 'Collect 100 Souls', target: 100, progress: 0, reward: { type: 'souls', amount: 50 }, isCompleted: false, isClaimed: false },
        { id: 'q3', description: 'Enter the Tower', target: 1, progress: 0, reward: { type: 'voidMatter', amount: 1 }, isCompleted: false, isClaimed: false }
    ]);
    const [autoSellRarity, setAutoSellRarity] = useState<'none' | 'common' | 'rare'>('none');
    // partyDps moved up
    const damageAccumulator = useRef(0);
    const lastDpsUpdate = useRef(Date.now());
    const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([]);

    // Derived State: Active Synergies
    const activeHeroesList = heroes.filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked);
    const activeSynergies = checkSynergies(activeHeroesList);

    // PHASE 11
    const [runes, setRunes] = useState<Rune[]>([]);

    const [eternalFragments, setEternalFragments] = useState(0);
    const [starlight, setStarlight] = useState(0);

    // Starlight Upgrades: ID -> Level
    const [starlightUpgrades, setStarlightUpgrades] = useState<Record<string, number>>({});
    const [isStarlightModalOpen, setIsStarlightModalOpen] = useState(false);

    const [theme, setTheme] = useState('default');

    // ...

    // Starlight Upgrades: ID -> Level


    // MIGRATION: Convert old array to object if needed
    useEffect(() => {
        if (Array.isArray(starlightUpgrades)) {
            const newUpgrades: Record<string, number> = {};
            (starlightUpgrades as string[]).forEach(id => newUpgrades[id] = 1);
            setStarlightUpgrades(newUpgrades);
        }
    }, []);



    const [galaxy, setGalaxy] = useState(INITIAL_GALAXY);

    // GALAXY LOGIC
    // Migration: Update old galaxy data with new rewards
    useEffect(() => {
        const needsUpdate = galaxy.length > 0 && galaxy[0].id === 'g1' && galaxy[0].reward.type === 'gold';
        if (needsUpdate) {
            console.log("Migrating Galaxy Data to new system...");
            setGalaxy(prev => prev.map(oldS => {
                const newS = INITIAL_GALAXY.find(i => i.id === oldS.id);
                return newS ? { ...newS, isOwned: oldS.isOwned } : oldS;
            }));
        }
    }, [galaxy]);

    const conquerSector = (sectorId: string) => {
        const sector = galaxy.find(s => s.id === sectorId);
        if (!sector || sector.isOwned) return;

        const partyPower = heroes.filter(h => h.assignment === 'combat' && !h.isDead).reduce((acc, h) => acc + calculateHeroPower(h), 0);

        const roll = partyPower * (0.8 + Math.random() * 0.4);

        // Galaxy Scanner Logic: Reduces difficulty by 10% per level
        const scannerLevel = starlightUpgrades['galaxy_scanner'] || 0;
        const discount = scannerLevel * 0.1; // 10% per level
        const effectiveDifficulty = Math.floor(sector.difficulty * (1 - discount));

        if (roll >= effectiveDifficulty) {
            setGalaxy(prev => prev.map(s => s.id === sectorId ? { ...s, isOwned: true } : s));

            // Add Starlight & Fragments on first conquer
            const starlightGain = Math.floor(sector.level * 0.5); // Example amount
            setStarlight(s => s + starlightGain);
            setEternalFragments(f => f + 1);

            addLog(`Conquered ${sector.name}! (+${starlightGain} Starlight, +1 Fragment)`, 'achievement');
            soundManager.playLevelUp(); // Re-use fanfare
        } else {
            addLog(`Failed to conquer ${sector.name}. Need more power! (Rolled: ${Math.floor(roll)} vs ${effectiveDifficulty})`, 'info');
        }
    };

    // LOAD
    // PERSISTENCE

    // PERSISTENCE

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = { id: (Date.now() + Math.random()).toString(), message, type, timestamp: Date.now() };
        setLogs(prev => [newLog, ...prev].slice(0, 20)); // Limit to 20 logs for max memory saving
    };

    // Removed unused combatEvents to save memory
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

    const getBuildingEffect = (id: string, baseValue: number = 0): number => {
        const b = buildings.find(b => b.id === id);
        if (!b) return baseValue;
        return Math.max(0, (b.level - 1) * b.effectValue);
    };

    const ACTIONS = {
        buyStarlightUpgrade: (id: string) => {
            const upgrade = STARLIGHT_UPGRADES.find(u => u.id === id);
            if (!upgrade) return;
            const currentLevel = starlightUpgrades[id] || 0;
            if (currentLevel >= upgrade.maxLevel) return;
            const cost = getStarlightUpgradeCost(upgrade, currentLevel);

            if (starlight >= cost) {
                setStarlight(prev => prev - cost);
                setStarlightUpgrades(prev => ({ ...prev, [id]: currentLevel + 1 }));
                addLog(`Upgraded ${upgrade.name}`, 'achievement');
                soundManager.playLevelUp();
            } else {
                addLog("Not enough Starlight", 'info');
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
        recruitHero: (heroId: string) => {
            const h = heroes.find(h => h.id === heroId);
            if (!h) return;
            if (h.unlocked) return;

            // Phase 53: Tavern Bonus
            const tavern = buildings.find(b => b.id === 'b_tavern');
            const discount = tavern ? (tavern.level - 1) * tavern.effectValue : 0;
            const finalCost = Math.floor(500 * (1 - discount)); // Base 500

            if (gold >= finalCost) {
                setGold(g => g - finalCost);
                setHeroes(prev => prev.map(hero => hero.id === heroId ? { ...hero, unlocked: true } : hero));
                addLog(`Recruited ${h.name}!`, 'info');
                setGameStats(s => ({ ...s, tavernPurchases: s.tavernPurchases + 1 }));
            } else {
                addLog(`Need ${finalCost} Gold to recruit ${h.name}`, 'info');
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
                setGuild({ id: template.id, name: template.name, level: 1, xp: 0, maxXp: 1000, bonus: template.bonus, members: Math.floor(Math.random() * 50) + 10, description: template.description || 'A bot guild.' });
                addLog(`Joined ${guildName} !`, 'heal');
            }
        },
        contributeGuild: (amount: number) => {
            if (!guild) return;
            if (gold < amount) { addLog("Not enough Gold", 'info'); return; }
            setGold(g => g - amount);
            setGuild(g => {
                if (!g) return null;
                // Guild Bonus: +20% XP per Level
                const guildBonus = getBuildingEffect('b_guild');
                const xpGain = (amount / 10) * (1 + guildBonus);

                const newXp = g.xp + xpGain;
                if (newXp >= g.maxXp) {
                    addLog(`Guild Leveled Up to ${g.level + 1} !`, 'achievement');
                    return { ...g, level: g.level + 1, xp: newXp - g.maxXp, maxXp: g.maxXp * 1.5 };
                }
                return { ...g, xp: newXp };
            });
            addLog(`Contributed ${amount} Gold to Guild`, 'info');
        },

        // Phase 53: Town
        upgradeBuilding: (id: string) => {
            setBuildings(prev => prev.map(b => {
                if (b.id === id) {
                    if (b.level >= b.maxLevel) {
                        addLog(`${b.name} is Max Level!`, 'info');
                        return b;
                    }
                    if (gold >= b.cost) {
                        setGold(g => g - b.cost);
                        addLog(`Upgraded ${b.name} to Level ${b.level + 1}!`, 'achievement');
                        soundManager.playLevelUp();
                        return { ...b, level: b.level + 1, cost: Math.floor(b.cost * b.costScaling) };
                    } else {
                        addLog(`Not enough Gold to upgrade ${b.name}`, 'info');
                    }
                }
                return b;
            }));
        },

        fightArena: (opponent: ArenaOpponent) => {
            // Power-based win chance
            // Example: 100 vs 100 = 50%
            // 200 vs 100 = 66%
            // 50 vs 430 = 50 / 480 = 10%
            const totalPower = partyPower + opponent.power;
            const winChance = totalPower > 0 ? (partyPower / totalPower) : 0.5;

            const roll = Math.random();
            const isWin = roll < winChance;

            if (isWin) {
                // Diminishing returns for farming weaklings?
                // For now, static reward.
                const rankGain = Math.floor(10 + (opponent.rank / arenaRank) * 20); // More rank for beating higher ranks
                const gloryGain = 10;
                setArenaRank(r => Math.max(1, r - rankGain)); // Rank goes DOWN (1 is best)
                setGlory(g => g + gloryGain);
                addLog(`VICTORY! Defeated ${opponent.name}. Rank improved by ${rankGain}.`, 'achievement');
                soundManager.playLevelUp();
            } else {
                const rankLoss = 5;
                setArenaRank(r => Math.min(9999, r + rankLoss)); // Rank goes UP (worse)
                addLog(`DEFEAT! Crushed by ${opponent.name}. Rank dropped by ${rankLoss}.`, 'death');
            }
            // Refresh opponents to reflect new Rank scaling
            // Clearing the list triggers the useEffect to regenerate them with updated difficulty
            setArenaOpponents([]);
            setArenaOpponents([]);
        },

        completeCardBattle: (result: BattleResult) => {
            if (result.winner === 'player' && result.reward) {
                if (result.reward.type === 'starlight') {
                    setStarlight(s => s + result.reward!.amount);
                    addLog(`Duel Victory! Won ${result.reward!.amount} Starlight.`, 'achievement');
                }
                soundManager.playLevelUp();
            } else {
                addLog('Duel Lost. Try improving your deck!', 'death');
            }
        },

        forgeUpgrade: (material: 'copper' | 'iron' | 'mithril') => {
            const COSTS = { copper: 100, iron: 50, mithril: 10 };
            let COST = COSTS[material];

            // Stellar Forge Logic: -10% cost per level
            const stellarLevel = starlightUpgrades['stellar_forge'] || 0;
            let discount = 0;
            if (stellarLevel > 0) {
                discount += Math.min(0.9, stellarLevel * 0.1);
            }

            // Town Forge Logic: -5% cost per level
            const townForgeDiscount = getBuildingEffect('b_forge');
            discount += townForgeDiscount;

            // Cap Total Discount at 90%
            discount = Math.min(0.9, discount);

            COST = Math.max(1, Math.floor(COST * (1 - discount)));

            if (resources[material] < COST) { addLog(`Not enough ${material}. Cost: ${COST}`, 'info'); return; }

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
        summonTavern: (amount: number = 1) => {
            const tavernLevel = buildings.find(b => b.id === 'b_tavern')?.level || 1;
            const result = simulateTavernSummon(amount, gold, gameStats.tavernPurchases || 0, heroes, artifacts, pets, tavernLevel);

            if (!result.success) {
                result.logs.forEach(l => addLog(l, 'info'));
                return;
            }

            // Apply Tavern Discount
            const tavernDiscount = getBuildingEffect('b_tavern');
            const finalCost = Math.floor(result.cost * (1 - tavernDiscount));

            setGold(g => g - finalCost);
            setGameStats(prev => ({ ...prev, tavernPurchases: (prev.tavernPurchases || 0) + amount }));

            // Update Heroes
            if (result.unlockedHeroIds.length > 0 || result.statBoosts > 0 || result.minerBoosts > 0 || result.newHeroes.length > 0) {
                setHeroes(prev => {
                    let updated = prev.map(h => {
                        if (result.unlockedHeroIds.includes(h.id)) return { ...h, unlocked: true };
                        if (result.statBoosts > 0 && h.unlocked && h.class !== 'Miner') {
                            return { ...h, stats: { ...h.stats, hp: h.stats.hp + (10 * result.statBoosts), attack: h.stats.attack + (2 * result.statBoosts) } };
                        }
                        if (result.minerBoosts > 0 && h.class === 'Miner') {
                            return { ...h, stats: { ...h.stats, hp: h.stats.hp + (10 * result.minerBoosts), attack: h.stats.attack + (2 * result.minerBoosts) } };
                        }
                        return h;
                    });

                    if (result.minerBoosts > 0 && result.newHeroes.length > 0) {
                        result.newHeroes.forEach(h => {
                            if (h.class === 'Miner') {
                                h.stats.hp += (10 * result.minerBoosts);
                                h.stats.attack += (2 * result.minerBoosts);
                            }
                        });
                    }
                    return [...updated, ...result.newHeroes];
                });
            }

            if (result.newArtifacts.length > 0) setArtifacts(p => [...p, ...result.newArtifacts]);

            setPets(prev => {
                let updated = [...prev];
                Object.entries(result.petXpBoosts).forEach(([id, xp]) => {
                    const p = updated.find(pet => pet.id === id);
                    if (p) {
                        p.xp += xp;
                        while (p.xp >= p.maxXp) {
                            p.xp -= p.maxXp;
                            p.level++;
                            p.maxXp = Math.floor(p.maxXp * 1.5);
                            p.stats.attack += 5;
                        }
                    }
                });
                return [...updated, ...result.pendingPets];
            });

            if (result.logs.length > 5) {
                addLog(`Bulk Summon Result: ${result.logs.length} New Items.`, 'achievement');
            } else {
                result.logs.forEach(l => addLog(l, 'achievement'));
            }

            if (result.statBoosts > 0) addLog(`General Stats Up x${result.statBoosts}`, 'info');
            if (result.minerBoosts > 0) addLog(`Miner Upgraded x${result.minerBoosts}`, 'craft');
            const petBoostCount = Object.keys(result.petXpBoosts).length;
            if (petBoostCount > 0) addLog(`${petBoostCount} Pets Upgraded (XP)!`, 'heal');

            soundManager.playLevelUp();

            soundManager.playLevelUp();
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
            // const achDamageMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'damage').reduce((acc, a) => acc + a.rewardValue, 0);
            // const achGoldMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'gold').reduce((acc, a) => acc + a.rewardValue, 0);
            // const achSpeedMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'speed').reduce((acc, a) => acc + a.rewardValue, 0);
            // const achBossMult = achievements.filter(a => a.isUnlocked && a.rewardType === 'bossDamage').reduce((acc, a) => acc + a.rewardValue, 0);

            // -- MEMOIZED CALCULATIONS --
            // Temple Bonus: +10% Souls per Level
            const templeBonus = getBuildingEffect('b_temple');
            const soulsGain = Math.floor((boss.level / 5) * (1 + templeBonus));

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
            setResources({ copper: 0, iron: 0, mithril: 0, fish: 0, herbs: 0 });
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
        assignHero: (heroId: string, assignment: Hero['assignment']) => {
            setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, assignment } : h) as Hero[]);
        },
        updateGambits: (heroId: string, gambits: Gambit[]) => {
            setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, gambits } : h));
        },
        feedPet: (foodType: 'gold' | 'souls', petId?: string) => {
            // If petId provided, feed that. If not, feed all (expensive?) or first? 
            // Let's assume petId is required or we default to the first one for backward compat actions.
            // But we changed ACTIONS to require it?

            const costGold = 100;
            const costSouls = 10;
            const xpGain = 50;

            if (foodType === 'gold') {
                if (gold < costGold) return;
                setGold(g => g - costGold);
            } else if (foodType === 'souls') {
                if (souls < costSouls) return;
                setSouls(s => s - costSouls);
            }

            setPets(prev => prev.map(p => {
                // If petId is specified, only upgrade that one.
                // If not (e.g. legacy call), maybe upgrade first? 
                // Let's safe guard: if petId is passed, use it.
                if (petId && p.id !== petId) return p;
                if (!petId && prev.indexOf(p) !== 0) return p; // Default to first

                let newXp = p.xp + xpGain;
                let newLvl = p.level;
                let newMax = p.maxXp;
                let newStats = { ...p.stats };

                if (newXp >= p.maxXp) {
                    newXp -= p.maxXp;
                    newLvl += 1;
                    newMax = Math.floor(newMax * 1.5);
                    newStats.attack += 5;
                    addLog(`PET LEVEL UP! ${p.name} -> Lvl ${newLvl} `, 'heal');
                    soundManager.playLevelUp();
                }
                return { ...p, xp: newXp, level: newLvl, maxXp: newMax, stats: newStats };
            }));
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
        manualFish: () => {
            const caught = processFishing(1);
            if (caught > 0) {
                setResources(r => ({ ...r, fish: (r.fish || 0) + caught }));
                addLog(`Caught ${caught} Fish!`, 'craft');
                soundManager.playLevelUp();
            } else {
                addLog('No fish bit...', 'info');
            }
        },

        // PHASE 41
        brewPotion: (potionId: string) => {
            // Assuming POTIONS_DB was supposed to be in alchemy or initialData.
            const potion = POTIONS.find(p => p.id === potionId);
            if (!potion) return;

            const result = brewPotion(potion, resources);
            if (result.success) {
                // Deduct resources
                setResources(prev => {
                    const next = { ...prev };
                    if (result.cost.copper) next.copper -= result.cost.copper;
                    if (result.cost.iron) next.iron -= result.cost.iron;
                    if (result.cost.mithril) next.mithril -= result.cost.mithril;
                    if (result.cost.fish) next.fish -= result.cost.fish;
                    if (result.cost.herbs) next.herbs -= result.cost.herbs;
                    return next;
                });

                // Apply Effect
                if (potion.duration === 0) {
                    // Instant (Heal)
                    if (potion.effect === 'heal') {
                        setHeroes(prev => prev.map(h => ({ ...h, stats: { ...h.stats, hp: Math.min(h.stats.maxHp, h.stats.hp + potion.value) } })));
                        addLog(`Used ${potion.name}: Healed Party!`, 'heal');
                    }
                } else {
                    // Duration Buff
                    setActivePotions(prev => [...prev, {
                        id: Math.random().toString(),
                        name: potion.name,
                        effect: potion.effect,
                        value: potion.value,
                        endTime: Date.now() + (potion.duration * 1000)
                    }]);
                    addLog(`Brewed & Drank ${potion.name}!`, 'heal');
                }
                soundManager.playLevelUp();
            } else {
                addLog(`Cannot brew: ${result.error}`, 'info');
            }
        },


        startExpedition: (exp: Expedition, heroIds: string[]) => {
            // Validate
            // Check if heroes are available (not on another expedition)
            // const available = heroes.filter(h => heroIds.includes(h.id) && h.assignment !== 'expedition' && h.assignment !== 'mine');
            // Actually mining/combat heroes can be reassigned, but expedition heroes are locked?
            // Let's assume re-assignment is fine if user selects them (UI should filter).

            // Set Start Time
            const newExp = { ...exp, startTime: Date.now(), heroIds };
            setActiveExpeditions(p => [...p, newExp]);

            // Assign Heroes
            const updated = startExpedition(newExp, heroes);
            setHeroes(prev => prev.map(h => {
                const update = updated.find(u => u.id === h.id);
                return update ? update : h;
            }));

            addLog(`Expedition '${exp.name}' Started!`, 'info');
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
        if ((starlightUpgrades['auto_rebirth'] || 0) > 0) {
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

        // AUTO PET XP UPGRADE CHECK
        if ((starlightUpgrades['auto_pet_xp'] || 0) > 0) {
            setPets(prev => prev.map(p => {
                if (p.xp + 1 >= p.maxXp) {
                    // Don't auto-level logic here to avoid spam/complexity, just cap or overflow?
                    // Actually, let's just let them gain 1 XP. Level up happens on kill or feed.
                    // Or implement simple auto-level if we want full automation.
                    return { ...p, xp: p.xp + 1 };
                }
                return { ...p, xp: p.xp + 1 };
            }));
        }

        // I need to Fix the return statement to return `activeSynergies`
        // Apply Synergy Buffs
        // Apply Synergy Buffs
        const synergyDefense = synergies.filter(s => s.type === 'defense' || s.type === 'mitigation').reduce((acc, s) => acc + s.value, 0);
        // Vampirism handled in combat.ts via 'activeSynergies'
        const synergyAttackSpeed = synergies.filter(s => s.type === 'attackSpeed' || s.type === 'freeze').reduce((acc, s) => acc + (s.type === 'freeze' ? 0.1 : s.value), 0);
        const synergyResources = synergies.filter(s => s.type === 'resources').reduce((acc, s) => acc + s.value, 0);

        const hasteTalent = talents.find(t => t.stat === 'speed');
        const speedBonus = (hasteTalent ? (1 - (hasteTalent.level * hasteTalent.valuePerLevel)) : 1) * (1 - synergyAttackSpeed);
        const baseTick = 1000 / gameSpeed;
        const effectiveTick = Math.max(40, baseTick * speedBonus); // Allow up to 25x speed (40ms)

        const timer = setTimeout(() => {
            // Card Buffs & Pet Buffs & Potion Buffs
            const petGoldBonus = pets.reduce((acc, p) => acc + (p.bonus.includes('Gold') ? 0.1 : 0), 0);
            const petDefenseBonus = pets.reduce((acc, p) => acc + (p.bonus.includes('Defense') ? 0.2 : 0), 0);

            const potionXpBonus = activePotions.filter(p => p.effect === 'xp').reduce((acc, p) => acc + p.value, 0);
            const potionAtkBonus = activePotions.filter(p => p.effect === 'attack').reduce((acc, p) => acc + p.value, 0);

            // Calculate Galaxy Buffs
            const galaxyBuffs = calculateGalaxyBuffs(galaxy);

            // Apply to Multipliers
            const goldMult = 1 + cards.filter(c => c.stat === 'gold').reduce((acc, c) => acc + (c.count * c.value), 0) + synergyResources + petGoldBonus + galaxyBuffs.goldMult;
            const xpMult = 1 + cards.filter(c => c.stat === 'xp').reduce((acc, c) => acc + (c.count * c.value), 0) + synergyResources + potionXpBonus + galaxyBuffs.xpMult;

            // ... (rest of loop) 

            // Galaxy Notification (Throttle)
            if (Date.now() % 30000 < 1000) { // Every ~30s check (approx) -> Actually using 'tick' is cleaner but this works for now if tick is frequent
                const gIncome = calculateGalaxyIncome(galaxy);
                if (gIncome.gold > 0 || gIncome.mithril > 0 || gIncome.souls > 0 || gIncome.starlight > 0) {
                    // We don't want to spam addLog, so maybe just one generic log
                    // But useEffect runs frequently. Let's use a ref or modulo of effectiveTick accumulator?
                    // Simplification: We rely on the player noticing the resources going up.
                    // Or just add a rare log.
                }
            }

            // ...

            const damageMult = calculateDamageMultiplier(souls, divinity, talents, constellations, artifacts, boss, cards, achievements, pets) + potionAtkBonus + galaxyBuffs.damageMult;
            const defenseMult = 1 + cards.filter(c => c.stat === 'defense').reduce((acc, c) => acc + (c.count * c.value), 0) + synergyDefense + petDefenseBonus;
            // const speedMult = 1 + cards.filter(c => c.stat === 'speed').reduce((acc, c) => acc + (c.count * c.value), 0);

            // Time Tick
            const now = Date.now();
            // Mining Logic (Assigned miners)
            const miners = heroes.filter(h => h.unlocked && h.assignment === 'mine');
            const miningYield = processMining(miners);
            if (miningYield) {
                // ... mining logic existing ... 
            }

            // PHASE 43 - Garden
            if (now % 1000 < 100) {
                setGardenPlots(prev => tickGarden(prev, now));
            }
            if (miningYield) {
                setResources(r => ({
                    ...r,
                    copper: r.copper + (miningYield.copper || 0),
                    iron: r.iron + (miningYield.iron || 0),
                    mithril: r.mithril + (miningYield.mithril || 0)
                }));
            }


            // PHASE 44 - Black Market
            if (marketTimer > 0) {
                setMarketTimer(t => Math.max(0, t - 1000));
            } else if (Math.random() < 0.001) { // 0.1% chance per second (approx avg 16 mins) to spawn
                setMarketStock(generateMarketStock());
                setMarketTimer(300000); // 5 minutes
                // Play sound?
            }

            // Fishing (Passive)
            if (Math.random() < 0.05) { // 5% chance per tick to verify catch
                const fishCaught = processFishing(1);
                if (fishCaught > 0) {
                    setResources(r => ({ ...r, fish: (r.fish || 0) + fishCaught }));
                }
            }

            // Expeditions
            if (activeExpeditions.length > 0) {
                const finished = activeExpeditions.filter(e => checkExpeditionCompletion(e));
                if (finished.length > 0) {
                    let totalGold = 0;
                    let totalXp = 0;
                    let rewardsLog: string[] = [];

                    finished.forEach(exp => {
                        const rewards = claimExpeditionRewards(exp);
                        rewards.forEach(r => {
                            if (r.type === 'gold') totalGold += r.amount;
                            if (r.type === 'xp') totalXp += r.amount;
                            if (r.type === 'item') rewardsLog.push(`${r.amount} Items`);
                            if (r.type === 'artifact') rewardsLog.push("Artifact found!");
                        });
                        addLog(`Expedition '${exp.name}' Complete!`, 'achievement');

                        // Release Heroes
                        // Note: We need to do this in setHeroes to be safe
                    });

                    if (totalGold > 0) setGold(g => g + totalGold);

                    // Handle XP and Hero Release
                    setHeroes(prev => prev.map(h => {
                        if (finished.some(e => e.heroIds.includes(h.id))) {
                            // Apply XP to these heroes? Or just free them?
                            // Prompt said "Gold/XP" rewards. Let's give XP to participant heroes.
                            // let xpGain = totalXp;
                            // Filter xp for specific expedition? Simplified for now.
                            // Ideally we match expedition to reward.
                            // Let's assume 'totalXp' is global for simplicity or fix logic later.
                            // Better: Just free them and apply XP.

                            return { ...h, assignment: 'combat', xp: h.xp + 100 } as Hero; // Reset to combat
                        }
                        return h;
                    }));

                    setActiveExpeditions(prev => prev.filter(e => !finished.find(f => f.id === e.id)));
                    soundManager.playLevelUp();
                }
            }

            // Potions
            if (activePotions.length > 0) {
                const expired = activePotions.filter(p => p.endTime <= now);
                if (expired.length > 0) {
                    expired.forEach(p => addLog(`${p.name} wore off.`, 'info'));
                    setActivePotions(prev => prev.filter(p => p.endTime > now));
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


            // Mutator Logic (Stat modifiers before combat)
            // Clone heroes to apply temporary stats
            // Actually, processCombatTurn takes 'heroes' and does not mutate them in place for next tick stats? 
            // It returns 'updatedHeroes'.
            // But we need to apply Glass Cannon (HP/Atk) BEFORE combat.
            // If we modify them here in a clone, they enter combat with modified stats.

            let combatHeroes = activeHeroes;
            let currentMutator: TowerMutator | undefined = undefined;

            if (tower.active) {
                const mutator = getDailyMutator();
                currentMutator = mutator;

                // --- PREPARE HEROES FOR COMBAT (Apply Mutators & Fatigue) ---
                combatHeroes = heroes
                    .filter(h => h.assignment === 'combat' && !h.isDead)
                    .map(h => {
                        let modH = { ...h };

                        // Mutators
                        if (currentMutator?.id === 'glass_cannon') {
                            modH.stats = { ...modH.stats, attack: modH.stats.attack * 3, maxHp: Math.floor(modH.stats.maxHp * 0.5), hp: Math.min(modH.stats.hp, Math.floor(modH.stats.maxHp * 0.5)) };
                        }
                        if (currentMutator?.id === 'iron_wall') {
                            modH.stats = { ...modH.stats, defense: modH.stats.defense * 2, speed: Math.floor(modH.stats.speed * 0.5) };
                        }

                        // Fatigue Penalty
                        const f = h.fatigue || 0;
                        let fatigueMod = 1.0;
                        if (f >= 100) fatigueMod = 0.5;
                        else if (f >= 80) fatigueMod = 0.7;
                        else if (f >= 50) fatigueMod = 0.9;

                        if (fatigueMod < 1.0) {
                            modH.stats = {
                                ...modH.stats,
                                attack: Math.floor(modH.stats.attack * fatigueMod),
                                defense: Math.floor(modH.stats.defense * fatigueMod),
                                speed: Math.floor(modH.stats.speed * fatigueMod),
                                magic: Math.floor(modH.stats.magic * fatigueMod)
                            };
                        }

                        return modH;
                    });
            }

            const { updatedHeroes, totalDmg, crits, events } = processCombatTurn(combatHeroes, boss, damageMult, critChance, isUltimate, pets, effectiveTick, defenseMult, activeSynergies, activeRift?.restriction, currentMutator);
            damageAccumulator.current += totalDmg; // Track DPS

            // Gather all new events
            const newEvents: CombatEvent[] = [...(events || [])];
            if (totalDmg > 0) {
                newEvents.push({
                    id: Math.random().toString(36),
                    type: 'damage',
                    text: crits > 0 ? `CRIT! ${Math.floor(totalDmg)}` : `${Math.floor(totalDmg)}`,
                    value: totalDmg,
                    isCrit: crits > 0,
                    x: 50 + (Math.random() * 20 - 10),
                    y: 40 + (Math.random() * 20 - 10)
                });
            }

            if (newEvents.length > 0) {
                setCombatEvents(prev => [...prev.slice(-10), ...newEvents]); // Keep last few
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
                // GOLD GAIN
                const baseGold = Math.max(10, boss.level * 50);
                const goldGain = Math.floor(baseGold * goldMult);
                setGold(g => g + goldGain);
                setGameStats(s => ({ ...s, totalGoldEarned: s.totalGoldEarned + goldGain }));

                const xpGain = Math.max(10, Math.floor(boss.level * 10 * xpMult));
                // Boss Defeated Logic
                finalHeroes = finalHeroes.map(h => {
                    if (!h.isDead && h.assignment === 'combat' && h.unlocked) {
                        let newXp = (h.xp || 0) + xpGain;
                        // Level Up Logic
                        while (newXp >= (h.maxXp || 100)) {
                            newXp -= (h.maxXp || 100);
                            h.level = (h.level || 1) + 1;
                            h.maxXp = Math.floor((h.maxXp || 100) * 1.5);

                            // Auto Stats Growth - (Existing logic skipped for brevity, assumed intact in this block replacement or careful merge?)
                            // WAIT, I must include the existing growth logic if I am replacing the block!
                            // Since I am replacing lines 1240-1302, I need to copy the growth logic back in.
                            // Actually, let's keep the hero logic and Just append Item Logic?
                            // No, I need to modify 'h' which contains 'equipment'.

                            // Let's re-implement the hero growth quickly or use the existing one?
                            // Copying from previous view_file:
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

                        // --- UPDATE 78: EVOLVING GEAR ---
                        // Grant 10% of Hero XP to equipped items
                        const itemXpGain = Math.floor(xpGain * 0.1);
                        if (itemXpGain > 0) {
                            (['weapon', 'armor', 'accessory'] as const).forEach(slot => {
                                const item = h.equipment[slot];
                                if (item) {
                                    item.xp = (item.xp || 0) + itemXpGain;
                                    item.maxXp = item.maxXp || 100; // Initialize if missing
                                    item.level = item.level || 1;

                                    if (item.xp >= item.maxXp) {
                                        item.xp -= item.maxXp;
                                        item.level++;
                                        item.maxXp = Math.floor(item.maxXp * 1.5);
                                        // Level Up Bonus: 10% Increase to main stat
                                        item.value = Math.floor(item.value * 1.1) + 1;

                                        addLog(`${item.name} evolved to Level ${item.level}!`, 'craft');
                                        soundManager.playLevelUp();
                                    }
                                }
                            });
                        }

                        return { ...h, xp: newXp };
                    }
                    return h;
                });

                // Drops
                const loot = generateLoot(boss.level);


                // AUTO EQUIP & AUTO SELL
                if ((starlightUpgrades['auto_equip'] || 0) > 0) {
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
                setPets(prev => prev.map(p => {
                    const xpGain = 1 + Math.floor(boss.level / 10);
                    const xp = p.xp + xpGain;
                    if (xp >= p.maxXp) {
                        // Only play sound once per tick if multiple level up (unlikely same tick but good practice)
                        // We can just play it.
                        soundManager.playLevelUp();
                        addLog(`${p.name} Level Up!`, 'heal');
                        return { ...p, level: p.level + 1, xp: 0, maxXp: Math.floor(p.maxXp * 1.5), stats: { ...p.stats, attack: p.stats.attack + 2 } };
                    }
                    return { ...p, xp };
                }));


                // Guild XP
                setGuild(g => {
                    if (!g) return null;
                    const xpGain = Math.max(1, Math.floor(boss.level / 2));
                    const newXp = g.xp + xpGain;
                    if (newXp >= g.maxXp) {
                        addLog(`${g.name} Guild Level Up!`, 'achievement');
                        soundManager.playLevelUp();
                        const newBonusVal = (g.bonusValue || 0.1) + 0.01;
                        // Update bonus string display
                        const newBonusStr = (g.bonus || g.description || "").replace(/\d+%/, `${Math.round(newBonusVal * 100)}%`);
                        return {
                            ...g,
                            level: g.level + 1,
                            xp: 0,
                            maxXp: Math.floor(g.maxXp * 1.2),
                            bonusValue: newBonusVal,
                            bonus: newBonusStr
                        };
                    }
                    return { ...g, xp: newXp };
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


                    // Drop Herbs Logic
                    if (Math.random() < 0.15) { // 15% Chance
                        setResources(prev => ({ ...prev, herbs: prev.herbs + Math.floor(Math.random() * 5) + 1 }));
                        addLog(`Found Herbs!`, 'achievement');
                    }
                }

                // (Fatigue System moved to end of loop)

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
            }

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

            const checkAchievements = () => {
                setAchievements(prev => prev.map(ach => {
                    if (ach.isUnlocked) return ach;
                    let current = 0;
                    if (ach.condition.type === 'kills') current = gameStats.totalKills;
                    if (ach.condition.type === 'bossKills') current = gameStats.bossKills;
                    if (ach.condition.type === 'gold') current = gameStats.totalGoldEarned;
                    if (ach.condition.type === 'clicks') current = gameStats.clicks;
                    if (ach.condition.type === 'itemsForged') current = gameStats.itemsForged;
                    if (ach.condition.type === 'oreMined') current = gameStats.oreMined;
                    if (ach.condition.type === 'fishCaught') current = gameStats.fishCaught;

                    if (current >= ach.condition.value) {
                        addLog(`Suggestion Unlocked: ${ach.name} ! ${ach.rewardText} `, 'achievement'); // Changed 'Achievement' to 'Suggestion' as requested? No, sticking to name.
                        addLog(`ACHIEVEMENT UNLOCKED: ${ach.name}`, 'achievement');
                        soundManager.playLevelUp();
                        // Apply reward (Simplified: Just store unlocked status, effects applied elsewhere)
                        return { ...ach, isUnlocked: true };
                    }
                    return ach;
                }));
            };
            checkAchievements();



            // --- PHASE 51: AUTOMATION MECHANICS ---
            // Run every 10 ticks (approx 1s) to avoid spam
            const tick = Date.now();
            if (tick % 1000 < 100) { // Rough 1s check

                // 1. AUTO-MINING (Miners Lv 3+)
                const miners = heroes.filter(h => h.class === 'Miner' && h.level >= 3 && !h.isDead && h.unlocked);
                if (miners.length > 0) {
                    const copperGain = miners.length * 2;
                    const ironGain = miners.filter(m => m.level >= 10).length;
                    setResources(r => ({ ...r, copper: r.copper + copperGain, iron: r.iron + ironGain }));

                    setGameStats(s => ({ ...s, oreMined: s.oreMined + copperGain + ironGain })); // Track Mined
                }

                // 2. AUTO-FEEDING (Fishermen Lv 3+)
                const fishermen = heroes.filter(h => h.class === 'Fisherman' && h.level >= 3 && !h.isDead && h.unlocked);
                if (fishermen.length > 0 && pets.length > 0) {
                    // ... (omitted for brevity, no stat change needed here unless we track 'Pets Fed')
                    // Let's implement 'fishCaught' tracking elsewhere? Fishermen consume fish here.
                    // The user asked for "Fishermen start feeding pets".
                    // If we want to track 'Fish Caught', we need an Auto-Fishing mechanic? 
                    // Or maybe we treat 'Feeding' as 'Using Fish'.
                    // For now, let's assume 'Fish Caught' happens in the Fishing Minigame mainly. 

                    // But wait, if Fishermen are "Fishermen", shouldn't they catch fish?
                    // Currently logic is "Feed pets with Fish". 
                    // Let's Add Auto-Fishing too? "Fisherman Lv 3+: Catches Fish"

                    setResources(prevRes => {
                        // AUTO FISHING: Gain 1 fish per fisherman
                        const fishGain = fishermen.length;
                        let newFish = prevRes.fish + fishGain;

                        // AUTO FEEDING

                        if (newFish > 0) {
                            const hungryPets = pets.length; // Simplified
                            const eaten = Math.min(newFish, hungryPets);

                            setPets(prevPets => prevPets.map(p => {
                                const nxp = p.xp + 5 * Math.max(1, Math.floor(fishermen.length / 2));
                                if (nxp >= p.maxXp) {
                                    return { ...p, level: p.level + 1, xp: nxp - p.maxXp, maxXp: Math.floor(p.maxXp * 1.5) };
                                }
                                return { ...p, xp: nxp };
                            }));
                            newFish -= eaten;
                        }
                        return { ...prevRes, fish: newFish };
                    });
                    // We can't easily update stats inside the functional update of setResources if we need the result.
                    // Simplified: Just assume they caught fish.
                    setGameStats(s => ({ ...s, fishCaught: s.fishCaught + fishermen.length }));
                }

                // 3. AUTO-CRAFTING (Blacksmiths Lv 3+)
                const blacksmiths = heroes.filter(h => h.class === 'Blacksmith' && h.level >= 3 && !h.isDead && h.unlocked);
                blacksmiths.forEach(bs => {
                    if (Math.random() < 0.05) {
                        const rarityRoll = Math.random();
                        const rarity = rarityRoll > 0.95 ? 'epic' : rarityRoll > 0.8 ? 'rare' : 'common';
                        const newItem: Item = {
                            id: `auto_forged_${Date.now()}_${Math.random()}`,
                            name: `Forged ${rarity} Sword`,
                            type: 'weapon',
                            rarity: rarity,
                            stat: 'attack',
                            value: bs.level * 2,
                            runes: [],
                            sockets: 0
                        };
                        setItems(prev => [...prev.slice(-99), newItem]);
                        setGameStats(s => ({ ...s, itemsForged: s.itemsForged + 1 })); // Track Forged
                        addLog(`Blacksmith ${bs.name} forged a ${newItem.name}!`, 'craft');
                    }
                });
            }

            // --- END AUTOMATION ---

            // --- FATIGUE SYSTEM (Phase 80) ---
            // Apply to finalHeroes before saving state
            finalHeroes = finalHeroes.map(h => {
                let newFatigue = h.fatigue || 0;
                const maxFatigue = h.maxFatigue || 100;

                // 1. Combat Fatigue Gain
                if (h.assignment === 'combat' && !h.isDead) {
                    newFatigue = Math.min(maxFatigue, newFatigue + 1);
                    if (newFatigue === 50) addLog(`${h.name} is getting tired (50% Fatigue)!`, 'info');
                    if (newFatigue === 80) addLog(`${h.name} is exhausted (80% Fatigue)!`, 'danger' as any);
                }
                // 2. Campfire Recovery
                else if (h.assignment === 'campfire') {
                    newFatigue = Math.max(0, newFatigue - 5);
                }

                return { ...h, fatigue: newFatigue, maxFatigue: maxFatigue };
            });

            // Calc Power
            const currentPwr = finalHeroes.filter(h => h.unlocked && h.assignment === 'combat').reduce((acc, h) => acc + calculateHeroPower(h), 0);
            setPartyPower(currentPwr);

            setHeroes(finalHeroes);
        }, effectiveTick / (1 + cards.filter(c => c.stat === 'speed').reduce((acc, c) => acc + (c.count * c.value), 0)));

        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, gold, divinity, pets, talents, artifacts, cards, constellations, keys, dungeonActive, raidActive, resources]);



    // Starlight Logic

    const buyStarlightUpgrade = (id: string) => {
        const upgrade = STARLIGHT_UPGRADES.find(u => u.id === id);
        if (!upgrade) return;

        const currentLevel = starlightUpgrades[id] || 0;
        if (currentLevel >= upgrade.maxLevel) return;

        const cost = getStarlightUpgradeCost(upgrade, currentLevel);
        if (starlight >= cost) {
            setStarlight(s => s - cost);
            setStarlightUpgrades(prev => ({
                ...prev,
                [id]: currentLevel + 1
            }));
            addLog(`Purchased Starlight Upgrade: ${upgrade.name}`, 'craft');
            soundManager.playLevelUp();
        } else {
            addLog(`Not enough Starlight! Need ${formatNumber(cost)}`, 'error');
        }
    };

    usePersistence({
        heroes, setHeroes, boss, setBoss, items, setItems, souls, setSouls, gold, setGold,
        divinity, setDivinity, pets, setPets, talents, setTalents, artifacts, setArtifacts,
        cards, setCards, constellations, setConstellations, keys, setKeys, resources, setResources,
        tower, setTower, guild, setGuild, voidMatter, setVoidMatter,
        arenaRank, setArenaRank, glory, setGlory, quests, setQuests,
        runes, setRunes, achievements, setAchievements,
        eternalFragments, setEternalFragments,
        starlight, setStarlight,
        starlightUpgrades, setStarlightUpgrades,
        autoSellRarity, setAutoSellRarity,
        arenaOpponents, setArenaOpponents,
        theme, setTheme,
        galaxy, setGalaxy,
        monsterKills, setMonsterKills,
        gameStats, setGameStats,
        activeExpeditions, setActiveExpeditions,
        activePotions, setActivePotions,
        buildings, setBuildings,
        setRaidActive, setDungeonActive, setOfflineGains,
        dailyQuests, setDailyQuests,
        dailyLoginClaimed, setDailyLoginClaimed,
        lastDailyReset, setLastDailyReset
    });

    // PHASE 44 - Black Market Action
    const buyMarketItem = (item: MarketItem) => {
        if (item.currency === 'gold' && gold >= item.cost) {
            setGold(g => g - item.cost);
        } else if (item.currency === 'divinity' && divinity >= item.cost) {
            setDivinity(d => d - item.cost);
        } else if (item.currency === 'voidMatter' && voidMatter >= item.cost) {
            setVoidMatter(v => v - item.cost);
        } else {
            return; // Cannot afford
        }

        // Apply Effect
        if (item.type === 'potion') {
            // Stat boosts
            if (item.id.includes('void')) setVoidMatter(v => v + (item.value || 0));
            if (item.id.includes('divinity')) setDivinity(d => d + (item.value || 0));
            if (item.id.includes('gold')) setGold(g => g + (item.value || 0));
        } else if (item.type === 'gambit_box') {
            setGold(g => g + 1000); // Placeholder
            addLog("Gambit Unlocked (Simulated)", "achievement");
        }

        // Remove from stock
        setMarketStock(prev => prev.filter(i => i.id !== item.id));
        addLog(`Bought ${item.name}`, 'action');
    };

    // PHASE 54: Gambit Actions
    const renameHero = (heroId: string, newName: string) => {
        setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, name: newName } : h));
    };

    const equipItem = (heroId: string, item: Item) => {
        setHeroes(prev => prev.map(h => {
            if (h.id === heroId) {
                // Determine slot from item or default
                const slot = item.slot || (item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'accessory');
                const oldItem = h.equipment[slot];

                // Return old item to inventory
                if (oldItem) {
                    setItems(i => [...i, oldItem]);
                }

                // Remove new item from inventory
                setItems(i => i.filter(invItem => invItem.id !== item.id));

                return { ...h, equipment: { ...h.equipment, [slot]: item } };
            }
            return h;
        }));
        soundManager.playLevelUp();
    };

    const unequipItem = (heroId: string, slot: 'weapon' | 'armor' | 'accessory') => {
        setHeroes(prev => prev.map(h => {
            if (h.id === heroId && h.equipment[slot]) {
                const item = h.equipment[slot];
                setItems(i => [...i, item!]);
                return { ...h, equipment: { ...h.equipment, [slot]: undefined } };
            }
            return h;
        }));
        soundManager.playLevelUp();
    };

    const updateGambits = (heroId: string, gambits: Gambit[]) => {
        setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, gambits } : h) as Hero[]);
        addLog("Tactics Updated", "info"); // Brief log
    };

    // PHASE 55: Card Battle
    const winCardBattle = (_opponentId: string, difficulty: number) => {
        const goldReward = difficulty * 10;
        setGold(g => g + goldReward);
        setGameStats(s => ({ ...s, cardBattlesWon: (s.cardBattlesWon || 0) + 1 })); // Ensure type exists in next step
        addLog(`Won Duel! +${goldReward} Gold`, 'achievement');

        // Chance for card drop?
        if (Math.random() < 0.1) {
            // Random Card
            // ... implemented later or simplified "Found Card Pack" concept
        }
    };

    // Phase 58: Prestige
    const evolveHero = (heroId: string) => {
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) return;

        if (hero.level < 50) {
            addLog(`${hero.name} must be Level 50 to Evolve.`, 'info');
            return;
        }

        const newClass = PRESTIGE_CLASSES[hero.class];
        if (!newClass) {
            addLog(`${hero.class} cannot evolve further (yet).`, 'info');
            return;
        }

        setHeroes(prev => prev.map(h => {
            if (h.id === heroId) {
                const mult = PRESTIGE_MULTIPLIERS.statBonus;
                const newStats = {
                    hp: Math.floor(h.stats.hp * mult),
                    maxHp: Math.floor(h.stats.maxHp * mult),
                    mp: Math.floor(h.stats.mp * mult),
                    maxMp: Math.floor(h.stats.maxMp * mult),
                    attack: Math.floor(h.stats.attack * mult),
                    defense: Math.floor(h.stats.defense * mult),
                    magic: Math.floor(h.stats.magic * mult),
                    speed: Math.floor(h.stats.speed * mult)
                };

                addLog(`EVOLUTION! ${h.name} became a ${newClass}! Stats increased massively!`, 'achievement');
                soundManager.playLevelUp(); // Maybe a more epic sound?

                return {
                    ...h,
                    class: newClass as any,
                    prestigeClass: newClass as any,
                    level: 1,
                    xp: 0,
                    maxXp: 100, // Reset XP curve
                    evolutionCount: (h.evolutionCount || 0) + 1,
                    stats: newStats,
                    emoji: '🌟' + h.emoji // Add sparkle to emoji
                } as Hero;
            }
            return h;
        }) as Hero[]);
    };



    // PHASE 56: Dailies

    const checkDailies = () => {
        const now = Date.now();
        if (checkDailyReset(lastDailyReset)) {
            // New Day!
            setLastDailyReset(now);
            setDailyLoginClaimed(false);
            setDailyQuests(generateDailyQuests()); // Corrected call

            // Update Streak
            setGameStats(prev => ({
                ...prev,
                loginStreak: getLoginStreak(prev.lastLogin || 0, prev.loginStreak || 1),
                lastLogin: now
            }));

            addLog("New Day! Daily Quests Reset.", "info");
        } else {
            // Same Day, just update lastLogin
            setGameStats(prev => ({ ...prev, lastLogin: now }));
        }
    };

    // Initialize Dailies on Load (triggered by useEffect dependency or explicit call? 
    // We can add it to the main initialization useEffect or a new one)

    const claimLoginReward = () => {
        if (dailyLoginClaimed) return;

        const streak = gameStats.loginStreak || 1;
        const reward = LOGIN_REWARDS.find(r => r.day === streak) || LOGIN_REWARDS[0];

        if (reward.type === 'gold') setGold(g => g + reward.amount);
        if (reward.type === 'souls') setSouls(s => s + reward.amount);
        if (reward.type === 'starlight') setStarlight(s => s + reward.amount);

        setDailyLoginClaimed(true);
        addLog(`Claimed Daily Reward: ${reward.label}`, 'achievement');
        soundManager.playLevelUp();
    };

    const claimDailyQuest = (questId: string) => {
        setDailyQuests(prev => prev.map(q => {
            if (q.id === questId && !q.claimed && q.current >= q.target) {
                // Grant Reward
                if (q.reward.type === 'gold') setGold(g => g + q.reward.amount);
                if (q.reward.type === 'souls') setSouls(s => s + q.reward.amount);
                if (q.reward.type === 'starlight') setStarlight(s => s + q.reward.amount);

                addLog(`Quest Complete! +${q.reward.amount} ${q.reward.type}`, 'achievement');
                return { ...q, claimed: true };
            }
            return q;
        }));
    };

    // PHASE 45: Rifts
    const enterRift = (rift: Rift) => {
        if (partyPower < rift.difficulty) {
            addLog(`Rift too dangerous! Recommended Power: ${formatNumber(rift.difficulty)}`, 'info');
            return;
        }
        setActiveRift(rift);
        setRiftTimer(rift.restriction === 'time_crunch' ? 10 : 300); // 10s for time crunch, 5m for others
        setDungeonActive(false); // Can't be in dungeon and rift
        addLog(`Entered Rift: ${rift.name} (${rift.restriction})`, 'info');
    };

    const exitRift = (success: boolean) => {
        if (!activeRift) return;

        if (success) {
            addLog(`Conquered Rift: ${activeRift.name}!`, 'achievement');
            // Give Rewards
            activeRift.rewards.forEach(r => {
                if (r.type === 'starlight') setStarlight(s => s + r.amount);
                if (r.type === 'voidMatter') setVoidMatter(v => v + r.amount);
                if (r.type === 'gold') setGold(g => g + r.amount);
            });
            // Restore HP on exit? Or let them suffer? Let's restore for convenience.
            setHeroes(prev => prev.map(h => ({ ...h, stats: { ...h.stats, hp: h.stats.maxHp } })));
        } else {
            addLog(`Failed Rift: ${activeRift.name}.`, 'death');
        }
        setActiveRift(null);
        setRiftTimer(0);
    };

    // Rift Timer Tick
    useEffect(() => {
        if (!activeRift) return;
        const timer = setInterval(() => {
            setRiftTimer(prev => {
                if (prev <= 1) {
                    exitRift(false); // Time ran out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeRift]);


    // Phase 46: Breeding
    const breedPets = (parent1: Pet, parent2: Pet) => {
        const cost = 5000;
        if (gold < cost) return;

        setGold(g => g - cost);
        const child = calculateBreedingResult(parent1, parent2);

        setPets(prev => {
            const others = prev.filter(p => p.id !== parent1.id && p.id !== parent2.id);
            return [...others, child];
        });

        addLog(`Transmuted ${parent1.name} and ${parent2.name} into ${child.name}!`, 'achievement');
    };


    // Phase 47: Guild Wars
    const [territories, setTerrories] = useState<Territory[]>(INITIAL_TERRITORIES);

    // Phase 48: Weather
    const [weather, setWeather] = useState<WeatherType>('Clear');
    const [weatherTimer, setWeatherTimer] = useState(300); // 5 minutes per cycle

    useEffect(() => {
        const timer = setInterval(() => {
            setWeatherTimer(prev => {
                if (prev <= 1) {
                    const nextWeather = getRandomWeather();
                    setWeather(nextWeather);
                    const effect = WEATHER_DATA[nextWeather];
                    if (nextWeather !== 'Clear') {
                        addLog(`Weather changed to ${effect.name}! ${effect.description}`, 'info');
                    }
                    return 300; // Reset to 5 mins
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Apply Weather Bonuses inside hooks/logic?
    // For now, simply exporting the state so components can react (e.g. Header, BattleArea)

    const attackTerritory = (id: string) => {
        const territory = territories.find(t => t.id === id);
        if (!territory) return;

        // Simple cost to attack? Maybe Energy? For now, free or small gold cost
        const siegeCost = 1000;
        if (gold < siegeCost) {
            addLog("Not enough gold to fund the siege!", "action"); // Changed from error to action to satisfy type
            return;
        }
        setGold(g => g - siegeCost);

        const won = simulateSiege(territory, partyPower);
        if (won) {
            setTerrories(prev => prev.map(t => t.id === id ? { ...t, owner: 'player' } : t));
            addLog(`Victory! Captured ${territory.name}.`, 'achievement');
        } else {
            addLog(`Defeat! Your army failed to take ${territory.name}.`, 'death');
            // Perhaps lose some troops or temp debuff?
        }
    };

    // Inject bonuses into state/getters if possible, or export them.
    // For now, let's export them so App or other hooks can use them? 
    // Actually, gold generation is inside this hook mostly (via mining/combat).
    // We should modify the useEffect loops for passive gain.

    const upgradeBuilding = (id: string) => {
        const building = buildings.find(b => b.id === id);
        if (!building || gold < building.cost) return;

        setGold(g => g - building.cost);
        setBuildings(prev => prev.map(b => b.id === id ? { ...b, level: b.level + 1, cost: Math.floor(b.cost * b.costScaling) } : b));
        addLog(`Upgraded ${building.name} to Level ${building.level + 1}!`, 'craft');
        soundManager.playLevelUp();
    };

    // Phase 59: Spaceship Logic
    const upgradeSpaceship = (part: keyof Spaceship['parts']) => {
        if (!spaceship) return;
        const partLevel = spaceship.parts[part];
        const cost = partLevel * 1000;
        if (gold >= cost) {
            setGold(g => g - cost);
            setSpaceship(prev => prev ? ({
                ...prev,
                parts: { ...prev.parts, [part]: prev.parts[part] + 1 }
            }) : prev);
            addLog(`Upgraded spaceship ${part} to level ${partLevel + 1}`, 'craft');
        } else {
            addLog(`Not enough gold to upgrade ${part}`, 'info');
        }
    };

    // Phase 61: Dungeon Logic
    const enterDungeon = () => {
        const level = 1 + Math.floor(boss.level / 5);
        const newState = generateDungeon(level);
        setDungeonState(newState);
        setDungeonActive(true);
        addLog(`Entered Dungeon Level ${level}!`, 'action');
    };

    const exitDungeon = () => {
        setDungeonActive(false);
        setDungeonState(null);
        addLog('Left the dungeon.', 'info');
    };

    const moveDungeon = (dx: number, dy: number) => {
        if (!dungeonState) return;
        const { grid, playerPos, width, height, revealed } = dungeonState;
        const nx = playerPos.x + dx;
        const ny = playerPos.y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;

        const targetCell = grid[ny][nx];
        if (targetCell === 'wall') return;

        // Elemental Lock Logic
        if (typeof targetCell === 'string' && targetCell.startsWith('lock_')) {
            const reqElement = targetCell.split('_')[1];
            const hasElement = heroes.some(h => h.assignment === 'combat' && !h.isDead && h.element === reqElement);

            if (hasElement) {
                addLog(`Elemental Barrier (${reqElement}) shattered!`, 'action');
                soundManager.playLevelUp(); // Reusing sound for feedback

                // Remove lock
                setDungeonState(prev => {
                    if (!prev) return null;
                    const newGrid = prev.grid.map(row => [...row]);
                    newGrid[ny][nx] = 'empty';
                    return { ...prev, grid: newGrid };
                });
                return; // Consume move to unlock
            } else {
                addLog(`Blocked! Requires a ${reqElement.toUpperCase()} Hero to bypass this barrier!`, 'error');
                return;
            }
        }

        const newRevealed = [...revealed.map(row => [...row])];
        const dirs = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
        dirs.forEach(([rx, ry]) => {
            const cx = nx + rx, cy = ny + ry;
            if (cx >= 0 && cx < width && cy >= 0 && cy < height) newRevealed[cy][cx] = true;
        });

        let newGrid = [...grid.map(row => [...row])];
        if (targetCell === 'chest') {
            addLog("Found a Treasure Chest!", "action");
            setGold(g => g + 500);
            newGrid[ny][nx] = 'empty';
        } else if (targetCell === 'enemy') {
            addLog("Encountered a Dungeon Monster!", "danger");
            newGrid[ny][nx] = 'empty';
        } else if (targetCell === 'exit') {
            addLog("Found the exit! Dungeon Complete.", "success");
            exitDungeon();
            return;
        }

        setDungeonState(prev => prev ? ({
            ...prev,
            playerPos: { x: nx, y: ny },
            revealed: newRevealed,
            grid: newGrid
        }) : null);
    };

    // NOTE: This hook is getting HUGE. Refactoring is recommended for Phase 48.

    return {
        heroes, boss, logs, items, gameSpeed, isSoundOn, souls, gold, divinity, pets, offlineGains,
        talents, artifacts, cards, constellations, keys, dungeonActive, dungeonTimer, resources,
        ultimateCharge, raidActive, raidTimer, tower, guild, voidMatter, voidActive, voidTimer,
        arenaRank, glory, quests, runes, achievements, internalFragments: eternalFragments, starlight, starlightUpgrades, autoSellRarity, arenaOpponents,
        actions: {
            ...ACTIONS,
            conquerSector,
            breedPets,
            attackTerritory,
            enterDungeon,
            moveDungeon,
            exitDungeon,
            buyMarketItem,
            enterRift,
            exitRift,
            claimLoginReward,
            claimDailyQuest,
            checkDailies,
            winCardBattle,
            evolveHero,
            equipItem,
            unequipItem,
            upgradeBuilding,
            buyStarlightUpgrade,
            renameHero: ACTIONS.renameHero,
            updateGambits: ACTIONS.updateGambits,
            formatNumber
        },
        partyDps,
        partyPower,
        combatEvents,
        theme,
        galaxy,
        territories,
        weather,
        weatherTimer,
        synergies: activeSynergies,
        suggestions: checkSynergies(heroes).length < 5 ? getSynergySuggestions(heroes) : [],
        formations,
        saveFormation,
        loadFormation,
        deleteFormation,
        monsterKills, gameStats, activeExpeditions, activePotions,
        // PHASE 43
        gardenPlots, setGardenPlots,
        setResources, setGold,
        marketStock, marketTimer, buyMarketItem,
        // PHASE 45
        activeRift, riftTimer, enterRift, exitRift,
        // PHASE 46
        breedPets,
        // PHASE 54
        buyStarlightUpgrade, isStarlightModalOpen, setIsStarlightModalOpen,
        spaceship, upgradeSpaceship, // Phase 59
        dailyQuests, dailyLoginClaimed, claimLoginReward, claimDailyQuest, checkDailies, // Phase 56
        lastDailyReset,
        buildings, upgradeBuilding,
        winCardBattle, evolveHero, equipItem, unequipItem,
        renameHero: ACTIONS.renameHero, updateGambits: ACTIONS.updateGambits,
        attackTerritory,
        moveDungeon, exitDungeon, enterDungeon, dungeonState
    };
};
