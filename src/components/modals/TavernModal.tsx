import React from 'react';
// unused Coins import removed

interface TavernModalProps {
    isOpen: boolean;
    onClose: () => void;
    gold: number;
    actions: any;
}

export const TavernModal: React.FC<TavernModalProps> = ({ isOpen, onClose, gold, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-amber-900 border-4 border-amber-500 w-full max-w-md p-6 rounded-lg shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-amber-200 text-2xl font-bold mb-4">THE TAVERN</h2>
                <div className="text-white mb-6">Current Gold: <span className="text-yellow-400 font-mono">{gold}</span></div>
                <button onClick={actions.summonTavern} disabled={gold < 500} className="w-full bg-amber-700 hover:bg-amber-600 border-2 border-amber-400 text-white p-4 rounded mb-2 transition-all active:scale-95"> <div className="text-lg font-bold">SUMMON HERO / ITEM</div> <div className="text-sm opacity-75">Cost: 500 Gold</div> </button>
                <div className="text-[10px] text-amber-300"> Chance for: New Classes (Rogue, Paladin, Warlock), Artifacts, or Stat Boosts. </div>
            </div>
        </div>
    );
};
