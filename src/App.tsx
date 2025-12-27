import { useRef, useEffect, useState } from 'react';
import { useGame } from './hooks/useGame';
import { Sword, Volume2, VolumeX, RotateCcw, Ghost, Coins, Crown, Skull } from 'lucide-react';
import './index.css';

function App() {
  const { heroes, boss, logs, gameSpeed, isSoundOn, souls, gold, divinity, pet, offlineGains, talents, artifacts, ultimateCharge, raidActive, raidTimer, actions } = useGame();

  const [showShop, setShowShop] = useState(false);
  const [showTavern, setShowTavern] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const getBackgroundClass = (level: number) => {
    if (level > 900) return 'bg-void'; // Raid boss or high level
    if (level > 40) return 'bg-lava';
    if (level > 20) return 'bg-ice';
    const biome = level % 3;
    if (biome === 1) return 'bg-forest';
    if (biome === 2) return 'bg-cave';
    return 'bg-dungeon';
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

      {/* Soul Shop Modal */}
      {showShop && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-95">
          <div className="bg-gray-900 border-4 border-purple-500 w-full max-w-lg p-4 rounded-lg shadow-2xl relative">
            <button onClick={() => setShowShop(false)} className="absolute top-2 right-2 text-red-500 font-bold">X</button>
            <h2 className="text-center text-purple-400 text-xl font-bold mb-4 flex items-center justify-center gap-2"><Ghost /> SOUL TALENT SHOP</h2>
            <div className="text-center text-white mb-4">You have <span className="text-purple-400">{souls} Souls</span></div>

            {souls > 1000 && (
              <div className="mb-4 bg-yellow-900 p-2 rounded border border-yellow-500 text-center animate-pulse">
                <button onClick={actions.triggerAscension} className="text-yellow-300 font-bold w-full">ASCEND (Reset for Divinity)</button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto">
              {talents.map(t => (
                <div key={t.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700">
                  <div>
                    <div className="text-yellow-300 font-bold text-sm">{t.name} <span className="text-xs text-gray-500">(Lvl {t.level}/{t.maxLevel})</span></div>
                    <div className="text-[10px] text-gray-400">{t.description}</div>
                  </div>
                  <button
                    onClick={() => actions.buyTalent(t.id)}
                    disabled={souls < t.cost || t.level >= t.maxLevel}
                    className={`text-[10px] px-3 py-1 rounded border ${souls >= t.cost && t.level < t.maxLevel ? 'bg-purple-600 border-purple-400 hover:bg-purple-500' : 'bg-gray-700 border-gray-600 opacity-50'}`}
                  >
                    {t.level >= t.maxLevel ? 'MAX' : `Upgrade (${t.cost})`}
                  </button>
                </div>
              ))}
            </div>
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

            <button
              onClick={actions.summonTavern}
              disabled={gold < 500}
              className="w-full bg-amber-700 hover:bg-amber-600 border-2 border-amber-400 text-white p-4 rounded mb-2 transition-all active:scale-95"
            >
              <div className="text-lg font-bold">SUMMON HERO / ITEM</div>
              <div className="text-sm opacity-75">Cost: 500 Gold</div>
            </button>
            <div className="text-[10px] text-amber-300">
              Chance for: New Classes (Rogue, Paladin, Warlock), Artifacts, or Stat Boosts.
            </div>
          </div>
        </div>
      )}

      {/* Game Container */}
      <div className="w-full max-w-4xl h-full max-h-[900px] flex flex-col bg-gray-800 bg-opacity-90 border-4 border-gray-600 rounded-lg shadow-2xl relative z-10 backdrop-blur-sm">

        {/* Header */}
        <div className="bg-gray-900 p-2 md:p-3 border-b-4 border-gray-600 flex flex-wrap justify-between items-center text-xs text-yellow-400 gap-2">
          <div className="flex flex-col">
            <span>LVL: <span className="text-white">{boss.level}</span></span>
            <span className="text-[10px] text-purple-400 cursor-pointer hover:underline" onClick={() => setShowShop(true)}>
              <Ghost size={10} className="inline" /> {souls}
            </span>
            <span className="text-[10px] text-yellow-400 cursor-pointer hover:underline" onClick={() => setShowTavern(true)}>
              <Coins size={10} className="inline" /> {gold}
            </span>
            {divinity > 0 && <span className="text-[10px] text-cyan-400"><Crown size={10} className="inline" /> {divinity}</span>}
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={() => setShowTavern(true)} className="btn-retro bg-amber-700 text-white px-2 py-1 rounded hover:bg-amber-600 text-[10px]"><Coins size={12} /> TAVERN</button>

            {boss.level >= 20 && (
              <button
                onClick={actions.toggleRaid}
                className={`btn-retro px-2 py-1 rounded text-[10px] flex items-center gap-1 ${raidActive ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-red-900'}`}
              >
                <Skull size={12} /> {raidActive ? `${Math.floor(raidTimer)}s` : 'RAID'}
              </button>
            )}

            <button onClick={actions.toggleSound} className="btn-retro bg-gray-700 p-2 rounded">{isSoundOn ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
            <button onClick={() => actions.setGameSpeed(gameSpeed === 1 ? 5 : 1)} className="btn-retro bg-blue-700 px-2 py-1 rounded text-[10px]">{gameSpeed}x</button>
            <button onClick={actions.triggerRebirth} className="btn-retro bg-purple-900 text-purple-200 px-2 py-1 rounded text-[10px] border border-purple-500">REBIRTH</button>
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
            <div className={`text-6xl md:text-8xl filter drop-shadow-lg transition-transform ${boss.stats.hp < boss.stats.maxHp * 0.9 ? 'animate-pulse' : ''} ${boss.isDead ? 'scale-0' : ''}`}>{boss.emoji}</div>

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

          {/* Heroes Grid (Scaled for 6) */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2 w-full relative z-10 mt-4">
            {heroes.map((hero) => (
              <div key={hero.id} className={`flex flex-col items-center p-1 rounded transition-all border-2 ${!hero.unlocked ? 'bg-gray-900 border-gray-700 opacity-50 grayscale' : 'bg-gray-800 border-gray-600'} ${hero.isDead ? 'grayscale opacity-50' : ''}`}>
                <div className="text-2xl md:text-3xl mb-1">{hero.unlocked ? hero.emoji : '🔒'}</div>
                {hero.unlocked && (
                  <div className="w-full h-2 bg-gray-700 bar-container relative rounded">
                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(hero.stats.hp / hero.stats.maxHp) * 100}%` }} />
                  </div>
                )}
                <div className="text-[6px] text-gray-500 mt-1">{hero.class}</div>
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
          <span>RBG Eternal v2.0 - {divinity > 0 ? `Divinity Rank ${divinity}` : 'Mortal Realm'}</span>
          <button onClick={actions.resetSave} className="hover:text-red-500 flex items-center gap-1"><RotateCcw size={10} /> Reset</button>
        </div>

      </div>
    </div>
  )
}

export default App
