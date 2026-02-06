
import React from 'react';
import { Coins, X, Info } from "lucide-react";
import type { Hero } from "../../engine/types";
import { DiceGame } from "../minigames/DiceGame";
import { calculateTavernCost } from "../../engine/tavern";

interface TavernModalProps {
    heroes: Hero[];
    gold: number;
    tavernPurchases: number;
    summonTavern: (amount: number) => void;
    onClose: () => void;
    setGold: React.Dispatch<React.SetStateAction<number>>;
    heroPity?: number;
    petPity?: number;
}

export function TavernModal({ heroes, gold, tavernPurchases, summonTavern, onClose, setGold, heroPity = 0, petPity = 0 }: TavernModalProps) {

    const handleWin = (amount: number) => setGold((g: number) => g + amount);
    const handleLose = (amount: number) => setGold((g: number) => g - amount);

    const cost1 = calculateTavernCost(1, tavernPurchases);
    const cost10 = calculateTavernCost(10, tavernPurchases);

    // Base Chances
    const baseHeroChance = 30;
    const basePetChance = 15;

    // Calculated Chances with Pity
    const currentHeroChance = Math.min(100, baseHeroChance + (heroPity * 2));
    const currentPetChance = Math.min(100, basePetChance + (petPity * 2));

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-lg w-full border border-amber-600 relative flex flex-col gap-4 shadow-xl">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X size={20} /></button>

                <h2 className="text-2xl font-bold text-amber-500 mb-2 flex items-center gap-2"><Coins /> The Tavern</h2>

                <div className="flex flex-col gap-6">
                    {/* Summoning Section */}
                    <div className="bg-gray-800 p-4 rounded border border-gray-700">
                        <div className="flex justify-between items-center border-b border-gray-600 pb-1 mb-2">
                            <h3 className="text-lg font-bold text-white">Recruit Heroes</h3>
                            <div className="flex flex-col items-end text-xs text-amber-400">
                                <span>Hero Luck: {currentHeroChance}% {heroPity > 0 && <span className="text-green-400">(+{heroPity * 2}%)</span>}</span>
                                <span>Pet Luck: {currentPetChance}% {petPity > 0 && <span className="text-green-400">(+{petPity * 2}%)</span>}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => summonTavern(1)}
                                disabled={gold < cost1}
                                className={`flex-1 btn-retro py-2 rounded text-white ${gold < cost1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-amber-700 hover:bg-amber-600'}`}
                            >
                                Summon 1 ({cost1}g)
                            </button>
                            <button
                                onClick={() => summonTavern(10)}
                                disabled={gold < cost10}
                                className={`flex-1 btn-retro py-2 rounded text-white ${gold < cost10 ? 'bg-gray-600 cursor-not-allowed' : 'bg-amber-900 hover:bg-amber-800'}`}
                            >
                                Summon 10 ({cost10}g)
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
