import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import type { Hero, Boss, LogEntry, Item, Quest, ArenaOpponent, Achievement, GameStats, Resources, Building, DailyQuest, CombatEvent, Potion, MarketItem, GardenPlot, Expedition, GameActions, Stats, Pet, Rift, RiftBlessing, DungeonInteraction, ClassMastery, HeroClass } from '../engine/types';
import { POTIONS } from '../engine/types';
import { getStarlightUpgradeCost, STARLIGHT_UPGRADES } from '../engine/starlight';
import { checkDailyReset, generateDailyQuests, LOGIN_REWARDS } from '../engine/dailies';
import { formatNumber } from '../utils';
import { soundManager } from '../engine/sound';
import { usePersistence } from './usePersistence';
import { useWorldBoss } from './useWorldBoss';
import { usePets } from './usePets';
import { useGuild } from './useGuild';
import { useGalaxy } from './useGalaxy';
import { useWorld } from './useWorld';
import { calculateDamageMultiplier, processCombatTurn } from '../engine/combat';
import { checkSynergies } from '../engine/synergies';
import { generateLoot } from '../engine/loot';
import { shouldSummonTavern } from '../engine/automation';
import { simulateTavernSummon } from '../engine/tavern';
import { processMining } from '../engine/mining';
import { processFishingAdvanced } from '../engine/fishing';
import { brewPotion, transmuteResources, ELIXIRS } from '../engine/alchemy';
import { startExpedition } from '../engine/expeditions';
import { mysticReforge } from '../engine/starForge';
import { processGlobalAutomation } from '../engine/automation';
// import { generateTownEvent } from '../engine/townEvents';
import { validateGuildExpeditionTeam } from '../engine/guildExpeditions';
import { useVoidGuardian } from './useVoidGuardian';
import { calculateVoidGuardianRewards } from '../engine/voidBoss';
import { PRESTIGE_CLASSES } from '../engine/classes';
import { CLASS_TALENTS } from '../data/masteryData';
import { PRESTIGE_NODES, getPrestigeNodeCost } from '../components/modals/PrestigeTreeModal';
import { MONSTERS } from '../engine/bestiary';

import { INITIAL_HEROES, INITIAL_BOSS, INITIAL_ACHIEVEMENTS, INITIAL_GAME_STATS, INITIAL_SPACESHIP, INITIAL_CONSTELLATIONS, INITIAL_CLASS_MASTERY, RARE_ARTIFACTS } from '../engine/initialData';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_GALAXY } from '../engine/galaxy';
import { generateInitialArenaBoard, calculateWinChance, applyVictoryGrowth, spawnReplacementOpponent } from '../engine/arena';
import { INITIAL_TERRITORIES, applyTerritoryUpgrade } from '../engine/guildWar';
import { INITIAL_TOWN, INITIAL_MARKET_TREND } from '../engine/initialData';
import { generateRandomTrend, MARKET_TRENDS } from '../engine/marketDynamics';
import type { MarketTrend, TownState, AncientRelic } from '../engine/types';

const getNextBoss = (level: number): Boss => {
    const monster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    return {
        id: `boss-${Date.now()}`,
        name: monster.name,
        emoji: monster.emoji,
        type: 'boss',
        level,
        isDead: false,
        element: 'neutral',
        stats: {
            maxHp: Math.floor(200 * Math.pow(1.2, level - 1)),
            hp: Math.floor(200 * Math.pow(1.2, level - 1)),
            attack: Math.floor(12 * Math.pow(1.1, level - 1)),
            defense: Math.floor(2 * Math.pow(1.05, level - 1)),
            speed: 8 + Math.floor(level / 10),
            mp: 0,
            maxMp: 0,
            magic: 0
        }
    };
};

export const useGame = () => {
    // CORE STATE
    const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
    const [classMastery, setClassMastery] = useState<Record<string, ClassMastery>>(INITIAL_CLASS_MASTERY);
    const [boss, setBoss] = useState<Boss>(INITIAL_BOSS);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [runes, setRunes] = useState<import('../engine/types').Rune[]>([]); // ADDED RUNES STATE
    const [gameSpeed, setGameSpeed] = useState<number>(1);
    const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
    const [items, setItems] = useState<Item[]>([]);
    const MAX_INVENTORY_SIZE = 50; // Jogo mais compacto na memoria
    const [souls, setSouls] = useState<number>(0);
    const [gold, setGold] = useState<number>(0);
    const [divinity, setDivinity] = useState<number>(0);
    const [voidMatter, setVoidMatter] = useState<number>(0);
    const [voidAscensions, setVoidAscensions] = useState<number>(0);
    const [victory, setVictory] = useState(false);
    const [offlineGains, setOfflineGains] = useState<string | null>(null);
    const [talents, setTalents] = useState<import('../engine/types').Talent[]>([]);
    const [artifacts, setArtifacts] = useState<import('../engine/types').Artifact[]>(RARE_ARTIFACTS);
    const [cards, setCards] = useState<import('../engine/types').MonsterCard[]>([]);
    const [monsterKills, setMonsterKills] = useState<Record<string, number>>({});
    const [constellations, setConstellations] = useState<import('../engine/types').ConstellationNode[]>(INITIAL_CONSTELLATIONS);
    const [keys, setKeys] = useState<number>(0);
    const [resources, setResources] = useState<Resources>({ copper: 0, iron: 0, mithril: 0, fish: 0, herbs: 0, starFragments: 0 });
    const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
    const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
    const [dailyLoginClaimed, setDailyLoginClaimed] = useState<boolean>(false);
    const [lastDailyReset, setLastDailyReset] = useState<number>(Date.now());
    const [activeExpeditions, setActiveExpeditions] = useState<Expedition[]>([]);
    const [activePotions, setActivePotions] = useState<{ id: string, name: string, effect: Potion['effect'], value: number, endTime: number }[]>([]);
    const [gardenPlots, setGardenPlots] = useState<GardenPlot[]>([]);
    const [marketStock, setMarketStock] = useState<MarketItem[]>([]);
    const [marketTimer, setMarketTimer] = useState<number>(0);
    const [ultimateCharge, setUltimateCharge] = useState<number>(0);
    const [raidActive, setRaidActive] = useState(false);
    const [raidTimer, setRaidTimer] = useState(0);
    const [voidActive, setVoidActive] = useState(false);
    const [voidTimer, setVoidTimer] = useState(0);
    const [starlight, setStarlight] = useState(0);
    const [starlightUpgrades, setStarlightUpgrades] = useState<Record<string, number>>({});
    const [isStarlightModalOpen, setIsStarlightModalOpen] = useState(false);
    const [theme, setTheme] = useState('default');
    const [autoSellRarity, setAutoSellRarity] = useState<'none' | 'common' | 'rare'>('none');
    const [showCampfire, setShowCampfire] = useState(false);
    const [dungeonMastery, setDungeonMastery] = useState<import('../engine/types').DungeonMastery>({
        explorerLevel: 0, slayerLevel: 0, looterLevel: 0, trapSenseLevel: 0
    });
    const [activeEvent, setActiveEvent] = useState<import('../engine/types').TownEvent | null>(null);
    const [outerSpaceUnlocked, setOuterSpaceUnlocked] = useState(false);
    const [prestigeNodes, setPrestigeNodes] = useState<Record<string, number>>({});
    const [townVisited, setTownVisited] = useState(false);
    const [town, setTown] = useState<TownState>(INITIAL_TOWN);
    const [marketTrend, setMarketTrend] = useState<MarketTrend>(INITIAL_MARKET_TREND);
    const [portalConfig, setPortalConfig] = useState<{
        title: string;
        message: string;
        warning?: string;
        soulsGained?: number;
        rewardText?: string;
        onConfirm: () => void;
    } | null>(null);

    const damageAccumulator = useRef(0);
    const lastDpsUpdate = useRef(Date.now());

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = { id: (Date.now() + Math.random()).toString(), message, type, timestamp: Date.now() };
        setLogs(prev => [newLog, ...prev].slice(0, 5));
    }, []);

    // SUB-HOOKS
    const guildState = useGuild(null, gold, setGold, addLog);
    const petsState = usePets([], gold, souls, setGold, setSouls, addLog);
    const world = useWorld({ floor: 1, active: false, maxFloor: 1 }, { active: false, floor: 1, blessings: [], tempHeroes: [], maxFloor: 1 }, addLog);
    const galaxyState = useGalaxy(INITIAL_GALAXY, INITIAL_TERRITORIES, INITIAL_SPACESHIP, gold, setGold, addLog);

    const [glory, setGlory] = useState<number>(0);
    const [partyDps, setPartyDps] = useState(0);
    const [partyPower, setPartyPower] = useState(0);
    const [arenaRank, setArenaRank] = useState<number>(1000);
    const [arenaOpponents, setArenaOpponents] = useState<ArenaOpponent[]>([]);
    const [guildQueue, setGuildQueue] = useState<{ name: string; emoji: string; power: number }[]>([]);
    const [gameStats, setGameStats] = useState<GameStats>(INITIAL_GAME_STATS);
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
    const [quests, setQuests] = useState<Quest[]>([]);

    const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([]);

    const voidGuardian = useVoidGuardian(partyPower, addLog, (dmg) => {
        const rewards = calculateVoidGuardianRewards(dmg);
        setGold(g => g + rewards.gold);
        setSouls(s => s + rewards.souls);
        if (dmg > (gameStats.voidGuardianHighestDamage || 0)) {
            setGameStats(prev => ({ ...prev, voidGuardianHighestDamage: dmg }));
        }
    });

    const worldBossState = useWorldBoss(partyPower, gameStats, addLog, (rewards) => {
        setGold(g => g + rewards.gold);
        setSouls(s => s + rewards.souls);

        if (rewards.guildXp > 0 || rewards.guildMembers > 0) {
            guildState.setGuild(prev => {
                if (!prev) return prev;
                let newXp = prev.xp + rewards.guildXp;
                let newLevel = prev.level;
                let newMaxXp = prev.maxXp;
                let newBonusVal = prev.bonusValue || 0.1;

                while (newXp >= newMaxXp) {
                    newLevel += 1;
                    newXp -= newMaxXp;
                    newMaxXp = Math.floor(newMaxXp * 1.2);
                    newBonusVal += 0.01;
                }

                return {
                    ...prev,
                    level: newLevel,
                    xp: newXp,
                    maxXp: newMaxXp,
                    bonusValue: newBonusVal,
                    members: prev.members + rewards.guildMembers,
                    bonus: prev.bonus?.replace(/\d+%/, `${Math.round(newBonusVal * 100)}%`) || ""
                };
            });
        }

        if (rewards.petXp > 0) {
            petsState.setPets(prev => prev.map(p => {
                let newXp = p.xp + rewards.petXp;
                let newLevel = p.level;
                let newMaxXp = p.maxXp;
                while (newXp >= newMaxXp) {
                    newLevel++;
                    newXp -= newMaxXp;
                    newMaxXp = Math.floor(newMaxXp * 1.5);
                }
                return { ...p, level: newLevel, xp: newXp, maxXp: newMaxXp };
            }));
        }

        if (rewards.wonPet) {
            // Import INITIAL_PETS later if possible, or just generate a fresh low level pet
            const randomPets = [
                { id: `pet-${Date.now()}`, name: 'Cão Infernal', emoji: '🐕', level: 1, xp: 0, maxXp: 100, bonus: '+10% Dano Crítico' },
                { id: `pet-${Date.now()}`, name: 'Corvo Sombrio', emoji: '🐦‍⬛', level: 1, xp: 0, maxXp: 100, bonus: '+20% Poder Sombrio' },
                { id: `pet-${Date.now()}`, name: 'Espírito Ancestral', emoji: '👻', level: 1, xp: 0, maxXp: 100, bonus: '+5% Defesa Mágica' },
            ] as import('../engine/types').Pet[];
            const petDrop = randomPets[Math.floor(Math.random() * randomPets.length)];
            petsState.setPets(prev => [...prev, petDrop]);
            addLog(`VOCÊ ENCONTROU UM PET LENDÁRIO NA REIDE: ${petDrop.name}!`, 'achievement');
        }

        addLog(`Recompensas da Reide: ${formatNumber(rewards.gold)} Ouro, ${rewards.souls} Almas, ${rewards.guildXp} Guild XP, ${rewards.guildMembers} Novos Membros!`, 'achievement');
    });

    const activeHeroes = useMemo(() => (heroes || []).filter(h => h.assignment === 'combat' && h.unlocked), [heroes]);

    const prestigeAtkMult = useMemo(() => 1 + (prestigeNodes['atk_1'] || 0) * 0.1 + (prestigeNodes['atk_2'] || 0) * 0.05, [prestigeNodes]);
    const prestigeHpMult = useMemo(() => 1 + (prestigeNodes['hp_1'] || 0) * 0.1 + (prestigeNodes['hp_2'] || 0) * 0.1, [prestigeNodes]);
    const prestigeGoldMult = useMemo(() => 1 + (prestigeNodes['gold_1'] || 0) * 0.15 + (prestigeNodes['boss_1'] || 0) * 0.5, [prestigeNodes]);
    const prestigeXpMult = useMemo(() => 1 + (prestigeNodes['xp_1'] || 0) * 0.25, [prestigeNodes]);

    const galaxyBuffs = galaxyState.galaxyBuffs;

    const guildAtkMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['altar_war'] || 0) * 0.02) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'damage') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);
    const guildHpMult = useMemo(() => guildState.guild ? 1 + ((guildState.guild.monuments?.['fountain_life'] || 0) * 0.02) : 1, [guildState.guild]);
    const guildGoldMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['statue_midas'] || 0) * 0.05) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'gold') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);
    const guildXpMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['shrine_wisdom'] || 0) * 0.03) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'xp') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);

    const activeSynergies = useMemo(() => checkSynergies(activeHeroes.map(h => ({
        ...h, stats: { ...h.stats, attack: Math.floor(h.stats.attack * guildAtkMult * prestigeAtkMult * (1 + galaxyBuffs.damageMult)), maxHp: Math.floor(h.stats.maxHp * guildHpMult * prestigeHpMult), hp: Math.floor(h.stats.hp * guildHpMult * prestigeHpMult) }
    }))), [activeHeroes, guildAtkMult, guildHpMult, prestigeAtkMult, prestigeHpMult, galaxyBuffs.damageMult]);



    const petStats = useMemo(() => {
        return (petsState.pets || []).reduce((acc, p) => {
            acc.attack = (acc.attack || 0) + (p.stats?.attack || 0);
            acc.hp = (acc.hp || 0) + (p.stats?.maxHp || 0);
            acc.defense = (acc.defense || 0) + (p.stats?.defense || 0);
            acc.magic = (acc.magic || 0) + (p.stats?.magic || 0);
            return acc;
        }, { attack: 0, hp: 0, defense: 0, magic: 0 } as Record<string, number>);
    }, [petsState.pets]);

    const territoryAtkMult = useMemo(() => {
        return 1 + (galaxyState.territories || [])
            .filter(t => t.owner === 'player' && t.bonus.type === 'damage')
            .reduce((sum, t) => sum + t.bonus.value, 0);
    }, [galaxyState.territories]);

    const potionAtkMult = useMemo(() => {
        return 1 + activePotions
            .filter(p => p.effect === 'attack')
            .reduce((sum, p) => sum + p.value, 0);
    }, [activePotions]);

    const totalAtkMult = prestigeAtkMult * guildAtkMult * (1 + galaxyBuffs.damageMult) * territoryAtkMult * potionAtkMult;

    const isLeader = (guildState.guild?.totalContribution || 0) >= 10000;
    const armyMult = isLeader ? 1 + (guildState.guild?.members || 0) * 0.01 : 1;

    const calculatedPartyPower = useMemo(() => {
        if (!heroes) return 0;
        const baseStats = activeHeroes.reduce((sum, h) => {
            const hPower = (h.stats.attack || 0) + Math.floor((h.stats.maxHp || 0) / 10) + (h.stats.magic || 0) + (h.stats.defense || 0);
            return sum + (h.isDead ? hPower * 0.5 : hPower);
        }, 0);

        const petsPower = petStats.attack + Math.floor(petStats.hp / 10) + petStats.magic + petStats.defense;

        return Math.floor((baseStats + petsPower) * totalAtkMult * armyMult);
    }, [activeHeroes, petStats, totalAtkMult, armyMult]);

    const artifactMultipliers = useMemo(() => {
        const mults = { gold: 1, xp: 1, damage: 1, defense: 1, speed: 1 };
        artifacts.forEach(a => {
            if (a.unlocked && a.bonusType) {
                mults[a.bonusType] *= (1 + a.bonusValue);
            }
        });
        return mults;
    }, [artifacts]);

    // Sync calculated power to state for UI and other hooks
    useEffect(() => {
        setPartyPower(calculatedPartyPower);
    }, [calculatedPartyPower]);

    // REFS FOR LOOP STABILITY
    const stateRef = useRef({
        souls, talents, constellations, artifacts, cards, achievements,
        pets: petsState.pets, activeSynergies: activeSynergies as any[],
        boss, ultimateCharge, gold, gameSpeed,
        galaxyDamageMult: galaxyBuffs.damageMult,
        classMastery,
        artifactMultipliers
    });

    useEffect(() => {
        stateRef.current = {
            souls, talents, constellations, artifacts, cards, achievements,
            pets: petsState.pets, activeSynergies: activeSynergies as any[],
            boss, ultimateCharge, gold, gameSpeed,
            galaxyDamageMult: galaxyBuffs.damageMult,
            classMastery,
            artifactMultipliers
        };
    }, [souls, talents, constellations, artifacts, cards, achievements, petsState.pets, activeSynergies, boss, ultimateCharge, gold, gameSpeed, galaxyBuffs.damageMult, classMastery, artifactMultipliers]);

    // Side Effects
    useEffect(() => {
        const timer = setInterval(() => {
            const rewards = galaxyState.galaxyRewards;
            if (rewards) {
                if (rewards.gold > 0) setGold(g => g + rewards.gold);
                if (rewards.mithril > 0) setResources(r => ({ ...r, mithril: r.mithril + (rewards.mithril || 0) }));
                if (rewards.souls > 0) setSouls(s => s + rewards.souls);
                if (rewards.starlight > 0) setStarlight(s => s + rewards.starlight);
            }
        }, 10000);
        return () => clearInterval(timer);
    }, [galaxyState.galaxyRewards]);

    // FIX: Gerar oponentes da Arena automaticamente quando array está vazio
    useEffect(() => {
        if (arenaOpponents.length === 0) {
            const rank = arenaRank || 1000;
            const power = calculatedPartyPower || 100;
            setArenaOpponents(generateInitialArenaBoard(power, rank));
        }
    }, [arenaOpponents.length, arenaRank, calculatedPartyPower]);

    useEffect(() => {
        const dpsTimer = setInterval(() => {
            const now = Date.now();
            const timeDiff = (now - lastDpsUpdate.current) / 1000;
            if (timeDiff >= 1) {
                setPartyDps(Math.round(damageAccumulator.current / timeDiff));
                damageAccumulator.current = 0;
                lastDpsUpdate.current = now;
            }
        }, 1000);
        return () => clearInterval(dpsTimer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            world.setWeatherTimer((prev: number) => prev <= 1 ? 300 : prev - 1);
            setActiveEvent(prev => {
                if (!prev) return (Math.random() < 0.001) ? ('pending_generation' as any) : null;
                const remaining = prev.duration - 1;
                return remaining <= 0 ? null : { ...prev, duration: remaining };
            });

            if (raidActive) {
                setRaidTimer(prev => {
                    if (prev <= 1) {
                        setRaidActive(false);
                        // Raid rewards: scale with party power and boss level
                        const raidPower = calculatedPartyPower || 1;
                        const raidBossLevel = stateRef.current.boss.level || 1;
                        const goldReward = Math.floor(raidPower * 2.5 + raidBossLevel * 50);
                        const soulReward = Math.floor(raidBossLevel / 5) + 1;
                        const starReward = Math.floor(Math.random() * 3) + 1;
                        const dropItem = Math.random() < 0.4;
                        setGold(g => g + goldReward);
                        setSouls(s => s + soulReward);
                        setStarlight(sl => sl + starReward);
                        if (dropItem) {
                            const item = generateLoot(raidBossLevel);
                            setItems(inv => [...inv.slice(-199), item]);
                            addLog(`🏆 Reide Concluída! +${goldReward} Ouro, +${soulReward} Almas, +${starReward} ⭐ Luz Estelar, item encontrado: ${item.name}!`, 'achievement');
                        } else {
                            addLog(`🏆 Reide Concluída! +${goldReward} Ouro, +${soulReward} Almas, +${starReward} ⭐ Luz Estelar!`, 'achievement');
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }

            if (voidActive) {
                setVoidTimer(prev => {
                    if (prev <= 1) {
                        setVoidActive(false);
                        setVoidMatter(m => m + 1);
                        addLog("Distorção do Vazio dissipada! +1 Matéria do Vazio obtida.", "achievement");
                        return 0;
                    }
                    return prev - 1;
                });
            }

            if (world.dungeonActive) {
                world.setDungeonTimer(prev => {
                    if (prev <= 1) {
                        world.exitDungeon();
                        return 0;
                    }
                    return prev - 1;
                });
            }

            if (world.riftState.active) {
                world.setRiftTimer(prev => {
                    if (prev <= 1) {
                        world.exitRift(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }

            setMarketTimer(prev => prev > 0 ? prev - 1 : 0);

            if (worldBossState.worldBoss && !worldBossState.worldBoss.isDead) {
                const passiveDmg = Math.floor(calculatedPartyPower * 0.05);
                if (passiveDmg > 0) { /* Handled in sub-hook */ }
            }

            // Update play time
            setGameStats(prev => ({
                ...prev,
                playTime: (prev.playTime || 0) + 1
            }));

            // Phase 100: Market Trend Rotation
            setMarketTrend(prev => {
                if (Date.now() >= prev.endTime) {
                    const nextTrend = generateRandomTrend(60);
                    addLog(`Economia da Cidade mudou para: ${nextTrend.name}!`, 'action');
                    return nextTrend;
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [raidActive, voidActive, calculatedPartyPower]);


    const ACTIONS: GameActions = useMemo(() => {
        const baseActions = {
            toggleSound: () => setIsSoundOn(p => !p),
            setGameSpeed: (s: number) => setGameSpeed(s),
            spendStatPoint: (id: string, s: keyof Stats) => setHeroes(p => p.map(h => h.id === id && h.statPoints > 0 ? { ...h, statPoints: h.statPoints - 1, stats: { ...h.stats, [s]: (h.stats[s] || 0) + 1 } } : h)),
            recruitHero: (id: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, unlocked: true } : h)),
            buyHero: (id: string) => {
                const h = heroes.find(x => x.id === id);
                const cost = 5000; // Fixed cost for direct recruitment
                if (h && !h.unlocked && gold >= cost) {
                    setGold(g => g - cost);
                    setHeroes(p => p.map(curr => curr.id === id ? { ...curr, unlocked: true } : curr));
                    addLog(`Recrutou ${h.name} diretamente!`, 'success');
                } else if (gold < cost) {
                    addLog(`Ouro insuficiente para recrutar ${h?.name || 'herói'}. Precisa de ${cost}.`, 'error');
                }
            },
            evolveHero: (id: string) => {
                const h = heroes.find(x => x.id === id);
                if (h && h.level >= 50) setHeroes(p => p.map(curr => curr.id === id ? { ...curr, class: (PRESTIGE_CLASSES as any)[h.class] || h.class, level: 1 } : curr));
            },
            toggleAssignment: (id: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, assignment: h.assignment === 'combat' ? 'none' : 'combat' } : h)),
            purifyHero: (id: string) => { if (gold >= 1000) { setGold(g => g - 1000); setHeroes(p => p.map(h => h.id === id ? { ...h, insanity: 0 } : h)); addLog("Hero purified!", "success"); } },
            reviveHero: (id: string) => { if (gold >= 5000) { setGold(g => g - 5000); setHeroes(p => p.map(h => h.id === id ? { ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp * 0.5 } } : h)); addLog("Hero revived!", "success"); } },
            renameHero: (id: string, name: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, name } : h)),
            changeHeroEmoji: (id: string, e: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, emoji: e } : h)),
            buyTalent: (id: string, _a?: number) => setTalents(p => p.map(t => (t.id === id && souls >= t.cost) ? (setSouls(s => s - t.cost), { ...t, level: t.level + 1, cost: Math.floor(t.cost * t.costScaling) }) : t)),
            buyConstellation: (id: string) => {
                const node = constellations.find(c => c.id === id);
                if (node && divinity >= node.cost && node.level < node.maxLevel) {
                    setDivinity(d => d - node.cost);
                    setConstellations(p => p.map(c => c.id === id ? { ...c, level: c.level + 1 } : c));
                    addLog(`Benção Celestial: ${node.name} Nvl ${node.level + 1}!`, 'success');
                }
            },
            unlockArtifact: (id: string) => {
                setArtifacts(prev => prev.map(a => a.id === id ? { ...a, unlocked: true } : a));
                const art = RARE_ARTIFACTS.find(a => a.id === id);
                if (art) addLog(`Relíquia Descoberta: ${art.name}!`, 'achievement');
            },
            buyClassTalent: (className: HeroClass, talentId: string) => {
                const mastery = classMastery[className];
                const talents = CLASS_TALENTS[className] || [];
                const talent = talents.find(t => t.id === talentId);

                if (mastery && talent && mastery.points >= talent.pointsCost && !mastery.unlockedTalents.includes(talentId)) {
                    setClassMastery(prev => ({
                        ...prev,
                        [className]: {
                            ...mastery,
                            points: mastery.points - talent.pointsCost,
                            unlockedTalents: [...mastery.unlockedTalents, talentId]
                        }
                    }));
                    addLog(`Talento Desbloqueado: ${talent.name}!`, 'success');
                }
            },
            buyStarlightUpgrade: (id: string) => {
                const u = STARLIGHT_UPGRADES.find(x => x.id === id); if (!u) return;
                const cost = getStarlightUpgradeCost(u, starlightUpgrades[id] || 0);
                if (starlight >= cost) { setStarlight(s => s - cost); setStarlightUpgrades(p => ({ ...p, [id]: (p[id] || 0) + 1 })); }
            },
            enterTower: () => {
                const wasActive = world.tower.active;
                const currentFloor = world.tower.floor || 1;

                // Persistence FIX: Don't reset floor to 1 if we're entering.
                // If exiting, keep the floor. If entering, keep the floor.
                world.setTower(p => ({ ...p, active: !p.active }));

                if (!wasActive) {
                    addLog(`Entrou na Torre da Eternidade! (Andar ${currentFloor})`, "danger");
                    soundManager.playHit();
                    // Ensure the tower boss is ready for this floor
                    const tBoss = getNextBoss(currentFloor);
                    world.setTowerBoss({ ...tBoss, id: `tower-${currentFloor}` });
                } else {
                    addLog("Recuou da Torre.", "info");
                }
            },
            triggerRebirth: () => {
                const currentLevel = boss.level;
                const soulsGained = Math.floor(currentLevel / 5) * (1 + (prestigeNodes['souls_1'] || 0) * 0.2);
                setPortalConfig({
                    title: "PORTAL DE ASCENSÃO",
                    message: "Um portal de pura energia celestial se abre diante de você.",
                    warning: "O Ouro e o progresso do Boss serão reiniciados, mas você ganhará Almas Celestiais.",
                    soulsGained,
                    onConfirm: ACTIONS.confirmRebirth
                });
            },
            confirmRebirth: () => {
                const soulsGained = Math.floor(boss.level / 5) * (1 + (prestigeNodes['souls_1'] || 0) * 0.2);
                setSouls(s => s + soulsGained);
                setHeroes(INITIAL_HEROES.map(h => ({ ...h, level: 1 + (prestigeNodes['legend_1'] || 0) * 2 })));
                setGold(0);
                setBoss(INITIAL_BOSS);
                setItems([]);
                setPortalConfig(null);
                addLog(`Ascensão Concluída! Você obteve ${soulsGained} Almas Celestiais.`, 'achievement');
                soundManager.playLevelUp();
            },
            buyPrestigeNode: (nodeId: string) => {
                const node = PRESTIGE_NODES.find((n: any) => n.id === nodeId);
                const currentLevel = prestigeNodes[nodeId] || 0;
                if (node && currentLevel < node.maxLevel) {
                    const cost = getPrestigeNodeCost(node, currentLevel);
                    if (souls >= cost) {
                        setSouls(s => s - cost);
                        setPrestigeNodes(p => ({ ...p, [nodeId]: currentLevel + 1 }));
                        addLog(`Poder Desbloqueado: ${node.name} Lv${currentLevel + 1}!`, 'success');
                    }
                }
            },
            visitTown: () => {
                setTownVisited(true);
                setTown(t => ({ ...t, prosperity: t.prosperity + 1 }));
            },
            prestigeTower: () => {
                if (world.tower.maxFloor >= 20) {
                    const gain = Math.floor(world.tower.maxFloor / 10);
                    setPortalConfig({
                        title: "ASCENSÃO DA TORRE",
                        message: "A energia da torre converge para um novo começo.",
                        rewardText: `${gain} Luz Estelar`,
                        onConfirm: () => {
                            setStarlight(s => s + gain);
                            world.setTower({ floor: 1, maxFloor: world.tower.maxFloor, active: false });
                            addLog(`Tower Ascended! Gained ${gain} Starlight.`, "achievement");
                            soundManager.playLevelUp();
                            setPortalConfig(null);
                        }
                    });
                }
            },
            enterDungeon: (lvl: number) => world.enterDungeon(lvl),
            descendDungeon: () => world.descendDungeon(),
            exitDungeon: () => world.exitDungeon(),
            moveDungeon: (x: number, y: number): DungeonInteraction | null => world.moveDungeon(x, y),
            handleDungeonEvent: (e: DungeonInteraction) => {
                if (e.type === 'chest') { setGold(old => old + Math.floor(100 * e.level)); if (Math.random() < 0.3) setItems(p => [...p, generateLoot(e.level)]); }
            },
            toggleRaid: () => {
                if (!raidActive) {
                    setRaidTimer(60);
                    addLog("Uma Reide começou!", "danger");
                }
                setRaidActive(p => !p);
            },
            fightArena: (opponent: ArenaOpponent) => {
                const winChance = calculateWinChance(calculatedPartyPower, opponent.power);
                const won = winChance > Math.random();
                if (won) {
                    setArenaRank(r => Math.max(1, r - 20));
                    const gloryGain = 10 + Math.floor(opponent.power / 50);
                    setGlory(g => g + gloryGain);
                    const goldReward = Math.floor(50 + opponent.power * 0.5);
                    setGold(g => g + goldReward);

                    // Defeated fighter always joins guild (or waits in queue)
                    const isLeader = guildState.guild && (guildState.guild.totalContribution || 0) >= 10000;
                    if (isLeader) {
                        guildState.setGuild((g: any) => g ? { ...g, xp: Math.min(g.xp + 500, g.maxXp), members: g.members + 1 } : g);
                        addLog(`⚔️ ${opponent.name} foi derrotado e juntou-se à sua Guilda! +500 XP. +${gloryGain} Glória, +${goldReward} Ouro.`, 'achievement');
                    } else {
                        setGuildQueue(q => [...q, { name: opponent.name, emoji: opponent.avatar, power: opponent.power }]);
                        addLog(`⚔️ ${opponent.name} aguarda na Fila de Recrutas até você virar Líder! +${gloryGain} Glória, +${goldReward} Ouro.`, 'achievement');
                    }

                    // Grow remaining opponents + spawn replacement
                    const replacement = spawnReplacementOpponent(calculatedPartyPower, arenaRank, opponent.power);
                    setArenaOpponents(prev => [...applyVictoryGrowth(prev, opponent.id), replacement]);

                } else {
                    setArenaRank(r => Math.min(9999, r + 5));
                    addLog(`Derrota na Arena contra ${opponent.name}... Continue treinando!`, 'danger');
                    setArenaOpponents(prev => prev.map(op =>
                        op.id !== opponent.id ? { ...op, power: Math.floor(op.power * 0.95) } : op
                    ));
                }
            },
            attackSector: (id: string) => galaxyState.attackSector(id),
            attackTerritory: (id: string) => galaxyState.attackTerritory(id),
            upgradeTerritory: (id: string) => {
                const t = galaxyState.territories.find((t: any) => t.id === id);
                if (!t || t.owner !== 'player') return;
                const cost = t.upgradeCost || 5000;
                if (gold < cost) { addLog(`Ouro insuficiente! Precisa de ${cost} para melhorar ${t.name}.`, 'info'); return; }
                setGold(g => g - cost);
                galaxyState.setTerritories((prev: any[]) => prev.map((ter: any) =>
                    ter.id === id ? applyTerritoryUpgrade(ter) : ter
                ));
                addLog(`✨ ${t.name} melhorado para Nível ${(t.level || 1) + 1}! Bônus aumentado.`, 'success');
            },
            unlockOuterSpace: () => {
                setOuterSpaceUnlocked(true);
                addLog("O Espaço Externo foi desbloqueado! Galáxia e Forja Estelar agora estão disponíveis.", "achievement");
                soundManager.playLevelUp();
            },
            breedPets: (p1: Pet, p2: Pet) => petsState.breedPets(p1, p2),
            feedPet: (type: 'gold' | 'souls', id?: string) => petsState.feedPet(type, id),
            winCardBattle: (_o: string, d: number) => setGold(g => g + d * 10),
            forgeUpgrade: (m: 'copper' | 'iron' | 'mithril') => addLog(`Upgraded Forge with ${m}`, 'craft'),
            craftStarForgedItem: (item: Item, gCost: number, fCost: number) => {
                if (gold >= gCost && resources.starFragments >= fCost) {
                    setGold(g => g - gCost); setResources(r => ({ ...r, starFragments: r.starFragments - fCost }));
                    setItems(p => [...p, item]); addLog(`Forged ${item.name}!`, 'achievement');
                }
            },
            joinGuild: (name: string) => guildState.joinGuild(name),
            contributeGuild: (amt: number) => guildState.contributeGuild(amt),
            summonTavernLine: (amount: number) => {
                const res = simulateTavernSummon(amount, gold, gameStats.tavernPurchases || 0, heroes, artifacts, petsState.pets, 1, gameStats.heroPity || 0, gameStats.petPity || 0);
                if (res.success) {
                    setGold(g => g - res.cost);
                    setGameStats(s => ({
                        ...s,
                        tavernPurchases: (s.tavernPurchases || 0) + amount,
                        heroPity: res.nextHeroPity,
                        petPity: res.nextPetPity
                    }));
                    setHeroes(p => [...p.map(h => res.unlockedHeroIds.includes(h.id) ? { ...h, unlocked: true } : h), ...res.newHeroes]);
                    if (res.pendingPets.length > 0) {
                        petsState.setPets(prev => [...prev, ...res.pendingPets]);
                    }
                    res.logs.forEach(l => addLog(l, 'info'));
                } else {
                    addLog(res.logs[0], 'error');
                }
            },
            upgradeBuilding: (id: string) => {
                const b = buildings.find(x => x.id === id); if (!b || gold < b.cost) return;
                setGold(g => g - b.cost); setBuildings(p => p.map(x => x.id === id ? { ...x, level: x.level + 1, cost: Math.floor(x.cost * x.costScaling) } : x));
            },
            upgradeSpaceship: (part: keyof import('../engine/types').Spaceship['parts']) => galaxyState.upgradeSpaceship(part),
            claimLoginReward: () => {
                const r = LOGIN_REWARDS.find(x => x.day === (gameStats.loginStreak || 1)) || LOGIN_REWARDS[0];
                if (r.type === 'gold') setGold(g => g + r.amount); setDailyLoginClaimed(true);
            },
            claimDailyQuest: (id: string) => setQuests(p => p.map(q => q.id === id && q.progress >= q.target ? { ...q, isClaimed: true } : q)),
            checkDailies: () => { if (checkDailyReset(lastDailyReset)) { setLastDailyReset(Date.now()); setDailyQuests(generateDailyQuests()); setDailyLoginClaimed(false); } },
            enterVoid: () => {
                if (!voidActive) {
                    setVoidActive(true);
                    setVoidTimer(30);
                    addLog("Você mergulhou na Dimensão do Vazio...", "danger");
                }
            },
            triggerAscension: () => {
                if (souls >= 1000) {
                    setPortalConfig({
                        title: "ASCENSÃO DIVINA",
                        message: "Seu poder acumulado transcende a mortalidade.",
                        rewardText: "+1 Divindade",
                        onConfirm: () => {
                            setSouls(s => s - 1000);
                            setDivinity(d => d + 1);
                            setVoidAscensions(a => a + 1);
                            addLog("Ascensão bem-sucedida! Você ganhou 1 de Divindade.", "achievement");
                            soundManager.playLevelUp();
                            setPortalConfig(null);
                        }
                    });
                } else {
                    addLog("Almas insuficientes para ascender.", "error");
                }
            },
            buyDarkGift: (cost: number, _e: string) => { if (voidMatter >= cost) setVoidMatter(v => v - cost); },
            ascendToVoid: () => setVoidActive(true),
            transmuteResources: (from: keyof Resources, to: keyof Resources, amount: number) => {
                const res = transmuteResources(from, to, amount, resources);
                if (res.success) {
                    setResources(r => {
                        const next = { ...r };
                        if (res.cost && from in res.cost) {
                            (next as any)[from] -= (res.cost[from] || 0);
                        }
                        if (res.gain && to in res.gain) {
                            (next as any)[to] += (res.gain[to] || 0);
                        }
                        return next;
                    });
                    addLog(`Transmutação concluída: ${amount} ${to} obtidos!`, 'success');
                } else {
                    addLog(res.error || "Transmutação falhou", 'error');
                }
            },
            useElixir: (heroId: string) => {
                const elixir = ELIXIRS.ELIXIR_OF_ETERNITY;
                const hero = heroes.find(h => h.id === heroId);
                const hasResources = elixir.cost.every(c => (resources[c.type as keyof Resources] || 0) >= c.amount);

                if (hero && hasResources) {
                    setResources(r => {
                        const next = { ...r };
                        elixir.cost.forEach(c => (next as any)[c.type] -= c.amount);
                        return next;
                    });
                    setHeroes(p => p.map(h => h.id === heroId ? {
                        ...h,
                        stats: { ...h.stats, [elixir.stat]: h.stats[elixir.stat] + elixir.value }
                    } : h));
                    addLog(`${hero.name} consumiu o Elixir da Eternidade! +${elixir.value} ${elixir.stat}`, 'success');
                } else {
                    addLog("Recursos insuficientes para o Elixir!", 'error');
                }
            },
            toggleAutomation: (type: keyof GameStats['automationActive']) => {
                setGameStats(prev => ({
                    ...prev,
                    automationActive: {
                        ...prev.automationActive,
                        [type]: !prev.automationActive[type]
                    }
                }));
            },
            manualFish: () => {
                const res = processFishingAdvanced(1, (achievements.find(a => a.id === 'fi1')?.isUnlocked ? 0.1 : 0));
                if (res.fish > 0) setResources(r => ({ ...r, fish: r.fish + res.fish }));
                if (res.legendary) {
                    setGameStats(s => ({ ...s, legendaryFishCount: (s.legendaryFishCount || 0) + 1 }));
                    addLog("🎣 Você pescou um PEIXE LENDÁRIO!", "achievement");
                }
            },
            brewPotion: (id: string) => {
                const pot = POTIONS.find(p => p.id === id); if (pot && brewPotion(pot, resources).success) {
                    setResources(r => { const n = { ...r }; (pot.cost as any[]).forEach(c => (n as any)[c.type] -= c.amount); return n; });
                    setActivePotions(p => [...p, { id: pot.id, name: pot.name, effect: pot.effect, value: pot.value, endTime: Date.now() + pot.duration * 1000 }]);
                }
            },
            startExpedition: (e: Expedition) => { setHeroes(startExpedition(e, heroes)); setActiveExpeditions(p => [...p, e]); },
            startGuildExpedition: (e: Expedition) => {
                if (validateGuildExpeditionTeam(e.heroIds, heroes)) {
                    setHeroes(startExpedition(e, heroes));
                    setActiveExpeditions(p => [...p, { ...e, startTime: Date.now() }]);
                    addLog(`Expedição de Guilda ${e.name} iniciada!`, 'success');
                } else {
                    addLog("Falha ao iniciar expedição: heróis ocupados ou inválidos.", "error");
                }
            },
            startVoidChallenge: () => voidGuardian.startChallenge(),
            setTheme: (t: string) => setTheme(t),
            setAutoSellRarity: (r: 'none' | 'common' | 'rare') => setAutoSellRarity(r),
            resetSave: () => { localStorage.clear(); window.location.reload(); },
            exportSave: () => btoa(localStorage.getItem('rpg_eternal_save_v6') || ''),
            importSave: (s: string) => { try { localStorage.setItem('rpg_eternal_save_v6', atob(s)); window.location.reload(); } catch { alert("Invalid"); } },
            closeOfflineModal: () => setOfflineGains(null),
            claimQuest: (id: string) => setQuests(p => p.map(q => q.id === id && q.progress >= q.target ? { ...q, isClaimed: true } : q)),
            buyMarketItem: (item: MarketItem) => { if (gold >= item.cost) { setGold(g => g - item.cost); setMarketStock(p => p.filter(i => i.id !== item.id)); } },
            enterRift: (rift: Rift) => world.enterRift(rift), exitRift: (s: boolean) => world.exitRift(s), startRift: () => world.startRift(), selectBlessing: (b: RiftBlessing) => world.selectBlessing(b),
            saveFormation: (n: string) => world.saveFormation(n, activeHeroes.map(h => h.id)), loadFormation: (f: any) => world.loadFormation(f.id), deleteFormation: (id: string) => world.deleteFormation(id),
            upgradeMonument: (id: string) => guildState.upgradeMonument(id),

            attackWorldBoss: () => worldBossState.attackWorldBoss(), claimWorldBossReward: () => worldBossState.claimReward(),
            challengeVoidCore: () => { if (voidMatter >= 10) addLog("Challenging Void Core...", "danger"); },
            setVictory: (v: boolean) => setVictory(v),
            interactWithEvent: (id: string, action: 'buy' | 'defend' | 'join', data?: any) => { if (activeEvent?.id === id && action === 'buy') setGold(g => g - (data?.item?.value || 0)); },
            dismissEvent: () => setActiveEvent(null),
            buyMasteryUpgrade: (type: keyof import('../engine/types').DungeonMastery) => {
                const cost = (dungeonMastery[type] + 1) * 1000;
                if (souls >= cost) { setSouls(s => s - cost); setDungeonMastery(prev => ({ ...prev, [type]: prev[type] + 1 })); }
            },
            assignHero: (id: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, assignment: h.assignment === 'combat' ? 'none' : 'combat' } : h)),
            manualAttack: () => {
                const dmg = Math.max(1, Math.floor(calculatedPartyPower * 0.05)); // 5% of party power per click
                
                // Track click stat
                setGameStats(s => ({ ...s, clicks: (s.clicks || 0) + 1, totalDamageDealt: (s.totalDamageDealt || 0) + dmg }));
                
                // Deal damage (will be processed on next tick or instantly depending on HP)
                if (world.tower.active) {
                    world.setTowerBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - dmg } }));
                } else {
                    setBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - dmg } }));
                }
                
                // Visual feedback sound (optional)
                // soundManager.playHit();
            },
            collectRelic: (relic: AncientRelic) => {
                setTown(prev => {
                    const existing = prev.relics.find(r => r.id === relic.id);
                    let newRelics;
                    if (existing) {
                        newRelics = prev.relics.map(r => r.id === relic.id ? { ...r, count: (r.count || 0) + 1 } : r);
                    } else {
                        newRelics = [...prev.relics, { ...relic, count: 1 }];
                    }
                    return { ...prev, relics: newRelics, prosperity: prev.prosperity + 10 };
                });
                addLog(`Relíquia Antiga instalada: ${relic.name}!`, 'success');
            }
        };
        return baseActions as GameActions;
    }, [buildings, gold, items, heroes, souls, resources, divinity, activeEvent, starlight, starlightUpgrades, partyPower, artifacts, petsState, guildState, galaxyState, gameStats, activeHeroes, boss.level, lastDailyReset, voidMatter, voidActive, voidTimer, world, worldBossState, dungeonMastery, classMastery, town, marketTrend]);

    // CORE LOOP (STABILIZED - Phase Memory Fix)
    useEffect(() => {
        const runTick = () => {
            const { souls, talents, constellations, artifacts, cards, achievements, pets, activeSynergies, boss, ultimateCharge, gold, gameSpeed, galaxyDamageMult, artifactMultipliers } = stateRef.current;
            if (activeHeroes.length === 0 && !world.tower.active) return;

            const isTower = world.tower.active;
            let targetBoss = isTower ? world.towerBoss : boss;

            // VOID BOSS EMOJI FIX
            if (voidActive && !isTower) {
                targetBoss = {
                    ...targetBoss,
                    name: "Entidade Galáctica",
                    emoji: "🌌"
                };
            }

            const tick = Math.max(100, (1000 / gameSpeed) * (1 - (activeSynergies || []).filter(s => s.type === 'attackSpeed').reduce((acc, s) => acc + s.value, 0)));

            if (shouldSummonTavern(gold, starlightUpgrades)) ACTIONS.summonTavernLine(1);

            const totalDmgMult = calculateDamageMultiplier(souls, talents, constellations, artifacts, targetBoss, cards, achievements, pets, galaxyDamageMult) * artifactMultipliers.damage;
            const res = processCombatTurn(activeHeroes, targetBoss, totalDmgMult, 0.1, ultimateCharge >= 100, pets, tick, 1, activeSynergies);

            damageAccumulator.current += res.totalDmg;

            if (res.events && res.events.length > 0) {
                setCombatEvents(prev => [...prev, ...res.events].slice(-5));
            }

            const petDpsBonus = (pets || []).reduce((sum, pet) => sum + (pet.level * 5), 0);
            if (petDpsBonus > 0) damageAccumulator.current += petDpsBonus * (tick / 1000);

            if (ultimateCharge >= 100) setUltimateCharge(0);
            else setUltimateCharge(p => Math.min(100, p + 5));

            let bossDefeated = false;
            let currentBoss = { ...targetBoss };

            // Apply Galaxy Gold/XP Buffs to the gains
            const townHallLevel = buildings.find(b => b.id === 'town_hall')?.level || 0;
            const townHallGoldMult = 1 + (townHallLevel * 0.05); // 5% per level

            const finalGoldMult = guildGoldMult * prestigeGoldMult * (1 + (galaxyState.galaxyBuffs.goldMult || 0)) * townHallGoldMult;
            const finalXpMult = guildXpMult * prestigeXpMult * (1 + (galaxyState.galaxyBuffs.xpMult || 0));

            if (res.totalDmg >= currentBoss.stats.hp) {
                bossDefeated = true;
                const xpGain = Math.floor(currentBoss.level * 10 * finalXpMult);
                const goldGain = Math.floor(currentBoss.level * 50 * finalGoldMult);

                setGold(g => g + goldGain);
                setGameStats(s => ({
                    ...s,
                    bossKills: (s.bossKills || 0) + 1,
                    totalKills: (s.totalKills || 0) + 1,
                    totalGoldEarned: (s.totalGoldEarned || 0) + goldGain
                }));

                setMonsterKills(prev => ({ ...prev, [currentBoss.name]: (prev[currentBoss.name] || 0) + 1 }));

                // Increase variety and level
                const nextLevel = currentBoss.level + 1;
                const nextBossData = getNextBoss(nextLevel);

                if (isTower) {
                    world.setTower(p => ({ ...p, floor: p.floor + 1, maxFloor: Math.max(p.maxFloor, p.floor + 1) }));
                    world.setTowerBoss({ ...nextBossData, id: `tower-${nextLevel}` });
                    addLog(`Torre Andar ${world.tower.floor} Concluído! Heróis ganharam ${xpGain} XP. Próximo: ${nextBossData.name}`, 'success');
                } else {
                    setBoss(p => ({ ...p, ...nextBossData }));
                    addLog(`Boss ${currentBoss.name} Derrotado! Heróis ganharam ${xpGain} XP. Próximo: ${nextBossData.name}`, 'success');
                }

                // Award Class Mastery XP
                const combatClasses = new Set(activeHeroes.filter(h => !h.isDead).map(h => h.class));
                combatClasses.forEach(cls => {
                    const masteryXP = Math.floor(currentBoss.level * 2);
                    setClassMastery(prev => {
                        const m = prev[cls] || { level: 1, xp: 0, maxXp: 100, points: 0, unlockedTalents: [] };
                        let newXP = m.xp + masteryXP;
                        let newLvl = m.level;
                        let newMaxXP = m.maxXp;
                        let newPoints = m.points;

                        while (newXP >= newMaxXP) {
                            newXP -= newMaxXP;
                            newLvl++;
                            newMaxXP = Math.floor(newMaxXP * 1.5);
                            newPoints++;
                            addLog(`Maestria de ${cls} subiu para o Nível ${newLvl}! +1 Ponto de Talento.`, 'achievement');
                        }

                        return { ...prev, [cls]: { ...m, level: newLvl, xp: newXP, maxXp: newMaxXP, points: newPoints } };
                    });
                });
            } else {
                if (isTower) {
                    world.setTowerBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - res.totalDmg } }));
                } else {
                    setBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - res.totalDmg } }));
                }
            }

            // Passive Raid Contribution (1% of total DMG)
            if (res.totalDmg > 0 && worldBossState.worldBoss && !worldBossState.worldBoss.isDead) {
                const passiveContribution = Math.floor(res.totalDmg * 0.01);
                if (passiveContribution > 0) {
                    worldBossState.attackWorldBoss(passiveContribution);
                }
            }

            if (bossDefeated && Math.random() < 0.4) {
                const lootItem = generateLoot(currentBoss.level);
                setItems(prev => {
                    const newItems = [...prev, lootItem];
                    if (newItems.length > MAX_INVENTORY_SIZE) {
                        const sorted = [...newItems].sort((a, b) => a.value - b.value);
                        const excess = newItems.length - MAX_INVENTORY_SIZE;
                        const soldValue = sorted.slice(0, excess).reduce((sum, i) => sum + Math.floor(i.value * 0.3), 0);
                        if (soldValue > 0) setGold(g => g + soldValue);
                        return sorted.slice(excess);
                    }
                    return newItems;
                });
            }

            setHeroes(prev => {
                const miners = (prev || []).filter(h => h.assignment === 'mine');
                const mYield = processMining(miners);
                if (mYield && ((mYield.copper || 0) > 0 || (mYield.iron || 0) > 0 || (mYield.mithril || 0) > 0)) {
                    setResources(r => ({ ...r, copper: r.copper + (mYield.copper || 0), iron: r.iron + (mYield.iron || 0), mithril: r.mithril + (mYield.mithril || 0) }));
                }

                let changed = false;
                const nextHeroes = prev.map(oldHero => {
                    const combatHero = res.updatedHeroes.find(h => h.id === oldHero.id);
                    let h = combatHero || oldHero;
                    const now = Date.now();

                    // Track deathTime for newly dead heroes
                    if (h.isDead && !oldHero.isDead) {
                        h = { ...h, deathTime: now };
                    }

                    // Auto-revive logic: 10 seconds (10000ms)
                    if (h.isDead && h.deathTime && now - h.deathTime >= 10000) {
                        h = { ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp }, deathTime: undefined };
                        addLog(`${h.name} ressurgiu e voltou ao combate!`, 'success');
                    }

                    if (bossDefeated && combatHero && !h.isDead) {
                        const xpGain = Math.floor(currentBoss.level * 10 * finalXpMult);
                        let newXp = (h.xp || 0) + xpGain;
                        let newLevel = h.level || 1;
                        let newMaxXp = h.maxXp || 100;
                        let currentStatPoints = h.statPoints || 0;

                        while (newXp >= newMaxXp) {
                            newLevel++;
                            newXp -= newMaxXp;
                            newMaxXp = Math.floor(newMaxXp * 1.5);
                            currentStatPoints += 5;
                        }
                        if (newLevel !== h.level || newXp !== h.xp) {
                            h = { ...h, xp: newXp, level: newLevel, maxXp: newMaxXp, statPoints: currentStatPoints };
                        }
                    }

                    const fatigueDelta = h.assignment === 'combat' ? 0.1 : -1;
                    const prevFatigue = h.fatigue || 0;
                    const newFatigue = Math.max(0, Math.min(100, prevFatigue + fatigueDelta));
                    
                    if (newFatigue !== prevFatigue) {
                        h = { ...h, fatigue: newFatigue };
                    }

                    if (h !== oldHero) changed = true;
                    return h;
                });

                return changed ? nextHeroes : prev;
            });

            // Global Automation Processing
            const autoResult = processGlobalAutomation(gameStats, resources, activeExpeditions);
            if (autoResult.resources && Object.values(autoResult.resources).some(v => v > 0)) {
                setResources(prev => {
                    const next = { ...prev };
                    Object.entries(autoResult.resources).forEach(([k, v]) => (next as any)[k] += v);
                    return next;
                });
            }
            
            // Collect all stats updates including combat damage
            const statsDelta = (Object.keys(autoResult.stats).length > 0) || (res.totalDmg > 0);
            if (statsDelta) {
                setGameStats(prev => {
                    let nextStats = { ...prev };
                    if (Object.keys(autoResult.stats).length > 0) {
                        nextStats = { ...nextStats, ...autoResult.stats };
                    }
                    
                    // Track damage if we're attacking
                    if (res.totalDmg > 0) {
                        nextStats.totalDamageDealt = (nextStats.totalDamageDealt || 0) + res.totalDmg;
                    }
                    
                    return nextStats;
                });
            }

            // Re-schedule
            loopRef.current = setTimeout(runTick, tick);
        };

        const loopRef = { current: setTimeout(runTick, 1000) };
        return () => clearTimeout(loopRef.current);
    }, [activeHeroes.length, starlightUpgrades, world.tower.active, guildXpMult, guildGoldMult, prestigeXpMult, prestigeGoldMult]); // Reduced deps

    usePersistence({
        heroes, setHeroes, boss, setBoss, towerBoss: world.towerBoss, setTowerBoss: world.setTowerBoss, items, setItems, souls, setSouls, gold, setGold, divinity, setDivinity,
        pets: petsState.pets, setPets: petsState.setPets, talents, setTalents, artifacts, setArtifacts, cards, setCards,
        constellations, setConstellations, keys, setKeys, resources, setResources, tower: world.tower, setTower: world.setTower,
        guild: guildState.guild, setGuild: guildState.setGuild, voidMatter, setVoidMatter, arenaRank, setArenaRank, glory, setGlory,
        quests, setQuests, runes, setRunes, achievements, setAchievements, starlight, setStarlight, starlightUpgrades, setStarlightUpgrades,
        autoSellRarity, setAutoSellRarity, theme, setTheme, galaxy: galaxyState.galaxy, setGalaxy: galaxyState.setGalaxy,
        monsterKills, setMonsterKills, gameStats, setGameStats, activeExpeditions, setActiveExpeditions, activePotions, setActivePotions,
        buildings, setBuildings, dailyQuests, setDailyQuests, dailyLoginClaimed, setDailyLoginClaimed, lastDailyReset, setLastDailyReset,
        territories: galaxyState.territories, setTerritories: galaxyState.setTerritories, spaceship: galaxyState.spaceship, setSpaceship: galaxyState.setSpaceship,
        weather: world.weather, setWeather: world.setWeather, formations: world.formations, setFormations: world.setFormations,
        outerSpaceUnlocked, setOuterSpaceUnlocked,
        prestigeNodes, setPrestigeNodes,
        arenaOpponents, setVisible: () => { }, arenaStatus: '', setArenaOpponents, setRaidActive, setDungeonActive: world.setDungeonActive, setOfflineGains
    } as any);

    const result = useMemo(() => {
        const setUIState = { setVictory, setMarketTimer, setRaidTimer, setVoidActive, setVoidTimer, setIsStarlightModalOpen, setPartyPower, setCombatEvents, setGameSpeed, setTheme, setIsSoundOn, setShowCampfire, setResources, setGold, setSouls, setHeroes, setItems, setDungeonMastery, setGardenPlots, setDivinity, setStarlight, setAchievements, setBuildings, setOuterSpaceUnlocked, setRunes };
        return {
            gold, souls, divinity, starlight, heroes, items, inventory: items, runes,
            dungeonMastery, gardenPlots, lastDailyReset, dailyLoginClaimed, dailyQuests, gameStats,
            guild: guildState.guild, activeHeroes, partyPower, partyDps, activeEvent,
            victory, boss, resources, starlightUpgrades, achievements, combatEvents,
            logs, isSoundOn, voidAscensions, offlineGains, marketStock, marketTimer, raidActive,
            raidTimer, voidActive, voidTimer, isStarlightModalOpen, cards, constellations, keys,
            monsterKills, activeExpeditions, activePotions, ultimateCharge, voidMatter, showCampfire,
            outerSpaceUnlocked, prestigeNodes, townVisited, portalConfig, guildQueue,
            arenaRank, glory, quests, theme, autoSellRarity, arenaOpponents,


            // App.tsx State
            gameSpeed, pets: petsState.pets, artifacts, talents, classMastery,
            dungeonActive: world.dungeonActive,
            dungeonTimer: world.dungeonTimer,
            tower: world.tower,
            dungeonState: world.dungeonState,
            weather: world.weather,
            weatherTimer: world.weatherTimer,
            activeRift: world.activeRift,
            riftTimer: world.riftTimer,
            riftState: world.riftState,
            formations: world.formations,
            spaceship: galaxyState.spaceship,
            territories: galaxyState.territories,
            galaxy: galaxyState.galaxy,
            synergies: activeSynergies,
            buildings,

            voidGuardian,
            actions: ACTIONS,
            // Root actions for legacy compatibility
            ...ACTIONS,
            ...setUIState,
            setPortalConfig,
            ascendToVoid: ACTIONS.ascendToVoid,
            worldBoss: worldBossState.worldBoss, worldBossDamage: worldBossState.personalDamage, worldBossCanClaim: worldBossState.canClaim,
            guildXpMult,
            setGameStats
        };
    }, [gold, souls, divinity, starlight, heroes, items, dungeonMastery, gardenPlots, lastDailyReset, dailyLoginClaimed, dailyQuests, gameStats, world, guildState.guild, activeHeroes, partyPower, partyDps, activeEvent, victory, boss, resources, starlightUpgrades, talents, achievements, combatEvents, logs, isSoundOn, offlineGains, marketStock, marketTimer, raidActive,
        raidTimer, voidActive, voidTimer, isStarlightModalOpen, cards, constellations, keys, monsterKills, activeExpeditions, activePotions, ultimateCharge, voidMatter, ACTIONS, worldBossState, voidGuardian, guildXpMult, showCampfire, galaxyState.spaceship, galaxyState.territories, galaxyState.galaxy, activeSynergies, buildings, arenaOpponents, arenaRank, glory, theme, autoSellRarity, quests, gameSpeed, petsState.pets, artifacts, classMastery, prestigeNodes, townVisited, portalConfig, guildQueue]);

    return result;
};
