import React from 'react';
import { Share2, Clock, Trophy, Map } from 'lucide-react';
import { EXPEDITIONS } from '../../engine/types';
import type { Expedition, Hero } from '../../engine/types';

interface ExpeditionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeExpeditions: Expedition[];
    heroes: Hero[];
    startExpedition: (exp: Expedition, heroIds: string[]) => void;
}

export const ExpeditionsModal: React.FC<ExpeditionsModalProps> = ({ isOpen, onClose, activeExpeditions, heroes, startExpedition }) => {
    if (!isOpen) return null;

    const handleStart = (exp: Expedition) => {
        // Simple logic: Send up to 3 strongest IDLE heroes
        const idleHeroes = heroes
            .filter(h => h.assignment !== 'expedition' && h.assignment !== 'mine' && !h.assignment.includes('combat')) // Assuming 'combat' is default assignment string checking
            // Wait, assignment is 'combat' | 'mine' | 'expedition'.
            // Heroes in 'combat' are "busy" fighting?
            // Usually idle games treat 'current party' as busy.
            // If I take them out of combat, DPS drops.
            // Users should remove from party first? Or I auto-remove?
            // Let's filter for heroes that are NOT in the "active party slots" if I had slots.
            // But currently all unlocked heroes fight?
            // "Active heroes" line 110: heroes.filter(h => h.assignment === 'combat' && !h.isDead && h.unlocked);
            // So if I set assignment to 'expedition', they stop fighting.
            // That's fine.
            .sort((a, b) => b.stats.attack - a.stats.attack);

        if (idleHeroes.length === 0) {
            alert("No heroes available! Unassign miners or recruit more heroes.");
            return;
        }

        const team = idleHeroes.slice(0, 3);
        startExpedition(exp, team.map(h => h.id));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-amber-900/50 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-900/30">
                        <Map className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
                            Expeditions
                        </h2>
                        <p className="text-gray-400 text-sm">Send heroes on dangerous missions for loot.</p>
                    </div>
                </div>

                <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {EXPEDITIONS.map(exp => {
                        const active = activeExpeditions.find(e => e.id === exp.id);
                        const progress = active ? Math.min(100, ((Date.now() - (active.startTime || 0)) / (exp.duration * 1000)) * 100) : 0;
                        const timeLeft = active ? Math.max(0, (exp.duration * 1000) - (Date.now() - (active.startTime || 0))) : 0;

                        return (
                            <div key={exp.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-amber-900/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-amber-100">{exp.name}</h3>
                                        <p className="text-gray-400 text-sm">{exp.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs bg-gray-900/50 px-2 py-1 rounded border border-gray-700">
                                        <Clock className="w-3 h-3 text-amber-500" />
                                        <span>{Math.floor(exp.duration / 60)}m</span>
                                        <span className="text-gray-600">|</span>
                                        <Share2 className="w-3 h-3 text-red-500" />
                                        <span>Dif {exp.difficulty}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Rewards */}
                                    <div className="flex flex-wrap gap-2">
                                        {exp.rewards.map((r, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-gray-900 rounded text-gray-300 border border-gray-700">
                                                {r.type.toUpperCase()}: {r.min}-{r.max}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Action / Progress */}
                                    {active ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-amber-500">
                                                <span>In Progress...</span>
                                                <span>{Math.ceil(timeLeft / 1000)}s remaining</span>
                                            </div>
                                            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-600 transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleStart(exp)}
                                            className="w-full py-2 bg-amber-700 hover:bg-amber-600 rounded-lg text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <Trophy className="w-4 h-4" />
                                            Dispatch Heroes
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
