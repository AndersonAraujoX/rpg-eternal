# 📁 Documentação Técnica: `src/utils/`

Esta pasta armazena funções utilitárias puras sem estado e helpers compartilhados.

## 📄 Arquivos e Helpers

| Arquivo | Função Principal | Recursos Exportados |
| :--- | :--- | :--- |
| **`isometric.ts`** | Utilitário para determinar se um lote no mapa 2D da prefeitura contém decorações naturais estéticas (árvores, flores). | `getTileDecoration` |

## 🛠️ Exemplo de Uso

```typescript
import { getTileDecoration } from './utils/isometric';

// Retorna uma decoração ou undefined para a coordenada X:2, Y:3
const decoracao = getTileDecoration(2, 3);
```
