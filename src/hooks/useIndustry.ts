import { useState, useEffect } from 'react';
import { simulateIndustryTick, type MachineNode } from '../engine/industry';

const INDUSTRY_SAVE_KEY = 'rpg_eternal_industry';

export interface IndustryState {
    inventory: Record<string, number>;
    nodes: MachineNode[];
    unlockedTechs: string[];
}

export function useIndustry() {
    const [state, setState] = useState<IndustryState>(() => {
        const defaultState: IndustryState = {
            inventory: { 'gold': 0 },
            nodes: [],
            unlockedTechs: []
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
                        // Ensure gold exists
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
                            count: Number(node.count)
                        }));
                    }

                    // Validate unlockedTechs
                    if (Array.isArray(parsed.unlockedTechs)) {
                        safeState.unlockedTechs = parsed.unlockedTechs
                            .filter((tech: any) => typeof tech === 'string')
                            .map(String);
                    }

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
        flowPerSecond: {} as Record<string, number>
    });

    useEffect(() => {
        localStorage.setItem(INDUSTRY_SAVE_KEY, JSON.stringify(state));
    }, [state]);

    const addNode = (machineId: string, recipeId: string = '') => {
        setState(prev => ({
            ...prev,
            nodes: [...prev.nodes, {
                id: Math.random().toString(36).substring(2, 9),
                machineId,
                recipeId,
                count: 1
            }]
        }));
    };

    const removeNode = (nodeId: string) => {
        setState(prev => ({
            ...prev,
            nodes: prev.nodes.filter(n => n.id !== nodeId)
        }));
    };

    const updateNode = (nodeId: string, updates: Partial<MachineNode>) => {
        setState(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
        }));
    };

    const processTick = (deltaSeconds: number) => {
        setState(prev => {
            const result = simulateIndustryTick(prev.nodes, prev.inventory, deltaSeconds);

            // Only update metrics if something changed or every tick
            setMetrics({
                powerGenerated: result.powerGenerated,
                powerConsumed: result.powerConsumed,
                powerEfficiency: result.powerEfficiency,
                flowPerSecond: result.flowPerSecond
            });

            return {
                ...prev,
                inventory: result.newInventory
            };
        });
    };

    return {
        ...state,
        metrics,
        addNode,
        removeNode,
        updateNode,
        processTick,
        setIndustryState: setState
    };
}
