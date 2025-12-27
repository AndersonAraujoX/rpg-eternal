import React, { useRef, useEffect } from 'react';
import type { Log } from '../engine/types';

interface GameLogProps {
    logs: Log[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
    const logRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

    return (
        <div ref={logRef} className="h-32 bg-black border-t-4 border-gray-600 p-2 text-[10px] md:text-xs text-green-400 overflow-y-auto font-mono leading-relaxed custom-scroll">
            {logs.map(log => (
                <div key={log.id} style={{ color: log.type === 'damage' ? '#f87171' : log.type === 'heal' ? '#4ade80' : log.type === 'death' ? '#fbbf24' : '#9ca3af' }}>{'>'} {log.message}</div>
            ))}
        </div>
    );
};
