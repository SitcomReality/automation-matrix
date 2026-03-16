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

import { BASE_RESOURCES } from '../constants.js';

export function drawResources(ctx, engine) {
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const resKey = engine.tiles[y][x];
            if (!resKey || !BASE_RESOURCES[resKey]) continue;

            const res = BASE_RESOURCES[resKey];
            const cx = x * TILE_SIZE + TILE_SIZE / 2;
            const cy = y * TILE_SIZE + TILE_SIZE / 2;

            ctx.save();
            ctx.translate(cx, cy);
            
            // Draw a cluster of small triangles/crystals
            ctx.fillStyle = `hsl(${res.h}, ${res.s}%, ${res.l}%)`;
            for(let i=0; i<3; i++) {
                ctx.save();
                ctx.rotate(i * 2 + engine.tick * 0.01);
                ctx.translate(4, 0);
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(6, 6);
                ctx.lineTo(-6, 6);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
            
            // Bright spot
            ctx.fillStyle = `hsl(${res.h}, ${res.s + 20}%, ${res.l + 20}%)`;
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}