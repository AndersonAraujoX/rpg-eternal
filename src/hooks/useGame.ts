import { useState, useEffect } from 'react';
import type { Hero, Boss, LogEntry, Item, Pet } from '../engine/types';
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

const INITIAL_PET: Pet = {
    id: 'pet-dragon', name: 'Baby Dragon', type: 'pet', bonus: 'DPS', emoji: '🐉', isDead: false,
    stats: { attack: 5, hp: 1, maxHp: 1, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 10 }
};

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

    // LOAD / OFFLINE CALC
    useEffect(() => {
        const saved = localStorage.getItem('rpg_eternal_save_v2');
        if (saved) {
            const state = JSON.parse(saved);
            setHeroes(state.heroes);
            setBoss(state.boss);
            setItems(state.items);
            setSouls(state.souls || 0);
            if (state.pet) setPet(state.pet);

            // Offline Calc
            if (state.lastSaveTime) {
                const now = Date.now();
                const diff = now - state.lastSaveTime;
                const secondsOffline = Math.floor(diff / 1000);

                if (secondsOffline > 60) {
                    // Simulate: 1 Boss Kill per 10 seconds (conservative estimate)
                    const estimatedKills = Math.floor(secondsOffline / 10);
                    const estimatedLevels = Math.floor(estimatedKills / 5); // 1 lvl per 5 kills
                    const estimatedSouls = Math.floor(estimatedKills * 0.5);

                    if (estimatedKills > 0) {
                        setOfflineGains(`While you were gone (${Math.floor(secondsOffline / 60)}m):\nDefeated ${estimatedKills} Bosses\nGained ${estimatedSouls} Souls!`);
                        setSouls(prev => prev + estimatedSouls);
                        // Boost Boss Level
                        setBoss(p => ({ ...p, level: p.level + estimatedLevels, stats: { ...p.stats, maxHp: p.stats.maxHp + (estimatedLevels * 50) } }));
                    }
                }
            }
        }
    }, []);

    // SAVE EFFECT
    useEffect(() => {
        const state = { heroes, boss, items, souls, pet, lastSaveTime: Date.now() };
        localStorage.setItem('rpg_eternal_save_v2', JSON.stringify(state));
    }, [heroes, boss, items, souls, pet]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-14), { id: Math.random().toString(36), message, type }]);
    };

    // SOUND TOGGLE
    const toggleSound = () => {
        const newState = !isSoundOn;
        setIsSoundOn(newState);
        soundManager.toggle(newState);
    };

    // REBIRTH SYSTEM
    const triggerRebirth = () => {
        const soulsGain = Math.floor(boss.level / 5);
        if (soulsGain <= 0) return;

        const multiplier = 1 + ((souls + soulsGain) * 0.1); // 10% per soul

        setSouls(p => p + soulsGain);
        setHeroes(INITIAL_HEROES.map(h => ({
            ...h,
            stats: {
                ...h.stats,
                attack: Math.floor(h.stats.attack * multiplier),
                maxHp: Math.floor(h.stats.maxHp * multiplier)
            }
        })));
        setBoss(INITIAL_BOSS);
        setItems([]); // Clear items or keep? Usually clear inventory on prestige.
        setGameSpeed(1);
        addLog(`REBIRTH! Gained ${soulsGain} Souls! Stats x${multiplier.toFixed(1)}`, 'death');
        soundManager.playLevelUp();
    };

    // ITEM MERGE (Auto)
    useEffect(() => {
        if (items.length > 20) {
            // Simple cleanup: Keep best 20 based on Value
            const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, 20);
            if (sorted.length !== items.length) {
                setItems(sorted);
                addLog("Inventory full! Auto-scrapped weak items.", 'info');
            }
        }
    }, [items]);

    // UNLOCK PET
    useEffect(() => {
        if (boss.level >= 10 && !pet) {
            setPet(INITIAL_PET);
            addLog("You found a Baby Dragon Egg!", 'info');
        }
    }, [boss.level, pet]);

    // CORE LOOP
    useEffect(() => {
        if (heroes.every(h => h.isDead)) return;

        const tickRate = 1000 / gameSpeed;
        const timer = setTimeout(() => {
            const livingHeroes = heroes.filter(h => !h.isDead);
            if (livingHeroes.length === 0) return;

            // HERO Action
            let totalDmg = 0;

            // Soul Multiplier calculated continuously or persisted? 
            // Persisted in base stats on Rebirth. 
            // Dynamic multiplier for Pet?
            const damageMult = 1 + (souls * 0.05); // 5% dynamic bonus too

            const newHeroes = heroes.map(h => {
                if (h.isDead) return h;
                // Heal / Attack logic same as before...
                let hp = h.stats.hp;
                let mp = Math.min(h.stats.maxMp, h.stats.mp + 2);

                // Attack
                const dmg = Math.floor(h.stats.attack * damageMult);
                totalDmg += dmg;

                // Simple loop logic (can expand)
                if (Math.random() > 0.9) addLog(`${h.name} attacks for ${dmg}`, 'info');
                return { ...h, stats: { ...h.stats, hp, mp } };
            });

            // PET Action
            if (pet) {
                const petDmg = Math.floor(pet.stats.attack * (boss.level * 0.5));
                totalDmg += petDmg;
                if (Math.random() > 0.95) addLog(`${pet.name} breathes fire: ${petDmg}`, 'damage');
            }

            setHeroes(newHeroes);

            // Apply Damage
            let newBossHp = Math.max(0, boss.stats.hp - totalDmg);
            if (totalDmg > 0) soundManager.playHit();

            if (newBossHp === 0) {
                // Boss Death
                soundManager.playLevelUp();
                const loot: Item = { id: Math.random().toString(), name: 'Epic Loot', type: 'weapon', stat: 'attack', value: boss.level * 2, rarity: 'epic' };
                setItems(p => [...p, loot]);
                addLog(`${boss.name} Defeated!`, 'death');

                // Auto Equip logic...
                setHeroes(prev => prev.map(h => ({
                    ...h,
                    stats: { ...h.stats, attack: h.stats.attack + loot.value, maxHp: h.stats.maxHp + 10 }
                })));

                // Respawn
                setBoss(prev => ({
                    ...prev, level: prev.level + 1, name: `Monster Lvl ${prev.level + 1}`,
                    stats: { ...prev.stats, hp: Math.floor(prev.stats.maxHp * 1.2), maxHp: Math.floor(prev.stats.maxHp * 1.2) },
                    isDead: false
                }));
                // Full Heal
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));

            } else {
                // Boss Attack
                const dmg = Math.max(0, boss.stats.attack - 5);
                setHeroes(prev => prev.map(h => {
                    if (h.isDead) return h;
                    const newHp = Math.max(0, h.stats.hp - dmg);
                    return { ...h, isDead: newHp === 0, stats: { ...h.stats, hp: newHp } };
                }));
                setBoss(p => ({ ...p, stats: { ...p.stats, hp: newBossHp } }));
            }

        }, tickRate);
        return () => clearTimeout(timer);
    }, [heroes, boss, gameSpeed, souls, pet]);

    // Wipe Check
    useEffect(() => {
        if (heroes.every(h => h.isDead)) {
            setTimeout(() => {
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
                addLog("Party Revived!", "heal");
            }, 3000);
        }
    }, [heroes]);

    const resetSave = () => { localStorage.removeItem('rpg_eternal_save_v2'); window.location.reload(); };

    return {
        heroes, boss, logs, items, gameSpeed, isSoundOn, souls, pet, offlineGains,
        actions: { setGameSpeed, toggleSound, resetSave, triggerRebirth, closeOfflineModal: () => setOfflineGains(null) }
    };
};
