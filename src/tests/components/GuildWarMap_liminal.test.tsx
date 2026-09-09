import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuildWarMap } from '../../components/modals/GuildWarMap';
import type { Territory } from '../../engine/types';

describe('GuildWarMap - Liminal Rifts & M.E.G. Modules (AAA Pattern)', () => {
    const mockRiftTerritory: Territory = {
        id: 'ter-rift-1',
        name: 'Fenda de Teste',
        description: 'Ponto de colapso dimensional.',
        owner: 'player',
        difficulty: 2500,
        level: 1,
        upgradeCost: 5000,
        bonus: { type: 'gold', value: 0.15 },
        coordinates: { x: 0, y: 0 },
        isLiminalRift: true,
        riftLevel: 2,
        exoticYield: {
            liminalFluid: 4,
            voidAlloy: 2,
            backroomsScrap: 20
        },
        modules: {
            radioTower: 1,
            waterCondenser: 0,
            guardSoldiers: 0
        },
        defenseBonus: 0.15
    };

    const mockStandardTerritory: Territory = {
        id: 'ter-standard',
        name: 'Posto Comum',
        description: 'Território sem anomalias.',
        owner: 'Xang',
        difficulty: 3000,
        level: 1,
        upgradeCost: 5000,
        bonus: { type: 'damage', value: 0.10 },
        coordinates: { x: 5, y: 5 }
    };

    describe('Caminho Feliz: Renderização de Fendas e Módulos M.E.G.', () => {
        it('deve exibir indicador de fenda e rendimentos exóticos ao selecionar território com fenda liminar', () => {
            // Arrange
            const onAttack = vi.fn();
            const onUpgrade = vi.fn();
            const onAdvanceMap = vi.fn();

            // Act
            render(
                <GuildWarMap
                    territories={[mockRiftTerritory]}
                    partyPower={5000}
                    gold={10000}
                    onAttack={onAttack}
                    onUpgrade={onUpgrade}
                    onAdvanceMap={onAdvanceMap}
                    backroomsResources={{ scrap: 50, almondWater: 10, liminalFluid: 5 }}
                />
            );

            // Clica no território para selecioná-lo
            const territoryBtn = screen.getByTitle(/Fenda de Teste/i);
            fireEvent.click(territoryBtn);

            // Assert
            expect(screen.getByText(/Fenda Liminar Ativa/i)).toBeDefined();
            expect(screen.getByText(/Rift Lv.2/i)).toBeDefined();
            expect(screen.getByText('+4')).toBeDefined(); // Fluido/min
            expect(screen.getByText('+2')).toBeDefined(); // Liga Vazio/min
            expect(screen.getByText('+20')).toBeDefined(); // Sucata/min
            expect(screen.getByText(/Bônus M.E.G./i)).toBeDefined();
        });

        it('deve acionar onUpgradeTerritoryModule ao aprimorar a Torre de Rádio com recursos suficientes', () => {
            // Arrange
            const onAttack = vi.fn();
            const onUpgrade = vi.fn();
            const onAdvanceMap = vi.fn();
            const onUpgradeTerritoryModule = vi.fn();

            render(
                <GuildWarMap
                    territories={[mockRiftTerritory]}
                    partyPower={5000}
                    gold={10000}
                    onAttack={onAttack}
                    onUpgrade={onUpgrade}
                    onAdvanceMap={onAdvanceMap}
                    backroomsResources={{ scrap: 100, almondWater: 50, liminalFluid: 10 }}
                    onUpgradeTerritoryModule={onUpgradeTerritoryModule}
                />
            );

            // Act
            fireEvent.click(screen.getByTitle(/Fenda de Teste/i));
            
            // Localiza os botões "Aprimorar" dos módulos
            const upgradeButtons = screen.getAllByRole('button', { name: /Aprimorar/i });
            // O primeiro botão "Aprimorar" dos módulos corresponde à Torre de Rádio
            fireEvent.click(upgradeButtons[0]);

            // Assert
            expect(onUpgradeTerritoryModule).toHaveBeenCalledWith('ter-rift-1', 'radioTower');
        });
    });

    describe('Casos de Borda (Edge Cases & Limites)', () => {
        it('deve desabilitar botões de melhoria M.E.G. quando o jogador não possuir recursos suficientes', () => {
            // Arrange
            const onAttack = vi.fn();
            const onUpgrade = vi.fn();
            const onAdvanceMap = vi.fn();
            const onUpgradeTerritoryModule = vi.fn();

            render(
                <GuildWarMap
                    territories={[mockRiftTerritory]}
                    partyPower={5000}
                    gold={10000}
                    onAttack={onAttack}
                    onUpgrade={onUpgrade}
                    onAdvanceMap={onAdvanceMap}
                    backroomsResources={{ scrap: 0, almondWater: 0, liminalFluid: 0 }} // Pobres em recursos
                    onUpgradeTerritoryModule={onUpgradeTerritoryModule}
                />
            );

            // Act
            fireEvent.click(screen.getByTitle(/Fenda de Teste/i));

            // Assert
            const moduleButtons = screen.getAllByRole('button', { name: /Aprimorar/i });
            moduleButtons.forEach(btn => {
                expect((btn as HTMLButtonElement).disabled).toBe(true);
            });
        });

        it('deve exibir "MAX" e desabilitar botão quando o módulo atingir o nível 5', () => {
            // Arrange
            const maxedTerritory: Territory = {
                ...mockRiftTerritory,
                modules: {
                    radioTower: 5,
                    waterCondenser: 5,
                    guardSoldiers: 5
                }
            };

            render(
                <GuildWarMap
                    territories={[maxedTerritory]}
                    partyPower={5000}
                    gold={10000}
                    onAttack={vi.fn()}
                    onUpgrade={vi.fn()}
                    onAdvanceMap={vi.fn()}
                    backroomsResources={{ scrap: 999, almondWater: 999, liminalFluid: 999 }}
                    onUpgradeTerritoryModule={vi.fn()}
                />
            );

            // Act
            fireEvent.click(screen.getByTitle(/Fenda de Teste/i));

            // Assert
            const maxButtons = screen.getAllByRole('button', { name: 'MAX' });
            expect(maxButtons.length).toBe(3);
            maxButtons.forEach(btn => {
                expect((btn as HTMLButtonElement).disabled).toBe(true);
            });
        });

        it('não deve exibir painel M.E.G. nem fenda quando território não possuir fenda e pertencer ao rival', () => {
            // Arrange
            render(
                <GuildWarMap
                    territories={[mockStandardTerritory]}
                    partyPower={5000}
                    gold={10000}
                    onAttack={vi.fn()}
                    onUpgrade={vi.fn()}
                    onAdvanceMap={vi.fn()}
                    backroomsResources={{ scrap: 100, almondWater: 50 }}
                    onUpgradeTerritoryModule={vi.fn()}
                />
            );

            // Act
            fireEvent.click(screen.getByTitle(/Posto Comum/i));

            // Assert
            expect(screen.queryByText(/Fenda Liminar Ativa/i)).toBeNull();
            expect(screen.queryByText(/Módulos M.E.G. de Fortificação/i)).toBeNull();
            expect(screen.getByRole('button', { name: /SITIAR/i })).toBeDefined();
        });
    });

    describe('Tratamento de Exceções & Valores Nulos', () => {
        it('deve lidar graciosamente quando nenhum território estiver selecionado', () => {
            // Arrange & Act
            render(
                <GuildWarMap
                    territories={[mockRiftTerritory]}
                    partyPower={5000}
                    gold={10000}
                    onAttack={vi.fn()}
                    onUpgrade={vi.fn()}
                    onAdvanceMap={vi.fn()}
                />
            );

            // Assert
            expect(screen.getByText(/Selecione um território no mapa/i)).toBeDefined();
        });

        it('deve renderizar com segurança mesmo se backroomsResources ou onUpgradeTerritoryModule não forem fornecidos', () => {
            // Arrange & Act
            render(
                <GuildWarMap
                    territories={[mockRiftTerritory]}
                    partyPower={5000}
                    gold={10000}
                    onAttack={vi.fn()}
                    onUpgrade={vi.fn()}
                    onAdvanceMap={vi.fn()}
                />
            );

            fireEvent.click(screen.getByTitle(/Fenda de Teste/i));

            // Assert
            expect(screen.getByText(/Fenda Liminar Ativa/i)).toBeDefined();
            // Como onUpgradeTerritoryModule não foi passado, a seção de upgrade não deve quebrar
            expect(screen.queryByText(/Módulos M.E.G. de Fortificação/i)).toBeNull();
        });
    });
});
