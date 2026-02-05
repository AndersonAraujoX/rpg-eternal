import React, { useEffect } from 'react';
import { Shield, Grid, Footprints, Skull, Archive, AlertTriangle, DoorOpen, Lock, Key } from 'lucide-react';
import type { DungeonState } from '../../engine/dungeon';


interface DungeonModalProps {
    dungeon: DungeonState | null;
    onMove: (dx: number, dy: number) => void;
    onDescend: () => void;
    onExit: () => void;
    onOpenMastery: () => void;
}

export const DungeonModal: React.FC<DungeonModalProps> = ({ dungeon, onMove, onDescend, onExit, onOpenMastery }) => {
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
                    {/* Key Display */}
                    <div className="flex gap-2 bg-slate-800 px-3 py-1 rounded border border-slate-700">
                        {Object.entries(dungeon.keys || {}).map(([element, count]) => (
                            count > 0 && (
                                <span key={element} className="text-xs flex items-center gap-1 font-mono" style={{ color: element === 'fire' ? '#f87171' : element === 'water' ? '#60a5fa' : '#a3e635' }}>
                                    <Key size={14} /> {count}
                                </span>
                            )
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onOpenMastery} className="bg-yellow-600 px-3 py-1 rounded text-white text-sm hover:bg-yellow-500 flex items-center gap-1">
                            <Grid size={16} /> Mastery
                        </button>
                        {/* Always show Descend for testing, later condition on Boss kill */}
                        <button onClick={onDescend} className="bg-purple-700 px-3 py-1 rounded text-white text-sm hover:bg-purple-600 flex items-center gap-1">
                            <Footprints size={16} /> Descend
                        </button>
                        <button onClick={onExit} className="bg-red-900 px-3 py-1 rounded text-white text-sm hover:bg-red-800">Forfeit</button>
                    </div>
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
                                if (cell === 'boss') content = <div className="text-purple-500 animate-pulse"><Skull size={28} /></div>;
                                if (cell === 'trap') content = <AlertTriangle size={20} className="text-orange-500 opacity-50" />;
                                if (cell === 'exit') content = <DoorOpen size={24} className="text-yellow-200" />;
                                if (typeof cell === 'string' && cell.startsWith('lock_')) {
                                    const el = cell.split('_')[1];
                                    let color = 'text-gray-400';
                                    if (el === 'fire') color = 'text-red-500';
                                    if (el === 'water') color = 'text-blue-400';
                                    if (el === 'nature') color = 'text-green-500';
                                    if (el === 'earth') color = 'text-amber-700';
                                    if (el === 'air') color = 'text-sky-200';
                                    if (el === 'light') color = 'text-yellow-200';
                                    if (el === 'dark') color = 'text-purple-900';
                                    content = <Lock size={20} className={color} />;
                                    bgClass = 'bg-slate-800 border-2 border-slate-600'; // Make it look sturdy
                                }

                                if (typeof cell === 'string' && cell.startsWith('hazard_')) {
                                    const el = cell.split('_')[1];
                                    if (el === 'fire') {
                                        bgClass = 'bg-red-900/40 border border-red-500/30';
                                        content = <span className="text-red-500 text-xs font-bold animate-pulse">🔥</span>;
                                    }
                                    if (el === 'ice') {
                                        bgClass = 'bg-cyan-900/40 border border-cyan-500/30';
                                        content = <span className="text-cyan-300 text-xs font-bold">❄️</span>;
                                    }
                                    if (el === 'nature') {
                                        bgClass = 'bg-green-900/40 border border-green-500/30';
                                        content = <span className="text-green-500 text-xs font-bold">🌿</span>;
                                    }
                                    if (el === 'dark') {
                                        bgClass = 'bg-purple-900/40 border border-purple-500/30';
                                        content = <span className="text-purple-500 text-xs font-bold">👁️</span>;
                                    }
                                }
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
