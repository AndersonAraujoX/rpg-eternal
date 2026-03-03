import React, { useState } from 'react';
import { Settings, Zap, Package, Beaker, Plus, Trash2, Cpu } from 'lucide-react';
import { MACHINES, RECIPES, INDUSTRY_ITEMS, type MachineNode } from '../../engine/industry';
import type { IndustryState } from '../../hooks/useIndustry';

interface IndustryModalProps {
    isOpen: boolean;
    onClose: () => void;
    industryState: IndustryState & {
        metrics: any;
        addNode: (machineId: string, recipeId?: string) => void;
        removeNode: (nodeId: string) => void;
        updateNode: (nodeId: string, updates: Partial<MachineNode>) => void;
    };
    gold: number;
    buyMachine: (cost: number, execute: () => void) => void;
}

export const IndustryModal: React.FC<IndustryModalProps> = ({ isOpen, onClose, industryState, gold, buyMachine }) => {
    const [activeTab, setActiveTab] = useState<'machines' | 'inventory' | 'research' | 'power'>('machines');

    if (!isOpen) return null;

    const { nodes, inventory, metrics, addNode, removeNode, updateNode } = industryState;

    const formatRate = (val: number) => {
        if (Math.abs(val) < 0.01) return '0.0/s';
        return `${val > 0 ? '+' : ''}${val.toFixed(1)}/s`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="bg-stone-900 border-2 border-orange-500 w-full max-w-6xl h-[85vh] p-4 rounded-xl flex flex-col shadow-[0_0_50px_rgba(255,165,0,0.3)]">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-orange-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Cpu className="text-orange-500 w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold text-orange-400">COMPLEXO INDUSTRIAL</h2>
                            <p className="text-xs text-stone-400">Automação • Produção • Evolução</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/50 p-2 rounded border border-stone-700 flex flex-col items-center min-w-[120px]">
                            <span className="text-xs text-stone-400">Energia Gerada</span>
                            <span className="text-green-400 font-bold">{metrics.powerGenerated.toFixed(0)} MW</span>
                        </div>
                        <div className="bg-black/50 p-2 rounded border border-stone-700 flex flex-col items-center min-w-[120px]">
                            <span className="text-xs text-stone-400">Consumo</span>
                            <span className="text-red-400 font-bold">{metrics.powerConsumed.toFixed(0)} MW</span>
                        </div>
                        <div className="bg-black/50 p-2 rounded border border-stone-700 flex flex-col items-center min-w-[120px]">
                            <span className="text-xs text-stone-400">Eficiência</span>
                            <span className={`font-bold ${(metrics.powerEfficiency * 100) < 100 ? 'text-orange-500' : 'text-blue-400'}`}>
                                {(metrics.powerEfficiency * 100).toFixed(1)}%
                            </span>
                        </div>
                        <button onClick={onClose} className="btn-retro bg-stone-800 hover:bg-stone-700 text-stone-300 px-4">X</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setActiveTab('machines')} className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeTab === 'machines' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                        <Settings size={18} /> Fábricas
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                        <Package size={18} /> Estoque e Fluxo
                    </button>
                    <button onClick={() => setActiveTab('power')} className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeTab === 'power' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                        <Zap size={18} /> Geradores
                    </button>
                    <button onClick={() => setActiveTab('research')} className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${activeTab === 'research' ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}>
                        <Beaker size={18} /> Laboratórios
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-black/50 p-4 rounded border border-stone-800 custom-scrollbar">

                    {activeTab === 'machines' && (
                        <div className="space-y-6">
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {MACHINES.filter(m => m.type !== 'generator' && m.type !== 'lab').map(machine => (
                                    <button
                                        key={machine.id}
                                        onClick={() => buyMachine(machine.cost.gold, () => addNode(machine.id))}
                                        className="bg-stone-800 border border-orange-900/50 p-2 rounded min-w-[140px] flex flex-col items-center hover:bg-stone-700 hover:border-orange-500 transition-colors"
                                        disabled={gold < machine.cost.gold}
                                    >
                                        <div className="text-2xl mb-1">{machine.emoji}</div>
                                        <div className="text-xs font-bold text-stone-300 text-center">{machine.name}</div>
                                        <div className="text-[10px] text-yellow-500 mt-1">{machine.cost.gold} Ouro</div>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nodes.filter(n => {
                                    const m = MACHINES.find(mc => mc.id === n.machineId);
                                    return m && m.type !== 'generator' && m.type !== 'lab';
                                }).map(node => {
                                    const machine = MACHINES.find(m => m.id === node.machineId);
                                    const currentRecipe = RECIPES.find(r => r.id === node.recipeId);
                                    const compatibleRecipes = RECIPES.filter(r => r.machineType === machine?.type);

                                    if (!machine) return null;

                                    return (
                                        <div key={node.id} className="bg-stone-800/80 border border-stone-600 rounded p-3 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{machine.emoji}</span>
                                                    <div>
                                                        <div className="font-bold text-sm text-amber-500 truncate">{machine.name}</div>
                                                        <div className="text-[10px] text-stone-400">Qtd: {node.count}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeNode(node.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                                            </div>

                                            <div className="mt-2 bg-black/60 p-2 rounded border border-stone-700 flex-1">
                                                <div className="text-xs text-stone-500 mb-1">Receita Ativa:</div>
                                                <select
                                                    value={node.recipeId}
                                                    onChange={(e) => updateNode(node.id, { recipeId: e.target.value })}
                                                    className="w-full bg-stone-900 text-xs text-stone-300 border border-stone-600 rounded p-1 mb-2"
                                                >
                                                    <option value="">-- Parado --</option>
                                                    {compatibleRecipes.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name} ({r.time}s)</option>
                                                    ))}
                                                </select>

                                                {currentRecipe && (
                                                    <div className="text-[10px] space-y-1">
                                                        <div className="text-red-400">Gasto: {currentRecipe.powerDraw * node.count} MW</div>
                                                        {Object.keys(currentRecipe.inputs).length > 0 && (
                                                            <div className="text-stone-400 truncate">
                                                                In: {Object.entries(currentRecipe.inputs).map(([id, am]) => {
                                                                    const item = INDUSTRY_ITEMS.find(i => i.id === id);
                                                                    return `${am} ${item?.emoji}`;
                                                                }).join(', ')}
                                                            </div>
                                                        )}
                                                        <div className="text-green-400 truncate">
                                                            Out: {Object.entries(currentRecipe.outputs).map(([id, am]) => {
                                                                const item = INDUSTRY_ITEMS.find(i => i.id === id);
                                                                return `${am} ${item?.emoji}`;
                                                            }).join(', ')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-2 flex gap-1">
                                                <button
                                                    onClick={() => buyMachine(machine.cost.gold, () => updateNode(node.id, { count: node.count + 1 }))}
                                                    disabled={gold < machine.cost.gold}
                                                    className="flex-1 bg-stone-700 hover:bg-stone-600 text-xs py-1 rounded flex items-center justify-center gap-1 text-stone-300 disabled:opacity-50"
                                                >
                                                    <Plus size={12} /> Adicionar Linha ({machine.cost.gold}g)
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {INDUSTRY_ITEMS.map(item => {
                                const amount = inventory[item.id] || 0;
                                const rate = metrics.flowPerSecond[item.id] || 0;

                                return (
                                    <div key={item.id} className="bg-stone-800 p-3 rounded border border-stone-700 flex flex-col items-center">
                                        <div className="text-3xl mb-2">{item.emoji}</div>
                                        <div className="font-bold text-stone-200 text-sm text-center line-clamp-1">{item.name}</div>
                                        <div className="text-orange-400 font-mono text-lg">{Math.floor(amount)}</div>
                                        <div className={`text-xs font-mono mt-1 ${rate > 0 ? 'text-green-400' : rate < 0 ? 'text-red-400' : 'text-stone-500'}`}>
                                            {formatRate(rate)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'power' && (
                        <div className="space-y-6">
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {MACHINES.filter(m => m.type === 'generator').map(machine => (
                                    <button
                                        key={machine.id}
                                        onClick={() => buyMachine(machine.cost.gold, () => {
                                            const genRecipe = RECIPES.find(r => r.machineType === 'generator');
                                            addNode(machine.id, genRecipe?.id);
                                        })}
                                        className="bg-stone-800 border border-emerald-900/50 p-2 rounded min-w-[140px] flex flex-col items-center hover:bg-stone-700 hover:border-emerald-500 transition-colors"
                                        disabled={gold < machine.cost.gold}
                                    >
                                        <div className="text-2xl mb-1">{machine.emoji}</div>
                                        <div className="text-xs font-bold text-stone-300 text-center">{machine.name}</div>
                                        <div className="text-[10px] text-yellow-500 mt-1">{machine.cost.gold} Ouro</div>
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nodes.filter(n => {
                                    const m = MACHINES.find(mc => mc.id === n.machineId);
                                    return m && m.type === 'generator';
                                }).map(node => {
                                    const machine = MACHINES.find(m => m.id === node.machineId);
                                    const currentRecipe = RECIPES.find(r => r.id === node.recipeId);
                                    if (!machine) return null;
                                    return (
                                        <div key={node.id} className="bg-emerald-900/20 border border-emerald-800/50 rounded p-3 flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{machine.emoji}</span>
                                                    <div>
                                                        <div className="font-bold text-sm text-emerald-500">{machine.name}</div>
                                                        <div className="text-[10px] text-stone-400">Total: {node.count}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeNode(node.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                                            </div>
                                            {currentRecipe && (
                                                <div className="bg-black/40 p-2 rounded border border-emerald-900 text-[10px] space-y-1 mb-2">
                                                    <div className="text-green-400">Gera: {Math.abs(currentRecipe.powerDraw) * node.count} MW</div>
                                                    <div className="text-stone-400 truncate">Consome: {Object.entries(currentRecipe.inputs).map(([id, am]) => `${Math.abs(am * node.count)}/s ${INDUSTRY_ITEMS.find(i => i.id === id)?.emoji}`).join(', ')}</div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => buyMachine(machine.cost.gold, () => updateNode(node.id, { count: node.count + 1 }))}
                                                disabled={gold < machine.cost.gold}
                                                className="w-full bg-emerald-900/40 hover:bg-emerald-800 text-xs py-1 rounded flex items-center justify-center gap-1 text-emerald-300 disabled:opacity-50"
                                            >
                                                <Plus size={12} /> Adicionar Unidade ({machine.cost.gold}g)
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'research' && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <Beaker className="w-16 h-16 text-cyan-500 mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">Laboratório Quântico Desativado</h3>
                            <p className="text-stone-400 max-w-md">Construa Montadoras e forneça Pacotes de Ciência para desbloquear a próxima era da industrialização.</p>
                            <div className="mt-8 text-xs text-stone-600 border border-stone-800 p-4 rounded bg-stone-900/50">
                                Árvore de Tecnologias em desenvolvimento...
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
