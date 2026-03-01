import React, { useState } from 'react';
import { Fish, Anchor } from 'lucide-react';
import { processFishing } from '../../engine/fishing';
import { soundManager } from '../../engine/sound';

interface FishingModalProps {
    isOpen: boolean;
    onClose: () => void;
    fishCount: number;
    setFish: (n: number) => void;
}

export const FishingModal: React.FC<FishingModalProps> = ({ isOpen, onClose, fishCount, setFish }) => {
    const [animate, setAnimate] = useState(false);

    if (!isOpen) return null;

    const handleCast = () => {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);

        const caught = processFishing(1);
        if (caught > 0) {
            setFish(fishCount + caught);
            soundManager.playLevelUp();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-cyan-900/50 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto bg-cyan-900/20 rounded-full flex items-center justify-center border-4 border-cyan-900/30 mb-4 relative overflow-hidden">
                        <Anchor className={`w-10 h-10 text-cyan-600 transition-transform duration-500 ${animate ? 'translate-y-4' : ''}`} />
                        {animate && (
                            <div className="absolute inset-0 bg-cyan-500/20 animate-ping rounded-full"></div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        O Cais de Pesca
                    </h2>
                    <p className="text-gray-400 text-sm">Relaxe e jogue sua linha.</p>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 text-center mb-6">
                    <div className="flex items-center justify-center gap-3 text-4xl mb-2">
                        <Fish className="w-8 h-8 text-cyan-400" />
                        <span className="font-mono text-cyan-100">{fishCount}</span>
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Peixes Capturados</p>
                </div>

                <button
                    onClick={handleCast}
                    className="w-full py-4 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-bold text-white shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all"
                >
                    LANÇAR LINHA
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                    Passivo: 5% de chance de pescar a cada tick.
                </p>
            </div>
        </div>
    );
};
