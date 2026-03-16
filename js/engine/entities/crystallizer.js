import { audioManager } from '../../audio.js';

import { getMachineOutputCell } from './utils.js';

export function canCrystallizerAccept(e, item, tx, ty) {
    const { ox, oy } = getMachineOutputCell(e);
    if (tx === ox && ty === oy) return false;
    return !e.state.processingItem;
}

export function processCrystallizer(engine, e) {
    if (e.state.processTimer > 0) {
        e.state.anim = 1 - (e.state.processTimer / 180);
    } else {
        e.state.anim = 0;
    }

    if (!e.state.processingItem) {
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height) {
                if (canCrystallizerAccept(e, item, item.x, item.y)) {
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
            const { nx, ny } = getMachineOutputCell(e);
            const destE = engine.getEntityAt(nx, ny);

            if (destE && ['belt', 'splitter'].includes(destE.type)) {
                const blocked = engine.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5);
                if (!blocked) {
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
                    e.state.processTimer = 1; // Blocked: wait
                }
            } else {
                // Invalid output: discard
                e.state.processingItem = null;
            }
        }
    }
}