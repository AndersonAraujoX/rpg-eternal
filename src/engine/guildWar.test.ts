import { describe, it, expect } from 'vitest';
import { generateGuildWarMap } from './guildWar';

describe('Guild War Procedural Generator', () => {

    it('generates a map scaled to party power with 12-20+ territories and oceans', () => {
        const partyPower = 15000;
        const map = generateGuildWarMap(partyPower);

        expect(map.length).toBeGreaterThanOrEqual(16); // 12+ land + 4+ oceans

        const lands = map.filter(t => t.owner !== 'Ocean');
        const oceans = map.filter(t => t.owner === 'Ocean');

        expect(oceans.length).toBeGreaterThanOrEqual(4);
        expect(lands.length).toBeGreaterThanOrEqual(12);

        // First land node should be neutral and easy
        expect(lands[0].owner).toBe('Neutral');
        expect(lands[0].difficulty).toBeGreaterThanOrEqual(500); // Because power * 0.2
        expect(lands[0].name).toBe('Ponto de Desembarque');

        // Other nodes should have scaling difficulty around party power
        // 0.3x to 1.5x of party power => 4500 to 22500
        const minExpectedDiff = 15000 * 0.3;
        const maxExpectedDiff = 15000 * 1.5;

        lands.slice(1).forEach(node => {
            expect(node.difficulty).toBeGreaterThanOrEqual(Math.floor(minExpectedDiff));
            expect(node.difficulty).toBeLessThanOrEqual(Math.floor(maxExpectedDiff));
            expect(node.owner).toBeDefined();
            expect(node.level).toBe(1);
        });
    });

    it('handles absurdly high party power scaling correctly', () => {
        const partyPower = 500_000_000;
        const map = generateGuildWarMap(partyPower);

        const lands = map.filter(t => t.owner !== 'Ocean');
        expect(lands.length).toBeGreaterThan(12); // should be larger tier

        // Ensure starting difficulty is relevant
        expect(lands[0].difficulty).toBe(Math.max(500, Math.floor(500_000_000 * 0.2)));

        const minExpectedDiff = 500_000_000 * 0.3;

        lands.slice(1).forEach(node => {
            expect(node.difficulty).toBeGreaterThanOrEqual(Math.floor(minExpectedDiff));
        });
    });
});
