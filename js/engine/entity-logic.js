import { processMiner } from './entities/miner.js';
import { processBlender, canBlenderAccept } from './entities/blender.js';
import { processSlotMachine, canSlotMachineAccept } from './entities/slot-machine.js';
import { processStitcher, canStitcherAccept } from './entities/stitcher.js';
import { processSandProcessor, canSandProcessorAccept } from './entities/sand-processor.js';
import { processHueRotator, canHueRotatorAccept } from './entities/hue-rotator.js';
import { processCrystallizer, canCrystallizerAccept } from './entities/crystallizer.js';

export function canAcceptItem(e, item) {
    if (!e || !e.state) return false;
    
    switch (e.type) {
        case 'sand-processor': return canSandProcessorAccept(e, item);
        case 'blender':        return canBlenderAccept(e, item);
        case 'slot-machine':   return canSlotMachineAccept(e, item);
        case 'stitcher':       return canStitcherAccept(e, item);
        case 'hue-rotator':    return canHueRotatorAccept(e, item);
        case 'crystallizer':   return canCrystallizerAccept(e, item);
        default: return false;
    }
}

export function processEntity(engine, e) {
    switch (e.type) {
        case 'miner':          processMiner(engine, e); break;
        case 'blender':        processBlender(engine, e); break;
        case 'slot-machine':   processSlotMachine(engine, e); break;
        case 'stitcher':       processStitcher(engine, e); break;
        case 'sand-processor': processSandProcessor(engine, e); break;
        case 'hue-rotator':    processHueRotator(engine, e); break;
        case 'crystallizer':   processCrystallizer(engine, e); break;
    }
}