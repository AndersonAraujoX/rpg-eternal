import React from 'react';
import { Scroll, Trophy, Check, X, Coins, Sparkles, AlertCircle } from 'lucide-react';
import type { Quest } from '../../engine/types';

interface QuestModalProps {
    quests: Quest[];
    onClose: () => void;
    onClaim: (questId: string) => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ quests, onClose, onClaim }) => {

    // Sort: Claimable first, then In Progress, then Completed
    const sortedQuests = [...quests].sort((a, b) => {
        if (a.isCompleted && !a.isClaimed) return -1;
        if (b.isCompleted && !b.isClaimed) return 1;
        if (a.isClaimed && !b.isClaimed) return 1;
        if (!a.isClaimed && b.isClaimed) return -1;
        return 0;
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-yellow-600 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-900 p-2 rounded-lg border border-yellow-600">
                            <Scroll className="text-yellow-400" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-yellow-500 font-serif tracking-wide">Daily Quests</h2>
                            <p className="text-gray-400 text-sm">Valid for the next 24 hours</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Quest List */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {sortedQuests.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-gray-800/50 rounded-lg border border-gray-800 border-dashed">
                            <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                            No active quests available. Come back tomorrow!
                        </div>
                    ) : (
                        sortedQuests.map((quest) => (
                            <div
                                key={quest.id}
                                className={`
                                    relative p-4 rounded-lg flex items-center justify-between border transition-all duration-200
                                    ${quest.isClaimed
                                        ? 'bg-gray-800/50 border-gray-800 opacity-60'
                                        : quest.isCompleted
                                            ? 'bg-gradient-to-r from-yellow-900/40 to-gray-900 border-yellow-500 shadow-lg shadow-yellow-900/20'
                                            : 'bg-gray-800 border-gray-700'
                                    }
                                `}
                            >
                                {/* Quest Info */}
                                <div className="flex-1">
                                    <h4 className={`text-lg font-bold mb-1 flex items-center gap-2 ${quest.isClaimed ? 'text-gray-500' : 'text-white'}`}>
                                        {quest.description}
                                        {quest.isCompleted && !quest.isClaimed && (
                                            <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded border border-green-700 font-mono">COMPLETE</span>
                                        )}
                                        {quest.isClaimed && (
                                            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded font-mono">CLAIMED</span>
                                        )}
                                    </h4>

                                    {/* Progress Bar */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-700 relative">
                                            <div
                                                className={`h-full transition-all duration-500 ${quest.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white shadow-black drop-shadow-md">
                                                {Math.floor(quest.progress)} / {quest.target}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1 text-yellow-300 bg-yellow-900/30 px-2 py-0.5 rounded border border-yellow-800/50">
                                            <Trophy size={12} />
                                            Reward:
                                        </div>
                                        <div className="text-gray-300">
                                            {quest.reward.type === 'gold' && <span className="text-yellow-400 font-bold flex items-center gap-1"><Coins size={10} /> {quest.reward.amount} Gold</span>}
                                            {quest.reward.type === 'souls' && <span className="text-purple-400 font-bold flex items-center gap-1"><Sparkles size={10} /> {quest.reward.amount} Souls</span>}
                                            {quest.reward.type === 'voidMatter' && <span className="text-indigo-400 font-bold flex items-center gap-1">🌑 {quest.reward.amount} Void Matter</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="ml-4">
                                    {quest.isClaimed ? (
                                        <div className="bg-gray-800 p-2 rounded-full border border-gray-700">
                                            <Check className="text-green-500" size={24} />
                                        </div>
                                    ) : quest.isCompleted ? (
                                        <button
                                            onClick={() => onClaim(quest.id)}
                                            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 animate-pulse"
                                        >
                                            <Trophy size={18} />
                                            Claim
                                        </button>
                                    ) : (
                                        <div className="text-gray-500 font-mono text-xs text-center w-24">
                                            In Progress...
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 text-center text-xs text-gray-500 font-mono border-t border-gray-800 pt-4">
                    New quests arrive daily at 00:00 UTC
                </div>
            </div>
        </div>
    );
};
