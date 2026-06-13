# 📁 Documentação Técnica: `src/engine/`

Esta pasta contém o núcleo de simulação, cálculos matemáticos, regras de negócio e mecânicas de jogo do RPG Eternal.

## 📄 Arquivos e Responsabilidades

| Arquivo | Propósito Principal | Funções e Recursos Relevantes |
| :--- | :--- | :--- |
| **`achievements.ts`** | Gerencia a validação e liberação de conquistas. | `checkAchievements` |
| **`alchemy.ts`** | Controla a criação e automação de poções. | `brewPotion`, `relic_alchemy_scroll` |
| **`arena.ts`** | Regula lutas e atualizações de ranques de arena contra bots. | `fightArena` |
| **`automation.ts`** | Processamento de ticks offline e automatizadores. | `processOfflineTicks` |
| **`backrooms.ts`** | Gerencia o minijogo reativo das Backrooms. | `BackroomsManager`, recrutamento de exploradores |
| **`bestiary.ts`** | Fornece bônus de atributos com base nos cartões de monstros. | `getCardBonus` |
| **`breeding.ts`** | Lógica de cruzamento de pets para gerar mutações de raridade. | `breedPets` |
| **`cardBattle.ts`** | Simulação do minijogo de cartas e combate turnado. | `playCardTurn` |
| **`classes.ts`** | Contém a definição das classes e coeficientes de atributos. | `HERO_CLASSES` |
| **`combat.ts`** | Mecânica central de combate turnado e processamento de turnos. | `processCombatTurn`, afixos do Vazio (`void_dodge`, `void_execute`) |
| **`combos.ts`** | Lógica para execução de combos de habilidades de classe. | `checkCombos` |
| **`dailies.ts`** | Prêmios de logins diários e verificação de missões ativas. | `checkDailies` |
| **`dungeon.ts`** | Estruturação de dungeons padrão, eventos de casas e navegação. | `moveDungeon`, `handleDungeonEvent` |
| **`expeditions.ts`** | Expedições de heróis ociosos em busca de fragmentos e caixas. | `startExpedition` |
| **`features.ts`** | Definição dos requisitos de desbloqueio das telas de jogo. | `FEATURES_LIST` |
| **`fishing.ts`** | Sistema de pescaria, taxas de peixes normais e lendários. | `manualFish` |
| **`galaxy.ts`** | Gerenciamento de setores galácticos e melhorias da nave. | `upgradeSpaceship`, `attackSector` |
| **`garden.ts`** | Plantação, irrigação e colheita de plantas ociosas. | `setGardenPlots`, `harvestPlot` |
| **`guild.ts`** | Gestão de monumentos de guilda e taxas de contribuição. | `enshrineHero` |
| **`guildWar.ts`** | Guerra de Guilda (GvG) assíncrona contra bots inimigos. | `simulateGvGTick`, `playerAttackTower` |
| **`industry.ts`** | Esteiras e máquinas de processamento da aba industrial. | `processTick`, criação de Catapulta/Canhão |
| **`initialData.ts`** | Perfil inicial do jogador com inventário zerado. | `INITIAL_GAME_STATE` |
| **`items.ts`** | Gerador de itens, afixos aleatórios e forja do Vazio. | `infuseItemWithVoid`, `craftStarForgedItem` |
| **`loot.ts`** | Tabela de loot e chances de drop em baús. | `rollLoot` |
| **`market.ts`** | Gerenciamento de estoque e cronômetro do mercado financeiro. | `marketStock`, `buyMarketItem` |
| **`playerSimulation.ts`** | Gerador e simulador de bots (fake players) no ranking. | `generateFakePlayer`, `simulateBotProgress` |
| **`relics.ts`** | Compra e modificadores globais dos artefatos da câmara. | `buyRelic`, `relic_chalice`, `relic_hourglass` |
| **`rifts.ts`** | Entrada e temporizadores de fendas temporais. | `startRift`, `selectBlessing` |
| **`roguelike.ts`** | Lógica da jornada planetária roguelike baseada em nós. | `startPlanetaryRun`, `resolveRoguelikeEventOption` |
| **`skills.ts`** | Habilidades ativas/passivas e alocação automática de skills. | `CLASS_SKILLS`, `autoAllocateSkillPoints` |
| **`synergies.ts`** | Bônus globais de alinhamento e classes. | `activeSynergies` |
| **`townEvents.ts`** | Eventos aleatórios dinâmicos na prefeitura. | `triggerTownEvent` |
| **`weather.ts`** | Climas e bônus ambientais modificadores de tick. | `invokeWeather` |
| **`worldBoss.ts`** | Chefes globais de invasão, danos acumulados e recompensas. | `attackWorldBoss`, `claimWorldBossReward` |

## 🛠️ Exemplo de Uso (Importação de Regras)

```typescript
import { processCombatTurn } from './engine/combat';
import { CLASS_SKILLS } from './engine/skills';

// As mecânicas de combate utilizam o array estático de habilidades
const skillsDisponiveis = CLASS_SKILLS['Warrior'];
```
