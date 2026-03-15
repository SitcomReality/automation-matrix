import { TILE_SIZE, MAP_SIZE } from './constants.js';

export class Renderer {
    constructor(canvas, engine, state) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.engine = engine;
        this.state = state;
        this.cam = { x: 0, y: 0, zoom: 1 };
    }

    render() {
        const { ctx, canvas, engine, cam, state } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(canvas.width / 2 + cam.x, canvas.height / 2 + cam.y);
        ctx.scale(cam.zoom, cam.zoom);
        ctx.translate(-MAP_SIZE * TILE_SIZE / 2, -MAP_SIZE * TILE_SIZE / 2);

        // Draw Tiles
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                const res = engine.tiles[y][x];
                if (!res) continue;
                this.drawTileResource(ctx, x, y, res);
            }
        }

        // Draw Entities
        for (let e of engine.entities) {
            this.drawEntity(ctx, e);
        }

        // Draw Items
        for (let item of engine.items) {
            this.drawItem(ctx, item);
        }

        // Draw Notifications
        for (let notif of engine.notifications) {
            ctx.fillStyle = `rgba(102, 252, 241, ${notif.life / 60})`;
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(notif.text, notif.x, notif.y);
        }

        ctx.restore();
    }

    drawTileResource(ctx, x, y, type) {
        ctx.save();
        ctx.translate(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
        if (type === 'ore') {
            ctx.fillStyle = '#45A29E';
            ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0); ctx.fill();
        } else {
            ctx.fillStyle = '#E94560';
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawEntity(ctx, e) {
        ctx.save();
        ctx.translate(e.x * TILE_SIZE, e.y * TILE_SIZE);
        
        if (e.id === this.state.selectedEntityId) {
            ctx.strokeStyle = '#66FCF1';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, e.width * TILE_SIZE, e.height * TILE_SIZE);
        }

        const baseColor = e.type === 'belt' ? '#2C3E50' : e.type === 'miner' ? '#34495E' : '#1A252F';
        ctx.fillStyle = baseColor;
        ctx.fillRect(2, 2, e.width * TILE_SIZE - 4, e.height * TILE_SIZE - 4);

        if (e.type === 'belt') {
            ctx.save();
            ctx.translate(TILE_SIZE/2, TILE_SIZE/2);
            ctx.rotate(e.dir * Math.PI / 2);
            ctx.strokeStyle = '#7F8C8D';
            ctx.lineWidth = 2;
            const offset = (this.engine.tick % 30) / 30;
            for(let i=-1; i<=1; i++) {
                ctx.beginPath();
                ctx.moveTo(-6, (offset + i) * 12 + 4); ctx.lineTo(0, (offset + i) * 12 - 4); ctx.lineTo(6, (offset + i) * 12 + 4);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (e.type === 'sand-processor') {
            ctx.fillStyle = '#0B0C10';
            ctx.fillRect(16, 25, e.width * TILE_SIZE - 32, e.height * TILE_SIZE - 50);
            const grid = e.state.grid;
            const cw = (e.width * TILE_SIZE - 32) / 30;
            const ch = (e.height * TILE_SIZE - 50) / 30;
            for(let y=0; y<30; y++) {
                for(let x=0; x<30; x++) {
                    if(grid[y][x] === 1) {
                        ctx.fillStyle = e.state.currentProcessingType === 'juice' ? '#E94560' : '#66FCF1';
                        ctx.fillRect(16 + x*cw, 25 + y*ch, cw, ch);
                    } else if(grid[y][x] === 2) {
                        ctx.fillStyle = '#333';
                        ctx.fillRect(16 + x*cw, 25 + y*ch, cw, ch);
                    }
                }
            }
        }

        if (e.type === 'slot-machine') {
            ctx.fillStyle = '#111';
            ctx.fillRect(12, 24, e.width * TILE_SIZE - 24, 24);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            const symbols = ['★', '🍒', '7', '💎', '🔔'];
            const text = e.state.spinning ? '???' : e.state.reels.map(r => symbols[r]).join(' ');
            ctx.fillText(text, e.width * TILE_SIZE / 2, 40);
        }

        ctx.restore();
    }

    drawItem(ctx, item) {
        let dx = item.x * TILE_SIZE + TILE_SIZE/2;
        let dy = item.y * TILE_SIZE + TILE_SIZE/2;
        
        const e = this.engine.getEntityAt(item.x, item.y);
        if (e && ['belt', 'splitter', 'combiner'].includes(e.type)) {
            let outDir = item.outDir !== undefined ? item.outDir : e.dir;
            const offset = (item.progress - 0.5) * TILE_SIZE;
            if (outDir === 0) dy -= offset;
            else if (outDir === 1) dx += offset;
            else if (outDir === 2) dy += offset;
            else if (outDir === 3) dx -= offset;
        }

        ctx.save();
        ctx.translate(dx, dy);
        ctx.fillStyle = item.type === 'ore' ? '#45A29E' : item.type === 'juice' ? '#E94560' : '#F1C40F';
        if (item.type === 'blend') {
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillRect(-6, -6, 12, 12);
        }
        ctx.restore();
    }
}