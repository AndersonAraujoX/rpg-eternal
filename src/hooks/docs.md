# 📁 Documentação Técnica: `src/hooks/`

Esta pasta centraliza os hooks customizados do React que controlam o ciclo de vida do estado global e dos subprocessos do RPG.

## 📄 Hooks e Responsabilidades

| Hook / Arquivo | Domínio de Estado | Funções e Recursos Relevantes |
| :--- | :--- | :--- |
| **`useBackrooms.ts`** | Minijogo de sobrevivência e exploração nas Backrooms. | `recruitExplorer`, `sendExplorer`, `researchTech` |
| **`useGalaxy.ts`** | Desbloqueio de setores estelares e invasões espaciais. | `attackSector`, `upgradeSpaceship` |
| **`useGame.ts`** | Loop principal do jogo, tick-cycle global e ações integradas. | `activeHeroesWithBonusStats`, `gvgWarState`, `activePotions` |
| **`useGuild.ts`** | Fila de contratação, upgrades e monumentos de heróis despertos. | `enshrineHero`, `pledgeDeity` |
| **`useIndustry.ts`** | Controle da esteira industrial e estoque de armas de cerco GvG. | `processTick`, fabricação de catapulta/plasma |
| **`usePersistence.ts`** | Salvamento e recuperação de todo o estado em `localStorage`. | `saveProfile`, `loadProfile` |
| **`usePets.ts`** | Sistema de mascotes, alimentação e reprodução por níveis. | `feedPet`, `breedPets` |
| **`useRoguelike.ts`** | Ciclo de vida e progressão de escolhas da jornada roguelike. | `startPlanetaryRun`, `selectRoguelikeNode` |
| **`useVoidGuardian.ts`** | Eventos e lutas do portal contra o guardião do abismo. | `voidActive`, `voidTimer` |
| **`useWorld.ts`** | Gerenciamento de andares da torre e clima ativo. | `weather`, `weatherTimer`, climas ativos |
| **`useWorldBoss.ts`** | Temporizadores de aparição e danos acumulados do chefe mundial. | `worldBoss`, `worldBossDamage` |

## 🛠️ Exemplo de Uso (Integração)

```tsx
import { useGame } from './hooks/useGame';

function MeuComponente() {
  const { gold, heroes, actions } = useGame();
  return <div>Ouro atual: {gold}</div>;
}
```
