import React from 'react';
import type { Pet } from '../engine/types';
import { formatNumber } from '../utils';

interface PetListProps {
    pets: Pet[];
    actions: any;
    gold: number;
    souls: number;
}

export const PetList: React.FC<PetListProps> = ({ pets, actions, gold, souls }) => {
    if (!pets || pets.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-800 text-center text-gray-400">
                <span className="text-4xl mb-2">🐾</span>
                <p className="text-sm font-semibold">Nenhum mascote recrutado ainda.</p>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                    Visite a Taverna na Vila para invocar novos companheiros e lutar ao lado de seus heróis!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-800 p-3 overflow-y-auto no-scrollbar grid grid-cols-2 md:grid-cols-3 gap-3 border-t-2 border-gray-700">
            {pets.map(pet => {
                const xpPercent = Math.min(100, Math.floor((pet.xp / pet.maxXp) * 100));

                return (
                    <div
                        key={pet.id}
                        className="relative p-3 rounded-xl border-2 border-gray-700 bg-gray-900/40 hover:bg-gray-900/60 transition-all flex flex-col justify-between gap-2.5 shadow-md group hover:border-amber-600/30"
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-4xl filter drop-shadow group-hover:scale-110 transition-transform select-none">
                                {pet.emoji}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="font-bold text-xs text-white truncate leading-tight">{pet.name}</h4>
                                <span className="inline-block text-[9px] font-black text-amber-400 bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.5 rounded-md mt-1">
                                    NVL {pet.level}
                                </span>
                            </div>
                        </div>

                        {/* XP Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[8px] text-gray-400 font-mono">
                                <span>Progresso:</span>
                                <span>{pet.xp}/{pet.maxXp} XP</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-750">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                                    style={{ width: `${xpPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Passive Bonus Description */}
                        <div className="bg-black/30 px-2 py-1.5 rounded-lg border border-gray-800 text-left">
                            <span className="text-[9px] text-stone-500 font-semibold block uppercase tracking-wider font-mono">Bônus Passivo</span>
                            <span className="text-[10px] text-green-400 font-bold block mt-0.5">{pet.bonus}</span>
                        </div>

                        {/* Actions Panel */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                                onClick={() => actions.feedPet('gold', pet.id)}
                                disabled={gold < 100}
                                className={`py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all border flex flex-col items-center justify-center
                                    ${gold >= 100
                                        ? 'bg-yellow-600/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 active:scale-95'
                                        : 'bg-stone-900/40 border-stone-850 text-stone-600 cursor-not-allowed'
                                    }`}
                                title="Alimentar com 100 de Ouro (+10 XP)"
                            >
                                <span className="font-mono">$ Ouro</span>
                                <span className="text-[8px] opacity-60 mt-0.5">-100g</span>
                            </button>
                            <button
                                onClick={() => actions.feedPet('souls', pet.id)}
                                disabled={souls < 10}
                                className={`py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all border flex flex-col items-center justify-center
                                    ${souls >= 10
                                        ? 'bg-purple-650/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 active:scale-95'
                                        : 'bg-stone-900/40 border-stone-850 text-stone-600 cursor-not-allowed'
                                    }`}
                                title="Alimentar com 10 Almas (+100 XP)"
                            >
                                <span className="font-mono">🕯️ Almas</span>
                                <span className="text-[8px] opacity-60 mt-0.5">-10 almas</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
