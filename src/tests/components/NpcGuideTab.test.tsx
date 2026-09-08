import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NpcGuideTab } from '../../components/NpcGuideTab';
import { TUTORIAL_NPC, TUTORIAL_STEPS } from '../../data/npcTutorial';

describe('NpcGuideTab Component (AAA Pattern)', () => {
    describe('Árvore de Conquista dos Modos (Novo Fluxo da Aria)', () => {
        it('deve renderizar a Árvore de Conquista por padrão com as 3 ramificações (Caminho Feliz)', () => {
            // Arrange
            const currentTutorialIndex = 0;
            const gameState = {
                highestFloor: 15,
                bossLevel: 10,
                buildings: []
            };

            // Act
            render(
                <NpcGuideTab
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={gameState}
                />
            );

            // Assert
            expect(screen.getByTestId('npc-guide-tab')).toBeInTheDocument();
            expect(screen.getByText(TUTORIAL_NPC.fullName)).toBeInTheDocument();
            expect(screen.getByTestId('aria-conquest-tree-section')).toBeInTheDocument();

            // Linha Superior
            expect(screen.getByText('Linha Superior (Fluxo Principal)')).toBeInTheDocument();
            expect(screen.getAllByText('Torre Infinita').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Vila').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Boss Mundial').length).toBeGreaterThanOrEqual(1);

            // Ramificação Esquerda
            expect(screen.getByText(/Ramificação Esquerda/i)).toBeInTheDocument();
            expect(screen.getAllByText('Guildas').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('GVG').length).toBeGreaterThanOrEqual(1);

            // Ramificação Direita
            expect(screen.getByText(/Ramificação Direita/i)).toBeInTheDocument();
            expect(screen.getAllByText('Backroom').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Tecnologia').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Indústria').length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText('Galáxia').length).toBeGreaterThanOrEqual(1);
        });

        it('deve exibir o painel de conselho detalhado da Aria ao selecionar um modo', () => {
            // Arrange
            render(<NpcGuideTab currentTutorialIndex={0} gameState={{ highestFloor: 20 }} />);

            // Act - O nó inicial padrão é a Torre Infinita
            expect(screen.getByTestId('aria-focused-mode-inspector')).toBeInTheDocument();
            expect(screen.getByText(/Como Conquistar este Modo \(Dica da Aria\):/i)).toBeInTheDocument();

            // Clica no card da Vila
            fireEvent.click(screen.getByTestId('aria-node-town'));

            // Assert
            expect(screen.getByText(/A Vila é o ponto de conexão de todo o reino!/i)).toBeInTheDocument();
        });

        it('deve invocar onOpenModal com o destino correto ao clicar em entrar/abrir um modo', () => {
            // Arrange
            const onOpenModalMock = vi.fn();
            render(
                <NpcGuideTab
                    currentTutorialIndex={0}
                    gameState={{ highestFloor: 5 }}
                    onOpenModal={onOpenModalMock}
                />
            );

            // Act - A Torre Infinita está desbloqueada
            const enterModeBtn = screen.getByRole('button', { name: /entrar no modo/i });
            fireEvent.click(enterModeBtn);

            // Assert
            expect(onOpenModalMock).toHaveBeenCalledWith('tower');
        });

        it('deve permitir abrir a Jornada Completa em tela cheia', () => {
            // Arrange
            const onOpenModalMock = vi.fn();
            render(
                <NpcGuideTab
                    currentTutorialIndex={0}
                    onOpenModal={onOpenModalMock}
                />
            );

            // Act
            const journeyBtn = screen.getByRole('button', { name: /ver jornada completa/i });
            fireEvent.click(journeyBtn);

            // Assert
            expect(onOpenModalMock).toHaveBeenCalledWith('journey');
        });
    });

    describe('Seção de Diretrizes do Tutorial e Comportamento Interativo', () => {
        it('deve alternar para a aba de Diretrizes e exibir o passo ativo', () => {
            // Arrange
            render(<NpcGuideTab currentTutorialIndex={0} gameState={{ gold: 20000 }} />);

            // Act - Clica na aba de Diretrizes
            const directivesTabBtn = screen.getByTestId('aria-tab-directives-btn');
            fireEvent.click(directivesTabBtn);

            // Assert
            expect(screen.getByTestId('aria-directives-section')).toBeInTheDocument();
            expect(screen.getByTestId('guide-tab-active-step')).toBeInTheDocument();
            expect(screen.getAllByText(TUTORIAL_STEPS[0].objectiveDescription).length).toBeGreaterThanOrEqual(1);
        });

        it('deve alternar a exibição da dica de Aria dentro da aba de Diretrizes', () => {
            // Arrange
            render(
                <NpcGuideTab
                    currentTutorialIndex={0}
                    gameState={{ gold: 1000 }}
                    initialSection="directives"
                />
            );

            // Act 1: Dica visível inicialmente
            expect(screen.getByTestId('guide-tab-hint-content')).toBeInTheDocument();

            // Act 2: Clica para ocultar dica
            const hintToggle = screen.getByTestId('guide-tab-hint-toggle');
            fireEvent.click(hintToggle);

            // Assert 2: Dica ocultada
            expect(screen.queryByTestId('guide-tab-hint-content')).toBeNull();

            // Act 3: Clica para reexibir
            fireEvent.click(hintToggle);

            // Assert 3: Dica reexibida
            expect(screen.getByTestId('guide-tab-hint-content')).toBeInTheDocument();
        });

        it('deve acionar o atalho onOpenModal na diretriz ativa', () => {
            // Arrange
            const onOpenModalMock = vi.fn();
            render(
                <NpcGuideTab
                    currentTutorialIndex={0}
                    gameState={{ gold: 1000 }}
                    onOpenModal={onOpenModalMock}
                    initialSection="directives"
                />
            );

            // Act
            const actionBtn = screen.getByTestId('guide-tab-action-button');
            fireEvent.click(actionBtn);

            // Assert
            expect(onOpenModalMock).toHaveBeenCalledWith('town');
        });
    });

    describe('Seção de Compêndio de Conhecimento', () => {
        it('deve alternar para o Compêndio e trocar de artigo ao clicar nas abas', () => {
            // Arrange
            render(<NpcGuideTab currentTutorialIndex={0} initialSection="compendium" />);

            // Assert - Artigo inicial (Combate)
            expect(screen.getByText(/Seus heróis atacam continuamente de forma automática/i)).toBeInTheDocument();

            // Act - Clica no artigo da Taverna
            const tavernBtn = screen.getByRole('button', { name: /Taverna e Recrutamento/i });
            fireEvent.click(tavernBtn);

            // Assert - Artigo da Taverna exibido
            expect(screen.getByText(/Visite a Taverna para recrutar novos aventureiros com ouro/i)).toBeInTheDocument();
        });
    });

    describe('Casos de Borda e Estados de Conclusão', () => {
        it('deve renderizar card de conclusão nas Diretrizes quando índice ultrapassar o total', () => {
            // Arrange
            const completedIndex = TUTORIAL_STEPS.length;

            // Act
            render(
                <NpcGuideTab
                    currentTutorialIndex={completedIndex}
                    initialSection="directives"
                />
            );

            // Assert
            expect(screen.getByTestId('guide-tab-completed')).toBeInTheDocument();
            expect(screen.getByText(/Todas as Diretrizes Iniciais Concluídas!/i)).toBeInTheDocument();
            expect(screen.queryByTestId('guide-tab-active-step')).toBeNull();
        });

        it('deve lidar graciosamente com gameState nulo ou vazio sem lançar exceções', () => {
            // Arrange & Act
            const { container } = render(
                <NpcGuideTab
                    currentTutorialIndex={0}
                    gameState={null}
                />
            );

            // Assert
            expect(container).toBeDefined();
            expect(screen.getByTestId('npc-guide-tab')).toBeInTheDocument();
            expect(screen.getByTestId('aria-conquest-tree-section')).toBeInTheDocument();
        });
    });
});
