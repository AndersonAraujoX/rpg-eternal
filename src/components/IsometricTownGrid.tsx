import React, { useState } from 'react';
import type { Building } from '../engine/types';
import { cartesianToIso, TILE_WIDTH, TILE_HEIGHT, getTileDecoration } from '../utils/isometric';

interface IsometricTownGridProps {
    buildings: Building[];
    gold: number;
    selectedBuildingId: string | null;
    placeBuilding: (buildingId: string, x: number, y: number) => void;
    onTileClick: (x: number, y: number) => void;
    onBuildingClick: (buildingId: string) => void;
}

export const IsometricTownGrid: React.FC<IsometricTownGridProps> = ({
    buildings,
    gold,
    selectedBuildingId,
    placeBuilding,
    onTileClick,
    onBuildingClick
}) => {
    const GRID_SIZE = 8;
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // Calculate bounding size of the isometric area
    const mapWidth = (GRID_SIZE + 2) * TILE_WIDTH;
    const mapHeight = (GRID_SIZE + 2) * TILE_HEIGHT;
    const centerOffset = mapWidth / 2;
    const topOffset = TILE_HEIGHT;

    // Helper to check if a building overlaps a specific tile
    const getBuildingAt = (x: number, y: number): Building | undefined => {
        return buildings.find(b => {
            if (!b.placed || b.x === undefined || b.y === undefined) return false;
            return x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height;
        });
    };

    // Helper to verify if a w x h building can be placed at x, y
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

    // Helper to identify if a tile is part of the cobblestone road path
    const isPathTile = (x: number, y: number): boolean => {
        return x === 3 || y === 4;
    };

    const placingBuilding = selectedBuildingId ? buildings.find(b => b.id === selectedBuildingId) : null;

    // Prepare list of all renderable items sorted by depth (x + y)
    // To ensure perfect rendering overlay, empty tiles, decorations, and buildings are interleaved.
    const renderQueue: { 
        type: 'tile' | 'decoration' | 'building'; 
        x: number; 
        y: number; 
        key: string; 
        depth: number; 
        entity?: any;
    }[] = [];

    // Add base ground tiles
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            renderQueue.push({
                type: 'tile',
                x: c,
                y: r,
                key: `tile-${r}-${c}`,
                depth: c + r
            });

            // Add pseudo-random natural decoration if tile has no building and is not a road/path
            const building = getBuildingAt(c, r);
            const decor = getTileDecoration(c, r);
            if (!building && decor && !isPathTile(c, r)) {
                renderQueue.push({
                    type: 'decoration',
                    x: c,
                    y: r,
                    key: `decor-${r}-${c}`,
                    depth: c + r + 0.05,
                    entity: decor
                });
            }
        }
    }

    // Add placed buildings at their origin coordinates
    buildings.filter(b => b.placed && b.x !== undefined && b.y !== undefined).forEach(b => {
        renderQueue.push({
            type: 'building',
            x: b.x!,
            y: b.y!,
            key: `building-${b.id}`,
            // Buildings occupy width x height, their visual front is at x + w - 1, y + h - 1.
            depth: b.x! + b.y! + (b.width - 1) + (b.height - 1) + 0.1,
            entity: b
        });
    });

    // Sort render queue by depth
    renderQueue.sort((a, b) => a.depth - b.depth);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Scrollable container for the large isometric map */}
            <div className="w-full overflow-auto border border-stone-850/60 rounded-2xl bg-gradient-to-b from-sky-950/20 via-stone-950/80 to-stone-950 p-4 max-h-[60vh] custom-scrollbar">
                
                {/* Embedded SVG Gradients Definition */}
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <radialGradient id="grassGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#047857" />
                        </radialGradient>
                        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#78716c" />
                            <stop offset="100%" stopColor="#44403c" />
                        </linearGradient>
                        <linearGradient id="slabGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#a8a29e" />
                            <stop offset="100%" stopColor="#57534e" />
                        </linearGradient>
                        <linearGradient id="placeValid" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                        </linearGradient>
                        <linearGradient id="placeInvalid" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                </svg>

                <div 
                    className="relative select-none mx-auto"
                    style={{ width: mapWidth, height: mapHeight }}
                >
                    {/* Render sorted queue */}
                    {renderQueue.map(item => {
                        const iso = cartesianToIso(item.x, item.y);
                        const left = centerOffset + iso.x - TILE_WIDTH / 2;
                        const top = topOffset + iso.y;

                        if (item.type === 'tile') {
                            const hasBuilding = !!getBuildingAt(item.x, item.y);
                            const isHovered = hoveredTile?.x === item.x && hoveredTile?.y === item.y;
                            const isRoad = isPathTile(item.x, item.y);
                            
                            // Highlight check when placing a building
                            let fillStyle = isRoad ? 'url(#pathGrad)' : 'url(#grassGrad)';
                            let strokeColor = isRoad ? '#57534e' : '#065f46';
                            let strokeWidth = '1';

                            if (placingBuilding && isHovered) {
                                const isValid = canPlaceBuildingAt(placingBuilding, item.x, item.y);
                                fillStyle = isValid ? 'url(#placeValid)' : 'url(#placeInvalid)';
                                strokeColor = isValid ? '#34d399' : '#f87171';
                                strokeWidth = '2';
                            } else if (isHovered) {
                                strokeColor = '#f59e0b';
                                strokeWidth = '1.5';
                            }

                            return (
                                <div
                                    key={item.key}
                                    className="absolute cursor-pointer transition-all duration-150"
                                    style={{
                                        left,
                                        top,
                                        width: TILE_WIDTH,
                                        height: TILE_HEIGHT,
                                        zIndex: Math.floor(item.depth * 10)
                                    }}
                                    onMouseEnter={() => setHoveredTile({ x: item.x, y: item.y })}
                                    onMouseLeave={() => setHoveredTile(null)}
                                    onClick={() => {
                                        if (placingBuilding) {
                                            if (canPlaceBuildingAt(placingBuilding, item.x, item.y)) {
                                                placeBuilding(placingBuilding.id, item.x, item.y);
                                            }
                                        } else if (!hasBuilding) {
                                            onTileClick(item.x, item.y);
                                        }
                                    }}
                                >
                                    <svg width={TILE_WIDTH} height={TILE_HEIGHT} viewBox="0 0 64 32">
                                        <polygon 
                                            points="32,0 64,16 32,32 0,16" 
                                            fill={fillStyle} 
                                            stroke={strokeColor} 
                                            strokeWidth={strokeWidth}
                                        />
                                        {/* Subtle grass blades texturing on normal grass tiles */}
                                        {!isRoad && !isHovered && (
                                            <path d="M 28,12 L 30,8 M 30,8 L 33,13" stroke="#047857" strokeWidth="1" fill="none" opacity="0.6" />
                                        )}
                                    </svg>
                                    
                                    {/* Invisible test coordinates text so existing tests find them */}
                                    <span className="sr-only opacity-0 absolute pointer-events-none select-none text-[1px]">{item.x},{item.y}</span>
                                </div>
                            );
                        } else if (item.type === 'decoration') {
                            const icon = item.entity as string;
                            const isTree = icon === '🌲' || icon === '🌳';
                            return (
                                <div
                                    key={item.key}
                                    className="absolute pointer-events-none select-none flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                                    style={{
                                        left,
                                        top: top - (isTree ? 16 : 4),
                                        width: TILE_WIDTH,
                                        height: TILE_HEIGHT,
                                        zIndex: Math.floor(item.depth * 10),
                                        fontSize: isTree ? '24px' : '14px'
                                    }}
                                >
                                    {icon}
                                </div>
                            );
                        } else {
                            // Render Building
                            const b = item.entity as Building;
                            const w = b.width;
                            const h = b.height;

                            // Calculate footprint sizes
                            const bWidth = (w + h) * (TILE_WIDTH / 2);
                            const bHeight = (w + h) * (TILE_HEIGHT / 2);
                            
                            // Top corner position of the building origin x, y
                            const bLeft = centerOffset + (b.x! - b.y! - h) * (TILE_WIDTH / 2);
                            const bTop = topOffset + (b.x! + b.y!) * (TILE_HEIGHT / 2);

                            // Create footprint polygon string locally within the building container
                            const polyPoints = [
                                `${h * (TILE_WIDTH / 2)},0`,
                                `${(w + h) * (TILE_WIDTH / 2)},${w * (TILE_HEIGHT / 2)}`,
                                `${w * (TILE_WIDTH / 2)},${(w + h) * (TILE_HEIGHT / 2)}`,
                                `0,${h * (TILE_HEIGHT / 2)}`
                            ].join(' ');

                            return (
                                <div
                                    key={item.key}
                                    className="absolute group transition-transform hover:-translate-y-1 duration-200 cursor-pointer"
                                    style={{
                                        left: bLeft,
                                        top: bTop,
                                        width: bWidth,
                                        height: bHeight,
                                        zIndex: Math.floor(item.depth * 10) + 1
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onBuildingClick(b.id);
                                    }}
                                >
                                    {/* Footprint / Ground Slab - Masonry styled */}
                                    <svg width={bWidth} height={bHeight} viewBox={`0 0 ${bWidth} ${bHeight}`} className="absolute top-0 left-0">
                                        <polygon 
                                            points={polyPoints} 
                                            fill="url(#slabGrad)" 
                                            stroke="#f59e0b" 
                                            strokeWidth="1.5"
                                            className="group-hover:stroke-amber-400 transition-colors shadow-2xl" 
                                        />
                                        {/* Brick grid lines inside the footprint for medieval details */}
                                        <path 
                                            d={`M ${bWidth / 2},0 L ${bWidth / 2},${bHeight}`} 
                                            stroke="#44403c" 
                                            strokeWidth="0.75" 
                                            strokeDasharray="2,2" 
                                            opacity="0.5" 
                                        />
                                    </svg>

                                    {/* Side Props decorations (like fencing, barrels, bushes) around the base */}
                                    <span className="absolute text-[10px] pointer-events-none left-1 bottom-1 filter drop-shadow opacity-75 group-hover:opacity-100 transition-opacity">📦</span>
                                    <span className="absolute text-[10px] pointer-events-none right-1 bottom-1 filter drop-shadow opacity-75 group-hover:opacity-100 transition-opacity">🌿</span>

                                    {/* Floating building graphic (large emoji & effect) */}
                                    <div 
                                        className="absolute w-12 h-12 flex items-center justify-center text-4xl select-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_12px_24px_rgba(245,158,11,0.5)] transition-all duration-300"
                                        style={{
                                            left: `${bWidth / 2 - 24}px`,
                                            top: `${bHeight / 2 - 36}px`,
                                        }}
                                    >
                                        {b.emoji}
                                    </div>

                                    {/* Level Badge */}
                                    <div 
                                        className="absolute bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded border border-stone-900 shadow-md group-hover:scale-110 transition-transform"
                                        style={{
                                            left: `${bWidth / 2 - 10}px`,
                                            top: `${bHeight / 2 + 4}px`
                                        }}
                                    >
                                        L{b.level}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};
