import React from 'react';
import type { WorldBossState } from '../engine/types';

interface Props {
    worldBoss: WorldBossState;
    attackAction: () => void;
}

export const WorldBossPanel: React.FC<Props> = ({ worldBoss, attackAction }) => {
    if (!worldBoss.active) return null;

    const hpPercent = (worldBoss.hp / worldBoss.maxHp) * 100;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
            <div className="bg-slate-900 border-4 border-purple-600 p-8 rounded-2xl w-full max-w-2xl text-center shadow-[0_0_50px_rgba(147,51,234,0.5)]">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-600 mb-2 font-display">
                    ⚠️ WORLD BOSS EVENT ⚠️
                </h2>
                <h3 className="text-2xl text-white mb-6 font-bold tracking-wider">{worldBoss.boss.name} (Lvl {worldBoss.boss.level})</h3>

                <div className="relative w-full h-12 bg-slate-800 rounded-full border-2 border-slate-600 mb-6 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-red-600 transition-all duration-100"
                        style={{ width: `${hpPercent}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg drop-shadow-md">
                        {Math.floor(worldBoss.hp).toLocaleString()} / {Math.floor(worldBoss.maxHp).toLocaleString()} HP
                    </span>
                </div>

                <div className="flex justify-between items-center text-xl font-bold text-purple-200 mb-8 px-4">
                    <span>⏳ Time Remaining:</span>
                    <span className={`text-2xl ${worldBoss.timer < 60 ? 'text-red-500' : 'text-white'}`}>
                        {Math.floor(worldBoss.timer / 60)}:{(worldBoss.timer % 60).toString().padStart(2, '0')}
                    </span>
                </div>

                <button
                    onClick={attackAction}
                    className="w-full bg-gradient-to-b from-red-500 to-red-800 hover:from-red-400 hover:to-red-700 text-white font-black text-2xl py-6 rounded-xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all shadow-lg hover:shadow-red-500/30"
                >
                    ⚔️ ATTACK BOSS ⚔️
                </button>
                <p className="mt-4 text-slate-400 text-sm">Click rapidly to deal massive damage!</p>
            </div>
        </div>
    );
};
