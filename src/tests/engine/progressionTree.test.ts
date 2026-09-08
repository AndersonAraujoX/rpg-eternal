import { describe, it, expect } from 'vitest';
import {
    PROGRESSION_NODES,
    evaluateProgressionNode,
    evaluateProgressionTree,
    getBranchNodes,
    getProgressionNodeById,
    type ProgressionGameState,
    type ProgressionNode
} from '../../engine/progressionTree';

describe('ProgressionTree Engine (Esquema de Progressão)', () => {
    // =========================================================================
    // LINHA SUPERIOR (FLUXO PRINCIPAL): Torre infinita → Vila → Boss mundial
    // =========================================================================
    describe('Linha Superior (Fluxo Principal)', () => {
        it('deve manter a Torre Infinita sempre desbloqueada no início (Caminho Feliz)', () => {
            // Arrange
            const node = getProgressionNodeById('tower');
            const state: ProgressionGameState = {
                highestFloor: 1,
                bossLevel: 0,
                buildings: []
            };

            // Act
            const evaluated = evaluateProgressionNode(node!, state);

            // Assert
            expect(evaluated.id).toBe('tower');
            expect(evaluated.isUnlocked).toBe(true);
            expect(evaluated.status).toBe('unlocked');
            expect(evaluated.progress.current).toBe(1);
            expect(evaluated.progress.percentage).toBe(100);
        });

        it('deve desbloquear a Vila quando atingir o Andar 10 na Torre ou Chefe Nv. 10', () => {
            // Arrange
            const node = getProgressionNodeById('town');
            const lockedState: ProgressionGameState = { highestFloor: 5, bossLevel: 2 };
            const unlockedByFloorState: ProgressionGameState = { highestFloor: 10, bossLevel: 2 };
            const unlockedByBossState: ProgressionGameState = { highestFloor: 1, bossLevel: 10 };

            // Act & Assert
            expect(evaluateProgressionNode(node!, lockedState).isUnlocked).toBe(false);
            expect(evaluateProgressionNode(node!, lockedState).status).toBe('in_progress');

            expect(evaluateProgressionNode(node!, unlockedByFloorState).isUnlocked).toBe(true);
            expect(evaluateProgressionNode(node!, unlockedByFloorState).status).toBe('unlocked');

            expect(evaluateProgressionNode(node!, unlockedByBossState).isUnlocked).toBe(true);
            expect(evaluateProgressionNode(node!, unlockedByBossState).status).toBe('unlocked');
        });

        it('deve desbloquear o Boss Mundial apenas após a Vila e atingir Chefe Nv. 150', () => {
            // Arrange
            const node = getProgressionNodeById('world_boss');
            const stateTownLocked: ProgressionGameState = { highestFloor: 5, bossLevel: 160 };
            const stateBossLow: ProgressionGameState = { highestFloor: 50, bossLevel: 100 };
            const stateEligible: ProgressionGameState = { highestFloor: 50, bossLevel: 150 };

            // Act & Assert
            // Sem vila desbloqueada, world_boss não pode ser liberado
            expect(evaluateProgressionNode(node!, stateTownLocked).isUnlocked).toBe(true); // bossLevel 160 also unlocks town (>10)
            
            // Vila liberada mas chefe menor que 150
            const stateVillageOnly: ProgressionGameState = { highestFloor: 10, bossLevel: 50 };
            const evalLow = evaluateProgressionNode(node!, stateVillageOnly);
            expect(evalLow.isUnlocked).toBe(false);
            expect(evalLow.isParentUnlocked).toBe(true);
            expect(evalLow.status).toBe('in_progress');

            // Vila liberada e chefe 150
            const evalUnlocked = evaluateProgressionNode(node!, stateEligible);
            expect(evalUnlocked.isUnlocked).toBe(true);
            expect(evalUnlocked.status).toBe('unlocked');
        });
    });

    // =========================================================================
    // RAMIFICAÇÃO ESQUERDA: Vila → Guildas → GVG & Conquista do andar
    // =========================================================================
    describe('Ramificação Esquerda (a partir de Vila)', () => {
        it('deve bloquear Guildas se a Vila estiver bloqueada', () => {
            // Arrange
            const guildNode = getProgressionNodeById('guilds')!;
            const stateWithoutTown: ProgressionGameState = {
                highestFloor: 2,
                bossLevel: 1,
                buildings: [{ id: 'guild_hall', level: 1, cost: 100, effectValue: 1, emoji: '🏰', maxLevel: 5, name: 'Sede' }]
            };

            // Act
            const evaluated = evaluateProgressionNode(guildNode, stateWithoutTown);

            // Assert
            expect(evaluated.isUnlocked).toBe(false);
            expect(evaluated.isParentUnlocked).toBe(false);
            expect(evaluated.status).toBe('locked');
        });

        it('deve desbloquear Guildas quando Vila estiver ativa e tiver Salão ou Andar 80', () => {
            // Arrange
            const guildNode = getProgressionNodeById('guilds')!;
            const stateUnlockedByFloor: ProgressionGameState = {
                highestFloor: 80,
                bossLevel: 10
            };
            const stateUnlockedByBuilding: ProgressionGameState = {
                highestFloor: 15,
                bossLevel: 10,
                buildings: [{ id: 'guild_hall', level: 1, cost: 100, effectValue: 1, emoji: '🏰', maxLevel: 5, name: 'Sede' }]
            };

            // Act & Assert
            expect(evaluateProgressionNode(guildNode, stateUnlockedByFloor).isUnlocked).toBe(true);
            expect(evaluateProgressionNode(guildNode, stateUnlockedByBuilding).isUnlocked).toBe(true);
        });

        it('deve desbloquear GVG e Conquista do Andar como filhos diretos de Guildas', () => {
            // Arrange
            const gvgNode = getProgressionNodeById('gvg')!;
            const conquestNode = getProgressionNodeById('guild_conquest')!;

            const stateGuildsLocked: ProgressionGameState = { highestFloor: 20, bossLevel: 10 };
            const stateGuildsUnlocked: ProgressionGameState = {
                highestFloor: 85,
                bossLevel: 20,
                hasGuild: true,
                playerTerritoriesCount: 3
            };

            // Act
            const evalGvgLocked = evaluateProgressionNode(gvgNode, stateGuildsLocked);
            const evalConquestLocked = evaluateProgressionNode(conquestNode, stateGuildsLocked);

            const evalGvgUnlocked = evaluateProgressionNode(gvgNode, stateGuildsUnlocked);
            const evalConquestUnlocked = evaluateProgressionNode(conquestNode, stateGuildsUnlocked);

            // Assert
            expect(evalGvgLocked.isUnlocked).toBe(false);
            expect(evalConquestLocked.isUnlocked).toBe(false);

            expect(evalGvgUnlocked.isUnlocked).toBe(true);
            expect(evalConquestUnlocked.isUnlocked).toBe(true);
            expect(evalConquestUnlocked.progress.current).toBe(3);
            expect(evalConquestUnlocked.progress.percentage).toBe(60);
        });
    });

    // =========================================================================
    // RAMIFICAÇÃO DIREITA: Vila → Backroom → Conquista do andar & Tecnologia → Indústria → Galáxia
    // =========================================================================
    describe('Ramificação Direita (a partir de Vila)', () => {
        it('deve bloquear Backroom se a Vila estiver bloqueada', () => {
            // Arrange
            const backroomNode = getProgressionNodeById('backroom')!;
            const stateWithoutTown: ProgressionGameState = {
                highestFloor: 5,
                bossLevel: 5
            };

            // Act
            const evaluated = evaluateProgressionNode(backroomNode, stateWithoutTown);

            // Assert
            expect(evaluated.isUnlocked).toBe(false);
            expect(evaluated.isParentUnlocked).toBe(false);
            expect(evaluated.status).toBe('locked');
        });

        it('deve desbloquear Backroom quando Vila estiver ativa e Chefe Nv. 30 ou Posto M.E.G.', () => {
            // Arrange
            const backroomNode = getProgressionNodeById('backroom')!;
            const stateByBoss: ProgressionGameState = {
                highestFloor: 20,
                bossLevel: 30
            };
            const stateByBuilding: ProgressionGameState = {
                highestFloor: 20,
                bossLevel: 15,
                buildings: [{ id: 'backrooms_manager', level: 1, cost: 50, effectValue: 1, emoji: '🏢', maxLevel: 5, name: 'MEG' }]
            };

            // Act & Assert
            expect(evaluateProgressionNode(backroomNode, stateByBoss).isUnlocked).toBe(true);
            expect(evaluateProgressionNode(backroomNode, stateByBuilding).isUnlocked).toBe(true);
        });

        it('deve desbloquear Conquista do Andar (Backrooms) e Tecnologia M.E.G. como filhas de Backroom', () => {
            // Arrange
            const conquestNode = getProgressionNodeById('backrooms_conquest')!;
            const techNode = getProgressionNodeById('backrooms_tech')!;

            const stateBackroomLocked: ProgressionGameState = { highestFloor: 5, bossLevel: 5 };
            const stateBackroomUnlocked: ProgressionGameState = {
                highestFloor: 25,
                bossLevel: 30,
                backroomsFloor: 4,
                backroomsUnlockedTechs: ['alchemical_distill', 'energy_pack']
            };

            // Act
            const evalConquest = evaluateProgressionNode(conquestNode, stateBackroomUnlocked);
            const evalTech = evaluateProgressionNode(techNode, stateBackroomUnlocked);

            // Assert
            expect(evaluateProgressionNode(conquestNode, stateBackroomLocked).isUnlocked).toBe(false);
            expect(evaluateProgressionNode(techNode, stateBackroomLocked).isUnlocked).toBe(false);

            expect(evalConquest.isUnlocked).toBe(true);
            expect(evalConquest.progress.current).toBe(4);
            expect(evalTech.isUnlocked).toBe(true);
            expect(evalTech.progress.current).toBe(2);
        });

        it('deve desbloquear Indústria apenas após Tecnologia M.E.G. e requisito industrial', () => {
            // Arrange
            const industryNode = getProgressionNodeById('industry')!;
            const stateWithoutBackroomTech: ProgressionGameState = {
                highestFloor: 5,
                bossLevel: 5
            };
            const stateWithBackroomTechAndIndustry: ProgressionGameState = {
                highestFloor: 50,
                bossLevel: 30,
                backroomsUnlockedTechs: ['tech_automation_1']
            };

            // Act & Assert
            expect(evaluateProgressionNode(industryNode, stateWithoutBackroomTech).isUnlocked).toBe(false);
            expect(evaluateProgressionNode(industryNode, stateWithBackroomTechAndIndustry).isUnlocked).toBe(true);
        });

        it('deve desbloquear Galáxia apenas após Indústria e Dobra Espacial', () => {
            // Arrange
            const galaxyNode = getProgressionNodeById('galaxy')!;
            const stateWithoutIndustry: ProgressionGameState = {
                highestFloor: 10,
                bossLevel: 10,
                outerSpaceUnlocked: false
            };
            const stateWithIndustryAndSpaceWarp: ProgressionGameState = {
                highestFloor: 60,
                bossLevel: 30,
                backroomsUnlockedTechs: ['tech_automation_1', 'space_warp'],
                buildings: [{ id: 'industry', level: 1, cost: 500, effectValue: 1, emoji: '🏭', maxLevel: 5, name: 'Indústria' }]
            };
            const stateWithOuterSpaceFlag: ProgressionGameState = {
                highestFloor: 60,
                bossLevel: 30,
                backroomsUnlockedTechs: ['tech_automation_1'],
                outerSpaceUnlocked: true
            };

            // Act & Assert
            expect(evaluateProgressionNode(galaxyNode, stateWithoutIndustry).isUnlocked).toBe(false);
            expect(evaluateProgressionNode(galaxyNode, stateWithIndustryAndSpaceWarp).isUnlocked).toBe(true);
            expect(evaluateProgressionNode(galaxyNode, stateWithOuterSpaceFlag).isUnlocked).toBe(true);
        });
    });

    // =========================================================================
    // CASOS DE BORDA, RESILIÊNCIA E TRATAMENTO DE ERROS
    // =========================================================================
    describe('Casos de Borda e Resiliência (Edge Cases & Exception Handling)', () => {
        it('deve lidar com segurança com estado null ou undefined', () => {
            // Arrange
            const nullState = null;
            const undefinedState = undefined;

            // Act
            const treeFromNull = evaluateProgressionTree(nullState);
            const treeFromUndefined = evaluateProgressionTree(undefinedState);

            // Assert
            expect(treeFromNull).toBeDefined();
            expect(treeFromUndefined).toBeDefined();
            expect(treeFromNull['tower'].isUnlocked).toBe(true);
            expect(treeFromNull['town'].isUnlocked).toBe(false);
            expect(treeFromNull['guilds'].isUnlocked).toBe(false);
            expect(treeFromNull['backroom'].isUnlocked).toBe(false);
            expect(treeFromNull['galaxy'].isUnlocked).toBe(false);
        });

        it('deve lidar com edifícios vazios ou nulos sem lançar exceções', () => {
            // Arrange
            const state: ProgressionGameState = {
                buildings: undefined,
                backroomsUnlockedTechs: undefined
            };

            // Act
            const tree = evaluateProgressionTree(state);

            // Assert
            expect(tree['guilds'].isUnlocked).toBe(false);
            expect(tree['backrooms_tech'].isUnlocked).toBe(false);
            expect(tree['industry'].isUnlocked).toBe(false);
        });

        it('deve retornar nós corretos ao filtrar por ramificação', () => {
            // Arrange & Act
            const mainNodes = getBranchNodes('main');
            const leftNodes = getBranchNodes('left');
            const rightNodes = getBranchNodes('right');

            // Assert
            expect(mainNodes.map(n => n.id)).toEqual(['tower', 'town', 'world_boss']);
            expect(leftNodes.map(n => n.id)).toEqual(['guilds', 'gvg', 'guild_conquest']);
            expect(rightNodes.map(n => n.id)).toEqual([
                'backroom',
                'backrooms_conquest',
                'backrooms_tech',
                'industry',
                'galaxy'
            ]);
        });

        it('deve retornar undefined ao buscar ID de nó inexistente', () => {
            // Arrange & Act
            const node = getProgressionNodeById('non_existent_node');

            // Assert
            expect(node).toBeUndefined();
        });

        it('deve tratar valores numéricos negativos ou extremos com resiliência', () => {
            // Arrange
            const corruptedState: ProgressionGameState = {
                highestFloor: -10,
                bossLevel: -5,
                backroomsFloor: -2,
                playerTerritoriesCount: -1
            };

            // Act
            const tree = evaluateProgressionTree(corruptedState);

            // Assert
            expect(tree['tower'].isUnlocked).toBe(true);
            expect(tree['town'].isUnlocked).toBe(false);
            expect(tree['world_boss'].isUnlocked).toBe(false);
            expect(tree['guild_conquest'].progress.current).toBe(0);
        });

        it('deve capturar falhas em funções checkUnlocked ou getProgress defensivamente', () => {
            // Arrange
            const faultyNode: ProgressionNode = {
                id: 'faulty',
                name: 'Falha',
                shortName: 'Falha',
                description: 'Nó com erro forçado',
                icon: '💥',
                branch: 'main',
                unlockRequirementText: 'Erro',
                checkUnlocked: () => { throw new Error('Simulated crash'); },
                getProgress: () => { throw new Error('Simulated crash'); }
            };

            // Act
            const evaluated = evaluateProgressionNode(faultyNode, {});

            // Assert
            expect(evaluated.isUnlocked).toBe(false);
            expect(evaluated.status).toBe('locked');
            expect(evaluated.progress.percentage).toBe(0);
        });
    });
});
