# 📁 Documentação Técnica: `src/components/`

Esta pasta contém todos os componentes visuais, painéis de gerenciamento de guilda, áreas de batalha ativa e modais de jogo.

## 📄 Componentes de Tela Principais

| Componente | Função na Interface | Arquivo Relacionado |
| :--- | :--- | :--- |
| **`BattleArea`** | Renderiza a barra de vida do inimigo atual, heróis atacando e o histórico de dano com números flutuantes. | `BattleArea.tsx` |
| **`Header`** | Exibe as moedas de jogo, fendas, nível de torre, além de abrir atalhos para os painéis de controle. | `Header.tsx` |
| **`HeroList`** | Lista o roster do jogador com níveis e abas de posicionamento estratégico em formação. | `HeroList.tsx` |
| **`IsometricTownGrid`** | Renderiza o mapa bidimensional (2D) da prefeitura, exibindo construções e heróis caminhando autonomamente. | `IsometricTownGrid.tsx` |
| **`NpcInstructorWidget`** | Caixa de diálogo flutuante contendo instruções e tarefas de tutoriais do jogo. | `NpcInstructorWidget.tsx` |
| **`PetList`** | Painel simples para visualização rápida e gerenciamento de companheiros ativos. | `PetList.tsx` |
| **`SynergyTracker`** | Rastreador de bônus baseado em elementos/classes presentes no grupo. | `SynergyTracker.tsx` |
| **`TownEventWidget`** | Widget de notificação rápida de eventos climáticos ou aleatórios ocorridos na vila. | `TownEventWidget.tsx` |
| **`WeatherOverlays`** | Camada de overlay CSS que exibe partículas de chuva, tempestade ou neve na tela. | `WeatherOverlays.tsx` |

---

## 📂 Subdiretório: `src/components/modals/`

Aqui estão hospedados os painéis e modais detalhados de cada subsistema de RPG:

| Modal | Função / Finalidade |
| :--- | :--- |
| **`HeroDetailModal`** | Detalhes do herói, equipamentos, runas equipadas e a árvore de habilidades auto-skills. |
| **`GuildWarModal`** | Painel principal de controle da Guerra de Guildas (aba GvG contra bots e aba Conquistas). |
| **`ElementalResonanceModal`** | Templo elemental para evolução das essências do grupo. |
| **`RelicChamberModal`** | Painel para desbloquear, melhorar e equipar relíquias lendárias. |
| **`VoidInfusionModal`** | Forja especial de infusão de matéria do abismo. |
| **`BackroomsManagerModal`** | Interface de exploração e pesquisa científica das Backrooms. |
| **`RuneModal`** | Santuário para criação e fusão de runas mágicas. |
| **`RoguelikeModal`** | Painel de controle de nós e batalhas do modo de expedição roguelike. |
| **`TownModal`** | Prefeitura para melhoria de edifícios e seleção do Deus Padroeiro do Panteão. |

## 🛠️ Exemplo de Uso (Renderização de Modal)

```tsx
import { TownModal } from './components/modals/TownModal';

// Exemplo simples de chamada dentro do App.tsx
<TownModal 
  isOpen={showTown} 
  onClose={() => setShowTown(false)} 
  buildings={buildings} 
  gold={gold} 
  upgradeBuilding={upgradeBuilding}
/>
```
