import { blendHue, getMachineOutputCell } from './utils.js';
import { audioManager } from '../../audio.js';

export function canStitcherAccept(e, item, tx, ty) {
    const { ox, oy } = getMachineOutputCell(e);
    if (tx === ox && ty === oy) return false;
    return e.state.buffer.length < 2 && e.state.processTimer === 0;
}

export function processStitcher(engine, e) {
    if (!e.state) return;
    
    for (let i = engine.items.length - 1; i >= 0; i--) {
        const item = engine.items[i];
        if (item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height) {
            if (canStitcherAccept(e, item, item.x, item.y)) {
                e.state.buffer.push({...item});
                engine.items.splice(i, 1);
            }
        }
    }

    if (e.state.buffer.length === 2 && e.state.processTimer === 0) {
        e.state.processTimer = 120;
    }

    if (e.state.processTimer > 0) {
        e.state.processTimer--;
        if (e.state.processTimer === 0) {
            const [a, b] = e.state.buffer;
            const { nx, ny } = getMachineOutputCell(e);

            const destE = engine.getEntityAt(nx, ny);
            if (destE && ['belt', 'splitter'].includes(destE.type)) {
                const blocked = engine.items.find(it => it.x === nx && it.y === ny && it.progress < 0.5);
                if (!blocked) {
                    const maxSides = Math.max(a.sides, b.sides);
                    let nextSides = maxSides;
                    if (a.sides === b.sides) {
                        if (maxSides === 3) nextSides = 4;
                        else if (maxSides === 4) nextSides = 6;
                        else if (maxSides === 6) nextSides = 8;
                        else if (maxSides === 8) nextSides = 20;
                        else nextSides = 40;
                    }

                    engine.items.push({
                        id: Math.random().toString(),
                        type: 'stitched',
                        h: blendHue(a.h, b.h),
                        s: Math.max(a.s, b.s),
                        l: Math.max(a.l, b.l),
                        sides: nextSides,
                        x: nx, y: ny, progress: 0, outDir: destE.dir
                    });
                    e.state.buffer = [];
                    audioManager.play('place', 0.2);
                } else {
                    e.state.processTimer = 1; // Blocked: wait
                }
            } else {
                // Invalid output: discard
                e.state.buffer = [];
                e.state.processTimer = 0;
            }
        }
    }
}