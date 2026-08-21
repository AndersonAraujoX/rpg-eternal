import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Building, Hero } from '../engine/types';
import { generateRoadNetwork, getRoadTier, type RoadTileInfo, type RoadTier } from '../engine/townEngine';
import { getTileDecoration, getRoadTierStyle } from '../utils/isometric';

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
    "A cerveja da taverna está ótima! 🍺",
    "Preciso forjar nova armadura! ⚔️",
    "Nossa cidade está crescendo rápido! 🏛️",
    "Rezei no altar e recebi uma bênção! ✨",
    "Pronto para a próxima dungeon!",
    "Os impostos estão rendendo bem!",
    "Belo dia na praça central! ⛲"
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
    const CELL_SIZE = 50; // Exact 400px square map
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

    // Walkers simulation (Heroes strolling along roads)
    const [walkers, setWalkers] = useState<Walker[]>([]);
    const animationFrameId = useRef<number | null>(null);
    const walkersRef = useRef<Walker[]>([]);

    const availableHeroes = useMemo(() => {
        let list = heroes.filter(h => h.unlocked && h.assignment !== 'combat');
        if (list.length === 0) {
            list = heroes.filter(h => h.unlocked);
        }
        return list.slice(0, 5);
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
                        waitTimer = 60 + Math.floor(Math.random() * 90);

                        // Contextual dialogue chance
                        if (Math.random() < 0.3) {
                            bubbleText = RPG_DIALOGUES[Math.floor(Math.random() * RPG_DIALOGUES.length)];
                            bubbleTimer = 90;
                            currentActionEmote = '💬';
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

    // Precompute placed building list
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
        <div className="flex flex-col items-center select-none">
            {/* ── MAP CONTAINER (EXACT 400x400) ──────────────────────────────── */}
            <div 
                className="relative bg-gradient-to-b from-emerald-950/70 via-stone-900 to-stone-950 rounded-2xl border-2 border-amber-600/40 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden"
                style={{
                    width: `${GRID_SIZE * CELL_SIZE}px`,
                    height: `${GRID_SIZE * CELL_SIZE}px`,
                }}
            >
                {/* LAYER 0: TERRAIN & NATURAL GRASS / ROADS */}
                {cells.map(({ x, y }) => {
                    const roadInfo = roadNetwork.get(`${x},${y}`);
                    const isRoad = !!roadInfo;
                    const decor = getTileDecoration(x, y, isRoad);
                    const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;

                    let cellBg = isRoad ? roadStyles.bg : 'bg-emerald-950/35 hover:bg-emerald-900/40';
                    let cellBorder = isRoad ? roadStyles.border : 'border-emerald-900/25';

                    if (placingBuilding && isHovered) {
                        const isValid = canPlaceBuildingAt(placingBuilding, x, y);
                        cellBg = isValid ? 'bg-emerald-500/40' : 'bg-red-500/40';
                        cellBorder = isValid ? 'border-emerald-400 z-20 ring-2 ring-emerald-400' : 'border-red-400 z-20 ring-2 ring-red-400';
                    } else if (isHovered) {
                        cellBorder = 'border-amber-400/80 z-10 ring-1 ring-amber-400/50';
                    }

                    return (
                        <div
                            key={`tile-${x}-${y}`}
                            data-testid={`tile-${x}-${y}`}
                            className={`absolute border transition-all duration-100 flex items-center justify-center cursor-pointer ${cellBg} ${cellBorder}`}
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
                                <span className="text-base select-none opacity-80 pointer-events-none">
                                    {decor}
                                </span>
                            )}

                            {/* Road Props: Street Lamps */}
                            {isRoad && roadInfo?.hasLamp && (
                                <div className="absolute -top-1 -right-1 z-10 animate-pulse pointer-events-none">
                                    <span className="text-xs">{roadStyles.lampEmoji}</span>
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
                        left: `${3.5 * CELL_SIZE - 18}px`,
                        top: `${4 * CELL_SIZE - 18}px`,
                        width: '36px',
                        height: '36px'
                    }}
                    title="Chafariz Central da Praça (Clique para fazer um pedido de sorte!)"
                >
                    <div className="text-2xl group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]">
                        ⛲
                    </div>
                    {fountainSparkle && (
                        <span className="absolute -top-5 text-[10px] text-amber-300 font-mono font-bold animate-bounce whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-amber-400/60 shadow">
                            +✨ Sorte!
                        </span>
                    )}
                </div>

                {/* LAYER 2: PLACED BUILDINGS */}
                {placedBuildingsList.map(building => {
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
                            className="absolute z-30 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 hover:scale-105 group"
                            style={{
                                left: `${building.x! * CELL_SIZE}px`,
                                top: `${building.y! * CELL_SIZE}px`,
                                width: `${building.width * CELL_SIZE}px`,
                                height: `${building.height * CELL_SIZE}px`,
                            }}
                        >
                            {/* Building Frame */}
                            <div className="absolute inset-1 rounded-xl bg-stone-900/95 border-2 border-amber-600/70 group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all flex flex-col items-center justify-center p-1 overflow-hidden">
                                <div className="text-2xl mb-0.5 group-hover:scale-110 transition-transform">
                                    {building.emoji}
                                </div>
                                <span className="text-[9px] font-bold text-stone-200 truncate max-w-full px-1 text-center font-mono leading-tight">
                                    {building.name}
                                </span>
                            </div>

                            {/* Building Level Badge */}
                            <span className={`absolute -top-1.5 -right-1.5 text-[8px] px-1 py-0.2 rounded-full border shadow-md font-mono z-40 ${levelBadgeColor}`}>
                                Lvl {building.level}
                            </span>
                        </div>
                    );
                })}

                {/* LAYER 3: CITIZENS & HERO WALKERS */}
                {walkers.map(walker => {
                    return (
                        <div
                            key={`walker-${walker.id}`}
                            className="absolute z-35 flex flex-col items-center pointer-events-none transition-transform duration-75"
                            style={{
                                left: `${walker.x * CELL_SIZE + (CELL_SIZE / 2) - 14}px`,
                                top: `${walker.y * CELL_SIZE + (CELL_SIZE / 2) - 20}px`,
                                width: '28px',
                                height: '28px',
                            }}
                        >
                            {/* Speech Bubble */}
                            {walker.bubbleText && (
                                <div className="absolute -top-7 bg-black/95 text-amber-300 border border-amber-500/80 text-[8px] font-mono px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
                                    {walker.bubbleText}
                                </div>
                            )}

                            {/* Hero Sprite */}
                            <div 
                                className="text-xl transition-transform"
                                style={{ transform: walker.flip ? 'scaleX(-1)' : 'scaleX(1)' }}
                            >
                                {walker.emoji}
                            </div>

                            {/* Hero Name Badge */}
                            <span className="text-[7px] font-mono font-bold text-white bg-black/80 px-1 rounded -mt-1 leading-none shadow">
                                {walker.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
