import React from 'react';
import { Ghost, Coins, Crown, Hammer, Briefcase, Layers, Castle, Building, Key, Skull, Volume2, VolumeX, Zap, Settings } from 'lucide-react';
import { formatNumber } from '../utils';
import type { Boss, Resources, Tower, Guild } from '../engine/types';

interface HeaderProps {
    boss: Boss;
    souls: number;
    gold: number;
    divinity: number;
    resources: Resources;
    tower: Tower;
    guild: Guild | null;
    keys: number;
    voidMatter: number;
    dungeonActive: boolean;
    raidActive: boolean;
    raidTimer: number;
    voidActive: boolean;
    voidTimer: number;
    isSoundOn: boolean;
    gameSpeed: number;
    actions: any;
    setShowShop: (v: boolean) => void;
    setShowTavern: (v: boolean) => void;
    setShowStars: (v: boolean) => void;
    setShowForge: (v: boolean) => void;
    setShowInventory: (v: boolean) => void;
    setShowCards: (v: boolean) => void;
    setShowTower: (v: boolean) => void;
    setShowGuild: (v: boolean) => void;
    setShowSettings: (v: boolean) => void;
    setShowVoid?: (v: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
    boss, souls, gold, divinity, tower, guild, keys, voidMatter,
    dungeonActive, raidActive, raidTimer, voidActive, voidTimer, isSoundOn, gameSpeed, actions,
    setShowShop, setShowTavern, setShowStars, setShowForge, setShowInventory,
    setShowCards, setShowTower, setShowGuild, setShowSettings, setShowVoid
}) => {
    return (
        <div className="bg-gray-900 p-2 border-b-4 border-gray-600 flex flex-col gap-2 rounded-t-lg">
            {/* Row 1: Stats & Resources */}
            <div className="flex flex-wrap justify-between items-center text-xs text-yellow-400 gap-2">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600 text-white font-bold">LVL {boss.level}</div>
                    <button onClick={() => setShowShop(true)} className="btn-retro bg-purple-900 text-purple-200 px-2 py-1 rounded border border-purple-500 flex items-center gap-1 hover:bg-purple-800 min-w-[60px] justify-center"> <Ghost size={12} /> {formatNumber(souls)} </button>
                    <button onClick={() => setShowTavern(true)} className="btn-retro bg-amber-700 text-amber-100 px-2 py-1 rounded border border-amber-500 flex items-center gap-1 hover:bg-amber-600 min-w-[60px] justify-center"> <Coins size={12} /> {formatNumber(gold)} </button>
                    {divinity > 0 && <button onClick={() => setShowStars(true)} className="btn-retro bg-cyan-900 text-cyan-200 px-2 py-1 rounded border border-cyan-500 flex items-center gap-1 hover:bg-cyan-800"><Crown size={12} /> {formatNumber(divinity)}</button>}
                </div>

                <div className="flex gap-1">
                    <button onClick={() => setShowForge(true)} className="btn-retro bg-orange-900 text-orange-200 px-2 py-1 rounded border border-orange-500 flex items-center gap-1 hover:bg-orange-800" title="The Forge"><Hammer size={12} /></button>
                    <button onClick={() => setShowInventory(true)} className="btn-retro bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-500 flex items-center gap-1 hover:bg-slate-600" title="Inventory"><Briefcase size={12} /></button>
                    <button onClick={() => setShowCards(true)} className="btn-retro bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-600 text-[10px]" title="Monster Cards"><Layers size={14} /></button>
                </div>
            </div>

            {/* Row 2: Actions & Modes */}
            <div className="flex flex-wrap justify-between items-center text-xs gap-2">
                <div className="flex gap-2">
                    <button onClick={() => setShowTower(true)} className="btn-retro bg-indigo-900 text-indigo-200 px-2 py-1 rounded border border-indigo-500 flex items-center gap-1 hover:bg-indigo-800" title="Tower"><Castle size={12} /> {tower.floor}</button>
                    <button onClick={() => setShowGuild(true)} className="btn-retro bg-green-900 text-green-200 px-2 py-1 rounded border border-green-500 flex items-center gap-1 hover:bg-green-800" title="Guild"><Building size={12} /> {guild ? guild.level : '+'}</button>
                    {tower.floor >= 10 && (
                        <button onClick={() => setShowVoid && setShowVoid(true)} className="flex items-center gap-1 bg-purple-900 border border-purple-700 px-2 py-1 rounded text-purple-100 hover:bg-purple-800 animate-pulse" title="The Void">
                            <Ghost size={12} /> {voidMatter}
                        </button>
                    )}
                </div>

                <div className="flex gap-2 items-center">
                    {keys > 0 && <span className="text-amber-500 flex items-center gap-1 bg-gray-800 px-2 py-1 rounded"><Key size={10} /> {keys}</span>}
                    {keys > 0 && !dungeonActive && (
                        <button onClick={actions.enterDungeon} className="btn-retro bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-500 text-[10px] animate-pulse border border-yellow-300">VAULT</button>
                    )}
                    {voidActive && <div className="text-purple-400 font-bold animate-pulse text-xs">VOID: {Math.floor(voidTimer)}s</div>}
                    {boss.level >= 20 && !dungeonActive && !voidActive && (
                        <button onClick={actions.toggleRaid} className={`btn-retro px-2 py-1 rounded text-[10px] flex items-center gap-1 ${raidActive ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-red-900'}`}> <Skull size={12} /> {raidActive ? `${Math.floor(raidTimer)}s` : 'RAID'} </button>
                    )}
                    <button onClick={actions.toggleSound} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600">{isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
                    <button onClick={() => actions.setGameSpeed(gameSpeed === 1 ? 5 : 1)} className="btn-retro bg-blue-700 px-2 py-1 rounded text-[10px]"><Zap size={10} /> {gameSpeed}x</button>
                    <button onClick={() => setShowSettings(true)} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600"><Settings size={12} /></button>
                </div>
            </div>
        </div>
    );
};
