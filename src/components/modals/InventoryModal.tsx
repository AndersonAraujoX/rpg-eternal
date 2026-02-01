import React from 'react';
import { Briefcase } from 'lucide-react';
import type { Item } from '../../engine/types';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: Item[];
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, items }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-slate-500 w-full max-w-lg p-6 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-slate-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Briefcase /> INVENTORY ({items.length})</h2>
                <div className="grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {items.map((item) => (
                        <div key={item.id} className="w-16 h-16 bg-slate-800 border border-slate-600 rounded flex flex-col items-center justify-center p-1 relative group hover:border-white cursor-pointer">
                            <div className="text-xl">{item.type === 'weapon' ? '⚔️' : '🛡️'}</div>
                            <div className={`text-[10px] font-bold ${item.rarity === 'legendary' ? 'text-orange-400' : item.rarity === 'epic' ? 'text-purple-400' : item.rarity === 'rare' ? 'text-blue-400' : 'text-gray-300'}`}>
                                {item.value}
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black border border-white p-2 text-xs z-50 whitespace-nowrap rounded">
                                <div className="font-bold">{item.name}</div>
                                <div>+{item.value} {item.stat}</div>
                                {item.runes.length > 0 && <div className="text-purple-300">Runes: {item.runes.length}</div>}
                            </div>
                        </div>
                    ))}
                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, 16 - items.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-16 h-16 bg-slate-900 border border-slate-800 rounded opacity-50"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};
