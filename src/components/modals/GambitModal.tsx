import React, { useState } from 'react';
import { Brain, Save, Trash2, PlusCircle, Pencil } from 'lucide-react';
import type { Hero, Gambit, GambitCondition, GambitAction } from '../../engine/types';

interface GambitModalProps {
    isOpen: boolean;
    onClose: () => void;
    hero: Hero | null;
    actions: any;
}

const CONDITIONS: { value: GambitCondition; label: string }[] = [
    { value: 'always', label: 'Always' },
    { value: 'hp<50', label: 'Self HP < 50%' },
    { value: 'hp<30', label: 'Self HP < 30%' },
    { value: 'ally_hp<50', label: 'Ally HP < 50%' },
    { value: 'enemy_boss', label: 'Enemy is Boss' },
];

const ACTIONS: { value: GambitAction; label: string }[] = [
    { value: 'attack', label: 'Attack' },
    { value: 'strong_attack', label: 'Strong Attack' },
    { value: 'heal', label: 'Heal' },
    { value: 'defend', label: 'Defend' },
];

export const GambitModal: React.FC<GambitModalProps> = ({ isOpen, onClose, hero, actions }) => {
    if (!isOpen || !hero) return null;

    const [gambits, setGambits] = useState<Gambit[]>(hero.gambits || []);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(hero.name);

    const handleRename = () => {
        if (newName.trim()) {
            actions.renameHero(hero.id, newName);
            setIsRenaming(false);
        }
    };

    const addGambit = () => {
        if (gambits.length >= 3) return;
        setGambits([...gambits, { id: Math.random().toString(), condition: 'always', action: 'attack' }]);
    };

    const removeGambit = (index: number) => {
        const newG = [...gambits];
        newG.splice(index, 1);
        setGambits(newG);
    };

    const updateGambit = (index: number, field: keyof Gambit, value: string) => {
        const newG = [...gambits];
        newG[index] = { ...newG[index], [field]: value };
        setGambits(newG);
    };

    const handleSave = () => {
        actions.updateGambits(hero.id, gambits);
        onClose();
    };
    //...
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-cyan-500 w-full max-w-lg p-6 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-cyan-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                    <Brain />
                    {isRenaming ? (
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            autoFocus
                            className="bg-black text-white px-2 py-1 rounded border border-cyan-500 text-lg w-40"
                        />
                    ) : (
                        <button onClick={() => setIsRenaming(true)} className="flex items-center gap-2 hover:text-white border-b border-dashed border-gray-600">
                            {hero.name} <Pencil size={16} className="opacity-50" />
                        </button>
                    )}
                </h2>

                <div className="space-y-4 mb-6">
                    {gambits.map((g, i) => (
                        <div key={g.id} className="flex items-center gap-2 bg-slate-800 p-2 rounded border border-slate-600">
                            <span className="text-gray-400 font-bold w-6">{i + 1}.</span>
                            <div className="flex-1 flex gap-2">
                                <span className="text-xs text-gray-500 self-center">IF</span>
                                <select
                                    className="bg-black text-cyan-300 border border-slate-600 rounded px-2 py-1 text-xs flex-1"
                                    value={g.condition}
                                    onChange={(e) => updateGambit(i, 'condition', e.target.value)}
                                >
                                    {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <span className="text-xs text-gray-500 self-center">THEN</span>
                                <select
                                    className="bg-black text-orange-300 border border-slate-600 rounded px-2 py-1 text-xs flex-1"
                                    value={g.action}
                                    onChange={(e) => updateGambit(i, 'action', e.target.value)}
                                >
                                    {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                            </div>
                            <button onClick={() => removeGambit(i)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                    ))}
                    {gambits.length < 3 && (
                        <button onClick={addGambit} className="w-full py-2 border border-dashed border-gray-600 text-gray-400 rounded hover:text-white hover:border-gray-400 flex items-center justify-center gap-2">
                            <PlusCircle size={16} /> Add Gambit Slot
                        </button>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-cyan-700 text-white rounded font-bold hover:bg-cyan-600 flex items-center gap-2">
                        <Save size={16} /> SAVE TACTICS
                    </button>
                </div>
            </div>
        </div>
    );
};
