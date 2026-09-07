export interface TutorialStepReward {
    gold?: number;
    souls?: number;
    backroomsScrap?: number;
    almondWater?: number;
    anomalyParts?: number;
}

export interface TutorialProgressInfo {
    current: number;
    max: number;
    label: string;
    percentage: number;
}

export interface TutorialStep {
    id: string;
    npcName: string;
    npcAvatar?: string;
    npcImage?: string;
    npcRole?: string;
    dialogue: string;
    hint?: string;
    objectiveDescription: string;
    checkCondition: (state: any) => boolean;
    reward: TutorialStepReward;
    unlocksFeature?: string;
    targetModal?: 'town' | 'backrooms' | 'tavern' | 'forge' | 'shop' | 'inventory';
    actionLabel?: string;
    calculateProgress?: (state: any) => TutorialProgressInfo;
}

export const TUTORIAL_NPC = {
    name: 'Aria',
    fullName: 'Aria, a Guia dos Aventureiros',
    title: 'Instrutora Real da Guilda',
    avatar: '🧝‍♀️',
    image: '/assets/npc/aria_guide.jpg',
    greeting: 'Saudações, herói! Eu sou Aria, sua instrutora e guia nestas terras desconhecidas.',
    completedBanner: 'Todas as diretrizes do tutorial foram concluídas com êxito! Continue evoluindo sua guilda e dominando as dimensões.',
    tips: [
        'Derrote monstros e chefes na arena para acumular ouro e almas de forma contínua.',
        'Visite a Taverna para recrutar heróis com diferentes sinergias elementais.',
        'Aprimore equipamentos na Forja para elevar substancialmente seu DPS e sobrevivência.',
        'Mantenha suprimentos de Água de Amêndoa para manter a sanidade dos seus exploradores no abismo.'
    ]
};

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'gold_accumulation',
        npcName: 'Aria (Guia dos Aventureiros)',
        npcAvatar: '🧝‍♀️',
        npcImage: '/assets/npc/aria_guide.jpg',
        npcRole: 'Guia do Reino & Instrutora',
        dialogue: 'Saudações, explorador! Eu sou Aria, sua guia. Nossos sensores detectaram perturbações quânticas atípicas se abrindo sob a Arena. Precisamos estabelecer o Posto Avançado M.E.G. para rastrear essas anomalias. Reúna 40.000 moedas de ouro para construir a base na Vila!',
        hint: 'Derrote monstros e chefes para acumular ouro, ou compre o Posto Avançado M.E.G. na Vila.',
        objectiveDescription: 'Acumule 40.000 de Ouro ou compre o Posto Avançado M.E.G. na Vila.',
        targetModal: 'town',
        actionLabel: 'Ir para a Vila',
        checkCondition: (state: any) => {
            if (!state) return false;
            const gold = state.gold ?? 0;
            const buildings = Array.isArray(state.buildings) ? state.buildings : [];
            return gold >= 40000 || buildings.some((b: any) => b && b.id === 'backrooms_manager' && (b.level ?? 0) > 0);
        },
        calculateProgress: (state: any) => {
            if (!state) return { current: 0, max: 40000, label: '0 / 40.000 Ouro', percentage: 0 };
            const buildings = Array.isArray(state.buildings) ? state.buildings : [];
            const hasBuilding = buildings.some((b: any) => b && b.id === 'backrooms_manager' && (b.level ?? 0) > 0);
            if (hasBuilding) {
                return { current: 40000, max: 40000, label: 'Posto Avançado Ativo!', percentage: 100 };
            }
            const gold = Math.max(0, Math.min(40000, state.gold || 0));
            const pct = Math.min(100, Math.floor((gold / 40000) * 100));
            return { current: gold, max: 40000, label: `${gold.toLocaleString()} / 40.000 Ouro`, percentage: pct };
        },
        reward: { gold: 5000, backroomsScrap: 20 },
        unlocksFeature: 'backrooms_manager'
    },
    {
        id: 'alchemy_distillation',
        npcName: 'Cientista Dra. Evelyn & Aria',
        npcAvatar: '🔬',
        npcRole: 'Pesquisadora Chefe M.E.G.',
        dialogue: 'Excelente trabalho! A base do Posto M.E.G. foi assentada. Agora precisamos fabricar suprimentos vitais de sobrevivência. Vá ao Terminal M.E.G. (aba de Pesquisa de Tecnologias) e pesquise a "Destilação Alquímica" para refinarmos Água de Amêndoa a partir de amostras liminares!',
        hint: 'Acesse o Terminal M.E.G. e, na aba de Pesquisas Tecnológicas, selecione a tecnologia Destilação Alquímica.',
        objectiveDescription: 'Pesquise a tecnologia "Destilação Alquímica" na aba de Pesquisas de Tecnologia.',
        targetModal: 'backrooms',
        actionLabel: 'Abrir Terminal M.E.G.',
        checkCondition: (state: any) => {
            if (!state) return false;
            return Boolean(state.backroomsUnlockedTechs && Array.isArray(state.backroomsUnlockedTechs) && state.backroomsUnlockedTechs.includes('alchemical_distill'));
        },
        calculateProgress: (state: any) => {
            if (!state) return { current: 0, max: 1, label: 'Pendente', percentage: 0 };
            const techs = Array.isArray(state.backroomsUnlockedTechs) ? state.backroomsUnlockedTechs : [];
            const hasTech = techs.includes('alchemical_distill');
            return {
                current: hasTech ? 1 : 0,
                max: 1,
                label: hasTech ? 'Destilação Alquímica Desbloqueada!' : 'Pendente de Pesquisa',
                percentage: hasTech ? 100 : 0
            };
        },
        reward: { backroomsScrap: 40, almondWater: 5 },
        unlocksFeature: 'alchemical_distill'
    },
    {
        id: 'floor_progress',
        npcName: 'Aria & Agente Robert',
        npcAvatar: '🧭',
        npcRole: 'Coordenação de Campo',
        dialogue: 'Com a Água de Amêndoa purificada, nossa sanidade está protegida. Contrate novos agentes na central do terminal, equipe-os com lanternas e trajes reforçados e ordene que explorem o Setor 1: Catacumbas. Precisamos avançar até o Andar 5!',
        hint: 'No Posto M.E.G., contrate exploradores, equipe seus equipamentos de sobrevivência e ordene explorações até o 5º andar.',
        objectiveDescription: 'Alcance o Andar 5 nas Backrooms com seus exploradores contratados.',
        targetModal: 'backrooms',
        actionLabel: 'Explorar Catacumbas',
        checkCondition: (state: any) => {
            if (!state) return false;
            return (state.backroomsFloor ?? 0) >= 5;
        },
        calculateProgress: (state: any) => {
            if (!state) return { current: 1, max: 5, label: 'Andar 1 / 5', percentage: 20 };
            const floor = Math.max(1, state.backroomsFloor || 1);
            const target = 5;
            const current = Math.min(target, floor);
            const pct = Math.min(100, Math.floor((current / target) * 100));
            return {
                current,
                max: target,
                label: `Andar ${current} de ${target}`,
                percentage: pct
            };
        },
        reward: { gold: 15000, backroomsScrap: 50, anomalyParts: 2 },
        unlocksFeature: 'backrooms_floor_5'
    }
];

