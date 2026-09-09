import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IndustryModal } from '../../components/modals/IndustryModal';
import { INITIAL_SCP_STATE, INITIAL_SCP_ANOMALIES } from '../../engine/scpFoundation';

describe('IndustryModal - SCP Site-19 Expansion (AAA Pattern)', () => {
    const mockHeroes = [
        { id: 'hero-1', name: 'Valerius', class: 'Warrior' },
        { id: 'hero-2', name: 'Lyra', class: 'Mage' }
    ];

    const baseIndustryState = {
        inventory: { gold: 1000, iron_ingot: 10, steel_plate: 20, basic_circuit: 5 },
        nodes: [{ id: 'n1', machineId: 'assembler_1', recipeId: 'r1', count: 1 }],
        unlockedTechs: ['tech_automation_1'],
        metrics: {
            powerGenerated: 100,
            powerConsumed: 40,
            powerEfficiency: 1.0,
            flowPerSecond: {},
            labsActiveCount: 1
        },
        addNode: vi.fn(),
        removeNode: vi.fn(),
        updateNode: vi.fn(),
        startResearch: vi.fn(),
        buildRocketPart: vi.fn(),
        launchRocket: vi.fn(() => false),
        setBeltTier: vi.fn(),
        setInserterTier: vi.fn(),
        toggleScpChamber: vi.fn(),
        assignHeroToScp: vi.fn(),
        executeScp914: vi.fn(() => ({
            success: true,
            mode: 'Fine',
            inputItemId: 'iron_ingot',
            outputItemId: 'steel_plate',
            outputItemName: 'Placa de Aço',
            outputAmount: 1,
            message: 'Evoluído para Placa de Aço!'
        })),
        respondToBreach: vi.fn(() => ({
            success: true,
            message: 'Comportas pneumáticas seladas!'
        })),
        unlockScpSite: vi.fn(),
        scpFoundation: {
            ...INITIAL_SCP_STATE,
            unlocked: true
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // 1. Desbloqueio e Acesso da Aba
    // ═══════════════════════════════════════════════════════════════
    it('deve desabilitar o botão da aba SCP se a indústria estiver vazia e sem pesquisas', () => {
        // Arrange
        const lockedIndustryState = {
            ...baseIndustryState,
            nodes: [],
            unlockedTechs: [],
            scpFoundation: {
                ...INITIAL_SCP_STATE,
                unlocked: false
            }
        };

        // Act
        render(
            <IndustryModal
                isOpen={true}
                onClose={vi.fn()}
                industryState={lockedIndustryState as any}
                gold={500}
                buyMachine={vi.fn()}
                backroomsFloor={1}
            />
        );

        // Assert
        const scpTabBtn = screen.getByTestId('industry-scp-tab-btn');
        expect(scpTabBtn).toBeDisabled();
    });

    it('deve habilitar o botão da aba SCP quando a indústria estiver operacional', () => {
        // Arrange & Act
        render(
            <IndustryModal
                isOpen={true}
                onClose={vi.fn()}
                industryState={baseIndustryState as any}
                gold={500}
                buyMachine={vi.fn()}
            />
        );

        // Assert
        const scpTabBtn = screen.getByTestId('industry-scp-tab-btn');
        expect(scpTabBtn).not.toBeDisabled();
    });

    it('deve alternar para a visualização do Sítio-19 ao clicar na aba', () => {
        // Arrange
        render(
            <IndustryModal
                isOpen={true}
                onClose={vi.fn()}
                industryState={baseIndustryState as any}
                gold={500}
                buyMachine={vi.fn()}
                heroes={mockHeroes}
            />
        );

        // Act
        const scpTabBtn = screen.getByTestId('industry-scp-tab-btn');
        fireEvent.click(scpTabBtn);

        // Assert
        expect(screen.getByText(/SÍTIO-19 • INSTALAÇÃO SUBTERRÂNEA SCP/i)).toBeInTheDocument();
        expect(screen.getAllByText(/SCP-999/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/SCP-173/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/SCP-682/i).length).toBeGreaterThan(0);
    });

    // ═══════════════════════════════════════════════════════════════
    // 2. Câmaras de Contenção & Atribuição MTF
    // ═══════════════════════════════════════════════════════════════
    it('deve acionar toggleScpChamber ao clicar no botão de ativar/desligar câmara', () => {
        // Arrange
        const toggleMock = vi.fn();
        const customState = {
            ...baseIndustryState,
            toggleScpChamber: toggleMock
        };

        render(
            <IndustryModal
                isOpen={true}
                onClose={vi.fn()}
                industryState={customState as any}
                gold={500}
                buyMachine={vi.fn()}
            />
        );

        // Act
        fireEvent.click(screen.getByTestId('industry-scp-tab-btn'));
        const toggleButtons = screen.getAllByRole('button', { name: /ATIVAR CONTENÇÃO|DESLIGAR CÂMARA/i });
        fireEvent.click(toggleButtons[0]);

        // Assert
        expect(toggleMock).toHaveBeenCalled();
    });

    it('deve disparar assignHeroToScp ao selecionar um herói como oficial MTF', () => {
        // Arrange
        const assignMock = vi.fn();
        const customState = {
            ...baseIndustryState,
            assignHeroToScp: assignMock
        };

        render(
            <IndustryModal
                isOpen={true}
                onClose={vi.fn()}
                industryState={customState as any}
                gold={500}
                buyMachine={vi.fn()}
                heroes={mockHeroes}
            />
        );

        // Act
        fireEvent.click(screen.getByTestId('industry-scp-tab-btn'));
        const dropdowns = screen.getAllByRole('combobox');
        // Primeiro dropdown de herói MTF
        fireEvent.change(dropdowns[0], { target: { value: 'hero-1' } });

        // Assert
        expect(assignMock).toHaveBeenCalledWith(expect.any(String), 'hero-1');
    });

    // ═══════════════════════════════════════════════════════════════
    // 3. Estação SCP-914 (The Clockworks)
    // ═══════════════════════════════════════════════════════════════
    it('deve acionar executeScp914 com o modo e item selecionados ao clicar em girar a chave', () => {
        // Arrange
        const scp914Mock = vi.fn(() => ({
            success: true,
            mode: 'Rough' as const,
            inputItemId: 'iron_ingot',
            message: 'Triturado em minérios!'
        }));

        const customState = {
            ...baseIndustryState,
            executeScp914: scp914Mock
        };

        render(
            <IndustryModal
                isOpen={true}
                onClose={vi.fn()}
                industryState={customState as any}
                gold={500}
                buyMachine={vi.fn()}
            />
        );

        // Act
        fireEvent.click(screen.getByTestId('industry-scp-tab-btn'));
        fireEvent.click(screen.getByTestId('scp914-mode-rough'));
        fireEvent.click(screen.getByTestId('scp914-transmute-btn'));

        // Assert
        expect(scp914Mock).toHaveBeenCalledWith('iron_ingot', 'Rough');
        expect(screen.getByText(/Triturado em minérios!/i)).toBeInTheDocument();
    });

    // ═══════════════════════════════════════════════════════════════
    // 4. Banner de Brecha de Contenção
    // ═══════════════════════════════════════════════════════════════
    it('deve exibir o banner de alarme vermelho quando houver brecha ativa e permitir conter via comportas', () => {
        // Arrange
        const breachMock = vi.fn(() => ({
            success: true,
            message: 'Ala selada com sucesso!'
        }));

        const breachState = {
            ...baseIndustryState,
            respondToBreach: breachMock,
            scpFoundation: {
                ...INITIAL_SCP_STATE,
                unlocked: true,
                activeBreach: {
                    active: true,
                    anomalyId: 'scp_173',
                    timer: 28,
                    maxTimer: 30,
                    penaltyDescription: 'A Estátua escapou!'
                }
            }
        };

        render(
            <IndustryModal
                isOpen={true}
                onClose={vi.fn()}
                industryState={breachState as any}
                gold={500}
                buyMachine={vi.fn()}
            />
        );

        // Act
        fireEvent.click(screen.getByTestId('industry-scp-tab-btn'));

        // Assert
        expect(screen.getByText(/ALARME CÓDIGO VERMELHO/i)).toBeInTheDocument();
        expect(screen.getByText(/A Estátua escapou!/i)).toBeInTheDocument();

        // Clica nas comportas pneumáticas
        const blastDoorsBtn = screen.getByTestId('breach-blast-doors-btn');
        fireEvent.click(blastDoorsBtn);

        expect(breachMock).toHaveBeenCalledWith('scp_173', 'blast_doors', expect.any(Number));
        expect(screen.getByText(/Ala selada com sucesso!/i)).toBeInTheDocument();
    });
});
