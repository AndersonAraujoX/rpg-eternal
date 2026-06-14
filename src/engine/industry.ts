export type MachineType = 'extractor' | 'smelter' | 'assembler' | 'generator' | 'lab';

export interface IndustryItem {
    id: string;
    name: string;
    description: string;
    emoji: string;
}

export interface MachineInfo {
    id: string;
    name: string;
    description: string;
    type: MachineType;
    emoji: string;
    cost: Record<string, number>; // Gold cost or item cost. Using 'gold' for now.
}

export interface Recipe {
    id: string;
    name: string;
    inputs: Record<string, number>; // itemId -> amount
    outputs: Record<string, number>; // itemId -> amount
    time: number; // base time in seconds
    machineType: MachineType;
    powerDraw: number; // MW used (or generated, if generator)
    requiredBackroomsLevel?: number; // Lock based on Backrooms exploration
}

export interface MachineNode {
    id: string;
    machineId: string; // references MachineInfo.id
    recipeId: string; // currently active recipe (empty string if none)
    count: number; // how many of this machine are stacked in this node
}

export const INDUSTRY_ITEMS: IndustryItem[] = [
    { id: 'copper_ore', name: 'Minério de Cobre', description: 'Cobre em estado bruto.', emoji: '🪨' },
    { id: 'iron_ore', name: 'Minério de Ferro', description: 'Ferro em estado bruto.', emoji: '🪨' },
    { id: 'coal', name: 'Carvão', description: 'Combustível fóssil rico em energia.', emoji: '⚫' },
    { id: 'copper_ingot', name: 'Lingote de Cobre', description: 'Cobre derretido e purificado.', emoji: '🧱' },
    { id: 'iron_ingot', name: 'Lingote de Ferro', description: 'Ferro derretido e purificado.', emoji: '🧱' },
    { id: 'copper_wire', name: 'Fio de Cobre', description: 'Fiação condutora básica.', emoji: '🧵' },
    { id: 'iron_gear', name: 'Engrenagem', description: 'Componente mecânico essencial.', emoji: '⚙️' },
    { id: 'basic_circuit', name: 'Circuito Básico', description: 'Placa de controle simples.', emoji: '🖲️' },
    { id: 'science_red', name: 'Ciência a Vapor (Vermelha)', description: 'Pacote de pesquisa básica.', emoji: '🧪' },
    { id: 'siege_catapult', name: 'Catapulta de Cerco', description: 'Arma brutal de guerra. Diminui a dificuldade de territórios.', emoji: '🪨' },
    { id: 'plasma_cannon', name: 'Canhão de Plasma', description: 'Tecnologia cósmica que aniquila defesas de guerra.', emoji: '☄️' },
    { id: 'automated_dredge', name: 'Automated Dredges', description: 'Draga industrial para pescar passivamente.', emoji: '🎣' },
    { id: 'hydroponic_irrigation', name: 'Hydroponic Irrigation', description: 'Acelera o crescimento do jardim em 20%.', emoji: '🌱' },
    { id: 'overcharged_ammo', name: 'Overcharged Ammunition', description: 'Carga explosiva inicial para Dungeons.', emoji: '⚡' },
    { id: 'starlight_microchip', name: 'Starlight Microchips', description: 'Componente de hardware para robôs do Starlight.', emoji: '💾' },
    { id: 'magnetic_coil', name: 'Magnetic Coils', description: 'Bobina magnética industrial para bolsa de valores.', emoji: '🧲' },
    
    // New Backrooms Tech Items
    { id: 'liminal_scrap', name: 'Sucata Liminar', description: 'Sucata metálica liminar recuperada das Backrooms.', emoji: '⚙️' },
    { id: 'dense_concrete', name: 'Concreto Denso', description: 'Bloco de concreto denso e pesado.', emoji: '🧱' },
    { id: 'steel_plate', name: 'Placa de Aço', description: 'Chapa de aço refinada na indústria.', emoji: '💳' },
    { id: 'dark_matter', name: 'Matéria Escura', description: 'Resíduo condensado de pura matéria escura.', emoji: '🌌' },
    { id: 'anomalous_microchip', name: 'Microchip Anômalo', description: 'Microchip que emite sinais de rádio em frequência anômala.', emoji: '💾' },
    { id: 'reinforced_alloy', name: 'Liga Metálica Reforçada', description: 'Liga metálica leve e extremamente resistente.', emoji: '🔩' },
    { id: 'almond_condenser', name: 'Condensador Alquímico', description: 'Refina compostos usando Água de Amêndoa para acelerar o Jardim em 20% e dar +5% de eficácia em poções.', emoji: '⚗️' },
    { id: 'scrap_press', name: 'Compactador de Sucata de Aço', description: 'Permite reciclagem sob alta pressão, reduzindo o custo de Ligas Metálicas Reforçadas em 50% e dando +10% de chance na Forja.', emoji: '🗜️' },
    { id: 'stellar_receptor', name: 'Painel Receptor Estelar', description: 'Sintoniza ondas de energia cósmica, aumentando a capacidade de coleta offline dos bots em +25% e alimentando a automação Starlight.', emoji: '📡' },
    { id: 'reality_anchor', name: 'Ancorador de Realidade', description: 'Estabiliza a realidade física local, protegendo 2 prédios da vila ou 1 herói ascendido de resets de Rebirth.', emoji: '⚓' }
];

export const MACHINES: MachineInfo[] = [
    { id: 'burner_miner', name: 'Mineradora Básica', description: 'Extrai minérios da terra agressivamente.', type: 'extractor', emoji: '⛏️', cost: { 'gold': 500 } },
    { id: 'stone_furnace', name: 'Fornalha de Pedra', description: 'Funde minérios em barras sólidas.', type: 'smelter', emoji: '🔥', cost: { 'gold': 1000 } },
    { id: 'assembler_1', name: 'Máquina de Montagem', description: 'Monta itens a partir de componentes.', type: 'assembler', emoji: '🏭', cost: { 'gold': 2500 } },
    { id: 'steam_engine', name: 'Motor a Vapor', description: 'Queima combustível para gerar energia.', type: 'generator', emoji: '🚂', cost: { 'gold': 5000 } }
];

export const RECIPES: Recipe[] = [
    { id: 'mine_copper', name: 'Mineração: Cobre', inputs: {}, outputs: { 'copper_ore': 1 }, time: 1, machineType: 'extractor', powerDraw: 10 },
    { id: 'mine_iron', name: 'Mineração: Ferro', inputs: {}, outputs: { 'iron_ore': 1 }, time: 1, machineType: 'extractor', powerDraw: 10 },
    { id: 'mine_coal', name: 'Mineração: Carvão', inputs: {}, outputs: { 'coal': 1 }, time: 1, machineType: 'extractor', powerDraw: 10 },

    { id: 'smelt_copper', name: 'Fundição: Cobre', inputs: { 'copper_ore': 1 }, outputs: { 'copper_ingot': 1 }, time: 2, machineType: 'smelter', powerDraw: 20 },
    { id: 'smelt_iron', name: 'Fundição: Ferro', inputs: { 'iron_ore': 1 }, outputs: { 'iron_ingot': 1 }, time: 2, machineType: 'smelter', powerDraw: 20 },

    { id: 'craft_wire', name: 'Montar: Fio de Cobre', inputs: { 'copper_ingot': 1 }, outputs: { 'copper_wire': 2 }, time: 2, machineType: 'assembler', powerDraw: 30 },
    { id: 'craft_gear', name: 'Montar: Engrenagem', inputs: { 'iron_ingot': 2 }, outputs: { 'iron_gear': 1 }, time: 3, machineType: 'assembler', powerDraw: 30 },
    { id: 'craft_circuit', name: 'Montar: Circuito Básico', inputs: { 'iron_ingot': 1, 'copper_wire': 3 }, outputs: { 'basic_circuit': 1 }, time: 5, machineType: 'assembler', powerDraw: 40 },
    { id: 'craft_science_red', name: 'Criar Ciência Vermelha', inputs: { 'copper_wire': 1, 'iron_gear': 1 }, outputs: { 'science_red': 1 }, time: 5, machineType: 'assembler', powerDraw: 50 },

    { id: 'craft_catapult', name: 'Montar: Catapulta de Cerco', inputs: { 'iron_gear': 50, 'coal': 100 }, outputs: { 'siege_catapult': 1 }, time: 60, machineType: 'assembler', powerDraw: 100 },
    { id: 'craft_plasma_cannon', name: 'Montar: Canhão de Plasma', inputs: { 'basic_circuit': 20, 'copper_wire': 100 }, outputs: { 'plasma_cannon': 1 }, time: 300, machineType: 'assembler', powerDraw: 500 },

    { id: 'gen_steam', name: 'Gerar Energia a Vapor', inputs: { 'coal': 1 }, outputs: {}, time: 10, machineType: 'generator', powerDraw: -500 }, // negative draw = generation (produces 500 MW)
    { id: 'craft_automated_dredge', name: 'Montar: Automated Dredges', inputs: { 'basic_circuit': 10, 'copper_wire': 20 }, outputs: { 'automated_dredge': 1 }, time: 60, machineType: 'assembler', powerDraw: 100 },
    { id: 'craft_hydroponic_irrigation', name: 'Montar: Hydroponic Irrigation', inputs: { 'basic_circuit': 5, 'copper_wire': 15 }, outputs: { 'hydroponic_irrigation': 1 }, time: 45, machineType: 'assembler', powerDraw: 80 },
    { id: 'craft_overcharged_ammo', name: 'Montar: Overcharged Ammunition', inputs: { 'iron_ingot': 5, 'copper_wire': 10 }, outputs: { 'overcharged_ammo': 1 }, time: 30, machineType: 'assembler', powerDraw: 50 },
    { id: 'craft_starlight_microchip', name: 'Montar: Starlight Microchips', inputs: { 'basic_circuit': 10, 'copper_wire': 50 }, outputs: { 'starlight_microchip': 1 }, time: 45, machineType: 'assembler', powerDraw: 80 },
    { id: 'craft_magnetic_coil', name: 'Montar: Magnetic Coils', inputs: { 'copper_wire': 30, 'iron_ingot': 5 }, outputs: { 'magnetic_coil': 1 }, time: 20, machineType: 'assembler', powerDraw: 60 },

    // New Backrooms Tech Recipes
    { id: 'craft_liminal_scrap', name: 'Montar: Sucata Liminar', inputs: { 'iron_gear': 2 }, outputs: { 'liminal_scrap': 1 }, time: 5, machineType: 'assembler', powerDraw: 30, requiredBackroomsLevel: 0 },
    { id: 'craft_dense_concrete', name: 'Montar: Concreto Denso', inputs: { 'iron_ore': 5, 'coal': 2 }, outputs: { 'dense_concrete': 1 }, time: 10, machineType: 'assembler', powerDraw: 20, requiredBackroomsLevel: 1 },
    { id: 'craft_steel_plate', name: 'Montar: Placa de Aço', inputs: { 'iron_ingot': 3, 'coal': 3 }, outputs: { 'steel_plate': 1 }, time: 8, machineType: 'assembler', powerDraw: 30, requiredBackroomsLevel: 1 },
    { id: 'craft_anomalous_microchip', name: 'Montar: Microchip Anômalo', inputs: { 'starlight_microchip': 1, 'basic_circuit': 2 }, outputs: { 'anomalous_microchip': 1 }, time: 15, machineType: 'assembler', powerDraw: 50, requiredBackroomsLevel: 4 },
    { id: 'craft_dark_matter', name: 'Montar: Matéria Escura', inputs: { 'basic_circuit': 5, 'magnetic_coil': 2 }, outputs: { 'dark_matter': 1 }, time: 30, machineType: 'assembler', powerDraw: 100, requiredBackroomsLevel: 8 },
    { id: 'craft_reinforced_alloy', name: 'Montar: Liga Reforçada', inputs: { 'iron_ore': 4, 'copper_wire': 6 }, outputs: { 'reinforced_alloy': 1 }, time: 10, machineType: 'assembler', powerDraw: 40, requiredBackroomsLevel: 1 },

    { id: 'craft_almond_condenser', name: 'Criar: Condensador Alquímico', inputs: { 'iron_ingot': 50, 'liminal_scrap': 15 }, outputs: { 'almond_condenser': 1 }, time: 300, machineType: 'assembler', powerDraw: 150, requiredBackroomsLevel: 0 },
    { id: 'craft_scrap_press', name: 'Criar: Compactador de Sucata', inputs: { 'steel_plate': 30, 'dense_concrete': 20 }, outputs: { 'scrap_press': 1 }, time: 600, machineType: 'assembler', powerDraw: 200, requiredBackroomsLevel: 1 },
    { id: 'craft_stellar_receptor', name: 'Criar: Receptor Estelar', inputs: { 'anomalous_microchip': 10, 'basic_circuit': 30, 'copper_wire': 100 }, outputs: { 'stellar_receptor': 1 }, time: 1800, machineType: 'assembler', powerDraw: 350, requiredBackroomsLevel: 4 },
    { id: 'craft_reality_anchor', name: 'Criar: Ancorador de Realidade', inputs: { 'dark_matter': 5, 'magnetic_coil': 50 }, outputs: { 'reality_anchor': 1 }, time: 3600, machineType: 'assembler', powerDraw: 500, requiredBackroomsLevel: 8 }
];

// Helper to determine net production and consumption per second for UI
export function simulateIndustryTick(nodes: MachineNode[], inventory: Record<string, number>, deltaSeconds: number, costReduction: number = 0) {
    let powerGenerated = 0;
    let powerConsumed = 0;
    const newInventory = { ...inventory };
    const flowPerSecond = new Map<string, number>(); // Tracks rate of change

    // 1. Calculate Power
    nodes.forEach(node => {
        const recipe = RECIPES.find(r => r.id === node.recipeId);
        if (!recipe) return;

        if (recipe.powerDraw < 0) {
            // Check if we have inputs to generate power
            if (Object.keys(recipe.inputs).length === 0 ||
                Object.entries(recipe.inputs).every(([k, v]) => (newInventory[k] || 0) >= (v / recipe.time) * node.count * deltaSeconds)) {
                // We assume generators always run perfectly if fueled
                powerGenerated += Math.abs(recipe.powerDraw) * node.count;
            }
        } else {
            powerConsumed += recipe.powerDraw * node.count;
        }
    });

    // 2. Determine Efficiency
    const powerEfficiency = Math.min(1.0, powerGenerated > 0 ? (powerGenerated / (Math.max(1, powerConsumed))) : (powerConsumed > 0 ? 0.0 : 1.0));

    // 3. Process Recipes
    nodes.forEach(node => {
        const recipe = RECIPES.find(r => r.id === node.recipeId);
        if (!recipe) return;

        // How many cycles we expect to run this tick
        const cyclesPerSecond = (1 / recipe.time) * node.count;
        let expectedCycles = cyclesPerSecond * deltaSeconds;

        // Apply power efficiency if it consumes power
        if (recipe.powerDraw > 0) {
            expectedCycles *= powerEfficiency;
        }

        // Determine actual cycles based on available inputs
        let possibleCycles = expectedCycles;
        for (const [inputId, inputAmount] of Object.entries(recipe.inputs)) {
            let adjustedAmount = inputAmount;
            if (costReduction > 0 && (recipe.id === 'craft_catapult' || recipe.id === 'craft_plasma_cannon')) {
                adjustedAmount = Math.max(1, Math.floor(inputAmount * (1 - costReduction)));
            }
            if (recipe.id === 'craft_reinforced_alloy' && inputId === 'iron_ore' && newInventory['scrap_press'] >= 1) {
                adjustedAmount = Math.max(1, Math.floor(inputAmount * 0.5));
            }
            const missing = ((possibleCycles * adjustedAmount) > (newInventory[inputId] || 0));
            if (missing) {
                possibleCycles = (newInventory[inputId] || 0) / adjustedAmount;
            }
        }

        // Apply consumption
        for (const [inputId, inputAmount] of Object.entries(recipe.inputs)) {
            let adjustedAmount = inputAmount;
            if (costReduction > 0 && (recipe.id === 'craft_catapult' || recipe.id === 'craft_plasma_cannon')) {
                adjustedAmount = Math.max(1, Math.floor(inputAmount * (1 - costReduction)));
            }
            if (recipe.id === 'craft_reinforced_alloy' && inputId === 'iron_ore' && newInventory['scrap_press'] >= 1) {
                adjustedAmount = Math.max(1, Math.floor(inputAmount * 0.5));
            }
            const consumed = possibleCycles * adjustedAmount;
            newInventory[inputId] -= consumed;
            flowPerSecond.set(inputId, (flowPerSecond.get(inputId) || 0) - (consumed / deltaSeconds));
        }

        // Apply production
        for (const [outputId, outputAmount] of Object.entries(recipe.outputs)) {
            const produced = possibleCycles * outputAmount;
            newInventory[outputId] = (newInventory[outputId] || 0) + produced;
            flowPerSecond.set(outputId, (flowPerSecond.get(outputId) || 0) + (produced / deltaSeconds));
        }
    });

    return { newInventory, powerGenerated, powerConsumed, powerEfficiency, flowPerSecond: Object.fromEntries(flowPerSecond) };
}
