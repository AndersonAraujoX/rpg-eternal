import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BackroomsTechTree } from '../../components/backrooms/BackroomsTechTree';

describe('BackroomsTechTree - Inovações Liminares Expansion (AAA Pattern)', () => {
    const mockResources = {
        scrap: 500,
        almondWater: 20,
        anomalyParts: 15,
        energyCores: 5
    };

    it('deve listar as 5 novas pesquisas de inovação liminar no catálogo de tecnologias', () => {
        // Arrange & Act
        render(
            <BackroomsTechTree
                floor={60}
                resources={mockResources}
                unlockedTechs={[]}
                onResearchTech={vi.fn()}
            />
        );

        // Assert
        expect(screen.getAllByText(/Rotas do Mercado Negro/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Operação Deep-Dive Roguelike/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Bio-Engenharia Quimérica de Pets/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Coliseu das Lendas Dimensionais/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Armada de Frotas Cósmicas/i).length).toBeGreaterThan(0);
    });

    it('deve disparar onResearchTech ao clicar em pesquisar a tecnologia do Mercado Negro', () => {
        // Arrange
        const onResearchMock = vi.fn();
        render(
            <BackroomsTechTree
                floor={60}
                resources={mockResources}
                unlockedTechs={[]}
                onResearchTech={onResearchMock}
            />
        );

        // Act
        // Localizar o card da pesquisa "Rotas do Mercado Negro" e selecionar
        const blackMarketCard = screen.getAllByText(/Rotas do Mercado Negro/i)[0];
        fireEvent.click(blackMarketCard);

        // Localizar e clicar no botão de pesquisar no painel de detalhes
        const researchBtn = screen.getByRole('button', { name: /Iniciar Pesquisa/i });
        fireEvent.click(researchBtn);

        // Assert
        expect(onResearchMock).toHaveBeenCalledWith('tech_black_market');
    });

    it('deve exibir a nova Era 7: Inovações Liminares no seletor de eras', () => {
        // Arrange
        render(
            <BackroomsTechTree
                floor={60}
                resources={mockResources}
                unlockedTechs={[]}
                onResearchTech={vi.fn()}
            />
        );

        // Act & Assert
        const eraButton = screen.getByRole('button', { name: /Inovações Liminares/i });
        expect(eraButton).toBeInTheDocument();
    });
});
