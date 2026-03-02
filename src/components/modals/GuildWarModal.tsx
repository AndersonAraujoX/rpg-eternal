import { useState } from 'react';
import { X, Sword, Shield, Map as MapIcon, Flag, Coins, Activity, Lock, TrendingUp, Star } from 'lucide-react';
import type { Territory, Guild } from '../../engine/types';
import { formatNumber } from '../../utils';

interface GuildWarModalProps {
    onClose: () => void;
    territories: Territory[];
    onAttack: (territoryId: string) => void;
    onUpgrade: (territoryId: string) => void;
    partyPower: number;
    guild: Guild | null;
    gold: number;
}

export function GuildWarModal({ onClose, territories, onAttack, onUpgrade, partyPower, guild, gold }: GuildWarModalProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Always read from latest territories prop to pick up upgrades
    const selected = selectedId ? territories.find(t => t.id === selectedId) ?? null : null;

    const isLeader = guild !== null && (guild.totalContribution || 0) >= 10000;
    const playerTerritories = territories.filter(t => t.owner === 'player').length;

    const ownerColor = (owner: string) => {
        switch (owner) {
            case 'player': return 'text-green-400 border-green-500 bg-green-900/20';
            case 'Xang': return 'text-red-400 border-red-500 bg-red-900/20';
            case 'Zhauw': return 'text-blue-400 border-blue-500 bg-blue-900/20';
            case 'Yang': return 'text-yellow-400 border-yellow-500 bg-yellow-900/20';
            default: return 'text-gray-400 border-gray-500 bg-gray-900/20';
        }
    };

    const winChanceLabel = (diff: number) => {
        const r = partyPower / diff;
        if (r >= 2) return { text: 'Garantida', color: 'text-green-400' };
        if (r >= 1.2) return { text: 'Alta', color: 'text-green-400' };
        if (r >= 0.8) return { text: 'Moderada', color: 'text-yellow-400' };
        if (r >= 0.5) return { text: 'Baixa', color: 'text-orange-400' };
        return { text: 'Suicida', color: 'text-red-500' };
    };

    const bonusIcon = (type: string) => {
        if (type === 'gold') return <Coins className="text-yellow-500 w-5 h-5" />;
        if (type === 'xp') return <Activity className="text-blue-500 w-5 h-5" />;
        if (type === 'damage') return <Sword className="text-red-500 w-5 h-5" />;
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-orange-700/50 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="p-5 border-b border-gray-800 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-orange-500">
                            <MapIcon className="w-7 h-7" /> Conquista Mundial
                        </h2>
                        <div className="text-xs text-gray-400 mt-1">
                            Capture e melhore territórios para bônus passivos. {' '}
                            <span className="text-green-400 font-bold">{playerTerritories}/{territories.length} conquistados</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
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
                    <div className="flex flex-1 overflow-hidden">
                        {/* Map */}
                        <div className="flex-1 bg-gray-950 relative overflow-hidden flex items-center justify-center"
                            style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, #1a0a00 0%, #080808 100%)' }}>
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: 'linear-gradient(#4a2000 1px, transparent 1px), linear-gradient(90deg, #4a2000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                            <div className="relative w-[600px] h-[400px]">
                                {territories.map(t => {
                                    const wc = winChanceLabel(t.difficulty);
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedId(t.id)}
                                            title={`${t.name} — ${wc.text}`}
                                            className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-full border-4 flex flex-col items-center justify-center transition-all hover:scale-110 shadow-lg
                                                ${ownerColor(t.owner)}
                                                ${selectedId === t.id ? 'ring-4 ring-white scale-110 z-10' : ''}
                                            `}
                                            style={{ left: `${(t.coordinates.x + 10) * 5}%`, top: `${(t.coordinates.y + 10) * 5}%` }}
                                        >
                                            <Flag className="w-4 h-4" />
                                            {t.level > 1 && <span className="text-[9px] font-bold leading-none">Lv{t.level}</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 bg-gray-900/80 p-2 rounded border border-gray-700 text-xs text-gray-300 space-y-1">
                                {[['green', 'Você'], ['red', 'Xang'], ['blue', 'Zhauw'], ['yellow', 'Yang'], ['gray', 'Neutro']].map(([c, label]) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 bg-${c}-500 rounded-full`} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detail panel */}
                        <div className="w-80 border-l border-gray-800 bg-gray-900 p-5 flex flex-col overflow-y-auto">
                            {selected ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                                        <p className="text-xs text-gray-400 italic mt-1">{selected.description}</p>
                                    </div>

                                    {/* Owner */}
                                    <div className={`p-3 rounded border ${ownerColor(selected.owner)}`}>
                                        <div className="text-xs uppercase font-bold opacity-60 mb-1">Controlado Por</div>
                                        <div className="text-base font-bold">
                                            {selected.owner === 'player' ? '🏆 Sua Guilda' : `🏴 Clã ${selected.owner}`}
                                        </div>
                                    </div>

                                    {/* Bonus */}
                                    <div className="bg-gray-800 p-3 rounded border border-gray-700 flex items-center gap-3">
                                        {bonusIcon(selected.bonus.type)}
                                        <div>
                                            <div className="text-white font-bold">
                                                +{(selected.bonus.value * 100).toFixed(1)}% {selected.bonus.type.toUpperCase()}
                                            </div>
                                            <div className="text-xs text-gray-500">Bônus Global Passivo</div>
                                        </div>
                                    </div>

                                    {/* Defense */}
                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Defesas</div>
                                        {[
                                            ['Poder de Defesa', formatNumber(selected.difficulty), 'text-white'],
                                            ['Chance de Vitória', winChanceLabel(selected.difficulty).text, winChanceLabel(selected.difficulty).color],
                                        ].map(([label, val, cls]) => (
                                            <div key={label} className="flex justify-between items-center bg-gray-800 p-2 rounded text-sm">
                                                <span className="text-gray-300">{label}</span>
                                                <span className={`font-bold ${cls}`}>{val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Upgrade panel (player-owned only) */}
                                    {selected.owner === 'player' && (
                                        <div className="bg-gray-800 p-3 rounded border border-orange-800/40 space-y-2">
                                            <div className="text-xs text-gray-400 font-bold uppercase flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-orange-400" /> Melhorias
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-300">Nível atual</span>
                                                <span className="text-orange-400 font-bold flex items-center gap-1">
                                                    <Star className="w-3 h-3" />{selected.level}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Bônus após upgrade</span>
                                                <span className="text-green-400 font-bold">
                                                    +{(selected.bonus.value * 1.25 * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => onUpgrade(selected.id)}
                                                disabled={gold < selected.upgradeCost}
                                                className={`w-full py-2 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all
                                                    ${gold >= selected.upgradeCost
                                                        ? 'bg-orange-700 hover:bg-orange-600 text-white hover:scale-105'
                                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                                Melhorar — {formatNumber(selected.upgradeCost)} Ouro
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex-1" />

                                    {/* Action button */}
                                    {selected.owner !== 'player' ? (
                                        <button
                                            onClick={() => onAttack(selected.id)}
                                            className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all hover:scale-105"
                                        >
                                            <Sword className="w-5 h-5" /> SITIAR
                                        </button>
                                    ) : (
                                        <div className="w-full py-3 rounded-lg bg-green-900/50 border border-green-700 text-green-200 font-bold flex items-center justify-center gap-2 cursor-default">
                                            <Shield className="w-5 h-5" /> DEFENDENDO
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
                                    <Flag className="w-14 h-14 mb-4 opacity-20" />
                                    <p className="text-sm">Selecione um território no mapa para ver detalhes e opções.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
