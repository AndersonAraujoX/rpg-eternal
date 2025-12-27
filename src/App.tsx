import { useRef, useEffect, useState } from 'react';
import { useGame } from './hooks/useGame';
import { Sword, Volume2, VolumeX, RotateCcw, Ghost, Coins, Crown, Skull, Star, Layers, Key, Settings, Download, Upload, Hammer, Pickaxe, Flame, Droplets, Leaf } from 'lucide-react';
import './index.css';

function App() {
  const { heroes, boss, logs, gameSpeed, isSoundOn, souls, gold, divinity, keys, pet, offlineGains, talents, artifacts, cards, constellations, ultimateCharge, raidActive, raidTimer, dungeonActive, dungeonTimer, resources, actions } = useGame();

  const [showShop, setShowShop] = useState(false);
  const [showTavern, setShowTavern] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showForge, setShowForge] = useState(false);
  const [importString, setImportString] = useState('');

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const getBackgroundClass = (level: number) => {
    if (dungeonActive) return 'bg-amber-500'; // Gold Vault
    if (level > 900) return 'bg-void';
    if (level > 40) return 'bg-lava';
    if (level > 20) return 'bg-ice';
    const biome = level % 3;
    if (biome === 1) return 'bg-forest';
    if (biome === 2) return 'bg-cave';
    return 'bg-dungeon';
  };

  const getElementIcon = (el: string) => {
    if (el === 'fire') return <Flame size={12} className="text-red-400" />;
    if (el === 'water') return <Droplets size={12} className="text-blue-400" />;
    if (el === 'nature') return <Leaf size={12} className="text-green-400" />;
    return null;
  };

  return (
    <div className={`h-screen w-full flex flex-col items-center justify-center p-2 relative overflow-hidden ${raidActive ? 'bg-red-900' : getBackgroundClass(boss.level)}`}>
      <div className="crt-overlay"></div>

      {/* Offline Modal */}
      {offlineGains && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fade-in">
          <div className="bg-gray-800 border-4 border-yellow-500 p-6 rounded-lg max-w-sm text-center shadow-2xl">
            <h2 className="text-2xl text-yellow-400 mb-4 font-bold">WELCOME BACK!</h2>
            <div className="text-white whitespace-pre-line mb-6 font-mono text-sm">{offlineGains}</div>
            <button onClick={actions.closeOfflineModal} className="btn-retro bg-green-600 px-6 py-2 rounded text-white hover:bg-green-500 w-full">AWESOME!</button>
          </div>
        </div>
      )}

      {/* Star Chart Modal */}
      {showStars && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
          <div className="bg-slate-900 border-4 border-cyan-500 w-full max-w-2xl h-[80vh] p-4 rounded-lg shadow-2xl relative overflow-hidden">
            <button onClick={() => setShowStars(false)} className="absolute top-2 right-2 text-white font-bold z-10">X</button>
            <h2 className="text-center text-cyan-400 text-xl font-bold mb-4 flex items-center justify-center gap-2"><Star /> CELESTIAL REALM</h2>
            <div className="text-center text-white mb-4">Divinity: <span className="text-cyan-400">{divinity}</span></div>

            <div className="relative w-full h-full bg-slate-950 rounded border border-slate-700">
              {/* Stars */}
              {constellations.map(c => (
                <div key={c.id} className="absolute flex flex-col items-center group cursor-pointer" style={{ left: `${c.x}%`, top: `${c.y}%` }} onClick={() => actions.buyConstellation(c.id)}>
                  <div className={`w-4 h-4 rounded-full ${c.level > 0 ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-gray-600'} transition-all group-hover:scale-125`}></div>
                  <div className="mt-1 text-[10px] text-white bg-black bg-opacity-50 px-1 rounded whitespace-nowrap">
                    {c.name} (Lvl {c.level})
                  </div>
                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-8 bg-slate-800 p-2 rounded border border-cyan-500 text-xs text-left z-20 w-32">
                    <div className="font-bold text-cyan-300">{c.description}</div>
                    <div>Current: +{Math.round(c.level * c.valuePerLevel * 100)}%</div>
                    <div className={divinity >= c.cost && c.level < c.maxLevel ? 'text-green-400' : 'text-red-400'}>
                      Cost: {c.level >= c.maxLevel ? 'MAX' : c.cost} Div
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Forge Modal */}
      {showForge && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
          <div className="bg-gray-900 border-4 border-orange-500 w-full max-w-lg p-6 rounded-lg shadow-2xl relative text-center">
            <button onClick={() => setShowForge(false)} className="absolute top-2 right-2 text-white font-bold">X</button>
            <h2 className="text-orange-400 text-2xl font-bold mb-4 flex items-center justify-center gap-2"><Hammer /> THE BLACKSMITH</h2>

            <div className="flex justify-around mb-6 bg-gray-800 p-2 rounded">
              <div className="text-orange-300 text-xs flex flex-col items-center"><span>Copper</span><span className="text-lg text-white">{resources.copper}</span></div>
              <div className="text-gray-300 text-xs flex flex-col items-center"><span>Iron</span><span className="text-lg text-white">{resources.iron}</span></div>
              <div className="text-cyan-300 text-xs flex flex-col items-center"><span>Mithril</span><span className="text-lg text-white">{resources.mithril}</span></div>
            </div>

            <div className="space-y-2">
              <button onClick={() => actions.forgeUpgrade('copper')} disabled={resources.copper < 100} className="btn-retro w-full bg-orange-800 hover:bg-orange-700 disabled:opacity-50 text-white p-3 rounded flex justify-between items-center">
                <span>Forge Copper Gear (All Stats+)</span>
                <span className="text-xs">100 Ore</span>
              </button>
              <button onClick={() => actions.forgeUpgrade('iron')} disabled={resources.iron < 50} className="btn-retro w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white p-3 rounded flex justify-between items-center">
                <span>Forge Iron Gear (All Stats++)</span>
                <span className="text-xs">50 Ore</span>
              </button>
              <button onClick={() => actions.forgeUpgrade('mithril')} disabled={resources.mithril < 10} className="btn-retro w-full bg-cyan-900 hover:bg-cyan-800 disabled:opacity-50 text-white p-3 rounded flex justify-between items-center">
                <span>Forge Mithril Gear (All Stats+++)</span>
                <span className="text-xs">10 Ore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Modal */}
      {showCards && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
          <div className="bg-gray-900 border-4 border-white w-full max-w-lg h-[60vh] p-4 rounded-lg shadow-2xl relative">
            <button onClick={() => setShowCards(false)} className="absolute top-2 right-2 text-red-500 font-bold">X</button>
            <h2 className="text-center text-white text-xl font-bold mb-4 flex items-center justify-center gap-2"><Layers /> MONSTER CARDS</h2>
            <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[40vh] p-2">
              {cards.map(c => (
                <div key={c.id} className="bg-gray-800 border border-gray-600 p-2 rounded flex flex-col items-center justify-center" title={`+${Math.round(c.bonus * c.count * 100)}% Damage vs ${c.monsterName}`}>
                  <div className="text-2xl">{c.id}</div>
                  <div className="text-[10px] text-gray-400 mt-1">x{c.count}</div>
                </div>
              ))}
              {cards.length === 0 && <div className="col-span-4 text-center text-gray-500 py-10">No cards collected yet. Keep fighting!</div>}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
          <div className="bg-gray-800 border-4 border-gray-500 w-full max-w-md p-6 rounded-lg text-center relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-white font-bold">X</button>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2"><Settings /> SETTINGS</h2>

            <div className="space-y-4">
              <button onClick={() => { navigator.clipboard.writeText(actions.exportSave()); alert("Save copied to clipboard!"); }} className="btn-retro bg-blue-600 text-white w-full py-3 flex items-center justify-center gap-2">
                <Download size={16} /> EXPORT SAVE TO CLIPBOARD
              </button>

              <div className="flex gap-2">
                <input type="text" placeholder="Paste Save String..." className="bg-gray-900 border border-gray-600 text-white px-2 py-1 flex-1 rounded text-xs" value={importString} onChange={e => setImportString(e.target.value)} />
                <button onClick={() => actions.importSave(importString)} className="btn-retro bg-green-600 text-white px-4 py-1 rounded flex items-center gap-1">
                  <Upload size={16} /> IMPORT
                </button>
              </div>

              <button onClick={() => { if (confirm("Are you sure? This wipes everything.")) actions.resetSave(); }} className="btn-retro bg-red-600 text-white w-full py-2 flex items-center justify-center gap-2 mt-8 opacity-70 hover:opacity-100">
                <RotateCcw size={16} /> HARD RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soul Shop Modal (Includes Rebirth) */}
      {showShop && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
          <div className="bg-gray-900 border-4 border-purple-500 w-full max-w-lg p-4 rounded-lg shadow-2xl relative">
            <button onClick={() => setShowShop(false)} className="absolute top-2 right-2 text-white font-bold">X</button>
            <h2 className="text-center text-purple-400 text-xl font-bold mb-4 flex items-center justify-center gap-2"><Ghost /> SOUL TALENT SHOP</h2>
            <div className="text-center text-white mb-4">You have <span className="text-purple-400">{souls} Souls</span></div>

            {souls > 1000 && (
              <div className="mb-4 bg-yellow-900 p-2 rounded border border-yellow-500 text-center animate-pulse">
                <button onClick={actions.triggerAscension} className="text-yellow-300 font-bold w-full uppercase">Ascend (Get Divinity)</button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto mb-4">
              {talents.map(t => (
                <div key={t.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700">
                  <div>
                    <div className="text-yellow-300 font-bold text-sm">{t.name} <span className="text-xs text-gray-500">(Lvl {t.level}/{t.maxLevel})</span></div>
                    <div className="text-[10px] text-gray-400">{t.description}</div>
                  </div>
                  <button onClick={() => actions.buyTalent(t.id)} disabled={souls < t.cost || t.level >= t.maxLevel} className={`text-[10px] px-3 py-1 rounded border ${souls >= t.cost && t.level < t.maxLevel ? 'bg-purple-600 border-purple-400 hover:bg-purple-500' : 'bg-gray-700 border-gray-600 opacity-50'}`}> {t.level >= t.maxLevel ? 'MAX' : `Upgrade (${t.cost})`} </button>
                </div>
              ))}
            </div>

            {/* Rebirth Button inside Shop for visibility */}
            {boss.level > 10 && (
              <div className="mt-2 text-center border-t border-gray-600 pt-2">
                <div className="text-gray-400 text-xs mb-1">Stuck? Reset for Souls.</div>
                <button onClick={actions.triggerRebirth} className="btn-retro bg-red-900 text-red-200 border border-red-500 px-6 py-2 rounded hover:bg-red-800 w-full">REBIRTH ( +{Math.floor(boss.level / 5)} Souls )</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tavern Modal */}
      {showTavern && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
          <div className="bg-amber-900 border-4 border-amber-500 w-full max-w-md p-6 rounded-lg shadow-2xl relative text-center">
            <button onClick={() => setShowTavern(false)} className="absolute top-2 right-2 text-white font-bold">X</button>
            <h2 className="text-amber-200 text-2xl font-bold mb-4">THE TAVERN</h2>
            <div className="text-white mb-6">Current Gold: <span className="text-yellow-400 font-mono">{gold}</span></div>
            <button onClick={actions.summonTavern} disabled={gold < 500} className="w-full bg-amber-700 hover:bg-amber-600 border-2 border-amber-400 text-white p-4 rounded mb-2 transition-all active:scale-95"> <div className="text-lg font-bold">SUMMON HERO / ITEM</div> <div className="text-sm opacity-75">Cost: 500 Gold</div> </button>
            <div className="text-[10px] text-amber-300"> Chance for: New Classes (Rogue, Paladin, Warlock), Artifacts, or Stat Boosts. </div>
          </div>
        </div>
      )}

      {/* Game Container */}
      <div className="w-full max-w-4xl h-full max-h-[900px] flex flex-col bg-gray-800 bg-opacity-90 border-4 border-gray-600 rounded-lg shadow-2xl relative z-10 backdrop-blur-sm">

        {/* Header */}
        <div className="bg-gray-900 p-2 md:p-3 border-b-4 border-gray-600 flex flex-wrap justify-between items-center text-xs text-yellow-400 gap-1 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 px-2 py-1 rounded border border-gray-600 text-white font-bold">LVL {boss.level}</div>
            <button onClick={() => setShowShop(true)} className="btn-retro bg-purple-900 text-purple-200 px-2 py-1 rounded border border-purple-500 flex items-center gap-1 hover:bg-purple-800 min-w-[60px] justify-center"> <Ghost size={12} /> {souls} </button>
            <button onClick={() => setShowTavern(true)} className="btn-retro bg-amber-700 text-amber-100 px-2 py-1 rounded border border-amber-500 flex items-center gap-1 hover:bg-amber-600 min-w-[60px] justify-center"> <Coins size={12} /> {gold} </button>

            {divinity > 0 && <button onClick={() => setShowStars(true)} className="btn-retro bg-cyan-900 text-cyan-200 px-2 py-1 rounded border border-cyan-500 flex items-center gap-1 hover:bg-cyan-800"><Crown size={12} /> {divinity}</button>}

            <button onClick={() => setShowForge(true)} className="btn-retro bg-orange-900 text-orange-200 px-2 py-1 rounded border border-orange-500 flex items-center gap-1 hover:bg-orange-800" title="The Forge"><Hammer size={12} /></button>
          </div>

          <div className="flex gap-2 items-center flex-wrap justify-end">
            {keys > 0 && <span className="text-amber-500 flex items-center gap-1 bg-gray-800 px-2 py-1 rounded"><Key size={10} /> {keys}</span>}
            {keys > 0 && !dungeonActive && (
              <button onClick={actions.enterDungeon} className="btn-retro bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-500 text-[10px] animate-pulse border border-yellow-300">VAULT</button>
            )}
            {boss.level >= 20 && !dungeonActive && (
              <button onClick={actions.toggleRaid} className={`btn-retro px-2 py-1 rounded text-[10px] flex items-center gap-1 ${raidActive ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-red-900'}`}> <Skull size={12} /> {raidActive ? `${Math.floor(raidTimer)}s` : 'RAID'} </button>
            )}
            <button onClick={() => setShowCards(true)} className="btn-retro bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-600 text-[10px]"><Layers size={14} /></button>
            <button onClick={actions.toggleSound} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600">{isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
            <button onClick={() => actions.setGameSpeed(gameSpeed === 1 ? 5 : 1)} className="btn-retro bg-blue-700 px-2 py-1 rounded text-[10px]">{gameSpeed}x</button>
            <button onClick={() => setShowSettings(true)} className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600"><Settings size={12} /></button>
          </div>
        </div>

        {/* Battle Area */}
        <div className="flex-1 relative bg-gray-900 flex flex-col justify-between p-4 overflow-hidden" id="battle-field">
          {/* Artifacts */}
          <div className="absolute top-2 left-2 flex gap-1 z-20 flex-wrap max-w-[200px]">
            {artifacts.map(a => (
              <div key={a.id} className="w-5 h-5 bg-yellow-900 border border-yellow-500 rounded flex items-center justify-center text-[10px] cursor-help" title={a.name}>{a.emoji}</div>
            ))}
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center"><Sword className="w-64 h-64" /></div>

          {/* Boss */}
          <div className="flex flex-col items-center justify-center mt-2 transition-all">
            {dungeonActive && <div className="text-yellow-400 font-bold animate-pulse mb-2">GOLD VAULT: {Math.floor(dungeonTimer)}s</div>}
            <div className="flex items-center gap-2">
              <div className={`text-6xl md:text-8xl filter drop-shadow-lg transition-transform ${boss.stats.hp < boss.stats.maxHp * 0.9 ? 'animate-pulse' : ''} ${boss.isDead ? 'scale-0' : ''}`}>{boss.emoji}</div>
              <div className="text-white opacity-50" title={`Element: ${boss.element}`}>{getElementIcon(boss.element)}</div>
            </div>

            <div className="w-48 h-4 bg-gray-700 mt-2 bar-container relative rounded">
              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(boss.stats.hp / boss.stats.maxHp) * 100}%` }} />
              <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white z-10">{boss.stats.hp}/{boss.stats.maxHp}</div>
            </div>

            <div className="w-48 h-1 bg-gray-800 mt-1 relative rounded overflow-hidden">
              <div className={`h-full transition-all duration-100 ${ultimateCharge >= 100 ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-800'}`} style={{ width: `${ultimateCharge}%` }}></div>
            </div>
          </div>

          {/* Pet */}
          {pet && (
            <div className="absolute top-1/2 left-2 transform -translate-y-1/2 flex flex-col items-center animate-bounce z-20 opacity-80">
              <div className="text-2xl filter drop-shadow hover:scale-110 transition-transform cursor-pointer" title={`Pet Bonus: ${pet.bonus}`}>{pet.emoji}</div>
            </div>
          )}

          {/* Heroes Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2 w-full relative z-10 mt-4">
            {heroes.map((hero) => (
              <div key={hero.id} className={`flex flex-col items-center p-1 rounded transition-all border-2 relative group ${!hero.unlocked ? 'bg-gray-900 border-gray-700 opacity-50 grayscale' : 'bg-gray-800 border-gray-600'} ${hero.isDead ? 'grayscale opacity-50' : ''}`}>
                {/* Element Icon */}
                {hero.unlocked && <div className="absolute top-1 left-1 opacity-75">{getElementIcon(hero.element)}</div>}

                {/* Assignment Toggle */}
                {hero.unlocked && (
                  <button onClick={(e) => { e.stopPropagation(); actions.toggleAssignment(hero.id); }} className={`absolute top-1 right-1 p-1 rounded-full text-[10px] ${hero.assignment === 'mine' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                    {hero.assignment === 'mine' ? <Pickaxe size={10} /> : <Sword size={10} />}
                  </button>
                )}

                <div className="text-2xl md:text-3xl mb-1 mt-2">{hero.unlocked ? hero.emoji : '🔒'}</div>
                {hero.unlocked && (
                  <div className="w-full h-2 bg-gray-700 bar-container relative rounded">
                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(hero.stats.hp / hero.stats.maxHp) * 100}%` }} />
                  </div>
                )}
                <div className="text-[6px] text-gray-500 mt-1">{hero.class}</div>
                {hero.assignment === 'mine' && <div className="text-[8px] text-orange-400 animate-pulse">MINING...</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Log */}
        <div ref={logRef} className="h-32 bg-black border-t-4 border-gray-600 p-2 text-[10px] md:text-xs text-green-400 overflow-y-auto font-mono leading-relaxed custom-scroll">
          {logs.map(log => (
            <div key={log.id} style={{ color: log.type === 'damage' ? '#f87171' : log.type === 'heal' ? '#4ade80' : log.type === 'death' ? '#fbbf24' : '#9ca3af' }}>{'>'} {log.message}</div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-1 border-t-4 border-gray-600 flex justify-between items-center text-[10px] text-gray-500">
          <span>RBG Eternal v2.5 - {divinity > 0 ? `Divinity Rank ${divinity}` : 'Mortal Realm'}</span>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="hover:text-blue-400 flex items-center gap-1"><Settings size={10} /> Config</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
