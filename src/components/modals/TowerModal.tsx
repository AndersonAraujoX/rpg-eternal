import React from 'react';
import { Castle, Skull } from 'lucide-react';
import type { Tower, GameActions } from '../../engine/types';

interface TowerModalProps {
    isOpen: boolean;
    onClose: () => void;
    tower: Tower;
    actions: GameActions;
}

export const TowerModal: React.FC<TowerModalProps> = ({ isOpen, onClose, tower, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full relative shadow-2xl">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-white">✕</button>

                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Castle size={24} className="text-purple-500" />
                    Tower of Ascension
                </h2>

                <div className="space-y-4">
                    <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="text-4xl font-bold text-purple-400 mb-2">Floor {tower.floor}</div>
                        <div className="text-sm text-gray-400">Max Floor: {tower.maxFloor}</div>
                    </div>

                    {!tower.active ? (
                        <div className="text-center">
                            <p className="text-gray-300 mb-4">
                                Climb the tower to earn massive rewards and Starlight.
                                <br />
                                <span className="text-red-400 text-sm">Warning: Bosses get exponentially stronger.</span>
                            </p>
                            <button
                                onClick={actions.enterTower}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded text-white font-bold text-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                            >
                                Enter Tower
                            </button>

                            {tower.floor >= 20 && (
                                <button
                                    onClick={actions.prestigeTower}
                                    className="w-full mt-2 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-white font-bold border border-yellow-400"
                                >
                                    Ascend (Reset for Starlight)
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center animate-pulse">
                            <div className="text-red-500 font-bold text-xl mb-2 flex items-center justify-center gap-2">
                                <Skull size={20} /> COMBAT IN PROGRESS
                            </div>
                            <p className="text-gray-400 text-sm">Defeat the Guardian to advance.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
