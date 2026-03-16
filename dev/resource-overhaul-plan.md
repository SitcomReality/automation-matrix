# Implementation Plan: Resource & Economy Overhaul (V1)

## Context: The Supernal Interregnum
The mortal world is littered with the fragments of dead gods. These vestiges—Bloodrock, Tearshard, and Snotstone—are dull and powerless in their raw state. Through the logistics of the Automation Matrix, we will combine, refine, and distill these remnants into mystical substances of pure color and complex geometry.

## Core Concepts

### 1. HSL-Based Resource System
Instead of fixed strings like "red" or "cyan", every resource unit (Item) will now carry explicit HSL properties:
- **Hue (H):** 0-360°
- **Saturation (S):** 0-100%
- **Lightness (L):** 0-100%

### 2. Geometric Tiers (The Shape of Power)
Progression is gated by the complexity of the resource's physical form:
- **Tier 1 (Triangle):** 3 sides. Raw remnants.
- **Tier 2 (Square):** 4 sides. Formed by merging 2 Triangles.
- **Tier 3 (Hexagon):** 6 sides. Formed by merging 3 Triangles.
- **Tier 4 (Octagon):** 8 sides. Formed by merging 4 Squares. (Metallic/Iridescent).
- **Tier 5 (Circle):** High-poly approximation. (Glowing/Neon).
- **Tier 6 (Star):** Prismatic/Shimmering. The pinnacle of refinement.

---

## Technical Implementation Steps

### Phase 1: Resource Definitions & Terrain
- Update `js/constants.js` to define the base HSL values for the three primary remnants.
- Modify `js/engine/terrain.js` to spawn these three types instead of "ore" and "juice".
- Update `js/renderer/terrain-renderer.js` to visually represent these nodes using their HSL values.

### Phase 2: Item Object Refactor
- Modify the `Item` structure in `js/engine/item-logic.js` and `js/engine/entity-logic.js`:
<xml>
{
    id: string,
    sides: number, // 3 = Triangle, etc.
    h: number,
    s: number,
    l: number,
    progress: number,
    // ... logistics properties
}
</xml>

### Phase 3: Dynamic Rendering
- Overhaul `js/renderer/item-renderer.js` to remove type-specific drawing code.
- Implement a `drawPolygon(ctx, x, y, sides, radius, color)` function.
- Add special rendering passes for high-tier items (glow for Circles, gradients/rotations for Stars).

### Phase 4: Refined Blending Logic
- Implement the "Shortest Angular Distance" hue blending algorithm in `js/engine/entity-logic.js`.
- If Hue A and Hue B are > 120° apart, the blender must wrap around the 360/0 degree boundary to find the most vibrant path.

### Phase 5: New Machine Framework
- **The Polisher:** Simple sat/light boost.
- **The Stitcher:** Combines sides (Triangle + Triangle = Square).
- **The Hue Rotator:** Shifts hue values.
- **Spectrum Crystallizer:** A high-end machine that outputs Tier-jumped resources with 100% saturation.

---

## Technical Math: Hue Blending
To avoid 'muddy' browns and grays when blending disparate hues:
<xml>
function blendHue(h1, h2) {
    let diff = Math.abs(h1 - h2);
    if (diff <= 180) {
        return (h1 + h2) / 2;
    } else {
        return ((h1 + h2 + 360) / 2) % 360;
    }
}
</xml>