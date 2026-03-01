import React from 'react';
import { Home, Hammer, ArrowUpCircle, Info, Lock } from 'lucide-react';
import type { Building } from '../../engine/types';
import { formatNumber } from '../../utils';

interface TownModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildings: Building[];
    gold: number;
    upgradeBuilding: (id: string) => void;
}

export const TownModal: React.FC<TownModalProps> = ({ isOpen, onClose, buildings, gold, upgradeBuilding }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-500">
            <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-black border-2 border-amber-600/30 w-full max-w-5xl p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative max-h-[90vh] flex flex-col overflow-hidden">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 blur-[80px] -z-10" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-stone-500 hover:text-white hover:rotate-90 transition-all duration-300 z-20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Section */}
                <div className="text-center mb-10">
                    <h2 className="text-amber-500 text-4xl font-black tracking-tighter mb-2 flex items-center justify-center gap-4">
                        <Home size={36} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                        CENTRO DA CIDADE
                    </h2>
                    <p className="text-stone-400 text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                        <Info size={14} /> Expanda seu domínio para desbloquear novas fronteiras
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="bg-stone-950/80 px-6 py-2 rounded-full border border-amber-900/50 text-amber-100 flex items-center gap-3">
                            <span className="text-xs text-stone-500">Tesouro:</span>
                            <span className="font-mono font-bold text-amber-500">{formatNumber(gold)} Ouro</span>
                        </div>
                    </div>
                </div>

                {/* Buildings Grid */}
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                        {buildings.map(building => {
                            const isMax = building.level >= building.maxLevel;
                            const canAfford = gold >= building.cost;
                            const isSpecial = building.id === 'guild_hall';

                            return (
                                <div
                                    key={building.id}
                                    className={`relative group flex flex-col bg-stone-900/40 border rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] 
                                        ${isSpecial && building.level === 0 ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-stone-800 hover:border-amber-600/50 shadow-xl'}`}
                                >
                                    {/* Building Header */}
                                    <div className="flex gap-5 items-start mb-6">
                                        <div className={`text-5xl p-4 rounded-xl shadow-2xl border ${isSpecial && building.level === 0 ? 'bg-amber-900/40 border-amber-500/50 animate-pulse' : 'bg-stone-800 border-stone-700'}`}>
                                            {building.emoji}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{building.name}</h3>
                                                <span className="text-[10px] bg-stone-950 px-2 py-1 rounded-full border border-stone-800 text-stone-400 font-mono">
                                                    LVL {building.level} / {building.maxLevel}
                                                </span>
                                            </div>
                                            <p className="text-stone-400 text-sm leading-relaxed">{building.description}</p>
                                        </div>
                                    </div>

                                    {/* Stats Panel */}
                                    <div className="mt-auto">
                                        <div className="bg-black/40 rounded-xl p-4 mb-5 border border-white/5 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-stone-500">Efeito atual</span>
                                                <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">
                                                    {building.level > 0 ? (building.effectValue * (building.level === 1 && building.maxLevel === 1 ? 1 : building.level)).toLocaleString() : '---'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-amber-500 h-full transition-all duration-1000"
                                                    style={{ width: `${(building.level / building.maxLevel) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-[10px] text-stone-500 italic mt-1 flex justify-between">
                                                <span>{building.bonus}</span>
                                                {isSpecial && building.level === 0 && <span className="text-amber-400 animate-pulse flex items-center gap-1 font-bold uppercase"><Lock size={10} /> Desbloqueio Crítico</span>}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => upgradeBuilding(building.id)}
                                            disabled={isMax || !canAfford}
                                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl
                                                ${isMax
                                                    ? 'bg-stone-800 text-stone-500 cursor-default border border-stone-700'
                                                    : canAfford
                                                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/20 active:scale-95'
                                                        : 'bg-stone-900/50 text-stone-600 cursor-not-allowed border border-stone-800'
                                                }`}
                                        >
                                            {isMax ? (
                                                <>MÁXIMO ALCANÇADO</>
                                            ) : (
                                                <>
                                                    <Hammer size={18} className={canAfford ? 'animate-bounce' : ''} />
                                                    {building.level === 0 ? 'CONSTRUIR' : 'MELHORAR'} ({formatNumber(building.cost)})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-4 pt-4 border-t border-stone-800/50 text-center">
                    <div className="inline-flex items-center gap-2 text-stone-500 text-xs bg-stone-900/50 px-4 py-2 rounded-full border border-stone-800">
                        <Info size={12} className="text-amber-600" />
                        Cada melhoria é permanente e afeta todos os heróis da guilda.
                    </div>
                </div>
            </div>
        </div>
    );
};
