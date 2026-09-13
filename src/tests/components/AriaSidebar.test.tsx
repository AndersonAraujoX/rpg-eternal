import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AriaSidebar } from '../../components/AriaSidebar';
import { TUTORIAL_STEPS } from '../../data/npcTutorial';

describe('AriaSidebar Component (AAA Pattern)', () => {
    describe('Happy Path: Trigger and Drawer Rendering', () => {
        it('should render collapsed side trigger on the screen with Aria avatar and label', () => {
            // Arrange & Act
            render(<AriaSidebar currentTutorialIndex={0} gameState={{ gold: 5000 }} />);

            // Assert
            const trigger = screen.getByTestId('aria-sidebar-trigger');
            expect(trigger).toBeDefined();
            expect(screen.getByText(/Próximos Passos/i)).toBeDefined();
            expect(trigger.getAttribute('aria-expanded')).toBe('false');
        });

        it('should open the drawer when clicking the side trigger', () => {
            // Arrange
            render(<AriaSidebar currentTutorialIndex={0} gameState={{ gold: 5000 }} />);
            const trigger = screen.getByTestId('aria-sidebar-trigger');

            // Act
            fireEvent.click(trigger);

            // Assert
            const drawer = screen.getByTestId('aria-sidebar-drawer');
            expect(drawer.classList.contains('translate-x-0')).toBe(true);
            expect(screen.getByText(/Aria, a Guia/i)).toBeDefined();
            expect(screen.getByText(/Orientação Estratégica da Aria/i)).toBeDefined();
        });

        it('should display the active tutorial objective with progress and rewards when step is active', () => {
            // Arrange
            const step = TUTORIAL_STEPS[0];
            render(
                <AriaSidebar 
                    currentTutorialIndex={0} 
                    isOpen={true} 
                    gameState={{ gold: 20000, buildings: [] }} 
                />
            );

            // Assert
            expect(screen.getByText(/Objetivo Prioritário/i)).toBeDefined();
            expect(screen.getByText(step.objectiveDescription)).toBeDefined();
            expect(screen.getByText(/20[.,]000 \/ 40[.,]000 Ouro/i)).toBeDefined();
            expect(screen.getByTestId('aria-primary-action-button')).toBeDefined();
        });

        it('should display upcoming milestone and Aria advice', () => {
            // Arrange: Player on floor 1 (milestone: Town)
            render(
                <AriaSidebar 
                    currentTutorialIndex={0} 
                    isOpen={true} 
                    gameState={{ highestFloor: 1, bossLevel: 1 }} 
                />
            );

            // Assert
            expect(screen.getByText(/Próximo Modo a Desbloquear/i)).toBeDefined();
            expect(screen.getAllByText(/Vila da Aliança/i).length).toBeGreaterThan(0);
            expect(screen.getByText(/Conselho da Aria:/i)).toBeDefined();
        });

        it('should display tactical checklist actions', () => {
            // Arrange
            render(
                <AriaSidebar 
                    currentTutorialIndex={0} 
                    isOpen={true} 
                    gameState={{
                        highestFloor: 3,
                        resources: { copper: 30, iron: 15 }
                    }} 
                />
            );

            // Assert
            expect(screen.getByText(/Ações Recomendadas Agora/i)).toBeDefined();
            expect(screen.getByText(/Subir a Torre da Eternidade/i)).toBeDefined();
            expect(screen.getByText(/Aprimorar Armas na Forja/i)).toBeDefined();
        });
    });

    describe('Interactive Behavior: Actions & Light Dismiss', () => {
        it('should trigger onOpenModal when clicking the primary action button', () => {
            // Arrange
            const handleOpenModal = vi.fn();
            render(
                <AriaSidebar 
                    currentTutorialIndex={0} 
                    isOpen={true} 
                    gameState={{ gold: 1000 }} 
                    onOpenModal={handleOpenModal}
                />
            );

            // Act
            const actionBtn = screen.getByTestId('aria-primary-action-button');
            fireEvent.click(actionBtn);

            // Assert
            expect(handleOpenModal).toHaveBeenCalledWith('town');
        });

        it('should trigger onOpenModal when clicking quick shortcut buttons', () => {
            // Arrange
            const handleOpenModal = vi.fn();
            render(
                <AriaSidebar 
                    currentTutorialIndex={0} 
                    isOpen={true} 
                    gameState={{ gold: 1000 }} 
                    onOpenModal={handleOpenModal}
                />
            );

            // Act
            const towerShortcut = screen.getByText('Torre');
            fireEvent.click(towerShortcut);

            // Assert
            expect(handleOpenModal).toHaveBeenCalledWith('tower');
        });

        it('should close the drawer when clicking the close button', () => {
            // Arrange
            render(<AriaSidebar currentTutorialIndex={0} gameState={{ gold: 1000 }} />);
            const trigger = screen.getByTestId('aria-sidebar-trigger');
            fireEvent.click(trigger);

            const drawer = screen.getByTestId('aria-sidebar-drawer');
            expect(drawer.classList.contains('translate-x-0')).toBe(true);

            // Act
            const closeBtn = screen.getByTestId('aria-sidebar-close');
            fireEvent.click(closeBtn);

            // Assert
            expect(drawer.classList.contains('translate-x-full')).toBe(true);
        });

        it('should close the drawer when clicking the backdrop', () => {
            // Arrange
            render(<AriaSidebar currentTutorialIndex={0} gameState={{ gold: 1000 }} />);
            const trigger = screen.getByTestId('aria-sidebar-trigger');
            fireEvent.click(trigger);

            const backdrop = screen.getByTestId('aria-sidebar-backdrop');

            // Act
            fireEvent.click(backdrop);

            // Assert
            const drawer = screen.getByTestId('aria-sidebar-drawer');
            expect(drawer.classList.contains('translate-x-full')).toBe(true);
        });

        it('should close the drawer when pressing Escape key', () => {
            // Arrange
            render(<AriaSidebar currentTutorialIndex={0} gameState={{ gold: 1000 }} />);
            const trigger = screen.getByTestId('aria-sidebar-trigger');
            fireEvent.click(trigger);

            const drawer = screen.getByTestId('aria-sidebar-drawer');
            expect(drawer.classList.contains('translate-x-0')).toBe(true);

            // Act
            fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

            // Assert
            expect(drawer.classList.contains('translate-x-full')).toBe(true);
        });

        it('should support controlled mode with isOpen and onToggle', () => {
            // Arrange
            const handleToggle = vi.fn();
            const { rerender } = render(
                <AriaSidebar 
                    currentTutorialIndex={0} 
                    isOpen={false} 
                    onToggle={handleToggle} 
                />
            );

            // Act 1
            const trigger = screen.getByTestId('aria-sidebar-trigger');
            fireEvent.click(trigger);

            // Assert 1
            expect(handleToggle).toHaveBeenCalledWith(true);

            // Act 2: rerender with isOpen=true
            rerender(
                <AriaSidebar 
                    currentTutorialIndex={0} 
                    isOpen={true} 
                    onToggle={handleToggle} 
                />
            );
            const closeBtn = screen.getByTestId('aria-sidebar-close');
            fireEvent.click(closeBtn);

            // Assert 2
            expect(handleToggle).toHaveBeenCalledWith(false);
        });
    });

    describe('Edge Cases & Defensive Rendering', () => {
        it('should render gracefully without errors when gameState is empty or undefined', () => {
            // Arrange & Act
            render(<AriaSidebar currentTutorialIndex={0} isOpen={true} gameState={undefined} />);

            // Assert
            expect(screen.getByText(/Aria, a Guia/i)).toBeDefined();
            expect(screen.getByTestId('aria-sidebar-drawer')).toBeDefined();
        });

        it('should render gracefully when tutorial index is completed beyond steps length', () => {
            // Arrange & Act
            render(<AriaSidebar currentTutorialIndex={999} isOpen={true} gameState={{ highestFloor: 50 }} />);

            // Assert
            expect(screen.getByText(/Objetivo Prioritário/i)).toBeDefined();
            expect(screen.getByTestId('aria-primary-action-button')).toBeDefined();
        });

        it('should render Journey milestone card and navigate to target modal when clicked', () => {
            // Arrange
            const onOpenModalMock = vi.fn();
            render(
                <AriaSidebar
                    currentTutorialIndex={0}
                    isOpen={true}
                    gameState={{ highestFloor: 2 }}
                    onOpenModal={onOpenModalMock}
                />
            );

            // Assert & Act
            expect(screen.getByTestId('aria-journey-card')).toBeInTheDocument();
            expect(screen.getByText(/Jornada: Passo 1 de 7/i)).toBeInTheDocument();
            
            const journeyBtn = screen.getByTestId('aria-journey-action-btn');
            fireEvent.click(journeyBtn);

            expect(onOpenModalMock).toHaveBeenCalledWith('tower');
        });

        it('should render Bottlenecks radar alert when power deficit is detected', () => {
            // Arrange
            const onOpenModalMock = vi.fn();
            const crisisState = {
                highestFloor: 15,
                industryMetrics: { powerGenerated: 10, powerConsumed: 80 }
            };

            // Act
            render(
                <AriaSidebar
                    currentTutorialIndex={0}
                    isOpen={true}
                    gameState={crisisState}
                    onOpenModal={onOpenModalMock}
                />
            );

            // Assert
            expect(screen.getByTestId('aria-bottlenecks-container')).toBeInTheDocument();
            expect(screen.getByText(/Déficit Elétrico Industrial/i)).toBeInTheDocument();
        });
    });
});
