import { TILE_SIZE, MAP_SIZE } from './constants.js';
import { drawTerrain, drawResources } from './renderer/terrain-renderer.js';
import { drawEntity } from './renderer/entity-renderer.js';
import { drawItem } from './renderer/item-renderer.js';
import { particleManager } from './renderer/particles.js';

export class Renderer {
    constructor(canvas, engine, state) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.engine = engine;
        this.state = state;
        this.cam = { x: 0, y: 0, zoom: 1 };
        this.shake = 0;
    }

    render() {
        const { ctx, canvas, engine, state, cam } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Handle Shakes from Engine
        if (engine.shakeRequest > 0) {
            this.shake = Math.max(this.shake, engine.shakeRequest);
            engine.shakeRequest = 0;
        }

        ctx.save();

        // View Transform
        ctx.translate(canvas.width / 2 + cam.x, canvas.height / 2 + cam.y);
        
        // Screen Shake Apply
        if (this.shake > 0.1) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
            this.shake *= 0.9;
        } else {
            this.shake = 0;
        }

        ctx.scale(cam.zoom, cam.zoom);
        ctx.translate(-MAP_SIZE * TILE_SIZE / 2, -MAP_SIZE * TILE_SIZE / 2);

        // Layer 1: Environment
        drawTerrain(ctx, engine);
        drawResources(ctx, engine);

        // Layer 2: Buildings
        for (let e of engine.entities) {
            drawEntity(ctx, engine, state, e);
        }

        // Layer 3: Logistics
        for (let item of engine.items) {
            drawItem(ctx, engine, item);
        }

        // Layer 4: Particles
        particleManager.update();
        particleManager.draw(ctx);

        // Layer 5: Overlays
        this.drawNotifications(ctx, engine);

        ctx.restore();
    }

    drawNotifications(ctx, engine) {
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        for (let notif of engine.notifications) {
            ctx.fillStyle = `rgba(102, 252, 241, ${notif.life / 60})`;
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 4;
            ctx.fillText(notif.text, notif.x, notif.y);
            ctx.shadowBlur = 0;
        }
    }
}