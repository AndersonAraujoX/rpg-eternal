import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import type { Hero, Boss, LogEntry, Item, Gambit, Quest, ArenaOpponent, Rune, Achievement, GameStats, Resources, Building, DailyQuest, CombatEvent, Potion, MarketItem, GardenPlot, Expedition, GameActions, Stats, Pet, Rift, RiftBlessing, DungeonInteraction } from '../engine/types';
import { POTIONS } from '../engine/types';
import { getStarlightUpgradeCost, STARLIGHT_UPGRADES } from '../engine/starlight';
import { checkDailyReset, generateDailyQuests, LOGIN_REWARDS } from '../engine/dailies';
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
import { processFishing } from '../engine/fishing';
import { brewPotion } from '../engine/alchemy';
import { startExpedition } from '../engine/expeditions';
import { generateTownEvent } from '../engine/townEvents';
import { PRESTIGE_CLASSES } from '../engine/classes';

import { INITIAL_HEROES, INITIAL_BOSS, INITIAL_ACHIEVEMENTS, INITIAL_GAME_STATS, INITIAL_SPACESHIP } from '../engine/initialData';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { INITIAL_GALAXY } from '../engine/galaxy';
import { INITIAL_TERRITORIES } from '../engine/guildWar';

export const useGame = () => {
    // CORE STATE
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
    const [voidAscensions, setVoidAscensions] = useState<number>(0);
    const [victory, setVictory] = useState(false);
    const [offlineGains, setOfflineGains] = useState<string | null>(null);
    const [talents, setTalents] = useState<import('../engine/types').Talent[]>([]);
    const [artifacts, setArtifacts] = useState<import('../engine/types').Artifact[]>([]);
    const [cards, setCards] = useState<import('../engine/types').MonsterCard[]>([]);
    const [monsterKills, setMonsterKills] = useState<Record<string, number>>({});
    const [constellations, setConstellations] = useState<import('../engine/types').ConstellationNode[]>([]);
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

    const damageAccumulator = useRef(0);
    const lastDpsUpdate = useRef(Date.now());

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = { id: (Date.now() + Math.random()).toString(), message, type, timestamp: Date.now() };
        setLogs(prev => [newLog, ...prev].slice(0, 20));
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
    const [gameStats, setGameStats] = useState<GameStats>(INITIAL_GAME_STATS);
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
    const [quests, setQuests] = useState<Quest[]>([]);
    const [runes, setRunes] = useState<Rune[]>([]);
    const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([]);

    const worldBossState = useWorldBoss(partyPower, gameStats, addLog, setSouls, setGold);

    // SIDE EFFECTS
    useEffect(() => {
        const timer = setInterval(() => {
            if (galaxyState.galaxyRewards && galaxyState.galaxyRewards.gold > 0) {
                setGold(g => g + galaxyState.galaxyRewards.gold);
            }
        }, 10000);
        return () => clearInterval(timer);
    }, [galaxyState.galaxyRewards]);

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
                if (!prev) return (Math.random() < 0.005) ? ('pending_generation' as any) : null;
                const remaining = prev.duration - 1;
                return remaining <= 0 ? null : { ...prev, duration: remaining };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [world.setWeatherTimer]);

    useEffect(() => {
        if (activeEvent === ('pending_generation' as any)) {
            const newEvent = generateTownEvent(boss.level, []);
            if (newEvent) {
                setActiveEvent(newEvent);
                addLog(`EVENT: ${newEvent.name}!`, 'info');
                soundManager.playLevelUp();
            } else setActiveEvent(null);
        }
    }, [activeEvent, boss.level, addLog]);

    const activeHeroes = useMemo(() => heroes.filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked), [heroes]);

    const guildAtkMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['altar_war'] || 0) * 0.02) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'damage') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);
    const guildHpMult = useMemo(() => guildState.guild ? 1 + ((guildState.guild.monuments?.['fountain_life'] || 0) * 0.02) : 1, [guildState.guild]);
    const guildGoldMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['statue_midas'] || 0) * 0.05) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'gold') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);
    const guildXpMult = useMemo(() => (guildState.guild ? 1 + ((guildState.guild.monuments?.['shrine_wisdom'] || 0) * 0.03) : 1) + ((activeEvent?.type === 'festival' && activeEvent.buffType === 'xp') ? (activeEvent.buffValue || 0) : 0), [guildState.guild, activeEvent]);

    const activeSynergies = useMemo(() => checkSynergies(activeHeroes.map(h => ({
        ...h, stats: { ...h.stats, attack: Math.floor(h.stats.attack * guildAtkMult), maxHp: Math.floor(h.stats.maxHp * guildHpMult), hp: Math.floor(h.stats.hp * guildHpMult) }
    }))), [activeHeroes, guildAtkMult, guildHpMult]);

    const ACTIONS: GameActions = useMemo(() => {
        const baseActions = {
            toggleSound: () => setIsSoundOn(p => !p),
            setGameSpeed: (s: number) => setGameSpeed(s),
            spendStatPoint: (id: string, s: keyof Stats) => setHeroes(p => p.map(h => h.id === id && h.statPoints > 0 ? { ...h, statPoints: h.statPoints - 1, stats: { ...h.stats, [s]: (h.stats[s] || 0) + 1 } } : h)),
            recruitHero: (id: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, unlocked: true } : h)),
            evolveHero: (id: string) => {
                const h = heroes.find(x => x.id === id);
                if (h && h.level >= 50) setHeroes(p => p.map(curr => curr.id === id ? { ...curr, class: (PRESTIGE_CLASSES as any)[h.class] || h.class, level: 1 } : curr));
            },
            toggleAssignment: (id: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, assignment: h.assignment === 'combat' ? 'none' : 'combat' } : h)),
            purifyHero: (id: string) => { if (gold >= 1000) { setGold(g => g - 1000); setHeroes(p => p.map(h => h.id === id ? { ...h, insanity: 0 } : h)); addLog("Hero purified!", "success"); } },
            reviveHero: (id: string) => { if (gold >= 5000) { setGold(g => g - 5000); setHeroes(p => p.map(h => h.id === id ? { ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp * 0.5 } } : h)); addLog("Hero revived!", "success"); } },
            renameHero: (id: string, name: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, name } : h)),
            changeHeroEmoji: (id: string, e: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, emoji: e } : h)),
            equipItem: (id: string, item: Item) => setHeroes(p => p.map(h => {
                if (h.id === id) {
                    const s = (item.slot || (item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'accessory'));
                    const old = h.equipment[s as keyof Hero['equipment']]; if (old) setItems(inv => [...inv, old]);
                    setItems(inv => inv.filter(i => i.id !== item.id));
                    return { ...h, equipment: { ...h.equipment, [s]: item } };
                }
                return h;
            })),
            unequipItem: (id: string, s: 'weapon' | 'armor' | 'accessory') => setHeroes(p => p.map(h => h.id === id && h.equipment[s] ? (setItems(inv => [...inv, h.equipment[s]!]), { ...h, equipment: { ...h.equipment, [s]: undefined } }) : h)),
            updateGambits: (id: string, gs: Gambit[]) => setHeroes(p => p.map(h => h.id === id ? { ...h, gambits: gs } : h)),
            buyTalent: (id: string, _a?: number) => setTalents(p => p.map(t => (t.id === id && souls >= t.cost) ? (setSouls(s => s - t.cost), { ...t, level: t.level + 1, cost: Math.floor(t.cost * t.costScaling) }) : t)),
            buyConstellation: (id: string) => { if (divinity >= 10) { setDivinity(d => d - 10); setConstellations(p => p.map(c => c.id === id ? { ...c, isUnlocked: true } : c)); } },
            buyStarlightUpgrade: (id: string) => {
                const u = STARLIGHT_UPGRADES.find(x => x.id === id); if (!u) return;
                const cost = getStarlightUpgradeCost(u, starlightUpgrades[id] || 0);
                if (starlight >= cost) { setStarlight(s => s - cost); setStarlightUpgrades(p => ({ ...p, [id]: (p[id] || 0) + 1 })); }
            },
            enterDungeon: (lvl: number) => world.enterDungeon(lvl),
            descendDungeon: () => world.descendDungeon(),
            exitDungeon: () => world.exitDungeon(),
            moveDungeon: (x: number, y: number): DungeonInteraction | null => world.moveDungeon(x, y),
            handleDungeonEvent: (e: DungeonInteraction) => {
                if (e.type === 'chest') { setGold(old => old + Math.floor(100 * e.level)); if (Math.random() < 0.3) setItems(p => [...p, generateLoot(e.level)]); }
            },
            toggleRaid: () => setRaidActive(p => !p),
            fightArena: (opponent: ArenaOpponent) => {
                if ((partyPower / (partyPower + opponent.power + 1)) > Math.random()) { setArenaRank(r => Math.max(1, r - 20)); setGlory(g => g + 10); } else setArenaRank(r => Math.min(9999, r + 5));
                setArenaOpponents([]);
            },
            attackSector: (id: string) => galaxyState.attackSector(id),
            attackTerritory: (id: string) => galaxyState.attackTerritory(id),
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
            enterVoid: () => setVoidActive(true),
            triggerRebirth: () => { setSouls(s => s + Math.max(1, Math.floor(boss.level / 10))); setHeroes(INITIAL_HEROES); setBoss(INITIAL_BOSS); setGold(0); },
            triggerAscension: () => { setVoidMatter(v => v + 10); setVoidAscensions(a => a + 1); },
            buyDarkGift: (cost: number, _e: string) => { if (voidMatter >= cost) setVoidMatter(v => v - cost); },
            ascendToVoid: () => setVoidActive(true),
            craftRune: () => {
                if (resources.mithril >= 10 && souls >= 50) {
                    setResources(r => ({ ...r, mithril: r.mithril - 10 })); setSouls(s => s - 50);
                    const r: Rune = { id: `r-${Date.now()}`, name: 'Rune', rarity: 'common', stat: 'attack', value: 0.05, bonus: '+5%' };
                    setRunes(p => [...p, r]);
                }
            },
            socketRune: (itemId: string, runeId: string) => {
                const item = items.find(i => i.id === itemId); const rune = runes.find(r => r.id === runeId);
                if (item && rune && item.runes.length < item.sockets) { setRunes(p => p.filter(r => r.id !== runeId)); setItems(p => p.map(i => i.id === itemId ? { ...i, runes: [...i.runes, rune] } : i)); }
            },
            reforgeItem: (_id: string) => { if (gold >= 500) { setGold(g => g - 500); addLog("Reforged item", "craft"); } },
            manualFish: () => { const f = processFishing(1); if (f > 0) setResources(r => ({ ...r, fish: r.fish + f })); },
            brewPotion: (id: string) => {
                const pot = POTIONS.find(p => p.id === id); if (pot && brewPotion(pot, resources).success) {
                    setResources(r => { const n = { ...r }; (pot.cost as any[]).forEach(c => (n as any)[c.type] -= c.amount); return n; });
                    setActivePotions(p => [...p, { id: pot.id, name: pot.name, effect: pot.effect, value: pot.value, endTime: Date.now() + pot.duration * 1000 }]);
                }
            },
            startExpedition: (e: Expedition) => { setHeroes(startExpedition(e, heroes)); setActiveExpeditions(p => [...p, e]); },
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
            moveGambit: (hId: string, gId: string, x: number, y: number) => setHeroes(p => p.map(h => h.id === hId ? { ...h, gambits: h.gambits.map(g => g.id === gId ? { ...g, position: { x, y } } : g) } : h)),
            renameGambit: (hId: string, gId: string, name: string) => setHeroes(p => p.map(h => h.id === hId ? { ...h, gambits: h.gambits.map(g => g.id === gId ? { ...g, customName: name } : g) } : h)),
            attackWorldBoss: () => worldBossState.attackWorldBoss(), claimWorldBossReward: () => worldBossState.claimReward(),
            challengeVoidCore: () => { if (voidMatter >= 10) addLog("Challenging Void Core...", "danger"); },
            setVictory: (v: boolean) => setVictory(v),
            interactWithEvent: (id: string, action: 'buy' | 'defend' | 'join', data?: any) => { if (activeEvent?.id === id && action === 'buy') setGold(g => g - (data?.item?.value || 0)); },
            dismissEvent: () => setActiveEvent(null),
            buyMasteryUpgrade: (type: keyof import('../engine/types').DungeonMastery) => {
                const cost = (dungeonMastery[type] + 1) * 1000;
                if (souls >= cost) { setSouls(s => s - cost); setDungeonMastery(prev => ({ ...prev, [type]: prev[type] + 1 })); }
            },
            assignHero: (id: string) => setHeroes(p => p.map(h => h.id === id ? { ...h, assignment: h.assignment === 'combat' ? 'none' : 'combat' } : h))
        };
        return baseActions as GameActions;
    }, [buildings, gold, items, runes, heroes, souls, resources, divinity, activeEvent, starlight, starlightUpgrades, partyPower, artifacts, petsState, guildState, galaxyState, gameStats, activeHeroes, boss.level, lastDailyReset, voidMatter, world, worldBossState, dungeonMastery]);

    // CORE LOOP
    useEffect(() => {
        if (activeHeroes.length === 0 && !world.tower.active) return;
        const tick = Math.max(40, (1000 / gameSpeed) * (1 - activeSynergies.filter(s => s.type === 'attackSpeed').reduce((acc, s) => acc + s.value, 0)));
        const timer = setTimeout(() => {
            if (shouldSummonTavern(gold, starlightUpgrades)) ACTIONS.summonTavernLine(1);
            const res = processCombatTurn(activeHeroes, boss, calculateDamageMultiplier(souls, divinity, talents, constellations, artifacts, boss, cards, achievements, petsState.pets), 0.1, ultimateCharge >= 100, petsState.pets, tick, 1, activeSynergies);
            damageAccumulator.current += res.totalDmg;
            if (ultimateCharge >= 100) setUltimateCharge(0); else setUltimateCharge(p => Math.min(100, p + 5));
            let currentBoss = { ...boss };
            let bossDefeated = false;

            if (res.totalDmg >= currentBoss.stats.hp) {
                bossDefeated = true;
                const xpGain = Math.floor(currentBoss.level * 10 * guildXpMult);
                setGold(g => g + Math.floor(currentBoss.level * 50 * guildGoldMult));
                setBoss(p => ({ ...p, level: p.level + 1, stats: { ...p.stats, maxHp: Math.floor(p.stats.maxHp * 1.2), hp: Math.floor(p.stats.maxHp * 1.2) } }));
                addLog(`Boss Defeated! Active heroes gained ${xpGain} XP.`, 'success');

                // Prepare next boss state for local logic if needed, but we set state above.
                // We use the boolean flag for the hero update logic.
            } else {
                setBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - res.totalDmg } }));
            }

            const miners = heroes.filter(h => h.assignment === 'mine');
            const mYield = processMining(miners);
            if (mYield) setResources(r => ({ ...r, copper: r.copper + (mYield.copper || 0), iron: r.iron + (mYield.iron || 0), mithril: r.mithril + (mYield.mithril || 0) }));

            setHeroes(prev => prev.map(oldHero => {
                // 1. Get Combat Update (HP, Skills, etc.) from processCombatTurn result
                // Note: res.updatedHeroes only contains ACTIVE heroes.
                const combatHero = res.updatedHeroes.find(h => h.id === oldHero.id);

                // Base to start: combat hero (new HP/skills) or old hero
                let h = combatHero ? { ...combatHero } : { ...oldHero };

                // 2. Apply XP / Level Up if Boss Died AND Hero was active (combatHero exists)
                if (bossDefeated && combatHero && !h.isDead) { // Only active survivors gain XP
                    const xpGain = Math.floor(boss.level * 10 * guildXpMult); // Recalc here or use scoped var
                    let newXp = (h.xp || 0) + xpGain;
                    let newLevel = h.level || 1;
                    let newMaxXp = h.maxXp || 100;
                    let newStats = { ...h.stats }; // Use current stats (which includes combat changes like HP loss? No, stats structure usually holds MaxHP etc. Current HP is h.stats.hp)
                    let newStatPoints = h.statPoints || 0;

                    // Preserve current HP ratio or absolute value? 
                    // Level up usually heals or boosts MaxHP.
                    // Let's boost MaxHP and add the specific gain to current HP as well to be nice.

                    while (newXp >= newMaxXp) {
                        newLevel++;
                        newXp -= newMaxXp;
                        newMaxXp = Math.floor(newMaxXp * 1.5);
                        newStatPoints += 5;

                        // Auto-growth
                        let hpGain = 0;
                        if (h.class === 'Warrior') { hpGain = 20; newStats.maxHp += 20; newStats.attack += 2; newStats.defense += 2; }
                        else if (h.class === 'Mage') { newStats.mp += 15; newStats.maxMp += 15; newStats.magic += 4; }
                        else if (h.class === 'Healer') { hpGain = 10; newStats.maxHp += 10; newStats.mp += 10; newStats.maxMp += 10; newStats.magic += 3; }
                        else { hpGain = 15; newStats.maxHp += 15; newStats.attack += 2; newStats.magic += 1; }

                        newStats.hp = Math.min(newStats.maxHp, newStats.hp + hpGain);
                    }
                    h = { ...h, xp: newXp, level: newLevel, maxXp: newMaxXp, stats: newStats, statPoints: newStatPoints };
                }

                // 3. Apply Fatigue / Mining Fatigue
                // Only if assigned
                if (h.assignment === 'combat') {
                    h.fatigue = Math.min(100, (h.fatigue || 0) + 0.1);
                } else if (h.assignment === 'mine') {
                    // logic for mining fatigue if exists, otherwise recovery
                    h.fatigue = Math.max(0, (h.fatigue || 0) - 1);
                } else {
                    h.fatigue = Math.max(0, (h.fatigue || 0) - 1);
                }

                return h;
            }));
        }, tick);
        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, divinity, starlightUpgrades, activeHeroes, galaxyState.galaxy, activeSynergies, guildGoldMult, talents, constellations, artifacts, cards, achievements, petsState.pets, ultimateCharge, world.tower.active, gold, ACTIONS]);

    usePersistence({
        heroes, setHeroes, boss, setBoss, items, setItems, souls, setSouls, gold, setGold, divinity, setDivinity,
        pets: petsState.pets, setPets: petsState.setPets, talents, setTalents, artifacts, setArtifacts, cards, setCards,
        constellations, setConstellations, keys, setKeys, resources, setResources, tower: world.tower, setTower: world.setTower,
        guild: guildState.guild, setGuild: guildState.setGuild, voidMatter, setVoidMatter, arenaRank, setArenaRank, glory, setGlory,
        quests, setQuests, runes, setRunes, achievements, setAchievements, starlight, setStarlight, starlightUpgrades, setStarlightUpgrades,
        autoSellRarity, setAutoSellRarity, theme, setTheme, galaxy: galaxyState.galaxy, setGalaxy: galaxyState.setGalaxy,
        monsterKills, setMonsterKills, gameStats, setGameStats, activeExpeditions, setActiveExpeditions, activePotions, setActivePotions,
        buildings, setBuildings, dailyQuests, setDailyQuests, dailyLoginClaimed, setDailyLoginClaimed, lastDailyReset, setLastDailyReset,
        territories: galaxyState.territories, setTerritories: galaxyState.setTerritories, spaceship: galaxyState.spaceship, setSpaceship: galaxyState.setSpaceship,
        weather: world.weather, setWeather: world.setWeather, formations: world.formations, setFormations: world.setFormations,
        arenaOpponents, setVisible: () => { }, arenaStatus: '', setArenaOpponents, setRaidActive, setDungeonActive: world.setDungeonActive, setOfflineGains
    } as any);

    const result = useMemo(() => {
        const setUIState = { setVictory, setMarketTimer, setRaidTimer, setVoidActive, setVoidTimer, setIsStarlightModalOpen, setPartyPower, setCombatEvents, setGameSpeed, setTheme, setIsSoundOn, setShowCampfire, setResources, setGold, setSouls, setHeroes, setItems, setDungeonMastery, setGardenPlots };
        return {
            gold, souls, divinity, starlight, heroes, items, inventory: items,
            dungeonMastery, gardenPlots, lastDailyReset, dailyLoginClaimed, dailyQuests, gameStats,
            guild: guildState.guild, activeHeroes, partyPower, partyDps, activeEvent,
            victory, boss, resources, starlightUpgrades, achievements, combatEvents,
            logs, isSoundOn, voidAscensions, offlineGains, marketStock, marketTimer, raidActive,
            raidTimer, voidActive, voidTimer, isStarlightModalOpen, cards, constellations, keys,
            monsterKills, activeExpeditions, activePotions, ultimateCharge, voidMatter, showCampfire,

            // App.tsx State
            arenaOpponents, arenaRank, glory, theme, autoSellRarity, quests, runes,
            gameSpeed, pets: petsState.pets, artifacts, talents,
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

            actions: ACTIONS,
            // Root actions for legacy compatibility
            ...ACTIONS,
            ...setUIState,
            worldBoss: worldBossState.worldBoss, worldBossDamage: worldBossState.personalDamage, worldBossCanClaim: worldBossState.canClaim,
            guildXpMult
        };
    }, [gold, souls, divinity, starlight, heroes, items, dungeonMastery, gardenPlots, lastDailyReset, dailyLoginClaimed, dailyQuests, gameStats, world, guildState.guild, activeHeroes, partyPower, partyDps, activeEvent, victory, boss, resources, starlightUpgrades, talents, achievements, combatEvents, logs, isSoundOn, voidAscensions, offlineGains, marketStock, marketTimer, raidActive, raidTimer, voidActive, voidTimer, isStarlightModalOpen, cards, constellations, keys, monsterKills, activeExpeditions, activePotions, ultimateCharge, voidMatter, ACTIONS, worldBossState, guildXpMult, showCampfire, galaxyState.spaceship, galaxyState.territories, galaxyState.galaxy, activeSynergies, buildings, arenaOpponents, arenaRank, glory, theme, autoSellRarity, quests, runes, gameSpeed, petsState.pets, artifacts]);

    return result;
};
