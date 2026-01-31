import React, { useState } from 'react';
import { Shield, Sword, Gem } from 'lucide-react';
import type { Hero, Item } from '../../engine/types';
import { ITEM_SETS } from '../../engine/sets';

interface HeroGearModalProps {
    hero: Hero;
    isOpen: boolean;
    onClose: () => void;
    inventory: Item[];
    onEquip: (heroId: string, item: Item) => void;
    onUnequip: (heroId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
}

export const HeroGearModal: React.FC<HeroGearModalProps> = ({ hero, isOpen, onClose, inventory, onEquip, onUnequip }) => {
    const [selectedSlot, setSelectedSlot] = useState<'weapon' | 'armor' | 'accessory' | null>(null);

    if (!isOpen) return null;

    const getSlotIcon = (slot: string) => {
        if (slot === 'weapon') return <Sword size={24} />;
        if (slot === 'armor') return <Shield size={24} />;
        return <Gem size={24} />;
    };

    const renderSlot = (slot: 'weapon' | 'armor' | 'accessory', label: string) => {
        const item = hero.equipment[slot];
        return (
            <div className="flex flex-col items-center">
                <div className="text-gray-400 text-sm mb-1">{label}</div>
                <div
                    onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                    className={`w-20 h-20 border-2 rounded-lg flex items-center justify-center cursor-pointer relative
                        ${selectedSlot === slot ? 'border-yellow-400 bg-slate-800' : 'border-slate-600 bg-slate-900'}
                        ${item ? 'border-blue-500' : ''}
                    `}
                >
                    {item ? (
                        <div className="text-center">
                            <div className="text-2xl">{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '💍'}</div>
                            <div className="text-[10px] truncate w-16 px-1">{item.name}</div>
                        </div>
                    ) : (
                        <div className="opacity-30">{getSlotIcon(slot)}</div>
                    )}

                    {item && selectedSlot === slot && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onUnequip(hero.id, slot); setSelectedSlot(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                        >
                            x
                        </button>
                    )}
                </div>
                {item && (
                    <div className="text-xs text-green-400 mt-1">+{item.value} {item.stat}</div>
                )}
            </div>
        );
    };

    const eligibleItems = selectedSlot
        ? inventory.filter(i => (i.slot === selectedSlot) || (!i.slot && i.type === selectedSlot))
        : [];

    // Calculate Active Sets
    const activeSets = new Map<string, number>();
    Object.values(hero.equipment).forEach(i => {
        if (i?.setId) activeSets.set(i.setId, (activeSets.get(i.setId) || 0) + 1);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl p-6 rounded-xl shadow-2xl flex gap-6">

                {/* Left: Hero Stats & Slots */}
                <div className="w-1/2 flex flex-col gap-6">
                    <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                        <div className="text-4xl">{hero.emoji}</div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{hero.name}</h2>
                            <div className="text-slate-400">Lvl {hero.level} {hero.class}</div>
                        </div>
                    </div>

                    <div className="flex justify-between px-4">
                        {renderSlot('weapon', 'Weapon')}
                        {renderSlot('armor', 'Armor')}
                        {renderSlot('accessory', 'Accessory')}
                    </div>

                    <div className="bg-slate-800 p-4 rounded-lg">
                        <h3 className="font-bold text-yellow-400 mb-2">Active Bonuses</h3>
                        {Array.from(activeSets.entries()).map(([setId, count]) => {
                            const set = ITEM_SETS.find(s => s.id === setId);
                            if (!set) return null;
                            const isActive = count >= set.requiredPieces;
                            return (
                                <div key={setId} className={`text-sm ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                    {set.name} ({count}/{set.requiredPieces}): +{set.bonusValue * 100}% {set.bonusStat}
                                </div>
                            );
                        })}
                        {activeSets.size === 0 && <div className="text-gray-500 italic">No set bonuses active.</div>}
                    </div>
                </div>

                {/* Right: Inventory Selection */}
                <div className="w-1/2 border-l border-slate-700 pl-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">
                            {selectedSlot ? `Select ${selectedSlot}` : 'Select a Slot'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
                    </div>

                    {selectedSlot ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-3 gap-2 content-start">
                            {eligibleItems.length > 0 ? eligibleItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => onEquip(hero.id, item)}
                                    className={`
                                        bg-slate-800 border border-slate-600 p-2 rounded cursor-pointer hover:border-white transition-colors relative
                                        ${item.setId ? 'border-purple-500' : ''}
                                    `}
                                >
                                    <div className="text-2xl text-center mb-1">{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '💍'}</div>
                                    <div className={`text-xs font-bold text-center truncate ${item.setId ? 'text-purple-300' : 'text-white'}`}>
                                        {item.name}
                                    </div>
                                    <div className="text-[10px] text-green-400 text-center">+{item.value} {item.stat}</div>
                                    {item.setId && <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full"></div>}
                                </div>
                            )) : (
                                <div className="col-span-3 text-center text-gray-500 mt-10">No items for this slot.</div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                            Click a slot on the left to equip items.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
