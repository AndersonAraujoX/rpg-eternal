import React, { useState } from 'react';
import { Hammer, Zap, Gem, Sparkles, RefreshCw } from 'lucide-react';
import type { Item, Rune, Resources } from '../../engine/types';

interface RuneModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: Item[];
    resources: Resources;
    souls: number;
    actions: {
        craftRune: () => void;
        socketRune: (itemId: string, runeId: string) => void;
        combineRunes: (runeIds: string[]) => void;
    };
    runes: Rune[]; // Inventory runes
}

export const RuneModal: React.FC<RuneModalProps> = ({ isOpen, onClose, items, resources, souls, actions, runes }) => {
    const [activeTab, setActiveTab] = useState<'forge' | 'fusion'>('forge');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedRune, setSelectedRune] = useState<Rune | null>(null);
    
    // Fusion state
    const [selectedFusionRunes, setSelectedFusionRunes] = useState<string[]>([]);

    if (!isOpen) return null;

    const CRAFT_COST = { mithril: 10, souls: 50 };
    const canCraft = resources.mithril >= CRAFT_COST.mithril && souls >= CRAFT_COST.souls;

    const handleSelectFusionRune = (runeId: string) => {
        setSelectedFusionRunes(prev => {
            if (prev.includes(runeId)) {
                return prev.filter(id => id !== runeId);
            }
            if (prev.length >= 3) {
                return prev; // Max 3
            }
            return [...prev, runeId];
        });
    };

    // Calculate fusion logic details
    const selectedRunesData = runes.filter(r => selectedFusionRunes.includes(r.id));
    const isThreeSelected = selectedRunesData.length === 3;
    const sameRarity = isThreeSelected && 
        selectedRunesData[0].rarity === selectedRunesData[1].rarity && 
        selectedRunesData[1].rarity === selectedRunesData[2].rarity;
    const currentRarity = isThreeSelected ? selectedRunesData[0].rarity : null;
    const isFusible = sameRarity && (currentRarity === 'common' || currentRarity === 'rare' || currentRarity === 'epic');

    let nextRarity = '';
    if (isFusible) {
        if (currentRarity === 'common') nextRarity = 'rare';
        else if (currentRarity === 'rare') nextRarity = 'epic';
        else if (currentRarity === 'epic') nextRarity = 'legendary';
    }

    const FUSION_SOULS_COST = 50;
    const canFuse = isFusible && souls >= FUSION_SOULS_COST;

    const executeFusion = () => {
        if (canFuse) {
            actions.combineRunes(selectedFusionRunes);
            setSelectedFusionRunes([]); // Clear slots
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'text-orange-400 border-orange-500/50 bg-orange-950/20';
            case 'epic': return 'text-purple-400 border-purple-500/50 bg-purple-950/20';
            case 'rare': return 'text-blue-400 border-blue-500/50 bg-blue-950/20';
            default: return 'text-gray-300 border-gray-600/50 bg-gray-800/40';
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
            <div className="bg-slate-900 border-4 border-purple-500 w-full max-w-4xl p-6 rounded-lg shadow-2xl relative h-[620px] flex flex-col">
                <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold hover:text-red-500 z-10">X</button>

                {/* Tab Selectors */}
                <div className="flex gap-2 border-b border-gray-700 pb-3 mb-4">
                    <button
                        onClick={() => setActiveTab('forge')}
                        className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'forge' ? 'bg-purple-700 text-white shadow-lg' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                    >
                        <Hammer size={16} /> FORGE & BIND
                    </button>
                    <button
                        onClick={() => setActiveTab('fusion')}
                        className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'fusion' ? 'bg-indigo-700 text-white shadow-lg' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                    >
                        <Sparkles size={16} /> RUNE FUSION
                    </button>
                </div>

                {activeTab === 'forge' && (
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        {/* LEFT: CRAFTING */}
                        <div className="w-1/3 border-r border-gray-700 pr-4 flex flex-col">
                            <h2 className="text-purple-400 text-lg font-bold mb-4 flex items-center gap-2"><Hammer size={18} /> RUNE FORGE</h2>

                            <div className="flex-1 bg-slate-800 p-4 rounded mb-4 flex flex-col items-center justify-center text-center">
                                <Gem size={44} className="text-purple-300 mb-2 animate-pulse" />
                                <div className="text-gray-300 font-bold text-sm">Unstable Rune Core</div>
                                <div className="text-xs text-gray-500 mt-2">Random Rarity & Stat</div>
                            </div>

                            <div className="text-xs text-gray-400 mb-2">Cost: {CRAFT_COST.mithril} Mithril, {CRAFT_COST.souls} Souls</div>
                            <button
                                onClick={actions.craftRune}
                                disabled={!canCraft}
                                className={`w-full py-2 rounded font-bold border text-sm ${canCraft ? 'bg-purple-700 border-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'}`}
                            >
                                CRAFT RUNE
                            </button>

                            <h3 className="text-white font-bold mt-4 mb-2 text-sm">INVENTORY ({runes.length})</h3>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {runes.map(r => (
                                    <div
                                        key={r.id}
                                        onClick={() => setSelectedRune(r)}
                                        className={`p-2 rounded border cursor-pointer text-xs ${selectedRune?.id === r.id ? 'bg-purple-900 border-purple-400' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'}`}
                                    >
                                        <div className={`font-bold ${r.rarity === 'legendary' ? 'text-orange-400' : r.rarity === 'epic' ? 'text-purple-400' : r.rarity === 'rare' ? 'text-blue-400' : 'text-gray-300'}`}>
                                            {r.emoji} {r.name}
                                        </div>
                                        <div className="text-[10px] text-green-400">+{r.value} {r.stat}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: SOCKETING */}
                        <div className="w-2/3 flex flex-col">
                            <h2 className="text-blue-400 text-lg font-bold mb-4 flex items-center gap-2"><Zap size={18} /> RUNE BINDING</h2>

                            <div className="flex gap-4 h-full overflow-hidden">
                                {/* ITEM LIST */}
                                <div className="w-1/2 overflow-y-auto custom-scrollbar pr-2">
                                    <div className="text-gray-400 text-[10px] mb-2 uppercase tracking-wide">Select Item to Socket</div>
                                    {items.filter(i => i.rarity !== 'common').map(i => (
                                        <div
                                            key={i.id}
                                            onClick={() => setSelectedItem(i)}
                                            className={`p-2 mb-2 rounded border cursor-pointer text-xs ${selectedItem?.id === i.id ? 'bg-blue-900 border-blue-400' : 'bg-slate-800 border-slate-600 hover:bg-slate-700'} relative`}
                                        >
                                            <div className={`font-bold ${i.rarity === 'legendary' ? 'text-orange-400' : 'text-purple-400'}`}>{i.name}</div>
                                            <div className="text-[10px] text-gray-400">Sockets: {i.runes?.length || 0} / {i.sockets || 0}</div>
                                            <div className="flex gap-1 mt-1">
                                                {Array.from({ length: i.sockets || 0 }).map((_, idx) => (
                                                    <div key={idx} className={`w-2.5 h-2.5 rounded-full border ${i.runes?.[idx] ? 'bg-purple-500 border-purple-300' : 'bg-black border-gray-600'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* SOCKET ACTION */}
                                <div className="w-1/2 bg-slate-800 rounded p-4 border border-slate-600 flex flex-col items-center justify-between">
                                    {selectedItem ? (
                                        <>
                                            <div className="text-center w-full">
                                                <div className="text-md font-bold text-white mb-2">{selectedItem.name}</div>
                                                <div className="text-2xl mb-4">🛡️</div>

                                                <div className="w-full space-y-2 mb-4">
                                                    {Array.from({ length: selectedItem.sockets || 0 }).map((_, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 bg-black p-2 rounded border border-gray-700 text-xs">
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedItem.runes?.[idx] ? 'bg-purple-900 border-purple-500' : 'bg-gray-900 border-gray-600'}`}>
                                                                {selectedItem.runes?.[idx] ? <Gem size={10} className="text-purple-300" /> : null}
                                                            </div>
                                                            <span className="text-gray-300 truncate">
                                                                {selectedItem.runes?.[idx] ? `${selectedItem.runes[idx].emoji || '💎'} ${selectedItem.runes[idx].name} (+${selectedItem.runes[idx].value} ${selectedItem.runes[idx].stat})` : 'Empty Socket'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {(selectedItem.runes?.length || 0) < (selectedItem.sockets || 0) ? (
                                                <div className="w-full mt-auto">
                                                    <div className="text-xs text-center mb-2 text-gray-400">
                                                        {selectedRune ? `Socket ${selectedRune.name}?` : 'Select a Rune from Inventory'}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (selectedItem && selectedRune) {
                                                                actions.socketRune(selectedItem.id, selectedRune.id);
                                                                setSelectedRune(null);
                                                            }
                                                        }}
                                                        disabled={!selectedRune}
                                                        className={`w-full py-2 rounded font-bold text-sm ${selectedRune ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                                    >
                                                        BIND RUNE
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-red-400 font-bold text-xs mt-auto">NO EMPTY SOCKETS</div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-gray-500 italic mt-10 text-xs text-center">Select an item to view sockets</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'fusion' && (
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        {/* LEFT: INVENTORY SELECTOR */}
                        <div className="w-1/2 border-r border-gray-700 pr-4 flex flex-col h-full">
                            <h2 className="text-indigo-400 text-lg font-bold mb-2 flex items-center gap-2"><Sparkles size={18} /> RUNE LIST ({runes.length})</h2>
                            <p className="text-[10px] text-gray-400 mb-3">Select exactly 3 runes of the same rarity (Common, Rare, or Epic) to fuse them into a higher-tier rune.</p>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {runes.length === 0 ? (
                                    <div className="text-center text-xs text-gray-600 mt-10 italic">No runes available. Craft some in the Forge!</div>
                                ) : (
                                    runes.map(r => {
                                        const isSelected = selectedFusionRunes.includes(r.id);
                                        const rarityColor = getRarityColor(r.rarity);
                                        return (
                                            <div
                                                key={r.id}
                                                onClick={() => handleSelectFusionRune(r.id)}
                                                className={`p-2.5 rounded border cursor-pointer flex items-center justify-between text-xs transition-all ${
                                                    isSelected 
                                                        ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md' 
                                                        : 'border-slate-700 bg-slate-800/60 hover:bg-slate-850'
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-bold flex items-center gap-1">
                                                        <span>{r.emoji || '💎'}</span>
                                                        <span>{r.name}</span>
                                                    </div>
                                                    <div className="text-[10px] text-green-400 font-mono mt-0.5">+{r.value} {r.stat}</div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[8px] border uppercase font-mono tracking-wider font-bold ${rarityColor}`}>
                                                    {r.rarity}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* RIGHT: ALTAR OF FUSION */}
                        <div className="w-1/2 flex flex-col justify-between bg-slate-850/50 rounded-xl p-5 border border-slate-750">
                            <div className="text-center">
                                <h3 className="text-white text-md font-bold uppercase tracking-wider mb-6 flex items-center justify-center gap-2">
                                    <RefreshCw className="text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} size={16} /> ALTAR OF FUSION
                                </h3>

                                {/* 3 Slots + Upgraded Slot Graphic */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="flex justify-center gap-4 mb-6">
                                        {[0, 1, 2].map(idx => {
                                            const runeInSlot = selectedRunesData[idx];
                                            return (
                                                <div 
                                                    key={idx}
                                                    onClick={() => runeInSlot && handleSelectFusionRune(runeInSlot.id)}
                                                    className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                                        runeInSlot 
                                                            ? `border-indigo-400 bg-slate-900 text-white shadow-lg hover:border-red-500 hover:scale-95` 
                                                            : 'border-dashed border-gray-600 bg-slate-800 text-gray-500 hover:border-gray-500'
                                                    }`}
                                                    title={runeInSlot ? 'Click to remove' : 'Select a rune from the list'}
                                                >
                                                    {runeInSlot ? (
                                                        <>
                                                            <span className="text-lg">{runeInSlot.emoji}</span>
                                                            <span className="text-[8px] truncate max-w-[48px] font-mono tracking-tighter opacity-80">{runeInSlot.name.split(' ').pop()}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Arrow down */}
                                    <div className="text-indigo-400 text-lg font-bold mb-2 animate-bounce">⬇</div>

                                    {/* Result Slot */}
                                    <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shadow-xl ${
                                        isFusible 
                                            ? 'border-indigo-500 bg-slate-900 text-white shadow-indigo-500/25 animate-pulse' 
                                            : 'border-dashed border-gray-700 bg-slate-950 text-gray-600'
                                    }`}>
                                        {isFusible ? (
                                            <>
                                                <Sparkles className="text-indigo-400 text-xl" />
                                                <span className="text-[8px] font-mono tracking-wider font-bold uppercase mt-1 text-indigo-300">
                                                    {nextRarity} RUNE
                                                </span>
                                            </>
                                        ) : (
                                            <Gem size={28} className="opacity-20" />
                                        )}
                                    </div>
                                </div>

                                {/* Guidance / Warning Messages */}
                                <div className="h-12 flex flex-col items-center justify-center text-center px-4 bg-slate-900/60 rounded-lg border border-slate-800">
                                    {!isThreeSelected ? (
                                        <span className="text-xs text-gray-400">Select exactly <strong className="text-indigo-300">3 runes</strong> from the inventory list to begin.</span>
                                    ) : !sameRarity ? (
                                        <span className="text-xs text-red-400 font-bold">Rarity Mismatch! All 3 runes must be identical in rarity.</span>
                                    ) : !isFusible ? (
                                        <span className="text-xs text-orange-400 font-bold">Legendary runes cannot be fused further!</span>
                                    ) : (
                                        <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                                            Ready! Yields 1 random <span className="uppercase">{nextRarity}</span> Rune.
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="w-full mt-4">
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-1">
                                    <span>Cost: {FUSION_SOULS_COST} Souls</span>
                                    <span>Your Souls: {souls}</span>
                                </div>
                                <button
                                    onClick={executeFusion}
                                    disabled={!canFuse}
                                    className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 shadow-md ${
                                        canFuse 
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20 active:scale-95' 
                                            : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                                    }`}
                                >
                                    FUSE RUNES
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
