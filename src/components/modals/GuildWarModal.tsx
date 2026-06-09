import { useState } from 'react';
import { X, Sword, Map as MapIcon, Coins, Lock } from 'lucide-react';
import type { Guild } from '../../engine/types';
import type { Territory } from '../../engine/types';
import type { GvGWarState } from '../../engine/guildWar';
import { formatNumber } from '../../utils';
import { GuildWarMap } from './GuildWarMap';
import { GuildWarGvG } from './GuildWarGvG';

interface GuildWarModalProps {
    onClose: () => void;
    territories: Territory[];
    onAttack: (territoryId: string) => void;
    onUpgrade: (territoryId: string) => void;
    onAdvanceMap: () => void;
    partyPower: number;
    guild: Guild | null;
    gold: number;
    industryInventory?: Record<string, number>;
    onBombard?: (territoryId: string, weaponId: 'siege_catapult' | 'plasma_cannon') => void;
    gvgWarState?: GvGWarState | null;
    onStartGvG?: () => void;
    onPlayerGvGAttack?: (towerId: string) => void;
}

export function GuildWarModal({ onClose, territories, onAttack, onUpgrade, onAdvanceMap, partyPower, guild, gold, industryInventory = {}, onBombard, gvgWarState, onStartGvG, onPlayerGvGAttack }: GuildWarModalProps) {
    const [activeTab, setActiveTab] = useState<'map' | 'gvg'>('map');

    const isLeader = guild !== null && (guild.totalContribution || 0) >= 10000;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-orange-700/50 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X className="w-6 h-6" />
                </button>

                {/* Header with Tabs */}
                <div className="p-5 border-b border-gray-800 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-orange-500">
                            <MapIcon className="w-7 h-7" /> Guerra de Guildas
                        </h2>
                        <div className="flex gap-3 ml-auto mr-10">
                            <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 text-center">
                                <div className="text-xs text-gray-400">Poder</div>
                                <div className="text-lg font-bold text-white flex items-center gap-1">
                                    <Sword className="w-4 h-4 text-orange-500" />{formatNumber(partyPower)}
                                </div>
                            </div>
                            <div className="bg-gray-800 px-3 py-2 rounded-lg border border-yellow-800/50 text-center">
                                <div className="text-xs text-gray-400">Ouro</div>
                                <div className="text-lg font-bold text-yellow-400 flex items-center gap-1">
                                    <Coins className="w-4 h-4" />{formatNumber(gold)}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                                ${activeTab === 'map'
                                    ? 'bg-orange-700 text-white shadow-lg shadow-orange-900/30'
                                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            <MapIcon className="w-4 h-4" /> Conquista Mundial
                        </button>
                        <button
                            onClick={() => setActiveTab('gvg')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                                ${activeTab === 'gvg'
                                    ? 'bg-red-700 text-white shadow-lg shadow-red-900/30'
                                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                        >
                            <Sword className="w-4 h-4" /> Guilda vs Guilda
                            {gvgWarState?.warActive && (
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'gvg' ? (
                    <GuildWarGvG
                        isLeader={isLeader}
                        gvgWarState={gvgWarState}
                        onStartGvG={onStartGvG}
                        onPlayerGvGAttack={onPlayerGvGAttack}
                    />
                ) : (
                    <>
                        {/* Lock screen */}
                        {!isLeader && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <Lock className="w-16 h-16 text-orange-500/50 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Modo Guerra Bloqueado</h3>
                                <p className="text-gray-400 max-w-md">
                                    Somente o <span className="text-orange-400 font-bold">Líder da Guilda</span> pode iniciar guerras.
                                    Contribua <span className="text-yellow-400 font-bold">10.000 Ouro</span> para tornar-se líder.
                                </p>
                                {guild && (
                                    <div className="mt-4 bg-gray-800 p-3 rounded-lg text-sm">
                                        <span className="text-gray-400">Contribuição atual: </span>
                                        <span className="text-yellow-400 font-bold">{formatNumber(guild.totalContribution || 0)} / 10.000</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Main map + panel */}
                        {isLeader && (
                            <GuildWarMap
                                territories={territories}
                                partyPower={partyPower}
                                gold={gold}
                                industryInventory={industryInventory}
                                onAttack={onAttack}
                                onUpgrade={onUpgrade}
                                onAdvanceMap={onAdvanceMap}
                                onBombard={onBombard}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
