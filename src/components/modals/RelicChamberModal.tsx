import React from 'react';
import { Shield, Sparkles, X, Swords, Coins, Zap } from 'lucide-react';
import { CHAMBER_RELICS } from '../../engine/relics';
import type { ChamberRelic } from '../../engine/types';
import { formatNumber } from '../../utils';

interface RelicChamberModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedRelics: string[];
    equippedRelics: string[];
    gold: number;
    souls: number;
    voidMatter: number;
    actions: {
        buyRelic: (relicId: string) => void;
        equipRelic: (relicId: string, slotIndex: number) => void;
        unequipRelic: (slotIndex: number) => void;
    };
    unpurifiedRelics?: number;
    unlockedRiftPerks?: string[];
    purifyRelic?: () => void;
}

export const RelicChamberModal: React.FC<RelicChamberModalProps> = ({
    isOpen,
    onClose,
    ownedRelics = [],
    equippedRelics = [],
    gold,
    souls,
    voidMatter,
    actions,
    unpurifiedRelics = 0,
    unlockedRiftPerks = [],
    purifyRelic
}) => {
    if (!isOpen) return null;

    const isOwned = (relicId: string) => ownedRelics.includes(relicId);
    
    const getEquippedSlot = (relicId: string) => {
        const idx = equippedRelics.indexOf(relicId);
        return idx !== -1 ? idx : null;
    };

    const getCurrencyColor = (currency: ChamberRelic['currency']) => {
        if (currency === 'gold') return 'text-yellow-400';
        if (currency === 'souls') return 'text-purple-400';
        return 'text-indigo-400';
    };

    const getCurrencyLabel = (currency: ChamberRelic['currency']) => {
        if (currency === 'gold') return 'Ouro';
        if (currency === 'souls') return 'Almas';
        return 'Matéria do Vazio';
    };

    const hasEnoughCurrency = (relic: ChamberRelic) => {
        if (relic.currency === 'gold') return gold >= relic.cost;
        if (relic.currency === 'souls') return souls >= relic.cost;
        if (relic.currency === 'voidMatter') return voidMatter >= relic.cost;
        return false;
    };

    // 2 Slots fixed
    const slot1 = equippedRelics[0] ? CHAMBER_RELICS.find(r => r.id === equippedRelics[0]) : null;
    const slot2 = equippedRelics[1] ? CHAMBER_RELICS.find(r => r.id === equippedRelics[1]) : null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-amber-900/50 rounded-xl p-6 max-w-3xl w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-3 bg-amber-950/40 rounded-lg border border-amber-900/30">
                        <Shield className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                            Câmara de Relíquias
                        </h2>
                        <p className="text-gray-400 text-sm">Equipe relíquias antigas que alteram permanentemente as mecânicas fundamentais do jogo.</p>
                    </div>
                </div>

                {/* Equipped Slots Showcase */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-950/40 p-4 rounded-xl border border-gray-800/80">
                    {/* Slot 1 */}
                    <div className="flex items-center gap-3 bg-gray-900/60 p-3 rounded-lg border border-gray-800 relative group">
                        <div className="w-12 h-12 rounded-lg bg-gray-950 border border-gray-850 flex items-center justify-center text-2xl shadow-inner">
                            {slot1 ? slot1.emoji : '🔒'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-gray-500 font-semibold block">SLOT DE RELÍQUIA 1</span>
                            <span className="text-sm font-bold text-gray-250 truncate block">
                                {slot1 ? slot1.name : 'Nenhuma Relíquia'}
                            </span>
                            {slot1 && (
                                <button
                                    onClick={() => actions.unequipRelic(0)}
                                    className="text-[10px] text-red-400 hover:text-red-300 font-bold underline cursor-pointer mt-0.5"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Slot 2 */}
                    <div className="flex items-center gap-3 bg-gray-900/60 p-3 rounded-lg border border-gray-800 relative group">
                        <div className="w-12 h-12 rounded-lg bg-gray-950 border border-gray-850 flex items-center justify-center text-2xl shadow-inner">
                            {slot2 ? slot2.emoji : '🔒'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-gray-500 font-semibold block">SLOT DE RELÍQUIA 2</span>
                            <span className="text-sm font-bold text-gray-250 truncate block">
                                {slot2 ? slot2.name : 'Nenhuma Relíquia'}
                            </span>
                            {slot2 && (
                                <button
                                    onClick={() => actions.unequipRelic(1)}
                                    className="text-[10px] text-red-400 hover:text-red-300 font-bold underline cursor-pointer mt-0.5"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Purificação de Relíquias Cósmicas */}
                <div className="mb-6 bg-slate-950/60 p-4 rounded-xl border border-indigo-900/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                        <div>
                            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Purificação de Relíquias Cósmicas
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1 max-w-md">
                                Relíquias brutas obtidas em expedições planetárias podem ser purificadas para conceder bônus de início de corrida no Modo Rifts (Fendas).
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-[10px] text-gray-500 block uppercase font-bold">Não Purificadas</span>
                                <span className="text-base font-black text-indigo-300 font-mono">{unpurifiedRelics}</span>
                            </div>
                            <button
                                onClick={purifyRelic}
                                disabled={unpurifiedRelics < 1}
                                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide border transition-all duration-300 ${
                                    unpurifiedRelics >= 1
                                        ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-950/40 active:scale-95 hover:scale-[1.03]'
                                        : 'bg-gray-850 border-gray-800 text-gray-550 cursor-not-allowed'
                                }`}
                            >
                                Purificar
                            </button>
                        </div>
                    </div>

                    {/* Perks Status */}
                    <div className="mt-4 pt-3 border-t border-gray-850/60 grid grid-cols-3 gap-3">
                        {/* Perk 1: Gold */}
                        <div className={`p-2 rounded-lg border text-center transition-all ${
                            unlockedRiftPerks.includes('rift_perk_gold')
                                ? 'bg-indigo-950/20 border-indigo-650/40 text-indigo-200 font-bold'
                                : 'bg-gray-950/40 border-gray-850 text-gray-500'
                        }`}>
                            <div className="text-[10px] font-bold uppercase truncate">Provisão Cósmica</div>
                            <div className="text-[9px] mt-0.5 font-semibold text-gray-400">+20 Ouro Inicial</div>
                            <div className="text-[9px] mt-1 font-mono uppercase font-black">
                                {unlockedRiftPerks.includes('rift_perk_gold') ? '✓ Desbloqueado' : '❌ Bloqueado'}
                            </div>
                        </div>

                        {/* Perk 2: Speed */}
                        <div className={`p-2 rounded-lg border text-center transition-all ${
                            unlockedRiftPerks.includes('rift_perk_speed')
                                ? 'bg-indigo-950/20 border-indigo-650/40 text-indigo-200 font-bold'
                                : 'bg-gray-950/40 border-gray-850 text-gray-500'
                        }`}>
                            <div className="text-[10px] font-bold uppercase truncate">Propulsor Célere</div>
                            <div className="text-[9px] mt-0.5 font-semibold text-gray-400">+3 Vel. Inicial</div>
                            <div className="text-[9px] mt-1 font-mono uppercase font-black">
                                {unlockedRiftPerks.includes('rift_perk_speed') ? '✓ Desbloqueado' : '❌ Bloqueado'}
                            </div>
                        </div>

                        {/* Perk 3: Shield (HP) */}
                        <div className={`p-2 rounded-lg border text-center transition-all ${
                            unlockedRiftPerks.includes('rift_perk_shield')
                                ? 'bg-indigo-950/20 border-indigo-650/40 text-indigo-200 font-bold'
                                : 'bg-gray-950/40 border-gray-850 text-gray-500'
                        }`}>
                            <div className="text-[10px] font-bold uppercase truncate">Escudo Estelar</div>
                            <div className="text-[9px] mt-0.5 font-semibold text-gray-400">+15 HP Máximo</div>
                            <div className="text-[9px] mt-1 font-mono uppercase font-black">
                                {unlockedRiftPerks.includes('rift_perk_shield') ? '✓ Desbloqueado' : '❌ Bloqueado'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Relics List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[32vh] overflow-y-auto pr-1">
                    {CHAMBER_RELICS.map(relic => {
                        const owned = isOwned(relic.id);
                        const equippedSlot = getEquippedSlot(relic.id);
                        const isEquipped = equippedSlot !== null;
                        const affordable = hasEnoughCurrency(relic);

                        return (
                            <div
                                key={relic.id}
                                className={`flex justify-between bg-gray-950/20 p-4 rounded-xl border transition-all duration-300 ${
                                    isEquipped 
                                        ? 'border-amber-600/50 bg-amber-950/5' 
                                        : owned 
                                            ? 'border-gray-800/80 hover:border-gray-650' 
                                            : 'border-gray-850 opacity-90'
                                }`}
                            >
                                <div className="flex gap-3 flex-1">
                                    <div className="w-12 h-12 rounded-lg bg-gray-900/80 border border-gray-800/50 flex items-center justify-center text-2xl">
                                        {relic.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-200 text-sm flex items-center gap-1.5">
                                            {relic.name}
                                            {isEquipped && (
                                                <span className="bg-amber-900/40 border border-amber-800 text-amber-300 text-[8px] px-1 py-0.2 rounded font-bold uppercase">
                                                    Slot {equippedSlot + 1}
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-gray-400 leading-snug mt-1">{relic.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center items-end ml-4 border-l border-gray-850 pl-4 min-w-[110px]">
                                    {owned ? (
                                        <div className="flex flex-col gap-1.5 w-full">
                                            <button
                                                onClick={() => actions.equipRelic(relic.id, 0)}
                                                className={`w-full py-1 rounded text-[10px] font-bold border transition-all ${
                                                    equippedSlot === 0
                                                        ? 'bg-amber-700/20 border-amber-600 text-amber-300 cursor-default'
                                                        : 'bg-gray-850 border-gray-800 text-gray-300 hover:bg-gray-800'
                                                }`}
                                            >
                                                {equippedSlot === 0 ? 'No Slot 1' : 'Equipar Slot 1'}
                                            </button>
                                            <button
                                                onClick={() => actions.equipRelic(relic.id, 1)}
                                                className={`w-full py-1 rounded text-[10px] font-bold border transition-all ${
                                                    equippedSlot === 1
                                                        ? 'bg-amber-700/20 border-amber-600 text-amber-300 cursor-default'
                                                        : 'bg-gray-850 border-gray-800 text-gray-300 hover:bg-gray-800'
                                                }`}
                                            >
                                                {equippedSlot === 1 ? 'No Slot 2' : 'Equipar Slot 2'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center w-full">
                                            <div className="text-[10px] text-gray-500">Custo de Desbloqueio</div>
                                            <div className={`text-xs font-bold ${getCurrencyColor(relic.currency)} mt-0.5`}>
                                                {formatNumber(relic.cost)} {getCurrencyLabel(relic.currency)}
                                            </div>
                                            <button
                                                onClick={() => actions.buyRelic(relic.id)}
                                                disabled={!affordable}
                                                className={`mt-2 w-full py-1 px-2 rounded text-[10px] font-bold border transition-all ${
                                                    affordable
                                                        ? 'bg-amber-650 hover:bg-amber-550 border-amber-500 text-white hover:scale-[1.03]'
                                                        : 'bg-gray-850 border-gray-800 text-gray-550 cursor-not-allowed'
                                                }`}
                                            >
                                                Desbloquear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
