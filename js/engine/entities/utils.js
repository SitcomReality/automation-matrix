/**
 * Shortest-path Hue Blending
 * Ensures we blend across the most vibrant arc of the color wheel.
 */
export function blendHue(h1, h2) {
    let a = h1 % 360;
    let b = h2 % 360;
    let diff = b - a;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return (a + diff / 2 + 360) % 360;
}

export function getMachineOutputCell(e) {
    // Standard 3x3 machine output logic
    // South: Bottom Center (x+1, y+2) -> Dest (x+1, y+3)
    // North: Top Center (x+1, y) -> Dest (x+1, y-1)
    // East: Right Center (x+2, y+1) -> Dest (x+3, y+1)
    // West: Left Center (x, y+1) -> Dest (x-1, y+1)
    if (e.dir === 0) return { ox: e.x + 1, oy: e.y, nx: e.x + 1, ny: e.y - 1 };
    if (e.dir === 1) return { ox: e.x + 2, oy: e.y + 1, nx: e.x + 3, ny: e.y + 1 };
    if (e.dir === 2) return { ox: e.x + 1, oy: e.y + 2, nx: e.x + 1, ny: e.y + 3 };
    if (e.dir === 3) return { ox: e.x, oy: e.y + 1, nx: e.x - 1, ny: e.y + 1 };
    return { ox: e.x + 1, oy: e.y + 2, nx: e.x + 1, ny: e.y + 3 };
}