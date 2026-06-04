import React, { useState } from 'react';
import { 
    X, Heart, Shield, RefreshCw, HardHat, Eye, Wrench, Thermometer, UserPlus, Compass
} from 'lucide-react';
import type { 
    BackroomsExplorer, BackroomsOutpost, BackroomsResources 
} from '../../engine/backrooms';
import { BACKROOMS_LEVELS } from '../../engine/backrooms';

interface BackroomsManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    explorers: BackroomsExplorer[];
    outpost: BackroomsOutpost;
    resources: BackroomsResources;
    logs: string[];
    actions: {
        recruitExplorer: () => void;
        sendExplorer: (explorerId: string, levelId: string) => void;
        recallExplorer: (explorerId: string) => void;
        restExplorer: (explorerId: string) => void;
        useAlmondWater: (explorerId: string) => void;
        upgradeOutpost: (upgradeId: keyof BackroomsOutpost) => void;
        craftGear: (explorerId: string, gearType: 'flashlight' | 'suit' | 'tracker') => void;
    };
}

export const BackroomsManagerModal: React.FC<BackroomsManagerModalProps> = ({
    isOpen, onClose, explorers, outpost, resources, logs, actions
}) => {
    const [selectedLevelForExp, setSelectedLevelForExp] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 md:p-4 overflow-auto">
            {/* Terminal Container */}
            <div className="bg-black border-4 border-amber-600 rounded-lg w-full max-w-4xl shadow-[0_0_30px_rgba(217,119,6,0.3)] relative text-amber-500 flex flex-col font-mono overflow-hidden">
                
                {/* CRT Screen Scanlines overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] opacity-40 z-50"></div>

                {/* Header */}
                <div className="bg-amber-950/60 px-4 py-3 border-b-4 border-amber-600 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-xl animate-pulse">🏢</span>
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-widest text-amber-400">Terminal M.E.G. - Posto Avançado</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Resources */}
                        <div className="flex gap-2 text-xs font-bold mr-2">
                            <span className="bg-amber-950/80 px-2 py-1 rounded border border-amber-600 flex items-center gap-1" title="Sucata Metálica">🔧 {resources.scrap}</span>
                            <span className="bg-amber-950/80 px-2 py-1 rounded border border-amber-600 flex items-center gap-1" title="Água de Amêndoa">🧴 {resources.almondWater}</span>
                            <span className="bg-amber-950/80 px-2 py-1 rounded border border-amber-600 flex items-center gap-1" title="Peças de Anomalia">🦠 {resources.anomalyParts}</span>
                        </div>
                        <button onClick={onClose} className="text-amber-500 hover:text-amber-300 transition-colors bg-black/40 p-1 rounded-full border border-amber-600"><X size={16} /></button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex flex-col md:flex-row gap-4 overflow-y-auto max-h-[85vh] z-10 bg-black">
                    
                    {/* Column 1: Explorers & Outpost Upgrades */}
                    <div className="flex-1 flex flex-col gap-4">
                        
                        {/* Recruitment & Outpost Infrastructure */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Recruitment */}
                            <div className="border-2 border-amber-700/60 bg-amber-950/10 p-3 rounded flex flex-col gap-2">
                                <h3 className="text-xs font-bold uppercase text-amber-400 border-b border-amber-800 pb-1">Recrutamento</h3>
                                <p className="text-[10px] text-amber-600">Contrate novos funcionários com classes exclusivas (Explorador, Cientista, Soldado) para expandir seu MEG Squad.</p>
                                <button
                                    onClick={actions.recruitExplorer}
                                    disabled={resources.scrap < 15}
                                    className={`mt-auto px-3 py-1.5 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                        resources.scrap >= 15 
                                        ? 'bg-amber-600 border-amber-400 text-black hover:bg-amber-500' 
                                        : 'bg-black text-amber-800 border-amber-900 cursor-not-allowed'
                                    }`}
                                >
                                    <UserPlus size={14} /> Recrutar Explorador (🔧 15)
                                </button>
                            </div>

                            {/* Infrastructure Upgrades */}
                            <div className="border-2 border-amber-700/60 bg-amber-950/10 p-3 rounded flex flex-col gap-2">
                                <h3 className="text-xs font-bold uppercase text-amber-400 border-b border-amber-800 pb-1">Base do Posto</h3>
                                <div className="flex flex-col gap-1.5 text-[10px]">
                                    {/* Refinery */}
                                    <div className="flex justify-between items-center">
                                        <span>Refinaria Água Amêndoa (Nvl {outpost.refinery})</span>
                                        <button 
                                            onClick={() => actions.upgradeOutpost('refinery')}
                                            disabled={resources.scrap < (outpost.refinery + 1) * 20 || resources.anomalyParts < outpost.refinery * 2}
                                            className="px-1.5 py-0.5 rounded border border-amber-750 text-[9px] hover:bg-amber-900/40"
                                        >
                                            🔧{(outpost.refinery + 1) * 20} 🦠{outpost.refinery * 2}
                                        </button>
                                    </div>
                                    {/* Quarters */}
                                    <div className="flex justify-between items-center">
                                        <span>Alojamento de Descanso (Nvl {outpost.quarters})</span>
                                        <button 
                                            onClick={() => actions.upgradeOutpost('quarters')}
                                            disabled={resources.scrap < (outpost.quarters + 1) * 20 || resources.anomalyParts < outpost.quarters * 2}
                                            className="px-1.5 py-0.5 rounded border border-amber-750 text-[9px] hover:bg-amber-900/40"
                                        >
                                            🔧{(outpost.quarters + 1) * 20} 🦠{outpost.quarters * 2}
                                        </button>
                                    </div>
                                    {/* Sensors */}
                                    <div className="flex justify-between items-center">
                                        <span>Scanners de Anomalia (Nvl {outpost.sensors})</span>
                                        <button 
                                            onClick={() => actions.upgradeOutpost('sensors')}
                                            disabled={resources.scrap < (outpost.sensors + 1) * 20 || resources.anomalyParts < outpost.sensors * 2}
                                            className="px-1.5 py-0.5 rounded border border-amber-750 text-[9px] hover:bg-amber-900/40"
                                        >
                                            🔧{(outpost.sensors + 1) * 20} 🦠{outpost.sensors * 2}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hired Explorers List */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold uppercase text-amber-400 border-b border-amber-700/60 pb-1">Dossiers de Agentes</h3>
                            
                            {explorers.length === 0 ? (
                                <div className="text-center py-4 text-xs text-amber-800">Nenhum explorador contratado. Recrute agentes acima!</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                                    {explorers.map(exp => {
                                        const isLost = exp.status === 'lost';
                                        const lvlSelected = selectedLevelForExp[exp.id] || 'lvl_0';

                                        return (
                                            <div 
                                                key={exp.id} 
                                                className={`border p-3 rounded flex flex-col gap-2 bg-black transition-colors ${
                                                    isLost ? 'border-red-900 opacity-50 bg-red-950/5' : 'border-amber-850 hover:border-amber-700'
                                                }`}
                                            >
                                                {/* Header Line */}
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-bold flex items-center gap-1">
                                                        <span>{exp.emoji}</span>
                                                        <span>{exp.name}</span>
                                                        <span className="text-[9px] bg-amber-950 text-amber-400 px-1 rounded uppercase">{exp.classType}</span>
                                                    </span>
                                                    <span className={`text-[10px] uppercase font-bold ${
                                                        exp.status === 'exploring' ? 'text-cyan-400' :
                                                        exp.status === 'resting' ? 'text-emerald-400 animate-pulse' :
                                                        exp.status === 'lost' ? 'text-red-500 font-black' : 'text-amber-600'
                                                    }`}>
                                                        {exp.status === 'lost' ? ' Perdido' : exp.status === 'exploring' ? ' Exploração' : exp.status === 'resting' ? ' Descanso' : ' Ocioso'}
                                                    </span>
                                                </div>

                                                {/* Status Stats Bars (HP and Sanity) */}
                                                {!isLost && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                                                        {/* HP */}
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex justify-between text-red-500">
                                                                <span>HP: {Math.ceil(exp.hp)}/{exp.maxHp}</span>
                                                            </div>
                                                            <div className="w-full bg-amber-950 h-1.5 rounded overflow-hidden border border-amber-900">
                                                                <div className="bg-red-650 h-full transition-all duration-300" style={{ width: `${(exp.hp / exp.maxHp) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                        {/* Sanity */}
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex justify-between text-cyan-400">
                                                                <span>Sanidade: {Math.ceil(exp.sanity)}/{exp.maxSanity}</span>
                                                            </div>
                                                            <div className="w-full bg-amber-950 h-1.5 rounded overflow-hidden border border-amber-900">
                                                                <div className="bg-cyan-555 h-full transition-all duration-300" style={{ width: `${(exp.sanity / exp.maxSanity) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Equipment Upgrades */}
                                                {!isLost && (
                                                    <div className="grid grid-cols-3 gap-1.5 bg-amber-950/10 p-1.5 rounded border border-amber-900/40 text-[9px] font-mono">
                                                        {/* Flashlight */}
                                                        <div className="flex justify-between items-center">
                                                            <span title="Lanterna (Melhora taxa de sucata)">🔦 L.{exp.equipment.flashlight}/3</span>
                                                            {exp.equipment.flashlight < 3 && (
                                                                <button 
                                                                    onClick={() => actions.craftGear(exp.id, 'flashlight')}
                                                                    disabled={resources.scrap < (exp.equipment.flashlight + 1) * 15}
                                                                    className="px-1 border border-amber-800 text-[8px] hover:bg-amber-900/40"
                                                                >
                                                                    🔧{(exp.equipment.flashlight + 1) * 15}
                                                                </button>
                                                            )}
                                                        </div>
                                                        {/* Hazmat Suit */}
                                                        <div className="flex justify-between items-center">
                                                            <span title="Traje MEG (Reduz dano de Entidades)">🛡️ L.{exp.equipment.suit}/3</span>
                                                            {exp.equipment.suit < 3 && (
                                                                <button 
                                                                    onClick={() => actions.craftGear(exp.id, 'suit')}
                                                                    disabled={resources.scrap < (exp.equipment.suit + 1) * 15}
                                                                    className="px-1 border border-amber-800 text-[8px] hover:bg-amber-900/40"
                                                                >
                                                                    🔧{(exp.equipment.suit + 1) * 15}
                                                                </button>
                                                            )}
                                                        </div>
                                                        {/* Motion Tracker */}
                                                        <div className="flex justify-between items-center">
                                                            <span title="Rastreador (Reduz dreno de sanidade)">📡 L.{exp.equipment.tracker}/3</span>
                                                            {exp.equipment.tracker < 3 && (
                                                                <button 
                                                                    onClick={() => actions.craftGear(exp.id, 'tracker')}
                                                                    disabled={resources.scrap < (exp.equipment.tracker + 1) * 15}
                                                                    className="px-1 border border-amber-800 text-[8px] hover:bg-amber-900/40"
                                                                >
                                                                    🔧{(exp.equipment.tracker + 1) * 15}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                {!isLost && (
                                                    <div className="flex flex-wrap gap-2 mt-1 text-[10px]">
                                                        {/* Send / Recall explorer */}
                                                        {exp.status === 'idle' && (
                                                            <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                                                <select
                                                                    value={lvlSelected}
                                                                    onChange={(e) => setSelectedLevelForExp(prev => ({ ...prev, [exp.id]: e.target.value }))}
                                                                    className="bg-black border border-amber-700 text-amber-500 rounded p-1 text-[10px]"
                                                                >
                                                                    {BACKROOMS_LEVELS.map(l => (
                                                                        <option key={l.id} value={l.id}>{l.name} ({l.dangerLevel})</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    onClick={() => actions.sendExplorer(exp.id, lvlSelected)}
                                                                    className="bg-amber-900/40 border border-amber-600 hover:bg-amber-700 hover:text-black px-2 py-1 rounded font-bold"
                                                                >
                                                                    Explorar
                                                                </button>
                                                            </div>
                                                        )}

                                                        {exp.status === 'exploring' && (
                                                            <button
                                                                onClick={() => actions.recallExplorer(exp.id)}
                                                                className="bg-black border border-cyan-500 text-cyan-400 hover:bg-cyan-900/30 px-2 py-1 rounded text-[10px]"
                                                            >
                                                                Chamar de Volta
                                                            </button>
                                                        )}

                                                        {exp.status === 'resting' && (
                                                            <button
                                                                onClick={() => actions.recallExplorer(exp.id)}
                                                                className="bg-black border border-emerald-500 text-emerald-400 hover:bg-emerald-900/30 px-2 py-1 rounded text-[10px]"
                                                            >
                                                                Despertar
                                                            </button>
                                                        )}

                                                        {/* Rest button */}
                                                        {exp.status === 'idle' && (
                                                            <button
                                                                onClick={() => actions.restExplorer(exp.id)}
                                                                className="bg-amber-900/40 border border-emerald-700 text-emerald-500 hover:bg-emerald-900/80 px-2 py-1 rounded text-[10px]"
                                                            >
                                                                Mandar Descansar
                                                            </button>
                                                        )}

                                                        {/* Use Almond water */}
                                                        {exp.sanity < exp.maxSanity && resources.almondWater >= 1 && (
                                                            <button
                                                                onClick={() => actions.useAlmondWater(exp.id)}
                                                                className="bg-black border border-blue-500 text-blue-400 hover:bg-blue-900/30 px-2 py-1 rounded text-[10px]"
                                                            >
                                                                Usar Almond Water (🧴)
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
                        
                        {/* Live Log Monitor */}
                        <div className="border-2 border-amber-600 bg-black rounded p-3 flex flex-col gap-2 h-64 md:h-[45vh]">
                            <div className="flex justify-between items-center text-[10px] font-bold text-amber-400 border-b border-amber-800 pb-1">
                                <span>📺 LIVE FEED MONITOR</span>
                                <span className="animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-650 rounded-full animate-ping" /> CONECTADO</span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-1 text-[9px] font-mono leading-tight pr-1">
                                {logs.length === 0 ? (
                                    <div className="text-amber-850 italic">Nenhum sinal detectado...</div>
                                ) : (
                                    logs.map((log, idx) => (
                                        <div key={idx} className={
                                            log.includes('⚠️') || log.includes('PERIGO') ? 'text-red-500' :
                                            log.includes('🛡️') || log.includes('🧭') ? 'text-cyan-400' :
                                            log.includes('🧴') || log.includes('⛺') ? 'text-emerald-400' : 'text-amber-600'
                                        }>
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Liminal Info Box */}
                        <div className="border border-amber-800/80 bg-amber-950/5 p-3 rounded flex flex-col gap-2 text-[10px] text-amber-600">
                            <div className="font-bold text-amber-400 flex items-center gap-1 uppercase"><Compass size={12} /> Níveis Conhecidos</div>
                            <div className="flex flex-col gap-2 max-h-[22vh] overflow-y-auto pr-1">
                                {BACKROOMS_LEVELS.map(lvl => (
                                    <div key={lvl.id} className="border-b border-amber-950 pb-1.5 flex flex-col gap-0.5">
                                        <div className="font-bold text-amber-500 flex justify-between">
                                            <span>{lvl.emoji} {lvl.name}</span>
                                            <span className="text-[8px] uppercase px-1 border border-amber-800/35 rounded">{lvl.dangerLevel}</span>
                                        </div>
                                        <p className="text-[9px] leading-relaxed text-amber-650">{lvl.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};
