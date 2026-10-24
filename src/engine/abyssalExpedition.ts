/**
 * Abyssal Expedition Engine (Roguelite with Moral Choices)
 * Bridges Temporal Rifts (Blessings & Mechanics) and Backrooms (Sanity & Liminal Entities).
 */

export type AbyssalNodeType = 'encounter' | 'moral_choice' | 'anomaly_cache' | 'rest_haven' | 'liminal_boss';

export interface AbyssalMember {
    id: string;
    name: string;
    classType: string;
    hp: number;
    maxHp: number;
    sanity: number;
    maxSanity: number;
    mentalState: 'focused' | 'paranoid' | 'hysterical';
}

export interface MoralOption {
    label: string;
    description: string;
    moralShift: number; // -20 (Ruthless) to +20 (Humanitarian)
    sanityImpact: number;
    hpImpact: number;
    scrapsReward: number;
    blessingGranted?: string;
}

export interface AbyssalNode {
    id: string;
    type: AbyssalNodeType;
    title: string;
    depth: number;
    description: string;
    moralChoice?: {
        id: string;
        scenario: string;
        optionA: MoralOption;
        optionB: MoralOption;
    };
    cleared: boolean;
}

export interface AbyssalRunState {
    id: string;
    currentDepth: number;
    maxDepth: number;
    party: AbyssalMember[];
    nodes: AbyssalNode[];
    currentNodeId: string | null;
    moralCompass: number; // -100 (Ruthless Pragmatist) to +100 (Benevolent Savior)
    collectedScraps: number;
    blessingsObtained: string[];
    status: 'ongoing' | 'victory' | 'wiped' | 'escaped';
}

export interface RunResolutionResult {
    newState: AbyssalRunState;
    summaryLog: string;
    rewards: {
        backroomsScraps: number;
        riftEnergy: number;
        moralAlignmentBonus: string;
    };
}

/**
 * Creates an initial member for the expedition with validated health and sanity.
 */
export const createAbyssalMember = (
    id: string,
    name: string,
    classType: string,
    maxHp: number = 100,
    maxSanity: number = 100
): AbyssalMember => {
    if (!id || !name) {
        throw new Error('AbyssalMember requires valid id and name.');
    }
    const hp = Math.max(1, maxHp);
    const sanity = Math.max(1, maxSanity);
    return {
        id,
        name,
        classType,
        hp,
        maxHp: hp,
        sanity,
        maxSanity: sanity,
        mentalState: 'focused'
    };
};

/**
 * Updates a member's mental status based on their current sanity.
 */
export const evaluateMentalState = (member: AbyssalMember): AbyssalMember => {
    const sanityPct = member.sanity / member.maxSanity;
    let mentalState: 'focused' | 'paranoid' | 'hysterical' = 'focused';

    if (sanityPct <= 0.25) {
        mentalState = 'hysterical';
    } else if (sanityPct <= 0.6) {
        mentalState = 'paranoid';
    }

    return { ...member, mentalState };
};

/**
 * Generates an abyssal floor with a procedural sequence of encounters and moral choices.
 */
export const generateAbyssalFloor = (
    depth: number,
    rng: () => number = Math.random
): AbyssalNode[] => {
    const safeDepth = Math.max(1, depth);
    const nodes: AbyssalNode[] = [];

    // Node 1: Entry Anomaly or Encounter
    nodes.push({
        id: `node_${safeDepth}_1`,
        type: rng() > 0.5 ? 'anomaly_cache' : 'encounter',
        title: `Setor Liminar ${safeDepth}-A`,
        depth: safeDepth,
        description: 'Vapor elétrico e silêncio sepulcral ressoam nas paredes úmidas.',
        cleared: false
    });

    // Node 2: Moral Dilemma
    nodes.push({
        id: `node_${safeDepth}_2`,
        type: 'moral_choice',
        title: `Dilema de Contenção ${safeDepth}-B`,
        depth: safeDepth,
        description: 'Um sobrevivente do M.E.G. infectado por esporos pede ajuda.',
        moralChoice: {
            id: `moral_${safeDepth}`,
            scenario: 'Um pesquisador ferido está bloqueando a porta de fuga com alarme ativado.',
            optionA: {
                label: 'Sacrificar Pesquisador',
                description: 'Deixar o pesquisador para trás para salvar a equipe e recolher suas pesquisas.',
                moralShift: -25,
                sanityImpact: -15,
                hpImpact: 0,
                scrapsReward: 50,
                blessingGranted: 'Pragmatismo Frio'
            },
            optionB: {
                label: 'Arriscar Resgate',
                description: 'Gastar recursos médicos e arriscar a equipe para carregar o sobrevivente.',
                moralShift: +25,
                sanityImpact: +10,
                hpImpact: -20,
                scrapsReward: 10,
                blessingGranted: 'Espírito Inquebrável'
            }
        },
        cleared: false
    });

    // Node 3: Rest Haven
    nodes.push({
        id: `node_${safeDepth}_3`,
        type: 'rest_haven',
        title: `Quarto de Descompressão ${safeDepth}-C`,
        depth: safeDepth,
        description: 'Um posto avançado fortificado com suprimentos de Água de Amêndoa.',
        cleared: false
    });

    // Node 4: Floor Guardian
    nodes.push({
        id: `node_${safeDepth}_boss`,
        type: 'liminal_boss',
        title: `Sentinela da Fenda ${safeDepth}-D`,
        depth: safeDepth,
        description: 'Uma anomalia dimensional colossal guarda a passagem para o próximo nível.',
        cleared: false
    });

    return nodes;
};

/**
 * Resolves a moral choice in an active abyssal node.
 */
export const resolveMoralChoice = (
    state: AbyssalRunState,
    nodeId: string,
    choice: 'optionA' | 'optionB'
): AbyssalRunState => {
    if (state.status !== 'ongoing') {
        return state;
    }

    const nodeIndex = state.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
        throw new Error(`Node ${nodeId} not found in current run.`);
    }

    const node = state.nodes[nodeIndex];
    if (node.type !== 'moral_choice' || !node.moralChoice) {
        throw new Error(`Node ${nodeId} is not a valid moral choice node.`);
    }

    const selected = choice === 'optionA' ? node.moralChoice.optionA : node.moralChoice.optionB;

    // Apply moral shift clamped between -100 and +100
    const newCompass = Math.max(-100, Math.min(100, state.moralCompass + selected.moralShift));

    // Apply impacts to party
    const updatedParty = state.party.map(member => {
        const newHp = Math.max(0, Math.min(member.maxHp, member.hp + selected.hpImpact));
        const newSanity = Math.max(0, Math.min(member.maxSanity, member.sanity + selected.sanityImpact));
        return evaluateMentalState({ ...member, hp: newHp, sanity: newSanity });
    });

    const isPartyDead = updatedParty.every(m => m.hp <= 0);

    const updatedNodes = [...state.nodes];
    updatedNodes[nodeIndex] = { ...node, cleared: true };

    const blessings = [...state.blessingsObtained];
    if (selected.blessingGranted && !blessings.includes(selected.blessingGranted)) {
        blessings.push(selected.blessingGranted);
    }

    return {
        ...state,
        party: updatedParty,
        nodes: updatedNodes,
        moralCompass: newCompass,
        collectedScraps: state.collectedScraps + selected.scrapsReward,
        blessingsObtained: blessings,
        status: isPartyDead ? 'wiped' : state.status
    };
};

/**
 * Concludes the expedition and calculates final extraction yields.
 */
export const concludeAbyssalRun = (state: AbyssalRunState): RunResolutionResult => {
    const isWiped = state.status === 'wiped' || state.party.every(m => m.hp <= 0);
    const multiplier = isWiped ? 0.3 : 1.0;

    const baseScraps = Math.floor(state.collectedScraps * multiplier);
    const riftEnergy = isWiped ? 5 : Math.floor(state.currentDepth * 25 + state.blessingsObtained.length * 10);

    let moralBonus = 'Neutro';
    if (state.moralCompass >= 50) {
        moralBonus = 'Luz Benevolente (+20% Cura da Guilda)';
    } else if (state.moralCompass <= -50) {
        moralBonus = 'Sombra Pragmática (+15% Dano em Chefes)';
    }

    return {
        newState: {
            ...state,
            status: isWiped ? 'wiped' : 'victory'
        },
        summaryLog: isWiped
            ? `A expedição sucumbiu no abismo. Recuperados 30% dos destroços.`
            : `Expedição evacuada com sucesso no Nível ${state.currentDepth}!`,
        rewards: {
            backroomsScraps: baseScraps,
            riftEnergy,
            moralAlignmentBonus: moralBonus
        }
    };
};
