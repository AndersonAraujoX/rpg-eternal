import React, { useState } from 'react';
import { Sparkles, Zap, Shield, Flame, Compass, X, Activity } from 'lucide-react';
import type { Item } from '../../engine/types';
import { formatNumber } from '../../utils';

interface VoidInfusionModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: Item[];
    voidMatter: number;
    actions: {
        infuseItemWithVoid: (itemId: string) => void;
    };
}

const RARITY_COLORS: Record<string, string> = {
    legendary: 'text-orange-400 border-orange-900/50 bg-orange-950/10',
    epic: 'text-purple-400 border-purple-900/50 bg-purple-950/10',
    rare: 'text-blue-400 border-blue-900/50 bg-blue-950/10',
    common: 'text-gray-400 border-gray-800/80 bg-gray-900/10',
};

const VOID_AFFIXES_INFO = [
    { name: 'Toque Abissal', effect: '10% de chance de executar chefes abaixo de 20% de HP' },
    { name: 'Dreno de Vácuo', effect: '+2.5% Roubo de Vida global por item infundido' },
    { name: 'Entropia', effect: '+20% de Dano global, mas consome 1% de HP por tick' },
    { name: 'Dobra Espacial', effect: '+12% de chance de Esquiva por item infundido' },
    { name: 'Pacto Sombrio', effect: '+35% Dano Crítico global, mas reduz Defesa em -12%' }
];

export const VoidInfusionModal: React.FC<VoidInfusionModalProps> = ({
    isOpen,
    onClose,
    items = [],
    voidMatter,
    actions
}) => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    if (!isOpen) return null;

    const selectedItem = items.find(i => i.id === selectedItemId);
    const hasEnoughVoidMatter = voidMatter >= 50;

    const handleInfuse = () => {
        if (selectedItemId) {
            actions.infuseItemWithVoid(selectedItemId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-purple-950/50 rounded-xl p-6 max-w-3xl w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-3 bg-purple-950/40 rounded-lg border border-purple-900/30">
                        <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                            Forja do Vazio
                        </h2>
                        <p className="text-gray-400 text-sm">Infundir equipamentos com Matéria do Vazio para despertar afixos corrompidos de extremo poder.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Inventory Items list */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selecione um Equipamento</span>
                            <span className="text-xs text-purple-300 font-bold bg-purple-950/50 border border-purple-900/30 px-2 py-0.5 rounded">
                                ✨ {formatNumber(voidMatter)} Matéria
                            </span>
                        </div>

                        <div className="bg-gray-950/60 rounded-lg border border-gray-850 p-2 overflow-y-auto max-h-[45vh] space-y-2">
                            {items.length > 0 ? (
                                items.map(item => {
                                    const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
                                    const isSelected = selectedItemId === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedItemId(item.id)}
                                            className={`w-full text-left p-3 rounded-lg border flex justify-between items-center transition-all ${
                                                isSelected 
                                                    ? 'border-purple-500 bg-purple-950/15' 
                                                    : 'border-gray-850 bg-gray-900/40 hover:border-gray-700'
                                            }`}
                                        >
                                            <div>
                                                <h4 className={`font-bold text-sm ${isSelected ? 'text-purple-300' : 'text-gray-250'}`}>
                                                    {item.name}
                                                </h4>
                                                <div className="flex gap-2 items-center mt-1">
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold uppercase ${rarityColor}`}>
                                                        {item.rarity}
                                                    </span>
                                                    {item.voidAffix && (
                                                        <span className="text-[9px] bg-purple-950/60 border border-purple-800 text-purple-300 px-1.5 py-0.2 rounded font-bold uppercase">
                                                            🌌 Infundido
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-green-400 font-mono text-xs font-bold">
                                                    +{formatNumber(item.value)} {item.stat?.toUpperCase() || ''}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center text-gray-600 py-10 text-xs">
                                    Nenhum item disponível no inventário.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Infusion Detail / Action Panel */}
                    <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-850 flex flex-col justify-between">
                        {selectedItem ? (
                            <div className="space-y-4">
                                <div className="border-b border-gray-800 pb-3">
                                    <span className="text-[10px] text-purple-400 font-bold block uppercase tracking-wider">Item Selecionado</span>
                                    <h3 className="font-bold text-gray-200 text-base">{selectedItem.name}</h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Atributo Base: <span className="text-green-400 font-bold">+{selectedItem.value} {selectedItem.stat?.toUpperCase() || ''}</span>
                                    </p>
                                    {selectedItem.voidAffix && (
                                        <div className="mt-2.5 p-2 bg-purple-950/20 border border-purple-900/30 rounded text-xs text-purple-300">
                                            Afixo Atual: <span className="font-bold text-purple-200">{selectedItem.voidAffix.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Afixos do Vazio Possíveis:</h4>
                                    <div className="space-y-2 bg-gray-950/80 p-3 rounded-lg border border-gray-900 text-[10px]">
                                        {VOID_AFFIXES_INFO.map((aff, i) => (
                                            <div key={i} className="flex flex-col border-b border-gray-900 pb-1.5 last:border-b-0 last:pb-0">
                                                <span className="text-purple-300 font-bold">{aff.name}</span>
                                                <span className="text-gray-450 mt-0.5">{aff.effect}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-850">
                                    <div className="flex justify-between items-center text-xs mb-3">
                                        <span className="text-gray-400">Custo da Infusão:</span>
                                        <span className={`font-bold ${hasEnoughVoidMatter ? 'text-purple-350' : 'text-red-400'}`}>
                                            50 Matéria (Você tem {voidMatter})
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleInfuse}
                                        disabled={!hasEnoughVoidMatter}
                                        className={`w-full py-2.5 rounded-lg text-sm font-bold border transition-all ${
                                            hasEnoughVoidMatter 
                                                ? 'bg-purple-650 hover:bg-purple-550 border-purple-500 text-white shadow-lg hover:scale-[1.02]' 
                                                : 'bg-gray-850 border-gray-800 text-gray-550 cursor-not-allowed'
                                        }`}
                                    >
                                        Infundir com Vazio
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
                                <div className="text-4xl text-gray-700 animate-pulse mb-3">🌌</div>
                                <h4 className="font-bold text-gray-300">Escolha um item para Infundir</h4>
                                <p className="text-xs text-gray-500 px-4 mt-2 leading-relaxed">
                                    Selecione qualquer item do seu inventário no painel esquerdo para visualizar os afixos disponíveis e realizar a infusão.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
