import React from 'react';
import { X, Star, Lock } from 'lucide-react';

import { formatNumber } from '../../utils';

interface PrestigeNode {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number; // souls cost
    maxLevel: number;
    effect: string; // what it does (for display)
    row: number;
    col: number;
    requires?: string; // id of required node
}

const PRESTIGE_NODES: PrestigeNode[] = [
    // Row 0 - Base nodes
    { id: 'atk_1', name: 'Força das Almas', description: '+10% de Ataque por nível', icon: '⚔️', cost: 1, maxLevel: 10, effect: '+10% ATQ', row: 0, col: 1 },
    { id: 'hp_1', name: 'Vitalidade Eterna', description: '+10% de Vida Máxima por nível', icon: '❤️', cost: 1, maxLevel: 10, effect: '+10% HP', row: 0, col: 3 },
    { id: 'gold_1', name: 'Ambição do Renascido', description: '+15% de Ouro por nível', icon: '🪙', cost: 1, maxLevel: 10, effect: '+15% Ouro', row: 0, col: 2 },
    // Row 1 - Mid tier
    { id: 'atk_2', name: 'Alma Feroz', description: '+20% de Dano Crítico por nível', icon: '🔥', cost: 3, maxLevel: 5, effect: '+20% CRIT', row: 1, col: 1, requires: 'atk_1' },
    { id: 'hp_2', name: 'Sangue de Titã', description: '+30% de HP e regeneração', icon: '🛡️', cost: 3, maxLevel: 5, effect: '+30% HP+Regen', row: 1, col: 3, requires: 'hp_1' },
    { id: 'xp_1', name: 'Sabedoria Ancestral', description: '+25% de XP ganho por nível', icon: '📚', cost: 2, maxLevel: 8, effect: '+25% XP', row: 1, col: 2, requires: 'gold_1' },
    // Row 2 - Advanced
    { id: 'speed_1', name: 'Velocidade do Espírito', description: '+5% de velocidade de ataque', icon: '⚡', cost: 5, maxLevel: 5, effect: '+5% Vel.', row: 2, col: 1, requires: 'atk_2' },
    { id: 'souls_1', name: 'Coletor de Almas', description: '+20% de Almas ao renascer', icon: '👻', cost: 5, maxLevel: 5, effect: '+20% Almas', row: 2, col: 2, requires: 'xp_1' },
    { id: 'boss_1', name: 'Caçador de Chefes', description: '+50% de Ouro ao derrotar boss', icon: '💀', cost: 5, maxLevel: 5, effect: '+50% Boss Ouro', row: 2, col: 3, requires: 'hp_2' },
    // Row 3 - Legendary
    { id: 'legend_1', name: 'Lenda Imortal', description: 'Heróis começam no Nível 5 após renascer', icon: '🌟', cost: 15, maxLevel: 3, effect: 'Heróis Lvl 5+', row: 3, col: 2, requires: 'souls_1' },
];

interface PrestigeTreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    souls: number;
    prestigeNodes: Record<string, number>; // id -> level
    onBuyNode: (nodeId: string) => void;
}

export const PrestigeTreeModal: React.FC<PrestigeTreeModalProps> = ({ isOpen, onClose, souls, prestigeNodes, onBuyNode }) => {
    if (!isOpen) return null;

    const getNodeLevel = (id: string) => prestigeNodes[id] || 0;

    const isUnlocked = (node: PrestigeNode) => {
        if (!node.requires) return true;
        return getNodeLevel(node.requires) >= 1;
    };

    const canAfford = (node: PrestigeNode) => souls >= node.cost;
    const isMaxed = (node: PrestigeNode) => getNodeLevel(node.id) >= node.maxLevel;

    const rows = [0, 1, 2, 3];

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border-2 border-purple-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-gray-900 p-4 border-b border-purple-800 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-purple-300 text-xl font-bold flex items-center gap-2">🌀 Árvore de Poder Eterno</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Permanece entre renascimentos. Custo: Almas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-900/50 border border-purple-700 px-3 py-1 rounded-lg text-purple-300 font-bold flex items-center gap-1">
                            <Star size={14} /> {formatNumber(souls)} Almas
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {rows.map(row => {
                        const rowNodes = PRESTIGE_NODES.filter(n => n.row === row).sort((a, b) => a.col - b.col);
                        return (
                            <div key={row}>
                                <div className="flex justify-center gap-4 flex-wrap">
                                    {rowNodes.map(node => {
                                        const level = getNodeLevel(node.id);
                                        const unlocked = isUnlocked(node);
                                        const affordable = canAfford(node);
                                        const maxed = isMaxed(node);

                                        return (
                                            <div key={node.id}
                                                className={`relative bg-gray-800 rounded-xl border-2 p-4 w-44 transition-all ${maxed ? 'border-yellow-500 bg-yellow-900/20' : unlocked ? 'border-purple-600 hover:border-purple-400' : 'border-gray-700 opacity-60'}`}
                                            >
                                                {/* Level dots */}
                                                <div className="flex gap-0.5 mb-2 justify-center">
                                                    {Array.from({ length: node.maxLevel }, (_, i) => (
                                                        <div key={i} className={`w-2 h-2 rounded-full ${i < level ? 'bg-purple-400' : 'bg-gray-600'}`} />
                                                    ))}
                                                </div>

                                                <div className="text-center">
                                                    <div className="text-3xl mb-1">{node.icon}</div>
                                                    <div className="text-white font-bold text-sm">{node.name}</div>
                                                    <div className="text-gray-400 text-xs mt-0.5 h-8 overflow-hidden">{node.description}</div>
                                                    <div className="text-purple-400 font-bold text-sm mt-1">{node.effect}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">Nível {level}/{node.maxLevel}</div>
                                                </div>

                                                <div className="mt-3">
                                                    {maxed ? (
                                                        <div className="text-center text-yellow-400 font-bold text-xs py-1 border border-yellow-700 rounded bg-yellow-900/30">✨ MÁXIMO</div>
                                                    ) : !unlocked ? (
                                                        <div className="text-center text-gray-500 text-xs py-1 flex items-center justify-center gap-1"><Lock size={10} /> Bloqueado</div>
                                                    ) : (
                                                        <button
                                                            onClick={() => onBuyNode(node.id)}
                                                            disabled={!affordable}
                                                            className={`w-full py-1.5 rounded text-sm font-bold flex items-center justify-center gap-1 transition-colors ${affordable ? 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                                        >
                                                            <Star size={10} /> {node.cost} Almas
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Requires arrow indicator */}
                                                {node.requires && unlocked && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-purple-500 text-xs">▲</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {row < 3 && <div className="flex justify-center mt-3 text-purple-700 text-xl">↓</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export { PRESTIGE_NODES };
