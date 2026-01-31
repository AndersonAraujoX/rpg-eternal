import React, { useEffect } from 'react';
import { Shield, Grid, Archive, AlertTriangle, DoorOpen, Skull } from 'lucide-react';
import type { DungeonState } from '../../engine/dungeon';


interface DungeonModalProps {
    dungeon: DungeonState | null;
    onMove: (dx: number, dy: number) => void;
    onExit: () => void;
}

export const DungeonModal: React.FC<DungeonModalProps> = ({ dungeon, onMove, onExit }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!dungeon) return;
            if (e.key === 'ArrowUp' || e.key === 'w') onMove(0, -1);
            if (e.key === 'ArrowDown' || e.key === 's') onMove(0, 1);
            if (e.key === 'ArrowLeft' || e.key === 'a') onMove(-1, 0);
            if (e.key === 'ArrowRight' || e.key === 'd') onMove(1, 0);
            if (e.key === 'Escape') onExit();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dungeon, onMove, onExit]);

    if (!dungeon || !dungeon.active) return null;

    const cellSize = 40; // Pixel size for cells

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 shadow-2xl relative max-w-full max-h-full overflow-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 text-slate-200">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Grid /> Dungeon Level {dungeon.level}
                    </h2>
                    <div className="text-sm text-slate-400">Use Arrows to Move | ESC to Exit</div>
                    <button onClick={onExit} className="bg-red-900 px-3 py-1 rounded text-white text-sm hover:bg-red-800">Forfeit</button>
                </div>

                {/* Grid */}
                <div
                    className="grid gap-[1px] bg-slate-800 border border-slate-700"
                    style={{
                        gridTemplateColumns: `repeat(${dungeon.width}, ${cellSize}px)`,
                        width: 'fit-content',
                        margin: '0 auto'
                    }}
                >
                    {dungeon.grid.map((row, y) => (
                        row.map((cell, x) => {
                            const isPlayer = dungeon.playerPos.x === x && dungeon.playerPos.y === y;
                            const isRevealed = dungeon.revealed[y][x];

                            // Render Content
                            let content = null;
                            let bgClass = 'bg-slate-900';

                            if (!isRevealed) {
                                bgClass = 'bg-black'; // Fog
                            } else {
                                if (cell === 'wall') bgClass = 'bg-slate-600';
                                else if (cell === 'empty') bgClass = 'bg-slate-800';
                                else if (cell === 'start') bgClass = 'bg-green-900/50';
                                else if (cell === 'exit') bgClass = 'bg-yellow-900/50';

                                if (cell === 'chest') content = <Archive size={20} className="text-yellow-400" />;
                                if (cell === 'enemy') content = <Skull size={20} className="text-red-500" />;
                                if (cell === 'trap') content = <AlertTriangle size={20} className="text-orange-500 opacity-50" />; // Traps visible? Maybe partial visibility logic later.
                                if (cell === 'exit') content = <DoorOpen size={24} className="text-yellow-200" />;
                            }

                            if (isPlayer) {
                                content = <div className="text-cyan-400 animate-pulse"><Shield size={24} /></div>; // Player Icon
                            }

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className={`w-[${cellSize}px] h-[${cellSize}px] flex items-center justify-center ${bgClass} transition-colors duration-200`}
                                    style={{ width: cellSize, height: cellSize }}
                                >
                                    {content}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>
        </div>
    );
};
