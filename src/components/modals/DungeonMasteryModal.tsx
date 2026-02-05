
import React from 'react';
import { Skull, Search, Hand, Eye } from 'lucide-react';
import type { DungeonMastery } from '../../engine/types';

interface DungeonMasteryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mastery: DungeonMastery;
    tokens: number;
    buyUpgrade: (type: keyof DungeonMastery) => void;
}

export const DungeonMasteryModal: React.FC<DungeonMasteryModalProps> = ({ isOpen, onClose, mastery, tokens, buyUpgrade }) => {
    if (!isOpen) return null;

    const upgrades = [
        { id: 'explorerLevel', name: 'Explorer', icon: <Eye size={20} />, desc: 'Increases Fog of War reveal radius.' },
        { id: 'slayerLevel', name: 'Slayer', icon: <Skull size={20} />, desc: 'Grants bonus XP from dungeon kills.' },
        { id: 'looterLevel', name: 'Looter', icon: <Hand size={20} />, desc: 'Increases chance to find items and keys.' },
        { id: 'trapSenseLevel', name: 'Trap Sense', icon: <Search size={20} />, desc: 'Chance to spot and avoid traps (WIP).' },
    ];

    const getCost = (level: number) => Math.floor(10 * Math.pow(1.5, level));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-slate-900 border border-purple-500 rounded-lg p-6 w-full max-w-md shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-400">Dungeon Mastery</h2>
                    <p className="text-slate-400 text-sm">Spend Tokens to improve your dungeoneering.</p>
                    <div className="mt-2 text-yellow-500 font-mono text-lg font-bold">
                        {tokens} Tokens
                    </div>
                </div>

                <div className="space-y-4">
                    {upgrades.map(u => {
                        const level = mastery[u.id as keyof DungeonMastery];
                        const cost = getCost(level);
                        const canBuy = tokens >= cost;

                        return (
                            <div key={u.id} className="bg-slate-800 p-3 rounded flex justify-between items-center border border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="text-purple-400">{u.icon}</div>
                                    <div>
                                        <div className="font-bold text-slate-200">{u.name} <span className="text-slate-500 text-xs">Lvl {level}</span></div>
                                        <div className="text-xs text-slate-400">{u.desc}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => buyUpgrade(u.id as keyof DungeonMastery)}
                                    disabled={!canBuy}
                                    className={`px-3 py-1 rounded text-sm font-bold ${canBuy ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {cost} T
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
