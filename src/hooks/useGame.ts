import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import type { Hero, Boss, LogEntry, Item, Quest, ArenaOpponent, Achievement, GameStats, Resources, Building, DailyQuest, CombatEvent, Potion, MarketItem, GardenPlot, Expedition, GameActions, Stats, Pet, Rift, RiftBlessing, DungeonInteraction, ClassMastery, HeroClass, ElementType } from '../engine/types';
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
import { initOrUpdateHeroPassiveTree } from '../data/skillTreeData';
import { calculateBreedingResult } from '../engine/breeding';

import { generateTownEvent } from '../engine/townEvents';
import { validateGuildExpeditionTeam } from '../engine/guildExpeditions';
import { useVoidGuardian } from './useVoidGuardian';
import { calculateVoidGuardianRewards } from '../engine/voidBoss';
import { PRESTIGE_CLASSES } from '../engine/classes';
import { CLASS_TALENTS } from '../data/masteryData';
import { PRESTIGE_NODES, getPrestigeNodeCost } from '../components/modals/PrestigeTreeModal';
import { MONSTERS } from '../engine/bestiary';
import { useRoguelike } from './useRoguelike';
import { getPlanetaryRunRewards } from '../engine/roguelike';
import { useBackrooms } from './useBackrooms';
import { BACKROOMS_RESEARCHES } from '../engine/backrooms';

import { INITIAL_HEROES, INITIAL_BOSS, INITIAL_ACHIEVEMENTS, INITIAL_GAME_STATS, INITIAL_SPACESHIP, INITIAL_CONSTELLATIONS, INITIAL_CLASS_MASTERY, RARE_ARTIFACTS } from '../engine/initialData';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_GALAXY } from '../engine/galaxy';
import { generateInitialArenaBoard, calculateWinChance, applyVictoryGrowth, spawnReplacementOpponent } from '../engine/arena';
import { INITIAL_TERRITORIES, applyTerritoryUpgrade, generateGuildWarMap, simulateSiege, initGvGWar, simulateGvGTick, playerAttackTower } from '../engine/guildWar';
import type { GvGWarState } from '../engine/guildWar';
import { INITIAL_TOWN, INITIAL_MARKET_TREND } from '../engine/initialData';
import { generateRandomTrend, MARKET_TRENDS } from '../engine/marketDynamics';
import type { MarketTrend, TownState, AncientRelic } from '../engine/types';
import { generateMarketStock } from '../engine/market';
import { CHAMBER_RELICS } from '../engine/relics';
import { WEATHER_DATA } from '../engine/weather';
import { TUTORIAL_STEPS } from '../data/npcTutorial';

import { INITIAL_GARDEN } from '../engine/garden';
import { generateInitialBots, tickFakePlayers, selectArenaOpponents } from '../engine/playerSimulation';
import type { FakePlayer } from '../engine/playerSimulation';

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

const autoAllocateHeroStats = (h: Hero): Hero => {
    if (!h.statPoints || h.statPoints <= 0) return h;

    const points = h.statPoints;
    const stats = { ...h.stats };
    const cls = h.class;

    let cycle: (keyof Stats)[] = [];

    if (['Warrior', 'Paladin', 'Templar'].includes(cls)) {
        cycle = ['maxHp', 'defense', 'maxHp', 'defense', 'attack'];
    } else if (['Mage', 'Sorcerer', 'Sage', 'Illusionist'].includes(cls)) {
        cycle = ['magic', 'speed', 'magic', 'maxHp', 'magic'];
    } else if (['Rogue', 'Ninja', 'Assassin', 'Ranger', 'Dragoon', 'Samurai', 'Berserker', 'hunter', 'Pirate'].includes(cls)) {
        cycle = ['attack', 'speed', 'attack', 'maxHp', 'attack'];
    } else if (['Warlock', 'Necromancer', 'Druid', 'Alchemist'].includes(cls)) {
        cycle = ['magic', 'attack', 'maxHp', 'defense', 'magic'];
    } else if (['Healer', 'cleric', 'Bard'].includes(cls)) {
        cycle = ['maxHp', 'defense', 'speed', 'maxHp', 'magic'];
    } else if (['Monk', 'Viking'].includes(cls)) {
        cycle = ['maxHp', 'defense', 'speed', 'maxHp', 'attack'];
    } else if (['Miner', 'Fisherman', 'Blacksmith', 'Engineer'].includes(cls)) {
        cycle = ['attack', 'maxHp', 'defense', 'speed', 'attack'];
    } else {
        cycle = ['attack', 'maxHp', 'defense', 'speed', 'attack'];
    }

    for (let i = 0; i < points; i++) {
        const stat = cycle[i % cycle.length];
        stats[stat] = (stats[stat] || 0) + 1;
        if (stat === 'maxHp') {
            stats.hp = (stats.hp || 0) + 1;
        }
        if (stat === 'maxMp') {
            stats.mp = (stats.mp || 0) + 1;
        }
    }

    return {
        ...h,
        statPoints: 0,
        stats
    };
};

export const useGame = () => {
    // CORE STATE
    const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
    const [teamMorale, setTeamMorale] = useState<number>(100);
    const [heroBonds, setHeroBonds] = useState<Record<string, { xp: number, level: number, type: 'comrades' | 'rivals' | 'soulmates' }>>({});
    const [monuments, setMonuments] = useState<(string | null)[]>([null, null, null]);
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
    const [fakePlayers, setFakePlayers] = useState<FakePlayer[]>(() => generateInitialBots(20));
    const [gvgWarState, setGvgWarState] = useState<GvGWarState | null>(null);
    const [currentTutorialIndex, setCurrentTutorialIndex] = useState<number>(0);
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
    const [gardenPlots, setGardenPlots] = useState<GardenPlot[]>(INITIAL_GARDEN);
    const [patronDeity, setPatronDeity] = useState<string | null>(null);
    const [deityLevel, setDeityLevel] = useState<number>(1);
    const [deityFavor, setDeityFavor] = useState<number>(0);
    const [deityEnergy, setDeityEnergy] = useState<number>(0);
    const [elementalResonance, setElementalResonance] = useState<Record<string, number>>({
        fire: 0, water: 0, earth: 0, wind: 0, light: 0, dark: 0, neutral: 0
    });
    const [elementalEssences, setElementalEssences] = useState<Record<string, number>>({
        fire: 0, water: 0, earth: 0, wind: 0, light: 0, dark: 0, neutral: 0
    });
    const [ownedRelics, setOwnedRelics] = useState<string[]>([]);
    const [equippedRelics, setEquippedRelics] = useState<string[]>([]);
    const [bossRushWave, setBossRushWave] = useState<number>(1);
    const [bossRushMaxWave, setBossRushMaxWave] = useState<number>(1);
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
    // Boss Timer: 60 seconds to kill the monster. On expiry, same-level boss respawns.
    const [bossTimer, setBossTimer] = useState<number>(60);
    const bossTimerRef = useRef<number>(60);
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
    const bondXpAccumulatorRef = useRef<{ [key: string]: number }>({});
    const bondTicksRef = useRef<number>(0);

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = { id: (Date.now() + Math.random()).toString(), message, type, timestamp: Date.now() };
        setLogs(prev => [newLog, ...prev].slice(0, 5));
    }, []);

    // SUB-HOOKS
    const guildState = useGuild(null, gold, setGold, addLog);
    const petsState = usePets([], gold, souls, setGold, setSouls, addLog);
    const world = useWorld({ floor: 1, active: false, maxFloor: 1 }, { active: false, floor: 1, blessings: [], tempHeroes: [], maxFloor: 1 }, addLog);
    const galaxyState = useGalaxy(INITIAL_GALAXY, INITIAL_TERRITORIES, INITIAL_SPACESHIP, gold, setGold, addLog);
    const roguelike = useRoguelike();
    const backrooms = useBackrooms();

    const researchTech = useCallback((techId: string) => {
        const tech = BACKROOMS_RESEARCHES.find(t => t.id === techId);
        if (!tech) return;

        const alreadyUnlocked = backrooms.backroomsUnlockedTechs.includes(techId);
        const canAfford =
            backrooms.backroomsResources.scrap >= tech.cost.scrap &&
            backrooms.backroomsResources.almondWater >= tech.cost.almondWater &&
            backrooms.backroomsResources.anomalyParts >= tech.cost.anomalyParts;

        backrooms.researchTech(techId);

        if (!alreadyUnlocked && canAfford) {
            if (techId === 'space_warp' || techId === 'space_tech') {
                setOuterSpaceUnlocked(true);
                addLog("🚀 Estudos de Dobra Espacial concluídos! O Espaço Sideral foi desbloqueado!", "achievement");
            }
            if (techId === 'dimensional_singularity') {
                setVictory(true);
                addLog("🌀 Singularidade Inter-Dimensional ativada! Vitória dimensional suprema alcançada!", "achievement");
            }
        }
    }, [backrooms.backroomsUnlockedTechs, backrooms.backroomsResources, backrooms.researchTech, setOuterSpaceUnlocked, addLog, setVictory]);

    useEffect(() => {
        if (backrooms.backroomsUnlockedTechs.includes('space_tech') || backrooms.backroomsUnlockedTechs.includes('space_warp')) {
            setOuterSpaceUnlocked(true);
        }
        if (backrooms.backroomsUnlockedTechs.includes('dimensional_singularity')) {
            setVictory(true);
        }
    }, [backrooms.backroomsUnlockedTechs]);

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

    const handleVoidGuardianFinish = useCallback((dmg: number) => {
        const rewards = calculateVoidGuardianRewards(dmg);
        setGold(g => g + rewards.gold);
        setSouls(s => s + rewards.souls);
        setGameStats(prev => {
            if (dmg > (prev.voidGuardianHighestDamage || 0)) {
                return { ...prev, voidGuardianHighestDamage: dmg };
            }
            return prev;
        });
    }, []);

    const voidGuardian = useVoidGuardian(partyPower, addLog, handleVoidGuardianFinish);

    const handleWorldBossClaimed = useCallback((rewards: any) => {
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
    }, [addLog, guildState.setGuild, petsState.setPets]);

    const worldBossState = useWorldBoss(partyPower, gameStats, addLog, handleWorldBossClaimed);

    const activeHeroes = useMemo(() => (heroes || []).filter(h => h.assignment === 'combat' && h.unlocked), [heroes]);

    const activeHeroesWithBonusStats = useMemo(() => {
        const itemStats = { attack: 0, maxHp: 0, defense: 0, magic: 0, speed: 0 };
        items.forEach(item => {
            if (item.stat && item.value) {
                itemStats[item.stat as keyof typeof itemStats] = (itemStats[item.stat as keyof typeof itemStats] || 0) + item.value;
            }
            item.runes?.forEach(r => {
                if (r.type && r.value) {
                    itemStats[r.type as keyof typeof itemStats] = (itemStats[r.type as keyof typeof itemStats] || 0) + r.value;
                }
            });
        });

        const hasChalice = equippedRelics.includes('relic_chalice');
        const voidCritDmgCount = items.filter(item => item.voidAffix?.id === 'void_crit_dmg').length;

        return activeHeroes.map(h => {
            const attack = (h.stats.attack || 0) + (itemStats.attack || 0);
            let maxHp = (h.stats.maxHp || 0) + (itemStats.maxHp || 0);
            let defense = (h.stats.defense || 0) + (itemStats.defense || 0);
            const magic = (h.stats.magic || 0) + (itemStats.magic || 0);
            const speed = (h.stats.speed || 0) + (itemStats.speed || 0);

            if (hasChalice) {
                maxHp = Math.floor(maxHp * 1.25);
            }
            if (voidCritDmgCount > 0) {
                defense = Math.floor(defense * (1 - 0.12 * voidCritDmgCount));
            }

            return {
                ...h,
                stats: {
                    ...h.stats,
                    attack,
                    maxHp,
                    defense,
                    magic,
                    speed,
                    hp: Math.min(maxHp, h.stats.hp ?? maxHp)
                }
            };
        });
    }, [activeHeroes, items, equippedRelics]);

    const prestigeAtkMult = useMemo(() => 1 + (prestigeNodes['atk_1'] || 0) * 0.1 + (prestigeNodes['atk_2'] || 0) * 0.05, [prestigeNodes]);
    const prestigeHpMult = useMemo(() => 1 + (prestigeNodes['hp_1'] || 0) * 0.1 + (prestigeNodes['hp_2'] || 0) * 0.1, [prestigeNodes]);
    const prestigeGoldMult = useMemo(() => 1 + (prestigeNodes['gold_1'] || 0) * 0.15 + (prestigeNodes['boss_1'] || 0) * 0.5, [prestigeNodes]);
    const prestigeXpMult = useMemo(() => 1 + (prestigeNodes['xp_1'] || 0) * 0.25, [prestigeNodes]);

    const galaxyBuffs = galaxyState.galaxyBuffs;

    const guildAtkMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['altar_war'] || 0) * 0.02) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'damage') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);
    const guildHpMult = useMemo(() => guildState.guild ? 1 + ((guildState.guild.monuments?.['fountain_life'] || 0) * 0.02) : 1, [guildState.guild]);
    const guildGoldMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['statue_midas'] || 0) * 0.05) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'gold') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);
    const guildXpMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['shrine_wisdom'] || 0) * 0.03) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'xp') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);

    const activeSynergies = useMemo(() => checkSynergies(activeHeroesWithBonusStats.map(h => ({
        ...h, stats: { ...h.stats, attack: Math.floor(h.stats.attack * guildAtkMult * prestigeAtkMult * (1 + galaxyBuffs.damageMult)), maxHp: Math.floor(h.stats.maxHp * guildHpMult * prestigeHpMult), hp: Math.floor(h.stats.hp * guildHpMult * prestigeHpMult) }
    }))), [activeHeroesWithBonusStats, guildAtkMult, guildHpMult, prestigeAtkMult, prestigeHpMult, galaxyBuffs.damageMult]);

    const getMonumentMultipliers = useCallback(() => {
        let gold = 1.0;
        let attack = 1.0;
        let defense = 1.0;
        let speed = 1.0;
        let maxHp = 1.0;
        let lifesteal = 0.0;

        monuments.forEach(heroId => {
            if (!heroId) return;
            const hero = heroes.find(h => h.id === heroId);
            if (!hero || !hero.isAwakened) return;

            const cls = hero.class;
            if (['Warrior', 'Paladin', 'Templar'].includes(cls)) {
                defense += 0.10;
            } else if (['Mage', 'Sorcerer', 'Sage', 'Illusionist'].includes(cls)) {
                attack += 0.10;
            } else if (['Rogue', 'Ninja', 'Assassin', 'Ranger', 'Dragoon'].includes(cls)) {
                speed += 0.10;
            } else if (['Warlock', 'Necromancer', 'Druid'].includes(cls)) {
                lifesteal += 0.10;
            } else if (['Healer', 'Bard', 'Monk', 'Viking'].includes(cls)) {
                maxHp += 0.10;
            } else if (['Blacksmith', 'Miner', 'Fisherman', 'Pirate', 'Engineer'].includes(cls)) {
                gold += 0.10;
            }
        });

        // Deity Passives
        if (patronDeity === 'aurelius') {
            attack *= 1.15 + (deityLevel - 1) * 0.05;
        } else if (patronDeity === 'tenebris') {
            lifesteal += 0.15 + (deityLevel - 1) * 0.05;
        } else if (patronDeity === 'gaya') {
            maxHp *= 1.15 + (deityLevel - 1) * 0.05;
            gold *= 1.15 + (deityLevel - 1) * 0.05;
        }

        // Equipment and Runes Passive bonuses
        let totalAttackVal = 0;
        let totalDefenseVal = 0;
        let totalSpeedVal = 0;
        let totalHpVal = 0;
        let totalLifestealVal = 0;

        (items || []).forEach(item => {
            if (item.stat === 'attack') totalAttackVal += item.value;
            else if (item.stat === 'defense') totalDefenseVal += item.value;
            else if (item.stat === 'hp') totalHpVal += item.value;
            else if (item.stat === 'magic') totalAttackVal += item.value;
            else if (item.stat === 'speed') totalSpeedVal += item.value;

            (item.runes || []).forEach(rune => {
                if (rune.stat === 'attack') totalAttackVal += rune.value;
                else if (rune.stat === 'defense') totalDefenseVal += rune.value;
                else if (rune.stat === 'hp' || rune.stat === 'maxHp') totalHpVal += rune.value;
                else if (rune.stat === 'magic') totalAttackVal += rune.value;
                else if (rune.stat === 'speed') totalSpeedVal += rune.value;
                else if (rune.stat === 'lifesteal') totalLifestealVal += rune.value;
            });
        });

        // 1 value in item stats = +0.2% boost
        attack += totalAttackVal * 0.002;
        defense += totalDefenseVal * 0.002;
        speed += totalSpeedVal * 0.001;
        maxHp += totalHpVal * 0.002;
        lifesteal += totalLifestealVal * 0.001;

        // Fission Nuclear Tech (+20% HP and Attack)
        if (backrooms.backroomsUnlockedTechs.includes('fission_nuclear')) {
            attack *= 1.20;
            maxHp *= 1.20;
        }

        return { gold, attack, defense, speed, maxHp, lifesteal };
    }, [monuments, heroes, patronDeity, deityLevel, items, backrooms.backroomsUnlockedTechs]);


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
        const baseStats = activeHeroesWithBonusStats.reduce((sum, h) => {
            let attack = h.stats.attack || 0;
            let maxHp = h.stats.maxHp || 0;
            let magic = h.stats.magic || 0;
            let defense = h.stats.defense || 0;

            if (h.passiveSkillTree?.modifiers) {
                const mods = h.passiveSkillTree.modifiers;
                attack = Math.floor(attack * mods.attackMult);
                maxHp = Math.floor(maxHp * mods.hpMult);
                magic = Math.floor(magic * mods.magicMult);
                defense = Math.floor(defense * mods.defenseMult);
            }

            const hPower = attack + Math.floor(maxHp / 10) + magic + defense;
            return sum + hPower;
        }, 0);

        const petsPower = petStats.attack + Math.floor(petStats.hp / 10) + petStats.magic + petStats.defense;

        return Math.floor((baseStats + petsPower) * totalAtkMult * armyMult * getMonumentMultipliers().attack);
    }, [activeHeroesWithBonusStats, petStats, totalAtkMult, armyMult, getMonumentMultipliers]);


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
        heroes, souls, talents, constellations, artifacts, cards, achievements,
        pets: petsState.pets, activeSynergies: activeSynergies as any[],
        boss, ultimateCharge, gold, gameSpeed,
        galaxyDamageMult: galaxyBuffs.damageMult,
        classMastery,
        artifactMultipliers,
        patronDeity, deityLevel, deityFavor, deityEnergy,
        divinity,
        resources, items, runes,
        tower: world.tower,
        towerBoss: world.towerBoss,
        fakePlayers,
        gvgWarState,
        currentTutorialIndex,
        backroomsUnlockedTechs: backrooms.backroomsUnlockedTechs,
        backroomsFloor: backrooms.backroomsFloor,
        teamMorale,
        prestigeNodes,
        activeEvent,
        town,
        marketTrend,
        arenaRank,
        glory,
        guildQueue,
        arenaOpponents,
        marketStock,
        quests,
        dailyQuests,
        activePotions,
        activeExpeditions,
        theme,
        autoSellRarity,
        offlineGains,
        voidActive,
        voidTimer,
        voidAscensions,
        raidActive,
        raidTimer,
        dailyLoginClaimed,
        townVisited,
        partyPower,
        monuments,
        buildings,
        voidMatter,
        lastDailyReset,
        starlightUpgrades,
        starlight,
        guild: guildState.guild,
        territories: galaxyState.territories,
        weather: world.weather,
        gameStats,
        dungeonMastery,
        ownedRelics,
        equippedRelics
    });

    useEffect(() => {
        stateRef.current = {
            heroes, souls, talents, constellations, artifacts, cards, achievements,
            pets: petsState.pets, activeSynergies: activeSynergies as any[],
            boss, ultimateCharge, gold, gameSpeed,
            galaxyDamageMult: galaxyBuffs.damageMult,
            classMastery,
            artifactMultipliers,
            patronDeity, deityLevel, deityFavor, deityEnergy,
            divinity,
            resources, items, runes,
            tower: world.tower,
            towerBoss: world.towerBoss,
            fakePlayers,
            gvgWarState,
            currentTutorialIndex,
            backroomsUnlockedTechs: backrooms.backroomsUnlockedTechs,
            backroomsFloor: backrooms.backroomsFloor,
            teamMorale,
            prestigeNodes,
            activeEvent,
            town,
            marketTrend,
            arenaRank,
            glory,
            guildQueue,
            arenaOpponents,
            marketStock,
            quests,
            dailyQuests,
            activePotions,
            activeExpeditions,
            theme,
            autoSellRarity,
            offlineGains,
            voidActive,
            voidTimer,
            voidAscensions,
            raidActive,
            raidTimer,
            dailyLoginClaimed,
            townVisited,
            partyPower,
            monuments,
            buildings,
            voidMatter,
            lastDailyReset,
            starlightUpgrades,
            starlight,
            guild: guildState.guild,
            territories: galaxyState.territories,
            weather: world.weather,
            gameStats,
            dungeonMastery,
            ownedRelics,
            equippedRelics
        };
    }, [heroes, souls, talents, constellations, artifacts, cards, achievements, petsState.pets, activeSynergies, boss, ultimateCharge, gold, gameSpeed, galaxyBuffs.damageMult, classMastery, artifactMultipliers, patronDeity, deityLevel, deityFavor, deityEnergy, divinity, resources, items, runes, world.tower, world.towerBoss, fakePlayers, gvgWarState, currentTutorialIndex, backrooms.backroomsUnlockedTechs, backrooms.backroomsFloor, teamMorale, prestigeNodes, activeEvent, town, marketTrend, arenaRank, glory, guildQueue, arenaOpponents, marketStock, quests, dailyQuests, activePotions, activeExpeditions, theme, autoSellRarity, offlineGains, voidActive, voidTimer, voidAscensions, raidActive, raidTimer, dailyLoginClaimed, townVisited, partyPower, monuments, buildings, voidMatter, lastDailyReset, starlightUpgrades, starlight, guildState.guild, galaxyState.territories, world.weather, gameStats, dungeonMastery, ownedRelics, equippedRelics]);

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

    // FIX: Selecionar oponentes da Arena a partir dos bots simulados
    useEffect(() => {
        if (arenaOpponents.length === 0 && fakePlayers.length > 0) {
            const rank = arenaRank || 1000;
            const power = calculatedPartyPower || 100;
            setArenaOpponents(selectArenaOpponents(fakePlayers, power, rank));
        }
    }, [arenaOpponents.length, arenaRank, calculatedPartyPower, fakePlayers]);

    useEffect(() => {
        const dpsTimer = setInterval(() => {
            const now = Date.now();
            const timeDiff = (now - lastDpsUpdate.current) / 1000;
            if (timeDiff >= 1) {
                const currentDps = Math.round(damageAccumulator.current / timeDiff);
                setPartyDps(prev => Math.round(prev * 0.7 + currentDps * 0.3));
                damageAccumulator.current = 0;
                lastDpsUpdate.current = now;
            }
        }, 1000);
        return () => clearInterval(dpsTimer);
    }, []);

    useEffect(() => {
        setPartyDps(0);
        damageAccumulator.current = 0;
    }, [boss.id, world.towerBoss.id, world.tower.active]);

    useEffect(() => {
        const timer = setInterval(() => {
            world.setWeatherTimer((prev: number) => prev <= 1 ? 300 : prev - 1);
            setActiveEvent(prev => {
                if (!prev) {
                    if (Math.random() < 0.002) {
                        const event = generateTownEvent(boss.level, []);
                        if (event) {
                            addLog(`📣 Novo evento na cidade: ${event.name}!`, 'achievement');
                            return event;
                        }
                    }
                    return null;
                }
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
                        const deityMult = stateRef.current.patronDeity === 'aurelius' ? 1.15 + (stateRef.current.deityLevel - 1) * 0.05 : 1.0;
                        const finalStar = Math.floor(starReward * deityMult);
                        const dropItem = Math.random() < 0.4;
                        setGold(g => g + goldReward);
                        setSouls(s => s + soulReward);
                        setStarlight(sl => sl + finalStar);
                        if (dropItem) {
                            const item = generateLoot(raidBossLevel);
                            setItems(inv => [...inv.slice(-199), item]);
                            addLog(`🏆 Reide Concluída! +${goldReward} Ouro, +${soulReward} Almas, +${finalStar} ⭐ Luz Estelar, item encontrado: ${item.name}!`, 'achievement');
                        } else {
                            addLog(`🏆 Reide Concluída! +${goldReward} Ouro, +${soulReward} Almas, +${finalStar} ⭐ Luz Estelar!`, 'achievement');
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

            // Market updates: regenerate stock when timer hits 0 or stock is empty
            setMarketTimer(prev => {
                if (prev <= 1 || stateRef.current.marketStock.length === 0) {
                    setMarketStock(generateMarketStock());
                    return 3600; // 1 hour
                }
                return prev - 1;
            });

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
                    // Refresh market stock on trend change
                    setMarketStock(generateMarketStock());
                    setMarketTimer(3600);
                    return nextTrend;
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [raidActive, voidActive, calculatedPartyPower]);

    // Spaceship fuel & hull passive regeneration (every 5 seconds)
    useEffect(() => {
        const fuelTimer = setInterval(() => {
            galaxyState.refuelShip();
        }, 5000);
        return () => clearInterval(fuelTimer);
    }, []);


    const ACTIONS: GameActions = useMemo(() => {
        const baseActions = {
            toggleSound: () => setIsSoundOn(p => !p),
            setGameSpeed: (s: number) => setGameSpeed(s),
            spendStatPoint: (id: string, s: keyof Stats) => setHeroes(p => p.map(h => h.id === id && h.statPoints > 0 ? { ...h, statPoints: h.statPoints - 1, stats: { ...h.stats, [s]: (h.stats[s] || 0) + 1 } } : h)),
            recruitHero: (id: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, unlocked: true } : h)),
            buyHero: (id: string) => {
                const h = stateRef.current.heroes.find(x => x.id === id);
                const cost = 5000; // Fixed cost for direct recruitment
                if (h && !h.unlocked && stateRef.current.gold >= cost) {
                    setGold(g => g - cost);
                    setHeroes(p => p.map(curr => curr.id === id ? { ...curr, unlocked: true } : curr));
                    addLog(`Recrutou ${h.name} diretamente!`, 'success');
                } else if (stateRef.current.gold < cost) {
                    addLog(`Ouro insuficiente para recrutar ${h?.name || 'herói'}. Precisa de ${cost}.`, 'error');
                }
            },
            evolveHero: (id: string) => {
                const h = stateRef.current.heroes.find(x => x.id === id);
                if (h && h.level >= 50) setHeroes(p => p.map(curr => curr.id === id ? initOrUpdateHeroPassiveTree({ ...curr, class: (PRESTIGE_CLASSES as any)[h.class] || h.class, level: 1 }) : curr));
            },
            awakenHero: (id: string) => {
                const h = stateRef.current.heroes.find(x => x.id === id);
                const goldCost = 100000;
                const soulsCost = 50000;
                if (h && h.level >= 100 && !h.isAwakened && stateRef.current.gold >= goldCost && stateRef.current.souls >= soulsCost) {
                    setGold(g => g - goldCost);
                    setSouls(s => s - soulsCost);
                    setHeroes(p => p.map(curr => curr.id === id ? initOrUpdateHeroPassiveTree({
                        ...curr,
                        isAwakened: true,
                        awakeningTitle: 'Desperto',
                        awakenedAt: Date.now(), // ⏰ Timestamp para o Hall of Fame
                        level: 100,
                        stats: {
                            ...curr.stats,
                            maxHp: Math.floor(curr.stats.maxHp * 1.5),
                            hp: Math.floor(curr.stats.maxHp * 1.5),
                            attack: Math.floor(curr.stats.attack * 1.5),
                            defense: Math.floor(curr.stats.defense * 1.5),
                            magic: Math.floor(curr.stats.magic * 1.5)
                        }
                    }) : curr));
                    addLog(`☄️ LIMIT BREAK! ${h.name} alcançou o Despertar! Seus atributos explodiram de poder!`, 'achievement');
                    soundManager.playLevelUp();

                } else if (h && (stateRef.current.gold < goldCost || stateRef.current.souls < soulsCost)) {
                    addLog(`Recursos insuficientes. O Despertar exige ${goldCost} Ouro e ${soulsCost} Almas.`, 'error');
                } else if (h && h.level < 100) {
                    addLog(`Herói não está pronto. O Despertar exige Nível 100.`, 'info');
                }
            },
            toggleAssignment: (id: string) => {
                const h = stateRef.current.heroes.find(x => x.id === id);
                if (h && h.curses?.includes('abyss') && h.assignment === 'combat') {
                    addLog(`${h.name} está preso pelas Correntes do Abismo e não pode deixar o combate!`, 'error');
                    return;
                }
                setHeroes(p => p.map(h => h.id === id ? { ...h, assignment: h.assignment === 'combat' ? 'none' : 'combat' } : h));
            },
            purifyHero: (id: string) => {
                if (stateRef.current.gold >= 1000) {
                    setGold(g => g - 1000);
                    setHeroes(p => p.map(h => h.id === id ? { ...h, insanity: 0, isMutated: false, mutationType: undefined } : h));
                    addLog("Herói purificado! Insanidade e Corrupção removidas.", "success");
                }
            },
            // Purifica a mutação sem resetar insanidade (custo maior)
            purifyMutation: (id: string) => {
                const h = stateRef.current.heroes.find(x => x.id === id);
                const cost = 25000;
                if (h && h.isMutated && stateRef.current.gold >= cost) {
                    setGold(g => g - cost);
                    setHeroes(p => p.map(curr => curr.id === id ? { ...curr, isMutated: false, mutationType: undefined, insanity: Math.max(0, (curr.insanity || 0) - 40) } : curr));
                    addLog(`✨ ${h.name} foi purificado da Corrupção por ${cost} Ouro!`, 'success');
                } else if (h && !h.isMutated) {
                    addLog(`${h?.name} não está corrompido.`, 'info');
                } else {
                    addLog(`Precisa de ${cost} Ouro para purificar a Mutação.`, 'error');
                }
            },
            reviveHero: (id: string) => { setHeroes(p => p.map(h => h.id === id ? { ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } } : h)); addLog("Hero revived!", "success"); },
            renameHero: (id: string, name: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, name } : h)),
            changeHeroEmoji: (id: string, e: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, emoji: e } : h)),
            buyTalent: (id: string, _a?: number) => {
                const talent = stateRef.current.talents.find(t => t.id === id);
                if (talent && stateRef.current.souls >= talent.cost) {
                    const cost = talent.cost;
                    setSouls(s => Math.max(0, s - cost));
                    setTalents(p => p.map(t => t.id === id ? { ...t, level: t.level + 1, cost: Math.floor(t.cost * t.costScaling) } : t));
                }
            },
            buyConstellation: (id: string) => {
                const node = stateRef.current.constellations.find(c => c.id === id);
                if (node && stateRef.current.divinity >= node.cost && node.level < node.maxLevel) {
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
                const mastery = stateRef.current.classMastery[className];
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
                const cost = getStarlightUpgradeCost(u, stateRef.current.starlightUpgrades[id] || 0);
                if (stateRef.current.starlight >= cost) { setStarlight(s => Math.max(0, s - cost)); setStarlightUpgrades(p => ({ ...p, [id]: (p[id] || 0) + 1 })); }
            },
            enterTower: () => {
                const wasActive = stateRef.current.tower.active;
                const currentFloor = stateRef.current.tower.floor || 1;

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
                const currentLevel = stateRef.current.boss.level;
                const cleanFusionMult = stateRef.current.backroomsUnlockedTechs.includes('clean_fusion') ? 1.20 : 1.0;
                const soulsGained = Math.floor(Math.floor(currentLevel / 5) * (1 + (stateRef.current.prestigeNodes['souls_1'] || 0) * 0.2) * cleanFusionMult);
                setPortalConfig({
                    title: "PORTAL DE ASCENSÃO",
                    message: "Um portal de pura energia celestial se abre diante de você.",
                    warning: "O Ouro e o progresso do Boss serão reiniciados, mas você ganhará Almas Celestiais.",
                    soulsGained,
                    onConfirm: baseActions.confirmRebirth
                });
            },
            confirmRebirth: () => {
                const cleanFusionMult = stateRef.current.backroomsUnlockedTechs.includes('clean_fusion') ? 1.20 : 1.0;
                const soulsGained = Math.floor(Math.floor(stateRef.current.boss.level / 5) * (1 + (stateRef.current.prestigeNodes['souls_1'] || 0) * 0.2) * cleanFusionMult);
                setSouls(s => s + soulsGained);
                setHeroes(INITIAL_HEROES.map(h => ({ ...h, level: 1 + (stateRef.current.prestigeNodes['legend_1'] || 0) * 2 })));
                setGold(0);
                setBoss(INITIAL_BOSS);
                setItems([]);
                setPortalConfig(null);
                addLog(`Ascensão Concluída! Você obteve ${soulsGained} Almas Celestiais.`, 'achievement');
                soundManager.playLevelUp();
            },
            buyPrestigeNode: (nodeId: string) => {
                const node = PRESTIGE_NODES.find((n: any) => n.id === nodeId);
                const currentLevel = stateRef.current.prestigeNodes[nodeId] || 0;
                if (node && currentLevel < node.maxLevel) {
                    const cost = getPrestigeNodeCost(node, currentLevel);
                    if (stateRef.current.souls >= cost) {
                        setSouls(s => Math.max(0, s - cost));
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
                if (stateRef.current.tower.maxFloor >= 20) {
                    const gain = Math.floor(stateRef.current.tower.maxFloor / 10);
                    setPortalConfig({
                        title: "ASCENSÃO DA TORRE",
                        message: "A energia da torre converge para um novo começo.",
                        rewardText: `${gain} Luz Estelar`,
                        onConfirm: () => {
                            const deityMult = stateRef.current.patronDeity === 'aurelius' ? 1.15 + (stateRef.current.deityLevel - 1) * 0.05 : 1.0;
                            const finalGain = Math.floor(gain * deityMult);
                            setStarlight(s => s + finalGain);
                            world.setTower({ floor: 1, maxFloor: stateRef.current.tower.maxFloor, active: false });
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
                if (e.type === 'exit') {
                    if (Math.random() < 0.3) {
                        const combatants = stateRef.current.heroes.filter(h => h.assignment === 'combat');
                        if (combatants.length > 0) {
                            const luckyHero = combatants[Math.floor(Math.random() * combatants.length)];
                            const curseList = ['blood', 'evil', 'abyss'];
                            const currentCurses = luckyHero.curses || [];
                            const availableCurses = curseList.filter(c => !currentCurses.includes(c));
                            if (availableCurses.length > 0) {
                                const newCurse = availableCurses[Math.floor(Math.random() * availableCurses.length)];
                                setHeroes(prev => prev.map(h => h.id === luckyHero.id ? { ...h, curses: [...(h.curses || []), newCurse] } : h));
                                addLog(`⚠️ ${luckyHero.name} foi amaldiçoado com ${newCurse === 'blood' ? 'Maldição do Sangue 🩸' : newCurse === 'evil' ? 'Olho Maligno 👁️' : 'Correntes do Abismo ⛓️'}!`, 'danger');
                            }
                        }
                    }
                }
            },
            toggleRaid: () => {
                if (!stateRef.current.raidActive) {
                    setRaidTimer(60);
                    addLog("Uma Reide começou!", "danger");
                }
                setRaidActive(p => !p);
            },
            fightArena: (opponent: ArenaOpponent) => {
                const winChance = calculateWinChance(stateRef.current.partyPower, opponent.power);
                const won = winChance > Math.random();
                if (won) {
                    const nextRank = Math.max(1, stateRef.current.arenaRank - 20);
                    setArenaRank(nextRank);
                    const gloryGain = 10 + Math.floor(opponent.power / 50);
                    setGlory(g => g + gloryGain);
                    const goldReward = Math.floor(50 + opponent.power * 0.5);
                    setGold(g => g + goldReward);

                    // Defeated fighter always joins guild (or waits in queue)
                    const isLeader = stateRef.current.guild && (stateRef.current.guild.totalContribution || 0) >= 10000;
                    if (isLeader) {
                        guildState.setGuild((g: any) => g ? { ...g, xp: Math.min(g.xp + 500, g.maxXp), members: g.members + 1 } : g);
                        addLog(`⚔️ ${opponent.name} foi derrotado e juntou-se à sua Guilda! +500 XP. +${gloryGain} Glória, +${goldReward} Ouro.`, 'achievement');
                    } else {
                        setGuildQueue(q => [...q, { name: opponent.name, emoji: opponent.avatar, power: opponent.power }]);
                        addLog(`⚔️ ${opponent.name} aguarda na Fila de Recrutas até você virar Líder! +${gloryGain} Glória, +${goldReward} Ouro.`, 'achievement');
                    }

                    // Update bot stats and select new arena opponents
                    setFakePlayers(prevBots => {
                        const updatedBots = prevBots.map(b => {
                            if (b.id === opponent.id) {
                                return { ...b, power: Math.max(10, Math.floor(b.power * 0.95)) };
                            }
                            return b;
                        });
                        setArenaOpponents(selectArenaOpponents(updatedBots, stateRef.current.partyPower, nextRank));
                        return updatedBots;
                    });

                } else {
                    const nextRank = Math.min(9999, stateRef.current.arenaRank + 5);
                    setArenaRank(nextRank);
                    addLog(`Derrota na Arena contra ${opponent.name}... Continue treinando!`, 'danger');

                    // Update bot stats and select new arena opponents
                    setFakePlayers(prevBots => {
                        const updatedBots = prevBots.map(b => {
                            if (b.id === opponent.id) {
                                return { ...b, power: Math.floor(b.power * 1.05) + 10 };
                            }
                            return b;
                        });
                        setArenaOpponents(selectArenaOpponents(updatedBots, stateRef.current.partyPower, nextRank));
                        return updatedBots;
                    });
                }
            },
            attackSector: (id: string) => galaxyState.attackSector(id),
            attackTerritory: (id: string) => {
                const map = stateRef.current.territories;
                const t = map.find((x: any) => x.id === id);
                if (!t || t.owner === 'player') return;

                const success = simulateSiege(t, stateRef.current.partyPower);
                if (success) {
                    const weatherBonus = (stateRef.current.weather && WEATHER_DATA[stateRef.current.weather]) ? WEATHER_DATA[stateRef.current.weather].guildWarBonus : { stat: 'none', value: 0 };

                    let goldReward = t.difficulty * 2;
                    let xpReward = t.difficulty;

                    if (weatherBonus.stat === 'gold') goldReward *= (1 + weatherBonus.value);
                    if (weatherBonus.stat === 'xp') xpReward *= (1 + weatherBonus.value);

                    setGold(g => g + Math.floor(goldReward));
                    guildState.setGuild((g: any) => g ? { ...g, xp: g.xp + Math.floor(xpReward) } : g);

                    galaxyState.setTerritories((prev: any[]) => prev.map((pt: any) => pt.id === id ? { ...pt, owner: 'player' } : pt));
                    addLog(`Vitória! A Guilda conquistou ${t.name}. +${Math.floor(goldReward)} Ouro, +${Math.floor(xpReward)} Guild XP.`, 'success');
                } else {
                    addLog(`Derrota cruel ao tentar invadir ${t.name}... Suas tropas recuaram.`, 'danger');
                }
            },
            upgradeTerritory: (id: string) => {
                const t = stateRef.current.territories.find((t: any) => t.id === id);
                if (!t || t.owner !== 'player') return;
                const cost = t.upgradeCost || 5000;
                if (stateRef.current.gold < cost) { addLog(`Ouro insuficiente! Precisa de ${cost} para melhorar ${t.name}.`, 'info'); return; }
                setGold(g => g - cost);
                galaxyState.setTerritories((prev: any[]) => prev.map((ter: any) =>
                    ter.id === id ? applyTerritoryUpgrade(ter) : ter
                ));
                addLog(`✨ ${t.name} melhorado para Nível ${(t.level || 1) + 1}! Bônus aumentado.`, 'success');
            },
            bombardTerritory: (id: string, multiplier: number, weaponName: string) => {
                const t = stateRef.current.territories.find((t: any) => t.id === id);
                if (!t || t.owner === 'player') return;

                galaxyState.setTerritories((prev: any[]) => prev.map((ter: any) =>
                    ter.id === id ? { ...ter, difficulty: Math.max(1, Math.floor(ter.difficulty * multiplier)) } : ter
                ));
                addLog(`💥 ${weaponName} disparada! As defesas de ${t.name} desmoronaram e a dificuldade despencou!`, 'achievement');
                soundManager.playHit();
            },
            advanceGuildWarMap: () => {
                const newMap = generateGuildWarMap(stateRef.current.partyPower);
                galaxyState.setTerritories(newMap);
                addLog("O exército da guilda marchou para uma nova e perigosa fronteira!", "achievement");
            },
            unlockOuterSpace: () => {
                setOuterSpaceUnlocked(true);
                addLog("O Espaço Externo foi desbloqueado! Galáxia e Forja Estelar agora estão disponíveis.", "achievement");
                soundManager.playLevelUp();
            },
            researchTech: (techId: string) => {
                backrooms.researchTech(techId);
                if (techId === 'space_tech') {
                    setOuterSpaceUnlocked(true);
                }
            },
            breedPets: (p1: Pet, p2: Pet) => {
                const cost = 1000;
                if (stateRef.current.gold < cost) {
                    addLog(`Not enough gold to breed pets! Need ${cost} Gold.`, 'error');
                    return;
                }
                setGold(g => g - cost);
                const newPet = calculateBreedingResult(p1, p2);
                petsState.setPets(prev => [...prev.filter(p => p.id !== p1.id && p.id !== p2.id), newPet]);
                addLog(`Successfully fused ${p1.name} and ${p2.name} into ${newPet.name}!`, 'achievement');
                soundManager.playLevelUp();
            },
            feedPet: (type: 'gold' | 'souls', id?: string) => {
                const currentPets = stateRef.current.pets || [];
                if (!id && currentPets.length === 0) return;
                const targetPet = id ? currentPets.find(p => p.id === id) : currentPets[0];
                if (!targetPet) return;
                const cost = 100;
                if (type === 'gold' && stateRef.current.gold < cost) return;
                if (type === 'souls' && stateRef.current.souls < cost) return;

                if (type === 'gold') setGold(g => Math.max(0, g - cost));
                else setSouls(s => Math.max(0, s - cost));

                petsState.setPets(prev => prev.map(p => {
                    if (p.id === targetPet.id) {
                        const xpGain = type === 'gold' ? 50 : 150;
                        let newXp = p.xp + xpGain;
                        let newLevel = p.level;
                        let newMaxXp = p.maxXp;
                        const newStats = p.stats ? { ...p.stats } : { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 };

                        while (newXp >= newMaxXp) {
                            newLevel++;
                            newXp -= newMaxXp;
                            newMaxXp = Math.floor(newMaxXp * 1.5);
                            newStats.attack = (newStats.attack || 0) + 1;
                            newStats.maxHp = (newStats.maxHp || 0) + 5;
                            newStats.hp = (newStats.hp || 0) + 5;
                            newStats.defense = (newStats.defense || 0) + 1;
                        }

                        return { ...p, level: newLevel, xp: newXp, maxXp: newMaxXp, stats: newStats };
                    }
                    return p;
                }));

                addLog(`Fed ${targetPet.name} with ${type}!`, 'action');
            },
            winCardBattle: (_o: string, d: number) => setGold(g => g + d * 10),
            forgeUpgrade: (m: 'copper' | 'iron' | 'mithril') => {
                const costMap = { copper: 100, iron: 50, mithril: 10 };
                const cost = costMap[m];
                if (stateRef.current.resources[m] >= cost) {
                    setResources(r => ({ ...r, [m]: r[m] - cost }));
                    addLog(`⚒️ Upgrade de Forja Realizado: Equipamento de ${m.toUpperCase()} reforjado!`, 'success');
                } else {
                    addLog(`Recursos insuficientes de ${m.toUpperCase()} para melhorar a Forja.`, 'error');
                }
            },
            craftRune: () => {
                const costMithril = 10;
                const costSouls = 50;
                if (stateRef.current.resources.mithril >= costMithril && stateRef.current.souls >= costSouls) {
                    setResources(r => ({ ...r, mithril: r.mithril - costMithril }));
                    setSouls(s => s - costSouls);

                    const rand = Math.random();
                    let rarity: import('../engine/types').ItemRarity = 'common';
                    let valMultiplier = 1;
                    if (rand < 0.03) {
                        rarity = 'legendary';
                        valMultiplier = 10;
                    } else if (rand < 0.15) {
                        rarity = 'epic';
                        valMultiplier = 5;
                    } else if (rand < 0.40) {
                        rarity = 'rare';
                        valMultiplier = 2.5;
                    }

                    const statsPool: ('attack' | 'defense' | 'hp' | 'speed' | 'lifesteal')[] = ['attack', 'defense', 'hp', 'speed', 'lifesteal'];
                    const stat = statsPool[Math.floor(Math.random() * statsPool.length)];

                    const baseVal = Math.floor(Math.random() * 5) + 5;
                    let val = Math.floor(baseVal * valMultiplier);
                    if (stat === 'speed') val = Math.max(1, Math.floor(val * 0.2));
                    if (stat === 'lifesteal') val = Math.max(1, Math.floor(val * 0.1));

                    const statNameMap = {
                        attack: 'Força',
                        defense: 'Proteção',
                        hp: 'Vitalidade',
                        speed: 'Rapidez',
                        lifesteal: 'Vampirismo'
                    };
                    const runeName = `Runa da ${statNameMap[stat]}`;

                    const emojiMap = {
                        attack: '⚔️',
                        defense: '🛡️',
                        hp: '💚',
                        speed: '⚡',
                        lifesteal: '🩸'
                    };
                    const emoji = emojiMap[stat];

                    const newRune: import('../engine/types').Rune = {
                        id: `rune-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                        name: runeName,
                        stat: stat === 'hp' ? 'hp' : stat,
                        value: val,
                        emoji,
                        rarity,
                        description: `Aumenta ${stat} em +${val}`
                    };

                    setRunes(prev => [...prev, newRune]);
                    addLog(`🔮 Runa Criada: ${newRune.name} (${newRune.rarity.toUpperCase()}) +${newRune.value} ${newRune.stat}!`, 'success');
                } else {
                    addLog('Recursos insuficientes para forjar uma runa.', 'error');
                }
            },
            socketRune: (itemId: string, runeId: string) => {
                const item = stateRef.current.items.find(i => i.id === itemId);
                const rune = stateRef.current.runes.find(r => r.id === runeId);

                if (!item || !rune) {
                    addLog('Item ou Runa não encontrados.', 'error');
                    return;
                }

                const currentRunes = item.runes || [];
                const maxSockets = item.sockets || 0;

                if (currentRunes.length >= maxSockets) {
                    addLog('Este item não possui engastes vazios disponíveis.', 'error');
                    return;
                }

                setRunes(prev => prev.filter(r => r.id !== runeId));
                setItems(prevItems => prevItems.map(i => {
                    if (i.id === itemId) {
                        return {
                            ...i,
                            runes: [...(i.runes || []), rune]
                        };
                    }
                    return i;
                }));

                addLog(`✨ Runa ${rune.name} engastada com sucesso no item ${item.name}!`, 'success');
            },
            combineRunes: (runeIds: string[]) => {
                if (runeIds.length !== 3) {
                    addLog('Selecione exatamente 3 runas para fundir.', 'error');
                    return;
                }
                const runesToCombine = stateRef.current.runes.filter(r => runeIds.includes(r.id));
                if (runesToCombine.length !== 3) {
                    addLog('Algumas runas selecionadas não foram encontradas no inventário.', 'error');
                    return;
                }

                const [r1, r2, r3] = runesToCombine;
                if (r1.rarity !== r2.rarity || r2.rarity !== r3.rarity) {
                    addLog('Todas as 3 runas devem ser da mesma raridade para fundir.', 'error');
                    return;
                }

                const currentRarity = r1.rarity;
                let nextRarity: import('../engine/types').ItemRarity;
                let valMultiplier = 1;

                if (currentRarity === 'common') {
                    nextRarity = 'rare';
                    valMultiplier = 2.5;
                } else if (currentRarity === 'rare') {
                    nextRarity = 'epic';
                    valMultiplier = 5;
                } else if (currentRarity === 'epic') {
                    nextRarity = 'legendary';
                    valMultiplier = 10;
                } else {
                    addLog('Apenas runas Comuns, Raras ou Épicas podem ser fundidas.', 'error');
                    return;
                }

                const costSouls = 50;
                if (stateRef.current.souls < costSouls) {
                    addLog(`Almas insuficientes para fundir. Requer ${costSouls} Almas.`, 'error');
                    return;
                }

                setSouls(s => s - costSouls);
                setRunes(prev => prev.filter(r => !runeIds.includes(r.id)));

                // Roll new stats for fused rune
                const statsPool: ('attack' | 'defense' | 'hp' | 'speed' | 'lifesteal')[] = ['attack', 'defense', 'hp', 'speed', 'lifesteal'];
                const stat = statsPool[Math.floor(Math.random() * statsPool.length)];

                const baseVal = Math.floor(Math.random() * 5) + 5;
                let val = Math.floor(baseVal * valMultiplier);
                if (stat === 'speed') val = Math.max(1, Math.floor(val * 0.2));
                if (stat === 'lifesteal') val = Math.max(1, Math.floor(val * 0.1));

                const statNameMap = {
                    attack: 'Força',
                    defense: 'Proteção',
                    hp: 'Vitalidade',
                    speed: 'Rapidez',
                    lifesteal: 'Vampirismo'
                };
                const runeName = `Runa da ${statNameMap[stat]}`;

                const emojiMap = {
                    attack: '⚔️',
                    defense: '🛡️',
                    hp: '💚',
                    speed: '⚡',
                    lifesteal: '🩸'
                };
                const emoji = emojiMap[stat];

                const newRune: import('../engine/types').Rune = {
                    id: `rune-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: runeName,
                    stat: stat === 'hp' ? 'hp' : stat,
                    value: val,
                    emoji,
                    rarity: nextRarity,
                    description: `Aumenta ${stat} em +${val}`
                };

                setRunes(prev => [...prev, newRune]);
                addLog(`🔮 Fusão de Runas Concluída: ${newRune.name} (${newRune.rarity.toUpperCase()}) +${newRune.value} ${newRune.stat}!`, 'success');
            },
            invokeWeather: (weatherType: import('../engine/weather').WeatherType) => {
                const hasAltar = buildings.find(b => b.id === 'altar_deities' && b.level > 0);
                if (!hasAltar) {
                    addLog('Requer o Altar dos Deuses na Vila construído.', 'error');
                    return;
                }
                const herbCost = 10;
                const soulsCost = 100;

                if (stateRef.current.resources.herbs < herbCost || stateRef.current.souls < soulsCost) {
                    addLog(`Recursos insuficientes. Requer ${herbCost} Ervas e ${soulsCost} Almas.`, 'error');
                    return;
                }

                setResources(r => ({ ...r, herbs: r.herbs - herbCost }));
                setSouls(s => s - soulsCost);

                world.setWeather(weatherType);
                world.setWeatherTimer(300);
                addLog(`⛪ Ritual do Clima realizado! O tempo mudou para: ${WEATHER_DATA[weatherType].name}!`, 'success');
            },
            craftStarForgedItem: (item: Item, gCost: number, fCost: number) => {
                if (stateRef.current.gold >= gCost && stateRef.current.resources.starFragments >= fCost) {
                    setGold(g => g - gCost); setResources(r => ({ ...r, starFragments: r.starFragments - fCost }));
                    setItems(p => [...p, item]); addLog(`Forged ${item.name}!`, 'achievement');
                }
            },
            joinGuild: (name: string) => guildState.joinGuild(name),
            contributeGuild: (amt: number) => guildState.contributeGuild(amt),
            summonTavernLine: (amount: number) => {
                const res = simulateTavernSummon(amount, stateRef.current.gold, stateRef.current.gameStats.tavernPurchases || 0, stateRef.current.heroes, stateRef.current.artifacts, stateRef.current.pets, 1, stateRef.current.gameStats.heroPity || 0, stateRef.current.gameStats.petPity || 0);
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
                const b = stateRef.current.buildings.find(x => x.id === id); if (!b || stateRef.current.gold < b.cost) return;
                setGold(g => g - b.cost); setBuildings(p => p.map(x => x.id === id ? { ...x, level: x.level + 1, cost: Math.floor(x.cost * x.costScaling) } : x));
            },
            upgradeSpaceship: (part: keyof import('../engine/types').Spaceship['parts']) => galaxyState.upgradeSpaceship(part),
            claimLoginReward: () => {
                const r = LOGIN_REWARDS.find(x => x.day === (stateRef.current.gameStats.loginStreak || 1)) || LOGIN_REWARDS[0];
                if (r.type === 'gold') setGold(g => g + r.amount); setDailyLoginClaimed(true);
            },
            claimDailyQuest: (id: string) => setQuests(p => p.map(q => q.id === id && q.progress >= q.target ? { ...q, isClaimed: true } : q)),
            checkDailies: () => { if (checkDailyReset(stateRef.current.lastDailyReset)) { setLastDailyReset(Date.now()); setDailyQuests(generateDailyQuests()); setDailyLoginClaimed(false); } },
            enterVoid: () => {
                if (!stateRef.current.voidActive) {
                    setVoidActive(true);
                    setVoidTimer(30);
                    addLog("Você mergulhou na Dimensão do Vazio...", "danger");
                }
            },
            triggerAscension: () => {
                if (stateRef.current.souls >= 1000) {
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
            buyDarkGift: (cost: number, _e: string) => { if (stateRef.current.voidMatter >= cost) setVoidMatter(v => v - cost); },
            ascendToVoid: () => {
                const currentFloor = stateRef.current.tower.floor || 1;
                if (currentFloor < 100) {
                    addLog(`Ascensão bloqueada! Você precisa alcançar o Andar 100 da Torre. (Atual: ${currentFloor})`, 'error');
                    return;
                }
                // Perform Void Ascension: reset progress, gain permanent power
                setVoidAscensions(a => a + 1);
                setDivinity(d => d + 1);
                setSouls(0);
                setGold(0);
                setItems([]);
                world.setTower(p => ({ ...p, floor: 1, active: false }));
                setBoss(INITIAL_BOSS);
                setHeroes(prev => prev.map(h => ({ ...h, level: 1 })));
                addLog('🌌 ASCENSÃO DO VAZIO! Seu progresso foi reiniciado, mas você ganhou poder permanente! +1 Divindade, +1 Ascensão do Vazio.', 'achievement');
                soundManager.playLevelUp();
            },
            transmuteResources: (from: keyof Resources, to: keyof Resources, amount: number) => {
                const res = transmuteResources(from, to, amount, stateRef.current.resources);
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
                const hero = stateRef.current.heroes.find(h => h.id === heroId);
                const hasResources = elixir.cost.every(c => (stateRef.current.resources[c.type as keyof Resources] || 0) >= c.amount);

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
                const hasGoldenFish = stateRef.current.equippedRelics.includes('relic_golden_fish');
                const bonus = (stateRef.current.achievements.find(a => a.id === 'fi1')?.isUnlocked ? 0.1 : 0);
                const res = processFishingAdvanced(1, bonus);
                if (res.fish > 0) setResources(r => ({ ...r, fish: r.fish + res.fish }));
                
                let isLegendary = res.legendary;
                if (!isLegendary && hasGoldenFish && res.fish > 0) {
                    if (Math.random() < 0.01 + (bonus / 10)) {
                        isLegendary = true;
                    }
                }

                if (isLegendary) {
                    setGameStats(s => ({ ...s, legendaryFishCount: (s.legendaryFishCount || 0) + 1 }));
                    addLog("🎣 Você pescou um PEIXE LENDÁRIO!", "achievement");
                }
            },
            brewPotion: (id: string) => {
                const pot = POTIONS.find(p => p.id === id); 
                const hasScroll = stateRef.current.equippedRelics.includes('relic_alchemy_scroll');
                const costMultiplier = hasScroll ? 0.8 : 1.0;

                if (pot && brewPotion(pot, stateRef.current.resources, costMultiplier).success) {
                    setResources(r => {
                        const n = { ...r };
                        (pot.cost as any[]).forEach(c => {
                            const actualCost = Math.floor(c.amount * costMultiplier);
                            (n as any)[c.type] -= actualCost;
                        });
                        return n;
                    });
                    setActivePotions(p => [...p, { id: pot.id, name: pot.name, effect: pot.effect, value: pot.value, endTime: Date.now() + pot.duration * 1000 }]);
                }
            },
            startExpedition: (e: Expedition) => { setHeroes(startExpedition(e, stateRef.current.heroes)); setActiveExpeditions(p => [...p, e]); },
            startGuildExpedition: (e: Expedition) => {
                if (validateGuildExpeditionTeam(e.heroIds, stateRef.current.heroes)) {
                    setHeroes(startExpedition(e, stateRef.current.heroes));
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
            buyMarketItem: (item: MarketItem) => { if (stateRef.current.gold >= item.cost) { setGold(g => g - item.cost); setMarketStock(p => p.filter(i => i.id !== item.id)); } },
            enterRift: (rift: Rift) => world.enterRift(rift),
            exitRift: (success: boolean) => {
                world.exitRift(success);
                if (success) {
                    if (Math.random() < 0.4) {
                        const combatants = stateRef.current.heroes.filter(h => h.assignment === 'combat');
                        if (combatants.length > 0) {
                            const luckyHero = combatants[Math.floor(Math.random() * combatants.length)];
                            const curseList = ['blood', 'evil', 'abyss'];
                            const currentCurses = luckyHero.curses || [];
                            const availableCurses = curseList.filter(c => !currentCurses.includes(c));
                            if (availableCurses.length > 0) {
                                const newCurse = availableCurses[Math.floor(Math.random() * availableCurses.length)];
                                setHeroes(prev => prev.map(h => h.id === luckyHero.id ? { ...h, curses: [...(h.curses || []), newCurse] } : h));
                                addLog(`⚠️ ${luckyHero.name} foi amaldiçoado com ${newCurse === 'blood' ? 'Maldição do Sangue 🩸' : newCurse === 'evil' ? 'Olho Maligno 👁️' : 'Correntes do Abismo ⛓️'}!`, 'danger');
                            }
                        }
                    }
                }
            },
            startRift: () => world.startRift(), selectBlessing: (b: RiftBlessing) => world.selectBlessing(b),
            saveFormation: (n: string) => world.saveFormation(n, activeHeroes.map(h => h.id)),
            loadFormation: (id: string) => {
                const formation = world.loadFormation(id);
                if (formation) {
                    setHeroes(prev => prev.map(h => {
                        const inFormation = formation.heroIds.includes(h.id);
                        if (inFormation) {
                            return { ...h, assignment: 'combat' };
                        } else if (h.assignment === 'combat') {
                            if (h.curses?.includes('abyss')) {
                                return h;
                            }
                            return { ...h, assignment: 'none' };
                        }
                        return h;
                    }));
                    addLog(`Formação carregada: ${formation.name}`, 'success');
                }
            },
            deleteFormation: (id: string) => world.deleteFormation(id),
            upgradeMonument: (id: string) => guildState.upgradeMonument(id),

            attackWorldBoss: () => worldBossState.attackWorldBoss(), claimWorldBossReward: () => worldBossState.claimReward(),
            challengeVoidCore: () => { if (voidMatter >= 10) addLog("Challenging Void Core...", "danger"); },
            setVictory: (v: boolean) => setVictory(v),
            interactWithEvent: (id: string, action: 'buy' | 'defend' | 'join', data?: any) => {
                if (activeEvent?.id === id && action === 'buy') {
                    const item = data?.item;
                    if (!item) return;
                    const cost = item.value;
                    if (stateRef.current.gold >= cost) {
                        setGold(g => g - cost);
                        setActiveEvent(prev => {
                            if (!prev || !prev.items) return prev;
                            return { ...prev, items: prev.items.filter(i => i.id !== item.id) };
                        });

                        if (item.name.includes('Convite')) {
                            const locked = stateRef.current.heroes.filter(h => !h.unlocked);
                            if (locked.length > 0) {
                                const recruit = locked[Math.floor(Math.random() * locked.length)];
                                setHeroes(p => p.map(h => h.id === recruit.id ? { ...h, unlocked: true } : h));
                                addLog(`🎪 Circo: Você recrutou ${recruit.name}!`, 'success');
                            } else {
                                addLog(`🎪 Circo: Todos os heróis já estão recrutados. Reembolsando custo...`, 'info');
                                setGold(g => g + cost);
                            }
                        } else if (item.name.includes('Saco Misterioso')) {
                            const randVal = Math.random();
                            if (randVal < 0.4) {
                                const soulsGained = 500;
                                setSouls(s => s + soulsGained);
                                addLog(`🎪 Circo: O Saco Misterioso continha ${soulsGained} Almas!`, 'success');
                            } else if (randVal < 0.8) {
                                const goldGained = 5000;
                                setGold(g => g + goldGained);
                                addLog(`🎪 Circo: O Saco Misterioso continha ${goldGained} Ouro!`, 'success');
                            } else {
                                const newPet = {
                                    id: `pet-circus-${Date.now()}`,
                                    name: 'Coelho da Cartola',
                                    type: 'pet',
                                    emoji: '🐇',
                                    rarity: Math.random() < 0.7 ? 'common' : Math.random() < 0.9 ? 'rare' : 'epic',
                                    level: 1,
                                    xp: 0,
                                    maxXp: 100,
                                    bonus: Math.random() < 0.7 ? '+5% Speed' : Math.random() < 0.9 ? '+10% Speed' : '+20% Speed',
                                    stats: { hp: 0, maxHp: 0, mp: 0, maxMp: 0, attack: 1, defense: 0, magic: 1, speed: 10 },
                                    isDead: false
                                };
                                petsState.setPets(p => [...p, newPet as any]);
                                addLog(`🎪 Circo: Você ganhou um Pet raro: ${newPet.name}!`, 'success');
                            }
                        } else {
                            setItems(p => [...p, item]);
                            addLog(`🎪 Circo: Comprou ${item.name}!`, 'success');
                        }
                    } else {
                        addLog(`Ouro insuficiente para comprar este item.`, 'error');
                    }
                }
            },
            removeCurse: (heroId: string, curse: string) => {
                const h = stateRef.current.heroes.find(x => x.id === heroId);
                const cost = 50000;
                if (h && h.curses?.includes(curse) && stateRef.current.gold >= cost) {
                    setGold(g => g - cost);
                    setHeroes(p => p.map(curr => curr.id === heroId ? { ...curr, curses: (curr.curses || []).filter(c => c !== curse) } : curr));
                    addLog(`✨ A maldição foi purificada de ${h.name} por ${cost} Ouro!`, 'success');
                } else if (h && !h.curses?.includes(curse)) {
                    addLog(`${h.name} não possui essa maldição.`, 'info');
                } else {
                    addLog(`Ouro insuficiente para purificar a maldição (${cost} Ouro).`, 'error');
                }
            },
            pledgeDeity: (deityId: string | null) => {
                setPatronDeity(deityId);
                setDeityLevel(1);
                setDeityFavor(0);
                setDeityEnergy(0);
                if (deityId) {
                    const DEITIES_MOCK = [
                        { id: 'aurelius', name: 'Aurelius, o Pai do Sol' },
                        { id: 'tenebris', name: 'Tenebris, o Tecelão do Vazio' },
                        { id: 'gaya', name: 'Gaya, a Matriarca da Terra' }
                    ];
                    const d = DEITIES_MOCK.find(x => x.id === deityId);
                    addLog(`🏛️ Sua guilda se consagrou a ${d ? d.name : deityId}!`, 'success');
                } else {
                    addLog(`🏛️ Sua guilda renegou seu antigo deus padroeiro.`, 'info');
                }
            },
            offerToDeity: (offeringType: 'souls' | 'divinity') => {
                let costMet = false;
                if (offeringType === 'souls' && stateRef.current.souls >= 5000) {
                    setSouls(s => s - 5000);
                    costMet = true;
                    addLog(`⛪ Você ofereceu 5000 Almas ao seu Deus Padroeiro!`, 'success');
                } else if (offeringType === 'divinity' && stateRef.current.divinity >= 100) {
                    setDivinity(d => d - 100);
                    costMet = true;
                    addLog(`⛪ Você ofereceu 100 de Divindade ao seu Deus Padroeiro!`, 'success');
                } else {
                    addLog(`Recursos insuficientes para a oferenda.`, 'error');
                }

                if (costMet) {
                    const currentLevel = stateRef.current.deityLevel;
                    const currentFavor = stateRef.current.deityFavor;
                    let newFavor = currentFavor + 500;
                    const req = currentLevel * 1000;
                    if (newFavor >= req) {
                        newFavor -= req;
                        setDeityLevel(currentLevel + 1);
                        addLog(`✨ O favor de seu Deus aumentou! Nível do Padroeiro subiu para ${currentLevel + 1}!`, 'achievement');
                    }
                    setDeityFavor(newFavor);
                }
            },
            enshrineHero: (slotIndex: number, heroId: string | null) => {
                if (heroId) {
                    const hero = stateRef.current.heroes.find(h => h.id === heroId);
                    if (!hero || !hero.isAwakened) {
                        addLog(`Apenas heróis Despertados podem ser consagrados no Panteão!`, 'error');
                        return;
                    }
                }
                setMonuments(prev => {
                    const next = [...prev];
                    if (heroId) {
                        const existingIndex = prev.indexOf(heroId);
                        if (existingIndex !== -1 && existingIndex !== slotIndex) {
                            next[existingIndex] = null;
                        }
                    }
                    next[slotIndex] = heroId;
                    return next;
                });
                if (heroId) {
                    const hero = stateRef.current.heroes.find(h => h.id === heroId);
                    addLog(`🏛️ ${hero ? hero.name : 'Herói'} consagrado no Panteão da Eternidade!`, 'success');
                } else {
                    addLog(`🏛️ Estátua removida do Panteão.`, 'info');
                }
            },
            dismissEvent: () => setActiveEvent(null),
            buyMasteryUpgrade: (type: keyof import('../engine/types').DungeonMastery) => {
                const cost = (stateRef.current.dungeonMastery[type] + 1) * 1000;
                if (stateRef.current.souls >= cost) { setSouls(s => s - cost); setDungeonMastery(prev => ({ ...prev, [type]: prev[type] + 1 })); }
            },
            assignHero: (id: string, assignment?: Hero['assignment']) => {
                const h = stateRef.current.heroes.find(x => x.id === id);
                if (h && h.curses?.includes('abyss') && h.assignment === 'combat') {
                    addLog(`${h.name} está preso pelas Correntes do Abismo e não pode deixar o combate!`, 'error');
                    return;
                }
                setHeroes(p => p.map(h => {
                    if (h.id === id) {
                        if (assignment) {
                            return { ...h, assignment };
                        }
                        return { ...h, assignment: h.assignment === 'combat' ? 'none' : 'combat' };
                    }
                    return h;
                }));
            },
            manualAttack: () => {
                const dmg = Math.max(1, Math.floor(stateRef.current.partyPower * 0.05)); // 5% of party power per click

                // Track click stat
                setGameStats(s => ({ ...s, clicks: (s.clicks || 0) + 1, totalDamageDealt: (s.totalDamageDealt || 0) + dmg }));

                // Add click damage to dps accumulator
                damageAccumulator.current += dmg;

                // Deal damage (will be processed on next tick or instantly depending on HP)
                if (stateRef.current.tower.active) {
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
            },
            buyRelic: (relicId: string) => {
                const relic = CHAMBER_RELICS.find(r => r.id === relicId);
                if (!relic) return;
                if (stateRef.current.ownedRelics.includes(relicId)) return;

                if (relic.currency === 'gold') {
                    if (stateRef.current.gold >= relic.cost) {
                        setGold(g => g - relic.cost);
                    } else {
                        addLog(`Gold insuficiente para comprar ${relic.name}!`, 'danger');
                        return;
                    }
                } else if (relic.currency === 'souls') {
                    if (stateRef.current.souls >= relic.cost) {
                        setSouls(s => s - relic.cost);
                    } else {
                        addLog(`Almas insuficientes para comprar ${relic.name}!`, 'danger');
                        return;
                    }
                } else if (relic.currency === 'voidMatter') {
                    if (stateRef.current.voidMatter >= relic.cost) {
                        setVoidMatter(v => v - relic.cost);
                    } else {
                        addLog(`Matéria do Vazio insuficiente para comprar ${relic.name}!`, 'danger');
                        return;
                    }
                }

                setOwnedRelics(prev => [...prev, relicId]);
                addLog(`Relíquia desbloqueada: ${relic.name}!`, 'success');
            },
            equipRelic: (relicId: string, slotIndex: number) => {
                if (!stateRef.current.ownedRelics.includes(relicId)) return;
                setEquippedRelics(prev => {
                    const next = [...prev];
                    while (next.length <= slotIndex) {
                        next.push('');
                    }
                    const existingIndex = next.indexOf(relicId);
                    if (existingIndex !== -1) {
                        next[existingIndex] = '';
                    }
                    next[slotIndex] = relicId;
                    return next;
                });
                const relic = CHAMBER_RELICS.find(r => r.id === relicId);
                addLog(`Relíquia equipada no Slot ${slotIndex + 1}: ${relic ? relic.name : relicId}`, 'success');
            },
            unequipRelic: (slotIndex: number) => {
                setEquippedRelics(prev => {
                    const next = [...prev];
                    if (slotIndex < next.length) {
                        const relicId = next[slotIndex];
                        next[slotIndex] = '';
                        const relic = CHAMBER_RELICS.find(r => r.id === relicId);
                        addLog(`Relíquia removida do Slot ${slotIndex + 1}: ${relic ? relic.name : relicId}`, 'info');
                    }
                    return next;
                });
            },
            upgradeResonance: (element: ElementType) => {
                setElementalResonance(prevRes => {
                    const level = prevRes[element] || 0;
                    const cost = Math.floor(10 * Math.pow(1.5, level));
                    const essence = elementalEssences[element] || 0;

                    if (essence >= cost) {
                        setElementalEssences(prevEss => ({
                            ...prevEss,
                            [element]: prevEss[element] - cost
                        }));
                        addLog(`🏛️ Ressonância Elemental de ${element} melhorada para Nível ${level + 1}!`, 'success');
                        return {
                            ...prevRes,
                            [element]: level + 1
                        };
                    } else {
                        addLog(`Essência de ${element} insuficiente!`, 'danger');
                        return prevRes;
                    }
                });
            },
            startBossRush: () => {
                addLog("Boss Rush não está disponível nesta versão.", "info");
            },
            infuseItemWithVoid: (itemId: string) => {
                if (stateRef.current.voidMatter < 50) {
                    addLog("Matéria do Vazio insuficiente!", "danger");
                    return;
                }
                const affixes = [
                    { id: 'void_execute', name: 'Toque Abissal', stat: 'execute', value: 0.1 },
                    { id: 'void_lifesteal', name: 'Dreno de Vácuo', stat: 'lifesteal', value: 0.025 },
                    { id: 'void_damage', name: 'Entropia', stat: 'damage', value: 0.2 },
                    { id: 'void_dodge', name: 'Dobra Espacial', stat: 'dodge', value: 0.12 },
                    { id: 'void_crit_dmg', name: 'Pacto Sombrio', stat: 'crit_dmg', value: 0.35 }
                ];
                const randomAffix = affixes[Math.floor(Math.random() * affixes.length)];
                
                setItems(prevItems => {
                    const exists = prevItems.some(i => i.id === itemId);
                    if (!exists) return prevItems;
                    
                    setVoidMatter(v => v - 50);
                    
                    return prevItems.map(item => {
                        if (item.id === itemId) {
                            addLog(`🌌 Item ${item.name} infundido com ${randomAffix.name}!`, 'achievement');
                            return {
                                ...item,
                                voidAffix: randomAffix
                            };
                        }
                        return item;
                    });
                });
            }
        };
        return baseActions as any as GameActions;
    }, [petsState.setPets, guildState.setGuild, guildState.joinGuild, guildState.contributeGuild, guildState.upgradeMonument, galaxyState.setTerritories, galaxyState.setSpaceship, galaxyState.setGalaxy, galaxyState.attackSector, galaxyState.upgradeSpaceship, world.setTower, world.setTowerBoss, world.setWeather, world.setWeatherTimer, world.enterDungeon, world.descendDungeon, world.exitDungeon, world.moveDungeon, world.enterRift, world.exitRift, world.startRift, world.selectBlessing, world.saveFormation, world.loadFormation, world.deleteFormation, world.setDungeonActive, voidGuardian.startChallenge, worldBossState.attackWorldBoss, worldBossState.claimReward, backrooms.researchTech, backrooms.setBackroomsResources, addLog, setIsSoundOn, setGameSpeed, setHeroes, setGold, setSouls, setTalents, setDivinity, setConstellations, setArtifacts, setClassMastery, setStarlightUpgrades, setStarlight, setPrestigeNodes, setTownVisited, setTown, setMarketStock, setArenaOpponents, setArenaRank, setGlory, setGuildQueue, setFakePlayers, setGvgWarState, setCurrentTutorialIndex, setActiveEvent, setDailyLoginClaimed, setDailyQuests, setLastDailyReset, setVoidActive, setVoidTimer, setRaidActive, setRaidTimer, setMonuments, setDungeonMastery, setTheme, setAutoSellRarity, setOfflineGains, ownedRelics, equippedRelics, elementalResonance, elementalEssences, voidMatter]);

    // CORE LOOP (STABILIZED - Phase Memory Fix)
    useEffect(() => {
        const runTick = () => {
            const { souls, talents, constellations, artifacts, cards, achievements, pets, activeSynergies, boss, ultimateCharge, gold, gameSpeed, galaxyDamageMult, artifactMultipliers, tower, towerBoss } = stateRef.current;
            if (activeHeroes.length === 0 && !tower.active) return;

            const monumentMults = getMonumentMultipliers();

            const isTower = tower.active;
            let targetBoss = isTower ? towerBoss : boss;

            // Sync check: Ensure tower boss stats match the current floor, resolving loaded discrepancies.
            if (isTower && towerBoss.level !== tower.floor) {
                const correctedBoss = getNextBoss(tower.floor);
                correctedBoss.id = `tower-${tower.floor}`;
                world.setTowerBoss(correctedBoss);
                targetBoss = correctedBoss;
            }

            // VOID BOSS EMOJI FIX
            if (voidActive && !isTower) {
                targetBoss = {
                    ...targetBoss,
                    name: "Entidade Galáctica",
                    emoji: "🌌"
                };
            }

            const windmillsMult = backrooms.backroomsUnlockedTechs.includes('windmills') ? 1.05 : 1.0;
            const effectiveGameSpeed = gameSpeed * (equippedRelics.includes('relic_hourglass') ? 1.10 : 1.0);
            const attackSpeedBonusSum = (activeSynergies || []).filter(s => s.type === 'attackSpeed').reduce((acc, s) => acc + s.value, 0) + (elementalResonance.nature || 0) * 0.02;
            const tick = Math.max(100, (1000 / (effectiveGameSpeed * windmillsMult)) * (1 - attackSpeedBonusSum));

            if (shouldSummonTavern(gold, starlightUpgrades)) ACTIONS.summonTavernLine(1);

            // Passive recovery & campfire recovery of fatigue & team morale
            const campfireCount = stateRef.current.heroes.filter(h => h.assignment === 'campfire').length;
            const moraleRecovery = 0.1 + (campfireCount * 0.5);
            if (stateRef.current.teamMorale < 100) {
                setTeamMorale(prev => Math.min(100, prev + moraleRecovery));
            }

            // Accumulate bond XP for combat partners
            const livingCombatants = stateRef.current.heroes.filter(h => h.assignment === 'combat');
            if (livingCombatants.length >= 2) {
                let anyLevelUp = false;
                for (let i = 0; i < livingCombatants.length; i++) {
                    for (let j = i + 1; j < livingCombatants.length; j++) {
                        const id1 = livingCombatants[i].id;
                        const id2 = livingCombatants[j].id;
                        const key = [id1, id2].sort().join('-');

                        const current = heroBonds[key] || { xp: 0, level: 1, type: 'comrades' };
                        if (current.level >= 3) continue;

                        bondXpAccumulatorRef.current[key] = (bondXpAccumulatorRef.current[key] || 0) + 1;
                        const accumulatedXp = current.xp + bondXpAccumulatorRef.current[key];
                        const maxXP = current.level === 2 ? 300 : 100;
                        if (accumulatedXp >= maxXP) {
                            anyLevelUp = true;
                        }
                    }
                }

                bondTicksRef.current += 1;

                if (anyLevelUp || bondTicksRef.current >= 10) {
                    setHeroBonds(prev => {
                        const next = { ...prev };
                        let updated = false;

                        Object.entries(bondXpAccumulatorRef.current).forEach(([key, accumulatedXp]) => {
                            if (accumulatedXp <= 0) return;
                            const current = next[key] || { xp: 0, level: 1, type: 'comrades' };
                            if (current.level >= 3) return;

                            let nextXp = current.xp + accumulatedXp;
                            let nextLvl = current.level;
                            let maxXP = nextLvl === 2 ? 300 : 100;

                            while (nextXp >= maxXP && nextLvl < 3) {
                                nextXp -= maxXP;
                                nextLvl++;
                                if (nextLvl === 2) {
                                    const types: ('comrades' | 'rivals' | 'soulmates')[] = ['comrades', 'rivals', 'soulmates'];
                                    current.type = types[Math.floor(Math.random() * types.length)];
                                }
                                const [id1, id2] = key.split('-');
                                const h1 = stateRef.current.heroes.find(h => h.id === id1);
                                const h2 = stateRef.current.heroes.find(h => h.id === id2);
                                const name1 = h1 ? h1.name : "Herói 1";
                                const name2 = h2 ? h2.name : "Herói 2";
                                addLog(`💞 O vínculo entre ${name1} e ${name2} subiu para o Nível ${nextLvl}!`, 'achievement');
                                maxXP = nextLvl === 2 ? 300 : 100;
                            }

                            next[key] = { xp: nextXp, level: nextLvl, type: current.type };
                            updated = true;
                        });

                        return updated ? next : prev;
                    });

                    bondXpAccumulatorRef.current = {};
                    bondTicksRef.current = 0;
                }
            }

            const voidExecuteCount = items.filter(item => item.voidAffix?.id === 'void_execute').length;
            const voidDodgeCount = items.filter(item => item.voidAffix?.id === 'void_dodge').length;
            const voidLifestealCount = items.filter(item => item.voidAffix?.id === 'void_lifesteal').length;
            const voidDamageCount = items.filter(item => item.voidAffix?.id === 'void_damage').length;

            if (voidDamageCount > 0 && !targetBoss.isDead) {
                setHeroes(prev => prev.map(h => {
                    if (h.assignment === 'combat' && h.unlocked && !h.isDead) {
                        const selfDmg = Math.max(1, Math.floor(h.stats.maxHp * 0.01 * voidDamageCount));
                        const newHp = Math.max(1, (h.stats.hp ?? h.stats.maxHp) - selfDmg);
                        return { ...h, stats: { ...h.stats, hp: newHp } };
                    }
                    return h;
                }));
            }

            const moraleDamageMult = 0.5 + (teamMorale / 100) * 0.6;
            const fireResMult = 1 + (elementalResonance.fire || 0) * 0.025;
            const entropyDmgMult = 1 + voidDamageCount * 0.20;
            const totalDmgMult = calculateDamageMultiplier(souls, talents, constellations, artifacts, targetBoss, cards, achievements, pets, galaxyDamageMult) * artifactMultipliers.damage * moraleDamageMult * monumentMults.attack * fireResMult * entropyDmgMult;
            
            const synergiesForCombat = [...activeSynergies];
            if (backrooms.backroomsUnlockedTechs.includes('quantum_computing')) {
                const existingIndex = synergiesForCombat.findIndex(s => s.type === 'crit_dmg');
                if (existingIndex !== -1) {
                    synergiesForCombat[existingIndex] = {
                        ...synergiesForCombat[existingIndex],
                        value: synergiesForCombat[existingIndex].value + 0.25
                    };
                } else {
                    synergiesForCombat.push({ type: 'crit_dmg', value: 0.25 } as any);
                }
            }

            // Nature speed resonance
            const natureSpeed = (elementalResonance.nature || 0) * 0.02;
            if (natureSpeed > 0) {
                const idx = synergiesForCombat.findIndex(s => s.type === 'attackSpeed');
                if (idx !== -1) synergiesForCombat[idx].value += natureSpeed;
                else synergiesForCombat.push({ type: 'attackSpeed', value: natureSpeed } as any);
            }

            // Light lifesteal resonance + Void lifesteal
            const lifestealBonus = (elementalResonance.light || 0) * 0.01 + voidLifestealCount * 0.025;
            if (lifestealBonus > 0) {
                const idx = synergiesForCombat.findIndex(s => s.type === 'vampirism');
                if (idx !== -1) synergiesForCombat[idx].value += lifestealBonus;
                else synergiesForCombat.push({ type: 'vampirism', value: lifestealBonus } as any);
            }

            // Dark crit damage resonance
            const darkCritDmg = (elementalResonance.dark || 0) * 0.02;
            if (darkCritDmg > 0) {
                const idx = synergiesForCombat.findIndex(s => s.type === 'crit_dmg');
                if (idx !== -1) synergiesForCombat[idx].value += darkCritDmg;
                else synergiesForCombat.push({ type: 'crit_dmg', value: darkCritDmg } as any);
            }

            // Void dodge
            if (voidDodgeCount > 0) {
                synergiesForCombat.push({ type: 'void_dodge', value: voidDodgeCount * 0.12 } as any);
            }

            // Void execute
            if (voidExecuteCount > 0) {
                synergiesForCombat.push({ type: 'void_execute', value: voidExecuteCount } as any);
            }

            const res = processCombatTurn(activeHeroesWithBonusStats, targetBoss, totalDmgMult, 0.1, ultimateCharge >= 100, pets, tick, 1, synergiesForCombat, world.riftState.active ? (world.activeRift?.restriction || undefined) : undefined, isTower ? ((targetBoss as any)?.mutator || undefined) : undefined, world.weather, divinity, heroBonds, monumentMults, equippedRelics);

            damageAccumulator.current += res.totalDmg;

            if (stateRef.current.patronDeity && !targetBoss.isDead) {
                setDeityEnergy(prev => {
                    const next = prev + 1; // 1% charge per tick
                    if (next >= 100) {
                        const level = stateRef.current.deityLevel;
                        if (stateRef.current.patronDeity === 'aurelius') {
                            const avgAtk = activeHeroesWithBonusStats.length > 0
                                ? activeHeroesWithBonusStats.reduce((sum, h) => sum + h.stats.attack, 0) / activeHeroesWithBonusStats.length
                                : 20;
                            const activeSpellDmg = Math.floor(avgAtk * 50 * level);
                            damageAccumulator.current += activeSpellDmg;
                            addLog(`✨ Aurelius, o Pai do Sol conjura Meteoro Solar causando ${activeSpellDmg.toLocaleString()} de dano!`, 'success');
                        } else if (stateRef.current.patronDeity === 'tenebris') {
                            setHeroes(prevHeroes => prevHeroes.map(h => {
                                if (h.assignment === 'combat' && !h.isDead) {
                                    const healAmount = Math.floor(h.stats.maxHp * 0.3 * level);
                                    const newHp = Math.min(h.stats.maxHp, h.stats.hp + healAmount);
                                    return { ...h, stats: { ...h.stats, hp: newHp } };
                                }
                                return h;
                            }));
                            addLog(`🌌 Tenebris, o Tecelão do Vazio invoca Barreira Entrópica protegendo a equipe!`, 'success');
                        } else if (stateRef.current.patronDeity === 'gaya') {
                            setHeroes(prevHeroes => prevHeroes.map(h => {
                                if (h.assignment === 'combat' && !h.isDead) {
                                    return { ...h, stats: { ...h.stats, hp: h.stats.maxHp, mp: h.stats.maxMp } };
                                }
                                return h;
                            }));
                            addLog(`🌿 Gaya, a Matriarca da Terra canaliza Rejuvenescimento Telúrico restaurando toda a equipe!`, 'success');
                        }
                        return 0;
                    }
                    return next;
                });
            }

            if (res.events && res.events.length > 0) {
                setCombatEvents(prev => [...prev, ...res.events].slice(-5));
            }

            const petDpsBonus = (pets || []).reduce((sum, pet) => sum + (pet.level * 5), 0);
            if (petDpsBonus > 0) damageAccumulator.current += petDpsBonus * (tick / 1000);

            if (ultimateCharge >= 100) setUltimateCharge(0);
            else setUltimateCharge(p => Math.min(100, p + 5));

            let bossDefeated = false;
            const currentBoss = { ...targetBoss };

            // Apply Galaxy Gold/XP Buffs to the gains
            const townHallLevel = buildings.find(b => b.id === 'town_hall')?.level || 0;
            const townHallGoldMult = 1 + (townHallLevel * 0.05); // 5% per level

            const steamEngineMult = backrooms.backroomsUnlockedTechs.includes('steam_engine') ? 1.15 : 1.0;
            const cleanFusionMult = backrooms.backroomsUnlockedTechs.includes('clean_fusion') ? 1.20 : 1.0;
            const resonanceGoldMult = 1 + (elementalResonance.neutral || 0) * 0.015;
            const finalGoldMult = guildGoldMult * prestigeGoldMult * (1 + (galaxyState.galaxyBuffs.goldMult || 0)) * townHallGoldMult * monumentMults.gold * steamEngineMult * cleanFusionMult * resonanceGoldMult;
            const resonanceXpMult = 1 + (elementalResonance.neutral || 0) * 0.015;
            const finalXpMult = guildXpMult * prestigeXpMult * (1 + (galaxyState.galaxyBuffs.xpMult || 0)) * cleanFusionMult * resonanceXpMult;

            const moraleXpMult = 0.5 + (teamMorale / 100) * 0.7;

            if (res.totalDmg >= currentBoss.stats.hp) {
                bossDefeated = true;

                // Aumenta a moral nas vitórias
                if (stateRef.current.teamMorale < 100) {
                    setTeamMorale(prev => Math.min(100, prev + 5));
                }

                const xpGain = Math.floor(currentBoss.level * 10 * finalXpMult * moraleXpMult);
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
                if (isTower) {
                    const nextLevel = tower.floor + 1;
                    const nextBossData = getNextBoss(nextLevel);
                    world.setTower(p => ({ ...p, floor: p.floor + 1, maxFloor: Math.max(p.maxFloor, p.floor + 1) }));
                    world.setTowerBoss({ ...nextBossData, id: `tower-${nextLevel}` });
                    addLog(`Torre Andar ${tower.floor} Concluído! Heróis ganharam ${xpGain} XP. Próximo: ${nextBossData.name}`, 'success');
                } else {
                    const nextLevel = currentBoss.level + 1;
                    const nextBossData = getNextBoss(nextLevel);
                    setBoss(p => ({ ...p, ...nextBossData }));
                    addLog(`Boss ${currentBoss.name} Derrotado! Heróis ganharam ${xpGain} XP. Próximo: ${nextBossData.name}`, 'success');
                }
                // Reset timer on boss kill (advance to next level)
                bossTimerRef.current = 60;
                setBossTimer(60);

                // Award Class Mastery XP
                const combatClasses = new Set(activeHeroesWithBonusStats.map(h => h.class));
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
                // Tick the boss timer down proportionally to tick duration
                const timerDelta = tick / 1000;
                const newTimerVal = bossTimerRef.current - timerDelta;

                if (newTimerVal <= 0 && !isTower) {
                    // Timer expired — boss stays alive, just reset timer for a new attempt
                    bossTimerRef.current = 60;
                    setBossTimer(60);
                    addLog(`⏱️ Tentativa falhou! O ${currentBoss.name} ainda está vivo. Nova tentativa de 60s!`, 'danger');
                    // Still apply damage from this tick
                    setBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - res.totalDmg } }));
                } else {
                    bossTimerRef.current = Math.max(0, newTimerVal);
                    setBossTimer(Math.ceil(bossTimerRef.current));
                    if (isTower) {
                        world.setTowerBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - res.totalDmg } }));
                    } else {
                        setBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - res.totalDmg } }));
                    }
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
                let mYield = processMining(miners);

                // Passive extraction from vacuum_siphon
                if (!mYield && backrooms.backroomsUnlockedTechs.includes('vacuum_siphon') && Math.random() < 0.15) {
                    const roll = Math.random();
                    if (roll < 0.10) {
                        mYield = { mithril: 1 };
                    } else if (roll < 0.40) {
                        mYield = { iron: 1 };
                    } else {
                        mYield = { copper: 1 };
                    }
                }

                if (mYield) {
                    let copperGain = mYield.copper || 0;
                    let ironGain = mYield.iron || 0;
                    let mithrilGain = mYield.mithril || 0;

                    if (backrooms.backroomsUnlockedTechs.includes('iron_metallurgy')) {
                        if (copperGain > 0 && Math.random() < 0.15) copperGain++;
                        if (ironGain > 0 && Math.random() < 0.15) ironGain++;
                    }

                    if (backrooms.backroomsUnlockedTechs.includes('large_mining')) {
                        if (copperGain > 0 && Math.random() < 0.25) copperGain++;
                        if (ironGain > 0 && Math.random() < 0.25) ironGain++;
                        if (mithrilGain > 0 && Math.random() < 0.25) mithrilGain++;
                    }

                    if (copperGain > 0 || ironGain > 0 || mithrilGain > 0) {
                        setResources(r => ({
                            ...r,
                            copper: r.copper + copperGain,
                            iron: r.iron + ironGain,
                            mithril: r.mithril + mithrilGain
                        }));
                    }
                }

                let changed = false;
                const combatHeroMap = new Map(res.updatedHeroes.map(h => [h.id, h]));
                const combatHeroList = prev.filter(oth => oth.assignment === 'combat');
                const rivalXpMults = new Map<string, number>();
                if (bossDefeated) {
                    combatHeroList.forEach(ch => {
                        let mult = finalXpMult;
                        combatHeroList.forEach(oth => {
                            if (oth.id !== ch.id) {
                                const key = ch.id < oth.id ? `${ch.id}-${oth.id}` : `${oth.id}-${ch.id}`;
                                const bond = heroBonds[key];
                                if (bond && bond.level >= 3 && bond.type === 'rivals') {
                                    mult *= 1.2;
                                }
                            }
                        });
                        rivalXpMults.set(ch.id, mult);
                    });
                }

                const nextHeroes = prev.map(oldHero => {
                    const combatHero = combatHeroMap.get(oldHero.id);
                    let h = combatHero || oldHero;

                    if (h.isDead) {
                        const autoReviveSpeed = backrooms.backroomsUnlockedTechs.includes('silicon_network') ? 1.10 : 1.0;
                        const hpRecover = Math.floor(h.stats.maxHp * 0.10 * autoReviveSpeed);
                        const nextHp = Math.min(h.stats.maxHp, (h.stats.hp || 0) + hpRecover);
                        let isDead: boolean = h.isDead;
                        if (nextHp >= h.stats.maxHp) {
                            isDead = false;
                            addLog(`🛡️ Auto-Ressurreição: ${h.name} ressuscitou e está pronto para o combate!`, 'success');
                        }
                        h = { ...h, isDead, stats: { ...h.stats, hp: nextHp } };
                    }
                    const now = Date.now();

                    if (bossDefeated && combatHero) {
                        // Rivals bond: +20% XP
                        const xpMult = rivalXpMults.get(h.id) ?? finalXpMult;

                        const xpGain = Math.floor(currentBoss.level * 10 * xpMult * moraleXpMult);
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

                    // Auto-evolve if level >= 50 and prestige class is available
                    if (h.level >= 50 && (PRESTIGE_CLASSES as any)[h.class]) {
                        const nextClass = (PRESTIGE_CLASSES as any)[h.class];
                        h = { ...h, class: nextClass, level: 1, xp: 0, maxXp: 100 };
                        addLog(`🚀 Evolução Automática: ${h.name} evoluiu para ${nextClass}!`, 'success');
                    }

                    // Auto-allocate stat points
                    if (h.statPoints > 0) {
                        h = autoAllocateHeroStats(h);
                    }

                    if (h.level !== oldHero.level || h.class !== oldHero.class || !h.passiveSkillTree) {
                        h = initOrUpdateHeroPassiveTree(h);
                    }

                    if (h !== oldHero) changed = true;
                    return h;
                });


                return changed ? nextHeroes : prev;
            });

            // Global Automation Processing
            const autoResult = processGlobalAutomation(gameStats, resources, activeExpeditions, equippedRelics);
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

            // Auto-awakening logic
            let goldDeduction = 0;
            let soulsDeduction = 0;
            const awakenedHeroIds: string[] = [];

            stateRef.current.heroes.forEach(h => {
                if (h.unlocked && h.level >= 100 && !h.isAwakened) {
                    const currentGold = stateRef.current.gold - goldDeduction;
                    const currentSouls = stateRef.current.souls - soulsDeduction;
                    if (currentGold >= 100000 && currentSouls >= 50000) {
                        goldDeduction += 100000;
                        soulsDeduction += 50000;
                        awakenedHeroIds.push(h.id);
                    }
                }
            });

            if (awakenedHeroIds.length > 0) {
                setGold(g => Math.max(0, g - goldDeduction));
                setSouls(s => Math.max(0, s - soulsDeduction));
                setHeroes(prev => prev.map(h => {
                    if (awakenedHeroIds.includes(h.id)) {
                        addLog(`☄️ LIMIT BREAK! ${h.name} alcançou o Despertar automaticamente! Seus atributos explodiram de poder!`, 'achievement');
                        soundManager.playLevelUp();
                        return initOrUpdateHeroPassiveTree({
                            ...h,
                            isAwakened: true,
                            awakeningTitle: 'Desperto',
                            awakenedAt: Date.now(),
                            level: 100,
                            stats: {
                                ...h.stats,
                                maxHp: Math.floor(h.stats.maxHp * 1.5),
                                hp: Math.floor(h.stats.maxHp * 1.5),
                                attack: Math.floor(h.stats.attack * 1.5),
                                defense: Math.floor(h.stats.defense * 1.5),
                                magic: Math.floor(h.stats.magic * 1.5)
                            }
                        });

                    }
                    return h;
                }));
            }

            // Auto-feeding pets logic
            if (stateRef.current.pets && stateRef.current.pets.length > 0) {
                const currentGold = stateRef.current.gold - goldDeduction;
                const currentSouls = stateRef.current.souls - soulsDeduction;

                // Prioritize feeding with gold if gold > 1000
                if (currentGold > 1000) {
                    // Find pet with lowest level (and lowest XP to break ties)
                    let lowestPet = stateRef.current.pets[0];
                    for (let i = 1; i < stateRef.current.pets.length; i++) {
                        const p = stateRef.current.pets[i];
                        if (p.level < lowestPet.level || (p.level === lowestPet.level && p.xp < lowestPet.xp)) {
                            lowestPet = p;
                        }
                    }

                    // Deduct gold
                    setGold(g => Math.max(0, g - 100));

                    // Upgrade pet
                    petsState.setPets(prev => prev.map(p => {
                        if (p.id === lowestPet.id) {
                            let newXp = p.xp + 50;
                            let newLevel = p.level;
                            let newMaxXp = p.maxXp;
                            const newStats = p.stats ? { ...p.stats } : { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 };

                            while (newXp >= newMaxXp) {
                                newLevel++;
                                newXp -= newMaxXp;
                                newMaxXp = Math.floor(newMaxXp * 1.5);
                                newStats.attack = (newStats.attack || 0) + 1;
                                newStats.maxHp = (newStats.maxHp || 0) + 5;
                                newStats.hp = (newStats.hp || 0) + 5;
                                newStats.defense = (newStats.defense || 0) + 1;
                            }

                            return { ...p, level: newLevel, xp: newXp, maxXp: newMaxXp, stats: newStats };
                        }
                        return p;
                    }));
                } else if (currentSouls > 5000) {
                    // Feed with souls if gold is low but souls are high
                    let lowestPet = stateRef.current.pets[0];
                    for (let i = 1; i < stateRef.current.pets.length; i++) {
                        const p = stateRef.current.pets[i];
                        if (p.level < lowestPet.level || (p.level === lowestPet.level && p.xp < lowestPet.xp)) {
                            lowestPet = p;
                        }
                    }

                    // Deduct souls
                    setSouls(s => Math.max(0, s - 100));

                    // Upgrade pet
                    petsState.setPets(prev => prev.map(p => {
                        if (p.id === lowestPet.id) {
                            let newXp = p.xp + 150;
                            let newLevel = p.level;
                            let newMaxXp = p.maxXp;
                            const newStats = p.stats ? { ...p.stats } : { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 };

                            while (newXp >= newMaxXp) {
                                newLevel++;
                                newXp -= newMaxXp;
                                newMaxXp = Math.floor(newMaxXp * 1.5);
                                newStats.attack = (newStats.attack || 0) + 1;
                                newStats.maxHp = (newStats.maxHp || 0) + 5;
                                newStats.hp = (newStats.hp || 0) + 5;
                                newStats.defense = (newStats.defense || 0) + 1;
                            }

                            return { ...p, level: newLevel, xp: newXp, maxXp: newMaxXp, stats: newStats };
                        }
                        return p;
                    }));
                }
            }

            // Fake Players (Bots) Simulation Tick
            const botsResult = tickFakePlayers(stateRef.current.fakePlayers, calculatedPartyPower);
            if (botsResult.updatedBots) {
                setFakePlayers(botsResult.updatedBots);
            }
            if (botsResult.logEntries && botsResult.logEntries.length > 0) {
                botsResult.logEntries.forEach(log => {
                    addLog(log.message, log.type as any);
                });
            }
            // GvG War Simulation Tick (every ~5 seconds)
            if (stateRef.current.gvgWarState?.warActive) {
                const gvgNow = Date.now();
                const gvgLast = stateRef.current.gvgWarState.lastTickTime || 0;
                if (gvgNow - gvgLast >= 5000) {
                    const gvgResult = simulateGvGTick(stateRef.current.gvgWarState, stateRef.current.fakePlayers);
                    setGvgWarState(gvgResult);
                    // Send notable GvG logs to global game log
                    const newGvgLogs = gvgResult.warLogs.filter(l => l.timestamp >= gvgLast);
                    newGvgLogs.forEach(l => {
                        if (l.type === 'achievement' || l.type === 'danger') {
                            addLog(`[GvG] ${l.message}`, l.type as any);
                        }
                    });
                }
            }

            // Backrooms Simulation Tick
            backrooms.processBackroomsTick(1);

            // Tutorial progress check
            const tutorialIdx = stateRef.current.currentTutorialIndex;
            if (tutorialIdx !== undefined && tutorialIdx < TUTORIAL_STEPS.length) {
                const currentStep = TUTORIAL_STEPS[tutorialIdx];
                const fullState = {
                    gold: stateRef.current.gold,
                    buildings: stateRef.current.buildings,
                    backroomsUnlockedTechs: stateRef.current.backroomsUnlockedTechs,
                    backroomsFloor: stateRef.current.backroomsFloor
                };

                if (currentStep.checkCondition(fullState)) {
                    // Apply rewards
                    const reward = currentStep.reward;
                    if (reward.gold) setGold(g => g + reward.gold!);
                    if (reward.souls) setSouls(s => s + reward.souls!);
                    
                    if (reward.backroomsScrap || reward.almondWater || reward.anomalyParts) {
                        backrooms.setBackroomsResources(prev => ({
                            scrap: prev.scrap + (reward.backroomsScrap || 0),
                            almondWater: prev.almondWater + (reward.almondWater || 0),
                            anomalyParts: prev.anomalyParts + (reward.anomalyParts || 0)
                        }));
                    }

                    // Apply unlocksFeature
                    if (currentStep.unlocksFeature) {
                        if (currentStep.unlocksFeature === 'backrooms_manager') {
                            setBuildings(prev => prev.map(b => 
                                b.id === 'backrooms_manager' && b.level === 0 ? { ...b, level: 1 } : b
                            ));
                            addLog("🏢 Posto Avançado M.E.G. foi estabelecido e a aba das Backrooms está desbloqueada!", "achievement");
                        }
                    }

                    // Advance index
                    setCurrentTutorialIndex(prevIdx => prevIdx + 1);

                    // Log notification
                    addLog(`📢 NPC ${currentStep.npcName}: Objetivo concluído! Recebeu recompensas.`, 'success');
                }
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
        teamMorale, setTeamMorale,
        heroBonds, setHeroBonds,
        monuments, setMonuments,
        gardenPlots, setGardenPlots,
        elementalResonance, setElementalResonance,
        elementalEssences, setElementalEssences,
        ownedRelics, setOwnedRelics,
        equippedRelics, setEquippedRelics,
        bossRushWave, setBossRushWave,
        bossRushMaxWave, setBossRushMaxWave,
        patronDeity, setPatronDeity, deityLevel, setDeityLevel, deityFavor, setDeityFavor, deityEnergy, setDeityEnergy,
        emberFragments: roguelike.emberFragments,
        setEmberFragments: roguelike.setEmberFragments,
        roguelikeUpgrades: roguelike.roguelikeUpgrades,
        setRoguelikeUpgrades: roguelike.setRoguelikeUpgrades,
        backroomsExplorers: backrooms.backroomsExplorers,
        setBackroomsExplorers: backrooms.setBackroomsExplorers,
        backroomsOutpost: backrooms.backroomsOutpost,
        setBackroomsOutpost: backrooms.setBackroomsOutpost,
        backroomsResources: backrooms.backroomsResources,
        setBackroomsResources: backrooms.setBackroomsResources,
        backroomsUnlockedTechs: backrooms.backroomsUnlockedTechs,
        setBackroomsUnlockedTechs: backrooms.setBackroomsUnlockedTechs,
        backroomsFloor: backrooms.backroomsFloor,
        setBackroomsFloor: backrooms.setBackroomsFloor,
        backroomsFloorProgress: backrooms.backroomsFloorProgress,
        setBackroomsFloorProgress: backrooms.setBackroomsFloorProgress,
        fakePlayers,
        setFakePlayers,
        gvgWarState,
        setGvgWarState,
        currentTutorialIndex,
        setCurrentTutorialIndex,
        arenaOpponents, setArenaOpponents, setRaidActive, setOfflineGains,
        classMastery, setClassMastery,
        town, setTown,
        townVisited, setTownVisited,
        dungeonActive: world.dungeonActive, setDungeonActive: world.setDungeonActive,
        dungeonTimer: world.dungeonTimer, setDungeonTimer: world.setDungeonTimer,
        dungeonState: world.dungeonState, setDungeonState: world.setDungeonState,
        riftState: world.riftState, setRiftState: world.setRiftState,
        riftTimer: world.riftTimer, setRiftTimer: world.setRiftTimer,
        activeRift: world.activeRift, setActiveRift: world.setActiveRift,
        worldBoss: worldBossState.worldBoss, setWorldBoss: worldBossState.setWorldBoss,
        personalDamage: worldBossState.personalDamage, setPersonalDamage: worldBossState.setPersonalDamage,
        canClaim: worldBossState.canClaim, setCanClaim: worldBossState.setCanClaim,
        cooldownUntil: worldBossState.cooldownUntil, setCooldownUntil: worldBossState.setCooldownUntil,
        marketStock, setMarketStock,
        marketTimer, setMarketTimer
    });

    const abandonRoguelikeRun = useCallback(() => {
        const run = roguelike.roguelikeRun;
        if (run.planetaryExpedition) {
            const victory = run.status === 'victory';
            const sectorId = run.planetaryExpedition.sectorId;
            const sectorLevel = run.planetaryExpedition.sectorLevel;
            const biome = run.planetaryExpedition.biome;
            const sectorName = run.planetaryExpedition.sectorName;

            const rewards = getPlanetaryRunRewards(sectorLevel, biome, victory);

            galaxyState.rewardPlanetaryRun(rewards.fuelReward, rewards.hullRepair, rewards.shipUpgrade);

            if (rewards.emberBonus > 0) {
                roguelike.setEmberFragments(prev => prev + rewards.emberBonus);
            }

            // Verify if the sector was already owned
            const sector = galaxyState.galaxy.find(s => s.id === sectorId);
            const wasAlreadyOwned = sector ? sector.isOwned : false;

            if (victory) {
                addLog(`Expedição Planetária em ${sectorName} concluída com sucesso! Combustível +${rewards.fuelReward}, Casco +${rewards.hullRepair}, Frags +${rewards.emberBonus}`, 'achievement');
                if (!wasAlreadyOwned) {
                    galaxyState.setGalaxy(prev => prev.map(s => s.id === sectorId ? { ...s, isOwned: true } : s));
                    soundManager.playLevelUp();
                    const loot = sectorLevel * 1000;
                    setGold(g => g + loot);
                    addLog(`Setor ${sectorName} foi totalmente conquistado para o império! +${loot} Ouro.`, 'achievement');
                }
            } else {
                addLog(`Expedição Planetária em ${sectorName} falhou! Nave recuperada com combustível mínimo (+${rewards.fuelReward}).`, 'danger');
                if (!wasAlreadyOwned) {
                    const hullDmg = Math.min(10 + sectorLevel, galaxyState.spaceship.hull);
                    galaxyState.setSpaceship(prev => ({ ...prev, hull: Math.max(0, prev.hull - hullDmg) }));
                    addLog(`Derrota na incursão de conquista! Recuando com danos ao casco: -${hullDmg} HP.`, 'danger');
                    soundManager.playHit();
                }
            }
        }
        roguelike.abandonRoguelikeRun();
    }, [roguelike.roguelikeRun, roguelike.abandonRoguelikeRun, roguelike.setEmberFragments, galaxyState.rewardPlanetaryRun, galaxyState.galaxy, galaxyState.setGalaxy, galaxyState.spaceship, galaxyState.setSpaceship, addLog, setGold]);

    const result = useMemo(() => {
        const setUIState = { setVictory, setMarketTimer, setRaidTimer, setVoidActive, setVoidTimer, setIsStarlightModalOpen, setPartyPower, setCombatEvents, setGameSpeed, setTheme, setIsSoundOn, setShowCampfire, setResources, setGold, setSouls, setHeroes, setItems, setDungeonMastery, setGardenPlots, setDivinity, setStarlight, setAchievements, setBuildings, setOuterSpaceUnlocked, setRunes, setPatronDeity, setDeityLevel, setDeityFavor, setDeityEnergy, setElementalResonance, setElementalEssences, setOwnedRelics, setEquippedRelics, setBossRushWave, setBossRushMaxWave, setVoidMatter };
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
            fakePlayers, setFakePlayers,
            gvgWarState,
            startGvGWar: (guildName: string) => {
                if (gvgWarState?.warActive) return;
                const newWar = initGvGWar(partyPower, fakePlayers, guildName || 'Sua Guilda');
                setGvgWarState(newWar);
                addLog(`[GvG] ⚔️ Guerra de Guildas iniciada contra ${newWar.rivalGuildName}!`, 'achievement');
            },
            playerGvGAttack: (towerId: string) => {
                if (!gvgWarState?.warActive) return;
                const result = playerAttackTower(gvgWarState, towerId, partyPower);
                setGvgWarState(result.updatedState);
                const latestLog = result.updatedState.warLogs[0];
                if (latestLog) {
                    addLog(`[GvG] ${latestLog.message}`, latestLog.type as any);
                }
            },


            // App.tsx State
            gameSpeed, pets: petsState.pets, artifacts, talents, classMastery,
            dungeonActive: world.dungeonActive,
            dungeonTimer: world.dungeonTimer,
            tower: world.tower,
            towerBoss: world.towerBoss,
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
            monuments,
            teamMorale,
            heroBonds,
            patronDeity,
            deityLevel,
            deityFavor,
            deityEnergy,
            elementalResonance,
            elementalEssences,
            ownedRelics,
            equippedRelics,
            bossRushWave,
            bossRushMaxWave,
            actions: ACTIONS,
            // Root actions for legacy compatibility
            ...ACTIONS,
            ...setUIState,
            setPortalConfig,
            ascendToVoid: ACTIONS.ascendToVoid,
            removeCurse: ACTIONS.removeCurse,
            enshrineHero: ACTIONS.enshrineHero,
            pledgeDeity: ACTIONS.pledgeDeity,
            offerToDeity: ACTIONS.offerToDeity,
            craftRune: ACTIONS.craftRune,
            socketRune: ACTIONS.socketRune,
            combineRunes: ACTIONS.combineRunes,
            invokeWeather: ACTIONS.invokeWeather,
            worldBoss: worldBossState.worldBoss, worldBossDamage: worldBossState.personalDamage, worldBossCanClaim: worldBossState.canClaim, worldBossCooldownUntil: worldBossState.cooldownUntil,
            guildXpMult,
            setGameStats,
            bossTimer,

            // Roguelike State & Actions
            roguelikeRun: roguelike.roguelikeRun,
            emberFragments: roguelike.emberFragments,
            roguelikeUpgrades: roguelike.roguelikeUpgrades,
            startRoguelikeRun: roguelike.startRoguelikeRun,
            startPlanetaryRun: roguelike.startPlanetaryRun,
            preparePlanetaryRun: roguelike.preparePlanetaryRun,
            clearPlanetaryExpedition: roguelike.clearPlanetaryExpedition,
            selectRoguelikeNode: roguelike.selectNode,
            performRoguelikeCombatAction: roguelike.performCombatAction,
            resolveRoguelikeRest: roguelike.resolveRest,
            resolveRoguelikeEventOption: roguelike.resolveEventOption,
            buyRoguelikeUpgrade: roguelike.buyRoguelikeUpgrade,
            abandonRoguelikeRun: abandonRoguelikeRun,

            // Backrooms State & Actions
            backroomsExplorers: backrooms.backroomsExplorers,
            backroomsOutpost: backrooms.backroomsOutpost,
            backroomsResources: backrooms.backroomsResources,
            backroomsLogs: backrooms.backroomsLogs,
            recruitExplorer: backrooms.recruitExplorer,
            sendExplorer: backrooms.sendExplorer,
            recallExplorer: backrooms.recallExplorer,
            restExplorer: backrooms.restExplorer,
            useAlmondWater: backrooms.useAlmondWater,
            upgradeOutpost: backrooms.upgradeOutpost,
            craftGear: backrooms.craftGear,
            backroomsUnlockedTechs: backrooms.backroomsUnlockedTechs,
            researchTech,
            backroomsFloor: backrooms.backroomsFloor,
            backroomsFloorProgress: backrooms.backroomsFloorProgress,
            backroomsBossHp: backrooms.backroomsBossHp,
            currentTutorialIndex,
        };
    }, [buildings, gold, items, heroes, souls, resources, divinity, activeEvent, starlight, starlightUpgrades, partyPower, artifacts, petsState, guildState, galaxyState, gameStats, activeHeroes, boss.level, lastDailyReset, voidMatter, voidActive, voidTimer, world, worldBossState, dungeonMastery, classMastery, town, marketTrend, teamMorale, heroBonds, monuments, patronDeity, deityLevel, deityFavor, deityEnergy, runes, roguelike.roguelikeRun, roguelike.emberFragments, roguelike.roguelikeUpgrades, roguelike.startPlanetaryRun, roguelike.preparePlanetaryRun, roguelike.clearPlanetaryExpedition, abandonRoguelikeRun, backrooms.backroomsExplorers, backrooms.backroomsOutpost, backrooms.backroomsResources, backrooms.backroomsLogs, backrooms.backroomsFloor, backrooms.backroomsFloorProgress, backrooms.backroomsBossHp, fakePlayers, currentTutorialIndex]);

    return result;
};
