import React, { useState } from 'react';
import { Star, X, Zap, Lock } from 'lucide-react';
import type { ConstellationNode, GameActions } from '../../engine/types';

interface StarChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    constellations: ConstellationNode[];
    divinity: number;
    actions: GameActions;
}

const BONUS_LABELS: Record<ConstellationNode['bonusType'], string> = {
    bossDamage: '⚔️ Dano de Chefe',
    goldDrop: '💰 Ganho de Ouro',
    soulDrop: '👻 Ganho de Almas',
    autoReviveSpeed: '💫 Velocidade de Ressurreição',
};

const BONUS_COLORS: Record<ConstellationNode['bonusType'], string> = {
    bossDamage: 'text-red-400',
    goldDrop: 'text-yellow-400',
    soulDrop: 'text-purple-400',
    autoReviveSpeed: 'text-cyan-400',
};

const STAR_COLORS: Record<ConstellationNode['bonusType'], string> = {
    bossDamage: 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.8)]',
    goldDrop: 'bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.8)]',
    soulDrop: 'bg-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.8)]',
    autoReviveSpeed: 'bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]',
};

export const StarChartModal: React.FC<StarChartModalProps> = ({ isOpen, onClose, divinity, constellations, actions }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (!isOpen) return null;

    const safeConstellations = (constellations && constellations.length > 0)
        ? constellations
        : [
            { id: 'c1', name: 'Órion', description: '+Dano de Chefe', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'bossDamage' as const, valuePerLevel: 0.10, x: 20, y: 50 },
            { id: 'c2', name: 'Lyra', description: '+Drops de Ouro', level: 0, maxLevel: 10, cost: 1, costScaling: 2, bonusType: 'goldDrop' as const, valuePerLevel: 0.20, x: 50, y: 20 },
            { id: 'c3', name: 'Fênix', description: '+Drops de Almas', level: 0, maxLevel: 10, cost: 2, costScaling: 3, bonusType: 'soulDrop' as const, valuePerLevel: 0.10, x: 80, y: 50 },
            { id: 'c4', name: 'Draco', description: 'Vel. de Ressurreição', level: 0, maxLevel: 5, cost: 5, costScaling: 4, bonusType: 'autoReviveSpeed' as const, valuePerLevel: 0.50, x: 50, y: 80 },
        ];

    const hoveredNode = safeConstellations.find(c => c.id === hoveredId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative bg-slate-900 border-2 border-cyan-500/50 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-slate-900/80">
                    <div className="flex items-center gap-3">
                        <Star className="text-cyan-400" size={22} />
                        <h2 className="text-xl font-bold text-white tracking-wide">REINO CELESTIAL</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-cyan-500/30">
                            <Zap size={14} className="text-cyan-400" />
                            <span className="text-white font-bold">{divinity}</span>
                            <span className="text-slate-400 text-sm">Divindade</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Star Map */}
                <div className="relative flex-1 overflow-hidden" style={{ minHeight: '360px' }}>
                    {/* Animated starfield background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#000_100%)]" />
                    <div className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `radial-gradient(1px 1px at 20% 30%, white, transparent),
                                              radial-gradient(1px 1px at 60% 70%, white, transparent),
                                              radial-gradient(1px 1px at 40% 50%, white, transparent),
                                              radial-gradient(1px 1px at 80% 20%, white, transparent),
                                              radial-gradient(1px 1px at 10% 80%, white, transparent),
                                              radial-gradient(1px 1px at 90% 60%, white, transparent),
                                              radial-gradient(1px 1px at 50% 10%, white, transparent),
                                              radial-gradient(1px 1px at 30% 90%, white, transparent),
                                              radial-gradient(1px 1px at 70% 40%, white, transparent)`,
                        }}
                    />

                    {/* SVG connection lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {safeConstellations.slice(0, -1).map((c, i) => {
                            const next = safeConstellations[i + 1];
                            return (
                                <line
                                    key={`line-${c.id}`}
                                    x1={`${c.x}%`} y1={`${c.y}%`}
                                    x2={`${next.x}%`} y2={`${next.y}%`}
                                    stroke={`rgba(34, 211, 238, ${c.level > 0 ? 0.5 : 0.15})`}
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                            );
                        })}
                    </svg>

                    {/* Constellation Nodes */}
                    {safeConstellations.map(c => {
                        const canAfford = divinity >= c.cost;
                        const isMaxed = c.level >= c.maxLevel;
                        const isUnlocked = c.level > 0;

                        return (
                            <div
                                key={c.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                                onMouseEnter={() => setHoveredId(c.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => !isMaxed && actions.buyConstellation(c.id)}
                            >
                                {/* Glow ring when unlocked */}
                                {isUnlocked && (
                                    <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${STAR_COLORS[c.bonusType]}`}
                                        style={{ transform: 'scale(2)' }} />
                                )}

                                {/* Star icon */}
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isMaxed
                                        ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,1)] scale-110'
                                        : isUnlocked
                                            ? `${STAR_COLORS[c.bonusType]} scale-100`
                                            : 'bg-slate-700 border border-slate-500'
                                    }
                                    group-hover:scale-125
                                `}>
                                    {isMaxed ? (
                                        <Star size={16} className="text-yellow-900 fill-yellow-900" />
                                    ) : canAfford && !isMaxed ? (
                                        <Star size={14} className="text-white" />
                                    ) : (
                                        <Lock size={12} className="text-slate-400" />
                                    )}
                                </div>

                                {/* Name + level badge */}
                                <div className="mt-1.5 text-center">
                                    <div className="text-[10px] text-white font-bold whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded text-center">{c.name}</div>
                                    {isUnlocked && (
                                        <div className="text-[9px] text-center text-cyan-300 font-mono">{c.level}/{c.maxLevel}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Hover detail panel */}
                <div className="border-t border-slate-700 px-6 py-4 min-h-[100px] flex items-center justify-between bg-slate-900/90">
                    {hoveredNode ? (
                        <>
                            <div>
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <Star size={16} className="text-cyan-400" />
                                    {hoveredNode.name}
                                </h3>
                                <p className={`text-sm font-bold ${hoveredNode.bonusType ? (BONUS_COLORS[hoveredNode.bonusType] || 'text-white') : 'text-white'}`}>
                                    {hoveredNode.bonusType ? (BONUS_LABELS[hoveredNode.bonusType] || 'Bônus Celestial') : 'Bônus Celestial'}
                                </p>
                                <p className="text-slate-400 text-sm mt-1">
                                    Nível {hoveredNode.level}/{hoveredNode.maxLevel} — Bônus Atual: +{Math.round((hoveredNode.level || 0) * (hoveredNode.valuePerLevel || 0) * 100)}%
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {hoveredNode.level < hoveredNode.maxLevel ? (
                                    <>
                                        <div className={`text-sm font-bold ${divinity >= hoveredNode.cost ? 'text-green-400' : 'text-red-400'}`}>
                                            Custo: {hoveredNode.cost} ⚡ Divindade
                                        </div>
                                        <button
                                            onClick={() => actions.buyConstellation(hoveredNode.id)}
                                            disabled={divinity < hoveredNode.cost}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${divinity >= hoveredNode.cost
                                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 text-white shadow-lg shadow-cyan-500/30'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                }`}
                                        >
                                            Desbloquear
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                                        <Star size={14} className="fill-yellow-400" /> MAXIMIZADA
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="w-full text-center text-slate-500 text-sm italic">
                            Passe o mouse sobre uma estrela para ver os detalhes
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="border-t border-slate-800 px-6 py-3 bg-slate-950 flex flex-wrap gap-4 justify-center">
                    {(Object.entries(BONUS_LABELS) as [ConstellationNode['bonusType'], string][]).map(([type, label]) => (
                        <div key={type} className="flex items-center gap-1.5 text-xs">
                            <div className={`w-2.5 h-2.5 rounded-full ${STAR_COLORS[type]}`} />
                            <span className={BONUS_COLORS[type]}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
