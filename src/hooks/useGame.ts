import { useState, useEffect } from 'react';
import type { Hero, Boss, LogEntry, Item } from '../engine/types';
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

export const useGame = () => {
    // Persistence Loading
    const loadState = () => {
        const saved = localStorage.getItem('rpg_eternal_save');
        if (saved) return JSON.parse(saved);
        return null;
    };
    const savedState = loadState();

    const [heroes, setHeroes] = useState<Hero[]>(savedState?.heroes || INITIAL_HEROES);
    const [boss, setBoss] = useState<Boss>(savedState?.boss || INITIAL_BOSS);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [gameSpeed, setGameSpeed] = useState<number>(1);
    const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
    const [items, setItems] = useState<Item[]>(savedState?.items || []);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-14), { id: Math.random().toString(36), message, type }]); // Keep fewer logs for perf
    };

    // Save Effect
    useEffect(() => {
        const state = { heroes, boss, items };
        localStorage.setItem('rpg_eternal_save', JSON.stringify(state));
    }, [heroes, boss, items]);

    // Sound Toggle
    const toggleSound = () => {
        const newState = !isSoundOn;
        setIsSoundOn(newState);
        soundManager.toggle(newState);
    };

    // LOOT SYSTEM
    const generateLoot = (level: number): Item => {
        const rarity = Math.random() > 0.9 ? 'legendary' : Math.random() > 0.7 ? 'epic' : 'common';
        const type = Math.random() > 0.5 ? 'weapon' : 'armor';
        const statVal = Math.floor(level * (rarity === 'legendary' ? 2 : 1.2));

        return {
            id: Math.random().toString(36),
            name: `${rarity} ${type} +${statVal}`,
            type: type as any,
            stat: 'attack',
            value: statVal,
            rarity: rarity as any
        };
    };

    // CORE GAME LOOP (AFK)
    useEffect(() => {
        // Only run if everyone is alive (or boss dead handles respawn)
        if (heroes.every(h => h.isDead)) return;

        const tickRate = 1000 / gameSpeed;

        const timer = setTimeout(() => {
            // 1. Identify Actor (Rotational or Speed based - keeping rotational for simplicity)
            const livingHeroes = heroes.filter(h => !h.isDead);

            // Player Turn: All heroes act simultaneously for "Fast AFK" feel? 
            // Or sequential. Let's do: One Hero Act -> Boss Act -> Repeat

            if (livingHeroes.length === 0) return; // Wiped

            // HEROES ACTIONS
            let totalDmg = 0;
            const newHeroes = heroes.map(h => {
                if (h.isDead) return h;

                // Mana Regen
                let mp = Math.min(h.stats.maxMp, h.stats.mp + 2);
                let hp = h.stats.hp;
                let actionLog = '';

                // AI Logic
                if (h.class === 'Healer' && livingHeroes.some(lh => lh.stats.hp < lh.stats.maxHp * 0.6) && mp >= 20) {
                    // Heal Team
                    mp -= 20;
                    // Healing applied later to state, tricky in map. 
                    // Simplified: Healer heals self and gives "aura" to others? 
                    // Let's make Healer attack AND heal.
                    const healAmt = Math.floor(h.stats.magic * 1.5);
                    soundManager.playHeal();
                    hp = Math.min(h.stats.maxHp, h.stats.hp + healAmt); // Self heal for now simplicity
                    actionLog = `${h.name} heals for ${healAmt}`;

                } else if (mp >= 15 && boss.stats.hp > 50) {
                    // Magic Attack
                    mp -= 15;
                    const dmg = Math.floor(h.stats.magic * 1.5);
                    totalDmg += dmg;
                    actionLog = `${h.name} text_fire blasts for ${dmg}!`;
                    soundManager.playMagic();
                } else {
                    // Attack
                    const dmg = Math.floor(h.stats.attack * (1 + Math.random()));
                    totalDmg += dmg;
                    actionLog = `${h.name} hits for ${dmg}`;
                    if (Math.random() > 0.8) soundManager.playAttack();
                }

                if (Math.random() > 0.9 && actionLog) addLog(actionLog, 'info'); // Reduce log spam
                return { ...h, stats: { ...h.stats, hp, mp } };
            });

            // Apply Global Healer effect if Healer acted? (Skipped for stability complexity)
            setHeroes(newHeroes);

            // Apply Damage to Boss
            let newBossHp = Math.max(0, boss.stats.hp - totalDmg);

            if (totalDmg > 0) {
                soundManager.playHit();
                // addLog(`Party deals ${totalDmg} total damage!`, 'damage');
            }

            if (newBossHp === 0) {
                // Boss Dead Logic
                soundManager.playLevelUp();
                const loot = generateLoot(boss.level);
                setItems(prev => [...prev, loot]);
                addLog(`${boss.name} Defeated! Dropped ${loot.name}`, 'death');

                // Auto Equip / Consume Loot (Simplified: Boost Stats permanently)
                setHeroes(prev => prev.map(h => ({
                    ...h,
                    stats: {
                        ...h.stats,
                        attack: h.stats.attack + (loot.stat === 'attack' ? loot.value : 0),
                        maxHp: h.stats.maxHp + (loot.stat === 'hp' ? loot.value : 10)
                    }
                })));

                // Respawn Boss
                setBoss(prev => ({
                    ...prev,
                    level: prev.level + 1,
                    name: `Monster Lvl ${prev.level + 1}`,
                    stats: {
                        maxHp: Math.floor(prev.stats.maxHp * 1.2),
                        hp: Math.floor(prev.stats.maxHp * 1.2),
                        mp: 0, maxMp: 0,
                        attack: Math.floor(prev.stats.attack * 1.1),
                        magic: 0, defense: prev.stats.defense + 1, speed: 10
                    },
                    isDead: false
                    // Emoji randomization could be added here
                }));

                // Full Heal Party
                setHeroes(prev => prev.map(h => ({ ...h, stats: { ...h.stats, hp: h.stats.maxHp, mp: h.stats.maxMp } })));

            } else {
                // Boss Attacks Back
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
    }, [heroes, boss, gameSpeed]);

    // Wipe Check
    useEffect(() => {
        if (heroes.every(h => h.isDead)) {
            addLog("Party Wiped! Reviving in 3s...", "death");
            setTimeout(() => {
                setHeroes(prev => prev.map(h => ({ ...h, isDead: false, stats: { ...h.stats, hp: h.stats.maxHp } })));
            }, 3000);
        }
    }, [heroes]);

    const resetSave = () => {
        localStorage.removeItem('rpg_eternal_save');
        setHeroes(INITIAL_HEROES);
        setBoss(INITIAL_BOSS);
        setItems([]);
        addLog("Save Reset!");
    };

    return {
        heroes,
        boss,
        logs,
        items,
        gameSpeed,
        isSoundOn,
        actions: {
            setGameSpeed,
            toggleSound,
            resetSave
        }
    };
};
