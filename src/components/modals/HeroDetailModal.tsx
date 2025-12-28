import React from 'react';
import type { Hero, Stats } from '../../engine/types';
import { X, Sword, Shield, Zap, Heart, Wind, Flame, Droplets, Leaf } from 'lucide-react';

interface HeroDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    hero: Hero | null;
    actions: any;
}

export const HeroDetailModal: React.FC<HeroDetailModalProps> = ({ isOpen, onClose, hero, actions }) => {
    if (!isOpen || !hero) return null;

    const ElementIcon = {
        fire: <Flame size={16} className="text-orange-500" />,
        water: <Droplets size={16} className="text-blue-500" />,
        nature: <Leaf size={16} className="text-green-500" />,
        neutral: <div className="w-4 h-4 bg-gray-500 rounded-full" />,
        light: <div className="w-4 h-4 bg-yellow-100 rounded-full shadow-[0_0_10px_yellow]" />,
        dark: <div className="w-4 h-4 bg-purple-900 rounded-full shadow-[0_0_10px_purple]" />
    }[hero.element || 'neutral'];

    const statsConfig: { key: keyof Stats; label: string; icon: React.ReactNode; color: string }[] = [
        { key: 'hp', label: 'Max Health', icon: <Heart size={14} />, color: 'text-green-400' },
        { key: 'mp', label: 'Max Mana', icon: <Zap size={14} />, color: 'text-blue-400' },
        { key: 'attack', label: 'Attack', icon: <Sword size={14} />, color: 'text-red-400' },
        { key: 'defense', label: 'Defense', icon: <Shield size={14} />, color: 'text-yellow-400' },
        { key: 'magic', label: 'Magic', icon: <Zap size={14} />, color: 'text-purple-400' },
        { key: 'speed', label: 'Speed', icon: <Wind size={14} />, color: 'text-cyan-400' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl shadow-inner bg-gray-800 rounded-xl p-2 border border-gray-700">{hero.emoji}</div>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {hero.name} {ElementIcon}
                        </h2>
                        <div className="text-gray-400 text-sm">{hero.class} - Level {hero.level || 1}</div>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                        <span>XP Progress</span>
                        <span>{hero.xp || 0} / {hero.maxXp || 100}</span>
                    </div>
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, ((hero.xp || 0) / (hero.maxXp || 100)) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Stats Section */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Attributes</h3>
                            <span className="text-xs text-gray-500 italic">Stats increase automatically on Level Up based on Class.</span>
                        </div>

                        <div className="space-y-3">
                            {statsConfig.map(stat => (
                                <div key={stat.key} className="flex items-center justify-between bg-gray-900 p-2 rounded">
                                    <div className={`flex items-center gap-2 ${stat.color} font-medium`}>
                                        {stat.icon} <span>{stat.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-mono text-lg">{Math.floor(hero.stats[stat.key])}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Active Skills</h3>
                            {hero.skills && hero.skills.filter(s => s.type === 'active').length > 0 ? (
                                <div className="space-y-2">
                                    {hero.skills.filter(s => s.type === 'active').map(skill => (
                                        <div key={skill.id} className="bg-gray-900 p-3 rounded border border-gray-600 flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-cyan-300">{skill.name}</div>
                                                <div className="text-xs text-gray-400">{skill.description}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">CD: {skill.cooldown}s</span>
                                                <span className="text-xs text-blue-400 block">Lvl {skill.unlockLevel}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-2">No active skills unlocked.</div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Passive Skills</h3>
                            {hero.skills && hero.skills.filter(s => s.type === 'passive').length > 0 ? (
                                <div className="space-y-2">
                                    {hero.skills.filter(s => s.type === 'passive').map(skill => (
                                        <div key={skill.id} className="bg-gray-900 p-3 rounded border border-gray-600">
                                            <div className="font-bold text-yellow-300">{skill.name}</div>
                                            <div className="text-xs text-gray-400">{skill.description}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-2">No passive skills unlocked.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
