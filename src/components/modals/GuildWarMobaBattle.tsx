import { useState, useRef, useEffect } from 'react';
import {
    Sword,
    Shield,
    Flag,
    Zap,
    Heart,
    Flame,
    Activity,
    Target,
    Award
} from 'lucide-react';
import type {
    GuildWarMobaState,
    MobaTacticalStance,
    MobaCommanderAbilities,
    MobaLane
} from '../../engine/guildWarMoba';
import { formatNumber } from '../../utils';

interface GuildWarMobaBattleProps {
    battleState: GuildWarMobaState;
    onSetStance: (stance: MobaTacticalStance) => void;
    onUseAbility: (abilityId: keyof MobaCommanderAbilities, options?: { targetLane?: MobaLane; entityId?: any; isScout?: boolean }) => void;
    onManualStrike: (targetId: string) => void;
    onReturnToMap: () => void;
    partyPower: number;
    liminalFluid?: number;
    containedEntities?: any[];
    onSummonEntity?: (entityId: any, lane: MobaLane) => void;
    onNoclipFlank?: (lane?: MobaLane) => void;
    onAlmondSurge?: () => void;
}

export function GuildWarMobaBattle({
    battleState,
    onSetStance,
    onUseAbility,
    onManualStrike,
    onReturnToMap,
    partyPower,
    liminalFluid,
    containedEntities = [],
    onSummonEntity,
    onNoclipFlank,
    onAlmondSurge
}: GuildWarMobaBattleProps) {
    const [selectedLane, setSelectedLane] = useState<MobaLane>('mid');
    const [selectedEntity, setSelectedEntity] = useState<'smiler' | 'hound' | 'skin_stealer' | 'partygoer'>('smiler');
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll nos logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
        }
    }, [battleState.warLogs]);

    const totalScore = battleState.alliedScore + battleState.rivalScore || 1;
    const alliedScorePct = Math.min(95, Math.max(5, (battleState.alliedScore / totalScore) * 100));

    // Status da bandeira formatado
    const flagCarrier = battleState.flag.carrierId
        ? battleState.units.find(u => u.id === battleState.flag.carrierId)
        : null;

    const lanes: { id: MobaLane; label: string; icon: string }[] = [
        { id: 'top', label: 'Rota Superior', icon: '⛰️' },
        { id: 'mid', label: 'Rota Central (Altar)', icon: '🏛️' },
        { id: 'bot', label: 'Rota Inferior', icon: '🌲' }
    ];

    const alliedHeroes = battleState.units.filter(u => u.side === 'allied' && u.type === 'hero');

    return (
        <div className="flex-1 flex flex-col bg-gray-950 text-white overflow-hidden select-none relative">
            {/* Top Scoreboard & Flag Tracker */}
            <div className="bg-gray-900/90 border-b border-gray-800 p-3 flex flex-col gap-2 shrink-0 backdrop-blur-md">
                <div className="flex justify-between items-center px-4">
                    {/* Aliados */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-950 border border-green-500/50 flex items-center justify-center text-xl shadow-lg shadow-green-900/30">
                            🛡️
                        </div>
                        <div>
                            <div className="text-xs text-green-400 font-bold uppercase tracking-wider">
                                {battleState.playerGuildName}
                            </div>
                            <div className="text-2xl font-black text-green-300 font-mono">
                                {formatNumber(battleState.alliedScore)}
                            </div>
                        </div>
                    </div>

                    {/* Centro: Território em disputa & Tempo */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-850 px-3 py-1 rounded-full border border-gray-700/50">
                            <Target className="w-3.5 h-3.5 text-orange-400" />
                            <span>{battleState.territoryName}</span>
                            <span className="text-gray-600">|</span>
                            <span>Tempo: {battleState.tickCount}s</span>
                        </div>

                        {/* Banner da Bandeira Sagrada (CTF) */}
                        <div className="mt-1.5 flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold transition-all shadow-md">
                            {battleState.flag.status === 'neutral' && (
                                <div className="flex items-center gap-1.5 text-yellow-300 bg-yellow-950/40 border-yellow-700/50 px-2 py-0.5 rounded">
                                    <Flag className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
                                    <span>Bandeira Sagrada no Centro do Mid — Capture-a!</span>
                                </div>
                            )}
                            {battleState.flag.status === 'carried' && flagCarrier && (
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${flagCarrier.side === 'allied'
                                    ? 'bg-green-950/60 border-green-600 text-green-300 animate-pulse'
                                    : 'bg-red-950/60 border-red-600 text-red-300 animate-pulse'
                                    }`}>
                                    <Flag className="w-3.5 h-3.5" />
                                    <span>
                                        {flagCarrier.avatar} {flagCarrier.name} ({flagCarrier.side === 'allied' ? 'Aliado' : 'Rival'}) levando à base ({flagCarrier.position.toFixed(0)}%)!
                                    </span>
                                </div>
                            )}
                            {battleState.flag.status === 'dropped' && (
                                <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border-amber-600/60 px-2 py-0.5 rounded animate-pulse">
                                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Bandeira Caída no {battleState.flag.lane.toUpperCase()} ({battleState.flag.position.toFixed(0)}%)! Resgate rápido!</span>
                                </div>
                            )}
                            {battleState.flag.status === 'captured' && (
                                <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/60 border-cyan-600/60 px-2 py-0.5 rounded">
                                    <Zap className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                                    <span>Sobrecarga de Éter Ativa! Renascimento em {battleState.flag.respawnCooldown}s</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rivais */}
                    <div className="flex items-center gap-3 text-right">
                        <div>
                            <div className="text-xs text-red-400 font-bold uppercase tracking-wider">
                                {battleState.rivalGuildName}
                            </div>
                            <div className="text-2xl font-black text-red-300 font-mono">
                                {formatNumber(battleState.rivalScore)}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/50 flex items-center justify-center text-xl shadow-lg shadow-red-900/30">
                            💀
                        </div>
                    </div>
                </div>

                {/* Barra de Domínio da Arena */}
                <div className="w-full h-2 bg-red-950/80 rounded-full overflow-hidden border border-gray-800">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-300 transition-all duration-300 rounded-full"
                        style={{ width: `${alliedScorePct}%` }}
                    />
                </div>
            </div>

            {/* Main Arena: 3 Rotas do MOBA + CTF */}
            <div className="flex-1 flex overflow-hidden">
                {/* Visualizador do Campo de Batalha */}
                <div className="flex-1 flex flex-col justify-around p-4 gap-4 bg-gradient-to-b from-gray-950 via-gray-900/90 to-gray-950 overflow-y-auto">
                    {lanes.map(lane => {
                        const laneUnits = battleState.units.filter(u => !u.isDead && u.lane === lane.id);
                        const laneTowers = battleState.towers.filter(t => t.lane === lane.id || (t.isNexus && lane.id === 'mid'));
                        const isSelectedLane = selectedLane === lane.id;

                        const alliedTower = laneTowers.find(t => t.side === 'allied' && !t.isNexus);
                        const rivalTower = laneTowers.find(t => t.side === 'rival' && !t.isNexus);
                        const alliedNexus = lane.id === 'mid' ? laneTowers.find(t => t.side === 'allied' && t.isNexus) : null;
                        const rivalNexus = lane.id === 'mid' ? laneTowers.find(t => t.side === 'rival' && t.isNexus) : null;

                        return (
                            <div
                                key={lane.id}
                                onClick={() => setSelectedLane(lane.id)}
                                className={`relative rounded-xl border p-3.5 transition-all cursor-pointer ${isSelectedLane
                                    ? 'bg-gray-900/90 border-orange-500/70 shadow-lg shadow-orange-950/20'
                                    : 'bg-gray-900/40 border-gray-800/70 hover:border-gray-700'
                                    }`}
                            >
                                {/* Nome da Rota & Indicadores */}
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <div className="flex items-center gap-1.5 font-bold text-gray-300">
                                        <span>{lane.icon}</span>
                                        <span>{lane.label}</span>
                                        {isSelectedLane && (
                                            <span className="text-[10px] bg-orange-600/30 text-orange-400 px-1.5 py-0.5 rounded border border-orange-600/40 font-mono">
                                                Foco Alvo
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono">
                                        Aliados: {laneUnits.filter(u => u.side === 'allied').length} | Rivais: {laneUnits.filter(u => u.side === 'rival').length}
                                    </div>
                                </div>

                                {/* Pista da Rota com Trilhos (0% a 100%) */}
                                <div className="relative h-16 bg-gray-950/80 rounded-lg border border-gray-800 overflow-hidden flex items-center px-6">
                                    {/* Linha de marcha */}
                                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-green-800/40 via-gray-700/40 to-red-800/40" />

                                    {/* Base / Nexus Aliado (apenas no Mid, em pos 0%) */}
                                    {alliedNexus && (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setSelectedTargetId(alliedNexus.id); }}
                                            className="absolute left-1 z-20 flex flex-col items-center"
                                        >
                                            <div className="text-xl">🏛️</div>
                                            <div className="text-[8px] font-bold text-green-400">Altar</div>
                                            <div className="w-10 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{ width: `${(alliedNexus.hp / alliedNexus.maxHp) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Torre Aliada da Rota (pos ~25%) */}
                                    {alliedTower && (
                                        <div
                                            className={`absolute left-[22%] z-20 flex flex-col items-center transition-all ${alliedTower.destroyed ? 'opacity-30' : ''
                                                }`}
                                        >
                                            <div className="text-lg">{alliedTower.destroyed ? '🏚️' : '🏰'}</div>
                                            <div className="text-[8px] font-mono text-green-300">{alliedTower.destroyed ? 'Caída' : `${Math.round((alliedTower.hp / alliedTower.maxHp) * 100)}%`}</div>
                                            {!alliedTower.destroyed && (
                                                <div className="w-8 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{ width: `${(alliedTower.hp / alliedTower.maxHp) * 100}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Altar Central da Bandeira (no Mid, pos 50%) */}
                                    {lane.id === 'mid' && (
                                        <div className="absolute left-[50%] -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                                            <div className="w-8 h-8 rounded-full border border-yellow-500/40 bg-yellow-950/20 flex items-center justify-center animate-pulse">
                                                <span className="text-sm">⚜️</span>
                                            </div>
                                            <div className="text-[7px] text-yellow-400 font-bold uppercase tracking-wider">Altar Central</div>
                                        </div>
                                    )}

                                    {/* Bandeira Caída no chão da rota */}
                                    {battleState.flag.status === 'dropped' && battleState.flag.lane === lane.id && (
                                        <div
                                            className="absolute z-25 -translate-x-1/2 flex flex-col items-center animate-bounce"
                                            style={{ left: `${battleState.flag.position}%` }}
                                        >
                                            <div className="text-base filter drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">🚩</div>
                                            <div className="text-[8px] bg-yellow-900/90 text-yellow-200 px-1 rounded font-bold">No Chão</div>
                                        </div>
                                    )}

                                    {/* Torre Rival da Rota (pos ~75%) */}
                                    {rivalTower && (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setSelectedTargetId(rivalTower.id); }}
                                            className={`absolute left-[75%] z-20 flex flex-col items-center transition-all cursor-pointer ${rivalTower.destroyed ? 'opacity-30' : 'hover:scale-110'
                                                } ${selectedTargetId === rivalTower.id ? 'ring-2 ring-red-500 rounded p-0.5' : ''}`}
                                        >
                                            <div className="text-lg">{rivalTower.destroyed ? '🏚️' : '🏰'}</div>
                                            <div className="text-[8px] font-mono text-red-300">{rivalTower.destroyed ? 'Caída' : `${Math.round((rivalTower.hp / rivalTower.maxHp) * 100)}%`}</div>
                                            {!rivalTower.destroyed && (
                                                <div className="w-8 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-500"
                                                        style={{ width: `${(rivalTower.hp / rivalTower.maxHp) * 100}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Base / Nexus Rival (apenas no Mid, em pos 100%) */}
                                    {rivalNexus && (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setSelectedTargetId(rivalNexus.id); }}
                                            className={`absolute right-1 z-20 flex flex-col items-center cursor-pointer ${selectedTargetId === rivalNexus.id ? 'ring-2 ring-red-500 rounded p-0.5' : ''
                                                }`}
                                        >
                                            <div className="text-xl">🏯</div>
                                            <div className="text-[8px] font-bold text-red-400">Cidadela</div>
                                            <div className="w-10 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500"
                                                    style={{ width: `${(rivalNexus.hp / rivalNexus.maxHp) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Unidades em Movimento / Combate na Rota */}
                                    {laneUnits.map(unit => {
                                        const isAlly = unit.side === 'allied';
                                        const isTarget = selectedTargetId === unit.id;
                                        const hpPct = Math.round((unit.hp / unit.maxHp) * 100);

                                        return (
                                            <div
                                                key={unit.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isAlly) setSelectedTargetId(unit.id);
                                                }}
                                                className={`absolute -translate-x-1/2 z-30 flex flex-col items-center transition-all duration-300 ${!isAlly ? 'cursor-pointer hover:scale-125' : ''
                                                    } ${isTarget ? 'scale-125 ring-2 ring-yellow-400 rounded-full' : ''}`}
                                                style={{ left: `${unit.position}%` }}
                                            >
                                                {/* Indicador de Bandeira no Portador */}
                                                {unit.isCarrier && (
                                                    <div className="absolute -top-4 text-xs animate-bounce filter drop-shadow-[0_0_6px_rgba(234,179,8,1)]">
                                                        🚩
                                                    </div>
                                                )}

                                                {/* Mini Barra de Vida */}
                                                <div className="w-6 h-1 bg-gray-800 rounded-full overflow-hidden mb-0.5">
                                                    <div
                                                        className={`h-full ${isAlly ? (unit.type === 'liminal_entity' ? 'bg-purple-400' : 'bg-green-400') : 'bg-red-400'}`}
                                                        style={{ width: `${hpPct}%` }}
                                                    />
                                                </div>

                                                {/* Avatar com Borda Colorida */}
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border ${
                                                        unit.type === 'liminal_entity'
                                                            ? 'bg-purple-950/90 border-purple-400 text-purple-200 ring-2 ring-purple-500/50 animate-pulse'
                                                            : isAlly
                                                                ? 'bg-green-950/80 border-green-400 text-white'
                                                                : 'bg-red-950/80 border-red-500 text-white'
                                                        } ${unit.isCarrier ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
                                                    title={`${unit.name} (${hpPct}% HP)`}
                                                >
                                                    {unit.avatar}
                                                </div>

                                                {/* Indicador de Túnel Noclip */}
                                                {(unit.noclipTimer || 0) > 0 && (
                                                    <div className="absolute -bottom-3 px-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-500 text-[7px] font-mono whitespace-nowrap animate-pulse">
                                                        🌀 Noclip {Math.ceil(unit.noclipTimer || 0)}s
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Painel Lateral: Heróis da Guilda, Habilidades & Logs */}
                <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0">
                    {/* Lista dos Heróis da Party em Tempo Real */}
                    <div className="p-3 border-b border-gray-800">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-green-400" /> Heróis da Sua Guilda
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {alliedHeroes.map(hero => {
                                const hpPct = Math.round((hero.hp / hero.maxHp) * 100);
                                return (
                                    <div
                                        key={hero.id}
                                        className="bg-gray-950/60 border border-gray-800/80 rounded-lg p-1.5 flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{hero.avatar}</span>
                                            <div>
                                                <div className="font-bold text-gray-200 text-[11px] flex items-center gap-1">
                                                    <span>{hero.name}</span>
                                                    {hero.isCarrier && <span className="text-[10px]">🚩</span>}
                                                </div>
                                                <div className="text-[9px] text-gray-500 font-mono">
                                                    Rota {hero.lane.toUpperCase()} • ⚔️ {hero.attack}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {hero.isDead ? (
                                                <span className="text-[10px] text-red-400 font-mono font-bold">
                                                    💀 {hero.respawnTimer}s
                                                </span>
                                            ) : (
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-mono text-green-400">{hpPct}%</span>
                                                    <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500"
                                                            style={{ width: `${hpPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Posturas Táticas */}
                    <div className="p-3 border-b border-gray-800">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-orange-400" /> Comando Tático
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            {[
                                { id: 'push' as const, label: 'Avançar', icon: '⚔️' },
                                { id: 'flag' as const, label: 'Bandeira', icon: '🚩' },
                                { id: 'defend' as const, label: 'Defender', icon: '🛡️' }
                            ].map(stance => (
                                <button
                                    key={stance.id}
                                    onClick={() => onSetStance(stance.id)}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${battleState.activeStance === stance.id
                                        ? 'bg-orange-700 text-white border-orange-500 shadow-md shadow-orange-950/40'
                                        : 'bg-gray-850 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="text-sm">{stance.icon}</span>
                                    <span className="text-[10px]">{stance.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Habilidades do Comandante & Ataque Manual */}
                    <div className="p-3 border-b border-gray-800 space-y-2">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-400" /> Habilidades</span>
                            <span className="text-[10px] text-yellow-500 font-mono">Golpes: {battleState.playerStrikesLeft}/3</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            {/* Bombardeio */}
                            <button
                                onClick={() => onUseAbility('tactical_bombard', { targetLane: selectedLane })}
                                disabled={battleState.abilities.tactical_bombard.cooldown > 0}
                                className={`p-1.5 rounded-lg border text-left flex flex-col items-center justify-center transition-all ${battleState.abilities.tactical_bombard.cooldown === 0
                                    ? 'bg-red-950/60 border-red-600 hover:bg-red-900/80 text-red-200 shadow-md shadow-red-950/30'
                                    : 'bg-gray-850 border-gray-800 text-gray-600 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <span className="text-base">☄️</span>
                                <span className="text-[9px] font-bold">Bombardeio</span>
                                <span className="text-[8px] font-mono text-gray-400">
                                    {battleState.abilities.tactical_bombard.cooldown === 0 ? 'Pronto' : `${battleState.abilities.tactical_bombard.cooldown}s`}
                                </span>
                            </button>

                            {/* Grito de Guerra */}
                            <button
                                onClick={() => onUseAbility('battle_cry')}
                                disabled={battleState.abilities.battle_cry.cooldown > 0}
                                className={`p-1.5 rounded-lg border text-left flex flex-col items-center justify-center transition-all ${battleState.abilities.battle_cry.cooldown === 0
                                    ? 'bg-amber-950/60 border-amber-600 hover:bg-amber-900/80 text-amber-200 shadow-md shadow-amber-950/30'
                                    : 'bg-gray-850 border-gray-800 text-gray-600 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <span className="text-base">⚡</span>
                                <span className="text-[9px] font-bold">Grito Guerra</span>
                                <span className="text-[8px] font-mono text-gray-400">
                                    {battleState.abilities.battle_cry.cooldown === 0 ? 'Pronto' : `${battleState.abilities.battle_cry.cooldown}s`}
                                </span>
                            </button>

                            {/* Cura */}
                            <button
                                onClick={() => onUseAbility('emergency_heal')}
                                disabled={battleState.abilities.emergency_heal.cooldown > 0}
                                className={`p-1.5 rounded-lg border text-left flex flex-col items-center justify-center transition-all ${battleState.abilities.emergency_heal.cooldown === 0
                                    ? 'bg-emerald-950/60 border-emerald-600 hover:bg-emerald-900/80 text-emerald-200 shadow-md shadow-emerald-950/30'
                                    : 'bg-gray-850 border-gray-800 text-gray-600 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <span className="text-base">💚</span>
                                <span className="text-[9px] font-bold">Cura Total</span>
                                <span className="text-[8px] font-mono text-gray-400">
                                    {battleState.abilities.emergency_heal.cooldown === 0 ? 'Pronto' : `${battleState.abilities.emergency_heal.cooldown}s`}
                                </span>
                            </button>
                        </div>

                        {/* Armas Liminares das Backrooms (M.E.G.) */}
                        <div className="pt-2 border-t border-gray-800 space-y-1.5">
                            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1">🧬 Armas Liminares M.E.G.</span>
                                {liminalFluid !== undefined && (
                                    <span className="text-[9px] text-cyan-300 font-mono">🧪 {liminalFluid} Fluidos</span>
                                )}
                            </div>

                            {/* Seletor Rápido de Entidade */}
                            <div className="grid grid-cols-4 gap-1">
                                {[
                                    { id: 'smiler' as const, name: 'Smiler', icon: '😈', title: 'Cega torres da rota' },
                                    { id: 'hound' as const, name: 'Hound', icon: '🐕', title: 'Caça o portador da bandeira' },
                                    { id: 'skin_stealer' as const, name: 'Stealer', icon: '👤', title: 'Avanço invisível até o Nexus' },
                                    { id: 'partygoer' as const, name: 'Party', icon: '🎈', title: 'Caos e bônus de score' }
                                ].map(ent => (
                                    <button
                                        key={ent.id}
                                        type="button"
                                        onClick={() => setSelectedEntity(ent.id)}
                                        className={`py-1 px-1 rounded border text-center transition-all ${selectedEntity === ent.id
                                            ? 'bg-purple-900 text-white border-purple-400 shadow-md'
                                            : 'bg-gray-850 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                                            }`}
                                        title={ent.title}
                                    >
                                        <div className="text-sm">{ent.icon}</div>
                                        <div className="text-[8px] font-bold truncate">{ent.name}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                                {/* Botão Invocar Entidade */}
                                <button
                                    type="button"
                                    data-testid="moba-summon-entity-btn"
                                    onClick={() => {
                                        if (onSummonEntity) onSummonEntity(selectedEntity, selectedLane);
                                        else onUseAbility('summon_entity', { targetLane: selectedLane, entityId: selectedEntity } as any);
                                    }}
                                    disabled={(battleState.abilities.summon_entity?.cooldown || 0) > 0 || (liminalFluid !== undefined && liminalFluid < 2)}
                                    className={`p-1.5 rounded-lg border text-left flex flex-col items-center justify-center transition-all ${(battleState.abilities.summon_entity?.cooldown || 0) === 0 && (liminalFluid === undefined || liminalFluid >= 2)
                                        ? 'bg-purple-950/80 border-purple-500 hover:bg-purple-900 text-purple-200 shadow-md'
                                        : 'bg-gray-850 border-gray-800 text-gray-600 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    <span className="text-base">🧬</span>
                                    <span className="text-[9px] font-bold">Invocar</span>
                                    <span className="text-[8px] font-mono text-gray-400">
                                        {(battleState.abilities.summon_entity?.cooldown || 0) === 0 ? 'Pronto' : `${Math.ceil(battleState.abilities.summon_entity?.cooldown || 0)}s`}
                                    </span>
                                </button>

                                {/* Botão Flanco Noclip */}
                                <button
                                    type="button"
                                    data-testid="moba-noclip-flank-btn"
                                    onClick={() => {
                                        if (onNoclipFlank) onNoclipFlank(selectedLane);
                                        else onUseAbility('noclip_flank', { targetLane: selectedLane } as any);
                                    }}
                                    disabled={(battleState.abilities.noclip_flank?.cooldown || 0) > 0}
                                    className={`p-1.5 rounded-lg border text-left flex flex-col items-center justify-center transition-all ${(battleState.abilities.noclip_flank?.cooldown || 0) === 0
                                        ? 'bg-indigo-950/80 border-indigo-500 hover:bg-indigo-900 text-indigo-200 shadow-md'
                                        : 'bg-gray-850 border-gray-800 text-gray-600 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    <span className="text-base">🚪</span>
                                    <span className="text-[9px] font-bold">Túnel Noclip</span>
                                    <span className="text-[8px] font-mono text-gray-400">
                                        {(battleState.abilities.noclip_flank?.cooldown || 0) === 0 ? 'Pronto' : `${Math.ceil(battleState.abilities.noclip_flank?.cooldown || 0)}s`}
                                    </span>
                                </button>

                                {/* Botão Cura Liminar */}
                                <button
                                    type="button"
                                    data-testid="moba-almond-surge-btn"
                                    onClick={() => {
                                        if (onAlmondSurge) onAlmondSurge();
                                        else onUseAbility('almond_curative_surge');
                                    }}
                                    disabled={(battleState.abilities.almond_curative_surge?.cooldown || 0) > 0}
                                    className={`p-1.5 rounded-lg border text-left flex flex-col items-center justify-center transition-all ${(battleState.abilities.almond_curative_surge?.cooldown || 0) === 0
                                        ? 'bg-cyan-950/80 border-cyan-500 hover:bg-cyan-900 text-cyan-200 shadow-md'
                                        : 'bg-gray-850 border-gray-800 text-gray-600 cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    <span className="text-base">🥛</span>
                                    <span className="text-[9px] font-bold">Cura Amêndoa</span>
                                    <span className="text-[8px] font-mono text-gray-400">
                                        {(battleState.abilities.almond_curative_surge?.cooldown || 0) === 0 ? 'Pronto' : `${Math.ceil(battleState.abilities.almond_curative_surge?.cooldown || 0)}s`}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Botão de Ataque Manual */}
                        <button
                            onClick={() => {
                                const targetId = selectedTargetId || 'rival-tower-' + selectedLane;
                                onManualStrike(targetId);
                            }}
                            disabled={battleState.playerStrikesLeft <= 0}
                            className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${battleState.playerStrikesLeft > 0
                                ? 'bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500 text-white shadow-md shadow-red-950/40 hover:scale-[1.02]'
                                : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                                }`}
                        >
                            <Sword className="w-3.5 h-3.5" />
                            <span>Golpe Manual do Jogador (⚔️ {formatNumber(partyPower * 0.85)})</span>
                        </button>
                    </div>

                    {/* War Logs em Tempo Real */}
                    <div className="flex-1 flex flex-col p-3 overflow-hidden">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-blue-400" /> Relatório de Batalha
                        </div>
                        <div
                            ref={logContainerRef}
                            className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]"
                        >
                            {battleState.warLogs.map(log => {
                                const colorClass = log.type === 'achievement'
                                    ? 'text-yellow-300 bg-yellow-950/30 border-yellow-800/40'
                                    : log.type === 'success'
                                        ? 'text-emerald-300 bg-emerald-950/30 border-emerald-800/40'
                                        : log.type === 'danger'
                                            ? 'text-red-300 bg-red-950/30 border-red-800/40'
                                            : 'text-gray-400 bg-gray-950/40 border-gray-800/50';

                                return (
                                    <div
                                        key={log.id}
                                        className={`p-1.5 rounded border text-[10px] leading-relaxed ${colorClass}`}
                                    >
                                        {log.message}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Overlay de Fim de Batalha (Vitória ou Derrota) */}
            {!battleState.battleActive && battleState.winner && (
                <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
                    <div className="bg-gray-900 border-2 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-orange-600/70">
                        {battleState.winner === 'allied' ? (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-green-950 border border-green-500/50 flex items-center justify-center text-4xl mx-auto shadow-xl shadow-green-900/40 animate-bounce">
                                    🏆
                                </div>
                                <h3 className="text-2xl font-black text-green-400 tracking-wide">
                                    VITÓRIA GLORIOSA!
                                </h3>
                                <p className="text-sm text-gray-300">
                                    Sua guilda triunfou no campo de batalha! O território{' '}
                                    <span className="font-bold text-yellow-400">{battleState.territoryName}</span> foi conquistado e incorporado ao seu império!
                                </p>
                                <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 flex justify-around text-xs font-mono">
                                    <div>
                                        <div className="text-gray-400">Placar Final</div>
                                        <div className="text-green-400 font-bold text-base">
                                            {battleState.alliedScore} vs {battleState.rivalScore}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Dificuldade</div>
                                        <div className="text-yellow-400 font-bold text-base">
                                            {formatNumber(battleState.territoryDifficulty)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-500/50 flex items-center justify-center text-4xl mx-auto shadow-xl shadow-red-900/40">
                                    💀
                                </div>
                                <h3 className="text-2xl font-black text-red-400 tracking-wide">
                                    DERROTA NO CONFRONTO
                                </h3>
                                <p className="text-sm text-gray-300">
                                    A <span className="font-bold text-red-400">{battleState.rivalGuildName}</span> defendeu suas posições com sucesso. Reorganize seus heróis e tente novamente!
                                </p>
                            </>
                        )}

                        <button
                            onClick={onReturnToMap}
                            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl font-bold text-white shadow-lg shadow-orange-950/50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
                        >
                            <Award className="w-4 h-4" /> Retornar ao Mapa de Conquista
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
