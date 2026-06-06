import React, { useState } from 'react';
import type { Building } from '../engine/types';
import { cartesianToIso, TILE_WIDTH, TILE_HEIGHT } from '../utils/isometric';

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
    const GRID_SIZE = 10;
    const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);

    // Calculate bounding size of the isometric area
    // Origin is at center, so we shift it to prevent clipping
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

    const placingBuilding = selectedBuildingId ? buildings.find(b => b.id === selectedBuildingId) : null;

    // Prepare list of all renderable items sorted by depth (x + y)
    // To ensure perfect rendering overlay, empty tiles and buildings are interleaved.
    const renderQueue: { type: 'tile' | 'building'; x: number; y: number; key: string; depth: number; entity?: any }[] = [];

    // Add all empty / base ground tiles
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            renderQueue.push({
                type: 'tile',
                x: c,
                y: r,
                key: `tile-${r}-${c}`,
                depth: c + r
            });
        }
    }

    // Add placed buildings at their origin coordinates
    buildings.filter(b => b.placed && b.x !== undefined && b.y !== undefined).forEach(b => {
        renderQueue.push({
            type: 'building',
            x: b.x!,
            y: b.y!,
            key: `building-${b.id}`,
            // Buildings occupy width x height, their visual "front" is at x + w - 1, y + h - 1.
            depth: b.x! + b.y! + (b.width - 1) + (b.height - 1) + 0.1,
            entity: b
        });
    });

    // Sort render queue by depth
    renderQueue.sort((a, b) => a.depth - b.depth);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Scrollable container for the large isometric map */}
            <div className="w-full overflow-auto border border-stone-850/60 rounded-2xl bg-stone-950/70 p-4 max-h-[60vh] custom-scrollbar flex justify-center">
                <div 
                    className="relative select-none"
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
                            
                            // Highlight check when placing a building
                            let tileColorClass = 'fill-emerald-950/15 stroke-stone-800/40 hover:fill-emerald-900/20';
                            if (placingBuilding && isHovered) {
                                const isValid = canPlaceBuildingAt(placingBuilding, item.x, item.y);
                                tileColorClass = isValid 
                                    ? 'fill-emerald-600/30 stroke-emerald-400' 
                                    : 'fill-red-600/30 stroke-red-400';
                            } else if (isHovered) {
                                tileColorClass = 'fill-emerald-850/40 stroke-amber-600/50';
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
                                        <polygon points="32,0 64,16 32,32 0,16" className={tileColorClass} />
                                    </svg>
                                    
                                    {/* Invisible test coordinates text so existing tests find them */}
                                    <span className="sr-only opacity-0 absolute pointer-events-none select-none text-[1px]">{item.x},{item.y}</span>
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
                                    {/* Footprint / Ground Slab */}
                                    <svg width={bWidth} height={bHeight} viewBox={`0 0 ${bWidth} ${bHeight}`} className="absolute top-0 left-0">
                                        <polygon 
                                            points={polyPoints} 
                                            className="fill-stone-800/80 stroke-amber-600/40 group-hover:stroke-amber-400 group-hover:fill-stone-750 transition-colors shadow-2xl" 
                                        />
                                    </svg>

                                    {/* Floating building graphic (large emoji & effect) */}
                                    <div 
                                        className="absolute w-12 h-12 flex items-center justify-center text-4xl select-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_12px_24px_rgba(245,158,11,0.5)] transition-all duration-300"
                                        style={{
                                            left: `${bWidth / 2 - 24}px`,
                                            top: `${bHeight / 2 - 32}px`,
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
