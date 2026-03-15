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
        if (!e || (e.type !== 'belt' && e.type !== 'splitter' && e.type !== 'combiner')) continue;

        if (item.outDir === undefined) {
            assignOutput(e, item);
        }

        const { nx, ny } = getBeltOutput(e, item);
        let maxProgress = 1.0;

        const itemsOnSame = engine.items.filter(
            it => it.x === item.x && it.y === item.y && it !== item && it.progress > item.progress
        );
        
        if (itemsOnSame.length > 0) {
            const nextItem = itemsOnSame.reduce((min, it) => (it.progress < min.progress ? it : min));
            maxProgress = nextItem.progress - 0.5;
        } else {
            const destE = engine.getEntityAt(nx, ny);
            if (destE) {
                if (['belt', 'splitter', 'combiner'].includes(destE.type)) {
                    const itemsOnNext = engine.items.filter(it => it.x === nx && it.y === ny);
                    if (itemsOnNext.length > 0) {
                        const lastItem = itemsOnNext.reduce((min, it) => (it.progress < min.progress ? it : min));
                        maxProgress = lastItem.progress + 0.5;
                    } else {
                        maxProgress = 2.0;
                    }
                } else if (destE.type === 'sand-processor' && nx === destE.x + 1 && ny === destE.y) {
                    maxProgress = canAcceptItem(destE, item.type) ? 2.0 : 1.0;
                } else if (destE.type === 'slot-machine' && nx >= destE.x && nx < destE.x + 2 && ny >= destE.y && ny < destE.y + 2) {
                    maxProgress = canAcceptItem(destE, item.type) ? 2.0 : 1.0;
                } else if (destE.type === 'blender' && nx >= destE.x && nx < destE.x + 2 && ny >= destE.y && ny < destE.y + 2) {
                    maxProgress = canAcceptItem(destE, item.type) ? 2.0 : 1.0;
                } else {
                    maxProgress = 1.0;
                }
            } else {
                maxProgress = 1.0;
            }
        }

        if (item.progress + speed <= maxProgress) {
            item.progress += speed;
        } else {
            item.progress = Math.min(item.progress + speed, maxProgress);
        }

        if (maxProgress <= 1.0 && item.progress > maxProgress) {
            item.progress = maxProgress;
        }

        if (item.progress >= 1.0) {
            const destE = engine.getEntityAt(nx, ny);
            if (destE) {
                if (['belt', 'splitter', 'combiner'].includes(destE.type)) {
                    item.x = nx;
                    item.y = ny;
                    item.progress -= 1.0;
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