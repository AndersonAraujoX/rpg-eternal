import { useState, useEffect } from 'react';
import { Hammer, Zap } from 'lucide-react';
import type { Resources } from '../../engine/types';

interface MiningClickerProps {
    resources: Resources;
    onMine: (resource: 'copper' | 'iron' | 'mithril', amount: number) => void;
    backroomsFloor?: number;
    isBackroomsUnlocked?: boolean;
    isMiningFrenzy?: boolean;
    setIsMiningFrenzy?: (active: boolean) => void;
}

export function MiningClicker({
    onMine,
    backroomsFloor = 1,
    isBackroomsUnlocked = false,
    isMiningFrenzy = false,
    setIsMiningFrenzy
}: MiningClickerProps) {
    const [hp, setHp] = useState(10);
    const [maxHp, setMaxHp] = useState(10);
    const [animating, setAnimating] = useState(false);
    const [combo, setCombo] = useState(0);
    const [frenzyTimeLeft, setFrenzyTimeLeft] = useState(0);

    // Frenzy timer countdown
    useEffect(() => {
        if (frenzyTimeLeft > 0) {
            const timer = setTimeout(() => {
                setFrenzyTimeLeft(prev => {
                    const next = prev - 1;
                    if (next <= 0) {
                        if (setIsMiningFrenzy) setIsMiningFrenzy(false);
                        setCombo(0);
                    }
                    return next;
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [frenzyTimeLeft, setIsMiningFrenzy]);

    // Combo decay when not in frenzy
    useEffect(() => {
        const decayTimer = setInterval(() => {
            if (frenzyTimeLeft === 0) {
                setCombo(prev => Math.max(0, prev - 2));
            }
        }, 1000);
        return () => clearInterval(decayTimer);
    }, [frenzyTimeLeft]);

    const clickRock = () => {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 100);

        // Increment Combo if not already in Frenzy
        if (frenzyTimeLeft === 0) {
            const boostActive = isBackroomsUnlocked && backroomsFloor >= 38;
            const inc = boostActive ? 10 : 5;
            setCombo(prev => {
                const next = Math.min(100, prev + inc);
                if (next >= 100) {
                    setFrenzyTimeLeft(15);
                    if (setIsMiningFrenzy) setIsMiningFrenzy(true);
                    return 100;
                }
                return next;
            });
        }

        setHp(prev => {
            const next = prev - 1;
            if (next <= 0) {
                distributeLoot();
                setMaxHp(10);
                return 10;
            }
            return next;
        });
    };

    const distributeLoot = () => {
        const rand = Math.random();
        let type: 'copper' | 'iron' | 'mithril' = 'copper';
        let amount = 1;

        // If in frenzy mode, give +50% loot rounded up
        const lootMult = frenzyTimeLeft > 0 ? 1.5 : 1.0;

        if (rand > 0.95) { 
            type = 'mithril'; 
            amount = Math.ceil(1 * lootMult); 
        } else if (rand > 0.7) { 
            type = 'iron'; 
            amount = Math.ceil(2 * lootMult); 
        } else { 
            type = 'copper'; 
            amount = Math.ceil(5 * lootMult); 
        }

        onMine(type, amount);
    };

    const isFrenzyActive = frenzyTimeLeft > 0;
    const hasComboBoost = isBackroomsUnlocked && backroomsFloor >= 38;

    return (
        <div className={`p-4 rounded border flex flex-col items-center gap-3 transition-all duration-350 ${
            isFrenzyActive 
                ? 'bg-orange-950/40 border-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-black/40 border-slate-700'
        }`}>
            <h3 className={`font-bold flex items-center gap-2 text-xs uppercase tracking-wider ${
                isFrenzyActive ? 'text-orange-400 animate-pulse' : 'text-slate-400'
            }`}>
                {isFrenzyActive ? <Zap className="animate-spin text-orange-400" size={14} /> : <Hammer size={14} />}
                {isFrenzyActive ? 'Modo Frenesi Ativo!' : 'Mineração Ativa'}
            </h3>

            <div className="relative group cursor-pointer my-1" onClick={clickRock}>
                {isFrenzyActive && (
                    <div className="absolute inset-0 rounded-full bg-orange-500/20 filter blur-xl animate-ping" />
                )}
                <div className={`text-6xl transition-transform duration-75 select-none ${
                    animating 
                        ? 'scale-90 rotate-2' 
                        : isFrenzyActive 
                            ? 'hover:scale-105 animate-bounce' 
                            : 'hover:scale-105'
                }`}>
                    🪨
                </div>
            </div>

            {/* Health Bar */}
            <div className="w-full">
                <div className="flex justify-between text-[9px] text-gray-500 mb-1 font-mono uppercase">
                    <span>Resistência da Rocha</span>
                    <span>{hp} / {maxHp}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div
                        className={`h-full transition-all duration-75 ${
                            isFrenzyActive 
                                ? 'bg-gradient-to-r from-red-600 to-orange-500' 
                                : 'bg-gradient-to-r from-orange-850 to-stone-500'
                        }`}
                        style={{ width: `${(hp / maxHp) * 100}%` }}
                    />
                </div>
            </div>

            {/* Combo Bar */}
            <div className="w-full mt-1 border-t border-slate-800/60 pt-2">
                <div className="flex justify-between text-[9px] mb-1 font-mono uppercase">
                    <span className={isFrenzyActive ? 'text-orange-400 font-bold' : 'text-gray-400'}>
                        {isFrenzyActive ? 'Tempo Restante' : 'Combo Multiplicador'}
                    </span>
                    <span className={isFrenzyActive ? 'text-orange-400 font-bold' : 'text-slate-300'}>
                        {isFrenzyActive ? `${frenzyTimeLeft}s` : `${combo}%`}
                    </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded overflow-hidden border border-slate-800">
                    <div
                        className={`h-full transition-all duration-300 ${
                            isFrenzyActive 
                                ? 'bg-orange-500 animate-pulse' 
                                : 'bg-purple-650'
                        }`}
                        style={{ width: `${isFrenzyActive ? (frenzyTimeLeft / 15) * 100 : combo}%` }}
                    />
                </div>
                {!isFrenzyActive && (
                    <div className="text-[8px] text-gray-550 mt-1 font-mono text-center">
                        {hasComboBoost ? '⚡ Pulso Cinético: +10% Combo/click' : 'Clique rápido para carregar Frenesi!'}
                    </div>
                )}
            </div>
        </div>
    );
}
