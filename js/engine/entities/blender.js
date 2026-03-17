import { blendHue } from './utils.js';
import { audioManager } from '../../audio.js';

import { getMachineOutputCell } from './utils.js';

export function canBlenderAccept(e, item, tx, ty) {
    if (e.state.blending) return false;
    
    // Check if item is entering through the output port
    const { ox, oy } = getMachineOutputCell(e);
    if (tx === ox && ty === oy) return false;

    const typeIdx = e.state.itemTypes.findIndex(t => 
        t.h === item.h && t.s === item.s && t.l === item.l && t.sides === item.sides
    );
    if (typeIdx !== -1) {
        return e.state.itemCounts[typeIdx] < 2;
    } else {
        return e.state.itemTypes.length < 2;
    }
}

export function processBlender(engine, e) {
    if (!e.state || !e.state.grid) return;

    const { nx: outX, ny: outY } = getMachineOutputCell(e);
    const destE = engine.getEntityAt(outX, outY);
    const blocked = engine.items.some(it => it.x === outX && it.y === outY && it.progress < 0.5);
    const canOutput = destE && ['belt', 'splitter'].includes(destE.type) && !blocked;

    if (e.state.blending) {
        e.state.animTick = (e.state.animTick || 0) + 1;
        e.state.anim = 1 - (e.state.blendTimer / 30);
    } else {
        e.state.anim = 0;
    }

    // Particle physics (only when not blending)
    if (!e.state.blending && engine.tick % 2 === 0) {
        const isBlade = (tx, ty) => {
            // Blade is a plus centered at 10, 10
            return (ty === 10 && tx >= 7 && tx <= 13) || (tx === 10 && ty >= 7 && ty <= 13);
        };

        for (let y = 18; y >= 0; y--) {
            for (let x = 0; x < 20; x++) {
                const val = e.state.grid[y][x];
                if (val > 0) {
                    if (e.state.grid[y + 1][x] === 0 && !isBlade(x, y + 1)) {
                        e.state.grid[y][x] = 0; e.state.grid[y + 1][x] = val;
                    } else {
                        let l = x > 0 && e.state.grid[y + 1][x - 1] === 0 && !isBlade(x - 1, y + 1);
                        let r = x < 19 && e.state.grid[y + 1][x + 1] === 0 && !isBlade(x + 1, y + 1);
                        if (l && r) { 
                            if (Math.random() > 0.5) { e.state.grid[y][x] = 0; e.state.grid[y + 1][x - 1] = val; } 
                            else { e.state.grid[y][x] = 0; e.state.grid[y + 1][x + 1] = val; } 
                        }
                        else if (l) { e.state.grid[y][x] = 0; e.state.grid[y + 1][x - 1] = val; }
                        else if (r) { e.state.grid[y][x] = 0; e.state.grid[y + 1][x + 1] = val; }
                    }
                }
            }
        }
    }

    if (!e.state.blending) {
        if (!e.state.spawnQueue) e.state.spawnQueue = [];

        // Handle staggered spawning
        for (let i = e.state.spawnQueue.length - 1; i >= 0; i--) {
            const entry = e.state.spawnQueue[i];
            if (entry.delay > 0) {
                entry.delay--;
            } else {
                let sx = 5 + Math.floor(Math.random() * 10);
                if (e.state.grid[0][sx] === 0) {
                    e.state.grid[0][sx] = entry.pType;
                    e.state.spawnQueue.splice(i, 1);
                }
            }
        }

        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height) {
                if (canBlenderAccept(e, item, item.x, item.y)) {
                    let typeIdx = e.state.itemTypes.findIndex(t => 
                        t.h === item.h && t.s === item.s && t.l === item.l && t.sides === item.sides
                    );
                    
                    if (typeIdx === -1) {
                        e.state.itemTypes.push({h: item.h, s: item.s, l: item.l, sides: item.sides});
                        typeIdx = e.state.itemTypes.length - 1;
                    }
                    e.state.itemCounts[typeIdx]++;
                    
                    // Queue particles instead of spawning instantly
                    const pType = typeIdx + 1;
                    for (let k = 0; k < 40; k++) {
                        e.state.spawnQueue.push({ pType, delay: Math.floor(Math.random() * 6) });
                    }
                    engine.items.splice(i, 1);
                }
            }
        }
    }

    if (e.state.itemCounts[0] === 2 && e.state.itemCounts[1] === 2 && !e.state.blending && canOutput) {
        e.state.blending = true;
        e.state.blendTimer = 30; // 500ms @ 60fps
        e.state.grid = Array(20).fill(null).map(() => Array(20).fill(0)); // Particles disappear
        if (e.state.spawnQueue) e.state.spawnQueue = [];
        
        const itemA = e.state.itemTypes[0];
        const itemB = e.state.itemTypes[1];
        
        const h = blendHue(itemA.h, itemB.h);
        const s = Math.min(100, (itemA.s + itemB.s) / 2 + 10);
        const l = Math.min(80, (itemA.l + itemB.l) / 2 + 5);
        const sides = Math.min(itemA.sides, itemB.sides);
        
        e.state.blendedResult = { h, s, l, sides };
        e.state.blendColor = `hsl(${h}, ${s}%, ${l}%)`;
    }

    if (e.state.blending) {
        e.state.blendTimer--;
        
        if (e.state.blendTimer <= 0) {
            const res = e.state.blendedResult;
            const resH = res.h;
            const resS = res.s;
            const resL = res.l;
            const resSides = res.sides;

            e.state.itemTypes = [];
            e.state.itemCounts = [0, 0];
            e.state.blending = false;

            // Only output if the destination is still valid; otherwise, the resources are discarded.
            if (destE && ['belt', 'splitter'].includes(destE.type)) {
                engine.items.push({ 
                    id: Math.random().toString(), 
                    type: 'mystic',
                    h: resH, s: resS, l: resL, sides: resSides,
                    x: outX, y: outY, progress: 0, outDir: destE.dir 
                });
                audioManager.play('money', 0.2);
            }
        }
    }
}