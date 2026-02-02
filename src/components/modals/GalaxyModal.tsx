import React, { useState } from 'react';
import { X, Globe, Star, Rocket, Zap } from 'lucide-react';
import type { GalaxySector, Spaceship } from '../../engine/types';

interface GalaxyModalProps {
    isOpen: boolean;
    onClose: () => void;
    galaxy: GalaxySector[];
    onConquer: (id: string) => void;
    partyPower: number;
    starlightUpgrades: Record<string, number>;
    spaceship: Spaceship;
    onUpgradeShip: (part: 'shields' | 'engine' | 'scanners') => void;
    towerFloor: number;
    voidAscensions: number;
    onAscend: () => void;
}

export const GalaxyModal: React.FC<GalaxyModalProps> = ({
    isOpen, onClose, galaxy, onConquer, partyPower, starlightUpgrades, spaceship, onUpgradeShip,
    towerFloor, voidAscensions, onAscend
}) => {
    const [selectedSector, setSelectedSector] = useState<GalaxySector | null>(null);
    const [view, setView] = useState<'map' | 'hangar' | 'void'>('map');

    const scannerLevel = starlightUpgrades['galaxy_scanner'] || 0;
    const getDifficulty = (base: number) => scannerLevel > 0 ? Math.floor(base * (1 - (scannerLevel * 0.1))) : base;

    // Helper for hazard level comparison
    const hazardMap: Record<string, number> = { 'safe': 1, 'low': 2, 'medium': 3, 'high': 4, 'extreme': 5 };
    const getHazardValue = (h?: string) => h ? hazardMap[h] || 1 : 1;

    if (!isOpen || !galaxy) return null;

    // Map coordinates to percentage (Assume range -100 to 100)
    const mapX = (x: number) => 50 + (x / 2);
    const mapY = (y: number) => 50 + (y / 2);

    const getDistance = (s: GalaxySector) => Math.sqrt(s.x * s.x + s.y * s.y);
    const maxRange = spaceship.parts.engine * 25;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col relative overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/80 z-10">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setView('map')}
                            className={`flex items-center gap-2 px-4 py-2 rounded ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        >
                            <Globe size={18} /> Star Map
                        </button>
                        <button
                            onClick={() => setView('hangar')}
                            className={`flex items-center gap-2 px-4 py-2 rounded ${view === 'hangar' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        >
                            <Rocket size={18} /> Hangar
                        </button>
                        <button
                            onClick={() => setView('void')}
                            className={`flex items-center gap-2 px-4 py-2 rounded ${view === 'void' ? 'bg-purple-600 text-white animate-pulse' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        >
                            <Zap size={18} /> Void Ascension
                        </button>
                    </div>

                    <div className="text-sm font-mono text-gray-400 flex gap-4">
                        <span>PWR: <span className="text-red-400">{partyPower.toLocaleString()}</span></span>
                        <span>Range: <span className="text-cyan-400">{maxRange} ly</span></span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 relative overflow-hidden">
                    {view === 'map' ? (
                        <div className="w-full h-full relative bg-[url('https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center overflow-auto cursor-grab active:cursor-grabbing">
                            <div className="absolute inset-0 bg-black/40"></div>
                            {/* Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                            {/* Range Circle */}
                            <div
                                className="absolute border border-cyan-500/30 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    width: `${maxRange * 4}%`, // Visual approximation
                                    height: `${maxRange * 4}%`
                                }}
                            ></div>

                            {/* Sectors */}
                            <div className="absolute inset-0">
                                {galaxy.map(sector => {
                                    const dist = getDistance(sector);
                                    const inRange = dist <= maxRange;
                                    const sectorHazard = getHazardValue(sector.hazardLevel);
                                    const hazardSafe = sectorHazard <= spaceship.parts.shields;

                                    return (
                                        <button
                                            key={sector.id}
                                            onClick={() => setSelectedSector(sector)}
                                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300 shadow-[0_0_10px_currentColor] 
                                                ${!inRange ? 'bg-gray-700 text-gray-700 opacity-50' :
                                                    sector.isOwned ? 'bg-green-500 text-green-500' :
                                                        !hazardSafe ? 'bg-orange-600 text-orange-600 animate-pulse' :
                                                            (partyPower >= getDifficulty(sector.difficulty) ? 'bg-yellow-400 text-yellow-400 hover:scale-150' : 'bg-red-600 text-red-600')
                                                }`}
                                            style={{
                                                left: `${mapX(sector.x)}%`,
                                                top: `${mapY(sector.y)}%`
                                            }}
                                        >
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selection Logic */}
                            {selectedSector && (
                                <div className="absolute bottom-4 left-4 right-4 bg-gray-900/95 border border-gray-700 p-4 rounded-lg flex justify-between items-center shadow-lg animate-in slide-in-from-bottom duration-300">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            {selectedSector.type === 'star' ? <Star size={16} className="text-yellow-400" /> : <Globe size={16} className="text-blue-400" />}
                                            {selectedSector.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm">{selectedSector.description}</p>
                                        <div className="flex gap-4 mt-2 text-sm flex-wrap">
                                            <span className={selectedSector.isOwned ? 'text-green-400' : 'text-red-400'}>
                                                {selectedSector.isOwned ? 'CONQUERED' : 'HOSTILE'}
                                            </span>
                                            <span className="text-cyan-300">
                                                Dist: {Math.floor(getDistance(selectedSector))} ly
                                            </span>
                                            {selectedSector.hazardLevel && (
                                                <span className={`${spaceship.parts.shields >= getHazardValue(selectedSector.hazardLevel) ? 'text-green-400' : 'text-orange-500 font-bold'}`}>
                                                    Hazard: {selectedSector.hazardLevel.toUpperCase()} {spaceship.parts.shields < getHazardValue(selectedSector.hazardLevel) && '(SHIELDS TOO WEAK)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {!selectedSector.isOwned ? (
                                        <button
                                            onClick={() => onConquer(selectedSector.id)}
                                            disabled={
                                                getDistance(selectedSector) > maxRange ||
                                                getHazardValue(selectedSector.hazardLevel) > spaceship.parts.shields ||
                                                partyPower < getDifficulty(selectedSector.difficulty) * 0.5
                                            }
                                            className={`px-6 py-3 rounded font-bold transition-all ${getDistance(selectedSector) > maxRange ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                                                getHazardValue(selectedSector.hazardLevel) > spaceship.parts.shields ? 'bg-orange-900/50 text-orange-500 cursor-not-allowed border border-orange-500' :
                                                    partyPower >= getDifficulty(selectedSector.difficulty)
                                                        ? 'bg-gradient-to-r from-green-600 to-green-500 hover:scale-105 text-white shadow-[0_0_15px_rgba(0,255,0,0.5)]'
                                                        : 'bg-red-900/50 text-red-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {getDistance(selectedSector) > maxRange ? 'OUT OF RANGE' :
                                                getHazardValue(selectedSector.hazardLevel) > spaceship.parts.shields ? 'HAZARD LETHAL' :
                                                    partyPower >= getDifficulty(selectedSector.difficulty) ? 'CONQUER' : 'Too Dangerous'}
                                        </button>
                                    ) : (
                                        <div className="px-6 py-3 bg-gray-800 text-green-400 font-bold rounded border border-green-900">
                                            Generating Resources...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : view === 'hangar' ? (
                        <div className="p-8 h-full bg-slate-900 overflow-y-auto">
                            <h3 className="text-2xl font-bold text-orange-400 mb-6 flex items-center gap-2">
                                <Rocket /> Spaceship Hangar
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(['shields', 'engine', 'scanners'] as const).map(part => (
                                    <div key={part} className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl">
                                        <h4 className="text-xl font-bold capitalize mb-2">{part}</h4>
                                        <div className="text-sm text-gray-400 mb-4">
                                            Current Level: <span className="text-orange-400 font-bold">{spaceship.parts[part]}</span>
                                        </div>
                                        <button
                                            onClick={() => onUpgradeShip(part)}
                                            className="w-full py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded shadow-lg transition-all"
                                        >
                                            UPGRADE
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : view === 'void' ? (
                        <div className="p-12 flex flex-col items-center justify-center h-full bg-slate-950 text-center">
                            <div className="text-8xl mb-8 animate-bounce">🌌</div>
                            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">Void Ascension</h3>
                            <p className="text-gray-400 max-w-lg mb-8">
                                Reset your current progress to transcend the physical realm.
                                Gain permanent <span className="text-purple-400 font-bold">Void Power</span> and unlock cosmic secrets.
                            </p>

                            <div className="bg-gray-900 border border-purple-500/30 p-6 rounded-xl mb-8 w-full max-w-md">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Current Void Level:</span>
                                    <span className="text-purple-400 font-mono font-bold">{voidAscensions}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-400">Tower Floor Required:</span>
                                    <span className={`${towerFloor >= 100 ? 'text-green-400' : 'text-red-400'} font-mono`}>100</span>
                                </div>
                                <div className="text-sm text-gray-500 italic">
                                    Ascending will reset: Gold, Souls, Items, Tower Floor, and Hero Levels.
                                </div>
                            </div>

                            <button
                                onClick={onAscend}
                                disabled={towerFloor < 100}
                                className={`px-12 py-4 rounded-xl font-black text-xl transition-all shadow-2xl 
                                    ${towerFloor >= 100
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-110 text-white shadow-purple-500/50'
                                        : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'}`}
                            >
                                {towerFloor >= 100 ? 'ASCEND TO THE VOID' : 'LOCKED (Reach Floor 100)'}
                            </button>
                        </div>
                    ) : (
                        // FALLBACK FOR OTHER VIEWS
                        <div className="p-8">...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

