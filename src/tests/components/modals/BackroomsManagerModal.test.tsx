import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackroomsManagerModal } from '../../../components/modals/BackroomsManagerModal';
import { INITIAL_BACKROOMS_EXPLORERS, INITIAL_BACKROOMS_OUTPOST, INITIAL_BACKROOMS_RESOURCES } from '../../../engine/backrooms';

describe('BackroomsManagerModal Component', () => {
    const mockActions = {
        recruitExplorer: vi.fn(),
        sendExplorer: vi.fn(),
        recallExplorer: vi.fn(),
        restExplorer: vi.fn(),
        useAlmondWater: vi.fn(),
        upgradeOutpost: vi.fn(),
        craftGear: vi.fn(),
        researchTech: vi.fn()
    };

    it('deve renderizar o modal e as abas principais corretamente', () => {
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={INITIAL_BACKROOMS_RESOURCES}
                logs={['Log de teste']}
                unlockedTechs={[]}
                floor={15}
                floorProgress={50}
                bossHp={null}
                actions={mockActions}
            />
        );

        expect(screen.getByText(/Terminal M\.E\.G\. - Posto Avançado/i)).toBeInTheDocument();
        expect(screen.getByText(/\[01\] MONITOR DE ESQUADRÃO/i)).toBeInTheDocument();
        expect(screen.getByText(/\[02\] ÁRVORE TECNOLÓGICA/i)).toBeInTheDocument();
        expect(screen.getByText(/\[03\] MARCOS & SINERGIAS/i)).toBeInTheDocument();
    });

    it('deve alternar para a aba da Árvore Tecnológica e exibir as pesquisas', () => {
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={{ scrap: 100, almondWater: 10, anomalyParts: 5 }}
                logs={[]}
                unlockedTechs={['alchemical_distill']}
                floor={20}
                floorProgress={25}
                bossHp={null}
                actions={mockActions}
            />
        );

        const techTreeTab = screen.getByText(/\[02\] ÁRVORE TECNOLÓGICA/i);
        fireEvent.click(techTreeTab);

        expect(screen.getByText(/M\.E\.G\. Matriz de Pesquisas Tecnológicas/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Destilação Alquímica/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/Terminal Inspetor M\.E\.G\./i)).toBeInTheDocument();
    });

    it('deve alternar para a aba de Marcos & Sinergias e exibir os escalares contínuos', () => {
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={INITIAL_BACKROOMS_RESOURCES}
                logs={[]}
                unlockedTechs={[]}
                floor={35}
                floorProgress={10}
                bossHp={null}
                actions={mockActions}
            />
        );

        const marcosTab = screen.getByText(/\[03\] MARCOS & SINERGIAS/i);
        fireEvent.click(marcosTab);

        expect(screen.getByText(/Escalares Contínuos Globais/i)).toBeInTheDocument();
        expect(screen.getByText(/Sifão Criogênico/i)).toBeInTheDocument();
        expect(screen.getByText(/Injetor de Ocultamento Quântico/i)).toBeInTheDocument();
    });

    it('deve disparar a ação de pesquisa ao clicar no botão do Inspetor', () => {
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={{ scrap: 1000, almondWater: 100, anomalyParts: 50 }}
                logs={[]}
                unlockedTechs={[]}
                floor={20}
                floorProgress={0}
                bossHp={null}
                actions={mockActions}
            />
        );

        // Abrir aba da Tech Tree
        fireEvent.click(screen.getByText(/\[02\] ÁRVORE TECNOLÓGICA/i));

        // Clicar em "Iniciar Pesquisa"
        const researchBtn = screen.getByRole('button', { name: /Iniciar Pesquisa/i });
        fireEvent.click(researchBtn);

        expect(mockActions.researchTech).toHaveBeenCalled();
    });
});
