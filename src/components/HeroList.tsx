import React, { useState } from 'react';
import { Sword, Pickaxe, Heart, Shield, Zap, Brain, Skull, Flame, Droplets, ShieldAlert } from 'lucide-react';
import type { Hero } from '../engine/types';
import type { Synergy } from '../engine/synergies';
import { SYNERGY_DEFINITIONS } from '../engine/synergies';
import { GambitModal } from './modals/GambitModal';
import { HeroDetailModal } from './modals/HeroDetailModal';

import { Info, Crown } from 'lucide-react'; // Phase 58


interface HeroListProps {
    heroes: Hero[];
    actions: any;
    activeSynergies?: Synergy[];
    onOpenGear: (hero: Hero) => void;
}

export const HeroList: React.FC<HeroListProps> = ({ heroes, actions, activeSynergies = [], onOpenGear }) => {
    const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
    const [viewingHero, setViewingHero] = useState<Hero | null>(null);
    // Update 74

    const getContributingSynergies = (hero: Hero) => {
        if (!activeSynergies || activeSynergies.length === 0) return [];
        return activeSynergies.filter(syn => {
            const def = SYNERGY_DEFINITIONS.find(d => d.id === syn.id);
            if (!def) return false;

            // Check Class Set
            if (def.classSet && def.classSet.includes(hero.class)) return true;
            // Check Elements
            if (def.elements && def.elements.includes(hero.element)) return true;
            // Check Exact Class (Legacy)
            if (def.classes && def.classes.includes(hero.class)) return true;
            // Check Generic Count (e.g. 5 heroes)
            if (def.minCount && !def.classSet && !def.classes && !def.elements) return true;

            return false;
        });
    };

    const getSynergyIcon = (type: string) => {
        switch (type) {
            case 'burn': return <Flame size={10} className="text-orange-500" />;
            case 'freeze': return <Droplets size={10} className="text-cyan-400" />;
            case 'mitigation': return <Shield size={10} className="text-yellow-500" />;
            case 'cd_reduction': return <Zap size={10} className="text-purple-400" />;
            case 'crit_dmg': return <Sword size={10} className="text-red-500" />;
            default: return <Zap size={10} className="text-yellow-200" />;
        }
    };

    return (
        <div className="flex-1 bg-gray-800 p-2 overflow-y-auto no-scrollbar grid grid-cols-2 md:grid-cols-3 gap-2 border-t-4 border-gray-600">
            <GambitModal isOpen={!!selectedHero} onClose={() => setSelectedHero(null)} hero={selectedHero} actions={actions} />
            <HeroDetailModal isOpen={!!viewingHero} onClose={() => setViewingHero(null)} hero={viewingHero} actions={actions} />

            {heroes.map(hero => {
                const contributions = getContributingSynergies(hero);

                return (
                    <div key={hero.id} className={`relative p-2 rounded border-2 flex flex-col gap-1 transition-all ${!hero.unlocked ? 'opacity-50 border-gray-700 bg-gray-900 pointer-events-none grayscale' :
                        hero.isDead ? 'border-red-900 bg-red-950 opacity-70' :
                            'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1">
                                <span className="text-xl" role="img" aria-label={hero.name}>{hero.emoji}</span>
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold ${hero.isDead ? 'text-red-500' : 'text-white'}`}>{hero.name}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-gray-400">{hero.class}</span>
                                        {((hero.fatigue || 0) >= 50) && (
                                            <ShieldAlert size={10} className={(hero.fatigue || 0) >= 80 ? 'text-red-500 animate-pulse' : 'text-yellow-500'} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            {hero.unlocked && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setSelectedHero(hero)}
                                        className="p-1 rounded bg-slate-800 text-cyan-400 hover:text-cyan-200 border border-slate-600"
                                        title="Edit AI Tactics"
                                    >
                                        <Brain size={10} />
                                    </button>
                                    <button
                                        onClick={() => actions.toggleAssignment(hero.id)}
                                        className={`p-1 rounded border ${hero.assignment === 'combat' ? 'bg-red-900 border-red-500 text-red-200' : 'bg-blue-900 border-blue-500 text-blue-200'}`}
                                    >
                                        {hero.assignment === 'combat' ? <Sword size={10} /> : <Pickaxe size={10} />}
                                    </button>
                                    <button
                                        onClick={() => actions.purifyHero(hero.id)}
                                        className={`p-1 rounded border ${hero.insanity >= 50 ? 'bg-purple-900 border-purple-500 text-purple-200 animate-pulse' : 'bg-gray-800 border-gray-600 text-gray-500'}`}
                                        title={`Purify Hero (Resets Insanity) - Cost: 50 Souls`}
                                        disabled={!hero.insanity || hero.insanity === 0}
                                    >
                                        <Skull size={10} />
                                    </button>
                                    <button
                                        onClick={() => onOpenGear(hero)}
                                        className="p-1 rounded bg-yellow-900 border border-yellow-500 text-yellow-200"
                                        title="Manage Equipment"
                                    >
                                        <Shield size={10} />
                                    </button>
                                    <button
                                        onClick={() => setViewingHero(hero)}
                                        className="p-1 rounded bg-green-900 border border-green-500 text-green-200"
                                        title="View Stats & Skills"
                                    >
                                        <Info size={10} />
                                    </button>
                                    {/* Phase 58: Evolution */}
                                    {hero.level >= 50 && (
                                        <button
                                            onClick={() => actions.evolveHero(hero.id)}
                                            className="p-1 rounded bg-gradient-to-tr from-yellow-600 to-yellow-300 border border-yellow-100 text-yellow-900 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                            title="Evolve Hero (Reset Lv to 1, Massive Stats!)"
                                        >
                                            <Crown size={10} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {hero.unlocked && (
                            <div className="flex flex-col gap-1 mt-1">
                                {/* HP Bar */}
                                <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-300 ${hero.isDead ? 'bg-red-900' : 'bg-green-500'}`} style={{ width: `${(hero.stats.hp / hero.stats.maxHp) * 100}%` }}></div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 text-[9px] text-gray-300 mt-1">
                                    <div className="flex items-center gap-1"><Sword size={8} className="text-red-400" /> {hero.stats.attack}</div>
                                    <div className="flex items-center gap-1"><Shield size={8} className="text-yellow-400" /> {hero.stats.defense}</div>
                                    <div className="flex items-center gap-1"><Zap size={8} className="text-blue-400" /> {hero.stats.magic}</div>
                                    <div className="flex items-center gap-1"><Heart size={8} className="text-pink-400" /> {Math.floor(hero.stats.hp)}</div>
                                </div>

                                {/* Synergy Contribution Badges */}
                                {contributions.length > 0 && hero.assignment === 'combat' && (
                                    <div className="flex gap-1 mt-1 border-t border-gray-700 pt-1 justify-end">
                                        {contributions.map(s => (
                                            <div key={s.id} title={`Contributes to: ${s.name}`} className="bg-black bg-opacity-50 rounded p-0.5 border border-gray-700">
                                                {getSynergyIcon(s.type)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    );
};
