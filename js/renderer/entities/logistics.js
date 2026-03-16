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