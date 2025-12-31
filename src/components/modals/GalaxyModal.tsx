import React, { useState } from 'react';
import { X, Globe, Star, Rocket, Shield, Map as MapIcon, AlertTriangle } from 'lucide-react';
import type { GalaxySector, Spaceship } from '../../engine/types';

interface GalaxyModalProps {
    isOpen: boolean;
    onClose: () => void;
    galaxy: GalaxySector[];
    onConquer: (id: string) => void;
    partyPower: number;
    starlightUpgrades: Record<string, number>;
    spaceship: Spaceship;
    onUpgradeShip: (part: 'hull' | 'engine' | 'scanner') => void;
}

export const GalaxyModal: React.FC<GalaxyModalProps> = ({ isOpen, onClose, galaxy, onConquer, partyPower, starlightUpgrades, spaceship, onUpgradeShip }) => {
    const [selectedSector, setSelectedSector] = useState<GalaxySector | null>(null);
    const [view, setView] = useState<'map' | 'hangar'>('map');

    const scannerLevel = starlightUpgrades['galaxy_scanner'] || 0;
    const getDifficulty = (base: number) => scannerLevel > 0 ? Math.floor(base * (1 - (scannerLevel * 0.1))) : base;

    if (!isOpen || !galaxy) return null;

    // Map coordinates to percentage (Assume range -100 to 100)
    const mapX = (x: number) => 50 + (x / 2);
    const mapY = (y: number) => 50 + (y / 2);

    const getDistance = (s: GalaxySector) => Math.sqrt(s.x * s.x + s.y * s.y);
    const maxRange = spaceship.engine * 25;

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
                                    const hazardSafe = (sector.hazardLevel || 0) <= spaceship.hull;

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
                                                <span className={`${spaceship.hull >= selectedSector.hazardLevel ? 'text-green-400' : 'text-orange-500 font-bold'}`}>
                                                    Hazard: Lv {selectedSector.hazardLevel} {spaceship.hull < selectedSector.hazardLevel && '(HULL TOO WEAK)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {!selectedSector.isOwned ? (
                                        <button
                                            onClick={() => onConquer(selectedSector.id)}
                                            disabled={
                                                getDistance(selectedSector) > maxRange ||
                                                (selectedSector.hazardLevel || 0) > spaceship.hull ||
                                                partyPower < getDifficulty(selectedSector.difficulty) * 0.5
                                            }
                                            className={`px-6 py-3 rounded font-bold transition-all ${getDistance(selectedSector) > maxRange ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                                                (selectedSector.hazardLevel || 0) > spaceship.hull ? 'bg-orange-900/50 text-orange-500 cursor-not-allowed border border-orange-500' :
                                                    partyPower >= getDifficulty(selectedSector.difficulty)
                                                        ? 'bg-gradient-to-r from-green-600 to-green-500 hover:scale-105 text-white shadow-[0_0_15px_rgba(0,255,0,0.5)]'
                                                        : 'bg-red-900/50 text-red-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {getDistance(selectedSector) > maxRange ? 'OUT OF RANGE' :
                                                (selectedSector.hazardLevel || 0) > spaceship.hull ? 'HAZARD LETHAL' :
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
                    ) : (
                        // HANGAR VIEW
                        <div className="p-8 grid grid-cols-2 gap-8 h-full bg-slate-900">
                            {/* Visual Preview */}
                            <div className="bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                                <div className="text-[10rem]">🚀</div>
                            </div>
                            {/* Upgrades */}
                            <div className="flex flex-col gap-6">
                                <h3 className="text-2xl font-bold text-white border-b border-gray-700 pb-2">Ship Upgrades</h3>

                                {/* Engine */}
                                <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700">
                                    <div>
                                        <h4 className="text-lg font-bold text-cyan-400 flex items-center gap-2"><Rocket size={18} /> Hyperdrive Engine</h4>
                                        <p className="text-gray-400 text-sm">Level {spaceship.engine} → {spaceship.engine + 1}</p>
                                        <p className="text-xs text-gray-500">Increases Travel Range (+25 ly)</p>
                                    </div>
                                    <button
                                        onClick={() => onUpgradeShip('engine')}
                                        className="px-4 py-2 bg-blue-600 rounded text-white font-bold hover:bg-blue-500 transition-colors"
                                    >
                                        Upgrade
                                        <div className="text-[10px] font-normal opacity-80">
                                            {Math.floor(1000 * Math.pow(1.5, spaceship.engine))} G + {Math.floor(10 * Math.pow(1.5, spaceship.engine))} M
                                        </div>
                                    </button>
                                </div>

                                {/* Hull */}
                                <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700">
                                    <div>
                                        <h4 className="text-lg font-bold text-orange-400 flex items-center gap-2"><Shield size={18} /> Void Hull</h4>
                                        <p className="text-gray-400 text-sm">Level {spaceship.hull} → {spaceship.hull + 1}</p>
                                        <p className="text-xs text-gray-500">Resists Planetary Hazards</p>
                                    </div>
                                    <button
                                        onClick={() => onUpgradeShip('hull')}
                                        className="px-4 py-2 bg-orange-600 rounded text-white font-bold hover:bg-orange-500 transition-colors"
                                    >
                                        Upgrade
                                        <div className="text-[10px] font-normal opacity-80">
                                            {Math.floor(1000 * Math.pow(1.5, spaceship.hull))} G + {Math.floor(10 * Math.pow(1.5, spaceship.hull))} M
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

