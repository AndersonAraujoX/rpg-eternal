import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Building, Hero } from '../engine/types';
import { generateRoadNetwork, getRoadTier, type RoadTileInfo, type RoadTier } from '../engine/townEngine';
import { getTileDecoration, getRoadTierStyle } from '../utils/isometric';
import { Sparkles, Coins, Hammer, Info, Flame, Sun, Moon } from 'lucide-react';

interface IsometricTownGridProps {
    buildings: Building[];
    gold: number;
    selectedBuildingId: string | null;
    placeBuilding: (buildingId: string, x: number, y: number) => void;
    onTileClick: (x: number, y: number) => void;
    onBuildingClick: (buildingId: string) => void;
    heroes?: Hero[];
    weather?: string;
    onFountainClick?: () => void;
}

interface Walker {
    id: string;
    emoji: string;
    name: string;
    level: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    isWaiting: boolean;
    waitTimer: number;
    flip: boolean;
    bubbleText: string | null;
    bubbleTimer: number;
    currentActionEmote?: string | null;
}

const RPG_DIALOGUES = [
    "A cerveja da taverna hoje está divina! 🍺",
    "Preciso reforçar minha armadura na forja! ⚔️",
    "Quem diria que nossa cidade se tornaria tão próspera! 🏛️",
    "Rezei no altar e sinto uma bênção protetora! ✨",
    "Belo dia para explorar as dungeons da torre!",
    "Os impostos da prefeitura estão rendendo bem!",
    "Mais uma vitória gloriosa na arena!",
    "Essa praça ficou espetacular!"
];

export const IsometricTownGrid: React.FC<IsometricTownGridProps> = ({
    buildings,
    gold,
    selectedBuildingId,
    placeBuilding,
    onTileClick,
    onBuildingClick,
    heroes = [],
    weather = 'Sunny',
    onFountainClick
}) => {
    const GRID_SIZE = 8;
    const CELL_SIZE = 54; // px
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
    const [fountainSparkle, setFountainSparkle] = useState(false);

    // Generate intelligent dynamic road network based on placed buildings
    const roadNetwork = useMemo(() => {
        return generateRoadNetwork(buildings, GRID_SIZE);
    }, [buildings]);

    const townHall = buildings.find(b => b.id === 'town_hall');
    const roadTier: RoadTier = getRoadTier(townHall?.level || 0);
    const isDarkWeather = weather === 'Eclipse' || weather === 'Rain' || weather === 'Blizzard';
    const roadStyles = getRoadTierStyle(roadTier, isDarkWeather);

    // Get list of road coordinates for pathfinding
    const roadCoordinates = useMemo(() => {
        const coords: { x: number; y: number }[] = [];
        roadNetwork.forEach((info) => {
            coords.push({ x: info.x, y: info.y });
        });
        return coords.length > 0 ? coords : [{ x: 3, y: 4 }];
    }, [roadNetwork]);

    // Walkers simulation (Heroes strolling strictly along roads)
    const [walkers, setWalkers] = useState<Walker[]>([]);
    const animationFrameId = useRef<number | null>(null);
    const walkersRef = useRef<Walker[]>([]);

    const availableHeroes = useMemo(() => {
        let list = heroes.filter(h => h.unlocked && h.assignment !== 'combat');
        if (list.length === 0) {
            list = heroes.filter(h => h.unlocked);
        }
        return list.slice(0, 6);
    }, [heroes]);

    // Initialize walkers along road network
    useEffect(() => {
        const initialWalkers = availableHeroes.map((h, idx) => {
            const spawnPoint = roadCoordinates[idx % roadCoordinates.length] || { x: 3, y: 4 };
            const targetPoint = roadCoordinates[Math.floor(Math.random() * roadCoordinates.length)] || spawnPoint;

            return {
                id: h.id,
                emoji: h.emoji,
                name: h.name,
                level: h.level,
                x: spawnPoint.x,
                y: spawnPoint.y,
                targetX: targetPoint.x,
                targetY: targetPoint.y,
                isWaiting: false,
                waitTimer: 0,
                flip: false,
                bubbleText: null,
                bubbleTimer: 0,
                currentActionEmote: null
            };
        });
        setWalkers(initialWalkers);
        walkersRef.current = initialWalkers;
    }, [availableHeroes, roadCoordinates]);

    // Walker animation loop
    useEffect(() => {
        const updateWalkers = () => {
            let changed = false;
            const updated = walkersRef.current.map(w => {
                let { x, y, targetX, targetY, isWaiting, waitTimer, flip, bubbleText, bubbleTimer, currentActionEmote } = w;

                if (bubbleTimer > 0) {
                    bubbleTimer--;
                    if (bubbleTimer <= 0) {
                        bubbleText = null;
                        currentActionEmote = null;
                        changed = true;
                    }
                }

                if (isWaiting) {
                    waitTimer--;
                    if (waitTimer <= 0) {
                        isWaiting = false;
                        const nextTarget = roadCoordinates[Math.floor(Math.random() * roadCoordinates.length)] || { x: 3, y: 4 };
                        targetX = nextTarget.x;
                        targetY = nextTarget.y;
                        flip = targetX < x;
                        changed = true;
                    }
                } else {
                    const dx = targetX - x;
                    const dy = targetY - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 0.06) {
                        x = targetX;
                        y = targetY;
                        isWaiting = true;
                        waitTimer = 50 + Math.floor(Math.random() * 80);

                        // Contextual emote / speech bubble when stopping
                        if (Math.random() < 0.35) {
                            bubbleText = RPG_DIALOGUES[Math.floor(Math.random() * RPG_DIALOGUES.length)];
                            bubbleTimer = 100;
                            currentActionEmote = Math.random() < 0.5 ? '💬' : '✨';
                        }
                        changed = true;
                    } else {
                        const speed = 0.022;
                        x += (dx / distance) * speed;
                        y += (dy / distance) * speed;
                        flip = targetX < x;
                        changed = true;
                    }
                }

                return {
                    ...w,
                    x,
                    y,
                    targetX,
                    targetY,
                    isWaiting,
                    waitTimer,
                    flip,
                    bubbleText,
                    bubbleTimer,
                    currentActionEmote
                };
            });

            if (changed) {
                setWalkers(updated);
                walkersRef.current = updated;
            }

            animationFrameId.current = requestAnimationFrame(updateWalkers);
        };

        animationFrameId.current = requestAnimationFrame(updateWalkers);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [roadCoordinates]);

    const getBuildingAt = (x: number, y: number): Building | undefined => {
        return buildings.find(b => {
            if (!b.placed || b.x === undefined || b.y === undefined) return false;
            return x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height;
        });
    };

    const canPlaceBuildingAt = (building: Building, targetX: number, targetY: number): boolean => {
        if (targetX + building.width > GRID_SIZE || targetY + building.height > GRID_SIZE) return false;
        for (let x = targetX; x < targetX + building.width; x++) {
            for (let y = targetY; y < targetY + building.height; y++) {
                const existing = getBuildingAt(x, y);
                if (existing && existing.id !== building.id) return false;
            }
        }
        return true;
    };

    const placingBuilding = selectedBuildingId ? buildings.find(b => b.id === selectedBuildingId) : null;

    const handleFountainClick = () => {
        setFountainSparkle(true);
        setTimeout(() => setFountainSparkle(false), 2000);
        if (onFountainClick) onFountainClick();
    };

    // Precompute placed building list to avoid duplicate rendering over multi-tile footprints
    const placedBuildingsList = useMemo(() => {
        return buildings.filter(b => b.placed && b.x !== undefined && b.y !== undefined);
    }, [buildings]);

    // Grid coordinates
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            cells.push({ x, y });
        }
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className="overflow-auto max-w-full p-4 bg-stone-950/80 border-2 border-stone-800/80 rounded-2xl shadow-2xl custom-scrollbar relative">
                
                {/* Visual Weather / Time Banner */}
                <div className="flex justify-between items-center px-3 py-1.5 mb-3 bg-stone-900/90 rounded-xl border border-stone-700/60 text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                            🏛️ Pavimentação: <strong className="uppercase text-white">{roadTier.replace('_', ' ')}</strong>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-stone-400">Clima Atual:</span>
                        <span className="text-emerald-400 font-bold">{weather}</span>
                    </div>
                </div>

                {/* ── MAP CONTAINER ────────────────────────────────────────── */}
                <div 
                    className="relative bg-gradient-to-b from-emerald-950/60 via-stone-900 to-stone-950 rounded-xl border-2 border-amber-900/40 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] select-none mx-auto"
                    style={{
                        width: `${GRID_SIZE * CELL_SIZE}px`,
                        height: `${GRID_SIZE * CELL_SIZE}px`,
                    }}
                >
                    {/* LAYER 0: TERRAIN & NATURAL GRASS */}
                    {cells.map(({ x, y }) => {
                        const roadInfo = roadNetwork.get(`${x},${y}`);
                        const isRoad = !!roadInfo;
                        const decor = getTileDecoration(x, y, isRoad);
                        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;

                        let cellBg = isRoad ? roadStyles.bg : 'bg-emerald-950/30';
                        let cellBorder = isRoad ? roadStyles.border : 'border-emerald-900/20';

                        if (placingBuilding && isHovered) {
                            const isValid = canPlaceBuildingAt(placingBuilding, x, y);
                            cellBg = isValid ? 'bg-emerald-500/40' : 'bg-red-500/40';
                            cellBorder = isValid ? 'border-emerald-400 z-20 ring-2 ring-emerald-400' : 'border-red-400 z-20 ring-2 ring-red-400';
                        } else if (isHovered) {
                            cellBorder = 'border-amber-400 z-10 ring-1 ring-amber-400/50';
                        }

                        return (
                            <div
                                key={`tile-${x}-${y}`}
                                data-testid={`tile-${x}-${y}`}
                                className={`absolute border transition-all duration-150 flex items-center justify-center cursor-pointer ${cellBg} ${cellBorder}`}
                                style={{
                                    left: `${x * CELL_SIZE}px`,
                                    top: `${y * CELL_SIZE}px`,
                                    width: `${CELL_SIZE}px`,
                                    height: `${CELL_SIZE}px`,
                                }}
                                onMouseEnter={() => setHoveredTile({ x, y })}
                                onMouseLeave={() => setHoveredTile(null)}
                                onClick={() => {
                                    if (selectedBuildingId) {
                                        placeBuilding(selectedBuildingId, x, y);
                                    } else {
                                        onTileClick(x, y);
                                    }
                                }}
                            >
                                {/* Natural Flora / Rocks on non-road tiles */}
                                {!isRoad && decor && (
                                    <span className="text-base select-none opacity-85 hover:scale-125 transition-transform">
                                        {decor}
                                    </span>
                                )}

                                {/* Road Props: Street Torches, Lamps & Market Bazaars */}
                                {isRoad && roadInfo?.hasLamp && (
                                    <div className="absolute -top-1.5 -right-1.5 z-10 animate-bounce">
                                        <span className="text-xs" title="Poste de Iluminação da Cidade">{roadStyles.lampEmoji}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* LAYER 1: CENTRAL INTERACTIVE PLAZA FOUNTAIN */}
                    <div 
                        onClick={handleFountainClick}
                        className="absolute z-20 cursor-pointer flex flex-col items-center justify-center group"
                        style={{
                            left: `${3.5 * CELL_SIZE - 20}px`,
                            top: `${4 * CELL_SIZE - 20}px`,
                            width: '40px',
                            height: '40px'
                        }}
                        title="Chafariz Central de Prosperidade (Clique para fazer um pedido!)"
                    >
                        <div className="text-2xl group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                            ⛲
                        </div>
                        {fountainSparkle && (
                            <span className="absolute -top-4 text-xs text-amber-300 font-mono font-bold animate-ping">
                                +✨ Moeda da Sorte!
                            </span>
                        )}
                    </div>

                    {/* LAYER 2: PLACED BUILDINGS */}
                    {placedBuildingsList.map(building => {
                        const isTownHall = building.id === 'town_hall';
                        const levelBadgeColor = building.level >= 10 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black border-amber-300' 
                            : building.level >= 5 
                            ? 'bg-blue-600 text-white font-bold border-blue-400' 
                            : 'bg-stone-800 text-stone-300 border-stone-600';

                        return (
                            <div
                                key={`placed-bld-${building.id}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBuildingClick(building.id);
                                }}
                                className="absolute z-30 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 group"
                                style={{
                                    left: `${building.x! * CELL_SIZE}px`,
                                    top: `${building.y! * CELL_SIZE}px`,
                                    width: `${building.width * CELL_SIZE}px`,
                                    height: `${building.height * CELL_SIZE}px`,
                                }}
                            >
                                {/* Shadow and Building Base */}
                                <div className="absolute inset-1 rounded-xl bg-stone-900/90 border-2 border-amber-600/60 group-hover:border-amber-400 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex flex-col items-center justify-center p-1 overflow-hidden">
                                    <div className="text-3xl mb-0.5 group-hover:scale-110 transition-transform">
                                        {building.emoji}
                                    </div>
                                    <span className="text-[10px] font-bold text-stone-200 truncate max-w-full px-1 text-center font-mono leading-none">
                                        {building.name}
                                    </span>
                                </div>

                                {/* Building Level Badge */}
                                <span className={`absolute -top-2 -right-2 text-[9px] px-1.5 py-0.5 rounded-full border shadow-md font-mono z-40 ${levelBadgeColor}`}>
                                    Lvl {building.level}
                                </span>
                            </div>
                        );
                    })}

                    {/* LAYER 3: CITIZENS & HERO WALKERS (MMORPG LIFE) */}
                    {walkers.map(walker => {
                        return (
                            <div
                                key={`walker-${walker.id}`}
                                className="absolute z-35 flex flex-col items-center pointer-events-none transition-transform duration-75"
                                style={{
                                    left: `${walker.x * CELL_SIZE + (CELL_SIZE / 2) - 16}px`,
                                    top: `${walker.y * CELL_SIZE + (CELL_SIZE / 2) - 24}px`,
                                    width: '32px',
                                    height: '32px',
                                }}
                            >
                                {/* Hero Chat Speech Bubble */}
                                {walker.bubbleText && (
                                    <div className="absolute -top-8 bg-black/90 text-amber-200 border border-amber-500/60 text-[9px] font-mono px-2 py-0.5 rounded-lg whitespace-nowrap shadow-lg animate-fade-in z-50">
                                        {walker.bubbleText}
                                    </div>
                                )}

                                {/* Hero Avatar Sprite */}
                                <div 
                                    className="text-2xl transition-transform"
                                    style={{ transform: walker.flip ? 'scaleX(-1)' : 'scaleX(1)' }}
                                    title={`${walker.name} (Lvl ${walker.level})`}
                                >
                                    {walker.emoji}
                                </div>

                                {/* Hero Name Tag */}
                                <span className="text-[8px] font-mono font-bold text-white bg-black/70 px-1 rounded -mt-1 leading-none shadow">
                                    {walker.name}
                                </span>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};
