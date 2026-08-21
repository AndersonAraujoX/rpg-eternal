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
    offerToDeity: (offeringType: 'souls' | 'divinity' | 'high_tier_industry') => void;
    souls: number;
    divinity: number;
    hasDonatedHighTierIndustry?: boolean;
    industryInventory?: Record<string, number>;
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
    hasDonatedHighTierIndustry = false,
    industryInventory = {},
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
                                <div className="flex-1 flex flex-col md:flex-row gap-6 min-w-0 min-h-0">
                                    {/* Left Area: Grid Map */}
                                    <div className="flex-1 min-w-0 bg-stone-950/40 p-6 rounded-2xl border border-stone-900/60 shadow-inner flex flex-col items-center justify-center relative min-h-[300px] select-none">
                                        <div className="absolute top-3 left-4 text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono">
                                            🗺️ Grid de Construção 2D
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
                                                heroes={heroes}
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
                        {/* ── Selection Mode (No Patron Chosen) ─────────────────── */}
                        {!patronDeity ? (
                            <div className="flex-1 flex flex-col justify-center overflow-y-auto max-h-[62vh] pr-2 custom-scrollbar">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                        <Sparkles size={13} className="text-amber-400 animate-spin" /> Santuário Celestial
                                    </div>
                                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 tracking-tight">
                                        ESCOLHA SEU DEUS PADROEIRO
                                    </h3>
                                    <p className="text-stone-400 text-xs max-w-xl mx-auto mt-1 leading-relaxed">
                                        Preste juramento solene a uma das entidades eternas. Cada divindade concede uma bênção passiva permanente, habilidades de combate devastadoras e rituais climáticos.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto w-full pb-2">
                                    {/* ☀️ Aurelius */}
                                    <div className="relative bg-gradient-to-b from-amber-950/40 via-stone-900/90 to-stone-950 border-2 border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300 group overflow-hidden">
                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                                        <div>
                                            <div className="relative flex justify-center mb-3">
                                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300">
                                                    ☀️
                                                </div>
                                                <span className="absolute -bottom-2 bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                                                    SOL & FOGO
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black text-amber-400 text-center mt-2">Aurelius</h4>
                                            <p className="text-stone-500 text-center text-[10px] uppercase tracking-widest font-bold mb-3">Pai do Sol Cósmico</p>

                                            <div className="space-y-2.5 text-xs text-stone-300">
                                                <div className="bg-black/60 p-3 rounded-xl border border-amber-500/20 text-left">
                                                    <span className="font-bold text-amber-400 text-[10px] uppercase font-mono block mb-0.5 flex items-center gap-1">
                                                        👑 Bênção Passiva
                                                    </span>
                                                    <span className="text-stone-200 leading-tight block">
                                                        <strong className="text-amber-300">+15% Dano Global</strong> (+5%/Lvl) e <strong className="text-amber-300">+20% Eficácia GvG</strong>
                                                    </span>
                                                </div>
                                                <div className="bg-black/60 p-3 rounded-xl border border-amber-500/20 text-left">
                                                    <span className="font-bold text-amber-400 text-[10px] uppercase font-mono block mb-0.5 flex items-center gap-1">
                                                        ⚡ Magia de Combate (100%)
                                                    </span>
                                                    <span className="text-stone-400 text-[11px] leading-tight block">
                                                        <strong className="text-stone-200">Meteoro Solar:</strong> Invoca chuva de fogo massiva baseada no ataque do grupo.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => pledgeDeity('aurelius')}
                                            className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-amber-950/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
                                        >
                                            Consagrar a Aurelius
                                        </button>
                                    </div>

                                    {/* 🌌 Tenebris */}
                                    <div className="relative bg-gradient-to-b from-purple-950/40 via-stone-900/90 to-stone-950 border-2 border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] transition-all duration-300 group overflow-hidden">
                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                                        <div>
                                            <div className="relative flex justify-center mb-3">
                                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300">
                                                    🌌
                                                </div>
                                                <span className="absolute -bottom-2 bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                                                    VAZIO & ENTROPIA
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black text-purple-400 text-center mt-2">Tenebris</h4>
                                            <p className="text-stone-500 text-center text-[10px] uppercase tracking-widest font-bold mb-3">Tecelão do Vazio</p>

                                            <div className="space-y-2.5 text-xs text-stone-300">
                                                <div className="bg-black/60 p-3 rounded-xl border border-purple-500/20 text-left">
                                                    <span className="font-bold text-purple-400 text-[10px] uppercase font-mono block mb-0.5 flex items-center gap-1">
                                                        👑 Bênção Passiva
                                                    </span>
                                                    <span className="text-stone-200 leading-tight block">
                                                        <strong className="text-purple-300">+15% Roubo de Vida Global</strong> (+5%/Lvl) e sustentação cósmica
                                                    </span>
                                                </div>
                                                <div className="bg-black/60 p-3 rounded-xl border border-purple-500/20 text-left">
                                                    <span className="font-bold text-purple-400 text-[10px] uppercase font-mono block mb-0.5 flex items-center gap-1">
                                                        ⚡ Magia de Combate (100%)
                                                    </span>
                                                    <span className="text-stone-400 text-[11px] leading-tight block">
                                                        <strong className="text-stone-200">Barreira Entrópica:</strong> Concede escudo e cura a equipe em 30% do HP Máx por nível.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => pledgeDeity('tenebris')}
                                            className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-purple-950/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95"
                                        >
                                            Consagrar a Tenebris
                                        </button>
                                    </div>

                                    {/* 🌿 Gaya */}
                                    <div className="relative bg-gradient-to-b from-emerald-950/40 via-stone-900/90 to-stone-950 border-2 border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-300 group overflow-hidden">
                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                                        <div>
                                            <div className="relative flex justify-center mb-3">
                                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300">
                                                    🌿
                                                </div>
                                                <span className="absolute -bottom-2 bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                                                    TERRA & VIDA
                                                </span>
                                            </div>
                                            <h4 className="text-xl font-black text-emerald-400 text-center mt-2">Gaya</h4>
                                            <p className="text-stone-500 text-center text-[10px] uppercase tracking-widest font-bold mb-3">Matriarca da Terra</p>

                                            <div className="space-y-2.5 text-xs text-stone-300">
                                                <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/20 text-left">
                                                    <span className="font-bold text-emerald-400 text-[10px] uppercase font-mono block mb-0.5 flex items-center gap-1">
                                                        👑 Bênção Passiva
                                                    </span>
                                                    <span className="text-stone-200 leading-tight block">
                                                        <strong className="text-emerald-300">+15% HP, Ouro & Jardim</strong> (+5%/Lvl) para abundância contínua
                                                    </span>
                                                </div>
                                                <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/20 text-left">
                                                    <span className="font-bold text-emerald-400 text-[10px] uppercase font-mono block mb-0.5 flex items-center gap-1">
                                                        ⚡ Magia de Combate (100%)
                                                    </span>
                                                    <span className="text-stone-400 text-[11px] leading-tight block">
                                                        <strong className="text-stone-200">Rejuvenescimento Telúrico:</strong> Cura e restaura 100% de HP e MP de toda a equipe.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => pledgeDeity('gaya')}
                                            className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-stone-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-emerald-950/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
                                        >
                                            Consagrar a Gaya
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── Active Patron Screen ─────────────────────────────── */
                            <div className="flex-1 flex flex-col gap-4 max-w-5xl mx-auto w-full min-h-0 overflow-y-auto max-h-[62vh] pr-1.5 custom-scrollbar">
                                {/* Top Grand Header Banner */}
                                {(() => {
                                    const isAurelius = patronDeity === 'aurelius';
                                    const isTenebris = patronDeity === 'tenebris';
                                    const deityName = isAurelius ? 'Aurelius' : isTenebris ? 'Tenebris' : 'Gaya';
                                    const deityTitle = isAurelius ? 'Pai do Sol Cósmico' : isTenebris ? 'Tecelão do Vazio Infinito' : 'Matriarca da Terra & Abundância';
                                    const deityEmoji = isAurelius ? '☀️' : isTenebris ? '🌌' : '🌿';
                                    const themeGradient = isAurelius 
                                        ? 'from-amber-950/60 via-stone-900 to-stone-950 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
                                        : isTenebris 
                                        ? 'from-purple-950/60 via-stone-900 to-stone-950 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
                                        : 'from-emerald-950/60 via-stone-900 to-stone-950 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]';
                                    const favorPercent = Math.min(100, (deityFavor / (deityLevel * 1000)) * 100);

                                    return (
                                        <div className={`bg-gradient-to-r ${themeGradient} border-2 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden`}>
                                            <div className="flex items-center gap-4 z-10">
                                                <div className="w-20 h-20 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-5xl shadow-inner">
                                                    {deityEmoji}
                                                </div>
                                                <div className="text-left">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-2xl font-black text-white tracking-tight">{deityName}</h3>
                                                        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-black uppercase">
                                                            Nível {deityLevel}
                                                        </span>
                                                    </div>
                                                    <p className="text-stone-400 text-xs font-mono font-bold mt-0.5">{deityTitle}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] text-stone-500 font-mono">Bônus por Nível:</span>
                                                        <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                                                            +{(15 + (deityLevel - 1) * 5)}% Efeitos Ativos
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dual Gauges: Favor & Energy */}
                                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
                                                {/* Favor Gauge */}
                                                <div className="bg-black/60 border border-stone-800 p-3 rounded-xl min-w-[200px] flex flex-col justify-between">
                                                    <div className="flex justify-between items-center text-xs mb-1">
                                                        <span className="text-stone-400 font-mono text-[10px] uppercase font-bold">Favor Divino</span>
                                                        <span className="text-amber-400 font-mono font-bold text-xs">{deityFavor} / {deityLevel * 1000}</span>
                                                    </div>
                                                    <div className="w-full bg-stone-950 h-2.5 rounded-full border border-stone-800 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                                                            style={{ width: `${favorPercent}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[9px] font-mono text-stone-500 mt-1 text-right">{favorPercent.toFixed(1)}% para Nível {deityLevel + 1}</div>
                                                </div>

                                                {/* Energy Ultimate Gauge */}
                                                <div className="bg-black/60 border border-stone-800 p-3 rounded-xl min-w-[200px] flex flex-col justify-between">
                                                    <div className="flex justify-between items-center text-xs mb-1">
                                                        <span className="text-stone-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                                                            <Sparkles size={11} className="text-yellow-400 animate-pulse" /> Magia de Combate
                                                        </span>
                                                        <span className="text-yellow-400 font-mono font-bold text-xs">{deityEnergy}%</span>
                                                    </div>
                                                    <div className="w-full bg-stone-950 h-2.5 rounded-full border border-stone-800 overflow-hidden relative">
                                                        <div
                                                            className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-300"
                                                            style={{ width: `${deityEnergy}%` }}
                                                        />
                                                    </div>
                                                    <div className={`text-[9px] font-mono font-black mt-1 text-right ${deityEnergy >= 100 ? 'text-cyan-400 animate-pulse' : 'text-stone-500'}`}>
                                                        {deityEnergy >= 100 ? '⚡ CONJURAÇÃO IMINENTE!' : 'CARREGANDO NO LOOP'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Main Grid: Left Side Buffs & Right Side Actions */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Left: Active Buffs & Ultimate Spell Details */}
                                    <div className="lg:col-span-1 bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                                        <div className="space-y-3">
                                            <div className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-800 pb-2">
                                                <Sparkles size={13} /> Bênçãos Ativas no Nível {deityLevel}
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                {patronDeity === 'aurelius' && (
                                                    <>
                                                        <div className="bg-black/50 p-2.5 rounded-lg border border-amber-500/20 flex justify-between items-center text-left">
                                                            <span className="text-stone-300">Dano de Ataque Global</span>
                                                            <span className="text-amber-400 font-bold font-mono">+{15 + (deityLevel - 1) * 5}%</span>
                                                        </div>
                                                        <div className="bg-black/50 p-2.5 rounded-lg border border-amber-500/20 flex justify-between items-center text-left">
                                                            <span className="text-stone-300">Eficácia Bombardeio GvG</span>
                                                            <span className="text-yellow-400 font-bold font-mono">+20%</span>
                                                        </div>
                                                        <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30 text-left text-[11px] text-amber-300">
                                                            <strong className="block text-amber-400 mb-0.5">☄️ Magia: Meteoro Solar</strong>
                                                            Causa dano massivo de fogo no boss com base no poder médio da equipe.
                                                        </div>
                                                    </>
                                                )}
                                                {patronDeity === 'tenebris' && (
                                                    <>
                                                        <div className="bg-black/50 p-2.5 rounded-lg border border-purple-500/20 flex justify-between items-center text-left">
                                                            <span className="text-stone-300">Roubo de Vida Global</span>
                                                            <span className="text-purple-400 font-bold font-mono">+{15 + (deityLevel - 1) * 5}%</span>
                                                        </div>
                                                        <div className="bg-purple-950/30 p-2.5 rounded-lg border border-purple-500/30 text-left text-[11px] text-purple-300">
                                                            <strong className="block text-purple-400 mb-0.5">🌌 Magia: Barreira Entrópica</strong>
                                                            Gera um escudo protetor e cura {30 * deityLevel}% do HP Máximo em combate.
                                                        </div>
                                                    </>
                                                )}
                                                {patronDeity === 'gaya' && (
                                                    <>
                                                        <div className="bg-black/50 p-2.5 rounded-lg border border-emerald-500/20 flex justify-between items-center text-left">
                                                            <span className="text-stone-300">HP Máximo Global</span>
                                                            <span className="text-emerald-400 font-bold font-mono">+{15 + (deityLevel - 1) * 5}%</span>
                                                        </div>
                                                        <div className="bg-black/50 p-2.5 rounded-lg border border-emerald-500/20 flex justify-between items-center text-left">
                                                            <span className="text-stone-300">Ouro Ganho</span>
                                                            <span className="text-yellow-400 font-bold font-mono">+{15 + (deityLevel - 1) * 5}%</span>
                                                        </div>
                                                        <div className="bg-black/50 p-2.5 rounded-lg border border-emerald-500/20 flex justify-between items-center text-left">
                                                            <span className="text-stone-300">Velocidade do Jardim</span>
                                                            <span className="text-green-400 font-bold font-mono">+{15 + (deityLevel - 1) * 5}%</span>
                                                        </div>
                                                        <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30 text-left text-[11px] text-emerald-300">
                                                            <strong className="block text-emerald-400 mb-0.5">🌿 Magia: Rejuvenescimento Telúrico</strong>
                                                            Restaura 100% do HP e MP de toda a equipe instantaneamente.
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja renegar seu deus? Todo o favor acumulado e nível serão zerados!')) {
                                                    pledgeDeity(null);
                                                }
                                            }}
                                            className="w-full mt-4 py-2 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-400 hover:text-red-200 font-mono text-[11px] font-bold rounded-lg transition-colors"
                                        >
                                            Abandonar Deus Padroeiro
                                        </button>
                                    </div>

                                    {/* Center & Right: Offerings & Weather Rituals */}
                                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Offerings Shrine */}
                                        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                                            <div>
                                                <div className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider border-b border-stone-800 pb-2 mb-3 flex items-center gap-1.5">
                                                    <span>🎁</span>
                                                    <span>TRIBUTOS E OFERENDAS</span>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {/* Souls Offering */}
                                                    <div className="bg-black/50 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between gap-2">
                                                        <div className="text-left">
                                                            <div className="text-[11px] font-bold text-stone-300">Almas de Monstros</div>
                                                            <div className="text-[9px] font-mono text-cyan-400">+500 Favor (Possui: {formatNumber(souls)})</div>
                                                        </div>
                                                        <button
                                                            onClick={() => offerToDeity('souls')}
                                                            disabled={souls < 5000}
                                                            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                                        >
                                                            Oferecer 5.000 Almas
                                                        </button>
                                                    </div>

                                                    {/* Divinity Offering */}
                                                    <div className="bg-black/50 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between gap-2">
                                                        <div className="text-left">
                                                            <div className="text-[11px] font-bold text-stone-300">Divindade</div>
                                                            <div className="text-[9px] font-mono text-yellow-400">+500 Favor (Possui: {formatNumber(divinity)})</div>
                                                        </div>
                                                        <button
                                                            onClick={() => offerToDeity('divinity')}
                                                            disabled={divinity < 100}
                                                            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-stone-950 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                                        >
                                                            Oferecer 100 Divindade
                                                        </button>
                                                    </div>

                                                    {/* High-tier Industry Offering */}
                                                    <div className="bg-black/50 p-2.5 rounded-xl border border-stone-800 space-y-2">
                                                        <div className="flex justify-between items-center text-left">
                                                            <div className="text-[11px] font-bold text-stone-300">Devoção Tecnológica</div>
                                                            {hasDonatedHighTierIndustry ? (
                                                                <span className="text-emerald-400 font-mono text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                                                                    ✓ Ativo (+25% Favor)
                                                                </span>
                                                            ) : (
                                                                <span className="text-amber-400 font-mono text-[10px] font-bold bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                                                                    Pendente
                                                                </span>
                                                            )}
                                                        </div>
                                                        {hasDonatedHighTierIndustry ? (
                                                            <div className="text-[10px] text-emerald-300 bg-emerald-950/20 border border-emerald-800/30 p-2 rounded-lg text-left leading-tight">
                                                                ⚡ Bênção ativada! Retribuição divina habilitada em combate.
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="text-[10px] text-stone-400 text-left leading-tight">
                                                                    Doe um item industrial de alto nível (ex: Canhão de Plasma, Estabilizador, Templo ou Satélite) para ganhar +2000 de favor e aceleração permanente de +25%!
                                                                </div>
                                                                {(() => {
                                                                    const highTierItems = ['plasma_cannon', 'portal_stabilizer', 'automated_temple', 'plasma_catalyst', 'reality_anchor', 'stellar_receptor', 'satellite'];
                                                                    const available = highTierItems.filter(item => (industryInventory?.[item] || 0) >= 1);
                                                                    if (available.length > 0) {
                                                                        return (
                                                                            <button
                                                                                onClick={() => offerToDeity('high_tier_industry')}
                                                                                className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-sm"
                                                                            >
                                                                                Oferecer Item Industrial Disponível
                                                                            </button>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <div className="text-[10px] text-stone-500 font-mono bg-stone-950 p-1.5 rounded text-center border border-stone-850">
                                                                                Sem itens de alto Tier no estoque
                                                                            </div>
                                                                        );
                                                                    }
                                                                })()}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weather Rituals Panel */}
                                        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                                            <div>
                                                <div className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider border-b border-stone-800 pb-2 mb-3 flex items-center gap-1.5">
                                                    <span>🌦️</span>
                                                    <span>RITUAL DO CLIMA</span>
                                                </div>

                                                <div className="bg-black/50 p-2.5 rounded-xl border border-stone-800 mb-3 text-xs flex justify-between">
                                                    <span className="text-stone-400 font-mono">Ervas: <strong className={(resources.herbs || 0) >= 10 ? 'text-emerald-400' : 'text-red-400'}>{resources.herbs || 0}/10</strong></span>
                                                    <span className="text-stone-400 font-mono">Almas: <strong className={souls >= 100 ? 'text-emerald-400' : 'text-red-400'}>{formatNumber(souls)}/100</strong></span>
                                                </div>

                                                <div className="space-y-1.5 overflow-y-auto max-h-[190px] pr-1 custom-scrollbar">
                                                    {[
                                                        { type: 'Rain', icon: '🌧️', name: 'Estação das Chuvas', desc: '+50% Pesca / Água' },
                                                        { type: 'Eclipse', icon: '🌑', name: 'Eclipse Solar', desc: 'Trevas & Guerra (+30% Ouro)' },
                                                        { type: 'Aurora', icon: '🌌', name: 'Aurora Boreal', desc: 'Luz Celestial (+50% XP)' },
                                                        { type: 'Blizzard', icon: '❄️', name: 'Nevasca Ártica', desc: 'Frio Extremo' },
                                                        { type: 'Heatwave', icon: '🔥', name: 'Onda de Calor', desc: 'Fogo (+20% Ouro)' }
                                                    ].map(w => {
                                                        const hasResources = (resources.herbs || 0) >= 10 && souls >= 100;
                                                        return (
                                                            <div key={w.type} className="bg-black/40 p-2 rounded-lg border border-stone-800 flex items-center justify-between gap-2 text-xs">
                                                                <div className="flex items-center gap-2 text-left">
                                                                    <span className="text-lg">{w.icon}</span>
                                                                    <div>
                                                                        <div className="font-bold text-stone-200 text-[11px] leading-none">{w.name}</div>
                                                                        <div className="text-[9px] text-stone-500 font-mono mt-0.5">{w.desc}</div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => invokeWeather(w.type as any)}
                                                                    disabled={!hasResources}
                                                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded text-[10px] font-mono font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    Invocar
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
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
