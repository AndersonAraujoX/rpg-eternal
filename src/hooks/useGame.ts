import { useState, useEffect } from 'react';
import type { Hero, Boss, LogEntry, Item, Pet, Talent, Artifact } from '../engine/types';
import { soundManager } from '../engine/sound';

const INITIAL_HEROES: Hero[] = [
    { id: 'hero-warrior', name: 'Warrior', type: 'hero', class: 'Warrior', emoji: '🛡️', isDead: false, stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 } },
    { id: 'hero-mage', name: 'Mage', type: 'hero', class: 'Mage', emoji: '🔮', isDead: false, stats: { hp: 70, maxHp: 70, mp: 100, maxMp: 100, attack: 5, magic: 25, defense: 3, speed: 12 } },
    { id: 'hero-healer', name: 'Healer', type: 'hero', class: 'Healer', emoji: '💚', isDead: false, stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, attack: 8, magic: 20, defense: 5, speed: 11 } }
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
    { id: 'a2', name: 'Void Stone', description: '+50% All Stats', emoji: '🌑', bonus: 'stats+50' }
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
    const [pet, setPet] = useState<Pet | null>(null);
    const [offlineGains, setOfflineGains] = useState<string | null>(null);
    const [talents, setTalents] = useState<Talent[]>(INITIAL_TALENTS);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [ultimateCharge, setUltimateCharge] = useState<number>(0); // 0-100

    // LOAD
    useEffect(() => {
        const saved = localStorage.getItem('rpg_eternal_save_v3');
        if (saved) {
            const state = JSON.parse(saved);
            setHeroes(state.heroes);
            setBoss(state.boss);
            setItems(state.items);
            setSouls(state.souls || 0);
            if (state.pet) setPet(state.pet);
            if (state.talents) setTalents(state.talents);
            if (state.artifacts) setArtifacts(state.artifacts);

            // Offline Calc logic (same as before)
            if (state.lastSaveTime) {
                const now = Date.now();
                const diff = now - state.lastSaveTime;
                const secondsOffline = Math.floor(diff / 1000);
                if (secondsOffline > 60) {
                    const kills = Math.floor(secondsOffline / 5); // Accelerated offline
                    const gainedSouls = Math.floor(kills * 0.2);
                    if (kills > 0) {
                        setOfflineGains(`Offline for ${Math.floor(secondsOffline / 60)}m.\nKilled ${kills} Monsters.\nGained ${gainedSouls} Souls.`);
                        setSouls(p => p + gainedSouls);
                    }
                }
            }
        }
    }, []);

    // SAVE
    useEffect(() => {
        const state = { heroes, boss, items, souls, pet, talents, artifacts, lastSaveTime: Date.now() };
        localStorage.setItem('rpg_eternal_save_v3', JSON.stringify(state));
    }, [heroes, boss, items, souls, pet, talents, artifacts]);

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

    const triggerRebirth = () => {
        const soulsGain = Math.floor(boss.level / 5);
        if (soulsGain <= 0) return;

        // Keep Talents and Artifacts!
        setSouls(p => p + soulsGain);
        setHeroes(INITIAL_HEROES);
        setBoss(INITIAL_BOSS);
        setItems([]);
        setGameSpeed(1);
        // Logic inside Core Loop handles stat application from talents
        addLog(`REBIRTH! +${soulsGain} Souls.`, 'death');
    };

    // CORE LOOP
    useEffect(() => {
        if (heroes.every(h => h.isDead)) return;

        // Calculate Speed Modifier from Haste Talent
        const hasteTalent = talents.find(t => t.stat === 'speed');
        const speedBonus = hasteTalent ? (1 - (hasteTalent.level * hasteTalent.valuePerLevel)) : 1;
        const baseTick = 1000 / gameSpeed;
        const effectiveTick = Math.max(100, baseTick * speedBonus); // Cap at 100ms

        const timer = setTimeout(() => {
            // Stats Calc
            const dmgTalent = talents.find(t => t.stat === 'attack');
            const critTalent = talents.find(t => t.stat === 'crit');

            const damageMult = 1 + (souls * 0.05) + (dmgTalent ? (dmgTalent.level * dmgTalent.valuePerLevel) : 0);
            const critChance = critTalent ? (critTalent.level * critTalent.valuePerLevel) : 0;

            // Artifact Bonuses
            const hasVoidStone = artifacts.some(a => a.id === 'a2');
            const artifactMult = hasVoidStone ? 1.5 : 1;

            // Ultimate Check
            let isUltimate = false;
            if (ultimateCharge >= 100) {
                isUltimate = true;
                setUltimateCharge(0);
                addLog("HEROES UNLEASH ULTIMATE!", 'damage');
                soundManager.playLevelUp(); // Boom sound
            } else {
                setUltimateCharge(p => Math.min(100, p + 5 * gameSpeed));
            }

            let totalDmg = 0;
            const newHeroes = heroes.map(h => {
                if (h.isDead) return h;
                let hp = h.stats.hp; // Regen logic skip for brevity
                let baseDmg = h.stats.attack * damageMult * artifactMult;

                // Crit Logic
                if (Math.random() < critChance) baseDmg *= 2;

                // Ultimate Logic
                if (isUltimate) baseDmg *= 5;

                totalDmg += Math.floor(baseDmg);
                return { ...h, stats: { ...h.stats, hp } };
            });

            // Pet Dps
            if (pet) totalDmg += Math.floor(pet.stats.attack * (boss.level * 0.5));

            setHeroes(newHeroes);

            // Boss Logic
            let newBossHp = Math.max(0, boss.stats.hp - totalDmg);
            if (totalDmg > 0 && Math.random() > 0.8) soundManager.playHit();

            if (newBossHp === 0) {
                // Drop Logic
                const loot: Item = { id: Math.random().toString(), name: 'Item', type: 'weapon', stat: 'attack', value: boss.level, rarity: 'common' };
                setItems(p => [...p, loot]);

                // Artifact Chance (1/500)
                if (Math.random() < 0.005) {
                    const newArt = RARE_ARTIFACTS[Math.floor(Math.random() * RARE_ARTIFACTS.length)];
                    const alreadyHas = artifacts.some(a => a.id === newArt.id);
                    if (!alreadyHas) {
                        setArtifacts(p => [...p, newArt]);
                        addLog(`MYTHICAL DROP: ${newArt.name}!`, 'death');
                    }
                }

                // Auto Equip logic simplified...
                setHeroes(prev => prev.map(h => ({ ...h, stats: { ...h.stats, maxHp: h.stats.maxHp + 5, attack: h.stats.attack + loot.value } })));

                soundManager.playLevelUp();
                setBoss(prev => ({
                    ...prev, level: prev.level + 1,
                    stats: { ...prev.stats, maxHp: Math.floor(prev.stats.maxHp * 1.2), hp: Math.floor(prev.stats.maxHp * 1.2) }
                }));
                // Heal Party
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));

            } else {
                setBoss(p => ({ ...p, stats: { ...p.stats, hp: newBossHp } }));
            }

        }, effectiveTick);

        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, pet, talents, artifacts, ultimateCharge]); // Dependencies updated

    // UNLOCK PET
    useEffect(() => {
        if (boss.level >= 10 && !pet) {
            setPet(INITIAL_PET_DATA);
            addLog("You found a Baby Dragon Egg!", 'info');
        }
    }, [boss.level, pet]);

    // Auto-Revive loop
    useEffect(() => {
        if (heroes.every(h => h.isDead)) {
            setTimeout(() => {
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
            }, 3000);
        }
    }, [heroes]);

    const resetSave = () => { localStorage.clear(); window.location.reload(); };

    return {
        heroes, boss, logs, items, gameSpeed, isSoundOn, souls, pet, offlineGains,
        talents, artifacts, ultimateCharge,
        actions: { setGameSpeed, toggleSound, resetSave, triggerRebirth, buyTalent, closeOfflineModal: () => setOfflineGains(null) }
    };
};
