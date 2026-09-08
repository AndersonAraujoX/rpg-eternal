import type { Building } from './types';

export type ProgressionBranch = 'main' | 'left' | 'right';

export interface ProgressionGameState {
    bossLevel?: number;
    highestFloor?: number;
    voidAscensions?: number;
    buildings?: Building[];
    outerSpaceUnlocked?: boolean;
    riftsUnlocked?: boolean;
    backroomsUnlockedTechs?: string[];
    backroomsFloor?: number;
    hasGuild?: boolean;
    guildLevel?: number;
    mobaWarActive?: boolean;
    playerTerritoriesCount?: number;
    industryUnlocked?: boolean;
}

export interface ProgressionNode {
    id: string;
    featureId?: string;
    name: string;
    shortName: string;
    description: string;
    icon: string;
    branch: ProgressionBranch;
    parentId?: string | null;
    unlockRequirementText: string;
    checkUnlocked: (state: ProgressionGameState) => boolean;
    getProgress: (state: ProgressionGameState) => { current: number; max: number; percentage: number };
    navigationTarget?: string; // Modal or screen trigger
}

export interface EvaluatedProgressionNode extends ProgressionNode {
    isUnlocked: boolean;
    isParentUnlocked: boolean;
    progress: { current: number; max: number; percentage: number };
    status: 'unlocked' | 'in_progress' | 'locked';
}

/**
 * Definição dos nós da Árvore de Progressão do RPG Eternal
 * Linha Superior (Fluxo Principal): Torre infinita → Vila → Boss mundial
 * Ramificação Esquerda: Vila → Guildas → GVG / Conquista do andar
 * Ramificação Direita: Vila → Backroom → Conquista do andar / Tecnologia → Indústria → Galáxia
 */
export const PROGRESSION_NODES: ProgressionNode[] = [
    // ==========================================
    // LINHA SUPERIOR (FLUXO PRINCIPAL)
    // ==========================================
    {
        id: 'tower',
        featureId: 'tower',
        name: 'Torre da Eternidade',
        shortName: 'Torre Infinita',
        description: 'Enfrente andares infinitos de monstros por ouro, glória e ascensão.',
        icon: '🏰',
        branch: 'main',
        parentId: null,
        unlockRequirementText: 'Disponível no início',
        navigationTarget: 'tower',
        checkUnlocked: () => true,
        getProgress: (state) => {
            const current = Math.max(1, state.highestFloor ?? 1);
            return { current, max: current, percentage: 100 };
        }
    },
    {
        id: 'town',
        featureId: 'town',
        name: 'Vila da Aliança',
        shortName: 'Vila',
        description: 'Centro de civilização, construções estratégicas e economia do reino.',
        icon: '🏡',
        branch: 'main',
        parentId: 'tower',
        unlockRequirementText: 'Alcançar Andar 10 na Torre ou Chefe Nv. 10',
        navigationTarget: 'town',
        checkUnlocked: (state) => {
            const floor = state.highestFloor ?? 1;
            const boss = state.bossLevel ?? 0;
            return floor >= 10 || boss >= 10;
        },
        getProgress: (state) => {
            const floor = Math.max(0, state.highestFloor ?? 1);
            const boss = Math.max(0, state.bossLevel ?? 0);
            const current = Math.min(10, Math.max(floor, boss));
            return { current, max: 10, percentage: Math.floor((current / 10) * 100) };
        }
    },
    {
        id: 'world_boss',
        featureId: 'world_boss',
        name: 'Reide de Chefe Mundial',
        shortName: 'Boss Mundial',
        description: 'Confronte Titãs Colossais com todo o poder acumulado da sua guilda e vila.',
        icon: '👹',
        branch: 'main',
        parentId: 'town',
        unlockRequirementText: 'Vila Ativa + Atingir Chefe Nv. 150',
        navigationTarget: 'world_boss',
        checkUnlocked: (state) => {
            const townUnlocked = (state.highestFloor ?? 1) >= 10 || (state.bossLevel ?? 0) >= 10;
            const boss = state.bossLevel ?? 0;
            return townUnlocked && boss >= 150;
        },
        getProgress: (state) => {
            const boss = Math.max(0, state.bossLevel ?? 0);
            const current = Math.min(150, boss);
            return { current, max: 150, percentage: Math.floor((current / 150) * 100) };
        }
    },

    // ==========================================
    // RAMIFICAÇÃO ESQUERDA (A PARTIR DE VILA)
    // ==========================================
    {
        id: 'guilds',
        featureId: 'guild_hall',
        name: 'Sede da Guilda',
        shortName: 'Guildas',
        description: 'Reúna guerreiros lendários, construa monumentos e lidere sua aliança.',
        icon: '🛡️',
        branch: 'left',
        parentId: 'town',
        unlockRequirementText: 'Vila Ativa + Andar 80 da Torre ou Salão de Guilda',
        navigationTarget: 'guild',
        checkUnlocked: (state) => {
            const townUnlocked = (state.highestFloor ?? 1) >= 10 || (state.bossLevel ?? 0) >= 10;
            if (!townUnlocked) return false;
            const hasHall = (state.buildings ?? []).some(b => b.id === 'guild_hall' && b.level > 0);
            const floor = state.highestFloor ?? 1;
            return hasHall || floor >= 80 || (state.hasGuild === true);
        },
        getProgress: (state) => {
            const floor = Math.max(0, state.highestFloor ?? 1);
            const current = Math.min(80, floor);
            return { current, max: 80, percentage: Math.floor((current / 80) * 100) };
        }
    },
    {
        id: 'gvg',
        featureId: 'guild_war',
        name: 'Guerra de Guildas (GVG)',
        shortName: 'GVG',
        description: 'Batalha MOBA e captura de bandeira em tempo real contra guildas rivais.',
        icon: '⚔️',
        branch: 'left',
        parentId: 'guilds',
        unlockRequirementText: 'Guilda Desbloqueada + Convocação de Guerra',
        navigationTarget: 'guild_war',
        checkUnlocked: (state) => {
            const guildsUnlocked = PROGRESSION_NODES.find(n => n.id === 'guilds')?.checkUnlocked(state) ?? false;
            return guildsUnlocked;
        },
        getProgress: (state) => {
            const isUnlocked = PROGRESSION_NODES.find(n => n.id === 'guilds')?.checkUnlocked(state) ?? false;
            return { current: isUnlocked ? 1 : 0, max: 1, percentage: isUnlocked ? 100 : 0 };
        }
    },
    {
        id: 'guild_conquest',
        featureId: 'guild_territories',
        name: 'Conquista de Andar da Guilda',
        shortName: 'Conquista do Andar',
        description: 'Domine territórios no mapa estratégico e expanda a influência da guilda.',
        icon: '🚩',
        branch: 'left',
        parentId: 'guilds',
        unlockRequirementText: 'Guilda Desbloqueada + Mapa de Territórios',
        navigationTarget: 'guild_war',
        checkUnlocked: (state) => {
            const guildsUnlocked = PROGRESSION_NODES.find(n => n.id === 'guilds')?.checkUnlocked(state) ?? false;
            return guildsUnlocked;
        },
        getProgress: (state) => {
            const count = state.playerTerritoriesCount ?? 0;
            const current = Math.min(5, count);
            const guildsUnlocked = PROGRESSION_NODES.find(n => n.id === 'guilds')?.checkUnlocked(state) ?? false;
            return {
                current: guildsUnlocked ? current : 0,
                max: 5,
                percentage: guildsUnlocked ? Math.floor((current / 5) * 100) : 0
            };
        }
    },

    // ==========================================
    // RAMIFICAÇÃO DIREITA (A PARTIR DE VILA)
    // ==========================================
    {
        id: 'backroom',
        featureId: 'backrooms_manager',
        name: 'Posto Avançado Backroom (M.E.G.)',
        shortName: 'Backroom',
        description: 'Explore as salas liminares misteriosas e resgate tecnologias anômalas.',
        icon: '🏢',
        branch: 'right',
        parentId: 'town',
        unlockRequirementText: 'Vila Ativa + Posto M.E.G. (Chefe Nv. 30)',
        navigationTarget: 'backrooms',
        checkUnlocked: (state) => {
            const townUnlocked = (state.highestFloor ?? 1) >= 10 || (state.bossLevel ?? 0) >= 10;
            if (!townUnlocked) return false;
            const hasOutpost = (state.buildings ?? []).some(b => b.id === 'backrooms_manager' && b.level > 0);
            const boss = state.bossLevel ?? 0;
            return hasOutpost || boss >= 30;
        },
        getProgress: (state) => {
            const boss = Math.max(0, state.bossLevel ?? 0);
            const current = Math.min(30, boss);
            return { current, max: 30, percentage: Math.floor((current / 30) * 100) };
        }
    },
    {
        id: 'backrooms_conquest',
        featureId: 'backrooms_floors',
        name: 'Conquista de Andares Liminares',
        shortName: 'Conquista do Andar',
        description: 'Desbrave e domine níveis perigosos (Nível 0 ao Nível 8) das Backrooms.',
        icon: '🚪',
        branch: 'right',
        parentId: 'backroom',
        unlockRequirementText: 'Backroom Desbloqueada + Expedição de Andares',
        navigationTarget: 'backrooms',
        checkUnlocked: (state) => {
            const backroomUnlocked = PROGRESSION_NODES.find(n => n.id === 'backroom')?.checkUnlocked(state) ?? false;
            return backroomUnlocked;
        },
        getProgress: (state) => {
            const backroomUnlocked = PROGRESSION_NODES.find(n => n.id === 'backroom')?.checkUnlocked(state) ?? false;
            const floor = state.backroomsFloor ?? 1;
            const current = Math.min(8, Math.max(1, floor));
            return {
                current: backroomUnlocked ? current : 0,
                max: 8,
                percentage: backroomUnlocked ? Math.floor((current / 8) * 100) : 0
            };
        }
    },
    {
        id: 'backrooms_tech',
        featureId: 'backrooms_tech',
        name: 'Tecnologia M.E.G.',
        shortName: 'Tecnologia',
        description: 'Laboratório científico com matriz de pesquisa de ponta e nanociência.',
        icon: '🔬',
        branch: 'right',
        parentId: 'backroom',
        unlockRequirementText: 'Backroom Desbloqueada + Pesquisa Científica',
        navigationTarget: 'backrooms',
        checkUnlocked: (state) => {
            const backroomUnlocked = PROGRESSION_NODES.find(n => n.id === 'backroom')?.checkUnlocked(state) ?? false;
            return backroomUnlocked;
        },
        getProgress: (state) => {
            const backroomUnlocked = PROGRESSION_NODES.find(n => n.id === 'backroom')?.checkUnlocked(state) ?? false;
            const techCount = (state.backroomsUnlockedTechs ?? []).length;
            const current = Math.min(5, techCount);
            return {
                current: backroomUnlocked ? current : 0,
                max: 5,
                percentage: backroomUnlocked ? Math.floor((current / 5) * 100) : 0
            };
        }
    },
    {
        id: 'industry',
        featureId: 'industry',
        name: 'Complexo Industrial & Automação',
        shortName: 'Indústria',
        description: 'Linhas de montagem, fundições pesadas e manufatura de ponta.',
        icon: '🏭',
        branch: 'right',
        parentId: 'backrooms_tech',
        unlockRequirementText: 'Tecnologia M.E.G. + Construção Industrial na Vila',
        navigationTarget: 'industry',
        checkUnlocked: (state) => {
            const techUnlocked = PROGRESSION_NODES.find(n => n.id === 'backrooms_tech')?.checkUnlocked(state) ?? false;
            if (!techUnlocked) return false;
            const hasTech = (state.backroomsUnlockedTechs ?? []).some(t =>
                t === 'dimensional_science_pack' || t === 'tech_automation_1' || t === 'alchemical_distill'
            );
            const hasIndustryBuilding = (state.buildings ?? []).some(b => b.id === 'industry' && b.level > 0);
            const floor = state.highestFloor ?? 1;
            return hasIndustryBuilding || hasTech || floor >= 50 || state.industryUnlocked === true;
        },
        getProgress: (state) => {
            const techUnlocked = PROGRESSION_NODES.find(n => n.id === 'backrooms_tech')?.checkUnlocked(state) ?? false;
            const floor = Math.max(0, state.highestFloor ?? 1);
            const current = Math.min(50, floor);
            return {
                current: techUnlocked ? current : 0,
                max: 50,
                percentage: techUnlocked ? Math.floor((current / 50) * 100) : 0
            };
        }
    },
    {
        id: 'galaxy',
        featureId: 'outer_space',
        name: 'Conquista Galáctica (Espaço Sideral)',
        shortName: 'Galáxia',
        description: 'Voe pelo cosmos, colonize sistemas estelares e forje naves capitânia.',
        icon: '🪐',
        branch: 'right',
        parentId: 'industry',
        unlockRequirementText: 'Indústria Ativa + Pesquisa de Dobra Espacial (Space Tech)',
        navigationTarget: 'galaxy',
        checkUnlocked: (state) => {
            const industryUnlocked = PROGRESSION_NODES.find(n => n.id === 'industry')?.checkUnlocked(state) ?? false;
            if (!industryUnlocked) return false;
            const hasWarp = (state.backroomsUnlockedTechs ?? []).some(t => t === 'space_warp' || t === 'space_tech');
            const boss = state.bossLevel ?? 0;
            return state.outerSpaceUnlocked === true || hasWarp || boss >= 100;
        },
        getProgress: (state) => {
            if (state.outerSpaceUnlocked) return { current: 1, max: 1, percentage: 100 };
            const boss = Math.max(0, state.bossLevel ?? 0);
            const current = Math.min(100, boss);
            return { current, max: 100, percentage: Math.floor((current / 100) * 100) };
        }
    }
];

/**
 * Avalia o estado de um nó específico da progressão com tratamento defensivo
 */
export function evaluateProgressionNode(
    node: ProgressionNode,
    state: ProgressionGameState | null | undefined
): EvaluatedProgressionNode {
    const safeState: ProgressionGameState = state ?? {};

    // Avalia o pai
    let isParentUnlocked = true;
    if (node.parentId) {
        const parentNode = PROGRESSION_NODES.find(n => n.id === node.parentId);
        isParentUnlocked = parentNode ? parentNode.checkUnlocked(safeState) : true;
    }

    let isUnlocked = false;
    let progress = { current: 0, max: 1, percentage: 0 };

    try {
        isUnlocked = node.checkUnlocked(safeState);
        progress = node.getProgress(safeState);
    } catch {
        isUnlocked = false;
        progress = { current: 0, max: 1, percentage: 0 };
    }

    let status: 'unlocked' | 'in_progress' | 'locked' = 'locked';
    if (isUnlocked) {
        status = 'unlocked';
    } else if (isParentUnlocked && progress.percentage > 0) {
        status = 'in_progress';
    }

    return {
        ...node,
        isUnlocked,
        isParentUnlocked,
        progress,
        status
    };
}

/**
 * Retorna todos os nós de uma ramificação específica
 */
export function getBranchNodes(branch: ProgressionBranch): ProgressionNode[] {
    return PROGRESSION_NODES.filter(node => node.branch === branch);
}

/**
 * Retorna o mapa completo avaliado da árvore de progressão
 */
export function evaluateProgressionTree(
    state: ProgressionGameState | null | undefined
): Record<string, EvaluatedProgressionNode> {
    const result: Record<string, EvaluatedProgressionNode> = {};
    for (const node of PROGRESSION_NODES) {
        result[node.id] = evaluateProgressionNode(node, state);
    }
    return result;
}

/**
 * Encontra um nó pelo ID de forma segura
 */
export function getProgressionNodeById(id: string): ProgressionNode | undefined {
    return PROGRESSION_NODES.find(n => n.id === id);
}
