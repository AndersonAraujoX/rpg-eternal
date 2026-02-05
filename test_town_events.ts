import { generateTownEvent } from './src/engine/townEvents';

console.log("--- Testing Town Event Generation ---");

const stages = [1, 5, 20, 50, 100];
stages.forEach(stage => {
    console.log(`\nStage: ${stage}`);
    for (let i = 0; i < 3; i++) {
        const event = generateTownEvent(stage, []);
        if (event) {
            console.log(`- [${event.type.toUpperCase()}] ${event.name}: ${event.description}`);
            if (event.type === 'merchant') {
                console.log(`  Items: ${event.items?.map(i => i.name).join(', ')}`);
            } else if (event.type === 'raid') {
                console.log(`  Enemy Power: ${event.enemyPower}`);
            } else if (event.type === 'festival') {
                console.log(`  Buff: ${event.buffType} (+${event.buffValue})`);
            }
        }
    }
});
