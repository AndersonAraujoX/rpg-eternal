
import React from 'react';
import { Coins, X, Info } from "lucide-react";
import type { Hero } from "../../engine/types";
import { DiceGame } from "../minigames/DiceGame";

interface TavernModalProps {
    heroes: Hero[];
    gold: number;
    summonTavern: (amount: number) => void;
    onClose: () => void;
    setGold: React.Dispatch<React.SetStateAction<number>>;
}

export function TavernModal({ heroes, gold, summonTavern, onClose, setGold }: TavernModalProps) {

    const handleWin = (amount: number) => setGold((g: number) => g + amount);
    const handleLose = (amount: number) => setGold((g: number) => g - amount);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-lg w-full border border-amber-600 relative flex flex-col gap-4 shadow-xl">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X size={20} /></button>

                <h2 className="text-2xl font-bold text-amber-500 mb-2 flex items-center gap-2"><Coins /> The Tavern</h2>

                <div className="flex flex-col gap-6">
                    {/* Summoning Section */}
                    <div className="bg-gray-800 p-4 rounded border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-2 border-b border-gray-600 pb-1">Recruit Heroes</h3>
                        <div className="flex gap-2">
                            <button onClick={() => summonTavern(1)} className="flex-1 btn-retro bg-amber-700 hover:bg-amber-600 text-white py-2 rounded">
                                Summon 1 (100g)
                            </button>
                            <button onClick={() => summonTavern(10)} className="flex-1 btn-retro bg-amber-900 hover:bg-amber-800 text-white py-2 rounded">
                                Summon 10 (1000g)
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Info size={12} /> Current Roster: {heroes.length} Heroes
                        </div>
                    </div>

                    {/* Minigame Section */}
                    <DiceGame gold={gold} onWin={handleWin} onLose={handleLose} />
                </div>
            </div>
        </div>
    );
}
