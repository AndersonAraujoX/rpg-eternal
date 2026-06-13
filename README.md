# 🔮 Terras Eternas do Abismo — RPG Eternal

[![Vitest](https://img.shields.io/badge/tested%20with-vitest-729b1a.svg?logo=vitest&logoColor=white)](https://github.com/vitest-dev/vitest)
[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg?logo=vite&logoColor=white)](https://vitejs.dev/)

**Terras Eternas do Abismo** (RPG Eternal) é um jogo idle de RPG avançado para web desenvolvido com **React 18**, **TypeScript** e **Vite**. O jogo apresenta um sistema de progressão profundo, combate estratégico em turnos reais, IA de combate para automação (Gambits) e simulações complexas de mundo dinâmico, tudo embalado em uma estética premium retro pixel-art.

---

## 🌎 Idiomas / Languages
* [Português (Brasil)](#-português)
* [English](#-english)

---

## 🇧🇷 Português

### 🌟 Principais Recursos Recentes (Novidades!)

* **👥 Árvore de Auto-Skills Automatizada:**
  * Os heróis agora progridem de forma autônoma até o nível 100.
  * Distribuição automática de pontos de habilidades baseada em **Arquétipos** (Ataque, Defesa, Utilidade) e nas classes dos heróis (Guerreiros priorizam Defesa, Magos priorizam Ataque, etc.).
  * Visualização visual interativa no modal do herói com cadeados, conexões e níveis dinâmicos por tier.
* **🤖 Simulador de Jogadores Falsos (MMO Bot Ecosystem):**
  * Um motor de segundo plano que gera jogadores simulados (bots) com perfis variados (`hardcore`, `casual`, `lucky`).
  * Os bots evoluem, entram em masmorras, geram mensagens no chat global do jogo e servem como adversários dinâmicos na **Arena**.
* **⚔️ Guerra de Guildas GvG (Guild vs Guild):**
  * Sistema de combate assíncrono entre a guilda do jogador e guildas controladas por IA.
  * Conquista e defesa de territórios e upgrades de Monumentos da Guilda para bônus permanentes.
* **🪐 Relíquias, Ressonância Elemental e Forja do Vazio:**
  * **Relíquias Antigas:** Upgrades globais que reduzem custos de treino e aceleram ticks.
  * **Ressonância Elemental:** Bônus passivos multiplicativos ativados ao combinar elementos da equipe.
  * **Forja do Vazio:** Adiciona afixos especiais aos equipamentos (como chance de desviar de bosses `void_dodge` e chance de finalização instantânea `void_execute`).
* **📅 Missões Diárias, Mercado Dinâmico e Expedições:**
  * Sistema de streak de logins e missões diárias com resets de tempo mockáveis.
  * Mercado que renova estoques e gerencia persistência.
  * Expedições com recompensas baseadas em tempo real.

### 🛠️ Tecnologias Utilizadas
* **Interface**: React 18, TailwindCSS, CSS Vanilla (Efeitos retro e Glassmorphism)
* **Lógica**: TypeScript 5, Custom State Hooks com persistência automatizada no LocalStorage
* **Ícones**: Lucide React
* **Áudio**: Web Audio API (Sintetizadores e efeitos sonoros gerados dinamicamente via código)
* **Testes**: Vitest (Suíte com mais de 280 testes unitários cobrindo o motor de jogo)

---

## 🇺🇸 English

### 🌟 Core & Newly Integrated Features

* **👥 Automated Skill Tree (Auto-Skills):**
  * Heroes level up autonomously up to level 100.
  * Automated point allocation based on **Archetypes** (Attack, Defense, Utility) tailored for each hero class.
  * Beautiful visual skill tree tree nodes inside the Hero details modal with lock states, connection lines, and dynamic multipliers.
* **🤖 Fake Player Simulation (MMO Bot Ecosystem):**
  * A background simulator that spawns simulated players (bots) with unique profiles (`hardcore`, `casual`, `lucky`).
  * Bots level up, run dungeons, trigger global chat logs, and fight you as real opponents in the **Arena**.
* **⚔️ Guild vs Guild (GvG) Wars:**
  * Play asynchronous battles between your Guild and AI-controlled rival Guilds.
  * Conquer and hold territories, upgrade Guild Monuments, and benefit from global party stat boosts.
* **🪐 Relics, Elemental Resonance & Void Forge:**
  * **Ancient Relics:** Unlocks global active boosts, cost reduction, and tick speed upgrades.
  * **Elemental Resonance:** Passive multipliers triggered by composition elements.
  * **Void Forge:** Implements custom gear refinement suffixes (e.g. `void_dodge` or execution chances `void_execute`).
* **📅 Dailies, Market & Expeditions:**
  * Active login streak rewards, daily quests, and restockable market items.
  * Real-time automated expeditions with background duration checks.

### 🛠️ Tech Stack
* **Frontend**: React 18, TailwindCSS, Custom Vanilla CSS (Retro styling)
* **Logic & Engine**: TypeScript 5, Custom Hook Engine, LocalStorage Auto-Persistence
* **Icons**: Lucide React
* **Audio**: Web Audio API (Procedural SFX synthesizers)
* **Testing**: Vitest (280+ test cases covering the entire engine)

---

## 🚀 Como Iniciar / Getting Started

### Pré-requisitos / Prerequisites
* **Node.js** (v18+)
* **npm**

### Instalação / Installation

1. Clone o repositório / Clone the repo:
   ```bash
   git clone https://github.com/AndersonAraujoX/rpg-eternal.git
   cd rpg-eternal
   ```

2. Instale as dependências / Install packages:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento / Run dev server:
   ```bash
   npm run dev
   ```

4. Compilar para produção / Build for production:
   ```bash
   npm run build
   ```

5. Executar a suíte de testes / Run unit tests:
   ```bash
   npx vitest run
   ```

---

## ⌨️ Controles e Atalhos / Keyboard Shortcuts
* **ESC**: Fechar Modais / Close Modals
* **S**: Loja / Shop
* **I**: Inventário / Inventory
* **T**: Taberna / Tavern
* **C**: Cartas de Monstros / Monster Cards
* **G**: Guilda / Guild
* **H**: Ajuda / Help
* **R**: Runas / Runes
* **A**: Conquistas / Achievements

---
*Desenvolvido com ❤️ pelo RPG Eternal Team*
