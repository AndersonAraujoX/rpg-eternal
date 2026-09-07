import React, { useState } from 'react';
import { TUTORIAL_STEPS, TUTORIAL_NPC, type TutorialProgressInfo } from '../data/npcTutorial';
import { 
    CheckCircle2, 
    Circle, 
    Lock, 
    Lightbulb, 
    ArrowRight, 
    Sparkles, 
    BookOpen, 
    Compass, 
    Coins, 
    Wrench, 
    Milk, 
    Dna, 
    HelpCircle
} from 'lucide-react';

export interface NpcGuideTabProps {
    currentTutorialIndex: number;
    gameState?: any;
    onOpenModal?: (modal: string) => void;
    className?: string;
}

interface GuideArticle {
    id: string;
    icon: string;
    title: string;
    content: string;
}

const GUIDE_ARTICLES: GuideArticle[] = [
    {
        id: 'combat',
        icon: '⚔️',
        title: 'Combate e Chefes',
        content: 'Seus heróis atacam continuamente de forma automática. Ao derrotar lacaios, você ganha Ouro e Almas. A cada certo número de abates, um Chefe colossal surge. Se o tempo do chefe expirar, a equipe recua para treinar contra lacaios.'
    },
    {
        id: 'tavern',
        icon: '👥',
        title: 'Taverna e Recrutamento',
        content: 'Visite a Taverna para recrutar novos aventureiros com ouro. Combinar heróis do mesmo elemento ou classes complementares ativa Sinergias poderosas que aumentam o dano da equipe.'
    },
    {
        id: 'forge',
        icon: '⚒️',
        title: 'Forja e Mineração',
        content: 'Atribua heróis à Mineração para acumular minérios brutos. Utilize esses minérios na Forja para aprimorar os slots de armas e armaduras de toda a guilda de forma permanente.'
    },
    {
        id: 'backrooms',
        icon: '🏢',
        title: 'Posto M.E.G. & Backrooms',
        content: 'Ao construir o Posto Avançado na Vila, você desbloqueia as Backrooms. Contrate exploradores, abasteça-os com Água de Amêndoa para manter sua sanidade e explore andares desconhecidos para obter sucatas e tecnologias.'
    }
];

export const NpcGuideTab: React.FC<NpcGuideTabProps> = ({
    currentTutorialIndex,
    gameState = {},
    onOpenModal,
    className = ''
}) => {
    const [showHint, setShowHint] = useState<boolean>(true);
    const [imgError, setImgError] = useState<boolean>(false);
    const [selectedTopic, setSelectedTopic] = useState<string>('combat');

    const isCompleted = currentTutorialIndex >= TUTORIAL_STEPS.length;
    const currentStep = !isCompleted ? TUTORIAL_STEPS[currentTutorialIndex] : null;

    const progress: TutorialProgressInfo | null = currentStep && currentStep.calculateProgress
        ? currentStep.calculateProgress(gameState)
        : null;

    return (
        <div 
            data-testid="npc-guide-tab"
            className={`flex flex-col gap-4 p-4 text-stone-200 font-sans min-h-full ${className}`}
        >
            {/* Header Hero Section: Aria Profile */}
            <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-amber-950/40 border border-amber-500/40 rounded-xl p-4 shadow-lg relative overflow-hidden backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    {/* Portrait Frame */}
                    <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-amber-950 border-4 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center text-4xl">
                            {TUTORIAL_NPC.image && !imgError ? (
                                <img 
                                    src={TUTORIAL_NPC.image} 
                                    alt={TUTORIAL_NPC.name} 
                                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300" 
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <span>{TUTORIAL_NPC.avatar}</span>
                            )}
                        </div>
                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online no Acampamento" />
                    </div>

                    {/* NPC Details & Greeting */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <h2 className="text-lg font-black text-amber-300 uppercase tracking-wide">
                                {TUTORIAL_NPC.fullName}
                            </h2>
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                {TUTORIAL_NPC.title}
                            </span>
                        </div>
                        <p className="text-xs text-stone-300 mt-1 italic leading-relaxed">
                            "{TUTORIAL_NPC.greeting}"
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-stone-400">
                            <span className="flex items-center gap-1 text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Guia Interativa Ativa
                            </span>
                            <span className="text-stone-600">•</span>
                            <span className="text-amber-400 font-mono">
                                Progresso: {Math.min(currentTutorialIndex, TUTORIAL_STEPS.length)} / {TUTORIAL_STEPS.length} Diretrizes
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Directive / Objective Card */}
            {isCompleted ? (
                <div 
                    data-testid="guide-tab-completed"
                    className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-xl p-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-center relative overflow-hidden"
                >
                    <div className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center mx-auto text-2xl text-emerald-400 mb-2">
                        <CheckCircle2 size={28} className="animate-pulse" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                        Todas as Diretrizes Iniciais Concluídas!
                    </h3>
                    <p className="text-xs text-emerald-200/90 mt-1 max-w-lg mx-auto">
                        {TUTORIAL_NPC.completedBanner}
                    </p>
                    <div className="mt-3 text-[11px] text-stone-400 bg-slate-950/60 p-2.5 rounded-lg border border-emerald-800/30">
                        ⭐ Dica de Aria: Continue explorando o mapa estelar, sintetizando almas e descendo às profundezas das Backrooms para desafios de alto escalão!
                    </div>
                </div>
            ) : currentStep ? (
                <div 
                    data-testid="guide-tab-active-step"
                    className="bg-slate-900/90 border-2 border-amber-500/70 rounded-xl p-4 shadow-md flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                                Passo {currentTutorialIndex + 1} de {TUTORIAL_STEPS.length}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                                {currentStep.npcName}
                            </span>
                        </div>
                        {currentStep.hint && (
                            <button
                                data-testid="guide-tab-hint-toggle"
                                onClick={() => setShowHint(!showHint)}
                                className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition-all border ${showHint ? 'bg-amber-500 text-slate-950 border-amber-300' : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'}`}
                            >
                                <Lightbulb size={12} />
                                <span>{showHint ? 'Ocultar Dica' : 'Ver Dica'}</span>
                            </button>
                        )}
                    </div>

                    {/* Dialogue Box */}
                    <div className="bg-slate-950/70 border border-amber-500/30 rounded-lg p-3 text-xs leading-relaxed text-amber-100 italic">
                        "{currentStep.dialogue}"
                    </div>

                    {/* Hint */}
                    {showHint && currentStep.hint && (
                        <div 
                            data-testid="guide-tab-hint-content"
                            className="bg-amber-950/50 border border-amber-500/40 rounded-lg p-2.5 text-xs text-amber-200 flex items-start gap-2"
                        >
                            <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="block text-[10px] uppercase font-bold text-amber-300 mb-0.5">Dica da Aria:</strong>
                                <span>{currentStep.hint}</span>
                            </div>
                        </div>
                    )}

                    {/* Objective Box & Action Shortcut */}
                    <div className="bg-slate-950/90 border border-stone-700 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                                🎯 Objetivo da Diretriz:
                            </span>
                            <p className="text-xs font-bold text-white leading-snug">
                                {currentStep.objectiveDescription}
                            </p>
                        </div>

                        {currentStep.targetModal && onOpenModal && (
                            <button
                                data-testid="guide-tab-action-button"
                                onClick={() => onOpenModal(currentStep.targetModal!)}
                                className="w-full sm:w-auto flex-shrink-0 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                            >
                                <span>{currentStep.actionLabel || 'Ir até lá'}</span>
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {progress && (
                        <div className="flex flex-col gap-1.5 pt-1">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-stone-300">{progress.label}</span>
                                <span className="text-amber-400 font-bold">{progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-amber-500/20">
                                <div 
                                    className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Rewards Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-500/20">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            <Sparkles size={12} className="text-amber-400" />
                            <span>Recompensas desta diretriz:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {currentStep.reward.gold && (
                                <span className="bg-amber-950/80 text-amber-300 border border-amber-600/40 text-xs font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                                    <Coins size={12} className="text-amber-400" />
                                    {currentStep.reward.gold.toLocaleString()} Ouro
                                </span>
                            )}
                            {currentStep.reward.backroomsScrap && (
                                <span className="bg-stone-800 text-stone-200 border border-stone-600/40 text-xs font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                                    <Wrench size={12} className="text-stone-300" />
                                    {currentStep.reward.backroomsScrap} Sucata
                                </span>
                            )}
                            {currentStep.reward.almondWater && (
                                <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-600/40 text-xs font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                                    <Milk size={12} className="text-cyan-400" />
                                    {currentStep.reward.almondWater} Água
                                </span>
                            )}
                            {currentStep.reward.anomalyParts && (
                                <span className="bg-purple-950/80 text-purple-300 border border-purple-600/40 text-xs font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
                                    <Dna size={12} className="text-purple-400" />
                                    {currentStep.reward.anomalyParts} Peças
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Directive Checklist Section */}
            <div className="bg-slate-900/80 border border-stone-700/60 rounded-xl p-3.5 flex flex-col gap-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Compass size={14} className="text-amber-400" /> Linha do Tempo das Diretrizes
                </h3>
                <div className="flex flex-col gap-2">
                    {TUTORIAL_STEPS.map((step, idx) => {
                        const isDone = idx < currentTutorialIndex;
                        const isCurrent = idx === currentTutorialIndex;
                        return (
                            <div 
                                key={step.id}
                                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                                    isDone 
                                        ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200' 
                                        : isCurrent 
                                            ? 'bg-amber-950/40 border-amber-500 text-amber-200 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                                            : 'bg-slate-950/40 border-stone-800 text-stone-500'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {isDone ? (
                                        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                                    ) : isCurrent ? (
                                        <Circle size={16} className="text-amber-400 animate-pulse flex-shrink-0" />
                                    ) : (
                                        <Lock size={16} className="text-stone-600 flex-shrink-0" />
                                    )}
                                    <span className="truncate max-w-[280px] sm:max-w-md">
                                        {step.objectiveDescription}
                                    </span>
                                </div>
                                <span className="text-[10px] uppercase font-mono tracking-wider font-bold">
                                    {isDone ? 'Concluído' : isCurrent ? 'Em Curso' : 'Bloqueado'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Guide Knowledge Compendium */}
            <div className="bg-slate-900/80 border border-stone-700/60 rounded-xl p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-amber-400" /> Compêndio de Aconselhamento da Aria
                    </h3>
                    <span className="text-[10px] text-stone-400">Dicas Rápidas</span>
                </div>

                {/* Topic Selector Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {GUIDE_ARTICLES.map((article) => (
                        <button
                            key={article.id}
                            onClick={() => setSelectedTopic(article.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                selectedTopic === article.id 
                                    ? 'bg-amber-600 text-slate-950 shadow' 
                                    : 'bg-slate-800 text-stone-400 hover:text-stone-200'
                            }`}
                        >
                            <span>{article.icon}</span>
                            <span>{article.title}</span>
                        </button>
                    ))}
                </div>

                {/* Selected Article Content */}
                {(() => {
                    const active = GUIDE_ARTICLES.find(a => a.id === selectedTopic);
                    if (!active) return null;
                    return (
                        <div className="bg-slate-950/70 border border-stone-800 p-3 rounded-lg text-xs leading-relaxed text-stone-300">
                            <strong className="text-amber-300 block mb-1 flex items-center gap-1.5">
                                <HelpCircle size={14} /> {active.title}
                            </strong>
                            <p>{active.content}</p>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};
