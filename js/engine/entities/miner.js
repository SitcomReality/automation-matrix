import { BASE_RESOURCES } from '../../constants.js';

export function processMiner(engine, e) {
    if (engine.tick % 240 === 0) {
        const resKey = (engine.tiles && engine.tiles[e.y] && engine.tiles[e.y][e.x]) ? engine.tiles[e.y][e.x] : null;
        if (resKey && BASE_RESOURCES[resKey]) {
            const res = BASE_RESOURCES[resKey];
            // Miner outputs in its current dir
            const nx = e.x + (e.dir === 1 ? 1 : e.dir === 3 ? -1 : 0);
            const ny = e.y + (e.dir === 2 ? 1 : e.dir === 0 ? -1 : 0);
            
            const destE = engine.getEntityAt(nx, ny);
            if (destE && ['belt', 'splitter'].includes(destE.type)) {
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
                        inDir: e.dir,
                        outDir: destE.dir 
                    });
                }
            }
        }
    }
}