import React from 'react';
import { Shield, Zap, Flame, Droplets, Leaf, Sword } from 'lucide-react';
import type { Synergy } from '../engine/synergies';

interface SynergyTrackerProps {
    activeSynergies: Synergy[];
    suggestions?: string[];
    className?: string;
    onClose: () => void;
}

export const SynergyTracker: React.FC<SynergyTrackerProps> = ({ activeSynergies, suggestions = [], className, onClose }) => {

    // Group synergies by type for better display
    const reactions = activeSynergies.filter(s => ['burn', 'freeze', 'steam', 'overload'].includes(s.type));
    const classBonuses = activeSynergies.filter(s => !['burn', 'freeze', 'steam', 'overload'].includes(s.type));

    const getIcon = (type: string) => {
        switch (type) {
            case 'burn': return <Flame className="text-orange-500" size={16} />;
            case 'freeze': return <Droplets className="text-cyan-400" size={16} />;
            case 'steam': return <Zap className="text-gray-300" size={16} />;
            case 'damage_mitigation': return <Shield className="text-yellow-500" size={16} />;
            case 'cd_reduction': return <Zap className="text-purple-400" size={16} />;
            case 'crit_dmg': return <Sword className="text-red-500" size={16} />;
            default: return <Leaf className="text-green-500" size={16} />;
        }
    };

    return (
        <div className={`absolute top-16 right-4 w-64 bg-gray-900 border border-yellow-500 rounded p-4 shadow-2xl z-50 ${className}`}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h3 className="text-yellow-400 font-bold text-sm tracking-wider">TACTICAL INTEL</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">[CLOSE]</button>
            </div>

            {activeSynergies.length === 0 && suggestions.length === 0 && (
                <div className="text-gray-500 text-xs text-center italic py-4">No active synergies detected.</div>
            )}

            {reactions.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-gray-400 text-xs font-bold mb-2 uppercase">Elemental Reactions</h4>
                    <div className="space-y-2">
                        {reactions.map(s => (
                            <div key={s.id} className="bg-black bg-opacity-40 p-2 rounded flex items-center gap-2 border-l-2 border-orange-500">
                                {getIcon(s.type)}
                                <div>
                                    <div className="text-xs font-bold text-white">{s.name}</div>
                                    <div className="text-[10px] text-gray-400">{s.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {classBonuses.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-gray-400 text-xs font-bold mb-2 uppercase">Formation Bonuses</h4>
                    <div className="space-y-2">
                        {classBonuses.map(s => (
                            <div key={s.id} className="bg-black bg-opacity-40 p-2 rounded flex items-center gap-2 border-l-2 border-blue-500">
                                {getIcon(s.type)}
                                <div>
                                    <div className="text-xs font-bold text-white">{s.name}</div>
                                    <div className="text-[10px] text-gray-400">{s.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="animate-pulse">
                    <h4 className="text-green-400 text-xs font-bold mb-2 uppercase flex items-center gap-1">
                        <Zap size={12} /> Opportunities
                    </h4>
                    <div className="space-y-2">
                        {suggestions.map((s, idx) => (
                            <div key={idx} className="bg-green-900 bg-opacity-20 border border-green-700 p-2 rounded text-xs text-green-100">
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSynergies.length > 0 && suggestions.length === 0 && (
                <div className="mt-4 text-[10px] text-center text-gray-600">
                    Max synergy efficiency reached?
                </div>
            )}
        </div>
    );
};
