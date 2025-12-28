import React from 'react';
import { BarChart2, Clock, Swords, Skull, Coins, MousePointer, X } from 'lucide-react';
import type { GameStats } from '../../engine/types';
import { formatNumber } from '../../utils';

interface StatisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: GameStats;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-indigo-500 w-full max-w-lg p-6 rounded-xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
                    <BarChart2 size={32} /> Lifetime Statistics
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    <StatRow icon={<Coins size={20} className="text-yellow-400" />} label="Total Gold Earned" value={formatNumber(stats.totalGoldEarned)} />
                    <StatRow icon={<Skull size={20} className="text-red-400" />} label="Total Kills" value={formatNumber(stats.totalKills)} />
                    <StatRow icon={<Skull size={20} className="text-purple-400" />} label="Boss Kills" value={formatNumber(stats.bossKills)} />
                    <StatRow icon={<MousePointer size={20} className="text-blue-400" />} label="Total Clicks" value={formatNumber(stats.clicks)} />
                    <StatRow icon={<Swords size={20} className="text-orange-400" />} label="Total Damage Dealt" value={formatNumber(stats.totalDamageDealt)} />
                    <StatRow icon={<Clock size={20} className="text-green-400" />} label="Play Time" value={formatTime(stats.playTime)} />
                </div>
            </div>
        </div>
    );
};

const StatRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors">
        <div className="flex items-center gap-3 text-slate-300">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <div className="text-xl font-bold text-white font-mono">{value}</div>
    </div>
);
