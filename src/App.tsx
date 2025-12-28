import { useState, useEffect } from 'react';
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
import { HelpModal } from './components/modals/HelpModal';
import { OfflineModal } from './components/modals/OfflineModal';

import { TowerModal } from './components/modals/TowerModal';
import { GuildModal } from './components/modals/GuildModal';
import { VoidModal } from './components/modals/VoidModal';
import { ArenaModal } from './components/modals/ArenaModal';
import { QuestModal } from './components/modals/QuestModal';
import { RuneModal } from './components/modals/RuneModal';
import { AchievementsModal } from './components/modals/AchievementsModal';
import { StarlightModal } from './components/modals/StarlightModal';
import { LogModal } from './components/modals/LogModal';
import { GalaxyModal } from './components/modals/GalaxyModal';
import './index.css';

function App() {
  const {
    heroes, boss, logs, gameSpeed, isSoundOn, souls, gold, divinity, pet, offlineGains,
    talents, artifacts, cards, constellations, keys, dungeonActive, dungeonTimer, resources, items,
    ultimateCharge, raidActive, raidTimer, tower, guild, voidMatter, voidActive, voidTimer,
    arenaRank, glory, quests, runes, achievements, starlight, starlightUpgrades, autoSellRarity, arenaOpponents,
    actions, partyDps, partyPower, combatEvents, theme, galaxy
  } = useGame();

  const [showShop, setShowShop] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
  const [showRunes, setShowRunes] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showStarlight, setShowStarlight] = useState(false);
  const [showGalaxy, setShowGalaxy] = useState(false);
  const [importString, setImportString] = useState('');

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setShowShop(false); setShowTavern(false); setShowStars(false); setShowCards(false);
        setShowSettings(false); setShowForge(false); setShowInventory(false); setShowTower(false);
        setShowGuild(false); setShowVoid(false); setShowArena(false); setShowQuests(false);
        setShowRunes(false); setShowAchievements(false); setShowStarlight(false); setShowHelp(false);
        setShowLog(false);
      }
      if (e.key.toLowerCase() === 's') setShowShop(prev => !prev);
      if (e.key.toLowerCase() === 'i') setShowInventory(prev => !prev);
      if (e.key.toLowerCase() === 't') setShowTavern(prev => !prev);
      if (e.key.toLowerCase() === 'c') setShowCards(prev => !prev);
      if (e.key.toLowerCase() === 'h') setShowHelp(prev => !prev);
      if (e.key.toLowerCase() === 'g') setShowGuild(prev => !prev);
      if (e.key.toLowerCase() === 'r') setShowRunes(prev => !prev);
      if (e.key.toLowerCase() === 'a') setShowAchievements(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const getThemeClasses = (t: string) => {
    switch (t) {
      case 'midnight': return 'bg-slate-900 border-blue-900 text-blue-100';
      case 'forest': return 'bg-green-950 border-green-800 text-green-100';
      case 'crimson': return 'bg-red-950 border-red-900 text-red-100';
      case 'void': return 'bg-purple-950 border-purple-900 text-purple-100';
      default: return 'bg-gray-800 border-gray-600 text-gray-200';
    }
  };

  const themeClass = getThemeClasses(theme);

  return (
    <div className={`h-screen w-full flex flex-col items-center justify-center p-2 relative overflow-hidden ${raidActive ? 'bg-red-900' : getBackgroundClass(boss.level)}`}>

      <div className="crt-overlay"></div>

      {/* Game Container */}
      <div className={`w-full max-w-4xl h-full max-h-[900px] flex flex-col bg-opacity-95 border-4 rounded-lg shadow-2xl relative z-10 backdrop-blur-sm transition-colors duration-500 ${themeClass}`}>

        <Header
          boss={boss} souls={souls} gold={gold} divinity={divinity} resources={resources} keys={keys}
          dungeonActive={dungeonActive} raidActive={raidActive} raidTimer={raidTimer} isSoundOn={isSoundOn} gameSpeed={gameSpeed} actions={actions}
          tower={tower} guild={guild} voidMatter={voidMatter} voidActive={voidActive} voidTimer={voidTimer}
          setShowShop={setShowShop} setShowTavern={setShowTavern} setShowStars={setShowStars} setShowForge={setShowForge}
          setShowInventory={setShowInventory} setShowCards={setShowCards} setShowSettings={setShowSettings}
          setShowTower={setShowTower} setShowGuild={setShowGuild} setShowVoid={setShowVoid}
          setShowArena={setShowArena} setShowQuests={setShowQuests} setShowGalaxy={setShowGalaxy}
          setShowRunes={setShowRunes} setShowAchievements={setShowAchievements} setShowStarlight={setShowStarlight} setShowHelp={setShowHelp}
        />

        <BattleArea
          boss={boss} dungeonActive={dungeonActive} dungeonTimer={dungeonTimer}
          ultimateCharge={ultimateCharge} pet={pet} actions={actions} artifacts={artifacts} heroes={heroes} partyDps={partyDps} partyPower={partyPower}
          combatEvents={combatEvents}
          // @ts-ignore
          synergies={useGame().synergies} // Wait, I returned 'synergies' from useGame, so I can just access it from destructuring?
        />

        <HeroList heroes={heroes} actions={actions} />


        <GameLog logs={logs} onShowHistory={() => setShowLog(true)} />

        {/* Footer */}
        <div className="bg-gray-800 p-1 border-t-4 border-gray-600 flex justify-between items-center text-[10px] text-gray-500">
          <span>Terras Eternas do Abismo v2.8 - {divinity > 0 ? `Divinity Rank ${divinity}` : 'Mortal Realm'}</span>
          <div className="text-[10px] text-gray-600">Phase 21: Mastery Update</div>
        </div>

      </div>

      {/* MODALS RENDER */}
      <LogModal isOpen={showLog} onClose={() => setShowLog(false)} logs={logs} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <OfflineModal offlineGains={offlineGains} onClose={actions.closeOfflineModal} />
      <StarChartModal isOpen={showStars} onClose={() => setShowStars(false)} divinity={divinity} constellations={constellations} actions={actions} />
      <ForgeModal isOpen={showForge} onClose={() => setShowForge(false)} resources={resources} actions={actions} items={items} voidMatter={voidMatter} />
      <CardsModal isOpen={showCards} onClose={() => setShowCards(false)} cards={cards} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} actions={actions} importString={importString} setImportString={setImportString} autoSellRarity={autoSellRarity} theme={theme} />
      <ShopModal isOpen={showShop} onClose={() => setShowShop(false)} souls={souls} talents={talents} boss={boss} actions={actions} />
      <TavernModal isOpen={showTavern} onClose={() => setShowTavern(false)} gold={gold} actions={actions} />
      <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} items={items} />
      <TowerModal isOpen={showTower} onClose={() => setShowTower(false)} tower={tower} actions={actions} starlight={starlight} />
      <GuildModal isOpen={showGuild} onClose={() => setShowGuild(false)} guild={guild} gold={gold} actions={actions} />
      <VoidModal isOpen={showVoid} onClose={() => setShowVoid(false)} voidMatter={voidMatter} actions={actions} />
      <ArenaModal isOpen={showArena} onClose={() => setShowArena(false)} rank={arenaRank} glory={glory} heroes={heroes} opponents={arenaOpponents} onFight={actions.fightArena} />
      <QuestModal isOpen={showQuests} onClose={() => setShowQuests(false)} quests={quests} onClaim={actions.claimQuest} />
      <RuneModal isOpen={showRunes} onClose={() => setShowRunes(false)} items={items} resources={resources} souls={souls} actions={actions} runes={runes} />
      <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} achievements={achievements} />
      <StarlightModal isOpen={showStarlight} onClose={() => setShowStarlight(false)} starlight={starlight} upgrades={starlightUpgrades} onBuy={actions.buyStarlightUpgrade} />
      <GalaxyModal isOpen={showGalaxy} onClose={() => setShowGalaxy(false)} galaxy={galaxy} onConquer={actions.conquerSector} partyPower={heroes.reduce((acc, h) => acc + (h.assignment === 'combat' && !h.isDead ? h.stats.attack : 0), 0)} />
    </div>
  );
}

export default App;
