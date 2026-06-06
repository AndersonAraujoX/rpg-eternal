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
