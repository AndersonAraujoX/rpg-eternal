import { useState } from 'react';
import type { Guild, LogEntry } from '../engine/types';
import { GUILDS } from '../engine/types';
import { MONUMENT_DEFINITIONS, getMonumentCost } from '../engine/guild';
import { soundManager } from '../engine/sound';
import { formatNumber } from '../utils';

export const useGuild = (
    initialGuild: Guild | null,
    gold: number,
    setGold: React.Dispatch<React.SetStateAction<number>>,
    addLog: (message: string, type?: LogEntry['type']) => void
) => {
    const [guild, setGuild] = useState<Guild | null>(initialGuild);

    const joinGuild = (guildName: string) => {
        if (guild) return;
        const gTemplate = GUILDS.find(g => g.name === guildName);
        if (gTemplate) {
            setGuild({ ...gTemplate, members: 1, monuments: {}, totalContribution: 0 });
            addLog(`Joined ${guildName}!`, 'achievement');
            soundManager.playLevelUp();
        }
    };

    const contributeGuild = (amount: number) => {
        if (!guild || gold < amount) return;
        setGold(g => g - amount);
        setGuild(prev => {
            if (!prev) return null;
            const xpGain = amount / 10;
            const newXp = prev.xp + xpGain;
            let finalGuild = { ...prev, xp: newXp, totalContribution: (prev.totalContribution || 0) + amount };

            if (newXp >= prev.maxXp) {
                finalGuild.level += 1;
                finalGuild.xp = newXp - prev.maxXp;
                finalGuild.maxXp = Math.floor(prev.maxXp * 1.2);
                finalGuild.bonusValue = (prev.bonusValue || 0.1) + 0.01;
                finalGuild.bonus = (prev.bonus || "").replace(/\d+%/, `${Math.round(finalGuild.bonusValue * 100)}%`);
                addLog(`Guild Level Up!`, 'achievement');
                soundManager.playLevelUp();
            } else {
                addLog(`Contributed ${formatNumber(amount)} Gold to Guild.`, 'action');
            }
            return finalGuild;
        });
    };

    const upgradeMonument = (monumentId: string) => {
        if (!guild) return;
        const monument = MONUMENT_DEFINITIONS.find(m => m.id === monumentId);
        if (!monument) return;

        const currentLevel = guild.monuments[monumentId] || 0;
        if (currentLevel >= monument.maxLevel) return;
        if (currentLevel >= guild.level) {
            addLog(`Guild Level too low to upgrade ${monument.name}!`, 'error');
            return;
        }

        const cost = getMonumentCost(monument.baseCost, currentLevel, monument.costScaling);
        if (gold >= cost) {
            setGold(g => g - cost);
            setGuild(prev => ({
                ...prev!,
                monuments: {
                    ...prev!.monuments,
                    [monumentId]: currentLevel + 1
                }
            }));
            addLog(`Upgraded ${monument.name} to Level ${currentLevel + 1}!`, 'craft');
            soundManager.playLevelUp();
        } else {
            addLog(`Not enough Gold! Need ${formatNumber(cost)}`, 'error');
        }
    };

    return {
        guild,
        setGuild,
        joinGuild,
        contributeGuild,
        upgradeMonument
    };
};
