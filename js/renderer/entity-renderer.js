import { TILE_SIZE } from '../constants.js';
import { particleManager } from './particles.js';

// removed function drawGear() {}
// removed function drawPiston() {}
// removed function drawDrum() {}
// removed function drawChevron() {}
// removed function drawMachineIndicator() {}
// removed function drawSteamVent() {}
// removed function drawArcLightning() {}

import { drawBeltLike, drawMiner, drawScrewConveyor } from './entities/logistics.js';
import { 
    drawSandProcessor, drawBlender, drawStitcher, 
    drawHueRotator, drawCrystallizer, drawSlotMachine 
} from './entities/production.js';

export function drawEntity(ctx, engine, state, e) {
    if (!e) return;
    ctx.save();
    ctx.translate(e.x * TILE_SIZE, e.y * TILE_SIZE);

    if (e.id === state.selectedEntityId) {
        ctx.strokeStyle = '#66FCF1';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, e.width * TILE_SIZE, e.height * TILE_SIZE);
    }

    switch (e.type) {
        case 'belt':
        case 'splitter':       drawBeltLike(ctx, engine, e); break;
        case 'screw-conveyor': drawScrewConveyor(ctx, engine, e); break;
        case 'miner':          drawMiner(ctx, engine, e); break;
        case 'sand-processor': drawSandProcessor(ctx, engine, e); break;
        case 'blender':        drawBlender(ctx, engine, e); break;
        case 'stitcher':       drawStitcher(ctx, engine, e); break;
        case 'hue-rotator':    drawHueRotator(ctx, engine, e); break;
        case 'crystallizer':   drawCrystallizer(ctx, engine, e); break;
        case 'slot-machine':   drawSlotMachine(ctx, engine, e); break;
        default:
            ctx.fillStyle = '#1A252F';
            ctx.fillRect(2, 2, e.width * TILE_SIZE - 4, e.height * TILE_SIZE - 4);
    }

    ctx.restore();
}