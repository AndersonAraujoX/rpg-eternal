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
import { SettingsModal } from './components/modals/SettingsModal';
import { InventoryModal } from './components/modals/InventoryModal';
import { BestiaryModal } from './components/modals/BestiaryModal';
import { StatisticsModal } from './components/modals/StatisticsModal';
import { HelpModal } from './components/modals/HelpModal';
import { OfflineModal } from './components/modals/OfflineModal';
import { DailyRewardsModal } from './components/modals/DailyRewardsModal'; // Phase 56
import { HeroGearModal } from './components/modals/HeroGearModal'; // Phase 57

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
import { LeaderboardModal } from './components/modals/LeaderboardModal'; // Phase 60
import { DungeonModal } from './components/modals/DungeonModal'; // Phase 61
import { StarForgeModal } from './components/modals/StarForgeModal'; // Phase Star Forge
// PHASE 41


import { FishingModal } from './components/modals/FishingModal';
import { AlchemyModal } from './components/modals/AlchemyModal';
import { ExpeditionsModal } from './components/modals/ExpeditionsModal';
import { GardenModal } from './components/modals/GardenModal';
import { MarketModal } from './components/modals/MarketModal';
import { RiftModal } from './components/modals/RiftModal';
import { BreedingModal } from './components/modals/BreedingModal'; // Phase 46
import { GuildWarModal } from './components/modals/GuildWarModal'; // Phase 47
import { TownModal } from './components/modals/TownModal'; // Phase 53
import { MuseumModal } from './components/modals/MuseumModal';
import { CampfireModal } from './components/modals/CampfireModal'; // Phase 80

import './index.css';
import { CardBattleModal } from './components/modals/CardBattleModal'; // Phase 55

import { FAKE_LEADERBOARD } from './engine/initialData'; // Phase 60

function App() {
  const {
    heroes, boss, logs, gameSpeed, isSoundOn, souls, gold, divinity, pets, offlineGains,
    talents, artifacts, cards, constellations, keys, dungeonActive, dungeonTimer, resources, items,
    ultimateCharge, raidActive, raidTimer, tower, guild, voidMatter, voidActive, voidTimer,
    arenaRank, glory, quests, runes, achievements, starlight, starlightUpgrades, autoSellRarity, arenaOpponents,
    actions, partyDps, partyPower, combatEvents, theme, galaxy, monsterKills, gameStats,
    activeExpeditions, activePotions, gardenPlots, setGardenPlots, setResources, setGold,
    marketStock, marketTimer, buyMarketItem,
    activeRift, riftTimer, enterRift, exitRift,
    breedPets, // Phase 46
    territories, attackTerritory, // Phase 47
    weather, weatherTimer, // Phase 48
    buildings, upgradeBuilding, // Phase 53
    dailyQuests, dailyLoginClaimed, claimLoginReward, claimDailyQuest, checkDailies, // Phase 56
    winCardBattle, // Phase 55
    equipItem, unequipItem, // Phase 57
    spaceship, upgradeSpaceship, // Phase 59
    dungeonState, moveDungeon, exitDungeon, // Phase 61
    synergies, // Fixed: Destructured from useGame
    voidAscensions,
    formations, saveFormation, loadFormation, deleteFormation // Update 74
  } = useGame();


  const [showShop, setShowShop] = useState(false);
  const [showTown, setShowTown] = useState(false); // Phase 53
  const [showCardBattle, setShowCardBattle] = useState(false); // Phase 55
  const [showDailyRewards, setShowDailyRewards] = useState(false); // Phase 56
  const [showMarket, setShowMarket] = useState(false);
  const [showRiftModal, setShowRiftModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTavern, setShowTavern] = useState(false);
  const [showCampfire, setShowCampfire] = useState(false); // Phase 80
  const [showStars, setShowStars] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showStats, setShowStats] = useState(false);
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
  const [showStarForge, setShowStarForge] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // PHASE 41

  const [showFishing, setShowFishing] = useState(false);
  const [showAlchemy, setShowAlchemy] = useState(false);
  const [showExpeditions, setShowExpeditions] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false); // Phase 46
  const [showGuildWar, setShowGuildWar] = useState(false); // Phase 47
  const [showMuseum, setShowMuseum] = useState(false); // Phase 49
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null); // Phase 57

  const [importString, setImportString] = useState('');

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setShowShop(false); setShowTavern(false); setShowStars(false); setShowBestiary(false);
        setShowSettings(false); setShowForge(false); setShowInventory(false); setShowTower(false);
        setShowGuild(false); setShowVoid(false); setShowArena(false); setShowQuests(false);
        setShowRunes(false); setShowAchievements(false); setShowStarlight(false); setShowHelp(false);
        setShowGuild(false); setShowVoid(false); setShowArena(false); setShowQuests(false);
        setShowRunes(false); setShowAchievements(false); setShowStarlight(false); setShowHelp(false);
        setShowLog(false); setShowFishing(false); setShowAlchemy(false); setShowExpeditions(false);
      }
      if (e.key.toLowerCase() === 's') setShowShop(prev => !prev);
      if (e.key.toLowerCase() === 'i') setShowInventory(prev => !prev);
      if (e.key.toLowerCase() === 't') setShowTavern(prev => !prev);
      if (e.key.toLowerCase() === 'c') setShowBestiary(prev => !prev);
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

  // Phase 56: Auto-show Daily Rewards on new day/unclaimed
  // Phase 56: Auto-show Daily Rewards on new day/unclaimed
  useEffect(() => {
    // Check for reset on load
    if (checkDailies) checkDailies();

    // If not claimed, show modal
    if (dailyLoginClaimed === false) {
      setShowDailyRewards(true);
    }
  }, [dailyLoginClaimed]);

  const themeClass = getThemeClasses(theme);


  return (
    <div className={`h-screen w-full flex flex-col items-center justify-center p-2 relative overflow-hidden ${raidActive ? 'bg-red-900' : getBackgroundClass(boss.level)}`}>

      <div className="crt-overlay"></div>

      <CampfireModal isOpen={showCampfire} onClose={() => setShowCampfire(false)} heroes={heroes} onAssign={(id, type) => actions.assignHero(id, type)} />

      {/* Game Container */}
      <div className={`w-full max-w-4xl h-full max-h-[900px] flex flex-col bg-opacity-95 border-4 rounded-lg shadow-2xl relative z-10 backdrop-blur-sm transition-colors duration-500 ${themeClass}`}>

        <Header
          boss={boss} souls={souls} gold={gold} divinity={divinity} resources={resources} keys={keys}
          dungeonActive={dungeonActive} raidActive={raidActive} raidTimer={raidTimer} isSoundOn={isSoundOn} gameSpeed={gameSpeed} actions={actions}
          tower={tower} guild={guild} voidMatter={voidMatter} voidActive={voidActive} voidTimer={voidTimer}
          setShowShop={setShowShop} setShowTavern={setShowTavern} setShowStars={setShowStars} setShowForge={setShowForge}
          setShowInventory={setShowInventory} setShowBestiary={setShowBestiary} setShowSettings={setShowSettings} setShowStats={setShowStats}
          setShowTower={setShowTower} setShowGuild={setShowGuild} setShowVoid={setShowVoid}
          setShowArena={setShowArena} setShowQuests={setShowQuests} setShowDailyRewards={setShowDailyRewards} setShowGalaxy={setShowGalaxy}
          setShowLeaderboard={setShowLeaderboard}
          setShowRiftModal={setShowRiftModal}

          setShowBreedingModal={setShowBreedingModal} // Phase 46
          setShowGuildWar={setShowGuildWar} // Phase 47
          weather={weather} weatherTimer={weatherTimer} // Phase 48
          setShowMuseum={setShowMuseum} // Phase 49
          setShowTown={setShowTown} // Phase 53
          setShowCampfire={setShowCampfire} // Phase 80
          setShowStarForge={setShowStarForge}
          // setShowCardBattle - Triggered from Museum
          setShowRunes={setShowRunes} setShowAchievements={setShowAchievements} setShowStarlight={setShowStarlight} setShowHelp={setShowHelp}
          setShowFishing={setShowFishing} setShowAlchemy={setShowAlchemy} setShowExpeditions={setShowExpeditions} setShowGarden={setShowGarden}
        />

        <BattleArea
          boss={boss} dungeonActive={dungeonActive} dungeonTimer={dungeonTimer}
          ultimateCharge={ultimateCharge} pets={pets} actions={actions} artifacts={artifacts} heroes={heroes} partyDps={partyDps} partyPower={partyPower}
          combatEvents={combatEvents}
          synergies={synergies}
        />
        <HeroList
          heroes={heroes}
          activeSynergies={synergies}
          actions={{ ...actions, formations, saveFormation, loadFormation, deleteFormation }}
          onOpenGear={(hero) => setSelectedHeroId(hero.id)}
        />


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
      <BestiaryModal isOpen={showBestiary} onClose={() => setShowBestiary(false)} monsterKills={monsterKills} cards={cards} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} actions={actions} importString={importString} setImportString={setImportString} autoSellRarity={autoSellRarity} theme={theme} />
      {showShop && <ShopModal isOpen={true} onClose={() => setShowShop(false)} souls={souls} talents={talents} boss={boss} actions={actions} />}
      {showTavern && <TavernModal heroes={heroes} gold={gold} summonTavern={actions.summonTavern} onClose={() => setShowTavern(false)} setGold={setGold} />}
      {showForge && <ForgeModal resources={resources} forgeUpgrade={actions.forgeUpgrade} onClose={() => setShowForge(false)} setResources={setResources} />}
      {showInventory && <InventoryModal isOpen={true} items={items} onClose={() => setShowInventory(false)} />}
      <TowerModal isOpen={showTower} onClose={() => setShowTower(false)} tower={tower} actions={actions} starlight={starlight} />
      <GuildModal isOpen={showGuild} onClose={() => setShowGuild(false)} guild={guild} gold={gold} actions={actions} />
      <VoidModal isOpen={showVoid} onClose={() => setShowVoid(false)} voidMatter={voidMatter} actions={actions} />
      <ArenaModal isOpen={showArena} onClose={() => setShowArena(false)} rank={arenaRank} glory={glory} heroes={heroes} opponents={arenaOpponents} onFight={actions.fightArena} />
      {showQuests && (
        <QuestModal
          quests={quests}
          onClose={() => setShowQuests(false)}
          onClaim={actions.claimQuest}
        />
      )}
      <RuneModal isOpen={showRunes} onClose={() => setShowRunes(false)} items={items} resources={resources} souls={souls} actions={actions} runes={runes} />
      {showAchievements && <AchievementsModal isOpen={showAchievements} achievements={achievements} stats={gameStats} onClose={() => setShowAchievements(false)} />}
      <StatisticsModal isOpen={showStats} onClose={() => setShowStats(false)} stats={gameStats} />
      <StarlightModal isOpen={showStarlight} onClose={() => setShowStarlight(false)} starlight={starlight} upgrades={starlightUpgrades} onBuy={actions.buyStarlightUpgrade} />
      <GalaxyModal
        isOpen={showGalaxy}
        onClose={() => setShowGalaxy(false)}
        galaxy={galaxy}
        onConquer={actions.conquerSector}
        partyPower={partyPower}
        starlightUpgrades={starlightUpgrades}
        spaceship={spaceship}
        onUpgradeShip={upgradeSpaceship}
        towerFloor={tower.floor}
        voidAscensions={voidAscensions}
        onAscend={actions.ascendToVoid}
      />

      {/* PHASE 41 Modals */}
      <FishingModal isOpen={showFishing} onClose={() => setShowFishing(false)} fishCount={resources.fish || 0} setFish={() => actions.manualFish && actions.manualFish()} />

      <AlchemyModal isOpen={showAlchemy} onClose={() => setShowAlchemy(false)} resources={resources} activePotions={activePotions || []} brewPotion={actions.brewPotion} />

      <ExpeditionsModal isOpen={showExpeditions} onClose={() => setShowExpeditions(false)} activeExpeditions={activeExpeditions || []} heroes={heroes} startExpedition={actions.startExpedition} />

      <GardenModal isOpen={showGarden} onClose={() => setShowGarden(false)} plots={gardenPlots || []} setPlots={setGardenPlots} resources={resources} setResources={setResources} gold={gold} setGold={setGold} />

      <MarketModal isOpen={showMarket} onClose={() => setShowMarket(false)} stock={marketStock || []} buyItem={buyMarketItem} gold={gold} divinity={divinity} voidMatter={voidMatter} timer={marketTimer} />

      {/* RIFT OVERLAY */}
      {activeRift && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-900/90 border-2 border-red-500 text-white px-6 py-2 rounded-full z-50 flex items-center gap-4 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse backdrop-blur-md">
          <span className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {activeRift.name}
          </span>
          <span className="font-mono text-xl text-yellow-300 font-bold">{riftTimer}s</span>
          <button
            onClick={() => exitRift(false)}
            className="bg-black/50 hover:bg-black/80 px-3 py-1 rounded text-xs border border-red-500/50 uppercase font-bold tracking-wider hover:text-red-400 transition-colors"
          >
            Abandon
          </button>
        </div>
      )}

      <RiftModal
        isOpen={showRiftModal}
        onClose={() => setShowRiftModal(false)}
        partyPower={partyPower}
        startRift={(rift) => { enterRift(rift); setShowRiftModal(false); }}
      />
      {showBreedingModal && <BreedingModal isOpen={true} onClose={() => setShowBreedingModal(false)} pets={pets} breedPets={breedPets} gold={gold} />}
      {showGuildWar && <GuildWarModal onClose={() => setShowGuildWar(false)} territories={territories} onAttack={attackTerritory} partyPower={partyPower} />}
      <TownModal isOpen={showTown} onClose={() => setShowTown(false)} buildings={buildings} gold={gold} upgradeBuilding={upgradeBuilding} />
      {showMuseum && <MuseumModal onClose={() => setShowMuseum(false)} heroes={heroes} pets={pets} cards={cards} items={items} onDuel={() => { setShowMuseum(false); setShowCardBattle(true); }} />}
      <CardBattleModal isOpen={showCardBattle} onClose={() => setShowCardBattle(false)} cards={cards} onWin={winCardBattle} stats={gameStats} />

      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} entries={FAKE_LEADERBOARD} currentPower={partyPower} />
      {dungeonActive && <DungeonModal dungeon={dungeonState} onMove={moveDungeon} onExit={exitDungeon} />}

      {showDailyRewards && (
        <DailyRewardsModal
          onClose={() => setShowDailyRewards(false)}
          dailyQuests={dailyQuests || []}
          gameStats={gameStats}
          claimLoginReward={claimLoginReward}
          claimDailyQuest={claimDailyQuest}
          dailyLoginClaimed={dailyLoginClaimed}
        />
      )}

      {/* PHASE 57: Hero Gear */}
      {selectedHeroId && (
        <HeroGearModal
          isOpen={!!selectedHeroId}
          hero={heroes.find(h => h.id === selectedHeroId)!}
          inventory={items}
          onClose={() => setSelectedHeroId(null)}
          onEquip={equipItem}
          onUnequip={unequipItem}
        />
      )}
      <StarForgeModal
        isOpen={showStarForge}
        onClose={() => setShowStarForge(false)}
        starFragments={resources.starFragments || 0}
        gold={gold}
        onCraft={actions.craftStarForgedItem}
      />
    </div>
  );
}

export default App;
