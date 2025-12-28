import React, { useState } from 'react';
import { X, Globe, Star, MapPinned } from 'lucide-react';
import type { GalaxySector } from '../../engine/types';

interface GalaxyModalProps {
    isOpen: boolean;
    onClose: () => void;
    galaxy: GalaxySector[];
    onConquer: (id: string) => void;
    partyPower: number;
    starlightUpgrades: string[];
}

export const GalaxyModal: React.FC<GalaxyModalProps> = ({ isOpen, onClose, galaxy, onConquer, partyPower, starlightUpgrades }) => {
    const [selectedSector, setSelectedSector] = useState<GalaxySector | null>(null);

    const hasScanner = starlightUpgrades.includes('galaxy_scanner');
    const getDifficulty = (base: number) => hasScanner ? Math.floor(base * 0.8) : base;

    if (!isOpen || !galaxy) return null;

    // Map coordinates to percentage (Assume range -100 to 100)
    const mapX = (x: number) => 50 + (x / 2);
    const mapY = (y: number) => 50 + (y / 2);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col relative overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/80 z-10">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 flex items-center gap-2">
                        <Globe className="text-blue-400" /> Galaxy Conquest
                    </h2>
                    <div className="text-sm font-mono text-gray-400">
                        PWR: <span className="text-red-400">{partyPower.toLocaleString()}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Star Map Container */}
                <div className="flex-1 relative bg-[url('https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center overflow-auto cursor-grab active:cursor-grabbing">
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Grid Lines (Optional) */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                    {/* Sectors */}
                    <div className="absolute inset-0">
                        {galaxy.map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => setSelectedSector(sector)}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 hover:scale-150 shadow-[0_0_10px_currentColor] ${sector.isOwned ? 'bg-green-500 text-green-500' :
                                    (partyPower >= getDifficulty(sector.difficulty) ? 'bg-yellow-400 text-yellow-400 animate-pulse' : 'bg-red-600 text-red-600')
                                    }`}
                                style={{
                                    left: `${mapX(sector.x)}%`,
                                    top: `${mapY(sector.y)}%`
                                }}
                            >
                                {/* Tooltip on Hover */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                                    {sector.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Sector Panel */}
                {selectedSector && (
                    <div className="absolute bottom-4 left-4 right-4 bg-gray-900/95 border border-gray-700 p-4 rounded-lg flex justify-between items-center shadow-lg animate-in slide-in-from-bottom duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {selectedSector.type === 'star' ? <Star size={16} className="text-yellow-400" /> : <Globe size={16} className="text-blue-400" />}
                                {selectedSector.name}
                            </h3>
                            <p className="text-gray-400 text-sm">{selectedSector.description}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className={selectedSector.isOwned ? 'text-green-400' : 'text-red-400'}>
                                    Status: {selectedSector.isOwned ? 'CONQUERED' : 'HOSTILE'}
                                </span>
                                <span className="text-yellow-400">
                                    Reward: +{selectedSector.reward.value} {selectedSector.reward.type}/s
                                </span>
                                <span className="text-blue-300">
                                    Difficulty: {selectedSector.difficulty.toLocaleString()} Power
                                </span>
                            </div>
                        </div>

                        {!selectedSector.isOwned ? (
                            <button
                                onClick={() => onConquer(selectedSector.id)}
                                disabled={partyPower < getDifficulty(selectedSector.difficulty) * 0.5} // Allow trying if >50% pow, but low chance
                                className={`px-6 py-3 rounded font-bold transition-all ${partyPower >= getDifficulty(selectedSector.difficulty)
                                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:scale-105 text-white shadow-[0_0_15px_rgba(0,255,0,0.5)]'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {partyPower >= getDifficulty(selectedSector.difficulty) ? 'CONQUER' : 'Too Dangerous'}
                            </button>
                        ) : (
                            <div className="px-6 py-3 bg-gray-800 text-green-400 font-bold rounded border border-green-900">
                                Generating Resources...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
