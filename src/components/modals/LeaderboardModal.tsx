import React from 'react';
import { Trophy, X, Crown, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../../engine/types';

interface LeaderboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    entries: LeaderboardEntry[];
    currentPower: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, entries, currentPower }) => {
    if (!isOpen) return null;

    // Create player entry
    const playerEntry: LeaderboardEntry = {
        id: 'player',
        name: 'You',
        power: currentPower,
        avatar: '🧙‍♂️',
        isPlayer: true
    };

    // Merge and sort
    const allEntries = [...entries, playerEntry].sort((a, b) => b.power - a.power);

    // Find player rank
    const playerRank = allEntries.findIndex(e => e.isPlayer) + 1;

    // Get top 50 or slice around player if list is huge (but we only have ~20 fake ones + player)
    // Just show all for now.

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="text-yellow-400" size={20} />;
        if (rank === 2) return <Medal className="text-gray-300" size={20} />;
        if (rank === 3) return <Medal className="text-amber-600" size={20} />;
        return <span className="text-gray-500 font-mono w-5 text-center">{rank}</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-yellow-900 to-gray-900 border-b border-yellow-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-yellow-100 flex items-center gap-2">
                        <Trophy className="text-yellow-400" /> Leaderboards
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {allEntries.map((entry, index) => {
                        const rank = index + 1;
                        const isMe = entry.isPlayer;
                        return (
                            <div
                                key={entry.id}
                                className={`flex items-center gap-4 p-3 rounded border ${isMe
                                    ? 'bg-yellow-900/30 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                    : 'bg-gray-800 border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-center w-8 font-bold text-xl">
                                    {getRankIcon(rank)}
                                </div>
                                <div className="text-2xl">{entry.avatar}</div>
                                <div className="flex-1">
                                    <div className={`font-bold ${isMe ? 'text-yellow-400' : 'text-gray-200'}`}>
                                        {entry.name} {isMe && '(You)'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Rank {rank}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-indigo-300 font-mono font-bold">
                                        {entry.power.toLocaleString()} PWR
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer / My Rank Summary */}
                <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center text-sm">
                    <span className="text-gray-400">Your Rank:</span>
                    <span className={`font-bold text-xl ${playerRank <= 10 ? 'text-yellow-400' : 'text-white'}`}>
                        #{playerRank}
                    </span>
                </div>
            </div>
        </div>
    );
};
