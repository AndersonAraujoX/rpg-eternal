import React from 'react';
import { 
    Award, Shield, Flame, Zap, Compass, Sparkles, CheckCircle2, Lock, 
    TrendingUp, Swords, Fish, Pickaxe, Dices, Sprout, Skull
} from 'lucide-react';
import { calculateBackroomsTechnology } from '../../engine/backroomsTechnology';

export interface BackroomsMilestonesProps {
    floor: number;
    isUnlocked?: boolean;
}

interface MilestoneDef {
    floor: number;
    title: string;
    description: string;
    effect: string;
    category: 'Combate' | 'Guilda' | 'Minijogos' | 'Cosmic';
    icon: React.ReactNode;
    color: string;
}

const MILESTONES_LIST: MilestoneDef[] = [
    {
        floor: 2,
        title: 'Sifão Criogênico',
        description: 'Drena a resistência elemental das anomalias liminares.',
        effect: '-25% Resistência ao Gelo de Inimigos',
        category: 'Combate',
        icon: <Flame size={16} />,
        color: 'text-cyan-400 border-cyan-700 bg-cyan-950/20'
    },
    {
        floor: 10,
        title: 'Isca de Almond Water',
        description: 'Utiliza néctar de amêndoa para atrair peixes míticos.',
        effect: '+15% Chance de Pesca Lendária',
        category: 'Minijogos',
        icon: <Fish size={16} />,
        color: 'text-emerald-400 border-emerald-700 bg-emerald-950/20'
    },
    {
        floor: 18,
        title: 'Estandarte de Combate M.E.G.',
        description: 'Bandeira tática para defesa territorial em guerras.',
        effect: '+5% Escudo de Mitigação no GvG',
        category: 'Guilda',
        icon: <Shield size={16} />,
        color: 'text-blue-400 border-blue-700 bg-blue-950/20'
    },
    {
        floor: 30,
        title: 'Injetor de Ocultamento Quântico',
        description: 'Campos de invisibilidade que amplificam o impacto crítico.',
        effect: '+100% Dano Crítico ao Atacar em Furtividade',
        category: 'Combate',
        icon: <Swords size={16} />,
        color: 'text-purple-400 border-purple-700 bg-purple-950/20'
    },
    {
        floor: 38,
        title: 'Sobrecarga de Pulso Cinético',
        description: 'Vibrações ressonantes que duplicam impactos minerais.',
        effect: 'Dobra o acúmulo de combo no Mining Clicker (2x)',
        category: 'Minijogos',
        icon: <Pickaxe size={16} />,
        color: 'text-amber-400 border-amber-700 bg-amber-950/20'
    },
    {
        floor: 45,
        title: 'Gerador de Escudo GvG',
        description: 'Bateria de campo de força avançado para esquadrões de guilda.',
        effect: '+15% Mitigação Completa de Dano no GvG',
        category: 'Guilda',
        icon: <Shield size={16} />,
        color: 'text-blue-400 border-blue-700 bg-blue-950/20'
    },
    {
        floor: 55,
        title: 'Acelerador Temporal da Realidade',
        description: 'Distorce os segundos para recarga quase instantânea de magias.',
        effect: '-30% Tempo de Recarga das Habilidades de Heróis',
        category: 'Combate',
        icon: <Zap size={16} />,
        color: 'text-yellow-400 border-yellow-700 bg-yellow-950/20'
    },
    {
        floor: 65,
        title: 'Sorte Estabilizada por Dados',
        description: 'Previsão quântica de probabilidades de cassino e apostas.',
        effect: '+12% Modificador de Sorte no Dice Game',
        category: 'Minijogos',
        icon: <Dices size={16} />,
        color: 'text-orange-400 border-orange-700 bg-orange-950/20'
    },
    {
        floor: 72,
        title: 'Drones de Cerco GvG',
        description: 'Aparelhos automatizados que abrem caminhos rápidos em território hostil.',
        effect: '+20% Aceleração de Expedições de Guilda',
        category: 'Guilda',
        icon: <Compass size={16} />,
        color: 'text-cyan-400 border-cyan-700 bg-cyan-950/20'
    },
    {
        floor: 85,
        title: 'Supercompressor de Matéria Escura',
        description: 'Armazena vácuo denso para detonações singulares em combate.',
        effect: '10% de Chance de Explosão de Vácuo em Ataques',
        category: 'Combate',
        icon: <Sparkles size={16} />,
        color: 'text-fuchsia-400 border-fuchsia-700 bg-fuchsia-950/20'
    },
    {
        floor: 92,
        title: 'Solo Hipercorrompido do Vazio',
        description: 'Nutrientes de dimensões esquecidas que revitalizam a botânica.',
        effect: 'Desbloqueia aprimoramentos do Vazio no Jardim Místico',
        category: 'Minijogos',
        icon: <Sprout size={16} />,
        color: 'text-emerald-400 border-emerald-700 bg-emerald-950/20'
    },
    {
        floor: 100,
        title: 'Protocolo de Comando de Titãs',
        description: 'Acesso total à autoridade suprema contra monstros cósmicos.',
        effect: '+20% Dano Adicional contra Chefes Mundiais (World Boss)',
        category: 'Combate',
        icon: <Skull size={16} />,
        color: 'text-red-400 border-red-700 bg-red-950/20'
    }
];

export const BackroomsMilestones: React.FC<BackroomsMilestonesProps> = ({
    floor,
    isUnlocked = true
}) => {
    const techData = calculateBackroomsTechnology(floor, isUnlocked);
    const { scalars } = techData;

    const unlockedCount = MILESTONES_LIST.filter(m => floor >= m.floor).length;
    const totalCount = MILESTONES_LIST.length;
    const nextMilestone = MILESTONES_LIST.find(m => floor < m.floor);

    return (
        <div className="flex flex-col gap-5 font-mono text-amber-500">
            {/* Continuous Scalars Section */}
            <div className="bg-gradient-to-r from-amber-950/30 via-stone-900/90 to-amber-950/30 border border-amber-800/80 rounded-lg p-4 flex flex-col gap-3 shadow-inner">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-900/80 pb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-amber-400" />
                        <h3 className="text-xs md:text-sm font-black uppercase text-amber-300 tracking-wider">
                            Escalares Contínuos Globais (Andar {floor}/100)
                        </h3>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold bg-black/60 px-2 py-0.5 rounded border border-amber-900">
                        Crescimento Passivo por Profundidade
                    </span>
                </div>

                {/* 3 Scalar Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Elemental Damage */}
                    <div className="bg-black/70 border border-red-900/60 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                        <div className="flex justify-between items-center text-[10px] text-red-400 font-bold">
                            <span>🔥 Dano Elemental Global</span>
                            <span className="text-xs text-red-300 font-black">+{(scalars.globalElementalDamage * 100).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-red-950/80 h-2 rounded-full overflow-hidden border border-red-900/60 p-0.5">
                            <div 
                                className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (scalars.globalElementalDamage / 0.25) * 100)}%` }}
                            />
                        </div>
                        <span className="text-[8px] text-red-500/80">Máximo: +25.0% no Andar 100</span>
                    </div>

                    {/* Industrial Speed */}
                    <div className="bg-black/70 border border-amber-900/60 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                        <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold">
                            <span>⚙️ Velocidade Industrial</span>
                            <span className="text-xs text-amber-300 font-black">+{(scalars.industrialSpeed * 100).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-amber-950/80 h-2 rounded-full overflow-hidden border border-amber-900/60 p-0.5">
                            <div 
                                className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (scalars.industrialSpeed / 0.50) * 100)}%` }}
                            />
                        </div>
                        <span className="text-[8px] text-amber-500/80">Máximo: +50.0% no Andar 100</span>
                    </div>

                    {/* Offline Gold */}
                    <div className="bg-black/70 border border-yellow-900/60 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                        <div className="flex justify-between items-center text-[10px] text-yellow-400 font-bold">
                            <span>💰 Ouro Offline Passivo</span>
                            <span className="text-xs text-yellow-300 font-black">+{(scalars.offlineGoldBonus * 100).toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-yellow-950/80 h-2 rounded-full overflow-hidden border border-yellow-900/60 p-0.5">
                            <div 
                                className="bg-gradient-to-r from-yellow-600 to-amber-300 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, (scalars.offlineGoldBonus / 0.30) * 100)}%` }}
                            />
                        </div>
                        <span className="text-[8px] text-yellow-500/80">Máximo: +30.0% no Andar 100</span>
                    </div>
                </div>
            </div>

            {/* Milestones Header & Next Milestone Preview */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <Award size={18} className="text-amber-400" />
                    <h3 className="text-xs md:text-sm font-black uppercase text-amber-300 tracking-wider">
                        Marcos de Exploração Liminar ({unlockedCount}/{totalCount} Desbloqueados)
                    </h3>
                </div>

                {nextMilestone && (
                    <div className="bg-amber-950/60 border border-amber-700/80 px-3 py-1 rounded flex items-center gap-2 text-[10px]">
                        <span className="text-amber-400 uppercase font-bold">Próximo Marco:</span>
                        <span className="text-amber-200 font-black">Andar {nextMilestone.floor}</span>
                        <span className="text-amber-600">({nextMilestone.title})</span>
                    </div>
                )}
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto custom-scroll pr-1">
                {MILESTONES_LIST.map(milestone => {
                    const isPassed = floor >= milestone.floor;

                    return (
                        <div
                            key={milestone.floor}
                            className={`rounded-lg border-2 p-3.5 flex flex-col justify-between gap-3 transition-all ${
                                isPassed
                                    ? 'border-emerald-700/80 bg-emerald-950/15 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                                    : 'border-stone-850 bg-black/60 opacity-60'
                            }`}
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded border ${isPassed ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400' : 'border-stone-800 bg-black text-stone-600'}`}>
                                        {milestone.icon}
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold ${isPassed ? 'text-emerald-300' : 'text-stone-400'}`}>
                                            {milestone.title}
                                        </h4>
                                        <span className="text-[8px] text-amber-600 uppercase font-semibold">
                                            {milestone.category}
                                        </span>
                                    </div>
                                </div>

                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 ${
                                    isPassed
                                        ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                                        : 'bg-black text-stone-600 border-stone-800'
                                }`}>
                                    {isPassed ? <CheckCircle2 size={10} /> : <Lock size={10} />}
                                    Andar {milestone.floor}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-[10px] text-amber-650 leading-relaxed min-h-[32px]">
                                {milestone.description}
                            </p>

                            {/* Effect Pill */}
                            <div className={`p-2 rounded border text-[9px] font-bold flex items-center gap-1.5 ${
                                isPassed
                                    ? 'bg-black/70 border-emerald-800/80 text-emerald-400 shadow-inner'
                                    : 'bg-black/40 border-stone-900 text-stone-600'
                            }`}>
                                <Sparkles size={11} className={isPassed ? 'text-emerald-400 flex-shrink-0' : 'text-stone-600 flex-shrink-0'} />
                                <span>{milestone.effect}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
