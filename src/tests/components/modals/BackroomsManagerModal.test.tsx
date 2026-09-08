import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackroomsManagerModal } from '../../../components/modals/BackroomsManagerModal';
import { INITIAL_BACKROOMS_EXPLORERS, INITIAL_BACKROOMS_OUTPOST, INITIAL_BACKROOMS_RESOURCES, NoclipEvent } from '../../../engine/backrooms';

describe('BackroomsManagerModal Component (M.E.G. V2.0)', () => {
    const mockActions = {
        recruitExplorer: vi.fn(),
        sendExplorer: vi.fn(),
        recallExplorer: vi.fn(),
        restExplorer: vi.fn(),
        useAlmondWater: vi.fn(),
        upgradeOutpost: vi.fn(),
        craftGear: vi.fn(),
        researchTech: vi.fn(),
        captureEntity: vi.fn(),
        resolveNoclip: vi.fn(),
        upgradeSectorModule: vi.fn(),
        sealDimensionalRift: vi.fn(),
        unlockExplorerTalent: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve renderizar o modal e todas as abas principais de operações (Caminho Feliz)', () => {
        // Arrange & Act
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

        // Assert
        expect(screen.getByText(/Terminal M\.E\.G\. V2\.0/i)).toBeInTheDocument();
        expect(screen.getByText(/\[01\] ESQUADRÃO/i)).toBeInTheDocument();
        expect(screen.getByText(/\[02\] BESTIÁRIO/i)).toBeInTheDocument();
        expect(screen.getByText(/\[03\] FORTIFICAÇÕES/i)).toBeInTheDocument();
        expect(screen.getByText(/\[04\] SALAS SECRETAS/i)).toBeInTheDocument();
        expect(screen.getByText(/\[05\] FENDAS & VILA/i)).toBeInTheDocument();
        expect(screen.getByText(/\[06\] TECH TREE/i)).toBeInTheDocument();
        expect(screen.getByText(/\[07\] MARCOS/i)).toBeInTheDocument();
    });

    it('deve alternar para a aba do Bestiário e disparar ação de conter entidade (Pilar 1)', () => {
        // Arrange
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={{ scrap: 100, almondWater: 10, anomalyParts: 10 }}
                logs={[]}
                unlockedTechs={[]}
                floor={5}
                floorProgress={10}
                bossHp={null}
                actions={mockActions}
            />
        );

        // Act
        const bestiaryTab = screen.getByText(/\[02\] BESTIÁRIO/i);
        fireEvent.click(bestiaryTab);

        // Assert
        expect(screen.getByText(/Câmaras de Contenção & Bestiário M\.E\.G\./i)).toBeInTheDocument();
        expect(screen.getAllByText(/Smiler/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/Deathmoth/i).length).toBeGreaterThanOrEqual(1);

        // Clicar em conter entidade
        const captureButtons = screen.getAllByRole('button', { name: /Conter Entidade/i });
        expect(captureButtons.length).toBeGreaterThan(0);
        fireEvent.click(captureButtons[0]);

        expect(mockActions.captureEntity).toHaveBeenCalled();
    });

    it('deve alternar para a aba de Fortificações e exibir módulos de setor (Pilar 3)', () => {
        // Arrange
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={{ scrap: 200, almondWater: 20, anomalyParts: 10 }}
                logs={[]}
                floor={10}
                floorProgress={50}
                bossHp={null}
                sectorModules={{
                    sec_1: { radioTower: 1, waterCondenser: 1, scrapBeacon: 1 }
                }}
                actions={mockActions}
            />
        );

        // Act
        fireEvent.click(screen.getByText(/\[03\] FORTIFICAÇÕES/i));

        // Assert
        expect(screen.getByText(/Fortificação & Conquista de Setores/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Rádio SOS/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Condensador/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Baliza/i).length).toBeGreaterThan(0);
    });

    it('deve exibir banner de alerta de Noclip ativo e permitir entrar na sala secreta (Pilar 2)', () => {
        // Arrange
        const noclipEvent: NoclipEvent = {
            id: 'noclip_alert_test',
            secretLevelId: 'poolrooms',
            timestamp: Date.now()
        };

        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={INITIAL_BACKROOMS_RESOURCES}
                logs={[]}
                floor={12}
                floorProgress={80}
                bossHp={null}
                activeNoclipEvent={noclipEvent}
                actions={mockActions}
            />
        );

        // Assert banner presence
        expect(screen.getByText(/EVENTO DE NOCLIP EM ANDAMENTO/i)).toBeInTheDocument();
        expect(screen.getByText(/The Poolrooms/i)).toBeInTheDocument();

        // Act: click enter
        const enterBtn = screen.getByRole('button', { name: /Entrar na Sala Secreta/i });
        fireEvent.click(enterBtn);

        expect(mockActions.resolveNoclip).toHaveBeenCalledWith('enter');
    });

    it('deve exibir alerta crítico e ações de selamento quando a instabilidade for >= 80% (Pilar 5)', () => {
        // Arrange
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={{ scrap: 100, almondWater: 5, anomalyParts: 0 }}
                logs={[]}
                floor={20}
                floorProgress={30}
                bossHp={null}
                dimensionalInstability={88} // Crítico
                actions={mockActions}
            />
        );

        // Assert warning banner
        expect(screen.getByText(/INVASÃO DE FENDA NA VILA IMINENTE/i)).toBeInTheDocument();

        // Act: click scrap anchor
        const anchorBtn = screen.getByRole('button', { name: /Âncora de Sucata/i });
        fireEvent.click(anchorBtn);

        expect(mockActions.sealDimensionalRift).toHaveBeenCalledWith('scrap');
    });

    it('deve expandir a seção de talentos do explorador ao clicar em Talentos (Pilar 6)', () => {
        // Arrange
        render(
            <BackroomsManagerModal
                isOpen={true}
                onClose={() => {}}
                explorers={INITIAL_BACKROOMS_EXPLORERS}
                outpost={INITIAL_BACKROOMS_OUTPOST}
                resources={INITIAL_BACKROOMS_RESOURCES}
                logs={[]}
                floor={10}
                floorProgress={0}
                bossHp={null}
                actions={mockActions}
            />
        );

        // Act: clicar no botão de Talentos do primeiro explorador
        const talentButtons = screen.getAllByRole('button', { name: /Talentos/i });
        expect(talentButtons.length).toBeGreaterThan(0);
        fireEvent.click(talentButtons[0]);

        // Assert: gaveta de talentos expandida
        expect(screen.getByText(/Árvore de Especialização/i)).toBeInTheDocument();
    });

    it('deve alternar para a aba da Árvore Tecnológica e disparar pesquisa (Tech Tree)', () => {
        // Arrange
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
                floorProgress={25}
                bossHp={null}
                actions={mockActions}
            />
        );

        // Act
        const techTreeTab = screen.getByText(/\[06\] TECH TREE/i);
        fireEvent.click(techTreeTab);

        // Assert
        expect(screen.getByText(/M\.E\.G\. Matriz de Pesquisas Tecnológicas/i)).toBeInTheDocument();
        const researchBtn = screen.getByRole('button', { name: /Iniciar Pesquisa/i });
        fireEvent.click(researchBtn);

        expect(mockActions.researchTech).toHaveBeenCalled();
    });

    it('deve alternar para a aba de Marcos e exibir escalares globais (Marcos)', () => {
        // Arrange
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

        // Act
        const marcosTab = screen.getByText(/\[07\] MARCOS/i);
        fireEvent.click(marcosTab);

        // Assert
        expect(screen.getByText(/Escalares Contínuos Globais/i)).toBeInTheDocument();
        expect(screen.getByText(/Sifão Criogênico/i)).toBeInTheDocument();
    });
});
