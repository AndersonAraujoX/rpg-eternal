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
    heroes: Hero[]; // Passed for hero effects or rendering behind boss
    synergies?: Synergy[];
    partyDps?: number;
    partyPower?: number;
    combatEvents?: CombatEvent[];
    suggestions?: string[];
    tower?: { active: boolean; floor: number; maxFloor: number };
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

export const BattleArea: React.FC<BattleAreaProps> = ({ boss, dungeonActive, dungeonTimer, ultimateCharge, pets, artifacts, actions, heroes = [], partyDps = 0, partyPower = 0, combatEvents = [], suggestions = [], synergies = [], tower }) => {
    const [particles, setParticles] = React.useState<Particle[]>([]);
    const [showSynergyTracker, setShowSynergyTracker] = React.useState(false);
    const [shake, setShake] = React.useState(false);
    const [flash, setFlash] = React.useState(false);
    const [victory, setVictory] = React.useState(false);
    const lastEventId = React.useRef<string | null>(null);
    const lastHp = React.useRef(boss.stats.hp);

    // Filter active heroes for visualization
    const activeCombatHeroes = React.useMemo(() =>
        (heroes || []).filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked),
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

            let color = 'text-white text-lg';
            if (last.type === 'reaction') color = 'text-orange-500 font-extrabold text-2xl animate-bounce shadow-black drop-shadow-md';
            else if (last.type === 'status') color = 'text-cyan-400 font-bold text-xl shadow-black drop-shadow-sm';
            else if (last.isCrit) color = 'text-yellow-400 font-bold text-xl';
            else if (last.type === 'heal') color = 'text-green-400 font-bold text-lg';

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
            setParticles(prev => prev.map(p => ({ ...p, age: p.age + 1, y: p.y - 1 })).filter(p => p.age < 20));
        }, 50);
        return () => clearInterval(timer);
    }, []);

    const isTower = tower?.active;

    const getBackgroundClass = () => {
        if (isTower) return 'bg-tower';
        if (dungeonActive) return 'bg-dungeon';
        if (boss.level > 300) return 'bg-space';
        if (boss.level > 100) return 'bg-cave';
        return 'bg-forest';
    };

    return (
        <div
            className={`flex-1 relative flex flex-col justify-between p-4 overflow-hidden transition-all duration-1000 ${getBackgroundClass()} ${victory ? 'victory-glow' : ''}`}
            id="battle-field"
        >
            {isTower && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
            )}
            {isTower && (
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/60 to-transparent z-0"></div>
            )}
            {isTower && (
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/60 to-transparent z-0"></div>
            )}
            {/* Hero Rendering */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex gap-2 z-10 opacity-80 pointer-events-none">
                {activeCombatHeroes.map(h => (
                    <div key={h.id} className="text-2xl animate-pulse" title={h.name}>
                        {h.emoji}
                    </div>
                ))}
            </div>

            {/* Pet Rendering */}

            {/* Particles */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className={`absolute pointer-events-none transition-opacity duration-300 ${p.color}`}
                    style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: 1 - (p.age / 20) }}
                >
                    {p.text}
                </div>
            ))}

            {/* Party DPS Meter & Synergies */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                <div className="bg-black bg-opacity-50 p-1 rounded text-xs font-mono text-yellow-300">
                    DPS: {formatNumber(partyDps || 0)} | PODER: {formatNumber(partyPower || 0)}
                </div>


                {/* Active Synergies */}
                <div className="flex gap-1 items-end">
                    <button
                        onClick={() => setShowSynergyTracker(!showSynergyTracker)}
                        className={`p-1 rounded text-xs border ${showSynergyTracker ? 'bg-yellow-600 border-yellow-300 text-black font-bold' : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                        title="Alternar Informações Táticas"
                    >
                        INFO
                    </button>
                    {synergies?.some(s => ['burn', 'freeze', 'steam', 'overload'].includes(s.type)) && (
                        <div className="animate-pulse text-xs font-bold text-orange-400 bg-black bg-opacity-50 px-1 rounded ml-1">
                            REAÇÃO ATIVA
                        </div>
                    )}
                </div>

                {showSynergyTracker && (
                    <SynergyTracker
                        activeSynergies={synergies || []}
                        suggestions={suggestions || []}
                        onClose={() => setShowSynergyTracker(false)}
                        className="bottom-12 right-0"
                    />
                )}
            </div>
            {/* Artifacts */}
            <div className="absolute top-2 left-2 flex gap-1 z-20 flex-wrap max-w-[200px]">
                {artifacts.map(a => (
                    <div key={a.id} className="w-5 h-5 bg-yellow-900 border border-yellow-500 rounded flex items-center justify-center text-[10px] cursor-help" title={a.name}>{a.emoji}</div>
                ))}
            </div>

            <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center"><Sword className="w-64 h-64" /></div>

            {/* Boss */}
            <div className={`flex flex-col items-center justify-center mt-2 transition-all relative z-10 ${shake ? 'shake-anim' : ''} ${flash ? 'impact-flash' : ''}`}>
                {isTower && <div className="text-cyan-400 font-black text-xl mb-1 animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">ANDAR {tower.floor}</div>}
                {dungeonActive && <div className="text-yellow-400 font-bold animate-pulse mb-2">COFRE DE OURO: {Math.floor(dungeonTimer)}s</div>}
                <div className="flex items-center gap-2">
                    <div className={`text-6xl md:text-8xl filter drop-shadow-2xl transition-transform ${boss.stats.hp < boss.stats.maxHp * 0.9 ? 'animate-pulse' : ''} ${boss.isDead ? 'scale-0' : ''} ${isTower ? 'sepia-[0.5] brightness-125' : ''}`}>{isTower ? '🏰' : boss.emoji}</div>
                    <div className="text-white opacity-50" title={`Elemento: ${boss.element}`}>{getElementIcon(boss.element)}</div>
                    {/* Status Icons based on recent events or state */}
                    <div className="flex gap-1">
                        {combatEvents?.some(e => e.type === 'reaction' && e.text.includes('BURN') && (Date.now() - parseInt(e.id.split('-')[1] || '0')) < 3000) && (
                            <span title="Queimando"><Flame size={16} className="text-orange-500 animate-pulse" /></span>
                        )}
                        {combatEvents?.some(e => e.type === 'status' && e.text.includes('FROZEN') && (Date.now() - parseInt(e.id.split('-')[1] || '0')) < 3000) && (
                            <span title="Congelado"><Droplets size={16} className="text-cyan-400 animate-pulse" /></span>
                        )}
                    </div>
                </div>

                <div className="w-48 h-4 bg-gray-700 mt-2 bar-container relative rounded">
                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(boss.stats.hp / boss.stats.maxHp) * 100}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white z-10">{boss.stats.hp}/{boss.stats.maxHp}</div>
                </div>

                <div className="w-48 h-1 bg-gray-800 mt-1 relative rounded overflow-hidden">
                    <div className={`h-full transition-all duration-100 ${ultimateCharge >= 100 ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-800'}`} style={{ width: `${ultimateCharge}%` }}></div>
                </div>

                <div className="mt-2 text-xs font-mono text-gray-400 flex flex-col items-center">
                    <span className="text-red-400 font-bold">{partyDps.toLocaleString()} DPS</span>
                </div>
            </div>

            {/* Pet */}
            {/* Pets List */}
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 flex flex-col gap-2 z-20 max-h-[80%] overflow-y-auto overflow-x-hidden w-24 scrollbar-hide">
                {pets && [...pets].sort((a, b) => b.level - a.level).map(pet => (
                    <div key={pet.id} className="flex flex-col items-center opacity-90 group relative">
                        <div className="text-3xl filter drop-shadow hover:scale-110 transition-transform cursor-pointer animate-bounce" title={`Nvl ${pet.level} ${pet.name}`}>
                            {pet.emoji}
                        </div>
                        {/* Hover Details */}
                        <div className="hidden group-hover:flex absolute left-full top-0 ml-2 bg-black bg-opacity-90 p-2 rounded border border-yellow-500 flex-col z-50 whitespace-nowrap">
                            <span className="font-bold text-yellow-400">{pet.name} (Nvl {pet.level})</span>
                            <span className="text-xs text-gray-300">{pet.bonus}</span>
                        </div>

                        <div className="flex flex-col items-center bg-black bg-opacity-50 p-1 rounded backdrop-blur-sm mt-1 w-full">
                            <span className="text-[8px] text-orange-300 font-bold mb-0.5">Nvl {pet.level}</span>
                            <div className="w-10 h-1 bg-gray-700 rounded-full overflow-hidden mb-1">
                                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${(pet.xp / pet.maxXp) * 100}%` }}></div>
                            </div>
                            <div className="flex gap-1 opacity-100 transition-opacity">
                                <button onClick={() => actions.feedPet('gold', pet.id)} className="w-4 h-4 bg-yellow-600 rounded flex items-center justify-center text-[6px] text-white hover:bg-yellow-500" title="Alimentar com 100 de Ouro" disabled={false}>$</button>
                                <button onClick={() => actions.feedPet('souls', pet.id)} className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center text-[6px] text-white hover:bg-purple-500" title="Alimentar com 10 Almas">A</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
