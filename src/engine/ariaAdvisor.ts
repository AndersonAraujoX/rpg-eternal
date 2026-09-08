import { TUTORIAL_STEPS, TUTORIAL_NPC, type TutorialStep } from '../data/npcTutorial';
import {
    PROGRESSION_NODES,
    evaluateProgressionTree,
    type EvaluatedProgressionNode,
    type ProgressionGameState
} from './progressionTree';

export interface TacticalAction {
    id: string;
    category: 'quest' | 'tower' | 'town' | 'forge' | 'backrooms' | 'tavern' | 'guild' | 'galaxy';
    title: string;
    description: string;
    actionLabel: string;
    targetModal: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    progress?: { current: number; max: number; label: string; percentage: number };
    completed?: boolean;
}

export interface NextStepPrimaryObjective {
    type: 'tutorial' | 'milestone';
    title: string;
    description: string;
    advice: string;
    targetModal?: string;
    actionLabel: string;
    progress: { current: number; max: number; label: string; percentage: number };
    rewards?: {
        gold?: number;
        souls?: number;
        backroomsScrap?: number;
        almondWater?: number;
        anomalyParts?: number;
    };
}

export interface NextStepSummary {
    primaryObjective: NextStepPrimaryObjective;
    upcomingMilestone: EvaluatedProgressionNode | null;
    tacticalActions: TacticalAction[];
    ariaGreeting: string;
    ariaSpeech: string;
    progressionStage: 'early' | 'mid' | 'advanced' | 'endgame';
}

/**
 * Identifica o próximo marco prioritário a ser conquistado pelo jogador na Árvore de Conquista
 */
export function getNextMilestoneNode(
    evaluatedTree: Record<string, EvaluatedProgressionNode>
): EvaluatedProgressionNode | null {
    if (!evaluatedTree || Object.keys(evaluatedTree).length === 0) {
        return null;
    }

    // Ordem de prioridade temática para evolução do jogador
    const priorityOrder = [
        'town',               // Vila é a porta de entrada para tudo
        'backroom',           // Posto M.E.G. e salas liminares
        'guild',              // Guildas e cooperação
        'world_boss',         // Desafio colossal de chefe
        'backrooms_tech',     // Pesquisa e tecnologia M.E.G.
        'gvg',                // Guerra de guildas
        'industry',           // Automação e manufatura pesada
        'guild_conquest',     // Domínio de territórios
        'backrooms_conquest', // Conquista profunda das Backrooms
        'galaxy'              // Conquista estelar
    ];

    // 1. Procura primeiro nós que o pai já foi liberado e estão em progresso
    for (const id of priorityOrder) {
        const node = evaluatedTree[id];
        if (node && !node.isUnlocked && node.isParentUnlocked && node.status === 'in_progress') {
            return node;
        }
    }

    // 2. Procura nós cujo pai está liberado mas ainda estão bloqueados
    for (const id of priorityOrder) {
        const node = evaluatedTree[id];
        if (node && !node.isUnlocked && node.isParentUnlocked) {
            return node;
        }
    }

    // 3. Procura qualquer nó ainda não desbloqueado
    for (const id of priorityOrder) {
        const node = evaluatedTree[id];
        if (node && !node.isUnlocked) {
            return node;
        }
    }

    return null;
}

/**
 * Determina a fase geral de progressão do jogador
 */
export function getProgressionStage(state: any): 'early' | 'mid' | 'advanced' | 'endgame' {
    if (!state) return 'early';
    const floor = state.highestFloor ?? state.tower?.maxFloor ?? 1;
    const boss = state.bossLevel ?? state.boss?.level ?? 0;
    const outerSpace = Boolean(state.outerSpaceUnlocked);
    const hasIndustry = Boolean(
        state.industryUnlocked ||
        (Array.isArray(state.buildings) && state.buildings.some((b: any) => b.id === 'industry' && (b.level ?? 0) > 0))
    );
    const hasTown = Boolean(
        floor >= 10 || boss >= 10 ||
        (Array.isArray(state.buildings) && state.buildings.some((b: any) => b.id === 'town_hall' && (b.level ?? 0) > 0))
    );

    if (outerSpace) return 'endgame';
    if (hasIndustry) return 'advanced';
    if (hasTown) return 'mid';
    return 'early';
}

/**
 * Gera um checklist tático de ações imediatas com base nos recursos e estado do jogador
 */
export function generateTacticalChecklist(state: any, currentTutorialIndex: number = 0): TacticalAction[] {
    const actions: TacticalAction[] = [];
    const safeState = state || {};

    const gold = safeState.gold ?? 0;
    const resources = safeState.resources ?? {};
    const copper = resources.copper ?? 0;
    const iron = resources.iron ?? 0;
    const towerFloor = safeState.highestFloor ?? safeState.tower?.maxFloor ?? 1;
    const backroomsFloor = safeState.backroomsFloor ?? 1;
    const buildings = Array.isArray(safeState.buildings) ? safeState.buildings : [];
    const heroes = Array.isArray(safeState.heroes) ? safeState.heroes : [];
    const hasBackrooms = buildings.some((b: any) => b.id === 'backrooms_manager' && (b.level ?? 0) > 0);
    const hasTown = towerFloor >= 10 || (safeState.bossLevel ?? 0) >= 10;
    const hasGuild = safeState.hasGuild || buildings.some((b: any) => b.id === 'guild_hall' && (b.level ?? 0) > 0);

    // 1. Torre da Eternidade (se ainda estiver nos andares iniciais)
    if (towerFloor < 10) {
        actions.push({
            id: 'climb_tower',
            category: 'tower',
            title: 'Subir a Torre da Eternidade',
            description: `Atualmente no Andar ${towerFloor}. Alcance o Andar 10 para liberar a Vila da Aliança!`,
            actionLabel: 'Desafiar Torre',
            targetModal: 'tower',
            priority: 'high',
            icon: '🏰',
            progress: {
                current: towerFloor,
                max: 10,
                label: `Andar ${towerFloor} / 10`,
                percentage: Math.min(100, Math.floor((towerFloor / 10) * 100))
            }
        });
    }

    // 2. Taverna & Recrutamento (se o jogador tiver ouro acumulado)
    const unlockedHeroesCount = heroes.filter((h: any) => h.unlocked).length;
    if (gold >= 1000 && unlockedHeroesCount < heroes.length) {
        actions.push({
            id: 'recruit_heroes',
            category: 'tavern',
            title: 'Recrutar Heróis na Taverna',
            description: `Você possui ${gold.toLocaleString()} de Ouro. Recrute novos aventureiros para sinergias elementais!`,
            actionLabel: 'Ir à Taverna',
            targetModal: 'tavern',
            priority: gold >= 10000 ? 'high' : 'medium',
            icon: '👥'
        });
    }

    // 3. Forja de Equipamentos (se houver minérios acumulados)
    if (copper >= 10 || iron >= 5) {
        actions.push({
            id: 'forge_gear',
            category: 'forge',
            title: 'Aprimorar Armas na Forja',
            description: `Minérios prontos para refino (${copper} Cobres, ${iron} Ferros). Aumente o DPS de todos os heróis!`,
            actionLabel: 'Abrir Forja',
            targetModal: 'forge',
            priority: 'medium',
            icon: '⚒️'
        });
    }

    // 4. Vila da Aliança (se liberada)
    if (hasTown) {
        actions.push({
            id: 'visit_town',
            category: 'town',
            title: 'Gerenciar Edifícios da Vila',
            description: 'Aprimore o Salão da Vila, Mercado e Centro de Pesquisas para acelerar sua economia.',
            actionLabel: 'Entrar na Vila',
            targetModal: 'town',
            priority: 'medium',
            icon: '🏡'
        });
    }

    // 5. Backrooms M.E.G. (se desbloqueado)
    if (hasBackrooms) {
        actions.push({
            id: 'backrooms_expedition',
            category: 'backrooms',
            title: 'Operações Liminares M.E.G.',
            description: `Seus exploradores estão no Andar ${backroomsFloor}. Verifique a Sanidade e colete novas sucatas!`,
            actionLabel: 'Terminal M.E.G.',
            targetModal: 'backrooms',
            priority: 'high',
            icon: '🏢'
        });
    }

    // 6. Guilda e Territórios (se disponível)
    if (hasGuild) {
        actions.push({
            id: 'guild_operations',
            category: 'guild',
            title: 'Guerras & Missões de Guilda',
            description: 'Contribua com a aliança e dispute territórios estratégicos para tributos globais.',
            actionLabel: 'Abrir Guilda',
            targetModal: 'guild',
            priority: 'low',
            icon: '🛡️'
        });
    }

    return actions;
}

/**
 * Gera a fala personalizada e encorajadora da Aria
 */
export function generateAriaSpeech(
    stage: 'early' | 'mid' | 'advanced' | 'endgame',
    primaryObjectiveTitle: string,
    upcomingMilestone: EvaluatedProgressionNode | null
): string {
    if (stage === 'early') {
        return `Saudações, herói! Meus sensores indicam que seu grupo está dando os primeiros passos. Nosso foco imediato é conquistar o Andar 10 da Torre para alcançarmos a Vila da Aliança. Siga minha diretriz: "${primaryObjectiveTitle}"!`;
    }

    if (stage === 'mid') {
        const nextName = upcomingMilestone ? upcomingMilestone.shortName : 'novas dimensões';
        return `Excelente progresso! A Vila da Aliança está ativa. Agora você pode expandir tanto para as Guildas quanto descer às misteriosas Backrooms. Estamos nos preparando para desbloquear ${nextName}!`;
    }

    if (stage === 'advanced') {
        return `Impressionante! Com o laboratório M.E.G. e a Indústria em funcionamento, estamos manufaturando ligas quânticas e energia pesada. Continue acelerando a automação para prepararmos o salto estelar!`;
    }

    return `Você conquistou as estrelas e o abismo liminar! Mantenha a guarda alta nas fendas dimensionais e continue expandindo sua frota estelar pelo cosmos infinito!`;
}

/**
 * Gera o resumo consolidado dos Próximos Passos orientado pela Aria
 */
export function generateAriaAdvice(state: any, currentTutorialIndex: number = 0): NextStepSummary {
    const safeState = state || {};
    const stage = getProgressionStage(safeState);

    // Avalia a árvore de progressão
    const evaluatedTree = evaluateProgressionTree({
        highestFloor: safeState.highestFloor ?? safeState.tower?.maxFloor ?? 1,
        bossLevel: safeState.bossLevel ?? safeState.boss?.level ?? 0,
        buildings: Array.isArray(safeState.buildings) ? safeState.buildings : [],
        outerSpaceUnlocked: Boolean(safeState.outerSpaceUnlocked),
        backroomsFloor: safeState.backroomsFloor ?? 1,
        backroomsUnlockedTechs: Array.isArray(safeState.backroomsUnlockedTechs) ? safeState.backroomsUnlockedTechs : [],
        hasGuild: Boolean(safeState.hasGuild),
        playerTerritoriesCount: safeState.playerTerritoriesCount ?? 0,
        industryUnlocked: Boolean(safeState.industryUnlocked)
    });

    const upcomingMilestone = getNextMilestoneNode(evaluatedTree);
    const hasActiveTutorial = currentTutorialIndex >= 0 && currentTutorialIndex < TUTORIAL_STEPS.length;

    let primaryObjective: NextStepPrimaryObjective;

    if (hasActiveTutorial) {
        const step = TUTORIAL_STEPS[currentTutorialIndex];
        const progress = step.calculateProgress ? step.calculateProgress(safeState) : {
            current: 0,
            max: 1,
            label: 'Em andamento',
            percentage: 0
        };

        primaryObjective = {
            type: 'tutorial',
            title: step.objectiveDescription,
            description: step.dialogue,
            advice: step.hint || 'Siga as orientações da instrutora Aria para completar este objetivo.',
            targetModal: step.targetModal,
            actionLabel: step.actionLabel || 'Verificar Objetivo',
            progress,
            rewards: step.reward
        };
    } else if (upcomingMilestone) {
        primaryObjective = {
            type: 'milestone',
            title: `Desbloquear ${upcomingMilestone.name}`,
            description: upcomingMilestone.description,
            advice: upcomingMilestone.ariaAdvice || `Requisito: ${upcomingMilestone.unlockRequirementText}`,
            targetModal: upcomingMilestone.navigationTarget,
            actionLabel: upcomingMilestone.isUnlocked ? 'Entrar no Modo' : 'Trabalhar no Requisito',
            progress: {
                current: upcomingMilestone.progress.current,
                max: upcomingMilestone.progress.max,
                label: `${upcomingMilestone.progress.current} / ${upcomingMilestone.progress.max}`,
                percentage: upcomingMilestone.progress.percentage
            }
        };
    } else {
        primaryObjective = {
            type: 'milestone',
            title: 'Domínio Supremo do Reino',
            description: 'Todos os modos de jogo conhecidos foram desbloqueados!',
            advice: 'Continue aprimorando seus heróis, conquistando a Galáxia e explorando os níveis profundos das Backrooms.',
            actionLabel: 'Ver Conquistas',
            targetModal: 'journey',
            progress: {
                current: 100,
                max: 100,
                label: '100% Concluído',
                percentage: 100
            }
        };
    }

    const tacticalActions = generateTacticalChecklist(safeState, currentTutorialIndex);
    const ariaSpeech = generateAriaSpeech(stage, primaryObjective.title, upcomingMilestone);

    return {
        primaryObjective,
        upcomingMilestone,
        tacticalActions,
        ariaGreeting: TUTORIAL_NPC.greeting,
        ariaSpeech,
        progressionStage: stage
    };
}
