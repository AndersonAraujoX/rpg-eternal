import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../../engine/types';
import { Scroll } from 'lucide-react';

interface LogModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: LogEntry[];
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, logs }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [isOpen, logs]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-gray-900 border-4 border-gray-600 w-full max-w-lg h-[80vh] p-4 rounded-lg flex flex-col relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold hover:text-red-500">X</button>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Scroll size={20} /> COMBAT LOG HISTORY
                </h2>

                <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 p-2 bg-black rounded border border-gray-700">
                    {logs.map((log) => (
                        <div key={log.id} className={`${log.type === 'damage' ? 'text-red-400' :
                            log.type === 'heal' ? 'text-green-400' :
                                log.type === 'death' ? 'text-gray-500' :
                                    log.type === 'craft' ? 'text-amber-400' :
                                        log.type === 'achievement' ? 'text-yellow-300 font-bold' :
                                            'text-gray-300'
                            }`}>
                            <span className="opacity-50 text-[10px] mr-2">[{log.id.substring(2, 6)}]</span>
                            {log.message}
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>
            </div>
        </div>
    );
};
