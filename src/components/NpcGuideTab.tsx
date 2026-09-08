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
    HelpCircle,
    Layers,
    ExternalLink,
    MapPin,
    Shield,
    Swords,
    ChevronRight,
    Play
} from 'lucide-react';
import {
    PROGRESSION_NODES,
    evaluateProgressionTree,
    getBranchNodes,
    type EvaluatedProgressionNode,
    type ProgressionGameState
} from '../engine/progressionTree';

export interface NpcGuideTabProps {
    currentTutorialIndex: number;
    gameState?: any;
    onOpenModal?: (modal: string) => void;
    className?: string;
    initialSection?: 'tree' | 'directives' | 'compendium';
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
    className = '',
    initialSection = 'tree'
}) => {
    const [activeSection, setActiveSection] = useState<'tree' | 'directives' | 'compendium'>(initialSection);
    const [showHint, setShowHint] = useState<boolean>(true);
    const [imgError, setImgError] = useState<boolean>(false);
    const [selectedTopic, setSelectedTopic] = useState<string>('combat');
    const [selectedNodeId, setSelectedNodeId] = useState<string>('tower');

    const safeGameState: ProgressionGameState = {
        highestFloor: gameState?.highestFloor ?? gameState?.tower?.maxFloor ?? 1,
        bossLevel: gameState?.bossLevel ?? gameState?.boss?.level ?? 0,
        buildings: gameState?.buildings ?? [],
        outerSpaceUnlocked: gameState?.outerSpaceUnlocked ?? false,
        backroomsFloor: gameState?.backroomsFloor ?? 1,
        backroomsUnlockedTechs: gameState?.backroomsUnlockedTechs ?? [],
        hasGuild: gameState?.hasGuild ?? false,
        playerTerritoriesCount: gameState?.playerTerritoriesCount ?? 0,
        industryUnlocked: gameState?.industryUnlocked ?? false
    };

    // Árvore de progressão avaliada
    const evaluatedTree = evaluateProgressionTree(safeGameState);
    const mainNodes = getBranchNodes('main').map(n => evaluatedTree[n.id]);
    const leftNodes = getBranchNodes('left').map(n => evaluatedTree[n.id]);
    const rightNodes = getBranchNodes('right').map(n => evaluatedTree[n.id]);

    const totalNodes = PROGRESSION_NODES.length;
    const unlockedNodesCount = Object.values(evaluatedTree).filter(n => n.isUnlocked).length;

    const isCompleted = currentTutorialIndex >= TUTORIAL_STEPS.length;
    const currentStep = !isCompleted ? TUTORIAL_STEPS[currentTutorialIndex] : null;

    const progress: TutorialProgressInfo | null = currentStep && currentStep.calculateProgress
        ? currentStep.calculateProgress(gameState)
        : null;

    const focusedNode: EvaluatedProgressionNode = evaluatedTree[selectedNodeId] || evaluatedTree['tower'];

    const handleNodeAction = (node: EvaluatedProgressionNode) => {
        if (node.isUnlocked && node.navigationTarget && onOpenModal) {
            onOpenModal(node.navigationTarget);
        } else if (!node.isUnlocked && node.parentId) {
            const parent = evaluatedTree[node.parentId];
            if (parent && parent.navigationTarget && onOpenModal) {
                onOpenModal(parent.navigationTarget);
            }
        }
    };

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
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Guia Oficial do Aventureiro
                            </span>
                            <span className="text-stone-600">•</span>
                            <span className="text-amber-400 font-mono font-bold">
                                Modos Liberados: {unlockedNodesCount} / {totalNodes}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto w-full sm:w-auto">
                    <button
                        data-testid="aria-tab-tree-btn"
                        onClick={() => setActiveSection('tree')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            activeSection === 'tree'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Layers size={14} />
                        <span>Árvore de Conquista (Liberar Modos)</span>
                    </button>
                    <button
                        data-testid="aria-tab-directives-btn"
                        onClick={() => setActiveSection('directives')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            activeSection === 'directives'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Compass size={14} />
                        <span>Diretrizes ({currentTutorialIndex}/{TUTORIAL_STEPS.length})</span>
                    </button>
                    <button
                        data-testid="aria-tab-compendium-btn"
                        onClick={() => setActiveSection('compendium')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            activeSection === 'compendium'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <BookOpen size={14} />
                        <span>Compêndio</span>
                    </button>
                </div>

                {onOpenModal && (
                    <button
                        onClick={() => onOpenModal('journey')}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all ml-auto"
                    >
                        <span>Ver Jornada Completa</span>
                        <ExternalLink size={12} />
                    </button>
                )}
            </div>

            {/* SECTION 1: ÁRVORE DE CONQUISTA DOS MODOS */}
            {activeSection === 'tree' && (
                <div className="space-y-6" data-testid="aria-conquest-tree-section">
                    {/* Aria's Conquest Speech Bubble */}
                    <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 shadow-md flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg flex-shrink-0">
                            👩‍🏫
                        </div>
                        <div className="text-xs leading-relaxed text-amber-100">
                            <strong className="text-amber-300 font-bold block mb-0.5">Orientações de Desbloqueio da Aria:</strong>
                            Para liberar cada modo de jogo, siga a sequência do nosso mapa! A <strong className="text-white">Torre Infinita</strong> abre a <strong className="text-white">Vila</strong>. Da Vila, você se divide em dois grandes caminhos: a glória das <strong className="text-white">Guildas & Guerras</strong> à esquerda, e a fronteira das <strong className="text-white">Backrooms, Indústria e Galáxia</strong> à direita!
                        </div>
                    </div>

                    {/* 1. LINHA SUPERIOR (FLUXO PRINCIPAL) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                                    Linha Superior (Fluxo Principal)
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400">Torre infinita ➔ Vila ➔ Boss mundial</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {mainNodes.map(node => (
                                <AriaNodeBadge
                                    key={node.id}
                                    node={node}
                                    isSelected={selectedNodeId === node.id}
                                    onSelect={() => setSelectedNodeId(node.id)}
                                    onAction={() => handleNodeAction(node)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 2. RAMIFICAÇÕES LATERAIS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Ramificação Esquerda */}
                        <div className="bg-slate-900/60 border border-blue-900/40 rounded-xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between border-b border-blue-800/30 pb-1.5">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <Shield size={14} />
                                    <h4 className="text-xs font-black uppercase">Ramificação Esquerda (Vila ➔ Guildas)</h4>
                                </div>
                                <span className="text-[10px] text-blue-300/80 font-mono">Modo Social & MOBA</span>
                            </div>
                            <div className="space-y-2">
                                {leftNodes.map(node => (
                                    <AriaNodeBadge
                                        key={node.id}
                                        node={node}
                                        isSelected={selectedNodeId === node.id}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        onAction={() => handleNodeAction(node)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Ramificação Direita */}
                        <div className="bg-slate-900/60 border border-purple-900/40 rounded-xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between border-b border-purple-800/30 pb-1.5">
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Swords size={14} />
                                    <h4 className="text-xs font-black uppercase">Ramificação Direita (Vila ➔ Backroom ➔ Galáxia)</h4>
                                </div>
                                <span className="text-[10px] text-purple-300/80 font-mono">Ciência & Espaço</span>
                            </div>
                            <div className="space-y-2">
                                {rightNodes.map(node => (
                                    <AriaNodeBadge
                                        key={node.id}
                                        node={node}
                                        isSelected={selectedNodeId === node.id}
                                        onSelect={() => setSelectedNodeId(node.id)}
                                        onAction={() => handleNodeAction(node)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FOCUS INSPECTOR: CONSELHO DETALHADO DA ARIA PARA O MODO SELECIONADO */}
                    {focusedNode && (
                        <div 
                            data-testid="aria-focused-mode-inspector"
                            className="bg-slate-900/90 border-2 border-amber-500/60 rounded-xl p-4 shadow-lg space-y-3"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border border-amber-500/40 shadow">
                                        {focusedNode.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-black text-white">{focusedNode.name}</h4>
                                            {focusedNode.isUnlocked ? (
                                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30 flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Liberado
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase border border-slate-700 flex items-center gap-1">
                                                    <Lock size={10} /> Bloqueado
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400">{focusedNode.description}</p>
                                    </div>
                                </div>

                                {focusedNode.navigationTarget && onOpenModal && (
                                    <button
                                        onClick={() => handleNodeAction(focusedNode)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow ${
                                            focusedNode.isUnlocked
                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black'
                                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                                        }`}
                                    >
                                        <span>{focusedNode.isUnlocked ? 'Entrar no Modo' : 'Ir para Origem'}</span>
                                        <ArrowRight size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Conselho da Aria */}
                            <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 text-xs leading-relaxed text-amber-200 flex items-start gap-2.5">
                                <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block text-[11px] uppercase font-bold text-amber-300 mb-0.5">
                                        Como Conquistar este Modo (Dica da Aria):
                                    </strong>
                                    <span>{focusedNode.ariaAdvice || focusedNode.unlockRequirementText}</span>
                                    <div className="mt-1.5 text-[11px] text-stone-400 font-mono">
                                        <strong>Requisito Oficial:</strong> {focusedNode.unlockRequirementText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 2: DIRETRIZES & TUTORIAIS */}
            {activeSection === 'directives' && (
                <div className="space-y-4" data-testid="aria-directives-section">
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

                    {/* Directive Checklist Timeline */}
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
                </div>
            )}

            {/* SECTION 3: COMPÊNDIO DE CONHECIMENTO */}
            {activeSection === 'compendium' && (
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
            )}
        </div>
    );
};

// =========================================================================
// SUB-COMPONENTE: BADGE / CARD DO NÓ NA ABA DA ARIA
// =========================================================================
interface AriaNodeBadgeProps {
    node: EvaluatedProgressionNode;
    isSelected: boolean;
    onSelect: () => void;
    onAction: () => void;
}

const AriaNodeBadge: React.FC<AriaNodeBadgeProps> = ({
    node,
    isSelected,
    onSelect,
    onAction
}) => {
    return (
        <div
            data-testid={`aria-node-${node.id}`}
            onClick={onSelect}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                isSelected
                    ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : node.isUnlocked
                        ? 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                        : 'border-slate-800/60 bg-slate-950/40 opacity-60 hover:opacity-80'
            }`}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0">{node.icon}</span>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black truncate ${node.isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                            {node.shortName}
                        </span>
                        {node.isUnlocked && (
                            <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block">
                        {node.isUnlocked ? 'Liberado' : `🔒 ${node.unlockRequirementText}`}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
                {node.isUnlocked && node.navigationTarget ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction();
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 text-[10px] font-black uppercase transition-all flex items-center gap-0.5 border border-slate-700"
                        title="Ir para este modo"
                    >
                        <span>Abrir</span>
                        <ChevronRight size={10} />
                    </button>
                ) : (
                    <span className="text-[10px] text-slate-500 font-mono px-1">
                        {node.status === 'in_progress' ? `${node.progress.percentage}%` : 'Bloq.'}
                    </span>
                )}
            </div>
        </div>
    );
};
