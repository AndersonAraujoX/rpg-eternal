import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../hooks/useGame';

interface CombatLogProps {
    logs: LogEntry[];
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="pixel-border" style={{
            height: '150px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '10px',
            overflowY: 'auto',
            marginBottom: '20px',
            fontSize: '0.8rem',
            lineHeight: '1.5'
        }}>
            {logs.map((log) => (
                <div key={log.id} style={{
                    color: log.type === 'damage' ? '#ff6666' :
                        log.type === 'heal' ? '#66ff66' :
                            log.type === 'death' ? '#ff0000' : '#cccccc'
                }}>
                    {'>'} {log.message}
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};
