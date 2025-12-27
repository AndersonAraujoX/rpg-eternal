import { useState, useEffect, useCallback } from 'react';
import type { Hero, Boss, LogEntry } from '../engine/types';

const INITIAL_HEROES: Hero[] = [
    {
        id: 'hero-warrior',
        name: 'Warrior',
        type: 'hero',
        class: 'Warrior',
        emoji: '🛡️',
        isDead: false,
        stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 15, magic: 5, defense: 10, speed: 10 }
    },
    {
        id: 'hero-mage',
        name: 'Mage',
        type: 'hero',
        class: 'Mage',
        emoji: '🔮',
        isDead: false,
        stats: { hp: 70, maxHp: 70, mp: 100, maxMp: 100, attack: 5, magic: 25, defense: 3, speed: 12 }
    },
    {
        id: 'hero-healer',
        name: 'Healer',
        type: 'hero',
        class: 'Healer',
        emoji: '💚',
        isDead: false,
        stats: { hp: 80, maxHp: 80, mp: 80, maxMp: 80, attack: 8, magic: 20, defense: 5, speed: 11 }
    }
];

const INITIAL_BOSS: Boss = {
    id: 'boss-1',
    name: 'Slime',
    emoji: '🦠',
    type: 'boss',
    level: 1,
    isDead: false,
    stats: { hp: 200, maxHp: 200, mp: 0, maxMp: 0, attack: 12, magic: 0, defense: 2, speed: 8 }
};



export const useGame = () => {
    const [heroes, setHeroes] = useState<Hero[]>(INITIAL_HEROES);
    const [boss, setBoss] = useState<Boss>(INITIAL_BOSS);
    const [turn, setTurn] = useState<number>(1);
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
    const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0); // Which hero is acting?

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-19), { id: Math.random().toString(36), message, type }]);
    };

    // Helper to get next living hero
    const getNextLivingHeroIndex = (startIndex: number): number | -1 => {
        let nextIndex = startIndex;
        for (let i = 0; i < heroes.length; i++) {
            if (!heroes[nextIndex].isDead) return nextIndex;
            nextIndex = (nextIndex + 1) % heroes.length;
        }
        return -1; // All dead
    };

    const heroAction = useCallback((actionType: 'attack' | 'magic' | 'heal') => {
        if (!isPlayerTurn || gameOver) return;

        const currentHeroIndex = getNextLivingHeroIndex(activeHeroIndex);
        if (currentHeroIndex === -1) return; // Should be game over

        const hero = heroes[currentHeroIndex];
        let damage = 0;
        let heal = 0;

        // Action Logic
        if (actionType === 'attack') {
            damage = Math.floor(hero.stats.attack * (0.9 + Math.random() * 0.2));
            const isCrit = Math.random() > 0.8;
            if (isCrit) damage = Math.floor(damage * 1.5);

            setBoss(prev => {
                const newHp = Math.max(0, prev.stats.hp - damage);
                return { ...prev, stats: { ...prev.stats, hp: newHp }, isDead: newHp === 0 };
            });
            addLog(`${hero.name} attacks for ${damage}!${isCrit ? ' (CRIT!)' : ''}`, 'damage');

        } else if (actionType === 'magic') {
            if (hero.stats.mp < 15) {
                addLog(`${hero.name} has no Mana!`, 'info');
                if (isAutoPlay) heroAction('attack'); // Fallback
                return;
            }
            // Deduct MP
            setHeroes(prev => prev.map((h, i) => i === currentHeroIndex ? { ...h, stats: { ...h.stats, mp: h.stats.mp - 15 } } : h));

            damage = Math.floor(hero.stats.magic * (1.2 + Math.random() * 0.3));
            setBoss(prev => {
                const newHp = Math.max(0, prev.stats.hp - damage);
                return { ...prev, stats: { ...prev.stats, hp: newHp }, isDead: newHp === 0 };
            });
            addLog(`${hero.name} casts Fireball for ${damage}!`, 'damage');

        } else if (actionType === 'heal') {
            if (hero.stats.mp < 20) {
                addLog(`${hero.name} has no Mana to heal!`, 'info');
                if (isAutoPlay) heroAction('attack');
                return;
            }
            // Deduct MP
            setHeroes(prev => prev.map((h, i) => i === currentHeroIndex ? { ...h, stats: { ...h.stats, mp: h.stats.mp - 20 } } : h));

            heal = Math.floor(hero.stats.magic * 1.5);
            // Heal most injured hero
            setHeroes(prev => {
                // simple logic: heal self or lowest hp
                return prev.map(h => {
                    // Heal logic could be complex, keeping simple: heal self or anyone low
                    if (h.id === hero.id) return { ...h, stats: { ...h.stats, hp: Math.min(h.stats.maxHp, h.stats.hp + heal) } };
                    return h;
                });
            });
            addLog(`${hero.name} heals for ${heal}!`, 'heal');
        }

        // Check Boss Death immediately
        if (boss.stats.hp - damage <= 0) {
            // Boss death effect will trigger
        } else {
            // Advance Turn to next Hero or Boss
            let nextIndex = (currentHeroIndex + 1) % heroes.length;
            // If we wrapped around to 0, it means all heroes acted? 
            // Or we can do: Each click is one hero action.
            // Let's do: Next hero is selected. If next hero index <= current, it means round trip -> Boss Turn.

            // Simplified: One action per turn for the whole party? No, that's unfair.
            // New System: Each hero acts once.
            if (nextIndex === 0) {
                setIsPlayerTurn(false);
                setActiveHeroIndex(0);
            } else {
                // Find next living hero
                const nextLiving = getNextLivingHeroIndex(nextIndex);
                if (nextLiving === -1 || nextLiving < currentHeroIndex) {
                    setIsPlayerTurn(false);
                    setActiveHeroIndex(0);
                } else {
                    setActiveHeroIndex(nextLiving);
                }
            }
        }

    }, [heroes, boss, isPlayerTurn, gameOver, activeHeroIndex, isAutoPlay]);


    // Boss Turn
    useEffect(() => {
        if (!isPlayerTurn && !boss.isDead && !gameOver) {
            const timer = setTimeout(() => {
                const livingHeroes = heroes.filter(h => !h.isDead);
                if (livingHeroes.length === 0) return;

                const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
                const damage = Math.max(1, Math.floor(boss.stats.attack * (0.8 + Math.random() * 0.4)));

                setHeroes(prev => prev.map(h => {
                    if (h.id === target.id) {
                        const newHp = Math.max(0, h.stats.hp - damage);
                        return { ...h, stats: { ...h.stats, hp: newHp }, isDead: newHp === 0 };
                    }
                    return h;
                }));

                addLog(`${boss.name} attacks ${target.name} for ${damage}!`, 'damage');

                // Regen MP a bit
                setHeroes(prev => prev.map(h => !h.isDead ? { ...h, stats: { ...h.stats, mp: Math.min(h.stats.maxMp, h.stats.mp + 5) } } : h));

                setIsPlayerTurn(true);
                setActiveHeroIndex(getNextLivingHeroIndex(0));
                setTurn(t => t + 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, boss, gameOver]); // Dependency array simplified

    // Check Game Over / Victory
    useEffect(() => {
        const allHeroesDead = heroes.every(h => h.isDead);
        if (allHeroesDead) {
            setGameOver(true);
            addLog("Party defeated...", "death");
        }

        if (boss.isDead) {
            addLog(`${boss.name} defeated!`, 'death');
            setTimeout(() => {
                const scale = 1.2;
                setBoss(prev => ({
                    ...prev,
                    level: prev.level + 1,
                    name: `Monster Lvl ${prev.level + 1}`,
                    isDead: false,
                    stats: {
                        hp: Math.floor(prev.stats.maxHp * scale),
                        maxHp: Math.floor(prev.stats.maxHp * scale),
                        mp: 0, maxMp: 0,
                        attack: Math.floor(prev.stats.attack * 1.1),
                        magic: 0, defense: prev.stats.defense + 1, speed: 10
                    }
                }));
                // Revive/Heal Party
                setHeroes(prev => prev.map(h => ({
                    ...h,
                    isDead: false,
                    stats: {
                        ...h.stats,
                        hp: Math.min(h.stats.maxHp, h.stats.hp + 50),
                        mp: h.stats.maxMp
                    }
                })));
                addLog("A stronger boss approaches! Party healed.", 'info');
                setIsPlayerTurn(true);
                setActiveHeroIndex(0);
            }, 2000);
        }
    }, [heroes, boss.isDead]);


    // Auto Play
    useEffect(() => {
        if (isAutoPlay && isPlayerTurn && !gameOver) {
            const timer = setTimeout(() => {
                // Logic to choose action
                const hero = heroes[activeHeroIndex];
                if (!hero) return; // Should not happen

                if (hero.stats.hp < hero.stats.maxHp * 0.5 && hero.stats.mp >= 20) {
                    heroAction('heal');
                } else if (hero.stats.mp >= 15 && boss.stats.hp > 50) {
                    heroAction('magic');
                } else {
                    heroAction('attack');
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isAutoPlay, isPlayerTurn, activeHeroIndex, gameOver, heroAction, heroes, boss]);

    const resetGame = () => {
        setHeroes(INITIAL_HEROES);
        setBoss(INITIAL_BOSS);
        setTurn(1);
        setIsPlayerTurn(true);
        setGameOver(false);
        setLogs([]);
        setActiveHeroIndex(0);
    };

    return {
        heroes,
        boss,
        turn,
        isPlayerTurn,
        activeHeroIndex,
        logs,
        gameOver,
        isAutoPlay,
        actions: {
            action: heroAction,
            reset: resetGame,
            toggleAutoPlay: () => setIsAutoPlay(p => !p)
        }
    };
};
