export interface PrestigeNode {
    id: string;
    name: string;
    description: string;
    icon: string;
    baseCost: number; // Base souls cost at level 0→1
    maxLevel: number;
    effect: string;
    row: number;
    col: number;
    requires?: string;
}

export const PRESTIGE_NODES: PrestigeNode[] = [
    // Row 0 - Base
    { id: 'atk_1', name: 'Força das Almas', description: '+10% de Ataque por nível', icon: '⚔️', baseCost: 1, maxLevel: 10, effect: '+10% ATQ', row: 0, col: 1 },
    { id: 'hp_1', name: 'Vitalidade Eterna', description: '+10% de Vida Máxima por nível', icon: '❤️', baseCost: 1, maxLevel: 10, effect: '+10% HP', row: 0, col: 3 },
    { id: 'gold_1', name: 'Ambição do Renascido', description: '+15% de Ouro por nível', icon: '🪙', baseCost: 1, maxLevel: 10, effect: '+15% Ouro', row: 0, col: 2 },
    // Row 1 - Mid
    { id: 'atk_2', name: 'Alma Feroz', description: '+20% de Dano Crítico por nível', icon: '🔥', baseCost: 3, maxLevel: 5, effect: '+20% CRIT', row: 1, col: 1, requires: 'atk_1' },
    { id: 'hp_2', name: 'Sangue de Titã', description: '+30% de HP e regeneração', icon: '🛡️', baseCost: 3, maxLevel: 5, effect: '+30% HP+Regen', row: 1, col: 3, requires: 'hp_1' },
    { id: 'xp_1', name: 'Sabedoria Ancestral', description: '+25% de XP ganho por nível', icon: '📚', baseCost: 2, maxLevel: 8, effect: '+25% XP', row: 1, col: 2, requires: 'gold_1' },
    // Row 2 - Advanced
    { id: 'speed_1', name: 'Velocidade do Espírito', description: '+5% de velocidade de ataque', icon: '⚡', baseCost: 5, maxLevel: 5, effect: '+5% Vel.', row: 2, col: 1, requires: 'atk_2' },
    { id: 'souls_1', name: 'Coletor de Almas', description: '+20% de Almas ao renascer', icon: '👻', baseCost: 5, maxLevel: 5, effect: '+20% Almas', row: 2, col: 2, requires: 'xp_1' },
    { id: 'boss_1', name: 'Caçador de Chefes', description: '+50% de Ouro ao derrotar boss', icon: '💀', baseCost: 5, maxLevel: 5, effect: '+50% Boss Ouro', row: 2, col: 3, requires: 'hp_2' },
    // Row 3 - Legendary
    { id: 'legend_1', name: 'Lenda Imortal', description: 'Heróis começam no Nível 5 após renascer', icon: '🌟', baseCost: 15, maxLevel: 3, effect: 'Heróis Lvl 5+', row: 3, col: 2, requires: 'souls_1' },
];

/** Cost for upgrading a node from currentLevel → currentLevel+1. Scales ×1.6 per level. */
export const getPrestigeNodeCost = (node: PrestigeNode, currentLevel: number): number => {
    return Math.ceil(node.baseCost * Math.pow(1.6, currentLevel));
};
