import { useState, useEffect } from 'react';
import type { Hero, Boss, LogEntry, Item, Pet, Talent, Artifact, ConstellationNode, MonsterCard, ElementType, Tower, Guild, Gambit, Quest, ArenaOpponent, Rune, Achievement } from '../engine/types';
import { GUILDS } from '../engine/types';
import { soundManager } from '../engine/sound';
import { usePersistence } from './usePersistence';
import { processCombatTurn, calculateDamageMultiplier } from '../engine/combat';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'ach1', name: 'Novice Slayer', description: 'Kill 100 Bosses', unlocked: false, condition: { type: 'bossKills', value: 100 }, reward: '+10% Gold' },
    { id: 'ach2', name: 'Millionaire', description: 'Hoard 1,000,000 Gold', unlocked: false, condition: { type: 'gold', value: 1000000 }, reward: '+5% Damage' },
    { id: 'ach3', name: 'Rune Smith', description: 'Craft 10 Runes', unlocked: false, condition: { type: 'crafts', value: 10 }, reward: '+10% Craft Speed' },
    { id: 'ach4', name: 'Clicker King', description: 'Click 5000 Times', unlocked: false, condition: { type: 'clicks', value: 5000 }, reward: '+1 Click DMG' }
];

export const INITIAL_HEROES: Hero[] = [
    { id: 'h1', name: 'Warrior', type: 'hero', class: 'Warrior', emoji: '🛡️', unlocked: true, isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 } },
    { id: 'h2', name: 'Mage', type: 'hero', class: 'Mage', emoji: '🔮', unlocked: true, isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, stats: { hp: 70, maxHp: 70, mp: 100, maxMp: 100, attack: 5, magic: 25, defense: 3, speed: 12 } },
    { id: 'h3', name: 'Healer', type: 'hero', class: 'Healer', emoji: '💚', unlocked: true, isDead: false, element: 'water', assignment: 'combat', gambits: [{ id: 'g1', condition: 'ally_hp<50', action: 'heal', target: 'weakest_ally' }], corruption: false, stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, attack: 8, magic: 20, defense: 5, speed: 11 } },
    { id: 'h4', name: 'Rogue', type: 'hero', class: 'Rogue', unlocked: false, emoji: '🗡️', isDead: false, element: 'nature', assignment: 'combat', gambits: [], corruption: false, stats: { hp: 85, maxHp: 85, mp: 50, maxMp: 50, attack: 25, magic: 5, defense: 5, speed: 15 } },
    { id: 'h5', name: 'Paladin', type: 'hero', class: 'Paladin', unlocked: false, emoji: '✝️', isDead: false, element: 'fire', assignment: 'combat', gambits: [], corruption: false, stats: { hp: 150, maxHp: 150, mp: 40, maxMp: 40, attack: 10, magic: 15, defense: 15, speed: 8 } },
    { id: 'h6', name: 'Warlock', type: 'hero', class: 'Warlock', unlocked: false, emoji: '☠️', isDead: false, element: 'water', assignment: 'combat', gambits: [], corruption: false, stats: { hp: 60, maxHp: 60, mp: 120, maxMp: 120, attack: 5, magic: 35, defense: 2, speed: 9 } }
];

export const INITIAL_BOSS: Boss = {
    id: 'boss-1', name: 'Slime', emoji: '🦠', type: 'boss', level: 1, isDead: false, element: 'neutral',
    stats: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 12, magic: 0, defense: 2, speed: 8 }
};

export const INITIAL_PET_DATA: Pet = {
    id: 'pet-dragon', name: 'Baby Dragon', type: 'pet', bonus: 'DPS', emoji: '🐉', isDead: false,
    level: 1, xp: 0, maxXp: 100,
    stats: { attack: 5, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 }
};

const INITIAL_TALENTS: Talent[] = [
    { id: 't1', name: 'Sharpness', level: 0, maxLevel: 50, cost: 10, costScaling: 1.5, description: '+5% Damage', stat: 'attack', valuePerLevel: 0.05 },
    { id: 't2', name: 'Haste', level: 0, maxLevel: 20, cost: 50, costScaling: 2, description: '-2% Combat Delay', stat: 'speed', valuePerLevel: 0.02 },
    { id: 't3', name: 'Greed', level: 0, maxLevel: 10, cost: 100, costScaling: 3, description: '+10% Value', stat: 'gold', valuePerLevel: 0.1 },
    { id: 't4', name: 'Precision', level: 0, maxLevel: 25, cost: 25, costScaling: 1.8, description: '+1% Crit Chance', stat: 'crit', valuePerLevel: 0.01 }
];

const MONSTERS = [
    { name: 'Slime', emoji: '🦠' }, { name: 'Rat', emoji: '🐀' }, { name: 'Spider', emoji: '🕷️' }, { name: 'Bat', emoji: '🦇' },
    { name: 'Wolf', emoji: '🐺' }, { name: 'Goblin', emoji: '👺' }, { name: 'Skeleton', emoji: '💀' }, { name: 'Orc', emoji: '👹' },
    { name: 'Ghost', emoji: '👻' }, { name: 'Zombie', emoji: '🧟' }, { name: 'Troll', emoji: '🗿' }, { name: 'Yeti', emoji: '🥶' },
    { name: 'Mummy', emoji: '🤕' }, { name: 'Vampire', emoji: '🧛' }, { name: 'Demon', emoji: '👿' }, { name: 'Dragon', emoji: '🐉' },
    { name: 'Hydra', emoji: '🐍' }, { name: 'Kraken', emoji: '🐙' }, { name: 'Titan', emoji: '👾' }, { name: 'Evil Eye', emoji: '👁️' }
];

const INITIAL_CONSTELLATIONS: ConstellationNode[] = [
    { id: 'c1', name: 'Orion', description: '+Boss Damage', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'bossDamage', valuePerLevel: 0.10, x: 20, y: 50 },
    { id: 'c2', name: 'Lyra', description: '+Gold Drops', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'goldDrop', valuePerLevel: 0.20, x: 50, y: 20 },
    { id: 'c3', name: 'Phoenix', description: '+Soul Drops', level: 0, maxLevel: 10, cost: 2, costScaling: 3, bonusType: 'soulDrop', valuePerLevel: 0.10, x: 80, y: 50 },
    { id: 'c4', name: 'Draco', description: 'Revive Speed', level: 0, maxLevel: 5, cost: 5, costScaling: 4, bonusType: 'autoReviveSpeed', valuePerLevel: 0.50, x: 50, y: 80 }
];

const RARE_ARTIFACTS: Artifact[] = [
    { id: 'a1', name: 'Crown of Kings', description: 'Start at Lvl 5', emoji: '👑', bonus: 'lvl+5', unlocked: false },
    { id: 'a2', name: 'Void Stone', description: '+50% All Stats', emoji: '🌑', bonus: 'stats+50', unlocked: false },
    { id: 'a3', name: 'Phoenix Feather', description: 'Auto-Revive (10s)', emoji: '🪶', bonus: 'revive', unlocked: false }
];

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
    const [quests, setQuests] = useState<Quest[]>([
        { id: 'q1', description: 'Slay 50 Monsters', target: 50, progress: 0, reward: { type: 'gold', amount: 500 }, isCompleted: false, isClaimed: false },
        { id: 'q2', description: 'Collect 100 Souls', target: 100, progress: 0, reward: { type: 'souls', amount: 50 }, isCompleted: false, isClaimed: false },
        { id: 'q3', description: 'Enter the Tower', target: 1, progress: 0, reward: { type: 'voidMatter', amount: 1 }, isCompleted: false, isClaimed: false }
    ]);

    // PHASE 11
    const [runes, setRunes] = useState<Rune[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

    // LOAD
    // PERSISTENCE
    usePersistence(
        heroes, setHeroes, boss, setBoss, items, setItems, souls, setSouls, gold, setGold,
        divinity, setDivinity, pet, setPet, talents, setTalents, artifacts, setArtifacts,
        cards, setCards, constellations, setConstellations, keys, setKeys, resources, setResources,
        tower, setTower, guild, setGuild, voidMatter, setVoidMatter, setRaidActive, setDungeonActive, setOfflineGains,
        arenaRank, setArenaRank, glory, setGlory, quests, setQuests,
        runes, setRunes, achievements, setAchievements
    );

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-14), { id: Math.random().toString(36), message, type }]);
    };
    const toggleSound = () => { setIsSoundOn(!isSoundOn); soundManager.toggle(!isSoundOn); };

    const ACTIONS = {
        buyTalent: (id: string) => {
            setTalents(prev => prev.map(t => {
                if (t.id === id && souls >= t.cost && t.level < t.maxLevel) {
                    setSouls(s => s - t.cost);
                    return { ...t, level: t.level + 1, cost: Math.floor(t.cost * t.costScaling) };
                }
                return t;
            }));
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
                    addLog(`TAVERN FOUND: ${newArt.name}!`, 'death');
                } else { addLog("Tavern Keeper found nothing special.", 'info'); }
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
            addLog(`REBIRTH! +${soulsGain} Souls.`, 'death');
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
            setRaidActive(false);
            setVoidMatter(0);
            addLog("ASCENDED! GAINED DIVINITY!", 'death');
        },
        toggleCorruption: (heroId: string) => {
            setHeroes(prev => prev.map(h => h.id === heroId ? { ...h, corruption: !h.corruption } : h));
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
                addLog(`Dark Gift Acquired: ${effect}`, 'death');
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
                    addLog(`PET LEVEL UP! Lvl ${newLvl}`, 'heal');
                    soundManager.playLevelUp();
                }
                return { ...p, xp: newXp, level: newLvl, maxXp: newMax, stats: newStats };
            });
            addLog("Pet fed!", 'heal');
        },
        // TOWER
        enterTower: () => {
            if (tower.active) {
                // Fleeing
                setTower(t => ({ ...t, active: false }));
                setBoss(INITIAL_BOSS); // Reset to normal boss
                addLog("Escaped the Tower.", 'info');
                return;
            }
            setTower(t => ({ ...t, active: true }));
            setBoss({
                id: `tower-${tower.floor}`, name: `Tower Guardian ${tower.floor}`, emoji: '🏯', type: 'boss',
                level: tower.floor * 10, isDead: false, element: 'neutral',
                stats: {
                    hp: 500 * Math.pow(1.5, tower.floor), maxHp: 500 * Math.pow(1.5, tower.floor),
                    attack: 20 * tower.floor, defense: 5 * tower.floor,
                    magic: 10 * tower.floor, speed: 10 + tower.floor, mp: 9999, maxMp: 9999
                }
            });
            addLog(`Entering Tower Floor ${tower.floor}...`, 'death');
        },
        // GUILD
        joinGuild: (guildName: string) => {
            if (guild) return; // Already in one
            const template = GUILDS.find(g => g.name === guildName);
            if (template) {
                setGuild({ name: template.name, level: 1, xp: 0, maxXp: 1000, bonus: template.bonus, members: 1 });
                addLog(`Joined ${guildName}!`, 'heal');
            }
        },
        donateGuild: (amount: number, currency: 'gold' | 'ore') => {
            if (!guild) return;
            let xpGain = 0;
            if (currency === 'gold') {
                if (gold >= amount) { setGold(g => g - amount); xpGain = Math.floor(amount / 10); }
            } else {
                // Assume amount is 100 copper for simplicity in this MVP
                if (resources.copper >= amount) { setResources(r => ({ ...r, copper: r.copper - amount })); xpGain = 50; }
            }

            if (xpGain > 0) {
                setGuild(prev => {
                    if (!prev) return null;
                    let newXp = prev.xp + xpGain;
                    let newLevel = prev.level;
                    let newMax = prev.maxXp;
                    if (newXp >= prev.maxXp) {
                        newLevel++;
                        newXp -= prev.maxXp;
                        newMax = Math.floor(newMax * 1.5);
                        addLog(`GUILD LEVEL UP! Lvl ${newLevel}`, 'heal');
                        soundManager.playLevelUp();
                    }
                    return { ...prev, xp: newXp, level: newLevel, maxXp: newMax };
                });
            }
        },
        // ARENA
        fightArena: (opponent: ArenaOpponent) => {
            const teamPower = heroes.filter(h => h.unlocked && h.assignment === 'combat').reduce((acc, h) => acc + h.stats.attack + h.stats.hp / 10, 0);
            const winChance = teamPower / (teamPower + opponent.power); // Simplified ELO-ish

            if (Math.random() < winChance) {
                addLog(`Arena Victory! Defeated ${opponent.name}`, 'death');
                setArenaRank(r => Math.max(1, r - Math.floor(Math.random() * 5 + 1))); // Rank up (lower is better)
                setGlory(g => g + 10);
                soundManager.playLevelUp();
            } else {
                addLog(`Arena Defeat against ${opponent.name}`, 'damage');
                setArenaRank(r => r + Math.floor(Math.random() * 3 + 1)); // Rank down
            }
        },
        // QUESTS
        claimQuest: (id: string) => {
            setQuests(prev => prev.map(q => {
                if (q.id === id && q.isCompleted && !q.isClaimed) {
                    if (q.reward.type === 'gold') setGold(g => g + q.reward.amount);
                    if (q.reward.type === 'souls') setSouls(s => s + q.reward.amount);
                    if (q.reward.type === 'voidMatter') setVoidMatter(v => v + q.reward.amount);
                    addLog(`Quest Claimed: ${q.reward.amount} ${q.reward.type}!`, 'heal');
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
                    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Rune of ${stat.charAt(0).toUpperCase() + stat.slice(1)}`,
                    rarity,
                    stat,
                    value: val,
                    bonus: `+${val}% ${stat.toUpperCase()}`
                };

                setRunes(prev => [...prev, newRune]);
                addLog(`Crafted: ${newRune.name}`, 'craft');
                soundManager.playLevelUp();
            }
        },
        socketRune: (itemId: string, runeId: string) => {
            const rune = runes.find(r => r.id === runeId);
            if (!rune) return;

            setItems(prev => prev.map(item => {
                if (item.id === itemId && item.runes.length < item.sockets) {
                    setRunes(rs => rs.filter(r => r.id !== runeId)); // Remove from inventory
                    addLog(`Socketed ${rune.name} into ${item.name}`, 'craft');
                    soundManager.playLevelUp();
                    return { ...item, runes: [...item.runes, rune] };
                }
                return item;
            }));
        },
        closeOfflineModal: () => setOfflineGains(null),
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
        if (dungeonActive) {
            if (dungeonTimer <= 0) { setDungeonActive(false); setBoss(INITIAL_BOSS); addLog("Dungeon Closed.", 'info'); }
            else { setDungeonTimer(t => t - (1 * gameSpeed / 10)); }
        }
        if (voidActive) {
            if (voidTimer <= 0) {
                setVoidActive(false);
                setBoss(INITIAL_BOSS);
                addLog("VOID REJECTED YOU (TIMEOUT).", 'damage');
            } else {
                setVoidTimer(t => t - (1 * gameSpeed / 10));
            }
        }
        if (tower.active) {
            // Check for failure (Party Wipe)
            if (activeHeroes.length > 0 && activeHeroes.every(h => h.isDead)) {
                setTower(t => ({ ...t, active: false }));
                setBoss(INITIAL_BOSS);
                addLog(`DEFEAT! Tower Floor ${tower.floor} failed.`, 'death');
            }
        }

        const hasteTalent = talents.find(t => t.stat === 'speed');
        const speedBonus = hasteTalent ? (1 - (hasteTalent.level * hasteTalent.valuePerLevel)) : 1;
        const baseTick = 1000 / gameSpeed;
        const effectiveTick = Math.max(100, baseTick * speedBonus);

        const timer = setTimeout(() => {
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


            const damageMult = calculateDamageMultiplier(souls, divinity, talents, constellations, artifacts, boss, cards);
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

            const { updatedHeroes, totalDmg } = processCombatTurn(heroes, boss, damageMult, critChance, isUltimate, pet);

            // Healer Logic (Simplified check for 'heal' action or just passive)
            // Ideally this should be inside processCombatTurn or a separate pass, leaving as is but using updatedHeroes
            if (activeHeroes.some(h => h.class === 'Healer')) {
                const lowest = updatedHeroes.filter(h => !h.isDead && h.assignment === 'combat').sort((a, b) => a.stats.hp - b.stats.hp)[0];
                if (lowest) {
                    lowest.stats.hp = Math.min(lowest.stats.maxHp, lowest.stats.hp + (lowest.stats.maxHp * 0.05));
                }
            }

            setHeroes(updatedHeroes);

            let newBossHp = Math.max(0, boss.stats.hp - totalDmg);
            if (totalDmg > 0 && Math.random() > 0.8) soundManager.playHit();

            if (newBossHp === 0) {
                // Drops
                const sockets = Math.floor(Math.random() * 3) + 1; // 1 to 3 sockets
                const loot: Item = { id: Math.random().toString(), name: 'Item', type: 'weapon', stat: 'attack', value: boss.level, rarity: 'common', sockets, runes: [] };
                setItems(p => [...p, loot]);


                // Quest Progress (Kill Monster)
                setQuests(prev => prev.map(q => {
                    if (!q.isCompleted && q.description.includes('Slay')) return { ...q, progress: Math.min(q.target, q.progress + 1), isCompleted: q.progress + 1 >= q.target };
                    if (!q.isCompleted && q.description.includes('Souls') && souls > q.target) return { ...q, progress: q.target, isCompleted: true }; // Retroactive check
                    return q;
                }));

                // Gold
                const cGold = constellations.find(c => c.bonusType === 'goldDrop');
                const starGold = cGold ? (1 + cGold.level * cGold.valuePerLevel) : 1;

                let goldDrop = Math.floor(boss.level * (Math.random() * 5 + 1) * starGold);
                if (dungeonActive) goldDrop *= 10;
                setGold(g => g + goldDrop);

                // Key Drop (Rare)
                if (Math.random() < 0.02) { setKeys(k => k + 1); addLog("FOUND GOLD KEY!", 'death'); }

                // Card Drop (5%)
                if (pet) {
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
                }

                if (Math.random() < 0.05) {
                    setCards(prev => {
                        const existing = prev.find(c => c.id === boss.emoji);
                        if (existing) { return prev.map(c => c.id === boss.emoji ? { ...c, count: c.count + 1 } : c); }
                        else { addLog(`New Card: ${boss.emoji}`, 'death'); return [...prev, { id: boss.emoji, monsterName: boss.name, count: 1, bonus: 0.1 }]; }
                    });
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

                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
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

        }, effectiveTick);

        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, gold, divinity, pet, talents, artifacts, cards, constellations, keys, dungeonActive, raidActive, resources]);

    useEffect(() => { if (boss.level >= 10 && !pet) setPet(INITIAL_PET_DATA); }, [boss.level, pet]);

    useEffect(() => {
        const assigned = heroes.filter(h => h.unlocked && h.assignment === 'combat');
        if (assigned.length > 0 && assigned.every(h => h.isDead)) {
            setTimeout(() => {
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
            }, 3000);
        }
    }, [heroes]);

    return {
        heroes, boss, logs, items, gameSpeed, isSoundOn, souls, gold, divinity, pet, offlineGains,
        talents, artifacts, cards, constellations, keys, dungeonActive, dungeonTimer, resources,
        ultimateCharge, raidActive, raidTimer, tower, guild, voidMatter, voidActive, voidTimer,
        arenaRank, glory, quests, runes, achievements,
        actions: ACTIONS
    };
};
