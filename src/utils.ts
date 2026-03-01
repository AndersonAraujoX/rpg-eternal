export const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
};

export const translateStat = (stat: string) => {
    const stats: Record<string, string> = {
        'attack': 'Ataque',
        'defense': 'Defesa',
        'hp': 'HP',
        'magic': 'Magia',
        'speed': 'Velocidade',
        'gold': 'Ouro',
        'crit': 'Crítico',
        'bossDamage': 'Dano de Chefe',
        'soulDrop': 'Almas',
        'goldDrop': 'Ouro',
        'autoReviveSpeed': 'Ressurreição'
    };
    return stats[stat] || stat;
};
