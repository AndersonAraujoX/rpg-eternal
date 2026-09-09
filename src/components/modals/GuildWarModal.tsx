import { useState } from 'react';
import { X, Sword, Map as MapIcon, Coins, Lock, Flag, Shield, Flame, Sparkles } from 'lucide-react';
import type { Guild, TownEvent, Hero, Territory } from '../../engine/types';
import type { GvGWarState } from '../../engine/guildWar';
import type {
    GuildWarMobaState,
    MobaTacticalStance,
    MobaCommanderAbilities,
    MobaLane
} from '../../engine/guildWarMoba';
import { formatNumber } from '../../utils';
import { GuildWarMap } from './GuildWarMap';
import { GuildWarMobaBattle } from './GuildWarMobaBattle';

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
    patronDeity?: string | null;
    activeEvent?: TownEvent | null;
    // MOBA + CTF Integration
    mobaWarState?: GuildWarMobaState | null;
    onStartMobaWar?: (territoryId: string) => void;
    onSetMobaStance?: (stance: MobaTacticalStance) => void;
    onUseMobaAbility?: (abilityId: keyof MobaCommanderAbilities, options?: { targetLane?: MobaLane }) => void;
    onMobaManualStrike?: (targetId: string) => void;
    activeHeroes?: Hero[];
    // Backrooms & Liminal Expansion Integration
    backroomsResources?: { scrap?: number; almondWater?: number; liminalFluid?: number; voidAlloy?: number };
    containedEntities?: any[];
    onUpgradeTerritoryModule?: (territoryId: string, moduleType: 'radioTower' | 'waterCondenser' | 'guardSoldiers') => void;
    onSummonMobaEntity?: (entityId: any, lane: MobaLane) => void;
    onMobaNoclipFlank?: (lane?: MobaLane) => void;
    onMobaAlmondSurge?: () => void;
}

export function GuildWarModal({
    onClose,
    territories,
    onAttack,
    onUpgrade,
    onAdvanceMap,
    partyPower,
    guild,
    gold,
    industryInventory = {},
    onBombard,
    mobaWarState,
    onStartMobaWar,
    onSetMobaStance,
    onUseMobaAbility,
    onMobaManualStrike,
    activeHeroes = [],
    backroomsResources = {},
    containedEntities = [],
    onUpgradeTerritoryModule,
    onSummonMobaEntity,
    onMobaNoclipFlank,
    onMobaAlmondSurge
}: GuildWarModalProps) {
    const [activeTab, setActiveTab] = useState<'battle' | 'map'>('battle');
    const [selectedTargetTerritoryId, setSelectedTargetTerritoryId] = useState<string>(() => {
        const firstEnemy = territories.find(t => t.owner !== 'player' && t.owner !== 'Ocean');
        return firstEnemy ? firstEnemy.id : (territories[0]?.id || '');
    });

    const isLeader = guild !== null && (guild.totalContribution || 0) >= 10000;

    const capturableTerritories = territories.filter(t => t.owner !== 'Ocean');
    const playerTerritoriesCount = capturableTerritories.filter(t => t.owner === 'player').length;

    const handleAttackTerritory = (territoryId: string) => {
        if (onStartMobaWar) {
            onStartMobaWar(territoryId);
            setActiveTab('battle');
        } else {
            onAttack(territoryId);
        }
    };

    const targetTerritory = territories.find(t => t.id === selectedTargetTerritoryId) || territories[0];

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3">
            <div className="bg-gray-900 border border-orange-700/60 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col relative shadow-2xl overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 bg-gray-800/60 p-1.5 rounded-lg hover:bg-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header with Fused Mode Navigation */}
                <div className="p-4 border-b border-gray-800 shrink-0 bg-gray-950/70">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-950 border border-orange-600/50 flex items-center justify-center text-xl shadow-lg shadow-orange-950/50">
                                ⚔️
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-orange-400 flex items-center gap-2 tracking-wide">
                                    Guerra de Guildas & Conquista Mundial
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Simulação de MOBA e Pega-Bandeira em tempo real pelos territórios do continente
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2.5 mr-10">
                            <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700 text-center">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Poder do Exército</div>
                                <div className="text-base font-bold text-white flex items-center justify-center gap-1">
                                    <Sword className="w-3.5 h-3.5 text-orange-500" />
                                    {formatNumber(partyPower)}
                                </div>
                            </div>
                            <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-yellow-800/50 text-center">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Tesouro da Guilda</div>
                                <div className="text-base font-bold text-yellow-400 flex items-center justify-center gap-1">
                                    <Coins className="w-3.5 h-3.5" />
                                    {formatNumber(gold)}
                                </div>
                            </div>
                            <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-green-800/50 text-center">
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Territórios</div>
                                <div className="text-base font-bold text-green-400 flex items-center justify-center gap-1">
                                    <Flag className="w-3.5 h-3.5" />
                                    {playerTerritoriesCount} / {capturableTerritories.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fused Navigation Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('battle')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${activeTab === 'battle'
                                ? 'bg-gradient-to-r from-red-700 to-orange-600 text-white border-orange-500 shadow-lg shadow-orange-950/40'
                                : 'bg-gray-850 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <Sword className="w-4 h-4" />
                            <span>Arena de Batalha (MOBA & Bandeira)</span>
                            {mobaWarState?.battleActive && (
                                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400" />
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('map')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${activeTab === 'map'
                                ? 'bg-gradient-to-r from-orange-700 to-amber-600 text-white border-amber-500 shadow-lg shadow-amber-950/40'
                                : 'bg-gray-850 text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <MapIcon className="w-4 h-4" />
                            <span>Mapa Estratégico de Territórios</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {!isLeader ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-950">
                        <Lock className="w-16 h-16 text-orange-500/50 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Modo Guerra Bloqueado</h3>
                        <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                            Somente o <span className="text-orange-400 font-bold">Líder da Guilda</span> pode iniciar batalhas MOBA e conquistas de territórios.
                            Contribua com <span className="text-yellow-400 font-bold">10.000 Ouro</span> para assumir a liderança!
                        </p>
                        {guild && (
                            <div className="mt-4 bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs">
                                <span className="text-gray-400">Contribuição atual: </span>
                                <span className="text-yellow-400 font-bold">{formatNumber(guild.totalContribution || 0)} / 10.000 Ouro</span>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'battle' ? (
                    mobaWarState && mobaWarState.battleActive ? (
                        <GuildWarMobaBattle
                            battleState={mobaWarState}
                            onSetStance={(stance) => onSetMobaStance?.(stance)}
                            onUseAbility={(abilityId, options) => onUseMobaAbility?.(abilityId, options)}
                            onManualStrike={(targetId) => onMobaManualStrike?.(targetId)}
                            onReturnToMap={() => setActiveTab('map')}
                            partyPower={partyPower}
                            liminalFluid={backroomsResources.liminalFluid || 0}
                            containedEntities={containedEntities}
                            onSummonEntity={onSummonMobaEntity}
                            onNoclipFlank={onMobaNoclipFlank}
                            onAlmondSurge={onMobaAlmondSurge}
                        />
                    ) : (
                        /* Briefing Room / Standby Screen */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-950 overflow-y-auto">
                            <div className="max-w-2xl w-full bg-gray-900/90 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-orange-950/40">
                                        🚩
                                    </div>
                                    <h3 className="text-2xl font-black text-white">
                                        Arena de Conquista: MOBA & Pega-Bandeira
                                    </h3>
                                    <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                                        Comande seus heróis ativos e companheiros de guilda em uma batalha de 3 rotas.
                                        Capture a Bandeira Sagrada no centro do Mid e destrua as torres da fortaleza inimiga!
                                    </p>
                                </div>

                                {/* Resumo da Party de Heróis */}
                                <div className="bg-gray-950/70 border border-gray-800 rounded-xl p-3.5 space-y-2">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-yellow-400" /> Esquadrão da Guilda Pronto para o Cerco
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {activeHeroes.slice(0, 3).map((hero) => (
                                            <div key={hero.id} className="bg-gray-900 border border-gray-800 rounded-lg p-2 flex items-center gap-2">
                                                <span className="text-xl">{hero.emoji || '⚔️'}</span>
                                                <div className="overflow-hidden">
                                                    <div className="font-bold text-xs text-white truncate">{hero.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">Lv.{hero.level} {hero.class}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Seleção de Território Alvo para Sitiar */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Flame className="w-3.5 h-3.5 text-red-400" /> Selecionar Território para Sitiar:
                                    </label>
                                    <select
                                        value={selectedTargetTerritoryId}
                                        onChange={(e) => setSelectedTargetTerritoryId(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-orange-500 outline-none"
                                    >
                                        {territories.filter(t => t.owner !== 'Ocean').map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.owner === 'player' ? '🏆 [Conquistado] ' : '🏴 [Inimigo] '}
                                                {t.name} (Poder: {formatNumber(t.difficulty)} | Bônus: +{(t.bonus.value * 100).toFixed(0)}% {t.bonus.type.toUpperCase()})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Botão de Ação */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            if (targetTerritory) {
                                                handleAttackTerritory(targetTerritory.id);
                                            }
                                        }}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 hover:from-red-600 hover:to-orange-500 rounded-xl font-bold text-white text-base shadow-xl shadow-red-950/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        <Sword className="w-5 h-5" /> Iniciar Batalha MOBA em {targetTerritory?.name || 'Território'}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('map')}
                                        className="px-5 py-3.5 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl font-bold text-gray-300 text-sm flex items-center gap-2 transition-all hover:text-white"
                                    >
                                        <MapIcon className="w-4 h-4" /> Ver Mapa
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    /* Tactical World Map */
                    <GuildWarMap
                        territories={territories}
                        partyPower={partyPower}
                        gold={gold}
                        industryInventory={industryInventory}
                        onAttack={handleAttackTerritory}
                        onUpgrade={onUpgrade}
                        onAdvanceMap={onAdvanceMap}
                        onBombard={onBombard}
                        backroomsResources={backroomsResources}
                        onUpgradeTerritoryModule={onUpgradeTerritoryModule}
                    />
                )}
            </div>
        </div>
    );
}
