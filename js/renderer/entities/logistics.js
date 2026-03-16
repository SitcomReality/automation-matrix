import { TILE_SIZE } from '../../constants.js';
import { drawChevron, drawMachineIndicator } from './parts.js';

export function drawBeltLike(ctx, engine, e) {
    ctx.fillStyle = e.type === 'splitter' ? '#B8860B' : '#2C3E50';
    ctx.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.fillStyle = '#1B2631';
    ctx.fillRect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12);

    ctx.save();
    ctx.translate(TILE_SIZE / 2, TILE_SIZE / 2);
    ctx.rotate(e.dir * Math.PI / 2);

    ctx.save();
    ctx.beginPath();
    ctx.rect(-TILE_SIZE / 2 + 2, -TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.clip();

    const offset = (engine.tick % 30) / 30;
    ctx.translate(0, (0.5 - offset) * 12);
    drawChevron(ctx, '#7F8C8D');
    ctx.translate(0, 12);
    drawChevron(ctx, '#7F8C8D');
    ctx.translate(0, -24);
    drawChevron(ctx, '#7F8C8D');
    ctx.restore();

    if (e.type === 'splitter') {
        ctx.fillStyle = '#F1C40F';
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
}

export function drawMiner(ctx, engine, e) {
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
}

export function drawScrewConveyor(ctx, engine, e) {
    const w = e.width * TILE_SIZE;
    const h = e.height * TILE_SIZE;
    
    // Housing
    ctx.fillStyle = '#1F2833';
    ctx.fillRect(2, 2, w - 4, h - 4);
    ctx.strokeStyle = '#45A29E';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(e.dir * Math.PI / 2);

    // The Screw Thread
    const length = (e.dir === 0 || e.dir === 2) ? h : w;
    const threadColor = '#66FCF1';
    const tubeWidth = 14;
    
    // Central shaft
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(-tubeWidth/2, -length/2 + 4, tubeWidth, length - 8);
    
    // Spiral thread animation
    ctx.strokeStyle = threadColor;
    ctx.lineWidth = 2;
    const spiralStep = 12;
    const offset = (engine.tick * 0.2) % spiralStep;
    
    ctx.beginPath();
    for (let y = -length/2 + 4 - spiralStep; y < length/2 - 4 + spiralStep; y += 1) {
        const localY = y + offset;
        if (localY < -length/2 + 4 || localY > length/2 - 4) continue;
        
        const phase = (localY / spiralStep) * Math.PI * 2;
        const x = Math.sin(phase) * (tubeWidth/2);
        
        if (y === -length/2 + 4 - spiralStep) ctx.moveTo(x, localY);
        else ctx.lineTo(x, localY);
    }
    ctx.stroke();

    ctx.restore();
    drawMachineIndicator(ctx, w, h, e.dir);
}