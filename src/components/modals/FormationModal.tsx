import React, { useState } from 'react';
import type { Formation, Hero } from '../../engine/types';
import { Save, Trash2, Users } from 'lucide-react';

interface FormationModalProps {
    isOpen: boolean;
    onClose: () => void;
    formations: Formation[];
    saveFormation: (name: string) => void;
    loadFormation: (id: string) => void;
    deleteFormation: (id: string) => void;
    currentHeroes: Hero[];
}

export const FormationModal: React.FC<FormationModalProps> = ({
    isOpen, onClose, formations, saveFormation, loadFormation, deleteFormation, currentHeroes
}) => {
    const [newName, setNewName] = useState('');

    if (!isOpen) return null;

    const activeHeroes = currentHeroes.filter(h => h.assignment === 'combat');

    const handleSave = () => {
        if (!newName.trim()) return;
        saveFormation(newName);
        setNewName('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-yellow-600 rounded-lg p-6 max-w-md w-full relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" /> Tactical Formations
                </h2>

                {/* Save Current Section */}
                <div className="bg-gray-800 p-4 rounded mb-4 border border-gray-700">
                    <h3 className="text-sm font-bold text-gray-300 mb-2">Save Current Party ({activeHeroes.length})</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Formation Name..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-1 text-white focus:border-yellow-400 outline-none"
                        />
                        <button
                            onClick={handleSave}
                            disabled={!newName.trim() || activeHeroes.length === 0}
                            className="bg-yellow-700 hover:bg-yellow-600 disabled:opacity-50 text-white px-3 py-1 rounded flex items-center gap-1 font-bold text-sm"
                        >
                            <Save size={16} /> SAVE
                        </button>
                    </div>
                    <div className="flex gap-1 mt-2">
                        {activeHeroes.map(h => (
                            <span key={h.id} className="text-xl" title={h.name}>{h.emoji}</span>
                        ))}
                    </div>
                </div>

                {/* List Formations */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {formations.length === 0 && (
                        <div className="text-gray-500 text-center py-4 italic">No saved formations</div>
                    )}
                    {formations.map(f => (
                        <div key={f.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700 hover:border-gray-500 transition-colors">
                            <div>
                                <div className="font-bold text-gray-200">{f.name}</div>
                                <div className="text-xs text-gray-400">
                                    {f.heroIds.length} Heroes
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { loadFormation(f.id); onClose(); }}
                                    className="bg-blue-900 hover:bg-blue-700 text-blue-100 px-3 py-1 rounded text-xs font-bold"
                                >
                                    LOAD
                                </button>
                                <button
                                    onClick={() => deleteFormation(f.id)}
                                    className="text-red-400 hover:text-red-200 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
