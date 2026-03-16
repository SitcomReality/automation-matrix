export class ParticleManager {
    constructor() {
        this.particles = [];
    }

    spawn(x, y, type = 'smoke', color = '#FFF', count = 1) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (type === 'smoke' ? 1 : 0),
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                type,
                color,
                size: 2 + Math.random() * 4
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.type === 'spark') {
                p.vy += 0.1; // gravity
            } else if (p.type === 'smoke') {
                p.vx *= 0.98;
                p.vy *= 0.98;
                p.vy -= 0.05; // buoyancy
            }

            p.life -= p.decay;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            
            if (p.type === 'smoke') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (2 - p.life), 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'spark') {
                ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
            } else {
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            }
        }
        ctx.restore();
    }
}

export const particleManager = new ParticleManager();