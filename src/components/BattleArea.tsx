import React from 'react';
import { Sword, Flame, Droplets, Leaf } from 'lucide-react';
import type { Boss, Pet, Artifact, Hero } from '../engine/types';

interface BattleAreaProps {
    boss: Boss;
    dungeonActive: boolean;
    dungeonTimer: number;
    ultimateCharge: number;
    pet: Pet | null;
    actions: any;
    artifacts: Artifact[];
    heroes: Hero[]; // Passed for hero effects or rendering behind boss
}

const getElementIcon = (el: string) => {
    if (el === 'fire') return <Flame size={12} className="text-red-400" />;
    if (el === 'water') return <Droplets size={12} className="text-blue-400" />;
    if (el === 'nature') return <Leaf size={12} className="text-green-400" />;
    return null;
};

export const BattleArea: React.FC<BattleAreaProps> = ({ boss, dungeonActive, dungeonTimer, ultimateCharge, pet, artifacts, actions }) => {
    return (
        <div className="flex-1 relative bg-gray-900 flex flex-col justify-between p-4 overflow-hidden" id="battle-field">
            {/* Artifacts */}
            <div className="absolute top-2 left-2 flex gap-1 z-20 flex-wrap max-w-[200px]">
                {artifacts.map(a => (
                    <div key={a.id} className="w-5 h-5 bg-yellow-900 border border-yellow-500 rounded flex items-center justify-center text-[10px] cursor-help" title={a.name}>{a.emoji}</div>
                ))}
            </div>

            <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center"><Sword className="w-64 h-64" /></div>

            {/* Boss */}
            <div className="flex flex-col items-center justify-center mt-2 transition-all">
                {dungeonActive && <div className="text-yellow-400 font-bold animate-pulse mb-2">GOLD VAULT: {Math.floor(dungeonTimer)}s</div>}
                <div className="flex items-center gap-2">
                    <div className={`text-6xl md:text-8xl filter drop-shadow-lg transition-transform ${boss.stats.hp < boss.stats.maxHp * 0.9 ? 'animate-pulse' : ''} ${boss.isDead ? 'scale-0' : ''}`}>{boss.emoji}</div>
                    <div className="text-white opacity-50" title={`Element: ${boss.element}`}>{getElementIcon(boss.element)}</div>
                </div>

                <div className="w-48 h-4 bg-gray-700 mt-2 bar-container relative rounded">
                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(boss.stats.hp / boss.stats.maxHp) * 100}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white z-10">{boss.stats.hp}/{boss.stats.maxHp}</div>
                </div>

                <div className="w-48 h-1 bg-gray-800 mt-1 relative rounded overflow-hidden">
                    <div className={`h-full transition-all duration-100 ${ultimateCharge >= 100 ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-800'}`} style={{ width: `${ultimateCharge}%` }}></div>
                </div>
            </div>

            {/* Pet */}
            {pet && (
                <div className="absolute top-1/2 left-2 transform -translate-y-1/2 flex flex-col items-center z-20 opacity-90 group">
                    <div className="text-3xl filter drop-shadow hover:scale-110 transition-transform cursor-pointer animate-bounce" title={`Lvl ${pet.level} ${pet.name}`}>
                        {pet.emoji}
                    </div>
                    <div className="flex flex-col items-center bg-black bg-opacity-50 p-1 rounded backdrop-blur-sm mt-1">
                        <span className="text-[8px] text-orange-300 font-bold mb-0.5">Lvl {pet.level}</span>
                        <div className="w-10 h-1 bg-gray-700 rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${(pet.xp / pet.maxXp) * 100}%` }}></div>
                        </div>
                        <div className="flex gap-1 opacity-100 transition-opacity">
                            <button onClick={() => actions.feedPet('gold')} className="w-4 h-4 bg-yellow-600 rounded flex items-center justify-center text-[6px] text-white hover:bg-yellow-500" title="Feed 100 Gold" disabled={false}>$</button>
                            <button onClick={() => actions.feedPet('souls')} className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center text-[6px] text-white hover:bg-purple-500" title="Feed 10 Souls">S</button>
                        </div>
                        <span className="text-[6px] text-gray-400 mt-0.5">{pet.bonus}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
