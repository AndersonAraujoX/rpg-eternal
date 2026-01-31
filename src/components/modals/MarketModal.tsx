import React from 'react';
import { X, ShoppingBag, Clock } from 'lucide-react';
import type { MarketItem } from '../../engine/types';
import { formatNumber } from '../../utils';

interface MarketModalProps {
    isOpen: boolean;
    onClose: () => void;
    stock: MarketItem[];
    buyItem: (item: MarketItem) => void;
    gold: number;
    divinity: number;
    voidMatter: number;
    timer: number;
}

export const MarketModal: React.FC<MarketModalProps> = ({ isOpen, onClose, stock, buyItem, gold, divinity, voidMatter, timer }) => {
    if (!isOpen) return null;

    const formatTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-purple-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative">

                {/* Header */}
                <div className="p-4 border-b border-purple-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-purple-950">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-900/30 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-purple-100">Black Market</h2>
                            <div className="flex items-center gap-1 text-xs text-purple-300">
                                <Clock className="w-3 h-3" />
                                <span>Closing in: {formatTime(timer)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Stock Grid */}
                <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stock.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-gray-500">
                            Sold Out
                        </div>
                    ) : (
                        stock.map((item) => {
                            const canAfford =
                                item.currency === 'gold' ? gold >= item.cost :
                                    item.currency === 'divinity' ? divinity >= item.cost :
                                        item.currency === 'voidMatter' ? voidMatter >= item.cost : false;

                            return (
                                <div key={item.id} className="bg-gray-800/50 border border-purple-900/30 p-4 rounded-lg flex items-center justify-between group hover:border-purple-500/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{item.emoji}</div>
                                        <div>
                                            <h3 className="font-bold text-gray-200">{item.name}</h3>
                                            <p className="text-xs text-gray-400">{item.description}</p>
                                            <p className={`text-sm font-mono mt-1 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                                {formatNumber(item.cost)} {item.currency === 'voidMatter' ? 'Void' : item.currency.charAt(0).toUpperCase() + item.currency.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => buyItem(item)}
                                        disabled={!canAfford}
                                        className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${canAfford
                                            ? 'bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        Buy
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-950 border-t border-purple-900/50 text-center text-xs text-gray-500 font-mono">
                    "No refunds. No questions."
                </div>

            </div>
        </div>
    );
};
