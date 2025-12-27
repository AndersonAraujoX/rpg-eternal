import React from 'react';
import { Scroll, CheckCircle, Circle } from 'lucide-react';
import type { Quest } from '../../engine/types';

interface QuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    quests: Quest[];
    onClaim: (questId: string) => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({ isOpen, onClose, quests, onClaim }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-[#2a231d] border-4 border-[#8b7355] w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-[#dcdcdc]">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold">X</button>

                <h2 className="text-[#e6cca0] text-2xl font-bold mb-6 flex items-center justify-center gap-2 border-b border-[#5e4b35] pb-4">
                    <Scroll size={24} /> DAILY BOUNTIES
                </h2>

                <div className="space-y-4">
                    {quests.map(q => (
                        <div key={q.id} className={`p-4 rounded border ${q.isCompleted ? 'bg-[#3e342b] border-green-700' : 'bg-[#1e1915] border-[#3e342b]'} flex justify-between items-center`}>
                            <div>
                                <div className={`font-bold ${q.isCompleted ? 'text-green-400' : 'text-gray-300'}`}>{q.description}</div>
                                <div className="text-xs text-gray-500 mt-1">Reward: {q.reward.amount} {q.reward.type.toUpperCase()}</div>
                                <div className="w-full bg-black h-2 rounded-full mt-2 overflow-hidden border border-gray-700">
                                    <div className="h-full bg-yellow-600" style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}></div>
                                </div>
                                <div className="text-[10px] text-right text-gray-400">{q.progress} / {q.target}</div>
                            </div>

                            {q.isCompleted && !q.isClaimed ? (
                                <button
                                    onClick={() => onClaim(q.id)}
                                    className="ml-4 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded border border-green-500 animate-pulse font-bold text-xs"
                                >
                                    CLAIM
                                </button>
                            ) : q.isClaimed ? (
                                <div className="ml-4 text-green-500 font-bold text-xs flex flex-col items-center">
                                    <CheckCircle size={20} />
                                    <span>DONE</span>
                                </div>
                            ) : (
                                <div className="ml-4 text-gray-600">
                                    <Circle size={20} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
