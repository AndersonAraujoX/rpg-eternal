#!/bin/bash

# Ensure we exit if any command fails, except the merge itself which we want to handle
set -e

# Check for dirty working directory
if ! git diff-index --quiet HEAD --; then
    echo "⚠️ Você tem alterações não salvas no git. Por favor, faça commit ou stash delas antes de continuar."
    exit 1
fi

BRANCHES=(
    "origin/security/fix-bot-id-generation-18344574388057082475"
    "origin/fix-useindustry-deserialization-15069197794458966783"
    "origin/select-arena-opponents-fix-2940654363025746427"
    "origin/fix-card-battle-opponent-cards-2788003003300479490"
    "origin/fix-pet-breeding-comment-14138389711662098316"
    "origin/fix/tower-floor-persistence-10251841010422727984"
    "origin/fix/insecure-deserialization-xss-11125009955135342111"
    "origin/code-health/refactor-guildwar-modal-8231741266868499318"
    "origin/code-health-progression-overhaul-test-33323346927613781"
    "origin/remove-bossrushmodal-8584175446472566344"
    "origin/remove-dead-code-useascension-6269387201569795763"
    "origin/remove-formation-modal-12632576186527136810"
    "origin/fix/remove-dead-cardsmodal-16350512592558284458"
    "origin/test-getbestdamageskill-9056658169126981061"
    "origin/test/add-alchemy-brewpotion-tests-7360255299776591364"
    "origin/test/add-getActiveSkills-tests-3174722164560828006"
    "origin/test/skills-getPassiveStatBonus-14170655609016466144"
)

echo "🔄 Iniciando a integração de todas as branches pendentes..."

for branch in "${BRANCHES[@]}"; do
    echo "--------------------------------------------------"
    echo "➡️ Tentando mesclar: $branch"
    
    # Temporarily disable 'exit on error' for the merge command
    set +e
    git merge "$branch" --no-edit
    status=$?
    set -e
    
    if [ $status -eq 0 ]; then
        echo "✅ Mesclado com sucesso: $branch"
    else
        echo "⚠️ Conflito de mesclagem detectado ao mesclar $branch."
        echo "👉 Por favor, resolva os conflitos no seu editor, conclua o merge com 'git commit', e depois execute este script novamente para continuar com as demais branches."
        exit 1
    fi
done

echo "--------------------------------------------------"
echo "🎉 Todos os Pull Requests / Branches pendentes foram mesclados com sucesso!"
