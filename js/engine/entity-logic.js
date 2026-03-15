import { TILE_SIZE } from '../constants.js';
import { audioManager } from '../audio.js';

export function processEntity(engine, e) {
    // Miner Logic
    if (e.type === 'miner' && engine.tick % 240 === 0) {
        const res = engine.tiles[e.y][e.x];
        if (res) {
            const nx = e.x + 1;
            const ny = e.y;
            const destE = engine.getEntityAt(nx, ny);
            if (destE && ['belt', 'splitter', 'combiner'].includes(destE.type)) {
                if (!engine.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5)) {
                    engine.items.push({ id: Math.random().toString(), type: res, x: nx, y: ny, progress: 0, outDir: destE.dir });
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
                    if (e.state.items.length < 2 && item.type !== 'blend' && !e.state.items.includes(item.type)) {
                        e.state.items.push(item.type);
                        const pType = e.state.items.length;
                        for (let k = 0; k < 20; k++) {
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
            e.state.blendTimer = 30;

            // Clear particles at the start of blending so they "disappear" into the mix
            e.state.grid = Array(20).fill(null).map(() => Array(20).fill(0));
        }

        if (e.state.blending) {
            e.state.blendTimer--;
            if (engine.tick % 2 === 0) {
                for (let j = 0; j < 5; j++) {
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
                        e.state.items = [];
                        e.state.blending = false;
                        e.state.grid = Array(20).fill(null).map(() => Array(20).fill(0));
                        engine.items.push({ id: Math.random().toString(), type: 'blend', x: nx, y: ny, progress: 0, outDir: destE.dir });
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
                if (!e.state.spinning) {
                    let mult = 0.1;
                    if (['blend', 'refined-ore', 'refined-juice'].includes(item.type)) mult = 1.0;
                    if (item.type === 'particle') mult = 0.5;
                    e.state.spinning = true; e.state.spinTime = 60; e.state.multiplier = mult;
                }
                engine.items.splice(i, 1);
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

    // Sand Processor simulation
    if (e.type === 'sand-processor') {
        if (!e.state || !e.state.grid) return;
        const currentParticles = e.state.grid.flat().filter(v => v === 1).length;
        if (currentParticles < 150) {
            for (let i = engine.items.length - 1; i >= 0; i--) {
                const item = engine.items[i];
                if (item.x >= e.x && item.x < e.x + 3 && item.y >= e.y && item.y < e.y + 3) {
                    e.state.currentProcessingType = item.type;
                    engine.items.splice(i, 1);
                    for(let sx=9; sx<=19; sx++) { e.state.grid[0][sx] = 1; e.state.grid[1][sx] = 1; }
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
        if (collected > 0) {
            e.state.processTimer += collected;
            if (e.state.processTimer >= 20) {
                let nx = e.x + 1, ny = e.y + 3;
                const destE = engine.getEntityAt(nx, ny);
                if (destE && ['belt', 'splitter', 'combiner'].includes(destE.type) && !engine.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5)) {
                    let outType = e.state.currentProcessingType === 'ore' ? 'refined-ore' : e.state.currentProcessingType === 'juice' ? 'refined-juice' : 'particle';
                    if (e.state.currentProcessingType === 'blend') outType = 'particle';
                    engine.items.push({ id: Math.random().toString(), type: outType, x: nx, y: ny, progress: 0 });
                    e.state.processTimer = 0;
                } else {
                    e.state.processTimer = 20; 
                }
            }
        }
    }
}