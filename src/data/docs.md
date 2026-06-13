# 📁 Documentação Técnica: `src/data/`

Esta pasta armazena planilhas de configuração estática e inicializações padrões da estrutura lógica do RPG.

## 📄 Arquivos e Configurações

| Arquivo | Função Principal | Dados Relevantes |
| :--- | :--- | :--- |
| **`buildings.ts`** | Contém o layout, preços, requisitos de andares e emojis de todos os prédios da prefeitura. | `BUILDINGS_LIST` |
| **`masteryData.ts`** | Define as recompensas por classe em cada nível de maestria acumulada. | `MASTERY_REWARDS` |
| **`npcTutorial.ts`** | Sequência de diálogos tutoriais com NPCs instrutores. | `NPC_TUTORIAL_STEPS` |
| **`skillTreeData.ts`** | Estruturação dos caminhos prioritários e coordenadas de nós da árvore automática de talentos. | `SKILL_TREE_NODES` |

## 🛠️ Exemplo de Uso (Importação de Blueprint)

```typescript
import { BUILDINGS_LIST } from './data/buildings';

// Exemplo: Buscar custo base do Altar de Deidades
const altarBlueprint = BUILDINGS_LIST.find(b => b.id === 'altar_deities');
const custoInicial = altarBlueprint?.cost;
```
