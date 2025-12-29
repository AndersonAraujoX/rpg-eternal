import React, { useState } from 'react';
import { Sword, Trophy, Shield, HelpCircle, User, Skull } from 'lucide-react';
import type { MonsterCard, CardOpponent, Hero, GameStats } from '../../engine/types';
import { BattleCard, convertToBattleCard, resolveDuel } from '../../engine/cardBattle';
import { soundManager } from '../../engine/sound';

interface CardBattleModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: MonsterCard[];
    onWin: (opponentId: string, diff: number) => void;
    stats: GameStats;
}

const OPPONENTS: CardOpponent[] = [
    { id: 'npc_novice', name: 'Novice Duelist', difficulty: 50, deck: ['Slime', 'Rat', 'Goblin'], avatar: '🧒' },
    { id: 'npc_knight', name: 'Card Knight', difficulty: 150, deck: ['Wolf', 'Orc', 'Skeleton'], avatar: '🛡️' },
    { id: 'npc_master', name: 'Deck Master', difficulty: 400, deck: ['Dragon', 'Demon', 'Lich'], avatar: '🧙‍♂️' },
];

export const CardBattleModal: React.FC<CardBattleModalProps> = ({ isOpen, onClose, cards, onWin, stats }) => {
    const [selectedOpponent, setSelectedOpponent] = useState<CardOpponent | null>(null);
    const [myDeck, setMyDeck] = useState<BattleCard[]>([]);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [gameState, setGameState] = useState<'select' | 'battle' | 'result'>('select');
    const [result, setResult] = useState<'win' | 'loss' | null>(null);

    if (!isOpen) return null;

    const availableCards = cards.map(convertToBattleCard).sort((a, b) => b.power - a.power);

    const formatElement = (el: string) => {
        switch (el) {
            case 'fire': return '🔥';
            case 'water': return '💧';
            case 'nature': return '🌿';
            case 'light': return '✨';
            case 'dark': return '🌑';
            default: return '⚪';
        }
    };

    const toggleCard = (card: BattleCard) => {
        if (myDeck.find(c => c.id === card.id)) {
            setMyDeck(prev => prev.filter(c => c.id !== card.id));
        } else {
            if (myDeck.length < 3) {
                setMyDeck([...myDeck, card]);
            }
        }
    };

    const startBattle = () => {
        if (myDeck.length !== 3 || !selectedOpponent) return;
        setGameState('battle');
        setBattleLog([]);

        let playerScore = 0;
        let oppScore = 0;
        const log: string[] = [];

        // Simulate 3 Rounds
        // Opponent Deck generation (simplified: create BattleCards from names with fixed power based on difficulty)
        const oppCards: BattleCard[] = selectedOpponent.deck.map((name, i) => ({
            id: `opp_${i}`,
            name,
            element: ['fire', 'water', 'nature', 'dark'][Math.floor(Math.random() * 4)] as any, // Random element for NPC for now or lookup? 
            // Better: lookup element from name using our helper inside cardBattle.ts if we exposed it, or just random
            power: selectedOpponent.difficulty + (Math.random() * 20 - 10),
            avatar: '👾',
            rarity: 'common'
        }));

        // Actual simulation in steps for effect? Or instant?
        // Instant for MVP
        for (let i = 0; i < 3; i++) {
            const pCard = myDeck[i];
            const oCard = oppCards[i];

            log.push(`ROUND ${i + 1}: ${pCard.name} vs ${oCard.name}`);
            const res = resolveDuel(pCard, oCard);
            log.push(res.log);

            if (res.winner === 'player') {
                playerScore++;
                log.push("You won this round! (+1 Point)");
            } else if (res.winner === 'opponent') {
                oppScore++;
                log.push("Opponent won this round. (+1 Point)");
            } else {
                log.push("Draw! No points.");
            }
            log.push("---");
        }

        if (playerScore > oppScore) {
            setResult('win');
            log.push("VICTORY!");
            onWin(selectedOpponent.id, selectedOpponent.difficulty);
            soundManager.playLevelUp();
        } else {
            setResult('loss');
            log.push("DEFEAT!");
        }

        setBattleLog(log);
        setGameState('result');
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-indigo-500 w-full max-w-4xl h-[600px] p-4 rounded-lg shadow-2xl relative flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold hover:text-red-500">X</button>

                <h2 className="text-2xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                    <Trophy /> Monster Card Battle Arena
                </h2>

                {gameState === 'select' && (
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        {/* LEFT: Opponent Selection */}
                        <div className="w-1/3 bg-slate-800 p-2 rounded overflow-y-auto">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Skull size={16} /> Select Opponent</h3>
                            <div className="space-y-2">
                                {OPPONENTS.map(opp => (
                                    <div
                                        key={opp.id}
                                        onClick={() => setSelectedOpponent(opp)}
                                        className={`p-2 rounded border cursor-pointer ${selectedOpponent?.id === opp.id ? 'bg-indigo-900 border-indigo-500' : 'bg-black border-gray-700 hover:bg-gray-900'}`}
                                    >
                                        <div className="flex justify-between">
                                            <span className="text-white font-bold">{opp.avatar} {opp.name}</span>
                                            <span className="text-xs text-yellow-500">Pow: {opp.difficulty}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400">Deck: {opp.deck.join(', ')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Deck Building */}
                        <div className="w-2/3 flex flex-col gap-2">
                            <div className="bg-slate-800 p-2 rounded h-1/3">
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <Shield size={16} /> Your Deck ({myDeck.length}/3)
                                    {myDeck.length === 3 && selectedOpponent && (
                                        <button onClick={startBattle} className="ml-auto bg-red-600 hover:bg-red-500 text-white px-4 py-1 rounded font-bold animate-pulse">
                                            FIGHT!
                                        </button>
                                    )}
                                </h3>
                                <div className="flex gap-2">
                                    {myDeck.map(c => (
                                        <div key={c.id} onClick={() => toggleCard(c)} className="w-24 h-32 bg-indigo-900 border-2 border-yellow-400 rounded p-1 cursor-pointer hover:bg-red-900">
                                            <div className="text-xs text-center text-white truncate">{c.name}</div>
                                            <div className="text-2xl text-center my-2">{c.avatar}</div>
                                            <div className="text-xs text-center text-cyan-300">{formatElement(c.element)} P:{c.power}</div>
                                        </div>
                                    ))}
                                    {[...Array(3 - myDeck.length)].map((_, i) => (
                                        <div key={i} className="w-24 h-32 bg-black border-2 border-dashed border-gray-700 rounded flex items-center justify-center text-gray-600">
                                            Empty
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-800 p-2 rounded flex-1 overflow-y-auto">
                                <h3 className="text-white font-bold mb-2">Collection</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableCards.map(c => {
                                        const isSelected = myDeck.find(d => d.id === c.id);
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => toggleCard(c)}
                                                className={`p-1 rounded border cursor-pointer ${isSelected ? 'opacity-30' : 'hover:bg-gray-700'} ${c.element === 'fire' ? 'border-red-900 bg-red-950' : c.element === 'water' ? 'border-blue-900 bg-blue-950' : c.element === 'nature' ? 'border-green-900 bg-green-950' : 'border-gray-700 bg-gray-900'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-white truncate">{c.name}</span>
                                                    <span className="text-[10px]">{formatElement(c.element)}</span>
                                                </div>
                                                <div className="text-center text-lg">{c.avatar}</div>
                                                <div className="text-[10px] text-center text-yellow-500 font-mono">{c.power}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-800 rounded p-4 overflow-y-auto">
                        <h2 className={`text-4xl font-bold ${result === 'win' ? 'text-yellow-400' : 'text-red-500'}`}>
                            {result === 'win' ? 'VICTORY!' : 'DEFEAT'}
                        </h2>
                        <div className="w-full max-w-lg bg-black p-4 rounded text-xs font-mono text-gray-300 h-64 overflow-y-auto border border-gray-600">
                            {battleLog.map((l, i) => <div key={i} className={l.includes('VICTORY') ? 'text-yellow-400 font-bold' : l.includes('DEFEAT') ? 'text-red-500 font-bold' : l.includes('ROUND') ? 'text-white mt-2 border-t border-gray-800 pt-1' : ''}>{l}</div>)}
                        </div>
                        <button onClick={() => setGameState('select')} className="bg-indigo-600 px-6 py-2 rounded text-white font-bold hover:bg-indigo-500">
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
