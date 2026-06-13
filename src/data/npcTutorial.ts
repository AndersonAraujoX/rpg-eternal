export interface TutorialStepReward {
    gold?: number;
    souls?: number;
    backroomsScrap?: number;
    almondWater?: number;
    anomalyParts?: number;
}

export interface TutorialStep {
    id: string;
    npcName: string;
    dialogue: string;
    objectiveDescription: string;
    checkCondition: (state: any) => boolean;
    reward: TutorialStepReward;
    unlocksFeature?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'gold_accumulation',
        npcName: 'Operador Mitchell (M.E.G.)',
        dialogue: 'Saudações, explorador. Nossos sensores detectaram perturbações quânticas atípicas se abrindo sob a Arena. Precisamos estabelecer o Posto Avançado M.E.G. para rastrear essas anomalias. Reúna 40.000 moedas de ouro para construir a base na Vila!',
        objectiveDescription: 'Acumule 40.000 de Ouro ou compre o Posto Avançado M.E.G. na Vila.',
        checkCondition: (state: any) => state.gold >= 40000 || state.buildings.some((b: any) => b.id === 'backrooms_manager' && b.level > 0),
        reward: { gold: 5000, backroomsScrap: 20 },
        unlocksFeature: 'backrooms_manager'
    },
    {
        id: 'alchemy_distillation',
        npcName: 'Cientista Dra. Evelyn',
        dialogue: 'Excelente! A base do Posto M.E.G. foi assentada. Agora precisamos fabricar suprimentos de sobrevivência. Vá ao Terminal M.E.G. (aba de Pesquisa de Tecnologias) e pesquise a "Destilação Alquímica" para refinarmos Água de Amêndoa a partir de amostras liminares!',
        objectiveDescription: 'Pesquise a tecnologia "Destilação Alquímica" na aba de Pesquisas de Tecnologia.',
        checkCondition: (state: any) => state.backroomsUnlockedTechs && state.backroomsUnlockedTechs.includes('alchemical_distill'),
        reward: { backroomsScrap: 40, almondWater: 5 },
        unlocksFeature: 'alchemical_distill'
    },
    {
        id: 'floor_progress',
        npcName: 'Agente de Campo Robert',
        dialogue: 'Com a Água de Amêndoa purificada, nossa sanidade está protegida. Contrate novos agentes na central do terminal, equipe-os com lanternas/trajes e ordene que explorem o Setor 1: Catacumbas. Precisamos avançar até o Andar 5!',
        objectiveDescription: 'Alcance o Andar 5 nas Backrooms com seus exploradores contratados.',
        checkCondition: (state: any) => state.backroomsFloor >= 5,
        reward: { gold: 15000, backroomsScrap: 50, anomalyParts: 2 },
        unlocksFeature: 'backrooms_floor_5'
    }
];
