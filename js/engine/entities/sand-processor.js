import { getMachineOutputCell } from './utils.js';

export function canSandProcessorAccept(e, item, tx, ty) {
    const { ox, oy } = getMachineOutputCell(e);
    if (tx === ox && ty === oy) return false;
    return !e.state.processingItem;
}

export function processSandProcessor(engine, e) {
    if (!e.state) return;

    if (!e.state.phase) e.state.phase = 'idle';
    e.state.anim = e.state.processTimer / 30;

    for (let i = engine.items.length - 1; i >= 0; i--) {
        const item = engine.items[i];
        if (item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height) {
            if (canSandProcessorAccept(e, item, item.x, item.y)) {
                e.state.processingItem = {...item};
                e.state.phase = 'processing';
                engine.items.splice(i, 1);
                break;
            }
        }
    }
    
    if (engine.tick % 2 === 0) {
        for (let y = 28; y >= 0; y--) {
            for (let x = 0; x < 30; x++) {
                if (e.state.grid[y][x] === 1) {
                    if (e.state.grid[y+1][x] === 0) {
                        e.state.grid[y][x] = 0; e.state.grid[y+1][x] = 1;
                    } else {
                        let l = x > 0 && e.state.grid[y+1][x-1] === 0;
                        let r = x < 29 && e.state.grid[y+1][x+1] === 0;
                        if (l && r) { if (Math.random() > 0.5) { e.state.grid[y][x] = 0; e.state.grid[y+1][x-1] = 1; } else { e.state.grid[y][x] = 0; e.state.grid[y+1][x+1] = 1; } }
                        else if (l) { e.state.grid[y][x] = 0; e.state.grid[y+1][x-1] = 1; }
                        else if (r) { e.state.grid[y][x] = 0; e.state.grid[y+1][x+1] = 1; }
                    }
                }
            }
        }
    }
    let collected = 0;
    for (let x = 12; x <= 17; x++) { if (e.state.grid[29][x] === 1) { e.state.grid[29][x] = 0; collected++; } }
    if (e.state.phase === 'processing') {
        e.state.processTimer += 0.2; // Constant processing speed for visual satisfaction
        if (e.state.processTimer >= 30) {
            const { nx, ny } = getMachineOutputCell(e);
            const destE = engine.getEntityAt(nx, ny);
            
            if (destE && ['belt', 'splitter'].includes(destE.type)) {
                const blocked = engine.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5);
                if (!blocked) {
                    const original = e.state.processingItem;
                    engine.items.push({ 
                        ...original,
                        id: Math.random().toString(),
                        s: Math.min(100, original.s + 15),
                        l: Math.min(90, original.l + 10),
                        x: nx, y: ny, progress: 0, outDir: destE.dir 
                    });
                    e.state.processTimer = 0;
                    e.state.processingItem = null;
                    e.state.phase = 'idle';
                } else {
                    e.state.processTimer = 30; // Blocked: wait
                }
            } else {
                // Invalid output: discard
                e.state.processTimer = 0;
                e.state.processingItem = null;
                e.state.phase = 'idle';
            }
        }
    }
}