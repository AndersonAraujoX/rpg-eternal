import { useState, useRef } from 'react';
import type { Hero, Gambit, GambitCondition, GambitAction, GameActions } from '../../engine/types';
import { X, Plus, Move, Pointer } from 'lucide-react';

interface GambitEditorProps {
    hero: Hero;
    actions: GameActions;
    onClose: () => void;
}

const CONDITIONS: { value: GambitCondition; label: string }[] = [
    { value: 'always', label: 'Always' },
    { value: 'hp<50', label: 'Self HP < 50%' },
    { value: 'hp<30', label: 'Self HP < 30%' },
    { value: 'mp<50', label: 'Self MP < 50%' },
    { value: 'ally_hp<50', label: 'Ally HP < 50%' },
    { value: 'ally_dead', label: 'Ally is Dead' },
    { value: 'enemy_boss', label: 'Enemy is Boss' },
    { value: 'enemy_count>2', label: 'Enemy Count > 2' },
];

const ACTIONS: { value: GambitAction; label: string }[] = [
    { value: 'attack', label: 'Attack' },
    { value: 'strong_attack', label: 'Strong Attack' },
    { value: 'heal', label: 'Heal (Magic)' },
    { value: 'use_potion', label: 'Use Potion' },
    { value: 'revive', label: 'Revive Ally' },
];

export const GambitEditor: React.FC<GambitEditorProps> = ({ hero, actions, onClose }) => {
    const [draggingNode, setDraggingNode] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (id: string) => {
        setDraggingNode(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingNode || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 100; // Offset for half width
        const y = e.clientY - rect.top - 40;  // Offset for half height

        actions.moveGambit(hero.id, draggingNode, Math.max(0, x), Math.max(0, y));
    };

    const handleMouseUp = () => {
        setDraggingNode(null);
    };

    const addGambitNode = () => {
        const newGambit: Gambit = {
            id: Math.random().toString(),
            condition: 'always',
            action: 'attack',
            position: { x: 50, y: 50 + (hero.gambits.length * 120) }
        };
        actions.updateGambits(hero.id, [...hero.gambits, newGambit]);
    };

    const removeGambit = (id: string) => {
        actions.updateGambits(hero.id, hero.gambits.filter(g => g.id !== id));
    };

    const updateNode = (id: string, updates: Partial<Gambit>) => {
        actions.updateGambits(hero.id, hero.gambits.map(g => g.id === id ? { ...g, ...updates } : g));
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col font-sans">
            {/* Header */}
            <div className="h-16 border-b border-cyan-900/50 bg-slate-900 px-6 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center text-2xl">
                        {hero.emoji}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-cyan-400 leading-tight">Tactical Logic Editor</h2>
                        <p className="text-xs text-cyan-700 font-mono">Hero: {hero.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={addGambitNode}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={18} /> New Logic Node
                    </button>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                ref={canvasRef}
                className="flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#0891b2" />
                        </marker>
                    </defs>
                    {hero.gambits.map((g, i) => {
                        if (i === hero.gambits.length - 1) return null;
                        const next = hero.gambits[i + 1];
                        if (!g.position || !next.position) return null;

                        const x1 = g.position.x + 100;
                        const y1 = g.position.y + 100;
                        const x2 = next.position.x + 100;
                        const y2 = next.position.y;

                        return (
                            <path
                                key={`path-${g.id}`}
                                d={`M ${x1} ${y1} C ${x1} ${y1 + 40}, ${x2} ${y2 - 40}, ${x2} ${y2}`}
                                stroke="#0891b2"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="5,5"
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    })}
                </svg>

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 pointer-events-none space-y-1">
                    <p>● Drag headers to move nodes</p>
                    <p>● Logic flows from top node to bottom</p>
                    <p>● Max 6 logic nodes allowed</p>
                </div>

                {/* Nodes */}
                {hero.gambits.map((g, index) => {
                    const pos = g.position || { x: 50, y: 50 + (index * 120) };
                    return (
                        <div
                            key={g.id}
                            style={{ left: pos.x, top: pos.y, width: 200 }}
                            className={`absolute bg-slate-900 border-2 rounded-xl shadow-2xl transition-shadow overflow-hidden
                                ${draggingNode === g.id ? 'border-cyan-400 shadow-cyan-900/50 scale-105 z-10' : 'border-slate-800 hover:border-slate-700 z-0'}
                            `}
                        >
                            {/* Drag Header */}
                            <div
                                onMouseDown={() => handleMouseDown(g.id)}
                                className="h-8 bg-slate-800 flex items-center px-3 cursor-move group select-none"
                            >
                                <Move size={12} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                <span className="ml-2 text-[10px] uppercase font-black tracking-widest text-slate-500 group-hover:text-slate-300">
                                    Priority {index + 1}
                                </span>
                                <button
                                    onClick={() => removeGambit(g.id)}
                                    className="ml-auto text-slate-600 hover:text-red-400"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Node Content */}
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Condition</label>
                                    <select
                                        value={g.condition}
                                        onChange={(e) => updateNode(g.id, { condition: e.target.value as GambitCondition })}
                                        className="w-full bg-slate-950 text-cyan-300 border border-slate-800 rounded px-2 py-1.5 text-xs outline-none focus:border-cyan-500"
                                    >
                                        {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>

                                <div className="flex justify-center">
                                    <Pointer className="text-slate-700" size={12} />
                                </div>

                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Action</label>
                                    <select
                                        value={g.action}
                                        onChange={(e) => updateNode(g.id, { action: e.target.value as GambitAction })}
                                        className="w-full bg-slate-950 text-orange-400 border border-slate-800 rounded px-2 py-1.5 text-xs outline-none focus:border-orange-500"
                                    >
                                        {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Node Footer / Connection Point */}
                            <div className="h-1 bg-gradient-to-r from-cyan-600/50 via-cyan-400 to-cyan-600/50" />
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="h-12 bg-slate-900 border-t border-cyan-900/30 flex items-center justify-center text-[10px] font-mono text-cyan-900 uppercase tracking-[0.2em]">
                Neural Tactics Interface // V5.0
            </div>
        </div>
    );
};
