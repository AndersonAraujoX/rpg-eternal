import { useState } from 'react';
import { X, Sword, Shield, Map as MapIcon, Flag, Coins, Activity, Lock } from 'lucide-react';
import type { Guild, Territory } from '../../engine/types';
import { formatNumber } from '../../utils';

interface GuildWarModalProps {
    onClose: () => void;
    territories: Territory[];
    onAttack: (territoryId: string) => void;
    partyPower: number;
    guild: Guild | null;
}

export function GuildWarModal({ onClose, territories, onAttack, partyPower, guild }: GuildWarModalProps) {
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

    // Bloqueado até ser líder da guilda (contribuição mínima para ser líder)
    const isLeader = guild !== null && (guild.totalContribution || 0) >= 10000;

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
        if (ratio >= 2) return 'Garantida';
        if (ratio >= 1.2) return 'Alta';
        if (ratio >= 0.8) return 'Moderada';
        if (ratio >= 0.5) return 'Baixa';
        return 'Suicida';
    };

    const getWinChanceColor = (difficulty: number) => {
        const ratio = partyPower / difficulty;
        if (ratio >= 1.2) return 'text-green-400';
        if (ratio >= 0.8) return 'text-yellow-400';
        return 'text-red-500';
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-orange-700/50 rounded-xl w-full max-w-5xl h-[80vh] flex flex-col relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X className="w-6 h-6" /></button>

                {/* Cabeçalho */}
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-orange-500">
                            <MapIcon className="w-8 h-8" />
                            Conquista Mundial
                        </h2>
                        <div className="text-xs text-gray-400 mt-1">Capture territórios para ganhar bônus passivos para sua guilda.</div>
                    </div>
                    <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                        <div className="text-xs text-gray-400">Poder do Exército</div>
                        <div className="text-xl font-bold text-white flex items-center gap-2">
                            <Sword className="w-4 h-4 text-orange-500" />
                            {formatNumber(partyPower)}
                        </div>
                    </div>
                </div>

                {/* Bloqueio de Líder */}
                {!isLeader && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <Lock className="w-16 h-16 text-orange-500/50 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Modo Guerra Bloqueado</h3>
                        <p className="text-gray-400 max-w-md">
                            Somente o <span className="text-orange-400 font-bold">Líder da Guilda</span> pode iniciar guerras territoriais.
                            Contribua <span className="text-yellow-400 font-bold">10.000 de Ouro</span> para a guilda e torne-se o líder.
                        </p>
                        {guild && (
                            <div className="mt-4 bg-gray-800 p-3 rounded-lg text-sm">
                                <span className="text-gray-400">Sua contribuição: </span>
                                <span className="text-yellow-400 font-bold">{formatNumber(guild.totalContribution || 0)} / 10.000 Ouro</span>
                            </div>
                        )}
                        {!guild && (
                            <p className="mt-4 text-red-400 text-sm">Você ainda não é membro de uma guilda!</p>
                        )}
                    </div>
                )}

                {isLeader && (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Mapa */}
                        <div className="flex-1 bg-gray-950 relative overflow-auto p-8 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

                            {/* Grade Decorativa */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                            />

                            {/* Territórios */}
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
                            </div>

                            {/* Legenda */}
                            <div className="absolute bottom-4 left-4 bg-gray-900/80 p-2 rounded border border-gray-700 text-xs text-gray-300">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> Você</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Xang</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> Zhauw</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /> Yang</div>
                            </div>
                        </div>

                        {/* Painel de Detalhes */}
                        <div className="w-80 border-l border-gray-800 bg-gray-900 p-6 flex flex-col">
                            {selectedTerritory ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{selectedTerritory.name}</h3>
                                        <p className="text-sm text-gray-400 italic">{selectedTerritory.description}</p>
                                    </div>

                                    <div className={`p-3 rounded border bg-opacity-10 ${getOwnerColor(selectedTerritory.owner).replace('bg-opacity-20', '')}`}>
                                        <div className="text-xs uppercase font-bold opacity-70">Controlado Por</div>
                                        <div className="text-lg font-bold">{selectedTerritory.owner === 'player' ? 'Sua Guilda' : `Clã ${selectedTerritory.owner}`}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Valor Estratégico</div>
                                        <div className="bg-gray-800 p-3 rounded flex items-center gap-3 border border-gray-700">
                                            {selectedTerritory.bonus.type === 'gold' && <Coins className="text-yellow-500" />}
                                            {selectedTerritory.bonus.type === 'xp' && <Activity className="text-blue-500" />}
                                            {selectedTerritory.bonus.type === 'damage' && <Sword className="text-red-500" />}
                                            <div>
                                                <div className="text-white font-bold">+{selectedTerritory.bonus.value * 100}% {selectedTerritory.bonus.type.toUpperCase()}</div>
                                                <div className="text-xs text-gray-500">Modificador Global</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Defesas</div>
                                        <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                            <span className="text-gray-300">Poder de Defesa</span>
                                            <span className="text-white font-mono">{formatNumber(selectedTerritory.difficulty)}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                                            <span className="text-gray-300">Chance de Vitória</span>
                                            <span className={`font-bold ${getWinChanceColor(selectedTerritory.difficulty)}`}>
                                                {getWinChance(selectedTerritory.difficulty)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1" />

                                    {selectedTerritory.owner !== 'player' ? (
                                        <button
                                            onClick={() => onAttack(selectedTerritory.id)}
                                            className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all hover:scale-105"
                                        >
                                            <Sword className="w-5 h-5" />
                                            SITIAR
                                        </button>
                                    ) : (
                                        <div className="w-full py-4 rounded-lg bg-green-900/50 border border-green-700 text-green-200 font-bold flex items-center justify-center gap-2 cursor-default">
                                            <Shield className="w-5 h-5" />
                                            DEFENDENDO
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
                                    <Flag className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Selecione um território no mapa para ver os detalhes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
