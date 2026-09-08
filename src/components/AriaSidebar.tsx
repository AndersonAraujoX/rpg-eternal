import React, { useState, useEffect, useRef } from 'react';
import { 
    X, 
    Sparkles, 
    Target, 
    Lightbulb, 
    ArrowRight, 
    Compass, 
    CheckCircle2, 
    ChevronRight,
    ExternalLink,
    Wrench,
    Coins,
    Shield,
    Layers,
    Play
} from 'lucide-react';
import ariaGuideImg from '../assets/npc/aria_guide.jpg';
import { generateAriaAdvice, type NextStepSummary, type TacticalAction } from '../engine/ariaAdvisor';

export interface AriaSidebarProps {
    currentTutorialIndex: number;
    gameState?: any;
    onOpenModal?: (modal: string) => void;
    isOpen?: boolean;
    onToggle?: (open: boolean) => void;
    className?: string;
}

export const AriaSidebar: React.FC<AriaSidebarProps> = ({
    currentTutorialIndex,
    gameState = {},
    onOpenModal,
    isOpen: controlledIsOpen,
    onToggle,
    className = ''
}) => {
    // Permite uso como componente controlado ou não-controlado
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

    const [imgError, setImgError] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    const setOpenState = (open: boolean) => {
        if (onToggle) {
            onToggle(open);
        } else {
            setInternalOpen(open);
        }
    };

    // Gera os conselhos e próximos passos em tempo real
    const advice: NextStepSummary = generateAriaAdvice(gameState, currentTutorialIndex);

    // Fechar ao pressionar tecla Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setOpenState(false);
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleActionClick = (targetModal?: string) => {
        if (targetModal && onOpenModal) {
            onOpenModal(targetModal);
        }
        setOpenState(false);
    };

    // Formatação amigável da fase de progressão
    const stageLabels: Record<string, { label: string; color: string }> = {
        early: { label: 'Início: Subida da Torre', color: 'bg-amber-900/80 text-amber-200 border-amber-600' },
        mid: { label: 'Vila & Dimensões', color: 'bg-emerald-900/80 text-emerald-200 border-emerald-600' },
        advanced: { label: 'Indústria & Tecnologia', color: 'bg-indigo-900/80 text-indigo-200 border-indigo-600' },
        endgame: { label: 'Conquista Cósmica', color: 'bg-purple-900/80 text-purple-200 border-purple-600' }
    };
    const currentStage = stageLabels[advice.progressionStage] || stageLabels.early;

    return (
        <aside aria-label="Guia Aria Próximos Passos" className={`aria-sidebar-root ${className}`}>
            {/* GATILHO LATERAL FLUTUANTE (FIXED NA LATERAL DIREITA DA TELA) */}
            <div 
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center select-none"
                data-testid="aria-sidebar-trigger-container"
            >
                <button
                    type="button"
                    onClick={() => setOpenState(true)}
                    data-testid="aria-sidebar-trigger"
                    aria-expanded={isOpen}
                    aria-label="Abrir Próximos Passos com Aria"
                    className="group flex items-center gap-2.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 border-2 border-r-0 border-amber-500/70 hover:border-amber-400 pl-3 pr-2.5 py-2.5 rounded-l-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all duration-300 transform hover:-translate-x-1"
                >
                    {/* AVATAR COM ANEL PULSANTE */}
                    <div className="relative w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border-2 border-amber-400 shadow-md">
                        {!imgError ? (
                            <img 
                                src={ariaGuideImg} 
                                alt="Aria" 
                                onError={() => setImgError(true)} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full bg-amber-700 flex items-center justify-center text-sm">
                                🧝‍♀️
                            </div>
                        )}
                        <span className="absolute inset-0 rounded-full border border-amber-300 animate-ping opacity-30 pointer-events-none" />
                    </div>

                    {/* TEXTO DO GATILHO */}
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] font-black tracking-wider uppercase text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                            Aria
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        </span>
                        <span className="text-[9px] text-stone-400 font-semibold whitespace-nowrap">
                            Próximos Passos
                        </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-amber-400/80 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* BACKDROP OVERLAY PARA LIGHT DISMISS */}
            {isOpen && (
                <div
                    data-testid="aria-sidebar-backdrop"
                    onClick={() => setOpenState(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
                    aria-hidden="true"
                />
            )}

            {/* DRAWER LATERAL RETRÁTIL */}
            <div
                ref={drawerRef}
                data-testid="aria-sidebar-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Próximos Passos com a Aria"
                className={`fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-stone-900/98 border-l-2 border-amber-500/60 shadow-2xl z-50 flex flex-col backdrop-blur-md text-stone-100 transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
                }`}
            >
                {/* HEADER DA ABA LATERAL */}
                <div className="p-4 border-b border-amber-500/30 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950/40 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0">
                            {!imgError ? (
                                <img src={ariaGuideImg} alt="Aria Instrutora" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-amber-800 flex items-center justify-center text-lg">🧝‍♀️</div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-black text-amber-400 uppercase tracking-wide">
                                    Aria, a Guia
                                </h2>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${currentStage.color}`}>
                                    {currentStage.label}
                                </span>
                            </div>
                            <p className="text-[11px] text-stone-400">Conselheira Tática do Reino</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpenState(false)}
                        data-testid="aria-sidebar-close"
                        aria-label="Fechar aba lateral"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-stone-800/80 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* CORPO DO DRAWER (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {/* SEÇÃO 1: FALA E DIÁLOGO DA ARIA */}
                    <div className="relative bg-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 shadow-md">
                        <div className="flex items-start gap-2.5">
                            <span className="text-xl flex-shrink-0">🧝‍♀️</span>
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    Orientação Estratégica da Aria
                                </div>
                                <p className="text-[11px] text-stone-200 leading-relaxed italic">
                                    "{advice.ariaSpeech}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SEÇÃO 2: 🎯 OBJETIVO PRIORITÁRIO (PASSO PRINCIPAL) */}
                    <div className="bg-stone-950/90 border-2 border-amber-500/60 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] tracking-wide">
                                <Target className="w-4 h-4 text-amber-400" />
                                <span>Objetivo Prioritário</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                                {advice.primaryObjective.type === 'tutorial' ? 'Diretriz Ativa' : 'Próximo Marco'}
                            </span>
                        </div>

                        <h3 className="text-xs font-bold text-stone-100 mb-1">
                            {advice.primaryObjective.title}
                        </h3>

                        <p className="text-[11px] text-stone-400 mb-3 leading-snug">
                            {advice.primaryObjective.description}
                        </p>

                        {/* BARRA DE PROGRESSO */}
                        <div className="space-y-1 mb-3 bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                            <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-stone-400">Progresso Atual</span>
                                <span className="text-amber-300 font-bold">
                                    {advice.primaryObjective.progress.label} ({advice.primaryObjective.progress.percentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 rounded-full"
                                    style={{ width: `${Math.min(100, Math.max(0, advice.primaryObjective.progress.percentage))}%` }}
                                />
                            </div>
                        </div>

                        {/* DICA DA ARIA */}
                        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2 flex items-start gap-2 mb-3 text-[11px] text-amber-200/90">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{advice.primaryObjective.advice}</span>
                        </div>

                        {/* RECOMPENSAS (SE HOUVER) */}
                        {advice.primaryObjective.rewards && (
                            <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
                                {advice.primaryObjective.rewards.gold && (
                                    <span className="px-2 py-0.5 rounded bg-yellow-950/50 border border-yellow-600/40 text-yellow-300">
                                        🪙 +{advice.primaryObjective.rewards.gold.toLocaleString()} Ouro
                                    </span>
                                )}
                                {advice.primaryObjective.rewards.backroomsScrap && (
                                    <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-600 text-stone-300">
                                        🔩 +{advice.primaryObjective.rewards.backroomsScrap} Sucata
                                    </span>
                                )}
                                {advice.primaryObjective.rewards.almondWater && (
                                    <span className="px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-600/40 text-cyan-300">
                                        🥛 +{advice.primaryObjective.rewards.almondWater} Água Amêndoa
                                    </span>
                                )}
                            </div>
                        )}

                        {/* BOTÃO DE AÇÃO */}
                        <button
                            type="button"
                            onClick={() => handleActionClick(advice.primaryObjective.targetModal)}
                            data-testid="aria-primary-action-button"
                            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 hover:from-amber-500 to-amber-700 hover:to-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform active:scale-95"
                        >
                            <span>{advice.primaryObjective.actionLabel}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* SEÇÃO 3: 🧭 PRÓXIMO GRANDE MARCO (ÁRVORE DE CONQUISTA) */}
                    {advice.upcomingMilestone && (
                        <div className="bg-stone-900/80 border border-indigo-500/40 rounded-xl p-3.5 shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase text-[11px] tracking-wide">
                                    <Compass className="w-4 h-4 text-indigo-400" />
                                    <span>Próximo Modo a Desbloquear</span>
                                </div>
                                <span className="text-[10px] text-stone-400 font-mono">
                                    {advice.upcomingMilestone.icon} {advice.upcomingMilestone.shortName}
                                </span>
                            </div>

                            <div className="flex items-start gap-2.5 mb-2">
                                <span className="text-2xl p-1 bg-stone-800 rounded-lg border border-stone-700">
                                    {advice.upcomingMilestone.icon}
                                </span>
                                <div>
                                    <h4 className="font-bold text-xs text-stone-100">
                                        {advice.upcomingMilestone.name}
                                    </h4>
                                    <p className="text-[10px] text-stone-400 line-clamp-2">
                                        {advice.upcomingMilestone.description}
                                    </p>
                                </div>
                            </div>

                            {/* DICA DA ARIA PARA O MODO */}
                            {advice.upcomingMilestone.ariaAdvice && (
                                <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-2 text-[11px] text-indigo-200/90 mb-2">
                                    <span className="font-semibold text-indigo-300">Conselho da Aria: </span>
                                    {advice.upcomingMilestone.ariaAdvice}
                                </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] text-stone-400 mt-2 pt-2 border-t border-stone-800">
                                <span>Requisito: {advice.upcomingMilestone.unlockRequirementText}</span>
                                {advice.upcomingMilestone.navigationTarget && (
                                    <button
                                        type="button"
                                        onClick={() => handleActionClick(advice.upcomingMilestone?.navigationTarget)}
                                        className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1"
                                    >
                                        <span>Acessar</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SEÇÃO 4: ⚡ CHECKLIST TÁTICO (AÇÕES RECOMENDADAS) */}
                    {advice.tacticalActions.length > 0 && (
                        <div className="bg-stone-900/80 border border-stone-700/60 rounded-xl p-3.5 shadow-md">
                            <div className="flex items-center gap-1.5 text-stone-300 font-bold uppercase text-[11px] tracking-wide mb-2.5">
                                <Layers className="w-4 h-4 text-amber-400" />
                                <span>Ações Recomendadas Agora ({advice.tacticalActions.length})</span>
                            </div>

                            <div className="space-y-2">
                                {advice.tacticalActions.map((act: TacticalAction) => (
                                    <div 
                                        key={act.id} 
                                        className="bg-stone-950/60 border border-stone-800 hover:border-stone-700 rounded-lg p-2.5 transition-all flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-start gap-2 min-w-0">
                                            <span className="text-lg flex-shrink-0">{act.icon}</span>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h5 className="font-bold text-[11px] text-stone-200 truncate">
                                                        {act.title}
                                                    </h5>
                                                    {act.priority === 'high' && (
                                                        <span className="text-[8px] bg-red-900/60 text-red-300 border border-red-700 px-1 rounded font-bold uppercase">
                                                            Alta
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-stone-400 line-clamp-1">
                                                    {act.description}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleActionClick(act.targetModal)}
                                            className="px-2.5 py-1 rounded bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-300 font-bold text-[10px] flex-shrink-0 transition-all border border-stone-700 hover:border-amber-500 whitespace-nowrap"
                                        >
                                            {act.actionLabel}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SEÇÃO 5: 🚀 ATALHOS RÁPIDOS DE COMANDO */}
                    <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center justify-between">
                            <span>Atalhos Rápidos</span>
                            <span className="text-[9px] text-stone-500">Acesso Direto</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleActionClick('tower')}
                                className="p-2 rounded-lg bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-center transition-all"
                            >
                                <div className="text-base">🏰</div>
                                <div className="text-[9px] font-bold text-stone-300">Torre</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleActionClick('town')}
                                className="p-2 rounded-lg bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-center transition-all"
                            >
                                <div className="text-base">🏡</div>
                                <div className="text-[9px] font-bold text-stone-300">Vila</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleActionClick('backrooms')}
                                className="p-2 rounded-lg bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-center transition-all"
                            >
                                <div className="text-base">🏢</div>
                                <div className="text-[9px] font-bold text-stone-300">Backrooms</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleActionClick('tavern')}
                                className="p-2 rounded-lg bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-center transition-all"
                            >
                                <div className="text-base">👥</div>
                                <div className="text-[9px] font-bold text-stone-300">Taverna</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleActionClick('forge')}
                                className="p-2 rounded-lg bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-center transition-all"
                            >
                                <div className="text-base">⚒️</div>
                                <div className="text-[9px] font-bold text-stone-300">Forja</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleActionClick('guide')}
                                className="p-2 rounded-lg bg-stone-950/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-center transition-all"
                            >
                                <div className="text-base">🧭</div>
                                <div className="text-[9px] font-bold text-stone-300">Árvore Completa</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER DO DRAWER */}
                <div className="p-3 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-[10px] text-stone-400 flex-shrink-0">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        Aria Ativa
                    </span>
                    <button
                        type="button"
                        onClick={() => handleActionClick('guide')}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                    >
                        <span>Abrir Árvore de Modos</span>
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </aside>
    );
};
