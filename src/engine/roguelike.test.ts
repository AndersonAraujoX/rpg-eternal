import { describe, it, expect } from 'vitest';
import { 
    generateRoguelikeNodes, getStartingHero, getEnemyForNode, 
    ROGUELIKE_UPGRADES, RELICS_POOL 
} from './roguelike';

describe('Roguelike Engine Core', () => {
    it('deve gerar 10 nós procedurais de masmorra no mapa', () => {
        const nodes = generateRoguelikeNodes();
        expect(nodes.length).toBe(10);
        expect(nodes[0].type).toBe('combat');
        expect(nodes[nodes.length - 1].type).toBe('boss');
    });

    it('deve inicializar atributos de herói com base na classe e upgrades', () => {
        // Sem upgrades
        const warriorHero = getStartingHero('warrior', {});
        expect(warriorHero.hp).toBe(80);
        expect(warriorHero.attack).toBe(12);

        const mageHero = getStartingHero('mage', {});
        expect(mageHero.maxMp).toBe(50);
        expect(mageHero.magic).toBe(15);

        // Com upgrades
        const upgradedHero = getStartingHero('warrior', { vigor: 2, strength: 3 });
        // vigor: +10 por nível -> +20 HP
        // strength: +2 por nível -> +6 Atk
        expect(upgradedHero.hp).toBe(100);
        expect(upgradedHero.attack).toBe(18);
    });

    it('deve escalar a vida e os atributos dos monstros de acordo com o nível/passo', () => {
        const combatEnemyStep0 = getEnemyForNode('combat', 0);
        const combatEnemyStep5 = getEnemyForNode('combat', 5);
        
        expect(combatEnemyStep5.maxHp).toBeGreaterThan(combatEnemyStep0.maxHp);
        expect(combatEnemyStep5.attack).toBeGreaterThan(combatEnemyStep0.attack);
    });

    it('deve conter as relíquias e os upgrades esperados no pool', () => {
        expect(RELICS_POOL.length).toBeGreaterThan(0);
        expect(ROGUELIKE_UPGRADES.some(u => u.id === 'vigor')).toBe(true);
        expect(ROGUELIKE_UPGRADES.some(u => u.id === 'lucky_charm')).toBe(true);
    });
});
