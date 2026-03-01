import React from 'react';
import { X, Zap, DollarSign, Ghost, Star, UserPlus, TrendingUp, Trash2, ShieldAlert } from 'lucide-react';
import type { Hero, Item, Achievement, Building } from '../../engine/types';

interface DevToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
    setGold: React.Dispatch<React.SetStateAction<number>>;
    setSouls: React.Dispatch<React.SetStateAction<number>>;
    setDivinity: React.Dispatch<React.SetStateAction<number>>;
    setStarlight: React.Dispatch<React.SetStateAction<number>>;
    setHeroes: React.Dispatch<React.SetStateAction<Hero[]>>;
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
    setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
    setGameSpeed: (speed: number) => void;
    gameSpeed: number;
    setOuterSpaceUnlocked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DevToolsModal: React.FC<DevToolsModalProps> = ({
    isOpen,
    onClose,
    setGold,
    setSouls,
    setDivinity,
    setStarlight,
    setHeroes,
    setItems,
    setAchievements,
    setBuildings,
    setGameSpeed,
    gameSpeed,
    setOuterSpaceUnlocked
}) => {
    if (!isOpen) return null;

    const addResource = (type: 'gold' | 'souls' | 'divinity' | 'starlight', amount: number) => {
        if (type === 'gold') setGold(prev => prev + amount);
        if (type === 'souls') setSouls(prev => prev + amount);
        if (type === 'divinity') setDivinity(prev => prev + amount);
        if (type === 'starlight') setStarlight(prev => prev + amount);
    };

    const unlockAllHeroes = () => {
        setHeroes(prev => prev.map(h => ({ ...h, unlocked: true })));
    };

    const maxLevelHeroes = () => {
        setHeroes(prev => prev.map(h => ({
            ...h,
            level: 100,
            xp: 0,
            maxXp: 1000000,
            stats: {
                ...h.stats,
                hp: h.stats.maxHp,
                attack: h.stats.attack + 500,
                magic: h.stats.magic + 500,
                defense: h.stats.defense + 200,
            }
        })));
    };

    const resetFatigue = () => {
        setHeroes(prev => prev.map(h => ({ ...h, fatigue: 0 })));
    };

    const unlockAchievements = () => {
        setAchievements(prev => prev.map(a => ({ ...a, isUnlocked: true })));
    };

    const maxBuildings = () => {
        setBuildings(prev => prev.map(b => ({ ...b, level: b.maxLevel })));
    };

    const addLoot = () => {
        // We don't have direct access to generateLoot here without importing it
        // Since this is dev tools, we can just add some dummy powerful items or call an action if available
        const items: Item[] = Array.from({ length: 3 }).map((_, i) => ({
            id: `dev-${Date.now()}-${i}`,
            name: `Dev Sword +${i}`,
            type: 'weapon',
            rarity: 'legendary',
            value: 1000,
            stat: 'attack',
            emoji: '⚔️',
            unlocked: true,
            sockets: 0,
            runes: []
        }));
        setItems(prev => [...prev, ...items]);
    };

    const hardReset = () => {
        if (confirm("REALLY reset everything? This will wipe your save!")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-red-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_20px_rgba(153,27,27,0.4)]">
                {/* Header */}
                <div className="bg-red-950 p-4 border-b border-red-900 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-red-400">
                        <ShieldAlert size={20} />
                        <h2 className="text-xl font-bold tracking-wider">DEVELOPER TOOLS</h2>
                    </div>
                    <button onClick={onClose} className="text-red-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Resources Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap size={14} /> Resources
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button onClick={() => addResource('gold', 1000000)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 flex flex-col items-center gap-2 transition-all">
                                <DollarSign size={20} className="text-yellow-500" />
                                <span className="text-xs">+1M Gold</span>
                            </button>
                            <button onClick={() => addResource('souls', 10000)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 flex flex-col items-center gap-2 transition-all">
                                <Ghost size={20} className="text-purple-400" />
                                <span className="text-xs">+10k Souls</span>
                            </button>
                            <button onClick={() => addResource('divinity', 1000)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 flex flex-col items-center gap-2 transition-all">
                                <Star size={20} className="text-cyan-400" />
                                <span className="text-xs">+1k Divinity</span>
                            </button>
                            <button onClick={() => addResource('starlight', 500)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 flex flex-col items-center gap-2 transition-all">
                                <Star size={20} className="text-blue-300" />
                                <span className="text-xs">+500 Star</span>
                            </button>
                        </div>
                    </section>

                    {/* Heroes Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <UserPlus size={14} /> Heroes & Power
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <button onClick={unlockAllHeroes} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-xs transition-all">
                                Unlock All Heroes
                            </button>
                            <button onClick={maxLevelHeroes} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-xs transition-all">
                                Max Level All (100)
                            </button>
                            <button onClick={resetFatigue} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-xs transition-all">
                                Reset Fatigue
                            </button>
                            <button onClick={unlockAchievements} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-xs transition-all">
                                Unlock Achievements
                            </button>
                            <button onClick={maxBuildings} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-xs transition-all">
                                Max Buildings
                            </button>
                            <button onClick={addLoot} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-xs transition-all">
                                Add 3 Dev Items
                            </button>
                        </div>
                    </section>

                    {/* Game State Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={14} /> Game Speed ({gameSpeed}x)
                        </h3>
                        <div className="flex gap-2">
                            {[1, 2, 5, 10, 20].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => setGameSpeed(speed)}
                                    className={`flex-1 p-2 rounded border text-xs transition-all ${gameSpeed === speed ? 'bg-red-900 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </section>
                    <section>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Star size={14} /> Features
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <button onClick={() => setOuterSpaceUnlocked(true)} className="bg-slate-800 hover:bg-slate-700 p-3 rounded border border-slate-700 text-xs transition-all">
                                Unlock Outer Space
                            </button>
                        </div>
                    </section>

                    {/* Danger Zone Section */}
                    <section className="pt-4 border-t border-red-900/30">
                        <div className="bg-red-900/10 border border-red-900/50 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <h4 className="text-red-400 font-bold text-sm">DANGER ZONE</h4>
                                <p className="text-slate-400 text-xs">These actions cannot be undone.</p>
                            </div>
                            <button onClick={hardReset} className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm transition-all shadow-lg">
                                <Trash2 size={16} /> WIPE SAVE
                            </button>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950 text-slate-500 text-[10px] text-center uppercase tracking-tighter">
                    Eternal RPG Debug Interface v1.0 • Use with caution
                </div>
            </div>
        </div>
    );
};
