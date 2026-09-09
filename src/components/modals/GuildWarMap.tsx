import { useState, useEffect, useRef } from 'react';
import { Sword, Shield, Flag, Coins, Activity, TrendingUp, Star, Radio, Droplets, ShieldAlert } from 'lucide-react';
import type { Territory } from '../../engine/types';
import { TERRITORY_MODULE_UPGRADE_COSTS } from '../../engine/guildWar';
import { formatNumber } from '../../utils';

interface GuildWarMapProps {
    territories: Territory[];
    partyPower: number;
    gold: number;
    industryInventory?: Record<string, number>;
    onAttack: (territoryId: string) => void;
    onUpgrade: (territoryId: string) => void;
    onAdvanceMap: () => void;
    onBombard?: (territoryId: string, weaponId: 'siege_catapult' | 'plasma_cannon') => void;
    backroomsResources?: { scrap?: number; almondWater?: number; liminalFluid?: number; voidAlloy?: number };
    onUpgradeTerritoryModule?: (territoryId: string, moduleType: 'radioTower' | 'waterCondenser' | 'guardSoldiers') => void;
}

export function GuildWarMap({
    territories,
    partyPower,
    gold,
    industryInventory = {},
    onAttack,
    onUpgrade,
    onAdvanceMap,
    onBombard,
    backroomsResources = {},
    onUpgradeTerritoryModule
}: GuildWarMapProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
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
    }, [territories]);

    const selected = selectedId ? territories.find(t => t.id === selectedId) ?? null : null;
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

    return (
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
                        const isRift = t.isLiminalRift;
                        const isExclamation = t.isLevelExclamation;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setSelectedId(t.id)}
                                title={`${t.name} — ${wc.text}${isRift ? ' (Fenda Liminar)' : ''}`}
                                className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-full border-4 flex flex-col items-center justify-center transition-all hover:scale-110 shadow-lg
                                    ${ownerColor(t.owner)}
                                    ${isRift ? 'ring-2 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.7)]' : ''}
                                    ${isExclamation ? 'ring-4 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse' : ''}
                                    ${selectedId === t.id ? 'ring-4 ring-white scale-110 z-10' : ''}
                                `}
                                style={{ left: `${(t.coordinates.x + 10) * 5}%`, top: `${(t.coordinates.y + 10) * 5}%` }}
                            >
                                <div className="relative flex items-center justify-center">
                                    <Flag className="w-4 h-4" />
                                    {isRift && (
                                        <span className="absolute -top-3 -right-3 text-[11px] animate-spin" style={{ animationDuration: '4s' }}>
                                            🌀
                                        </span>
                                    )}
                                </div>
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

                        {/* Liminal Rift Banner if Active */}
                        {selected.isLiminalRift && (
                            <div className="bg-gradient-to-br from-purple-950/80 via-purple-900/40 to-indigo-950/70 p-3 rounded-xl border border-purple-500/50 space-y-2 shadow-lg shadow-purple-950/40">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                        🌀 Fenda Liminar Ativa
                                    </span>
                                    <span className="text-[10px] bg-purple-900/90 text-purple-200 px-2 py-0.5 rounded-full font-mono font-bold border border-purple-400/40">
                                        Rift Lv.{selected.riftLevel || 1}
                                    </span>
                                </div>
                                <p className="text-[11px] text-purple-200/90 leading-relaxed">
                                    {selected.isLevelExclamation
                                        ? '⚠️ Fenda Crítica do Nível ! (Corredor Carmim). Risco extremo, rendimento quântico estelar!'
                                        : 'Ruptura dimensional conectada às Backrooms. Produz recursos raros contínuos para a guilda.'}
                                </p>
                                {selected.exoticYield && (
                                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono text-[10px]">
                                        <div className="bg-purple-950/80 p-1.5 rounded-lg border border-purple-700/40">
                                            <div className="text-purple-300 font-bold">+{selected.exoticYield.liminalFluid}</div>
                                            <div className="text-gray-400 text-[8px]">Fluido/min</div>
                                        </div>
                                        <div className="bg-purple-950/80 p-1.5 rounded-lg border border-purple-700/40">
                                            <div className="text-cyan-300 font-bold">+{selected.exoticYield.voidAlloy}</div>
                                            <div className="text-gray-400 text-[8px]">Liga Vazio/min</div>
                                        </div>
                                        <div className="bg-purple-950/80 p-1.5 rounded-lg border border-purple-700/40">
                                            <div className="text-amber-300 font-bold">+{selected.exoticYield.backroomsScrap}</div>
                                            <div className="text-gray-400 text-[8px]">Sucata/min</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Defense */}
                        <div className="space-y-1">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Defesas</div>
                            {[
                                ['Poder de Defesa', formatNumber(selected.difficulty), 'text-white'],
                                ['Chance de Vitória', winChanceLabel(selected.difficulty).text, winChanceLabel(selected.difficulty).color],
                                ...(selected.defenseBonus ? [['Bônus M.E.G.', `+${(selected.defenseBonus * 100).toFixed(0)}%`, 'text-purple-400']] : [])
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
                                    <TrendingUp className="w-4 h-4 text-orange-400" /> Melhorias de Território
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

                        {/* M.E.G. Outpost Fortifications (player-owned only) */}
                        {selected.owner === 'player' && onUpgradeTerritoryModule && (
                            <div className="bg-gray-850 p-3 rounded-xl border border-purple-800/40 space-y-2.5">
                                <div className="text-xs text-purple-300 font-bold uppercase flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-purple-400" /> Módulos M.E.G. de Fortificação
                                </div>
                                <p className="text-[10px] text-gray-400">
                                    Instale defesas liminares para mitigar invasões rivais e colapsos dimensionais.
                                </p>

                                <div className="space-y-2">
                                    {/* Radio Tower */}
                                    {(() => {
                                        const lvl = selected.modules?.radioTower || 0;
                                        const cost = TERRITORY_MODULE_UPGRADE_COSTS.radioTower;
                                        const canAfford = (backroomsResources.scrap || 0) >= cost.scrap &&
                                            (backroomsResources.almondWater || 0) >= cost.almondWater;
                                        const isMax = lvl >= 5;
                                        return (
                                            <div className="bg-gray-900 p-2 rounded-lg border border-gray-800 flex items-center justify-between text-xs">
                                                <div className="space-y-0.5">
                                                    <div className="text-white font-bold flex items-center gap-1.5">
                                                        <Radio className="w-3.5 h-3.5 text-cyan-400" /> Torre de Rádio
                                                        <span className="text-[10px] text-gray-400 font-mono">Lv.{lvl}/5</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        +{lvl * 15}% Defesa ({cost.scrap} Suc / {cost.almondWater} Água)
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onUpgradeTerritoryModule(selected.id, 'radioTower')}
                                                    disabled={isMax || !canAfford}
                                                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${isMax
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        : canAfford
                                                            ? 'bg-purple-700 hover:bg-purple-600 text-white'
                                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isMax ? 'MAX' : 'Aprimorar'}
                                                </button>
                                            </div>
                                        );
                                    })()}

                                    {/* Water Condenser */}
                                    {(() => {
                                        const lvl = selected.modules?.waterCondenser || 0;
                                        const cost = TERRITORY_MODULE_UPGRADE_COSTS.waterCondenser;
                                        const canAfford = (backroomsResources.scrap || 0) >= cost.scrap &&
                                            (backroomsResources.almondWater || 0) >= cost.almondWater;
                                        const isMax = lvl >= 5;
                                        return (
                                            <div className="bg-gray-900 p-2 rounded-lg border border-gray-800 flex items-center justify-between text-xs">
                                                <div className="space-y-0.5">
                                                    <div className="text-white font-bold flex items-center gap-1.5">
                                                        <Droplets className="w-3.5 h-3.5 text-blue-400" /> Condensador Água
                                                        <span className="text-[10px] text-gray-400 font-mono">Lv.{lvl}/5</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        +{lvl} Água/min ({cost.scrap} Suc / {cost.almondWater} Água)
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onUpgradeTerritoryModule(selected.id, 'waterCondenser')}
                                                    disabled={isMax || !canAfford}
                                                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${isMax
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        : canAfford
                                                            ? 'bg-blue-700 hover:bg-blue-600 text-white'
                                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isMax ? 'MAX' : 'Aprimorar'}
                                                </button>
                                            </div>
                                        );
                                    })()}

                                    {/* Guard Soldiers */}
                                    {(() => {
                                        const lvl = selected.modules?.guardSoldiers || 0;
                                        const cost = TERRITORY_MODULE_UPGRADE_COSTS.guardSoldiers;
                                        const canAfford = (backroomsResources.scrap || 0) >= cost.scrap &&
                                            (backroomsResources.almondWater || 0) >= cost.almondWater &&
                                            (backroomsResources.liminalFluid || 0) >= (cost.liminalFluid || 0);
                                        const isMax = lvl >= 5;
                                        return (
                                            <div className="bg-gray-900 p-2 rounded-lg border border-gray-800 flex items-center justify-between text-xs">
                                                <div className="space-y-0.5">
                                                    <div className="text-white font-bold flex items-center gap-1.5">
                                                        <Shield className="w-3.5 h-3.5 text-amber-400" /> Guardas M.E.G.
                                                        <span className="text-[10px] text-gray-400 font-mono">Lv.{lvl}/5</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        +{lvl * 10}% Resistência ({cost.scrap} Suc / {cost.liminalFluid || 0} Fluido)
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onUpgradeTerritoryModule(selected.id, 'guardSoldiers')}
                                                    disabled={isMax || !canAfford}
                                                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${isMax
                                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        : canAfford
                                                            ? 'bg-amber-700 hover:bg-amber-600 text-white'
                                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {isMax ? 'MAX' : 'Aprimorar'}
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
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
    );
}
