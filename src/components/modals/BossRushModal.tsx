import React from 'react';
import { Swords, Trophy, ShieldAlert, Timer, X, Award } from 'lucide-react';
import { formatNumber } from '../../utils';

interface BossRushModalProps {
    isOpen: boolean;
    onClose: () => void;
    bossRushActive: boolean;
    bossRushWave: number;
    bossRushMaxWave: number;
    bossRushBoss: any;
    bossRushCooldown: number;
    actions: {
        startBossRush: () => void;
        endBossRush: (success: boolean) => void;
    };
}

export const BossRushModal: React.FC<BossRushModalProps> = ({
    isOpen,
    onClose,
    bossRushActive,
    bossRushWave,
    bossRushMaxWave,
    bossRushBoss,
    bossRushCooldown,
    actions
}) => {
    const [cooldownSecs, setCooldownSecs] = React.useState(0);

    React.useEffect(() => {
        if (isOpen && bossRushCooldown > 0) {
            const updateCooldown = () => {
                const diff = Math.max(0, Math.ceil((bossRushCooldown - Date.now()) / 1000));
                setCooldownSecs(diff);
            };
            updateCooldown();
            const interval = setInterval(updateCooldown, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, bossRushCooldown]);

    if (!isOpen) return null;

    const hpPercent = bossRushBoss ? Math.max(0, Math.min(100, (bossRushBoss.stats.hp / bossRushBoss.stats.maxHp) * 100)) : 0;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 border-2 border-orange-900/50 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <div className="p-3 bg-orange-950/40 rounded-lg border border-orange-850/30">
                        <Swords className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-650">
                            Coliseu das Lendas
                        </h2>
                        <p className="text-gray-400 text-sm">Desafie chefes consecutivos sem curar. Recompensas a cada 5 ondas!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left: General info and Stats */}
                    <div className="bg-gray-950/60 p-4 rounded-lg border border-gray-800 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" /> Estatísticas do Desafio
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm border-b border-gray-900 pb-1.5">
                                    <span className="text-gray-400">Recorde Atual:</span>
                                    <span className="text-yellow-400 font-bold">Onda {bossRushMaxWave}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-gray-900 pb-1.5">
                                    <span className="text-gray-400">Status do Coliseu:</span>
                                    <span className={bossRushActive ? 'text-green-400 font-bold animate-pulse' : 'text-gray-400'}>
                                        {bossRushActive ? 'Desafio Ativo' : 'Disponível'}
                                    </span>
                                </div>
                                {bossRushActive && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Onda Atual:</span>
                                        <span className="text-orange-400 font-bold">Onda {bossRushWave}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-orange-400" /> Recompensas do Coliseu
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Derrotar chefes no Coliseu dropa Essências Elementais. Cada 5 ondas consecutivas concedem um Baú do Vazio contendo Ouro, Almas, Minérios Raros ou Matéria do Vazio.
                            </p>
                        </div>
                    </div>

                    {/* Right: Combat state / Play panel */}
                    <div className="bg-gray-950/60 p-4 rounded-lg border border-gray-800 flex flex-col justify-center items-center text-center">
                        {bossRushActive && bossRushBoss ? (
                            <div className="w-full space-y-4">
                                <div className="text-4xl animate-bounce">{bossRushBoss.emoji}</div>
                                <div>
                                    <h4 className="font-bold text-lg text-orange-300">{bossRushBoss.name}</h4>
                                    <span className="text-xs text-gray-500">Onda {bossRushWave} • Nível {bossRushBoss.level}</span>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-gray-400 px-1">
                                        <span>HP: {formatNumber(bossRushBoss.stats.hp)} / {formatNumber(bossRushBoss.stats.maxHp)}</span>
                                        <span>{hpPercent.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3.5 overflow-hidden border border-gray-700">
                                        <div
                                            className="bg-gradient-to-r from-red-650 to-orange-500 h-full transition-all duration-300 rounded-full"
                                            style={{ width: `${hpPercent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 pt-2">
                                    <div className="bg-gray-900/60 p-1.5 rounded border border-gray-800/80">
                                        <span>Ataque: ⚔️{formatNumber(bossRushBoss.stats.attack)}</span>
                                    </div>
                                    <div className="bg-gray-900/60 p-1.5 rounded border border-gray-800/80">
                                        <span>Defesa: 🛡️{formatNumber(bossRushBoss.stats.defense)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => actions.endBossRush(false)}
                                    className="w-full mt-4 py-2 rounded-lg bg-red-950 border border-red-800 hover:bg-red-900 text-red-200 text-sm font-bold transition-all hover:scale-[1.02]"
                                >
                                    Rendição (Desistir)
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4 w-full">
                                <div className="text-4xl text-gray-600">🏟️</div>
                                <div>
                                    <h4 className="font-bold text-gray-300">Entrar no Coliseu</h4>
                                    <p className="text-xs text-gray-500 px-4 mt-1">Inicie uma sequência de batalhas de chefes para testar o limite da sua equipe.</p>
                                </div>

                                {cooldownSecs > 0 ? (
                                    <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex items-center justify-center gap-2 text-red-400 text-xs">
                                        <Timer size={14} className="animate-spin" />
                                        Coliseu em recarga! Restam {cooldownSecs}s.
                                    </div>
                                ) : (
                                    <button
                                        onClick={actions.startBossRush}
                                        className="py-2.5 px-6 rounded-lg bg-orange-650 hover:bg-orange-550 border border-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-900/20 transition-all hover:scale-105 hover:shadow-orange-500/20"
                                    >
                                        Iniciar Desafio
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
