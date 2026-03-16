import { TILE_SIZE } from '../../constants.js';
import { audioManager } from '../../audio.js';

export function canSlotMachineAccept(e, item) {
    return !e.state.spinning;
}

export function processSlotMachine(engine, e) {
    if (!e.state) return;
    for (let i = engine.items.length - 1; i >= 0; i--) {
        const item = engine.items[i];
        if (item.x >= e.x && item.x < e.x + 2 && item.y >= e.y && item.y < e.y + 2) {
            if (canSlotMachineAccept(e, item)) {
                let mult = (item.sides - 2) * (item.s / 50) * (item.l / 40);
                e.state.spinning = true; e.state.spinTime = 60; e.state.multiplier = mult;
                engine.items.splice(i, 1);
            }
        }
    }
    if (e.state.spinning) {
        e.state.spinTime--;
        if (engine.tick % 4 === 0) {
            e.state.reels = e.state.reels.map(() => Math.floor(Math.random() * 5));
        }
        if (e.state.spinTime <= 0) {
            e.state.spinning = false;
            const [r1, r2, r3] = e.state.reels;
            let payout = 5;
            if (r1 === r2 && r2 === r3) payout = 100;
            else if (r1 === r2 || r2 === r3 || r1 === r3) payout = 20;
            const final = payout * (e.state.multiplier || 0.1);
            engine.state.addCurrency(final);
            audioManager.play('money', 0.5);
            engine.notifications.push({ text: `+$${Math.floor(final)}`, x: (e.x + 1) * TILE_SIZE, y: e.y * TILE_SIZE, life: 60 });
        }
    }
}