import React from 'react';
import { 
    X, Shield, Heart, Zap, Coins, Trophy, Flame, Sparkles, BookOpen, AlertTriangle, Play 
} from 'lucide-react';
import type { 
    RoguelikeClass, RoguelikeRunState, RoguelikeUpgrade 
} from '../../engine/roguelike';
import { ROGUELIKE_UPGRADES, RELICS_POOL } from '../../engine/roguelike';

interface RoguelikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    run: RoguelikeRunState;
    emberFragments: number;
    upgrades: Record<string, number>;
    actions: {
        startRoguelikeRun: (classType: RoguelikeClass) => void;
        selectRoguelikeNode: (index: number) => void;
        performRoguelikeCombatAction: (action: 'attack' | 'skill' | 'defend' | 'flee') => void;
        resolveRoguelikeRest: (action: 'heal' | 'sharpen' | 'meditate') => void;
        resolveRoguelikeEventOption: (optionIndex: number) => void;
        buyRoguelikeUpgrade: (id: string) => void;
        abandonRoguelikeRun: () => void;
    };
}

export const RoguelikeModal: React.FC<RoguelikeModalProps> = ({
    isOpen, onClose, run, emberFragments, upgrades, actions
}) => {
    if (!isOpen) return null;

    const renderUpgradeShop = () => {
        return (
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={16} /> Aprimoramentos de Brasa (Permanentes)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ROGUELIKE_UPGRADES.map(upg => {
                        const level = upgrades[upg.id] || 0;
                        const isMax = level >= upg.maxLevel;
                        const cost = Math.floor(upg.baseCost * Math.pow(upg.costScaling, level));
                        const canBuy = emberFragments >= cost && !isMax;

                        return (
                            <div key={upg.id} className="bg-slate-900 border border-slate-700/60 rounded p-3 flex justify-between items-center hover:border-slate-600 transition-colors">
                                <div className="flex flex-col gap-1 pr-2">
                                    <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                                        {upg.name} <span className="text-[10px] bg-slate-800 text-amber-400 px-1 rounded">Nvl {level}/{upg.maxLevel}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">{upg.description}</p>
                                </div>
                                <button 
                                    onClick={() => actions.buyRoguelikeUpgrade(upg.id)}
                                    disabled={!canBuy}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                                        isMax ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                                        canBuy ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_10px_rgba(217,119,6,0.3)]' :
                                        'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                                    }`}
                                >
                                    {isMax ? 'MÁXIMO' : `🔥 ${cost}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 md:p-4 overflow-auto">
            <div className="bg-slate-900 border-4 border-indigo-900 rounded-lg w-full max-w-3xl shadow-2xl relative text-slate-100 flex flex-col font-sans overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-950 px-4 py-3 border-b-4 border-indigo-900 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl animate-pulse">🌀</span>
                        <h2 className="text-lg font-black tracking-widest text-indigo-200 uppercase">Masmorra de Brasa</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-850 px-3 py-1 rounded-full border border-orange-500/40 text-xs font-bold text-orange-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(249,115,22,0.15)]">
                            <Flame size={14} className="animate-bounce" /> {emberFragments} Fragmentos
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-black/40 p-1 rounded-full border border-slate-850"><X size={16} /></button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                    
                    {/* STATUS: NONE (Setup Run) */}
                    {run.status === 'none' && (
                        <div className="flex flex-col gap-5 py-2">
                            <div className="text-center flex flex-col gap-2">
                                <h3 className="text-base font-bold text-slate-200">Prepare sua Incursão Roguelike</h3>
                                <p className="text-xs text-slate-400 max-w-lg mx-auto">Escolha um herói inicial para adentrar na masmorra de 10 andares. Toda a progressão dentro da masmorra é temporária, mas os fragmentos de brasa coletados são permanentes!</p>
                            </div>

                            {/* Class Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Warrior */}
                                <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 flex flex-col items-center text-center gap-3 hover:border-orange-500/50 hover:shadow-lg transition-all group">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">⚔️</span>
                                    <div className="flex flex-col gap-0.5">
                                        <h4 className="text-sm font-bold text-orange-400 uppercase">Guerreiro</h4>
                                        <p className="text-[10px] text-slate-400">Atributos equilibrados & alta armadura</p>
                                    </div>
                                    <div className="text-[10px] text-slate-300 w-full bg-slate-900/50 rounded py-2 px-1 flex flex-col gap-1 font-mono">
                                        <div>❤️ HP: 80 | ⚡ SP: 8</div>
                                        <div>⚔️ ATK: 12 | 🛡️ DEF: 6</div>
                                    </div>
                                    <button 
                                        onClick={() => actions.startRoguelikeRun('warrior')}
                                        className="w-full bg-orange-700 hover:bg-orange-600 text-white font-bold text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Play size={12} /> Escolher
                                    </button>
                                </div>

                                {/* Mage */}
                                <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 flex flex-col items-center text-center gap-3 hover:border-blue-500/50 hover:shadow-lg transition-all group">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">🪄</span>
                                    <div className="flex flex-col gap-0.5">
                                        <h4 className="text-sm font-bold text-blue-400 uppercase">Mago</h4>
                                        <p className="text-[10px] text-slate-400">Poder destrutivo & alta mana</p>
                                    </div>
                                    <div className="text-[10px] text-slate-300 w-full bg-slate-900/50 rounded py-2 px-1 flex flex-col gap-1 font-mono">
                                        <div>❤️ HP: 50 | ⚡ SP: 10</div>
                                        <div>🔮 MP: 50 | 🪄 MAG: 15</div>
                                    </div>
                                    <button 
                                        onClick={() => actions.startRoguelikeRun('mage')}
                                        className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Play size={12} /> Escolher
                                    </button>
                                </div>

                                {/* Ranger */}
                                <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 flex flex-col items-center text-center gap-3 hover:border-green-500/50 hover:shadow-lg transition-all group">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">🏹</span>
                                    <div className="flex flex-col gap-0.5">
                                        <h4 className="text-sm font-bold text-green-400 uppercase">Arqueiro</h4>
                                        <p className="text-[10px] text-slate-400">Veloz & defende atacando</p>
                                    </div>
                                    <div className="text-[10px] text-slate-300 w-full bg-slate-900/50 rounded py-2 px-1 flex flex-col gap-1 font-mono">
                                        <div>❤️ HP: 65 | ⚡ SP: 14</div>
                                        <div>⚔️ ATK: 9 | 🛡️ DEF: 4</div>
                                    </div>
                                    <button 
                                        onClick={() => actions.startRoguelikeRun('ranger')}
                                        className="w-full bg-green-700 hover:bg-green-600 text-white font-bold text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Play size={12} /> Escolher
                                    </button>
                                </div>
                            </div>

                            {/* Upgrades */}
                            {renderUpgradeShop()}
                        </div>
                    )}

                    {/* STATUS: EXPLORING (Map View) */}
                    {run.status === 'exploring' && run.hero && (
                        <div className="flex flex-col gap-4">
                            {/* Run Hero Stats Header */}
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-wrap justify-between items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{run.hero.classType === 'warrior' ? '⚔️' : run.hero.classType === 'mage' ? '🪄' : '🏹'}</span>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-300">{run.hero.classType}</div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                                            <span className="text-red-400 flex items-center gap-0.5"><Heart size={10} /> {run.hero.hp}/{run.hero.maxHp}</span>
                                            <span className="text-blue-400 flex items-center gap-0.5"><Zap size={10} /> {run.hero.mp}/{run.hero.maxMp}</span>
                                            <span className="text-yellow-400 flex items-center gap-0.5"><Coins size={10} /> {run.gold} Ouro</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Relics List */}
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Relíquias:</span>
                                    {run.relics.length === 0 ? (
                                        <span className="text-[10px] text-slate-500 italic">Nenhuma</span>
                                    ) : (
                                        run.relics.map((relic, idx) => (
                                            <div 
                                                key={`${relic.id}-${idx}`} 
                                                className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 group relative cursor-help"
                                            >
                                                <span>{relic.emoji}</span>
                                                <span className="text-slate-350">{relic.name}</span>
                                                <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-750 text-[9px] rounded p-2 text-slate-200 z-50 w-44 shadow-lg text-center">
                                                    <div className="font-bold text-amber-400 mb-0.5">{relic.name}</div>
                                                    <div>{relic.description}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Node Path Map */}
                            <div className="bg-slate-900 border-2 border-indigo-900/60 rounded-lg p-5 flex flex-col gap-4">
                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest text-center">Progresso da Incursão</h3>
                                
                                <div className="flex items-center justify-between gap-1 overflow-x-auto py-4 px-2 bg-slate-950/40 rounded border border-slate-800">
                                    {run.nodes.map((node, idx) => {
                                        const isPast = idx < run.currentNodeIndex;
                                        const isActive = idx === run.currentNodeIndex;
                                        const isNext = idx === run.currentNodeIndex + 1;
                                        const isLocked = idx > run.currentNodeIndex + 1;

                                        let stateClass = 'bg-slate-800 border-slate-700 text-slate-500 opacity-60';
                                        let lineClass = 'bg-slate-850';
                                        
                                        if (isPast) {
                                            stateClass = 'bg-emerald-950 border-emerald-500 text-emerald-300';
                                            lineClass = 'bg-emerald-700';
                                        } else if (isActive) {
                                            stateClass = 'bg-slate-700 border-indigo-500 text-white scale-115 ring-2 ring-indigo-500/50';
                                        } else if (isNext) {
                                            stateClass = 'bg-indigo-900 hover:bg-indigo-800 border-indigo-400 text-indigo-200 hover:scale-110 cursor-pointer animate-pulse ring-2 ring-indigo-400/30';
                                        }

                                        return (
                                            <React.Fragment key={idx}>
                                                {idx > 0 && <div className={`h-1 flex-1 min-w-[12px] max-w-[40px] rounded ${lineClass}`} />}
                                                <button
                                                    disabled={!isNext}
                                                    onClick={() => actions.selectRoguelikeNode(idx)}
                                                    className={`w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center font-bold text-xs transition-all relative ${stateClass}`}
                                                    title={node.name}
                                                >
                                                    <span className="text-sm">{node.icon}</span>
                                                    <span className="absolute top-full mt-1 text-[8px] text-slate-400 font-mono whitespace-nowrap">{idx + 1}F</span>
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer control */}
                            <div className="flex justify-end mt-2">
                                <button 
                                    onClick={actions.abandonRoguelikeRun}
                                    className="bg-red-950 border border-red-800 hover:bg-red-900 text-red-300 font-bold text-[10px] uppercase px-3 py-1.5 rounded transition-all"
                                >
                                    Abandonar Incursão
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STATUS: COMBAT */}
                    {run.status === 'combat' && run.combatState && run.hero && (
                        <div className="flex flex-col gap-4">
                            {/* Grid Arena */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Player */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{run.hero.classType === 'warrior' ? '⚔️' : run.hero.classType === 'mage' ? '🪄' : '🏹'}</span>
                                            <div>
                                                <div className="text-xs font-bold uppercase text-slate-200">Você ({run.hero.classType})</div>
                                                <div className="text-[10px] text-slate-400">Velocidade: {run.hero.speed}</div>
                                            </div>
                                        </div>
                                        {run.combatState.shield > 0 && (
                                            <div className="bg-blue-900/60 border border-blue-500 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                <Shield size={10} /> +{run.combatState.shield} Escudo
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* HP Bar */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] font-mono">
                                            <span>HP: {run.hero.hp}/{run.hero.maxHp}</span>
                                        </div>
                                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700">
                                            <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, (run.hero.hp / run.hero.maxHp) * 100)}%` }} />
                                        </div>
                                    </div>

                                    {/* MP Bar */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] font-mono text-blue-400">
                                            <span>MP: {run.hero.mp}/{run.hero.maxMp}</span>
                                        </div>
                                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
                                            <div className="bg-blue-650 h-full rounded-full transition-all duration-350" style={{ width: `${(run.hero.mp / run.hero.maxMp) * 100}%` }} />
                                        </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-350 bg-slate-900/40 p-2 rounded border border-slate-750 font-mono mt-1">
                                        <div>🗡️ ATK: {run.hero.attack}</div>
                                        <div>🛡️ DEF: {run.hero.defense}</div>
                                        <div>🪄 MAG: {run.hero.magic}</div>
                                    </div>
                                </div>

                                {/* Enemy */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{run.combatState.enemy.emoji}</span>
                                            <div>
                                                <div className="text-xs font-bold uppercase text-red-400">{run.combatState.enemy.name}</div>
                                                <div className="text-[10px] text-slate-400">Inimigo do Passo {run.currentNodeIndex + 1}</div>
                                            </div>
                                        </div>
                                        {run.combatState.enemyShield > 0 && (
                                            <div className="bg-blue-900/60 border border-blue-500 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                <Shield size={10} /> +{run.combatState.enemyShield} Escudo
                                            </div>
                                        )}
                                    </div>

                                    {/* HP Bar */}
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex justify-between text-[10px] font-mono">
                                            <span>HP: {run.combatState.enemy.hp}/{run.combatState.enemy.maxHp}</span>
                                        </div>
                                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700">
                                            <div className="bg-red-750 h-full rounded-full transition-all duration-300" style={{ width: `${(run.combatState.enemy.hp / run.combatState.enemy.maxHp) * 100}%` }} />
                                        </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-350 bg-slate-900/40 p-2 rounded border border-slate-750 font-mono mt-6">
                                        <div>⚔️ ATK: {run.combatState.enemy.attack}</div>
                                        <div>🛡️ DEF: {run.combatState.enemy.defense}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Combat Log */}
                            <div className="bg-slate-950 border border-slate-800 rounded p-3 h-28 overflow-y-auto flex flex-col gap-1 font-mono text-[10px] text-slate-400">
                                {run.combatState.log.map((logLine, idx) => (
                                    <div key={idx} className={logLine.startsWith('Você') ? 'text-cyan-300' : logLine.startsWith('O') ? 'text-red-400' : 'text-slate-400'}>
                                        {logLine}
                                    </div>
                                ))}
                            </div>

                            {/* Combat Actions */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <button 
                                    onClick={() => actions.performRoguelikeCombatAction('attack')}
                                    className="bg-indigo-700 hover:bg-indigo-650 border border-indigo-500 font-bold text-xs py-2 rounded text-white shadow transition-all"
                                >
                                    ⚔️ Atacar
                                </button>
                                <button 
                                    onClick={() => actions.performRoguelikeCombatAction('skill')}
                                    className="bg-blue-700 hover:bg-blue-650 border border-blue-500 font-bold text-xs py-2 rounded text-white shadow transition-all"
                                >
                                    🪄 Habilidade ({run.hero.classType === 'mage' ? 'Bola Fogo' : run.hero.classType === 'warrior' ? 'Golpe Trespassante' : 'Disparo Rápido'})
                                </button>
                                <button 
                                    onClick={() => actions.performRoguelikeCombatAction('defend')}
                                    className="bg-slate-700 hover:bg-slate-600 border border-slate-500 font-bold text-xs py-2 rounded text-white shadow transition-all"
                                >
                                    🛡️ Defender
                                </button>
                                <button 
                                    onClick={() => actions.performRoguelikeCombatAction('flee')}
                                    className="bg-red-950 hover:bg-red-900 border border-red-800 font-bold text-xs py-2 rounded text-red-350 shadow transition-all"
                                >
                                    🏃‍♂️ Fugir
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STATUS: EVENT */}
                    {run.status === 'event' && run.eventState && (
                        <div className="bg-slate-850 border border-slate-700 rounded-lg p-5 flex flex-col gap-4">
                            <h3 className="text-sm font-black uppercase text-amber-500 tracking-widest flex items-center gap-1.5">
                                <Sparkles size={16} /> {run.eventState.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{run.eventState.description}</p>
                            
                            <div className="flex flex-col gap-2 mt-2">
                                {run.eventState.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => actions.resolveRoguelikeEventOption(idx)}
                                        className="bg-slate-805 hover:bg-slate-750 border border-slate-700 text-left px-4 py-2.5 rounded text-xs text-slate-200 transition-colors flex justify-between items-center group"
                                    >
                                        <span>{opt.text}</span>
                                        <span className="text-[10px] text-slate-500 group-hover:text-amber-500 font-mono italic">
                                            {opt.effect === 'heal' && '+20 HP'}
                                            {opt.effect === 'gain_relic' && '+1 Relíquia'}
                                            {opt.effect === 'lose_hp_gain_relic' && '-15 HP | +1 Relíquia'}
                                            {opt.effect === 'gain_gold' && '+15 Ouro'}
                                            {opt.effect === 'lose_gold_gain_relic' && '-15 Ouro | +1 Relíquia'}
                                            {opt.effect === 'nothing' && 'Sem efeito'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STATUS: REST */}
                    {run.status === 'rest' && run.hero && (
                        <div className="bg-slate-850 border border-slate-700 rounded-lg p-5 flex flex-col items-center gap-5 text-center">
                            <span className="text-5xl animate-bounce">⛺</span>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-base font-black text-amber-500 uppercase">Fogueira de Descanso</h3>
                                <p className="text-xs text-slate-400">Você encontrou um local seguro nas ruínas para montar acampamento. Escolha como quer passar seu tempo.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-2">
                                <button
                                    onClick={() => actions.resolveRoguelikeRest('heal')}
                                    className="bg-slate-900 border border-slate-700 hover:border-emerald-500/50 p-4 rounded-lg flex flex-col items-center gap-2 hover:shadow-lg transition-all"
                                >
                                    <Heart className="text-emerald-500" size={24} />
                                    <span className="text-xs font-bold text-slate-200">Descansar</span>
                                    <span className="text-[10px] text-slate-400">Recupera 40% HP</span>
                                </button>
                                <button
                                    onClick={() => actions.resolveRoguelikeRest('sharpen')}
                                    className="bg-slate-900 border border-slate-700 hover:border-orange-500/50 p-4 rounded-lg flex flex-col items-center gap-2 hover:shadow-lg transition-all"
                                >
                                    <Flame className="text-orange-500" size={24} />
                                    <span className="text-xs font-bold text-slate-200">Afiar Armas</span>
                                    <span className="text-[10px] text-slate-400">+2 Ataque permanente na corrida</span>
                                </button>
                                <button
                                    onClick={() => actions.resolveRoguelikeRest('meditate')}
                                    className="bg-slate-900 border border-slate-700 hover:border-blue-500/50 p-4 rounded-lg flex flex-col items-center gap-2 hover:shadow-lg transition-all"
                                >
                                    <Sparkles className="text-blue-500" size={24} />
                                    <span className="text-xs font-bold text-slate-200">Meditar</span>
                                    <span className="text-[10px] text-slate-400">Recupera toda Mana & +2 Magia</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STATUS: VICTORY */}
                    {run.status === 'victory' && (
                        <div className="bg-emerald-950/70 border-2 border-emerald-500 rounded-lg p-6 flex flex-col items-center text-center gap-4">
                            <span className="text-6xl animate-bounce">👑</span>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-black text-emerald-400 uppercase tracking-widest">Masmorra Concluída!</h3>
                                <p className="text-xs text-slate-350">Seu herói superou todas as intempéries e derrotou o Chefe do 10º Andar!</p>
                            </div>
                            
                            <div className="bg-slate-900 border border-slate-700/60 p-4 rounded text-xs text-slate-300 flex flex-col gap-2 min-w-[240px] font-mono mt-2 shadow-inner">
                                <div className="text-amber-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
                                    <span>Recompensa Coletada:</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>🔥 Fragmentos de Brasa:</span>
                                    <span className="text-orange-400 font-bold">+10 (+Incursão)</span>
                                </div>
                                <div className="flex justify-between text-slate-400 text-[10px]">
                                    <span>Ouro coletado na run:</span>
                                    <span>{run.gold} Ouro (descartado)</span>
                                </div>
                            </div>

                            <button
                                onClick={actions.abandonRoguelikeRun}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2 rounded-full mt-3 transition-all hover:scale-105 shadow-md shadow-emerald-700/30"
                            >
                                Reivindicar & Retornar
                            </button>
                        </div>
                    )}

                    {/* STATUS: DEFEAT */}
                    {run.status === 'defeat' && (
                        <div className="bg-red-950/75 border-2 border-red-500 rounded-lg p-6 flex flex-col items-center text-center gap-4">
                            <span className="text-6xl">💀</span>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-black text-red-400 uppercase tracking-widest">O Herói Tombou!</h3>
                                <p className="text-xs text-slate-400">Você perdeu todas as vidas nas profundezas da Masmorra de Brasa.</p>
                            </div>

                            <button
                                onClick={actions.abandonRoguelikeRun}
                                className="bg-red-800 hover:bg-red-750 text-white font-bold text-xs px-6 py-2 rounded-full mt-3 transition-all hover:scale-105"
                            >
                                Retornar ao Acampamento
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
