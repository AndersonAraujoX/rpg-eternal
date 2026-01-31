import React, { useState } from 'react';
import { X, Sprout, Lock } from 'lucide-react';
import type { GardenPlot, SeedType, Resources } from '../../engine/types';
import { SEEDS } from '../../engine/types';
import { plantSeed, harvestPlot, unlockPlot, UNLOCK_COSTS } from '../../engine/garden';

interface GardenModalProps {
    isOpen: boolean;
    onClose: () => void;
    plots: GardenPlot[];
    setPlots: (plots: GardenPlot[]) => void;
    resources: Resources;
    setResources: React.Dispatch<React.SetStateAction<Resources>>;
    gold: number;
    setGold: (g: number) => void;
}

export const GardenModal: React.FC<GardenModalProps> = ({ isOpen, onClose, plots, setPlots, resources, setResources, gold, setGold }) => {
    const [selectedSeed, setSelectedSeed] = useState<SeedType>('moonleaf');

    if (!isOpen) return null;

    const handlePlant = (index: number) => {
        const { newPlots, cost, success } = plantSeed(plots, index, selectedSeed, gold);
        if (success) {
            setPlots(newPlots);
            setGold(gold - cost);
        }
    };

    const handleHarvest = (index: number) => {
        const { newPlots, yieldAmount, success } = harvestPlot(plots, index);
        if (success) {
            setPlots(newPlots);
            setResources(prev => ({ ...prev, herbs: (prev.herbs || 0) + yieldAmount }));
        }
    };

    const handleUnlock = (index: number) => {
        const { newPlots, cost, success } = unlockPlot(plots, index, gold);
        if (success) {
            setPlots(newPlots);
            setGold(gold - cost);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6 max-w-4xl w-full shadow-2xl relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    <Sprout className="text-green-500" /> The Great Garden
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Seed Selector */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 col-span-1">
                        <h3 className="text-lg font-bold text-white mb-4">Seed Bag</h3>
                        <div className="space-y-3">
                            {(Object.keys(SEEDS) as SeedType[]).map((seedKey) => {
                                const seed = SEEDS[seedKey];
                                return (
                                    <button
                                        key={seed.id}
                                        onClick={() => setSelectedSeed(seed.id)}
                                        className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-3 ${selectedSeed === seed.id ? 'bg-green-900/40 border-green-500' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                                    >
                                        <div className="text-2xl">{seed.emoji}</div>
                                        <div>
                                            <div className="font-bold text-gray-200">{seed.name}</div>
                                            <div className="text-xs text-yellow-400">{seed.cost} Gold</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-6 p-3 bg-gray-900/80 rounded border border-gray-700">
                            <div className="text-xs text-gray-400 font-mono">RESOURCES</div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-green-400">🌿 Herbs: {resources.herbs}</span>
                                <span className="text-yellow-400">💰 {gold}</span>
                            </div>
                        </div>
                    </div>

                    {/* Garden Grid */}
                    <div className="col-span-3 grid grid-cols-3 gap-4">
                        {plots.map((plot, i) => {
                            if (!plot.unlocked) {
                                return (
                                    <div key={i} className="aspect-square bg-gray-950 rounded-lg border-2 border-dashed border-gray-800 flex flex-col items-center justify-center p-4 group relative overflow-hidden">
                                        <Lock className="text-gray-600 mb-2" size={32} />
                                        <div className="text-gray-500 font-bold mb-2">Locked Plot</div>
                                        <button
                                            onClick={() => handleUnlock(i)}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded transition-colors"
                                        >
                                            Unlock ({UNLOCK_COSTS[i]}g)
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div key={i} className="aspect-square bg-gray-800/30 rounded-lg border border-gray-700 relative overflow-hidden flex flex-col items-center justify-center group hover:bg-gray-800/50 transition-colors">
                                    {plot.seed ? (
                                        <>
                                            {/* Growth Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${plot.growth >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${plot.growth}%` }}
                                                />
                                            </div>

                                            {/* Plant Visual */}
                                            <div className="text-5xl mb-2 animate-bounce-slow transform transition-transform" style={{ transform: `scale(${0.5 + (plot.growth / 200)})` }}>
                                                {plot.growth >= 100 ? SEEDS[plot.seed].emoji : '🌱'}
                                            </div>

                                            <div className="text-xs text-gray-400 font-mono mb-2">
                                                {plot.growth >= 100 ? 'Ready!' : `${Math.floor(plot.growth)}%`}
                                            </div>

                                            {plot.growth >= 100 ? (
                                                <button
                                                    onClick={() => handleHarvest(i)}
                                                    className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow-lg animate-pulse"
                                                >
                                                    Harvest
                                                </button>
                                            ) : (
                                                <div className="text-[10px] text-gray-500">Growing...</div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mb-2">
                                                <div className="w-12 h-12 bg-gray-700/50 rounded-full" />
                                            </div>
                                            <button
                                                onClick={() => handlePlant(i)}
                                                disabled={gold < SEEDS[selectedSeed].cost}
                                                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${gold >= SEEDS[selectedSeed].cost ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                Plant {SEEDS[selectedSeed].name.split(' ')[0]}
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
