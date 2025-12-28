import React from 'react';
import { Hammer } from 'lucide-react';
import type { Resources, Item } from '../../engine/types';

interface ForgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: Resources;
    actions: any;
    items?: Item[];
    voidMatter?: number;
}

export const ForgeModal: React.FC<ForgeModalProps> = ({ isOpen, onClose, resources, actions, items = [], voidMatter = 0 }) => {
    if (!isOpen) return null;

    const [tab, setTab] = React.useState<'upgrade' | 'void'>('upgrade');
    const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gray-900 border-4 border-orange-500 w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-orange-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Hammer /> THE BLACKSMITH</h2>

                <div className="flex gap-2 justify-center mb-4">
                    <button onClick={() => setTab('upgrade')} className={`px-4 py-2 rounded ${tab === 'upgrade' ? 'bg-orange-600' : 'bg-gray-700'}`}>Forge</button>
                    <button onClick={() => setTab('void')} className={`px-4 py-2 rounded ${tab === 'void' ? 'bg-purple-900 animate-pulse border border-purple-500' : 'bg-gray-700'}`}>Void Anvil</button>
                </div>

                {tab === 'upgrade' && (
                    <>
                        <div className="flex justify-around mb-6 bg-gray-800 p-2 rounded">
                            <div className="text-orange-300 text-xs flex flex-col items-center"><span>Copper</span><span className="text-lg text-white">{resources.copper}</span></div>
                            <div className="text-gray-300 text-xs flex flex-col items-center"><span>Iron</span><span className="text-lg text-white">{resources.iron}</span></div>
                            <div className="text-cyan-300 text-xs flex flex-col items-center"><span>Mithril</span><span className="text-lg text-white">{resources.mithril}</span></div>
                        </div>

                        <div className="space-y-2">
                            <button onClick={() => actions.forgeUpgrade('copper')} disabled={resources.copper < 100} className="btn-retro w-full bg-orange-800 hover:bg-orange-700 disabled:opacity-50 text-white p-3 rounded flex justify-between items-center">
                                <span>Forge Copper Gear (All Stats+)</span>
                                <span className="text-xs">100 Ore</span>
                            </button>
                            <button onClick={() => actions.forgeUpgrade('iron')} disabled={resources.iron < 50} className="btn-retro w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white p-3 rounded flex justify-between items-center">
                                <span>Forge Iron Gear (All Stats++)</span>
                                <span className="text-xs">50 Ore</span>
                            </button>
                            <button onClick={() => actions.forgeUpgrade('mithril')} disabled={resources.mithril < 10} className="btn-retro w-full bg-cyan-900 hover:bg-cyan-800 disabled:opacity-50 text-white p-3 rounded flex justify-between items-center">
                                <span>Forge Mithril Gear (All Stats+++)</span>
                                <span className="text-xs">10 Ore</span>
                            </button>
                        </div>
                    </>
                )}

                {tab === 'void' && (
                    <div className="text-gray-300 space-y-4">
                        <div className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <span className="text-purple-400 font-bold">Void Matter: {Math.floor(voidMatter)}</span>
                        </div>
                        <p className="text-xs text-gray-400">Select an item to Reforge (Cost: 5 Void Matter)</p>

                        <div className="h-64 overflow-y-auto border border-gray-700 p-2 rounded bg-black space-y-1">
                            {items.filter(i => i.rarity !== 'common').map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item.id)}
                                    className={`p-2 rounded border cursor-pointer flex justify-between items-center ${selectedItem === item.id ? 'bg-purple-900 border-purple-400' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                                >
                                    <span className={`text-sm ${item.rarity === 'legendary' ? 'text-orange-400' : item.rarity === 'epic' ? 'text-purple-400' : 'text-blue-400'}`}>
                                        {item.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {item.stat.toUpperCase()} +{item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => selectedItem && actions.reforgeItem(selectedItem)}
                            disabled={!selectedItem || voidMatter < 5}
                            className="btn-retro w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white p-3 rounded font-bold animate-pulse"
                        >
                            REFORGE selected ITEM (5 Void)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
