import React, { useState, useMemo } from 'react';
import { 
    Cpu, CheckCircle2, Lock, Sparkles, ChevronRight, Zap, Search, 
    Layers, Compass, Atom, Rocket, Eye, ShieldAlert, Award
} from 'lucide-react';
import type { BackroomsResearch, BackroomsResources } from '../../engine/backrooms';
import { BACKROOMS_RESEARCHES } from '../../engine/backrooms';

export interface BackroomsTechTreeProps {
    floor: number;
    resources: BackroomsResources;
    unlockedTechs: string[];
    onResearchTech: (techId: string) => void;
}

// Visual metadata for Era branding and categories
const ERA_CONFIG: Record<string, { icon: string; color: string; border: string; bg: string; accent: string; label: string }> = {
    'Era Medieval': {
        icon: '🏰',
        color: 'text-amber-400',
        border: 'border-amber-700/60',
        bg: 'bg-amber-950/20',
        accent: '#d97706',
        label: 'Era 1: Medieval'
    },
    'Era Industrial & Vapor': {
        icon: '⚙️',
        color: 'text-orange-400',
        border: 'border-orange-700/60',
        bg: 'bg-orange-950/20',
        accent: '#ea580c',
        label: 'Era 2: Industrial'
    },
    'Era Atômica & Digital': {
        icon: '🖥️',
        color: 'text-emerald-400',
        border: 'border-emerald-700/60',
        bg: 'bg-emerald-950/20',
        accent: '#10b981',
        label: 'Era 3: Atômica'
    },
    'Era Quântica & Fusão': {
        icon: '🔬',
        color: 'text-cyan-400',
        border: 'border-cyan-700/60',
        bg: 'bg-cyan-950/20',
        accent: '#06b6d4',
        label: 'Era 4: Quântica'
    },
    'Era Espacial': {
        icon: '🚀',
        color: 'text-indigo-400',
        border: 'border-indigo-700/60',
        bg: 'bg-indigo-950/20',
        accent: '#6366f1',
        label: 'Era 5: Espacial'
    },
    'Era Inter-Dimensional': {
        icon: '🌀',
        color: 'text-fuchsia-400',
        border: 'border-fuchsia-700/60',
        bg: 'bg-fuchsia-950/20',
        accent: '#c026d3',
        label: 'Era 6: Inter-Dimensional'
    }
};

// Tech icons and categories
const TECH_META: Record<string, { icon: string; category: 'Economia' | 'Combate' | 'Exploração' | 'Cósmico' }> = {
    alchemical_distill: { icon: '🧴', category: 'Exploração' },
    cult_rotation: { icon: '🌱', category: 'Economia' },
    iron_metallurgy: { icon: '⛏️', category: 'Economia' },
    windmills: { icon: '💨', category: 'Economia' },
    steam_engine: { icon: '🚂', category: 'Economia' },
    large_mining: { icon: '🌋', category: 'Economia' },
    fission_nuclear: { icon: '☢️', category: 'Combate' },
    silicon_network: { icon: '💻', category: 'Combate' },
    clean_fusion: { icon: '⚡', category: 'Economia' },
    quantum_computing: { icon: '🔮', category: 'Combate' },
    antimatter_prop: { icon: '✨', category: 'Cósmico' },
    asteroid_mining: { icon: '☄️', category: 'Cósmico' },
    space_warp: { icon: '🌌', category: 'Cósmico' },
    vacuum_siphon: { icon: '🕳️', category: 'Cósmico' },
    dimensional_singularity: { icon: '👁️', category: 'Cósmico' }
};

// Tech branch lineage / flow connections
const TECH_FLOW: { from: string; to: string }[] = [
    { from: 'iron_metallurgy', to: 'windmills' },
    { from: 'windmills', to: 'steam_engine' },
    { from: 'iron_metallurgy', to: 'large_mining' },
    { from: 'steam_engine', to: 'fission_nuclear' },
    { from: 'steam_engine', to: 'silicon_network' },
    { from: 'fission_nuclear', to: 'clean_fusion' },
    { from: 'silicon_network', to: 'quantum_computing' },
    { from: 'clean_fusion', to: 'antimatter_prop' },
    { from: 'large_mining', to: 'asteroid_mining' },
    { from: 'antimatter_prop', to: 'space_warp' },
    { from: 'space_warp', to: 'vacuum_siphon' },
    { from: 'quantum_computing', to: 'dimensional_singularity' },
    { from: 'vacuum_siphon', to: 'dimensional_singularity' }
];

export const BackroomsTechTree: React.FC<BackroomsTechTreeProps> = ({
    floor,
    resources,
    unlockedTechs,
    onResearchTech
}) => {
    const [viewMode, setViewMode] = useState<'tree' | 'matrix'>('tree');
    const [selectedEra, setSelectedEra] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTechId, setSelectedTechId] = useState<string>(BACKROOMS_RESEARCHES[0]?.id || '');

    const eras = Object.keys(ERA_CONFIG);

    // Selected tech object
    const selectedTech = useMemo(() => {
        return BACKROOMS_RESEARCHES.find(t => t.id === selectedTechId) || BACKROOMS_RESEARCHES[0];
    }, [selectedTechId]);

    // Progress statistics
    const totalTechs = BACKROOMS_RESEARCHES.length;
    const completedTechs = unlockedTechs.length;
    const progressPercent = Math.round((completedTechs / totalTechs) * 100);

    // Filtered techs
    const filteredTechs = useMemo(() => {
        return BACKROOMS_RESEARCHES.filter(tech => {
            const matchesEra = selectedEra === 'all' || tech.era === selectedEra;
            const meta = TECH_META[tech.id];
            const matchesCategory = selectedCategory === 'all' || (meta && meta.category === selectedCategory);
            const matchesSearch = searchQuery.trim() === '' || 
                tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tech.effectText.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesEra && matchesCategory && matchesSearch;
        });
    }, [selectedEra, selectedCategory, searchQuery]);

    // Check afford status
    const canAfford = (tech: BackroomsResearch) => {
        return (
            resources.scrap >= tech.cost.scrap &&
            resources.almondWater >= tech.cost.almondWater &&
            resources.anomalyParts >= tech.cost.anomalyParts
        );
    };

    return (
        <div className="flex flex-col gap-4 font-mono text-amber-500">
            {/* Top Stats & Mode Bar */}
            <div className="bg-gradient-to-r from-amber-950/40 via-stone-900/80 to-amber-950/40 border border-amber-800/80 rounded-lg p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-600/60 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(217,119,6,0.3)]">
                        <Cpu className="text-amber-400 animate-pulse" size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs md:text-sm font-black uppercase text-amber-300 tracking-wider">
                                M.E.G. Matriz de Pesquisas Tecnológicas
                            </h3>
                            <span className="text-[9px] bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700">
                                v4.8 Quantum
                            </span>
                        </div>
                        <p className="text-[10px] text-amber-600 mt-0.5">
                            Avance pelas Eras dimensionais transformando sucatas e anomalias em multiplicadores cósmicos.
                        </p>
                    </div>
                </div>

                {/* Overall Research Meter & View Switcher */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-amber-600 font-bold uppercase">Índice Científico:</span>
                            <span className="font-bold text-emerald-400">{completedTechs}/{totalTechs} ({progressPercent}%)</span>
                        </div>
                        <div className="w-36 md:w-44 bg-black/80 h-2 rounded-full overflow-hidden border border-amber-800/60 p-0.5">
                            <div 
                                className="bg-gradient-to-r from-amber-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* View Switcher Buttons */}
                    <div className="flex rounded border border-amber-800/80 bg-black/60 p-0.5 text-[10px] font-bold">
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                                viewMode === 'tree'
                                    ? 'bg-amber-600 text-black font-black shadow-sm'
                                    : 'text-amber-500 hover:text-amber-300'
                            }`}
                            title="Modo Árvore de Conexões"
                        >
                            <Sparkles size={12} /> Árvore
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                                viewMode === 'matrix'
                                    ? 'bg-amber-600 text-black font-black shadow-sm'
                                    : 'text-amber-500 hover:text-amber-300'
                            }`}
                            title="Modo Matriz de Grade"
                        >
                            <Layers size={12} /> Matriz
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                {/* Era Selector Pills */}
                <div className="flex flex-wrap gap-1 items-center">
                    <button
                        onClick={() => setSelectedEra('all')}
                        className={`px-2.5 py-1 rounded border transition-all ${
                            selectedEra === 'all'
                                ? 'bg-amber-600 text-black font-bold border-amber-400'
                                : 'bg-black/40 text-amber-600 border-amber-900/60 hover:border-amber-700'
                        }`}
                    >
                        TODAS AS ERAS
                    </button>
                    {eras.map(era => {
                        const countInEra = BACKROOMS_RESEARCHES.filter(t => t.era === era).length;
                        const unlockedInEra = BACKROOMS_RESEARCHES.filter(t => t.era === era && unlockedTechs.includes(t.id)).length;
                        const isEraComplete = countInEra > 0 && unlockedInEra === countInEra;
                        const cfg = ERA_CONFIG[era];

                        return (
                            <button
                                key={era}
                                onClick={() => setSelectedEra(era)}
                                className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
                                    selectedEra === era
                                        ? 'bg-amber-700/80 text-amber-100 border-amber-400 font-bold'
                                        : 'bg-black/40 text-amber-600 border-amber-900/60 hover:border-amber-700'
                                }`}
                            >
                                <span>{cfg.icon}</span>
                                <span className="hidden sm:inline">{era.replace('Era ', '')}</span>
                                <span className={`text-[8px] px-1 rounded ${isEraComplete ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-amber-950/60 text-amber-500'}`}>
                                    {unlockedInEra}/{countInEra}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Category & Search Input */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex rounded border border-amber-900/80 bg-black/60 p-0.5 text-[9px]">
                        {['all', 'Economia', 'Combate', 'Exploração', 'Cósmico'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2 py-0.5 rounded transition-colors ${
                                    selectedCategory === cat
                                        ? 'bg-amber-800 text-amber-100 font-bold'
                                        : 'text-amber-600 hover:text-amber-400'
                                }`}
                            >
                                {cat === 'all' ? 'Todos' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-1 sm:w-40">
                        <input
                            type="text"
                            placeholder="Buscar pesquisa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-amber-800 text-amber-400 placeholder-amber-750 text-[10px] rounded px-2 py-1 pl-6 focus:outline-none focus:border-amber-500"
                        />
                        <Search size={11} className="absolute left-1.5 top-2 text-amber-600" />
                    </div>
                </div>
            </div>

            {/* Main Interactive Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* Tech Presentation Area (Left / Center) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {viewMode === 'tree' ? (
                        /* Visual Flow Tree by Eras */
                        <div className="flex flex-col gap-6 bg-stone-950/80 border border-amber-900/60 rounded-lg p-4 max-h-[62vh] overflow-y-auto custom-scroll relative">
                            {eras.filter(e => selectedEra === 'all' || e === selectedEra).map(era => {
                                const cfg = ERA_CONFIG[era];
                                const techsInEra = BACKROOMS_RESEARCHES.filter(t => t.era === era);
                                const eraCompleted = techsInEra.every(t => unlockedTechs.includes(t.id));

                                return (
                                    <div key={era} className="flex flex-col gap-3 relative">
                                        {/* Era Header Banner */}
                                        <div className={`flex justify-between items-center px-3 py-1.5 rounded border ${cfg.border} ${cfg.bg}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{cfg.icon}</span>
                                                <span className={`text-xs font-black uppercase tracking-wider ${cfg.color}`}>
                                                    {era}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-amber-500">
                                                    Andares Requeridos: {Math.min(...techsInEra.map(t => t.minFloor))} - {Math.max(...techsInEra.map(t => t.minFloor))}
                                                </span>
                                                {eraCompleted && (
                                                    <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-600 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                                        <CheckCircle2 size={10} /> 100%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Era Nodes Row / Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 sm:pl-4 border-l-2 border-amber-900/40 ml-2">
                                            {techsInEra.map(tech => {
                                                const isUnlocked = unlockedTechs.includes(tech.id);
                                                const isFloorLocked = floor < tech.minFloor;
                                                const isSelected = selectedTechId === tech.id;
                                                const affordable = canAfford(tech);
                                                const meta = TECH_META[tech.id] || { icon: '🔬', category: 'Exploração' };

                                                return (
                                                    <div
                                                        key={tech.id}
                                                        onClick={() => setSelectedTechId(tech.id)}
                                                        className={`relative cursor-pointer rounded-lg border-2 p-3 flex flex-col gap-2 transition-all group ${
                                                            isSelected
                                                                ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.01]'
                                                                : isUnlocked
                                                                ? 'border-emerald-700/60 bg-emerald-950/15 hover:border-emerald-500'
                                                                : isFloorLocked
                                                                ? 'border-red-950/70 bg-black/60 opacity-60 hover:opacity-85'
                                                                : affordable
                                                                ? 'border-amber-600/80 bg-amber-950/20 hover:border-amber-400 animate-pulse'
                                                                : 'border-amber-900/60 bg-black/50 hover:border-amber-700'
                                                        }`}
                                                    >
                                                        {/* Node Header */}
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl p-1 bg-black/60 rounded border border-amber-900/40 flex items-center justify-center">
                                                                    {meta.icon}
                                                                </span>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-xs font-bold ${
                                                                        isUnlocked ? 'text-emerald-300' : isFloorLocked ? 'text-red-400' : 'text-amber-300'
                                                                    }`}>
                                                                        {tech.name}
                                                                    </span>
                                                                    <div className="flex items-center gap-1 text-[8px] text-amber-600 mt-0.5">
                                                                        <span className="px-1 rounded bg-black/60 border border-amber-900/40 uppercase">{meta.category}</span>
                                                                        <span>• Andar {tech.minFloor}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div>
                                                                {isUnlocked ? (
                                                                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-600 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                                                        <CheckCircle2 size={10} /> Ativo
                                                                    </span>
                                                                ) : isFloorLocked ? (
                                                                    <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                        <Lock size={10} /> Nv.{tech.minFloor}
                                                                    </span>
                                                                ) : affordable ? (
                                                                    <span className="text-[9px] bg-amber-600 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-1 animate-pulse">
                                                                        <Zap size={10} /> Pronto
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] bg-black text-amber-600 border border-amber-800 px-1.5 py-0.5 rounded">
                                                                        Pendente
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Effect Line */}
                                                        <div className="bg-black/60 p-1.5 rounded border border-amber-900/40 text-[9px] text-amber-400 flex items-center gap-1">
                                                            <Sparkles size={11} className="text-amber-500 flex-shrink-0" />
                                                            <span className="truncate">{tech.effectText}</span>
                                                        </div>

                                                        {/* Mini Cost bar */}
                                                        {!isUnlocked && (
                                                            <div className="flex items-center justify-between text-[9px] pt-1 border-t border-amber-950 font-bold">
                                                                <span className={resources.scrap >= tech.cost.scrap ? 'text-amber-400' : 'text-red-500'}>
                                                                    🔧 {tech.cost.scrap}
                                                                </span>
                                                                <span className={resources.almondWater >= tech.cost.almondWater ? 'text-emerald-400' : 'text-red-500'}>
                                                                    🧴 {tech.cost.almondWater}
                                                                </span>
                                                                <span className={resources.anomalyParts >= tech.cost.anomalyParts ? 'text-purple-400' : 'text-red-500'}>
                                                                    🦠 {tech.cost.anomalyParts}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Matrix View (Grid of all filtered cards) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[62vh] overflow-y-auto custom-scroll p-1">
                            {filteredTechs.map(tech => {
                                const isUnlocked = unlockedTechs.includes(tech.id);
                                const isFloorLocked = floor < tech.minFloor;
                                const isSelected = selectedTechId === tech.id;
                                const affordable = canAfford(tech);
                                const meta = TECH_META[tech.id] || { icon: '🔬', category: 'Exploração' };

                                return (
                                    <div
                                        key={tech.id}
                                        onClick={() => setSelectedTechId(tech.id)}
                                        className={`cursor-pointer rounded-lg border-2 p-3 flex flex-col justify-between gap-3 transition-all ${
                                            isSelected
                                                ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                                                : isUnlocked
                                                ? 'border-emerald-700/60 bg-emerald-950/10 hover:border-emerald-500'
                                                : isFloorLocked
                                                ? 'border-red-950/60 bg-black/60 opacity-65 hover:opacity-90'
                                                : 'border-amber-850 bg-black/60 hover:border-amber-600'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start gap-1 pb-2 border-b border-amber-950">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl p-1 bg-black rounded border border-amber-900/40">
                                                        {meta.icon}
                                                    </span>
                                                    <div>
                                                        <h4 className={`text-xs font-bold ${isUnlocked ? 'text-emerald-300' : 'text-amber-300'}`}>
                                                            {tech.name}
                                                        </h4>
                                                        <span className="text-[8px] text-amber-600">{tech.era}</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                                    isUnlocked ? 'bg-emerald-950 text-emerald-400 border-emerald-700' :
                                                    isFloorLocked ? 'bg-red-950 text-red-400 border-red-900' :
                                                    affordable ? 'bg-amber-600 text-black border-amber-400' : 'bg-black text-amber-600 border-amber-800'
                                                }`}>
                                                    {isUnlocked ? 'Pesquisado' : isFloorLocked ? `Andar ${tech.minFloor}` : 'Disponível'}
                                                </span>
                                            </div>

                                            <p className="text-[10px] text-amber-650 leading-relaxed mt-2 line-clamp-2">
                                                {tech.description}
                                            </p>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-amber-950/80">
                                            <div className="bg-black/60 p-1.5 rounded border border-amber-900/40 text-[9px] text-amber-400 flex items-center gap-1.5">
                                                <Zap size={11} className="text-amber-500 flex-shrink-0" />
                                                <span className="font-semibold">{tech.effectText}</span>
                                            </div>

                                            {!isUnlocked && (
                                                <div className="flex justify-between text-[9px] font-bold">
                                                    <span className={resources.scrap >= tech.cost.scrap ? 'text-amber-400' : 'text-red-500'}>
                                                        🔧 {tech.cost.scrap}
                                                    </span>
                                                    <span className={resources.almondWater >= tech.cost.almondWater ? 'text-emerald-400' : 'text-red-500'}>
                                                        🧴 {tech.cost.almondWater}
                                                    </span>
                                                    <span className={resources.anomalyParts >= tech.cost.anomalyParts ? 'text-purple-400' : 'text-red-500'}>
                                                        🦠 {tech.cost.anomalyParts}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Tech Inspector Panel (Right Column) */}
                <div className="lg:col-span-4 flex flex-col gap-3 bg-black/90 border-2 border-amber-600 rounded-lg p-4 shadow-[0_0_20px_rgba(217,119,6,0.15)] relative">
                    <div className="flex items-center justify-between border-b border-amber-800 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-base animate-pulse">🔬</span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                Terminal Inspetor M.E.G.
                            </h4>
                        </div>
                        <span className="text-[8px] uppercase bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-700">
                            Protocolo #{(selectedTech?.id || '').toUpperCase().slice(0, 8)}
                        </span>
                    </div>

                    {selectedTech ? (
                        (() => {
                            const isUnlocked = unlockedTechs.includes(selectedTech.id);
                            const isFloorLocked = floor < selectedTech.minFloor;
                            const affordable = canAfford(selectedTech);
                            const meta = TECH_META[selectedTech.id] || { icon: '🔬', category: 'Exploração' };
                            const cfg = ERA_CONFIG[selectedTech.era] || ERA_CONFIG['Era Medieval'];

                            return (
                                <div className="flex flex-col gap-3">
                                    {/* Tech Identity */}
                                    <div className="flex items-start gap-3 bg-amber-950/30 p-2.5 rounded border border-amber-800/60">
                                        <div className="text-3xl p-2 rounded bg-black/80 border border-amber-700/60 flex items-center justify-center shadow-inner">
                                            {meta.icon}
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-black text-amber-300 uppercase">
                                                    {selectedTech.name}
                                                </h3>
                                            </div>
                                            <span className={`text-[9px] font-bold mt-0.5 ${cfg.color}`}>
                                                {selectedTech.era} • {meta.category}
                                            </span>
                                            <span className="text-[9px] text-amber-600 mt-0.5">
                                                Requisito: Andar {selectedTech.minFloor} (Atual: {floor})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description / Lore */}
                                    <div className="bg-black/60 p-2.5 rounded border border-amber-900/60 text-[10px] text-amber-500 leading-relaxed space-y-1">
                                        <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest block">
                                            Registro de Pesquisa:
                                        </span>
                                        <p>{selectedTech.description}</p>
                                    </div>

                                    {/* Global Effect Box */}
                                    <div className="bg-amber-950/40 p-2.5 rounded border border-amber-700/80 text-[10px] space-y-1">
                                        <div className="flex items-center gap-1 text-amber-300 font-bold uppercase text-[9px] tracking-wider">
                                            <Zap size={12} className="text-amber-400" /> Efeito Global Ativo:
                                        </div>
                                        <div className="text-amber-200 font-semibold pl-4">
                                            {selectedTech.effectText}
                                        </div>
                                    </div>

                                    {/* Resource Cost Breakdown */}
                                    <div className="bg-black/80 p-2.5 rounded border border-amber-900/60 flex flex-col gap-2">
                                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                                            Custos de Pesquisa:
                                        </span>

                                        {/* Scrap */}
                                        <div className="flex flex-col gap-0.5 text-[9px]">
                                            <div className="flex justify-between">
                                                <span className="text-amber-400">🔧 Sucata Metálica:</span>
                                                <span className={resources.scrap >= selectedTech.cost.scrap ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                    {resources.scrap} / {selectedTech.cost.scrap}
                                                </span>
                                            </div>
                                            <div className="w-full bg-amber-950 h-1.5 rounded overflow-hidden border border-amber-900">
                                                <div 
                                                    className={`h-full transition-all ${resources.scrap >= selectedTech.cost.scrap ? 'bg-amber-500' : 'bg-red-700'}`}
                                                    style={{ width: `${Math.min(100, (resources.scrap / Math.max(1, selectedTech.cost.scrap)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Almond Water */}
                                        <div className="flex flex-col gap-0.5 text-[9px]">
                                            <div className="flex justify-between">
                                                <span className="text-emerald-400">🧴 Água de Amêndoa:</span>
                                                <span className={resources.almondWater >= selectedTech.cost.almondWater ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                    {resources.almondWater} / {selectedTech.cost.almondWater}
                                                </span>
                                            </div>
                                            <div className="w-full bg-amber-950 h-1.5 rounded overflow-hidden border border-amber-900">
                                                <div 
                                                    className={`h-full transition-all ${resources.almondWater >= selectedTech.cost.almondWater ? 'bg-emerald-500' : 'bg-red-700'}`}
                                                    style={{ width: `${Math.min(100, (resources.almondWater / Math.max(1, selectedTech.cost.almondWater)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Anomaly Parts */}
                                        <div className="flex flex-col gap-0.5 text-[9px]">
                                            <div className="flex justify-between">
                                                <span className="text-purple-400">🦠 Peças de Anomalia:</span>
                                                <span className={resources.anomalyParts >= selectedTech.cost.anomalyParts ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                                    {resources.anomalyParts} / {selectedTech.cost.anomalyParts}
                                                </span>
                                            </div>
                                            <div className="w-full bg-amber-950 h-1.5 rounded overflow-hidden border border-amber-900">
                                                <div 
                                                    className={`h-full transition-all ${resources.anomalyParts >= selectedTech.cost.anomalyParts ? 'bg-purple-500' : 'bg-red-700'}`}
                                                    style={{ width: `${Math.min(100, (resources.anomalyParts / Math.max(1, selectedTech.cost.anomalyParts)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-1">
                                        {isUnlocked ? (
                                            <div className="w-full py-2.5 px-4 rounded border border-emerald-500 bg-emerald-950/40 text-emerald-300 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                                                <CheckCircle2 size={16} /> Pesquisa Concluída & Ativa
                                            </div>
                                        ) : isFloorLocked ? (
                                            <div className="w-full py-2.5 px-4 rounded border border-red-900 bg-red-950/30 text-red-400 font-bold text-xs uppercase flex items-center justify-center gap-2 text-center">
                                                <Lock size={14} /> Bloqueado: Alcance o Andar {selectedTech.minFloor}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => onResearchTech(selectedTech.id)}
                                                disabled={!affordable}
                                                className={`w-full py-2.5 px-4 rounded text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                                                    affordable
                                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95'
                                                        : 'bg-black text-amber-800 border border-amber-955 cursor-not-allowed'
                                                }`}
                                            >
                                                <Zap size={14} /> Iniciar Pesquisa
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="py-8 text-center text-xs text-amber-750 italic">
                            Selecione uma tecnologia para inspecionar seus parâmetros.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
