import React, { useState } from 'react';
import { TUTORIAL_STEPS, TUTORIAL_NPC, type TutorialProgressInfo } from '../data/npcTutorial';
import { 
    Sparkles, 
    Lightbulb, 
    ArrowRight, 
    ChevronDown, 
    ChevronUp, 
    CheckCircle2, 
    Compass,
    Coins,
    Wrench,
    Milk,
    Dna
} from 'lucide-react';

export interface NpcTutorialGuideProps {
    currentTutorialIndex: number;
    gameState?: any;
    onOpenModal?: (modal: string) => void;
    className?: string;
    isCompactDefault?: boolean;
}

export const NpcTutorialGuide: React.FC<NpcTutorialGuideProps> = ({
    currentTutorialIndex,
    gameState = {},
    onOpenModal,
    className = '',
    isCompactDefault = false
}) => {
    const [isMinimized, setIsMinimized] = useState<boolean>(isCompactDefault);
    const [showHint, setShowHint] = useState<boolean>(false);

    const isCompleted = currentTutorialIndex >= TUTORIAL_STEPS.length;
    const currentStep = !isCompleted ? TUTORIAL_STEPS[currentTutorialIndex] : null;

    // Progress computation
    const progress: TutorialProgressInfo | null = currentStep && currentStep.calculateProgress
        ? currentStep.calculateProgress(gameState)
        : null;

    if (isCompleted) {
        return (
            <div 
                data-testid="npc-tutorial-completed"
                className={`bg-slate-900/95 border-2 border-emerald-500/80 rounded-lg p-3 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)] relative overflow-hidden font-sans ${className}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(16,185,129,0.5)] flex-shrink-0">
                            {TUTORIAL_NPC.image ? (
                                <img src={TUTORIAL_NPC.image} alt={TUTORIAL_NPC.name} className="w-full h-full object-cover object-top" />
                            ) : (
                                <span>{TUTORIAL_NPC.avatar}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className="text-emerald-400" /> Diretrizes Iniciais Concluídas
                                </h4>
                                <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-600/40 font-bold">
                                    {TUTORIAL_NPC.name}
                                </span>
                            </div>
                            <p className="text-[11px] text-emerald-200/80 mt-0.5">
                                {TUTORIAL_NPC.completedBanner}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-emerald-400/70 hover:text-emerald-200 p-1 transition-colors"
                        title={isMinimized ? 'Expandir' : 'Minimizar'}
                        aria-label="Toggle Minimize"
                    >
                        {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                </div>

                {!isMinimized && (
                    <div className="mt-2.5 pt-2.5 border-t border-emerald-800/40 text-[10px] text-slate-300 flex items-center gap-2">
                        <Sparkles size={12} className="text-emerald-400 animate-pulse flex-shrink-0" />
                        <span>Sua guilda agora domina as ferramentas principais. Continue descendo nas Backrooms e fortalecendo seus heróis!</span>
                    </div>
                )}
            </div>
        );
    }

    if (!currentStep) return null;

    const avatar = currentStep.npcAvatar || TUTORIAL_NPC.avatar;
    const npcImage = currentStep.npcImage || TUTORIAL_NPC.image;
    const npcRole = currentStep.npcRole || TUTORIAL_NPC.title;

    // Compact / Minimized View
    if (isMinimized) {
        return (
            <div 
                data-testid="npc-tutorial-minimized"
                className={`bg-slate-900/90 border border-amber-500/60 rounded-full px-3 py-1.5 flex items-center justify-between gap-3 shadow-lg hover:border-amber-400 transition-all cursor-pointer backdrop-blur-sm ${className}`}
                onClick={() => setIsMinimized(false)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="relative flex-shrink-0">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400 bg-amber-950 flex items-center justify-center">
                            {npcImage ? (
                                <img src={npcImage} alt={TUTORIAL_NPC.name} className="w-full h-full object-cover object-top" />
                            ) : (
                                <span className="text-sm">{avatar}</span>
                            )}
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                    <div className="text-xs truncate">
                        <span className="font-bold text-amber-300 mr-1.5">{TUTORIAL_NPC.name}:</span>
                        <span className="text-stone-300">{currentStep.objectiveDescription}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {progress && (
                        <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50 px-1.5 py-0.5 rounded">
                            {progress.percentage}%
                        </span>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                        className="text-amber-400 hover:text-amber-200 p-0.5"
                        aria-label="Expandir Tutorial"
                    >
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>
        );
    }

    // Full Interactive View
    return (
        <div 
            data-testid="npc-tutorial-guide"
            className={`bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-amber-950/40 border-2 border-amber-500/70 rounded-xl p-3.5 shadow-[0_4px_25px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(217,119,6,0.12)] relative overflow-hidden backdrop-blur-md font-sans ${className}`}
        >
            {/* Top Bar: NPC Header & Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-950/90 border-2 border-amber-400 flex items-center justify-center text-xl shadow-[0_0_14px_rgba(245,158,11,0.45)]">
                            {npcImage ? (
                                <img 
                                    src={npcImage} 
                                    alt={currentStep.npcName} 
                                    className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300" 
                                />
                            ) : (
                                <span>{avatar}</span>
                            )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Online" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-amber-300 tracking-wide uppercase">
                                {currentStep.npcName}
                            </h4>
                            <span className="text-[9px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold border border-amber-500/30">
                                Passo {currentTutorialIndex + 1}/{TUTORIAL_STEPS.length}
                            </span>
                        </div>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Compass size={10} className="text-amber-400" /> {npcRole}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {currentStep.hint && (
                        <button
                            data-testid="toggle-hint-button"
                            onClick={() => setShowHint(!showHint)}
                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all border ${showHint ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'}`}
                            title="Ver Dica da Instrutora"
                        >
                            <Lightbulb size={12} />
                            <span>{showHint ? 'Ocultar Dica' : 'Dica da Guia'}</span>
                        </button>
                    )}
                    <button
                        data-testid="toggle-minimize-button"
                        onClick={() => setIsMinimized(true)}
                        className="p-1 rounded text-stone-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors"
                        title="Minimizar Guia"
                        aria-label="Minimizar Guia"
                    >
                        <ChevronUp size={16} />
                    </button>
                </div>
            </div>

            {/* Speech Bubble / Dialogue */}
            <div className="mt-2.5 bg-slate-900/80 border border-amber-500/30 rounded-lg p-2.5 text-[11px] leading-relaxed text-amber-100/90 relative">
                <div className="italic">
                    "{currentStep.dialogue}"
                </div>
            </div>

            {/* Expandable Hint Box */}
            {showHint && currentStep.hint && (
                <div 
                    data-testid="npc-hint-box"
                    className="mt-2 bg-amber-950/60 border border-amber-500/50 rounded-lg p-2 text-[11px] text-amber-200 flex items-start gap-2 shadow-inner"
                >
                    <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-amber-300 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Dica da Aria:</strong>
                        <span>{currentStep.hint}</span>
                    </div>
                </div>
            )}

            {/* Objective & Progress Section */}
            <div className="mt-2.5 bg-slate-950/70 border border-stone-800 rounded-lg p-2.5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">
                            🎯 Objetivo Atual:
                        </span>
                        <p className="text-xs font-semibold text-white leading-tight">
                            {currentStep.objectiveDescription}
                        </p>
                    </div>

                    {/* Action Shortcut Button */}
                    {currentStep.targetModal && onOpenModal && (
                        <button
                            data-testid="action-shortcut-button"
                            onClick={() => onOpenModal(currentStep.targetModal!)}
                            className="flex-shrink-0 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded shadow-[0_2px_8px_rgba(217,119,6,0.3)] transition-all flex items-center gap-1.5 active:scale-95"
                        >
                            <span>{currentStep.actionLabel || 'Ir até lá'}</span>
                            <ArrowRight size={12} />
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                {progress && (
                    <div className="flex flex-col gap-1 mt-0.5">
                        <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-stone-400 font-medium">{progress.label}</span>
                            <span className="text-amber-400 font-bold">{progress.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-amber-500/20">
                            <div 
                                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Rewards Strip */}
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-500/20">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>Recompensas ao concluir:</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {currentStep.reward.gold && (
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Coins size={11} className="text-amber-400" />
                            {currentStep.reward.gold.toLocaleString()} Ouro
                        </span>
                    )}
                    {currentStep.reward.backroomsScrap && (
                        <span className="bg-stone-800 text-stone-200 border border-stone-600/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Wrench size={11} className="text-stone-300" />
                            {currentStep.reward.backroomsScrap} Sucata
                        </span>
                    )}
                    {currentStep.reward.almondWater && (
                        <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-600/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Milk size={11} className="text-cyan-400" />
                            {currentStep.reward.almondWater} Água
                        </span>
                    )}
                    {currentStep.reward.anomalyParts && (
                        <span className="bg-purple-950/80 text-purple-300 border border-purple-600/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Dna size={11} className="text-purple-400" />
                            {currentStep.reward.anomalyParts} Peças
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
