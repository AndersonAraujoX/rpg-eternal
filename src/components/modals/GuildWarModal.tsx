import { useState, useEffect, useRef } from 'react';
import { X, Sword, Shield, Map as MapIcon, Flag, Coins, Activity, Lock, TrendingUp, Star, Zap, Target, Heart } from 'lucide-react';
import type { Guild } from '../../engine/types';
import type { Territory } from '../../engine/types';
import type { GvGWarState } from '../../engine/guildWar';
import { formatNumber } from '../../utils';

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
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'map' | 'gvg'>('map');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gvgLogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeTab !== 'map') return;
        const canvas = canvasRef.current;
        if (!canvas || territories.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cellSize = 5;
        const cols = w / cellSize;
        const rows = h / cellSize;

        const colorMap: Record<string, string> = {
            'player': '#16a34a',
            'Xang': '#dc2626',
            'Zhauw': '#2563eb',
            'Yang': '#ca8a04',
            'Kael': '#9333ea',
            'Vyrn': '#0d9488',
            'Ocean': '#0369a1',
            'Neutral': '#4b5563'
        };

        ctx.clearRect(0, 0, w, h);

        const centers = territories.map(t => ({
            x: (t.coordinates.x + 10) * 5 * (w / 100),
            y: (t.coordinates.y + 10) * 5 * (h / 100),
            color: colorMap[t.owner] || colorMap['Neutral']
        }));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const px = c * cellSize + cellSize / 2;
                const py = r * cellSize + cellSize / 2;

                let minDist = Infinity;
                let closestColor = '#000';

                for (const point of centers) {
                    const dist = Math.hypot(px - point.x, py - point.y);
                    if (dist < minDist) {
                        minDist = dist;
                        closestColor = point.color;
                    }
                }

                ctx.fillStyle = closestColor;
                ctx.globalAlpha = 0.4;
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }
    }, [territories, activeTab]);

    const selected = selectedId ? territories.find(t => t.id === selectedId) ?? null : null;

    const isLeader = guild !== null && (guild.totalContribution || 0) >= 10000;
    const capturableTerritories = territories.filter(t => t.owner !== 'Ocean');
    const playerTerritories = capturableTerritories.filter(t => t.owner === 'player').length;

    const ownerColor = (owner: string) => {
        switch (owner) {
            case 'player': return 'text-green-400 border-green-500 bg-green-900/20';
            case 'Xang': return 'text-red-400 border-red-500 bg-red-900/20';
            case 'Zhauw': return 'text-blue-400 border-blue-500 bg-blue-900/20';
            case 'Yang': return 'text-yellow-400 border-yellow-500 bg-yellow-900/20';
            case 'Kael': return 'text-purple-400 border-purple-500 bg-purple-900/20';
            case 'Vyrn': return 'text-teal-400 border-teal-500 bg-teal-900/20';
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

    // ─── GvG Rendering ──────────────────────────────────────────
    const renderGvGTab = () => {
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
    };

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
                    renderGvGTab()
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
                            <div className="flex flex-1 overflow-hidden">
                                {/* Map */}
                                <div className="flex-1 bg-gray-950 relative overflow-hidden flex items-center justify-center"
                                    style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, #1a0a00 0%, #080808 100%)' }}>
                                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                                        style={{ backgroundImage: 'linear-gradient(#4a2000 1px, transparent 1px), linear-gradient(90deg, #4a2000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                                    <div className="relative w-[600px] h-[400px]">
                                        <canvas
                                            ref={canvasRef}
                                            width={600}
                                            height={400}
                                            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
                                            style={{ filter: 'brightness(1.5) contrast(1.2) drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                                        />

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
                                        {[['green', 'Você'], ['red', 'Xang'], ['blue', 'Zhauw'], ['yellow', 'Yang'], ['purple', 'Kael'], ['teal', 'Vyrn'], ['sky', 'Oceano'], ['gray', 'Neutro']].map(([c, label]) => (
                                            <div key={label} className="flex items-center gap-2">
                                                <div className={`w-3 h-3 bg-${c === 'sky' ? 'sky-700' : c + '-500'} rounded-full`} />
                                                {label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Advance map button */}
                                    {capturableTerritories.length > 0 && (
                                        <div className="absolute top-4 right-4">
                                            <button
                                                onClick={() => {
                                                    const msg = playerTerritories === capturableTerritories.length
                                                        ? "Isso apagará o mapa atual e gerará um território totalmente novo e muito mais difícil. Os bônus passivos atuais serão descartados, mas o novo mapa trará recompensas muito superiores. Tem certeza?"
                                                        : "Atenção: Você não conquistou todos os territórios! Ao avançar agora, você abandona a campanha atual e gera um novo mapa aleatório do zero. Deseja realmente descartar este mapa?";
                                                    if (confirm(msg)) {
                                                        onAdvanceMap();
                                                        setSelectedId(null);
                                                    }
                                                }}
                                                className={`font-bold py-2 px-4 rounded-lg border-2 animate-pulse font-mono uppercase tracking-widest text-xs ${playerTerritories === capturableTerritories.length
                                                    ? "bg-green-600 hover:bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(22,163,74,0.5)]"
                                                    : "bg-red-900/80 hover:bg-red-800 text-red-100 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                                    }`}
                                            >
                                                {playerTerritories === capturableTerritories.length ? "Avançar" : "Novo Mapa"}
                                            </button>
                                        </div>
                                    )}
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

                                            {/* Action buttons */}
                                            {selected.owner !== 'player' ? (
                                                <div className="space-y-2">
                                                    {onBombard && (
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            <button
                                                                onClick={() => onBombard(selected.id, 'siege_catapult')}
                                                                disabled={!(industryInventory['siege_catapult'] > 0)}
                                                                className={`flex flex-col items-center justify-center p-2 rounded border text-xs font-bold transition-all
                                                                    ${industryInventory['siege_catapult'] > 0
                                                                        ? 'bg-amber-900 border-amber-600 hover:bg-amber-800 text-amber-200'
                                                                        : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'}`}
                                                            >
                                                                <span className="text-xl mb-1">🪨</span>
                                                                <span>Catapulta</span>
                                                                <span className="text-[9px] opacity-75">{industryInventory['siege_catapult'] || 0} Disponíveis</span>
                                                            </button>
                                                            <button
                                                                onClick={() => onBombard(selected.id, 'plasma_cannon')}
                                                                disabled={!(industryInventory['plasma_cannon'] > 0)}
                                                                className={`flex flex-col items-center justify-center p-2 rounded border text-xs font-bold transition-all
                                                                    ${industryInventory['plasma_cannon'] > 0
                                                                        ? 'bg-cyan-900 border-cyan-600 hover:bg-cyan-800 text-cyan-200'
                                                                        : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'}`}
                                                            >
                                                                <span className="text-xl mb-1">☄️</span>
                                                                <span>Canhão Plasma</span>
                                                                <span className="text-[9px] opacity-75">{industryInventory['plasma_cannon'] || 0} Disponíveis</span>
                                                            </button>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => onAttack(selected.id)}
                                                        className="w-full py-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all hover:scale-105"
                                                    >
                                                        <Sword className="w-5 h-5" /> SITIAR
                                                    </button>
                                                </div>
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
                    </>
                )}
            </div>
        </div>
    );
}
