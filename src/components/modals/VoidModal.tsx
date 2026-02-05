import React from 'react';
import { Ghost, Zap, Skull } from 'lucide-react';
import type { GameActions } from '../../engine/types';

interface VoidModalProps {
    isOpen: boolean;
    onClose: () => void;
    voidMatter: number;
    actions: GameActions;
    voidAscensions: number;
}

export const VoidModal: React.FC<VoidModalProps> = ({ isOpen, onClose, voidMatter, actions, voidAscensions }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-purple-950 border-4 border-purple-600 w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-purple-100">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-purple-400 text-3xl font-bold mb-4 flex items-center justify-center gap-2 font-mono"><Ghost /> THE VOID</h2>

                <div className="flex flex-col gap-4 justify-center mb-6">
                    <button
                        onClick={() => { actions.enterVoid(); onClose(); }}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow-lg animate-pulse flex items-center gap-2 justify-center"
                    >
                        <Skull /> ENTER VOID DIMENSION (30s)
                    </button>

                    <div className="border-t border-purple-800 pt-4 mt-2">
                        <h3 className="text-center font-bold text-red-400 mb-2">FINAL CHALLENGE</h3>
                        <button
                            onClick={() => { actions.challengeVoidCore(); onClose(); }}
                            disabled={voidAscensions < 5}
                            className={`w-full px-6 py-4 font-black rounded shadow-lg flex items-center gap-2 justify-center border-2 
                                ${voidAscensions >= 5 ? 'bg-red-900 border-red-500 hover:bg-red-800 text-red-100 animate-pulse' : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Skull className={voidAscensions >= 5 ? "animate-spin-slow" : ""} />
                            {voidAscensions >= 5 ? "SUMMON VOID CORE" : `LOCKED (Ascensions: ${voidAscensions}/5)`}
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-purple-300 mb-2 border-b border-purple-800 pb-1">Dark Gifts</h3>
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center bg-purple-900 p-2 rounded border border-purple-800">
                        <div className="flex items-center gap-2">
                            <Zap className="text-yellow-400" size={16} />
                            <span>Void Charge (Instant Ultimate)</span>
                        </div>
                        <button
                            onClick={() => actions.buyDarkGift(1, 'ult_charge')}
                            className="px-3 py-1 bg-black rounded border border-purple-500 hover:bg-purple-800 text-xs"
                            disabled={voidMatter < 1}
                        >
                            Cost: 1 <Ghost size={10} className="inline" />
                        </button>
                    </div>
                    <div className="p-2 text-xs text-purple-400 text-center italic">
                        More forbidden knowledge coming soon...
                    </div>
                </div>

                <div className="mt-4 text-center text-xs text-purple-500">
                    Current Void Matter: {voidMatter}
                </div>
            </div>
        </div>
    );
};
