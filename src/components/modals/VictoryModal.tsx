import React from 'react';
import { Trophy, Star, RefreshCw } from 'lucide-react';

interface VictoryModalProps {
    isOpen: boolean;
    playTime: number;
    ascensions: number;
    onContinue: () => void; // Continue playing (Endless Mode)
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, playTime, ascensions, onContinue }) => {
    if (!isOpen) return null;

    const hours = Math.floor(playTime / 3600);
    const minutes = Math.floor((playTime % 3600) / 60);

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] backdrop-blur-xl animate-in fade-in duration-1000">
            <div className="max-w-2xl w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black border-2 border-yellow-500 rounded-2xl p-8 text-center relative shadow-[0_0_100px_rgba(255,215,0,0.3)]">

                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-500 rounded-full p-6 shadow-[0_0_50px_rgba(255,215,0,0.6)] animate-bounce">
                        <Trophy size={64} className="text-black" />
                    </div>
                </div>

                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 mt-12 mb-4 drop-shadow-lg">
                    VICTORY!
                </h1>

                <p className="text-2xl text-indigo-200 mb-8 font-light">
                    You have defeated the <span className="text-purple-400 font-bold">Void Core</span> and saved the multiverse.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/40 p-4 rounded-lg border border-indigo-500/30">
                        <div className="text-indigo-400 text-sm uppercase tracking-wider mb-1">Total Playtime</div>
                        <div className="text-3xl font-mono font-bold text-white">{hours}h {minutes}m</div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg border border-indigo-500/30">
                        <div className="text-indigo-400 text-sm uppercase tracking-wider mb-1">Ascensions</div>
                        <div className="text-3xl font-mono font-bold text-white">{ascensions}</div>
                    </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 p-6 rounded-xl mb-8">
                    <h3 className="text-yellow-400 font-bold text-lg mb-2 flex items-center justify-center gap-2">
                        <Star size={20} /> ENDLESS MODE UNLOCKED <Star size={20} />
                    </h3>
                    <p className="text-yellow-200/80 text-sm">
                        You can continue playing to reach higher floors, conquer more galaxies, and achieve infinite power.
                    </p>
                </div>

                <button
                    onClick={onContinue}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xl rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                    <RefreshCw size={24} />
                    CONTINUE ENDLESS JOURNEY
                </button>

            </div>
        </div>
    );
};
