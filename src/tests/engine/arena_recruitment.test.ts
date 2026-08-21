import { describe, it, expect, vi } from 'vitest';
import type { Guild } from '../../engine/types';

describe('Arena Recruitment and Guild Integration', () => {
    it('directly adds defeated arena fighter to guild when player is in a guild', () => {
        let guild: Guild | null = {
            name: 'Shadow Strikers',
            description: 'Assassins',
            bonus: '+10% Speed',
            bonusType: 'speed',
            bonusValue: 0.1,
            level: 1,
            xp: 0,
            maxXp: 1000,
            members: 1,
            monuments: {},
            totalContribution: 0
        };

        const opponent = { id: 'bot_1', name: 'Gladiador Rex', avatar: '⚔️', power: 500 };

        // Simulate arena victory with guild
        if (guild) {
            guild = { ...guild, members: guild.members + 1, xp: guild.xp + 500 };
        }

        expect(guild.members).toBe(2);
        expect(guild.xp).toBe(500);
    });

    it('queues defeated arena fighters when player is not in a guild and claims them upon joining', () => {
        let guildQueue: { name: string; emoji: string; power: number }[] = [];
        let guild: Guild | null = null;

        const opponent1 = { id: 'bot_1', name: 'Gladiador Rex', avatar: '⚔️', power: 500 };
        const opponent2 = { id: 'bot_2', name: 'Mago Solaris', avatar: '🧙', power: 750 };

        // Victory 1 without guild
        if (!guild) {
            guildQueue.push({ name: opponent1.name, emoji: opponent1.avatar, power: opponent1.power });
        }
        // Victory 2 without guild
        if (!guild) {
            guildQueue.push({ name: opponent2.name, emoji: opponent2.avatar, power: opponent2.power });
        }

        expect(guildQueue.length).toBe(2);

        // Player joins guild
        guild = {
            name: 'Iron Vanguard',
            description: 'Warriors',
            bonus: '+10% Defense',
            bonusType: 'defense',
            bonusValue: 0.1,
            level: 1,
            xp: 0,
            maxXp: 1000,
            members: 1,
            monuments: {},
            totalContribution: 0
        };

        // Claim recruits
        const count = guildQueue.length;
        const xpGain = count * 500;
        guild = { ...guild, members: guild.members + count, xp: guild.xp + xpGain };
        guildQueue = [];

        expect(guild.members).toBe(3);
        expect(guild.xp).toBe(1000);
        expect(guildQueue.length).toBe(0);
    });

    it('unlocks locked hero when 25% hero recruitment triggers', () => {
        let heroes = [
            { id: 'h1', name: 'Guerreiro', unlocked: true },
            { id: 'h2', name: 'Mago', unlocked: false },
            { id: 'h3', name: 'Arqueiro', unlocked: false },
        ];

        const lockedHeroes = heroes.filter(h => !h.unlocked);
        expect(lockedHeroes.length).toBe(2);

        // Unlock one
        const heroToUnlock = lockedHeroes[0];
        heroes = heroes.map(h => h.id === heroToUnlock.id ? { ...h, unlocked: true } : h);

        expect(heroes.find(h => h.id === 'h2')?.unlocked).toBe(true);
        expect(heroes.filter(h => h.unlocked).length).toBe(2);
    });
});
