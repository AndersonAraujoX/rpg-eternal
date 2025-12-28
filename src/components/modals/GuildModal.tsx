import React from 'react';
import { Building, Shield, Coins } from 'lucide-react';
import { GUILDS } from '../../engine/types';
import type { Guild } from '../../engine/types';

interface GuildModalProps {
    isOpen: boolean;
    onClose: () => void;
    guild: Guild | null;
    gold: number;
    actions: any;
}

export const GuildModal: React.FC<GuildModalProps> = ({ isOpen, onClose, guild, gold, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-green-600 w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-green-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Building /> GUILD HALL</h2>

                {!guild ? (
                    <div className="space-y-4">
                        <p className="text-gray-300 mb-4">You are not in a guild. Choose an alliance:</p>
                        <div className="grid grid-cols-1 gap-2">
                            {GUILDS.map(g => (
                                <button key={g.name} onClick={() => actions.joinGuild(g.name)} className="bg-gray-800 hover:bg-gray-700 border border-gray-600 p-4 rounded flex flex-col items-center">
                                    <span className="text-green-300 font-bold text-lg">{g.name}</span>
                                    <span className="text-gray-400 text-xs italic mb-1">{g.description}</span>
                                    <span className="text-yellow-400 text-xs">{g.bonus}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="bg-green-900 bg-opacity-30 border border-green-800 p-4 rounded mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">{guild.name}</h3>
                            <div className="text-green-400 text-sm mb-2">{guild.bonus}</div>
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>Lvl {guild.level}</span>
                                <span>Members: {guild.members}</span>
                            </div>
                            <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${(guild.xp / guild.maxXp) * 100}%` }}></div>
                            </div>
                            <div className="text-right text-[10px] text-gray-500 mt-1">{guild.xp} / {guild.maxXp} XP</div>
                        </div>

                        <h4 className="text-white font-bold mb-2 flex items-center justify-center gap-2"><Shield size={16} /> Contribute</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => actions.contributeGuild(100)} className="btn-retro bg-amber-700 text-white p-2 rounded flex flex-col items-center justify-center disabled:opacity-50" disabled={gold < 100}>
                                <div className="flex items-center gap-1 font-bold"><Coins size={12} /> Small Donation</div>
                                <div className="text-[10px] opacity-75">100 Gold (+10 XP)</div>
                            </button>
                            <button onClick={() => actions.contributeGuild(1000)} className="btn-retro bg-amber-600 text-white p-2 rounded flex flex-col items-center justify-center disabled:opacity-50" disabled={gold < 1000}>
                                <div className="flex items-center gap-1 font-bold"><Coins size={12} /> Large Donation</div>
                                <div className="text-[10px] opacity-75">1000 Gold (+100 XP)</div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
