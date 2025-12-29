import React from 'react';
import { X, Swords, Skull, AlertTriangle } from 'lucide-react';
import type { Rift } from '../../engine/types';
import { formatNumber } from '../../utils';

interface RiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    partyPower: number;
    startRift: (rift: Rift) => void;
}

const RIFTS: Rift[] = [
    {
        id: 'rift_1', name: 'Valley of Ash', description: 'Healing spells have no effect here.',
        level: 30, difficulty: 5000, restriction: 'no_heal',
        rewards: [{ type: 'voidMatter', amount: 50 }]
    },
    {
        id: 'rift_2', name: 'Iron Bastion', description: 'Enemies are immune to Physical damage.',
        level: 50, difficulty: 25000, restriction: 'phys_immune',
        rewards: [{ type: 'starlight', amount: 5 }]
    },
    {
        id: 'rift_3', name: 'Mirror Sanctum', description: 'Enemies are immune to Magic damage.',
        level: 70, difficulty: 100000, restriction: 'magic_immune',
        rewards: [{ type: 'voidMatter', amount: 200 }]
    },
    {
        id: 'rift_4', name: 'Silence Void', description: 'Hero Ultimates are disabled.',
        level: 90, difficulty: 500000, restriction: 'no_ult',
        rewards: [{ type: 'starlight', amount: 25 }]
    },
    {
        id: 'rift_5', name: 'Chrono Collapse', description: 'You have only 10 seconds to win.',
        level: 100, difficulty: 1000000, restriction: 'time_crunch',
        rewards: [{ type: 'gold', amount: 100000000 }]
    },
];

export const RiftModal: React.FC<RiftModalProps> = ({ isOpen, onClose, partyPower, startRift }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-gray-900 border-2 border-red-900/50 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">

                {/* Header */}
                <div className="p-4 border-b border-red-900/50 flex justify-between items-center bg-gradient-to-r from-gray-950 to-red-950">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-900/30 rounded-lg animate-pulse">
                            <Skull className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-100">Challenge Rifts</h2>
                            <p className="text-xs text-red-400">Survival is not guaranteed.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto grid grid-cols-1 gap-4">
                    {RIFTS.map((rift) => {
                        const isHard = partyPower < rift.difficulty;
                        const isImpossible = partyPower < rift.difficulty * 0.5;

                        return (
                            <div key={rift.id} className="relative group overflow-hidden bg-gray-800/40 border border-gray-700 hover:border-red-500/50 rounded-lg transition-all p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-red-900/5 group-hover:to-red-900/20 transition-all pointer-events-none" />

                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center border border-gray-600">
                                        <b className="text-gray-400 text-lg">{rift.level}</b>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-200 flex items-center gap-2">
                                            {rift.name}
                                            {isHard && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                                        </h3>
                                        <p className="text-sm text-gray-400">{rift.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-300 border border-red-900/50 uppercase tracking-wider">
                                                {rift.restriction.replace('_', ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded border font-mono ${isHard ? 'bg-orange-900/20 text-orange-400 border-orange-900' : 'bg-green-900/20 text-green-400 border-green-900'}`}>
                                                Req: {formatNumber(rift.difficulty)} Power
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Reward</div>
                                    {rift.rewards.map((r, i) => (
                                        <span key={i} className="text-sm font-bold text-purple-300">
                                            {r.amount} {r.type}
                                        </span>
                                    ))}
                                    <button
                                        onClick={() => startRift(rift)}
                                        className={`w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded font-bold transition-all ${isImpossible
                                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                            : 'bg-red-800 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                                            }`}
                                    >
                                        <Swords className="w-4 h-4" />
                                        ENTER
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
