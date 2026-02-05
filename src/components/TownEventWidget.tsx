import React from 'react';
import { ShoppingBag, ShieldAlert, PartyPopper, X, Clock } from 'lucide-react';
import type { TownEvent } from '../engine/types';
import { formatNumber } from '../utils';

interface TownEventWidgetProps {
    event: TownEvent;
    actions: any;
    onDismiss: () => void;
}

export const TownEventWidget: React.FC<TownEventWidgetProps> = ({ event, actions, onDismiss }) => {
    const getIcon = () => {
        switch (event.type) {
            case 'merchant': return <ShoppingBag className="text-amber-400" size={16} />;
            case 'raid': return <ShieldAlert className="text-red-500 animate-pulse" size={16} />;
            case 'festival': return <PartyPopper className="text-pink-400" size={16} />;
            default: return null;
        }
    };

    const getRarityColor = () => {
        return event.rarity === 'rare' ? 'border-purple-500 bg-purple-900/40' : 'border-blue-500 bg-blue-900/40';
    };

    return (
        <div className={`fixed bottom-24 right-4 z-50 w-72 p-3 rounded-lg border-2 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-right duration-300 ${getRarityColor()}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">{event.name}</h3>
                </div>
                <button onClick={onDismiss} className="text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            <p className="text-[10px] text-gray-300 mb-3 leading-tight italic">
                "{event.description}"
            </p>

            <div className="space-y-2">
                {event.type === 'merchant' && event.items && (
                    <div className="grid grid-cols-1 gap-1">
                        {event.items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => actions.interactWithEvent(event.id, 'buy', { item })}
                                className="flex items-center justify-between bg-gray-800/80 p-2 rounded border border-gray-600 hover:border-amber-400 transition-all group"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] font-bold text-amber-200 group-hover:text-amber-400">{item.name}</span>
                                    <span className="text-[8px] text-gray-400">+{item.value} {item.stat}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-900/30 px-1 rounded">
                                    💰 {formatNumber(item.value * 2)}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {event.type === 'raid' && (
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                            <div
                                className="h-full bg-red-500 transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                style={{ width: `${event.defenseProgress || 0}%` }}
                            />
                        </div>
                        <button
                            onClick={() => actions.interactWithEvent(event.id, 'defend')}
                            className="w-full py-2 bg-red-700 hover:bg-red-600 text-white rounded font-bold text-xs shadow-lg uppercase tracking-tighter transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ShieldAlert size={14} /> DEFEND TOWN!
                        </button>
                    </div>
                )}

                {event.type === 'festival' && (
                    <div className="bg-pink-900/30 p-2 rounded border border-pink-500/50 text-center animate-pulse">
                        <span className="text-[10px] font-bold text-pink-200">✨ Gaining bonus XP & GOLD! ✨</span>
                    </div>
                )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-1 text-[9px] font-mono text-gray-400">
                <Clock size={10} />
                <span>Expires in {Math.floor(event.duration)}s</span>
            </div>
        </div>
    );
};
