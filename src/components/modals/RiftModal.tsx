import React, { useState, useEffect } from 'react';
import { Shield, Sword, Zap, Heart, TrendingUp, Gem, Clock } from 'lucide-react';
import type { RiftState, RiftBlessing, Stats } from '../../engine/types';
import { generateBlessings } from '../../engine/rifts';
import { soundManager } from '../../engine/sound';

interface RiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    riftState: RiftState | null;
    startRift: () => void;
    selectBlessing: (blessing: RiftBlessing) => void;
    exitRift: (success: boolean) => void;
    gameStats: any;
}

export const RiftModal: React.FC<RiftModalProps> = ({
    isOpen, onClose, riftState, startRift, selectBlessing, exitRift, gameStats
}) => {
    const [blessingOptions, setBlessingOptions] = useState<RiftBlessing[]>([]);

    // Generate blessings when entering a new floor (if active and options empty)
    useEffect(() => {
        if (isOpen && riftState?.active && blessingOptions.length === 0) {
            setBlessingOptions(generateBlessings(riftState.floor));
        }
    }, [isOpen, riftState, blessingOptions.length]);

    // Clear options when floor changes
    useEffect(() => {
        if (riftState?.floor) {
            // If we just selected one, options should be cleared to regenerate for NEXT floor? 
            // Actually, `selectBlessing` increments floor. 
            // So if floor changes, we should clear current options to trigger regeneration.
            setBlessingOptions([]);
        }
    }, [riftState?.floor]);


    if (!isOpen) return null;

    const handleStart = () => {
        soundManager.playLevelUp(); // Start sound
        startRift();
    };

    const handleSelect = (b: RiftBlessing) => {
        soundManager.playLevelUp(); // Divine sound
        selectBlessing(b);
    };

    const handleExit = () => {
        soundManager.playAttack(); // Click sound substitution
        exitRift(false); // Retreat
        onClose();
    };

    // calculate total gathered stats from blessings for display
    const aggregatedStats: Partial<Stats> = {
        attack: 0, defense: 0, hp: 0, magic: 0, speed: 0
    };

    // This is just a visual estimation, applying effects to a dummy object
    if (riftState) {
        let dummyStats: any = { attack: 0, defense: 0, hp: 0, magic: 0, speed: 0 };
        riftState.blessings.forEach(b => {
            dummyStats = b.effect(dummyStats);
        });
        aggregatedStats.attack = dummyStats.attack;
        aggregatedStats.defense = dummyStats.defense;
        aggregatedStats.hp = dummyStats.hp;
        aggregatedStats.magic = dummyStats.magic;
        aggregatedStats.speed = dummyStats.speed;
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-8 max-w-4xl w-full mx-4 shadow-[0_0_50px_rgba(168,85,247,0.2)] relative min-h-[600px] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-8 h-8 text-purple-400" />
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                        Temporal Anomalies
                    </h2>
                </div>
                <p className="text-slate-400 mb-6 italic border-b border-white/10 pb-4">
                    The fabric of time is weak here. Step into the rift to claim power from other timelines.
                </p>

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col items-center justify-center">

                    {!riftState?.active ? (
                        // LOBBY
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300">
                            <div className="p-6 bg-purple-500/10 rounded-full border-2 border-dashed border-purple-500/30 animate-spin-slow">
                                <Gem className="w-24 h-24 text-purple-400" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-semibold text-white">Enter the Rift</h3>
                                <p className="text-slate-400 max-w-md mx-auto">
                                    Enemies scale indefinitely. Choose blessings after every floor.
                                    How deep can you go?
                                </p>
                                <div className="flex justify-center gap-8 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Highest Floor: <span className="text-white">{gameStats?.highestRiftFloor || 0}</span></span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStart}
                                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-lg shadow-lg shadow-purple-900/50 hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                                Stabilize Rift (Start Run)
                            </button>
                        </div>
                    ) : (
                        // IN RIFT
                        <div className="w-full h-full flex flex-col">
                            {/* STATUS BAR */}
                            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg mb-8 border border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="text-2xl font-bold text-purple-300">
                                        Floor {riftState.floor}
                                    </div>
                                    <div className="flex gap-4 text-sm text-slate-300">
                                        <span className="flex items-center gap-1"><Sword size={14} className="text-red-400" /> +{Math.round(aggregatedStats.attack || 0)}</span>
                                        <span className="flex items-center gap-1"><Heart size={14} className="text-green-400" /> +{Math.round(aggregatedStats.hp || 0)}</span>
                                        <span className="flex items-center gap-1"><Shield size={14} className="text-blue-400" /> +{Math.round(aggregatedStats.defense || 0)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleExit}
                                    className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded text-sm border border-red-500/30"
                                >
                                    Retreat
                                </button>
                            </div>

                            {/* BLESSING SELECTION */}
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="text-xl text-center text-purple-200 mb-8 font-serif">
                                    Choose a Timeline Blessing
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {blessingOptions.map((blessing) => (
                                        <button
                                            key={blessing.id}
                                            onClick={() => handleSelect(blessing)}
                                            className={`
                                                group relative p-6 rounded-xl border transition-all duration-300 text-left
                                                hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]
                                                flex flex-col gap-4
                                                ${blessing.rarity === 'legendary' ? 'bg-orange-900/20 border-orange-500/50 hover:bg-orange-900/30' :
                                                    blessing.rarity === 'rare' ? 'bg-blue-900/20 border-blue-500/50 hover:bg-blue-900/30' :
                                                        'bg-slate-800/50 border-white/10 hover:bg-slate-800'}
                                            `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-3xl">{blessing.icon}</span>
                                                <span className={`
                                                    text-xs uppercase tracking-wider font-bold px-2 py-1 rounded
                                                    ${blessing.rarity === 'legendary' ? 'bg-orange-500/20 text-orange-300' :
                                                        blessing.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-slate-700 text-slate-400'}
                                                `}>
                                                    {blessing.rarity}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className={`text-lg font-bold mb-1 ${blessing.rarity === 'legendary' ? 'text-orange-200' :
                                                    blessing.rarity === 'rare' ? 'text-blue-200' :
                                                        'text-slate-200'
                                                    }`}>
                                                    {blessing.name}
                                                </h4>
                                                <p className="text-sm text-slate-400 group-hover:text-slate-300">
                                                    {blessing.description}
                                                </p>
                                            </div>

                                            {/* Glow effect on hover */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
