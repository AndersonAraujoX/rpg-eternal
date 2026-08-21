import type { RoadTier, RoadTileType } from '../engine/townEngine';

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
 * Returns static or procedural terrain props for open grass tiles.
 */
export function getTileDecoration(x: number, y: number, isRoad: boolean = false): string | null {
    if (isRoad) return null;
    
    const seed = getTileSeed(x, y);
    if (seed < 0.07) return '🌲'; // Pine tree
    if (seed >= 0.07 && seed < 0.12) return '🌳'; // Oak tree
    if (seed >= 0.12 && seed < 0.15) return '🪨'; // Rock
    if (seed >= 0.15 && seed < 0.19) return '🍄'; // Magic Mushroom
    if (seed >= 0.19 && seed < 0.24) return '🌻'; // Flowers
    if (seed >= 0.24 && seed < 0.28) return '🌿'; // Lush Bush
    if (seed >= 0.28 && seed < 0.31) return '⛲'; // Mini Fountain / Well
    if (seed >= 0.31 && seed < 0.34) return '🛖'; // Small Wooden Gazebo / Bench
    return null;
}

/**
 * Returns styling classes and road border colors for specific road tiers.
 */
export function getRoadTierStyle(tier: RoadTier, isNightOrDark: boolean = false) {
    switch (tier) {
        case 'imperial_marble':
            return {
                bg: 'bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300',
                border: 'border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
                accent: 'text-amber-800 font-bold',
                lampEmoji: '✨'
            };
        case 'stone_paved':
            return {
                bg: 'bg-gradient-to-br from-slate-600 via-stone-600 to-slate-700',
                border: 'border-slate-400/70 shadow-sm',
                accent: 'text-stone-200',
                lampEmoji: '🏮'
            };
        case 'cobblestone':
            return {
                bg: 'bg-gradient-to-br from-stone-700 via-stone-750 to-stone-800',
                border: 'border-stone-500/60',
                accent: 'text-stone-300',
                lampEmoji: '🔥'
            };
        case 'dirt':
        default:
            return {
                bg: 'bg-gradient-to-br from-amber-950/70 via-amber-900/50 to-stone-900',
                border: 'border-amber-800/40',
                accent: 'text-amber-600',
                lampEmoji: '🪵'
            };
    }
}
