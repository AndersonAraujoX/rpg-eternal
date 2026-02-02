import React, { useState, useEffect, useRef } from 'react';
import { X, Hammer, Star, Flame } from 'lucide-react';
import type { Item } from '../../engine/types';
import { generateAffixes } from '../../engine/starForge';
import { soundManager } from '../../engine/sound';

interface StarForgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    starFragments: number;
    gold: number;
    onCraft: (item: Item, goldCost: number, fragmentCost: number) => void;
}

const FORGE_COST = 5000; // Gold
const STAR_COST = 5;    // Fragments

export const StarForgeModal: React.FC<StarForgeModalProps> = ({ isOpen, onClose, starFragments, gold, onCraft }) => {
    const [view, setView] = useState<'select' | 'forging' | 'result'>('select');
    const [selectedType, setSelectedType] = useState<Item['type']>('weapon');

    // Minigame State
    const [heat, setHeat] = useState(0); // 0-100
    const [strikes, setStrikes] = useState(0);
    const [qualityAcc, setQualityAcc] = useState(0); // Accumulated quality from strikes
    const [direction, setDirection] = useState(1); // 1 = heating up, -1 = cooling down
    const [resultItem, setResultItem] = useState<Item | null>(null);

    const animationRef = useRef<number>(0);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setView('select');
            setHeat(0);
            setStrikes(0);
            setQualityAcc(0);
            setResultItem(null);
        }
    }, [isOpen]);

    // Minigame Loop
    useEffect(() => {
        if (view !== 'forging') return;

        const loop = () => {
            setHeat(prev => {
                let next = prev + (direction * 1.5); // Speed
                if (next >= 100) {
                    setDirection(-1);
                    next = 100;
                } else if (next <= 0) {
                    setDirection(1);
                    next = 0;
                }
                return next;
            });
            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationRef.current!);
    }, [view, direction]);

    const handleStrike = () => {
        // "Sweet spot" is 80-95
        // "Good spot" is 60-80
        const accuracy = heat >= 80 && heat <= 95 ? 1.0 : (heat >= 60 ? 0.7 : 0.2);

        setQualityAcc(prev => prev + (accuracy * 34)); // 3 strikes to get to ~100
        setStrikes(prev => prev + 1);

        // Visual/Sound feedback
        soundManager.playAttack(); // Use generic click for now as strike sound

        if (strikes >= 2) { // 3rd strike (0, 1, 2)
            finishCrafting(qualityAcc + (accuracy * 34));
        }
    };

    const finishCrafting = (finalQualityRaw: number) => {
        // Finalize
        const finalQuality = Math.min(100, Math.floor(finalQualityRaw));
        const affixes = generateAffixes(50, 'legendary'); // Example level/rarity

        const newItem: Item = {
            id: `forged-${Date.now()}`,
            name: 'Starforged Item', // Temp
            type: selectedType,
            rarity: 'legendary',
            stat: selectedType === 'weapon' ? 'attack' : 'defense',
            value: 50 * (1 + (finalQuality / 100)), // Base stats scaled by quality
            sockets: finalQuality > 90 ? 2 : 1,
            runes: [],
            quality: finalQuality,
            prefix: affixes.prefix,
            suffix: affixes.suffix,
            craftedBy: 'Player'
        };

        // Construct Name
        let name = `${selectedType === 'weapon' ? 'Blade' : 'Plate'}`;
        if (newItem.prefix) name = `${newItem.prefix.name} ${name}`;
        if (newItem.suffix) name = `${name} ${newItem.suffix.name}`;
        newItem.name = name;

        setResultItem(newItem);
        onCraft(newItem, FORGE_COST, STAR_COST);
        setView('result');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-orange-500/50 rounded-xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(255,165,0,0.2)]">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-orange-950/30">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 flex items-center gap-3">
                        <Flame className="text-orange-500 animate-pulse" /> Star Forge
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">

                    {view === 'select' && (
                        <div className="w-full animate-in fade-in zoom-in duration-300">
                            <h3 className="text-xl text-gray-300 mb-8">Select Equipment Type to Forge</h3>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button onClick={() => setSelectedType('weapon')} className={`p-6 border rounded-xl flex flex-col items-center gap-2 transition-all ${selectedType === 'weapon' ? 'bg-orange-600/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
                                    <span className="text-4xl">⚔️</span>
                                    <span className="font-bold">Weapon</span>
                                </button>
                                <button onClick={() => setSelectedType('armor')} className={`p-6 border rounded-xl flex flex-col items-center gap-2 transition-all ${selectedType === 'armor' ? 'bg-orange-600/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
                                    <span className="text-4xl">🛡️</span>
                                    <span className="font-bold">Armor</span>
                                </button>
                            </div>

                            <div className="flex justify-center gap-8 mb-8 text-sm font-mono">
                                <div className={`flex items-center gap-2 ${starFragments >= STAR_COST ? 'text-green-400' : 'text-red-400'}`}>
                                    <Star size={16} /> {starFragments} / {STAR_COST} Fragments
                                </div>
                                <div className={`flex items-center gap-2 ${gold >= FORGE_COST ? 'text-green-400' : 'text-red-400'}`}>
                                    <span className="text-yellow-400">💰</span> {gold.toLocaleString()} / {FORGE_COST.toLocaleString()} Gold
                                </div>
                            </div>

                            <button
                                onClick={() => setView('forging')}
                                disabled={starFragments < STAR_COST || gold < FORGE_COST}
                                className={`px-12 py-4 rounded-full font-black text-xl transition-all ${starFragments >= STAR_COST && gold >= FORGE_COST
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:scale-105 text-white shadow-lg shadow-orange-500/50'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                IGNITE FORGE
                            </button>
                        </div>
                    )}

                    {view === 'forging' && (
                        <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
                            <h3 className="text-2xl font-bold text-white mb-2">Strike when HOT!</h3>
                            <p className="text-gray-400 mb-12">Strikes Remaining: {3 - strikes}</p>

                            {/* Heat Bar Container */}
                            <div className="relative w-full h-16 bg-gray-900 rounded-full border-2 border-gray-700 overflow-hidden mb-12 max-w-md">
                                {/* Sweet Spot Indicators */}
                                <div className="absolute top-0 bottom-0 left-[80%] right-[5%] bg-orange-500/30 border-l border-r border-orange-500/50 z-10 animate-pulse"></div>

                                {/* The Bar */}
                                <div
                                    className="h-full bg-gradient-to-r from-blue-900 via-purple-600 to-red-500 transition-none"
                                    style={{ width: `${heat}%` }}
                                ></div>

                                {/* Heat Value Text */}
                                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white drop-shadow-md z-20">
                                    {Math.round(heat)}°C
                                </div>
                            </div>

                            <button
                                onClick={handleStrike}
                                className="w-32 h-32 rounded-full bg-slate-800 border-4 border-orange-500 flex items-center justify-center hover:bg-orange-600 hover:border-white transition-all active:scale-90 shadow-[0_0_30px_rgba(249,115,22,0.6)] group"
                            >
                                <Hammer size={48} className="text-white group-hover:rotate-45 transition-transform" />
                            </button>
                        </div>
                    )}

                    {view === 'result' && resultItem && (
                        <div className="w-full animate-in zoom-in duration-500 flex flex-col items-center">
                            <div className="text-center mb-6">
                                <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-2">Forge Successful</h3>
                                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200">
                                    {resultItem.name}
                                </h2>
                            </div>

                            <div className="bg-gradient-to-b from-gray-800 to-black p-1 rounded-xl shadow-2xl mb-8 relative group">
                                <div className={`absolute inset-0 bg-gradient-to-r ${resultItem.quality! > 90 ? 'from-yellow-400 to-orange-500' : 'from-blue-500 to-purple-500'} opacity-50 blur-xl group-hover:opacity-75 transition-opacity`}></div>
                                <div className="relative bg-gray-900 p-8 rounded-lg min-w-[300px] border border-gray-700">
                                    <div className="text-6xl mb-4 text-center">{selectedType === 'weapon' ? '⚔️' : '🛡️'}</div>
                                    <div className="space-y-2 text-left">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                                            <span className="text-gray-400">Quality</span>
                                            <span className={`${resultItem.quality! > 90 ? 'text-yellow-400' : 'text-blue-400'} font-bold`}>{resultItem.quality}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span className="capitalize">{resultItem.stat}</span>
                                            <span>+{Math.round(resultItem.value)}</span>
                                        </div>
                                        {resultItem.prefix && (
                                            <div className="flex justify-between text-sm text-green-400">
                                                <span>{resultItem.prefix.name}</span>
                                                <span>+{resultItem.prefix.value * 100}% {resultItem.prefix.stat}</span>
                                            </div>
                                        )}
                                        {resultItem.suffix && (
                                            <div className="flex justify-between text-sm text-green-400">
                                                <span>{resultItem.suffix.name}</span>
                                                <span>+{resultItem.suffix.value * 100}% {resultItem.suffix.stat}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setView('select')}
                                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold"
                                >
                                    Forge Another
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-lg"
                                >
                                    Claim & Close
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
