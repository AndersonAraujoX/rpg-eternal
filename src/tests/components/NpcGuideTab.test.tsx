import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NpcGuideTab } from '../../components/NpcGuideTab';
import { TUTORIAL_NPC, TUTORIAL_STEPS } from '../../data/npcTutorial';

describe('NpcGuideTab Component (AAA Pattern)', () => {
    describe('Happy Path: Rendering Aria Profile & Active Tutorial Directive', () => {
        it('should render Aria header, title, greeting, and active directive details', () => {
            // Arrange
            const currentTutorialIndex = 0;
            const gameState = { gold: 20000, buildings: [] };

            // Act
            render(
                <NpcGuideTab 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={gameState}
                />
            );

            // Assert
            expect(screen.getByTestId('npc-guide-tab')).toBeDefined();
            expect(screen.getByText(TUTORIAL_NPC.fullName)).toBeDefined();
            expect(screen.getByText(TUTORIAL_NPC.title)).toBeDefined();
            expect(screen.getByText(new RegExp(TUTORIAL_NPC.greeting, 'i'))).toBeDefined();
            expect(screen.getByTestId('guide-tab-active-step')).toBeDefined();
            expect(screen.getAllByText(TUTORIAL_STEPS[0].objectiveDescription).length).toBeGreaterThanOrEqual(1);
        });

        it('should render the directives timeline checklist with correct state', () => {
            // Arrange
            const currentTutorialIndex = 1;

            // Act
            render(
                <NpcGuideTab 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={{ gold: 40000 }}
                />
            );

            // Assert
            expect(screen.getByText(/Linha do Tempo das Diretrizes/i)).toBeDefined();
            expect(screen.getByText(/Concluído/i)).toBeDefined();
            expect(screen.getByText(/Em Curso/i)).toBeDefined();
            expect(screen.getByText(/Bloqueado/i)).toBeDefined();
        });
    });

    describe('Interactive Behavior: Hint Toggling, Action Button & Compendium Articles', () => {
        it('should toggle detailed hint on and off when clicking hint button', () => {
            // Arrange
            const currentTutorialIndex = 0;
            render(
                <NpcGuideTab 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={{ gold: 1000 }}
                />
            );

            // Act 1: Initially hint is shown by default in the full tab
            expect(screen.getByTestId('guide-tab-hint-content')).toBeDefined();

            // Act 2: Click to toggle off
            const hintToggle = screen.getByTestId('guide-tab-hint-toggle');
            fireEvent.click(hintToggle);

            // Assert 2: Hint content is hidden
            expect(screen.queryByTestId('guide-tab-hint-content')).toBeNull();

            // Act 3: Click to toggle back on
            fireEvent.click(hintToggle);

            // Assert 3: Hint content is visible again
            expect(screen.getByTestId('guide-tab-hint-content')).toBeDefined();
        });

        it('should trigger onOpenModal when clicking directive action shortcut', () => {
            // Arrange
            const currentTutorialIndex = 0;
            const onOpenModalMock = vi.fn();
            render(
                <NpcGuideTab 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={{ gold: 1000 }}
                    onOpenModal={onOpenModalMock}
                />
            );

            // Act
            const actionBtn = screen.getByTestId('guide-tab-action-button');
            fireEvent.click(actionBtn);

            // Assert
            expect(onOpenModalMock).toHaveBeenCalledTimes(1);
            expect(onOpenModalMock).toHaveBeenCalledWith('town');
        });

        it('should switch between knowledge compendium articles when clicking article tabs', () => {
            // Arrange
            render(<NpcGuideTab currentTutorialIndex={0} />);

            // Assert default article (Combate e Chefes) is displayed
            expect(screen.getByText(/Seus heróis atacam continuamente de forma automática/i)).toBeDefined();

            // Act: Click on Taverna article
            const tavernBtn = screen.getByRole('button', { name: /Taverna e Recrutamento/i });
            fireEvent.click(tavernBtn);

            // Assert: Taverna article is displayed
            expect(screen.getByText(/Visite a Taverna para recrutar novos aventureiros com ouro/i)).toBeDefined();
        });
    });

    describe('Edge Cases & Completion States', () => {
        it('should render congratulatory completed card when index is >= tutorial steps', () => {
            // Arrange
            const completedIndex = TUTORIAL_STEPS.length;

            // Act
            render(<NpcGuideTab currentTutorialIndex={completedIndex} />);

            // Assert
            expect(screen.getByTestId('guide-tab-completed')).toBeDefined();
            expect(screen.getByText(/Todas as Diretrizes Iniciais Concluídas!/i)).toBeDefined();
            expect(screen.queryByTestId('guide-tab-active-step')).toBeNull();
        });

        it('should gracefully handle null/empty gameState without throwing errors', () => {
            // Arrange & Act
            const { container } = render(
                <NpcGuideTab 
                    currentTutorialIndex={0} 
                    gameState={null} 
                />
            );

            // Assert
            expect(container).toBeDefined();
            expect(screen.getByTestId('npc-guide-tab')).toBeDefined();
        });
    });
});
