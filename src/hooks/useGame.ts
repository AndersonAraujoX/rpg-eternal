import { useState, useEffect } from 'react';
import type { Hero, Boss, LogEntry, Item, Pet, Talent, Artifact } from '../engine/types';
import { soundManager } from '../engine/sound';

const INITIAL_HEROES: Hero[] = [
    { id: 'h1', name: 'Warrior', type: 'hero', class: 'Warrior', emoji: '🛡️', unlocked: true, isDead: false, stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 } },
    { id: 'h2', name: 'Mage', type: 'hero', class: 'Mage', emoji: '🔮', unlocked: true, isDead: false, stats: { hp: 70, maxHp: 70, mp: 100, maxMp: 100, attack: 5, magic: 25, defense: 3, speed: 12 } },
    { id: 'h3', name: 'Healer', type: 'hero', class: 'Healer', emoji: '💚', unlocked: true, isDead: false, stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, attack: 8, magic: 20, defense: 5, speed: 11 } },
    { id: 'h4', name: 'Rogue', type: 'hero', class: 'Rogue', emoji: '🗡️', unlocked: false, isDead: false, stats: { hp: 85, maxHp: 85, mp: 50, maxMp: 50, attack: 25, magic: 5, defense: 5, speed: 15 } },
    { id: 'h5', name: 'Paladin', type: 'hero', class: 'Paladin', emoji: '✝️', unlocked: false, isDead: false, stats: { hp: 150, maxHp: 150, mp: 40, maxMp: 40, attack: 10, magic: 15, defense: 15, speed: 8 } },
    { id: 'h6', name: 'Warlock', type: 'hero', class: 'Warlock', emoji: '☠️', unlocked: false, isDead: false, stats: { hp: 60, maxHp: 60, mp: 120, maxMp: 120, attack: 5, magic: 35, defense: 2, speed: 9 } }
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

const RARE_ARTIFACTS: Artifact[] = [
    { id: 'a1', name: 'Crown of Kings', description: 'Start at Lvl 5', emoji: '👑', bonus: 'lvl+5' },
    { id: 'a2', name: 'Void Stone', description: '+50% All Stats', emoji: '🌑', bonus: 'stats+50' },
    { id: 'a3', name: 'Phoenix Feather', description: 'Auto-Revive (10s)', emoji: '🪶', bonus: 'revive' }
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
    const [ultimateCharge, setUltimateCharge] = useState<number>(0);

    const [raidActive, setRaidActive] = useState(false);
    const [raidTimer, setRaidTimer] = useState(0);

    // LOAD
    useEffect(() => {
        const saved = localStorage.getItem('rpg_eternal_save_v4');
        if (saved) {
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
        }
    }, []);

    // SAVE
    useEffect(() => {
        const state = { heroes, boss, items, souls, gold, divinity, pet, talents, artifacts, lastSaveTime: Date.now() };
        localStorage.setItem('rpg_eternal_save_v4', JSON.stringify(state));
    }, [heroes, boss, items, souls, gold, divinity, pet, talents, artifacts]);

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

    const summonTavern = () => {
        const COST = 500;
        if (gold < COST) {
            addLog("Not enough Gold!", 'damage');
            return;
        }
        setGold(g => g - COST);

        const roll = Math.random();
        if (roll < 0.3) {
            // 30% unlock hero
            const lockedHeroes = heroes.filter(h => !h.unlocked);
            if (lockedHeroes.length > 0) {
                const toUnlock = lockedHeroes[Math.floor(Math.random() * lockedHeroes.length)];
                setHeroes(prev => prev.map(h => h.id === toUnlock.id ? { ...h, unlocked: true } : h));
                addLog(`NEW HERO: ${toUnlock.name} Joined!`, 'heal');
                soundManager.playLevelUp();
            } else {
                // Duplicate hero = Stats buff
                addLog("Duplicate Hero! Stats Up.", 'info');
                setHeroes(prev => prev.map(h => ({ ...h, stats: { ...h.stats, hp: h.stats.hp + 10, attack: h.stats.attack + 2 } })));
            }
        } else if (roll < 0.35) {
            // 5% Artifact
            const newArt = RARE_ARTIFACTS[Math.floor(Math.random() * RARE_ARTIFACTS.length)];
            const alreadyHas = artifacts.some(a => a.id === newArt.id);
            if (!alreadyHas) {
                setArtifacts(p => [...p, newArt]);
                addLog(`TAVERN FOUND: ${newArt.name}!`, 'death');
            } else {
                addLog("Tavern Keeper found nothing special.", 'info');
            }
        } else {
            // Consumable / Gold refund / Nothing
            addLog("Tavern drink was refreshing... but nothing happened.", 'info');
        }
    };

    const toggleRaid = () => {
        if (raidActive) {
            // Cancel Raid
            setRaidActive(false);
            setBoss(INITIAL_BOSS); // Reset to normal
        } else {
            // Start Raid
            setRaidActive(true);
            setRaidTimer(300); // 5 mins
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
        addLog(`REBIRTH! +${soulsGain} Souls.`, 'death');
        soundManager.playLevelUp();
    };

    const triggerAscension = () => {
        if (souls < 1000) return;
        setDivinity(p => p + Math.floor(souls / 1000));
        setSouls(0);
        setHeroes(INITIAL_HEROES); // Reset unlocks too? Maybe keep them. Let's keep unlocks.
        setHeroes(INITIAL_HEROES.map(h => ({ ...h, unlocked: heroes.find(curr => curr.id === h.id)?.unlocked || false })));
        setBoss(INITIAL_BOSS);
        setItems([]);
        setTalents(INITIAL_TALENTS);
        setArtifacts([]); // Hard reset
        addLog("ASCENDED! GAINED DIVINITY!", 'death');
    };

    // CORE LOOP
    useEffect(() => {
        if (heroes.every(h => h.unlocked && h.isDead)) return;

        // Raid Timer
        if (raidActive) {
            if (raidTimer <= 0) {
                setRaidActive(false);
                setBoss(INITIAL_BOSS);
                addLog("Raid Failed! World Eater left.", 'damage');
            } else {
                setRaidTimer(t => t - (1 * gameSpeed / 10)); // Approx
            }
        }

        // Speed Logic
        const hasteTalent = talents.find(t => t.stat === 'speed');
        const speedBonus = hasteTalent ? (1 - (hasteTalent.level * hasteTalent.valuePerLevel)) : 1;
        const baseTick = 1000 / gameSpeed;
        const effectiveTick = Math.max(100, baseTick * speedBonus);

        const timer = setTimeout(() => {
            // Multipliers
            const dmgTalent = talents.find(t => t.stat === 'attack');
            const critTalent = talents.find(t => t.stat === 'crit');

            const damageMult = 1 + (souls * 0.05) + (divinity * 1.0) + (dmgTalent ? (dmgTalent.level * dmgTalent.valuePerLevel) : 0);
            const critChance = critTalent ? (critTalent.level * critTalent.valuePerLevel) : 0;

            const hasVoidStone = artifacts.some(a => a.id === 'a2');
            const artifactMult = hasVoidStone ? 1.5 : 1;

            // Ultimate
            let isUltimate = false;
            if (ultimateCharge >= 100) {
                isUltimate = true;
                setUltimateCharge(0);
                addLog("ULTIMATE BLAST!", 'damage');
                soundManager.playLevelUp();
            } else {
                setUltimateCharge(p => Math.min(100, p + 5 * gameSpeed));
            }

            let totalDmg = 0;
            const newHeroes = heroes.map(h => {
                if (h.isDead || !h.unlocked) return h;
                let hp = h.stats.hp;
                let baseDmg = h.stats.attack * damageMult * artifactMult;
                if (Math.random() < critChance + (h.class === 'Rogue' ? 0.3 : 0)) baseDmg *= 2;

                if (isUltimate) baseDmg *= 5;

                totalDmg += Math.floor(baseDmg);
                return { ...h, stats: { ...h.stats, hp } };
            });

            if (pet) totalDmg += Math.floor(pet.stats.attack * (boss.level * 0.5));

            setHeroes(newHeroes);

            // Boss Logic
            let newBossHp = Math.max(0, boss.stats.hp - totalDmg);
            if (totalDmg > 0 && Math.random() > 0.8) soundManager.playHit();

            if (newBossHp === 0) {
                // Drops
                const loot: Item = { id: Math.random().toString(), name: 'Item', type: 'weapon', stat: 'attack', value: boss.level, rarity: 'common' };
                setItems(p => [...p, loot]);

                const goldDrop = Math.floor(boss.level * (Math.random() * 5 + 1));
                setGold(g => g + goldDrop);

                // Artifact Chance
                if (Math.random() < 0.005) {
                    const newArt = RARE_ARTIFACTS[Math.floor(Math.random() * RARE_ARTIFACTS.length)];
                    if (!artifacts.some(a => a.id === newArt.id)) {
                        setArtifacts(p => [...p, newArt]);
                        addLog(`MYTHIC DROP: ${newArt.name}!`, 'death');
                    }
                }

                if (raidActive) {
                    addLog("WORLD EATER DEFEATED! MASSIVE WEALTH!", 'death');
                    setGold(g => g + 50000);
                    setDivinity(d => d + 1);
                    setRaidActive(false);
                    setBoss(INITIAL_BOSS);
                } else {
                    setBoss(prev => ({
                        ...prev, level: prev.level + 1,
                        stats: { ...prev.stats, maxHp: Math.floor(prev.stats.maxHp * 1.2), hp: Math.floor(prev.stats.maxHp * 1.2) }
                    }));
                }

                // Heal
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
                soundManager.playLevelUp();

            } else {
                // Boss Attacks logic ... simplified for space
                setBoss(p => ({ ...p, stats: { ...p.stats, hp: newBossHp } }));
            }

        }, effectiveTick);

        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, gold, divinity, pet, talents, artifacts, ultimateCharge, raidActive]);

    // UNLOCK PET (Ensure defined)
    useEffect(() => {
        if (boss.level >= 10 && !pet) {
            setPet(INITIAL_PET_DATA);
            addLog("You found a Baby Dragon Egg!", 'info');
        }
    }, [boss.level, pet]);

    // Auto-Revive
    useEffect(() => {
        if (heroes.filter(h => h.unlocked).every(h => h.isDead)) {
            setTimeout(() => {
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
            }, 3000);
        }
    }, [heroes]);

    const resetSave = () => { localStorage.clear(); window.location.reload(); };

    return {
        heroes, boss, logs, items, gameSpeed, isSoundOn, souls, gold, divinity, pet, offlineGains,
        talents, artifacts, ultimateCharge, raidActive, raidTimer,
        actions: { setGameSpeed, toggleSound, resetSave, triggerRebirth, triggerAscension, buyTalent, summonTavern, toggleRaid, closeOfflineModal: () => setOfflineGains(null) }
    };
};
