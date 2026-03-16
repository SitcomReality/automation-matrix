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