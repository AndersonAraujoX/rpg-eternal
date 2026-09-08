import React, { useState, useEffect } from 'react';
import { 
    X, Heart, Shield, RefreshCw, HardHat, Eye, Wrench, Thermometer, UserPlus, Compass,
    Zap, Award, Activity, Radio, AlertTriangle, Skull, CheckCircle2, ChevronRight,
    Sparkles, Flame, BatteryCharging, Tv, ZoomIn, ZoomOut, Maximize2, ShieldAlert,
    Layers, Globe, Binary, Lock, Unlock, ArrowUpRight, Radar
} from 'lucide-react';
import type { 
    BackroomsExplorer, BackroomsOutpost, BackroomsResources, ContainedEntity, SectorModules, NoclipEvent 
} from '../../engine/backrooms';
import { 
    BACKROOMS_LEVELS, BACKROOMS_ENTITIES, NOCLIP_LEVELS, EXPLORER_TALENTS, 
    getTransitionBoss, isSectorStabilized 
} from '../../engine/backrooms';
import { NpcInstructorWidget } from '../NpcInstructorWidget';
import { BackroomsTechTree } from '../backrooms/BackroomsTechTree';
import { BackroomsMilestones } from '../backrooms/BackroomsMilestones';

interface BackroomsManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    explorers: BackroomsExplorer[];
    outpost: BackroomsOutpost;
    resources: BackroomsResources;
    logs: string[];
    unlockedTechs?: string[];
    floor: number;
    floorProgress: number;
    bossHp: number | null;
    containedEntities?: ContainedEntity[];
    sectorModules?: Record<string, SectorModules>;
    activeNoclipEvent?: NoclipEvent | null;
    dimensionalInstability?: number;
    heroPower?: number;
    actions: {
        recruitExplorer: () => void;
        sendExplorer: (explorerId: string, levelId: string) => void;
        recallExplorer: (explorerId: string) => void;
        restExplorer: (explorerId: string) => void;
        useAlmondWater: (explorerId: string) => void;
        upgradeOutpost: (upgradeId: keyof BackroomsOutpost) => void;
        craftGear: (explorerId: string, gearType: 'flashlight' | 'suit' | 'tracker') => void;
        researchTech?: (techId: string) => void;
        captureEntity?: (entityId: string) => boolean | void;
        resolveNoclip?: (choice: 'enter' | 'ignore') => void;
        upgradeSectorModule?: (sectorId: string, moduleType: keyof SectorModules) => boolean | void;
        sealDimensionalRift?: (method: 'scrap' | 'heroCombat') => boolean | void;
        unlockExplorerTalent?: (explorerId: string, talentId: string) => boolean | void;
    };
    currentTutorialIndex?: number;
}

export const BackroomsManagerModal: React.FC<BackroomsManagerModalProps> = ({
    isOpen, onClose, explorers, outpost, resources, logs, unlockedTechs = [],
    floor, floorProgress, bossHp, containedEntities = [], sectorModules = {},
    activeNoclipEvent = null, dimensionalInstability = 0, heroPower = 50,
    actions, currentTutorialIndex
}) => {
    const [selectedLevelForExp, setSelectedLevelForExp] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'exploradores' | 'entidades' | 'conquista' | 'noclip' | 'instabilidade' | 'techTree' | 'marcos'>('exploradores');
    const [enableCrt, setEnableCrt] = useState<boolean>(true);
    const [selectedTalentsExplorerId, setSelectedTalentsExplorerId] = useState<string | null>(null);

    // Support ESC key to exit Backrooms
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const transitionBoss = getTransitionBoss(floor);

    return (
        <div 
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
        >
            {/* Main Terminal Container */}
            <div 
                className="bg-slate-950 border-2 sm:border-4 border-amber-600 rounded-xl shadow-[0_0_50px_rgba(217,119,6,0.35)] relative text-amber-500 flex flex-col font-mono w-full max-w-6xl h-[92vh] max-h-[92vh] my-auto overflow-hidden animate-fade-in"
            >
                {/* CRT Scanline Effect */}
                {enableCrt && (
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.22)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[size:100%_4px,6px_100%] opacity-40 z-50" />
                )}

                {/* Fixed Top Header Bar */}
                <div className="bg-gradient-to-r from-amber-950/90 via-stone-900/95 to-amber-950/90 px-3 sm:px-4 py-2 sm:py-2.5 border-b-2 sm:border-b-4 border-amber-600 flex flex-wrap justify-between items-center gap-2 shrink-0 z-30 shadow-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-950 border border-amber-500 flex items-center justify-center text-sm sm:text-base shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                            🏢
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
                                    Terminal M.E.G. V2.0 - Matriz de Operações
                                </h2>
                                <span className="text-[9px] bg-red-950/80 text-red-400 border border-red-800 px-1.5 py-0.2 rounded uppercase font-bold animate-pulse">
                                    Classificado
                                </span>
                            </div>
                            <span className="text-[9px] text-amber-600 font-bold hidden sm:inline">
                                Major Explorer Group • Bestiário • Conquista • Fendas Dimensionais
                            </span>
                        </div>
                    </div>

                    {/* Resources & Status Display */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex gap-1.5 text-xs font-bold flex-wrap">
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-amber-600 text-amber-400 flex items-center gap-1 text-[11px]" title="Sucata Metálica">
                                🔧 <span className="text-white font-black">{resources.scrap}</span>
                            </span>
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-emerald-600 text-emerald-400 flex items-center gap-1 text-[11px]" title="Água de Amêndoa">
                                🧴 <span className="text-white font-black">{resources.almondWater}</span>
                            </span>
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-purple-600 text-purple-400 flex items-center gap-1 text-[11px]" title="Peças de Anomalia">
                                🦠 <span className="text-white font-black">{resources.anomalyParts}</span>
                            </span>
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-cyan-500 text-cyan-300 flex items-center gap-1 text-[11px]" title="Fluido Liminar (Recurso Exótico)">
                                🧪 <span className="text-white font-black">{resources.liminalFluid || 0}</span>
                            </span>
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-indigo-500 text-indigo-300 flex items-center gap-1 text-[11px]" title="Liga do Vazio (Recurso Cósmico)">
                                🌌 <span className="text-white font-black">{resources.voidAlloy || 0}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded border flex items-center gap-1 text-[11px] font-mono ${
                                dimensionalInstability >= 80 
                                    ? 'bg-red-950/80 border-red-600 text-red-300 animate-pulse' 
                                    : dimensionalInstability >= 40 
                                        ? 'bg-amber-950/80 border-amber-600 text-amber-300' 
                                        : 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                            }`} title="Instabilidade da Membrana Dimensional (0% = Perfeita, 100% = Invasão Iminente)">
                                ⚡ Instabilidade: <strong className="text-white font-black">{dimensionalInstability.toFixed(0)}%</strong>
                            </span>
                        </div>

                        {/* CRT Effect Toggle Button */}
                        <button 
                            onClick={() => setEnableCrt(prev => !prev)}
                            className={`p-1 sm:px-2 sm:py-1 rounded border text-[9px] flex items-center gap-1 transition-all ${
                                enableCrt ? 'bg-amber-950 text-amber-300 border-amber-600' : 'bg-black/40 text-stone-600 border-stone-800'
                            }`}
                            title="Alternar efeito de monitor CRT"
                        >
                            <Tv size={13} />
                            <span className="hidden md:inline">CRT</span>
                        </button>

                        {/* Exit Button */}
                        <button 
                            onClick={onClose} 
                            className="bg-red-600 hover:bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg border-2 border-red-400 hover:border-white cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5 text-xs font-black tracking-wider active:scale-95 uppercase transition-all shrink-0"
                            title="Fechar Terminal (ESC)"
                        >
                            <X size={16} className="stroke-[3] text-white" />
                            <span>FECHAR</span>
                            <span className="text-[9px] bg-red-950/80 px-1 py-0.2 rounded text-red-200 border border-red-800 font-mono">ESC</span>
                        </button>
                    </div>
                </div>

                {/* Fixed Terminal Navigation Tabs */}
                <div className="bg-black/95 px-3 md:px-4 py-1.5 border-b border-amber-800 flex flex-wrap justify-between items-center gap-2 text-[10px] md:text-xs font-bold shrink-0 z-20 overflow-x-auto">
                    <div className="flex flex-wrap gap-1 md:gap-1.5">
                        <button
                            onClick={() => setActiveTab('exploradores')}
                            className={`px-2.5 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1 ${
                                activeTab === 'exploradores'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Radio size={12} /> [01] ESQUADRÃO ({explorers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('entidades')}
                            className={`px-2.5 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1 ${
                                activeTab === 'entidades'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Skull size={12} /> [02] BESTIÁRIO ({containedEntities.length}/6)
                        </button>
                        <button
                            onClick={() => setActiveTab('conquista')}
                            className={`px-2.5 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1 ${
                                activeTab === 'conquista'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Layers size={12} /> [03] FORTIFICAÇÕES
                        </button>
                        <button
                            onClick={() => setActiveTab('noclip')}
                            className={`px-2.5 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1 ${
                                activeTab === 'noclip'
                                    ? 'bg-cyan-500 text-black border-cyan-300 font-black shadow-md'
                                    : 'bg-transparent text-cyan-500 border-cyan-950 hover:border-cyan-800'
                            }`}
                        >
                            <Globe size={12} /> [04] SALAS SECRETAS {activeNoclipEvent ? '🌀' : ''}
                        </button>
                        <button
                            onClick={() => setActiveTab('instabilidade')}
                            className={`px-2.5 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1 ${
                                activeTab === 'instabilidade'
                                    ? 'bg-red-600 text-white border-red-300 font-black shadow-md'
                                    : 'bg-transparent text-red-400 border-red-950 hover:border-red-800'
                            }`}
                        >
                            <AlertTriangle size={12} /> [05] FENDAS & VILA
                        </button>
                        <button
                            onClick={() => setActiveTab('techTree')}
                            className={`px-2.5 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1 ${
                                activeTab === 'techTree'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Zap size={12} /> [06] TECH TREE
                        </button>
                        <button
                            onClick={() => setActiveTab('marcos')}
                            className={`px-2.5 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1 ${
                                activeTab === 'marcos'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Award size={12} /> [07] MARCOS
                        </button>
                    </div>

                    {/* Status: Depth & Progress */}
                    <div className="flex items-center gap-2 text-[10px] md:text-xs">
                        <span className="text-amber-400 font-bold uppercase">Andar:</span>
                        <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700 text-amber-300 font-black text-[11px]">
                            {floor}/100
                        </span>
                        <div className="w-24 sm:w-32 bg-black/80 h-3 border border-amber-800 rounded-full overflow-hidden relative p-0.5">
                            <div 
                                className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, floorProgress)}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-amber-100 font-black drop-shadow">
                                {floorProgress.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body Container */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll bg-black flex flex-col z-10">
                    
                    {/* Active Noclip Event Pulsing Alert Banner */}
                    {activeNoclipEvent && (
                        <div className="bg-cyan-950/70 border-b-2 border-cyan-400 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-cyan-200 animate-pulse z-20">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🌀</span>
                                <div>
                                    <div className="font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                                        EVENTO DE NOCLIP EM ANDAMENTO!
                                    </div>
                                    <div className="text-[11px] text-cyan-300">
                                        Uma falha na matriz revelou acesso imediato a: 
                                        <strong className="text-white ml-1">
                                            {NOCLIP_LEVELS.find(l => l.id === activeNoclipEvent.secretLevelId)?.name || 'Sala Secreta'}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button 
                                    onClick={() => actions.resolveNoclip && actions.resolveNoclip('enter')}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-3 py-1.5 rounded font-black text-xs uppercase cursor-pointer transition-all shadow-[0_0_10px_rgba(6,182,212,0.6)] active:scale-95"
                                >
                                    🚪 Entrar na Sala Secreta
                                </button>
                                <button 
                                    onClick={() => actions.resolveNoclip && actions.resolveNoclip('ignore')}
                                    className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded font-bold text-xs uppercase cursor-pointer active:scale-95"
                                >
                                    ✖ Ignorar e Selar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Critical Dimensional Rift Warning Banner */}
                    {dimensionalInstability >= 80 && (
                        <div className="bg-red-950/80 border-b-2 border-red-500 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-red-200 animate-pulse z-20">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={22} className="text-red-400 animate-bounce shrink-0" />
                                <div>
                                    <div className="font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                                        🚨 ALERTA: INVASÃO DE FENDA NA VILA IMINENTE!
                                    </div>
                                    <div className="text-[11px] text-red-300">
                                        Instabilidade dimensional em {dimensionalInstability.toFixed(0)}%. Entidades liminares estão prestes a romper a membrana e atacar a superfície!
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0 flex-wrap">
                                <button 
                                    onClick={() => actions.sealDimensionalRift && actions.sealDimensionalRift('scrap')}
                                    disabled={resources.scrap < 50 || resources.almondWater < 2}
                                    className={`px-3 py-1.5 rounded font-black text-xs uppercase flex items-center gap-1 transition-all ${
                                        resources.scrap >= 50 && resources.almondWater >= 2
                                            ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                            : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
                                    }`}
                                    title="Gasta 50 Sucatas e 2 Águas de Amêndoa (-35% instabilidade)"
                                >
                                    🔧 Âncora de Sucata (-35%)
                                </button>
                                <button 
                                    onClick={() => actions.sealDimensionalRift && actions.sealDimensionalRift('heroCombat')}
                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded font-black text-xs uppercase cursor-pointer flex items-center gap-1 shadow-[0_0_12px_rgba(239,68,68,0.7)] active:scale-95"
                                    title="Envia heróis para derrotar os monstros da fenda (-50% instabilidade, concede Peças e Liga do Vazio)"
                                >
                                    ⚔️ Patrulha Militar (-50%)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Boss Battle Conflict Banner */}
                    {bossHp !== null && transitionBoss && (
                        <div className="bg-red-950/30 border-b-2 border-red-700 p-3 flex flex-col gap-2 z-10 font-mono text-[10px] md:text-xs text-red-400 animate-pulse">
                            <div className="flex justify-between items-center font-bold">
                                <span className="flex items-center gap-1.5 text-red-300 font-black">
                                    <Skull size={14} className="animate-bounce" /> CONFLITO ATIVO: Chefe de Transição (Andar {floor})
                                </span>
                                <span className="px-2 py-0.5 border border-red-700 bg-red-950/80 text-[9px] rounded uppercase font-black">
                                    Bloqueio de Setor
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="font-black text-red-200 flex items-center gap-1.5">
                                    <span>{transitionBoss.emoji}</span>
                                    <span>{transitionBoss.name}</span>
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-[10px] font-bold">HP:</span>
                                    <div className="flex-1 bg-black/80 h-3.5 border border-red-700 rounded-full overflow-hidden relative p-0.5">
                                        <div 
                                            className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full transition-all duration-300"
                                            style={{ width: `${Math.max(0, (bossHp / transitionBoss.maxHp) * 100)}%` }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-black drop-shadow">
                                            {bossHp} / {transitionBoss.maxHp}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NPC Tutorial Widget */}
                    {currentTutorialIndex !== undefined && (
                        <NpcInstructorWidget currentTutorialIndex={currentTutorialIndex} />
                    )}

                    {/* TAB 1: Exploradores & Esquadrão */}
                    {activeTab === 'exploradores' && (
                        <div className="p-3 md:p-4 flex flex-col lg:flex-row gap-4 animate-fade-in">
                            {/* Column 1: Recruitment & Explorers list */}
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Recruitment */}
                                    <div className="border-2 border-amber-700/60 bg-amber-950/10 p-3 rounded-lg flex flex-col gap-2 shadow-sm">
                                        <div className="flex justify-between items-center border-b border-amber-800 pb-1">
                                            <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1">
                                                <UserPlus size={13} /> Recrutamento
                                            </h3>
                                            <span className="text-[9px] text-amber-600">MEG Squad</span>
                                        </div>
                                        <p className="text-[10px] text-amber-650 leading-tight">
                                            Contrate agentes (Scout, Scientist, Soldier). Eles ganham XP e talentos exclusivos em campo.
                                        </p>
                                        <button
                                            onClick={actions.recruitExplorer}
                                            disabled={resources.scrap < 15}
                                            className={`mt-auto px-3 py-2 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                                                resources.scrap >= 15 
                                                ? 'bg-amber-600 border-amber-400 text-black hover:bg-amber-500 cursor-pointer active:scale-95' 
                                                : 'bg-black text-amber-800 border-amber-900 cursor-not-allowed'
                                            }`}
                                        >
                                            <UserPlus size={14} /> Recrutar Agente (🔧 15)
                                        </button>
                                    </div>

                                    {/* Infrastructure */}
                                    <div className="border-2 border-amber-700/60 bg-amber-950/10 p-3 rounded-lg flex flex-col gap-2 shadow-sm">
                                        <div className="flex justify-between items-center border-b border-amber-800 pb-1">
                                            <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1">
                                                <Wrench size={13} /> Instalações do Posto
                                            </h3>
                                            <span className="text-[9px] text-amber-600">M.E.G. Base</span>
                                        </div>
                                        <div className="flex flex-col gap-2 text-[10px]">
                                            <div className="flex justify-between items-center bg-black/50 p-1.5 rounded border border-amber-900/60">
                                                <span>🧴 Refinaria (Nv {outpost.refinery})</span>
                                                <button 
                                                    onClick={() => actions.upgradeOutpost('refinery')}
                                                    disabled={resources.scrap < (outpost.refinery + 1) * 20 || resources.anomalyParts < outpost.refinery * 2}
                                                    className="px-2 py-1 rounded border border-amber-600 bg-amber-950/60 text-amber-300 text-[9px] hover:bg-amber-900 disabled:opacity-50 font-bold"
                                                >
                                                    🔧{(outpost.refinery + 1) * 20} 🦠{outpost.refinery * 2}
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center bg-black/50 p-1.5 rounded border border-amber-900/60">
                                                <span>⛺ Dormitórios (Nv {outpost.quarters})</span>
                                                <button 
                                                    onClick={() => actions.upgradeOutpost('quarters')}
                                                    disabled={resources.scrap < (outpost.quarters + 1) * 20 || resources.anomalyParts < outpost.quarters * 2}
                                                    className="px-2 py-1 rounded border border-amber-600 bg-amber-950/60 text-amber-300 text-[9px] hover:bg-amber-900 disabled:opacity-50 font-bold"
                                                >
                                                    🔧{(outpost.quarters + 1) * 20} 🦠{outpost.quarters * 2}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Explorers List */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center border-b border-amber-700/60 pb-1">
                                        <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                                            <Radio size={13} /> Agentes do Esquadrão ({explorers.length})
                                        </h3>
                                        <span className="text-[9px] text-amber-600">Nível & Talentos Ativos</span>
                                    </div>
                                    
                                    {explorers.length === 0 ? (
                                        <div className="text-center py-6 text-xs text-amber-800 border border-dashed border-amber-900/60 rounded-lg">
                                            Nenhum explorador contratado. Recrute agentes no painel acima!
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 max-h-[44vh] overflow-y-auto pr-1 custom-scroll">
                                            {explorers.map(exp => {
                                                const isLost = exp.status === 'lost';
                                                const lvlSelected = selectedLevelForExp[exp.id] || (BACKROOMS_LEVELS[0]?.id || '');
                                                const expLevel = exp.level || 1;
                                                const nextXp = expLevel * 100;
                                                const currentXp = Math.floor(exp.xp || 0);
                                                const isTalentExpanded = selectedTalentsExplorerId === exp.id;
                                                const classTalents = EXPLORER_TALENTS.filter(t => t.classType === exp.classType);

                                                return (
                                                    <div 
                                                        key={exp.id} 
                                                        className={`border-2 p-3 rounded-lg flex flex-col gap-2 bg-slate-950 transition-all ${
                                                            isLost ? 'border-red-900 opacity-50 bg-red-950/5' : 'border-amber-850 hover:border-amber-600 shadow-sm'
                                                        }`}
                                                    >
                                                        {/* Header Line */}
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-bold flex items-center gap-1.5">
                                                                <span className="text-lg">{exp.emoji}</span>
                                                                <span className="text-amber-300 font-bold">{exp.name}</span>
                                                                <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold border border-amber-800">
                                                                    {exp.classType}
                                                                </span>
                                                                <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-black border border-indigo-700">
                                                                    Nv. {expLevel}
                                                                </span>
                                                            </span>
                                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                                                                exp.status === 'exploring' ? 'bg-cyan-950 text-cyan-400 border-cyan-700 animate-pulse' :
                                                                exp.status === 'resting' ? 'bg-emerald-950 text-emerald-400 border-emerald-700' :
                                                                exp.status === 'lost' ? 'bg-red-950 text-red-500 border-red-800 font-black' : 'bg-black text-amber-600 border-amber-900'
                                                            }`}>
                                                                {exp.status === 'lost' ? '💀 Perdido' : exp.status === 'exploring' ? '🧭 Explorando' : exp.status === 'resting' ? '⛺ Descansando' : '⏸️ Ocioso'}
                                                            </span>
                                                        </div>

                                                        {/* XP Progress Bar */}
                                                        {!isLost && (
                                                            <div className="flex items-center gap-2 text-[9px] font-mono text-indigo-300">
                                                                <span>XP:</span>
                                                                <div className="flex-1 bg-black h-2 rounded-full overflow-hidden border border-indigo-900 p-0.5">
                                                                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (currentXp / nextXp) * 100)}%` }} />
                                                                </div>
                                                                <span>{currentXp}/{nextXp}</span>
                                                            </div>
                                                        )}

                                                        {/* HP & Sanity Bars */}
                                                        {!isLost && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex justify-between text-red-400 font-bold">
                                                                        <span>HP: {Math.ceil(exp.hp)}/{exp.maxHp}</span>
                                                                        <span>{Math.round((exp.hp / exp.maxHp) * 100)}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-red-900 p-0.5">
                                                                        <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${(exp.hp / exp.maxHp) * 100}%` }} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-0.5">
                                                                    <div className="flex justify-between text-cyan-400 font-bold">
                                                                        <span>Sanidade: {Math.ceil(exp.sanity)}/{exp.maxSanity}</span>
                                                                        <span>{Math.round((exp.sanity / exp.maxSanity) * 100)}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-cyan-900 p-0.5">
                                                                        <div className="bg-cyan-500 h-full rounded-full transition-all duration-300" style={{ width: `${(exp.sanity / exp.maxSanity) * 100}%` }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Gear bar & Talents Button */}
                                                        {!isLost && (
                                                            <div className="flex flex-wrap items-center justify-between gap-2 bg-black/60 p-2 rounded border border-amber-900/50 text-[9px] font-mono">
                                                                <div className="flex gap-3">
                                                                    <span>🔦 L.{exp.equipment.flashlight}/3</span>
                                                                    <span>🛡️ L.{exp.equipment.suit}/3</span>
                                                                    <span>📡 L.{exp.equipment.tracker}/3</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => setSelectedTalentsExplorerId(isTalentExpanded ? null : exp.id)}
                                                                    className="px-2 py-0.5 rounded border border-amber-500 bg-amber-950 text-amber-300 font-bold hover:bg-amber-900 flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    <Sparkles size={11} /> {isTalentExpanded ? 'Fechar Talentos' : `Talentos (${(exp.talents || []).length}/3)`}
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Expandable Talent Tree Section */}
                                                        {!isLost && isTalentExpanded && (
                                                            <div className="bg-black/90 p-2.5 rounded border border-amber-600/70 flex flex-col gap-2 animate-fade-in text-[10px]">
                                                                <div className="text-[10px] font-bold text-amber-400 uppercase border-b border-amber-900 pb-1 flex justify-between">
                                                                    <span>Árvore de Especialização • {exp.classType.toUpperCase()}</span>
                                                                    <span className="text-amber-500">Nível do Agente: {expLevel}</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                                    {classTalents.map(tal => {
                                                                        const isUnlocked = (exp.talents || []).includes(tal.id);
                                                                        const canUnlock = expLevel >= tal.requiredLevel && !isUnlocked;

                                                                        return (
                                                                            <div key={tal.id} className={`p-2 rounded border flex flex-col justify-between gap-1.5 ${
                                                                                isUnlocked 
                                                                                    ? 'border-emerald-600 bg-emerald-950/20 text-emerald-200' 
                                                                                    : canUnlock 
                                                                                        ? 'border-amber-600 bg-amber-950/30 text-amber-200' 
                                                                                        : 'border-stone-800 bg-stone-950 text-stone-600 opacity-60'
                                                                            }`}>
                                                                                <div>
                                                                                    <div className="font-bold text-[10px] flex items-center justify-between">
                                                                                        <span>{tal.name}</span>
                                                                                        <span className="text-[8px]">{tal.icon || '⚡'}</span>
                                                                                    </div>
                                                                                    <p className="text-[9px] leading-tight text-stone-300 mt-1">{tal.description}</p>
                                                                                </div>
                                                                                <div className="mt-1">
                                                                                    {isUnlocked ? (
                                                                                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                                                                            <CheckCircle2 size={11} /> Desbloqueado
                                                                                        </span>
                                                                                    ) : (
                                                                                        <button
                                                                                            onClick={() => actions.unlockExplorerTalent && actions.unlockExplorerTalent(exp.id, tal.id)}
                                                                                            disabled={!canUnlock}
                                                                                            className={`w-full py-1 rounded text-[9px] font-bold uppercase border transition-all ${
                                                                                                canUnlock 
                                                                                                    ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-400 cursor-pointer' 
                                                                                                    : 'bg-black text-stone-700 border-stone-800 cursor-not-allowed'
                                                                                            }`}
                                                                                        >
                                                                                            {expLevel < tal.requiredLevel ? `Requer Nv. ${tal.requiredLevel}` : 'Desbloquear'}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Actions buttons */}
                                                        {!isLost && (
                                                            <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
                                                                {exp.status === 'idle' && (
                                                                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                                                        <select
                                                                            value={lvlSelected}
                                                                            onChange={(e) => setSelectedLevelForExp(prev => ({ ...prev, [exp.id]: e.target.value }))}
                                                                            className="bg-black border border-amber-700 text-amber-400 rounded p-1 text-[10px] focus:outline-none"
                                                                        >
                                                                            {BACKROOMS_LEVELS.map(l => (
                                                                                <option key={l.id} value={l.id}>{l.name} ({l.dangerLevel})</option>
                                                                            ))}
                                                                        </select>
                                                                        <button
                                                                            onClick={() => actions.sendExplorer(exp.id, lvlSelected)}
                                                                            className="bg-amber-600 text-black border border-amber-400 hover:bg-amber-500 px-3 py-1 rounded font-black cursor-pointer shadow-sm"
                                                                        >
                                                                            Explorar
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {exp.status === 'exploring' && (
                                                                    <button
                                                                        onClick={() => actions.recallExplorer(exp.id)}
                                                                        className="bg-black border border-cyan-500 text-cyan-400 hover:bg-cyan-950 px-3 py-1 rounded text-[10px] font-bold cursor-pointer"
                                                                    >
                                                                        Chamar de Volta
                                                                    </button>
                                                                )}

                                                                {exp.status === 'resting' && (
                                                                    <button
                                                                        onClick={() => actions.recallExplorer(exp.id)}
                                                                        className="bg-black border border-emerald-500 text-emerald-400 hover:bg-emerald-950 px-3 py-1 rounded text-[10px] font-bold cursor-pointer"
                                                                    >
                                                                        Despertar Agente
                                                                    </button>
                                                                )}

                                                                {exp.status === 'idle' && (
                                                                    <button
                                                                        onClick={() => actions.restExplorer(exp.id)}
                                                                        className="bg-amber-950/40 border border-emerald-600 text-emerald-400 hover:bg-emerald-950 px-3 py-1 rounded text-[10px] font-bold cursor-pointer"
                                                                    >
                                                                        Mandar Descansar
                                                                    </button>
                                                                )}

                                                                {exp.sanity < exp.maxSanity && resources.almondWater >= 1 && (
                                                                    <button
                                                                        onClick={() => actions.useAlmondWater(exp.id)}
                                                                        className="bg-black border border-blue-500 text-blue-400 hover:bg-blue-950 px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                                                    >
                                                                        🧴 Beber Almond Water
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Live feed log & Levels description */}
                            <div className="w-full md:w-80 flex flex-col gap-4">
                                <div className="border-2 border-amber-600 bg-black rounded-lg p-3 flex flex-col gap-2 h-64 md:h-[42vh] shadow-inner">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-amber-400 border-b border-amber-800 pb-1">
                                        <span className="flex items-center gap-1.5">
                                            <Radio size={12} className="text-amber-500" /> LIVE RADAR FEED
                                        </span>
                                        <span className="animate-pulse flex items-center gap-1 text-emerald-400">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> ONLINE
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-1 text-[9px] font-mono leading-tight pr-1 custom-scroll">
                                        {logs.length === 0 ? (
                                            <div className="text-amber-850 italic">Nenhum sinal detectado...</div>
                                        ) : (
                                            logs.map((log, idx) => (
                                                <div key={idx} className={`p-1 rounded ${
                                                    log.includes('⚠️') || log.includes('PERIGO') || log.includes('💀') ? 'text-red-400 bg-red-950/20' :
                                                    log.includes('🛡️') || log.includes('🧭') ? 'text-cyan-400 bg-cyan-950/10' :
                                                    log.includes('🧴') || log.includes('⛺') ? 'text-emerald-400 bg-emerald-950/10' : 'text-amber-500'
                                                }`}>
                                                    {log}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="border border-amber-800/80 bg-amber-950/10 p-3 rounded-lg flex flex-col gap-2 text-[10px] text-amber-600 shadow-sm">
                                    <div className="font-bold text-amber-400 flex items-center gap-1 uppercase border-b border-amber-900 pb-1">
                                        <Compass size={13} /> Setores Liminares Conhecidos
                                    </div>
                                    <div className="flex flex-col gap-2 max-h-[22vh] overflow-y-auto pr-1 custom-scroll">
                                        {BACKROOMS_LEVELS.map(lvl => (
                                            <div key={lvl.id} className="border-b border-amber-950 pb-1.5 flex flex-col gap-0.5">
                                                <div className="font-bold text-amber-400 flex justify-between">
                                                    <span>{lvl.emoji} {lvl.name}</span>
                                                    <span className={`text-[8px] uppercase px-1.5 py-0.2 border rounded font-bold ${
                                                        lvl.dangerLevel === 'deadly' ? 'bg-red-950 text-red-400 border-red-800' :
                                                        lvl.dangerLevel === 'high' ? 'bg-orange-950 text-orange-400 border-orange-800' :
                                                        'bg-amber-950 text-amber-400 border-amber-800'
                                                    }`}>
                                                        {lvl.dangerLevel}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] leading-relaxed text-amber-650">{lvl.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Bestiário & Câmaras de Contenção */}
                    {activeTab === 'entidades' && (
                        <div className="p-3 md:p-4 flex flex-col gap-4 animate-fade-in">
                            <div className="border-b border-amber-800 pb-2 flex justify-between items-center flex-wrap gap-2">
                                <div>
                                    <h3 className="text-sm font-black uppercase text-amber-300 flex items-center gap-2">
                                        <Skull size={16} /> Câmaras de Contenção & Bestiário M.E.G.
                                    </h3>
                                    <p className="text-[11px] text-amber-600">
                                        Isole e contenha anomalias liminares icônicas. Entidades contidas geram sinergias ativas na Indústria, na Vila e na Galáxia.
                                    </p>
                                </div>
                                <div className="text-xs bg-amber-950/80 px-3 py-1 rounded border border-amber-700 text-amber-300 font-bold">
                                    Contidas: <strong className="text-white">{containedEntities.length}</strong> / {BACKROOMS_ENTITIES.length}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {BACKROOMS_ENTITIES.map(entity => {
                                    const isContained = containedEntities.some(e => (e.entityId || e.id) === entity.id);
                                    const cost = entity.captureCost;
                                    const canAfford = 
                                        resources.almondWater >= cost.almondWater &&
                                        resources.anomalyParts >= cost.anomalyParts &&
                                        (!cost.liminalFluid || (resources.liminalFluid || 0) >= cost.liminalFluid);

                                    return (
                                        <div 
                                            key={entity.id} 
                                            className={`border-2 p-3 rounded-lg flex flex-col justify-between gap-3 transition-all ${
                                                isContained 
                                                    ? 'border-emerald-500 bg-emerald-950/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                                    : 'border-amber-800/80 bg-black/60 hover:border-amber-600'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{entity.emoji}</span>
                                                        <div>
                                                            <h4 className="font-black text-xs text-amber-200">{entity.name}</h4>
                                                            <span className="text-[9px] text-stone-400 font-mono">ID: {entity.id}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-black border ${
                                                        (entity.threat || entity.danger) === 'extreme' || (entity.threat || entity.danger) === 'deadly' ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' :
                                                        (entity.threat || entity.danger) === 'high' ? 'bg-orange-950 text-orange-400 border-orange-800' :
                                                        'bg-amber-950 text-amber-400 border-amber-800'
                                                    }`}>
                                                        Ameaça: {entity.threat || entity.danger}
                                                    </span>
                                                </div>

                                                <p className="text-[10px] text-stone-300 leading-relaxed italic border-l-2 border-amber-700/60 pl-2">
                                                    "{entity.description}"
                                                </p>

                                                <div className="bg-black/80 p-2 rounded border border-amber-900/60 flex flex-col gap-1 text-[10px]">
                                                    <span className="text-[9px] uppercase font-bold text-amber-400 flex items-center gap-1">
                                                        <Sparkles size={11} /> Sinergia Ativa:
                                                    </span>
                                                    <span className="text-emerald-300 font-medium leading-tight">
                                                        {entity.synergyEffect || entity.synergyBonusText}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="border-t border-amber-950 pt-2 flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-[10px] text-stone-400">
                                                    <span>Custo de Contenção:</span>
                                                    <div className="flex gap-1.5 font-bold">
                                                        <span className="text-emerald-400">🧴 {cost.almondWater}</span>
                                                        <span className="text-purple-400">🦠 {cost.anomalyParts}</span>
                                                        {cost.liminalFluid ? <span className="text-cyan-400">🧪 {cost.liminalFluid}</span> : null}
                                                    </div>
                                                </div>

                                                {isContained ? (
                                                    <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 py-1.5 rounded text-center text-xs font-black flex items-center justify-center gap-1.5">
                                                        <CheckCircle2 size={14} className="text-emerald-400" /> CÂMARA ATIVA & OPERACIONAL
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => actions.captureEntity && actions.captureEntity(entity.id)}
                                                        disabled={!canAfford}
                                                        className={`w-full py-1.5 rounded text-xs font-black uppercase border transition-all flex items-center justify-center gap-1.5 ${
                                                            canAfford 
                                                                ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-400 cursor-pointer shadow-sm active:scale-95' 
                                                                : 'bg-black text-stone-700 border-stone-800 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <Lock size={12} /> Conter Entidade
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: Conquista de Andares & Fortificações */}
                    {activeTab === 'conquista' && (
                        <div className="p-3 md:p-4 flex flex-col gap-4 animate-fade-in">
                            <div className="border-b border-amber-800 pb-2">
                                <h3 className="text-sm font-black uppercase text-amber-300 flex items-center gap-2">
                                    <Layers size={16} /> Fortificação & Conquista de Setores
                                </h3>
                                <p className="text-[11px] text-amber-600">
                                    Instale módulos de defesa e apoio nos setores liminares. Setores com 100% de progresso e módulos operam como postos fortificados.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {BACKROOMS_LEVELS.map(lvl => {
                                    const mods = sectorModules[lvl.id] || { radioTower: 0, waterCondenser: 0, scrapBeacon: 0 };
                                    const stabilized = isSectorStabilized(lvl.id, sectorModules);

                                    return (
                                        <div key={lvl.id} className="border-2 border-amber-800/80 bg-slate-950 p-3 rounded-lg flex flex-col gap-3 shadow-sm">
                                            <div className="flex justify-between items-center border-b border-amber-900 pb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{lvl.emoji}</span>
                                                    <div>
                                                        <h4 className="font-bold text-xs text-amber-300">{lvl.name}</h4>
                                                        <span className="text-[9px] text-stone-500">Perigo: {lvl.dangerLevel}</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                                    stabilized 
                                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600 animate-pulse' 
                                                        : 'bg-black text-stone-600 border-stone-800'
                                                }`}>
                                                    {stabilized ? '🛡️ Setor Conquistado' : '⚙️ Operação Inicial'}
                                                </span>
                                            </div>

                                            {/* Modules List */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                                                {/* Radio Tower */}
                                                <div className="bg-black/70 p-2 rounded border border-amber-900/60 flex flex-col justify-between gap-1.5">
                                                    <div>
                                                        <div className="font-bold text-amber-300 flex items-center justify-between">
                                                            <span>📡 Rádio SOS</span>
                                                            <span className="text-amber-500 font-mono">Nv.{mods.radioTower}/3</span>
                                                        </div>
                                                        <p className="text-[9px] text-stone-400 mt-0.5">Evita perdição/morte de agentes no setor.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => actions.upgradeSectorModule && actions.upgradeSectorModule(lvl.id, 'radioTower')}
                                                        disabled={mods.radioTower >= 3 || resources.scrap < 50 * (mods.radioTower + 1)}
                                                        className="w-full py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-[9px] text-amber-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {mods.radioTower >= 3 ? 'MAX' : `🔧${50 * (mods.radioTower + 1)}`}
                                                    </button>
                                                </div>

                                                {/* Water Condenser */}
                                                <div className="bg-black/70 p-2 rounded border border-amber-900/60 flex flex-col justify-between gap-1.5">
                                                    <div>
                                                        <div className="font-bold text-cyan-300 flex items-center justify-between">
                                                            <span>💧 Condensador</span>
                                                            <span className="text-cyan-500 font-mono">Nv.{mods.waterCondenser}/3</span>
                                                        </div>
                                                        <p className="text-[9px] text-stone-400 mt-0.5">Purifica Água de Amêndoa passiva.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => actions.upgradeSectorModule && actions.upgradeSectorModule(lvl.id, 'waterCondenser')}
                                                        disabled={mods.waterCondenser >= 3 || resources.scrap < 35 * (mods.waterCondenser + 1)}
                                                        className="w-full py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600 text-[9px] text-cyan-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {mods.waterCondenser >= 3 ? 'MAX' : `🔧${35 * (mods.waterCondenser + 1)}`}
                                                    </button>
                                                </div>

                                                {/* Scrap Beacon */}
                                                <div className="bg-black/70 p-2 rounded border border-amber-900/60 flex flex-col justify-between gap-1.5">
                                                    <div>
                                                        <div className="font-bold text-amber-400 flex items-center justify-between">
                                                            <span>⚙️ Baliza</span>
                                                            <span className="text-amber-500 font-mono">Nv.{mods.scrapBeacon}/3</span>
                                                        </div>
                                                        <p className="text-[9px] text-stone-400 mt-0.5">+25% de sucata extraída por nível.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => actions.upgradeSectorModule && actions.upgradeSectorModule(lvl.id, 'scrapBeacon')}
                                                        disabled={mods.scrapBeacon >= 3 || resources.scrap < 40 * (mods.scrapBeacon + 1)}
                                                        className="w-full py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-[9px] text-amber-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        {mods.scrapBeacon >= 3 ? 'MAX' : `🔧${40 * (mods.scrapBeacon + 1)}`}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: Salas Secretas & Noclip */}
                    {activeTab === 'noclip' && (
                        <div className="p-3 md:p-4 flex flex-col gap-4 animate-fade-in">
                            <div className="border-b border-cyan-800 pb-2">
                                <h3 className="text-sm font-black uppercase text-cyan-300 flex items-center gap-2">
                                    <Globe size={16} /> Arquivo de Salas Secretas & Noclip Dimensional
                                </h3>
                                <p className="text-[11px] text-cyan-600">
                                    Falhas dimensionais (Noclip) abrem caminhos raros para níveis além da rota convencional. Risco elevado, recompensas supremas em recursos exóticos.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {NOCLIP_LEVELS.map(sec => (
                                    <div key={sec.id} className="border-2 border-cyan-800/80 bg-slate-950 p-3 rounded-lg flex flex-col justify-between gap-3 shadow-sm">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{sec.emoji}</span>
                                                <div>
                                                    <h4 className="font-bold text-xs text-cyan-200">{sec.name}</h4>
                                                    <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded font-bold border ${
                                                        (sec.hazardLevel || sec.danger) === 'critical' || (sec.hazardLevel || sec.danger) === 'deadly' ? 'bg-red-950 text-red-400 border-red-800' :
                                                        (sec.hazardLevel || sec.danger) === 'safe' || (sec.hazardLevel || sec.danger) === 'peaceful' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                                                        'bg-amber-950 text-amber-400 border-amber-800'
                                                    }`}>
                                                        Perigo: {sec.hazardLevel || sec.danger}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-stone-300 leading-relaxed italic">
                                                {sec.description}
                                            </p>
                                        </div>

                                        <div className="bg-black/80 p-2 rounded border border-cyan-900 text-[10px]">
                                            <div className="text-cyan-400 font-bold mb-1">Recompensas Exóticas:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {(sec.exoticDrops || []).map((d: string, i: number) => (
                                                    <span key={i} className="bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700 text-cyan-300 text-[9px]">
                                                        ✨ {d}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: Instabilidade Dimensional & Invasões de Fenda */}
                    {activeTab === 'instabilidade' && (
                        <div className="p-3 md:p-4 flex flex-col gap-4 animate-fade-in">
                            <div className="border-b border-red-800 pb-2">
                                <h3 className="text-sm font-black uppercase text-red-300 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Matriz Dimensional & Fendas na Vila
                                </h3>
                                <p className="text-[11px] text-red-500">
                                    A exploração contínua das Backrooms desgasta a membrana de contenção entre o labirinto e a superfície.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Membrane Meter */}
                                <div className="border-2 border-red-900 bg-slate-950 p-4 rounded-lg flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-red-400 uppercase">Status da Membrana Dimensional</span>
                                        <span className="font-mono text-white text-sm">{dimensionalInstability.toFixed(1)}%</span>
                                    </div>

                                    <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-red-800 p-0.5">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                dimensionalInstability >= 80 
                                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 animate-pulse' 
                                                    : dimensionalInstability >= 40 
                                                        ? 'bg-gradient-to-r from-yellow-600 to-amber-600' 
                                                        : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                                            }`}
                                            style={{ width: `${Math.min(100, dimensionalInstability)}%` }}
                                        />
                                    </div>

                                    <div className="text-[10px] text-stone-300 leading-relaxed">
                                        {dimensionalInstability >= 80 ? (
                                            <span className="text-red-400 font-bold animate-pulse">
                                                🚨 ESTADO CRÍTICO: Fendas se abriram na Vila! Invasores atacam distritos terrestres até que a fenda seja selada.
                                            </span>
                                        ) : dimensionalInstability >= 40 ? (
                                            <span className="text-amber-400 font-medium">
                                                ⚠️ AVISO: Micro-tremores liminares detectados. Instabilidade moderada acumulada.
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400 font-medium">
                                                ✅ ESTÁVEL: A membrana resiste sem fissuras visíveis.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Sealing Actions */}
                                <div className="border-2 border-amber-800/80 bg-slate-950 p-4 rounded-lg flex flex-col justify-between gap-3">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-amber-300 mb-2">Protocolos de Estabilização</h4>
                                        <p className="text-[10px] text-stone-400 leading-relaxed mb-3">
                                            Selecione uma estratégia para reforçar a membrana e fechar brechas liminares:
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => actions.sealDimensionalRift && actions.sealDimensionalRift('scrap')}
                                            disabled={resources.scrap < 50 || resources.almondWater < 2 || dimensionalInstability <= 0}
                                            className="p-2 rounded border border-amber-600 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-bold flex justify-between items-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Wrench size={13} /> Instalar Âncora de Sucata (-35%)
                                            </span>
                                            <span className="text-[10px] font-mono text-amber-400">🔧50 🧴2</span>
                                        </button>

                                        <button
                                            onClick={() => actions.sealDimensionalRift && actions.sealDimensionalRift('heroCombat')}
                                            disabled={dimensionalInstability <= 0}
                                            className="p-2 rounded border border-red-600 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold flex justify-between items-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Skull size={13} /> Despachar Patrulha da Guilda (-50%)
                                            </span>
                                            <span className="text-[10px] font-mono text-red-400">+2 🦠 / +1 🌌</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 6: Backrooms Tech Tree */}
                    {activeTab === 'techTree' && (
                        <div className="p-3 md:p-4 animate-fade-in">
                            <BackroomsTechTree
                                floor={floor}
                                resources={resources}
                                unlockedTechs={unlockedTechs}
                                onResearchTech={(techId) => actions.researchTech && actions.researchTech(techId)}
                            />
                        </div>
                    )}

                    {/* TAB 7: Marcos & Sinergias Globais */}
                    {activeTab === 'marcos' && (
                        <div className="p-3 md:p-4 animate-fade-in">
                            <BackroomsMilestones
                                floor={floor}
                                isUnlocked={true}
                            />
                        </div>
                    )}
                </div>

                {/* Fixed Bottom Status Footer */}
                <div className="bg-stone-950/95 px-4 py-2 border-t-2 border-amber-800/80 flex flex-wrap justify-between items-center gap-2 text-[10px] text-amber-500 font-mono shrink-0 z-30 shadow-lg">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Activity size={12} className="animate-pulse" /> SISTEMA OPERACIONAL M.E.G. V2.0 ONLINE
                        </span>
                        <span className="text-stone-600 hidden sm:inline">•</span>
                        <span className="text-amber-600 hidden sm:inline">
                            Pressione <kbd className="bg-black border border-amber-700 px-1 py-0.2 rounded text-[9px] text-amber-300 font-bold">ESC</kbd> para fechar
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="bg-red-950/90 hover:bg-red-900 text-red-200 hover:text-white border-2 border-red-600 hover:border-red-400 px-3 py-1 rounded-md text-[11px] font-black uppercase flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto"
                        title="Sair das Backrooms (ESC)"
                    >
                        <X size={14} className="text-red-400" /> Sair das Backrooms [ESC]
                    </button>
                </div>
            </div>
        </div>
    );
};
