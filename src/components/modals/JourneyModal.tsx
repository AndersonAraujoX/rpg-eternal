import React from 'react';
import { X, Lock, CheckCircle2, Trophy, Sparkles, Map } from 'lucide-react';
import { FEATURES_LIST, type GameStateForUnlocks } from '../../engine/features';

interface JourneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: GameStateForUnlocks;
}

export const JourneyModal: React.FC<JourneyModalProps> = ({ isOpen, onClose, state }) => {
    if (!isOpen) return null;

    // Calculate overall stats
    const totalFeatures = FEATURES_LIST.length;
    const unlockedFeaturesCount = FEATURES_LIST.filter(f => f.checkUnlocked(state)).length;
    const completionPercentage = Math.floor((unlockedFeaturesCount / totalFeatures) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300">
            <div className="relative bg-slate-950 border-2 border-amber-500/40 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col">
                {/* Glow effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-3">
                        <Map className="text-amber-500 animate-pulse" size={24} />
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-wide uppercase">Jornada de Destino</h2>
                            <p className="text-xs text-slate-400">Linha do tempo e desbloqueio progressivo de mecânicas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Global Progress */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Progresso Geral</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-mono font-black text-amber-400">{unlockedFeaturesCount}/{totalFeatures}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-200 p-1"
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Timeline Grid */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 relative z-10 custom-scrollbar">
                    {/* Vertical line connecting nodes */}
                    <div className="absolute left-[47px] top-8 bottom-8 w-0.5 bg-slate-800 pointer-events-none hidden sm:block" />

                    {FEATURES_LIST.map((feature, index) => {
                        const isUnlocked = feature.checkUnlocked(state);
                        const progress = feature.getProgress(state);

                        return (
                            <div
                                key={feature.id}
                                className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 relative group"
                            >
                                {/* Timeline Indicator */}
                                <div className="flex sm:flex-col items-center z-10">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                        ${isUnlocked
                                            ? 'bg-gradient-to-br from-green-950 to-emerald-900 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-110'
                                            : 'bg-slate-900 border-slate-700 text-slate-500'
                                        }
                                        group-hover:scale-115
                                    `}>
                                        {isUnlocked ? (
                                            <CheckCircle2 size={20} className="text-green-400" />
                                        ) : (
                                            <Lock size={16} className="text-slate-500 animate-pulse" />
                                        )}
                                    </div>
                                    {/* Small badge representing order */}
                                    <span className="text-[10px] mt-1 text-slate-500 font-mono hidden sm:block">#{index + 1}</span>
                                </div>

                                {/* Feature Card */}
                                <div className={`
                                    flex-1 w-full rounded-xl p-5 border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4
                                    ${isUnlocked
                                        ? 'bg-slate-900/40 border-green-950/60 hover:border-green-800 hover:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                                        : 'bg-slate-950/60 border-slate-900 opacity-60 hover:opacity-85'
                                    }
                                `}>
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-2xl">{feature.icon}</span>
                                            <h3 className={`text-lg font-black tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                                                {feature.name}
                                            </h3>
                                            {isUnlocked && (
                                                <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-black tracking-wider uppercase flex items-center gap-1 border border-green-500/20">
                                                    <Sparkles size={8} /> Ativo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Unlock Condition / Progress */}
                                    <div className="flex flex-col items-start md:items-end justify-center min-w-[200px] border-t border-slate-900 pt-3 md:border-t-0 md:pt-0">
                                        {isUnlocked ? (
                                            <div className="text-left md:text-right">
                                                <span className="text-[10px] text-green-400 uppercase tracking-widest font-black">Mecânica Liberada</span>
                                                <div className="text-xs text-slate-500 mt-0.5">Disponível no menu</div>
                                            </div>
                                        ) : (
                                            <div className="w-full text-left md:text-right space-y-1.5">
                                                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-black flex items-center md:justify-end gap-1">
                                                    🔒 {feature.unlockRequirementText}
                                                </span>
                                                {progress.max > 1 && (
                                                    <div className="w-full">
                                                        <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1 md:justify-end md:gap-2">
                                                            <span>Progresso:</span>
                                                            <span className="font-bold text-slate-300">{progress.current} / {progress.max}</span>
                                                        </div>
                                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                                                            <div
                                                                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${progress.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-900 px-8 py-4 bg-slate-950 text-center flex items-center justify-center gap-2 text-xs text-slate-500 relative z-10">
                    <Trophy size={14} className="text-amber-500" />
                    Jogue e avance na Torre ou derrote chefes de níveis superiores para desbloquear todos os reinos e recursos do RPG.
                </div>
            </div>
        </div>
    );
};
