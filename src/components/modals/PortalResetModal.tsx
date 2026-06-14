import React, { useState, useEffect } from 'react';
import type { Building, Hero } from '../../engine/types';

interface PortalResetModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    warning?: string;
    soulsGained?: number;
    rewardText?: string;
    onConfirm: (preservedBuildingIds?: string[], preservedHeroId?: string) => void;
    onCancel: () => void;
    hasRealityAnchor?: boolean;
    buildings?: Building[];
    heroes?: Hero[];
}

export const PortalResetModal: React.FC<PortalResetModalProps> = ({
    isOpen,
    title = "ASCENDER",
    message = "Um portal para outro plano se abre diante de você.",
    warning,
    soulsGained,
    rewardText,
    onConfirm,
    onCancel,
    hasRealityAnchor = false,
    buildings = [],
    heroes = []
}) => {
    const [phase, setPhase] = useState<'confirm' | 'animating' | 'done'>('confirm');
    const [portalSize, setPortalSize] = useState(0);

    const [preserveType, setPreserveType] = useState<'none' | 'buildings' | 'hero'>('none');
    const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
    const [selectedHero, setSelectedHero] = useState<string>('');

    useEffect(() => {
        if (!isOpen) {
            setPhase('confirm');
            setPortalSize(0);
            setPreserveType('none');
            setSelectedBuildings([]);
            setSelectedHero('');
        }
    }, [isOpen]);

    const handleBuildingToggle = (id: string) => {
        setSelectedBuildings(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id);
            }
            if (prev.length >= 2) {
                return [prev[1], id];
            }
            return [...prev, id];
        });
    };

    const handleReset = () => {
        setPhase('animating');
        setPortalSize(0);
        let size = 0;
        const interval = setInterval(() => {
            size += 4;
            setPortalSize(size);
            if (size >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setPhase('done');
                    setTimeout(() => {
                        onConfirm(
                            preserveType === 'buildings' ? selectedBuildings : [],
                            preserveType === 'hero' ? selectedHero : undefined
                        );
                        setPhase('confirm');
                        setPortalSize(0);
                    }, 600);
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
                        <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mb-4">
                            {soulsGained !== undefined && <div className="text-yellow-400 text-3xl font-bold">+{soulsGained} Almas</div>}
                            {rewardText && <div className="text-cyan-400 text-xl font-bold">{rewardText}</div>}
                        </div>
                    )}

                    {hasRealityAnchor && (
                        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 mb-4 text-left animate-fade-in text-sm">
                            <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-1.5">
                                ⚓ Ancorador de Realidade Ativo
                            </h3>
                            <p className="text-gray-300 text-xs mb-3">
                                Escolha proteger edifícios ou um herói dos efeitos do reset de Rebirth:
                            </p>
                            
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => { setPreserveType('none'); setSelectedBuildings([]); setSelectedHero(''); }}
                                    className={`flex-1 py-1 px-1.5 rounded font-bold text-[10px] uppercase transition-colors ${preserveType === 'none' ? 'bg-purple-600 text-white border border-purple-400' : 'bg-slate-950 text-gray-400 border border-transparent hover:bg-slate-700'}`}
                                >
                                    Nenhum
                                </button>
                                <button
                                    onClick={() => { setPreserveType('buildings'); setSelectedHero(''); }}
                                    className={`flex-1 py-1 px-1.5 rounded font-bold text-[10px] uppercase transition-colors ${preserveType === 'buildings' ? 'bg-purple-600 text-white border border-purple-400' : 'bg-slate-950 text-gray-400 border border-transparent hover:bg-slate-700'}`}
                                >
                                    Prédios (Max 2)
                                </button>
                                <button
                                    onClick={() => { setPreserveType('hero'); setSelectedBuildings([]); }}
                                    className={`flex-1 py-1 px-1.5 rounded font-bold text-[10px] uppercase transition-colors ${preserveType === 'hero' ? 'bg-purple-600 text-white border border-purple-400' : 'bg-slate-950 text-gray-400 border border-transparent hover:bg-slate-700'}`}
                                >
                                    Herói (Max 1)
                                </button>
                            </div>

                            {preserveType === 'buildings' && (
                                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                    {buildings.filter(b => b.level > 0).map(b => {
                                        const isSelected = selectedBuildings.includes(b.id);
                                        return (
                                            <button
                                                key={b.id}
                                                onClick={() => handleBuildingToggle(b.id)}
                                                className={`py-1 px-2 rounded text-[11px] text-left transition-all flex items-center justify-between ${isSelected ? 'bg-purple-700/50 border border-purple-500 text-white font-semibold' : 'bg-slate-950 border border-slate-800 text-gray-400 hover:border-slate-650'}`}
                                            >
                                                <span className="truncate">{b.name} (Lv{b.level})</span>
                                                {isSelected && <span className="text-yellow-400">✓</span>}
                                            </button>
                                        );
                                    })}
                                    {buildings.filter(b => b.level > 0).length === 0 && (
                                        <div className="col-span-2 text-center text-xs text-gray-500 py-2">
                                            Nenhum edifício construído.
                                        </div>
                                    )}
                                </div>
                            )}

                            {preserveType === 'hero' && (
                                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                    {heroes.filter(h => h.unlocked).map(h => {
                                        const isSelected = selectedHero === h.id;
                                        return (
                                            <button
                                                key={h.id}
                                                onClick={() => setSelectedHero(h.id)}
                                                className={`py-1 px-2 rounded text-[11px] text-left transition-all flex items-center gap-1.5 justify-between ${isSelected ? 'bg-purple-700/50 border border-purple-500 text-white font-semibold' : 'bg-slate-950 border border-slate-800 text-gray-400 hover:border-slate-650'}`}
                                            >
                                                <div className="flex items-center gap-1 min-w-0">
                                                    <span>{h.emoji}</span>
                                                    <span className="truncate">{h.name} (Lv{h.level})</span>
                                                </div>
                                                {isSelected && <span className="text-yellow-400">✓</span>}
                                            </button>
                                        );
                                    })}
                                    {heroes.filter(h => h.unlocked).length === 0 && (
                                        <div className="col-span-2 text-center text-xs text-gray-500 py-2">
                                            Nenhum herói recrutado.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {warning && <p className="text-red-400 text-xs mb-4">⚠️ {warning}</p>}

                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-750 text-white rounded-lg font-bold text-sm transition-colors border border-gray-700">Cancelar</button>
                        <button onClick={handleReset} className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-650 text-white rounded-lg font-bold text-sm transition-colors border border-purple-500 shadow-lg shadow-purple-900/50">
                            🌀 Atravessar Portal
                        </button>
                    </div>
                </div>
            )}

            {phase === 'animating' && (
                <div className="flex flex-col items-center justify-center gap-8">
                    <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
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
                        <div className="absolute rounded-full transition-all duration-100"
                            style={{
                                width: 130 * (portalSize / 100),
                                height: 130 * (portalSize / 100),
                                background: `radial-gradient(circle, rgba(88,28,135,1) 0%, rgba(124,58,237,0.8) 40%, rgba(196,181,253,0.4) 70%, transparent 100%)`,
                                boxShadow: '0 0 80px rgba(139,92,246,1), 0 0 20px rgba(196,181,253,0.8)',
                            }} />
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
