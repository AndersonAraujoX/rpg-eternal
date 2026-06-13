import React from 'react';
import { Sword, Flame, Droplets, Leaf } from 'lucide-react';
import type { Boss, Pet, Artifact, Hero, CombatEvent } from '../engine/types';
import type { Synergy } from '../engine/synergies';
import { SynergyTracker } from './SynergyTracker';
import { formatNumber } from '../utils';

interface BattleAreaProps {
    boss: Boss;
    dungeonActive: boolean;
    dungeonTimer: number;
    ultimateCharge: number;
    pets: Pet[];
    actions: any;
    artifacts: Artifact[];
    heroes: Hero[];
    synergies?: Synergy[];
    globalSynergies?: any[];
    partyDps?: number;
    partyPower?: number;
    combatEvents?: CombatEvent[];
    suggestions?: string[];
    tower?: { active: boolean; floor: number; maxFloor: number };
    voidActive?: boolean;
    bossTimer?: number; // Countdown timer (seconds) to kill the boss
}

const getElementIcon = (el: string) => {
    if (el === 'fire') return <Flame size={12} className="text-red-400" />;
    if (el === 'water') return <Droplets size={12} className="text-blue-400" />;
    if (el === 'nature') return <Leaf size={12} className="text-green-400" />;
    return null;
};

interface Particle {
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    age: number;
}

export const BattleArea: React.FC<BattleAreaProps> = ({ boss, dungeonActive, dungeonTimer, ultimateCharge, pets, artifacts, actions, heroes = [], partyDps = 0, partyPower = 0, combatEvents = [], suggestions = [], synergies = [], globalSynergies = [], tower, voidActive = false, bossTimer = 60 }) => {
    const [particles, setParticles] = React.useState<Particle[]>([]);
    const [showSynergyTracker, setShowSynergyTracker] = React.useState(false);
    const [shake, setShake] = React.useState(false);
    const [flash, setFlash] = React.useState(false);
    const [victory, setVictory] = React.useState(false);
    const lastEventId = React.useRef<string | null>(null);
    const lastHp = React.useRef(boss.stats.hp);

    // Filter active heroes for visualization
    const activeCombatHeroes = React.useMemo(() =>
        (heroes || []).filter(h => h.assignment === 'combat' && h.unlocked),
        [heroes]);

    React.useEffect(() => {
        const last = combatEvents[combatEvents.length - 1];

        // Handle Boss Damage Feedback
        if (boss.stats.hp < lastHp.current) {
            setShake(true);
            setFlash(true);
            setTimeout(() => { setShake(false); setFlash(false); }, 200);
        }

        if (boss.isDead && lastHp.current > 0) {
            setVictory(true);
            setTimeout(() => setVictory(false), 1000);
        }

        lastHp.current = boss.stats.hp;

        if (last && last.id !== lastEventId.current) {
            lastEventId.current = last.id;

            let color = 'text-white text-lg font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
            if (last.type === 'reaction') color = 'text-orange-500 font-extrabold text-2xl animate-bounce shadow-black drop-shadow-md';
            else if (last.type === 'status') color = 'text-cyan-400 font-bold text-xl shadow-black drop-shadow-sm';
            else if (last.isCrit) color = 'text-yellow-400 font-black text-2xl animate-pulse shadow-black drop-shadow-md';
            else if (last.type === 'heal') color = 'text-green-400 font-bold text-lg';
            else if (last.id?.startsWith('heroatk')) color = 'text-red-400 font-bold text-lg';
            else if (last.id?.startsWith('bossatk')) color = 'text-red-600 font-medium text-base';

            const newParticle: Particle = {
                id: last.id,
                text: last.text,
                x: last.x || (50 + Math.random() * 10 - 5),
                y: last.y || 40,
                color: color,
                age: 0
            };
            setParticles(prev => [...prev, newParticle]);
        }
    }, [combatEvents]);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setParticles(prev => prev.length ? prev.map(p => ({ ...p, age: p.age + 1, y: p.y - 1 })).filter(p => p.age < 20) : prev);
        }, 50);
        return () => clearInterval(timer);
    }, []);

    const isTower = tower?.active;

    const getBackgroundClass = () => {
        if (voidActive) return 'bg-void';
        if (isTower) return 'bg-tower';
        if (dungeonActive) return 'bg-dungeon';
        if (boss.level > 300) return 'bg-space';
        if (boss.level > 100) return 'bg-cave';
        return 'bg-forest';
    };

    return (
        <div
            className={`flex-1 relative flex flex-col justify-between items-center p-4 overflow-hidden transition-all duration-1000 ${getBackgroundClass()} ${victory ? 'victory-glow' : ''}`}
            id="battle-field"
        >
            {/* Absolute background and decoration elements */}
            {isTower && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
            )}
            {isTower && (
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/60 to-transparent z-0"></div>
            )}
            {isTower && (
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/60 to-transparent z-0"></div>
            )}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center"><Sword className="w-64 h-64" /></div>

            {/* Artifacts (absolute top-left) */}
            <div className="absolute top-2 left-2 flex gap-1 z-20 flex-wrap max-w-[200px]">
                {artifacts.map(a => (
                    <div key={a.id} className="w-5 h-5 bg-yellow-900 border border-yellow-500 rounded flex items-center justify-center text-[10px] cursor-help" title={a.name}>{a.emoji}</div>
                ))}
            </div>

            {/* Particles (absolute) */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className={`absolute pointer-events-none transition-opacity duration-300 ${p.color}`}
                    style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1 - (p.age / 20) }}
                >
                    {p.text}
                </div>
            ))}

            {/* ================= IN-FLOW FLOW LAYOUT STACK ================= */}

            {/* 1. Boss Section */}
            <div className={`w-full flex flex-col items-center mt-2 transition-all relative z-10 ${shake ? 'shake-anim' : ''} ${flash ? 'impact-flash' : ''} ${voidActive ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,0,255,0.4)]' : ''}`}>
                {isTower && <div className="text-cyan-400 font-black text-xl mb-1 animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] font-retro">ANDAR {tower.floor}</div>}
                {dungeonActive && <div className="text-yellow-400 font-bold animate-pulse mb-2">COFRE DE OURO: {Math.floor(dungeonTimer)}s</div>}
                
                <div className="flex items-center gap-2">
                    <div 
                        className={`text-6xl md:text-8xl filter drop-shadow-2xl transition-transform cursor-pointer hover:scale-110 active:scale-90 select-none ${boss.stats.hp < boss.stats.maxHp * 0.9 ? 'animate-pulse' : ''} ${boss.isDead ? 'scale-0' : ''} ${isTower ? 'sepia-[0.5] brightness-125' : ''} ${voidActive ? 'animate-bounce drop-shadow-[0_0_20px_purple] scale-125' : ''}`}
                        onClick={() => actions.manualAttack && actions.manualAttack()}
                    >
                        {boss.emoji}
                    </div>
                    <div className="text-white opacity-50" title={`Elemento: ${boss.element}`}>{getElementIcon(boss.element)}</div>
                    
                    {/* Status Icons */}
                    <div className="flex gap-1">
                        {combatEvents?.some(e => e.type === 'reaction' && e.text.includes('BURN') && (Date.now() - parseInt(e.id.split('-')[1] || '0')) < 3000) && (
                            <span title="Queimando"><Flame size={16} className="text-orange-500 animate-pulse" /></span>
                        )}
                        {combatEvents?.some(e => e.type === 'status' && e.text.includes('FROZEN') && (Date.now() - parseInt(e.id.split('-')[1] || '0')) < 3000) && (
                            <span title="Congelado"><Droplets size={16} className="text-cyan-400 animate-pulse" /></span>
                        )}
                    </div>
                </div>

                {/* Boss Health Bar */}
                <div className="w-64 h-4 bg-gray-900 border border-gray-700 mt-2 bar-container relative rounded-full overflow-hidden shadow-lg">
                    <div className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300" style={{ width: `${(boss.stats.hp / boss.stats.maxHp) * 100}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-mono">{boss.stats.hp.toLocaleString()}/{boss.stats.maxHp.toLocaleString()}</div>
                </div>

                {/* Boss Timer */}
                {!tower?.active && (
                    <div className="w-64 mt-1.5">
                        <div
                            className={`w-full h-1.5 rounded-full overflow-hidden ${
                                bossTimer <= 10 ? 'bg-red-950 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                                : bossTimer <= 20 ? 'bg-orange-950'
                                : 'bg-gray-800'
                            }`}
                        >
                            <div
                                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                                    bossTimer <= 10 ? 'bg-red-500 animate-pulse'
                                    : bossTimer <= 20 ? 'bg-orange-400'
                                    : 'bg-cyan-500'
                                }`}
                                style={{ width: `${(bossTimer / 60) * 100}%` }}
                            />
                        </div>
                        <div className={`flex justify-between items-center mt-1 ${
                            bossTimer <= 10 ? 'text-red-400 font-bold' :
                            bossTimer <= 20 ? 'text-orange-400' :
                            'text-gray-400'
                        } text-[9px]`}>
                            <span className={bossTimer <= 10 ? 'animate-pulse' : ''}>⏱ {bossTimer}s</span>
                            <span className="text-gray-500">matar em 60s</span>
                        </div>
                    </div>
                )}

                {/* Ultimate Charge Bar */}
                <div className="w-64 h-1.5 bg-gray-900 border border-gray-800 mt-1.5 relative rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full transition-all duration-100 ${ultimateCharge >= 100 ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-cyan-600'}`} style={{ width: `${ultimateCharge}%` }}></div>
                </div>
            </div>

            {/* 2. Active Combat Heroes Section */}
            <div className="w-full max-w-xl bg-slate-950/60 border border-slate-800/40 backdrop-blur-md px-4 py-2.5 rounded-2xl flex flex-col items-center gap-1.5 z-10 shadow-xl my-2">
                <span className="text-[9px] text-amber-500/80 font-black uppercase tracking-widest font-mono">Heróis em Combate ({activeCombatHeroes.length})</span>
                <div className="flex flex-wrap justify-center gap-3">
                    {activeCombatHeroes.map(h => {
                        const xpPercent = Math.min(100, Math.floor(((h.xp || 0) / (h.maxXp || 100)) * 100));
                        return (
                            <div key={h.id} className="flex flex-col items-center gap-1 select-none transition-transform hover:scale-105">
                                <div className="text-2xl transition-all duration-500 animate-pulse drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" title={`${h.name} Lvl ${h.level}`}>
                                    {h.emoji}
                                </div>
                                <div className="bg-stone-900/95 border border-amber-950/40 px-1 py-0.5 rounded shadow-sm flex flex-col items-center w-10">
                                    <span className="text-[7px] text-amber-450 font-extrabold tracking-tighter leading-none">L{h.level}</span>
                                    <div className="w-full h-0.5 bg-stone-950 rounded-full overflow-hidden mt-0.5" title={`${h.xp}/${h.maxXp} XP`}>
                                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${xpPercent}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Companion Pets Section */}
            {pets && pets.length > 0 && (
                <div className="w-full max-w-lg bg-slate-950/45 border border-slate-900/30 backdrop-blur-sm px-4 py-2 rounded-xl flex flex-col items-center gap-1 z-10 shadow-lg my-1">
                    <span className="text-[8px] text-cyan-400/80 font-bold uppercase tracking-widest font-mono">Mascotes Ativos ({pets.length})</span>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[...pets].sort((a, b) => b.level - a.level).slice(0, 5).map((pet, idx) => {
                            const xpPercent = Math.min(100, Math.floor(((pet.xp || 0) / (pet.maxXp || 100)) * 100));
                            return (
                                <div key={pet.id} className="flex flex-col items-center gap-0.5 select-none transition-transform hover:scale-105">
                                    <div
                                        className="text-lg animate-bounce drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
                                        style={{ animationDelay: `${idx * 0.15}s`, animationDuration: '2s' }}
                                        title={`${pet.name} Lvl ${pet.level}`}
                                    >
                                        {pet.emoji}
                                    </div>
                                    <div className="bg-stone-900/95 border border-stone-850 px-1 py-0.5 rounded shadow-sm flex flex-col items-center w-8">
                                        <span className="text-[6px] text-cyan-400 font-bold tracking-tighter leading-none">L{pet.level}</span>
                                        <div className="w-full h-0.5 bg-stone-950 rounded-full overflow-hidden mt-0.5" title={`${pet.xp}/${pet.maxXp} XP`}>
                                            <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${xpPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {pets.length > 5 && (
                            <span className="text-[8px] font-black text-amber-400 bg-black/60 border border-amber-900/40 px-1 py-0.5 rounded shadow-sm self-end">
                                +{pets.length - 5}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 4. Party DPS Meter & Tactical Info Footer */}
            <div className="w-full flex justify-between items-end mt-2 z-10">
                <div className="bg-black/60 border border-yellow-900/20 px-2 py-1 rounded text-xs font-mono text-yellow-300 shadow">
                    DPS: {formatNumber(partyDps || 0)} | PODER: {formatNumber(partyPower || 0)}
                </div>

                <div className="flex gap-1 items-end">
                    <button
                        onClick={() => setShowSynergyTracker(!showSynergyTracker)}
                        className={`px-2 py-1 rounded text-xs border ${showSynergyTracker ? 'bg-yellow-600 border-yellow-300 text-black font-bold' : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                        title="Alternar Informações Táticas"
                    >
                        INFO
                    </button>
                    {synergies?.some(s => ['burn', 'freeze', 'steam', 'overload'].includes(s.type)) && (
                        <div className="animate-pulse text-xs font-bold text-orange-400 bg-black/60 border border-orange-900/20 px-2 py-1 rounded shadow ml-1">
                            REAÇÃO ATIVA
                        </div>
                    )}
                </div>

                {showSynergyTracker && (
                    <SynergyTracker
                        activeSynergies={synergies || []}
                        globalSynergies={globalSynergies || []}
                        suggestions={suggestions || []}
                        onClose={() => setShowSynergyTracker(false)}
                        className="bottom-12 right-0"
                    />
                )}
            </div>
        </div>
    );
};
