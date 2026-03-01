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
import { PRESTIGE_NODES } from '../components/modals/PrestigeTreeModal';

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
    const MAX_INVENTORY_SIZE = 200; // Evitar crescimento de memória ilimitado
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
    const [outerSpaceUnlocked, setOuterSpaceUnlocked] = useState(false);
    const [prestigeNodes, setPrestigeNodes] = useState<Record<string, number>>({});
    const [townVisited, setTownVisited] = useState(false);
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

    const activeHeroes = useMemo(() => (heroes || []).filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked), [heroes]);

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

    const calculatedPartyPower = useMemo(() => {
        if (!heroes) return 0;
        return heroes.filter(h => h.unlocked && !h.isDead).reduce((sum, h) => {
            return sum + (h.stats.attack || 0) + Math.floor((h.stats.maxHp || 0) / 10) + (h.stats.magic || 0) + (h.stats.defense || 0);
        }, 0);
    }, [heroes]);

    // REFS FOR LOOP STABILITY
    const stateRef = useRef({
        souls, talents, constellations, artifacts, cards, achievements,
        pets: petsState.pets, activeSynergies: activeSynergies as any[],
        boss, ultimateCharge, gold, gameSpeed,
        galaxyDamageMult: galaxyBuffs.damageMult
    });

    useEffect(() => {
        stateRef.current = {
            souls, talents, constellations, artifacts, cards, achievements,
            pets: petsState.pets, activeSynergies: activeSynergies as any[],
            boss, ultimateCharge, gold, gameSpeed,
            galaxyDamageMult: galaxyBuffs.damageMult
        };
    }, [souls, talents, constellations, artifacts, cards, achievements, petsState.pets, activeSynergies, boss, ultimateCharge, gold, gameSpeed, galaxyBuffs.damageMult]);

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
            const names = ['Kai', 'Zara', 'Vex', 'Luna', 'Drak', 'Sora', 'Theron', 'Mira'];
            const avatars = ['🗡️', '🏹', '⚔️', '💫', '💀', '🔥', '⚡', '😈'];
            const newOpponents = Array.from({ length: 3 }, (_, i) => ({
                id: `arena-opp-${Date.now()}-${i}`,
                name: names[Math.floor(Math.random() * names.length)],
                avatar: avatars[Math.floor(Math.random() * avatars.length)],
                rank: Math.max(1, rank - 10 + Math.floor(Math.random() * 30)),
                power: Math.floor(power * (0.7 + Math.random() * 0.8)),
            }));
            setArenaOpponents(newOpponents);
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
                        addLog("A Reide terminou!", "info");
                        return 0;
                    }
                    return prev - 1;
                });
            }

            if (voidActive) {
                setVoidTimer(prev => prev > 0 ? prev - 1 : 0);
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
        }, 1000);
        return () => clearInterval(timer);
    }, [raidActive, voidActive, calculatedPartyPower]);


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
            enterTower: () => {
                const wasActive = world.tower.active;
                world.setTower(p => ({ ...p, active: !p.active, floor: wasActive ? p.floor : 1 }));
                if (!wasActive) {
                    addLog("Entrou na Torre da Eternidade!", "danger");
                    soundManager.playHit();
                } else {
                    addLog("Recuou da Torre.", "info");
                }
            },
            triggerRebirth: () => setPortalConfig({
                title: "RENASCER",
                message: "Um portal para outro plano se abre diante de você.",
                warning: "Heróis, Ouro e Nível do Boss serão reiniciados.",
                soulsGained: Math.floor(boss.level / 5) * (1 + (prestigeNodes['souls_1'] || 0) * 0.2),
                onConfirm: ACTIONS.confirmRebirth
            }),
            confirmRebirth: () => {
                const soulsGained = Math.floor(boss.level / 5) * (1 + (prestigeNodes['souls_1'] || 0) * 0.2);
                setSouls(s => s + soulsGained);
                setHeroes(INITIAL_HEROES.map(h => ({ ...h, level: 1 + (prestigeNodes['legend_1'] || 0) * 2 })));
                setGold(0);
                setBoss(INITIAL_BOSS);
                setItems([]);
                setPortalConfig(null);
                addLog(`Renascido! Ganhou ${soulsGained} Almas.`, 'achievement');
                soundManager.playLevelUp();
            },
            buyPrestigeNode: (nodeId: string) => {
                const node = PRESTIGE_NODES.find((n: any) => n.id === nodeId);
                if (node && souls >= node.cost && (prestigeNodes[nodeId] || 0) < node.maxLevel) {
                    setSouls(s => s - node.cost);
                    setPrestigeNodes(p => ({ ...p, [nodeId]: (p[nodeId] || 0) + 1 }));
                    addLog(`Poder Desbloqueado: ${node.name}!`, 'success');
                }
            },
            visitTown: () => {
                setTownVisited(true);
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
                const winChance = calculatedPartyPower / (calculatedPartyPower + opponent.power + 1);
                const won = winChance > Math.random();
                if (won) {
                    // Ranking e Glória
                    setArenaRank(r => Math.max(1, r - 20));
                    const gloryGain = 10 + Math.floor(opponent.power / 50);
                    setGlory(g => g + gloryGain);

                    // Recompensas de ouro (escala com o poder do oponente)
                    const goldReward = Math.floor(50 + opponent.power * 0.5);
                    setGold(g => g + goldReward);

                    // Chance de ganhar lutador para a guilda (25%)
                    const guildFighterNames = ['Ser Darek', 'Lyra Sombria', 'Thox o Feroz', 'Capitã Mira', 'Vex das Sombras', 'Korath Ferro'];
                    const guildFighterEmojis = ['⚔️', '🏹', '💥', '🛡️', '👻', '🔨'];
                    let extraMsg = '';
                    if (Math.random() < 0.25) {
                        const idx = Math.floor(Math.random() * guildFighterNames.length);
                        const fighterName = guildFighterNames[idx];
                        const fighterEmoji = guildFighterEmojis[idx];
                        // Adiciona XP à guilda como representão do novo lutador
                        guildState.setGuild((g: any) => g ? { ...g, xp: Math.min(g.xp + 500, g.maxXp), members: g.members + 1 } : g);
                        extraMsg = ` ${fighterEmoji} ${fighterName} juntou-se à sua Guilda! (+500 XP de Guilda)`;
                    }

                    addLog(`Vitória na Arena contra ${opponent.name}! +${gloryGain} Glória, +${goldReward} Ouro.${extraMsg}`, 'achievement');

                    // Dificuldade exponencial: próximos oponentes ficam 10%-100% mais fortes
                    const growthFactor = 1.1 + Math.random() * 0.9; // 1.1x a 2.0x
                    setArenaOpponents(prev => prev.map(op =>
                        op.id !== opponent.id ? { ...op, power: Math.floor(op.power * growthFactor) } : op
                    ));

                } else {
                    setArenaRank(r => Math.min(9999, r + 5));
                    addLog(`Derrota na Arena contra ${opponent.name}... Continue treinando!`, 'danger');
                    // Derrota: oponentes ficam levemente mais fracos (rebalanceo)
                    setArenaOpponents(prev => prev.map(op =>
                        op.id !== opponent.id ? { ...op, power: Math.floor(op.power * 0.95) } : op
                    ));
                }
                // Remover oponente derrotado/vencedor e regenerar um novo
                setArenaOpponents(prev => prev.filter(op => op.id !== opponent.id));
            },
            attackSector: (id: string) => galaxyState.attackSector(id),
            attackTerritory: (id: string) => galaxyState.attackTerritory(id),
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
            enterVoid: () => setVoidActive(true),
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

    // CORE LOOP (STABILIZED - Phase Memory Fix)
    useEffect(() => {
        const runTick = () => {
            const { souls, talents, constellations, artifacts, cards, achievements, pets, activeSynergies, boss, ultimateCharge, gold, gameSpeed, galaxyDamageMult } = stateRef.current;
            if (activeHeroes.length === 0 && !world.tower.active) return;

            const tick = Math.max(40, (1000 / gameSpeed) * (1 - (activeSynergies || []).filter(s => s.type === 'attackSpeed').reduce((acc, s) => acc + s.value, 0)));

            if (shouldSummonTavern(gold, starlightUpgrades)) ACTIONS.summonTavernLine(1);

            const res = processCombatTurn(activeHeroes, boss, calculateDamageMultiplier(souls, talents, constellations, artifacts, boss, cards, achievements, pets, galaxyDamageMult), 0.1, ultimateCharge >= 100, pets, tick, 1, activeSynergies);

            damageAccumulator.current += res.totalDmg;

            if (res.events && res.events.length > 0) {
                setCombatEvents(prev => [...prev, ...res.events].slice(-20));
            }

            const petDpsBonus = (pets || []).reduce((sum, pet) => sum + (pet.level * 5), 0);
            if (petDpsBonus > 0) damageAccumulator.current += petDpsBonus * (tick / 1000);

            if (ultimateCharge >= 100) setUltimateCharge(0);
            else setUltimateCharge(p => Math.min(100, p + 5));

            let bossDefeated = false;
            let currentBoss = { ...boss };

            // Apply Galaxy Gold/XP Buffs to the gains
            const finalGoldMult = guildGoldMult * prestigeGoldMult * (1 + (galaxyState.galaxyBuffs.goldMult || 0));
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
                setBoss(p => ({ ...p, level: p.level + 1, stats: { ...p.stats, maxHp: Math.floor(p.stats.maxHp * 1.2), hp: Math.floor(p.stats.maxHp * 1.2) } }));
                addLog(`Boss Derrotado! Heróis ganharam ${xpGain} XP.`, 'success');
            } else {
                setBoss(p => ({ ...p, stats: { ...p.stats, hp: p.stats.hp - res.totalDmg } }));
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
                if (mYield) setResources(r => ({ ...r, copper: r.copper + (mYield.copper || 0), iron: r.iron + (mYield.iron || 0), mithril: r.mithril + (mYield.mithril || 0) }));

                return prev.map(oldHero => {
                    const combatHero = res.updatedHeroes.find(h => h.id === oldHero.id);
                    let h = combatHero ? { ...combatHero } : { ...oldHero };

                    if (bossDefeated && combatHero && !h.isDead) {
                        const xpGain = Math.floor(currentBoss.level * 10 * finalXpMult);
                        let newXp = (h.xp || 0) + xpGain;
                        // ...
                        let newLevel = h.level || 1;
                        let newMaxXp = h.maxXp || 100;
                        let newStats = { ...h.stats };
                        let currentStatPoints = h.statPoints || 0;

                        while (newXp >= newMaxXp) {
                            newLevel++;
                            newXp -= newMaxXp;
                            newMaxXp = Math.floor(newMaxXp * 1.5);
                            currentStatPoints += 5;
                        }
                        h = { ...h, xp: newXp, level: newLevel, maxXp: newMaxXp, stats: { ...newStats }, statPoints: currentStatPoints };
                    }

                    if (h.assignment === 'combat') h.fatigue = Math.min(100, (h.fatigue || 0) + 0.1);
                    else h.fatigue = Math.max(0, (h.fatigue || 0) - 1);

                    return h;
                });
            });

            // Re-schedule
            loopRef.current = setTimeout(runTick, tick);
        };

        const loopRef = { current: setTimeout(runTick, 1000) };
        return () => clearTimeout(loopRef.current);
    }, [activeHeroes.length, starlightUpgrades, world.tower.active, guildXpMult, guildGoldMult, prestigeXpMult, prestigeGoldMult]); // Reduced deps

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
        outerSpaceUnlocked, setOuterSpaceUnlocked,
        arenaOpponents, setVisible: () => { }, arenaStatus: '', setArenaOpponents, setRaidActive, setDungeonActive: world.setDungeonActive, setOfflineGains
    } as any);

    const result = useMemo(() => {
        const setUIState = { setVictory, setMarketTimer, setRaidTimer, setVoidActive, setVoidTimer, setIsStarlightModalOpen, setPartyPower, setCombatEvents, setGameSpeed, setTheme, setIsSoundOn, setShowCampfire, setResources, setGold, setSouls, setHeroes, setItems, setDungeonMastery, setGardenPlots, setDivinity, setStarlight, setAchievements, setBuildings, setOuterSpaceUnlocked };
        return {
            gold, souls, divinity, starlight, heroes, items, inventory: items,
            dungeonMastery, gardenPlots, lastDailyReset, dailyLoginClaimed, dailyQuests, gameStats,
            guild: guildState.guild, activeHeroes, partyPower, partyDps, activeEvent,
            victory, boss, resources, starlightUpgrades, achievements, combatEvents,
            logs, isSoundOn, voidAscensions, offlineGains, marketStock, marketTimer, raidActive,
            raidTimer, voidActive, voidTimer, isStarlightModalOpen, cards, constellations, keys,
            monsterKills, activeExpeditions, activePotions, ultimateCharge, voidMatter, showCampfire,
            outerSpaceUnlocked, prestigeNodes, townVisited, portalConfig,


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
            setPortalConfig,
            ascendToVoid: ACTIONS.ascendToVoid,
            worldBoss: worldBossState.worldBoss, worldBossDamage: worldBossState.personalDamage, worldBossCanClaim: worldBossState.canClaim,
            guildXpMult
        };
    }, [gold, souls, divinity, starlight, heroes, items, dungeonMastery, gardenPlots, lastDailyReset, dailyLoginClaimed, dailyQuests, gameStats, world, guildState.guild, activeHeroes, partyPower, partyDps, activeEvent, victory, boss, resources, starlightUpgrades, talents, achievements, combatEvents, logs, isSoundOn, offlineGains, marketStock, marketTimer, raidActive,
        raidTimer, voidActive, voidTimer, isStarlightModalOpen, cards, constellations, keys, monsterKills, activeExpeditions, activePotions, ultimateCharge, voidMatter, ACTIONS, worldBossState, guildXpMult, showCampfire, galaxyState.spaceship, galaxyState.territories, galaxyState.galaxy, activeSynergies, buildings, arenaOpponents, arenaRank, glory, theme, autoSellRarity, quests, runes, gameSpeed, petsState.pets, artifacts, prestigeNodes, townVisited, portalConfig]);

    return result;
};
