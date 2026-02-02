import React from 'react';
import { Building, Shield, Coins, ArrowUp, Lock } from 'lucide-react';
import { GUILDS } from '../../engine/types';
import type { Guild, GameActions } from '../../engine/types';
import { MONUMENT_DEFINITIONS, getMonumentCost, getMonumentValue } from '../../engine/guild';
import { formatNumber } from '../../utils';

interface GuildModalProps {
    isOpen: boolean;
    onClose: () => void;
    guild: Guild | null;
    gold: number;
    actions: GameActions;
}

export const GuildModal: React.FC<GuildModalProps> = ({ isOpen, onClose, guild, gold, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-green-600 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white font-bold hover:text-red-500">X</button>
                <h2 className="text-green-400 text-3xl font-bold mb-6 flex items-center justify-center gap-2 border-b border-green-800 pb-2">
                    <Building size={32} /> GUILD HALL
                </h2>

                {!guild ? (
                    <div className="space-y-6 text-center max-w-2xl mx-auto">
                        <p className="text-gray-300 text-lg">You are not in a guild. Choose an alliance to establish your base:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {GUILDS.map(g => (
                                <button key={g.name} onClick={() => actions.joinGuild(g.name)} className="bg-gray-800 hover:bg-gray-700 hover:border-green-500 border border-gray-600 p-6 rounded-lg flex flex-col items-center transition-all">
                                    <Shield size={48} className="text-green-500 mb-2" />
                                    <span className="text-green-300 font-bold text-xl mb-1">{g.name}</span>
                                    <span className="text-gray-400 text-sm italic mb-2">{g.description}</span>
                                    <span className="text-yellow-400 text-xs font-mono border border-yellow-900 bg-yellow-900/20 px-2 py-1 rounded">{g.bonus}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sidebar: Guild Stats & Contribution */}
                        <div className="col-span-1 space-y-4">
                            <div className="bg-green-950/30 border border-green-800 p-4 rounded-lg text-center">
                                <h3 className="text-2xl font-bold text-white mb-1">{guild.name}</h3>
                                <div className="text-green-400 text-sm font-mono mb-4">{guild.bonus}</div>

                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Level {guild.level}</span>
                                    <span>{formatNumber(guild.members)} Members</span>
                                </div>
                                <div className="w-full h-3 bg-black rounded-full overflow-hidden mb-1 relative border border-green-900">
                                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(guild.xp / guild.maxXp) * 100}%` }}></div>
                                </div>
                                <div className="text-right text-[10px] text-gray-500">{formatNumber(guild.xp)} / {formatNumber(guild.maxXp)} XP</div>
                            </div>

                            <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-lg">
                                <h4 className="text-amber-500 font-bold mb-3 flex items-center justify-center gap-2"><Coins size={16} /> Treasury</h4>
                                <p className="text-center text-xs text-gray-400 mb-3">Contribute Gold to level up the Guild and unlock higher Monument limits.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => actions.contributeGuild(100)} disabled={gold < 100} className="bg-amber-800/50 hover:bg-amber-700/80 border border-amber-700 text-white p-2 rounded flex flex-col items-center disabled:opacity-50 transition-colors">
                                        <span className="text-xs font-bold">100 G</span>
                                        <span className="text-[10px] text-amber-200 opacity-75">+10 XP</span>
                                    </button>
                                    <button onClick={() => actions.contributeGuild(1000)} disabled={gold < 1000} className="bg-amber-700/50 hover:bg-amber-600/80 border border-amber-600 text-white p-2 rounded flex flex-col items-center disabled:opacity-50 transition-colors">
                                        <span className="text-xs font-bold">1K G</span>
                                        <span className="text-[10px] text-amber-200 opacity-75">+100 XP</span>
                                    </button>
                                    <button onClick={() => actions.contributeGuild(10000)} disabled={gold < 10000} className="bg-amber-600/50 hover:bg-amber-500/80 border border-amber-500 text-white p-2 rounded flex flex-col items-center disabled:opacity-50 col-span-2 transition-colors">
                                        <span className="text-xs font-bold">10K G</span>
                                        <span className="text-[10px] text-amber-200 opacity-75">+1K XP</span>
                                    </button>
                                </div>
                                <div className="mt-2 text-center text-[10px] text-gray-500">
                                    Lifetime Contribution: {formatNumber(guild.totalContribution || 0)} G
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Monuments */}
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Building className="text-green-400" /> Monuments
                                <span className="text-xs font-normal text-gray-500 ml-auto bg-gray-800 px-2 py-1 rounded">Max Level: {guild.level}</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {MONUMENT_DEFINITIONS.map(monument => {
                                    const level = guild.monuments[monument.id] || 0;
                                    const cost = getMonumentCost(monument.baseCost, level, monument.costScaling);
                                    const value = getMonumentValue(monument.valuePerLevel, level);
                                    const nextValue = getMonumentValue(monument.valuePerLevel, level + 1);
                                    const isMaxed = level >= monument.maxLevel;
                                    const isCap = level >= guild.level;
                                    const canAfford = gold >= cost;

                                    return (
                                        <div key={monument.id} className={`p-4 rounded-lg border relative transition-all ${level > 0 ? 'bg-slate-800 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-90'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{monument.icon}</span>
                                                    <div>
                                                        <h4 className="font-bold text-gray-200">{monument.name}</h4>
                                                        <div className="text-xs text-green-400 font-mono">Lvl {level}</div>
                                                    </div>
                                                </div>
                                                {level > 0 && (
                                                    <div className="bg-green-900/50 text-green-300 text-xs px-2 py-1 rounded border border-green-800">
                                                        Active
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-400 mb-3 h-10 overflow-hidden text-ellipsis">{monument.description}</p>

                                            <div className="bg-black/50 p-2 rounded mb-3 flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Cur Bonus:</span>
                                                <span className="text-sm font-bold text-white">
                                                    {monument.effectType.includes('mult') ? `+${Math.round(value * 100)}%` : `+${formatNumber(value)}`}
                                                </span>
                                            </div>

                                            {!isMaxed ? (
                                                <div className="mt-auto">
                                                    <button
                                                        onClick={() => actions.upgradeMonument(monument.id)}
                                                        disabled={!canAfford || isCap}
                                                        className={`w-full py-2 px-3 rounded text-sm font-bold flex items-center justify-between transition-colors
                                                            ${isCap
                                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                                                                : canAfford
                                                                    ? 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                                                                    : 'bg-red-900/30 text-red-400 border border-red-900 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {isCap ? (
                                                            <>
                                                                <span className="flex items-center gap-1"><Lock size={12} /> Guild Lvl Req</span>
                                                                <span>Lvl {guild.level + 1}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="flex items-center gap-1"><ArrowUp size={12} /> Upgrade</span>
                                                                <span className="text-xs">{formatNumber(cost)} G</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    {!isCap && (
                                                        <div className="text-[10px] text-center mt-1 text-gray-500">
                                                            Next: {monument.effectType.includes('mult') ? `+${Math.round(nextValue * 100)}%` : `+${formatNumber(nextValue)}`}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center text-yellow-400 font-bold text-sm py-2 border border-yellow-900/50 bg-yellow-900/20 rounded">
                                                    MAX LEVEL
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
