import { particleManager } from '../particles.js';

export const drawGear = (ctx, x, y, radius, rotation, teeth = 8) => {
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

export const drawPiston = (ctx, x, y, angle, length, extension, width = 12) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#1F2833';
    ctx.fillRect(-width/2, 0, width, length);
    ctx.strokeStyle = '#45A29E';
    ctx.lineWidth = 1;
    ctx.strokeRect(-width/2, 0, width, length);
    ctx.fillStyle = '#C5C6C7';
    const rodExt = extension * length * 0.8;
    ctx.fillRect(-width/4, -rodExt, width/2, rodExt + 2);
    ctx.fillStyle = '#66FCF1';
    ctx.fillRect(-width/2 - 2, -rodExt - 4, width + 4, 6);
    ctx.restore();
};

export const drawDrum = (ctx, x, y, radius, rotation, color = '#45A29E') => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.stroke();
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

export const drawChevron = (ctx, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(0, -4);
    ctx.lineTo(6, 4);
    ctx.stroke();
};

export const drawMachineIndicator = (ctx, w, h, dir) => {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(dir * Math.PI / 2);
    const arrowSize = 6;
    const yPos = -h / 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#66FCF1';
    ctx.fillStyle = '#66FCF1';
    ctx.beginPath();
    ctx.moveTo(-arrowSize, yPos + 2);
    ctx.lineTo(arrowSize, yPos + 2);
    ctx.lineTo(0, yPos - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#66FCF1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-arrowSize - 2, yPos);
    ctx.lineTo(arrowSize + 2, yPos);
    ctx.stroke();
    ctx.restore();
};

export const drawSteamVent = (ctx, x, y, active, tick) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#1F2833';
    ctx.fillRect(-4, -2, 8, 4);
    ctx.strokeStyle = '#45A29E';
    ctx.lineWidth = 1;
    ctx.strokeRect(-4, -2, 8, 4);
    if (active && tick % 20 === 0) {
        particleManager.spawn(x, y - 5, 'smoke', 'rgba(200, 200, 200, 0.5)', 1);
    }
    ctx.restore();
};

export const drawArcLightning = (ctx, x1, y1, x2, y2, seed) => {
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