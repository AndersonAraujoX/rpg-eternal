import type { Hero, Building } from './types';
import type { BackroomsExplorer } from './backrooms';
import type { Synergy } from './synergies';

export type GlobalSynergyId =
    | 'global_synergy_ignition'
    | 'global_synergy_explorers'
    | 'global_synergy_assembly'
    | 'global_synergy_mapping';

export interface GlobalSynergy {
    id: GlobalSynergyId;
    name: string;
    description: string;
    isActive: boolean;
    effectText: string;
    icon: string;
}

export interface GlobalSynergyCheckState {
    activeSynergies: Synergy[];
    unlockedFeatures: Record<string, boolean>;
    heroes: Hero[];
    backroomsExplorers: BackroomsExplorer[];
    buildings: Building[];
    riftsActive: boolean;
}

export const GLOBAL_SYNERGY_DEFINITIONS: Omit<GlobalSynergy, 'isActive'>[] = [
    {
        id: 'global_synergy_ignition',
        name: 'Ignição Laboratorial',
        description: 'Combate ⇄ Alquimia',
        effectText: '+100% de dano de Queima (Burn DoT) no Boss.',
        icon: '🧪'
    },
    {
        id: 'global_synergy_explorers',
        name: 'Exploradores Ocultos',
        description: 'Backrooms ⇄ Combate/Classes',
        effectText: '-15% tempo de viagem e +15% drop rate de sucatas/itens nas Backrooms.',
        icon: '👁️'
    },
    {
        id: 'global_synergy_assembly',
        name: 'Linha de Montagem Mecânica',
        description: 'Automação ⇄ Vila',
        effectText: 'Coleta ouro/recursos da Indústria automaticamente e +30% velocidade de produção.',
        icon: '⚙️'
    },
    {
        id: 'global_synergy_mapping',
        name: 'Mapeamento Estelar',
        description: 'Roguelike Rifts ⇄ Galáxia',
        effectText: 'Completar Rifts concede +30 de Combustível Espacial e revela um setor oculto na Galáxia.',
        icon: '🌌'
    }
];

export const checkGlobalSynergies = (state: GlobalSynergyCheckState): GlobalSynergy[] => {
    const activeGlobalSynergies: GlobalSynergy[] = [];

    // 1. Ignição Laboratorial (Combate ⇄ Alquimia)
    // Condição: Se o combo de reação 'reaction_burn' estiver ativo E a feature 'alchemy_lab' estiver desbloqueada.
    const isIgnitionActive =
        state.activeSynergies.some(s => s.id === 'reaction_burn') &&
        !!state.unlockedFeatures['alchemy_lab'];

    // 2. Exploradores Ocultos (Backrooms ⇄ Combate/Classes)
    // Condição: Se o jogador estiver fazendo expedições nas Backrooms ('backrooms_meg' / 'backrooms_manager') 
    // E possuir heróis desbloqueados do elemento 'Dark' ou classe 'Rogue/Assassin'.
    const isExploringBackrooms =
        !!state.unlockedFeatures['backrooms_manager'] &&
        state.backroomsExplorers.some(e => e.status === 'exploring');

    const hasDarkOrRogueAssassin = state.heroes.some(
        h => h.unlocked && (h.element === 'dark' || h.class === 'Rogue' || h.class === 'Assassin')
    );

    const isExploradoresActive = isExploringBackrooms && hasDarkOrRogueAssassin;

    // 3. Linha de Montagem Mecânica (Automação ⇄ Vila)
    // Condição: Se o sistema de automação 'starlight' estiver ativo/desbloqueado E os prédios da 'town' estiverem gerando recursos (industry level > 0).
    const isStarlightUnlocked = !!state.unlockedFeatures['starlight'];
    const isTownUnlocked = !!state.unlockedFeatures['town'];
    const isIndustryActive = state.buildings.some(b => b.id === 'industry' && b.level > 0);

    const isAssemblyActive = isStarlightUnlocked && isTownUnlocked && isIndustryActive;

    // 4. Mapeamento Estelar (Roguelike Rifts ⇄ Galáxia)
    // Condição: Se o modo roguelike 'rifts' estiver ativo E a feature de exploração espacial 'galaxy' estiver desbloqueada.
    const isMappingActive = state.riftsActive && !!state.unlockedFeatures['outer_space'];

    // Map definitions to active/inactive status
    GLOBAL_SYNERGY_DEFINITIONS.forEach(def => {
        let active = false;
        if (def.id === 'global_synergy_ignition') active = isIgnitionActive;
        else if (def.id === 'global_synergy_explorers') active = isExploradoresActive;
        else if (def.id === 'global_synergy_assembly') active = isAssemblyActive;
        else if (def.id === 'global_synergy_mapping') active = isMappingActive;

        if (active) {
            activeGlobalSynergies.push({
                ...def,
                isActive: true
            });
        }
    });

    return activeGlobalSynergies;
};
