import React from 'react';
import { FlaskConical, Sparkles } from 'lucide-react';
import { POTIONS } from '../../engine/types';
import type { Resources, Potion } from '../../engine/types';

interface AlchemyModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: Resources;
    activePotions: { id: string, name: string, effect: Potion['effect'], value: number, endTime: number }[];
    brewPotion: (id: string) => void;
}

export const AlchemyModal: React.FC<AlchemyModalProps> = ({ isOpen, onClose, resources, activePotions, brewPotion }) => {
    if (!isOpen) return null;

    const canAfford = (p: Potion) => {
        return p.cost.every(c => (resources[c.type] || 0) >= c.amount);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-purple-900/50 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-900/30">
                        <FlaskConical className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            Alchemist's Lab
                        </h2>
                        <p className="text-gray-400 text-sm">Brew potent elixirs from gathered materials.</p>
                    </div>
                </div>

                {/* Active Potions */}
                {activePotions.length > 0 && (
                    <div className="mb-6 p-4 bg-purple-900/10 rounded-lg border border-purple-900/30">
                        <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Active Effects
                        </h3>
                        <div className="space-y-1">
                            {activePotions.map(p => (
                                <div key={p.id} className="text-xs flex justify-between text-purple-200">
                                    <span>{p.name} (+{(p.value * 100).toFixed(0)}% {p.effect.toUpperCase()})</span>
                                    <span>{Math.ceil((p.endTime - Date.now()) / 1000)}s</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid gap-4 max-h-[50vh] overflow-y-auto pr-2">
                    {POTIONS.map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="text-2xl">{p.emoji}</div>
                                <div>
                                    <h4 className="font-bold text-gray-200">{p.name}</h4>
                                    <p className="text-xs text-gray-400">{p.description}</p>
                                    <div className="flex gap-2 mt-1">
                                        {p.cost.map((c, i) => (
                                            <span key={i} className={`text-xs px-1.5 py-0.5 rounded border ${(resources[c.type] || 0) >= c.amount
                                                    ? 'bg-gray-700 text-gray-300 border-gray-600'
                                                    : 'bg-red-900/20 text-red-400 border-red-900/50'
                                                }`}>
                                                {c.amount} {c.type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => brewPotion(p.id)}
                                disabled={!canAfford(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${canAfford(p)
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Brew
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
