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
                <h2 className="text-yellow-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Book /> ADVENTURER'S GUIDE</h2>

                <div className="flex gap-2 mb-4 justify-center">
                    <button onClick={() => setTab('basics')} className={`px-4 py-2 rounded ${tab === 'basics' ? 'bg-yellow-600' : 'bg-gray-700'}`}>Basics</button>
                    <button onClick={() => setTab('advanced')} className={`px-4 py-2 rounded ${tab === 'advanced' ? 'bg-yellow-600' : 'bg-gray-700'}`}>Advanced</button>
                    <button onClick={() => setTab('automation')} className={`px-4 py-2 rounded ${tab === 'automation' ? 'bg-yellow-600' : 'bg-gray-700'}`}>Automation</button>
                </div>

                <div className="flex-1 overflow-y-auto text-gray-300 space-y-4 pr-2">
                    {tab === 'basics' && (
                        <>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1">Starting Out</h3>
                            <p>Your goal is to defeat Bosses and climb Levels. Heroes fight automatically.</p>
                            <p>Spend <strong className="text-yellow-400">Gold</strong> to Summon new heroes at the Tavern.</p>
                            <p>Collect <strong className="text-purple-400">Souls</strong> by defeating enemies. Spend Souls in the Shop (Ghost Icon) to buy Talents.</p>
                        </>
                    )}
                    {tab === 'advanced' && (
                        <>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1">Ascension & Divinity</h3>
                            <p>Reset your progress to gain <strong className="text-cyan-400">Divinity</strong>. Divinity increases all damage exponentially.</p>
                            <p>Use Divinity to unlock Constellations in the Star Chart.</p>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1 mt-4">The Forge</h3>
                            <p>Assign heroes to Mining to collect ore. Use ore to upgrade equipment slots permanently.</p>
                        </>
                    )}
                    {tab === 'automation' && (
                        <>
                            <h3 className="text-white font-bold text-lg border-b border-gray-600 pb-1">Starlight Automation</h3>
                            <p>Unlock powerful automation upgrades in the Starlight Menu (Gear/Settings Icon).</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Scanner Bot:</strong> Auto-equips better items.</li>
                                <li><strong>Auto-Tavern:</strong> Hires heroes when affordable.</li>
                                <li><strong>Lazarus Protocol:</strong> Auto-revives dead heroes.</li>
                                <li><strong>Quest Master:</strong> Auto-claims quests.</li>
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
