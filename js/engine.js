import { MAP_SIZE, TILE_SIZE } from './constants.js';
import { audioManager } from './audio.js';

export class GameEngine {
    constructor(state) {
        this.state = state;
        this.tiles = [];
        this.entities = [];
        this.items = [];
        this.tick = 0;
        this.notifications = [];
        
        this.load();
        this.initAutoSave();
    }

    initAutoSave() {
        setInterval(() => this.save(), 5000);
    }

    load() {
        const saved = localStorage.getItem('factory-save');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.tiles = data.tiles;
                this.terrain = data.terrain || this.generateTerrain();
                this.entities = data.entities;
                this.items = data.items;
                return;
            } catch (e) {}
        }
        this.generateMap();
    }

    save() {
        localStorage.setItem('factory-save', JSON.stringify({
            tiles: this.tiles,
            terrain: this.terrain,
            entities: this.entities,
            items: this.items
        }));
    }

    generateTerrain() {
        const terrain = Array(MAP_SIZE).fill(0).map(() => Array(MAP_SIZE).fill(0));
        const seedX = Math.random() * 1000;
        const seedY = Math.random() * 1000;
        
        const getNoise = (x, y, scale) => {
            return (Math.sin(x * scale + seedX) + Math.cos(y * scale + seedY)) * 0.5;
        };

        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                // Layered sine-noise for varied distribution
                let val = getNoise(x, y, 0.12) * 0.7 + getNoise(x, y, 0.4) * 0.3;
                terrain[y][x] = Math.max(0, Math.min(1, (val + 1) / 2));
            }
        }
        return terrain;
    }

    generateMap() {
        this.terrain = this.generateTerrain();
        this.tiles = Array(MAP_SIZE).fill(null).map(() => Array(MAP_SIZE).fill(null));
        
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                const val = this.terrain[y][x];
                // Resources spawn only in "richer" noise areas
                if (val > 0.75) {
                    if (Math.random() > 0.85) {
                        this.tiles[y][x] = val > 0.82 ? 'juice' : 'ore';
                    }
                }
            }
        }
    }

    canPlace(x, y, w, h) {
        if (x < 0 || y < 0 || x + w > MAP_SIZE || y + h > MAP_SIZE) return false;
        for (let e of this.entities) {
            if (x < e.x + e.width && x + w > e.x && y < e.y + e.height && y + h > e.y) return false;
        }
        return true;
    }

    addEntity(type, x, y, dir) {
        let w = 1, h = 1;
        let config = {};
        if (type === 'sand-processor') { 
            w = 3; h = 3; 
            const grid = Array(30).fill(null).map(() => Array(30).fill(0));
            for (let i = 7; i <= 22; i++) grid[15][i] = 2;
            config = { grid, processTimer: 0 }; 
        } else if (type === 'slot-machine') { 
            w = 2; h = 2; 
            config = { reels: [0,0,0], spinning: false, spinTime: 0 }; 
        } else if (type === 'splitter') {
            config = { cycle: 0 };
        } else if (type === 'blender') {
            w = 2; h = 2;
            config = { items: [] };
        }
        
        if (this.canPlace(x, y, w, h)) {
            this.entities.push({ id: Math.random().toString(36).substr(2, 9), type, x, y, width: w, height: h, dir, state: config });
            return true;
        }
        return false;
    }

    removeEntity(x, y) {
        const idx = this.entities.findIndex(e => x >= e.x && x < e.x + e.width && y >= e.y && y < e.y + e.height);
        if (idx !== -1) {
            const e = this.entities[idx];
            this.entities.splice(idx, 1);
            this.items = this.items.filter(item => !(item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height));
            return true;
        }
        return false;
    }

    getEntityAt(x, y) {
        return this.entities.find(e => x >= e.x && x < e.x + e.width && y >= e.y && y < e.y + e.height);
    }

    update() {
        this.tick++;
        this.notifications = this.notifications.filter(n => {
            n.life--;
            n.y -= 0.5;
            return n.life > 0;
        });

        // Process belts and item movement (ported from original engine)
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            const e = this.getEntityAt(item.x, item.y);
            if (!e || (e.type !== 'belt' && e.type !== 'splitter' && e.type !== 'combiner')) continue;

            if (item.outDir === undefined) {
                this.assignOutput(e, item);
            }

            const { nx, ny } = this.getBeltOutput(e, item);
            let maxProgress = 1.0;

            // Check items on the same tile ahead of this one
            const itemsOnSame = this.items.filter(
                it => it.x === item.x && it.y === item.y && it !== item && it.progress > item.progress
            );
            if (itemsOnSame.length > 0) {
                const nextItem = itemsOnSame.reduce((min, it) => (it.progress < min.progress ? it : min));
                maxProgress = nextItem.progress - 0.5;
            } else {
                // Check next tile
                const destE = this.getEntityAt(nx, ny);
                if (destE) {
                    if (destE.type === 'belt' || destE.type === 'splitter' || destE.type === 'combiner') {
                        const itemsOnNext = this.items.filter(it => it.x === nx && it.y === ny);
                        if (itemsOnNext.length > 0) {
                            const lastItem = itemsOnNext.reduce((min, it) => (it.progress < min.progress ? it : min));
                            maxProgress = lastItem.progress + 0.5;
                        } else {
                            maxProgress = 2.0; // Space is clear
                        }
                    } else if (destE.type === 'sand-processor' && nx === destE.x + 1 && ny === destE.y) {
                        maxProgress = 2.0;
                    } else if (destE.type === 'slot-machine' && nx >= destE.x && nx < destE.x + 2 && ny >= destE.y && ny < destE.y + 2) {
                        maxProgress = 2.0;
                    } else if (destE.type === 'blender' && nx >= destE.x && nx < destE.x + 2 && ny >= destE.y && ny < destE.y + 2) {
                        maxProgress = 2.0;
                    } else {
                        maxProgress = 1.0; // Blocked by incompatible entity
                    }
                } else {
                    maxProgress = 1.0; // Blocked, end of belt
                }
            }

            const speed = 0.05;
            if (item.progress + speed <= maxProgress) {
                item.progress += speed;
            } else {
                item.progress = Math.min(item.progress + speed, maxProgress);
            }

            // Cap at 1.0 if not allowed to cross
            if (maxProgress <= 1.0 && item.progress > maxProgress) {
                item.progress = maxProgress;
            }

            if (item.progress >= 1.0) {
                const destE = this.getEntityAt(nx, ny);
                if (destE) {
                    if (destE.type === 'belt' || destE.type === 'splitter' || destE.type === 'combiner') {
                        item.x = nx;
                        item.y = ny;
                        item.progress -= 1.0;
                        this.assignOutput(destE, item);
                    } else if (destE.type === 'sand-processor') {
                        item.x = nx;
                        item.y = ny;
                        item.progress = 0;
                    } else if (destE.type === 'slot-machine') {
                        item.x = nx;
                        item.y = ny;
                        item.progress = 0;
                    } else if (destE.type === 'blender') {
                        item.x = nx;
                        item.y = ny;
                        item.progress = 0;
                    }
                }
            }
        }

        // Entity Processing
        for (let e of this.entities) {
            this.processEntity(e);
        }
    }

    changeBeltDir(e, dir) {
        if (e.dir !== dir) {
            e.dir = dir;
            // Force any resources on this belt to reroute immediately (ported from original engine)
            for (const item of this.items) {
                if (
                    item.x >= e.x &&
                    item.x < e.x + e.width &&
                    item.y >= e.y &&
                    item.y < e.y + e.height
                ) {
                    item.outDir = undefined;
                    item.waitTimer = 0;
                }
            }
        }
    }

    processEntity(e) {
        // Miner Logic
        if (e.type === 'miner' && this.tick % 240 === 0) {
            const res = this.tiles[e.y][e.x];
            if (res) {
                const nx = e.x + 1;
                const ny = e.y;
                const destE = this.getEntityAt(nx, ny);
                if (destE && ['belt', 'splitter', 'combiner'].includes(destE.type)) {
                    if (!this.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5)) {
                        this.items.push({ id: Math.random().toString(), type: res, x: nx, y: ny, progress: 0, outDir: destE.dir });
                    }
                }
            }
        }

        // Blender logic
        if (e.type === 'blender') {
            for (let i = this.items.length - 1; i >= 0; i--) {
                const item = this.items[i];
                if (item.x >= e.x && item.x < e.x + 2 && item.y >= e.y && item.y < e.y + 2) {
                    if (e.state.items.length < 2 && item.type !== 'blend' && !e.state.items.includes(item.type)) {
                        e.state.items.push(item.type);
                    }
                    this.items.splice(i, 1);
                }
            }
            if (e.state.items.length === 2) {
                const nx = e.x + 2, ny = e.y;
                const destE = this.getEntityAt(nx, ny);
                if (destE && ['belt','splitter','combiner'].includes(destE.type)) {
                    e.state.items = [];
                    this.items.push({ id: Math.random().toString(), type: 'blend', x: nx, y: ny, progress: 0, outDir: destE.dir });
                }
            }
        }

        // Slot Machine
        if (e.type === 'slot-machine') {
            for (let i = this.items.length - 1; i >= 0; i--) {
                const item = this.items[i];
                if (item.x >= e.x && item.x < e.x + 2 && item.y >= e.y && item.y < e.y + 2) {
                    if (!e.state.spinning) {
                        let mult = 0.1;
                        if (['blend', 'refined-ore', 'refined-juice'].includes(item.type)) mult = 1.0;
                        if (item.type === 'particle') mult = 0.5;
                        e.state.spinning = true; e.state.spinTime = 60; e.state.multiplier = mult;
                    }
                    this.items.splice(i, 1);
                }
            }
            if (e.state.spinning) {
                e.state.spinTime--;
                if (this.tick % 4 === 0) {
                    e.state.reels = e.state.reels.map(() => Math.floor(Math.random() * 5));
                }
                if (e.state.spinTime <= 0) {
                    e.state.spinning = false;
                    const [r1, r2, r3] = e.state.reels;
                    let payout = 5;
                    if (r1 === r2 && r2 === r3) payout = 100;
                    else if (r1 === r2 || r2 === r3 || r1 === r3) payout = 20;
                    const final = payout * (e.state.multiplier || 0.1);
                    this.state.addCurrency(final);
                    audioManager.play('money', 0.5);
                    this.notifications.push({ text: `+$${Math.floor(final)}`, x: (e.x + 1) * TILE_SIZE, y: e.y * TILE_SIZE, life: 60 });
                }
            }
        }

        // Sand Processor simulation
        if (e.type === 'sand-processor') {
            // Processing inputs
            const currentParticles = e.state.grid.flat().filter(v => v === 1).length;
            if (currentParticles < 150) {
                for (let i = this.items.length - 1; i >= 0; i--) {
                    const item = this.items[i];
                    if (item.x >= e.x && item.x < e.x + 3 && item.y >= e.y && item.y < e.y + 3) {
                        e.state.currentProcessingType = item.type;
                        this.items.splice(i, 1);
                        for(let sx=9; sx<=19; sx++) { e.state.grid[0][sx] = 1; e.state.grid[1][sx] = 1; }
                        break;
                    }
                }
            }
            // Sand physics
            if (this.tick % 2 === 0) {
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
            // Outlet
            let collected = 0;
            for (let x = 12; x <= 17; x++) { if (e.state.grid[29][x] === 1) { e.state.grid[29][x] = 0; collected++; } }
            if (collected > 0) {
                e.state.processTimer += collected;
                if (e.state.processTimer >= 20) {
                    let nx = e.x + 1,
                        ny = e.y + 3;
                    const destE = this.getEntityAt(nx, ny);
                    if (
                        destE &&
                        ['belt', 'splitter', 'combiner'].includes(destE.type) &&
                        !this.items.find(i => i.x === nx && i.y === ny && i.progress < 0.5)
                    ) {
                        let outType =
                            e.state.currentProcessingType === 'ore'
                                ? 'refined-ore'
                                : e.state.currentProcessingType === 'juice'
                                ? 'refined-juice'
                                : 'particle';
                        if (e.state.currentProcessingType === 'blend') outType = 'particle';
                        this.items.push({
                            id: Math.random().toString(),
                            type: outType,
                            x: nx,
                            y: ny,
                            progress: 0
                        });
                        e.state.processTimer = 0;
                    } else {
                        e.state.processTimer = 20; // stall process if blocked
                    }
                }
            }
        }
    }

    getBeltOutput(e, item) {
        let d = (item && item.outDir !== undefined) ? item.outDir : e.dir;
        return {
            nx: e.x + (d === 1 ? 1 : d === 3 ? -1 : 0),
            ny: e.y + (d === 2 ? 1 : d === 0 ? -1 : 0)
        };
    }

    assignOutput(e, item) {
        if (e.type === 'splitter') {
            if (e.state.cycle === 0) item.outDir = e.dir;
            else if (e.state.cycle === 1) item.outDir = (e.dir + 1) % 4;
            else if (e.state.cycle === 2) item.outDir = (e.dir + 3) % 4;
            e.state.cycle = (e.state.cycle + 1) % 3;
        } else {
            item.outDir = e.dir;
        }
    }
}