import { useRef, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Sword, Flame, Heart, Skull } from 'lucide-react';
import './index.css';

function App() {
  const { heroes, boss, isPlayerTurn, activeHeroIndex, logs, gameOver, isAutoPlay, actions } = useGame();

  // Auto-scroll log
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // Get active hero
  const activeHero = heroes[activeHeroIndex];

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-2 relative overflow-hidden bg-gray-900">

      {/* Game Container */}
      <div className="w-full max-w-3xl h-full max-h-[900px] flex flex-col bg-gray-800 border-4 border-gray-600 rounded-lg shadow-2xl relative">

        {/* Header Info */}
        <div className="bg-gray-900 p-4 border-b-4 border-gray-600 flex justify-between items-center text-xs md:text-sm text-yellow-400">
          <div>LVL: <span className="text-white">{boss.level}</span></div>

          <button
            onClick={actions.toggleAutoPlay}
            className={`btn-retro bg-gray-700 text-white px-3 py-1 text-[10px] rounded border border-gray-500 hover:bg-gray-600 ${isAutoPlay ? 'bg-yellow-500 text-black pulse-gold' : ''}`}
          >
            AUTO: {isAutoPlay ? 'ON' : 'OFF'}
          </button>

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
              <div className={`text-6xl md:text-8xl filter drop-shadow-lg transition-transform ${isPlayerTurn ? '' : 'attack-down'} ${boss.isDead ? 'scale-0 rotate-180 transition-transform duration-700' : ''}`}>
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

          {/* VS Visual */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 text-4xl font-bold text-white pointer-events-none">
            VS
          </div>

          {/* Heroes Section (Party) */}
          <div className="grid grid-cols-3 gap-2 mb-4 w-full">
            {heroes.map((hero, index) => {
              const isActive = index === activeHeroIndex && isPlayerTurn && !hero.isDead;
              const isDead = hero.isDead;

              return (
                <div key={hero.id} className={`flex flex-col items-center p-2 rounded transition-all ${isActive ? 'bg-gray-800 border-2 border-yellow-500 transform scale-105' : 'opacity-80'}`}>
                  {/* Hero Sprite */}
                  <div className={`text-4xl md:text-5xl mb-2 ${isActive ? 'attack-up' : ''} ${isDead ? 'grayscale opacity-50' : ''}`}>
                    {hero.emoji}
                  </div>

                  {/* Bars */}
                  <div className="w-full flex flex-col gap-1">
                    {/* HP */}
                    <div className="w-full h-3 bg-gray-700 bar-container relative rounded">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${(hero.stats.hp / hero.stats.maxHp) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[6px] text-black font-bold z-10">
                        {hero.stats.hp}
                      </div>
                    </div>
                    {/* MP */}
                    <div className="w-full h-2 bg-gray-700 bar-container relative rounded">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${(hero.stats.mp / hero.stats.maxMp) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className={`mt-1 text-[8px] ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {hero.class}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combat Log */}
        <div ref={logRef} className="h-32 bg-black border-t-4 border-gray-600 p-2 text-[10px] md:text-xs text-green-400 overflow-y-auto font-mono leading-relaxed custom-scroll">
          <div className="text-yellow-500">{'>'} Welcome to RPG Eternal!</div>
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

        {/* Controls */}
        <div className="bg-gray-800 p-4 border-t-4 border-gray-600 grid grid-cols-3 gap-3">
          <button
            onClick={() => actions.action('attack')}
            disabled={!isPlayerTurn || isAutoPlay}
            className={`btn-retro bg-red-600 hover:bg-red-500 text-white py-3 rounded text-xs md:text-sm flex flex-col items-center gap-1 ${(!isPlayerTurn || isAutoPlay) ? 'btn-disabled' : ''}`}
          >
            <Sword className="w-4 h-4" />
            ATTACK
          </button>
          <button
            onClick={() => actions.action('magic')}
            disabled={!isPlayerTurn || isAutoPlay}
            className={`btn-retro bg-blue-600 hover:bg-blue-500 text-white py-3 rounded text-xs md:text-sm flex flex-col items-center gap-1 group relative ${(!isPlayerTurn || isAutoPlay) ? 'btn-disabled' : ''}`}
          >
            <Flame className="w-4 h-4" />
            MAGIC
            <span className="text-[8px] text-blue-200 block md:absolute md:bottom-1 md:right-1">15 MP</span>
          </button>
          <button
            onClick={() => actions.action('heal')}
            disabled={!isPlayerTurn || isAutoPlay}
            className={`btn-retro bg-green-600 hover:bg-green-500 text-white py-3 rounded text-xs md:text-sm flex flex-col items-center gap-1 group relative ${(!isPlayerTurn || isAutoPlay) ? 'btn-disabled' : ''}`}
          >
            <Heart className="w-4 h-4" />
            HEAL
            <span className="text-[8px] text-green-200 block md:absolute md:bottom-1 md:right-1">20 MP</span>
          </button>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-red-500 text-4xl mb-4 animate-pulse">GAME OVER</h1>
          <Skull className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-white mb-2">You survived until Level: <span className="text-yellow-400">{boss.level}</span></p>
          <button onClick={actions.reset} className="btn-retro bg-white text-black px-6 py-3 rounded hover:bg-gray-200 mt-8">
            TRY AGAIN
          </button>
        </div>
      )}

      <div className="absolute bottom-2 right-2 text-[8px] text-gray-600">
        Active: {activeHero?.name}
      </div>
    </div>
  )
}

export default App
