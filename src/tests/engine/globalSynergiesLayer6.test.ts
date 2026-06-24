import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../hooks/useGame';
import { calculateGlobalModifiers } from '../../engine/modifiersManager';
import { processCombatTurn } from '../../engine/combat';
import type { Hero, Boss } from '../../engine/types';

// ─── Fábrica de estado mínimo para Modificadores ───────────────────────────
const baseState = () => ({
    heroes: [],
    activeSynergies: [],
    buildings: [],
    items: [],
});

describe('6ª Camada de Sinergias Globais (Indústria)', () => {

    describe('Modifiers Engine (calculateGlobalModifiers)', () => {
        it('deve ter valores padrão desativados', () => {
            const mods = calculateGlobalModifiers(baseState() as any);
            expect(mods.layer6.expeditionTimeReduction).toBe(0.0);
            expect(mods.layer6.doubleIronDrop).toBe(false);
            expect(mods.layer6.cardBattleHpBonus).toBe(0.0);
            expect(mods.layer6.fieldShieldMitigation).toBe(0.0);
            expect(mods.layer6.hasHydraulicInjectors).toBe(false);
            expect(mods.activeSynergyIds).not.toContain('drones_mapeamento_geografico');
            expect(mods.activeSynergyIds).not.toContain('ligas_holograficas_fusion');
            expect(mods.activeSynergyIds).not.toContain('escudos_de_cerco_ativo');
        });

        it('L6-1: Drones de Mapeamento Geográfico ativam redução de tempo e drop duplo de ferro', () => {
            const state = {
                ...baseState(),
                industryInventory: { 'Mapping_Drones': 1 }
            };
            const mods = calculateGlobalModifiers(state as any);
            expect(mods.layer6.expeditionTimeReduction).toBe(0.20);
            expect(mods.layer6.doubleIronDrop).toBe(true);
            expect(mods.activeSynergyIds).toContain('drones_mapeamento_geografico');
        });

        it('L6-2: Ligas Holográficas quando mechanizedCardsFused=true ativa HP bonus', () => {
            const state = {
                ...baseState(),
                mechanizedCardsFused: true
            };
            const mods = calculateGlobalModifiers(state as any);
            expect(mods.layer6.cardBattleHpBonus).toBe(0.10);
            expect(mods.activeSynergyIds).toContain('ligas_holograficas_fusion');
        });

        it('L6-3: Escudo de Cerco ativo quando isWorldBossModalActive=true E Field_Shield_Generators >= 1', () => {
            const state = {
                ...baseState(),
                isWorldBossModalActive: true,
                industryInventory: { 'Field_Shield_Generators': 1 }
            };
            const mods = calculateGlobalModifiers(state as any);
            expect(mods.layer6.fieldShieldMitigation).toBe(0.15);
            expect(mods.activeSynergyIds).toContain('escudos_de_cerco_ativo');
        });

        it('L6-3: Escudo de Cerco inativo se modal do World Boss não estiver ativo', () => {
            const state = {
                ...baseState(),
                isWorldBossModalActive: false,
                industryInventory: { 'Field_Shield_Generators': 1 }
            };
            const mods = calculateGlobalModifiers(state as any);
            expect(mods.layer6.fieldShieldMitigation).toBe(0.0);
            expect(mods.activeSynergyIds).not.toContain('escudos_de_cerco_ativo');
        });

        it('L6-4: Injetores Estabilizadores detectados corretamente', () => {
            const state = {
                ...baseState(),
                industryInventory: { 'Hydraulic_Matter_Injectors': 1 }
            };
            const mods = calculateGlobalModifiers(state as any);
            expect(mods.layer6.hasHydraulicInjectors).toBe(true);
        });
    });

    describe('Combat Engine (processCombatTurn)', () => {
        const mockHero = (className: 'Warrior' | 'Paladin' | 'Mage', hp: number): Hero => ({
            id: 'hero_1',
            name: 'Hero',
            class: className,
            stats: { hp, maxHp: hp, attack: 10, defense: 10, magic: 10, speed: 10, mp: 0, maxMp: 0 },
            element: 'neutral',
            assignment: 'combat',
            insanity: 0,
            emoji: '🧙',
            type: 'hero',
            unlocked: true,
            isDead: false,
            level: 1,
            xp: 0,
            maxXp: 100,
            statPoints: 0,
            skills: [],
            fatigue: 0,
            maxFatigue: 100
        });

        const mockBoss = (): Boss => ({
            id: 'boss_1',
            name: 'Boss',
            type: 'boss',
            level: 1,
            stats: { hp: 1000, maxHp: 1000, attack: 50, defense: 0, magic: 0, speed: 10, mp: 0, maxMp: 0 },
            isDead: false,
            element: 'neutral',
            emoji: '👹'
        });

        it('aplica 15% de mitigação para Warrior e Paladin quando escudos_de_cerco_ativo está presente', () => {
            const warrior = mockHero('Warrior', 100);
            const paladin = mockHero('Paladin', 100);
            const mage = mockHero('Mage', 100);
            const boss = mockBoss();

            // Boss attack is 50 * 2 = 100. Hero defense is 10. Damage = 90.
            // With mitigation of 15% (0.85): Warrior/Paladin dmg = 90 * 0.85 = 76. hp = 100 - 76 = 24.
            // Mage damage is not mitigated = 90. hp = 100 - 90 = 10.
            const result = processCombatTurn([warrior, paladin, mage], boss, 1, 0, false, ['escudos_de_cerco_ativo']);
            
            const updatedWarrior = result.updatedHeroes.find(h => h.class === 'Warrior');
            const updatedPaladin = result.updatedHeroes.find(h => h.class === 'Paladin');
            const updatedMage = result.updatedHeroes.find(h => h.class === 'Mage');

            expect(updatedWarrior?.stats.hp).toBe(24);
            expect(updatedPaladin?.stats.hp).toBe(24);
            expect(updatedMage?.stats.hp).toBe(10);
        });
    });

    describe('Game Loop & Actions Integration (useGame)', () => {
        it('L6-2: Fusing mechanized cards consumes Holographic Alloys and adds +10% HP permanently', async () => {
            // Mock industry state
            const mockInventory = { 'Holographic_Alloys': 1 };
            const setIndustryState = vi.fn();

            const { result } = renderHook(() => useGame(mockInventory, setIndustryState));

            // Set active combat heroes
            act(() => {
                result.current.setHeroes([
                    {
                        id: 'h1',
                        name: 'Warrior Hero',
                        class: 'Warrior',
                        stats: { hp: 100, maxHp: 100, attack: 10, defense: 10, magic: 10, speed: 10, mp: 0, maxMp: 0 },
                        element: 'neutral',
                        assignment: 'combat',
                        unlocked: true,
                        isDead: false,
                        level: 1,
                        xp: 0,
                        maxXp: 100,
                        statPoints: 0,
                        skills: [],
                        fatigue: 0,
                        maxFatigue: 100,
                        emoji: '🛡️',
                        type: 'hero'
                    } as any
                ]);
            });

            await new Promise(r => setTimeout(r, 10));

            expect(result.current.mechanizedCardsFused).toBe(false);
            expect(result.current.activeHeroes[0].stats.maxHp).toBe(100);

            // Execute card battle fusion
            act(() => {
                result.current.actions.fuseMechanizedCards();
            });

            await new Promise(r => setTimeout(r, 10));

            // Check card HP boost and fusion state
            expect(result.current.mechanizedCardsFused).toBe(true);
            expect(result.current.activeHeroes[0].stats.maxHp).toBe(110);
        });

        it('L6-4: Infusing item with stabilizer injector guarantees positive affixes and consumes injector', async () => {
            const mockInventory = { 'Hydraulic_Matter_Injectors': 2 };
            const setIndustryState = vi.fn();

            const { result } = renderHook(() => useGame(mockInventory, setIndustryState));

            const testItem = {
                id: 'weapon_1',
                name: 'Sword',
                type: 'weapon',
                rarity: 'legendary',
                value: 100,
                stat: 'attack'
            } as any;

            act(() => {
                result.current.setItems([testItem]);
                result.current.setVoidMatter(100);
            });

            await new Promise(r => setTimeout(r, 10));

            act(() => {
                // Infuse with useInjector = true
                result.current.actions.infuseItemWithVoid('weapon_1', true);
            });

            await new Promise(r => setTimeout(r, 10));

            expect(result.current.voidMatter).toBe(50);
            expect(result.current.items[0].voidAffix).toBeDefined();
            // Positive affixes only (not void_damage or void_crit_dmg)
            const affixId = result.current.items[0].voidAffix?.id;
            expect(['void_execute', 'void_lifesteal', 'void_dodge']).toContain(affixId);
        });
    });
});
