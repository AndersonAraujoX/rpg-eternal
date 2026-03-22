import { describe, it, expect } from 'vitest';
import { WEATHER_DATA, WeatherType } from './weather';

describe('Seasonal Events & Weather System', () => {
    it('contains all required seasons/weather types', () => {
        const expectedWeathers: WeatherType[] = ['Clear', 'Rain', 'Sandstorm', 'Eclipse', 'Aurora', 'Blizzard', 'Heatwave'];
        expectedWeathers.forEach(w => {
            expect(WEATHER_DATA[w]).toBeDefined();
            expect(WEATHER_DATA[w].type).toBe(w);
            expect(WEATHER_DATA[w].elementModifiers).toBeDefined();
        });
    });

    it('applies elemental modifiers correctly', () => {
        // Blizzard (Era do Gelo) should buff water and nerf nature
        const blizzard = WEATHER_DATA['Blizzard'];
        expect(blizzard.elementModifiers?.water).toBeGreaterThan(1);
        expect(blizzard.elementModifiers?.nature).toBeLessThan(1);

        // Heatwave should buff fire and nerf water
        const heatwave = WEATHER_DATA['Heatwave'];
        expect(heatwave.elementModifiers?.fire).toBeGreaterThan(1);
        expect(heatwave.elementModifiers?.water).toBeLessThan(1);
    });

    it('provides guild war bonuses where applicable', () => {
        // Blizzard (Era do Gelo) should give xp malus
        const blizzard = WEATHER_DATA['Blizzard'];
        expect(blizzard.guildWarBonus).toBeDefined();
        expect(blizzard.guildWarBonus.stat).toBe('xp');

        // Eclipse should give gold bonus
        const eclipse = WEATHER_DATA['Eclipse'];
        expect(eclipse.guildWarBonus).toBeDefined();
        expect(eclipse.guildWarBonus?.stat).toBe('gold');
        expect(eclipse.guildWarBonus?.value).toBeGreaterThan(0.2);
    });
});
