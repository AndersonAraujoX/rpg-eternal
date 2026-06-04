import { useState, useCallback } from 'react';
import type { 
    BackroomsExplorer, BackroomsOutpost, BackroomsResources 
} from '../engine/backrooms';
import { 
    createRandomExplorer, simulateBackroomsTick, BACKROOMS_LEVELS, BACKROOMS_RESEARCHES 
} from '../engine/backrooms';

export function useBackrooms() {
    const [backroomsExplorers, setBackroomsExplorers] = useState<BackroomsExplorer[]>([
        // Start with 2 initial explorers
        {
            id: 'exp_init_1',
            name: 'Robert "Scout" Chen',
            classType: 'scout',
            emoji: '🏃‍♂️',
            hp: 100,
            maxHp: 100,
            sanity: 100,
            maxSanity: 100,
            status: 'idle',
            assignedLevel: null,
            equipment: { flashlight: 0, suit: 0, tracker: 0 }
        },
        {
            id: 'exp_init_2',
            name: 'Dr. Evelyn Carter',
            classType: 'scientist',
            emoji: '🥼',
            hp: 100,
            maxHp: 100,
            sanity: 100,
            maxSanity: 100,
            status: 'idle',
            assignedLevel: null,
            equipment: { flashlight: 0, suit: 0, tracker: 0 }
        }
    ]);

    const [backroomsOutpost, setBackroomsOutpost] = useState<BackroomsOutpost>({
        refinery: 1,
        quarters: 1,
        sensors: 1
    });

    const [backroomsResources, setBackroomsResources] = useState<BackroomsResources>({
        scrap: 10,
        almondWater: 3,
        anomalyParts: 0
    });

    const [backroomsUnlockedTechs, setBackroomsUnlockedTechs] = useState<string[]>([]);

    const [backroomsLogs, setBackroomsLogs] = useState<string[]>([
        `[${new Date().toLocaleTimeString()}] Posto Avançado M.E.G. inicializado. Pronto para exploração.`
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

    const processBackroomsTick = useCallback((deltaSeconds: number) => {
        setBackroomsExplorers(prevExplorers => {
            const { updatedExplorers, gainedResources, newLogs } = simulateBackroomsTick(
                prevExplorers,
                backroomsOutpost,
                backroomsResources,
                [],
                deltaSeconds
            );

            // Add resources
            if (gainedResources.scrap || gainedResources.almondWater || gainedResources.anomalyParts) {
                setBackroomsResources(prev => ({
                    scrap: prev.scrap + (gainedResources.scrap || 0),
                    almondWater: prev.almondWater + (gainedResources.almondWater || 0),
                    anomalyParts: prev.anomalyParts + (gainedResources.anomalyParts || 0)
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
    }, [backroomsOutpost, backroomsResources]);

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
        recruitExplorer,
        sendExplorer,
        recallExplorer,
        restExplorer,
        useAlmondWater,
        upgradeOutpost,
        craftGear,
        researchTech,
        processBackroomsTick
    };
}
