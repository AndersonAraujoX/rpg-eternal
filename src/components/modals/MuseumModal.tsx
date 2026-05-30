
import { useState } from 'react';
import { X, Trophy, User, Ghost, Book, Search } from 'lucide-react';
import type { Hero, Pet, MonsterCard, Item } from '../../engine/types';
import { INITIAL_HEROES, INITIAL_PET_DATA } from '../../engine/initialData';
import { MONSTERS } from '../../engine/bestiary';

interface MuseumModalProps {
    onClose: () => void;
    heroes: Hero[];
    pets: Pet[];
    cards: MonsterCard[];
    items: Item[]; // Use inventory to check for Legendaries
    onDuel: () => void; // Phase 55
}

export function MuseumModal({ onClose, heroes, pets, cards, items, onDuel }: MuseumModalProps) {
    const [activeTab, setActiveTab] = useState<'heroes' | 'pets' | 'cards' | 'artifacts' | 'champions'>('heroes');

    // Calculate Progress
    const totalHeroes = INITIAL_HEROES.length; // Approximate, assuming initial list is all unique base heroes
    const collectedHeroes = new Set(heroes.map(h => h.name)).size; // Unique names

    const totalPets = Object.keys(INITIAL_PET_DATA).length;
    const collectedPets = new Set(pets.map(p => p.type)).size; // Unique types

    const totalCards = MONSTERS.length;
    const collectedCards = cards.length;

    // For Artifacts/Legendaries, hard to track "Total" without a master list. 
    // Let's count collected Legendaries in inventory.
    const collectedLegendaries = items.filter(i => i.rarity === 'legendary').length;

    const renderProgress = (current: number, total: number | string) => {
        const percent = typeof total === 'number' ? Math.min(100, Math.floor((current / total) * 100)) : 0;
        return (
            <div className="flex items-center gap-2 text-xs mb-4">
                <span className="text-gray-400">Progress:</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-yellow-400 font-bold">{current} / {total}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-yellow-700/50 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X className="w-6 h-6" /></button>

                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-yellow-500">
                        <Book className="w-8 h-8" />
                        The Museum
                    </h2>
                    <div className="text-xs text-gray-400 mt-1">A collection of your discoveries and conquests across the realms.</div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    <button onClick={() => setActiveTab('heroes')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'heroes' ? 'text-yellow-400 border-b-2 border-yellow-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}>
                        <User className="w-4 h-4" /> Hall of Heroes
                    </button>
                    <button onClick={() => setActiveTab('pets')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'pets' ? 'text-pink-400 border-b-2 border-pink-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}>
                        <Ghost className="w-4 h-4" /> Menagerie
                    </button>
                    <button onClick={() => setActiveTab('cards')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'cards' ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}>
                        <Search className="w-4 h-4" /> Library (Cards)
                    </button>
                    <button onClick={() => setActiveTab('artifacts')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'artifacts' ? 'text-orange-400 border-b-2 border-orange-500 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}>
                        <Trophy className="w-4 h-4" /> Artifacts
                    </button>
                    <button onClick={() => setActiveTab('champions')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'champions' ? 'text-yellow-300 border-b-2 border-yellow-400 bg-gray-800/50' : 'text-gray-500 hover:text-gray-300'}`}>
                        🌟 Hall of Fame
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">

                    {activeTab === 'heroes' && (
                        <div>
                            {renderProgress(collectedHeroes, totalHeroes)}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {INITIAL_HEROES.map((h, idx) => {
                                    const isOwned = heroes.some(owned => owned.name === h.name);
                                    return (
                                        <div key={idx} className={`p-3 rounded border flex flex-col items-center gap-2 text-center transition-all ${isOwned ? 'bg-gray-800 border-gray-600' : 'bg-gray-950 border-gray-800 grayscale opacity-50'}`}>
                                            <div className="text-2xl">{isOwned ? '👤' : '?'}</div>
                                            <div className="text-sm font-bold truncate w-full">{isOwned ? h.name : 'Unknown'}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{h.class}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'pets' && (
                        <div>
                            {renderProgress(collectedPets, totalPets)}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {Object.values(INITIAL_PET_DATA).map((p, idx) => {
                                    const isOwned = pets.some(owned => owned.type === p.type);
                                    return (
                                        <div key={idx} className={`p-3 rounded border flex flex-col items-center gap-2 text-center transition-all ${isOwned ? 'bg-pink-900/20 border-pink-700' : 'bg-gray-950 border-gray-800 grayscale opacity-50'}`}>
                                            <div className="text-2xl">{isOwned ? p.emoji : '?'}</div>
                                            <div className="text-sm font-bold truncate w-full">{isOwned ? p.name : 'Unknown'}</div>
                                            <div className="text-[10px] text-gray-500">{p.ability}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'cards' && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                {renderProgress(collectedCards, totalCards)}
                                <button onClick={onDuel} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1 animate-pulse">
                                    <Trophy size={12} /> ENTER BATTLE ARENA
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {MONSTERS.map((m, idx) => {
                                    // Match by monsterName
                                    const card = cards.find(c => c.monsterName === m.name);
                                    return (
                                        <div key={idx} className={`p-3 rounded border flex flex-col items-center gap-2 text-center relative overflow-hidden ${card ? 'bg-blue-900/20 border-blue-700' : 'bg-gray-950 border-gray-800 grayscale opacity-40'}`}>
                                            <div className="text-xl font-bold z-10">{card ? m.name : '???'}</div>
                                            {card && <div className="text-[10px] text-blue-300 z-10">Count: {card.count} • {card.stat.toUpperCase()} +{card.value}</div>}
                                            {/* Background art placeholder */}
                                            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-blue-500 to-transparent" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'artifacts' && (
                        <div>
                            {/* Use collectedLegendaries in UI */}
                            {renderProgress(collectedLegendaries, "Unknown")}
                            <div className="text-xs text-gray-400 mb-4 bg-gray-800 p-2 rounded">
                                Showing currently owned Legendary items.
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {items.filter(i => i.rarity === 'legendary').length > 0 ? items.filter(i => i.rarity === 'legendary').map((item, idx) => (
                                    <div key={idx} className="p-3 rounded border border-orange-500 bg-orange-900/20 flex flex-col items-center text-center gap-2">
                                        <div className="text-2xl">⚔️</div>
                                        <div className="text-sm font-bold text-orange-300">{item.name}</div>
                                        <div className="text-[10px] text-orange-200/70">{item.type}</div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center text-gray-500 py-10 italic">
                                        No legendary artifacts discovered yet. Continue your adventure!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'champions' && (() => {
                        const champions = heroes.filter(h => h.isAwakened);
                        return (
                            <div>
                                <div className="text-xs text-gray-400 mb-4 bg-gradient-to-r from-yellow-900/30 to-transparent border border-yellow-700/40 p-3 rounded flex items-center gap-2">
                                    🌟 <span>Heróis que transcenderam os limites mortais e alcançaram o <strong className="text-yellow-400">Despertar</strong>.</span>
                                </div>
                                {champions.length === 0 ? (
                                    <div className="text-center text-gray-500 py-16 italic">
                                        <div className="text-4xl mb-3">🏆</div>
                                        Nenhum campeão ainda. Leve um herói ao Nível 100 para Despertar!
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {champions.map((h, i) => (
                                            <div key={h.id} className="relative bg-gradient-to-br from-yellow-900/30 to-gray-900 border border-yellow-600/60 rounded-xl p-4 flex gap-4 items-center shadow-[0_0_20px_rgba(234,179,8,0.15)] overflow-hidden">
                                                <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-yellow-400 to-transparent" />
                                                <div className="text-4xl z-10">{h.emoji}</div>
                                                <div className="flex-1 z-10">
                                                    <div className="font-bold text-yellow-300 text-lg">{h.name}</div>
                                                    <div className="text-xs text-yellow-500 font-semibold mb-1">{h.awakeningTitle ?? 'Desperto'} • {h.class}</div>
                                                    <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-300">
                                                        <span>❤️ {Math.floor(h.stats.maxHp)}</span>
                                                        <span>⚔️ {Math.floor(h.stats.attack)}</span>
                                                        <span>⚡ {Math.floor(h.stats.magic)}</span>
                                                    </div>
                                                    {h.awakenedAt && (
                                                        <div className="text-[9px] text-gray-600 mt-1">
                                                            Despertou em: {new Date(h.awakenedAt).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute top-2 right-2 text-yellow-400 text-xs font-black">#{i + 1}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                </div>
            </div>
        </div>
    );
}
