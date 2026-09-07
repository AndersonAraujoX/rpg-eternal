import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuildWarMobaBattle } from '../../components/modals/GuildWarMobaBattle';
import { initGuildWarMobaBattle, type GuildWarMobaState } from '../../engine/guildWarMoba';
import type { Hero, Territory } from '../../engine/types';

describe('GuildWarMobaBattle Component (AAA Pattern)', () => {
    const mockTerritory: Territory = {
        id: 'ter-citadel',
        name: 'Cidadela de Ferro',
        description: 'Bastião fortificado.',
        owner: 'Xang',
        difficulty: 3000,
        level: 1,
        upgradeCost: 5000,
        bonus: { type: 'gold', value: 0.20 },
        coordinates: { x: 0, y: 0 }
    };

    const mockHeroes: Hero[] = [
        {
            id: 'h1',
            name: 'Guerreiro Imperial',
            emoji: '⚔️',
            class: 'Warrior',
            isDead: false,
            stats: { maxHp: 1200, attack: 180, defense: 60, speed: 10 }
        } as unknown as Hero
    ];

    let baseBattleState: GuildWarMobaState;

    beforeEach(() => {
        baseBattleState = initGuildWarMobaBattle(mockTerritory, mockHeroes, [], 'Guilda dos Invencíveis', 3000);
    });

    describe('Caminho Feliz: Renderização do Painel de Batalha MOBA + CTF', () => {
        it('deve renderizar os nomes das guildas, o território em disputa e as 3 rotas', () => {
            // Arrange
            const onSetStance = vi.fn();
            const onUseAbility = vi.fn();
            const onManualStrike = vi.fn();
            const onReturnToMap = vi.fn();

            // Act
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={onSetStance}
                    onUseAbility={onUseAbility}
                    onManualStrike={onManualStrike}
                    onReturnToMap={onReturnToMap}
                    partyPower={3000}
                />
            );

            // Assert
            expect(screen.getByText('Guilda dos Invencíveis')).toBeDefined();
            expect(screen.getByText('Cidadela de Ferro')).toBeDefined();
            expect(screen.getByText('Rota Superior')).toBeDefined();
            expect(screen.getByText('Rota Central (Altar)')).toBeDefined();
            expect(screen.getByText('Rota Inferior')).toBeDefined();
            expect(screen.getByText(/Bandeira Sagrada no Centro do Mid/i)).toBeDefined();
        });

        it('deve renderizar a lista de heróis da guilda com HP e classe', () => {
            // Arrange & Act
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={3000}
                />
            );

            // Assert
            expect(screen.getByText('Guerreiro Imperial')).toBeDefined();
            expect(screen.getByText(/Heróis da Sua Guilda/i)).toBeDefined();
        });
    });

    describe('Interação do Jogador: Comandos Táticos e Habilidades', () => {
        it('deve disparar onSetStance com a postura selecionada ao clicar nos botões de comando', () => {
            // Arrange
            const onSetStance = vi.fn();
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={onSetStance}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={3000}
                />
            );

            // Act: Clica no botão "Bandeira"
            const flagButton = screen.getByRole('button', { name: /bandeira/i });
            fireEvent.click(flagButton);

            // Assert
            expect(onSetStance).toHaveBeenCalledWith('flag');
        });

        it('deve acionar onUseAbility com a habilidade escolhida ao clicar no botão', () => {
            // Arrange
            const onUseAbility = vi.fn();
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={onUseAbility}
                    onManualStrike={vi.fn()}
                    onReturnToMap={vi.fn()}
                    partyPower={3000}
                />
            );

            // Act: Clica em "Bombardeio"
            const bombardBtn = screen.getByRole('button', { name: /bombardeio/i });
            fireEvent.click(bombardBtn);

            // Assert
            expect(onUseAbility).toHaveBeenCalledWith('tactical_bombard', expect.any(Object));
        });

        it('deve executar onManualStrike com o alvo selecionado ao clicar no Golpe Manual', () => {
            // Arrange
            const onManualStrike = vi.fn();
            render(
                <GuildWarMobaBattle
                    battleState={baseBattleState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={onManualStrike}
                    onReturnToMap={vi.fn()}
                    partyPower={3000}
                />
            );

            // Act: Clica no botão de Golpe Manual
            const strikeBtn = screen.getByRole('button', { name: /golpe manual/i });
            fireEvent.click(strikeBtn);

            // Assert
            expect(onManualStrike).toHaveBeenCalled();
        });
    });

    describe('Desfecho de Batalha: Overlay de Vitória / Derrota', () => {
        it('deve exibir overlay de vitória e acionar onReturnToMap ao clicar no botão', () => {
            // Arrange
            const victoryState: GuildWarMobaState = {
                ...baseBattleState,
                battleActive: false,
                winner: 'allied',
                alliedScore: 2500,
                rivalScore: 800
            };
            const onReturnToMap = vi.fn();

            // Act
            render(
                <GuildWarMobaBattle
                    battleState={victoryState}
                    onSetStance={vi.fn()}
                    onUseAbility={vi.fn()}
                    onManualStrike={vi.fn()}
                    onReturnToMap={onReturnToMap}
                    partyPower={3000}
                />
            );

            // Assert
            expect(screen.getByText(/VITÓRIA GLORIOSA!/i)).toBeDefined();
            const returnBtn = screen.getByRole('button', { name: /retornar ao mapa/i });
            expect(returnBtn).toBeDefined();

            fireEvent.click(returnBtn);
            expect(onReturnToMap).toHaveBeenCalled();
        });
    });
});
