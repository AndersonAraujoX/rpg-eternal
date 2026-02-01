import React, { useState } from 'react';
import { Hammer, Zap, Gem } from 'lucide-react';
import type { Item, Rune, Resources } from '../../engine/types';

interface RuneModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: Item[];
    resources: Resources;
    souls: number;
    actions: {
        craftRune: () => void;
        socketRune: (itemId: string, runeId: string) => void;
    };
    runes: Rune[]; // Inventory runes
}

export const RuneModal: React.FC<RuneModalProps> = ({ isOpen, onClose, items, resources, souls, actions, runes }) => {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedRune, setSelectedRune] = useState<Rune | null>(null);
    if (!isOpen) return null;


    const CRAFT_COST = { mithril: 10, souls: 50 };
    const canCraft = resources.mithril >= CRAFT_COST.mithril && souls >= CRAFT_COST.souls;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-purple-500 w-full max-w-4xl p-6 rounded-lg shadow-2xl relative h-[600px] flex gap-4">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold hover:text-red-500">X</button>

                {/* LEFT: CRAFTING */}
                <div className="w-1/3 border-r border-gray-700 pr-4 flex flex-col">
                    <h2 className="text-purple-400 text-xl font-bold mb-4 flex items-center gap-2"><Hammer /> RUNE FORGE</h2>

                    <div className="flex-1 bg-slate-800 p-4 rounded mb-4 flex flex-col items-center justify-center text-center">
                        <Gem size={48} className="text-purple-300 mb-2 animate-pulse" />
                        <div className="text-gray-300">Unstable Rune Core</div>
                        <div className="text-xs text-gray-500 mt-2">Random Rarity & Stat</div>
                    </div>

                    <div className="text-sm text-gray-400 mb-2">Cost: {CRAFT_COST.mithril} Mithril, {CRAFT_COST.souls} Souls</div>
                    <button
                        onClick={actions.craftRune}
                        disabled={!canCraft}
                        className={`w-full py-2 rounded font-bold border ${canCraft ? 'bg-purple-700 border-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'}`}
                    >
                        CRAFT RUNE
                    </button>

                    <h3 className="text-white font-bold mt-6 mb-2">INVENTORY ({runes.length})</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {runes.map(r => (
                            <div
                                key={r.id}
                                onClick={() => setSelectedRune(r)}
                                className={`p-2 rounded border cursor-pointer ${selectedRune?.id === r.id ? 'bg-purple-900 border-purple-400' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}
                            >
                                <div className={`font-bold ${r.rarity === 'legendary' ? 'text-orange-400' : r.rarity === 'epic' ? 'text-purple-400' : r.rarity === 'rare' ? 'text-blue-400' : 'text-gray-300'}`}>
                                    {r.name}
                                </div>
                                <div className="text-xs text-green-400">{r.bonus}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: SOCKETING */}
                <div className="w-2/3 flex flex-col">
                    <h2 className="text-blue-400 text-xl font-bold mb-4 flex items-center gap-2"><Zap /> RUNE BINDING</h2>

                    <div className="flex gap-4 h-full">
                        {/* ITEM LIST */}
                        <div className="w-1/2 overflow-y-auto custom-scrollbar pr-2">
                            <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Select Item to Socket</div>
                            {items.filter(i => i.rarity !== 'common').map(i => (
                                <div
                                    key={i.id}
                                    onClick={() => setSelectedItem(i)}
                                    className={`p-2 mb-2 rounded border cursor-pointer ${selectedItem?.id === i.id ? 'bg-blue-900 border-blue-400' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'} relative`}
                                >
                                    <div className={`font-bold ${i.rarity === 'legendary' ? 'text-orange-400' : 'text-purple-400'}`}>{i.name}</div>
                                    <div className="text-xs text-gray-400">Sockets: {i.runes.length} / {i.sockets}</div>
                                    <div className="flex gap-1 mt-1">
                                        {Array.from({ length: i.sockets }).map((_, idx) => (
                                            <div key={idx} className={`w-3 h-3 rounded-full border ${i.runes[idx] ? 'bg-purple-500 border-purple-300' : 'bg-black border-gray-600'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* SOCKET ACTION */}
                        <div className="w-1/2 bg-slate-800 rounded p-4 border border-slate-600 flex flex-col items-center">
                            {selectedItem ? (
                                <>
                                    <div className="text-xl font-bold text-white mb-2">{selectedItem.name}</div>
                                    <div className="text-4xl mb-4">⚔️</div>

                                    <div className="w-full space-y-2 mb-6">
                                        {Array.from({ length: selectedItem.sockets }).map((_, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-black p-2 rounded border border-gray-700">
                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selectedItem.runes[idx] ? 'bg-purple-900 border-purple-500' : 'bg-gray-900 border-gray-600'}`}>
                                                    {selectedItem.runes[idx] ? <Gem size={12} /> : null}
                                                </div>
                                                <span className="text-sm text-gray-300">
                                                    {selectedItem.runes[idx] ? selectedItem.runes[idx].name : 'Empty Socket'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedItem.runes.length < selectedItem.sockets ? (
                                        <div className="mt-auto w-full">
                                            <div className="text-sm text-center mb-2 text-gray-400">
                                                {selectedRune ? `Socket ${selectedRune.name}?` : 'Select a Rune from Inventory'}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (selectedItem && selectedRune) {
                                                        actions.socketRune(selectedItem.id, selectedRune.id);
                                                        setSelectedRune(null);
                                                    }
                                                }}
                                                disabled={!selectedRune}
                                                className={`w-full py-2 rounded font-bold ${selectedRune ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                BIND RUNE
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-auto text-red-400 font-bold">NO EMPTY SOCKETS</div>
                                    )}
                                </>
                            ) : (
                                <div className="text-gray-500 italic mt-10">Select an item to view sockets</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
