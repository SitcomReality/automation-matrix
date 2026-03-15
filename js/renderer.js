import { TILE_SIZE, MAP_SIZE } from './constants.js';

export class Renderer {
    constructor(canvas, engine, state) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.engine = engine;
        this.state = state;
        this.cam = { x: 0, y: 0, zoom: 1 };
    }

    render() {
        const { ctx, canvas, engine, cam } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        // Center map (ported from original render)
        ctx.translate(canvas.width / 2 + cam.x, canvas.height / 2 + cam.y);
        ctx.scale(cam.zoom, cam.zoom);
        ctx.translate(-MAP_SIZE * TILE_SIZE / 2, -MAP_SIZE * TILE_SIZE / 2);

        // Draw terrain background gradient
        if (engine.terrain) {
            for (let y = 0; y < MAP_SIZE; y++) {
                for (let x = 0; x < MAP_SIZE; x++) {
                    const val = engine.terrain[y][x];
                    // Quantized grid coloring based on noise
                    const intensity = Math.floor(val * 24);
                    // Shift base color toward accent colors in high-noise areas
                    ctx.fillStyle = `rgb(${11 + intensity}, ${12 + Math.floor(intensity * 1.5)}, ${16 + Math.floor(intensity * 2)})`;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        // Draw Map Resources
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

        // Draw Entities
        for (let e of engine.entities) {
            this.drawEntity(ctx, e);
        }

        // Draw Items
        for (let item of engine.items) {
            this.drawItem(ctx, item);
        }

        // Draw Notifications
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        for (let notif of engine.notifications) {
            ctx.fillStyle = `rgba(102, 252, 241, ${notif.life / 60})`;
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 4;
            ctx.fillText(notif.text, notif.x, notif.y);
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    drawEntity(ctx, e) {
        const engine = this.engine;

        ctx.save();
        ctx.translate(e.x * TILE_SIZE, e.y * TILE_SIZE);

        // Selection outline
        if (e.id === this.state.selectedEntityId) {
            ctx.strokeStyle = '#66FCF1';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, e.width * TILE_SIZE, e.height * TILE_SIZE);
        }

        // Helper for chevrons
        const drawChevron = (ctx, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-6, 4);
            ctx.lineTo(0, -4);
            ctx.lineTo(6, 4);
            ctx.stroke();
        };

        if (e.type === 'belt' || e.type === 'splitter' || e.type === 'combiner') {
            // Base plate
            ctx.fillStyle =
                e.type === 'splitter' ? '#B8860B' : e.type === 'combiner' ? '#6C3483' : '#2C3E50';
            ctx.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);

            // Inner mechanical details
            ctx.fillStyle = '#1B2631';
            ctx.fillRect(6, 6, TILE_SIZE - 12, TILE_SIZE - 12);

            // Belt arrows
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
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
            } else if (e.type === 'combiner') {
                ctx.fillStyle = '#9B59B6';
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
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
            ctx.moveTo(0, -8);
            ctx.lineTo(8, 8);
            ctx.lineTo(-8, 8);
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
            ctx.moveTo(w / 2 - 20, 10);
            ctx.lineTo(w / 2 + 20, 10);
            ctx.lineTo(w / 2 + 10, 20);
            ctx.lineTo(w / 2 - 10, 20);
            ctx.fill();

            ctx.fillStyle = '#0B0C10';
            ctx.fillRect(16, 25, w - 32, h - 50);

            const gridW = w - 32;
            const gridH = h - 50;
            const cellW = gridW / 30;
            const cellH = gridH / 30;

            for (let sy = 0; sy < 30; sy++) {
                for (let sx = 0; sx < 30; sx++) {
                    const val = e.state.grid[sy][sx];
                    if (val === 1) {
                        ctx.fillStyle =
                            e.state.currentProcessingType === 'juice'
                                ? '#E94560'
                                : e.state.currentProcessingType === 'ore'
                                ? '#66FCF1'
                                : '#E67E22';
                        ctx.fillRect(16 + sx * cellW, 25 + sy * cellH, cellW, cellH);
                    } else if (val === 2) {
                        ctx.fillStyle = '#BDC3C7';
                        ctx.fillRect(16 + sx * cellW, 25 + sy * cellH, cellW, cellH);
                    }
                }
            }

            ctx.fillStyle = '#34495E';
            ctx.beginPath();
            ctx.moveTo(w / 2 - 15, h - 25);
            ctx.lineTo(w / 2 + 15, h - 25);
            ctx.lineTo(w / 2 + 8, h - 10);
            ctx.lineTo(w / 2 - 8, h - 10);
            ctx.fill();
        } else if (e.type === 'blender') {
            const w = e.width * TILE_SIZE;
            const h = e.height * TILE_SIZE;

            ctx.fillStyle = '#5D6D7E';
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle =
                e.state.items.length === 2
                    ? '#F5D04C'
                    : e.state.items.length === 1
                    ? '#9B59B6'
                    : '#2C3E50';
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, w / 2 - 12, 0, Math.PI * 2);
            ctx.fill();

            if (e.state.items.length > 0) {
                ctx.save();
                ctx.translate(w / 2, h / 2);
                ctx.rotate(engine.tick * 0.1);
                ctx.fillStyle = '#2C3E50';
                ctx.fillRect(-w / 2 + 16, -2, w - 32, 4);
                ctx.fillRect(-2, -w / 2 + 16, 4, w - 32);
                ctx.restore();
            }

            ctx.fillStyle = '#7F8C8D';
            ctx.fillRect(w - 6, h / 2 - 8, 6, 16);
        } else if (e.type === 'slot-machine') {
            const w = e.width * TILE_SIZE;
            const h = e.height * TILE_SIZE;

            ctx.fillStyle = '#8E44AD';
            ctx.fillRect(4, 4, w - 8, h - 8);

            ctx.fillStyle = e.state.spinning && engine.tick % 10 < 5 ? '#F1C40F' : '#E74C3C';
            ctx.fillRect(8, 8, w - 16, 12);

            ctx.fillStyle = '#111';
            ctx.fillRect(12, 24, w - 24, 24);

            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const symbols = ['★', '🍒', '7', '💎', '🔔'];

            ctx.fillStyle = '#FFF';
            const [r1, r2, r3] = e.state.reels || [0, 0, 0];
            if (e.state.spinning) {
                ctx.fillText('?? ? ??', w / 2, 36);
            } else {
                ctx.fillText(
                    `${symbols[r1] || '★'} ${symbols[r2] || '★'} ${symbols[r3] || '★'}`,
                    w / 2,
                    36
                );
            }

            ctx.fillStyle = '#FFF';
            ctx.font = '10px sans-serif';
            ctx.fillText(`x${e.state.multiplier || 0.1}`, w / 2, h - 10);
        } else {
            // Generic fallback body
            ctx.fillStyle = '#1A252F';
            ctx.fillRect(2, 2, e.width * TILE_SIZE - 4, e.height * TILE_SIZE - 4);
        }

        ctx.restore();
    }

    drawItem(ctx, item) {
        const engine = this.engine;

        let dx = item.x * TILE_SIZE + TILE_SIZE / 2;
        let dy = item.y * TILE_SIZE + TILE_SIZE / 2;
        let scaleX = 1,
            scaleY = 1;

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
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(8, 0);
            ctx.lineTo(0, 8);
            ctx.lineTo(-8, 0);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0B0C10';
            ctx.stroke();
        } else if (item.type === 'juice') {
            ctx.fillStyle = '#E94560';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0B0C10';
            ctx.stroke();
        } else if (item.type === 'refined-ore') {
            ctx.fillStyle = '#66FCF1';
            ctx.shadowColor = '#66FCF1';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 10);
            ctx.lineTo(-10, 0);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0B0C10';
            ctx.stroke();
        } else if (item.type === 'refined-juice') {
            ctx.fillStyle = '#FF4D6D';
            ctx.shadowColor = '#FF4D6D';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0B0C10';
            ctx.stroke();
        } else if (item.type === 'blend') {
            ctx.fillStyle = '#F5D04C';
            ctx.shadowColor = '#F5D04C';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(
                    Math.cos(((18 + i * 72) / 180) * Math.PI) * 10,
                    -Math.sin(((18 + i * 72) / 180) * Math.PI) * 10
                );
                ctx.lineTo(
                    Math.cos(((54 + i * 72) / 180) * Math.PI) * 4,
                    -Math.sin(((54 + i * 72) / 180) * Math.PI) * 4
                );
            }
            ctx.closePath();
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#0B0C10';
            ctx.stroke();
        } else if (item.type === 'particle') {
            ctx.fillStyle = '#E67E22';
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#0B0C10';
            ctx.stroke();
        } else {
            // fallback
            ctx.fillStyle = '#F1C40F';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}