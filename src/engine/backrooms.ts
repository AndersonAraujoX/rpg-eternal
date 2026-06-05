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
}

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
        equipment: { flashlight: 0, suit: 0, tracker: 0 }
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

export function simulateBackroomsTick(
    explorers: BackroomsExplorer[],
    outpost: BackroomsOutpost,
    resources: BackroomsResources,
    logs: string[],
    deltaSeconds: number,
    currentFloor: number,
    bossHp: number | null
): {
    updatedExplorers: BackroomsExplorer[];
    gainedResources: Partial<BackroomsResources>;
    newLogs: string[];
    progressGained: number;
    bossHpDamage: number;
} {
    const updatedExplorers = [...explorers];
    const gainedResources: BackroomsResources = { scrap: 0, almondWater: 0, anomalyParts: 0 };
    const newLogs: string[] = [];
    let progressGained = 0;
    let bossHpDamage = 0;

    const pushLog = (msg: string) => {
        if (newLogs.length < 15) {
            newLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
        }
    };

    for (let i = 0; i < updatedExplorers.length; i++) {
        let explorer = { ...updatedExplorers[i] };

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
            const lvl = BACKROOMS_LEVELS.find(l => l.id === explorer.assignedLevel);
            if (!lvl) {
                explorer.status = 'idle';
                explorer.assignedLevel = null;
                updatedExplorers[i] = explorer;
                continue;
            }

            // Equipamento & Bônus
            const flashlightBonus = explorer.equipment.flashlight * 0.15;
            const suitReduction = explorer.equipment.suit * 0.22; // Nível 3 = 66% de redução
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
                const classMult = explorer.classType === 'scientist' ? 0.65 : 1.0;
                finalSanityDrain = baseSanityDrain * classMult * (1 - trackerReduction);
            } else if (finalSanityDrain < 0) {
                // Poolrooms restaura sanidade
                finalSanityDrain = baseSanityDrain * (1 + (outpost.refinery * 0.1));
            }
            explorer.sanity = Math.max(0, Math.min(explorer.maxSanity, explorer.sanity - finalSanityDrain * deltaSeconds));

            // Acumular progresso de exploração (Scout ajuda)
            const speedMult = explorer.classType === 'scout' ? 1.4 : 1.0;
            const progTick = (0.2 + (explorer.equipment.tracker * 0.1)) * speedMult * deltaSeconds;
            progressGained += progTick;

            // Ações de Exploração ou Combate com Chefe
            const isTransitionFloor = [15, 30, 45, 60, 75, 90, 100].includes(currentFloor);
            
            // Se estiver em andar de transição no final da exploração, lutar com o chefe
            if (isTransitionFloor && bossHp !== null && bossHp > 0) {
                // Combate contra chefe de transição
                const boss = getTransitionBoss(currentFloor);
                if (boss) {
                    const combatChance = 0.20 * deltaSeconds;
                    if (Math.random() < combatChance) {
                        // Ataca o chefe
                        const explorerDmg = Math.max(5, (explorer.classType === 'soldier' ? 25 : 12) + (explorer.equipment.flashlight * 8));
                        bossHpDamage += explorerDmg;
                        
                        // Chefe revida
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

                    // 1. Encontro com Entidade Comum
                    if (roll < lvl.entityRate * (1 - trackerReduction)) {
                        const baseDamage = lvl.dangerLevel === 'deadly' ? 40 : lvl.dangerLevel === 'high' ? 22 : 10;
                        const classDmgMult = explorer.classType === 'soldier' ? 0.55 : 1.0;
                        const finalDamage = Math.max(1, Math.floor(baseDamage * classDmgMult * (1 - suitReduction)));

                        explorer.hp = Math.max(0, explorer.hp - finalDamage);
                        explorer.sanity = Math.max(0, explorer.sanity - 10);
                        pushLog(`⚠️ ${explorer.emoji} ${explorer.name} encontrou uma Entidade no ${lvl.name} e perdeu ${finalDamage} HP!`);

                        if (Math.random() < 0.35) {
                            gainedResources.anomalyParts += 1;
                            pushLog(`⚔️ ${explorer.emoji} ${explorer.name} derrotou a criatura e coletou 1 Peça de Anomalia!`);
                        }
                    }
                    // 2. Coletar Sucata
                    else if (roll < lvl.entityRate * (1 - trackerReduction) + lvl.scrapRate * (1 + flashlightBonus)) {
                        const multiplier = explorer.classType === 'scout' ? 2.0 : 1.0;
                        const scrapFound = Math.floor((1 + Math.random() * 4) * multiplier);
                        gainedResources.scrap += scrapFound;
                        pushLog(`🔧 ${explorer.emoji} ${explorer.name} coletou ${scrapFound} Sucatas.`);
                    }
                    // 3. Achar Água de Amêndoa
                    else if (roll < lvl.entityRate * (1 - trackerReduction) + lvl.scrapRate * (1 + flashlightBonus) + lvl.itemRate) {
                        gainedResources.almondWater += 1;
                        pushLog(`🧴 ${explorer.emoji} ${explorer.name} encontrou Água de Amêndoa.`);
                    }
                }
            }

            // Checks de Morte / Perdição
            if (explorer.hp <= 0) {
                explorer.status = 'lost';
                explorer.assignedLevel = null;
                pushLog(`💀 PERIGO: ${explorer.emoji} ${explorer.name} foi consumido pelas sombras das Backrooms.`);
            } else if (explorer.sanity <= 0) {
                explorer.status = 'lost';
                explorer.assignedLevel = null;
                pushLog(`👁️ PERIGO: ${explorer.emoji} ${explorer.name} perdeu o juízo e se perdeu no labirinto infinito.`);
            }

            updatedExplorers[i] = explorer;
        }
    }

    return {
        updatedExplorers,
        gainedResources,
        newLogs,
        progressGained,
        bossHpDamage
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
        id: 'large_mining',
        name: 'Extração de Larga Escala',
        description: 'Estabelece eixos de poços profundos com elevadores a vapor para exploração mineral em massa.',
        cost: { scrap: 80, almondWater: 3, anomalyParts: 2 },
        effectText: '+25% Velocidade de Mineração Global',
        minFloor: 22,
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
        id: 'clean_fusion',
        name: 'Fusão Limpa Comercial',
        description: 'Reatores de fusão estável fornecem eletricidade limpa ilimitada para o mercado.',
        cost: { scrap: 200, almondWater: 5, anomalyParts: 5 },
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
        id: 'antimatter_prop',
        name: 'Propulsão de Antimatéria',
        description: 'Desenvolve propulsores que usam aniquilação de pósitrons para expedições interestelares rápidos.',
        cost: { scrap: 350, almondWater: 8, anomalyParts: 8 },
        effectText: '-25% Tempo de Expedições espaciais / da Galáxia',
        minFloor: 76,
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
        effectText: 'Desbloqueia a Galáxia e Viagem Espacial se bloqueado',
        minFloor: 86,
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
