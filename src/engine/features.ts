import type { Building } from './types';

export interface GameStateForUnlocks {
    bossLevel: number;
    highestFloor: number;
    voidAscensions: number;
    buildings: Building[];
    outerSpaceUnlocked: boolean;
    riftsUnlocked?: boolean;
}

export interface FeatureDefinition {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji or Lucide icon name
    unlockRequirementText: string;
    tab: 'main' | 'combat' | 'skills' | 'system';
    checkUnlocked: (state: GameStateForUnlocks) => boolean;
    getProgress: (state: GameStateForUnlocks) => { current: number; max: number; percentage: number };
}

export const FEATURES_LIST: FeatureDefinition[] = [
    {
        id: 'tavern',
        name: 'Taverna',
        description: 'Recrute heróis lendários para fortalecer seu exército.',
        icon: '🍻',
        unlockRequirementText: 'Disponível no início',
        tab: 'main',
        checkUnlocked: () => true,
        getProgress: () => ({ current: 1, max: 1, percentage: 100 })
    },
    {
        id: 'inventory',
        name: 'Mochila',
        description: 'Gerencie itens, equipamentos e runas de seus heróis.',
        icon: '🎒',
        unlockRequirementText: 'Disponível no início',
        tab: 'main',
        checkUnlocked: () => true,
        getProgress: () => ({ current: 1, max: 1, percentage: 100 })
    },
    {
        id: 'tower',
        name: 'Torre da Eternidade',
        description: 'Desafie andares infinitos de monstros por ouro e glória.',
        icon: '🏰',
        unlockRequirementText: 'Disponível no início',
        tab: 'combat',
        checkUnlocked: () => true,
        getProgress: () => ({ current: 1, max: 1, percentage: 100 })
    },
    {
        id: 'town',
        name: 'Vila da Aliança',
        description: 'Construa edifícios e gerencie a economia local.',
        icon: '🏡',
        unlockRequirementText: 'Atingir Nível de Chefe 10',
        tab: 'main',
        checkUnlocked: (state) => state.bossLevel >= 10,
        getProgress: (state) => {
            const current = Math.min(10, state.bossLevel);
            return { current, max: 10, percentage: Math.floor((current / 10) * 100) };
        }
    },
    {
        id: 'dungeon',
        name: 'Masmorra (Cofre)',
        description: 'Explore salas perigosas por tesouros e chaves.',
        icon: '🪙',
        unlockRequirementText: 'Alcançar Andar 10 na Torre',
        tab: 'combat',
        checkUnlocked: (state) => state.highestFloor >= 10,
        getProgress: (state) => {
            const current = Math.min(10, state.highestFloor);
            return { current, max: 10, percentage: Math.floor((current / 10) * 100) };
        }
    },
    {
        id: 'forge_workshop',
        name: 'Oficina de Forja',
        description: 'Melhore slots de equipamentos usando minérios.',
        icon: '🔨',
        unlockRequirementText: 'Alcançar Andar 20 na Torre',
        tab: 'main',
        checkUnlocked: (state) => state.highestFloor >= 20,
        getProgress: (state) => {
            const current = Math.min(20, state.highestFloor);
            return { current, max: 20, percentage: Math.floor((current / 20) * 100) };
        }
    },
    {
        id: 'fishing_dock',
        name: 'Doca de Pesca',
        description: 'Pesque peixes e tesouros nas águas da vila.',
        icon: '⚓',
        unlockRequirementText: 'Alcançar Andar 35 na Torre',
        tab: 'skills',
        checkUnlocked: (state) => state.highestFloor >= 35,
        getProgress: (state) => {
            const current = Math.min(35, state.highestFloor);
            return { current, max: 35, percentage: Math.floor((current / 35) * 100) };
        }
    },
    {
        id: 'alchemy_lab',
        name: 'Laboratório de Alquimia',
        description: 'Transmute recursos e crie elixires de poder.',
        icon: '🧪',
        unlockRequirementText: 'Alcançar Andar 50 na Torre',
        tab: 'skills',
        checkUnlocked: (state) => state.highestFloor >= 50,
        getProgress: (state) => {
            const current = Math.min(50, state.highestFloor);
            return { current, max: 50, percentage: Math.floor((current / 50) * 100) };
        }
    },
    {
        id: 'mystic_garden',
        name: 'Jardim Místico',
        description: 'Cultive plantas para poções e receitas especiais.',
        icon: '🌿',
        unlockRequirementText: 'Alcançar Andar 65 na Torre',
        tab: 'skills',
        checkUnlocked: (state) => state.highestFloor >= 65,
        getProgress: (state) => {
            const current = Math.min(65, state.highestFloor);
            return { current, max: 65, percentage: Math.floor((current / 65) * 100) };
        }
    },
    {
        id: 'guild_hall',
        name: 'Sede da Guilda',
        description: 'Gerencie monumentos, bônus de equipe e guerras.',
        icon: '🏰',
        unlockRequirementText: 'Alcançar Andar 80 na Torre',
        tab: 'main',
        checkUnlocked: (state) => state.highestFloor >= 80,
        getProgress: (state) => {
            const current = Math.min(80, state.highestFloor);
            return { current, max: 80, percentage: Math.floor((current / 80) * 100) };
        }
    },
    {
        id: 'breeding_center',
        name: 'Espaço Pet',
        description: 'Choque ovos, alimente e cruze companheiros leais.',
        icon: '🧬',
        unlockRequirementText: 'Realizar 1 Ascensão Divina (Rebirth)',
        tab: 'skills',
        checkUnlocked: (state) => state.voidAscensions >= 1,
        getProgress: (state) => {
            const current = Math.min(1, state.voidAscensions);
            return { current, max: 1, percentage: Math.floor((current / 1) * 100) };
        }
    },
    {
        id: 'rune_sanctuary',
        name: 'Santuário de Runas',
        description: 'Forje runas místicas e engaste em seus itens.',
        icon: '💎',
        unlockRequirementText: 'Alcançar Andar 100 na Torre',
        tab: 'skills',
        checkUnlocked: (state) => state.highestFloor >= 100,
        getProgress: (state) => {
            const current = Math.min(100, state.highestFloor);
            return { current, max: 100, percentage: Math.floor((current / 100) * 100) };
        }
    },
    {
        id: 'outer_space',
        name: 'Espaço Sideral (Galáxia)',
        description: 'Viaje no hiperespaço por setores, naves e forja estelar.',
        icon: '🪐',
        unlockRequirementText: 'Atingir Nível de Chefe 100 ou Pesquisa M.E.G.',
        tab: 'combat',
        checkUnlocked: (state) => state.bossLevel >= 100 || state.outerSpaceUnlocked,
        getProgress: (state) => {
            if (state.outerSpaceUnlocked) return { current: 1, max: 1, percentage: 100 };
            const current = Math.min(100, state.bossLevel);
            return { current, max: 100, percentage: Math.floor((current / 100) * 100) };
        }
    },
    {
        id: 'rifts',
        name: 'Fendas Temporais (Rifts)',
        description: 'Modo roguelike desafiador com bênçãos dinâmicas.',
        icon: '🌀',
        unlockRequirementText: 'Alcançar Andar 120 na Torre ou Pesquisa M.E.G.',
        tab: 'combat',
        checkUnlocked: (state) => state.highestFloor >= 120 || state.riftsUnlocked === true,
        getProgress: (state) => {
            if (state.riftsUnlocked) return { current: 1, max: 1, percentage: 100 };
            const current = Math.min(120, state.highestFloor);
            return { current, max: 120, percentage: Math.floor((current / 120) * 100) };
        }
    },
    {
        id: 'world_boss',
        name: 'Reide de Chefe Mundial',
        description: 'Enfrente Titãs massivos junto com outros guerreiros.',
        icon: '👹',
        unlockRequirementText: 'Atingir Nível de Chefe 150',
        tab: 'combat',
        checkUnlocked: (state) => state.bossLevel >= 150,
        getProgress: (state) => {
            const current = Math.min(150, state.bossLevel);
            return { current, max: 150, percentage: Math.floor((current / 150) * 100) };
        }
    },
    {
        id: 'starlight',
        name: 'Luz Estelar (Automação)',
        description: 'Construa bots para automatizar compras, itens e ressurreições.',
        icon: '🔭',
        unlockRequirementText: 'Alcançar Andar 180 na Torre',
        tab: 'system',
        checkUnlocked: (state) => state.highestFloor >= 180,
        getProgress: (state) => {
            const current = Math.min(180, state.highestFloor);
            return { current, max: 180, percentage: Math.floor((current / 180) * 100) };
        }
    },
    {
        id: 'prestige_tree',
        name: 'Árvore de Prestígio (Almas)',
        description: 'Desbloqueie poderes transcendentais permanentes.',
        icon: '⚡',
        unlockRequirementText: 'Realizar 2 Ascensões Divinas (Rebirths)',
        tab: 'main',
        checkUnlocked: (state) => state.voidAscensions >= 2,
        getProgress: (state) => {
            const current = Math.min(2, state.voidAscensions);
            return { current, max: 2, percentage: Math.floor((current / 2) * 100) };
        }
    },
    {
        id: 'boss_rush',
        name: 'Coliseu das Lendas',
        description: 'Desafie chefes consecutivos sem curar para obter recompensas extras.',
        icon: '🏟️',
        unlockRequirementText: 'Atingir Nível de Chefe 80',
        tab: 'combat',
        checkUnlocked: (state) => state.bossLevel >= 80,
        getProgress: (state) => {
            const current = Math.min(80, state.bossLevel);
            return { current, max: 80, percentage: Math.floor((current / 80) * 100) };
        }
    },
    {
        id: 'elemental_resonance',
        name: 'Templo Elemental',
        description: 'Desbloqueie passivas elementais usando essências de monstros.',
        icon: '🔮',
        unlockRequirementText: 'Alcançar Andar 150 na Torre',
        tab: 'skills',
        checkUnlocked: (state) => state.highestFloor >= 150,
        getProgress: (state) => {
            const current = Math.min(150, state.highestFloor);
            return { current, max: 150, percentage: Math.floor((current / 150) * 100) };
        }
    },
    {
        id: 'void_infusion',
        name: 'Forja do Vazio (Infusão)',
        description: 'Infundir equipamentos com Matéria do Vazio para obter atributos corrompidos.',
        icon: '🌌',
        unlockRequirementText: 'Realizar 3 Ascensões Divinas (Rebirths)',
        tab: 'skills',
        checkUnlocked: (state) => state.voidAscensions >= 3,
        getProgress: (state) => {
            const current = Math.min(3, state.voidAscensions);
            return { current, max: 3, percentage: Math.floor((current / 3) * 100) };
        }
    },
    {
        id: 'relic_chamber',
        name: 'Câmara de Relíquias',
        description: 'Equipe artefatos antigos que alteram as regras do jogo.',
        icon: '🏺',
        unlockRequirementText: 'Alcançar Andar 220 na Torre',
        tab: 'system',
        checkUnlocked: (state) => state.highestFloor >= 220,
        getProgress: (state) => {
            const current = Math.min(220, state.highestFloor);
            return { current, max: 220, percentage: Math.floor((current / 220) * 100) };
        }
    },
    {
        id: 'roguelike_mode',
        name: 'Modo Roguelike',
        description: 'Suba andares em uma masmorra gerada proceduralmente com relíquias temporárias.',
        icon: '🌀',
        unlockRequirementText: 'Atingir Nível de Chefe 15',
        tab: 'combat',
        checkUnlocked: (state) => state.bossLevel >= 15 || state.outerSpaceUnlocked,
        getProgress: (state) => {
            if (state.outerSpaceUnlocked) {
                return { current: 15, max: 15, percentage: 100 };
            }
            const current = Math.min(15, state.bossLevel);
            return { current, max: 15, percentage: Math.floor((current / 15) * 100) };
        }
    },
    {
        id: 'backrooms_manager',
        name: 'Backrooms M.E.G.',
        description: 'Gerencie uma equipe de exploradores nas salas liminares das Backrooms.',
        icon: '🏢',
        unlockRequirementText: 'Atingir Nível de Chefe 30',
        tab: 'combat',
        checkUnlocked: (state) => state.bossLevel >= 30,
        getProgress: (state) => {
            const current = Math.min(30, state.bossLevel);
            return { current, max: 30, percentage: Math.floor((current / 30) * 100) };
        }
    }
];

export const getUnlocksState = (state: GameStateForUnlocks): Record<string, boolean> => {
    const unlocks: Record<string, boolean> = {};
    FEATURES_LIST.forEach(f => {
        unlocks[f.id] = f.checkUnlocked(state);
    });
    return unlocks;
};
