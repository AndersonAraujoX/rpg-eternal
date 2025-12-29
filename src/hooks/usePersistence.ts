import { useEffect } from 'react';
import type { Hero, Boss, Item, Pet, Talent, Artifact, MonsterCard, ConstellationNode, Tower, Guild, Rune, Achievement, GalaxySector, GameStats, Resources, Building } from '../engine/types';
import { INITIAL_HEROES, INITIAL_PET_DATA } from '../engine/initialData';

export const usePersistence = (
    heroes: Hero[],
    setHeroes: React.Dispatch<React.SetStateAction<Hero[]>>,
    boss: Boss,
    setBoss: React.Dispatch<React.SetStateAction<Boss>>,
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>,
    souls: number,
    setSouls: React.Dispatch<React.SetStateAction<number>>,
    gold: number,
    setGold: React.Dispatch<React.SetStateAction<number>>,
    divinity: number,
    setDivinity: React.Dispatch<React.SetStateAction<number>>,
    pets: Pet[],
    setPets: React.Dispatch<React.SetStateAction<Pet[]>>,
    talents: Talent[],
    setTalents: React.Dispatch<React.SetStateAction<Talent[]>>,
    artifacts: Artifact[],
    setArtifacts: React.Dispatch<React.SetStateAction<Artifact[]>>,
    cards: MonsterCard[],
    setCards: React.Dispatch<React.SetStateAction<MonsterCard[]>>,
    constellations: ConstellationNode[],
    setConstellations: React.Dispatch<React.SetStateAction<ConstellationNode[]>>,
    keys: number,
    setKeys: React.Dispatch<React.SetStateAction<number>>,
    resources: Resources,
    setResources: React.Dispatch<React.SetStateAction<Resources>>,
    tower: Tower,
    setTower: React.Dispatch<React.SetStateAction<Tower>>,
    guild: Guild | null,
    setGuild: React.Dispatch<React.SetStateAction<Guild | null>>,
    voidMatter: number,
    setVoidMatter: React.Dispatch<React.SetStateAction<number>>,
    arenaRank: number,
    setArenaRank: React.Dispatch<React.SetStateAction<number>>,
    glory: number,
    setGlory: React.Dispatch<React.SetStateAction<number>>,
    quests: any[], // Simplified type for Quests as it's complex
    setQuests: React.Dispatch<React.SetStateAction<any[]>>,
    runes: Rune[],
    setRunes: React.Dispatch<React.SetStateAction<Rune[]>>,
    achievements: Achievement[],
    setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>,
    eternalFragments: number,
    setEternalFragments: React.Dispatch<React.SetStateAction<number>>,
    starlight: number,
    setStarlight: React.Dispatch<React.SetStateAction<number>>,
    starlightUpgrades: any, // Simplified
    setStarlightUpgrades: React.Dispatch<React.SetStateAction<any>>,
    theme: string,
    setTheme: React.Dispatch<React.SetStateAction<string>>,
    galaxy: GalaxySector[],
    setGalaxy: React.Dispatch<React.SetStateAction<GalaxySector[]>>,
    monsterKills: Record<string, number>,
    setMonsterKills: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    gameStats: GameStats,
    setGameStats: React.Dispatch<React.SetStateAction<GameStats>>,
    activeExpeditions: any[],
    setActiveExpeditions: React.Dispatch<React.SetStateAction<any[]>>,
    activePotions: any[],
    setActivePotions: React.Dispatch<React.SetStateAction<any[]>>,
    buildings: Building[],
    setBuildings: React.Dispatch<React.SetStateAction<Building[]>>,
    setRaidActive: React.Dispatch<React.SetStateAction<boolean>>,
    setDungeonActive: React.Dispatch<React.SetStateAction<boolean>>,
    setOfflineGains: React.Dispatch<React.SetStateAction<string | null>>,
    dailyQuests: any[],
    setDailyQuests: React.Dispatch<React.SetStateAction<any[]>>,
    dailyLoginClaimed: boolean,
    setDailyLoginClaimed: React.Dispatch<React.SetStateAction<boolean>>,
    lastDailyReset: number,
    setLastDailyReset: React.Dispatch<React.SetStateAction<number>>
) => {


    // LOAD
    useEffect(() => {
        const saved = localStorage.getItem('rpg_eternal_save_v6');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                // Merge loaded heroes with new props (element, assignment)
                const loadedHeroes = state.heroes || INITIAL_HEROES;
                const updatedHeroes = loadedHeroes.map((h: Hero, i: number) => ({
                    ...INITIAL_HEROES[i], // Defaults
                    ...h, // Loaded
                    element: h.element || INITIAL_HEROES[i].element, // Backfill
                    assignment: h.assignment || 'combat',
                    gambits: h.gambits || INITIAL_HEROES[i].gambits,
                    corruption: h.corruption || false,
                    equipment: h.equipment || {}
                }));

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
                if (state.constellations) setConstellations(state.constellations);
                if (state.keys) setKeys(state.keys);
                if (state.resources) setResources(state.resources);
                if (state.tower) setTower(state.tower);
                if (state.guild) setGuild(state.guild);
                if (state.voidMatter) setVoidMatter(state.voidMatter);
                if (state.arenaRank) setArenaRank(state.arenaRank);
                if (state.glory) setGlory(state.glory);
                if (state.quests) setQuests(state.quests);
                if (state.runes) setRunes(state.runes);
                if (state.achievements) setAchievements(state.achievements);
                if (state.eternalFragments) setEternalFragments(state.eternalFragments);
                if (state.starlight) setStarlight(state.starlight);
                if (state.starlightUpgrades) setStarlightUpgrades(state.starlightUpgrades);
                if (state.theme) setTheme(state.theme);
                if (state.galaxy) setGalaxy(state.galaxy); // Galaxy Load
                if (state.monsterKills) setMonsterKills(state.monsterKills);
                if (state.gameStats) setGameStats(state.gameStats);
                if (state.activeExpeditions) setActiveExpeditions(state.activeExpeditions);
                if (state.activePotions) setActivePotions(state.activePotions);
                if (state.buildings) setBuildings(state.buildings);
                if (state.dailyQuests) setDailyQuests(state.dailyQuests);
                if (state.dailyLoginClaimed !== undefined) setDailyLoginClaimed(state.dailyLoginClaimed);
                if (state.lastDailyReset) setLastDailyReset(state.lastDailyReset);

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

    // SAVE
    useEffect(() => {
        const saveState = () => {
            const state = {
                heroes, boss, items, souls, gold, divinity, pets, talents, artifacts, cards, constellations, keys,
                resources, tower, guild, voidMatter, arenaRank, glory, quests, runes, achievements, eternalFragments, starlight,
                starlightUpgrades, theme, galaxy, monsterKills, gameStats,
                activeExpeditions, activePotions, buildings,
                dailyQuests, dailyLoginClaimed, lastDailyReset,
                lastSaveTime: Date.now()
            };
            localStorage.setItem('rpg_eternal_save_v6', JSON.stringify(state));
        };
        const timer = setInterval(saveState, 5000); // Auto-save every 5s
        return () => clearInterval(timer);
    }, [heroes, boss, items, souls, gold, divinity, pets, talents, artifacts, cards, constellations, keys, resources, tower, guild, voidMatter, arenaRank, glory, quests, runes, achievements, eternalFragments, starlight, starlightUpgrades, theme, galaxy, monsterKills, gameStats, activeExpeditions, activePotions, buildings, dailyQuests, dailyLoginClaimed, lastDailyReset]);
};
