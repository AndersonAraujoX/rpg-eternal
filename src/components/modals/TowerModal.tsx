import React from 'react';
import { Castle, Skull } from 'lucide-react';
import type { Tower } from '../../engine/types';
import { getDailyMutator } from '../../engine/mutators';

interface TowerModalProps {
    isOpen: boolean;
    onClose: () => void;
    tower: Tower;
    actions: any;
    starlight: number;
}

export const TowerModal: React.FC<TowerModalProps> = ({ isOpen, onClose, tower, actions, starlight }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-indigo-950 border-4 border-indigo-500 w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-indigo-200 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Castle /> TOWER OF ETERNITY</h2>

                <div className="mb-6">
                    <div className="text-4xl font-bold text-white mb-2">FLOOR {tower.floor}</div>
                    <div className="text-indigo-400 text-sm">Max Floor: {tower.maxFloor}</div>
                </div>

                <div className="bg-black bg-opacity-50 p-4 rounded mb-6 border border-indigo-800">
                    <p className="text-gray-300 text-sm mb-2">Rules of the Tower:</p>
                    <ul className="text-left text-xs text-indigo-300 list-disc pl-5 space-y-1">
                        <li>Enemies do not respawn.</li>
                        <li>If your party wipes, you are ejected.</li>
                        <li>Difficulty increases exponentially (x1.5 HP per floor).</li>
                        <li>Rewards: Ancient Knowledge (Coming Later).</li>
                    </ul>
                </div>

                {/* Daily Mutator Display */}
                <div className="bg-red-950 bg-opacity-40 p-3 rounded mb-6 border border-red-700">
                    <div className="text-red-400 font-bold mb-1 uppercase tracking-wider flex items-center justify-center gap-2 text-sm">
                        ☠️ Daily Mutator: {getDailyMutator().name}
                    </div>
                    <p className="text-red-200 text-xs italic">{getDailyMutator().description}</p>
                </div>

                <button
                    onClick={() => { actions.enterTower(); onClose(); }}
                    className={`btn-retro w-full py-4 rounded text-xl font-bold flex items-center justify-center gap-2 ${tower.active ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white border-2 border-white`}
                >
                    {tower.active ? <><Skull /> RETREAT</> : <><Castle /> ENTER TOWER</>}
                </button>

                <div className="mt-6 border-t border-indigo-800 pt-4">
                    <div className="text-yellow-400 font-bold mb-2 text-xl">✨ Starlight: {starlight || 0} ✨</div>
                    <button
                        onClick={() => { actions.prestigeTower(); onClose(); }}
                        className="w-full bg-cyan-900 hover:bg-cyan-700 text-cyan-100 border border-cyan-500 py-3 rounded font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={tower.floor < 20}
                    >
                        🌌 ASCEND (Req: Fl 20)
                    </button>
                    <p className="text-xs text-cyan-400 mt-1">Reset Tower to gain Starlight based on Max Floor.</p>
                </div>
            </div>
        </div>
    );
};
