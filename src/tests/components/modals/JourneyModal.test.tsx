import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JourneyModal } from '../../../components/modals/JourneyModal';
import type { GameStateForUnlocks } from '../../../engine/features';

describe('JourneyModal (Interface Visual da Árvore de Progressão)', () => {
    const mockState: GameStateForUnlocks = {
        bossLevel: 15,
        highestFloor: 25,
        voidAscensions: 0,
        buildings: [
            {
                id: 'guild_hall',
                name: 'Sede da Guilda',
                level: 1,
                maxLevel: 5,
                cost: 100,
                costScaling: 1.5,
                currency: 'gold',
                effectValue: 1,
                bonus: '+1',
                width: 1,
                height: 1,
                emoji: '🏰',
                description: 'Guilda'
            }
        ],
        outerSpaceUnlocked: false,
        riftsUnlocked: false,
        backroomsFloor: 2,
        backroomsUnlockedTechs: ['alchemical_distill'],
        hasGuild: true,
        playerTerritoriesCount: 2
    };

    it('não deve renderizar nada quando isOpen for false (Caminho Borda/Fechado)', () => {
        // Arrange
        const onClose = vi.fn();

        // Act
        const { container } = render(
            <JourneyModal isOpen={false} onClose={onClose} state={mockState} />
        );

        // Assert
        expect(container.firstChild).toBeNull();
    });

    it('deve renderizar o título e as 3 ramificações principais quando aberto (Caminho Feliz)', () => {
        // Arrange
        const onClose = vi.fn();

        // Act
        render(<JourneyModal isOpen={true} onClose={onClose} state={mockState} />);

        // Assert - Cabeçalho e Título
        expect(screen.getByText('Jornada de Destino')).toBeInTheDocument();
        expect(screen.getByText('Linha Superior (Fluxo Principal)')).toBeInTheDocument();
        expect(screen.getByText('Ramificação Esquerda')).toBeInTheDocument();
        expect(screen.getByText('Ramificação Direita')).toBeInTheDocument();

        // Linha Superior
        expect(screen.getByText('Torre Infinita')).toBeInTheDocument();
        expect(screen.getByText('Vila')).toBeInTheDocument();
        expect(screen.getByText('Boss Mundial')).toBeInTheDocument();

        // Ramificação Esquerda
        expect(screen.getByText('Guildas')).toBeInTheDocument();
        expect(screen.getByText('GVG')).toBeInTheDocument();

        // Ramificação Direita
        expect(screen.getByText('Backroom')).toBeInTheDocument();
        expect(screen.getByText('Tecnologia')).toBeInTheDocument();
        expect(screen.getByText('Indústria')).toBeInTheDocument();
        expect(screen.getByText('Galáxia')).toBeInTheDocument();
    });

    it('deve alternar entre o modo Fluxograma e o modo Catálogo ao clicar no botão', () => {
        // Arrange
        const onClose = vi.fn();
        render(<JourneyModal isOpen={true} onClose={onClose} state={mockState} />);

        // Act - Alterna para Catálogo
        const catalogButton = screen.getByRole('button', { name: /catálogo/i });
        fireEvent.click(catalogButton);

        // Assert
        expect(screen.getByText('Catálogo Geral de Recursos')).toBeInTheDocument();

        // Act - Retorna para Fluxograma
        const treeButton = screen.getByRole('button', { name: /fluxograma/i });
        fireEvent.click(treeButton);

        // Assert
        expect(screen.getByText('Linha Superior (Fluxo Principal)')).toBeInTheDocument();
    });

    it('deve chamar onClose ao clicar no botão de fechar', () => {
        // Arrange
        const onClose = vi.fn();
        render(<JourneyModal isOpen={true} onClose={onClose} state={mockState} />);

        // Act
        const closeBtn = screen.getByLabelText('Fechar');
        fireEvent.click(closeBtn);

        // Assert
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('deve invocar onNavigate com destino correto e fechar a modal ao clicar em Acessar', () => {
        // Arrange
        const onClose = vi.fn();
        const onNavigate = vi.fn();
        render(
            <JourneyModal
                isOpen={true}
                onClose={onClose}
                state={mockState}
                onNavigate={onNavigate}
            />
        );

        // Act - A Torre Infinita está sempre desbloqueada
        const accessButtons = screen.getAllByRole('button', { name: /acessar/i });
        expect(accessButtons.length).toBeGreaterThan(0);
        fireEvent.click(accessButtons[0]);

        // Assert
        expect(onNavigate).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('deve exibir cadeado e requisito para nós bloqueados (Tratamento de Bloqueios)', () => {
        // Arrange
        const earlyState: GameStateForUnlocks = {
            bossLevel: 1,
            highestFloor: 1,
            voidAscensions: 0,
            buildings: [],
            outerSpaceUnlocked: false
        };

        // Act
        render(<JourneyModal isOpen={true} onClose={vi.fn()} state={earlyState} />);

        // Assert - Vila e Boss Mundial devem estar bloqueados
        const lockedBadges = screen.getAllByText(/bloqueado/i);
        expect(lockedBadges.length).toBeGreaterThan(0);
        expect(screen.getByText(/Alcançar Andar 10 na Torre ou Chefe Nv. 10/i)).toBeInTheDocument();
    });
});
