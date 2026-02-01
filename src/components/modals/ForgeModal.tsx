
import React from 'react';
import { Hammer, X } from "lucide-react";
import type { Resources } from "../../engine/types";
import { MiningClicker } from "../minigames/MiningClicker";

interface ForgeModalProps {
    resources: Resources;
    forgeUpgrade: (material: 'copper' | 'iron' | 'mithril') => void;
    onClose: () => void;
    setResources: React.Dispatch<React.SetStateAction<Resources>>;
}

export function ForgeModal({ resources, forgeUpgrade, onClose, setResources }: ForgeModalProps) {

    const handleMine = (type: 'copper' | 'iron' | 'mithril', amount: number) => {
        setResources((prev) => ({ ...prev, [type]: prev[type] + amount }));
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-orange-700 relative flex flex-col gap-4 shadow-xl">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white"><X size={20} /></button>
                <h2 className="text-2xl font-bold text-orange-500 flex items-center gap-2"><Hammer /> The Forge</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upgrade Section */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-bold text-gray-300 border-b border-gray-700 pb-1">Equipment Upgrades</h3>

                        <div className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                            <span className="text-orange-300 text-sm">Copper Set (+10 Stats)</span>
                            <button onClick={() => forgeUpgrade('copper')} className="btn-retro bg-orange-700 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs">
                                Forge (100 Cu)
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                            <span className="text-slate-300 text-sm">Iron Set (+25 Stats)</span>
                            <button onClick={() => forgeUpgrade('iron')} className="btn-retro bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded text-xs">
                                Forge (50 Fe)
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-gray-800 p-3 rounded border border-gray-700">
                            <span className="text-cyan-300 text-sm">Mithril Set (+50 Stats)</span>
                            <button onClick={() => forgeUpgrade('mithril')} className="btn-retro bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1 rounded text-xs">
                                Forge (10 Mi)
                            </button>
                        </div>
                    </div>

                    {/* Mining Section */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-bold text-gray-300 border-b border-gray-700 pb-1">Deep Mine</h3>
                        <MiningClicker resources={resources} onMine={handleMine} />
                    </div>
                </div>
            </div>
        </div>
    );
}
