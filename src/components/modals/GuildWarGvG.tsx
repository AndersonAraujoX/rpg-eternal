import { useRef } from 'react';
import { Sword, Lock, Zap, Target, Heart, Activity } from 'lucide-react';
import type { GvGWarState } from '../../engine/guildWar';
import { formatNumber } from '../../utils';

interface GuildWarGvGProps {
    isLeader: boolean;
    gvgWarState?: GvGWarState | null;
    onStartGvG?: () => void;
    onPlayerGvGAttack?: (towerId: string) => void;
}

export function GuildWarGvG({
    isLeader,
    gvgWarState,
    onStartGvG,
    onPlayerGvGAttack
}: GuildWarGvGProps) {
    const gvgLogRef = useRef<HTMLDivElement>(null);

    if (!isLeader) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Lock className="w-16 h-16 text-orange-500/50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">GvG Bloqueado</h3>
                <p className="text-gray-400 max-w-md">
                    Torne-se <span className="text-orange-400 font-bold">Líder da Guilda</span> para participar de guerras.
                </p>
            </div>
        );
    }

    if (!gvgWarState || !gvgWarState.warActive) {
        // Show start war screen or results
        const hasResults = gvgWarState && !gvgWarState.warActive;
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6">
                {hasResults && gvgWarState && (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md space-y-3">
                        <h3 className="text-xl font-bold text-white">
                            {gvgWarState.playerScore > gvgWarState.rivalScore ? '🏆 Última Guerra: Vitória!' : '💀 Última Guerra: Derrota'}
                        </h3>
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-green-400 font-bold">{gvgWarState.playerGuildName}</span>
                            <span className="text-3xl font-black text-white">
                                {gvgWarState.playerScore} <span className="text-gray-500 text-lg">vs</span> {gvgWarState.rivalScore}
                            </span>
                            <span className="text-red-400 font-bold">{gvgWarState.rivalGuildName}</span>
                        </div>
                        <div className="text-xs text-gray-500">Torres destruídas: {gvgWarState.towers.filter(t => t.destroyed).length}/5</div>
                    </div>
                )}
                <div className="space-y-3">
                    <Sword className="w-16 h-16 text-orange-500/50 mx-auto" />
                    <h3 className="text-xl font-bold text-white">Guilda vs Guilda</h3>
                    <p className="text-gray-400 max-w-sm text-sm">
                        Inicie uma guerra contra uma guilda rival. Seus aliados bots lutarão automaticamente,
                        mas você tem <span className="text-yellow-400 font-bold">3 ataques manuais</span> para causar dano bônus!
                    </p>
                    <button
                        onClick={() => onStartGvG?.()}
                        className="px-8 py-3 bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 rounded-lg font-bold text-white text-lg shadow-lg shadow-red-900/40 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <Sword className="w-5 h-5" /> Iniciar Guerra
                    </button>
                </div>
            </div>
        );
    }

    // Active war view
    const totalPlayerMax = gvgWarState.playerScore + gvgWarState.rivalScore || 1;
    const playerBarPct = Math.max(5, (gvgWarState.playerScore / totalPlayerMax) * 100);
    const towerDestroyedCount = gvgWarState.towers.filter(t => t.destroyed).length;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scoreboard */}
            <div className="p-4 border-b border-gray-800 shrink-0 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="text-left">
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Sua Guilda</div>
                        <div className="text-lg font-bold text-green-400">{gvgWarState.playerGuildName}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-white tracking-wider">
                            {gvgWarState.playerScore} <span className="text-gray-600 text-lg mx-1">vs</span> {gvgWarState.rivalScore}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">Rodada {gvgWarState.tickCount}/60</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Guilda Rival</div>
                        <div className="text-lg font-bold text-red-400">{gvgWarState.rivalGuildName}</div>
                    </div>
                </div>
                {/* Score bar */}
                <div className="w-full h-3 bg-red-900/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${playerBarPct}%` }}
                    />
                </div>
                {/* Attack counter */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">Ataques: {gvgWarState.playerAttacksLeft}/3</span>
                    </div>
                    <div className="text-gray-500 text-xs">
                        Torres destruídas: <span className="text-orange-400 font-bold">{towerDestroyedCount}/5</span>
                    </div>
                </div>
            </div>

            {/* Towers + Logs */}
            <div className="flex flex-1 overflow-hidden">
                {/* Towers Grid */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-red-400" /> Torres Inimigas
                    </div>
                    {gvgWarState.towers.map((tower) => {
                        const hpPct = (tower.hp / tower.maxHp) * 100;
                        const hpColor = hpPct > 60 ? 'bg-green-500' : hpPct > 30 ? 'bg-yellow-500' : 'bg-red-500';

                        return (
                            <div
                                key={tower.id}
                                className={`rounded-lg border p-3 transition-all ${tower.destroyed
                                    ? 'bg-gray-900/50 border-gray-800 opacity-50'
                                    : 'bg-gray-800 border-gray-700 hover:border-orange-600/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{tower.destroyed ? '🏚️' : '🏰'}</span>
                                        <div>
                                            <div className={`font-bold text-sm ${tower.destroyed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {tower.name}
                                            </div>
                                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <span className="text-lg">{tower.defenderAvatar}</span>
                                                {tower.defenderName} — ⚔️ {formatNumber(tower.defenderPower)}
                                            </div>
                                        </div>
                                    </div>
                                    {!tower.destroyed && (
                                        <button
                                            onClick={() => onPlayerGvGAttack?.(tower.id)}
                                            disabled={gvgWarState.playerAttacksLeft <= 0}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1
                                                ${gvgWarState.playerAttacksLeft > 0
                                                    ? 'bg-red-700 hover:bg-red-600 text-white hover:scale-105 shadow-md shadow-red-900/30'
                                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            <Sword className="w-3 h-3" /> Atacar
                                        </button>
                                    )}
                                </div>
                                {/* HP Bar */}
                                {!tower.destroyed ? (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="text-gray-400 flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> HP</span>
                                            <span className="text-gray-300">{formatNumber(tower.hp)} / {formatNumber(tower.maxHp)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${hpColor} rounded-full transition-all duration-300`}
                                                style={{ width: `${hpPct}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-xs text-red-400 font-bold py-1">💥 DESTRUÍDA</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* War Logs Panel */}
                <div className="w-72 border-l border-gray-800 bg-gray-900 flex flex-col shrink-0">
                    <div className="p-3 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-400" /> Relatório de Guerra
                    </div>
                    <div ref={gvgLogRef} className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {gvgWarState.warLogs.map((log, idx) => {
                            const logColor = log.type === 'achievement' ? 'text-yellow-300'
                                : log.type === 'success' ? 'text-green-300'
                                    : log.type === 'danger' ? 'text-red-300'
                                        : 'text-gray-400';
                            return (
                                <div key={idx} className={`text-[11px] ${logColor} leading-tight py-1 px-2 rounded bg-gray-800/50`}>
                                    {log.message}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
