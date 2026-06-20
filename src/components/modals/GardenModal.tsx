import React, { useState, useEffect } from 'react';
import { X, Sprout, Lock, Zap } from 'lucide-react';
import type { GardenPlot, SeedType, Resources, Rune, Item } from '../../engine/types';
import { SEEDS } from '../../engine/types';
import { plantSeed, harvestPlot, unlockPlot, UNLOCK_COSTS, tickGarden } from '../../engine/garden';

interface GardenModalProps {
    isOpen: boolean;
    onClose: () => void;
    plots: GardenPlot[];
    setPlots: (plots: GardenPlot[]) => void;
    resources: Resources;
    setResources: React.Dispatch<React.SetStateAction<Resources>>;
    gold: number;
    setGold: (g: number) => void;
    gardenSpeedMult?: number;
    // ── Sinergia L5-1: Void Overgrowth ─────────────────────────────
    voidOvergrowthActive?: boolean;
    setVoidOvergrowthActive?: (v: boolean) => void;
    voidHarvestRuneFragments?: boolean;
    voidHarvestRareMinerals?: boolean;
    onVoidHarvest?: (runeFragment: Rune, rareMaterial: Item) => void;
}

export const GardenModal: React.FC<GardenModalProps> = ({
    isOpen, onClose, plots, setPlots, resources, setResources, gold, setGold,
    gardenSpeedMult = 1.0,
    voidOvergrowthActive = false,
    setVoidOvergrowthActive,
    voidHarvestRuneFragments = false,
    voidHarvestRareMinerals = false,
    onVoidHarvest,
}) => {
    const [selectedSeed, setSelectedSeed] = useState<SeedType>('moonleaf');
    const [lastVoidReward, setLastVoidReward] = useState<string | null>(null);

    // Multiplicador de tempo: Void Overgrowth dobra o tempo de maturação (reduz velocidade)
    const effectiveSpeedMult = voidOvergrowthActive
        ? gardenSpeedMult / 2.0  // metade da velocidade = tempo dobrado
        : gardenSpeedMult;

    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setPlots(tickGarden(plots, Date.now(), effectiveSpeedMult));
        }, 1000);
        return () => clearInterval(interval);
    }, [isOpen, plots, setPlots, effectiveSpeedMult]);

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

            // ── Sinergia L5-1: Void Overgrowth — recompensas especiais ──
            if (voidOvergrowthActive && (voidHarvestRuneFragments || voidHarvestRareMinerals)) {
                // Gerar fragmento de Runa de tier alto (Épico ou Lendário)
                const rarities: Array<'epic' | 'legendary'> = ['epic', 'epic', 'legendary'];
                const rarity = rarities[Math.floor(Math.random() * rarities.length)];
                const runeFragment: Rune = {
                    id: `void-rune-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: `Fragmento Rúnico do Vazio`,
                    stat: 'attack',
                    value: rarity === 'legendary' ? 25 : 15,
                    emoji: '☢️',
                    rarity,
                    description: `Fragmento Rúnico corrompido pelo Vazio. ${rarity === 'legendary' ? 'LENDÁRIO!' : 'Épico.'}`,
                };

                // Gerar minério raro para a Forja
                const mineralItem: Item = {
                    id: `void-mineral-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    name: 'Minério do Vazio',
                    type: 'material',
                    rarity: 'epic',
                    value: 500,
                    emoji: '🌑',
                };

                if (onVoidHarvest) {
                    onVoidHarvest(runeFragment, mineralItem);
                }

                setLastVoidReward(`☢️ Colheita do Vazio! +${runeFragment.name} (${rarity.toUpperCase()}) & Minério do Vazio!`);
                setTimeout(() => setLastVoidReward(null), 4000);

                // Desativar Void Overgrowth após a colheita
                if (setVoidOvergrowthActive) {
                    setVoidOvergrowthActive(false);
                }
            }
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
            <div className={`bg-gray-900 border rounded-lg p-6 max-w-4xl w-full shadow-2xl relative animate-fadeIn
                ${voidOvergrowthActive ? 'border-purple-500/60 shadow-purple-900/30' : 'border-green-500/30'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>

                <h2 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 flex items-center gap-2
                    ${voidOvergrowthActive
                        ? 'from-purple-400 to-violet-600'
                        : 'from-green-400 to-emerald-600'}`}>
                    {voidOvergrowthActive ? <Zap className="text-purple-400" /> : <Sprout className="text-green-500" />}
                    {voidOvergrowthActive ? '☢️ The Corrupted Garden' : 'The Great Garden'}
                </h2>

                {/* Void Overgrowth Status Banner */}
                {voidOvergrowthActive && (
                    <div className="mb-4 p-3 bg-purple-950/60 border border-purple-500/50 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-1">
                            <Zap size={14} />
                            <span>VOID OVERGROWTH ATIVO</span>
                        </div>
                        <p className="text-xs text-purple-400">
                            O Vazio corrompeu o solo! A maturação está <span className="text-red-400 font-bold">2x mais lenta</span>,
                            mas a próxima colheita garantirá um <span className="text-yellow-300 font-bold">Fragmento Rúnico</span> e um
                            <span className="text-cyan-300 font-bold"> Minério do Vazio</span>.
                        </p>
                    </div>
                )}

                {/* Void Harvest Reward Notification */}
                {lastVoidReward && (
                    <div className="mb-4 p-3 bg-purple-900/80 border border-purple-400 rounded-lg animate-pulse">
                        <p className="text-purple-200 text-sm font-bold text-center">{lastVoidReward}</p>
                    </div>
                )}

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
                                            {voidOvergrowthActive && (
                                                <div className="text-xs text-purple-400 mt-0.5">
                                                    ⏱ {Math.round(seed.growthTime * 2)}s (Void)
                                                </div>
                                            )}
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
                                <div key={i} className={`aspect-square rounded-lg border relative overflow-hidden flex flex-col items-center justify-center group hover:opacity-90 transition-all
                                    ${voidOvergrowthActive
                                        ? 'bg-purple-950/30 border-purple-700/50'
                                        : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'}`}>
                                    {plot.seed ? (
                                        <>
                                            {/* Growth Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${plot.growth >= 100
                                                        ? (voidOvergrowthActive ? 'bg-purple-500' : 'bg-green-500')
                                                        : (voidOvergrowthActive ? 'bg-violet-700' : 'bg-blue-500')}`}
                                                    style={{ width: `${plot.growth}%` }}
                                                />
                                            </div>

                                            {/* Plant Visual */}
                                            <div className="text-5xl mb-2 transform transition-transform" style={{ transform: `scale(${0.5 + (plot.growth / 200)})` }}>
                                                {voidOvergrowthActive
                                                    ? (plot.growth >= 100 ? '🌑' : '☢️')
                                                    : (plot.growth >= 100 ? SEEDS[plot.seed].emoji : '🌱')}
                                            </div>

                                            <div className={`text-xs font-mono mb-2 ${voidOvergrowthActive ? 'text-purple-400' : 'text-gray-400'}`}>
                                                {plot.growth >= 100 ? (voidOvergrowthActive ? '☢️ Corrompida!' : 'Ready!') : `${Math.floor(plot.growth)}%`}
                                            </div>

                                            {plot.growth >= 100 ? (
                                                <button
                                                    onClick={() => handleHarvest(i)}
                                                    className={`px-4 py-1 text-white text-xs font-bold rounded shadow-lg animate-pulse
                                                        ${voidOvergrowthActive
                                                            ? 'bg-purple-700 hover:bg-purple-600'
                                                            : 'bg-green-600 hover:bg-green-500'}`}
                                                >
                                                    {voidOvergrowthActive ? '☢️ Colher' : 'Harvest'}
                                                </button>
                                            ) : (
                                                <div className={`text-[10px] ${voidOvergrowthActive ? 'text-purple-500' : 'text-gray-500'}`}>
                                                    {voidOvergrowthActive ? 'Corrompendo...' : 'Growing...'}
                                                </div>
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
