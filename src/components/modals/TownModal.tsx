import React from 'react';
import { Home, Hammer, ArrowUpCircle } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 border-4 border-amber-700 w-full max-w-4xl p-6 rounded-lg shadow-2xl relative max-h-[85vh] flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <h2 className="text-amber-500 text-3xl font-bold mb-8 flex items-center justify-center gap-3 border-b border-amber-900/50 pb-4">
                    <Home size={32} /> TOWN CENTER
                </h2>

                {/* Buildings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    {buildings.map(building => {
                        const isMax = building.level >= building.maxLevel;
                        const canAfford = gold >= building.cost;

                        return (
                            <div
                                key={building.id}
                                className="bg-stone-900/80 p-5 rounded-xl border border-stone-700 hover:border-amber-600/50 transition-all duration-300 relative group overflow-hidden"
                            >
                                {/* Background Glow on Hover */}
                                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl bg-stone-800 p-3 rounded-lg shadow-inner border border-stone-600">
                                            {building.emoji}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-amber-100">{building.name}</h3>
                                            <div className="text-stone-400 text-sm">{building.description}</div>
                                        </div>
                                    </div>
                                    <div className="bg-stone-950 px-3 py-1 rounded text-amber-500 font-mono text-sm border border-stone-800">
                                        Lvl {building.level} / {building.maxLevel}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="bg-black/30 p-3 rounded-lg mb-4 text-sm text-stone-300 border border-stone-800/50">
                                    <div className="flex justify-between mb-1">
                                        <span>Current Bonus:</span>
                                        <span className="text-green-400 font-bold">
                                            {building.bonus.replace('/ Lvl', '')} (x{building.level - 1})
                                        </span>
                                    </div>
                                    <div className="text-xs text-stone-500 italic mt-1">
                                        {building.bonus} per level
                                    </div>
                                </div>

                                {/* Upgrade Button */}
                                <button
                                    onClick={() => upgradeBuilding(building.id)}
                                    disabled={isMax || !canAfford}
                                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200
                                        ${isMax
                                            ? 'bg-green-900/50 text-green-400 cursor-default border border-green-900'
                                            : canAfford
                                                ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-lg border border-amber-600'
                                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                                        }`}
                                >
                                    {isMax ? (
                                        <>Match <Hammer size={18} /> MAX LEVEL</>
                                    ) : (
                                        <>
                                            <ArrowUpCircle size={18} />
                                            Upgrade ({formatNumber(building.cost)} Gold)
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center text-stone-500 text-sm">
                    Invest in your town to unlock permanent bonuses for your guild.
                </div>
            </div>
        </div>
    );
};
