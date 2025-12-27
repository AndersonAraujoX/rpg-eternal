import { useGame } from './hooks/useGame'
import { BattleScene } from './components/BattleScene'
import { EntityCard } from './components/EntityCard'
import { CombatLog } from './components/CombatLog'
import './App.css'

function App() {
  const { hero, boss, isPlayerTurn, logs, gameOver, actions } = useGame();

  return (
    <div className="game-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#ffcc00', textShadow: '4px 4px #000' }}>RPG ETERNAL</h1>

      {/* Top HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <EntityCard entity={hero} isHero />
        <div style={{ textAlign: 'center' }}>
          <h3>Turn {isPlayerTurn ? 'PLAYER' : 'BOSS'}</h3>
        </div>
        <EntityCard entity={boss} />
      </div>

      {/* Battle Area */}
      <BattleScene hero={hero} boss={boss} isPlayerTurn={isPlayerTurn} />

      {/* Logs */}
      <CombatLog logs={logs} />

      {/* Controls */}
      <div className="pixel-border" style={{ padding: '20px', backgroundColor: '#333', textAlign: 'center' }}>
        {gameOver ? (
          <button onClick={actions.reset} style={{ backgroundColor: '#cc0000' }}>RESTART ETERNITY</button>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={actions.attack}
              disabled={!isPlayerTurn}
              style={{ opacity: !isPlayerTurn ? 0.5 : 1 }}
            >
              ATTACK
            </button>
            <button disabled style={{ opacity: 0.5 }}>MAGIC (S/N)</button>
            <button disabled style={{ opacity: 0.5 }}>ITEM (S/N)</button>
            <button disabled style={{ opacity: 0.5 }}>RUN (NEVER)</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.7rem', color: '#666' }}>
        Built with Antigravity
      </div>
    </div>
  )
}

export default App
