import { useState, useEffect } from 'react';
import type { Hero, Boss, LogEntry, Item, Pet, Talent, Artifact, ConstellationNode, MonsterCard } from '../engine/types';
import { soundManager } from '../engine/sound';

const INITIAL_HEROES: Hero[] = [
    { id: 'h1', name: 'Warrior', type: 'hero', class: 'Warrior', emoji: '🛡️', unlocked: true, isDead: false, stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 } },
    { id: 'h2', name: 'Mage', type: 'hero', class: 'Mage', emoji: '🔮', unlocked: true, isDead: false, stats: { hp: 70, maxHp: 70, mp: 100, maxMp: 100, attack: 5, magic: 25, defense: 3, speed: 12 } },
    { id: 'h3', name: 'Healer', type: 'hero', class: 'Healer', emoji: '💚', unlocked: true, isDead: false, stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, attack: 8, magic: 20, defense: 5, speed: 11 } },
    { id: 'h4', name: 'Rogue', type: 'hero', class: 'Rogue', unlocked: false, emoji: '🗡️', isDead: false, stats: { hp: 85, maxHp: 85, mp: 50, maxMp: 50, attack: 25, magic: 5, defense: 5, speed: 15 } },
    { id: 'h5', name: 'Paladin', type: 'hero', class: 'Paladin', unlocked: false, emoji: '✝️', isDead: false, stats: { hp: 150, maxHp: 150, mp: 40, maxMp: 40, attack: 10, magic: 15, defense: 15, speed: 8 } },
    { id: 'h6', name: 'Warlock', type: 'hero', class: 'Warlock', unlocked: false, emoji: '☠️', isDead: false, stats: { hp: 60, maxHp: 60, mp: 120, maxMp: 120, attack: 5, magic: 35, defense: 2, speed: 9 } }
];

const INITIAL_BOSS: Boss = {
    id: 'boss-1', name: 'Slime', emoji: '🦠', type: 'boss', level: 1, isDead: false,
    stats: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 12, magic: 0, defense: 2, speed: 8 }
};

const INITIAL_PET_DATA: Pet = {
    id: 'pet-dragon', name: 'Baby Dragon', type: 'pet', bonus: 'DPS', emoji: '🐉', isDead: false,
    stats: { attack: 5, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 }
};

const INITIAL_TALENTS: Talent[] = [
    { id: 't1', name: 'Sharpness', level: 0, maxLevel: 50, cost: 10, costScaling: 1.5, description: '+5% Damage', stat: 'attack', valuePerLevel: 0.05 },
    { id: 't2', name: 'Haste', level: 0, maxLevel: 20, cost: 50, costScaling: 2, description: '-2% Combat Delay', stat: 'speed', valuePerLevel: 0.02 },
    { id: 't3', name: 'Greed', level: 0, maxLevel: 10, cost: 100, costScaling: 3, description: '+10% Value', stat: 'gold', valuePerLevel: 0.1 },
    { id: 't4', name: 'Precision', level: 0, maxLevel: 25, cost: 25, costScaling: 1.8, description: '+1% Crit Chance', stat: 'crit', valuePerLevel: 0.01 }
];

const MONSTERS = [
    { name: 'Slime', emoji: '🦠' },
    { name: 'Rat', emoji: '🐀' },
    { name: 'Spider', emoji: '🕷️' },
    { name: 'Bat', emoji: '🦇' },
    { name: 'Wolf', emoji: '🐺' },
    { name: 'Goblin', emoji: '👺' },
    { name: 'Skeleton', emoji: '💀' },
    { name: 'Orc', emoji: '👹' },
    { name: 'Ghost', emoji: '👻' },
    { name: 'Zombie', emoji: '🧟' },
    { name: 'Troll', emoji: '🗿' },
    { name: 'Yeti', emoji: '🥶' },
    { name: 'Mummy', emoji: '🤕' },
    { name: 'Vampire', emoji: '🧛' },
    { name: 'Demon', emoji: '👿' },
    { name: 'Dragon', emoji: '🐉' },
    { name: 'Hydra', emoji: '🐍' },
    { name: 'Kraken', emoji: '🐙' },
    { name: 'Titan', emoji: '👾' },
    { name: 'Evil Eye', emoji: '👁️' }
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

    const [pet, setPet] = useState<Pet | null>(null);
    const [offlineGains, setOfflineGains] = useState<string | null>(null);
    const [talents, setTalents] = useState<Talent[]>(INITIAL_TALENTS);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);

    // Phase 5 State
    const [cards, setCards] = useState<MonsterCard[]>([]);
    const [constellations, setConstellations] = useState<ConstellationNode[]>(INITIAL_CONSTELLATIONS);
    const [keys, setKeys] = useState<number>(0);
    const [dungeonActive, setDungeonActive] = useState<boolean>(false);
    const [dungeonTimer, setDungeonTimer] = useState<number>(0);

    const [ultimateCharge, setUltimateCharge] = useState<number>(0);
    const [raidActive, setRaidActive] = useState(false);
    const [raidTimer, setRaidTimer] = useState(0);

    // LOAD
    useEffect(() => {
        const saved = localStorage.getItem('rpg_eternal_save_v5');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                setHeroes(state.heroes || INITIAL_HEROES);
                setBoss(state.boss);
                setItems(state.items);
                setSouls(state.souls || 0);
                setGold(state.gold || 0);
                setDivinity(state.divinity || 0);
                if (state.pet) setPet(state.pet);
                if (state.talents) setTalents(state.talents);
                if (state.artifacts) setArtifacts(state.artifacts);
                if (state.cards) setCards(state.cards);
                if (state.constellations) setConstellations(state.constellations);
                if (state.keys) setKeys(state.keys);

                // Turn off ephemeral modes
                setRaidActive(false);
                setDungeonActive(false);

                // Offline Calc
                if (state.lastSaveTime) {
                    const now = Date.now();
                    const diff = now - state.lastSaveTime;
                    const secondsOffline = Math.floor(diff / 1000);
                    if (secondsOffline > 60) {
                        const kills = Math.floor(secondsOffline / 5);
                        const gainedSouls = Math.floor(kills * 0.2);
                        const gainedGold = kills * 10;
                        if (kills > 0) {
                            setOfflineGains(`Offline for ${Math.floor(secondsOffline / 60)}m.\nKilled ${kills} Monsters.\nGained ${gainedSouls} Souls & ${gainedGold} Gold.`);
                            setSouls(p => p + gainedSouls);
                            setGold(p => p + gainedGold);
                        }
                    }
                }
            } catch (e) { console.error("Save Load Error", e); }
        }
    }, []);

    // SAVE
    useEffect(() => {
        const state = { heroes, boss, items, souls, gold, divinity, pet, talents, artifacts, cards, constellations, keys, lastSaveTime: Date.now() };
        localStorage.setItem('rpg_eternal_save_v5', JSON.stringify(state));
    }, [heroes, boss, items, souls, gold, divinity, pet, talents, artifacts, cards, constellations, keys]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-14), { id: Math.random().toString(36), message, type }]);
    };
    const toggleSound = () => { setIsSoundOn(!isSoundOn); soundManager.toggle(!isSoundOn); };

    const buyTalent = (id: string) => {
        setTalents(prev => prev.map(t => {
            if (t.id === id && souls >= t.cost && t.level < t.maxLevel) {
                setSouls(s => s - t.cost);
                return { ...t, level: t.level + 1, cost: Math.floor(t.cost * t.costScaling) };
            }
            return t;
        }));
    };

    const buyConstellation = (id: string) => {
        setConstellations(prev => prev.map(c => {
            if (c.id === id && divinity >= c.cost && c.level < c.maxLevel) {
                setDivinity(d => d - c.cost);
                return { ...c, level: c.level + 1, cost: Math.floor(c.cost * c.costScaling) };
            }
            return c;
        }));
    };

    const summonTavern = () => {
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
    };

    const enterDungeon = () => {
        if (keys < 1) return;
        setKeys(k => k - 1);
        setDungeonActive(true);
        setDungeonTimer(60); // 60s
        setBoss({
            id: 'gold-guard', name: 'GOLDEN GOLEM', emoji: '💰', type: 'boss', level: boss.level, isDead: false,
            stats: { hp: boss.stats.maxHp * 2, maxHp: boss.stats.maxHp * 2, attack: boss.stats.attack, defense: boss.stats.defense, magic: 0, speed: 10, mp: 0, maxMp: 0 }
        });
        addLog("ENTERED GOLD VAULT! 60s!", 'death');
    };

    const toggleRaid = () => {
        if (raidActive) { setRaidActive(false); setBoss(INITIAL_BOSS); } else {
            setRaidActive(true); setRaidTimer(300);
            setBoss({
                id: 'raid-boss', name: 'WORLD EATER', emoji: '🪐', type: 'boss', level: 999, isDead: false,
                stats: { hp: 50000 * (divinity + 1), maxHp: 50000 * (divinity + 1), attack: 500, defense: 50, magic: 50, speed: 10, mp: 0, maxMp: 0 }
            });
            addLog("WARNING: WORLD EATER APPROACHES!", 'death');
        }
    };

    const triggerRebirth = () => {
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
    };

    const triggerAscension = () => {
        if (souls < 1000) return;
        setDivinity(p => p + Math.floor(souls / 1000));
        setSouls(0);
        setHeroes(INITIAL_HEROES.map(h => ({ ...h, unlocked: heroes.find(curr => curr.id === h.id)?.unlocked || false })));
        setBoss(INITIAL_BOSS);
        setItems([]);
        setTalents(INITIAL_TALENTS);
        setArtifacts([]);
        setCards([]); // Collectible reset? Or keep? Let's reset for tier 2
        setDungeonActive(false);
        setRaidActive(false);
        addLog("ASCENDED! GAINED DIVINITY!", 'death');
    };

    // CORE LOOP
    useEffect(() => {
        if (heroes.every(h => h.unlocked && h.isDead)) return;

        // Timers
        if (raidActive) {
            if (raidTimer <= 0) { setRaidActive(false); setBoss(INITIAL_BOSS); addLog("Raid Failed!", 'damage'); }
            else { setRaidTimer(t => t - (1 * gameSpeed / 10)); }
        }
        if (dungeonActive) {
            if (dungeonTimer <= 0) { setDungeonActive(false); setBoss(INITIAL_BOSS); addLog("Dungeon Closed.", 'info'); }
            else { setDungeonTimer(t => t - (1 * gameSpeed / 10)); }
        }

        const hasteTalent = talents.find(t => t.stat === 'speed');
        const speedBonus = hasteTalent ? (1 - (hasteTalent.level * hasteTalent.valuePerLevel)) : 1;
        const baseTick = 1000 / gameSpeed;
        const effectiveTick = Math.max(100, baseTick * speedBonus);

        const timer = setTimeout(() => {
            const dmgTalent = talents.find(t => t.stat === 'attack');
            const critTalent = talents.find(t => t.stat === 'crit');
            // Constellation Bonuses
            const cScale = constellations.find(c => c.bonusType === 'bossDamage');
            const starMult = cScale ? (1 + cScale.level * cScale.valuePerLevel) : 1;

            const damageMult = (1 + (souls * 0.05) + (divinity * 1.0) + (dmgTalent ? (dmgTalent.level * dmgTalent.valuePerLevel) : 0)) * starMult;
            const critChance = critTalent ? (critTalent.level * critTalent.valuePerLevel) : 0;

            const hasVoidStone = artifacts.some(a => a.id === 'a2');
            const artifactMult = hasVoidStone ? 1.5 : 1;

            // Card Collection Bonus (5% Damage for cards matching boss emoji)
            const relevantCard = cards.find(c => c.id === boss.emoji);
            const cardMult = relevantCard ? (1 + (relevantCard.bonus * relevantCard.count)) : 1;

            // Ultimate
            let isUltimate = false;
            if (ultimateCharge >= 100) {
                isUltimate = true;
                setUltimateCharge(0);
                addLog("ULTIMATE BLAST!", 'damage');
                soundManager.playLevelUp();
            } else { setUltimateCharge(p => Math.min(100, p + 5 * gameSpeed)); }

            let totalDmg = 0;
            const newHeroes = heroes.map(h => {
                if (h.isDead || !h.unlocked) return h;
                let hp = h.stats.hp;
                let baseDmg = h.stats.attack * damageMult * artifactMult * cardMult;
                if (Math.random() < critChance + (h.class === 'Rogue' ? 0.3 : 0)) baseDmg *= 2;
                if (isUltimate) baseDmg *= 5;
                totalDmg += Math.floor(baseDmg);
                return { ...h, stats: { ...h.stats, hp } };
            });

            if (pet) totalDmg += Math.floor(pet.stats.attack * (boss.level * 0.5));
            setHeroes(newHeroes);

            let newBossHp = Math.max(0, boss.stats.hp - totalDmg);
            if (totalDmg > 0 && Math.random() > 0.8) soundManager.playHit();

            if (newBossHp === 0) {
                // Drops
                const loot: Item = { id: Math.random().toString(), name: 'Item', type: 'weapon', stat: 'attack', value: boss.level, rarity: 'common' };
                setItems(p => [...p, loot]);

                // Gold
                const cGold = constellations.find(c => c.bonusType === 'goldDrop');
                const starGold = cGold ? (1 + cGold.level * cGold.valuePerLevel) : 1;

                let goldDrop = Math.floor(boss.level * (Math.random() * 5 + 1) * starGold);
                if (dungeonActive) goldDrop *= 10;
                setGold(g => g + goldDrop);

                // Key Drop (Rare)
                if (Math.random() < 0.02) { // 2%
                    setKeys(k => k + 1);
                    addLog("FOUND GOLD KEY!", 'death');
                }

                // Card Drop (1%)
                if (Math.random() < 0.05) { // 5% for testing (usually 1%)
                    setCards(prev => {
                        const existing = prev.find(c => c.id === boss.emoji);
                        if (existing) {
                            return prev.map(c => c.id === boss.emoji ? { ...c, count: c.count + 1 } : c);
                        } else {
                            addLog(`New Card: ${boss.emoji}`, 'death');
                            return [...prev, { id: boss.emoji, monsterName: boss.name, count: 1, bonus: 0.1 }]; // 10% bonus
                        }
                    });
                }

                if (raidActive) {
                    addLog("WORLD EATER DEFEATED!", 'death');
                    setGold(g => g + 50000);
                    setDivinity(d => d + 1);
                    setRaidActive(false);
                    setBoss(INITIAL_BOSS);
                } else if (dungeonActive) {
                    // Keep spawning Golden Golems until timer runs out
                    setBoss({ ...boss, stats: { ...boss.stats, hp: boss.stats.maxHp, maxHp: boss.stats.maxHp + 50 } });
                } else {
                    const monster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
                    setBoss(prev => ({
                        ...prev, level: prev.level + 1, name: monster.name, emoji: monster.emoji,
                        stats: { ...prev.stats, maxHp: Math.floor(prev.stats.maxHp * 1.2), hp: Math.floor(prev.stats.maxHp * 1.2) }
                    }));
                }

                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
                soundManager.playLevelUp();

            } else {
                setBoss(p => ({ ...p, stats: { ...p.stats, hp: newBossHp } }));
            }

        }, effectiveTick);

        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, gold, divinity, pet, talents, artifacts, cards, constellations, keys, dungeonActive, raidActive]);

    useEffect(() => {
        if (boss.level >= 10 && !pet) setPet(INITIAL_PET_DATA);
    }, [boss.level, pet]);

    useEffect(() => {
        if (heroes.filter(h => h.unlocked).every(h => h.isDead)) {
            setTimeout(() => {
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
            }, 3000);
        }
    }, [heroes]);

    const resetSave = () => { localStorage.clear(); window.location.reload(); };
    const exportSave = () => btoa(localStorage.getItem('rpg_eternal_save_v5') || '');
    const importSave = (str: string) => {
        try {
            // Verify JSON
            JSON.parse(atob(str));
            localStorage.setItem('rpg_eternal_save_v5', atob(str));
            window.location.reload();
        } catch { alert("Invalid Save String"); }
    };

    return {
        heroes, boss, logs, items, gameSpeed, isSoundOn, souls, gold, divinity, pet, offlineGains,
        talents, artifacts, cards, constellations, keys, dungeonActive, dungeonTimer,
        ultimateCharge, raidActive, raidTimer,
        actions: { setGameSpeed, toggleSound, resetSave, triggerRebirth, triggerAscension, buyTalent, buyConstellation, summonTavern, toggleRaid, enterDungeon, exportSave, importSave, closeOfflineModal: () => setOfflineGains(null) }
    };
};
