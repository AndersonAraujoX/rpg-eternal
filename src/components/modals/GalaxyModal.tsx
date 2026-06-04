import React, { useState } from 'react';
import { X, Globe, Star, Rocket, Zap, Fuel, Shield } from 'lucide-react';
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
    onStartPlanetaryRun: (classType: 'warrior' | 'mage' | 'ranger', sector: GalaxySector) => void;
}

export const GalaxyModal: React.FC<GalaxyModalProps> = ({
    isOpen, onClose, galaxy, onConquer, partyPower, starlightUpgrades, spaceship, onUpgradeShip,
    towerFloor, voidAscensions, onAscend, onStartPlanetaryRun
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

    const canConquer = (sector: GalaxySector) => {
        if (sector.isOwned) return false;
        if (getDistance(sector) > maxRange) return false;
        if (getHazardValue(sector.hazardLevel) > spaceship.parts.shields) return false;
        if (spaceship.fuel < 5) return false;
        if (spaceship.hull <= 0) return false;
        return true;
    };

    const getConquerLabel = (sector: GalaxySector) => {
        if (getDistance(sector) > maxRange) return 'FORA DE ALCANCE';
        if (getHazardValue(sector.hazardLevel) > spaceship.parts.shields) return 'PERIGO LETAL';
        if (spaceship.fuel < 5) return 'SEM COMBUSTÍVEL';
        if (spaceship.hull <= 0) return 'CASCO DESTRUÍDO';
        return 'CONQUISTAR';
    };

    const partNames: Record<string, string> = {
        shields: 'Escudos',
        engine: 'Motor',
        scanners: 'Scanners'
    };

    const partDescriptions: Record<string, string> = {
        shields: 'Aumenta resistência a zonas perigosas',
        engine: 'Aumenta o alcance de salto (+25 ly/nível)',
        scanners: 'Reduz dificuldade aparente dos setores (-10%/nível)'
    };

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
                            <Globe size={18} /> Mapa Estelar
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
                            <Zap size={18} /> Ascensão do Vazio
                        </button>
                    </div>

                    <div className="text-sm font-mono text-gray-400 flex gap-4">
                        <span title="Combustível">⛽ <span className={`${spaceship.fuel < 10 ? 'text-red-400' : 'text-cyan-400'}`}>{spaceship.fuel}/{spaceship.maxFuel}</span></span>
                        <span title="Casco">🛡️ <span className={`${spaceship.hull < 20 ? 'text-red-400' : 'text-green-400'}`}>{spaceship.hull}/{spaceship.maxHull}</span></span>
                        <span>Alcance: <span className="text-cyan-400">{maxRange} ly</span></span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 relative overflow-hidden">
                    {view === 'map' ? (
                        <div className="w-full h-full relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 overflow-auto cursor-grab active:cursor-grabbing">
                            <div className="absolute inset-0 bg-black/20"></div>
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
                                                            'bg-yellow-400 text-yellow-400 hover:scale-150'
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
                                                {selectedSector.isOwned ? 'CONQUISTADO' : 'HOSTIL'}
                                            </span>
                                            <span className="text-cyan-300">
                                                Dist: {Math.floor(getDistance(selectedSector))} ly
                                            </span>
                                            <span className="text-gray-400">
                                                Nível: {selectedSector.level}
                                            </span>
                                            {selectedSector.hazardLevel && (
                                                <span className={`${spaceship.parts.shields >= getHazardValue(selectedSector.hazardLevel) ? 'text-green-400' : 'text-orange-500 font-bold'}`}>
                                                    Perigo: {selectedSector.hazardLevel.toUpperCase()} {spaceship.parts.shields < getHazardValue(selectedSector.hazardLevel) && '(ESCUDOS FRACOS)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {!selectedSector.isOwned ? (
                                        <button
                                            onClick={() => { onConquer(selectedSector.id); /* Update local state to reflect conquest */ setSelectedSector(prev => prev ? { ...prev } : null); }}
                                            disabled={!canConquer(selectedSector)}
                                            className={`px-6 py-3 rounded font-bold transition-all whitespace-nowrap ${canConquer(selectedSector)
                                                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:scale-105 text-white shadow-[0_0_15px_rgba(0,255,0,0.5)]'
                                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {getConquerLabel(selectedSector)}
                                        </button>
                                    ) : (
                                         <div className="flex flex-col items-end gap-1.5 bg-gray-900/60 p-2 rounded border border-gray-700/50">
                                             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-right w-full">
                                                 🌀 Explorar Planeta (Roguelike)
                                             </div>
                                             <div className="flex gap-1.5">
                                                 <button
                                                     onClick={() => onStartPlanetaryRun('warrior', selectedSector)}
                                                     className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold rounded shadow transition-all flex items-center gap-1"
                                                     title="Iniciar expedição como Guerreiro"
                                                 >
                                                     ⚔️ Guerreiro
                                                 </button>
                                                 <button
                                                     onClick={() => onStartPlanetaryRun('mage', selectedSector)}
                                                     className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold rounded shadow transition-all flex items-center gap-1"
                                                     title="Iniciar expedição como Mago"
                                                 >
                                                     🪄 Mago
                                                 </button>
                                                 <button
                                                     onClick={() => onStartPlanetaryRun('ranger', selectedSector)}
                                                     className="px-3 py-1.5 bg-green-700 hover:bg-green-600 active:scale-95 text-white text-xs font-bold rounded shadow transition-all flex items-center gap-1"
                                                     title="Iniciar expedição como Arqueiro"
                                                 >
                                                     🏹 Arqueiro
                                                 </button>
                                             </div>
                                         </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : view === 'hangar' ? (
                        <div className="p-8 h-full bg-slate-900 overflow-y-auto">
                            <h3 className="text-2xl font-bold text-orange-400 mb-6 flex items-center gap-2">
                                <Rocket /> Hangar da Nave
                            </h3>

                            {/* Ship Status */}
                            <div className="bg-gray-800 border border-gray-700 p-4 rounded-xl mb-6 flex gap-6">
                                <div className="flex-1">
                                    <div className="text-sm text-gray-400 mb-1">Combustível</div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div className="bg-cyan-500 h-4 rounded-full transition-all" style={{ width: `${(spaceship.fuel / spaceship.maxFuel) * 100}%` }}></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{spaceship.fuel}/{spaceship.maxFuel} (regenera +5/5s)</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-400 mb-1">Casco</div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div className={`h-4 rounded-full transition-all ${spaceship.hull > 50 ? 'bg-green-500' : spaceship.hull > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(spaceship.hull / spaceship.maxHull) * 100}%` }}></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{spaceship.hull}/{spaceship.maxHull} (regenera +2/5s)</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(['shields', 'engine', 'scanners'] as const).map(part => (
                                    <div key={part} className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl">
                                        <h4 className="text-xl font-bold capitalize mb-1">{partNames[part]}</h4>
                                        <p className="text-xs text-gray-500 mb-3">{partDescriptions[part]}</p>
                                        <div className="text-sm text-gray-400 mb-4">
                                            Nível Atual: <span className="text-orange-400 font-bold">{spaceship.parts[part]}</span>
                                        </div>
                                        <button
                                            onClick={() => onUpgradeShip(part)}
                                            className="w-full py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded shadow-lg transition-all"
                                        >
                                            MELHORAR ({((spaceship.parts[part] + 1) * 5000).toLocaleString()} ouro)
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : view === 'void' ? (
                        <div className="p-12 flex flex-col items-center justify-center h-full bg-slate-950 text-center">
                            <div className="text-8xl mb-8 animate-bounce">🌌</div>
                            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">Ascensão do Vazio</h3>
                            <p className="text-gray-400 max-w-lg mb-8">
                                Reinicie seu progresso atual para transcender o plano físico.
                                Ganhe <span className="text-purple-400 font-bold">Poder do Vazio</span> permanente e desbloqueie segredos cósmicos.
                            </p>

                            <div className="bg-gray-900 border border-purple-500/30 p-6 rounded-xl mb-8 w-full max-w-md">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Nível do Vazio Atual:</span>
                                    <span className="text-purple-400 font-mono font-bold">{voidAscensions}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Andar da Torre Atual:</span>
                                    <span className={`${towerFloor >= 100 ? 'text-green-400' : 'text-red-400'} font-mono`}>{towerFloor}</span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-400">Andar Necessário:</span>
                                    <span className={`${towerFloor >= 100 ? 'text-green-400' : 'text-red-400'} font-mono`}>100</span>
                                </div>
                                <div className="text-sm text-gray-500 italic border-t border-gray-800 pt-3">
                                    A ascensão irá reiniciar: Ouro, Almas, Itens, Andar da Torre e Níveis dos Heróis.
                                    <br/><span className="text-purple-300 font-bold mt-1 block">Ganho: +1 Divindade, +1 Ascensão do Vazio</span>
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
                                {towerFloor >= 100 ? 'ASCENDER AO VAZIO' : `BLOQUEADO (Alcance Andar 100 — Atual: ${towerFloor})`}
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

