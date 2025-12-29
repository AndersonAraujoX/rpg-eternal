
import { useState } from 'react';
import { Hammer } from 'lucide-react';
import type { Resources } from '../../engine/types';

interface MiningClickerProps {
    resources: Resources;
    onMine: (resource: 'copper' | 'iron' | 'mithril', amount: number) => void;
}

export function MiningClicker({ onMine }: MiningClickerProps) {
    const [hp, setHp] = useState(10);
    const [maxHp, setMaxHp] = useState(10);
    const [animating, setAnimating] = useState(false);

    const clickRock = () => {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 100);

        setHp(prev => {
            const next = prev - 1;
            if (next <= 0) {
                // Ore Broken!
                distributeLoot();
                // const newMax = Math.min(50, maxHp + 2); // Rocks get harder? Or just reset? Let's just reset for now.
                setMaxHp(10); // Keep it snappy
                return 10;
            }
            return next;
        });
    };

    const distributeLoot = () => {
        // RNG based on nothing for now, mostly Copper
        const rand = Math.random();
        let type: 'copper' | 'iron' | 'mithril' = 'copper';
        let amount = 1;

        if (rand > 0.95) { type = 'mithril'; amount = 1; }
        else if (rand > 0.7) { type = 'iron'; amount = 2; }
        else { type = 'copper'; amount = 5; }

        onMine(type, amount);
    };

    return (
        <div className="bg-black/40 p-4 rounded border border-slate-700 flex flex-col items-center gap-3">
            <h3 className="text-slate-400 font-bold flex items-center gap-2"><Hammer size={16} /> Active Mining</h3>

            <div className="relative group cursor-pointer" onClick={clickRock}>
                <div className={`text-6xl transition-transform duration-75 select-none ${animating ? 'scale-90 rotate-2' : 'hover:scale-105'}`}>
                    🪨
                </div>
                {/* Floating particles could go here */}
            </div>

            {/* Health Bar */}
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div
                    className="h-full bg-gradient-to-r from-orange-800 to-stone-500 transition-all duration-75"
                    style={{ width: `${(hp / maxHp) * 100}%` }}
                />
            </div>
            <div className="text-[10px] text-gray-500">Click to break!</div>
        </div>
    );
}
