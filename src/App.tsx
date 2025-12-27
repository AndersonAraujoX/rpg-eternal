import { useRef, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Sword, Volume2, VolumeX, RotateCcw, Ghost } from 'lucide-react';
import './index.css';

function App() {
  const { heroes, boss, logs, gameSpeed, isSoundOn, souls, pet, offlineGains, actions } = useGame();

  // Auto-scroll log
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // Dynamic Background Helper
  const getBackgroundClass = (level: number) => {
    const biome = level % 3; // 1=Forest, 2=Cave, 0=Dungeon
    if (biome === 1) return 'bg-forest';
    if (biome === 2) return 'bg-cave';
    return 'bg-dungeon';
  };

  return (
    <div className={`h-screen w-full flex flex-col items-center justify-center p-2 relative overflow-hidden ${getBackgroundClass(boss.level)}`}>
      <div className="crt-overlay"></div>

      {/* Offline Modal */}
      {offlineGains && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fade-in">
          <div className="bg-gray-800 border-4 border-yellow-500 p-6 rounded-lg max-w-sm text-center shadow-2xl">
            <h2 className="text-2xl text-yellow-400 mb-4 font-bold">WELCOME BACK!</h2>
            <div className="text-white whitespace-pre-line mb-6 font-mono text-sm">{offlineGains}</div>
            <button onClick={actions.closeOfflineModal} className="btn-retro bg-green-600 px-6 py-2 rounded text-white hover:bg-green-500 w-full">
              AWESOME!
            </button>
          </div>
        </div>
      )}

      {/* Game Container */}
      <div className="w-full max-w-3xl h-full max-h-[900px] flex flex-col bg-gray-800 bg-opacity-90 border-4 border-gray-600 rounded-lg shadow-2xl relative z-10 backdrop-blur-sm">

        {/* Header Info */}
        <div className="bg-gray-900 p-4 border-b-4 border-gray-600 flex justify-between items-center text-xs md:text-sm text-yellow-400">
          <div className="flex flex-col">
            <span>LVL: <span className="text-white">{boss.level}</span></span>
            <span className="text-[10px] text-purple-400 flex items-center gap-1"><Ghost size={10} /> SOULS: {souls}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={actions.toggleSound}
              className="btn-retro bg-gray-700 p-2 rounded hover:bg-gray-600"
            >
              {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={() => actions.setGameSpeed(gameSpeed === 1 ? 5 : 1)}
              className="btn-retro bg-blue-700 text-white px-3 py-1 text-[10px] rounded hover:bg-blue-600"
            >
              SPEED: {gameSpeed}x
            </button>

            {boss.level >= 10 && (
              <button
                onClick={actions.triggerRebirth}
                className="btn-retro bg-purple-700 text-white px-3 py-1 text-[10px] rounded hover:bg-purple-600 animate-pulse border border-purple-400"
                title="Reset for Souls Multiplier"
              >
                REBIRTH
              </button>
            )}
          </div>

          <div>BOSS HP: <span className="text-white">{boss.stats.hp}</span></div>
        </div>

        {/* Battle Area */}
        <div className="flex-1 relative bg-gray-900 flex flex-col justify-between p-4 overflow-hidden" id="battle-field">

          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-center items-center">
            <Sword className="w-64 h-64" />
          </div>

          {/* Boss Section */}
          <div className="flex flex-col items-center justify-center mt-4 transition-all">
            <div className="mb-2 text-red-400 text-sm md:text-base">{boss.name}</div>
            <div className="relative group">
              <div className={`text-6xl md:text-8xl filter drop-shadow-lg transition-transform ${boss.stats.hp < boss.stats.maxHp * 0.9 ? 'animate-pulse' : ''} ${boss.isDead ? 'scale-0 rotate-180 transition-transform duration-700' : ''}`}>
                {boss.emoji}
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="w-48 h-4 bg-gray-700 mt-4 bar-container relative rounded">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${(boss.stats.hp / boss.stats.maxHp) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white z-10">
                {boss.stats.hp}/{boss.stats.maxHp}
              </div>
            </div>
          </div>

          {/* PET RENDER */}
          {pet && (
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 flex flex-col items-center animate-bounce">
              <div className="text-3xl filter drop-shadow hover:scale-110 transition-transform cursor-pointer" title={`Pet Bonus: ${pet.bonus}`}>
                {pet.emoji}
              </div>
              <div className="text-[8px] text-gray-400 bg-black px-1 rounded bg-opacity-50">{pet.name}</div>
            </div>
          )}

          {/* Heroes Section */}
          <div className="grid grid-cols-3 gap-2 mb-4 w-full relative z-10">
            {heroes.map((hero) => {
              const isDead = hero.isDead;
              return (
                <div key={hero.id} className={`flex flex-col items-center p-2 rounded transition-all bg-gray-800 border-2 ${hero.stats.hp < hero.stats.maxHp * 0.3 ? 'border-red-500 animate-pulse' : 'border-gray-600'}`}>
                  <div className={`text-4xl md:text-5xl mb-2 ${isDead ? 'grayscale opacity-50' : 'attack-up'}`}>
                    {hero.emoji}
                  </div>

                  {/* Bars */}
                  <div className="w-full flex flex-col gap-1">
                    {/* HP */}
                    <div className="w-full h-3 bg-gray-700 bar-container relative rounded">
                      <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(hero.stats.hp / hero.stats.maxHp) * 100}%` }} />
                      <div className="absolute inset-0 flex items-center justify-center text-[6px] text-black font-bold z-10">{hero.stats.hp}</div>
                    </div>
                    {/* MP */}
                    <div className="w-full h-2 bg-gray-700 bar-container relative rounded">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(hero.stats.mp / hero.stats.maxMp) * 100}%` }} />
                    </div>
                  </div>
                  <div className="mt-1 text-[8px] text-gray-400">
                    ATK: {hero.stats.attack}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combat Log */}
        <div ref={logRef} className="h-32 bg-black border-t-4 border-gray-600 p-2 text-[10px] md:text-xs text-green-400 overflow-y-auto font-mono leading-relaxed custom-scroll">
          <div className="text-yellow-500">{'>'} AFK Mode: Observing Combat...</div>
          {logs.map(log => (
            <div key={log.id} style={{
              color: log.type === 'damage' ? '#f87171' :
                log.type === 'heal' ? '#4ade80' :
                  log.type === 'death' ? '#fbbf24' : '#9ca3af'
            }}>
              {'>'} {log.message}
            </div>
          ))}
        </div>

        {/* Footer/Reset */}
        <div className="bg-gray-800 p-2 border-t-4 border-gray-600 flex justify-between items-center text-[10px] text-gray-500">
          <span>Progress Saved Automatically</span>
          <button onClick={actions.resetSave} className="hover:text-red-500 flex items-center gap-1">
            <RotateCcw size={10} /> Full Reset
          </button>
        </div>

      </div>
    </div>
  )
}

export default App
