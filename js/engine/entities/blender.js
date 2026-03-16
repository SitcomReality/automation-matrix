import { blendHue } from './utils.js';
import { audioManager } from '../../audio.js';

export function canBlenderAccept(e, item) {
    if (e.state.blending) return false;
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

    const outX = e.x + 2, outY = e.y;
    const destE = engine.getEntityAt(outX, outY);
    const blocked = engine.items.some(it => it.x === outX && it.y === outY && it.progress < 0.5);
    const canOutput = destE && ['belt', 'splitter', 'combiner'].includes(destE.type) && !blocked;

    if (canOutput) {
        e.state.animTick = (e.state.animTick || 0) + 1;
    }

    // Particle physics
    if (canOutput && engine.tick % 2 === 0) {
        for (let y = 18; y >= 0; y--) {
            for (let x = 0; x < 20; x++) {
                const val = e.state.grid[y][x];
                if (val > 0) {
                    if (e.state.grid[y + 1][x] === 0) {
                        e.state.grid[y][x] = 0; e.state.grid[y + 1][x] = val;
                    } else {
                        let l = x > 0 && e.state.grid[y + 1][x - 1] === 0;
                        let r = x < 19 && e.state.grid[y + 1][x + 1] === 0;
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
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + 2 && item.y >= e.y && item.y < e.y + 2) {
                if (canBlenderAccept(e, item)) {
                    let typeIdx = e.state.itemTypes.findIndex(t => 
                        t.h === item.h && t.s === item.s && t.l === item.l && t.sides === item.sides
                    );
                    
                    if (typeIdx === -1) {
                        e.state.itemTypes.push({h: item.h, s: item.s, l: item.l, sides: item.sides});
                        typeIdx = e.state.itemTypes.length - 1;
                    }
                    e.state.itemCounts[typeIdx]++;
                    
                    // Particle color based on input type
                    const pType = typeIdx + 1;
                    for (let k = 0; k < 40; k++) {
                        let sx = 5 + Math.floor(Math.random() * 10);
                        if (e.state.grid[0][sx] === 0) e.state.grid[0][sx] = pType;
                    }
                    engine.items.splice(i, 1);
                }
            }
        }
    }

    if (e.state.itemCounts[0] === 2 && e.state.itemCounts[1] === 2 && !e.state.blending && canOutput) {
        e.state.blending = true;
        e.state.blendTimer = 90;
        const itemA = e.state.itemTypes[0];
        const itemB = e.state.itemTypes[1];
        
        const h = blendHue(itemA.h, itemB.h);
        const s = Math.min(100, (itemA.s + itemB.s) / 2 + 10);
        const l = Math.min(80, (itemA.l + itemB.l) / 2 + 5);
        const sides = Math.max(itemA.sides, itemB.sides) + 1;
        
        e.state.blendedResult = { h, s, l, sides };
        e.state.blendColor = `hsl(${h}, ${s}%, ${l}%)`;
    }

    if (e.state.blending) {
        if (canOutput) {
            e.state.blendTimer--;
            
            if (engine.tick % 2 === 0) {
                for (let j = 0; j < 15; j++) {
                    let rx = Math.floor(Math.random() * 20);
                    let ry = Math.floor(Math.random() * 20);
                    if (e.state.grid[ry][rx] > 0) {
                        let pnx = (rx + (Math.random() > 0.5 ? 1 : -1) + 20) % 20;
                        let pny = (ry + (Math.random() > 0.5 ? 1 : -1) + 20) % 20;
                        if (e.state.grid[pny][pnx] === 0) {
                            e.state.grid[pny][pnx] = e.state.grid[ry][rx];
                            e.state.grid[ry][rx] = 0;
                        }
                    }
                }
            }
        }

        if (e.state.blendTimer <= 0 && canOutput) {
            const res = e.state.blendedResult;
            e.state.itemTypes = [];
            e.state.itemCounts = [0, 0];
            e.state.blending = false;
            e.state.grid = Array(20).fill(null).map(() => Array(20).fill(0));
            engine.items.push({ 
                id: Math.random().toString(), 
                type: 'mystic',
                h: res.h, s: res.s, l: res.l, sides: res.sides,
                x: outX, y: outY, progress: 0, outDir: destE.dir 
            });
            audioManager.play('money', 0.2);
        }
    }
}