import { describe, it, expect } from 'vitest';
import { 
    captureEntity, 
    resolveNoclipEvent, 
    upgradeSectorModule, 
    sealDimensionalRift, 
    unlockExplorerTalent,
    simulateBackroomsTick,
    isSectorStabilized,
    BACKROOMS_ENTITIES,
    NOCLIP_LEVELS,
    EXPLORER_TALENTS,
    BackroomsExplorer,
    BackroomsOutpost,
    BackroomsResources,
    ContainedEntity,
    NoclipEvent,
    SectorModules
} from '../../engine/backrooms';

describe('Backrooms M.E.G. V2.0 Expansion Engine', () => {

    // =========================================================================
    // PILLAR 1: BESTIÁRIO DE ENTIDADES & CÂMARAS DE CONTENÇÃO
    // =========================================================================
    describe('Pilar 1: Bestiário de Entidades & Câmaras de Contenção (captureEntity)', () => {
        it('deve conter uma entidade com sucesso quando os recursos forem suficientes (Caminho Feliz)', () => {
            // Arrange
            const entityId = 'smiler';
            const resources: BackroomsResources = { scrap: 50, almondWater: 5, anomalyParts: 5 };
            const currentCaptured: ContainedEntity[] = [];

            // Act
            const result = captureEntity(entityId, resources, currentCaptured);

            // Assert
            expect(result.success).toBe(true);
            expect(result.newCaptured.length).toBe(1);
            expect(result.newCaptured[0].id).toBe('smiler');
            expect(result.newResources.almondWater).toBe(3); // 5 - 2
            expect(result.newResources.anomalyParts).toBe(2); // 5 - 3
            expect(result.message).toContain('contido com sucesso');
        });

        it('não deve conter entidade quando os recursos forem insuficientes (Caso de Borda / Limite)', () => {
            // Arrange
            const entityId = 'smiler'; // Custa 2 almondWater, 3 anomalyParts
            const resources: BackroomsResources = { scrap: 50, almondWater: 1, anomalyParts: 1 };
            const currentCaptured: ContainedEntity[] = [];

            // Act
            const result = captureEntity(entityId, resources, currentCaptured);

            // Assert
            expect(result.success).toBe(false);
            expect(result.newCaptured.length).toBe(0);
            expect(result.newResources.almondWater).toBe(1);
            expect(result.message).toContain('insuficientes');
        });

        it('não deve conter a mesma entidade em duplicidade se já estiver capturada (Caso de Borda)', () => {
            // Arrange
            const entityId = 'hound';
            const resources: BackroomsResources = { scrap: 50, almondWater: 10, anomalyParts: 10 };
            const existingEntity = BACKROOMS_ENTITIES.find(e => e.id === 'hound')!;
            const currentCaptured: ContainedEntity[] = [{ ...existingEntity, entityId: 'hound' }];

            // Act
            const result = captureEntity(entityId, resources, currentCaptured);

            // Assert
            expect(result.success).toBe(false);
            expect(result.newCaptured.length).toBe(1);
            expect(result.message).toContain('já está contido');
        });

        it('deve rejeitar contenção para ID de entidade inválido ou inexistente (Tratamento de Erros)', () => {
            // Arrange
            const entityId = 'entidade_fantasma_inexistente';
            const resources: BackroomsResources = { scrap: 50, almondWater: 10, anomalyParts: 10 };

            // Act
            const result = captureEntity(entityId, resources, []);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('não reconhecida');
        });
    });

    // =========================================================================
    // PILLAR 2: EVENTOS DE NOCLIP & SALAS SECRETAS
    // =========================================================================
    describe('Pilar 2: Eventos de Noclip & Salas Secretas (resolveNoclipEvent)', () => {
        const dummyExplorer: BackroomsExplorer = {
            id: 'exp_1',
            name: 'Alex Vance',
            classType: 'scout',
            emoji: '🏃',
            hp: 40,
            maxHp: 100,
            sanity: 30,
            maxSanity: 100,
            status: 'exploring',
            assignedLevel: 'sec_1',
            equipment: { flashlight: 0, suit: 0, tracker: 0 },
            level: 1,
            xp: 0,
            talents: []
        };

        it('deve restaurar sanidade e curar exploradores ao entrar nos Poolrooms (Caminho Feliz)', () => {
            // Arrange
            const event: NoclipEvent = {
                id: 'noclip_1',
                secretLevelId: 'poolrooms',
                timestamp: Date.now()
            };
            const resources: BackroomsResources = { scrap: 10, almondWater: 0, anomalyParts: 0, liminalFluid: 0 };

            // Act
            const result = resolveNoclipEvent(event, 'enter', [dummyExplorer], resources);

            // Assert
            expect(result.updatedExplorers[0].sanity).toBe(100);
            expect(result.updatedExplorers[0].hp).toBe(65); // 40 + 25
            expect(result.updatedResources.almondWater).toBe(6);
            expect(result.updatedResources.liminalFluid).toBe(2);
            expect(result.log).toContain('Poolrooms');
        });

        it('deve conceder muita sucata e Ligas do Vazio mas causar dano no Nível ! (Caminho Feliz)', () => {
            // Arrange
            const event: NoclipEvent = {
                id: 'noclip_2',
                secretLevelId: 'level_run',
                timestamp: Date.now()
            };
            const resources: BackroomsResources = { scrap: 0, almondWater: 0, anomalyParts: 0, voidAlloy: 0 };

            // Act
            const result = resolveNoclipEvent(event, 'enter', [dummyExplorer], resources);

            // Assert
            expect(result.updatedResources.scrap).toBe(50);
            expect(result.updatedResources.voidAlloy).toBe(2);
            expect(result.updatedResources.anomalyParts).toBe(3);
            expect(result.updatedExplorers[0].hp).toBeLessThan(40); // tomou dano
            expect(result.updatedExplorers[0].xp).toBeGreaterThan(0);
            expect(result.log).toContain('NÍVEL !');
        });

        it('deve seguir em segurança sem alterações nem penalidades ao escolher "ignore" (Caminho Feliz)', () => {
            // Arrange
            const event: NoclipEvent = {
                id: 'noclip_3',
                secretLevelId: 'level_run',
                timestamp: Date.now()
            };
            const resources: BackroomsResources = { scrap: 20, almondWater: 2, anomalyParts: 1 };

            // Act
            const result = resolveNoclipEvent(event, 'ignore', [dummyExplorer], resources);

            // Assert
            expect(result.updatedExplorers[0].hp).toBe(40);
            expect(result.updatedExplorers[0].sanity).toBe(30);
            expect(result.updatedResources.scrap).toBe(20);
            expect(result.log).toContain('evitou a falha dimensional');
        });

        it('deve lidar com falha suave quando a sala secreta for desconhecida (Tratamento de Erros)', () => {
            // Arrange
            const event: NoclipEvent = {
                id: 'noclip_err',
                secretLevelId: 'sala_desconhecida' as any,
                timestamp: Date.now()
            };
            const resources: BackroomsResources = { scrap: 10, almondWater: 0, anomalyParts: 0 };

            // Act
            const result = resolveNoclipEvent(event, 'enter', [dummyExplorer], resources);

            // Assert
            expect(result.log).toContain('colapsou antes da entrada');
        });
    });

    // =========================================================================
    // PILLAR 3: FORTIFICAÇÕES & CONQUISTA DE ANDAR
    // =========================================================================
    describe('Pilar 3: Fortificações & Módulos de Setor (upgradeSectorModule & Radio Tower)', () => {
        it('deve aprimorar módulo do setor consumindo recursos correspondentes (Caminho Feliz)', () => {
            // Arrange
            const sectorId = 'sec_1';
            const currentModules: Record<string, SectorModules> = {};
            const resources: BackroomsResources = { scrap: 100, almondWater: 5, anomalyParts: 5 };

            // Act
            const result = upgradeSectorModule(sectorId, 'radioTower', currentModules, resources);

            // Assert
            expect(result.success).toBe(true);
            expect(result.newModules[sectorId].radioTower).toBe(1);
            expect(result.newResources.scrap).toBe(50); // 100 - 50
            expect(result.newResources.almondWater).toBe(3); // 5 - 2
        });

        it('não deve permitir aprimoramento além do nível 3 (Caso de Borda / Limite)', () => {
            // Arrange
            const sectorId = 'sec_1';
            const currentModules: Record<string, SectorModules> = {
                sec_1: { radioTower: 3, waterCondenser: 0, scrapBeacon: 0 }
            };
            const resources: BackroomsResources = { scrap: 500, almondWater: 50, anomalyParts: 50 };

            // Act
            const result = upgradeSectorModule(sectorId, 'radioTower', currentModules, resources);

            // Assert
            expect(result.success).toBe(false);
            expect(result.newModules[sectorId].radioTower).toBe(3);
            expect(result.message).toContain('nível máximo');
        });

        it('deve verificar estabilização de setor corretamente (isSectorStabilized)', () => {
            // Arrange
            const unstabilizedMods: SectorModules = { radioTower: 1, waterCondenser: 0, scrapBeacon: 1 };
            const stabilizedMods: SectorModules = { radioTower: 1, waterCondenser: 1, scrapBeacon: 1 };

            // Act & Assert
            expect(isSectorStabilized(50, stabilizedMods)).toBe(false); // Progresso < 100
            expect(isSectorStabilized(100, unstabilizedMods)).toBe(false); // Faltando waterCondenser
            expect(isSectorStabilized(100, stabilizedMods)).toBe(true); // Estabilizado!
            expect(isSectorStabilized('sec_1', { sec_1: stabilizedMods })).toBe(true);
        });

        it('deve resgatar explorador à beira da morte quando o setor possui Torre de Rádio ativa (Pilar 3 Resgate SOS)', () => {
            // Arrange: explorador ativo com 2 de HP e dano iminente
            const dyingExplorer: BackroomsExplorer = {
                id: 'exp_dying',
                name: 'Brave Soldier',
                classType: 'soldier',
                emoji: '🛡️',
                hp: 0,
                maxHp: 100,
                sanity: 0,
                maxSanity: 100,
                status: 'exploring',
                assignedLevel: 'sec_1',
                equipment: { flashlight: 0, suit: 0, tracker: 0 },
                level: 10,
                xp: 0,
                talents: []
            };
            const outpost: BackroomsOutpost = { refinery: 1, quarters: 1, sensors: 1 };
            const resources: BackroomsResources = { scrap: 0, almondWater: 0, anomalyParts: 0 };
            const modulesWithRadio: Record<string, SectorModules> = {
                sec_1: { radioTower: 1, waterCondenser: 0, scrapBeacon: 0 }
            };

            // Forçar dreno de sanidade que normalmente zeraria e tornaria 'lost'
            // Act
            const { updatedExplorers, newLogs } = simulateBackroomsTick(
                [dyingExplorer],
                outpost,
                resources,
                [],
                50,
                1,
                null,
                false,
                { sectorModules: modulesWithRadio }
            );

            // Assert
            const rescued = updatedExplorers[0];
            expect(rescued.status).toBe('resting'); // Não ficou 'lost', foi resgatado!
            expect(rescued.hp).toBeGreaterThanOrEqual(15);
            expect(rescued.sanity).toBeGreaterThanOrEqual(15);
            expect(newLogs.some(log => log.includes('Torre de Rádio'))).toBe(true);
        });
    });

    // =========================================================================
    // PILLAR 5: INSTABILIDADE DIMENSIONAL & INVASÕES NA VILA
    // =========================================================================
    describe('Pilar 5: Instabilidade Dimensional & Invasões de Fenda (sealDimensionalRift)', () => {
        it('deve estabilizar a membrana usando âncora de sucata (Caminho Feliz)', () => {
            // Arrange
            const resources: BackroomsResources = { scrap: 60, almondWater: 3, anomalyParts: 0 };
            const currentInstability = 85; // Alerta de invasão

            // Act
            const result = sealDimensionalRift('scrap', resources, 50, currentInstability);

            // Assert
            expect(result.success).toBe(true);
            expect(result.newInstability).toBe(50); // 85 - 35
            expect(result.newResources.scrap).toBe(10); // 60 - 50
            expect(result.newResources.almondWater).toBe(1); // 3 - 2
            expect(result.message).toContain('Instabilidade reduzida');
        });

        it('deve selar fenda com combate de heróis e conceder recursos exóticos (Caminho Feliz)', () => {
            // Arrange
            const resources: BackroomsResources = { scrap: 0, almondWater: 0, anomalyParts: 0, voidAlloy: 0 };
            const currentInstability = 70;
            const heroPower = 100;

            // Act
            const result = sealDimensionalRift('heroCombat', resources, heroPower, currentInstability);

            // Assert
            expect(result.success).toBe(true);
            expect(result.newInstability).toBe(20); // 70 - 50
            expect(result.newResources.anomalyParts).toBe(2);
            expect(result.newResources.voidAlloy).toBe(1);
            expect(result.message).toContain('patrulha de heróis derrotou');
        });

        it('não deve permitir selamento militar se o poder dos heróis for inferior a 30 (Caso de Borda)', () => {
            // Arrange
            const resources: BackroomsResources = { scrap: 0, almondWater: 0, anomalyParts: 0 };
            const currentInstability = 60;
            const heroPower = 20; // insuficiente

            // Act
            const result = sealDimensionalRift('heroCombat', resources, heroPower, currentInstability);

            // Assert
            expect(result.success).toBe(false);
            expect(result.newInstability).toBe(60);
            expect(result.message).toContain('Poder militar da guilda insuficiente');
        });

        it('não deve realizar selamento se a membrana já estiver em 0% de instabilidade (Caso de Borda)', () => {
            // Arrange
            const resources: BackroomsResources = { scrap: 100, almondWater: 10, anomalyParts: 0 };

            // Act
            const result = sealDimensionalRift('scrap', resources, 50, 0);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('totalmente estável');
        });
    });

    // =========================================================================
    // PILLAR 6: ESPECIALIZAÇÕES & TALENTOS DOS EXPLORADORES
    // =========================================================================
    describe('Pilar 6: Especializações e Talentos dos Exploradores (unlockExplorerTalent & XP Progression)', () => {
        const baseExplorer: BackroomsExplorer = {
            id: 'exp_talents',
            name: 'Captain Carter',
            classType: 'soldier',
            emoji: '🎖️',
            hp: 100,
            maxHp: 100,
            sanity: 100,
            maxSanity: 100,
            status: 'idle',
            assignedLevel: null,
            equipment: { flashlight: 0, suit: 0, tracker: 0 },
            level: 3,
            xp: 50,
            talents: []
        };

        it('deve desbloquear talento de Soldado no nível correto (Caminho Feliz)', () => {
            // Arrange: 'soldier_mental_shield' requer nível 3
            const talentId = 'soldier_mental_shield';

            // Act
            const result = unlockExplorerTalent(baseExplorer, talentId);

            // Assert
            expect(result.success).toBe(true);
            expect(result.updatedExplorer.talents).toContain('soldier_mental_shield');
            expect(result.message).toContain('desbloqueado');
        });

        it('não deve desbloquear talento se o nível do explorador for insuficiente (Caso de Borda)', () => {
            // Arrange: 'soldier_precision_shot' requer nível 5
            const talentId = 'soldier_precision_shot';

            // Act
            const result = unlockExplorerTalent(baseExplorer, talentId);

            // Assert
            expect(result.success).toBe(false);
            expect(result.updatedExplorer.talents).not.toContain(talentId);
            expect(result.message).toContain('Requer Nível 5');
        });

        it('não deve permitir desbloquear talento de outra classe incompatível (Caso de Borda / Erro)', () => {
            // Arrange: Soldado tentando desbloquear talento de Scout
            const talentId = 'scout_light_step';

            // Act
            const result = unlockExplorerTalent(baseExplorer, talentId);

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('classe scout');
        });

        it('não deve duplicar talento já desbloqueado (Caso de Borda)', () => {
            // Arrange
            const expWithTalent: BackroomsExplorer = {
                ...baseExplorer,
                talents: ['soldier_mental_shield']
            };

            // Act
            const result = unlockExplorerTalent(expWithTalent, 'soldier_mental_shield');

            // Assert
            expect(result.success).toBe(false);
            expect(result.message).toContain('já desbloqueado');
        });

        it('deve progredir XP e subir de nível em simulateBackroomsTick aumentando Max HP e Max Sanidade (Caminho Feliz)', () => {
            // Arrange: explorador nível 1 com 95 XP explorando sec_1
            const advancingExplorer: BackroomsExplorer = {
                ...baseExplorer,
                level: 1,
                xp: 98,
                status: 'exploring',
                assignedLevel: 'sec_1'
            };
            const outpost: BackroomsOutpost = { refinery: 1, quarters: 1, sensors: 1 };
            const resources: BackroomsResources = { scrap: 0, almondWater: 0, anomalyParts: 0 };

            // Act: 5 segundos de exploração concedem ~6 a 10 XP
            const { updatedExplorers, newLogs } = simulateBackroomsTick(
                [advancingExplorer],
                outpost,
                resources,
                [],
                5,
                1
            );

            // Assert
            const leveledUp = updatedExplorers[0];
            expect(leveledUp.level).toBe(2); // Subiu para o nível 2!
            expect(leveledUp.maxHp).toBe(110); // +10 Max HP
            expect(leveledUp.maxSanity).toBe(110); // +10 Max Sanidade
            expect(newLogs.some(log => log.includes('Nível 2'))).toBe(true);
        });
    });
});
