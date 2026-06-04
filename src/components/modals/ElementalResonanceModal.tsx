import React from 'react';
import { Sparkles, Zap, Shield, Flame, Droplet, Sun, Moon, Leaf, Compass, X } from 'lucide-react';
import type { ElementType } from '../../engine/types';
import { formatNumber } from '../../utils';

interface ElementalResonanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    elementalResonance: Record<ElementType, number>;
    elementalEssences: Record<ElementType, number>;
    actions: {
        upgradeResonance: (element: ElementType) => void;
    };
}

interface ElementInfo {
    id: ElementType;
    name: string;
    description: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    icon: React.ReactNode;
    emoji: string;
}

export const ElementalResonanceModal: React.FC<ElementalResonanceModalProps> = ({
    isOpen,
    onClose,
    elementalResonance,
    elementalEssences,
    actions
}) => {
    if (!isOpen) return null;

    const ELEMENTS_INFO: ElementInfo[] = [
        {
            id: 'neutral',
            name: 'Equilíbrio (Neutro)',
            description: '+1.5% Ouro & XP globais por nível',
            colorClass: 'text-gray-300',
            bgClass: 'bg-gray-950/40',
            borderClass: 'border-gray-800/80 hover:border-gray-650',
            icon: <Compass className="w-5 h-5 text-gray-400" />,
            emoji: '⚪'
        },
        {
            id: 'fire',
            name: 'Chama (Fogo)',
            description: '+2.5% multiplicador de Dano por nível',
            colorClass: 'text-red-400',
            bgClass: 'bg-red-950/20',
            borderClass: 'border-red-900/30 hover:border-red-500/50',
            icon: <Flame className="w-5 h-5 text-red-500" />,
            emoji: '🔥'
        },
        {
            id: 'water',
            name: 'Maré (Água)',
            description: '+1.5% HP Máximo & Defesa por nível',
            colorClass: 'text-blue-400',
            bgClass: 'bg-blue-950/20',
            borderClass: 'border-blue-900/30 hover:border-blue-500/50',
            icon: <Droplet className="w-5 h-5 text-blue-500" />,
            emoji: '💧'
        },
        {
            id: 'nature',
            name: 'Crescimento (Natureza)',
            description: '+2.0% Velocidade de combate por nível',
            colorClass: 'text-emerald-400',
            bgClass: 'bg-emerald-950/20',
            borderClass: 'border-emerald-900/30 hover:border-emerald-500/50',
            icon: <Leaf className="w-5 h-5 text-emerald-500" />,
            emoji: '🍃'
        },
        {
            id: 'light',
            name: 'Aurora (Luz)',
            description: '+1.0% Roubo de Vida global por nível',
            colorClass: 'text-yellow-400',
            bgClass: 'bg-yellow-950/15',
            borderClass: 'border-yellow-900/35 hover:border-yellow-500/50',
            icon: <Sun className="w-5 h-5 text-yellow-500" />,
            emoji: '☀️'
        },
        {
            id: 'dark',
            name: 'Eclipse (Trevas)',
            description: '+2.0% Dano Crítico global por nível',
            colorClass: 'text-purple-400',
            bgClass: 'bg-purple-950/20',
            borderClass: 'border-purple-900/30 hover:border-purple-500/50',
            icon: <Moon className="w-5 h-5 text-purple-500" />,
            emoji: '🌑'
        }
    ];

    const getUpgradeCost = (currentLevel: number) => {
        return Math.floor(10 * Math.pow(1.5, currentLevel));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-indigo-900/50 rounded-xl p-6 max-w-3xl w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-3 bg-indigo-950/40 rounded-lg border border-indigo-900/30">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-500">
                            Templo Elemental
                        </h2>
                        <p className="text-gray-400 text-sm">Use essências extraídas de chefes e monstros para despertar ressonâncias elementais permanentes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                    {ELEMENTS_INFO.map(el => {
                        const level = elementalResonance[el.id] || 0;
                        const essence = elementalEssences[el.id] || 0;
                        const cost = getUpgradeCost(level);
                        const canUpgrade = essence >= cost;

                        return (
                            <div
                                key={el.id}
                                className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 ${el.bgClass} ${el.borderClass}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-gray-950/40 rounded border border-gray-800/80">
                                            {el.icon}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${el.colorClass}`}>{el.name}</h4>
                                            <span className="text-gray-500 text-[10px]">Ressonância Atual</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-950/60 px-2 py-0.5 rounded border border-gray-800 text-xs font-bold text-indigo-300">
                                        Nível {level}
                                    </div>
                                </div>

                                <div className="my-3 text-xs text-gray-300 leading-relaxed min-h-[32px]">
                                    {el.description}
                                    <div className="text-[10px] text-gray-550 mt-0.5">
                                        Bônus atual: <span className="text-indigo-400 font-semibold">
                                            {el.id === 'neutral' && `+${(level * 1.5).toFixed(1)}% Ouro/XP`}
                                            {el.id === 'fire' && `+${(level * 2.5).toFixed(1)}% Dano`}
                                            {el.id === 'water' && `+${(level * 1.5).toFixed(1)}% HP & Defesa`}
                                            {el.id === 'nature' && `+${(level * 2.0).toFixed(1)}% Velocidade`}
                                            {el.id === 'light' && `+${(level * 1.0).toFixed(1)}% Vampirismo`}
                                            {el.id === 'dark' && `+${(level * 2.0).toFixed(1)}% Dano Crítico`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-2 border-t border-gray-800/40 pt-3">
                                    <div className="text-xs">
                                        <div className="text-gray-500">Suas Essências:</div>
                                        <span className="font-bold text-gray-300 flex items-center gap-1">
                                            {el.emoji} {formatNumber(essence)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => actions.upgradeResonance(el.id)}
                                        disabled={!canUpgrade}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${canUpgrade
                                            ? 'bg-indigo-650 hover:bg-indigo-550 border border-indigo-500 text-white hover:scale-[1.03] shadow-md shadow-indigo-900/10'
                                            : 'bg-gray-850 border border-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Melhorar (Custo: {cost})
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
