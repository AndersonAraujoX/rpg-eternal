import React, { useState } from 'react';
import {
    X,
    Lock,
    CheckCircle2,
    Trophy,
    Sparkles,
    Map,
    ArrowRight,
    ArrowDown,
    Shield,
    Swords,
    Layers,
    ExternalLink,
    HelpCircle
} from 'lucide-react';
import {
    FEATURES_LIST,
    type GameStateForUnlocks,
    PROGRESSION_NODES,
    evaluateProgressionTree,
    type EvaluatedProgressionNode,
    getBranchNodes
} from '../../engine/features';

interface JourneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: GameStateForUnlocks;
    onNavigate?: (destination: string) => void;
}

export const JourneyModal: React.FC<JourneyModalProps> = ({ isOpen, onClose, state, onNavigate }) => {
    const [viewMode, setViewMode] = useState<'tree' | 'catalog'>('tree');

    if (!isOpen) return null;

    // Avalia a árvore de progressão com base no estado do jogo
    const evaluatedTree = evaluateProgressionTree(state);
    const mainNodes = getBranchNodes('main').map(n => evaluatedTree[n.id]);
    const leftNodes = getBranchNodes('left').map(n => evaluatedTree[n.id]);
    const rightNodes = getBranchNodes('right').map(n => evaluatedTree[n.id]);

    const totalTreeNodes = PROGRESSION_NODES.length;
    const unlockedTreeCount = Object.values(evaluatedTree).filter(n => n.isUnlocked).length;
    const treePercentage = Math.floor((unlockedTreeCount / totalTreeNodes) * 100);

    // Estatísticas do catálogo clássico
    const totalCatalogFeatures = FEATURES_LIST.length;
    const unlockedCatalogCount = FEATURES_LIST.filter(f => f.checkUnlocked(state)).length;

    const handleNavigate = (target?: string) => {
        if (!target || !onNavigate) return;
        onNavigate(target);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 p-2 sm:p-4">
            <div className="relative bg-slate-950 border-2 border-amber-500/40 w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col">
                {/* Efeitos de iluminação de fundo */}
                <div className="absolute -top-24 left-1/4 w-96 h-96 bg-amber-500/10 blur-[130px] pointer-events-none" />
                <div className="absolute top-1/2 -left-20 w-80 h-80 bg-blue-500/10 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 blur-[130px] pointer-events-none" />

                {/* Header Principal */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-8 py-5 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-lg relative z-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                            <Map className="text-amber-400" size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-white tracking-wide uppercase">
                                    Jornada de Destino
                                </h2>
                                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30 uppercase font-black">
                                    Árvore de Progressão
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Fluxo Principal e Ramificações Estratégicas do RPG
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Seletor de Modo */}
                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    viewMode === 'tree'
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Layers size={14} />
                                <span>Fluxograma</span>
                            </button>
                            <button
                                onClick={() => setViewMode('catalog')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    viewMode === 'catalog'
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <HelpCircle size={14} />
                                <span>Catálogo</span>
                            </button>
                        </div>

                        {/* Barra de Progresso Geral */}
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                Conquistas da Árvore
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                                        style={{ width: `${treePercentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-mono font-black text-amber-400">
                                    {unlockedTreeCount}/{totalTreeNodes}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-200 p-1.5 rounded-xl hover:bg-slate-800"
                            aria-label="Fechar"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Conteúdo Dinâmico com Scroll */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative z-10 custom-scrollbar space-y-8">
                    {viewMode === 'tree' ? (
                        <>
                            {/* ========================================================================= */}
                            {/* 1. LINHA SUPERIOR (FLUXO PRINCIPAL) */}
                            {/* ========================================================================= */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                                        <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                                            Linha Superior (Fluxo Principal)
                                        </h3>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        Torre infinita ➔ Vila ➔ Boss mundial
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                                    {mainNodes.map((node, idx) => (
                                        <React.Fragment key={node.id}>
                                            <ProgressionNodeCard
                                                node={node}
                                                stepNumber={idx + 1}
                                                theme="gold"
                                                onNavigate={handleNavigate}
                                            />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </section>

                            {/* Separador e Indicador de Bifurcação Central */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-dashed border-slate-800" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                        <ArrowDown size={13} className="text-amber-400 animate-bounce" />
                                        Bifurcação Estratégica (A partir da Vila)
                                        <ArrowDown size={13} className="text-amber-400 animate-bounce" />
                                    </span>
                                </div>
                            </div>

                            {/* ========================================================================= */}
                            {/* RAMIFICAÇÕES: ESQUERDA (GUILDAS) E DIREITA (BACKROOM / CIÊNCIA / ESPAÇO) */}
                            {/* ========================================================================= */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {/* RAMIFICAÇÃO ESQUERDA: Vila → Guildas → GVG & Conquista do Andar */}
                                <section className="bg-slate-900/40 border border-blue-900/40 rounded-2xl p-5 sm:p-6 relative overflow-hidden space-y-5">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl pointer-events-none" />

                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                                                <Shield size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase text-blue-400 tracking-wide">
                                                    Ramificação Esquerda
                                                </h4>
                                                <p className="text-[11px] text-slate-400">Vila ➔ Guildas</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                            Aliança de Guerra
                                        </span>
                                    </div>

                                    {/* Raiz da ramificação: Guildas */}
                                    <div className="space-y-4">
                                        {leftNodes.filter(n => n.id === 'guilds').map(node => (
                                            <ProgressionNodeCard
                                                key={node.id}
                                                node={node}
                                                theme="blue"
                                                onNavigate={handleNavigate}
                                            />
                                        ))}

                                        {/* Sub-nós de Guildas: GVG e Conquista do Andar */}
                                        <div className="pl-4 border-l-2 border-blue-800/40 space-y-3 pt-1">
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-blue-300 flex items-center gap-1.5">
                                                <ArrowRight size={12} className="text-blue-400" />
                                                Evolução da Guilda:
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {leftNodes.filter(n => n.id !== 'guilds').map(node => (
                                                    <ProgressionNodeCard
                                                        key={node.id}
                                                        node={node}
                                                        theme="blue"
                                                        compact
                                                        onNavigate={handleNavigate}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* RAMIFICAÇÃO DIREITA: Vila → Backroom → Conquista / Tecnologia → Indústria → Galáxia */}
                                <section className="bg-slate-900/40 border border-purple-900/40 rounded-2xl p-5 sm:p-6 relative overflow-hidden space-y-5">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-3xl pointer-events-none" />

                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                                                <Swords size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase text-purple-400 tracking-wide">
                                                    Ramificação Direita
                                                </h4>
                                                <p className="text-[11px] text-slate-400">Vila ➔ Backroom</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                                            Ciência & Cosmos
                                        </span>
                                    </div>

                                    {/* Raiz da ramificação: Backroom */}
                                    <div className="space-y-4">
                                        {rightNodes.filter(n => n.id === 'backroom').map(node => (
                                            <ProgressionNodeCard
                                                key={node.id}
                                                node={node}
                                                theme="purple"
                                                onNavigate={handleNavigate}
                                            />
                                        ))}

                                        {/* Sub-ramificações de Backroom */}
                                        <div className="pl-4 border-l-2 border-purple-800/40 space-y-4 pt-1">
                                            {/* Ramo 1: Conquista do Andar das Backrooms */}
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-purple-300 mb-2 flex items-center gap-1.5">
                                                    <ArrowRight size={12} className="text-purple-400" />
                                                    Exploração de Níveis:
                                                </div>
                                                {rightNodes.filter(n => n.id === 'backrooms_conquest').map(node => (
                                                    <ProgressionNodeCard
                                                        key={node.id}
                                                        node={node}
                                                        theme="purple"
                                                        compact
                                                        onNavigate={handleNavigate}
                                                    />
                                                ))}
                                            </div>

                                            {/* Ramo 2: Tecnologia → Indústria → Galáxia */}
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider font-bold text-purple-300 mb-2 flex items-center gap-1.5">
                                                    <ArrowRight size={12} className="text-purple-400" />
                                                    Cadeia Tecnológica & Espacial:
                                                </div>
                                                <div className="space-y-2.5">
                                                    {rightNodes.filter(n => ['backrooms_tech', 'industry', 'galaxy'].includes(n.id)).map((node, idx) => (
                                                        <React.Fragment key={node.id}>
                                                            <ProgressionNodeCard
                                                                node={node}
                                                                theme="purple"
                                                                compact
                                                                onNavigate={handleNavigate}
                                                            />
                                                            {idx < 2 && (
                                                                <div className="flex justify-center py-0.5 text-slate-600">
                                                                    <ArrowDown size={14} className="text-purple-500/60" />
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </>
                    ) : (
                        /* ========================================================================= */
                        /* 2. CATÁLOGO COMPLETO DE RECURSOS (VISÃO CLÁSSICA) */
                        /* ========================================================================= */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-base font-bold text-white">Catálogo Geral de Recursos</h3>
                                    <p className="text-xs text-slate-400">Lista exaustiva de todos os sistemas, edifícios e mecânicas auxiliares</p>
                                </div>
                                <span className="text-xs font-mono font-bold text-amber-400">
                                    {unlockedCatalogCount} / {totalCatalogFeatures} Ativos
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {FEATURES_LIST.map((feature, idx) => {
                                    const isUnlocked = feature.checkUnlocked(state);
                                    const progress = feature.getProgress(state);

                                    return (
                                        <div
                                            key={feature.id}
                                            className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                                                isUnlocked
                                                    ? 'bg-slate-900/40 border-emerald-900/50 hover:border-emerald-700'
                                                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                                                    isUnlocked ? 'bg-emerald-950/60 text-emerald-400' : 'bg-slate-900 text-slate-500'
                                                }`}>
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-bold text-white">{feature.name}</h4>
                                                        <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 line-clamp-1">{feature.description}</p>
                                                </div>
                                            </div>

                                            <div className="text-right min-w-[130px]">
                                                {isUnlocked ? (
                                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                                                        <CheckCircle2 size={12} /> Liberado
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <span className="text-[10px] text-amber-500 font-medium block">
                                                            🔒 {feature.unlockRequirementText}
                                                        </span>
                                                        {progress.max > 1 && (
                                                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
                                                                <div
                                                                    className="bg-amber-500 h-full rounded-full"
                                                                    style={{ width: `${progress.percentage}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Informativo */}
                <div className="border-t border-slate-900 px-6 sm:px-8 py-3.5 bg-slate-950 text-center flex items-center justify-between text-xs text-slate-500 relative z-10">
                    <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-amber-500" />
                        <span>Avance na Torre e na Vila para expandir as ramificações de Guildas e Backrooms.</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 hidden sm:inline">
                        Esquema de Progressão v2.0
                    </span>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// SUB-COMPONENTE: CARD DO NÓ DE PROGRESSÃO (ÁRVORE)
// =========================================================================
interface ProgressionNodeCardProps {
    node: EvaluatedProgressionNode;
    stepNumber?: number;
    theme?: 'gold' | 'blue' | 'purple';
    compact?: boolean;
    onNavigate?: (destination?: string) => void;
}

const ProgressionNodeCard: React.FC<ProgressionNodeCardProps> = ({
    node,
    stepNumber,
    theme = 'gold',
    compact = false,
    onNavigate
}) => {
    const isUnlocked = node.isUnlocked;
    const inProgress = node.status === 'in_progress';

    // Definição das cores por tema
    const borderColors = {
        gold: isUnlocked
            ? 'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            : inProgress
                ? 'border-amber-500/40 bg-amber-950/15'
                : 'border-slate-800/80 bg-slate-900/30 opacity-60',
        blue: isUnlocked
            ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            : inProgress
                ? 'border-blue-500/40 bg-blue-950/15'
                : 'border-slate-800/80 bg-slate-900/30 opacity-60',
        purple: isUnlocked
            ? 'border-purple-500/50 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
            : inProgress
                ? 'border-purple-500/40 bg-purple-950/15'
                : 'border-slate-800/80 bg-slate-900/30 opacity-60'
    };

    return (
        <div
            className={`rounded-2xl border p-4 transition-all duration-300 relative group flex flex-col justify-between ${
                borderColors[theme]
            } ${compact ? 'py-3' : 'p-4'}`}
        >
            {/* Linha Superior do Card: Ícone, Título e Badge de Status */}
            <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md ${
                                isUnlocked
                                    ? 'bg-slate-800/80 text-white'
                                    : 'bg-slate-900 text-slate-500'
                            }`}
                        >
                            {node.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className={`font-black tracking-tight ${compact ? 'text-sm' : 'text-base'} ${
                                    isUnlocked ? 'text-white' : 'text-slate-300'
                                }`}>
                                    {node.shortName}
                                </h4>
                                {stepNumber && (
                                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                                        #{stepNumber}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] text-slate-400 block leading-tight font-medium">
                                {node.name}
                            </span>
                        </div>
                    </div>

                    {/* Badge do Status */}
                    {isUnlocked ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles size={9} /> Ativo
                        </span>
                    ) : inProgress ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            ⚡ Em Foco
                        </span>
                    ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                            <Lock size={9} /> Bloqueado
                        </span>
                    )}
                </div>

                {/* Descrição resumida */}
                {!compact && (
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {node.description}
                    </p>
                )}
            </div>

            {/* Parte Inferior: Requisitos, Progresso e Ação */}
            <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-2">
                {!isUnlocked ? (
                    <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-400 font-medium">Requisito:</span>
                            <span className="text-amber-400/90 font-mono font-semibold text-[10px]">
                                {node.unlockRequirementText}
                            </span>
                        </div>
                        {node.progress.max > 1 && (
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                                    <span>Progresso</span>
                                    <span>{node.progress.current} / {node.progress.max}</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${node.progress.percentage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={11} /> Mecânica Pronta
                        </span>
                        {node.navigationTarget && onNavigate && (
                            <button
                                onClick={() => onNavigate(node.navigationTarget)}
                                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all flex items-center gap-1 border border-slate-700"
                            >
                                <span>Acessar</span>
                                <ExternalLink size={10} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
