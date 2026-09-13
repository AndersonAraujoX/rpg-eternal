import React, { useState } from 'react';
import { 
    Castle, 
    Compass, 
    Swords, 
    Cpu, 
    ShieldAlert, 
    Rocket, 
    ShoppingBag, 
    Sparkles, 
    ChevronUp, 
    ChevronDown,
    Zap,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

export interface GlobalDockProps {
    onOpenModal: (modal: string) => void;
    activeModal?: string | null;
    towerFloor?: number;
    backroomsFloor?: number;
    backroomsScrap?: number;
    industryMetrics?: { powerGenerated?: number; powerConsumed?: number };
    isScpUnlocked?: boolean;
    scpActiveBreach?: boolean;
    playerTerritoriesCount?: number;
    hasTributesReady?: boolean;
    outerSpaceUnlocked?: boolean;
    currentJourneyStep?: { title: string; stepNumber: number };
    bottlenecksCount?: number;
    onQuickAction?: (action: 'claim_tributes' | 'auto_equip' | 'feed_pets' | 'quick_sanity') => void;
    isAriaOpen?: boolean;
    onToggleAria?: (open: boolean) => void;
}

export const GlobalDock: React.FC<GlobalDockProps> = ({
    onOpenModal,
    activeModal,
    towerFloor = 1,
    backroomsFloor = 1,
    backroomsScrap = 0,
    industryMetrics = { powerGenerated: 0, powerConsumed: 0 },
    isScpUnlocked = false,
    scpActiveBreach = false,
    playerTerritoriesCount = 0,
    hasTributesReady = false,
    outerSpaceUnlocked = false,
    currentJourneyStep,
    bottlenecksCount = 0,
    onQuickAction,
    isAriaOpen = false,
    onToggleAria
}) => {
    const [collapsed, setCollapsed] = useState(false);

    const netPower = (industryMetrics.powerGenerated || 0) - (industryMetrics.powerConsumed || 0);

    return (
        <div 
            data-testid="global-dock-container"
            className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none font-mono"
        >
            {/* Botão de Recolher / Expandir Dock */}
            <button
                data-testid="global-dock-toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                className="bg-black/80 hover:bg-stone-900 border border-stone-700/80 text-stone-400 hover:text-amber-400 text-[10px] px-3 py-0.5 rounded-t-lg flex items-center gap-1 shadow-md transition-all -mb-[1px]"
                title={collapsed ? "Expandir Barra de Navegação" : "Recolher Barra de Navegação"}
            >
                {collapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                <span>DOCK GLOBAL</span>
                {bottlenecksCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
            </button>

            {/* Barra Principal de Ícones e Ações Rápidas */}
            {!collapsed && (
                <div className="bg-stone-950/95 border-2 border-amber-900/60 backdrop-blur-md rounded-2xl px-3 py-2 flex items-center gap-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)] ring-1 ring-amber-500/20">
                    
                    {/* 1. Vila & Torre */}
                    <button
                        data-testid="dock-btn-town"
                        onClick={() => onOpenModal('town')}
                        className={`group relative p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all min-w-[56px] ${
                            activeModal === 'town'
                                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-amber-200'
                        }`}
                        title="Vila e Torre Infinita [V]"
                    >
                        <Castle size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold">Vila</span>
                        <span className="text-[8px] text-amber-500/80">F.{towerFloor}</span>
                    </button>

                    {/* 2. Backrooms M.E.G. */}
                    <button
                        data-testid="dock-btn-backrooms"
                        onClick={() => onOpenModal('backrooms')}
                        className={`group relative p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all min-w-[56px] ${
                            activeModal === 'backrooms'
                                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-amber-200'
                        }`}
                        title="Backrooms (M.E.G.) [B]"
                    >
                        <Compass size={18} className="group-hover:scale-110 transition-transform text-amber-400" />
                        <span className="text-[9px] font-bold">M.E.G.</span>
                        <span className="text-[8px] text-amber-500/80">Nv.{backroomsFloor}</span>
                    </button>

                    {/* 3. Guerra de Territórios */}
                    <button
                        data-testid="dock-btn-guild-war"
                        onClick={() => onOpenModal('guild_war')}
                        className={`group relative p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all min-w-[56px] ${
                            activeModal === 'guild_war'
                                ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-red-200'
                        }`}
                        title="Guerra de Territórios & MOBA [T]"
                    >
                        <Swords size={18} className="group-hover:scale-110 transition-transform text-red-400" />
                        <span className="text-[9px] font-bold">Guerra</span>
                        <span className="text-[8px] text-red-400/90">{playerTerritoriesCount} Terr.</span>
                        {hasTributesReady && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-ping" />
                        )}
                    </button>

                    {/* 4. Complexo Industrial */}
                    <button
                        data-testid="dock-btn-industry"
                        onClick={() => onOpenModal('industry')}
                        className={`group relative p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all min-w-[56px] ${
                            activeModal === 'industry'
                                ? 'bg-orange-950 border-orange-500 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-orange-200'
                        }`}
                        title="Complexo Industrial (Factorio) [I]"
                    >
                        <Cpu size={18} className="group-hover:scale-110 transition-transform text-orange-400" />
                        <span className="text-[9px] font-bold">Fábrica</span>
                        <span className={`text-[8px] ${netPower < 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                            {netPower >= 0 ? `+${netPower}` : netPower} MW
                        </span>
                    </button>

                    {/* 5. Subsolo Sítio-19 SCP */}
                    {isScpUnlocked && (
                        <button
                            data-testid="dock-btn-scp"
                            onClick={() => onOpenModal('industry_scp')}
                            className={`group relative p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all min-w-[56px] ${
                                scpActiveBreach
                                    ? 'bg-red-950 border-red-500 text-red-200 animate-pulse ring-2 ring-red-500/60'
                                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-red-300'
                            }`}
                            title="Sítio-19 (Contenção SCP)"
                        >
                            <ShieldAlert size={18} className={`group-hover:scale-110 transition-transform ${scpActiveBreach ? 'text-red-400 animate-bounce' : 'text-stone-400'}`} />
                            <span className="text-[9px] font-bold">SCP-19</span>
                            <span className={`text-[8px] ${scpActiveBreach ? 'text-red-400 font-black' : 'text-emerald-400'}`}>
                                {scpActiveBreach ? 'BRECHA' : 'SEGURO'}
                            </span>
                        </button>
                    )}

                    {/* 6. Galáxia */}
                    {outerSpaceUnlocked && (
                        <button
                            data-testid="dock-btn-galaxy"
                            onClick={() => onOpenModal('galaxy')}
                            className={`group relative p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all min-w-[56px] ${
                                activeModal === 'galaxy'
                                    ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-indigo-200'
                            }`}
                            title="Conquista Galáctica [G]"
                        >
                            <Rocket size={18} className="group-hover:scale-110 transition-transform text-indigo-400" />
                            <span className="text-[9px] font-bold">Galáxia</span>
                            <span className="text-[8px] text-indigo-400/80">Espaço</span>
                        </button>
                    )}

                    {/* Divisor vertical */}
                    <div className="h-8 w-[1px] bg-stone-800 mx-1" />

                    {/* 7. Guia Aria & Alertas */}
                    <button
                        data-testid="dock-btn-aria"
                        onClick={() => onToggleAria?.(!isAriaOpen)}
                        className={`group relative p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all min-w-[62px] ${
                            isAriaOpen
                                ? 'bg-amber-600 border-amber-300 text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                                : 'bg-gradient-to-br from-amber-950/80 to-stone-900 border-amber-700/80 text-amber-300 hover:border-amber-500 shadow-sm'
                        }`}
                        title="Conselheira Tática Aria [J]"
                    >
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform text-amber-300" />
                        <span className="text-[9px] font-bold">Aria</span>
                        <span className="text-[8px] text-amber-400/90 font-bold">Guia [J]</span>
                        {bottlenecksCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                                {bottlenecksCount}
                            </span>
                        )}
                    </button>

                    {/* Ações Rápidas de Qualidade de Vida (Se fornecidas) */}
                    {onQuickAction && (
                        <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-stone-800 ml-1">
                            <button
                                data-testid="dock-quick-claim-btn"
                                onClick={() => onQuickAction('claim_tributes')}
                                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] text-stone-300 hover:text-amber-300 transition-all flex items-center gap-1"
                                title="Coleta Rápida de Todos os Tributos Territoriais"
                            >
                                🚩 <span className="hidden md:inline">Coletar</span>
                            </button>
                            <button
                                data-testid="dock-quick-autoequip-btn"
                                onClick={() => onQuickAction('auto_equip')}
                                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] text-stone-300 hover:text-cyan-300 transition-all flex items-center gap-1"
                                title="Auto-Equipar Melhores Itens nos Heróis"
                            >
                                ⚔️ <span className="hidden md:inline">Equipar</span>
                            </button>
                            <button
                                data-testid="dock-quick-sanity-btn"
                                onClick={() => onQuickAction('quick_sanity')}
                                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-[10px] text-stone-300 hover:text-emerald-300 transition-all flex items-center gap-1"
                                title="Repor Sanidade com Almond Water"
                            >
                                🥛 <span className="hidden md:inline">Sanidade</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
