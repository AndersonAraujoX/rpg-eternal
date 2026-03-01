import React, { useState } from 'react';
import { Book } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [tab, setTab] = useState<'basics' | 'advanced' | 'automation'>('basics');
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-yellow-500 w-full max-w-2xl h-[80vh] p-6 rounded-lg shadow-2xl relative flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold">X</button>
                <h2 className="text-yellow-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Book /> GUIA DO AVENTUREIRO</h2>

                <div className="flex gap-2 mb-4 justify-center">
                    <button onClick={() => setTab('basics')} className={`px-4 py-2 rounded ${tab === 'basics' ? 'bg-yellow-600' : 'bg-gray-700'}`}>Básico</button>
                    <button onClick={() => setTab('advanced')} className={`px-4 py-2 rounded ${tab === 'advanced' ? 'bg-yellow-600' : 'bg-gray-700'}`}>Avançado</button>
                    <button onClick={() => setTab('automation')} className={`px-4 py-2 rounded ${tab === 'automation' ? 'bg-yellow-600' : 'bg-gray-700'}`}>Automação</button>
                </div>

                <div className="flex-1 overflow-y-auto text-gray-300 space-y-4 pr-2">
                    {tab === 'basics' && (
                        <>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1">Começando</h3>
                            <p>Seu objetivo é derrotar Chefes e subir de Nível. Os heróis lutam automaticamente.</p>
                            <p>Gaste <strong className="text-yellow-400">Ouro</strong> para Invocar novos heróis na Taverna.</p>
                            <p>Colete <strong className="text-purple-400">Almas</strong> derrotando inimigos. Gaste Almas na Loja (Ícone de Fantasma) para comprar Talentos.</p>
                        </>
                    )}
                    {tab === 'advanced' && (
                        <>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1">Ascensão e Divindade</h3>
                            <p>Reinicie seu progresso para ganhar <strong className="text-cyan-400">Divindade</strong>. A Divindade aumenta todo o dano exponencialmente.</p>
                            <p>Use Divindade para desbloquear Constelações no Mapa Estelar.</p>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1 mt-4">A Forja</h3>
                            <p>Atribua heróis à Mineração para coletar minério. Use minério para melhorar permanentemente os slots de equipamento.</p>
                        </>
                    )}
                    {tab === 'automation' && (
                        <>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1">Automação de Luz Estelar</h3>
                            <p>Desbloqueie poderosas automações no Menu de Luz Estelar (Ícone de Engrenagem/Configurações).</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Scanner Bot:</strong> Equipa automaticamente itens melhores.</li>
                                <li><strong>Auto-Taverna:</strong> Contrata heróis quando acessível.</li>
                                <li><strong>Protocolo Lázaro:</strong> Revive automaticamente heróis mortos.</li>
                                <li><strong>Mestre de Missões:</strong> Reivindica missões automaticamente.</li>
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
