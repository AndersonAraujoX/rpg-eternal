import { useState, useEffect } from 'react';
import type { WorldBoss, GameStats, LogEntry } from '../engine/types';
import { generateWorldBoss, simulateGlobalDamage, calculateWorldBossRewards } from '../engine/worldBoss';

export const useWorldBoss = (
    partyPower: number,
    gameStats: GameStats,
    addLog: (msg: string, type?: LogEntry['type']) => void,
    setSouls: (fn: (prev: number) => number) => void,
    setGold: (fn: (prev: number) => number) => void
) => {
    const [worldBoss, setWorldBoss] = useState<WorldBoss | null>(null);
    const [personalDamage, setPersonalDamage] = useState(0);
    const [canClaim, setCanClaim] = useState(false);

    // Auto-generate boss if none exists
    useEffect(() => {
        if (!worldBoss) {
            const nextTier = Math.floor((gameStats.bossKills || 0) / 50) + 1;
            setWorldBoss(generateWorldBoss(nextTier));
            setPersonalDamage(0);
            setCanClaim(false);
        }
    }, [worldBoss, gameStats.bossKills]);

    // Attack Action
    const attackWorldBoss = () => {
        if (!worldBoss || worldBoss.isDead) return;

        // Damage calculation (simulated crit)
        const isCrit = Math.random() < 0.1;
        const damage = Math.floor(partyPower * (isCrit ? 2.5 : 1));

        setPersonalDamage(prev => prev + damage);

        setWorldBoss(prev => {
            if (!prev) return null;
            const newHp = Math.max(0, prev.globalHp - damage);
            return {
                ...prev,
                globalHp: newHp,
                isDead: newHp <= 0
            };
        });

        if (isCrit) addLog(`CRITICAL HIT! You dealt ${damage} damage to the World Boss!`, 'action');
    };

    // Global Tick Simulation
    useEffect(() => {
        if (!worldBoss || worldBoss.isDead) return;

        const interval = setInterval(() => {
            setWorldBoss(prev => {
                if (!prev || prev.isDead) return prev;

                const updatedBoss = simulateGlobalDamage(prev);

                // Check if boss died from global damage
                if (updatedBoss.globalHp <= 0) {
                    if (!prev.isDead) {
                        addLog(`WORLD BOSS DEFEATED! The ${prev.name} has fallen!`, 'achievement');
                        setCanClaim(true);
                    }
                    return { ...updatedBoss, isDead: true, globalHp: 0 };
                }

                if (prev.isDead) return prev;

                return updatedBoss;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [worldBoss?.id, worldBoss?.isDead]); // Depend on ID to reset on new boss

    // Claim Rewards
    const claimReward = () => {
        if (!worldBoss || !canClaim) return;

        const { souls, gold } = calculateWorldBossRewards(worldBoss.tier, personalDamage);

        setSouls(s => s + souls);
        setGold(g => g + gold);

        addLog(`Claimed World Boss Rewards: +${souls} Souls, +${gold} Gold`, 'achievement');

        // Reset boss (will trigger auto-generate effect)
        setWorldBoss(null);
        setCanClaim(false);
    };

    return {
        worldBoss,
        personalDamage,
        canClaim,
        attackWorldBoss,
        claimReward
    };
};
