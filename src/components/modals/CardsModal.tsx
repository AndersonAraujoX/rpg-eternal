import React from 'react';
import { Layers } from 'lucide-react';
import type { MonsterCard } from '../../engine/types';

interface CardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: MonsterCard[];
}

export const CardsModal: React.FC<CardsModalProps> = ({ isOpen, onClose, cards }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gray-900 border-4 border-white w-full max-w-lg h-[60vh] p-4 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-red-500 font-bold">X</button>
                <h2 className="text-center text-white text-xl font-bold mb-4 flex items-center justify-center gap-2"><Layers /> MONSTER CARDS</h2>
                <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[40vh] p-2">
                    {cards.map(c => (
                        <div key={c.id} className="bg-gray-800 border border-gray-600 p-2 rounded flex flex-col items-center justify-center" title={`+${Math.round(c.bonus * c.count * 100)}% Damage vs ${c.monsterName}`}>
                            <div className="text-2xl">{c.id}</div>
                            <div className="text-[10px] text-gray-400 mt-1">x{c.count}</div>
                        </div>
                    ))}
                    {cards.length === 0 && <div className="col-span-4 text-center text-gray-500 py-10">No cards collected yet. Keep fighting!</div>}
                </div>
            </div>
        </div>
    );
};
