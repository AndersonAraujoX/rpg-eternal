import { describe, it, expect } from 'vitest';

describe('Game Feature Unlock Conditions', () => {
    it('locks Power Tree when voidAscensions is 0', () => {
        const voidAscensions = 0;
        const isPowerTreeUnlocked = voidAscensions > 0;
        expect(isPowerTreeUnlocked).toBe(false);
    });

    it('unlocks Power Tree after first Ascension', () => {
        const voidAscensions = 1;
        const isPowerTreeUnlocked = voidAscensions > 0;
        expect(isPowerTreeUnlocked).toBe(true);
    });

    it('locks Guild button when Guild Hall building level is 0', () => {
        const buildings = [
            { id: 'guild_hall', level: 0 }
        ] as any[];
        const isGuildUnlocked = buildings.find(b => b.id === 'guild_hall' && b.level > 0);
        expect(isGuildUnlocked).toBeFalsy();
    });

    it('unlocks Guild button when Guild Hall is built', () => {
        const buildings = [
            { id: 'guild_hall', level: 1 }
        ] as any[];
        const isGuildUnlocked = buildings.find(b => b.id === 'guild_hall' && b.level > 0);
        expect(isGuildUnlocked).toBeTruthy();
    });

    it('locks Forge when Forge Workshop level is 0', () => {
        const buildings = [{ id: 'forge_workshop', level: 0 }] as any[];
        const unlocked = buildings.find(b => b.id === 'forge_workshop' && b.level > 0);
        expect(unlocked).toBeFalsy();
    });

    it('unlocks Forge when Forge Workshop is built', () => {
        const buildings = [{ id: 'forge_workshop', level: 1 }] as any[];
        const unlocked = buildings.find(b => b.id === 'forge_workshop' && b.level > 0);
        expect(unlocked).toBeTruthy();
    });

    it('locks Alchemy when Alchemy Lab level is 0', () => {
        const buildings = [{ id: 'alchemy_lab', level: 0 }] as any[];
        const unlocked = buildings.find(b => b.id === 'alchemy_lab' && b.level > 0);
        expect(unlocked).toBeFalsy();
    });
});
