import React from 'react';
import { Trophy, Lock } from 'lucide-react';
import type { Achievement } from '../../engine/types';

import type { GameStats } from '../../engine/types';
import { formatNumber } from '../../utils';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: Achievement[];
    stats: GameStats;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, achievements, stats }) => {
    if (!isOpen) return null;

    const getProgress = (ach: Achievement) => {
        if (ach.isUnlocked) return 100;
        let current = 0;
        if (ach.condition.type === 'kills') current = stats.totalKills;
        if (ach.condition.type === 'bossKills') current = stats.bossKills;
        if (ach.condition.type === 'gold') current = stats.totalGoldEarned;
        if (ach.condition.type === 'clicks') current = stats.clicks;
        if (ach.condition.type === 'itemsForged') current = stats.itemsForged;
        if (ach.condition.type === 'oreMined') current = stats.oreMined;
        if (ach.condition.type === 'fishCaught') current = stats.fishCaught;

        return Math.min(100, (current / ach.condition.value) * 100);
    };

    const getCurrentValue = (ach: Achievement) => {
        if (ach.condition.type === 'kills') return formatNumber(stats.totalKills);
        if (ach.condition.type === 'bossKills') return formatNumber(stats.bossKills);
        if (ach.condition.type === 'gold') return formatNumber(stats.totalGoldEarned);
        if (ach.condition.type === 'clicks') return formatNumber(stats.clicks);
        if (ach.condition.type === 'itemsForged') return formatNumber(stats.itemsForged);
        if (ach.condition.type === 'oreMined') return formatNumber(stats.oreMined);
        if (ach.condition.type === 'fishCaught') return formatNumber(stats.fishCaught);
        return 0;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-4 border-yellow-500 w-full max-w-3xl p-6 rounded-lg shadow-2xl relative max-h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold">X</button>

                <h2 className="text-yellow-400 text-3xl font-bold mb-6 flex items-center justify-center gap-2 border-b border-yellow-500/30 pb-4">
                    <Trophy size={32} /> HALL OF LEGENDS
                </h2>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {achievements.map(ach => {
                        const progress = getProgress(ach);
                        return (
                            <div key={ach.id} className={`p-4 rounded-lg border flex flex-col gap-2 transition-all duration-300 ${ach.isUnlocked ? 'bg-slate-800 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-slate-900 border-slate-700 opacity-70'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full border-2 ${ach.isUnlocked ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-600 text-gray-600'}`}>
                                        {ach.isUnlocked ? <Trophy size={24} /> : <Lock size={24} />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className={`text-lg font-bold ${ach.isUnlocked ? 'text-yellow-200' : 'text-gray-400'}`}>{ach.name}</div>
                                                <div className="text-gray-400 text-sm">{ach.description}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-slate-500 uppercase mb-1">Reward</div>
                                                <div className={`font-bold px-2 py-1 rounded inline-block ${ach.isUnlocked ? 'text-green-400 bg-green-900/30' : 'text-gray-500 bg-gray-800'}`}>
                                                    {ach.rewardText}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full transition-all duration-500 ${ach.isUnlocked ? 'bg-yellow-500' : 'bg-blue-600'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white shadow-black drop-shadow-md">
                                        {ach.isUnlocked ? 'COMPLETED' : `${getCurrentValue(ach)} / ${formatNumber(ach.condition.value)}`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
