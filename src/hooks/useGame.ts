import { useState, useEffect, useCallback } from 'react';
import type { Hero, Boss } from '../engine/types';

const INITIAL_HERO: Hero = {
    id: 'hero-1',
    name: 'Warrior',
    type: 'hero',
    class: 'Warrior',
    isDead: false,
    stats: {
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 5,
        speed: 10,
    }
};

const INITIAL_BOSS: Boss = {
    id: 'boss-1',
    name: 'Eternal Demon',
    type: 'boss',
    level: 1,
    isDead: false,
    stats: {
        hp: 200,
        maxHp: 200,
        attack: 12,
        defense: 2,
        speed: 8,
    }
};

export type LogEntry = {
    id: string;
    message: string;
    type: 'info' | 'damage' | 'heal' | 'death';
};

export const useGame = () => {
    const [hero, setHero] = useState<Hero>(INITIAL_HERO);
    const [boss, setBoss] = useState<Boss>(INITIAL_BOSS);
    const [turn, setTurn] = useState<number>(1);
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev.slice(-19), { id: Math.random().toString(36), message, type }]);
    };

    const heroAttack = useCallback(() => {
        if (!isPlayerTurn || gameOver) return;

        // Calculate Damage
        const damage = Math.max(1, hero.stats.attack - boss.stats.defense);
        const isCrit = Math.random() > 0.8;
        const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;

        setBoss(prev => {
            const newHp = Math.max(0, prev.stats.hp - finalDamage);
            return { ...prev, stats: { ...prev.stats, hp: newHp }, isDead: newHp === 0 };
        });

        addLog(`${hero.name} attacks for ${finalDamage} damage!${isCrit ? ' (CRITICAL!)' : ''}`, 'damage');

        if (boss.stats.hp - finalDamage <= 0) {
            // Boss died handler will trigger via effect
        } else {
            setIsPlayerTurn(false);
        }
    }, [hero, boss, isPlayerTurn, gameOver]);

    // Boss Turn Effect
    useEffect(() => {
        if (!isPlayerTurn && !boss.isDead && !gameOver) {
            const timer = setTimeout(() => {
                const damage = Math.max(1, boss.stats.attack - hero.stats.defense);

                setHero(prev => {
                    const newHp = Math.max(0, prev.stats.hp - damage);
                    return { ...prev, stats: { ...prev.stats, hp: newHp }, isDead: newHp === 0 };
                });

                addLog(`${boss.name} attacks you for ${damage} damage!`, 'damage');
                setIsPlayerTurn(true);
                setTurn(t => t + 1);
            }, 1000); // 1s delay for "thinking"

            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, boss.isDead, gameOver]);

    // Check Death Conditions
    useEffect(() => {
        if (boss.isDead) {
            addLog(`${boss.name} has been defeated! The darkness grows stronger...`, 'death');
            // Respawn stronger boss
            setTimeout(() => {
                setBoss(prev => ({
                    ...prev,
                    level: prev.level + 1,
                    name: `Eternal Demon Lvl ${prev.level + 1}`,
                    isDead: false,
                    stats: {
                        maxHp: Math.floor(prev.stats.maxHp * 1.2),
                        hp: Math.floor(prev.stats.maxHp * 1.2),
                        attack: Math.floor(prev.stats.attack * 1.1),
                        defense: prev.stats.defense + 1,
                        speed: prev.stats.speed,
                    }
                }));
                // Heal hero slightly
                setHero(prev => ({
                    ...prev,
                    stats: { ...prev.stats, hp: Math.min(prev.stats.maxHp, prev.stats.hp + 20) }
                }));
                addLog(`A stronger boss appears! You recovered 20 HP.`, 'info');
                setIsPlayerTurn(true);
            }, 2000);
        }

        if (hero.isDead) {
            setGameOver(true);
            addLog(`You have fallen. The eternal battle ends...`, 'death');
        }
    }, [boss.isDead, hero.isDead]);

    const resetGame = () => {
        setHero(INITIAL_HERO);
        setBoss(INITIAL_BOSS);
        setTurn(1);
        setIsPlayerTurn(true);
        setGameOver(false);
        setLogs([]);
        addLog("A new eternal battle begins...");
    };

    return {
        hero,
        boss,
        turn,
        isPlayerTurn,
        logs,
        gameOver,
        actions: {
            attack: heroAttack,
            reset: resetGame
        }
    };
};
