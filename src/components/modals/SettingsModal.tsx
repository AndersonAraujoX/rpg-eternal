import React from 'react';
import { Settings, Download, Upload, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    actions: any;
    importString: string;
    setImportString: (s: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, actions, importString, setImportString }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gray-800 border-4 border-gray-500 w-full max-w-md p-6 rounded-lg text-center relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2"><Settings /> SETTINGS</h2>

                <div className="space-y-4">
                    <button onClick={() => { navigator.clipboard.writeText(actions.exportSave()); alert("Save copied to clipboard!"); }} className="btn-retro bg-blue-600 text-white w-full py-3 flex items-center justify-center gap-2">
                        <Download size={16} /> EXPORT SAVE TO CLIPBOARD
                    </button>

                    <div className="flex gap-2">
                        <input type="text" placeholder="Paste Save String..." className="bg-gray-900 border border-gray-600 text-white px-2 py-1 flex-1 rounded text-xs" value={importString} onChange={e => setImportString(e.target.value)} />
                        <button onClick={() => actions.importSave(importString)} className="btn-retro bg-green-600 text-white px-4 py-1 rounded flex items-center gap-1">
                            <Upload size={16} /> IMPORT
                        </button>
                    </div>

                    <button onClick={() => { if (confirm("Are you sure? This wipes everything.")) actions.resetSave(); }} className="btn-retro bg-red-600 text-white w-full py-2 flex items-center justify-center gap-2 mt-8 opacity-70 hover:opacity-100">
                        <RotateCcw size={16} /> HARD RESET
                    </button>
                </div>
            </div>
        </div>
    );
};
