import React, { useState, useEffect } from 'react';

interface PortalResetModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    warning?: string;
    soulsGained?: number;
    rewardText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const PortalResetModal: React.FC<PortalResetModalProps> = ({
    isOpen,
    title = "ASCENDER",
    message = "Um portal para outro plano se abre diante de você.",
    warning,
    soulsGained,
    rewardText,
    onConfirm,
    onCancel
}) => {
    const [phase, setPhase] = useState<'confirm' | 'animating' | 'done'>('confirm');
    const [portalSize, setPortalSize] = useState(0);

    useEffect(() => {
        if (!isOpen) { setPhase('confirm'); setPortalSize(0); }
    }, [isOpen]);

    const handleReset = () => {
        setPhase('animating');
        setPortalSize(0);
        // Animate portal growing
        let size = 0;
        const interval = setInterval(() => {
            size += 4;
            setPortalSize(size);
            if (size >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setPhase('done');
                    setTimeout(() => { onConfirm(); setPhase('confirm'); setPortalSize(0); }, 600);
                }, 400);
            }
        }, 20);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
            {phase === 'confirm' && (
                <div className="bg-slate-900 border-4 border-purple-600 w-full max-w-md p-8 rounded-xl shadow-2xl text-center animate-fade-in">
                    <div className="text-6xl mb-4">🌀</div>
                    <h2 className="text-purple-300 text-2xl font-bold mb-2 uppercase tracking-tighter">{title}</h2>
                    <p className="text-gray-300 mb-4">{message}</p>

                    {(soulsGained !== undefined || rewardText) && (
                        <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mb-6">
                            {soulsGained !== undefined && <div className="text-yellow-400 text-3xl font-bold">+{soulsGained} Almas</div>}
                            {rewardText && <div className="text-cyan-400 text-xl font-bold">{rewardText}</div>}
                        </div>
                    )}

                    {warning && <p className="text-red-400 text-sm mb-6">⚠️ {warning}</p>}

                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors">Cancelar</button>
                        <button onClick={handleReset} className="flex-1 py-3 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-bold transition-colors border border-purple-400">
                            🌀 Atravessar o Portal
                        </button>
                    </div>
                </div>
            )}

            {phase === 'animating' && (
                <div className="flex flex-col items-center justify-center gap-8">
                    {/* Portal SVG Animation */}
                    <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
                        {/* Outer glow rings */}
                        {[120, 100, 80].map((r, i) => (
                            <div key={i} className="absolute rounded-full border-4 border-purple-500 animate-ping"
                                style={{
                                    width: r * (portalSize / 100) * 2,
                                    height: r * (portalSize / 100) * 2,
                                    opacity: 0.3 - i * 0.08,
                                    animationDelay: `${i * 0.2}s`,
                                    boxShadow: '0 0 40px rgba(168,85,247,0.8)'
                                }} />
                        ))}
                        {/* Core portal */}
                        <div className="absolute rounded-full transition-all duration-100"
                            style={{
                                width: 130 * (portalSize / 100),
                                height: 130 * (portalSize / 100),
                                background: `radial-gradient(circle, rgba(88,28,135,1) 0%, rgba(124,58,237,0.8) 40%, rgba(196,181,253,0.4) 70%, transparent 100%)`,
                                boxShadow: '0 0 80px rgba(139,92,246,1), 0 0 20px rgba(196,181,253,0.8)',
                            }} />
                        {/* Character stepping through */}
                        <div className="text-6xl z-10 transition-all duration-300"
                            style={{ opacity: portalSize > 50 ? 1 : 0, transform: `scale(${portalSize / 100})` }}>
                            🧙
                        </div>
                    </div>
                    <div className="text-purple-300 text-xl font-bold animate-pulse">Cruzando o Portal...</div>
                </div>
            )}

            {phase === 'done' && (
                <div className="text-center animate-fade-in">
                    <div className="text-8xl mb-4">✨</div>
                    <div className="text-white text-2xl font-bold">Sucesso!</div>
                </div>
            )}
        </div>
    );
};
