import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuildWarMobaBattle } from '../../components/modals/GuildWarMobaBattle';
import { initGuildWarMobaBattle, type GuildWarMobaState } from '../../engine/guildWarMoba';
import type { Hero, Territory } from '../../engine/types';

describe('GuildWarMobaBattle - Armas Liminares M.E.G. (AAA Pattern)', () => {
    const mockTerritory: Territory = {
        id: 'ter-rift-battle',
        name: 'Posto Dimensional',
        description: 'Arena em fenda.',
        owner: 'Xang',
        difficulty: 4000,
        level: 1,
        upgradeCost: 5000,
        bonus: { type: 'damage', value: 0.15 },
        coordinates: { x: 0, y: 0 },
        isLiminalRift: true
    };

    const mockHeroes: Hero[] = [
        {
            id: 'h1',
            name: 'Paladino M.E.G.',
            emoji: '🛡️',
            class: 'Paladin',
            isDead: false,
            stats: { maxHp: 1500, attack: 150, defense: 80, speed: 10 }
        } as unknown as Hero
    ];

    let baseBattleState: GuildWarMobaState;

    beforeEach(() => {
        baseBattleState = initGuildWarMobaBattle(mockTerritory, mockHeroes, [], 'Guilda M.E.G.', 4000);
    });

    describe('Caminho Feliz: Painel de Armas Liminares M.E.G.', () => {
        it('deve renderizar o painel de Armas Liminares e quantidade de Fluido Liminar', () => {
            // Arrange & Act
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                    liminalFluid={8}
                    containedEntities={['smiler', 'hound']}
                />
            );

            // Assert
            expect(screen.getByText(/Armas Liminares M.E.G./i)).toBeDefined();
            expect(screen.getByText(/8 Fluido/i)).toBeDefined();
            expect(screen.getByRole('button', { name: /Invocar/i })).toBeDefined();
            expect(screen.getByRole('button', { name: /Túnel Noclip/i })).toBeDefined();
            expect(screen.getByRole('button', { name: /Cura Amêndoa/i })).toBeDefined();
        });

        it('deve chamar onSummonEntity ao selecionar rota e clicar em Invocar', () => {
            // Arrange
            const onSummonEntity = vi.fn();
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                    liminalFluid={5}
                    onSummonEntity={onSummonEntity}
                />
            );

            // Act
            const summonBtn = screen.getByRole('button', { name: /Invocar/i });
            fireEvent.click(summonBtn);

            // Assert
            expect(onSummonEntity).toHaveBeenCalledWith('smiler', 'mid');
        });

        it('deve chamar onNoclipFlank ao clicar no botão Túnel Noclip', () => {
            // Arrange
            const onNoclipFlank = vi.fn();
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                    onNoclipFlank={onNoclipFlank}
                />
            );

            // Act
            const noclipBtn = screen.getByRole('button', { name: /Túnel Noclip/i });
            fireEvent.click(noclipBtn);

            // Assert
            expect(onNoclipFlank).toHaveBeenCalled();
        });

        it('deve chamar onAlmondSurge ao clicar no botão Cura Amêndoa', () => {
            // Arrange
            const onAlmondSurge = vi.fn();
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                    onAlmondSurge={onAlmondSurge}
                />
            );

            // Act
            const almondBtn = screen.getByRole('button', { name: /Cura Amêndoa/i });
            fireEvent.click(almondBtn);

            // Assert
            expect(onAlmondSurge).toHaveBeenCalled();
        });
    });

    describe('Casos de Borda (Edge Cases & Unidades em Trânsito)', () => {
        it('deve desabilitar botão Invocar se o jogador possuir 0 Fluido Liminar', () => {
            // Arrange & Act
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                    liminalFluid={0}
                />
            );

            // Assert
            const summonBtn = screen.getByRole('button', { name: /Invocar/i }) as HTMLButtonElement;
            expect(summonBtn.disabled).toBe(true);
        });

        it('deve exibir indicador de Noclip em contagem regressiva para unidade em trânsito', () => {
            // Arrange
            const battleWithNoclip: GuildWarMobaState = {
                ...baseBattleState,
                units: [
                    {
                        ...baseBattleState.units[0],
                        noclipTimer: 3
                    },
                    ...baseBattleState.units.slice(1)
                ]
            };

            // Act
            render(
                <GuildWarMobaBattle
                    battleState={battleWithNoclip}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                />
            );

            // Assert
            expect(screen.getByText(/🌀 Noclip 3s/i)).toBeDefined();
        });

        it('deve exibir efeito e badge de entidade liminar invocada no campo de batalha', () => {
            // Arrange
            const battleWithEntity: GuildWarMobaState = {
                ...baseBattleState,
                units: [
                    ...baseBattleState.units,
                    {
                        id: 'liminal-1',
                        name: 'Smiler Alfa',
                        type: 'liminal_entity' as any,
                        team: 'allied',
                        lane: 'mid',
                        position: 30,
                        hp: 3000,
                        maxHp: 3000,
                        attack: 250,
                        defense: 100,
                        speed: 12,
                        avatar: '😃',
                        specialEffect: 'blind_towers'
                    }
                ]
            };

            // Act
            render(
                <GuildWarMobaBattle
                    battleState={battleWithEntity}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                />
            );

            // Assert
            const entityToken = screen.getByTitle(/Smiler Alfa/i);
            expect(entityToken).toBeDefined();
            expect(entityToken.className).toContain('border-purple-400');
        });
    });

    describe('Tratamento de Exceções & Fallbacks', () => {
        it('deve acionar onUseAbility em fallback caso os handlers customizados não sejam fornecidos', () => {
            // Arrange
            const onUseAbility = vi.fn();
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={onUseAbility}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={4000}
                    liminalFluid={5}
                />
            );

            // Act
            fireEvent.click(screen.getByRole('button', { name: /Invocar/i }));
            fireEvent.click(screen.getByRole('button', { name: /Túnel Noclip/i }));
            fireEvent.click(screen.getByRole('button', { name: /Cura Amêndoa/i }));

            // Assert
            expect(onUseAbility).toHaveBeenCalledWith('summon_entity', { targetLane: 'mid', entityId: 'smiler' });
            expect(onUseAbility).toHaveBeenCalledWith('noclip_flank', { targetLane: 'mid' });
            expect(onUseAbility).toHaveBeenCalledWith('almond_curative_surge');
        });
    });
});
