import React from 'react';
import { Swords, Trophy } from 'lucide-react';
import type { Hero, ArenaOpponent } from '../../engine/types';

interface ArenaModalProps {
    isOpen: boolean;
    onClose: () => void;
    rank: number;
    glory: number;
    heroes: Hero[];
    onFight: (opponent: ArenaOpponent) => void;
}

export const ArenaModal: React.FC<ArenaModalProps> = ({ isOpen, onClose, rank, glory, heroes, onFight }) => {
    if (!isOpen) return null;

    const teamPower = heroes.filter(h => h.unlocked && h.assignment === 'combat').reduce((acc, h) => acc + h.stats.attack + h.stats.hp / 10, 0);

    // Simulate Opponents based on rank
    const opponents: ArenaOpponent[] = [
        { id: 'op1', name: 'Rival Guild', rank: rank, power: Math.floor(teamPower * 0.9), avatar: '🐺' },
        { id: 'op2', name: 'Dark Knights', rank: rank + 1, power: Math.floor(teamPower * 1.1), avatar: '🦇' },
        { id: 'op3', name: 'Void Walkers', rank: rank + 5, power: Math.floor(teamPower * 1.5), avatar: '👻' },
    ];

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-yellow-600 w-full max-w-2xl p-6 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold hover:text-red-500">X</button>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-yellow-500 text-3xl font-bold flex items-center gap-2"><Swords size={32} /> ARENA</h2>
                    <div className="text-right">
                        <div className="text-xl text-yellow-200">Rank: <span className="font-bold text-white">#{rank}</span></div>
                        <div className="text-sm text-yellow-400 flex items-center justify-end gap-1"><Trophy size={14} /> Glory: {glory}</div>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-slate-800 p-4 rounded border border-slate-600">
                        <h3 className="text-gray-400 text-sm uppercase mb-2">Your Team</h3>
                        <div className="flex gap-1 flex-wrap">
                            {heroes.filter(h => h.unlocked && h.assignment === 'combat').map(h => (
                                <div key={h.id} className="text-2xl" title={h.name}>{h.emoji}</div>
                            ))}
                        </div>
                        <div className="mt-2 text-cyan-400 font-bold">Power: {Math.floor(teamPower)}</div>
                    </div>
                </div>

                <h3 className="text-white font-bold mb-4 border-b border-gray-700 pb-2">CHOOSE OPPONENT</h3>
                <div className="space-y-3">
                    {opponents.map(op => (
                        <div key={op.id} className="flex justify-between items-center bg-gray-800 p-3 rounded hover:bg-gray-700 border border-gray-600 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{op.avatar}</span>
                                <div>
                                    <div className="text-white font-bold text-lg">{op.name}</div>
                                    <div className="text-xs text-gray-400">Rank #{op.rank}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`font-bold ${op.power > teamPower ? 'text-red-400' : 'text-green-400'}`}>
                                    PWR: {op.power}
                                </span>
                                <button
                                    onClick={() => onFight(op)}
                                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-1 rounded font-bold flex items-center gap-2 border border-red-500"
                                >
                                    FIGHT <Swords size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
