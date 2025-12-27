import { useState } from 'react';
import { useGame } from './hooks/useGame';
import { Header } from './components/Header';
import { HeroList } from './components/HeroList';
import { BattleArea } from './components/BattleArea';
import { GameLog } from './components/GameLog';
import { ShopModal } from './components/modals/ShopModal';
import { TavernModal } from './components/modals/TavernModal';
import { ForgeModal } from './components/modals/ForgeModal';
import { StarChartModal } from './components/modals/StarChartModal';
import { CardsModal } from './components/modals/CardsModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { InventoryModal } from './components/modals/InventoryModal';
import { OfflineModal } from './components/modals/OfflineModal';
import { TowerModal } from './components/modals/TowerModal';
import { GuildModal } from './components/modals/GuildModal';
import { VoidModal } from './components/modals/VoidModal';
import { ArenaModal } from './components/modals/ArenaModal';
import { QuestModal } from './components/modals/QuestModal';
import './index.css';

function App() {
  const {
    heroes, boss, logs, gameSpeed, isSoundOn, souls, gold, divinity, pet, offlineGains,
    talents, artifacts, cards, constellations, keys, dungeonActive, dungeonTimer, resources,
    ultimateCharge, raidActive, raidTimer, tower, guild, voidMatter, voidActive, voidTimer,
    arenaRank, glory, quests,
    actions
  } = useGame();

  const [showShop, setShowShop] = useState(false);
  const [showTavern, setShowTavern] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showForge, setShowForge] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showTower, setShowTower] = useState(false);
  const [showGuild, setShowGuild] = useState(false);
  const [showVoid, setShowVoid] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [importString, setImportString] = useState('');

  const getBackgroundClass = (level: number) => {
    if (dungeonActive) return 'bg-amber-500'; // Gold Vault
    if (voidActive) return 'bg-void animate-pulse'; // Void Dimension
    if (tower.active) return 'bg-slate-900'; // Tower
    if (level > 900) return 'bg-void';
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

      <OfflineModal offlineGains={offlineGains} onClose={actions.closeOfflineModal} />
      <StarChartModal isOpen={showStars} onClose={() => setShowStars(false)} divinity={divinity} constellations={constellations} actions={actions} />
      <ForgeModal isOpen={showForge} onClose={() => setShowForge(false)} resources={resources} actions={actions} />
      <CardsModal isOpen={showCards} onClose={() => setShowCards(false)} cards={cards} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} actions={actions} importString={importString} setImportString={setImportString} />
      <ShopModal isOpen={showShop} onClose={() => setShowShop(false)} souls={souls} talents={talents} boss={boss} actions={actions} />
      <TavernModal isOpen={showTavern} onClose={() => setShowTavern(false)} gold={gold} actions={actions} />
      <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} />
      <TowerModal isOpen={showTower} onClose={() => setShowTower(false)} tower={tower} actions={actions} />
      <GuildModal isOpen={showGuild} onClose={() => setShowGuild(false)} guild={guild} gold={gold} actions={actions} />
      <VoidModal isOpen={showVoid} onClose={() => setShowVoid(false)} voidMatter={voidMatter} actions={actions} />
      <ArenaModal isOpen={showArena} onClose={() => setShowArena(false)} rank={arenaRank} glory={glory} heroes={heroes} onFight={actions.fightArena} />
      <QuestModal isOpen={showQuests} onClose={() => setShowQuests(false)} quests={quests} onClaim={actions.claimQuest} />

      {/* Game Container */}
      <div className="w-full max-w-4xl h-full max-h-[900px] flex flex-col bg-gray-800 bg-opacity-90 border-4 border-gray-600 rounded-lg shadow-2xl relative z-10 backdrop-blur-sm">

        <Header
          boss={boss} souls={souls} gold={gold} divinity={divinity} resources={resources} keys={keys}
          dungeonActive={dungeonActive} raidActive={raidActive} raidTimer={raidTimer} isSoundOn={isSoundOn} gameSpeed={gameSpeed} actions={actions}
          tower={tower} guild={guild} voidMatter={voidMatter} voidActive={voidActive} voidTimer={voidTimer}
          setShowShop={setShowShop} setShowTavern={setShowTavern} setShowStars={setShowStars} setShowForge={setShowForge}
          setShowInventory={setShowInventory} setShowCards={setShowCards} setShowSettings={setShowSettings}
          setShowTower={setShowTower} setShowGuild={setShowGuild} setShowVoid={setShowVoid}
        />

        <BattleArea
          boss={boss} dungeonActive={dungeonActive} dungeonTimer={dungeonTimer}
          ultimateCharge={ultimateCharge} pet={pet} actions={actions} artifacts={artifacts} heroes={heroes}
        />

        <HeroList heroes={heroes} actions={actions} />

        <GameLog logs={logs} />

        {/* Footer */}
        <div className="bg-gray-800 p-1 border-t-4 border-gray-600 flex justify-between items-center text-[10px] text-gray-500">
          <span>RBG Eternal v2.5 - {divinity > 0 ? `Divinity Rank ${divinity}` : 'Mortal Realm'}</span>
          <div className="text-[10px] text-gray-600">Phase 9: The Cosmic Void</div>
        </div>

      </div>
    </div>
  );
}

export default App;
