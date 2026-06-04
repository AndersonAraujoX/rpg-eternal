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
        flashlight: number; // 0: none, 1: standard, 2: led, 3: military
        suit: number;       // 0: plain, 1: jacket, 2: Hazmat, 3: heavy duty
        tracker: number;    // 0: none, 1: ping-tracker, 2: proximity-radar
    };
}

export interface BackroomsLevel {
    id: string;
    name: string;
    description: string;
    dangerLevel: 'low' | 'medium' | 'high' | 'deadly';
    sanityDrain: number; // per tick
    scrapRate: number;  // chance per tick
    itemRate: number;   // chance of finding almond water/etc
    entityRate: number; // chance of entity attack
    emoji: string;
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

export const BACKROOMS_LEVELS: BackroomsLevel[] = [
    {
        id: 'lvl_0',
        name: 'Nível 0: The Lobby',
        description: 'Papel de parede amarelo úmido, carpete molhado e zumbido incessante de lâmpadas fluorescentes.',
        dangerLevel: 'low',
        sanityDrain: 0.1,
        scrapRate: 0.12,
        itemRate: 0.05,
        entityRate: 0.02,
        emoji: '🟨'
    },
    {
        id: 'lvl_1',
        name: 'Nível 1: Habitable Zone',
        description: 'Armazém de concreto cinza com poças d\'água e névoa baixa. Mais seguro, mas com portas trancadas.',
        dangerLevel: 'medium',
        sanityDrain: 0.2,
        scrapRate: 0.18,
        itemRate: 0.08,
        entityRate: 0.04,
        emoji: '⬜'
    },
    {
        id: 'lvl_2',
        name: 'Nível 2: Pipe Dreams',
        description: 'Longos túneis industriais repletos de tubulações de calor extremo. Sons metálicos ecoando ao longe.',
        dangerLevel: 'high',
        sanityDrain: 0.4,
        scrapRate: 0.25,
        itemRate: 0.10,
        entityRate: 0.08,
        emoji: '🟥'
    },
    {
        id: 'lvl_37',
        name: 'Nível 37: The Poolrooms',
        description: 'Águas cristalinas mornas e azulejos brancos. Calmaria estranha que relaxa a mente, mas esconde perigos.',
        dangerLevel: 'medium',
        sanityDrain: -0.15, // Restaura sanidade!
        scrapRate: 0.05,
        itemRate: 0.12,
        entityRate: 0.03,
        emoji: '🌊'
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

export function simulateBackroomsTick(
    explorers: BackroomsExplorer[],
    outpost: BackroomsOutpost,
    resources: BackroomsResources,
    logs: string[],
    deltaSeconds: number
): {
    updatedExplorers: BackroomsExplorer[];
    gainedResources: Partial<BackroomsResources>;
    newLogs: string[];
} {
    const updatedExplorers = [...explorers];
    const gainedResources: BackroomsResources = { scrap: 0, almondWater: 0, anomalyParts: 0 };
    const newLogs: string[] = [];

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
            // Recovers Sanity and HP based on outpost.quarters level
            const recoveryRate = 0.5 + (outpost.quarters * 0.5);
            const sanityGain = recoveryRate * deltaSeconds * 2;
            const hpGain = recoveryRate * deltaSeconds * 1.5;

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

            // Adjust parameters based on gear & class
            // Flashlight boosts find rate, Suit protects HP, Tracker protects sanity/reduces entity attack chance
            const flashlightBonus = explorer.equipment.flashlight * 0.15;
            const suitReduction = explorer.equipment.suit * 0.2;
            const trackerReduction = explorer.equipment.tracker * 0.2;

            const baseSanityDrain = lvl.sanityDrain;
            let finalSanityDrain = baseSanityDrain;
            if (finalSanityDrain > 0) {
                // Scientist suffers 30% less sanity drain
                const classMult = explorer.classType === 'scientist' ? 0.7 : 1.0;
                finalSanityDrain = baseSanityDrain * classMult * (1 - trackerReduction);
            }
            explorer.sanity = Math.max(0, explorer.sanity - finalSanityDrain * deltaSeconds);

            // Ticks have a probability of generating events
            const actionChance = 0.08 * deltaSeconds;
            if (Math.random() < actionChance) {
                const roll = Math.random();

                // 1. Entity Encounter
                const finalEntityChance = lvl.entityRate * (1 - trackerReduction);
                if (roll < finalEntityChance) {
                    const baseDamage = lvl.dangerLevel === 'deadly' ? 45 : lvl.dangerLevel === 'high' ? 25 : 12;
                    // Soldier takes 40% less damage in entity fights
                    const classDmgMult = explorer.classType === 'soldier' ? 0.6 : 1.0;
                    const finalDamage = Math.max(1, Math.floor(baseDamage * classDmgMult * (1 - suitReduction)));

                    explorer.hp = Math.max(0, explorer.hp - finalDamage);
                    explorer.sanity = Math.max(0, explorer.sanity - 10);
                    pushLog(`⚠️ ${explorer.emoji} ${explorer.name} foi atacado por uma Entidade no ${lvl.name} e perdeu ${finalDamage} HP!`);

                    if (Math.random() < 0.3) {
                        gainedResources.anomalyParts += 1;
                        pushLog(`⚔️ ${explorer.emoji} ${explorer.name} derrotou a criatura e coletou 1 Peça de Anomalia!`);
                    }
                }
                // 2. Scrap Found
                else if (roll < finalEntityChance + lvl.scrapRate * (1 + flashlightBonus)) {
                    // Scout finds 50% more scrap
                    const multiplier = explorer.classType === 'scout' ? 2.0 : 1.0;
                    const scrapFound = Math.floor((1 + Math.random() * 3) * multiplier);
                    gainedResources.scrap += scrapFound;
                    pushLog(`🔧 ${explorer.emoji} ${explorer.name} encontrou ${scrapFound} Sucatas no ${lvl.name}.`);
                }
                // 3. Almond Water or Special Item Found
                else if (roll < finalEntityChance + lvl.scrapRate * (1 + flashlightBonus) + lvl.itemRate) {
                    gainedResources.almondWater += 1;
                    pushLog(`🧴 ${explorer.emoji} ${explorer.name} achou uma garrafa de Água de Amêndoa.`);
                }
            }

            // Checks for Sanity / HP death
            if (explorer.hp <= 0) {
                explorer.status = 'lost';
                explorer.assignedLevel = null;
                pushLog(`💀 PERIGO: ${explorer.emoji} ${explorer.name} sucumbiu aos ferimentos e foi PERDIDO nas Backrooms.`);
            } else if (explorer.sanity <= 0) {
                explorer.status = 'lost';
                explorer.assignedLevel = null;
                pushLog(`👁️ PERIGO: ${explorer.emoji} ${explorer.name} perdeu completamente a sanidade e tornou-se hostil (Perdido).`);
            }

            updatedExplorers[i] = explorer;
        }
    }

    return {
        updatedExplorers,
        gainedResources,
        newLogs
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
}

export const BACKROOMS_RESEARCHES: BackroomsResearch[] = [
    {
        id: 'rift_tech',
        name: 'Estudos de Fendas Interdimensionais',
        description: 'Pesquisa o tecido do espaço-tempo para abrir portais estáveis para as Fendas Temporais (Rifts).',
        cost: { scrap: 30, almondWater: 1, anomalyParts: 3 },
        effectText: 'Desbloqueia as Fendas Temporais'
    },
    {
        id: 'space_tech',
        name: 'Motores de Dobra Espacial',
        description: 'Desenvolve sistemas de propulsão e escudos necessários para navegar pelo Espaço Sideral (Galáxia).',
        cost: { scrap: 60, almondWater: 3, anomalyParts: 6 },
        effectText: 'Desbloqueia o Espaço Sideral (Galáxia)'
    }
];
