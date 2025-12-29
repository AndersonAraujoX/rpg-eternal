import React from 'react';
import { X, Star, Zap, Lock, ArrowUpCircle } from 'lucide-react';
import { STARLIGHT_UPGRADES, getStarlightUpgradeCost } from '../../engine/starlight';

interface StarlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    starlight: number;
    upgrades: Record<string, number>; // ID -> Level
    onBuy: (upgradeId: string) => void;
}

export const StarlightModal: React.FC<StarlightModalProps> = ({ isOpen, onClose, starlight, upgrades, onBuy }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-gray-900 border border-purple-500/50 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-purple-900/50 bg-gray-900/95 z-10">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-3">
                        <Star className="text-purple-400 fill-purple-400" size={32} />
                        Starlight Repository
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full border border-purple-500/30">
                            <Star size={18} className="text-yellow-300 fill-yellow-300" />
                            <span className="text-xl font-mono text-white font-bold">{starlight.toFixed(2)}</span>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-full">
                            <X size={28} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm fixed-attachment"></div>

                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
                        {STARLIGHT_UPGRADES.map(upgrade => {
                            const currentLevel = upgrades[upgrade.id] || 0;
                            const isMaxed = currentLevel >= upgrade.maxLevel;
                            const cost = getStarlightUpgradeCost(upgrade, currentLevel);
                            const canAfford = starlight >= cost;

                            return (
                                <div key={upgrade.id} className={`relative group p-6 rounded-xl border ${isMaxed ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-purple-500/30 bg-gray-800/80'} hover:border-purple-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col gap-4`}>

                                    {/* Upgrade Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-4xl shadow-inner">
                                                {upgrade.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                                    {upgrade.name}
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                                    {upgrade.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats & Progress */}
                                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Current Level</span>
                                            <span className={isMaxed ? "text-yellow-400 font-bold" : "text-white"}>
                                                {currentLevel} <span className="text-gray-600">/ {upgrade.maxLevel}</span>
                                            </span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                                style={{ width: `${(currentLevel / upgrade.maxLevel) * 100}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-xs text-purple-300 flex items-center gap-1">
                                            <Zap size={12} />
                                            Effect: {Math.round(upgrade.effectValue * 100)}% per level
                                            <span className="text-white ml-auto">
                                                Total: {Math.round(upgrade.effectValue * currentLevel * 100)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => onBuy(upgrade.id)}
                                        disabled={isMaxed || !canAfford}
                                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${isMaxed
                                                ? 'bg-transparent border border-yellow-500/30 text-yellow-500 cursor-default'
                                                : canAfford
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] text-white shadow-lg shadow-purple-900/50'
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {isMaxed ? (
                                            <>MAXED OUT</>
                                        ) : (
                                            <>
                                                {canAfford ? <ArrowUpCircle size={20} /> : <Lock size={18} />}
                                                {canAfford ? 'UPGRADE' : 'LOCKED'}
                                                <span className="flex items-center gap-1 ml-2 bg-black/20 px-2 py-0.5 rounded text-sm">
                                                    <Star size={14} className={canAfford ? "text-yellow-300" : "text-gray-500"} />
                                                    {cost.toLocaleString()}
                                                </span>
                                            </>
                                        )}
                                    </button>

                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
