export function canHueRotatorAccept(e, item) {
    return !e.state.processingItem;
}

export function processHueRotator(engine, e) {
    if (!e.state.processingItem) {
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x === e.x && item.y === e.y && canHueRotatorAccept(e, item)) {
                e.state.processingItem = {...item};
                e.state.processTimer = 40;
                engine.items.splice(i, 1);
                break;
            }
        }
    } else {
        e.state.processTimer--;
        if (e.state.processTimer <= 0) {
            const { nx, ny } = {
                nx: e.x + (e.dir === 1 ? 1 : e.dir === 3 ? -1 : 0),
                ny: e.y + (e.dir === 2 ? 1 : e.dir === 0 ? -1 : 0)
            };
            const destE = engine.getEntityAt(nx, ny);
            if (destE && !engine.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5)) {
                const original = e.state.processingItem;
                engine.items.push({
                    ...original,
                    id: Math.random().toString(),
                    h: (original.h + 30) % 360,
                    x: nx, y: ny, progress: 0, outDir: destE.dir
                });
                e.state.processingItem = null;
            } else {
                e.state.processTimer = 1;
            }
        }
    }
}