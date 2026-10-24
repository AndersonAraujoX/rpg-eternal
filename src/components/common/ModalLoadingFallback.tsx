import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ModalLoadingFallbackProps {
    title?: string;
    message?: string;
}

/**
 * Accessible fallback spinner displayed while lazy-loaded modals are fetching.
 */
export const ModalLoadingFallback: React.FC<ModalLoadingFallbackProps> = ({
    title,
    message = 'Carregando interface...'
}) => {
    return (
        <div
            role="status"
            aria-live="polite"
            data-testid="modal-loading-fallback"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none"
        >
            <div className="bg-stone-900 border-2 border-amber-600/60 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3 min-w-[240px] text-center font-mono">
                <Loader2
                    data-testid="modal-loading-spinner"
                    className="animate-spin text-amber-400"
                    size={32}
                />
                {title && (
                    <h3
                        data-testid="modal-loading-title"
                        className="text-amber-200 font-bold text-sm tracking-wide uppercase"
                    >
                        {title}
                    </h3>
                )}
                <p
                    data-testid="modal-loading-message"
                    className="text-stone-400 text-xs"
                >
                    {message}
                </p>
            </div>
        </div>
    );
};
