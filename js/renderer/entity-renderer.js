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

const drawMachineIndicator = (ctx, w, h, dir) => {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(dir * Math.PI / 2);
    
    const arrowSize = 6;
    const yPos = -h / 2;
    
    // Glow effect for the indicator
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#66FCF1';
    ctx.fillStyle = '#66FCF1';
    
    // Modern triangular indicator
    ctx.beginPath();
    ctx.moveTo(-arrowSize, yPos + 2);
    ctx.lineTo(arrowSize, yPos + 2);
    ctx.lineTo(0, yPos - 6);
    ctx.closePath();
    ctx.fill();
    
    // Base line for the port
    ctx.strokeStyle = '#66FCF1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-arrowSize - 2, yPos);
    ctx.lineTo(arrowSize + 2, yPos);
    ctx.stroke();
    
    ctx.restore();
};

export function drawEntity(ctx, engine, state, e) {
    if (!e) return;
    ctx.save();
    ctx.translate(e.x * TILE_SIZE, e.y * TILE_SIZE);

    if (e.id === state.selectedEntityId) {
        ctx.strokeStyle = '#66FCF1';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, e.width * TILE_SIZE, e.height * TILE_SIZE);
    }

    if (e.type === 'belt' || e.type === 'splitter') {
        ctx.fillStyle = e.type === 'splitter' ? '#B8860B' : '#2C3E50';
        ctx.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#1B2631';
        ctx.fillRect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12);

        ctx.save();
        ctx.translate(TILE_SIZE / 2, TILE_SIZE / 2);
        ctx.rotate(e.dir * Math.PI / 2);

        // Mask the arrows so they stay within the belt's boundaries
        ctx.save();
        ctx.beginPath();
        ctx.rect(-TILE_SIZE / 2 + 2, -TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.clip();

        const offset = (engine.tick % 30) / 30;
        ctx.translate(0, (0.5 - offset) * 12); // Move forward by moving in negative Y

        drawChevron(ctx, '#7F8C8D');
        ctx.translate(0, 12);
        drawChevron(ctx, '#7F8C8D');
        ctx.translate(0, -24);
        drawChevron(ctx, '#7F8C8D');
        ctx.restore(); // Restore from clip mask, but keep original translation/rotation

        if (e.type === 'splitter') {
            ctx.fillStyle = '#F1C40F';
            ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore(); // Final restore to exit belt-local context
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

        drawMachineIndicator(ctx, TILE_SIZE, TILE_SIZE, e.dir);
    } else if (e.type === 'sand-processor') {
        if (!e.state || !e.state.grid) {
            ctx.restore();
            return;
        }
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
        drawMachineIndicator(ctx, w, h, e.dir);
    } else if (e.type === 'blender') {
        if (!e.state || !e.state.grid) {
            ctx.restore();
            return;
        }
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#5D6D7E';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); ctx.fill();
        
        // Background color logic: black by default, changes to blend color when processing
        ctx.fillStyle = e.state.blending ? (e.state.blendColor || '#0B0C10') : '#000000';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); ctx.fill();
        
        // Only draw particles if not blending
        if (!e.state.blending) {
            const gridW = w - 24; const gridH = h - 24; const cellW = gridW / 20; const cellH = gridH / 20;
            const startX = 12; const startY = 12;
            for (let sy = 0; sy < 20; sy++) {
                for (let sx = 0; sx < 20; sx++) {
                    const val = e.state.grid[sy][sx];
                    if (val > 0) {
                        const it = e.state.itemTypes[val - 1];
                        if (it) {
                            ctx.fillStyle = `hsl(${it.h}, ${it.s}%, ${it.l}%)`;
                            ctx.fillRect(startX + sx * cellW, startY + sy * cellH, cellW + 0.5, cellH + 0.5);
                        }
                    }
                }
            }
        }

        // Draw central wheel
        ctx.save();
        ctx.translate(w / 2, h / 2);
        if (e.state.blending) {
            const rotSpeed = 0.4;
            const t = e.state.animTick || 0;
            ctx.rotate(t * rotSpeed);
        }
        ctx.strokeStyle = '#BDC3C7'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
        
        ctx.restore();
        drawMachineIndicator(ctx, w, h, e.dir);
    } else if (e.type === 'stitcher') {
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#4A235A';
        ctx.fillRect(2, 2, w - 4, h - 4);
        ctx.strokeStyle = '#6C3483';
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, w - 12, h - 12);

        // Progress bar
        if (e.state.processTimer > 0) {
            const pct = 1 - (e.state.processTimer / 120);
            ctx.fillStyle = '#BB8FCE';
            ctx.fillRect(8, h - 10, (w - 16) * pct, 4);
        }

        drawMachineIndicator(ctx, w, h, e.dir);
    } else if (e.type === 'hue-rotator') {
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(2, 2, w - 4, h - 4);
        
        ctx.save();
        ctx.translate(w / 2, h / 2);
        
        // Glass prism effect (Static, doesn't rotate with dir)
        ctx.beginPath();
        ctx.moveTo(0, -10); ctx.lineTo(10, 8); ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.fillStyle = 'rgba(102, 252, 241, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#66FCF1';
        ctx.stroke();

        if (e.state.processingItem) {
            const hue = (engine.tick * 5) % 360;
            ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
            ctx.beginPath();
            ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
            ctx.stroke();
        }
        ctx.restore();
        drawMachineIndicator(ctx, w, h, e.dir);
    } else if (e.type === 'crystallizer') {
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#0B0C10';
        ctx.fillRect(2, 2, w - 4, h - 4);
        ctx.strokeStyle = '#66FCF1';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, w - 16, h - 16);

        // Rotating rings
        ctx.save();
        ctx.translate(w / 2, h / 2);
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate(engine.tick * (0.02 + i * 0.01) * (i % 2 === 0 ? 1 : -1));
            ctx.strokeStyle = `hsla(180, 80%, ${50 + i * 10}%, ${0.2 + i * 0.2})`;
            ctx.beginPath();
            ctx.arc(0, 0, 15 + i * 12, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
        }

        if (e.state.processTimer > 0) {
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            // Glow
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
            grad.addColorStop(0, 'rgba(255,255,255,0.5)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        drawMachineIndicator(ctx, w, h, e.dir);
    } else if (e.type === 'slot-machine') {
        if (!e.state) {
            ctx.restore();
            return;
        }
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