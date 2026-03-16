import { TILE_SIZE } from '../constants.js';

function drawPolygon(ctx, sides, radius) {
    if (sides < 3) {
        ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
        return;
    }
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

export function drawItem(ctx, engine, item) {
    const cx = item.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = item.y * TILE_SIZE + TILE_SIZE / 2;
    let dx = cx;
    let dy = cy;

    const e = engine.getEntityAt(item.x, item.y);
    if (e && (e.type === 'belt' || e.type === 'splitter' || e.type === 'combiner')) {
        const inDir = item.inDir !== undefined ? item.inDir : e.dir;
        const outDir = item.outDir !== undefined ? item.outDir : e.dir;
        
        const dirs = [
            { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
        ];

        if (item.progress < 0.5) {
            const t = item.progress / 0.5;
            const entryVec = dirs[inDir];
            dx = cx + (entryVec.x * (t * 0.5 - 0.5)) * TILE_SIZE;
            dy = cy + (entryVec.y * (t * 0.5 - 0.5)) * TILE_SIZE;
        } else {
            const t = (item.progress - 0.5) / 0.5;
            const exitVec = dirs[outDir];
            dx = cx + (exitVec.x * (t * 0.5)) * TILE_SIZE;
            dy = cy + (exitVec.y * (t * 0.5)) * TILE_SIZE;
        }
    }

    ctx.save();
    ctx.translate(dx, dy);

    // Dynamic HSL styling
    const h = item.h !== undefined ? item.h : 0;
    const s = item.s !== undefined ? item.s : 0;
    const l = item.l !== undefined ? item.l : 100;
    const sides = item.sides || 3;
    
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    ctx.strokeStyle = `hsl(${h}, ${s}%, ${Math.max(0, l - 20)}%)`;
    ctx.lineWidth = 1.5;

    // Radius scales with tier (sides) slightly
    const radius = 6 + (sides - 3) * 0.5;
    
    drawPolygon(ctx, sides, radius);
    ctx.stroke();

    // Visual flair for high tiers
    if (sides >= 8) {
        ctx.strokeStyle = `hsla(${h}, 100%, 80%, 0.5)`;
        ctx.lineWidth = 1;
        drawPolygon(ctx, sides, radius + 2);
    }

    ctx.restore();
}