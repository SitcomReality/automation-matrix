import { TILE_SIZE } from '../constants.js';

export function drawItem(ctx, engine, item) {
    const cx = item.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = item.y * TILE_SIZE + TILE_SIZE / 2;
    let dx = cx;
    let dy = cy;

    const e = engine.getEntityAt(item.x, item.y);
    if (e && (e.type === 'belt' || e.type === 'splitter' || e.type === 'combiner')) {
        const inDir = item.inDir !== undefined ? item.inDir : e.dir;
        const outDir = item.outDir !== undefined ? item.outDir : e.dir;
        
        // Direction vectors
        const dirs = [
            { x: 0, y: -1 }, // N
            { x: 1, y: 0 },  // E
            { x: 0, y: 1 },  // S
            { x: -1, y: 0 }  // W
        ];

        if (item.progress < 0.5) {
            // First half: from entry edge to center
            const t = item.progress / 0.5;
            const entryVec = dirs[inDir];
            dx = cx + (entryVec.x * (t * 0.5 - 0.5)) * TILE_SIZE;
            dy = cy + (entryVec.y * (t * 0.5 - 0.5)) * TILE_SIZE;
        } else {
            // Second half: from center to exit edge
            const t = (item.progress - 0.5) / 0.5;
            const exitVec = dirs[outDir];
            dx = cx + (exitVec.x * (t * 0.5)) * TILE_SIZE;
            dy = cy + (exitVec.y * (t * 0.5)) * TILE_SIZE;
        }
    }

    ctx.save();
    ctx.translate(dx, dy);

    if (item.type === 'ore') {
        ctx.fillStyle = '#45A29E';
        ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#0B0C10'; ctx.stroke();
    } else if (item.type === 'juice') {
        ctx.fillStyle = '#E94560';
        ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#0B0C10'; ctx.stroke();
    } else if (item.type === 'refined-ore') {
        ctx.fillStyle = '#66FCF1'; ctx.shadowColor = '#66FCF1'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(10, 0); ctx.lineTo(0, 10); ctx.lineTo(-10, 0); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#0B0C10'; ctx.stroke();
    } else if (item.type === 'refined-juice') {
        ctx.fillStyle = '#FF4D6D'; ctx.shadowColor = '#FF4D6D'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#0B0C10'; ctx.stroke();
    } else if (item.type === 'blend') {
        ctx.fillStyle = '#F5D04C'; ctx.shadowColor = '#F5D04C'; ctx.shadowBlur = 15;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) / 180) * Math.PI) * 10, -Math.sin(((18 + i * 72) / 180) * Math.PI) * 10);
            ctx.lineTo(Math.cos(((54 + i * 72) / 180) * Math.PI) * 4, -Math.sin(((54 + i * 72) / 180) * Math.PI) * 4);
        }
        ctx.closePath(); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#0B0C10'; ctx.stroke();
    } else if (item.type === 'particle') {
        ctx.fillStyle = '#E67E22'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = '#0B0C10'; ctx.stroke();
    } else {
        ctx.fillStyle = '#F1C40F'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
}