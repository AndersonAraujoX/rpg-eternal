export type MachineType = 
    | 'extractor' 
    | 'smelter' 
    | 'assembler' 
    | 'generator' 
    | 'lab' 
    | 'refinery' 
    | 'chemical_plant' 
    | 'centrifuge' 
    | 'silo';

export interface IndustryItem {
    id: string;
    name: string;
    description: string;
    emoji: string;
    category?: 'raw' | 'intermediate' | 'science' | 'advanced' | 'module' | 'endgame';
}

export interface MachineInfo {
    id: string;
    name: string;
    description: string;
    type: MachineType;
    emoji: string;
    cost: Record<string, number>; // Gold cost or item cost
    speedMultiplier?: number;
    pollutionPerSecond?: number;
    moduleSlots?: number;
}

export interface Recipe {
    id: string;
    name: string;
    inputs: Record<string, number>; // itemId -> amount
    outputs: Record<string, number>; // itemId -> amount
    time: number; // base time in seconds
    machineType: MachineType;
    powerDraw: number; // MW used (or generated, if generator)
    requiredTech?: string; // Unlock requirement
    requiredBackroomsLevel?: number; // Lock based on Backrooms exploration
}

export interface MachineNode {
    id: string;
    machineId: string; // references MachineInfo.id
    recipeId: string; // currently active recipe (empty string if none)
    count: number; // how many of this machine are stacked in this node
    modules?: string[]; // installed module IDs
}

export interface TechNode {
    id: string;
    name: string;
    description: string;
    emoji: string;
    tier: number;
    cost: Record<string, number>; // science pack itemId -> total count needed
    pointsRequired: number; // total science cycles needed
    prerequisites: string[]; // tech IDs
    unlockedRecipes: string[]; // recipe IDs
    unlockedMachines?: string[]; // machine IDs
    bonusDescription?: string;
}

export const INDUSTRY_ITEMS: IndustryItem[] = [
    // ── Minérios & Recursos Brutos ──────────────────────────────────────────
    { id: 'copper_ore', name: 'Minério de Cobre', description: 'Cobre bruto extraído do solo.', emoji: '🪨', category: 'raw' },
    { id: 'iron_ore', name: 'Minério de Ferro', description: 'Ferro bruto para fundição.', emoji: '🪨', category: 'raw' },
    { id: 'coal', name: 'Carvão', description: 'Combustível fóssil rico em energia para motores e plástico.', emoji: '⚫', category: 'raw' },
    { id: 'stone', name: 'Pedra', description: 'Pedra bruta para fornalhas, trilhos e muralhas.', emoji: '🪨', category: 'raw' },
    { id: 'crude_oil', name: 'Petróleo Bruto', description: 'Hidrocarboneto fóssil bombeado do subsolo.', emoji: '🛢️', category: 'raw' },
    { id: 'uranium_ore', name: 'Minério de Urânio', description: 'Minério radioativo denso extraído com ácido sulfúrico.', emoji: '☢️', category: 'raw' },

    // ── Fundição e Metais ───────────────────────────────────────────────────
    { id: 'copper_ingot', name: 'Placa de Cobre', description: 'Cobre purificado e prensado em placas.', emoji: '🧱', category: 'intermediate' },
    { id: 'iron_ingot', name: 'Placa de Ferro', description: 'Ferro fundido para construção mecânica.', emoji: '🧱', category: 'intermediate' },
    { id: 'steel_plate', name: 'Placa de Aço', description: 'Ferro purificado com carvão para alta resistência.', emoji: '💳', category: 'intermediate' },

    // ── Componentes Mecânicos & Eletrônicos ──────────────────────────────────
    { id: 'copper_wire', name: 'Fio de Cobre', description: 'Fiação condutora essencial para circuitos.', emoji: '🧵', category: 'intermediate' },
    { id: 'iron_gear', name: 'Engrenagem de Ferro', description: 'Dentes mecânicos para motores e máquinas.', emoji: '⚙️', category: 'intermediate' },
    { id: 'basic_circuit', name: 'Circuito Eletrônico (Verde)', description: 'Placa de circuito básico para automação.', emoji: '🟩', category: 'intermediate' },
    { id: 'advanced_circuit', name: 'Circuito Avançado (Vermelho)', description: 'Circuito integrado com plástico e fiação de cobre.', emoji: '🟥', category: 'intermediate' },
    { id: 'processing_unit', name: 'Unidade de Processamento (Azul)', description: 'Microprocessador de alta performance banhado em ácido.', emoji: '🟦', category: 'intermediate' },
    { id: 'engine_unit', name: 'Motor a Combustão', description: 'Bloco de motor mecânico a combustão interna.', emoji: '🚗', category: 'intermediate' },
    { id: 'electric_engine', name: 'Motor Elétrico', description: 'Motor eletromagnético avançado para robótica.', emoji: '⚡', category: 'intermediate' },

    // ── Logística ───────────────────────────────────────────────────────────
    { id: 'transport_belt', name: 'Esteira de Transporte', description: 'Esteira de transporte básico (15 itens/s).', emoji: '🟡', category: 'intermediate' },
    { id: 'inserter', name: 'Inseridor Básico', description: 'Braço mecânico articulado para alimentação de máquinas.', emoji: '🦾', category: 'intermediate' },
    { id: 'fast_inserter', name: 'Inseridor Rápido', description: 'Braço motorizado de alta velocidade.', emoji: '🦾', category: 'intermediate' },

    // ── Petroquímica e Químicos ─────────────────────────────────────────────
    { id: 'petroleum_gas', name: 'Gás de Petróleo', description: 'Fração leve e volátil do refino de petróleo.', emoji: '⛽', category: 'intermediate' },
    { id: 'plastic_bar', name: 'Barra de Plástico', description: 'Polímero sintético para eletrônica avançada.', emoji: '🧪', category: 'intermediate' },
    { id: 'sulfur', name: 'Enxofre', description: 'Mineral amarelo extraído do gás de petróleo.', emoji: '🟡', category: 'intermediate' },
    { id: 'sulfuric_acid', name: 'Ácido Sulfúrico', description: 'Ácido corrosivo concentrado para baterias e urânio.', emoji: '🧪', category: 'intermediate' },
    { id: 'battery', name: 'Bateria Química', description: 'Armazenamento eletroquímico para robôs e lasers.', emoji: '🔋', category: 'intermediate' },

    // ── Energia Nuclear ─────────────────────────────────────────────────────
    { id: 'uranium_235', name: 'Urânio-235 (Enriquecido)', description: 'Isótopo físsil raro para células de combustível nuclear.', emoji: '✨', category: 'advanced' },
    { id: 'uranium_238', name: 'Urânio-238 (Empobrecido)', description: 'Isótopo comum resultante da centrifugação.', emoji: '🪨', category: 'advanced' },
    { id: 'uranium_fuel_cell', name: 'Célula de Combustível Nuclear', description: 'Célula de fissão nuclear de altíssima densidade energética.', emoji: '🔋', category: 'advanced' },

    // ── Componentes de Foguete (Endgame) ────────────────────────────────────
    { id: 'low_density_structure', name: 'Estrutura de Baixa Densidade', description: 'Liga aeroespacial levíssima para fuselagem de foguete.', emoji: '🪶', category: 'endgame' },
    { id: 'rocket_fuel', name: 'Combustível de Foguete', description: 'Propelente hipergólico condensado de alta potência.', emoji: '🚀', category: 'endgame' },
    { id: 'rocket_control_unit', name: 'Unidade de Controle de Foguete', description: 'Computador de bordo autônomo para navegação orbital.', emoji: '🛰️', category: 'endgame' },
    { id: 'satellite', name: 'Satélite Espacial', description: 'Satélite de telecomunicações para lançamento em órbita.', emoji: '🛰️', category: 'endgame' },

    // ── Módulos ─────────────────────────────────────────────────────────────
    { id: 'speed_module_1', name: 'Módulo de Velocidade I', description: '+20% de velocidade na máquina (+30% de consumo de energia).', emoji: '⚡', category: 'module' },
    { id: 'productivity_module_1', name: 'Módulo de Produtividade I', description: '+4% de produtos bônus grátis (-10% de velocidade).', emoji: '📦', category: 'module' },
    { id: 'efficiency_module_1', name: 'Módulo de Eficiência I', description: '-30% de consumo de energia da máquina.', emoji: '🌿', category: 'module' },

    // ── 7 Pacotes de Ciência (Science Packs) ─────────────────────────────────
    { id: 'science_red', name: 'Ciência de Automação (Vermelha)', description: '🔴 Pacote de ciência da era do vapor e engrenagens.', emoji: '🧪', category: 'science' },
    { id: 'science_green', name: 'Ciência de Logística (Verde)', description: '🟢 Pacote de ciência da era das esteiras e eletricidade.', emoji: '🧪', category: 'science' },
    { id: 'science_gray', name: 'Ciência Militar (Cinza)', description: '🔘 Pacote de ciência para armamento e catapultas.', emoji: '🧪', category: 'science' },
    { id: 'science_blue', name: 'Ciência Química (Azul)', description: '🔵 Pacote de ciência da era do petróleo e plástico.', emoji: '🧪', category: 'science' },
    { id: 'science_purple', name: 'Ciência de Produção (Roxa)', description: '🟣 Pacote de ciência pesada para fornos elétricos e trilhos.', emoji: '🧪', category: 'science' },
    { id: 'science_yellow', name: 'Ciência Utilitária (Amarela)', description: '🟡 Pacote de ciência de alta tecnologia para robôs e voo.', emoji: '🧪', category: 'science' },
    { id: 'science_white', name: 'Ciência Espacial (Branca)', description: '⚪ Pacote gerado orbitalmente ao lançar foguetes com satélite!', emoji: '🧪', category: 'science' },

    // ── Equipamentos & Armas de Cerco ────────────────────────────────────────
    { id: 'siege_catapult', name: 'Catapulta de Cerco', description: 'Arma brutal de guerra. Diminui a dificuldade de territórios.', emoji: '🪨', category: 'advanced' },
    { id: 'plasma_cannon', name: 'Canhão de Plasma', description: 'Tecnologia cósmica que aniquila defesas de guerra.', emoji: '☄️', category: 'advanced' },
    { id: 'automated_dredge', name: 'Draga Automatizada', description: 'Draga industrial para pescar passivamente.', emoji: '🎣', category: 'advanced' },
    { id: 'hydroponic_irrigation', name: 'Irrigação Hidropônica', description: 'Acelera o crescimento do jardim em 20%.', emoji: '🌱', category: 'advanced' },
    { id: 'overcharged_ammo', name: 'Munição Sobrecarregada', description: 'Carga explosiva inicial para Dungeons.', emoji: '⚡', category: 'advanced' },
    { id: 'starlight_microchip', name: 'Microchip Starlight', description: 'Componente de hardware para robôs do Starlight.', emoji: '💾', category: 'advanced' },
    { id: 'magnetic_coil', name: 'Bobina Magnética', description: 'Bobina magnética industrial para bolsa de valores.', emoji: '🧲', category: 'advanced' },
    
    // ── Itens Tecnológicos das Backrooms ─────────────────────────────────────
    { id: 'liminal_scrap', name: 'Sucata Liminar', description: 'Sucata metálica liminar recuperada das Backrooms.', emoji: '⚙️', category: 'advanced' },
    { id: 'dense_concrete', name: 'Concreto Denso', description: 'Bloco de concreto denso e pesado.', emoji: '🧱', category: 'advanced' },
    { id: 'dark_matter', name: 'Matéria Escura', description: 'Resíduo condensado de pura matéria escura.', emoji: '🌌', category: 'advanced' },
    { id: 'anomalous_microchip', name: 'Microchip Anômalo', description: 'Microchip que emite sinais de rádio em frequência anômala.', emoji: '💾', category: 'advanced' },
    { id: 'reinforced_alloy', name: 'Liga Metálica Reforçada', description: 'Liga metálica leve e extremamente resistente.', emoji: '🔩', category: 'advanced' },
    { id: 'almond_condenser', name: 'Condensador Alquímico', description: 'Refina compostos usando Água de Amêndoa para o Jardim.', emoji: '⚗️', category: 'advanced' },
    { id: 'scrap_press', name: 'Compactador de Sucata', description: 'Permite reciclagem sob alta pressão.', emoji: '🗜️', category: 'advanced' },
    { id: 'stellar_receptor', name: 'Painel Receptor Estelar', description: 'Sintoniza ondas cósmicas para coleta offline.', emoji: '📡', category: 'advanced' },
    { id: 'reality_anchor', name: 'Ancorador de Realidade', description: 'Protege heróis e prédios de resets de Rebirth.', emoji: '⚓', category: 'advanced' },

    // ── Sinergias Globais ───────────────────────────────────────────────────
    { id: 'portal_stabilizer', name: 'Estabilizador de Portal', description: 'Componente dimensional que mitiga o reset de prestígio.', emoji: '🌀', category: 'advanced' },
    { id: 'automated_temple', name: 'Templo Automatizado', description: 'Gerador autônomo de Favor Divino para o Panteão.', emoji: '🛕', category: 'advanced' },
    { id: 'plasma_catalyst', name: 'Catalisador de Plasma', description: 'Amplificador de energia da Forja Estelar.', emoji: '⚡', category: 'advanced' },
    { id: 'adrenaline_shot', name: 'Injeção de Adrenalina', description: 'Consumível de Arena: concede imunidade ao primeiro debuff.', emoji: '💉', category: 'advanced' },
    { id: 'Mapping_Drones', name: 'Drones de Mapeamento', description: 'Aceleram expedições em 20% e duplicam drop de minérios.', emoji: '🛸', category: 'advanced' },
    { id: 'Holographic_Alloys', name: 'Ligas Holográficas', description: 'Fundem cartas mecanizadas (+10% HP permanente).', emoji: '💿', category: 'advanced' },
    { id: 'Field_Shield_Generators', name: 'Escudos de Cerco', description: 'Mitigam dano no World Boss em +15%.', emoji: '🛡️', category: 'advanced' },
    { id: 'Hydraulic_Matter_Injectors', name: 'Injetores de Matéria', description: 'Evitam afixos negativos na Forja do Vazio.', emoji: '💉', category: 'advanced' }
];

export const MACHINES: MachineInfo[] = [
    // ── Extratores ──────────────────────────────────────────────────────────
    { id: 'burner_miner', name: 'Mineradora Básica', description: 'Extração manual/combustão sem custo elétrico.', type: 'extractor', emoji: '⛏️', cost: { 'gold': 500 }, speedMultiplier: 1.0 },
    { id: 'electric_miner', name: 'Mineradora Elétrica', description: 'Extração automatizada de alta velocidade (40 MW).', type: 'extractor', emoji: '⚡', cost: { 'gold': 2000 }, speedMultiplier: 2.0 },
    { id: 'oil_pumpjack', name: 'Bomba de Petróleo', description: 'Bombeia Petróleo Bruto continuamente dos poços (50 MW).', type: 'extractor', emoji: '🛢️', cost: { 'gold': 4000 }, speedMultiplier: 1.5 },

    // ── Fornalhas ───────────────────────────────────────────────────────────
    { id: 'stone_furnace', name: 'Fornalha de Pedra', description: 'Funde minérios em barras sólidas com 20 MW.', type: 'smelter', emoji: '🔥', cost: { 'gold': 1000 }, speedMultiplier: 1.0 },
    { id: 'steel_furnace', name: 'Fornalha de Aço', description: 'Funde com o dobro da velocidade com 40 MW.', type: 'smelter', emoji: '🏭', cost: { 'gold': 4000 }, speedMultiplier: 2.0 },
    { id: 'electric_furnace', name: 'Fornalha Elétrica', description: 'Fornalha de indução elétrica de ponta com slots de módulos (90 MW).', type: 'smelter', emoji: '⚡', cost: { 'gold': 10000 }, speedMultiplier: 3.0, moduleSlots: 2 },

    // ── Montadoras ──────────────────────────────────────────────────────────
    { id: 'assembler_1', name: 'Máquina de Montagem 1', description: 'Monta itens a partir de componentes básicos (30 MW).', type: 'assembler', emoji: '🏭', cost: { 'gold': 2500 }, speedMultiplier: 1.0 },
    { id: 'assembler_2', name: 'Máquina de Montagem 2', description: 'Montagem rápida com suporte a fluídos (50 MW).', type: 'assembler', emoji: '🏭', cost: { 'gold': 6000 }, speedMultiplier: 1.75, moduleSlots: 2 },
    { id: 'assembler_3', name: 'Máquina de Montagem 3', description: 'Pico da automação industrial (120 MW, 4 slots de módulos).', type: 'assembler', emoji: '🏭', cost: { 'gold': 18000 }, speedMultiplier: 2.5, moduleSlots: 4 },

    // ── Químicos & Nucleares ────────────────────────────────────────────────
    { id: 'oil_refinery', name: 'Refinaria de Petróleo', description: 'Fraciona Petróleo Bruto em Gás de Petróleo e óleos (200 MW).', type: 'refinery', emoji: '🏢', cost: { 'gold': 8000 }, speedMultiplier: 1.0 },
    { id: 'chemical_plant', name: 'Planta Química', description: 'Sintetiza Plástico, Enxofre e Ácido Sulfúrico (150 MW).', type: 'chemical_plant', emoji: '⚗️', cost: { 'gold': 6000 }, speedMultiplier: 1.0, moduleSlots: 2 },
    { id: 'centrifuge', name: 'Centrífuga de Urânio', description: 'Isola Urânio-235 para enriquecimento nuclear (300 MW).', type: 'centrifuge', emoji: '☢️', cost: { 'gold': 20000 }, speedMultiplier: 1.0 },

    // ── Laboratórios & Silos ────────────────────────────────────────────────
    { id: 'research_lab', name: 'Laboratório de Pesquisa', description: 'Consome pacotes de ciência para desbloquear tecnologias (60 MW).', type: 'lab', emoji: '🔬', cost: { 'gold': 3000 }, speedMultiplier: 1.0, moduleSlots: 2 },
    { id: 'rocket_silo', name: 'Silo de Foguete', description: 'Estrutura orbital titânica para construir e lançar foguetes (500 MW).', type: 'silo', emoji: '🚀', cost: { 'gold': 100000 }, speedMultiplier: 1.0, moduleSlots: 4 },

    // ── Geradores de Energia ────────────────────────────────────────────────
    { id: 'steam_engine', name: 'Motor a Vapor', description: 'Queima 0.1 carvão/s para gerar +500 MW.', type: 'generator', emoji: '🚂', cost: { 'gold': 5000 } },
    { id: 'solar_panel', name: 'Painel Solar', description: 'Geração 100% limpa e contínua de +200 MW sem consumo de combustível.', type: 'generator', emoji: '☀️', cost: { 'gold': 12000 } },
    { id: 'nuclear_reactor', name: 'Reator Nuclear', description: 'Fissão atômica massiva gerando +5.000 MW com 1 Célula de Urânio a cada 100s.', type: 'generator', emoji: '☢️', cost: { 'gold': 60000 } }
];

export const RECIPES: Recipe[] = [
    // ── Extração Básica (0 MW) & Avançada ───────────────────────────────────
    { id: 'mine_copper', name: 'Mineração: Cobre', inputs: {}, outputs: { 'copper_ore': 1 }, time: 1, machineType: 'extractor', powerDraw: 0 },
    { id: 'mine_iron', name: 'Mineração: Ferro', inputs: {}, outputs: { 'iron_ore': 1 }, time: 1, machineType: 'extractor', powerDraw: 0 },
    { id: 'mine_coal', name: 'Mineração: Carvão', inputs: {}, outputs: { 'coal': 1 }, time: 1, machineType: 'extractor', powerDraw: 0 },
    { id: 'mine_stone', name: 'Mineração: Pedra', inputs: {}, outputs: { 'stone': 1 }, time: 1, machineType: 'extractor', powerDraw: 0 },
    { id: 'pump_oil', name: 'Bombear: Petróleo Bruto', inputs: {}, outputs: { 'crude_oil': 2 }, time: 2, machineType: 'extractor', powerDraw: 50 },
    { id: 'mine_uranium', name: 'Mineração: Urânio', inputs: { 'sulfuric_acid': 1 }, outputs: { 'uranium_ore': 1 }, time: 4, machineType: 'extractor', powerDraw: 100 },

    // ── Fundição ────────────────────────────────────────────────────────────
    { id: 'smelt_copper', name: 'Fundição: Placa de Cobre', inputs: { 'copper_ore': 1 }, outputs: { 'copper_ingot': 1 }, time: 2, machineType: 'smelter', powerDraw: 20 },
    { id: 'smelt_iron', name: 'Fundição: Placa de Ferro', inputs: { 'iron_ore': 1 }, outputs: { 'iron_ingot': 1 }, time: 2, machineType: 'smelter', powerDraw: 20 },
    { id: 'smelt_steel', name: 'Fundição: Placa de Aço', inputs: { 'iron_ingot': 5 }, outputs: { 'steel_plate': 1 }, time: 8, machineType: 'smelter', powerDraw: 40 },

    // ── Montagem: Componentes Intermediários ─────────────────────────────────
    { id: 'craft_wire', name: 'Montar: Fio de Cobre', inputs: { 'copper_ingot': 1 }, outputs: { 'copper_wire': 2 }, time: 2, machineType: 'assembler', powerDraw: 30 },
    { id: 'craft_gear', name: 'Montar: Engrenagem', inputs: { 'iron_ingot': 2 }, outputs: { 'iron_gear': 1 }, time: 2, machineType: 'assembler', powerDraw: 30 },
    { id: 'craft_belt', name: 'Montar: Esteira de Transporte', inputs: { 'iron_ingot': 1, 'iron_gear': 1 }, outputs: { 'transport_belt': 2 }, time: 1, machineType: 'assembler', powerDraw: 30 },
    { id: 'craft_inserter', name: 'Montar: Inseridor Básico', inputs: { 'iron_gear': 1, 'iron_ingot': 1, 'basic_circuit': 1 }, outputs: { 'inserter': 1 }, time: 1, machineType: 'assembler', powerDraw: 30 },
    { id: 'craft_fast_inserter', name: 'Montar: Inseridor Rápido', inputs: { 'inserter': 1, 'basic_circuit': 2, 'iron_ingot': 2 }, outputs: { 'fast_inserter': 1 }, time: 2, machineType: 'assembler', powerDraw: 40 },
    { id: 'craft_engine', name: 'Montar: Motor a Combustão', inputs: { 'steel_plate': 1, 'iron_gear': 1, 'iron_ingot': 2 }, outputs: { 'engine_unit': 1 }, time: 5, machineType: 'assembler', powerDraw: 40 },
    { id: 'craft_electric_engine', name: 'Montar: Motor Elétrico', inputs: { 'engine_unit': 1, 'basic_circuit': 2, 'sulfuric_acid': 1 }, outputs: { 'electric_engine': 1 }, time: 5, machineType: 'assembler', powerDraw: 50 },

    // ── Montagem: Eletrônica ─────────────────────────────────────────────────
    { id: 'craft_circuit', name: 'Montar: Circuito Básico (Verde)', inputs: { 'iron_ingot': 1, 'copper_wire': 3 }, outputs: { 'basic_circuit': 1 }, time: 2, machineType: 'assembler', powerDraw: 40 },
    { id: 'craft_advanced_circuit', name: 'Montar: Circuito Avançado (Vermelho)', inputs: { 'basic_circuit': 2, 'plastic_bar': 2, 'copper_wire': 4 }, outputs: { 'advanced_circuit': 1 }, time: 6, machineType: 'assembler', powerDraw: 60 },
    { id: 'craft_processing_unit', name: 'Montar: Unidade de Processamento (Azul)', inputs: { 'basic_circuit': 10, 'advanced_circuit': 2, 'sulfuric_acid': 1 }, outputs: { 'processing_unit': 1 }, time: 10, machineType: 'assembler', powerDraw: 100 },

    // ── Petroquímica & Química ──────────────────────────────────────────────
    { id: 'refine_basic_oil', name: 'Refino: Petróleo Básico', inputs: { 'crude_oil': 5 }, outputs: { 'petroleum_gas': 4 }, time: 5, machineType: 'refinery', powerDraw: 200 },
    { id: 'craft_plastic', name: 'Química: Barra de Plástico', inputs: { 'petroleum_gas': 2, 'coal': 1 }, outputs: { 'plastic_bar': 2 }, time: 2, machineType: 'chemical_plant', powerDraw: 150 },
    { id: 'craft_sulfur', name: 'Química: Enxofre', inputs: { 'petroleum_gas': 3 }, outputs: { 'sulfur': 2 }, time: 2, machineType: 'chemical_plant', powerDraw: 150 },
    { id: 'craft_sulfuric_acid', name: 'Química: Ácido Sulfúrico', inputs: { 'sulfur': 2, 'iron_ingot': 1 }, outputs: { 'sulfuric_acid': 2 }, time: 3, machineType: 'chemical_plant', powerDraw: 150 },
    { id: 'craft_battery', name: 'Química: Bateria', inputs: { 'sulfuric_acid': 1, 'copper_ingot': 1, 'iron_ingot': 1 }, outputs: { 'battery': 1 }, time: 4, machineType: 'chemical_plant', powerDraw: 150 },

    // ── Módulos ─────────────────────────────────────────────────────────────
    { id: 'craft_speed_mod', name: 'Montar: Módulo de Velocidade I', inputs: { 'advanced_circuit': 5, 'basic_circuit': 5 }, outputs: { 'speed_module_1': 1 }, time: 15, machineType: 'assembler', powerDraw: 80 },
    { id: 'craft_prod_mod', name: 'Montar: Módulo de Produtividade I', inputs: { 'advanced_circuit': 5, 'basic_circuit': 5 }, outputs: { 'productivity_module_1': 1 }, time: 15, machineType: 'assembler', powerDraw: 80 },
    { id: 'craft_eff_mod', name: 'Montar: Módulo de Eficiência I', inputs: { 'advanced_circuit': 5, 'basic_circuit': 5 }, outputs: { 'efficiency_module_1': 1 }, time: 15, machineType: 'assembler', powerDraw: 80 },

    // ── 7 Pacotes de Ciência ────────────────────────────────────────────────
    { id: 'craft_science_red', name: 'Ciência: Automação (Vermelha)', inputs: { 'copper_ingot': 1, 'iron_gear': 1 }, outputs: { 'science_red': 1 }, time: 5, machineType: 'assembler', powerDraw: 50 },
    { id: 'craft_science_green', name: 'Ciência: Logística (Verde)', inputs: { 'transport_belt': 1, 'inserter': 1 }, outputs: { 'science_green': 1 }, time: 6, machineType: 'assembler', powerDraw: 60 },
    { id: 'craft_science_gray', name: 'Ciência: Militar (Cinza)', inputs: { 'iron_gear': 1, 'steel_plate': 1, 'stone': 2 }, outputs: { 'science_gray': 1 }, time: 8, machineType: 'assembler', powerDraw: 70 },
    { id: 'craft_science_blue', name: 'Ciência: Química (Azul)', inputs: { 'advanced_circuit': 2, 'engine_unit': 1, 'sulfur': 1 }, outputs: { 'science_blue': 2 }, time: 12, machineType: 'assembler', powerDraw: 90 },
    { id: 'craft_science_purple', name: 'Ciência: Produção (Roxa)', inputs: { 'steel_plate': 5, 'productivity_module_1': 1, 'stone': 10 }, outputs: { 'science_purple': 2 }, time: 18, machineType: 'assembler', powerDraw: 120 },
    { id: 'craft_science_yellow', name: 'Ciência: Utilitária (Amarela)', inputs: { 'processing_unit': 2, 'low_density_structure': 1, 'electric_engine': 1 }, outputs: { 'science_yellow': 2 }, time: 20, machineType: 'assembler', powerDraw: 140 },

    // ── Componentes Espaciais & Silo ────────────────────────────────────────
    { id: 'craft_low_density', name: 'Montar: Estrutura Baixa Densidade', inputs: { 'steel_plate': 5, 'copper_ingot': 10, 'plastic_bar': 3 }, outputs: { 'low_density_structure': 1 }, time: 15, machineType: 'assembler', powerDraw: 100 },
    { id: 'craft_rocket_fuel', name: 'Química: Combustível de Foguete', inputs: { 'petroleum_gas': 10, 'coal': 5 }, outputs: { 'rocket_fuel': 1 }, time: 20, machineType: 'chemical_plant', powerDraw: 150 },
    { id: 'craft_rocket_control', name: 'Montar: Controle de Foguete', inputs: { 'processing_unit': 1, 'speed_module_1': 1 }, outputs: { 'rocket_control_unit': 1 }, time: 25, machineType: 'assembler', powerDraw: 120 },
    { id: 'craft_satellite', name: 'Montar: Satélite Espacial', inputs: { 'low_density_structure': 20, 'rocket_fuel': 10, 'processing_unit': 20, 'battery': 20 }, outputs: { 'satellite': 1 }, time: 60, machineType: 'assembler', powerDraw: 250 },

    // ── Processamento Nuclear & Combustível ──────────────────────────────────
    { id: 'process_uranium', name: 'Centrifugação: Urânio', inputs: { 'uranium_ore': 10 }, outputs: { 'uranium_238': 9, 'uranium_235': 1 }, time: 12, machineType: 'centrifuge', powerDraw: 300 },
    { id: 'craft_fuel_cell', name: 'Montar: Célula de Urânio', inputs: { 'uranium_235': 1, 'uranium_238': 9, 'iron_ingot': 5 }, outputs: { 'uranium_fuel_cell': 5 }, time: 10, machineType: 'assembler', powerDraw: 200 },

    // ── Geradores de Energia ────────────────────────────────────────────────
    { id: 'gen_steam', name: 'Gerar Energia a Vapor', inputs: { 'coal': 1 }, outputs: {}, time: 10, machineType: 'generator', powerDraw: -500 }, // Produz 500 MW
    { id: 'gen_solar', name: 'Geração Solar Fotovoltaica', inputs: {}, outputs: {}, time: 1, machineType: 'generator', powerDraw: -200 }, // Produz 200 MW contínuos
    { id: 'gen_nuclear', name: 'Geração de Fissão Nuclear', inputs: { 'uranium_fuel_cell': 1 }, outputs: {}, time: 100, machineType: 'generator', powerDraw: -5000 }, // Produz 5.000 MW

    // ── Armas & Sinergias Clássicas ─────────────────────────────────────────
    { id: 'craft_catapult', name: 'Montar: Catapulta de Cerco', inputs: { 'iron_gear': 50, 'coal': 100 }, outputs: { 'siege_catapult': 1 }, time: 60, machineType: 'assembler', powerDraw: 100 },
    { id: 'craft_plasma_cannon', name: 'Montar: Canhão de Plasma', inputs: { 'basic_circuit': 20, 'copper_wire': 100 }, outputs: { 'plasma_cannon': 1 }, time: 300, machineType: 'assembler', powerDraw: 500 },
    { id: 'craft_automated_dredge', name: 'Montar: Automated Dredges', inputs: { 'basic_circuit': 10, 'copper_wire': 20 }, outputs: { 'automated_dredge': 1 }, time: 60, machineType: 'assembler', powerDraw: 100 },
    { id: 'craft_hydroponic_irrigation', name: 'Montar: Hydroponic Irrigation', inputs: { 'basic_circuit': 5, 'copper_wire': 15 }, outputs: { 'hydroponic_irrigation': 1 }, time: 45, machineType: 'assembler', powerDraw: 80 },
    { id: 'craft_overcharged_ammo', name: 'Montar: Overcharged Ammunition', inputs: { 'iron_ingot': 5, 'copper_wire': 10 }, outputs: { 'overcharged_ammo': 1 }, time: 30, machineType: 'assembler', powerDraw: 50 },
    { id: 'craft_starlight_microchip', name: 'Montar: Starlight Microchips', inputs: { 'basic_circuit': 10, 'copper_wire': 50 }, outputs: { 'starlight_microchip': 1 }, time: 45, machineType: 'assembler', powerDraw: 80 },
    { id: 'craft_magnetic_coil', name: 'Montar: Magnetic Coils', inputs: { 'copper_wire': 30, 'iron_ingot': 5 }, outputs: { 'magnetic_coil': 1 }, time: 20, machineType: 'assembler', powerDraw: 60 },

    // ── Backrooms Tech Recipes ──────────────────────────────────────────────
    { id: 'craft_liminal_scrap', name: 'Montar: Sucata Liminar', inputs: { 'iron_gear': 2 }, outputs: { 'liminal_scrap': 1 }, time: 5, machineType: 'assembler', powerDraw: 30, requiredBackroomsLevel: 0 },
    { id: 'craft_dense_concrete', name: 'Montar: Concreto Denso', inputs: { 'iron_ore': 5, 'coal': 2 }, outputs: { 'dense_concrete': 1 }, time: 10, machineType: 'assembler', powerDraw: 20, requiredBackroomsLevel: 1 },
    { id: 'craft_anomalous_microchip', name: 'Montar: Microchip Anômalo', inputs: { 'starlight_microchip': 1, 'basic_circuit': 2 }, outputs: { 'anomalous_microchip': 1 }, time: 15, machineType: 'assembler', powerDraw: 50, requiredBackroomsLevel: 4 },
    { id: 'craft_dark_matter', name: 'Montar: Matéria Escura', inputs: { 'basic_circuit': 5, 'magnetic_coil': 2 }, outputs: { 'dark_matter': 1 }, time: 30, machineType: 'assembler', powerDraw: 100, requiredBackroomsLevel: 8 },
    { id: 'craft_reinforced_alloy', name: 'Montar: Liga Reforçada', inputs: { 'iron_ore': 4, 'copper_wire': 6 }, outputs: { 'reinforced_alloy': 1 }, time: 10, machineType: 'assembler', powerDraw: 40, requiredBackroomsLevel: 1 },
    { id: 'craft_almond_condenser', name: 'Criar: Condensador Alquímico', inputs: { 'iron_ingot': 50, 'liminal_scrap': 15 }, outputs: { 'almond_condenser': 1 }, time: 300, machineType: 'assembler', powerDraw: 150, requiredBackroomsLevel: 0 },
    { id: 'craft_scrap_press', name: 'Criar: Compactador de Sucata', inputs: { 'steel_plate': 30, 'dense_concrete': 20 }, outputs: { 'scrap_press': 1 }, time: 600, machineType: 'assembler', powerDraw: 200, requiredBackroomsLevel: 1 },
    { id: 'craft_stellar_receptor', name: 'Criar: Receptor Estelar', inputs: { 'anomalous_microchip': 10, 'basic_circuit': 30, 'copper_wire': 100 }, outputs: { 'stellar_receptor': 1 }, time: 1800, machineType: 'assembler', powerDraw: 350, requiredBackroomsLevel: 4 },
    { id: 'craft_reality_anchor', name: 'Criar: Ancorador de Realidade', inputs: { 'dark_matter': 5, 'magnetic_coil': 50 }, outputs: { 'reality_anchor': 1 }, time: 3600, machineType: 'assembler', powerDraw: 500, requiredBackroomsLevel: 8 },

    // ── Global Industry Synergy Recipes ─────────────────────────────────────
    { id: 'craft_portal_stabilizer', name: 'Criar: Estabilizador de Portal', inputs: { 'reinforced_alloy': 10, 'dark_matter': 3, 'anomalous_microchip': 5 }, outputs: { 'portal_stabilizer': 1 }, time: 1200, machineType: 'assembler', powerDraw: 400, requiredBackroomsLevel: 4 },
    { id: 'craft_automated_temple', name: 'Criar: Templo Automatizado', inputs: { 'basic_circuit': 20, 'magnetic_coil': 10, 'steel_plate': 15 }, outputs: { 'automated_temple': 1 }, time: 900, machineType: 'assembler', powerDraw: 300, requiredBackroomsLevel: 1 },
    { id: 'craft_plasma_catalyst', name: 'Criar: Catalisador de Plasma', inputs: { 'anomalous_microchip': 8, 'dark_matter': 2, 'copper_wire': 50 }, outputs: { 'plasma_catalyst': 1 }, time: 1500, machineType: 'assembler', powerDraw: 450, requiredBackroomsLevel: 8 },
    { id: 'craft_adrenaline_shot', name: 'Criar: Injeção de Adrenalina', inputs: { 'iron_ingot': 3, 'copper_wire': 5, 'coal': 2 }, outputs: { 'adrenaline_shot': 1 }, time: 60, machineType: 'assembler', powerDraw: 50 },
    { id: 'craft_mapping_drones', name: 'Criar: Drones de Mapeamento', inputs: { 'basic_circuit': 10, 'iron_ingot': 20 }, outputs: { 'Mapping_Drones': 1 }, time: 60, machineType: 'assembler', powerDraw: 100 },
    { id: 'craft_holographic_alloys', name: 'Criar: Ligas Holográficas', inputs: { 'reinforced_alloy': 5, 'dark_matter': 1 }, outputs: { 'Holographic_Alloys': 1 }, time: 120, machineType: 'assembler', powerDraw: 150 },
    { id: 'craft_field_shield_generators', name: 'Criar: Escudos de Cerco', inputs: { 'steel_plate': 10, 'magnetic_coil': 5 }, outputs: { 'Field_Shield_Generators': 1 }, time: 90, machineType: 'assembler', powerDraw: 120 },
    { id: 'craft_hydraulic_matter_injectors', name: 'Criar: Injetores Estabilizadores', inputs: { 'basic_circuit': 5, 'copper_wire': 15 }, outputs: { 'Hydraulic_Matter_Injectors': 1 }, time: 60, machineType: 'assembler', powerDraw: 80 }
];

export const FACTORIO_TECHS: TechNode[] = [
    {
        id: 'tech_automation_1',
        name: 'Automação I',
        description: 'Desbloqueia Máquinas de Montagem e produção em série com Ciência de Automação.',
        emoji: '⚙️',
        tier: 1,
        cost: { 'science_red': 10 },
        pointsRequired: 10,
        prerequisites: [],
        unlockedRecipes: ['craft_wire', 'craft_gear', 'craft_circuit', 'craft_science_red'],
        unlockedMachines: ['assembler_1', 'research_lab'],
        bonusDescription: '+10% de velocidade na fabricação básica'
    },
    {
        id: 'tech_logistics_1',
        name: 'Logística I',
        description: 'Desenvolvimento de esteiras e braços inseridores motorizados.',
        emoji: '🟡',
        tier: 1,
        cost: { 'science_red': 20 },
        pointsRequired: 20,
        prerequisites: ['tech_automation_1'],
        unlockedRecipes: ['craft_belt', 'craft_inserter', 'craft_science_green'],
        bonusDescription: 'Desbloqueia Esteiras Amarelas e Inseridores'
    },
    {
        id: 'tech_steel_processing',
        name: 'Processamento de Aço',
        description: 'Fundição sob alta temperatura para converter ferro em ligas de aço estrutural.',
        emoji: '💳',
        tier: 2,
        cost: { 'science_red': 40 },
        pointsRequired: 40,
        prerequisites: ['tech_automation_1'],
        unlockedRecipes: ['smelt_steel'],
        unlockedMachines: ['steel_furnace'],
        bonusDescription: 'Desbloqueia Fornalhas de Aço (2x velocidade)'
    },
    {
        id: 'tech_automation_2',
        name: 'Automação II',
        description: 'Montadoras avançadas com suporte a fluidos e motores mecânicos.',
        emoji: '🏭',
        tier: 2,
        cost: { 'science_red': 50, 'science_green': 50 },
        pointsRequired: 50,
        prerequisites: ['tech_logistics_1', 'tech_steel_processing'],
        unlockedRecipes: ['craft_engine', 'craft_fast_inserter'],
        unlockedMachines: ['assembler_2', 'electric_miner'],
        bonusDescription: 'Desbloqueia Montadora 2 e Mineradora Elétrica'
    },
    {
        id: 'tech_military_science',
        name: 'Ciência Militar',
        description: 'Pesquisa armamentista e catapultas industriais de cerco.',
        emoji: '🔘',
        tier: 2,
        cost: { 'science_red': 50, 'science_green': 50 },
        pointsRequired: 50,
        prerequisites: ['tech_steel_processing'],
        unlockedRecipes: ['craft_science_gray', 'craft_catapult'],
        bonusDescription: '+15% de poder de cerco em guerras de território'
    },
    {
        id: 'tech_oil_processing',
        name: 'Petroquímica & Refino',
        description: 'Extração e destilação de petróleo cru em gás de petróleo, plástico e enxofre.',
        emoji: '🛢️',
        tier: 3,
        cost: { 'science_red': 100, 'science_green': 100 },
        pointsRequired: 100,
        prerequisites: ['tech_automation_2'],
        unlockedRecipes: ['pump_oil', 'refine_basic_oil', 'craft_plastic', 'craft_sulfur', 'craft_sulfuric_acid'],
        unlockedMachines: ['oil_pumpjack', 'oil_refinery', 'chemical_plant'],
        bonusDescription: 'Desbloqueia a era petroquímica'
    },
    {
        id: 'tech_advanced_electronics',
        name: 'Eletrônica Avançada',
        description: 'Desenvolvimento de Circuitos Avançados (Vermelhos) com polímeros de plástico.',
        emoji: '🟥',
        tier: 3,
        cost: { 'science_red': 100, 'science_green': 100 },
        pointsRequired: 100,
        prerequisites: ['tech_oil_processing'],
        unlockedRecipes: ['craft_advanced_circuit'],
        bonusDescription: 'Desbloqueia Circuitos Vermelhos'
    },
    {
        id: 'tech_chemical_science',
        name: 'Ciência Química',
        description: 'Pacote de ciência azul necessário para tecnologias industriais pesadas.',
        emoji: '🔵',
        tier: 3,
        cost: { 'science_red': 150, 'science_green': 150 },
        pointsRequired: 150,
        prerequisites: ['tech_advanced_electronics'],
        unlockedRecipes: ['craft_science_blue', 'craft_battery', 'craft_electric_engine'],
        bonusDescription: 'Desbloqueia Ciência Azul e Baterias'
    },
    {
        id: 'tech_solar_energy',
        name: 'Energia Solar',
        description: 'Painéis solares fotovoltaicos para gerar energia limpa sem combustível.',
        emoji: '☀️',
        tier: 3,
        cost: { 'science_red': 100, 'science_green': 100 },
        pointsRequired: 100,
        prerequisites: ['tech_advanced_electronics'],
        unlockedRecipes: ['gen_solar'],
        unlockedMachines: ['solar_panel'],
        bonusDescription: 'Desbloqueia Painéis Solares (+200 MW contínuos)'
    },
    {
        id: 'tech_modules',
        name: 'Módulos Industriais',
        description: 'Módulos engastáveis para aumentar velocidade, produtividade ou eficiência.',
        emoji: '⚡',
        tier: 4,
        cost: { 'science_red': 200, 'science_green': 200, 'science_blue': 200 },
        pointsRequired: 200,
        prerequisites: ['tech_chemical_science'],
        unlockedRecipes: ['craft_speed_mod', 'craft_prod_mod', 'craft_eff_mod'],
        bonusDescription: 'Desbloqueia Módulos de Velocidade, Produtividade e Eficiência'
    },
    {
        id: 'tech_processing_units',
        name: 'Unidades de Processamento',
        description: 'Circuitos integrados de altíssima escala (Circuitos Azuis).',
        emoji: '🟦',
        tier: 4,
        cost: { 'science_red': 250, 'science_green': 250, 'science_blue': 250 },
        pointsRequired: 250,
        prerequisites: ['tech_modules'],
        unlockedRecipes: ['craft_processing_unit'],
        bonusDescription: 'Desbloqueia Circuitos Azuis'
    },
    {
        id: 'tech_production_science',
        name: 'Ciência de Produção',
        description: 'Pacote de ciência roxo e fornalhas de indução elétrica de alto rendimento.',
        emoji: '🟣',
        tier: 4,
        cost: { 'science_red': 300, 'science_green': 300, 'science_blue': 300 },
        pointsRequired: 300,
        prerequisites: ['tech_processing_units'],
        unlockedRecipes: ['craft_science_purple'],
        unlockedMachines: ['electric_furnace', 'assembler_3'],
        bonusDescription: 'Desbloqueia Ciência Roxa, Fornalha Elétrica e Montadora 3'
    },
    {
        id: 'tech_nuclear_power',
        name: 'Energia Nuclear & Fissão',
        description: 'Extração e enriquecimento de Urânio para alimentar Reatores Nucleares colossais.',
        emoji: '☢️',
        tier: 5,
        cost: { 'science_red': 400, 'science_green': 400, 'science_blue': 400, 'science_purple': 400 },
        pointsRequired: 400,
        prerequisites: ['tech_production_science'],
        unlockedRecipes: ['mine_uranium', 'process_uranium', 'craft_fuel_cell', 'gen_nuclear'],
        unlockedMachines: ['centrifuge', 'nuclear_reactor'],
        bonusDescription: 'Desbloqueia Reator Nuclear (+5.000 MW)'
    },
    {
        id: 'tech_utility_science',
        name: 'Ciência Utilitária & Aeroespacial',
        description: 'Ciência amarela e ligas de baixa densidade para componentes de foguete.',
        emoji: '🟡',
        tier: 5,
        cost: { 'science_red': 400, 'science_green': 400, 'science_blue': 400, 'science_purple': 400 },
        pointsRequired: 400,
        prerequisites: ['tech_production_science'],
        unlockedRecipes: ['craft_science_yellow', 'craft_low_density', 'craft_rocket_fuel', 'craft_rocket_control'],
        bonusDescription: 'Desbloqueia Ciência Amarela e Peças de Foguete'
    },
    {
        id: 'tech_rocket_silo',
        name: 'Silo de Foguete & Satélite',
        description: 'Construção da plataforma orbital do Silo de Foguete e Satélite Espacial.',
        emoji: '🚀',
        tier: 6,
        cost: { 'science_red': 1000, 'science_green': 1000, 'science_blue': 1000, 'science_purple': 1000, 'science_yellow': 1000 },
        pointsRequired: 1000,
        prerequisites: ['tech_nuclear_power', 'tech_utility_science'],
        unlockedRecipes: ['craft_satellite'],
        unlockedMachines: ['rocket_silo'],
        bonusDescription: 'Desbloqueia o Silo de Foguete e Ciência Espacial Branca'
    },
    {
        id: 'tech_space_productivity',
        name: 'Produtividade Espacial Infinita',
        description: 'Pesquisa repetível que aprimora toda a produção global e combate com dados orbitais.',
        emoji: '⚪',
        tier: 7,
        cost: { 'science_white': 500 },
        pointsRequired: 500,
        prerequisites: ['tech_rocket_silo'],
        unlockedRecipes: [],
        bonusDescription: '+5% de Dano Global, +5% de Ouro e +5% de Velocidade da Vila por nível'
    }
];

export interface IndustrySimulationResult {
    newInventory: Record<string, number>;
    powerGenerated: number;
    powerConsumed: number;
    powerEfficiency: number;
    flowPerSecond: Record<string, number>;
    researchPointsGained: number;
    labsActiveCount: number;
}

export function simulateIndustryTick(
    nodes: MachineNode[], 
    inventory: Record<string, number>, 
    deltaSeconds: number, 
    costReduction: number = 0,
    activeResearchTech?: TechNode | null
): IndustrySimulationResult {
    let powerGenerated = 0;
    let powerConsumed = 0;
    const newInventory = { ...inventory };
    const flowPerSecond = new Map<string, number>();

    // 1. Calculate Power Grid (Generation & Consumption)
    nodes.forEach(node => {
        const recipe = RECIPES.find(r => r.id === node.recipeId);
        const machine = MACHINES.find(m => m.id === node.machineId);

        // Lab power
        if (machine && machine.type === 'lab') {
            powerConsumed += 60 * node.count;
            return;
        }

        if (!recipe) return;

        if (recipe.powerDraw < 0) {
            // Generator logic
            if (Object.keys(recipe.inputs).length === 0 ||
                Object.entries(recipe.inputs).every(([k, v]) => (newInventory[k] || 0) >= (v / recipe.time) * node.count * deltaSeconds)) {
                powerGenerated += Math.abs(recipe.powerDraw) * node.count;
            }
        } else {
            // Apply efficiency module reduction if present
            let effectivePowerDraw = recipe.powerDraw;
            if (node.modules?.includes('efficiency_module_1')) {
                effectivePowerDraw *= 0.70; // -30% power
            }
            if (node.modules?.includes('speed_module_1')) {
                effectivePowerDraw *= 1.30; // +30% power
            }
            powerConsumed += effectivePowerDraw * node.count;
        }
    });

    // 2. Determine Power Efficiency (0.0 to 1.0)
    const powerEfficiency = Math.min(1.0, powerGenerated > 0 ? (powerGenerated / Math.max(1, powerConsumed)) : (powerConsumed > 0 ? 0.0 : 1.0));

    // 3. Process Factory Machines
    nodes.forEach(node => {
        const recipe = RECIPES.find(r => r.id === node.recipeId);
        const machine = MACHINES.find(m => m.id === node.machineId);
        if (!recipe || !machine || machine.type === 'lab') return;

        // Base speed & module multipliers
        let speedMult = machine.speedMultiplier || 1.0;
        let bonusProductivity = 0.0;

        if (node.modules?.includes('speed_module_1')) {
            speedMult *= 1.20;
        }
        if (node.modules?.includes('productivity_module_1')) {
            bonusProductivity += 0.04; // +4% free extra output
            speedMult *= 0.90; // -10% speed
        }

        const cyclesPerSecond = (1 / recipe.time) * node.count * speedMult;
        let expectedCycles = cyclesPerSecond * deltaSeconds;

        if (recipe.powerDraw > 0) {
            expectedCycles *= powerEfficiency;
        }

        // Check available inputs
        let possibleCycles = expectedCycles;
        for (const [inputId, inputAmount] of Object.entries(recipe.inputs)) {
            let adjustedAmount = inputAmount;
            if (costReduction > 0 && (recipe.id === 'craft_catapult' || recipe.id === 'craft_plasma_cannon')) {
                adjustedAmount = Math.max(1, Math.floor(inputAmount * (1 - costReduction)));
            }
            if (recipe.id === 'craft_reinforced_alloy' && inputId === 'iron_ore' && (newInventory['scrap_press'] || 0) >= 1) {
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
            if (recipe.id === 'craft_reinforced_alloy' && inputId === 'iron_ore' && (newInventory['scrap_press'] || 0) >= 1) {
                adjustedAmount = Math.max(1, Math.floor(inputAmount * 0.5));
            }
            const consumed = possibleCycles * adjustedAmount;
            newInventory[inputId] = Math.max(0, (newInventory[inputId] || 0) - consumed);
            flowPerSecond.set(inputId, (flowPerSecond.get(inputId) || 0) - (consumed / deltaSeconds));
        }

        // Apply production (with bonus productivity)
        for (const [outputId, outputAmount] of Object.entries(recipe.outputs)) {
            const produced = possibleCycles * outputAmount * (1 + bonusProductivity);
            newInventory[outputId] = (newInventory[outputId] || 0) + produced;
            flowPerSecond.set(outputId, (flowPerSecond.get(outputId) || 0) + (produced / deltaSeconds));
        }
    });

    // 4. Process Research Labs (Science Consumption & Points Generation)
    let researchPointsGained = 0;
    const labNodes = nodes.filter(n => n.machineId === 'research_lab');
    const totalLabCount = labNodes.reduce((acc, n) => acc + n.count, 0);

    if (activeResearchTech && totalLabCount > 0 && powerEfficiency > 0.1) {
        // Labs consume 1 pack of each required science type per 5 seconds per lab
        const requiredScienceTypes = Object.keys(activeResearchTech.cost);
        const labSpeed = 0.2 * totalLabCount * powerEfficiency * deltaSeconds;

        // Check science packs available in inventory
        let possibleLabProgress = labSpeed;
        for (const sciType of requiredScienceTypes) {
            const avail = newInventory[sciType] || 0;
            if (avail < possibleLabProgress) {
                possibleLabProgress = avail;
            }
        }

        if (possibleLabProgress > 0) {
            for (const sciType of requiredScienceTypes) {
                newInventory[sciType] = Math.max(0, (newInventory[sciType] || 0) - possibleLabProgress);
                flowPerSecond.set(sciType, (flowPerSecond.get(sciType) || 0) - (possibleLabProgress / deltaSeconds));
            }
            researchPointsGained = possibleLabProgress;
        }
    }

    return { 
        newInventory, 
        powerGenerated, 
        powerConsumed, 
        powerEfficiency, 
        flowPerSecond: Object.fromEntries(flowPerSecond),
        researchPointsGained,
        labsActiveCount: totalLabCount
    };
}
