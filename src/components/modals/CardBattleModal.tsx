import React, { useState } from 'react';
import { Swords } from 'lucide-react';
import type { MonsterCard, CardOpponent, GameStats } from '../../engine/types';
import { simulateCardBattle } from '../../engine/cardBattle';
import type { BattleResult } from '../../engine/cardBattle';
import { NPC_DUELISTS } from '../../engine/initialData';

interface CardBattleModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: MonsterCard[]; // Renamed from playerCards
    onWin: (opponentId: string, difficulty: number) => void;
    stats: GameStats;
}

export const CardBattleModal: React.FC<CardBattleModalProps> = ({ isOpen, onClose, cards, onWin }) => {
    const [selectedOpponent, setSelectedOpponent] = useState<CardOpponent | null>(null);
    const [selectedDeck, setSelectedDeck] = useState<string[]>([]); // IDs
    const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

    if (!isOpen) return null;

    const toggleCard = (id: string) => {
        if (selectedDeck.includes(id)) {
            setSelectedDeck(prev => prev.filter(c => c !== id));
        } else {
            if (selectedDeck.length < 3) {
                setSelectedDeck(prev => [...prev, id]);
            }
        }
    };

    const startBattle = () => {
        if (!selectedOpponent || selectedDeck.length !== 3) return;

        const deck = cards.filter(c => selectedDeck.includes(c.id));
        const result = simulateCardBattle(deck, selectedOpponent, cards); // Note: Passing all playerCards as 'allCards' context might be incomplete if opponent uses cards player doesn't have.
        // Fix: Ideally 'allCards' should be a global list, but for now assuming opponents use subset of existing or we handle 'unknown' in engine.

        setBattleResult(result);
        if (result.winner === 'player') {
            onWin(selectedOpponent.id, selectedOpponent.difficulty);
        }
    };

    const reset = () => {
        setBattleResult(null);
        setSelectedOpponent(null);
        setSelectedDeck([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border-4 border-indigo-500 w-full max-w-4xl p-6 rounded-lg shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

                <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400 flex items-center justify-center gap-3">
                    <Swords size={32} /> MONSTER DUEL
                </h2>

                {!battleResult ? (
                    <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT: Opponent Selection */}
                        <div className="bg-black/30 p-4 rounded-xl border border-indigo-900">
                            <h3 className="text-xl font-bold text-slate-200 mb-4">Select Opponent</h3>
                            <div className="space-y-3">
                                {NPC_DUELISTS.map(npc => (
                                    <div
                                        key={npc.id}
                                        onClick={() => setSelectedOpponent(npc)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                                            ${selectedOpponent?.id === npc.id ? 'bg-indigo-900 border-indigo-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{npc.avatar}</span>
                                            <div>
                                                <div className="font-bold text-white">{npc.name}</div>
                                                <div className="text-xs text-slate-400">Dim. Level {npc.difficulty}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Deck Selection */}
                        <div className="bg-black/30 p-4 rounded-xl border border-indigo-900 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-200 mb-4 flex justify-between">
                                <span>Select 3 Cards ({selectedDeck.length}/3)</span>
                            </h3>
                            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 pr-2 custom-scrollbar max-h-60">
                                {cards.map(card => (
                                    <div
                                        key={card.id}
                                        onClick={() => toggleCard(card.id)}
                                        className={`p-2 rounded border cursor-pointer text-center relative
                                            ${selectedDeck.includes(card.id) ? 'bg-green-900 border-green-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}
                                        `}
                                    >
                                        <div className="text-2xl mb-1">{card.id}</div>
                                        <div className="text-xs font-bold text-white truncate">{card.monsterName}</div>
                                        <div className="text-[10px] text-slate-400 uppercase">{card.stat}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={startBattle}
                                disabled={!selectedOpponent || selectedDeck.length !== 3}
                                className={`mt-4 w-full py-3 rounded-lg font-bold text-lg
                                    ${(!selectedOpponent || selectedDeck.length !== 3)
                                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}
                                `}
                            >
                                START DUEL
                            </button>
                        </div>
                    </div>
                ) : (
                    // RESULT SCREEN
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="text-6xl mb-4">
                            {battleResult.winner === 'player' ? '🏆' : '💀'}
                        </div>
                        <h3 className={`text-4xl font-black mb-2 ${battleResult.winner === 'player' ? 'text-yellow-400' : 'text-red-500'}`}>
                            {battleResult.winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
                        </h3>
                        <div className="text-xl text-slate-300 mb-6">
                            Score: {battleResult.score.player} - {battleResult.score.opponent}
                        </div>

                        {/* Battle Log */}
                        <div className="w-full max-w-lg bg-black/50 p-4 rounded-lg text-left font-mono text-sm text-slate-300 h-48 overflow-y-auto custom-scrollbar mb-6 border border-slate-700">
                            {battleResult.logs.map((log, i) => (
                                <div key={i} className="mb-1">{log}</div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={reset} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold">
                                Play Again
                            </button>
                            <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
