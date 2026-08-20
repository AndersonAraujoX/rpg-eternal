import { useState, useEffect, useCallback } from 'react';
import { simulateIndustryTick, FACTORIO_TECHS, type MachineNode, type TechNode } from '../engine/industry';

const INDUSTRY_SAVE_KEY = 'rpg_eternal_industry';

export interface IndustryState {
    inventory: Record<string, number>;
    nodes: MachineNode[];
    unlockedTechs: string[];
    activeResearch?: string | null;
    researchProgress?: Record<string, number>;
    rocketPartsBuilt?: number;
    rocketsLaunched?: number;
    selectedBeltTier?: 'yellow' | 'red' | 'blue';
    selectedInserterTier?: 'basic' | 'fast' | 'stack';
}

export function useIndustry() {
    const [state, setState] = useState<IndustryState>(() => {
        const defaultState: IndustryState = {
            inventory: { 'gold': 0 },
            nodes: [],
            unlockedTechs: ['tech_automation_1'], // Initial starter tech
            activeResearch: null,
            researchProgress: {},
            rocketPartsBuilt: 0,
            rocketsLaunched: 0,
            selectedBeltTier: 'yellow',
            selectedInserterTier: 'basic'
        };

        const saved = localStorage.getItem(INDUSTRY_SAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                if (parsed && typeof parsed === 'object') {
                    const safeState: IndustryState = { ...defaultState };

                    // Validate inventory
                    if (parsed.inventory && typeof parsed.inventory === 'object') {
                        safeState.inventory = {};
                        for (const [key, value] of Object.entries(parsed.inventory)) {
                            if (typeof key === 'string' && typeof value === 'number') {
                                safeState.inventory[key] = value;
                            }
                        }
                        if (typeof safeState.inventory['gold'] !== 'number') {
                            safeState.inventory['gold'] = 0;
                        }
                    }

                    // Validate nodes
                    if (Array.isArray(parsed.nodes)) {
                        safeState.nodes = parsed.nodes.filter(
                            (node: any) =>
                                node && typeof node === 'object' &&
                                typeof node.id === 'string' &&
                                typeof node.machineId === 'string' &&
                                typeof node.recipeId === 'string' &&
                                typeof node.count === 'number'
                        ).map((node: any) => ({
                            id: String(node.id),
                            machineId: String(node.machineId),
                            recipeId: String(node.recipeId),
                            count: Number(node.count),
                            modules: Array.isArray(node.modules) ? node.modules.map(String) : []
                        }));
                    }

                    // Validate unlockedTechs
                    if (Array.isArray(parsed.unlockedTechs)) {
                        safeState.unlockedTechs = parsed.unlockedTechs
                            .filter((tech: any) => typeof tech === 'string')
                            .map(String);
                        if (!safeState.unlockedTechs.includes('tech_automation_1')) {
                            safeState.unlockedTechs.push('tech_automation_1');
                        }
                    }

                    safeState.activeResearch = typeof parsed.activeResearch === 'string' ? parsed.activeResearch : null;
                    safeState.researchProgress = parsed.researchProgress && typeof parsed.researchProgress === 'object' ? parsed.researchProgress : {};
                    safeState.rocketPartsBuilt = typeof parsed.rocketPartsBuilt === 'number' ? parsed.rocketPartsBuilt : 0;
                    safeState.rocketsLaunched = typeof parsed.rocketsLaunched === 'number' ? parsed.rocketsLaunched : 0;
                    safeState.selectedBeltTier = ['yellow', 'red', 'blue'].includes(parsed.selectedBeltTier) ? parsed.selectedBeltTier : 'yellow';
                    safeState.selectedInserterTier = ['basic', 'fast', 'stack'].includes(parsed.selectedInserterTier) ? parsed.selectedInserterTier : 'basic';

                    return safeState;
                }
            } catch (e) {
                console.error("Failed to parse industry save", e);
            }
        }
        return defaultState;
    });

    // To display real-time metrics in the UI
    const [metrics, setMetrics] = useState({
        powerGenerated: 0,
        powerConsumed: 0,
        powerEfficiency: 1.0,
        flowPerSecond: {} as Record<string, number>,
        labsActiveCount: 0
    });

    useEffect(() => {
        localStorage.setItem(INDUSTRY_SAVE_KEY, JSON.stringify(state));
    }, [state]);

    const addNode = useCallback((machineId: string, recipeId: string = '') => {
        setState(prev => ({
            ...prev,
            nodes: [...prev.nodes, {
                id: Math.random().toString(36).substring(2, 9),
                machineId,
                recipeId,
                count: 1,
                modules: []
            }]
        }));
    }, []);

    const removeNode = useCallback((nodeId: string) => {
        setState(prev => ({
            ...prev,
            nodes: prev.nodes.filter(n => n.id !== nodeId)
        }));
    }, []);

    const updateNode = useCallback((nodeId: string, updates: Partial<MachineNode>) => {
        setState(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
        }));
    }, []);

    const startResearch = useCallback((techId: string) => {
        setState(prev => {
            const tech = FACTORIO_TECHS.find(t => t.id === techId);
            if (!tech) return prev;
            // Check prerequisites
            const hasPrereqs = tech.prerequisites.every(p => prev.unlockedTechs.includes(p));
            if (!hasPrereqs && tech.prerequisites.length > 0) return prev;
            return {
                ...prev,
                activeResearch: techId
            };
        });
    }, []);

    const buildRocketPart = useCallback(() => {
        setState(prev => {
            const currentParts = prev.rocketPartsBuilt || 0;
            if (currentParts >= 100) return prev;

            const hasDensity = (prev.inventory['low_density_structure'] || 0) >= 1;
            const hasFuel = (prev.inventory['rocket_fuel'] || 0) >= 1;
            const hasControl = (prev.inventory['rocket_control_unit'] || 0) >= 1;

            if (!hasDensity || !hasFuel || !hasControl) return prev;

            return {
                ...prev,
                inventory: {
                    ...prev.inventory,
                    'low_density_structure': prev.inventory['low_density_structure'] - 1,
                    'rocket_fuel': prev.inventory['rocket_fuel'] - 1,
                    'rocket_control_unit': prev.inventory['rocket_control_unit'] - 1
                },
                rocketPartsBuilt: currentParts + 1
            };
        });
    }, []);

    const launchRocket = useCallback(() => {
        let success = false;
        setState(prev => {
            const currentParts = prev.rocketPartsBuilt || 0;
            const hasSat = (prev.inventory['satellite'] || 0) >= 1;

            if (currentParts < 100 || !hasSat) return prev;

            success = true;
            return {
                ...prev,
                inventory: {
                    ...prev.inventory,
                    'satellite': prev.inventory['satellite'] - 1,
                    'science_white': (prev.inventory['science_white'] || 0) + 1000
                },
                rocketPartsBuilt: 0,
                rocketsLaunched: (prev.rocketsLaunched || 0) + 1
            };
        });
        return success;
    }, []);

    const setBeltTier = useCallback((tier: 'yellow' | 'red' | 'blue') => {
        setState(prev => ({ ...prev, selectedBeltTier: tier }));
    }, []);

    const setInserterTier = useCallback((tier: 'basic' | 'fast' | 'stack') => {
        setState(prev => ({ ...prev, selectedInserterTier: tier }));
    }, []);

    const processTick = useCallback((deltaSeconds: number, costReduction: number = 0) => {
        setState(prev => {
            const activeTech = prev.activeResearch ? FACTORIO_TECHS.find(t => t.id === prev.activeResearch) : null;
            const result = simulateIndustryTick(prev.nodes, prev.inventory, deltaSeconds, costReduction, activeTech);

            let newUnlockedTechs = [...prev.unlockedTechs];
            let newActiveResearch = prev.activeResearch;
            const newResearchProgress = { ...(prev.researchProgress || {}) };

            if (activeTech && result.researchPointsGained > 0) {
                const currentProgress = (newResearchProgress[activeTech.id] || 0) + result.researchPointsGained;
                newResearchProgress[activeTech.id] = currentProgress;

                if (currentProgress >= activeTech.pointsRequired) {
                    // Tech Completed!
                    if (!newUnlockedTechs.includes(activeTech.id)) {
                        newUnlockedTechs.push(activeTech.id);
                    }
                    newActiveResearch = null;
                }
            }

            setMetrics({
                powerGenerated: result.powerGenerated,
                powerConsumed: result.powerConsumed,
                powerEfficiency: result.powerEfficiency,
                flowPerSecond: result.flowPerSecond,
                labsActiveCount: result.labsActiveCount
            });

            return {
                ...prev,
                inventory: result.newInventory,
                unlockedTechs: newUnlockedTechs,
                activeResearch: newActiveResearch,
                researchProgress: newResearchProgress
            };
        });
    }, []);

    return {
        ...state,
        metrics,
        addNode,
        removeNode,
        updateNode,
        startResearch,
        buildRocketPart,
        launchRocket,
        setBeltTier,
        setInserterTier,
        processTick,
        setIndustryState: setState
    };
}
