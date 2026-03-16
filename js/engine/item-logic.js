import { TILE_SIZE } from '../constants.js';
import { canAcceptItem } from './entity-logic.js';

export function getBeltOutput(e, item) {
    let d = (item && item.outDir !== undefined) ? item.outDir : e.dir;
    return {
        nx: e.x + (d === 1 ? 1 : d === 3 ? -1 : 0),
        ny: e.y + (d === 2 ? 1 : d === 0 ? -1 : 0)
    };
}

export function assignOutput(e, item) {
    if (e.type === 'splitter') {
        if (e.state.cycle === 0) item.outDir = e.dir;
        else if (e.state.cycle === 1) item.outDir = (e.dir + 1) % 4;
        else if (e.state.cycle === 2) item.outDir = (e.dir + 3) % 4;
        e.state.cycle = (e.state.cycle + 1) % 3;
    } else {
        item.outDir = e.dir;
    }
}

export function updateItemMovement(engine) {
    const speed = 0.05;
    for (let i = 0; i < engine.items.length; i++) {
        let item = engine.items[i];
        const e = engine.getEntityAt(item.x, item.y);
        
        // If not on a transport building, skip movement logic
        if (!e || !['belt', 'splitter', 'combiner'].includes(e.type)) continue;

        // Ensure outDir and inDir are set
        if (item.outDir === undefined) assignOutput(e, item);
        if (item.inDir === undefined) item.inDir = item.outDir;

        const { nx, ny } = getBeltOutput(e, item);
        // Default to center of current cell if blocked
        let maxProgress = 0.5;

        // Check for items ahead in the same cell (unlikely with 1-item-per-cell, but for robustness)
        const itemsAheadInSame = engine.items.filter(
            it => it.x === item.x && it.y === item.y && it !== item && it.progress > item.progress
        );
        
        if (itemsAheadInSame.length > 0) {
            const nextItem = itemsAheadInSame.reduce((min, it) => (it.progress < min.progress ? it : min));
            maxProgress = nextItem.progress - 1.0; 
        } else {
            // Check for items in the destination cell
            const destE = engine.getEntityAt(nx, ny);
            if (destE) {
                if (['belt', 'splitter', 'combiner'].includes(destE.type)) {
                    const itemsInNext = engine.items.filter(it => it.x === nx && it.y === ny);
                    if (itemsInNext.length > 0) {
                        const tailItem = engine.items.filter(it => it.x === nx && it.y === ny)
                            .reduce((min, it) => (it.progress < min.progress ? it : min));
                        // If tail of next is at 0.5, we can reach 0.5 in current (1.0 distance)
                        maxProgress = tailItem.progress; 
                    } else {
                        // Room to move into next cell center
                        maxProgress = 1.5; 
                    }
                } else if (['sand-processor', 'slot-machine', 'blender'].includes(destE.type)) {
                    let isInputPoint = false;
                    if (destE.type === 'sand-processor') isInputPoint = (nx === destE.x + 1 && ny === destE.y);
                    else isInputPoint = (nx >= destE.x && nx < destE.x + destE.width && ny >= destE.y && ny < destE.y + destE.height);
                    
                    if (isInputPoint) {
                        // Allow moving toward center of machine cell if it can accept
                        maxProgress = canAcceptItem(destE, item.type) ? 1.5 : 0.5;
                    } else {
                        maxProgress = 0.5;
                    }
                } else {
                    maxProgress = 0.5; // Blocked by non-transport building
                }
            } else {
                maxProgress = 0.5; // Blocked by empty space
            }
        }

        // Clamp movement
        if (item.progress < maxProgress) {
            item.progress = Math.min(item.progress + speed, maxProgress);
        }

        // Transition to next cell
        if (item.progress >= 1.0) {
            const destE = engine.getEntityAt(nx, ny);
            if (destE) {
                if (['belt', 'splitter', 'combiner'].includes(destE.type)) {
                    const oldOutDir = item.outDir;
                    item.x = nx;
                    item.y = ny;
                    item.progress -= 1.0;
                    item.inDir = oldOutDir;
                    assignOutput(destE, item);
                } else if (['sand-processor', 'slot-machine', 'blender'].includes(destE.type)) {
                    if (canAcceptItem(destE, item.type)) {
                        item.x = nx;
                        item.y = ny;
                        item.progress = 0;
                    }
                }
            }
        }
    }
}