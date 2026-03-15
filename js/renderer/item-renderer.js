import { TILE_SIZE } from '../constants.js';

export function drawItem(ctx, engine, item) {
    let dx = item.x * TILE_SIZE + TILE_SIZE / 2;
    let dy = item.y * TILE_SIZE + TILE_SIZE / 2;
    let scaleX = 1, scaleY = 1;

    const e = engine.getEntityAt(item.x, item.y);
    if (e && (e.type === 'belt' || e.type === 'splitter' || e.type === 'combiner')) {
        let outDir = item.outDir !== undefined ? item.outDir : e.dir;
        const offset = (item.progress - 0.5) * TILE_SIZE;
        if (outDir === 0) dy -= offset;
        if (outDir === 1) dx += offset;
        if (outDir === 2) dy += offset;
        if (outDir === 3) dx -= offset;

        const bounce = Math.sin(item.progress * Math.PI);
        if (outDir === 0 || outDir === 2) {
            scaleX = 1 - bounce * 0.2;
            scaleY = 1 + bounce * 0.4;
        } else {
            scaleX = 1 + bounce * 0.4;
            scaleY = 1 - bounce * 0.2;
        }
    }

    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(scaleX, scaleY);

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