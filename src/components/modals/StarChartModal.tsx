import React from 'react';
import { Star } from 'lucide-react';
import type { ConstellationNode } from '../../engine/types';

interface StarChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    divinity: number;
    constellations: ConstellationNode[];
    actions: any;
}

export const StarChartModal: React.FC<StarChartModalProps> = ({ isOpen, onClose, divinity, constellations, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-cyan-500 w-full max-w-2xl h-[80vh] p-4 rounded-lg shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold z-10">X</button>
                <h2 className="text-center text-cyan-400 text-xl font-bold mb-4 flex items-center justify-center gap-2"><Star /> CELESTIAL REALM</h2>
                <div className="text-center text-white mb-4">Divinity: <span className="text-cyan-400">{divinity}</span></div>

                <div className="relative w-full h-full bg-slate-950 rounded border border-slate-700">
                    {/* Stars */}
                    {constellations.map(c => (
                        <div key={c.id} className="absolute flex flex-col items-center group cursor-pointer" style={{ left: `${c.x}%`, top: `${c.y}%` }} onClick={() => actions.buyConstellation(c.id)}>
                            <div className={`w-4 h-4 rounded-full ${c.level > 0 ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-gray-600'} transition-all group-hover:scale-125`}></div>
                            <div className="mt-1 text-[10px] text-white bg-black bg-opacity-50 px-1 rounded whitespace-nowrap">
                                {c.name} (Lvl {c.level})
                            </div>
                            {/* Tooltip */}
                            <div className="hidden group-hover:block absolute bottom-8 bg-slate-800 p-2 rounded border border-cyan-500 text-xs text-left z-20 w-32">
                                <div className="font-bold text-cyan-300">{c.description}</div>
                                <div>Current: +{Math.round(c.level * c.valuePerLevel * 100)}%</div>
                                <div className={divinity >= c.cost && c.level < c.maxLevel ? 'text-green-400' : 'text-red-400'}>
                                    Cost: {c.level >= c.maxLevel ? 'MAX' : c.cost} Div
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
