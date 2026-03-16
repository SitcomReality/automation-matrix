import { TILE_SIZE } from '../constants.js';

const drawGear = (ctx, x, y, radius, rotation, teeth = 8) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = '#45A29E';
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
        const angle = (i * Math.PI) / teeth;
        const r = i % 2 === 0 ? radius : radius * 0.7;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1F2833';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

const drawPiston = (ctx, x, y, angle, length, extension, width = 12) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Housing
    ctx.fillStyle = '#1F2833';
    ctx.fillRect(-width/2, 0, width, length);
    ctx.strokeStyle = '#45A29E';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width/2, 0, width, length);

    // Rod
    ctx.fillStyle = '#C5C6C7';
    const rodExt = extension * length * 0.8;
    ctx.fillRect(-width/4, -rodExt, width/2, rodExt + 2);
    
    // Head
    ctx.fillStyle = '#66FCF1';
    ctx.fillRect(-width/2 - 2, -rodExt - 4, width + 4, 6);
    
    ctx.restore();
};

const drawDrum = (ctx, x, y, radius, rotation, color = '#45A29E') => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    // Outer shell
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner spokes
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
};

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

const drawArcLightning = (ctx, x1, y1, x2, y2, seed) => {
    ctx.save();
    ctx.strokeStyle = '#66FCF1';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#66FCF1';
    
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const segments = 5;
    const jag = dist / 6;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    // Pseudo-random based on seed and engine tick to prevent flickering every frame
    const rand = (i) => Math.sin(seed * 543.21 + i * 123.45) * jag;

    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const lx = x1 + (x2 - x1) * t + rand(i);
        const ly = y1 + (y2 - y1) * t + rand(i + 0.5);
        ctx.lineTo(lx, ly);
    }
    
    ctx.lineTo(x2, y2);
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
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#0B0C10';
        ctx.fillRect(2, 2, w - 4, h - 4);
        
        // Machine chassis
        ctx.strokeStyle = '#1F2833';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        const anim = e.state.anim || 0;
        const rotation = (e.state.phase === 'processing' ? engine.tick * 0.1 : engine.tick * 0.01);
        
        // Draw the Tumbler Drum
        drawDrum(ctx, w/2, h/2, 30, rotation, e.state.phase === 'processing' ? '#66FCF1' : '#45A29E');
        
        // Grit particles inside drum
        if (e.state.phase === 'processing') {
            ctx.fillStyle = '#C5C6C7';
            for(let i=0; i<8; i++) {
                const angle = rotation + (i * Math.PI * 2 / 8) + Math.sin(engine.tick * 0.1 + i) * 0.2;
                const r = 15 + Math.cos(engine.tick * 0.05 + i) * 10;
                ctx.beginPath();
                ctx.arc(w/2 + Math.cos(angle) * r, h/2 + Math.sin(angle) * r, 2, 0, Math.PI * 2);
                ctx.fill();
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
        ctx.fillStyle = '#0B0C10';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Central Bed
        ctx.fillStyle = '#1F2833';
        ctx.fillRect(w/2 - 20, h/2 - 20, 40, 40);
        ctx.strokeStyle = '#45A29E';
        ctx.strokeRect(w/2 - 20, h/2 - 20, 40, 40);

        const anim = e.state.anim || 0;
        // Piston extension logic: squeeze in middle of animation
        const extension = e.state.phase === 'pressing' ? Math.sin(anim * Math.PI) : 0;

        // Draw four pressing pistons
        drawPiston(ctx, 15, h/2, Math.PI/2, 25, extension);
        drawPiston(ctx, w - 15, h/2, -Math.PI/2, 25, extension);
        drawPiston(ctx, w/2, 15, Math.PI, 25, extension);
        drawPiston(ctx, w/2, h - 15, 0, 25, extension);

        // Sparks during peak compression
        if (e.state.phase === 'pressing' && anim > 0.4 && anim < 0.6) {
            ctx.fillStyle = '#FFF';
            for(let i=0; i<5; i++) {
                const rx = (Math.random() - 0.5) * 20;
                const ry = (Math.random() - 0.5) * 20;
                ctx.beginPath();
                ctx.arc(w/2 + rx, h/2 + ry, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        drawMachineIndicator(ctx, w, h, e.dir);
    } else if (e.type === 'hue-rotator') {
        const w = e.width * TILE_SIZE;
        const h = e.height * TILE_SIZE;
        ctx.fillStyle = '#0B0C10';
        ctx.fillRect(2, 2, w - 4, h - 4);
        
        // Chassis rails
        ctx.strokeStyle = '#1F2833';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        ctx.save();
        ctx.translate(w / 2, h / 2);
        
        const anim = e.state.anim || 0;
        
        // Rotating lenses
        drawDrum(ctx, 0, 0, 25, engine.tick * 0.02, '#45A29E');
        drawDrum(ctx, 0, 0, 15, -engine.tick * 0.05, '#66FCF1');

        // Central prism
        ctx.save();
        ctx.rotate(Math.sin(engine.tick * 0.05) * 0.1);
        ctx.beginPath();
        ctx.moveTo(0, -12); ctx.lineTo(12, 10); ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(102, 252, 241, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#66FCF1';
        ctx.stroke();
        ctx.restore();

        if (e.state.processingItem) {
            // Prismatic beam
            const beamHue = (e.state.processingItem.h + anim * 30) % 360;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineWidth = 4 + Math.sin(engine.tick * 0.2) * 2;
            ctx.strokeStyle = `hsla(${beamHue}, 100%, 70%, 0.6)`;
            ctx.beginPath();
            ctx.moveTo(-w/2 + 10, 0);
            ctx.lineTo(w/2 - 10, 0);
            ctx.stroke();
            
            // Core beam
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            
            // Draw ghost of item in center
            ctx.save();
            ctx.globalAlpha = 0.7;
            const item = e.state.processingItem;
            // Temporary item-like render (simplified)
            ctx.fillStyle = `hsl(${beamHue}, ${item.s}%, ${item.l}%)`;
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
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

        if (e.state.processingItem) {
            const anim = e.state.anim || 0;
            // Levitate item
            const hover = Math.sin(engine.tick * 0.1) * 5;
            ctx.save();
            ctx.translate(0, hover);
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 20 + anim * 20);
            grad.addColorStop(0, 'rgba(102, 252, 241, 0.8)');
            grad.addColorStop(1, 'rgba(102, 252, 241, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, 20 + anim * 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Arc lightning from corners to center
            if (engine.tick % 5 < 3) {
                const corners = [[-35, -35], [35, -35], [35, 35], [-35, 35]];
                const corner = corners[Math.floor((engine.tick / 5) % 4)];
                drawArcLightning(ctx, corner[0], corner[1], 0, hover, engine.tick);
            }
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
        const anim = e.state.anim || 0;
        
        ctx.fillStyle = '#111';
        ctx.fillRect(2, 2, w - 4, h - 4);

        // Funnel spiral background
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.strokeStyle = 'rgba(142, 68, 173, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 10 + i * 8 + Math.sin(engine.tick * 0.05) * 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Sacrificing ghost item
        if (e.state.phase === 'sacrificing' && e.state.sacrificingItem) {
            const spiralRadius = 40 * (1 - anim);
            const spiralAngle = anim * Math.PI * 6;
            const sx = Math.cos(spiralAngle) * spiralRadius;
            const sy = Math.sin(spiralAngle) * spiralRadius;
            
            ctx.fillStyle = `hsla(${e.state.sacrificingItem.h}, ${e.state.sacrificingItem.s}%, ${e.state.sacrificingItem.l}%, ${1-anim})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 6 * (1 - anim), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Machine head / reels
        ctx.fillStyle = '#8E44AD';
        ctx.fillRect(10, 10, w - 20, 45);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, w - 20, 45);

        ctx.fillStyle = e.state.spinning && engine.tick % 10 < 5 ? '#F1C40F' : '#E74C3C';
        ctx.fillRect(14, 14, w - 28, 8);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(14, 24, w - 28, 24);
        
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbols = ['★', '🍒', '7', '💎', '🔔'];
        ctx.fillStyle = '#FFF';
        const [r1, r2, r3] = e.state.reels || [0, 0, 0];
        if (e.state.spinning) {
            ctx.fillText('?? ? ??', w / 2, 36);
        } else {
            ctx.fillText(`${symbols[r1] || '★'} ${symbols[r2] || '★'} ${symbols[r3] || '★'}`, w / 2, 36);
        }
        
        ctx.fillStyle = '#FFF';
        ctx.font = '9px sans-serif';
        ctx.fillText(`MULT x${(e.state.multiplier || 0.1).toFixed(1)}`, w / 2, h - 12);
        
    } else {
        ctx.fillStyle = '#1A252F';
        ctx.fillRect(2, 2, e.width * TILE_SIZE - 4, e.height * TILE_SIZE - 4);
    }

    ctx.restore();
}