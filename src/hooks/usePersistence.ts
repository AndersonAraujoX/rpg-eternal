import { useEffect, useRef } from 'react';
import type { Hero, Boss, Item, Pet, Talent, Artifact, MonsterCard, ConstellationNode, Tower, Guild, Achievement, GalaxySector, GameStats, Resources, Building, Quest, ArenaOpponent, Expedition, DailyQuest, ActivePotion, Rune, GardenPlot, ElementType, Territory, Spaceship, Formation, ClassMastery, TownState, RiftState, Rift, WorldBoss, MarketItem } from '../engine/types';
import { calcOfflineRiftFragments } from '../engine/modifiersManager';
import type { DungeonState } from '../engine/dungeon';
import type { WeatherType } from '../engine/weather';
import { INITIAL_HEROES, INITIAL_PET_DATA, INITIAL_CONSTELLATIONS, INITIAL_BOSS } from '../engine/initialData';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_GARDEN } from '../engine/garden';
import type { BackroomsExplorer, BackroomsOutpost, BackroomsResources } from '../engine/backrooms';
import type { FakePlayer } from '../engine/playerSimulation';
import type { GvGWarState } from '../engine/guildWar';
import { initOrUpdateHeroPassiveTree } from '../data/skillTreeData';


export interface PersistenceProps {
    heroes: Hero[];
    setHeroes: React.Dispatch<React.SetStateAction<Hero[]>>;
    boss: Boss;
    setBoss: React.Dispatch<React.SetStateAction<Boss>>;
    towerBoss: Boss;
    setTowerBoss: React.Dispatch<React.SetStateAction<Boss>>;
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    souls: number;
    setSouls: React.Dispatch<React.SetStateAction<number>>;
    gold: number;
    setGold: React.Dispatch<React.SetStateAction<number>>;
    divinity: number;
    setDivinity: React.Dispatch<React.SetStateAction<number>>;
    pets: Pet[];
    setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
    talents: Talent[];
    setTalents: React.Dispatch<React.SetStateAction<Talent[]>>;
    artifacts: Artifact[];
    setArtifacts: React.Dispatch<React.SetStateAction<Artifact[]>>;
    cards: MonsterCard[];
    setCards: React.Dispatch<React.SetStateAction<MonsterCard[]>>;
    constellations: ConstellationNode[];
    setConstellations: React.Dispatch<React.SetStateAction<ConstellationNode[]>>;
    keys: number;
    setKeys: React.Dispatch<React.SetStateAction<number>>;
    resources: Resources;
    setResources: React.Dispatch<React.SetStateAction<Resources>>;
    tower: Tower;
    setTower: React.Dispatch<React.SetStateAction<Tower>>;
    guild: Guild | null;
    setGuild: React.Dispatch<React.SetStateAction<Guild | null>>;
    voidMatter: number;
    setVoidMatter: React.Dispatch<React.SetStateAction<number>>;
    arenaRank: number;
    setArenaRank: React.Dispatch<React.SetStateAction<number>>;
    glory: number;
    setGlory: React.Dispatch<React.SetStateAction<number>>;
    quests: Quest[];
    setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
    achievements: Achievement[];
    setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
    starlight: number;
    setStarlight: React.Dispatch<React.SetStateAction<number>>;
    starlightUpgrades: Record<string, number>;
    setStarlightUpgrades: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    autoSellRarity: 'none' | 'common' | 'rare';
    setAutoSellRarity: React.Dispatch<React.SetStateAction<'none' | 'common' | 'rare'>>;
    arenaOpponents: ArenaOpponent[];
    setArenaOpponents: React.Dispatch<React.SetStateAction<ArenaOpponent[]>>;
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
    galaxy: GalaxySector[];
    setGalaxy: React.Dispatch<React.SetStateAction<GalaxySector[]>>;
    monsterKills: Record<string, number>;
    setMonsterKills: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    gameStats: GameStats;
    setGameStats: React.Dispatch<React.SetStateAction<GameStats>>;
    activeExpeditions: Expedition[];
    setActiveExpeditions: React.Dispatch<React.SetStateAction<Expedition[]>>;
    activePotions: ActivePotion[];
    setActivePotions: React.Dispatch<React.SetStateAction<ActivePotion[]>>;
    buildings: Building[];
    setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
    setRaidActive: React.Dispatch<React.SetStateAction<boolean>>;
    setDungeonActive: React.Dispatch<React.SetStateAction<boolean>>;
    setOfflineGains: React.Dispatch<React.SetStateAction<string | null>>;
    dailyQuests: DailyQuest[];
    setDailyQuests: React.Dispatch<React.SetStateAction<DailyQuest[]>>;
    dailyLoginClaimed: boolean;
    setDailyLoginClaimed: React.Dispatch<React.SetStateAction<boolean>>;
    lastDailyReset: number;
    setLastDailyReset: React.Dispatch<React.SetStateAction<number>>;
    territories: Territory[];
    setTerritories: React.Dispatch<React.SetStateAction<Territory[]>>;
    spaceship: Spaceship;
    setSpaceship: React.Dispatch<React.SetStateAction<Spaceship>>;
    formations: Formation[];
    setFormations: React.Dispatch<React.SetStateAction<Formation[]>>;
    weather: WeatherType;
    setWeather: React.Dispatch<React.SetStateAction<WeatherType>>;
    teamMorale: number;
    setTeamMorale: React.Dispatch<React.SetStateAction<number>>;
    heroBonds: Record<string, { xp: number, level: number, type: 'comrades' | 'rivals' | 'soulmates' }>;
    setHeroBonds: React.Dispatch<React.SetStateAction<Record<string, { xp: number, level: number, type: 'comrades' | 'rivals' | 'soulmates' }>>>;
    patronDeity: string | null;
    setPatronDeity: React.Dispatch<React.SetStateAction<string | null>>;
    deityLevel: number;
    setDeityLevel: React.Dispatch<React.SetStateAction<number>>;
    deityFavor: number;
    setDeityFavor: React.Dispatch<React.SetStateAction<number>>;
    deityEnergy: number;
    setDeityEnergy: React.Dispatch<React.SetStateAction<number>>;
    outerSpaceUnlocked: boolean;
    setOuterSpaceUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
    prestigeNodes: Record<string, number>;
    setPrestigeNodes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    monuments: (string | null)[];
    setMonuments: React.Dispatch<React.SetStateAction<(string | null)[]>>;
    gardenPlots: GardenPlot[];
    setGardenPlots: React.Dispatch<React.SetStateAction<GardenPlot[]>>;
    runes: Rune[];
    setRunes: React.Dispatch<React.SetStateAction<Rune[]>>;
    elementalResonance: Record<ElementType, number>;
    setElementalResonance: React.Dispatch<React.SetStateAction<Record<ElementType, number>>>;
    elementalEssences: Record<ElementType, number>;
    setElementalEssences: React.Dispatch<React.SetStateAction<Record<ElementType, number>>>;
    ownedRelics: string[];
    setOwnedRelics: React.Dispatch<React.SetStateAction<string[]>>;
    equippedRelics: string[];
    setEquippedRelics: React.Dispatch<React.SetStateAction<string[]>>;
    bossRushWave: number;
    setBossRushWave: React.Dispatch<React.SetStateAction<number>>;
    bossRushMaxWave: number;
    setBossRushMaxWave: React.Dispatch<React.SetStateAction<number>>;
    emberFragments: number;
    setEmberFragments: React.Dispatch<React.SetStateAction<number>>;
    roguelikeUpgrades: Record<string, number>;
    setRoguelikeUpgrades: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    backroomsExplorers: BackroomsExplorer[];
    setBackroomsExplorers: React.Dispatch<React.SetStateAction<BackroomsExplorer[]>>;
    backroomsOutpost: BackroomsOutpost;
    setBackroomsOutpost: React.Dispatch<React.SetStateAction<BackroomsOutpost>>;
    backroomsResources: BackroomsResources;
    setBackroomsResources: React.Dispatch<React.SetStateAction<BackroomsResources>>;
    backroomsUnlockedTechs: string[];
    setBackroomsUnlockedTechs: React.Dispatch<React.SetStateAction<string[]>>;
    backroomsFloor: number;
    setBackroomsFloor: React.Dispatch<React.SetStateAction<number>>;
    backroomsFloorProgress: number;
    setBackroomsFloorProgress: React.Dispatch<React.SetStateAction<number>>;
    fakePlayers: FakePlayer[];
    setFakePlayers: React.Dispatch<React.SetStateAction<FakePlayer[]>>;
    gvgWarState: GvGWarState | null;
    setGvgWarState: React.Dispatch<React.SetStateAction<GvGWarState | null>>;
    currentTutorialIndex: number;
    setCurrentTutorialIndex: React.Dispatch<React.SetStateAction<number>>;
    classMastery: Record<string, ClassMastery>;
    setClassMastery: React.Dispatch<React.SetStateAction<Record<string, ClassMastery>>>;
    town: TownState;
    setTown: React.Dispatch<React.SetStateAction<TownState>>;
    townVisited: boolean;
    setTownVisited: React.Dispatch<React.SetStateAction<boolean>>;
    dungeonActive: boolean;
    dungeonTimer: number;
    setDungeonTimer: React.Dispatch<React.SetStateAction<number>>;
    dungeonState: DungeonState | null;
    setDungeonState: React.Dispatch<React.SetStateAction<DungeonState | null>>;
    riftState: RiftState;
    setRiftState: React.Dispatch<React.SetStateAction<RiftState>>;
    riftTimer: number;
    setRiftTimer: React.Dispatch<React.SetStateAction<number>>;
    activeRift: Rift | null;
    setActiveRift: React.Dispatch<React.SetStateAction<Rift | null>>;
    worldBoss: WorldBoss | null;
    setWorldBoss: React.Dispatch<React.SetStateAction<WorldBoss | null>>;
    personalDamage: number;
    setPersonalDamage: React.Dispatch<React.SetStateAction<number>>;
    canClaim: boolean;
    setCanClaim: React.Dispatch<React.SetStateAction<boolean>>;
    cooldownUntil: number | null;
    setCooldownUntil: React.Dispatch<React.SetStateAction<number | null>>;
    marketStock: MarketItem[];
    setMarketStock: React.Dispatch<React.SetStateAction<MarketItem[]>>;
    marketTimer: number;
    setMarketTimer: React.Dispatch<React.SetStateAction<number>>;
    // ── Sinergias Transversais (modifiersManager) ──
    highestRiftFloor?: number;
    riftFragments?: number;
    setRiftFragments?: React.Dispatch<React.SetStateAction<number>>;
    dungeonFirstTickBuff: boolean;
    setDungeonFirstTickBuff: React.Dispatch<React.SetStateAction<boolean>>;
    // ── Sinergias Globais de Indústria ──
    starForgeDailyUses: number;
    setStarForgeDailyUses: React.Dispatch<React.SetStateAction<number>>;
    lastStarForgeResetDate: string;
    setLastStarForgeResetDate: React.Dispatch<React.SetStateAction<string>>;
    arenaAdrenalineActive: boolean;
    setArenaAdrenalineActive: React.Dispatch<React.SetStateAction<boolean>>;
    // ── Quarta Camada de Sinergias Globais ──
    hasDonatedHighTierIndustry: boolean;
    setHasDonatedHighTierIndustry: React.Dispatch<React.SetStateAction<boolean>>;
    unpurifiedRelics: number;
    setUnpurifiedRelics: React.Dispatch<React.SetStateAction<number>>;
    unlockedRiftPerks: string[];
    setUnlockedRiftPerks: React.Dispatch<React.SetStateAction<string[]>>;
}

export const usePersistence = (props: PersistenceProps) => {
    const {
        setHeroes, setBoss, setItems, setSouls, setGold,
        setDivinity, setPets, setTalents, setArtifacts,
        setCards, setConstellations, setKeys, setResources,
        setTower, setTowerBoss, setGuild, setVoidMatter,
        setArenaRank, setGlory, setQuests,
        setAchievements,
        setStarlight,
        setStarlightUpgrades,
        setAutoSellRarity,
        setArenaOpponents,
        setTheme,
        setGalaxy,
        setMonsterKills,
        setGameStats,
        setActiveExpeditions,
        setActivePotions,
        setBuildings,
        setRaidActive, setDungeonActive, setOfflineGains,
        setDailyQuests,
        setDailyLoginClaimed,
        setLastDailyReset,
        setTerritories,
        setSpaceship,
        setFormations,
        setWeather,
        setPrestigeNodes,
        setMonuments,
        setGardenPlots,
        runes,
        setRunes,
        elementalResonance,
        setElementalResonance,
        elementalEssences,
        setElementalEssences,
        ownedRelics,
        setOwnedRelics,
        equippedRelics,
        setEquippedRelics,
        bossRushWave,
        setBossRushWave,
        bossRushMaxWave,
        setBossRushMaxWave,
        emberFragments,
        setEmberFragments,
        roguelikeUpgrades,
        setRoguelikeUpgrades,
        backroomsExplorers,
        setBackroomsExplorers,
        backroomsOutpost,
        setBackroomsOutpost,
        backroomsResources,
        setBackroomsResources,
        backroomsUnlockedTechs,
        setBackroomsUnlockedTechs,
        setBackroomsFloor,
        setBackroomsFloorProgress,
        fakePlayers,
        setFakePlayers,
        setGvgWarState,
        currentTutorialIndex,
        setCurrentTutorialIndex,
        teamMorale,
        setTeamMorale,
        heroBonds,
        setHeroBonds,
        patronDeity,
        setPatronDeity,
        deityLevel,
        setDeityLevel,
        deityFavor,
        setDeityFavor,
        deityEnergy,
        setDeityEnergy,
        outerSpaceUnlocked,
        setOuterSpaceUnlocked,
        classMastery,
        setClassMastery,
        town,
        setTown,
        townVisited,
        setTownVisited,
        dungeonActive,
        dungeonTimer,
        setDungeonTimer,
        dungeonState,
        setDungeonState,
        riftState,
        setRiftState,
        riftTimer,
        setRiftTimer,
        activeRift,
        setActiveRift,
        worldBoss,
        setWorldBoss,
        personalDamage,
        setPersonalDamage,
        canClaim,
        setCanClaim,
        cooldownUntil,
        setCooldownUntil,
        marketStock,
        setMarketStock,
        marketTimer,
        setMarketTimer,
        dungeonFirstTickBuff,
        setDungeonFirstTickBuff,
        starForgeDailyUses,
        setStarForgeDailyUses,
        lastStarForgeResetDate,
        setLastStarForgeResetDate,
        arenaAdrenalineActive,
        setArenaAdrenalineActive,
        hasDonatedHighTierIndustry,
        setHasDonatedHighTierIndustry,
        unpurifiedRelics,
        setUnpurifiedRelics,
        unlockedRiftPerks,
        setUnlockedRiftPerks
    } = props;


    // LOAD
    useEffect(() => {
        const saved = localStorage.getItem('rpg_eternal_save_v6');
        if (saved) {
            try {
                const state = JSON.parse(saved, (key, value) => {
                    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                        return undefined;
                    }
                    if (typeof value === 'string') {
                        return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    }
                    return value;
                });

                if (typeof state !== 'object' || state === null || Array.isArray(state)) {
                    throw new Error('Invalid save state');
                }

                // Merge loaded heroes with new props (element, assignment)
                const savedHeroes = state.heroes || [];

                // 1. Merge Static Heroes (preserve unlocked status, level, etc. from save, but ensure all INITIAL_HEROES exist)
                const staticHeroes = INITIAL_HEROES.map((initH) => {
                    const savedH = savedHeroes.find((h: Hero) => h.id === initH.id);
                    if (savedH) {
                        return {
                            ...initH, // Get latest static data (stats, skills)
                            ...savedH, // Overwrite with saved progress (level, unlocked, equipment)
                            element: savedH.element || initH.element,
                            assignment: savedH.assignment || 'none',
                            insanity: savedH.insanity ?? initH.insanity ?? 0,
                            fatigue: savedH.fatigue ?? initH.fatigue ?? 0,
                            isAwakened: savedH.isAwakened ?? initH.isAwakened ?? false,
                            awakeningTitle: savedH.awakeningTitle || initH.awakeningTitle || '',
                            awakenedAt: savedH.awakenedAt || initH.awakenedAt,
                            isMutated: savedH.isMutated ?? initH.isMutated ?? false,
                            mutationType: savedH.mutationType || initH.mutationType,
                            curses: savedH.curses || initH.curses || []
                        };
                    }
                    return initH; // New hero added to game, not in save
                });

                // 2. Preserve Dynamic Heroes (Miners) - those not in INITIAL_HEROES
                const dynamicHeroes = savedHeroes
                    .filter((h: Hero) => !INITIAL_HEROES.some(initH => initH.id === h.id))
                    .map((savedH: Partial<Hero> & { id: string }) => ({
                        ...savedH,
                        insanity: savedH.insanity ?? 0,
                        fatigue: savedH.fatigue ?? 0,
                        isAwakened: savedH.isAwakened ?? false,
                        awakeningTitle: savedH.awakeningTitle || '',
                        isMutated: savedH.isMutated ?? false,
                        curses: savedH.curses || []
                    }));

                const updatedHeroes = [...staticHeroes, ...dynamicHeroes].map(h => initOrUpdateHeroPassiveTree(h));


                setHeroes(updatedHeroes);
                setBoss(state.boss ? { ...state.boss, element: state.boss.element || 'neutral' } : INITIAL_BOSS);
                setItems(state.items || []);
                setSouls(state.souls || 0);
                setGold(state.gold || 0);
                setDivinity(state.divinity || 0);
                if (state.pets) {
                    setPets(state.pets);
                } else if (state.pet) {
                    // Migration: Single to Array
                    setPets([{ ...INITIAL_PET_DATA, ...state.pet }]);
                } else {
                    setPets([]);
                }
                if (state.talents) setTalents(state.talents);
                if (state.artifacts) setArtifacts(state.artifacts);
                if (state.cards) setCards(state.cards);
                if (state.constellations && state.constellations.length > 0) {
                    // Merge: preserve levels from save, but always include all INITIAL nodes
                    setConstellations(INITIAL_CONSTELLATIONS.map(initC => {
                        const savedC = state.constellations.find((c: Partial<ConstellationNode>) => c.id === initC.id);
                        return savedC ? { ...initC, level: savedC.level ?? initC.level } : initC;
                    }));
                }
                if (state.keys) setKeys(state.keys);
                if (state.resources) setResources(state.resources);
                if (state.tower) setTower(state.tower);
                if (state.towerBoss) {
                     const loadedBoss = { ...state.towerBoss };
                     if (loadedBoss.emoji === '🏰') {
                         loadedBoss.emoji = INITIAL_BOSS.emoji;
                     }
                     setTowerBoss(loadedBoss);
                 }
                if (state.guild) {
                    const loadedGuild = { ...state.guild };
                    if (!loadedGuild.monuments) loadedGuild.monuments = {};
                    if (loadedGuild.totalContribution === undefined) loadedGuild.totalContribution = 0;
                    setGuild(loadedGuild);
                }
                if (state.voidMatter) setVoidMatter(state.voidMatter);
                if (state.arenaRank) setArenaRank(state.arenaRank);
                if (state.glory) setGlory(state.glory);
                if (state.quests) setQuests(state.quests);
                if (state.achievements) setAchievements(state.achievements);

                if (state.starlight) setStarlight(state.starlight);
                if (state.starlightUpgrades) setStarlightUpgrades(state.starlightUpgrades);
                if (state.theme) setTheme(state.theme);
                if (state.galaxy) setGalaxy(state.galaxy); // Galaxy Load
                if (state.monsterKills) setMonsterKills(state.monsterKills);
                if (state.gameStats) setGameStats(state.gameStats);
                if (state.activeExpeditions) setActiveExpeditions(state.activeExpeditions);
                if (state.activePotions) setActivePotions(state.activePotions);
                if (state.buildings) {
                    const savedBuildings = state.buildings || [];
                    const mergedBuildings = INITIAL_BUILDINGS.map(initB => {
                        const savedB = savedBuildings.find((b: Building) => b.id === initB.id);
                        if (savedB) {
                            return {
                                ...initB,
                                ...savedB,
                                // Ensure constant data like emoji/description/scaling is from code, 
                                // while dynamic data like level is from save
                                emoji: initB.emoji,
                                description: initB.description,
                                costScaling: initB.costScaling,
                                bonus: initB.bonus,
                                effectValue: initB.effectValue,
                                currency: initB.currency
                            };
                        }
                        return initB;
                    });
                    setBuildings(mergedBuildings);
                } else {
                    setBuildings(INITIAL_BUILDINGS);
                }
                if (state.dailyQuests) setDailyQuests(state.dailyQuests);
                if (state.autoSellRarity) setAutoSellRarity(state.autoSellRarity);
                if (state.arenaOpponents) setArenaOpponents(state.arenaOpponents);
                if (state.dailyLoginClaimed !== undefined) setDailyLoginClaimed(state.dailyLoginClaimed);
                if (state.lastDailyReset) setLastDailyReset(state.lastDailyReset);
                if (state.territories && state.territories.length > 5) {
                    setTerritories(state.territories);
                } // Fallback to memory defaults (dynamic procedural map) if save layout is legacy (<=5)
                if (state.spaceship) setSpaceship(state.spaceship);
                if (state.formations) setFormations(state.formations);
                if (state.weather) setWeather(state.weather);
                if (state.prestigeNodes) setPrestigeNodes(state.prestigeNodes);
                if (state.teamMorale !== undefined) setTeamMorale(state.teamMorale);
                else setTeamMorale(100);
                if (state.heroBonds) setHeroBonds(state.heroBonds);
                if (state.monuments) setMonuments(state.monuments);
                else setMonuments([null, null, null]);
                if (state.patronDeity !== undefined) setPatronDeity(state.patronDeity);
                if (state.deityLevel !== undefined) setDeityLevel(state.deityLevel);
                if (state.deityFavor !== undefined) setDeityFavor(state.deityFavor);
                if (state.deityEnergy !== undefined) setDeityEnergy(state.deityEnergy);
                if (state.outerSpaceUnlocked !== undefined) setOuterSpaceUnlocked(state.outerSpaceUnlocked);
                if (state.gardenPlots) setGardenPlots(state.gardenPlots);
                else setGardenPlots(INITIAL_GARDEN);
                if (state.runes) setRunes(state.runes);
                else setRunes([]);
                if (state.elementalResonance) setElementalResonance(state.elementalResonance);
                if (state.elementalEssences) setElementalEssences(state.elementalEssences);
                if (state.ownedRelics) setOwnedRelics(state.ownedRelics);
                if (state.equippedRelics) setEquippedRelics(state.equippedRelics);
                if (state.bossRushWave) setBossRushWave(state.bossRushWave);
                if (state.bossRushMaxWave) setBossRushMaxWave(state.bossRushMaxWave);
                if (state.emberFragments !== undefined) setEmberFragments(state.emberFragments);
                if (state.roguelikeUpgrades) setRoguelikeUpgrades(state.roguelikeUpgrades);
                if (state.backroomsExplorers) setBackroomsExplorers(state.backroomsExplorers);
                if (state.backroomsOutpost) setBackroomsOutpost(state.backroomsOutpost);
                if (state.backroomsResources) setBackroomsResources(state.backroomsResources);
                if (state.backroomsUnlockedTechs) setBackroomsUnlockedTechs(state.backroomsUnlockedTechs);
                if (typeof state.backroomsFloor === 'number') setBackroomsFloor(state.backroomsFloor);
                if (typeof state.backroomsFloorProgress === 'number') setBackroomsFloorProgress(state.backroomsFloorProgress);
                if (typeof state.currentTutorialIndex === 'number') setCurrentTutorialIndex(state.currentTutorialIndex);

                if (state.achievements) {
                    // Merge saved achievements with current data to ensure new achievements appear
                    setAchievements(prev => {
                        const saved = state.achievements as Achievement[];
                        return prev.map(p => {
                            const found = saved.find(s => s.id === p.id);
                            return found ? { ...p, isUnlocked: found.isUnlocked } : p;
                        });
                    });
                }

                if (state.fakePlayers) setFakePlayers(state.fakePlayers);
                if (state.gvgWarState) setGvgWarState(state.gvgWarState);

                // Persistir estados da Vila, Masmorras, Fendas, World Boss e Mercado
                if (state.classMastery) setClassMastery(state.classMastery);
                if (state.town) setTown(state.town);
                if (state.townVisited !== undefined) setTownVisited(state.townVisited);
                if (state.dungeonActive !== undefined) setDungeonActive(state.dungeonActive);
                if (state.dungeonTimer !== undefined) setDungeonTimer(state.dungeonTimer);
                if (state.dungeonState) setDungeonState(state.dungeonState);
                if (state.riftState) setRiftState(state.riftState);
                if (state.riftTimer !== undefined) setRiftTimer(state.riftTimer);
                if (state.activeRift) setActiveRift(state.activeRift);
                if (state.worldBoss) setWorldBoss(state.worldBoss);
                if (state.personalDamage !== undefined) setPersonalDamage(state.personalDamage);
                if (state.canClaim !== undefined) setCanClaim(state.canClaim);
                if (state.cooldownUntil !== undefined) setCooldownUntil(state.cooldownUntil);
                if (state.marketStock) setMarketStock(state.marketStock);
                if (state.marketTimer !== undefined) setMarketTimer(state.marketTimer);
                if (state.dungeonFirstTickBuff !== undefined) setDungeonFirstTickBuff(state.dungeonFirstTickBuff);
                if (state.starForgeDailyUses !== undefined) setStarForgeDailyUses(state.starForgeDailyUses);
                if (state.lastStarForgeResetDate !== undefined) setLastStarForgeResetDate(state.lastStarForgeResetDate);
                if (state.arenaAdrenalineActive !== undefined) setArenaAdrenalineActive(state.arenaAdrenalineActive);
                if (state.hasDonatedHighTierIndustry !== undefined) setHasDonatedHighTierIndustry(state.hasDonatedHighTierIndustry);
                if (state.unpurifiedRelics !== undefined) setUnpurifiedRelics(state.unpurifiedRelics);
                if (state.unlockedRiftPerks !== undefined) setUnlockedRiftPerks(state.unlockedRiftPerks || []);

                setRaidActive(false);
                if (state.dungeonActive === undefined) {
                    setDungeonActive(false);
                }

                // Offline Calc (omitted for brevity, assume unchanged logic)
                if (state.lastSaveTime) {
                    const now = Date.now();
                    const diff = now - state.lastSaveTime;
                    const hasOfflineUpgrade = (state.starlightUpgrades?.['bot_offline_capacity'] || 0) > 0;
                    const starlightOfflineCapacityBonus = hasOfflineUpgrade ? 1.25 : 1.0;
                    const baseMaxOfflineTime = 8 * 3600; // 8 hours in seconds
                    const maxOfflineTime = baseMaxOfflineTime * starlightOfflineCapacityBonus;
                    const rawSecondsOffline = Math.floor(diff / 1000);
                    const secondsOffline = Math.min(rawSecondsOffline, maxOfflineTime);
                    if (secondsOffline > 60) {
                        const miners = updatedHeroes.filter((h: Hero) => h.unlocked && h.assignment === 'mine');
                        const combatants = updatedHeroes.filter((h: Hero) => h.unlocked && h.assignment === 'combat');
                        let logMsg = `Offline for ${Math.floor(secondsOffline / 60)}m.`;

                        if (miners.length > 0) {
                            const oreGain = Math.floor(miners.length * secondsOffline * 0.5);
                            setResources(r => ({ ...r, copper: r.copper + oreGain }));
                            logMsg += `\nMiners found ${oreGain} Copper.`;
                        }
                        if (combatants.length > 0) {
                            const kills = Math.floor((secondsOffline / 5) * (combatants.length / 6));
                            const gainedSouls = Math.floor(kills * 0.2);
                            const gainedGold = kills * 10;
                            if (kills > 0) {
                                setSouls(p => p + gainedSouls);
                                setGold(p => p + gainedGold);
                                logMsg += `\nKilled ${kills} Monsters.\nGained ${gainedSouls} Souls & ${gainedGold} Gold.`;
                            }
                        }

                        // ── Sinergia 3: Eficiência de Retorno Idle (Rifts ⇄ OfflineModal) ──
                        // Gera Fragmentos de Fenda passivamente baseado no andar máximo atingido
                        const savedHighestRiftFloor = state.highestRiftFloor || props.highestRiftFloor || 0;
                        if (savedHighestRiftFloor > 0 && props.setRiftFragments) {
                            const riftFragsGained = calcOfflineRiftFragments(savedHighestRiftFloor, secondsOffline);
                            if (riftFragsGained > 0) {
                                props.setRiftFragments(prev => prev + riftFragsGained);
                                logMsg += `\n🔮 +${riftFragsGained} Fragmentos de Fenda (Andar ${savedHighestRiftFloor}).`;
                            }
                        }

                        setOfflineGains(logMsg);
                    }
                }

            } catch (e) { console.error("Save Load Error", e); }
        }
    }, []);

    // STABILIZED SAVE (Phase Memory Fix)
    const saveRef = useRef(props);
    useEffect(() => {
        saveRef.current = props;
    }, [props]);

    useEffect(() => {
        const saveState = () => {
            const p = saveRef.current;
            // Compactar heróis: salvar apenas o estritamente necessário
            const compactHeroes = (p.heroes || []).map((h: Hero) => ({
                id: h.id,
                level: h.level,
                xp: h.xp,
                unlocked: h.unlocked,
                isDead: h.isDead,
                assignment: h.assignment,
                stats: h.stats,
                statPoints: h.statPoints,
                element: h.element,
                insanity: h.insanity || 0,
                fatigue: h.fatigue || 0,
                isAwakened: h.isAwakened || false,
                awakeningTitle: h.awakeningTitle || '',
                awakenedAt: h.awakenedAt,
                isMutated: h.isMutated || false,
                mutationType: h.mutationType,
                curses: h.curses || []
            }));

            // Compactar itens: salvar apenas os 50 melhores
            const compactItems = [...(p.items || [])]
                .sort((a, b) => b.value - a.value)
                .slice(0, 50);

            // Filtrar monsterKills para economizar espaço
            const filteredKills: Record<string, number> = {};
            Object.entries(p.monsterKills || {}).forEach(([id, count]) => {
                if (count > 0) filteredKills[id] = count;
            });

            const state = {
                heroes: compactHeroes,
                boss: p.boss, souls: p.souls, gold: p.gold, divinity: p.divinity, pets: p.pets, talents: p.talents, artifacts: p.artifacts, cards: p.cards, constellations: p.constellations, keys: p.keys,
                resources: p.resources, tower: p.tower, towerBoss: p.towerBoss, guild: p.guild, voidMatter: p.voidMatter, arenaRank: p.arenaRank, glory: p.glory, quests: p.quests, achievements: p.achievements, starlight: p.starlight,
                starlightUpgrades: p.starlightUpgrades, theme: p.theme, galaxy: p.galaxy, monsterKills: filteredKills, gameStats: p.gameStats, autoSellRarity: p.autoSellRarity,
                activeExpeditions: p.activeExpeditions, activePotions: p.activePotions, buildings: p.buildings,
                dailyQuests: p.dailyQuests, dailyLoginClaimed: p.dailyLoginClaimed, lastDailyReset: p.lastDailyReset,
                territories: p.territories, spaceship: p.spaceship, formations: p.formations, weather: p.weather,
                prestigeNodes: p.prestigeNodes,
                teamMorale: p.teamMorale,
                heroBonds: p.heroBonds,
                monuments: p.monuments,
                patronDeity: p.patronDeity,
                deityLevel: p.deityLevel,
                deityFavor: p.deityFavor,
                deityEnergy: p.deityEnergy,
                outerSpaceUnlocked: p.outerSpaceUnlocked,
                gardenPlots: p.gardenPlots,
                items: compactItems,
                runes: p.runes,
                elementalResonance: p.elementalResonance,
                elementalEssences: p.elementalEssences,
                ownedRelics: p.ownedRelics,
                equippedRelics: p.equippedRelics,
                bossRushWave: p.bossRushWave,
                bossRushMaxWave: p.bossRushMaxWave,
                emberFragments: p.emberFragments,
                roguelikeUpgrades: p.roguelikeUpgrades,
                backroomsExplorers: p.backroomsExplorers,
                backroomsOutpost: p.backroomsOutpost,
                backroomsResources: p.backroomsResources,
                backroomsUnlockedTechs: p.backroomsUnlockedTechs,
                backroomsFloor: p.backroomsFloor,
                backroomsFloorProgress: p.backroomsFloorProgress,
                fakePlayers: p.fakePlayers,
                gvgWarState: p.gvgWarState,
                currentTutorialIndex: p.currentTutorialIndex,
                classMastery: p.classMastery,
                town: p.town,
                townVisited: p.townVisited,
                dungeonActive: p.dungeonActive,
                dungeonTimer: p.dungeonTimer,
                dungeonState: p.dungeonState,
                riftState: p.riftState,
                riftTimer: p.riftTimer,
                activeRift: p.activeRift,
                worldBoss: p.worldBoss,
                personalDamage: p.personalDamage,
                canClaim: p.canClaim,
                cooldownUntil: p.cooldownUntil,
                marketStock: p.marketStock,
                marketTimer: p.marketTimer,
                dungeonFirstTickBuff: p.dungeonFirstTickBuff,
                starForgeDailyUses: p.starForgeDailyUses,
                lastStarForgeResetDate: p.lastStarForgeResetDate,
                arenaAdrenalineActive: p.arenaAdrenalineActive,
                hasDonatedHighTierIndustry: p.hasDonatedHighTierIndustry,
                unpurifiedRelics: p.unpurifiedRelics,
                unlockedRiftPerks: p.unlockedRiftPerks || [],
                lastSaveTime: Date.now()
            };

            try {
                const json = JSON.stringify(state);
                localStorage.setItem('rpg_eternal_save_v6', json);
                if (json.length > 500000) console.warn("Save size is large:", (json.length / 1024).toFixed(2), "KB");
            } catch (e) {
                console.error("Critical Save Error", e);
            }
        };
        const timer = setInterval(saveState, 60000);
        return () => clearInterval(timer);
    }, []); // RUN ONCE NEVER RESTART
};
