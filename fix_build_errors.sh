#!/bin/bash
set -e

PROJECT="/home/anderson/Documents/projeto/eternal-rpg/rpg-eternal"
USEGAME="$PROJECT/src/hooks/useGame.ts"
APPTSX="$PROJECT/src/App.tsx"
TYPES="$PROJECT/src/engine/types.ts"

echo "=== Fix 1: Add isWorldBossModalActive as 3rd param to useGame ==="
sed -i 's/export const useGame = (\n\?\s*industryInventory?: Record<string, number>,\n\?\s*setIndustryState?: React.Dispatch<React.SetStateAction<IndustryState>>\n\?) => {//' "$USEGAME" 2>/dev/null || true
# Use perl for multiline replacement
perl -i -0pe 's/export const useGame = \(\n\s+industryInventory\?: Record<string, number>,\n\s+setIndustryState\?: React\.Dispatch<React\.SetStateAction<IndustryState>>\n\) => \{/export const useGame = (\n    industryInventory?: Record<string, number>,\n    setIndustryState?: React.Dispatch<React.SetStateAction<IndustryState>>,\n    isWorldBossModalActive?: boolean\n) => {/' "$USEGAME"
echo "Done."

echo "=== Fix 2: Add mechanizedCardsFused to usePersistence call ==="
perl -i -0pe 's/        unlockedRiftPerks,\n        setUnlockedRiftPerks\n    \}\);/        unlockedRiftPerks,\n        setUnlockedRiftPerks,\n        mechanizedCardsFused,\n        setMechanizedCardsFused\n    });/' "$USEGAME"
echo "Done."

echo "=== Fix 3: Move showWorldBoss before useGame in App.tsx ==="
# Add showWorldBoss state before useGame call
sed -i '/^function App() {$/,/const industry = useIndustry();/ {
  /const industry = useIndustry();/ a\  const [showWorldBoss, setShowWorldBoss] = useState(false); // Phase 6 — must be before useGame
}' "$APPTSX"
# Remove the old declaration
sed -i '/^  const \[showWorldBoss, setShowWorldBoss\] = useState(false); \/\/ Phase 6$/d' "$APPTSX"
echo "Done."

echo "=== Fix 4: Add voidOvergrowthActive to useGame destructuring in App.tsx ==="
sed -i 's/mechanizedCardsFused, fuseMechanizedCards$/mechanizedCardsFused, fuseMechanizedCards,\n    voidOvergrowthActive/' "$APPTSX" 2>/dev/null || true
# Try alternative: add voidOvergrowthActive after the fuseMechanizedCards line
perl -i -pe 's/(mechanizedCardsFused, fuseMechanizedCards)$/$1,\n    voidOvergrowthActive/' "$APPTSX"
echo "Done."

echo "=== Fix 5: Add fuseMechanizedCards to GameActions in types.ts ==="
sed -i "/sellOre: (oreType: 'copper' | 'iron', amount: number) => void;/a\\    fuseMechanizedCards: () => void;" "$TYPES"
echo "Done."

echo ""
echo "=== All fixes applied! Running build... ==="
cd "$PROJECT" && npm run build 2>&1 | tail -20
