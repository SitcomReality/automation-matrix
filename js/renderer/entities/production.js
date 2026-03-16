import { TILE_SIZE } from '../../constants.js';
import { particleManager } from '../particles.js';
import { 
    drawDrum, drawPiston, drawSteamVent, 
    drawMachineIndicator, drawArcLightning 
} from './parts.js';
import { drawPolygon } from '../item-renderer.js';
import { blendHue } from '../../engine/entities/utils.js';

export function drawSandProcessor(ctx, engine, e) {
    const w = e.width * TILE_SIZE;
    const h = e.height * TILE_SIZE;
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.strokeStyle = '#1F2833';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    const item = e.state.processingItem;
    const itemColor = item ? `hsl(${item.h}, ${item.s}%, ${item.l}%)` : '#66FCF1';

    const rotation = (e.state.phase === 'processing' ? engine.tick * 0.1 : engine.tick * 0.01);
    drawDrum(ctx, w/2, h/2, 30, rotation, '#45A29E');
    
    if (e.state.phase === 'processing') {
        ctx.fillStyle = itemColor;
        for(let i=0; i<8; i++) {
            const angle = rotation + (i * Math.PI * 2 / 8) + Math.sin(engine.tick * 0.1 + i) * 0.2;
            const r = 15 + Math.cos(engine.tick * 0.05 + i) * 10;
            ctx.beginPath();
            ctx.arc(w/2 + Math.cos(angle) * r, h/2 + Math.sin(angle) * r, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        if (engine.tick % 5 === 0) {
            particleManager.spawn(e.x * TILE_SIZE + w/2, e.y * TILE_SIZE + h/2, 'spark', itemColor, 1);
        }
    }
    drawSteamVent(ctx, 15, 15, e.state.phase === 'processing', engine.tick);
    drawSteamVent(ctx, w - 15, 15, e.state.phase === 'processing', engine.tick + 10);
    drawMachineIndicator(ctx, w, h, e.dir);
}

export function drawBlender(ctx, engine, e) {
    const w = e.width * TILE_SIZE;
    const h = e.height * TILE_SIZE;
    ctx.fillStyle = '#5D6D7E';
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = e.state.blending ? (e.state.blendColor || '#0B0C10') : '#000000';
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); ctx.fill();
    
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
    ctx.save();
    ctx.translate(w / 2, h / 2);
    if (e.state.blending) ctx.rotate((e.state.animTick || 0) * 0.4);
    ctx.strokeStyle = '#BDC3C7'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
    ctx.restore();
    drawMachineIndicator(ctx, w, h, e.dir);
}

export function drawStitcher(ctx, engine, e) {
    const w = e.width * TILE_SIZE;
    const h = e.height * TILE_SIZE;
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.fillStyle = '#1F2833';
    ctx.fillRect(w/2 - 20, h/2 - 20, 40, 40);
    ctx.strokeStyle = '#45A29E';
    ctx.strokeRect(w/2 - 20, h/2 - 20, 40, 40);
    const anim = e.state.anim || 0;
    const extension = e.state.phase === 'pressing' ? Math.sin(anim * Math.PI) : 0;
    
    let stitchColor = '#FFF';
    if (e.state.buffer && e.state.buffer.length > 0) {
        if (e.state.buffer.length === 2) {
            const h = blendHue(e.state.buffer[0].h, e.state.buffer[1].h);
            stitchColor = `hsl(${h}, 80%, 60%)`;
        } else {
            stitchColor = `hsl(${e.state.buffer[0].h}, ${e.state.buffer[0].s}%, ${e.state.buffer[0].l}%)`;
        }
    }

    drawPiston(ctx, 15, h/2, Math.PI/2, 25, extension);
    drawPiston(ctx, w - 15, h/2, -Math.PI/2, 25, extension);
    drawPiston(ctx, w/2, 15, Math.PI, 25, extension);
    drawPiston(ctx, w/2, h - 15, 0, 25, extension);
    if (e.state.phase === 'pressing' && anim > 0.4 && anim < 0.6) {
        if (engine.tick % 2 === 0) particleManager.spawn(e.x * TILE_SIZE + w/2, e.y * TILE_SIZE + h/2, 'spark', stitchColor, 3);
    }
    drawSteamVent(ctx, 20, 20, e.state.phase === 'pressing', engine.tick);
    drawSteamVent(ctx, w - 20, 20, e.state.phase === 'pressing', engine.tick + 5);
    drawMachineIndicator(ctx, w, h, e.dir);
}

export function drawHueRotator(ctx, engine, e) {
    const w = e.width * TILE_SIZE;
    const h = e.height * TILE_SIZE;
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.strokeStyle = '#1F2833';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    const anim = e.state.anim || 0;
    drawDrum(ctx, 0, 0, 25, engine.tick * 0.02, '#45A29E');
    drawDrum(ctx, 0, 0, 15, -engine.tick * 0.05, '#66FCF1');
    ctx.save();
    ctx.rotate(Math.sin(engine.tick * 0.05) * 0.1);
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(12, 10); ctx.lineTo(-12, 10); ctx.closePath();
    ctx.fillStyle = 'rgba(102, 252, 241, 0.4)'; ctx.fill();
    ctx.strokeStyle = '#66FCF1'; ctx.stroke();
    ctx.restore();
    if (e.state.processingItem) {
        const beamHue = (e.state.processingItem.h + anim * 30) % 360;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = 4 + Math.sin(engine.tick * 0.2) * 2;
        ctx.strokeStyle = `hsla(${beamHue}, 100%, 70%, 0.6)`;
        ctx.beginPath(); ctx.moveTo(-w/2 + 10, 0); ctx.lineTo(w/2 - 10, 0); ctx.stroke();
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = 0.7; ctx.fillStyle = `hsl(${beamHue}, ${e.state.processingItem.s}%, ${e.state.processingItem.l}%)`;
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
    drawMachineIndicator(ctx, w, h, e.dir);
}

export function drawCrystallizer(ctx, engine, e) {
    const w = e.width * TILE_SIZE;
    const h = e.height * TILE_SIZE;
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.strokeStyle = '#66FCF1';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(engine.tick * (0.02 + i * 0.01) * (i % 2 === 0 ? 1 : -1));
        ctx.strokeStyle = `hsla(180, 80%, ${50 + i * 10}%, ${0.2 + i * 0.2})`;
        ctx.beginPath(); ctx.arc(0, 0, 15 + i * 12, 0, Math.PI * 1.5); ctx.stroke();
        ctx.restore();
    }
    if (e.state.processingItem) {
        const item = e.state.processingItem;
        const hover = Math.sin(engine.tick * 0.1) * 5;
        ctx.save(); 
        ctx.translate(0, hover); 
        ctx.rotate(engine.tick * 0.05);
        ctx.fillStyle = `hsl(${item.h}, ${item.s}%, ${item.l}%)`;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        drawPolygon(ctx, item.sides, 8);
        ctx.stroke();

        const anim = e.state.anim || 0;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 20 + anim * 20);
        grad.addColorStop(0, `hsla(${item.h}, ${item.s}%, 70%, 0.8)`); 
        grad.addColorStop(1, `hsla(${item.h}, ${item.s}%, 70%, 0)`);
        ctx.fillStyle = grad; 
        ctx.beginPath(); ctx.arc(0, 0, 20 + anim * 20, 0, Math.PI * 2); ctx.fill(); 
        ctx.restore();
        if (engine.tick % 5 < 3) {
            const corners = [[-35, -35], [35, -35], [35, 35], [-35, 35]];
            const corner = corners[Math.floor((engine.tick / 5) % 4)];
            drawArcLightning(ctx, corner[0], corner[1], 0, hover, engine.tick);
        }
    }
    ctx.restore();
    drawMachineIndicator(ctx, w, h, e.dir);
}

export function drawSlotMachine(ctx, engine, e) {
    const w = e.width * TILE_SIZE;
    const h = e.height * TILE_SIZE;
    const anim = e.state.anim || 0;
    ctx.fillStyle = '#111';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.strokeStyle = 'rgba(142, 68, 173, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.arc(0, 0, 10 + i * 8 + Math.sin(engine.tick * 0.05) * 2, 0, Math.PI * 2); ctx.stroke();
    }
    if (e.state.phase === 'sacrificing' && e.state.sacrificingItem) {
        const spiralRadius = 40 * (1 - anim);
        const spiralAngle = anim * Math.PI * 6;
        ctx.fillStyle = `hsla(${e.state.sacrificingItem.h}, ${e.state.sacrificingItem.s}%, ${e.state.sacrificingItem.l}%, ${1-anim})`;
        ctx.beginPath(); ctx.arc(Math.cos(spiralAngle) * spiralRadius, Math.sin(spiralAngle) * spiralRadius, 6 * (1 - anim), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#8E44AD'; ctx.fillRect(10, 10, w - 20, 45); ctx.strokeStyle = '#FFF'; ctx.strokeRect(10, 10, w - 20, 45);
    ctx.fillStyle = e.state.spinning && engine.tick % 10 < 5 ? '#F1C40F' : '#E74C3C'; ctx.fillRect(14, 14, w - 28, 8);
    ctx.fillStyle = '#000'; ctx.fillRect(14, 24, w - 28, 24);
    ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const symbols = ['★', '🍒', '7', '💎', '🔔'];
    const [r1, r2, r3] = e.state.reels || [0, 0, 0];
    ctx.fillStyle = '#FFF';
    if (e.state.spinning) ctx.fillText('?? ? ??', w / 2, 36);
    else ctx.fillText(`${symbols[r1] || '★'} ${symbols[r2] || '★'} ${symbols[r3] || '★'}`, w / 2, 36);
    ctx.font = '9px sans-serif'; ctx.fillText(`MULT x${(e.state.multiplier || 0.1).toFixed(1)}`, w / 2, h - 12);
}