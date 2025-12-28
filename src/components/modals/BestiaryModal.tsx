import React from 'react';
import { BookOpen, Skull, Layers, X, HelpCircle } from 'lucide-react';
import { MONSTERS } from '../../engine/bestiary';
import type { MonsterCard } from '../../engine/types';

interface BestiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    monsterKills: Record<string, number>;
    cards: MonsterCard[];
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ isOpen, onClose, monsterKills, cards }) => {
    if (!isOpen) return null;

    const totalKills = Object.values(monsterKills).reduce((a, b) => a + b, 0);
    const discoveredCount = Object.keys(monsterKills).length;
    const completionPercentage = Math.round((discoveredCount / MONSTERS.length) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-amber-700 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="bg-amber-900/40 p-6 border-b border-amber-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-950 p-3 rounded-lg border border-amber-600 shadow-inner">
                            <BookOpen className="text-amber-400" size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-amber-100 font-serif tracking-wider">Bestiary</h2>
                            <p className="text-amber-400/80 text-sm font-mono flex items-center gap-3">
                                <span>Discovered: {discoveredCount}/{MONSTERS.length} ({completionPercentage}%)</span>
                                <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                                <span>Total Slain: {totalKills}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-amber-400 hover:text-white p-2 hover:bg-amber-800/50 rounded-full transition-colors">
                        <X size={28} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 custom-scrollbar text-amber-100 flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {MONSTERS.map((monster) => {
                            const kills = monsterKills[monster.name] || 0;
                            const isDiscovered = kills > 0;
                            const card = cards.find(c => c.monsterName === monster.name);
                            const hasCard = !!card;

                            return (
                                <div
                                    key={monster.name}
                                    className={`
                                        relative group p-4 rounded-lg border-2 transition-all duration-300
                                        ${isDiscovered
                                            ? 'bg-gray-800/80 border-amber-700 hover:border-amber-400 hover:bg-gray-800 hover:shadow-lg hover:shadow-amber-900/20 hover:-translate-y-1'
                                            : 'bg-gray-900/50 border-gray-800 opacity-60 grayscale'
                                        }
                                    `}
                                >
                                    {/* Monster Visual */}
                                    <div className="flex flex-col items-center mb-3">
                                        <div className={`
                                            w-16 h-16 flex items-center justify-center text-4xl bg-gradient-to-br rounded-full shadow-inner mb-2
                                            ${isDiscovered ? 'from-gray-700 to-gray-800 border border-gray-600' : 'from-gray-800 to-gray-900 border border-gray-700 text-gray-600'}
                                        `}>
                                            {isDiscovered ? monster.emoji : '?'}
                                        </div>
                                        <h3 className={`font-bold text-lg text-center ${isDiscovered ? 'text-amber-100' : 'text-gray-500'}`}>
                                            {isDiscovered ? monster.name : 'Unknown'}
                                        </h3>
                                    </div>

                                    {/* Stats */}
                                    {isDiscovered ? (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center bg-gray-900/50 rounded px-2 py-1">
                                                <span className="text-gray-400 flex items-center gap-1"><Skull size={12} /> Kills</span>
                                                <span className="text-white font-mono">{kills}</span>
                                            </div>

                                            {/* Card Status */}
                                            <div className={`
                                                flex justify-between items-center rounded px-2 py-1 border
                                                ${hasCard
                                                    ? 'bg-amber-900/20 border-amber-700 text-amber-200'
                                                    : 'bg-gray-900/30 border-gray-700 text-gray-500'}
                                            `}>
                                                <span className="flex items-center gap-1 text-xs">
                                                    <Layers size={12} /> Card
                                                </span>
                                                {hasCard ? (
                                                    <span className="font-bold text-xs bg-amber-600 text-white px-1.5 rounded">Lv {card.count}</span>
                                                ) : (
                                                    <span className="text-[10px]">Not Found</span>
                                                )}
                                            </div>

                                            {hasCard && (
                                                <div className="text-[10px] text-center text-amber-400/80 mt-1">
                                                    +{Math.round(card.value * 100 * card.count)}% {card.stat.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-600 text-xs py-4 flex flex-col items-center gap-1">
                                            <HelpCircle size={16} />
                                            <span>Defeat to unlock</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
