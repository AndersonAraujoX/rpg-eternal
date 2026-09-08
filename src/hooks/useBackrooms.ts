import { useState, useCallback } from 'react';
import type { 
    BackroomsExplorer, BackroomsOutpost, BackroomsResources, ContainedEntity, SectorModules, NoclipEvent 
} from '../engine/backrooms';
import { 
    createRandomExplorer, simulateBackroomsTick, BACKROOMS_LEVELS, BACKROOMS_RESEARCHES, getTransitionBoss, 
    INITIAL_BACKROOMS_EXPLORERS, INITIAL_BACKROOMS_OUTPOST, INITIAL_BACKROOMS_RESOURCES,
    captureEntity as engineCaptureEntity, resolveNoclipEvent as engineResolveNoclipEvent,
    upgradeSectorModule as engineUpgradeSectorModule, sealDimensionalRift as engineSealDimensionalRift,
    unlockExplorerTalent as engineUnlockExplorerTalent
} from '../engine/backrooms';

export function useBackrooms() {
    const [backroomsExplorers, setBackroomsExplorers] = useState<BackroomsExplorer[]>(INITIAL_BACKROOMS_EXPLORERS);
    const [backroomsOutpost, setBackroomsOutpost] = useState<BackroomsOutpost>(INITIAL_BACKROOMS_OUTPOST);
    const [backroomsResources, setBackroomsResources] = useState<BackroomsResources>(INITIAL_BACKROOMS_RESOURCES);

    const [backroomsUnlockedTechs, setBackroomsUnlockedTechs] = useState<string[]>([]);
    const [backroomsFloor, setBackroomsFloor] = useState<number>(1);
    const [backroomsFloorProgress, setBackroomsFloorProgress] = useState<number>(0);
    const [backroomsBossHp, setBackroomsBossHp] = useState<number | null>(null);

    // M.E.G. V2.0 Expansões: Entidades, Módulos de Conquista, Noclip, Instabilidade
    const [containedEntities, setContainedEntities] = useState<ContainedEntity[]>([]);
    const [sectorModules, setSectorModules] = useState<Record<string, SectorModules>>({});
    const [activeNoclipEvent, setActiveNoclipEvent] = useState<NoclipEvent | null>(null);
    const [dimensionalInstability, setDimensionalInstability] = useState<number>(0);

    const [backroomsLogs, setBackroomsLogs] = useState<string[]>([
        `[${new Date().toLocaleTimeString()}] Posto Avançado M.E.G. inicializado. Protocolos V2.0 ativos.`
    ]);

    const addLog = useCallback((msg: string) => {
        setBackroomsLogs(prev => {
            const next = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev];
            return next.slice(0, 50); // limit to 50 logs
        });
    }, []);

    const recruitExplorer = () => {
        const scrapCost = 15;
        if (backroomsResources.scrap >= scrapCost) {
            const newExp = createRandomExplorer();
            setBackroomsResources(prev => ({ ...prev, scrap: prev.scrap - scrapCost }));
            setBackroomsExplorers(prev => [...prev, newExp]);
            addLog(`👤 Recrutado novo explorador: ${newExp.name} (${newExp.classType})`);
        } else {
            addLog(`❌ Recursos insuficientes! Recrutar explorador requer ${scrapCost} sucatas.`);
        }
    };

    const sendExplorer = (explorerId: string, levelId: string) => {
        const lvl = BACKROOMS_LEVELS.find(l => l.id === levelId);
        if (!lvl) return;

        setBackroomsExplorers(prev => prev.map(exp => {
            if (exp.id === explorerId) {
                addLog(`🧭 ${exp.name} enviado para explorar ${lvl.name}.`);
                return {
                    ...exp,
                    status: 'exploring',
                    assignedLevel: levelId
                };
            }
            return exp;
        }));
    };

    const recallExplorer = (explorerId: string) => {
        setBackroomsExplorers(prev => prev.map(exp => {
            if (exp.id === explorerId) {
                addLog(`🎒 ${exp.name} retornou ao Posto Avançado.`);
                return {
                    ...exp,
                    status: 'idle',
                    assignedLevel: null
                };
            }
            return exp;
        }));
    };

    const restExplorer = (explorerId: string) => {
        setBackroomsExplorers(prev => prev.map(exp => {
            if (exp.id === explorerId) {
                addLog(`⛺ ${exp.name} entrou nos dormitórios para descansar.`);
                return {
                    ...exp,
                    status: 'resting',
                    assignedLevel: null
                };
            }
            return exp;
        }));
    };

    const useAlmondWater = (explorerId: string) => {
        if (backroomsResources.almondWater >= 1) {
            setBackroomsResources(prev => ({ ...prev, almondWater: prev.almondWater - 1 }));
            setBackroomsExplorers(prev => prev.map(exp => {
                if (exp.id === explorerId) {
                    const recovery = 35 + (backroomsOutpost.refinery * 5);
                    const newSanity = Math.min(exp.maxSanity, exp.sanity + recovery);
                    addLog(`🧴 ${exp.name} bebeu Água de Amêndoa e recuperou ${recovery} de Sanidade.`);
                    return {
                        ...exp,
                        sanity: newSanity
                    };
                }
                return exp;
            }));
        } else {
            addLog(`❌ Sem Água de Amêndoa no inventário.`);
        }
    };

    const upgradeOutpost = (upgradeId: keyof BackroomsOutpost) => {
        const currentLevel = backroomsOutpost[upgradeId];
        const scrapCost = (currentLevel + 1) * 20;
        const anomalyCost = currentLevel * 2;

        if (backroomsResources.scrap >= scrapCost && backroomsResources.anomalyParts >= anomalyCost) {
            setBackroomsResources(prev => ({
                ...prev,
                scrap: prev.scrap - scrapCost,
                anomalyParts: prev.anomalyParts - anomalyCost
            }));
            setBackroomsOutpost(prev => ({
                ...prev,
                [upgradeId]: currentLevel + 1
            }));
            addLog(`📈 Aprimoramento de Posto Avançado: ${upgradeId.toUpperCase()} elevado para nível ${currentLevel + 1}`);
        } else {
            addLog(`❌ Recursos insuficientes! Requer ${scrapCost} Sucatas e ${anomalyCost} Peças de Anomalia.`);
        }
    };

    const craftGear = (explorerId: string, gearType: 'flashlight' | 'suit' | 'tracker') => {
        const explorer = backroomsExplorers.find(e => e.id === explorerId);
        if (!explorer) return;

        const currentLvl = explorer.equipment[gearType];
        if (currentLvl >= 3) {
            addLog(`❌ Equipamento no nível máximo.`);
            return;
        }

        const scrapCost = (currentLvl + 1) * 15;
        if (backroomsResources.scrap >= scrapCost) {
            setBackroomsResources(prev => ({ ...prev, scrap: prev.scrap - scrapCost }));
            setBackroomsExplorers(prev => prev.map(exp => {
                if (exp.id === explorerId) {
                    const nextGear = { ...exp.equipment, [gearType]: currentLvl + 1 };
                    addLog(`🛡️ Fabricado/Aprimorado ${gearType.toUpperCase()} para ${exp.name} (Nível ${currentLvl + 1}).`);
                    return {
                        ...exp,
                        equipment: nextGear
                    };
                }
                return exp;
            }));
        } else {
            addLog(`❌ Sucatas insuficientes! Requer ${scrapCost} para aprimorar.`);
        }
    };

    const researchTech = (techId: string) => {
        const tech = BACKROOMS_RESEARCHES.find(t => t.id === techId);
        if (!tech) return;

        if (backroomsUnlockedTechs.includes(techId)) {
            addLog(`❌ Tecnologia ${tech.name} já foi pesquisada.`);
            return;
        }

        if (
            backroomsResources.scrap >= tech.cost.scrap &&
            backroomsResources.almondWater >= tech.cost.almondWater &&
            backroomsResources.anomalyParts >= tech.cost.anomalyParts
        ) {
            setBackroomsResources(prev => ({
                scrap: Math.max(0, prev.scrap - tech.cost.scrap),
                almondWater: Math.max(0, prev.almondWater - tech.cost.almondWater),
                anomalyParts: Math.max(0, prev.anomalyParts - tech.cost.anomalyParts)
            }));
            setBackroomsUnlockedTechs(prev => [...prev, techId]);
            addLog(`🔬 Tecnologia Pesquisada: ${tech.name}!`);
        } else {
            addLog(`❌ Recursos de pesquisa insuficientes para ${tech.name}.`);
        }
    };

    // Novas Ações M.E.G. V2.0
    const captureEntity = (entityId: string) => {
        const result = engineCaptureEntity(entityId, backroomsResources, containedEntities);
        if (result.success) {
            setBackroomsResources(result.newResources);
            setContainedEntities(result.newCaptured);
            addLog(`🔮 ${result.message}`);
            return true;
        } else {
            addLog(`❌ ${result.message}`);
            return false;
        }
    };

    const resolveNoclip = (choice: 'enter' | 'ignore') => {
        if (!activeNoclipEvent) return;
        const result = engineResolveNoclipEvent(activeNoclipEvent, choice, backroomsExplorers, backroomsResources);
        setBackroomsExplorers(result.updatedExplorers);
        setBackroomsResources(result.updatedResources);
        addLog(result.log);
        setActiveNoclipEvent(null);
    };

    const upgradeSectorModule = (sectorId: string, moduleType: keyof SectorModules) => {
        const result = engineUpgradeSectorModule(sectorId, moduleType, sectorModules, backroomsResources);
        if (result.success) {
            setBackroomsResources(result.newResources);
            setSectorModules(result.newModules);
            addLog(`🏗️ ${result.message}`);
            return true;
        } else {
            addLog(`❌ ${result.message}`);
            return false;
        }
    };

    const sealDimensionalRift = (method: 'scrap' | 'heroCombat', heroPower: number = 50) => {
        const result = engineSealDimensionalRift(method, backroomsResources, heroPower, dimensionalInstability);
        if (result.success) {
            setBackroomsResources(result.newResources);
            setDimensionalInstability(result.newInstability);
            addLog(`🛡️ ${result.message}`);
            return true;
        } else {
            addLog(`❌ ${result.message}`);
            return false;
        }
    };

    const unlockExplorerTalent = (explorerId: string, talentId: string) => {
        const exp = backroomsExplorers.find(e => e.id === explorerId);
        if (!exp) return false;
        const result = engineUnlockExplorerTalent(exp, talentId);
        if (result.success) {
            setBackroomsExplorers(prev => prev.map(e => e.id === explorerId ? result.updatedExplorer : e));
            addLog(`⭐ ${result.message}`);
            return true;
        } else {
            addLog(`❌ ${result.message}`);
            return false;
        }
    };

    const processBackroomsTick = useCallback((deltaSeconds: number, isExploradoresOcultosActive: boolean = false) => {
        setBackroomsExplorers(prevExplorers => {
            const isTransitionFloor = [15, 30, 45, 60, 75, 90, 100].includes(backroomsFloor);
            
            // If it is a transition floor and progress has reached 100%, and boss is not yet spawned, spawn the boss!
            let activeBossHp = backroomsBossHp;
            if (isTransitionFloor && backroomsFloorProgress >= 100 && activeBossHp === null) {
                const boss = getTransitionBoss(backroomsFloor);
                if (boss) {
                    activeBossHp = boss.maxHp;
                    setBackroomsBossHp(boss.maxHp);
                    addLog(`💀 CHEFE APARECEU: ${boss.name} bloqueia a passagem no Andar ${backroomsFloor}! Derrote-o para prosseguir.`);
                }
            }

            const { 
                updatedExplorers, gainedResources, newLogs, progressGained, bossHpDamage,
                noclipTriggered, instabilityDelta
            } = simulateBackroomsTick(
                prevExplorers,
                backroomsOutpost,
                backroomsResources,
                [],
                deltaSeconds,
                backroomsFloor,
                activeBossHp,
                isExploradoresOcultosActive,
                {
                    containedEntities,
                    sectorModules,
                    dimensionalInstability,
                    activeNoclipEvent
                }
            );

            // Noclip trigger
            if (noclipTriggered && !activeNoclipEvent) {
                setActiveNoclipEvent(noclipTriggered);
            }

            // Instabilidade dimensional
            if (instabilityDelta) {
                setDimensionalInstability(prev => {
                    const next = Math.min(100, Math.max(0, prev + instabilityDelta));
                    if (prev < 80 && next >= 80) {
                        addLog(`⚠️ [ALERTA DE FENDA] A integridade dimensional caiu drasticamente! Fenda instável ameaça invadir a Vila!`);
                    }
                    return next;
                });
            }

            // Update boss HP if combat occurred
            if (activeBossHp !== null && bossHpDamage > 0) {
                const newBossHp = Math.max(0, activeBossHp - bossHpDamage);
                setBackroomsBossHp(newBossHp);
                
                if (newBossHp <= 0) {
                    const boss = getTransitionBoss(backroomsFloor);
                    addLog(`🎉 VITÓRIA: ${boss ? boss.name : 'O Chefe'} foi derrotado! Passagem liberada.`);
                    
                    // Increment floor, reset progress
                    setBackroomsFloor(f => Math.min(100, f + 1));
                    setBackroomsFloorProgress(0);
                    setBackroomsBossHp(null);
                } else {
                    activeBossHp = newBossHp;
                }
            }

            // Update exploration progress if not at 100% on a transition floor
            if (progressGained > 0) {
                if (isTransitionFloor) {
                    setBackroomsFloorProgress(prev => {
                        const next = Math.min(100, prev + progressGained);
                        if (next >= 100 && activeBossHp === null) {
                            const boss = getTransitionBoss(backroomsFloor);
                            if (boss) {
                                setBackroomsBossHp(boss.maxHp);
                                addLog(`💀 CHEFE APARECEU: ${boss.name} bloqueia a passagem no Andar ${backroomsFloor}! Derrote-o para prosseguir.`);
                            }
                        }
                        return next;
                    });
                } else {
                    setBackroomsFloorProgress(prev => {
                        const next = prev + progressGained;
                        if (next >= 100) {
                            const floorsToGain = Math.floor(next / 100);
                            const remainder = next % 100;
                            
                            setBackroomsFloor(f => {
                                let targetFloor = f;
                                for (let step = 0; step < floorsToGain; step++) {
                                    if ([15, 30, 45, 60, 75, 90, 100].includes(targetFloor)) {
                                        setBackroomsFloorProgress(100);
                                        return targetFloor;
                                    }
                                    targetFloor = Math.min(100, targetFloor + 1);
                                    if ([15, 30, 45, 60, 75, 90, 100].includes(targetFloor)) {
                                        setBackroomsFloorProgress(0);
                                        return targetFloor;
                                    }
                                }
                                setBackroomsFloorProgress(remainder);
                                return targetFloor;
                            });
                            return 0; 
                        }
                        return next;
                    });
                }
            }

            // Add resources
            if (
                gainedResources.scrap || gainedResources.almondWater || gainedResources.anomalyParts ||
                gainedResources.liminalFluid || gainedResources.voidAlloy
            ) {
                setBackroomsResources(prev => ({
                    scrap: prev.scrap + (gainedResources.scrap || 0),
                    almondWater: prev.almondWater + (gainedResources.almondWater || 0),
                    anomalyParts: prev.anomalyParts + (gainedResources.anomalyParts || 0),
                    liminalFluid: (prev.liminalFluid || 0) + (gainedResources.liminalFluid || 0),
                    voidAlloy: (prev.voidAlloy || 0) + (gainedResources.voidAlloy || 0)
                }));
            }

            // Append logs
            if (newLogs.length > 0) {
                setBackroomsLogs(prev => {
                    const next = [...newLogs, ...prev];
                    return next.slice(0, 50);
                });
            }

            return updatedExplorers;
        });
    }, [
        backroomsFloor, backroomsFloorProgress, backroomsBossHp, backroomsOutpost, backroomsResources,
        containedEntities, sectorModules, dimensionalInstability, activeNoclipEvent, addLog
    ]);

    return {
        backroomsExplorers,
        setBackroomsExplorers,
        backroomsOutpost,
        setBackroomsOutpost,
        backroomsResources,
        setBackroomsResources,
        backroomsUnlockedTechs,
        setBackroomsUnlockedTechs,
        backroomsLogs,
        setBackroomsLogs,
        backroomsFloor,
        setBackroomsFloor,
        backroomsFloorProgress,
        setBackroomsFloorProgress,
        backroomsBossHp,
        setBackroomsBossHp,
        // M.E.G. V2.0 States
        containedEntities,
        setContainedEntities,
        sectorModules,
        setSectorModules,
        activeNoclipEvent,
        setActiveNoclipEvent,
        dimensionalInstability,
        setDimensionalInstability,
        // Actions
        recruitExplorer,
        sendExplorer,
        recallExplorer,
        restExplorer,
        useAlmondWater,
        upgradeOutpost,
        craftGear,
        researchTech,
        captureEntity,
        resolveNoclip,
        upgradeSectorModule,
        sealDimensionalRift,
        unlockExplorerTalent,
        processBackroomsTick
    };
}
