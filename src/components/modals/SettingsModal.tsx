import React from 'react';
import { Settings, Download, Upload, RotateCcw } from 'lucide-react';
import type { GameActions } from '../../engine/types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    actions: GameActions;
    autoSellRarity: 'none' | 'common' | 'rare';
    theme: string;
    importString: string;
    setImportString: (value: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, actions, autoSellRarity, theme, importString, setImportString }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-gray-800 border-4 border-gray-500 w-full max-w-md p-6 rounded-lg text-center relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2"><Settings /> CONFIGURAÇÕES</h2>

                <div className="space-y-4">
                    <div className="bg-gray-700 p-2 rounded text-left">
                        <label className="text-xs text-gray-400 block mb-1">Tema da Interface</label>
                        <select
                            value={theme}
                            onChange={(e) => actions.setTheme(e.target.value)}
                            className="w-full bg-black text-white p-2 rounded border border-gray-600"
                        >
                            <option value="default">Padrão (Clássico)</option>
                            <option value="midnight">Meia-Noite (Azul)</option>
                            <option value="forest">Floresta (Verde)</option>
                            <option value="crimson">Carmesim (Vermelho)</option>
                            <option value="void">Vazio (Roxo)</option>
                        </select>
                    </div>

                    <div className="bg-gray-700 p-2 rounded text-left">
                        <label className="text-xs text-gray-400 block mb-1">Limite de Auto-Venda (Requer Auto-Carregador)</label>
                        <select
                            value={autoSellRarity}
                            onChange={(e) => actions.setAutoSellRarity(e.target.value as 'none' | 'common' | 'rare')}
                            className="w-full bg-black text-white p-2 rounded border border-gray-600"
                        >
                            <option value="none">Guardar Tudo</option>
                            <option value="common">Auto-Vender Comum</option>
                            <option value="rare">Auto-Vender Comum e Raro</option>
                        </select>
                    </div>

                    <button onClick={() => { navigator.clipboard.writeText(actions.exportSave()); alert("Progresso copiado para a área de transferência!"); }} className="btn-retro bg-blue-600 text-white w-full py-3 flex items-center justify-center gap-2">
                        <Download size={16} /> EXPORTAR PROGRESSO
                    </button>

                    <div className="flex gap-2">
                        <input type="text" placeholder="Cole o código de progresso..." className="bg-gray-900 border border-gray-600 text-white px-2 py-1 flex-1 rounded text-xs" value={importString} onChange={e => setImportString(e.target.value)} />
                        <button onClick={() => actions.importSave(importString)} className="btn-retro bg-green-600 text-white px-4 py-1 rounded flex items-center gap-1">
                            <Upload size={16} /> IMPORTAR
                        </button>
                    </div>

                    <button onClick={() => { if (confirm("Tem certeza? Isso apaga tudo.")) actions.resetSave(); }} className="btn-retro bg-red-600 text-white w-full py-2 flex items-center justify-center gap-2 mt-8 opacity-70 hover:opacity-100">
                        <RotateCcw size={16} /> RESETAR JOGO
                    </button>
                </div>
            </div>
        </div>
    );
};
