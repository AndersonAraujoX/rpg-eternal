import React from 'react';
// unused Coins import removed

interface TavernModalProps {
    isOpen: boolean;
    onClose: () => void;
    gold: number;
    actions: any;
    tavernPurchases: number;
}

export const TavernModal: React.FC<TavernModalProps> = ({ isOpen, onClose, gold, actions, tavernPurchases }) => {
    if (!isOpen) return null;

    const baseCost = 500;
    const costIncrease = 50;
    const currentCost = baseCost + (tavernPurchases * costIncrease);

    const getCostFor = (amount: number) => {
        let cost = 0;
        for (let i = 0; i < amount; i++) {
            cost += baseCost + ((tavernPurchases + i) * costIncrease);
        }
        return cost;
    };

    const cost1 = getCostFor(1);
    const cost10 = getCostFor(10);
    const cost100 = getCostFor(100);

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-amber-900 border-4 border-amber-500 w-full max-w-md p-6 rounded-lg shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-amber-200 text-2xl font-bold mb-4">THE TAVERN</h2>
                <div className="text-white mb-6">Current Gold: <span className="text-yellow-400 font-mono">{Math.floor(gold)}</span></div>

                <div className="flex flex-col gap-2 mb-4">
                    <button onClick={() => actions.summonTavern(1)} disabled={gold < cost1} className="w-full bg-amber-700 hover:bg-amber-600 border-2 border-amber-400 text-white p-3 rounded transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="text-lg font-bold">SUMMON x1</div>
                        <div className="text-sm opacity-75 text-yellow-300">{Math.floor(cost1)} Gold</div>
                    </button>

                    <button onClick={() => actions.summonTavern(10)} disabled={gold < cost10} className="w-full bg-amber-800 hover:bg-amber-700 border-2 border-amber-500 text-white p-3 rounded transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="text-lg font-bold">SUMMON x10</div>
                        <div className="text-sm opacity-75 text-yellow-300">{Math.floor(cost10)} Gold</div>
                    </button>

                    <button onClick={() => actions.summonTavern(100)} disabled={gold < cost100} className="w-full bg-amber-900 hover:bg-amber-800 border-2 border-amber-600 text-white p-3 rounded transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="text-lg font-bold">SUMMON x100</div>
                        <div className="text-sm opacity-75 text-yellow-300">{Math.floor(cost100)} Gold</div>
                    </button>
                </div>

                <div className="text-[10px] text-amber-300 mt-2">
                    Chance for: New Classes (Rogue, Paladin, Warlock), Artifacts with scaling costs (+50g/buy).
                </div>
            </div>
        </div>
    );
};
