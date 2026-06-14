import { describe, it, expect } from 'vitest';
import { calculateBackroomsTechnology } from '../../engine/backroomsTechnology';
import { calculateGlobalModifiers } from '../../engine/modifiersManager';

describe('Backrooms Technology and Milestones', () => {
    it('deve retornar valores padrão quando as Backrooms estiverem bloqueadas', () => {
        const result = calculateBackroomsTechnology(10, false);
        expect(result.scalars.globalElementalDamage).toBe(0);
        expect(result.scalars.industrialSpeed).toBe(0);
        expect(result.scalars.offlineGoldBonus).toBe(0);
        expect(result.modifiers.fishingLendaryChance).toBe(0);
    });

    it('deve calcular corretamente os escalares contínuos passivos', () => {
        // Nível 100
        const result100 = calculateBackroomsTechnology(100, true);
        expect(result100.scalars.globalElementalDamage).toBeCloseTo(0.25, 4); // 100 * 0.0025 = 25%
        expect(result100.scalars.industrialSpeed).toBeCloseTo(0.50, 4);       // 100 * 0.0050 = 50%
        expect(result100.scalars.offlineGoldBonus).toBeCloseTo(0.30, 4);      // 100 * 0.0030 = 30%

        // Nível 40
        const result40 = calculateBackroomsTechnology(40, true);
        expect(result40.scalars.globalElementalDamage).toBeCloseTo(0.10, 4);
        expect(result40.scalars.industrialSpeed).toBeCloseTo(0.20, 4);
        expect(result40.scalars.offlineGoldBonus).toBeCloseTo(0.12, 4);
    });

    it('deve liberar modificadores e marcos conforme o nível da Backrooms', () => {
        // Nível 1: nenhum marco de combate destravado (primeiro é nível 2)
        const res1 = calculateBackroomsTechnology(1, true);
        expect(res1.modifiers.frostResistanceReduction).toBe(0);

        // Nível 2: Sifão Criogênico
        const res2 = calculateBackroomsTechnology(2, true);
        expect(res2.modifiers.frostResistanceReduction).toBe(0.25);
        expect(res2.modifiers.fishingLendaryChance).toBe(0);

        // Nível 10: Isca de Almond Water
        const res10 = calculateBackroomsTechnology(10, true);
        expect(res10.modifiers.fishingLendaryChance).toBe(0.15);

        // Nível 30: Ocultamento Quântico
        const res30 = calculateBackroomsTechnology(30, true);
        expect(res30.modifiers.critDamageOnStealth).toBe(1.0);

        // Nível 55: Acelerador Temporal
        const res55 = calculateBackroomsTechnology(55, true);
        expect(res55.modifiers.cooldownReduction).toBe(0.30);

        // Nível 65: Sorte Estabilizada
        const res65 = calculateBackroomsTechnology(65, true);
        expect(res65.modifiers.diceGameLuckModifier).toBe(0.12);

        // Nível 85: Supercompressor de Matéria Escura
        const res85 = calculateBackroomsTechnology(85, true);
        expect(res85.modifiers.vacuumExplosionChance).toBe(0.10);

        // Nível 100: Comando de Titãs e todos os marcos anteriores
        const res100 = calculateBackroomsTechnology(100, true);
        expect(res100.modifiers.worldBossDamageBonus).toBe(0.20);
        expect(res100.modifiers.gvgShieldPercent).toBe(0.15);
        expect(res100.modifiers.fishingLendaryChance).toBe(0.15);
        expect(res100.modifiers.vacuumExplosionChance).toBe(0.10);
    });

    it('deve integrar corretamente com o calculateGlobalModifiers', () => {
        const modifiersStateLocked = {
            heroes: [],
            activeSynergies: [],
            buildings: [],
            items: [],
            highestRiftFloor: 0,
            cosmicDust: 0,
            industryInventory: {},
            backroomsFloor: 65,
            isBackroomsUnlocked: false
        };

        // Sem Backrooms desbloqueadas
        const globalModsLocked = calculateGlobalModifiers(modifiersStateLocked);
        expect(globalModsLocked.backroomsScalars.globalElementalDamage).toBe(0);
        expect(globalModsLocked.activeSynergyIds).not.toContain('sorte_estabilizada_dados');

        // Com Backrooms desbloqueadas no nível 65
        const modifiersStateUnlocked = {
            ...modifiersStateLocked,
            isBackroomsUnlocked: true
        };
        const globalModsUnlocked = calculateGlobalModifiers(modifiersStateUnlocked);
        expect(globalModsUnlocked.backroomsScalars.globalElementalDamage).toBeCloseTo(0.1625, 4); // 65 * 0.0025 = 16.25%
        expect(globalModsUnlocked.collection.fishingLendaryChance).toBe(0.15); // Level 10+
        expect(globalModsUnlocked.activeSynergyIds).toContain('sorte_estabilizada_dados'); // Level 65
        expect(globalModsUnlocked.activeSynergyIds).toContain('sifao_criogenico_ativo'); // Level 2
    });

    it('deve acumular corretamente bônus da Prensa de Sucata e do Condensador Alquímico nos modificadores', () => {
        const modifiersState = {
            heroes: [],
            activeSynergies: [],
            buildings: [],
            items: [],
            industryInventory: {
                almond_condenser: 1,
                scrap_press: 1
            },
            backroomsFloor: 1,
            isBackroomsUnlocked: true
        };

        const globalMods = calculateGlobalModifiers(modifiersState);
        // Compactador de Sucata dá +10% de sucesso base na Forja
        expect(globalMods.crafting.forgeSuccessRateBonus).toBe(0.10);
        expect(globalMods.activeSynergyIds).toContain('compactador_sucata_forja');

        // Condensador Alquímico aumenta velocidade do jardim em 20%
        expect(globalMods.collection.gardenSpeedMult).toBeCloseTo(1.20, 2);
        expect(globalMods.activeSynergyIds).toContain('condensador_alquimico_jardim');
    });
});
