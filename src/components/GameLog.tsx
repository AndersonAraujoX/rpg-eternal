import React, { useRef, useEffect } from 'react';
import type { Log } from '../engine/types';

interface GameLogProps {
    logs: Log[];
    onShowHistory: () => void;
}

export const GameLog: React.FC<GameLogProps> = ({ logs, onShowHistory }) => {
    const logRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

    return (
        <div className="h-32 bg-black border-t-4 border-gray-600 p-2 text-[10px] md:text-xs text-green-400 font-mono leading-relaxed relative flex flex-col">
            <button onClick={onShowHistory} className="absolute top-1 right-2 text-gray-500 hover:text-white text-[10px] uppercase font-bold z-10 bg-gray-900 px-1 border border-gray-700">History</button>
            <div ref={logRef} className="overflow-y-auto custom-scroll flex-1">
                {logs.slice(-10).map(log => (
                    <div key={log.id} style={{ color: log.type === 'damage' ? '#f87171' : log.type === 'heal' ? '#4ade80' : log.type === 'death' ? '#fbbf24' : log.type === 'achievement' ? '#fcd34d' : '#9ca3af' }}>{'>'} {log.message}</div>
                ))}
            </div>
        </div>
    );
};
