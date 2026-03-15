import { TILE_SIZE, MAP_SIZE } from '../constants.js';

export function drawTerrain(ctx, engine) {
    if (!engine.terrain) return;
    
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const val = engine.terrain[y][x];
            const intensity = Math.floor(val * 24);
            ctx.fillStyle = `rgb(${11 + intensity}, ${12 + Math.floor(intensity * 1.5)}, ${16 + Math.floor(intensity * 2)})`;
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

export function drawResources(ctx, engine) {
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const res = engine.tiles[y][x];
            if (!res) continue;

            const cx = x * TILE_SIZE + TILE_SIZE / 2;
            const cy = y * TILE_SIZE + TILE_SIZE / 2;

            ctx.save();
            ctx.translate(cx, cy);
            if (res === 'ore') {
                ctx.fillStyle = '#45A29E';
                ctx.beginPath();
                ctx.moveTo(0, -10);
                ctx.lineTo(10, 0);
                ctx.lineTo(0, 10);
                ctx.lineTo(-10, 0);
                ctx.fill();
                ctx.fillStyle = '#66FCF1';
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.lineTo(6, 0);
                ctx.lineTo(0, 6);
                ctx.lineTo(-6, 0);
                ctx.fill();
            } else if (res === 'juice') {
                ctx.fillStyle = '#900C3F';
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#E94560';
                ctx.beginPath();
                ctx.arc(-3, -3, 6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}