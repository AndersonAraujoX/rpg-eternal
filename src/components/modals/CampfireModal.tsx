import React from 'react';
import type { Hero } from '../../engine/types';
import { Flame, Tent, X, Coffee, ShieldAlert } from 'lucide-react';

interface CampfireModalProps {
    isOpen: boolean;
    onClose: () => void;
    heroes: Hero[];
    onAssign: (heroId: string, assignment: 'campfire' | 'combat' | 'mine' | 'expedition') => void;
}

export const CampfireModal: React.FC<CampfireModalProps> = ({ isOpen, onClose, heroes, onAssign }) => {
    if (!isOpen) return null;

    // Filter heroes that are available to rest (not dead, not in mine/expedition unless we allow switching directly)
    // For simplicity, list all alive heroes.
    const availableHeroes = heroes.filter(h => !h.isDead);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-orange-500/30 rounded-lg p-6 max-w-2xl w-full shadow-2xl relative overflow-hidden">
                {/* Background Ambient Effect */}
                <div className="absolute inset-0 bg-orange-900/10 pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold font-display text-orange-400 flex items-center gap-2">
                        <Flame className="w-8 h-8 animate-pulse text-orange-500" />
                        Cozy Campfire
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 relative z-10 custom-scrollbar">
                    {availableHeroes.map(hero => {
                        const isResting = hero.assignment === 'campfire';
                        const fatigue = hero.fatigue || 0;
                        const maxFatigue = hero.maxFatigue || 100;
                        const fatiguePercent = (fatigue / maxFatigue) * 100;

                        // Determine status color
                        let statusColor = 'text-green-400';
                        if (fatiguePercent >= 80) statusColor = 'text-red-500';
                        else if (fatiguePercent >= 50) statusColor = 'text-yellow-400';

                        return (
                            <div key={hero.id} className={`p-4 rounded-lg border transition-all ${isResting ? 'bg-orange-900/20 border-orange-500/50 shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-lg text-slate-200">{hero.name}</div>
                                        <div className="text-xs text-slate-400">Lvl {hero.level} {hero.class}</div>
                                    </div>
                                    {isResting && <Tent className="w-5 h-5 text-orange-400" />}
                                </div>

                                <div className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="flex items-center gap-1">
                                            Fatigue
                                            {fatiguePercent >= 50 && <ShieldAlert className={`w-3 h-3 ${statusColor}`} />}
                                        </span>
                                        <span className={statusColor}>{Math.floor(fatigue)} / {maxFatigue}</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${fatiguePercent >= 80 ? 'bg-red-500' : fatiguePercent >= 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${fatiguePercent}%` }}
                                        />
                                    </div>
                                    {fatiguePercent >= 80 && <div className="text-[10px] text-red-400 mt-1">Severe Stats Penalty (-30%)</div>}
                                    {fatiguePercent >= 50 && fatiguePercent < 80 && <div className="text-[10px] text-yellow-400 mt-1">Minor Stats Penalty (-10%)</div>}
                                </div>

                                <div className="flex gap-2">
                                    {isResting ? (
                                        <button
                                            onClick={() => onAssign(hero.id, 'combat')}
                                            className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            Return to Combat
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onAssign(hero.id, 'campfire')}
                                            className="flex-1 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Coffee className="w-4 h-4" />
                                            Rest by Fire
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 text-center text-xs text-slate-500 relative z-10">
                    Resting recovers 5 Fatigue per second. Combat generates 1 Fatigue every ~10s.
                </div>
            </div>
        </div>
    );
};
