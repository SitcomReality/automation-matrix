import { TILE_SIZE, BASE_RESOURCES } from '../constants.js';
import { audioManager } from '../audio.js';

/**
 * Shortest-path Hue Blending
 * Ensures we blend across the most vibrant arc of the color wheel.
 */
function blendHue(h1, h2) {
    let a = h1 % 360;
    let b = h2 % 360;
    let diff = b - a;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return (a + diff / 2 + 360) % 360;
}

export function canAcceptItem(e, item) {
    if (!e || !e.state) return false;
    
    if (e.type === 'sand-processor') {
        return !e.state.processingItem;
    }
    
    if (e.type === 'blender') {
        return !e.state.blending && e.state.items.length < 2;
    }
    
    if (e.type === 'stitcher') {
        return e.state.buffer.length < 2 && e.state.processTimer === 0;
    }
    
    if (e.type === 'slot-machine') {
        return !e.state.spinning;
    }
    
    return false;
}

export function processEntity(engine, e) {
    // Miner Logic (guarded access to engine.tiles to avoid runtime errors if map is missing)
    if (e.type === 'miner' && engine.tick % 240 === 0) {
        const resKey = (engine.tiles && engine.tiles[e.y] && engine.tiles[e.y][e.x]) ? engine.tiles[e.y][e.x] : null;
        if (resKey && BASE_RESOURCES[resKey]) {
            const res = BASE_RESOURCES[resKey];
            const nx = e.x + 1;
            const ny = e.y;
            const destE = engine.getEntityAt(nx, ny);
            if (destE && ['belt', 'splitter', 'combiner'].includes(destE.type)) {
                const blocked = engine.items.find(i => i.x === nx && i.y === ny && i.progress < 1.0);
                if (!blocked) {
                    engine.items.push({ 
                        id: Math.random().toString(), 
                        type: 'fragment', 
                        h: res.h,
                        s: res.s,
                        l: res.l,
                        sides: res.sides,
                        x: nx, 
                        y: ny, 
                        progress: 0, 
                        inDir: 1, // Miner outputs East
                        outDir: destE.dir 
                    });
                }
            }
        }
    }

    // Blender logic
    if (e.type === 'blender') {
        if (!e.state || !e.state.grid) return;
        if (engine.tick % 2 === 0) {
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
                    if (canAcceptItem(e, item)) {
                        e.state.items.push({...item});
                        const pType = e.state.items.length;
                        for (let k = 0; k < 30; k++) {
                            let sx = 5 + Math.floor(Math.random() * 10);
                            if (e.state.grid[0][sx] === 0) e.state.grid[0][sx] = pType;
                        }
                        engine.items.splice(i, 1);
                    }
                }
            }
        }

        if (e.state.items.length === 2 && !e.state.blending) {
            e.state.blending = true;
            e.state.blendTimer = 60;
            const [itemA, itemB] = e.state.items;
            
            // Calculate blended HSL
            const h = blendHue(itemA.h, itemB.h);
            const s = Math.min(100, (itemA.s + itemB.s) / 2 + 10); // Boost saturation
            const l = Math.min(80, (itemA.l + itemB.l) / 2 + 5);  // Boost lightness
            const sides = Math.max(itemA.sides, itemB.sides) + 1; // Increase complexity
            
            e.state.blendedResult = { h, s, l, sides };
            e.state.blendColor = `hsl(${h}, ${s}%, ${l}%)`;
        }

        if (e.state.blending) {
            e.state.blendTimer--;
            
            // Swirl particles in the grid
            if (engine.tick % 2 === 0) {
                for (let j = 0; j < 15; j++) {
                    let rx = Math.floor(Math.random() * 20);
                    let ry = Math.floor(Math.random() * 20);
                    if (e.state.grid[ry][rx] > 0) {
                        let nx = (rx + (Math.random() > 0.5 ? 1 : -1) + 20) % 20;
                        let ny = (ry + (Math.random() > 0.5 ? 1 : -1) + 20) % 20;
                        if (e.state.grid[ny][nx] === 0) {
                            e.state.grid[ny][nx] = e.state.grid[ry][rx];
                            e.state.grid[ry][rx] = 0;
                        }
                    }
                }
            }

            if (e.state.blendTimer <= 0) {
                const nx = e.x + 2, ny = e.y;
                const destE = engine.getEntityAt(nx, ny);
                if (destE && ['belt','splitter','combiner'].includes(destE.type)) {
                    const blocked = engine.items.find(it => it.x === nx && it.y === ny && it.progress < 0.5);
                    if (!blocked) {
                        const res = e.state.blendedResult;
                        e.state.items = [];
                        e.state.blending = false;
                        e.state.grid = Array(20).fill(null).map(() => Array(20).fill(0));
                        engine.items.push({ 
                            id: Math.random().toString(), 
                            type: 'mystic',
                            h: res.h, s: res.s, l: res.l, sides: res.sides,
                            x: nx, y: ny, progress: 0, outDir: destE.dir 
                        });
                        audioManager.play('money', 0.2);
                    }
                }
            }
        }
    }

    // Slot Machine
    if (e.type === 'slot-machine') {
        if (!e.state) return;
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + 2 && item.y >= e.y && item.y < e.y + 2) {
                if (canAcceptItem(e, item)) {
                    // Payout multiplier based on complexity (sides) and vibrance (saturation)
                    let mult = (item.sides - 2) * (item.s / 50) * (item.l / 40);
                    e.state.spinning = true; e.state.spinTime = 60; e.state.multiplier = mult;
                    engine.items.splice(i, 1);
                }
            }
        }
        if (e.state.spinning) {
            e.state.spinTime--;
            if (engine.tick % 4 === 0) {
                e.state.reels = e.state.reels.map(() => Math.floor(Math.random() * 5));
            }
            if (e.state.spinTime <= 0) {
                e.state.spinning = false;
                const [r1, r2, r3] = e.state.reels;
                let payout = 5;
                if (r1 === r2 && r2 === r3) payout = 100;
                else if (r1 === r2 || r2 === r3 || r1 === r3) payout = 20;
                const final = payout * (e.state.multiplier || 0.1);
                engine.state.addCurrency(final);
                audioManager.play('money', 0.5);
                engine.notifications.push({ text: `+$${Math.floor(final)}`, x: (e.x + 1) * TILE_SIZE, y: e.y * TILE_SIZE, life: 60 });
            }
        }
    }

    // Stitcher logic
    if (e.type === 'stitcher') {
        if (!e.state) return;
        
        // Pull items from grid into internal buffer
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height) {
                if (e.state.buffer.length < 2 && e.state.processTimer === 0) {
                    e.state.buffer.push({...item});
                    engine.items.splice(i, 1);
                }
            }
        }

        if (e.state.buffer.length === 2 && e.state.processTimer === 0) {
            e.state.processTimer = 120; // 2 seconds at 60fps
        }

        if (e.state.processTimer > 0) {
            e.state.processTimer--;
            if (e.state.processTimer === 0) {
                const [a, b] = e.state.buffer;
                let nx, ny;
                if (e.dir === 0) { nx = e.x; ny = e.y - 1; }
                else if (e.dir === 1) { nx = e.x + e.width; ny = e.y; }
                else if (e.dir === 2) { nx = e.x; ny = e.y + e.height; }
                else { nx = e.x - 1; ny = e.y; }

                const destE = engine.getEntityAt(nx, ny);
                if (destE && ['belt', 'splitter'].includes(destE.type)) {
                    const blocked = engine.items.find(it => it.x === nx && it.y === ny && it.progress < 0.5);
                    if (!blocked) {
                        // Increase complexity logic
                        const maxSides = Math.max(a.sides, b.sides);
                        let nextSides = maxSides;
                        if (a.sides === b.sides) {
                            if (maxSides === 3) nextSides = 4;
                            else if (maxSides === 4) nextSides = 6;
                            else if (maxSides === 6) nextSides = 8;
                            else nextSides = 20; // Circle
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
                        e.state.processTimer = 1; // Retry next tick
                    }
                } else {
                    e.state.processTimer = 1; // Retry next tick
                }
            }
        }
    }

    // Sand Processor (now the "Polisher")
    if (e.type === 'sand-processor') {
        if (!e.state || !e.state.grid) return;
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + 3 && item.y >= e.y && item.y < e.y + 3) {
                if (canAcceptItem(e, item)) {
                    e.state.processingItem = {...item};
                    engine.items.splice(i, 1);
                    for(let sx=9; sx<=19; sx++) { e.state.grid[0][sx] = 1; e.state.grid[1][sx] = 1; }
                    break;
                }
            }
        }
        // Sand falling logic remains the same
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
        if (collected > 0) {
            e.state.processTimer += collected;
            if (e.state.processTimer >= 30) {
                let nx = e.x + 1, ny = e.y + 3;
                const destE = engine.getEntityAt(nx, ny);
                if (destE && ['belt', 'splitter', 'combiner'].includes(destE.type) && !engine.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5)) {
                    const original = e.state.processingItem;
                    engine.items.push({ 
                        ...original,
                        id: Math.random().toString(),
                        s: Math.min(100, original.s + 15),
                        l: Math.min(90, original.l + 10),
                        x: nx, y: ny, progress: 0, outDir: destE.dir 
                    });
                    e.state.processTimer = 0;
                } else {
                    e.state.processTimer = 30; 
                }
            }
        }
    }
}