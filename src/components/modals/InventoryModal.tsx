import React from 'react';
import { Briefcase } from 'lucide-react';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-slate-500 w-full max-w-lg p-6 rounded-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-slate-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Briefcase /> INVENTORY</h2>
                <div className="grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
                    {/* Placeholder Items */}
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-12 h-12 bg-slate-800 border border-slate-600 rounded flex items-center justify-center">
                            {i < 3 ? '⚔️' : ''}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
