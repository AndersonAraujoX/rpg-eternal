import React from 'react';
import { Ghost, Coins, Crown, Hammer, Briefcase, Castle, Building as BuildingIcon, Key, Skull, Volume2, VolumeX, Zap, Settings, Swords, Scroll, Gem, Trophy, HelpCircle, BookOpen, BarChart2, Anchor, FlaskConical, Map, Leaf, Home, Calendar, Flame, Clock, ShieldAlert, Lock, PawPrint } from 'lucide-react';
import { formatNumber } from '../utils';
import type { Boss, Resources, Tower, Guild, Building } from '../engine/types';
import type { WeatherType } from '../engine/weather'; // Phase 48
import { WEATHER_DATA } from '../engine/weather'; // Phase 48

interface HeaderProps {
    boss: Boss;
    souls: number;
    gold: number;
    divinity: number;
    resources: Resources;
    tower: Tower;
    guild: Guild | null;
    keys: number;
    voidMatter: number;
    dungeonActive: boolean;
    voidActive: boolean;
    voidTimer: number;
    isSoundOn: boolean;
    gameSpeed: number;
    actions: any;
    setShowShop: (v: boolean) => void;
    setShowTavern: (v: boolean) => void;
    setShowStars: (v: boolean) => void;
    setShowForge: (v: boolean) => void;
    setShowInventory: (v: boolean) => void;
    setShowBestiary: (v: boolean) => void;
    setShowStats: (v: boolean) => void;
    setShowTower: (v: boolean) => void;
    setShowGuild: (v: boolean) => void;
    setShowSettings: (v: boolean) => void;
    setShowVoid?: (v: boolean) => void;
    setShowArena?: (v: boolean) => void;
    setShowQuests: (v: boolean) => void;
    setShowDailyRewards?: (v: boolean) => void; // Phase 56
    setShowRunes: (v: boolean) => void;
    setShowAchievements: (v: boolean) => void;
    setShowStarlight: (v: boolean) => void;
    setShowGalaxy: (v: boolean) => void;
    setShowLeaderboard: (v: boolean) => void; // Phase 60
    setShowHelp: (v: boolean) => void;
    // PHASE 41
    setShowFishing?: (v: boolean) => void;
    setShowAlchemy?: (v: boolean) => void;
    setShowExpeditions?: (v: boolean) => void;
    setShowGarden?: (v: boolean) => void;
    setShowRiftModal?: (v: boolean) => void;
    setShowPetSpace?: (v: boolean) => void; // Phase 46
    setShowGuildWar?: (v: boolean) => void; // Phase 47
    weather?: WeatherType; // Phase 48
    weatherTimer?: number; // Phase 48
    setShowMuseum?: (v: boolean) => void; // Phase 49
    // Phase 53
    setShowTown?: (v: boolean) => void;
    setShowCampfire?: (v: boolean) => void; // Phase 80
    setShowStarForge?: (v: boolean) => void;
    // Phase 6
    setShowWorldBoss?: (v: boolean) => void;
    activeEvent?: import('../engine/townEvents').TownEvent | null; // Phase 92
    setShowDevTools?: (v: boolean) => void;
    outerSpaceUnlocked?: boolean;
    setShowPrestigeTree?: (v: boolean) => void;
    townVisited?: boolean;
    voidAscensions?: number;
    buildings?: Building[];
}

export const Header: React.FC<HeaderProps> = ({
    boss, souls, gold, divinity, tower, keys, voidMatter, dungeonActive, voidActive, voidTimer, isSoundOn, gameSpeed, actions,
    setShowShop, setShowTavern, setShowStars, setShowForge, setShowInventory, setShowBestiary, setShowSettings, setShowStats,
    setShowTower, setShowGuild, setShowVoid, setShowArena, setShowQuests, setShowDailyRewards, setShowRunes, setShowAchievements, setShowStarlight, setShowHelp, setShowGalaxy,
    setShowLeaderboard,
    setShowFishing, setShowAlchemy, setShowExpeditions,
    setShowGarden,
    setShowRiftModal, // Update 81: Active
    setShowPetSpace, // Phase 46
    setShowGuildWar, // Phase 47
    weather, weatherTimer, // Phase 48
    setShowMuseum, // Phase 49
    setShowTown, // Phase 53
    setShowCampfire, // Phase 80
    setShowStarForge,
    setShowWorldBoss,
    setShowDevTools,
    activeEvent,
    outerSpaceUnlocked,
    setShowPrestigeTree,
    townVisited,
    voidAscensions = 0,
    buildings = []
}) => {
    const [activeTab, setActiveTab] = React.useState<'main' | 'combat' | 'skills' | 'system'>('main');

    // Button Groups
    const renderMainButtons = () => (
        <>
            <button onClick={() => setShowInventory(true)} className="btn-retro bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-500 flex items-center gap-1 hover:bg-slate-600" title="Inventário"><Briefcase size={12} /> Mochila</button>
            <button
                onClick={() => setShowGuild(true)}
                disabled={!buildings.find(b => b.id === 'guild_hall' && b.level > 0)}
                className={`btn-retro px-2 py-1 rounded border flex items-center gap-1 transition-all ${buildings.find(b => b.id === 'guild_hall' && b.level > 0) ? 'bg-green-900 text-green-200 border-green-500 hover:bg-green-800' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'}`}
                title={buildings.find(b => b.id === 'guild_hall' && b.level > 0) ? "Guilda" : "Bloqueado: Requer Sede da Guilda na Vila"}
            >
                <BuildingIcon size={12} /> {buildings.find(b => b.id === 'guild_hall' && b.level > 0) ? "Guilda" : "???"}
                {!buildings.find(b => b.id === 'guild_hall' && b.level > 0) && <Lock size={8} />}
            </button>
            {setShowTown && (
                <button onClick={() => { if (setShowTown) setShowTown(true); }} className="btn-retro bg-stone-700 text-stone-200 px-2 py-1 rounded border border-stone-500 flex items-center gap-1 hover:bg-stone-600 relative" title="Vila">
                    <Home size={12} /> Vila
                    {activeEvent && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white" />}
                </button>
            )}
            {setShowPrestigeTree && voidAscensions > 0 && (
                <button onClick={() => setShowPrestigeTree(true)} className="btn-retro bg-purple-900 text-purple-200 px-2 py-1 rounded border border-purple-500 flex items-center gap-1 hover:bg-purple-800" title="Árvore de Almas">
                    <Zap size={12} className="text-yellow-400" /> Árvore
                </button>
            )}
            {setShowCampfire && <button onClick={() => setShowCampfire(true)} className="btn-retro bg-orange-800 text-orange-200 px-2 py-1 rounded border border-orange-500 flex items-center gap-1 hover:bg-orange-700" title="Fogueira"><Flame size={12} /> Descansar</button>}
        </>
    );

    const renderCombatButtons = () => (
        <>
            <button onClick={() => setShowTower(true)} className="btn-retro bg-indigo-900 text-indigo-200 px-2 py-1 rounded border border-indigo-500 flex items-center gap-1 hover:bg-indigo-800" title="Torre"><Castle size={12} /> {tower.floor}</button>
            <button onClick={() => setShowArena && setShowArena(true)} className="btn-retro bg-red-900 text-red-200 px-2 py-1 rounded border border-red-500 flex items-center gap-1 hover:bg-red-800" title="Arena"><Swords size={12} /> Arena</button>
            {/* GALAXY BUTTON */}
            {setShowGalaxy && (
                <button
                    onClick={() => outerSpaceUnlocked && setShowGalaxy(true)}
                    className={`btn-retro px-2 py-1 rounded border flex items-center gap-1 transition-all ${outerSpaceUnlocked ? 'bg-indigo-950 text-indigo-300 border-indigo-500 hover:bg-indigo-900' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'}`}
                    title={outerSpaceUnlocked ? "Conquista Galáctica" : "Bloqueado: Requer Espaço Externo"}
                >
                    <Crown size={12} className="rotate-180" /> {outerSpaceUnlocked ? "Galáxia" : "???"}
                </button>
            )}
            {setShowStarForge && (
                <button
                    onClick={() => outerSpaceUnlocked && setShowStarForge(true)}
                    className={`btn-retro px-2 py-1 rounded border flex items-center gap-1 transition-all ${outerSpaceUnlocked ? 'bg-orange-950 text-orange-300 border-orange-500 hover:bg-orange-900' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'}`}
                    title={outerSpaceUnlocked ? "Forja Estelar" : "Bloqueado: Requer Espaço Externo"}
                >
                    <Flame size={12} /> {outerSpaceUnlocked ? "Forja Estelar" : "???"}
                </button>
            )}
            {setShowRiftModal && boss.level >= 300 && (
                <button
                    onClick={() => setShowRiftModal(true)}
                    className="btn-retro bg-purple-900 text-purple-300 px-2 py-1 rounded border border-purple-500 flex items-center gap-1 hover:bg-purple-800"
                    title="Fendas Temporais (Nível 300+)"
                >
                    <Clock size={12} /> Fendas
                </button>
            )}
            {setShowWorldBoss && <button onClick={() => setShowWorldBoss(true)} className="btn-retro bg-red-950 text-red-400 px-2 py-1 rounded border border-red-500 flex items-center gap-1 hover:bg-red-900 animate-pulse" title="Reide de Chefe Mundial"><Skull size={12} /> Reide</button>}

            {/* Vazio e Fogueira removidos a pedido do usuário */}
            {/* Phase 47: Guild War */}
            <button onClick={() => setShowGuildWar && setShowGuildWar(true)} className="btn-retro bg-orange-700 text-white px-2 py-1 rounded border border-orange-500 hover:bg-orange-600 flex items-center gap-1" title="Guerras de Guilda"> ⚔️ Guerra </button>
        </>
    );

    const renderSkillsButtons = () => {
        const hasBreeding = buildings.find(b => b.id === 'breeding_center' && b.level > 0);
        const hasRunes = buildings.find(b => b.id === 'rune_sanctuary' && b.level > 0);

        return (
            <>
                {setShowPetSpace && (
                    <button
                        onClick={() => setShowPetSpace(true)}
                        disabled={!hasBreeding}
                        className={`btn-retro px-2 py-1 rounded border flex items-center gap-1 transition-all ${hasBreeding ? 'bg-purple-700 text-white border-purple-500 hover:bg-purple-600' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'}`}
                        title={hasBreeding ? "Espaço Pet (Gerenciar e Evoluir)" : "Bloqueado: Requer Centro de Criação na Vila"}
                    >
                        <PawPrint size={12} /> {hasBreeding ? "Espaço Pet" : "???"}
                        {!hasBreeding && <Lock size={8} />}
                    </button>
                )}

                <button
                    onClick={() => setShowRunes && setShowRunes(true)}
                    disabled={!hasRunes}
                    className={`btn-retro px-2 py-1 rounded border flex items-center gap-1 transition-all ${hasRunes ? 'bg-indigo-900 text-indigo-200 border-indigo-500 hover:bg-indigo-800' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'}`}
                    title={hasRunes ? "Forja de Runas" : "Bloqueado: Requer Santuário de Runas na Vila"}
                >
                    <Gem size={12} /> {hasRunes ? "Runas" : "???"}
                    {!hasRunes && <Lock size={8} />}
                </button>
            </>
        );
    };

    const renderSystemButtons = () => (
        <>
            <button onClick={() => setShowQuests && setShowQuests(true)} className="btn-retro bg-blue-900 text-blue-200 px-2 py-1 rounded border border-blue-500 flex items-center gap-1 hover:bg-blue-800" title="Missões"><Scroll size={12} /> Missões</button>
            {setShowDailyRewards && <button onClick={() => setShowDailyRewards(true)} className="btn-retro bg-pink-900 text-pink-200 px-2 py-1 rounded border border-pink-500 flex items-center gap-1 hover:bg-pink-800" title="Recompensas Diárias"><Calendar size={12} /> Diárias</button>}
            <button onClick={() => setShowAchievements && setShowAchievements(true)} className="btn-retro bg-yellow-900 text-yellow-200 px-2 py-1 rounded border border-yellow-500 flex items-center gap-1 hover:bg-yellow-800" title="Conquistas"><Trophy size={12} /> Troféus</button>
            {setShowLeaderboard && <button onClick={() => setShowLeaderboard(true)} className="btn-retro bg-yellow-600 text-white px-2 py-1 rounded border border-yellow-400 flex items-center gap-1 hover:bg-yellow-500" title="Rankings"><Crown size={12} /> Rank</button>}
            {setShowMuseum && <button onClick={() => setShowMuseum(true)} className="btn-retro bg-emerald-900 text-emerald-200 px-2 py-1 rounded border border-emerald-500 flex items-center gap-1 hover:bg-emerald-800" title="O Museu"><BookOpen size={12} /> Museu</button>}
            <button onClick={() => setShowStats(true)} className="btn-retro bg-blue-900 text-blue-200 px-2 py-1 rounded border border-blue-500 flex items-center gap-1 hover:bg-blue-800" title="Status"><BarChart2 size={12} /> Status</button>
            <button onClick={() => setShowBestiary(true)} className="btn-retro bg-amber-900 text-amber-200 px-2 py-1 rounded border border-amber-600 flex items-center hover:bg-amber-800 text-[10px]" title="Bestiário (Registro de Monstros)"><BookOpen size={12} /> Bestiário</button>
            {setShowStarlight && <button onClick={() => setShowStarlight(true)} className="btn-retro bg-cyan-950 text-cyan-400 px-2 py-1 rounded border border-cyan-500 flex items-center gap-1 hover:bg-cyan-900 animate-pulse" title="Constelações de Automação"><Settings size={12} /> Auto</button>}
            <button onClick={() => setShowSettings(true)} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600"><Settings size={12} /></button>
            <button onClick={() => setShowHelp(true)} className="btn-retro bg-gray-600 text-gray-200 px-2 py-1 rounded border border-gray-400 flex items-center gap-1 hover:bg-gray-500" title="Ajuda"><HelpCircle size={12} /></button>
            {!outerSpaceUnlocked && boss.level >= 50 && (
                <button
                    onClick={actions.unlockOuterSpace}
                    className="btn-retro bg-indigo-600 text-white px-2 py-1 rounded border border-indigo-400 hover:bg-indigo-500 animate-pulse flex items-center gap-1"
                    title="Desbloquear Galáxia e Forja Estelar"
                >
                    <Zap size={12} /> Liberar Espaço Externo
                </button>
            )}
            {/* Renascer button with Portal Animation */}
            <button
                onClick={actions.triggerRebirth}
                className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1 rounded text-white flex items-center gap-1 text-xs font-bold transition-all group"
                title="Ascender (Reinicia ganhando Almas Celestiais)"
            >
                <Ghost size={12} className="group-hover:animate-bounce" />
                Ascender
            </button>
            {setShowDevTools && <button onClick={() => setShowDevTools(true)} className="btn-retro bg-red-900/50 text-red-400 p-2 rounded border border-red-900 hover:bg-red-800 hover:text-white transition-all" title="Ferramentas de Desenvolvedor"><ShieldAlert size={12} /></button>}
            <button onClick={actions.enterDungeon} className="btn-retro bg-stone-800 text-stone-200 px-2 py-1 rounded border border-stone-500 flex items-center gap-1 hover:bg-stone-700" title="Entrar na Masmorra"><Castle size={12} /> Masmorra</button>
        </>
    );

    return (
        <div className="bg-gray-900 p-2 border-b-4 border-gray-600 flex flex-col gap-2 rounded-t-lg shadow-lg z-10 sticky top-0">
            {/* Row 1: Stats & Resources */}
            <div className="flex flex-wrap justify-between items-center text-xs text-yellow-400 gap-2">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600 text-white font-bold">NVL {boss.level}</div>
                    <button onClick={() => setShowShop(true)} className="btn-retro bg-purple-900 text-purple-200 px-2 py-1 rounded border border-purple-500 flex items-center gap-1 hover:bg-purple-800 min-w-[60px] justify-center"> <Ghost size={12} /> {formatNumber(souls)} </button>
                    <button onClick={() => setShowTavern(true)} className="btn-retro bg-amber-700 text-amber-100 px-2 py-1 rounded border border-amber-500 flex items-center gap-1 hover:bg-amber-600 min-w-[60px] justify-center"> <Coins size={12} /> {formatNumber(gold)} </button>
                    {divinity > 0 && <button onClick={() => setShowStars(true)} className="btn-retro bg-cyan-900 text-cyan-200 px-2 py-1 rounded border border-cyan-500 flex items-center gap-1 hover:bg-cyan-800"><Crown size={12} /> {formatNumber(divinity)}</button>}

                    {/* Keys & Raid Status (Compact) */}
                    {keys > 0 && <span className="text-amber-500 flex items-center gap-1 bg-gray-800 px-2 py-1 rounded"><Key size={10} /> {keys}</span>}
                    {keys > 0 && !dungeonActive && (
                        <button onClick={actions.enterDungeon} className="btn-retro bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-500 text-[10px] animate-pulse border border-yellow-300">COFRE</button>
                    )}
                    {voidActive && <div className="text-purple-400 font-bold animate-pulse text-xs">VAZIO: {Math.floor(voidTimer)}s</div>}
                </div>

                <div className="flex gap-1 items-center">
                    {/* Weather Check */}
                    {weather && weatherTimer && (
                        <div className="bg-gray-800 px-2 py-1 rounded text-xs flex items-center gap-1 border border-gray-600 group relative cursor-help mr-2">
                            <span>{WEATHER_DATA[weather].icon}</span>
                            <span className="text-gray-500 font-mono text-[10px]">{Math.floor(weatherTimer / 60)}:{(weatherTimer % 60).toString().padStart(2, '0')}</span>

                            <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-600 p-2 rounded shadow-xl hidden group-hover:block z-50">
                                <div className="font-bold text-white mb-1 flex items-center gap-1">
                                    {WEATHER_DATA[weather].icon} {WEATHER_DATA[weather].name}
                                </div>
                                <div className="text-[10px] text-gray-400 italic mb-2">{WEATHER_DATA[weather].description}</div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                                    {WEATHER_DATA[weather].bonus.value > 0 && (
                                        <div className="text-green-400 col-span-2">➔ +{Math.round(WEATHER_DATA[weather].bonus.value * 100)}% {WEATHER_DATA[weather].bonus.stat.toUpperCase()}</div>
                                    )}
                                    {WEATHER_DATA[weather].bonus.value < 0 && (
                                        <div className="text-red-400 col-span-2">➔ {Math.round(WEATHER_DATA[weather].bonus.value * 100)}% {WEATHER_DATA[weather].bonus.stat.toUpperCase()}</div>
                                    )}

                                    {Object.entries(WEATHER_DATA[weather].elementModifiers).map(([el, mult]) => (
                                        <div key={el} className={mult > 1 ? 'text-blue-300' : 'text-red-300'}>
                                            {el}: {mult > 1 ? '+' : ''}{Math.round((mult - 1) * 100)}% Dano
                                        </div>
                                    ))}

                                    {WEATHER_DATA[weather].guildWarBonus.value !== 0 && (
                                        <div className={`col-span-2 mt-1 ${WEATHER_DATA[weather].guildWarBonus.value > 0 ? 'text-yellow-300' : 'text-red-400'}`}>
                                            ⚔️ Guerra: {WEATHER_DATA[weather].guildWarBonus.value > 0 ? '+' : ''}{Math.round(WEATHER_DATA[weather].guildWarBonus.value * 100)}% {WEATHER_DATA[weather].guildWarBonus.stat.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button onClick={actions.toggleSound} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600">{isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
                    <button onClick={() => actions.setGameSpeed(gameSpeed === 1 ? 2 : gameSpeed === 2 ? 5 : gameSpeed === 5 ? 10 : gameSpeed === 10 ? 25 : 1)} className="btn-retro bg-blue-700 px-2 py-1 rounded text-[10px] min-w-[40px] text-center"><Zap size={10} className="inline mr-1" />{gameSpeed}x</button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-gray-700 pb-2">
                <button
                    onClick={() => setActiveTab('main')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'main' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    <Home size={12} /> Geral
                </button>
                <button
                    onClick={() => setActiveTab('combat')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'combat' ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    <Swords size={12} /> Combate
                </button>
                <button
                    disabled={boss.level < 10 || !townVisited}
                    onClick={() => setActiveTab('skills')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all relative flex items-center gap-1 ${activeTab === 'skills' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'} ${(boss.level < 10 || !townVisited) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    title={boss.level < 10 || !townVisited ? "Desbloqueia no Nível 10 após visitar a Vila" : "Habilidades e Ofícios"}
                >
                    <Leaf size={12} /> Habilidades
                    {(boss.level < 10 || !townVisited) && <Lock size={8} className="absolute -top-1 -right-1 text-gray-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'system' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    <Settings size={12} /> Sistema
                </button>
            </div>

            {/* Row 3: Action Buttons (Dynamic) */}
            <div className="flex flex-wrap items-center text-xs gap-2 min-h-[32px]">
                {activeTab === 'main' && renderMainButtons()}
                {activeTab === 'combat' && renderCombatButtons()}
                {activeTab === 'skills' && renderSkillsButtons()}
                {activeTab === 'system' && renderSystemButtons()}
            </div>
        </div>
    );
};
