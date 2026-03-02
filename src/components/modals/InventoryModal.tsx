import React from 'react';
import { Briefcase, Shield, Sword, Zap, Heart } from 'lucide-react';
import type { Item } from '../../engine/types';
import { formatNumber } from '../../utils';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: Item[];
}

const RARITY_COLORS: Record<string, string> = {
    legendary: 'bg-orange-600 text-white',
    epic: 'bg-purple-600 text-white',
    rare: 'bg-blue-600 text-white',
    common: 'bg-gray-600 text-white',
};

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'common'];

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, items }) => {
    if (!isOpen) return null;

    // --- Aggregate all item stats ---
    const totals: Record<string, number> = {};
    items.forEach(item => {
        if (item.stat && item.value) {
            totals[item.stat] = (totals[item.stat] || 0) + item.value;
        }
        // Count rune bonuses
        item.runes?.forEach(r => {
            if (r.stat && r.value) {
                totals[r.stat] = (totals[r.stat] || 0) + r.value;
            }
        });
    });

    // Rarity counts
    const rarityCounts = RARITY_ORDER.reduce((acc, r) => {
        acc[r] = items.filter(i => i.rarity === r).length;
        return acc;
    }, {} as Record<string, number>);

    // Stat display config
    const STAT_DISPLAY = [
        { key: 'attack', label: 'Ataque Total', icon: <Sword className="w-4 h-4 text-red-400" />, color: 'text-red-300' },
        { key: 'maxHp', label: 'Vida Total', icon: <Heart className="w-4 h-4 text-pink-400" />, color: 'text-pink-300' },
        { key: 'defense', label: 'Defesa Total', icon: <Shield className="w-4 h-4 text-blue-400" />, color: 'text-blue-300' },
        { key: 'magic', label: 'Magia Total', icon: <Zap className="w-4 h-4 text-purple-400" />, color: 'text-purple-300' },
        { key: 'speed', label: 'Velocidade', icon: <Zap className="w-4 h-4 text-yellow-400" />, color: 'text-yellow-300' },
    ];

    // Top legendaries for quick view
    const topLegendaries = items.filter(i => i.rarity === 'legendary').slice(0, 5);

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/95">
            <div className="bg-slate-900 border-2 border-slate-500 w-full max-w-lg p-6 rounded-xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-lg">×</button>

                <h2 className="text-slate-300 text-xl font-bold mb-5 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Inventário
                    <span className="text-sm font-normal text-gray-500 ml-2">({items.length} itens)</span>
                </h2>

                {/* Rarity badges */}
                <div className="flex gap-2 flex-wrap mb-5">
                    {RARITY_ORDER.map(r => rarityCounts[r] > 0 && (
                        <span key={r} className={`px-2 py-0.5 rounded text-xs font-bold ${RARITY_COLORS[r]}`}>
                            {rarityCounts[r]} {r.charAt(0).toUpperCase() + r.slice(1)}
                        </span>
                    ))}
                    {items.length === 0 && <span className="text-gray-500 text-sm">Sem itens</span>}
                </div>

                {/* Aggregate stats panel */}
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Bônus Total de Todos os Itens</div>
                    <div className="space-y-2">
                        {STAT_DISPLAY.map(({ key, label, icon, color }) => {
                            const val = totals[key] || 0;
                            return (
                                <div key={key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        {icon} {label}
                                    </div>
                                    <span className={`font-bold text-sm ${color}`}>
                                        {val > 0 ? `+${formatNumber(val)}` : '—'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top legendaries section */}
                {topLegendaries.length > 0 && (
                    <div className="bg-orange-900/20 border border-orange-800/40 rounded-lg p-3">
                        <div className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-2">⭐ Top Lendários</div>
                        <div className="space-y-1">
                            {topLegendaries.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-orange-200 truncate max-w-[200px]">{item.name}</span>
                                    <span className="text-orange-400 font-mono text-xs">+{item.value} {item.stat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {items.length === 0 && (
                    <div className="text-center text-gray-600 py-8">
                        <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Inventário vazio</p>
                    </div>
                )}
            </div>
        </div>
    );
};
