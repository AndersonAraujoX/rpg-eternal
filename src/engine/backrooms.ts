export type BackroomsClass = 'scout' | 'soldier' | 'scientist';
export type ExplorerStatus = 'idle' | 'exploring' | 'resting' | 'lost';

export interface BackroomsExplorer {
    id: string;
    name: string;
    classType: BackroomsClass;
    emoji: string;
    hp: number;
    maxHp: number;
    sanity: number;
    maxSanity: number;
    status: ExplorerStatus;
    assignedLevel: string | null;
    equipment: {
        flashlight: number; // 0: none, 1: standard, 2: led, 3: military (dano e coleta)
        suit: number;       // 0: plain, 1: jacket, 2: Hazmat, 3: heavy duty (defesa e perigo ambiental)
        tracker: number;    // 0: none, 1: ping-tracker, 2: proximity-radar (sanidade)
    };
    level?: number;
    xp?: number;
    talents?: string[];
}

export interface BackroomsLevel {
    id: string;
    name: string;
    description: string;
    dangerLevel: 'low' | 'medium' | 'high' | 'deadly';
    sanityDrain: number; // base per tick
    scrapRate: number;  // chance per tick
    itemRate: number;   // chance of finding almond water
    entityRate: number; // chance of entity attack
    emoji: string;
    minFloor: number;
    maxFloor: number;
}

export interface BackroomsOutpost {
    refinery: number; // Almond Water refiner (boosts recovery)
    quarters: number; // Resting quarters (boosts sanity recovery rate)
    sensors: number;  // Hazard scanners (lowers danger rates)
}

export interface BackroomsResources {
    scrap: number;
    almondWater: number;
    anomalyParts: number;
    liminalFluid?: number;
    voidAlloy?: number;
}

// ==========================================
// 1. BESTIÁRIO DE ENTIDADES & CONTENÇÃO
// ==========================================
export interface ContainedEntity {
    id: string;
    entityId?: string;
    name: string;
    description: string;
    emoji: string;
    danger: 'low' | 'medium' | 'high' | 'deadly';
    threat?: 'low' | 'medium' | 'high' | 'extreme';
    captureCost: {
        anomalyParts: number;
        almondWater: number;
        liminalFluid?: number;
    };
    synergyBonusText: string;
    synergyEffect?: string;
    level?: number;
    capturedAt?: number;
    synergyActive?: boolean;
}

export const BACKROOMS_ENTITIES: ContainedEntity[] = [
    {
        id: 'smiler',
        entityId: 'smiler',
        name: 'Smiler (Sorrisos na Escuridão)',
        description: 'Par de olhos brancos brilhantes e dentes luminosos que espreitam em cantos sem luz.',
        emoji: '😈',
        danger: 'high',
        threat: 'high',
        captureCost: { anomalyParts: 3, almondWater: 2 },
        synergyBonusText: '⚡ Energia Pura: +15% velocidade e +200 MW equivalente na Indústria',
        synergyEffect: '⚡ Energia Pura: +15% velocidade e +200 MW na Indústria; -15% dano ambiental'
    },
    {
        id: 'hound',
        entityId: 'hound',
        name: 'Hound (Sabujo Liminar)',
        description: 'Criatura quadrúpede agressiva com longos cabelos escuros, domesticável por contato cauteloso.',
        emoji: '🐕',
        danger: 'medium',
        threat: 'medium',
        captureCost: { anomalyParts: 2, almondWater: 2 },
        synergyBonusText: '🐕 Rastreador: +20% velocidade de exploração e +25% coleta de sucata',
        synergyEffect: '🐕 Soldados causam +20% de dano; +25% coleta de sucata em campo'
    },
    {
        id: 'deathmoth',
        entityId: 'deathmoth',
        name: 'Deathmoth (Mariposa da Morte)',
        description: 'Insetos gigantes que produzem um pólen místico com propriedades bio-regenerativas.',
        emoji: '🦋',
        danger: 'low',
        threat: 'low',
        captureCost: { anomalyParts: 1, almondWater: 1 },
        synergyBonusText: '🌿 Pólen Místico: +25% velocidade de cultivo no Jardim Místico da Vila',
        synergyEffect: '🌿 Goteja Água de Amêndoa passiva e acelera Jardim Místico em +25%'
    },
    {
        id: 'skin_stealer',
        entityId: 'skin_stealer',
        name: 'Skin-Stealer (Ladrão de Peles)',
        description: 'Entidade transmorfa de tecido muscular exposto com resistência anômala a impactos.',
        emoji: '👤',
        danger: 'high',
        threat: 'high',
        captureCost: { anomalyParts: 4, almondWater: 3, liminalFluid: 1 },
        synergyBonusText: '🛡️ Membrana Densada: +15% mitigação de dano a todos os heróis e exploradores',
        synergyEffect: '🛡️ Concede chance de colher Liga do Vazio e +15% mitigação de dano global'
    },
    {
        id: 'faceling',
        entityId: 'faceling',
        name: 'Faceling (Humanoide Sem Rosto)',
        description: 'Figuras humanoides dóceis nas áreas iluminadas que auxiliam nas manutenções básicas.',
        emoji: '😶',
        danger: 'low',
        threat: 'low',
        captureCost: { anomalyParts: 1, almondWater: 2 },
        synergyBonusText: '⛺ Auxiliar de Posto: +30% velocidade de descanso nos Dormitórios',
        synergyEffect: '⛺ -20% dreno de sanidade do esquadrão e +30% velocidade de descanso'
    },
    {
        id: 'partygoer',
        entityId: 'partygoer',
        name: 'Partygoer (Festeiro Anômalo)',
        description: 'Entidade bípede de couro amarelo com balões vermelhos e inteligência cognitiva avançada.',
        emoji: '🎈',
        danger: 'deadly',
        threat: 'extreme',
        captureCost: { anomalyParts: 5, almondWater: 4, liminalFluid: 2 },
        synergyBonusText: '🔬 Computação Quântica: +25% velocidade de pesquisa tecnológica M.E.G.',
        synergyEffect: '🎈 Dobra a coleta de sucatas, mas gera +50% de instabilidade dimensional'
    }
];

// ==========================================
// 2. SISTEMA DE NOCLIP E NÍVEIS SECRETOS
// ==========================================
export interface NoclipSecretLevel {
    id: 'poolrooms' | 'level_run' | 'the_end';
    name: string;
    description: string;
    emoji: string;
    danger: 'peaceful' | 'deadly' | 'cryptic';
    hazardLevel?: 'safe' | 'dangerous' | 'critical';
    riskRewardText: string;
    exoticDrops?: string[];
}

export const NOCLIP_LEVELS: NoclipSecretLevel[] = [
    {
        id: 'poolrooms',
        name: 'The Poolrooms (Nível 37)',
        description: 'Complexo sereno de azulejos brancos e águas tépidas que emanam calor restaurador.',
        emoji: '🏊‍♂️',
        danger: 'peaceful',
        hazardLevel: 'safe',
        riskRewardText: 'Cura 100% de Sanidade e HP de todo o esquadrão e concede 3 Águas de Amêndoa Puras e Fluido Liminar.',
        exoticDrops: ['Água de Amêndoa Pura', 'Fluido Liminar Condensado']
    },
    {
        id: 'level_run',
        name: 'Nível ! (Corra por sua Vida)',
        description: 'Corredor iluminado em luzes estroboscópicas vermelhas e sirenes ensurdecedoras.',
        emoji: '🚨',
        danger: 'deadly',
        hazardLevel: 'critical',
        riskRewardText: 'Adrenalina pura! Extrai 50 Sucatas e 2 Ligas do Vazio, sob risco de dano.',
        exoticDrops: ['Liga do Vazio Forjada', 'Peças de Anomalia Alfa']
    },
    {
        id: 'the_end',
        name: 'The End (A Falsa Saída)',
        description: 'Armadilha visual de uma biblioteca vazia com fitas magnéticas e códigos transcendentais.',
        emoji: '💾',
        danger: 'cryptic',
        hazardLevel: 'dangerous',
        riskRewardText: 'Cientistas extraem dados cósmicos valiosos: Fluido Liminar e Liga do Vazio.',
        exoticDrops: ['Fitas de Dados Liminares', 'Fluido Liminar Quântico']
    }
];

export interface NoclipEvent {
    id: string;
    level?: NoclipSecretLevel;
    secretLevelId?: string;
    explorerId?: string;
    explorerName?: string;
    sectorId?: string | null;
    timestamp: number;
}

// ==========================================
// 3. FORTIFICAÇÕES E MÓDULOS DE SETOR
// ==========================================
export interface SectorModules {
    radioTower: number;      // 0 a 3: Previne 'lost' (SOS)
    waterCondenser: number;  // 0 a 3: Gera Água de Amêndoa passiva
    scrapBeacon: number;     // 0 a 3: +25% sucata por nível
}

export function isSectorStabilized(
    progressOrSectorId: number | string,
    modules?: SectorModules | Record<string, SectorModules>
): boolean {
    if (typeof progressOrSectorId === 'string' && modules && typeof modules === 'object') {
        const mod = (modules as Record<string, SectorModules>)[progressOrSectorId];
        return !!(mod && mod.radioTower > 0 && mod.waterCondenser > 0 && mod.scrapBeacon > 0);
    }
    if (typeof progressOrSectorId === 'number' && modules) {
        const mod = modules as SectorModules;
        return progressOrSectorId >= 100 && mod.radioTower > 0 && mod.waterCondenser > 0 && mod.scrapBeacon > 0;
    }
    return false;
}

// ==========================================
// 4. TALENTOS E PROGRESSÃO RPG DOS EXPLORADORES
// ==========================================
export interface ExplorerTalentDef {
    id: string;
    name: string;
    classType: BackroomsClass;
    requiredLevel: number;
    description: string;
    icon?: string;
}

export const EXPLORER_TALENTS: ExplorerTalentDef[] = [
    { id: 'scout_light_step', name: 'Passos Leves', classType: 'scout', requiredLevel: 3, description: 'Reduz em 50% o dano de perigos ambientais.' },
    { id: 'scout_detector', name: 'Detector de Sucata', classType: 'scout', requiredLevel: 5, description: '+40% de sucata encontrada em todas as explorações.' },
    { id: 'soldier_mental_shield', name: 'Escudo Mental', classType: 'soldier', requiredLevel: 3, description: 'Reduz em 40% a perda de sanidade do esquadrão.' },
    { id: 'soldier_precision_shot', name: 'Tiro de Precisão', classType: 'soldier', requiredLevel: 5, description: '+75% de dano contra entidades e chefes de transição.' },
    { id: 'scientist_efficient_distill', name: 'Destilador Eficiente', classType: 'scientist', requiredLevel: 3, description: '+50% de recuperação ao consumir Água de Amêndoa.' },
    { id: 'scientist_anomaly_engineer', name: 'Engenheiro de Anomalias', classType: 'scientist', requiredLevel: 5, description: '+50% de chance de extrair Peças de Anomalia ao derrotar entidades.' }
];

export interface BackroomsBoss {
    floor: number;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    emoji: string;
}

export const BACKROOMS_LEVELS: BackroomsLevel[] = [
    {
        id: 'sec_1',
        name: 'Setor 1: Catacumbas (01-15)',
        description: 'Paredes úmidas de tijolos de pedra e tochas bruxuleantes. A era da subsistência e do feudalismo rudimentar.',
        dangerLevel: 'low',
        sanityDrain: 0.08,
        scrapRate: 0.10,
        itemRate: 0.05,
        entityRate: 0.02,
        emoji: '🏰',
        minFloor: 1,
        maxFloor: 15
    },
    {
        id: 'sec_2',
        name: 'Setor 2: A Fuligem (16-30)',
        description: 'Câmara industrial impregnada de fuligem de carvão e engrenagens mecânicas gigantes girando sem parar.',
        dangerLevel: 'medium',
        sanityDrain: 0.15,
        scrapRate: 0.16,
        itemRate: 0.07,
        entityRate: 0.04,
        emoji: '⚙️',
        minFloor: 16,
        maxFloor: 30
    },
    {
        id: 'sec_3',
        name: 'Setor 3: O Dínamo (31-45)',
        description: 'Túneis escuros repletos de cabos de alta tensão estalando e dínamos elétricos vibrando. Ar tóxico detectado.',
        dangerLevel: 'high',
        sanityDrain: 0.30,
        scrapRate: 0.22,
        itemRate: 0.08,
        entityRate: 0.07,
        emoji: '⚡',
        minFloor: 31,
        maxFloor: 45
    },
    {
        id: 'sec_4',
        name: 'Setor 4: O Zumbido (46-60)',
        description: 'Corredores assépticos iluminados por luz estroboscópica e o zumbido estático de computadores a válvula e servidores antigos.',
        dangerLevel: 'high',
        sanityDrain: 0.35,
        scrapRate: 0.25,
        itemRate: 0.09,
        entityRate: 0.08,
        emoji: '🖥️',
        minFloor: 46,
        maxFloor: 60
    },
    {
        id: 'sec_5',
        name: 'Setor 5: O Complexo Estéril (61-75)',
        description: 'Salas de azulejo branco cirúrgico e luz fria. Campos de vácuo parcial causam zumbidos nos ouvidos.',
        dangerLevel: 'high',
        sanityDrain: 0.40,
        scrapRate: 0.28,
        itemRate: 0.10,
        entityRate: 0.09,
        emoji: '🔬',
        minFloor: 61,
        maxFloor: 75
    },
    {
        id: 'sec_6',
        name: 'Setor 6: A Estação Fantasma (76-90)',
        description: 'Instalação de gravidade zero com janelas para o vácuo sideral profundo. Requer trajes de pressurização espacial.',
        dangerLevel: 'deadly',
        sanityDrain: 0.60,
        scrapRate: 0.32,
        itemRate: 0.12,
        entityRate: 0.12,
        emoji: '🚀',
        minFloor: 76,
        maxFloor: 90
    },
    {
        id: 'sec_7',
        name: 'Setor 7: A Falha (91-100)',
        description: 'Geometria não-euclidiana instável e distorções temporais. Fendas cintilantes se abrem e se fecham de forma caótica.',
        dangerLevel: 'deadly',
        sanityDrain: 0.80,
        scrapRate: 0.40,
        itemRate: 0.15,
        entityRate: 0.15,
        emoji: '🌀',
        minFloor: 91,
        maxFloor: 100
    }
];

export const INITIAL_BACKROOMS_EXPLORERS: BackroomsExplorer[] = [
    {
        id: 'exp_init_1',
        name: 'Robert "Scout" Chen',
        classType: 'scout',
        emoji: '🏃‍♂️',
        hp: 100,
        maxHp: 100,
        sanity: 100,
        maxSanity: 100,
        status: 'idle',
        assignedLevel: null,
        equipment: { flashlight: 0, suit: 0, tracker: 0 },
        level: 1,
        xp: 0,
        talents: []
    },
    {
        id: 'exp_init_2',
        name: 'Dr. Evelyn Carter',
        classType: 'scientist',
        emoji: '🥼',
        hp: 100,
        maxHp: 100,
        sanity: 100,
        maxSanity: 100,
        status: 'idle',
        assignedLevel: null,
        equipment: { flashlight: 0, suit: 0, tracker: 0 },
        level: 1,
        xp: 0,
        talents: []
    }
];

export const INITIAL_BACKROOMS_OUTPOST: BackroomsOutpost = {
    refinery: 1,
    quarters: 1,
    sensors: 1
};

export const INITIAL_BACKROOMS_RESOURCES: BackroomsResources = {
    scrap: 10,
    almondWater: 3,
    anomalyParts: 0,
    liminalFluid: 0,
    voidAlloy: 0
};

export const EXPLORER_NAMES = [
    'John Doe', 'Alice Cooper', 'Bob Martin', 'Sarah Connor', 'Gordon Freeman', 
    'Clara Oswald', 'David Miller', 'Elena Rostova', 'Marcus Vance', 'Rachel Green'
];

export const CLASS_EMOJIS = {
    scout: '🏃‍♂️',
    soldier: '🛡️',
    scientist: '🥼'
};

export function createRandomExplorer(): BackroomsExplorer {
    const id = 'exp_' + Math.random().toString(36).substring(2, 9);
    const name = EXPLORER_NAMES[Math.floor(Math.random() * EXPLORER_NAMES.length)];
    const classes: BackroomsClass[] = ['scout', 'soldier', 'scientist'];
    const classType = classes[Math.floor(Math.random() * classes.length)];
    const emoji = CLASS_EMOJIS[classType];

    return {
        id,
        name,
        classType,
        emoji,
        hp: 100,
        maxHp: 100,
        sanity: 100,
        maxSanity: 100,
        status: 'idle',
        assignedLevel: null,
        equipment: { flashlight: 0, suit: 0, tracker: 0 },
        level: 1,
        xp: 0,
        talents: []
    };
}

export function getTransitionBoss(floor: number): BackroomsBoss | null {
    if (floor === 15) {
        return { floor, name: 'A Grande Forja (Guardião de Ferro)', hp: 500, maxHp: 500, attack: 25, defense: 8, emoji: '🤖' };
    }
    if (floor === 30) {
        return { floor, name: 'A Linha de Montagem Infinita (Giga-Pistão)', hp: 1500, maxHp: 1500, attack: 55, defense: 18, emoji: '⚙️' };
    }
    if (floor === 45) {
        return { floor, name: 'A Central Elétrica Estática (Anomalia de Tesla)', hp: 4000, maxHp: 4000, attack: 120, defense: 45, emoji: '⚡' };
    }
    if (floor === 60) {
        return { floor, name: 'A Sala do Servidor Central (Código Corrompido)', hp: 10000, maxHp: 10000, attack: 300, defense: 100, emoji: '👾' };
    }
    if (floor === 75) {
        return { floor, name: 'Câmara de Vácuo Quântico (Vortex Singular)', hp: 25000, maxHp: 25000, attack: 700, defense: 250, emoji: '🕳️' };
    }
    if (floor === 90) {
        return { floor, name: 'O Horizonte de Eventos (Ecos do Buraco Negro)', hp: 70000, maxHp: 70000, attack: 1800, defense: 700, emoji: '🌑' };
    }
    if (floor === 100) {
        return { floor, name: 'A Singularidade do Multiverso (Entidade Final)', hp: 200000, maxHp: 200000, attack: 4500, defense: 1800, emoji: '👁️' };
    }
    return null;
}

export interface BackroomsSimulationOptions {
    containedEntities?: ContainedEntity[];
    sectorModules?: Record<string, SectorModules>;
    dimensionalInstability?: number;
    activeNoclipEvent?: NoclipEvent | null;
}

export function simulateBackroomsTick(
    explorers: BackroomsExplorer[],
    outpost: BackroomsOutpost,
    resources: BackroomsResources,
    logs: string[],
    deltaSeconds: number,
    currentFloor: number = 1,
    bossHp: number | null = null,
    isExploradoresOcultosActive: boolean = false,
    options?: BackroomsSimulationOptions
): {
    updatedExplorers: BackroomsExplorer[];
    gainedResources: Partial<BackroomsResources>;
    newLogs: string[];
    progressGained: number;
    bossHpDamage: number;
    noclipTriggered?: NoclipEvent | null;
    instabilityDelta: number;
} {
    const updatedExplorers = [...explorers];
    const gainedResources: BackroomsResources = {
        scrap: 0,
        almondWater: 0,
        anomalyParts: 0,
        liminalFluid: 0,
        voidAlloy: 0
    };
    const newLogs: string[] = [];
    let progressGained = 0;
    let bossHpDamage = 0;
    let noclipTriggered: NoclipEvent | null = null;

    const pushLog = (msg: string) => {
        if (newLogs.length < 15) {
            newLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
        }
    };

    const contained = options?.containedEntities || [];
    const hasEntity = (id: string) => contained.some(e => e.entityId === id || e.id === id);

    // Bônus passivo de Entidades Contidas
    // Deathmoth goteja Almond Water
    if (hasEntity('deathmoth') && Math.random() < 0.1 * deltaSeconds) {
        gainedResources.almondWater = (gainedResources.almondWater || 0) + 1;
        pushLog(`🦋 [Mariposa da Morte Contida] Névoa condensada produziu +1 Água de Amêndoa.`);
    }

    let activeExplorersCount = 0;

    for (let i = 0; i < updatedExplorers.length; i++) {
        const explorer = { ...updatedExplorers[i] };
        // Garante valores default de nível e talentos
        explorer.level = explorer.level || 1;
        explorer.xp = explorer.xp || 0;
        explorer.talents = explorer.talents || [];

        if (explorer.status === 'lost') {
            continue;
        }

        if (explorer.status === 'resting') {
            // Dormitórios aceleram recuperação de HP e sanidade
            const recoveryRate = 1.0 + (outpost.quarters * 0.7);
            const sanityGain = recoveryRate * deltaSeconds * 2.5;
            const hpGain = recoveryRate * deltaSeconds * 2.0;

            explorer.sanity = Math.min(explorer.maxSanity, explorer.sanity + sanityGain);
            explorer.hp = Math.min(explorer.maxHp, explorer.hp + hpGain);

            if (explorer.sanity >= explorer.maxSanity && explorer.hp >= explorer.maxHp) {
                explorer.status = 'idle';
                pushLog(`${explorer.emoji} ${explorer.name} terminou de descansar e está pronto.`);
            }
            updatedExplorers[i] = explorer;
            continue;
        }

        if (explorer.status === 'exploring' && explorer.assignedLevel) {
            activeExplorersCount++;
            const lvl = BACKROOMS_LEVELS.find(l => l.id === explorer.assignedLevel);
            if (!lvl) {
                explorer.status = 'idle';
                explorer.assignedLevel = null;
                updatedExplorers[i] = explorer;
                continue;
            }

            const sectorMod = options?.sectorModules?.[explorer.assignedLevel];
            const hasTalent = (tId: string) => (explorer.talents || []).includes(tId);

            // Ganho de XP e Level Up
            const baseExpPerSec = 1.2 + (lvl.dangerLevel === 'deadly' ? 3.0 : lvl.dangerLevel === 'high' ? 1.8 : 0.8);
            explorer.xp += baseExpPerSec * deltaSeconds;
            const nextLevelXp = explorer.level * 100;
            if (explorer.xp >= nextLevelXp && explorer.level < 10) {
                explorer.level += 1;
                explorer.xp -= nextLevelXp;
                explorer.maxHp += 10;
                explorer.maxSanity += 10;
                explorer.hp = Math.min(explorer.maxHp, explorer.hp + 10);
                explorer.sanity = Math.min(explorer.maxSanity, explorer.sanity + 10);
                pushLog(`⭐ ${explorer.emoji} ${explorer.name} avançou para o Nível ${explorer.level}! (+10 Max HP/Sanidade)`);
            }

            // Cura passiva por talento Scientist Field Medic
            if (hasTalent('scientist_field_medic')) {
                explorer.hp = Math.min(explorer.maxHp, explorer.hp + 1.2 * deltaSeconds);
            }

            // Equipamento & Bônus
            const flashlightBonus = explorer.equipment.flashlight * 0.15;
            let suitReduction = explorer.equipment.suit * 0.22; // Nível 3 = 66% de redução
            if (hasTalent('soldier_iron_skin')) {
                suitReduction = Math.min(0.85, suitReduction + 0.30);
            }
            if (hasEntity('smiler')) {
                suitReduction = Math.min(0.90, suitReduction + 0.15);
            }

            const trackerReduction = explorer.equipment.tracker * 0.2;

            // Perigos Ambientais
            let envDmg = 0;
            let envSanity = 0;
            
            // Floor 31-75: Ar Tóxico (Exige traje nível >= 2)
            if (currentFloor >= 31 && currentFloor <= 75) {
                if (explorer.equipment.suit < 2) {
                    envDmg = 1.2;
                    envSanity = 1.5;
                }
            }
            // Floor 76-100: Vácuo (Exige traje nível >= 3)
            if (currentFloor >= 76) {
                if (explorer.equipment.suit < 3) {
                    envDmg = 3.5;
                    envSanity = 4.0;
                }
            }

            // Aplicar dano ambiental mitigado por suit level
            if (envDmg > 0) {
                const finalEnvDmg = Math.max(0.5, envDmg * (1 - suitReduction));
                explorer.hp = Math.max(0, explorer.hp - finalEnvDmg * deltaSeconds);
                explorer.sanity = Math.max(0, explorer.sanity - envSanity * (1 - trackerReduction) * deltaSeconds);
                if (Math.random() < 0.05) {
                    pushLog(`⚠️ ${explorer.emoji} ${explorer.name} está sofrendo com a pressão ambiental extrema!`);
                }
            }

            // Dreno de Sanidade Normal
            const baseSanityDrain = lvl.sanityDrain;
            let finalSanityDrain = baseSanityDrain;
            if (finalSanityDrain > 0) {
                let classMult = explorer.classType === 'scientist' ? 0.65 : 1.0;
                if (hasTalent('scientist_rationality')) {
                    classMult *= 0.60;
                }
                if (hasEntity('faceling')) {
                    classMult *= 0.80; // Faceling diminui dreno de sanidade
                }
                finalSanityDrain = baseSanityDrain * classMult * (1 - trackerReduction);
            } else if (finalSanityDrain < 0) {
                // Poolrooms restaura sanidade
                finalSanityDrain = baseSanityDrain * (1 + (outpost.refinery * 0.1));
            }
            explorer.sanity = Math.max(0, Math.min(explorer.maxSanity, explorer.sanity - finalSanityDrain * deltaSeconds));

            // Acumular progresso de exploração (Scout ajuda)
            let speedMult = explorer.classType === 'scout' ? 1.4 : 1.0;
            if (hasTalent('scout_cartography')) {
                speedMult += 0.25;
            }
            let progTick = (0.2 + (explorer.equipment.tracker * 0.1)) * speedMult * deltaSeconds;
            if (isExploradoresOcultosActive) {
                progTick *= 1.1765;
            }
            progressGained += progTick;

            // Bônus do Condensador de Água do Setor
            if (sectorMod && sectorMod.waterCondenser > 0 && Math.random() < sectorMod.waterCondenser * 0.04 * deltaSeconds) {
                gainedResources.almondWater = (gainedResources.almondWater || 0) + 1;
                pushLog(`💧 Condensador do setor purificou +1 Água de Amêndoa.`);
            }

            // Ações de Exploração ou Combate com Chefe
            const isTransitionFloor = [15, 30, 45, 60, 75, 90, 100].includes(currentFloor);
            
            if (isTransitionFloor && bossHp !== null && bossHp > 0) {
                const boss = getTransitionBoss(currentFloor);
                if (boss) {
                    const combatChance = 0.20 * deltaSeconds;
                    if (Math.random() < combatChance) {
                        let explorerDmg = Math.max(5, (explorer.classType === 'soldier' ? 25 : 12) + (explorer.equipment.flashlight * 8));
                        if (hasTalent('soldier_heavy_strike')) {
                            explorerDmg = Math.floor(explorerDmg * 1.5);
                        }
                        if (hasEntity('hound')) {
                            explorerDmg = Math.floor(explorerDmg * 1.2);
                        }
                        bossHpDamage += explorerDmg;
                        
                        const bossDmg = Math.max(1, Math.floor(boss.attack * (explorer.classType === 'soldier' ? 0.6 : 1.0) * (1 - suitReduction)));
                        explorer.hp = Math.max(0, explorer.hp - bossDmg);
                        explorer.sanity = Math.max(0, explorer.sanity - 8);

                        pushLog(`⚔️ ${explorer.emoji} ${explorer.name} está combatendo ${boss.name}! Deu ${explorerDmg} dano, sofreu ${bossDmg} HP.`);
                    }
                }
            } else {
                // Ações normais de exploração
                const actionChance = 0.08 * deltaSeconds;
                if (Math.random() < actionChance) {
                    const roll = Math.random();
                    const dropMult = isExploradoresOcultosActive ? 1.15 : 1.0;

                    // 1. Encontro com Entidade Comum
                    if (roll < lvl.entityRate * (1 - trackerReduction)) {
                        const dodged = hasTalent('scout_evasion') && Math.random() < 0.25;
                        if (dodged) {
                            pushLog(`💨 ${explorer.emoji} ${explorer.name} esquivou com agilidade de uma criatura no ${lvl.name}!`);
                        } else {
                            const baseDamage = lvl.dangerLevel === 'deadly' ? 40 : lvl.dangerLevel === 'high' ? 22 : 10;
                            const classDmgMult = explorer.classType === 'soldier' ? 0.55 : 1.0;
                            const finalDamage = Math.max(1, Math.floor(baseDamage * classDmgMult * (1 - suitReduction)));

                            explorer.hp = Math.max(0, explorer.hp - finalDamage);
                            explorer.sanity = Math.max(0, explorer.sanity - 10);
                            pushLog(`⚠️ ${explorer.emoji} ${explorer.name} encontrou uma Entidade no ${lvl.name} e perdeu ${finalDamage} HP!`);

                            let entityKillDropRate = 0.35 * dropMult;
                            if (hasTalent('scientist_dimension_analysis')) {
                                entityKillDropRate += 0.20;
                            }
                            if (Math.random() < entityKillDropRate) {
                                gainedResources.anomalyParts = (gainedResources.anomalyParts || 0) + 1;
                                pushLog(`⚔️ ${explorer.emoji} ${explorer.name} derrotou a criatura e coletou 1 Peça de Anomalia!`);

                                // Chance de recurso exótico Void Alloy
                                if ((hasEntity('skin_stealer') || currentFloor >= 30) && Math.random() < 0.15) {
                                    gainedResources.voidAlloy = (gainedResources.voidAlloy || 0) + 1;
                                    pushLog(`🌌 [Recurso Exótico] ${explorer.name} extraiu 1 Liga do Vazio dos restos deformados!`);
                                }
                            }
                        }
                    }
                    // 2. Coletar Sucata
                    else if (roll < lvl.entityRate * (1 - trackerReduction) + lvl.scrapRate * (1 + flashlightBonus) * dropMult) {
                        let multiplier = explorer.classType === 'scout' ? 2.0 : 1.0;
                        if (hasTalent('scout_scavenger')) {
                            multiplier *= 1.5;
                        }
                        if (hasEntity('partygoer')) {
                            multiplier *= 2.0; // Partygoer dobra sucatas
                        }
                        const scrapBeaconBonus = sectorMod?.scrapBeacon ? (1 + sectorMod.scrapBeacon * 0.25) : 1.0;
                        const scrapFound = Math.floor((1 + Math.random() * 4) * multiplier * scrapBeaconBonus * dropMult);
                        gainedResources.scrap = (gainedResources.scrap || 0) + scrapFound;
                        pushLog(`🔧 ${explorer.emoji} ${explorer.name} coletou ${scrapFound} Sucatas.`);

                        // Chance de colher Fluido Liminar com Cientistas ou em andares avançados
                        if ((hasTalent('scientist_dimension_analysis') || currentFloor >= 20) && Math.random() < 0.12) {
                            gainedResources.liminalFluid = (gainedResources.liminalFluid || 0) + 1;
                            pushLog(`🧪 [Recurso Exótico] ${explorer.name} sintetizou 1 Fluido Liminar condensado!`);
                        }
                    }
                    // 3. Achar Água de Amêndoa
                    else if (roll < lvl.entityRate * (1 - trackerReduction) + lvl.scrapRate * (1 + flashlightBonus) * dropMult + lvl.itemRate * dropMult) {
                        gainedResources.almondWater = (gainedResources.almondWater || 0) + 1;
                        pushLog(`🧴 ${explorer.emoji} ${explorer.name} encontrou Água de Amêndoa.`);
                    }
                }
            }

            // Checks de Morte / Perdição com proteção de Torre de Rádio e Último Suspiro
            if (explorer.hp <= 0 && hasTalent('soldier_last_stand') && explorer.hp > -999) {
                explorer.hp = 25;
                pushLog(`🛡️ [Último Suspiro] ${explorer.emoji} ${explorer.name} se recusou a cair e recuperou 25 HP!`);
            }

            if (explorer.hp <= 0 || explorer.sanity <= 0) {
                // Se o setor tiver Torre de Rádio ativa, intercepta a perdição e resgata para resting!
                if (sectorMod && sectorMod.radioTower > 0) {
                    explorer.status = 'resting';
                    explorer.hp = 15;
                    explorer.sanity = 15;
                    explorer.assignedLevel = null;
                    pushLog(`📡 [Torre de Rádio] Sinal de emergência transmitido! ${explorer.emoji} ${explorer.name} foi resgatado no ${lvl.name} antes de se perder!`);
                } else {
                    explorer.status = 'lost';
                    explorer.assignedLevel = null;
                    if (explorer.hp <= 0) {
                        pushLog(`💀 PERIGO: ${explorer.emoji} ${explorer.name} foi consumido pelas sombras das Backrooms.`);
                    } else {
                        pushLog(`👁️ PERIGO: ${explorer.emoji} ${explorer.name} perdeu o juízo e se perdeu no labirinto infinito.`);
                    }
                }
            }

            // Chance de disparar Evento de Noclip
            if (!options?.activeNoclipEvent && !noclipTriggered && Math.random() < 0.006 * deltaSeconds) {
                const randomSecret = NOCLIP_LEVELS[Math.floor(Math.random() * NOCLIP_LEVELS.length)];
                noclipTriggered = {
                    id: `noclip_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    level: randomSecret,
                    secretLevelId: randomSecret.id,
                    timestamp: Date.now(),
                    sectorId: explorer.assignedLevel
                };
                pushLog(`🌀 [NOCLIP DETECTADO] O tecido do espaço dobrou! Passagem aberta para: ${randomSecret.name}!`);
            }

            updatedExplorers[i] = explorer;
        }
    }

    // Cálculo da Instabilidade Dimensional
    let instabilityDelta = 0.03 * deltaSeconds * activeExplorersCount;
    if (hasEntity('partygoer')) {
        instabilityDelta *= 1.5;
    }
    if (hasEntity('faceling')) {
        instabilityDelta *= 0.8;
    }

    return {
        updatedExplorers,
        gainedResources,
        newLogs,
        progressGained,
        bossHpDamage,
        noclipTriggered,
        instabilityDelta
    };
}

export interface BackroomsResearch {
    id: string;
    name: string;
    description: string;
    cost: {
        scrap: number;
        almondWater: number;
        anomalyParts: number;
    };
    effectText: string;
    minFloor: number;
    era: string;
}

export const BACKROOMS_RESEARCHES: BackroomsResearch[] = [
    // Era 1: Medieval
    {
        id: 'alchemical_distill',
        name: 'Destilação Alquímica',
        description: 'Desenvolve métodos industriais para purificar Almond Water em escala laboratorial.',
        cost: { scrap: 20, almondWater: 1, anomalyParts: 0 },
        effectText: '+15% Recuperação de sanidade da Almond Water',
        minFloor: 1,
        era: 'Era Medieval'
    },
    {
        id: 'cult_rotation',
        name: 'Rotação de Culturas',
        description: 'Implementa técnicas de rodízio de plantio nas fazendas e canteiros terrestres.',
        cost: { scrap: 15, almondWater: 0, anomalyParts: 0 },
        effectText: '+10% Velocidade de cultivo no Jardim Místico',
        minFloor: 1,
        era: 'Era Medieval'
    },
    {
        id: 'iron_metallurgy',
        name: 'Metalurgia do Ferro',
        description: 'Desenvolve forjas de fusão para produzir ferramentas e brocas de escavação duráveis.',
        cost: { scrap: 25, almondWater: 0, anomalyParts: 0 },
        effectText: '+15% Velocidade de mineração de Cobre e Ferro',
        minFloor: 5,
        era: 'Era Medieval'
    },
    {
        id: 'windmills',
        name: 'Moinhos de Vento/Água',
        description: 'Utiliza energia mecânica rudimentar para acelerar tarefas cotidianas repetitivas.',
        cost: { scrap: 35, almondWater: 1, anomalyParts: 0 },
        effectText: '+5% Velocidade do jogo global',
        minFloor: 10,
        era: 'Era Medieval'
    },
    // Era 2: Industrial
    {
        id: 'steam_engine',
        name: 'Motor a Vapor',
        description: 'Substitui a tração manual por pistões a vapor automatizados nos distritos mercantis.',
        cost: { scrap: 50, almondWater: 2, anomalyParts: 1 },
        effectText: '+15% Produção passiva de Ouro',
        minFloor: 16,
        era: 'Era Industrial & Vapor'
    },
    {
        id: 'superconductors_liminal',
        name: 'Supercondutores Liminares',
        description: 'Materiais de resistência nula recuperados de salas liminares para redes elétricas perfeitas.',
        cost: { scrap: 65, almondWater: 2, anomalyParts: 1 },
        effectText: '🏭 Desbloqueia Módulo de Eficiência III (-50% consumo MW) na Indústria',
        minFloor: 18,
        era: 'Era Industrial & Vapor'
    },
    {
        id: 'large_mining',
        name: 'Extração de Larga Escala',
        description: 'Estabelece eixos de poços profundos com elevadores a vapor para exploração mineral em massa.',
        cost: { scrap: 80, almondWater: 3, anomalyParts: 2 },
        effectText: '+25% Velocidade de Mineração Global',
        minFloor: 22,
        era: 'Era Industrial & Vapor'
    },
    {
        id: 'liminal_beacons',
        name: 'Balizas de Frequência Liminar',
        description: 'Emissores de ressonância dimensional que aceleram máquinas industriais vizinhas.',
        cost: { scrap: 95, almondWater: 3, anomalyParts: 2 },
        effectText: '🏭 Desbloqueia Balizas Industriais (+20% velocidade em área)',
        minFloor: 28,
        era: 'Era Industrial & Vapor'
    },
    // Era 3: Atômica
    {
        id: 'fission_nuclear',
        name: 'Fissão Nuclear',
        description: 'Aproveita a energia da quebra do átomo para irradiar e amplificar a força da guilda.',
        cost: { scrap: 120, almondWater: 3, anomalyParts: 3 },
        effectText: '+20% HP e Dano máximo aos heróis',
        minFloor: 31,
        era: 'Era Atômica & Digital'
    },
    {
        id: 'quantum_automation',
        name: 'Automação Quântica',
        description: 'Inseridores e esteiras sem atrito acelerados por micro-portais gravitacionais.',
        cost: { scrap: 140, almondWater: 4, anomalyParts: 3 },
        effectText: '🏭 Desbloqueia Inseridores Quânticos e Esteiras de Matéria Espacial (3× velocidade)',
        minFloor: 35,
        era: 'Era Atômica & Digital'
    },
    {
        id: 'silicon_network',
        name: 'Redes de Silício (Microchips)',
        description: 'Desenvolve chips lógicos de computação para coordenar ressurreições automáticas.',
        cost: { scrap: 150, almondWater: 4, anomalyParts: 4 },
        effectText: '+10% Velocidade de ressurreição automática',
        minFloor: 46,
        era: 'Era Atômica & Digital'
    },
    // Era 4: Quântica
    {
        id: 'dimensional_science_pack',
        name: 'Pacote de Ciência Dimensional',
        description: 'Sintetiza pacotes de pesquisa contendo dados de microfendas liminares purificadas.',
        cost: { scrap: 180, almondWater: 5, anomalyParts: 4 },
        effectText: '🏭 Desbloqueia Pacote de Ciência Dimensional na Indústria',
        minFloor: 50,
        era: 'Era Quântica & Fusão'
    },
    {
        id: 'cosmic_radar',
        name: 'Radar Cósmico Transdimensional',
        description: 'Sensores de longo alcance capazes de mapear setores estelares ocultos na Galáxia.',
        cost: { scrap: 210, almondWater: 5, anomalyParts: 5 },
        effectText: '🚀 Revela Setores Cósmicos Ocultos (Níveis 50 a 250) na Galáxia',
        minFloor: 55,
        era: 'Era Quântica & Fusão'
    },
    {
        id: 'clean_fusion',
        name: 'Fusão Limpa Comercial',
        description: 'Reatores de fusão estável fornecem eletricidade limpa ilimitada para o mercado.',
        cost: { scrap: 230, almondWater: 5, anomalyParts: 5 },
        effectText: '+20% Ganho de Ouro e Almas global',
        minFloor: 61,
        era: 'Era Quântica & Fusão'
    },
    {
        id: 'quantum_computing',
        name: 'Computação Quântica',
        description: 'Computadores quânticos analisam fraquezas dos inimigos em tempo real.',
        cost: { scrap: 250, almondWater: 6, anomalyParts: 6 },
        effectText: '+25% Dano Crítico global dos heróis',
        minFloor: 68,
        era: 'Era Quântica & Fusão'
    },
    // Era 5: Espacial
    {
        id: 'antimatter_reactor',
        name: 'Reator de Antimatéria',
        description: 'Gerador industrial de energia colossal gerada pela aniquilação controlada de matéria escura.',
        cost: { scrap: 300, almondWater: 7, anomalyParts: 7 },
        effectText: '🏭 Desbloqueia Gerador de 5.000 MW na Indústria (Matéria Escura + Urânio)',
        minFloor: 72,
        era: 'Era Espacial'
    },
    {
        id: 'hyperdense_alloy_hull',
        name: 'Casco de Liga Hiper-Densa',
        description: 'Estrutura blindada forjada com partículas liminares para o Couraçado Dreadnought.',
        cost: { scrap: 340, almondWater: 8, anomalyParts: 8 },
        effectText: '🚀 Desbloqueia o Couraçado Dreadnought (5× poder de fogo e escudo) na Nave',
        minFloor: 75,
        era: 'Era Espacial'
    },
    {
        id: 'antimatter_prop',
        name: 'Propulsão de Antimatéria',
        description: 'Desenvolve propulsores que usam aniquilação de pósitrons para expedições interestelares rápidos.',
        cost: { scrap: 380, almondWater: 8, anomalyParts: 8 },
        effectText: '-25% Tempo de Expedições espaciais / da Galáxia',
        minFloor: 78,
        era: 'Era Espacial'
    },
    {
        id: 'asteroid_mining',
        name: 'Mineração de Asteroides',
        description: 'Envia sondas autônomas para capturar meteoroides ricos em minérios estelares.',
        cost: { scrap: 450, almondWater: 10, anomalyParts: 10 },
        effectText: '+40% Recursos e poeira estelar extraídos na Galáxia',
        minFloor: 82,
        era: 'Era Espacial'
    },
    {
        id: 'space_warp',
        name: 'Estudos de Dobra Espacial',
        description: 'Estuda métricas de dobra Alcubierre para cruzar a galáxia instantaneamente.',
        cost: { scrap: 500, almondWater: 12, anomalyParts: 12 },
        effectText: '🚀 Desbloqueia a Galáxia e Viagem Espacial Instantânea (Sem Delay)',
        minFloor: 86,
        era: 'Era Espacial'
    },
    {
        id: 'stellar_void_portal',
        name: 'Portal do Vazio Estelar',
        description: 'Canaliza o vácuo espacial profundo para colheita autônoma de Matéria do Vazio e Starlight.',
        cost: { scrap: 600, almondWater: 14, anomalyParts: 14 },
        effectText: '🌌 Expedições Galácticas Coletam Poeira Cósmica e Matéria do Vazio',
        minFloor: 90,
        era: 'Era Espacial'
    },
    // Era 6: Inter-Dimensional
    {
        id: 'vacuum_siphon',
        name: 'Sifão do Vácuo Quântico',
        description: 'Drena energia e recursos de dimensões adjacentes vazias diretamente para a Mochila.',
        cost: { scrap: 700, almondWater: 15, anomalyParts: 15 },
        effectText: 'Geração passiva de minerais de mineração',
        minFloor: 91,
        era: 'Era Inter-Dimensional'
    },
    {
        id: 'dimensional_singularity',
        name: 'Singularidade Inter-Dimensional',
        description: 'Abre o portal final unindo todas as realidades alternativas. Vitória dimensional suprema.',
        cost: { scrap: 1000, almondWater: 20, anomalyParts: 20 },
        effectText: 'Ativa o Portal Final (Vitória do Jogo)',
        minFloor: 100,
        era: 'Era Inter-Dimensional'
    }
];

export function captureEntity(
    entityId: string,
    resources: BackroomsResources,
    currentCaptured: ContainedEntity[]
): {
    success: boolean;
    newResources: BackroomsResources;
    newCaptured: ContainedEntity[];
    message: string;
} {
    const entityDef = BACKROOMS_ENTITIES.find(e => e.id === entityId);
    if (!entityDef) {
        return { success: false, newResources: resources, newCaptured: currentCaptured, message: 'Entidade não reconhecida pelo Bestiário M.E.G.' };
    }

    if (currentCaptured.some(e => (e.entityId || e.id) === entityId)) {
        return { success: false, newResources: resources, newCaptured: currentCaptured, message: `${entityDef.name} já está contido na câmara.` };
    }

    const cost = entityDef.captureCost;
    if (
        (resources.almondWater || 0) < cost.almondWater ||
        (resources.anomalyParts || 0) < cost.anomalyParts ||
        (cost.liminalFluid && (resources.liminalFluid || 0) < cost.liminalFluid)
    ) {
        return { success: false, newResources: resources, newCaptured: currentCaptured, message: 'Recursos insuficientes para conter a entidade com segurança.' };
    }

    const newResources: BackroomsResources = {
        ...resources,
        almondWater: (resources.almondWater || 0) - cost.almondWater,
        anomalyParts: (resources.anomalyParts || 0) - cost.anomalyParts,
        liminalFluid: (resources.liminalFluid || 0) - (cost.liminalFluid || 0)
    };

    const newEntity: ContainedEntity = {
        ...entityDef,
        entityId: entityDef.id,
        level: 1,
        capturedAt: Date.now(),
        synergyActive: true
    };

    return {
        success: true,
        newResources,
        newCaptured: [...currentCaptured, newEntity],
        message: `Sucesso! ${entityDef.name} foi contido com sucesso na Câmara Liminar.`
    };
}

export function resolveNoclipEvent(
    event: NoclipEvent,
    choice: 'enter' | 'ignore',
    explorers: BackroomsExplorer[],
    resources: BackroomsResources
): {
    updatedExplorers: BackroomsExplorer[];
    updatedResources: BackroomsResources;
    log: string;
} {
    const updatedExplorers = explorers.map(e => ({ ...e }));
    const updatedResources = { ...resources };

    if (choice === 'ignore') {
        return {
            updatedExplorers,
            updatedResources,
            log: 'O destacamento evitou a falha dimensional e seguiu a rota segura.'
        };
    }

    const secretId = event.secretLevelId || event.level?.id;
    const secret = NOCLIP_LEVELS.find(l => l.id === secretId);
    if (!secret) {
        return {
            updatedExplorers,
            updatedResources,
            log: 'A fenda colapsou antes da entrada.'
        };
    }

    if (secret.id === 'poolrooms') {
        for (const exp of updatedExplorers) {
            if (exp.status !== 'lost') {
                exp.sanity = exp.maxSanity;
                exp.hp = Math.min(exp.maxHp, exp.hp + 25);
            }
        }
        updatedResources.almondWater = (updatedResources.almondWater || 0) + 6;
        updatedResources.liminalFluid = (updatedResources.liminalFluid || 0) + 2;
        return {
            updatedExplorers,
            updatedResources,
            log: '🏊‍♂️ As águas tépidas dos Poolrooms purificaram a mente dos exploradores! Sanidade restaurada e Fluido Liminar colhido.'
        };
    }

    if (secret.id === 'level_run') {
        for (const exp of updatedExplorers) {
            if (exp.status !== 'lost') {
                const dmg = exp.classType === 'soldier' ? 15 : 28;
                exp.hp = Math.max(1, exp.hp - dmg);
                exp.xp = (exp.xp || 0) + 120;
            }
        }
        updatedResources.scrap = (updatedResources.scrap || 0) + 50;
        updatedResources.anomalyParts = (updatedResources.anomalyParts || 0) + 3;
        updatedResources.voidAlloy = (updatedResources.voidAlloy || 0) + 2;
        return {
            updatedExplorers,
            updatedResources,
            log: '🚨 NÍVEL ! SUPERADO: Corrida frenética concluída! Os exploradores escaparam trazendo 50 Sucatas e 2 Ligas do Vazio.'
        };
    }

    if (secret.id === 'the_end') {
        for (const exp of updatedExplorers) {
            if (exp.status !== 'lost') {
                if (exp.classType === 'scientist') {
                    exp.xp = (exp.xp || 0) + 200;
                } else {
                    exp.sanity = Math.max(10, exp.sanity - 25);
                }
            }
        }
        updatedResources.liminalFluid = (updatedResources.liminalFluid || 0) + 3;
        updatedResources.voidAlloy = (updatedResources.voidAlloy || 0) + 2;
        return {
            updatedExplorers,
            updatedResources,
            log: '📼 "The End" decifrado! Cientistas extraíram fitas dimensionais valiosas contendo Fluido Liminar e Liga do Vazio.'
        };
    }

    return {
        updatedExplorers,
        updatedResources,
        log: 'Exploração da sala secreta concluída.'
    };
}

export function upgradeSectorModule(
    sectorId: string,
    moduleType: keyof SectorModules,
    currentModules: Record<string, SectorModules>,
    resources: BackroomsResources
): {
    success: boolean;
    newModules: Record<string, SectorModules>;
    newResources: BackroomsResources;
    message: string;
} {
    const existing = currentModules[sectorId] || { radioTower: 0, waterCondenser: 0, scrapBeacon: 0 };
    const currentLevel = existing[moduleType] || 0;

    if (currentLevel >= 3) {
        return {
            success: false,
            newModules: currentModules,
            newResources: resources,
            message: 'O módulo já atingiu o nível máximo (3).'
        };
    }

    const costMap: Record<keyof SectorModules, { scrap: number; almondWater: number; anomalyParts: number }> = {
        radioTower: { scrap: 50 * (currentLevel + 1), almondWater: 2 * (currentLevel + 1), anomalyParts: 1 * (currentLevel + 1) },
        waterCondenser: { scrap: 35 * (currentLevel + 1), almondWater: 1 * (currentLevel + 1), anomalyParts: 0 },
        scrapBeacon: { scrap: 40 * (currentLevel + 1), almondWater: 0, anomalyParts: 1 * (currentLevel + 1) }
    };

    const cost = costMap[moduleType];
    if (
        (resources.scrap || 0) < cost.scrap ||
        (resources.almondWater || 0) < cost.almondWater ||
        (resources.anomalyParts || 0) < cost.anomalyParts
    ) {
        return {
            success: false,
            newModules: currentModules,
            newResources: resources,
            message: 'Recursos insuficientes para aprimorar o módulo do setor.'
        };
    }

    const newResources: BackroomsResources = {
        ...resources,
        scrap: (resources.scrap || 0) - cost.scrap,
        almondWater: (resources.almondWater || 0) - cost.almondWater,
        anomalyParts: (resources.anomalyParts || 0) - cost.anomalyParts
    };

    const newModules: Record<string, SectorModules> = {
        ...currentModules,
        [sectorId]: {
            ...existing,
            [moduleType]: currentLevel + 1
        }
    };

    return {
        success: true,
        newModules,
        newResources,
        message: `Módulo aprimorado para o Nível ${currentLevel + 1} no setor!`
    };
}

export function sealDimensionalRift(
    method: 'scrap' | 'heroCombat',
    resources: BackroomsResources,
    heroPower: number,
    currentInstability: number
): {
    success: boolean;
    newResources: BackroomsResources;
    newInstability: number;
    message: string;
} {
    if (currentInstability <= 0) {
        return {
            success: false,
            newResources: resources,
            newInstability: 0,
            message: 'A membrana dimensional já está totalmente estável (0% instabilidade).'
        };
    }

    if (method === 'scrap') {
        const scrapCost = 50;
        const almondCost = 2;
        if ((resources.scrap || 0) < scrapCost || (resources.almondWater || 0) < almondCost) {
            return {
                success: false,
                newResources: resources,
                newInstability: currentInstability,
                message: 'Sucata ou Água de Amêndoa insuficientes para ancoragem dimensional.'
            };
        }

        const newResources: BackroomsResources = {
            ...resources,
            scrap: (resources.scrap || 0) - scrapCost,
            almondWater: (resources.almondWater || 0) - almondCost
        };
        const newInstability = Math.max(0, currentInstability - 35);

        return {
            success: true,
            newResources,
            newInstability,
            message: `Âncora estabilizadora instalada com sucesso! Instabilidade reduzida para ${newInstability.toFixed(0)}%.`
        };
    }

    if (method === 'heroCombat') {
        if (heroPower < 30) {
            return {
                success: false,
                newResources: resources,
                newInstability: currentInstability,
                message: 'Poder militar da guilda insuficiente para conter a fenda (mínimo: 30 de Poder).'
            };
        }

        const newResources: BackroomsResources = {
            ...resources,
            anomalyParts: (resources.anomalyParts || 0) + 2,
            voidAlloy: (resources.voidAlloy || 0) + 1
        };
        const newInstability = Math.max(0, currentInstability - 50);

        return {
            success: true,
            newResources,
            newInstability,
            message: `A patrulha de heróis derrotou a invasão da fenda! +2 Peças de Anomalia e +1 Liga do Vazio obtidos. Instabilidade reduzida para ${newInstability.toFixed(0)}%.`
        };
    }

    return {
        success: false,
        newResources: resources,
        newInstability: currentInstability,
        message: 'Método de selamento desconhecido.'
    };
}

export function unlockExplorerTalent(
    explorer: BackroomsExplorer,
    talentId: string
): {
    success: boolean;
    updatedExplorer: BackroomsExplorer;
    message: string;
} {
    const talent = EXPLORER_TALENTS.find(t => t.id === talentId);
    if (!talent) {
        return { success: false, updatedExplorer: explorer, message: 'Talento não encontrado.' };
    }

    if (talent.classType !== explorer.classType) {
        return { success: false, updatedExplorer: explorer, message: `Este talento pertence à classe ${talent.classType}.` };
    }

    const currentLevel = explorer.level || 1;
    if (currentLevel < talent.requiredLevel) {
        return { success: false, updatedExplorer: explorer, message: `Requer Nível ${talent.requiredLevel} de explorador.` };
    }

    const currentTalents = explorer.talents || [];
    if (currentTalents.includes(talentId)) {
        return { success: false, updatedExplorer: explorer, message: 'Talento já desbloqueado.' };
    }

    const updatedExplorer: BackroomsExplorer = {
        ...explorer,
        talents: [...currentTalents, talentId]
    };

    return {
        success: true,
        updatedExplorer,
        message: `Talento "${talent.name}" desbloqueado para ${explorer.name}!`
    };
}

