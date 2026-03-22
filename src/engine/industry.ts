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
    { id: 'plasma_cannon', name: 'Canhão de Plasma', description: 'Tecnologia cósmica que aniquila defesas de guerra.', emoji: '☄️' }
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

    { id: 'gen_steam', name: 'Gerar Energia a Vapor', inputs: { 'coal': 1 }, outputs: {}, time: 10, machineType: 'generator', powerDraw: -500 } // negative draw = generation (produces 500 MW)
];

// Helper to determine net production and consumption per second for UI
export function simulateIndustryTick(nodes: MachineNode[], inventory: Record<string, number>, deltaSeconds: number) {
    let powerGenerated = 0;
    let powerConsumed = 0;
    let newInventory = { ...inventory };
    let flowPerSecond: Record<string, number> = {}; // Tracks rate of change

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
            const missing = ((possibleCycles * inputAmount) > (newInventory[inputId] || 0));
            if (missing) {
                possibleCycles = (newInventory[inputId] || 0) / inputAmount;
            }
        }

        // Apply consumption
        for (const [inputId, inputAmount] of Object.entries(recipe.inputs)) {
            const consumed = possibleCycles * inputAmount;
            newInventory[inputId] -= consumed;
            flowPerSecond[inputId] = (flowPerSecond[inputId] || 0) - (consumed / deltaSeconds);
        }

        // Apply production
        for (const [outputId, outputAmount] of Object.entries(recipe.outputs)) {
            const produced = possibleCycles * outputAmount;
            newInventory[outputId] = (newInventory[outputId] || 0) + produced;
            flowPerSecond[outputId] = (flowPerSecond[outputId] || 0) + (produced / deltaSeconds);
        }
    });

    return { newInventory, powerGenerated, powerConsumed, powerEfficiency, flowPerSecond };
}
