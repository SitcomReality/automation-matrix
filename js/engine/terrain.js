import { MAP_SIZE } from '../constants.js';

export function generateTerrain() {
    const terrain = Array(MAP_SIZE).fill(0).map(() => Array(MAP_SIZE).fill(0));
    const seedX = Math.random() * 1000;
    const seedY = Math.random() * 1000;
    
    const getNoise = (x, y, scale) => {
        return (Math.sin(x * scale + seedX) + Math.cos(y * scale + seedY)) * 0.5;
    };

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            let val = getNoise(x, y, 0.12) * 0.7 + getNoise(x, y, 0.4) * 0.3;
            terrain[y][x] = Math.max(0, Math.min(1, (val + 1) / 2));
        }
    }
    return terrain;
}

export function generateMap(terrain) {
    const tiles = Array(MAP_SIZE).fill(null).map(() => Array(MAP_SIZE).fill(null));
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const val = terrain[y][x];
            if (val > 0.75) {
                if (Math.random() > 0.85) {
                    tiles[y][x] = val > 0.82 ? 'juice' : 'ore';
                }
            }
        }
    }
    return tiles;
}