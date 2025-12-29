import { useState } from 'react';
import { X, Heart, Sparkles, Dna } from 'lucide-react';
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
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl w-full max-w-4xl p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
                    <Dna className="w-8 h-8" />
                    Genetic Fusion Lab
                </h2>

                <div className="grid grid-cols-3 gap-8">
                    {/* Parent Selection */}
                    <div className="col-span-1 space-y-4">
                        <h3 className="font-bold text-gray-300">Select Parents</h3>
                        <div className="h-96 overflow-y-auto space-y-2 pr-2">
                            {pets.filter(p => !p.isDead).map(pet => (
                                <div
                                    key={pet.id}
                                    onClick={() => handleSelect(pet)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3
                                        ${parent1?.id === pet.id || parent2?.id === pet.id ? 'bg-purple-900/50 border-purple-500' : 'bg-gray-800 border-gray-700 hover:border-purple-500/50'}
                                    `}
                                >
                                    <span className="text-2xl">{pet.emoji}</span>
                                    <div>
                                        <div className="font-bold text-sm">{pet.name}</div>
                                        <div className="text-xs text-gray-400">Lvl {pet.level} • {pet.rarity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Breeding Chamber */}
                    <div className="col-span-2 flex flex-col items-center justify-center bg-gray-950/50 rounded-xl p-8 border border-gray-800 relative overflow-hidden">

                        <div className="flex items-center gap-8 mb-8 z-10">
                            {/* Parent 1 Slot */}
                            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl relative
                                ${parent1 ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 border-dashed'}
                            `}>
                                {parent1?.emoji || <div className="text-sm text-gray-500">Parent 1</div>}
                                {parent1 && <button onClick={() => setParent1(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X className="w-3 h-3" /></button>}
                            </div>

                            <Heart className="w-8 h-8 text-pink-500 animate-pulse" />

                            {/* Parent 2 Slot */}
                            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl relative
                                ${parent2 ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 border-dashed'}
                            `}>
                                {parent2?.emoji || <div className="text-sm text-gray-500">Parent 2</div>}
                                {parent2 && <button onClick={() => setParent2(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X className="w-3 h-3" /></button>}
                            </div>
                        </div>

                        {/* Result Preview */}
                        {preview && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="absolute inset-0 bg-purple-500/10 animate-pulse-slow" />
                            </div>
                        )}

                        {preview && (
                            <div className="bg-gray-900 p-4 rounded-lg border border-purple-500/50 text-center w-64 z-10">
                                <div className="text-xs text-purple-400 uppercase tracking-widest mb-1">Predicted Outcome</div>
                                <div className="text-3xl mb-2">{preview.emoji}</div>
                                <div className="font-bold text-lg text-white mb-2">{preview.name}</div>
                                <div className="space-y-1 text-xs text-gray-300">
                                    <div className="flex justify-between"><span>Attack</span> <span className="text-green-400">{preview.stats.attack}</span></div>
                                    <div className="flex justify-between"><span>Defense</span> <span className="text-green-400">{preview.stats.defense}</span></div>
                                    <div className="flex justify-between"><span>HP</span> <span className="text-green-400">{preview.stats.hp}</span></div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 z-10">
                            <button
                                onClick={handleBreed}
                                disabled={!canBreed}
                                className={`px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 transition-all
                                    ${canBreed
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-lg shadow-purple-500/50 text-white'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                <Sparkles className="w-5 h-5" />
                                {canBreed ? `FUSE (Cost: ${breedingCost}g)` : 'Select Parents'}
                            </button>
                            {gold < breedingCost && parent1 && parent2 && (
                                <div className="text-red-400 text-xs mt-2 text-center">Insufficient Gold</div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
