import { useState } from 'react';
import { X, Sword, Shield, Map as MapIcon, Flag, Coins, Activity } from 'lucide-react';
import type { Territory } from '../../engine/types';
import { formatNumber } from '../../utils';

interface GuildWarModalProps {
    onClose: () => void;
    territories: Territory[];
    onAttack: (territoryId: string) => void;
    partyPower: number;
}

export function GuildWarModal({ onClose, territories, onAttack, partyPower }: GuildWarModalProps) {
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

    const getOwnerColor = (owner: string) => {
        switch (owner) {
            case 'player': return 'text-green-400 border-green-500 bg-green-900/20';
            case 'Xang': return 'text-red-400 border-red-500 bg-red-900/20';
            case 'Zhauw': return 'text-blue-400 border-blue-500 bg-blue-900/20';
            case 'Yang': return 'text-yellow-400 border-yellow-500 bg-yellow-900/20';
            default: return 'text-gray-400 border-gray-500 bg-gray-900/20';
        }
    };

    const getWinChance = (difficulty: number) => {
        const ratio = partyPower / difficulty;
        if (ratio >= 2) return 'Guaranteed';
        if (ratio >= 1.2) return 'High';
        if (ratio >= 0.8) return 'Moderate';
        if (ratio >= 0.5) return 'Low';
        return 'Suicide';
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-orange-700/50 rounded-xl w-full max-w-5xl h-[80vh] flex flex-col relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X className="w-6 h-6" /></button>

                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-orange-500">
                            <MapIcon className="w-8 h-8" />
                            World Conquest
                        </h2>
                        <div className="text-xs text-gray-400 mt-1">Capture territories to gain passive bonuses for your guild.</div>
                    </div>
                    <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                        <div className="text-xs text-gray-400">Your Army Power</div>
                        <div className="text-xl font-bold text-white flex items-center gap-2">
                            <Sword className="w-4 h-4 text-orange-500" />
                            {formatNumber(partyPower)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Map Area */}
                    <div className="flex-1 bg-gray-950 relative overflow-auto p-8 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

                        {/* Grid Lines (Decorative) */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                        />

                        {/* Territories */}
                        <div className="relative w-[600px] h-[400px]">
                            {territories.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTerritory(t)}
                                    className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-4 flex items-center justify-center transition-all hover:scale-110 shadow-lg
                                        ${getOwnerColor(t.owner)}
                                        ${selectedTerritory?.id === t.id ? 'ring-4 ring-white scale-110 z-10' : ''}
                                    `}
                                    style={{
                                        left: `${(t.coordinates.x + 10) * 5}%`,
                                        top: `${(t.coordinates.y + 10) * 5}%`
                                    }}
                                >
                                    <Flag className="w-5 h-5" />
                                </button>
                            ))}

                            {/* Connection Lines (Optional, skipped for simplicity) */}
                        </div>

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-gray-900/80 p-2 rounded border border-gray-700 text-xs text-gray-300">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> You</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Xang</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> Zhauw</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /> Yang</div>
                        </div>
                    </div>

                    {/* Sidebar Details */}
                    <div className="w-80 border-l border-gray-800 bg-gray-900 p-6 flex flex-col">
                        {selectedTerritory ? (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{selectedTerritory.name}</h3>
                                    <p className="text-sm text-gray-400 italic">{selectedTerritory.description}</p>
                                </div>

                                <div className={`p-3 rounded border bg-opacity-10 ${getOwnerColor(selectedTerritory.owner).replace('bg-opacity-20', '')}`}>
                                    <div className="text-xs uppercase font-bold opacity-70">Controlled By</div>
                                    <div className="text-lg font-bold">{selectedTerritory.owner === 'player' ? 'Your Guild' : `${selectedTerritory.owner} Clan`}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Strategic Value</div>
                                    <div className="bg-gray-800 p-3 rounded flex items-center gap-3 border border-gray-700">
                                        {selectedTerritory.bonus.type === 'gold' && <Coins className="text-yellow-500" />}
                                        {selectedTerritory.bonus.type === 'xp' && <Activity className="text-blue-500" />}
                                        {selectedTerritory.bonus.type === 'damage' && <Sword className="text-red-500" />}
                                        <div>
                                            <div className="text-white font-bold">+{selectedTerritory.bonus.value * 100}% {selectedTerritory.bonus.type.toUpperCase()}</div>
                                            <div className="text-xs text-gray-500">Global Modifier</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Defenses</div>
                                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                        <span className="text-gray-300">Power Rating</span>
                                        <span className="text-white font-mono">{formatNumber(selectedTerritory.difficulty)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                        <span className="text-gray-300">Win Probability</span>
                                        <span className={`font-bold ${getWinChance(selectedTerritory.difficulty) === 'Guaranteed' ? 'text-green-400' :
                                            getWinChance(selectedTerritory.difficulty) === 'High' ? 'text-green-200' :
                                                getWinChance(selectedTerritory.difficulty) === 'Moderate' ? 'text-yellow-400' :
                                                    'text-red-500'
                                            }`}>{getWinChance(selectedTerritory.difficulty)}</span>
                                    </div>
                                </div>

                                <div className="flex-1" />

                                {selectedTerritory.owner !== 'player' ? (
                                    <button
                                        onClick={() => onAttack(selectedTerritory.id)}
                                        className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all hover:scale-105"
                                    >
                                        <Sword className="w-5 h-5" />
                                        LAY SIEGE
                                    </button>
                                ) : (
                                    <div className="w-full py-4 rounded-lg bg-green-900/50 border border-green-700 text-green-200 font-bold flex items-center justify-center gap-2 cursor-default">
                                        <Shield className="w-5 h-5" />
                                        DEFENDING
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
                                <Flag className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a territory on the map to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
