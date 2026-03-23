import React, { useState } from 'react';
import { Home, Hammer, Info, Lock, ArrowLeft } from 'lucide-react';
import type { Building } from '../../engine/types';
import { formatNumber } from '../../utils';

interface TownModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildings: Building[];
    gold: number;
    upgradeBuilding: (id: string) => void;
    tower?: import('../../engine/types').Tower;
    openIndustry?: () => void;
    openForge?: () => void;
    openFishing?: () => void;
    openAlchemy?: () => void;
    openExpeditions?: () => void;
    openGarden?: () => void;
}

export const TownModal: React.FC<TownModalProps> = ({ isOpen, onClose, buildings, gold, upgradeBuilding, tower, openIndustry, openForge, openFishing, openAlchemy, openExpeditions, openGarden }) => {
    const [viewMode, setViewMode] = useState<'overview' | 'construction'>('overview');

    if (!isOpen) return null;

    const visibleBuildings = buildings.filter(b => {
        if (b.id === 'celestial_observatory') {
            return (tower?.maxFloor || 0) >= 100;
        }
        if (b.id === 'industry') {
            return (tower?.maxFloor || 0) >= 50;
        }
        return true;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-500">
            <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-black border-2 border-amber-600/30 w-full max-w-5xl p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative max-h-[90vh] flex flex-col overflow-hidden">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 blur-[80px] -z-10" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-stone-500 hover:text-white hover:rotate-90 transition-all duration-300 z-20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Section */}
                <div className="text-center mb-10 relative">
                    {viewMode === 'construction' && (
                        <button
                            onClick={() => setViewMode('overview')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors"
                        >
                            <ArrowLeft size={20} /> Voltar
                        </button>
                    )}
                    <h2 className="text-amber-500 text-4xl font-black tracking-tighter mb-2 flex items-center justify-center gap-4">
                        <Home size={36} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                        {viewMode === 'overview' ? 'PREFEITURA' : 'MODO CONSTRUÇÃO'}
                    </h2>
                    <p className="text-stone-400 text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                        <Info size={14} /> Expanda seu domínio para desbloquear novas fronteiras
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="bg-stone-950/80 px-6 py-2 rounded-full border border-amber-900/50 text-amber-100 flex items-center gap-3">
                            <span className="text-xs text-stone-500">Tesouro:</span>
                            <span className="font-mono font-bold text-amber-500">{formatNumber(gold)} Ouro</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {viewMode === 'overview' ? (
                    <div className="flex-1 flex items-center justify-center">
                        {(() => {
                            const townHall = buildings.find(b => b.id === 'town_hall');
                            if (!townHall) return null;
                            const isMax = townHall.level >= townHall.maxLevel;
                            const canAfford = gold >= townHall.cost;

                            return (
                                <div className="max-w-md w-full relative group flex flex-col bg-stone-900/80 border-2 border-amber-600/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                    <div className="flex flex-col items-center text-center mb-8">
                                        <div className="text-7xl p-6 rounded-2xl shadow-2xl border bg-amber-900/40 border-amber-500/50 mb-6 relative">
                                            {townHall.emoji}
                                            {townHall.level > 0 && (
                                                <div className="absolute -bottom-3 -right-3 bg-amber-500 text-black text-sm font-black px-3 py-1 rounded-full border-2 border-stone-900">
                                                    LVL {townHall.level}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-2">{townHall.name}</h3>
                                        <p className="text-stone-400 text-sm leading-relaxed max-w-sm">{townHall.description}</p>
                                    </div>

                                    <div className="space-y-4">
                                        {townHall.level > 0 ? (
                                            <>
                                                <div className="bg-black/60 rounded-xl p-4 border border-white/5 flex justify-between items-center text-sm">
                                                    <span className="text-stone-400">Bônus de Ouro</span>
                                                    <span className="text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-lg">
                                                        +{(townHall.effectValue * townHall.level * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setViewMode('construction')}
                                                    className="w-full py-5 rounded-xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/50 transition-all active:scale-95"
                                                >
                                                    <Hammer size={24} /> Gerenciar Cidade
                                                </button>
                                                {!isMax && (
                                                    <button
                                                        onClick={() => upgradeBuilding(townHall.id)}
                                                        disabled={!canAfford}
                                                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-md
                                                            ${canAfford
                                                                ? 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-900/50'
                                                                : 'bg-stone-900 text-stone-600 cursor-not-allowed border border-stone-800'
                                                            }`}
                                                    >
                                                        Melhorar ({formatNumber(townHall.cost)})
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => upgradeBuilding(townHall.id)}
                                                disabled={!canAfford}
                                                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xl flex items-center justify-center gap-4 transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)]
                                                    ${canAfford
                                                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-900 shadow-amber-900/50 scale-105 hover:scale-[1.07]'
                                                        : 'bg-stone-900/80 text-stone-600 cursor-not-allowed border border-stone-800'
                                                    }`}
                                            >
                                                <Hammer size={28} className={canAfford ? 'animate-bounce' : ''} />
                                                CONSTRUIR ({formatNumber(townHall.cost)})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                            {visibleBuildings.filter(b => b.id !== 'town_hall').map(building => {
                                const isMax = building.level >= building.maxLevel;
                                const canAfford = gold >= building.cost;
                                const isSpecial = building.id === 'guild_hall';

                                return (
                                    <div
                                        key={building.id}
                                        className={`relative group flex flex-col bg-stone-900/40 border rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] 
                                        ${isSpecial && building.level === 0 ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-stone-800 hover:border-amber-600/50 shadow-xl'}`}
                                    >
                                        {/* Building Header */}
                                        <div className="flex gap-5 items-start mb-6">
                                            <div className={`text-5xl p-4 rounded-xl shadow-2xl border ${isSpecial && building.level === 0 ? 'bg-amber-900/40 border-amber-500/50 animate-pulse' : 'bg-stone-800 border-stone-700'}`}>
                                                {building.emoji}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{building.name}</h3>
                                                    <span className="text-[10px] bg-stone-950 px-2 py-1 rounded-full border border-stone-800 text-stone-400 font-mono">
                                                        LVL {building.level} / {building.maxLevel}
                                                    </span>
                                                </div>
                                                <p className="text-stone-400 text-sm leading-relaxed">{building.description}</p>
                                            </div>
                                        </div>

                                        {/* Stats Panel */}
                                        <div className="mt-auto">
                                            <div className="bg-black/40 rounded-xl p-4 mb-5 border border-white/5 space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-stone-500">Efeito atual</span>
                                                    <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">
                                                        {building.level > 0 ? (building.effectValue * building.level).toLocaleString() : '---'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-amber-500 h-full transition-all duration-1000"
                                                        style={{ width: `${(building.level / building.maxLevel) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-stone-500 italic mt-1 flex justify-between">
                                                    <span>{building.bonus}</span>
                                                    {isSpecial && building.level === 0 && <span className="text-amber-400 animate-pulse flex items-center gap-1 font-bold uppercase"><Lock size={10} /> Desbloqueio Crítico</span>}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {building.id === 'industry' && building.level > 0 && openIndustry && (
                                                <button onClick={openIndustry} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/50">
                                                    ACESSAR INDÚSTRIA
                                                </button>
                                            )}
                                            {building.id === 'forge_workshop' && building.level > 0 && openForge && (
                                                <button onClick={openForge} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-900/50">
                                                    <Hammer size={18} /> ACESSAR FORJA
                                                </button>
                                            )}
                                            {building.id === 'fishing_dock' && building.level > 0 && openFishing && (
                                                <button onClick={openFishing} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-cyan-900/50">
                                                    ACESSAR PESCA
                                                </button>
                                            )}
                                            {building.id === 'alchemy_lab' && building.level > 0 && openAlchemy && (
                                                <button onClick={openAlchemy} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-purple-900/50">
                                                    ACESSAR ALQUIMIA
                                                </button>
                                            )}
                                            {building.id === 'expedition_post' && building.level > 0 && openExpeditions && (
                                                <button onClick={openExpeditions} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/50">
                                                    ACESSAR EXPEDIÇÕES
                                                </button>
                                            )}
                                            {building.id === 'mystic_garden' && building.level > 0 && openGarden && (
                                                <button onClick={openGarden} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-900/50">
                                                    ACESSAR JARDIM
                                                </button>
                                            )}
                                            <button
                                                onClick={() => upgradeBuilding(building.id)}
                                                disabled={isMax || !canAfford}
                                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl
                                                ${isMax
                                                        ? 'bg-stone-800 text-stone-500 cursor-default border border-stone-700'
                                                        : canAfford
                                                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/20 active:scale-95'
                                                            : 'bg-stone-900/50 text-stone-600 cursor-not-allowed border border-stone-800'
                                                    }`}
                                            >
                                                {isMax ? (
                                                    <>MÁXIMO ALCANÇADO</>
                                                ) : (
                                                    <>
                                                        <Hammer size={18} className={canAfford ? 'animate-bounce' : ''} />
                                                        {building.level === 0 ? 'CONSTRUIR' : 'MELHORAR'} ({formatNumber(building.cost)})
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer Section */}
                <div className="mt-4 pt-4 border-t border-stone-800/50 text-center">
                    <div className="inline-flex items-center gap-2 text-stone-500 text-xs bg-stone-900/50 px-4 py-2 rounded-full border border-stone-800">
                        <Info size={12} className="text-amber-600" />
                        Cada melhoria é permanente e afeta todos os heróis da guilda.
                    </div>
                </div>
            </div>
        </div>
    );
};
