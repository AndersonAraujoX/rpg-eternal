import React from 'react';
import { TUTORIAL_STEPS } from '../data/npcTutorial';
import { MessageSquare, Award, Terminal, CheckCircle2 } from 'lucide-react';

interface NpcInstructorWidgetProps {
    currentTutorialIndex: number;
}

export const NpcInstructorWidget: React.FC<NpcInstructorWidgetProps> = ({ currentTutorialIndex }) => {
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
                    <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500 text-emerald-400">
                        <CheckCircle2 size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            ✔ DIRETRIZ M.E.G. CONCLUÍDA
                        </h4>
                        <p className="text-[10px] text-amber-500/80 leading-relaxed mt-1">
                            Todas as tarefas de transição e estabelecimento do terminal foram concluídas com sucesso. O setor está estabilizado e sob controle da sua guilda. Continue coletando sucatas e explorando andares mais profundos.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentStep) return null;

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
                <div className="flex items-center gap-2 border-b border-amber-800/25 pb-1.5">
                    <div className="p-1 rounded bg-amber-250 border border-amber-700 text-amber-805">
                        <Terminal size={14} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                        💬 {currentStep.npcName}
                    </span>
                </div>

                {/* Dialogue Area */}
                <div className="text-[11px] leading-relaxed text-amber-900 italic font-medium bg-amber-200/50 p-2.5 rounded border border-amber-700/10">
                    "{currentStep.dialogue}"
                </div>

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
