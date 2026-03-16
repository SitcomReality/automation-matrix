import { TILE_SIZE } from '../../constants.js';
import { audioManager } from '../../audio.js';

import { getMachineOutputCell } from './utils.js';

export function canSlotMachineAccept(e, item, tx, ty) {
    const { ox, oy } = getMachineOutputCell(e);
    if (tx === ox && ty === oy) return false;
    return !e.state.spinning && e.state.phase !== 'sacrificing';
}

export function processSlotMachine(engine, e) {
    if (!e.state) return;
    if (!e.state.phase) e.state.phase = 'idle';

    if (e.state.phase === 'idle') {
        for (let i = engine.items.length - 1; i >= 0; i--) {
            const item = engine.items[i];
            if (item.x >= e.x && item.x < e.x + e.width && item.y >= e.y && item.y < e.y + e.height) {
                if (canSlotMachineAccept(e, item, item.x, item.y)) {
                    e.state.sacrificingItem = {...item};
                    e.state.phase = 'sacrificing';
                    e.state.processTimer = 45; // Sacrifice time
                    engine.items.splice(i, 1);
                    break;
                }
            }
        }
    }

    if (e.state.phase === 'sacrificing') {
        e.state.processTimer--;
        e.state.anim = 1 - (e.state.processTimer / 45);
        if (e.state.processTimer <= 0) {
            const item = e.state.sacrificingItem;
            let mult = (item.sides - 2) * (item.s / 50) * (item.l / 40);
            e.state.spinning = true; 
            e.state.spinTime = 60; 
            e.state.multiplier = mult;
            e.state.phase = 'spinning';
            e.state.sacrificingItem = null;
        }
    }

    if (e.state.phase === 'spinning') {
        e.state.spinTime--;
        e.state.anim = 1 - (e.state.spinTime / 60);
        if (engine.tick % 4 === 0) {
            e.state.reels = e.state.reels.map(() => Math.floor(Math.random() * 5));
        }
        if (e.state.spinTime <= 0) {
            e.state.spinning = false;
            e.state.phase = 'idle';
            const [r1, r2, r3] = e.state.reels;
            let payout = 5;
            if (r1 === r2 && r2 === r3) payout = 100;
            else if (r1 === r2 || r2 === r3 || r1 === r3) payout = 20;
            const final = payout * (e.state.multiplier || 0.1);
            engine.state.addCurrency(final);
            audioManager.play('money', 0.5);
            engine.triggerShake(final > 50 ? 10 : 3);
            engine.notifications.push({ text: `+$${Math.floor(final)}`, x: (e.x + 1) * TILE_SIZE, y: e.y * TILE_SIZE, life: 60 });
        }
    }
}