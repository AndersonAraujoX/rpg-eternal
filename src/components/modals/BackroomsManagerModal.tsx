import React, { useState } from 'react';
import { 
    X, Heart, Shield, RefreshCw, HardHat, Eye, Wrench, Thermometer, UserPlus, Compass,
    Zap, Award, Activity, Radio, AlertTriangle, Skull, CheckCircle2, ChevronRight,
    Sparkles, Flame, BatteryCharging, Tv
} from 'lucide-react';
import type { 
    BackroomsExplorer, BackroomsOutpost, BackroomsResources 
} from '../../engine/backrooms';
import { BACKROOMS_LEVELS, getTransitionBoss } from '../../engine/backrooms';
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
    actions: {
        recruitExplorer: () => void;
        sendExplorer: (explorerId: string, levelId: string) => void;
        recallExplorer: (explorerId: string) => void;
        restExplorer: (explorerId: string) => void;
        useAlmondWater: (explorerId: string) => void;
        upgradeOutpost: (upgradeId: keyof BackroomsOutpost) => void;
        craftGear: (explorerId: string, gearType: 'flashlight' | 'suit' | 'tracker') => void;
        researchTech?: (techId: string) => void;
    };
    currentTutorialIndex?: number;
}

export const BackroomsManagerModal: React.FC<BackroomsManagerModalProps> = ({
    isOpen, onClose, explorers, outpost, resources, logs, unlockedTechs = [], floor, floorProgress, bossHp, actions, currentTutorialIndex
}) => {
    const [selectedLevelForExp, setSelectedLevelForExp] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'exploradores' | 'techTree' | 'marcos'>('exploradores');
    const [enableCrt, setEnableCrt] = useState<boolean>(true);

    // Support ESC key to exit Backrooms
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const transitionBoss = getTransitionBoss(floor);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-1 sm:p-2 md:p-3 backdrop-blur-md animate-fade-in overflow-hidden">
            {/* Main Terminal Container - Adaptive to any monitor height */}
            <div className="bg-slate-950 border-4 border-amber-600 rounded-xl w-full max-w-6xl h-[96vh] max-h-[96vh] shadow-[0_0_50px_rgba(217,119,6,0.4)] relative text-amber-500 flex flex-col font-mono overflow-hidden">
                
                {/* CRT Scanline Effect (Togglable) */}
                {enableCrt && (
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.22)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[size:100%_4px,6px_100%] opacity-40 z-50" />
                )}

                {/* Fixed Top Header Bar */}
                <div className="bg-gradient-to-r from-amber-950/90 via-stone-900/95 to-amber-950/90 px-3 md:px-4 py-2 border-b-4 border-amber-600 flex flex-wrap justify-between items-center gap-2 shrink-0 z-30 shadow-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-amber-950 border border-amber-500 flex items-center justify-center text-base shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                            🏢
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-amber-300">
                                    Terminal M.E.G. - Posto Avançado
                                </h2>
                                <span className="text-[9px] bg-red-950/80 text-red-400 border border-red-800 px-1.5 py-0.2 rounded uppercase font-bold animate-pulse">
                                    Classificado
                                </span>
                            </div>
                            <span className="text-[9px] text-amber-600 font-bold hidden sm:inline">
                                Major Explorer Group • Matriz de Operações Liminares
                            </span>
                        </div>
                    </div>

                    {/* Resources & Action Header Controls */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex gap-1.5 text-xs font-bold">
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-amber-600 text-amber-400 flex items-center gap-1 text-[11px]" title="Sucata Metálica">
                                🔧 <span className="text-white font-black">{resources.scrap}</span>
                            </span>
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-emerald-600 text-emerald-400 flex items-center gap-1 text-[11px]" title="Água de Amêndoa">
                                🧴 <span className="text-white font-black">{resources.almondWater}</span>
                            </span>
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-purple-600 text-purple-400 flex items-center gap-1 text-[11px]" title="Peças de Anomalia">
                                🦠 <span className="text-white font-black">{resources.anomalyParts}</span>
                            </span>
                        </div>

                        {/* CRT Effect Toggle Button */}
                        <button 
                            onClick={() => setEnableCrt(prev => !prev)}
                            className={`p-1 rounded border text-[9px] flex items-center gap-1 transition-all ${
                                enableCrt ? 'bg-amber-950 text-amber-300 border-amber-600' : 'bg-black/40 text-stone-600 border-stone-800'
                            }`}
                            title="Alternar efeito de monitor CRT"
                        >
                            <Tv size={13} />
                        </button>

                        {/* High Visibility Exit Button */}
                        <button 
                            onClick={onClose} 
                            className="bg-red-950/80 hover:bg-red-900 text-red-200 hover:text-white px-3 py-1.5 rounded-lg border-2 border-red-600 hover:border-red-400 cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-black tracking-wider active:scale-95 uppercase transition-all"
                            title="Fechar Terminal (ESC)"
                        >
                            <X size={15} className="text-red-300" />
                            <span>Sair [ESC]</span>
                        </button>
                    </div>
                </div>

                {/* Fixed Terminal Navigation Tabs */}
                <div className="bg-black/95 px-3 md:px-4 py-1.5 border-b border-amber-800 flex flex-wrap justify-between items-center gap-2 text-[10px] md:text-xs font-bold shrink-0 z-20">
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                        <button
                            onClick={() => setActiveTab('exploradores')}
                            className={`px-3 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1.5 ${
                                activeTab === 'exploradores'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Radio size={13} /> [01] MONITOR DE ESQUADRÃO ({explorers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('techTree')}
                            className={`px-3 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1.5 ${
                                activeTab === 'techTree'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Zap size={13} /> [02] ÁRVORE TECNOLÓGICA (M.E.G. TECH TREE)
                        </button>
                        <button
                            onClick={() => setActiveTab('marcos')}
                            className={`px-3 py-1 rounded-t border-t-2 border-x-2 transition-all flex items-center gap-1.5 ${
                                activeTab === 'marcos'
                                    ? 'bg-amber-600 text-black border-amber-300 font-black shadow-md'
                                    : 'bg-transparent text-amber-600 border-amber-950 hover:border-amber-800'
                            }`}
                        >
                            <Award size={13} /> [03] MARCOS & SINERGIAS GLOBAIS
                        </button>
                    </div>

                    {/* Status: Depth & Exploration Progress */}
                    <div className="flex items-center gap-3 text-[10px] md:text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold uppercase">Profundidade:</span>
                            <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700 text-amber-300 font-black tracking-wider text-[11px]">
                                Andar {floor}/100
                            </span>
                        </div>

                        <div className="w-32 md:w-44 flex items-center gap-1.5">
                            <div className="flex-1 bg-black/80 h-3 border border-amber-800 rounded-full overflow-hidden relative p-0.5">
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
                </div>

                {/* Scrollable Body Container - Fits inside monitor height */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scroll bg-black flex flex-col z-10">
                    
                    {/* Environmental Hazards */}
                    {(floor >= 31) && (
                        <div className="bg-red-950/20 px-4 py-1 border-b border-red-900/50 flex items-center gap-2 text-[10px]">
                            {floor >= 31 && floor <= 75 && (
                                <span className="text-red-400 animate-pulse font-bold bg-red-950/40 px-2 py-0.5 border border-red-800 rounded flex items-center gap-1">
                                    <AlertTriangle size={12} /> PERIGO: AR TÓXICO (Traje Nv. 2)
                                </span>
                            )}
                            {floor >= 76 && (
                                <span className="text-red-400 animate-pulse font-bold bg-red-950/40 px-2 py-0.5 border border-red-800 rounded flex items-center gap-1">
                                    <AlertTriangle size={12} /> CRÍTICO: VÁCUO (Traje Nv. 3)
                                </span>
                            )}
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

                {/* Tab 1: Monitor de Esquadrão & Base */}
                {activeTab === 'exploradores' && (
                    <div className="p-3 md:p-4 flex flex-col lg:flex-row gap-4 animate-fade-in">
                        
                        {/* Column 1: Explorers & Outpost Upgrades */}
                        <div className="flex-1 flex flex-col gap-4">
                            
                            {/* Recruitment & Infrastructure Grid */}
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
                                        Contrate novos agentes (Explorador, Cientista, Soldado) com especialidades de exploração.
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

                                {/* Infrastructure Upgrades */}
                                <div className="border-2 border-amber-700/60 bg-amber-950/10 p-3 rounded-lg flex flex-col gap-2 shadow-sm">
                                    <div className="flex justify-between items-center border-b border-amber-800 pb-1">
                                        <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1">
                                            <Wrench size={13} /> Instalações do Posto
                                        </h3>
                                        <span className="text-[9px] text-amber-600">Nível Operacional</span>
                                    </div>
                                    <div className="flex flex-col gap-2 text-[10px]">
                                        {/* Refinery */}
                                        <div className="flex justify-between items-center bg-black/50 p-1.5 rounded border border-amber-900/60">
                                            <span>🧴 Refinaria (Nv {outpost.refinery})</span>
                                            <button 
                                                onClick={() => actions.upgradeOutpost('refinery')}
                                                disabled={resources.scrap < (outpost.refinery + 1) * 20 || resources.anomalyParts < outpost.refinery * 2}
                                                className="px-2 py-1 rounded border border-amber-600 bg-amber-950/60 text-amber-300 text-[9px] hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                            >
                                                🔧{(outpost.refinery + 1) * 20} 🦠{outpost.refinery * 2}
                                            </button>
                                        </div>
                                        {/* Quarters */}
                                        <div className="flex justify-between items-center bg-black/50 p-1.5 rounded border border-amber-900/60">
                                            <span>⛺ Dormitórios (Nv {outpost.quarters})</span>
                                            <button 
                                                onClick={() => actions.upgradeOutpost('quarters')}
                                                disabled={resources.scrap < (outpost.quarters + 1) * 20 || resources.anomalyParts < outpost.quarters * 2}
                                                className="px-2 py-1 rounded border border-amber-600 bg-amber-950/60 text-amber-300 text-[9px] hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                            >
                                                🔧{(outpost.quarters + 1) * 20} 🦠{outpost.quarters * 2}
                                            </button>
                                        </div>
                                        {/* Sensors */}
                                        <div className="flex justify-between items-center bg-black/50 p-1.5 rounded border border-amber-900/60">
                                            <span>📡 Scanners (Nv {outpost.sensors})</span>
                                            <button 
                                                onClick={() => actions.upgradeOutpost('sensors')}
                                                disabled={resources.scrap < (outpost.sensors + 1) * 20 || resources.anomalyParts < outpost.sensors * 2}
                                                className="px-2 py-1 rounded border border-amber-600 bg-amber-950/60 text-amber-300 text-[9px] hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                            >
                                                🔧{(outpost.sensors + 1) * 20} 🦠{outpost.sensors * 2}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hired Explorers Dossiers */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center border-b border-amber-700/60 pb-1">
                                    <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                                        <Radio size={13} /> Dossiers dos Agentes ({explorers.length})
                                    </h3>
                                    <span className="text-[9px] text-amber-600">Estado em Tempo Real</span>
                                </div>
                                
                                {explorers.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-amber-800 border border-dashed border-amber-900/60 rounded-lg">
                                        Nenhum explorador contratado. Recrute agentes no painel acima!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 max-h-[42vh] overflow-y-auto pr-1 custom-scroll">
                                        {explorers.map(exp => {
                                            const isLost = exp.status === 'lost';
                                            const lvlSelected = selectedLevelForExp[exp.id] || (BACKROOMS_LEVELS[0]?.id || '');

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
                                                        </span>
                                                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                                                            exp.status === 'exploring' ? 'bg-cyan-950 text-cyan-400 border-cyan-700 animate-pulse' :
                                                            exp.status === 'resting' ? 'bg-emerald-950 text-emerald-400 border-emerald-700' :
                                                            exp.status === 'lost' ? 'bg-red-950 text-red-500 border-red-800 font-black' : 'bg-black text-amber-600 border-amber-900'
                                                        }`}>
                                                            {exp.status === 'lost' ? '💀 Perdido' : exp.status === 'exploring' ? '🧭 Explorando' : exp.status === 'resting' ? '⛺ Descansando' : '⏸️ Ocioso'}
                                                        </span>
                                                    </div>

                                                    {/* HP & Sanity Bars */}
                                                    {!isLost && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                                                            {/* HP */}
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex justify-between text-red-400 font-bold">
                                                                    <span>HP: {Math.ceil(exp.hp)}/{exp.maxHp}</span>
                                                                    <span>{Math.round((exp.hp / exp.maxHp) * 100)}%</span>
                                                                </div>
                                                                <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-red-900 p-0.5">
                                                                    <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${(exp.hp / exp.maxHp) * 100}%` }} />
                                                                </div>
                                                            </div>
                                                            {/* Sanity */}
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

                                                    {/* Equipment Upgrades Bar */}
                                                    {!isLost && (
                                                        <div className="grid grid-cols-3 gap-2 bg-black/60 p-2 rounded border border-amber-900/50 text-[9px] font-mono">
                                                            {/* Flashlight */}
                                                            <div className="flex justify-between items-center">
                                                                <span title="Lanterna (Melhora taxa de sucata)">🔦 L.{exp.equipment.flashlight}/3</span>
                                                                {exp.equipment.flashlight < 3 && (
                                                                    <button 
                                                                        onClick={() => actions.craftGear(exp.id, 'flashlight')}
                                                                        disabled={resources.scrap < (exp.equipment.flashlight + 1) * 15}
                                                                        className="px-1.5 py-0.5 border border-amber-700 rounded text-[8px] bg-amber-950/60 hover:bg-amber-900 disabled:opacity-40 font-bold"
                                                                    >
                                                                        🔧{(exp.equipment.flashlight + 1) * 15}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {/* Suit */}
                                                            <div className="flex justify-between items-center">
                                                                <span title="Traje MEG (Reduz dano de Entidades)">🛡️ L.{exp.equipment.suit}/3</span>
                                                                {exp.equipment.suit < 3 && (
                                                                    <button 
                                                                        onClick={() => actions.craftGear(exp.id, 'suit')}
                                                                        disabled={resources.scrap < (exp.equipment.suit + 1) * 15}
                                                                        className="px-1.5 py-0.5 border border-amber-700 rounded text-[8px] bg-amber-950/60 hover:bg-amber-900 disabled:opacity-40 font-bold"
                                                                    >
                                                                        🔧{(exp.equipment.suit + 1) * 15}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {/* Tracker */}
                                                            <div className="flex justify-between items-center">
                                                                <span title="Rastreador (Reduz dreno de sanidade)">📡 L.{exp.equipment.tracker}/3</span>
                                                                {exp.equipment.tracker < 3 && (
                                                                    <button 
                                                                        onClick={() => actions.craftGear(exp.id, 'tracker')}
                                                                        disabled={resources.scrap < (exp.equipment.tracker + 1) * 15}
                                                                        className="px-1.5 py-0.5 border border-amber-700 rounded text-[8px] bg-amber-950/60 hover:bg-amber-900 disabled:opacity-40 font-bold"
                                                                    >
                                                                        🔧{(exp.equipment.tracker + 1) * 15}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tactical Actions Buttons */}
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
                                                                    className="bg-black border border-cyan-500 text-cyan-400 hover:bg-cyan-950 px-3 py-1 rounded text-[10px] font-bold"
                                                                >
                                                                    Chamar de Volta
                                                                </button>
                                                            )}

                                                            {exp.status === 'resting' && (
                                                                <button
                                                                    onClick={() => actions.recallExplorer(exp.id)}
                                                                    className="bg-black border border-emerald-500 text-emerald-400 hover:bg-emerald-950 px-3 py-1 rounded text-[10px] font-bold"
                                                                >
                                                                    Despertar Agente
                                                                </button>
                                                            )}

                                                            {exp.status === 'idle' && (
                                                                <button
                                                                    onClick={() => actions.restExplorer(exp.id)}
                                                                    className="bg-amber-950/40 border border-emerald-600 text-emerald-400 hover:bg-emerald-950 px-3 py-1 rounded text-[10px] font-bold"
                                                                >
                                                                    Mandar Descansar
                                                                </button>
                                                            )}

                                                            {exp.sanity < exp.maxSanity && resources.almondWater >= 1 && (
                                                                <button
                                                                    onClick={() => actions.useAlmondWater(exp.id)}
                                                                    className="bg-black border border-blue-500 text-blue-400 hover:bg-blue-950 px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1"
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
                            
                            {/* Live Radar Feed Monitor */}
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

                            {/* Known Sectors Intel */}
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

                {/* Tab 2: Backrooms Tech Tree */}
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

                {/* Tab 3: Marcos & Sinergias Globais */}
                {activeTab === 'marcos' && (
                    <div className="p-3 md:p-4 animate-fade-in">
                        <BackroomsMilestones
                            floor={floor}
                            isUnlocked={true}
                        />
                    </div>
                )}
                </div>

                {/* Fixed Bottom Status & Emergency Exit Footer */}
                <div className="bg-stone-950/95 px-4 py-2 border-t-2 border-amber-800/80 flex flex-wrap justify-between items-center gap-2 text-[10px] text-amber-500 font-mono shrink-0 z-30 shadow-lg">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Activity size={12} className="animate-pulse" /> SISTEMA OPERACIONAL M.E.G. ONLINE
                        </span>
                        <span className="text-stone-600 hidden sm:inline">•</span>
                        <span className="text-amber-600 hidden sm:inline">
                            Atalho: Pressione <kbd className="bg-black border border-amber-700 px-1 py-0.2 rounded text-[9px] text-amber-300 font-bold">ESC</kbd> para fechar a qualquer momento
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
