/**
 * Procedural Mission Engine for Aria Advisor
 * Bridges Aria Tactical Advice, Daily Quests, and Cross-System Game Events.
 */

export type MissionDifficulty = 'normal' | 'heroic' | 'mythic';
export type MissionCategory = 'boss_hunt' | 'industry_quota' | 'backrooms_recon' | 'cosmic_trade' | 'alchemical_synthesis';

export interface MissionObjective {
    type: MissionCategory;
    targetDescription: string;
    current: number;
    required: number;
    completed: boolean;
}

export interface AriaMissionRewards {
    gold: number;
    starlight: number;
    souls?: number;
    chaosMarks?: number;
    loreFragmentTitle?: string;
}

export interface AriaMission {
    id: string;
    title: string;
    narrativeBriefing: string;
    category: MissionCategory;
    difficulty: MissionDifficulty;
    objective: MissionObjective;
    rewards: AriaMissionRewards;
    completed: boolean;
    claimed: boolean;
}

export interface AriaMissionConfig {
    stage: 'early' | 'mid' | 'advanced' | 'endgame';
    highestFloor: number;
    unlockedFeatures: Record<string, boolean>;
}

const NARRATIVE_TEMPLATES: Record<MissionCategory, { title: string; briefing: string }> = {
    boss_hunt: {
        title: 'Expurgo de Anomalia Alfa',
        briefing: 'Senhor, os sensores temporais detectaram instabilidade na Torre. Elimine os monstros indicados para restabelecer a contenção.'
    },
    industry_quota: {
        title: 'Cota de Produção Estratégica',
        briefing: 'Nossas frentes de batalha exigem suprimentos industriais imediatos. Automatize e entregue os componentes requeridos.'
    },
    backrooms_recon: {
        title: 'Mapeamento de Sala Liminar',
        briefing: 'A expedição nas Backrooms relatou uma sala anômala. Conduza seus batedores para extrair dados topográficos valiosos.'
    },
    cosmic_trade: {
        title: 'Arbitragem de Recursos',
        briefing: 'O mercado está oscilando favoravelmente. Venda excedentes comerciais aproveitando as altas de preço.'
    },
    alchemical_synthesis: {
        title: 'Transmutação Catalítica',
        briefing: 'O Laboratório de Alquimia precisa de elixires de estabilização. Crie as misturas para reforçar a equipe.'
    }
};

/**
 * Procedurally generates a mission tailored to the player's progression stage.
 */
export const generateAriaMission = (
    config: AriaMissionConfig,
    category: MissionCategory,
    difficulty: MissionDifficulty = 'normal',
    rng: () => number = Math.random
): AriaMission => {
    const template = NARRATIVE_TEMPLATES[category];
    const difficultyMult = difficulty === 'mythic' ? 3.0 : difficulty === 'heroic' ? 1.8 : 1.0;

    let baseRequired = 10;
    if (category === 'boss_hunt') baseRequired = 3;
    if (category === 'industry_quota') baseRequired = 50;
    if (category === 'backrooms_recon') baseRequired = 5;

    const scaledRequired = Math.max(1, Math.floor(baseRequired * difficultyMult * (1 + (rng() * 0.2))));

    const rewards: AriaMissionRewards = {
        gold: Math.floor(1000 * difficultyMult * (config.highestFloor || 1)),
        starlight: Math.floor(10 * difficultyMult),
        ...(difficulty !== 'normal' ? { chaosMarks: Math.floor(5 * difficultyMult) } : {}),
        ...(config.stage === 'advanced' || config.stage === 'endgame' ? { souls: Math.floor(2 * difficultyMult) } : {})
    };

    if (difficulty === 'mythic') {
        rewards.loreFragmentTitle = `Crônica Perdida de Aria #${Math.floor(rng() * 100) + 1}`;
    }

    return {
        id: `aria_mission_${Date.now()}_${Math.floor(rng() * 10000)}`,
        title: `${template.title} [${difficulty.toUpperCase()}]`,
        narrativeBriefing: template.briefing,
        category,
        difficulty,
        objective: {
            type: category,
            targetDescription: `Completar ${scaledRequired} operações da categoria ${category}.`,
            current: 0,
            required: scaledRequired,
            completed: false
        },
        rewards,
        completed: false,
        claimed: false
    };
};

/**
 * Updates mission progress for matching categories. Pure function.
 */
export const updateAriaMissionsProgress = (
    missions: AriaMission[],
    category: MissionCategory,
    progressAmount: number
): AriaMission[] => {
    if (progressAmount <= 0) return missions;

    return missions.map(mission => {
        if (mission.completed || mission.category !== category) {
            return mission;
        }

        const newCurrent = Math.min(mission.objective.required, mission.objective.current + progressAmount);
        const isNowCompleted = newCurrent >= mission.objective.required;

        return {
            ...mission,
            objective: {
                ...mission.objective,
                current: newCurrent,
                completed: isNowCompleted
            },
            completed: isNowCompleted
        };
    });
};

/**
 * Claims the rewards for a completed mission.
 */
export const claimAriaMission = (
    mission: AriaMission
): { updatedMission: AriaMission; rewardsClaimed: AriaMissionRewards } => {
    if (!mission.completed) {
        throw new Error('Cannot claim an incomplete mission.');
    }
    if (mission.claimed) {
        throw new Error('Mission rewards have already been claimed.');
    }

    return {
        updatedMission: {
            ...mission,
            claimed: true
        },
        rewardsClaimed: { ...mission.rewards }
    };
};
