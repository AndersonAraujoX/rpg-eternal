import React, { useState, useEffect, useRef } from 'react';
import type { Building, Hero } from '../engine/types';
import { getTileDecoration } from '../utils/isometric';

interface IsometricTownGridProps {
    buildings: Building[];
    gold: number;
    selectedBuildingId: string | null;
    placeBuilding: (buildingId: string, x: number, y: number) => void;
    onTileClick: (x: number, y: number) => void;
    onBuildingClick: (buildingId: string) => void;
    heroes?: Hero[];
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
}

const DIALOGUES = [
    "A comida da taverna estava ótima!",
    "Ouvi um zumbido estranho vindo do porão...",
    "Preciso de mais ouro...",
    "Hoje é um belo dia para treinar!",
    "Aquela dungeon foi assustadora...",
    "Será que tem monstros novos por perto?",
    "Quem diria que a prefeitura ficaria tão bonita!"
];

export const IsometricTownGrid: React.FC<IsometricTownGridProps> = ({
    buildings,
    gold,
    selectedBuildingId,
    placeBuilding,
    onTileClick,
    onBuildingClick,
    heroes = []
}) => {
    const GRID_SIZE = 8;
    const CELL_SIZE = 52; // px
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // Walker state
    const [walkers, setWalkers] = useState<Walker[]>([]);
    const animationFrameId = useRef<number | null>(null);
    const walkersRef = useRef<Walker[]>([]);

    // Get available heroes for walking
    const availableHeroes = React.useMemo(() => {
        let list = heroes.filter(h => h.unlocked && h.assignment !== 'combat');
        if (list.length === 0) {
            list = heroes.filter(h => h.unlocked);
        }
        return list.slice(0, 5);
    }, [heroes]);

    // Initialize walkers when available heroes list changes
    useEffect(() => {
        const initialWalkers = availableHeroes.map(h => {
            const startX = Math.floor(Math.random() * GRID_SIZE);
            const startY = Math.floor(Math.random() * GRID_SIZE);
            return {
                id: h.id,
                emoji: h.emoji,
                name: h.name,
                level: h.level,
                x: startX,
                y: startY,
                targetX: Math.floor(Math.random() * GRID_SIZE),
                targetY: Math.floor(Math.random() * GRID_SIZE),
                isWaiting: false,
                waitTimer: 0,
                flip: false,
                bubbleText: null,
                bubbleTimer: 0
            };
        });
        setWalkers(initialWalkers);
        walkersRef.current = initialWalkers;
    }, [availableHeroes]);

    // Animation loop for walkers
    useEffect(() => {
        const updateWalkers = () => {
            let changed = false;
            const updated = walkersRef.current.map(w => {
                let { x, y, targetX, targetY, isWaiting, waitTimer, flip, bubbleText, bubbleTimer } = w;

                // Handle speech bubble timer
                if (bubbleTimer > 0) {
                    bubbleTimer--;
                    if (bubbleTimer <= 0) {
                        bubbleText = null;
                        changed = true;
                    }
                }

                if (isWaiting) {
                    waitTimer--;
                    if (waitTimer <= 0) {
                        isWaiting = false;
                        // Choose new target coordinate
                        targetX = Math.floor(Math.random() * GRID_SIZE);
                        targetY = Math.floor(Math.random() * GRID_SIZE);
                        flip = targetX < x;
                        changed = true;
                    }
                } else {
                    const dx = targetX - x;
                    const dy = targetY - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 0.05) {
                        // Reached target waypoint
                        x = targetX;
                        y = targetY;
                        isWaiting = true;
                        waitTimer = 60 + Math.floor(Math.random() * 90); // wait for 2-5 seconds (at ~30fps)
                        
                        // Small chance to say something
                        if (Math.random() < 0.2) {
                            bubbleText = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
                            bubbleTimer = 90; // bubble lasts ~3 seconds
                        }
                        changed = true;
                    } else {
                        // Move towards target
                        const speed = 0.025; // units per frame
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
                    bubbleTimer
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
    }, []);

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

    const isPathTile = (x: number, y: number): boolean => {
        return x === 3 || y === 4;
    };

    const placingBuilding = selectedBuildingId ? buildings.find(b => b.id === selectedBuildingId) : null;

    // Grid rendering logic
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            cells.push({ x, y });
        }
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className="overflow-auto max-w-full p-4 bg-stone-955/65 border border-stone-850/80 rounded-2xl custom-scrollbar">
                <div 
                    className="relative bg-emerald-950/40 rounded-xl border-2 border-stone-800/80 overflow-hidden shadow-2xl select-none mx-auto"
                    style={{
                        width: `${GRID_SIZE * CELL_SIZE}px`,
                        height: `${GRID_SIZE * CELL_SIZE}px`,
                    }}
                >
                    {/* Render grid cells background */}
                    {cells.map(({ x, y }) => {
                        const isPath = isPathTile(x, y);
                        const decor = getTileDecoration(x, y);
                        const hasBuilding = !!getBuildingAt(x, y);
                        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;

                        // Calculate highlights for placing a building
                        let cellBg = isPath ? 'bg-stone-750' : 'bg-emerald-900/10';
                        let cellBorder = 'border-stone-900/30';

                        if (placingBuilding && isHovered) {
                            const isValid = canPlaceBuildingAt(placingBuilding, x, y);
                            cellBg = isValid ? 'bg-green-500/35' : 'bg-red-500/35';
                            cellBorder = isValid ? 'border-green-400' : 'border-red-400';
                        } else if (isHovered) {
                            cellBorder = 'border-amber-500 z-10';
                        }

                        return (
                            <div
                                key={`cell-${x}-${y}`}
                                className={`absolute border transition-all duration-155 flex items-center justify-center cursor-pointer ${cellBg} ${cellBorder}`}
                                style={{
                                    left: `${x * CELL_SIZE}px`,
                                    top: `${y * CELL_SIZE}px`,
                                    width: `${CELL_SIZE}px`,
                                    height: `${CELL_SIZE}px`,
                                }}
                                onMouseEnter={() => setHoveredTile({ x, y })}
                                onMouseLeave={() => setHoveredTile(null)}
                                onClick={() => {
                                    if (placingBuilding) {
                                        if (canPlaceBuildingAt(placingBuilding, x, y)) {
                                            placeBuilding(placingBuilding.id, x, y);
                                        }
                                    } else if (!hasBuilding) {
                                        onTileClick(x, y);
                                    }
                                }}
                            >
                                {/* Path texturing / cobblestones */}
                                {isPath && (
                                    <div className="absolute inset-0.5 border border-stone-600/30 rounded bg-stone-700 flex flex-wrap gap-0.5 p-0.5 opacity-60">
                                        <div className="w-1.5 h-1.5 bg-stone-600 rounded-sm"></div>
                                        <div className="w-1.5 h-1.5 bg-stone-800 rounded-sm"></div>
                                        <div className="w-1.5 h-1.5 bg-stone-600 rounded-sm"></div>
                                        <div className="w-1.5 h-1.5 bg-stone-800 rounded-sm"></div>
                                    </div>
                                )}

                                {/* Nature decorations */}
                                {!isPath && decor && !hasBuilding && (
                                    <span className="text-sm opacity-50 filter drop-shadow">{decor}</span>
                                )}

                                {/* Coordinates for hidden tests */}
                                <span className="sr-only opacity-0 absolute pointer-events-none select-none text-[1px]">{x},{y}</span>
                            </div>
                        );
                    })}

                    {/* Render placed buildings */}
                    {buildings.filter(b => b.placed && b.x !== undefined && b.y !== undefined).map(b => {
                        const bWidth = b.width * CELL_SIZE;
                        const bHeight = b.height * CELL_SIZE;
                        const bLeft = b.x! * CELL_SIZE;
                        const bTop = b.y! * CELL_SIZE;

                        return (
                            <div
                                key={`placed-${b.id}`}
                                className="absolute p-0.5 group cursor-pointer transition-all duration-250 hover:scale-95"
                                style={{
                                    left: `${bLeft}px`,
                                    top: `${bTop}px`,
                                    width: `${bWidth}px`,
                                    height: `${bHeight}px`,
                                    zIndex: 20
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBuildingClick(b.id);
                                }}
                            >
                                <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 border-2 border-amber-600/50 rounded-xl flex flex-col items-center justify-center relative shadow-lg group-hover:border-amber-400 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all">
                                    {/* Building Emoji */}
                                    <span className="text-2xl filter drop-shadow select-none group-hover:scale-110 transition-transform duration-300">
                                        {b.emoji}
                                    </span>

                                    {/* Level Badge */}
                                    <div className="absolute -bottom-1 bg-amber-600 text-stone-950 text-[8px] font-black px-1 py-0.5 rounded-md border border-stone-900 shadow-sm leading-none">
                                        L{b.level}
                                    </div>
                                    
                                    {/* Name indicator if large enough */}
                                    {b.width >= 2 && (
                                        <span className="absolute top-1 text-[7px] text-amber-400 font-bold uppercase tracking-wider px-1 text-center truncate max-w-full">
                                            {b.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Ambient / Idle Characters (Town Walkers Layer) */}
                    {walkers.map(w => {
                        const posX = w.x * CELL_SIZE;
                        const posY = w.y * CELL_SIZE;

                        return (
                            <div
                                key={`walker-${w.id}`}
                                className="absolute flex flex-col items-center pointer-events-none select-none transition-all duration-300 ease-linear z-30"
                                style={{
                                    left: `${posX}px`,
                                    top: `${posY}px`,
                                    width: `${CELL_SIZE}px`,
                                    height: `${CELL_SIZE}px`,
                                }}
                            >
                                {/* Tooltip / Badge for Hero Name & Level */}
                                <div className="absolute -top-7 bg-stone-900/90 border border-amber-650/40 px-1 py-0.5 rounded shadow text-[7px] font-bold text-amber-400 flex flex-col items-center pointer-events-none whitespace-nowrap">
                                    <span>{w.name}</span>
                                    <span className="text-[6px] text-stone-400">Lvl {w.level}</span>
                                </div>

                                {/* Speech Bubble Overlay */}
                                {w.bubbleText && (
                                    <div className="absolute -top-16 bg-white border border-stone-300 text-stone-900 text-[8px] font-black px-2 py-1 rounded-lg shadow-md max-w-[120px] text-center leading-tight animate-bounce z-40">
                                        {w.bubbleText}
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-stone-300 rotate-45"></div>
                                    </div>
                                )}

                                {/* Animated Hero Sprite */}
                                <div 
                                    className={`text-2xl mt-1.5 transition-transform duration-300 flex items-center justify-center
                                        ${w.isWaiting ? 'animate-pulse' : 'animate-bounce'}
                                        ${w.flip ? 'scale-x-[-1]' : 'scale-x-[1]'}
                                    `}
                                    style={{
                                        animationDuration: w.isWaiting ? '2s' : '0.6s'
                                    }}
                                >
                                    {w.emoji}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
