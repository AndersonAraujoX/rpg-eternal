import React from 'react';
import { Swords, Trophy, Coins, Star, Users } from 'lucide-react';
import type { Hero, ArenaOpponent } from '../../engine/types';
import { formatNumber } from '../../utils';

interface ArenaModalProps {
    isOpen: boolean;
    onClose: () => void;
    rank: number;
    glory: number;
    heroes: Hero[];
    opponents: ArenaOpponent[];
    onFight: (opponent: ArenaOpponent) => void;
}

export const ArenaModal: React.FC<ArenaModalProps> = ({ isOpen, onClose, rank, glory, heroes, opponents, onFight }) => {
    if (!isOpen) return null;

    const teamPower = heroes.filter(h => h.unlocked && h.assignment === 'combat').reduce((acc, h) =>
        acc + (h.stats.attack || 0) + Math.floor((h.stats.maxHp || 0) / 10) + (h.stats.magic || 0) + (h.stats.defense || 0), 0);

    const getWinChanceColor = (opPower: number) => {
        const ratio = teamPower / (teamPower + opPower + 1);
        if (ratio >= 0.7) return 'text-green-400';
        if (ratio >= 0.45) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getWinChanceLabel = (opPower: number) => {
        const ratio = teamPower / (teamPower + opPower + 1);
        if (ratio >= 0.7) return 'Fácil';
        if (ratio >= 0.55) return 'Normal';
        if (ratio >= 0.4) return 'Difícil';
        return 'Suicida';
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-yellow-600 w-full max-w-2xl p-6 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold hover:text-red-500">X</button>

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-yellow-500 text-3xl font-bold flex items-center gap-2"><Swords size={32} /> ARENA</h2>
                    <div className="text-right">
                        <div className="text-xl text-yellow-200">Ranking: <span className="font-bold text-white">#{rank}</span></div>
                        <div className="text-sm text-yellow-400 flex items-center justify-end gap-1"><Trophy size={14} /> Glória: {formatNumber(glory)}</div>
                    </div>
                </div>

                {/* Caixa de Recompensas */}
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-4 flex items-start gap-3">
                    <Trophy className="text-yellow-400 mt-0.5 shrink-0" size={18} />
                    <div className="text-xs text-yellow-200 space-y-0.5">
                        <div className="font-bold text-yellow-400 text-sm mb-1">🏆 Recompensas por Vitória</div>
                        <div className="flex gap-4 flex-wrap">
                            <span className="flex items-center gap-1"><Coins size={12} className="text-yellow-400" /> Ouro (escala com poder inimigo)</span>
                            <span className="flex items-center gap-1"><Star size={12} className="text-purple-400" /> Glória (melhora ranking)</span>
                            <span className="flex items-center gap-1"><Users size={12} className="text-green-400" /> 25% chance de lutador se juntar à guilda</span>
                        </div>
                        <div className="text-gray-400 mt-1">⚠️ Oponentes crescem <span className="text-orange-400">10%-100%</span> mais fortes a cada vitória!</div>
                    </div>
                </div>

                {/* Seu Time */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 bg-slate-800 p-3 rounded border border-slate-600">
                        <h3 className="text-gray-400 text-sm uppercase mb-2">Seu Time</h3>
                        <div className="flex gap-1 flex-wrap">
                            {heroes.filter(h => h.unlocked && h.assignment === 'combat').map(h => (
                                <div key={h.id} className="text-2xl" title={h.name}>{h.emoji}</div>
                            ))}
                        </div>
                        <div className="mt-2 text-cyan-400 font-bold">Poder: {formatNumber(Math.floor(teamPower))}</div>
                    </div>
                </div>

                <h3 className="text-white font-bold mb-3 border-b border-gray-700 pb-2">⚔️ ESCOLHER OPONENTE</h3>
                <div className="space-y-3">
                    {opponents.length === 0 && (
                        <div className="text-center text-gray-500 py-6">Aguardando novos desafiantes...</div>
                    )}
                    {opponents.map(op => {
                        const goldReward = Math.floor(50 + op.power * 0.5);
                        const gloryReward = 10 + Math.floor(op.power / 50);
                        return (
                            <div key={op.id} className="flex justify-between items-center bg-gray-800 p-3 rounded hover:bg-gray-700 border border-gray-600 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{op.avatar}</span>
                                    <div>
                                        <div className="text-white font-bold">{op.name}</div>
                                        <div className="text-xs text-gray-400">Rank #{op.rank}</div>
                                        {/* Recompensas previstas */}
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Coins size={10} />+{formatNumber(goldReward)}</span>
                                            <span className="text-xs text-purple-400 flex items-center gap-0.5"><Star size={10} />+{gloryReward}</span>
                                            <span className="text-xs text-green-400 flex items-center gap-0.5"><Users size={10} />25%🛡️</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-bold text-sm ${op.power > teamPower ? 'text-red-400' : 'text-green-400'}`}>
                                            ⚡ {formatNumber(op.power)}
                                        </span>
                                        <span className={`text-xs font-bold ${getWinChanceColor(op.power)}`}>
                                            {getWinChanceLabel(op.power)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onFight(op)}
                                        className="bg-red-700 hover:bg-red-600 text-white px-4 py-1 rounded font-bold flex items-center gap-1 border border-red-500 text-sm"
                                    >
                                        LUTAR <Swords size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
