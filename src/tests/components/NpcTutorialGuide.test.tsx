import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NpcTutorialGuide } from '../../components/NpcTutorialGuide';
import { TUTORIAL_NPC, TUTORIAL_STEPS } from '../../data/npcTutorial';

describe('NpcTutorialGuide Component (AAA Pattern)', () => {
    describe('Happy Path: Rendering Active Tutorial Step', () => {
        it('should render NPC avatar, step counter, dialogue, and objective', () => {
            // Arrange
            const step = TUTORIAL_STEPS[0];
            const currentTutorialIndex = 0;
            const gameState = { gold: 15000, buildings: [] };

            // Act
            render(
                <NpcTutorialGuide 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={gameState}
                />
            );

            // Assert
            expect(screen.getByTestId('npc-tutorial-guide')).toBeDefined();
            expect(screen.getByAltText(step.npcName)).toBeDefined();
            expect(screen.getByText(/Passo 1\/3/i)).toBeDefined();
            expect(screen.getByText(new RegExp(step.dialogue, 'i'))).toBeDefined();
            expect(screen.getByText(step.objectiveDescription)).toBeDefined();
        });

        it('should render rewards preview tags with proper labels', () => {
            // Arrange
            const currentTutorialIndex = 0;

            // Act
            render(
                <NpcTutorialGuide 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={{ gold: 1000 }}
                />
            );

            // Assert
            expect(screen.getByText(/5[.,]000.*Ouro/i)).toBeDefined();
            expect(screen.getByText(/20.*Sucata/i)).toBeDefined();
        });
    });

    describe('Interactive Behavior: Hints, Shortcuts & Minimizing', () => {
        it('should expand and collapse hint when clicking the hint toggle button', () => {
            // Arrange
            const currentTutorialIndex = 0;
            render(
                <NpcTutorialGuide 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={{ gold: 1000 }}
                />
            );

            // Act 1: Initially hint should not be visible
            expect(screen.queryByTestId('npc-hint-box')).toBeNull();

            // Act 2: Click to expand hint
            const toggleButton = screen.getByTestId('toggle-hint-button');
            fireEvent.click(toggleButton);

            // Assert 2
            expect(screen.getByTestId('npc-hint-box')).toBeDefined();
            expect(screen.getByText(/Dica da Aria:/i)).toBeDefined();

            // Act 3: Click again to hide
            fireEvent.click(toggleButton);

            // Assert 3
            expect(screen.queryByTestId('npc-hint-box')).toBeNull();
        });

        it('should trigger onOpenModal with correct modal identifier when clicking action shortcut', () => {
            // Arrange
            const currentTutorialIndex = 0;
            const onOpenModalMock = vi.fn();
            render(
                <NpcTutorialGuide 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={{ gold: 5000 }}
                    onOpenModal={onOpenModalMock}
                />
            );

            // Act
            const actionButton = screen.getByTestId('action-shortcut-button');
            fireEvent.click(actionButton);

            // Assert
            expect(onOpenModalMock).toHaveBeenCalledTimes(1);
            expect(onOpenModalMock).toHaveBeenCalledWith('town');
        });

        it('should toggle between minimized compact pill and expanded view', () => {
            // Arrange
            const currentTutorialIndex = 0;
            render(
                <NpcTutorialGuide 
                    currentTutorialIndex={currentTutorialIndex}
                    gameState={{ gold: 10000 }}
                />
            );

            // Act 1: Click minimize
            const minimizeButton = screen.getByTestId('toggle-minimize-button');
            fireEvent.click(minimizeButton);

            // Assert 1: Minimized container is rendered
            expect(screen.getByTestId('npc-tutorial-minimized')).toBeDefined();
            expect(screen.queryByTestId('npc-tutorial-guide')).toBeNull();

            // Act 2: Click to expand again
            fireEvent.click(screen.getByTestId('npc-tutorial-minimized'));

            // Assert 2: Full guide is back
            expect(screen.getByTestId('npc-tutorial-guide')).toBeDefined();
        });
    });

    describe('Edge Cases & Completion States', () => {
        it('should render celebratory completion banner when index is >= tutorial steps length', () => {
            // Arrange
            const completedIndex = TUTORIAL_STEPS.length;

            // Act
            render(
                <NpcTutorialGuide 
                    currentTutorialIndex={completedIndex}
                />
            );

            // Assert
            expect(screen.getByTestId('npc-tutorial-completed')).toBeDefined();
            expect(screen.getByText(/Diretrizes Iniciais Concluídas/i)).toBeDefined();
            expect(screen.getByText(new RegExp(TUTORIAL_NPC.completedBanner, 'i'))).toBeDefined();
        });

        it('should gracefully handle null/empty gameState without crashing or breaking layout', () => {
            // Arrange & Act
            const { container } = render(
                <NpcTutorialGuide 
                    currentTutorialIndex={0}
                    gameState={null}
                />
            );

            // Assert
            expect(container).toBeDefined();
            expect(screen.getByTestId('npc-tutorial-guide')).toBeDefined();
        });
    });
});
