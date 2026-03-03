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
        const saved = localStorage.getItem(INDUSTRY_SAVE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse industry save", e);
            }
        }
        return {
            inventory: {
                'gold': 0 // Starting resources if necessary
            },
            nodes: [],
            unlockedTechs: []
        };
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
