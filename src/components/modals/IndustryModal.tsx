import React, { useState } from 'react';
import { Settings, Zap, Package, Beaker, Plus, Trash2, Cpu, Rocket, CheckCircle2, Lock, Play, Layers, ShieldAlert, AlertTriangle, Activity, Skull, Flame, Radio, Wrench } from 'lucide-react';
import { MACHINES, RECIPES, INDUSTRY_ITEMS, FACTORIO_TECHS, type MachineNode, type TechNode } from '../../engine/industry';
import type { IndustryState } from '../../hooks/useIndustry';
import type { Scp914Mode, ScpAnomaly } from '../../engine/types';
import { INITIAL_SCP_STATE, checkScpUnlockCondition, calculateScpPassiveBuffs } from '../../engine/scpFoundation';

interface IndustryModalProps {
    isOpen: boolean;
    onClose: () => void;
    industryState: IndustryState & {
        metrics: any;
        addNode: (machineId: string, recipeId?: string) => void;
        removeNode: (nodeId: string) => void;
        updateNode: (nodeId: string, updates: Partial<MachineNode>) => void;
        startResearch: (techId: string) => void;
        buildRocketPart: () => void;
        launchRocket: () => boolean;
        setBeltTier: (tier: 'yellow' | 'red' | 'blue') => void;
        setInserterTier: (tier: 'basic' | 'fast' | 'stack') => void;
        toggleScpChamber?: (anomalyId: string) => void;
        assignHeroToScp?: (anomalyId: string, heroId: string | null) => void;
        executeScp914?: (inputItemId: string, mode: Scp914Mode) => any;
        respondToBreach?: (anomalyId: string, method: 'blast_doors' | 'mtf_strike' | 'sedative', partyPower?: number) => { success: boolean; message: string };
        unlockScpSite?: () => void;
    };
    gold: number;
    buyMachine: (cost: number, execute: () => void) => void;
    assignedPet?: any;
    costReduction?: number;
    backroomsFloor?: number;
    backroomsUnlockedTechs?: string[];
    heroes?: any[];
    partyPower?: number;
}

export const IndustryModal: React.FC<IndustryModalProps> = ({ 
    isOpen, 
    onClose, 
    industryState, 
    gold, 
    buyMachine, 
    assignedPet, 
    costReduction = 0, 
    backroomsFloor = 1,
    backroomsUnlockedTechs = [],
    heroes = [],
    partyPower = 1000
}) => {
    const [activeTab, setActiveTab] = useState<'machines' | 'inventory' | 'research' | 'power' | 'rocket' | 'scp_site'>('machines');
    const [itemFilter, setItemFilter] = useState<'all' | 'raw' | 'intermediate' | 'science' | 'advanced'>('all');
    const [launchMessage, setLaunchMessage] = useState<string | null>(null);
    const [scp914Item, setScp914Item] = useState<string>('iron_ingot');
    const [scp914Mode, setScp914Mode] = useState<Scp914Mode>('Fine');
    const [scp914Message, setScp914Message] = useState<string | null>(null);
    const [breachResponseMsg, setBreachResponseMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const { 
        nodes, 
        inventory, 
        metrics, 
        unlockedTechs = [], 
        activeResearch, 
        researchProgress = {}, 
        rocketPartsBuilt = 0, 
        rocketsLaunched = 0, 
        addNode, 
        removeNode, 
        updateNode, 
        startResearch, 
        buildRocketPart, 
        launchRocket,
        toggleScpChamber,
        assignHeroToScp,
        executeScp914,
        respondToBreach,
        unlockScpSite
    } = industryState;

    const scpFoundation = industryState.scpFoundation || INITIAL_SCP_STATE;
    const isScpUnlocked = Boolean(
        scpFoundation.unlocked ||
        checkScpUnlockCondition({ nodes, unlockedTechs }, [], backroomsFloor)
    );
    const scpPassiveBuffs = calculateScpPassiveBuffs(scpFoundation.anomalies);

    const activeTech = activeResearch ? FACTORIO_TECHS.find(t => t.id === activeResearch) : null;
    const activeProgress = activeTech ? (researchProgress[activeTech.id] || 0) : 0;
    const activePercent = activeTech ? Math.min(100, (activeProgress / activeTech.pointsRequired) * 100) : 0;

    const formatRate = (val: number) => {
        if (Math.abs(val) < 0.01) return '0.0/s';
        return `${val > 0 ? '+' : ''}${val.toFixed(1)}/s`;
    };

    const handleLaunch = () => {
        const success = launchRocket();
        if (success) {
            setLaunchMessage('🚀 FOGUETE LANÇADO COM SUCESSO! +1.000 Ciência Espacial Branca obtida!');
            setTimeout(() => setLaunchMessage(null), 6000);
        }
    };

    // Filter recipes based on unlocked techs & backrooms floor / cross-techs
    const isRecipeUnlocked = (recipeId: string) => {
        const recipe = RECIPES.find(r => r.id === recipeId);
        if (recipe && recipe.requiredBackroomsLevel !== undefined) {
            if (recipeId === 'craft_eff_mod_3') return backroomsUnlockedTechs.includes('superconductors_liminal') || backroomsFloor >= 18;
            if (recipeId === 'craft_liminal_beacon') return backroomsUnlockedTechs.includes('liminal_beacons') || backroomsFloor >= 28;
            if (recipeId === 'craft_quantum_inserter' || recipeId === 'craft_space_matter_belt') return backroomsUnlockedTechs.includes('quantum_automation') || backroomsFloor >= 35;
            if (recipeId === 'craft_science_dimensional') return backroomsUnlockedTechs.includes('dimensional_science_pack') || backroomsFloor >= 50;
            if (recipeId === 'gen_antimatter') return backroomsUnlockedTechs.includes('antimatter_reactor') || backroomsFloor >= 72;
            return backroomsFloor >= recipe.requiredBackroomsLevel;
        }
        // Find if a tech unlocks this recipe
        const techThatUnlocks = FACTORIO_TECHS.find(t => t.unlockedRecipes.includes(recipeId));
        if (techThatUnlocks) {
            return unlockedTechs.includes(techThatUnlocks.id);
        }
        return true;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="bg-stone-900 border-2 border-orange-500 w-full max-w-6xl h-[88vh] p-4 rounded-xl flex flex-col shadow-[0_0_50px_rgba(255,165,0,0.3)]">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-orange-800/80 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-950/80 p-2 rounded-lg border border-orange-500/50">
                            <Cpu className="text-orange-400 w-7 h-7 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-orange-400 tracking-wider font-mono flex items-center gap-2">
                                COMPLEXO INDUSTRIAL <span className="text-xs bg-orange-900/80 text-orange-200 px-2 py-0.5 rounded border border-orange-500/40">FACTORIO EXPANSION</span>
                            </h2>
                            <p className="text-xs text-stone-400 font-mono">Automação • Petroquímica • Pesquisa • Foguete Espacial</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {assignedPet && (
                            <div className="bg-black/50 px-3 py-1.5 rounded border border-orange-500/30 flex flex-col items-center min-w-[130px] justify-center">
                                <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider font-mono">Pet Operário</span>
                                <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                                    {assignedPet.emoji} {assignedPet.name}
                                </span>
                                <span className="text-[9px] text-green-400 font-black">
                                    {assignedPet.element === 'fire' 
                                        ? `+${(assignedPet.level * 2)}% Velocidade` 
                                        : 'Sem Bônus (Não é Fogo)'}
                                </span>
                            </div>
                        )}
                        <div className="bg-black/60 px-3 py-1.5 rounded border border-stone-700 flex flex-col items-center min-w-[110px]">
                            <span className="text-[10px] text-stone-400 font-mono uppercase">Geração</span>
                            <span className="text-emerald-400 font-bold font-mono text-sm">{metrics.powerGenerated.toFixed(0)} MW</span>
                        </div>
                        <div className="bg-black/60 px-3 py-1.5 rounded border border-stone-700 flex flex-col items-center min-w-[110px]">
                            <span className="text-[10px] text-stone-400 font-mono uppercase">Consumo</span>
                            <span className="text-red-400 font-bold font-mono text-sm">{metrics.powerConsumed.toFixed(0)} MW</span>
                        </div>
                        <div className="bg-black/60 px-3 py-1.5 rounded border border-stone-700 flex flex-col items-center min-w-[110px]">
                            <span className="text-[10px] text-stone-400 font-mono uppercase">Eficiência</span>
                            <span className={`font-bold font-mono text-sm ${(metrics.powerEfficiency * 100) < 100 ? 'text-amber-400' : 'text-cyan-400'}`}>
                                {(metrics.powerEfficiency * 100).toFixed(1)}%
                            </span>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 px-3.5 py-1.5 rounded-lg font-bold text-sm transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                    <button 
                        onClick={() => setActiveTab('machines')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'machines' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-stone-800/80 text-stone-400 hover:bg-stone-700'}`}
                    >
                        <Settings size={16} /> Fábricas & Montagem
                    </button>
                    <button 
                        onClick={() => setActiveTab('power')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'power' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-stone-800/80 text-stone-400 hover:bg-stone-700'}`}
                    >
                        <Zap size={16} /> Energia & Matriz
                    </button>
                    <button 
                        onClick={() => setActiveTab('research')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all relative ${activeTab === 'research' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-stone-800/80 text-stone-400 hover:bg-stone-700'}`}
                    >
                        <Beaker size={16} /> Pesquisa & Tecnologias
                        {activeTech && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('inventory')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'inventory' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-stone-800/80 text-stone-400 hover:bg-stone-700'}`}
                    >
                        <Package size={16} /> Estoque & Métricas
                    </button>
                    <button 
                        onClick={() => setActiveTab('rocket')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${activeTab === 'rocket' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-stone-800/80 text-stone-400 hover:bg-stone-700'}`}
                    >
                        <Rocket size={16} /> Silo de Foguete
                        {rocketPartsBuilt >= 100 && (
                            <span className="bg-purple-400 text-black text-[9px] font-black px-1.5 rounded-full">PRONTO</span>
                        )}
                    </button>
                    <button 
                        data-testid="industry-scp-tab-btn"
                        onClick={() => {
                            if (isScpUnlocked) {
                                setActiveTab('scp_site');
                                if (!scpFoundation.unlocked) {
                                    unlockScpSite?.();
                                }
                            }
                        }} 
                        disabled={!isScpUnlocked}
                        title={isScpUnlocked ? "Acessar Instalação Subterrânea de Contenção SCP" : "Requer Automação I ou ao menos 1 Máquina Operacional"}
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all relative ${
                            !isScpUnlocked
                                ? 'bg-stone-900/60 text-stone-600 border border-stone-800 cursor-not-allowed opacity-60'
                                : activeTab === 'scp_site'
                                    ? 'bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500'
                                    : 'bg-stone-800/80 text-red-300 border border-red-950 hover:bg-red-950/40 hover:text-red-200'
                        }`}
                    >
                        <ShieldAlert size={16} className={isScpUnlocked ? 'text-red-400' : 'text-stone-600'} />
                        <span>Subsolo: Sítio-19</span>
                        {!isScpUnlocked && <Lock size={12} className="text-stone-500" />}
                        {isScpUnlocked && scpFoundation.activeBreach && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-black/60 p-4 rounded-xl border border-stone-800 custom-scrollbar">

                    {/* ── TAB 1: FÁBRICAS & MONTAGEM ──────────────────────────────── */}
                    {activeTab === 'machines' && (
                        <div className="space-y-5">
                            {costReduction > 0 && (
                                <div className="bg-orange-500/20 border border-orange-500/50 text-orange-300 px-4 py-2 rounded-lg flex items-center justify-between text-xs font-mono">
                                    <span>⚙️ Bônus do Museu Ativo: -{(costReduction * 100).toFixed(0)}% de custo de insumos para armas de cerco!</span>
                                </div>
                            )}

                            {/* Machines Purchase Bar */}
                            <div className="space-y-1.5">
                                <div className="text-xs font-bold text-stone-400 font-mono uppercase tracking-wider">Comprar Novas Instalações:</div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {MACHINES.filter(m => m.type !== 'generator' && m.type !== 'silo').map(machine => (
                                        <button
                                            key={machine.id}
                                            onClick={() => buyMachine(machine.cost.gold, () => addNode(machine.id))}
                                            className="bg-stone-800/90 border border-orange-900/50 p-2 rounded-lg min-w-[130px] flex flex-col items-center hover:bg-stone-700 hover:border-orange-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                                            disabled={gold < machine.cost.gold}
                                        >
                                            <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{machine.emoji}</div>
                                            <div className="text-[11px] font-bold text-stone-200 text-center leading-tight">{machine.name}</div>
                                            <div className="text-[10px] text-amber-400 font-mono mt-1 font-bold">{machine.cost.gold.toLocaleString()}g</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Nodes Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {nodes.filter(n => {
                                    const m = MACHINES.find(mc => mc.id === n.machineId);
                                    return m && m.type !== 'generator' && m.type !== 'silo';
                                }).map(node => {
                                    const machine = MACHINES.find(m => m.id === node.machineId);
                                    const currentRecipe = RECIPES.find(r => r.id === node.recipeId);
                                    const compatibleRecipes = RECIPES.filter(r => 
                                        r.machineType === machine?.type &&
                                        isRecipeUnlocked(r.id) &&
                                        (r.requiredBackroomsLevel === undefined || (backroomsFloor !== undefined && (backroomsFloor - 1) >= r.requiredBackroomsLevel))
                                    );

                                    if (!machine) return null;

                                    return (
                                        <div key={node.id} className="bg-stone-900/90 border border-stone-700 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{machine.emoji}</span>
                                                        <div>
                                                            <div className="font-bold text-sm text-orange-400">{machine.name}</div>
                                                            <div className="text-[10px] text-stone-400 font-mono">Linhas Ativas: <span className="text-white font-bold">{node.count}</span></div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeNode(node.id)} className="text-red-400 hover:text-red-300 p-1 transition-colors">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                <div className="bg-black/60 p-2 rounded-lg border border-stone-800">
                                                    <div className="text-[10px] text-stone-500 mb-1 font-mono uppercase">Receita de Produção:</div>
                                                    <select
                                                        value={node.recipeId}
                                                        onChange={(e) => updateNode(node.id, { recipeId: e.target.value })}
                                                        className="w-full bg-stone-950 text-xs text-stone-200 border border-stone-700 rounded p-1 mb-2 font-mono focus:border-orange-500 outline-none"
                                                    >
                                                        <option value="">-- Parado --</option>
                                                        {compatibleRecipes.map(r => (
                                                            <option key={r.id} value={r.id}>{r.name} ({r.time}s)</option>
                                                        ))}
                                                    </select>

                                                    {currentRecipe && (
                                                        <div className="text-[10px] space-y-1 font-mono">
                                                            {currentRecipe.powerDraw > 0 ? (
                                                                <div className="text-red-400 font-bold">Gasto Elétrico: {currentRecipe.powerDraw * node.count} MW</div>
                                                            ) : (
                                                                <div className="text-emerald-400 font-bold">Gasto Elétrico: 0 MW (Autônomo)</div>
                                                            )}
                                                            {Object.keys(currentRecipe.inputs).length > 0 && (
                                                                <div className="text-stone-400 truncate">
                                                                    In: {Object.entries(currentRecipe.inputs).map(([id, am]) => {
                                                                        const item = INDUSTRY_ITEMS.find(i => i.id === id);
                                                                        return `${am * node.count} ${item?.emoji || id}`;
                                                                    }).join(', ')}
                                                                </div>
                                                            )}
                                                            <div className="text-green-400 font-bold truncate">
                                                                Out: {Object.entries(currentRecipe.outputs).map(([id, am]) => {
                                                                    const item = INDUSTRY_ITEMS.find(i => i.id === id);
                                                                    return `${am * node.count} ${item?.emoji || id}`;
                                                                }).join(', ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <button
                                                    onClick={() => buyMachine(machine.cost.gold, () => updateNode(node.id, { count: node.count + 1 }))}
                                                    disabled={gold < machine.cost.gold}
                                                    className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 font-mono font-bold transition-colors disabled:opacity-40"
                                                >
                                                    <Plus size={13} /> Expandir Linha (+1 Linha por {machine.cost.gold.toLocaleString()}g)
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: ENERGIA & MATRIZ ─────────────────────────────────── */}
                    {activeTab === 'power' && (
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <div className="text-xs font-bold text-stone-400 font-mono uppercase tracking-wider">Adicionar Gerador à Matriz:</div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {MACHINES.filter(m => m.type === 'generator').map(machine => (
                                        <button
                                            key={machine.id}
                                            onClick={() => buyMachine(machine.cost.gold, () => {
                                                const genRecipe = RECIPES.find(r => r.machineType === 'generator' && (
                                                    (machine.id === 'steam_engine' && r.id === 'gen_steam') ||
                                                    (machine.id === 'solar_panel' && r.id === 'gen_solar') ||
                                                    (machine.id === 'nuclear_reactor' && r.id === 'gen_nuclear')
                                                ));
                                                addNode(machine.id, genRecipe?.id);
                                            })}
                                            className="bg-stone-800/90 border border-emerald-900/50 p-2.5 rounded-lg min-w-[150px] flex flex-col items-center hover:bg-stone-700 hover:border-emerald-500 transition-all disabled:opacity-40"
                                            disabled={gold < machine.cost.gold}
                                        >
                                            <div className="text-2xl mb-1">{machine.emoji}</div>
                                            <div className="text-xs font-bold text-emerald-300 text-center">{machine.name}</div>
                                            <div className="text-[10px] text-amber-400 font-mono mt-1 font-bold">{machine.cost.gold.toLocaleString()}g</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {nodes.filter(n => {
                                    const m = MACHINES.find(mc => mc.id === n.machineId);
                                    return m && m.type === 'generator';
                                }).map(node => {
                                    const machine = MACHINES.find(m => m.id === node.machineId);
                                    const currentRecipe = RECIPES.find(r => r.id === node.recipeId);
                                    if (!machine) return null;

                                    return (
                                        <div key={node.id} className="bg-emerald-950/20 border border-emerald-800/60 rounded-xl p-3.5 flex flex-col justify-between shadow-lg">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{machine.emoji}</span>
                                                        <div>
                                                            <div className="font-bold text-sm text-emerald-400">{machine.name}</div>
                                                            <div className="text-[10px] text-stone-400 font-mono">Unidades: <span className="text-white font-bold">{node.count}</span></div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeNode(node.id)} className="text-red-400 hover:text-red-300 p-1">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                {currentRecipe && (
                                                    <div className="bg-black/50 p-2.5 rounded-lg border border-emerald-900/60 text-[10px] font-mono space-y-1 mb-2">
                                                        <div className="text-emerald-400 font-bold">Geração: +{Math.abs(currentRecipe.powerDraw) * node.count} MW</div>
                                                        {Object.keys(currentRecipe.inputs).length > 0 ? (
                                                            <div className="text-stone-400 truncate">
                                                                Consumo: {Object.entries(currentRecipe.inputs).map(([id, am]) => {
                                                                    const rate = ((am / currentRecipe.time) * node.count).toFixed(2);
                                                                    const item = INDUSTRY_ITEMS.find(i => i.id === id);
                                                                    return `${rate}/s ${item?.emoji || id}`;
                                                                }).join(', ')}
                                                            </div>
                                                        ) : (
                                                            <div className="text-cyan-400">Combustível: 100% Limpo (Sem Consumo)</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => buyMachine(machine.cost.gold, () => updateNode(node.id, { count: node.count + 1 }))}
                                                disabled={gold < machine.cost.gold}
                                                className="w-full bg-emerald-900/40 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-300 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 font-mono font-bold transition-colors disabled:opacity-40"
                                            >
                                                <Plus size={13} /> Adicionar Unidade ({machine.cost.gold.toLocaleString()}g)
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── TAB 3: PESQUISA & ÁRVORE TECNOLÓGICA ─────────────────────── */}
                    {activeTab === 'research' && (
                        <div className="space-y-6">
                            {/* Active Research Progress */}
                            <div className="bg-cyan-950/30 border border-cyan-700/60 rounded-xl p-4 shadow-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <Beaker className="text-cyan-400 w-5 h-5 animate-pulse" />
                                        <span className="font-bold text-sm text-cyan-300 font-mono">
                                            {activeTech ? `PESQUISA ATIVA: ${activeTech.name}` : 'NENHUMA PESQUISA SELECIONADA'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono text-stone-400">
                                        {metrics.labsActiveCount > 0 ? (
                                            <span className="text-emerald-400 font-bold">🔬 {metrics.labsActiveCount} Laboratório(s) em Operação</span>
                                        ) : (
                                            <span className="text-amber-400 font-bold">⚠️ Construa Laboratórios para pesquisar!</span>
                                        )}
                                    </div>
                                </div>

                                {activeTech && (
                                    <div className="space-y-2">
                                        <div className="w-full bg-black/60 rounded-full h-3.5 border border-cyan-800 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                                                style={{ width: `${activePercent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs font-mono text-stone-400">
                                            <span>{activeProgress.toFixed(1)} / {activeTech.pointsRequired} Pontos ({activePercent.toFixed(1)}%)</span>
                                            <span>Consumo por ciclo: {Object.entries(activeTech.cost).map(([sci, am]) => {
                                                const item = INDUSTRY_ITEMS.find(i => i.id === sci);
                                                return `${am} ${item?.emoji || sci}`;
                                            }).join(' + ')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tech Tree Grid */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-stone-400 font-mono uppercase tracking-wider">Árvore Tecnológica de Factorio:</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {FACTORIO_TECHS.map(tech => {
                                        const isUnlocked = unlockedTechs.includes(tech.id);
                                        const isCurrent = activeResearch === tech.id;
                                        const hasPrereqs = tech.prerequisites.every(p => unlockedTechs.includes(p));
                                        const progress = researchProgress[tech.id] || 0;
                                        const percent = Math.min(100, (progress / tech.pointsRequired) * 100);

                                        return (
                                            <div 
                                                key={tech.id} 
                                                className={`rounded-xl p-3.5 border flex flex-col justify-between transition-all ${
                                                    isUnlocked 
                                                        ? 'bg-emerald-950/20 border-emerald-600/50' 
                                                        : isCurrent 
                                                        ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                                                        : hasPrereqs 
                                                        ? 'bg-stone-900/90 border-stone-700' 
                                                        : 'bg-stone-950/60 border-stone-800 opacity-60'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{tech.emoji}</span>
                                                            <div>
                                                                <div className="font-bold text-sm text-stone-200">{tech.name}</div>
                                                                <div className="text-[10px] text-stone-500 font-mono">Tier {tech.tier}</div>
                                                            </div>
                                                        </div>
                                                        {isUnlocked ? (
                                                            <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono font-bold">
                                                                <CheckCircle2 size={14} /> Desbloqueado
                                                            </span>
                                                        ) : isCurrent ? (
                                                            <span className="text-cyan-400 text-xs flex items-center gap-1 font-mono font-bold animate-pulse">
                                                                <Play size={12} /> Pesquisando
                                                            </span>
                                                        ) : !hasPrereqs ? (
                                                            <span className="text-stone-500 text-xs flex items-center gap-1 font-mono">
                                                                <Lock size={12} /> Bloqueado
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <p className="text-xs text-stone-400 mb-2 leading-relaxed">{tech.description}</p>
                                                    
                                                    {tech.bonusDescription && (
                                                        <div className="text-[10px] text-orange-400 font-mono font-bold mb-2">
                                                            ★ {tech.bonusDescription}
                                                        </div>
                                                    )}

                                                    <div className="bg-black/50 p-2 rounded-lg border border-stone-800 text-[10px] font-mono text-stone-400 space-y-1 mb-3">
                                                        <div>Custo: {Object.entries(tech.cost).map(([sci, am]) => {
                                                            const item = INDUSTRY_ITEMS.find(i => i.id === sci);
                                                            return `${am} ${item?.name || sci}`;
                                                        }).join(' + ')}</div>
                                                        {!isUnlocked && progress > 0 && (
                                                            <div className="text-cyan-400">Progresso: {progress.toFixed(0)}/{tech.pointsRequired} ({percent.toFixed(0)}%)</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {!isUnlocked && hasPrereqs && !isCurrent && (
                                                    <button
                                                        onClick={() => startResearch(tech.id)}
                                                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 font-mono transition-colors shadow-sm"
                                                    >
                                                        <Play size={12} /> Iniciar Pesquisa
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 4: ESTOQUE & MÉTRICAS (PAINEL P) ────────────────────── */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-4">
                            {/* Filter Bar */}
                            <div className="flex gap-2">
                                {([
                                    { id: 'all', label: 'Todos os Itens' },
                                    { id: 'raw', label: 'Minérios & Brutos' },
                                    { id: 'intermediate', label: 'Intermediários' },
                                    { id: 'science', label: 'Pacotes de Ciência' },
                                    { id: 'advanced', label: 'Avançados & Módulos' }
                                ] as const).map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setItemFilter(f.id)}
                                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                                            itemFilter === f.id ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Inventory Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {INDUSTRY_ITEMS.filter(item => {
                                    if (itemFilter === 'all') return true;
                                    if (itemFilter === 'raw') return item.category === 'raw';
                                    if (itemFilter === 'intermediate') return item.category === 'intermediate';
                                    if (itemFilter === 'science') return item.category === 'science';
                                    if (itemFilter === 'advanced') return item.category === 'advanced' || item.category === 'module' || item.category === 'endgame';
                                    return true;
                                }).map(item => {
                                    const amount = inventory[item.id] || 0;
                                    const rate = metrics.flowPerSecond[item.id] || 0;

                                    return (
                                        <div key={item.id} className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 flex flex-col items-center justify-between shadow-md">
                                            <div className="text-3xl mb-1">{item.emoji}</div>
                                            <div className="font-bold text-stone-200 text-xs text-center line-clamp-1">{item.name}</div>
                                            <div className="text-orange-400 font-mono text-base font-bold my-1">{Math.floor(amount).toLocaleString()}</div>
                                            <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                                rate > 0 ? 'bg-emerald-950 text-emerald-400' : rate < 0 ? 'bg-red-950 text-red-400' : 'text-stone-500'
                                            }`}>
                                                {formatRate(rate)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── TAB 5: SILO DE FOGUETE ──────────────────────────────────── */}
                    {activeTab === 'rocket' && (
                        <div className="max-w-3xl mx-auto space-y-6 py-4">
                            {launchMessage && (
                                <div className="bg-purple-950/80 border border-purple-500 text-purple-200 px-4 py-3 rounded-xl text-center font-mono font-bold text-sm animate-bounce">
                                    {launchMessage}
                                </div>
                            )}

                            <div className="bg-stone-900 border border-purple-700/60 rounded-2xl p-6 shadow-[0_0_40px_rgba(147,51,234,0.2)] flex flex-col items-center text-center">
                                <div className="bg-purple-950 p-4 rounded-full border border-purple-500/50 mb-3">
                                    <Rocket className="text-purple-400 w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black text-purple-300 font-mono">SILO DE LANÇAMENTO ORBITAL</h3>
                                <p className="text-xs text-stone-400 max-w-md mt-1">
                                    Construa as 100 Peças de Foguete, insira o Satélite de Telecomunicações e envie cargas espaciais para obter Ciência Branca e multiplicadores globais permanentes!
                                </p>

                                <div className="w-full mt-6 bg-black/60 p-4 rounded-xl border border-stone-800 space-y-3">
                                    <div className="flex justify-between text-xs font-mono font-bold">
                                        <span className="text-stone-300">Estrutura do Foguete:</span>
                                        <span className="text-purple-400">{rocketPartsBuilt} / 100 Peças ({rocketPartsBuilt}%)</span>
                                    </div>
                                    <div className="w-full bg-stone-950 rounded-full h-4 border border-purple-900 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 h-full transition-all duration-300"
                                            style={{ width: `${rocketPartsBuilt}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-stone-800 text-stone-400">
                                        <span>Satélites em Estoque: <strong className="text-white">{(inventory['satellite'] || 0)}</strong></span>
                                        <span>Total de Foguetes Lançados: <strong className="text-purple-300">{rocketsLaunched}</strong></span>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full mt-5">
                                    <button
                                        onClick={buildRocketPart}
                                        disabled={
                                            rocketPartsBuilt >= 100 || 
                                            (inventory['low_density_structure'] || 0) < 1 || 
                                            (inventory['rocket_fuel'] || 0) < 1 || 
                                            (inventory['rocket_control_unit'] || 0) < 1
                                        }
                                        className="flex-1 bg-stone-800 hover:bg-stone-700 border border-purple-700/50 text-purple-300 text-xs py-3 rounded-xl font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        +1 Peça de Foguete (1 Estrutura + 1 Combustível + 1 Controle)
                                    </button>

                                    <button
                                        onClick={handleLaunch}
                                        disabled={rocketPartsBuilt < 100 || (inventory['satellite'] || 0) < 1}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs py-3 rounded-xl font-mono font-black transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Rocket size={16} /> LANÇAR FOGUETE COM SATÉLITE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 6: SUBSOLO SÍTIO-19 (CONTENÇÃO SCP) ────────────────── */}
                    {activeTab === 'scp_site' && (
                        <div className="space-y-6">
                            {/* Header do Sítio-19 */}
                            <div className="bg-gradient-to-r from-red-950/80 via-stone-900 to-black p-4 rounded-xl border border-red-900/60 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-500/60 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                                        🛡️
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-red-400 font-mono tracking-wider uppercase">
                                                SÍTIO-19 • INSTALAÇÃO SUBTERRÂNEA SCP
                                            </h3>
                                            <span className="text-[10px] bg-red-900/60 text-red-200 border border-red-700/50 px-2 py-0.5 rounded font-mono font-bold">
                                                NÍVEL -4 FACTORIO
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-400 font-mono">
                                            Contenção de Anomalias • Estação de Transmutação SCP-914 • Comandantes MTF
                                        </p>
                                    </div>
                                </div>

                                {/* Status em tempo real do Sítio */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-red-900/50 text-center">
                                        <div className="text-[9px] text-stone-400 font-mono uppercase">Câmaras Ativas</div>
                                        <div className="text-sm font-bold font-mono text-red-300">
                                            {scpFoundation.anomalies.filter(a => a.active).length} / {scpFoundation.anomalies.length}
                                        </div>
                                    </div>
                                    <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-red-900/50 text-center">
                                        <div className="text-[9px] text-stone-400 font-mono uppercase">Dreno da Rede</div>
                                        <div className="text-sm font-bold font-mono text-amber-400">
                                            {scpFoundation.anomalies.filter(a => a.active).reduce((sum, a) => sum + a.powerRequired, 0)} MW
                                        </div>
                                    </div>
                                    <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-red-900/50 text-center">
                                        <div className="text-[9px] text-stone-400 font-mono uppercase">Status de Alerta</div>
                                        <div className={`text-sm font-bold font-mono ${scpFoundation.activeBreach ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                                            {scpFoundation.activeBreach ? '🚨 BRECHA ATIVA' : '🔒 CONTIDO'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bônus Passivos Globais Ativos */}
                            <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-lg flex items-center justify-between gap-2 text-xs font-mono text-stone-300 flex-wrap">
                                <span className="font-bold text-stone-400 uppercase flex items-center gap-1.5">
                                    <Activity size={14} className="text-red-400" /> Bônus Globais do Sítio:
                                </span>
                                <div className="flex gap-4 flex-wrap">
                                    <span className={scpPassiveBuffs.attackSpeedBonus > 0 ? 'text-emerald-400' : 'text-stone-500'}>
                                        ⚡ +{(scpPassiveBuffs.attackSpeedBonus * 100).toFixed(0)}% Velocidade (SCP-999)
                                    </span>
                                    <span className={scpPassiveBuffs.defenseBonus > 0 ? 'text-cyan-400' : 'text-stone-500'}>
                                        🛡️ +{(scpPassiveBuffs.defenseBonus * 100).toFixed(0)}% Defesa (SCP-173)
                                    </span>
                                    <span className={scpPassiveBuffs.lifestealBonus > 0 ? 'text-purple-400' : 'text-stone-500'}>
                                        🩸 +{(scpPassiveBuffs.lifestealBonus * 100).toFixed(0)}% Roubo de Vida (SCP-049)
                                    </span>
                                    <span className={scpPassiveBuffs.siegeDamageBonus > 0 ? 'text-red-400' : 'text-stone-500'}>
                                        💥 +{(scpPassiveBuffs.siegeDamageBonus * 100).toFixed(0)}% Cerco (SCP-682)
                                    </span>
                                </div>
                            </div>

                            {/* Banner de Brecha de Contenção (Se Ativa) */}
                            {scpFoundation.activeBreach && (
                                <div className="bg-red-950/90 border-2 border-red-500 p-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={24} className="text-red-400 animate-bounce" />
                                            <div>
                                                <h4 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                                                    ALARME CÓDIGO VERMELHO: BRECHA DE CONTENÇÃO ATIVA!
                                                </h4>
                                                <p className="text-xs text-red-300 font-mono">
                                                    {scpFoundation.activeBreach.penaltyDescription}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-black/80 px-3 py-1.5 rounded-lg border border-red-500 font-mono text-center">
                                            <div className="text-[9px] text-stone-400 uppercase">Tempo Restante</div>
                                            <div className="text-lg font-black text-red-400">
                                                {Math.ceil(scpFoundation.activeBreach.timer)}s
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botões Táticos de Intervenção */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                                        <button
                                            data-testid="breach-blast-doors-btn"
                                            onClick={() => {
                                                const res = respondToBreach?.(scpFoundation.activeBreach!.anomalyId, 'blast_doors', partyPower);
                                                if (res) setBreachResponseMsg(res.message);
                                            }}
                                            className="bg-stone-900 hover:bg-stone-800 border border-red-700/80 p-2.5 rounded-lg flex flex-col items-center text-center transition-all group"
                                        >
                                            <span className="text-sm">🛡️ Comportas Pneumáticas</span>
                                            <span className="text-[10px] text-stone-400 font-mono mt-0.5">Custo: 15 Placas de Aço</span>
                                        </button>

                                        <button
                                            data-testid="breach-mtf-strike-btn"
                                            onClick={() => {
                                                const res = respondToBreach?.(scpFoundation.activeBreach!.anomalyId, 'mtf_strike', partyPower);
                                                if (res) setBreachResponseMsg(res.message);
                                            }}
                                            className="bg-stone-900 hover:bg-stone-800 border border-red-700/80 p-2.5 rounded-lg flex flex-col items-center text-center transition-all group"
                                        >
                                            <span className="text-sm">🪖 Força-Tarefa MTF</span>
                                            <span className="text-[10px] text-stone-400 font-mono mt-0.5">Requer: Poder {partyPower}/800</span>
                                        </button>

                                        <button
                                            data-testid="breach-sedative-btn"
                                            onClick={() => {
                                                const res = respondToBreach?.(scpFoundation.activeBreach!.anomalyId, 'sedative', partyPower);
                                                if (res) setBreachResponseMsg(res.message);
                                            }}
                                            className="bg-stone-900 hover:bg-stone-800 border border-red-700/80 p-2.5 rounded-lg flex flex-col items-center text-center transition-all group"
                                        >
                                            <span className="text-sm">🧪 Sedativo Químico</span>
                                            <span className="text-[10px] text-stone-400 font-mono mt-0.5">Custo: 5 Ácido Sulfúrico</span>
                                        </button>
                                    </div>

                                    {breachResponseMsg && (
                                        <div className="text-xs font-mono text-center p-2 rounded bg-black/60 border border-red-800/80 text-white">
                                            {breachResponseMsg}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Câmaras de Contenção Especial */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-stone-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                                        <Radio size={14} className="text-red-400" /> Câmaras de Contenção de Anomalias:
                                    </h4>
                                    <span className="text-[10px] font-mono text-stone-500">
                                        Mantenha a rede elétrica estável para evitar perdas de contenção.
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {scpFoundation.anomalies.map(anomaly => {
                                        const classColor = 
                                            anomaly.classification === 'Safe' 
                                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' 
                                                : anomaly.classification === 'Euclid' 
                                                    ? 'bg-amber-950 text-amber-300 border-amber-500/50' 
                                                    : 'bg-red-950 text-red-300 border-red-500/50';

                                        const stabilityColor = 
                                            anomaly.stability > 60 
                                                ? 'from-emerald-500 to-green-400' 
                                                : anomaly.stability > 30 
                                                    ? 'from-amber-500 to-yellow-400' 
                                                    : 'from-red-600 to-red-400';

                                        return (
                                            <div
                                                key={anomaly.id}
                                                className={`bg-stone-900/90 border rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                                                    anomaly.breached 
                                                        ? 'border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-900/30 animate-pulse' 
                                                        : anomaly.active 
                                                            ? 'border-stone-700 shadow-md' 
                                                            : 'border-stone-800 opacity-65'
                                                }`}
                                            >
                                                <div className="space-y-2">
                                                    {/* Top Bar com Classificação */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{anomaly.icon}</span>
                                                            <div>
                                                                <div className="text-xs font-black font-mono text-white flex items-center gap-1.5">
                                                                    <span>{anomaly.itemNumber}</span>
                                                                    <span className="text-[10px] text-stone-400 truncate max-w-[120px] font-normal">{anomaly.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${classColor}`}>
                                                            {anomaly.classification}
                                                        </span>
                                                    </div>

                                                    {/* Descrição & Efeito */}
                                                    <p className="text-[10px] text-stone-400 leading-tight">
                                                        {anomaly.description}
                                                    </p>

                                                    {/* Barra de Estabilidade */}
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex justify-between text-[9px] font-mono">
                                                            <span className="text-stone-400">Estabilidade da Câmara:</span>
                                                            <span className={anomaly.stability < 30 ? 'text-red-400 font-bold' : 'text-stone-300'}>
                                                                {anomaly.stability.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-stone-950 rounded-full h-1.5 overflow-hidden border border-stone-800">
                                                            <div
                                                                className={`h-full bg-gradient-to-r ${stabilityColor} transition-all duration-300`}
                                                                style={{ width: `${Math.max(0, Math.min(100, anomaly.stability))}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Requisitos & Produção */}
                                                    <div className="bg-black/50 p-2 rounded-lg border border-stone-800/80 space-y-1 text-[10px] font-mono">
                                                        <div className="flex justify-between text-stone-400">
                                                            <span>Consumo de Energia:</span>
                                                            <span className="text-amber-400 font-bold">{anomaly.powerRequired} MW</span>
                                                        </div>
                                                        <div className="flex justify-between text-stone-400">
                                                            <span>Subproduto:</span>
                                                            <span className="text-emerald-300 font-bold">
                                                                {anomaly.outputItemIcon} {anomaly.outputItemName} (+{anomaly.outputRate})
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-stone-400 pt-0.5 border-t border-stone-850">
                                                            <span>No Estoque:</span>
                                                            <span className="text-white font-bold">{inventory[anomaly.outputItemId] || 0}</span>
                                                        </div>
                                                    </div>

                                                    {/* Oficial MTF Designado */}
                                                    <div className="pt-1">
                                                        <label className="text-[9px] text-stone-400 font-mono uppercase block mb-1">
                                                            Oficial MTF Designado:
                                                        </label>
                                                        <select
                                                            value={anomaly.assignedHeroId || ''}
                                                            onChange={(e) => assignHeroToScp?.(anomaly.id, e.target.value || null)}
                                                            className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded p-1.5 font-mono focus:outline-none focus:border-red-500"
                                                        >
                                                            <option value="">Nenhum Oficial Designado</option>
                                                            {heroes.map(hero => (
                                                                <option key={hero.id} value={hero.id}>
                                                                    {hero.name} ({hero.class || 'Herói'})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Botão Ligar/Desligar */}
                                                <button
                                                    onClick={() => toggleScpChamber?.(anomaly.id)}
                                                    className={`mt-3 w-full py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                                                        anomaly.active
                                                            ? 'bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200'
                                                            : 'bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300'
                                                    }`}
                                                >
                                                    {anomaly.active ? 'DESLIGAR CÂMARA' : 'ATIVAR CONTENÇÃO'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── SEÇÃO 2: ESTAÇÃO SCP-914 (THE CLOCKWORKS) ── */}
                            <div className="bg-stone-900/90 border-2 border-amber-800/70 p-4 rounded-xl space-y-4 shadow-lg shadow-amber-950/20">
                                <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-600/50 flex items-center justify-center text-xl">
                                            ⚙️
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-amber-400 font-mono tracking-wider uppercase">
                                                SCP-914 • "O MECANISMO DE TRANSMUTAÇÃO"
                                            </h4>
                                            <p className="text-xs text-stone-400 font-mono">
                                                Insira um item industrial no compartimento de entrada e regule o mostrador mecânico.
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-3 py-1 rounded border border-amber-700/50">
                                        CLASSIFICAÇÃO: SAFE
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Entrada & Mostrador */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-mono text-stone-300 block mb-1 font-bold">
                                                1. Compartimento de Entrada (Item a Inserir):
                                            </label>
                                            <select
                                                data-testid="scp914-item-select"
                                                value={scp914Item}
                                                onChange={(e) => setScp914Item(e.target.value)}
                                                className="w-full bg-stone-950 border border-stone-700 text-stone-200 text-xs rounded-lg p-2 font-mono focus:outline-none focus:border-amber-500"
                                            >
                                                {Object.keys(inventory).filter(k => (inventory[k] || 0) > 0 && k !== 'gold').map(k => (
                                                    <option key={k} value={k}>
                                                        {k} (Disponível: {inventory[k]})
                                                    </option>
                                                ))}
                                                {Object.keys(inventory).filter(k => (inventory[k] || 0) > 0 && k !== 'gold').length === 0 && (
                                                    <option value="">Nenhum item industrial no estoque</option>
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-mono text-stone-300 block mb-1 font-bold">
                                                2. Regulagem da Chave (Mostrador dos 5 Modos):
                                            </label>
                                            <div className="grid grid-cols-5 gap-1.5">
                                                {(['Rough', 'Coarse', '1:1', 'Fine', 'Very Fine'] as Scp914Mode[]).map(mode => (
                                                    <button
                                                        key={mode}
                                                        data-testid={`scp914-mode-${mode.toLowerCase().replace(' ', '-')}`}
                                                        onClick={() => setScp914Mode(mode)}
                                                        className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all border text-center ${
                                                            scp914Mode === mode
                                                                ? 'bg-amber-600 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                                                                : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white hover:bg-stone-800'
                                                        }`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Botão Girar a Chave */}
                                        <button
                                            data-testid="scp914-transmute-btn"
                                            onClick={() => {
                                                if (!scp914Item) return;
                                                const res = executeScp914?.(scp914Item, scp914Mode);
                                                if (res) {
                                                    setScp914Message(res.message);
                                                }
                                            }}
                                            disabled={!scp914Item || (inventory[scp914Item] || 0) < 1}
                                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-mono font-black py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Wrench size={16} /> GIRAR A CHAVE DO SCP-914
                                        </button>
                                    </div>

                                    {/* Saída & Histórico */}
                                    <div className="bg-black/60 p-3 rounded-lg border border-stone-800 flex flex-col justify-between space-y-2 font-mono">
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                            Resultado da Câmara de Saída:
                                        </div>

                                        <div className="flex-1 flex items-center justify-center p-3 text-center rounded bg-stone-950 border border-stone-850">
                                            {scp914Message ? (
                                                <div className="text-xs text-amber-200">
                                                    {scp914Message}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-stone-600">
                                                    Aguardando acionamento da engrenagem central...
                                                </div>
                                            )}
                                        </div>

                                        {/* Histórico recente */}
                                        <div className="pt-2 border-t border-stone-850">
                                            <div className="text-[9px] text-stone-500 uppercase mb-1">Últimos Registros:</div>
                                            <div className="space-y-1 max-h-20 overflow-y-auto">
                                                {(scpFoundation.transmuterHistory || []).slice(0, 3).map((hist, idx) => (
                                                    <div key={idx} className="text-[9px] text-stone-400 flex justify-between">
                                                        <span>{hist.inputItem} ➔ {hist.outputItem}</span>
                                                        <span className="text-amber-400 font-bold">[{hist.mode}]</span>
                                                    </div>
                                                ))}
                                                {(scpFoundation.transmuterHistory || []).length === 0 && (
                                                    <div className="text-[9px] text-stone-600">Nenhuma transmutação no registro.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
