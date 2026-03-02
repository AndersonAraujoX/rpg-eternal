import React, { useState } from 'react';
import { Heart, Sword, Shield, Star, Zap, PawPrint, TrendingUp, RefreshCw, Coins } from 'lucide-react';
import type { Pet } from '../../engine/types';
import { formatNumber } from '../../utils';

interface PetSpaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    pets: Pet[];
    gold: number;
    souls: number;
    onFeedGold: (petId: string) => void;
    onFeedSouls: (petId: string) => void;
    onBreed: () => void;
}

const RARITY_STYLE: Record<string, string> = {
    legendary: 'text-orange-400 border-orange-600 bg-orange-950/30',
    chimera: 'text-fuchsia-400 border-fuchsia-600 bg-fuchsia-950/30',
    epic: 'text-purple-400 border-purple-600 bg-purple-950/30',
    rare: 'text-blue-400 border-blue-600 bg-blue-950/30',
    common: 'text-gray-400 border-gray-600 bg-gray-800',
};

export const PetSpaceModal: React.FC<PetSpaceModalProps> = ({
    isOpen, onClose, pets, gold, souls, onFeedGold, onFeedSouls, onBreed
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    if (!isOpen) return null;

    const pet = selectedId ? (pets.find(p => p.id === selectedId) ?? pets[0]) : pets[0];

    // Aggregate stats from all pets (uses Stats object)
    const totalStats = pets.reduce((acc, p) => {
        acc.attack = (acc.attack || 0) + (p.stats?.attack || 0);
        acc.maxHp = (acc.maxHp || 0) + (p.stats?.maxHp || 0);
        acc.defense = (acc.defense || 0) + (p.stats?.defense || 0);
        acc.magic = (acc.magic || 0) + (p.stats?.magic || 0);
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border-2 border-purple-700/60 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-purple-950/50 to-gray-900 border-b border-purple-800/40 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                        <PawPrint className="w-6 h-6" /> Espaço Pet
                        <span className="text-sm text-gray-400 font-normal">({pets.length} pets)</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold">×</button>
                </div>

                <div className="flex overflow-hidden" style={{ maxHeight: '70vh' }}>
                    {/* Pet list */}
                    <div className="w-40 border-r border-gray-800 overflow-y-auto overflow-x-hidden custom-scroll p-2 space-y-1 shrink-0">
                        {pets.length === 0 && (
                            <p className="text-gray-600 text-xs text-center p-4">Sem pets</p>
                        )}
                        {pets.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedId(p.id)}
                                className={`w-full p-2 rounded border text-left transition-all ${p.id === (selectedId ?? pets[0]?.id)
                                    ? 'border-purple-500 bg-purple-900/30'
                                    : `${RARITY_STYLE[p.rarity] || RARITY_STYLE.common} hover:brightness-110`
                                    }`}
                            >
                                <div className="text-xl text-center">{p.emoji || '🐾'}</div>
                                <div className="text-xs font-bold text-white truncate">{p.name}</div>
                                <div className="text-[10px] text-gray-400">Lv{p.level} · {p.rarity}</div>
                            </button>
                        ))}
                    </div>

                    {/* Detail + aggregate */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll p-4 space-y-4">
                        {/* Selected pet detail */}
                        {pet ? (
                            <div className={`p-3 rounded-lg border ${RARITY_STYLE[pet.rarity] || RARITY_STYLE.common}`}>
                                <div className="flex items-start gap-3">
                                    <span className="text-4xl">{pet.emoji || '🐾'}</span>
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-base">{pet.name}</div>
                                        <div className="text-xs text-gray-400">{pet.rarity} · Nível {pet.level}</div>
                                        {pet.bonus && <div className="text-xs text-green-400 mt-0.5">{pet.bonus}</div>}
                                        {/* XP bar */}
                                        <div className="mt-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden w-full">
                                            <div
                                                className="h-full bg-purple-500 transition-all"
                                                style={{ width: `${Math.min(100, (pet.xp / pet.maxXp) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">{formatNumber(pet.xp)}/{formatNumber(pet.maxXp)} XP</div>
                                    </div>
                                </div>

                                {/* Pet stats */}
                                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                    {[
                                        { label: 'ATQ', val: pet.stats.attack, icon: '⚔️' },
                                        { label: 'HP', val: pet.stats.maxHp, icon: '❤️' },
                                        { label: 'DEF', val: pet.stats.defense, icon: '🛡️' },
                                        { label: 'MAG', val: pet.stats.magic, icon: '✨' },
                                    ].map(({ label, val, icon }) => (
                                        <div key={label} className="flex items-center gap-1 text-gray-300">
                                            <span>{icon}</span> {label}: <span className="text-white font-bold ml-auto">{formatNumber(val || 0)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Feed buttons */}
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => onFeedGold(pet.id)}
                                        disabled={gold < 100}
                                        className="flex-1 py-1.5 text-xs font-bold rounded border border-yellow-700/60 bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/60 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Coins className="w-3 h-3" /> 100 Ouro
                                    </button>
                                    <button
                                        onClick={() => onFeedSouls(pet.id)}
                                        disabled={souls < 100}
                                        className="flex-1 py-1.5 text-xs font-bold rounded border border-purple-700/60 bg-purple-900/30 text-purple-300 hover:bg-purple-900/60 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Star className="w-3 h-3" /> 100 Almas (×3 XP)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 py-8">
                                <PawPrint className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Sem pets. Invoque na Taverna!</p>
                            </div>
                        )}

                        {/* Aggregate bonuses */}
                        {pets.length > 0 && (
                            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bônus Total de Todos os Pets</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                    {[
                                        { label: 'Ataque', val: totalStats.attack, icon: <Sword className="w-3 h-3 text-red-400" /> },
                                        { label: 'Vida', val: totalStats.maxHp, icon: <Heart className="w-3 h-3 text-pink-400" /> },
                                        { label: 'Defesa', val: totalStats.defense, icon: <Shield className="w-3 h-3 text-blue-400" /> },
                                        { label: 'Magia', val: totalStats.magic, icon: <Zap className="w-3 h-3 text-purple-400" /> },
                                    ].map(({ label, val, icon }) => (
                                        <div key={label} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1 text-gray-300">{icon} {label}</div>
                                            <span className="font-bold text-white">{val ? `+${formatNumber(val)}` : '—'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 text-[10px] text-gray-600 text-center">
                                    <TrendingUp className="w-3 h-3 inline mr-1" />
                                    Aplicado passivamente ao grupo
                                </div>
                            </div>
                        )}

                        {/* Fusion button */}
                        {pets.length >= 2 && (
                            <button
                                onClick={onBreed}
                                className="w-full py-2 rounded-lg bg-purple-800 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-purple-600 transition-all hover:scale-105"
                            >
                                <RefreshCw className="w-4 h-4" /> Abrir Fusão de Pets
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
