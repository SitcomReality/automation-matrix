import { TILE_SIZE } from '../constants.js';

const drawChevron = (ctx, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(0, -4);
    ctx.lineTo(6, 4);
    ctx.stroke();
};

export function drawEntity(ctx, engine, state, e) {
    ctx.save();
    ctx.translate(e.x * TILE_SIZE, e.y * TILE_SIZE);

    if (e.id === state.selectedEntityId) {
        ctx.strokeStyle = '#66FCF1';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, e.width * TILE_SIZE, e.height * TILE_SIZE);
    }

    if (e.type === 'belt' || e.type === 'splitter' || e.type === 'combiner') {
        ctx.fillStyle = e.type === 'splitter' ? '#B8860B' : e.type === 'combiner' ? '#6C3483' : '#2C3E50';
        ctx.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#1B2631';
        ctx.fillRect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12);

        ctx.save();
        ctx.translate(TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.rotate(e.dir * Math.PI / 2);

        const offset = (engine.tick % 30) / 30;
        ctx.translate(0, (offset - 0.5) * 12);

        drawChevron(ctx, '#7F8C8D');
        ctx.translate(0, 12);
        drawChevron(ctx, '#7F8C8D');
        ctx.translate(0, -24);
        drawChevron(ctx, '#7F8C8D');

        if (e.type === 'splitter') {
            ctx.fillStyle = '#F1C40F';
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        } else if (e.type === 'combiner') {
            ctx.fillStyle = '#9B59B6';
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    } else if (e.type === 'miner') {
        ctx.fillStyle = '#34495E';
        ctx.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#F39C12';
        ctx.fillRect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12);

        ctx.save();
        ctx.translate(TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.rotate(engine.tick * 0.1);
        ctx.fillStyle = '#BDC3C7';
        ctx.beginPath();
        ctx.moveTo(0, -8); ctx.lineTo(8, 8); ctx.lineTo(-8, 8);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(TILE_SIZE - 6, TILE_SIZE / 2 - 4, 6, 8);
    } else if (e.type === 'sand-processor') {
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#1A252F';
        ctx.fillRect(2, 2, w - 4, h - 4);
        ctx.fillStyle = '#34495E';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 20, 10); ctx.lineTo(w / 2 + 20, 10); ctx.lineTo(w / 2 + 10, 20); ctx.lineTo(w / 2 - 10, 20);
        ctx.fill();
        ctx.fillStyle = '#0B0C10';
        ctx.fillRect(16, 25, w - 32, h - 50);
        const gridW = w - 32; const gridH = h - 50; const cellW = gridW / 30; const cellH = gridH / 30;
        for (let sy = 0; sy < 30; sy++) {
            for (let sx = 0; sx < 30; sx++) {
                const val = e.state.grid[sy][sx];
                if (val === 1) {
                    ctx.fillStyle = e.state.currentProcessingType === 'juice' ? '#E94560' : e.state.currentProcessingType === 'ore' ? '#66FCF1' : '#E67E22';
                    ctx.fillRect(16 + sx * cellW, 25 + sy * cellH, cellW, cellH);
                } else if (val === 2) {
                    ctx.fillStyle = '#BDC3C7';
                    ctx.fillRect(16 + sx * cellW, 25 + sy * cellH, cellW, cellH);
                }
            }
        }
        ctx.fillStyle = '#34495E';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 15, h - 25); ctx.lineTo(w / 2 + 15, h - 25); ctx.lineTo(w / 2 + 8, h - 10); ctx.lineTo(w / 2 - 8, h - 10);
        ctx.fill();
    } else if (e.type === 'blender') {
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#5D6D7E';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0B0C10';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); ctx.fill();
        const gridW = w - 24; const gridH = h - 24; const cellW = gridW / 20; const cellH = gridH / 20;
        const startX = 12; const startY = 12;
        for (let sy = 0; sy < 20; sy++) {
            for (let sx = 0; sx < 20; sx++) {
                const val = e.state.grid[sy][sx];
                if (val > 0) {
                    const itemType = e.state.items[val - 1];
                    ctx.fillStyle = itemType === 'juice' ? '#E94560' : itemType === 'ore' ? '#66FCF1' : '#E67E22';
                    ctx.fillRect(startX + sx * cellW, startY + sy * cellH, cellW + 0.5, cellH + 0.5);
                }
            }
        }
        if (e.state.items.length > 0) {
            ctx.save();
            ctx.translate(w / 2, h / 2);
            const rotSpeed = e.state.blending ? 0.4 : 0.05;
            ctx.rotate(engine.tick * rotSpeed);
            ctx.strokeStyle = '#BDC3C7'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
            if (e.state.blending) {
                ctx.strokeStyle = '#F5D04C'; ctx.beginPath(); ctx.arc(0, 0, (30 - e.state.blendTimer) * 0.8, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.restore();
        }
        ctx.fillStyle = '#7F8C8D'; ctx.fillRect(w - 6, h / 2 - 8, 6, 16);
    } else if (e.type === 'slot-machine') {
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#8E44AD'; ctx.fillRect(4, 4, w - 8, h - 8);
        ctx.fillStyle = e.state.spinning && engine.tick % 10 < 5 ? '#F1C40F' : '#E74C3C'; ctx.fillRect(8, 8, w - 16, 12);
        ctx.fillStyle = '#111'; ctx.fillRect(12, 24, w - 24, 24);
        ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const symbols = ['★', '🍒', '7', '💎', '🔔'];
        ctx.fillStyle = '#FFF';
        const [r1, r2, r3] = e.state.reels || [0, 0, 0];
        if (e.state.spinning) { ctx.fillText('?? ? ??', w / 2, 36); }
        else { ctx.fillText(`${symbols[r1] || '★'} ${symbols[r2] || '★'} ${symbols[r3] || '★'}`, w / 2, 36); }
        ctx.fillStyle = '#FFF'; ctx.font = '10px sans-serif'; ctx.fillText(`x${e.state.multiplier || 0.1}`, w / 2, h - 10);
    } else {
        ctx.fillStyle = '#1A252F';
        ctx.fillRect(2, 2, e.width * TILE_SIZE - 4, e.height * TILE_SIZE - 4);
    }

    ctx.restore();
}