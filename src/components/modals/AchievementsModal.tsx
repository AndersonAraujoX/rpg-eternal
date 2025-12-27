import React from 'react';
import { Trophy, CheckCircle, Lock } from 'lucide-react';
import type { Achievement } from '../../engine/types';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: Achievement[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, achievements }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-4 border-yellow-500 w-full max-w-2xl p-6 rounded-lg shadow-2xl relative max-h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold">X</button>

                <h2 className="text-yellow-400 text-3xl font-bold mb-6 flex items-center justify-center gap-2 border-b border-yellow-500/30 pb-4">
                    <Trophy size={32} /> HALL OF LEGENDS
                </h2>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {achievements.map(ach => (
                        <div key={ach.id} className={`p-4 rounded-lg border flex items-center gap-4 transition-all duration-300 ${ach.unlocked ? 'bg-slate-800 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-slate-900 border-slate-700 opacity-70'}`}>
                            <div className={`p-3 rounded-full border-2 ${ach.unlocked ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-600 text-gray-600'}`}>
                                {ach.unlocked ? <Trophy size={24} /> : <Lock size={24} />}
                            </div>

                            <div className="flex-1">
                                <div className={`text-lg font-bold ${ach.unlocked ? 'text-yellow-200' : 'text-gray-400'}`}>{ach.name}</div>
                                <div className="text-gray-400 text-sm">{ach.description}</div>
                                <div className="text-xs text-yellow-500/80 mt-1 uppercase tracking-wider font-semibold">Reward: {ach.reward}</div>
                            </div>

                            {ach.unlocked && (
                                <div className="text-green-400 animate-pulse">
                                    <CheckCircle size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
