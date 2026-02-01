import React from 'react';
import { Ghost } from 'lucide-react';
import type { GameActions, Talent, Boss } from '../../engine/types';

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    souls: number;
    talents: Talent[];
    boss: Boss;
    actions: GameActions;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, actions, souls, talents, boss }) => {
    const [buyAmount, setBuyAmount] = React.useState<1 | 10 | 100>(1);
    if (!isOpen) return null;


    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gray-900 border-4 border-purple-500 w-full max-w-lg p-4 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-center text-purple-400 text-xl font-bold mb-4 flex items-center justify-center gap-2"><Ghost /> SOUL TALENT SHOP</h2>

                <div className="flex justify-between items-center mb-4 bg-gray-800 p-2 rounded">
                    <div className="text-white">Souls: <span className="text-purple-400 font-bold">{souls}</span></div>
                    <div className="flex gap-1">
                        {[1, 10, 100].map(amt => (
                            <button
                                key={amt}
                                onClick={() => setBuyAmount(amt as 1 | 10 | 100)}
                                className={`px-2 py-1 text-xs rounded border ${buyAmount === amt ? 'bg-purple-600 border-purple-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-400'}`}
                            >
                                x{amt}
                            </button>
                        ))}
                    </div>
                </div>

                {souls > 1000 && (
                    <div className="mb-4 bg-yellow-900 p-2 rounded border border-yellow-500 text-center animate-pulse">
                        <button onClick={actions.triggerAscension} className="text-yellow-300 font-bold w-full uppercase">Ascend (Get Divinity)</button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto mb-4">
                    {talents.map(t => (
                        <div key={t.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700">
                            <div>
                                <div className="text-yellow-300 font-bold text-sm">{t.name} <span className="text-xs text-gray-500">(Lvl {t.level}/{t.maxLevel})</span></div>
                                <div className="text-[10px] text-gray-400">{t.description}</div>
                            </div>
                            <button
                                onClick={() => actions.buyTalent(t.id, buyAmount)}
                                disabled={souls < t.cost || t.level >= t.maxLevel}
                                className={`text-[10px] px-3 py-1 rounded border ${souls >= t.cost && t.level < t.maxLevel ? 'bg-purple-600 border-purple-400 hover:bg-purple-500' : 'bg-gray-700 border-gray-600 opacity-50'}`}
                            >
                                {t.level >= t.maxLevel ? 'MAX' : `Upgrade x${buyAmount} (~${t.cost * buyAmount})`}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Rebirth Button inside Shop for visibility */}
                {boss.level > 10 && (
                    <div className="mt-2 text-center border-t border-gray-600 pt-2">
                        <div className="text-gray-400 text-xs mb-1">Stuck? Reset for Souls.</div>
                        <button onClick={actions.triggerRebirth} className="btn-retro bg-red-900 text-red-200 border border-red-500 px-6 py-2 rounded hover:bg-red-800 w-full">REBIRTH ( +{Math.floor(boss.level / 5)} Souls )</button>
                    </div>
                )}
            </div>
        </div>
    );
};
