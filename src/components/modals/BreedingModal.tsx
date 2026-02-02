import { useState } from 'react';
import { X, Heart, Sparkles, Dna, Info } from 'lucide-react';
import type { Pet } from '../../engine/types';
import { calculateBreedingResult } from '../../engine/breeding';

interface BreedingModalProps {
    isOpen: boolean;
    onClose: () => void;
    pets: Pet[];
    breedPets: (p1: Pet, p2: Pet) => void;
    gold: number;
}

export function BreedingModal({ isOpen, onClose, pets, breedPets, gold }: BreedingModalProps) {
    const [parent1, setParent1] = useState<Pet | null>(null);
    const [parent2, setParent2] = useState<Pet | null>(null);

    if (!isOpen) return null;

    const breedingCost = 5000;
    const canBreed = parent1 && parent2 && parent1.id !== parent2.id && gold >= breedingCost;

    const handleSelect = (pet: Pet) => {
        if (!parent1) setParent1(pet);
        else if (!parent2 && pet.id !== parent1.id) setParent2(pet);
        else if (pet.id === parent1.id) setParent1(null);
        else if (pet.id === parent2?.id) setParent2(null);
    };

    const handleBreed = () => {
        if (canBreed) {
            breedPets(parent1!, parent2!);
            setParent1(null);
            setParent2(null);
            onClose();
        }
    };

    const preview = (parent1 && parent2) ? calculateBreedingResult(parent1, parent2) : null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl w-full max-w-5xl p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>

                <div className="mb-6 border-b border-gray-800 pb-4">
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-purple-400">
                        <Dna className="w-8 h-8 animate-pulse" />
                        Chimera Fusion Lab
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Fuse two pets to create a powerful Chimera. <span className="text-red-400 font-bold">WARNING: Parents will be consumed!</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-hidden">
                    {/* Parent Selection */}
                    <div className="col-span-1 flex flex-col min-h-0 bg-gray-950/30 rounded-lg p-4 border border-gray-800">
                        <h3 className="font-bold text-gray-300 mb-3 flex items-center gap-2"><Sparkles size={16} /> Select Specimens</h3>
                        <div className="overflow-y-auto space-y-2 pr-2 flex-1 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-gray-900">
                            {pets.filter(p => !p.isDead).map(pet => {
                                const isSelected = parent1?.id === pet.id || parent2?.id === pet.id;
                                const isChimera = pet.rarity === 'chimera';
                                return (
                                    <div
                                        key={pet.id}
                                        onClick={() => handleSelect(pet)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 group relative
                                            ${isSelected
                                                ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                                : 'bg-gray-800 border-gray-700 hover:border-purple-500/50 hover:bg-gray-750'}
                                        `}
                                    >
                                        <span className="text-3xl filter drop-shadow-lg">{pet.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold text-sm truncate ${isChimera ? 'text-purple-300' : 'text-gray-200'}`}>{pet.name}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold
                                                    ${pet.rarity === 'common' ? 'bg-gray-700 text-gray-300' :
                                                        pet.rarity === 'rare' ? 'bg-blue-900 text-blue-300' :
                                                            pet.rarity === 'epic' ? 'bg-purple-900 text-purple-300' :
                                                                pet.rarity === 'legendary' ? 'bg-orange-900 text-orange-300' :
                                                                    'bg-pink-900 text-pink-300 border border-pink-700'
                                                    }
                                                `}>{pet.rarity}</span>
                                                <span>Lvl {pet.level}</span>
                                            </div>
                                        </div>
                                        {isSelected && <div className="absolute right-2 top-2 w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Fusion Chamber */}
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center bg-gray-950 rounded-xl p-8 border border-gray-800 relative overflow-hidden">

                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50 pointer-events-none" />

                        <div className="flex items-center gap-8 mb-12 z-10 w-full justify-center">
                            {/* Parent 1 Slot */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl relative transition-all duration-300
                                    ${parent1
                                        ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105'
                                        : 'border-gray-800 bg-gray-900/50 border-dashed'}
                                `}>
                                    {parent1 ? (
                                        <>
                                            <span className="animate-bounce-slow">{parent1.emoji}</span>
                                            <button onClick={() => setParent1(null)} className="absolute -top-1 -right-1 bg-gray-800 hover:bg-red-500 text-gray-400 hover:text-white rounded-full p-1 border border-gray-600 transition-colors"><X size={14} /></button>
                                        </>
                                    ) : <span className="opacity-20 text-4xl">?</span>}
                                </div>
                                {parent1 && <div className="text-sm font-bold text-gray-300">{parent1.name}</div>}
                            </div>

                            <div className="flex flex-col items-center">
                                <Heart className={`w-10 h-10 ${canBreed ? 'text-pink-500 animate-pulse drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'text-gray-700'}`} />
                                <div className="h-px w-32 bg-gray-800 my-2 relative">
                                    {canBreed && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-shimmer" />}
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Fusion Node</span>
                            </div>

                            {/* Parent 2 Slot */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl relative transition-all duration-300
                                    ${parent2
                                        ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105'
                                        : 'border-gray-800 bg-gray-900/50 border-dashed'}
                                `}>
                                    {parent2 ? (
                                        <>
                                            <span className="animate-bounce-slow" style={{ animationDelay: '0.1s' }}>{parent2.emoji}</span>
                                            <button onClick={() => setParent2(null)} className="absolute -top-1 -right-1 bg-gray-800 hover:bg-red-500 text-gray-400 hover:text-white rounded-full p-1 border border-gray-600 transition-colors"><X size={14} /></button>
                                        </>
                                    ) : <span className="opacity-20 text-4xl">?</span>}
                                </div>
                                {parent2 && <div className="text-sm font-bold text-gray-300">{parent2.name}</div>}
                            </div>
                        </div>

                        {/* Result Preview */}
                        {preview ? (
                            <div className="relative z-10 -mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-gray-900/90 backdrop-blur border border-purple-500 p-6 rounded-2xl shadow-2xl relative w-80 text-center group">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg tracking-wider">
                                        Predicted Result
                                    </div>

                                    <div className="text-6xl mb-4 filter drop-shadow-2xl animate-pulse-slow">{preview.emoji}</div>
                                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">{preview.name}</h3>
                                    <div className="text-xs text-purple-300 mb-4 font-mono">{preview.bonus}</div>

                                    <div className="grid grid-cols-2 gap-2 text-left bg-gray-950 p-3 rounded border border-gray-800">
                                        <StatPreview label="Attack" val={preview.stats.attack} oldVal={Math.floor((parent1!.stats.attack + parent2!.stats.attack) / 2)} />
                                        <StatPreview label="HP" val={preview.stats.hp} oldVal={Math.floor((parent1!.stats.hp + parent2!.stats.hp) / 2)} />
                                        <StatPreview label="Speed" val={preview.stats.speed} oldVal={Math.floor((parent1!.stats.speed + parent2!.stats.speed) / 2)} />
                                        <StatPreview label="Defense" val={preview.stats.defense} oldVal={Math.floor((parent1!.stats.defense + parent2!.stats.defense) / 2)} />
                                    </div>

                                    <div className="mt-2 text-[10px] text-gray-500 italic">
                                        Stats are estimated based on fusion multiplier.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 flex flex-col items-center">
                                <Info size={48} className="mb-2 opacity-50" />
                                <p>Select two pets to preview fusion results.</p>
                            </div>
                        )}

                        <div className="mt-auto pt-8 z-10 w-full flex justify-center">
                            <button
                                onClick={handleBreed}
                                disabled={!canBreed}
                                className={`group relative px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all overflow-hidden
                                    ${canBreed
                                        ? 'bg-gradient-to-r from-purple-700 via-pink-700 to-purple-700 bg-size-200 hover:bg-pos-100 shadow-[0_0_30px_rgba(168,85,247,0.4)] text-white scale-105 hover:scale-110'
                                        : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'}
                                `}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <Sparkles className={`w-6 h-6 ${canBreed ? 'animate-spin-slow' : ''}`} />
                                <div className="flex flex-col items-start leading-tight">
                                    <span>{canBreed ? 'INITIATE FUSION' : 'Start Fusion'}</span>
                                    <span className="text-[10px] font-normal opacity-80">{breedingCost} Gold Cost</span>
                                </div>
                            </button>
                        </div>
                        {gold < breedingCost && parent1 && parent2 && (
                            <div className="text-red-400 text-sm font-bold mt-4 animate-pulse">Insufficient Resources: Need {breedingCost} Gold</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatPreview = ({ label, val, oldVal }: { label: string, val: number, oldVal: number }) => {
    const increase = val - oldVal;
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">{label}</span>
            <div className="flex items-center gap-1">
                <span className="text-gray-500 line-through text-[10px]">{oldVal}</span>
                <span className="text-green-400 font-bold">{val}</span>
                {increase > 0 && <span className="text-[9px] text-green-500">(+{increase})</span>}
            </div>
        </div>
    );
};
