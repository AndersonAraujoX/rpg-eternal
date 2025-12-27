import React from 'react';
import { Hammer } from 'lucide-react';
import type { Resources } from '../../engine/types';

interface ForgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: Resources;
    actions: any;
}

export const ForgeModal: React.FC<ForgeModalProps> = ({ isOpen, onClose, resources, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gray-900 border-4 border-orange-500 w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-orange-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Hammer /> THE BLACKSMITH</h2>

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
            </div>
        </div>
    );
};
