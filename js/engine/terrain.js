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

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function generateMap(terrain) {
    const tiles = Array(MAP_SIZE).fill(null).map(() => Array(MAP_SIZE).fill(null));
    const placedNodes = [];

    // Define exactly what we need
    const required = [
        'bloodrock', 'bloodrock', 'bloodrock',
        'tearshard', 'tearshard', 'tearshard',
        'snotstone', 'snotstone', 'snotstone'
    ];

    // Shuffle required types so the priority isn't always the same
    for (let i = required.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [required[i], required[j]] = [required[j], required[i]];
    }

    // Identify candidate spots based on terrain noise
    const candidates = [];
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            // Lowered threshold slightly to ensure we have enough room to satisfy 
            // the sparse placement constraints for exactly 9 nodes.
            if (terrain[y][x] > 0.65) {
                candidates.push({ x, y });
            }
        }
    }

    // Shuffle candidates to avoid directional bias
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // For each required resource, find the first candidate that fits distance constraints
    for (const type of required) {
        for (let i = 0; i < candidates.length; i++) {
            const cand = candidates[i];
            let canPlace = true;

            for (const node of placedNodes) {
                const dist = getDistance(cand.x, cand.y, node.x, node.y);
                
                // Min 5 cells between any node
                if (dist < 5) {
                    canPlace = false;
                    break;
                }
                
                // Min 10 cells between nodes of the same type
                if (type === node.type && dist < 10) {
                    canPlace = false;
                    break;
                }
            }

            if (canPlace) {
                tiles[cand.y][cand.x] = type;
                placedNodes.push({ x: cand.x, y: cand.y, type });
                // Remove candidate so it's not reused
                candidates.splice(i, 1);
                break; // Move to the next required resource
            }
        }
    }

    return tiles;
}