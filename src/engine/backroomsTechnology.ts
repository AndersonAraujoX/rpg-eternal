export interface BackroomsTechModifiers {
    // Combate
    frostResistanceReduction: number; // ex: 0.25
    critDamageOnStealth: number;      // ex: 1.0 (100% bonus)
    cooldownReduction: number;         // ex: 0.30
    vacuumExplosionChance: number;     // ex: 0.10

    // GvG & Guildas
    gvgShieldPercent: number;          // ex: 0.15 (15% mitiga)
    guildExpeditionSpeedup: number;    // ex: 0.20 (20% rápido)
    worldBossDamageBonus: number;      // ex: 0.20

    // Minijogos
    fishingLendaryChance: number;      // ex: 0.15
    miningClickerComboBonus: number;   // ex: 2.0 (dobra acúmulo)
    diceGameLuckModifier: number;      // ex: 0.12
    gardenVoidUpgrade: boolean;        // true/false
}

export interface BackroomsCrossSystemUnlocks {
    efficiencyModule3: boolean;
    liminalBeacons: boolean;
    quantumAutomation: boolean;
    dimensionalScience: boolean;
    cosmicRadar: boolean;
    antimatterReactor: boolean;
    hyperdenseHull: boolean;
    warpDrive: boolean;
    stellarVoidPortal: boolean;
}

/**
 * Calcula todos os modificadores de tecnologia ativos com base no progresso das Backrooms
 * Suporta o escalonamento contínuo (fórmulas), marcos (milestones) e desbloqueios cruzados
 */
export const calculateBackroomsTechnology = (
    highestLevel: number,
    isUnlocked: boolean,
    unlockedTechs: string[] = []
): {
    modifiers: BackroomsTechModifiers;
    scalars: {
        globalElementalDamage: number;
        industrialSpeed: number;
        offlineGoldBonus: number;
    };
    crossUnlocks: BackroomsCrossSystemUnlocks;
} => {
    // Inicialização padrão (nível 0 ou bloqueado)
    const modifiers: BackroomsTechModifiers = {
        frostResistanceReduction: 0,
        critDamageOnStealth: 0,
        cooldownReduction: 0,
        vacuumExplosionChance: 0,
        gvgShieldPercent: 0,
        guildExpeditionSpeedup: 0,
        worldBossDamageBonus: 0,
        fishingLendaryChance: 0,
        miningClickerComboBonus: 1.0,
        diceGameLuckModifier: 0,
        gardenVoidUpgrade: false
    };

    const crossUnlocks: BackroomsCrossSystemUnlocks = {
        efficiencyModule3: false,
        liminalBeacons: false,
        quantumAutomation: false,
        dimensionalScience: false,
        cosmicRadar: false,
        antimatterReactor: false,
        hyperdenseHull: false,
        warpDrive: false,
        stellarVoidPortal: false
    };
    
    if (!isUnlocked) {
        return {
            modifiers,
            scalars: { globalElementalDamage: 0, industrialSpeed: 0, offlineGoldBonus: 0 },
            crossUnlocks
        };
    }
    
    // 1. Escalonamento Contínuo Passivo (Fórmulas Matemáticas de 1 a 100)
    const scalars = {
        globalElementalDamage: highestLevel * 0.0025, // +25% no lvl 100
        industrialSpeed: highestLevel * 0.0050,       // +50% no lvl 100
        offlineGoldBonus: highestLevel * 0.0030       // +30% no lvl 100
    };
    
    // 2. Marcos de Desbloqueio (Milestones)
    // --- Combate ---
    if (highestLevel >= 2)  modifiers.frostResistanceReduction = 0.25;
    if (highestLevel >= 30) modifiers.critDamageOnStealth = 1.0;
    if (highestLevel >= 55) modifiers.cooldownReduction = 0.30;
    if (highestLevel >= 85) modifiers.vacuumExplosionChance = 0.10;
    
    // --- GvG / Guildas ---
    if (highestLevel >= 18) modifiers.gvgShieldPercent = 0.05; // Base do estandarte
    if (highestLevel >= 45) modifiers.gvgShieldPercent = 0.15; // Escudo completo
    if (highestLevel >= 72) modifiers.guildExpeditionSpeedup = 0.20;
    if (highestLevel >= 100) modifiers.worldBossDamageBonus = 0.20;
    
    // --- Minijogos ---
    if (highestLevel >= 10) modifiers.fishingLendaryChance = 0.15;
    if (highestLevel >= 38) modifiers.miningClickerComboBonus = 2.0;
    if (highestLevel >= 65) modifiers.diceGameLuckModifier = 0.12;
    if (highestLevel >= 92) modifiers.gardenVoidUpgrade = true;

    // 3. Desbloqueios Cruzados (Indústria + Galáxia)
    crossUnlocks.efficiencyModule3 = unlockedTechs.includes('superconductors_liminal') || highestLevel >= 18;
    crossUnlocks.liminalBeacons = unlockedTechs.includes('liminal_beacons') || highestLevel >= 28;
    crossUnlocks.quantumAutomation = unlockedTechs.includes('quantum_automation') || highestLevel >= 35;
    crossUnlocks.dimensionalScience = unlockedTechs.includes('dimensional_science_pack') || highestLevel >= 50;
    crossUnlocks.cosmicRadar = unlockedTechs.includes('cosmic_radar') || highestLevel >= 55;
    crossUnlocks.antimatterReactor = unlockedTechs.includes('antimatter_reactor') || highestLevel >= 72;
    crossUnlocks.hyperdenseHull = unlockedTechs.includes('hyperdense_alloy_hull') || highestLevel >= 75;
    crossUnlocks.warpDrive = unlockedTechs.includes('space_warp') || highestLevel >= 86;
    crossUnlocks.stellarVoidPortal = unlockedTechs.includes('stellar_void_portal') || highestLevel >= 90;
    
    return { modifiers, scalars, crossUnlocks };
};
