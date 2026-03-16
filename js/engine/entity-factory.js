import { MAP_SIZE } from '../constants.js';

export function getInitialEntityState(type) {
    let w = 1, h = 1;
    let config = {};

    switch (type) {
        case 'sand-processor':
            w = 3; h = 3;
            const sandGrid = Array(30).fill(null).map(() => Array(30).fill(0));
            for (let i = 7; i <= 22; i++) sandGrid[15][i] = 2;
            config = { grid: sandGrid, processTimer: 0 };
            break;
        case 'slot-machine':
            w = 3; h = 3;
            config = { reels: [0, 0, 0], spinning: false, spinTime: 0 };
            break;
        case 'splitter':
            config = { cycle: 0 };
            break;
        case 'stitcher':
            w = 3; h = 3;
            config = { buffer: [], processTimer: 0 };
            break;
        case 'blender':
            w = 3; h = 3;
            const blendGrid = Array(20).fill(null).map(() => Array(20).fill(0));
            config = { itemTypes: [], itemCounts: [0, 0], grid: blendGrid, blendTimer: 0, blending: false };
            break;
        case 'hue-rotator':
            w = 3; h = 3;
            config = { processingItem: null, processTimer: 0 };
            break;
        case 'crystallizer':
            w = 3; h = 3;
            config = { processingItem: null, processTimer: 0 };
            break;
    }

    return { w, h, config };
}