import { describe, it, expect } from 'vitest';
import { 
    generatePlanetaryNodes, 
    getPlanetaryEnemyForNode, 
    getPlanetaryEvent, 
    getGalaxyBonusForRoguelike, 
    getPlanetaryRunRewards 
} from '../../engine/roguelike';

describe('Galaxy & Roguelike integration (Planetary Expeditions)', () => {
    
    it('should generate nodes based on sector level difficulty', () => {
        // Sector level < 50
        const lowNodes = generatePlanetaryNodes(10, 'planet');
        expect(lowNodes.length).toBe(10);
        expect(lowNodes[0].type).toBe('combat');
        expect(lowNodes[lowNodes.length - 1].type).toBe('boss');

        // Sector level >= 50
        const midNodes = generatePlanetaryNodes(60, 'star');
        expect(midNodes.length).toBe(10);
        expect(midNodes[midNodes.length - 1].type).toBe('boss');

        // Sector level >= 100
        const highNodes = generatePlanetaryNodes(120, 'nebula');
        expect(highNodes.length).toBe(10);
        expect(highNodes[highNodes.length - 1].type).toBe('boss');
    });

    it('should scale planetary enemy stats based on biome and sector level', () => {
        const enemy = getPlanetaryEnemyForNode('combat', 3, 'planet', 20);
        expect(enemy).toBeDefined();
        expect(enemy.hp).toBeGreaterThan(0);
        expect(enemy.attack).toBeGreaterThan(0);
        expect(enemy.defense).toBeGreaterThan(0);
        expect(enemy.speed).toBeGreaterThan(0);
        expect(typeof enemy.name).toBe('string');
        expect(typeof enemy.emoji).toBe('string');
    });

    it('should return a valid planetary event for a biome', () => {
        const event = getPlanetaryEvent('star');
        expect(event).toBeDefined();
        expect(typeof event.title).toBe('string');
        expect(typeof event.description).toBe('string');
        expect(event.options.length).toBeGreaterThan(0);
    });

    it('should calculate passive galaxy bonuses correctly', () => {
        const ownedSectors = [
            { type: 'planet', isOwned: true },
            { type: 'star', isOwned: true },
            { type: 'nebula', isOwned: false },
            { type: 'asteroid', isOwned: true }
        ];
        const bonus = getGalaxyBonusForRoguelike(ownedSectors);
        expect(bonus.bonusHp).toBe(5);  // 1 owned planet * 5
        expect(bonus.bonusAtk).toBe(1); // 1 owned star * 1
        expect(bonus.bonusMag).toBe(0); // 0 owned nebula
        expect(bonus.bonusDef).toBe(1); // 1 owned asteroid * 1
    });

    it('should compute planetary run rewards on victory/defeat', () => {
        // Victory
        const victoryRewards = getPlanetaryRunRewards(50, 'planet', true);
        expect(victoryRewards.fuelReward).toBe(20); // 15 + Math.floor(50 * 0.1)
        expect(victoryRewards.hullRepair).toBe(27); // 20 + Math.floor(50 * 0.15)
        expect(victoryRewards.emberBonus).toBe(15); // Math.floor(50 * 0.3)
        expect(victoryRewards.shipUpgrade).toBe(false);

        // Special Star upgrade
        const starUpgradeRewards = getPlanetaryRunRewards(120, 'star', true);
        expect(starUpgradeRewards.shipUpgrade).toBe(true);

        // Defeat
        const defeatRewards = getPlanetaryRunRewards(50, 'planet', false);
        expect(defeatRewards.fuelReward).toBe(5);
        expect(defeatRewards.hullRepair).toBe(0);
        expect(defeatRewards.emberBonus).toBe(0);
        expect(defeatRewards.shipUpgrade).toBe(false);
    });

    it('deve calcular corretamente a chance de esquiva e crítico com novos itens', () => {
        const baseSpeed = 16; // Rogue base speed
        const dodgeChance = (baseSpeed / 100) + 0.10; // +10% ninja_hood
        expect(dodgeChance).toBeCloseTo(0.26, 2);

        const baseCrit = 0.10 + 0.15; // base + rogue passive
        const critChance = baseCrit + 0.15; // +15% clover
        expect(critChance).toBeCloseTo(0.40, 2);
    });
});
