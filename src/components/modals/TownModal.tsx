import React, { useState } from 'react';
import { Home, Hammer, Info, Lock, ArrowLeft, Trash2, Sparkles } from 'lucide-react';
import type { Building } from '../../engine/types';
import { formatNumber } from '../../utils';
import { FEATURES_LIST } from '../../engine/features';
import { IsometricTownGrid } from '../IsometricTownGrid';

interface TownModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildings: Building[];
    gold: number;
    upgradeBuilding: (id: string) => void;
    tower?: import('../../engine/types').Tower;
    openIndustry?: () => void;
    openForge?: () => void;
    openFishing?: () => void;
    openAlchemy?: () => void;
    openExpeditions?: () => void;
    openGarden?: () => void;
    // New props for pantheon:
    heroes: import('../../engine/types').Hero[];
    monuments: (string | null)[];
    enshrineHero: (slotIndex: number, heroId: string | null) => void;
    // Deity system
    patronDeity: string | null;
    deityLevel: number;
    deityFavor: number;
    deityEnergy: number;
    pledgeDeity: (deityId: string | null) => void;
    offerToDeity: (offeringType: 'souls' | 'divinity') => void;
    souls: number;
    divinity: number;
    openRunes?: () => void;
    invokeWeather: (weather: import('../../engine/weather').WeatherType) => void;
    resources: import('../../engine/types').Resources;
    bossLevel?: number;
    voidAscensions?: number;
    openBackrooms?: () => void;
    openGuild?: () => void;
    openPetSpace?: () => void;
    setBuildings?: React.Dispatch<React.SetStateAction<import('../../engine/types').Building[]>>;
}

export const TownModal: React.FC<TownModalProps> = ({
    isOpen,
    onClose,
    buildings,
    gold,
    upgradeBuilding,
    tower,
    openIndustry,
    openForge,
    openFishing,
    openAlchemy,
    openExpeditions,
    openGarden,
    heroes,
    monuments,
    enshrineHero,
    patronDeity,
    deityLevel,
    deityFavor,
    deityEnergy,
    pledgeDeity,
    offerToDeity,
    souls,
    divinity,
    openRunes,
    invokeWeather,
    resources,
    bossLevel = 0,
    voidAscensions = 0,
    openBackrooms,
    openGuild,
    openPetSpace,
    setBuildings
}) => {
    const [viewMode, setViewMode] = useState<'overview' | 'construction' | 'pantheon' | 'deities'>('overview');
    const [activeSlotToSelect, setActiveSlotToSelect] = useState<number | null>(null);

    // Layout States
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
    const [clickedBuildingId, setClickedBuildingId] = useState<string | null>(null);
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    const placeBuilding = (buildingId: string, x: number, y: number) => {
        if (!setBuildings) return;
        setBuildings(prev => prev.map(b => {
            if (b.id === buildingId) {
                return { ...b, x, y, placed: true };
            }
            return b;
        }));
        setSelectedBuildingId(null);
    };

    const removeBuilding = (buildingId: string) => {
        if (!setBuildings) return;
        setBuildings(prev => prev.map(b => {
            if (b.id === buildingId) {
                return { ...b, x: undefined, y: undefined, placed: false };
            }
            return b;
        }));
        setClickedBuildingId(null);
    };

    const getBuildingFeatureAction = (id: string) => {
        if (id === 'industry' && openIndustry) return () => { openIndustry(); onClose(); };
        if (id === 'forge_workshop' && openForge) return () => { openForge(); onClose(); };
        if (id === 'fishing_dock' && openFishing) return () => { openFishing(); onClose(); };
        if (id === 'alchemy_lab' && openAlchemy) return () => { openAlchemy(); onClose(); };
        if (id === 'expedition_post' && openExpeditions) return () => { openExpeditions(); onClose(); };
        if (id === 'mystic_garden' && openGarden) return () => { openGarden(); onClose(); };
        if (id === 'rune_sanctuary' && openRunes) return () => { openRunes(); onClose(); };
        if (id === 'altar_deities') return () => setViewMode('deities');
        if (id === 'pantheon') return () => setViewMode('pantheon');
        if (id === 'backrooms_manager' && openBackrooms) return () => { openBackrooms(); onClose(); };
        if (id === 'guild_hall' && openGuild) return () => { openGuild(); onClose(); };
        if (id === 'breeding_center' && openPetSpace) return () => { openPetSpace(); onClose(); };
        return null;
    };

    if (!isOpen) return null;

    const visibleBuildings = buildings.filter(b => {
        if (b.id === 'celestial_observatory') {
            return (tower?.maxFloor || 0) >= 100;
        }
        if (b.id === 'industry') {
            return (tower?.maxFloor || 0) >= 50;
        }
        return true;
    });

    const getMonumentBonusDescription = (heroClass: string) => {
        const cls = heroClass;
        if (['Warrior', 'Paladin', 'Templar'].includes(cls)) return { type: 'Defesa Global', val: '+10%', color: 'text-yellow-400' };
        if (['Mage', 'Sorcerer', 'Sage', 'Illusionist'].includes(cls)) return { type: 'Ataque Global', val: '+10%', color: 'text-red-400' };
        if (['Rogue', 'Ninja', 'Assassin', 'Ranger', 'Dragoon'].includes(cls)) return { type: 'Velocidade Global', val: '+10%', color: 'text-cyan-400' };
        if (['Warlock', 'Necromancer', 'Druid'].includes(cls)) return { type: 'Vampirismo Global', val: '+10%', color: 'text-purple-400' };
        if (['Healer', 'Bard', 'Monk', 'Viking'].includes(cls)) return { type: 'HP Máximo Global', val: '+10%', color: 'text-green-400' };
        if (['Blacksmith', 'Miner', 'Fisherman', 'Pirate', 'Engineer'].includes(cls)) return { type: 'Ouro Ganho', val: '+10%', color: 'text-amber-400' };
        return { type: 'Atributos Variados', val: '+10%', color: 'text-stone-400' };
    };

    const activeBonuses = {
        gold: 0,
        attack: 0,
        defense: 0,
        speed: 0,
        maxHp: 0,
        lifesteal: 0,
    };
    monuments.forEach(heroId => {
        if (!heroId) return;
        const hero = heroes.find(h => h.id === heroId);
        if (!hero || !hero.isAwakened) return;
        const cls = hero.class;
        if (['Warrior', 'Paladin', 'Templar'].includes(cls)) activeBonuses.defense += 10;
        else if (['Mage', 'Sorcerer', 'Sage', 'Illusionist'].includes(cls)) activeBonuses.attack += 10;
        else if (['Rogue', 'Ninja', 'Assassin', 'Ranger', 'Dragoon'].includes(cls)) activeBonuses.speed += 10;
        else if (['Warlock', 'Necromancer', 'Druid'].includes(cls)) activeBonuses.lifesteal += 10;
        else if (['Healer', 'Bard', 'Monk', 'Viking'].includes(cls)) activeBonuses.maxHp += 10;
        else if (['Blacksmith', 'Miner', 'Fisherman', 'Pirate', 'Engineer'].includes(cls)) activeBonuses.gold += 10;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-500">
            <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-black border-2 border-amber-600/30 w-full max-w-5xl p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative max-h-[90vh] flex flex-col overflow-hidden">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[80px] -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 blur-[80px] -z-10" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-stone-500 hover:text-white hover:rotate-90 transition-all duration-300 z-20"
                >
                    <svg xmlns="http://www.w3.org/2050/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Section */}
                <div className="text-center mb-10 relative">
                    {viewMode !== 'overview' && (
                        <button
                            onClick={() => setViewMode('overview')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors"
                        >
                            <ArrowLeft size={20} /> Voltar
                        </button>
                    )}
                    <h2 className="text-amber-500 text-4xl font-black tracking-tighter mb-2 flex items-center justify-center gap-4">
                        <Home size={36} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                        {viewMode === 'overview' ? 'PREFEITURA' : viewMode === 'construction' ? 'MODO CONSTRUÇÃO' : viewMode === 'pantheon' ? 'PANTEÃO DA ETERNIDADE' : 'ALTAR DOS DEUSES'}
                    </h2>
                    <p className="text-stone-400 text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
                        <Info size={14} /> Expanda seu domínio para desbloquear novas fronteiras
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="bg-stone-955/80 px-6 py-2 rounded-full border border-amber-900/50 text-amber-100 flex items-center gap-3">
                            <span className="text-xs text-stone-500">Tesouro:</span>
                            <span className="font-mono font-bold text-amber-500">{formatNumber(gold)} Ouro</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Tab Bar - Only visible if Town Hall is built */}
                {buildings.find(b => b.id === 'town_hall' && b.level > 0) && (
                    <div className="flex justify-center gap-3 mb-6 bg-stone-900/40 p-1.5 rounded-xl border border-stone-850/60 max-w-2xl mx-auto z-20">
                        <button
                            onClick={() => { setViewMode('overview'); setClickedBuildingId(null); setSelectedBuildingId(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${viewMode === 'overview' ? 'bg-amber-600 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'}`}
                        >
                            🗺️ Mapa da Vila
                        </button>
                        <button
                            onClick={() => { setViewMode('construction'); setClickedBuildingId(null); setSelectedBuildingId(null); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${viewMode === 'construction' ? 'bg-amber-600 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'}`}
                        >
                            🔨 Construção
                        </button>
                        {buildings.find(b => b.id === 'pantheon' && b.level > 0) && (
                            <button
                                onClick={() => { setViewMode('pantheon'); setClickedBuildingId(null); setSelectedBuildingId(null); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${viewMode === 'pantheon' ? 'bg-amber-600 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'}`}
                            >
                                🏛️ Panteão
                            </button>
                        )}
                        {buildings.find(b => b.id === 'altar_deities' && b.level > 0) && (
                            <button
                                onClick={() => { setViewMode('deities'); setClickedBuildingId(null); setSelectedBuildingId(null); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${viewMode === 'deities' ? 'bg-amber-600 text-stone-950 font-black shadow-md' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'}`}
                            >
                                ⛪ Altar dos Deuses
                            </button>
                        )}
                    </div>
                )}

                {/* Content Section */}
                {viewMode === 'overview' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {(() => {
                            const townHall = buildings.find(b => b.id === 'town_hall');
                            if (!townHall) return null;

                            if (townHall.level === 0) {
                                // If Town Hall is not constructed, show the locked / initial build screen
                                const canAfford = gold >= townHall.cost;
                                return (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="max-w-md w-full relative group flex flex-col bg-stone-900/80 border-2 border-amber-600/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                            <div className="flex flex-col items-center text-center mb-8">
                                                <div className="text-7xl p-6 rounded-2xl shadow-2xl border bg-amber-900/40 border-amber-500/50 mb-6 relative">
                                                    {townHall.emoji}
                                                </div>
                                                <h3 className="text-3xl font-black text-white mb-2">{townHall.name}</h3>
                                                <p className="text-stone-400 text-sm leading-relaxed max-w-sm">{townHall.description}</p>
                                            </div>
                                            <button
                                                onClick={() => upgradeBuilding(townHall.id)}
                                                disabled={!canAfford}
                                                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xl flex items-center justify-center gap-4 transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)]
                                                    ${canAfford
                                                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 shadow-amber-900/50 scale-105 hover:scale-[1.07]'
                                                        : 'bg-stone-900/80 text-stone-600 cursor-not-allowed border border-stone-850'
                                                    }`}
                                            >
                                                <Hammer size={28} className={canAfford ? 'animate-bounce' : ''} />
                                                CONSTRUIR ({formatNumber(townHall.cost)})
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            // If Town Hall is constructed, show the town grid map
                            const unplacedBuildings = buildings.filter(b => b.level > 0 && !b.placed);
                            const clickedBuilding = clickedBuildingId ? buildings.find(b => b.id === clickedBuildingId) : null;
                            const isSelected = selectedBuildingId !== null;

                            return (
                                <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                                    {/* Left Area: Grid Map */}
                                    <div className="flex-1 bg-stone-950/40 p-6 rounded-2xl border border-stone-900/60 shadow-inner flex flex-col items-center justify-center relative min-h-[300px] select-none">
                                        <div className="absolute top-3 left-4 text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono">
                                            🗺️ Grid de Construção Isométrica
                                        </div>

                                        {isSelected && (
                                            <div className="absolute top-8 text-center text-xs text-green-400 font-bold animate-pulse z-20 bg-black/85 px-4 py-1.5 rounded-full border border-green-500/30">
                                                Colocando: {buildings.find(b => b.id === selectedBuildingId)?.name}. Clique em um lote do grid!
                                            </div>
                                        )}

                                        <div className="w-full relative mt-4 flex justify-center">
                                            <IsometricTownGrid
                                                buildings={buildings}
                                                gold={gold}
                                                selectedBuildingId={selectedBuildingId}
                                                placeBuilding={placeBuilding}
                                                onTileClick={(x, y) => {
                                                    setViewMode('construction');
                                                }}
                                                onBuildingClick={(buildingId) => {
                                                    setClickedBuildingId(buildingId);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Area: Control Panel Sidebar */}
                                    <div className="w-full md:w-80 flex-shrink-0 bg-stone-900/60 border border-stone-850 p-5 rounded-2xl flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
                                        {clickedBuilding ? (
                                            /* Details of a clicked building */
                                            <div className="flex flex-col h-full justify-between gap-4">
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="text-5xl p-3 bg-stone-950 rounded-xl border border-stone-800">{clickedBuilding.emoji}</div>
                                                        <div className="text-left">
                                                            <h4 className="text-lg font-black text-white">{clickedBuilding.name}</h4>
                                                            <span className="inline-block bg-amber-500/10 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-black border border-amber-500/20">
                                                                NÍVEL {clickedBuilding.level}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-stone-400 text-left leading-relaxed">{clickedBuilding.description}</p>

                                                    <div className="bg-black/40 p-3 rounded-xl border border-stone-850 space-y-2 text-left text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-stone-500">Efeito Atual:</span>
                                                            <span className="text-green-400 font-bold">{(clickedBuilding.effectValue * clickedBuilding.level).toLocaleString()} ({clickedBuilding.bonus})</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-stone-500">Localização:</span>
                                                            <span className="text-stone-300 font-mono">X: {clickedBuilding.x}, Y: {clickedBuilding.y}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 mt-4">
                                                    {/* Access direct building feature if map link is available */}
                                                    {(() => {
                                                        const btnAction = getBuildingFeatureAction(clickedBuilding.id);
                                                        if (btnAction) {
                                                            return (
                                                                <button
                                                                    onClick={btnAction}
                                                                    className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 shadow-md shadow-amber-900/10 active:scale-95 transition-all"
                                                                >
                                                                    Acessar {clickedBuilding.name}
                                                                </button>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    {/* Quick Upgrade Building */}
                                                    {(() => {
                                                        const isMax = clickedBuilding.level >= clickedBuilding.maxLevel;
                                                        const canAfford = gold >= clickedBuilding.cost;
                                                        return (
                                                            <button
                                                                onClick={() => { upgradeBuilding(clickedBuilding.id); }}
                                                                disabled={isMax || !canAfford}
                                                                className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center transition-all
                                                                    ${isMax 
                                                                        ? 'bg-stone-850 text-stone-500 cursor-not-allowed border border-stone-700'
                                                                        : canAfford
                                                                            ? 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-900/50 shadow-md active:scale-95'
                                                                            : 'bg-stone-950/50 text-stone-600 cursor-not-allowed border border-stone-900'
                                                                    }`}
                                                            >
                                                                {isMax ? 'Nível Máximo' : `Melhorar (${formatNumber(clickedBuilding.cost)} Ouro)`}
                                                            </button>
                                                        );
                                                    })()}

                                                    {/* Reposition Building */}
                                                    <button
                                                        onClick={() => removeBuilding(clickedBuilding.id)}
                                                        className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center bg-stone-950/60 border border-stone-850 text-stone-400 hover:text-stone-200 transition-colors"
                                                    >
                                                        Mover Prédio
                                                    </button>

                                                    <button
                                                        onClick={() => setClickedBuildingId(null)}
                                                        className="w-full py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center text-stone-550 hover:text-stone-400 transition-colors"
                                                    >
                                                        Voltar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : selectedBuildingId ? (
                                            /* Active placement mode instructions */
                                            <div className="flex flex-col h-full justify-between text-left">
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-black text-green-400 uppercase tracking-widest">⚙️ Modo Posicionamento</h4>
                                                    <p className="text-xs text-stone-400 leading-relaxed">
                                                        Você selecionou **{buildings.find(b => b.id === selectedBuildingId)?.name}** para colocar no mapa.
                                                    </p>
                                                    <div className="bg-green-950/20 p-4 rounded-xl border border-green-500/30 text-xs text-green-300 leading-relaxed">
                                                        💡 Clique em qualquer slot vazio do grid à esquerda para fixar a construção nessa coordenada.
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedBuildingId(null)}
                                                    className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center bg-red-955/20 border border-red-900/40 text-red-400 hover:bg-red-950/30 transition-all mt-6"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            /* Sidebar showing unplaced buildings or general stats */
                                            <div className="flex flex-col h-full justify-between text-left gap-4">
                                                <div className="flex-1 flex flex-col min-h-0">
                                                    <h4 className="text-xs font-bold uppercase text-stone-400 border-b border-stone-800 pb-2 mb-3">Prédios por Posicionar</h4>
                                                    {unplacedBuildings.length === 0 ? (
                                                        <div className="text-xs text-stone-555 italic py-6 text-center bg-black/20 rounded-xl border border-stone-900">
                                                            Nenhum prédio aguardando posicionamento. Tudo em ordem na Vila!
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                                                            {unplacedBuildings.map(b => (
                                                                <div key={b.id} className="bg-black/35 border border-stone-850 p-2.5 rounded-xl flex items-center justify-between gap-3 group hover:border-amber-600/30 transition-colors">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-2xl">{b.emoji}</span>
                                                                        <div>
                                                                            <div className="font-bold text-xs text-stone-200 group-hover:text-amber-400 transition-colors">{b.name}</div>
                                                                            <span className="text-[9px] text-stone-500 font-semibold">Lvl {b.level}</span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setSelectedBuildingId(b.id)}
                                                                        className="bg-amber-650 hover:bg-amber-600 text-stone-950 font-black px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all"
                                                                    >
                                                                        Colocar
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-850/60 text-xs">
                                                    <div className="font-bold text-amber-500 uppercase tracking-widest text-[9px] mb-2 font-mono">📊 Métricas da Vila</div>
                                                    <div className="space-y-1.5 text-[11px] text-stone-400">
                                                        <div className="flex justify-between">
                                                            <span>Prédios Totais:</span>
                                                            <span className="text-stone-200 font-bold">{buildings.filter(b => b.level > 0).length} / {buildings.length}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Posicionados:</span>
                                                            <span className="text-stone-200 font-bold">{buildings.filter(b => b.placed).length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {viewMode === 'construction' && (
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                            {visibleBuildings.filter(b => b.id !== 'town_hall').map(building => {
                                const isMax = building.level >= building.maxLevel;
                                const canAfford = gold >= building.cost;
                                const isSpecial = building.id === 'guild_hall';

                                const featureDef = FEATURES_LIST.find(f => f.id === building.id);
                                const isBuildingUnlocked = !featureDef || featureDef.checkUnlocked({
                                    bossLevel,
                                    highestFloor: tower?.maxFloor || 1,
                                    voidAscensions,
                                    buildings,
                                    outerSpaceUnlocked: false
                                });

                                return (
                                    <div
                                        key={building.id}
                                        className={`relative group flex flex-col bg-stone-900/40 border rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] 
                                        ${!isBuildingUnlocked
                                            ? 'border-red-900/30 bg-red-955/5 opacity-55 shadow-none'
                                            : isSpecial && building.level === 0
                                                ? 'border-amber-500/50 bg-amber-955/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                                                : 'border-stone-800 hover:border-amber-600/50 shadow-xl'
                                        }`}
                                    >
                                        {/* Building Header */}
                                        <div className="flex gap-5 items-start mb-6">
                                            <div className={`text-5xl p-4 rounded-xl shadow-2xl border ${isSpecial && building.level === 0 ? 'bg-amber-900/40 border-amber-500/50 animate-pulse' : 'bg-stone-800 border-stone-700'}`}>
                                                {building.emoji}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{building.name}</h3>
                                                    <span className="text-[10px] bg-stone-950 px-2 py-1 rounded-full border border-stone-800 text-stone-400 font-mono">
                                                        LVL {building.level} / {building.maxLevel}
                                                    </span>
                                                </div>
                                                <p className="text-stone-400 text-sm leading-relaxed">{building.description}</p>
                                            </div>
                                        </div>

                                        {/* Stats Panel */}
                                        <div className="mt-auto">
                                            <div className="bg-black/40 rounded-xl p-4 mb-5 border border-white/5 space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-stone-500">Efeito atual</span>
                                                    <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">
                                                        {building.level > 0 ? (building.effectValue * building.level).toLocaleString() : '---'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-amber-500 h-full transition-all duration-1000"
                                                        style={{ width: `${(building.level / building.maxLevel) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="text-[10px] text-stone-500 italic mt-1 flex justify-between">
                                                    <span>{building.bonus}</span>
                                                    {!isBuildingUnlocked && featureDef && (
                                                        <span className="text-red-400 animate-pulse flex items-center gap-1 font-bold uppercase">
                                                            <Lock size={10} /> Requer: {featureDef.unlockRequirementText}
                                                        </span>
                                                    )}
                                                    {isSpecial && building.level === 0 && isBuildingUnlocked && <span className="text-amber-400 animate-pulse flex items-center gap-1 font-bold uppercase"><Lock size={10} /> Desbloqueio Crítico</span>}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {building.id === 'industry' && building.level > 0 && openIndustry && (
                                                <button onClick={openIndustry} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/50">
                                                    ACESSAR INDÚSTRIA
                                                </button>
                                            )}
                                            {building.id === 'forge_workshop' && building.level > 0 && openForge && (
                                                <button onClick={openForge} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-900/50">
                                                    <Hammer size={18} /> ACESSAR FORJA
                                                </button>
                                            )}
                                            {building.id === 'fishing_dock' && building.level > 0 && openFishing && (
                                                <button onClick={openFishing} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-cyan-900/50">
                                                    ACESSAR PESCA
                                                </button>
                                            )}
                                            {building.id === 'alchemy_lab' && building.level > 0 && openAlchemy && (
                                                <button onClick={openAlchemy} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-purple-900/50">
                                                    ACESSAR ALQUIMIA
                                                </button>
                                            )}
                                            {building.id === 'expedition_post' && building.level > 0 && openExpeditions && (
                                                <button onClick={openExpeditions} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/50">
                                                    ACESSAR EXPEDIÇÕES
                                                </button>
                                            )}
                                            {building.id === 'mystic_garden' && building.level > 0 && openGarden && (
                                                <button onClick={openGarden} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-900/50">
                                                    ACESSAR JARDIM
                                                </button>
                                            )}
                                            {building.id === 'rune_sanctuary' && building.level > 0 && openRunes && (
                                                <button onClick={openRunes} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-purple-900/50">
                                                    ACESSAR SANTUÁRIO
                                                </button>
                                            )}
                                            {building.id === 'altar_deities' && building.level > 0 && (
                                                <button onClick={() => setViewMode('deities')} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/50">
                                                    ACESSAR ALTAR DOS DEUSES
                                                </button>
                                            )}
                                            {building.id === 'pantheon' && building.level > 0 && (
                                                <button onClick={() => setViewMode('pantheon')} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/50">
                                                    ACESSAR PANTEÃO
                                                </button>
                                            )}
                                            {building.id === 'backrooms_manager' && building.level > 0 && openBackrooms && (
                                                <button onClick={openBackrooms} className="w-full mb-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-amber-900/30">
                                                    ACESSAR BACKROOMS
                                                </button>
                                            )}
                                            <button
                                                onClick={() => isBuildingUnlocked && upgradeBuilding(building.id)}
                                                disabled={isMax || !canAfford || !isBuildingUnlocked}
                                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl
                                                ${isMax
                                                        ? 'bg-stone-800 text-stone-500 cursor-default border border-stone-700'
                                                        : !isBuildingUnlocked
                                                            ? 'bg-red-955/20 text-red-500/60 border border-red-900/30 cursor-not-allowed'
                                                            : canAfford
                                                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/20 active:scale-95'
                                                                : 'bg-stone-900/50 text-stone-600 cursor-not-allowed border border-stone-800'
                                                    }`}
                                            >
                                                {isMax ? (
                                                    <>MÁXIMO ALCANÇADO</>
                                                ) : !isBuildingUnlocked ? (
                                                    <span className="flex items-center gap-1">
                                                        <Lock size={12} /> BLOQUEADO
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Hammer size={18} className={canAfford ? 'animate-bounce' : ''} />
                                                        {building.level === 0 ? 'CONSTRUIR' : 'MELHORAR'} ({formatNumber(building.cost)})
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {viewMode === 'pantheon' && (
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                        {/* Summary of Active Bonuses */}
                        <div className="bg-stone-950/80 border border-amber-900/30 rounded-xl p-4 mb-6 flex justify-around items-center gap-4 text-center">
                            <div>
                                <span className="block text-[10px] text-stone-500 uppercase tracking-widest font-bold">Ataque Global</span>
                                <span className="font-mono text-lg font-bold text-red-400">+{activeBonuses.attack}%</span>
                            </div>
                            <div className="h-8 w-px bg-stone-800/30" />
                            <div>
                                <span className="block text-[10px] text-stone-500 uppercase tracking-widest font-bold">Defesa Global</span>
                                <span className="font-mono text-lg font-bold text-yellow-400">+{activeBonuses.defense}%</span>
                            </div>
                            <div className="h-8 w-px bg-stone-800/30" />
                            <div>
                                <span className="block text-[10px] text-stone-500 uppercase tracking-widest font-bold">Velocidade Global</span>
                                <span className="font-mono text-lg font-bold text-cyan-400">+{activeBonuses.speed}%</span>
                            </div>
                            <div className="h-8 w-px bg-stone-800/30" />
                            <div>
                                <span className="block text-[10px] text-stone-500 uppercase tracking-widest font-bold">Vampirismo Global</span>
                                <span className="font-mono text-lg font-bold text-purple-400">+{activeBonuses.lifesteal}%</span>
                            </div>
                            <div className="h-8 w-px bg-stone-800/30" />
                            <div>
                                <span className="block text-[10px] text-stone-500 uppercase tracking-widest font-bold">HP Máximo Global</span>
                                <span className="font-mono text-lg font-bold text-green-400">+{activeBonuses.maxHp}%</span>
                            </div>
                            <div className="h-8 w-px bg-stone-800/30" />
                            <div>
                                <span className="block text-[10px] text-stone-500 uppercase tracking-widest font-bold">Ouro Ganho</span>
                                <span className="font-mono text-lg font-bold text-amber-400">+{activeBonuses.gold}%</span>
                            </div>
                        </div>

                        {/* Monument Slots Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-center justify-center py-4">
                            {[0, 1, 2].map(slotIndex => {
                                const heroId = monuments[slotIndex];
                                const hero = heroId ? heroes.find(h => h.id === heroId) : null;
                                const bonus = hero ? getMonumentBonusDescription(hero.class) : null;

                                return (
                                    <div
                                        key={slotIndex}
                                        className={`relative group flex flex-col items-center justify-center p-6 border rounded-2xl transition-all duration-300 min-h-[280px] h-full
                                            ${hero 
                                                ? 'border-amber-500/50 bg-stone-900/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-400' 
                                                : 'border-2 border-dashed border-stone-800 bg-stone-950/30 text-stone-500 hover:border-stone-700'
                                            }`}
                                    >
                                        <div className="absolute top-4 left-4 text-xs font-mono font-bold tracking-widest text-stone-500">
                                            MONUMENTO {slotIndex + 1}
                                        </div>

                                        {hero ? (
                                            <div className="flex flex-col items-center text-center w-full h-full justify-between pt-6">
                                                <div className="my-auto space-y-4">
                                                    {/* Glowing Avatar */}
                                                    <div className="relative inline-block">
                                                        <div className="text-6xl p-5 rounded-2xl bg-amber-900/30 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse select-none">
                                                            {hero.emoji}
                                                        </div>
                                                        <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
                                                    </div>

                                                    <div>
                                                        <h4 className="text-xl font-black text-white">{hero.name}</h4>
                                                        <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">{hero.class} Desperto</p>
                                                    </div>

                                                    <div className="inline-flex items-center gap-2 bg-black/50 px-4 py-2 rounded-xl border border-white/5">
                                                        <span className="text-xs text-stone-400 font-semibold">Bônus:</span>
                                                        <span className={`text-sm font-black ${bonus?.color}`}>{bonus?.val} {bonus?.type}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => enshrineHero(slotIndex, null)}
                                                    className="w-full mt-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 bg-stone-800 hover:bg-red-900/40 hover:text-red-400 hover:border-red-900/60 text-stone-400 border border-stone-700 transition-all duration-300"
                                                >
                                                    <Trash2 size={14} /> Remover Estátua
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setActiveSlotToSelect(slotIndex)}
                                                className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center hover:text-amber-500 transition-colors"
                                            >
                                                <div className="text-5xl mb-4 text-stone-700 group-hover:text-amber-500/60 group-hover:scale-110 transition-all duration-300 select-none">
                                                    🏛️
                                                </div>
                                                <span className="text-sm font-bold uppercase tracking-wider block">Altar Vazio</span>
                                                <span className="text-[10px] text-stone-600 mt-1 max-w-[150px] mx-auto block">Clique para consagrar um Herói Desperto</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Hero Selection Overlay Drawer */}
                        {activeSlotToSelect !== null && (
                            <div className="absolute inset-0 bg-stone-950/98 z-40 rounded-2xl flex flex-col p-8 border border-amber-900/30 backdrop-blur-md animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-amber-500">CONSAGRAR HERÓI (SLOT {activeSlotToSelect + 1})</h3>
                                        <p className="text-stone-400 text-xs mt-1">Selecione um herói Awakened para erguer sua estátua e ativar o bônus passivo global.</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveSlotToSelect(null)}
                                        className="text-stone-500 hover:text-white transition-colors uppercase font-bold text-sm bg-stone-900 px-4 py-2 rounded-xl border border-stone-850"
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                {/* List of Available Heroes */}
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {(() => {
                                        const availableHeroes = heroes.filter(h => h.isAwakened && !monuments.includes(h.id));
                                        if (availableHeroes.length === 0) {
                                            return (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-stone-900 rounded-xl bg-stone-955/50">
                                                    <span className="text-4xl mb-4 select-none">⚠️</span>
                                                    <h4 className="text-stone-400 font-bold mb-2">Nenhum Herói Desperto Disponível</h4>
                                                    <p className="text-stone-500 text-xs max-w-md">
                                                        Apenas heróis com status de **Despertado** (Awakened) que não estejam em outros slots podem ser consagrados. Desperte heróis que atingiram o Nível 100 no menu de detalhes do herói.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                                {availableHeroes.map(availableHero => {
                                                    const bonus = getMonumentBonusDescription(availableHero.class);
                                                    return (
                                                        <div
                                                            key={availableHero.id}
                                                            className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-amber-500/30 transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-3xl bg-stone-950 p-2 rounded-lg border border-stone-800 select-none">
                                                                    {availableHero.emoji}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-white group-hover:text-amber-400 transition-colors">
                                                                        {availableHero.name}
                                                                    </div>
                                                                    <div className="text-[10px] text-stone-550 font-semibold uppercase tracking-wider">
                                                                        {availableHero.class} (Lvl {availableHero.level})
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                <div className="text-right">
                                                                    <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-semibold">Bônus</span>
                                                                    <span className={`text-xs font-bold ${bonus.color}`}>{bonus.val} {bonus.type}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        enshrineHero(activeSlotToSelect, availableHero.id);
                                                                        setActiveSlotToSelect(null);
                                                                    }}
                                                                    className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all duration-300"
                                                                >
                                                                    Consagrar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {viewMode === 'deities' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* If no patron deity is chosen */}
                        {!patronDeity ? (
                            <div className="flex-1 flex flex-col justify-center overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black text-amber-500 mb-2">ESCOLHA SEU DEUS PADROEIRO</h3>
                                    <p className="text-stone-400 text-sm max-w-xl mx-auto">
                                        Preste juramento a uma das divindades eternas. Cada deus concede uma magia de combate automática devastadora e poderosos efeitos passivos que crescem à medida que você aumenta seu favor.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
                                    {/* Aurelius */}
                                    <div className="bg-gradient-to-b from-amber-950/40 via-stone-900 to-black border-2 border-amber-600/30 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 group">
                                        <div>
                                            <div className="text-5xl text-center mb-4 group-hover:scale-110 transition-transform duration-300">☀️</div>
                                            <h4 className="text-xl font-bold text-amber-400 text-center mb-2">Aurelius</h4>
                                            <p className="text-stone-500 text-center text-xs uppercase tracking-widest font-semibold mb-4">Pai do Sol</p>
                                            <div className="space-y-4 text-sm text-stone-300">
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <span className="font-bold text-yellow-400 text-xs uppercase block mb-1">Efeito Passivo</span>
                                                    <span>+15% Dano de Ataque Global (+5% / Lvl)</span>
                                                </div>
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <span className="font-bold text-yellow-400 text-xs uppercase block mb-1">Magia Ativa (100% Carga)</span>
                                                    <span className="text-xs text-stone-400">Meteoro Solar: Causa dano massivo de fogo baseado no ataque médio da equipe.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => pledgeDeity('aurelius')}
                                            className="w-full mt-6 py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-md shadow-amber-900/40"
                                        >
                                            Consagrar-se
                                        </button>
                                    </div>

                                    {/* Tenebris */}
                                    <div className="bg-gradient-to-b from-purple-950/40 via-stone-900 to-black border-2 border-purple-900/30 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300 group">
                                        <div>
                                            <div className="text-5xl text-center mb-4 group-hover:scale-110 transition-transform duration-300">🌌</div>
                                            <h4 className="text-xl font-bold text-purple-400 text-center mb-2">Tenebris</h4>
                                            <p className="text-stone-500 text-center text-xs uppercase tracking-widest font-semibold mb-4">Tecelão do Vazio</p>
                                            <div className="space-y-4 text-sm text-stone-300">
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <span className="font-bold text-purple-400 text-xs uppercase block mb-1">Efeito Passivo</span>
                                                    <span>+15% Roubo de Vida Global (+5% / Lvl)</span>
                                                </div>
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <span className="font-bold text-purple-400 text-xs uppercase block mb-1">Magia Ativa (100% Carga)</span>
                                                    <span className="text-xs text-stone-400">Barreira Entrópica: Cura e protege a equipe em combate em 30% do HP Máximo por nível.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => pledgeDeity('tenebris')}
                                            className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-md shadow-purple-950/50"
                                        >
                                            Consagrar-se
                                        </button>
                                    </div>

                                    {/* Gaya */}
                                    <div className="bg-gradient-to-b from-green-950/40 via-stone-900 to-black border-2 border-green-900/30 rounded-2xl p-6 flex flex-col justify-between hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 group">
                                        <div>
                                            <div className="text-5xl text-center mb-4 group-hover:scale-110 transition-transform duration-300">🌿</div>
                                            <h4 className="text-xl font-bold text-green-400 text-center mb-2">Gaya</h4>
                                            <p className="text-stone-500 text-center text-xs uppercase tracking-widest font-semibold mb-4">Matriarca da Terra</p>
                                            <div className="space-y-4 text-sm text-stone-300">
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <span className="font-bold text-green-400 text-xs uppercase block mb-1">Efeito Passivo</span>
                                                    <span>+15% HP Máximo, Ouro e Velocidade do Jardim (+5% / Lvl)</span>
                                                </div>
                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                    <span className="font-bold text-green-400 text-xs uppercase block mb-1">Magia Ativa (100% Carga)</span>
                                                    <span className="text-xs text-stone-400">Rejuvenescimento Telúrico: Cura completamente o HP e MP de toda a equipe em combate.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => pledgeDeity('gaya')}
                                            className="w-full mt-6 py-3 bg-green-600 hover:bg-green-500 text-stone-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-md shadow-green-900/40"
                                        >
                                            Consagrar-se
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* If a deity is chosen, show details and management screen */
                            <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-4xl mx-auto w-full min-h-0 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
                                {/* Left Side: Deity Info & Buffs */}
                                <div className="flex-1 bg-stone-900/60 border border-stone-850 p-6 rounded-2xl flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="text-6xl p-3 bg-stone-950 rounded-2xl border border-stone-800">
                                                {patronDeity === 'aurelius' ? '☀️' : patronDeity === 'tenebris' ? '🌌' : '🌿'}
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-2xl font-black text-white">
                                                    {patronDeity === 'aurelius' ? 'Aurelius' : patronDeity === 'tenebris' ? 'Tenebris' : 'Gaya'}
                                                </h3>
                                                <p className="text-stone-500 text-xs uppercase tracking-widest font-bold">
                                                    {patronDeity === 'aurelius' ? 'Pai do Sol' : patronDeity === 'tenebris' ? 'Tecelão do Vazio' : 'Matriarca da Terra'}
                                                </p>
                                                <span className="mt-1 inline-block bg-amber-500/10 text-amber-400 text-xs px-3 py-0.5 rounded-full font-black border border-amber-500/20">
                                                    NÍVEL PADROEIRO {deityLevel}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Favor Progress */}
                                        <div className="mb-6">
                                            <div className="flex justify-between items-center text-xs mb-2">
                                                <span className="text-stone-400 font-bold uppercase tracking-wider">Favor Divino</span>
                                                <span className="text-amber-500 font-mono font-bold">{deityFavor} / {deityLevel * 1000}</span>
                                            </div>
                                            <div className="w-full bg-stone-950 h-3 rounded-full border border-stone-850 overflow-hidden p-0.5">
                                                <div
                                                    className="bg-gradient-to-r from-amber-600 to-yellow-500 h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, (deityFavor / (deityLevel * 1000)) * 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-stone-500 mt-1 italic text-left">Ofereça almas ou divindade para aumentar seu favor e elevar o nível do deus.</p>
                                        </div>

                                        {/* Deity Energy / Charge */}
                                        <div className="mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                                            <div className="flex justify-between items-center text-xs mb-2">
                                                <span className="text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Sparkles size={14} className="text-yellow-400 animate-pulse" /> Carga da Magia Ativa
                                                </span>
                                                <span className="text-yellow-400 font-mono font-bold">{deityEnergy}%</span>
                                            </div>
                                            <div className="w-full bg-stone-955 h-4 rounded-full border border-stone-800 overflow-hidden p-0.5 relative">
                                                <div
                                                    className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${deityEnergy}%` }}
                                                />
                                                <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-black tracking-widest uppercase">
                                                    {deityEnergy >= 100 ? 'CONJURAÇÃO IMINENTE!' : 'CARREGANDO EM COMBATE'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Active bonuses */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs text-stone-400 font-bold uppercase tracking-wider text-left">Efeitos Ativos no Nível {deityLevel}</h4>
                                            <div className="bg-black/50 p-4 rounded-xl border border-stone-850 space-y-2 text-sm text-left">
                                                {patronDeity === 'aurelius' && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-stone-400">Dano de Ataque Global</span>
                                                        <span className="text-yellow-400 font-bold">+{(15 + (deityLevel - 1) * 5)}%</span>
                                                    </div>
                                                )}
                                                {patronDeity === 'tenebris' && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-stone-400">Roubo de Vida Global</span>
                                                        <span className="text-purple-400 font-bold">+{(15 + (deityLevel - 1) * 5)}%</span>
                                                    </div>
                                                )}
                                                {patronDeity === 'gaya' && (
                                                    <>
                                                        <div className="flex justify-between items-center border-b border-stone-850/50 pb-2">
                                                            <span className="text-stone-400">HP Máximo Global</span>
                                                            <span className="text-green-400 font-bold">+{(15 + (deityLevel - 1) * 5)}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center border-b border-stone-850/50 pb-2">
                                                            <span className="text-stone-400">Ouro Ganho</span>
                                                            <span className="text-yellow-500 font-bold">+{(15 + (deityLevel - 1) * 5)}%</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-stone-400">Velocidade do Jardim</span>
                                                            <span className="text-emerald-400 font-bold">+{(15 + (deityLevel - 1) * 5)}%</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Renounce Button */}
                                    <button
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja renegando seu deus? Você perderá todo o favor acumulado e nível com ele!')) {
                                                pledgeDeity(null);
                                            }
                                        }}
                                        className="w-full mt-6 py-3 bg-red-955/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 hover:text-red-200 font-bold rounded-xl text-xs uppercase tracking-widest transition-all duration-300"
                                    >
                                        Abandonar Deus Padroeiro
                                    </button>
                                </div>

                                {/* Right Side: Offerings Section */}
                                <div className="w-full md:w-80 bg-stone-900/60 border border-stone-850 p-6 rounded-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-white mb-2 text-left">TRIBUTOS E OFERENDAS</h3>
                                        <p className="text-stone-400 text-xs leading-relaxed mb-6 text-left">
                                            Agrade seu deus oferecendo recursos raros para ganhar favor divino e aumentar os bônus globais e o poder de conjuração do padroeiro.
                                        </p>

                                        <div className="space-y-4">
                                            {/* Offer Souls */}
                                            <div className="bg-black/50 p-4 rounded-xl border border-stone-850 flex flex-col gap-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-stone-400 uppercase font-black">Almas de Monstros</span>
                                                    <span className="text-cyan-400 font-mono text-xs">{formatNumber(souls)}</span>
                                                </div>
                                                <button
                                                    onClick={() => offerToDeity('souls')}
                                                    disabled={souls < 5000}
                                                    className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300
                                                        ${souls >= 5000
                                                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30 active:scale-95'
                                                            : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-850'
                                                        }`}
                                                >
                                                    Oferecer 5.000 Almas
                                                </button>
                                                <span className="text-[9px] text-stone-500 text-center">+500 Favor</span>
                                            </div>

                                            {/* Offer Divinity */}
                                            <div className="bg-black/50 p-4 rounded-xl border border-stone-850 flex flex-col gap-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-stone-400 uppercase font-black">Divindade</span>
                                                    <span className="text-yellow-550 font-mono text-xs">{formatNumber(divinity)}</span>
                                                </div>
                                                <button
                                                    onClick={() => offerToDeity('divinity')}
                                                    disabled={divinity < 100}
                                                    className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300
                                                        ${divinity >= 100
                                                            ? 'bg-yellow-600 hover:bg-yellow-500 text-stone-950 shadow-md shadow-amber-900/30 active:scale-95'
                                                            : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-850'
                                                        }`}
                                                >
                                                    Oferecer 100 Divindade
                                                </button>
                                                <span className="text-[9px] text-stone-500 text-center">+500 Favor</span>
                                            </div>
                                            {/* Quick Info Box */}
                                            <div className="bg-black/35 p-3 rounded-lg border border-white/5 text-[10px] text-stone-500 mt-6 leading-relaxed text-left">
                                                ⚠️ **Aviso de Renegação**: Se você decidir abandonar seu deus atual, todo o favor e nível serão completamente perdidos. Escolha sabiamente.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Rituals Panel */}
                                <div className="w-full md:w-80 bg-stone-900/60 border border-stone-850 p-6 rounded-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-white mb-2 text-left">RITUAL DO CLIMA</h3>
                                        <p className="text-stone-400 text-xs leading-relaxed mb-4 text-left">
                                            Canalize o poder elemental do padroeiro para mudar o clima mundial por 5 minutos.
                                        </p>
                                        
                                        <div className="bg-black/35 p-3 rounded-lg border border-white/5 mb-4 text-xs text-left">
                                            <div className="flex justify-between items-center text-stone-400 mb-1">
                                                <span>Ervas:</span>
                                                <span className={`font-bold ${(resources.herbs || 0) >= 10 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {resources.herbs || 0} / 10
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-stone-400">
                                                <span>Almas:</span>
                                                <span className={`font-bold ${souls >= 100 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatNumber(souls)} / 100
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1 custom-scrollbar">
                                            {[
                                                { type: 'Rain', icon: '🌧️', name: 'Estação das Chuvas', desc: '+50% Pesca / Bônus Água' },
                                                { type: 'Eclipse', icon: '🌑', name: 'Eclipse Solar', desc: 'Bônus Trevas / Guerra +30% Ouro' },
                                                { type: 'Aurora', icon: '🌌', name: 'Aurora Boreal', desc: 'Bônus Luz / Guerra +50% XP' },
                                                { type: 'Blizzard', icon: '❄️', name: 'Era do Gelo', desc: 'Bônus Frio / Guerra -20% XP' },
                                                { type: 'Heatwave', icon: '🔥', name: 'Onda de Calor', desc: 'Bônus Fogo / Guerra +20% Ouro' }
                                            ].map(w => {
                                                const hasResources = (resources.herbs || 0) >= 10 && souls >= 100;
                                                return (
                                                    <div key={w.type} className="bg-black/40 p-2 rounded-lg border border-stone-850/60 flex flex-col justify-between gap-1 text-xs text-left">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{w.icon}</span>
                                                            <div>
                                                                <div className="font-bold text-stone-200">{w.name}</div>
                                                                <div className="text-[10px] text-stone-400">{w.desc}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => invokeWeather(w.type as any)}
                                                            disabled={!hasResources}
                                                            className={`w-full mt-1.5 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-all duration-300
                                                                ${hasResources
                                                                    ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 active:scale-95'
                                                                    : 'bg-stone-850 text-stone-600 cursor-not-allowed border border-stone-850'
                                                                }`}
                                                        >
                                                            Invocação Elemental
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Section */}
                <div className="mt-4 pt-4 border-t border-stone-800/50 text-center">
                    <div className="inline-flex items-center gap-2 text-stone-500 text-xs bg-stone-900/50 px-4 py-2 rounded-full border border-stone-800">
                        <Info size={12} className="text-amber-600" />
                        Cada melhoria é permanente e afeta todos os heróis da guilda.
                    </div>
                </div>
            </div>
        </div>
    );
};
