
import { useState } from 'react';
import { Dices } from 'lucide-react';

interface DiceGameProps {
    gold: number;
    onWin: (amount: number) => void;
    onLose: (amount: number) => void;
}

export function DiceGame({ gold, onWin, onLose }: DiceGameProps) {
    const [bet, setBet] = useState(10);
    const [dice, setDice] = useState([1, 1]);
    const [rolling, setRolling] = useState(false);
    const [message, setMessage] = useState("Role > 7 para Vencer (2x)!");

    const rollDice = () => {
        if (gold < bet) {
            setMessage("Ouro insuficiente!");
            return;
        }
        if (rolling) return;

        setRolling(true);
        setMessage("Rolando...");

        // Visual effect
        let rolls = 0;
        const interval = setInterval(() => {
            setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                finishRoll();
            }
        }, 100);
    };

    const finishRoll = () => {
        const d1 = Math.ceil(Math.random() * 6);
        const d2 = Math.ceil(Math.random() * 6);
        setDice([d1, d2]);
        setRolling(false);

        const sum = d1 + d2;
        if (sum > 7) {
            setMessage(`Você tirou ${sum}! Você Vencer! (+${bet})`);
            onWin(bet);
        } else if (sum === 7) {
            setMessage(`Você tirou 7! Empate (Ouro devolvido)`);
            // No win, no lose
        } else {
            setMessage(`Você tirou ${sum}. Você Perdeu. (-${bet})`);
            onLose(bet);
        }
    };

    return (
        <div className="bg-black/40 p-4 rounded border border-amber-900/50 flex flex-col items-center gap-3">
            <h3 className="text-amber-500 font-bold flex items-center gap-2"><Dices size={16} /> Dados de Alto Risco</h3>

            <div className="flex gap-4 my-2">
                <div className={`w-12 h-12 bg-white rounded flex items-center justify-center text-2xl text-black font-bold shadow-lg ${rolling ? 'animate-bounce' : ''}`}>{dice[0]}</div>
                <div className={`w-12 h-12 bg-white rounded flex items-center justify-center text-2xl text-black font-bold shadow-lg ${rolling ? 'animate-bounce delay-75' : ''}`}>{dice[1]}</div>
            </div>

            <div className="text-sm font-mono h-6 text-yellow-300">{message}</div>

            <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400">Aposta:</span>
                <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-center"
                    min="1"
                    max={gold}
                />
                <button
                    onClick={rollDice}
                    disabled={rolling || gold < bet}
                    className="btn-retro bg-amber-600 text-white px-4 py-1 rounded disabled:opacity-50 hover:bg-amber-500"
                >
                    ROLAR
                </button>
            </div>
        </div>
    );
}
