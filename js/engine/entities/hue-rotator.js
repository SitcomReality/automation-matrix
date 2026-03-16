import { getMachineOutputCell } from './utils.js';

export function canHueRotatorAccept(e, item, tx, ty) {
    const { ox, oy } = getMachineOutputCell(e);
    if (tx === ox && ty === oy) return false;
    return !e.state.processingItem;
}

export function processHueRotator(engine, e) {
    if (e.state.processTimer > 0) {
        e.state.anim = 1 - (e.state.processTimer / 40);
    } else {
        e.state.anim = 0;
    }

    if (!e.state.processingItem) {
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height && canHueRotatorAccept(e, item, item.x, item.y)) {
                e.state.processingItem = {...item};
                e.state.processTimer = 40;
                engine.items.splice(i, 1);
                break;
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
                        h: (original.h + 30) % 360,
                        x: nx, y: ny, progress: 0, outDir: destE.dir
                    });
                    e.state.processingItem = null;
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