import React from 'react';
import type { Hero, GameActions, Stats } from '../../engine/types';
import { ITEM_SETS } from '../../engine/sets';
import { X, Sword, Shield, Zap, Heart, Wind, Flame, Droplets, Leaf } from 'lucide-react';

interface HeroDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    hero: Hero | null;
    actions: GameActions;
}

export const HeroDetailModal: React.FC<HeroDetailModalProps> = ({ isOpen, onClose, hero, actions }) => {
    const [isEditingName, setIsEditingName] = React.useState(false);
    const [newName, setNewName] = React.useState('');

    if (!isOpen || !hero) return null;

    const EMOJIS = ['⚔️', '🧙', '🌿', '🛡️', '🏹', '🗡️', '🔥', '❄️', '⚡', '🐉', '🧛', '👹', '🧚'];

    const handleRename = () => {
        if (newName.trim()) {
            actions.renameHero(hero.id, newName.trim());
            setIsEditingName(false);
        }
    };

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
                    <div className="group relative">
                        <div className="text-4xl shadow-inner bg-gray-800 rounded-xl p-2 border border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors">
                            {hero.emoji}
                        </div>
                        {/* Emoji Picker Overlay */}
                        <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 p-2 rounded-lg grid grid-cols-4 gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-10 transition-opacity shadow-xl">
                            {EMOJIS.map(e => (
                                <button key={e} onClick={() => actions.changeHeroEmoji(hero.id, e)} className="hover:bg-gray-700 p-1 rounded transition-colors">
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        {isEditingName ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    className="bg-gray-800 border border-blue-500 text-white px-2 py-1 rounded text-xl font-bold w-full"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    maxLength={12}
                                    placeholder={hero.name}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                />
                                <button onClick={handleRename} className="bg-green-600 px-3 rounded text-sm font-bold">OK</button>
                                <button onClick={() => setIsEditingName(false)} className="bg-gray-600 px-3 rounded text-sm">X</button>
                            </div>
                        ) : (
                            <h2
                                className="text-2xl font-bold text-white flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors"
                                onClick={() => { setNewName(hero.name); setIsEditingName(true); }}
                            >
                                {hero.name} {ElementIcon}
                            </h2>
                        )}
                        <div className="text-gray-400 text-sm">{hero.class} - Level {hero.level || 1}</div>
                    </div>
                </div>

                {/* XP Bars */}
                <div className="mb-6 space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span>Hero XP</span>
                            <span>{hero.xp || 0} / {hero.maxXp || 100}</span>
                        </div>
                        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-300"
                                style={{ width: `${Math.min(100, ((hero.xp || 0) / (hero.maxXp || 100)) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Insanity Bar */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                            <span className="text-purple-400">Insanity</span>
                            <span>{hero.insanity || 0} / 100</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                            <div
                                className="h-full bg-purple-600 transition-all duration-300 relative"
                                style={{ width: `${(hero.insanity || 0)}%` }}
                            ></div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 h-3">
                            {(hero.insanity || 0) >= 75 ? '⚠️ Risk of Madness' : (hero.insanity || 0) >= 50 ? '⚠️ Risk of Betrayal' : ''}
                        </div>
                    </div>

                    {/* Weapon XP (If Evolving) */}
                    {hero.equipment?.weapon?.evolutionId && (
                        <div>
                            <div className="flex justify-between text-xs text-yellow-300 mb-1">
                                <span>Weapon XP ({hero.equipment.weapon.name})</span>
                                <span>{hero.equipment.weapon.xp || 0} / {hero.equipment.weapon.maxXp || 100}</span>
                            </div>
                            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-yellow-700/50">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-600 to-red-500 transition-all duration-300"
                                    style={{ width: `${Math.min(100, ((hero.equipment.weapon.xp || 0) / (hero.equipment.weapon.maxXp || 100)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
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

                        {/* Set Bonuses */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Set Bonuses</h3>
                            <div className="bg-gray-900 border border-gray-700 rounded p-2">
                                {ITEM_SETS.map(set => {
                                    const equippedCount = Object.values(hero.equipment || {}).filter(i => i && i.setId === set.id).length;
                                    const isActive = equippedCount >= set.requiredPieces;
                                    return (
                                        <div key={set.id} className={`flex justify-between text-xs ${isActive ? "text-green-400 font-bold" : "text-gray-500"}`}>
                                            <span>{set.name} ({equippedCount}/{set.requiredPieces})</span>
                                            <span>+{Math.round(set.bonusValue * 100)}% {set.bonusStat.toUpperCase()}</span>
                                        </div>
                                    );
                                })}
                            </div>
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
