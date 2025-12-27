import React from 'react';

interface OfflineModalProps {
    offlineGains: string | null;
    onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ offlineGains, onClose }) => {
    if (!offlineGains) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fade-in">
            <div className="bg-gray-800 border-4 border-yellow-500 p-6 rounded-lg max-w-sm text-center shadow-2xl">
                <h2 className="text-2xl text-yellow-400 mb-4 font-bold">WELCOME BACK!</h2>
                <div className="text-white whitespace-pre-line mb-6 font-mono text-sm">{offlineGains}</div>
                <button onClick={onClose} className="btn-retro bg-green-600 px-6 py-2 rounded text-white hover:bg-green-500 w-full">AWESOME!</button>
            </div>
        </div>
    );
};
