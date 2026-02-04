import React from 'react';
import { Skull, Users, Clock, Award, Swords } from 'lucide-react';
import type { WorldBoss } from '../../engine/types';
import { formatNumber } from '../../utils';

interface WorldBossModalProps {
    isOpen: boolean;
    onClose: () => void;
    worldBoss: WorldBoss | null;
    personalDamage: number;
    canClaim: boolean;
    attackAction: () => void;
    claimAction: () => void;
}

export const WorldBossModal: React.FC<WorldBossModalProps> = ({
    isOpen, onClose, worldBoss, personalDamage, canClaim, attackAction, claimAction
}) => {
    if (!isOpen) return null;

    if (!worldBoss) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gray-900 p-6 rounded-lg border-2 border-gray-600 text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-400 mb-4">World Boss</h2>
                    <p className="text-gray-500">The boss has fled or been defeated. A new titan will emerge soon...</p>
                    <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 w-full">Close</button>
                </div>
            </div>
        );
    }

    const hpPercent = (worldBoss.globalHp / worldBoss.maxGlobalHp) * 100;
    const timeLeft = Math.max(0, Math.floor((worldBoss.endTime - Date.now()) / 1000));
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 w-full max-w-2xl rounded-xl border-2 border-red-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-red-950 p-4 border-b border-red-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-red-200 flex items-center gap-2">
                        <Skull className="text-red-500" /> Global Raid: {worldBoss.name}
                    </h2>
                    <button onClick={onClose} className="text-red-300 hover:text-white">✕</button>
                </div>

                {/* Main Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center gap-6">

                    {/* Boss Visual */}
                    <div className="relative group">
                        <div className="text-9xl animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                            {worldBoss.emoji}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded text-red-300 text-sm font-mono border border-red-900 whitespace-nowrap">
                            Tier {worldBoss.tier} Titan
                        </div>
                    </div>

                    {/* Global HP Bar */}
                    <div className="w-full max-w-lg space-y-1">
                        <div className="flex justify-between text-xs text-red-200 uppercase font-bold tracking-wider">
                            <span>Global HP</span>
                            <span>{formatNumber(worldBoss.globalHp)} / {formatNumber(worldBoss.maxGlobalHp)}</span>
                        </div>
                        <div className="h-4 bg-gray-950 rounded-full border border-red-900 overflow-hidden relative">
                            <div
                                className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300"
                                style={{ width: `${hpPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        <div className="bg-gray-800 p-3 rounded border border-gray-700 flex items-center gap-3">
                            <Users className="text-blue-400" size={20} />
                            <div>
                                <div className="text-xs text-gray-500">Participants</div>
                                <div className="text-gray-200 font-mono">{formatNumber(worldBoss.participants)}</div>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded border border-gray-700 flex items-center gap-3">
                            <Clock className="text-amber-400" size={20} />
                            <div>
                                <div className="text-xs text-gray-500">Time Remaining</div>
                                <div className="text-gray-200 font-mono">{hours}h {minutes}m</div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Contribution */}
                    <div className="w-full max-w-lg bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-2">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-300 font-bold flex items-center gap-2">
                                <Award className="text-yellow-500" size={16} /> Your Contribution
                            </span>
                            <span className="text-yellow-400 font-mono text-lg">{formatNumber(personalDamage)} Dmg</span>
                        </div>

                        <div className="text-xs text-gray-500 text-center italic mt-1">
                            Rewards are based on your total damage contribution.
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="w-full max-w-lg flex flex-col gap-3 mt-auto">
                        {canClaim ? (
                            <button
                                onClick={claimAction}
                                className="w-full py-4 bg-gradient-to-r from-yellow-700 to-yellow-500 text-white font-bold rounded-lg border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-xl animate-pulse"
                            >
                                <Award size={24} /> CLAIM REWARDS
                            </button>
                        ) : (
                            <button
                                onClick={attackAction}
                                disabled={worldBoss.isDead}
                                className="w-full py-4 bg-gradient-to-r from-red-900 to-red-700 text-white font-bold rounded-lg border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-xl disabled:opacity-50 disabled:grayscale group"
                            >
                                <Swords className="group-hover:rotate-12 transition-transform" size={24} />
                                {worldBoss.isDead ? 'BOSS DEFEATED' : 'ATTACK BOSS'}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
