import React, { useState } from 'react';
import { TUTORIAL_STEPS, TUTORIAL_NPC } from '../data/npcTutorial';
import { MessageSquare, Terminal, CheckCircle2, Lightbulb } from 'lucide-react';

interface NpcInstructorWidgetProps {
    currentTutorialIndex: number;
}

export const NpcInstructorWidget: React.FC<NpcInstructorWidgetProps> = ({ currentTutorialIndex }) => {
    const [showHint, setShowHint] = useState<boolean>(false);
    const isCompleted = currentTutorialIndex >= TUTORIAL_STEPS.length;
    const currentStep = !isCompleted ? TUTORIAL_STEPS[currentTutorialIndex] : null;

    if (isCompleted) {
        return (
            <div className="mx-4 mt-4 bg-amber-950/20 border-2 border-emerald-600 rounded p-3.5 relative font-mono overflow-hidden shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                {/* Visual completion banner */}
                <div className="absolute top-0 right-0 bg-emerald-600 text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl">
                    SISTEMA SEGURO
                </div>
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-lg flex-shrink-0">
                        {TUTORIAL_NPC.avatar}
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="animate-pulse" /> DIRETRIZ TUTORIAL CONCLUÍDA
                        </h4>
                        <p className="text-[10px] text-amber-500/80 leading-relaxed mt-1">
                            {TUTORIAL_NPC.completedBanner} Todas as tarefas de transição e estabelecimento do terminal foram concluídas com sucesso. O setor está estabilizado.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentStep) return null;

    const avatar = currentStep.npcAvatar || TUTORIAL_NPC.avatar;
    const npcImage = currentStep.npcImage || TUTORIAL_NPC.image;

    return (
        <div className="mx-4 mt-4 bg-amber-100 text-amber-950 border-4 border-amber-600 rounded-lg p-4 relative font-mono shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_0_15px_rgba(217,119,6,0.15)] overflow-hidden">
            {/* Overlay grid lines for retro-medieval blend */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(217,119,6,0.03)_50%,rgba(0,0,0,0.05)_50%)] bg-[size:100%_4px] opacity-30"></div>
            
            {/* Ancient Seal/Stamp style corner label */}
            <div className="absolute top-0 right-0 bg-amber-600 text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-bl shadow">
                TRANSMISSÃO M.E.G.
            </div>

            <div className="flex flex-col gap-3 relative z-10">
                {/* Header (NPC Identity) */}
                <div className="flex items-center justify-between border-b border-amber-800/25 pb-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-200 border border-amber-700 flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                            {npcImage ? (
                                <img src={npcImage} alt={currentStep.npcName} className="w-full h-full object-cover object-top" />
                            ) : (
                                <span>{avatar}</span>
                            )}
                        </div>
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                                {currentStep.npcName}
                            </span>
                            {currentStep.npcRole && (
                                <span className="text-[9px] text-amber-800 font-bold block">
                                    {currentStep.npcRole}
                                </span>
                            )}
                        </div>
                    </div>

                    {currentStep.hint && (
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="text-[9px] font-bold bg-amber-200 hover:bg-amber-300 text-amber-900 border border-amber-600/40 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                        >
                            <Lightbulb size={11} />
                            <span>{showHint ? 'Ocultar Dica' : 'Ver Dica'}</span>
                        </button>
                    )}
                </div>

                {/* Dialogue Area */}
                <div className="text-[11px] leading-relaxed text-amber-900 italic font-medium bg-amber-200/50 p-2.5 rounded border border-amber-700/10">
                    "{currentStep.dialogue}"
                </div>

                {/* Optional Hint Box */}
                {showHint && currentStep.hint && (
                    <div className="text-[10px] bg-amber-300/40 border border-amber-600/30 p-2 rounded text-amber-950 flex items-start gap-1.5">
                        <Lightbulb size={12} className="text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Dica da Guia:</strong> {currentStep.hint}
                        </div>
                    </div>
                )}

                {/* Highlighted Objective Box */}
                <div className="bg-amber-950 text-amber-400 p-2.5 rounded border-2 border-amber-600 shadow-[inset_0_0_8px_rgba(217,119,6,0.3)]">
                    <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-amber-500">
                        <MessageSquare size={10} /> OBJETIVO ATUAL:
                    </div>
                    <div className="text-xs font-bold mt-1 text-amber-100 leading-tight">
                        {currentStep.objectiveDescription}
                    </div>
                </div>

                {/* Rewards Preview */}
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-amber-800 uppercase">
                    <span>Recompensa:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {currentStep.reward.gold && (
                            <span className="bg-amber-200 px-1.5 py-0.5 rounded border border-amber-600/30 text-amber-900">
                                🪙 {currentStep.reward.gold} Ouro
                            </span>
                        )}
                        {currentStep.reward.backroomsScrap && (
                            <span className="bg-amber-200 px-1.5 py-0.5 rounded border border-amber-600/30 text-amber-900">
                                🔧 {currentStep.reward.backroomsScrap} Sucata
                            </span>
                        )}
                        {currentStep.reward.almondWater && (
                            <span className="bg-amber-200 px-1.5 py-0.5 rounded border border-amber-600/30 text-amber-900">
                                🧴 {currentStep.reward.almondWater} Água de Amêndoa
                            </span>
                        )}
                        {currentStep.reward.anomalyParts && (
                            <span className="bg-amber-200 px-1.5 py-0.5 rounded border border-amber-600/30 text-amber-900">
                                🦠 {currentStep.reward.anomalyParts} Peças
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

