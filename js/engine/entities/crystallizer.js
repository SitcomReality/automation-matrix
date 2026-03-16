import { audioManager } from '../../audio.js';

export function canCrystallizerAccept(e, item) {
    return !e.state.processingItem;
}

export function processCrystallizer(engine, e) {
    if (!e.state.processingItem) {
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + 3 && item.y >= e.y && item.y < e.y + 3) {
                if (canCrystallizerAccept(e, item)) {
                    e.state.processingItem = {...item};
                    e.state.processTimer = 180;
                    engine.items.splice(i, 1);
                    break;
                }
            }
        }
    } else {
        e.state.processTimer--;
        if (e.state.processTimer <= 0) {
            let nx, ny;
            if (e.dir === 0) { nx = e.x + 1; ny = e.y - 1; }
            else if (e.dir === 1) { nx = e.x + 3; ny = e.y + 1; }
            else if (e.dir === 2) { nx = e.x + 1; ny = e.y + 3; }
            else { nx = e.x - 1; ny = e.y + 1; }

            const destE = engine.getEntityAt(nx, ny);
            if (destE && !engine.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5)) {
                const original = e.state.processingItem;
                engine.items.push({
                    ...original,
                    id: Math.random().toString(),
                    s: 100,
                    l: Math.min(95, original.l + 10),
                    sides: original.sides >= 20 ? 40 : original.sides,
                    x: nx, y: ny, progress: 0, outDir: destE.dir
                });
                e.state.processingItem = null;
                audioManager.play('money', 0.4);
            } else {
                e.state.processTimer = 1;
            }
        }
    }
}