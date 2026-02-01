import React, { useState } from 'react';
import { Ghost, Coins, Crown, Hammer, Briefcase, Castle, Building, Key, Skull, Volume2, VolumeX, Zap, Settings, Swords, Scroll, Gem, Trophy, HelpCircle, BookOpen, BarChart2, Anchor, FlaskConical, Map, Leaf, Home, Calendar, Flame } from 'lucide-react';
import { formatNumber } from '../utils';
import type { Boss, Resources, Tower, Guild } from '../engine/types';
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
    raidActive: boolean;
    raidTimer: number;
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
    setShowBreedingModal?: (v: boolean) => void; // Phase 46
    setShowGuildWar?: (v: boolean) => void; // Phase 47
    weather?: WeatherType; // Phase 48
    weatherTimer?: number; // Phase 48
    setShowMuseum?: (v: boolean) => void; // Phase 49
    // Phase 53
    setShowTown?: (v: boolean) => void;
    setShowCampfire?: (v: boolean) => void; // Phase 80
}

export const Header: React.FC<HeaderProps> = ({
    boss, souls, gold, divinity, tower, guild, keys, voidMatter, dungeonActive, raidActive, raidTimer, voidActive, voidTimer, isSoundOn, gameSpeed, actions,
    setShowShop, setShowTavern, setShowStars, setShowForge, setShowInventory, setShowBestiary, setShowSettings, setShowStats,
    setShowTower, setShowGuild, setShowVoid, setShowArena, setShowQuests, setShowDailyRewards, setShowRunes, setShowAchievements, setShowStarlight, setShowHelp, setShowGalaxy,
    setShowLeaderboard,
    setShowFishing, setShowAlchemy, setShowExpeditions,
    setShowGarden,
    // setShowRiftModal, // Handled via actions? Check usage. actually it is unused in the component body currently provided.
    setShowBreedingModal, // Phase 46
    setShowGuildWar, // Phase 47
    weather, weatherTimer, // Phase 48
    setShowMuseum, // Phase 49
    setShowTown, // Phase 53
    setShowCampfire // Phase 80
}) => {
    const [activeTab, setActiveTab] = React.useState<'main' | 'combat' | 'skills' | 'system'>('main');

    // Button Groups
    const renderMainButtons = () => (
        <>
            <button onClick={() => setShowForge(true)} className="btn-retro bg-orange-900 text-orange-200 px-2 py-1 rounded border border-orange-500 flex items-center gap-1 hover:bg-orange-800" title="The Forge"><Hammer size={12} /> Forge</button>
            <button onClick={() => setShowInventory(true)} className="btn-retro bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-500 flex items-center gap-1 hover:bg-slate-600" title="Inventory"><Briefcase size={12} /> Bag</button>
            <button onClick={() => setShowGuild(true)} className="btn-retro bg-green-900 text-green-200 px-2 py-1 rounded border border-green-500 flex items-center gap-1 hover:bg-green-800" title="Guild"><Building size={12} /> Guild</button>
            {setShowTown && <button onClick={() => setShowTown(true)} className="btn-retro bg-stone-700 text-stone-200 px-2 py-1 rounded border border-stone-500 flex items-center gap-1 hover:bg-stone-600" title="Town"><Home size={12} /> Town</button>}
            {setShowCampfire && <button onClick={() => setShowCampfire(true)} className="btn-retro bg-orange-800 text-orange-200 px-2 py-1 rounded border border-orange-500 flex items-center gap-1 hover:bg-orange-700" title="Campfire"><Flame size={12} /> Rest</button>}
        </>
    );

    const renderCombatButtons = () => (
        <>
            <button onClick={() => setShowTower(true)} className="btn-retro bg-indigo-900 text-indigo-200 px-2 py-1 rounded border border-indigo-500 flex items-center gap-1 hover:bg-indigo-800" title="Tower"><Castle size={12} /> {tower.floor}</button>
            <button onClick={() => setShowArena && setShowArena(true)} className="btn-retro bg-red-900 text-red-200 px-2 py-1 rounded border border-red-500 flex items-center gap-1 hover:bg-red-800" title="Arena"><Swords size={12} /> Arena</button>
            {/* GALAXY BUTTON */}
            {setShowGalaxy && <button onClick={() => setShowGalaxy(true)} className="btn-retro bg-indigo-950 text-indigo-300 px-2 py-1 rounded border border-indigo-500 flex items-center gap-1 hover:bg-indigo-900" title="Galaxy Conquest"><Crown size={12} className="rotate-180" /> Galaxy</button>}

            {tower.floor >= 10 && (
                <button onClick={() => setShowVoid && setShowVoid(true)} className="flex items-center gap-1 bg-purple-900 border border-purple-700 px-2 py-1 rounded text-purple-100 hover:bg-purple-800 animate-pulse" title="The Void">
                    <Ghost size={12} /> {voidMatter}
                </button>
            )}
            {/* Phase 47: Guild War */}
            <button onClick={() => setShowGuildWar && setShowGuildWar(true)} className="btn-retro bg-orange-700 text-white px-2 py-1 rounded border border-orange-500 hover:bg-orange-600 flex items-center gap-1" title="Guild Wars"> ⚔️ War </button>
        </>
    );

    const renderSkillsButtons = () => (
        <>
            {/* Phase 46: Breeding Button */}
            <button onClick={() => setShowBreedingModal && setShowBreedingModal(true)} className="btn-retro bg-pink-700 text-white px-2 py-1 rounded border border-pink-500 hover:bg-pink-600 flex items-center gap-1" title="Pet Breeding"> 🧬 Breed </button>
            {/* PHASE 41 */}
            {setShowFishing && <button onClick={() => setShowFishing(true)} className="btn-retro bg-cyan-800 text-cyan-200 px-2 py-1 rounded border border-cyan-500 flex items-center gap-1 hover:bg-cyan-700" title="Fishing"><Anchor size={12} /> Fish</button>}
            {setShowAlchemy && <button onClick={() => setShowAlchemy(true)} className="btn-retro bg-purple-800 text-purple-200 px-2 py-1 rounded border border-purple-500 flex items-center gap-1 hover:bg-purple-700" title="Alchemy"><FlaskConical size={12} /> Brew</button>}
            {setShowExpeditions && <button onClick={() => setShowExpeditions(true)} className="btn-retro bg-amber-800 text-amber-200 px-2 py-1 rounded border border-amber-500 flex items-center gap-1 hover:bg-amber-700" title="Expeditions"><Map size={12} /> Explore</button>}
            {setShowGarden && <button onClick={() => setShowGarden(true)} className="btn-retro bg-green-800 text-green-200 px-2 py-1 rounded border border-green-500 flex items-center gap-1 hover:bg-green-700" title="The Great Garden"><Leaf size={12} /> Garden</button>}
            <button onClick={() => setShowRunes && setShowRunes(true)} className="btn-retro bg-indigo-900 text-indigo-200 px-2 py-1 rounded border border-indigo-500 flex items-center gap-1 hover:bg-indigo-800" title="Rune Forge"><Gem size={12} /> Runes</button>
        </>
    );

    const renderSystemButtons = () => (
        <>
            <button onClick={() => setShowQuests && setShowQuests(true)} className="btn-retro bg-blue-900 text-blue-200 px-2 py-1 rounded border border-blue-500 flex items-center gap-1 hover:bg-blue-800" title="Quests"><Scroll size={12} /> Quests</button>
            {setShowDailyRewards && <button onClick={() => setShowDailyRewards(true)} className="btn-retro bg-pink-900 text-pink-200 px-2 py-1 rounded border border-pink-500 flex items-center gap-1 hover:bg-pink-800" title="Daily Rewards"><Calendar size={12} /> Dailies</button>}
            <button onClick={() => setShowAchievements && setShowAchievements(true)} className="btn-retro bg-yellow-900 text-yellow-200 px-2 py-1 rounded border border-yellow-500 flex items-center gap-1 hover:bg-yellow-800" title="Achievements"><Trophy size={12} /> Trophies</button>
            {setShowLeaderboard && <button onClick={() => setShowLeaderboard(true)} className="btn-retro bg-yellow-600 text-white px-2 py-1 rounded border border-yellow-400 flex items-center gap-1 hover:bg-yellow-500" title="Leaderboards"><Crown size={12} /> Rank</button>}
            {setShowMuseum && <button onClick={() => setShowMuseum(true)} className="btn-retro bg-emerald-900 text-emerald-200 px-2 py-1 rounded border border-emerald-500 flex items-center gap-1 hover:bg-emerald-800" title="The Museum"><BookOpen size={12} /> Museum</button>}
            <button onClick={() => setShowStats(true)} className="btn-retro bg-blue-900 text-blue-200 px-2 py-1 rounded border border-blue-500 flex items-center gap-1 hover:bg-blue-800" title="Stats"><BarChart2 size={12} /> Stats</button>
            <button onClick={() => setShowBestiary(true)} className="btn-retro bg-amber-900 text-amber-200 px-2 py-1 rounded border border-amber-600 flex items-center hover:bg-amber-800 text-[10px]" title="Bestiary (Monster Log)"><BookOpen size={12} /> Bestiary</button>
            {setShowStarlight && <button onClick={() => setShowStarlight(true)} className="btn-retro bg-cyan-950 text-cyan-400 px-2 py-1 rounded border border-cyan-500 flex items-center gap-1 hover:bg-cyan-900 animate-pulse" title="Automation Constellations"><Settings size={12} /> Auto</button>}
            <button onClick={() => setShowSettings(true)} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600"><Settings size={12} /></button>
            <button onClick={() => setShowHelp(true)} className="btn-retro bg-gray-600 text-gray-200 px-2 py-1 rounded border border-gray-400 flex items-center gap-1 hover:bg-gray-500" title="Help"><HelpCircle size={12} /></button>
            <button onClick={actions.enterDungeon} className="btn-retro bg-stone-800 text-stone-200 px-2 py-1 rounded border border-stone-500 flex items-center gap-1 hover:bg-stone-700" title="Enter the Vault (Dungeon)"><Castle size={12} /> Vault</button>
        </>
    );

    return (
        <div className="bg-gray-900 p-2 border-b-4 border-gray-600 flex flex-col gap-2 rounded-t-lg shadow-lg z-10 sticky top-0">
            {/* Row 1: Stats & Resources */}
            <div className="flex flex-wrap justify-between items-center text-xs text-yellow-400 gap-2">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600 text-white font-bold">LVL {boss.level}</div>
                    <button onClick={() => setShowShop(true)} className="btn-retro bg-purple-900 text-purple-200 px-2 py-1 rounded border border-purple-500 flex items-center gap-1 hover:bg-purple-800 min-w-[60px] justify-center"> <Ghost size={12} /> {formatNumber(souls)} </button>
                    <button onClick={() => setShowTavern(true)} className="btn-retro bg-amber-700 text-amber-100 px-2 py-1 rounded border border-amber-500 flex items-center gap-1 hover:bg-amber-600 min-w-[60px] justify-center"> <Coins size={12} /> {formatNumber(gold)} </button>
                    {divinity > 0 && <button onClick={() => setShowStars(true)} className="btn-retro bg-cyan-900 text-cyan-200 px-2 py-1 rounded border border-cyan-500 flex items-center gap-1 hover:bg-cyan-800"><Crown size={12} /> {formatNumber(divinity)}</button>}

                    {/* Keys & Raid Status (Compact) */}
                    {keys > 0 && <span className="text-amber-500 flex items-center gap-1 bg-gray-800 px-2 py-1 rounded"><Key size={10} /> {keys}</span>}
                    {keys > 0 && !dungeonActive && (
                        <button onClick={actions.enterDungeon} className="btn-retro bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-500 text-[10px] animate-pulse border border-yellow-300">VAULT</button>
                    )}
                    {voidActive && <div className="text-purple-400 font-bold animate-pulse text-xs">VOID: {Math.floor(voidTimer)}s</div>}
                    {boss.level >= 20 && !dungeonActive && !voidActive && (
                        <button onClick={actions.toggleRaid} className={`btn-retro px-2 py-1 rounded text-[10px] flex items-center gap-1 ${raidActive ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-red-900'}`}> <Skull size={12} /> {raidActive ? `${Math.floor(raidTimer)}s` : 'RAID'} </button>
                    )}
                </div>

                <div className="flex gap-1 items-center">
                    {/* Weather Check */}
                    {weather && weatherTimer && (
                        <div className="bg-gray-800 px-2 py-1 rounded text-xs flex items-center gap-1 border border-gray-600 group relative cursor-help mr-2">
                            <span>{WEATHER_DATA[weather].icon}</span>
                            {/* <span className="hidden sm:inline text-gray-300">{weather}</span> */}
                            <span className="text-gray-500 font-mono text-[10px]">{Math.floor(weatherTimer / 60)}:{(weatherTimer % 60).toString().padStart(2, '0')}</span>

                            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-600 p-2 rounded shadow-xl hidden group-hover:block z-50">
                                <div className="font-bold text-white mb-1">{WEATHER_DATA[weather].name}</div>
                                <div className="text-[10px] text-green-400">Bonus: +{Math.abs(WEATHER_DATA[weather].bonus.value * 100)}% {WEATHER_DATA[weather].bonus.stat.toUpperCase()}</div>
                            </div>
                        </div>
                    )}

                    <button onClick={actions.toggleSound} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600">{isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
                    <button onClick={() => actions.setGameSpeed(gameSpeed === 1 ? 2 : gameSpeed === 2 ? 5 : gameSpeed === 5 ? 10 : gameSpeed === 10 ? 25 : 1)} className="btn-retro bg-blue-700 px-2 py-1 rounded text-[10px] min-w-[40px] text-center"><Zap size={10} className="inline mr-1" />{gameSpeed}x</button>
                </div>
            </div>

            {/* Row 2: Tabs */}
            <div className="flex gap-1 bg-gray-800 nav-tabs p-1 rounded">
                <button
                    onClick={() => setActiveTab('main')}
                    className={`flex-1 py-1 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${activeTab === 'main' ? 'bg-amber-600 text-white shadow' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                    <Home size={12} /> Main
                </button>
                <button
                    onClick={() => setActiveTab('combat')}
                    className={`flex-1 py-1 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${activeTab === 'combat' ? 'bg-red-700 text-white shadow' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                    <Swords size={12} /> Combat
                </button>
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`flex-1 py-1 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${activeTab === 'skills' ? 'bg-green-700 text-white shadow' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                    <Leaf size={12} /> Skills
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`flex-1 py-1 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${activeTab === 'system' ? 'bg-blue-700 text-white shadow' : 'bg-transparent text-gray-400 hover:text-white'}`}
                >
                    <Settings size={12} /> System
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

