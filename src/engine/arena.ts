import type { ArenaOpponent } from './types';

// ─────────────────────────────────────────────────────────────
// Unique counter to avoid Date.now() collisions
// ─────────────────────────────────────────────────────────────

let _counter = 0;
const uid = () => `${Date.now()}-${++_counter}`;

// ─────────────────────────────────────────────────────────────
// Name pools
// ─────────────────────────────────────────────────────────────

const ARENA_FIRST_NAMES = [
    'Kai', 'Zara', 'Vex', 'Luna', 'Drak', 'Sora', 'Mira',
    'Theron', 'Kira', 'Ryx', 'Nyx', 'Oryn', 'Bela', 'Jorak',
    'Tyra', 'Brand', 'Sera', 'Ulrik', 'Xiara', 'Zeth',
    'Cael', 'Vora', 'Drex', 'Nyxa', 'Rikar', 'Sylra', 'Thax',
];

const ARENA_TITLES = [
    'o Impiedoso', 'a Vingativa', 'Punho de Ferro', 'das Sombras',
    'o Implacável', 'a Feroz', 'Lâmina Negra', 'o Cruel',
    'Corta-Tudo', 'a Invencível', 'o Terrível', 'a Sanguinária',
    'Coração de Gelo', 'o Devorador', 'da Morte', 'o Imparável',
];

const ARENA_AVATARS_BY_TIER: Record<string, string[]> = {
    easy: ['🧙', '🏹', '🗡️', '⚔️', '🛡️', '🎯', '🪃'],
    normal: ['🔥', '💫', '⚡', '🌊', '🍃', '🌀', '💥'],
    hard: ['💀', '👹', '😈', '🦂', '🐉', '👁️', '🪦'],
};

export const ARENA_CLASSES = [
    'Guerreiro', 'Mago', 'Ladino', 'Paladino', 'Caçador',
    'Necromante', 'Berserker', 'Feiticeiro', 'Dragoon', 'Monge',
];

// ─────────────────────────────────────────────────────────────
// Tier definition
// ─────────────────────────────────────────────────────────────

export type ArenaTier = 'easy' | 'normal' | 'hard';

export const ARENA_TIER_CONFIG: Record<ArenaTier, {
    powerMin: number;
    powerMax: number;
    rankOffset: number;
    label: string;
    xpMult: number;
}> = {
    easy: { powerMin: 0.5, powerMax: 0.8, rankOffset: -30, label: 'Fácil', xpMult: 0.7 },
    normal: { powerMin: 0.85, powerMax: 1.15, rankOffset: 0, label: 'Normal', xpMult: 1.0 },
    hard: { powerMin: 1.2, powerMax: 1.8, rankOffset: 30, label: 'Difícil', xpMult: 1.5 },
};

// ─────────────────────────────────────────────────────────────
// Core generation
// ─────────────────────────────────────────────────────────────

/**
 * Generates a single arena opponent of given tier, ensuring unique name from the exclusion set.
 */
export const generateArenaOpponent = (
    partyPower: number,
    arenaRank: number,
    tier: ArenaTier,
    index: number = 0,
    usedNames: Set<string> = new Set()
): ArenaOpponent => {
    const config = ARENA_TIER_CONFIG[tier];
    const powerFactor = config.powerMin + Math.random() * (config.powerMax - config.powerMin);
    const avatarPool = ARENA_AVATARS_BY_TIER[tier];

    // Pick a unique name not already used in this board
    let name: string;
    let attempts = 0;
    do {
        const firstName = ARENA_FIRST_NAMES[Math.floor(Math.random() * ARENA_FIRST_NAMES.length)];
        const hasTitle = Math.random() < 0.45;
        const title = hasTitle ? ` ${ARENA_TITLES[Math.floor(Math.random() * ARENA_TITLES.length)]}` : '';
        name = `${firstName}${title}`;
        attempts++;
    } while (usedNames.has(name) && attempts < 20);

    usedNames.add(name);

    return {
        id: `arena-${tier}-${uid()}-${index}`,
        name,
        avatar: avatarPool[Math.floor(Math.random() * avatarPool.length)],
        rank: Math.max(1, arenaRank + config.rankOffset + Math.floor(Math.random() * 20) - 10),
        power: Math.max(1, Math.floor(partyPower * powerFactor)),
    };
};

/**
 * Generates a full board of 3 opponents (easy, normal, hard) with unique names.
 */
export const generateInitialArenaBoard = (partyPower: number, arenaRank: number): ArenaOpponent[] => {
    const usedNames = new Set<string>();
    return (['easy', 'normal', 'hard'] as ArenaTier[]).map((tier, i) =>
        generateArenaOpponent(partyPower, arenaRank, tier, i, usedNames)
    );
};

/**
 * Calculates the win chance of the player against an opponent.
 * Lanchester formula: partyPower / (partyPower + opPower + 1).
 */
export const calculateWinChance = (partyPower: number, opponentPower: number): number => {
    return partyPower / (partyPower + opponentPower + 1);
};

/**
 * Returns a difficulty label and color based on win chance.
 */
export const getArenaDifficultyLabel = (winChance: number): { label: string; color: string } => {
    if (winChance >= 0.75) return { label: '✅ Fácil', color: 'text-green-400' };
    if (winChance >= 0.55) return { label: '🟡 Normal', color: 'text-yellow-400' };
    if (winChance >= 0.40) return { label: '🔶 Difícil', color: 'text-orange-400' };
    return { label: '☠️ Suicida', color: 'text-red-400' };
};

/**
 * Applies a moderate growth multiplier to remaining opponents after a victory.
 * The defeated opponent is removed by this function.
 */
export const applyVictoryGrowth = (opponents: ArenaOpponent[], defeatedId: string): ArenaOpponent[] => {
    const growthFactor = 1.05 + Math.random() * 0.45; // 1.05x – 1.50x
    return opponents
        .filter(op => op.id !== defeatedId)
        .map(op => ({ ...op, power: Math.floor(op.power * growthFactor) }));
};

/**
 * Spawns a replacement opponent whose tier mirrors the defeated opponent's relative power.
 */
export const spawnReplacementOpponent = (
    partyPower: number,
    arenaRank: number,
    defeatedPower: number,
    usedNames: Set<string> = new Set()
): ArenaOpponent => {
    const ratio = defeatedPower / (partyPower || 1);
    const tier: ArenaTier =
        ratio < 0.85 ? 'easy' :
            ratio < 1.2 ? 'normal' : 'hard';
    return generateArenaOpponent(partyPower, arenaRank, tier, _counter, usedNames);
};
