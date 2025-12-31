import React from 'react';
import { Layers } from 'lucide-react';
import type { MonsterCard } from '../../engine/types';

interface CardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClose: () => void;
    cards: MonsterCard[];
    onDuel: () => void;
}

export const CardsModal: React.FC<CardsModalProps> = ({ isOpen, onClose, cards, onDuel }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gray-900 border-4 border-white w-full max-w-lg h-[60vh] p-4 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-red-500 font-bold">X</button>
                <h2 className="text-center text-white text-xl font-bold mb-4 flex items-center justify-center gap-2"><Layers /> MONSTER CARDS</h2>

                {/* Stats Summary */}
                <div className="flex justify-center gap-4 mb-4 text-xs">
                    <span className="text-red-400">⚔️ +{Math.round(cards.filter(c => c.stat === 'attack').reduce((acc, c) => acc + c.count * c.value, 0) * 100)}%</span>
                    <span className="text-yellow-400">💰 +{Math.round(cards.filter(c => c.stat === 'gold').reduce((acc, c) => acc + c.count * c.value, 0) * 100)}%</span>
                    <span className="text-purple-400">✨ +{Math.round(cards.filter(c => c.stat === 'xp').reduce((acc, c) => acc + c.count * c.value, 0) * 100)}%</span>
                    <span className="text-blue-400">🛡️ +{Math.round(cards.filter(c => c.stat === 'defense').reduce((acc, c) => acc + c.count * c.value, 0) * 100)}%</span>
                </div>

                <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[40vh] p-2">
                    {cards.map(c => (
                        <div key={c.id} className="bg-gray-800 border border-gray-600 p-2 rounded flex flex-col items-center justify-center relative group" title={`+${Math.round(c.value * 100)}% ${c.stat.toUpperCase()} per card`}>
                            <div className="text-2xl">{c.id}</div>
                            <div className="text-[10px] text-gray-400 mt-1">x{c.count}</div>
                            <div className={`absolute top-0 right-0 p-0.5 text-[8px] rounded font-bold ${c.stat === 'attack' ? 'bg-red-900 text-red-200' :
                                c.stat === 'gold' ? 'bg-yellow-900 text-yellow-200' :
                                    c.stat === 'xp' ? 'bg-purple-900 text-purple-200' :
                                        c.stat === 'defense' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'
                                }`}>
                                {c.stat.substring(0, 3).toUpperCase()}
                            </div>
                        </div>
                    ))}
                    {cards.length === 0 && <div className="col-span-4 text-center text-gray-500 py-10">No cards collected yet. Keep fighting!</div>}
                </div>

                <div className="mt-4 flex justify-center">
                    <button
                        onClick={onDuel}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded shadow-lg flex items-center justify-center gap-2"
                    >
                        ⚔️ Duel Opponents
                    </button>
                </div>
            </div>
        </div>
    );
};
