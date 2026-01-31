import React from 'react';
import { Ghost, Zap, Skull } from 'lucide-react';
import type { GameActions } from '../../engine/types';

interface VoidModalProps {
    isOpen: boolean;
    onClose: () => void;
    voidMatter: number;
    actions: GameActions;
}

export const VoidModal: React.FC<VoidModalProps> = ({ isOpen, onClose, voidMatter, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-purple-950 border-4 border-purple-600 w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-purple-100">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-purple-400 text-3xl font-bold mb-4 flex items-center justify-center gap-2 font-mono"><Ghost /> THE VOID</h2>

                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => { actions.enterVoid(); onClose(); }}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow-lg animate-pulse flex items-center gap-2"
                    >
                        <Skull /> ENTER VOID DIMENSION (30s)
                    </button>
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
