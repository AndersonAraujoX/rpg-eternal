import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GlobalDock } from '../../components/common/GlobalDock';

describe('GlobalDock Component - Navigation & QoL (AAA Pattern)', () => {

    it('deve renderizar os botões principais de navegação (Caminho Feliz)', () => {
        // Arrange
        const onOpenMock = vi.fn();

        // Act
        render(
            <GlobalDock
                onOpenModal={onOpenMock}
                towerFloor={12}
                backroomsFloor={5}
                playerTerritoriesCount={3}
                industryMetrics={{ powerGenerated: 100, powerConsumed: 40 }}
            />
        );

        // Assert
        expect(screen.getByTestId('dock-btn-town')).toBeInTheDocument();
        expect(screen.getByTestId('dock-btn-backrooms')).toBeInTheDocument();
        expect(screen.getByTestId('dock-btn-guild-war')).toBeInTheDocument();
        expect(screen.getByTestId('dock-btn-industry')).toBeInTheDocument();
        expect(screen.getByText(/F.12/i)).toBeInTheDocument();
        expect(screen.getByText(/\+60 MW/i)).toBeInTheDocument();
    });

    it('deve disparar onOpenModal ao clicar nos botões de área', () => {
        // Arrange
        const onOpenMock = vi.fn();
        render(<GlobalDock onOpenModal={onOpenMock} />);

        // Act
        fireEvent.click(screen.getByTestId('dock-btn-town'));
        fireEvent.click(screen.getByTestId('dock-btn-backrooms'));
        fireEvent.click(screen.getByTestId('dock-btn-guild-war'));
        fireEvent.click(screen.getByTestId('dock-btn-industry'));

        // Assert
        expect(onOpenMock).toHaveBeenCalledWith('town');
        expect(onOpenMock).toHaveBeenCalledWith('backrooms');
        expect(onOpenMock).toHaveBeenCalledWith('guild_war');
        expect(onOpenMock).toHaveBeenCalledWith('industry');
    });

    it('deve renderizar o botão do Sítio-19 SCP apenas quando desbloqueado', () => {
        // Arrange (Bloqueado)
        const { rerender } = render(
            <GlobalDock onOpenModal={vi.fn()} isScpUnlocked={false} />
        );

        // Assert 1: Não deve existir
        expect(screen.queryByTestId('dock-btn-scp')).not.toBeInTheDocument();

        // Act: Desbloquear
        rerender(
            <GlobalDock onOpenModal={vi.fn()} isScpUnlocked={true} scpActiveBreach={false} />
        );

        // Assert 2: Deve existir
        expect(screen.getByTestId('dock-btn-scp')).toBeInTheDocument();
        expect(screen.getByText(/SEGURO/i)).toBeInTheDocument();
    });

    it('deve exibir badge de alerta e animação de brecha quando houver alarme SCP', () => {
        // Arrange & Act
        render(
            <GlobalDock onOpenModal={vi.fn()} isScpUnlocked={true} scpActiveBreach={true} />
        );

        // Assert
        expect(screen.getByText(/BRECHA/i)).toBeInTheDocument();
    });

    it('deve alternar a visibilidade da barra ao clicar no botão de recolher', () => {
        // Arrange
        render(<GlobalDock onOpenModal={vi.fn()} />);

        // Act 1: Recolher
        const toggleBtn = screen.getByTestId('global-dock-toggle-btn');
        fireEvent.click(toggleBtn);

        // Assert 1: Botões internos recolhidos
        expect(screen.queryByTestId('dock-btn-town')).not.toBeInTheDocument();

        // Act 2: Expandir novamente
        fireEvent.click(toggleBtn);

        // Assert 2: Visível novamente
        expect(screen.getByTestId('dock-btn-town')).toBeInTheDocument();
    });

    it('deve disparar onQuickAction ao clicar nos botões de ação rápida', () => {
        // Arrange
        const quickActionMock = vi.fn();
        render(
            <GlobalDock
                onOpenModal={vi.fn()}
                onQuickAction={quickActionMock}
            />
        );

        // Act
        fireEvent.click(screen.getByTestId('dock-quick-claim-btn'));
        fireEvent.click(screen.getByTestId('dock-quick-autoequip-btn'));
        fireEvent.click(screen.getByTestId('dock-quick-sanity-btn'));

        // Assert
        expect(quickActionMock).toHaveBeenCalledWith('claim_tributes');
        expect(quickActionMock).toHaveBeenCalledWith('auto_equip');
        expect(quickActionMock).toHaveBeenCalledWith('quick_sanity');
    });

    it('deve disparar onToggleAria ao clicar no botão de guia da Aria', () => {
        // Arrange
        const toggleAriaMock = vi.fn();
        render(
            <GlobalDock
                onOpenModal={vi.fn()}
                isAriaOpen={false}
                onToggleAria={toggleAriaMock}
            />
        );

        // Act
        fireEvent.click(screen.getByTestId('dock-btn-aria'));

        // Assert
        expect(toggleAriaMock).toHaveBeenCalledWith(true);
    });
});
