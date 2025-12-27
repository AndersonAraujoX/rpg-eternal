import React from 'react';
import { Star, Zap, ShoppingBag, Repeat, RefreshCw } from 'lucide-react';
import type { StarlightUpgrade } from '../../engine/types';

interface StarlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    starlight: number;
    upgrades: string[];
    onBuy: (id: string, cost: number) => void;
}

export const STARLIGHT_UPGRADES: StarlightUpgrade[] = [
    { id: 'auto_equip', name: 'Auto-Loader Protocol', cost: 5, description: 'Automatically equips items if they have better stats.' },
    { id: 'auto_tavern', name: 'Infinite Recruiter', cost: 10, description: 'Automatically hires/upgrades heroes when you have excess gold.' },
    { id: 'auto_rebirth', name: 'Cycle of Rebirth', cost: 25, description: 'Automatically triggers Rebirth when soul gain is optimal (Lv 100+).' },
    { id: 'resource_saver', name: 'Matter Weaver', cost: 50, description: 'Keep 10% of resources after Ascension.' },
];

export const StarlightModal: React.FC<StarlightModalProps> = ({ isOpen, onClose, starlight, upgrades, onBuy }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm">
            <div className="bg-slate-900 border-4 border-cyan-500 w-full max-w-2xl p-6 rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.5)] relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-500 hover:text-cyan-300 font-bold text-xl">X</button>

                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2 flex items-center justify-center gap-3">
                    <Star className="text-cyan-400" /> STARLIGHT CONSTELLATIONS
                </h2>
                <div className="text-center text-cyan-200 mb-8 font-mono">
                    Available Starlight: <span className="text-yellow-400 font-bold text-xl">{starlight}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {STARLIGHT_UPGRADES.map(upgrade => {
                        const isOwned = upgrades.includes(upgrade.id);
                        let Icon = Star;
                        if (upgrade.id === 'auto_equip') Icon = ShoppingBag;
                        if (upgrade.id === 'auto_tavern') Icon = Repeat;
                        if (upgrade.id === 'auto_rebirth') Icon = RefreshCw;
                        if (upgrade.id === 'resource_saver') Icon = Zap;

                        return (
                            <div key={upgrade.id} className={`p-4 rounded-xl border-2 ${isOwned ? 'bg-cyan-900/30 border-cyan-700' : 'bg-slate-800 border-slate-600'} transition-all hover:scale-[1.02]`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isOwned ? 'text-green-400' : 'text-white'}`}>
                                        <Icon size={18} /> {upgrade.name}
                                    </h3>
                                    {isOwned ? (
                                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">ACTIVE</span>
                                    ) : (
                                        <span className="text-yellow-400 font-bold">{upgrade.cost} ✨</span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm mb-4 min-h-[40px]">{upgrade.description}</p>
                                <button
                                    onClick={() => onBuy(upgrade.id, upgrade.cost)}
                                    disabled={isOwned || starlight < upgrade.cost}
                                    className={`w-full py-2 rounded font-bold transition-colors ${isOwned
                                            ? 'bg-slate-700 text-slate-500 cursor-default'
                                            : starlight >= upgrade.cost
                                                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isOwned ? 'UNLOCKED' : 'UNLOCK'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
