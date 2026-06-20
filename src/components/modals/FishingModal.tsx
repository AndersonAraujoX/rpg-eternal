import React, { useState } from 'react';
import { Fish, Anchor } from 'lucide-react';
import { processFishingAdvanced } from '../../engine/fishing';
import { soundManager } from '../../engine/sound';

interface FishingModalProps {
    isOpen: boolean;
    onClose: () => void;
    fishCount: number;
    legendaryCount: number;
    setFish: (n: number) => void;
    setGameStats: (fn: (prev: any) => any) => void;
    items?: any[];
    convertSeasonalFish?: () => void;
}

export const FishingModal: React.FC<FishingModalProps> = ({ isOpen, onClose, fishCount, legendaryCount, setFish, setGameStats, items = [], convertSeasonalFish }) => {
    const [animate, setAnimate] = useState(false);

    if (!isOpen) return null;

    const handleCast = () => {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);

        const { fish, legendary } = processFishingAdvanced(1);
        if (fish > 0) {
            setFish(fishCount + fish);
            soundManager.playLevelUp();
        }
        if (legendary) {
            setGameStats(prev => ({ ...prev, legendaryFishCount: (prev.legendaryFishCount || 0) + 1 }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-cyan-900/50 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto bg-cyan-900/20 rounded-full flex items-center justify-center border-4 border-cyan-900/30 mb-4 relative overflow-hidden">
                        <Anchor className={`w-10 h-10 text-cyan-600 transition-transform duration-500 ${animate ? 'translate-y-4' : ''}`} />
                        {animate && (
                            <div className="absolute inset-0 bg-cyan-500/20 animate-ping rounded-full"></div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        O Cais de Pesca
                    </h2>
                    <p className="text-gray-400 text-sm">Relaxe e jogue sua linha.</p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center mb-6">
                    <div className="flex items-center justify-center gap-3 text-4xl mb-2">
                        <Fish className="w-8 h-8 text-cyan-400" />
                        <span className="font-mono text-cyan-100">{fishCount}</span>
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Peixes Capturados</p>
                </div>

                {legendaryCount > 0 && (
                    <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700/50 text-center mb-6">
                        <p className="text-yellow-500 font-bold text-sm uppercase mb-1">Peixes Lendários</p>
                        <p className="text-2xl text-yellow-100 font-mono">🌟 {legendaryCount}</p>
                    </div>
                )}

                <button
                    onClick={handleCast}
                    className="w-full py-4 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-bold text-white shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all"
                >
                    LANÇAR LINHA
                </button>

                {(() => {
                    const seasonalFishCount = (items || []).filter(item => item?.id === 'seasonal_fish' || item?.name === 'Peixe Sazonal').length;
                    return (
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-teal-900/40 text-center mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-teal-400 uppercase font-black tracking-wider text-left">Ecologia Sazonal</span>
                                <span className="text-xs text-teal-300 font-mono font-bold">🐟 {seasonalFishCount} no Inventário</span>
                            </div>
                            <p className="text-[10px] text-gray-400 text-left leading-relaxed mb-3">
                                Peixes sazonais capturados durante eventos sazonais podem ser convertidos em almas de prestígio para acelerar sua progressão.
                            </p>
                            <button
                                onClick={convertSeasonalFish}
                                disabled={seasonalFishCount === 0}
                                className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide border transition-all duration-300 ${
                                    seasonalFishCount > 0
                                        ? 'bg-teal-600 hover:bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-950/40 active:scale-95 hover:scale-[1.02]'
                                        : 'bg-gray-850 border-gray-800 text-gray-550 cursor-not-allowed'
                                }`}
                            >
                                Converter em Almas (+{seasonalFishCount * 500})
                            </button>
                        </div>
                    );
                })()}

                <p className="text-center text-xs text-gray-500 mt-4">
                    Passivo: 5% de chance de pescar a cada tick.
                </p>
            </div>
        </div>
    );
};
