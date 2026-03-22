import { useEffect, useRef } from 'react';
import type { Hero, Boss, Item, Pet, Talent, Artifact, MonsterCard, ConstellationNode, Tower, Guild, Achievement, GalaxySector, GameStats, Resources, Building, Quest, ArenaOpponent, Expedition, DailyQuest, ActivePotion } from '../engine/types';
import { INITIAL_HEROES, INITIAL_PET_DATA, INITIAL_CONSTELLATIONS } from '../engine/initialData';
import { INITIAL_BUILDINGS } from '../data/buildings';

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
    territories: any[];
    setTerritories: React.Dispatch<React.SetStateAction<any[]>>;
    spaceship: any;
    setSpaceship: React.Dispatch<React.SetStateAction<any>>;
    formations: any[];
    setFormations: React.Dispatch<React.SetStateAction<any[]>>;
    weather: any;
    setWeather: React.Dispatch<React.SetStateAction<any>>;
    prestigeNodes: Record<string, number>;
    setPrestigeNodes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
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
        setPrestigeNodes
    } = props;


    // LOAD
    useEffect(() => {
        const saved = localStorage.getItem('rpg_eternal_save_v6');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                // Merge loaded heroes with new props (element, assignment)
                const savedHeroes = state.heroes || [];

                // 1. Merge Static Heroes (preserve unlocked status, level, etc. from save, but ensure all INITIAL_HEROES exist)
                const staticHeroes = INITIAL_HEROES.map((initH) => {
                    const savedH = savedHeroes.find((h: Hero) => h.id === initH.id);
                    if (savedH) {
                        return {
                            ...initH, // Get latest static data (stats, skills)
                            ...savedH, // Overwrite with saved progress (level, unlocked, equipment)
                            // Deep merge specific objects if needed, but usually spread is enough.
                            // Ensure element/assignment are backfilled if missing in save
                            element: savedH.element || initH.element,
                            assignment: savedH.assignment || 'combat',
                            insanity: (savedH as any).corruption ? 50 : (savedH.insanity || 0),
                        };
                    }
                    return initH; // New hero added to game, not in save
                });

                // 2. Preserve Dynamic Heroes (Miners) - those not in INITIAL_HEROES
                const dynamicHeroes = savedHeroes.filter((h: Hero) => !INITIAL_HEROES.some(initH => initH.id === h.id));

                const updatedHeroes = [...staticHeroes, ...dynamicHeroes];

                setHeroes(updatedHeroes);
                setBoss({ ...state.boss, element: state.boss?.element || 'neutral' });
                setItems(state.items);
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
                        const savedC = state.constellations.find((c: any) => c.id === initC.id);
                        return savedC ? { ...initC, level: savedC.level ?? initC.level } : initC;
                    }));
                }
                if (state.keys) setKeys(state.keys);
                if (state.resources) setResources(state.resources);
                if (state.tower) setTower(state.tower);
                if (state.towerBoss) setTowerBoss(state.towerBoss);
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

                // World Boss state generally shouldn't be persisted if active, or maybe yes?
                // For now, let's reset WB on reload to avoid bugs, or persist only fragments.

                setRaidActive(false);
                setDungeonActive(false);

                // Offline Calc (omitted for brevity, assume unchanged logic)
                if (state.lastSaveTime) {
                    const now = Date.now();
                    const diff = now - state.lastSaveTime;
                    const secondsOffline = Math.floor(diff / 1000);
                    if (secondsOffline > 60) {
                        const miners = updatedHeroes.filter((h: Hero) => h.unlocked && h.assignment === 'mine');
                        const combatants = updatedHeroes.filter((h: Hero) => h.unlocked && h.assignment === 'combat');
                        let logMsg = `Offline for ${Math.floor(secondsOffline / 60)}m.`;

                        if (miners.length > 0) {
                            const oreGain = Math.floor(miners.length * secondsOffline * 0.5);
                            setResources(r => ({ ...r, copper: r.copper + oreGain }));
                            logMsg += `\\nMiners found ${oreGain} Copper.`;
                        }
                        if (combatants.length > 0) {
                            const kills = Math.floor((secondsOffline / 5) * (combatants.length / 6));
                            const gainedSouls = Math.floor(kills * 0.2);
                            const gainedGold = kills * 10;
                            if (kills > 0) {
                                setSouls(p => p + gainedSouls);
                                setGold(p => p + gainedGold);
                                logMsg += `\\nKilled ${kills} Monsters.\\nGained ${gainedSouls} Souls & ${gainedGold} Gold.`;
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
                stats: { hp: h.stats.hp, maxHp: h.stats.maxHp, attack: h.stats.attack, defense: h.stats.defense, magic: h.stats.magic, speed: h.stats.speed, mp: h.stats.mp, maxMp: h.stats.maxMp },
                statPoints: h.statPoints,
                element: h.element,
                insanity: h.insanity,
                fatigue: h.fatigue,
            }));

            // Compactar itens: salvar apenas os 50 melhores
            const compactItems = [...(p.items || [])]
                .sort((a, b) => b.value - a.value)
                .slice(0, 50);

            // Filtrar monsterKills para economizar espaço
            const filteredKills: Record<string, number> = {};
            Object.entries(p.monsterKills || {}).forEach(([id, count]: [string, any]) => {
                if (typeof count === 'number' && count > 0) filteredKills[id] = count;
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
                items: compactItems,
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
