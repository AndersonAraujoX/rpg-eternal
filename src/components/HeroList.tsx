import React from 'react';
import { Pickaxe, Sword } from 'lucide-react';
import type { Hero } from '../engine/types';
import { Flame, Droplets, Leaf } from 'lucide-react';

interface HeroListProps {
    heroes: Hero[];
    actions: any;
}

const getElementIcon = (el: string) => {
    if (el === 'fire') return <Flame size={12} className="text-red-400" />;
    if (el === 'water') return <Droplets size={12} className="text-blue-400" />;
    if (el === 'nature') return <Leaf size={12} className="text-green-400" />;
    return null;
};

export const HeroList: React.FC<HeroListProps> = ({ heroes, actions }) => {
    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2 w-full relative z-10 mt-4">
            {heroes.map((hero) => (
                <div key={hero.id} className={`flex flex-col items-center p-1 rounded transition-all border-2 relative group ${!hero.unlocked ? 'bg-gray-900 border-gray-700 opacity-50 grayscale' : 'bg-gray-800 border-gray-600'} ${hero.isDead ? 'grayscale opacity-50' : ''}`}>
                    {/* Element Icon */}
                    {hero.unlocked && <div className="absolute top-1 left-1 opacity-75">{getElementIcon(hero.element)}</div>}

                    {/* Assignment Toggle */}
                    {hero.unlocked && (
                        <div className="flex gap-1 mt-1 absolute top-1 right-1">
                            <button onClick={() => actions.toggleAssignment(hero.id)} className={`p-1 rounded-full text-[10px] ${hero.assignment === 'mine' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                                {hero.assignment === 'mine' ? <Pickaxe size={10} /> : <Sword size={10} />}
                            </button>
                        </div>
                    )}

                    <div className="text-2xl md:text-3xl mb-1 mt-2">{hero.unlocked ? hero.emoji : '🔒'}</div>
                    {hero.unlocked && (
                        <div className="w-full h-2 bg-gray-700 bar-container relative rounded">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(hero.stats.hp / hero.stats.maxHp) * 100}%` }} />
                        </div>
                    )}
                    <div className="text-[6px] text-gray-500 mt-1">{hero.class}</div>
                    {hero.assignment === 'mine' && <div className="text-[8px] text-orange-400 animate-pulse">MINING...</div>}
                </div>
            ))}
        </div>
    );
};
