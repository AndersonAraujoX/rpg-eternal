import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, Gift } from 'lucide-react';
import type { DailyQuest, GameStats } from '../../engine/types';
import { LOGIN_REWARDS } from '../../engine/dailies';
import { formatNumber } from '../../utils';

interface DailyRewardsModalProps {
    onClose: () => void;
    dailyQuests: DailyQuest[];
    gameStats: GameStats;
    claimLoginReward: () => void;
    claimDailyQuest: (id: string) => void;
    dailyLoginClaimed: boolean;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
    onClose,
    dailyQuests,
    gameStats,
    claimLoginReward,
    claimDailyQuest,
    dailyLoginClaimed
}) => {
    const [activeTab, setActiveTab] = useState<'login' | 'quests'>('login');
    const streak = gameStats.loginStreak || 1;

    // Auto-switch to quests if login claimed
    useEffect(() => {
        if (dailyLoginClaimed) {
            const timer = setTimeout(() => setActiveTab('quests'), 0);
            return () => clearTimeout(timer);
        }
    }, [dailyLoginClaimed]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-lg max-w-2xl w-full flex flex-col max-h-[80vh] shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50 rounded-t-lg">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-amber-400">
                        <Calendar className="w-6 h-6" />
                        Daily Rewards
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 p-3 font-medium transition-colors ${activeTab === 'login' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700/50 text-slate-400'
                            }`}
                    >
                        Login Bonus
                    </button>
                    <button
                        onClick={() => setActiveTab('quests')}
                        className={`flex-1 p-3 font-medium transition-colors ${activeTab === 'quests' ? 'bg-slate-700 text-white' : 'hover:bg-slate-700/50 text-slate-400'
                            }`}
                    >
                        Daily Quests
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'login' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-slate-400 mb-2">Current Streak</p>
                                <div className="text-4xl font-bold text-amber-400">{streak} Days</div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {LOGIN_REWARDS.map((reward) => {
                                    const isUnlocked = streak >= reward.day; // Past or current days in streak
                                    const isToday = streak === reward.day;
                                    const isClaimed = reward.day < streak || (isToday && dailyLoginClaimed);

                                    // Visual Logic:
                                    // If Streak is 3. Days 1, 2 are claimed. Day 3 is Today. Day 4+ are locked.
                                    // If we miss a day, streak resets to 1.
                                    // Actually, logic in dailies.ts handles streak reset.
                                    // Here we just visualize.

                                    // Wait, if streak is 3, we should show 1,2 checked, 3 active (or checked if claimed).
                                    // isUnlocked logic above checks if reward.day <= streak.

                                    return (
                                        <div
                                            key={reward.day}
                                            className={`relative p-3 rounded-lg border-2 flex flex-col items-center gap-2 text-center transition-all ${isToday
                                                ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                                                : isUnlocked
                                                    ? 'border-green-500/50 bg-green-500/5 opacity-75'
                                                    : 'border-slate-700 bg-slate-800 opacity-50'
                                                } ${reward.day === 7 ? 'col-span-4 aspect-video flex-row justify-center gap-8' : 'aspect-square'}`}
                                        >
                                            <div className="text-xs font-mono uppercase tracking-wider mb-1">Day {reward.day}</div>

                                            {reward.day === 7 ? (
                                                <>
                                                    <Gift className="w-12 h-12 text-purple-400" />
                                                    <div className="text-xl font-bold text-purple-200">{reward.label}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <Gift className={`w-8 h-8 ${isToday ? 'text-amber-400' : isUnlocked ? 'text-green-400' : 'text-slate-500'}`} />
                                                    <div className="text-sm font-bold">{reward.label}</div>
                                                </>
                                            )}

                                            {isToday && !dailyLoginClaimed && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                                                    <span className="text-xs font-bold text-amber-400 animate-pulse">CLAIM NOW</span>
                                                </div>
                                            )}
                                            {isClaimed && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-black rounded-full p-0.5">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={claimLoginReward}
                                disabled={dailyLoginClaimed}
                                className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${dailyLoginClaimed
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg hover:shadow-amber-500/25'
                                    }`}
                            >
                                {dailyLoginClaimed ? 'Reward Claimed' : 'Claim Daily Reward'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'quests' && (
                        <div className="space-y-4">
                            {dailyQuests.length === 0 ? (
                                <div className="text-center text-slate-400 py-10">
                                    <p>No quests available? Check back tomorrow!</p>
                                    <p className="text-xs opacity-50 mt-2">(Dev Note: Try triggering reset)</p>
                                </div>
                            ) : (
                                dailyQuests.map(quest => (
                                    <div key={quest.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-200">{quest.description}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${quest.claimed ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                                                    }`}>
                                                    {quest.claimed ? 'COMPLETED' : 'ACTIVE'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-blue-500 h-full transition-all duration-500"
                                                    style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                                <span>{formatNumber(quest.current)} / {formatNumber(quest.target)}</span>
                                                <span className="text-amber-400">Reward: {formatNumber(quest.reward.amount)} {quest.reward.type.toUpperCase()}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => claimDailyQuest(quest.id)}
                                            disabled={quest.claimed || quest.current < quest.target}
                                            className={`ml-4 px-4 py-2 rounded font-bold transition-all ${quest.claimed
                                                ? 'bg-transparent text-green-500 border border-green-500/30 cursor-default'
                                                : quest.current >= quest.target
                                                    ? 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {quest.claimed ? <Check className="w-5 h-5" /> : 'Claim'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
