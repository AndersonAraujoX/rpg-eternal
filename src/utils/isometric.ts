export interface Point2D {
    x: number;
    y: number;
}

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

/**
 * Projects 2D Cartesian coordinates (x, y) to Isometric screen coordinates.
 */
export function cartesianToIso(x: number, y: number): Point2D {
    return {
        x: (x - y) * (TILE_WIDTH / 2),
        y: (x + y) * (TILE_HEIGHT / 2)
    };
}

/**
 * Projects Isometric screen coordinates back to Cartesian (x, y) coordinates.
 */
export function isoToCartesian(isoX: number, isoY: number): Point2D {
    const halfWidth = TILE_WIDTH / 2;
    const halfHeight = TILE_HEIGHT / 2;
    return {
        x: (isoX / halfWidth + isoY / halfHeight) / 2,
        y: (isoY / halfHeight - isoX / halfWidth) / 2
    };
}

/**
 * Simple hash function to get deterministic pseudo-random values.
 */
export function getTileSeed(x: number, y: number): number {
    const hash = (x * 127 + y * 269) % 1000;
    return hash / 1000;
}

/**
 * Returns a static decoration character or null for a given coordinate.
 */
export function getTileDecoration(x: number, y: number): string | null {
    // Cobblestone path coordinates won't have decorations
    if (x === 3 || y === 4) return null;
    
    const seed = getTileSeed(x, y);
    if (seed < 0.08) return '🌲'; // Pine tree
    if (seed >= 0.08 && seed < 0.13) return '🌳'; // Oak tree
    if (seed >= 0.13 && seed < 0.16) return '🪨'; // Rock
    if (seed >= 0.16 && seed < 0.20) return '🍄'; // Mushroom
    if (seed >= 0.20 && seed < 0.25) return '🌻'; // Flowers
    if (seed >= 0.25 && seed < 0.28) return '🌿'; // Bush
    return null;
}
